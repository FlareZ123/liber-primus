'use strict';
// Agent17 #2866: locate the missing first-KOAN affine discovery chronology.
// Deliberately exclude general LP2 key searches and reuse the known source pins.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ref='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const sources=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mod=x=>(x%29+29)%29;
function cribControl(){
 const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
 const ord=s=>[...s].filter(x=>native.runes.includes(x)).map(x=>native.runes.indexOf(x));
 const C=ord(read('resources/transcriptions/lp1_wulfic_canonical.txt').split('$')[3]);
 // Both known KOANs have exactly this five-rune title.
 const crib=ord('ᚪᚳᚩᚪᚾ');
 const maps=[];
 for(let a=1;a<29;a++)for(let b=0;b<29;b++)
  if(crib.every((p,i)=>mod(a*C[i]+b)===p))maps.push([a,b]);
 assert.deepEqual(maps,[[28,2]]);
 const P=C.map(c=>mod(maps[0][0]*c+maps[0][1]));
 assert(P.every((p,i)=>mod(2-p)===C[i]));
 const known=ord(native.sections[3].source_text);
 assert.deepEqual(P.slice(0,104),known.slice(0,104));
 console.log('FIRST-KOAN CRIB CONTROL',JSON.stringify({C:C.slice(0,5),crib,maps,matchedNativePrefix:104,withheldAfterCrib:99,fullReplay:C.length,plainPrefix:P.slice(0,104).map(x=>native.runes[x]).join('')}));
}
async function main(){
 cribControl();
 const success=/a\s*man\s*decided|who\s*are\s*you\s*who\s*wishes|four\s*unreasonable|a\s*man\s*decided\s*to\s*go|the\s*door\s*of\s*the\s*master/i;
 const firstKoan=/\bkoan\b|atbash|at\s+bash|revers(?:ed|e)\s+(?:alphabet|gematria)|(?:shift|offset|rot|caesar)\w*\s*(?:of|by|=|:)?\s*[+-]?3\b|\b(?:3|three)\s*(?:rune|position|shift)/i;
 const chat=/^2014 (Jan|Feb) \d+ \d+:\d+ </;
 for(const [name,size,sha] of sources){
  const response=await fetch('https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name));
  assert.equal(response.status,200);
  const raw=Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length,size);
  assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(raw).digest('hex'),sha);
  const lines=raw.toString('latin1').split(/\r?\n/);
  const hit=[];const candidates=[];
  for(let i=0;i<lines.length;i++)if(chat.test(lines[i])){
   if(success.test(lines[i]))hit.push(i);
   if(firstKoan.test(lines[i]))candidates.push(i);
  }
  console.log('SOURCE',name,'exact narrative hits',hit.length,'candidate mentions',candidates.length);
  for(const i of hit.slice(0,12))console.log('NARRATIVE L'+(i+1),lines[i].slice(0,350));
  if(hit.length){
   const at=hit[0];
   const nearby=candidates.filter(i=>i>=at-1500&&i<=at+300);
   console.log('BEFORE/AROUND FIRST NARRATIVE: candidate mentions',nearby.length);
   for(const i of nearby.slice(-50))console.log('CUE L'+(i+1),lines[i].slice(0,350));
   console.log('FIRST NARRATIVE CONTEXT');
   for(let i=Math.max(0,at-25);i<=Math.min(lines.length-1,at+25);i++)
    if(chat.test(lines[i]))console.log('CTX L'+(i+1),lines[i].slice(0,350));
  }
  else for(const i of candidates.filter(i=>/atbash|shift.{0,15}\b3\b/i.test(lines[i])).slice(0,30))console.log('UNLINKED CUE L'+(i+1),lines[i].slice(0,300));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
