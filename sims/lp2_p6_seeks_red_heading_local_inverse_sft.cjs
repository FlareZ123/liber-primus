"use strict";

/**
 * Reproduce the p6 SEEKS red-heading local inverse and finite controls.
 * CommonJS, Node.js 22, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const signedSource = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}
/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}
/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21); offset += 3; continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27); offset += 2; continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}
/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}
/**
 * @returns {Array<{page:number,start:number,endPage:number,end:number,values:number[]}>}
 */
function parseWords() {
  let block = 0, page = 0, pageOffset = 0;
  let startPage = null, startOffset = null, runes = [];
  const words = [];
  const close = () => {
    if (runes.length === 0) return;
    words.push({
      page: startPage, start: startOffset, endPage: page, end: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null; startOffset = null; runes = [];
  };
  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page; startOffset = pageOffset;
      }
      runes.push(ch); pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "$" || ch === "&") {
      close();
    } else if (ch === "%") {
      block += 1; page = physicalPage(block); pageOffset = 0;
    }
  }
  close();
  return words;
}
/** @param {number[]} values @returns {number[]} */
function h(values) {
  const output = [...values];
  for (let left = 0; left < Math.floor(values.length / 2); left += 1) {
    const right = values.length - 1 - left;
    output[left] = mod29(values[left] - values[right]);
    output[right] = mod29(values[left] + values[right]);
  }
  return output;
}
/** @param {number[]} shell @returns {number[]} */
function hInverse(shell) {
  const output = [...shell], inv2 = 15;
  for (let left = 0; left < Math.floor(shell.length / 2); left += 1) {
    const right = shell.length - 1 - left;
    output[left] = mod29((shell[left] + shell[right]) * inv2);
    output[right] = mod29((shell[right] - shell[left]) * inv2);
  }
  return output;
}
/** @template T @param {T[]} values @returns {T[][]} */
function permutations(values) {
  if (values.length <= 1) return [values];
  const output = [];
  for (let index = 0; index < values.length; index += 1) {
    const rest = values.slice(0, index).concat(values.slice(index + 1));
    for (const tail of permutations(rest)) output.push([values[index], ...tail]);
  }
  return output;
}

const words = parseWords();
const wordsByStart = new Map(words.map((word) => [word.page + ":" + word.start, word]));
const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedWords = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({ index, label: word.toUpperCase(), values: gp(word) }));
assert.equal(signedWords.length, 43);
assert.equal(signedWords[6].label, "SEEKS");
assert.deepEqual(signedWords[6].values, [15, 18, 18, 5, 15]);
assert.equal(sum(signedWords[6].values), 71);

const state = Object.freeze({
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4,
});
assert.equal(signedWords[state.a].label, "SEEKS");
const p6 = corpus.pages.find((page) => page.page === state.a);
const p6Ink = ink.pages.find((page) => page.page === state.a);
assert.ok(p6);
assert.ok(p6Ink);
assert.equal(p6.indices.length, 196);
assert.deepEqual(p6Ink.large_punctuation, [[71, 13, "red"], [82, 13, "red"]]);
assert.deepEqual(p6Ink.red_spans.map((span) => [span.start, span.length]), [[71, 11]]);

const pageBlocks = transcription.split(/^%\s*$/m);
const p6LineCounts = pageBlocks[6].split("\n")
  .map((line) => [...line].filter((rune) => runeSet.has(rune)).length)
  .filter((count) => count > 0);
assert.deepEqual(p6LineCounts, [20, 24, 24, 3, 18, 19, 20, 24, 22, 22]);
assert.equal(sum(p6LineCounts.slice(0, 4)), 71);

const redSpan = p6Ink.red_spans[0];
const redWords = words.filter((word) =>
  word.page === 6 && word.endPage === 6 &&
  word.start >= redSpan.start && word.end < redSpan.start + redSpan.length
);
assert.deepEqual(redWords.map((word) => word.values.length), [4, 1, 4, 2]);
assert.deepEqual(redWords.map((word) => sum(word.values)), [71, 19, 65, 26]);
assert.equal(sum(redWords[0].values), sum(signedWords[6].values));

const sameIndexFirstRedGp0 = [];
for (const pageInk of ink.pages) {
  if (pageInk.page > 42) continue;
  const sourceWord = signedWords[pageInk.page];
  if (!sourceWord) continue;
  for (let spanIndex = 0; spanIndex < (pageInk.red_spans || []).length; spanIndex += 1) {
    const span = pageInk.red_spans[spanIndex];
    const inside = words.filter((word) =>
      word.page === pageInk.page && word.endPage === pageInk.page &&
      word.start >= span.start && word.end < span.start + span.length
    );
    if (inside.length > 0 && sum(inside[0].values) === sum(sourceWord.values)) {
      sameIndexFirstRedGp0.push({
        page: pageInk.page, spanIndex, source: sourceWord.label,
        gp0: sum(sourceWord.values),
      });
    }
  }
}
assert.deepEqual(sameIndexFirstRedGp0, [{
  page: 6, spanIndex: 0, source: "SEEKS", gp0: 71,
}]);

