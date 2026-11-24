'use strict';
/** Director #2495: two distinct LP1 historical operation decisions, no second-koan key extraction. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const ref='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const sources=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
function originalGate(){
 const root=path.resolve(__dirname,'..');
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const lp2=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
 const alphabet=lp2.runes;
 const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('$');
 const ord=s=>[...s].filter(r=>alphabet.includes(r)).map(r=>alphabet.indexOf(r));
 const c=ord(lp1[1]).slice(0,8), crib=ord('ᚹᛖᛚᚳᚩᛗᛖᚹ');
 const shift=crib.map((v,i)=>(v-c[i]+29)%29);
 assert.deepEqual(shift,[6,19,28,19,20,19,13,3]);
 const partial=[6,null,null,null,null,19,13,3];
 assert(partial.every((v,i)=>v===null||v===shift[i]));
 const starts=[0,729,1874,3603,5506,6761,7960,9640,12648];
 const raw=read('resources/liber-primus/lp2-transcription.txt').split('%');
 let offset=0;
 const chapters=[];
 const pages=lp2.pages.filter(p=>p.runic_count>0);
 for(let i=0;i<pages.length;i++){
  const p=pages[i];
  if(starts.includes(offset)){
   const words=raw[i].replace(/\/\s*/g,'').match(/[\u16a0-\u16ea]+/gu);
   assert.deepEqual(ord(raw[i]),p.indices);
   chapters.push([p.page,words[0].length,words[1].length]);
  }
  offset+=p.runic_count;
 }
 assert.deepEqual(chapters,[[0,8,5],[3,2,11],[8,4,8],[15,4,5],[23,2,6],[28,2,5],[33,2,8],[40,3,5],[54,1,8]]);
 assert(!chapters.some(([,a,b])=>a===7&&b===7||a===1&&b===5));
 console.log('Original source historical crib shifts:',shift,'chapter opening pairs:',chapters);
}
async function main(){
 originalGate();
 for(const [name,size,sha] of sources){
  const response=await fetch('https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name));
  assert.equal(response.status,200);
  const raw=Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length,size);
  assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(raw).digest('hex'),sha);
  const lines=raw.toString('latin1').split(/\r?\n/);
  console.log('SOURCE',name);
  // Print only conversational statements in the discovery windows, not host/IP join records.
  const windows=name==='#cicadasolvers.freenode.log'
    ? [[27900,28200],[28201,28450],[28451,28590],[28860,29065],[29210,29240]]
    : [[56175,56300],[79720,79765],[79915,79955]];
  for(const [start,end] of windows){
    console.log('DISCOVERY WINDOW',start,end);
    for(let i=start-1;i<end;i++){
      const s=lines[i];
      if(!/^2014 \w+ \d+ \d+:\d+ </.test(s))continue;
      if(name==='#cicadasolvers.freenode.log' &&
         !/\b(key|crib|welcome|pilgrim|divinity|cipher|vigen|shift|rune|8|eight|guess|decrypt|decode|plain|period|pattern|sequence|letter|frequenc|repeat|method|word|skip|offset|gematria|reverse|solv|formula)\w*/i.test(s))continue;
      console.log('D L'+(i+1),s.slice(0,500));
    }
  }
 }
}

main().catch(e=>{console.error(e);process.exitCode=1});
