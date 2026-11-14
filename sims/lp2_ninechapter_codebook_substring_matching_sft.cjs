'use strict';

/**
 * LP2 nine-chapter variable-length codebook all-key necessary-condition SFT.
 *
 * Run with Node.js 22 from any directory. This reads existing source fixtures,
 * logs every original and control decision, and writes no files.
 *
 * Model: each of nine image-defined chapters has one arbitrary injective,
 * nonempty, fixed rune -> plaintext-string substitution. Each printed word
 * boundary remains fixed; punctuation and cross-page word carries remain.
 * No assumptions are made about the length of the rune codewords.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const runes = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const runeSet = new Set(runes);
const chapterCuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const expectedWords = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const expectedSingletonTypes = [5, 7, 9, 12, 5, 8, 9, 11, 2];
const codewords = [...'abcdefghijklmnopqrstuvwxyz'].filter((x) => x !== 'q').concat(['qu', 'qa', 'qe', 'qi']);
assert.equal(codewords.length, 29);
assert.equal(new Set(codewords).size, 29);
assert.ok(codewords.every((x, i) => codewords.every((y, j) => i === j || !y.startsWith(x)));

/**
 * @typedef {{w:string, start:number}} PositionedWord
 * @typedef {{s:string,n:number,p:number,q:number,m:number,a:number}} Demand
 */

/** @returns {PositionedWord[]} */
function originalWords() {
  const source = read('resources/liber-primus/lp2-transcription.txt');
  const words = [];
  let word = '';
  let start = 0;
  let pos = 0;
  for (const char of source) {
    if (runeSet.has(char)) {
      if (pos === 12956) break;
      if (!word) start = pos;
      word += char;
      pos += 1;
    } else if ('-.$&'.includes(char) && word) {
      words.push({w:word, start});
      word = '';
    }
  }
  if (word) words.push({w:word, start});
  assert.equal(pos, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(({w}) => w.length === 1).length, 83);
  return words;
}

/** @param {string[]} words @returns {Demand[]} */
function demands(words) {
  const singles = [...new Set(words.filter((word) => word.length === 1))];
  return singles.map((s) => {
    let n = 0, p = 0, q = 0, m = 0, a = 0;
    for (const word of words) {
      if (word === s) {
        n++;
        continue;
      }
      if (word.length === 1) continue;
      const prefix = word.startsWith(s);
      const suffix = word.endsWith(s);
      const middle = word.slice(1, -1).includes(s);
      p += Number(prefix);
      q += Number(suffix);
      m += Number(middle);
      a += Number(prefix || suffix || middle);
    }
    return {s,n,p,q,m,a};
  });
}

/**
 * Necessary condition under all injective fixed chapter codebooks.
 * Each cipher singleton rune must map to one distinct complete plaintext
 * word with enough prefix/suffix/interior/occurrence opportunities.
 *
 * @param {Demand[]} needed
 * @param {string[]} nativeWords
 * @returns {{matched:number, required:number, candidateEdges:number}}
 */
function maximumCompatibleMatching(needed, nativeWords) {
  const profiles = [];
  for (const s of new Set(nativeWords)) {
    if (!s) continue;
    let n = 0, p = 0, q = 0, m = 0, a = 0;
    for (const word of nativeWords) {
      if (word === s) {
        n++;
        continue;
      }
      if (word.length <= s.length) continue;
      const prefix = word.startsWith(s);
      const suffix = word.endsWith(s);
      const middle = word.slice(1, -1).includes(s);
      p += Number(prefix);
      q += Number(suffix);
      m += Number(middle);
      a += Number(prefix || suffix || middle);
    }
    profiles.push({n,p,q,m,a});
  }
  const links = needed.map((target) => profiles.flatMap((profile, i) =>
    profile.n >= target.n &&
    profile.p >= target.p &&
    profile.q >= target.q &&
    profile.m >= target.m &&
    profile.a >= target.a ? [i] : []
  ));
  const occupied = new Int32Array(profiles.length).fill(-1);

  /** @param {number} left @param {Uint8Array} seen @returns {boolean} */
  function augment(left, seen) {
    for (const right of links[left]) {
      if (seen[right]) continue;
      seen[right] = 1;
      if (occupied[right] === -1 || augment(occupied[right], seen)) {
        occupied[right] = left;
        return true;
      }
    }
    return false;
  }

  let matched = 0;
  for (let i = 0; i < needed.length; i++) {
    if (augment(i, new Uint8Array(profiles.length))) matched++;
  }
  return {matched,required:needed.length,candidateEdges:links.reduce((a, x) => a + x.length, 0)};
}

/** @param {string} input @returns {string[]} */
function englishWords(input) {
  return input.toLowerCase().match(/[a-z]+/g) || [];
}

/** @returns {{name:string, words:string[], windows:number}[]} */
function sources() {
  const old = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
  const alphabet = [...old.positiveControlAlphabet];
  const translit = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
  let offset = 0;
  const beowulf = [];
  for (const length of old.allSourceGpWordLengths) {
    const encoded = old.sourceGpBase29.slice(offset, offset + length);
    assert.equal(encoded.length, length);
    offset += length;
    beowulf.push([...encoded].map((letter) => {
      const i = alphabet.indexOf(letter);
      assert.ok(i >= 0 && i < 29);
      return translit[i].toLowerCase();
    }).join(''));
  }
  assert.equal(offset, 48012);
  assert.equal(beowulf.length, 10885);

  return [
    {name:'Gibran',words:englishWords(read('resources/control/gibran_prophet_58585.txt')),windows:32},
    {name:'Emerson',words:englishWords(read('resources/control/emerson_essays_2944.txt')),windows:32},
    {name:'Shakespeare',words:englishWords(read('resources/control/shakespeare_first300k.txt')),windows:32},
    {name:'Beowulf OE (corrected GP)',words:beowulf,windows:12}
  ];
}

