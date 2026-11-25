"use strict";

/*
 * Source-frozen test of the p24 upper/lower half-turn repeated-plaintext
 * hypothesis under two independent period-8 additive GP29 keys and the
 * authentic transparent-plaintext-F clock.
 *
 * Run from the repository root:
 *   node sims/lp2_p24_halfturn_repeated_plaintext_q8_sft.cjs
 *
 * The geometric split is inherited from the independently checked p24
 * artwork registration: top six lines forward, bottom six lines reversed.
 * This script does not fit or search a split, orientation, offset or key.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(readText("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;

const imagePath = path.join(ROOT, "resources", "liber-primus", "41.jpg");
const imageBytes = fs.readFileSync(imagePath);
const imageSha256 = crypto.createHash("sha256").update(imageBytes).digest("hex");
assert.equal(
  imageSha256,
  "62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80",
  "original physical p24 JPEG"
);

function pageIndices(page) {
  const found = corpus.pages.find((x) => x.page === page);
  assert.ok(found, "missing corpus page " + page);
  return found.indices.slice();
}

function extractPhysicalLines(page) {
  const target = pageIndices(page).map((i) => corpus.runes[i]).join("");
  const rawChars = Array.from(readText("resources/liber-primus/lp2-transcription.txt"));
  const sourceRunes = [];
  const sourcePositions = [];
  for (let i = 0; i < rawChars.length; i++) {
    if (runeIndex.has(rawChars[i])) {
      sourceRunes.push(rawChars[i]);
      sourcePositions.push(i);
    }
  }
  const sourceRuneText = sourceRunes.join("");
  const start = sourceRuneText.indexOf(target);
  assert.ok(start >= 0, "page sequence missing from source transcription");
  assert.equal(
    sourceRuneText.indexOf(target, start + 1),
    -1,
    "page sequence unexpectedly repeats in source transcription"
  );
  const rawStart = sourcePositions[start];
  const rawEnd = sourcePositions[start + target.length - 1] + 1;
  const chunk = rawChars.slice(rawStart, rawEnd).join("");
  return chunk.split(/\r?\n/).filter((line) =>
    Array.from(line).some((ch) => runeIndex.has(ch))
  );
}

const p24 = pageIndices(24);
assert.equal(p24.length, 270, "physical p24 rune count");

const lines = extractPhysicalLines(24);
assert.equal(lines.length, 12, "physical p24 line count");
const lineCounts = lines.map((line) =>
  Array.from(line).filter((ch) => runeIndex.has(ch)).length
);
assert.deepEqual(
  lineCounts,
  [22, 24, 21, 24, 23, 21, 22, 23, 23, 22, 22, 23],
  "original p24 physical line rune counts"
);
const split = lineCounts.slice(0, 6).reduce((a, b) => a + b, 0);
assert.equal(split, 135, "six-line upper half");
assert.equal(p24.length - split, 135, "six-line lower half");

// Preserve the original line-6/7 word carry; the geometric split is not
// silently promoted to a printed word boundary.
const left = lines[5].replace(/\/+$/, "");
const right = lines[6].replace(/\/+$/, "");
assert.equal(/[-.]$/.test(left), false, "line 6 unexpectedly ends a word");
const leftFragment = left.split(/[-.]/).filter(Boolean).pop();
const rightFragment = right.split(/[-.]/).filter(Boolean)[0];
const boundaryCarry = {
  leftFragment,
  rightFragment,
  joinedPrintedWord: leftFragment + rightFragment,
};
assert.deepEqual(boundaryCarry, {
  leftFragment: "ᛈᛟ",
  rightFragment: "ᚠ",
  joinedPrintedWord: "ᛈᛟᚠ",
});

const firstHalf = p24.slice(0, split);
const reversedSecondHalf = p24.slice(split).reverse();
assert.equal(firstHalf.length, 135);
assert.equal(reversedSecondHalf.length, 135);

// If the two halves are the same plaintext and plaintext F is transparent,
// an F hold is possible only where both ciphertexts are F. A ciphertext F
// may also be an encrypted non-F, so each common-F position is optional.
function enumerateSamePlaintextQ8(cipherA, cipherB) {
  assert.equal(cipherA.length, cipherB.length);
  const commonFPositions = [];
  for (let i = 0; i < cipherA.length; i++) {
    if (cipherA[i] === 0 && cipherB[i] === 0) commonFPositions.push(i);
  }
  assert.ok(commonFPositions.length <= 20, "refuse exponential mask explosion");

  const holdMaskCount = 2 ** commonFPositions.length;
  const valid = [];
  let attempted = 0;

  for (let bits = 0; bits < holdMaskCount; bits++) {
    const heldPositions = [];
    const held = new Set();
    for (let j = 0; j < commonFPositions.length; j++) {
      if (bits & (1 << j)) {
        heldPositions.push(commonFPositions[j]);
        held.add(commonFPositions[j]);
      }
    }

    for (let phaseAStart = 0; phaseAStart < 8; phaseAStart++) {
      for (let phaseBStart = 0; phaseBStart < 8; phaseBStart++) {
        attempted++;
        let consumed = 0;
        const differenceByPhaseA = Array(8).fill(null);
        const excludedKeyAValues = Array.from({ length: 8 }, () => new Set());
        let possible = true;

        for (let i = 0; i < cipherA.length; i++) {
          if (held.has(i)) {
            if (cipherA[i] !== 0 || cipherB[i] !== 0) {
              possible = false;
              break;
            }
            continue;
          }

          const phaseA = (phaseAStart + consumed) % 8;
          const phaseB = (phaseBStart + consumed) % 8;
          const difference = mod29(cipherB[i] - cipherA[i]);

          // The two phase indices advance together because the plaintext
          // and its transparent-F positions are identical in both streams.
          // For a fixed ordered phase pair, C_B-C_A must be constant.
          assert.equal(((phaseB - phaseA) % 8 + 8) % 8, ((phaseBStart - phaseAStart) % 8 + 8) % 8);
          if (
            differenceByPhaseA[phaseA] !== null &&
            differenceByPhaseA[phaseA] !== difference
          ) {
            possible = false;
            break;
          }
          differenceByPhaseA[phaseA] = difference;

          // A non-held plaintext symbol must not be F. Therefore K_A at
          // this phase cannot equal C_A. This is the exact residual key
          // domain check; K_B is then fixed by the phasewise difference.
          excludedKeyAValues[phaseA].add(cipherA[i]);
          consumed++;
        }

        if (!possible) continue;
        const keyDomainSizes = excludedKeyAValues.map((s) => 29 - s.size);
        if (keyDomainSizes.some((n) => n === 0)) continue;

        valid.push({
          heldPositions,
          phaseAStart,
          phaseBStart,
          consumed,
          differenceByPhaseA,
          keyDomainSizes,
        });
      }
    }
  }

  return {
    commonFPositions,
    holdMaskCount,
    phasePairs: 64,
    attempted,
    validConfigurations: valid.length,
    valid,
  };
}

const original = enumerateSamePlaintextQ8(firstHalf, reversedSecondHalf);
assert.deepEqual(original.commonFPositions, [108]);
assert.equal(original.holdMaskCount, 2);
assert.equal(original.attempted, 128);
assert.equal(original.validConfigurations, 0);

// A compact certificate explains the exhaustive rejection. No common F
// can be held in offsets 0..7, so positions 0 and 8 use the same ordered
// pair of q8 key phases for every possible pair of starting phases.
assert.equal(
  original.commonFPositions.filter((i) => i < 8).length,
  0,
  "no possible transparent-F hold before the eighth advance"
);
const certificate = {
  position0: {
    firstHalf: firstHalf[0],
    reversedSecondHalf: reversedSecondHalf[0],
    difference: mod29(reversedSecondHalf[0] - firstHalf[0]),
  },
  position8: {
    firstHalf: firstHalf[8],
    reversedSecondHalf: reversedSecondHalf[8],
    difference: mod29(reversedSecondHalf[8] - firstHalf[8]),
  },
};
assert.deepEqual(certificate.position0, {
  firstHalf: 23,
  reversedSecondHalf: 10,
  difference: 16,
});
assert.deepEqual(certificate.position8, {
  firstHalf: 8,
  reversedSecondHalf: 26,
  difference: 18,
});
assert.notEqual(
  certificate.position0.difference,
  certificate.position8.difference,
  "same q8 phase pair must have equal ciphertext difference"
);

function encryptTransparentF(plain, key, startPhase) {
  let consumed = 0;
  let holds = 0;
  const cipher = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      holds++;
    } else {
      cipher.push(mod29(p + key[(startPhase + consumed) % 8]));
      consumed++;
    }
  }
  return { cipher, consumed, holds };
}

const solved56 = corpus.pages.find((x) => x.page === 56);
const solved57 = corpus.pages.find((x) => x.page === 57);
assert.equal(solved56.status, "solved");
assert.equal(solved57.status, "solved");
assert.equal(solved56.indices.length, 85);
assert.equal(solved57.indices.length, 95);

// Positive: the same 135 known native-GP runes are independently encrypted
// with two different q8 keys and arbitrary start phases. The true F mask and
// actual starts must be among the blind inverse's exact survivors.
const positivePlain = solved56.indices.concat(solved57.indices.slice(0, 50));
assert.equal(positivePlain.length, 135);
const positiveKeyA = [19, 1, 13, 14, 15, 1, 25, 4];
const positiveKeyB = [1, 19, 28, 8, 2, 25, 9, 8];
const positiveStartA = 3;
const positiveStartB = 6;
const positiveCipherA = encryptTransparentF(positivePlain, positiveKeyA, positiveStartA);
const positiveCipherB = encryptTransparentF(positivePlain, positiveKeyB, positiveStartB);
const positive = enumerateSamePlaintextQ8(
  positiveCipherA.cipher,
  positiveCipherB.cipher
);
const trueHoldPositions = positivePlain
  .map((v, i) => (v === 0 ? i : null))
  .filter((v) => v !== null);
const positiveWitness = positive.valid.find((candidate) =>
  candidate.phaseAStart === positiveStartA &&
  candidate.phaseBStart === positiveStartB &&
  candidate.heldPositions.join(",") === trueHoldPositions.join(",")
);
assert.ok(positiveWitness, "positive control's exact hidden keys/phases/F mask");

const survivingPositiveMasks = new Map();
for (const candidate of positive.valid) {
  survivingPositiveMasks.set(candidate.heldPositions.join(","), true);
}
assert.deepEqual(
  Array.from(survivingPositiveMasks.keys()),
  [trueHoldPositions.join(",")],
  "positive control should identify the exact F-hold mask"
);

// Negative: two different source-native known plaintext streams are encrypted
// independently. The same-plaintext receiver should have no exact witness.
const negativePlainA = solved56.indices.concat(solved57.indices.slice(0, 50));
const negativePlainB = solved57.indices.concat(solved56.indices.slice(0, 40));
assert.equal(negativePlainA.length, 135);
assert.equal(negativePlainB.length, 135);
const negativeCipherA = encryptTransparentF(
  negativePlainA,
  [25, 19, 3, 22, 4, 3, 8, 18],
  1
);
const negativeCipherB = encryptTransparentF(
  negativePlainB,
  [7, 22, 17, 19, 8, 25, 14, 11],
  5
);
const negative = enumerateSamePlaintextQ8(
  negativeCipherA.cipher,
  negativeCipherB.cipher
);
assert.equal(negative.validConfigurations, 0);

console.log(JSON.stringify({
  source: {
    page: 24,
    originalImage: "resources/liber-primus/41.jpg",
    imageSha256,
    runeCount: p24.length,
    physicalLineCounts: lineCounts,
    splitAfterLine: 6,
    upperRunes: firstHalf.length,
    lowerRunes: reversedSecondHalf.length,
    boundaryCarry,
    halfTurn: "upper six lines forward; lower six lines reversed",
  },
  original: {
    simultaneousCipherFPositions: original.commonFPositions,
    legalTransparentFHoldMasks: original.holdMaskCount,
    startingPhasePairs: original.phasePairs,
    configurationsTested: original.attempted,
    survivingConfigurations: original.validConfigurations,
    certificate,
  },
  controls: {
    positive: {
      source: "solved p56 plus first 50 solved p57 runes",
      length: positivePlain.length,
      keys: [positiveKeyA, positiveKeyB],
      startPhases: [positiveStartA, positiveStartB],
      trueFHoldPositions: trueHoldPositions,
      simultaneousCipherFPositions: positive.commonFPositions,
      masksTested: positive.holdMaskCount,
      configurationsTested: positive.attempted,
      survivingConfigurations: positive.validConfigurations,
      actualHiddenConfigurationRecovered: Boolean(positiveWitness),
      onlySurvivingHoldMaskIsTrueMask: survivingPositiveMasks.size === 1,
    },
    negative: {
      source: "solved p57 plus first 40 solved p56 runes, as a distinct stream",
      length: negativePlainA.length,
      simultaneousCipherFPositions: negative.commonFPositions,
      masksTested: negative.holdMaskCount,
      configurationsTested: negative.attempted,
      survivingConfigurations: negative.validConfigurations,
    },
  },
  decision: "reject identical 135-rune p24 half plaintext under independent period-8 additive GP29 keys with transparent plaintext-F holds",
}, null, 2));
