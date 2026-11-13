'use strict';

/**
 * Test one source-shaped SHA-512 Merkle commitment hypothesis.
 * Source: original LP2 pp49–51 32x8 sexagesimal-token grid and solved p56 digest.
 * This tests only natural leaf partitions and straight binary SHA-512 nodes.
 * No passwords, offsets, salts, orientation search or fitted source data.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const source = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const solved = read('resources/liber-primus/lp1-plaintext-reference.txt');
const match = solved.match(/THAT HASHES TO\s+([0-9a-f]{76})\s+([0-9a-f]{52})/i);
assert(match, 'source solved p56 SHA-512 digest not found');
const target = (match[1] + match[2]).toLowerCase();
assert.equal(target,
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b' +
  '464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4');
assert.equal(source.rows.length, 32);
assert.equal(source.byte_rows.length, 32);
const tokens = source.rows.flat();
const bytes = source.byte_rows.flat();
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
for (let i = 0; i < 256; i++) {
  assert.equal(tokens[i].length, 2);
  assert.equal(bytes[i],
    60 * source.alphabet.indexOf(tokens[i][0]) +
    source.alphabet.indexOf(tokens[i][1]));
  assert(bytes[i] >= 0 && bytes[i] <= 255);
}
const payload = Buffer.from(bytes);
/** @param {Buffer} value @returns {Buffer} */
function sha512(value) {
  return createHash('sha512').update(value).digest();
}
assert.equal(sha512(Buffer.from('abc')).toString('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a' +
  '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
assert.equal(createHash('sha256').update(payload).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * Standard binary-pair Merkle reduction, with SHA-512 leaf and internal hashes.
 * All inputs are source-authentic byte strings and the leaf count is a power of two.
 * @param {Buffer[]} leaves
 * @returns {string}
 */
function merkle(leaves) {
  assert(leaves.length > 0 && (leaves.length & (leaves.length - 1)) === 0);
  let level = leaves.map(sha512);
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(sha512(Buffer.concat([level[i], level[i + 1]])));
    }
    level = next;
  }
  return level[0].toString('hex');
}
const tests = [
  ['256 byte leaves', Array.from(payload, b => Buffer.from([b])),
    '662d746b69f31369daee65654c0a31872e8c97add20af75886310ef5fce34a19264234c286a73b863c71385e449169ae93f8ec9e72e18719e7577aa567efe80a'],
  ['32 printed row leaves', source.byte_rows.map(row => Buffer.from(row)),
    '173b834e3acfc2bad0dfaf40d206cd1f069b50361b50182a504ee11692f7fb0653f3a56e80dd60a36ca54d36b09752c198f859af872fee5837472cfcf4f3f6f5'],
  ['8 printed column leaves', Array.from({ length: 8 },
    (_, col) => Buffer.from(source.byte_rows.map(row => row[col]))),
    '3d9b20a83751e67615b328efbc5e38fa1b2b400d0294e45a87ce4496d13410dcb7cee352c122899e3d70987718712baf8e831c700dc4436bc6d8dc98be0ceca2'],
  ['256 printed token leaves', tokens.map(token => Buffer.from(token, 'ascii')),
    'c67dfb2405c81033229339ebc9d74f4d6884ff7c0b3aa58b4d4a1b9cb7c147a87b7b657a1269f8b76f6bd5b1d9e75dd4357447ce1f4956a3b62dd80d92fe065c'],
  ['128 adjacent two-byte leaves', Array.from({ length: 128 },
    (_, i) => payload.subarray(i * 2, i * 2 + 2)),
    '9c27f11f1fcdf09e3369342e47b1e9c4ac1b4b080bdabac1b3174ab663f058de368d6808caf332f2125b53da6ec8df0874884868b8bb2da25afee5380e981391']
];
for (const [name, leaves, expected] of tests) {
  const output = merkle(leaves);
  assert.equal(output, expected, 'cross-language independently checked SHA-512 root');
  assert.notEqual(output, target, 'root unexpectedly matches authentic p56 digest');
}
// A deliberate source-shaped mutation must affect the full hash root.
const wrong = Buffer.from(payload);
wrong[0] ^= 1;
assert.notEqual(merkle(Array.from(wrong, b => Buffer.from([b]))), tests[0][2]);
console.log(JSON.stringify({
  classification: 'five frozen standard Merkle commitments excluded; no unknown plaintext',
  tableSHA256: createHash('sha256').update(payload).digest('hex'),
  sourceTargetSHA512: target,
  sourceLayouts: tests.map(([name, leaves, output]) => ({
    name, nLeaves: leaves.length, merkleRootSHA512: output, matchesP56: false
  })),
  positiveSHA512Vector: true, deliberateMutationDistinguished: true
}, null, 2));
