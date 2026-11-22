"use strict";

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
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
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

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
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
      length: current.length,
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

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function outerH(fragment) {
  assert.ok(fragment.length >= 2);
  return H(fragment[0], fragment[fragment.length - 1]);
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("no modular inverse");
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.words.map((word) => [word.start, word]));
const p28Lines = parts[28].trim().split("/").filter((line) => line.trim().length > 0);
const lineNumber = 6;
const fragments = lineFragments(p28Lines[lineNumber - 1]);
const outer = fragments.map(outerH);

assert.equal(p0.words.length, 59);
assert.equal(tableTokens.length, 256);
assert.equal(fragments.length, 5);
assert.equal(fragments.reduce((total, fragment) => total + fragment.length, 0), 23);
assert.equal(translit(fragments[0]), "DH");
assert.deepEqual(outer, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);

const state = {
  p: outer[3][0],
  g: fragments.length,
  a: lineNumber,
  b: outer[0][0],
  A: outer[4][0],
  B: outer[4][1],
  K: outer[0][1],
};
assert.deepEqual(state, {
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2,
});
assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.A, state.b, state.p), state.K);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.deepEqual(outer[3], [state.p, mod29(state.K * state.a)]);

const message = signedWords();
assert.equal(message.length, 43);
const youIndex = message.findIndex((word) => word.toLowerCase() === "you");
assert.equal(youIndex, 32);
assert.equal(message[youIndex + 1].toLowerCase(), "will");

const youAddress = gp0("YOU");
assert.equal(youAddress, 30);
const selectedToken = tableTokens[youAddress];
assert.equal(selectedToken, "2L");

// The token is duplicated in p50; the signed message's GP0 addresses select
// only its occurrence at cell30.
const duplicateTokenAddresses = tableTokens.flatMap((token, index) =>
  token === "2L" ? [index] : []
);
assert.deepEqual(duplicateTokenAddresses, [30, 133, 241]);
const signedAddressesToDuplicate = message.flatMap((word, index) => {
  const address = gp0(word);
  return tableTokens[address] === "2L"
    ? [{ index, word: word.toLowerCase(), address }]
    : [];
});
assert.deepEqual(signedAddressesToDuplicate, [
  { index: 32, word: "you", address: 30 },
]);

// Candidate A1Z26 cross-check: digit2=DH K and L=12=DH K*a.
// This verifies a cross-object equality; it does not authenticate A1Z26 as
// the creator's intended letter-number convention.
const match = selectedToken.match(/^([1-9])([A-Za-z])$/);
assert.ok(match);
const digit = Number(match[1]);
const letter = match[2].toUpperCase();
const a1z26 = letter.charCodeAt(0) - 64;
assert.equal(digit, state.K);
assert.equal(a1z26, mod29(state.K * state.a));
const recoveredA = mod29(a1z26 * inverseMod(digit, 29));
assert.equal(recoveredA, state.a);
assert.equal(recoveredA, lineNumber);

// The literal reading is independently consistent with the next signed word.
assert.equal(
  [...message[youIndex + 1].toUpperCase()].filter((character) => character === "L").length,
  digit
);

