"use strict";

/**
 * Historic 2014 "Let the text guide you" onion-address recovery and LP2 p55
 * terminal-page key transfer. Exact historical positive control, finite
 * original-ciphertext negative. Run: node sims/historical_text_guide_terminal_vigenere_sft.cjs
 *
 * Historical sources:
 * https://github.com/pnotisdev/cicada3301/blob/main/results/outguess/payload_03.txt
 * https://connortumbleson.com/2024/02/05/the-cicada-3301-mystery-puzzle-3-solve-part-2/
 * LP2 inputs: local repository's curated original-transcription resources.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const controlText = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
const RUNES = corpus.runes;
const TRANSLIT = corpus.translit;
const sorted = TRANSLIT.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const runeIndex = new Map(RUNES.map((r, i) => [r, i]));

/**
 * The historical reading permits V/U, K/C and similar GP spelling variants.
 * Greedy longest GP digraphs form a fixed reproducible language reference.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const values = [];
  const words = text.toUpperCase().replace(/V/g, "U")
    .replace(/K/g, "C").replace(/[^A-Z ]/g, " ").split(/\s+/u);
  for (const word of words) {
    for (let k = 0; k < word.length;) {
      const found = sorted.find(x => word.startsWith(x.s, k));
      if (!found) { k++; continue; }
      values.push(found.i);
      k += found.s.length;
    }
  }
  return values;
}

/**
 * Standard additive GP29 Vigenere inverse. Digits/spaces in the original
 * source remain literal and consume no key steps.
 * @param {string} runic
 * @param {number[]} key
 * @returns {string}
 */
function historicalOnionInverse(runic, key) {
  let j = 0;
  return [...runic].map(glyph => {
    if (!runeIndex.has(glyph)) return glyph === " " ? "." : glyph;
    return TRANSLIT[(runeIndex.get(glyph) - key[j++ % key.length] + 29) % 29];
  }).join("");
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const values = [];
  for (let n = 2; values.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) values.push(n);
  }
  return values;
}

/** @param {number[]} ciphertext @returns {number[]} */
function solvedP56(ciphertext) {
  const p = primes(90);
  let keyPosition = 0;
  return ciphertext.map((c, i) =>
    i === 56 ? c : (c - (p[keyPosition++] - 1) % 29 + 29) % 29);
}

/** @param {number[]} source @returns {string} */
function printGP(source) {
  return source.map(i => TRANSLIT[i]).join("");
}

/**
 * Original LP2 page 55 inverse with any of its three literal-F interruptions.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} mask
 * @returns {number[]}
 */
function decodeP55(cipher, key, mask) {
  let step = 0;
  const fsAt = [15, 25, 41];
  return cipher.map((v, i) => {
    const which = fsAt.indexOf(i);
    if (which >= 0 && (mask & (1 << which))) return 0;
    return (v - key[step++ % key.length] + 29) % 29;
  });
}

/**
 * Unsophisticated predeclared smoothed GP trigram reference; the gate
 * relies on readability and comparison to a genuine solved-page control,
 * not a fine-grained score threshold or an optimized synthetic null.
 * @param {number[]} source
 */
function trigramScorer(source) {
  const bi = new Map(), tri = new Map();
  for (let i = 2; i < source.length; i++) {
    const b = source[i - 2] * 29 + source[i - 1], t = b * 29 + source[i];
    bi.set(b, (bi.get(b) || 0) + 1);
    tri.set(t, (tri.get(t) || 0) + 1);
  }
  /** @param {number[]} text */
  return text => {
    let log = 0;
    for (let i = 2; i < text.length; i++) {
      const b = text[i - 2] * 29 + text[i - 1];
      log += Math.log((1 + (tri.get(b * 29 + text[i]) || 0)) /
        (29 + (bi.get(b) || 0)));
    }
    return log / (text.length - 2);
  };
}

function main() {
  const onion = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  const priorSolvedText = encodeGP("WELCOME PILGRIM TO THE GREAT");
  const onionOut = historicalOnionInverse(onion, priorSolvedText);
  assert.equal(onionOut, "AUOWYFGL5LCSFJ3.NONIAN");
  // U/V, C/K, S/Z and IA/IO readings yield the historically known onion4
  // address avowyfgl5lkzfj3n.onion. This is an earlier SOLVED clue.
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  const p56cipher = corpus.pages.find(p => p.page === 56).indices;
  const p57 = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(p55.length, 76);
  assert.deepEqual(p55.flatMap((c, i) => c === 0 ? [i] : []), [15, 25, 41]);
  const p56 = solvedP56(p56cipher);
  assert.ok(printGP(p56).startsWith("ANENDWITHINTHEDEEPWEBTH"));
  assert.ok(printGP(p57).startsWith("PARABLELICETHEINSTART"));
  const keys = {
    p56_first76: p56.slice(0, 76),
    p56_last76: p56.slice(-76),
    p57_first76: p57.slice(0, 76),
    p57_last76: p57.slice(-76),
    combined_reverse76: p56.concat(p57).slice().reverse().slice(0, 76),
    an_end_within: encodeGP("AN END WITHIN THE DEEP WEB"),
    the_deep_end: encodeGP("THE DEEP END")
  };
  const score = trigramScorer(encodeGP(controlText.replace(/^#.*$/gm, "")));
  const candidates = [];
  for (const [keyName, key] of Object.entries(keys)) {
    for (let skipMask = 0; skipMask < 8; skipMask++) {
      const plain = decodeP55(p55, key, skipMask);
      assert.deepEqual(plain.map((p, i) =>
        [15,25,41].some((at, b) => at === i && (skipMask & (1 << b)))
          ? p : (p + key[(i - [15,25,41].filter((at,b) =>
              at < i && (skipMask & (1 << b))).length) % key.length]) % 29),
      p55); // Full reversible original-ciphertext assertion.
      candidates.push({ key: keyName, skipMask,
        score: score(plain), preview: printGP(plain).slice(0, 90) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  assert.equal(candidates.length, 56);
  assert.equal(candidates[0].key, "the_deep_end");
  assert.equal(candidates[0].skipMask, 0);
  assert.ok(Math.abs(candidates[0].score - (-3.3859900149695323)) < 1e-8);
  assert.ok(Math.abs(score(p55) - (-3.4018113590540926)) < 1e-8);
  assert.ok(Math.abs(score(p56) - (-2.4361899127543354)) < 1e-8);
  console.log(JSON.stringify({
    historicalSourceOnion: onionOut,
    keyFamilies: Object.keys(keys),
    tested: candidates.length,
    p55CipherScore: score(p55),
    knownP56PlainScore: score(p56),
    topCandidates: candidates.slice(0, 7),
    recoveredUnknownPlaintext: false
  }, null, 2));
}
if (require.main === module) main();
module.exports = { main, encodeGP, historicalOnionInverse, decodeP55 };
