"use strict";
/**
 * SFT: original p0 and p1 matching black-cross artwork as a candidate
 * common GP29 additive pad, granting both directions and signs.
 * A common unknown keystream cancels as C0-C1=P0-P1 (same sign) or
 * C0+C1=P0+P1 (opposing signs). A reversed p1 reading is a source-cued
 * candidate; each model is tested against exact original word boundaries.
 *
 * The dynamic program grants every possible GP29 plaintext pair, and
 * minimizes how many source-printed words cannot belong to the generous
 * native-GP English lexicon. Page-edge word fragments are free and unscored.
 *
 * Run: node sims/lp2_p0_p1_cross_sharedpad_sft.cjs
 * Reads committed source files; no network, file writes or extra packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const alphabet = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function toRunes(text) {
  const normalized = text.toUpperCase().replace(/[KVZQ]/g, ch =>
    ({K:"C", V:"U", Z:"S", Q:"C"})[ch]);
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const hit = alphabet.find(x => normalized.startsWith(x.s, i));
    if (hit) {
      out.push(hit.i);
      i += hit.s.length;
    } else i++;
  }
  return out;
}

/* Printed '-' and '.' delimiters; '/' and page marks do not end a word. */
const symbols = [], classes = [];
let buffered = [];
function endWord() {
  for (let i = 0; i < buffered.length; i++) {
    classes.push(buffered.length === 1 ? 3
      : i === 0 ? 0 : i === buffered.length - 1 ? 2 : 1);
  }
  symbols.push(...buffered);
  buffered = [];
}
for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
  if (runeIndex.has(ch)) buffered.push(runeIndex.get(ch));
  else if (ch === "-" || ch === ".") endWord();
}
endWord();

const original = gp.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(symbols.slice(0, original.length), original);
const pages = new Map();
let start = 0;
for (const p of gp.pages.filter(p => p.page < 56)) {
  pages.set(p.page, {
    runes: p.indices,
    classes: classes.slice(start, start + p.indices.length)
  });
  start += p.indices.length;
}
assert.equal(start, 12956);
assert.deepEqual([0,1].map(i => pages.get(i).runes.length), [262,266]);

/** @typedef {{edges: Map<number, number>, terminal: boolean}} TrieNode */
/** @type {TrieNode[]} */
const trie = [{edges: new Map(), terminal: false}];
const dictionary = new Set();
const dictByLength = new Map();
let inputRows = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split("\n")) {
  const m = /^([a-z]+) (\d+)$/.exec(line);
  if (!m) continue;
  inputRows++;
  const tokens = toRunes(m[1]);
  dictionary.add(tokens.join(","));
  if (!dictByLength.has(tokens.length)) dictByLength.set(tokens.length, []);
  dictByLength.get(tokens.length).push(tokens);
  let node = 0;
  for (const symbol of tokens) {
    let next = trie[node].edges.get(symbol);
    if (next === undefined) {
      next = trie.length;
      trie[node].edges.set(symbol, next);
      trie.push({edges: new Map(), terminal: false});
    }
    node = next;
  }
  trie[node].terminal = true;
}
assert.equal(inputRows, 29157);
assert.equal(dictionary.size, 29061);
assert.equal(trie.length, 74946);

/**
 * Exactly minimize total non-dictionary COMPLETE words over all pairs of GP29
 * plaintexts satisfying the key-independent difference at each position.
 * Original page carry-prefixes and unfinished final words are uncharged.
 *
 * @param {number} pa
 * @param {number} pb
 * @param {number[]} [cipherA]
 * @param {number[]} [cipherB]
 * @returns {{n:number,minOov:number,firstForced:number|null,maxStates:number,
 *   completeWords:number[], checkpoints:number[][]}}
 */
