"use strict";

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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
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
    .toUpperCase()
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
  let block = 0;
  let page = 0;
  let pageOffset = 0;
  let startPage = null;
  let startOffset = null;
  let runes = [];
  const words = [];

  const close = () => {
    if (runes.length === 0) return;
    words.push({
      page: startPage,
      start: startOffset,
      endPage: page,
      end: pageOffset - 1,
      values: runes.map((rune) => runeIndex.get(rune)),
    });
    startPage = null;
    startOffset = null;
    runes = [];
  };

  for (const ch of transcription) {
    if (runeSet.has(ch)) {
      if (runes.length === 0) {
        startPage = page;
        startOffset = pageOffset;
      }
      runes.push(ch);
      pageOffset += 1;
    } else if (ch === "-" || ch === "." || ch === "$" || ch === "&") {
      close();
    } else if (ch === "%") {
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

/** @param {number[]} shell @returns {number[]} */
function hInverse(shell) {
  const output = [...shell];
  const inv2 = 15;
  for (let left = 0; left < 2; left += 1) {
    const right = 3 - left;
    output[left] = mod29((shell[left] + shell[right]) * inv2);
    output[right] = mod29((shell[right] - shell[left]) * inv2);
  }
  return output;
}

/** @param {number[]} cipher @param {number[]} key @param {"sub"|"add"} sign @returns {number[]} */
function applyKey(cipher, key, sign) {
  return cipher.map((value, index) =>
    sign === "sub" ? mod29(value - key[index]) : mod29(value + key[index])
  );
}

const words = parseWords();
const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedWords = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word, index) => ({
    index,
    label: word.toUpperCase(),
    values: gp(word),
  }));

assert.equal(signedWords.length, 43);
assert.equal(signedWords[6].label, "SEEKS");
assert.equal(signedWords[33].label, "WILL");
assert.equal(signedWords[40].label, "PATHS");

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
assert.equal(state.a, 6);
assert.equal(state.B, 19);

