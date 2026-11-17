'use strict';

/**
 * Exact, no-beam GP29 all-cursor inversion for source-table RC4 with
 * plaintext-Fehu bypass and ciphertext-collision key rejection.
 *
 * A cipher-F bypass consumes no keystream. Non-F plaintext uses RC4 pad
 * modulo 29 and can reject a proposed symbol only if its ciphertext would
 * equal the previous emitted symbol. The accepted proposal may still repeat.
 *
 * This is a bounded original-source hypothesis; it is not a historical cipher
 * attribution. Uses only Node.js built-ins and read-only repository resources.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}

const source = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const originalPages = source.pages.filter(p => p.page <= 55 && p.indices.length);
const whole = originalPages.flatMap(p => p.indices);
const chapter33 = source.pages.slice(33, 40).flatMap(p => p.indices);
const chapter40 = source.pages.slice(40, 56).flatMap(p => p.indices);
const terminal = source.pages.slice(54, 56).flatMap(p => p.indices);
const clear57 = source.pages[57].indices;
const digits59 = grid.alphabet.replace('f', '');

assert.equal(whole.length, 12956);
assert.equal(chapter33.length, 1680);
assert.equal(chapter40.length, 3316);
assert.equal(terminal.length, 308);
assert.equal(clear57.length, 95);

/** @param {number} x */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/**
 * @param {number[]} key
 * @param {number} drop
 * @param {number} n
 * @returns {Uint8Array}
 */
function rc4(key, drop, n) {
  const state = Uint8Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  let i = 0;
  j = 0;
  const output = new Uint8Array(n);
  for (let k = 0; k < drop + n; k++) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    if (k >= drop) output[k - drop] = state[(state[i] + state[j]) & 255] % 29;
  }
  return output;
}

/**
 * Enumerate ALL key cursor histories. No language model, plaintext scoring,
 * pruning or arbitrary skip cap is used. A rejected candidate must equal the
 * prior output under the *same* prospective plaintext rune. Therefore all
 * rejected key residues at one position must be identical. We stop enumerating
 * longer rejection runs as soon as that necessary equality fails.
 *
 * @param {number[]} cipher
 * @param {Uint8Array} key
 * @param {1|-1} sign
 * @returns {{reached:number,states:Set<number>,peak:number}}
 */
function reach(cipher, key, sign) {
  let states = new Set([0]);
  let peak = 1;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    const previous = i ? cipher[i - 1] : null;
    const current = cipher[i];
    for (const cursor of states) {
      if (current === 0) next.add(cursor); // Literal F; no key consumed.
      for (let skips = 0; cursor + skips < key.length; skips++) {
        if (skips && previous === null) break;
        if (skips > 1 && key[cursor + skips - 1] !== key[cursor]) break;
        const plain = mod29(current - sign * key[cursor + skips]);
        if (plain === 0) continue; // F must bypass, never be enciphered.
        if (skips === 0 || mod29(plain + sign * key[cursor]) === previous) {
          next.add(cursor + skips + 1);
        }
      }
    }
    states = next;
    peak = Math.max(peak, states.size);
    if (states.size === 0) return { reached: i, states, peak };
  }
  return { reached: cipher.length, states, peak };
}

/** @param {number[][]} rows @param {number} kind */
function order(rows, kind) {
  if (kind === 0) return rows.flat();
  if (kind === 1) return rows.flat().reverse();
  const col = Array.from({ length: 8 }, (_, c) => rows.map(r => r[c])).flat();
  return kind === 2 ? col : col.reverse();
}

/** @param {number} radix */
function table(radix) {
  if (radix === 60) return grid.byte_rows;
  return grid.rows.map(row => row.map(token => {
    const x = digits59.indexOf(token[0]);
    const y = digits59.indexOf(token[1]);
    assert.ok(x >= 0 && y >= 0);
    return radix * x + y;
  }));
}

/** @param {number} seed */
function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Strict stochastic positive plant with a real independently clear GP29
 * register: p57 repeats for enough text to exceed the longest chapter.
 * @param {number[]} plain
 * @param {Uint8Array} key
 * @param {1|-1} sign
 * @param {number} seed
 */
function plant(plain, key, sign, seed) {
  const rng = xorshift(seed);
  const out = [];
  let consumed = 0, bypass = 0, rejected = 0;
  for (const p of plain) {
    if (p === 0) {
      out.push(0);
      bypass++;
      continue;
    }
    for (;;) {
      assert.ok(consumed < key.length);
      const c = mod29(p + sign * key[consumed++]);
      if (out.length && c === out[out.length - 1] && rng() < 0.81) {
        rejected++;
        continue;
      }
      out.push(c);
      break;
    }
  }
  return { out, consumed, bypass, rejected };
}

