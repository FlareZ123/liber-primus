"use strict";
/**
 * Original-LP2 Solitaire/Pontifex direct-GP29 screen, Agent 36 (2026-11-10).
 * Historical motivation is Cicada's 2014 PATIENCE IS A VIRTUE clue.
 * 14 predeclared phrases * 2 deck clocks * 2 numeric offsets * 2 signs.
 * Official Schneier output vectors and a native-English plant are checked.
 *
 * Run from the repository root: node sims/solitaire_patience_gp29_sft.cjs
 * No external packages or network requests.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const pages = corpus.pages.filter((p) => p.page <= 55).map((p) => p.indices);
const original = pages.flat();
const N = 29;

/** @returns {number[]} Cards 1..52, A=53, B=54 */
function freshDeck() { return Array.from({length: 54}, (_, i) => i + 1); }

/** @param {number[]} deck @param {number} count */
function countCut(deck, count) {
  const top = deck.splice(0, count);
  deck.splice(deck.length - 1, 0, ...top);
}

/** @param {number[]} deck Mutates an exact 54-card deck. */
function shuffleStep(deck) {
  for (const [card, times] of [[53, 1], [54, 2]]) {
    for (let t = 0; t < times; t++) {
      const previous = deck.indexOf(card);
      deck.splice(previous, 1);
      deck.splice(previous === deck.length ? 1 : previous + 1, 0, card);
    }
  }
  const posA = deck.indexOf(53), posB = deck.indexOf(54);
  const lo = Math.min(posA, posB), hi = Math.max(posA, posB);
  const old = deck.splice(0);
  deck.push(...old.slice(hi + 1), ...old.slice(lo, hi + 1), ...old.slice(0, lo));
  countCut(deck, Math.min(deck[53], 53));
}

/** @param {number[]} deck @returns {number} Keystream value from 1 through 26. */
function nextKey(deck) {
  for (;;) {
    shuffleStep(deck);
    const value = deck[Math.min(deck[0], 53)];
    if (value <= 52) return 1 + (value - 1) % 26;
  }
}

/** @param {string} phrase @returns {number[]} */
function keyedDeck(phrase) {
  const deck = freshDeck();
  for (const ch of phrase.toUpperCase().replace(/[^A-Z]/g, "")) {
    shuffleStep(deck);
    countCut(deck, ch.charCodeAt(0) - 64);
  }
  return deck;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(N).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[][]} sourcePages
 * @param {string} phrase
 * @param {"book"|"page"} clock
 * @param {number} offset
 * @param {-1|1} sign
 * @returns {number[]} GP29-coded output
 */
function apply(sourcePages, phrase, clock, offset, sign) {
  const out = [];
  let deck = keyedDeck(phrase);
  for (const page of sourcePages) {
    if (clock === "page") deck = keyedDeck(phrase);
    for (const symbol of page) {
      const key = nextKey(deck) - offset;
      out.push((symbol + sign * key % N + N) % N);
    }
  }
  return out;
}

function officialControls() {
  const sequence = (phrase, count) => {
    const deck = keyedDeck(phrase);
    return Array.from({length: count}, () => nextKey(deck));
  };
  assert.deepEqual(sequence("", 10), [4, 23, 10, 24, 8, 25, 18, 6, 4, 7]);
  assert.deepEqual(sequence("FOO", 15),
    [8, 19, 7, 25, 20, 9, 8, 22, 6, 17, 5, 26, 17, 12, 22]);
  const stream = sequence("CRYPTONOMICON", 10);
  const message = "SOLITAIREX";
  const encrypted = Array.from(message, (ch, i) =>
    String.fromCharCode(65 + (ch.charCodeAt(0) - 65 + stream[i]) % 26)).join("");
  assert.equal(encrypted, "KIRAKSFJAN");
}

/** English-text positive, independent of the original LP2 ciphertext. */
function plantedControl() {
  const shakespeare = fs.readFileSync(path.join(root,
    "resources/control/shakespeare_first300k.txt"), "utf8").toUpperCase();
  const byLetter = new Map(corpus.translit.map((v, i) => [v, i]));
  const nativeText = [...shakespeare].filter((x) => byLetter.has(x))
    .slice(0, 6000).map((x) => byLetter.get(x));
  assert.equal(nativeText.length, 6000);
  const key = "PATIENCE";
  const stream = keyedDeck(key);
  const ciphertext = nativeText.map((symbol) => (symbol + nextKey(stream)) % N);
  const recovered = apply([ciphertext], key, "book", 0, -1);
  assert.deepEqual(recovered, nativeText);
  const forward = apply([recovered], key, "book", 0, 1);
  assert.deepEqual(forward, ciphertext);
  assert(ioc(nativeText) > 0.05);
  return {length: nativeText.length, nativeIoc: ioc(nativeText),
    cipherIoc: ioc(ciphertext), recovered: recovered.length};
}

function main() {
  assert.equal(original.length, 12956);
  officialControls();
  const plant = plantedControl();
  const phrases = [
    "PATIENCE", "PATIENCE IS A VIRTUE",
    "THE KEY HAS ALWAYS BEEN RIGHT IN FRONT OF YOUR EYES",
    "LIBER PRIMUS", "CICADA", "CICADA 3301", "FIRFUMFERENFE",
    "DIVINITY", "AN END", "THE INSTAR EMERGENCE",
    "INTERCONNECTEDNESS", "CRYPTONOMICON", "THE PATH", "FOO"
  ];
  const results = [];
  for (const phrase of phrases) for (const clock of ["book", "page"])
    for (const offset of [0, 1]) for (const sign of [-1, 1]) {
      const output = apply(pages, phrase, clock, offset, sign);
      const roundtrip = apply(
        clock === "page" ? pages.map((p, i) => output.slice(
          pages.slice(0, i).reduce((sum, pp) => sum + pp.length, 0),
          pages.slice(0, i + 1).reduce((sum, pp) => sum + pp.length, 0))) :
          [output], phrase, clock, offset, /** @type {-1|1} */(-sign)
      );
      assert.deepEqual(roundtrip, original);
      results.push({
        phrase, clock, offset, sign,
        ioc: ioc(output),
        firstIoc: ioc(output.slice(0, 6478)),
        secondIoc: ioc(output.slice(6478)),
        opening: output.slice(0, 50).map((x) => corpus.translit[x]).join(" ")
      });
    }
  results.sort((a, b) => b.ioc - a.ioc);
  console.log(JSON.stringify({
    classification: "Finite original-input negative; no authentic plaintext or key",
    originalRunes: original.length, originalIoc: ioc(original),
    uniformGP29Ioc: 1 / N, models: results.length,
    keyPhrases: phrases, winningConfiguration: results[0],
    fiveHighest: results.slice(0, 5),
    officialSolitaireVectors: "PASS: unkeyed / FOO / CRYPTONOMICON",
    naturalLanguagePlantedControl: plant,
    originalFullReencryption: "PASS: all 112 settings, every original rune",
    limits: "Direct addition/subtraction of 26-letter Solitaire keystream to GP29 only; original word/section clocks, alternate registers and other card interpretations untested"
  }, null, 2));
}
if (require.main === module) main();
