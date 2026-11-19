"use strict";

/**
 * P28 cube-direction discriminator using the already frozen READOUT receiver grammar.
 *
 * This test does not authenticate the downstream coercion
 * "p50 numeral -> LP2 rune offset". It asks a narrower question:
 * once that frozen conditional receiver grammar is used as an outside-p28
 * discriminator, which member of the previously charged 44-transform
 * cube/inverse-cube family survives without using English to choose direction?
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

assert.equal(tableTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {string} token @param {string} alphabet @returns {number} */
function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length +
    alphabet.indexOf(token[1]);
}

/** @param {string} token @returns {number|null} */
function literalNumber(token) {
  return /^\d+$/.test(token) ? Number(token) : null;
}

/** @param {number} physicalPage */
function parsePage(physicalPage) {
  if (physicalPage === 50) return {runes: [], words: []};
  const text = parts[physicalPage < 50 ? physicalPage : physicalPage - 1];
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      start,
      end: start + current.length - 1,
      len: current.length,
      values: current.slice(),
    });
    current = [];
  };

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}

const physicalPages = [];
for (let page = 0; page <= 55; page += 1) {
  if (page !== 50) physicalPages.push({page, ...parsePage(page)});
}

// Frozen #1706 source geometry: every whole-word-bounded 23-rune interval
// whose exact center is F.
const geometry = [];
for (const page of physicalPages) {
  const starts = new Set(page.words.map((word) => word.start));
  const ends = new Set(page.words.map((word) => word.end));
  for (let start = 0; start + 22 < page.runes.length; start += 1) {
    const end = start + 22;
    if (
      starts.has(start) &&
      ends.has(end) &&
      page.runes[start + 11] === 0
    ) {
      geometry.push({
        id: geometry.length,
        page: page.page,
        start,
        end,
        center: start + 11,
      });
    }
  }
}
assert.equal(geometry.length, 23);
assert.deepEqual(
  geometry.filter((row) => row.page === 0)
    .map((row) => [row.start, row.end, row.center]),
  [[80, 102, 91], [166, 188, 177]],
);

const endpointMask = new Map();
for (const row of geometry) {
  const key = `${row.start}:${row.end}`;
  endpointMask.set(key, (endpointMask.get(key) || 0) | (1 << row.id));
}

const semantics = [];
for (const mode of ["base60", "base59", "literal"]) {
  for (const receiverOrigin of [0, 1]) {
    semantics.push({mode, receiverOrigin});
  }
}

/** @param {string} token @param {string} mode */
function numericOutput(token, mode) {
  if (mode === "base60") return decodeToken(token, alphabet60);
  if (mode === "base59") return decodeToken(token, alphabet59);
  return literalNumber(token);
}

/** @param {string} token @param {{mode:string,receiverOrigin:number}} semantic */
function wholeWindowMask(token, semantic) {
  const value = numericOutput(token, semantic.mode);
  if (!Number.isInteger(value)) return 0;
  const center = value - semantic.receiverOrigin;
  let mask = 0;
  for (const row of geometry) {
    if (row.center === center) mask |= 1 << row.id;
  }
  return mask;
}

/**
 * Charge source/reverse endpoint order and all four endpoint inclusion choices,
 * exactly as in the frozen #1706 receiver family.
 * @param {string} leftToken
 * @param {string} rightToken
 * @param {{mode:string,receiverOrigin:number}} semantic
 */
function splitWindowMask(leftToken, rightToken, semantic) {
  const leftValue = numericOutput(leftToken, semantic.mode);
  const rightValue = numericOutput(rightToken, semantic.mode);
  if (!Number.isInteger(leftValue) || !Number.isInteger(rightValue)) return 0;

  const offsets = [
    leftValue - semantic.receiverOrigin,
    rightValue - semantic.receiverOrigin,
  ];
  let mask = 0;

  for (const ordered of [offsets, [offsets[1], offsets[0]]]) {
    const direction = Math.sign(ordered[1] - ordered[0]);
    if (!direction) continue;
    for (const includeSource of [true, false]) {
      for (const includeTarget of [true, false]) {
        const first = ordered[0] + (includeSource ? 0 : direction);
        const last = ordered[1] - (includeTarget ? 0 : direction);
        if ((last - first) * direction < 0) continue;
        const start = Math.min(first, last);
        const end = Math.max(first, last);
        mask |= endpointMask.get(`${start}:${end}`) || 0;
      }
    }
  }
  return mask;
}

/**
 * Require whole and split branches to land on distinct matched windows on the
 * same physical page, the stricter #1706 joint criterion.
 * @param {number} wholeMask
 * @param {number} splitMask
 */
function compatiblePair(wholeMask, splitMask) {
  for (const whole of geometry) {
    if (!(wholeMask & (1 << whole.id))) continue;
    for (const split of geometry) {
      if (
        split.id !== whole.id &&
        split.page === whole.page &&
        (splitMask & (1 << split.id))
      ) {
        return {whole, split};
      }
    }
  }
  return null;
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let out = 1;
  let value = base % 29;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * value) % 29;
    value = (value * value) % 29;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

// Exact source-selected p28 rightward center-to-line-edge object.
const source = [9, 28, 24, 10, 1, 20];
assert.equal(spell(source), "NEAAIUL");

