"use strict";

/**
 * SFT: source-frozen 2013 Instar title as the exact plaintext at the beginning
 * of LP2 physical p27 red heading, under earlier Cicada GP29 cipher families.
 * Related frozen hypothesis: workplace/2013-instar-p27-wing-locked-crib.md
 * Run from repository root: node sims/p27_instar_title_source_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} rel @returns {any} */
const json = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const byToken = new Map(corpus.translit.map((s, i) => [s, i]));
const mod = (n) => (n % 29 + 29) % 29;

/** GP syllabification of the literal original 2013 MP3 title. */
const words = [
  ["TH", "E"], ["I", "N", "S", "T", "A", "R"],
  ["E", "M", "E", "R", "G", "E", "N", "C", "E"]
];
const plaintext = words.flat().map((s) => {
  assert(byToken.has(s), "No GP transliteration for " + s);
  return byToken.get(s);
});
assert.deepEqual(words.map((w) => w.length), [2, 6, 9]);
assert.equal(plaintext.length, 17);
const display = (runes) => runes.map((i) => corpus.translit[i]).join(" ");

/** @param {number} page @returns {{red:number[],pageRed:number[],runeCount:number}} */
function sourceRed(page) {
  const record = corpus.pages.find((x) => x.page === page);
  const sourceInk = ink.pages.find((x) => x.page === page);
  assert(record && sourceInk && sourceInk.red_spans.length);
  const first = sourceInk.red_spans[0];
  const runes = record.indices.slice(first.start, first.start + first.length);
  assert.equal(runes.length, first.length);
  assert.deepEqual(runes.map((i) => corpus.runes[i]).join(""), first.runes);
  return {red: runes.slice(0, plaintext.length), pageRed: runes,
    runeCount: record.runic_count};
}

/** Any additive repeating key of period <=14, with the original alignment. */
function periodic(table) {
  return Array.from({length: 14}, (_, i) => {
    const period = i + 1;
    let mismatch = 0;
    for (let j = period; j < table.length; j++) {
      if (table[j] !== table[j % period]) mismatch++;
    }
    return {period, mismatch, tested: table.length - period};
  });
}

/** @param {number} page @returns {object} */
function evaluate(page) {
  const {red, pageRed, runeCount} = sourceRed(page);
  assert.equal(red.length, 17);
  const keyPlus = red.map((c, i) => mod(c - plaintext[i]));
  const keyMinus = red.map((c, i) => mod(c + plaintext[i]));
  const plus = periodic(keyPlus);
  const minus = periodic(keyMinus);
  assert(plus.every((s) => s.mismatch > 0));
  assert(minus.every((s) => s.mismatch > 0));
  const atbash = red.filter((c, i) => c === mod(3 - plaintext[i])).length;
  const fixed = ["D", "I", "U", "I", "N", "I", "T", "Y"].map((s) => byToken.get(s));
  const divinityPlus = red.filter((c, i) => c === mod(plaintext[i] + fixed[i % fixed.length])).length;
  const divinityMinus = red.filter((c, i) => c === mod(plaintext[i] - fixed[i % fixed.length])).length;
  return {
    physicalPage: page, sourceRunes: runeCount, redLength: pageRed.length,
    redFirst17: display(red), heldoutRed: display(pageRed.slice(17, 19)),
    atbash3ExactRuneMatches: atbash,
    divinityPlusExactRuneMatches: divinityPlus,
    divinityMinusExactRuneMatches: divinityMinus,
    additiveKeyIfPlus: display(keyPlus),
    additiveKeyIfMinus: display(keyMinus),
    plusPeriods: plus, minusPeriods: minus
  };
}

const p27 = evaluate(27);
const wrongImageP53 = evaluate(53);
assert.equal(p27.redLength, 19);
assert.equal(wrongImageP53.redLength, 51);
assert.deepEqual([p27.atbash3ExactRuneMatches,
  p27.divinityPlusExactRuneMatches,p27.divinityMinusExactRuneMatches],[0,0,0]);
assert.deepEqual(
  [p27.plusPeriods[7].mismatch, p27.minusPeriods[7].mismatch],
  [9, 8]
);
console.log(JSON.stringify({
  decision: "Not an independently validated known plaintext crib under any direct periodic GP29 key length 1..14, GP Atbash+3 or phase0 DIVINITY",
  phrase: "THE INSTAR EMERGENCE",
  phraseGP: display(plaintext),
  phraseWordLengths: words.map((x) => x.length),
  p27HeadingOriginalWordLengths: [3, 12, 4],
  sourceMismatch: "Exact word breaks are inconsistent before decipherment",
  frozenOriginal: p27,
  wrongImageComparator: wrongImageP53,
  no_unknown_plaintext_recovered: true
}, null, 2));
