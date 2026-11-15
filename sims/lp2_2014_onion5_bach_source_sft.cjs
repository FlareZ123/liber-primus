'use strict';

/**
 * Original-source, read-only SFT for the 2014 Onion5 Bach audio.
 *
 * Run on Windows Node 22 using: node sims/lp2_2014_onion5_bach_source_sft.cjs
 *
 * The test checks that Cicada's clearsigned 2014 message contains three
 * contiguous hex-encoded assets, that the third asset is identical to the
 * preserved original 2014 site MP3, and that 129 MPEG frames fill the file.
 * It is deliberately not a musical-square decoder.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');

const sources = Object.freeze({
  signed:
    'https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc',
  mp3:
    'https://raw.githubusercontent.com/micheloosterhof/cicada-2014/master/stage08/index.3.mp3'
});

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function getBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`GET ${url} returned HTTP ${response.statusCode}`));
        return;
      }

      /** @type {Buffer[]} */
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

/**
 * @param {string} text
 * @returns {Buffer[]}
 */
function extractHexBlocks(text) {
  /** @type {string[]} */
  const blocks = [];
  /** @type {string[]} */
  let current = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (/^[0-9a-f]{2,}$/i.test(line) && line.length % 2 === 0) {
      current.push(line);
      continue;
    }
    if (current.length) {
      blocks.push(current.join(''));
      current = [];
    }
  }
  if (current.length) blocks.push(current.join(''));

  return blocks.filter((hex) => hex.length >= 100).map((hex) => Buffer.from(hex, 'hex'));
}

/**
 * @param {Buffer} bytes
 * @returns {string}
 */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  const signed = await getBytes(sources.signed);
  const published = await getBytes(sources.mp3);
  const assets = extractHexBlocks(signed.toString('utf8'));

  assert.equal(assets.length, 3, 'Expected exactly three signed hex assets');
  assert.deepEqual(assets.map((value) => value.length), [1084, 1635, 9288]);
  assert.equal(assets[0].subarray(0, 2).toString('hex'), 'ffd8');
  assert.equal(assets[1].subarray(0, 2).toString('hex'), 'ffd8');
  assert.equal(assets[2].length, published.length);
  assert.ok(assets[2].equals(published), 'Original signed audio differs from original 2014 MP3');

  const frameSize = 72;
  assert.equal(published.length % frameSize, 0);
  let frames = 0;
  for (let offset = 0; offset < published.length; offset += frameSize) {
    const h = published.subarray(offset, offset + 4);
    assert.equal(h[0], 0xff, `MPEG sync byte at offset ${offset}`);
    assert.equal(h[1] & 0xfe, 0xf2, `MPEG-2 Layer III header at offset ${offset}`);
    assert.equal(h[2], 0x34, `24kb/s 24kHz header at offset ${offset}`);
    frames += 1;
  }
  assert.equal(frames, 129);

  console.log('SIGNED SOURCE:', sources.signed);
  console.log('2014 AUDIO:', sources.mp3);
  console.log('SIGNED HEX ASSET LENGTHS:', assets.map((b) => b.length).join(', '));
  console.log('SIGNED MP3 SHA256:', sha256(assets[2]));
  console.log('INDEPENDENT MP3 SHA256:', sha256(published));
  console.log('MPEG FRAMES:', frames, 'bytes/frame:', frameSize, 'total bytes:', published.length);
  console.log('PASS: 129/129 consecutive frames; exact signed-to-2014 byte identity.');
  console.log('INTERPRETATION: no appended audio bytes; no conclusion about spectral steganography.');
}

main().catch((error) => {
  console.error('FAIL:', error);
  process.exitCode = 1;
});
