'use strict';
/**
 * Exact all-secret shared affine GP29 pad test for three original insect pages.
 * Node.js 22 CommonJS SFT, no dependencies, no fitted cipher state or beam.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const letters = corpus.translit.map(x => x.toLowerCase());
const alphabet = new Map(letters.map((v, i) => [v, i]));
const digraphs = ['th', 'ng', 'eo', 'oe', 'ae', 'ia', 'ea'];
const pages = [24, 25, 26];
const offsets = [3, 2, 1];
const LEN = 53;
const MOD = 29;
const RADIX = 65536;
const RADIX2 = RADIX * RADIX;
const mod = x => ((x % MOD) + MOD) % MOD;
/** @param {string} word @returns {number[] | null} */
function gp(word) {
  const s = word.toLowerCase().replace(/qu/g, 'cw').replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = digraphs.find(x => s.startsWith(x, i)) || s[i];
    const v = alphabet.get(token);
    if (v === undefined) return null;
    out.push(v);
    i += token.length;
  }
  return out;
}
/** @returns {number[][][]} */
function originalPages() {
  return pages.map(page => {
    const text = segments[page].replace(/\/\s*/g, '');
    const words = [...text.matchAll(/[\u16a0-\u16ff]+/g)].map(m => [...m[0]].map(r => corpus.runes.indexOf(r)));
    assert(words.every(w => w.every(i => i >= 0)));
    assert.deepEqual(words.flat(), corpus.pages[page].indices, 'page ' + page + ' original rune identity');
    return words;
  });
}
const wordsByLength = new Map();
const seen = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!m || m[1].length < 2) continue;
  const word = gp(m[1]);
  if (!word || word.length > 15) continue;
  const len = word.length, key = word.join(',');
  if (!wordsByLength.has(len)) { wordsByLength.set(len, []); seen.set(len, new Set()); }
  if (seen.get(len).has(key)) continue;
  seen.get(len).add(key);
  wordsByLength.get(len).push({values: word, count: Number(m[2])});
}
// Single-runic TH and OE exist in the pinned lexical source. The singletons
// below add A/I/O, deliberately making this finite vocabulary permissive.
for (const w of ['a', 'i', 'o']) {
  const v = gp(w), key = v.join(',');
  if (!seen.get(1).has(key)) {
    wordsByLength.get(1).push({values: v, count: 1});
    seen.get(1).add(key);
  }
}
assert.equal(wordsByLength.get(1).length, 5);
// One trie per word length. Each node stores an array of [rune,nextNode] and
// 29 indexed outgoing edges. Index 0 denotes a fresh source-printed word.
const tries = new Map();
for (const [len, words] of wordsByLength) {
  const nodes = [{edges: new Int32Array(29).fill(-1), active: []}];
  for (const word of words) {
    let node = 0;
    for (const rune of word.values) {
      let target = nodes[node].edges[rune];
      if (target === -1) {
        target = nodes.length;
        nodes[node].edges[rune] = target;
        nodes[node].active.push([rune, target]);
        nodes.push({edges: new Int32Array(29).fill(-1), active: []});
      }
      node = target;
    }
  }
  assert(nodes.length < RADIX, 'trie length ' + len + ' node overflow');
  tries.set(len, nodes);
}
/** @param {number[][]} words @param {number} off @returns {{v:number,n:number,first:boolean}[]} */
function slots(words, off) {
  return words.flatMap(w => w.map((v, i) => ({v, n: w.length, first: i === 0}))).slice(off, off + LEN);
}
const wordSets = originalPages();
const original = wordSets.map((ws, i) => slots(ws, offsets[i]));
assert.deepEqual(wordSets.map(ws => ws.flat().length), [270, 273, 265]);
assert(original.every(s => s.length === LEN));
// Exact finite-state search. Each state is a triple of trie-node indices
// packed into a lossless Number (< 2^48), keeping *every* legal candidate.
const INV = new Int32Array(MOD);
for (let a = 1; a < MOD; a++) {
  for (let b = 1; b < MOD; b++) if (a * b % MOD === 1) INV[a] = b;
  assert(INV[a] !== 0);
}
/** @param {{v:number,n:number,first:boolean}[][]} tracks @param {string} tag @returns {{failure:number|null,states:number,max:number,at50:number,at51:number}} */
function exact(tracks, tag) {
  const start = Date.now();
  let states = new Set([0]), max = 1, at50 = -1, at51 = -1;
  for (let t = 0; t < LEN; t++) {
    const p = tracks.map(x => x[t]);
    const c = p.map(x => x.v);
    let i = 0, j = 1, k = 2;
    if (c[0] === c[1] && c[0] !== c[2]) { j = 2; k = 1; }
    const allSame = c[0] === c[1] && c[1] === c[2];
    const factor = allSame ? 0 : mod((c[k] - c[i]) * INV[mod(c[j] - c[i])]);
    const nodes = p.map(s => tries.get(s.n));
    assert(nodes.every(Boolean));
    const next = new Set();
    for (const packed of states) {
      const a = packed % RADIX;
      const b = Math.floor(packed / RADIX) % RADIX;
      const d = Math.floor(packed / RADIX2);
      const sourceNodes = [a, b, d].map((index, track) => nodes[track][p[track].first ? 0 : index]);
      if (allSame) {
        const e1 = sourceNodes[1].edges, e2 = sourceNodes[2].edges;
        for (const [r, v] of sourceNodes[0].active) {
          const w = e1[r], z = e2[r];
          if (w >= 0 && z >= 0) next.add(v + RADIX * w + RADIX2 * z);
        }
      } else {
        for (const [u, v] of sourceNodes[i].active) {
          for (const [w, x] of sourceNodes[j].active) {
            if (u === w) continue;
            const z = sourceNodes[k].edges[mod(u + factor * (w - u))];
            if (z < 0) continue;
            const destination = [0, 0, 0];
            destination[i] = v; destination[j] = x; destination[k] = z;
            next.add(destination[0] + RADIX * destination[1] + RADIX2 * destination[2]);
          }
        }
      }
    }
    max = Math.max(max, next.size);
    if (t === 50) at50 = next.size;
    if (t === 51) at51 = next.size;
    if (t < 5 || t === 8 || t >= 47 || t % 10 === 0) {
      console.log(tag, 't='+t, 'exactStates='+next.size, 'max='+max, 'elapsedMs='+(Date.now()-start));
    }
    if (next.size === 0) return {failure:t,states:0,max,at50,at51};
    states = next;
  }
  return {failure:null,states:states.size,max,at50,at51};
}
/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return bound => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % bound;
  };
}
// Frozen controls draw source-native words from the top thirty frequency forms
// at every original physical word length. Preserve all printed split locations.
const random = rng(20261122);
const plaintextWordSets = wordSets.map(words => words.map(w => {
  const source = wordsByLength.get(w.length);
  assert(source && source.length);
  const top = source.slice().sort((a, b) => b.count - a.count).slice(0, 30);
  return top[random(top.length)].values;
}));
const plain = plaintextWordSets.map((ws, i) => slots(ws, offsets[i]));
const a = Array.from({length:LEN}, () => 1+random(28));
const b = Array.from({length:LEN}, () => random(29));
const shared = plain.map(s => s.map((q, t) => ({...q,v:mod(a[t]*q.v+b[t])})));
assert(plain.every((track, j) => track.every((q,t) => shared[j][t].v === mod(a[t]*q.v+b[t]))));
console.log('SOURCE exact pages '+pages.join(',')+' rune counts '+wordSets.map(ws=>ws.flat().length).join(',')+' aligned first-complete offsets '+offsets.join(','));
const real = exact(original, 'ORIGINAL');
assert.deepEqual({failure:real.failure,at50:real.at50,at51:real.at51}, {failure:52,at50:10,at51:2});
const planted = exact(shared, 'SHARED-AFFINE-POSITIVE');
assert.equal(planted.failure, null);
assert(planted.states >= 1);
console.log('PASS exact impossibility of original shared affine pad at 53rd rune, positive shared-affine native control survives 53/53');
console.log('ORIGINAL', JSON.stringify(real), 'POSITIVE', JSON.stringify(planted));
