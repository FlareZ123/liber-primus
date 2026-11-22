'use strict';
/**
 * LP1 p05 GP words and LP2 pp49-51 numeric rim: one original p55 inverse.
 * All 76 source entries in source printed order. No fitted key/phase.
 * node sims/lp2_p05_words_p50_rim_p55_dual_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
/** @param {number} x @returns {number} */
function mod29(x){return ((x%29)+29)%29;}
/** @param {number[]} values @returns {number} */
function ioc(values){
  const counts=Array(29).fill(0);
  for(const x of values){assert.ok(Number.isInteger(x)&&x>=0&&x<29);counts[x]++;}
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const start=lp1.indexOf('272-138-');
assert.ok(start>=0);
assert.equal(lp1.indexOf('272-138-',start+1),-1);
const cells=lp1.slice(start).split(/\r?\n/u).slice(0,5)
  .flatMap(line=>line.replace(/\/$/u,'').split('-'))
  .filter(value=>!/^[0-9]+$/u.test(value));
assert.equal(cells.length,13);
const tape=Array.from(cells.join(''),rune=>corpus.runes.indexOf(rune));
assert.ok(tape.every(v=>v>=0&&v<29));
assert.equal(tape.length,76);
const wordNames=cells.map(cell=>Array.from(cell,rune=>corpus.translit[corpus.runes.indexOf(rune)]).join(''));
assert.deepEqual(wordNames,[
  'SHADOWS','AETHEREAL','BUFFERS','UOID','CARNAL','OBSCURA',
  'FORM','MOBIUS','ANALOG','UOID','MOURNFUL','AETHEREAL','CABAL'
]);
const rows=grid.byte_rows;
assert.equal(rows.length,32);
for(const r of rows)assert.equal(r.length,8);
const rim=[
  ...rows[0],
  ...rows.slice(1).map(row=>row[7]),
  ...rows[31].slice(0,7).reverse(),
  ...rows.slice(1,31).reverse().map(row=>row[0])
];
assert.equal(rim.length,76);
const p55=corpus.pages.find(page=>page.page===55).indices;
const p57=corpus.pages.find(page=>page.page===57).indices.slice(0,76);
assert.equal(p55.length,76);
assert.equal(p57.length,76);
const key=tape.map((r,i)=>mod29(r+rim[i]));
/** @param {number[]} values @returns {number[]} */
function decode(values){return values.map((c,i)=>mod29(c-key[i]));}
/** @param {number[]} values @returns {number[]} */
function encode(values){return values.map((p,i)=>mod29(p+key[i]));}
const decoded=decode(p55);
assert.deepEqual(encode(decoded),p55);
assert.deepEqual(decode(encode(p57)),p57);
assert.equal(ioc(decoded),0.036491228070175435);
assert.equal(ioc(p55),0.037894736842105266);
assert.equal(ioc(p57),0.05964912280701754);
const text=decoded.map(x=>corpus.translit[x]).join('');
assert.equal(text,
 'GETHRDONGNHYLTHXNGTHHOEAWTUDRYTMDXGTIAWUMPWAEYIAHTRTOEEWIARNYLNHOENFLDMLTOETSAAJJAOEJPWWEX');
console.log(JSON.stringify({
 sourceOperands:{p05WordCells:cells.length,p05WordTape:tape.length,
  p50ClockwiseTopLeftRim:rim.length,p55CipherRunes:p55.length},
 operation:'P=(C - LP1p05-word-tape-GPindex - (LP2p50-clockwise-rim-base60byte mod29)) mod29',
 p55OriginalIoC:ioc(p55),
 candidateIoC:ioc(decoded),
 solvedP57First76IoC:ioc(p57),
 candidateTransliteration:text,
 fullOriginalCipherRoundtrip:76,
 independentNativeGPPlantRoundtrip:76,
 conclusion:'No recovered p55 plaintext or authentic source-selected two-pad instruction'
},null,2));
