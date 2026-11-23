"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const load = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

/** Center-red-3299-first clockwise spiral positions in the printed 4x4 square. */
const SPIRAL = Object.freeze([5, 6, 10, 9, 8, 4, 0, 1, 2, 3, 7, 11, 15, 14, 13, 12]);
const SOURCE = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const RUNE_TO_INDEX = new Map(SOURCE.runes.map((r, i) => [r, i]));

/**
 * Preserve each rune and the immediately subsequent genuine printed word/sentence
 * delimiter. Keep physical line-wrap, page-seam and chapter marks as an unchanged
 * side tape: those marks are never invented or deleted by this experiment.
 * @returns {Array<{v:number,after:string,page:number,local:number}>}
 */
function originalTape() {
  const parts = load("resources/liber-primus/lp2-transcription.txt").split("%");
  const out = [];
  for (let page = 0; page <= 55; page++) {
    if (page === 50) continue; // 32x8 numeral panel has no GP rune body.
    let local = 0;
    let last = -1;
    for (const ch of parts[page < 50 ? page : page - 1]) {
      if (RUNE_TO_INDEX.has(ch)) {
        last = out.length;
        out.push({v: RUNE_TO_INDEX.get(ch), after: "", page, local: local++});
      } else if (last >= 0 && (ch === "-" || ch === "." || ch === "'")) {
        out[last].after += ch;
      }
    }
  }
  assert.deepEqual(
    out.map((x) => x.v),
    SOURCE.pages.filter((x) => x.page <= 55).flatMap((x) => x.indices),
    "Original transcription must agree at every rune with source GP29 corpus"
  );
  assert.equal(out.length, 12956);
  return out;
}

/**
 * Change both rune positions and attached printed word/sentence marks in fixed
 * groups of 16. Printed page geometry is a nonsecret side tape, retained exactly.
 * Start from the first black body rune after p15 red9 or p40 red8.
 *
 * dir 0: output[linear j] = input[spiral j]
 * dir 1: output[spiral j] = input[linear j]
 *
 * @param {Array<{v:number,after:string,page:number,local:number}>} input
 * @param {number} first First physical page of the chapter.
 * @param {number} last Last physical page of the chapter.
 * @param {number} red Number of red heading runes skipped on the first page.
 * @param {0|1} dir Direction.
 * @returns {typeof input} Reversible output with an unchanged source layout side tape.
 */
function permute(input, first, last, red, dir) {
  const out = input.map((x) => ({...x}));
  const selected = [];
  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    if (x.page >= first && x.page <= last &&
        (x.page !== first || x.local >= red)) selected.push(i);
  }
  for (let base = 0; base + 16 <= selected.length; base += 16) {
    for (let j = 0; j < 16; j++) {
      const src = selected[base + (dir === 0 ? SPIRAL[j] : j)];
      const dst = selected[base + (dir === 0 ? j : SPIRAL[j])];
      out[dst].v = input[src].v;
      out[dst].after = input[src].after;
    }
  }
  return out;
}

/** Score adjacent natural-language word lengths with a fixed donor-only model. */
function languageModel() {
  const a = [
    ...load("resources/control/gibran_prophet_58585.txt").matchAll(/[A-Za-z]+/g),
    ...load("resources/control/shakespeare_first300k.txt").matchAll(/[A-Za-z]+/g)
  ].map((m) => m[0].length);
  const bins = 16;
  const unigrams = Array(bins).fill(0);
  const pairs = Array.from({length: bins}, () => Array(bins).fill(0));
  for (let i = 0; i < a.length; i++) {
    const q = Math.min(bins - 1, a[i] - 1);
    unigrams[q]++;
    if (i) pairs[Math.min(bins - 1, a[i - 1] - 1)][q]++;
  }
  const total = unigrams.reduce((s, v) => s + v, 0);
  const rows = pairs.map((row) => row.reduce((s, v) => s + v, 0));
  return (lengths) => {
    if (lengths.length < 2) return 0;
    let result = 0;
    for (let i = 1; i < lengths.length; i++) {
      const p = Math.min(bins - 1, lengths[i - 1] - 1);
      const q = Math.min(bins - 1, lengths[i] - 1);
      result += Math.log((pairs[p][q] + 0.5) / (rows[p] + bins * 0.5)) -
        Math.log((unigrams[q] + 0.5) / (total + bins * 0.5));
    }
    return result / (lengths.length - 1);
  };
}