const bracketingMarkerCount = p6Ink.large_punctuation.filter((mark) =>
  mark[0] === redSpan.start || mark[0] === redSpan.start + redSpan.length
).length;
const visibleShell = [
  redWords.length,
  redSpan.length,
  Math.max(...redWords.map((word) => word.values.length)),
  bracketingMarkerCount,
  state.p,
];
assert.deepEqual(visibleShell, [4, 11, 4, 2, 23]);

const receiverStart = redSpan.start + redSpan.length + state.K * state.p;
assert.equal(receiverStart, 128);
const receiver = wordsByStart.get("6:" + receiverStart);
assert.ok(receiver);
assert.equal(receiver.endPage, 6);
assert.equal(receiver.values.length, signedWords[6].values.length);
assert.deepEqual(receiver.values, [14, 10, 22, 15, 10]);
assert.equal(sum(receiver.values), 71);

const key = hInverse(visibleShell);
assert.deepEqual(key, [28, 21, 4, 10, 24]);
assert.deepEqual(h(key), visibleShell);
const plaintext = receiver.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plaintext, signedWords[6].values);

const fiveRuneTargets = [...new Map(
  signedWords.filter((word) => word.values.length === 5)
    .map((word) => [word.label, word])
).values()];
assert.deepEqual(fiveRuneTargets.map((word) => word.label), [
  "HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE",
]);
const unknownFiveRuneWords = words.filter((word) =>
  word.page < 56 && word.endPage < 56 && word.values.length === 5
);
assert.equal(unknownFiveRuneWords.length, 317);

const exactKeyHits = [];
for (const word of unknownFiveRuneWords) {
  for (const target of fiveRuneTargets) {
    for (const direction of ["sub", "add"]) {
      const output = word.values.map((value, index) =>
        direction === "sub" ? mod29(value - key[index]) : mod29(value + key[index])
      );
      if (output.every((value, index) => value === target.values[index])) {
        exactKeyHits.push({
          page: word.page, start: word.start, target: target.label, direction,
        });
      }
    }
  }
}
assert.deepEqual(exactKeyHits, [{
  page: 6, start: 128, target: "SEEKS", direction: "sub",
}]);

const stateEntries = Object.entries(state);
const p6FiveRuneWords = words.filter((word) =>
  word.page === 6 && word.endPage === 6 && word.values.length === 5
);
assert.equal(p6FiveRuneWords.length, 5);
const localFamilyHits = [];
for (const word of p6FiveRuneWords) {
  for (const target of fiveRuneTargets) {
    for (const direction of ["sub", "add"]) {
      const candidateKey = word.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - target.values[index])
          : mod29(target.values[index] - value)
      );
      const shell = h(candidateKey);
      for (const [vName, v] of stateEntries) {
        for (const [xName, x] of stateEntries) {
          for (const [yName, y] of stateEntries) {
            if (
              shell[0] === v && shell[1] === redSpan.length &&
              shell[2] === v && shell[3] === x && shell[4] === y
            ) {
              localFamilyHits.push({
                start: word.start, target: target.label, direction, shell,
                form: "[" + vName + ",R," + vName + "," + xName + "," + yName + "]",
              });
            }
          }
        }
      }
    }
  }
}
assert.deepEqual(localFamilyHits, [{
  start: 128, target: "SEEKS", direction: "sub",
  shell: [4, 11, 4, 2, 23], form: "[q,R,q,K,p]",
}]);

// Adversarial coordinate-pool control: if shell positions may be chosen
// arbitrarily from the DH state plus the visible red-span length/dot count,
// a second local SEEKS fit appears at start103. The K*p receiver rule is
// therefore essential to the candidate rather than decorative.
const broadVisiblePool = new Set([
  ...Object.values(state),
  redSpan.length,
  13,
]);
const unorderedVisibleHits = [];
for (const word of p6FiveRuneWords) {
  for (const target of fiveRuneTargets) {
    for (const direction of ["sub", "add"]) {
      const candidateKey = word.values.map((value, index) =>
        direction === "sub"
          ? mod29(value - target.values[index])
          : mod29(target.values[index] - value)
      );
      const shell = h(candidateKey);
      if (shell.every((value) => broadVisiblePool.has(value))) {
        unorderedVisibleHits.push({
          start: word.start,
          target: target.label,
          direction,
          shell,
        });
      }
    }
  }
}
assert.deepEqual(unorderedVisibleHits, [
  {
    start: 103,
    target: "SEEKS",
    direction: "sub",
    shell: [11, 15, 19, 13, 3],
  },
  {
    start: 128,
    target: "SEEKS",
    direction: "sub",
    shell: [4, 11, 4, 2, 23],
  },
]);

