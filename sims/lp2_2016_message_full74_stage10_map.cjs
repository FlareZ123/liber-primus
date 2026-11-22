#!/usr/bin/env node
'use strict';

// Reproduce the full-book 74-page interpretation of the authenticated 2016
// Cicada message, and test its independent 2014 Stage10 prime-image anchors.
// This is a navigation hypothesis, not a decryption.
//
// Run from the repository root:
//   node sims/lp2_2016_message_full74_stage10_map.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = (relative) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const lp1Parts = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const lp2Parts = read('resources/lp2-transcription.txt').split('%');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const stage10Html = read('resources/external/2014-stage10-post-square-response.html');

const stripLayout = (value) => value
  .replaceAll('/', '')
  .replaceAll('\n', '')
  .replaceAll('\r', '')
  .trim();

const parseRuneWords = (page) => stripLayout(page)
  .split(/[-.&$§,:!?]/u)
  .map((part) => (part.match(/[ᚠ-᛿]+/gu) || []).join(''))
  .filter(Boolean);

const nonemptyLp1 = lp1Parts.filter((part) => stripLayout(part).length > 0);
assert.equal(nonemptyLp1.length, 15, 'LP1 transcription should contain 15 rune-bearing pages');
assert.equal(lp2Parts.length, 57, 'LP2 transcription should contain 57 rune-bearing pages (numeric p50 omitted)');
assert.equal(corpus.pages.length, 58, 'LP2 physical page count');

const tablePage50 = grid.pages.find((page) => page.page === 50);
assert.ok(tablePage50, 'p50 numeric table page exists');
assert.equal(tablePage50.tokens.length, 104, 'p50 has 104 printed base-60 cells');

const fullPages = Array.from({ length: 74 }, () => []);

// LP1 occupies full-book page indices 0..15. Its second physical page is the
// non-GP Chapter 1 / Intus divider; the canonical rune transcription omits it.
for (let page = 0; page < 16; page += 1) {
  if (page === 1) {
    fullPages[page] = [];
  } else {
    const lp1Index = page === 0 ? 0 : page - 1;
    fullPages[page] = parseRuneWords(nonemptyLp1[lp1Index]);
  }
}

// LP2 occupies full-book page indices 16..73. The rune transcription omits
// numeric-only LP2 p50, so restore its 104 table cells at that exact position.
for (let lp2Page = 0; lp2Page < 58; lp2Page += 1) {
  const fullIndex = 16 + lp2Page;
  if (lp2Page === 50) {
    fullPages[fullIndex] = tablePage50.tokens;
  } else {
    const transcriptionIndex = lp2Page < 50 ? lp2Page : lp2Page - 1;
    fullPages[fullIndex] = parseRuneWords(lp2Parts[transcriptionIndex]);
  }
}
assert.equal(fullPages.length, 74);
assert.ok(fullPages[28].length > 1);
assert.ok(fullPages[39].length > 1);
assert.ok(fullPages[50].length > 2);
assert.equal(fullPages[66][5], '0S', 'full-book page 66, word/cell 5 is p50 table token 0S');

const alphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function gpPrimeSum(word) {
  const normalized = word.toLowerCase().replace(/v/g, 'u').replace(/k/g, 'c').replace(/z/g, 's');
  let sum = 0;
  for (let offset = 0; offset < normalized.length;) {
    const match = alphabet.find(({ token }) => normalized.startsWith(token, offset));
    assert.ok(match, 'No canonical GP token for ' + word + ' at ' + normalized.slice(offset));
    sum += corpus.prime[match.index];
    offset += match.token.length;
  }
  return sum;
}

function base60(token) {
  const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let value = 0;
  for (const char of token) {
    const digit = digits.indexOf(char);
    assert.notEqual(digit, -1, 'Invalid base-60 digit ' + char);
    value = value * 60 + digit;
  }
  return value;
}

function runeTransliteration(word) {
  return [...word].map((rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1, 'Not a GP rune: ' + rune);
    return corpus.translit[index];
  }).join('');
}

const bodyStart = signed.indexOf('Hello.');
const signatureStart = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.ok(bodyStart >= 0 && signatureStart > bodyStart, 'signed cleartext boundaries');
const messageBody = signed.slice(bodyStart, signatureStart);
const messageWords = messageBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(messageWords.length, 43, '43 natural-language words in the authenticated cleartext');

const mapped = messageWords.map((word, index) => {
  const sum = gpPrimeSum(word);
  const page = sum % 74;
  const wordIndex = Math.floor(sum / 74);
  return {
    index,
    word,
    sum,
    page,
    wordIndex,
    selected: fullPages[page]?.[wordIndex] ?? null,
    selectedTranslit: fullPages[page]?.[wordIndex] && /[ᚠ-᛿]/u.test(fullPages[page][wordIndex])
      ? runeTransliteration(fullPages[page][wordIndex])
      : null,
  };
});

const imageIds = [...stage10Html.matchAll(/(?:src|href)=["'][^"']*?(\d+)\.jpg["']/giu)]
  .map((match) => Number(match[1]));
const uniqueImageIds = [...new Set(imageIds)];
assert.deepEqual(uniqueImageIds, [107, 167, 229], '2014 Stage10 response image IDs');

