"use strict";
/**
 * Test independent all-secret GF29 word-local affine LCG keys, optionally
 * followed by a physical ciphertext-collision rewrite. Exact feasibility
 * uses the fixed English GP lexicon and original canonical rune words.
 *
 * Reproduce: node sims/lp2_word_lcg_allsecret_repair_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = value => ((value % 29) + 29) % 29;
const rune = new Map(gp.runes.map((symbol, i) => [symbol, i]));
const roman = new Map(gp.translit.map((symbol, i) => [symbol, i]));
const parsed = parseSharedCorpus();
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
const original = parsed.words.map(word =>
  [...word.runes].map(symbol => rune.get(symbol)));
assert(original.every(word => word.every(x =>
  Number.isInteger(x) && x >= 0 && x < 29)));

/** @param {string} text @returns {number[]|null} */
function encode(text) {
  const source = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < source.length;) {
    const doublet = roman.get(source.slice(i, i + 2));
    if (doublet !== undefined) {
      result.push(doublet);
      i += 2;
    } else {
      const singleton = roman.get(source[i]);
      if (singleton === undefined) return null;
      result.push(singleton);
      i++;
    }
  }
  return result;
}

/** @returns {Map<number,number[][]>} */
function dictionary() {
  const result = new Map();
  for (const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")) {
    const match = line.match(/^([a-z]+)\s+\d+$/);
    if (!match) continue;
    const gpWord = encode(match[1]);
    if (!gpWord) continue;
    const words = result.get(gpWord.length) || [];
    words.push(gpWord);
    result.set(gpWord.length, words);
  }
  return result;
}
const lexicon = dictionary();
const inverses = Array.from({ length: 29 }, (_, a) => {
  if (a === 0) return 0;
  for (let b = 1; b < 29; b++) {
    if (a * b % 29 === 1) return b;
  }
  throw Error("GF29 inverse missing");
});

/**
 * All-secret exact feasibility for K[j+1]=a*K[j]+b modulo 29.
 * For a published output C[j], the permitted K[j] values are C[j]-P[j],
 * or previous published ciphertext-P[j] if an output collision could
 * have occurred and been replaced by a different rune.
 *
 * The first three permitted keys exhaustively determine a and b, except
 * the constant-seed case where every possible a is tested.
 * @param {number[]} cipher
 * @param {number[]} plain
 * @param {number} precedingCipher
 * @param {boolean} allowRepairs
 * @returns {{a:number,b:number,k0:number}|null}
 */
function feasible(cipher, plain, precedingCipher, allowRepairs) {
  assert.equal(cipher.length, plain.length);
  assert(cipher.length >= 3);
  const options = plain.map((p, i) => {
    const exact = mod(cipher[i] - p);
    const preceding = i ? cipher[i - 1] : precedingCipher;
    if (!allowRepairs || preceding < 0 || preceding === cipher[i])
      return [exact];
    const repaired = mod(preceding - p);
    return repaired === exact ? [exact] : [exact, repaired];
  });
  for (const k0 of options[0])
    for (const k1 of options[1])
      for (const k2 of options[2]) {
        const d1 = mod(k1 - k0);
        const d2 = mod(k2 - k1);
        if (d1 === 0 && d2 !== 0) continue;
        const first = d1 === 0 ? 0 : mod(d2 * inverses[d1]);
        const last = d1 === 0 ? 28 : first;
        for (let a = first; a <= last; a++) {
          const b = mod(k1 - a * k0);
          let k = k2, compatible = true;
          for (let j = 3; j < cipher.length; j++) {
            k = mod(a * k + b);
            if (k !== options[j][0] &&
                (options[j].length === 1 || k !== options[j][1])) {
              compatible = false;
              break;
            }
          }
          if (compatible) return { a, b, k0 };
        }
      }
  return null;
}

