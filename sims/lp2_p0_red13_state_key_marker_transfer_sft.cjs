"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");

const M = 29;
const stateKey = [26,24,8,19,27,24,18,3,0,8,0,16,19];
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const mod29 = (value) => ((value % M) + M) % M;
const transliterate = (values) => values.map((value) => corpus.translit[value]).join("");

function gp(word) {
  const normalized = word
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function runeWords(source) {
  const words = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const phraseRows = [];
function addThirteenRunePhrases(words, source, labels = null) {
  for (let start = 0; start < words.length; start += 1) {
    let values = [];
    for (let end = start; end < words.length; end += 1) {
      values = values.concat(words[end]);
      if (values.length === 13) {
        phraseRows.push({
          source,
          start,
          end,
          values,
          label: labels ? labels.slice(start, end + 1).join(" ") : null,
        });
        break;
      }
      if (values.length > 13) break;
    }
  }
}

const clear = signedSource
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");
const signedLabels = clear
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => word.toUpperCase());
const signedWords = signedLabels.map(gp);
addThirteenRunePhrases(signedWords, "signed2016", signedLabels);

for (const section of solved.sections) {
  addThirteenRunePhrases(runeWords(section.source_text), section.name);
}

const phraseMap = new Map();
for (const row of phraseRows) {
  const key = row.values.join(",");
  if (!phraseMap.has(key)) phraseMap.set(key, []);
  phraseMap.get(key).push(row);
}

const red13Markers = [];
for (const page of annotations.pages) {
  for (const marker of page.large_punctuation || []) {
    if (marker[1] === 13 && marker[2] === "red") {
      red13Markers.push({ page: page.page, offset: marker[0] });
    }
  }
}
assert.equal(red13Markers.length, 30);

const windows = [];
for (const marker of red13Markers) {
  const page = corpus.pages.find((candidate) => candidate.page === marker.page);
  assert.ok(page, "missing corpus page " + marker.page);
  for (const side of ["pre", "post"]) {
    const start = side === "pre" ? marker.offset - 13 : marker.offset;
    if (start < 0 || start + 13 > page.indices.length) continue;
    const cipher = page.indices.slice(start, start + 13);
    const plain = cipher.map((value, index) => mod29(value - stateKey[index]));
    const matches = phraseMap.get(plain.join(",")) || [];
    windows.push({ page: marker.page, offset: marker.offset, side, start, cipher, plain, matches });
  }
}

assert.equal(windows.filter((row) => row.side === "pre").length, 24);
assert.equal(windows.filter((row) => row.side === "post").length, 20);
assert.equal(windows.length, 44);
assert.equal(phraseRows.length, 187);
assert.equal(phraseMap.size, 175);

const exactHits = windows.filter((row) => row.matches.length > 0);
assert.equal(exactHits.length, 1);
assert.equal(exactHits[0].page, 0);
assert.equal(exactHits[0].offset, 13);
assert.equal(exactHits[0].side, "pre");
assert.equal(exactHits[0].start, 0);
assert.equal(exactHits[0].matches.length, 1);
assert.equal(exactHits[0].matches[0].source, "signed2016");
assert.equal(exactHits[0].matches[0].label, "EPIPHANY SEEKS");
assert.deepEqual(exactHits[0].plain, [...signedWords[5], ...signedWords[6]]);

const interval = signedWords.slice(1, 14);
assert.equal(interval.length, 13);
assert.deepEqual(signedLabels.slice(1, 14), [
  "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY",
]);

function interleavedH(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}
const projections = {
  index: interval.map((_, index) => index + 1),
  length: interval.map((word) => word.length),
  first: interval.map((word) => word[0]),
  last: interval.map((word) => word.at(-1)),
  gp0: interval.map((word) => mod29(word.reduce((sum, value) => sum + value, 0))),
  hsum: interval.map((word) => mod29(interleavedH(word).reduce((sum, value) => sum + value, 0))),
  hfirst: interval.map((word) => interleavedH(word)[0]),
  hlast: interval.map((word) => interleavedH(word).at(-1)),
};
for (const values of Object.values(projections)) {
  assert.notDeepEqual(values, stateKey);
}

console.log(JSON.stringify({
  status: "PASS",
  fixedKey: stateKey,
  red13: {
    markerCount: red13Markers.length,
    eligiblePre: 24,
    eligiblePost: 20,
    windows: windows.length,
  },
  sourceControl: {
    phraseOccurrences: phraseRows.length,
    distinctPhraseVectors: phraseMap.size,
  },
  exactHits: exactHits.map((row) => ({
    page: row.page,
    markerOffset: row.offset,
    side: row.side,
    start: row.start,
    plaintext: transliterate(row.plain),
    source: row.matches[0].source,
    label: row.matches[0].label,
  })),
  theWayInterval: signedLabels.slice(1, 14),
  classification: "The exact p0 13-rune state key has no second authenticated/solved 13-rune phrase hit on any natural 13-rune window immediately before or after a red 13-dot marker. The sole hit is the original p0 title -> EPIPHANY SEEKS. This localizes the key and rejects unchanged marker-adjacent transfer as its provenance. THE1..WAY13 remains a source-visible 13-word ordering clue, but the tested simple per-word projections do not reproduce the key schedule.",
}, null, 2));
