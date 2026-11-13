'use strict';

/**
 * Does any archived actual OutGuess output equal the separately printed LP2
 * p56 SHA-512 target as an exact source byte sequence?
 *
 * Network access is only for source retrieval. Each external binary is
 * independently pinned by its Git blob SHA-1; a changing source cannot be
 * silently substituted. This is NOT an OutGuess extraction implementation
 * and does not claim to exclude password-selected steganography.
 *
 * On Windows 11 with Node.js 22, run this single file inside the repo.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const target = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'cicada2014-archive-hash-manifest.json'), 'utf8')).targetHex;
assert.match(target, /^[a-f\d]{128}$/i);
const sourceCommit = 'f2267b0c2f1e1d2662806b90b9c3a2953b3a7023';
const blobs = new Map([
  [6,  '29d8fe5c4b6f2b245e367077dc6c752204707c7e'],
  [7,  'fc8bc6ff96e8c1078d9a231e89e18d56c708708f'],
  [9,  'd7844fa0bbedfcf4e9862a1d43f565717789cb86'],
  [17, 'dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6'],
  [21, '58ba0c966954f2a02964995613a6ba93fca57425'],
  [43, 'e4c94e1d285aff041276bf5c7bb1c265e987d93d'],
  [57, 'b00935afad47dcf6a687098d365c42656c9f3c3e'],
  [58, '08242eee904452540ddfc8e5f2d064e45a70d544'],
  [59, '0f269351c2f91db1a9a1b58b1977175b5a3f1b98'],
  [60, '0166808cc5ec0a3f81c907cd677e24569f405eb0'],
  [61, '189b682d1823ebcb9f9f6799e53ea12a182a432c'],
  [62, '0446ef20772bc60180ae2015006dbb13431f4f33'],
  [63, 'c0def8be97258b235fd3a0e7bf13f476223d50c9'],
  [64, '6dd88515c9d08b12ca1abca39f7fbe886909c881'],
  [65, 'ae09c1494c63f6be1a3ea1e42d5d3273a2bf79ed'],
  [68, '20af8411753785b061b3e5b7d482a3c3f1c339d1'],
  [69, '2aa10935af2d21d65b4fa2984a767bf11579cf62'],
  [70, '8bb6d636f1943cfc7387aec2ee50b75b12694e94'],
  [71, '11467c4ca193bdb06f10af982f0277aaead0fa60']
]);

/** @param {Buffer} data @returns {string} */
function gitBlobHash(data) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + data.length + '\0'))
    .update(data).digest('hex');
}

/**
 * @param {number} image
 * @returns {Promise<Buffer>}
 */
async function retrieve(image) {
  const name = String(image).padStart(2, '0');
  const urls = [
    'https://raw.githubusercontent.com/rtkd/iddqd/' + sourceCommit +
      '/lp_outguessed/' + name + '.txt',
    'https://raw.githubusercontent.com/rtkd/iddqd/master/lp_outguessed/' +
      name + '.txt'
  ];
  let last = null;
  for (const url of urls) {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) { last = response.status; continue; }
    const value = Buffer.from(await response.arrayBuffer());
    const actual = gitBlobHash(value);
    assert.equal(actual, blobs.get(image),
      'historical source altered: ' + image + ' ' + url);
    return value;
  }
  throw new Error('Archive unavailable for ' + image + ': HTTP ' + last);
}

async function main() {
  const rows = [];
  for (const image of blobs.keys()) {
    const binary = await retrieve(image);
    assert.equal(binary.length, 58152);
    const sha512 = crypto.createHash('sha512').update(binary).digest('hex');
    const blake2b = crypto.createHash('blake2b512').update(binary).digest('hex');
    rows.push({ source_image: image, bytes: binary.length,
      git_blob_sha1: gitBlobHash(binary),
      printed_p56_sha512_match: sha512.toLowerCase() === target.toLowerCase(),
      printed_p56_blake2b512_match:
        blake2b.toLowerCase() === target.toLowerCase(),
      sha512_first16: sha512.slice(0, 16)
    });
  }
  const matches = rows.filter((r) => r.printed_p56_sha512_match ||
    r.printed_p56_blake2b512_match);
  assert.equal(rows.length, 19);
  console.log(JSON.stringify({
    source_commit: sourceCommit, candidate_count: rows.length,
    exact_p56_digest_matches: matches, rows
  }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
