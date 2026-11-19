/**
 * SFT: authenticated 2016 OPENPGP hex stride -> source-word modulus ladder.
 * Reads only the preserved signed message and canonical p50 numeric table.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ASC_PATH = path.join(ROOT, 'resources', 'historical', 'cicada2016-4gq25-outguess.asc');
const GRID_PATH = path.join(ROOT, 'resources', 'liber-primus', 'lp2-grid-256.json');

const GP0 = Object.freeze({
  F: 0, U: 1, O: 3, R: 4, C: 5, G: 6, W: 7, H: 8, N: 9, I: 10,
  J: 11, P: 13, X: 14, S: 15, T: 16, B: 17, E: 18, M: 19, L: 20,
  D: 23, A: 24, Y: 26,
});
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const BASE59 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';

/** @param {bigint} n @param {bigint} m */
function mod(n, m) {
  return Number(n % m);
}

/** @param {number} base @param {number} exp @param {number} modulus */
function powMod(base, exp, modulus) {
  let b = BigInt(base);
  let e = BigInt(exp);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

/** @param {number} a @param {number} m */
function inverseMod(a, m) {
  for (let x = 1; x < m; x += 1) if ((a * x) % m === 1) return x;
  throw new Error(`no inverse for ${a} mod ${m}`);
}

/** @param {string} token @param {string} alphabet */
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, `invalid token ${token}`);
  return hi * alphabet.length + lo;
}

/** Relevant selected words use only single-rune GP romanizations. @param {string} word */
function gp0Simple(word) {
  return [...word.toUpperCase()].reduce((sum, ch) => {
    assert.ok(Object.hasOwn(GP0, ch), `unsupported GP letter in ${word}: ${ch}`);
    return sum + GP0[ch];
  }, 0);
}

/** @param {string} asc */
function signedCleartext(asc) {
  const hash = asc.indexOf('Hash: SHA1');
  const start = asc.indexOf('\n\n', hash);
  const end = asc.indexOf('-----BEGIN PGP SIGNATURE-----');
  assert.ok(hash >= 0 && start >= 0 && end > start);
  return asc.slice(start + 2, end);
}

/** @param {string[]} words @param {number} start @param {number} stride @param {1|-1} direction */
function strideChain(words, start, stride, direction) {
  const indices = [start];
  for (let i = 0; i < 2; i += 1) indices.push(indices.at(-1) + direction * stride);
  if (indices.some((i) => i < 0 || i >= words.length)) return null;
  return { indices, words: indices.map((i) => words[i].toUpperCase()) };
}

const asc = fs.readFileSync(ASC_PATH, 'utf8');
const clear = signedCleartext(asc);
const rawTokens = clear.match(/[A-Za-z0-9]+/g) ?? [];
const parsers = {
  alpha: rawTokens.filter((x) => /^[A-Za-z]+$/.test(x)),
  alnum: rawTokens,
};

assert.equal(parsers.alpha[10].toUpperCase(), 'PRIMUS');
assert.equal(parsers.alpha[26].toUpperCase(), 'NUMBERS');
assert.equal(parsers.alpha[42].toUpperCase(), 'OPENPGP');
assert.equal(parsers.alpha[15].toUpperCase(), 'WORDS');
assert.equal(parsers.alpha[19].toUpperCase(), 'THEIR');
assert.equal(parsers.alpha[23].toUpperCase(), 'ROAD');

const keyId = 0x7A35090Fn;
const targetRoles = ['WORDS', 'THEIR', 'ROAD'];
const family = [];
for (const [parserName, words] of Object.entries(parsers)) {
  const anchor = words.findIndex((w) => w.toUpperCase() === 'OPENPGP');
  assert.ok(anchor >= 0);
  for (const direction of [-1, 1]) {
    const chain = strideChain(words, anchor, 16, /** @type {1|-1} */ (direction));
    for (const middleRadix of [59, 60]) {
      for (const origin of ['zero', 'one']) {
        let roleWords = null;
        let residues = null;
        if (chain && chain.words.join('/') === 'OPENPGP/NUMBERS/PRIMUS') {
          residues = [mod(keyId, 16n), mod(keyId, BigInt(middleRadix)), mod(keyId, 29n)];
          const positions = origin === 'zero' ? residues : residues.map((x) => x - 1);
          if (positions.every((x) => x >= 0 && x < words.length)) {
            roleWords = positions.map((x) => words[x].toUpperCase());
          }
        }
        family.push({ parserName, direction, middleRadix, origin, chain, residues, roleWords,
          success: roleWords?.join('/') === targetRoles.join('/') });
      }
    }
  }
}

