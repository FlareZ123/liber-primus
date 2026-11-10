"use strict";

/**
 * Exact two-anchor inversion of a single, unknown 29-symbol monoalphabetic
 * bijection across two independent red chapter headings. Each printed
 * ciphertext word can contain zero or one arbitrary inserted null rune.
 *
 * One complete English GP word must map injectively onto every remaining
 * ciphertext symbol. Both source words are chosen by original red ink,
 * not after inspecting language scores. This is a bounded dictionary test,
 * not a substitute for finding the true cipher or its key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {lexicon} = require("./red_verse_dictionary_anchor.cjs");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const annotations = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const manuscript = fs.readFileSync(
  path.join(ROOT, "resources/lp2-transcription.txt"), "utf8").split("%");
const index = new Map(corpus.runes.map((r, i) => [r, i]));

function firstRedHeading(page) {
  const annotation = annotations.pages.find(p => p.page === page);
  const span = annotation.red_spans.find(s => s.start === 0);
  assert.ok(span, "missing original full-red chapter heading");
  let count = 0, text = "";
  for (const ch of manuscript[page]) {
    if (index.has(ch)) {
      if (count === span.length) break;
      text += ch;
      count++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Typographical wrapping does not split a word.
    } else if (count < span.length) {
      text += ch;
    }
  }
  assert.equal(count, span.length);
  assert.equal(Array.from(text).filter(c => index.has(c)).join(""), span.runes);
  return (text.match(/[\u16a0-\u16ff]+/gu) || []).map(
    word => Array.from(word, c => index.get(c)));
}

/** @param {number[]} letters */
function signature(letters) {
  const ids = new Map();
  return letters.map(c => {
    if (!ids.has(c)) ids.set(c, ids.size);
    return ids.get(c);
  }).join(",");
}

function indexLexicon() {
  const lex = lexicon();
  const byPattern = new Map();
  for (const item of lex.words.values()) {
    const key = item.indices.length + ":" + signature(item.indices);
    if (!byPattern.has(key)) byPattern.set(key, []);
    byPattern.get(key).push(item);
  }
  return byPattern;
}

/**
 * @param {number[]} word
 * @param {Map<string,object[]>} byPattern
 * @param {number} maxInsertion 0 or 1
 */
function candidates(word, byPattern, maxInsertion) {
  const choices = [];
  for (let omit = -1; omit < (maxInsertion ? word.length : 0); omit++) {
    const ciphertext = word.filter((_, i) => i !== omit);
    const key = ciphertext.length + ":" + signature(ciphertext);
    for (const entry of byPattern.get(key) || [])
      choices.push({
        text:entry.english,
        freq:entry.freq,
        plain:entry.indices,
        cipher:ciphertext,
        omit
      });
  }
  return choices;
}

/**
 * Test a *single* shared injective source-to-cipher alphabet.
 * @param {object} left
 * @param {object} right
 */
function compatible(left, right) {
  const c2p = new Int16Array(29).fill(-1);
  const p2c = new Int16Array(29).fill(-1);
  for (const item of [left, right]) {
    for (let i = 0; i < item.plain.length; i++) {
      const c = item.cipher[i], p = item.plain[i];
      if ((c2p[c] !== -1 && c2p[c] !== p) ||
          (p2c[p] !== -1 && p2c[p] !== c)) return false;
      c2p[c] = p;
      p2c[p] = c;
    }
  }
  return true;
}

/** @param {object[]} a @param {object[]} b */
function jointCandidates(a, b) {
  let count = 0;
  const examples = [];
  for (const x of a) for (const y of b) {
    if (!compatible(x, y)) continue;
    count++;
    if (examples.length < 12)
      examples.push({first:x.text, firstOmit:x.omit,
        second:y.text, secondOmit:y.omit});
  }
  return {totalPairs:a.length * b.length, compatiblePairs:count, examples};
}

/** Deterministic positive with unknown 29-symbol alphabet, two word nulls. */
function positiveTest(byPattern) {
  const source = lexicon().words;
  const first = [...source.values()].find(x => x.english === "grandmother");
  const second = [...source.values()].find(x => x.english === "complicated");
  assert.equal(first.indices.length, 10);
  assert.equal(second.indices.length, 11);
  let state = 0x1807f0e3;
  const rnd = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const perm = Array.from({length:29}, (_, i) => i);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = rnd() % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const c1 = first.indices.map(i => perm[i]);
  const c2 = second.indices.map(i => perm[i]);
  c1.splice(5, 0, 7);
  c2.splice(11, 0, 19);
  const a = candidates(c1, byPattern, 1), b = candidates(c2, byPattern, 1);
  const x = a.find(x => x.text === "grandmother" && x.omit === 5);
  const y = b.find(x => x.text === "complicated" && x.omit === 11);
  assert.ok(x && y && compatible(x, y),
    "planted unknown alphabet and both inserted nulls must invert exactly");
  const decoded = jointCandidates(a,b);
  assert.ok(decoded.compatiblePairs >= 1);
  return {first:"grandmother", second:"complicated",
    trueNullPositions:[5, 11], exactRecovered:true,
    compatibleCandidates:decoded.compatiblePairs};
}

function main() {
  const first = firstRedHeading(3);
  const second = firstRedHeading(27);
  assert.deepEqual(first.map(x => x.length), [2,11,3]);
  assert.deepEqual(second.map(x => x.length), [3,12,4]);
  const a = first[1], b = second[1];
  const byPattern = indexLexicon();
  const strictA = candidates(a, byPattern, 0);
  const strictB = candidates(b, byPattern, 0);
  const paddedA = candidates(a, byPattern, 1);
  const paddedB = candidates(b, byPattern, 1);
  const strict = jointCandidates(strictA,strictB);
  const padded = jointCandidates(paddedA,paddedB);
  assert.equal(strictB.length, 0);
  assert.equal(padded.compatiblePairs,0);
  const plant = positiveTest(byPattern);
  process.stdout.write(JSON.stringify({
    source:"original LP2 red headings, physical pages 3 and 27",
    wordLengths:[11,12],
    dictionaryGPWords:lexicon().words.size,
    exact:{individualCandidates:[strictA.length,strictB.length],...strict},
    atMostOneNullEach:{
      individualCandidates:[paddedA.length,paddedB.length],...padded
    },
    plantedExactInverse:plant,
    interpretation:"Finite English lexicon and shared arbitrary bijection excluded; no manuscript plaintext or real key."
  }, null, 2)+"\n");
}

if (require.main === module) main();
module.exports = {firstRedHeading, signature, candidates, compatible, jointCandidates};
