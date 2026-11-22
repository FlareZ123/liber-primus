'use strict';
/**
 * Source-selected LP2 p32 121=11×11 "shed the circumference" gate, p51=92.
 * Windows Node22 SFT: node sims/lp2_p32_121_to_81_p51_consumer_sft.cjs
 * All candidates frozen to a single source-motivated extraction/operation family.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = p => fs.readFileSync(path.join(root,p), 'utf8');
const book = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const ink = JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const rawPages = load('resources/liber-primus/lp2-transcription.txt')
  .split('%').filter(x => /[ᚠ-ᛡ]/u.test(x));
const idx = new Map(book.runes.map((x,i)=>[x,i]));
const words = page => page.replace(/[\r\n/]/g, '').split(/[-.]/)
  .map(x => (x.match(/[ᚠ-ᛡ]+/gu)||[]).join('')).filter(Boolean)
  .map(w => [...w].map(x => {
    const id=idx.get(x);
    assert.notEqual(id,undefined);
    return id;
  }));
const p32 = book.pages[32].indices;
const p51 = book.pages[51].indices;
const p57 = book.pages[57].indices;
const w51 = words(rawPages[50]);
assert.equal(p32.length,121);
assert.equal(p51.length,92);
assert.equal(p57.length,95);
assert.equal(w51.length,20);
assert.deepEqual(w51.flat(), p51);
const squarePages = book.pages.filter(p=>p.page<=55&&p.indices.length)
  .filter(p=>Number.isInteger(Math.sqrt(p.indices.length)))
  .map(p=>[p.page,p.indices.length]);
assert.deepEqual(squarePages,[[6,196],[32,121]]);
const n=11;
const inside=[],perimeter=[];
for(let i=0;i<p32.length;i++){
  const x=i%n,y=Math.floor(i/n);
  (x===0||x===10||y===0||y===10?perimeter:inside).push(p32[i]);
}
assert.equal(inside.length,81);
assert.equal(perimeter.length,40);
assert.equal(121-92,29);
assert.equal(p51.length-11,81);
assert.equal(w51.length*2,perimeter.length);
const endpoints=w51.flatMap(w=>[w[0],w[w.length-1]]);
assert.equal(endpoints.length,40);
assert.equal(w51.filter(w=>w.length===1).length,1);
// GP29 rune C (used for Latin K) has original prime13, and p32 original
// post-text red mark is 13 dots. Its only occurrence is at row0 col8,
// outside the 9×9 square when the original 121 runes are reflowed row-major.
assert.equal(book.translit[5],'C');
assert.equal(book.prime[5],13);
assert.equal(p32.filter(x=>x===5).length,1);
assert.equal(p32.indexOf(5),8);
const absent=book.translit.filter((x,i)=>!inside.includes(i));
assert.deepEqual(absent,['C']);
assert.deepEqual(ink.pages.find(p=>p.page===32).large_punctuation,
  [[121,13,'red']]);
const roman = a => a.map(x=>book.translit[x]).join('');
const ioc = a => {
  const count=Array(29).fill(0);
  a.forEach(x=>count[x]++);
  return count.reduce((s,k)=>s+k*(k-1),0)/(a.length*(a.length-1));
};
// The first direct consumer uses all 81 original p51 first runes and
// exactly 81 GP29 runes extracted from the proposed original p32 interior.
const c81=p51.slice(0,81);
const plus=c81.map((x,i)=>(x+inside[i])%29);
const minus=c81.map((x,i)=>(x-inside[i]+29)%29);
// Alternative original-source key (table successor orbit) with no extra seed.
let state=81;
const route=[];
for(let i=0;i<81;i++){route.push(state);state=grid.bytes[state];}
const orbitInverse=inside.map((x,i)=>(x-(route[i]%29)+29)%29);
const ringKeyInverse=inside.map((x,i)=>
  (x-endpoints[i%40]+29)%29);
const candidates=[
  {name:'p51minus_p32_interior81',i:ioc(minus),preview:roman(minus)},
  {name:'p51plus_p32_interior81',i:ioc(plus),preview:roman(plus)},
  {name:'p32inner_minus_Torbit81',i:ioc(orbitInverse),preview:roman(orbitInverse)},
  {name:'p32inner_minus_p51Endpoint40_repeat',i:ioc(ringKeyInverse),preview:roman(ringKeyInverse)}
];
const control=ioc(p57);
assert.ok(control>0.06);
assert.ok(candidates.every(x=>x.i<0.05),'Unexpected high-IoC candidate: inspect source');
console.log(JSON.stringify({
  source:{sourcePages:[32,51,57],p32Runes:p32.length,
    p51Runes:p51.length,p57ClearRunes:p57.length,
    perfectSquareRuncountPages:squarePages,p51PrintedWords:w51.length},
  extraction:{grid11x11:true,outerSlots:40,innerRuncount:81,
    uniqueInteriorRunes:new Set(inside).size,missingInteriorRune:absent,
    uniqueRuneCOriginalCount:1,uniqueCPerimeterIndex:8,
    CPrime:book.prime[5],originalP32RedDots:13,
    p51WordsTimesTwoEndpoints:endpoints.length,
    p51Prefix81:p51.length-11,p51Suffix11:11,
    p32MinusP51RuneCount:29},
  originalCipherGate:{originalP32InteriorIoC:ioc(inside),
    originalP51Prefix81IoC:ioc(c81),solvedP57IoC:control,
    candidates},
  limitations:'Row-major reflow to 11x11 is hypothesized, no first-party D4/row order or additive key is selected by the original book. Four fixed direct consumers fail; no recovered plaintext.'
},null,2));
