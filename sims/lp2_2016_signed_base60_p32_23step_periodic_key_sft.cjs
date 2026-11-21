'use strict';

/**
 * Literal 2016 signed EPIPHANY SEEKS THE DEVOTED p50 base60 23-hop page32
 * receiver, using its exact source-route addresses as cyclic GP29 pad.
 * Six complete original-input inverses, fixed before language scoring.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const get = (p) => fs.readFileSync(path.join(repo, p), 'utf8');
const grid = JSON.parse(get('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const signed = get('resources/historical/cicada2016-4gq25-outguess.asc');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(alphabet.length, 60);
const source = grid.pages.flatMap((p) => p.tokens);
assert.equal(source.length, 256);
const parent = source.map((token) => {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const value = 60 * a + b;
  assert.ok(value >= 0 && value <= 255);
  return value;
});
const body = signed.split('Hash: SHA1')[1]
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .split('7A35090F')[0];
const words = body.toUpperCase().match(/[A-Z]+/g);
assert.equal(words.length, 43);
assert.equal(words.slice(5, 9).join(' '), 'EPIPHANY SEEKS THE DEVOTED');
const vocabulary = corpus.translit.map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
/** @param {string} original */
function gp(original) {
  const word = original.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const values = [];
  for (let i = 0; i < word.length;) {
    const current = vocabulary.find(({ symbol }) => word.startsWith(symbol, i));
    if (!current) return [];
    values.push(current.value);
    i += current.symbol.length;
  }
  return values;
}
const value = (word) => gp(word).reduce((s, x) => s + x, 0);
const sums = words.slice(5, 9).map(value);
assert.deepEqual(sums, [121, 71, 20, 102]);
const route = [sums[1]];
for (let step = 0; step < 23; step++) route.push(parent[route.at(-1)]);
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,
  228,144,125,20,102,32
]);
assert.deepEqual(route.slice(-3), [sums[2], sums[3], 32]);
const ciphertext = corpus.pages.find((page) => page.page === 32).indices;
assert.equal(ciphertext.length, sums[0]);
assert.equal(ciphertext.length, 5 * route.length + 1);

const native = (get('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/gu) || []).flatMap(gp);
assert.ok(native.length > 20000);
const split = Math.floor(native.length * 2 / 3);
const train = native.slice(0, split), held = native.slice(split);
const trigram = new Map();
for (let i = 2; i < train.length; i++) {
  const code = train[i - 2] * 841 + train[i - 1] * 29 + train[i];
  trigram.set(code, (trigram.get(code) || 0) + 1);
}
const denom = train.length - 2 + 0.25 * 29 ** 3;
/** @param {number[]} values */
function score(values) {
  let ll = 0;
  for (let i = 2; i < values.length; i++) {
    const code = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
    ll += Math.log(((trigram.get(code) || 0) + 0.25) / denom);
  }
  return ll / (values.length - 2);
}
const nativeHeld = [];
for (let i = 0; i + ciphertext.length <= held.length; i += 50) {
  nativeHeld.push(score(held.slice(i, i + ciphertext.length)));
}
const nativeMin = Math.min(...nativeHeld), mod = (x) => (x % 29 + 29) % 29;
const routes = {
  full24: route,
  edge23: route.slice(0, -1),
  tail23: route.slice(1)
};
const outcomes = [];
for (const [keyName, key] of Object.entries(routes)) {
  for (const sign of [-1, +1]) {
    const decoded = ciphertext.map((rune, index) => mod(rune + sign * key[index % key.length]));
    assert.deepEqual(decoded.map((rune, index) =>
      mod(rune - sign * key[index % key.length])), ciphertext);
    outcomes.push({
      key: keyName, period: key.length, sign,
      nativeTrigramLL: score(decoded),
      preview: decoded.slice(0, 36).map((index) => corpus.translit[index]).join('')
    });
  }
}
outcomes.sort((a, b) => b.nativeTrigramLL - a.nativeTrigramLL);
assert.equal(outcomes.length, 6);
assert.ok(Math.abs(outcomes[0].nativeTrigramLL + 11.466620256333) < 1e-7);
assert.ok(Math.abs(nativeMin + 9.345100027365) < 1e-7);
assert.ok(outcomes.every((outcome) => outcome.nativeTrigramLL < nativeMin));

console.log(JSON.stringify({
  source: { words: words.slice(5, 9), sums, route, p32Runes: ciphertext.length },
  language: { nativeHeldCount: nativeHeld.length, nativeHeldMin: nativeMin,
    originalP32LL: score(ciphertext) },
  originalDecoders: { tested: outcomes.length, outcomes,
    candidatesAtOrAboveEnglishFloor: outcomes.filter(
      (outcome) => outcome.nativeTrigramLL >= nativeMin).length }
}, null, 2));
