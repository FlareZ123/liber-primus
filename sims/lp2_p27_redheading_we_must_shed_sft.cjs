"use strict";

/** Source-only SFT for the p55 -> p27 red-heading instruction candidate. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
);
const rawPages = transcription.split("%");
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let x = 2; x <= n; x++) if (isPrime(x)) rank++;
  return rank;
}
/** @param {number} n */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result -= result / p;
  }
  if (x > 1) result -= result / x;
  return result;
}
/** @param {number[]} runes */
const primeSum = runes => runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
/** @param {number[]} runes */
const indexSum = runes => runes.reduce((sum, rune) => sum + rune, 0);
/** @param {number[]} runes */
const translit = runes => runes.map(rune => corpus.translit[rune]).join("");

/** @param {number} physicalPage */
function pageWords(physicalPage) {
  const source = rawPages[physicalPage <= 49 ? physicalPage : physicalPage - 1] || "";
  let offset = 0;
  let start = -1;
  let current = [];
  const words = [];
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset, inds: current});
    current = [];
    start = -1;
  };
  for (const ch of source) {
    if (alphabet.has(ch)) {
      if (!current.length) start = offset;
      current = [...current, alphabet.get(ch)];
      offset++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line wraps preserve the canonical word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @param {number[][]} parts
 * @returns {{inner:number[][],removed:number[]}}
 */
function shed(parts) {
  const removed = [];
  const inner = parts.map(part => {
    if (!part.length) return [];
    if (part.length === 1) {
      removed.push(part[0]);
      return [];
    }
    removed.push(part[0], part.at(-1));
    return part.slice(1, -1);
  });
  return {inner, removed};
}

const p57 = pageWords(57).map(word => ({
  name: translit(word.inds),
  sum: primeSum(word.inds)
}));
assert.equal(p57.length, 20);
assert.deepEqual(
  p57.slice(8, 11).map(word => [word.name, word.sum]),
  [["WE", 86], ["MUST", 186], ["SHED", 232]]
);
const p57Sums = new Set(p57.map(word => word.sum));

const p27 = annotations.pages.find(page => page.page === 27);
assert(p27);
const span = p27.red_spans[0];
const heading = [...span.runes].map(rune => alphabet.get(rune));
const headingWords = pageWords(27).filter(
  word => word.start >= span.start && word.end <= span.start + span.length
);
const marker = p27.large_punctuation.find(mark => mark[0] === span.start + span.length);
assert.deepEqual(headingWords.map(word => word.inds.length), [3, 12, 4]);
assert.deepEqual(marker, [19, 13, "red"]);
assert.equal(heading.length, 19);
assert.equal(heading[0], 19);

const fullSum = primeSum(heading);
const fullRank = primeRank(fullSum);
assert.equal(fullSum, 1109);
assert.equal(fullRank, 186);
assert.equal(grid.bytes[fullRank], 19);

const first = shed(headingWords.map(word => word.inds));
const interior = first.inner.flat();
assert.equal(interior.length, 13);
assert.equal(interior.length, marker[1]);
assert.equal(translit(interior), "PSOAAEHLEEOIMSC");
assert.equal(primeSum(interior), 673);
assert.equal(primeRank(primeSum(interior)), 122);
assert.equal(grid.bytes[122], 86);

const second = shed(first.inner);
assert.equal(translit(second.removed), "PSMSC");
assert.equal(primeSum(second.removed), 233);
assert.equal(phi(233), 232);

// p27 alone among all 18 red spans satisfies each source-shaped selector.
const rawWordHits = [];
const selfHits = [];
const markerHits = [];
const shedWordHits = [];
for (const page of annotations.pages) {
  const words = pageWords(page.page);
  for (const redSpan of page.red_spans || []) {
    const runes = [...redSpan.runes].map(rune => alphabet.get(rune));
    const rank = primeRank(primeSum(runes));
    const spanWords = words.filter(
      word => word.start >= redSpan.start && word.end <= redSpan.start + redSpan.length
    );
    const inner = shed(spanWords.map(word => word.inds)).inner.flat();
    const mark = (page.large_punctuation || []).find(
      candidate => candidate[0] === redSpan.start + redSpan.length
    );
    if (rank !== null && p57Sums.has(rank)) rawWordHits.push(page.page);
    if (
      rank !== null && rank < 256 &&
      grid.bytes[rank] === redSpan.length &&
      runes[0] === redSpan.length
    ) selfHits.push(page.page);
    if (mark && inner.length === mark[1]) markerHits.push(page.page);
    const innerRank = primeRank(primeSum(inner));
    if (
      innerRank !== null && innerRank < 256 &&
      p57Sums.has(grid.bytes[innerRank])
    ) shedWordHits.push(page.page);
  }
}
assert.deepEqual(rawWordHits, [27]);
assert.deepEqual(selfHits, [27]);
assert.deepEqual(markerHits, [27]);
assert.deepEqual(shedWordHits, [27]);

// The derived 13-rune sequence is not a direct solved-style Vigenere key for
// the black p27 body under plaintext-F transparency.
const body = corpus.pages.find(page => page.page === 27).indices.slice(19);
/** @param {number} sign */
function deadOffset(sign) {
  let keyPos = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === 0) continue;
    const plain = (body[i] + sign * interior[keyPos % interior.length] + 58) % 29;
    if (plain === 0) return i;
    keyPos++;
  }
  return null;
}
assert.equal(deadOffset(-1), 5);
assert.equal(deadOffset(+1), 61);

