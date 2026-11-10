'use strict';
/**
 * Source-constrained reconstruction of the LP2 lag-six affine echo from the
 * archived 2016 image dimensions (PGP-signed under the known Cicada key, while
 * the Pi.Mobi association is contested), the 32x8 base-60 table, and the
 * visually selected 128+128 p53-p55 rune block.
 *
 * This is a source-interpretation test, not a recovered LP2 key or plaintext.
 * The manual CI workflow runs this exact original-input gate and positive plant.
 * The 563x569 dimensions are reported for 4gq25.jpg in the contemporaneous
 * archive. Its GPG trust warning is not a signature failure; the later Pi.Mobi
 * attribution dispute is not independently authenticated.
 * 2016 archive; the signed message says Liber Primus words are a map and
 * numbers are direction, and identifies the image as containing an Oak Tree
 * In Winter. See im-results/2016-image-dimensions-lag6-source-derivation.md.
 *
 * Node 22, no external packages:
 *   node sims/2016_image_dimension_lag6_source_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const base = require('./relative_key_english_probe.cjs');
const { trainTrigram } = require('./relative_key_trigram_probe.cjs');
const { encipher } = require('./lag6_repair_keyed_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const mod = x => ((x % 29) + 29) % 29;
const START = 29, END = 30, N = 31, Q = 0.81;
const IMAGE_WIDTH = 563, IMAGE_HEIGHT = 569;

function primePi(n) {
  let count = 0;
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) count++;
  }
  return count;
}
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
}
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
function scorePlain(words, lm) {
  let score = 0, tokens = 0;
  const freq = new Float64Array(29);
  for (const word of words) {
    let a = START, b = START;
    for (const c of [...word, END]) {
      score += lm[(a * N + b) * N + c];
      tokens++;
      a = b; b = c;
      if (c < 29) freq[c]++;
    }
  }
  const total = freq.reduce((a, b) => a + b, 0);
  return {
    logScore: score,
    perToken: score / tokens,
    runeIoC: freq.reduce((a, b) => a + b * b, 0) / (total * total)
  };
}
function recurrencePad(seed, lengths, clock, sign) {
  const pad = [];
  if (clock === 'global') {
    const state = [];
    const total = lengths.reduce((a, b) => a + b, 0);
    for (let i = 0; i < total; i++) {
      const k = i < 6 ? seed[i] : mod(24 - 2 * state[i - 6]);
      state.push(k);
      pad.push(mod(sign * k));
    }
  } else {
    for (const length of lengths) {
      const state = [];
      for (let i = 0; i < length; i++) {
        const k = i < 6 ? seed[i] : mod(24 - 2 * state[i - 6]);
        state.push(k);
        pad.push(mod(sign * k));
      }
    }
  }
  return pad;
}
function periodicPad(key, phase, sign, total) {
  return Array.from({ length: total }, (_, i) =>
    mod(sign * key[(phase + i) % key.length]));
}
function inverseCandidates(cipher, pad) {
  const result = [];
  let previous = -1, offset = 0;
  for (const word of cipher) {
    const wordOptions = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j];
      const t = j >= 6 ? mod(24 - 2 * word[j - 6]) : -1;
      const literal = mod(c - pad[offset++]);
      const same = c === previous;
      const unchangedLikelihood = same
        ? (j >= 6 && t === previous ? 1 : 1 - Q)
        : 1;
      const options = [{ c: literal, e: Math.log(unchangedLikelihood) }];
      if (previous >= 0 && !same && (j < 6 || c === t)) {
        options.push({
          c: mod(previous - pad[offset - 1]),
          e: Math.log(j >= 6 ? Q : Q / 28)
        });
      }
      wordOptions.push(options);
      previous = c;
    }
    result.push(wordOptions);
  }
  assert.equal(offset, pad.length);
  return result;
}
function decodeViterbi(cipher, pad, lm) {
  const all = inverseCandidates(cipher, pad);
  return all.map(options => {
    let states = new Map([[START * N + START, { s: 0, seq: [] }]]);
    for (const row of options) {
      const next = new Map();
      for (const [state, prior] of states) {
        const a = Math.floor(state / N), b = state % N;
        for (const option of row) {
          const s = prior.s + option.e + lm[(a * N + b) * N + option.c];
          const key = b * N + option.c;
          const old = next.get(key);
          if (!old || s > old.s)
            next.set(key, { s, seq: [...prior.seq, option.c] });
        }
      }
      states = next;
    }
    let best = null;
    for (const candidate of states.values()) {
      const n = candidate.seq.length;
      const a = n > 1 ? candidate.seq[n - 2] : START;
      const b = n ? candidate.seq[n - 1] : START;
      const s = candidate.s + lm[(a * N + b) * N + END];
      if (!best || s > best.s) best = { s, seq: candidate.seq };
    }
    return best.seq;
  });
}
function preview(words, translit, count = 10) {
  return words.slice(0, count).map(w => w.map(x => translit[x]).join('')).join(' ');
}
function plantMatchedWords(lengths, heldout, pad, seed) {
  const random = rng(seed);
  const bins = Array.from({ length: 60 }, () => []);
  for (const word of heldout) if (word.length < 60) bins[word.length].push(word);
  const stream = heldout.flat();
  let fallbackWords = 0;
  const plaintext = lengths.map(n => {
    if (bins[n] && bins[n].length)
      return bins[n][Math.floor(random() * bins[n].length)];
    fallbackWords++;
    const offset = Math.floor(random() * (stream.length - n));
    return stream.slice(offset, offset + n);
  });
  const generated = encipher(plaintext, pad, random, Q);
  return { plaintext, ciphertext: generated.ciphertext, rewritten: generated.rewritten,
    fallbackWords };
}

function main() {
  const corpus = readJson('resources/liber-primus/lp2-corpus.json');
  const grid = readJson('resources/liber-primus/base60-grid.json');
  const pages = corpus.pages;
  const p53 = pages.find(p => p.page === 53).indices;
  const p54 = pages.find(p => p.page === 54).indices;
  const p55 = pages.find(p => p.page === 55).indices;
  const firstHalf = p53.slice(0, 128);
  const secondHalf = [...p53.slice(128), p54[0], ...p55];
  const runeBlock = [...firstHalf, ...secondHalf];
  const gridBytes = grid.byte_rows.flat();

  assert.equal(firstHalf.length, 128);
  assert.equal(secondHalf.length, 128);
  assert.equal(runeBlock.length, 256);
  assert.equal(grid.byte_rows.length, 32);
  assert.ok(grid.byte_rows.every(row => row.length === 8));
  assert.equal(gridBytes.length, 256);

  const gridPos = [IMAGE_WIDTH % 256, IMAGE_HEIGHT % 256];
  const halfPos = [IMAGE_WIDTH % 128, IMAGE_HEIGHT % 128];
  const [g0, g1] = gridPos;
  const [r0, r1] = halfPos;
  const gA = gridBytes[g0], gB = gridBytes[g1];
  const runeA = secondHalf[r0], runeS = secondHalf[r1];
  const intercept = runeA;
  const slopeMagnitude = gB / gA;
  const lag = IMAGE_HEIGHT - IMAGE_WIDTH;
  const piWidth = primePi(IMAGE_WIDTH), piHeight = primePi(IMAGE_HEIGHT);
  const sigelIndex = 15;
  const tirIndex = piWidth % 29, beorcIndex = piHeight % 29;

  assert.deepEqual(gridPos, [51, 57]);
  assert.deepEqual(halfPos, [51, 57]);
  assert.equal(gA, 59);
  assert.equal(gB, 118);
  assert.equal(slopeMagnitude, 2);
  assert.equal(runeA, 24);
  assert.equal(corpus.translit[runeA], 'A');
  assert.equal(runeS, 15);
  assert.equal(corpus.translit[runeS], 'S');
  assert.equal(corpus.prime[runeS], 53);
  assert.equal(corpus.prime[runeS] % 29, 24);
  assert.equal(lag, 6);
  assert.deepEqual(gridCoords, [{ row: 6, column: 3 }, { row: 7, column: 1 }]);
  assert.equal(deltaRow, 1);
  assert.equal(deltaColumn, -2);
  assert.equal(8 * deltaRow + deltaColumn, lag);
  assert.deepEqual([piWidth, piHeight], [103, 104]);
  assert.deepEqual([tirIndex, beorcIndex], [16, 17]);
  assert.deepEqual([corpus.translit[tirIndex], corpus.translit[beorcIndex]], ['T', 'B']);
  assert.deepEqual([corpus.prime[tirIndex], corpus.prime[beorcIndex]], [59, 61]);
  assert.equal(corpus.prime[beorcIndex] - corpus.prime[tirIndex], 2);
  assert.equal(gA, corpus.prime[tirIndex]);
  assert.equal(corpus.prime[sigelIndex], 53);
  assert.equal(corpus.prime[sigelIndex] % 29, 24);
  assert.equal(corpus.prime[tirIndex] - corpus.prime[sigelIndex], lag);
  assert.equal(corpus.prime[beorcIndex] - corpus.prime[tirIndex], slopeMagnitude);

  const runePairs = [];
  for (let i = 0; i + lag < secondHalf.length; i++) {
    if (secondHalf[i] === 24 && corpus.prime[secondHalf[i + lag]] % 29 === 24)
      runePairs.push(i);
  }
  const gridPairs = [];
  for (let i = 0; i + lag < gridBytes.length; i++) {
    if (gridBytes[i + lag] === 2 * gridBytes[i]) gridPairs.push(i);
  }
  assert.deepEqual(runePairs, [51]);
  assert.deepEqual(gridPairs, [51]);

  const traversals = {
    rowMajor: grid.byte_rows.flat(),
    rowSerpentine: grid.byte_rows.flatMap((row, i) =>
      i % 2 ? [...row].reverse() : row),
    colMajor: Array.from({ length: 8 }, (_, c) =>
      grid.byte_rows.map(row => row[c])).flat(),
    colSerpentine: Array.from({ length: 8 }, (_, c) =>
      c % 2 ? grid.byte_rows.map(row => row[c]).reverse()
        : grid.byte_rows.map(row => row[c])).flat()
  };
  const traversalCheck = {};
  for (const [name, bytes] of Object.entries(traversals)) {
    for (const direction of ['forward', 'reverse']) {
      const ordered = direction === 'forward' ? bytes : bytes.slice().reverse();
      traversalCheck[name + ':' + direction] = [
        ordered[g0], ordered[g1], ordered[g1] / ordered[g0]
      ];
    }
  }

  const parsed = parseSharedCorpus();
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  const cipherWords = parsed.words.map(word => [...word.runes].map(rune => runeIndex.get(rune)));
  const lengths = cipherWords.map(w => w.length);
  const totalRunes = lengths.reduce((a, b) => a + b, 0);
  assert.equal(cipherWords.length, 2896);
  assert.equal(totalRunes, 12956);

  const tMinus = x => mod(intercept - slopeMagnitude * x);
  const tPlus = x => mod(intercept + slopeMagnitude * x);
  const affineCounts = {};
  for (const [name, fn] of [
    ['24-2x', tMinus], ['24+2x', tPlus],
    ['-24+2x', x => mod(-24 + 2 * x)],
    ['-24-2x', x => mod(-24 - 2 * x)]
  ]) {
    let eligible = 0, hits = 0;
    for (const word of cipherWords) {
      for (let j = lag; j < word.length; j++) {
        eligible++;
        if (word[j] === fn(word[j - lag])) hits++;
      }
    }
    affineCounts[name] = { hits, eligible, rate: hits / eligible };
  }

  const gridSeed = gridBytes.slice(g0, g1).map(x => x % 29);
  const runeSeed = secondHalf.slice(r0, r1);
  const source = fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const trainWords = base.corpusWords(source.slice(0, 200000));
  const heldoutWords = base.corpusWords(source.slice(240000));
  const lm = trainTrigram(trainWords);
  const lexicon = new Set(trainWords.map(w => w.join(',')));
  const candidates = [];

  function addCandidate(name, pad) {
    const decoded = decodeViterbi(cipherWords, pad, lm);
    const lexicalWords = decoded.filter(w => lexicon.has(w.join(','))).length;
    candidates.push({
      name,
      score: scorePlain(decoded, lm),
      lexicalWords,
      preview: preview(decoded, corpus.translit, 6)
    });
  }
  for (const [name, seed] of [['grid-six-byte-seed', gridSeed],
    ['rune-six-symbol-seed', runeSeed]]) {
    for (const clock of ['global', 'word']) {
      for (const sign of [1, -1]) {
        addCandidate(name + ':' + clock + ':sign' + sign,
          recurrencePad(seed, lengths, clock, sign));
      }
    }
  }
  for (const phase of [0, 51, 57]) {
    for (const sign of [1, -1]) {
      addCandidate('second128-periodic:phase' + phase + ':sign' + sign,
        periodicPad(secondHalf, phase, sign, totalRunes));
    }
  }
  for (const phase of [0, 51, 57, 179, 185]) {
    for (const sign of [1, -1]) {
      addCandidate('full256-periodic:phase' + phase + ':sign' + sign,
        periodicPad(runeBlock, phase, sign, totalRunes));
    }
  }
  candidates.sort((a, b) => b.score.perToken - a.score.perToken);

  const controlPad = recurrencePad(gridSeed, lengths, 'global', 1);
  const planted = plantMatchedWords(lengths, heldoutWords, controlPad, 0x391165);
  const recovered = decodeViterbi(planted.ciphertext, controlPad, lm);
  const truth = planted.plaintext.flat(), guess = recovered.flat();
  const correct = guess.reduce((n, value, i) => n + Number(value === truth[i]), 0);

  return {
    sourceImage: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT,
      widthMod256: g0, heightMod256: g1,
      widthMod128: r0, heightMod128: r1,
      difference: lag },
    sourceAnchors: {
      primeCounting: { piWidth, piHeight, modulo29: [tirIndex, beorcIndex],
        runes: [corpus.translit[tirIndex], corpus.translit[beorcIndex]],
        gematriaPrimes: [corpus.prime[tirIndex], corpus.prime[beorcIndex]],
        sigel: { index: sigelIndex, gematriaPrime: corpus.prime[sigelIndex], primeMod29: corpus.prime[sigelIndex] % 29 },
        primeGaps: { sigelToTir: corpus.prime[tirIndex] - corpus.prime[sigelIndex], tirToBeorc: corpus.prime[beorcIndex] - corpus.prime[tirIndex] } },
      grid: { index51: gA, index57: gB, ratio: slopeMagnitude,
        rowMajorCells: [[6, 3], [7, 1]],
        geometry: { deltaRow, deltaColumn, rowMajorStep: 8 * deltaRow + deltaColumn },
        base60Tokens: ['0x', '1w'] },
      secondRuneHalf: {
        length: secondHalf.length,
        index51: { rune: corpus.runes[runeA], translit: corpus.translit[runeA],
          gpIndex: runeA },
        index57: { rune: corpus.runes[runeS], translit: corpus.translit[runeS],
          gpIndex: runeS, gematriaPrime: corpus.prime[runeS],
          primeMod29: corpus.prime[runeS] % 29 }
      },
      uniqueGapSixPairs: { runePairOffsets: runePairs, gridDoubleOffsets: gridPairs },
      naturalGridTraversals: traversalCheck
    },
    sourceDerivedRule: {
      lag,
      intercept,
      slopeMagnitude,
      sourceDerivedOrientation: 'T(x) = 24 - 2*x mod29',
      signedSlopeFromGridColumnStep: deltaColumn,
      counts: affineCounts
    },
    keyTests: {
      method: 'Exact two-candidate inverse for the T-overwrite model; GP trigram Viterbi trained on Shakespeare first 200k characters.',
      originalCandidates: candidates,
      positiveControl: {
        source: 'Shakespeare 240k+ holdout words matched to all 2,896 original LP2 word lengths',
        seed: '0x391165',
        fallbackWords: planted.fallbackWords,
        rewrittenRunes: planted.rewritten.filter(Boolean).length,
        recoveredRunes: correct,
        totalRunes: totalRunes,
        accuracy: correct / totalRunes,
        score: scorePlain(recovered, lm)
      }
    },
    interpretation: 'The source arithmetic independently specifies the lag-six affine motif, but the tested simple source pads and six-lag key recurrences do not recover original LP2 English. This is not a recovered key or complete cipher.'
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = { main };
