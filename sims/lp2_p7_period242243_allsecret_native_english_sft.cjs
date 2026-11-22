"use strict";
/**
 * Original LP2 p9–p14: source-p7 GF(3)^5 clock all-secret alphabet gate.
 * SFT: node sims/lp2_p7_period242243_allsecret_native_english_sft.cjs
 * Windows 11 / Node 22 / CommonJS. Read-only, deterministic.
 *
 * Any stationary state-indexed 29-symbol substitution, even with 242 or 243
 * completely secret GP29 permutations, preserves the equality count for
 * ciphertext/plaintext pairs sharing the same public state.
 * The original p7 five-red product taps motivate these candidate clock lengths,
 * but no Cicada instruction authenticates this decoder architecture.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));

/** @typedef {{r:number, p:number, offset:number}} Site */
/** @type {Site[][]} */
const words = [];
/** @type {Site[]} */
let word = [];
let page = 0;
let offset = 0;
function finishWord() {
  if (word.length) words.push(word);
  word = [];
}
for (const glyph of transcription) {
  if (glyph === "%") {
    page++;
    offset = 0;
  } else if (runeMap.has(glyph)) {
    word.push({r:runeMap.get(glyph), p:page, offset:offset++});
  } else if ("-.$&".includes(glyph)) {
    finishWord();
  }
}
finishWord();
const inChapter = x => x.p >= 9 && x.p <= 14;
const sourceWords = words.filter(w => w.some(inChapter));
const sites = sourceWords.flatMap(w => w.filter(inChapter));
const observed = sites.map(x => x.r);
assert.equal(sourceWords.length, 333);
assert.equal(sites.length, 1474);
assert.deepEqual([9,10,11,12,13,14].map(p => sites.filter(x => x.p === p).length),
  [268,263,273,261,272,137]); // original physical-page GP29 counts

const clock = {
  global242: sites.map((_, i) => i % 242),
  global243: sites.map((_, i) => i % 243),
  local242: sites.map(x => x.offset % 242),
  local243: sites.map(x => x.offset % 243)
};
/** @param {number[]} symbols @param {number[]} states */
function equalityPairs(symbols, states) {
  const counts = Array.from({length:243}, () => new Int16Array(29));
  symbols.forEach((symbol, i) => { counts[states[i]][symbol]++; });
  return counts.reduce((sum, bins) => sum + bins.reduce((v, n) => v + n*(n-1)/2, 0), 0);
}
const names = Object.keys(clock);
const original = Object.fromEntries(names.map(n => [n,equalityPairs(observed,clock[n])]));
assert.deepEqual(original, {global242:136,global243:125,local242:149,local243:137});

/** @param {number} initial */
function rng(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
const random = rng(8264123);
const tokens = gp.translit.map((s,i) => ({s,i})).sort((a,b) => b.s.length-a.s.length);
/** @param {string} word */
function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i=0;i<s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i+=3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i+=2; continue; }
    const token = tokens.find(x => s.startsWith(x.s, i));
    if (!token) return null;
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}
const solvedText = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim();
const solvedRunes = (solvedText.match(/[A-Z]+/g) || []).flatMap(w => encodeWord(w));
assert.deepEqual(solvedRunes, gp.pages.find(p => p.page === 57).indices,
  "solved LP2 p57 enforces historically correct NG/ING/IO GP29 spelling");

const corpora = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const results = {};
/** @type {number[] | undefined} */
let plant = undefined;
for (const [label, file] of corpora) {
  const content = read(file);
  const start = label === "Shakespeare" ? 0 : content.search(/\*\*\* START OF/i);
  const body = start > 0 ? content.slice(start+30) : content;
  /** @type {Map<number, number[][]>} */
  const bank = new Map();
  for (const word of body.match(/[A-Za-z]+/g) || []) {
    const vals = encodeWord(word);
    if (!vals) continue;
    if (!bank.has(vals.length)) bank.set(vals.length, []);
    bank.get(vals.length).push(vals);
  }
  assert(sourceWords.every(w => bank.has(w.length)),
    "all 333 original source-word lengths must have a native-GP donor");
  const minima = Object.fromEntries(names.map(n => [n, Infinity]));
  const totals = Object.fromEntries(names.map(n => [n, 0]));
  for (let trial=0;trial<500;trial++) {
    const candidate = sourceWords.flatMap(w => {
      const list = bank.get(w.length);
      const replacement = list[Math.floor(random()*list.length)];
      return replacement.filter((_,i) => inChapter(w[i]));
    });
    assert.equal(candidate.length, observed.length);
    if (!plant) plant = candidate.slice();
    for (const n of names) {
      const e = equalityPairs(candidate, clock[n]);
      minima[n] = Math.min(minima[n], e);
      totals[n] += e;
      assert(e > original[n],
        "native language control falls at or below the original all-secret equality count");
    }
  }
  results[label] = Object.fromEntries(names.map(n => [n,{
    minimum:minima[n], mean:totals[n]/500, matchesAtOrBelowOriginal:0
  }]));
}

// Full 29-symbol artificial per-state bijections: verify genuine planted prose
// can survive encryption, exact inverse and equality invariant in every class.
assert(plant);
const keyRng = rng(0x3301);
for (const n of names) {
  const permutation = Array.from({length:243}, () => {
    const row = Array.from({length:29}, (_,i)=>i);
    for (let j=28;j>0;j--) {
      const k = Math.floor(keyRng()*(j+1));
      [row[j],row[k]] = [row[k],row[j]];
    }
    return row;
  });
  const inverse = permutation.map(row => {
    const inv = Array(29);
    row.forEach((v,i) => {inv[v]=i;});
    assert.deepEqual(inv.slice().sort((a,b) => a-b), Array.from({length:29},(_,i)=>i));
    return inv;
  });
  const encrypted = plant.map((v,i) => permutation[clock[n][i]][v]);
  const recovered = encrypted.map((v,i) => inverse[clock[n][i]][v]);
  assert.deepEqual(recovered, plant);
  assert.equal(equalityPairs(encrypted, clock[n]), equalityPairs(plant, clock[n]));
}
console.log(JSON.stringify({scope:"original physical p9–p14",runes:1474,words:333,
  hypothesis:"any arbitrary stationary secret GP29 bijection per 242/243 phase",
  originalEquality:original,simulationsPerDonor:500,nativeControls:results,
  plantedFull29Inverse:"PASS",newPlaintext:"NONE"},null,2));
