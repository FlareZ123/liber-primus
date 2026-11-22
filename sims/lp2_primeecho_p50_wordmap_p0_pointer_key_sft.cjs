#!/usr/bin/env node
'use strict';

// Exploratory cross-round word-map hypothesis. No dependency beyond Node.js.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = p => JSON.parse(read(p));

const primeEcho = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');

// The archived shell transcript writes a literal TAB after each prime.
const primes = Array.from(
  primeEcho.matchAll(/echo(?: -n)?\s+"(\d+)\t"/g),
  m => Number(m[1])
);
assert.equal(primes.length, 464);
assert.equal(primes.indexOf(1033) + 1, 174);
assert.equal(primes.indexOf(3301) + 1, 464);
const primeBlockCounts = [174, 464 - 174, 464];
const selectedPositions = primeBlockCounts.map(n => n / 29);
assert.deepEqual(selectedPositions, [6, 10, 16]);

const signedBody = signed2016
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash:[^\r\n]*\r?\n\r?\n/, '')
  .replace(/7A35090F/g, '');
const words = Array.from(signedBody.matchAll(/[A-Za-z]+/g), m => m[0].toUpperCase());
assert.equal(words.length, 43);
const selectedWords = selectedPositions.map(n => words[n - 1]);
assert.deepEqual(selectedWords, ['EPIPHANY', 'LIBER', 'WORDS']);

const translit = corpus.translit;
function gpValues(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/[VKQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const match = translit
      .filter(symbol => normalized.startsWith(symbol, i))
      .sort((a, b) => b.length - a.length)[0];
    if (!match) throw new Error('No GP29 transliteration for ' + word + ' at ' + i);
    out.push(translit.indexOf(match));
    i += match.length;
  }
  return out;
}
const gp0 = word => gpValues(word).reduce((sum, value) => sum + value, 0);
const addresses = selectedWords.map(gp0);
assert.deepEqual(addresses, [121, 69, 52]);

const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const base59Alphabet = grid.alphabet.replace('f', '');
assert.equal(base59Alphabet.length, 59);
assert(tokens.every(token => !token.includes('f')));
const table59 = tokens.map(token =>
  59 * base59Alphabet.indexOf(token[0]) + base59Alphabet.indexOf(token[1])
);
assert(table59.every(value => Number.isInteger(value) && value >= 0 && value < 256));
const table60 = grid.bytes;
assert.equal(table60.length, 256);

function walk(start, table) {
  const path = [];
  const seen = new Set();
  let current = start;
  while (!seen.has(current)) {
    if (!Number.isInteger(current) || current < 0 || current >= 256) {
      throw new Error('Pointer escaped the 256-cell table at ' + current);
    }
    seen.add(current);
    path.push(current);
    current = table[current];
  }
  return { path, repeat: current };
}
const selectedMaps = selectedWords.map((word, i) => {
  const path59 = walk(addresses[i], table59);
  const path60 = walk(addresses[i], table60);
  return {
    position: selectedPositions[i],
    word,
    gp0Address: addresses[i],
    base59: {
      pathLength: path59.path.length,
      repeat: path59.repeat,
      outputWord: words[path59.path.length - 1]
    },
    base60: {
      pathLength: path60.path.length,
      repeat: path60.repeat,
      outputWord: words[path60.path.length - 1]
    }
  };
});
assert.deepEqual(selectedMaps.map(row => row.base59.pathLength), [31, 6, 27]);
assert.deepEqual(selectedMaps.map(row => row.base59.outputWord), ['SEEK', 'EPIPHANY', 'NUMBERS']);
assert.deepEqual(selectedMaps.map(row => row.base60.pathLength), [14, 18, 14]);
assert.deepEqual(selectedMaps.map(row => row.base60.outputWord), ['WAY', 'THE', 'WAY']);

const epiphanyPath = walk(addresses[0], table59).path;
assert.equal(epiphanyPath.length, 31);
assert.equal(epiphanyPath[epiphanyPath.length - 1], 189);
const keyCurrentCell = epiphanyPath.map(value => value % 29);
const keyDestination = epiphanyPath.slice(1)
  .concat(epiphanyPath[epiphanyPath.length - 1])
  .map(value => value % 29);
