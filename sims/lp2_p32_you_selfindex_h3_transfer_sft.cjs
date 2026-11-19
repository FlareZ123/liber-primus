'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), 'utf8').replace(/\r/g, '');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, 'unmapped GP spelling: ' + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function H3(values) {
  assert.equal(values.length, 3);
  return [
    mod29(values[0] - values[2]),
    values[1],
    mod29(values[0] + values[2]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function H3inv(values) {
  assert.equal(values.length, 3);
  const inv2 = 15;
  return [
    mod29((values[0] + values[2]) * inv2),
    values[1],
    mod29((values[2] - values[0]) * inv2),
  ];
}

/**
 * Parse complete canonical words while preserving words that cross physical page
 * boundaries. Page-crossing words are excluded from the per-page complete-word
 * receiver census.
 *
 * @returns {Map<number,{start:number,end:number,values:number[]}[]>}
 */
function completeWordsByPage() {
  const result = new Map(
    Array.from({ length: 56 }, (_, page) => [page, []])
  );

  let current = [];
  let startPage = null;
  let startOffset = null;
  let lastPage = null;
  let lastOffset = null;

  function flush() {
    if (
      current.length &&
      startPage !== null &&
      startPage === lastPage &&
      startPage !== 50
    ) {
      result.get(startPage).push({
        start: startOffset,
        end: lastOffset,
        values: current.slice(),
      });
    }
    current = [];
    startPage = null;
    startOffset = null;
  }

  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    let runeOffset = 0;

    for (const character of [...physicalPart(page)]) {
      const value = runeToValue.get(character);
      if (value !== undefined) {
        if (!current.length) {
          startPage = page;
          startOffset = runeOffset;
        }
        current.push(value);
        lastPage = page;
        lastOffset = runeOffset;
        runeOffset += 1;
      } else if (
        character === '-' ||
        character === '.' ||
        character === '&'
      ) {
        flush();
      }
    }
  }
  flush();
  return result;
}

/**
 * Find period endpoints whose zero-based local rune offset equals the physical
 * page index. The terminal word length is measured from the local printed
 * fragment immediately preceding that period.
 *
 * @returns {{page:number,source:string,sourceLength:number,clauseEnd:number,terminalWordLength:number}[]}
 */
function selfIndexedPeriodRows(sourceWords) {
  const rows = [];

  for (let page = 0; page <= 42; page += 1) {
    let runeOffset = 0;
    let terminalWordLength = 0;
    let currentLength = 0;

    for (const character of [...physicalPart(page)]) {
      const value = runeToValue.get(character);
      if (value !== undefined) {
        runeOffset += 1;
        currentLength += 1;
        continue;
      }

      if (character === '-' || character === '&') {
        if (currentLength) terminalWordLength = currentLength;
        currentLength = 0;
        continue;
      }

      if (character === '.') {
        if (currentLength) terminalWordLength = currentLength;
        currentLength = 0;
        const clauseEnd = runeOffset - 1;
        if (clauseEnd === page) {
          rows.push({
            page,
            source: sourceWords[page],
            sourceLength: gp(sourceWords[page]).length,
            clauseEnd,
            terminalWordLength,
          });
        }
      }
    }
  }
  return rows;
}

const sourceStart = signed2016.indexOf('Hello.');
const sourceEnd = signed2016.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.ok(sourceStart >= 0 && sourceEnd > sourceStart);

const sourceWords = signed2016
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, '')
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[32], 'YOU');
assert.deepEqual(gp('YOU'), [26, 3, 1]);

// Source-visible receiver geometry, discovered before the transfer family.
const selfIndexed = selfIndexedPeriodRows(sourceWords);
assert.deepEqual(selfIndexed, [
  {
    page: 2,
    source: 'PATH',
    sourceLength: 3,
    clauseEnd: 2,
    terminalWordLength: 1,
  },
  {
    page: 32,
    source: 'YOU',
    sourceLength: 3,
    clauseEnd: 32,
    terminalWordLength: 3,
  },
]);

const wordsByPage = completeWordsByPage();
const p32Terminal = wordsByPage
  .get(32)
  .filter((word) => word.end === 32);

