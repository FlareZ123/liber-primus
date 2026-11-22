'use strict';

/**
 * LP2 direct eight-section decryption hypothesis, using the authentic p50 32x8
 * base60 byte grid as eight literal AES-256-CTR keys, one per $ section.
 *
 * Original input, fixed source-derived candidate geometries, authentic GP29
 * printed-word boundaries and full synthetic positive control. Windows Node22.
 * @see https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8')
  .replace(/\r\n/g, '\n');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const gridFile = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'));
const grid = JSON.parse(gridFile);
const bytes = grid.pages.flatMap((part) => part.bytes);
assert.equal(bytes.length, 256);

const keys = {
  'vertical-columns': Array.from({ length: 8 }, (_, c) =>
    Buffer.from(Array.from({ length: 32 }, (_, r) => bytes[r * 8 + c]))),
  'row-major-32byte-blocks': Array.from({ length: 8 }, (_, c) =>
    Buffer.from(bytes.slice(c * 32, (c + 1) * 32)))
};
const runeMap = new Map(corpus.runes.map((rune, i) => [rune, i]));
const pageChunks = source.split('%').filter((part) => part.trim());
assert.equal(pageChunks.length, 57);
const cipherSections = pageChunks.slice(0, -2).join('%').split('$')
  .filter((part) => /[\u16a0-\u16ff]/u.test(part))
  .map((part) => {
    const tokens = Array.from(part.matchAll(/[\u16a0-\u16ff]+/gu),
      (match) => Array.from(match[0], (rune) => runeMap.get(rune)));
    const indices = tokens.flat();
    assert.ok(indices.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
    return { tokens, indices };
  });
assert.equal(cipherSections.length, 8);
assert.deepEqual(cipherSections.map((section) => section.indices.length),
  [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
const actual = cipherSections.flatMap((part) => part.indices);
const ground = corpus.pages.filter((page) => page.page <= 55 && page.indices.length)
  .flatMap((page) => page.indices);
assert.deepEqual(actual, ground, 'The original $ splits preserve every ciphertext rune');
const allWords = cipherSections.reduce((s, section) => s + section.tokens.length, 0);
const singletonCount = cipherSections.reduce((s, section) =>
  s + section.tokens.filter((token) => token.length === 1).length, 0);
assert.equal(allWords, 2896);
assert.equal(singletonCount, 83);

/**
 * @param {Buffer} key Thirty-two raw bytes from the source table.
 * @param {number} section The zero-based original $-section ordinal.
 * @param {number} runeCount The number of GP29 symbols.
 * @param {'zero'|'section-index'} ivMode Fixed source-compatible CTR IV.
 * @param {'mod29'|'rejection232'} digitMode Natural byte->GP29 conversion.
 * @returns {number[]} Keystream digits in [0,28].
 */
function aesDigits(key, section, runeCount, ivMode, digitMode) {
  const iv = Buffer.alloc(16);
  if (ivMode === 'section-index') iv.writeUInt32BE(section, 12);
  const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  const block = Buffer.alloc(runeCount * 2);
  const stream = Buffer.concat([cipher.update(block), cipher.final()]);
  if (digitMode === 'mod29') {
    return Array.from(stream.subarray(0, runeCount), (x) => x % 29);
  }
  const digits = [];
  for (const value of stream) {
    if (value < 232) digits.push(value % 29);
    if (digits.length === runeCount) break;
  }
  assert.equal(digits.length, runeCount);
  return digits;
}

/**
 * @param {number[]} input Ciphertext or plaintext GP29 indices.
 * @param {number[]} digit Keystream.
 * @param {-1|1} sign Decrypt=-1, encrypt=+1.
 * @returns {number[]} Original-length GP29 sequence.
 */
function shift(input, digit, sign) {
  return input.map((c, i) => (c + sign * digit[i] + 29) % 29);
}

