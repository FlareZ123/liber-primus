'use strict';

/**
 * Search the authentic LP2 word-length channel for exact source-text cribs.
 * Node.js 22 CommonJS. Read-only and Windows-compatible.
 * Call with optional local text-file paths to screen additional books.
 *
 * The 29-rune GP spelling contracts TH, NG, and the other native digraphs.
 * The result is an exploratory source screen, never a decryption claim.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.resolve(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const symbolSet = new Set(corpus.translit);
const compounds = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA', 'IO'];

/**
 * Treat word marks as delimiters; lines and physical pages can split words.
 * @param {string} transcription
 * @returns {number[][]}
 */
function manuscriptWords(transcription) {
  const words = [];
  let word = [];
  for (const ch of transcription) {
    const value = runeToIndex.get(ch);
    if (value !== undefined) word.push(value);
    else if ("-.'".includes(ch) && word.length) {
      words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

/**
 * Convert an English word to its native GP29 rune length.
 * @param {string} word
 * @returns {number|null}
 */
function gpLength(word) {
  const text = word.toUpperCase()
    .replaceAll('QU', 'CW').replaceAll('V', 'U')
    .replaceAll('K', 'C').replaceAll('Z', 'S');
  let count = 0;
  for (let i = 0; i < text.length;) {
    const digraph = compounds.find((part) => text.startsWith(part, i));
    if (digraph) i += digraph.length;
    else if (symbolSet.has(text[i])) i++;
    else return null;
    count++;
  }
  return count;
}

/**
 * Exclude identical Project Gutenberg licensing text from source matching.
 * @param {string} raw
 * @returns {string}
 */
function stripGutenberg(raw) {
  const start = /(?:\*\*\*\s*)?START OF (?:THE )?PROJECT GUTENBERG[^\r\n]*\r?\n/i.exec(raw);
  const end = /(?:\*\*\*\s*)?END OF (?:THE )?PROJECT GUTENBERG/i.exec(raw);
  return raw.slice(start ? start.index + start[0].length : 0, end ? end.index : raw.length);
}

/**
 * Build an integer-alphabet suffix automaton over authentic rune-word sizes.
 * @param {number[]} lengths
 * @returns {{len:number,link:number,go:Map<number,number>,end:number}[]}
 */
function makeAutomaton(lengths) {
  const states = [{len: 0, link: -1, go: new Map(), end: -1}];
  let last = 0;
  for (const [i, value] of lengths.entries()) {
    const current = states.length;
    states.push({len: states[last].len + 1, link: 0, go: new Map(), end: i});
    let p = last;
    while (p >= 0 && !states[p].go.has(value)) {
      states[p].go.set(value, current);
      p = states[p].link;
    }
    if (p >= 0) {
      const q = states[p].go.get(value);
      assert.notEqual(q, undefined);
      if (states[p].len + 1 === states[q].len) states[current].link = q;
      else {
        const clone = states.length;
        states.push({
          len: states[p].len + 1,
          link: states[q].link,
          go: new Map(states[q].go),
          end: states[q].end
        });
        while (p >= 0 && states[p].go.get(value) === q) {
          states[p].go.set(value, clone);
          p = states[p].link;
        }
        states[q].link = states[current].link = clone;
      }
    }
    last = current;
  }
  return states;
}

/**
 * @param {ReturnType<makeAutomaton>} states
 * @param {string[]} tokens
 * @returns {{longest:number,lpWordStart:number|null,lpWordEnd:number|null,
 *           sourceWordStart:number|null,sourceWordEnd:number|null,phrase:string|null}}
 */
function scan(states, tokens) {
  let state = 0;
  let matched = 0;
  let longest = 0;
  let best = null;
  for (let i = 0; i < tokens.length; i++) {
    const value = gpLength(tokens[i]);
    if (value === null) {
      state = 0;
      matched = 0;
      continue;
    }
    while (state !== 0 && !states[state].go.has(value)) {
      state = states[state].link;
      matched = states[state].len;
    }
    if (states[state].go.has(value)) {
      state = states[state].go.get(value);
      matched++;
    } else {
      state = 0;
      matched = 0;
    }
    if (matched > longest) {
      longest = matched;
      best = {lpWordStart: states[state].end - matched + 1, lpWordEnd: states[state].end,
        sourceWordStart: i - matched + 1, sourceWordEnd: i,
        phrase: tokens.slice(i - matched + 1, i + 1).join(' ')};
    }
  }
  return {longest, ...(best || {
    lpWordStart: null, lpWordEnd: null, sourceWordStart: null,
    sourceWordEnd: null, phrase: null
  })};
}

const original = corpus.pages.slice(0, 56).flatMap((page) => page.indices);
const unknownWords = manuscriptWords(read('resources/liber-primus/lp2-transcription.txt')).slice(0, 2896);
assert.equal(original.length, 12956);
assert.equal(unknownWords.length, 2896);
assert.deepEqual(unknownWords.flat(), original);
const automaton = makeAutomaton(unknownWords.map((word) => word.length));

const books = [
  ['Shakespeare excerpt', 'resources/control/shakespeare_first300k.txt', 9],
  ['Gibran, The Prophet', 'resources/control/gibran_prophet_58585.txt', 9],
  ['Emerson, Essays: First Series', 'resources/control/emerson_essays_2944.txt', 9],
  ...process.argv.slice(2).map((file) => [path.basename(file), file, null])
];

for (const [title, file, expected] of books) {
  const tokens = stripGutenberg(read(file)).match(/[A-Za-z]+/g) || [];
  const match = scan(automaton, tokens);
  if (expected !== null) assert.equal(match.longest, expected);
  process.stdout.write(JSON.stringify({title, source: file, sourceWords: tokens.length, ...match}) + '\n');
}
