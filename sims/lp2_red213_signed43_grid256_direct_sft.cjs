#!/usr/bin/env node
'use strict';

/**
 * SFT: source-frozen 213 LP2 red GP29 runes + 43 authentic 2016 words
 *       compared with the physical 256-cell p50 table.
 * All inputs are repository-preserved originals or explicitly derived
 * annotations, and no unknown-page plaintext is assumed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
const loadJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = loadJSON('resources/liber-primus/lp2-corpus.json');
const ink = loadJSON('resources/liber-primus/lp2-ink-annotations.json');
const table = loadJSON('resources/liber-primus/base60-grid.json');
const sourceFile = path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc');
const signed = fs.readFileSync(sourceFile, 'utf8');

const red = ink.pages
  .filter((page) => page.page <= 55 && page.red_spans?.length)
  .flatMap((page) => page.red_spans
    .flatMap((span) => [...span.runes].map((rune) => {
      const n = corpus.runes.indexOf(rune);
      assert(n >= 0, 'all red symbols must be canonical original GP29');
      return n;
    })));
assert.equal(red.length, 213, 'original unknown-page red rune count');
assert.deepEqual(
  ink.pages.filter((p) => p.page <= 55 && p.red_spans?.length).map((p) => p.page),
  [0, 3, 6, 7, 8, 15, 23, 27, 33, 39, 40, 53, 54]
);

const first = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
assert(first > 0, 'preserved original signed block');
const clean = signed.slice(0, first).replace(
  /^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, ''
);
const allTokens = clean.match(/[A-Za-z]+/g);
const words = allTokens.slice(0, 43);
assert.equal(words.length, 43);
assert.deepEqual(words.slice(0, 6), ['Hello', 'The', 'path', 'lies', 'empty', 'epiphany']);
assert.equal(words.at(-1), 'OpenPGP');
assert.deepEqual(allTokens.slice(43), ['A', 'F'], 'the key fingerprint is not a word');
const map = new Map(corpus.translit.map((x, i) => [x, i]));
const tokensByLength = corpus.translit.slice().sort((a, b) => b.length - a.length);
function toGP(word) {
  let text = word.toUpperCase().replaceAll('K', 'C')
    .replaceAll('V', 'U').replaceAll('Q', 'CW')
    .replaceAll('Z', 'S');
  const out = [];
  while (text) {
    const token = tokensByLength.find((x) => text.startsWith(x));
    assert(token, 'invalid literal GP29 word: ' + word);
    out.push(map.get(token));
    text = text.slice(token.length);
  }
  return out;
}
const wordRunes = words.map(toGP);
const sums = {
  gp0: wordRunes.map((a) => a.reduce((s, x) => s + x, 0) % 29),
  prime: wordRunes.map((a) => a.reduce((s, x) => s + corpus.prime[x], 0) % 29),
  first: wordRunes.map((a) => a[0]),
  last: wordRunes.map((a) => a.at(-1))
};
const grid = table.byte_rows.flat();
assert.equal(grid.length, 256);
assert(grid.every((v) => Number.isInteger(v) && v >= 0 && v <= 255));
const input = grid.map((x) => x % 29);
const mod = (x) => (x % 29 + 29) % 29;

function ioc(a) {
  const f = Array(29).fill(0);
  for (const n of a) f[n]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const sourceIoc = ioc(input);
const clearP57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clearP57.length, 95);
const nativeIoc = ioc(clearP57);
const results = [];
for (const [measure, w] of Object.entries(sums)) {
  for (const placement of ['red-first', 'word-first']) {
    const key = placement === 'red-first' ? [...red, ...w] : [...w, ...red];
    assert.equal(key.length, 256);
    for (const sign of [-1, 1]) {
      const plain = input.map((c, i) => mod(c + sign * key[i]));
      // Exact reversible planted p57 control for precisely the tested key/sign.
      const synthetic = clearP57.map((p, i) => mod(p - sign * key[i]));
      const recovered = synthetic.map((c, i) => mod(c + sign * key[i]));
      assert.deepEqual(recovered, clearP57, 'full independent native GP plant');
      results.push({ measure, placement, sign,
        ioc: ioc(plain),
        preview: plain.slice(0, 42).map((v) => corpus.translit[v]).join('')
      });
    }
  }
}
assert.equal(results.length, 16);
results.sort((a, b) => b.ioc - a.ioc);
assert(results.every((r) => r.ioc < 0.04));
console.log(JSON.stringify({
  classification: 'Source-count coincidence, direct additive inverses fail; no plaintext',
  original2016sha256: crypto.createHash('sha256').update(signed).digest('hex'),
  sourceKeys: { redRuneCount: red.length, sourceWordCount: words.length,
    sum: 256, originalGridCount: grid.length },
  unmodifiedTableIoc: sourceIoc,
  solvedNativeP57Ioc: nativeIoc,
  sourceMethods: Object.keys(sums),
  cases: results,
  all16NativeP57Plants: 'PASS 95/95'
}, null, 2));