/** Include words that cross original physical page seams. */
function lengths(tape, first, last) {
  const a = [];
  let n = 0;
  for (const x of tape) {
    if (x.page < first || x.page > last) continue;
    n++;
    if (x.after) {a.push(n); n = 0;}
  }
  if (n) a.push(n);
  return a;
}

function metrics(tape, first, last, score) {
  const seq = tape.filter((x) => x.page >= first && x.page <= last);
  const a = lengths(tape, first, last);
  const freq = Array(29).fill(0);
  for (const x of seq) freq[x.v]++;
  let equal = 0;
  for (let i = 1; i < seq.length; i++) equal += Number(seq[i].v === seq[i - 1].v);
  return {
    runes: seq.length, words: a.length, oneRuneWords: a.filter((x) => x === 1).length,
    maxWordLength: Math.max(...a), bigramLengthNats: score(a),
    adjacentEqualRunes: equal,
    runeIoC: freq.reduce((s, f) => s + f * (f - 1), 0) / (seq.length * (seq.length - 1))
  };
}

/** Reversible internal known-GP donor plant, independent of scoring donor texts. */
function knownGPPlant(size) {
  const source = load("resources/control/emerson_essays_2944.txt");
  const alphabet = SOURCE.translit.slice().sort((a, b) => b.length - a.length);
  const values = new Map(SOURCE.translit.map((x, i) => [x, i]));
  const output = [];
  for (const match of source.matchAll(/[A-Za-z]+/g)) {
    const word = match[0].toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
    let at = 0;
    const before = output.length;
    while (at < word.length) {
      const part = alphabet.find((s) => word.startsWith(s, at));
      if (!part) break;
      output.push({v: values.get(part), after: "", page: 16, local: output.length});
      at += part.length;
    }
    if (at === word.length && output.length > before) {
      output[output.length - 1].after = "-";
    } else {
      output.length = before;
    }
    if (output.length >= size + 16) break;
  }
  assert(output.length >= size);
  return output.slice(0, size);
}

function assertExact(a, b) {
  assert.deepEqual(a.map((x) => [x.v, x.after, x.page, x.local]),
    b.map((x) => [x.v, x.after, x.page, x.local]));
}

function main() {
  const source = originalTape();
  const score = languageModel();
  const chapters = [
    {label:"p15–22", first:15, last:22, red:9, evaluate:[16,21]},
    {label:"p40–53", first:40, last:53, red:8, evaluate:[40,53]}
  ];
  const observations = [];
  for (const c of chapters) {
    const baseline = metrics(source, ...c.evaluate, score);
    const directions = [];
    for (const dir of [0, 1]) {
      const decoded = permute(source, c.first, c.last, c.red, dir);
      const restored = permute(decoded, c.first, c.last, c.red, /** @type {0|1} */ (1-dir));
      assertExact(restored, source);
      const m = metrics(decoded, ...c.evaluate, score);
      assert.equal(m.runes, baseline.runes);
      directions.push({direction:dir, ...m});
    }
    observations.push({chapter:c.label, baseline, directions});
  }

  const native = knownGPPlant(3008);
  for (const dir of [0, 1]) {
    const encrypted = permute(native, 16, 16, 0, dir);
    const recovered = permute(encrypted, 16, 16, 0, /** @type {0|1} */ (1-dir));
    assertExact(recovered, native);
    assert.equal(lengths(recovered, 16, 16).join(","),
      lengths(native, 16, 16).join(","));
  }
  assert.equal(observations[0].baseline.runes, 1613);
  assert.equal(observations[1].baseline.runes, 3008);
  assert(observations[0].directions.every((x) =>
    x.bigramLengthNats < observations[0].baseline.bigramLengthNats));
  assert(observations[1].directions.every((x) =>
    x.oneRuneWords > observations[1].baseline.oneRuneWords * 4));
  console.log(JSON.stringify({spiral:SPIRAL, observations,
    positive:"3008-rune independent Emerson GP plant recovers exact value and boundary tape in both directions",
    verdict:"No native-GP original plaintext or reproducible source-derived key; bounded 16-slot spiral register negative"}, null, 2));
  console.log("PASS exact original roundtrip / authentic-input structural gate / independent GP plant");
}

main();
