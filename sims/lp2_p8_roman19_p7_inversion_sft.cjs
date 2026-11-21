'use strict';

/**
 * Original LP2 p8 first red word XIXM: Roman-number-to-GP29-index
 * and its adjacent p7 red field inverse. Read-only CommonJS, Node22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const p7 = source.pages[7].indices;
const p8 = source.pages[8].indices;

/** @param {number} n @returns {string} */
function roman(n) {
  assert.ok(Number.isInteger(n) && n >= 1 && n <= 28);
  const parts = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let output = '';
  for (const [value, digits] of parts) {
    while (n >= value) {
      n -= value;
      output += digits;
    }
  }
  return output;
}

/** @param {string} number @returns {number[]} */
function encodeRoman(number) {
  const runes = { I: 10, V: 1, X: 14 }; // solved native GP: V is written U
  return Array.from(number, letter => runes[letter]);
}

/** @param {number[]} a @param {number[]} b @returns {boolean} */
function matches(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

const p8FirstWord = p8.slice(0, 4);
const p7SecondRedWord = p7.slice(196, 200);
assert.deepStrictEqual(p8FirstWord, [14, 10, 14, 19]);
assert.deepStrictEqual(p7SecondRedWord, [22, 16, 2, 25]);
assert.equal(p8FirstWord.map(index => source.translit[index]).join(''), 'XIXM');

const romanNumber = 19;
assert.equal(roman(romanNumber), 'XIX');
assert.ok(matches(p8FirstWord.slice(0, 3), encodeRoman(roman(romanNumber))));
assert.equal(p8FirstWord[3], romanNumber);
const redInverseProduct = p7SecondRedWord.reduce(
  (product, value) => (product * value) % 29, 1
);
assert.equal(redInverseProduct, 26);
assert.equal((romanNumber * redInverseProduct) % 29, 1);
assert.equal(p7[p7.length - 1], romanNumber);

// Two fully frozen field readings of the *same* p8 source operand.
// 23 is p7's first red rune, 29 is the solved Gematria Primus alphabet size.
// The second original p8 red word is [1,14,19,5,2,13,3,17] and
// its complete GP29 product is exponent 3.
/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  for (let i = 0; i < exponent; i++) result = (result * base) % modulus;
  return result;
}
const originalRedP7Modulus = p7[194]; // first p7 red word starts 23,3
const firstRedP7Exponent = p7[195]; // same original field, 3
const thirdRedP7Generator = p7[200]; // third red word starts 5
const fourthRedP7Private = (p7[203] * p7[204]) % 29;
const secondRedP8Exponent = p8.slice(4, 12).reduce(
  (product, symbol) => (product * symbol) % 29, 1
);
assert.deepStrictEqual([
  originalRedP7Modulus, firstRedP7Exponent,
  thirdRedP7Generator, fourthRedP7Private, secondRedP8Exponent
], [23, 3, 5, 15, 3]);
assert.equal((fourthRedP7Private * secondRedP8Exponent) % 22, 1);
assert.equal(modPow(romanNumber, secondRedP8Exponent, 23), thirdRedP7Generator);
assert.equal(modPow(romanNumber, secondRedP8Exponent, 29), fourthRedP7Private);
assert.equal(modPow(thirdRedP7Generator, fourthRedP7Private, 23), romanNumber);

/**
 * Complete finite original-cipher scan for canonical Roman 1..28 followed
 * by the identical zero-based GP symbol. Freeze minimum Roman length 3.
 * No plaintext or secret key fitted.
 */
const templates = Array.from({ length: 28 }, (_, i) => i + 1)
  .filter(number => roman(number).length >= 3)
  .map(number => ({
    number, text: roman(number),
    symbols: encodeRoman(roman(number)).concat(number)
  }));
const hits = [];
for (const page of source.pages.filter(item => item.page < 56)) {
  for (let offset = 0; offset < page.indices.length; offset++) {
    for (const template of templates) {
      const original = page.indices.slice(
        offset, offset + template.symbols.length
      );
      if (matches(original, template.symbols)) {
        hits.push({
          page: page.page,
          offset,
          numeral: template.text,
          gpSymbolIndex: template.number
        });
      }
    }
  }
}
assert.equal(templates.length, 18);
assert.deepStrictEqual(hits, [
  { page: 8, offset: 0, numeral: 'XIX', gpSymbolIndex: 19 }
]);

