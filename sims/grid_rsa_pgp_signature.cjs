'use strict';
/**
 * Check a literal interpretation of the LP2 256-byte base-60 grid as a
 * truncated/half-width RSA signature under Cicada's authentic public PGP key.
 *
 * A PKCS#1 v1.5 signature verifies if s^e mod n starts 00 01 FF...00
 * followed by a known DigestInfo. RSA-PSS encoded messages end with BC.
 * Under a 4096-bit modulus, a 256-byte unsigned integer is still a valid
 * mathematical input; its exponentiation does NOT bypass the modulus.
 *
 * This is a bounded test of RSA signature-style interpretations, not an
 * attempt to decrypt an RSA ciphertext (which needs the private key).
 *
 * Node.js 22; no dependencies:
 *   node sims/grid_rsa_pgp_signature.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const publicArmor = fs.readFileSync(
  path.join(ROOT, 'resources', 'control', 'cicada-3301-public-key.asc'), 'utf8'
);
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const bytes = Buffer.from(grid.byte_rows.flat());
assert.equal(bytes.length, 256);
const EXPECTED_FINGERPRINT = '6D854CD7933322A601C3286D181F01E57A35090F';

/**
 * @returns {Buffer} OpenPGP binary data without the ASCII-armor checksum.
 */
function dearmor(armor) {
  assert.match(armor, /BEGIN PGP PUBLIC KEY BLOCK/);
  const lines = armor.split(/\r?\n/);
  const b64 = lines.filter(line =>
    /^[A-Za-z0-9+/]+={0,2}$/.test(line) && line.length > 12
  ).join('');
  return Buffer.from(b64, 'base64');
}

/**
 * Read one OpenPGP packet length (RFC4880 old or new packet headers).
 * The official public key uses only definite-length packets.
 * @param {Buffer} raw
 * @param {number} offset
 * @param {boolean} newer
 * @returns {{size:number,end:number}}
 */
function packetLength(raw, offset, newer) {
  if (newer) {
    const first = raw[offset++];
    if (first < 192) return {size:first,end:offset};
    if (first < 224) {
      const second = raw[offset++];
      return {size:(first-192)*256+second+192,end:offset};
    }
    if (first === 255) return {size:raw.readUInt32BE(offset),end:offset+4};
    throw new Error('Unsupported partial OpenPGP packet length');
  }
  throw new Error('Old packet header lengths handled by parseKeys');
}

/**
 * Read one OpenPGP multi-precision integer from a v4 RSA key packet.
 * @param {Buffer} packet
 * @param {number} offset
 * @returns {{value:bigint,bits:number,end:number}}
 */
function readMPI(packet, offset) {
  const bits = packet.readUInt16BE(offset);
  const size = Math.ceil(bits / 8);
  const end = offset + 2 + size;
  assert.ok(end <= packet.length);
  const hex = packet.subarray(offset+2,end).toString('hex');
  return {value:BigInt('0x'+hex),bits,end};
}

/**
 * @param {Buffer} raw
 * @returns {Array<{tag:number,modulus:bigint,exponent:bigint,bits:number,fingerprint:string}>}
 */
function parseKeys(raw) {
  const out = [];
  let off = 0;
  while (off < raw.length) {
    const header = raw[off++];
    assert.ok(header & 0x80, 'Invalid OpenPGP packet header');
    const newer = Boolean(header & 0x40);
    const tag = newer ? header & 63 : (header >> 2) & 15;
    let size;
    if (newer) {
      const result = packetLength(raw,off,true);
      size=result.size;off=result.end;
    } else {
      const kind=header & 3;
      if(kind===3)size=raw.length-off;
      else {
        const n=[1,2,4][kind];
        size=0;for(let j=0;j<n;j++)size=size*256+raw[off++];
      }
    }
    const body=raw.subarray(off,off+size);
    assert.equal(body.length,size);
    off+=size;
    if(tag!==6 && tag!==14)continue;
    assert.equal(body[0],4,'Expected OpenPGP v4 key');
    assert.equal(body[5],1,'Expected RSA algorithm');
    const n=readMPI(body,6),e=readMPI(body,n.end);
    const fingerprint=createHash('sha1').update(Buffer.concat([
      Buffer.from([0x99,(size>>8)&255,size&255]),body
    ])).digest('hex').toUpperCase();
    out.push({tag,modulus:n.value,exponent:e.value,bits:n.bits,fingerprint});
  }
  return out;
}

