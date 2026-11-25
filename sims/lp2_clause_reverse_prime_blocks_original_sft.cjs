'use strict';

/**
 * Exact source test for clause-local reversal of the authentic p56
 * prime-minus-one stream. The proposed rule is:
 *
 *   - Each physical chapter starts at prime index 0.
 *   - A clause with m consuming runes uses K[j+m-1],...,K[j].
 *   - Literal plaintext F (GP index 0) is transparent and consumes no key.
 *   - Only actual printed full stops delimit the reversed blocks.
 *   - The prime cursor otherwise advances continuously within a chapter.
 *
 * Read-only SFT:
 *   node sims/lp2_clause_reverse_prime_blocks_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/transcriptions/lp2-image-corrected.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcript.split('%');

assert.equal(sections.length, 57,
  'The transcription omits the rune-free physical p50 numeric grid.');
assert.equal(corpus.runes.length, 29);
assert.deepEqual(corpus.translit, [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
]);

// Physical chapter boundaries established by the original page layout.
// p50 is the numeric grid and has no rune transcription section.
const chapterRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];

const sourceTape = corpus.pages
  .filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(sourceTape.length, 12956);

const chapters = [];
const parsedTape = [];
let fullStopCount = 0;

for (const [firstPage, lastPage] of chapterRanges) {
  const clauses = [];
  let current = [];
  let chapterRuneCount = 0;
  let chapterFullStops = 0;

  for (let page = firstPage; page <= lastPage; page++) {
    if (page === 50) continue;
    const sectionIndex = page < 50 ? page : page - 1;
    const section = sections[sectionIndex];
    assert.ok(section !== undefined, 'Missing physical page ' + page);

    for (const symbol of section) {
      if (runeIndex.has(symbol)) {
        const value = runeIndex.get(symbol);
        current.push(value);
        parsedTape.push(value);
        chapterRuneCount++;
      } else if (symbol === '.') {
        chapterFullStops++;
        fullStopCount++;
        if (current.length) {
          clauses.push(current);
          current = [];
        }
      }
      // Hyphens, paragraph/segment marks, line breaks and page turns do
      // not reset this hypothesis. Only the original full-stop glyph
      // ends a reversed key block.
    }
  }

  assert.equal(current.length, 0,
    'Each frozen physical chapter ends at a full stop: ' +
    firstPage + '-' + lastPage);
  assert.equal(clauses.length, chapterFullStops);
  chapters.push({
    pages: [firstPage, lastPage],
    runeCount: chapterRuneCount,
    fullStops: chapterFullStops,
    clauses
  });
}

assert.deepEqual(parsedTape, sourceTape,
  'Corrected transcription must reproduce all original GP29 ciphertext.');
assert.equal(parsedTape.length, 12956);
assert.equal(fullStopCount, 173);
assert.deepEqual(chapters.map(x => x.runeCount),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.deepEqual(chapters.map(x => x.fullStops),
  [9,18,27,21,9,23,22,42,2]);

const maxChapterLength = Math.max(...chapters.map(x => x.runeCount));
const neededPrimes = maxChapterLength + 64;
const sieve = new Uint8Array(50000);
const primes = [];
for (let n = 2; n < sieve.length && primes.length < neededPrimes; n++) {
  if (sieve[n]) continue;
  primes.push(n);
  if (n * n < sieve.length) {
    for (let k = n * n; k < sieve.length; k += n) sieve[k] = 1;
  }
}
assert.ok(primes.length >= neededPrimes);
const key = primes.map(p => (p - 1) % 29);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Read a ciphertext clause from right to left. Reversing the allocated
 * block means its rightmost consuming rune receives K[j], its next
 * consuming rune receives K[j+1], and so on.
 *
 * For C=F, branch both ways:
 *   1. literal plaintext F, no key consumed;
 *   2. consume K[j+used] only if the resulting plaintext is non-F.
 * For C!=F, consumption is mandatory and plaintext F is forbidden.
 *
 * The returned Map is the exact count of paths by number of consumed keys.
 */
function decodeReversedClause(ciphertext, startCursor) {
  let states = new Map([[0, 1n]]);
  let maxReverseSuffix = 0;

  for (let i = ciphertext.length - 1; i >= 0; i--) {
    const c = ciphertext[i];
    const next = new Map();

    for (const [used, count] of states) {
      if (c === 0) {
        next.set(used, (next.get(used) || 0n) + count);
      }

      const plain = mod(c - key[startCursor + used]);
      if (plain !== 0) {
        next.set(used + 1, (next.get(used + 1) || 0n) + count);
      }
    }

    states = next;
    if (states.size) {
      maxReverseSuffix = ciphertext.length - i;
    } else {
      return { ends: states, maxReverseSuffix };
    }
  }

  return { ends: states, maxReverseSuffix };
}

function sumBigInt(values) {
  let total = 0n;
  for (const value of values) total += value;
  return total;
}