// P7's five red products plus p8's self-described 19 are exactly one
// complete six-element orbit under the source-selected x => x^3 mod29.
// 3 and 19 are inverse exponents modulo 28, so cubing is bijective.
assert.equal((romanNumber * secondRedP8Exponent) % 28, 1);
const redWordProducts = [
  p7.slice(194, 196), p7.slice(196, 200), p7.slice(200, 203),
  p7.slice(203, 205), p7.slice(205, 208)
].map(word => word.reduce((product, symbol) => product * symbol % 29, 1));
assert.deepStrictEqual(redWordProducts, [11, 26, 8, 15, 2]);
const cubeOrbit = [2];
for (let index = 0; index < 6; index++) {
  cubeOrbit.push(modPow(cubeOrbit.at(-1), secondRedP8Exponent, 29));
}
assert.deepStrictEqual(cubeOrbit, [2, 8, 19, 15, 11, 26, 2]);
assert.deepStrictEqual(
  redWordProducts.concat(romanNumber).sort((a, b) => a - b),
  cubeOrbit.slice(0, 6).sort((a, b) => a - b)
);
for (const value of Array.from({ length: 29 }, (_, index) => index)) {
  assert.equal(modPow(modPow(value, 3, 29), romanNumber, 29), value);
}

/**
 * Two direct reversible source-selected cube-root/precedence decoders.
 * The preceding original rune for p8 black is the last red heading glyph.
 * @param {number[]} cipher
 * @param {number} first
 * @param {'delta-root'|'root-delta'} model
 * @returns {number[]}
 */
function decryptBody(cipher, first, model) {
  const output = [];
  let previous = first;
  for (const symbol of cipher) {
    const value = model === 'delta-root'
      ? modPow((symbol - previous + 29) % 29, 19, 29)
      : (modPow(symbol, 19, 29) - modPow(previous, 19, 29) + 29) % 29;
    output.push(value);
    previous = symbol;
  }
  return output;
}

/**
 * Exact inverse including original red-field IV.
 * @param {number[]} plain
 * @param {number} first
 * @param {'delta-root'|'root-delta'} model
 * @returns {number[]}
 */
function encryptBody(plain, first, model) {
  const output = [];
  let previous = first;
  for (const symbol of plain) {
    const value = model === 'delta-root'
      ? (previous + modPow(symbol, 3, 29)) % 29
      : modPow((modPow(previous, 19, 29) + symbol) % 29, 3, 29);
    output.push(value);
    previous = value;
  }
  return output;
}

/** @param {number[]} indices @returns {number} */
function coincidence(indices) {
  const counts = Array(29).fill(0);
  indices.forEach(index => { counts[index]++; });
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (indices.length * (indices.length - 1));
}

const body = p8.slice(12);
assert.equal(body.length, 243);
const originalFirst = p8[11];
const knownP57 = source.pages[57].indices;
const cubeRootReceivers = [];
for (const model of ['delta-root', 'root-delta']) {
  const decoded = decryptBody(body, originalFirst, model);
  assert.deepStrictEqual(encryptBody(decoded, originalFirst, model), body);
  const positive = Array.from({ length: body.length }, (_, index) =>
    knownP57[index % knownP57.length]
  );
  const plantedCipher = encryptBody(positive, originalFirst, model);
  assert.deepStrictEqual(decryptBody(plantedCipher, originalFirst, model), positive);
  cubeRootReceivers.push({
    model,
    originalIoC: Number(coincidence(decoded).toFixed(9)),
    sourceFIndexZeroCount: decoded.filter(index => index === 0).length,
    first44Transliterated: decoded.slice(0, 44)
      .map(index => source.translit[index]).join('')
  });
}
assert.ok(cubeRootReceivers.every(record => record.originalIoC < 0.04));

