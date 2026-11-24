"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRS";
const MAX_SKIP = 3;
const BEAM_WIDTH = 400;

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function base29(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0);
  if (value === 0) return [0];
  const out = [];
  while (value > 0) {
    out.push(value % 29);
    value = Math.floor(value / 29);
  }
  return out.reverse();
}

function keyText(key) {
  return key.map((digit) => DIGITS[digit]).join("");
}

function loadQuadgrams() {
  const raw = read("resources/control/duko_round27_english_quadgrams.txt");
  const bytes = Buffer.from(raw, "utf8");
  const gitBlobSha = crypto.createHash("sha1")
    .update(Buffer.from("blob " + bytes.length + "\0", "utf8"))
    .update(bytes)
    .digest("hex");
  assert.equal(gitBlobSha, "da56c2e11e004ad24454750dba8fbe2e19abbc71");

  const counts = new Map();
  let total = 0;
  for (const line of raw.trim().split(/\r?\n/u)) {
    const match = /^([A-Z]{4})\s+(\d+)$/u.exec(line.trim());
    if (!match) continue;
    const count = Number(match[2]);
    counts.set(match[1], Math.log10(count));
    total += count;
  }
  assert.ok(counts.size > 1000 && total > 0);
  const logTotal = Math.log10(total);
  for (const [gram, logCount] of counts) {
    counts.set(gram, logCount - logTotal);
  }
  return {
    counts,
    total,
    floor: Math.log10(0.01) - logTotal,
    gitBlobSha,
    quadgramTypes: counts.size,
  };
}

function quadDelta(text, addition, model) {
  const combined = text + addition;
  let score = 0;
  for (let end = Math.max(4, text.length + 1); end <= combined.length; end++) {
    score += model.counts.get(combined.slice(end - 4, end)) ?? model.floor;
  }
  return score;
}

function scoreText(text, model) {
  const letters = text.toUpperCase().replace(/[^A-Z]/gu, "");
  const count = letters.length - 3;
  assert.ok(count > 0);
  let score = 0;
  for (let i = 0; i < count; i++) {
    score += model.counts.get(letters.slice(i, i + 4)) ?? model.floor;
  }
  return {
    letters: letters.length,
    quadgrams: count,
    score: score / count,
    preview: letters.slice(0, 120),
  };
}

function scoreRunes(indices, translit, model) {
  return scoreText(indices.map((index) => translit[index]).join(""), model);
}

