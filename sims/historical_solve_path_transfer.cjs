"use strict";
/**
 * Historical Cicada solve-path handoff and fixed original-LP2 tests.
 *
 * Inputs and operations are declared before inspecting LP2 output:
 * - The real 2014 three-share byte XOR and historically solved 14-column permutation.
 * - The exact solved p56 prime-totient schedule with every observable-F skip mask,
 *   exhaustively transferred to original physical LP2 page 0.
 * - A literal, historical-style XOR of the three archived 256-byte onion strings
 *   and the printed 256-byte grid (including its separately audited corrections).
 *
 * Evidence class: historical regressions and bounded original-source negatives;
 * any best-fit unsolved-page language score is exploratory, never plaintext proof.
 * Run: node sims/historical_solve_path_transfer.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
/** @param {string} hex @param {number} bytes */
function unhex(hex, bytes) {
  assert.match(hex, /^[0-9a-f]+$/i);
  const output = Buffer.from(hex, "hex");
  assert.equal(output.length, bytes);
  return output;
}
/** @param {Buffer | number[]} bytes */
function sha256(bytes) {
  return crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}
/**
 * @template T
 * @param {T[]} values
 * @param {number[]} order
 * @returns {T[]}
 */
function rowPermute(values, order) {
  const out = values.slice();
  for (let start = 0; start + order.length <= values.length; start += order.length) {
    for (let i = 0; i < order.length; i++) out[start + i] = values[start + order[i]];
  }
  return out;
}
const HISTORICAL_ORDER = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
const HISTORICAL_70 = "IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ";
const EXPECTED_70 = "GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
const PAGE56_ENGLISH = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";

/** @returns {object} */
function authentic2014() {
  const reference = JSON.parse(read("resources/cicada2014-outguess-hex.json"));
  assert.equal(reference.sources.length, 3);
  const shares = reference.sources.map(source => unhex(source.hex, 991));
  const combined = Buffer.alloc(991);
  for (let i = 0; i < 991; i++) combined[i] = shares[0][i] ^ shares[1][i] ^ shares[2][i];
  const signed = combined.toString("utf8");
  assert.ok(signed.startsWith(reference.expectedReconstruction.prefix));
  assert.ok(signed.replace(/\s+/g, " ").includes(reference.expectedReconstruction.bodyCode));
  assert.equal(HISTORICAL_70.length, 70);
  assert.equal(HISTORICAL_ORDER.length, 14);
  assert.deepEqual([...HISTORICAL_ORDER].sort((a, b) => a - b),
    Array.from({ length: 14 }, (_, i) => i));
  assert.equal(reference.expectedReconstruction.bodyCode.replace(/\s+/g, ""), HISTORICAL_70);
  const decoded = rowPermute([...HISTORICAL_70], HISTORICAL_ORDER).join("");
  assert.equal(decoded, EXPECTED_70);
  const reverse = HISTORICAL_ORDER.map((_, i) => HISTORICAL_ORDER.indexOf(i));
  assert.equal(rowPermute([...decoded], reverse).join(""), HISTORICAL_70);
  return {
    bytes: 991,
    shareCount: 3,
    signedSHA256: sha256(combined),
    columnWidth: 14,
    rows: 5,
    order: HISTORICAL_ORDER,
    original70: HISTORICAL_70,
    decoded70: decoded,
    recoveredHistoricalAddress: "fv7lyucmeozzd5j4.onion"
  };
}

