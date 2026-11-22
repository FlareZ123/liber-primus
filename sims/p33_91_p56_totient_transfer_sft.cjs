#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quadgramText = fs.readFileSync(path.join(root, 'resources/control/duko_round27_english_quadgrams.txt'), 'utf8');
const alphabet = corpus.translit;
const p33 = corpus.pages.find(page => page.page === 33).indices.slice(0, 91);
const p56 = corpus.pages.find(page => page.page === 56).indices;
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';

function toIndices(text) {
  const tokens = alphabet.map((token, index) => ({ token, index })).sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(item => word.startsWith(item.token, i));
      assert.ok(match, `no GP29 token at ${word.slice(i)}`);
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}

function firstPrimes(n) {
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) if (candidate % d === 0) { prime = false; break; }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(200);

function transform(input, mode, literalSkipPosition = null, direction = -1) {
  let keyIndex = 0;
  return input.map((rune, position) => {
    if (position === literalSkipPosition) return rune;
    const prime = primes[keyIndex++];
    const shift = mode === 'phi' ? prime - 1 : prime;
    return (rune + direction * shift + 29 * 100) % 29;
  });
}

function sha256(indices) { return crypto.createHash('sha256').update(Buffer.from(indices)).digest('hex'); }

const p56FPositions = p56.map((rune, i) => rune === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(p56FPositions, [35, 47, 51, 56, 74]);
const p56Decoded = transform(p56, 'phi', 56, -1);
const p56Expected = toIndices(expectedWords);
assert.deepEqual(p56Decoded, p56Expected, 'solved p56 positive control');
assert.deepEqual(transform(p56Decoded, 'phi', 56, 1), p56, 'p56 forward replay');

assert.equal(p33.length, 91);
assert.deepEqual(p33.map((rune, i) => rune === 0 ? i : -1).filter(i => i >= 0), [4, 12, 48]);
assert.equal(sha256(p33), 'b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a');

const p33Phi = transform(p33, 'phi', null, -1);
const p33Prime = transform(p33, 'prime', null, -1);
assert.deepEqual(transform(p33Phi, 'phi', null, 1), p33, 'p33 phi-prime forward replay');
assert.deepEqual(transform(p33Prime, 'prime', null, 1), p33, 'p33 prime-control forward replay');
assert.equal(sha256(p33Phi), 'b55966c2dc495696707a4204f060c8d914d493a3f297e5bdf4bf5f07773ade73');

const quadgrams = new Map();
let total = 0;
for (const line of quadgramText.trim().split(/\r?\n/)) {
  const [gram, countText] = line.trim().split(/\s+/);
  if (!gram || !countText) continue;
  const count = Number(countText);
  quadgrams.set(gram, count);
  total += count;
}
function letters(indices) { return indices.map(index => alphabet[index]).join('').replace(/[^A-Z]/g, ''); }
function score(indices) {
  const text = letters(indices);
  let sum = 0, n = 0;
  for (let i = 0; i <= text.length - 4; i++) {
    sum += Math.log10((quadgrams.get(text.slice(i, i + 4)) || 0.01) / total);
    n++;
  }
  return { letters: text.length, quadgrams: n, mean_log10_per_quadgram: sum / n };
}

const heldout = p33Phi.slice(-23);
const heldoutPrime = p33Prime.slice(-23);
const heldoutRaw = p33.slice(-23);
const p33PhiScore = score(p33Phi);
const p33PrimeScore = score(p33Prime);
const p33RawScore = score(p33);
const p56PositiveScore = score(p56Expected);
const heldoutScore = score(heldout);
const heldoutPrimeScore = score(heldoutPrime);
const heldoutRawScore = score(heldoutRaw);
assert.ok(Math.abs(p33PhiScore.mean_log10_per_quadgram - (-7.35058202280884)) < 1e-9);
assert.ok(Math.abs(p33PrimeScore.mean_log10_per_quadgram - (-7.4642071633137315)) < 1e-9);
assert.ok(Math.abs(p33RawScore.mean_log10_per_quadgram - (-7.514260449025225)) < 1e-9);
assert.ok(Math.abs(p56PositiveScore.mean_log10_per_quadgram - (-4.461648582243903)) < 1e-9);
assert.ok(Math.abs(heldoutScore.mean_log10_per_quadgram - (-6.628647391803114)) < 1e-9);

console.log(JSON.stringify({
  p33_input_sha256: sha256(p33),
  p33_decoded_sha256: sha256(p33Phi),
  p33_red_title: letters(p33Phi.slice(0, 10)),
  p33_phi_prime_output: p33Phi.map(index => alphabet[index]).join(' '),
  p33_phi_prime_score: p33PhiScore,
  p33_wrong_prime_score: p33PrimeScore,
  p33_raw_score: p33RawScore,
  p56_authentic_positive_control_score: p56PositiveScore,
  heldout_last23: heldout.map(index => alphabet[index]).join(' '),
  heldout_gp29_indices: heldout.join(''),
  heldout_score: heldoutScore,
  heldout_wrong_prime_score: heldoutPrimeScore,
  heldout_raw_score: heldoutRawScore,
  interpretation: 'fixed p56 transfer rejected for p33 local [0,91); no p33 cipher/key recovered',
}, null, 2));
