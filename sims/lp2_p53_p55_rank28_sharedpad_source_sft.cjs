"use strict";

/**
 * Original p53/p55 duplicate-moth key-reuse gate for a reversible 28-step
 * predecessor-difference encoder. Exhaustively grants every reserved GP rune
 * and every shared unknown pad value, under exact printed-word English grammar.
 *
 * Run: node sims/lp2_p53_p55_rank28_sharedpad_source_sft.cjs
 * Node 22 CommonJS. All inputs are fixed repository originals.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeOrd = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const pageWords = index => (original[index].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [])
  .map(w => [...w].map(g => runeOrd.get(g)));
const wordsA = pageWords(52);
const wordsB = pageWords(54).slice(1);
const textA = wordsA.flat();
const textB = wordsB.flat();
assert.deepEqual(textA, gp.pages[53].indices);
assert.deepEqual([gp.pages[55].indices[0], ...textB], gp.pages[55].indices);
assert.equal(textA.length, 179);
assert.equal(textB.length, 75);
assert.deepEqual(wordsB.map(w => w.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);

const gpTokens = gp.translit.map((s, index) => ({s, index}))
  .sort((a, b) => b.s.length - a.s.length);
/**
 * Independently source-calibrated GP spelling, including literal one-rune
 * ING and IO, with documented Cicada Latin folding.
 * @param {string} sourceWord
 * @returns {number[] | null}
 */
function encode(sourceWord) {
  const w = sourceWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < w.length;) {
    if (w.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (w.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = gpTokens.find(t => w.startsWith(t.s, i));
    if (!token) return null;
    out.push(token.index);
    i += token.s.length;
  }
  return out;
}
const lexicon = new Map();
for (const row of read("resources/control/english_wordfreq_textblob.txt")
  .match(/^[a-z]+\s+\d+$/gm) || []) {
  const encoded = encode(row.split(/\s+/)[0]);
  if (!encoded || encoded.length > 20) continue;
  if (!lexicon.has(encoded.length)) lexicon.set(encoded.length, new Map());
  lexicon.get(encoded.length).set(encoded.join(","), encoded);
}
const distinctLexicon = [...lexicon.values()]
  .reduce((count, bucket) => count + bucket.size, 0);
assert.ok(distinctLexicon > 29000 && distinctLexicon < 30000);

/** @param {Map<string,number[]>} words */
function makeTrie(words) {
  const nodes = [{children: new Int32Array(29).fill(-1), terminal: false}];
  for (const word of words.values()) {
    let state = 0;
    for (const rune of word) {
      let child = nodes[state].children[rune];
      if (child === -1) {
        child = nodes.length;
        nodes[state].children[rune] = child;
        nodes.push({children: new Int32Array(29).fill(-1), terminal: false});
      }
      state = child;
    }
    nodes[state].terminal = true;
  }
  return nodes;
}
const tries = new Map([...lexicon.entries()]
  .map(([length, words]) => [length, makeTrie(words)]));
function ends(words) {
  let sum = 0;
  return words.map(word => sum += word.length);
}
const endA = ends(wordsA);
const endB = ends(wordsB);
assert.equal(endA.at(-1), 179);
assert.equal(endB.at(-1), 75);
const mod = (x, n) => ((x % n) + n) % n;
const diff = (list, i) => mod(list[i] - list[i - 1], 29);
const doubletA = Array.from({length: 74}, (_, i) => i + 1)
  .filter(i => diff(textA, i) === 0);
const doubletB = Array.from({length: 74}, (_, i) => i + 1)
  .filter(i => diff(textB, i) === 0);
assert.deepEqual(doubletA, []);
assert.deepEqual(doubletB, [58]);

/**
 * Key-blind exact 75-rune, two-native-dictionary-stream compatibility.
 * Cipher is losslessly invertible with a known pad:
 *   C[i] = C[i-1] if P[i]=reserved;
 *   C[i] = C[i-1]+1+((rank_reserved(P[i])+K_i) mod28) mod29 otherwise.
 * Rank removes the reserved symbol from the ordered GP29 inventory.
 * A different starting ciphertext rune on each page is unconstrained.
 *
 * An unknown SAME K_i cancels between original pages until their first
 * escape/repeat, independent of K values and (before the escape) key-skipping.
 * The exact product-trie search grants any 29-symbol initial plaintext,
 * all dictionary words and all 28^75 possible shared keys symbolically.
 *
 * @param {number[]} a original or plant ciphertext A
 * @param {number[]} b original or plant ciphertext B
 * @param {number} reserved a GP ordinal 0..28
 */
function test(a, b, reserved) {
  let statePairs = new Map([["0,0", [0, 0]]]);
  let wordA = 0, wordB = 0;
  let maximumStates = 1;
  const cumulative = [];
  for (let offset = 0; offset < 75; offset++) {
    while (endA[wordA] <= offset) wordA++;
    while (endB[wordB] <= offset) wordB++;
    const ta = tries.get(wordsA[wordA].length);
    const tb = tries.get(wordsB[wordB].length);
    assert.ok(ta && tb);
    const finishA = endA[wordA] === offset + 1;
    const finishB = endB[wordB] === offset + 1;
    const da = offset ? diff(a, offset) : -1;
    const db = offset ? diff(b, offset) : -1;
    const next = new Map();
    for (const [left, right] of statePairs.values()) {
      for (let x = 0; x < 29; x++) {
        if (da === 0 && x !== reserved) continue;
        if (da > 0 && x === reserved) continue;
        const childA = ta[left].children[x];
        if (childA < 0 || (finishA && !ta[childA].terminal)) continue;
        for (let y = 0; y < 29; y++) {
          if (db === 0 && y !== reserved) continue;
          if (db > 0 && y === reserved) continue;
          if (da > 0 && db > 0) {
            const rankA = x - +(x > reserved);
            const rankB = y - +(y > reserved);
            if (mod(rankA - rankB - (da - db), 28) !== 0) continue;
          }
          const childB = tb[right].children[y];
          if (childB < 0 || (finishB && !tb[childB].terminal)) continue;
          const aa = finishA ? 0 : childA;
          const bb = finishB ? 0 : childB;
          next.set(aa + "," + bb, [aa, bb]);
        }
      }
    }
    statePairs = next;
    maximumStates = Math.max(maximumStates, next.size);
    cumulative.push(next.size);
    if (!next.size) {
      return {possible: false, firstImpossibleRune: offset + 1,
        maximumStates, priorStates: cumulative.at(-2) || 1};
    }
  }
  return {possible: true, finalStates: statePairs.size, maximumStates};
}
const originalResults = Array.from({length: 29},
  (_, reserved) => ({reserved, ...test(textA, textB, reserved)}));
assert.ok(originalResults.every(result => !result.possible));
assert.ok(originalResults.every(result =>
  result.firstImpossibleRune === 13 || result.firstImpossibleRune === 14));
assert.deepEqual([...new Set(originalResults.map(x =>
  x.firstImpossibleRune))].sort(), [13, 14]);

/** @returns {() => number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}
const rnd = prng(0x33015637);
const buckets = new Map([...lexicon.entries()]
  .map(([length, words]) => [length, [...words.values()]]));
function plant(words) {
  return words.flatMap(word => {
    const options = buckets.get(word.length);
    assert.ok(options && options.length);
    return options[Math.floor(rnd() * options.length)];
  });
}
const nativeA = plant(wordsA);
const nativeB = plant(wordsB);
assert.equal(nativeA.length, 179);
assert.equal(nativeB.length, 75);

/**
 * @param {number[]} plaintext
 * @param {number} reserved
 * @param {number[]} key
 * @param {number} iv
 */
function encrypt(plaintext, reserved, key, iv) {
  const out = [];
  let previous = iv;
  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext[i];
    const delta = p === reserved ? 0 :
      1 + mod(p - +(p > reserved) + key[i], 28);
    previous = mod(previous + delta, 29);
    out.push(previous);
  }
  return out;
}
function decrypt(ciphertext, reserved, key, iv) {
  const out = [];
  let previous = iv;
  for (let i = 0; i < ciphertext.length; i++) {
    const delta = mod(ciphertext[i] - previous, 29);
    const rank = mod(delta - 1 - key[i], 28);
    const p = delta === 0 ? reserved : rank + +(rank >= reserved);
    out.push(p);
    previous = ciphertext[i];
  }
  return out;
}
const keys = Array.from({length: 179},
  (_, i) => mod(17 * i + 7 * Math.floor(i / 5) + 11, 28));
