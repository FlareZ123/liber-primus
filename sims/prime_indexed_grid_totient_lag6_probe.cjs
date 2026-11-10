'use strict';
/**
 * Source-fixed test of a prime-indexed base-60 grid key under the proposed
 * LP2 lag-six collision-repair inverse.
 *
 * Motivation:
 *   - The 2016 archived image is reported as 563x569, so its dimensions select
 *     offsets 51 and 57 modulo the 256-byte p49-p51 table and differ by 6.
 *   - The solved LP2 p56 cipher uses phi(p_n) = p_n - 1 modulo 29.
 *   - Interpret each grid byte b as a zero-based prime ordinal and map it to
 *     (p_(b+1)-1) mod 29. This is a source-derived candidate key, not a claim
 *     that the interpretation is intended.
 *   - Also test the six-symbol recurrence seeds obtained from the same
 *     prime-totient map and the source-selected grid path.
 *
 * The outer T6 collision-repair layer is itself provisional. We use the
 * already published inverse and source-trained Shakespeare trigram model.
 * The test is finite and negative/positive controls distinguish a bad key
 * from a broken inverse. No plaintext is asserted.
 *
 * Node 22, built-ins only:
 *   node sims/prime_indexed_grid_totient_lag6_probe.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const { corpusWords } = require('./relative_key_english_probe.cjs');
const { trainTrigram } = require('./relative_key_trigram_probe.cjs');
const { encipher } = require('./lag6_repair_keyed_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const GP = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GRID = JSON.parse(read('resources/liber-primus/base60-grid.json')).byte_rows;
const TEXT = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');
const SHAKESPEARE = read('resources/control/shakespeare_first300k.txt');
const MOD = 29, N = 31, START = 29, END = 30, Q = 0.81;
const WIDTH = 563, HEIGHT = 569;
const mod = n => ((n % MOD) + MOD) % MOD;

function originalRows() {
  const byRune = new Map(GP.runes.map((rune, i) => [rune, i]));
  const rows = [];
  let page = 0, section = 0, word = 0, inWord = false;
  for (const ch of TEXT) {
    const glyph = byRune.get(ch);
    if (glyph !== undefined) {
      rows.push({ glyph, page: page >= 50 ? page + 1 : page, section, word });
      inWord = true;
    } else if (ch === '%') {
      page++;
    } else if (ch === '$') {
      if (inWord) { word++; inWord = false; }
      section++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Printed line and page wraps do not terminate a word.
    } else if (inWord) {
      word++;
      inWord = false;
    }
  }
  if (inWord) word++;
  assert.equal(rows.length, 12956);
  assert.equal(word, 2896);
  assert.equal(section, 8);
  assert.deepEqual(rows.map(x => x.glyph), GP.pages
    .filter(p => p.page < 56 && p.indices.length)
    .flatMap(p => p.indices));
  return rows;
}
const ROWS = originalRows();
const parsed = parseSharedCorpus();
const CIPHER_WORDS = parsed.words.map(w => [...w.runes].map(r =>
  GP.runes.indexOf(r)));
assert.equal(CIPHER_WORDS.length, 2896);
assert.equal(CIPHER_WORDS.flat().length, 12956);
assert.deepEqual(CIPHER_WORDS.flat(), ROWS.map(x => x.glyph));
const WORD_START = ROWS.map((row, i) => i === 0 || row.word !== ROWS[i - 1].word);

function primeList(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}
const PRIMES = primeList(256);
const GRID_BYTES = GRID.flat();
assert.equal(GRID.length, 32);
assert.ok(GRID.every(row => row.length === 8));
assert.equal(GRID_BYTES.length, 256);

// The byte is a zero-based prime ordinal: byte 0 selects the first prime 2.
const PRIME_INDEXED_GRID = GRID_BYTES.map(b => (PRIMES[b] - 1) % MOD);
const gridStart = WIDTH % 256, gridNext = HEIGHT % 256;
assert.deepEqual([gridStart, gridNext, HEIGHT - WIDTH], [51, 57, 6]);
assert.deepEqual([GRID_BYTES[51], GRID_BYTES[57]], [59, 118]);
assert.deepEqual([PRIME_INDEXED_GRID[51], PRIME_INDEXED_GRID[57]], [19, 14]);
assert.equal(mod(PRIME_INDEXED_GRID[57] - PRIME_INDEXED_GRID[51]), 24);

const PATH_BYTES = [];
let pathRow = 6, pathColumn = 3;
for (let i = 0; i < 32; i++) {
  PATH_BYTES.push(GRID[pathRow][pathColumn]);
  pathRow = (pathRow + 1) % 32;
  pathColumn = (pathColumn - 2 + 8) % 8;
}
assert.deepEqual(PATH_BYTES.slice(0, 2), [59, 118]);
const PATH_KEY = PATH_BYTES.map(b => (PRIMES[b] - 1) % MOD);

const p53 = GP.pages.find(p => p.page === 53).indices;
const p54 = GP.pages.find(p => p.page === 54).indices;
const p55 = GP.pages.find(p => p.page === 55).indices;
const SECOND_HALF = [...p53.slice(128), p54[0], ...p55];
assert.equal(SECOND_HALF.length, 128);
const SEEDS = {
  'diagonal-prime-totient': PATH_BYTES.slice(0, 6)
    .map(b => (PRIMES[b] - 1) % MOD),
  'row-major-prime-totient': GRID_BYTES.slice(51, 57)
    .map(b => (PRIMES[b] - 1) % MOD),
  'rune-prime-totient': SECOND_HALF.slice(51, 57)
    .map(r => (GP.prime[r] - 1) % MOD)
};

// The selected modular delta is not rare across all lag-six grid positions.
const lag6Delta24 = [];
const byteDoublings = [];
for (let i = 0; i + 6 < 256; i++) {
  if (mod(PRIME_INDEXED_GRID[i + 6] - PRIME_INDEXED_GRID[i]) === 24)
    lag6Delta24.push(i);
  if (GRID_BYTES[i + 6] === 2 * GRID_BYTES[i]) byteDoublings.push(i);
}
assert.equal(lag6Delta24.length, 10);
assert.deepEqual(byteDoublings, [51]);

function groupAt(row, reset) {
  return reset === 'global' ? 0 : row[reset];
}
function periodicPad(key, phase, direction, reset) {
  const seq = direction === 'forward' ? key : key.slice().reverse();
  const pad = new Array(ROWS.length);
  let pointer = 0, group = null;
  for (let i = 0; i < ROWS.length; i++) {
    const nextGroup = groupAt(ROWS[i], reset);
    if (i === 0 || nextGroup !== group) pointer = 0;
    pad[i] = seq[(phase + pointer) % seq.length];
    pointer++;
    group = nextGroup;
  }
  return pad;
}
function recurrencePad(seed, reset) {
  const pad = new Array(ROWS.length);
  let state = [], pointer = 0, group = null;
  for (let i = 0; i < ROWS.length; i++) {
    const nextGroup = groupAt(ROWS[i], reset);
    if (i === 0 || nextGroup !== group) {
      state = [];
      pointer = 0;
    }
    const value = pointer < 6 ? seed[pointer]
      : mod(24 - 2 * state[pointer - 6]);
    state.push(value);
    pad[i] = value;
    pointer++;
    group = nextGroup;
  }
  return pad;
}

function forcedRecurrencePad(seed, key, phase, direction, reset, keySign) {
  const seq = direction === 'forward' ? key : key.slice().reverse();
  const pad = new Array(ROWS.length);
  let state = [], pointer = 0, group = null;
  for (let i = 0; i < ROWS.length; i++) {
    const nextGroup = groupAt(ROWS[i], reset);
    if (i === 0 || nextGroup !== group) {
      state = [];
      pointer = 0;
    }
    const input = mod(keySign * seq[(phase + pointer) % seq.length]);
    const value = pointer < 6 ? seed[pointer]
      : mod(24 - 2 * state[pointer - 6] + input);
    state.push(value);
    pad[i] = value;
    pointer++;
    group = nextGroup;
  }
  return pad;
}

/** Exact two-candidate inverse for the proposed T6 collision-repair layer. */
function inverseCandidates(cipherWords, pad, sign) {
  const result = [];
  let previous = -1, offset = 0;
  for (const word of cipherWords) {
    const wordOptions = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j];
      const t = j >= 6 ? mod(24 - 2 * word[j - 6]) : -1;
      const literal = mod(c - sign * pad[offset]);
      const same = c === previous;
      const literalLikelihood = same
        ? (j >= 6 && t === previous ? 1 : 1 - Q)
        : 1;
      const options = [{ c: literal, e: Math.log(literalLikelihood) }];
      if (previous >= 0 && !same && (j < 6 || c === t)) {
        const alternate = mod(previous - sign * pad[offset]);
        if (alternate !== literal) options.push({
          c: alternate, e: Math.log(j >= 6 ? Q : Q / 28)
        });
      }
      wordOptions.push(options);
      previous = c;
      offset++;
    }
    result.push(wordOptions);
  }
  assert.equal(offset, pad.length);
  return result;
}

