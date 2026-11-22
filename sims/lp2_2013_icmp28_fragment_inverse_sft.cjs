"use strict";

/**
 * Source-locked original-cipher inverse for the 2013 ICMP 28-packet register
 * against LP2's 28 pre-solved-page 13-dot-delimited fragment slots.
 *
 * This is a deliberately finite candidate, not a historical key claim.
 * Run on Windows 11 with Node.js 22: node sims/lp2_2013_icmp28_fragment_inverse_sft.cjs
 *
 * @typedef {{format:"GP29"|"Delta28", sign:-1|1}} Mode
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encode, train } = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const packetLines = read("resources/historical/cicada2013-second-onion-icmp-echo.hex.txt")
  .trim().split(/\r?\n/u);
const packets = packetLines.map(line => Array.from(Buffer.from(line, "hex")));
const gpText = corpus.pages.flatMap(page => page.indices);

const pageStart = [];
let total = 0;
for (const page of corpus.pages) {
  pageStart[page.page] = total;
  total += page.indices.length;
}
const marks = ink.pages.flatMap(page => (page.large_punctuation || [])
  .filter(mark => mark[1] === 13)
  .map(mark => pageStart[page.page] + mark[0]))
  .sort((a, b) => a - b);
const cuts = [0, ...marks];
const unsolved = gpText.slice(0, 12956);
const fragmentSlots = Array.from({ length: 28 }, (_, index) =>
  unsolved.slice(cuts[index], index === 27 ? unsolved.length : cuts[index + 1]));

assert.equal(total, 13136);
assert.equal(unsolved.length, 12956);
assert.equal(marks.length, 31);
assert.equal(packets.length, 28);
assert.deepEqual(packets.map(bytes => bytes.length),
  [...Array(27).fill(28), 22]);
assert.equal(fragmentSlots.length, 28);
assert.deepEqual(fragmentSlots.flat(), unsolved);
assert.deepEqual(fragmentSlots.map((segment, index) => segment.length ? -1 : index)
  .filter(index => index >= 0), [8, 11]);
assert.equal(fragmentSlots[27].length, 299);

/** @param {number} value @param {number} modulus @returns {number} */
const mod = (value, modulus) => (value % modulus + modulus) % modulus;

/**
 * @param {number[][]} fragments
 * @param {Mode} mode
 * @returns {number[][]}
 */
function decrypt(fragments, mode) {
  return fragments.map((fragment, slot) => {
    let previous = 0;
    const key = packets[slot];
    return fragment.map((cipher, offset) => {
      const byte = key[offset % key.length];
      const result = mode.format === "GP29" || offset === 0
        ? mod(cipher + mode.sign * (byte % 29), 29)
        : cipher === previous ? 28 :
          mod(mod(cipher - previous, 29) - 1 + mode.sign * (byte % 28), 28);
      previous = cipher;
      return result;
    });
  });
}

/**
 * @param {number[][]} fragments
 * @param {Mode} mode
 * @returns {number[][]}
 */
function encrypt(fragments, mode) {
  return fragments.map((fragment, slot) => {
    let previous = 0;
    const key = packets[slot];
    return fragment.map((plain, offset) => {
      const byte = key[offset % key.length];
      const cipher = mode.format === "GP29" || offset === 0
        ? mod(plain - mode.sign * (byte % 29), 29)
        : plain === 28 ? previous :
          mod(previous + 1 + mod(plain - mode.sign * (byte % 28), 28), 29);
      previous = cipher;
      return cipher;
    });
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const rune of values) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const sourceEnglish = read("resources/control/shakespeare_first300k.txt");
const model = train(sourceEnglish.slice(0, 180000));
const native = encode(sourceEnglish.slice(200000)).slice(0, unsolved.length);
assert.equal(native.length, unsolved.length);
/** @param {number[]} values @returns {number} */
function trigram(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i++) {
    sum += model.trigram[(values[i - 2] * 29 + values[i - 1]) * 29 + values[i]];
  }
  return sum / (values.length - 2);
}
const splitNative = [];
let at = 0;
for (const slot of fragmentSlots) {
  splitNative.push(native.slice(at, at + slot.length));
  at += slot.length;
}
assert.equal(at, native.length);
assert.deepEqual(splitNative.flat(), native);

const modes = [];
for (const format of ["GP29", "Delta28"]) {
  for (const sign of [-1, 1]) {
    /** @type {Mode} */
    const mode = { format, sign };
    const decoded = decrypt(fragmentSlots, mode);
    const reconstructed = encrypt(decoded, mode);
    assert.deepEqual(reconstructed, fragmentSlots);
    const flat = decoded.flat();

    const planted = encrypt(splitNative, mode);
    const recoveredNative = decrypt(planted, mode);
    assert.deepEqual(recoveredNative, splitNative);
    assert.deepEqual(encrypt(recoveredNative, mode), planted);
    modes.push({
      ...mode,
      ioc: ioc(flat),
      trigram: trigram(flat),
      preview: flat.slice(0, 48).map(index => corpus.translit[index]).join(""),
      originalRoundTrip: flat.length,
      nativePlantRecovered: recoveredNative.flat().length
    });
  }
}
assert.equal(modes.length, 4);
assert.ok(modes.every(result => result.ioc < 0.04));
const outcome = {
  status: "PASS",
  source: {
    2013: "resources/historical/cicada2013-second-onion-icmp-echo.hex.txt",
    LP2: ["resources/liber-primus/lp2-corpus.json",
      "resources/liber-primus/lp2-ink-annotations.json"],
    packetLines: packets.length,
    packetLengths: packets.map(x => x.length),
    inkMarks: marks.length,
    unsolvedFragmentSlots: fragmentSlots.length,
    emptySlots: [8, 11],
    unknownRunes: unsolved.length
  },
  models: modes,
  controls: {
    rawOriginalIoC: ioc(unsolved),
    rawOriginalTrigram: trigram(unsolved),
    independentNativeIoC: ioc(native),
    independentNativeTrigram: trigram(native)
  },
  interpretation: "Source-ordered packet bytes used as repeating per-fragment GP29 additive or GP28 nonzero-difference masks. No original unknown plaintext."
};
console.log(JSON.stringify(outcome, null, 2));
