'use strict';
/**
 * Source-constrained RSA block decryption of the LP2 256-byte base60 grid,
 * using the separately known, publicly factored Cicada 2012 and 2014
 * 432-bit challenge moduli. This directly tests recoverable binary payloads
 * rather than scoring a guessed GP plaintext or a synthetic key stream.
 *
 * Evaluates every 54-byte window, three physical table traversals, two
 * per-window byte directions and four elementary RSA public exponents.
 * Detects PKCS#1 v1.5 encryption/signature blocks, OAEP-SHA1 blocks with
 * the empty label and long raw ASCII runs. All positive controls encrypt
 * independent known text using the historical modulus before blind scanning.
 *
 * SFT: node sims/base60_historical_rsa432_block_inverse.cjs
 * @module base60_historical_rsa432_block_inverse
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'base60-grid.json'), 'utf8')).byte_rows;
assert.equal(grid.length, 32);
assert.ok(grid.every(r => r.length === 8 &&
  r.every(x => Number.isInteger(x) && x >= 0 && x < 256)));
const original = Buffer.from(grid.flat());
assert.equal(original.length, 256);
const originalSHA256 = crypto.createHash('sha256').update(original).digest('hex');
assert.equal(originalSHA256,
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const KEY_SOURCES = [
  {
    source: '2012 authenticated final-message P.S. factored modulus',
    p: 99554414790940424414351515490472769096534141749790794321708050837n,
    q: 104593961812606247801193807142122161186583731774511103180935025763n
  },
  {
    source: '2014 authenticated 432-bit factoring-stage modulus',
    p: 97513779050322159297664671238670850085661086043266591739338007321n,
    q: 77506098606928780021829964781695212837195959082370473820509360759n
  }
];
const K = 54;
const EXPONENTS = [3n, 17n, 257n, 65537n];

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a,b] = [b,a%b];
  return a;
}
/**
 * @param {bigint} a @param {bigint} m
 * @returns {bigint|null} Multiplicative inverse or null if unavailable.
 */
function inverse(a, m) {
  let [t,u,r,s] = [0n,1n,m,a];
  while (s) {
    const k = r/s;
    [t,u,r,s] = [u,t-k*u,s,r-k*s];
  }
  return r===1n ? (t%m+m)%m : null;
}
/** @param {bigint} x @param {bigint} e @param {bigint} n */
function modPow(x,e,n) {
  let out=1n;
  while(e) {
    if(e&1n) out=out*x%n;
    x=x*x%n;
    e>>=1n;
  }
  return out;
}
/** @param {bigint} v @returns {Buffer} Fixed-width RSA integer. */
function rsaBytes(v) {
  return Buffer.from(v.toString(16).padStart(2*K,'0'),'hex');
}
/** @param {Buffer} b @returns {bigint} */
const numberFrom = b => BigInt('0x'+b.toString('hex'));
/** @param {Buffer} b */
const hash = b => crypto.createHash('sha1').update(b).digest();
/** @param {Buffer} a @param {Buffer} b */
const xor = (a,b) => Buffer.from(a.map((v,i) => v^b[i]));
/** @param {Buffer} seed @param {number} length @returns {Buffer} */
function mgf1(seed,length) {
  const out=[];
  for(let i=0;out.length<length;i++) {
    const counter=Buffer.alloc(4);
    counter.writeUInt32BE(i);
    out.push(...hash(Buffer.concat([seed,counter])));
  }
  return Buffer.from(out.slice(0,length));
}
/**
 * RFC 8017 OAEP-SHA1, default/empty label; k=54, hLen=20.
 * @param {Buffer} block @returns {Buffer|null}
 */
function oaepUnpad(block) {
  if(block.length!==K || block[0]!==0) return null;
  const maskedSeed=block.subarray(1,21), maskedDB=block.subarray(21);
  const seed=xor(maskedSeed,mgf1(maskedDB,20));
  const db=xor(maskedDB,mgf1(seed,K-21));
  if(!db.subarray(0,20).equals(hash(Buffer.alloc(0)))) return null;
  let i=20;
  while(i<db.length && db[i]===0)i++;
  return db[i]===1 ? db.subarray(i+1) : null;
}
/**
 * EME-PKCS1-v1_5 or EMSA-PKCS1-v1_5: requires >=8 padding bytes.
 * @param {Buffer} block @returns {Buffer|null}
 */
function pkcs1Unpad(block) {
  if(block.length!==K || block[0]!==0 ||
     (block[1]!==1 && block[1]!==2)) return null;
  const kind=block[1];
  let i=2;
  while(i<block.length && (kind===1 ? block[i]===255 : block[i]!==0))i++;
  return i>=10 && i<block.length && block[i]===0 ?
    block.subarray(i+1) : null;
}
/** @param {Buffer} bytes @returns {[string,Buffer][]} */
function traversals(bytes) {
  const rows=Array.from({length:32},(_,r) => [...bytes.subarray(r*8,r*8+8)]);
  return [
    ['printed-row-major',Buffer.from(rows.flat())],
    ['printed-column-major',Buffer.from(
      Array.from({length:8},(_,c) => rows.map(r=>r[c])).flat())],
    ['alternating-row-direction',Buffer.from(
      rows.flatMap((r,i)=>i%2?r.slice().reverse():r))]
  ];
}
/**
 * Evaluate all 54-byte candidate RSA ciphertext words, including sliding
 * offsets within any hypothesised 64-byte fixed-width envelope.
 *
 * @param {Buffer} bytes
 * @param {typeof KEY_SOURCES} sources
 */
