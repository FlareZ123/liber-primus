"use strict";
/**
 * Source-fixed p53 -> p15 60-symbol key and F79-state challenge.
 * Run from repository root: node sims/parable_p53_p15_60_state_key_sft.cjs
 * Bounded original-cipher negative; not a proposed solution.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const inkPages = new Map(ink.pages.map(p => [p.page, p]));
const p53Span = inkPages.get(53).red_spans.find(s => s.start === 128 && s.length === 51);
const p15Span = inkPages.get(15).red_spans.find(s => s.start === 0 && s.length === 9);
assert.ok(p53Span && p15Span, "original p53 red51 and p15 first red9 spans must exist");
const p53 = pages.get(53).indices.slice(p53Span.start, p53Span.start + p53Span.length);
const p15 = pages.get(15).indices.slice(p15Span.start, p15Span.start + p15Span.length);
assert.deepEqual(p53, [...p53Span.runes].map(ch => corpus.runes.indexOf(ch)));
assert.deepEqual(p15, [...p15Span.runes].map(ch => corpus.runes.indexOf(ch)));
const keyGP = [...p53, ...p15];
const keyPrime = keyGP.map(i => corpus.prime[i] % 29);
const p53PrimeSum = p53.reduce((sum, i) => sum + corpus.prime[i], 0);
const p15PrimeSum = p15.reduce((sum, i) => sum + corpus.prime[i], 0);
assert.deepEqual([p53.length, p15.length, keyGP.length], [51, 9, 60]);
assert.deepEqual([p53PrimeSum, p15PrimeSum], [2262, 638]);
assert.equal(p53PrimeSum + p15PrimeSum, 2900);
assert.equal((p53PrimeSum + p15PrimeSum) % 29, 0);
assert.equal(keyPrime.reduce((sum, x) => sum + x, 0) % 29, 0);
function minimalPeriod(values) {
  for (let period = 1; period <= values.length; period++)
    if (values.length % period === 0 && values.every((x, i) => x === values[i % period])) return period;
  return values.length;
}
const cumulativePre = [], cumulativePost = [];
let state = 0;
for (const value of keyPrime) {
  cumulativePre.push(state);
  state = (state + value) % 29;
  cumulativePost.push(state);
}
assert.equal(state, 0);
assert.equal(minimalPeriod(cumulativePre), 60);
assert.equal(minimalPeriod(cumulativePost), 60);
const fib79 = [];
let f0 = 78, f1 = 22;
for (let i = 0; i < 78; i++) {
  fib79.push(f0);
  [f0, f1] = [f1, (f0 + f1) % 79];
}
let x = 78, y = 22, f79Period = 0;
for (let i = 1; i <= 1000; i++) {
  [x, y] = [y, (x + y) % 79];
  if (x === 78 && y === 22) { f79Period = i; break; }
}
assert.equal(f79Period, 78);
const parableOrdinalPhase = 201 % 78;
assert.equal(parableOrdinalPhase, 45);
const sourceKeys = [
  { name: "direct-GP-index", period: 60, key: keyGP },
  { name: "direct-prime-residue", period: 60, key: keyPrime },
  { name: "cumulative-prime-pre", period: 60, key: cumulativePre },
  { name: "cumulative-prime-post", period: 60, key: cumulativePost },
  { name: "F79-seed78-22-phase0", period: 78, key: fib79.map(x => x % 29) },
  { name: "F79-seed78-22-phase45", period: 78,
    key: fib79.map((_, i) => fib79[(i + parableOrdinalPhase) % 78] % 29) }
];
const keyPositions = (page, local) =>
  (page === 53 && local >= 128 && local < 179) || (page === 15 && local >= 0 && local < 9);
const totalRunes = Array.from({ length: 56 }, (_, p) => pages.get(p).indices.length).reduce((a, b) => a + b, 0);
assert.equal(totalRunes, 12956);
assert.equal(totalRunes - keyGP.length, 12896);
function originalRuns(schedule, clock, sign) {
  const runs = [];
  let bookOffset = 0;
  for (let page = 0; page <= 55; page++) {
    const cipher = pages.get(page).indices;
    let run = [];
    for (let local = 0; local < cipher.length; local++) {
      if (keyPositions(page, local)) {
        if (run.length) runs.push(run);
        run = [];
        continue;
      }
      const position = clock === "book" ? bookOffset + local : local;
      run.push((cipher[local] + sign * schedule[position % schedule.length] + 58) % 29);
    }
    if (run.length) runs.push(run);
    bookOffset += cipher.length;
  }
  return runs;
}
function rawRuns() {
  const runs = [];
  for (let page = 0; page <= 55; page++) {
    let run = [];
    const cipher = pages.get(page).indices;
    for (let local = 0; local < cipher.length; local++) {
      if (keyPositions(page, local)) {
        if (run.length) runs.push(run);
        run = [];
      } else run.push(cipher[local]);
    }
    if (run.length) runs.push(run);
  }
  return runs;
}
const shakespeare = plaintextWords(read("resources/control/shakespeare_first300k.txt")).flat();
const split = Math.floor(shakespeare.length * 0.8);
const train = shakespeare.slice(0, split);
const heldout = shakespeare.slice(split);
const unigramCounts = new Uint32Array(29);
const bigramCounts = new Uint32Array(29 * 29);
const trigramCounts = new Uint32Array(29 * 29 * 29);
for (let i = 0; i < train.length; i++) {
  const c = train[i];
  unigramCounts[c]++;
  if (i > 0) bigramCounts[train[i - 1] * 29 + c]++;
  if (i > 1) trigramCounts[(train[i - 2] * 29 + train[i - 1]) * 29 + c]++;
}
const unigram = new Float64Array(29);
const bigram = new Float64Array(29 * 29);
const trigram = new Float64Array(29 * 29 * 29);
for (let c = 0; c < 29; c++)
  unigram[c] = Math.log((unigramCounts[c] + 1) / (train.length + 29));
for (let a = 0; a < 29; a++) for (let c = 0; c < 29; c++) {
  const index = a * 29 + c;
  bigram[index] = Math.log((bigramCounts[index] + 12 * Math.exp(unigram[c])) / (unigramCounts[a] + 12));
}
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) for (let c = 0; c < 29; c++) {
  const index = (a * 29 + b) * 29 + c;
  trigram[index] = Math.log((trigramCounts[index] + 9 * Math.exp(bigram[b * 29 + c])) / (bigramCounts[a * 29 + b] + 9));
}
function languageScore(symbols) {
  if (symbols.length < 3) return 0;
  let sum = unigram[symbols[0]] + bigram[symbols[0] * 29 + symbols[1]];
  for (let i = 2; i < symbols.length; i++)
    sum += trigram[(symbols[i - 2] * 29 + symbols[i - 1]) * 29 + symbols[i]];
  return sum / symbols.length;
}
function stats(runs) {
  let count = 0, weightedScore = 0;
  const frequencies = new Uint32Array(29);
  for (const run of runs) {
    count += run.length;
    weightedScore += languageScore(run) * run.length;
    for (const symbol of run) frequencies[symbol]++;
  }
  let equalPairs = 0;
  for (const frequency of frequencies) equalPairs += frequency * (frequency - 1) / 2;
  const top12 = [...frequencies].sort((a, b) => b - a).slice(0, 12).reduce((sum, frequency) => sum + frequency, 0);
  return { runes: count, ioc: equalPairs / (count * (count - 1) / 2), top12: top12 / count, trigram: weightedScore / count };
}
const plantPages = [];
let plantOffset = 0;
for (let page = 0; page <= 55; page++) {
  const length = pages.get(page).indices.length;
  plantPages.push(heldout.slice(plantOffset, plantOffset + length));
  plantOffset += length;
}
assert.ok(plantOffset <= heldout.length);
function verifyPositivePlant(spec, clock, sign) {
  let bookOffset = 0, recovered = 0;
  for (let page = 0; page <= 55; page++) {
    const plain = plantPages[page], cipher = [], decoded = [];
    for (let local = 0; local < plain.length; local++) {
      const position = clock === "book" ? bookOffset + local : local;
      const k = spec.key[position % spec.period];
      cipher.push((plain[local] + sign * k + 58) % 29);
      decoded.push((cipher[local] - sign * k + 58) % 29);
    }
    assert.deepEqual(decoded, plain, "positive plant failed: " + spec.name);
    recovered += decoded.length;
    bookOffset += plain.length;
  }
  return recovered;
}
const raw = stats(rawRuns());
const results = [];
for (const spec of sourceKeys) for (const clock of ["book", "page"]) for (const sign of [-1, 1]) {
  const original = stats(originalRuns(spec.key, clock, sign));
  const plantRecovered = verifyPositivePlant(spec, clock, sign);
  results.push({ model: spec.name, clock, sign, ...original, plantRecovered });
}
assert.equal(results.length, 24);
assert.ok(results.every(result => result.runes === 12896 && result.plantRecovered === 12956));
const reference = [];
for (let start = 0; start + 12000 <= heldout.length; start += 12000)
  reference.push(stats([heldout.slice(start, start + 12000)]));
const iocValues = results.map(r => r.ioc);
const trigramValues = results.map(r => r.trigram);
const sha = values => crypto.createHash("sha256").update(Buffer.from(values)).digest("hex");
console.log(JSON.stringify({
  result: "PASS",
  source: {
    p53RedLength: p53.length, p15FirstRedLength: p15.length, compositeLength: keyGP.length,
    p53PrimeSum, p15PrimeSum, compositePrimeSum: p53PrimeSum + p15PrimeSum,
    compositePrimeSumMod29: (p53PrimeSum + p15PrimeSum) % 29,
    primeResidueSumMod29: keyPrime.reduce((sum, x) => sum + x, 0) % 29,
    cumulativeStatePeriod: minimalPeriod(cumulativePre), F79Seed: [78, 22],
    F79PairPeriod: f79Period, ParableOrdinalPhase: parableOrdinalPhase,
    gpKeySha256: sha(keyGP), primeResidueKeySha256: sha(keyPrime),
    originalRunes: totalRunes, scoredOriginalRunes: totalRunes - keyGP.length
  },
  languageModel: { trainingSymbols: train.length, heldoutSymbols: heldout.length, referenceWindows: reference },
  raw,
  candidateRange: {
    iocMin: Math.min(...iocValues), iocMax: Math.max(...iocValues),
    top12Min: Math.min(...results.map(r => r.top12)), top12Max: Math.max(...results.map(r => r.top12)),
    trigramMin: Math.min(...trigramValues), trigramMax: Math.max(...trigramValues)
  },
  models: results
}, null, 2));
