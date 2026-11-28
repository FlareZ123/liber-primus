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

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const found = new Map();
  /** @param {number[]} prefix @param {number[]} rest */
  function visit(prefix, rest) {
    if (!rest.length) {
      found.set(prefix.join(","), prefix.slice());
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(prefix.concat(rest[index]), rest.slice(0, index).concat(rest.slice(index + 1)));
    }
  }
  visit([], values);
  return [...found.values()];
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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const sourceWords = clear.slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((label, index) => ({ index, label: label.toUpperCase(), gp: gp(label) }));
assert.equal(sourceWords.length, 43);

const sourceLengths = sourceWords.map((word) => word.gp.length);
const sourceGp0 = sourceWords.map((word) => mod29(sum(word.gp)));

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const canonicalWords = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

function flush() {
  if (!current.length) return;
  canonicalWords.push({
    page: startPage,
    endPage,
    start: startOffset,
    end: startOffset + current.length - 1,
    values: current.slice(),
    len: current.length,
    gp0: mod29(sum(current)),
  });
  current = [];
}

for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) {
        startPage = page;
        startOffset = offset;
      }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
  assert.equal(offset, corpus.pages[page].indices.length);
}
flush();

const canonical = canonicalWords.filter((word) => word.page === word.endPage);
assert.equal(canonical.length, 2864);

/** @param {number} page @returns {{page:number,endPage:number,start:number,end:number,values:number[],len:number,gp0:number}[]} */
function pageWords(page) {
  return canonical.filter((word) => word.page === page);
}

const p6 = pageWords(6);
const titleStarts = [71, 75, 76, 80];
const title = titleStarts.map((start) => {
  const word = p6.find((candidate) => candidate.start === start);
  assert.ok(word, "missing p6 title word at " + start);
  return word;
});
const titleLengths = title.map((word) => word.len);
assert.deepEqual(titleLengths, [4, 1, 4, 2]);
const titleH = h4(titleLengths);
assert.deepEqual(titleH, [2, 26, 5, 6]);

const K = titleH[0];
const e = mod29(-titleH[1]);
const g = titleH[2];
const a = titleH[3];
const q = Math.max(...titleLengths);
const F = 0;
const b = mod29(-title[0].values[2]);
const p = mod29(-a);
assert.deepEqual({ p, g, a, b, K, e, q, F }, { p: 23, g: 5, a: 6, b: 15, K: 2, e: 3, q: 4, F: 0 });

const p6LineCounts = parts[6].split("\n")
  .map((line) => [...line].filter((char) => runeIndex.has(char)).length)
  .filter((count) => count > 0);
assert.deepEqual(p6LineCounts, [20, 24, 24, 3, 18, 19, 20, 24, 22, 22]);
const terminalTitleRune = title.at(-1).values.at(-1);
const finalLineWidth = p6LineCounts.at(-1);
const edgePacket = [title[0].len, title.at(-1).len, terminalTitleRune, finalLineWidth];
assert.deepEqual(edgePacket, [q, K, a * K, p - 1]);
assert.deepEqual(edgePacket, [4, 2, 12, 22]);