function scan(bytes,sources=KEY_SOURCES) {
  const results=[];
  for(const {source,p,q} of sources) {
    const n=p*q,totient=(p-1n)*(q-1n);
    assert.equal(n.toString(2).length,432);
    for(const e of EXPONENTS) {
      const d=inverse(e,totient);
      if(d===null)continue;
      let admissible=0,pkcs1=0,oaep=0,longAlphabetic=0,maxAlphabetic=0;
      const found=[];
      for(const [order,table] of traversals(bytes))
        for(const endian of ['forward','byte-reversed'])
          for(let offset=0;offset+K<=table.length;offset++) {
            const packed=Buffer.from(table.subarray(offset,offset+K));
            if(endian==='byte-reversed')packed.reverse();
            const ciphertext=numberFrom(packed);
            // Ordinary RSA ciphertext integers must satisfy 0 <= c < n.
            if(ciphertext>=n)continue;
            admissible++;
            const block=rsaBytes(modPow(ciphertext,d,n));
            const standard=pkcs1Unpad(block), masked=oaepUnpad(block);
            if(standard) {
              pkcs1++;
              found.push({order,endian,offset,scheme:'PKCS1',
                plaintext:standard.toString('utf8')});
            }
            if(masked) {
              oaep++;
              found.push({order,endian,offset,scheme:'OAEP-SHA1',
                plaintext:masked.toString('utf8')});
            }
            const runs=block.toString('latin1').match(/[A-Za-z ]+/g)||[];
            const longest=runs.reduce((m,s)=>Math.max(m,s.length),0);
            if(longest>=12)longAlphabetic++;
            maxAlphabetic=Math.max(maxAlphabetic,longest);
          }
      results.push({source,exponent:String(e),candidateCiphertexts:admissible,
        pkcs1Blocks:pkcs1,oaepSHA1Blocks:oaep,
        longAlphabeticBlocks:longAlphabetic,longestAlphabeticRun:maxAlphabetic,
        found});
    }
  }
  return results;
}
/** Synthetic proof that the scanner recovers fixed private RSA plaintext. */
function plantTest() {
  const base=KEY_SOURCES[0],n=base.p*base.q,e=65537n;
  const d=inverse(e,(base.p-1n)*(base.q-1n));
  assert.notEqual(d,null);

  const message=Buffer.from('CICADA','ascii');
  const ps=Buffer.alloc(K-message.length-3,0xa7);
  const standard=Buffer.concat([Buffer.from([0,2]),ps,
    Buffer.from([0]),message]);

  const oaepMessage=Buffer.from('HELLO','ascii');
  const seed=Buffer.alloc(20,7);
  const db=Buffer.concat([hash(Buffer.alloc(0)),
    Buffer.alloc(K-42-oaepMessage.length),Buffer.from([1]),oaepMessage]);
  const maskedDB=xor(db,mgf1(seed,db.length));
  const maskedSeed=xor(seed,mgf1(maskedDB,20));
  const oaep=Buffer.concat([Buffer.from([0]),maskedSeed,maskedDB]);
  assert.equal(standard.length,K);
  assert.equal(oaep.length,K);
  for(const [encoded,expected] of [[standard,message],[oaep,oaepMessage]]) {
    assert.ok(numberFrom(encoded)<n);
    const cipher=rsaBytes(modPow(numberFrom(encoded),e,n));
    const decrypted=rsaBytes(modPow(numberFrom(cipher),d,n));
    assert.ok(decrypted.equals(encoded));
    assert.ok(expected.length>0);
  }
  const planted=Buffer.from(original);
  rsaBytes(modPow(numberFrom(standard),e,n)).copy(planted,68);
  rsaBytes(modPow(numberFrom(oaep),e,n)).copy(planted,146);
  const diagnostic=scan(planted,[base]).find(x=>x.exponent==='65537');
  assert.ok(diagnostic.found.some(x=>x.order==='printed-row-major' &&
    x.endian==='forward' && x.offset===68 &&
    x.scheme==='PKCS1' && x.plaintext==='CICADA'));
  assert.ok(diagnostic.found.some(x=>x.order==='printed-row-major' &&
    x.endian==='forward' && x.offset===146 &&
    x.scheme==='OAEP-SHA1' && x.plaintext==='HELLO'));
  return {injectedOffsets:[68,146],pkcs1Recovered:'CICADA',
    oaepSHA1Recovered:'HELLO', verifiedFullScan:true};
}
function main() {
  const plant=plantTest(),observations=scan(original);
  assert.equal(observations.length,8);
  assert.ok(observations.every(x=>x.pkcs1Blocks===0 &&
    x.oaepSHA1Blocks===0 && x.longAlphabeticBlocks===0));
  const total=observations.reduce((n,x)=>n+x.candidateCiphertexts,0);
  assert.equal(total,7896);
  const answer={
    sourceGridSHA256:originalSHA256,gridLength:256,
    modulusSources:KEY_SOURCES.map(x=>x.source),
    examinedExponentList:EXPONENTS.map(String),
    traversals:['row-major','column-major','alternating-row-direction'],
    endianReadings:2,slidingOffsetsPerReading:203,
    totalAdmissibleRSADecryptions:total,
    observations,
    syntheticPositive:plant,
    outcome:'No PKCS#1 v1.5 or OAEP-SHA1 block, and no 12-character raw alphabetic run',
    caveat:'Excludes only these source RSA keys/exponents, 54-byte word placements, three traversals, two byte readings and the tested plaintext formats; not other keys, encodings or unrelated binary structures.'
  };
  console.log(JSON.stringify(answer,null,2));
  return answer;
}
if(require.main===module)main();
module.exports={scan,main,plantTest,pkcs1Unpad,oaepUnpad};
