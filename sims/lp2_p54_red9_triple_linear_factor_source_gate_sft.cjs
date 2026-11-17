'use strict';

/**
 * Exact original-source test of the p54 nine-rune polynomial and a conditional
 * five-state GP29 stream inverse. Read-only; Node.js 22, CommonJS.
 *
 * This tests a proposed operation. The polynomial relationship does not
 * authenticate the LFSR key, or claim recovered Liber Primus plaintext.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8',
));
const corpus = source('lp2-corpus.json');
const grid = source('lp2-grid-256.json');
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} coefficients Descending GF(29) coefficients. @param {number} x */
function evaluate(coefficients, x) {
  return coefficients.reduce((a, b) => mod29(a * x + b), 0);
}

/** @param {number[]} coefficients Descending coefficients, divisible by X-root. @param {number} root */
function divideByLinear(coefficients, root) {
  const quotient = [coefficients[0]];
  for (let i = 1; i < coefficients.length - 1; i++) {
    quotient.push(mod29(quotient.at(-1) * root + coefficients[i]));
  }
  assert.equal(mod29(quotient.at(-1) * root + coefficients.at(-1)), 0);
  return quotient;
}

/** @param {number} x Nonzero GF(29) element. */
function inverse29(x) {
  assert.notEqual(mod29(x), 0);
  for (let k = 1; k < 29; k++) if (mod29(x * k) === 1) return k;
  throw new Error('No inverse in GF29');
}

/** @param {number[]} seed @param {number[]} monic Descending monic polynomial. @param {number} length */
function recurrence(seed, monic, length) {
  const degree = monic.length - 1;
  assert.equal(seed.length, degree);
  assert.equal(monic[0], 1);
  const key = seed.slice();
  const asc = monic.slice().reverse();
  while (key.length < length) {
    const j = key.length - degree;
    let next = 0;
    for (let i = 0; i < degree; i++) next += asc[i] * key[j + i];
    key.push(mod29(-next));
  }
  return key;
}