assert.deepEqual(p32Terminal, [{
  start: 30,
  end: 32,
  values: [0, 3, 2],
}]);

// The seed is an exact reversible local YOU candidate.
const cipher = p32Terminal[0].values;
const target = gp('YOU');
const directKey = cipher.map((value, index) =>
  mod29(value - target[index])
);
const correctionShell = H3(directKey);

assert.deepEqual(cipher, [0, 3, 2]);
assert.deepEqual(target, [26, 3, 1]);
assert.deepEqual(directKey, [state.e, 0, state.a - state.g]);
assert.deepEqual(H3(cipher), [27, state.e, state.K]);
assert.deepEqual(H3(cipher), [mod29(-state.K), state.e, state.K]);
assert.deepEqual(correctionShell, [state.K, 0, state.q]);
assert.deepEqual(H3inv(correctionShell), directKey);

const recovered = H3inv(
  H3(cipher).map((value, index) =>
    mod29(value - correctionShell[index])
  )
);
assert.deepEqual(recovered, target);
assert.deepEqual(
  target.map((value, index) => mod29(value + directKey[index])),
  cipher
);

// Exact ciphertext packet uniqueness among complete three-rune words.
const exactPacketHits = [];
let totalCompleteThreeRuneWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of wordsByPage.get(page)) {
    if (word.values.length !== 3) continue;
    totalCompleteThreeRuneWords += 1;
    if (word.values.join(',') === cipher.join(',')) {
      exactPacketHits.push({ page, start: word.start, end: word.end });
    }
  }
}
assert.equal(totalCompleteThreeRuneWords, 716);
assert.deepEqual(exactPacketHits, [{ page: 32, start: 30, end: 32 }]);

// Prospective transfer frozen in the precommit: same source/page index, every
// complete three-rune receiver, exact unchanged H3 correction [K,0,q].
const eligible = [];
const transferHits = [];
let holdoutReceiverCount = 0;

for (let index = 0; index < sourceWords.length; index += 1) {
  if (index === 32) continue;
  const sourceTarget = gp(sourceWords[index]);
  if (sourceTarget.length !== 3) continue;

  const receivers = wordsByPage
    .get(index)
    .filter((word) => word.values.length === 3);

  holdoutReceiverCount += receivers.length;
  const row = {
    index,
    source: sourceWords[index],
    receiverCount: receivers.length,
  };
  eligible.push(row);

  for (const receiver of receivers) {
    const plaintext = H3inv(
      H3(receiver.values).map((value, shellIndex) =>
        mod29(value - correctionShell[shellIndex])
      )
    );
    if (plaintext.join(',') === sourceTarget.join(',')) {
      transferHits.push({
        index,
        source: sourceWords[index],
        start: receiver.start,
        end: receiver.end,
        cipher: receiver.values,
        plaintext,
      });
    }
  }
}

assert.deepEqual(
  eligible,
  [
    { index: 2, source: 'PATH', receiverCount: 5 },
    { index: 13, source: 'WAY', receiverCount: 9 },
    { index: 14, source: 'ITS', receiverCount: 8 },
    { index: 16, source: 'ARE', receiverCount: 16 },
    { index: 18, source: 'MAP', receiverCount: 16 },
    { index: 24, source: 'AND', receiverCount: 17 },
    { index: 27, source: 'ARE', receiverCount: 13 },
    { index: 31, source: 'AND', receiverCount: 19 },
  ]
);
assert.equal(holdoutReceiverCount, 103);
assert.deepEqual(transferHits, []);

console.log(JSON.stringify({
  status: 'PASS',
  localCandidate: {
    sourceIndex: 32,
    sourceWord: 'YOU',
    selector: 'unique page-index period endpoint with matching source GP length',
    receiver: { page: 32, start: 30, end: 32, cipher },
    H3Cipher: H3(cipher),
    directKey,
    H3Key: correctionShell,
    recovered,
    exactPacketHits,
  },
  transfer: {
    precommittedCorrection: correctionShell,
    eligible,
    holdoutReceiverCount,
    hits: transferHits,
    decision:
      'Zero transfer hits. Preserve p32 YOU as a source/layout-selected local candidate; reject [K,0,q] as a general same-index three-rune decoder.',
  },
}, null, 2));
