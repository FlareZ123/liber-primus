'use strict';
/**
 * Lossless substitution-isomorphism crib scan over the original LP2 ciphertext.
 * Searches every rune offset against six genuinely clear LP1 passages,
 * clear p57, and original 2012–2016 Cicada PGP-clearsigned source prose,
 * allowing EVERY possible one-to-one 29-rune alphabet.
 * This is a complete all-secret test for contiguous monoalphabetic reuse of
 * those specific known texts, including non-word-aligned and cross-page starts.
 *
 * Run on Windows 11 with Node 22:
 *   node sims/lp2_parameterized_crib_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
assert.equal(runeIndex.size, 29);
const pages = corpus.pages.filter(page => page.page < 56 && page.indices.length > 0);
assert.equal(pages.length, 55);
const original = pages.flatMap(page => page.indices);
assert.equal(original.length, 12956);
const lp1Pages = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const known = [3, 8, 9, 10, 11, 14].map(page => ({
  name: 'LP1p' + page,
  values: [...lp1Pages[page]].filter(rune => runeIndex.has(rune))
    .map(rune => runeIndex.get(rune))
}));
assert.deepEqual(known.map(item => item.values.length),
  [157, 187, 207, 192, 169, 89]);
known.push({name: 'LP2p57', values: corpus.pages[57].indices});
assert.equal(known[6].values.length, 95);

/**
 * Convert literal author-signed prose to its source-native GP29 rune spelling.
 * Exact reference words come from original signed message, not decrypted LP2.
 * These source orthography conventions are established in solved LP1/p57.
 * @param {string} text
 * @returns {number[]}
 */
function nativeSignedProse(text) {
  const spellings = corpus.translit.map((symbol, index) => ({symbol, index}))
    .sort((a, b) => b.symbol.length - a.symbol.length);
  const runes = [];
  for (const unaltered of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = unaltered.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let i = 0; i < word.length;) {
      const token = spellings.find(entry => word.startsWith(entry.symbol, i));
      assert.ok(token, 'No GP spelling for ' + unaltered);
      runes.push(token.index);
      i += token.symbol.length;
    }
  }
  return runes;
}
/**
 * Original inline prose between the PGP clearsigned wrapper and signature.
 * Remove the one hostname and numeric signature identifier, which are not
 * native GP29 words. The actual signed prose remains in original order.
 * @param {string} message
 * @returns {number[]}
 */
