'use strict';
// Agent2, 2026-11-28. PRETARGET source-only q-block decoder.
// This file does not read the signed 2016 source or any candidate plaintext.
//
// Operand construction:
//   1. p6's native red11 word lengths are [4,1,4,2].
//   2. Apply those four lengths to p15's lower red11 runes.
//   3. GP29 product of each segment is [10,5,12,0] = [Kg,g,aK,F].
// Receiver locations/arities were independently selected source-only in #3383.
// The only charged cipher freedom here is global additive sign.
// Each of the four derived scalars is constant over the corresponding q-block
// receiver word; the same four-lane schedule is reused on block1 and block3.

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

const mod=x=>((x%29)+29)%29;
const product=vals=>vals.reduce((a,b)=>mod(a*b),1);

const p15=corpus.pages.find(p=>p.page===15).indices.slice(9,20);
assert.equal(p15.length,11);
const p6Lengths=[4,1,4,2];
let cursor=0;
const tape=p6Lengths.map(L=>{
  const vals=p15.slice(cursor,cursor+L);
  cursor+=L;
  return product(vals);
});
assert.equal(cursor,p15.length);
assert.deepEqual(tape,[10,5,12,0]);

const blocks=[
  {
    name:'block1',
    pages:[32,33,34,35],
    starts:[30,132,4,25],
    arities:[3,4,2,5],
  },
  {
    name:'block3',
    pages:[37,38,39,40],
    starts:[146,57,132,71],
    arities:[4,6,5,4],
  },
];

function pageRunes(page){
  const p=corpus.pages.find(x=>x.page===page);
  assert(p); return p.indices;
}
function decodeReceiver(page,start,len,key,sign){
  const cipher=pageRunes(page).slice(start,start+len);
  assert.equal(cipher.length,len);
  const decoded=cipher.map(c=>mod(c-sign*key));
  const replay=decoded.map(p=>mod(p+sign*key));
  assert.deepEqual(replay,cipher);
  return {page,start,len,key,cipher,decoded,
    translit:decoded.map(x=>corpus.translit[x]).join('')};
}

const candidates=[1,-1].map(sign=>({
  sign,
  tape,
  blocks:blocks.map(block=>({
    name:block.name,
    receivers:block.pages.map((page,i)=>
      decodeReceiver(page,block.starts[i],block.arities[i],tape[i],sign))
  }))
}));

console.log(JSON.stringify({
  schema:1,
  grading:'PRETARGET NO-PLAINTEXT',
  sourceOperand:'p15 lower red11 resegmented by p6 native [4,1,4,2] lengths; segment GP29 products',
  tape,
  clock:'one derived scalar constant on each of four receiver lanes; same lanes on both q blocks',
  receivers:blocks,
  candidates
},null,2));
