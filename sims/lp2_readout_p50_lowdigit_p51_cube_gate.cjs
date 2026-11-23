'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const base60 = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const ids = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = n => (n % 29 + 29) % 29;
function pow(a, e) {
  let result = 1;
  for (; e; e = Math.floor(e / 2), a = a * a % 29) {
    if (e % 2) result = result * a % 29;
  }
  return result;
}
function ioc(xs) {
  const hist = Array(29).fill(0);
  for (const x of xs) hist[x]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}
const translit = xs => xs.map(x => corpus.translit[x]).join('');

// Upstream p28 candidate: six GP29 symbols spelling READOUT (EA is one rune).
const readoutIndices = [4, 28, 23, 3, 1, 16];
const alphabet = base60.alphabet;
const tableTokens = base60.rows.flat();
const lowDigits = tableTokens.map(token => alphabet.indexOf(token[1]));
const pageSelector = readoutIndices.map(index => lowDigits[index]);
assert.deepEqual(pageSelector, [37, 30, 27, 6, 51, 1]);
assert(pageSelector.every(page => page >= 0 && page < 58));

const sourceP51 = source.split('%')[50];
const words = sourceP51.replace(/[\r\n/]/g, '').split(/[-.&$§]/)
  .map(token => [...token].filter(r => ids.has(r)).map(r => ids.get(r)))
  .filter(word => word.length);
const original = corpus.pages.find(page => page.page === 51).indices;
const panel = grid.pages[2].bytes;
assert.equal(original.length, 92);
assert.equal(words.length, 20);
assert.equal(panel.length, 72);
assert.deepEqual(words.flat(), original);
const firstEdgeDropped = words.flatMap(word => word.slice(1));
const lastEdgeDropped = words.flatMap(word => word.slice(0, -1));
assert.equal(firstEdgeDropped.length, 72);
assert.equal(lastEdgeDropped.length, 72);

// Source-selected cube and its exact inverse are permutations of GP29.
for (let x = 0; x < 29; x++) assert.equal(pow(pow(x, 3), 19), x);

const results = [];
for (const cut of ['first', 'last']) {
  const retained = cut === 'first' ? firstEdgeDropped : lastEdgeDropped;
  for (const orientation of ['printed', 'reverse']) {
    const bytes = orientation === 'printed' ? panel : panel.slice().reverse();
    for (const exponent of [3, 19]) {
      const key = bytes.map(value => pow(value % 29, exponent));
      for (const sign of [-1, 1]) {
        const plain = retained.map((cipher, i) => mod(cipher + sign * key[i]));
        const plant = corpus.pages.find(page => page.page === 57).indices.slice(0, 72);
        const encryptedPlant = plant.map((p, i) => mod(p - sign * key[i]));
        assert.deepEqual(encryptedPlant.map((c, i) => mod(c + sign * key[i])), plant);
        results.push({
          family: 'cube-transformed-key',
          cut, orientation, exponent, sign,
          ioc: ioc(plain), text: translit(plain)
        });
      }
    }
  }
  for (const orientation of ['printed', 'reverse']) {
    const bytes = orientation === 'printed' ? panel : panel.slice().reverse();
    for (const sign of [-1, 1]) {
      for (const mode of ['cube-after-add', 'cube-before-add']) {
        for (const exponent of [3, 19]) {
          const plain = retained.map((cipher, i) => {
            const key = bytes[i] % 29;
            const mixed = mode === 'cube-after-add'
              ? mod(cipher + sign * key)
              : mod(pow(cipher, 3) + sign * key);
            return pow(mixed, exponent);
          });
          results.push({
            family: 'cube-additive-composition',
            cut, orientation, sign, mode, exponent,
            ioc: ioc(plain), text: translit(plain)
          });
        }
      }
    }
  }
}
assert.equal(results.filter(x => x.family === 'cube-transformed-key').length, 16);
assert.equal(results.filter(x => x.family === 'cube-additive-composition').length, 32);
const maxIoC = Math.max(...results.map(x => x.ioc));
assert(maxIoC < 0.045774647887323945);

console.log(JSON.stringify({
  readoutIndices,
  pageSelector,
  selectedP27AndP51: [pageSelector[2], pageSelector[4]],
  p51: {
    printedWords: words.length,
    originalRunes: original.length,
    panelCells: panel.length,
    retainedFirstEdgeDropped: firstEdgeDropped.length,
    retainedLastEdgeDropped: lastEdgeDropped.length
  },
  sourceCube: 'x^3 mod 29',
  inverseCube: 'x^19 mod 29',
  variants: results.length,
  maxIoC,
  solvedLp1WindowMinimum: 0.045774647887323945,
  results
}, null, 2));
