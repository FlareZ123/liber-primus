'use strict';
/**
 * Reconstruct both original 2016 InfoTomb host responses from the preserved
 * ASCII server preamble and independently archived canonical JPEG.
 * No network, file mutation or alternate image decoding.
 * Windows/Linux Node.js 22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const source = path.join(__dirname, '..', 'resources', 'historical');
const prefix = fs.readFileSync(path.join(source, 'cicada2016-4gq25-20160109-prefix.txt'));
const jpeg = fs.readFileSync(path.join(source, 'cicada2016-4gq25.jpg'));
const original = Buffer.concat([prefix, jpeg]);
const sha256 = x => crypto.createHash('sha256').update(x).digest('hex');
const gitsha = x => crypto.createHash('sha1')
  .update(Buffer.from('blob ' + x.length + '\0'))
  .update(x).digest('hex');
assert.equal(prefix.length, 99, 'source prefix byte count');
assert.equal(prefix.toString('utf8'),
  'var/www/infotomb/tmp/208771\n' +
  'var/www/infotomb/tmp/208771.thumb.jpg\n' +
  'var/www/infotomb/tmp/208771_text\n');
assert.equal(sha256(prefix), '5d6aa556b6c8d7bf99d87121ae54f2f9c61902702041ecc0afb81d71c0452dfa');
assert.equal(jpeg.length, 26342, 'unmodified carrier JPEG');
assert.equal(sha256(jpeg), 'a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe');
assert.equal(original.length, 26441, 'original-host Jan9 response size');
assert.equal(sha256(original), '2aa61b8393e6d993646445caabccbf03812f553b24c8752c66eb1c9526b458f4');
assert.equal(gitsha(original), 'c6598825fe2b5570a365694fa113c11fefd22147');
assert.deepEqual(original.subarray(99), jpeg, 'Jan9 embedded JPEG equals Jan16');
console.log('PASS: January 9 host response = 99-byte InfoTomb server prefix + unchanged Jan16 JPEG');
console.log('Both original host hashes and exact marker boundary verified; no LP2 cipher claim.');
