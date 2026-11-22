"use strict";

/*
 * Source-fixed 28-symbol chain-cipher test using CicadaOS DATA/560.13.
 *
 * External hypothesis: within each unsolved section, d_i=(c_i-c_{i-1}) mod 29
 * is zero for a special EA/full-turn symbol; otherwise the 1..28 step is
 * mapped to Z/28Z, combined with a 28-ary key byte, and integrated around
 * Z/29Z. The nine section boundaries match the independent LP2 dataset:
 * p0-2, p3-7, p8-14, p15-22, p23-26, p27-32, p33-39, p40-53, p54-55.
 *
 * The candidate key is the authentic DATA/560.13 byte stream at the exact
 * p15-title BASE29/3301 quotient 8,952,964 (remainder 560). No offset search
 * is performed. A deterministic random-offset null corrects for the finite
 * model family. Both section-state conventions, both key-clock conventions,
 * both natural byte->28 projections, both signs, and all 14 step maps
 * (linear orientations plus the 12 primitive-root discrete logs) are tested.
 *
 * Usage:
 *   node sims/lp2_p15_56013_28chain_sft.cjs <full DATA/560.13 path>
 *   node sims/lp2_p15_56013_28chain_sft.cjs --fixture
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8"
);
const parsed = parseLP2Words(transcription);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const wordIndices = parsed.words.map((word) => [...word.runes].map((rune) => {
  const index = runeIndex.get(rune);
  assert.notEqual(index, undefined, "Unknown rune in canonical LP2 transcription");
  return index;
}));

const runePages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
assert.equal(runePages.length, 55);
const sectionRanges = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const sections = sectionRanges.map(([firstPage, lastPage], index) => {
  const sectionPages = runePages.filter(
    (page) => page.page >= firstPage && page.page <= lastPage
  );
  return {
    name: "p" + firstPage + "-" + lastPage,
    pageNumbers: sectionPages.map((page) => page.page),
    indices: sectionPages.flatMap((page) => page.indices)
  };
});
const sectionLengths = sections.map((section) => section.indices.length);
assert.deepEqual(sectionLengths, [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(sections.length, 9);
const ciphertext = sections.flatMap((section) => section.indices);
assert.equal(ciphertext.length, 12956);
assert.deepEqual(wordIndices.flat(), ciphertext,
  "Word parser must preserve the canonical original rune stream");

const p15 = corpus.pages.find((page) => page.page === 15);
const heading = p15.indices.slice(0, 9);
assert.deepEqual(heading, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const titleInteger = heading.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
assert.equal(titleInteger, 29553734724n);
assert.equal(titleInteger / 3301n, 8952964n);
assert.equal(titleInteger % 3301n, 560n);
const padOffset = Number(titleInteger / 3301n);
const requiredKeyBytes = ciphertext.length - 1;

const isFixture = process.argv[2] === "--fixture";
let pad;
let padSha256;
if (isFixture) {
  pad = Buffer.alloc(padOffset + requiredKeyBytes + 1);
  let state = 0x3301560d;
  for (let i = 0; i < pad.length; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    pad[i] = state & 0xff;
  }
  padSha256 = "deterministic-fixture";
} else {
  const filePath = process.argv[2];
  assert.ok(filePath, "Supply the authentic full DATA/560.13 path");
  pad = fs.readFileSync(filePath);
  assert.equal(pad.length, 118818811, "Unexpected historical DATA/560.13 length");
  padSha256 = crypto.createHash("sha256").update(pad).digest("hex");
  assert.equal(
    padSha256,
    "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f"
  );
  const historicalCipher = Buffer.from(
    "28c07e1b102d4d5c4c1a376e064477e1416fcc94928765", "hex"
  );
  const historicalPlain = Buffer.from(historicalCipher.map(
    (byte, index) => byte ^ pad[12821 + index]
  ));
  assert.equal(historicalPlain.toString("ascii"), "gbyh7znm6c7ezsmr.onion\n");
}
assert.ok(pad.length >= padOffset + requiredKeyBytes);

const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
function modPow(base, exponent, modulus) {
  let result = 1;
  let value = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power >>= 1;
  }
  return result;
}

function buildStepMaps() {
  const maps = [];
  const direct = Array(29).fill(-1);
  const directInverse = Array(28).fill(-1);
  const reverse = Array(29).fill(-1);
  const reverseInverse = Array(28).fill(-1);
  for (let step = 1; step <= 28; step++) {
    direct[step] = step - 1;
    directInverse[step - 1] = step;
    reverse[step] = 28 - step;
    reverseInverse[28 - step] = step;
  }
  maps.push({ name: "linear-forward", map: direct, inverse: directInverse });
  maps.push({ name: "linear-reverse", map: reverse, inverse: reverseInverse });

  const primitiveRoots = [2, 3, 8, 10, 11, 14, 15, 18, 19, 21, 26, 27];
  for (const root of primitiveRoots) {
    const map = Array(29).fill(-1);
    const inverse = Array(28).fill(-1);
    let value = 1;
    for (let exponent = 0; exponent < 28; exponent++) {
      map[value] = exponent;
      inverse[exponent] = value;
      value = (value * root) % 29;
    }
    assert.equal(value, 1, "Declared root must have order 28");
    assert.equal(new Set(map.slice(1)).size, 28);
    maps.push({ name: "dlog-" + root, map, inverse });
  }
  assert.equal(maps.length, 14);
  return maps;
}
const stepMaps = buildStepMaps();

function keyFrom(offset, projection) {
  const raw = pad.subarray(offset, offset + requiredKeyBytes);
  assert.equal(raw.length, requiredKeyBytes);
  const key = new Uint8Array(requiredKeyBytes);
  for (let i = 0; i < raw.length; i++) {
    key[i] = projection === "byte-mod28"
      ? raw[i] % 28
      : Math.floor(28 * raw[i] / 256);
  }
  return key;
}

function decodeSections(inputSections, key, config, stepMap) {
  const output = new Uint8Array(ciphertext.length);
  output.fill(255); // 255 marks a transmitted initial state, not plaintext.
  let keyIndex = 0;
  let previous = null;
  let cursor = 0;
  let zeroSteps = 0;
  let transitions = 0;
  const zeroStepsBySection = [];

  for (let sectionIndex = 0; sectionIndex < inputSections.length; sectionIndex++) {
    const input = inputSections[sectionIndex].indices;
    if (config.resetKeyAtSection) keyIndex = 0;
    let start;
    if (config.resetStateAtSection || sectionIndex === 0) {
      previous = input[0];
      output[cursor] = 255;
      start = 1;
    } else {
      start = 0; // State continues across this section boundary.
    }
    let sectionZeros = 0;
    for (let i = start; i < input.length; i++) {
      const current = input[i];
      const step = mod(current - previous, 29);
      transitions++;
      if (step === 0) {
        output[cursor + i] = 28; // Proposed EA/full-turn marker.
        zeroSteps++;
        sectionZeros++;
        if (config.consumeAtZero) keyIndex++;
      } else {
        assert.ok(keyIndex < key.length, "Key clock exceeded source slice");
        const mapped = stepMap.map[step];
        assert.ok(mapped >= 0 && mapped < 28);
        output[cursor + i] = mod(mapped - config.sign * key[keyIndex], 28);
        keyIndex++;
      }
      previous = current;
    }
    zeroStepsBySection.push(sectionZeros);
    cursor += input.length;
  }
  assert.equal(cursor, ciphertext.length);
  return { output, keyConsumed: keyIndex, zeroSteps, zeroStepsBySection, transitions };
}

function encodeSections(plainSections, key, config, stepMap, iv) {
  const outputSections = [];
  let keyIndex = 0;
  let previous = null;
  for (let sectionIndex = 0; sectionIndex < plainSections.length; sectionIndex++) {
    const input = plainSections[sectionIndex];
    if (config.resetKeyAtSection) keyIndex = 0;
    const output = [];
    let start;
    if (config.resetStateAtSection || sectionIndex === 0) {
      previous = iv;
      output.push(iv);
      start = 1;
    } else {
      start = 0;
    }
    for (let i = start; i < input.length; i++) {
      const plain = input[i];
      let step;
      if (plain === 28) {
        step = 0;
        if (config.consumeAtZero) keyIndex++;
      } else {
        assert.ok(keyIndex < key.length, "Positive-control key clock exceeded source slice");
        const mapped = mod(plain + config.sign * key[keyIndex], 28);
        step = stepMap.inverse[mapped];
        keyIndex++;
      }
      previous = mod(previous + step, 29);
      output.push(previous);
    }
    outputSections.push(output);
  }
  return outputSections;
}

function scoreOutput(output) {
  const counts28 = Array(28).fill(0);
  const counts29 = Array(29).fill(0);
  let n28 = 0;
  let n29 = 0;
  for (const value of output) {
    if (value === 255) continue;
    counts29[value]++;
    n29++;
    if (value !== 28) {
      counts28[value]++;
      n28++;
    }
  }
  const pairSum = (counts) => counts.reduce((sum, count) => sum + count * (count - 1), 0);
  const ioc28 = n28 > 1 ? 28 * pairSum(counts28) / (n28 * (n28 - 1)) : 0;
  const ioc29 = n29 > 1 ? 29 * pairSum(counts29) / (n29 * (n29 - 1)) : 0;
  return { ioc28, ioc29, n28, n29, counts28, counts29 };
}

const translitTokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
const normalizeLetter = { K: "C", Q: "C", V: "U", Z: "S" };
function encodeWord(word) {
  const output = [];
  for (let position = 0; position < word.length;) {
    let token = translitTokens.find((candidate) => word.startsWith(candidate, position));
    if (!token) {
      token = normalizeLetter[word[position]] || word[position];
      position++;
    } else {
      position += token.length;
    }
    const index = corpus.translit.indexOf(token);
    if (index >= 0) output.push(index);
  }
  return output;
}
const nativeText = fs.readFileSync(
  path.join(ROOT, "resources", "control", "shakespeare_first300k.txt"), "utf8"
);
const nativeWords = (nativeText.toUpperCase().match(/[A-Z]+/g) || [])
  .map(encodeWord).filter((word) => word.length > 0);
const ngramCounts = new Map();
let ngramTotal = 0;
function ngramCode(a, b, c, d) {
  return ((a * 29 + b) * 29 + c) * 29 + d;
}
for (const word of nativeWords) {
  for (let i = 0; i + 4 <= word.length; i++) {
    const code = ngramCode(word[i], word[i + 1], word[i + 2], word[i + 3]);
    ngramCounts.set(code, (ngramCounts.get(code) || 0) + 1);
    ngramTotal++;
  }
}
const ngramVocabulary = 29 ** 4;
function scoreNgrams(output) {
  let score = 0;
  let n = 0;
  let cursor = 0;
  for (const word of wordIndices) {
    for (let i = 0; i + 4 <= word.length; i++) {
      const a = output[cursor + i];
      const b = output[cursor + i + 1];
      const c = output[cursor + i + 2];
      const d = output[cursor + i + 3];
      if (a === 255 || b === 255 || c === 255 || d === 255) continue;
      const count = ngramCounts.get(ngramCode(a, b, c, d)) || 0;
      score += Math.log((count + 0.1) / (ngramTotal + 0.1 * ngramVocabulary));
      n++;
    }
    cursor += word.length;
  }
  return n ? score / n : -Infinity;
}

function renderWords(output, maximumWords) {
  let cursor = 0;
  const rendered = [];
  for (let wordIndex = 0; wordIndex < Math.min(maximumWords, wordIndices.length); wordIndex++) {
    const word = wordIndices[wordIndex];
    let renderedWord = "";
    for (let i = 0; i < word.length; i++) {
      const value = output[cursor++];
      renderedWord += value === 255 ? "?" : corpus.translit[value];
    }
    rendered.push(renderedWord);
  }
  return rendered.join(" ");
}

function positiveControl(config, stepMap, key) {
  const native = nativeWords.flat();
  assert.ok(native.length >= ciphertext.length);
  const source = native.slice(0, ciphertext.length);
  const plainSections = [];
  let cursor = 0;
  for (const length of sectionLengths) {
    plainSections.push(source.slice(cursor, cursor + length));
    cursor += length;
  }
  const encrypted = encodeSections(plainSections, key, config, stepMap, 17);
  const decoded = decodeSections(
    encrypted.map((indices) => ({ indices })), key, config, stepMap
  );
  let plainCursor = 0;
  let checked = 0;
  for (let sectionIndex = 0; sectionIndex < plainSections.length; sectionIndex++) {
    for (let i = 0; i < plainSections[sectionIndex].length; i++) {
      const originalIndex = plainCursor + i;
      const isIv = (config.resetStateAtSection || sectionIndex === 0) && i === 0;
      if (!isIv) {
        assert.equal(decoded.output[originalIndex], plainSections[sectionIndex][i],
          "Synthetic positive control must recover every encrypted rune");
        checked++;
      } else {
        assert.equal(decoded.output[originalIndex], 255);
      }
    }
    plainCursor += plainSections[sectionIndex].length;
  }
  return { exact: true, checkedRunes: checked, keyConsumed: decoded.keyConsumed };
}

const configurations = [];
for (const projection of ["byte-mod28", "byte-scaled28"]) {
  for (const resetStateAtSection of [false, true]) {
    for (const resetKeyAtSection of [false, true]) {
      for (const consumeAtZero of [false, true]) {
        for (const stepMap of stepMaps) {
          for (const sign of [-1, 1]) {
            configurations.push({
              projection, resetStateAtSection, resetKeyAtSection,
              consumeAtZero, stepMap, sign
            });
          }
        }
      }
    }
  }
}
assert.equal(configurations.length, 448);

function evaluateOffset(offset, includePreview) {
  const models = [];
  const keyCache = new Map();
  for (const config of configurations) {
    let key = keyCache.get(config.projection);
    if (!key) {
      key = keyFrom(offset, config.projection);
      keyCache.set(config.projection, key);
    }
    const decoded = decodeSections(sections, key, config, config.stepMap);
    const stats = scoreOutput(decoded.output);
    const ngram4 = scoreNgrams(decoded.output);
    models.push({
      projection: config.projection,
      resetStateAtSection: config.resetStateAtSection,
      resetKeyAtSection: config.resetKeyAtSection,
      consumeAtZero: config.consumeAtZero,
      stepMap: config.stepMap.name,
      sign: config.sign,
      ioc28: stats.ioc28,
      ioc29: stats.ioc29,
      ngram4,
      zeroSteps: decoded.zeroSteps,
      zeroStepsBySection: decoded.zeroStepsBySection,
      transitions: decoded.transitions,
      keyConsumed: decoded.keyConsumed,
      ...(includePreview ? { preview: renderWords(decoded.output, 70) } : {})
    });
  }
  models.sort((a, b) => b.ioc28 - a.ioc28 || b.ngram4 - a.ngram4);
  return models;
}

// Exact encoder/decoder positive controls for every model convention.
const positiveControlResults = [];
const sourceKeys = {
  "byte-mod28": keyFrom(padOffset, "byte-mod28"),
  "byte-scaled28": keyFrom(padOffset, "byte-scaled28")
};
for (const config of configurations) {
  positiveControlResults.push(positiveControl(
    config, config.stepMap, sourceKeys[config.projection]
  ));
}
assert.ok(positiveControlResults.every((result) => result.exact));

// The p15 quotient is the only candidate offset; random offsets are null controls,
// not a search. The seed is derived from the verified source hash.
const sourceModels = evaluateOffset(padOffset, true);
let seed = parseInt(crypto.createHash("sha256").update(padSha256).digest("hex").slice(0, 8), 16) >>> 0;
function nextRandom() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const nullOffsets = [];
const maximumOffset = pad.length - requiredKeyBytes;
while (nullOffsets.length < 16) {
  const offset = nextRandom() % (maximumOffset + 1);
  if (offset !== padOffset && !nullOffsets.includes(offset)) nullOffsets.push(offset);
}
const nullResults = [];
for (const offset of nullOffsets) {
  const models = evaluateOffset(offset, false);
  nullResults.push({
    offset,
    maxIoC28: models[0].ioc28,
    maxNgram4: Math.max(...models.map((model) => model.ngram4)),
    bestModel: {
      projection: models[0].projection,
      resetStateAtSection: models[0].resetStateAtSection,
      resetKeyAtSection: models[0].resetKeyAtSection,
      consumeAtZero: models[0].consumeAtZero,
      stepMap: models[0].stepMap,
      sign: models[0].sign
    }
  });
}
const nullMaxIoC28 = Math.max(...nullResults.map((result) => result.maxIoC28));
const nullMaxNgram4 = Math.max(...nullResults.map((result) => result.maxNgram4));
const bestByIoC = sourceModels[0];
const bestByNgram = sourceModels.slice().sort((a, b) => b.ngram4 - a.ngram4)[0];
const candidateModel = sourceModels.find((model) =>
  model.ioc28 >= 1.4 &&
  model.ioc28 > nullMaxIoC28 &&
  model.ngram4 > nullMaxNgram4
);
const candidate = Boolean(candidateModel);

const withinSectionZeroSteps = sections.reduce((sum, section) =>
  sum + section.indices.slice(1).filter((value, index) => value === section.indices[index]).length, 0);
const flattenedZeroSteps = ciphertext.slice(1).filter((value, index) => value === ciphertext[index]).length;

const output = {
  experiment: "p15-selected DATA/560.13 key under the nine-section 28-symbol chain-cipher model",
  status: isFixture ? "fixture-only" : (candidate ? "candidate-signal-requires-independent-reproduction" : "no-source-key-signal"),
  source: {
    name: "CicadaOS DATA/560.13",
    size: pad.length,
    sha256: padSha256,
    offset: padOffset,
    selector: {
      p15TitleBase29: titleInteger.toString(),
      divisor: 3301,
      quotient: padOffset,
      remainder: 560
    },
    keySliceLength: requiredKeyBytes,
    fixture: isFixture
  },
  corpus: {
    runeCount: totalRunes,
    physicalRunePages: runePages.length,
    sectionNames: sections.map((section) => section.name),
    sectionPageNumbers: sections.map((section) => section.pageNumbers),
    sectionLengths,
    words: parsed.words.length,
    flattenedAdjacentEqualities: flattenedZeroSteps,
    withinSectionZeroSteps,
    zeroStepsBySection: sections.map((section) =>
      section.indices.slice(1).filter((value, index) => value === section.indices[index]).length
    )
  },
  model: {
    formula: "d=(c[i]-c[i-1]) mod 29; d=0 -> EA; otherwise p=(B(d)-sign*k[i]) mod 28",
    projections: ["byte mod 28", "floor(28*byte/256)"],
    stepMaps: stepMaps.map((map) => map.name),
    signs: [-1, 1],
    resetStateAtSection: [false, true],
    resetKeyAtSection: [false, true],
    consumeKeyAtZeroStep: [false, true],
    configurations: configurations.length,
    firstRuneConvention: "first rune is an IV only at the start of each state-reset section; otherwise only the first global rune is an IV"
  },
  controls: {
    positiveControlConfigurations: positiveControlResults.length,
    allPositiveControlsRecovered: positiveControlResults.every((result) => result.exact),
    nullOffsetCount: nullResults.length,
    nullMaxIoC28,
    nullMaxNgram4,
    nullResults
  },
  sourceOffsetResults: {
    bestByIoC,
    bestByNgram,
    bestCandidate: candidateModel || null,
    topByIoC: sourceModels.slice(0, 12),
    topByNgram: sourceModels.slice().sort((a, b) => b.ngram4 - a.ngram4).slice(0, 12)
  },
  interpretation: isFixture
    ? "Fixture run validates code paths and positive controls only; it says nothing about LP2."
    : (candidate
      ? "The fixed 560.13 source offset is an outlier under the tested chain family; inspect the rendered output and reproduce independently before promoting."
      : "The p15-selected 560.13 byte stream does not recover English-like plaintext under this bounded nine-section chain family. This rejects this exact key-source/offset/model conjunction, not every chain cipher or every possible 560.13 use.")
};
console.log(JSON.stringify(output, null, 2));
