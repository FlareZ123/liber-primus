"use strict";

/**
 * Source-native, bounded attempt to read the LP2 cuneiform chapter as a
 * typed BASE29 integer/byte register, retaining original word separators.
 *
 * Claim: only direct GP-index-as-BASE29-digit translations are tested.
 * The signed 2013 Cicada BASE29 command does NOT authenticate the rune-digit
 * map, binary serialization, page clock, or a full LP2 cipher.
 *
 * Windows 11 / Node.js 22 SFT:
 *   node sims/lp2_cuneiform_base29_typed_register_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRS";

/** @param {number} n @returns {string} */
function historicalBase29(n) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  let value = n, text = "";
  do {
    text = DIGITS[value % 29] + text;
    value = Math.floor(value / 29);
  } while (value > 0);
  return text;
}

/** @param {number[]} digits @returns {number[]} */
function toMinimalBytes(digits) {
  let value = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  const bytes = [];
  do {
    bytes.push(Number(value & 255n));
    value >>= 8n;
  } while (value > 0n);
  return bytes.reverse();
}

/** @param {number[]} bytes @returns {number[]} */
function fromBytes(bytes) {
  let value = 0n;
  for (const byte of bytes) {
    assert.ok(Number.isInteger(byte) && byte >= 0 && byte < 256);
    value = value * 256n + BigInt(byte);
  }
  const digits = [];
  do {
    digits.push(Number(value % 29n));
    value /= 29n;
  } while (value > 0n);
  return digits.reverse();
}

/** @param {number[][]} sections @param {number} width @param {number} maxValue */
function fixedBlockGate(sections, width, maxValue) {
  return sections.map(section => {
    let blocks = 0, invalid = 0, firstInvalid = null;
    for (let i = 0; i + width <= section.length; i += width) {
      let value = 0;
      for (const digit of section.slice(i, i + width)) {
        value = 29 * value + digit;
      }
      blocks++;
      if (value >= maxValue) {
        invalid++;
        if (firstInvalid === null) firstInvalid = i;
      }
    }
    return { blocks, invalid, firstInvalidRune: firstInvalid };
  });
}

/** @param {number} n @param {number} k @returns {number} */
function uniformRunProbAtMost(n, k) {
  let term = Math.pow(28 / 29, n), sum = term;
  for (let i = 0; i < k; i++) {
    term *= (n - i) / ((i + 1) * 28);
    sum += term;
  }
  return sum;
}

/** @param {number[]} bytes @returns {string} */
const hex = bytes => bytes.map(b => b.toString(16).padStart(2, "0")).join(" ");