const plantedPlain = Array.from({ length: chapter40.length }, (_, i) => clear57[i % clear57.length]);
const positiveKey = rc4(order(table(59), 3), 768, 16000);
const positive = plant(plantedPlain, positiveKey, 1, 0x3301cafe);
const positiveReach = reach(positive.out, positiveKey, 1);
assert.equal(positiveReach.reached, plantedPlain.length);
assert.ok(positiveReach.states.has(positive.consumed));
assert.ok(positive.bypass > 0);
assert.ok(positive.rejected > 0);
console.log(JSON.stringify({ control: 'clear p57 GP29 source plant',
  n: plantedPlain.length, bypass: positive.bypass, collisionRejects: positive.rejected,
  finalCursor: positive.consumed, includedInAllCursorInverse: true }));

const runs = [];
for (const radix of [60, 59]) {
  const rows = table(radix);
  for (let shape = 0; shape < 4; shape++) {
    for (const drop of [0, 256, 768, 3072]) {
      const key = rc4(order(rows, shape), drop, 16000);
      for (const sign of /** @type {Array<1|-1>} */ ([1, -1])) {
        const c = {
          radix, shape, drop, sign,
          whole: reach(whole, key, sign).reached,
          chapter33: reach(chapter33, key, sign).reached,
          chapter40: reach(chapter40, key, sign).reached,
          terminal: reach(terminal, key, sign).reached
        };
        let pages33 = 0, pages40 = 0;
        for (const p of originalPages) {
          const n = reach(p.indices, key, sign).reached;
          if (n === p.indices.length && p.page >= 33 && p.page <= 39) pages33++;
          if (n === p.indices.length && p.page >= 40 && p.page <= 55) pages40++;
        }
        c.pages33 = pages33;
        c.pages40 = pages40;
        runs.push(c);
      }
    }
  }
}

assert.equal(runs.length, 64);
assert.equal(Math.max(...runs.map(c => c.whole)), 1682);
assert.equal(Math.max(...runs.map(c => c.chapter33)), 511);
assert.equal(Math.max(...runs.map(c => c.chapter40)), 1510);
assert.equal(runs.filter(c => c.terminal === 308).length, 1);
assert.equal(Math.max(...runs.map(c => c.pages33)), 3);
assert.equal(Math.max(...runs.map(c => c.pages40)), 8);

console.log(JSON.stringify({
  variants: runs.length,
  lengths: { whole: whole.length, chapter33: chapter33.length, chapter40: chapter40.length, terminal: terminal.length },
  fullSurvivors: {
    whole: runs.filter(c => c.whole === whole.length).length,
    chapter33: runs.filter(c => c.chapter33 === chapter33.length).length,
    chapter40: runs.filter(c => c.chapter40 === chapter40.length).length,
    terminal: runs.filter(c => c.terminal === terminal.length).length,
    allSevenPageResets33: runs.filter(c => c.pages33 === 7).length,
    allFifteenPageResets40: runs.filter(c => c.pages40 === 15).length
  },
  furthestReached: {
    whole: Math.max(...runs.map(c => c.whole)),
    chapter33: Math.max(...runs.map(c => c.chapter33)),
    chapter40: Math.max(...runs.map(c => c.chapter40))
  },
  maxIndividualPageSurvivors: {
    group33: Math.max(...runs.map(c => c.pages33)),
    group40: Math.max(...runs.map(c => c.pages40))
  },
  terminalSurvivor: runs.find(c => c.terminal === terminal.length)
}, null, 2));


/**
 * Complete exact-language adjudication of the single p54+p55 receiver that
 * survived the 64-rule feasibility gate. We enumerate every legal 308-rune
 * plaintext path. A separate fixed Shakespeare-GP trigram control scores the
 * literal source candidates without supplying an unknown-page crib.
 *
 * @param {number[]} cipher
 * @param {Uint8Array} key
 * @param {1|-1} sign
 * @returns {string[]}
 */
function allPlainPaths(cipher, key, sign) {
  /** @type {Map<number, string[]>} */
  let paths = new Map([[0, ['']]]);
  for (let i = 0; i < cipher.length; i++) {
    /** @type {Map<number, string[]>} */
    const next = new Map();
    const previous = i ? cipher[i - 1] : null;
    const current = cipher[i];
    for (const [cursor, variants] of paths) {
      /** @param {number} newCursor @param {number} plain */
      function append(newCursor, plain) {
        let dst = next.get(newCursor);
        if (!dst) {
          dst = [];
          next.set(newCursor, dst);
        }
        const encoded = String.fromCharCode(65 + plain);
        for (const prefix of variants) dst.push(prefix + encoded);
      }
      if (current === 0) append(cursor, 0);
      for (let skips = 0; cursor + skips < key.length; skips++) {
        if (skips && previous === null) break;
        if (skips > 1 && key[cursor + skips - 1] !== key[cursor]) break;
        const plain = mod29(current - sign * key[cursor + skips]);
        if (plain !== 0 &&
          (skips === 0 || mod29(plain + sign * key[cursor]) === previous)) {
          append(cursor + skips + 1, plain);
        }
      }
    }
    paths = next;
    assert.ok(paths.size > 0);
  }
  return [...paths.values()].flat();
}

