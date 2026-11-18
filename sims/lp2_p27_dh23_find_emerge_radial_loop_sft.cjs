'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');

const tokens = grid.rows.flat();
const base60 = grid.alphabet;
const base59 = base60.replace('f', '');
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rawPages = transcription.split('%');

/** @param {string} token @param {string} radixAlphabet */
function decode(token, radixAlphabet) {
  const hi = radixAlphabet.indexOf(token[0]);
  const lo = radixAlphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * radixAlphabet.length + lo;
}

/** @param {number} n */
function phi(n) {
  assert.ok(n > 0);
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    result -= result / p;
    while (x % p === 0) x /= p;
  }
  if (x > 1) result -= result / x;
  return result;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** @param {number} n */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) rank += 1;
  }
  return rank;
}

/** @param {number[]} inds */
function primeSum(inds) {
  return inds.reduce((sum, index) => sum + corpus.prime[index], 0);
}

/** @param {number[]} inds */
function translit(inds) {
  return inds.map(index => corpus.translit[index]).join('');
}

/** @param {number} physicalPage */
function pageWords(physicalPage) {
  const source = rawPages[physicalPage <= 49 ? physicalPage : physicalPage - 1] || '';
  let current = [];
  const words = [];
  const flush = () => {
    if (!current.length) return;
    words.push(current);
    current = [];
  };

  for (const ch of source) {
    if (alphabet.has(ch)) {
      current.push(alphabet.get(ch));
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Printed line/page wrapping preserves a word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[][]} parts */
function shed(parts) {
  const removed = [];
  const inner = parts.map(part => {
    if (!part.length) return [];
    if (part.length === 1) {
      removed.push(part[0]);
      return [];
    }
    removed.push(part[0], part.at(-1));
    return part.slice(1, -1);
  });
  return {inner, removed};
}

/** @param {number} row @param {number} column */
const address = (row, column) => row * 8 + column;

/** @param {number} addr */
function depth(addr) {
  const row = Math.floor(addr / 8);
  const column = addr % 8;
  return Math.min(row, 31 - row, column, 7 - column);
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

const p57 = pageWords(57).map((inds, index) => ({
  position: index + 1,
  name: translit(inds),
  sum: primeSum(inds),
}));
assert.equal(p57.length, 20);

const byName = name => p57.find(word => word.name === name);
assert.deepEqual(
  [9, 10, 11, 14, 15, 20].map(position => {
    const word = p57[position - 1];
    return [position, word.name, word.sum];
  }),
  [
    [9, 'WE', 86],
    [10, 'MUST', 186],
    [11, 'SHED', 232],
    [14, 'CIRCUMFERENCES', 451],
    [15, 'FIND', 151],
    [20, 'EMERGE', 300],
  ]
);

// Reproduce the client secret from the frozen DH23 public values.
const dh = {p: 23, g: 5, serverPublic: 8, clientPublic: 19, shared: 2};
const clientSecrets = [];
for (let exponent = 0; exponent < dh.p - 1; exponent += 1) {
  if (modPow(dh.g, exponent, dh.p) === dh.clientPublic) clientSecrets.push(exponent);
}
assert.deepEqual(clientSecrets, [15]);
const clientSecret = clientSecrets[0];
assert.equal(p57[clientSecret - 1].name, 'FIND');

// Independent WE holdout: (client secret, shared) is a unique valid orientation.
assert.ok(dh.shared < 8);
assert.ok(clientSecret >= 8);
const weAddress = address(clientSecret, dh.shared);
assert.equal(weAddress, 122);
assert.equal(tokens[weAddress], '1Q');
assert.equal(decode(tokens[weAddress], base60), byName('WE').sum);
assert.notEqual(decode(tokens[weAddress], base59), byName('WE').sum);

// Independently reproduce the older p27 first-shed address122 selector.
const p27 = annotations.pages.find(page => page.page === 27);
assert(p27);
const redSpan = p27.red_spans[0];
const p27Words = pageWords(27);
let runeOffset = 0;
const p27WordSlots = [];
for (const inds of p27Words) {
  p27WordSlots.push({start: runeOffset, end: runeOffset + inds.length, inds});
  runeOffset += inds.length;
}
// The first three printed words are the red 3/12/4 heading.
const headingWords = p27WordSlots.slice(0, 3).map(slot => slot.inds);
assert.deepEqual(headingWords.map(word => word.length), [3, 12, 4]);
const firstShed = shed(headingWords).inner.flat();
assert.equal(firstShed.length, 13);
assert.equal(primeSum(firstShed), 673);
assert.equal(primeRank(primeSum(firstShed)), weAddress);

// Radial MUST -> FIND -> WITHIN chain.
const mustSum = byName('MUST').sum;
const findSum = byName('FIND').sum;
const findDivinity = phi(findSum);
assert.equal(mustSum, 186);
assert.equal(findSum, 151);
assert.equal(findDivinity, 150);

const outer = 151;
const center = 150;
const inner = 149;
assert.deepEqual([depth(outer), depth(center), depth(inner)], [0, 1, 2]);
assert.equal(outer - inner, dh.shared);
assert.equal(tokens[outer], '39');
assert.equal(tokens[center], '2X');
assert.equal(tokens[inner], '2s');

assert.equal(decode(tokens[outer], base59), mustSum);
assert.equal(decode(tokens[center], base59), findSum);
assert.equal(center, findDivinity);

const innerValue59 = decode(tokens[inner], base59);
const emergePosition = innerValue59 % findSum;
assert.equal(innerValue59, 171);
assert.equal(emergePosition, 20);
assert.equal(p57[emergePosition - 1].name, 'EMERGE');
assert.equal(p57[emergePosition - 1].sum, 300);

// The twice-shed ring selected by shared2 has length phi(MUST)=60.
assert.equal(phi(mustSum), 60);
assert.equal(depth(inner), dh.shared);

// Base60 fails the verb chain at the same three cells.
assert.equal(decode(tokens[outer], base60), 189);
assert.equal(decode(tokens[center], base60), 153);
assert.equal(decode(tokens[inner], base60), 174);
assert.notEqual(decode(tokens[outer], base60), mustSum);
assert.notEqual(decode(tokens[center], base60), findSum);
assert.equal(decode(tokens[inner], base60) % findSum, dh.p);
assert.ok((decode(tokens[inner], base60) % findSum) > p57.length);

console.log(JSON.stringify({
  status: 'PASS: p27 DH23 circumference -> FIND -> EMERGE radial loop',
  p57: p57.filter(word => [9, 10, 11, 14, 15, 20].includes(word.position)),
  clientSecret: {
    value: clientSecret,
    selectsWord: p57[clientSecret - 1].name,
    publicCheck: modPow(dh.g, clientSecret, dh.p),
    sharedCheck: modPow(dh.serverPublic, clientSecret, dh.p),
  },
  weHoldout: {
    coordinate: [clientSecret, dh.shared],
    address: weAddress,
    token: tokens[weAddress],
    base60: decode(tokens[weAddress], base60),
    base59: decode(tokens[weAddress], base59),
    independentP27FirstShedRank: primeRank(primeSum(firstShed)),
  },
  radial: {
    addresses: [outer, center, inner],
    depths: [depth(outer), depth(center), depth(inner)],
    base59Values: [outer, center, inner].map(a => decode(tokens[a], base59)),
    base60Values: [outer, center, inner].map(a => decode(tokens[a], base60)),
    sharedSteps: outer - inner,
    findDivinity,
    innerModFind: emergePosition,
    selectedWord: p57[emergePosition - 1].name,
    selectedWordPrimeSum: p57[emergePosition - 1].sum,
  },
}, null, 2));
