'use strict';
/**
 * Source-led, read-only original-cipher test: 32x8 p50 table as an eight-state
 * byte-packed Mealy keystream. The Fu-Xi/three-bit association is hypothetical;
 * the known 2016 exact Fu-Xi primary source is not presently authenticated.
 *
 * Input: original GP29 rune sequence, original 32x8 table, solved p57 control.
 * Run from any working directory: node sims/lp2_p50_fuxi8_bitpacked_mealy_original_sft.cjs
 * No third-party packages, network operations, or file writes.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = rel => JSON.parse(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));
const table = read('resources/liber-primus/lp2-grid-256.json').bytes;
const corpus = read('resources/liber-primus/lp2-corpus.json');
assert.equal(table.length, 256);
const pages = corpus.pages.filter(p => p.page <= 55 && p.runic_count > 0);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s,p) => s + p.indices.length,0),12956);
assert.equal(solved.length,95);

/**
 * @typedef {{pack:0|1, sign:-1|1, feedback:'cipher'|'plain',
 *   resetPage:boolean, initialState:number}} Config
 * The 8-bit table entry is parsed as either [3-bit state,5-bit mask]
 * or [5-bit mask,3-bit state]. The input row is the previous output
 * ciphertext rune, or the previous recovered plaintext rune.
 * A mask 29..31 is reduced mod29, never silently discarded.
 */

/** @param {number} b @param {0|1} pack */
function transition(b,pack) {
  return pack === 0 ? {key:(b & 31)%29, state:b >>> 5}
                    : {key:(b >>> 3)%29, state:b & 7};
}
/** @param {{page:number,indices:number[]}[]} input @param {Config} cfg */
function decode(input,cfg) {
  let state=cfg.initialState,prevC=0,prevP=0;
  return input.map(pg=>{
    if(cfg.resetPage) {state=cfg.initialState;prevC=0;prevP=0;}
    const out=[];
    for(const C of pg.indices){
      const row=cfg.feedback==='plain'?prevP:prevC;
      const t=transition(table[row*8+state],cfg.pack);
      const P=(C+cfg.sign*t.key+29)%29;
      out.push(P);
      state=t.state;prevC=C;prevP=P;
    }
    return {page:pg.page,indices:out};
  });
}
/** @param {{page:number,indices:number[]}[]} input @param {Config} cfg */
function encode(input,cfg){
  let state=cfg.initialState,prevC=0,prevP=0;
  return input.map(pg=>{
    if(cfg.resetPage) {state=cfg.initialState;prevC=0;prevP=0;}
    const out=[];
    for(const P of pg.indices){
      const row=cfg.feedback==='plain'?prevP:prevC;
      const t=transition(table[row*8+state],cfg.pack);
      const C=(P-cfg.sign*t.key+29)%29;
      out.push(C);
      state=t.state;prevC=C;prevP=P;
    }
    return {page:pg.page,indices:out};
  });
}
/** @param {number[]} a */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const n of a) { assert(n>=0&&n<29);counts[n]++; }
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {{indices:number[]}[]} a */
function flatten(a){return a.flatMap(x=>x.indices);}
/** @param {{indices:number[]}[]} a @param {{indices:number[]}[]} b */
function same(a,b){assert.deepEqual(a.map(x=>x.indices),b.map(x=>x.indices));}

const raw=ioc(flatten(pages)),native=ioc(solved);
let pos=0;
const planted=pages.map(p=>({page:p.page,indices:p.indices.map(()=>solved[pos++%solved.length])}));
const results=[];
for(const feedback of ['cipher','plain']){
  for(const pack of [0,1]){
    for(const sign of [-1,1]){
      for(const resetPage of [false,true]){
        for(let initialState=0;initialState<8;initialState++){
          const cfg={feedback,pack,sign,resetPage,initialState};
          const out=decode(pages,cfg);
          same(encode(out,cfg),pages);
          const synthetic=encode(planted,cfg);
          same(decode(synthetic,cfg),planted);
          results.push({cfg,ioc:ioc(flatten(out))});
        }
      }
    }
  }
}
assert.equal(results.length,128);
results.sort((a,b)=>b.ioc-a.ioc);
assert(results[0].ioc < 0.04, 'unexpected high-coincidence candidate; inspect original plaintext');
const distinct=[];
const invalid=[];
for(const pack of [0,1]){
  const perState=[],bad=[];
  for(let state=0;state<8;state++){
    const v=Array.from({length:29},(_,row)=>pack===0?(table[row*8+state]&31):(table[row*8+state]>>>3));
    perState.push(new Set(v).size);
    bad.push(v.filter(x=>x>=29).length);
  }
  distinct.push(perState);invalid.push(bad);
}
console.log('INPUT '+JSON.stringify({originalRunes:12956,originalPages:55,tableCells:256,
  tableLayout:'32 rows x 8 columns',p57SolvedRunes:solved.length,
  rawOriginalIoC:raw,solvedP57IoC:native}));
console.log('FULL_BYTE_5BIT_OUTPUT '+JSON.stringify({distinctOutputByState:distinct,
  illegalGP5bitCodesByState:invalid,
  conclusion:'neither packing is an injective, all-valid symbolwise 29-to-29 map in every state'}));
console.log('MODEL_SET '+JSON.stringify({models:results.length,
  assumptions:'row = previous ciphertext or plaintext GP29; 3-bit state from table byte; additive GP29 mask from remaining 5 bits; page/book clock',
  exactOriginalRoundtrips:128,exactNativeP57TiledPlantRoundtrips:128,
  minimumIoC:Math.min(...results.map(x=>x.ioc)),
  maximumIoC:results[0].ioc,
  topFive:results.slice(0,5)}));
console.log('DECISION No original GP-native English plaintext or author-selected key; only this finite, source-hypothetical Mealy register family is rejected.');