function main() {
  assert.equal(historicalBase29(3301), "3QO"); // 2013 signed TCP example.
  assert.equal(historicalBase29(1033), "16I"); // Derived arithmetic.
  assert.deepEqual(fromBytes(toMinimalBytes([3, 26, 24])), [3, 26, 24]);

  const fixture = [...Buffer.from("01 OK\n3QO\n.\n", "ascii")];
  assert.deepEqual(toMinimalBytes(fromBytes(fixture)), fixture);

  // Source transcription separates physical pages with %, prints & between
  // p33's 91-rune preface and marked chapter. Line wraps do not split words.
  const pageTexts = read("resources/liber-primus/lp2-transcription.txt")
    .split("%").slice(33, 40);
  assert.equal(pageTexts.length, 7);
  pageTexts[0] = pageTexts[0].slice(pageTexts[0].indexOf("&") + 1);
  const sections = pageTexts.map(text =>
    [...text].filter(ch => index.has(ch)).map(ch => index.get(ch)));
  assert.deepEqual(sections.map(s => s.length),
    [123, 261, 271, 238, 228, 228, 240]);
  const originals = corpus.pages.filter(p => p.page >= 33 && p.page <= 39);
  assert.deepEqual(sections,
    originals.map((p, i) => i === 0 ? p.indices.slice(91) : p.indices));
  const digits = sections.flat();
  assert.equal(digits.length, 1589);

  // Signed BASE29 operates on an integer. Candidate A interprets the
  // entire marked seven-page stream as one numeral and emits its shortest
  // big-endian byte representation. No secret key, clock or padding.
  const entireBytes = toMinimalBytes(digits);
  assert.equal(entireBytes.length, 965);
  assert.deepEqual(entireBytes.slice(0, 3), [0x75, 0x1f, 0x52]);
  assert.ok((entireBytes[0] & 0x80) === 0); // Not a raw OpenPGP packet header.
  const rawPacket = Buffer.from(entireBytes);
  assert.ok(!rawPacket.subarray(0, 10).toString("ascii")
    .startsWith("-----BEGIN"));
  assert.ok(!rawPacket.subarray(0, 5).toString("ascii")
    .startsWith("01 OK"));

  const pageBytes = sections.map(toMinimalBytes);
  assert.deepEqual(pageBytes.map(p => p.length),
    [75, 159, 165, 145, 139, 138, 146]);
  assert.deepEqual(pageBytes.map(p => p[0]),
    [0x21, 0x0a, 0x10, 0x10, 0x04, 0xca, 0x1f]);

  // Candidate B treats actual printed GP rune words as separately delimited
  // BASE29 numerals; no inserted discretionary segmentation.
  const words = pageTexts.join("").split(/[-.&$§]/)
    .map(text => [...text].filter(ch => index.has(ch)).map(ch => index.get(ch)))
    .filter(word => word.length);
  assert.equal(words.length, 355);
  assert.equal(words.reduce((n, w) => n + w.length, 0), 1589);
  const singletonValues = words.filter(w => w.length === 1).map(w => w[0]);
  assert.deepEqual(singletonValues, [13, 23, 22, 4, 7, 18, 12, 2, 8]);
  const wordBytes = words.flatMap(toMinimalBytes);
  const printable = wordBytes.filter(b => b >= 32 && b <= 126).length;
  assert.equal(wordBytes.length, 1088);
  assert.equal(printable, 376);
  assert.deepEqual(wordBytes.slice(0, 4), [0x45, 0x43, 0x6b, 0xff]);

  // Candidate C: simplest fixed-width BASE29 numeral-to-byte codecs.
  // A 2-digit BASE29 word is valid as a byte only when <256. A 5-digit
  // BASE29 word is valid as 3 bytes only when <2^24. Here both fail.
  const pairs = fixedBlockGate(sections, 2, 256);
  const quintuples = fixedBlockGate(sections, 5, 16777216);
  assert.deepEqual(pairs.map(x => x.invalid),
    [43, 87, 100, 83, 79, 77, 83]);
  assert.deepEqual(quintuples.map(x => x.invalid),
    [7, 10, 9, 10, 7, 7, 8]);
  assert.equal(pairs.reduce((n, x) => n + x.invalid, 0), 552);
  assert.equal(quintuples.reduce((n, x) => n + x.invalid, 0), 58);

  // Direct numeral-to-random-bytes encoding would also tend to distribute
  // GP29 digits nearly independently. This is a model-conditional baseline,
  // not a claim that every typed artifact has independent digits.
  const links = sections.reduce((n, s) => n + s.length - 1, 0);
  const equal = sections.reduce((n, s) =>
    n + s.slice(1).filter((x, i) => x === s[i]).length, 0);
  assert.equal(links, 1582);
  assert.equal(equal, 12);
  const chance = uniformRunProbAtMost(links, equal);
  assert.ok(Math.abs(chance / 2.081697079493993e-12 - 1) < 1e-9);

  console.log(JSON.stringify({
    source: "original LP2 physical pp33–39, 91-rune p33 preface excluded",
    authored2013BASE29Example: historicalBase29(3301),
    predicted1033: historicalBase29(1033),
    originalRunes: digits.length, physicalPageRunes: sections.map(s => s.length),
    wholeRegister: { bytes: entireBytes.length, first3Hex: hex(entireBytes.slice(0, 3)),
      acceptsRawOpenPGPPacketHeader: false, starts2013TCPResponse: false },
    perPage: pageBytes.map((p, i) => ({ physicalPage: 33 + i,
      bytes: p.length, firstByteHex: hex(p.slice(0, 1)) })),
    printedWordRegister: { wordCount: words.length, byteCount: wordBytes.length,
      first4Hex: hex(wordBytes.slice(0, 4)), printableBytes: printable,
      nonAsciiControlOneRuneWords: singletonValues },
    fixed2RuneByte: pairs, fixed5Rune3Byte: quintuples,
    directIIDDigitNull: { pageInternalLinks: links,
      equalAdjacentDigits: equal, expected: links / 29,
      probabilityAtMostObserved: chance },
    nativePositive: "historical BASE29 example and exact binary TCP fixture roundtrip",
    decision: "Neither direct numeral serialization nor printed-word-bytes yields an authenticated typed message. No signed first-party rune map or LP2 byte-serialization opcode exists."
  }, null, 2));
}

if (require.main === module) main();
module.exports = { historicalBase29, toMinimalBytes, fromBytes,
  fixedBlockGate, uniformRunProbAtMost, main };