/** @param {string} referenceText */
function trainNativeGP(referenceText) {
  const symbols = plaintextWords(referenceText).flat();
  const n = 29;
  const unigramCounts = new Uint32Array(n);
  const bigramCounts = new Uint32Array(n * n);
  const trigramCounts = new Uint32Array(n * n * n);
  for (let i = 0; i < symbols.length; i++) {
    unigramCounts[symbols[i]]++;
    if (i > 0) bigramCounts[symbols[i - 1] * n + symbols[i]]++;
    if (i > 1) trigramCounts[(symbols[i - 2] * n + symbols[i - 1]) * n + symbols[i]]++;
  }
  const unigram = new Float64Array(n);
  const bigram = new Float64Array(n * n);
  const trigram = new Float64Array(n * n * n);
  for (let c = 0; c < n; c++)
    unigram[c] = Math.log((unigramCounts[c] + 1) / (symbols.length + n));
  for (let a = 0; a < n; a++) for (let c = 0; c < n; c++) {
    const index = a * n + c;
    bigram[index] = Math.log(
      (bigramCounts[index] + 12 * Math.exp(unigram[c])) / (unigramCounts[a] + 12));
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
    const index = (a * n + b) * n + c;
    trigram[index] = Math.log(
      (trigramCounts[index] + 9 * Math.exp(bigram[b * n + c])) /
      (bigramCounts[a * n + b] + 9));
  }
  return { symbolCount: symbols.length, unigram, bigram, trigram };
}
/** @param {number[]} symbols @param {ReturnType<typeof trainNativeGP>} model */
function languageScore(symbols, model) {
  let sum = model.unigram[symbols[0]] +
    model.bigram[symbols[0] * 29 + symbols[1]];
  for (let i = 2; i < symbols.length; i++)
    sum += model.trigram[(symbols[i - 2] * 29 + symbols[i - 1]) * 29 + symbols[i]];
  return sum / symbols.length;
}
/** @param {number} count */
function primeTotients(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate++) {
    let prime = true;
    for (let i = 0; i < primes.length; i++) {
      if (primes[i] * primes[i] > candidate) break;
      if (candidate % primes[i] === 0) { prime = false; break; }
    }
    if (prime) primes.push(candidate);
  }
  return primes.map(value => value - 1);
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} FPositions
 * @param {number} mask
 * @param {number[]} keys
 */
function decodeFMask(ciphertext, FPositions, mask, keys) {
  const bitAt = new Int16Array(ciphertext.length).fill(-1);
  FPositions.forEach((position, bit) => { bitAt[position] = bit; });
  const plaintext = [];
  let keyIndex = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    if (bitAt[i] >= 0 && ((mask >>> bitAt[i]) & 1)) {
      assert.equal(c, 0);
      plaintext.push(0);
    } else {
      plaintext.push((c - keys[keyIndex++] % 29 + 29) % 29);
    }
  }
  return { plaintext, consumed: keyIndex };
}
/**
 * @param {number[]} ciphertext
 * @param {number[]} keys
 * @param {ReturnType<typeof trainNativeGP>} model
 * @param {number[] | null} knownPlain
 */
function exhaustLiteralF(ciphertext, keys, model, knownPlain = null) {
  const positions = ciphertext.flatMap((symbol, i) => symbol === 0 ? [i] : []);
  assert.ok(positions.length <= 20);
  const totalMasks = 1 << positions.length;
  const top = { score: -Infinity, mask: -1, plaintext: [], consumed: -1 };
  let exactMatches = 0;
  let correctMask = null;
  let correctScore = null;
  const ranking = [];
  for (let mask = 0; mask < totalMasks; mask++) {
    const result = decodeFMask(ciphertext, positions, mask, keys);
    const score = languageScore(result.plaintext, model);
    if (score > top.score) Object.assign(top, {
      score, mask, plaintext: result.plaintext, consumed: result.consumed
    });
    if (knownPlain && result.plaintext.every((v, i) => v === knownPlain[i])) {
      exactMatches++;
      correctMask = mask;
      correctScore = score;
    }
    if (knownPlain) ranking.push({ mask, score });
  }
  ranking.sort((a, b) => b.score - a.score);
  return {
    ciphertextRunes: ciphertext.length,
    positions,
    totalMasks,
    best: top,
    exactMatches,
    correctMask,
    correctScore,
    rankOfKnownPlain: knownPlain ? ranking.findIndex(x => x.mask === correctMask) + 1 : null
  };
}

/** @param {number[]} bytes @returns {number} */
function printableCount(bytes) {
  return bytes.filter(v => (v >= 32 && v <= 126) || v === 9 || v === 10 || v === 13).length;
}

