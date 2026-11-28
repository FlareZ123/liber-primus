"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const inkAnnotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} shell @returns {number[]} */
function h4Inverse(shell) {
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/** @param {number} left @param {number} right @returns {number[]} */
function h2(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((label, index) => ({
    index,
    label: label.toUpperCase(),
    gp: gp(label),
  }));
assert.equal(signed.length, 43);

// Source-index/page-index charge: a signed word's raw GP0 is treated only as
// a candidate local address on the same numbered page. Among indices 0..42
// that page contains red text, SEEKS6 is the sole GP0 that equals a red-span start.
const signedRedStartMatches = [];
const signedPagesWithRed = [];
for (const sourceWord of signed.filter((word) => word.index <= 42)) {
  const pageInk = inkAnnotations.pages.find((page) => page.page === sourceWord.index);
  const redStarts = (pageInk?.red_spans || []).map((span) => span.start);
  if (redStarts.length === 0) continue;
  const gp0 = sum(sourceWord.gp);
  signedPagesWithRed.push({ index: sourceWord.index, label: sourceWord.label, gp0, redStarts });
  for (const start of redStarts) {
    if (gp0 === start) {
      signedRedStartMatches.push({ index: sourceWord.index, label: sourceWord.label, gp0, start });
    }
  }
}
assert.equal(signedPagesWithRed.length, 11);
assert.deepEqual(signedRedStartMatches, [{
  index: 6,
  label: "SEEKS",
  gp0: 71,
  start: 71,
}]);

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const words = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

/** Flush the current printed word. */
function flush() {
  if (current.length === 0) return;
  words.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
    len: current.length,
    gp0: sum(current),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const ch of parts[block]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (current.length === 0) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(ch)) {
      flush();
    }
  }
  assert.equal(offset, corpus.pages[page].indices.length);
}
flush();

assert.equal(words.length, 2896);
const canonical = words.filter((word) => word.page === word.endPage);
assert.equal(canonical.length, 2864);

/** @param {number} page */
function pageWords(page) {
  return canonical.filter((word) => word.page === page);
}
// Physical rune-line metadata, preserving original line breaks.
const physicalLinesByPage = new Map();
for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let pageOffset = 0;
  const lineRows = [];
  for (const [lineIndex, line] of parts[block].split("\n").entries()) {
    const count = [...line].filter((ch) => runeIndex.has(ch)).length;
    if (count === 0) continue;
    lineRows.push({ line: lineIndex + 1, start: pageOffset, end: pageOffset + count, count });
    pageOffset += count;
  }
  assert.equal(pageOffset, corpus.pages[page].indices.length);
  physicalLinesByPage.set(page, lineRows);
}

/** @param {{page:number,start:number}} word */
function physicalLineForWord(word) {
  const rows = physicalLinesByPage.get(word.page) || [];
  const row = rows.find((candidate) => candidate.start <= word.start && word.start < candidate.end);
  assert.ok(row, "missing physical line for page " + word.page + " offset " + word.start);
  return row;
}

/** @param {number[]} values */
function d4(values) {
  return [mod29(values[0] - values[3]), mod29(values[1] - values[2])];
}

const sourceFour = new Set();
for (let index = 0; index + 3 < signed.length; index += 1) {
  sourceFour.add(signed.slice(index, index + 4).map((word) => word.label).join(" "));
}

/** @param {number[]} indices */
function zeroRead(indices) {
  return indices.map((value) => signed[value].label).join(" ");
}

/** @param {number[]} indices */
function oneBasedMod29Read(indices) {
  return indices.map((value) => signed[(value === 0 ? 29 : value) - 1].label).join(" ");
}

let windows = 0;
const zeroHits = [];
const oneHits = [];
for (let page = 0; page < 56; page += 1) {
  const local = pageWords(page);
  for (let index = 0; index + 3 < local.length; index += 1) {
    windows += 1;
    const block = local.slice(index, index + 4);
    const raw = d4(block.map((word) => word.gp0))
      .concat(d4(block.map((word) => word.len)));
    const z = zeroRead(raw);
    const o = oneBasedMod29Read(raw);
    if (sourceFour.has(z)) zeroHits.push({ page, start: block[0].start, raw, text: z });
    if (sourceFour.has(o)) oneHits.push({ page, start: block[0].start, raw, text: o });
  }
}
assert.equal(windows, 2699);
assert.deepEqual(zeroHits, [{
  page: 28,
  start: 142,
  raw: [25, 26, 27, 1],
  text: "THEIR NUMBERS ARE THE",
}]);
assert.deepEqual(oneHits, []);

