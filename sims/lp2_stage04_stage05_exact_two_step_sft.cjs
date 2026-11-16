#!/usr/bin/env node
'use strict';
/**
 * Source-exact historic Cicada Stage04 GP Vigenere and Stage05 row-seven
 * transposition, composed in both predeclared orders on complete original LP2.
 * Context: Director #1295, first-party source lacks an LP2 composition command.
 * Native Windows/Node22 SFT; every candidate exactly reencrypts original runes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const stage5 = require('./stage5_original_outguess_columnar_sft.cjs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const trans = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const q = 29, mod = n => (n % q + q) % q;
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const regex = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const textWords = s => (s.match(regex) || []).map(w => Array.from(w, r => runeMap.get(r)));
const physicalSegments = trans.split('%').map(s => s.replace(/\/\r?\n/g,'').replace(/\r?\n/g, ''));
const p57Words = textWords(physicalSegments.at(-1));
assert.equal(p57Words.length, 20);
const divinity = p57Words.find(w => w.map(i => corpus.translit[i]).join('') === 'DIUINITY');
assert.deepEqual(divinity, [23,10,1,10,9,10,16,26]);
const welcome = [7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18];
const toChar = a => a.map(x => String.fromCharCode(65 + x)).join('');
const fromChar = a => [...a].map(x => x.charCodeAt(0) - 65);

/** Historical seven-character row read, 2014 first-party frozen order 1736254. */
const decodeSeven = a => fromChar(stage5.decode(toChar(a), '1736254'));
const encodeSeven = a => fromChar(stage5.encode(toChar(a), '1736254'));

/** Historical Stage04 rune cipher. Rune-lookup reversal yields GP29 subtraction. */
const decodeVigenere = (a, key) => a.map((x, i) => mod(x - key[i % key.length]));
const encodeVigenere = (a, key) => a.map((x, i) => mod(x + key[i % key.length]));

/** Historic Stage04 independent source-rune positive, 18 runes plus 2 literal digits. */
const sourceStage04 = 'ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ';
const chunks = sourceStage04.split(/([53])/);
let cipherIndex = 0, out = '';
for (const part of chunks) {
  if (/^[53]$/.test(part)) { out += part; continue; }
  const indices = Array.from(part, x => runeMap.get(x));
  const decoded = indices.map(x => mod(x - welcome[cipherIndex++ % welcome.length]));
  out += decoded.map(x => corpus.translit[x]).join('');
}
assert.equal(cipherIndex, 18);
assert.equal(out, 'AUOWYFGL5LCSFJ3NONIAN');
// Stage04 source lists the GP glyph IA with the alternative romanization IO.
// Thus the exact 18-rune stage output includes the original .onion hostname.
assert.equal(out.replace('NONIAN','NONION'), 'AUOWYFGL5LCSFJ3NONION');

/** Historic Stage05 independent 140-byte OutGuess payload's typed 56-char block. */
const historicalSourceRows = [
  'TL BE IE OV UT HT RE ID TS EO ST PO SO YR',
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M'
].map(s => s.replace(/\s/g,'')).join('');
const historicalKnown = 'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
assert.equal(stage5.decode(historicalSourceRows,'1736254'),historicalKnown);
assert.equal(stage5.encode(historicalKnown,'1736254'),historicalSourceRows);

const rawTargets = [
  ['p54p55', corpus.pages.slice(54,56).flatMap(p=>p.indices)],
  ['p33-first91', corpus.pages[33].indices.slice(0,91)]
];
assert.deepEqual(rawTargets.map(x=>x[1].length), [308,91]);
const nativeIoC = a => {
  const counts = Array(q).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((n,c)=>n+c*(c-1),0)/(a.length*(a.length-1));
};
const targets = [];
for (const [name, original] of rawTargets) {
  const variants = [];
  for (const [keyName,key] of [['p57-DIVINITY',divinity],['2014-WELCOME-PILGRIM-TO-THE',welcome]]) {
    // Source-locked components only; the two possible sender orders are distinct.
    const rowThenVigenere = decodeVigenere(decodeSeven(original), key);
    const vigenereThenRow = decodeSeven(decodeVigenere(original,key));
    assert.deepEqual(encodeSeven(encodeVigenere(rowThenVigenere,key)), original);
    assert.deepEqual(encodeVigenere(encodeSeven(vigenereThenRow),key), original);
    for (const [order,p] of [
      ['decodeRow7_then_decodeStage04',rowThenVigenere],
      ['decodeStage04_then_decodeRow7',vigenereThenRow]]) {
      variants.push({key:keyName,order,allRunes:p.length,
        ioc:nativeIoC(p),
        firstGP80:p.slice(0,80).map(i=>corpus.translit[i]).join(' '),
        lastGP24:p.slice(-24).map(i=>corpus.translit[i]).join(' '),
        fullForwardReencryption:p.length });
    }
  }
  targets.push({original:name,n:original.length,originalIoC:nativeIoC(original),variants});
}
console.log(JSON.stringify({
  test:'Full-source exact 2014 Stage04 + Stage05 two-primitive composition and 2014/p57 key alternatives',
  historicalPositive:{
    stage04OriginalRunes:cipherIndex,
    stage04AltRomanizationOnion:out.replace('NONIAN','NONION'),
    stage05CipherSymbols:historicalSourceRows.length,
    stage05Recovered:historicalKnown
  },
  sourceLimit:'No original LP2 clue instructs both historical operators or fixes their order; exact roundtrip is a control, not proof of plaintext.',
  targets
},null,2));