const positivePlants = [];
for (const reserved of [0, 17, 28]) {
  const ca = encrypt(nativeA, reserved, keys, 5);
  const cb = encrypt(nativeB, reserved, keys, 21);
  assert.deepEqual(decrypt(ca, reserved, keys, 5), nativeA);
  assert.deepEqual(decrypt(cb, reserved, keys, 21), nativeB);
  assert.deepEqual(encrypt(decrypt(ca, reserved, keys, 5),
    reserved, keys, 5), ca);
  assert.deepEqual(encrypt(decrypt(cb, reserved, keys, 21),
    reserved, keys, 21), cb);
  const result = test(ca, cb, reserved);
  assert.ok(result.possible,
    "planted correct shared-key native plaintext must survive");
  positivePlants.push({reserved, finalStates: result.finalStates,
    nativeA: nativeA.length, nativeB: nativeB.length, exactInverse: true});
}

console.log(JSON.stringify({
  source: {p53Image: "70.jpg", p55Image: "72.jpg",
    p53Runes: 179, p55BodyRunes: 75, dictionaryWords: distinctLexicon,
    doubletPositionsP53First75: doubletA,
    doubletPositionsP55Body75: doubletB},
  model: "GF29 ciphertext predecessor plus reversible 28-rank shared key",
  original: originalResults,
  positivePlants,
  decision: "All 29 possible reserved symbols fail source-native whole-word grammar before position 15; first repeat is at position 59. This closes this conditional same-key original-rune-order model, not other keys or cipher families."
}, null, 2));
