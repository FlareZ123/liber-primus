#!/usr/bin/env node
'use strict';
// 2012 Reddit Mayan-banner/title cue ablation. Source: neuroretransmit/cicada
// pinned at ade9a02889ef8acbc8cde8edbfd0a785c369f4c3,
// 2012/003-subreddit/{ciphertext,plaintext}.txt.
// node sims/cicada2012_reddit_maya_cue_ablation.cjs CIPHER.txt PLAIN.txt
// Without arguments, a complete three-line contemporary excerpt is checked.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const TITLE = 'a2e7j6ic78h0j7eiejd0120';
const MAYA13 = [10, 2, 14, 7, 19, 6, 18, 12, 7, 8, 17, 0, 19];
const SOURCE_BLOBS = {
  ciphertext: '785e7d964770a07d99d11934f129ab1ee4f98aad',
  plaintext: 'da595691468ae514686ac693ac6ee70411fb06ec',
};
function gitBlobSha(s) {
  return createHash('sha1').update('blob ' + Buffer.byteLength(s) + '\0').update(s).digest('hex');
}
function key(which) {
  return [...TITLE].map(ch => {
    if (/^[0-9]$/.test(ch)) return Number(ch);
    if (which === 'base20') return ch.charCodeAt(0) - 87; // a=10
    if (which === 'zero') return ch.charCodeAt(0) - 97;   // a=0
    if (which === 'ascii') return ch.charCodeAt(0) % 26;
    throw new Error('unknown key');
  });
}
function decode(input, offsets, resetOnLine = true, direction = -1) {
  let phase = 0, out = '';
  for (const ch of input) {
    if (ch === '\n' && resetOnLine) phase = 0;
    if (/^[A-Za-z]$/.test(ch)) {
      const base = ch >= 'a' && ch <= 'z' ? 97 : 65;
      const value = ch.charCodeAt(0) - base;
      out += String.fromCharCode(base + ((value + direction * offsets[phase++ % offsets.length]) % 26 + 26) % 26);
    } else out += ch;
  }
  return out;
}
function compare(candidate, plain) {
  assert.equal(candidate.length, plain.length);
  let characters = 0, letters = 0, correctLetters = 0;
  for (let i = 0; i < plain.length; i++) {
    if (candidate[i].toUpperCase() === plain[i].toUpperCase()) characters++;
    if (/^[A-Za-z]$/.test(plain[i])) {
      letters++;
      if (candidate[i].toUpperCase() === plain[i].toUpperCase()) correctLetters++;
    }
  }
  return {matchingCharacters: characters, totalCharacters: plain.length, matchingLetters: correctLetters, totalLetters: letters};
}
const excerptCipher = [
  'Ukbn Txltbz nal hh Uoxelmgox wdvg Akw; hvu ogl rsm ar sbv ix jwz',
  'mjotukj; mul nimo vaa prrf Qwkkb aak kau ww Ukpsf, ogq Kzpox vvl luf',
  'rcbkfgaplvj am uswrerwptk la hox cazkwn.  Agk wx wm fhpwln ds ztov'
].join('\n') + '\n';
const excerptPlain = [
  'King Arthur was at Caerlleon upon Usk; and one day he sat in his',
  'chamber; and with him were Owain the son of Urien, and Kynon the son',
  'handmaidens at needlework by the window.  And if it should be said'
].join('\n') + '\n';
function run(cipher, plain) {
  const k20 = key('base20'), k0 = key('zero'), kascii = key('ascii');
  assert.deepEqual(k20.slice(0, 13), MAYA13); // independent visible banner
  const variants = {
    base20_line_reset_subtract: decode(cipher, k20, true, -1),
    base20_continuous_subtract: decode(cipher, k20, false, -1),
    zero_based_line_reset_subtract: decode(cipher, k0, true, -1),
    ascii_line_reset_subtract: decode(cipher, kascii, true, -1),
    base20_line_reset_add: decode(cipher, k20, true, +1),
  };
  const stats = Object.fromEntries(Object.entries(variants).map(([name,v]) => [name,compare(v,plain)]));
  assert.equal(stats.base20_line_reset_subtract.matchingCharacters, plain.length);
  return {title: TITLE, maya13: MAYA13, decodedKey: k20,
    alternativeKeyZeroPrefixMatchingMaya: k0.slice(0,13).filter((v,i)=>v===MAYA13[i]).length,
    alternativeKeyAsciiPrefixMatchingMaya: kascii.slice(0,13).filter((v,i)=>v===MAYA13[i]).length,
    populatedLines: cipher.split('\n').filter(Boolean).length, stats,
    plaintextOpening: variants.base20_line_reset_subtract.split('\n').slice(0,3)};
}
if (require.main === module) {
  const useFull = process.argv.length === 4;
  if (process.argv.length !== 2 && !useFull) {
    throw new Error('Usage: node cicada2012_reddit_maya_cue_ablation.cjs [ciphertext.txt plaintext.txt]');
  }
  const cipher = useFull ? fs.readFileSync(process.argv[2], 'utf8') : excerptCipher;
  const plain = useFull ? fs.readFileSync(process.argv[3], 'utf8') : excerptPlain;
  if (useFull) {
    assert.equal(gitBlobSha(cipher), SOURCE_BLOBS.ciphertext);
    assert.equal(gitBlobSha(plain), SOURCE_BLOBS.plaintext);
  }
  console.log(JSON.stringify({source: useFull ? 'pinned-complete-archive' : 'contemporary-three-line-excerpt', ...run(cipher,plain)},null,2));
}
module.exports = {key,decode,compare,run};
