"use strict";

/**
 * Source-frozen two-time-pad gate for LP2 physical pages 17 and 41.
 *
 * The 2014 Onion7 title 133 and div ID 331 give residues 17 and 41 modulo
 * the 58 image pages. This address operation is conjectural, not an authentic
 * instruction. Both physical pages happen to contain 273 ciphertext runes.
 *
 * For identical per-position additive GP29 pad (or opposite pad signs), the
 * unknown key cancels: P2 = (+/- P1) + (C2 -/+ C1) mod 29. Arc-consistency
 * checks whether their exact printed GP word boundaries can simultaneously
 * hold source-native English lexicon words. A contradiction is necessary-
 * condition evidence only for the declared additive/key-reset model and
 * finite word list. It is not a proof about all possible plaintexts.
 *
 * Run: node sims/p17_p41_sharedpad_dictionary_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcripts = read("resources/lp2-transcription.txt").split("%");
const primeRuneMap = new Map(corpus.translit.map((label, index) => [label, index]));
primeRuneMap.set("ING", 21);
const N = 29;
const PAGE_LENGTH = 273;

/** Authentically used GP phonetic conversion, including the ING rune. */
function encodeGP(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const codes = [];
  for (let i = 0; i < normalized.length;) {
    let found = false;
    for (const length of [3, 2, 1]) {
      const fragment = normalized.slice(i, i + length);
      if (fragment.length === length && primeRuneMap.has(fragment)) {
        codes.push(String.fromCharCode(65 + primeRuneMap.get(fragment)));
        i += length;
        found = true;
        break;
      }
    }
    if (!found) return null;
  }
  return codes.join("");
}

/** Printed rune segments, including edge fragments of carried words. */
function wordSegments(physicalPage) {
  assert.ok(physicalPage < 50, "transcript index matches physical page only below 50");
  let offset = 0;
  let start = 0;
  let current = "";
  const words = [];
  const close = () => {
    if (!current) return;
    words.push({start, stop: offset, len: offset - start});
    current = "";
  };
  for (const char of transcripts[physicalPage]) {
    if (/[\u16A0-\u16FF]/u.test(char)) {
      if (!current) start = offset;
      current += char;
      offset++;
    } else if (char === "/" || /\s/u.test(char)) {
      // Page image line breaks do not end a printed word.
    } else {
      close();
    }
  }
  close();
  assert.equal(offset, PAGE_LENGTH);
  assert.equal(offset, corpus.pages[physicalPage].indices.length);
  return words;
}

const LEXICON = Array.from({length: 30}, () => new Set());
let listedWords = 0;
let unencodedWords = 0;
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const match = /^([a-z]+)\s+\d+$/u.exec(line);
  if (!match) continue;
  listedWords++;
  const encoded = encodeGP(match[1]);
  if (encoded === null) {
    unencodedWords++;
    continue;
  }
  if (encoded.length < LEXICON.length) LEXICON[encoded.length].add(encoded);
}
assert.equal(listedWords, 29157);
assert.equal(unencodedWords, 3);
const A = wordSegments(17);
const B = wordSegments(41);
const C1 = corpus.pages[17].indices;
const C2 = corpus.pages[41].indices;
assert.equal(A.length, 69);
assert.equal(B.length, 62);

/**
 * Necessary-condition arc-consistency test on one self-contained joint
 * word-boundary interval. Every retained state is an exact GP word encoding.
 * @param {{start:number,stop:number,len:number}[]} a
 * @param {{start:number,stop:number,len:number}[]} b
 * @param {number[]} delta Key-cancelled GP29 difference/sum stream.
 * @param {boolean} sum If true B = delta - A; else B = delta + A.
 * @param {boolean} reverse Is B read backwards relative to its printed order?
 */
function compatibleBlock(a, b, delta, sum, reverse) {
  const vars = [
    ...a.map((w) => ({...w, words: [...LEXICON[w.len]]})),
    ...b.map((w) => ({
      ...w,
      words: [...LEXICON[w.len]].map((s) =>
        reverse ? [...s].reverse().join("") : s)
    }))
  ];
  const edges = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const lo = Math.max(a[i].start, b[j].start);
      const hi = Math.min(a[i].stop, b[j].stop);
      if (lo < hi) edges.push({a: i, b: a.length + j, lo, hi});
    }
  }
  const adjacent = vars.map(() => []);
  for (let i = 0; i < edges.length; i++) {
    adjacent[edges[i].a].push(i);
    adjacent[edges[i].b].push(i);
  }

  const queue = [];
  for (const edge of edges) {
    queue.push([edge, edge.a, edge.b], [edge, edge.b, edge.a]);
  }
  for (let index = 0; index < queue.length; index++) {
    const [edge, source, target] = queue[index];
    const sourceVar = vars[source];
    const targetVar = vars[target];
    const length = edge.hi - edge.lo;
    const sourceAt = edge.lo - sourceVar.start;
    const targetAt = edge.lo - targetVar.start;
    const forward = source === edge.a;
    const available = new Set(targetVar.words.map((value) =>
      value.slice(targetAt, targetAt + length)));
    const kept = [];
    for (const word of sourceVar.words) {
      let required = "";
      for (let k = 0; k < length; k++) {
        const glyph = word.charCodeAt(sourceAt + k) - 65;
        const d = delta[edge.lo + k];
        const other = forward ?
          (sum ? (d - glyph + N) % N : (d + glyph) % N) :
          (sum ? (d - glyph + N) % N : (glyph - d + N) % N);
        required += String.fromCharCode(65 + other);
      }
      if (available.has(required)) kept.push(word);
    }
    if (kept.length === sourceVar.words.length) continue;
    sourceVar.words = kept;
    if (kept.length === 0) {
      return {possible: false, failedAt: edge.lo, examinedArcs: index + 1};
    }
    for (const edgeIndex of adjacent[source]) {
      const next = edges[edgeIndex];
      const other = next.a === source ? next.b : next.a;
      if (other !== target) queue.push([next, other, source]);
    }
  }
  return {possible: true, failedAt: null, examinedArcs: queue.length};
}