/** @param {number} initial @returns {()=>number} */
function random(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Produce a fixed-seed English ciphertext with the complete source word
 * length sequence, independent a,b,K0 for each word, and an 81% collision
 * rewrite policy. Exactly the same unknown-key feasibility algorithm
 * evaluates this planted control.
 * @param {number[][]} layout
 */
function plant(layout) {
  const next = random(0x36a5000b);
  let previous = -1, repairs = 0;
  const plain = [], cipher = [];
  for (const word of layout) {
    const candidates = lexicon.get(word.length);
    assert(candidates && candidates.length > 0);
    const source = candidates[next() % candidates.length];
    plain.push(source);
    const a = next() % 29, b = next() % 29;
    let k = next() % 29;
    const output = [];
    for (let j = 0; j < source.length; j++) {
      if (j) k = mod(a * k + b);
      let current = mod(source[j] + k);
      if (current === previous && next() % 10000 < 8100) {
        const replacement = next() % 28;
        current = replacement >= previous ? replacement + 1 : replacement;
        repairs++;
      }
      output.push(current);
      previous = current;
    }
    cipher.push(output);
  }
  return { plain, cipher, repairs };
}

/** @param {number[][]} words @returns {number} */
function doublets(words) {
  const text = words.flat();
  let n = 0;
  for (let i = 1; i < text.length; i++)
    n += Number(text[i] === text[i - 1]);
  return n;
}

/**
 * @param {number[][]} actual
 * @param {number[][]} planted
 * @param {number[][]} source
 */
function audit(actual, planted, source) {
  const rows = [];
  for (let length = 8; length <= 14; length++) {
    const candidates = lexicon.get(length) || [];
    let count = 0, strict = 0, repaired = 0, truth = 0,
      noDictionary = 0, ambiguity = 0;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i].length !== length) continue;
      count++;
      const prev = i ? actual[i - 1].at(-1) : -1;
      const plantedPrev = i ? planted[i - 1].at(-1) : -1;
      if (feasible(planted[i], source[i], plantedPrev, true)) truth++;
      let exactHit = false, repairHit = false, plantedHits = 0;
      for (const candidate of candidates) {
        if (!exactHit && feasible(actual[i], candidate, prev, false))
          exactHit = true;
        if (!repairHit && feasible(actual[i], candidate, prev, true))
          repairHit = true;
        if (feasible(planted[i], candidate, plantedPrev, true))
          plantedHits++;
      }
      strict += Number(exactHit);
      repaired += Number(repairHit);
      noDictionary += Number(plantedHits === 0);
      ambiguity += Number(plantedHits > 1);
    }
    rows.push({
      length, originalWords: count, dictionaryEntries: candidates.length,
      originalNoRepairCompatible: strict, originalAnyRepairCompatible: repaired,
      plantedTrueSourceRecovered: truth,
      plantedNoDictionaryMatch: noDictionary,
      plantedAmbiguousDictionaryMatch: ambiguity
    });
  }
  return rows;
}

function main() {
  const planted = plant(original);
  const rows = audit(original, planted.cipher, planted.plain);
  assert.deepEqual(rows.map(r => r.originalWords), [156, 78, 52, 32, 18, 4, 3]);
  assert.equal(rows[0].originalAnyRepairCompatible, 7);
  assert(rows.slice(1).every(row =>
    row.originalNoRepairCompatible === 0 && row.originalAnyRepairCompatible === 0));
  assert(rows.every(row =>
    row.plantedTrueSourceRecovered === row.originalWords &&
    row.plantedNoDictionaryMatch === 0));
  assert.equal(planted.repairs, 355);
  assert.equal(doublets(planted.cipher), 83);
  assert.equal(doublets(original), 86);
  const result = {
    method: "All-secret GP29 per-word affine LCG and arbitrary collision repair",
    model: "K[j+1] = a*K[j]+b modulo29, a/b/K0 independent and arbitrary per word; C=P+K, optional collision-only rewrite",
    source: {
      originalRunes: 12956, originalWords: 2896,
      reference: "resources/control/english_wordfreq_textblob.txt",
      parser: "sims/lp2_word_pages.cjs"
    },
    planted: {
      seed: "0x36a5000b", words: planted.plain.length,
      repairs: planted.repairs,
      repeatedCiphertextPairs: doublets(planted.cipher),
      allLength8To14TrueWordsFeasible: true
    },
    original: { repeatedCiphertextPairs: doublets(original), rows },
    decision: "0 of 187 original words length 9..14 are compatible with any GP-English dictionary word under this LCG family, despite unrestricted independent word keys and arbitrary ciphertext collision repairs. No cipher key or unknown plaintext was recovered."
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = { encode, feasible, plant, doublets, audit, main };