/** Word-local trigram Viterbi; optional backtrace for positive-control audit. */
function decodeWord(options, lm, withPath = false) {
  const states = N * N;
  let scores = new Float64Array(states);
  scores.fill(-Infinity);
  scores[START * N + START] = 0;
  const back = withPath ? [] : null;
  for (let j = 0; j < options.length; j++) {
    const next = new Float64Array(states);
    next.fill(-Infinity);
    const prevState = withPath ? new Int16Array(states) : null;
    const choice = withPath ? new Uint8Array(states) : null;
    if (withPath) prevState.fill(-1);
    for (let s = 0; s < states; s++) {
      const prior = scores[s];
      if (!Number.isFinite(prior)) continue;
      const a = Math.floor(s / N), b = s % N;
      for (let k = 0; k < options[j].length; k++) {
        const option = options[j][k];
        const ns = b * N + option.c;
        const value = prior + option.e + lm[(a * N + b) * N + option.c];
        if (value > next[ns]) {
          next[ns] = value;
          if (withPath) { prevState[ns] = s; choice[ns] = k; }
        }
      }
    }
    scores = next;
    if (withPath) back.push({ prevState, choice });
  }
  let best = -Infinity, bestState = 0;
  for (let s = 0; s < states; s++) {
    if (!Number.isFinite(scores[s])) continue;
    const a = Math.floor(s / N), b = s % N;
    const value = scores[s] + lm[(a * N + b) * N + END];
    if (value > best) { best = value; bestState = s; }
  }
  if (!withPath) return best;
  const plaintext = new Array(options.length);
  for (let j = options.length - 1; j >= 0; j--) {
    const k = back[j].choice[bestState];
    plaintext[j] = options[j][k].c;
    bestState = back[j].prevState[bestState];
  }
  return { score: best, plaintext };
}

