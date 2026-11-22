"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeMap = new Map(corp.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;
const GP_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109
];

/**
 * Preserve the repository's continuous-word parsing: page boundaries and
 * line wraps do not end words; explicit non-rune punctuation does.
 */
function parseLP2Words(raw, unsolvedPages = 55) {
  const pageSegments = raw.split("%").slice(0, unsolvedPages);
  const stream = pageSegments.join("%");
  const words = [];
  let current = "";
  let startPage = 0;
  let lastRunePage = 0;
  let page = 0;
  let runeCount = 0;

  function finish() {
    if (!current) return;
    words.push({
      runes: current,
      indices: [...current].map((r) => {
        const index = runeMap.get(r);
        assert.notEqual(index, undefined, "Unknown rune in source transcription");
        return index;
      }),
      startPage,
      endPage: lastRunePage
    });
    current = "";
  }

  for (const ch of stream) {
    if (runeMap.has(ch)) {
      if (!current) startPage = page;
      current += ch;
      lastRunePage = page;
      runeCount++;
    } else if (ch === "%") {
      page++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line wraps are not word delimiters.
    } else {
      finish();
    }
  }
  finish();
  return { words, runeCount };
}

/**
 * The manuscript's GP orthography uses single runes for ING and IO.
 * QU/V/K/Z normalization follows the repository's native English controls.
 */
const TOKENS = ["ING", "IO", ...corp.translit].sort((a, b) => b.length - a.length);
function encodeEnglish(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = TOKENS.find((t) => s.startsWith(t, i));
    if (!token) return null;
    const translit = token === "ING" ? "NG" : token === "IO" ? "IA" : token;
    const index = corp.translit.indexOf(translit);
    if (index < 0) return null;
    out.push(index);
    i += token.length;
  }
  return out;
}

function firstPrimes(count) {
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

function buildDictionary() {
  const byCode = new Map();
  const byLength = new Map();
  for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
    const match = /^([a-z]+)\s+(\d+)$/u.exec(line);
    if (!match || /q(?!u)/u.test(match[1])) continue;
    const code = encodeEnglish(match[1]);
    if (!code || code.length === 0 || code.length > 14) continue;
    const key = code.join(",");
    if (byCode.has(key)) continue;
    const item = { word: match[1], code };
    byCode.set(key, item);
    if (!byLength.has(code.length)) byLength.set(code.length, 0);
    byLength.set(code.length, byLength.get(code.length) + 1);
  }
  return { byCode, byLength };
}

/**
 * Candidate hypothesis:
 *   S = GP-prime sum (or GP ordinal sum) of the plaintext word.
 *   Start the prime stream at S (or 1 + S mod 29).
 *   At rune position j, use p_(start+j) or phi(p_(start+j)) mod 29.
 *   C[j] = P[j] +/- K[j] mod 29.
 *
 * The 64 frozen variants cover both sums, full/mod-29 starts, prime/phi
 * values, 0/1-based offsets, both signs, and p56-style F bypass on/off.
 */
const VARIANTS = [];
for (const sumType of ["prime", "ordinal"]) {
  for (const startType of ["full", "mod29"]) {
    for (const keyType of ["prime", "phi"]) {
      for (const delta of [0, 1]) {
        for (const sign of [-1, 1]) {
          for (const fMode of ["spend", "skip"]) {
            VARIANTS.push({ sumType, startType, keyType, delta, sign, fMode });
          }
        }
      }
    }
  }
}

function wordSum(code, sumType) {
  return code.reduce((sum, rune) =>
    sum + (sumType === "prime" ? GP_PRIMES[rune] : rune), 0);
}

function encryptCandidate(code, variant, primes) {
  const sum = wordSum(code, variant.sumType);
  const start = variant.startType === "full" ? sum : 1 + mod(sum);
  const cipher = [];
  let keyPosition = 0;

  for (let j = 0; j < code.length; j++) {
    const plain = code[j];
    if (variant.fMode === "skip" && plain === 0) {
      cipher.push(0);
      continue;
    }
    const primeIndex = start
      + (variant.fMode === "skip" ? keyPosition : j)
      + variant.delta; // one-based prime index
    if (primeIndex < 1 || primeIndex > primes.length) return null;
    const p = primes[primeIndex - 1];
    const key = mod(variant.keyType === "phi" ? p - 1 : p);
    cipher.push(mod(plain + variant.sign * key));
    keyPosition++;
  }
  return cipher;
}

