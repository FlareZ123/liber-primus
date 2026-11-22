'use strict';
/**
 * A single frozen H-difference printed-line shell decoder on original LP2.
 * Node 22 CommonJS; no external dependencies, no generated key search.
 * SFT: node sims/lp2_line_hboundary_original_receiver_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const runemap=new Map(source.runes.map((r,i)=>[r,i]));
const originalPages=source.pages.filter(p=>p.page<=55);
const rawPages=transcription.split('%');
const linePages=[];
for(const p of originalPages){
  if(p.page===50){
    assert.equal(p.runic_count,0);
    linePages.push([]);
    continue;
  }
  const ordinal=p.page<50?p.page:p.page-1;
  const transcript=rawPages[ordinal];
  const lines=transcript.split('/').map(segment=>[...segment]
    .filter(ch=>runemap.has(ch)).map(ch=>runemap.get(ch))).filter(line=>line.length);
  assert.deepEqual(lines.flat(),p.indices, 'source image transcript and GP corpus p'+p.page);
  linePages.push(lines);
}
assert.equal(linePages.flat(2).length,12956);

/**
 * Frozen source operation:
 * H(left,right)=(left-right,left+right) mod29.
 * Keep both endpoint ciphertext runes unchanged as a recoverable shell;
 * subtract the first H component from every strict line-interior GP rune.
 * This preserves original rune order, punctuation and word carries.
 * @param {number[]} input
 * @param {number} sign -1 decrypt, +1 encrypt
 * @returns {number[]}
 */
function edgeShift(input,sign){
  const a=input[0],b=input[input.length-1];
  const delta=(a-b+29)%29;
  return input.map((v,i)=>(i===0||i===input.length-1)?v:
    (v+sign*delta+29)%29);
}
const decode=lines=>lines.map(line=>edgeShift(line,-1));
function report(name,lines){
  const original=lines.flat();
  const decoded=decode(lines);
  const clear=decoded.flat();
  assert.equal(original.length,clear.length);
  assert.deepEqual(decoded.map(line=>edgeShift(line,+1)).flat(),original,
    'exact original ciphertext reencryption '+name);
  const tally=Array(29).fill(0);
  for(const v of clear)tally[v]++;
  const ioc=tally.reduce((sum,n)=>sum+n*(n-1),0)/(clear.length*(clear.length-1));
  const top5=tally.sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0);
  const gp=arr=>arr.map(v=>source.translit[v]).join(' ');
  console.log(name,'runes',original.length,'lines',lines.length,
    'IoC',ioc.toFixed(9),'top5',top5,'first48',gp(clear.slice(0,48)));
  return {original,clear,ioc,top5};
}
const training=report('p16-21-original',linePages.slice(16,22).flat());
const holdout=report('p40-45-original',linePages.slice(40,46).flat());
assert(training.original.length>=250);
assert(holdout.original.length>=200);
report('p16-21-first250',(()=>{
  let rest=250,lines=[];
  for(const line of linePages.slice(16,22).flat()){
    if(!rest)break;
    const part=line.slice(0,Math.min(rest,line.length));
    lines.push(part);rest-=part.length;
  }
  assert.equal(rest,0);return lines;
})());
// Independent clean GP native positive: plant known solved p57 rune sequence
// as an interior source, encode with authentic source line-derived shell.
// No language oracle participates in the original decoding.
const solved=source.pages.find(p=>p.page===57).indices;
const plantLines=linePages.slice(16,17).flat().map((line,i)=>{
  const out=[...line];
  for(let j=1;j<line.length-1;j++)out[j]=solved[(i*23+j)%solved.length];
  return out;
});
const cipherPlant=plantLines.map(line=>edgeShift(line,+1));
assert.deepEqual(decode(cipherPlant),plantLines);
console.log('PASS source exact line registration; original re-encryption and native plant');