const TRAIN_WORDS = corpusWords(SHAKESPEARE.slice(0, 200000));
const HELDOUT_WORDS = corpusWords(SHAKESPEARE.slice(240000));
const LM = trainTrigram(TRAIN_WORDS);

function scoreCandidate(pad, sign, split = 1448) {
  const options = inverseCandidates(CIPHER_WORDS, pad, sign);
  let trainScore = 0, heldScore = 0, trainTokens = 0, heldTokens = 0;
  for (let i = 0; i < options.length; i++) {
    const value = decodeWord(options[i], LM);
    if (i < split) {
      trainScore += value;
      trainTokens += CIPHER_WORDS[i].length + 1;
    } else {
      heldScore += value;
      heldTokens += CIPHER_WORDS[i].length + 1;
    }
  }
  return {
    train: trainScore / trainTokens,
    heldout: heldScore / heldTokens,
    whole: (trainScore + heldScore) / (trainTokens + heldTokens)
  };
}
function scoreDirect(pad, sign, split = 1448) {
  let trainScore = 0, heldScore = 0, trainTokens = 0, heldTokens = 0;
  let offset = 0;
  for (let i = 0; i < CIPHER_WORDS.length; i++) {
    let a = START, b = START, score = 0;
    for (const c of CIPHER_WORDS[i]) {
      const plain = mod(c - sign * pad[offset++]);
      score += LM[(a * N + b) * N + plain];
      a = b;
      b = plain;
    }
    score += LM[(a * N + b) * N + END];
    if (i < split) {
      trainScore += score;
      trainTokens += CIPHER_WORDS[i].length + 1;
    } else {
      heldScore += score;
      heldTokens += CIPHER_WORDS[i].length + 1;
    }
  }
  assert.equal(offset, pad.length);
  return {
    train: trainScore / trainTokens,
    heldout: heldScore / heldTokens,
    whole: (trainScore + heldScore) / (trainTokens + heldTokens)
  };
}

function seededRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
function positiveControl(pad, sign) {
  const bins = Array.from({ length: 60 }, () => []);
  for (const word of HELDOUT_WORDS) if (word.length < 60) bins[word.length].push(word);
  const stream = HELDOUT_WORDS.flat();
  const random = seededRandom(0x391165);
  let fallbackWords = 0;
  const plaintext = CIPHER_WORDS.map(word => {
    if (bins[word.length].length)
      return bins[word.length][Math.floor(random() * bins[word.length].length)].slice();
    fallbackWords++;
    const offset = Math.floor(random() * (stream.length - word.length));
    return stream.slice(offset, offset + word.length);
  });
  const signedPad = pad.map(k => mod(sign * k));
  const planted = encipher(plaintext, signedPad, seededRandom(0x771923), Q);
  const options = inverseCandidates(planted.ciphertext, pad, sign);
  let correct = 0, tokens = 0, logScore = 0;
  for (let i = 0; i < options.length; i++) {
    const decoded = decodeWord(options[i], LM, true);
    for (let j = 0; j < decoded.plaintext.length; j++)
      if (decoded.plaintext[j] === plaintext[i][j]) correct++;
    tokens += plaintext[i].length + 1;
    logScore += decoded.score;
  }
  return {
    fallbackWords,
    correctRunes: correct,
    totalRunes: 12956,
    accuracy: correct / 12956,
    logScorePerToken: logScore / tokens
  };
}

