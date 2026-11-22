'use strict';

/**
 * Exact all-mask GP30 DIVINITY/F-transparent bound on original LP2.
 *
 * The historically verified solved-LP1 Vigenere key is DIVINITY. Its known
 * GP29 decoder can let literal ciphertext F=0 represent plaintext F=0,
 * WITHOUT advancing the key, while an F normally enciphered to ciphertext F
 * may still consume the key. The observed F skip mask is not uniquely
 * recoverable from ciphertext alone.
 *
 * This separate hypothesis extends both printed separators and GP runes
 * into a GP30 alphabet (SPACE=29). We grant EVERY source F independently a
 * free, hidden decision to be literal F (no clock step) or a normally keyed
 * character (clock step). Dynamic programming computes the EXACT MAXIMUM
 * plaintext spaces over every possible F mask. This is a generous necessary
 * capacity gate, not a claim that the extension was authored by Cicada.
 *
 * Execute on Windows 11, Node.js 22:
 *   node sims/lp2_divinity_gp30_all_fskip_space_capacity_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sourceParts = read('resources/lp2-transcription.txt').split('$');
const nativeLP1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('$');
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const key = [23, 10, 1, 10, 9, 10, 16, 26];
const KEY_LENGTH = key.length;

assert.equal(sourceParts.length, 10);
assert.equal(nativeLP1.length, 8);
assert.equal(key.map((i) => corpus.translit[i]).join(''), 'DIUINITY');

/** @typedef {{digit:number, section:number, page:number, offset:number, kind:'rune'|'-'|'.'}} SourceToken */

/**
 * Read actual printed words, full punctuation and original physical page
 * owners. The page owner comes from unchanged full original rune indices,
 * not from a guessed number of '%' symbols in the source transcript.
 * @param {string} text
 * @param {number[]} owners
 * @returns {{tokens:SourceToken[], runes:number[]}}
 */
function tokenize(text, owners = []) {
  /** @type {SourceToken[]} */
  const tokens = [];
  const runes = [];
  let section = 0;
  let page = owners.length ? owners[0] : 57;
  for (let i = 0; i < text.length; i++) {
    const glyph = text[i];
    const digit = alphabet.get(glyph);
    if (glyph === '$') {
      section++;
      continue;
    }
    if (digit !== undefined) {
      if (owners.length) {
        page = owners[runes.length];
        assert.ok(Number.isInteger(page));
      }
      runes.push(digit);
      tokens.push({digit, section, page, offset:i, kind:'rune'});
    } else if (glyph === '-' || glyph === '.') {
      tokens.push({digit:29, section, page, offset:i, kind:glyph});
    }
  }
  if (owners.length) assert.equal(runes.length, owners.length);
  return {tokens, runes};
}

/**
 * Given an explicit literal-F source decision for each ciphertext F,
 * decode the *complete* full30 source token stream exactly.
 *
 * @param {number[]} cipher
 * @param {boolean[]} skipMask
 * @param {number} initial
 * @returns {{plain:number[], finalPhase:number, literalFs:number}}
 */
function decipher(cipher, skipMask, initial = 0) {
  assert.equal(cipher.length, skipMask.length);
  assert.ok(initial >= 0 && initial < KEY_LENGTH);
  let phase = initial;
  let literalFs = 0;
  /** @type {number[]} */
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    if (skipMask[i]) {
      assert.equal(cipher[i], 0, 'Only ciphertext F can take the literal bypass');
      plain.push(0);
      literalFs++;
    } else {
      plain.push((cipher[i] - key[phase] + 30) % 30);
      phase = (phase + 1) % KEY_LENGTH;
    }
  }
  return {plain, finalPhase:phase, literalFs};
}

/**
 * Exact inverse of decipher when the F bypass decisions are part of the
 * cipher specification. All source text punctuation is retained as sidecar.
 * @param {number[]} plain
 * @param {boolean[]} skipMask
 * @param {number} initial
 * @returns {{cipher:number[], finalPhase:number}}
 */
function encipher(plain, skipMask, initial = 0) {
  assert.equal(plain.length, skipMask.length);
  let phase = initial;
  /** @type {number[]} */
  const cipher = [];
  for (let i = 0; i < plain.length; i++) {
    const n = plain[i];
    assert.ok(Number.isInteger(n) && n >= 0 && n < 30);
    if (skipMask[i]) {
      assert.equal(n, 0, 'Literal F plaintext must be F=0');
      cipher.push(0);
    } else {
      cipher.push((n + key[phase]) % 30);
      phase = (phase + 1) % KEY_LENGTH;
    }
  }
  return {cipher, finalPhase:phase};
}

/**
 * Exact 8-state Viterbi max-plus DP. The only ambiguity is whether an
 * original ciphertext F=0 consumed a key step. Each branch is considered;
 * all other symbols necessarily consume one key step. Backpointers recover
 * one explicit best F mask and all its plaintext digits for forward replay.
 *
 * @param {number[]} cipher
 * @param {number} initial
 * @returns {{spaces:number, skipMask:boolean[], decoded:number[], endPhase:number}}
 */
