'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (path) => fs.readFileSync(path, 'utf8');

const primeEcho = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const primeMatches = [...primeEcho.matchAll(/echo(?:\s+-n)?\s+"(\d+)(?:\\t|\t)"/g)];
const primes = primeMatches.map((match) => Number(match[1]));
const pauseMatches = [...primeEcho.matchAll(/echo(?:\s+-n)?\s+"(\d+)(?:\\t|\t)";\s*sleep 2/g)];
const pauses = pauseMatches.map((match) => Number(match[1]));
const pauseRanks = pauses.map((prime) => primes.indexOf(prime) + 1);

assert.equal(primes.length, 464);
assert.equal(primes[0], 2);
assert.equal(primes[primes.length - 1], 3301);
assert.deepEqual(pauses, [1033, 3301]);
assert.deepEqual(pauseRanks, [174, 464]);

const blockCounts = [primes.length, pauseRanks[0], primes.length - pauseRanks[0]];
assert.deepEqual(blockCounts, [464, 174, 290]);

// Candidate only: p=23 appears in a separate signed DH worked example.
// The prime_echo script itself does not select a modulus for these counts.
const candidateModulus = 23;
const selectedWordIndices = blockCounts.map((count) => count % candidateModulus);
assert.deepEqual(selectedWordIndices, [4, 13, 14]);

const signedMessage = read('resources/historical/cicada2016-4gq25-outguess.asc');
const messageBody = signedMessage
  .split('Hash: SHA1')[1]
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .replace(/7A35090F/g, '');
const messageWords = messageBody.match(/[A-Za-z]+/g).map((word) => word.toUpperCase());

assert.equal(messageWords.length, 43);
const selectedWords = selectedWordIndices.map((index) => messageWords[index]);
assert.deepEqual(selectedWords, ['EMPTY', 'WAY', 'ITS']);

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const symbols = [...corpus.translit].sort((a, b) => b.length - a.length);
const symbolIndex = Object.fromEntries(corpus.translit.map((symbol, index) => [symbol, index]));

function gp0(word) {
  let total = 0;
  let cursor = 0;
  while (cursor < word.length) {
    const symbol = symbols.find((candidate) => word.startsWith(candidate, cursor));
    assert.ok(symbol, 'Unmapped GP symbol in ' + word + ' at ' + cursor);
    total += symbolIndex[symbol];
    cursor += symbol.length;
  }
  return total;
}

const gp0Addresses = selectedWords.map(gp0);
assert.deepEqual(gp0Addresses, [92, 57, 41]);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const selectedTokens = gp0Addresses.map((address) => tokens[address]);
const base60Offsets = selectedTokens.map(
  (token) => alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1])
);
assert.deepEqual(selectedTokens, ['3u', '1w', '1O']);
assert.deepEqual(base60Offsets, [236, 118, 84]);
assert.deepEqual(base60Offsets, gp0Addresses.map((address) => grid.bytes[address]));

const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet59.length, 59);
const base59Offsets = selectedTokens.map(
  (token) => alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1])
);
assert.deepEqual(base59Offsets, [232, 116, 83]);

const transcription = read('resources/liber-primus/lp2-transcription.txt');
const sections = transcription.split('%');

function parsePageWords(section, separator) {
  const cleaned = section.replace(/\r?\n/g, '').replaceAll('/', '');
  const lengths = cleaned
    .split(separator)
    .map((segment) => Array.from(segment).filter((character) => /\p{Script=Runic}/u.test(character)).length)
    .filter((length) => length > 0);

  let offset = 0;
  const words = [];
  for (const length of lengths) {
    words.push({
      ordinal: words.length,
      start: offset,
      end: offset + length - 1,
      length,
    });
    offset += length;
  }
  return { runeCount: offset, words };
}

function collectRunePages(separator) {
  const pages = [];
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    // The numeric p50 table has no rune transcription section:
    // sections 0..49 are pages 0..49; sections 50..54 are pages 51..55.
    const pageNumber = sectionIndex < 50 ? sectionIndex : sectionIndex + 1;
    if (pageNumber > 55) continue;

    const corpusPage = corpus.pages.find((page) => page.page === pageNumber);
    if (!corpusPage || corpusPage.indices.length === 0) continue;

    const parsed = parsePageWords(sections[sectionIndex], separator);
    assert.equal(
      parsed.runeCount,
      corpusPage.indices.length,
      'Transcription/corpus rune-count mismatch on page ' + pageNumber
    );
    pages.push({
      page: pageNumber,
      words: parsed.words,
      ciphertext: corpusPage.indices,
    });
  }
  assert.equal(pages.length, 55);
  return pages;
}

