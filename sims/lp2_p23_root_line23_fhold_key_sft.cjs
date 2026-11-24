'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(dir, 'lp2-transcription.txt'), 'utf8');
const pages = transcript.split('%').map(s => s.split('\n').map(l =>
  Array.from(l).map(x => corpus.runes.indexOf(x)).filter(x => x >= 0)).filter(l => l.length));
assert.deepEqual(pages[23].flat(), corpus.pages[23].indices);
const key = pages[23][5];
assert.equal(key.length, 23);
assert.equal(key.reduce((s, v) => s + v, 0), 304);
const target = pages[23].slice(6).flat().concat(...corpus.pages.slice(24, 27).map(p => p.indices));
assert.equal(target.length, 898);
const mod = x => (x % 29 + 29) % 29;

// Every legal plaintext-F hold and consuming non-F branch is counted exactly.
// At cipher F both types may be possible; at non-F only the consuming branch is legal.
function countPaths(cipher, k, sign) {
  let dp = Array(k.length).fill(0n);
  dp[0] = 1n;
  let i = 0;
  for (const x of cipher) {
    const next = Array(k.length).fill(0n);
    for (let j = 0; j < k.length; j++) if (dp[j]) {
      if (x === 0) next[j] += dp[j];
      if (mod(x - sign * k[j]) !== 0) next[(j + 1) % k.length] += dp[j];
    }
    if (next.every(x => x === 0n)) return {prefix: i, paths: '0'};
    dp = next;
    i++;
  }
  return {prefix: i, paths: dp.reduce((a,b) => a+b, 0n).toString()};
}
function enc(plain, k, sign) {
  let j = 0;
  return plain.map(x => x === 0 ? 0 : mod(x + sign * k[(j++) % k.length]));
}
// Only used on the 95-rune native positive controls; explicitly enumerate all legal outputs.
function enumerate(cipher, k, sign) {
  const out = [], prefix = [];
  function rec(i, j) {
    if (i === cipher.length) { out.push(prefix.slice()); return; }
    const x = cipher[i];
    if (x === 0) { prefix.push(0); rec(i+1,j); prefix.pop(); }
    const p = mod(x - sign*k[j]);
    if (p !== 0) { prefix.push(p); rec(i+1,(j+1)%k.length); prefix.pop(); }
  }
  rec(0,0);
  return out;
}
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s,v) => s+v*(v-1),0)/(a.length*(a.length-1));
}
const variants = [];
for (const reverse of [false,true]) for (const sign of [1,-1]) {
  const k = reverse ? key.slice().reverse() : key;
  const native = corpus.pages[57].indices;
  assert.equal(native.length,95);
  const plant = enc(native,k,sign);
  const control = countPaths(plant,k,sign);
  const candidates = enumerate(plant,k,sign);
  assert.equal(BigInt(candidates.length),BigInt(control.paths));
  assert(candidates.some(p => p.every((x,i) => x === native[i])));
  for (const p of candidates) assert.deepEqual(enc(p,k,sign),plant);
  const fixed = countPaths(target,k,sign);
  const all = k.map((_,j) => countPaths(target,k.slice(j).concat(k.slice(0,j)),sign));
  const ordinary = target.map((v,j) => mod(v-sign*k[j%k.length]));
  assert.deepEqual(ordinary.map((v,j) => mod(v+sign*k[j%k.length])),target);
  variants.push({reverse,sign,fixed,allPhaseMax:Math.max(...all.map(v=>v.prefix)),
    completePhases:all.filter(v=>v.prefix===target.length).length,control,
    ordinaryIoC:ioc(ordinary),ordinaryPrefix:ordinary.slice(0,50).map(i=>corpus.translit[i]).join('')});
}
console.log(JSON.stringify({key,targetLength:target.length,variants},null,2));
