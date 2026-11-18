"use strict";
/**
 * Original-input SFT for Director #1473.
 * Canonical base-28 arithmetic coding of a zero-order GP29+EOS model.
 * Source model: pinned solved LP1/p56/p57 Latin transliterations only.
 * No ciphertext-derived probabilities or model training.
 *
 * Run with Node.js 22:
 *   node sims/lp2_rank28_frame_arithmetic_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const GP = book.translit;
const EOS = 29;
const RADIX = 28n;
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];

/** @param {number[]} cipher @returns {number[][]} */
function frameRanks(cipher) {
  const frames = [[]];
  let previous = cipher[0];
  for (const current of cipher.slice(1)) {
    if (current === previous) frames.push([]);
    else frames[frames.length - 1].push(current - Number(current > previous));
    previous = current;
  }
  return frames;
}

/** @param {number} first @param {number[][]} frames @returns {number[]} */
function restoreRanks(first, frames) {
  const output = [first];
  for (let i = 0; i < frames.length; i++) {
    for (const rank of frames[i]) {
      assert(rank >= 0 && rank < 28);
      const previous = output[output.length - 1];
      output.push(rank + Number(rank >= previous));
    }
    if (i + 1 < frames.length) output.push(output[output.length - 1]);
  }
  return output;
}

/** @returns {{frequencies: number[], cumulative: number[], total: number, native: number[], paragraphs: number}} */
function sourceModel() {
  const lines = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .split(/\r?\n/)
    .map(line => line.trim())
    .map(line => line.startsWith("#") || line.startsWith("[") || /^\d/.test(line)
      ? "" : line.toUpperCase().replace(/V/g, "U").replace(/K/g, "C"));
  const paras = lines.join("\n").split(/\n\s*\n/).map(s => s.trim())
    .filter(s => /[A-Z]/.test(s));
  const tokens = GP.map((symbol, index) => ({ symbol, index }))
    .sort((a, b) => b.symbol.length - a.symbol.length);
  /** @param {string} text @returns {number[]} */
  const tokenize = text => {
    const out = [];
    for (const word of text.match(/[A-Z]+/g) || []) {
      for (let i = 0; i < word.length;) {
        const token = tokens.find(t => word.startsWith(t.symbol, i));
        if (!token) throw new Error("unknown GP transliteration: " + word[i]);
        out.push(token.index);
        i += token.symbol.length;
      }
    }
    return out;
  };
  const native = paras.flatMap(tokenize);
  const frequencies = Array(30).fill(1);
  for (const x of native) frequencies[x]++;
  frequencies[EOS] += paras.length;
  const cumulative = [0];
  for (const f of frequencies) cumulative.push(cumulative[cumulative.length - 1] + f);
  return { frequencies, cumulative, total: cumulative[30], native, paragraphs: paras.length };
}

/**
 * Enumerative interval arithmetic code. For plaintext ending in EOS,
 * choose the lexicographically first shortest base-28 prefix cylinder
 * entirely within its exact rational arithmetic interval.
 *
 * @param {number[]} symbols
 * @param {{frequencies:number[],cumulative:number[],total:number}} model
 * @returns {number[]}
 */
function encode(symbols, model) {
  let low = 0n, high = 1n, denominator = 1n;
  const total = BigInt(model.total);
  for (const s of [...symbols, EOS]) {
    assert(Number.isInteger(s) && s >= 0 && s <= EOS);
    const width = high - low;
    const nextLow = low * total + width * BigInt(model.cumulative[s]);
    const nextHigh = low * total + width * BigInt(model.cumulative[s + 1]);
    low = nextLow;
    high = nextHigh;
    denominator *= total;
  }
  let scale = 1n;
  for (let length = 0; length <= 3000; length++) {
    let value = (low * scale + denominator - 1n) / denominator;
    if ((value + 1n) * denominator <= high * scale) {
      const digits = Array(length).fill(0);
      for (let i = length - 1; i >= 0; i--) {
        digits[i] = Number(value % RADIX);
        value /= RADIX;
      }
      return digits;
    }
    scale *= RADIX;
  }
  throw new Error("unexpected encoder precision limit");
}

/**
 * Decode the exact midpoint of a source base-28 cylinder. EOS must
 * occur before the prespecified output cap. A decoded sequence is
 * accepted as canonical only if encode(output) equals all source digits.
 *
 * @param {number[]} digits
 * @param {{frequencies:number[],cumulative:number[],total:number}} model
 * @param {number} limit
 * @returns {{symbols:number[],eos:boolean}}
 */
function decode(digits, model, limit) {
  let integer = 0n;
  for (const d of digits) {
    assert(Number.isInteger(d) && d >= 0 && d < 28);
    integer = integer * RADIX + BigInt(d);
  }
  let numerator = 2n * integer + 1n;
  let denominator = 2n * RADIX ** BigInt(digits.length);
  const total = BigInt(model.total);
  const symbols = [];
  for (let step = 0; step < limit; step++) {
    const next = numerator * total;
    let s = 0;
    while (s < 30 && next >= BigInt(model.cumulative[s + 1]) * denominator) s++;
    assert(s < 30);
    if (s === EOS) return { symbols, eos: true };
    symbols.push(s);
    numerator = next - BigInt(model.cumulative[s]) * denominator;
    denominator *= BigInt(model.frequencies[s]);
  }
  return { symbols, eos: false };
}

