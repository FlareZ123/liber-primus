'use strict';

// Bounded test: p55's 75-rune body against source-fixed windows of the
// original 2013 prime_echo stream, using the solved-p56 prime-totient
// subtraction and literal-F transparent bypass rule.
//
// Run from the repository root:
//   node sims/p55_prime_echo_boundary_window_sft.cjs

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpusPath = path.join(root, 'resources/liber-primus/lp2-corpus.json');
const sourcePath = path.join(root, 'resources/historical/cicada2013-os-original-prime-echo.sh');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const primeEchoSource = fs.readFileSync(sourcePath, 'utf8');

assert(primeEchoSource.includes('1033'), '2013 prime_echo source must retain the 1033 pause');
assert(primeEchoSource.includes('3301'), '2013 prime_echo source must retain the 3301 endpoint');

const p55 = corpus.pages.find(page => page.page === 55);
assert(p55, 'canonical LP2 corpus must contain p55');
assert.equal(p55.indices.length, 76, 'p55 includes one inherited p54 carry plus 75 body runes');

const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 75);
const body = p55.indices.slice(1);
assert.equal(body.length, 75);
const bodyFPositions = body.map((rune, i) => rune === 0 ? i + 1 : null).filter(Boolean);
assert.deepEqual(bodyFPositions, [15, 25, 41], 'p55 body 1-based F positions must match original page-local positions 15,25,41');

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primes = firstPrimes(464);
assert.equal(primes[102], 563, '563 is the 103rd prime');
assert.equal(primes[103], 569, '569 is the 104th prime');
assert.equal(primes[173], 1033, '1033 is the 174th prime');
assert.equal(primes[463], 3301, '3301 is the 464th prime');

function indexOfCoincidence(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  const n = indices.length;
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
}

function wordsFrom(indices) {
  const words = [];
  let offset = 0;
  for (const length of wordLengths) {
    words.push(indices.slice(offset, offset + length).map(x => corpus.translit[x]).join(''));
    offset += length;
  }
  assert.equal(offset, indices.length);
  return words;
}

function decodeAtPrimeOrdinal(startOrdinal) {
  assert(startOrdinal >= 1 && startOrdinal + 74 <= primes.length);
  const key = primes
    .slice(startOrdinal - 1, startOrdinal - 1 + 75)
    .map(prime => (prime - 1) % 29); // phi(prime) mod 29

  // At ciphertext F, branch between a transparent plaintext F (no key
  // consumption) and an encrypted non-F. A non-F ciphertext may not decode
  // to plaintext F, because the historical cipher bypasses plaintext F.
  let states = [{ cursor: 0, out: [], branch: '' }];
  let firstDeadPosition = null;

  for (let i = 0; i < body.length; i++) {
    const ciphertext = body[i];
    const nextStates = [];

    for (const state of states) {
      if (ciphertext === 0) {
        nextStates.push({
          cursor: state.cursor,
          out: state.out.concat(0),
          branch: state.branch + 'B'
        });

        const k = key[state.cursor];
        if (k !== undefined) {
          const plaintext = (ciphertext - k + 29) % 29;
          if (plaintext !== 0) {
            nextStates.push({
              cursor: state.cursor + 1,
              out: state.out.concat(plaintext),
              branch: state.branch + 'E'
            });
          }
        }
      } else {
        const k = key[state.cursor];
        if (k !== undefined) {
          const plaintext = (ciphertext - k + 29) % 29;
          if (plaintext !== 0) {
            nextStates.push({
              cursor: state.cursor + 1,
              out: state.out.concat(plaintext),
              branch: state.branch
            });
          }
        }
      }
    }

    states = nextStates;
    if (states.length === 0) {
      firstDeadPosition = i + 1;
      break;
    }
  }

  const outputs = states.map(state => ({
    branch: state.branch,
    consumedKeys: state.cursor,
    ioc: indexOfCoincidence(state.out),
    words: wordsFrom(state.out).join(' '),
    indices: state.out
  }));

  return {
    startOrdinal,
    startPrime: primes[startOrdinal - 1],
    endPrime: primes[startOrdinal + 73],
    stateCount: states.length,
    firstDeadPosition,
    outputs
  };
}

// These are source-fixed alignments, not a free phase search:
// 1   = solved-p56 start convention (baseline);
// 100 = final 75 primes ending at the p05 square's 1033 boundary;
// 103/104 = prime ordinals of the 2016 image's 563x569 dimensions;
// 174/175 = the 1033 prime and the first prime after that pause;
// 390 = final 75 primes ending at the 2014 square / prime_echo 3301 endpoint.
const starts = [1, 100, 103, 104, 174, 175, 390];
const results = starts.map(decodeAtPrimeOrdinal);
const byStart = Object.fromEntries(results.map(result => [result.startOrdinal, result]));

for (const start of [1, 103, 104, 175]) {
  assert.equal(byStart[start].stateCount, 0, 'source-fixed start should have no valid F-bypass parse: ' + start);
}
assert.equal(byStart[100].stateCount, 3);
assert.equal(byStart[174].stateCount, 1);
assert.equal(byStart[390].stateCount, 1);

const surviving = results.flatMap(result => result.outputs);
assert(surviving.every(output => output.ioc < 0.033), 'every surviving output must remain below IoC 0.033');
assert.deepEqual(byStart[174].outputs.map(x => x.branch), ['BBB']);
assert.deepEqual(byStart[390].outputs.map(x => x.branch), ['EBB']);
assert.deepEqual(byStart[100].outputs.map(x => x.branch), ['BBE', 'BEB', 'EBB']);