/**
 * A bounded five-level 3-ary tree cube-root inverse, motivated by the
 * original five p7 red words/dots, 243=3^5 black p8 runes, and visible roots.
 * Each axis contains disjoint three-symbol fibers. No fitted parameters.
 * @param {number[]} input
 * @param {number} axis
 * @param {number} weight
 * @returns {number[]}
 */
function inverseTreeAxis(input, axis, weight) {
  const step = 3 ** axis;
  return input.map((symbol, index) => {
    const siblingExists = Math.floor(index / step) % 3 > 0;
    const previous = siblingExists ? input[index - step] : 0;
    return modPow((symbol - weight * previous + 29 * 29) % 29, 19, 29);
  });
}

/** @param {number[]} plain @param {number} axis @param {number} weight @returns {number[]} */
function forwardTreeAxis(plain, axis, weight) {
  const step = 3 ** axis;
  const output = Array(plain.length);
  for (let index = 0; index < plain.length; index++) {
    const siblingExists = Math.floor(index / step) % 3 > 0;
    const previous = siblingExists ? output[index - step] : 0;
    output[index] = (modPow(plain[index], 3, 29) + weight * previous) % 29;
  }
  return output;
}

/** @param {number[]} cipher @param {number[]} weights @returns {number[]} */
function inverseTernaryTree(cipher, weights) {
  let result = cipher.slice();
  for (let axis = 4; axis >= 0; axis--) {
    result = inverseTreeAxis(result, axis, weights[axis]);
  }
  return result;
}

/** @param {number[]} plain @param {number[]} weights @returns {number[]} */
function forwardTernaryTree(plain, weights) {
  let result = plain.slice();
  for (let axis = 0; axis <= 4; axis++) {
    result = forwardTreeAxis(result, axis, weights[axis]);
  }
  return result;
}

const ternaryTreeReceivers = [];
for (const [name, weights] of [
  ['unkeyed-unit-fibers', [1, 1, 1, 1, 1]],
  ['p7-five-printed-product-fibers', redWordProducts]
]) {
  const decoded = inverseTernaryTree(body, weights);
  assert.deepStrictEqual(forwardTernaryTree(decoded, weights), body);
  const known = Array.from({ length: 243 }, (_, index) =>
    knownP57[index % knownP57.length]
  );
  assert.deepStrictEqual(
    inverseTernaryTree(forwardTernaryTree(known, weights), weights),
    known
  );
  ternaryTreeReceivers.push({
    name,
    weights,
    coincidence: Number(coincidence(decoded).toFixed(9)),
    first44Transliterated: decoded.slice(0, 44)
      .map(index => source.translit[index]).join('')
  });
}
assert.ok(ternaryTreeReceivers.every(record => record.coincidence < 0.04));

/**
 * A pure GP29 cube/root permutation keeps each multiplicative orbit invariant,
 * regardless of per-rune exponent selection or clock. Calibrate the necessary
 * condition on actual solved GP-native text, not synthetic English spellings.
 */
const reference = fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp1-plaintext-reference.txt'
), 'utf8');
const alphabet = new Map(source.translit.map((token, index) => [token, index]));
for (const [token, index] of [['K', 5], ['V', 1], ['Q', 5], ['Z', 15], ['ING', 21]]) {
  alphabet.set(token, index);
}
const sortedTokens = [...alphabet.keys()].sort((a, b) => b.length - a.length);

/** @param {string} latin @returns {number[]} */
function transliterateReference(latin) {
  const letters = latin.replace(/[^A-Z]/g, '');
  const result = [];
  for (let index = 0; index < letters.length;) {
    const token = sortedTokens.find(item => letters.startsWith(item, index));
    assert.ok(token, 'Unrecognized GP reference token');
    result.push(alphabet.get(token));
    index += token.length;
  }
  return result;
}

