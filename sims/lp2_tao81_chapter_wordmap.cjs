#!/usr/bin/env node
'use strict';

// Source-constrained book-code gate:
// - The 2016 signed message says "the path lies empty" and "Liber Primus is the way".
// - Tao (the Way) is a candidate source; Legge's Tao Teh King has 81 chapters.
// - LP2 page 33 has an upper black passage of exactly 81 runes.
// - Gematria Primus assigns prime values; LP2 p56 explicitly elevates prime/totient operations.
// Test the single locked rule: rune i selects chapter i+1, and phi(GP-prime-value)
// is the 1-based word index in that chapter. Raw prime and rune ordinal are controls.

const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const CORPUS = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const LEXICON_LINES = fs.readFileSync('resources/control/english_wordfreq_textblob.txt', 'utf8').split(/\r?\n/);
const LEXICON = new Set(LEXICON_LINES.filter(line => line && !line.startsWith(';')).map(line => line.trim().split(/\s+/)[0].toUpperCase()));
const SOURCE_URL = 'https://www.gutenberg.org/cache/epub/216/pg216.txt';

function words(text) {
  return (text.toUpperCase().match(/[A-Z]+(?:['-][A-Z]+)*/g) || []);
}

function parseChapters(text) {
  const begin = text.indexOf('START OF THE PROJECT GUTENBERG EBOOK');
  const end = text.indexOf('END OF THE PROJECT GUTENBERG EBOOK');
  assert(begin >= 0 && end > begin, 'Project Gutenberg body markers missing');
  const body = text.slice(text.indexOf('\n', begin) + 1, end);
  const chapters = [];
  let current = null;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*PART\s+(?:I|II)\.?\s*$/i.test(line)) continue;
    const m = line.match(/^\s*(?:Ch\.\s*)?(\d{1,2})\.\s*(.*?)\s*$/);
    if (m && Number(m[1]) === chapters.length + 1 && (!m[2] || /^1\.\s*/.test(m[2]))) {
      current = [];
      chapters.push(current);
      const remainder = m[2].replace(/^\s*1\.\s*/, '').trim();
      if (remainder) current.push(remainder);
      continue;
    }
    if (current) current.push(line);
  }

  return chapters.map(lines => words(lines.join(' ')));
}

function extract(chapters, positions) {
  const selected = positions.map((wordIndex, i) => {
    const chapterWords = chapters[i];
    const word = wordIndex >= 1 && wordIndex <= chapterWords.length ? chapterWords[wordIndex - 1] : null;
    return { chapter: i + 1, wordIndex, chapterWordCount: chapterWords.length, word };
  });
  const valid = selected.filter(x => x.word !== null).map(x => x.word);
  const lexical = valid.map(x => x.replace(/[-']/g, ''));
  const known = lexical.filter(x => LEXICON.has(x)).length;
  return {
    outOfRange: selected.length - valid.length,
    dictionaryHits: known,
    dictionaryHitRate: Number((known / Math.max(1, valid.length)).toFixed(4)),
    words: selected.map(x => x.word ?? '[OOR]'),
    text: selected.map(x => x.word ?? '[OOR]').join(' '),
    coordinates: selected
  };
}

async function main() {
  const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(30000) });
  assert(response.ok, `Tao source HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const source = bytes.toString('utf8');
  const chapters = parseChapters(source);
  assert.equal(chapters.length, 81, `Expected 81 chapters, parsed ${chapters.length}`);
  assert.deepEqual(chapters[3].slice(0, 9), ['THE','TAO','IS','LIKE','THE','EMPTINESS','OF','A','VESSEL']);

  const p33 = CORPUS.pages.find(page => page.page === 33);
  assert(p33, 'LP2 page 33 missing');
  assert.equal(p33.indices.length, 214, 'Unexpected p33 rune count');
  // Original page segmentation: red heading 10, upper black body 81,
  // red heading 8, lower black body 115.
  const body81 = p33.indices.slice(10, 91);
  assert.equal(body81.length, 81, 'p33 upper black passage is not 81 runes');

  const gpPrimes = body81.map(index => CORPUS.prime[index]);
  const phiPositions = gpPrimes.map(p => p - 1); // phi(p)=p-1 for prime p
  const rawPrimePositions = gpPrimes;
  const runeOrdinalPositions = body81.map(index => index + 1);

  const report = {
    hypothesis: 'p33 upper 81-rune passage is a one-rune-per-chapter Tao Teh King word map; phi(GP prime value) is the 1-based word index',
    source: {
      url: SOURCE_URL,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
      chapterCount: chapters.length,
      chapterWordCountMin: Math.min(...chapters.map(x => x.length)),
      chapterWordCountMax: Math.max(...chapters.map(x => x.length)),
      chapter4Opening: chapters[3].slice(0, 12)
    },
    lp2: {
      page: 33,
      pageRuneCount: p33.indices.length,
      segmentation: '10 red heading + 81 upper black + 8 red heading + 115 lower black',
      bodyRuneCount: body81.length,
      runeOrdinals: body81,
      gpPrimeValues: gpPrimes,
      phiWordPositions: phiPositions
    },
    primary_phi_prime_1based: extract(chapters, phiPositions),
    control_raw_gp_prime_1based: extract(chapters, rawPrimePositions),
    control_rune_ordinal_1based: extract(chapters, runeOrdinalPositions)
  };

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

main().catch(error => {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
