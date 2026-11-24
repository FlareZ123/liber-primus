'use strict';

/**
 * One source-motivated numeric key hypothesis for the 29-stanza Anglo-Saxon
 * Rune Poem: count the whitespace-delimited words in each stanza (including
 * the rune-name word and the printed bracketed words), reduce modulo 29, and
 * use the resulting period-29 stream as a continuous GP29 additive key.
 *
 * Source selection: exact 29/29 GP29-to-Anglo-Saxon-stanza order match.
 * Operation cue: the authenticated 2016 Cicada message says the words,
 * meanings and numbers in Liber Primus are important. Word count is a simple
 * way to turn the selected stanzas' words into numbers. This is one fixed
 * hypothesis, not a stanza-statistic sweep.
 *
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_anglo_saxon_rune_poem_wordcount_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const poemText = read('resources/external/dickins1915-rune-poem-old-english.txt');
const raw = read('resources/liber-primus/lp2-transcription.txt');
const dictionaryText = read('resources/control/english_wordfreq_textblob.txt');

const sourceRunes = [
  'ᚠ','ᚢ','ᚦ','ᚩ','ᚱ','ᚳ','ᚷ','ᚹ','ᚻ','ᚾ','ᛁ','ᛄ','ᛇ','ᛈ','ᛉ',
  'ᛋ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛝ','ᛟ','ᛞ','ᚪ','ᚫ','ᚣ','ᛡ','ᛠ'
];
assert.deepEqual(corpus.runes, sourceRunes,
  'LP2 GP29 order differs from the fixed Anglo-Saxon Rune Poem sequence');

const stanzas = poemText.split(/\r?\n\s*\r?\n/u).map(text => text.trim()).filter(Boolean);
assert.equal(stanzas.length, 29, 'Dickins source must contain exactly 29 stanzas');

// Count whitespace-delimited Old English words in each stanza. Punctuation
// does not create a token; hyphenated Eolh-secg remains one word; bracketed
// printed words remain counted as printed. The rune-name opening word counts.
const wordCounts = stanzas.map(stanza =>
  stanza.split(/\s+/u).filter(token => /[A-Za-zþð]/u.test(token)).length
);
const key = wordCounts.map(count => count % 29);
assert.deepEqual(wordCounts, [
  19,16,17,16,17,17,19,20,18,22,14,17,15,16,20,
  19,18,24,23,23,23,22,18,17,20,17,18,19,22
]);
assert.equal(new Set(key).size, 10);

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = raw.split('%').slice(0, 55);
assert.equal(pages.length, 55);
const wordSequences = [];
let currentWord = [];
function finishWord() {
  if (currentWord.length) wordSequences.push(currentWord);
  currentWord = [];
}
for (const character of [...pages.join('%')]) {
  if (runeId.has(character)) currentWord.push(runeId.get(character));
  else if (character === '%' || character === '/' || /\s/u.test(character)) continue;
  else finishWord();
}
finishWord();

const ciphertext = wordSequences.flat();
assert.equal(wordSequences.length, 2896);
assert.equal(ciphertext.length, 12956);

const spellings = corpus.translit.map((spelling, index) => [spelling, index]);
spellings.push(['ING', 21], ['IO', 27]);
const lexicon = new Set();
for (const line of dictionaryText.split(/\r?\n/u)) {
  const match = /^([a-z]+)\s+\d+\s*$/u.exec(line);
  if (!match) continue;
  const word = match[1].toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  function walk(position, symbols) {
    if (position === word.length) {
      lexicon.add(symbols.join(','));
      return;
    }
    if (symbols.length >= 14) return;
    for (const [token, symbol] of spellings) {
      if (word.startsWith(token, position)) {
        walk(position + token.length, symbols.concat(symbol));
      }
    }
  }
  walk(0, []);
}

function score(symbols) {
  const frequencies = Array(29).fill(0);
  for (const symbol of symbols) frequencies[symbol]++;
  const numerator = frequencies.reduce((sum, count) => sum + count * (count - 1), 0);
  const ioc = numerator / (symbols.length * (symbols.length - 1));
  let offset = 0;
  const decodedWords = wordSequences.map(word => {
    const decoded = symbols.slice(offset, offset + word.length);
    offset += word.length;
    return decoded;
  });
  assert.equal(offset, symbols.length);
  const hits = decodedWords.filter(word => lexicon.has(word.join(',')));
  const longWords = decodedWords.filter(word => word.length >= 5);
  const longHits = longWords.filter(word => lexicon.has(word.join(',')));
  return {
    ioc,
    dictionaryHits: hits.length,
    longWords: longWords.length,
    longDictionaryHits: longHits.length
  };
}

const original = score(ciphertext);
const outputs = {};
for (const sign of [-1, 1]) {
  const plaintext = ciphertext.map((value, index) =>
    (value + sign * key[index % 29] + 29) % 29
  );
  const recovered = plaintext.map((value, index) =>
    (value - sign * key[index % 29] + 29) % 29
  );
  assert.deepEqual(recovered, ciphertext, 'Candidate must re-encrypt exactly');
  outputs[sign === -1 ? 'subtract' : 'add'] = score(plaintext);
}
assert.equal(original.longDictionaryHits, 0);
assert.equal(outputs.subtract.longDictionaryHits, 0);
assert.equal(outputs.add.longDictionaryHits, 0);

console.log(JSON.stringify({
  source: 'Dickins 1915, The Anglo-Saxon Rune Poem, pp. 12-23',
  selector: 'exact 29/29 GP29 alphabet/stanza order; 2016 words/meanings/numbers clue',
  operation: 'one word count per stanza, including rune-name opening and printed bracketed words; modulo 29; continuous period-29 GP29 Vigenere, phase zero',
  wordCounts,
  key,
  distinctKeySymbols: new Set(key).size,
  stream: { runes: ciphertext.length, printedGroups: wordSequences.length },
  original,
  outputs
}, null, 2));