/** @param {number[]} lengths @param {string[]} words @returns {string[][]} */
function chop(lengths, words) {
  let offset = 0;
  return lengths.map((length) => {
    const chunk = words.slice(offset, offset + length);
    assert.equal(chunk.length, length);
    offset += length;
    return chunk;
  });
}

/** @returns {number} */
function nextRandomFactory() {
  // Separate deterministic seed per run, independent of LP2 ciphertext.
  let seed = 6112026;
  return function nextRandom() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
}

/** @param {string} plain @param {Map<string,string>} codeToRune @returns {string} */
function encodeWord(plain, codeToRune) {
  let out = '';
  for (let i = 0; i < plain.length;) {
    const token = plain[i] === 'q' ? plain.slice(i, i + 2) : plain[i];
    assert.ok(codeToRune.has(token), 'Unencodable plaintext token: ' + token);
    out += codeToRune.get(token);
    i += token.length;
  }
  return out;
}

/**
 * @param {string[][]} nativeChapters
 * @param {() => number} random
 * @returns {{chapter:number,required:number,matched:number,sourceRunes:number,multiletterSymbols:number}[]}
 */
function plant(nativeChapters, random) {
  return nativeChapters.map((plain, chapter) => {
    const perm = Array.from({length:29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    const codeToRune = new Map(codewords.map((code, i) => [code, runes[perm[i]]]));
    const runeToCode = new Map([...codeToRune].map(([code, rune]) => [rune, code]));
    assert.equal(codeToRune.size, 29);
    assert.equal(runeToCode.size, 29);
    const coded = plain.map((word) => encodeWord(word, codeToRune));
    const decoded = coded.map((word) => [...word].map((rune) => runeToCode.get(rune)).join(''));
    assert.deepEqual(decoded, plain, 'Exact positive decoder round-trip in chapter ' + chapter);
    const condition = maximumCompatibleMatching(demands(coded), plain);
    assert.equal(condition.matched, condition.required);
    return {
      chapter, required:condition.required, matched:condition.matched,
      sourceRunes:coded.reduce((sum, word) => sum + word.length, 0),
      multiletterSymbols:coded.reduce((sum, word) => sum + [...word].filter((rune) =>
        runeToCode.get(rune).length > 1).length, 0)
    };
  });
}

function main() {
  const positions = originalWords();
  const original = chapterCuts.slice(0, -1).map((start, i) =>
    positions.filter((word) => word.start >= start && word.start < chapterCuts[i + 1])
      .map((word) => word.w)
  );
  const lengths = original.map((c) => c.length);
  assert.deepEqual(lengths, expectedWords);
  const required = original.map(demands);
  assert.deepEqual(required.map((c) => c.length), expectedSingletonTypes);
  assert.equal(required.flat().length, 68);
  console.log('Original physical LP2: 12956 runes, 2896 words, 9 visible chapters');
  console.log('Cipher singleton types by chapter:', required.map((x) => x.length).join(', '));

  const allSources = sources();
  const expectedBest = [
    [2,2,3,3,2,2,3,2,2],
    [1,2,1,2,2,2,2,2,2],
    [2,3,4,5,2,3,4,4,2],
    [0,1,1,1,0,1,1,1,0]
  ];
  const expectedMaxTotal = [9,7,20,3];
  for (let sourceIndex = 0; sourceIndex < allSources.length; sourceIndex++) {
    const source = allSources[sourceIndex];
    const maxStart = source.words.length - positions.length;
    assert.ok(maxStart >= 0);
    const best = Array(9).fill(0), full = Array(9).fill(0);
    let maxTotal = 0, maxTotalOffset = -1;
    for (let sampleIndex = 0; sampleIndex < source.windows; sampleIndex++) {
      const offset = Math.floor(sampleIndex * maxStart / (source.windows - 1));
      const native = chop(lengths, source.words.slice(offset, offset + positions.length));
      const scores = native.map((chapter, j) => {
        const result = maximumCompatibleMatching(required[j], chapter);
        best[j] = Math.max(best[j], result.matched);
        if (result.matched === result.required) full[j]++;
        return result.matched;
      });
      const total = scores.reduce((a, b) => a + b, 0);
      if (total > maxTotal) {
        maxTotal = total;
        maxTotalOffset = offset;
      }
    }
    assert.deepEqual(best, expectedBest[sourceIndex]);
    assert.equal(maxTotal, expectedMaxTotal[sourceIndex]);
    assert.ok(full.slice(0, 8).every((n) => n === 0));
    console.log(
      source.name + ': ' + source.windows + ' windows; best singleton matches/chapter ' +
      best.join(',') + '; full compatible windows/chapter ' + full.join(',') +
      '; best total ' + maxTotal + '/68 at word offset ' + maxTotalOffset
    );
  }

  const random = nextRandomFactory();
  for (let sourceIndex = 0; sourceIndex < allSources.length; sourceIndex++) {
    const source = allSources[sourceIndex];
    const start = 100 + sourceIndex * 230;
    const native = chop(lengths, source.words.slice(start, start + positions.length));
    const result = plant(native, random);
    assert.equal(result.length, 9);
    assert.ok(result.every((x) => x.matched === x.required));
    console.log('Reversible prefix-free planted ' + source.name + ': ' +
      result.map((x) => x.matched + '/' + x.required).join(', ') +
      '; multi-letter codeword uses ' +
      result.reduce((sum, x) => sum + x.multiletterSymbols, 0));
  }
  console.log('PASS: Original fails the necessary source-native condition in every of 108 windows; ' +
    'all 36 independently keyed chapter plants decode exactly and pass.');
}

main();