function main() {
  const candidates = [];
  const resets = ['global', 'page', 'section', 'word'];
  for (const phase of [51, 57]) {
    for (const direction of ['forward', 'reverse']) {
      for (const reset of resets) for (const sign of [1, -1]) {
        const pad = periodicPad(PRIME_INDEXED_GRID, phase, direction, reset);
        candidates.push({
          family: '256-row-major-prime-indexed-totient',
          phase, direction, reset, sign, pad,
          ...scoreCandidate(pad, sign)
        });
      }
    }
  }
  for (const direction of ['forward', 'reverse']) {
    for (const reset of resets) for (const sign of [1, -1]) {
      const key = direction === 'forward' ? PATH_KEY : PATH_KEY.slice().reverse();
      const pad = periodicPad(key, 0, 'forward', reset);
      candidates.push({
        family: '32-cell-diagonal-prime-indexed-totient',
        phase: 0, direction, reset, sign, pad,
        ...scoreCandidate(pad, sign)
      });
    }
  }
  for (const [seedName, seed] of Object.entries({
    'diagonal-prime-totient': SEEDS['diagonal-prime-totient'],
    'row-major-prime-totient': SEEDS['row-major-prime-totient'],
    'rune-prime-totient': SEEDS['rune-prime-totient']
  })) {
    for (const reset of resets) for (const sign of [1, -1]) {
      const pad = recurrencePad(seed, reset);
      candidates.push({
        family: 'six-symbol-T6-recurrence-seed',
        seedName, seed, reset, sign, pad,
        ...scoreCandidate(pad, sign)
      });
    }
  }
  assert.equal(candidates.length, 72);
  const byTrain = candidates.slice().sort((a, b) => b.train - a.train);
  const byHeldout = candidates.slice().sort((a, b) => b.heldout - a.heldout);
  const best = byTrain[0];
  const control = positiveControl(best.pad, best.sign);
  assert.ok(control.accuracy > 0.95,
    'The source-matched positive control must recover >95% of known GP runes');

  // Stateful keyed recurrence: the p56-derived grid stream forces the
  // source-derived lag-six affine state after a six-symbol source seed.
  const statefulCandidates = [];
  const statefulKeys = [
    { name: '256-row-major', key: PRIME_INDEXED_GRID, phases: [51, 57] },
    { name: '32-cell-diagonal', key: PATH_KEY, phases: [0] }
  ];
  const statefulSeed = SEEDS['diagonal-prime-totient'];
  for (const spec of statefulKeys) {
    for (const phase of spec.phases) {
      for (const direction of ['forward', 'reverse']) {
        for (const reset of resets) {
          for (const keySign of [1, -1]) {
            const pad = forcedRecurrencePad(
              statefulSeed, spec.key, phase, direction, reset, keySign
            );
            for (const outputSign of [1, -1]) {
              statefulCandidates.push({
                model: 'T6-repair', key: spec.name, phase, direction,
                reset, keySign, outputSign, pad,
                ...scoreCandidate(pad, outputSign)
              });
              statefulCandidates.push({
                model: 'direct-additive', key: spec.name, phase, direction,
                reset, keySign, outputSign, pad,
                ...scoreDirect(pad, outputSign)
              });
            }
          }
        }
      }
    }
  }
  assert.equal(statefulCandidates.length, 192);
  const statefulT6 = statefulCandidates.filter(x => x.model === 'T6-repair');
  const statefulDirect = statefulCandidates.filter(x => x.model === 'direct-additive');
  const sortTrain = xs => xs.slice().sort((a, b) => b.train - a.train);
  const sortHeld = xs => xs.slice().sort((a, b) => b.heldout - a.heldout);
  const statefulT6Train = sortTrain(statefulT6);
  const statefulT6Held = sortHeld(statefulT6);
  const statefulDirectTrain = sortTrain(statefulDirect);
  const statefulDirectHeld = sortHeld(statefulDirect);
  const statefulControl = positiveControl(
    statefulT6Train[0].pad, statefulT6Train[0].outputSign
  );
  assert.ok(statefulControl.accuracy > 0.95,
    'The keyed T6 recurrence positive control must recover >95% of known GP runes');

  let t6Hits = 0, t6Eligible = 0;
  for (const word of CIPHER_WORDS) for (let j = 6; j < word.length; j++) {
    t6Eligible++;
    if (word[j] === mod(24 - 2 * word[j - 6])) t6Hits++;
  }
  assert.deepEqual([t6Hits, t6Eligible], [80, 1290]);

  const result = {
    scope: 'Finite source-derived key test under provisional T6 collision-repair and direct-additive models; not a recovered cipher or plaintext',
    original: { words: CIPHER_WORDS.length, runes: ROWS.length,
      sections: Math.max(...ROWS.map(r => r.section)) + 1,
      t6Hits, t6Eligible },
    sourceAnchors: {
      imageDimensions: [WIDTH, HEIGHT],
      offsets: [gridStart, gridNext],
      gridBytes: [GRID_BYTES[51], GRID_BYTES[57]],
      primeIndexedTotientValues: [PRIME_INDEXED_GRID[51], PRIME_INDEXED_GRID[57]],
      keyDelta: mod(PRIME_INDEXED_GRID[57] - PRIME_INDEXED_GRID[51]),
      diagonalPathBytes: PATH_BYTES.slice(0, 8),
      diagonalPathKey: PATH_KEY.slice(0, 8),
      lag6PrimeKeyDelta24Positions: lag6Delta24,
      rawByteDoublingPositions: byteDoublings,
      recurrenceSeeds: SEEDS
    },
    statefulKeyedRecurrence: {
      testedCandidates: statefulCandidates.length,
      recurrence: 'state[i] = state[i-6] * (-2) + 24 + signedPrimeIndexedGridKey[i] mod 29 after the six-symbol source seed',
      seed: statefulSeed,
      bestT6Training: {
        key: statefulT6Train[0].key, phase: statefulT6Train[0].phase,
        direction: statefulT6Train[0].direction, reset: statefulT6Train[0].reset,
        keySign: statefulT6Train[0].keySign, outputSign: statefulT6Train[0].outputSign,
        train: statefulT6Train[0].train, heldout: statefulT6Train[0].heldout,
        whole: statefulT6Train[0].whole
      },
      bestT6Heldout: {
        key: statefulT6Held[0].key, phase: statefulT6Held[0].phase,
        direction: statefulT6Held[0].direction, reset: statefulT6Held[0].reset,
        keySign: statefulT6Held[0].keySign, outputSign: statefulT6Held[0].outputSign,
        train: statefulT6Held[0].train, heldout: statefulT6Held[0].heldout,
        whole: statefulT6Held[0].whole
      },
      bestDirectTraining: {
        key: statefulDirectTrain[0].key, phase: statefulDirectTrain[0].phase,
        direction: statefulDirectTrain[0].direction, reset: statefulDirectTrain[0].reset,
        keySign: statefulDirectTrain[0].keySign, outputSign: statefulDirectTrain[0].outputSign,
        train: statefulDirectTrain[0].train, heldout: statefulDirectTrain[0].heldout,
        whole: statefulDirectTrain[0].whole
      },
      bestDirectHeldout: {
        key: statefulDirectHeld[0].key, phase: statefulDirectHeld[0].phase,
        direction: statefulDirectHeld[0].direction, reset: statefulDirectHeld[0].reset,
        keySign: statefulDirectHeld[0].keySign, outputSign: statefulDirectHeld[0].outputSign,
        train: statefulDirectHeld[0].train, heldout: statefulDirectHeld[0].heldout,
        whole: statefulDirectHeld[0].whole
      },
      scoreRanges: {
        T6: {
          min: Math.min(...statefulT6.map(x => x.whole)),
          max: Math.max(...statefulT6.map(x => x.whole))
        },
        direct: {
          min: Math.min(...statefulDirect.map(x => x.whole)),
          max: Math.max(...statefulDirect.map(x => x.whole))
        }
      },
      positiveControl: statefulControl
    },
    testedCandidates: candidates.length,\n    statefulCandidateCount: statefulCandidates.length,
    bestTraining: {
      family: best.family, phase: best.phase, direction: best.direction,
      reset: best.reset, sign: best.sign, seedName: best.seedName,
      train: best.train, heldout: best.heldout, whole: best.whole
    },
    bestHeldout: {
      family: byHeldout[0].family, phase: byHeldout[0].phase,
      direction: byHeldout[0].direction, reset: byHeldout[0].reset,
      sign: byHeldout[0].sign, seedName: byHeldout[0].seedName,
      train: byHeldout[0].train, heldout: byHeldout[0].heldout,
      whole: byHeldout[0].whole
    },
    topTraining: byTrain.slice(0, 8).map(x => ({
      family: x.family, phase: x.phase, direction: x.direction,
      reset: x.reset, sign: x.sign, seedName: x.seedName,
      train: x.train, heldout: x.heldout, whole: x.whole
    })),
    scoreRange: {
      min: Math.min(...candidates.map(x => x.whole)),
      max: Math.max(...candidates.map(x => x.whole))
    },
    positiveControl: control,
    conclusion: 'None of the 72 declared prime-indexed grid-totient periodic keys or six-symbol T6 recurrence seeds yields GP-English-like plaintext. The additional 192 stateful keyed-recurrence candidates are reported separately. Positive controls validate the inverse for the tested model. The selected 24 modular key difference occurs at 10 of 250 lag-six grid positions, so it is not independently selective; only the raw-byte doubling at offset 51 is unique.'
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = { main, primeList, periodicPad, recurrencePad };
