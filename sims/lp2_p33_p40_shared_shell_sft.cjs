"use strict";

/**
 * SFT: audit the shared p33/p40 H-shell skeleton after simplifying p40 HERE[p]=26 to -e.
 * Windows Node.js 22, CommonJS, no third-party dependencies.
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
    assert.ok(token);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number} block @returns {number} */
function physicalPage(block) {
  return block < 50 ? block : block + 1;
}

/**
 * @returns {Array<{
 *   startPage:number,startOffset:number,endPage:number,endOffset:number,values:number[]
 * }>}
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
      startPage,
      startOffset,
      endPage: page,
      endOffset: pageOffset - 1,
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
    } else if (ch === "-" || ch === "." || ch === "&" || ch === "$" || ch === "/" || ch === "\n") {
      close();
    } else if (ch === "%") {
      close();
      block += 1;
      page = physicalPage(block);
      pageOffset = 0;
    }
  }
  close();
  return words;
}

const clear = signedSource.split("-----BEGIN PGP SIGNATURE-----")[0];
const body = clear.slice(clear.indexOf("Hello."));
const signedTokens = body
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token));
const signed = signedTokens.map((word, index) => ({
  index,
  label: word.toUpperCase(),
  values: gp(word),
}));
assert.equal(signed.length, 43);
assert.equal(signed[33].label, "WILL");
assert.equal(signed[40].label, "PATHS");

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

const words = parseWords();

/**
 * @param {number} page
 * @param {{label:string,values:number[]}} target
 * @returns {{page:number,start:number,cipher:number[],key:number[],shell:number[]}}
 */
function selectedReceiver(page, target) {
  const matches = words.filter((word) =>
    word.startPage === page &&
    word.endPage === page &&
    word.values.length === target.values.length &&
    sum(word.values) === sum(target.values)
  );
  assert.equal(matches.length, 1);
  const receiver = matches[0];
  const key = receiver.values.map((value, index) =>
    mod29(value - target.values[index])
  );
  return {
    page,
    start: receiver.startOffset,
    cipher: receiver.values,
    key,
    shell: h(key),
  };
}

const will = selectedReceiver(33, signed[33]);
const paths = selectedReceiver(40, signed[40]);
assert.deepEqual(will, {
  page: 33,
  start: 132,
  cipher: [3, 15, 17, 22],
  key: [25, 5, 26, 2],
  shell: [23, 8, 2, 27],
});
assert.deepEqual(paths, {
  page: 40,
  start: 71,
  cipher: [4, 15, 14, 21],
  key: [20, 20, 12, 6],
  shell: [14, 8, 3, 26],
});

// The p40 fourth coordinate requires no HERE state at all.
assert.equal(paths.shell[3], mod29(-state.e));
assert.deepEqual(paths.shell, [
  mod29(-state.b),
  state.A,
  state.e,
  mod29(-state.e),
]);

// Both exact shells share [x, A, y, -y].
function isSharedSkeleton(shell) {
  return shell[1] === state.A && shell[3] === mod29(-shell[2]);
}
assert.ok(isSharedSkeleton(will.shell));
assert.ok(isSharedSkeleton(paths.shell));

// The source words 33..40 inclusive form exactly A words and rise by g+K.
const sourceCorridor = signed.slice(33, 41);
assert.equal(sourceCorridor.length, state.A);
assert.equal(40 - 33, state.g + state.K);
assert.deepEqual(
  sourceCorridor.map((entry) => entry.label),
  ["WILL", "BE", "FOUND", "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS"]
);

// Find every two-complete-word red span whose word lengths are [e,g].
const egRedSpans = [];
for (const pageEntry of ink.pages) {
  const pageWords = words.filter((word) =>
    word.startPage === pageEntry.page && word.endPage === pageEntry.page
  );
  for (const span of pageEntry.red_spans || []) {
    const inside = pageWords.filter((word) =>
      word.startOffset >= span.start &&
      word.endOffset < span.start + span.length
    );
    if (
      inside.length === 2 &&
      inside[0].values.length === state.e &&
      inside[1].values.length === state.g
    ) {
      egRedSpans.push({
        page: pageEntry.page,
        start: span.start,
        length: span.length,
        wordLengths: inside.map((word) => word.values.length),
      });
    }
  }
}
assert.deepEqual(egRedSpans, [
  { page: 33, start: 91, length: 8, wordLengths: [3, 5] },
  { page: 40, start: 0, length: 8, wordLengths: [3, 5] },
]);

// Charge a shared [x,A,y,-y] shell family without fitting x/y per rune.
// x may be either sign of any already authenticated DH/source scalar.
// y is one already authenticated scalar. Duplicated numeric x values collapse.
const xValues = [...new Set(
  Object.values(state).flatMap((value) => [value, mod29(-value)])
)];
const yValues = [...new Set(Object.values(state))];
const shellFamily = [];
for (const x of xValues) {
  for (const y of yValues) {
    shellFamily.push([x, state.A, y, mod29(-y)]);
  }
}
assert.ok(shellFamily.some((shell) => shell.every((v, i) => v === will.shell[i])));
assert.ok(shellFamily.some((shell) => shell.every((v, i) => v === paths.shell[i])));

const distinctTargets = [
  ...new Map(
    signed
      .filter((word) => word.values.length === 4)
      .map((word) => [word.label, word])
  ).values(),
];

const familyHits = [];
for (const page of [33, 40]) {
  const pageWords = words.filter((word) =>
    word.startPage === page &&
    word.endPage === page &&
    word.values.length === 4
  );
  for (const word of pageWords) {
    for (const target of distinctTargets) {
      for (const direction of ["sub", "add"]) {
        const key = word.values.map((value, index) =>
          direction === "sub"
            ? mod29(value - target.values[index])
            : mod29(target.values[index] - value)
        );
        const shell = h(key);
        if (shellFamily.some((candidate) =>
          candidate.every((value, index) => value === shell[index])
        )) {
          familyHits.push({
            page,
            start: word.startOffset,
            target: target.label,
            direction,
            shell,
          });
        }
      }
    }
  }
}

console.log(JSON.stringify({
  status: "PASS",
  exact: { will, paths },
  simplification: {
    p40OldFourthCoordinate: 26,
    directStateIdentity: "-e mod29",
    p40ShellWithoutHERE: ["-b", "A", "e", "-e"],
    sharedSkeleton: "[x,A,y,-y]",
  },
  sourcePairing: {
    signedCorridor: sourceCorridor.map((entry) => ({
      index: entry.index,
      label: entry.label,
      length: entry.values.length,
    })),
    corridorWordCount: sourceCorridor.length,
    corridorIndexRise: 40 - 33,
    egRedSpans,
  },
  familyCharge: {
    xValues,
    yValues,
    shellCount: shellFamily.length,
    pages: [33, 40],
    authenticatedFourRuneTargets: distinctTargets.map((entry) => entry.label),
    hits: familyHits,
  },
}, null, 2));
