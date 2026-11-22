"use strict";

/**
 * Original LP2 p0–2 23-cycle as a literal 119-rune running key for p55.
 * The two source-heading seeds fix the only two key starts; signs are the
 * documented additive GP29 directions. No keyword, fitted phase or key search.
 *
 * Node.js 22: node sims/lp2_wordmap23_concat_runningkey_p55_native_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { parseLP2Words } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const { words, runeCount } = parseLP2Words(raw, 3);
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndex = (word) => [...word.runes].map((r) => index.get(r));
const gpSum = (word) => toIndex(word).reduce((sum, i) => sum + corpus.prime[i], 0);
const mod29 = (n) => ((n % 29) + 29) % 29;

assert.equal(words.length, 158);
assert.equal(runeCount, 729);
assert.deepEqual(words.slice(0, 2).map(gpSum), [347, 315]);
const body = words.slice(2);
assert.equal(body.length, 156);
const ptr = body.map((word) => gpSum(word) % body.length);
const seeds = words.slice(0, 2).map((word) => gpSum(word) % body.length);
assert.deepEqual(seeds, [35, 3]);

/** @param {number} start */
function follow(start) {
  const firstSeen = new Map();
  const walk = [];
  let at = start;
  while (!firstSeen.has(at)) {
    firstSeen.set(at, walk.length);
    walk.push(at);
    at = ptr[at];
  }
  const cycleStart = firstSeen.get(at);
  return { transient: walk.slice(0, cycleStart), cycle: walk.slice(cycleStart) };
}
const lead = follow(seeds[0]);
const second = follow(seeds[1]);
assert.deepEqual(lead.transient.map((x) => x + 1), [36, 56, 113]);
assert.equal(lead.cycle.length, 23);
assert.equal(second.transient.length, 0);
const phase = lead.cycle.indexOf(seeds[1]);
assert.equal(phase, 6);
const expectedCycle = [6, 65, 112, 35, 25, 120, 4, 96, 15, 68, 54, 152,
  109, 89, 102, 129, 82, 12, 151, 122, 108, 140, 144];
assert.deepEqual(lead.cycle.map((i) => i + 1), expectedCycle);
const sourceKeys = [
  {name: "first-red-entry", cells: lead.cycle},
  {name: "second-red-entry", cells: lead.cycle.slice(phase).concat(lead.cycle.slice(0, phase))},
].map(({name, cells}) => ({
  name,
  indices: cells.flatMap((i) => toIndex(body[i])),
}));
assert.deepEqual(sourceKeys.map((key) => key.indices.length), [119, 119]);

const original = corpus.pages.find((p) => p.page === 55).indices;
const solvedPlant = corpus.pages.find((p) => p.page === 57).indices.slice(0, 76);
assert.equal(original.length, 76);
assert.equal(solvedPlant.length, 76);
const hash = (values) => createHash("sha256").update(Buffer.from(values)).digest("hex");

/**
 * Exact p56-style plaintext-F transparent decoder. F=GP index 0 prints F
 * without consuming the key; ciphertext F can alternatively be an encrypted
 * non-F symbol. Preserve all legal paths, including duplicate cursor states.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {-1|1} sign -1 means subtract key on decryption
 */
function invert(ciphertext, key, sign) {
  let paths = [{text: [], cursor: 0}];
  for (let offset = 0; offset < ciphertext.length; offset++) {
    const next = [];
    for (const path of paths) {
      const current = ciphertext[offset];
      if (current === 0) next.push({text: path.text.concat(0), cursor: path.cursor});
      const candidate = mod29(current + sign * key[path.cursor % key.length]);
      if (candidate !== 0) {
        next.push({text: path.text.concat(candidate), cursor: path.cursor + 1});
      }
    }
    if (!next.length) return {paths: [], firstContradiction: offset};
    paths = next;
  }
  return {paths, firstContradiction: null};
}

/** @param {number[]} plain @param {number[]} key @param {-1|1} sign */
function encrypt(plain, key, sign) {
  const cipher = [];
  let cursor = 0;
  for (const rune of plain) {
    if (rune === 0) {
      cipher.push(0);
    } else {
      cipher.push(mod29(rune - sign * key[cursor % key.length]));
      cursor++;
    }
  }
  return cipher;
}

const results = [];
for (const key of sourceKeys) {
  for (const sign of [-1, 1]) {
    const decoded = invert(original, key.indices, sign);
    const plantCipher = encrypt(solvedPlant, key.indices, sign);
    const plantDecoded = invert(plantCipher, key.indices, sign);
    const hasPositive = plantDecoded.paths.some((p) =>
      p.text.length === solvedPlant.length &&
      p.text.every((x, i) => x === solvedPlant[i])
    );
    assert.equal(hasPositive, true, "source-native 76-rune positive must recover");
    assert.equal(decoded.paths.length, 0, "a direct original p55 inverse should be impossible");
    results.push({
      startingRedWord: key.name,
      inverseSign: sign,
      keyLength: key.indices.length,
      p55OriginalFirstImpossibleOffset0: decoded.firstContradiction,
      p55CompletePaths: decoded.paths.length,
      p57PlantRecoveredExactly: hasPositive,
    });
  }
}
assert.deepEqual(results.map((r) => r.p55OriginalFirstImpossibleOffset0), [65, 0, 5, 8]);
console.log(JSON.stringify({
  source: "canonical LP2 original transcription, all original p55 runes, original p57 plaintext positive",
  p55Sha256GpIndexBytes: hash(original),
  p57First76Sha256GpIndexBytes: hash(solvedPlant),
  originalP55Length: original.length,
  originalP55CiphertextFCount: original.filter((i) => i === 0).length,
  cycle23OneBasedCells: expectedCycle,
  twoSourceStarts: [1, 7],
  concatRuneKeyLength: 119,
  results,
  decision: "All four complete original p55 paths are forbidden by the authentic plaintext-F skip rule. Direct 119-rune running-key transfer is excluded; source cycle remains provisional.",
}, null, 2));
