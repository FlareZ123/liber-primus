#!/usr/bin/env node
"use strict";
/**
 * Original LP2 DH/BASE29 page-ending discrimination under one fixed 76-rune
 * window and original printed word-fragment convention.
 * node sims/lp2_p55_dh_terminal76_allpage_control_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const printedPages = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
).split("%");
assert.equal(printedPages.length, 57);
const runes = corpus.runes, valid = new Set(runes);

/** @param {number} page LP2 physical page */
function fragments(page) {
  if (page === 50) return [];
  const slot = page < 50 ? page : page - 1;
  return printedPages[slot].replaceAll("/", "").replace(/\s/g, "")
    .split(/[-.&$§]/)
    .map(part => [...part].filter(x => valid.has(x)).map(x => runes.indexOf(x)))
    .filter(part => part.length > 0);
}
/** @param {number[]} digits @param {number} m */
function base29Mod(digits, m) {
  return digits.reduce((n, d) => (n * 29 + d) % m, 0);
}
/** @param {number[][]} words */
function splitRegisters(words) {
  const outer = [], inner = [];
  for (const word of words) {
    outer.push(word[0]);
    if (word.length > 1) outer.push(word[word.length - 1]);
    inner.push(...word.slice(1, -1));
  }
  return { outer, inner };
}
function modpow(a, b, m) {
  let v = 1;
  while (b-- > 0) v = v * a % m;
  return v;
}
assert.equal(base29Mod([3, 26, 24], 3302), 3301);
assert.deepEqual([modpow(5, 13, 23), modpow(5, 6, 23),
  modpow(21, 6, 23), modpow(8, 13, 23)], [21, 8, 18, 18]);

const tuple = [21, 6, 18];
const controls = [];
for (let page = 0; page <= 55; page++) {
  const words = fragments(page);
  const flat = words.flat();
  assert.deepEqual(flat, corpus.pages.find(x => x.page === page).indices,
    "Original transcription mismatch at physical page " + page);
  if (flat.length < 76) continue;
  const start = flat.length - 76;
  let offset = 0;
  const tail = [];
  for (const word of words) {
    const end = offset + word.length;
    if (end > start) tail.push(word.slice(Math.max(0, start - offset)));
    offset = end;
  }
  assert.deepEqual(tail.flat(), flat.slice(-76));
  const { outer, inner } = splitRegisters(tail);
  const values = [base29Mod(outer, 23),
    base29Mod(inner, 22), base29Mod(tail.flat(), 23)];
  controls.push({ page, wordFragments: tail.length,
    outerLength: outer.length, innerLength: inner.length, values,
    matchingComponents: values.filter((value, i) => value === tuple[i]).length });
}
assert.equal(controls.length, 54);
const p55 = controls.find(x => x.page === 55);
assert.deepEqual(p55, { page: 55, wordFragments: 17,
  outerLength: 33, innerLength: 43,
  values: tuple, matchingComponents: 3 });
assert.deepEqual(controls.filter(x => x.matchingComponents === 3)
  .map(x => x.page), [55]);
assert.equal(controls.filter(x => x.matchingComponents === 2).length, 0);

const p54 = fragments(54).flat(), p55words = fragments(55);
const carry = [...p54.slice(-10), ...p55words[0]];
assert.equal(carry.length, 11);
const fullWord = splitRegisters([carry, ...p55words.slice(1)]);
assert.deepEqual([fullWord.outer.length, fullWord.inner.length,
  base29Mod(fullWord.outer, 23), base29Mod(fullWord.inner, 22)], [34, 52, 4, 9]);

console.log(JSON.stringify({
  verdict: "postselected p55 numerical association, not a recovered LP2 key/plaintext",
  frozenTarget: { visual: { g: 5, p: 23, a: 13, filledDots: 8,
    hollowDots: 2 }, dh: { A: 21, b: 6, B: 8, K: 18 } },
  terminal76Page55: p55,
  independentOriginalPageEndControls: {
    totalEligiblePages: controls.length,
    completeTupleMatches: controls.filter(x => x.matchingComponents === 3)
      .map(x => x.page),
    twoComponentMatches: controls.filter(x => x.matchingComponents === 2)
      .map(x => x.page),
    oneComponentMatches: controls.filter(x => x.matchingComponents === 1)
      .map(x => x.page)
  },
  fullCarriedWordControl: { outerLength: 34, innerLength: 52,
    outerMod23: 4, innerMod22: 9 }
}, null, 2));
