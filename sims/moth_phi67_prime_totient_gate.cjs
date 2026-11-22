"use strict";
/**
 * Test the source-observed p53/p55 moth translation (+66,+67) as
 * phi(67)=66 / prime-67 start for the authenticated p56 totient cipher.
 * Run: node sims/moth_phi67_prime_totient_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  primeTotients, trainNativeGP, languageScore
} = require("./historical_solve_path_transfer.cjs");
const {plaintextWords} = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const model = trainNativeGP(read("resources/control/emerson_essays_2944.txt"));
const mod = (x, n) => (x % n + n) % n;

function page(pageNumber) {
  const found = corpus.pages.find(p => p.page === pageNumber);
  assert.ok(found, "page exists: " + pageNumber);
  return found.indices;
}

function decode(ciphertext, pageNumbers, key, mask, pageReset) {
  const fPositions = ciphertext.flatMap((symbol, i) => symbol === 0 ? [i] : []);
  assert.ok(fPositions.length <= 20);
  const bitAt = new Int16Array(ciphertext.length).fill(-1);
  fPositions.forEach((position, bit) => { bitAt[position] = bit; });
  const plaintext = [];
  let keyIndex = 0, previousPage = -1, consumed = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    if (pageReset && pageNumbers[i] !== previousPage) keyIndex = 0;
    if (bitAt[i] >= 0 && ((mask >>> bitAt[i]) & 1)) {
      plaintext.push(0);
    } else {
      plaintext.push(mod(ciphertext[i] - key[keyIndex++] % 29, 29));
      consumed++;
    }
    previousPage = pageNumbers[i];
  }
  return {plaintext, consumed, fPositions};
}

function encryptPlant(plaintext, pageNumbers, key, skipPositions, pageReset) {
  const skips = new Set(skipPositions);
  const adjusted = plaintext.slice();
  for (const position of skipPositions) adjusted[position] = 0;
  const ciphertext = [];
  let keyIndex = 0, previousPage = -1;
  for (let i = 0; i < adjusted.length; i++) {
    if (pageReset && pageNumbers[i] !== previousPage) keyIndex = 0;
    if (skips.has(i)) {
      ciphertext.push(0);
    } else {
      let value = mod(adjusted[i] + key[keyIndex] % 29, 29);
      if (value === 0) {
        adjusted[i] = mod(adjusted[i] + 1, 29);
        value = mod(adjusted[i] + key[keyIndex] % 29, 29);
      }
      assert.notEqual(value, 0, "non-literal ciphertext F avoided in plant");
      ciphertext.push(value);
      keyIndex++;
    }
    previousPage = pageNumbers[i];
  }
  return {ciphertext, plaintext: adjusted};
}

function scan(ciphertext, pageNumbers, key, pageReset) {
  const fPositions = ciphertext.flatMap((symbol, i) => symbol === 0 ? [i] : []);
  const totalMasks = 1 << fPositions.length;
  let best = {score: -Infinity, mask: -1, plaintext: [], consumed: 0};
  for (let mask = 0; mask < totalMasks; mask++) {
    const result = decode(ciphertext, pageNumbers, key, mask, pageReset);
    const score = languageScore(result.plaintext, model);
    if (score > best.score) best = {
      score, mask, plaintext: result.plaintext, consumed: result.consumed
    };
  }
  return {
    length: ciphertext.length,
    fPositions,
    totalMasks,
    rawScore: languageScore(ciphertext, model),
    best: {
      score: best.score,
      mask: best.mask,
      consumed: best.consumed,
      preview: best.plaintext.slice(0, 80)
        .map(i => corpus.translit[i]).join("")
    }
  };
}

function run() {
  // The source-observed image displacement is (+66,+67); 67 is prime
  // and phi(67)=66. The candidate starts at that prime, one-based prime #19.
  const key67 = primeTotients(256, 19);
  assert.equal(key67[0], 66);
  const key2 = primeTotients(256, 1);
  const known56 = plaintextWords(
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
    "IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE").flat();
  const authentic56 = decode(page(56), page(56).map(() => 56),
    key2, 8, true);
  assert.deepEqual(authentic56.plaintext, known56);
  assert.equal(authentic56.fPositions.length, 5);

  const p53 = page(53), p54 = page(54), p55 = page(55);
  const blocks = {
    p53: {ciphertext: p53, pages: p53.map(() => 53), clocks: [true]},
    p54: {ciphertext: p54, pages: p54.map(() => 54), clocks: [true]},
    p55: {ciphertext: p55, pages: p55.map(() => 55), clocks: [true]},
    composite256: {
      ciphertext: [...p53, p54[0], ...p55],
      pages: [...p53.map(() => 53), 54, ...p55.map(() => 55)],
      clocks: [false, true]
    }
  };
  assert.equal(p53.length, 179);
  assert.equal(p54.length, 232);
  assert.equal(p55.length, 76);
  assert.equal(blocks.composite256.ciphertext.length, 256);
  assert.equal(p54[0], 24, "the inserted p54 dropcap is GP Ac index 24");

  const results = [];
  for (const [name, block] of Object.entries(blocks)) {
    for (const pageReset of block.clocks) {
      const result = scan(block.ciphertext, block.pages, key67, pageReset);
      results.push({
        block: name,
        clock: pageReset ? "page-reset" : "continuous",
        ...result
      });
    }
  }

  // Source-disjoint implementation plant: eight literal F positions,
  // same 256-symbol layout and both clock rules; no false nonliteral F.
  const plantSource = plaintextWords(read(
    "resources/control/emerson_essays_2944.txt")).flat().slice(0, 256);
  const composite = blocks.composite256;
  const skipPositions = composite.ciphertext.flatMap(
    (symbol, i) => symbol === 0 ? [i] : []);
  for (const pageReset of [false, true]) {
    const plant = encryptPlant(plantSource, composite.pages,
      key67, skipPositions, pageReset);
    const allLiteralMask = (1 << skipPositions.length) - 1;
    const recovered = decode(plant.ciphertext, composite.pages,
      key67, allLiteralMask, pageReset);
    assert.deepEqual(recovered.plaintext, plant.plaintext);
    assert.deepEqual(recovered.fPositions, skipPositions);
  }

  return {
    classification: "bounded negative; no LP2 plaintext or authentic key recovered",
    sourceRelation: {
      p53ToP55MothTranslationPixels: [66, 67],
      prime: 67, totient: 66,
      enlargedP54AcGpIndex: 24, enlargedP54AcPrime: 97,
      redThirteenDotStencils: 30,
      difference97Minus67: 30,
      keyRule: "subtract phi(consecutive primes) modulo 29, starting at prime 67",
      primeOrdinalOneBased: 19,
      firstKeyResidues: key67.slice(0, 12).map(x => x % 29)
    },
    authenticSolvedP56Control: {
      exactPlaintextRunes: authentic56.plaintext.length,
      trueSkipMask: 8,
      score: languageScore(known56, model)
    },
    originalResults: results,
    syntheticPlant: {
      symbols: 256, literalFPositions: skipPositions.length,
      clocks: ["continuous", "page-reset"],
      exactRecoveries: ["256/256", "256/256"]
    }
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, decode, scan};