const p55Words = [];
let wordOffset = 0;
for (const length of wordLengths) {
  p55Words.push(body.slice(wordOffset, wordOffset + length));
  wordOffset += length;
}
assert.equal(wordOffset, 75);
assert.equal(p55Words.length, 16);

function wordBlockGate(stripCircumferences) {
  const segments = stripCircumferences ? p55Words.map(w => w.slice(1, -1)) : p55Words;
  const perWord = [];
  const noBypassIndices = [];
  let globalParseCount = 1;

  for (let i = 0; i < segments.length; i++) {
    const blockStart = i * 29;
    const key = primes.slice(blockStart, blockStart + 29).map(p => (p - 1) % 29);
    const segment = segments[i];
    let states = [{ cursor: 0, out: [], branch: '' }];
    let firstDeadPosition = null;
    let firstDeadWitness = null;

    for (let j = 0; j < segment.length; j++) {
      const ct = segment[j];
      const previous = states;
      const next = [];
      for (const state of previous) {
        const k = key[state.cursor];
        if (ct === 0) {
          next.push({ cursor: state.cursor, out: state.out.concat(0), branch: state.branch + 'B' });
          if (k !== undefined) {
            const pt = (ct - k + 29) % 29;
            if (pt !== 0) next.push({ cursor: state.cursor + 1, out: state.out.concat(pt), branch: state.branch + 'E' });
          }
        } else if (k !== undefined) {
          const pt = (ct - k + 29) % 29;
          if (pt !== 0) next.push({ cursor: state.cursor + 1, out: state.out.concat(pt), branch: state.branch });
        }
      }
      states = next;
      if (!states.length) {
        firstDeadPosition = j + 1;
        const state = previous[0];
        const keyValue = key[state.cursor];
        const keyPrimeOrdinal = blockStart + state.cursor + 1;
        const keyPrime = primes[keyPrimeOrdinal - 1];
        const forcedPlaintextIndex = (ct - keyValue + 29) % 29;
        firstDeadWitness = {
          localPosition: j + 1,
          ciphertextIndex: ct,
          ciphertextRune: corpus.translit[ct],
          keyPrimeOrdinal,
          keyPrime,
          keyValue,
          forcedPlaintextIndex,
          forcedPlaintextRune: corpus.translit[forcedPlaintextIndex]
        };
        break;
      }
    }

    globalParseCount *= states.length;
    const noBypass = segment.map((ct, j) => (ct - key[j] + 29) % 29);
    noBypassIndices.push(...noBypass);
    perWord.push({
      word: i + 1,
      originalLength: p55Words[i].length,
      testedLength: segment.length,
      blockPrimeStart: primes[blockStart],
      blockPrimeEnd: primes[blockStart + 28],
      fBypassStateCount: states.length,
      firstDeadPosition,
      firstDeadWitness,
      fBypassOutputs: states.map(s => ({ branch: s.branch, output: s.out.map(x => corpus.translit[x]).join('') })),
      noBypassOutput: noBypass.map(x => corpus.translit[x]).join('')
    });
  }

  const failed = perWord.find(x => x.fBypassStateCount === 0);
  return {
    mapping: stripCircumferences ? 'one 29-prime block per word, strict interiors' : 'one 29-prime block per word, complete words',
    wordCount: p55Words.length,
    testedRuneCount: segments.reduce((n, x) => n + x.length, 0),
    globalFBypassParseCount: globalParseCount,
    firstFailedWord: failed ? failed.word : null,
    perWord,
    noBypassIoC: indexOfCoincidence(noBypassIndices),
    noBypassOutput: perWord.map(x => x.noBypassOutput).join(' ')
  };
}

const wordBlockFull = wordBlockGate(false);
const wordBlockInterior = wordBlockGate(true);
assert.equal(wordBlockFull.globalFBypassParseCount, 0);
assert.equal(wordBlockFull.firstFailedWord, 3);
assert.deepEqual(wordBlockFull.perWord[2].firstDeadWitness, {
  localPosition: 2, ciphertextIndex: 19, ciphertextRune: 'M',
  keyPrimeOrdinal: 60, keyPrime: 281, keyValue: 19,
  forcedPlaintextIndex: 0, forcedPlaintextRune: 'F'
});
assert.equal(wordBlockInterior.globalFBypassParseCount, 0);
assert.equal(wordBlockInterior.firstFailedWord, 4);
assert.deepEqual(wordBlockInterior.perWord[3].firstDeadWitness, {
  localPosition: 4, ciphertextIndex: 2, ciphertextRune: 'TH',
  keyPrimeOrdinal: 91, keyPrime: 467, keyValue: 2,
  forcedPlaintextIndex: 0, forcedPlaintextRune: 'F'
});
assert(Math.abs(wordBlockFull.noBypassIoC - 0.03495495495495495) < 1e-12);
assert(Math.abs(wordBlockInterior.noBypassIoC - 0.03211517165005537) < 1e-12);

const report = {
  test: 'p55 75-body source-fixed 2013 prime_echo phi-prime windows with p56 F bypass',
  sourcePrimeCount: primes.length,
  sourcePrimeEndpoint: primes[463],
  p55BodyLength: body.length,
  p55BodyFPositions1Based: bodyFPositions,
  selectedStarts: results,
  wordBlockFull,
  wordBlockInterior
};

process.stdout.write(JSON.stringify(report, null, 2) + '\n');
