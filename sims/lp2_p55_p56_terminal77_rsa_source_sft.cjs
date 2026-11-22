'use strict';

/**
 * The original p55/p56 77-GP-rune cross-seam is precisely eleven
 * seven-digit packets, and the last seven copy the p27 F-bracket payload.
 *
 * Source-derived candidate RSA modulus:
 *   2013 761.MP3 metadata, "Parable 1,595,277,641"
 *   = 1259 * 1031 * 1229, the three clear p57 clause sums.
 * Seven base29 digits are needed to represent this modulus.
 *
 * Test the full physical 76-rune p55 page plus the original p56 first
 * rune, with no padding, guessed skips, rotations or tuned modulus.
 * Every ordinary RSA ciphertext residue must be < N, irrespective of
 * unknown RSA exponent or private key.
 *
 * Single runnable test, Node.js 22 CommonJS:
 *   node sims/lp2_p55_p56_terminal77_rsa_source_sft.cjs
 *
 * Entirely read-only, checks original source runes, and constructs a
 * genuine independent 11-packet RSA positive from solved p57 text.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = new Map(corpus.pages.map(p => [p.page,p.indices]));
const P55 = pages.get(55);
const P56 = pages.get(56);
const P27 = pages.get(27);
const P57 = pages.get(57);
const PRIMES = [1259n, 1031n, 1229n];
const N = PRIMES.reduce((a,b) => a*b,1n);
const PHI = PRIMES.reduce((a,b) => a*(b-1n),1n);
const PUBLIC_EXPONENT = 449n; // GP-prime sum of original PARABLE heading
const PRIVATE_EXPONENT = 283504449n; // inverse of 449 modulo PHI
const BASE = 29n;
const SIX_DOMAIN = BASE**6n;
const SEVEN_DOMAIN = BASE**7n;

assert.equal(N, 1595277641n);
assert.equal(PHI, 1591168720n);
assert.equal(PUBLIC_EXPONENT*PRIVATE_EXPONENT%PHI,1n);
assert(SIX_DOMAIN<N && N<SEVEN_DOMAIN);
assert.equal(P55.length,76);
assert.equal(P56.length,85);
assert.equal(P57.length,95);
assert.equal(P27.length,234);

/** @param {number[]} digits @returns {bigint} */
function base29ToNumber(digits) {
  return digits.reduce((a,b) => {
    assert(Number.isInteger(b) && b>=0 && b<29);
    return a*BASE+BigInt(b);
  },0n);
}
/** @param {bigint} number @param {number} width @returns {number[]} */
function numberToBase29(number,width) {
  assert(number>=0n && number<BASE**BigInt(width));
  const result = Array(width);
  for(let i=width-1;i>=0;i--){
    result[i]=Number(number%BASE);
    number/=BASE;
  }
  assert.equal(number,0n);
  return result;
}
/** @param {bigint} base @param {bigint} exp @param {bigint} modulus @returns {bigint} */
function powerMod(base,exp,modulus) {
  let result=1n;
  while(exp>0n){
    if(exp&1n) result=result*base%modulus;
    base=base*base%modulus;
    exp>>=1n;
  }
  return result;
}
const seam=P55.concat(P56[0]);
assert.equal(seam.length,77);
const echoed=seam.slice(-7);
assert.deepEqual(echoed,P27.slice(28,35));
assert.deepEqual(echoed,[23,11,1,17,18,10,25]);
assert.equal(base29ToNumber(echoed),13907696369n);
assert.equal(base29ToNumber([...echoed].reverse()),15088841369n);

const packets=Array.from({length:11},(_,i)=>seam.slice(7*i,7*(i+1)));
assert(packets.every(p=>p.length===7));
const original=packets.map((digits,i)=>{
  const msb=base29ToNumber(digits);
  const lsb=base29ToNumber([...digits].reverse());
  return {
    packet:i,
    title:digits.map(x=>corpus.translit[x]).join(''),
    msbFirst:msb.toString(),
    msbInRange:msb<N,
    reversed:lsb.toString(),
    reversedInRange:lsb<N,
    firstRuneIndex:digits[0]
  };
});
const eligibleMSB=original.filter(p=>p.msbInRange).map(p=>p.packet);
const eligibleReversed=original.filter(p=>p.reversedInRange).map(p=>p.packet);
assert.deepEqual(eligibleMSB,[]);
assert.deepEqual(eligibleReversed,[2,5,8]);
assert(original.every(p=>p.firstRuneIndex>2),
  'Every canonical first digit exceeds floor((N-1)/29^6)=2');

// A true 11-packet RSA-encoded native-GP passage DOES satisfy the
// same canonical seven-digit bounds and recovers a hidden 66-rune
// clear-p57 source with an independently fixed public/private pair.
const native=P57.slice(0,66);
assert.equal(native.length,11*6);
const plantedPackets=Array.from({length:11},(_,i)=>{
  const message=base29ToNumber(native.slice(i*6,i*6+6));
  assert(message<N);
  const encoded=powerMod(message,PUBLIC_EXPONENT,N);
  const transmitted=numberToBase29(encoded,7);
  assert(base29ToNumber(transmitted)<N);
  const decrypted=powerMod(base29ToNumber(transmitted),PRIVATE_EXPONENT,N);
  assert.equal(decrypted,message);
  return transmitted;
});
const decrypted=plantedPackets.flatMap(digits=>{
  const value=powerMod(base29ToNumber(digits),PRIVATE_EXPONENT,N);
  return numberToBase29(value,6);
});
assert.deepEqual(decrypted,native);
assert.equal(plantedPackets.length,11);
assert.equal(plantedPackets.flat().length,77);
const result={
  hypothesis:'Literal standard 7-GP29-digit RSA from 2013 Parable product N; final cross-page seven-rune p27 echo fixes the source seam',
  original:{p55:76,p56Prefix:1,runicTotal:77,
    sevenRunePackets:11,p27TerminalExactMatch:true,
    canonicalAllowed:eligibleMSB,reverseDigitsAllowed:eligibleReversed,
    canonicalInvalid:11-eligibleMSB.length,
    reversedInvalid:11-eligibleReversed.length,
    terminalPacketValue:base29ToNumber(echoed).toString(),
    modulus:N.toString(),domain7:SEVEN_DOMAIN.toString(),
    packets:original
  },
  positive:{sourceNativeP57Runes:66,encodedCipherRunes:77,
    sevenRunePackets:11,recoveredRunes:decrypted.length,
    exactPlaintextRecovery:true,sourceDerivedPublicExponent:449},
  conclusion:'No standard literal seven-GP29-digit RSA transport with this exact source modulus is possible on p55 plus p56 first rune, regardless of unknown exponent. Additional encoding, cyclewalking or another receiver is outside this test. No new unknown plaintext.'
};
console.log(JSON.stringify(result,null,2));
if (require.main === module) {
  // Exact source inputs and packet inverse already asserted above.
}
