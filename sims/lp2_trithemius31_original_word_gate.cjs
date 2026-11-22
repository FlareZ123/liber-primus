"use strict";

/**
 * Bounded source-constrained Trithemius Book I extraction on Liber Primus LP2.
 *
 * Sources:
 * - Original LP2 words: resources/liber-primus/lp2-transcription.txt
 * - Exact rune indices: resources/liber-primus/lp2-corpus.json
 * - Original large mark inventory: lp2-punctuation-identity.json
 * - Trithemius, Steganographia I.1 (Pamersiel): first letter each word.
 * - Trithemius I.2 (Padiel): even letters of even-numbered words.
 * The original manuscript supplies no selector linking these operations.
 *
 * No writes, random search, tuning, guessed ciphertext key or phase search.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words, physicalLP2Page} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..", "resources", "liber-primus");
const original = fs.readFileSync(path.join(ROOT, "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "lp2-corpus.json"), "utf8"));
const marks = JSON.parse(fs.readFileSync(
  path.join(ROOT, "lp2-punctuation-identity.json"), "utf8"));

/** @param {string[]} symbols */
function ioc(symbols) {
  const frequency = new Map();
  for (const symbol of symbols) {
    frequency.set(symbol, (frequency.get(symbol) || 0) + 1);
  }
  return [...frequency.values()].reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {Array<{runes:string}>} words */
function pamersiel(words) {
  return words.map(word => [...word.runes][0]);
}

/** @param {Array<{runes:string}>} words */
function padiel(words) {
  const letters = [];
  for (let word = 1; word < words.length; word += 2) {
    const runes = [...words[word].runes];
    for (let position = 1; position < runes.length; position += 2) {
      letters.push(runes[position]);
    }
  }
  return letters;
}

/** @param {string[]} letters */
function translit(letters) {
  return letters.map(x => {
    const n = corpus.runes.indexOf(x);
    assert.ok(n >= 0);
    return corpus.translit[n];
  }).join("-");
}

function run() {
  const parsed = parseLP2Words(original, 55);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.crossPageWords, 32);
  const originalTape = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices.map(i => corpus.runes[i])).join("");
  assert.equal(parsed.words.map(word => word.runes).join(""), originalTape);

  const initialTape = pamersiel(parsed.words);
  const alternatingTape = padiel(parsed.words);
  assert.equal(initialTape.length, 2896);
  assert.equal(alternatingTape.length, 2846);
  assert.ok(Math.abs(ioc(initialTape) - 0.03442208418019256) < 1e-12);
  assert.ok(Math.abs(ioc(alternatingTape) - 0.0346002838133748) < 1e-12);

  const chapterPages = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
  const expectedChapterWords = [158, 255, 383, 437, 224, 326, 378, 669, 66];
  const chapters = [];
  for (let i = 0; i + 1 < chapterPages.length; i++) {
    const from = chapterPages[i], to = chapterPages[i + 1];
    const words = parsed.words.filter(word => {
      const page = physicalLP2Page(word.startPage);
      return page >= from && page < to;
    });
    assert.equal(words.length, expectedChapterWords[i]);
    const first = pamersiel(words);
    const second = padiel(words);
    chapters.push({pages: from + "-" + (to - 1), words: words.length,
      pamersielLength: first.length, pamersielIoC: ioc(first),
      padielLength: second.length, padielIoC: ioc(second)});
  }
  assert.equal(chapters.reduce((sum, chapter) => sum + chapter.words, 0), 2896);

  const large = marks.events.filter(event => event.symbol === "⁜");
  assert.equal(large.length, 31);
  assert.equal(large.filter(event => event.large_mark.dot_count === 13).length, 28);
  assert.equal(large.filter(event => event.large_mark.dot_count === 10).length, 3);
  const offsets = large.map(event => event.rune_offset);
  assert.equal(new Set(offsets).size, 29);
  assert.deepEqual(
    [...new Set(offsets.filter((value, i) => offsets.indexOf(value) !== i))],
    [1860, 3603]);
  assert.equal(offsets[offsets.length - 1], 12956);
  const markNext = large.map(event =>
    originalTape[event.rune_offset] || null);

  const all = parseLP2Words(original, 57);
  assert.equal(all.runeCount, 13136);
  assert.equal(all.words.length, 2941);
  const p57 = all.words.filter(word =>
    physicalLP2Page(word.startPage) === 57);
  const p57Tape = p57.map(word => word.runes).join("");
  assert.equal(p57Tape, corpus.pages.find(p => p.page === 57)
    .indices.map(i => corpus.runes[i]).join(""));
  const clear57 = [...p57Tape];
  assert.ok(Math.abs(ioc(clear57) - 0.06270997) < 1e-7);
  return {
    sourceRuneCount: parsed.runeCount,
    printedWords: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    markCount: large.length,
    dotCounts: {thirteen: 28, ten: 3},
    duplicateMarkOffsets: [1860, 3603],
    lastMarkAtEnd: offsets[offsets.length - 1],
    original: {
      pamersiel: {length: initialTape.length, ioc: ioc(initialTape),
        opening: translit(initialTape.slice(0, 40))},
      padiel: {length: alternatingTape.length, ioc: ioc(alternatingTape),
        opening: translit(alternatingTape.slice(0, 40))},
    },
    controls: {clear57Runes: clear57.length, clear57IoC: ioc(clear57)},
    markNext: translit(markNext.filter(Boolean)),
    chapters,
    decision: "Neither original direct first-letter nor alternating extraction yields native GP plaintext. The exact 31-event count does not select which of the 31 historical modes applies."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, pamersiel, padiel, ioc};
