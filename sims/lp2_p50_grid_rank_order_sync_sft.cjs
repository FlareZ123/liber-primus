'use strict';
// Bounded p49-51 numeric-panel -> p52-55 rank-list receiver.
// 59/60 and horizontal reflection are original-source ambiguities; the
// rank-insertion opcode and reuse of a 256-item clock are NOT first-party clues.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const {inverse,forward,native,windows}=require('./lp2_p15_spiral_rank_order_sync_sft.cjs');
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.equal(grid.pages.map(p=>p.rows).reduce((a,b)=>a+b,0),32);
assert.deepEqual(grid.pages.map(p=>p.cols),[8,8,8]);
assert.deepEqual(grid.pages.map(p=>p.page),[49,50,51]);
assert.equal(grid.alphabet.length,60);
const alphabets={59:grid.alphabet.replace('f',''),60:grid.alphabet};
assert.equal(alphabets[59].length,59);
assert(tokens.every(t=>t.length===2&&!t.includes('f')));
function schedule(radix,reflect){
 const alpha=alphabets[radix];assert(alpha,'radix must be 59 or 60');
 const ordered=reflect?Array.from({length:32},(_,i)=>tokens.slice(8*i,8*i+8).reverse()).flat():tokens;
 const values=ordered.map(t=>radix*alpha.indexOf(t[0])+alpha.indexOf(t[1]));
 assert(values.every(v=>v>=0&&v<=255));
 if(radix===60&&!reflect)assert.deepEqual(values,grid.bytes);
 return values.map(x=>x%29);
}
function shuffle(seed){
 let s=seed>>>0;function rnd(){s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;}
 const a=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function main(){
 const source=gp.pages.filter(p=>p.page>=52&&p.page<=55).flatMap(p=>p.indices);
 assert.equal(source.length,750);
 const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%')
  .filter((_,i)=>[3,8,9,10,11,14].includes(i))
  .flatMap(t=>Array.from(t).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c)));
 assert.equal(lp1.length,1001);
 const donors=[
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
 ].map(file=>({file,plain:native(read(file))}));
 const output=[];
 for(const radix of [59,60])for(const reflect of [false,true]){
  const targets=schedule(radix,reflect),d=inverse(source,targets);
  assert(d.sync!==null,'original needs a certified deck before scoring');
  const plants=[];
  for(let j=0;j<2;j++){
   const start=shuffle(3301+j*991+radix*7+(reflect?1:0)),cipher=forward(lp1,targets,start);
   const test=inverse(cipher,targets,{plain:lp1,initial:start});
   assert(test.sync!==null,'planted native receiver did not synchronize');
   for(let i=test.sync;i<lp1.length;i++)assert.equal(test.decoded[i],lp1[i]);
   plants.push({trial:j,sync:test.sync,exactRecovered:test.n});
  }
  output.push({radix,reflect,N:source.length,scheduleLength:targets.length,
   firstTargets:targets.slice(0,16),sync:d.sync,n:d.n,mode:d.mode,top3:d.top3,ic:d.ic,
   preview:d.preview,donors:donors.map(z=>({file:z.file,...windows(z.plain,d)})),plants});
 }
 console.log(JSON.stringify({schema:'lp2-p50-grid-rank-order-v1',
  claim:'bounded source-operand tests, not a selected rank-insertion cipher',
  sourcePages:[49,50,51],receiver:[52,55],output},null,2));
}
if(require.main===module)main();
module.exports={schedule};
