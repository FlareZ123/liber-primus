'use strict';
/**
 * SFT: one preregistered two-edge word-state decoder on original Liber Primus.
 * Node.js 22: node sims/lp2_agent31_twoedge_fibonacci_word_sft.cjs
 *
 * Prior cipher word endpoints seed the two 29-state registers.
 * For each glyph c, p=c-a (mod 29); (a,b) <- (b,a+b+c mod 29).
 * This is a source-visible, completely reversible hypothesis, not a solved key.
 * This script is read-only and uses the canonical original-page transcription.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tape = read('resources/liber-primus/lp2-transcription.txt');
const donors = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const gp = new Map(corpus.runes.map((rune, index) => [rune, index]));
const translit = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO',
  'P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
assert.equal(gp.size, 29);

/** @param {number} n */
const mod29 = (n) => ((n % 29) + 29) % 29;
/** @param {number[]} values */
const ioc = (values) => {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (values.length * (values.length - 1));
};

/**
 * @typedef {{values:number[],start:number}} CipherWord
 * The actual printed hyphen and period delimiters end words.
 * Page %, line /, section $ and & are not independent word boundaries.
 * @returns {CipherWord[]}
 */
function parseOriginal() {
  /** @type {CipherWord[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let position = 0;
  const flush = () => {
    if (current.length > 0) {
      words.push({ start: position - current.length, values: current });
      current = [];
    }
  };
  for (const glyph of tape) {
    if (gp.has(glyph)) {
      current.push(gp.get(glyph));
      position++;
    } else if (glyph === '-' || glyph === '.') {
      flush();
    }
  }
  flush();
  assert.equal(position, 13136);
  assert.equal(words.length, 2941);
  return words;
}

/** @param {number[][]} sourceWords */
function encode(sourceWords) {
  /** @type {number[]|null} */
  let previousCipher = null;
  return sourceWords.map((word) => {
    let a = previousCipher === null ? 0 : previousCipher[0];
    let b = previousCipher === null ? 0 : previousCipher.at(-1);
    const output = [];
    for (const p of word) {
      const c = mod29(p + a);
      output.push(c);
      const next = mod29(a + b + c);
      a = b;
      b = next;
    }
    previousCipher = output;
    return output;
  });
}

/**
 * @param {number[][]} cipherWords
 * @param {boolean} wrongOperation
 */
function decode(cipherWords, wrongOperation = false) {
  /** @type {number[]|null} */
  let previousCipher = null;
  return cipherWords.map((word) => {
    let a = previousCipher === null ? 0 : previousCipher[0];
    let b = previousCipher === null ? 0 : previousCipher.at(-1);
    const output = [];
    for (const c of word) {
      output.push(mod29(c - (wrongOperation ? a + b : a)));
      const next = mod29(a + b + c);
      a = b;
      b = next;
    }
    previousCipher = word;
    return output;
  });
}

/** @param {string} sourceText */
function nativeWords(sourceText) {
  /** @type {number[][]} */
  const words = [];
  let word = [];
  const flush = () => { if (word.length > 0) { words.push(word); word = []; } };
  for (const rune of sourceText) {
    if (gp.has(rune)) word.push(gp.get(rune));
    else if ('•⁚⁘⁜'.includes(rune)) flush();
  }
  flush();
  return words;
}

const words = parseOriginal();
const originalRope = words.flatMap((w) => w.values);
assert.equal(originalRope.length, 13136);
let cursor = 0;
const pageLocations = [];
for (const page of corpus.pages) {
  for (const rune of page.indices) {
    assert.equal(rune, originalRope[cursor], 'original rune mismatch at ' + cursor);
    pageLocations.push(page.page);
    cursor++;
  }
}
assert.equal(cursor, 13136);

const unknown = words.filter((w) => w.start < 12956);
assert.equal(unknown.length, 2896);
assert.equal(unknown.reduce((s, w) => s + w.values.length, 0), 12956);
const originalCipher = unknown.map((w) => w.values);
const originalPlain = decode(originalCipher);
const replay = encode(originalPlain);
assert.deepEqual(replay, originalCipher, 'native original forward replay');

function originalWindow(low, high) {
  const items = unknown.map((w, index) => ({ w, decoded: originalPlain[index] }))
    .filter(({ w }) => pageLocations[w.start] >= low &&
      pageLocations[w.start + w.values.length - 1] <= high);
  const plain = items.flatMap((item) => item.decoded);
  const cipher = items.flatMap((item) => item.w.values);
  assert.ok(plain.length > 200);
  const sample = items.slice(0, 25)
    .map((item) => item.decoded.map((n) => translit[n]).join('')).join(' ');
  return { low, high, runes: plain.length, words: items.length,
    plainIoC: ioc(plain), cipherIoC: ioc(cipher), sample };
}

const originalWindows = [originalWindow(16, 21), originalWindow(40, 53)];
assert.equal(originalWindows[0].runes, 1605);
assert.equal(originalWindows[1].runes, 3008);
for (const window of originalWindows) assert.ok(window.plainIoC < 0.045);

for (const index of [0, 2, 4, 8]) {
  const native = nativeWords(donors.sections[index].source_text);
  const planted = encode(native);
  const recovered = decode(planted);
  assert.deepEqual(recovered, native, 'native donor plant ' + index);
  const wrong = decode(planted, true);
  const source = native.flat();
  const wrongFlat = wrong.flat();
  const match = wrongFlat.reduce((sum, rune, i) => sum + Number(rune === source[i]), 0);
  console.log('Donor ' + index + ': ' + source.length + '/' + source.length +
    ' original-GP runes recovered; wrong-op ' + match + '/' + source.length +
    '; native IoC=' + ioc(source).toFixed(6) +
    ', encrypted IoC=' + ioc(planted.flat()).toFixed(6));
}
for (const window of originalWindows) {
  console.log('Original LP2 p' + window.low + '-p' + window.high + ': ' +
    window.runes + ' complete-word runes in ' + window.words + ' words; ' +
    'decoded IoC=' + window.plainIoC.toFixed(9) +
    ', original-cipher IoC=' + window.cipherIoC.toFixed(9));
  console.log('First 25 decoded words: ' + window.sample);
}
console.log('PASS exact original GP29 forward replay ' + 12956 + '/' + 12956);
console.log('DECISION: this frozen two-edge Fibonacci cipher-feedback word law ' +
  'does not recover connected authentic original unknown plaintext.');