const survivors = family.filter((x) => x.success);
assert.equal(family.length, 16);
assert.equal(survivors.length, 1);
assert.deepEqual(
  { parserName: survivors[0].parserName, direction: survivors[0].direction,
    middleRadix: survivors[0].middleRadix, origin: survivors[0].origin },
  { parserName: 'alpha', direction: -1, middleRadix: 60, origin: 'zero' },
);
assert.deepEqual(survivors[0].chain.indices, [42, 26, 10]);
assert.deepEqual(survivors[0].residues, [15, 19, 23]);

const [b, B, p] = survivors[0].residues;
const q = B - b;
assert.equal(p - B, q);
assert.equal(q, 4);
assert.equal(parsers.alpha[q].toUpperCase(), 'EMPTY');
assert.equal(gp0Simple('EMPTY'), p * q);
const possibleG = [];
for (let g = 1; g < p; g += 1) if (powMod(g, b, p) === B) possibleG.push(g);
assert.deepEqual(possibleG, [5]);
const g = possibleG[0];
const e = inverseMod(b, p - 1);
assert.equal(e, 3);

const grid = JSON.parse(fs.readFileSync(GRID_PATH, 'utf8'));
const tokens = grid.tokens ?? grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
const selectedSourceOrder = ['PRIMUS', 'NUMBERS', 'OPENPGP'];
const addresses = selectedSourceOrder.map(gp0Simple);
assert.deepEqual(addresses, [62, 83, 75]);
const selectedTokens = addresses.map((address) => tokens[address]);
assert.deepEqual(selectedTokens, ['24', '3D', '2v']);
const base60Packet = selectedTokens.map((token) => decodeToken(token, BASE60) % 29);
const base59Packet = selectedTokens.map((token) => decodeToken(token, BASE59) % 29);
assert.deepEqual(base60Packet, [8, 19, 3]);
assert.deepEqual(base59Packet, [6, 16, 0]);

const [A, B2, e2] = base60Packet;
assert.equal(B2, B);
assert.equal(e2, e);
const possibleA = [];
for (let a = 1; a < p; a += 1) if (powMod(g, a, p) === A) possibleA.push(a);
assert.deepEqual(possibleA, [6]);
const a = possibleA[0];
const K = powMod(A, b, p);
assert.equal(K, 2);
assert.equal(powMod(B, a, p), K);
const sourceStatePositions = [K, e, q, g, a, g + K, A, b, B, p];
const sourceStateWords = sourceStatePositions.map((position) => parsers.alpha[position].toUpperCase());
assert.deepEqual(sourceStateWords, ['PATH','LIES','EMPTY','EPIPHANY','SEEKS','THE','DEVOTED','WORDS','THEIR','ROAD']);
assert.equal(survivors[0].chain.indices[0] - survivors[0].chain.indices[2], 16 * K);

const summary = {
  source_selector: {
    anchor: 'OPENPGP',
    stride: 16,
    chain_indices_discovery_order: survivors[0].chain.indices,
    chain_words_discovery_order: survivors[0].chain.words,
  },
  charged_family: {
    configurations: family.length,
    survivors: survivors.length,
    survivor: { parser: 'alphabetic-only', direction: 'backward', middleRadix: 60, origin: 'zero-based' },
    base59_zero_roles: family.find((x) => x.parserName === 'alpha' && x.direction === -1 && x.middleRadix === 59 && x.origin === 'zero').roleWords,
  },
  key_id_residues: { mod16_b: b, mod60_B: B, mod29_p: p },
  reconstructed: { p, q, g, a, b, A, B, K, e },
  source_state_words: { positions: sourceStatePositions, words: sourceStateWords },
  p50_crosscheck: { words: selectedSourceOrder, addresses, tokens: selectedTokens, base60_mod29: base60Packet, base59_mod29: base59Packet },
  hop_count_equals_K: K,
};
console.log(JSON.stringify(summary, null, 2));