/** @param {{tokens:number[][]}} section @param {number[]} plain */
function recognizability(section, plain) {
  let pos = 0;
  const r = { singletonAIO: 0, singletonAI: 0, the: 0, and: 0, of: 0, to: 0, in: 0 };
  for (const word of section.tokens) {
    const length = word.length;
    if (length === 1) {
      r.singletonAIO += Number([3, 10, 24].includes(plain[pos]));
      r.singletonAI += Number([10, 24].includes(plain[pos]));
    }
    if (length === 2) {
      const a = plain[pos], b = plain[pos + 1];
      r.the += Number(a === 2 && b === 18); // TH + E, printed THE
      r.of += Number(a === 3 && b === 0);
      r.to += Number(a === 16 && b === 3);
      r.in += Number(a === 10 && b === 9);
    }
    if (length === 3) {
      r.and += Number(plain[pos] === 24 && plain[pos + 1] === 9 &&
        plain[pos + 2] === 23);
    }
    pos += length;
  }
  assert.equal(pos, plain.length);
  return r;
}

function score(r) {
  return r.singletonAI + 3 * r.the + 5 * r.and + r.of + r.to + r.in;
}

const results = [];
for (const [geometry, candidates] of Object.entries(keys)) {
  for (const order of ['forward', 'reverse']) {
    for (const iv of ['zero', 'section-index']) {
      for (const digits of ['mod29', 'rejection232']) {
        for (const direction of [-1, 1]) {
          const rows = cipherSections.map((part, i) => {
            const key = candidates[order === 'forward' ? i : 7 - i];
            const stream = aesDigits(key, i, part.indices.length, iv, digits);
            const plain = shift(part.indices, stream, direction);
            const hits = recognizability(part, plain);
            return { section: i, ...hits };
          });
          const totals = rows.reduce((acc, row) => {
            for (const key of ['singletonAIO', 'singletonAI', 'the', 'and', 'of', 'to', 'in']) {
              acc[key] += row[key];
            }
            return acc;
          }, { singletonAIO: 0, singletonAI: 0, the: 0, and: 0, of: 0, to: 0, in: 0 });
          results.push({ geometry, order, iv, digits, direction, ...totals,
            wordSignal: score(totals), sections: rows });
        }
      }
    }
  }
}
assert.equal(results.length, 32);

// Synthetic direct-key control over all original word lengths. Encrypt source
// legible cribs using the first column key then verify the original inverse.
const fixture = cipherSections.map((part, i) => {
  const plain = part.indices.slice();
  let pos = 0;
  for (const token of part.tokens) {
    if (token.length === 1) plain[pos] = 24;
    if (token.length === 2) { plain[pos] = 2; plain[pos + 1] = 18; }
    if (token.length === 3) { plain[pos] = 24; plain[pos + 1] = 9; plain[pos + 2] = 23; }
    pos += token.length;
  }
  const stream = aesDigits(keys['vertical-columns'][i], i, part.indices.length,
    'zero', 'mod29');
  const cipher = shift(plain, stream, 1);
  const recovered = shift(cipher, stream, -1);
  assert.deepEqual(recovered, plain);
  return recognizability(part, recovered);
});
const positive = fixture.reduce((acc, row) => ({
  single: acc.single + row.singletonAI,
  the: acc.the + row.the,
  and: acc.and + row.and
}), { single: 0, the: 0, and: 0 });
assert.equal(positive.single, 83);
assert.equal(positive.the, cipherSections.flatMap((x) => x.tokens)
  .filter((x) => x.length === 2).length);
assert.equal(positive.and, cipherSections.flatMap((x) => x.tokens)
  .filter((x) => x.length === 3).length);

results.sort((a, b) => b.wordSignal - a.wordSignal);
const best = results[0];
console.log(JSON.stringify({
  hypothesis: 'p50 table as literal eight AES-256-CTR GP29 section keys',
  originalSourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  tableGridSha256: crypto.createHash('sha256').update(gridFile).digest('hex'),
  sectionRuneCounts: cipherSections.map((x) => x.indices.length),
  originalWordCount: allWords,
  originalSingletons: singletonCount,
  directFamilies: results.length,
  best,
  topEight: results.slice(0, 8).map(({ sections, ...rest }) => rest),
  positiveControl: positive,
  decision: best.singletonAI >= 40 && best.the >= 30
    ? 'CANDIDATE PLAINTEXT: inspect all eight sections and independent re-encryption'
    : 'No original-word recovery from these source-grid AES-256 direct key reads'
}, null, 2));
