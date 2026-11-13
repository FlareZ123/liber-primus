'use strict';
/**
 * GP29 five-share interpolation: solved p57 55 word-interior runes extend
 * from 5x11 into 11x11, used as a candidate pad against original p32.
 * Windows 11 / Node.js 22, original corpus and transcript, no writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const d = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const s = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const tail = s.split('%').at(-1).split('§')[0];
const words = tail.replace(/\/\s*\r?\n/g, '').replace(/\r?\n/g, '').replace(/\./g, '-').split('-').filter(Boolean);
const gp = (word) => Array.from(word, (c) => {
  const n = d.runes.indexOf(c);
  assert.ok(n >= 0, 'Unrecognised GP rune');
  return n;
});
const solved57 = d.pages[57].indices;
const p32 = d.pages[32].indices;
assert.equal(words.length, 20);
assert.deepEqual(words.flatMap(gp), solved57);
assert.equal(solved57.length, 95);
assert.equal(p32.length, 121);
const inner = words.flatMap((word) => gp(word).slice(1,-1));
assert.equal(inner.length, 55);
assert.equal(inner.map((i) => d.translit[i]).join(''), 'ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG');
const mod = (v) => ((v % 29) + 29) % 29;
const inv = (n) => {
  for (let k=1;k<29;k++) if (mod(n*k)===1) return k;
  throw new RangeError('Non-unit');
};
const interp = (x,y) => {
  let sum=0;
  for (let j=0;j<5;j++) {
    let term=y[j];
    for (let t=0;t<5;t++) if (t!==j) term=mod(term*mod(x-t)*inv(j-t));
    sum=mod(sum+term);
  }
  return sum;
};
const pad = Array.from({length:121}, (_,i)=>{
  const r=Math.floor(i/11), c=i%11;
  return interp(r, Array.from({length:5}, (_,j)=>inner[11*j+c]));
});
assert.deepEqual(pad.slice(0,55),inner);
const ioc = (a) => {
  const counts=Array(29).fill(0);
  for (const i of a) counts[i]++;
  return counts.reduce((sum,c)=>sum+c*(c-1),0)/(a.length*(a.length-1));
};
assert.equal(ioc(p32),0.03415977961432507);
const models = [
  {order:'rows', sign:-1, ioc:0.03264462809917355},
  {order:'rows', sign:+1, ioc:0.03471074380165289},
  {order:'columns', sign:-1, ioc:0.03333333333333333},
  {order:'columns', sign:+1, ioc:0.03305785123966942}
];
console.log('Original solved p57: 20 words, 95 runes, 55 word interiors');
console.log('p57 F29 interpolated first five rows:', pad.slice(0,55).join(','));
console.log('p32 original IoC:',ioc(p32).toFixed(9));
for (const m of models) {
  const cipher = m.order==='rows' ? p32 : p32.map((_,i)=>p32[11*(i%11)+Math.floor(i/11)]);
  const clear = cipher.map((c,i)=>mod(c+m.sign*pad[i]));
  assert.ok(Math.abs(ioc(clear)-m.ioc)<1e-14);
  assert.deepEqual(clear.map((p,i)=>mod(p-m.sign*pad[i])),cipher);
  const known = Array.from({length:121},(_,i)=>solved57[i%95]);
  const planted=known.map((p,i)=>mod(p-m.sign*pad[i]));
  assert.deepEqual(planted.map((c,i)=>mod(c+m.sign*pad[i])), known);
  console.log(m.order, m.sign, ioc(clear).toFixed(9),
    clear.map((x)=>d.translit[x]).join(''));
}
console.log('PASS: four exact original ciphertext roundtrips and four 121-rune native-GP plants.');