// Reconstruct the already charged 44-transform family from #1705.
const orbit = [1, 3, 9, 27, 25, 19];
const transforms = [];
for (const boundaryExponent of orbit) {
  for (const wordExponent of orbit) {
    transforms.push({
      kind: "uniform",
      name: `u-${boundaryExponent}-${wordExponent}`,
      apply() {
        return [
          pow29(source[0], boundaryExponent),
          ...source.slice(1).map((value) => pow29(value, wordExponent)),
        ];
      },
    });
  }
}
for (const boundaryBase of [3, 19]) {
  for (const wordBase of [3, 19]) {
    for (const depthDirection of ["outer-in", "inner-out"]) {
      const depths = depthDirection === "outer-in"
        ? [1, 2, 3, 2, 1]
        : [3, 2, 1, 2, 3];
      const wordExponents = depths.map((depth) =>
        pow29(wordBase, depth) % 28
      );
      transforms.push({
        kind: "per-shell",
        name: `s-${boundaryBase}-${wordBase}-${depthDirection}`,
        apply() {
          return [
            pow29(source[0], boundaryBase),
            ...source.slice(1).map((value, index) =>
              pow29(value, wordExponents[index])
            ),
          ];
        },
      });
    }
  }
}
assert.equal(transforms.length, 44);

// Charge every possible nonempty two-part split of every six-rune transform.
// Output reversal adds no new GP0 address triples here: reversing a six-rune
// output maps split k to split 6-k with the endpoint order swapped, both of
// which are already charged below.
const hits = [];
const addressTriples = new Set();

for (const transform of transforms) {
  const output = transform.apply();
  const wholeAddress = sum(output);
  assert(wholeAddress >= 0 && wholeAddress < 256);

  for (let splitAt = 1; splitAt <= 5; splitAt += 1) {
    const leftAddress = sum(output.slice(0, splitAt));
    const rightAddress = sum(output.slice(splitAt));
    assert(leftAddress >= 0 && leftAddress < 256);
    assert(rightAddress >= 0 && rightAddress < 256);
    addressTriples.add(`${wholeAddress},${leftAddress},${rightAddress}`);

    for (const semantic of semantics) {
      const wholeMask = wholeWindowMask(
        tableTokens[wholeAddress], semantic);
      const splitMask = splitWindowMask(
        tableTokens[leftAddress],
        tableTokens[rightAddress],
        semantic,
      );
      const receiverPair = compatiblePair(wholeMask, splitMask);
      if (!receiverPair) continue;

      hits.push({
        transform: transform.name,
        kind: transform.kind,
        output,
        spelling: spell(output),
        splitAt,
        addresses: {
          whole: wholeAddress,
          left: leftAddress,
          right: rightAddress,
        },
        tokens: {
          whole: tableTokens[wholeAddress],
          left: tableTokens[leftAddress],
          right: tableTokens[rightAddress],
        },
        semantic,
        receiverPair,
      });
    }
  }
}

// Exactly one of all 44 x 5 transform/split candidates survives the frozen
// receiver criterion, and it is the original cube-direction READ|OUT result.
assert.deepEqual(hits, [{
  transform: "u-3-27",
  kind: "uniform",
  output: [4, 28, 23, 3, 1, 16],
  spelling: "READOUT",
  splitAt: 3,
  addresses: {whole: 75, left: 55, right: 20},
  tokens: {whole: "2v", left: "1K", right: "1g"},
  semantic: {mode: "base60", receiverOrigin: 0},
  receiverPair: {
    whole: {id: 1, page: 0, start: 166, end: 188, center: 177},
    split: {id: 0, page: 0, start: 80, end: 102, center: 91},
  },
}]);

// Directly lock the Critic's four source-motivated directional/action-count
// rivals. Only (3,27) has any receiver hit under any of its five splits.
const motivated = [
  ["u-3-27", [4, 28, 23, 3, 1, 16]],
  ["u-19-27", [5, 28, 23, 3, 1, 16]],
  ["u-1-9", [9, 28, 25, 18, 1, 23]],
  ["u-1-25", [9, 28, 16, 27, 1, 7]],
];
for (const [name, expectedOutput] of motivated) {
  const transform = transforms.find((item) => item.name === name);
  assert.ok(transform);
  assert.deepEqual(transform.apply(), expectedOutput);
}
assert.equal(hits.filter((hit) => hit.transform === "u-3-27").length, 1);
for (const rival of ["u-19-27", "u-1-9", "u-1-25"]) {
  assert.equal(hits.filter((hit) => hit.transform === rival).length, 0);
}

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "conditional outside-p28 discriminator: frozen receiver grammar selects u-3-27 and split 3+3 uniquely; p50-numeral -> LP2-rune-offset semantics remain unauthenticated",
  source: {
    page: 28,
    span: source,
    spelling: spell(source),
  },
  chargedFamily: {
    transforms: transforms.length,
    splitPointsPerTransform: 5,
    transformSplitCandidates: transforms.length * 5,
    uniqueAddressTriples: addressTriples.size,
    outputOrientation:
      "algebraically redundant under all split points plus charged endpoint reversal",
    receiverSemantics: semantics,
    matchedReceiverWindows: geometry.length,
  },
  directionalRivals: motivated.map(([name, expectedOutput]) => ({
    transform: name,
    output: expectedOutput,
    spelling: spell(expectedOutput),
    receiverHits: hits.filter((hit) => hit.transform === name).length,
  })),
  hits,
}, null, 2));