/** @param {string} text */
function encodeToGP(text) {
  const alphabet = new Map(source.translit.map((name, i) => [name.toLowerCase(), i]));
  const lower = text.toLowerCase()
    .replace(/qu/g, 'cw').replace(/v/g, 'u')
    .replace(/k/g, 'c').replace(/z/g, 's')
    .replace(/ing/g, 'ng').replace(/io/g, 'ia');
  const out = [];
  for (let i = 0; i < lower.length;) {
    const pair = lower.slice(i, i + 2);
    if (alphabet.has(pair)) {
      out.push(alphabet.get(pair));
      i += 2;
    } else if (alphabet.has(lower[i])) {
      out.push(alphabet.get(lower[i]));
      i++;
    } else {
      i++;
    }
  }
  return out;
}

const shakespeare = fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const gpTrain = encodeToGP(shakespeare.slice(0, 200000));
assert.equal(gpTrain.length, 144904);
const frequency = new Float64Array(30 * 30 * 29);
const bigram = new Float64Array(30 * 30);
{
  let a = 29, b = 29;
  for (const value of gpTrain) {
    frequency[(a * 30 + b) * 29 + value]++;
    bigram[a * 30 + b]++;
    a = b;
    b = value;
  }
}
for (let a = 0; a < 30; a++) {
  for (let b = 0; b < 30; b++) {
    for (let c = 0; c < 29; c++) {
      const i = (a * 30 + b) * 29 + c;
      frequency[i] = Math.log((frequency[i] + 0.2) /
        (bigram[a * 30 + b] + 29 * 0.2));
    }
  }
}

/** @param {number[]} runes */
function gpTrigramScore(runes) {
  let a = 29, b = 29, total = 0;
  for (const value of runes) {
    total += frequency[(a * 30 + b) * 29 + value];
    a = b;
    b = value;
  }
  return total / runes.length;
}

/** @param {string} encoded */
function unpack(encoded) {
  return [...encoded].map(c => c.charCodeAt(0) - 65);
}

const terminalKey = rc4(order(table(59), 3), 768, 16000);
const terminalPaths = allPlainPaths(terminal, terminalKey, 1);
assert.equal(terminalPaths.length, 1152);
const scored = terminalPaths.map(encoded => ({
  encoded, score: gpTrigramScore(unpack(encoded))
})).sort((a, b) => b.score - a.score);
const nativeP57 = gpTrigramScore(clear57);
const heldout = gpTrigramScore(encodeToGP(shakespeare.slice(250000)).slice(0, 308));
assert.ok(Math.abs(scored[0].score - (-4.12660683929743)) < 1e-9);
assert.ok(Math.abs(nativeP57 - (-2.478206160059137)) < 1e-9);
assert.ok(Math.abs(heldout - (-2.4445153142275746)) < 1e-9);

// Recover the original 66 printed word boundaries, not inferred plaintext.
const transcript = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const observedParts = transcript.split('%').slice(53, 55).join('');
const glyphMap = new Map(source.runes.map((glyph, i) => [glyph, i]));
const segments = [];
let fragment = [];
for (const glyph of observedParts) {
  if (glyphMap.has(glyph)) fragment.push(glyphMap.get(glyph));
  else if ((glyph === '-' || glyph === '.') && fragment.length) {
    segments.push(fragment);
    fragment = [];
  }
}
if (fragment.length) segments.push(fragment);
assert.equal(segments.length, 66);
assert.deepEqual(segments.flat(), terminal);

/** @param {string} encoded */
function renderOriginalWords(encoded) {
  let pos = 0;
  return segments.map(word => {
    const result = [...encoded.slice(pos, pos + word.length)]
      .map(c => source.translit[c.charCodeAt(0) - 65]).join('');
    pos += word.length;
    return result;
  }).join(' ');
}

console.log(JSON.stringify({
  terminalReceiver: '59 / reverse-column / RC4-drop768 / GP-plus',
  exactAdmissiblePlaintexts: terminalPaths.length,
  maxNativeGPTrigramPerRune: scored[0].score,
  nativeClearP57Score: nativeP57,
  independentShakespeareHeldout308Score: heldout,
  bestSurvivorOpening: renderOriginalWords(scored[0].encoded).slice(0, 180),
  sourcePrintedWords: segments.length
}, null, 2));
