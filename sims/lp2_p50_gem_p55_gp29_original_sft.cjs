'use strict';
/**
 * SFT: source-GEM GP29 Vigenere inversion, original LP2 p55 and p53 red,
 * with solved-page F-passthrough and p57 native GP positive plants.
 * Node.js 22, CommonJS; reads canonical checked-in resources without writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const corpus = load('lp2-corpus.json');
const table = load('lp2-grid-256.json').bytes;
const ink = load('lp2-ink-annotations.json');
const page = (n) => corpus.pages.find((p) => p.page === n);
const rotate = (a, n) => a.slice(n).concat(a.slice(0, n));
const nthPrime = (k) => {
  let count = 0;
  for (let x = 2;; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime && ++count === k) return x;
  }
};
const move = (oneBasedCell) => {
  const i = oneBasedCell - 1;
  const q = Math.floor(table[i] / 29);
  const r = Math.floor(i / 8) + [1,1,1,0,0,0,-1,-1,-1][q];
  const c = i % 8 + [-1,0,1,-1,0,1,-1,0,1][q];
  return r >= 0 && r < 32 && c >= 0 && c < 8 ? r * 8 + c + 1 : null;
};

/** @param {number[]} plain @param {number[]} key */
const encode = (plain, key) => {
  let k = 0;
  return plain.map(p => p === 0 ? 0 : (p + key[k++ % key.length]) % 29);
};
/**
 * Exact inverse: ciphertext F permits bypass or encrypted non-F;
 * nonzero ciphertext must never decrypt to plaintext F.
 * @param {number[]} ciphertext @param {number[]} key
 */
const decode = (ciphertext, key) => {
  let states = [{ k: 0, p: [], skips: [] }];
  for (let i = 0; i < ciphertext.length; i++) {
    const next = [];
    for (const state of states) {
      if (ciphertext[i] === 0) next.push({ k: state.k, p: state.p.concat(0), skips: state.skips.concat(i) });
      const p = (ciphertext[i] - key[state.k % key.length] + 29) % 29;
      if (p !== 0) next.push({ k: state.k + 1, p: state.p.concat(p), skips: state.skips });
    }
    states = next;
    if (states.length === 0) return { states, firstImpossible: i };
  }
  return { states, firstImpossible: null };
};

assert.equal(nthPrime(103), 563);
assert.equal(nthPrime(104), 569);
assert.equal(table.length, 256);
const originalRoute = [103,111,119,127,128,119];
assert.deepEqual(originalRoute.slice(0,-1).map(move), originalRoute.slice(1));
assert.deepEqual(originalRoute.slice(0,-1).map(i => corpus.translit[table[i-1]%29]), ['O','O','G','E','M']);
const gem = originalRoute.slice(2,5).map(i => table[i-1] % 29);
assert.deepEqual(gem, [6,18,19]);
const p55 = page(55).indices;
assert.equal(p55.length, 76);
assert.deepEqual(p55.flatMap((x,i) => x===0 ? [i] : []), [15,25,41]);
const span = ink.pages.find(p=>p.page===53).red_spans.find(s=>s.start===128 && s.length===51);
assert.ok(span);
const red53 = page(53).indices.slice(span.start,span.start+span.length);
assert.equal(red53.map(x=>corpus.runes[x]).join(''), span.runes);
const native = page(57).indices;
assert.equal(native.length,95);
const results = [];
for (let phase = 0; phase < 3; phase++) {
  const key = rotate(gem,phase);
  const full = decode(p55,key);
  const suffix = decode(p55.slice(1),key);
  const red = decode(red53,key);
  assert.equal(full.states.length,0);
  assert.equal(suffix.states.length,0);
  const plant = encode(native,key);
  const recovered = decode(plant,key);
  assert.ok(recovered.states.some(s => s.p.length===native.length && s.p.every((x,i)=>x===native[i])));
  for (const s of recovered.states) assert.deepEqual(encode(s.p,key),plant);
  for (const s of red.states) assert.deepEqual(encode(s.p,key),red53);
  results.push({phase,key:key.map(i=>corpus.translit[i]).join(''),p55FirstImpossible:full.firstImpossible,
    p55SuffixFirstImpossible:suffix.firstImpossible,p53RedValidMasks:red.states.length,
    p57PlantExact:true});
}
const oogem = originalRoute.slice(0,-1).map(i=>table[i-1]%29);
assert.deepEqual(oogem,[3,3,6,18,19]);
const remaining = decode(p55,oogem);
assert.equal(remaining.states.length,1);
assert.deepEqual(encode(remaining.states[0].p,oogem),p55);
console.log(JSON.stringify({sourcePath:originalRoute,gemKey:gem,results,
  OOGEMDirectRoute:{validMasks:1,translit:remaining.states[0].p.map(i=>corpus.translit[i]).join(' ')},
  conclusion:'All three GEM-cycle phases contradict full and suffix p55 under solved-page strict F-transparent Vigenere.'},null,2));