const p29 = pageWords(29);
assert.deepEqual(p29[28].values, [8, 15]);
assert.deepEqual(h2(...p29[28].values), [22, 23]);
assert.equal(signed[22].label + " " + signed[23].label, "THE ROAD");
assert.deepEqual(p29[29].values, [11, 26, 11, 18]);
assert.deepEqual(h4(p29[29].values), [22, 15, 8, 0]);

const p25Object = corpus.pages[25].indices.slice(144, 150);
assert.deepEqual(p25Object, [18, 3, 20, 10, 11, 16]);
assert.deepEqual(h2(p25Object[0], p25Object[5]), [2, 5]);
const transformed = p25Object.map((value, index) =>
  Number(BigInt(value) ** BigInt(index === 0 ? 3 : 27) % 29n)
);
assert.deepEqual(transformed, [3, 10, 16, 3, 8, 20]);
const cuts = Array.from({ length: 5 }, (_, index) => [
  sum(transformed.slice(0, index + 1)),
  sum(transformed.slice(index + 1)),
]);
assert.deepEqual(cuts, [[3,57],[13,47],[29,31],[32,28],[40,20]]);

const inRange = [...new Set(cuts.flat().filter((value) => value >= 1 && value <= 42))]
  .sort((left, right) => left - right);
assert.deepEqual(inRange, [3,13,20,28,29,31,32,40]);

const originRows = [];
for (const sourceOrigin of [0, 1]) {
  for (const pageOrigin of [0, 1]) {
    const hits = [];
    for (const value of inRange) {
      const sourceIndex = value - sourceOrigin;
      const page = value - pageOrigin;
      if (sourceIndex < 0 || sourceIndex >= signed.length || page < 0 || page >= 56) continue;
      const target = signed[sourceIndex];
      const matches = pageWords(page).filter((word) =>
        word.len === target.gp.length && word.gp0 === sum(target.gp)
      );
      if (matches.length > 0) {
        hits.push({ value, target: target.label, page, starts: matches.map((word) => word.start) });
      }
    }
    originRows.push({
      sourceOrigin,
      pageOrigin,
      hitIndices: hits.length,
      groups: hits.reduce((total, hit) => total + hit.starts.length, 0),
      hits,
    });
  }
}
assert.deepEqual(
  originRows.map((row) => [row.hitIndices, row.groups]),
  [[1,1],[3,5],[4,4],[0,0]]
);
assert.deepEqual(originRows[0].hits, [{
  value: 40,
  target: "PATHS",
  page: 40,
  starts: [71],
}]);

// Independent visual self-address charge. Every red span is tested against a
// complete canonical word beginning exactly at that span. P6 alone has first
// word GP0 equal to the span's own page-local start.
const redSpanAddressRows = [];
for (const pageInk of inkAnnotations.pages) {
  for (const span of pageInk.red_spans || []) {
    const atStart = pageWords(pageInk.page).filter((word) => word.start === span.start);
    redSpanAddressRows.push({
      page: pageInk.page,
      start: span.start,
      length: span.length,
      words: atStart.map((word) => ({ len: word.len, gp0: word.gp0 })),
    });
  }
}
assert.equal(redSpanAddressRows.length, 18);
assert.equal(redSpanAddressRows.filter((row) => row.words.length > 0).length, 16);
const selfAddressingRedSpans = redSpanAddressRows.filter((row) =>
  row.words.some((word) => word.gp0 === row.start)
);
assert.deepEqual(selfAddressingRedSpans, [{
  page: 6,
  start: 71,
  length: 11,
  words: [{ len: 4, gp0: 71 }],
}]);

const p6 = pageWords(6);
const title = [71, 75, 76, 80].map((start) => {
  const word = p6.find((candidate) => candidate.start === start);
  assert.ok(word, "missing p6 title word " + start);
  return word;
});
assert.deepEqual(title.map((word) => word.len), [4,1,4,2]);
assert.deepEqual(h4(title.map((word) => word.len)), [2,26,5,6]);
assert.deepEqual(title[0].values, [24,16,14,17]);
assert.equal(title[0].gp0, 71);
assert.equal(sum(signed[6].gp), 71);

const b = mod29(-title[0].values[2]);
const e = mod29(-h4(title.map((word) => word.len))[1]);
const A = 8;
const shell = [mod29(-b), A, e, mod29(-e)];
assert.deepEqual(shell, [14,8,3,26]);
const key = h4Inverse(shell);
assert.deepEqual(key, [20,20,12,6]);