assert.equal(keyCurrentCell.length, 31);
assert.equal(keyDestination.length, 31);

const p0 = corpus.pages[0].indices;
assert.equal(p0.length, 262);
const p0Body = p0.slice(13);
assert.equal(p0Body.length, 249);
const p0CipherFCount = p0Body.filter(value => value === 0).length;
assert.equal(p0CipherFCount, 13);

// Inverse of a GP29 additive cipher with the p56-style transparent-F rule.
// sign=-1 means P=C-K; sign=+1 means P=C+K.
// At C=F, allow either a non-F ordinary inverse or literal-F bypass.
// A bypass does not consume the key.
function inverseReachability(cipher, key, sign) {
  let phases = new Set([0]);
  let maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Set();
    for (const phase of phases) {
      const p = (c + sign * key[phase] + 58) % 29;
      if (p !== 0) next.add((phase + 1) % key.length);
      if (c === 0) next.add(phase);
    }
    phases = next;
    maxStates = Math.max(maxStates, phases.size);
    if (phases.size === 0) return { survivors: 0, failAt: i, maxStates };
  }
  return { survivors: phases.size, failAt: null, maxStates };
}

function inverseWithOutputs(cipher, key, sign) {
  let states = [{ phase: 0, output: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = [];
    for (const state of states) {
      const p = (c + sign * key[state.phase] + 58) % 29;
      if (p !== 0) {
        next.push({
          phase: (state.phase + 1) % key.length,
          output: state.output.concat(p)
        });
      }
      if (c === 0) {
        next.push({ phase: state.phase, output: state.output.concat(0) });
      }
    }
    states = next;
    if (states.length === 0) return states;
  }
  return states;
}

function encryptPlant(plain, key, sign) {
  let phase = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = (p - sign * key[phase] + 58) % 29;
    phase = (phase + 1) % key.length;
    return c;
  });
}
const plant = Array.from({ length: 97 }, (_, i) => (i * 7 + 3) % 29);
const positiveControls = [];
for (const [name, key] of [
  ['current-cell-addresses', keyCurrentCell],
  ['destination-addresses', keyDestination]
]) {
  for (const sign of [-1, 1]) {
    const cipher = encryptPlant(plant, key, sign);
    const recovered = inverseWithOutputs(cipher, key, sign);
    const exact = recovered.some(state =>
      state.output.length === plant.length &&
      state.output.every((value, i) => value === plant[i])
    );
    assert(exact);
    positiveControls.push({ key: name, sign, exactRecovery: exact });
  }
}

const p0Tests = [];
for (const [name, key] of [
  ['current-cell-addresses', keyCurrentCell],
  ['destination-addresses', keyDestination]
]) {
  for (const sign of [-1, 1]) {
    p0Tests.push({
      key: name,
      sign,
      ...inverseReachability(p0Body, key, sign)
    });
  }
}
assert.deepEqual(
  p0Tests.map(row => row.failAt),
  [212, 37, 212, 16]
);
assert(p0Tests.every(row => row.survivors === 0));

const output = {
  primeEcho: {
    total: primes.length,
    after1033: 174,
    after3301: 464,
    blockCounts: primeBlockCounts,
    dividedBy29: selectedPositions
  },
  signed2016: {
    wordCount: words.length,
    selected: selectedPositions.map((position, i) => ({
      position,
      word: selectedWords[i],
      gp0Address: addresses[i]
    }))
  },
  p50WordMap: selectedMaps,
  epiphanyPointerPath: epiphanyPath,
  keyCurrentCell,
  keyDestination,
  p0: {
    totalRunes: p0.length,
    bodyStartOffset: 13,
    bodyRunes: p0Body.length,
    ciphertextFCount: p0CipherFCount,
    keyPeriod: 31,
    lengthRelation: '249 = 8*31 + 1',
    positiveControls,
    tests: p0Tests
  },
  classification: 'exploratory hypothesis; no plaintext recovered'
};
console.log(JSON.stringify(output, null, 2));
