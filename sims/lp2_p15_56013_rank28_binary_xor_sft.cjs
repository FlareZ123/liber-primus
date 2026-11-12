'use strict';
/**
 * Source-fixed test: LP2 p15..p22 GP28 predecessor-exclusion ranks, encoded
 * into binary, XORed against the authentic 2013 DATA/560.13 byte stream.
 * Node 22 CJS. Usage: node sims/lp2_p15_56013_rank28_binary_xor_sft.cjs <DATA-file>
 * This is a hypothetical new cipher operation, not an authenticated decoder.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const head = corpus.pages[15].indices.slice(0, 9);
assert.deepEqual(head, [0,1,20,19,24,28,26,22,24]);
const n = head.reduce((v,x) => 29n * v + BigInt(x), 0n);
assert.equal(n, 29553734724n);
assert.equal(n % 3301n, 560n);
const at = Number(n / 3301n);
assert.equal(at, 8952964);
const cipher = corpus.pages.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap(p => p.page === 15 ? p.indices.slice(9) : p.indices);
assert.equal(cipher.length, 1894);
const mask = cipher.flatMap((c,i) => i > 0 && c === cipher[i-1] ? [i] : []);
assert.deepEqual(mask, [240,777,968,995,1060,1101,1162,1463,1649,1864]);
assert.ok(process.argv[2], 'Supply original DATA/560.13 path');
const file = fs.readFileSync(process.argv[2]);
assert.equal(file.length, 118818811);
assert.equal(crypto.createHash('sha256').update(file).digest('hex'),
  'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');
const historicC = Buffer.from('28c07e1b102d4d5c4c1a376e064477e1416fcc94928765', 'hex');
assert.equal(Buffer.from(historicC.map((b,i) => b ^ file[12821+i])).toString('ascii'),
  'gbyh7znm6c7ezsmr.onion\n');

/** @typedef {'cyclic'|'sorted'} Order */
/** @param {number} prior @param {number} current @param {Order} order */
function rank(prior,current,order) {
  assert.notEqual(prior,current);
  const v = order === 'cyclic' ? (current-prior+29)%29-1
    : current-Number(current>prior);
  assert.ok(v>=0 && v<28);
  return v;
}
/** @param {number} prior @param {number} digit @param {Order} order */
function unrank(prior,digit,order) {
  const c = order === 'cyclic' ? (prior+digit+1)%29
    : (digit<prior ? digit : digit+1);
  assert.equal(rank(prior,c,order),digit);
  return c;
}
/** @param {number[]} source @param {Order} order */
function unpack(source,order) {
  const digits=[], packets=[[]];
  for(let i=1;i<source.length;i++) {
    if(source[i]===source[i-1]) packets.push([]);
    else {const v=rank(source[i-1],source[i],order);
      digits.push(v); packets[packets.length-1].push(v);}
  }
  return {digits,packets};
}
/** @param {number[]} digits */
function integer(digits) {
  return digits.reduce((v,d) => v*28n+BigInt(d),0n);
}
/** @param {bigint} value */
function bytes(value) {
  let h=value.toString(16);
  if(h.length%2) h='0'+h;
  return Buffer.from(h,'hex');
}
/** @param {Buffer} source @param {number} start */
function xor(source,start) {
  return Buffer.from(source.map((v,i) => v^file[start+i]));
}
/** @param {Buffer} data */
function summarize(data) {
  const freq=Array(256).fill(0);
  for(const b of data) freq[b]++;
  const printable=[...data].filter(x=>x>=32&&x<=126).length;
  const letters=[...data].filter(x=>(x>=65&&x<=90)||(x>=97&&x<=122)).length;
  const runs=(data.toString('latin1').match(/[\x20-\x7e]{8,}/g)||[])
    .sort((a,b)=>b.length-a.length).slice(0,3);
  const magic=[['PDF','255044462d'],['ZIP','504b0304'],
    ['PNG','89504e470d0a1a0a'],['gzip','1f8b08'],
    ['JPEG','ffd8ff'],['bzip2','425a68'],['xz','fd377a585a00'],
    ['zstd','28b52ffd'],['PGP',Buffer.from('-----BEGIN PGP').toString('hex')]]
    .filter(([,h])=>data.subarray(0,h.length/2).toString('hex')===h)
    .map(([s])=>s);
  const entropy=freq.reduce((s,f)=>f ? s-(f/data.length)*Math.log2(f/data.length):s,0);
  return {bytes:data.length,printable,letters,spaces:freq[32],
    entropy:Number(entropy.toFixed(6)),magic,
    first32Hex:data.subarray(0,32).toString('hex'),
    preview:[...data.subarray(0,120)].map(x=>x>=32&&x<=126?
      String.fromCharCode(x):'.').join(''),
    longestPrintableRuns:runs,
    sha256:crypto.createHash('sha256').update(data).digest('hex')};
}
/** @param {Buffer} source @param {number} width */
function digitsOf(source,width) {
  let value=BigInt('0x'+source.toString('hex'));
  const digits=Array(width).fill(0);
  for(let i=width-1;i>=0;i--) {digits[i]=Number(value%28n);value/=28n;}
  assert.equal(value,0n);
  return digits;
}
/** @param {number[]} digits @param {Order} order */
function makePlant(digits,order) {
  const out=[cipher[0]];
  let j=0;
  for(let i=1;i<cipher.length;i++) {
    if(cipher[i]===cipher[i-1])out.push(out[i-1]);
    else out.push(unrank(out[i-1],digits[j++],order));
  }
  assert.equal(j,digits.length);
  return out;
}
const findings=[];
for(const order of /** @type {Order[]} */ (['cyclic','sorted'])) {
  const t=unpack(cipher,order);
  assert.equal(t.digits.length,1883);
  assert.equal(t.packets.length,11);
  for(const [framing,encoded] of [
    ['single-base28-integer',bytes(integer(t.digits))],
    ['eleven-base28-packets',Buffer.concat(t.packets.map(p=>bytes(integer(p))))]
  ]) {
    assert.ok(encoded.length>0 && at+encoded.length<file.length);
    findings.push({order,framing,rankDigits:1883,encodedBytes:encoded.length,
      result:summarize(xor(encoded,at))});
  }
  // A source-native full-length positive encrypts an ASCII PDF-like message
  // with the *actual* 2013 file XOR, restores the exact original 10 doublets,
  // then decodes it without being supplied the planted plaintext.
  const plain=Buffer.alloc(1131,65);
  Buffer.from('%PDF-1.7\nSOURCE-LOCKED 2013 HISTORICAL XOR CONTROL\n').copy(plain);
  const encrypted=xor(plain,at), sourceDigits=digitsOf(encrypted,1883);
  const planted=makePlant(sourceDigits,order);
  assert.deepEqual(planted.flatMap((x,i)=>i&&x===planted[i-1]?[i]:[]),mask);
  const recovered=unpack(planted,order);
  assert.deepEqual(recovered.digits,sourceDigits);
  const h=integer(recovered.digits).toString(16).padStart(2262,'0');
  assert.equal(h.length,2262);
  assert.deepEqual(xor(Buffer.from(h,'hex'),at),plain);
  assert.notDeepEqual(xor(encrypted,at+1),plain);
}
console.log(JSON.stringify({method:'source-locked GP28 binary historical XOR',
  titleInteger:n.toString(),historical2013Control:'exact original onion address',
  dataSource:'DATA/560.13',offset:at,sourceRunes:1894,
  exceptions:mask,nonrepeatingRanks:1883,plantedSourceKeyControls:'2/2 exact',
  findings,interpretation:'Hypothetical GP28 binary readout; any recovered plaintext must be independently corroborated.'},null,2));