function minOov(pa, pb, cipherA, cipherB, reverseB=false, op="diff") {
  const a = pages.get(pa);
  const plainB = pages.get(pb);
  const b = reverseB ? {
    runes: [...plainB.runes].reverse(),
    classes: [...plainB.classes].reverse().map(x => x === 0 ? 2 : x === 2 ? 0 : x)
  } : plainB;
  const ca = cipherA || a.runes;
  const cb = cipherB ? (reverseB ? [...cipherB].reverse() : cipherB) : b.runes;
  const n = Math.min(a.runes.length, b.runes.length);
  const unknown = trie.length;
  const base = unknown + 1;
  const firstA = a.classes[0] === 1 || a.classes[0] === 2 ? unknown : 0;
  const firstB = b.classes[0] === 1 || b.classes[0] === 2 ? unknown : 0;
  let states = new Map([[firstA * base + firstB, 0]]);
  let maxStates = states.size;
  let firstForced = null;
  const checkpoints = [];

  for (let t = 0; t < n; t++) {
    const endA = a.classes[t] === 2 || a.classes[t] === 3;
    const endB = b.classes[t] === 2 || b.classes[t] === 3;
    const delta = (ca[t] + (op === "diff" ? -cb[t] : cb[t]) + 29) % 29;
    const next = new Map();
    for (const [key, cost] of states) {
      const nodeA = Math.floor(key / base);
      const nodeB = key % base;
      for (let runeA = 0; runeA < 29; runeA++) {
        const runeB = (op === "diff" ? runeA - delta + 29 : delta - runeA + 29) % 29;
        let newA = nodeA === unknown ? unknown
          : trie[nodeA].edges.get(runeA);
        let newB = nodeB === unknown ? unknown
          : trie[nodeB].edges.get(runeB);
        let extra = 0;
        if (newA === undefined) {
          newA = unknown;
          extra++;
        } else if (endA && newA !== unknown && !trie[newA].terminal) {
          extra++;
        }
        if (newB === undefined) {
          newB = unknown;
          extra++;
        } else if (endB && newB !== unknown && !trie[newB].terminal) {
          extra++;
        }
        const dest = (endA ? 0 : newA) * base + (endB ? 0 : newB);
        const candidate = cost + extra;
        const prior = next.get(dest);
        if (prior === undefined || candidate < prior)
          next.set(dest, candidate);
      }
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
    let least = Infinity;
    for (const cost of states.values()) least = Math.min(least, cost);
    if (least > 0 && firstForced === null) firstForced = t;
    if ((t + 1) % 50 === 0 || t === n - 1)
      checkpoints.push([t + 1, least, states.size]);
    assert(states.size <= 100000, "unexpected DP state explosion");
  }
  return {
    n, minOov: Math.min(...states.values()), firstForced, maxStates,
    completeWords: [a,b].map(p => p.classes.slice(0, n)
      .filter(c => c === 2 || c === 3).length),
    checkpoints
  };
}


const variants = [
  {reverseB:false, op:"diff"}, {reverseB:false, op:"sum"},
  {reverseB:true, op:"diff"}, {reverseB:true, op:"sum"}
];
const originals = variants.map(v => ({ ...v,
  ...minOov(0, 1, undefined, undefined, v.reverseB, v.op)
}));
assert.deepEqual(originals.map(x => x.minOov), [14, 16, 15, 15]);
assert.deepEqual(originals.map(x => x.firstForced), [12, 12, 8, 9]);

/* Build native-GP controls from unchanged Gibran words of matching lengths. */
const gibranWords = read("resources/control/gibran_prophet_58585.txt")
  .toUpperCase().match(/[A-Z]+/g).map(toRunes).filter(w => w.length);
assert.equal(gibranWords.length, 15733);
const sourceByLength = new Map();
let nativeOov = 0;
for (const word of gibranWords) {
  if (!sourceByLength.has(word.length)) sourceByLength.set(word.length, []);
  sourceByLength.get(word.length).push(word);
  if (!dictionary.has(word.join(","))) nativeOov++;
}
assert.equal(nativeOov, 292);
let seed = 0x3301650;
/** @param {number} n @returns {number} */
function randomInt(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % n;
}

/** @param {number} page */
function nativePlant(page) {
  const layout = pages.get(page).classes;
  const output = [], status = {
    scoredWords: 0, nativeOov: 0, randomFragments: 0, gibranFallbacks: 0
  };
  for (let i = 0; i < layout.length;) {
    let end = i;
    while (end < layout.length && layout[end] !== 2
      && layout[end] !== 3) end++;
    const complete = end < layout.length;
    const wholeWord = layout[i] === 0 || layout[i] === 3;
    if (complete && wholeWord) {
      const length = end - i + 1;
      let options = sourceByLength.get(length);
      if (!options || !options.length) {
        options = dictByLength.get(length);
        status.gibranFallbacks++;
      }
      assert(options && options.length);
      const selected = options[randomInt(options.length)];
      output.push(...selected);
      status.scoredWords++;
      if (!dictionary.has(selected.join(","))) status.nativeOov++;
      i = end + 1;
    } else {
      const count = complete ? end - i + 1 : layout.length - i;
      for (let j = 0; j < count; j++) output.push(randomInt(29));
      status.randomFragments += count;
      i += count;
    }
  }
  assert.equal(output.length, layout.length);
  return {output, status};
}


/* The one-pad positive plant follows the source page-word layout while
 * giving the investigator a wholly unknown per-position key.  Reversing
 * p1 also reverses the p1 word boundary classes, with start/end swapped. */
const controls = [];
for (const {reverseB, op} of variants) {
  const a = nativePlant(0), b = nativePlant(1);
  const n = Math.min(a.output.length, b.output.length);
  const K = Array.from({length:n}, () => randomInt(29));
  const independent = Array.from({length:n}, () => randomInt(29));
  const encA = a.output.map((x,t) => (x + K[t]) % 29);
  const encB = b.output.map((x,i) => {
    const t = reverseB ? b.output.length - 1 - i : i;
    if (t >= n) return x;
    const k = op === "diff" ? K[t] : 29 - K[t];
    return (x+k)%29;
  });
  const encWrongB = b.output.map((x,i) => {
    const t = reverseB ? b.output.length - 1 - i : i;
    if (t >= n) return x;
    const k = op === "diff" ? independent[t] : 29-independent[t];
    return (x+k)%29;
  });
  for (let t=0;t<n;t++) {
    const j=reverseB ? b.output.length - 1 - t : t;
    const recoveredA = (encA[t]-K[t]+29)%29;
    const recoveredB = (encB[j] + (op === "diff" ? -K[t] : K[t]) + 29)%29;
    assert.equal(recoveredA,a.output[t]);
    assert.equal(recoveredB,b.output[j]);
  }
  const good = minOov(0,1,encA,encB,reverseB,op);
  const bad = minOov(0,1,encA,encWrongB,reverseB,op);
  assert(good.minOov <= a.status.nativeOov + b.status.nativeOov + 4);
  controls.push({reverseB, op, nativeA:a.status, nativeB:b.status,
    matchedSamePad:good.minOov, independentPads:bad.minOov});
}
console.log(JSON.stringify({
  source:"Original LP2 p0+p1 shared black crosses, additive pad both signs and p1 orientations",
  pageLengths:[pages.get(0).runes.length,pages.get(1).runes.length],
  dictionary:{inputRows, gpDistinct:dictionary.size,trieNodes:trie.length},
  originals, controls
}, null,2));