const aritySchedule = [e, q, K, g, q, q, a, g, q, a, g + K];
assert.deepEqual(sourceLengths.slice(32, 43), aritySchedule);
assert.deepEqual(sourceWords.slice(32).map((word) => word.label), [
  "YOU", "WILL", "BE", "FOUND", "GOOD", "LUCK",
  "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

const q1Patterns = permutations([K, e, q, g]);
const q3Patterns = permutations([q, q, g, a]);
const k4Patterns = permutations([a, g + K]);
assert.deepEqual([q1Patterns.length, q3Patterns.length, k4Patterns.length], [24, 12, 2]);
const printedPatternSet = new Set();
for (const q1 of q1Patterns) {
  for (const q3 of q3Patterns) {
    for (const k4 of k4Patterns) {
      printedPatternSet.add([...q1, q, ...q3, ...k4].join(","));
    }
  }
}
assert.equal(printedPatternSet.size, 576);
const printedHits = [];
for (let start = 0; start <= sourceWords.length - 11; start += 1) {
  const vector = sourceLengths.slice(start, start + 11);
  if (printedPatternSet.has(vector.join(","))) printedHits.push(start);
}
assert.deepEqual(printedHits, [32]);

const roles = [
  { name: "Q1", width: 4, patterns: q1Patterns },
  { name: "ONE", width: 1, patterns: [[q]] },
  { name: "Q3", width: 4, patterns: q3Patterns },
  { name: "K4", width: 2, patterns: k4Patterns },
];
const roleOrders = permutations([0, 1, 2, 3]);
const roleOrderHits = [];
for (const order of roleOrders) {
  for (let start = 0; start <= sourceWords.length - 11; start += 1) {
    let cursor = start;
    let matches = true;
    for (const roleIndex of order) {
      const role = roles[roleIndex];
      const actual = sourceLengths.slice(cursor, cursor + role.width).join(",");
      if (!role.patterns.some((pattern) => pattern.join(",") === actual)) {
        matches = false;
        break;
      }
      cursor += role.width;
    }
    if (matches) roleOrderHits.push({ start, order: order.map((roleIndex) => roles[roleIndex].name) });
  }
}
assert.deepEqual(roleOrderHits, [
  { start: 32, order: ["Q1", "ONE", "Q3", "K4"] },
  { start: 32, order: ["Q1", "Q3", "ONE", "K4"] },
]);
const labeledArityConfigurations = 33 * roleOrders.length * q1Patterns.length * q3Patterns.length * k4Patterns.length;
assert.equal(labeledArityConfigurations, 456192);

const q1Lengths = sourceLengths.slice(32, 36);
const q3Lengths = sourceLengths.slice(37, 41);
const qLengthDelta = q3Lengths.map((value, index) => value - q1Lengths[index]);
assert.deepEqual(q1Lengths, [e, q, K, g]);
assert.deepEqual(q3Lengths, [q, a, g, q]);
assert.deepEqual(qLengthDelta, [1, K, e, -1]);

const q1SourceGp0 = sourceGp0.slice(32, 36);
const q3SourceGp0 = sourceGp0.slice(37, 41);
const qSourceGp0Delta = q3SourceGp0.map((value, index) => mod29(value - q1SourceGp0[index]));
assert.deepEqual(q1SourceGp0, [1, 28, 6, 7]);
assert.deepEqual(q3SourceGp0, [K, 1, 19, p + K]);
assert.deepEqual(qSourceGp0Delta, [1, K, b - K, p - g]);

const pageArities = new Map([
  [32, e], [33, q], [34, K], [35, g],
  [37, q], [38, a], [39, g], [40, q],
]);

/**
 * @param {number} page
 * @returns {{start:number,end:number,nwords:number,values:number[],gp0:number}[]}
 */
function arityCandidates(page) {
  const words = pageWords(page);
  const targetLength = pageArities.get(page);
  assert.ok(targetLength, "missing arity for page " + page);
  const found = [];
  for (let left = 0; left < words.length; left += 1) {
    const values = [];
    for (let right = left; right < words.length; right += 1) {
      values.push(...words[right].values);
      if (values.length === targetLength) {
        found.push({
          start: words[left].start,
          end: words[right].end,
          nwords: right - left + 1,
          values: values.slice(),
          gp0: mod29(sum(values)),
        });
        break;
      }
      if (values.length > targetLength) break;
    }
  }
  return found;
}

const pools = new Map([...pageArities.keys()].map((page) => [page, arityCandidates(page)]));
assert.deepEqual(
  Object.fromEntries([...pools].map(([page, candidates]) => [page, candidates.length])),
  { 32: 3, 33: 10, 34: 10, 35: 16, 37: 14, 38: 8, 39: 11, 40: 16 }
);

/** @param {number} page @param {number} start */
function receiver(page, start) {
  const row = pools.get(page).find((candidate) => candidate.start === start);
  assert.ok(row, "missing receiver p" + page + " start" + start);
  return row;
}

const q3Receivers = [receiver(37, 146), receiver(38, 57), receiver(39, 132), receiver(40, 71)];
assert.deepEqual(q3Receivers.map((row) => row.gp0), [9, 1, 18, 25]);
const q1Receivers = [receiver(32, 30), receiver(33, 132), receiver(34, 4), receiver(35, 25)];
assert.deepEqual(q1Receivers.map((row) => row.gp0), [5, 28, 6, 3]);
const receiverGp0Delta = q3Receivers.map((row, index) => mod29(row.gp0 - q1Receivers[index].gp0));
assert.deepEqual(receiverGp0Delta, edgePacket);

const requiredQ1Gp0 = q3Receivers.map((row, index) => mod29(row.gp0 - edgePacket[index]));
assert.deepEqual(requiredQ1Gp0, [5, 28, 6, 3]);
const predictedQ1 = [32, 33, 34, 35].map((page, index) =>
  pools.get(page).filter((candidate) => candidate.gp0 === requiredQ1Gp0[index])
);
assert.deepEqual(predictedQ1.map((rows) => rows.map((row) => row.start)), [
  [1, 30], [132], [4, 249], [25],
]);
assert.deepEqual(predictedQ1.map((rows) => rows.length), [2, 1, 2, 1]);
assert.equal(predictedQ1[3][0].nwords, 2);

const packetVariants = [];
for (const permutation of permutations(edgePacket)) {
  for (const direction of [1, -1]) {
    const delta = permutation.map((value) => mod29(direction * value));
    const counts = [32, 33, 34, 35].map((page, index) => {
      const required = mod29(q3Receivers[index].gp0 - delta[index]);
      return pools.get(page).filter((candidate) => candidate.gp0 === required).length;
    });
    packetVariants.push({ permutation, direction, delta, counts, joint: counts.reduce((product, count) => product * count, 1) });
  }
}
assert.equal(packetVariants.length, 48);
const viableVariants = packetVariants.filter((variant) => variant.joint > 0);
assert.deepEqual(viableVariants, [
  { permutation: [4, 2, 12, 22], direction: 1, delta: [4, 2, 12, 22], counts: [2, 1, 2, 1], joint: 4 },
  { permutation: [4, 12, 2, 22], direction: 1, delta: [4, 12, 2, 22], counts: [2, 1, 1, 1], joint: 2 },
]);

const alternative = viableVariants[1];
const alternativeStarts = [32, 33, 34, 35].map((page, index) => {
  const required = mod29(q3Receivers[index].gp0 - alternative.delta[index]);
  return pools.get(page).filter((candidate) => candidate.gp0 === required).map((candidate) => candidate.start);
});
assert.deepEqual(alternativeStarts, [[1, 30], [185], [105], [25]]);

const q1KeySums = q1Receivers.map((row, index) => mod29(row.gp0 - q1SourceGp0[index]));
const q3KeySums = q3Receivers.map((row, index) => mod29(row.gp0 - q3SourceGp0[index]));
const keySumDelta = q3KeySums.map((value, index) => mod29(value - q1KeySums[index]));
assert.deepEqual(q1KeySums, [q, F, F, p + K]);
assert.deepEqual(q3KeySums, [g + K, F, 28, F]);
assert.deepEqual(keySumDelta, [e, F, 28, q]);

console.log(JSON.stringify({
  status: "PASS",
  p6: { titleLengths, titleH, edgePacket, lineCounts: p6LineCounts },
  aritySchedule,
  printedArityFamily: { patterns: printedPatternSet.size, sourceWindows: 33, hits: printedHits },
  allBlockRoleCharge: { labeledConfigurations: labeledArityConfigurations, hits: roleOrderHits },
  qBlockSourceRelations: { q1Lengths, q3Lengths, qLengthDelta, q1SourceGp0, q3SourceGp0, qSourceGp0Delta },
  receiverPools: Object.fromEntries([...pools].map(([page, candidates]) => [page, candidates.length])),
  q3AnchorGp0: q3Receivers.map((row) => row.gp0),
  q1PredictedGp0: requiredQ1Gp0,
  q1PredictedStarts: predictedQ1.map((rows) => rows.map((row) => row.start)),
  edgePacketVariantCount: packetVariants.length,
  viablePacketVariants: viableVariants,
  keySumDelta,
}, null, 2));