function study() {
  const parsed = parseLP2Words(read("resources/lp2-transcription.txt"));
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);

  const dictionary = buildDictionary();
  assert.equal(dictionary.byCode.size, 28993);

  const primes = firstPrimes(1800);
  const union = new Map();
  const results = [];

  for (const variant of VARIANTS) {
    const inverse = new Map();
    for (const item of dictionary.byCode.values()) {
      const cipher = encryptCandidate(item.code, variant, primes);
      if (!cipher) continue;
      const key = cipher.join(",");
      if (!inverse.has(key)) inverse.set(key, []);
      inverse.get(key).push(item.word);
    }

    const byLength = {};
    let unique = 0;
    let length5Plus = 0;
    let length6Plus = 0;
    const examples = [];

    for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex++) {
      const original = parsed.words[wordIndex];
      const code = original.indices;
      const hits = inverse.get(code.join(",")) || [];
      const length = code.length;
      if (!byLength[length]) byLength[length] = { total: 0, matched: 0 };
      byLength[length].total++;

      if (!hits.length) continue;
      byLength[length].matched++;
      if (hits.length === 1) unique++;

      if (length >= 5) {
        length5Plus++;
        if (!union.has(wordIndex)) union.set(wordIndex, []);
        union.get(wordIndex).push({
          variant,
          candidates: hits.slice(0, 5)
        });
        if (examples.length < 10) {
          examples.push({
            wordIndex,
            startPage: original.startPage,
            physicalPage: original.startPage >= 50 ? original.startPage + 1 : original.startPage,
            length,
            ciphertext: code.map((x) => corp.translit[x]).join("."),
            candidates: hits.slice(0, 5),
            candidateCount: hits.length
          });
        }
      }
      if (length >= 6) length6Plus++;
    }

    results.push({
      ...variant,
      matchedWords: Object.values(byLength).reduce((n, x) => n + x.matched, 0),
      uniqueMatches: unique,
      length5Plus,
      length6Plus,
      byLength,
      examples
    });
  }

  results.sort((a, b) =>
    b.length6Plus - a.length6Plus
    || b.length5Plus - a.length5Plus
    || b.matchedWords - a.matchedWords
    || b.uniqueMatches - a.uniqueMatches
  );

  const unionByLength = {};
  for (const wordIndex of union.keys()) {
    const length = parsed.words[wordIndex].indices.length;
    unionByLength[length] = (unionByLength[length] || 0) + 1;
  }

  // A synthetic dictionary positive control: every tested encoder must be invertible
  // by the exact dictionary map on a real dictionary word.
  const plant = [...dictionary.byCode.values()].find((x) => x.word === "cicada")
    || [...dictionary.byCode.values()].find((x) => x.code.length >= 6);
  assert(plant, "No suitable positive-control word");
  for (const variant of VARIANTS) {
    const cipher = encryptCandidate(plant.code, variant, primes);
    assert(cipher, "Positive-control word is invalid for variant");
    const inverse = new Map();
    for (const item of dictionary.byCode.values()) {
      const c = encryptCandidate(item.code, variant, primes);
      if (!c) continue;
      const key = c.join(",");
      if (!inverse.has(key)) inverse.set(key, []);
      inverse.get(key).push(item.word);
    }
    assert(inverse.get(cipher.join(","))?.includes(plant.word));
  }

  const expectedUniformLength5Plus = [...dictionary.byLength.entries()]
    .filter(([length]) => length >= 5)
    .reduce((sum, [length, count]) => {
      const observed = parsed.words.filter((w) => w.indices.length === length).length;
      return sum + observed * count / (29 ** length);
    }, 0);

  return {
    model: "plaintext-word GP sum -> prime-stream index -> prime or prime-totient additive key",
    source: {
      printedWords: parsed.words.length,
      runes: parsed.runeCount,
      dictionaryUniqueGPEncodings: dictionary.byCode.size,
      originalWordsLength5Plus: parsed.words.filter((w) => w.indices.length >= 5).length
    },
    testedVariants: VARIANTS.length,
    variants: results,
    union: {
      distinctOriginalWordPositionsMatchedAtLength5Plus: union.size,
      byLength: unionByLength,
      anySixPlus: [...union.keys()]
        .filter((i) => parsed.words[i].indices.length >= 6)
        .map((i) => i)
    },
    expectedUniformLength5PlusMatchesForOneVariant: expectedUniformLength5Plus,
    positiveControl: {
      word: plant.word,
      encodedLength: plant.code.length,
      variantsRecovered: VARIANTS.length
    },
    conclusion: "No six-rune-or-longer original printed word is a dictionary preimage under any of the 64 frozen variants."
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(study(), null, 2) + "\n");
}

module.exports = { parseLP2Words, encodeEnglish, study };
