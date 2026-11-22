'use strict';
/**
 * Source-constrained nonlinear 8/16/32 page-group test.
 * Exact original 32x8 LP2 table is a 256-byte base60 candidate, and the
 * book's 56 encrypted pages partition 8+16+32 at native 5-dot markers.
 * One contiguous 8/16/32-byte table slice acts as each page's standard
 * ARC4/RC4 key, using the same 32x8 -> 16x16 fold as the prior additive test.
 * This is a historically known algorithm, not a Cicada-signed table consumer.
 *
 * Deterministic, read-only, Windows Node22 CJS single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/lp2-grid-256.json');
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
assert.equal(corpus.pages.slice(0,56).reduce((n,p)=>n+p.runic_count,0),12956);
assert.equal(corpus.pages[50].runic_count,0);
assert.equal(corpus.pages[56].runic_count,85);
assert.equal(corpus.pages[57].runic_count,95);
const MOD=29;
const norm=n=>(n%MOD+MOD)%MOD;

/**
 * @param {number[]} key
 * @param {number} count
 * @param {number} drop
 * @returns {number[]}
 */
function rc4(key,count,drop=0) {
  assert(key.length>0);
  const s=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){j=(j+s[i]+key[i%key.length])&255;[s[i],s[j]]=[s[j],s[i]];}
  let i=0; j=0; const out=[];
  for(let k=0;k<count+drop;k++){
    i=(i+1)&255; j=(j+s[i])&255;[s[i],s[j]]=[s[j],s[i]];
    const v=s[(s[i]+s[j])&255];
    if(k>=drop)out.push(v);
  }
  return out;
}
assert.equal(rc4([75,101,121],10).map(x=>x.toString(16).padStart(2,'0')).join(''),'eb9f7781b734ca72a719');
/** @param {number} page @param {boolean} reverse @returns {number[]} */
function sourceKey(page,reverse){
  let key;
  if(page<8){ // page p0-p7 selects one of eight original table columns
    key=Array.from({length:32},(_,i)=>bytes[8*i+page]);
  } else if(page<24){ // p8-p23: 32x8 -> 16x16 by pairing row i with row i+16
    const i=page-8;
    key=[...bytes.slice(8*i,8*i+8),...bytes.slice(8*(i+16),8*(i+16)+8)];
  } else { // p24-p55: each native source row is one 64-bit page key
    const i=page-24;key=bytes.slice(8*i,8*i+8);
  }
  assert.equal(key.length,page<8?32:page<24?16:8);
  return reverse?key.reverse():key;
}
/** @param {number[]} input @param {number[]} key @param {number} sign @param {number} drop */
function cipher(input,key,sign,drop) {
  const stream=rc4(key,input.length,drop);
  return input.map((v,i)=>norm(v+sign*(stream[i]%29)));
}
/** @param {number[]} seq */
function ioc(seq){
  const counts=Array(29).fill(0);
  for(const v of seq){assert(v>=0&&v<29);counts[v]++;}
  return counts.reduce((s,v)=>s+v*(v-1),0)/(seq.length*(seq.length-1));
}
/** @param {number[]} seq */
function roman(seq){return seq.map(i=>corpus.translit[i]).join('');}
function main(){
  const solved=corpus.pages[57].indices;
  assert.equal(ioc(solved).toFixed(8),'0.06270997');
  const full=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  const controls=Array.from({length:3},(_,j)=>{
    const key=sourceKey([0,8,24][j],false);
    const plain=corpus.pages[56].indices; // decrypted same original solved corpus as synthetic stream
    const cipherText=cipher(plain,key,1,0);
    const recovered=cipher(cipherText,key,-1,0);
    assert.deepEqual(recovered,plain);
    return {part:j,keyLength:key.length,plantedKnownTextRunes:plain.length,exact:true};
  });
  const all=[];
  for(const reverse of [false,true])
    for(const sign of [-1,1])
      for(const drop of [0,256,512]){
        const output=[];
        const blocks=[[],[],[]];
        const samples=[];
        for(let page=0;page<56;page++){
          const original=corpus.pages[page].indices;
          const decoded=cipher(original,sourceKey(page,reverse),sign,drop);
          output.push(...decoded);
          blocks[page<8?0:page<24?1:2].push(...decoded);
          if([0,8,24,40,54,55].includes(page))
            samples.push({page,first50:roman(decoded.slice(0,50))});
        }
        const stats={
          reverse,sign,drop,
          wholeIoC:ioc(output),
          blockIoCs:blocks.map(ioc),
          samples
        };
        all.push(stats);
      }
  const body=[
    corpus.pages.slice(0,8).flatMap(p=>p.indices),
    corpus.pages.slice(8,24).flatMap(p=>p.indices),
    corpus.pages.slice(24,56).flatMap(p=>p.indices)
  ];
  assert.deepEqual(body.map(x=>x.length),[1874,3845,7237]);
  const expected=body.map(ioc);
  const ceiling=Math.max(...all.flatMap(x=>[x.wholeIoC,...x.blockIoCs]));
  assert(ceiling<0.045,'An original-input candidate has unexpectedly raised GP29 language IoC; investigate before rejecting!');
  console.log(JSON.stringify({
    test:'source-visible LP2 8+16+32 table as nonlinear per-page RC4 keys',
    interpretation:'p0-7 table columns32, p8-23 folded rows16, p24-55 original rows8',
    source:'original 32x8 base60 table, original 56 page ciphertext, 2014 ARC4 historical candidate',
    status:'bounded original-input negative only; no source-signed ARC4 consumer and no plaintext',
    keyVector:'Key -> eb9f7781b734ca72a719',
    positiveControls:controls,
    blockRuneLengths:body.map(x=>x.length),
    rawBlocksIoC:expected,
    nativeKnownClear57IoC:ioc(solved),
    variants:all
  },null,2));
}
if(require.main===module)main();