function maximizeSpace(cipher, initial = 0) {
  assert.ok(Number.isInteger(initial) && initial >= 0 && initial < KEY_LENGTH);
  const n = cipher.length;
  let scores = Array(KEY_LENGTH).fill(-Infinity);
  scores[initial] = 0;
  const back = Array.from({length:n}, () => new Int8Array(KEY_LENGTH).fill(-1));
  const bypass = Array.from({length:n}, () => new Uint8Array(KEY_LENGTH));

  for (let i = 0; i < n; i++) {
    const c = cipher[i];
    assert.ok(Number.isInteger(c) && c >= 0 && c < 30);
    const next = Array(KEY_LENGTH).fill(-Infinity);
    for (let phase = 0; phase < KEY_LENGTH; phase++) {
      const count = scores[phase];
      if (!Number.isFinite(count)) continue;
      const normalOutput = (c - key[phase] + 30) % 30;
      const successor = (phase + 1) % KEY_LENGTH;
      const normalTotal = count + (normalOutput === 29 ? 1 : 0);
      if (normalTotal > next[successor]) {
        next[successor] = normalTotal;
        back[i][successor] = phase;
        bypass[i][successor] = 0;
      }
      if (c === 0 && count > next[phase]) {
        next[phase] = count;
        back[i][phase] = phase;
        bypass[i][phase] = 1;
      }
    }
    scores = next;
  }

  const spaces = Math.max(...scores);
  let phase = scores.indexOf(spaces);
  const endPhase = phase;
  const skipMask = Array(n).fill(false);
  for (let i = n - 1; i >= 0; i--) {
    const previous = back[i][phase];
    assert.ok(previous >= 0 && previous < KEY_LENGTH);
    skipMask[i] = bypass[i][phase] === 1;
    phase = previous;
  }
  assert.equal(phase, initial);
  const replay = decipher(cipher, skipMask, initial);
  assert.deepEqual(encipher(replay.plain, skipMask, initial).cipher, cipher);
  assert.equal(replay.finalPhase, endPhase);
  assert.equal(replay.plain.filter((x) => x === 29).length, spaces);
  return {spaces, skipMask, decoded:replay.plain, endPhase};
}

/**
 * A source-hidden initial phase per group can only increase the upper
 * bound. Each group can have its own arbitrary F choices and phase.
 * @param {SourceToken[]} tokens
 * @param {'section'|'page'} reset
 * @param {boolean} freePhase
 * @returns {{groups:number, maximumSpaces:number}}
 */
function independentResets(tokens, reset, freePhase) {
  /** @type {Map<number,number[]>} */
  const groups = new Map();
  for (const token of tokens) {
    const group = reset === 'section' ? token.section : token.page;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(token.digit);
  }
  let maximumSpaces = 0;
  for (const values of groups.values()) {
    if (freePhase) {
      maximumSpaces += Math.max(...Array.from({length:KEY_LENGTH}, (_, phase) =>
        maximizeSpace(values, phase).spaces));
    } else {
      maximumSpaces += maximizeSpace(values, 0).spaces;
    }
  }
  return {groups:groups.size, maximumSpaces};
}

const originalParts = sourceParts.slice(0, 8).join('$');
const pageOwners = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page)
  .flatMap((p) => p.indices.map(() => p.page));
const original = tokenize(originalParts, pageOwners);
const corpusDigits = original.tokens.map((token) => token.digit);
assert.equal(original.runes.length, 12956);
assert.equal(corpusDigits.length, 15858);
assert.equal(corpusDigits.filter((v) => v === 29).length, 2902);
assert.equal(corpusDigits.filter((v) => v === 0).length, 458);
assert.deepEqual(original.runes,
  corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page)
    .flatMap((p) => p.indices));

const optimalOriginal = maximizeSpace(corpusDigits, 0);
assert.equal(optimalOriginal.spaces, 756);
assert.equal(Math.max(...Array.from({length:KEY_LENGTH}, (_, phase) =>
  maximizeSpace(corpusDigits, phase).spaces)), 759);

// The optimal original backtrace retains every original source token and
// the entire original typography/per-page word-carry tape unchanged.
const reenciphered = encipher(optimalOriginal.decoded, optimalOriginal.skipMask);
assert.deepEqual(reenciphered.cipher, corpusDigits);
const rebuiltSource = Array.from(originalParts);
for (let i = 0; i < original.tokens.length; i++) {
  const token = original.tokens[i];
  if (token.kind === 'rune') {
    assert.ok(reenciphered.cipher[i] < 29);
    rebuiltSource[token.offset] = corpus.runes[reenciphered.cipher[i]];
  } else {
    assert.equal(reenciphered.cipher[i], 29);
    rebuiltSource[token.offset] = token.kind;
  }
}
assert.equal(rebuiltSource.join(''), originalParts);