/**
 * Source-native GP positive plants fit a rank-frame width using only
 * independent solved text, never a candidate original plaintext.
 * @param {number} width @param {number} frame @param {number[]} native
 * @param {ReturnType<typeof sourceModel>} model
 */
function plantForWidth(width, frame, native, model) {
  const start = frame * 223;
  assert(start + 600 < native.length);
  for (let n = 1; n <= 600; n++) {
    const text = native.slice(start, start + n);
    const digits = encode(text, model);
    if (digits.length === width) return { text, digits, sourceStart: start };
    if (digits.length > width + 8) break;
  }
  throw new Error("source-native width fixture missing for frame " + frame);
}

function main() {
  const model = sourceModel();
  assert.equal(model.paragraphs, 34);
  assert.equal(model.native.length, 3107);
  assert.equal(model.total, 3171);
  const groups = chapters.map(([first, last]) =>
    book.pages.filter(p => p.page >= first && p.page <= last).flatMap(p => p.indices));
  assert.deepEqual(groups.map(x => x.length),
    [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
  const frames = groups.map(frameRanks);
  assert.equal(frames.reduce((s, x) => s + x.length - 1, 0), 86);
  for (let i = 0; i < groups.length; i++) {
    assert.deepEqual(restoreRanks(groups[i][0], frames[i]), groups[i]);
  }

  // Untrained positive in a native 180-rune solved GP sequence.
  const plant180 = model.native.slice(0, 180);
  const plantCode = encode(plant180, model);
  const plantRead = decode(plantCode, model, 500);
  assert(plantRead.eos);
  assert.deepEqual(plantRead.symbols, plant180);

  // A stronger source-native positive: p0's five actual frame lengths and
  // all four exact repeat-marker coordinates, with no source key.
  const p0Lengths = frames[0].map(f => f.length);
  const planted = p0Lengths.map((len, k) =>
    plantForWidth(len, k, model.native, model));
  const plantFrames = planted.map(p => p.digits);
  const plantedCipher = restoreRanks(groups[0][0], plantFrames);
  assert.equal(plantedCipher.length, groups[0].length);
  assert.deepEqual(frameRanks(plantedCipher), plantFrames);
  for (const p of planted) {
    const decoded = decode(p.digits, model, Math.max(500, p.text.length + 1));
    assert(decoded.eos);
    assert.deepEqual(decoded.symbols, p.text);
    assert.deepEqual(encode(decoded.symbols, model), p.digits);
  }

  const results = [];
  for (let chapter = 0; chapter < frames.length; chapter++) {
    for (let frame = 0; frame < frames[chapter].length; frame++) {
      const digits = frames[chapter][frame];
      const limit = Math.min(2000, Math.max(250, 3 * digits.length));
      const decoded = decode(digits, model, limit);
      const recoded = decoded.eos ? encode(decoded.symbols, model) : null;
      const exact = recoded !== null && recoded.length === digits.length &&
        recoded.every((d, i) => d === digits[i]);
      results.push({
        chapter: chapter + 1, frame: frame + 1, digits: digits.length,
        eos: decoded.eos, decodedRunes: decoded.symbols.length,
        canonicalDigits: recoded ? recoded.length : null, exact,
        preview: chapter === 0 ? decoded.symbols.slice(0, 60).map(i => GP[i]).join("") : undefined,
      });
    }
  }
  assert.equal(results.length, 95);
  const report = {
    source: "resources/liber-primus/lp2-corpus.json and lp1-plaintext-reference.txt",
    sourceCalibration: {
      paragraphs: model.paragraphs, nativeRunes: model.native.length,
      totalModelWeight: model.total, EOSWeight: model.frequencies[EOS],
      frequencies: model.frequencies,
    },
    original: {
      chapterRuneLengths: groups.map(x => x.length),
      observedRepeatBreaks: 86,
      rankFrames: results.length,
      digitLengthsByChapter: frames.map(rows => rows.map(x => x.length)),
      eosObservedWithinCap: results.filter(r => r.eos).length,
      canonicalExactFrames: results.filter(r => r.exact).length,
      p0: results.filter(r => r.chapter === 1),
      p40to53: results.filter(r => r.chapter === 8).slice(0, 7),
    },
    positive: {
      native180: { symbols: plant180.length, digits: plantCode.length, exact: true },
      originalP0MarkerCoordinates: {
        widths: p0Lengths, symbolLengths: planted.map(p => p.text.length),
        sourceOffsets: planted.map(p => p.sourceStart), exact: true,
      },
    },
  };
  assert.equal(report.original.canonicalExactFrames, 0,
    "changed original gate: inspect before changing research synthesis");
  console.log(JSON.stringify(report, null, 2));
}
if (require.main === module) main();
module.exports = { frameRanks, restoreRanks, sourceModel, encode, decode };
