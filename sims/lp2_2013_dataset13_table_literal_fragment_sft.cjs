'use strict';
/**
 * Original CicadaOS 118,818,811-byte DATA/560.13 pad vs 2014/LP2 256-byte
 * sexagesimal operands: literal fragment test.
 * Windows Node22; read-only; one source-locked network download.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const printed = Buffer.from(JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8')).bytes);
const historical = Buffer.from(JSON.parse(fs.readFileSync(path.join(
  root, 'resources', 'cicada2014-sexagesimal-source.json'
), 'utf8')).binary_hex, 'hex');
assert.equal(printed.length, 256);
assert.equal(historical.length, 256);

const url = 'https://archive.org/download/3301.iso/3301.iso/DATA%2F560.13';

/**
 * @param {Buffer} target
 * @param {Buffer} pad
 * @returns {{exact256Offset:number,first16WindowOffset:number,first16SourceOffset:number}}
 */
function findExactSourceFragment(target, pad) {
  let first16WindowOffset = -1, first16SourceOffset = -1;
  for (let i = 0; i <= target.length - 16; i++) {
    const offset = pad.indexOf(target.subarray(i, i + 16));
    if (offset >= 0) {
      first16WindowOffset = i;
      first16SourceOffset = offset;
      break;
    }
  }
  return {
    exact256Offset: pad.indexOf(target),
    first16WindowOffset,
    first16SourceOffset
  };
}

async function main() {
  const response = await fetch(url, { signal: AbortSignal.timeout(420000) });
  assert.equal(response.status, 200);
  const pad = Buffer.from(await response.arrayBuffer());
  assert.equal(pad.length, 118818811);
  const sha = crypto.createHash('sha256').update(pad).digest('hex');
  assert.equal(sha, 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');
  const variants = [
    ['2014-historical-forward', historical],
    ['LP2-printed-forward', printed],
    ['2014-historical-reversed', Buffer.from(historical).reverse()],
    ['LP2-printed-reversed', Buffer.from(printed).reverse()]
  ];
  const results = variants.map(([name, values]) => ({
    name, ...findExactSourceFragment(values, pad)
  }));
  console.log(JSON.stringify({
    source: '2013 CicadaOS DATA/560.13 from archive.org 3301.iso',
    bytes: pad.length, sha256: sha,
    results,
    decision: results.some(x => x.exact256Offset >= 0 || x.first16SourceOffset >= 0)
      ? 'An exact common source fragment exists; inspect source-position and original key selection.'
      : 'No unchanged >=16-byte table fragment found in either direction; no original pad excerpt, decoder or plaintext.'
  }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
