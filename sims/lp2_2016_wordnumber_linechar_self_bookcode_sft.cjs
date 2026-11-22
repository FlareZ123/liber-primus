#!/usr/bin/env node
"use strict";

// Frozen test of one self-referential book-code hypothesis:
// each unknown LP2 word supplies (line, character) =
// (sum of its Gematria Primus prime values, number of runes).
// Read the selected character from the 1-based physical line of the full
// Liber Primus transcription. No modulo, reversal, page-local reset,
// coordinate swap, or fitted offset is tried.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp2 = read("resources/liber-primus/lp2-transcription.txt");
const master = read("resources/transcriptions/liber_primus_master.txt");
const quadText = read("resources/control/dukotah_english_quadgrams.txt");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const physicalBlocks = lp2.split("%");

function parseWords(blocks) {
  const raw = blocks.join("");
  const normalized = raw
    .replace(/[\/\r\n]/g, "")
    .replace(/[&$§]/g, " ")
    .replace(/[-.]/g, " ");
  return normalized.split(/\s+/)
    .map(word => Array.from(word)
      .filter(rune => runeIndex.has(rune))
      .map(rune => runeIndex.get(rune)))
    .filter(word => word.length > 0);
}

const unknownWords = parseWords(physicalBlocks.slice(0, 55));
const knownWords = parseWords(physicalBlocks.slice(55));

const headerMatch = master.match(/\r?\n\r?\n/);
if (!headerMatch) throw new Error("Could not locate transcription delimiter header");
const bodyStart = headerMatch.index + headerMatch[0].length;
const targetLines = master.slice(bodyStart).split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !["&", "$", "%", "§"].includes(line))
  .map(line => line.endsWith("/") ? line.slice(0, -1) : line);

const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const [gram, countText] = line.trim().split(/\s+/);
  if (!gram || !countText) continue;
  const count = Number(countText);
  quadgrams.set(gram, count);
  quadgramTotal += count;
}

function pairs(words) {
  return words.map(word => [
    word.reduce((sum, index) => sum + corpus.prime[index], 0),
    word.length
  ]);
}

function extract(pointerPairs) {
  let output = "";
  let valid = 0;
  let invalid = 0;
  const types = { rune: 0, hyphen: 0, period: 0, other: 0 };

  for (const [lineNumber, characterNumber] of pointerPairs) {
    if (lineNumber < 1 || lineNumber > targetLines.length) {
      invalid++;
      continue;
    }
    const chars = Array.from(targetLines[lineNumber - 1]);
    if (characterNumber < 1 || characterNumber > chars.length) {
      invalid++;
      continue;
    }
    const character = chars[characterNumber - 1];
    valid++;
    const index = runeIndex.get(character);
    if (index !== undefined) {
      output += corpus.translit[index].replace(/[^A-Z]/g, "");
      types.rune++;
    } else if (character === "-") {
      output += " ";
      types.hyphen++;
    } else if (character === ".") {
      output += " ";
      types.period++;
    } else {
      output += " ";
      types.other++;
    }
  }
  return { output, valid, invalid, types };
}

function quadgramScore(text) {
  const letters = text.replace(/[^A-Z]/g, "");
  if (letters.length < 4) return Number.NEGATIVE_INFINITY;
  let score = 0;
  let count = 0;
  for (let i = 0; i <= letters.length - 4; i++) {
    const gram = letters.slice(i, i + 4);
    score += Math.log((quadgrams.get(gram) || 1) / quadgramTotal);
    count++;
  }
  return score / count;
}

let rngState = 0x133331;
function random01() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
function shuffled(values) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random01() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const unknownPairs = pairs(unknownWords);
const unknown = extract(unknownPairs);
const unknownScore = quadgramScore(unknown.output);
const knownPairs = pairs(knownWords);
const known = extract(knownPairs);
const knownScore = quadgramScore(known.output);

const lineCoordinates = unknownPairs.map(pair => pair[0]);
const characterCoordinates = unknownPairs.map(pair => pair[1]);
const nullScores = [];
const nullCoverages = [];
const nullCount = 1000;

for (let i = 0; i < nullCount; i++) {
  const lines = shuffled(lineCoordinates);
  const characters = shuffled(characterCoordinates);
  const sample = extract(lines.map((line, j) => [line, characters[j]]));
  nullScores.push(quadgramScore(sample.output));
  nullCoverages.push(sample.valid / unknownPairs.length);
}

const mean = nullScores.reduce((a, b) => a + b, 0) / nullCount;
const sd = Math.sqrt(nullScores.reduce((a, b) => a + (b - mean) ** 2, 0) / nullCount);
const percentile = nullScores.filter(value => value <= unknownScore).length / nullCount;
const meanCoverage = nullCoverages.reduce((a, b) => a + b, 0) / nullCount;

function runeCount(words) {
  return words.reduce((n, word) => n + word.length, 0);
}

const result = {
  hypothesis: "line = GP-prime word sum; character = rune count; 1-based global lines",
  inputs: {
    corpus: "resources/liber-primus/lp2-corpus.json",
    lp2Transcription: "resources/liber-primus/lp2-transcription.txt",
    targetLines: "resources/transcriptions/liber_primus_master.txt",
    languageModel: "resources/control/dukotah_english_quadgrams.txt"
  },
  dimensions: {
    physicalBlocks: physicalBlocks.length,
    unknownWords: unknownWords.length,
    unknownRunes: runeCount(unknownWords),
    knownWordsP56P57: knownWords.length,
    targetLines: targetLines.length,
    maxTargetLineLength: Math.max(...targetLines.map(line => Array.from(line).length))
  },
  unknown: {
    valid: unknown.valid,
    invalid: unknown.invalid,
    coverage: unknown.valid / unknownPairs.length,
    selectedCharacterTypes: unknown.types,
    quadgramScore: unknownScore,
    transliteratedSample: unknown.output.slice(0, 240)
  },
  knownP56P57Control: {
    valid: known.valid,
    invalid: known.invalid,
    coverage: known.valid / knownPairs.length,
    quadgramScore: knownScore,
    transliteratedSample: known.output.slice(0, 160)
  },
  null: {
    count: nullCount,
    seed: "0x133331",
    construction: "independently shuffle line and character coordinates; preserve both marginals",
    meanQuadgramScore: mean,
    sdQuadgramScore: sd,
    z: (unknownScore - mean) / sd,
    lowerOrEqualTail: percentile,
    meanCoverage
  }
};

if (unknownWords.length !== 2896 || runeCount(unknownWords) !== 12956) {
  throw new Error("Unexpected canonical LP2 word/rune count");
}
console.log(JSON.stringify(result, null, 2));