function signedProse(message) {
  assert.ok(message.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
  const signature = '-----BEGIN PGP SIGNATURE-----';
  assert.ok(message.includes(signature));
  const beforeSignature = message.split(signature)[0].replace(/\r\n/g, '\n');
  const body = beforeSignature.split('\n\n').slice(1).join('\n\n')
    .split('- -----BEGIN PGP MESSAGE-----')[0];
  return nativeSignedProse(body
    .replace(/\b[a-z0-9]{16}\.onion\b/gi, ' ')
    .replace(/\b3301\b/g, ' '));
}


known.push({name: 'Signed2016', values:
  signedProse(read('resources/historical/cicada2016-4gq25-outguess.asc'))});
known.push({name: 'Signed2014', values:
  signedProse(read('resources/historical/cicada2014-stage11-message.asc'))});
assert.deepEqual(known.slice(7).map(item => item.values.length), [177, 65]);
const earlySigned = [
  ['Signed2012Countdown', 'cicada2012-countdown-message.asc'],
  ['Signed2012Midi', 'cicada2012-midi-email.asc'],
  ['Signed2013First', 'cicada2013-first-onion-hello.asc'],
  ['Signed2013Forest', 'cicada2013-forest-clue.asc'],
  ['Signed2013Second', 'cicada2013-second-onion-everything-you-need.asc'],
  ['Signed2013Icmp', 'cicada2013-second-onion-icmp-echo.asc'],
  ['Signed2014Stage09', 'cicada2014-stage09-first-jpeg-recovered.asc']
];
for (const [name, filename] of earlySigned) {
  known.push({name, values:
    signedProse(read('resources/historical/' + filename))});
}
assert.deepEqual(known.slice(9).map(item => item.values.length),
  [73, 335, 43, 49, 91, 30, 167]);
assert.deepEqual(nativeSignedProse('MEANING'), [19, 28, 9, 21]);

/**
 * Two equally long substrings have identical equality patterns iff there is a
 * bijective alphabet map between their distinct rune values. Epoch-stamped
 * maps avoid allocation per starting pair and permit complete all-offset scans.
 * @param {number[]} source Original ciphertext
 * @param {number[]} reference Known clear GP rune text
 * @returns {{length:number,originalOffset:number,referenceOffset:number,pairs:number}}
 */
function longestIsomorphic(source, reference) {
  const seenSource = new Int32Array(29);
  const seenRef = new Int32Array(29);
  const toRef = new Int32Array(29);
  const toSource = new Int32Array(29);
  let epoch = 0;
  let bestLength = 0, bestSource = -1, bestReference = -1;
  for (let a = 0; a < source.length; a++) {
    for (let b = 0; b < reference.length; b++) {
      epoch++;
      let length = 0;
      while (a + length < source.length && b + length < reference.length) {
        const x = source[a + length], y = reference[b + length];
        if (seenSource[x] !== epoch && seenRef[y] !== epoch) {
          seenSource[x] = epoch;
          seenRef[y] = epoch;
          toRef[x] = y;
          toSource[y] = x;
        } else if (seenSource[x] !== epoch || seenRef[y] !== epoch ||
          toRef[x] !== y || toSource[y] !== x) {
          break;
        }
        length++;
      }
      if (length > bestLength) {
        bestLength = length;
        bestSource = a;
        bestReference = b;
      }
    }
  }
  return {length: bestLength, originalOffset: bestSource,
    referenceOffset: bestReference, pairs: source.length * reference.length};
}

/**
 * GP29 source-native literal-F substitution with ciphertext-F collision:
 * plaintext F copies unchanged; non-F runes use an arbitrary one-to-one
 * secret map, which may map one additional non-F rune to ciphertext F.
 * @param {number[]} source
 * @param {number[]} reference
 * @returns {{length:number,originalOffset:number,referenceOffset:number,pairs:number}}
 */
function longestTransparentF(source, reference) {
  const seenPlain = new Int32Array(29);
  const seenCipher = new Int32Array(29);
  const toCipher = new Int32Array(29);
  let epoch = 0, best = 0, from = -1, at = -1;
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < reference.length; j++) {
      epoch++;
      let n = 0;
      while (i + n < source.length && j + n < reference.length) {
        const c = source[i + n], p = reference[j + n];
        if (p === 0) {
          if (c !== 0) break;
        } else if (seenPlain[p] !== epoch) {
          if (seenCipher[c] === epoch) break;
          seenPlain[p] = epoch;
          seenCipher[c] = epoch;
          toCipher[p] = c;
        } else if (toCipher[p] !== c) break;
        n++;
      }
      if (n > best) { best = n; from = i; at = j; }
    }
  }
  return {length:best, originalOffset:from,referenceOffset:at,
    pairs:source.length*reference.length};
}

/**
 * Canonical first-occurrence pattern, invariant under any bijection.
 * @param {number[]} values @param {number} start @param {number} n
 * @returns {string}
 */
function pattern(values, start, n) {
  const labels = new Int8Array(29).fill(-1);
  let next = 0, signature = '';
  for (let j = 0; j < n; j++) {
    const glyph = values[start + j];
    if (labels[glyph] < 0) labels[glyph] = next++;
    signature += String.fromCharCode(65 + labels[glyph]);
  }
  return signature;
}

/**
 * An independent all-offset search for within-page rune-relabelled repeats.
 * The first occurrence is stored; duplicate windows count once per later site.
 * @param {number} length
 * @returns {{length:number,repeatedWindows:number,crossPageWindows:number}}
 */
function repeatedWindows(length) {
  const seen = new Map();
  let repeated = 0, crossPage = 0;
  for (const page of pages) {
    const text = page.indices;
    for (let start = 0; start + length <= text.length; start++) {
      const id = pattern(text, start, length);
      const previous = seen.get(id);
      if (previous === undefined) seen.set(id, page.page);
      else {
        repeated++;
        if (previous !== page.page) crossPage++;
      }
    }
  }
  return {length, repeatedWindows: repeated, crossPageWindows: crossPage};
}

