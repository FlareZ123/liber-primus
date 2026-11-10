"use strict";

/**
 * Exploratory, source-frozen comparison between 256 marked LP2 events and the
 * manuscript's 256-byte base-60 table. No cipher or key is assumed authentic.
 * Run: node sims/red_13dot_256_event_mapping.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const annotation = read("resources/liber-primus/lp2-ink-annotations.json");
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
const pages = new Map(corpus.pages.map((p) => [p.page, p]));
const runeIds = new Map(corpus.runes.map((s, i) => [s, i]));

/** @returns {number[]} GP indices for red glyphs and 29 for 13-dot marks. */
function eventsInBookOrder() {
  /** @type {number[]} */
  const events = [];
  let markedRed = 0;
  let markedDots = 0;

  for (const page of annotation.pages) {
    const original = pages.get(page.page);
    assert(original, "missing original rune page");
    /** @type {{position:number,kind:number,value:number}[]} */
    const members = [];

    for (const span of page.red_spans || []) {
      const glyphs = [...span.runes];
      assert.equal(glyphs.length, span.length);
      for (let i = 0; i < glyphs.length; i++) {
        const index = runeIds.get(glyphs[i]);
        assert.notEqual(index, undefined, "unmapped GP glyph");
        assert.equal(original.indices[span.start + i], index);
        members.push({ position: span.start + i, kind: 1, value: index });
        markedRed++;
      }
    }

    for (const mark of page.large_punctuation || []) {
      if (mark[1] !== 13) continue;
      members.push({ position: mark[0], kind: 0, value: 29 });
      markedDots++;
    }

    // Punctuation at offset k follows the kth preceding rune and therefore
    // occurs before a red rune with position k.
    members.sort((a, b) => a.position - b.position || a.kind - b.kind);
    events.push(...members.map((x) => x.value));
  }

  assert.equal(markedRed, 225);
  assert.equal(markedDots, 31);
  assert.equal(events.length, 256);
  return events;
}

const events = eventsInBookOrder();
const grid = table.byte_rows.flat();
assert.equal(table.byte_rows.length, 32);
assert(table.byte_rows.every((row) => row.length === 8));
assert.equal(grid.length, 256);
assert(grid.every((x) => Number.isInteger(x) && x >= 0 && x < 256));

const red = events.filter((x) => x !== 29);
const chronological = events.map((x) => x === 29 ? null : x);
/** @type {(number|null)[]} */
const interior = Array(256).fill(null);
let at = 0;
for (let y = 1; y < 16; y++) {
  for (let x = 1; x < 16; x++) interior[y * 16 + x] = red[at++];
}
assert.equal(at, 225);

const models = [
  { name: "event-chronological", runes: chronological },
  { name: "15x15-interior", runes: interior },
];

function squareTransform(y, x, orientation) {
  if (orientation & 4) x = 15 - x;
  if (orientation & 1) [y, x] = [x, y];
  if (orientation & 2) y = 15 - y;
  return y * 16 + x;
}

const orientations = [];
for (let column = 0; column < 2; column++) {
  for (let o = 0; o < 8; o++) {
    const offsets = [];
    for (let i = 0; i < 256; i++) {
      const j = squareTransform(Math.floor(i / 16), i % 16, o);
      offsets.push(column ? (j % 16) * 16 + Math.floor(j / 16) : j);
    }
    orientations.push({ column, o, offsets });
  }
}

/**
 * Optimize all 28 nonzero slopes and all 29 intercepts, for both natural
 * event geometries and all 16 table presentations. The score is the number
 * of original red GP symbols that can match grid bytes modulo 29.
 */
function bestAffine(bytes) {
  let best = { matches: -1 };
  for (const model of models) for (const orientation of orientations) {
    for (let slope = 1; slope < 29; slope++) {
      const hits = Array(29).fill(0);
      for (let i = 0; i < 256; i++) {
        const symbol = model.runes[i];
        if (symbol === null) continue;
        const g = bytes[orientation.offsets[i]] % 29;
        const intercept = (symbol - slope * g % 29 + 29) % 29;
        hits[intercept]++;
      }
      for (let intercept = 0; intercept < 29; intercept++) {
        if (hits[intercept] > best.matches) best = {
          matches: hits[intercept], geometry: model.name,
          column: orientation.column, orientation: orientation.o,
          slope, intercept,
        };
      }
    }
  }
  return best;
}

let seed = 0x330131;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

const observed = bestAffine(grid);
const shuffled = [];
for (let i = 0; i < 400; i++) {
  const bytes = grid.slice();
  for (let j = bytes.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [bytes[j], bytes[k]] = [bytes[k], bytes[j]];
  }
  shuffled.push(bestAffine(bytes).matches);
}
shuffled.sort((a, b) => a - b);
const exceed = shuffled.filter((x) => x >= observed.matches).length;

// Positive control: a planted affine transform must recover all 225 red
// symbols, even with the alternate interior geometry and table rotation.
const plant = Array(256).fill(0);
const selected = orientations[9];
for (let i = 0; i < 256; i++) {
  if (interior[i] === null) continue;
  plant[selected.offsets[i]] = ((interior[i] - 23 + 29) * 4) % 29;
}
assert.equal(bestAffine(plant).matches, 225);

const source = Buffer.from(events); // 29 is a deliberately chosen marker code.
const sourceVariants = [
  source,
  Buffer.from([...source].reverse()),
  ...Array.from({ length: 8 }, (_, i) => source.subarray(i * 32, (i + 1) * 32)),
  ...Array.from({ length: 8 }, (_, i) => Buffer.from([...source].filter((_, j) => j % 8 === i))),
];
const gridTargets = [
  ...Array.from({ length: 8 }, (_, i) => Buffer.from(grid.filter((_, j) => j % 8 === i))),
  ...Array.from({ length: 8 }, (_, i) => Buffer.from(grid.slice(i * 32, (i + 1) * 32))),
];
let maxEqualBytes = 0;
let exactDigestMatches = 0;
let hashComparisons = 0;
for (const algorithm of ["sha256", "sha512", "sha3-256", "blake2s256"]) {
  for (const input of sourceVariants) {
    const digest = crypto.createHash(algorithm).update(input).digest().subarray(0, 32);
    for (const target of gridTargets) {
      let equal = 0;
      for (let i = 0; i < 32; i++) equal += Number(digest[i] === target[i]);
      maxEqualBytes = Math.max(maxEqualBytes, equal);
      exactDigestMatches += Number(equal === 32);
      hashComparisons++;
    }
  }
}

console.log(JSON.stringify({
  evidence: "Exploratory 256-event source coincidence; no original cipher inversion",
  source: { red_runes: red.length, thirteen_dot_marks: 31, all_events: events.length },
  affine: {
    observed, null_n: shuffled.length, null_mean: shuffled.reduce((a, b) => a + b, 0) / shuffled.length,
    null_q95: shuffled[379], null_max: shuffled[399], null_ge_observed: exceed,
    upper_tail_add_one: (exceed + 1) / (shuffled.length + 1),
    planted_recovery: 225,
  },
  hash: { comparisons: hashComparisons, max_equal_bytes: maxEqualBytes, exact_digest_matches: exactDigestMatches },
}, null, 2));
