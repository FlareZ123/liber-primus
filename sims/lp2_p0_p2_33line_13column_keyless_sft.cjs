"use strict";

/**
 * Source-original opening chapter line-shell test (issue #2305).
 * Executes on unaltered LP2 p0-p2 runes and independent native GP control tapes.
 * No proposed unknown plaintext or author-selected decoding instruction is implied.
 * Node.js 22 / CommonJS; no writes, no dependencies outside Node core.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const beowulf = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
const latin = JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json"));
const runeToNumber = new Map(source.runes.map((rune, i) => [rune, i]));
assert.equal(runeToNumber.size, 29);

/** @param {string} text @returns {number[]} */
function runes(text) {
  return Array.from(text).filter((symbol) => runeToNumber.has(symbol)).map((symbol) => runeToNumber.get(symbol));
}

/** @returns {number[][]} */
function openingBlackLines() {
  const pages = transcription.split("%");
  return pages.slice(0, 3).flatMap((pageText, pageIndex) => {
    const lines = pageText.split(/\n|\//).map(runes).filter((values) => values.length);
    if (pageIndex === 0) {
      assert.deepEqual(lines[0].slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
      lines[0] = lines[0].slice(13);
    }
    return lines;
  });
}
const lines = openingBlackLines();
const lineLengths = lines.map((line) => line.length);
const original = source.pages.slice(0, 3).flatMap((page) => page.indices).slice(13);
assert.deepEqual(source.pages.slice(0, 3).map((page) => page.indices.length), [262, 266, 201]);
assert.deepEqual(lines.flat(), original);
assert.equal(lines.length, 33);
assert.equal(original.length, 716);
assert.ok(lines.every((line) => line.length >= 2));

/**
 * The original line widths and original two exterior runes per line remain
 * recoverable side information. The interior is exactly 650 unchanged GP runes.
 * @param {number[]} input A 716-rune tape using the original 33 line widths.
 * @returns {number[]}
 */
function peel(input) {
  assert.equal(input.length, 716);
  const inner = [];
  let offset = 0;
  for (const length of lineLengths) {
    inner.push(...input.slice(offset + 1, offset + length - 1));
    offset += length;
  }
  assert.equal(offset, 716);
  assert.equal(inner.length, 650);
  return inner;
}

/**
 * @param {number[]} inner
 * @returns {number[]}
 */
function restore(inner) {
  assert.equal(inner.length, 650);
  let n = 0;
  return lines.flatMap((line) => {
    const restored = [line[0], ...inner.slice(n, n + line.length - 2), line[line.length - 1]];
    n += line.length - 2;
    return restored;
  });
}
const core = peel(original);
assert.deepEqual(restore(core), original);
assert.deepEqual(source.pages[0].indices.slice(0, 13).concat(restore(core)),
  source.pages.slice(0, 3).flatMap((page) => page.indices));
assert.equal(lineLengths.reduce((sum, length) => sum + length - 2, 0), 650);

/**
 * Pair-collision statistic invariant under independently unknown GP29
 * bijections on every residue class modulo period.
 * @param {number[]} tape
 * @param {number} period
 * @returns {number}
 */
function phaseIoc(tape, period) {
  const counts = Array.from({ length: period }, () => new Uint16Array(29));
  for (let i = 0; i < tape.length; i++) {
    assert.ok(Number.isInteger(tape[i]) && tape[i] >= 0 && tape[i] < 29);
    counts[i % period][tape[i]]++;
  }
  let numerator = 0;
  let denominator = 0;
  for (const row of counts) {
    let n = 0;
    for (const count of row) {
      n += count;
      numerator += count * (count - 1);
    }
    denominator += n * (n - 1);
  }
  return numerator / denominator;
}

const actual13 = phaseIoc(core, 13);
const actual50 = phaseIoc(core, 50);
assert.ok(Math.abs(actual13 - 0.036169544740973315) < 1e-13);
assert.ok(Math.abs(actual50 - 0.03256410256410256) < 1e-13);

/** @param {number[]} tape @param {number} period @param {number} sign @returns {number[]} */
function keyed(tape, period, sign) {
  return tape.map((x, i) => ((x + sign * ((11 + 7 * (i % period)) % 29)) % 29 + 29) % 29);
}
for (const period of [13, 50]) {
  const masked = keyed(core, period, 1);
  assert.deepEqual(keyed(masked, period, -1), core);
  assert.equal(phaseIoc(masked, period), phaseIoc(core, period));
}

const controlOldEnglish = Array.from(beowulf.positiveControlGpBase29,
  (symbol) => beowulf.positiveControlAlphabet.indexOf(symbol));
assert.ok(controlOldEnglish.every((symbol) => symbol >= 0 && symbol < 29));
const controlLatin = latin.runes;
const thresholds = [actual13, actual50];

/**
 * @param {number[]} tape
 * @returns {Array<{windows:number,min:number,median:number,max:number,atOrBelowOriginal:number}>}
 */
function matchedControls(tape) {
  const observations = [[], []];
  for (let start = 0; start + 716 <= tape.length; start += 13) {
    const candidate = peel(tape.slice(start, start + 716));
    observations[0].push(phaseIoc(candidate, 13));
    observations[1].push(phaseIoc(candidate, 50));
  }
  return observations.map((values, index) => {
    values.sort((a, b) => a - b);
    return {
      windows: values.length,
      min: values[0],
      median: values[Math.floor(values.length / 2)],
      max: values[values.length - 1],
      atOrBelowOriginal: values.filter((value) => value <= thresholds[index]).length,
    };
  });
}

const oldEnglish = matchedControls(controlOldEnglish);
const vulgate = matchedControls(controlLatin);
assert.deepEqual(oldEnglish.map((row) => [row.windows, row.atOrBelowOriginal]), [[942, 0], [942, 0]]);
assert.deepEqual(vulgate.map((row) => [row.windows, row.atOrBelowOriginal]), [[130, 0], [130, 0]]);
assert.ok(oldEnglish[0].min > actual13 && oldEnglish[1].min > actual50);
assert.ok(vulgate[0].min > actual13 && vulgate[1].min > actual50);

process.stdout.write(JSON.stringify({
  classification: "source-exact 33-line 13x50 shape; bounded no-go for static class bijections",
  runes: { red: 13, black: original.length, lines: lines.length, inner: core.length, shell: 66 },
  lineLengths, actual: { period13: actual13, period50: actual50, wholeCore: phaseIoc(core, 1) },
  controls: { correctedOldEnglish: oldEnglish, latinVulgate: vulgate },
  exactOriginalReassembly: true,
  recovery: "NO authentic unknown LP2 plaintext or historical cipher selected",
}, null, 2) + "\n");