// Discovery-aware null. Preserve p27's independently selected 3/12/4 geometry,
// shuffle the exact 225 red rune identities, allow all six object orders, and
// allow prime sum, index sum, phi(prime sum), prime rank, plus one p50 lookup.
const allRed = [];
for (const page of annotations.pages) {
  for (const redSpan of page.red_spans || []) {
    for (const rune of [...redSpan.runes]) allRed.push(alphabet.get(rune));
  }
}
assert.equal(allRed.length, 225);

const permutations = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
/** @param {number[]} object */
function features(object) {
  const ps = primeSum(object);
  const ix = indexSum(object);
  const ph = phi(ps);
  const pr = primeRank(ps);
  const values = [ps, ix, ph, pr];
  for (const address of [ps, ix, ph, pr]) {
    if (address !== null && address >= 0 && address < 256) {
      values.push(grid.bytes[address]);
    }
  }
  return new Set(values.filter(value => value !== null));
}
/** @param {number[]} sample */
function objects(sample) {
  const parts = [sample.slice(0, 3), sample.slice(3, 15), sample.slice(15, 19)];
  const layer1 = shed(parts);
  const layer2 = shed(layer1.inner);
  return [sample, layer1.inner.flat(), layer2.removed];
}
/** @param {number[]} sample */
function broadTripleMatch(sample) {
  const sets = objects(sample).map(features);
  for (let i = 0; i + 2 < p57.length; i++) {
    const triple = [p57[i].sum, p57[i + 1].sum, p57[i + 2].sum];
    for (const order of permutations) {
      if (
        sets[order[0]].has(triple[0]) &&
        sets[order[1]].has(triple[1]) &&
        sets[order[2]].has(triple[2])
      ) return true;
    }
  }
  return false;
}
assert.equal(broadTripleMatch(heading), true);

let state = 0x6d2b79f5;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 200000;
let broadHits = 0;
let broadSelfHits = 0;
for (let trial = 0; trial < trials; trial++) {
  const indices = Array.from({length: allRed.length}, (_, i) => i);
  const sample = [];
  for (let j = 0; j < 19; j++) {
    const k = j + (random32() % (indices.length - j));
    [indices[j], indices[k]] = [indices[k], indices[j]];
    sample.push(allRed[indices[j]]);
  }
  if (!broadTripleMatch(sample)) continue;
  broadHits++;
  const rank = primeRank(primeSum(sample));
  if (
    rank !== null && rank < 256 &&
    grid.bytes[rank] === 19 &&
    sample[0] === 19
  ) broadSelfHits++;
}
assert.equal(broadHits, 10);
assert.equal(broadSelfHits, 0);

console.log(JSON.stringify({
  status: "candidate instruction chain only; no unknown plaintext",
  heading: {fullSum, fullRank, tableByte: grid.bytes[fullRank], firstIndex: heading[0]},
  firstShed: {
    translit: translit(interior),
    length: interior.length,
    markerDots: marker[1],
    primeSum: primeSum(interior),
    primeRank: primeRank(primeSum(interior)),
    tableByte: grid.bytes[primeRank(primeSum(interior))]
  },
  secondShell: {
    translit: translit(second.removed),
    primeSum: primeSum(second.removed),
    phi: phi(primeSum(second.removed))
  },
  p57CandidateValues: [86, 186, 232],
  census: {rawWordHits, selfHits, markerHits, shedWordHits},
  directReceiver: {minusDeadOffset: deadOffset(-1), plusDeadOffset: deadOffset(+1)},
  broadNull: {seed: "0x6d2b79f5", trials, broadHits, broadSelfHits}
}, null, 2));
