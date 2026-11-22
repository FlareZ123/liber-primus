#!/usr/bin/env node
'use strict';

// Source-frozen test of one word-directed key-walk hypothesis.
// Inputs are read from the repository's checked-in original/derived corpus.
// Model convention 000: read then step; no inter-word movement; compare
// against the previous emitted ciphertext rune. Model 1 is the coin/retry
// no-repeat filter used by pnotisdev/cicada3301/work/kscreen/pdir_ref.py.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const wisdomB64 = fs.readFileSync(path.join(root, 'resources/historical/cicada2013-wisdom-folly.b64'), 'utf8').replace(/\s/g, '');
const wisdomBytes = Buffer.from(wisdomB64, 'base64');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function parseWords(chunk) {
  const words = [];
  let current = [];
  for (const ch of [...chunk]) {
    const ix = runeIndex.get(ch);
    if (ix !== undefined) current.push(ix);
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function alignTextPages() {
  const chunks = transcription.split('%');
  let cursor = 0;
  const pages = [];
  for (let p = 0; p < corpus.pages.length; p++) {
    const source = corpus.pages[p].indices;
    if (source.length === 0) {
      pages.push([]);
      continue;
    }
    if (cursor >= chunks.length) throw new Error('transcription ended before corpus page ' + p);
    const words = parseWords(chunks[cursor++]);
    const flat = words.flat();
    if (flat.length !== source.length || flat.some((x, i) => x !== source[i])) {
      throw new Error('rune alignment mismatch on physical LP2 page ' + p);
    }
    pages.push(words);
  }
  while (cursor < chunks.length && !chunks[cursor].trim()) cursor++;
  if (cursor !== chunks.length) throw new Error('unconsumed transcription chunks: ' + (chunks.length - cursor));
  return pages;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function wordPrimeSum(word) {
  return word.reduce((sum, ix) => sum + corpus.prime[ix], 0);
}

function scaledIoc(values) {
  const counts = new Uint32Array(29);
  for (const x of values) counts[x]++;
  let pairs = 0;
  for (const n of counts) pairs += n * (n - 1);
  return 29 * pairs / (values.length * (values.length - 1));
}

function buildPlan(words, initialPreviousWordG, initialPreviousRune) {
  let previousWordG = initialPreviousWordG;
  let previousRune = initialPreviousRune;
  const dirs = [];
  const pvs = [];
  const wordDirs = [];
  for (const word of words) {
    const d = isPrime(previousWordG) ? 1 : -1;
    wordDirs.push(d);
    for (const ix of word) {
      dirs.push(d);
      pvs.push(previousRune);
      previousRune = ix;
    }
    previousWordG = wordPrimeSum(word);
  }
  return { dirs, pvs, wordDirs };
}

// Port of the pdir_ref model-1 beam transition. It tracks the two possible
// collision outcomes: spend a coin and keep a repeat, or spend a coin and
// retry with the following key value. The beam score is scaled IoC.
function beamDecode(cipher, previousRunes, key, dirs, start, beamWidth = 50) {
  const take = (state, plain, nextPointer) => {
    state.score += 2 * state.counts[plain];
    state.counts[plain]++;
    state.pointer = nextPointer;
  };
  const clone = state => ({
    pointer: state.pointer,
    score: state.score,
    counts: new Uint16Array(state.counts)
  });
  const swapRemove = (array, i) => {
    array[i] = array[array.length - 1];
    array.pop();
  };

  let current = [{
    pointer: start,
    score: 0,
    counts: new Uint16Array(29)
  }];

  for (let i = 0; i < cipher.length; i++) {
    const ci = cipher[i];
    const previous = previousRunes[i];
    const d = dirs[i];
    const extra = [];
    let index = 0;

    while (index < current.length) {
      const j = current[index].pointer;
      const j2 = j + 2 * d;
      if (Math.min(j, j2) < 0 || Math.max(j, j2) >= key.length) {
        swapRemove(current, index);
        continue;
      }

      const k0 = key[j];
      const k2 = key[j2];
      const plain0 = (ci - k0 + 29) % 29;

      if (previous >= 0) {
        const plain2 = (ci - k2 + 29) % 29;
        if ((plain2 + k0) % 29 === previous && j + 3 * d >= 0) {
          const skipped = clone(current[index]);
          take(skipped, plain2, j + 3 * d);
          extra.push(skipped);
        }
      }

      const nextPointer = previous === ci ? j + 2 * d : j + d;
      if (nextPointer < 0) {
        swapRemove(current, index);
      } else {
        take(current[index], plain0, nextPointer);
        index++;
      }
    }

    current.push(...extra);
    if (!current.length) return { complete: false, at: i, scaledIoc: 0 };

    if (current.length > 1) {
      let a = 0;
      while (a < current.length) {
        let b = a + 1;
        while (b < current.length) {
          if (current[b].pointer === current[a].pointer) {
            if (current[b].score > current[a].score) current[a] = current[b];
            swapRemove(current, b);
          } else {
            b++;
          }
        }
        a++;
      }
      if (current.length > beamWidth) {
        current.sort((x, y) => y.score - x.score);
        current = current.slice(0, beamWidth);
      }
    }
  }

  current.sort((x, y) => y.score - x.score);
  const best = current[0];
  return {
    complete: true,
    score: best.score,
    scaledIoc: 29 * best.score / (cipher.length * (cipher.length - 1)),
    bestPointer: best.pointer,
    states: current.length
  };
}

function rng32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function summarize(values, actual) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
    mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
    rankActual: sorted.filter(x => x <= actual).length
  };
}

function plantPositiveControl(words, key, start, initialPreviousWordG, initialPreviousRune) {
  const frequency = {
    F: 0.022, U: 0.028, TH: 0.050, O: 0.075, R: 0.060, C: 0.028,
    G: 0.020, W: 0.024, H: 0.061, N: 0.067, I: 0.070, J: 0.001,
    EO: 0.005, P: 0.019, X: 0.001, S: 0.063, T: 0.090, B: 0.015,
    E: 0.127, M: 0.024, L: 0.040, NG: 0.010, OE: 0.010, D: 0.043,
    A: 0.082, AE: 0.005, Y: 0.020, IA: 0.005, EA: 0.010
  };
  let weights = corpus.translit.map(x => frequency[x] || 0.001);
  const total = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(x => x / total);

  const random = rng32(3301);
  const sample = () => {
    let x = random();
    for (let i = 0; i < weights.length; i++) {
      x -= weights[i];
      if (x <= 0) return i;
    }
    return 28;
  };

  const plaintextWords = words.map(w => w.map(sample));
  const ciphertextWords = [];
  let pointer = start;
  let previousCipherRune = initialPreviousRune;
  let previousWordG = initialPreviousWordG;
  let collisions = 0;
  let acceptedRepeats = 0;
  let retries = 0;
  let valid = true;
  const keep = 3 / 16;

  for (const word of plaintextWords) {
    const d = isPrime(previousWordG) ? 1 : -1;
    const out = [];
    for (const plain of word) {
      if (pointer < 0 || pointer >= key.length) {
        valid = false;
        break;
      }
      let cipherRune = (plain + key[pointer]) % 29;
      pointer += d;
      if (previousCipherRune >= 0 && cipherRune === previousCipherRune) {
        collisions++;
        if (pointer < 0 || pointer >= key.length) {
          valid = false;
          break;
        }
        pointer += d;
        if (random() >= keep) {
          retries++;
          if (pointer < 0 || pointer >= key.length) {
            valid = false;
            break;
          }
          cipherRune = (plain + key[pointer]) % 29;
          pointer += d;
        } else {
          acceptedRepeats++;
        }
      }
      out.push(cipherRune);
      previousCipherRune = cipherRune;
    }
    if (!valid) break;
    ciphertextWords.push(out);
    previousWordG = wordPrimeSum(out);
  }

  const plainFlat = plaintextWords.flat();
  const cipherFlat = ciphertextWords.flat();
  if (!valid || cipherFlat.length !== words.flat().length) {
    return { valid: false, plaintextRunes: plainFlat.length, ciphertextRunes: cipherFlat.length };
  }

  const plan = buildPlan(ciphertextWords, initialPreviousWordG, initialPreviousRune);
  const decoded = beamDecode(cipherFlat, plan.pvs, key, plan.dirs, start, 50);
  return {
    valid: true,
    plaintextRunes: plainFlat.length,
    ciphertextRunes: cipherFlat.length,
    collisionEvents: collisions,
    acceptedRepeats,
    retries,
    plaintextScaledIoc: scaledIoc(plainFlat),
    ciphertextScaledIoc: scaledIoc(cipherFlat),
    trueFinalPointer: pointer,
    decoded
  };
}

const pageWords = alignTextPages();
const page40 = pageWords[40];
const header = page40.slice(0, 2);
if (header.length !== 2 || header[0].length !== 3 || header[1].length !== 5) {
  throw new Error('p40 red heading is not the expected 3+5 rune pair');
}

const bodyWords = page40.slice(2).concat(...pageWords.slice(41, 54));
const cipher = bodyWords.flat();
if (cipher.length !== 3000 || bodyWords.length !== 771) {
  throw new Error('p40–53 body dimensions changed: ' + cipher.length + ' runes / ' + bodyWords.length + ' words');
}
if (wordPrimeSum(header[1]) !== 333) throw new Error('p40 red-heading seed changed');
if (wisdomBytes.length !== 3368) throw new Error('2013 wisdom/folly byte length changed');

const key = Array.from(wisdomBytes, x => x % 29);
const keySha256 = crypto.createHash('sha256').update(wisdomBytes).digest('hex');
const start = 3301;
const initialPreviousWordG = wordPrimeSum(header[1]);
const initialPreviousRune = header[1][header[1].length - 1];
const plan = buildPlan(bodyWords, initialPreviousWordG, initialPreviousRune);
const actual = beamDecode(cipher, plan.pvs, key, plan.dirs, start, 50);
const actualNegated = beamDecode(cipher, plan.pvs, key.map(x => (28 * x) % 29), plan.dirs, start, 50);

let displacement = 0;
let minDisplacement = 0;
let maxDisplacement = 0;
for (const d of plan.dirs) {
  displacement += d;
  minDisplacement = Math.min(minDisplacement, displacement);
  maxDisplacement = Math.max(maxDisplacement, displacement);
}

const offsetValues = [];
for (let i = 0; i < 30; i++) {
  const offset = Math.round(1650 + i * (1715 / 29));
  if (offset === start) continue;
  const result = beamDecode(cipher, plan.pvs, key, plan.dirs, offset, 50);
  if (result.complete) offsetValues.push({ offset, scaledIoc: result.scaledIoc });
}

const shuffleRandom = rng32(20261113);
const shuffledValues = [];
for (let trial = 0; trial < 20; trial++) {
  const shuffled = key.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = beamDecode(cipher, plan.pvs, shuffled, plan.dirs, start, 50);
  if (result.complete) shuffledValues.push(result.scaledIoc);
}

const positiveControl = plantPositiveControl(
  bodyWords,
  key,
  start,
  initialPreviousWordG,
  initialPreviousRune
);

console.log(JSON.stringify({
  hypothesis: {
    key: '2013 Cicada OS wisdom/folly binary bytes reduced modulo 29',
    keySha256,
    keyBytes: wisdomBytes.length,
    keyStartOffset: start,
    direction: 'previous ciphertext word GP-prime sum prime => forward; composite => backward',
    convention: '000: read then step, no inter-word movement, previous emitted ciphertext rune comparator',
    noRepeat: 'coin/retry model 1; positive-control keep probability 3/16 (skip probability 13/16)',
    target: 'LP2 physical pages 40–53, excluding the 8-rune p40 red heading'
  },
  target: {
    runes: cipher.length,
    words: bodyWords.length,
    headerWordLengths: header.map(w => w.length),
    headerLastRuneIndex: initialPreviousRune,
    headerPreviousWordGpSum: initialPreviousWordG,
    directionForwardWords: plan.wordDirs.filter(x => x === 1).length,
    directionBackwardWords: plan.wordDirs.filter(x => x === -1).length,
    pointerDisplacement: {
      net: displacement,
      min: minDisplacement,
      max: maxDisplacement,
      basePathAtStart: [start + minDisplacement, start + maxDisplacement]
    }
  },
  actual: {
    multiplier1: actual,
    multiplier28: actualNegated
  },
  matchedOffsetNull: {
    ...summarize(offsetValues.map(x => x.scaledIoc), actual.scaledIoc),
    samples: offsetValues
  },
  shuffledKeyNull: {
    ...summarize(shuffledValues, actual.scaledIoc),
    samples: shuffledValues
  },
  positiveControl
}, null, 2));
