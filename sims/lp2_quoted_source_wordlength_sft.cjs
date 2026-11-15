'use strict';

// SFT for four long *original* LP2 quoted spans against two historic Cicada
// book sources. Read-only; Node 22; run on a GitHub-networked machine.
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
 * boundary. Preserve genuine hyphens, periods, and percent page boundaries.
 * @param {string} raw
 * @returns {{ start: number, end: number, len: number }[]}
 */
function wordRanges(raw) {
  const text = raw.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
  const words = [];
  let start = 0;
  let count = 0;
  let inWord = false;
  for (const glyph of text) {
    if (runes.has(glyph)) {
      if (!inWord) start = count;
      inWord = true;
      count += 1;
    } else if (inWord) {
      words.push({ start, end: count, len: count - start });
      inWord = false;
    }
  }
  if (inWord) words.push({ start, end: count, len: count - start });
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
 * @returns {{ cost: number, offset: number, exact: number, plaintext: string }}
 */
function bestMatch(target, sourceTokens) {
  const lengths = sourceTokens.map(gpLength);
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
