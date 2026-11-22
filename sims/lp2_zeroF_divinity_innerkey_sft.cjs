'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const authentic =
  require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');

const root = path.resolve(__dirname, '..');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const pages = corpus.pages.filter((page) => page.page <= 55);
const cipher = pages.flatMap((page) => page.indices);
const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes = grid.bytes;
const key = authentic.key;
const special = [
  corpus.translit.indexOf('F'),
  ...corpus.translit.map((value, index) =>
    value.length === 2 ? index : -1).filter((index) => index >= 0)
];

assert.equal(cipher.length, 12956);
assert.deepEqual(key, [23, 10, 1, 10, 9, 10, 16, 26]);
assert.deepEqual(special, [0, 2, 12, 21, 22, 25, 27, 28]);

function swap(value, left, right) {
  if (left === right) return value;
  if (value === left) return right;
  if (value === right) return left;
  return value;
}

function marker(control) {
  if (tokens[control][0] === '0') return 0;
  return special[bytes[control] & 7];
}

function zeroFEncrypt(plain) {
  if (!plain.length) return [];
  const cipherOut = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    cipherOut[i] = swap(
      plain[i],
      cipherOut[i - 1],
      marker((i - 1) & 255)
    );
  }
  return cipherOut;
}

function zeroFDecrypt(cipherIn) {
  if (!cipherIn.length) return [];
  const plain = [cipherIn[0]];
  for (let i = 1; i < cipherIn.length; i++) {
    plain[i] = swap(
      cipherIn[i],
      cipherIn[i - 1],
      marker((i - 1) & 255)
    );
  }
  return plain;
}

function divinityEncrypt(plain) {
  let phase = 0;
  return plain.map((value) => {
    const out = (value + key[phase]) % 29;
    phase = (phase + 1) % key.length;
    return out;
  });
}

function divinityDecrypt(input, literalF) {
  let phase = 0;
  return input.map((value) => {
    if (literalF && value === 0) return 0;
    const out = (value - key[phase] + 29) % 29;
    phase = (phase + 1) % key.length;
    return out;
  });
}

function ioc(stream) {
  const counts = new Int32Array(29);
  for (const value of stream) counts[value]++;
  const numerator = counts.reduce(
    (sum, count) => sum + count * (count - 1),
    0
  );
  return numerator / (stream.length * (stream.length - 1));
}

const trainingText = fs.readFileSync(
  path.join(root, 'resources', 'control', 'shakespeare_first300k.txt'),
  'utf8'
).slice(0, 240000);
const training = encodeSourceNativeGP(trainingText);
assert.equal(training.length, 173728);

const bigrams = new Float64Array(29 * 29);
const trigrams = new Float64Array(29 * 29 * 29);
for (let i = 2; i < training.length; i++) {
  const prefix = training[i - 2] * 29 + training[i - 1];
  bigrams[prefix]++;
  trigrams[prefix * 29 + training[i]]++;
}

function trigramScore(stream) {
  const alpha = 0.5;
  let logLikelihood = 0;
  let n = 0;
  for (let i = 2; i < stream.length; i++) {
    const prefix = stream[i - 2] * 29 + stream[i - 1];
    logLikelihood += Math.log(
      (trigrams[prefix * 29 + stream[i]] + alpha) /
      (bigrams[prefix] + alpha * 29)
    );
    n++;
  }
  return logLikelihood / n;
}

const zeroF = zeroFDecrypt(cipher);
const directConsume = divinityDecrypt(cipher, false);
const directLiteralF = divinityDecrypt(cipher, true);
const layeredConsume = divinityDecrypt(zeroF, false);
const layeredLiteralF = divinityDecrypt(zeroF, true);
const p57 = corpus.pages.find((page) => page.page === 57);
assert.ok(p57);

const plantedInner = divinityEncrypt(p57.indices);
const plantedOuter = zeroFEncrypt(plantedInner);
assert.deepEqual(
  divinityDecrypt(zeroFDecrypt(plantedOuter), false),
  p57.indices
);

const scores = {
  raw: trigramScore(cipher),
  zeroF: trigramScore(zeroF),
  directDivinityConsumeAll: trigramScore(directConsume),
  directDivinityLiteralF: trigramScore(directLiteralF),
  zeroFThenDivinityConsumeAll: trigramScore(layeredConsume),
  zeroFThenDivinityLiteralF: trigramScore(layeredLiteralF),
  clearP57: trigramScore(p57.indices)
};

const expected = {
  raw: -4.091204974017087,
  zeroF: -4.099411297859266,
  directDivinityConsumeAll: -4.102691321090504,
  directDivinityLiteralF: -4.129563961541496,
  zeroFThenDivinityConsumeAll: -4.099042790380883,
  zeroFThenDivinityLiteralF: -4.114923614633382,
  clearP57: -2.4481137055246185
};
for (const [name, value] of Object.entries(expected)) {
  assert.ok(Math.abs(scores[name] - value) < 1e-12, name);
}

assert.ok(scores.zeroFThenDivinityConsumeAll < scores.raw);
assert.ok(scores.zeroFThenDivinityLiteralF < scores.zeroF);
assert.ok(scores.clearP57 > scores.raw + 1.5);

console.log(JSON.stringify({
  model: 'frozen zero-F surface inverse then authentic LP1 DIVINITY Vigenere',
  sourceRunes: cipher.length,
  zeroFEdits: zeroF.reduce(
    (sum, value, index) => sum + Number(value !== cipher[index]),
    0
  ),
  scores,
  ioc: {
    raw: ioc(cipher),
    zeroF: ioc(zeroF),
    zeroFThenDivinityConsumeAll: ioc(layeredConsume),
    zeroFThenDivinityLiteralF: ioc(layeredLiteralF),
    clearP57: ioc(p57.indices)
  },
  positivePlant: {
    plaintextRunes: p57.indices.length,
    exactRecovery: true
  },
  decision:
    'negative: authenticated DIVINITY does not provide a linguistic inner layer after zero-F'
}, null, 2));
