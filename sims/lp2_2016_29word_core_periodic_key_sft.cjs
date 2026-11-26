'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources/transcriptions/lp2_krisyotam_2017.txt'), 'utf8');
const signed = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const gibran = fs.readFileSync(path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8');

const RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const runeIndex = new Map([...RUNES].map((r, i) => [r, i]));
const breaks = new Set('-.&$§');
const N = 12956;
const PRIME = corpus.prime;
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;

assert.equal(corpus.translit.length, 29);
assert.equal(PRIME.length, 29);

// Reconstruct the corrected physical word groups while preserving line/page carries.
const stream = [];
const records = [];
let current = null;
function closeWord() {
  if (current && current.values.length) records.push(current);
  current = null;
}
for (const ch of transcription) {
  if (runeIndex.has(ch)) {
    if (!current) current = { start: stream.length, values: [] };
    const value = runeIndex.get(ch);
    current.values.push(value);
    stream.push(value);
  } else if (breaks.has(ch) || /[0-9]/.test(ch)) {
    closeWord();
  } // Slash, percent, and line breaks preserve a carried word.
}

closeWord();
const tape = corpus.pages
  .filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(tape.length, N);
assert.deepEqual(stream.slice(0, N), tape);
const groups = records.filter(w => w.start + w.values.length <= N);
assert.equal(groups.length, 2896);
assert.equal(groups.reduce((s, w) => s + w.values.length, 0), N);

// The candidate register is the 29 alphabetic words from THE through DIRECTION
// in the authenticated signed message, excluding the opening HELLO.
const clearBody = signed.slice(
  signed.indexOf('Hash: SHA1') + 'Hash: SHA1'.length,
  signed.indexOf('-----BEGIN PGP SIGNATURE-----')
);
const signedWords = clearBody.match(/[A-Za-z]+/g) || [];
assert.equal(signedWords[0].toLowerCase(), 'hello');
const coreWords = signedWords.slice(1, 30);
assert.equal(coreWords.length, 29);
assert.equal(coreWords[0].toLowerCase(), 'the');
assert.equal(coreWords[28].toLowerCase(), 'direction');

const DIGRAPHS = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
function gpWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/[KV]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    let token;
    let step;
    if (s.slice(i, i + 3) === 'ING') {
      token = 'NG'; // The single GP ᛝ glyph is the source-attested ING rune.
      step = 3;
    } else {
      token = null;
      for (const d of DIGRAPHS) {
        if (s.slice(i, i + d.length) === d) { token = d; break; }
      }
      if (!token) token = s[i];
      step = token.length;
    }
    const index = corpus.translit.indexOf(token);
    assert.notEqual(index, -1, 'unmapped GP token: ' + token);
    out.push(index);
    i += step;
  }
  return out;
}
function gpText(text) {
  const out = [];
  for (const word of (text.match(/[A-Za-z]+/g) || [])) out.push(...gpWord(word));
  return out;
}

const wordTokens = coreWords.map(gpWord);
const primeSumKey = wordTokens.map(a => mod(a.reduce((s, i) => s + PRIME[i], 0)));
const sumTotientKey = wordTokens.map(a => mod(a.reduce((s, i) => s + PRIME[i] - 1, 0)));

function reachability(cipher, key, sign) {
  let phases = new Uint8Array(MOD);
  phases[0] = 1; // Printed-order phase zero at the first original p0 rune.
  for (let offset = 0; offset < cipher.length; offset++) {
    const C = cipher[offset];
    const next = new Uint8Array(MOD);
    for (let phase = 0; phase < MOD; phase++) {
      if (!phases[phase]) continue;
      if (C === 0) next[phase] = 1; // Plaintext F is transparent and holds the key.
      const P = mod(C + sign * key[phase]);
      if (P !== 0) next[(phase + 1) % MOD] = 1; // A consuming branch may not encrypt plaintext F.
    }
    const before = Array.from(phases).flatMap((v, phase) => v ? [phase] : []);
    if (next.every(v => v === 0)) {
      return {
        complete: false,
        deadAt: offset,
        ciphertext: C,
        phasesBefore: before,
        keyValuesBefore: before.map(phase => key[phase])
      };
    }
    phases = next;
  }
  return {
    complete: true,
    finalPhases: Array.from(phases).flatMap((v, phase) => v ? [phase] : [])
  };
}

function encryptWithFHold(plain, key, sign) {
  let phase = 0;
  const cipher = new Uint8Array(plain.length);
  for (let i = 0; i < plain.length; i++) {
    const P = plain[i];
    if (P === 0) {
      cipher[i] = 0;
    } else {
      cipher[i] = mod(P - sign * key[phase]);
      phase = (phase + 1) % MOD;
    }
  }
  return cipher;
}

const control = gpText(gibran).slice(0, N);
assert.equal(control.length, N);
const actualResults = [];
const controlResults = [];
for (const [keyName, key] of [['prime-sum', primeSumKey], ['sum-of-prime-totients', sumTotientKey]]) {
  for (const sign of [-1, 1]) {
    const actual = reachability(tape, key, sign);
    const plantedCipher = encryptWithFHold(control, key, sign);
    const planted = reachability(plantedCipher, key, sign);
    assert.equal(planted.complete, true, 'synthetic F-hold plant must remain reachable');
    actualResults.push({ keyName, sign, ...actual });
    controlResults.push({ keyName, sign, complete: planted.complete, length: plantedCipher.length });
  }
}

const expected = [
  ['prime-sum', -1, 51, [20], [26]],
  ['prime-sum', 1, 0, [0], [14]],
  ['sum-of-prime-totients', -1, 43, [12], [13]],
  ['sum-of-prime-totients', 1, 118, [25, 26], [27, 27]]
];
for (const [name, sign, deadAt, phases, values] of expected) {
  const r = actualResults.find(x => x.keyName === name && x.sign === sign);
  assert.equal(r.complete, false);
  assert.equal(r.deadAt, deadAt);
  assert.deepEqual(r.phasesBefore, phases);
  assert.deepEqual(r.keyValuesBefore, values);
}

const result = {
  source: 'authenticated 2016 signed-message 29-word core; canonical original LP2 p0-p55',
  coreWords,
  wordPrimeSums: wordTokens.map(a => a.reduce((s, i) => s + PRIME[i], 0)),
  primeSumKey,
  sumTotientKey,
  original: { words: groups.length, runes: tape.length, results: actualResults },
  syntheticGibranPositiveControls: controlResults
};
console.log(JSON.stringify(result, null, 2));
