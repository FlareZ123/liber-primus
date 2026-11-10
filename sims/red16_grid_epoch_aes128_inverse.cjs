"use strict";

/**
 * Source-frozen LP2 red-epoch × 16-byte grid AES-128 inversion.
 * Every original red span opens a new CTR epoch. The printed 32×8
 * base-60 table, row-major, yields 16 consecutive 16-byte AES keys.
 * Original black runes use direct GP29 additive masking. No key fitting.
 *
 * Execute: node sims/red16_grid_epoch_aes128_inverse.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const read = (relative) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const annotations = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json");
const physicalPages = corpus.pages.filter((p) => p.page <= 55);
const C = physicalPages.flatMap((p) => p.indices);
assert.equal(C.length, 12956);

const offsets = new Map();
let globalPosition = 0;
for (const page of corpus.pages) {
  offsets.set(page.page, globalPosition);
  globalPosition += page.indices.length;
}
const red = annotations.pages.flatMap((page) =>
  (page.red_spans || []).filter(() => page.page <= 55).map((span) => ({
    page: page.page, local: span.start,
    start: offsets.get(page.page) + span.start,
    end: offsets.get(page.page) + span.start + span.length,
    length: span.length
  }))
).sort((a, b) => a.start - b.start);

assert.equal(red.length, 16);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));
const gridBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(gridBytes.length, 256);
const keys = Array.from({length: 16}, (_, k) =>
  gridBytes.subarray(k * 16, (k + 1) * 16));
const iv = Buffer.alloc(16, 0);
const epochs = red.map((span, index) => ({
  id: index, start: span.end,
  end: index + 1 < red.length ? red[index + 1].start : C.length,
  redStart: span.start, redEnd: span.end
}));
assert.equal(epochs[0].redStart, 0);
assert.ok(epochs.every((e) => e.start <= e.end));

/**
 * Run the *same* GP29 mask codec in both directions.
 * @param {number[]} input GP rune values
 * @param {Buffer[]} epochKeys 16 AES keys
 * @param {1|-1} sign +1 encrypt, -1 decrypt
 * @returns {number[]}
 */
function apply(input, epochKeys, sign) {
  const output = input.slice();
  for (const epoch of epochs) {
    const n = epoch.end - epoch.start;
    const aes = crypto.createCipheriv("aes-128-ctr", epochKeys[epoch.id], iv);
    const stream = Buffer.concat([aes.update(Buffer.alloc(n)), aes.final()]);
    assert.equal(stream.length, n);
    for (let i = 0; i < n; i++) {
      const at = epoch.start + i;
      output[at] = ((input[at] + sign * (stream[i] % 29)) % 29 + 29) % 29;
    }
  }
  return output;
}

function cipherOnly(data) {
  return epochs.flatMap((e) => data.slice(e.start, e.end));
}
function coincidence(data) {
  const hist = Array(29).fill(0);
  for (const x of data) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    hist[x]++;
  }
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}
function periodIoC(data, start, end) {
  const selected = epochs.flatMap((e) => {
    const lo = Math.max(e.start, start);
    const hi = Math.min(e.end, end);
    return lo < hi ? data.slice(lo, hi) : [];
  });
  return {count: selected.length, ioc: coincidence(selected)};
}
function format(data, at, width) {
  return data.slice(at, at + width).map((x) => corpus.translit[x]).join(" ");
}

const original = apply(C, keys, -1);
const replay = apply(original, keys, +1);
assert.deepEqual(replay, C);
const wrongKeys = keys.map((k) => Buffer.from([...k].reverse()));
const wrong = apply(C, wrongKeys, -1);

// Solved p57 is a historical native-GP plaintext anchor, used only
// for exact artificial cipher recovery; it is NOT used to fit original keys.
const anchor = corpus.pages.find((p) => p.page === 57).indices;
assert.ok(anchor.length >= 90);
const synthetic = C.slice();
let j = 0;
for (const e of epochs) {
  for (let t = e.start; t < e.end; t++) {
    synthetic[t] = anchor[j % anchor.length];
    j++;
  }
}
const syntheticCipher = apply(synthetic, keys, +1);
const syntheticRecovered = apply(syntheticCipher, keys, -1);
assert.deepEqual(syntheticRecovered, synthetic);
assert.deepEqual(apply(syntheticRecovered, keys, +1), syntheticCipher);

const mid = physicalPages.filter((p) => p.page <= 27)
  .reduce((sum, p) => sum + p.indices.length, 0);
const printable = cipherOnly(original);
const result = {
  test: "16 red-span epochs × 16 sequential grid AES128CTR keys",
  source: "unsolved p0–55 original, base60 row-major, zero IV per epoch, byte modulo29",
  redSpans: red.map(({page,local,length,start,end}) => ({page,local,length,start,end})),
  epochLengths: epochs.map((e) => e.end - e.start),
  nonRedCipherRunes: printable.length,
  exactOriginalRecipher: replay.every((x, i) => x === C[i]),
  exactSyntheticRecovery: syntheticRecovered.every((x, i) => x === synthetic[i]),
  originalIoC: coincidence(cipherOnly(C)),
  decodedIoC: coincidence(printable),
  wrongReversedKeyIoC: coincidence(cipherOnly(wrong)),
  originalTraining: periodIoC(original, 0, mid),
  originalHeldout: periodIoC(original, mid, C.length),
  syntheticIoC: coincidence(cipherOnly(syntheticRecovered)),
  decodedFirstBlack60: format(original, epochs[0].start, 60),
  decodedLastBlack60: format(original, epochs.at(-1).start, 60)
};
console.log(JSON.stringify(result, null, 2));
assert.equal(result.exactOriginalRecipher, true);
assert.equal(result.exactSyntheticRecovery, true);
