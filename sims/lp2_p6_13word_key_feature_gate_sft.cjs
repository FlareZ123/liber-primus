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

/** @param {number} value @returns {number} */
function inverse29(value) {
  let t = 0;
  let nextT = 1;
  let r = 29;
  let nextR = mod29(value);
  while (nextR !== 0) {
    const q = Math.floor(r / nextR);
    [t, nextT] = [nextT, t - q * nextT];
    [r, nextR] = [nextR, r - q * nextR];
  }
  assert.equal(r, 1);
  return mod29(t);
}

/** @param {number[][]} matrix @returns {number} */
function rank29(matrix) {
  const a = matrix.map((row) => row.map(mod29));
  let rank = 0;
  for (let col = 0; col < a[0].length && rank < a.length; col += 1) {
    let pivot = -1;
    for (let row = rank; row < a.length; row += 1) {
      if (a[row][col] !== 0) {
        pivot = row;
        break;
      }
    }
    if (pivot < 0) continue;
    [a[rank], a[pivot]] = [a[pivot], a[rank]];
    const inv = inverse29(a[rank][col]);
    a[rank] = a[rank].map((value) => mod29(value * inv));
    for (let row = 0; row < a.length; row += 1) {
      if (row === rank || a[row][col] === 0) continue;
      const factor = a[row][col];
      a[row] = a[row].map((value, index) =>
        mod29(value - factor * a[rank][index])
      );
    }
    rank += 1;
  }
  return rank;
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

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const source = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({ index, word: word.toUpperCase(), values: gp(word) }));

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const printed = [];
let current = [];
let startPage = -1;
let endPage = -1;
let startOffset = -1;

function flush() {
  if (!current.length) return;
  printed.push({
    page: startPage,
    endPage,
    start: startOffset,
    values: current.slice(),
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
}
flush();

const canonical = printed.filter((word) => word.page === word.endPage);

/** @param {number} page @returns {{page:number,endPage:number,start:number,values:number[]}[]} */
function localWords(page) {
  return canonical.filter((word) => word.page === page);
}

const ordinals = new Map([
  [30, 27], [31, 32], [32, 6], [33, 35], [34, 2], [35, 7], [36, 36],
  [37, 38], [38, 12], [39, 30], [40, 17], [41, 42], [42, 45],
]);
const delta = [26, 1, 3, 2, 26, 1, 0, 1, 3, 20, 6, 1, 3];
const blocks = [0, 0, 1, 1, 1, 1, 2, 3, 3, 3, 3, 4, 4];
const slots = [0, 1, 0, 1, 2, 3, 0, 0, 1, 2, 3, 0, 1];

const fitted = [];
for (let page = 30; page <= 42; page += 1) {
  const index = page - 30;
  const local = localWords(page);
  const ordinal = ordinals.get(page);
  assert.ok(ordinal);
  let receiver;

  if (page === 35) {
    receiver = local[ordinal - 1].values.concat(local[ordinal].values);
  } else {
    receiver = local[ordinal - 1].values.slice();
  }
  if (page === 36 || page === 41) {
    receiver.splice(Math.floor(receiver.length / 2), 1);
  }
  if (page === 42) {
    receiver.splice(1, 1);
  }

  const target = source[page].values;
  assert.equal(receiver.length, target.length);
  const key = receiver.map((value, coordinate) =>
    mod29(value - target[coordinate])
  );

  fitted.push({
    page,
    word: source[page].word,
    ordinal,
    delta: delta[index],
    block: blocks[index],
    slot: slots[index],
    sourceIndexResidue: mod29(page),
    target,
    key,
  });
}
assert.equal(fitted.reduce((sum, row) => sum + row.key.length, 0), 57);

const observations = [];
for (const row of fitted) {
  const n = row.target.length;
  for (let j = 0; j < n; j += 1) {
    observations.push({
      k: row.key[j],
      delta: row.delta,
      x: row.target[j],
      xr: row.target[n - 1 - j],
      j,
      n,
      block: row.block,
      slot: row.slot,
      idx: row.sourceIndexResidue,
    });
  }
}
assert.equal(observations.length, 57);

/**
 * @param {string[]} names
 * @param {1|2} degree
 * @returns {{matrix:number[][],labels:string[]}}
 */
function design(names, degree) {
  const labels = ["1", ...names];
  const matrix = observations.map((observation) => [
    1,
    ...names.map((name) => observation[name]),
  ]);

  if (degree === 2) {
    for (let left = 0; left < names.length; left += 1) {
      for (let right = left; right < names.length; right += 1) {
        const a = names[left];
        const b = names[right];
        labels.push(a + "*" + b);
        for (let row = 0; row < matrix.length; row += 1) {
          matrix[row].push(
            mod29(observations[row][a] * observations[row][b])
          );
        }
      }
    }
  }
  return { matrix, labels };
}

const families = [
  { name: "affine delta,x,j,n", degree: 1, fields: ["delta", "x", "j", "n"] },
  { name: "affine + reverse source coordinate", degree: 1, fields: ["delta", "x", "xr", "j", "n"] },
  { name: "affine + block/slot", degree: 1, fields: ["delta", "x", "xr", "j", "n", "block", "slot"] },
  { name: "quadratic + block/slot", degree: 2, fields: ["delta", "x", "xr", "j", "n", "block", "slot"] },
  { name: "quadratic + block/slot/source-index", degree: 2, fields: ["delta", "x", "xr", "j", "n", "block", "slot", "idx"] },
];

const results = [];
for (const family of families) {
  const { matrix, labels } = design(family.fields, family.degree);
  const augmented = matrix.map((row, index) =>
    row.concat(observations[index].k)
  );
  const rank = rank29(matrix);
  const augmentedRank = rank29(augmented);
  results.push({
    ...family,
    coefficients: labels.length,
    rank,
    augmentedRank,
    consistent: rank === augmentedRank,
  });
}

assert.deepEqual(
  results.map((row) => [
    row.coefficients,
    row.rank,
    row.augmentedRank,
    row.consistent,
  ]),
  [
    [5, 5, 6, false],
    [6, 6, 7, false],
    [8, 8, 9, false],
    [36, 34, 35, false],
    [45, 37, 38, false],
  ]
);

const output = {
  status: "PASS",
  classification:
    "exact negative gate for low-degree value-key serializers after the thirteen-word receiver scheduler",
  observations: observations.length,
  fitted: fitted.map((row) => ({
    page: row.page,
    word: row.word,
    ordinal: row.ordinal,
    delta: row.delta,
    key: row.key,
  })),
  families: results,
  consequence:
    "The new ordinal delta plus local source rune values, reverse rune, coordinate, arity, block, slot and source-index residue still do not generate the 57 fitted key coordinates via affine or degree<=2 polynomial rules over GF(29).",
};

const text = JSON.stringify(output, null, 2);
console.log(text);
const artifact = path.join(
  process.env.RUNNER_TEMP || process.env.TEMP || __dirname,
  "source-test-output.json"
);
fs.writeFileSync(artifact, text + "\n", "utf8");
