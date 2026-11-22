'use strict';
/**
 * First-party 2013 DATA/560.17 source-key fragment gate.
 *
 * Tests the constrained hypothesis that the independently archived
 * 2014 256-byte sexagesimal operand (or the original LP2 printed variant)
 * was excerpted from Cicada's authenticated 2013 phone-stage XOR pad.
 * It is a pure source-fragment test, not a candidate LP2 decryption.
 * Windows 11 / Node.js 22; deterministic, read-only, network one file.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const printed = Buffer.from(JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json'
), 'utf8')).bytes);
const history = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'cicada2014-sexagesimal-source.json'
), 'utf8'));
const original = Buffer.from(history.binary_hex, 'hex');
assert.equal(printed.length, 256);
assert.equal(original.length, 256);
assert.equal(
  crypto.createHash('sha256').update(original).digest('hex'),
  history.source_sha256.binary
);

const sourceUrl = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' +
  'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/' +
  '2013/002-3301/3301-contents/data/560.17';

/**
 * Find the longest exact window of at least 16 bytes shared by the
 * fixed 256-byte operand and historical source. Emit index as a check.
 * This has no optimized offset or fitted plaintext.
 * @param {Buffer} receiver
 * @param {Buffer} source
 * @returns {{length:number,recipientPosition:number,sourcePosition:number}}
 */
function strongestFragment(receiver, source) {
  let best = { length: 0, recipientPosition: -1, sourcePosition: -1 };
  for (let i = 0; i + 16 <= receiver.length; i++) {
    const segment = receiver.subarray(i, i + 16);
    const at = source.indexOf(segment);
    if (at < 0) continue;
    let length = 16;
    while (i + length < receiver.length &&
      at + length < source.length &&
      receiver[i + length] === source[at + length]) length++;
    if (length > best.length) {
      best = { length, recipientPosition: i, sourcePosition: at };
    }
  }
  return best;
}

async function main() {
  const response = await fetch(sourceUrl);
  assert.equal(response.status, 200);
  const binary = Buffer.from(await response.arrayBuffer());
  assert.equal(binary.length, 1183811);
  const actualSHA256 = crypto.createHash('sha256').update(binary).digest('hex');
  assert.equal(
    actualSHA256,
    'd5676b1e01fd371cb13415b59b2eca4336e96f7bb05e789198b8d6baab580c19'
  );

  const variants = [
    ['2014-original', original],
    ['LP2-print', printed],
    ['2014-original-reversed', Buffer.from(original).reverse()],
    ['LP2-print-reversed', Buffer.from(printed).reverse()]
  ];
  /** @type {Array<{name:string,exactIndex:number,longestAtLeast16:ReturnType<typeof strongestFragment>}>} */
  const outcomes = [];
  for (const [name, bytes] of variants) {
    outcomes.push({
      name,
      exactIndex: binary.indexOf(bytes),
      longestAtLeast16: strongestFragment(bytes, binary)
    });
  }
  assert.equal(printed.reduce((n, x, i) => n + Number(x !== original[i]), 0), 10);
  console.log(JSON.stringify({
    source: '2013 CicadaOS DATA/560.17 (historic Git blob 49df8e57...)',
    sourceBytes: binary.length,
    sourceSHA256: actualSHA256,
    downstream256ByteVariants: outcomes,
    interpretation: outcomes.some(x => x.exactIndex >= 0 ||
      x.longestAtLeast16.length > 0)
      ? 'An exact source fragment exists; inspect the indexed bytes and authored source selector before treating this as a key.'
      : 'No exact 16-byte or longer common window or complete 256-byte pad excerpt; no key/plaintext.'
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
