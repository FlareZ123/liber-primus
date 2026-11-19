"use strict";

/**
 * Agent17 SFT: use only the three established line-wrap H source-register runs
 * (p32 0..4, p24 9..15, p55 16..26) as two-word H-sum key boundaries for
 * the untouched p0 red 8+5 title. Search the authenticated/solved lexical
 * control for any compatible 8+5 plaintext pair without naming a target.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const M = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number[]} values @returns {number[]} */
function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number[]} values @returns {number} */
function hsum(values) {
  return mod29(H(values).reduce((sum, value) => sum + value, 0));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p0 = JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} text @returns {number[]} */
function gp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const out = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const signedLabels = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedLabels.length, 43);

const lexicon = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    const label = values.map((value) => corpus.translit[value]).join("");
    lexicon.set(values.join(","), {label, values, source:"solved"});
  }
}
for (const label of signedLabels) {
  const values = gp(label);
  lexicon.set(values.join(","), {label, values, source:"signed2016"});
}
const words = [...lexicon.values()];
assert.equal(words.length, 295);

const red = p0.physical_zero_based.red_words.map((word) => word.gp_indices);
assert.deepEqual(red.map((word) => word.length), [8,5]);
const cipherSums = red.map(hsum);
assert.deepEqual(cipherSums, [1,13]);

// Frozen before this experiment: the three same-operation source-register
// line-wrap H runs already promoted in the repository.
const runs = [
  {name:"p32-middle", start:0, end:4},
  {name:"p24-word37", start:9, end:15},
  {name:"p55-word7", start:16, end:26},
];

const rows = runs.map((run) => {
  const keySums = [run.start, run.end + 1];
  const plainSums = cipherSums.map((value, index) => mod29(value - keySums[index]));
  const left = words.filter((word) => word.values.length === 8 && hsum(word.values) === plainSums[0]);
  const right = words.filter((word) => word.values.length === 5 && hsum(word.values) === plainSums[1]);
  const pairs = [];
  for (const a of left) {
    for (const b of right) {
      pairs.push({
        labels:[a.label,b.label],
        sources:[a.source,b.source],
      });
    }
  }
  return {
    ...run,
    sourceWords:[
      signedLabels[run.start],
      run.end + 1 < signedLabels.length ? signedLabels[run.end + 1] : null,
    ],
    keySums,
    plainSums,
    leftMatches:left.map((word)=>({label:word.label,source:word.source})),
    rightMatches:right.map((word)=>({label:word.label,source:word.source})),
    pairCount:pairs.length,
    pairs,
  };
});

console.log(JSON.stringify({
  status:"PASS",
  cipherSums,
  runs:rows,
}, null, 2));