function beamDecode(cipher, key, sign, translit, model) {
  assert.ok(key.length > 0 && cipher.length > 0);
  const keyTape = Array.from(
    { length: cipher.length * (MAX_SKIP + 1) + 10 },
    (_, index) => key[index % key.length]
  );
  const first = mod29(cipher[0] + sign * keyTape[0]);
  let beams = [{
    score: 0,
    pointer: 0,
    text: translit[first],
    plain: [first],
  }];

  for (let i = 1; i < cipher.length; i++) {
    const currentCipher = cipher[i];
    const previousCipher = cipher[i - 1];
    const next = [];

    for (const beam of beams) {
      for (let skipped = 0; skipped <= MAX_SKIP; skipped++) {
        const accepted = beam.pointer + 1 + skipped;
        if (accepted >= keyTape.length) break;
        const plain = mod29(currentCipher + sign * keyTape[accepted]);

        // Every rejected key position must have emitted the previous ciphertext rune.
        let valid = true;
        for (let k = beam.pointer + 1; k < accepted; k++) {
          if (mod29(plain - sign * keyTape[k]) !== previousCipher) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;

        const addition = translit[plain];
        next.push({
          score: beam.score + quadDelta(beam.text, addition, model),
          pointer: accepted,
          text: beam.text + addition,
          plain: beam.plain.concat(plain),
        });
      }
    }

    if (next.length === 0) {
      throw new Error("No valid beam survives at ciphertext position " + i);
    }
    next.sort((a, b) => b.score - a.score);
    beams = next.slice(0, BEAM_WIDTH);
  }

  const best = beams[0];
  return {
    score: scoreText(best.text, model).score,
    beamScore: best.score,
    endKeyPointer: best.pointer,
    text: best.text,
    plain: best.plain,
  };
}

function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function encodeKeySkip(plain, key, sign, suppression, seed) {
  const keyTape = Array.from(
    { length: plain.length * (MAX_SKIP + 1) + 10 },
    (_, index) => key[index % key.length]
  );
  const random = xorshift(seed);
  const cipher = [];
  let pointer = 0;
  let previousCipher = null;
  let totalSkips = 0;
  let maxSkipsAtOneRune = 0;

  for (const value of plain) {
    let skipped = 0;
    while (true) {
      const candidate = mod29(value - sign * keyTape[pointer]);
      if (
        previousCipher !== null &&
        candidate === previousCipher &&
        random() < suppression
      ) {
        pointer++;
        skipped++;
        totalSkips++;
        if (skipped > MAX_SKIP) {
          throw new Error("Synthetic control exceeded the declared max-skip bound");
        }
        continue;
      }
      cipher.push(candidate);
      previousCipher = candidate;
      pointer++;
      maxSkipsAtOneRune = Math.max(maxSkipsAtOneRune, skipped);
      break;
    }
  }

  return {
    cipher,
    totalSkips,
    keyDraws: pointer,
    maxSkipsAtOneRune,
  };
}

function englishToIndices(text, translit) {
  const tokens = translit
    .map((value, index) => [value, index])
    .sort((a, b) => b[0].length - a[0].length);
  const aliases = { V: 1, K: 5, Z: 15, Q: 5 };
  const source = text.toUpperCase();
  const out = [];

  for (let i = 0; i < source.length;) {
    let matched = false;
    for (const [token, index] of tokens) {
      if (source.startsWith(token, i)) {
        out.push(index);
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (aliases[source[i]] !== undefined) out.push(aliases[source[i]]);
      i++;
    }
  }
  return out;
}

function shuffle(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function permutationNull(cipher, key, seed, translit, model, draws = 200) {
  const observed = Math.max(
    beamDecode(cipher, key, -1, translit, model).score,
    beamDecode(cipher, key, 1, translit, model).score
  );
  const random = xorshift(seed);
  const values = [];
  for (let i = 0; i < draws; i++) {
    const permuted = shuffle(key, random);
    values.push(Math.max(
      beamDecode(cipher, permuted, -1, translit, model).score,
      beamDecode(cipher, permuted, 1, translit, model).score
    ));
  }
  values.sort((a, b) => a - b);
  const exceedances = values.filter((value) => value >= observed).length;
  return {
    draws,
    observedBestSignScore: observed,
    nullMean: values.reduce((sum, value) => sum + value, 0) / draws,
    null95: values[Math.floor(0.95 * (draws - 1))],
    nullMax: values[draws - 1],
    exceedances,
    addOneP: (exceedances + 1) / (draws + 1),
  };
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const translit = corpus.translit;
  const page = corpus.pages.find((item) => item.page === 15);
  assert.ok(page);
  assert.equal(page.indices.length, 159);

  const pageStart = corpus.pages
    .filter((item) => item.page < 15)
    .reduce((sum, item) => sum + item.indices.length, 0);
  assert.equal(pageStart, 3603);
  const body = page.indices.slice(9);
  assert.equal(body.length, 150);
  assert.equal(pageStart + 9, 3612);

  // Original clockwise spiral order, beginning with the red 3299 cell.
  const printedValues = [
    3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
    3152, 3038, 2838, 2472, 1820, 708, 1206, 4516,
  ];
  const underlyingPrimes = [
    2, 3, 5, 7, 13, 23, 43, 79,
    149, 263, 463, 829, 1481, 2593, 4507, 7817,
  ];

  const printedBase29 = printedValues.flatMap(base29);
  const primeBase29 = underlyingPrimes.flatMap(base29);
  const seed3301 = base29(3301);
  const primeResidues = underlyingPrimes.map(mod29);
  const gridResidues = printedValues.map(mod29);

  assert.equal(keyText(printedBase29), "3QM3QL3QJ3QH3QB3Q13PA3O33LK3HM3AP2R724MOC1CH5AL");
  assert.equal(keyText(primeBase29), "2357DN1E2L5492FSSH1M232C5AC98G");
  assert.equal(keyText(seed3301), "3QO");
  assert.equal(keyText(primeResidues), "2357DNEL42SH2CCG");
  assert.equal(keyText(gridResidues), "MLJHB1A3KMP7MCHL");

  const model = loadQuadgrams();
  const keys = [
    { name: "printed-values-BASE29", key: printedBase29 },
    { name: "underlying-primes-BASE29", key: primeBase29 },
    { name: "BASE29-of-3301", key: seed3301 },
    { name: "Fibonacci-indexed-prime-residues-mod29", key: primeResidues },
    { name: "printed-grid-residues-mod29", key: gridResidues },
  ];

  const sourceResults = keys.map(({ name, key }) => ({
    name,
    keyLength: key.length,
    key: keyText(key),
    bothDirections: [-1, 1].map((sign) => {
      const decoded = beamDecode(body, key, sign, translit, model);
      return {
        sign,
        score: decoded.score,
        endKeyPointer: decoded.endKeyPointer,
        preview: decoded.text.slice(0, 120),
      };
    }),
  }));

  const rawControls = {
    p15BodyCiphertext: scoreRunes(body, translit, model),
    solvedP57Plaintext: scoreRunes(
      corpus.pages.find((item) => item.page === 57).indices,
      translit,
      model
    ),
  };

  const positivePhrase =
    "THE PRIMES ARE SACRED AND THE TOTIENT FUNCTION IS SACRED ALL THINGS " +
    "SHOULD BE ENCRYPTED KNOW THIS THAT THE INSTAR EMERGENCE IS AT HAND AND " +
    "THE PILGRIM WHO SOLVES THE DEEP WEB SHALL FIND THE TRUTH WITHIN THE " +
    "SACRED GEOMETRY OF THE CIRCUMFERENCE AND LOSE THE SELF TO GAIN THE WHOLE";
  const positivePlain = englishToIndices(positivePhrase, translit).slice(0, 150);
  assert.equal(positivePlain.length, 150);

  const planted = encodeKeySkip(positivePlain, primeResidues, -1, 0.83, 3301);
  assert.ok(planted.totalSkips > 0);
  const recovered = beamDecode(planted.cipher, primeResidues, -1, translit, model);
  assert.deepEqual(recovered.plain, positivePlain);

  const nulls = {
    underlyingPrimesBase29: permutationNull(
      body, primeBase29, 0x33010000, translit, model
    ),
    primeResiduesMod29: permutationNull(
      body, primeResidues, 0x33010001, translit, model
    ),
  };

  const best = Math.max(...sourceResults.flatMap((item) =>
    item.bothDirections.map((result) => result.score)
  ));

  return {
    hypothesis:
      "The p15 Fibonacci-prime spiral, converted through the authenticated 2013 BASE29 operation, may be a repeated GP29 key under collision-suppressed key advancement.",
    status: "bounded negative; no LP2 plaintext recovered",
    sourceConstruction: {
      page: 15,
      pageStartGlobalRune: pageStart,
      redHeadingRunes: 9,
      bodyStartGlobalRune: pageStart + 9,
      bodyRunes: body.length,
      printedValuesClockwise: printedValues,
      underlyingFibonacciIndexedPrimes: underlyingPrimes,
      keyVariants: keys.map(({ name, key }) => ({
        name,
        length: key.length,
        key: keyText(key),
      })),
    },
    decoder: {
      model:
        "collision-key-skip additive GP29; every skipped key symbol must have emitted the previous ciphertext rune",
      maxSkipPerRune: MAX_SKIP,
      beamWidth: BEAM_WIDTH,
      keyPhase: 0,
      wordAndPageResets: false,
      suppressionProbabilityUsedOnlyInSyntheticPlant: 0.83,
      quadgramGitBlobSha: model.gitBlobSha,
      quadgramTypes: model.quadgramTypes,
    },
    rawControls,
    sourceResults,
    bestCandidateScore: best,
    permutationNulls: nulls,
    positiveControl: {
      plaintextRunes: positivePlain.length,
      totalPlantedSkips: planted.totalSkips,
      keyDraws: planted.keyDraws,
      maxSkipsAtOneRune: planted.maxSkipsAtOneRune,
      exactRecovery: true,
      score: recovered.score,
      preview: recovered.text.slice(0, 150),
    },
    conclusion:
      "The five fixed source-derived p15 key constructions fail under this fixed collision-key-skip decoder. The underlying-prime BASE29 key has the least-poor score but is not exceptional under a 200-permutation multiset-preserving null. This does not exclude other p15 consumers or establish key-skip as the historical LP2 cipher.",
  };
}

if (require.main === module) {
  console.log(JSON.stringify(main(), null, 2));
}

module.exports = { main, beamDecode, encodeKeySkip, permutationNull };
