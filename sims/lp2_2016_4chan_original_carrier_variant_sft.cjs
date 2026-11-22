'use strict';

/**
 * Exact January 7, 2016 4chan /x/ image witness check.
 *
 * The source's archived inline image resolves to this one Imgur object:
 * https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here
 * post 17184052, file 4gq25.jpg, preserved i.imgur.com/6yfjB9k.jpg.
 *
 * A byte-distinct JPEG could contain different original steganography;
 * a removed/redirected image cannot establish an image-byte conclusion.
 * Read-only, built-in Node 22, no network scanning or writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const originalPath = 'resources/historical/cicada2016-4gq25.jpg';
const original = fs.readFileSync(originalPath);
const url = 'https://i.imgur.com/6yfjB9k.jpg';
assert.equal(original.length, 26342);
assert.equal(original.subarray(0, 2).toString('hex'), 'ffd8');
assert.equal(original.subarray(original.length - 2).toString('hex'), 'ffd9');

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
/** @param {Buffer|Uint8Array} bytes @returns {boolean} */
const jpeg = (bytes) => bytes.length > 1000 &&
  bytes[0] === 0xff && bytes[1] === 0xd8 &&
  bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;

(async () => {
  /** @type {any} */
  const result = {
    witness: '2016-01-07T00:19:17Z /x/ post 17184052; exact archived image URL',
    requested_url: url,
    original_length: original.length,
    original_sha256: sha256(original)
  };
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (historical-research-original-byte-check)' }
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    Object.assign(result, {
      response_status: response.status,
      response_url: response.url,
      content_type: response.headers.get('content-type'),
      received_length: bytes.length,
      received_sha256: sha256(bytes),
      received_jpeg: jpeg(bytes),
      exact_original_bytes: bytes.equals(original)
    });
    if (jpeg(bytes) && process.env.CICADA_OUTGUESS === '1') {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cicada-2016-repost-'));
      const filename = path.join(tempDir, 'period-repost.jpg');
      const extracted = path.join(tempDir, 'period-repost.outguess');
      try {
        // Unique per-invocation temporary directory, never a shared repository write.
        fs.writeFileSync(filename, bytes);
        const run = spawnSync('outguess', ['-r', filename, extracted], {
          encoding: 'utf8', timeout: 20000
        });
        const payload = fs.existsSync(extracted) ? fs.readFileSync(extracted) : Buffer.alloc(0);
        const signed = fs.readFileSync('resources/historical/cicada2016-4gq25-outguess.asc');
        result.outguess = {
          exit_status: run.status,
          error: run.error?.message ?? null,
          stderr: run.stderr?.slice(0, 1500) ?? '',
          stdout: run.stdout?.slice(0, 1500) ?? '',
          recovered_bytes: payload.length,
          recovered_sha256: sha256(payload),
          exact_signed_payload: payload.equals(signed)
        };
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
    if (jpeg(bytes)) {
      result.decision = bytes.equals(original)
        ? '2016 repost exactly repeats the canonical already-extracted image; no additional carrier'
        : (result.outguess?.exact_signed_payload
          ? 'Byte-distinct repost gives the exact authentic 1136-byte OutGuess signature payload; no new first-layer message'
          : 'Distinct JPEG detected, with no verified new signed message under the exact unkeyed OutGuess extraction');
    } else {
      result.decision = 'No valid JPEG recovered; archival witness metadata cannot establish actual carrier bytes';
    }
  } catch (error) {
    result.error = String(error);
    result.decision = 'Host/network inaccessible; no image-byte conclusion';
  }
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; });
