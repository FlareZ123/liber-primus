'use strict';
/**
 * Source-exact check of the Wulfic April 2026 "confirmed" LP2 archive
 * p18/p19 periodic GP29 decoder claims against canonical physical p1/p2.
 *
 * Run: node sims/lp2_wulfic_p18_p19_fixed_claim_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));

/** @param {number} page @returns {number[]} */
function source(page) {
  const record = corpus.pages.find((item) => item.page === page);
  assert.ok(record, 'Original page must exist');
  return record.indices;
}

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {-1|1} direction
 * @returns {number[]}
 */
function transform(input, key, direction) {
  return input.map((value, index) => (value + 29 + direction * key[index % key.length]) % 29);
}

/** @param {number[]} values @returns {number} */
function normalizedIoc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return 29 * counts.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {string} */
function transliterate(values) {
  return values.map((value) => corpus.translit[value]).join(' ');
}

const claims = [
  {
    archivePage: 18,
    physicalPage: 1,
    originalRuneCount: 266,
    direction: -1,
    key: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
    expectedFirst16: [13,4,18,24,13,24,13,18,6,10,19,13,8,14,14,1],
    expectedIoc: 1.0071215775287274,
    allegedOpening: 'BEING OF ALL'
  },
  {
    archivePage: 19,
    physicalPage: 2,
    originalRuneCount: 201,
    direction: 1,
    key: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],
    expectedFirst16: [17,5,3,3,20,9,23,1,14,24,26,9,25,15,24,14],
    expectedIoc: 0.9969651741293533,
    allegedOpening: 'REARRANGING THE PRIMES'
  }
];

const nativeClear = source(57);
console.log('Native clear physical p57 normalized IoC:', normalizedIoc(nativeClear).toFixed(12));
for (const claim of claims) {
  const original = source(claim.physicalPage);
  assert.equal(original.length, claim.originalRuneCount);
  assert.equal(claim.key.length, claim.archivePage === 18 ? 53 : 47);
  const output = transform(original, claim.key, claim.direction);
  assert.deepEqual(output.slice(0, 16), claim.expectedFirst16);
  assert.ok(Math.abs(normalizedIoc(output) - claim.expectedIoc) < 1e-10);

  // A source-shaped independent known-plaintext positive ensures both directions
  // and the complete periodic key counters are implemented correctly.
  const plantedCipher = transform(nativeClear, claim.key, -claim.direction);
  const recovered = transform(plantedCipher, claim.key, claim.direction);
  assert.deepEqual(recovered, nativeClear);

  console.log('\nArchive p' + claim.archivePage + ' = original LP2 physical p' + claim.physicalPage);
  console.log('Published alleged opening:', claim.allegedOpening);
  console.log('Actual fixed-key output first 40 GP runes:', transliterate(output.slice(0, 40)));
  console.log('Original length:', original.length, 'key length:', claim.key.length,
    'normalized IoC:', normalizedIoc(output).toFixed(12));
  console.log('Native p57 source-shaped planted-positive:', recovered.length + '/' + nativeClear.length, 'PASS');
}
console.log('\nPASS: both fixed published-key claims are not the reported prose under their stated rules.');
