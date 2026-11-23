'use strict';

/**
 * Source-linked LP2 opening red-title / cross-page word / p50 column test.
 * Windows Node.js 22, CommonJS. No network, filesystem writes or key fitting.
 *
 * Prints an exact provisional 331 -> fifth column receiver, then checks
 * the bounded native historical-Vigenere use of its three 32-rune operands.
 * Original p0..p55 ciphertext and first-party p50 panel are unchanged.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = require(path.join(root, 'lp2-corpus.json'));
const ink = require(path.join(root, 'lp2-ink-annotations.json'));
const table = require(path.join(root, 'base60-grid.json'));
const sections = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8').split('%');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.equal(sections.length, 57);
assert.equal(corpus.pages.length, 58);

/** @param {string} text @returns {number[]} */
function decodeRunes(text) {
  return [...text].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch));
}

/** @param {number[]} digits @returns {number} */
function primeSum(digits) {
  return digits.reduce((sum, n) => sum + corpus.prime[n], 0);
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const freq = new Uint32Array(29);
  for (const x of symbols) freq[x]++;
  return [...freq].reduce((sum, count) => sum + count * (count - 1), 0) / (symbols.length * (symbols.length - 1));
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) values.push(n);
  }
  return values;
}

for (let i = 0; i < sections.length; i++) {
  const physical = i >= 50 ? i + 1 : i;
  assert.deepEqual(decodeRunes(sections[i]), corpus.pages[physical].indices,
    `physical page ${physical} rune transcription differs from source`);
}
const unknown = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(unknown.length, 12956);
assert.equal(corpus.pages[50].indices.length, 0);

const firstBreak = sections[0].indexOf('-');
const redStop = sections[0].indexOf('.');
const redA = decodeRunes(sections[0].slice(0, firstBreak));
const redB = decodeRunes(sections[0].slice(firstBreak + 1, redStop));
assert.deepEqual([redA.length, redB.length], [8, 5]);
assert.deepEqual(redA.concat(redB), corpus.pages[0].indices.slice(0, 13));
assert.deepEqual(ink.pages.find(p => p.page === 0).red_spans[0].runes,
  [...sections[0].slice(0, redStop)].filter(ch => runeIndex.has(ch)).join(''));
assert.equal(redA[0], redB[0]); // both start in S
assert.equal(redA[2], redB[2]); // both have E at position 3
assert.equal(redA[2], 18); // canonical GP29 E
assert.equal(corpus.prime[18], 67);
const [leftSum, rightSum] = [primeSum(redA), primeSum(redB)];
assert.deepEqual([leftSum, rightSum], [347, 315]);
const mean = (leftSum + rightSum) / 2;
const difference = leftSum - rightSum;
assert.equal(mean, 331);
assert.equal(difference, 32);
assert.equal(firstPrimes(67)[66], mean);

/** @type {{pageBefore:number,word:number[],pre:number,post:number,sum:number}[]} */
const carries = [];
for (let page = 0; page < 55; page++) {
  // The original p50 is a numeric table with zero runes.
  if (page === 49 || page === 50) continue;
  const s = page >= 50 ? page - 1 : page;
  const left = sections[s].replace(/[\s/]+$/gu, '');
  const right = sections[s + 1].replace(/^[\s/]+/gu, '');
  const preRune = runeIndex.get(left.at(-1));
  const postRune = runeIndex.get(right[0]);
  if (preRune === undefined || postRune === undefined) continue;

  const leftStart = 1 + Math.max(left.lastIndexOf('-'), left.lastIndexOf('.'));
  const rightEnd = Math.min(...['-', '.'].map(token => {
    const i = right.indexOf(token);
    return i < 0 ? right.length : i;
  }));
  const word = decodeRunes(left.slice(leftStart) + right.slice(0, rightEnd));
  assert(word.length >= 2);
  assert.equal(word[0], decodeRunes(left.slice(leftStart))[0]);
  assert.equal(word.at(-1), decodeRunes(right.slice(0, rightEnd)).at(-1));
  carries.push({ pageBefore: page, word, pre: preRune, post: postRune, sum: primeSum(word) });
}
assert.equal(carries.length, 32);
const selected = carries.map((c, i) => c.sum === 331 ? i : -1).filter(i => i >= 0);
assert.deepEqual(selected, [4]);
assert.equal(carries[4].pageBefore, 5);
assert.deepEqual(carries[4].word, [16, 14, 5, 16, 8, 23, 12]);
assert.equal(carries[4].sum, 59 + 47 + 13 + 59 + 23 + 89 + 41);
assert.equal(table.rows.length, difference);
assert(table.rows.every(row => row.length === 8));
assert.equal(table.alphabet.length, 60);
const column = selected[0];
const panelBytes = table.rows.map(row => {
  const token = row[column];
  return table.alphabet.indexOf(token[0]) * 60 + table.alphabet.indexOf(token[1]);
});
assert(panelBytes.every(x => x >= 0 && x <= 255));
const keyHex = Buffer.from(panelBytes).toString('hex');
const expectedHex = '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4';
assert.equal(keyHex, expectedHex);