const observed = known.map(reference => ({name: reference.name,
  ...longestIsomorphic(original, reference.values)}));
assert.deepEqual(observed.map(row => row.length), [16, 15, 15, 16, 16, 15, 15, 15, 15, 16, 16, 15, 14, 14, 12, 16]);
const transparentObserved = known.map(reference => ({name: reference.name,
  ...longestTransparentF(original, reference.values)}));
assert.deepEqual(transparentObserved.map(row => row.length),
  [16, 15, 15, 16, 16, 15, 14, 15, 14, 14, 16, 14, 14, 14, 12, 15]);
const sourceOffsets = [];
let cursor = 0;
for (const page of pages) {
  sourceOffsets.push({page: page.page, first: cursor, last: cursor + page.indices.length});
  cursor += page.indices.length;
}
for (const row of observed) {
  const page = sourceOffsets.find(s => row.originalOffset >= s.first && row.originalOffset < s.last);
  assert.ok(page);
  row.physicalPage = page.page;
  row.pageOffset = row.originalOffset - page.first;
}
const self = [15, 18, 20, 22].map(repeatedWindows);
assert.deepEqual(self.map(row => row.repeatedWindows), [2519, 238, 17, 0]);
assert.deepEqual(self.map(row => row.crossPageWindows), [2481, 234, 15, 0]);

// Fully specified positive: implant a native 60-rune clear p57 excerpt under
// a complete secret 29-rune permutation, then find it without knowing the key.
const planted = original.slice();
const plantedAt = 1000;
for (let j = 0; j < 60; j++)
  planted[plantedAt + j] = (7 * known[6].values[j] + 3) % 29;
const positive = longestIsomorphic(planted, known[6].values);
assert.ok(positive.length >= 60);
assert.equal(positive.originalOffset, plantedAt);
assert.equal(positive.referenceOffset, 0);

// The p57 source excerpt has real F at original offsets 33 and 59.
const plantedTransparent = original.slice();
for (let j = 0; j < 60; j++) {
  const p = known[6].values[j];
  plantedTransparent[plantedAt+j] = p===0 ? 0 : (7*p+3)%29;
}
assert.equal(plantedTransparent[plantedAt+33],0);
assert.equal(plantedTransparent[plantedAt+59],0);
const transparentPositive=longestTransparentF(plantedTransparent,known[6].values);
assert.ok(transparentPositive.length>=60);
assert.equal(transparentPositive.originalOffset,plantedAt);
assert.equal(transparentPositive.referenceOffset,0);

console.log(JSON.stringify({
  status: 'All-original exact all-secret crib attempt: no unknown plaintext recovered',
  scope: {unknownRunes: original.length, unknownPhysicalPages: pages.length,
    knownReferenceRunes: known.reduce((s, p) => s + p.values.length, 0),
    testedStartPairs: observed.reduce((s, p) => s + p.pairs, 0),
    acrossPrintedWordsAndPhysicalPageSeams: true},
  knownSubstitutionIsomorphism: observed,
  originalCrossPageCribCeiling: Math.max(...observed.map(item => item.length)),
  sourceNativeTransparentFIsomorphism: transparentObserved,
  transparentFLongestOriginalRunes:
    Math.max(...transparentObserved.map(item => item.length)),
  unknownWithinPageRepeats: self,
  positive: {plantedRunes: 60, insertionOffset: plantedAt,
    recoveredIsomorphismLength: positive.length,
    recoveredInsertionOffset: positive.originalOffset,
    recoveredReferenceOffset: positive.referenceOffset},
  transparentFPositive: {plantedRunes:60,
    recoveredIsomorphismLength:transparentPositive.length,
    recoveredInsertionOffset:transparentPositive.originalOffset,
    recoveredReferenceOffset:transparentPositive.referenceOffset},
  conclusion: 'No 17-rune or longer original LP2 passage is a fixed bijective or native literal-F-transparent substitution of any contiguous passage in six clear LP1 pages, clear p57, or any of nine original Cicada clearsigned 2012–2016 source messages. All page-local unknown-to-unknown equality patterns have unique signatures at length 22. These are necessary-condition exclusions for identical typed plaintext under a single bijection, not universal decryptions or evidence against changing keys, transposition, or novel plaintext.'
}, null, 2));
