'use strict';

/**
 * Fixed end-letter key test motivated by the p56 "AN END" heading and the
 * exact 29-rune / 29-stanza Anglo-Saxon Rune Poem alignment.
 *
 * Source: Bruce Dickins, Runic and Heroic Poems of the Old Teutonic Peoples
 * (Cambridge UP, 1915), "The Anglo-Saxon Rune Poem", pp. 12-23.
 * Public transcription: https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem
 *
 * One bounded source-derived key hypothesis: continuous period-29 GP29
 * Vigenere, phase zero, both signs. No phase, reset, direction, or
 * stanza-position search is performed.
 *
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_anglo_saxon_rune_poem_endletter_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const dictionaryText = read('resources/control/english_wordfreq_textblob.txt');

const sourceRunes = [
  'ᚠ','ᚢ','ᚦ','ᚩ','ᚱ','ᚳ','ᚷ','ᚹ','ᚻ','ᚾ','ᛁ','ᛄ','ᛇ','ᛈ','ᛉ',
  'ᛋ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛝ','ᛟ','ᛞ','ᚪ','ᚫ','ᚣ','ᛡ','ᛠ'
];
assert.deepEqual(corpus.runes, sourceRunes,
  'LP2 GP29 order differs from the fixed Anglo-Saxon Rune Poem sequence');

const oldEnglishFinalWords = [
  'hleotan','wuht','resteð','tohiht','milpaþas','restaþ','leas','geniht',
  'syððan','æror','ansyne','þearfum','eþle','ætsomne','gedeþ','lande',
  'swiceþ','getenge','frofur','betæcan','gym[eð]','nemdun','oftast',
  'brice','treowe','monige','sum','leofaþ','geswicaþ'
];
const oldEnglishUnbracketedFinalWords = oldEnglishFinalWords.slice();
oldEnglishUnbracketedFinalWords[20] = 'gym';
const dickinsTranslationFinalWords = [
  'Lord','mettle','them','knight','horse','within','else','house','water',
  'betimes','upon','alike','estate','banqueting-hall','touches','land',
  'fails','skies','restless','earth','bridle','hero','prosperity','all',
  'fashion','many','journey','happiness','broken'
];

function finalLetters(words) {
  return words.map(word => {
    const letters = word.toLowerCase().replace(/[^a-zþð]/gu, '');
    assert.ok(letters.length, 'A stanza final word has no letters');
    return letters.at(-1);
  });
}
function toGp29Token(letter) {
  if (letter === 'þ') return 'TH';
  if (letter === 'ð') return 'D';
  return letter.toUpperCase();
}
const oldPrintedTokens = finalLetters(oldEnglishFinalWords).map(toGp29Token);
const oldUnbracketedTokens = finalLetters(oldEnglishUnbracketedFinalWords).map(toGp29Token);
const translationTokens = finalLetters(dickinsTranslationFinalWords).map(toGp29Token);

assert.deepEqual(oldPrintedTokens, [
  'N','T','D','T','S','TH','S','T','N','R','E','M','E','E','TH',
  'E','TH','E','R','N','D','N','T','E','E','E','M','TH','TH'
]);
assert.deepEqual(oldUnbracketedTokens, [
  'N','T','D','T','S','TH','S','T','N','R','E','M','E','E','TH',
  'E','TH','E','R','N','M','N','T','E','E','E','M','TH','TH'
]);
assert.deepEqual(translationTokens, [
  'D','E','M','T','E','N','E','E','R','S','N','E','E','L','S',
  'D','S','S','S','H','E','O','Y','L','N','Y','Y','S','N'
]);

const tokenId = new Map(corpus.translit.map((token, index) => [token, index]));
function tokenKey(tokens) {
  const key = tokens.map(token => tokenId.get(token));
  assert.equal(key.length, 29);
  assert.ok(key.every(Number.isInteger), 'A key token is absent from GP29');
  return key;
}

// Match the canonical source-gate parser: preserve printed groups, join page
// continuations, and omit the numeric-only p50 page.
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
for (const line of dictionaryText.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+\s*$/.exec(line);
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
function evaluateKey(name, tokens) {
  const key = tokenKey(tokens);
  const outputs = {};
  for (const sign of [-1, 1]) {
    const plaintext = ciphertext.map((value, index) =>
      (value + sign * key[index % 29] + 29) % 29
    );
    outputs[sign === -1 ? 'subtract' : 'add'] = score(plaintext);
  }
  assert.equal(outputs.subtract.longDictionaryHits, 0);
  assert.equal(outputs.add.longDictionaryHits, 0);
  return {
    name,
    keyTokens: tokens,
    keyIndices: key,
    distinctKeySymbols: new Set(key).size,
    outputs
  };
}

const candidates = [
  evaluateKey('Old English printed gym[eð]', oldPrintedTokens),
  evaluateKey('Old English unbracketed gym', oldUnbracketedTokens),
  evaluateKey('Dickins English translation', translationTokens)
];
assert.equal(original.longWords, 1132);
assert.equal(original.longDictionaryHits, 0);
assert.equal(original.dictionaryHits, 203);

console.log(JSON.stringify({
  source: 'Dickins 1915, The Anglo-Saxon Rune Poem, pp. 12-23',
  selector: 'p56 AN END; final letter of each stanza final word',
  stream: { runes: ciphertext.length, printedGroups: wordSequences.length },
  original,
  candidates
}, null, 2));
