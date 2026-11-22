'use strict';

/**
 * Read-only image triage for the exact URLs linked by the Wikidot /talk:start.
 * Tests sizes and byte identities against the canonical 58 original LP2 scans.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const host = 'https://howwillyoutelltheworld.wdfiles.com/local--files/';
const exactPaths = [
  'start/x_What_is_this_x_I_was_browsing_on_Tor.png',
  'talk:start/037.jpg',
  'talk:start/009.png',
  'talk:start/002.png',
  'talk:start/039.png',
  'talk:start/040.png',
  'talk:start/014.png',
  'talk:start/the_last.jpg.png',
  'talk:start/023.png',
  'talk:start/021.png',
  'talk:start/015.png',
  'talk:start/016.jpg'
];

const digest = b => crypto.createHash('sha256').update(b).digest('hex');

/**
 * Read encoded bitmap dimensions without depending on image decoding.
 * @param {Buffer} b
 * @returns {string}
 */
function dimensions(b) {
  if (b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return 'PNG:' + b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
  }
  if (b.length >= 10 && b.subarray(0, 3).toString() === 'GIF') {
    return 'GIF:' + b.readUInt16LE(6) + 'x' + b.readUInt16LE(8);
  }
  if (b.length >= 12 && b[0] === 0xff && b[1] === 0xd8) {
    let p = 2;
    while (p + 9 < b.length) {
      if (b[p] !== 0xff) break;
      const marker = b[p + 1];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        p += 2;
        continue;
      }
      const len = b.readUInt16BE(p + 2);
      if (len < 2 || p + 2 + len > b.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return 'JPG:' + b.readUInt16BE(p + 5) + 'x' + b.readUInt16BE(p + 7);
      }
      p += 2 + len;
    }
    return 'JPG:dimensions-unavailable';
  }
  return 'other';
}

async function main() {
  const originals = new Map();
  for (let n = 17; n <= 74; n++) {
    const name = String(n).padStart(2, '0') + '.jpg';
    const bytes = fs.readFileSync(path.join('resources', 'liber-primus', name));
    originals.set(digest(bytes), { image: name, dimensions: dimensions(bytes) });
  }
  console.log('SOURCE_IMAGES', originals.size);
  for (const p of exactPaths) {
    const url = host + p.split('/').map(encodeURIComponent).join('/');
    console.log('CANDIDATE', p);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      const b = Buffer.from(await response.arrayBuffer());
      const sha = digest(b);
      const match = originals.get(sha);
      console.log('HTTP', response.status, 'SIZE', b.length, 'MIME', response.headers.get('content-type'));
      console.log('CLASS', dimensions(b), 'SHA256', sha, 'EXACT_LP2', match ? match.image : 'NO');
    } catch (err) {
      console.log('FETCH_ERROR', err instanceof Error ? err.toString() : String(err));
    }
  }
  console.log('END: source-linked response evidence only; no exact match does not exclude a derivative or draft');
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
