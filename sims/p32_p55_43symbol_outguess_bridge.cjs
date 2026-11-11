#!/usr/bin/env node
'use strict';

// Test the source-native 2016 OutGuess ARC4 KDF/PRNG as a GP29 keystream
// bridge between the conditional 43-rune p32 compass output and the 43 p55
// interior runes. The p32 stream is tried only in two bounded password
// encodings; Encryption is the intended role and Seeding is a wrong-role
// control. No phase, shuffle, key search, or ciphertext-tuned fitting.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { trainNativeGP, languageScore } = require('./historical_solve_path_transfer.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/lp2-transcription.txt');
const emerson = read('resources/control/emerson_essays_2944.txt');
const model = trainNativeGP(emerson);
const mod = (n, m = 29) => ((n % m) + m) % m;
const translit = xs => xs.map(x => corpus.translit[x]).join('');
const ioc = xs => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};

// Reproduce the frozen 2016 43-word compass SFT's source-fixed p50[84:127]
// route over the original p32 11x11 rune grid.
const p32 = corpus.pages.find(p => p.page === 32).indices;
const bytes = grid.bytes.slice(84, 127);
assert.strictEqual(bytes.length, 43);
const directions = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1],
];
let row = 3, col = 0;
const visited = [];
for (const b of bytes) {
  const [dy, dx] = directions[b & 7];
  const distance = b >> 3;
  row = mod(row + dy * distance, 11);
  col = mod(col + dx * distance, 11);
  visited.push(p32[row * 11 + col]);
}
assert.deepStrictEqual([row, col], [3, 4]);
assert.strictEqual(visited.length, 43);

// Reproduce p55's "shed our own circumferences" physical-word interior.
const p55Words = transcription.split('%')[54]
  .replace(/\/\s*/g, '')
  .match(/[\u16A0-\u16FF]+/gu) || [];
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const inner55 = p55Words.flatMap(w => Array.from(w).slice(1, -1))
  .map(r => runeIndex.get(r));
assert.strictEqual(inner55.length, 43);

// OutGuess 0.4 source-native ARC4 stream, matching arc4_initkey:
// MD5(type || password), arc4_addrandom, arc4_getbyte.
// "Encryption" is the carrier-data role; "Seeding" is the iterator role.
function outguessArc4(password, type, n) {
  const digest = createHash('md5').update(type + password, 'ascii').digest();
  const s = Uint8Array.from({ length: 256 }, (_, i) => i);
  let i = 255, j = 0;
  for (let k = 0; k < 256; k++) {
    i = (i + 1) & 255;
    const si = s[i];
    j = (j + si + digest[k % 16]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const stream = new Uint8Array(n);
  i = 0; j = 0;
  for (let k = 0; k < n; k++) {
    i = (i + 1) & 255;
    const si = s[i];
    j = (j + si) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    stream[k] = s[(s[i] + s[j]) & 255];
  }
  return [...stream];
}

const literalPassword = translit(visited);
const integerPassword = visited.reduce((v, x) => v * 29n + BigInt(x), 0n).toString();
const candidates = [];
for (const [representation, password] of [
  ['literal-GP-Latin', literalPassword],
  ['base29-integer', integerPassword],
]) {
  for (const role of ['Encryption', 'Seeding']) {
    const stream = outguessArc4(password, role, 43);
    for (const sign of [-1, 1]) {
      const decoded = inner55.map((x, i) => mod(x + sign * (stream[i] % 29)));
      candidates.push({
        representation,
        role,
        operation: sign === -1 ? 'C-K' : 'C+K',
        keystreamFirst10: stream.slice(0, 10),
        outputTokens: decoded.map(x => corpus.translit[x]),
        output: translit(decoded),
        ioc: ioc(decoded),
        emersonGpLanguageScore: languageScore(decoded, model),
      });
    }
  }
}

// Arithmetic positive control: the exact same derived GP29 pad must invert a
// synthetic known p57 segment when added modulo 29.
const p57Runes = transcription.split('%')[56].match(/[\u16A0-\u16FF]/gu) || [];
const p57 = p57Runes.slice(7, 50).map(r => runeIndex.get(r));
assert.strictEqual(p57.length, 43);
const controlPad = outguessArc4(literalPassword, 'Encryption', 43).map(x => x % 29);
const syntheticCipher = p57.map((x, i) => mod(x + controlPad[i]));
const recovered = syntheticCipher.map((x, i) => mod(x - controlPad[i]));
assert.deepStrictEqual(recovered, p57);

console.log(JSON.stringify({
  source: {
    p50ByteInterval: [84, 127],
    p32Start: [3, 0],
    p32End: [row, col],
    p32CompassRunes: visited.length,
    p55PrintedWords: p55Words.length,
    p55InteriorRunes: inner55.length,
  },
  passwords: {
    literalGpLatin: literalPassword,
    base29Integer: integerPassword,
  },
  control: { syntheticGp29RoundTripPassed: true },
  candidates,
  conclusion: 'The eight fixed OutGuess ARC4-derived GP29 variants do not recover plaintext. This rejects only these two p32 password encodings, two OutGuess roles, and two signs; it does not exclude other source-selected keys or transforms.',
}, null, 2));