function wordAtOneBasedRuneOffset(page, offset) {
  return page.words.find((word) => word.start + 1 === offset) || null;
}

function pagesWithAllWordStarts(pages, offsets) {
  return pages
    .filter((page) => offsets.every((offset) => wordAtOneBasedRuneOffset(page, offset)))
    .map((page) => ({
      page: page.page,
      targets: offsets.map((offset) => {
        const word = wordAtOneBasedRuneOffset(page, offset);
        return {
          ordinal: word.ordinal,
          start0: word.start,
          length: word.length,
        };
      }),
    }));
}

function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const separatorModes = [
  { name: 'hyphen-dot', separator: /[-.]/ },
  { name: 'hyphen-dot-amp-dollar', separator: /[-.&$]/ },
  { name: 'all-nonrune-markers', separator: /[-.&$0-9§]/ },
];

const sensitivity = separatorModes.map((mode) => {
  const pages = collectRunePages(mode.separator);
  const allThree = pagesWithAllWordStarts(pages, base60Offsets);
  const primeLengthPages = allThree
    .filter((page) => page.targets.every((target) => isPrime(target.length)))
    .map((page) => page.page);
  return {
    mode: mode.name,
    pageCount: pages.length,
    allThreeWordStartPages: allThree,
    allPrimeLengthPages: primeLengthPages,
  };
});

for (const result of sensitivity) {
  assert.deepEqual(
    result.allThreeWordStartPages.map((page) => page.page),
    [0, 21]
  );
  assert.deepEqual(result.allPrimeLengthPages, [0]);
}

const pages = collectRunePages(/[-.&$0-9§]/);
const base60AllThree = pagesWithAllWordStarts(pages, base60Offsets);
const base59AllThree = pagesWithAllWordStarts(pages, base59Offsets);
assert.deepEqual(base59AllThree, []);

const p0 = pages.find((page) => page.page === 0);
const p21 = pages.find((page) => page.page === 21);
const p0Targets = base60Offsets.map((offset) => {
  const word = wordAtOneBasedRuneOffset(p0, offset);
  assert.ok(word);
  return {
    oneBasedRuneOffset: offset,
    zeroBasedWordOrdinal: word.ordinal,
    zeroBasedRuneStart: word.start,
    length: word.length,
    ciphertextIndices: p0.ciphertext.slice(word.start, word.end + 1),
  };
});
const p21Targets = base60Offsets.map((offset) => {
  const word = wordAtOneBasedRuneOffset(p21, offset);
  assert.ok(word);
  return {
    oneBasedRuneOffset: offset,
    zeroBasedWordOrdinal: word.ordinal,
    zeroBasedRuneStart: word.start,
    length: word.length,
  };
});

assert.deepEqual(p0Targets.map((target) => target.zeroBasedWordOrdinal), [52, 26, 18]);
assert.deepEqual(p0Targets.map((target) => target.length), [2, 5, 7]);
assert.deepEqual(p21Targets.map((target) => target.length), [5, 4, 11]);
assert.deepEqual(base60AllThree.map((page) => page.page), [0, 21]);

const parentScript = read('resources/historical/cicada2013-os-original-cicada.sh');
const invocationPosition = parentScript.indexOf('prime_echo');
const clearPosition = parentScript.indexOf('clear', invocationPosition);
assert.ok(invocationPosition >= 0 && clearPosition > invocationPosition);

console.log(JSON.stringify({
  source: {
    primeCount: primes.length,
    pauses,
    pauseRanks,
    blockCounts,
    primeEchoVisibleBeforeClear: true,
    pauseSemantics: 'No semantic labels in the scripts; 3301 is the terminal pause.',
  },
  candidate: {
    modulus: candidateModulus,
    wordIndices: selectedWordIndices,
    words: selectedWords,
    gp0Addresses,
    tableTokens: selectedTokens,
    base60Offsets,
    base59Offsets,
  },
  receiver: {
    runeBearingUnsolvedPages: pages.length,
    base60AllThreeWordStartPages: base60AllThree,
    base59AllThreeWordStartPages: base59AllThree,
    p0Targets,
    p21Targets,
    separatorSensitivity: sensitivity,
  },
  decision: 'Post-discovery structural alignment only; not a frozen blind holdout and not a plaintext recovery.',
}, null, 2));
