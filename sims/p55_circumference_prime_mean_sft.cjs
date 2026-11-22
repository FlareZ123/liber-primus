'use strict';

// Agent49, 2026-11-11. Original-source p55 circumference prime-weight mean.
// Usage: node sims/p55_circumference_prime_mean_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(root, 'resources', 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const sections = raw.split('%').slice(0, 55);
const stream = sections.join('%');
const byPage = Array.from({length: 55}, () => ({interior: [], exterior: []}));
const words = [];
let current = [];
let page = 0;

function finish() {
  if (!current.length) return;
  words.push(current);
  for (let k = 0; k < current.length; k++) {
    const [physicalRunePage, symbol] = current[k];
    byPage[physicalRunePage][k === 0 || k === current.length - 1 ? 'exterior' : 'interior'].push(symbol);
  }
  current = [];
}
for (const character of stream) {
  if (alphabet.has(character)) current.push([page, alphabet.get(character)]);
  else if (character === '%') page++;
  else if (character === '/' || /\s/u.test(character)) {} // line wrap only
  else finish();
}
finish();

assert.equal(words.length, 2896);
assert.equal(byPage.reduce((s, p) => s + p.interior.length + p.exterior.length, 0), 12956);
const terminal = byPage[54];
const completeWords = words.filter((w) => w.every(([p]) => p === 54));
const inner = completeWords.flatMap((w) => w.slice(1, -1).map(([, r]) => r));
assert.deepEqual(inner, terminal.interior);
assert.equal(completeWords.length, 16);
assert.equal(terminal.interior.length, 43);
assert.equal(terminal.exterior.length, 33);
assert.equal(corpus.pages.find((p) => p.page === 55).indices.length, 76);
const sum = (symbols) => symbols.reduce((s, rune) => s + corpus.prime[rune], 0);
assert.equal(sum(terminal.exterior), 1591);
assert.equal(sum(inner), 2060);
assert.equal(sum(terminal.exterior) / inner.length, 37);
assert.equal(corpus.prime.indexOf(37), 11);
const integerPages = byPage.map((p, i) => ({
  physical: i < 50 ? i : i + 1,
  interior: p.interior.length,
  exterior: p.exterior.length,
  exteriorSum: sum(p.exterior)
})).filter((p) => p.interior && p.exteriorSum % p.interior === 0);
assert.deepEqual(integerPages.map((p) => p.physical), [55]);

// Exact multiset-preserving null: every 33-of-76 choice of exterior positions
// is equiprobable; duplicate-symbol multiplicities are counted correctly.
const weights = corpus.pages.find((p) => p.page === 55).indices.map((r) => corpus.prime[r]);
const kMax = terminal.exterior.length;
const dp = Array.from({length: kMax + 1}, () => new Map());
dp[0].set(0, 1n);
for (let i = 0; i < weights.length; i++) {
  const weight = weights[i];
  for (let k = Math.min(i + 1, kMax); k >= 1; k--) {
    for (const [s, count] of dp[k - 1]) {
      dp[k].set(s + weight, (dp[k].get(s + weight) || 0n) + count);
    }
  }
}
const denominator = [...dp[kMax].values()].reduce((s, n) => s + n, 0n);
const numerator37 = dp[kMax].get(1591) || 0n;
const numeratorAnyPrime = corpus.prime.reduce((s, prime) => s + (dp[kMax].get(prime * inner.length) || 0n), 0n);
const numeratorAnyInteger = [...dp[kMax]].reduce((s, [weight, count]) => s + (weight % inner.length === 0 ? count : 0n), 0n);
assert.equal(denominator, 3594123189167641103400n);
assert.equal(numerator37, 10210113785085201060n);
assert.equal(numeratorAnyPrime, 19052734055245324262n);

// One new source-fixed candidate: take 37 literally as first prime and reuse
// the independently solved p56 prime-totient cipher on the 43 interior runes.
// The genuine p56 rule contains one literal F that does not advance the key.
function primesThrough(count) {
  const primes = [];
  for (let x = 2; primes.length < count; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) primes.push(x);
  }
  return primes;
}
const primes = primesThrough(180);
const decode = (source, start, fSkip) => {
  let key = primes.indexOf(start);
  return source.map((r) => {
    if (fSkip && r === 0) return 0;
    const shift = (primes[key++] - 1) % 29;
    return (r - shift + 29) % 29;
  });
};
const gpDecode = (sentence) => {
  const tokens = corpus.translit.map((text, i) => [text, i]).sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (const word of sentence.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = tokens.find(([text]) => word.startsWith(text, i));
      assert.ok(match);
      out.push(match[1]);
      i += match[0].length;
    }
  }
  return out;
};
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
let p56key = 0;
const solved = p56Cipher.map((r, index) => index === 56 ? 0 : (r - ((primes[p56key++] - 1) % 29) + 29) % 29);
const expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(solved, gpDecode(expected));
const ioc = (symbols) => {
  const c = Array(29).fill(0);
  for (const r of symbols) c[r]++;
  return c.reduce((n, v) => n + v * (v - 1), 0) / (symbols.length * (symbols.length - 1));
};
const direct = decode(inner, 37, false);
const literalF = decode(inner, 37, true);
const translit = (symbols) => symbols.map((r) => corpus.translit[r]).join(' ');
console.log(JSON.stringify({
  original: {page: 55, runeCount: 76, completeWords: 16, interiorRunes: 43, exteriorRunes: 33, interiorPrimeSum: 2060, exteriorPrimeSum: 1591, quotient: 37, rune: 'J'},
  uniqueIntegerMeanIn55: integerPages,
  exactPermutationNull: {
    denominator: String(denominator),
    numerator37: String(numerator37),
    probability37: Number(numerator37) / Number(denominator),
    numeratorAnyGPPrime: String(numeratorAnyPrime),
    probabilityAnyGPPrime: Number(numeratorAnyPrime) / Number(denominator),
    numeratorAnyInteger: String(numeratorAnyInteger),
    probabilityAnyInteger: Number(numeratorAnyInteger) / Number(denominator)
  },
  authenticP56TotientControl: '85/85 recovered',
  candidatePrime37: {
    interiorCipher: translit(inner),
    withoutLiteralF: {ioc: ioc(direct), plaintext: translit(direct)},
    withLiteralF: {ioc: ioc(literalF), plaintext: translit(literalF)}
  },
  decision: 'Arithmetic correspondence only; both fixed original-cipher inverses nonlinguistic. No unknown plaintext recovered.'
}, null, 2));
