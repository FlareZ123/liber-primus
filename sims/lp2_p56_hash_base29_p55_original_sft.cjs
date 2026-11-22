'use strict';

/**
 * Exact original-p55 terminal handoff gate, using the author-era BASE29 command
 * on the immediately following solved p56 hash. No parameter search.
 *
 * Source-fixed candidate:
 *   1. Interpret the 128 printed p56 hexadecimal digits as one big-endian integer.
 *   2. Convert that integer to ordinary most-significant-first base29 digits.
 *   3. Starting at digit zero, encrypt every non-F p55 plaintext rune by
 *      C = (P + K) % 29, with authentic p56 transparent-plaintext-F bypass.
 * The direct no-bypass readout is reported only as a diagnostic.
 *
 * Run from the repository: node sims/lp2_p56_hash_base29_p55_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const solved = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const page = (number) => {
  const found = corpus.pages.find((entry) => entry.page === number);
  assert.ok(found && Array.isArray(found.indices), 'Missing source page ' + number);
  return found.indices;
};
const p54 = page(54);
const p55 = page(55);
const p56 = page(56);
const clearP57 = page(57).slice(0, 76);

// Solve-native p56 plaintext uses the original printed GP-specific spelling.
// Independent authenticity check: the real prime-totient/F law reproduces
// the entire original p56 ciphertext from these 85 plaintext GP indices.
const gpWord = (word) => {
  const tokens = corpus.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const part = tokens.find((t) => normalized.startsWith(t.s, i));
    assert.ok(part, 'Unencodable solved-p56 plaintext token');
    out.push(part.i);
    i += part.s.length;
  }
  return out;
};
const p56Known = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
const native = p56Known.slice(0, 76);
assert.equal(p56Known.length, 85);

const primeTotients = (n) => {
  const result = [];
  for (let x = 2; result.length < n; x++) {
    let prime = true;
    for (let k = 2; k * k <= x; k++) {
      if (x % k === 0) { prime = false; break; }
    }
    if (prime) result.push((x - 1) % 29);
  }
  return result;
};
const knownPrimeKey = primeTotients(85);
let genuineClock = 0;
const genuineP56 = p56Known.map((plain) => plain === 0
  ? 0 : (plain + knownPrimeKey[genuineClock++]) % 29);
assert.deepEqual(genuineP56, p56, 'Authentic p56 prime-totient known-plaintext positive');

assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(native.length, 76);
assert.equal(clearP57.length, 76);

const p56Block = /^### 56\s*$([\s\S]*?)(?=^### 57\s*$)/m.exec(solved);
assert.ok(p56Block, 'Missing solved-p56 source block');
const hexadecimalRuns = p56Block[1].match(/\b[0-9a-f]{16,}\b/g);
assert.ok(hexadecimalRuns && hexadecimalRuns.length === 2, 'Expected the two p56 digest lines');
const hash = hexadecimalRuns.join('');
assert.equal(hash.length, 128, 'p56 digest should have 128 hex digits');

const base29 = (hex) => {
  let value = BigInt('0x' + hex);
  const digits = [];
  while (value > 0n) {
    digits.unshift(Number(value % 29n));
    value /= 29n;
  }
  return digits;
};
const key = base29(hash);
assert.equal(key.length, 105);

const encrypt = (plaintext, skipF) => {
  const ciphertext = [];
  let clock = 0;
  for (const plain of plaintext) {
    assert.ok(Number.isInteger(plain) && plain >= 0 && plain < 29);
    if (skipF && plain === 0) {
      ciphertext.push(0);
    } else {
      ciphertext.push((plain + key[clock]) % 29);
      clock += 1;
    }
  }
  return { ciphertext, clock };
};

const invert = (ciphertext, skipF) => {
  let paths = [{ plaintext: [], clock: 0, skips: 0 }];
  for (let offset = 0; offset < ciphertext.length; offset += 1) {
    const current = ciphertext[offset];
    const next = [];
    for (const candidate of paths) {
      const k = key[candidate.clock];
      if (skipF && current === 0) {
        next.push({
          plaintext: [...candidate.plaintext, 0],
          clock: candidate.clock,
          skips: candidate.skips + 1
        });
      }
      const decoded = (current - k + 29) % 29;
      if (!skipF || decoded !== 0) {
        next.push({
          plaintext: [...candidate.plaintext, decoded],
          clock: candidate.clock + 1,
          skips: candidate.skips
        });
      }
    }
    if (next.length === 0) {
      return { paths: [], firstImpossible: offset };
    }
    paths = next;
  }
  return { paths, firstImpossible: null };
};

const coincidence = (values) => {
  const counts = new Array(29).fill(0);
  for (const v of values) counts[v] += 1;
  return counts.reduce((acc, f) => acc + f * (f - 1), 0) /
    (values.length * (values.length - 1));
};

const wordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 76);
const romanizeWords = (values) => {
  let offset = 0;
  return wordLengths.map((n) => {
    const word = values.slice(offset, offset + n).map((v) => corpus.translit[v]).join('');
    offset += n;
    return word;
  }).join(' ');
};

// Genuine authenticated p56 GP plaintext positive and exact replay, with transparent-F events.
const synthetic = encrypt(native, true);
const nativeInverse = invert(synthetic.ciphertext, true);
assert.equal(nativeInverse.firstImpossible, null, 'Synthetic inverse unexpectedly impossible');
assert.ok(nativeInverse.paths.some((item) => item.plaintext.every((value, i) => value === native[i])),
  'Transparent-F inverse failed to recover the original solved-native GP text');
for (const item of nativeInverse.paths) {
  assert.deepEqual(encrypt(item.plaintext, true).ciphertext, synthetic.ciphertext,
    'A possible synthetic inverse must reconstruct its ciphertext');
}

// Independent no-bypass solved-native plant also recovers all plaintext exactly.
const directPlant = encrypt(native, false);
const directPlantInverse = invert(directPlant.ciphertext, false);
assert.equal(directPlantInverse.paths.length, 1);
assert.deepEqual(directPlantInverse.paths[0].plaintext, native);

// Original page. Preserve all 76 glyph identities and printed word boundaries.
const terminal = invert(p55, true);
const direct = invert(p55, false);
assert.equal(direct.paths.length, 1);
assert.deepEqual(encrypt(direct.paths[0].plaintext, false).ciphertext, p55);
assert.equal(terminal.firstImpossible, 61);
assert.equal(terminal.paths.length, 0);

const leading = p54.slice(0, 9);
const combined = leading.concat(p55);
assert.equal(combined.length, p56.length);
const sorted = (seq) => {
  const bins = Array.from({ length: 29 }, () => 0);
  seq.forEach((v) => bins[v]++);
  return bins.sort((a, b) => a - b);
};
const sourceHistogram = sorted(combined);
const solvedCipherHistogram = sorted(p56);
const identicalHistogram = sourceHistogram.every((n, i) => n === solvedCipherHistogram[i]);
assert.equal(identicalHistogram, false,
  'Unexpected match in the 85-symbol source header/p55 and solved-p56 histograms');

console.log(JSON.stringify({
  source: 'original LP2 p54 red9 + p55 whole76; p56 solved digest and ciphertext',
  p55Runes: p55.length,
  p56Runes: p56.length,
  p54LeadingRunes: leading.length,
  hashLengthHex: hash.length,
  mostSignificantFirstBase29KeyDigits: key.length,
  first15KeyDigits: key.slice(0, 15),
  nativePositive: {
    source: '85-source-rune authentic p56 decrypted sentence, first 76 as prospective p55-shaped plant',
    originalP56PrimeTotientReproduced: true,
    symbols: native.length,
    transparentFSyntheticClock: synthetic.clock,
    inversePaths: nativeInverse.paths.length,
    exactNativeRecovered: true,
    noBypassNativeRecovered: true
  },
  original: {
    transparentF: {
      firstImpossibleZeroBasedRune: terminal.firstImpossible,
      survivingPaths: terminal.paths.length
    },
    noBypass: {
      plaintextIoc: coincidence(direct.paths[0].plaintext),
      romanizedPrintedWords: romanizeWords(direct.paths[0].plaintext),
      exactRoundtrip: true
    },
    alternative85SourceTape: {
      p54Red9PlusP55Runes: combined.length,
      sameSymbolHistogramAsP56Cipher: identicalHistogram
    }
  }
}, null, 2));