/** @returns {object} */
function historical256Xor() {
  const source = JSON.parse(read("resources/cicada-hiddenservice-256-candidates.json"));
  const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
  const others = source.sourceServices.map(item => unhex(item.hex, 256));
  assert.equal(others.length, 3);
  assert.equal(grid.bytes.length, 256);
  const canonical = Uint8Array.from(grid.bytes);
  const audited = Uint8Array.from(canonical);
  const corrections = [[45, 107, 81], [50, 47, 21], [165, 18, 47],
    [172, 148, 174], [246, 198, 224]];
  for (const [index, before, after] of corrections) {
    assert.equal(audited[index], before);
    audited[index] = after;
  }
  let maxPrintable = 0;
  let maximizer = null;
  let pgpMarkerHits = 0;
  let tested = 0;
  const allFour = [];
  for (const [name, fourth] of [["canonical", canonical], ["audited", audited]]) {
    const arrays = [...others, fourth];
    for (let mask = name === "canonical" ? 1 : 8; mask <= 15; mask++) {
      const data = Buffer.alloc(256);
      for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 4; j++) if ((mask >>> j) & 1) data[i] ^= arrays[j][i];
      }
      const printable = printableCount([...data]);
      if (printable > maxPrintable) { maxPrintable = printable; maximizer = { name, mask }; }
      if (data.includes(Buffer.from("-----BEGIN PGP")) ||
          data.includes(Buffer.from("LS0tLS1CRUdJTiBQR1A"))) pgpMarkerHits++;
      if (mask === 15) allFour.push({ name, printable, sha256: sha256(data) });
      tested++;
    }
  }
  assert.equal(tested, 23);
  assert.equal(pgpMarkerHits, 0);
  return {testedDistinctAlignedSubsets: tested, maxPrintableOf256: maxPrintable,
    maximizer, pgpMarkerHits, allFour,
    note: "Three archived hidden-service 256-byte strings have unverified original provenance."};
}

/** @returns {object} */
function run() {
  const reference = authentic2014();
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const p0 = corpus.pages.find(item => item.page === 0).indices;
  const p56 = corpus.pages.find(item => item.page === 56).indices;
  assert.equal(p0.length, 262);
  assert.equal(p56.length, 85);
  const derived = rowPermute(p0, HISTORICAL_ORDER);
  assert.equal(derived.length, 262);
  assert.deepEqual(rowPermute(derived, HISTORICAL_ORDER.map(
    (_, i) => HISTORICAL_ORDER.indexOf(i))), p0);
  const key = primeTotients(263);
  const emersonModel = trainNativeGP(read("resources/control/emerson_essays_2944.txt"));
  const known56 = plaintextWords(PAGE56_ENGLISH).flat();
  assert.equal(known56.length, 85);
  const solved = exhaustLiteralF(p56, key, emersonModel, known56);
  const sourceF = solved.positions;
  assert.deepEqual(sourceF, [35, 47, 51, 56, 74]);
  assert.equal((solved.correctMask & (1 << 3)) !== 0, true);
  assert.equal(solved.correctMask, 8);
  assert.ok(solved.exactMatches >= 1);
  const unsolved = exhaustLiteralF(p0, key, emersonModel);
  assert.equal(unsolved.positions.length, 14);
  assert.equal(unsolved.totalMasks, 16384);
  const p0Best = unsolved.best;
  return {
    class: "Historical solved controls and frozen original LP2 probes, no key or plaintext recovered",
    genuine2014: reference,
    historicalPermutationOnOriginalP0: {
      page: 0, inputRunes: 262, complete14GlyphBlocks: 18, unchangedTail: 10,
      originalSHA256: sha256(p0),
      reorderedSHA256: sha256(derived),
      reorderedPreview56: derived.slice(0, 56).map(i => corpus.translit[i]).join(""),
      preservedUnigramHistogram: corpus.runes.every((_, index) =>
        p0.filter(v => v === index).length === derived.filter(v => v === index).length)
    },
    authenticatedPrimeTotientTransfer: {
      model: "prime_n - 1 modulo29, page-reset, subset of visible F treated as literal and nonconsuming",
      referenceText: "2014 Emerson Self-Reliance and Other Essays",
      trainedGPSymbols: emersonModel.symbolCount,
      knownSolvedP56: {
        ciphertextFPositions: sourceF,
        totalMasks: solved.totalMasks,
        exactEnglishMatches: solved.exactMatches,
        trueMask: solved.correctMask,
        trueScorePerRune: solved.correctScore,
        rankOfTrueMaskUnderIndependentModel: solved.rankOfKnownPlain,
        bestScorePerRune: solved.best.score
      },
      originalUnsolvedP0: {
        ciphertextFPositions: unsolved.positions,
        totalMasks: unsolved.totalMasks,
        bestPostselectedSkipMask: p0Best.mask,
        bestScorePerRune: p0Best.score,
        bestPreview80: p0Best.plaintext.slice(0, 80).map(i => corpus.translit[i]).join(""),
        bestConsumedPrimes: p0Best.consumed
      }
    },
    direct256HistoricalXor: historical256Xor()
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run, rowPermute, decodeFMask, exhaustLiteralF };
