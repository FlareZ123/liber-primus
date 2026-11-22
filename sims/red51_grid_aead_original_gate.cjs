'use strict';
/**
 * Original-source authenticated decryption gate for LP2's exact 256-byte
 * printed table, using physical p53's 51 contiguous red GP symbols as a
 * 256-bit key and the preceding 128 black GP symbols as an IV.
 *
 * The earlier red51 AES tests checked plaintext readability, while this
 * test requires a cryptographic authentication tag: if the final/initial
 * 16 table bytes are an AES-256-GCM or ChaCha20-Poly1305 tag, the authentic
 * red-derived key and IV must validate byte-for-byte independently of any
 * assumptions about plaintext language or compression.
 *
 * Source-committed finite variants:
 * - Four zero-padded radix29 red keys and 32 explicit 5-bit red key packs
 *   (51*5 bits + one bit, including order and endian conventions).
 * - Original/reversed/complemented black-128 parity IV, all-zero IV; 16
 *   bytes or first/last 12 bytes (ChaCha requires 12 bytes).
 * - The two *published* numeral alphabets: printed radix60 and missing-f
 *   radix59, both with/without five independently audited token fixes.
 * - 32x8 row-major, column-major, original per-page-column and each
 *   reversed ordering. Authentication tag at first or final 16 bytes.
 * - AEAD associated data fixed to empty, as no published source AAD
 *   instruction has been identified.
 *
 * Positive controls encrypt exactly 240 unknown bytes and authenticate
 * them byte-exact under real source red-derived keys for both AEADs.
 *
 * Node 22 / CommonJS, builtin crypto only. No plaintext guessed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {columns} = require('./grid_base59_original_inverse.cjs');

const ROOT=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const page=corpus.pages.find(p=>p.page===53);
assert.equal(page.indices.length,179);
const black=page.indices.slice(0,128),red=page.indices.slice(128);
assert.equal(black.length,128);
assert.equal(red.length,51);
assert(red.every(x=>Number.isInteger(x)&&x>=0&&x<29));

/** @param {number[]} bits @returns {Buffer} */
function bitsToBuffer(bits) {
  assert.equal(bits.length%8,0);
  return Buffer.from(Array.from({length:bits.length/8},(_,i)=>{
    let byte=0;
    for(let j=0;j<8;j++)byte=(byte<<1)|bits[i*8+j];
    return byte;
  }));
}

/** @returns {{name:string,bytes:Buffer}[]} */
function sourceKeys() {
  const variants=[];
  const orientations=[
    ['forward',red],
    ['reversed',red.slice().reverse()],
    ['atbash',red.map(x=>28-x)],
    ['atbash-reversed',red.slice().reverse().map(x=>28-x)]
  ];
  for(const [label,values] of orientations) {
    let integer=0n;
    for(const x of values)integer=integer*29n+BigInt(x);
    const hex=integer.toString(16).padStart(64,'0');
    assert.equal(hex.length,64);
    variants.push({name:'radix29-'+label,bytes:Buffer.from(hex,'hex')});
  }
  for(const [orientation,values] of [
    ['forward',red],['reversed',red.slice().reverse()]
  ]) for(const bitOrder of ['big','little']) for(const zeroBit of [0,1])
    for(const at of ['prefix','suffix']) for(const reverseBytes of [false,true]) {
      const fieldBits=values.flatMap(value=>
        Array.from({length:5},(_,index)=>bitOrder==='big'?
          (value>>(4-index))&1:(value>>index)&1));
      assert.equal(fieldBits.length,255);
      const bits=at==='prefix'?[zeroBit,...fieldBits]:[...fieldBits,zeroBit];
      const raw=bitsToBuffer(bits);
      assert.equal(raw.length,32);
      variants.push({
        name:'5bit-'+orientation+'-'+bitOrder+'-'+zeroBit+'-'+at+
          (reverseBytes?'-reverseBytes':''),
        bytes:reverseBytes?Buffer.from(raw).reverse():raw
      });
    }
  assert.equal(variants.length,36);
  for(const x of variants)assert.equal(x.bytes.length,32);
  return variants;
}

/** @returns {{name:string,bytes:Buffer}[]} */
function sourceNonces() {
  const styles=[
    ['black128',black],
    ['reverse128',black.slice().reverse()],
    ['complement128',black.map(x=>28-x)],
    ['reverse-complement128',black.slice().reverse().map(x=>28-x)]
  ];
  const candidates=[
    {name:'zero12',bytes:Buffer.alloc(12)},
    {name:'zero16',bytes:Buffer.alloc(16)}
  ];
  for(const [name,values] of styles) {
    const bytes=bitsToBuffer(values.map(x=>x&1));
    assert.equal(bytes.length,16);
    candidates.push({name:name+'-full16',bytes});
    candidates.push({name:name+'-first12',bytes:bytes.subarray(0,12)});
    candidates.push({name:name+'-last12',bytes:bytes.subarray(4)});
  }
  assert.equal(candidates.length,14);
  return candidates;
}

/**
 * Grid layouts are based on the *original three physical page boundaries*:
 * 10x8, 13x8 and 9x8 tokens, independently decoded in each radix.
 *
 * @returns {{name:string,bytes:Buffer}[]}
 */