function primeRank(value) {
  let rank = 0;
  for (let candidate = 2; candidate <= value; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) rank += 1;
  }
  return rank;
}
const filenameRanks = uniqueImageIds.map((value) => ({ value, primeRank: primeRank(value) }));
const anchorPages = filenameRanks.map((entry) => entry.primeRank);
assert.deepEqual(anchorPages, [28, 39, 50]);

const anchorHits = mapped
  .filter((entry) => anchorPages.includes(entry.page))
  .sort((a, b) => a.page - b.page)
  .map(({ word, sum, page, wordIndex, selectedTranslit, selected }) => ({
    word, sum, page, wordIndex, selectedTranslit, selected,
  }));
assert.deepEqual(
  anchorHits.map((entry) => [entry.page, entry.word, entry.wordIndex, entry.selectedTranslit]),
  [
    [28, 'luck', 1, 'RCW'],
    [39, 'you', 1, 'WNGGXDG'],
    [50, 'paths', 2, 'EOD'],
  ],
  'three 2016 word addresses match the Stage10 image prime ranks',
);

const epiphany = mapped.find((entry) => entry.word.toLowerCase() === 'epiphany');
assert.ok(epiphany);
assert.deepEqual(
  [epiphany.sum, epiphany.page, epiphany.wordIndex, epiphany.selected],
  [436, 66, 5, '0S'],
);
const epiphanyCellValue = base60(epiphany.selected);
assert.equal(epiphanyCellValue, 28, 'epiphany-selected p50 cell points back to Stage10 image 107 prime rank');

const tableCells = [];
let tableOffset = 0;
for (const page of grid.pages) {
  page.tokens.forEach((token, local) => {
    tableCells.push({
      page: page.page,
      local,
      global: tableOffset + local,
      token,
      value: base60(token),
    });
  });
  tableOffset += page.tokens.length;
}
assert.equal(tableOffset, 256);
const filenameTableHits = uniqueImageIds.map((value) => {
  const hit = tableCells.find((cell) => cell.value === value);
  assert.ok(hit, 'Stage10 filename value ' + value + ' appears in p50 table');
  return { value, ...hit };
});
assert.deepEqual(
  filenameTableHits.map((cell) => [cell.value, cell.page, cell.local, cell.global]),
  [
    [107, 49, 45, 45],
    [167, 49, 2, 2],
    [229, 50, 21, 101],
  ],
);

const anchorSet = new Set(anchorPages);
const phaseResults = Array.from({ length: 74 }, (_, shift) => {
  const hits = mapped
    .map((entry) => ({ ...entry, shiftedPage: (entry.page + shift) % 74 }))
    .filter((entry) => anchorSet.has(entry.shiftedPage));
  const counts = anchorPages.map((page) => hits.filter((entry) => entry.shiftedPage === page).length);
  return {
    shift,
    counts,
    exactlyOnePerAnchor: counts.every((count) => count === 1),
    hits: hits.map((entry) => ({ word: entry.word, page: entry.shiftedPage })),
    epiphanyPage: (epiphany.page + shift) % 74,
  };
});
const exactAnchorPhases = phaseResults.filter((entry) => entry.exactlyOnePerAnchor);
assert.deepEqual(exactAnchorPhases.map((entry) => entry.shift), [0, 61]);
const completeCrosslinkPhases = exactAnchorPhases
  .filter((entry) => entry.epiphanyPage === 66 && epiphany.wordIndex === 5 && epiphanyCellValue === 28)
  .map((entry) => entry.shift);
assert.deepEqual(completeCrosslinkPhases, [0]);

const controls = {
  lp2Only58: ['luck', 'you', 'paths'].map((word) => ({
    word,
    page: gpPrimeSum(word) % 58,
    wordIndex: Math.floor(gpPrimeSum(word) / 58),
  })),
  runeBearing73: ['luck', 'you', 'paths'].map((word) => ({
    word,
    page: gpPrimeSum(word) % 73,
    wordIndex: Math.floor(gpPrimeSum(word) / 73),
  })),
};

const output = {
  status: 'candidate navigation map; no unknown plaintext recovered',
  fullBook: {
    lp1PhysicalPages: 16,
    lp1RuneBearingPages: 15,
    lp2PhysicalPages: 58,
    totalPages: 74,
    coverExcluded: true,
  },
  messageWordCount: messageWords.length,
  stage10ImageIds: uniqueImageIds,
  stage10PrimeRanks: filenameRanks,
  threeAnchorHits: anchorHits,
  epiphanyTableCrosslink: {
    word: epiphany.word,
    sum: epiphany.sum,
    fullBookPage: epiphany.page,
    wordOrCellIndex: epiphany.wordIndex,
    tableToken: epiphany.selected,
    decimalValue: epiphanyCellValue,
    matchesStage10PrimeRank: primeRank(107),
  },
  filenameValuesInsideP50Table: filenameTableHits,
  phaseNull: {
    shiftsWithExactlyOneHitPerAnchor: exactAnchorPhases,
    shiftsAlsoPreservingEpiphanyToCell28: completeCrosslinkPhases,
  },
  pageCountControls: controls,
  selectedWordsRemainCiphertext: anchorHits.every((entry) => entry.selectedTranslit !== null),
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
