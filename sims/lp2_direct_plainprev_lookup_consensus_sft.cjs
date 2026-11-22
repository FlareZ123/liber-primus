"use strict";

/**
 * Exact all-secret native-English consensus gate for a direct one-step
 * plaintext predecessor lookup:
 *
 * C[w,0] = P[w,0] + initialWordShift[w] (mod 29);
 * C[w,j] = P[w,j] + f(P[w,j-1]) (mod 29), j >= 1.
 *
 * The same unknown, unrestricted 29-entry f is shared by all words.
 * Every initial-word shift is separately free. The input and output
 * preserve original printed word boundaries and GP29 rune count.
 *
 * The source supplies no authentic instruction to use this cipher.
 *
 * SFT: node sims/lp2_direct_plainprev_lookup_consensus_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const alphabet = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const byRune = new Map(alphabet.runes.map((r, i) => [r, i]));
const lexemes = alphabet.translit
  .map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Match the original solved-LP1 source native GP orthography.
 * ING and IO are single runes and take precedence over shorter tokens.
 * @param {string} spelling
 * @returns {number[]}
 */
function nativeGP(spelling) {
  const clean = spelling.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (clean.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const found = lexemes.find(item => clean.startsWith(item.s, i));
      assert(found, "GP encoder requires a valid source rune: " + spelling);
      result.push(found.i);
      i += found.s.length;
    }
  }
  return result;
}

/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;

/**
 * From a complete proposed native plaintext word, derive all entries
 * of the unknown f forced by the original ciphertext. A contradictory
 * repeated plaintext predecessor makes this candidate impossible.
 * @param {number[]} ciphertext
 * @param {number[]} plaintext
 * @returns {Int8Array | null}
 */
function forcedMap(ciphertext, plaintext) {
  assert.equal(ciphertext.length, plaintext.length);
  const state = new Int8Array(29).fill(-1);
  for (let j = 1; j < ciphertext.length; j++) {
    const previousPlain = plaintext[j - 1];
    const needed = mod(ciphertext[j] - plaintext[j]);
    if (state[previousPlain] !== -1 &&
        state[previousPlain] !== needed) return null;
    state[previousPlain] = needed;
  }
  return state;
}

/**
 * Two partial maps are compatible iff all shared entries agree.
 * Return -1 on contradiction and otherwise the number of shared inputs.
 * @param {Int8Array} first
 * @param {Int8Array} second
 * @returns {number}
 */
function sharedEntries(first, second) {
  let n = 0;
  for (let i = 0; i < 29; i++) {
    if (first[i] === -1 || second[i] === -1) continue;
    if (first[i] !== second[i]) return -1;
    n++;
  }
  return n;
}

const parsed = parseSharedCorpus();
const words = parsed.words.map(w => [...w.runes].map(r => {
  assert(byRune.has(r));
  return byRune.get(r);
}));
assert.equal(words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, 12956);
assert.deepEqual(words.flat(),
  alphabet.pages.filter(p => p.page < 56).flatMap(p => p.indices));

const byLength = new Map();
let dictionaryCount = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  dictionaryCount++;
  const p = nativeGP(match[1]);
  if (p.length < 10 || p.length > 14) continue;
  if (!byLength.has(p.length)) byLength.set(p.length, []);
  byLength.get(p.length).push({word: match[1], p});
}
assert.equal(dictionaryCount, 29157);

const slots = words.map((c, i) => ({i, c})).filter(x => x.c.length >= 10);
assert.equal(slots.length, 109);
assert.deepEqual([10, 11, 12, 13, 14].map(n =>
  slots.filter(x => x.c.length === n).length), [52, 32, 18, 4, 3]);

/**
 * @param {{i:number,c:number[]}[]} input
 * @returns {Array<{i:number,c:number[],candidates:Array<{word:string,a:Int8Array}>}>}
 */
function candidateTable(input) {
  return input.map(({i, c}) => ({
    i, c,
    candidates: (byLength.get(c.length) || []).flatMap(({word, p}) => {
      const a = forcedMap(c, p);
      return a === null ? [] : [{word, a}];
    })
  }));
}

/**
 * Find best fixed-f map from the 25 longest potential plaintext words
 * and count independent other words that admit an agreeing map.
 * Three shared assigned entries distinguish genuine compatibility
 * from two partial maps with mostly disjoint domains.
 * @param {ReturnType<typeof candidateTable>} data
 */
function consensus(data) {
  const anchors = data.filter(o => o.c.length >= 12);
  assert.equal(anchors.length, 25);
  let best = {strong: -1, loose: -1, originalIndex: -1, word: ""};
  for (const anchor of anchors) {
    for (const candidate of anchor.candidates) {
      let strong = 0, loose = 0;
      for (const other of data) {
        if (other === anchor) continue;
        let overlap = -1;
        for (const option of other.candidates) {
          const n = sharedEntries(candidate.a, option.a);
          if (n > overlap) overlap = n;
          if (overlap >= 3) break;
        }
        if (overlap >= 0) loose++;
        if (overlap >= 3) strong++;
      }
      if (strong > best.strong) best = {
        strong, loose, originalIndex: anchor.i, word: candidate.word
      };
    }
  }
  return {
    anchors: anchors.length,
    anchorCandidates: anchors.reduce((n, a) => n + a.candidates.length, 0),
    allCandidates: data.reduce((n, a) => n + a.candidates.length, 0),
    withoutCandidates: data.filter(a => !a.candidates.length).map(a => a.i),
    best
  };
}

const original = consensus(candidateTable(slots));
assert.equal(original.allCandidates, 18170);
assert.equal(original.anchorCandidates, 400);
assert.deepEqual(original.withoutCandidates, [754, 1353, 2341]);
assert.deepEqual(original.best, {
  strong: 1, loose: 1, originalIndex: 167, word: "unprofitable"
});

// Positive control: one genuinely non-affine, fixed 29-entry feedback
// function, original 109 long-word lengths, changing word-start keys.
// Every planted word is included in the original independent dictionary.
const feedback = p => mod(7 * p * p * p + 11 * p + 4);
const positiveSlots = slots.map((slot, i) => {
  const choices = byLength.get(slot.c.length);
  const p = choices[i % choices.length].p;
  const shift = mod(3 + 13 * i);
  const c = p.map((letter, j) => j === 0 ? mod(letter + shift)
    : mod(letter + feedback(p[j - 1])));
  const decoded = [mod(c[0] - shift)];
  for (let j = 1; j < c.length; j++) {
    decoded.push(mod(c[j] - feedback(decoded[j - 1])));
  }
  assert.deepEqual(decoded, p, "complete nontrivial native inverse");
  assert.deepEqual(c, p.map((letter, j) => j === 0
    ? mod(letter + shift) : mod(letter + feedback(p[j - 1]))));
  return {i: slot.i, c};
});
const planted = consensus(candidateTable(positiveSlots));
assert.equal(planted.best.strong, 108);
assert.equal(planted.best.loose, 108);
assert.equal(planted.allCandidates, 18378);
assert.equal(planted.withoutCandidates.length, 0);
assert.equal(planted.best.word, "antechambers");

console.log(JSON.stringify({
  status: "bounded all-secret direct plaintext predecessor feedback rejection",
  original, planted,
  originalRunes: parsed.runeCount,
  originalPrintedWords: parsed.words.length,
  crossPageWords: parsed.crossPageWords,
  model: "Cj=Pj+f(Pprev), 29 unrestricted fixed lookup entries",
  historicalSourceSelected: false,
  unknownPlaintextRecovered: false
}, null, 2));
