"use strict";
/**
 * Authentic Liber Primus decryption regression, not a synthetic
 * planted-cipher test. Verifies published English against the
 * repository's original canonical rune transcriptions.
 *
 * Historically documented mechanisms:
 *   LP1 segment 0: invert GP index (p=28-c)
 *   LP1 segment 1: Vigenere "DIVINITY" (skip literal F interrupters)
 *   LP1 segment 3: invert GP then add 3
 *   LP1 segment 5: Vigenere "FIRFUMFERENFE" (skip literal F)
 *   LP2 page 56: subtract phi(consecutive primes) (skip literal F)
 *
 * Expected English is independent literal text, re-encoded using
 * GP transliteration, including the single-rune "ING" spelling.
 * Segments 1,3,5 and page 56 compare verified prefixes; segment 0
 * checks all 45 words.
 *
 * Sources: Wulfic/Cicada3301-Liber_Primus/tools/lpcore/solved.py
 * and data/canonical/liber_primus_translation.txt (2026-11-10).
 * Run: node sims/authentic_decryption_regression.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const lp1 = fs.readFileSync(path.join(ROOT, "resources/transcriptions/lp1_wulfic_canonical.txt"), "utf8");
const master = fs.readFileSync(path.join(ROOT, "resources/transcriptions/liber_primus_master.txt"), "utf8");
const RUNE_MAP = new Map(corpus.runes.map((rune, index) => [rune, index]));
const GP_MAP = new Map(corpus.translit.map((label, index) => [label, index]));
// The "ING" rune is historically transliterated as "NG" in many datasets.
GP_MAP.set("ING", 21);
const F_INDEX = 0;
const N = 29;

/** @param {string} source */
function ciphertextWords(source) {
  return source.split(/[-.&$§]/)
    .map(part => [...part].filter(ch => RUNE_MAP.has(ch)).map(ch => RUNE_MAP.get(ch)))
    .filter(word => word.length > 0);
}

/** @param {string} plaintext */
function plaintextWords(plaintext) {
  const tokens = plaintext.toUpperCase().match(/[A-Z]+/g) || [];
  return tokens.map(token => {
    const source = token.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    const result = [];
    for (let i = 0; i < source.length;) {
      let length = 0;
      for (const n of [3, 2, 1]) {
        if (source.slice(i, i + n).length === n && GP_MAP.has(source.slice(i, i + n))) {
          length = n;
          result.push(GP_MAP.get(source.slice(i, i + n)));
          i += n;
          break;
        }
      }
      assert.ok(length, "unknown GP phoneme in " + token + " at " + i);
    }
    return result;
  });
}

/** @returns {() => number} */
function primeTotient() {
  let candidate = 2;
  return () => {
    for (;;) {
      const n = candidate++;
      let prime = true;
      for (let factor = 2; factor * factor <= n; factor++) {
        if (n % factor === 0) { prime = false; break; }
      }
      if (prime) return n - 1;
    }
  };
}

/**
 * @param {number[]} ciphertext
 * @param {"invert"|"invert3"|"vigenere"|"totient"} method
 * @param {number[]} key
 * @param {Set<number>} interrupterPositions
 * @returns {{plaintext:number[], consumed:number}}
 */
function decipher(ciphertext, method, key = [], interrupterPositions = new Set()) {
  const result = [];
  let consumed = 0;
  const nextTotient = primeTotient();
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    if (method === "invert") {
      result.push(28 - c);
    } else if (method === "invert3") {
      result.push((31 - c) % N);
    } else if (interrupterPositions.has(i)) {
      assert.equal(c, F_INDEX, "plaintext F interrupter must survive visibly");
      result.push(c);
    } else {
      const k = method === "totient" ? nextTotient() : key[consumed % key.length];
      result.push((c - k % N + N) % N);
      consumed++;
    }
  }
  return { plaintext: result, consumed };
}