/**
 * @param {bigint} base
 * @param {bigint} exponent
 * @param {bigint} modulus
 * @returns {bigint}
 */
function modPow(base, exponent, modulus) {
  let acc=1n, x=base%modulus, e=exponent;
  while(e>0n) {
    if(e&1n)acc=acc*x%modulus;
    x=x*x%modulus;
    e>>=1n;
  }
  return acc;
}

/**
 * @param {Buffer} x
 * @returns {bigint}
 */
function unsignedBE(x) {
  return BigInt('0x'+x.toString('hex'));
}

/**
 * @param {Buffer} encoded
 * @returns {{pkcs1v15:boolean,pssTrailer:boolean,oaepPrefix:boolean,digestInfo:boolean}}
 */
function formatChecks(encoded) {
  let k=2;
  while(k<encoded.length && encoded[k]===255)k++;
  const pkcs1v15=encoded[0]===0 && encoded[1]===1 &&
    k>=10 && encoded[k]===0;
  const der=['3021300906052b0e03021a05000414',
    '3031300d060960864801650304020105000420',
    '3051300d060960864801650304020305000440'];
  const suffix=pkcs1v15?encoded.subarray(k+1).toString('hex'):'';
  return {
    pkcs1v15, pssTrailer:encoded.at(-1)===0xbc,
    oaepPrefix:encoded[0]===0,
    digestInfo:der.some(x=>suffix.startsWith(x))
  };
}

function main() {
  const keys=parseKeys(dearmor(publicArmor));
  assert.equal(keys.length,2);
  assert.equal(keys[0].fingerprint, EXPECTED_FINGERPRINT);
  assert.deepEqual(keys.map(k=>k.bits),[4096,4096]);
  assert.ok(keys.every(k=>k.exponent===65537n));
  const cases=[];
  for(const [name,key] of keys.map((k,i)=>[i===0?'primary':'subkey',k])) {
    for(const [direction,arr] of [['forward',bytes],['reversed',Buffer.from(bytes).reverse()]]) {
      for(const alignment of ['low','high']) {
        let sig=unsignedBE(arr);
        if(alignment==='high')sig<<=2048n;
        if(sig>=key.modulus) {
          cases.push({key:name,direction,alignment,verdict:'out-of-range'});
          continue;
        }
        const value=modPow(sig,key.exponent,key.modulus);
        const padded=Buffer.from(value.toString(16).padStart(1024,'0'),'hex');
        const structure=formatChecks(padded);
        cases.push({key:name,direction,alignment,...structure,
          first16:padded.subarray(0,16).toString('hex'),
          last16:padded.subarray(-16).toString('hex')});
      }
    }
  }
  assert.equal(cases.filter(x=>x.verdict!=='out-of-range').length,6);
  assert.ok(cases.every(x=>!x.pkcs1v15 && !x.pssTrailer && !x.oaepPrefix));
  const report={
    model:'2048-bit grid as unsigned RSA signature integer (six valid interpretations)',
    fingerprint:keys[0].fingerprint,
    modulusBits:keys.map(x=>x.bits),
    publicExponent:'65537',
    scanned:cases,
    interpretation:'No valid PKCS1-v1.5, PSS trailer, or OAEP-leading-zero encoding under these tested RSA public exponent operations; encryption ciphertexts cannot be decrypted with a public key.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={dearmor,parseKeys,readMPI,modPow,formatChecks,main};
