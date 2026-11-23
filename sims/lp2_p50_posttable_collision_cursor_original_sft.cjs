'use strict';

/**
 * Single-file read-only original-cipher test (Node.js 22, Windows 11).
 *
 * Hypothesis: the 256 base-60 values on physical LP2 p49-p51 are a
 * phase-zero, row-major running GP29 key for the 170-rune complete
 * sentence immediately AFTER that field (p51 92 + p52 78).
 *
 * A conditional key-cursor skip consumes an extra table byte when a
 * would-be ciphertext symbol repeats the prior ciphertext symbol.
 * The 0.81 skip probability is a heuristic borrowed from anti-repeat
 * research, NOT an authenticated first-party instruction.
 *
 * The beam decoder preserves the exact original ciphertext and never
 * uses a proposed unknown LP2 plaintext during scoring.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const inputDirectory = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(inputDirectory, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(inputDirectory, 'lp2-grid-256.json'), 'utf8'));
const solvedLP1 = fs.readFileSync(path.join(inputDirectory, 'lp1-plaintext-reference.txt'), 'utf8');

const original = corpus.pages[51].indices.concat(corpus.pages[52].indices.slice(0, 78));
const solvedNative = corpus.pages[57].indices;
const nativeControl = Array.from({ length: 170 }, (_, i) => solvedNative[i % solvedNative.length]);
const key = grid.bytes.map(byte => byte % 29);
const rejectProbability = 0.81;
const maximumSkips = 4;
const beamWidth = 1200;

assert.equal(key.length, 256);
assert.equal(corpus.pages[51].indices.length, 92);
assert.equal(original.length, 170);
assert.equal(solvedNative.length, 95);

/** @param {string} source @returns {number[]} */
function toNativeRunes(source) {
  const normalized = source.toUpperCase().replace(/[KVQZ]/g, symbol => ({
    K: 'C', V: 'U', Q: 'C', Z: 'S'
  })[symbol]);
  const entries = corpus.translit.map((symbol, index) => [symbol, index]);
  entries.push(['ING', corpus.translit.indexOf('NG')]);
  entries.sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let pos = 0; pos < word.length;) {
      const candidate = entries.find(([wordSymbol]) => word.startsWith(wordSymbol, pos));
      if (candidate) {
        out.push(candidate[1]);
        pos += candidate[0].length;
      } else {
        pos++;
      }
    }
    out.push(29);
  }
  return out;
}

const reference = toNativeRunes(solvedLP1);
const mono = new Array(30).fill(0);
const bi = Array.from({ length: 30 }, () => new Array(30).fill(0));
const tri = Array.from({ length: 30 },
  () => Array.from({ length: 30 }, () => new Array(30).fill(0)));
for (let i = 0; i < reference.length; i++) {
  const current = reference[i];
  mono[current]++;
  if (i) bi[reference[i - 1]][current]++;
  if (i > 1) tri[reference[i - 2]][reference[i - 1]][current]++;
}

/** @param {number} x */
function unigram(x) {
  return (mono[x] + 0.3) / (reference.length + 9);
}

/** @param {number} prev @param {number} x */
function bigramProbability(prev, x) {
  return (bi[prev][x] + 5 * unigram(x)) / (mono[prev] + 5);
}

/** @param {number} a @param {number} b @param {number} x */
function trigramProbability(a, b, x) {
  return (tri[a][b][x] + 5 * unigram(x)) / (bi[a][b] + 5);
}

