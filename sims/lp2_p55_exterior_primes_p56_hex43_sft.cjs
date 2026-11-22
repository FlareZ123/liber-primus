'use strict';
/**
 * LP2 p55 whole 76-rune reversible envelope:
 * p57 SHED word exteriors => 33 prime-number addresses into the following
 * solved p56 128-hex string => 33 nibble-derived GP29 key symbols for 43
 * remaining interior runes.  Source-fixed zero-based hex positions.
 *
 * Windows Node.js 22, read only:
 *   node sims/lp2_p55_exterior_primes_p56_hex43_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const src = corpus.pages[55].indices;
const clear = corpus.pages[57].indices;
const hex = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(src.length, 76);
assert.equal(clear.length, 95);
assert.match(hex, /^[0-9a-f]{128}$/);
assert.equal(lengths.reduce((x, y) => x + y, 0), 76);

const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
const sections = transcription.split(/\n%\n/);
const p55Source = sections.at(-3);
assert.ok(p55Source, 'p55 physical source section absent');
const fragments = p55Source.replace(/\r?\n|\//g, '').split(/[-.]/)
  .filter(part => part.length && [...part].every(symbol => runeIndex.has(symbol)))
  .map(part => [...part].map(symbol => {
    const rune = runeIndex.get(symbol);
    assert.notEqual(rune, undefined);
    return rune;
  }));
assert.deepEqual(fragments.map(x => x.length), lengths);
assert.deepEqual(fragments.flat(), src);

const exteriorPositions = [0];
const interiorPositions = [];
let position = lengths[0];
for (let word = 1; word < lengths.length; word++) {
  const size = lengths[word];
  exteriorPositions.push(position, position + size - 1);
  for (let j = 1; j < size - 1; j++) interiorPositions.push(position + j);
  position += size;
}
assert.equal(position, 76);
assert.equal(exteriorPositions.length, 33);
assert.equal(interiorPositions.length, 43);
assert.equal(new Set([...exteriorPositions, ...interiorPositions]).size, 76);
const exteriors = exteriorPositions.map(index => src[index]);
const interiors = interiorPositions.map(index => src[index]);
const primes = exteriors.map(index => corpus.prime[index]);
assert.ok(primes.every(index => index >= 0 && index < hex.length));
const k = primes.map(index => Number.parseInt(hex[index], 16));
assert.equal(k.map(x => x.toString(16)).join(''), 'f226a77623623aa73a8a966967187b6ab');

/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} source @param {-1|1} sign */
const decode = (source, sign) =>
  source.map((c, index) => mod(c + sign * k[index % k.length]));
/** @param {number[]} symbols */
const ioc = symbols => {
  const counts = Array(29).fill(0);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (symbols.length * (symbols.length - 1));
};
/** @param {number[]} interior */
const pack = interior => {
  assert.equal(interior.length, 43);
  const all = [...src];
  for (let j = 0; j < interior.length; j++)
    all[interiorPositions[j]] = interior[j];
  assert.deepEqual(exteriorPositions.map(i => all[i]), exteriors);
  return all;
};
/** @param {number[]} symbols */
const roman = symbols => symbols.map(v => corpus.translit[v]).join('.');
const results = [];
for (const sign of [-1, 1]) {
  const candidate = decode(interiors, sign);
  const reconstructed = pack(decode(candidate, /** @type {-1|1} */ (-sign)));
  assert.deepEqual(reconstructed, src, 'all 76 original glyphs recovered');
  const native = clear.slice(0, 43);
  const plantedCipher = decode(native, /** @type {-1|1} */ (-sign));
  assert.deepEqual(decode(plantedCipher, sign), native, 'authentic 43-symbol positive');
  assert.deepEqual(pack(plantedCipher).length, 76);
  const row = { sign, ioc: ioc(candidate), output: roman(candidate) };
  assert.ok(row.ioc < 0.04);
  results.push(row);
}
assert.equal(results.length, 2);
console.log(JSON.stringify({
  source: 'p55 original full76, p57 word-edge instruction, p56 literal 128hex',
  type: '33 original exposed rune selectors + 43 cipher interiors',
  source_outer: exteriors.length, source_inner: interiors.length,
  source_cipher_interior_ioc: ioc(interiors),
  solved_p57_43_ioc: ioc(clear.slice(0, 43)),
  derived_hex_nibbles: k.map(x => x.toString(16)).join(''), results,
  decision: 'The exact zero-based GPprime-addressed p56-hex nibble key does not decrypt p55 interiors to native GP text; all76 original runes are invertible.'
}, null, 2));
