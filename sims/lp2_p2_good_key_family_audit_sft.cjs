"use strict";

/**
 * Audit of the prospectively selected p2 GOOD receiver.
 *
 * Phase 1 reproduces the family frozen in
 * workplace/agent16-p2-good-twoh-precommit.md before the receiver ciphertext
 * was opened: H(field,field)||H(field,field), four distinct DH labels, both
 * signs. It must remain a null if the precommit was honest.
 *
 * Phase 2 charges the broader source grammar that became visible only after
 * opening the receiver: each key slot is a one-based DH-state lookup into
 * either the already selected p28 HERE line or literal-DH line. This phase is
 * retrospective model selection and is reported as such.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} source @returns {Array<{index:number,start:number,end:number,values:number[]}>} */
function parseWords(source) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length + 1,
      start,
      end: offset - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} page @returns {string[]} */
function runeLines(page) {
  return physicalPart(page)
    .trim()
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

/** @param {string} line @returns {number[]} */
function runeValues(line) {
  return [...line]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

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
    assert.ok(token, "unmapped GP spelling " + word + " at " + offset);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @returns {Array<{word:string,values:number[]}>} */
function authenticatedFourRuneTargets() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/u)
    .slice(1)
    .join("\n");
  return [...new Map(
    (clear.match(/[A-Za-z]+/g) || [])
      .map((word) => word.toUpperCase())
      .map((word) => [word, gp(word)])
      .filter(([, values]) => values.length === 4)
  ).entries()].map(([word, values]) => ({ word, values }));
}

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function equalValues(left, right) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

