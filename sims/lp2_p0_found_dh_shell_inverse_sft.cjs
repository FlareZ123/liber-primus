"use strict";

/**
 * SFT: p0 117..121 FOUND candidate from the p28 literal-DH state.
 *
 * The p0 receiver and the target label FOUND are selected upstream by the
 * authenticated WILL -> BE -> FOUND carrier before this word's values are
 * consumed. This test derives an Alice-side five-rune shell key from the
 * independently reconstructed p28 DH23 state, verifies the exact inverse,
 * charges a broad role/permutation family, and records the next source-native
 * FOUND -> GOOD compound navigation consequence without claiming GOOD
 * plaintext.
 *
 * Run:
 *   node sims/lp2_p0_found_dh_shell_inverse_sft.cjs
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
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
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
  return sum(gp(word));
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

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function outerH(fragment) {
  assert.ok(fragment.length >= 2);
  return H(fragment[0], fragment[fragment.length - 1]);
}

function physicalLines(page) {
  return parts[page].trim().split("/").filter((line) => line.trim().length > 0);
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

function uniquePermutations(values) {
  const output = new Map();
  function visit(prefix, rest) {
    if (!rest.length) {
      output.set(prefix.join(","), prefix);
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(
        prefix.concat(rest[index]),
        rest.slice(0, index).concat(rest.slice(index + 1))
      );
    }
  }
  visit([], values);
  return [...output.values()];
}

function decrypt(values, key, sign) {
  return values.map((value, index) => mod29(value + sign * key[index]));
}

const p0 = parsePage(parts[0]);
const message = signedWords();
assert.equal(p0.words.length, 59);
assert.equal(message.length, 43);

// Reconstruct the source-local DH state from the sole literal-DH line.
const p28Lines = physicalLines(28);
const literalDhLines = [];
for (let lineIndex = 0; lineIndex < p28Lines.length; lineIndex += 1) {
  const fragments = lineFragments(p28Lines[lineIndex]);
  if (fragments.length && translit(fragments[0]) === "DH") {
    literalDhLines.push({ lineIndex, fragments });
  }
}
assert.equal(literalDhLines.length, 1);
const dhLine = literalDhLines[0];
assert.equal(dhLine.lineIndex + 1, 6);
assert.equal(dhLine.fragments.length, 5);
const hStream = dhLine.fragments.map(outerH);
assert.deepEqual(hStream, [
  [15, 2],
  [14, 4],
  [12, 12],
  [23, 12],
  [8, 19],
]);

const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
};
assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.A, state.b, state.p), state.K);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.deepEqual(hStream[0], [state.b, state.K]);
assert.deepEqual(hStream[3], [state.p, mod29(state.K * state.a)]);
assert.deepEqual(hStream[4], [state.A, state.B]);

// Upstream receiver selection from the authenticated WILL -> BE -> FOUND triple.
const willIndex = message.findIndex((word, index) =>
  word.toLowerCase() === "will" && message[index + 1]?.toLowerCase() === "be"
);
assert.equal(willIndex, 33);
assert.equal(message[willIndex + 2].toLowerCase(), "found");
assert.equal(gp0("WILL"), 57);
assert.equal(gp0("BE"), 35);

let direction = gp0("WILL");
const walk = [direction];
for (let hop = 0; hop < state.K; hop += 1) {
  direction = decodeToken(tableTokens[direction], alphabet60);
  walk.push(direction);
}
assert.deepEqual(walk, [57, 118, 35]);
const foundReceiver = p0.words.find((word) =>
  word.start <= walk[1] && walk[1] <= word.end
);
assert.ok(foundReceiver);
assert.equal(foundReceiver.index, 26);
assert.equal(foundReceiver.start, 117);
assert.equal(foundReceiver.end, 121);
assert.equal(foundReceiver.length, gp("FOUND").length);
assert.deepEqual(foundReceiver.values, [12, 2, 11, 10, 2]);

// Alice-side shell key. In word order its shells are:
// outer [K*a, A], inner [g-a, a-g], center K*g.
const aliceKey = [
  mod29(state.K * state.a),
  mod29(state.g - state.a),
  mod29(state.K * state.g),
  mod29(state.a - state.g),
  state.A,
];
const bobKey = [
  mod29(state.K * state.b),
  mod29(state.g - state.b),
  mod29(state.K * state.g),
  mod29(state.b - state.g),
  state.B,
];
assert.deepEqual(aliceKey, [12, 28, 10, 1, 8]);
assert.deepEqual(bobKey, [1, 19, 10, 10, 19]);

const foundPlain = decrypt(foundReceiver.values, aliceKey, -1);
assert.deepEqual(foundPlain, gp("FOUND"));
assert.equal(translit(foundPlain), "FOUND");
assert.deepEqual(decrypt(foundPlain, aliceKey, +1), foundReceiver.values);

// Under the frozen H shell, FOUND is itself a compact DH-state readout.
const foundShell = [
  ...H(foundPlain[0], foundPlain[4]),
  ...H(foundPlain[1], foundPlain[3]),
  foundPlain[2],
];
assert.deepEqual(foundShell, [
  state.a,
  state.p,
  state.p,
  mod29(state.K * state.a),
  mod29(state.a - state.g),
]);

// Charge a deliberately broad role/permutation family. Start with Alice and
// Bob shell keys, allow every unique permutation and both additive signs, and
// score against every distinct five-rune word in the authenticated carrier.
const fiveRuneTargets = [...new Map(
  message
    .map((word) => ({ word: word.toUpperCase(), values: gp(word) }))
    .filter((entry) => entry.values.length === 5)
    .map((entry) => [entry.values.join(","), entry])
).values()];
assert.deepEqual(
  fiveRuneTargets.map((entry) => entry.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);

const family = new Map();
for (const [role, baseKey] of [["alice", aliceKey], ["bob", bobKey]]) {
  for (const key of uniquePermutations(baseKey)) {
    for (const sign of [-1, +1]) {
      family.set(sign + ":" + key.join(","), { role, key, sign });
    }
  }
}
const familyMembers = [...family.values()];
assert.equal(familyMembers.length, 300);

const selectedHits = [];
for (const member of familyMembers) {
  const plain = decrypt(foundReceiver.values, member.key, member.sign);
  for (const target of fiveRuneTargets) {
    if (plain.join(",") === target.values.join(",")) {
      selectedHits.push({ member, target: target.word });
    }
  }
}
assert.equal(selectedHits.length, 1);
assert.equal(selectedHits[0].member.role, "alice");
assert.equal(selectedHits[0].member.sign, -1);
assert.deepEqual(selectedHits[0].member.key, aliceKey);
assert.equal(selectedHits[0].target, "FOUND");

// Manuscript-wide control across every complete five-rune unknown-page word.
const manuscriptHits = [];
let fiveRuneWordCount = 0;
for (let partIndex = 0; partIndex < 55; partIndex += 1) {
  const page = partIndex <= 49 ? partIndex : partIndex + 1;
  const parsed = parsePage(parts[partIndex]);
  for (const word of parsed.words) {
    if (word.length !== 5) continue;
    fiveRuneWordCount += 1;
    for (const member of familyMembers) {
      const plain = decrypt(word.values, member.key, member.sign);
      for (const target of fiveRuneTargets) {
        if (plain.join(",") === target.values.join(",")) {
          manuscriptHits.push({
            page,
            word: word.index,
            start: word.start,
            member,
            target: target.word,
          });
        }
      }
    }
  }
}
assert.equal(fiveRuneWordCount, 318);
assert.equal(manuscriptHits.length, 1);
assert.equal(manuscriptHits[0].page, 0);
assert.equal(manuscriptHits[0].word, 26);
assert.equal(manuscriptHits[0].target, "FOUND");
assert.deepEqual(manuscriptHits[0].member.key, aliceKey);
assert.equal(manuscriptHits[0].member.sign, -1);

// Exact finite GP29 null without enumerating all 29^5 ciphertexts. Every
// family-member/target pair generates one ciphertext; count the union.
const generatedCiphertexts = new Map();
for (const member of familyMembers) {
  for (const target of fiveRuneTargets) {
    const ciphertext = target.values.map((value, index) =>
      mod29(value - member.sign * member.key[index])
    );
    const signature = ciphertext.join(",");
    if (!generatedCiphertexts.has(signature)) generatedCiphertexts.set(signature, []);
    generatedCiphertexts.get(signature).push({ member, target: target.word });
  }
}
assert.equal(generatedCiphertexts.size, 2100);
const selectedSignature = foundReceiver.values.join(",");
assert.equal(generatedCiphertexts.get(selectedSignature).length, 1);
const exactCoverage = generatedCiphertexts.size / (29 ** 5);
assert.ok(Math.abs(exactCoverage - 0.00010238334283467006) < 1e-15);

// Prospective consequence after recovering FOUND. Include zero-count literal
// tokens, both radices, zero/one origins, start/end boundaries, and require the
// selected p0 word length to match the next authenticated word's GP length.
const compoundHits = [];
for (let index = 0; index < message.length - 1; index += 1) {
  const address = gp0(message[index]);
  if (address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const match = token.match(/^([0-9])([A-Za-z])$/);
  if (!match) continue;

  const count = Number(match[1]);
  const letter = match[2].toLowerCase();
  const nextWord = message[index + 1];
  const actual = [...nextWord.toLowerCase()].filter((char) => char === letter).length;
  if (actual !== count) continue;
  const nextLength = gp(nextWord).length;

  for (const [radix, alphabet] of [["base60", alphabet60], ["base59", alphabet59]]) {
    const raw = decodeToken(token, alphabet);
    if (raw === null) continue;
    for (const origin of [0, 1]) {
      const position = raw - origin;
      for (const boundary of ["start", "end"]) {
        const receiver = p0.words.find((word) =>
          word[boundary] === position && word.length === nextLength
        );
        if (!receiver) continue;
        compoundHits.push({
          from: message[index].toUpperCase(),
          to: nextWord.toUpperCase(),
          token,
          radix,
          origin,
          boundary,
          position,
          word: receiver.index,
        });
      }
    }
  }
}
assert.deepEqual(compoundHits, [
  {
    from: "YOU",
    to: "WILL",
    token: "2L",
    radix: "base60",
    origin: 0,
    boundary: "start",
    position: 141,
    word: 32,
  },
  {
    from: "FOUND",
    to: "GOOD",
    token: "0s",
    radix: "base59",
    origin: 1,
    boundary: "end",
    position: 52,
    word: 10,
  },
  {
    from: "GOOD",
    to: "LUCK",
    token: "0d",
    radix: "base60",
    origin: 0,
    boundary: "start",
    position: 39,
    word: 7,
  },
  {
    from: "GOOD",
    to: "LUCK",
    token: "0d",
    radix: "base59",
    origin: 0,
    boundary: "start",
    position: 39,
    word: 7,
  },
]);

const foundGood = compoundHits.find((hit) =>
  hit.from === "FOUND" && hit.to === "GOOD"
);
assert.ok(foundGood);
assert.equal(tableTokens[gp0("FOUND")], "0s");
assert.equal(gp0("FOUND"), 36);
assert.equal(foundGood.word, 10);


// Source-native GOOD and LUCK continuation after FOUND.
// The compound navigation family above prospectively fixes both receivers.
const hereFragments = lineFragments(p28Lines[0]);
const hereLineValues = hereFragments.flat();
const dhLineValues = dhLine.fragments.flat();
const hereOutput = [
  ...outerH(hereFragments[0]),
  ...outerH(hereFragments[1]),
];
assert.equal(translit(hereOutput), "HERE");
assert.deepEqual(hereOutput, gp("HERE"));

const fourRuneTargets = [...new Map(
  message
    .map((word) => ({ word: word.toUpperCase(), values: gp(word) }))
    .filter((entry) => entry.values.length === 4)
    .map((entry) => [entry.values.join(","), entry])
).values()];
assert.deepEqual(
  fourRuneTargets.map((entry) => entry.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);
const fourRuneTargetByGp = new Map(
  fourRuneTargets.map((entry) => [entry.values.join(","), entry.word])
);

const privilegedLookups = [];
for (const [lineName, values] of [
  ["HERE", hereLineValues],
  ["DH", dhLineValues],
]) {
  for (const [field, index] of Object.entries(state)) {
    privilegedLookups.push({
      line: lineName,
      field,
      value: values[index - 1],
    });
  }
}

function fixedFourRuneManuscriptHits(key) {
  const hits = [];
  let count = 0;
  for (let partIndex = 0; partIndex < 55; partIndex += 1) {
    const page = partIndex <= 49 ? partIndex : partIndex + 1;
    const parsed = parsePage(parts[partIndex]);
    for (const word of parsed.words) {
      if (word.length !== 4) continue;
      count += 1;
      const plain = decrypt(word.values, key, -1);
      const target = fourRuneTargetByGp.get(plain.join(","));
      if (target) {
        hits.push({
          page,
          word: word.index,
          start: word.start,
          target,
          plaintext: plain,
        });
      }
    }
  }
  return { count, hits };
}

// FOUND -> GOOD: the charged compound family selects p0 word10 by
// base59/one endpoint52 before its values are used.
const goodReceiver = p0.words.find((word) => word.end === foundGood.position);
assert.deepEqual(goodReceiver, {
  index: 10,
  start: 49,
  end: 52,
  values: [24, 21, 26, 14],
  length: 4,
});

const hab = H(state.A, state.B);
assert.deepEqual(hab, [18, 27]);
const goodKey = [
  hab[0],
  hab[0],
  state.p,
  dhLineValues[state.p - 1],
];
assert.deepEqual(goodKey, [18, 18, 23, 20]);
const goodPlain = decrypt(goodReceiver.values, goodKey, -1);
assert.deepEqual(goodPlain, gp("GOOD"));
assert.deepEqual(decrypt(goodPlain, goodKey, +1), goodReceiver.values);

const goodShell = [
  ...H(goodPlain[0], goodPlain[3]),
  ...H(goodPlain[1], goodPlain[2]),
];
assert.deepEqual(goodShell, [
  mod29(state.K * state.a),
  0,
  0,
  state.a,
]);

// Charge both H(A,B) coordinates independently, every direct DH field,
// every one-based state lookup in the HERE/DH lines, both signs, and then
// every permutation of the resulting four source values.
const goodBasicHits = [];
const goodBroadFamily = new Map();
let goodRawConfigs = 0;
for (let left = 0; left < 2; left += 1) {
  for (let right = 0; right < 2; right += 1) {
    for (const [field, fieldValue] of Object.entries(state)) {
      for (const lookup of privilegedLookups) {
        const baseKey = [hab[left], hab[right], fieldValue, lookup.value];
        for (const sign of [-1, +1]) {
          goodRawConfigs += 1;
          const basicPlain = decrypt(goodReceiver.values, baseKey, sign);
          for (const target of fourRuneTargets) {
            if (basicPlain.join(",") === target.values.join(",")) {
              goodBasicHits.push({
                left,
                right,
                field,
                lookup,
                sign,
                key: baseKey,
                target: target.word,
              });
            }
          }
          for (const key of uniquePermutations(baseKey)) {
            goodBroadFamily.set(sign + ":" + key.join(","), { sign, key });
          }
        }
      }
    }
  }
}
assert.equal(goodRawConfigs, 784);
assert.deepEqual(goodBasicHits, [{
  left: 0,
  right: 0,
  field: "p",
  lookup: { line: "DH", field: "p", value: 20 },
  sign: -1,
  key: goodKey,
  target: "GOOD",
}]);
assert.equal(goodBroadFamily.size, 8304);
const goodBroadHits = [];
for (const member of goodBroadFamily.values()) {
  const plain = decrypt(goodReceiver.values, member.key, member.sign);
  for (const target of fourRuneTargets) {
    if (plain.join(",") === target.values.join(",")) {
      goodBroadHits.push({ ...member, target: target.word });
    }
  }
}
assert.deepEqual(goodBroadHits, [{
  sign: -1,
  key: goodKey,
  target: "GOOD",
}]);

const goodManuscript = fixedFourRuneManuscriptHits(goodKey);
assert.equal(goodManuscript.count, 514);
assert.deepEqual(goodManuscript.hits, [{
  page: 0,
  word: 10,
  start: 49,
  target: "GOOD",
  plaintext: gp("GOOD"),
}]);

// GOOD -> LUCK: GP0(GOOD)=35 addresses 0d. Both conventional radices give
// 39, the exact start of p0 word7, and LUCK is the next authenticated word.
assert.equal(gp0("GOOD"), 35);
assert.equal(tableTokens[gp0("GOOD")], "0d");
assert.equal(decodeToken(tableTokens[gp0("GOOD")], alphabet60), 39);
assert.equal(decodeToken(tableTokens[gp0("GOOD")], alphabet59), 39);
const luckReceiver = p0.words.find((word) => word.start === 39);
assert.deepEqual(luckReceiver, {
  index: 7,
  start: 39,
  end: 42,
  values: [8, 17, 9, 27],
  length: 4,
});

const goodMessageIndex = message.findIndex((word, index) =>
  word.toLowerCase() === "good" && message[index + 1]?.toLowerCase() === "luck"
);
assert.ok(goodMessageIndex >= 0);

// LUCK key: re-H the literal-DH [b,K] state in K,b order, read its sum then
// difference, append the HERE output length and the B-indexed HERE-line rune.
const luckPair = H(state.K, state.b).reverse();
assert.deepEqual(luckPair, [17, 16]);
const luckKey = [
  ...luckPair,
  hereOutput.length,
  hereLineValues[state.B - 1],
];
assert.deepEqual(luckKey, [17, 16, 4, 22]);
const luckPlain = decrypt(luckReceiver.values, luckKey, -1);
assert.deepEqual(luckPlain, gp("LUCK"));
assert.deepEqual(decrypt(luckPlain, luckKey, +1), luckReceiver.values);

const luckShell = [
  ...H(luckPlain[0], luckPlain[3]),
  ...H(luckPlain[1], luckPlain[2]),
];
assert.deepEqual(luckShell, [
  state.b,
  mod29(state.p + state.K),
  mod29(state.p + state.K),
  state.a,
]);

const sourceScalars = [
  { name: "page-number", value: 28 },
  { name: "page-rune-lines", value: p28Lines.length },
  { name: "here-line-one-based", value: 1 },
  { name: "here-line-runes", value: hereLineValues.length },
  { name: "here-line-fragments", value: hereFragments.length },
  { name: "here-fragments-consumed", value: 2 },
  { name: "here-output-length", value: hereOutput.length },
  { name: "dh-line-one-based", value: 6 },
];

// Broaden LUCK: any ordered distinct DH pair, H or reversed H,
// every source scalar, every HERE/DH state-index lookup, and both signs.
const luckFamily = new Map();
let luckRawConfigs = 0;
for (const [leftField, leftValue] of Object.entries(state)) {
  for (const [rightField, rightValue] of Object.entries(state)) {
    if (leftField === rightField) continue;
    const pair = H(leftValue, rightValue);
    for (const orderedPair of [pair, pair.slice().reverse()]) {
      for (const scalar of sourceScalars) {
        for (const lookup of privilegedLookups) {
          for (const sign of [-1, +1]) {
            luckRawConfigs += 1;
            const key = [
              orderedPair[0],
              orderedPair[1],
              scalar.value,
              lookup.value,
            ];
            luckFamily.set(sign + ":" + key.join(","), {
              leftField,
              rightField,
              scalar: scalar.name,
              lookup,
              sign,
              key,
            });
          }
        }
      }
    }
  }
}
assert.equal(luckRawConfigs, 18816);
assert.equal(luckFamily.size, 15392);
const luckFamilyHits = [];
for (const member of luckFamily.values()) {
  const plain = decrypt(luckReceiver.values, member.key, member.sign);
  for (const target of fourRuneTargets) {
    if (plain.join(",") === target.values.join(",")) {
      luckFamilyHits.push({ ...member, target: target.word });
    }
  }
}
assert.deepEqual(luckFamilyHits, [{
  leftField: "K",
  rightField: "b",
  scalar: "here-output-length",
  lookup: { line: "HERE", field: "B", value: 22 },
  sign: -1,
  key: luckKey,
  target: "LUCK",
}]);

const luckManuscript = fixedFourRuneManuscriptHits(luckKey);
assert.equal(luckManuscript.count, 514);
assert.deepEqual(luckManuscript.hits, [{
  page: 0,
  word: 7,
  start: 39,
  target: "LUCK",
  plaintext: gp("LUCK"),
}]);

// LUCK no longer ends the numerical route. Its plaintext number addresses 2D;
// the base59 reading is exactly the start of a four-rune p0 word, while base60
// falls inside the same word. In the authenticated tail after LUCK, PATHS is
// the first and only subsequent four-rune GP word.
assert.equal(gp0("LUCK"), 31);
assert.equal(tableTokens[gp0("LUCK")], "2D");
const luckDirection60 = decodeToken(tableTokens[gp0("LUCK")], alphabet60);
const luckDirection59 = decodeToken(tableTokens[gp0("LUCK")], alphabet59);
assert.equal(luckDirection60, 133);
assert.equal(luckDirection59, 131);

const luckMessageIndex = message.findIndex((word) => word.toLowerCase() === "luck");
assert.ok(luckMessageIndex >= 0);
const tailFourRuneWords = message
  .slice(luckMessageIndex + 1)
  .filter((word) => gp(word).length === 4);
assert.deepEqual(tailFourRuneWords.map((word) => word.toUpperCase()), ["PATHS"]);

const pathsReceiver = p0.words.find((word) => word.start === luckDirection59);
assert.deepEqual(pathsReceiver, {
  index: 30,
  start: 131,
  end: 134,
  values: [23, 14, 21, 7],
  length: 4,
});
assert.ok(pathsReceiver.start < luckDirection60 && luckDirection60 <= pathsReceiver.end);

// PATHS key in the frozen H geometry. Use the difference coordinate from the
// source-paired public values [A,B], K as the second outer-shell coordinate,
// and H(B,B) for the inner shell. Invert H only at the outer pair.
const inverseTwo = 15;
function inverseH(difference, sumValue) {
  return [
    mod29((difference + sumValue) * inverseTwo),
    mod29((sumValue - difference) * inverseTwo),
  ];
}
const publicDifference = H(state.A, state.B)[0];
assert.equal(publicDifference, 18);
const pathsOuter = inverseH(publicDifference, state.K);
const pathsKey = [pathsOuter[0], state.B, state.B, pathsOuter[1]];
assert.deepEqual(pathsKey, [10, 19, 19, 21]);

const pathsPlain = decrypt(pathsReceiver.values, pathsKey, -1);
assert.deepEqual(pathsPlain, gp("PATHS"));
assert.deepEqual(decrypt(pathsPlain, pathsKey, +1), pathsReceiver.values);

const pathsPlainShell = [
  ...H(pathsPlain[0], pathsPlain[3]),
  ...H(pathsPlain[1], pathsPlain[2]),
];
assert.deepEqual(pathsPlainShell, [
  28 - 1,
  28,
  state.p - 1,
  28 - state.K,
]);

const pathsKeyShell = [
  ...H(pathsKey[0], pathsKey[3]),
  ...H(pathsKey[1], pathsKey[2]),
];
assert.deepEqual(pathsKeyShell, [
  publicDifference,
  state.K,
  0,
  mod29(2 * state.B),
]);

// Charge the shell grammar broadly:
// - any ordered distinct DH field pair;
// - either H coordinate as outer-shell coordinate 1;
// - any DH field as outer-shell coordinate 2;
// - any repeated DH field in the inner pair;
// - both signs.
// The numeric key is unique on this receiver. Two labeled aliases survive
// because p-g = A-B = 18 in the reconstructed state.
const pathsLabelHits = [];
const pathsFamily = new Map();
let pathsRawConfigs = 0;
for (const [leftField, leftValue] of Object.entries(state)) {
  for (const [rightField, rightValue] of Object.entries(state)) {
    if (leftField === rightField) continue;
    const pair = H(leftValue, rightValue);
    for (let coordinate = 0; coordinate < 2; coordinate += 1) {
      for (const [outerField, outerValue] of Object.entries(state)) {
        for (const [innerField, innerValue] of Object.entries(state)) {
          const endpoints = inverseH(pair[coordinate], outerValue);
          const key = [endpoints[0], innerValue, innerValue, endpoints[1]];
          for (const sign of [-1, +1]) {
            pathsRawConfigs += 1;
            const signature = sign + ":" + key.join(",");
            if (!pathsFamily.has(signature)) {
              pathsFamily.set(signature, { sign, key });
            }
            const plain = decrypt(pathsReceiver.values, key, sign);
            for (const target of fourRuneTargets) {
              if (plain.join(",") === target.values.join(",")) {
                pathsLabelHits.push({
                  leftField,
                  rightField,
                  coordinate,
                  outerField,
                  innerField,
                  sign,
                  key,
                  target: target.word,
                });
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(pathsRawConfigs, 8232);
assert.equal(pathsFamily.size, 2842);
assert.deepEqual(pathsLabelHits, [
  {
    leftField: "p",
    rightField: "g",
    coordinate: 0,
    outerField: "K",
    innerField: "B",
    sign: -1,
    key: pathsKey,
    target: "PATHS",
  },
  {
    leftField: "A",
    rightField: "B",
    coordinate: 0,
    outerField: "K",
    innerField: "B",
    sign: -1,
    key: pathsKey,
    target: "PATHS",
  },
]);

const pathsNumericHits = [];
for (const member of pathsFamily.values()) {
  const plain = decrypt(pathsReceiver.values, member.key, member.sign);
  for (const target of fourRuneTargets) {
    if (plain.join(",") === target.values.join(",")) {
      pathsNumericHits.push({ ...member, target: target.word });
    }
  }
}
assert.deepEqual(pathsNumericHits, [{
  sign: -1,
  key: pathsKey,
  target: "PATHS",
}]);

const pathsManuscript = fixedFourRuneManuscriptHits(pathsKey);
assert.equal(pathsManuscript.count, 514);
assert.deepEqual(pathsManuscript.hits, [{
  page: 0,
  word: 30,
  start: 131,
  target: "PATHS",
  plaintext: gp("PATHS"),
}]);

// Two untouched source checks strengthen the p0 GOOD/PATHS route.
// GOOD's raw ciphertext GP0 addresses 0S -> 28, pointing directly back to
// physical p28, the page from which its key is derived.
const goodRawGp0 = sum(goodReceiver.values);
assert.equal(goodRawGp0, 85);
assert.equal(tableTokens[goodRawGp0], "0S");
assert.equal(decodeToken(tableTokens[goodRawGp0], alphabet60), 28);
assert.equal(decodeToken(tableTokens[goodRawGp0], alphabet59), 28);
const p0FourRuneP28Returns = p0.words
  .filter((word) => word.length === 4)
  .filter((word) => {
    const address = sum(word.values);
    const token = tableTokens[address];
    return decodeToken(token, alphabet60) === 28 ||
      decodeToken(token, alphabet59) === 28;
  })
  .map((word) => word.index);
assert.deepEqual(p0FourRuneP28Returns, [goodReceiver.index]);

// PATHS's raw ciphertext GP0 addresses 4F. Base60 position255 lies inside the
// already recovered three-rune YOU receiver; base59 position251 lies in the
// preceding nine-rune word.
const pathsRawGp0 = sum(pathsReceiver.values);
assert.equal(pathsRawGp0, 65);
assert.equal(tableTokens[pathsRawGp0], "4F");
const pathsReturn60 = decodeToken(tableTokens[pathsRawGp0], alphabet60);
const pathsReturn59 = decodeToken(tableTokens[pathsRawGp0], alphabet59);
assert.equal(pathsReturn60, 255);
assert.equal(pathsReturn59, 251);
const pathsReturnWord60 = p0.words.find((word) =>
  word.start <= pathsReturn60 && pathsReturn60 <= word.end
);
const pathsReturnWord59 = p0.words.find((word) =>
  word.start <= pathsReturn59 && pathsReturn59 <= word.end
);
assert.equal(pathsReturnWord60.index, 56);
assert.equal(pathsReturnWord60.length, 3);
assert.equal(pathsReturnWord59.index, 55);
assert.equal(pathsReturnWord59.length, 9);

// Post-discovery carrier crosslink: zero-based authenticated word index minus
// GP0 modulo29 independently spells several DH state values in the same tail.
const carrierRows = message.map((word, index) => ({
  word: word.toUpperCase(),
  index,
  delta: mod29(index - gp0(word)),
}));
function carrierDelta(word) {
  const row = carrierRows.find((candidate) => candidate.word === word);
  assert.ok(row);
  return row.delta;
}
assert.equal(carrierDelta("YOU"), state.K);
assert.equal(carrierDelta("WILL"), state.g);
assert.equal(carrierDelta("LUCK"), state.a);
assert.equal(carrierDelta("BEWARE"), state.A);
assert.equal(carrierDelta("PATHS"), state.b);

console.log(JSON.stringify({
  dh: state,
  receiver: {
    page: 0,
    word: foundReceiver.index,
    start: foundReceiver.start,
    end: foundReceiver.end,
    cipher: foundReceiver.values,
  },
  aliceKey,
  plaintext: translit(foundPlain),
  plaintextShell: foundShell,
  familyMembers: familyMembers.length,
  selectedFamilyHits: selectedHits.length,
  manuscriptFiveRuneWords: fiveRuneWordCount,
  manuscriptFamilyHits: manuscriptHits.length,
  exactNullCiphertexts: generatedCiphertexts.size,
  exactGp29Space: 29 ** 5,
  exactCoverage,
  nextCompoundHit: foundGood,
  good: {
    receiver: goodReceiver,
    key: goodKey,
    plaintext: translit(goodPlain),
    shell: goodShell,
    rawFamilyConfigs: goodRawConfigs,
    broadFamilyConfigs: goodBroadFamily.size,
    broadHits: goodBroadHits.length,
    manuscriptHits: goodManuscript.hits,
  },
  luck: {
    receiver: luckReceiver,
    key: luckKey,
    plaintext: translit(luckPlain),
    shell: luckShell,
    rawFamilyConfigs: luckRawConfigs,
    distinctFamilyConfigs: luckFamily.size,
    familyHits: luckFamilyHits.length,
    manuscriptHits: luckManuscript.hits,
    nextToken: tableTokens[gp0("LUCK")],
  },
  paths: {
    receiver: pathsReceiver,
    key: pathsKey,
    plaintext: translit(pathsPlain),
    plaintextShell: pathsPlainShell,
    keyShell: pathsKeyShell,
    rawFamilyConfigs: pathsRawConfigs,
    distinctFamilyConfigs: pathsFamily.size,
    numericHits: pathsNumericHits.length,
    manuscriptHits: pathsManuscript.hits,
    rawReturn: {
      gp0: pathsRawGp0,
      token: tableTokens[pathsRawGp0],
      base60: pathsReturn60,
      base59: pathsReturn59,
      base60Word: pathsReturnWord60.index,
    },
  },
  carrierStateCrosslink: carrierRows.filter((row) =>
    ["YOU", "WILL", "LUCK", "BEWARE", "PATHS"].includes(row.word)
  ),
}, null, 2));

console.log("PASS p0 FOUND GOOD LUCK PATHS source chain");
