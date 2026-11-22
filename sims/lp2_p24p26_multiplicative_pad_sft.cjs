'use strict';
/** GP29 shared multiplicative pad, original source and native-English calibration. Node 22 CJS. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const gp = ['f','u','th','o','r','c','g','w','h','n','i','j','eo','p','x','s','t','b','e','m','l','ng','oe','d','a','ae','y','ia','ea'];
assert.deepEqual(corpus.translit.map(s => s.toLowerCase()), gp);
const symbol = new Map(gp.map((s, i) => [s, i]));
const digraph = ['th','ng','eo','oe','ae','ia','ea'];
/** @param {string} word @returns {number[] | null} */
function encode(word) {
  const s = word.toLowerCase().replace(/qu/g, 'cw').replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = digraph.find(x => s.startsWith(x, i)) || s[i];
    if (!symbol.has(token)) return null;
    out.push(symbol.get(token));
    i += token.length;
  }
  return out;
}
/** @param {number} page @returns {number[][]} */
function source(page) {
  const s = segments[page < 50 ? page : page - 1].replace(/\/\s*/g, '');
  const words = [...s.matchAll(/[\u16a0-\u16ff]+/g)].map(m => [...m[0]].map(r => {
    const n = corpus.runes.indexOf(r);
    assert(n >= 0); return n;
  }));
  assert.deepEqual(words.flat(), corpus.pages[page].indices);
  return words;
}
const candidates = new Map();
const unique = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (!m || m[1].length < 2) continue;
  const w = encode(m[1]);
  if (!w || w.length > 15) continue;
  if (!candidates.has(w.length)) { candidates.set(w.length, []); unique.set(w.length, new Set()); }
  const id = w.join(',');
  if (unique.get(w.length).has(id)) continue;
  unique.get(w.length).add(id);
  candidates.get(w.length).push(w);
}
candidates.set(1, ['a','i','o'].map(encode));
/** @param {number[][]} words */
function trie(words) {
  const nodes = [new Map()];
  for (const word of words) {
    let node = 0;
    for (const r of word) {
      if (!nodes[node].has(r)) { nodes[node].set(r, nodes.length); nodes.push(new Map()); }
      node = nodes[node].get(r);
    }
  }
  return nodes;
}
const tries = new Map([...candidates].map(([n, options]) => [n, trie(options)]));
assert.deepEqual([...Array(11)].map((_, i) => candidates.get(i + 1).length), [3,181,720,1954,3261,4543,4796,4335,3518,2474,1611]);
/** @param {number[][]} words @param {number} off @param {number} n */
const slots = (words, off, n) => words.flatMap(w => w.map((v, i) => ({ v, first: i === 0, len: w.length }))).slice(off, off + n);
/**
 * Invert C_a=K_i*P_a, C_b=K_i*P_b over GF(29), with arbitrary nonzero K_i.
 * Existence condition P_a*C_b=P_b*C_a, and zero iff zero for each stream.
 * @param {ReturnType<typeof slots>} a
 * @param {ReturnType<typeof slots>} b
 */
function test(a, b) {
  assert.equal(a.length, b.length);
  let states = [[0, 0]], max = 1;
  for (let t = 0; t < a.length; t++) {
    const left = tries.get(a[t].len), right = tries.get(b[t].len);
    assert(left && right);
    const next = new Map();
    for (let [x, y] of states) {
      if (a[t].first) x = 0;
      if (b[t].first) y = 0;
      for (const [p, nx] of left[x]) {
        if ((p === 0) !== (a[t].v === 0)) continue;
        for (const [q, ny] of right[y]) {
          if ((q === 0) !== (b[t].v === 0)) continue;
          if ((p * b[t].v - q * a[t].v) % 29 === 0) next.set(nx + ',' + ny, [nx, ny]);
        }
      }
    }
    if (next.size === 0) return { failure: t, states: 0, max };
    max = Math.max(max, next.size);
    states = [...next.values()];
  }
  return { failure: null, states: states.length, max };
}
/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return bound => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state % bound; };
}
/** @param {number[][]} words @param {(n:number)=>number} random */
function nativeWords(words, random) {
  return words.map(w => {
    const list = candidates.get(w.length);
    assert(list && list.length);
    return list[random(list.length)];
  });
}
const a = source(24), b = source(26), near = source(25);
assert.deepEqual([a.flat().length, near.flat().length, b.flat().length], [270, 273, 265]);
for (const [name, x, y, ox, oy, failure] of [
  ['p24/p26 complete-word', a, b, 3, 1, 10],
  ['p24/p26 page-origin', a, b, 0, 0, 2],
  ['p24/p25 near-art', a, near, 3, 0, 33],
]) {
  const r = test(slots(x, ox, 250), slots(y, oy, 250));
  console.log('ORIGINAL ' + name + ': first impossible rune index ' + r.failure + '; max states ' + r.max);
  assert.equal(r.failure, failure);
}
const random = rng(424242);
const plainA = slots(nativeWords(a, random), 3, 250);
const plainB = slots(nativeWords(b, random), 1, 250);
const keyrng = rng(123456);
const key = plainA.map(() => 1 + keyrng(28));
const encrypt = (p, k) => p.map((s, i) => ({ ...s, v: s.v * k[i] % 29 }));
const encA = encrypt(plainA, key), encB = encrypt(plainB, key);
const positive = test(encA, encB);
assert.equal(positive.failure, null);
assert(positive.states >= 1);
assert(plainA.every((s, i) => s.v * key[i] % 29 === encA[i].v));
assert(plainB.every((s, i) => s.v * key[i] % 29 === encB[i].v));
console.log('POSITIVE full 250/250 shared-key forward reconstruction: ' + JSON.stringify(positive));
const independent = test(encA, encrypt(plainB, plainB.map(() => 1 + keyrng(28))));
assert(independent.failure !== null);
console.log('NEGATIVE independent-key plant: ' + JSON.stringify(independent));
console.log('PASS original, positive and negative source-shaped controls');
