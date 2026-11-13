"use strict";
/**
 * SFT: original LP2 all-pair page-start additive pad reuse triage.
 * Language-calibrated pair rank and exhaustive dictionary inverse on top five.
 *
 * Original p9/p11/p13 share the right stencil; p10/p12/p14 share the left.
 * A shared arbitrary key at the page start cancels as Ca[t]-Cb[t] mod29.
 *
 * The dynamic program grants every possible GP29 plaintext pair, and
 * minimizes how many source-printed words cannot belong to the generous
 * native-GP English lexicon. Page-edge word fragments are free and unscored.
 *
 * Run: node sims/lp2_allpage_commonpad_triage_sft.cjs
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
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/[KVZQ]/g, ch =>
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

assert.deepEqual(toRunes("queen").map(i => gp.translit[i]),
  ["C", "W", "E", "E", "N"], "canonical QU to CW regression");

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
assert.deepEqual([17,40,37,48,41,19,39,28,46].map(i => pages.get(i).runes.length),
  [273,231,228,271,273,271,240,269,270]);

/** @typedef {{edges: Map<number, number>, terminal: boolean}} TrieNode */
/** @type {TrieNode[]} */
const trie = [{edges: new Map(), terminal: false}];
const dictionary = new Set();
const dictByLength = new Map();
let inputRows = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/)) {
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
assert.equal(dictionary.size, 29062);
assert.equal(trie.length, 74970);

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
function minOov(pa, pb, cipherA, cipherB) {
  const a = pages.get(pa);
  const b = pages.get(pb);
  const ca = cipherA || a.runes;
  const cb = cipherB || b.runes;
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
    const delta = (ca[t] - cb[t] + 29) % 29;
    const next = new Map();
    for (const [key, cost] of states) {
      const nodeA = Math.floor(key / base);
      const nodeB = key % base;
      for (let runeA = 0; runeA < 29; runeA++) {
        const runeB = (runeA - delta + 29) % 29;
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

const PAIRS = [[17,40],[37,48],[17,41],[19,39],[28,46]];
const originals = PAIRS.map(([a,b]) =>
  ({pair:[a,b], ...minOov(a,b)}));
assert.deepEqual(originals.map(x => x.minOov), [13,11,15,11,14]);
assert.deepEqual(originals.map(x => x.firstForced), [19,24,20,21,15]);

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

const controls = [];
for (const [pa,pb] of [[17,40],[37,48]]) {
  const a = nativePlant(pa);
  const b = nativePlant(pb);
  const n = Math.min(a.output.length, b.output.length);
  const samePad = Array.from({length:n}, () => randomInt(29));
  const differentPad = Array.from({length:n}, () => randomInt(29));
  const encA = a.output.slice(0,n).map((x,t) => (x+samePad[t])%29);
  const encB = b.output.slice(0,n).map((x,t) => (x+samePad[t])%29);
  const encWrongB = b.output.slice(0,n)
    .map((x,t) => (x+differentPad[t])%29);
  for (let t = 0; t < n; t++) {
    assert.equal((encA[t]-encB[t]+29)%29,
      (a.output[t]-b.output[t]+29)%29);
    assert.equal((encA[t]-samePad[t]+29)%29, a.output[t]);
    assert.equal((encB[t]-samePad[t]+29)%29, b.output[t]);
  }
  const good = minOov(pa,pb,encA,encB);
  const bad = minOov(pa,pb,encA,encWrongB);
  assert(good.minOov <= a.status.nativeOov + b.status.nativeOov,
    "shared-pad planted native texts must be feasible");
  controls.push({pair:[pa,pb], sourceA:a.status, sourceB:b.status,
    matchedSamePad:good.minOov,
    independentPads:bad.minOov});
}
assert(controls.every(x => x.independentPads > x.matchedSamePad),
  "independent pads should require more nonlexicon words in these plants");


/* Independently calibrated, key-invariant 29x29 difference-bigram scan. */
const plaintext = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .replace(/^[#].*$/gm,"").toUpperCase().replace(/QU/g,"CW")
  .replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S")
  .replace(/[^A-Z]/g,"");
const trained = toRunes(plaintext);
assert.equal(trained.length, 3529);
const bigrams = new Float64Array(841).fill(0.5);
for (let t=1; t<trained.length; t++)
  bigrams[trained[t-1]*29+trained[t]]++;
const total = bigrams.reduce((a,b) => a+b,0);
for (let t=0; t<841; t++) bigrams[t] /= total;
const differenceBigrams = new Float64Array(841);
for (let a=0;a<29;a++) for (let b=0;b<29;b++)
  for (let c=0;c<29;c++) for (let d=0;d<29;d++)
    differenceBigrams[((a-c+29)%29)*29+(b-d+29)%29] +=
      bigrams[a*29+b]*bigrams[c*29+d];
const weights = Float64Array.from(differenceBigrams, p => Math.log(841*p));
/** @param {number[]} a @param {number[]} b
 * @param {number} [ao] @param {number} [bo] @returns {number} */
function pairScore(a,b,ao=0,bo=0) {
  const n=Math.min(a.length,b.length);
  let previous=(a[ao]-b[bo]+29)%29, score=0;
  for (let t=1;t<n;t++) {
    const next=(a[(ao+t)%a.length]-b[(bo+t)%b.length]+29)%29;
    score+=weights[previous*29+next];
    previous=next;
  }
  return score;
}
const longPages = gp.pages.filter(p => p.status==="unsolved" && p.runic_count>=120);
assert.equal(longPages.length,52);
const ranked = [];
for (let i=0;i<longPages.length;i++)
  for (let j=i+1;j<longPages.length;j++) {
    const a=longPages[i],b=longPages[j];
    ranked.push({pair:[a.page,b.page],n:Math.min(a.runic_count,b.runic_count),
      llr:pairScore(a.indices,b.indices)});
  }
ranked.sort((a,b)=>b.llr-a.llr);
assert.equal(ranked.length,1326);
assert.deepEqual(ranked.slice(0,5).map(x=>x.pair),PAIRS);
let offsetSeed=0x12563377;
/** @returns {number} */
function randomOffset() {
  offsetSeed^=offsetSeed<<13;
  offsetSeed^=offsetSeed>>>17;
  offsetSeed^=offsetSeed<<5;
  return offsetSeed>>>0;
}
const nullMax=[];
for(let replicate=0;replicate<160;replicate++) {
  const offsets=longPages.map(p=>randomOffset()%p.indices.length);
  let max=-Infinity;
  for(let i=0;i<longPages.length;i++)
    for(let j=i+1;j<longPages.length;j++) {
      const a=longPages[i].indices,b=longPages[j].indices;
      max=Math.max(max,pairScore(a,b,offsets[i],offsets[j]));
    }
  nullMax.push(max);
}
nullMax.sort((a,b)=>a-b);
const nullGreater = nullMax.filter(s=>s>=ranked[0].llr).length;
assert.equal(nullGreater,34);
const screen={trainingRunes:trained.length,pairs:ranked.length,
  top:ranked.slice(0,12).map(x=>({...x,llr:+x.llr.toFixed(5)})),
  originalMaximum:+ranked[0].llr.toFixed(5),
  shiftedNullMedian:+nullMax[79].toFixed(5),
  shiftedNullP95:+nullMax[151].toFixed(5),
  nullGreater,replicates:nullMax.length};

console.log(JSON.stringify({
  screen,
  source: "LP2 52 original unsolved rune-bearing pages with >=120 runes; page-local start 0",
  dictionary:{inputRows, gpDistinct:dictionary.size, trieNodes:trie.length},
  nativeReference:{words:gibranWords.length, nonlexicon:nativeOov},
  originals, controls
}, null, 2));