// Exhaust all signed-word positions and the four conventional numeral modes.
// The only same-ordinal receiver is YOU(index32)->p0 word32 under base60/zero.
const sameIndexHits = [];
const compoundHits = [];
const youModes = [];
for (let index = 0; index < message.length; index += 1) {
  const address = gp0(message[index]);
  if (address >= tableTokens.length) continue;
  const token = tableTokens[address];
  for (const [radix, alphabet] of [
    ["base60", alphabet60],
    ["base59", alphabet59],
  ]) {
    for (const [origin, delta] of [
      ["zero", 0],
      ["one", -1],
    ]) {
      const numeric = decodeToken(token, alphabet);
      if (numeric === null) continue;
      const offset = numeric + delta;
      const receiver = p0ByStart.get(offset);
      if (!receiver) continue;
      const row = {
        index,
        word: message[index].toLowerCase(),
        token,
        radix,
        origin,
        offset,
        p0WordIndex: receiver.index,
        p0Length: receiver.length,
      };
      if (receiver.index === index) sameIndexHits.push(row);
      if (index === youIndex) youModes.push(row);

      if (index + 1 >= message.length) continue;
      const countMatch = token.match(/^([1-9])([A-Za-z])$/);
      if (!countMatch) continue;
      const count = Number(countMatch[1]);
      const letterToCount = countMatch[2].toUpperCase();
      const nextWord = message[index + 1];
      const actualCount = [...nextWord.toUpperCase()]
        .filter((character) => character === letterToCount).length;
      if (
        actualCount === count &&
        receiver.length === gp(nextWord).length
      ) {
        compoundHits.push({
          index,
          from: message[index].toLowerCase(),
          to: nextWord.toLowerCase(),
          token,
          radix,
          origin,
          offset,
          p0WordIndex: receiver.index,
          p0Length: receiver.length,
        });
      }
    }
  }
}

assert.deepEqual(sameIndexHits, [{
  index: 32,
  word: "you",
  token: "2L",
  radix: "base60",
  origin: "zero",
  offset: 141,
  p0WordIndex: 32,
  p0Length: 4,
}]);
assert.deepEqual(compoundHits, [{
  index: 32,
  from: "you",
  to: "will",
  token: "2L",
  radix: "base60",
  origin: "zero",
  offset: 141,
  p0WordIndex: 32,
  p0Length: 4,
}]);
assert.deepEqual(youModes, [{
  index: 32,
  word: "you",
  token: "2L",
  radix: "base60",
  origin: "zero",
  offset: 141,
  p0WordIndex: 32,
  p0Length: 4,
}]);

const receiver = p0ByStart.get(141);
assert.ok(receiver);
assert.equal(receiver.index, youIndex);
assert.deepEqual(receiver.values, [19, 16, 9, 18]);
const key = [
  mod29(state.K * state.a),
  state.a,
  ...H(state.A, state.B),
];
assert.deepEqual(key, [12, 6, 18, 27]);
const plaintext = receiver.values.map((value, index) =>
  mod29(value - key[index])
);
assert.deepEqual(plaintext, gp("WILL"));
assert.deepEqual(
  plaintext.map((value, index) => mod29(value + key[index])),
  receiver.values
);

// Retain the already reported p50 graph continuation as a separate check.
const willAddress = gp0("WILL");
const firstHopToken = tableTokens[willAddress];
const firstHop = decodeToken(firstHopToken, alphabet60);
const secondHopToken = tableTokens[firstHop];
const secondHop = decodeToken(secondHopToken, alphabet60);
assert.equal(willAddress, 57);
assert.equal(firstHopToken, "1w");
assert.equal(firstHop, 118);
assert.equal(secondHopToken, "0Z");
assert.equal(secondHop, gp0("BE"));
assert.equal(secondHop, 35);

console.log(JSON.stringify({
  classification: "local candidate; A1Z26 is an unauthenticated cross-check",
  p28: { line: 6, fragments: fragments.map(translit), outerH: outer, state },
  p50: {
    youIndex,
    youAddress,
    token: selectedToken,
    duplicateTokenAddresses,
    signedAddressesToDuplicate,
    a1z26LetterValue: a1z26,
    recoveredPrivateExponent: recoveredA,
    base60Zero: 141,
  },
  receiver: {
    p0WordIndex: receiver.index,
    start: receiver.start,
    end: receiver.end,
    ciphertext: receiver.values,
    key,
    plaintext: translit(plaintext),
    exactForwardReplay: true,
  },
  uniqueSameIndexHit: sameIndexHits[0],
  uniqueCompoundHit: compoundHits[0],
  willToBe: { firstHopToken, firstHop, secondHopToken, secondHop },
}, null, 2));
