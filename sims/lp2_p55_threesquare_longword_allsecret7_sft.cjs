'use strict';

/**
 * Test the original 13-rune p55 word against the unconstrained seven-key
 * original 2014 middle magic-square row. Both known GP native spelling and
 * deliberately letter-spelled GP are tested, with the original transparent
 * plaintext-F rule included as a distinct decoder mode.
 *
 * This is an exact NECESSARY word-level gate for any independent secret
 * numerical source-row map used as additive GF29 shifts with a 7-key clock.
 * Distinct source row numerals are allowed arbitrarily chosen shift values.
 * A phase-keyed 29-letter substitution is a larger family and not excluded.
 *
 * Windows 11, Node.js 22, single read-only test, builtin libraries only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const frequencyWords = read('resources/control/english_wordfreq_textblob.txt')
  .match(/^[a-z]+/gmi) || [];
const mod = value => ((value % 29) + 29) % 29;

const magicSquareFile = read('resources/cicada2014-openpuff-magic-squares.txt');
const blocks = magicSquareFile.trim().split(/\r?\n\s*\r?\n/);
const squares = blocks.map(block => block.trim().split(/\r?\n/)
  .map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(square => [square.length, square[0].length]),
  [[5, 5], [7, 7], [5, 5]]);
const squareRows = squares.flat();
assert.equal(squareRows.length, 17);
const selectedSquareRow = squareRows[7];
assert.deepEqual(selectedSquareRow, [456,232,121,114,72,23,15]);
assert.equal(new Set(selectedSquareRow).size, 7);

const runeIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const originalPage55 = transcript.split('%')[54];
const words = [];
let currentWord = [];
for (const char of originalPage55) {
  if (runeIndex.has(char)) currentWord.push(runeIndex.get(char));
  else if ('-.$&§'.includes(char) && currentWord.length) {
    words.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) words.push(currentWord);
assert.deepEqual(words.map(w => w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(words.flat(), gp.pages[55].indices);
const actualCipher = words[7];
assert.deepEqual(actualCipher,
  [17,28,0,14,10,19,1,5,13,8,21,20,12]);

const nativeTokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const singleLetters = new Map(gp.translit.map((s, i) => [s, i]));

/** @returns {number[]} GP29 indices */
function encodeWord(raw, mode) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < word.length;) {
    if (mode === 'native' && word.startsWith('ING', i)) {
      result.push(21);
      i += 3;
    } else if (mode === 'native' && word.startsWith('IO', i)) {
      result.push(27);
      i += 2;
    } else if (mode === 'letter') {
      const letter = singleLetters.get(word[i]);
      assert.notEqual(letter, undefined);
      result.push(letter);
      i++;
    } else {
      const token = nativeTokens.find(t => word.startsWith(t.s, i));
      assert.ok(token, word);
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}

/** @returns {{ok:boolean, reason:string, assignments:number, requiredKey:number[]}} */
function fitPeriod7(cipher, plain, transparentF) {
  let clock = 0;
  const assignments = Array(7).fill(null);
  for (let i = 0; i < cipher.length; i++) {
    if (transparentF && plain[i] === 0) {
      if (cipher[i] !== 0) {
        return { ok: false, reason: 'forbidden literal F',
          assignments: assignments.filter(v => v !== null).length,
          requiredKey: assignments };
      }
      continue;
    }
    const phase = clock++ % 7;
    const needed = mod(cipher[i] - plain[i]);
    if (assignments[phase] !== null && assignments[phase] !== needed) {
      return { ok: false, reason: 'same 7-key phase requires different shift',
        assignments: assignments.filter(v => v !== null).length,
        requiredKey: assignments };
    }
    assignments[phase] = needed;
  }
  return {ok: true, reason: 'compatible', assignments:
    assignments.filter(v => v !== null).length, requiredKey: assignments};
}

/** Exact artificial encryption using a seven-value key and the p56 F rule. */
function plant(plain, key, transparentF) {
  let clock = 0;
  return plain.map(p => {
    if (transparentF && p === 0) return 0;
    return mod(p + key[clock++ % 7]);
  });
}
const secret = [2,7,12,17,22,27,3];
const positive = {};
for (const spelling of ['native', 'letter']) {
  positive[spelling] = {};
  for (const word of ['transparently', 'significantly']) {
    const plain = encodeWord(word, spelling);
    assert.equal(plain.length, 13);
    for (const fSkip of [false, true]) {
      const cipher = plant(plain, secret, fSkip);
      const fit = fitPeriod7(cipher, plain, fSkip);
      assert.ok(fit.ok);
      assert.deepEqual(fit.requiredKey, secret);
      positive[spelling][word + (fSkip ? ' / literal F' : ' / all consumed')] =
        { trueKeyRecoveredExactly: true, runeLength: 13,
          plaintextFCount: plain.filter(x => x === 0).length };
    }
  }
}

const results = {};
for (const spelling of ['native', 'letter']) {
  results[spelling] = {};
  const candidates = frequencyWords.map(word => ({
    word, plain: encodeWord(word, spelling)
  })).filter(entry => entry.plain.length === 13);
  for (const fSkip of [false, true]) {
    const matches = [];
    const failureCounts = {};
    for (const candidate of candidates) {
      const fit = fitPeriod7(actualCipher, candidate.plain, fSkip);
      if (fit.ok) matches.push(candidate.word);
      else failureCounts[fit.reason] = (failureCounts[fit.reason] || 0) + 1;
    }
    assert.equal(matches.length, 0);
    results[spelling][fSkip ? 'literal F' : 'all consumed'] = {
      dictionaryEntries13: candidates.length,
      matches, failureCounts
    };
  }
}
assert.equal(results.native['literal F'].dictionaryEntries13, 382);
assert.equal(results.letter['literal F'].dictionaryEntries13, 549);
assert.deepEqual(results.native['literal F'].failureCounts, {
  'forbidden literal F': 38,
  'same 7-key phase requires different shift': 344
});
assert.deepEqual(results.letter['literal F'].failureCounts, {
  'forbidden literal F': 53,
  'same 7-key phase requires different shift': 496
});

// Independently sourced Latin Vulgate is a separate source-language control.
// Its native-GP words are stored as 29-valued alphanumeric strings, with
// original word boundaries preserved (and no cross-word rune contraction).
const latinSource = read('resources/control/latin-vulgate-gp-wholewords.txt');
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinCodes = [...new Set(latinSource.split(/\r?\n/)
  .filter(line => /^[0-9A-S]{13}$/.test(line)))];
assert.equal(latinCodes.length, 153);
const latinResults = {};
for (const fSkip of [false, true]) {
  const matches = [];
  const failures = {};
  for (const code of latinCodes) {
    const plain = [...code].map(ch => latinAlphabet.indexOf(ch));
    const check = fitPeriod7(actualCipher, plain, fSkip);
    if (check.ok) matches.push(code);
    else failures[check.reason] = (failures[check.reason] || 0) + 1;
  }
  assert.deepEqual(matches, []);
  latinResults[fSkip ? 'literal F' : 'all consumed'] = {
    distinctLatinVulgateWords13: latinCodes.length,
    matches, failureCounts: failures
  };
}
assert.deepEqual(latinResults['literal F'].failureCounts, {
  'forbidden literal F': 28,
  'same 7-key phase requires different shift': 125
});
assert.deepEqual(latinResults['all consumed'].failureCounts, {
  'same 7-key phase requires different shift': 153
});

// A source-independent arbitrary 29-way permutation per 7-key phase has
// vastly more capacity. Report this as a non-exclusion control explicitly.
function fitsBijections(cipher, plain) {
  let clock = 0;
  const forward = new Map(), reverse = new Map();
  for (let i = 0; i < 13; i++) {
    if (plain[i] === 0) {
      if (cipher[i] !== 0) return false;
      continue;
    }
    const phase = clock++ % 7;
    const out = phase + ':' + plain[i], back = phase + ':' + cipher[i];
    if (forward.has(out) && forward.get(out) !== cipher[i]) return false;
    if (reverse.has(back) && reverse.get(back) !== plain[i]) return false;
    forward.set(out, cipher[i]);
    reverse.set(back, plain[i]);
  }
  return true;
}
const control = {};
for (const spelling of ['native', 'letter']) {
  let survivors = 0;
  for (const word of frequencyWords) {
    const plain = encodeWord(word, spelling);
    if (plain.length === 13 && fitsBijections(actualCipher, plain))
      survivors++;
  }
  control[spelling] = {arbitraryBijectionSurvivors: survivors};
}
assert.deepEqual(control, {
  native: {arbitraryBijectionSurvivors: 254},
  letter: {arbitraryBijectionSurvivors: 349}
});

const outcome = {
  source: '2014 authentic three magic squares rows 5+7+5',
  receivingSource: 'original physical p55 complete 13-rune word, segment 8/17',
  selectedRowValues: selectedSquareRow,
  actualCipherText: actualCipher.map(i => gp.translit[i]).join(' '),
  sourceCipherFPositions: actualCipher.flatMap((v,i) => v === 0 ? [i] : []),
  result: 'No source-GP English length-13 word matches any secret seven-phase additive row key in either GP spelling register, with or without plaintext-F bypass',
  output: results, latinVulgateWordControl: latinResults,
  syntheticPositive: positive,
  broaderPermutationControl: control,
  plaintextRecovered: false
};
process.stdout.write(JSON.stringify(outcome, null, 2) + '\n');