const p40Matches = pageWords(40).filter((word) =>
  word.len === signed[40].gp.length && word.gp0 === sum(signed[40].gp)
);
assert.equal(p40Matches.length, 1);
assert.equal(p40Matches[0].start, 71);
assert.deepEqual(p40Matches[0].values, [4,15,14,21]);
const plain = p40Matches[0].values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plain, signed[40].gp);
assert.equal(signed[40].label, "PATHS");

// Source-literal p6 key charge: repeated physical line counts + red-title atoms.
const p6LineCounts = parts[6].split("\n")
  .map((line) => [...line].filter((ch) => runeIndex.has(ch)).length)
  .filter((count) => count > 0);
assert.deepEqual(p6LineCounts, [20,24,24,3,18,19,20,24,22,22]);
const lineFrequency = new Map();
for (const count of p6LineCounts) {
  lineFrequency.set(count, (lineFrequency.get(count) || 0) + 1);
}
const repeatedLineCounts = [...lineFrequency.entries()]
  .filter(([, count]) => count >= 2)
  .map(([value]) => value)
  .sort((left, right) => left - right);
assert.deepEqual(repeatedLineCounts, [20,22,24]);

// Tight source-only selector from original p6 physical/color layout.
// The red title is rune offsets71..81. Count black runes on each side,
// excluding those 11 red runes from the lower shared physical line.
let p6RuneOffset = 0;
const p6LineRegions = parts[6].split("\n").map((line) => {
  let before = 0;
  let red = 0;
  let after = 0;
  for (const ch of line) {
    if (!runeIndex.has(ch)) continue;
    if (p6RuneOffset < 71) before += 1;
    else if (p6RuneOffset < 82) red += 1;
    else after += 1;
    p6RuneOffset += 1;
  }
  return { before, red, after };
});
assert.equal(p6RuneOffset, corpus.pages[6].indices.length);
const upperLineCounts = p6LineRegions.map((line) => line.before).filter(Boolean);
const lowerLineCounts = p6LineRegions.map((line) => line.after).filter(Boolean);
assert.deepEqual(upperLineCounts, [20,24,24,3]);
assert.deepEqual(lowerLineCounts, [7,19,20,24,22,22]);

/** @param {number[]} values @param {number} target @returns {number} */
function occurrences(values, target) {
  return values.filter((value) => value === target).length;
}
const balancedCrossDividerCounts = [...new Set(upperLineCounts)]
  .filter((value) =>
    occurrences(upperLineCounts, value) === 1 &&
    occurrences(lowerLineCounts, value) === 1
  );
assert.deepEqual(balancedCrossDividerCounts, [20]);

// [4,1,4,2]=[q,1,q,K] makes W3/W4 the unique adjacent [q,K] pair.
// Its circumference is [6,12]; the same-line closing marker fixes the
// marked-edge orientation [12,6].
const qKAdjacent = [];
for (let index = 0; index + 1 < title.length; index += 1) {
  if (title[index].len === 4 && title[index + 1].len === 2) qKAdjacent.push(index);
}
assert.deepEqual(qKAdjacent, [2]);
const singletonPosition = 1;
assert.equal(title[singletonPosition].len, 1);
const terminalTitleRune = title[3].values[title[3].values.length - 1];
const firstRuneAfterSingleton = title[2].values[0];
const closingEdgeTail = [terminalTitleRune, firstRuneAfterSingleton];
assert.deepEqual(closingEdgeTail, [12,6]);
const sourceFixedKey = [
  balancedCrossDividerCounts[0],
  balancedCrossDividerCounts[0],
  ...closingEdgeTail,
];
assert.deepEqual(sourceFixedKey, [20,20,12,6]);

const titleAtoms = [...new Set(title.flatMap((word) => word.values))]
  .sort((left, right) => left - right);
assert.deepEqual(titleAtoms, [6,12,14,15,16,17,19,24,27]);

/** @param {number[]} values @returns {number[][]} */
function uniquePermutations(values) {
  const result = new Map();
  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (rest.length === 0) {
      result.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      const next = rest.slice();
      const value = next.splice(index, 1)[0];
      visit(prefix.concat(value), next);
    }
  }
  visit([], values);
  return [...result.values()];
}

