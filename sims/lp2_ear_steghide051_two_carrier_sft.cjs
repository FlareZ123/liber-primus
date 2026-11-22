'use strict';

/**
 * Source-selected EAR as a literal Steghide 0.5.1 passphrase, on the two
 * original LP2 images selected by EAR's historical meaning and GP0 sum:
 * physical p22 corpse (39.jpg), and p32 11x11 tree (49.jpg).
 *
 * The full archive/passphrase research was already carried out elsewhere;
 * this is only eight new original carrier-key combinations, using the
 * pinned third-party Steghide parser and authentic AES-CBC positive fixture.
 *
 * Node.js 22, CommonJS, tested on GitHub Windows 11 runner.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const upstream = process.env.STEGOSTUDIO_DIR;
assert(upstream, 'STEGOSTUDIO_DIR must identify pinned upstream checkout');
const read = rel => fs.readFileSync(path.join(upstream, rel));
const decodeApi = new Function(
  read('src/jpeg_dct.js').toString('utf8') + '\n' +
  read('src/decoder.js').toString('utf8') + '\n' +
  'return {decodeJpegCoefficients,shJpegEValues,shMakeBitReader,' +
    'shIdentifyJpeg,shDecodeJpeg};'
)();
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sampleDir = 'test/fixtures/third-party/steghide-f12/';
const manifest = JSON.parse(read(sampleDir + 'manifest.json'));
assert.equal(manifest.oracleTool, 'steghide version 0.5.1');
const aesCbc = manifest.modes.find(mode => mode.mode === 'cbc');
assert(aesCbc);
const originalFixture = new Uint8Array(read(sampleDir + aesCbc.file));
assert.equal(sha256(originalFixture), aesCbc.sha256);

function identify(bytes, passphrase, dct, values) {
  const bitReader = decodeApi.shMakeBitReader(values, passphrase, 3, 2);
  const magic = bitReader.getValue(24);
  return magic === 0x73688d ?
    decodeApi.shIdentifyJpeg(bytes, passphrase, dct) : null;
}
async function main() {
  const fixtureDct = decodeApi.decodeJpegCoefficients(originalFixture);
  const fixtureValues = decodeApi.shJpegEValues(originalFixture, fixtureDct);
  const controlHeader = identify(originalFixture, manifest.passphrase,
    fixtureDct, fixtureValues);
  assert(controlHeader && controlHeader.supported &&
    controlHeader.algo === 2 && controlHeader.mode === 1);
  assert.equal(identify(originalFixture, manifest.wrongPassphrase,
    fixtureDct, fixtureValues), null);
  const plant = await decodeApi.shDecodeJpeg(
    originalFixture, manifest.passphrase, fixtureDct);
  assert(plant && plant.data instanceof Uint8Array);
  assert.equal(sha256(plant.data), manifest.seed.payloadSha256);
  const passwords = ['EAR', 'Ear', 'ear', 'ᛠᚱ'];
  const images = [{page:22,filename:'39.jpg'},
    {page:32,filename:'49.jpg'}];
  const found = [];
  for (const image of images) {
    const original = new Uint8Array(fs.readFileSync(path.join(
      root, 'resources/liber-primus', image.filename)));
    const dct = decodeApi.decodeJpegCoefficients(original);
    const values = decodeApi.shJpegEValues(original, dct);
    for (const passphrase of passwords) {
      const h = identify(original, passphrase, dct, values);
      if (h) {
        const decoded = h.supported ?
          await decodeApi.shDecodeJpeg(original, passphrase, dct) : null;
        found.push({page:image.page,passphrase,header:h,
          length:decoded?.data?.length ?? 0,
          sha256:decoded?.data ? sha256(decoded.data) : null,
          preview:decoded?.text?.slice(0,200) ?? null});
      }
      console.log('EAR_STEGHIDE_ORIGINAL',JSON.stringify({
        page:image.page,scan:image.filename,passphrase,
        steghideMagic:Boolean(h)}));
    }
  }
  console.log(JSON.stringify({
    positiveFixture:'authentic Steghide v0.5.1 AES-CBC',
    fixtureRecoveredBytes:plant.data.length,
    images:images.map(image=>image.filename),passwords,
    tested:images.length * passwords.length,
    found
  },null,2));
}
if (require.main === module)
  main().catch(error=>{console.error(error.stack ?? error);process.exitCode=1;});