function sourceCiphertexts() {
  const variants=[];
  for(const radix of [59,60])for(const corrected of [false,true]) {
    const col=columns(radix,corrected);
    const rows=Array.from({length:32},(_,i)=>col.map(c=>c[i]));
    const rowMajor=rows.flat();
    const columnMajor=col.flat();
    const pageRows=[rows.slice(0,10),rows.slice(10,23),rows.slice(23,32)];
    const perPage=pageRows.flatMap(part=>
      Array.from({length:8},(_,i)=>part.map(row=>row[i])).flat());
    for(const [layout,ordered] of [
      ['row',rowMajor],['column',columnMajor],
      ['perpage-column',perPage]
    ])for(const reverse of [false,true]) {
      const raw=Buffer.from(reverse?ordered.slice().reverse():ordered);
      assert.equal(raw.length,256);
      variants.push({
        name:'radix'+radix+(corrected?'-five-audited':'-raw')+
          '-'+layout+(reverse?'-reverse':''),
        bytes:raw
      });
    }
  }
  assert.equal(variants.length,24);
  return variants;
}

/**
 * AES-GCM and ChaCha20-Poly1305 throw when an expected tag is incorrect.
 * @param {string} algorithm
 * @param {Buffer} key
 * @param {Buffer} nonce
 * @param {Buffer} encrypted
 * @param {Buffer} tag
 * @returns {Buffer|null}
 */
function authenticate(algorithm,key,nonce,encrypted,tag) {
  assert.equal(key.length,32);
  assert.equal(tag.length,16);
  if(algorithm==='chacha20-poly1305'&&nonce.length!==12)return null;
  const decoder=crypto.createDecipheriv(algorithm,key,nonce,
    {authTagLength:16});
  decoder.setAuthTag(tag);
  try{
    return Buffer.concat([decoder.update(encrypted),decoder.final()]);
  }catch(error){
    // Wrong-source keys/tags normally fail authentication. Other bugs
    // (unsupported ciphers or invalid arguments) are outside this catch.
    if(error && /authenticat|unsupported state|bad decrypt/i.test(String(error)))
      return null;
    throw error;
  }
}

/** Authenticated-encryption positive with two independent cipher algorithms. */
function positive(keys,nonces) {
  const secret=keys.find(x=>x.name==='radix29-forward').bytes;
  const nonce=nonces.find(x=>x.name==='black128-first12').bytes;
  const plaintext=Buffer.from(Array.from({length:240},
    (_,i)=>(i*71+23)%256));
  const rows=[];
  for(const algorithm of ['aes-256-gcm','chacha20-poly1305']) {
    const cipher=crypto.createCipheriv(algorithm,secret,nonce,
      {authTagLength:16});
    const bytes=Buffer.concat([cipher.update(plaintext),cipher.final()]);
    const tag=cipher.getAuthTag();
    assert.equal(tag.length,16);
    const decoded=authenticate(algorithm,secret,nonce,bytes,tag);
    assert(decoded&&decoded.equals(plaintext));
    const wrongTag=Buffer.from(tag);wrongTag[0]^=1;
    assert.equal(authenticate(algorithm,secret,nonce,bytes,wrongTag),null);
    rows.push({algorithm,plantedPlainBytes:plaintext.length,
      authenticated:decoded.equals(plaintext),tamperedTagRejected:true});
  }
  return rows;
}

function main() {
  const keys=sourceKeys(),nonces=sourceNonces(),
    ciphertexts=sourceCiphertexts();
  const synthetic=positive(keys,nonces);
  let attempts=0,rejected=0;
  const hits=[];
  for(const source of ciphertexts)
    for(const key of keys)
      for(const nonce of nonces)
        for(const algorithm of ['aes-256-gcm','chacha20-poly1305'])
          for(const tagPlacement of ['first16','last16']) {
            if(algorithm==='chacha20-poly1305'&&nonce.bytes.length!==12)
              continue;
            const input=source.bytes;
            const encrypted=tagPlacement==='first16'?
              input.subarray(16):input.subarray(0,240);
            const tag=tagPlacement==='first16'?
              input.subarray(0,16):input.subarray(240);
            attempts++;
            const plaintext=authenticate(algorithm,key.bytes,
              nonce.bytes,encrypted,tag);
            if(plaintext===null){rejected++;continue;}
            const digest=crypto.createHash('sha256').update(plaintext)
              .digest('hex');
            hits.push({source:source.name,key:key.name,iv:nonce.name,
              algorithm,tagPlacement,plaintextSha256:digest,
              plaintextHex:plaintext.toString('hex'),
              utf8:plaintext.toString('utf8')});
          }
  assert.equal(rejected+hits.length,attempts);
  const result={
    hypothesis:'The 256 original printed grid-byte values are 240 bytes of AEAD ciphertext plus a 16-byte exact authentication tag, under a 51-red-rune AES256/ChaCha key and black128 parity IV',
    manuscriptSources:'LP2 page 53 black [0,128), red [128,179); table on pages49-51',
    originalGridBytes:256,redRunes:51,precedingBlackRunes:128,
    keyVariants:keys.length,ivVariants:nonces.length,
    originalCipherLayouts:ciphertexts.length,
    authenticationTagBytes:16,
    cipherAlgorithms:['aes-256-gcm','chacha20-poly1305'],
    zeroAssociatedData:true,
    exactAuthenticatedAttempts:attempts,
    authenticationRejections:rejected,
    authenticSourceMatches:hits,
    fullRoundtripPositive:synthetic,
    interpretation:hits.length?
      'AUTHENTIC TAG MATCH: independently verify source key, source bytes, and recovered 240-byte plaintext.':
      'No tested table layout/key/nonce interpretation verifies a real 16-byte authentication tag. The test says nothing about other cipher modes, key derivations, external salts or absent AEAD tags.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)main();
module.exports={authenticate,sourceKeys,sourceNonces,sourceCiphertexts,
  positive,main};
