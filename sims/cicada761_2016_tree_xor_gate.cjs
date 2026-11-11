'use strict';
/**
 * Exact cross-round 2013 MP3 XOR vs original signed-2016 tree JPEG.
 *
 * The 2013 operation used the unmodified 761.MP3 byte stream as an XOR
 * operand. This gate makes exactly one offset-zero application to the
 * byte-preserved 2016 JPEG. No key search, PCM decoding, reversal or
 * invented byte skips are performed.
 *
 * Run in the manual audio-761-pad-scan workflow, probe=xor-2016-image.
 * Output files and JSON summary make the test independently reproducible.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const mp3Path = process.env.LP761_MP3 || '/tmp/761.MP3';
const sourcePath = path.join(root, 'resources/historical/cicada2016-4gq25.jpg');
const controlPath = path.join(root, 'resources/liber-primus/49.jpg');
const outputDir = process.env.LP761_XOR_OUTPUT || '/tmp/cicada761-xor';
const EXPECTED_MP3_SHA256 = '83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460';
const EXPECTED_JPEG_BLOB = '22027296dcd7df53c5127e6aadbabeaf3223f72d';

/** @param {Buffer} b */
function sha256(b) {
  return crypto.createHash('sha256').update(b).digest('hex');
}

/** @param {Buffer} b */
function gitBlobSha(b) {
  return crypto.createHash('sha1').update(Buffer.from('blob ' + b.length + '\0')).update(b).digest('hex');
}

/**
 * The original full-file MP3 bytes form the pad. A JPEG longer than the
 * original MP3 is not an eligible input for this frozen direct operation.
 * @param {Buffer} carrier
 * @param {Buffer} mp3
 * @returns {Buffer}
 */
function xorAtZero(carrier, mp3) {
  assert.ok(carrier.length <= mp3.length, 'Carrier exceeds original pad');
  const out = Buffer.allocUnsafe(carrier.length);
  for (let i = 0; i < carrier.length; i++) out[i] = carrier[i] ^ mp3[i];
  return out;
}

/** @type {Array<{name:string,hex?:string,ascii?:string}>} */
const signatures = [
  {name:'JPEG',hex:'ffd8ff'}, {name:'PNG',hex:'89504e470d0a1a0a'},
  {name:'GIF87a',ascii:'GIF87a'}, {name:'GIF89a',ascii:'GIF89a'},
  {name:'ZIP',hex:'504b0304'}, {name:'ZIP-empty',hex:'504b0506'},
  {name:'GZIP',hex:'1f8b08'}, {name:'PDF',ascii:'%PDF-'},
  {name:'7Z',hex:'377abcaf271c'}, {name:'RAR',hex:'526172211a07'},
  {name:'Ogg',ascii:'OggS'}, {name:'ID3-MP3',ascii:'ID3'},
  {name:'SQLite',ascii:'SQLite format 3'},
  {name:'ELF',hex:'7f454c46'}, {name:'OpenPGP-armor',ascii:'-----BEGIN PGP'}
];

/** @param {Buffer} b */
function magic(b) {
  return signatures.filter(s => s.hex ? b.subarray(0, s.hex.length/2).toString('hex') === s.hex
    : b.subarray(0, Buffer.byteLength(s.ascii)).toString('ascii') === s.ascii).map(s=>s.name);
}

/** @param {string} file @param {Buffer} b */
function atomicWrite(file,b) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  const temp = file + '.' + process.pid + '.tmp';
  const fd = fs.openSync(temp, 'wx');
  try {
    fs.writeFileSync(fd,b);
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  fs.renameSync(temp,file);
}

/** @param {string} name @param {Buffer} source @param {Buffer} mp3 */
function testCarrier(name,source,mp3) {
  assert.equal(source.subarray(0,3).toString('hex'),'ffd8ff');
  const out = xorAtZero(source,mp3);
  const replay = xorAtZero(out,mp3);
  assert.deepEqual(replay,source);
  const target = path.join(outputDir,name+'.bin');
  atomicWrite(target,out);
  return {
    name, inputBytes:source.length, inputSha256:sha256(source),
    originalMagic:magic(source), resultBytes:out.length,
    resultSha256:sha256(out), resultFirst32Hex:out.subarray(0,32).toString('hex'),
    resultMagic:magic(out), roundTripBytes:replay.length, output:target
  };
}

function main() {
  const mp3 = fs.readFileSync(mp3Path);
  assert.equal(mp3.length,4010732);
  assert.equal(sha256(mp3),EXPECTED_MP3_SHA256);
  assert.equal(mp3.subarray(0,3).toString('ascii'),'ID3');
  const source = fs.readFileSync(sourcePath);
  assert.equal(source.length,26342);
  assert.equal(gitBlobSha(source),EXPECTED_JPEG_BLOB);
  const control = fs.readFileSync(controlPath);
  const real = testCarrier('2016-tree-offset0',source,mp3);
  const wrong = testCarrier('lp2-p32-wrong-carrier-offset0',control,mp3);
  assert.equal(real.resultFirst32Hex.slice(0,6),'b69ccc');
  console.log('SOURCE',JSON.stringify({
    mp3Path,mp3Bytes:mp3.length,mp3Sha256:sha256(mp3),
    treeImageGitBlob:gitBlobSha(source),padStart:'full MP3 byte 0',
    historicalOperation:'carrier[i] XOR original761MP3[i], 0 <= i < carrier.length'
  }));
  console.log('REAL',JSON.stringify(real));
  console.log('WRONG-CARRIER',JSON.stringify(wrong));
  console.log('DECISION',JSON.stringify({
    exactHistoricalOffsetZero:true,
    2016HeaderMatchesKnownContainers:real.resultMagic.length>0,
    wrongCarrierHeaderMatchesKnownContainers:wrong.resultMagic.length>0,
    note:'An unknown, deliberately headerless binary payload is outside this file-signature gate.'
  }));
}
if (require.main===module) main();
module.exports={xorAtZero,sha256,gitBlobSha,magic};
