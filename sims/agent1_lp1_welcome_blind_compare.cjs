#!/usr/bin/env node
"use strict";

// Run only after im-results/agent1-lp1-welcome-blind-prediction.md has been
// committed. This comparator is intentionally separate from the blind
// predictor and is the first step that reads target plaintext symbols 16–514.

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(root, p), "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const alphabet = readJson("resources/liber-primus/lp2-corpus.json");
const gold = readJson("resources/external/relikd-solved-gp29-native-v1.json");
const predictionMarkdown = readText("im-results/agent1-lp1-welcome-blind-prediction.md");
const runeToIndex = new Map(alphabet.runes.map((r, i) => [r, i]));
const translit = alphabet.translit;

const heading = "## Frozen predicted continuation";
const headingAt = predictionMarkdown.indexOf(heading);
assert(headingAt >= 0, "Could not locate frozen prediction heading");
const fenceAt = predictionMarkdown.indexOf("```text", headingAt);
assert(fenceAt >= 0, "Could not locate frozen prediction code block");
const blockStart = fenceAt + "```text".length;
const blockEnd = predictionMarkdown.indexOf("```", blockStart);
assert(blockEnd >= 0, "Could not locate end of frozen prediction code block");
const predictedTokens = predictionMarkdown.slice(blockStart, blockEnd).trim().split(/\s+/);
assert(predictedTokens.length === 499, `Expected 499 predicted tokens, got ${predictedTokens.length}`);

const targetSection = gold.sections[1];
assert(targetSection && targetSection.name === "0_welcome", "Unexpected target section identity");
const goldTokens = Array.from(targetSection.source_text)
  .filter((ch) => runeToIndex.has(ch))
  .map((ch) => translit[runeToIndex.get(ch)]);
assert(goldTokens.length === 515, `Expected 515 native plaintext symbols, got ${goldTokens.length}`);

const targetTail = goldTokens.slice(16);
const mismatches = [];
for (let i = 0; i < predictedTokens.length; i++) {
  if (predictedTokens[i] !== targetTail[i]) {
    mismatches.push({
      sectionOffset: i + 16,
      predicted: predictedTokens[i],
      native: targetTail[i]
    });
  }
}

const predictedFull = [...goldTokens.slice(0, 16), ...predictedTokens];
const predictedFPositions = predictedFull
  .map((symbol, i) => symbol === "F" ? i : null)
  .filter((i) => i !== null);
const nativeFPositions = goldTokens
  .map((symbol, i) => symbol === "F" ? i : null)
  .filter((i) => i !== null);

const output = {
  targetSection: targetSection.name,
  cribLength: 16,
  predictedLength: predictedTokens.length,
  nativeLength: goldTokens.length,
  exactMatches: predictedTokens.length - mismatches.length,
  mismatchCount: mismatches.length,
  accuracy: (predictedTokens.length - mismatches.length) / predictedTokens.length,
  mismatches,
  predictedFPositions,
  nativeFPositions,
  fHoldPositionsMatch: predictedFPositions.length === nativeFPositions.length &&
    predictedFPositions.every((x, i) => x === nativeFPositions[i]),
  frozenPrediction: "im-results/agent1-lp1-welcome-blind-prediction.md"
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
