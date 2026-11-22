"use strict";
/**
 * Lossless per-printed-word GP29 integer -> fixed-width byte-field gate.
 * Node.js 22, CommonJS, no dependencies and no file writes.
 *
 * Each n-rune word is a base29 integer N. Its byte field is the minimum
 * big-endian width b satisfying 256^b >= 29^n. The original word length
 * supplies the field framing, so leading zero GP digits are preserved.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const raw = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gpRunes = corpus.runes;
const gpIndex = new Map(gpRunes.map((r, i) => [r, i]));
assert.equal(gpRunes.length, 29);

const unknown = parseLP2Words(raw, 55);
const allPages = parseLP2Words(raw, 57);
assert.equal(unknown.words.length, 2896);
assert.equal(unknown.runeCount, 12956);
assert.equal(unknown.crossPageWords, 32);
assert.equal(allPages.runeCount, 13136);
const sourceIndices = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const reconstructed = [...unknown.words.map((w) => w.runes).join("")]
  .map((r) => gpIndex.get(r));
assert.deepEqual(reconstructed, sourceIndices);

const chapters = [
  {
    name: "chapter-1-p0-2",
    words: unknown.words.filter((w) => {
      const p = physicalLP2Page(w.startPage);
      return p >= 0 && p <= 2;
    })
  },
  {
    name: "chapter-2-p3-7",
    words: unknown.words.filter((w) => {
      const p = physicalLP2Page(w.startPage);
      return p >= 3 && p <= 7;
    })
  }
];
assert.equal(chapters[0].words.length, 158);
assert.equal(chapters[0].words.reduce((s, w) => s + w.length, 0), 729);
assert.equal(chapters[1].words.length, 255);
assert.equal(chapters[1].words.reduce((s, w) => s + w.length, 0), 1145);
for (const word of [...chapters[0].words, ...chapters[1].words]) {
  const start = physicalLP2Page(word.startPage);
  const end = physicalLP2Page(word.endPage);
  assert(end <= (start <= 2 ? 2 : 7), "a word crosses the frozen chapter boundary");
}

const widthCache = new Map();
function fieldWidth(n) {
  if (widthCache.has(n)) return widthCache.get(n);
  const target = 29n ** BigInt(n);
  let capacity = 1n, width = 0;
  while (capacity < target) {
    capacity *= 256n;
    width++;
  }
  assert(width > 0);
  widthCache.set(n, width);
  return width;
}
function encodeField(digits) {
  const n = digits.length;
  const width = fieldWidth(n);
  const out = new Uint8Array(width);
  // 29^10 is below 2^53, so this fast path is exact.
  if (n <= 10) {
    let value = 0;
    for (const digit of digits) value = value * 29 + digit;
    for (let i = width - 1; i >= 0; i--) {
      out[i] = value % 256;
      value = Math.floor(value / 256);
    }
    assert.equal(value, 0, "Number field overflow");
    return out;
  }
  let value = 0n;
  for (const digit of digits) value = value * 29n + BigInt(digit);
  assert(value < 256n ** BigInt(width), "BigInt field overflow");
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n, "BigInt field overflow");
  return out;
}
function decodeField(bytes, n) {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  assert(value < 29n ** BigInt(n), "byte field exceeds its n-digit base29 range");
  const digits = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return digits;
}
function wordDigits(word) {
  return [...word.runes].map((r) => {
    const digit = gpIndex.get(r);
    assert.notEqual(digit, undefined, "non-GP symbol in source word");
    return digit;
  });
}
function encodeWords(words) {
  const fields = words.map((word) => encodeField(wordDigits(word)));
  const total = fields.reduce((s, f) => s + f.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const field of fields) {
    out.set(field, offset);
    offset += field.length;
  }
  return out;
}

function validUtf8(bytes) {
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i];
    if (c <= 0x7f) { i++; continue; }
    if (c >= 0xc2 && c <= 0xdf) {
      if (i + 1 >= bytes.length || (bytes[i + 1] & 0xc0) !== 0x80) return false;
      i += 2; continue;
    }
    if (c >= 0xe0 && c <= 0xef) {
      if (i + 2 >= bytes.length) return false;
      const a = bytes[i + 1], b = bytes[i + 2];
      if ((a & 0xc0) !== 0x80 || (b & 0xc0) !== 0x80) return false;
      if (c === 0xe0 && a < 0xa0) return false;
      if (c === 0xed && a >= 0xa0) return false;
      i += 3; continue;
    }
    if (c >= 0xf0 && c <= 0xf4) {
      if (i + 3 >= bytes.length) return false;
      const a = bytes[i + 1], b = bytes[i + 2], d = bytes[i + 3];
      if ((a & 0xc0) !== 0x80 || (b & 0xc0) !== 0x80 || (d & 0xc0) !== 0x80) return false;
      if (c === 0xf0 && a < 0x90) return false;
      if (c === 0xf4 && a >= 0x90) return false;
      i += 4; continue;
    }
    return false;
  }
  return true;
}
const signatures = [
  ["GZIP", [0x1f,0x8b,0x08]],
  ["ZIP", [0x50,0x4b,0x03,0x04]],
  ["PDF", [0x25,0x50,0x44,0x46,0x2d]],
  ["PNG", [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]],
  ["JPEG", [0xff,0xd8,0xff]],
  ["BZIP2", [0x42,0x5a,0x68]],
  ["XZ", [0xfd,0x37,0x7a,0x58,0x5a,0x00]],
  ["7z", [0x37,0x7a,0xbc,0xaf,0x27,0x1c]],
  ["RAR", [0x52,0x61,0x72,0x21,0x1a,0x07]],
  ["ELF", [0x7f,0x45,0x4c,0x46]],
  ["SQLite", [0x53,0x51,0x4c,0x69,0x74,0x65,0x20,0x66,0x6f,0x72,0x6d,0x61,0x74,0x20,0x33,0x00]],
  ["ID3", [0x49,0x44,0x33]],
  ["OggS", [0x4f,0x67,0x67,0x53]],
  ["PGP armor", [0x2d,0x2d,0x2d,0x2d,0x2d,0x42,0x45,0x47,0x49,0x4e,0x20,0x50,0x47,0x50]],
  ["HTML doctype", [0x3c,0x21,0x44,0x4f,0x43,0x54,0x59,0x50,0x45]],
  ["HTML tag", [0x3c,0x68,0x74,0x6d,0x6c]],
  ["XML", [0x3c,0x3f,0x78,0x6d,0x6c]]
];
function recognizeFormat(bytes) {
  const hits = [];
  for (const [name, sig] of signatures) {
    if (bytes.length >= sig.length && sig.every((v, i) => bytes[i] === v)) hits.push(name);
  }
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
    hits.push("RIFF/WAVE");
  }
  const utf8 = validUtf8(bytes);
  const noNul = !bytes.includes(0);
  const printable = bytes.filter((x) =>
    (x >= 0x20 && x <= 0x7e) || x === 0x09 || x === 0x0a || x === 0x0d
  ).length;
  const printableRatio = bytes.length ? printable / bytes.length : 0;
  if (bytes.every((x) => x < 0x80)) {
    try {
      JSON.parse(String.fromCharCode(...bytes));
      hits.push("JSON");
    } catch {}
  }
  if (utf8 && noNul && printableRatio >= 0.95 && bytes.length >= 64) {
    hits.push("UTF8-ASCII>=95%");
  }
  return {hits, validUtf8: utf8, noNul, printableRatio};
}

const actual = chapters.map((chapter) => {
  const bytes = encodeWords(chapter.words);
  const format = recognizeFormat(bytes);
  return {
    chapter: chapter.name,
    words: chapter.words.length,
    runes: chapter.words.reduce((s, w) => s + w.length, 0),
    bytes: bytes.length,
    first64Hex: Array.from(bytes.slice(0, 64), (x) => x.toString(16).padStart(2, "0")).join(" "),
    first64Ascii: Array.from(bytes.slice(0, 64), (x) => x >= 0x20 && x < 0x7f ? String.fromCharCode(x) : ".").join(""),
    ...format
  };
});
assert.deepEqual(actual.map((x) => [x.bytes, x.hits, x.validUtf8]), [
  [525, [], false],
  [821, [], false]
]);

const p57Words = allPages.words.filter((w) => physicalLP2Page(w.startPage) === 57);
assert.equal(p57Words.length, 20);
let p57Roundtripped = 0;
for (const word of p57Words) {
  const digits = wordDigits(word);
  assert.deepEqual(decodeField(encodeField(digits), digits.length), digits);
  p57Roundtripped++;
}
const BASE29_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRS";
function asciiBase29(value) {
  if (value === 0n) return "0";
  let n = value, out = "";
  while (n > 0n) {
    out = BASE29_DIGITS[Number(n % 29n)] + out;
    n /= 29n;
  }
  return out;
}
assert.equal(asciiBase29(3301n), "3QO");
assert.equal(asciiBase29(1033n), "16I");

function base29Digits(value, n) {
  let x = value;
  const out = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    out[i] = Number(x % 29n);
    x /= 29n;
  }
  assert.equal(x, 0n);
  return out;
}
const gzipHeader = 0x1f8b0800n;
const gzipDigits = base29Digits(gzipHeader, 6);
const gzipBytes = encodeField(gzipDigits);
const gzipFormat = recognizeFormat(gzipBytes);
assert.deepEqual(Array.from(gzipBytes), [0x1f,0x8b,0x08,0x00]);
assert(gzipFormat.hits.includes("GZIP"));

function makeSplitMix64(seed) {
  let state = BigInt(seed) & 0xffffffffffffffffn;
  const mask = 0xffffffffffffffffn;
  let pending = [];
  function next64() {
    state = (state + 0x9e3779b97f4a7c15n) & mask;
    let z = state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & mask;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & mask;
    return (z ^ (z >> 31n)) & mask;
  }
  function refill() {
    const x = next64();
    const halves = [Number(x & 0xffffffffn), Number((x >> 32n) & 0xffffffffn)];
    for (let word of halves) {
      for (let j = 0; j < 3; j++) {
        const value = word & 0x3ff;
        word >>>= 10;
        if (value < 841) pending.push(value % 29, Math.floor(value / 29));
      }
    }
  }
  function nextDigit() {
    while (pending.length === 0) refill();
    return pending.shift();
  }
  return {nextDigit};
}
function randomFieldStream(lengths, rng) {
  const totalBytes = lengths.reduce((s, n) => s + fieldWidth(n), 0);
  const out = new Uint8Array(totalBytes);
  let offset = 0;
  for (const n of lengths) {
    const digits = Array.from({length: n}, () => rng.nextDigit());
    const field = encodeField(digits);
    out.set(field, offset);
    offset += field.length;
  }
  assert.equal(offset, totalBytes);
  return out;
}
const nullResults = [];
for (let i = 0; i < chapters.length; i++) {
  const lengths = chapters[i].words.map((w) => w.length);
  const rng = makeSplitMix64(i === 0 ? 0x3301c1can : 0x2016c1can);
  let hits = 0;
  const trials = 100000;
  for (let trial = 0; trial < trials; trial++) {
    if (recognizeFormat(randomFieldStream(lengths, rng)).hits.length) hits++;
  }
  const upper = hits === 0 ? 1 - Math.pow(0.05, 1 / trials) : null;
  nullResults.push({
    chapter: chapters[i].name,
    trials,
    recognizedHits: hits,
    empiricalRate: hits / trials,
    oneSided95UpperIfZero: upper
  });
}
assert.deepEqual(nullResults.map((x) => x.recognizedHits), [0, 0]);

console.log(JSON.stringify({
  codec: "per printed word: normal GP29 positional integer, minimum fixed big-endian byte width",
  widthRule: "b(n) = min b such that 256^b >= 29^n",
  source: {words: unknown.words.length, runes: unknown.runeCount, crossPageWords: unknown.crossPageWords},
  chapters: actual,
  positiveControls: {
    base29: {3301: asciiBase29(3301n), 1033: asciiBase29(1033n)},
    p57NativeWords: {words: p57Words.length, roundtripped: p57Roundtripped},
    gzip: {digits: gzipDigits, bytes: Array.from(gzipBytes), recognizedAs: gzipFormat.hits}
  },
  nullResults
}, null, 2));
