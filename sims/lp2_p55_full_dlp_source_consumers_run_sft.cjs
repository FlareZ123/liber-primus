'use strict';
/**
 * Original p55 COMPLETE conditional finite-field logarithm -> frozen p50 DH
 * receiver. Read-only Windows Node22 CommonJS SFT, no dependencies.
 *
 * Full-field DLP computed using upstream CADO-NFS in immutable Actions
 * run 45121386525 (2026-11-23):
 *   CADO virtual log(Q) = 97177182119505488787450641888952849267188113103
 *   CADO virtual log(E) = 54106400943404901469426490177054650743928343670
 * Both computed in the SAME arbitrary base modulo certified 157-bit R.
 *
 * This script independently calls two separately frozen SFTs, rejects a bad
 * original-field exponent, reports all original 256-byte AES consumers,
 * and compares SHA512 of the shared secret to original printed p56 digest.
 *
 * No Cicada-authored DH role, P50 KDF, or plaintext is asserted.
 */
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');

const logQ = '97177182119505488787450641888952849267188113103';
const logE = '54106400943404901469426490177054650743928343670';
const exactB = '58027263295081800276048492624932826148348813312381561491440230';
const root = path.resolve(__dirname);
const run = (file, args) => execFileSync(process.execPath,
  [path.join(root, file), ...args], {encoding:'utf8',maxBuffer:1024*1024});
const dlp = run('lp2_p55_shed_cado_full_log_finalize_sft.cjs',[logQ, logE]);
const info = JSON.parse(dlp);
assert.equal(info.originalFieldFullLog, exactB);
assert.equal(info.fullModularExponentiationPASS, true);
assert.equal(info.smoothSubgroupResidue, '483581994079670');
assert.equal(info.largeSubgroupResidue, '3514059847361986014044855366874037440049858274');
assert.equal(info.plaintextRecovered, false);
// The same CADO precomputation independently printed the virtual log of 2.
// The *other* source public value A=8 is 2^3 in the original field.
// Combine CADO log8/logQ mod R with Agent11's independent 50-bit BSGS
// residue a mod M. Both original DH directions must give the same S.
const P = 63755441409934721069036418908763882578170591536653256311514221n;
const Q = 1268532719737981052966698570711268391040527137n;
const E = 54546906948733185277568038540584540814742666891n;
const M = 630311729907820n;
const R = 101149063843788281988908603592862658065019147521n;
const log2 = 34462444473864939291612620886429653284547880364n;
const aSmall = 97883509924151n;
const mod=(v,n)=>(v%n+n)%n;
/** @param {bigint} value @param {bigint} n */
function inv(value,n) {
  let [r, nr, t, nt] = [n,mod(value,n),0n,1n];
  while(nr){const q=r/nr;[r,nr]=[nr,r-q*nr];[t,nt]=[nt,t-q*nt];}
  assert.equal(r,1n);return mod(t,n);
}
/** @param {bigint} base @param {bigint} e @param {bigint} n */
function powMod(base,e,n){
  let value=1n;
  while(e){if(e&1n)value=value*base%n;base=base*base%n;e>>=1n;}
  return value;
}
const aLarge=mod(3n*log2*inv(BigInt(logQ),R),R);
const a=aSmall+M*mod((aLarge-aSmall)*inv(M,R),R);
assert.equal(aLarge,43870182398455967548054954653128522859138643088n);
assert.equal(a,14347449201966638813083683299370469317053765371148427588804751n);
assert.equal(powMod(Q,a,P),8n);
assert.equal(powMod(Q,BigInt(exactB),P),E);
const originalShared=18534943457637434371337714419521892971722473566563310008765178n;
assert.equal(powMod(E,a,P),originalShared);
assert.equal(powMod(8n,BigInt(exactB),P),originalShared);
console.log('Independent full original public8 log a:',a.toString());
console.log('Independent both-sided DH agreement E^a=8^b:',originalShared.toString());

console.log('FULL ORIGINAL P55 DLP EXACT SOURCE EXPONENT:', exactB);
console.log('Source original p55 complete field equation Q^b = E mod P: PASS');
console.log('GP29 digit count: '+info.gp29DigitCount);
console.log('Unconstrained exponent GP29 reading: '+info.gp29Transliteration);
const consumer = run('lp2_p55_p50_dh_full_public_receiver_sft.cjs',[exactB]);
assert.ok(consumer.includes('Standard SHA512(S as 26 big-endian bytes) matches original p56 hash: false'));
assert.ok(consumer.includes('de79304b733dc0bba174941b645944b03c7738a3b4a619f97c82fbab38e401ec'));
for(const radix of ['printed-radix60','omitted-f-radix59'])
  for(const mode of ['aes-256-ctr','aes-256-cbc','aes-256-ecb'])
    assert.ok(consumer.includes(radix+' '+mode));
console.log(consumer);
console.log('PASS: Complete full logarithm source verified and six pre-frozen original AES p50 consumers tested.');
console.log('No first-party plaintext/key interpretation follows from the group equality alone.');
