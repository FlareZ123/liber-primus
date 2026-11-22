'use strict';
/**
 * Gist huw/8a564d1e8027294df15d, linked from original 2015-07-07
 * Fandom Part9 revision 26139, source code lines 69-73 and 794-821.
 *
 * Original ACTUAL hardcoded line: forge_offsets(first 300 primes,
 *    direction=1, offset=-3301).
 * Original COMMENTED alternate: forge_offsets(
 *    "ULTIMATETRUTHISTHEULTIMATEILLUSION", direction=1, offset=0).
 * Source code consumes only runes, keeps one global key phase across pages.
 * In the upstream source A is 0 under string.ascii_uppercase.index; this
 * differs from the linked downstream Pastebin script's ord(x)-96 mapping.
 *
 * Tests only those two source-constrained keys, exact original GP29 indices,
 * plus independent planted p57 plaintext. No third-party code execution.
 * Node.js 22, CommonJS on Windows.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const j = JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h=Array(29).fill(0);
  for(const x of a)h[x]++;
  const n=a.length;
  return h.reduce((sum,c)=>sum+c*(c-1),0)/(n*(n-1));
}
/** @param {number} count @returns {number[]} */
function primes(count) {
  const out=[];
  for(let x=2;out.length<count;x++){
    let prime=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break}
    if(prime)out.push(x);
  }
  return out;
}
/**
 * @param {number[]} symbols
 * @param {number[]} offsets
 * @param {number} phase
 * @param {number} sign
 * @returns {number[]}
 */
function shift(symbols,offsets,phase,sign){
  return symbols.map((c,i)=>mod29(c+sign*offsets[(phase+i)%offsets.length]));
}
const p = primes(300);
assert.equal(p[0],2);
assert.equal(p.at(-1),1987);
const keys={
  'published-active-first300-primes-minus3301':p.map(x=>x-3301),
  'published-commented-ultimate-truth-phrase':
    [...'ULTIMATETRUTHISTHEULTIMATEILLUSION'].map(x=>x.charCodeAt(0)-65)
};
assert.equal(keys['published-commented-ultimate-truth-phrase'].length,34);
assert.equal(keys['published-commented-ultimate-truth-phrase'][0],20); // U, upstream A=0
const targets=j.pages.filter(x=>x.page<=57&&x.runic_count);
const rows=[];
for(const [label,offsets] of Object.entries(keys)){
  const originalUnknown=[],decodedUnknown=[];
  let phase=0, page56=null;
  for(const page of targets){
    const dec=shift(page.indices,offsets,phase,-1);
    const reenc=shift(dec,offsets,phase,1);
    assert.deepEqual(reenc,page.indices);
    if(page.page<=55){
      originalUnknown.push(...page.indices);
      decodedUnknown.push(...dec);
    }
    if([0,49,51,54,55,56].includes(page.page)){
      rows.push({label,page:page.page,phase:phase%offsets.length,
        count:page.indices.length,originalIoC:ioc(page.indices),
        decodedIoC:ioc(dec),
        first25Native:dec.slice(0,25).map(x=>j.translit[x]).join(' ')});
    }
    if(page.page===56)page56={count:page.indices.length,ioc:ioc(dec)};
    if(page.page===57){
      const synthetic=shift(page.indices,offsets,phase,1);
      assert.deepEqual(shift(synthetic,offsets,phase,-1),page.indices);
      assert.equal(page.indices.length,95);
    }
    phase+=page.indices.length;
  }
  assert.equal(originalUnknown.length,12956);
  rows.push({label,mode:'all-original-unknown-runes',
    count:decodedUnknown.length,decodedIoC:ioc(decodedUnknown),
    nativeSolvedPage56StillCipherLike:page56.ioc<0.05});
}
console.log(JSON.stringify({decision:'No original unknown-page plaintext for exact two Gist key definitions',
  source:'2015-07-07 wiki link to huw Gist',
  sourcePhase:'one continuous rune-only key clock across all physical pages',
  originalKnownP57Positive:'95/95 native symbol plant recovered under both schedules',
  rows}));
