'use strict';

/**
 * Original JPEG trailing-byte / proposed mirrored p50 consumer gate.
 * Run: node sims/lp1_p05_reverse_tail_p50_fold_sft.cjs
 *
 * Read-only test. Uses exact repository originals and the source p50 token table.
 * Input/procedure/expected outputs documented in the companion im-results report.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const eoi = Buffer.from([0xff, 0xd9]);
const icc = Buffer.from('ICC_PROFILE\0', 'latin1');
const profileHashes = new Set();
const appended = [];

for (let i = 0; i < 75; i += 1) {
  const file = String(i).padStart(2, '0') + '.jpg';
  const raw = fs.readFileSync(path.join(root, file));
  const lastEOI = raw.lastIndexOf(eoi);
  assert.ok(lastEOI > 0, file + ': no JPEG end marker');
  const trailer = raw.subarray(lastEOI + 2);
  const profileAt = raw.indexOf(icc);
  if (i >= 17) {
    assert.ok(profileAt >= 0, file + ': missing ICC profile');
    profileHashes.add(sha256(raw.subarray(profileAt, profileAt + 2590)));
    assert.equal(trailer.length, 0, file + ': unexpected appended bytes');
  } else {
    assert.equal(profileAt, -1, file + ': unexpected LP1 ICC profile');
  }
  if (trailer.length) {
    assert.equal(i, 5, 'Only authentic LP1 05.jpg should have appended bytes');
    assert.equal(raw.length, 673066);
    assert.equal(lastEOI, 600364);
    assert.equal(trailer.length, 72700);
    assert.equal(sha256(raw),
      '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');
    assert.deepEqual(trailer, Buffer.from(raw.subarray(0, trailer.length)).reverse(),
      'The trailer is a byte-reversed prefix of the SAME JPEG');
    appended.push({file, bytes: trailer.length, mainJpegBytes: lastEOI + 2});
  }
}
assert.equal(appended.length, 1);
assert.deepEqual([...profileHashes],
  ['62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f']);

const table = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-grid-256.json'), 'utf8')).bytes;
assert.equal(table.length, 256);
const digestHex =
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84' +
  '25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const target = [...Buffer.from(digestHex, 'hex')];
assert.equal(target.length, 64);

/**
 * @param {number[]} data Exact 8-bit values
 * @param {'mirror'|'halves'} axis
 * @param {'xor'|'sum'|'minus'|'rev-minus'} op
 * @returns {number[]}
 */
function fold(data, axis, op) {
  assert.equal(data.length % 2, 0);
  const half = data.length / 2;
  const out = new Array(half);
  for (let i = 0; i < half; i += 1) {
    const x = data[i];
    const y = data[axis === 'mirror' ? data.length - 1 - i : half + i];
    if (op === 'xor') out[i] = x ^ y;
    if (op === 'sum') out[i] = (x + y) & 255;
    if (op === 'minus') out[i] = (x - y + 256) & 255;
    if (op === 'rev-minus') out[i] = (y - x + 256) & 255;
  }
  return out;
}
assert.deepEqual(fold([1,2,3,4,5,6,7,8], 'mirror', 'xor'), [9,5,5,1]);
assert.deepEqual(fold([9,5,5,1], 'mirror', 'xor'), [8,0]);

let tests = 0;
let maximumEqualBytes = 0;
let best = null;
for (const axis1 of ['mirror', 'halves']) {
  for (const axis2 of ['mirror', 'halves']) {
    for (const op1 of ['xor', 'sum', 'minus', 'rev-minus']) {
      for (const op2 of ['xor', 'sum', 'minus', 'rev-minus']) {
        const folded = fold(fold(table, axis1, op1), axis2, op2);
        for (const reverse of [false, true]) {
          const candidate = reverse ? folded.slice().reverse() : folded;
          const equal = candidate.filter((v,i) => v === target[i]).length;
          tests += 1;
          if (equal > maximumEqualBytes) {
            maximumEqualBytes = equal;
            best = {axis1, axis2, op1, op2, reverse, equal};
          }
          assert.notDeepEqual(candidate, target, 'Unexpected matching 64-byte digest');
        }
      }
    }
  }
}
assert.equal(tests, 128);
assert.equal(maximumEqualBytes, 3);
console.log(JSON.stringify({
  originalJpegs: 75, lp2Jpegs: 58, appended, lp2IdenticalIccProfiles: profileHashes.size,
  mirrorFoldVariants: tests, directDigestMatches: 0, maximumEqualBytes, best
}, null, 2));