// An independently documented standard compressed-secp256k1 P2PKH
// treatment of this exact scalar gives '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK'.
// See sims/lp2_p50_missingl_bitcoin_vanity_source_sft.cjs.
// Do not promote its author selection without an external instruction.

const keys = [
  { name: 'preceding-boundary-rune', values: carries.map(c => c.pre) },
  { name: 'following-boundary-rune', values: carries.map(c => c.post) },
  { name: 'complete-carry-word-GP-prime-sum', values: carries.map(c => c.sum % 29) }
];
const originalBody = unknown.slice(13);
const solvedNative = corpus.pages[57].indices;
assert.equal(originalBody.length, 12943);
assert.equal(solvedNative.length, 95);
const p0Body = corpus.pages[0].indices.length - 13;
const p1p2End = 729 - 13;
const receivers = [];

for (const key of keys) {
  assert.equal(key.values.length, 32);
  const output = originalBody.map((c, i) => (c - key.values[i % 32] + 29) % 29);
  const reencryption = output.map((p, i) => (p + key.values[i % 32]) % 29);
  assert.deepEqual(reencryption, originalBody);
  const planted = solvedNative.map((p, i) => (p + key.values[i % 32]) % 29);
  assert.deepEqual(planted.map((c, i) => (c - key.values[i % 32] + 29) % 29), solvedNative);
  receivers.push({
    keySource: key.name,
    originalLength: output.length,
    p0BodyIoC: ioc(output.slice(0, p0Body)),
    disjointP1P2IoC: ioc(output.slice(p0Body, p1p2End)),
    fullUnknownIoC: ioc(output),
    open75Runes: output.slice(0, 75).map(x => corpus.translit[x]).join(''),
    nativePlantedSymbolsRecovered: planted.length
  });
}
assert.equal(receivers.length, 3);
console.log(JSON.stringify({
  classification: 'ORIGINAL_SOURCE 331 / 32 / FIFTH COLUMN CONDITIONAL PATH',
  redTitle: { firstWordGPsum: leftSum, secondWordGPsum: rightSum, mean,
    difference, sharedThirdRune: corpus.translit[18], sharedThirdRunePrimeWeight: 67,
    primeOf67: firstPrimes(67)[66] },
  originalCrossPageWords: carries.length,
  matchingCarry: { ordinal1Based: selected[0] + 1,
    fromPage: carries[4].pageBefore, toPage: carries[4].pageBefore + 1,
    gpIndices: carries[4].word, gpPrimeSum: carries[4].sum },
  originalPanel: { rows: table.rows.length, columns: table.rows[0].length,
    selectedColumn1Based: column + 1, selectedKeyBytes: panelBytes.length, scalarHex: keyHex },
  simpleDirectCipherReceivers: receivers,
  status: 'Exact cross-artifact operand, NO recovered unknown plaintext or authenticated operator'
}, null, 2));
console.log('PASS original p0 red-mean/carry331/fifth-p50 source audit; native plants pass; no unknown plaintext.');
