'use strict';
/**
 * SFT: five original p7 red-word GP29 products as a whole, exact
 * third-order affine reversible GP29 plaintext-to-ciphertext receiver.
 * Coefficients: [11,26,8,15,2] in source order.
 *
 * NO fitting, plaintext scoring model, change of original rune order,
 * extra cipher layers or arbitrary key source.
 *
 * Windows 11 / Node22:
 * node sims/lp2_p7_redfive_thirdorder_affine_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
assert.equal(gp.pages[8].indices.length,255);
assert.equal(gp.pages[7].indices.length,208);
const products=[11,26,8,15,2];
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const f=new Uint16Array(29);
  data.forEach(x=>f[x]++);
  return f.reduce((s,x)=>s+x*(x-1),0)/(data.length*(data.length-1));
}
/**
 * Reverse recurrence:
 * Ci=11Ci-1+26Ci-2+8Ci-3+15Pi+2 (mod29)
 * inverse of 15 mod29=2; all 29 letters in each position are possible.
 *
 * @param {number[]} originalCipher
 * @param {number[]} previousThree  chronological [C(i-3),C(i-2),C(i-1)]
 * @returns {number[]}
 */
function decode(originalCipher, previousThree) {
  let [a,b,c]=previousThree, result=[];
  for (const d of originalCipher) {
    result.push(mod(2*(d-products[0]*c-products[1]*b-
      products[2]*a-products[4])));
    a=b;b=c;c=d;
  }
  return result;
}
/**
 * @param {number[]} plain
 * @param {number[]} previousThree
 * @returns {number[]}
 */
function encode(plain, previousThree) {
  let [a,b,c]=previousThree, result=[];
  for (const p of plain) {
    const d=mod(products[0]*c+products[1]*b+
      products[2]*a+products[3]*p+products[4]);
    result.push(d);
    a=b;b=c;c=d;
  }
  return result;
}
assert.equal(mod(products[3]*2),1);
const clearP57=gp.pages[57].indices; // already known unenciphered original page
assert.equal(clearP57.length,95);
const sourceP7LastThree=gp.pages[7].indices.slice(-3);
assert.deepEqual(sourceP7LastThree,[6,28,19]);
const p8BlackStart=gp.pages[8].indices.slice(9,12);
assert.equal(p8BlackStart.length,3);
const initializers=[
  ['zero', [0,0,0]],
  ['preceding p7 final three source runes',sourceP7LastThree]
];
const plant=[];
for (const [name,init] of initializers) {
  const cipher=encode(clearP57,init);
  assert.deepEqual(decode(cipher,init),clearP57);
  assert.deepEqual(encode(decode(cipher,init),init),cipher);
  plant.push({name,length:clearP57.length,
    knownClearIoC:ioc(clearP57)});
}
const candidates=[
  {label:'p8–p14 all original runes',pages:[8,15],skipP8:0},
  {label:'p8 black body through p14',pages:[8,15],skipP8:12},
  {label:'p9–p14 original',pages:[9,15],skipP8:0},
  {label:'p15–p21 disjoint holdout',pages:[15,22],skipP8:0}
];
const output=[];
for (const target of candidates) {
  const originals=gp.pages.slice(...target.pages)
    .flatMap(p=>p.indices).slice(target.skipP8);
  let options=[['zero',[0,0,0]]];
  if(target.label==='p8–p14 all original runes') {
    options.push(['p7 last3',sourceP7LastThree]);
  }
  if(target.label==='p8 black body through p14') {
    options.push(['p8 last3 red heading',p8BlackStart]);
  }
  for(const [name,init] of options) {
    const recovered=decode(originals,init);
    assert.deepEqual(encode(recovered,init),originals);
    output.push({
      name:target.label,initializer:name,
      originalRunes:originals.length,
      originalCipherIoC:ioc(originals),
      candidateClearIoC:ioc(recovered),
      first64GP:recovered.slice(0,64).map(x=>gp.translit[x]).join(' ')
    });
  }
}
assert.deepEqual(output.map(x=>x.originalRunes),
  [1729,1729,1717,1717,1474,1772]);
assert(output.every(x=>x.candidateClearIoC<0.05));
console.log(JSON.stringify({
  source:'p7 five original complete red-word GP ordinal products',
  originalProducts:products,
  directOnly:'third-order affine Ci=11Ci-1+26Ci-2+8Ci-3+15Pi+2 mod29',
  positiveSolvedPageP57:plant,
  originalReceivers:output,
  interpretation:'exactly reversible candidates, original outputs not native prose'
},null,2));
console.log('PASS: original p8 black and red source, full 1729-tree chapter, independent heldout, all solved p57 native plants');