function solveChapter(chapter) {
  let states = new Map([[0, 1n]]);
  let previousRunes = 0;
  const history = [];

  for (let index = 0; index < chapter.clauses.length; index++) {
    const clause = chapter.clauses[index];
    const next = new Map();
    let maxReverseSuffix = 0;

    for (const [cursor, prefixPaths] of states) {
      const decoded = decodeReversedClause(clause, cursor);
      maxReverseSuffix = Math.max(
        maxReverseSuffix, decoded.maxReverseSuffix
      );

      for (const [used, clausePaths] of decoded.ends) {
        const endCursor = cursor + used;
        next.set(endCursor,
          (next.get(endCursor) || 0n) + prefixPaths * clausePaths);
      }
    }

    const paths = sumBigInt(next.values());
    const row = {
      clause: index + 1,
      length: clause.length,
      incomingCursors: [...states.keys()].sort((a, b) => a - b),
      outgoingCursors: [...next.keys()].sort((a, b) => a - b),
      paths: paths.toString(),
      maxReverseSuffix
    };
    history.push(row);

    if (!next.size) {
      return {
        complete: false,
        completedClauses: index,
        previousRunes,
        fail: {
          clause: index + 1,
          length: clause.length,
          maxReverseSuffix,
          incomingCursors: row.incomingCursors,
          pathsBeforeFailure: sumBigInt(states.values()).toString()
        },
        finalCursorStates: row.incomingCursors,
        history
      };
    }

    previousRunes += clause.length;
    states = next;
  }

  return {
    complete: true,
    completedClauses: chapter.clauses.length,
    previousRunes,
    fail: null,
    finalCursorStates: [...states.keys()].sort((a, b) => a - b),
    totalPaths: sumBigInt(states.values()).toString(),
    history
  };
}

const originalResults = chapters.map(chapter => ({
  pages: chapter.pages,
  runes: chapter.runeCount,
  fullStops: chapter.fullStops,
  clauses: chapter.clauses.length,
  ...solveChapter(chapter)
}));

const expectedFailures = [
  [5,297,53,30,'16',[287]],
  [2,16,103,19,'1',[16]],
  [2,40,94,41,'1',[40]],
  [3,20,226,76,'4',[18,19,20]],
  [2,16,320,33,'1',[16]],
  [2,19,125,24,'1',[19]],
  [1,0,10,4,'1',[0]],
  [2,29,46,19,'2',[27,28]],
  [2,9,299,43,'1',[9]]
];
assert.equal(originalResults.filter(x => x.complete).length, 0);
for (let i = 0; i < originalResults.length; i++) {
  const result = originalResults[i];
  const expected = expectedFailures[i];
  assert.equal(result.fail.clause, expected[0]);
  assert.equal(result.previousRunes, expected[1]);
  assert.equal(result.fail.length, expected[2]);
  assert.equal(result.fail.maxReverseSuffix, expected[3]);
  assert.equal(result.fail.pathsBeforeFailure, expected[4]);
  assert.deepEqual(result.fail.incomingCursors, expected[5]);
}

// Authentic p56 control: the known 85-rune plaintext uses K_j=phi(p_j)
// with the single literal F at offset 56 held without consuming a prime.
const p56Cipher = corpus.pages.find(page => page.page === 56).indices;
assert.equal(p56Cipher.length, 85);
function sectionRunes(sectionIndex) {
  return [...sections[sectionIndex]]
    .filter(symbol => runeIndex.has(symbol))
    .map(symbol => runeIndex.get(symbol));
}
assert.deepEqual(sectionRunes(55), p56Cipher);
const p57Plain = corpus.pages.find(page => page.page === 57).indices;
assert.deepEqual(sectionRunes(56), p57Plain);

let p56Used = 0;
const p56Plain = p56Cipher.map((c, i) => {
  if (i === 56) return 0;
  return mod(c - key[p56Used++]);
});
assert.equal(p56Used, 84);
assert.deepEqual(
  p56Plain.map(value => corpus.translit[value]).join(' '),
  'A N E N D W I TH I N TH E D E E P W E B TH E R E E X I S T S A P A G E TH A T H A S H E S T O I T I S TH E D U T Y O F E U E R Y P I L G R I M T O S E E C O U T TH I S P A G E'
);
function encryptStandard(plain, start) {
  let used = 0;
  return plain.map(value => value === 0
    ? 0
    : mod(value + key[start + used++]));
}
assert.deepEqual(encryptStandard(p56Plain, 0), p56Cipher);

// The p56/p57 source punctuation provides unequal native clause lengths.
function pageClauses(sectionIndex) {
  const clauses = [];
  let current = [];
  for (const symbol of sections[sectionIndex]) {
    if (runeIndex.has(symbol)) {
      current.push(runeIndex.get(symbol));
    } else if (symbol === '.' && current.length) {
      clauses.push(current);
      current = [];
    }
  }
  if (current.length) clauses.push(current);
  return clauses;
}

function encryptReversedClause(plain, startCursor) {
  const consuming = plain.filter(value => value !== 0).length;
  let used = 0;
  let literalHolds = 0;
  let consumingCipherZeros = 0;

  const ciphertext = plain.map(value => {
    if (value === 0) {
      literalHolds++;
      return 0;
    }
    const c = mod(value + key[startCursor + consuming - 1 - used]);
    used++;
    if (c === 0) consumingCipherZeros++;
    return c;
  });

  assert.equal(used, consuming);
  return {
    ciphertext,
    consumed: used,
    literalHolds,
    consumingCipherZeros
  };
}

