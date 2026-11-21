'use strict';

/**
 * The literal 33-GP-digit p55 shell can carry a 160-bit SHA1 digest.
 * Test whether it actually authenticates the 43-GP-digit interior or the
 * uniquely bracketed 43 original p50 bytes, using the 23-dot terminal mark
 * as a candidate 23-byte HMAC-SHA1 key length.
 *
 * This is a bounded source-led hypothesis, not a Cicada-authored algorithm.
 * Windows Node 22 CommonJS:
 * node sims/lp2_p55_sha1_shell_p50_23key_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const p55 = gp.pages.find(p=>p.page===55).indices;
const p57 = gp.pages.find(p=>p.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);
assert.equal(grid.bytes.length,256);
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const outside=[],inside=[];
let cursor=0;
for(const length of lengths){
  const word=p55.slice(cursor,cursor+length);
  assert.equal(word.length,length);
  cursor+=length;
  if(length===1)outside.push(word[0]);
  else{
    outside.push(word[0],word.at(-1));
    inside.push(...word.slice(1,-1));
  }
}
assert.deepEqual([cursor,outside.length,inside.length],[76,33,43]);
const bracket=Buffer.from(grid.bytes.slice(84,127));
assert.equal(bracket.length,43);
assert.deepEqual(grid.bytes.slice(82,84),[201,193]);
assert.deepEqual(grid.bytes.slice(127,129),[193,201]);

/** @param {number[]} digits @returns {bigint} */
function decode29(digits){
  let n=0n;
  for(const v of digits){
    assert(Number.isInteger(v)&&v>=0&&v<29);
    n=n*29n+BigInt(v);
  }
  return n;
}
/** @param {bigint} n @param {number} width @returns {number[]} */
function encode29(n,width){
  assert(n>=0n);
  const digits=Array(width).fill(0);
  for(let i=width-1;i>=0;i--){
    digits[i]=Number(n%29n);
    n/=29n;
  }
  assert.equal(n,0n);
  return digits;
}
/** @param {bigint} n @param {number} width @returns {Buffer} */
const integerBytes=(n,width)=>Buffer.from(n.toString(16).padStart(width*2,'0'),'hex');
/** @param {Buffer} bytes @returns {Buffer} */
const sha1=bytes=>crypto.createHash('sha1').update(bytes).digest();
/** @param {Buffer} key @param {Buffer} bytes @returns {Buffer} */
const hmac=(key,bytes)=>crypto.createHmac('sha1',key).update(bytes).digest();

const shell=decode29(outside);
assert(shell<(1n<<160n));
const target=integerBytes(shell,20);
assert.equal(target.toString('hex'),'efe89bff1c7eff588ec80605c99a364067960320');
assert.deepEqual(encode29(shell,33),outside);
const serializers={
  gp29DigitBytes:(v)=>Buffer.from(v),
  base29IntegerBigEndian27:(v)=>integerBytes(decode29(v),27),
  gp29Transliteration:(v)=>Buffer.from(v.map(i=>gp.translit[i]).join(''),'ascii'),
  gp29RunesUtf8:(v)=>Buffer.from(v.map(i=>gp.runes[i]).join(''),'utf8')
};
const candidateKeys={
  first23:bracket.subarray(0,23),
  last23:bracket.subarray(20,43)
};
const tests=[];
let positive=0;
for(const [name,serialize] of Object.entries(serializers)){
  const original=serialize(inside);
  const known=serialize(p57.slice(7,50));
  assert.equal(p57.slice(7,50).length,43);
  const standard=sha1(original);
  tests.push({model:'SHA1',serialize:name,match:standard.equals(target),
    digest:standard.toString('hex')});
  const positiveSha=sha1(known);
  assert.deepEqual(integerBytes(decode29(encode29(
    BigInt('0x'+positiveSha.toString('hex')),33)),20),positiveSha);
  positive++;
  for(const [keyName,key] of Object.entries(candidateKeys)){
    assert.equal(key.length,23);
    const digest=hmac(key,original);
    tests.push({model:'HMAC-SHA1',key:keyName,serialize:name,
      match:digest.equals(target),digest:digest.toString('hex')});
    const positiveHmac=hmac(key,known);
    assert.deepEqual(integerBytes(decode29(encode29(
      BigInt('0x'+positiveHmac.toString('hex')),33)),20),positiveHmac);
    positive++;
  }
}
const tableDigest=sha1(bracket);
tests.push({model:'SHA1',serialize:'p50-43bytes',
  match:tableDigest.equals(target),digest:tableDigest.toString('hex')});
assert.equal(tests.length,13);
assert.equal(positive,12);
assert.equal(tests.filter(t=>t.match).length,0);
console.log(JSON.stringify({
  status:'PASS',
  source:'LP2 p55 original 76 runes, p50 original 43-value bracket, solved p57 23-dot mark',
  exteriorGPCount:outside.length,
  interiorGPCount:inside.length,
  exteriorIfSHA1:target.toString('hex'),
  tests,
  successfulPlantedAuthentications:positive,
  originalDigestMatches:0,
  decision:'Reject these fixed SHA1 and 23-byte HMAC-SHA1 checksum readings of p55. A 33-digit base29 string fitting 160 bits is not by itself an authenticated digest.'
},null,2));