const distinctProducts = new Map();
for (const [leftName, left] of stateEntries) {
  for (const [rightName, right] of stateEntries) {
    const product = left * right;
    if (!distinctProducts.has(product)) distinctProducts.set(product, []);
    distinctProducts.get(product).push(leftName + "*" + rightName);
  }
}
assert.equal(distinctProducts.size, 41);

const wideHits = [];
let validReceiverTrials = 0;
for (const pageInk of ink.pages) {
  if (pageInk.page > 42) continue;
  const target = signedWords[pageInk.page];
  if (!target || target.values.length !== 5) continue;
  for (let spanIndex = 0; spanIndex < (pageInk.red_spans || []).length; spanIndex += 1) {
    const span = pageInk.red_spans[spanIndex];
    const inside = words.filter((word) =>
      word.page === pageInk.page && word.endPage === pageInk.page &&
      word.start >= span.start && word.end < span.start + span.length
    );
    if (inside.length === 0) continue;
    const features = [
      { name: "wordCount", value: inside.length },
      { name: "spanLength", value: span.length },
      { name: "maxWordLength", value: Math.max(...inside.map((word) => word.values.length)) },
      {
        name: "markerCount",
        value: (pageInk.large_punctuation || []).filter((mark) =>
          mark[0] === span.start || mark[0] === span.start + span.length
        ).length,
      },
      { name: "p", value: state.p },
    ];
    for (const order of permutations(features)) {
      const shell = order.map((feature) => feature.value);
      const candidateKey = hInverse(shell);
      for (const [step, stepNames] of distinctProducts) {
        for (const stepSign of [1, -1]) {
          const start = span.start + span.length + stepSign * step;
          const word = wordsByStart.get(pageInk.page + ":" + start);
          if (!word || word.endPage !== pageInk.page || word.values.length !== 5) continue;
          for (const direction of ["sub", "add"]) {
            validReceiverTrials += 1;
            const output = word.values.map((value, index) =>
              direction === "sub"
                ? mod29(value - candidateKey[index])
                : mod29(value + candidateKey[index])
            );
            if (output.every((value, index) => value === target.values[index])) {
              wideHits.push({
                page: pageInk.page, target: target.label, spanIndex, start,
                step, stepNames, stepSign, direction,
                shellOrder: order.map((feature) => feature.name), shell,
              });
            }
          }
        }
      }
    }
  }
}
assert.equal(validReceiverTrials, 2400);
assert.equal(wideHits.length, 2);
for (const hit of wideHits) {
  assert.equal(hit.page, 6);
  assert.equal(hit.target, "SEEKS");
  assert.equal(hit.start, 128);
  assert.equal(hit.step, 46);
  assert.deepEqual(hit.stepNames, ["p*K", "K*p"]);
  assert.equal(hit.stepSign, 1);
  assert.equal(hit.direction, "sub");
  assert.deepEqual(hit.shell, [4, 11, 4, 2, 23]);
}
assert.deepEqual(wideHits.map((hit) => hit.shellOrder), [
  ["wordCount", "spanLength", "maxWordLength", "markerCount", "p"],
  ["maxWordLength", "spanLength", "wordCount", "markerCount", "p"],
]);
const preferredTransferHits = wideHits.filter((hit) =>
  hit.shellOrder.join(",") ===
  "wordCount,spanLength,maxWordLength,markerCount,p"
);
assert.deepEqual(preferredTransferHits, [wideHits[0]]);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: {
    sourceIndex: state.a,
    sourceWord: signedWords[6].label,
    sourceGp0: sum(signedWords[6].values),
    page: 6,
    upperBlackRunes: sum(p6LineCounts.slice(0, 4)),
    uniqueSameIndexFirstRedGp0: sameIndexFirstRedGp0,
  },
  redHeading: {
    start: redSpan.start,
    runeCount: redSpan.length,
    wordLengths: redWords.map((word) => word.values.length),
    wordGp0: redWords.map((word) => sum(word.values)),
    visibleShell,
  },
  receiver: {
    formula: "red_end + K*p",
    start: receiverStart,
    cipher: receiver.values,
    key,
    plaintext,
    target: "SEEKS",
  },
  controls: {
    localFamilyCases:
      p6FiveRuneWords.length * fiveRuneTargets.length * 2 *
      stateEntries.length ** 3,
    localFamilyHits,
    unknownFiveRuneWords: unknownFiveRuneWords.length,
    exactKeyHits,
    wideDistinctStateProducts: distinctProducts.size,
    wideValidReceiverTrials: validReceiverTrials,
    wideHits,
  },
  classification:
    "Strong local SEEKS candidate. Source/page/heading/receiver geometry is source-visible, but the five-coordinate heading-feature serialization was recognized after the inverse and remains post-discovery until an independent unchanged transfer succeeds.",
}, null, 2));
