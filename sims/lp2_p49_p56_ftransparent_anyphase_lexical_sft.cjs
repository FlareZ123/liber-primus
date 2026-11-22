'use strict';

/**
 * Authentic p56 plaintext-F bypass + prime-totient running key, applied to
 * original LP2 p48–49 complete pre-table sentence. No unknown plaintext
 * or key is assumed; all starts 0..49999 and both signs are scanned.
 * Literal numeric table is nonconsuming, as on independently solved p56.
 * The 170-rune p51–52 sentence is withheld from training key selection.
 *
 * Run: node sims/lp2_p49_p56_ftransparent_anyphase_lexical_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const original = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const printed = read('resources/liber-primus/lp2-transcription.txt');
const spelling = read('resources/control/english_wordfreq_textblob.txt');
const runeMap = new Map(original.runes.map((r, i) => [r, i]));
const tokens = original.translit.map((token, i) => ({ token, i }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} word @returns {string|null} */
function encodeWord(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const result = [];
  for (let i = 0; i < normalized.length;) {
    const item = tokens.find(({ token }) => normalized.startsWith(token, i));
    if (!item) return null;
    result.push(item.i);
    i += item.token.length;
  }
  return result.join(',');
}

/** @type {Map<string,number>} */
const lex = new Map();
for (const line of spelling.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, frequency] = line.split(/\s+/u);
  const encoded = encodeWord(word);
  if (encoded !== null) {
    lex.set(encoded, (lex.get(encoded) || 0) + Number(frequency));
  }
}
assert.equal(lex.size, 29058);
const lexicalScores = new Map([...lex.entries()]
  .map(([key, frequency]) => [key, Math.log1p(frequency)]));
/** @param {string} text @returns {number[][]} */
function words(text) {
  return (text.replace(/\/\s*/gu, '').match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => {
      const index = runeMap.get(rune);
      assert.notEqual(index, undefined);
      return index;
    }));
}
const parts = printed.split(/^\s*%\s*$/m);
const pre = words(parts[48].slice(parts[48].lastIndexOf('.') + 1) + parts[49]);
const post = words(parts[50] + parts[51].slice(0, parts[51].indexOf('.') + 1));
const page = (n) => original.pages.find((x) => x.page === n).indices;
assert.deepEqual(pre.flat(), page(48).slice(-72).concat(page(49)));
assert.deepEqual(post.flat(), page(51).concat(page(52).slice(0, 78)));
assert.equal(pre.length, 33);
assert.equal(post.length, 40);
assert.equal(pre.flat().length, 138);
assert.equal(post.flat().length, 170);

/* Conventional consecutive primes, original p56's historical key family. */
const sieve = new Uint8Array(700001);
sieve.fill(1, 2);
for (let p = 2; p * p < sieve.length; p++) {
  if (sieve[p]) for (let n = p * p; n < sieve.length; n += p) sieve[n] = 0;
}
const shifts = [];
for (let p = 2; p < sieve.length; p++) if (sieve[p]) shifts.push((p - 1) % 29);
assert.ok(shifts.length > 50308);
/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;

/**
 * Word-level exact Viterbi with original 2014 plaintext-F skip ambiguity.
 * State at a word boundary is the count of literal-F nonconsuming emissions.
 * @param {number[][]} originalWords
 * @param {number} start Consecutive-prime zero-based starting index
 * @param {number} sign Encryption shift sign +1 or -1
 * @param {boolean} collect Retain best path for solved-p56 positive control
 * @returns {{score:number,matched:number,plain:number[],literals:number[]}}
 */
