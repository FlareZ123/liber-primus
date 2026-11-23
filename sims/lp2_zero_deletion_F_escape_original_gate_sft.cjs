'use strict';
/**
 * Authored zero-removal/GP29-F-interrupter lead: test the simplest F-as-inserted
 * repeated-rune escape on every original unsolved LP2 rune, page boundaries held.
 *
 * Node.js 22: node sims/lp2_zero_deletion_F_escape_original_gate_sft.cjs
 * Purely keyless source syntax: no guesswork about a key, alphabet remapping,
 * prime phase, origin or plaintext. Does not exclude F-as-a-keyed escape.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
assert.equal(corpus.runes.length,29);
assert.equal(corpus.translit[0],'F');
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length>0);
assert.equal(pages.length,55);
let total=0, originalEqual=0, originalFF=0, fTotal=0, bracketXF_X=0;
let afterEqual=0, afterLen=0, afterPairs=0;
for(const p of pages){
 const a=p.indices;
 assert.equal(a.length,p.runic_count);
 assert(a.every(x=>Number.isInteger(x)&&x>=0&&x<29));
 total+=a.length;
 for(let i=0;i<a.length;i++){
   if(a[i]===0)fTotal++;
   if(i>0 && a[i]===a[i-1]) {
     originalEqual++;
     if(a[i]===0) originalFF++;
   }
   if(i>0 && i<a.length-1 && a[i]===0
      && a[i-1]!==0 && a[i-1]===a[i+1]) bracketXF_X++;
 }
 const kept=a.filter(x=>x!==0);
 afterLen+=kept.length;
 afterPairs+=Math.max(0,kept.length-1);
 for(let i=1;i<kept.length;i++){
   if(kept[i]===kept[i-1])afterEqual++;
 }
}
assert.equal(total,12956);
assert.equal(fTotal,458);
assert.equal(originalEqual,86);
assert.equal(originalFF,4);
assert.equal(bracketXF_X,12);
assert.equal(afterLen,12498);
assert.equal(afterPairs,12443);
assert.equal(afterEqual,94);
// Positive control: a literal insertion-only escape must yield original
// symbols after deleting F; each run-length extra produces X-F-X.
const input=[1,1,2,2,2,3,4,4,5,6,6,6,6,7,8];
const plant=[];
let insertions=0;
for(const n of input){
 if(plant.length && plant[plant.length-1]===n){
   plant.push(0);insertions++;
 }
 plant.push(n);
}
assert.deepEqual(plant.filter(x=>x!==0),input);
assert.equal(insertions,7);
assert.equal(plant.filter((x,i)=>i>0&&i<plant.length-1&&
  x===0&&plant[i-1]===plant[i+1]).length,insertions);
const result={sourcePages:pages.length,originalRunes:total,
  originalAdjacentPairs:total-pages.length,originalAdjacentEqual:originalEqual,
  totalF:fTotal,originalAdjacentFF:originalFF,
  originalXFXNonFBridges:bracketXF_X,afterRemoveFRunes:afterLen,
  afterRemoveFAdjacentPairs:afterPairs,afterRemoveFEqual:afterEqual,
  newEqualNonFUnmasked:afterEqual-(originalEqual-originalFF),
  simpleEscapePlantInserted:insertions,positivePlantPassed:true};
assert.equal(result.newEqualNonFUnmasked,12);
console.log('PASS: original 55 rune-bearing unsolved physical LP2 pages, exact no-cross-page boundary');
console.log('PASS: simple F-only duplicate insertion positive reverses and yields X-F-X for each insertion');
console.log('PASS: removing all 458 F yields only 94 equal neighboring non-F glyphs, 12 newly adjacent');
console.log(JSON.stringify(result,null,2));
