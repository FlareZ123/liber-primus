'use strict';

// SFT for four original LP2 quotation windows against historically used
// Cicada literary sources. Read-only, Windows Node 22, CommonJS.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const SOURCE_REV = '521cb08a689d2159cf54e3c569fd59588601f875';
const sources = [
  {
    name: 'Emerson Essays First Series',
    url: 'https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/' +
      SOURCE_REV + '/data/corpora/emerson_essays.txt'
  },
  {
    name: 'Liber AL vel Legis (archived excerpt)',
    url: 'https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/' +
      SOURCE_REV + '/data/corpora/liber_al_vel_legis.txt'
  }
];

const quoteMap = JSON.parse(readFileSync('resources/liber-primus/lp2-quote-punctuation-spans.json', 'utf8'));
const corpus = JSON.parse(readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const original = readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const runes = new Set(corpus.runes);

/**
 * The slash+newline in the reference is a physical line wrap, not a word
 * boundary. The canonical original text treats only - . $ & § as real
 * word separators; percent page breaks DO NOT end words.
 * @param {string} raw
 * @returns {{ start: number, end: number, len: number, runes: string }[]}
 */
function wordRanges(raw) {
  const text = raw.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
  const words = [];
  let start = 0;
  let count = 0;
  let inWord = false;
  let value = '';
  for (const glyph of text) {
    if (runes.has(glyph)) {
      if (!inWord) start = count;
      inWord = true;
      count += 1;
      value += glyph;
    } else if ('-.$&§'.includes(glyph) && inWord) {
      words.push({ start, end: count, len: count - start, runes: value });
      inWord = false;
      value = '';
    }
  }
  if (inWord) words.push({ start, end: count, len: count - start, runes: value });
  return words;
}

/**
 * Known GP digraph/trigraph orthography, supported by an exact 20-word p57
 * original plaintext-to-rune length positive. This is a controlled approximate
 * model of source spelling, not a generalized phonetic encoder.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  return word.toUpperCase().replace(/ING|TH|NG|EO|OE|AE|EA|IA/g, '*')
    .replace(/[^A-Z*]/g, '').length;
}

/**
 * Best frozen contiguous source window, exact token count, no gap or phase.
 * @param {number[]} target
 * @param {string[]} sourceTokens
 * @param {(word: string) => number} projector
 * @returns {{ cost: number, offset: number, exact: number, plaintext: string }}
 */
function bestMatch(target, sourceTokens, projector = gpLength) {
  const lengths = sourceTokens.map(projector);
  let winner = { cost: Infinity, offset: -1, exact: 0, plaintext: '' };
  for (let start = 0; start + target.length <= lengths.length; start += 1) {
    let cost = 0;
    let exact = 0;
    for (let pos = 0; pos < target.length; pos += 1) {
      cost += Math.abs(lengths[start + pos] - target[pos]);
      if (lengths[start + pos] === target[pos]) exact += 1;
      if (cost >= winner.cost) break;
    }
    if (cost < winner.cost) {
      winner = {
        cost,
        offset: start,
        exact,
        plaintext: sourceTokens.slice(start, start + target.length).join(' ')
      };
    }
  }
  return winner;
}

async function main() {
  // Original p57 PARABLE is a historical, directly readable GP positive.
  const clear = 'PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE ' +
    'WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE';
  const knownTokens = clear.split(' ');
  const p57 = original.split('%').at(-1);
  const p57Sizes = wordRanges(p57).map((w) => w.len);
  const knownSizes = knownTokens.map(gpLength);
  assert.deepEqual(p57Sizes, knownSizes);
  console.log('NATIVE_GP_POSITIVE', JSON.stringify({
    page: 57,
    matchedWordLengths: knownTokens.length,
    exact: true
  }));

  const words = wordRanges(original);
  assert.equal(quoteMap.quote_rune_total, 405);
  const quotes = quoteMap.quotes.map((q) => {
    const segment = words.filter((w) => w.start >= q.start && w.end <= q.end);
    const sum = segment.reduce((value, w) => value + w.len, 0);
    assert.equal(sum, q.length);
    return { start: q.start, end: q.end, lengths: segment.map((w) => w.len) };
  });

  assert.deepEqual(quotes.map((q) => q.lengths.length), [4, 5, 2, 14, 13, 34, 14]);

  for (const source of sources) {
    const response = await fetch(source.url);
    assert.equal(response.ok, true, 'Source unavailable: ' + source.url);
    const text = await response.text();
    const tokens = Array.from(text.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g),
      (m) => m[0].toUpperCase());
    for (const quote of quotes.filter((q) => q.lengths.length >= 13)) {
      const answer = bestMatch(quote.lengths, tokens);
      assert(answer.cost > 0, 'Potential verbatim quotation; inspect original bytes');
      console.log('ORIGINAL_QUOTE', JSON.stringify({
        source: source.name,
        startRune: quote.start,
        endRune: quote.end,
        tokenCount: quote.lengths.length,
        sumRuneLengths: quote.lengths.reduce((a, b) => a + b, 0),
        minAbsoluteWordLengthError: answer.cost,
        exactWordLengthPositions: answer.exact,
        sourceTokenOffset: answer.offset,
        closestSource: answer.plaintext
      }));
    }
  }


  // Previous-round book sources, already pinned under resources/external.
  // This extra screen is offline and keeps original quote boundaries fixed.
  const localTexts = [
    ['Blake, Marriage of Heaven and Hell (1906)', 'blake-marriage-1906-gutenberg45315.txt'],
    ['Book of the Law I (2013 source)', '2013-book-of-law-I.txt'],
    ['Book of the Law II (2013 source)', '2013-book-of-law-II.txt'],
    ['Book of the Law III (2013 source)', '2013-book-of-law-III.txt'],
    ['KJV Passion and Gospels', 'kjv-passion-gospels-2014.txt'],
    ['Tennyson Lady of Shalott 1832', 'tennyson-lady-of-shalott-1832-mptc.txt'],
    ['Tennyson Lady of Shalott 1842', 'tennyson-lady-of-shalott-1842-gutenberg8601.txt']
  ];
  const longOriginalQuotes = quotes.filter((q) => q.lengths.length >= 13);
  for (const [name, filename] of localTexts) {
    const sourceText = readFileSync('resources/external/' + filename, 'utf8');
    const tokens = Array.from(sourceText.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g),
      (m) => m[0].toUpperCase());
    for (const quote of longOriginalQuotes) {
      const answer = bestMatch(quote.lengths, tokens);
      assert(answer.cost > 0,
        'Potential verbatim quote in ' + name + ' at ' + quote.start);
      console.log('ORIGINAL_QUOTE_LOCAL', JSON.stringify({
        source: name, startRune: quote.start,
        tokenCount: quote.lengths.length,
        minAbsoluteWordLengthError: answer.cost,
        exactWordLengthPositions: answer.exact,
        sourceTokenOffset: answer.offset,
        closestSource: answer.plaintext
      }));
    }
  }
  const mabinogion = JSON.parse(readFileSync(
    'resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json',
    'utf8'));
  const allMabinogion = mabinogion.mabinogion_story_word_lengths;
  assert(allMabinogion.length > 100000);
  for (const quote of longOriginalQuotes) {
    const answer = bestMatch(quote.lengths, allMabinogion, (value) => value);
    assert(answer.cost > 0,
      'Potential original Mabinogion quote at ' + quote.start);
    console.log('ORIGINAL_QUOTE_LOCAL', JSON.stringify({
      source: 'Mabinogion (2012 Cicada bookcode source)',
      startRune: quote.start, tokenCount: quote.lengths.length,
      minAbsoluteWordLengthError: answer.cost,
      exactWordLengthPositions: answer.exact,
      sourceTokenOffset: answer.offset
    }));
  }
  const yetzirah = JSON.parse(readFileSync(
    'resources/external/sefer-yetzirah-westcott-archive.json', 'utf8'));
  const tokensY = Array.from(
    yetzirah.map((p) => p.pageContent).join(' ').matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g),
    (m) => m[0].toUpperCase());
  for (const quote of longOriginalQuotes) {
    const answer = bestMatch(quote.lengths, tokensY);
    assert(answer.cost > 0,
      'Potential original Sefer Yetzirah quote at ' + quote.start);
    console.log('ORIGINAL_QUOTE_LOCAL', JSON.stringify({
      source: 'Sefer Yetzirah, Westcott archive',
      startRune: quote.start, tokenCount: quote.lengths.length,
      minAbsoluteWordLengthError: answer.cost,
      exactWordLengthPositions: answer.exact,
      sourceTokenOffset: answer.offset,
      closestSource: answer.plaintext
    }));
  }

  // Earlier LP1 is a first-party author source already in GP runes. It has
  // no transliteration uncertainty, and can expose a repeated quoted passage
  // even if LP2 ciphertext uses an entirely different underlying key.
  const priorURL = 'https://raw.githubusercontent.com/rtkd/iddqd/' +
    'f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/' +
    'liber-primus__transcription--master/liber-primus__transcription--master.txt';
  const priorResponse = await fetch(priorURL);
  assert.equal(priorResponse.ok, true, 'Original LP1 rune source unavailable');
  const priorText = await priorResponse.text();
  const allRunes = Array.from(priorText).filter((c) => runes.has(c)).join('');
  const lp2Start = Array.from(original).filter((c) => runes.has(c)).slice(0, 32).join('');
  const lp1RuneCount = allRunes.indexOf(lp2Start);
  assert.equal(lp1RuneCount, 2797, 'Original LP1/LP2 boundary changed');
  const lp1Words = wordRanges(priorText).filter((w) => w.end <= lp1RuneCount);
  assert.equal(lp1Words.length, 694);
  const sourceTokens = lp1Words.map((w) => w.runes);
  for (const quote of quotes.filter((q) => q.lengths.length >= 13)) {
    const answer = bestMatch(quote.lengths, sourceTokens, (w) => w.length);
    assert(answer.cost > 0, 'Possible original LP1 quote, inspect page context');
    console.log('ORIGINAL_QUOTE', JSON.stringify({
      source: 'Original LP1 rune book',
      startRune: quote.start,
      endRune: quote.end,
      tokenCount: quote.lengths.length,
      sumRuneLengths: quote.lengths.reduce((a, b) => a + b, 0),
      minAbsoluteWordLengthError: answer.cost,
      exactWordLengthPositions: answer.exact,
      sourceTokenOffset: answer.offset,
      closestSource: answer.plaintext
    }));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
