"use strict";
/**
 * Source-locked test: original 2013 761.MP3 bytes as the keystream for the
 * proposed 28-state GP chain cipher.
 *
 * Model:
 *   step_i = (C_i - C_{i-1}) mod 29
 *   step_i = 0                 => P_i = EA (28)
 *   step_i != 0                => step_i = 1 + ((P_i - sign*K_j) mod 28)
 *   P_i = (step_i - 1 + sign*K_j) mod 28
 *
 * The first rune of each of the eight source-defined cipher sections is an
 * observed IV and is not decoded. No key offset, phase, permutation, or
 * additional transform is searched.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const { encode } = require("./word_partition_invariant.cjs");

const ROOT = path.join(__dirname, "..");
const SOURCE = process.argv[2] || "/tmp/761.MP3";
const EXPECTED_SIZE = 4010732;
const EXPECTED_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const GROUP_LENGTHS = [729, 1145, 1729, 1903, 1021, 1524, 1589, 3316];
const EXPECTED_RUNES = 12956;

function spansFrom(lengths) {
  const spans = [];
  let at = 0;
  for (const length of lengths) {
    spans.push([at, at + length]);
    at += length;
  }
  assert.equal(at, EXPECTED_RUNES);
  return spans;
}
const SPANS = spansFrom(GROUP_LENGTHS);

function readAudio(file) {
  const bytes = fs.readFileSync(file);
  const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  assert.equal(bytes.length, EXPECTED_SIZE);
  assert.equal(sha256, EXPECTED_SHA256);
  assert.equal(bytes.subarray(0, 3).toString("ascii"), "ID3");
  const tagLength = ((bytes[6] & 127) << 21) |
    ((bytes[7] & 127) << 14) | ((bytes[8] & 127) << 7) | (bytes[9] & 127);
  const payloadStart = 10 + tagLength;
  assert.equal(payloadStart, 206);
  assert.ok(bytes.subarray(0, payloadStart).includes(
    Buffer.from("Parable 1,595,277,641")));
  assert.equal(bytes.length - payloadStart, 4010526);
  return {
    bytes,
    payload: bytes.subarray(payloadStart),
    payloadStart,
    sha256
  };
}

function makeKey(bytes, mapping) {
  if (mapping === "mod28") return Uint8Array.from(bytes, b => b % 28);
  if (mapping === "scaled28") return Uint8Array.from(bytes, b => Math.floor(28 * b / 256));
  throw new Error("Unknown byte mapping: " + mapping);
}

function loadOriginal() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const pages = corpus.pages
    .filter(p => p.status === "unsolved" && p.indices.length)
    .map(p => p.indices);
  assert.equal(pages.length, 55);
  const cipher = pages.flat();
  assert.equal(cipher.length, EXPECTED_RUNES);
  return { corpus, cipher };
}

function trainUnigram() {
  const text = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const count = Array(28).fill(0.5);
  for (const token of text.slice(0, 240000).toUpperCase().match(/[A-Z]+/g) || []) {
    for (const p of encode(token)) if (p < 28) count[p]++;
  }
  const total = count.reduce((a, b) => a + b, 0);
  return count.map(c => Math.log(28 * c / total));
}

function scorePlain(plain, spans, logOdds) {
  let score = 0, count = 0, ea = 0;
  const sections = [];
  for (const [start, end] of spans) {
    let sectionScore = 0, sectionCount = 0, sectionEA = 0;
    for (let i = start + 1; i < end; i++) {
      const p = plain[i];
      if (p === 28) { sectionEA++; ea++; }
      else if (p !== null && p !== undefined) {
        sectionScore += logOdds[p];
        sectionCount++;
      }
    }
    score += sectionScore;
    count += sectionCount;
    sections.push({
      decodedNonEA: sectionCount,
      eaZeroSteps: sectionEA,
      meanLogOdds: sectionScore / sectionCount
    });
  }
  return { score, count, meanLogOdds: score / count, eaZeroSteps: ea, sections };
}

function decode(cipher, spans, key, sign, advanceZero, reset, logOdds) {
  const plain = Array(cipher.length).fill(null);
  let globalKeyIndex = 0;
  let zeroSteps = 0, nonzeroSteps = 0;
  for (const [start, end] of spans) {
    let keyIndex = reset ? 0 : globalKeyIndex;
    plain[start] = null; // the published first rune is the section IV
    for (let i = start + 1; i < end; i++) {
      const step = (cipher[i] - cipher[i - 1] + 29) % 29;
      if (step === 0) {
        plain[i] = 28;
        zeroSteps++;
        if (advanceZero) keyIndex++;
      } else {
        plain[i] = (step - 1 + sign * key[keyIndex] + 56) % 28;
        keyIndex++;
        nonzeroSteps++;
      }
    }
    if (!reset) globalKeyIndex = keyIndex;
  }
  return {
    plain,
    zeroSteps,
    nonzeroSteps,
    keyDraws: globalKeyIndex,
    ...scorePlain(plain, spans, logOdds)
  };
}

function encrypt(plain, spans, key, sign, advanceZero, reset) {
  const cipher = Array(plain.length).fill(0);
  let globalKeyIndex = 0;
  for (const [start, end] of spans) {
    let keyIndex = reset ? 0 : globalKeyIndex;
    cipher[start] = plain[start]; // public section IV for the plant
    for (let i = start + 1; i < end; i++) {
      const p = plain[i];
      let step;
      if (p === 28) {
        step = 0;
        if (advanceZero) keyIndex++;
      } else {
        step = 1 + ((p - sign * key[keyIndex] + 28) % 28);
        keyIndex++;
      }
      cipher[i] = (cipher[i - 1] + step) % 29;
    }
    if (!reset) globalKeyIndex = keyIndex;
  }
  return cipher;
}

function makePlant(rawTranscription) {
  const lengths = parseLP2Words(rawTranscription, 55).words.map(w => w.length);
  assert.equal(lengths.length, 2896);
  assert.equal(lengths.reduce((a, b) => a + b, 0), EXPECTED_RUNES);
  const sample = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  function words(text) {
    return (text.toUpperCase().match(/[A-Z]+/g) || []).map(encode);
  }
  const train = words(sample.slice(0, 240000));
  const held = words(sample.slice(240000));
  const trainBins = Array.from({ length: 32 }, () => []);
  const heldBins = Array.from({ length: 32 }, () => []);
  for (const w of train) if (w.length < 32) trainBins[w.length].push(w);
  for (const w of held) if (w.length < 32) heldBins[w.length].push(w);
  let fallbackWords = 0;
  let state = 0x76128c28;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const plant = lengths.map(length => {
    const pool = heldBins[length].length ? heldBins[length] : trainBins[length];
    if (!heldBins[length].length) fallbackWords++;
    assert.ok(pool.length, "Missing Shakespeare words of rune length " + length);
    return pool[Math.floor(random() * pool.length)];
  }).flat();
  assert.equal(plant.length, EXPECTED_RUNES);
  return { plant, fallbackWords, wordCount: lengths.length };
}

function variantName(v) {
  return [
    v.source,
    v.mapping,
    v.reset ? "section-reset" : "continuous",
    v.sign > 0 ? "plus" : "minus",
    v.advanceZero ? "zero-consumes" : "zero-interrupts"
  ].join("/");
}

function buildVariants(audio) {
  const sources = [
    { name: "whole-file", bytes: audio.bytes },
    { name: "compressed-payload", bytes: audio.payload }
  ];
  const variants = [];
  for (const source of sources) {
    for (const mapping of ["mod28", "scaled28"]) {
      const key = makeKey(source.bytes, mapping);
      for (const reset of [false, true]) {
        for (const sign of [-1, 1]) {
          for (const advanceZero of [false, true]) {
            variants.push({
              source: source.name, mapping, reset, sign, advanceZero, key
            });
          }
        }
      }
    }
  }
  assert.equal(variants.length, 32);
  return variants;
}

function evaluate(cipher, variants, logOdds) {
  return variants.map(v => {
    const decoded = decode(cipher, SPANS, v.key, v.sign, v.advanceZero, v.reset, logOdds);
    return {
      name: variantName(v),
      source: v.source,
      mapping: v.mapping,
      reset: v.reset,
      sign: v.sign,
      advanceZero: v.advanceZero,
      meanLogOdds: decoded.meanLogOdds,
      decodedNonEA: decoded.count,
      zeroSteps: decoded.zeroSteps,
      first64: decoded.plain
        .filter((p, i) => p !== null && p !== undefined)
        .slice(0, 64)
    };
  }).sort((a, b) => b.meanLogOdds - a.meanLogOdds);
}

function main() {
  const audio = readAudio(SOURCE);
  const { corpus, cipher } = loadOriginal();
  const logOdds = trainUnigram();
  const variants = buildVariants(audio);

  const eligible = SPANS.reduce((n, [start, end]) => n + end - start - 1, 0);
  const zeroSteps = SPANS.reduce((n, [start, end]) => {
    for (let i = start + 1; i < end; i++) if (cipher[i] === cipher[i - 1]) n++;
    return n;
  }, 0);
  assert.equal(eligible, 12948);
  assert.equal(zeroSteps, 86);

  const originalResults = evaluate(cipher, variants, logOdds);
  const transcription = fs.readFileSync(
    path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
  const plantData = makePlant(transcription);
  const trueSetting = {
    source: "compressed-payload",
    mapping: "mod28",
    reset: false,
    sign: -1,
    advanceZero: false
  };
  const trueVariant = variants.find(v =>
    v.source === trueSetting.source &&
    v.mapping === trueSetting.mapping &&
    v.reset === trueSetting.reset &&
    v.sign === trueSetting.sign &&
    v.advanceZero === trueSetting.advanceZero);
  assert.ok(trueVariant);
  const plantedCipher = encrypt(
    plantData.plant, SPANS, trueVariant.key,
    trueVariant.sign, trueVariant.advanceZero, trueVariant.reset);
  const plantedResults = evaluate(plantedCipher, variants, logOdds);
  const trueRank = plantedResults.findIndex(x => x.name === variantName(trueVariant)) + 1;
  const plantedDecode = decode(
    plantedCipher, SPANS, trueVariant.key, trueVariant.sign,
    trueVariant.advanceZero, trueVariant.reset, logOdds);
  let exact = 0, compared = 0;
  for (const [start, end] of SPANS) {
    for (let i = start + 1; i < end; i++) {
      compared++;
      if (plantedDecode.plain[i] === plantData.plant[i]) exact++;
    }
  }
  assert.equal(exact, compared);
  assert.equal(compared, 12948);
  assert.equal(trueRank, 1);

  const bestOriginal = originalResults[0];
  const bestPlain = decode(
    cipher, SPANS,
    variants.find(v => variantName(v) === bestOriginal.name).key,
    bestOriginal.sign, bestOriginal.advanceZero, bestOriginal.reset, logOdds);
  const translit = bestPlain.plain
    .filter(p => p !== null && p !== undefined)
    .slice(0, 96)
    .map(p => corpus.translit[p]).join("");

  console.log(JSON.stringify({
    experiment: "2013 761.MP3 original bytes as a 28-state chain-cipher keystream",
    source: {
      url: "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3",
      size: audio.bytes.length,
      sha256: audio.sha256,
      id3Bytes: audio.payloadStart,
      compressedPayloadBytes: audio.payload.length
    },
    target: {
      pages: 55,
      runes: cipher.length,
      sectionLengths: GROUP_LENGTHS,
      sectionInitialsTreatedAsIV: SPANS.length,
      decodedPositions: eligible,
      zeroSteps: zeroSteps,
      nonzeroSteps: eligible - zeroSteps
    },
    model: {
      formula: "step=0 => EA; otherwise step=1+((P-sign*K) mod 28), C_i=C_(i-1)+step mod 29",
      byteMappings: ["byte mod 28", "floor(28*byte/256)"],
      sourceStarts: ["whole MP3 byte 0", "compressed payload byte 0 after 206-byte ID3"],
      clocks: ["one continuous source stream", "reset at each of eight sections"],
      zeroStepPolicies: ["EA interrupts key", "EA consumes key"],
      signs: [-1, 1],
      totalVariants: variants.length,
      noOffsetOrPermutationSearch: true
    },
    original: {
      bestMeanUnigramLogOdds: bestOriginal.meanLogOdds,
      best: originalResults.slice(0, 8),
      bestDecodedOpening: translit
    },
    positiveControl: {
      sourceWordCount: plantData.wordCount,
      fallbackWords: plantData.fallbackWords,
      fixedTrueSetting: variantName(trueVariant),
      zeroSteps: plantedDecode.zeroSteps,
      exactRecovered: exact,
      totalDecoded: compared,
      trueSettingRankAmong32: trueRank,
      bestMeanUnigramLogOdds: plantedResults[0].meanLogOdds,
      topThree: plantedResults.slice(0, 3)
    },
    interpretation: "A negative applies only to these 32 source-fixed raw-byte chain inverses and the native GP-English unigram register; exact round trips and the planted positive validate the implementation, not historical authenticity."
  }, null, 2));
}

if (require.main === module) main();
module.exports = { readAudio, makeKey, decode, encrypt, buildVariants };