const targets = authenticatedFourRuneTargets();
assert.deepEqual(
  targets.map((target) => target.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);

// Upstream prospective receiver from the committed p0-p2 / byte80 route.
const receiver = parseWords(physicalPart(2))[9];
assert.deepEqual(receiver, {
  index: 10,
  start: 36,
  end: 39,
  values: [1, 2, 8, 26],
});

// -------------------------------------------------------------------------
// Phase 1: precommitted two-H family. This family was frozen before the four
// ciphertext values above were read by Agent16.
// -------------------------------------------------------------------------
const fields = Object.entries(state);
const twoHHits = [];

for (let i = 0; i < fields.length; i += 1) {
  for (let j = 0; j < fields.length; j += 1) {
    if (j === i) continue;
    for (let k = 0; k < fields.length; k += 1) {
      if (k === i || k === j) continue;
      for (let l = 0; l < fields.length; l += 1) {
        if (l === i || l === j || l === k) continue;
        const selected = [fields[i], fields[j], fields[k], fields[l]];
        const key = [
          ...H(selected[0][1], selected[1][1]),
          ...H(selected[2][1], selected[3][1]),
        ];

        for (const sign of [-1, 1]) {
          const plain = receiver.values.map((value, index) =>
            mod29(value + sign * key[index])
          );
          const matches = targets
            .filter((target) => equalValues(target.values, plain))
            .map((target) => target.word);
          if (matches.length) {
            twoHHits.push({
              fields: selected.map(([name]) => name),
              key,
              sign,
              plain,
              matches,
            });
          }
        }
      }
    }
  }
}

assert.equal(7 * 6 * 5 * 4 * 2, 1680);
assert.deepEqual(twoHHits, []);

// -------------------------------------------------------------------------
// Phase 2: retrospective HERE/DH state-index family.
// -------------------------------------------------------------------------
const p28 = runeLines(28);
assert.equal(p28.length, 12);
const hereLine = runeValues(p28[0]);
const dhLine = runeValues(p28[5]);
assert.equal(hereLine.length, 23);
assert.equal(dhLine.length, 23);

const lookupOptions = [];
for (const [lineName, values] of Object.entries({ HERE: hereLine, DH: dhLine })) {
  for (const [field, oneBasedIndex] of Object.entries(state)) {
    lookupOptions.push({
      lineName,
      field,
      value: values[oneBasedIndex - 1],
    });
  }
}
assert.equal(lookupOptions.length, 14);

const lookupHits = [];
for (const a of lookupOptions) {
  for (const b of lookupOptions) {
    for (const c of lookupOptions) {
      for (const d of lookupOptions) {
        const descriptor = [a, b, c, d];
        const key = descriptor.map((slot) => slot.value);
        for (const sign of [-1, 1]) {
          const plain = receiver.values.map((value, index) =>
            mod29(value + sign * key[index])
          );
          const matches = targets
            .filter((target) => equalValues(target.values, plain))
            .map((target) => target.word);
          if (matches.length) {
            lookupHits.push({
              descriptor: descriptor.map((slot) =>
                slot.lineName + "[" + slot.field + "]"
              ),
              key,
              sign,
              plain,
              matches,
            });
          }
        }
      }
    }
  }
}

assert.equal(14 ** 4 * 2, 76832);
assert.deepEqual(lookupHits, [{
  descriptor: ["DH[g]", "DH[B]", "HERE[K]", "DH[b]"],
  key: [24, 28, 5, 3],
  sign: -1,
  plain: gp("GOOD"),
  matches: ["GOOD"],
}]);

const goodKey = lookupHits[0].key;
const goodPlain = receiver.values.map((value, index) =>
  mod29(value - goodKey[index])
);
assert.deepEqual(goodPlain, gp("GOOD"));
assert.deepEqual(
  goodPlain.map((value, index) => mod29(value + goodKey[index])),
  receiver.values
);

// Manuscript-wide transfer of the *whole broad lookup family* is intentionally
// weak: many receivers are reachable. Compute this to bound interpretation.
const numericOperations = new Map();
for (const a of lookupOptions) {
  for (const b of lookupOptions) {
    for (const c of lookupOptions) {
      for (const d of lookupOptions) {
        const key = [a.value, b.value, c.value, d.value];
        for (const sign of [-1, 1]) {
          numericOperations.set(sign + ":" + key.join(","), { sign, key });
        }
      }
    }
  }
}

const generated = new Map();
for (const operation of numericOperations.values()) {
  for (const target of targets) {
    const ciphertext = target.values.map((value, index) =>
      mod29(value - operation.sign * operation.key[index])
    );
    const signature = ciphertext.join(",");
    if (!generated.has(signature)) generated.set(signature, []);
    generated.get(signature).push({
      target: target.word,
      sign: operation.sign,
      key: operation.key,
    });
  }
}

let manuscriptFourRuneWords = 0;
let manuscriptMatchedWords = 0;
let manuscriptGoodHits = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parseWords(physicalPart(page))) {
    if (word.values.length !== 4) continue;
    manuscriptFourRuneWords += 1;
    const hits = generated.get(word.values.join(","));
    if (!hits) continue;
    manuscriptMatchedWords += 1;
    manuscriptGoodHits += hits.filter((hit) => hit.target === "GOOD").length;
  }
}

assert.equal(numericOperations.size, 57122);
assert.equal(manuscriptFourRuneWords, 514);
assert.equal(manuscriptMatchedWords, 247);
assert.equal(manuscriptGoodHits, 42);

console.log(JSON.stringify({
  status: "PASS",
  receiver,
  precommit: {
    family: "H(field1,field2)||H(field3,field4), four distinct DH labels, both signs",
    configurations: 1680,
    authenticatedHits: twoHHits,
    decision: "REJECT two-H serialization",
  },
  retrospectiveLookupAudit: {
    family: "each of four key slots = one-based DH-state lookup into HERE or DH line",
    configurations: 76832,
    selectedReceiverHits: lookupHits,
    exactForwardReconstruction: receiver.values,
  },
  transferBound: {
    distinctNumericOperations: numericOperations.size,
    manuscriptFourRuneWords,
    manuscriptMatchedWords,
    manuscriptGoodHits,
    interpretation:
      "The lookup family is selective on the independently chosen p2 receiver, but broad manuscript transfer is weak. Treat GOOD as a strong local candidate and the lookup grammar as a post-open hypothesis, not a global cipher.",
  },
}, null, 2));
