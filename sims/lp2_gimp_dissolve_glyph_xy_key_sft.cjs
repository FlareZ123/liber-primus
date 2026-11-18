"use strict";

/**
 * Original-coordinate GIMP Dissolve GP29 key gate for LP2 p55.
 *
 * Source-conditioned question: a visibly stippled illustration on p57 has
 * been attributed to GIMP Dissolve, whose GLib field starts at seed 314159265.
 * Earlier trials consumed its PRNG sequentially. This distinct trial samples
 * that same fixed two-dimensional field at literal rune rectangles of original
 * p55 image 72.jpg. No offsets or seeds are searched.
 *
 * Positive: every candidate decoder exactly reverses a native-GP known-page
 * plaintext plant using the same source geometry.
 *
 * Windows-compatible, Node.js 22+, CommonJS, built-in modules only.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const geometry = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources", "liber-primus", "lp2-p55-source-glyph-coordinates.json"), "utf8"));
const sourceImage = fs.readFileSync(path.join(ROOT, geometry.original_image));
assert.equal(crypto.createHash("sha256").update(sourceImage).digest("hex"),
  geometry.sha256);
const cipher = corpus.pages[55].indices;
const nativePlant = corpus.pages[57].indices.slice(0, cipher.length);
assert.equal(cipher.length, 76);
assert.equal(geometry.glyphs.length, 76);
assert.equal(nativePlant.length, 76);
for (let i = 0; i < cipher.length; i++) {
  assert.equal(geometry.glyphs[i].ordinal, i + 1);
  assert.equal(geometry.glyphs[i].gp29_index, cipher[i]);
}

/** Reproduce the GLib 2.2 MT19937 GIMP field and range reduction exactly. */
class GRand {
  constructor(seed) {
    this.mt = new Uint32Array(624);
    this.index = 624;
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      this.mt[i] = (Math.imul(1812433253,
        this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)) + i) >>> 0;
    }
  }

  int() {
    if (this.index >= 624) {
      for (let i = 0; i < 624; i++) {
        const value = (this.mt[i] & 0x80000000) |
          (this.mt[(i + 1) % 624] & 0x7fffffff);
        this.mt[i] = (this.mt[(i + 397) % 624] ^ (value >>> 1) ^
          ((value & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.index = 0;
    }
    let value = this.mt[this.index++];
    value ^= value >>> 11;
    value ^= (value << 7) & 0x9d2c5680;
    value ^= (value << 15) & 0xefc60000;
    value ^= value >>> 18;
    return value >>> 0;
  }

  range(end) {
    const doubled = (0x80000000 % end) * 2;
    const leftover = doubled >= end ? doubled - end : doubled;
    const maximum = 0xffffffff - leftover;
    let value;
    do {
      value = this.int();
    } while (value > maximum);
    return value % end;
  }
}

const master = new GRand(314159265);
const rowSeeds = Array.from({ length: 4096 }, () => master.int());
assert.deepEqual(rowSeeds.slice(0, 4),
  [3721122731, 618219707, 807213306, 3144837749]);
const rowZero = new GRand(rowSeeds[0]);
const firstRow = Array.from({ length: 16 }, () => rowZero.range(255));
assert.deepEqual(firstRow, [87, 10, 191, 6, 133, 152, 5, 71,
  134, 199, 88, 235, 186, 95, 169, 95]);

/**
 * Sample an unchanged field at three natural bbox anchor conventions.
 * GIMP constructs each row's generator from its original 4096 row seeds.
 */
function glyphKey(anchor) {
  const perRow = new Map();
  return geometry.glyphs.map(({ rect }) => {
    const [x0, y0, x1, y1] = rect;
    const x = anchor === "top-left" ? x0 :
      anchor === "center" ? Math.floor((x0 + x1) / 2) : x1;
    const y = anchor === "top-left" ? y0 :
      anchor === "center" ? Math.floor((y0 + y1) / 2) : y1;
    assert.ok(x >= 0 && x < 2400 && y >= 0 && y < 3600);
    if (!perRow.has(y)) perRow.set(y, { rand: new GRand(rowSeeds[y]), nextX: 0 });
    const state = perRow.get(y);
    assert.ok(state.nextX <= x, "Source glyphs must be in row-major x order");
    let pixel;
    while (state.nextX <= x) {
      pixel = state.rand.range(255);
      state.nextX++;
    }
    return pixel % 29;
  });
}

const mod29 = (value) => ((value % 29) + 29) % 29;

/** Decode an original 76-rune tape with source coordinate fixed key. */
function decode(tape, key, feedback, sign) {
  return tape.map((value, i) => mod29(
    value - (feedback && i ? tape[i - 1] : 0) + sign * key[i]));
}

/** Encrypt a known native passage for exact inverse controls. */
function encode(plain, key, feedback, sign) {
  const tape = [];
  for (let i = 0; i < plain.length; i++) {
    tape.push(mod29(plain[i] + (feedback && i ? tape[i - 1] : 0)
      - sign * key[i]));
  }
  return tape;
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

const results = [];
for (const anchor of ["top-left", "center", "bottom-right"]) {
  const key = glyphKey(anchor);
  for (const feedback of [false, true]) {
    for (const sign of [-1, 1]) {
      const planted = encode(nativePlant, key, feedback, sign);
      assert.deepEqual(decode(planted, key, feedback, sign), nativePlant);
      const plain = decode(cipher, key, feedback, sign);
      assert.deepEqual(encode(plain, key, feedback, sign), cipher);
      results.push({
        anchor,
        feedback,
        sign,
        indexOfCoincidence: ioc(plain),
        transliteration: plain.map((n) => corpus.translit[n]).join("")
      });
    }
  }
}

console.log(JSON.stringify({
  origin: "original LP2 p55 JPEG glyph rectangles",
  originalImageSHA256: geometry.sha256,
  nativeSolvedPage57PrefixIOC: ioc(nativePlant),
  uniformGP29ExpectedIOC: 1 / 29,
  sourceRunes: cipher.length,
  rowSeedCount: 4096,
  sourceSeed: 314159265,
  rowSeeds: rowSeeds.slice(0, 4),
  first16Row0Field: firstRow,
  allPlantAndReencodeControlsPass: true,
  results
}, null, 2));