/** @param {number} first @param {number} last */
function pageSpan(first, last) {
  const subset = original.tokens.filter((t) => t.page >= first && t.page <= last);
  return {subset, cipher:subset.map((t) => t.digit),
    runes:subset.filter((t) => t.kind === 'rune').length};
}
const development = pageSpan(16, 21);
const holdout = pageSpan(40, 53);
assert.equal(development.cipher.length, 1985);
assert.equal(development.runes, 1613);
assert.equal(holdout.cipher.length, 3677);
assert.equal(holdout.runes, 3008);
assert.equal(maximizeSpace(development.cipher, 0).spaces, 92);
assert.equal(maximizeSpace(holdout.cipher, 0).spaces, 191);
assert.equal(Math.max(...Array.from({length:KEY_LENGTH}, (_, phase) =>
  maximizeSpace(development.cipher, phase).spaces)), 96);
assert.equal(Math.max(...Array.from({length:KEY_LENGTH}, (_, phase) =>
  maximizeSpace(holdout.cipher, phase).spaces)), 192);

const sourceSections = independentResets(original.tokens, 'section', false);
const freeSourceSections = independentResets(original.tokens, 'section', true);
const physicalPages = independentResets(original.tokens, 'page', false);
const freePhysicalPages = independentResets(original.tokens, 'page', true);
assert.deepEqual(sourceSections, {groups:8, maximumSpaces:754});
assert.deepEqual(freeSourceSections, {groups:8, maximumSpaces:767});
assert.deepEqual(physicalPages, {groups:55, maximumSpaces:713});
assert.deepEqual(freePhysicalPages, {groups:55, maximumSpaces:825});

// The exact 755-rune unenciphered LP1 source supplies a realistic positive
// bypass plant with *real original GP lettering and 183 actual word/period
// events*. This plant intentionally sends all plaintext F as literal skips,
// and normal characters can also happen to encipher into ciphertext F.
// The known mask is used ONLY to test source-native forward/reverse replay.
const lp1 = tokenize(nativeLP1[4]);
assert.equal(lp1.runes.length, 755);
assert.equal(lp1.tokens.length, 938);
assert.equal(lp1.tokens.filter((t) => t.digit === 29).length, 183);
const lp1Plain = lp1.tokens.map((t) => t.digit);
const lp1Mask = lp1Plain.map((p) => p === 0);
const lp1Cipher = encipher(lp1Plain, lp1Mask).cipher;
assert.deepEqual(decipher(lp1Cipher, lp1Mask).plain, lp1Plain);
assert.ok(lp1Cipher.some((v, i) => v === 0 && !lp1Mask[i]));
assert.ok(maximizeSpace(lp1Cipher, 0).spaces >= 183);
const p57 = tokenize(sourceParts[9]);
const p57Plain = p57.tokens.map((t) => t.digit);
assert.equal(p57.runes.length, 95);
assert.equal(p57Plain.length, 115);
assert.equal(p57Plain.filter((n) => n === 29).length, 20);
const p57Mask = p57Plain.map((v) => v === 0);
const p57Cipher = encipher(p57Plain, p57Mask).cipher;
assert.deepEqual(decipher(p57Cipher, p57Mask).plain, p57Plain);
assert.ok(maximizeSpace(p57Cipher).spaces >= 20);

/** @param {number[]} seq @param {number} max */
function preview(seq, max) {
  return seq.slice(0, max).map((v) => v === 29 ? ' ' : corpus.translit[v]).join('');
}
console.log('GP30 DIVINITY/F-transparent all-mask original-space SFT: PASS');
console.log('Original: 12956 GP runes, 2902 printed SPACE/period, 458 ciphertext F.');
console.log('Max plaintext SPACEs, arbitrary original F mask:');
console.log('  entire original continuous phase0 =', optimalOriginal.spaces,
  '/', corpusDigits.length, '(' +
  (100 * optimalOriginal.spaces / corpusDigits.length).toFixed(3) + '%)');
console.log('  entire original arbitrary global phase = 759 /', corpusDigits.length);
console.log('  8 original source section zero/arbitrary phases =',
  sourceSections.maximumSpaces, '/', freeSourceSections.maximumSpaces);
console.log('  55 original physical page zero/arbitrary phases =',
  physicalPages.maximumSpaces, '/', freePhysicalPages.maximumSpaces);
console.log('  p16–21 zero/free initial phase = 92/96 of 1985');
console.log('  p40–53 zero/free initial phase = 191/192 of 3677');
console.log('Authentic GP native controls: 755-rune LP1 (183 spaces) and',
  '95-rune p57 (20 spaces) exact GP30 F-transparent plants pass.');
console.log('Original maximally-spaced decoded first 180 chars:',
  preview(optimalOriginal.decoded, 180));
console.log('No coherent native LP2 prose; no LP2 key or plaintext recovered.');
console.log('The source-authenticated GP29 F exception does not rescue the',
  'hypothetical full-GP30 DIVINITY extension under ANY F bypass mask.');
