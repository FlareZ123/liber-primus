'use strict';

/**
 * Source-native p33 complete-word carrier ↔ authentic 2014 Stage7 three-square
 * 99-cell transfer, without guessed word/window endpoints.
 *
 * The original p33's 49 complete black words contain 198=2*99 GP29 runes
 * after the original two-rune p33→p34 word carry. Test two human-natural
 * source-number receiver classes:
 *   (1) a 99-cell, two-rune-periodic Vigenere shift, source value mod29;
 *   (2) two adjacent GP29 indices as one base841 integer, plus/minus the
 *       historical 2014 numeric cell modulo 841, big or little GP order.
 *
 * Print six fixed full original decodes, exact original roundtrips and native
 * solved LP2 p57 original GP plaintext plants. No free phases or key fitting.
 * Node.js 22, Windows 11: node sims/lp2_p33_stage7_99cell_pair_carry_source_sft.cjs
 */

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r/g, '');
const pages = read('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceMatrices = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\n\s*\n/).map(matrix =>
    matrix.trim().split(/\s+/).map(Number)
  );

assert.equal(pages.length, 57);
assert.deepEqual(sourceMatrices.map(x => x.length), [25,49,25]);
const magic = sourceMatrices.flat();
assert.equal(magic.length, 99);

const segments = pages[33].replace(/[\s/]/g,'').split('&');
assert.equal(segments.length, 2);
const wordGroups = segments.map(s => s.slice(s.indexOf('.') + 1).split(/[-.]/).filter(Boolean));
assert.deepEqual(wordGroups.map(x => x.length), [21,28]);
const words = wordGroups.flat();
assert.equal(words[48], 'ᛒ');
assert.ok(pages[34].replace(/[\s/]/g, '').startsWith('ᛗᛒ-'));
words[48] += 'ᛗᛒ';
const runeIndices = new Map(corpus.runes.map((r,i)=>[r,i]));
const original = [...words.join('')].map(r => {
  assert.ok(runeIndices.has(r), 'Every original GP rune must be in source alphabet');
  return runeIndices.get(r);
});
assert.equal(original.length, 198);

const pairValues = Array.from({length:99},(_,i)=>29*original[2*i]+original[2*i+1]);
const distinct = xs => new Set(xs).size;
assert.equal(distinct(magic),50);
assert.equal(distinct(pairValues),94);

/** @param {number} n @param {number} radix */
const mod = (n,radix) => ((n%radix)+radix)%radix;

/**
 * @typedef {{kind:'twin'|'block',sign:1|-1,first:'high'|'low'}} Model
 * @param {number[]} input
 * @param {Model} model
 * @param {boolean} inverse true means encode, false means decode
 */
function transform(input,model,inverse=false){
  assert.equal(input.length%2,0);
  const out=[];
  for(let i=0;i<input.length/2;i++){
    const first=input[2*i], second=input[2*i+1], key=magic[i%magic.length], sign=model.sign*(inverse?-1:1);
    if(model.kind==='twin'){
      const offset=mod(sign*key,29);
      out.push(mod(first+offset,29),mod(second+offset,29));
      continue;
    }
    const val=model.first==='high'?29*first+second:29*second+first;
    const res=mod(val+sign*key,841);
    const high=Math.floor(res/29),low=res%29;
    out.push(...(model.first==='high'?[high,low]:[low,high]));
  }
  return out;
}

function ioc(a){
 const f=Array(29).fill(0);
 for(const x of a)f[x]++;
 return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const gp = a => a.map(x=>corpus.translit[x]).join('-');
const solved=corpus.pages[57].indices;
assert.equal(solved.length,95);
const plant=Array.from({length:198},(_,i)=>solved[i%solved.length]);
assert.ok(ioc(plant)>0.05);

console.log('p33 49 complete black words: 198 GP runes, 2 carried p34; 2014 three squares: 99 cells 25+49+25');
console.log('199? no: exactly 2*99, one source-number operand per GP pair.');
console.log('Historic square entries distinct: 50/99; 99 input GP pairs distinct: 94/99');
console.log('Source original ciphertext IoC='+ioc(original).toFixed(9)+', native solved-p57 GP-positive IoC='+ioc(plant).toFixed(9));

for(const sign of [-1,1]){
  const models=[
    {kind:'twin',first:'high',sign},
    {kind:'block',first:'high',sign},
    {kind:'block',first:'low',sign}
  ];
  for(const model of models){
    const plaintext=transform(original,model);
    assert.deepEqual(transform(plaintext,model,true),original,'Original GP cipher replay');
    assert.deepEqual(transform(transform(plant,model,true),model),plant,
      'Source-native solved-GP positive 198/198');
    assert.ok(ioc(plaintext)<0.04,'No coherent native-GP frequency rise');
    console.log(`original ${model.kind},${model.first},${model.sign}: IoC=${ioc(plaintext).toFixed(9)}, first26=${gp(plaintext.slice(0,26))}`);
  }
}
console.log('PASS: 6/6 exact full-original encodes, 6/6 198-rune solved-GP planted positives; 0/6 original genuine plaintext.');
