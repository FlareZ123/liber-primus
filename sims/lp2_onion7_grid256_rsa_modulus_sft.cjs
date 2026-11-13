'use strict';

/**
 * Test one source-fixed 2014 v2 RSA-1024 public-key consumer of LP2's
 * physical 32x8 two-glyph/256-byte table. Full 80-bit SHA1 preimage
 * discriminator; neither generated score threshold nor English model.
 *
 * Run: node sims/lp2_onion7_grid256_rsa_modulus_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const tokens = original.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(original.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
const target = Buffer.from('5634a3ae032fe03cb402', 'hex');
const sixty = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const fiftyNine = sixty.replace('f', '');
assert.equal(sixty.length, 60);
assert.equal(fiftyNine.length, 59);
assert.ok(tokens.every(token => token.length === 2 && !token.includes('f')));

/** @param {number} n @returns {Buffer} */
function lengthDER(n) {
  assert.ok(Number.isInteger(n) && n >= 0 && n <= 65535);
  if (n <= 127) return Buffer.from([n]);
  if (n <= 255) return Buffer.from([0x81, n]);
  return Buffer.from([0x82, n >>> 8, n & 255]);
}

/** @param {number} tag @param {Buffer} body @returns {Buffer} */
function tagged(tag, body) {
  return Buffer.concat([Buffer.from([tag]), lengthDER(body.length), body]);
}

/**
 * ASN.1 PKCS#1 RSAPublicKey, SHA1 input required for Tor-v2 hostname.
 * @param {Buffer} modulus Original 128-byte RSA-1024 modulus (big-endian)
 * @param {number} exponent RSA public exponent 3 or 65537
 * @returns {Buffer}
 */
function rsaPublicDER(modulus, exponent) {
  assert.equal(modulus.length, 128);
  assert.ok([3,65537].includes(exponent));
  const signedModulus = modulus[0] >= 128
    ? Buffer.concat([Buffer.from([0]), modulus])
    : modulus;
  const exponentBytes = exponent === 3
    ? Buffer.from([3])
    : Buffer.from([1,0,1]);
  return tagged(0x30, Buffer.concat([
    tagged(0x02, signedModulus),
    tagged(0x02, exponentBytes),
  ]));
}

/** @param {Buffer} encoded @returns {Buffer} */
function id80(encoded) {
  return crypto.createHash('sha1').update(encoded).digest().subarray(0,10);
}

/** @param {string} alphabet @returns {Buffer} */
function sourceBytes(alphabet) {
  const radix = alphabet.length;
  return Buffer.from(tokens.map(token => {
    const hi=alphabet.indexOf(token[0]);
    const lo=alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, 'unrecognized table glyph');
    const b = hi * radix + lo;
    assert.ok(b >= 0 && b < 256, 'table digit pair must be a byte');
    return b;
  }));
}

/** @param {Buffer} bytes @returns {Buffer} */
function columnOrder(bytes) {
  assert.equal(bytes.length, 256);
  const out = [];
  for (let col=0;col<8;col++) {
    for (let row=0;row<32;row++) out.push(bytes[row*8+col]);
  }
  return Buffer.from(out);
}

/** @typedef {{index:number,reversed:boolean,exponent:number}} Match */

/**
 * Tests every 128-byte window with no arbitrary reordering.
 * Every real RSA-1024 modulus is 128 bytes long, odd, and starts >= 0x80.
 * @param {Buffer} bytes 256 original table bytes
 * @param {Buffer} expected Onion name's exact 80-bit public-key hash
 * @returns {{eligible:number,hashes:number,hits:Match[]}}
 */
function scan(bytes,expected) {
  assert.equal(bytes.length, 256);
  const hits=[];
  let eligible=0;
  let hashes=0;
  for (let index=0;index<=128;index++) {
    for (const reversed of [false,true]) {
      const slice=bytes.subarray(index,index+128);
      const modulus=reversed?Buffer.from(slice).reverse():slice;
      if (modulus[0]<128 || (modulus[127]&1)===0) continue;
      eligible++;
      for (const exponent of [3,65537]) {
        hashes++;
        if (id80(rsaPublicDER(modulus,exponent)).equals(expected)) {
          hits.push({index,reversed,exponent});
        }
      }
    }
  }
  return {eligible,hashes,hits};
}

const standard=sourceBytes(sixty);
assert.deepEqual(standard,Buffer.from(original.bytes));
const base59=sourceBytes(fiftyNine);
assert.equal(standard.length,256);
assert.equal(base59.length,256);
assert.equal(Math.max(...base59),251);

// Positive control: an independently generated genuine 1024-bit RSA key
// matches our ASN.1 encoding byte-for-byte and is recovered from the
// implanted table at the known exact offset by the same scanner.
const {publicKey}=crypto.generateKeyPairSync('rsa',{
  modulusLength:1024,publicExponent:65537,
});
const publicJwk=publicKey.export({format:'jwk'});
const n=Buffer.from(publicJwk.n,'base64url');
const referenceDER=publicKey.export({format:'der',type:'pkcs1'});
assert.equal(n.length,128);
assert.deepEqual(rsaPublicDER(n,65537),referenceDER);
const expectedPlant=id80(referenceDER);
const plant=Buffer.from(standard);
n.copy(plant,0);
const positive=scan(plant,expectedPlant);
assert.ok(positive.hits.some(hit =>
  hit.index===0 && !hit.reversed && hit.exponent===65537));
console.log('CONTROL: planted RSA-1024 modulus matched Tor-v2 80-bit hash at known byte window.');

let total=0;
let found=0;
for (const [radix,bytes] of [['base60',standard],['base59-omitting-f',base59]]) {
  for (const [order,stream] of [['row-major',bytes],['column-major',columnOrder(bytes)]]) {
    const result=scan(stream,target);
    total+=result.hashes;
    found+=result.hits.length;
    console.log(JSON.stringify({radix,order,...result}));
  }
}
assert.equal(found,0, 'possible exact 2014 onion7 RSA identity modulus discovered');
console.log(JSON.stringify({
  passed:true,
  candidateHashComparisons:total,
  found,
  target80:target.toString('hex'),
  conclusion:'No straight 128-byte table window is the 2014 book-host RSA-1024 public identity modulus under tested source-frozen layouts.',
}));
module.exports = {rsaPublicDER,sourceBytes,columnOrder,scan};
