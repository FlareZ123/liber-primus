"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol: symbol.toUpperCase(), value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number, number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base, exponent) {
  let result = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % 29;
    value = (value * value) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

const primes = firstPrimes(128);

/** @param {number} cardinal @returns {number} */
function cardinalToGp(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1);
  return (primes[cardinal - 1] - 1) % 29;
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} word0 @returns {number} */
function gp0(word0) {
  const word = word0
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let total = 0;
  for (let offset = 0; offset < word.length;) {
    if (word.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (word.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      word.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + word.slice(offset));
    total += token.value;
    offset += token.symbol.length;
  }
  return total;
}

/**
 * @param {number} address
 * @param {string} alphabet
 * @param {"high"|"low"} side
 * @param {0|1} origin
 * @returns {number|null}
 */
function component(address, alphabet, side, origin) {
  if (!Number.isInteger(address) || address < 0 || address >= tape.length) {
    return null;
  }
  const token = tape[address];
  const character = token[side === "high" ? 0 : 1];
  const index = alphabet.indexOf(character);
  return index < 0 ? null : index + origin;
}

/** @param {number} address @returns {number} */
function fullBase60(address) {
  const token = tape[address];
  return 60 * alpha60.indexOf(token[0]) + alpha60.indexOf(token[1]);
}

// Independently established hidden-layout phrase on p23.
const p23Packet = [2, 6, 3, 5, 4, 5, 25, 23, 33];
const p23Hidden = translit(p23Packet.map(cardinalToGp));
assert.equal(p23Hidden, "THEORIGINAL");

// Independently established downstream readouts.
const p28Input = [9, 28, 24, 10, 1, 20];
const p28Plain = [
  pow29(p28Input[0], 3),
  ...p28Input.slice(1).map((value) => pow29(value, 27)),
];
assert.equal(translit(p28Plain), "READOUT");

const p33Upper = [2, 8, 5, 3].map(cardinalToGp);
const p33Lower = [3, 5, 27, 8].map(cardinalToGp);
assert.equal(translit(p33Upper), "THEIR");
assert.equal(translit(p33Lower), "RISE");

const states = {
  THE: gp0("THE"),
  ORIGINAL: gp0("ORIGINAL"),
  FIND: gp0("FIND"),
  MUST: gp0("MUST"),
  VERIFY: gp0("VERIFY"),
};
assert.deepEqual(states, {
  THE: 20,
  ORIGINAL: 86,
  FIND: 42,
  MUST: 51,
  VERIFY: 59,
});

const primary = (address) => component(address, alpha60, "low", 0);
assert.equal(primary(states.THE), states.FIND);
assert.equal(primary(states.FIND), 28);
assert.equal(primary(states.ORIGINAL), states.MUST);
assert.equal(primary(states.MUST), states.VERIFY);

// VERIFY's already documented table cell is the literal DH field B=19.
assert.equal(tape[states.VERIFY], "19");
const B = 19;
assert.equal(tape[B], "0X");
assert.equal(fullBase60(B), 33);

// The clear p57 word-number convention already used by terminal routes is
// title-inclusive and one-based. The two low-digit outputs have exact state
// numbers, and H predicts the second signed-2016 THEIR position.
const p57Words = [
  "PARABLE", "LICE", "THE", "INSTAR", "TUNNELNG", "TO", "THE", "SURFACE",
  "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES", "FIND", "THE",
  "DIUINITY", "WITHIN", "AND", "EMERGE",
];
const findPosition = p57Words.indexOf("FIND") + 1;
const mustPosition = p57Words.indexOf("MUST") + 1;
assert.deepEqual([findPosition, mustPosition], [15, 10]);

const stateHandoff = H(findPosition, mustPosition);
assert.deepEqual(stateHandoff, [5, 25]);
const g = 5;
const secondTheirPosition = 25;
const firstTheirPosition = B;
const rise = secondTheirPosition - firstTheirPosition;
assert.equal(stateHandoff[0], g);
assert.equal(stateHandoff[1], secondTheirPosition);
assert.equal(rise, 6);

// Charge every ordered pair of the 20 clear p57 word positions. FIND/MUST is
// the sole pair whose fixed H output is [g, second-THEIR-position].
const p57PairHits = [];
for (let left = 1; left <= p57Words.length; left += 1) {
  for (let right = 1; right <= p57Words.length; right += 1) {
    if (H(left, right)[0] === g && H(left, right)[1] === secondTheirPosition) {
      p57PairHits.push({
        left,
        right,
        words: [p57Words[left - 1], p57Words[right - 1]],
      });
    }
  }
}
assert.deepEqual(p57PairHits, [{
  left: 15,
  right: 10,
  words: ["FIND", "MUST"],
}]);

// Existing p33 semantics close the same source positions.
assert.deepEqual(H(firstTheirPosition, secondTheirPosition), [23, 15]);

// Read the risen THEIR position with the same low-digit opcode. It lands on
// the endpoint pair of the exact signed clause WORDS ARE THE MAP, and H
// recovers the independently reconstructed [e,q]=[3,4] state.
const signedWords = [
  "HELLO", "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY", "ITS", "WORDS",
  "ARE", "THE", "MAP", "THEIR", "MEANING", "IS", "THE", "ROAD", "AND",
  "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION", "SEEK", "AND", "YOU",
  "WILL", "BE", "FOUND", "GOOD", "LUCK", "BEWARE", "FALSE", "PATHS",
  "VERIFY", "OPENPGP",
];
assert.equal(signedWords[firstTheirPosition], "THEIR");
assert.equal(signedWords[secondTheirPosition], "THEIR");

const mapPosition = primary(secondTheirPosition);
assert.equal(mapPosition, 18);
assert.equal(signedWords[mapPosition], "MAP");
const wordsPosition = primary(mapPosition);
assert.equal(wordsPosition, 15);
assert.equal(signedWords[wordsPosition], "WORDS");
assert.deepEqual(signedWords.slice(wordsPosition, mapPosition + 1),
  ["WORDS", "ARE", "THE", "MAP"]);
assert.deepEqual(H(mapPosition, wordsPosition), [3, 4]);
const e = 3;
const q = 4;
assert.equal(e ** q, 81);

// Charge every signed-source start index that stays within the signed-word
// index domain for two low-digit steps and lands on H=[e,q].
const signedEqHits = [];
for (let index = 0; index < signedWords.length; index += 1) {
  const first = primary(index);
  if (first === null || first < 0 || first >= signedWords.length) continue;
  const second = primary(first);
  if (second === null || second < 0 || second >= signedWords.length) continue;
  if (H(first, second)[0] === e && H(first, second)[1] === q) {
    signedEqHits.push({
      index,
      word: signedWords[index],
      first,
      firstWord: signedWords[first],
      second,
      secondWord: signedWords[second],
    });
  }
}
assert.deepEqual(signedEqHits, [{
  index: 25,
  word: "THEIR",
  first: 18,
  firstWord: "MAP",
  second: 15,
  secondWord: "WORDS",
}]);

// Charge the same token-component family used by READ OUT.
const chargedModes = [];
for (const [radix, alphabet] of [[60, alpha60], [59, alpha59]]) {
  for (const side of ["high", "low"]) {
    for (const origin of [0, 1]) {
      const outputs = {
        THE: component(states.THE, alphabet, side, origin),
        ORIGINAL: component(states.ORIGINAL, alphabet, side, origin),
        FIND: component(states.FIND, alphabet, side, origin),
        MUST: component(states.MUST, alphabet, side, origin),
      };
      const score = Number(outputs.THE === states.FIND)
        + Number(outputs.ORIGINAL === states.MUST)
        + Number(outputs.FIND === 28)
        + Number(outputs.MUST === states.VERIFY);
      chargedModes.push({ radix, side, origin, score, outputs });
    }
  }
}
chargedModes.sort((left, right) => right.score - left.score);
assert.equal(chargedModes[0].score, 4);
assert.deepEqual(
  [chargedModes[0].radix, chargedModes[0].side, chargedModes[0].origin],
  [60, "low", 0]
);
assert.equal(chargedModes.filter((mode) => mode.score === 4).length, 1);

console.log(JSON.stringify({
  status: "PASS",
  p23Hidden,
  fixedLowDigitBranches: {
    THE: [states.THE, states.FIND, 28, "p28 READ OUT"],
    ORIGINAL: [
      states.ORIGINAL,
      states.MUST,
      states.VERIFY,
      "p50[VERIFY]=literal 19=B",
      "p50[B]=0X=base60 33",
      "p33 THEIR RISE",
    ],
  },
  exactCells: {
    THE: tape[states.THE],
    FIND: tape[states.FIND],
    ORIGINAL: tape[states.ORIGINAL],
    MUST: tape[states.MUST],
    VERIFY: tape[states.VERIFY],
    B: tape[B],
  },
  chargedComponentModes: chargedModes,
  uniqueFourLinkMode: chargedModes[0],
  p57NumberBridge: {
    outputs: ["FIND", "MUST"],
    oneBasedPositions: [findPosition, mustPosition],
    hOutput: stateHandoff,
    uniqueOrderedPairHit: p57PairHits[0],
    firstTheirPosition,
    secondTheirPosition,
    rise,
    theirPairH: H(firstTheirPosition, secondTheirPosition),
    risenTheirLowDigitPath: [secondTheirPosition, mapPosition, wordsPosition],
    signedClause: signedWords.slice(wordsPosition, mapPosition + 1).join(" "),
    mapWordsH: H(mapPosition, wordsPosition),
    signedEqHits,
    p33UpperBodyRuneCount: e ** q,
  },
  downstreamControls: {
    p28: translit(p28Plain),
    p33: translit(p33Upper) + " " + translit(p33Lower),
  },
  decision: "THE ORIGINAL is a source-connected navigation fork under the already selected p50 low-base60 opcode: THE -> FIND -> p28 READ OUT; ORIGINAL -> MUST -> VERIFY -> B -> p33. The clear-p57 number pair FIND/MUST=[15,10] is uniquely mapped by H to [g,25], while B=19 supplies the first THEIR position; 25-19=6=a predicts the existing p33 THEIR RISE semantic loop. Reading the risen THEIR index25 with the same low-digit opcode gives MAP18 -> WORDS15; H(18,15)=[e,q]=[3,4], uniquely among all signed-source two-step starts, and e^q=81 is p33's established upper-body rune count. This advances navigation/state structure but is not a body-cipher inverse.",
}, null, 2));