const fixedLiteralKeys = new Map();
const permutedLiteralKeys = new Map();
for (const repeated of repeatedLineCounts) {
  for (const left of titleAtoms) {
    for (const right of titleAtoms) {
      const base = [repeated, repeated, left, right];
      fixedLiteralKeys.set(base.join(","), true);
      for (const candidate of uniquePermutations(base)) {
        permutedLiteralKeys.set(candidate.join(","), true);
      }
    }
  }
}
assert.equal(fixedLiteralKeys.size, 243);
assert.equal(permutedLiteralKeys.size, 1389);
assert.equal(
  [...permutedLiteralKeys.keys()]
    .map((keyText) => keyText.split(",").map(Number))
    .filter((candidate) => sum(candidate) % 29 === 0).length,
  52
);

const typedFourRunePairs = [];
for (const target of signed.filter((word) => word.gp.length === 4)) {
  for (let page = 0; page <= 42; page += 1) {
    const matches = pageWords(page).filter((word) =>
      word.len === 4 && word.gp0 === sum(target.gp)
    );
    if (matches.length === 1) {
      typedFourRunePairs.push({ target, page, receiver: matches[0] });
    }
  }
}
assert.equal(typedFourRunePairs.length, 62);

/** @param {Map<string, boolean>} family */
function literalKeyHits(family) {
  const hits = [];
  for (const pair of typedFourRunePairs) {
    for (const direction of ["sub", "add"]) {
      const candidateKey = pair.receiver.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - pair.target.gp[index])
          : mod29(pair.target.gp[index] - value)
      );
      if (family.has(candidateKey.join(","))) {
        hits.push({
          sourceIndex: pair.target.index,
          target: pair.target.label,
          page: pair.page,
          start: pair.receiver.start,
          direction,
          key: candidateKey,
        });
      }
    }
  }
  return hits;
}

const expectedLiteralHit = [{
  sourceIndex: 40,
  target: "PATHS",
  page: 40,
  start: 71,
  direction: "sub",
  key: [20,20,12,6],
}];
assert.deepEqual(literalKeyHits(fixedLiteralKeys), expectedLiteralHit);
assert.deepEqual(literalKeyHits(permutedLiteralKeys), expectedLiteralHit);
const sourceFixedFamily = new Map([[sourceFixedKey.join(","), true]]);
assert.deepEqual(literalKeyHits(sourceFixedFamily), expectedLiteralHit);

const adjacentCircumferenceKeys = new Map();
for (let index = 0; index + 1 < title.length; index += 1) {
  const printed = [20,20,title[index].values[0],
    title[index + 1].values[title[index + 1].values.length - 1]];
  adjacentCircumferenceKeys.set(printed.join(","), true);
  adjacentCircumferenceKeys.set([20,20,printed[3],printed[2]].join(","), true);
}
assert.equal(adjacentCircumferenceKeys.size, 6);
assert.deepEqual(literalKeyHits(adjacentCircumferenceKeys), expectedLiteralHit);

// Target-blind p6 address71 -> p40 receiver charge.
assert.equal(signed[6].label, "SEEKS");
assert.equal(sum(signed[6].gp), 71);
assert.equal(title[0].start, 71);
assert.equal(title[0].gp0, 71);
assert.equal(sum(upperLineCounts), 71);
assert.equal(upperLineCounts.length, 4);
assert.equal(lowerLineCounts.length, 6);
assert.equal(upperLineCounts.filter((value) => value === 20).length, 1);
assert.equal(lowerLineCounts.filter((value) => value === 20).length, 1);
assert.equal(20, 4 * 5);
assert.equal(terminalTitleRune, 6 * 2);

const p40Offset71 = pageWords(40).filter((word) => word.start === 71);
assert.equal(p40Offset71.length, 1);
assert.deepEqual(p40Offset71[0].values, [4,15,14,21]);
assert.deepEqual(
  p40Offset71[0].values.map((value, index) => mod29(value - sourceFixedKey[index])),
  signed[40].gp
);

// Charge simple title scalars before selecting 71.
const titleScalars = new Set([71,82]);
for (const word of title) {
  titleScalars.add(word.start);
  titleScalars.add(word.start + word.len);
  titleScalars.add(word.gp0);
  titleScalars.add(word.len);
}
assert.deepEqual([...titleScalars].sort((a,b) => a - b),
  [1,2,4,19,26,65,71,75,76,80,82]);
const p40FourRuneScalarStarts = [...titleScalars].filter((scalar) =>
  pageWords(40).some((word) => word.start === scalar && word.len === 4)
);
assert.deepEqual(p40FourRuneScalarStarts, [71]);

