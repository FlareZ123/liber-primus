'use strict';

/**
 * Original LP2 p29 13-word length near-crib from signed 2016 message.
 * Exhaust every null position consistent with six one-rune expansions,
 * arbitrary unknown GP29 periodic keys of period 1..32, both original
 * cipher/plaintext/word-relative key clocks, and direct/Atbash input.
 * A search-positive native GP29 plant detects source-correct period 7.
 * This is a bounded no-crib result, not decoded LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const originalSourceWords = signed.split(/\r?\n\r?\n/).slice(1).join('\n\n')
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .match(/[A-Za-z0-9]+/g).filter((token) => /^[A-Za-z]+$/.test(token));
assert.equal(originalSourceWords.length, 43);
const phrase = originalSourceWords.slice(16, 29);
assert.equal(phrase.join(' ').toUpperCase(),
  'ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR NUMBERS ARE THE');
const alphabet = new Map(corpus.translit.map((r, i) => [r, i]));
const digraphs = new Set(['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA']);

/** Native GP29 word encoder; ING is the single NG rune.
 * @param {string} input @returns {number[]} */
function encode(input) {
  const word = input.toUpperCase().replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < word.length;) {
    let key, width;
    if (word.slice(i, i + 3) === 'ING') {
      key = 'NG'; width = 3;
    } else if (digraphs.has(word.slice(i, i + 2))) {
      key = word.slice(i, i + 2); width = 2;
    } else { key = word[i]; width = 1; }
    const value = alphabet.get(key);
    assert(value !== undefined);
    result.push(value);
    i += width;
  }
  return result;
}
const plaintext = phrase.map(encode);
assert.deepEqual(plaintext.map((word) => word.length),
  [3, 2, 3, 4, 4, 2, 2, 4, 3, 4, 7, 3, 2]);

/** Original source parser: physical wraps are not lexical boundaries.
 * @param {string} input @returns {number[][]} */
function runeWords(input) {
  const out = [], rune = /[\u16A0-\u16FF]/u;
  let word = '';
  for (const ch of input.split('%').slice(0, 55).join('%')) {
    if (rune.test(ch)) word += ch;
    else if (ch === '/' || ch === '%' || /\s/u.test(ch)) continue;
    else if (word) {
      out.push([...word].map((r) => corpus.runes.indexOf(r)));
      word = '';
    }
  }
  if (word) out.push([...word].map((r) => corpus.runes.indexOf(r)));
  return out;
}
const allCipher = runeWords(transcription);
assert.equal(allCipher.length, 2896);
assert.equal(allCipher.flat().length, 12956);
const originalCipher = allCipher.slice(1594, 1607);
const extraMask = originalCipher.map((w, i) => w.length - plaintext[i].length);
assert.deepEqual(extraMask, [0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1]);
assert.deepEqual(originalCipher[3], [17, 12, 12, 4]);

/** @typedef {'cipher'|'plaintext'|'word'} Clock */
/** @typedef {{clock:Clock,atbash:boolean,period:number}} Hit */
/** Enumerate every insertion site and key-clock phase-consistency.
 * @param {number[][]} ciphertext @param {number[][]} plain
 * @returns {Hit[]} */
function allPeriodFits(ciphertext, plain) {
  const variants = ciphertext.map((word, w) => {
    if (word.length === plain[w].length) {
      return [word.map((v, j) => ({v, p: plain[w][j], position: j}))];
    }
    assert.equal(word.length, plain[w].length + 1);
    return word.map((_, skip) => {
      const pairs = [];
      for (let j = 0; j < word.length; j++) {
        if (j !== skip) pairs.push({
          v: word[j], p: plain[w][j - (j > skip ? 1 : 0)], position: j,
        });
      }
      return pairs;
    });
  });
  const startsCipher = [], startsPlain = [];
  let c = 0, p = 0;
  for (let w = 0; w < plain.length; w++) {
    startsCipher.push(c); startsPlain.push(p);
    c += ciphertext[w].length; p += plain[w].length;
  }
  const hits = [];
  for (const clock of /** @type {Clock[]} */ (['cipher','plaintext','word'])) {
    for (const atbash of [false, true]) {
      for (let period = 1; period <= 32; period++) {
        const key = new Int16Array(period).fill(-1);
        /** @param {number} w @returns {boolean} */
        function canFit(w) {
          if (w === variants.length) return true;
          for (const choices of variants[w]) {
            const added = [];
            let valid = true;
            for (let j = 0; j < choices.length; j++) {
              const {v, p, position} = choices[j];
              const clockIndex = clock === 'cipher' ? startsCipher[w] + position
                : clock === 'plaintext' ? startsPlain[w] + j : position;
              const keyPosition = clockIndex % period;
              const q = atbash ? 28 - p : p;
              const k = (v - q + 58) % 29;
              if (key[keyPosition] >= 0 && key[keyPosition] !== k) {
                valid = false; break;
              }
              if (key[keyPosition] < 0) {
                key[keyPosition] = k; added.push(keyPosition);
              }
            }
            if (valid && canFit(w + 1)) return true;
            for (const j of added) key[j] = -1;
          }
          return false;
        }
        if (canFit(0)) hits.push({clock, atbash, period});
      }
    }
  }
  return hits;
}
assert.equal(extraMask.filter((x) => x === 1).length, 6);
assert.equal(extraMask.reduce((prod, x, i) => prod *
  (x ? originalCipher[i].length : 1), 1), 4320);
const hits = allPeriodFits(originalCipher, plaintext);
assert.deepEqual(hits, []);
console.log('ORIGINAL six inserted-rune choices=4320,'
  + ' clock×atbash×period candidates=192, exact short-period hits=0');

/** Plant every authentic word shape, with one source-independent null at
 * the END of the same six marked words. The inserted glyph consumes cipher
 * clock but no plaintext-clock position.
 * @param {Clock} clock @param {boolean} atbash
 * @returns {number[][]} */
function plant(clock, atbash) {
  const key = [3, 1, 4, 1, 5, 9, 2], output = [];
  let globalCipher = 0, globalPlain = 0;
  for (let w = 0; w < plaintext.length; w++) {
    const coded = [];
    for (let j = 0; j < plaintext[w].length; j++) {
      const pos = clock === 'cipher' ? globalCipher
        : clock === 'plaintext' ? globalPlain : j;
      const value = atbash ? 28 - plaintext[w][j] : plaintext[w][j];
      coded.push((value + key[pos % key.length]) % 29);
      globalCipher++; globalPlain++;
    }
    if (extraMask[w]) {
      coded.push((7 + key[globalCipher % key.length]) % 29);
      globalCipher++;
    }
    output.push(coded);
  }
  return output;
}
for (const clock of /** @type {Clock[]} */ (['cipher','plaintext','word'])) {
  for (const atbash of [false, true]) {
    const candidate = allPeriodFits(plant(clock, atbash), plaintext);
    assert(candidate.some((h) =>
      h.clock === clock && h.atbash === atbash && h.period === 7));
    console.log('PLANTED ' + clock + ' atbash=' + atbash
      + ' period7 recovered');
  }
}
console.log('PASS 43 source GP runes, 49 original cipher runes, six literal'
  + ' insertion-site branches, 192 exact bounded inverse models,'
  + ' six native GP positive plants');