/** @param {number[]} values */
function ioc(values) {
  const count = Array(29).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    count[value]++;
  }
  return count.reduce((a, c) => a + c * (c - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} a @param {number[]} key @param {number} sign */
function transform(a, key, sign) {
  return a.map((c, i) => mod29(c + sign * key[i]));
}

assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(grid.bytes)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const page54 = corpus.pages[54].indices;
const page55 = corpus.pages[55].indices;
const page57 = corpus.pages[57].indices;
assert.deepEqual([page54.length, page55.length, page57.length], [232, 76, 95]);

const red = page54.slice(0, 9);
assert.deepEqual(red, [24, 19, 21, 23, 27, 2, 14, 10, 19]);
const after24 = divideByLinear(red, 24);
const after19 = divideByLinear(after24, 19);
const quintic = divideByLinear(after19, 19);
assert.deepEqual(quintic, [24, 28, 2, 5, 2, 11]);
assert.notEqual(evaluate(quintic, 19), 0);
assert.notEqual(evaluate(quintic, 24), 0);
assert.equal(evaluate(red, 24), 0);
assert.equal(evaluate(red, 19), 0);

const tablePolynomial = grid.bytes.map((x) => mod29(x)).slice(1);
assert.equal(mod29(grid.bytes[0]), 0);
const reducedTable = divideByLinear(
  divideByLinear(tablePolynomial, 24), 24);
assert.notEqual(evaluate(reducedTable, 24), 0);

const invLeading = inverse29(quintic[0]);
const monicQuintic = quintic.map((x) => mod29(x * invLeading));

assert.deepEqual(monicQuintic, [1, 6, 17, 28, 17, 21]);

// The quotient is a primitive degree-five polynomial over GF(29).
// Its root generates every nonzero element of GF(29^5).
const quotientAscending = monicQuintic.slice().reverse();
/** @param {number[]} left @param {number[]} right */
function fieldMultiply(left, right) {
  const product = Array(9).fill(0);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      product[i + j] = mod29(product[i + j] + left[i] * right[j]);
    }
  }
  for (let i = 8; i >= 5; i--) {
    for (let j = 0; j < 5; j++) {
      product[i - 5 + j] = mod29(
        product[i - 5 + j] - product[i] * quotientAscending[j]);
    }
  }
  return product.slice(0, 5);
}
/** @param {number[]} base @param {number} exponent */
function fieldPower(base, exponent) {
  let result = [1, 0, 0, 0, 0];
  let current = base.slice();
  while (exponent > 0) {
    if (exponent % 2 === 1) result = fieldMultiply(result, current);
    current = fieldMultiply(current, current);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}
/** @param {number[]} values */
function stripZeros(values) {
  const result = values.slice();
  while (result.length > 0 && result.at(-1) === 0) result.pop();
  return result;
}
/** @param {number[]} a @param {number[]} b */
function remainder(a, b) {
  let result = stripZeros(a);
  const divisor = stripZeros(b);
  assert(divisor.length > 0);
  while (result.length >= divisor.length) {
    const factor = mod29(result.at(-1) * inverse29(divisor.at(-1)));
    const offset = result.length - divisor.length;
    for (let i = 0; i < divisor.length; i++) {
      result[offset + i] = mod29(result[offset + i] - factor * divisor[i]);
    }
    result = stripZeros(result);
  }
  return result;
}
/** @param {number[]} a @param {number[]} b */
function polynomialGcd(a, b) {
  let left = stripZeros(a);
  let right = stripZeros(b);
  while (right.length > 0) {
    const next = remainder(left, right);
    left = right;
    right = next;
  }
  return left.map((v) => mod29(v * inverse29(left.at(-1))));
}
const fieldX = [0, 1, 0, 0, 0];
const x29 = fieldPower(fieldX, 29);
const x29minusX = x29.map((v, i) => mod29(v - fieldX[i]));
const groupOrder = 29 ** 5 - 1;
assert.equal(groupOrder, 20511148);
assert.deepEqual(fieldPower(fieldX, 29 ** 5), fieldX);
assert.deepEqual(polynomialGcd(quotientAscending, x29minusX), [1]);
assert.deepEqual(fieldPower(fieldX, groupOrder), [1, 0, 0, 0, 0]);
const properPowers = [
  [2, [28, 0, 0, 0, 0]],
  [7, [7, 0, 0, 0, 0]],
  [732541, [16, 1, 28, 14, 28]],
];
for (const [primeFactor, witness] of properPowers) {
  assert.deepEqual(fieldPower(fieldX, groupOrder / primeFactor), witness);
  assert.notEqual(witness.join(','), '1,0,0,0,0');
}

const body = [...page54.slice(9), ...page55];
assert.equal(body.length, 299);
const seed = red.slice(0, 5);
const key = recurrence(seed, monicQuintic, body.length);
const nativePlant = Array.from({length: body.length},
  (_, i) => page57[i % page57.length]);
for (const sign of [-1, 1]) {
  const proposed = transform(body, key, sign);
  assert.deepEqual(transform(proposed, key, -sign), body);
  const plantedCiphertext = transform(nativePlant, key, -sign);
  assert.deepEqual(transform(plantedCiphertext, key, sign), nativePlant);
  console.log(JSON.stringify({
    sign,
    bodyIoC: ioc(proposed),
    p55IoC: ioc(proposed.slice(-76)),
    first90: proposed.slice(0, 90)
      .map((i) => corpus.translit[i]).join(' '),
    originalReencrypted: body.length,
    nativePlantRecovered: nativePlant.length,
  }));
}

/*
 * Follow-on: source-seeded 28-step chain receiver.
 *
 * Independent external research (indexed at resources/external/
 * leo-y-zhang-liberprimusanalysis-index.md) proposes a chain receiver:
 * C[i]=C[i-1]+step[i] mod29, with 28 nonzero steps and one zero-step symbol.
 * Here the p54 primitive quintic supplies the candidate key generator:
 * first five red runes as LFSR state. This is a bounded source-to-model test,
 * not evidence that either the external model or this key is Cicada's.
 */
const mod28 = (x) => ((x % 28) + 28) % 28;
function ioc28(values) {
  const counts = Array(28).fill(0);
  for (const value of values) {
    assert(Number.isInteger(value) && value >= 0 && value < 28);
    counts[value]++;
  }
  return 28 * counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
const primitiveRoots = [];
for (let g = 2; g < 29; g++) {
  const seen = new Set();
  let x = 1;
  for (let i = 0; i < 28; i++) {
    seen.add(x);
    x = mod29(x * g);
  }
  if (seen.size === 28) primitiveRoots.push(g);
}
assert.equal(primitiveRoots.length, 12);
const chainRawKey = recurrence(seed, monicQuintic, 1200);
const chainNonzeroKey = chainRawKey.filter((x) => x !== 0);
assert.equal(chainRawKey.length, 1200);
assert.equal(chainNonzeroKey.length, 1153);
const chainKeyMaps = [{
  name: 'rank(x-1)',
  key: chainNonzeroKey.map((x) => x - 1)
}];
for (const g of primitiveRoots) {
  const lookup = Array(29).fill(-1);
  let x = 1;
  for (let e = 0; e < 28; e++) {
    lookup[x] = e;
    x = mod29(x * g);
  }
  chainKeyMaps.push({name: 'log' + g, key: chainNonzeroKey.map((v) => lookup[v])});
}
chainKeyMaps.push({name: 'raw(x mod28)', key: chainRawKey.map(mod28)});
assert.equal(chainKeyMaps.length, 14);
const chainDeltas = body.slice(1).map((value, i) =>
  mod29(value - body[i]));
assert.equal(chainDeltas.length, 298);
assert.equal(chainDeltas.filter((x) => x === 0).length, 3);
assert.equal(chainDeltas.filter((x) => x !== 0).length, 295);
const chainCandidates = [];
for (const keyMap of chainKeyMaps) {
  for (const direction of ['forward', 'reverse']) {
    for (const start of [0, 5]) {
      for (const sign of [-1, 1]) {
        for (const consumeZeroSteps of [false, true]) {
          let keyIndex = start;
          const decoded = [];
          const p54Decoded = [];
          const p55Decoded = [];
          for (let i = 0; i < chainDeltas.length; i++) {
            const delta = chainDeltas[i];
            if (delta === 0) {
              if (consumeZeroSteps) keyIndex++;
              continue;
            }
            const step = direction === 'forward' ? delta : 29 - delta;
            const keyValue = keyMap.key[keyIndex++];
            const plain = mod28((step - 1) - sign * keyValue);
            decoded.push(plain);
            if (i < 222) p54Decoded.push(plain);
            else p55Decoded.push(plain);
          }
          chainCandidates.push({
            keyMap: keyMap.name, direction, start, sign, consumeZeroSteps,
            n: decoded.length,
            ioc28: ioc28(decoded),
            p54IoC28: ioc28(p54Decoded),
            p55IoC28: ioc28(p55Decoded),
            first48: decoded.slice(0, 48)
              .map((i) => corpus.translit[i]).join(' ')
          });
        }
      }
    }
  }
}
assert.equal(chainCandidates.length, 224);
chainCandidates.sort((a, b) => b.ioc28 - a.ioc28);
const maxP54 = chainCandidates.slice().sort((a, b) =>
  b.p54IoC28 - a.p54IoC28)[0];
const maxP55 = chainCandidates.slice().sort((a, b) =>
  b.p55IoC28 - a.p55IoC28)[0];

// Pin and parse the solved GP reference word-by-word, preserving IA digraphs.
const referencePath = path.join(__dirname, '..', 'resources', 'liber-primus',
  'lp1-plaintext-reference.txt');
const referenceText = fs.readFileSync(referencePath, 'utf8');
const referenceBytes = Buffer.from(referenceText, 'utf8');
const referenceBlobSha1 = crypto.createHash('sha1')
  .update(Buffer.from('blob ' + referenceBytes.length + '\0'))
  .update(referenceBytes).digest('hex');
assert.equal(referenceBlobSha1, '8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d');
const referenceLines = referenceText.split(/\r?\n/)
  .filter((line) => {
    const s = line.trim();
    return s && !s.startsWith('#') && !s.startsWith('[') &&
      !/^[0-9a-f]{25,}$/iu.test(s);
  });
const translitTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const nativeReference = [];
for (const line of referenceLines) {
  for (const rawWord of line.split(/\s+/)) {
    const word = rawWord.toUpperCase()
      .replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S')
      .replace(/[^A-Z]/g, '');
    if (!word) continue;
    let i = 0;
    const encodedWord = [];
    while (i < word.length) {
      const token = translitTokens.find((t) => word.startsWith(t.s, i));
      assert(token, 'Unmapped solved-reference word: ' + word);
      encodedWord.push(token.i);
      i += token.s.length;
    }
    nativeReference.push(...encodedWord);
  }
}
assert.equal(nativeReference.length, 3249);
const native28 = nativeReference.filter((x) => x !== 28);
assert.equal(native28.length, 3228);
const nativeIoC28 = ioc28(native28);

// Same-length native windows for every possible zero-step plaintext symbol.
function nativeWindowFloorForLength(length) {
  let totalWindows = 0;
  const allValues = [];
  let floor = {minIoC28: Infinity};
  for (let special = 0; special < 29; special++) {
    const sequence = nativeReference.filter((x) => x !== special);
    const counts = Array(29).fill(0);
    let pairs = 0;
    for (let i = 0; i < length; i++) {
      const value = sequence[i];
      pairs += 2 * counts[value];
      counts[value]++;
    }
    for (let start = 0; start <= sequence.length - length; start++) {
      const value = 28 * pairs / (length * (length - 1));
      allValues.push(value);
      totalWindows++;
      if (value < floor.minIoC28) floor = {special, start, minIoC28: value};
      if (start < sequence.length - length) {
        const removed = sequence[start];
        counts[removed]--;
        pairs -= 2 * counts[removed];
        const added = sequence[start + length];
        pairs += 2 * counts[added];
        counts[added]++;
      }
    }
  }
  allValues.sort((a, b) => a - b);
  return {
    length, totalWindows, floor,
    p01IoC28: allValues[Math.floor((allValues.length - 1) * 0.01)],
    p05IoC28: allValues[Math.floor((allValues.length - 1) * 0.05)],
    medianIoC28: allValues[Math.floor((allValues.length - 1) * 0.5)]
  };
}
const nativeWindow75 = nativeWindowFloorForLength(75);
const nativeWindow220 = nativeWindowFloorForLength(220);
const nativeWindow295 = nativeWindowFloorForLength(295);
assert.equal(nativeWindow75.floor.special, 6);
assert.equal(nativeWindow220.floor.special, 11);
assert.equal(nativeWindow295.floor.special, 11);
assert(Math.abs(nativeWindow75.floor.minIoC28 - 1.2612612612612613) < 1e-12);
assert(Math.abs(nativeWindow220.floor.minIoC28 - 1.5423827314238274) < 1e-12);
assert(Math.abs(nativeWindow295.floor.minIoC28 - 1.5722356739305892) < 1e-12);
assert(chainCandidates[0].ioc28 < nativeWindow295.floor.minIoC28);
assert(maxP54.p54IoC28 < nativeWindow220.floor.minIoC28);
assert(maxP55.p55IoC28 < nativeWindow75.floor.minIoC28);

// Exact positive controls for both natural zero-step key-clock conventions.
const log15Map = chainKeyMaps.find((x) => x.name === 'log15');
assert(log15Map);
const positivePlain = native28.slice(0, 294);
positivePlain.splice(73, 0, 28);
assert.equal(positivePlain.length, 295);
const chainPositiveControls = [];
for (const consumeZeroSteps of [false, true]) {
  let keyIndex = 0;
  let previous = 7;
  const cipher = [previous];
  for (const plain of positivePlain) {
    if (plain === 28) {
      cipher.push(previous);
      if (consumeZeroSteps) keyIndex++;
      continue;
    }
    const keyValue = log15Map.key[keyIndex++];
    const step = 1 + mod28(plain + keyValue);
    previous = mod29(previous + step);
    cipher.push(previous);
  }
  keyIndex = 0;
  const recovered = [];
  for (let i = 1; i < cipher.length; i++) {
    const delta = mod29(cipher[i] - cipher[i - 1]);
    if (delta === 0) {
      recovered.push(28);
      if (consumeZeroSteps) keyIndex++;
      continue;
    }
    const keyValue = log15Map.key[keyIndex++];
    recovered.push(mod28((delta - 1) - keyValue));
  }
  assert.deepEqual(recovered, positivePlain);
  chainPositiveControls.push({
    consumeZeroSteps, plaintextRunes: positivePlain.length,
    ciphertextRunes: cipher.length, recoveredRunes: recovered.length,
    exact: true
  });
}
console.log(JSON.stringify({
  chainReceiver: 'C[i]=C[i-1]+step mod29; step=0 for one special plaintext symbol, otherwise 1+((sigma(P[i])+K[i]) mod28)',
  sourceKey: 'p54 red9 primitive quintic; first five red runes seed GF29 LFSR',
  seed, monicQuintic,
  lfsrRawSymbols: chainRawKey.length,
  lfsrZeroSymbols: chainRawKey.length - chainNonzeroKey.length,
  lfsrNonzeroSymbols: chainNonzeroKey.length,
  primitiveRoots,
  keySymbolMaps: chainKeyMaps.map((x) => x.name),
  originalTransitions: chainDeltas.length,
  originalZeroSteps: chainDeltas.filter((x) => x === 0).length,
  originalDecodedNonzeroSteps: chainDeltas.filter((x) => x !== 0).length,
  candidateCount: chainCandidates.length,
  nativeSolvedReferenceRunes: nativeReference.length,
  native28Runes: native28.length,
  native28IoC: nativeIoC28,
  nativeWindow75, nativeWindow220, nativeWindow295,
  best: chainCandidates[0],
  maxP54,
  maxP55,
  positiveControls: chainPositiveControls
}, null, 2));

console.log('p54 red9 factorization: (X-24)(X-19)^2 times quintic, exact');
console.log('p50 polynomial: double root X=24, exact; no unknown plaintext');
