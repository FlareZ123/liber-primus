'use strict';
// Source-only LP1 control: no unknown LP2 ciphertext is opened.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const alphabet = native.runes;
const raw = read('resources/transcriptions/lp1_wulfic_canonical.txt');
/** @param {string} s */
const strip = s => [...s].filter(x => alphabet.includes(x));
/** @param {string} s */
const ord = s => strip(s).map(x => alphabet.indexOf(x));
/** @param {number} x */
const mod = x => (x+29)%29;
const ciphertexts = raw.split('$').map(ord);
const plaintexts = native.sections.map(s => ord(s.source_text));
const expected = [
  {n:1, key:'ᛞᛁᚢᛁᚾᛁᛏᚣ', total:515, heldout:489, f:11},
  {n:5, key:'ᚠᛁᚱᚠᚢᛗᚠᛖᚱᛖᚾᚠᛖ', total:319, heldout:293, f:2}
];
for (const {n,key,total,heldout,f} of expected) {
  const c = ciphertexts[n], p = plaintexts[n];
  assert.equal(c.length,total); assert.equal(p.length,total);
  const prefix = p.slice(0,26);
  assert(!prefix.includes(0));
  const d = prefix.map((v,i) => mod(c[i]-v));
  const periods = Array.from({length:13},(_,i)=>i+1)
    .filter(l => d.every((v,i)=>v===d[i%l]));
  assert.deepEqual(periods,[key.length]);
  const recovered = d.slice(0,periods[0]);
  assert.equal(recovered.map(i=>alphabet[i]).join(''),key);
  let t=0;
  const pred = p.map(v => v===0 ? 0 : mod(v+recovered[t++%recovered.length]));
  assert.deepEqual(pred.slice(26),c.slice(26));
  assert.deepEqual(pred,c);
  assert.equal(c.length-26,heldout);
  assert.equal(p.filter(v=>v===0).length,f);
  console.log({section:n,periods,key,recovered,heldout,f,total});
}
const forms = ['ᛞᛁᚢᛁᚾᛁᛏᚣ','ᚳᛁᚱᚳᚢᛗᚠᛖᚱᛖᚾᚳᛖ','ᚠᛁᚱᚠᚢᛗᚠᛖᚱᛖᚾᚠᛖ'];
/** @param {string} s */
const hits = s => forms.map(k=>[...strip(s).join('').matchAll(new RegExp(k,'gu'))].map(m=>m.index));
const table = native.sections.map(s=>({name:s.name,offsets:hits(s.source_text)}));
console.log(JSON.stringify(table,null,2));
assert.deepEqual(table[1].offsets,[[],[],[]]);
assert.deepEqual(table[4].offsets,[[8,70,622],[18],[]]);
assert.deepEqual(table[5].offsets,[[],[52],[]]);
assert.deepEqual(table[8].offsets,[[73],[53],[]]);
assert(table.every(x=>x.offsets[2].length===0));
const clear = raw.split('$')[4];
assert.deepEqual(ord(clear),plaintexts[4]);
const words = clear.replace(/[/%]\s*/g,'').match(/[\u16a0-\u16ea]+/gu);
assert.equal(words.length,181);
assert.equal(new Set(words).size,93);
assert.equal(words[3],forms[0]); assert.equal(words[5],forms[1]);
assert.equal(words[14],forms[0]); assert.equal(words[153],forms[0]);
assert.equal(new Set(words.filter(w=>w.length===8)).size,7);
assert.equal(new Set(words.filter(w=>w.length===13)).size,1);
assert.equal(forms[1].replaceAll('ᚳ','ᚠ'),forms[2]);
const cpositions = [...forms[1]].flatMap((v,i)=>v==='ᚳ'?[i]:[]);
assert.deepEqual(cpositions,[0,3,11]);
console.log({clearWords:words.length,uniqueWords:new Set(words).size,length8Types:7,length13Types:1,cpositions});
console.log('PASS: exact known-key recovery; literal self-key premise fails; no LP2 receiver selected.');