const signedFourRuneByGp = new Map();
for (const target of signed.filter((word) => word.gp.length === 4)) {
  const signature = target.gp.join(",");
  if (!signedFourRuneByGp.has(signature)) signedFourRuneByGp.set(signature, []);
  signedFourRuneByGp.get(signature).push({ index: target.index, label: target.label });
}
const offset71Words = canonical.filter((word) => word.start === 71);
assert.equal(offset71Words.length, 12);
const offset71FourRuneWords = offset71Words.filter((word) => word.len === 4);
assert.equal(offset71FourRuneWords.length, 5);
const packetReceiverCandidates = offset71FourRuneWords
  .map((word) => ({ word, line: physicalLineForWord(word) }))
  .filter(({ line }) => line.count === balancedCrossDividerCounts[0]);
assert.deepEqual(packetReceiverCandidates.map(({ word, line }) => ({
  page: word.page,
  start: word.start,
  len: word.len,
  lineCount: line.count,
  values: word.values,
})), [{
  page: 40,
  start: 71,
  len: 4,
  lineCount: 20,
  values: [4,15,14,21],
}]);
const packetReceiverPlain = packetReceiverCandidates[0].word.values.map((value, index) =>
  mod29(value - sourceFixedKey[index])
);
assert.deepEqual(packetReceiverPlain, signed[40].gp);
assert.equal(signed[40].label, "PATHS");

const offset71AuthenticatedHits = [];
for (const receiver of offset71FourRuneWords) {
  for (const direction of ["sub","add"]) {
    const output = receiver.values.map((value, index) =>
      direction === "sub"
        ? mod29(value - sourceFixedKey[index])
        : mod29(value + sourceFixedKey[index])
    );
    const targets = signedFourRuneByGp.get(output.join(",")) || [];
    for (const target of targets) {
      offset71AuthenticatedHits.push({
        page: receiver.page,
        start: receiver.start,
        direction,
        target,
        output,
      });
    }
  }
}
assert.deepEqual(offset71AuthenticatedHits, [{
  page: 40,
  start: 71,
  direction: "sub",
  target: { index: 40, label: "PATHS" },
  output: [13,24,2,15],
}]);

const p41Verify = pageWords(41).filter((word) =>
  word.len === signed[41].gp.length && word.gp0 === sum(signed[41].gp)
);
assert.deepEqual(p41Verify, []);
const p42OpenPgp = pageWords(42).filter((word) =>
  word.len === signed[42].gp.length && word.gp0 === sum(signed[42].gp)
);
assert.deepEqual(p42OpenPgp, []);

console.log(JSON.stringify({
  status: "PASS",
  p28Origin: { windows, zeroHits, oneHits },
  p29: {
    h2: [22,23],
    zeroText: "THE ROAD",
    h4: [22,15,8,0],
  },
  p25: { transformed, cuts, originRows },
  p40: { shell, key, receiver: p40Matches[0], plaintext: "PATHS" },
  signedRedAddressCharge: { signedPagesWithRed, signedRedStartMatches, redSpanAddressRows, selfAddressingRedSpans },
  p6LiteralKeyCharge: {
    lineCounts: p6LineCounts,
    repeatedLineCounts,
    titleAtoms,
    fixedKeyCount: fixedLiteralKeys.size,
    permutedKeyCount: permutedLiteralKeys.size,
    zeroSumPermutedKeyCount: 52,
    balancedCrossDividerCounts,
    upperLineCounts,
    lowerLineCounts,
    singletonPosition,
    terminalTitleRune,
    firstRuneAfterSingleton,
    closingEdgeTail,
    sourceFixedKey,
    adjacentCircumferenceKeyCount: adjacentCircumferenceKeys.size,
    adjacentCircumferenceHits: literalKeyHits(adjacentCircumferenceKeys),
    sourceFixedHits: literalKeyHits(sourceFixedFamily),
    titleScalars: [...titleScalars].sort((a,b) => a - b),
    p40FourRuneScalarStarts,
    offset71WordCount: offset71Words.length,
    offset71FourRuneWordCount: offset71FourRuneWords.length,
    packetReceiverCandidates: packetReceiverCandidates.map(({ word, line }) => ({
      page: word.page, start: word.start, len: word.len, lineCount: line.count, values: word.values,
    })),
    packetReceiverPlain,
    offset71AuthenticatedHits,
    hits: literalKeyHits(permutedLiteralKeys),
  },
  sealedTransfers: {
    p41VerifyStateMatches: p41Verify.length,
    p42OpenPgpStateMatches: p42OpenPgp.length,
  },
}, null, 2));
