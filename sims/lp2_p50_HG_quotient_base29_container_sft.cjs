'use strict';

/**
 * Source-fixed 2013 BASE29 transport on the H*G-divided original 256-cell
 * table. We test *only* both byte-order conventions on its raw base29 integer,
 * and recognize standard self-describing file/compression signatures.
 *
 * Independent frozen inputs: signed-2013 BASE29(3301)=3QO, original p39 G,
 * original row-major table bytes. No unknown LP2 ciphertext searched.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const table = JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const cells = table.bytes;
assert.equal(cells.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(cells)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const prime = 29;
/** @param {number} a @returns {number} */
function mod(a) { return ((a % prime) + prime) % prime; }
/** @param {number} a @returns {number} */
function inverse(a) {
  for (let t=1;t<29;t++) if (mod(a*t)===1) return t;
  throw new Error('factor leading coefficient nonunit');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a,b) {
  const c=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    c[i+j]=mod(c[i+j]+a[i]*b[j]);
  return c;
}
/**
 * Descending coefficient quotient. No leading-digit truncation during division.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(a,b) {
  const work=a.map(mod),q=[];
  const inv=inverse(b[0]);
  for(let i=0;i<=a.length-b.length;i++){
    const z=mod(work[i]*inv);
    q.push(z);
    for(let j=0;j<b.length;j++)work[i+j]=mod(work[i+j]-z*b[j]);
  }
  return {quotient:q,remainder:work.slice(q.length)};
}
const H=[24,26,3],G=[15,5,27]; // Signed BASE29 and p39, descending powers.
const product=multiply(H,G);
const {quotient,remainder}=divide(cells,product);
assert.equal(quotient.length,252);
assert.deepEqual(remainder,[0,0,0,0]);
// Reconstituting the source modulo29 exactly is a separate accuracy control.
const check=multiply(quotient,product);
assert.deepEqual(check,cells.map(mod));

/** @param {number[]} digits @returns {Buffer} */
function fromBase29(digits) {
  let n=0n;
  for (const d of digits) {assert.ok(d>=0&&d<29);n=n*29n+BigInt(d);}
  let hex=n.toString(16);
  if(hex.length%2)hex='0'+hex;
  return Buffer.from(hex,'hex');
}
/** @param {Buffer} buffer */
function sniff(buffer) {
  const names=[];
  if(buffer.subarray(0,2).equals(Buffer.from([0x1f,0x8b]))) names.push('gzip');
  if(buffer.subarray(0,2).equals(Buffer.from([0x78,0x9c]))) names.push('zlib-default');
  if(buffer.subarray(0,2).equals(Buffer.from([0x78,0xda]))) names.push('zlib-max');
  if(buffer.subarray(0,2).equals(Buffer.from([0x78,0x01]))) names.push('zlib-fast');
  if(buffer.subarray(0,4).toString('ascii')==='%PDF') names.push('PDF');
  if(buffer.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]))) names.push('ZIP');
  if(buffer.subarray(0,4).equals(Buffer.from([0x89,0x50,0x4e,0x47]))) names.push('PNG');
  if(buffer.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))) names.push('JPEG');
  if(buffer.subarray(0,4).toString('ascii')==='OggS') names.push('Ogg');
  if(buffer.subarray(0,4).toString('ascii')==='ID3') names.push('ID3');
  if(buffer.subarray(0,4).toString('ascii')==='RIFF') names.push('RIFF');
  return names;
}
const roman=fromBase29([3,26,24]);
assert.equal(roman.toString('hex'),'0ce5'); // BASE29(3301)=3QO, 3301=0CE5.
const values=[];
for(const [direction,digits] of [
  ['source-descending',quotient],
  ['reversed-coefficients',quotient.slice().reverse()]
]){
 const raw=fromBase29(digits);
 const bytes=[...raw];
 values.push({
  direction,
  leading29:digits.slice(0,10),
  bits:Number(BigInt(raw.length)*8n),
  bytes:raw.length,
  first32:raw.subarray(0,32).toString('hex'),
  last16:raw.subarray(-16).toString('hex'),
  asciiFraction:bytes.filter(b=>b>=32&&b<=126).length/bytes.length,
  zeroBytes:bytes.filter(b=>b===0).length,
  magic:sniff(raw),
  sha256:crypto.createHash('sha256').update(raw).digest('hex')
 });
}
console.log(JSON.stringify({
 source:'2013 authenticated BASE29 and unchanged p39 red3; conditional base60 table',
 quotientLength:quotient.length,
 factorDescending:product,
 remainder,
 results:values,
 conclusion:values.every(r=>r.magic.length===0)
   ? 'No standard self-identifying media/compression header in the two direct source-native base29 integer readouts. Does not rule out encrypted payload, other encoding, other factor role or source variant.'
   : 'One standard header requires a separate exact content decode and original cryptographic consumer.'
},null,2));