function orientedWords(reverse) {
  return reverse ? B.map((w) => ({
    start: PAGE_LENGTH - w.stop,
    stop: PAGE_LENGTH - w.start,
    len: w.len
  })).reverse() : B;
}

/**
 * Derive page-pair delta, slice at both-pages-complete word boundaries, and
 * count independently incompatible intervals. A "possible" block is only
 * arc-consistent, so it need not possess a full global dictionary solution.
 */
function test(CA, CB, reverse, sum) {
  const otherWords = orientedWords(reverse);
  const aCuts = [0, ...A.map((w) => w.stop)];
  const bCuts = new Set([0, ...otherWords.map((w) => w.stop)]);
  const cuts = aCuts.filter((cut) => bCuts.has(cut));
  assert.equal(cuts[0], 0);
  assert.equal(cuts.at(-1), PAGE_LENGTH);
  const delta = CA.map((value, index) => {
    const second = CB[reverse ? PAGE_LENGTH - 1 - index : index];
    return sum ? (value + second) % N : (second - value + N) % N;
  });
  const blocks = [];
  for (let j = 1; j < cuts.length; j++) {
    const begin = cuts[j - 1];
    const end = cuts[j];
    const aa = A.filter((w) => w.start >= begin && w.stop <= end);
    const bb = otherWords.filter((w) => w.start >= begin && w.stop <= end);
    const outcome = compatibleBlock(aa, bb, delta, sum, reverse);
    blocks.push({begin, end, wordsA: aa.length, wordsB: bb.length,
      possible: outcome.possible, failedAt: outcome.failedAt});
  }
  return {
    reverse, oppositePadSigns: sum,
    blocks: blocks.length,
    incompatible: blocks.filter((block) => !block.possible).length,
    interiorIncompatible: blocks.slice(1, -1)
      .filter((block) => !block.possible).length,
    blockDetails: blocks
  };
}

function plant(reverse, sum) {
  // An exact valid-lexicon positive control using the authentic two different
  // page word-length templates, not a synthetic unsegmented GP character soup.
  const pa = A.flatMap((w) => [...LEXICON[w.len].values().next().value]
    .map((c) => c.charCodeAt(0) - 65));
  const pb = B.flatMap((w) => [...LEXICON[w.len].values().next().value]
    .map((c) => c.charCodeAt(0) - 65));
  assert.equal(pa.length, PAGE_LENGTH);
  assert.equal(pb.length, PAGE_LENGTH);
  const pad = Array.from({length: PAGE_LENGTH}, (_, i) => (7 * i + 11) % N);
  const left = pa.map((value, i) => (value + pad[i]) % N);
  const right = Array(PAGE_LENGTH).fill(0);
  for (let i = 0; i < PAGE_LENGTH; i++) {
    const physical = reverse ? PAGE_LENGTH - 1 - i : i;
    right[physical] = sum ?
      (pb[physical] - pad[i] + N) % N :
      (pb[physical] + pad[i]) % N;
  }
  return test(left, right, reverse, sum);
}

const cases = [];
const controls = [];
for (const reverse of [false, true]) {
  for (const sum of [false, true]) {
    const real = test(C1, C2, reverse, sum);
    const synthetic = plant(reverse, sum);
    cases.push(real);
    controls.push({reverse, sum, blocks: synthetic.blocks,
      incompatible: synthetic.incompatible});
    assert.equal(synthetic.incompatible, 0,
      "true shared-pad dictionary plant must be compatible");
  }
}
assert.deepEqual(cases.map((c) => [c.blocks, c.incompatible]),
  [[22, 12], [22, 13], [10, 8], [10, 8]]);

// Known independently decrypted LP2 p56 words establish that the TextBlob
// lexicon is broad but not exhaustive: "HASHES" is omitted.
const solvedP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES " +
  "TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
const omittedP56 = solvedP56.split(/\s+/u)
  .filter((w) => {
    const encoded = encodeGP(w);
    return encoded === null || !LEXICON[encoded.length].has(encoded);
  });
assert.deepEqual(omittedP56, ["HASHES"]);

const output = {
  interpretation: "mod58 page address is conjectural; no original LP2 plaintext",
  pair: {physicalPages: [17, 41], lengths: [C1.length, C2.length],
    wordSegments: [A.length, B.length]},
  dictionary: {listedWords, unencodedWords,
    distinctGPWords: LEXICON.reduce((sum, set) => sum + set.size, 0),
    solvedP56Omitted: omittedP56},
  original: cases,
  trueSharedPadControls: controls,
  decision: "The finite lexicon and printed word templates refute a direct aligned additive same-pad decoder without many unlisted words. Different alphabet, key clocks, skips, unknown words, or stateful ciphers remain untested."
};
console.log(JSON.stringify(output, null, 2));