const VECTORS = [
  {
    section: "LP1 segment 0", method: "invert", segment: 0,
    English: "A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH DO NOT EDIT OR CHANGE THIS BOOK OR THE MESSAGE CONTAINED WITHIN EITHER THE WORDS OR THEIR NUMBERS FOR ALL IS SACRED",
    fullSection: true
  },
  {
    section: "LP1 segment 1", method: "vigenere", segment: 1,
    key: "DIVINITY",
    English: "WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE"
  },
  {
    section: "LP1 segment 3", method: "invert3", segment: 3,
    English: "A KOAN A MAN DECIDED TO GO AND STUDY WITH A MASTER HE WENT TO THE DOOR OF THE MASTER WHO ARE YOU WHO WISHES TO STUDY HERE ASKED THE MASTER"
  },
  {
    section: "LP1 segment 5", method: "vigenere", segment: 5,
    key: "FIRFUMFERENFE",
    English: "A KOAN DURING A LESSON THE MASTER EXPLAINED THE I THE I IS THE VOICE OF THE CIRCUMFERENCE HE SAID WHEN ASKED BY A STUDENT TO EXPLAIN WHAT THAT MEANT"
  },
  {
    section: "LP2 page 56", method: "totient", page: 56,
    English: "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO"
  }
];

/** @returns {object[]} */
function run() {
  const sectionParts = lp1.split("$");
  const lp2Pages = master.slice(master.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ")).split("%");
  const report = [];
  for (const vector of VECTORS) {
    const source = vector.page === undefined ? sectionParts[vector.segment] : lp2Pages[vector.page];
    const allCipherWords = ciphertextWords(source);
    const expected = plaintextWords(vector.English);
    const usedWords = allCipherWords.slice(0, expected.length);
    assert.equal(usedWords.length, expected.length, vector.section + ": word count mismatch");
    expected.forEach((word, i) => assert.equal(usedWords[i].length, word.length,
      vector.section + ": GP rune count mismatch at word " + i));
    if (vector.fullSection) assert.equal(allCipherWords.length, expected.length);

    const cipher = usedWords.flat();
    const plain = expected.flat();
    const skips = new Set(plain.flatMap((symbol, index) => symbol === F_INDEX ? [index] : []));
    const key = vector.key ? plaintextWords(vector.key).flat() : [];
    const output = decipher(cipher, vector.method, key, skips);

    assert.deepEqual(output.plaintext, plain, vector.section + ": known genuine plaintext");
    const wrong = vector.method === "vigenere"
      ? decipher(cipher, vector.method, key.map((x, i) => (x + Number(i === 0)) % N), skips).plaintext
      : vector.method === "totient"
        ? decipher(cipher, "vigenere", [1], skips).plaintext
        : vector.method === "invert"
          ? decipher(cipher, "invert3", [], skips).plaintext
          : decipher(cipher, "invert", [], skips).plaintext;
    assert.notDeepEqual(wrong, plain, vector.section + ": negative wrong-key or wrong-transform control");
    const cipherSha = crypto.createHash("sha256").update(Buffer.from(cipher)).digest("hex");
    report.push({
      section: vector.section,
      method: vector.method,
      key: vector.key || null,
      words: usedWords.length,
      recoveredRunes: plain.length,
      FInterrupters: ["vigenere", "totient"].includes(vector.method) ? skips.size : 0,
      keySymbolsConsumed: output.consumed,
      cipherGPIndexSHA256: cipherSha,
      exactEnglishMatch: true,
      wrongMethodRejected: true
    });
  }
  assert.equal(report[0].words, 45);
  assert.equal(report[0].recoveredRunes, 184);
  assert.equal(report[1].recoveredRunes, 116);
  assert.equal(report[2].recoveredRunes, 104);
  assert.equal(report[3].recoveredRunes, 110);
  assert.equal(report[4].recoveredRunes, 45);
  return report;
}

if (require.main === module) console.log(JSON.stringify({ result: "PASS", authenticCiphertextVectors: run() }, null, 2));
module.exports = { ciphertextWords, plaintextWords, primeTotient, decipher, run };