function decode(originalWords, start, sign, collect = false) {
  let states = new Map([[0, { score: 0, matched: 0, plain: [], literals: [] }]]);
  let wordStart = 0;
  for (const cipherWord of originalWords) {
    const next = new Map();
    for (const [skipped, state] of states) {
      let branches = [{ k: wordStart - skipped, skipped, plain: [], literals: [] }];
      for (const ciphertext of cipherWord) {
        const expanded = [];
        for (const branch of branches) {
          if (ciphertext === 0) {
            expanded.push({
              k: branch.k, skipped: branch.skipped + 1,
              plain: branch.plain.concat(0),
              literals: branch.literals.concat(wordStart + branch.plain.length)
            });
          }
          const shift = shifts[start + branch.k];
          assert.notEqual(shift, undefined);
          const plaintext = mod29(ciphertext - sign * shift);
          if (plaintext !== 0) {
            expanded.push({
              k: branch.k + 1, skipped: branch.skipped,
              plain: branch.plain.concat(plaintext), literals: branch.literals
            });
          }
        }
        branches = expanded;
      }
      for (const branch of branches) {
        const lexical = lexicalScores.get(branch.plain.join(','));
        const value = state.score + (lexical === undefined ? -8 : lexical);
        const previous = next.get(branch.skipped);
        if (!previous || value > previous.score) {
          next.set(branch.skipped, {
            score: value, matched: state.matched + Number(lexical !== undefined),
            plain: collect ? state.plain.concat(branch.plain) : [],
            literals: collect ? state.literals.concat(branch.literals) : []
          });
        }
      }
    }
    if (next.size === 0) return { score: -1e9, matched: 0, plain: [], literals: [] };
    states = next;
    wordStart += cipherWord.length;
  }
  return [...states.values()].sort((a, b) => b.score - a.score)[0];
}

/* Independent, genuine known-key original p56 positive control. */
const p56Words = words(parts[55]);
assert.deepEqual(p56Words.flat(), page(56));
const control = decode(p56Words, 0, 1, true);
const knownPlaintext = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
  .split(' ').flatMap((word) => {
    const gp = encodeWord(word);
    assert.notEqual(gp, null);
    return gp.split(',').map(Number);
  });
assert.deepEqual(control.plain, knownPlaintext);
assert.deepEqual(control.literals, [56]);
assert.equal(control.matched, 24);
assert.ok(Math.abs(control.score - 164.9248147426576) < 1e-9);

/* Full pre-table phase sweep, preserving the post-table original as holdout. */
const top = [];
let legalTraining = 0;
for (const sign of [1, -1]) {
  for (let start = 0; start < 50000; start++) {
    const candidate = decode(pre, start, sign);
    if (candidate.score > -1e8) legalTraining++;
    if (top.length < 24 || candidate.score > top[top.length - 1].score) {
      top.push({ start, sign, score: candidate.score, matched: candidate.matched });
      top.sort((a, b) => b.score - a.score);
      if (top.length > 24) top.pop();
    }
  }
}
assert.equal(legalTraining, 26849);
assert.deepEqual(top[0], {
  start: 23705, sign: 1, score: -177.13072268332078, matched: 8
});
const holdout = top.map((candidate) => {
  const entire = decode(pre.concat(post), candidate.start, candidate.sign);
  return {
    start: candidate.start,
    sign: candidate.sign,
    trainScore: candidate.score,
    trainMatched: candidate.matched,
    fullLegal: entire.score > -1e8,
    postMatched: entire.score > -1e8 ? entire.matched - candidate.matched : null,
    fullScore: entire.score > -1e8 ? entire.score : null
  };
});
assert.deepEqual(holdout.filter((x) => x.fullLegal).map((x) => x.start), [38874]);
assert.equal(holdout[6].postMatched, 3);
const report = {
  original: { before: 138, beforeWords: 33, after: 170, afterWords: 40 },
  exactSolvedP56Control: { recoveredRunes: 85, lexicalWords: control.matched,
    plaintextFPositions: control.literals },
  model: 'Known p56 prime-totient/F-transparency, source-word lexical Viterbi',
  startsPerSign: 50000,
  signs: [1, -1],
  trainingSource: 'p48–49 full sentence, 138 original runes',
  holdoutSource: 'p51–52 full sentence, 170 original runes; numeric field nonconsuming',
  legalTrainingCandidates: legalTraining,
  topTrainingCandidates: top,
  independentHoldout: holdout,
  conclusion: 'No authentic unknown LP2 plaintext or key recovered. This bounds only the tested native p56 operation, offsets, signs and lexical register.'
};
console.log(JSON.stringify(report, null, 2));
