'use strict';

/**
 * Bounded original-input test: the immediately preceding, solved 2014
 * GEB dialogue book-code onion hostname as a GP29 periodic candidate key.
 * The base32 -> GP29 reduction is a hypothesis, not a Cicada instruction.
 *
 * Reproducer: Node.js 20+ CommonJS, standard library only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));

const sourceHostname = 'ut3qtzbrvs7dtvzp';
const base32 = 'abcdefghijklmnopqrstuvwxyz234567';
const key = [...sourceHostname].map(ch => {
  const ordinal = base32.indexOf(ch);
  assert(ordinal >= 0, 'Source hostname is not RFC4648 base32');
  return ordinal % 29;
});

assert.equal(sourceHostname.length, 16);
assert.deepEqual(key, [20, 19, 27, 16, 19, 25, 1, 17, 21, 18, 2, 3, 19, 21, 25, 15]);
assert.equal(corpus.translit.length, 29);

/** @param {number} n */
function mod29(n) { return ((n % 29) + 29) % 29; }

/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  const numerator = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (values.length * (values.length - 1));
}

/**
 * @param {number[][]} pages
 * @param {-1 | 1} sign
 * @param {boolean} reset
 * @param {boolean} decode
 */
function transform(pages, sign, reset, decode) {
  let step = 0;
  return pages.map(page => {
    if (reset) step = 0;
    return page.map(value => {
      const keyValue = key[step++ % key.length];
      return mod29(value + (decode ? -sign : sign) * keyValue);
    });
  });
}

const originalPages = corpus.pages
  .filter(page => page.page < 56 && page.indices.length > 0);
const source = originalPages.map(page => page.indices);
const original = source.flat();
assert.equal(originalPages.length, 55);
assert.equal(original.length, 12956);
assert.equal(originalPages[0].indices.length, 262);
assert.equal(originalPages.at(-1).indices.length, 76);

const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
assert(ioc(known) > 0.05, 'Genuine solved GP-English control unexpectedly flat');

console.log(JSON.stringify({
  sourceHostname, base32KeyMod29: key, sourceRunes: original.length,
  originalIoc: ioc(original),
  solvedP57Ioc: ioc(known)
}));

for (const reset of [false, true]) {
  for (const sign of /** @type {Array<-1|1>} */ ([-1, 1])) {
    const decoded = transform(source, sign, reset, true);
    const reencoded = transform(decoded, sign, reset, false);
    assert.deepEqual(reencoded, source, 'Original full-cipher roundtrip failed');

    const planted = transform([known], sign, reset, false);
    const recovered = transform(planted, sign, reset, true)[0];
    assert.deepEqual(recovered, known, '95-rune authentic plaintext plant failed');

    const flat = decoded.flat();
    const result = {
      pageReset: reset, sign, totalRunes: flat.length,
      indexOfCoincidence: ioc(flat),
      firstPageIoc: ioc(decoded[0]),
      finalPageIoc: ioc(decoded.at(-1)),
      first30Tokens: flat.slice(0, 30).map(x => corpus.translit[x]),
      plantedKnownPlaintextRecovered: recovered.length
    };
    assert(Math.abs(result.indexOfCoincidence - 1 / 29) < 0.001,
      'Unexpected original-cipher symbol concentration; manually investigate');
    console.log(JSON.stringify(result));
  }
}
