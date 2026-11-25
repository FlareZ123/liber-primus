"use strict";

// Source-motivated direct-difference test for the 29-symbol GP alphabet.
// The 28 nonzero residues are the 28 allowed successor differences; zero
// differences are exactly repeated ciphertext pairs and correspond to F=0.
// Test only the four explicitly motivated semantics: page reset/carry and
// retain/skip transparent F. Word boundaries never reset state.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const donor = JSON.parse(fs.readFileSync(
  path.join(root, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));
const pages = corpus.pages.filter(page => page.page <= 49 || (page.page >= 51 && page.page <= 55));
const alphabet = corpus.translit;
const runeIndex = new Map(donor.runes.map((rune, index) => [rune, index]));

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}
function preview(values, count = 220) {
  return values.slice(0, count).map(value => alphabet[value]).join("");
}
function pageReset() {
  const out = [];
  for (const page of pages) {
    const runes = page.indices;
    for (let i = 0; i < runes.length; i++) {
      out.push(i === 0 ? runes[i] : (runes[i] - runes[i - 1] + 29) % 29);
    }
  }
  return out;
}
function continuousCarry() {
  const out = [];
  let previous = null;
  for (const page of pages) {
    for (const rune of page.indices) {
      out.push(previous === null ? rune : (rune - previous + 29) % 29);
      previous = rune;
    }
  }
  return out;
}

const reset = pageReset();
const carry = continuousCarry();
const resetSkipF = reset.filter(value => value !== 0);
const carrySkipF = carry.filter(value => value !== 0);
const native = donor.sections.flatMap(section =>
  [...section.source_text].filter(rune => runeIndex.has(rune)).map(rune => runeIndex.get(rune)));
const nativeIoc = ioc(native);
const variants = [
  {name:"page-reset / retain F", values:reset},
  {name:"continuous page carry / retain F", values:carry},
  {name:"page-reset / skip transparent F", values:resetSkipF},
  {name:"continuous page carry / skip transparent F", values:carrySkipF}
].map(variant => ({
  name:variant.name,
  symbols:variant.values.length,
  zeroCount:variant.values.filter(value => value === 0).length,
  ioc:ioc(variant.values),
  preview:preview(variant.values)
}));

assert.equal(pages.length, 55);
assert.equal(reset.length, 12956);
assert.equal(carry.length, 12956);
assert.equal(reset.filter(value => value === 0).length, 88);
assert.equal(carry.filter(value => value === 0).length, 86);
assert.equal(resetSkipF.length, 12868);
assert.equal(carrySkipF.length, 12870);
assert.equal(native.length, 2979);
assert(nativeIoc > 0.06);
assert(variants.every(variant => variant.ioc < 0.04));

console.log(JSON.stringify({
  hypothesis:"Plaintext is the direct GP29 modular difference C[i]-C[i-1] mod 29; zero is transparent F.",
  semantics:{
    words:"continuous carry; no word resets",
    page:"compare one seed per page against one seed for the whole stream",
    F:"compare retaining zero/F against skipping zero/F"
  },
  source:{pages:pages.length,runes:reset.length,ciphertextRepeatedTransitions:86,pageHeadFSeeds:2},
  nativeControl:{source:"resources/external/relikd-solved-gp29-native-v1.json",symbols:native.length,ioc:nativeIoc},
  uniformIoc:1/29,
  variants,
  conclusion:"All four direct-difference/F semantics have near-uniform IoC (<0.04) versus source-native solved GP29 IoC >0.06; no readable plaintext. This rejects the direct modular-difference interpretation only."
}, null, 2));
