'use strict';

/**
 * An exact, offline 2014 Stage10 -> LP1 image-identity control.
 * For each filename in the contemporary 2014 participant repository's
 * Stage10 confirmation page, compare its pinned Git blob ID to the local
 * immutable original LP1 JPEG's Git blob ID. Neither image OCR, decoded
 * rune text, nor filename numerology is involved.
 *
 * Run from repository root or any directory:
 *   node sims/lp1_stage10_three_images_identity_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceCommit = '3b15257c5a9efada85b8ccfdb876e2ec934d5b90';
const upstream = 'https://github.com/micheloosterhof/cicada-2014/blob/' + sourceCommit + '/stage10/';

/** @type {ReadonlyArray<{stageFile:string, localPage:number, blob:string, bytes:number, sha256:string}>} */
const expected = [
  {stageFile: '107.jpg', localPage: 14, blob: '28a1ac59a2f1f51d272e4e362c0c35b4be241347',
    bytes: 625668, sha256: 'de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e'},
  {stageFile: '167.jpg', localPage: 15, blob: '32952b7d28028f5fedffceace4de0e7eb688d3d6',
    bytes: 426945, sha256: 'f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9'},
  {stageFile: '229.jpg', localPage: 16, blob: '6f8059f7e8025bf3f51fceefe20be0cce8ce1e20',
    bytes: 485456, sha256: '984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe'}
];

const output = [];
for (const source of expected) {
  const pageFile = path.join(root, 'resources', 'liber-primus', `${source.localPage}.jpg`);
  const bytes = fs.readFileSync(pageFile);
  assert.equal(bytes.length, source.bytes);
  assert.equal(bytes[0], 0xff);
  assert.equal(bytes[1], 0xd8);
  assert.equal(bytes[bytes.length - 2], 0xff);
  assert.equal(bytes[bytes.length - 1], 0xd9);
  const gitObject = Buffer.concat([
    Buffer.from(`blob ${bytes.length}\0`, 'utf8'),
    bytes
  ]);
  const gitBlobSha = crypto.createHash('sha1').update(gitObject).digest('hex');
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(gitBlobSha, source.blob);
  assert.equal(sha256, source.sha256);
  output.push({
    originalStage10Url: upstream + source.stageFile,
    stage10GitBlobSha: source.blob,
    identicalLiberPrimusFirstReleaseArchivePage: source.localPage,
    identicalOriginalRepoPath: `resources/liber-primus/${source.localPage}.jpg`,
    bytes: source.bytes, sha256
  });
}
assert.equal(output.length, 3);
console.log(JSON.stringify({
  finding: 'The three Stage10 linked JPEGs are byte-identical to LP1 physical pp14,15,16 in order.',
  checked: output,
  caveat: 'The stage asset Git blob identities are pinned upstream and are separately viewable at the three URLs; the runner proves their exact equality to local archive LP1 originals.'
}, null, 2));
