"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function invH(difference, sum) {
  const inv2 = 15;
  return [
    mod29((difference + sum) * inv2),
    mod29((sum - difference) * inv2),
  ];
}

function shell(values) {
  const output = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    output.push(...H(values[left], values[right]));
  }
  if (values.length % 2 === 1) {
    output.push(values[(values.length - 1) / 2]);
  }
  return output;
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(text) {
  const output = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    output.push({
      index: output.length,
      start,
      end: offset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return output;
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/)
  .slice(1)
  .join("\n");
const signedWords = clear
  .split(/[^A-Za-z0-9]+/)
  .filter((token) => /^[A-Za-z]+$/.test(token))
  .map((word) => word.toUpperCase());

const primusIndex = signedWords.indexOf("PRIMUS");
assert.equal(primusIndex, 10);
assert.deepEqual(
  signedWords.slice(primusIndex - 1, primusIndex + 4),
  ["LIBER", "PRIMUS", "IS", "THE", "WAY"]
);

assert.equal(gp0("PRIMUS"), 62);
assert.equal(table[62], "24");
assert.equal(decodeToken(table[62], alphabet59), 122);
assert.equal(decodeToken(table[62], alphabet60), 124);

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.map((word) => [word.start, word]));
const left = p0ByStart.get(122);
const right = p0ByStart.get(124);
assert.ok(left && right);
assert.equal(left.length, 2);
assert.equal(right.length, 3);
assert.equal(left.end + 1, right.start);
assert.deepEqual(left.values, [2, 13]);
assert.deepEqual(right.values, [26, 21, 28]);

const leftShell = shell(left.values);
const rightShell = shell(right.values);
assert.deepEqual(leftShell, [18, 15]);
assert.deepEqual(rightShell, [27, 25, 21]);

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
assert.deepEqual(leftShell, [H(state.A, state.B)[0], state.b]);
assert.deepEqual(
  rightShell,
  [H(state.A, state.B)[1], mod29(state.p + state.K), mod29(state.p - state.K)]
);

// The pair reconstructs the key DH fields rather than merely matching them.
const [A, B] = invH(leftShell[0], rightShell[0]);
const [p, K] = invH(rightShell[2], rightShell[1]);
const b = leftShell[1];
assert.deepEqual({ p, b, A, B, K }, {
  p: state.p, b: state.b, A: state.A, B: state.B, K: state.K,
});
const e = inverseMod(b, p - 1);
assert.equal(e, 3);

// The exact ordered state-packet pair is unique among all adjacent 2->3 words.
let adjacent23 = 0;
const exactPacketPairs = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  const words = parsePage(parts[partIndex]);
  for (let index = 0; index + 1 < words.length; index += 1) {
    const first = words[index];
    const second = words[index + 1];
    if (first.length !== 2 || second.length !== 3) continue;
    adjacent23 += 1;
    if (
      shell(first.values).join(",") === leftShell.join(",") &&
      shell(second.values).join(",") === rightShell.join(",")
    ) {
      exactPacketPairs.push({
        page: physicalPage,
        words: [first.index, second.index],
        starts: [first.start, second.start],
        values: [first.values, second.values],
      });
    }
  }
}
assert.equal(adjacent23, 123);
assert.deepEqual(exactPacketPairs, [{
  page: 0,
  words: [27, 28],
  starts: [122, 124],
  values: [[2, 13], [26, 21, 28]],
}]);

// Generic cross-receiver rule for IS:
// reverse the outer coordinates of the right three-rune H shell and subtract
// them from the adjacent two-rune receiver.
const twoRuneTargets = new Map(
  [...new Map(
    signedWords
      .map((word) => ({ word, values: gp(word) }))
      .filter((row) => row.values.length === 2)
      .map((row) => [row.values.join(","), row])
  ).values()].map((row) => [row.values.join(","), row.word])
);
assert.deepEqual([...twoRuneTargets.values()], ["THE", "IS", "BE"]);

const crossRuleHits = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  const words = parsePage(parts[partIndex]);
  for (let index = 0; index + 1 < words.length; index += 1) {
    const first = words[index];
    const second = words[index + 1];
    if (first.length !== 2 || second.length !== 3) continue;
    const secondShell = shell(second.values);
    const key = [secondShell[2], secondShell[0]];
    const plain = first.values.map((value, keyIndex) =>
      mod29(value - key[keyIndex])
    );
    const target = twoRuneTargets.get(plain.join(","));
    if (target) {
      crossRuleHits.push({
        page: physicalPage,
        words: [first.index, second.index],
        starts: [first.start, second.start],
        key,
        plain,
        target,
        secondShell,
      });
    }
  }
}
assert.deepEqual(crossRuleHits, [{
  page: 0,
  words: [27, 28],
  starts: [122, 124],
  key: [21, 27],
  plain: gp("IS"),
  target: "IS",
  secondShell: [27, 25, 21],
}]);

// The source predicts WAY after IS THE. A compact key from the reconstructed
// state plus the independently fixed GCD inverse e is [B,p+e,K].
const wayKey = [B, mod29(p + e), K];
assert.deepEqual(wayKey, [19, 26, 2]);
const wayPlain = right.values.map((value, index) =>
  mod29(value - wayKey[index])
);
assert.deepEqual(wayPlain, gp("WAY"));

const threeRuneTargets = new Map(
  [...new Map(
    signedWords
      .map((word) => ({ word, values: gp(word) }))
      .filter((row) => row.values.length === 3)
      .map((row) => [row.values.join(","), row])
  ).values()].map((row) => [row.values.join(","), row.word])
);

let threeRuneWordCount = 0;
const wayKeyHits = [];
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const physicalPage = partIndex <= 49 ? partIndex : partIndex + 1;
  for (const word of parsePage(parts[partIndex])) {
    if (word.length !== 3) continue;
    threeRuneWordCount += 1;
    const plain = word.values.map((value, index) =>
      mod29(value - wayKey[index])
    );
    const target = threeRuneTargets.get(plain.join(","));
    if (target) {
      wayKeyHits.push({
        page: physicalPage,
        word: word.index,
        start: word.start,
        cipher: word.values,
        plain,
        target,
      });
    }
  }
}
assert.equal(threeRuneWordCount, 726);
assert.deepEqual(wayKeyHits, [{
  page: 0,
  word: 28,
  start: 124,
  cipher: [26, 21, 28],
  plain: gp("WAY"),
  target: "WAY",
}]);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "source-selected PRIMUS dual-radix receiver pair with unique ordered H-state packet. The generic cross-receiver shell rule uniquely recovers authenticated IS over all 123 adjacent 2->3 pairs. The adjacent three-rune receiver decrypts uniquely to authenticated WAY under compact reconstructed-state key [B,p+e,K], but that WAY key-order rule was recognized after the target was known and remains candidate-level.",
  source: {
    context: signedWords.slice(primusIndex - 1, primusIndex + 4),
    gp0: gp0("PRIMUS"),
    token: table[62],
    base59: 122,
    base60: 124,
  },
  pair: {
    left: { start: left.start, values: left.values, shell: leftShell },
    right: { start: right.start, values: right.values, shell: rightShell },
    reconstructed: { p, b, A, B, K, e },
    adjacent23,
    exactPacketPairs,
  },
  is: { crossRuleHits },
  way: { key: wayKey, plain: wayPlain, threeRuneWordCount, wayKeyHits },
}, null, 2));