function verifyKnownReversedPath(ciphertext, expectedPlain, startCursor) {
  let used = 0;
  let literalHolds = 0;
  let consumingCipherZeros = 0;
  const decoded = new Array(ciphertext.length);

  for (let i = ciphertext.length - 1; i >= 0; i--) {
    const c = ciphertext[i];
    if (expectedPlain[i] === 0) {
      assert.equal(c, 0);
      decoded[i] = 0;
      literalHolds++;
      continue;
    }

    const plain = mod(c - key[startCursor + used]);
    assert.equal(plain, expectedPlain[i]);
    assert.notEqual(plain, 0);
    if (c === 0) consumingCipherZeros++;
    decoded[i] = plain;
    used++;
  }

  assert.deepEqual(decoded, expectedPlain);
  const replay = encryptReversedClause(decoded, startCursor);
  assert.deepEqual(replay.ciphertext, ciphertext);
  assert.equal(replay.consumed, used);

  // The same expected path must be present in the unrestricted DP.
  const support = decodeReversedClause(ciphertext, startCursor);
  assert.ok(support.ends.has(used));

  return { literalHolds, consumingCipherZeros, consumed: used };
}

function plant(name, plaintext, sectionIndex, startCursor, expectedLengths) {
  const sourceClauses = pageClauses(sectionIndex);
  const lengths = sourceClauses.map(clause => clause.length);
  assert.deepEqual(lengths, expectedLengths);
  assert.equal(lengths.reduce((a, b) => a + b, 0), plaintext.length);

  let cursor = startCursor;
  let literalHolds = 0;
  let consumingCipherZeros = 0;
  let ciphertextZeros = 0;
  let offset = 0;

  for (const clauseLength of lengths) {
    const plainClause = plaintext.slice(offset, offset + clauseLength);
    offset += clauseLength;
    const encrypted = encryptReversedClause(plainClause, cursor);
    const checked = verifyKnownReversedPath(
      encrypted.ciphertext, plainClause, cursor
    );

    assert.equal(checked.literalHolds, encrypted.literalHolds);
    assert.equal(checked.consumingCipherZeros,
      encrypted.consumingCipherZeros);

    literalHolds += checked.literalHolds;
    consumingCipherZeros += checked.consumingCipherZeros;
    ciphertextZeros += encrypted.ciphertext.filter(x => x === 0).length;
    cursor += encrypted.consumed;
  }

  assert.ok(new Set(lengths).size > 1,
    'Native plant must contain unequal clauses.');
  assert.ok(literalHolds > 0, 'Native plant must contain literal F holds.');
  assert.ok(consumingCipherZeros > 0,
    'Native plant must contain ciphertext F values that consume keys.');

  return {
    name,
    startCursor,
    plaintextRunes: plaintext.length,
    clauses: lengths.length,
    clauseLengths: lengths,
    literalHolds,
    consumingCipherZeros,
    ciphertextZeroCount: ciphertextZeros,
    finalCursor: cursor,
    exactInverseAndForwardReplay: true
  };
}

const controls = [
  plant('p56 known plaintext / original punctuation', p56Plain, 55, 0,
    [5,14,26,40]),
  plant('p57 clear text / original punctuation', p57Plain, 56, 0,
    [7,30,30,28]),
  plant('p57 clear text / planted start 17', p57Plain, 56, 17,
    [7,30,30,28])
];

assert.equal(controls[0].literalHolds, 1);
assert.equal(controls[0].consumingCipherZeros, 2);
assert.equal(controls[1].literalHolds, 3);
assert.equal(controls[1].consumingCipherZeros, 6);
assert.equal(controls[2].literalHolds, 3);
assert.equal(controls[2].consumingCipherZeros, 3);

const output = {
  model: 'within each full-stop clause, reverse the allocated consecutive prime-minus-one block; transparent plaintext F; continuous cursor across clauses; reset at nine physical chapter starts',
  source: {
    corpus: 'resources/liber-primus/lp2-corpus.json',
    transcription: 'resources/transcriptions/lp2-image-corrected.txt',
    originalRunes: parsedTape.length,
    correctedFullStops: fullStopCount,
    chapterPages: chapters.map(chapter => chapter.pages),
    chapterRunes: chapters.map(chapter => chapter.runeCount),
    chapterClauses: chapters.map(chapter => chapter.clauses.length)
  },
  authenticP56Control: {
    ciphertextRunes: p56Cipher.length,
    plaintextRunes: p56Plain.length,
    consumedPrimes: p56Used,
    literalFOffsets: p56Plain.map((value, i) => value === 0 ? i : -1)
      .filter(i => i >= 0),
    exactForwardReplay: true
  },
  reversedBlockNativePlants: controls,
  originalResults,
  decision: 'No complete legal inverse in any of the nine chapters under the frozen rule.'
};

console.log(JSON.stringify(output, null, 2));
