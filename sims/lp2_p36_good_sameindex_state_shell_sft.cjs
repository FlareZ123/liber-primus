"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} word */
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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Canonical four-rune outside-in H serialization used by p33/p40:
 * [k0-k3, k1-k2, k1+k2, k0+k3].
 *
 * @param {number[]} values
 */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} shell */
function h4Inv(shell) {
  assert.equal(shell.length, 4);
  const inv2 = 15;
  return [
    mod29((shell[0] + shell[3]) * inv2),
    mod29((shell[1] + shell[2]) * inv2),
    mod29((shell[2] - shell[1]) * inv2),
    mod29((shell[3] - shell[0]) * inv2),
  ];
}

/** @param {string} text */
function parsePage(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      ordinal: words.length + 1,
      start,
      end: offset - 1,
      values: values.slice(),
      sum: sum(values),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if ((char === "-" || char === "." || char === "/") && values.length) {
      flush();
    }
  }
  flush();
  return words;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const message = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => {
    const values = gp(word);
    return {
      index,
      word: word.toUpperCase(),
      values,
      sum: sum(values),
    };
  });

assert.equal(message.length, 43);

const findIndex = (word) => {
  const row = message.find((candidate) => candidate.word === word);
  assert.ok(row, "missing source word " + word);
  return row.index;
};

const state = Object.freeze({
  K: findIndex("PATH"),
  e: findIndex("LIES"),
  q: findIndex("EMPTY"),
  g: findIndex("EPIPHANY"),
  a: findIndex("SEEKS"),
  A: findIndex("DEVOTED"),
  b: findIndex("WORDS"),
  B: message.findIndex((row) => row.word === "THEIR"),
  p: findIndex("ROAD"),
});
assert.deepEqual(state, {
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
});

const parts = transcription.split(/^\s*%\s*$/m);
const good = message[36];
assert.equal(good.word, "GOOD");
assert.deepEqual(good.values, [state.a, state.e, state.e, state.p]);
assert.equal(good.sum, 35);

const p36Words = parsePage(parts[36]);
const goodStateReceivers = p36Words.filter(
  (word) => word.values.length === 4 && word.sum === good.sum
);
assert.deepEqual(
  goodStateReceivers.map((word) => [word.start, word.values]),
  [[87, [11, 0, 13, 11]]]
);

const receiver = goodStateReceivers[0];
const key = receiver.values.map((value, index) =>
  mod29(value - good.values[index])
);
assert.deepEqual(key, [5, 26, 10, 17]);
assert.deepEqual(key, [
  state.g,
  mod29(-state.e),
  mod29(state.A + state.K),
  mod29(state.b + state.K),
]);

const shell = h4(key);
assert.deepEqual(shell, [17, 16, 7, 22]);
assert.deepEqual(shell, [
  mod29(state.b + state.K),
  mod29(state.K - state.b),
  mod29(state.g + state.K),
  mod29(state.p - 1),
]);

const decoded = receiver.values.map((value, index) =>
  mod29(value - key[index])
);
assert.deepEqual(decoded, good.values);

// The authored THEIR RISE step also gives a held source relation at the
// endpoint of the final +6 corridor.
const their = message
  .filter((row) => row.word === "THEIR")
  .map((row) => row.index);
assert.deepEqual(their, [19, 25]);
const rise = their[1] - their[0];
assert.equal(rise, state.a);
assert.equal(message[42].word, "OPENPGP");
const goodToOpenPgpRise = mod29(message[42].sum - good.sum);
assert.equal(goodToOpenPgpRise, state.a + state.g);
assert.equal(receiver.values[0], goodToOpenPgpRise);
assert.equal(receiver.values[3], goodToOpenPgpRise);

// Complete same-index state census for authenticated four-GP-rune words.
const fourRuneRows = message.filter((row) => row.values.length === 4);
const sameIndexStateHits = [];
for (const source of fourRuneRows) {
  const candidates = parsePage(parts[source.index]).filter(
    (word) => word.values.length === 4 && word.sum === source.sum
  );
  for (const candidate of candidates) {
    sameIndexStateHits.push({
      page: source.index,
      target: source.word,
      start: candidate.start,
      values: candidate.values,
    });
  }
}
assert.deepEqual(
  sameIndexStateHits.map((row) => [row.page, row.target, row.start]),
  [
    [33, "WILL", 132],
    [36, "GOOD", 87],
    [40, "PATHS", 71],
  ]
);

// Charge a compact state family around the observed shell:
// [x+K, K-x, y+K, p-1], x,y in the nine authenticated DH fields.
const stateEntries = Object.entries(state);
const distinctTargets = [
  ...new Map(fourRuneRows.map((row) => [row.word, row.values])).entries(),
].map(([word, values]) => ({ word, values }));

const familyHits = [];
let familyConfigurations = 0;
for (const [xName, x] of stateEntries) {
  for (const [yName, y] of stateEntries) {
    const candidateShell = [
      mod29(x + state.K),
      mod29(state.K - x),
      mod29(y + state.K),
      mod29(state.p - 1),
    ];
    const candidateKey = h4Inv(candidateShell);

    for (const word of p36Words.filter((row) => row.values.length === 4)) {
      for (const target of distinctTargets) {
        for (const direction of ["subtract", "add"]) {
          familyConfigurations += 1;
          const output = word.values.map((value, index) =>
            direction === "subtract"
              ? mod29(value - candidateKey[index])
              : mod29(value + candidateKey[index])
          );
          if (output.every((value, index) => value === target.values[index])) {
            familyHits.push({
              xName,
              yName,
              shell: candidateShell,
              key: candidateKey,
              start: word.start,
              target: target.word,
              direction,
            });
          }
        }
      }
    }
  }
}
assert.equal(familyConfigurations, 11664);
assert.deepEqual(familyHits, [{
  xName: "b",
  yName: "g",
  shell: [17, 16, 7, 22],
  key: [5, 26, 10, 17],
  start: 87,
  target: "GOOD",
  direction: "subtract",
}]);

// Hold the exact key manuscript-wide against the same authenticated target set.
let manuscriptWords = 0;
let fixedKeyConfigurations = 0;
const fixedKeyHits = [];
for (let page = 0; page <= 55; page += 1) {
  const words = parsePage(parts[page]).filter((row) => row.values.length === 4);
  manuscriptWords += words.length;

  for (const word of words) {
    for (const target of distinctTargets) {
      for (const direction of ["subtract", "add"]) {
        fixedKeyConfigurations += 1;
        const output = word.values.map((value, index) =>
          direction === "subtract"
            ? mod29(value - key[index])
            : mod29(value + key[index])
        );
        if (output.every((value, index) => value === target.values[index])) {
          fixedKeyHits.push({
            page,
            start: word.start,
            target: target.word,
            direction,
          });
        }
      }
    }
  }
}
assert.equal(manuscriptWords, 562);
assert.equal(fixedKeyConfigurations, 8992);
assert.deepEqual(fixedKeyHits, [{
  page: 36,
  start: 87,
  target: "GOOD",
  direction: "subtract",
}]);

console.log("PASS p36 same-index GOOD state-shell candidate");
console.log(JSON.stringify({
  target: good.word,
  targetValues: good.values,
  receiverStart: receiver.start,
  receiver: receiver.values,
  key,
  shell,
  sourceRiseToOpenPgp: goodToOpenPgpRise,
  sameIndexStateHits: sameIndexStateHits.map((row) => [
    row.page,
    row.target,
    row.start,
  ]),
  familyConfigurations,
  familyHits,
  manuscriptWords,
  fixedKeyConfigurations,
  fixedKeyHits,
}, null, 2));
