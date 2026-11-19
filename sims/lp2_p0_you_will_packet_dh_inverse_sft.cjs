"use strict";

/**
 * SFT: p0 141..144 conditional WILL recovery from the YOU self-index receiver.
 *
 * Frozen upstream:
 * - authenticated 2016 signed-message word order;
 * - conventional base60 p50 values and zero-based p0 offsets;
 * - candidate DEVOTED at p0 237..243;
 * - the selected split/whole 23-rune H packets;
 * - the DH23 state p=23,g=5,a=6,b=15,A=8,B=19,K=2;
 * - one-based packet indexing.
 *
 * The receiver is selected before its contents are used:
 *   GP0(DEVOTED)=102 -> p50=32 -> signed word32 YOU
 *   GP0(YOU)=30 -> p50=141 -> p0 zero-based word32
 *
 * Run:
 *   node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table60 = grid.pages.flatMap((page) => page.bytes);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function shellWord(values) {
  const out = [];
  for (let left = 0, right = values.length - 1;
    left < right; left += 1, right -= 1) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) {
    out.push(values[(values.length - 1) / 2]);
  }
  return out;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

const p0 = parsePage(transcription.split(/^\s*%\s*$/m)[0]);
const message = signedWords();
assert.equal(p0.words.length, 59);
assert.equal(message.length, 43);

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
const stateEntries = Object.entries(state);

// Receiver selection uses only the pre-existing DEVOTED candidate and source maps.
assert.equal(sum(gp("DEVOTED")), 102);
assert.equal(table60[102], 32);
assert.equal(message[32].toLowerCase(), "you");
assert.equal(sum(gp("YOU")), 30);
assert.equal(table60[30], 141);

const receiver = p0.words.find((word) => word.start === 141);
assert.ok(receiver);
assert.equal(receiver.index, 32);
assert.equal(receiver.end, 144);
assert.deepEqual(receiver.values, [19, 16, 9, 18]);

// Before the inverse family is charged, signed word33 supplies the next-word
// candidate and independently matches the four-rune receiver length.
assert.equal(message[33].toLowerCase(), "will");
assert.deepEqual(gp(message[33]), [7, 10, 20, 20]);
assert.equal(gp(message[33]).length, receiver.values.length);

// Reconstruct the two already selected 23-rune H packets.
function wordsIn(start, end) {
  return p0.words.filter((word) => word.start >= start && word.end <= end);
}
function shellWords(words) {
  return words.flatMap((word) => shellWord(word.values));
}

const split = shellWords(wordsIn(80, 102));
const whole = shellWords(wordsIn(166, 188));
assert.equal(split.length, 23);
assert.equal(whole.length, 23);
assert.deepEqual(split, [
  19, 23, 25, 4, 16, 12, 9, 6, 10, 14, 15, 8,
  24, 5, 21, 5, 28, 26, 22, 9, 0, 18, 2,
]);
assert.deepEqual(whole, [
  15, 8, 22, 10, 11, 15, 10, 2, 13, 8, 28, 15,
  14, 8, 20, 12, 9, 4, 25, 4, 7, 24, 19,
]);

// The exact candidate key uses one-based packet lookups and the existing H.
const exactKey = [
  split[state.a - 1],
  split[state.A - 1],
  ...H(state.A, state.B),
];
assert.deepEqual(exactKey, [12, 6, 18, 27]);

const plaintext = receiver.values.map((value, index) =>
  mod29(value - exactKey[index])
);
assert.deepEqual(plaintext, gp("WILL"));
const reencryption = plaintext.map((value, index) =>
  mod29(value + exactKey[index])
);
assert.deepEqual(reencryption, receiver.values);

// Target family: all distinct authenticated signed words represented by four GP runes.
const targets = new Map();
for (let index = 0; index < message.length; index += 1) {
  const values = gp(message[index]);
  if (values.length !== 4) continue;
  const key = values.join(",");
  if (!targets.has(key)) targets.set(key, []);
  targets.get(key).push({ index, word: message[index].toLowerCase() });
}
assert.equal(targets.size, 9);

function scanFixedOneBased() {
  const hits = [];
  let configurations = 0;
  for (const [packetName, packet] of [["split", split], ["whole", whole]]) {
    for (const [firstName, firstValue] of stateEntries) {
      for (const [secondName, secondValue] of stateEntries) {
        for (const [hLeftName, hLeftValue] of stateEntries) {
          for (const [hRightName, hRightValue] of stateEntries) {
            const key = [
              packet[firstValue - 1],
              packet[secondValue - 1],
              ...H(hLeftValue, hRightValue),
            ];
            for (const sign of ["subtract", "add"]) {
              configurations += 1;
              const candidate = receiver.values.map((value, index) =>
                sign === "subtract"
                  ? mod29(value - key[index])
                  : mod29(value + key[index])
              );
              const matched = targets.get(candidate.join(","));
              if (matched) {
                hits.push({
                  packet: packetName,
                  selector: [firstName, secondName],
                  hPair: [hLeftName, hRightName],
                  key,
                  sign,
                  targets: matched,
                });
              }
            }
          }
        }
      }
    }
  }
  return { configurations, hits };
}

const fixedFamily = scanFixedOneBased();
assert.equal(fixedFamily.configurations, 9604);
assert.deepEqual(fixedFamily.hits, [{
  packet: "split",
  selector: ["a", "A"],
  hPair: ["A", "B"],
  key: [12, 6, 18, 27],
  sign: "subtract",
  targets: [{ index: 33, word: "will" }],
}]);

// Origin control: add zero-based packet indexing without changing any other rule.
// The only added hit is a ROAD candidate under whole/zero, which conflicts with
// the already frozen one-based packet convention.
function scanOrigins() {
  const hits = [];
  let configurations = 0;
  for (const [packetName, packet] of [["split", split], ["whole", whole]]) {
    for (const origin of ["one", "zero"]) {
      for (const [firstName, firstValue] of stateEntries) {
        for (const [secondName, secondValue] of stateEntries) {
          const firstIndex = origin === "one" ? firstValue - 1 : firstValue;
          const secondIndex = origin === "one" ? secondValue - 1 : secondValue;
          if (firstIndex < 0 || firstIndex >= packet.length) continue;
          if (secondIndex < 0 || secondIndex >= packet.length) continue;
          for (const [hLeftName, hLeftValue] of stateEntries) {
            for (const [hRightName, hRightValue] of stateEntries) {
              const key = [
                packet[firstIndex],
                packet[secondIndex],
                ...H(hLeftValue, hRightValue),
              ];
              for (const sign of ["subtract", "add"]) {
                configurations += 1;
                const candidate = receiver.values.map((value, index) =>
                  sign === "subtract"
                    ? mod29(value - key[index])
                    : mod29(value + key[index])
                );
                const matched = targets.get(candidate.join(","));
                if (matched) {
                  hits.push({
                    packet: packetName,
                    origin,
                    selector: [firstName, secondName],
                    hPair: [hLeftName, hRightName],
                    key,
                    sign,
                    targets: matched,
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  return { configurations, hits };
}

const originControl = scanOrigins();
assert.equal(originControl.configurations, 16660);
assert.deepEqual(originControl.hits, [
  {
    packet: "split",
    origin: "one",
    selector: ["a", "A"],
    hPair: ["A", "B"],
    key: [12, 6, 18, 27],
    sign: "subtract",
    targets: [{ index: 33, word: "will" }],
  },
  {
    packet: "whole",
    origin: "zero",
    selector: ["g", "A"],
    hPair: ["B", "g"],
    key: [15, 13, 14, 24],
    sign: "subtract",
    targets: [{ index: 23, word: "road" }],
  },
]);

console.log(JSON.stringify({
  status: "PASS: p0 141..144 conditionally recovers WILL",
  receiver: {
    source: "DEVOTED -> signed YOU -> self-index p0 word32",
    offsets: [receiver.start, receiver.end],
    ciphertext: receiver.values,
    predictedNextSignedWord: message[33].toLowerCase(),
  },
  key: {
    formula: "[split[a], split[A], H(A,B)]",
    values: exactKey,
    plaintext,
    plaintextText: "WILL",
    reencryption,
  },
  fixedOneBasedFamily: fixedFamily,
  originControl,
  classification:
    "conditional value-changing recovery: the receiver and WILL candidate are selected before the packet/H inverse family; the exact split(a,A)+H(A,B) subtraction is the sole authenticated four-rune target hit under the frozen one-based family.",
}, null, 2));