const parts = reference.split(/^### (\d+)\s*$/m);
const native = [];
for (let index = 1; index < parts.length; index += 2) {
  const pageNumber = Number(parts[index]);
  if (pageNumber === 16 || pageNumber === 56) continue;
  const text = parts[index + 1].split('\n')
    .filter(line => !line.trim().startsWith('[') && !line.trim().startsWith('#'))
    .join('\n');
  const encoded = transliterateReference(text);
  if (pageNumber === 57) assert.deepStrictEqual(encoded, knownP57);
  native.push(...encoded);
}
assert.equal(native.length, 3061);
const allUnknown = source.pages.filter(page => page.page < 56)
  .flatMap(page => page.indices);
assert.equal(allUnknown.length, 12956);
const cubeClasses = [
  [0], [1], [2, 8, 19, 15, 11, 26],
  [3, 27, 21, 10, 14, 18], [4, 6, 13, 22, 5, 9],
  [7, 24, 20, 25, 23, 16], [12, 17], [28]
];
const cubeClassOf = new Map();
cubeClasses.forEach((orbit, orbitIndex) => {
  orbit.forEach(symbol => {
    assert.ok(!cubeClassOf.has(symbol));
    cubeClassOf.set(symbol, orbitIndex);
  });
});
assert.equal(cubeClassOf.size, 29);
for (let symbol = 0; symbol < 29; symbol++) {
  assert.equal(cubeClassOf.get(modPow(symbol, 3, 29)), cubeClassOf.get(symbol));
  assert.equal(cubeClassOf.get(modPow(symbol, 19, 29)), cubeClassOf.get(symbol));
}
/** @param {number[]} values @returns {number[]} */
function orbitCounts(values) {
  const result = Array(cubeClasses.length).fill(0);
  values.forEach(value => { result[cubeClassOf.get(value)]++; });
  return result;
}
const nativeCubeOrbitCounts = orbitCounts(native);
const originalUnknownCubeOrbitCounts = orbitCounts(allUnknown);
const originalP8CubeOrbitCounts = orbitCounts(body);
assert.deepStrictEqual(nativeCubeOrbitCounts, [51, 161, 576, 881, 562, 752, 44, 34]);
assert.deepStrictEqual(originalUnknownCubeOrbitCounts,
  [458, 450, 2637, 2750, 2688, 2669, 844, 460]);
assert.deepStrictEqual(originalP8CubeOrbitCounts, [8, 10, 48, 50, 59, 45, 14, 9]);
const exactCubeOrbitClassInvariant = {
  cubeClasses,
  solvedNativeGpLength: native.length,
  originalUnknownGpLength: allUnknown.length,
  originalP8BlackLength: body.length,
  nativeCubeOrbitCounts,
  originalUnknownCubeOrbitCounts,
  originalP8CubeOrbitCounts,
  actualSolvedP57ControlMatchedAtEveryIndex: true,
  conclusion: 'Every per-rune cube/root map preserves its original orbit class and cannot alter these original class counts toward solved-native GP English'
};

console.log(JSON.stringify({
  source: 'Original LP2 p8 opening red XIXM and p7 second red product',
  p8RomanNumber: romanNumber,
  selfCheckingGpSymbol: 'M',
  p7RedSecondWordProductMod29: redInverseProduct,
  multiplicativeInverseIdentity: '19 * 26 mod 29 = 1',
  p8SecondRedWordProductExponent: secondRedP8Exponent,
  doubleFieldPower23: modPow(romanNumber, secondRedP8Exponent, 23),
  doubleFieldPower29: modPow(romanNumber, secondRedP8Exponent, 29),
  dhGroupInverseExponent: '15 * 3 mod 22 = 1',
  gp29CubeInverseExponent: '19 * 3 mod 28 = 1',
  red5ProductsAndMissingRoman19CubeOrbit: cubeOrbit,
  unchangedOriginalP8Black243TwoReversibleReceivers: cubeRootReceivers,
  unchangedOriginalP8Black243FiveLevelRootTreeReceivers: ternaryTreeReceivers,
  exactCubeOrbitClassInvariant,
  originalUnknownRunes: source.pages
    .filter(page => page.page < 56)
    .reduce((sum, page) => sum + page.indices.length, 0),
  canonicalRomanTemplatesLengthAtLeast3: templates.length,
  matchingOriginalOccurrences: hits,
  interpretation: 'Original numeric/index clue, not decrypted unknown plaintext'
}, null, 2));