/** @param {number[]} symbols */
function indexOfCoincidence(symbols) {
  const freq = new Array(29).fill(0);
  for (const x of symbols) freq[x]++;
  return freq.reduce((sum, f) => sum + f * (f - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * Generate a deterministic source-native positive with this exact
 * conditional-key-cursor encoder. No unknown-text fitting.
 *
 * @param {number[]} plaintext
 */
function encodeControl(plaintext) {
  let seed = 3301;
  let cursor = 0;
  let previous = 29;
  let skips = 0;
  const ciphertext = [];

  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }

  for (const symbol of plaintext) {
    let current;
    let attempts = 0;
    while (true) {
      current = (symbol + key[cursor % key.length]) % 29;
      cursor++;
      attempts++;
      if (current !== previous ||
          random() >= rejectProbability ||
          attempts > maximumSkips) break;
      skips++;
    }
    ciphertext.push(current);
    previous = current;
  }
  return { ciphertext, skips, cursor };
}

/** @typedef {{cursor:number, a:number, b:number, score:number, plain:number[], skips:number}} State */

/**
 * Keep only paths in which every skipped key candidate would have
 * yielded the observed previous ciphertext. Score GP29 plaintext using
 * authentic LP1 n-grams; h*log(q/29) penalizes unobserved skips.
 *
 * @param {number[]} ciphertext
 * @returns {State}
 */
function beamDecode(ciphertext) {
  /** @type {State[]} */
  let states = [{ cursor: 0, a: 29, b: 29, score: 0, plain: [], skips: 0 }];
  let previous = 29;

  for (let i = 0; i < ciphertext.length; i++) {
    /** @type {State[]} */
    const candidates = [];
    for (const state of states) {
      for (let h = 0; h <= maximumSkips; h++) {
        const cursor = state.cursor + h;
        const plain = (ciphertext[i] - key[cursor % key.length] + 29) % 29;
        let valid = true;
        for (let k = 0; k < h; k++) {
          if ((plain + key[(state.cursor + k) % key.length]) % 29 !== previous) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;

        const probability = i === 0
          ? unigram(plain)
          : i === 1
            ? bigramProbability(state.b, plain)
            : trigramProbability(state.a, state.b, plain);
        const penalty = h * Math.log(rejectProbability / 29)
          + (ciphertext[i] === previous ? Math.log(1 - rejectProbability) : 0);

        candidates.push({
          cursor: cursor + 1,
          a: state.b,
          b: plain,
          score: state.score + Math.log(probability) + penalty,
          plain: state.plain.concat(plain),
          skips: state.skips + h
        });
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    states = candidates.slice(0, beamWidth);
    assert.ok(states.length, `Decoder lost all states at rune ${i}`);
    previous = ciphertext[i];
  }
  return states[0];
}

/** @param {number[]} symbols */
function display(symbols) {
  return symbols.map(x => corpus.translit[x]).join(' ');
}

function main() {
  const control = encodeControl(nativeControl);
  const recoveredControl = beamDecode(control.ciphertext);
  const nativeMatches = recoveredControl.plain
    .filter((symbol, i) => symbol === nativeControl[i]).length;
  assert.equal(nativeMatches, 170);
  assert.equal(recoveredControl.plain.length, control.ciphertext.length);

  const recoveredOriginal = beamDecode(original);
  assert.equal(recoveredOriginal.plain.length, original.length);

  const results = {
    source: 'canonical physical LP2 p51 92 runes plus p52 first 78; p50 base60 numeric table',
    algorithm: 'GP29 C=P+K, row-major table mod29 key, conditional collision skips',
    assumptions: { rejectProbability, maximumSkips, beamWidth, keyPhase: 0 },
    positive: {
      originalNativeRunes: nativeControl.length,
      exactRecovered: nativeMatches,
      plantedSkips: control.skips,
      recoveredSkips: recoveredControl.skips,
      plaintextIoC: indexOfCoincidence(recoveredControl.plain),
      score: recoveredControl.score
    },
    unknown: {
      runeCount: original.length,
      recoveredSkips: recoveredOriginal.skips,
      gp29IoC: indexOfCoincidence(recoveredOriginal.plain),
      score: recoveredOriginal.score,
      meanScore: recoveredOriginal.score / original.length,
      first95: display(recoveredOriginal.plain.slice(0, 95))
    },
    conclusion: 'Native control recovers; untouched original remains chance-like. No authenticated LP2 plaintext/key/opcode.'
  };
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
}

main();
