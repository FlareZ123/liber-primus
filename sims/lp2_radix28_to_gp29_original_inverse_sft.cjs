'use strict';

// SFT: original LP2 nonrepeating successor ranks as base28 numerals -> GP29.
// Run: node sims/lp2_radix28_to_gp29_original_inverse_sft.cjs
// Hypothesis only: the original source does not select this codec or framing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);
const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];

function convert(digits, fromBase, toBase) {
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < fromBase);
    n = n * BigInt(fromBase) + BigInt(digit);
  }
  if (n === 0n) return [0];
  const result = [];
  while (n > 0n) {
    result.push(Number(n % BigInt(toBase)));
    n /= BigInt(toBase);
  }
  return result.reverse();
}

function represent(digits, fromBase, toBase, targetLength) {
  let n = 0n;
  for (const d of digits) n = n * BigInt(fromBase) + BigInt(d);
  const out = Array(targetLength).fill(0);
  for (let i = targetLength - 1; i >= 0; i--) {
    out[i] = Number(n % BigInt(toBase));
    n /= BigInt(toBase);
  }
  assert.equal(n, 0n, 'numeral does not fit in original digit width');
  return out;
}

function collect(source) {
  assert(source.length > 0);
  const mask = [];
  const ranks = [];
  for (let i = 1; i < source.length; i++) {
    const d = (source[i] - source[i - 1] + 29) % 29;
    const isRepeat = d === 0;
    mask.push(isRepeat);
    if (!isRepeat) ranks.push(d - 1);
  }
  return { seed: source[0], mask, ranks, plain: convert(ranks, 28, 29) };
}

function reconstruct(frame) {
  const ranks = represent(frame.plain, 29, 28, frame.ranks.length);
  assert.deepEqual(ranks, frame.ranks);
  const out = [frame.seed];
  let j = 0;
  for (const isRepeat of frame.mask) {
    const step = isRepeat ? 0 : ranks[j++] + 1;
    out.push((out[out.length - 1] + step) % 29);
  }
  assert.equal(j, ranks.length);
  return out;
}

function ioc(s) {
  const counts = Array(29).fill(0);
  for (const v of s) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (s.length * (s.length - 1));
}

function chapterTest() {
  const plains = [];
  const summary = [];
  let start = 0;
  for (let i = 0; i < chapterEnds.length; i++) {
    const input = ciphertext.slice(start, chapterEnds[i]);
    const frame = collect(input);
    assert.deepEqual(reconstruct(frame), input);
    plains.push(...frame.plain);
    summary.push({chapter: i + 1, original: input.length, nonzero: frame.ranks.length, repeat: frame.mask.filter(Boolean).length, decoded: frame.plain.length, ioc: ioc(frame.plain)});
    start = chapterEnds[i];
  }
  assert.equal(start, ciphertext.length);
  assert.equal(plains.length, 12731);
  assert(Math.abs(ioc(plains) - 0.0345446718098094) < 1e-12);
  return { frames: summary, total: plains.length, ioc: ioc(plains)};
}

function doubletFrameTest() {
  const starts = [0];
  for (let i = 1; i < ciphertext.length; i++) if (ciphertext[i] === ciphertext[i - 1]) starts.push(i);
  starts.push(ciphertext.length);
  const plains = [];
  for (let i = 0; i < starts.length - 1; i++) {
    const input = ciphertext.slice(starts[i], starts[i + 1]);
    const frame = collect(input);
    assert(!frame.mask.includes(true), 'frame must be maximal nonrepeating run');
    assert.deepEqual(reconstruct(frame), input);
    plains.push(...frame.plain);
  }
  assert.equal(starts.length - 2, 86);
  assert.equal(plains.length, 12755);
  assert(Math.abs(ioc(plains) - 0.03445879070874499) < 1e-12);
  return {frames: starts.length - 1, sourceRepeats: starts.length - 2, total: plains.length, ioc: ioc(plains)};
}

function sourceNativePlant() {
  const known = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(known.length, 95);
  const ranks = convert(known, 29, 28);
  let seed = 11;
  const ciphertextPlant = [seed];
  for (const r of ranks) {
    seed = (seed + r + 1) % 29;
    ciphertextPlant.push(seed);
  }
  const frame = collect(ciphertextPlant);
  assert.deepEqual(frame.plain, known);
  assert.deepEqual(reconstruct(frame), ciphertextPlant);
  assert(Math.abs(ioc(known) - 0.06270996640537514) < 1e-12);
  return {nativeRunes: known.length, encodedSteps: ranks.length, recovered: frame.plain.length, nativeIoc: ioc(known)};
}

const results = {control: sourceNativePlant(), chapter: chapterTest(), repeatFrames: doubletFrameTest()};
console.log(JSON.stringify(results, null, 2));
console.log('PASS: original LP2 exact reencryption under retained frame information; solved p57 native positive.');
