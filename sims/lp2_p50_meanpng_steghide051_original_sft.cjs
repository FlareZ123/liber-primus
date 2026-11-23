'use strict';
/**
 * Agent41: source-derived "Meanpng" steganographic password probe.
 * A candidate original p50 table-column private scalar deterministically
 * produces the Bitcoin P2PKH address 1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK.
 * It is not known that this is an author-intended instruction; this finite
 * original-JPEG test asks whether the visible word or exact address is
 * instead an authentic period Steghide 0.5.1 passphrase.
 *
 * Windows Node22 CJS, read-only. Requires the pinned, external Stegostudio
 * source at STEGOSTUDIO_DIR and the 75 checked-in original JPGs.
 * No key or image choices are fitted to an output.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const upstream = process.env.STEGOSTUDIO_DIR;
assert(upstream, 'Set STEGOSTUDIO_DIR to pinned Stegostudio checkout');
const readUp = file => fs.readFileSync(path.join(upstream, file));
const api = new Function(
  readUp('src/jpeg_dct.js').toString('utf8') + '\n' +
  readUp('src/decoder.js').toString('utf8') + '\n' +
  'return {decodeJpegCoefficients,shJpegEValues,shMakeBitReader,shIdentifyJpeg,shDecodeJpeg};'
)();
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

const publicSourceAddress = '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK';
// These three variants are fully specified before any original-image result.
const passwordChoices = [
  publicSourceAddress.slice(1, 8), // exactly the source-derived address payload word
  'mean.png',                       // literal proposed filename/instruction
  publicSourceAddress              // exact source-derived public string
];
assert.deepEqual(passwordChoices,
  ['Meanpng', 'mean.png', '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK']);

const STEGHIDE_MAGIC = 0x73688d;
/**
 * @param {Uint8Array} values Original JPEG DCT coefficients in Steghide order.
 * @param {string} password
 * @returns {boolean}
 */
function headerMatch(values, password) {
  return api.shMakeBitReader(values, password, 3, 2).getValue(24) === STEGHIDE_MAGIC;
}

async function main() {
  // Historical Steghide 0.5.1 source fixture: exact positive and wrong key.
  const dir = 'test/fixtures/third-party/steghide-f12/';
  const manifest = JSON.parse(readUp(dir + 'manifest.json').toString('utf8'));
  assert.equal(manifest.oracleTool, 'steghide version 0.5.1');
  const fixture = manifest.modes.find(m => m.mode === 'cbc');
  assert(fixture);
  const bytes = new Uint8Array(readUp(dir + fixture.file));
  assert.equal(sha(bytes), fixture.sha256);
  const dct = api.decodeJpegCoefficients(bytes);
  const coeff = api.shJpegEValues(bytes, dct);
  assert(headerMatch(coeff, manifest.passphrase));
  assert(!headerMatch(coeff, manifest.wrongPassphrase));
  const decoded = await api.shDecodeJpeg(bytes, manifest.passphrase, dct);
  assert(decoded && decoded.data instanceof Uint8Array);
  assert.equal(sha(decoded.data), manifest.seed.payloadSha256);
  console.log('Steghide 0.5.1 source-format positive:', decoded.data.length,
    'bytes, exact SHA256 recovery; wrong passphrase rejected');

  const hits = [];
  for (let i = 0; i < 75; i++) {
    const name = String(i).padStart(2, '0') + '.jpg';
    const jpeg = new Uint8Array(fs.readFileSync(path.join(
      root, 'resources', 'liber-primus', name)));
    const original = api.decodeJpegCoefficients(jpeg);
    const values = api.shJpegEValues(jpeg, original);
    const matched = [];
    for (const password of passwordChoices) {
      if (!headerMatch(values, password)) continue;
      const header = api.shIdentifyJpeg(jpeg, password, original);
      const data = header?.supported ?
        await api.shDecodeJpeg(jpeg, password, original) : null;
      const found = {
        jpg: name,
        password,
        header,
        payloadBytes: data?.data?.length || 0,
        payloadSha256: data?.data ? sha(data.data) : null,
        readablePreview: data?.text?.slice(0, 256) || null
      };
      matched.push(found);
      hits.push(found);
    }
    console.log('Original', name, 'DCT-values', values.length,
      'source-key-magic-hits', matched.length);
    if (global.gc) global.gc();
  }
  console.log(JSON.stringify({
    verdict: hits.length ? 'AUTHENTIC HEADER MATCH: inspect exact payload' :
      'NO STEGHIDE 0.5.1 SOURCE-KEY HEADER IN ORIGINAL JPG ARCHIVE',
    source: 'Original p50 missing-L source column; derived 1Meanpng... pointer',
    originalArchiveImages: 75,
    keysPerImage: passwordChoices.length,
    originalHeaderTests: 75 * passwordChoices.length,
    historicalOraclePositiveBytes: decoded.data.length,
    wrongKeyFixtureRejected: true,
    hits
  }, null, 2));
}
if (require.main === module) main()
  .catch(e => { console.error(e.stack || e); process.exitCode = 1; });