const fourRuneTargets = [...new Map(
  signedWords
    .filter((word) => word.values.length === 4)
    .map((word) => [word.label, word])
).values()];
assert.deepEqual(fourRuneTargets.map((word) => word.label), [
  "LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const p33Words = words.filter((word) => word.page === 33 && word.endPage === 33);
const p40Words = words.filter((word) => word.page === 40 && word.endPage === 40);
const willState = signedWords[33];
const pathsState = signedWords[40];
const p33StateMatches = p33Words.filter((word) =>
  word.values.length === willState.values.length &&
  sum(word.values) === sum(willState.values)
);
const p40StateMatches = p40Words.filter((word) =>
  word.values.length === pathsState.values.length &&
  sum(word.values) === sum(pathsState.values)
);
assert.deepEqual(p33StateMatches.map((word) => word.start), [132]);
assert.deepEqual(p40StateMatches.map((word) => word.start), [71]);

const p33Receiver = p33StateMatches[0];
const p40Receiver = p40StateMatches[0];
assert.deepEqual(p33Receiver.values, [3, 15, 17, 22]);
assert.deepEqual(p40Receiver.values, [4, 15, 14, 21]);

const p6Ink = ink.pages.find((page) => page.page === 6);
assert.ok(p6Ink);
assert.equal(p6Ink.red_spans.length, 1);
const p6Span = p6Ink.red_spans[0];
const p6HeadingWords = words.filter((word) =>
  word.page === 6 &&
  word.endPage === 6 &&
  word.start >= p6Span.start &&
  word.end < p6Span.start + p6Span.length
);
assert.deepEqual(p6HeadingWords.map((word) => word.values.length), [4, 1, 4, 2]);
assert.deepEqual(p6HeadingWords.map((word) => sum(word.values)), [71, 19, 65, 26]);
assert.deepEqual(p6HeadingWords.flatMap((word) => word.values), [
  24, 16, 14, 17,
  19,
  6, 27, 15, 17,
  14, 12,
]);

// The independently selected SEEKS page also carries B as a literal red word.
assert.equal(sum(p6HeadingWords[0].values), sum(signedWords[6].values));
assert.equal(p6HeadingWords[1].values[0], state.B);

// Conventional base60 p50 decoding.
const p50Tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
/** @param {string} token @returns {number|null} */
function base60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * 60 + low;
}
const p50 = p50Tokens.map(base60);
assert.equal(p50[state.B], 33);
assert.equal(p50[26], 173);

// Among every red word in the annotated manuscript, p6's B word is the sole
// red word whose GP0 is a one-step p50 pointer to physical p33.
const redWordsToP33 = [];
for (const pageInk of ink.pages) {
  for (let spanIndex = 0; spanIndex < (pageInk.red_spans || []).length; spanIndex += 1) {
    const span = pageInk.red_spans[spanIndex];
    const inside = words.filter((word) =>
      word.page === pageInk.page &&
      word.endPage === pageInk.page &&
      word.start >= span.start &&
      word.end < span.start + span.length
    );
    for (let wordIndex = 0; wordIndex < inside.length; wordIndex += 1) {
      const gp0 = sum(inside[wordIndex].values);
      if (gp0 < 256 && p50[gp0] === 33) {
        redWordsToP33.push({
          page: pageInk.page,
          spanIndex,
          wordIndex,
          gp0,
        });
      }
    }
  }
}
assert.deepEqual(redWordsToP33, [{
  page: 6,
  spanIndex: 0,
  wordIndex: 1,
  gp0: 19,
}]);

/**
 * Build the two predeclared red-span shell readouts.
 * @param {Array<{values:number[]}>} inside
 * @returns {{p33:number[],p40:number[]}}
 */
function shellsForSpan(inside) {
  const lengths = inside.map((word) => word.values.length);
  const maxLength = Math.max(...lengths);
  const maxTotal = lengths
    .filter((length) => length === maxLength)
    .reduce((total, length) => total + length, 0);
  const nonSingletons = lengths.filter((length) => length > 1).length;
  const lastWord = inside.at(-1);
  return {
    p33: [
      state.p,
      maxTotal,
      lastWord.values.length,
      mod29(-lastWord.values.length),
    ],
    p40: [
      lastWord.values[0],
      maxTotal,
      nonSingletons,
      sum(lastWord.values),
    ],
  };
}

const p6Shells = shellsForSpan(p6HeadingWords);
assert.deepEqual(p6Shells.p33, [23, 8, 2, 27]);
assert.deepEqual(p6Shells.p40, [14, 8, 3, 26]);

const p33Key = hInverse(p6Shells.p33);
const p40Key = hInverse(p6Shells.p40);
assert.deepEqual(p33Key, [25, 5, 26, 2]);
assert.deepEqual(p40Key, [20, 20, 12, 6]);
assert.deepEqual(applyKey(p33Receiver.values, p33Key, "sub"), willState.values);
assert.deepEqual(applyKey(p40Receiver.values, p40Key, "sub"), pathsState.values);

// Charge the fixed pair of readout formulas against every annotated red span.
const fixedFormulaHits = [];
const spanRecords = [];
for (const pageInk of ink.pages) {
  for (let spanIndex = 0; spanIndex < (pageInk.red_spans || []).length; spanIndex += 1) {
    const span = pageInk.red_spans[spanIndex];
    const inside = words.filter((word) =>
      word.page === pageInk.page &&
      word.endPage === pageInk.page &&
      word.start >= span.start &&
      word.end < span.start + span.length
    );
    if (inside.length === 0) continue;
    const shells = shellsForSpan(inside);
    const record = {
      page: pageInk.page,
      spanIndex,
      shells,
      decodes: [],
    };
    for (const [recipient, shell] of Object.entries(shells)) {
      const receiver = recipient === "p33" ? p33Receiver : p40Receiver;
      const key = hInverse(shell);
      for (const sign of ["sub", "add"]) {
        const output = applyKey(receiver.values, key, sign);
        const target = fourRuneTargets.find((word) =>
          word.values.every((value, index) => value === output[index])
        );
        if (target) {
          const hit = {
            page: pageInk.page,
            spanIndex,
            recipient,
            sign,
            target: target.label,
            shell,
            key,
          };
          fixedFormulaHits.push(hit);
          record.decodes.push(hit);
        }
      }
    }
    spanRecords.push(record);
  }
}
assert.equal(spanRecords.length, 18);
assert.deepEqual(fixedFormulaHits, [
  {
    page: 6,
    spanIndex: 0,
    recipient: "p33",
    sign: "sub",
    target: "WILL",
    shell: [23, 8, 2, 27],
    key: [25, 5, 26, 2],
  },
  {
    page: 6,
    spanIndex: 0,
    recipient: "p40",
    sign: "sub",
    target: "PATHS",
    shell: [14, 8, 3, 26],
    key: [20, 20, 12, 6],
  },
]);

// Broader matched family. P33-like shells choose a source state for slot0,
// any two span-geometry features for slots1/2, and +/-slot2 for slot3.
// P40-like shells choose terminal-word scalar / geometry / geometry / terminal
// scalar. Score every authenticated four-rune target and both signs.
let p33FamilyCases = 0;
let p40FamilyCases = 0;
const p33FamilyHits = [];
const p40FamilyHits = [];

for (const pageInk of ink.pages) {
  for (let spanIndex = 0; spanIndex < (pageInk.red_spans || []).length; spanIndex += 1) {
    const span = pageInk.red_spans[spanIndex];
    const inside = words.filter((word) =>
      word.page === pageInk.page &&
      word.endPage === pageInk.page &&
      word.start >= span.start &&
      word.end < span.start + span.length
    );
    if (inside.length === 0) continue;

    const lengths = inside.map((word) => word.values.length);
    const maxLength = Math.max(...lengths);
    const firstWord = inside[0];
    const lastWord = inside.at(-1);
    const geometry = {
      wordCount: inside.length,
      spanLength: span.length,
      maxLength,
      maxTotal: lengths.filter((length) => length === maxLength)
        .reduce((total, length) => total + length, 0),
      multiCount: lengths.filter((length) => length > 1).length,
      singletonCount: lengths.filter((length) => length === 1).length,
      firstLength: firstWord.values.length,
      lastLength: lastWord.values.length,
      markerCount: (pageInk.large_punctuation || []).filter((mark) =>
        mark[0] === span.start || mark[0] === span.start + span.length
      ).length,
    };
    const terminal = {
      firstRune: lastWord.values[0],
      lastRune: lastWord.values.at(-1),
      gp0: sum(lastWord.values),
      length: lastWord.values.length,
    };

    for (const [stateName, stateValue] of Object.entries(state)) {
      for (const [feature2Name, feature2] of Object.entries(geometry)) {
        for (const [feature3Name, feature3] of Object.entries(geometry)) {
          for (const negate of [false, true]) {
            p33FamilyCases += 1;
            const shell = [
              stateValue,
              feature2,
              feature3,
              negate ? mod29(-feature3) : feature3,
            ];
            const key = hInverse(shell);
            for (const sign of ["sub", "add"]) {
              const output = applyKey(p33Receiver.values, key, sign);
              const target = fourRuneTargets.find((word) =>
                word.values.every((value, index) => value === output[index])
              );
              if (target) {
                p33FamilyHits.push({
                  page: pageInk.page,
                  spanIndex,
                  stateName,
                  feature2Name,
                  feature3Name,
                  negate,
                  sign,
                  target: target.label,
                  shell,
                });
              }
            }
          }
        }
      }
    }

    for (const [terminal1Name, terminal1] of Object.entries(terminal)) {
      for (const [feature2Name, feature2] of Object.entries(geometry)) {
        for (const [feature3Name, feature3] of Object.entries(geometry)) {
          for (const [terminal4Name, terminal4] of Object.entries(terminal)) {
            p40FamilyCases += 1;
            const shell = [terminal1, feature2, feature3, terminal4];
            const key = hInverse(shell);
            for (const sign of ["sub", "add"]) {
              const output = applyKey(p40Receiver.values, key, sign);
              const target = fourRuneTargets.find((word) =>
                word.values.every((value, index) => value === output[index])
              );
              if (target) {
                p40FamilyHits.push({
                  page: pageInk.page,
                  spanIndex,
                  terminal1Name,
                  feature2Name,
                  feature3Name,
                  terminal4Name,
                  sign,
                  target: target.label,
                  shell,
                });
              }
            }
          }
        }
      }
    }
  }
}

assert.equal(p33FamilyCases, 26244);
assert.equal(p40FamilyCases, 23328);
assert.equal(p33FamilyHits.length, 31);
assert.equal(p40FamilyHits.length, 1);
assert.deepEqual(p40FamilyHits[0], {
  page: 6,
  spanIndex: 0,
  terminal1Name: "firstRune",
  feature2Name: "maxTotal",
  feature3Name: "multiCount",
  terminal4Name: "gp0",
  sign: "sub",
  target: "PATHS",
  shell: [14, 8, 3, 26],
});

const p6WillFamilyHits = p33FamilyHits.filter((hit) =>
  hit.page === 6 && hit.spanIndex === 0 && hit.target === "WILL"
);
assert.equal(p6WillFamilyHits.length, 2);
assert.ok(p6WillFamilyHits.some((hit) =>
  hit.stateName === "p" &&
  hit.feature2Name === "maxTotal" &&
  hit.feature3Name === "lastLength" &&
  hit.negate === true &&
  hit.sign === "sub" &&
  JSON.stringify(hit.shell) === JSON.stringify([23, 8, 2, 27])
));

// The second p6 WILL family hit is the same numeric shell because both the
// final-word length and the bracketing-marker count equal K=2.
assert.deepEqual(
  p6WillFamilyHits.map((hit) => hit.feature3Name).sort(),
  ["lastLength", "markerCount"]
);

// P6 is the only red span with at least one lexical hit in both broad
// recipient families.
const dualSpanKeys = [];
for (const record of spanRecords) {
  const key = record.page + ":" + record.spanIndex;
  const has33 = p33FamilyHits.some((hit) =>
    hit.page === record.page && hit.spanIndex === record.spanIndex
  );
  const has40 = p40FamilyHits.some((hit) =>
    hit.page === record.page && hit.spanIndex === record.spanIndex
  );
  if (has33 && has40) dualSpanKeys.push(key);
}
assert.deepEqual(dualSpanKeys, ["6:0"]);

// The raw heading itself is fully expressible through simple already-live
// DH/state arithmetic. This is supporting structure, not an independent key
// derivation because the expression vocabulary is broad.
assert.deepEqual(
  p6HeadingWords.flatMap((word) => word.values),
  [
    mod29(-state.g),
    mod29(state.K - state.b),
    mod29(-state.b),
    mod29(state.K + state.b),
    state.B,
    state.a,
    mod29(-state.K),
    state.b,
    mod29(state.K + state.b),
    mod29(-state.b),
    mod29(state.a * state.K),
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  p6Heading: {
    wordLengths: p6HeadingWords.map((word) => word.values.length),
    wordGp0: p6HeadingWords.map((word) => sum(word.values)),
    raw: p6HeadingWords.flatMap((word) => word.values),
    uniqueRedWordP50ToP33: redWordsToP33,
  },
  recipients: {
    p33: {
      sourceWord: "WILL",
      receiverStart: p33Receiver.start,
      cipher: p33Receiver.values,
      shell: p6Shells.p33,
      key: p33Key,
    },
    p40: {
      sourceWord: "PATHS",
      receiverStart: p40Receiver.start,
      cipher: p40Receiver.values,
      shell: p6Shells.p40,
      key: p40Key,
    },
  },
  fixedFormulaControl: {
    redSpans: spanRecords.length,
    hits: fixedFormulaHits,
  },
  broadFamilyControl: {
    p33Cases: p33FamilyCases,
    p33LexicalHits: p33FamilyHits.length,
    p6WillHits: p6WillFamilyHits,
    p40Cases: p40FamilyCases,
    p40LexicalHits: p40FamilyHits,
    dualHitSpans: dualSpanKeys,
  },
  decision:
    "The independently SEEKS-selected p6 red heading is the only annotated red span whose fixed geometric/terminal readouts reproduce both local p33 WILL and p40 PATHS H-shell keys. The p40 readout is unique even in its broad family; p33 alone is not. Because both readout formulas were recognized after the recipient inverses, preserve this as cross-page key-schedule evidence pending a fresh prospective transfer.",
}, null, 2));
