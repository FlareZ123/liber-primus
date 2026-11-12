'use strict';

/**
 * Original p33[0,91) exact 2014 Stage05 rowwise 7-column operation.
 * Run: node sims/lp2_p33_stage5_row7_transfer_sft.cjs
 * Reuses the source-authenticated Stage5 decoder, not a reimplemented variant.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { decode, encode } = require('./stage5_original_outguess_columnar_sft.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const p33 = corpus.pages.find(p => p.page === 33).indices.slice(0, 91);
assert.equal(p33.length, 91);
assert.equal(crypto.createHash('sha256').update(Buffer.from(p33)).digest('hex'),
  'b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a');

// Frozen 2014 Stage5 seven-column solved example, read source rowwise.
const sourceCipher = 'TL BE IE OV UT HT RE ID TS EO ST PO SO YR ' +
  'SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M';
const stage5 = sourceCipher.replace(/\s/g, '');
const key = '1736254';
const correct = 'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133';
assert.equal(stage5.length, 56);
assert.equal(decode(stage5, key), correct);
assert.equal(encode(correct, key), stage5);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabc'; // reversible one-character GP token labels
assert.equal(chars.length, 29);
const indexInput = p33.map(i => chars[i]).join('');
const inverseKey = Array.from({ length: 7 }, (_, i) => String(key.indexOf(String(i + 1)) + 1)).join('');
const out = decode(indexInput, key);
const wrongOrder = decode(indexInput, inverseKey);
assert.equal(encode(out, key), indexInput);
assert.equal(out.length, 91);
const toRuneIndices = text => [...text].map(char => chars.indexOf(char));
const recovered = toRuneIndices(out);
const sourceAlphabet = corpus.translit;
const spell = ids => ids.map(i => sourceAlphabet[i]).join('');
const tokenSequence = ids => ids.map(i => sourceAlphabet[i]).join(' ');

const quad = fs.readFileSync(path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8');
const grams = new Map();
let total = 0;
for (const line of quad.trim().split(/\r?\n/)) {
  const [token, rawCount] = line.trim().split(/\s+/);
  if (!token || !rawCount) continue;
  const n = Number(rawCount);
  grams.set(token, n);
  total += n;
}
function score(ids) {
  const letters = spell(ids);
  let sum = 0;
  for (let i = 0; i + 3 < letters.length; i++) {
    sum += Math.log10((grams.get(letters.slice(i, i + 4)) || 0.01) / total);
  }
  return sum / (letters.length - 3);
}
const rawScore = score(p33);
const decodedScore = score(recovered);
const inverseScore = score(toRuneIndices(wrongOrder));
const solvedP57Score = score(corpus.pages.find(p => p.page === 57).indices);
assert.ok(Math.abs(rawScore - (-7.514260449025225)) < 1e-10);
assert.ok(Math.abs(decodedScore - (-7.48958731196897)) < 1e-10);
assert.ok(Math.abs(inverseScore - (-7.650900139727038)) < 1e-10);
assert.ok(solvedP57Score > decodedScore + 1.0);

console.log(JSON.stringify({
  historicallySourceSelectedCipher: '2014 Stage05 rowwise 1736254',
  stage05Positive56: correct,
  originalPhysicalPage: 33,
  originalPageInterval: '[0,91)',
  originalInputSha256: 'b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a',
  originalInput: tokenSequence(p33),
  decoded: tokenSequence(recovered),
  decodedJoinedGP: spell(recovered),
  exactForwardReplay: encode(out, key) === indexInput,
  originalScore: rawScore,
  stage5DecodedScore: decodedScore,
  inversePermutationControlScore: inverseScore,
  authenticSolvedP57Score: solvedP57Score,
  interpretation: 'single exact 2014 rowwise seven-column transfer, original p33 remains ciphertext-like; no key/plaintext'
}, null, 2));
