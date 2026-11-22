'use strict';
/**
 * Original-source p8 243-state static ternary feedback-table obstruction.
 *
 * Test any lexicographic 3^5 state-address convention whose five ternary
 * coordinates are freely permuted. Every secret stationary GP29-rune-to-trit
 * mapping is allowed; all 5 choices of the dropped coordinate are covered.
 * A reversible one-trit shift must give three different feedback trits for
 * the three states that agree on the other four coordinates.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_p8_243_static_feedback_anyaxis_no_go_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const original = gp.pages.find(p => p.page === 8).indices;
assert.equal(original.length, 255);
const body = original.slice(12);
assert.equal(body.length, 243);
assert.equal(createHash('sha256').update(Buffer.from(body)).digest('hex'),
  '587d41e62de08d12121bb2500c18817461840c9f8bbf88e533dbb048cd50274d');
assert.equal(new Set(body).size, 29);

/**
 * For an address index in the standard five-trit cube, all states which
 * agree except coordinate axis have addresses i, i+3^axis, i+2*3^axis.
 * A static hidden rune-to-trit map cannot distinguish repeated rune IDs.
 * @param {number[]} values 243 source labels or positive-control trits
 * @param {number} axis The omitted trit coordinate 0..4
 * @returns {{axis:number, stride:number, groups:number,
 *   repeats:number, firstWitness:{indices:number[],runes:number[]}|null}}
 */
function analyze(values, axis) {
  assert.equal(values.length, 243);
  const stride = 3 ** axis;
  let groups = 0, repeats = 0, firstWitness = null;
  for (let i = 0; i < 243; i++) {
    if (Math.floor(i / stride) % 3 !== 0) continue;
    const indices = [i, i + stride, i + 2 * stride];
    const runes = indices.map(j => values[j]);
    assert(indices.every(j => j < 243));
    groups++;
    if (new Set(runes).size !== 3) {
      repeats++;
      if (firstWitness === null) firstWitness = {indices, runes};
    }
  }
  assert.equal(groups, 81);
  return {axis, stride, groups, repeats, firstWitness};
}
const actual = Array.from({length:5}, (_, axis) => analyze(body, axis));
assert.deepEqual(actual.map(x => x.repeats), [5, 6, 8, 6, 12]);
for (const row of actual) assert(row.repeats > 0);
const nativePositive = Array.from({length:5}, (_, axis) => {
  const trits = Array.from({length:243}, (_, i) =>
    Math.floor(i / (3 ** axis)) % 3);
  const row = analyze(trits, axis);
  assert.equal(row.repeats, 0);
  return row;
});
assert.equal(nativePositive.length, 5);
console.log(JSON.stringify({
  model: 'lexicographically addressed complete GF3^5 static rune-to-feedback table',
  source: 'physical LP2 p8 black 243 original rune indices, red12 excluded',
  sourceRoles: '29 rune identities, arbitrary secret stationary rune-to-trit map',
  originalByOmittedAxis: actual,
  validExplicitTritPositiveByAxis: nativePositive.map(x =>
    ({axis:x.axis, groups:x.groups, repeats:x.repeats})),
  exactConclusion: 'Each 5D axis has an identical-rune collision, so no static rune-to-trit map gives an invertible ternary one-trit shift under any coordinate permutation.',
  caveat: 'Excludes this table architecture only; does not decode ciphertext.'
}, null, 2));
console.log('PASS: five source-axis exclusions and five construction positives');
