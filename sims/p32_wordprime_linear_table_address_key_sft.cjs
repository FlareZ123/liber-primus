'use strict';

// Source-frozen p32-word -> p50-table address -> GP29 additive-key test.
// Run from repository root: node sims/p32_wordprime_linear_table_address_key_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tableData = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcription = read('resources/lp2-transcription.txt');

const page32 = transcription.split('%')[32].replace(/\/\s*/g, '');
const words = page32.split(/[.\-&$§]+/u)
  .map(part => [...part].filter(r => /[\u16A0-\u16FF]/u.test(r)).join(''))
  .filter(Boolean);
const primeByRune = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
const wordSums = words.map(word =>
  [...word].reduce((sum, rune) => sum + primeByRune.get(rune), 0));

const expectedSums = [
  73, 125, 267, 613, 191, 184, 14, 540, 458, 535, 183,
  442, 196, 497, 160, 446, 98, 203, 96, 348, 160, 216
];
assert.equal(words.length, 22, 'p32 visible-word count, including incoming carry');
assert.deepEqual(wordSums, expectedSums);
assert.equal(tableData.byte_rows.length, 32);
assert.ok(tableData.byte_rows.every(row => row.length === 8));
const table = tableData.byte_rows.flat();
assert.equal(table.length, 256);
assert.ok(table.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

const allUnknown = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const p33to39 = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
const p55Body = corpus.pages.find(p => p.page === 55).indices.slice(1);
const solved57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(allUnknown.length, 12956);
assert.equal(p33to39.length, 1680);
assert.equal(p55Body.length, 75, 'p55 complete-word body after the incoming p54 carry');

const mod = (n, m) => ((n % m) + m) % m;
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
function adjacentRepeats(sequence) {
  let count = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) count++;
  }
  return count;
}
function decrypt(cipher, key, sign) {
  return cipher.map((value, i) => mod(value + sign * key[i % key.length], 29));
}
function encrypt(plain, key, sign) {
  return plain.map((value, i) => mod(value - sign * key[i % key.length], 29));
}
function transliterate(sequence, limit = 180) {
  return sequence.slice(0, limit).map(value => corpus.translit[value]).join(' ');
}

const keyCandidates = [0, 1].map(addressBase => {
  const addresses = wordSums.map(sum => mod(sum - addressBase, 256));
  const bytes = addresses.map(address => table[address]);
  const key = bytes.map(byte => byte % 29);
  return {
    addressBase: addressBase === 0 ? 'zero-based: sum mod 256' : 'one-based: (sum - 1) mod 256',
    addresses,
    bytes,
    bytesHex: bytes.map(byte => byte.toString(16).padStart(2, '0')).join(''),
    key,
    keyTransliteration: key.map(value => corpus.translit[value]).join(' ')
  };
});

const results = [];
for (const candidate of keyCandidates) {
  for (const sign of [-1, 1]) {
    for (const [targetName, target] of [
      ['all unknown LP2 pp0-55', allUnknown],
      ['immediate following section pp33-39', p33to39],
      ['p55 complete-word body after incoming carry', p55Body]
    ]) {
      const plain = decrypt(target, candidate.key, sign);
      const plant = Array.from({ length: target.length },
        (_, i) => solved57[i % solved57.length]);
      const plantedCipher = encrypt(plant, candidate.key, sign);
      assert.deepEqual(decrypt(plantedCipher, candidate.key, sign), plant);
      assert.deepEqual(encrypt(plain, candidate.key, sign), target);
      results.push({
        addressBase: candidate.addressBase,
        operation: sign === -1 ? 'P = C - K mod 29' : 'P = C + K mod 29',
        target: targetName,
        runeCount: target.length,
        ioc: ioc(plain),
        adjacentRepeats: adjacentRepeats(plain),
        first180: transliterate(plain)
      });
    }
  }
}

const output = {
  evidenceClass: 'bounded source-motivated original-input negative',
  sourceInstruction: 'Authenticated 2016 text: words are the map; their numbers are the direction',
  proposedMap: 'the 22 words visible on p32, including the incoming carry, index the 256-entry p49-51 row-major byte table by GP-prime word sum',
  conditionalInput: 'the table values are the repository’s provisional base60-to-byte interpretation',
  keyDerivation: 'table[sum mod 256] or table[(sum - 1) mod 256], then each selected byte mod 29',
  source: {
    p32VisibleWords: words.length,
    p32WordPrimeSums: wordSums,
    tableDimensions: [32, 8],
    tableEntries: table.length,
    addressCandidates: keyCandidates
  },
  targets: {
    unknownBookRunes: allUnknown.length,
    followingSectionRunes: p33to39.length,
    p55CompleteWordBodyRunes: p55Body.length,
    rawBookIoC: ioc(allUnknown),
    rawBookAdjacentRepeats: adjacentRepeats(allUnknown),
    rawP33to39IoC: ioc(p33to39),
    rawP33to39AdjacentRepeats: adjacentRepeats(p33to39),
    solvedP57ControlIoC: ioc(solved57)
  },
  results,
  conclusion: 'Neither source-fixed address convention and neither additive sign produces language-like GP29 plaintext on the whole unknown book or the immediately following p33-39 section. This rejects only this linear table-address key and periodic additive consumer.'
};
console.log(JSON.stringify(output, null, 2));
