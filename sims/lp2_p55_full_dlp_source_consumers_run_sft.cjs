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
