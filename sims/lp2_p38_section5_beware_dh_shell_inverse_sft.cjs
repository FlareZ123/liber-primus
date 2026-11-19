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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const source = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

/** @param {string} token @returns {number} */
function low60(token) {
  const value = alphabet60.indexOf(token[1]);
  assert.ok(value >= 0, "invalid base60 token " + token);
  return value;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {number[]} */
function hShell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(...H(values[left], values[right]));
  }
  if (values.length % 2) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

/**
 * Invert an even-length outside-in H shell.
 * Shell order: [d0,s0,d1,s1,...] for outer to inner pairs.
 * @param {number[]} shell
 * @returns {number[]}
 */
function invertHShell(shell) {
  assert.equal(shell.length % 2, 0);
  const inv2 = 15; // 2^-1 mod29
  const left = [];
  const right = [];
  for (let index = 0; index < shell.length; index += 2) {
    const difference = shell[index];
    const sum = shell[index + 1];
    left.push(mod29((difference + sum) * inv2));
    right.push(mod29((sum - difference) * inv2));
  }
  return [...left, ...right.reverse()];
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
  const normalized = word.toUpperCase()
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
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling " + word);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return {
    index,
    word: word.toUpperCase(),
    values,
    length: values.length,
    gp0: values.reduce((sum, value) => sum + value, 0),
  };
});
assert.equal(signedWords.length, 43);

const sixRuneTargets = [...new Map(
  signedWords
    .filter((word) => word.length === 6)
    .map((word) => [word.values.join(","), word])
).values()];
assert.deepEqual(sixRuneTargets.map((word) => word.word), ["PRIMUS", "BEWARE", "VERIFY"]);

const parts = source.split("%").slice(0, 55);

/** @param {number} segment @returns {number} */
function physicalPage(segment) {
  return segment >= 50 ? segment + 1 : segment;
}

/** @returns {Map<number, Array<object>>} */
function parsePages() {
  const pages = parts.map((_, segment) => ({ page: physicalPage(segment), words: [] }));
  const offsets = new Array(parts.length).fill(0);

  let values = [];
  let startSegment = 0;
  let endSegment = 0;
  let start = 0;

  function flush() {
    if (!values.length) return;
    if (startSegment === endSegment) {
      const page = pages[startSegment];
      page.words.push({
        page: page.page,
        ordinal: page.words.length,
        start,
        end: start + values.length - 1,
        values: values.slice(),
        length: values.length,
        gp0: values.reduce((sum, value) => sum + value, 0),
      });
    }
    values = [];
  }

  for (let segment = 0; segment < parts.length; segment += 1) {
    for (const char of parts[segment]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!values.length) {
          startSegment = segment;
          start = offsets[segment];
        }
        endSegment = segment;
        values.push(value);
        offsets[segment] += 1;
      } else if (char === "/" || /\s/u.test(char)) {
        continue;
      } else {
        flush();
      }
    }
  }
  flush();

  return new Map(pages.map((page) => [page.page, page.words]));
}

/** @param {number} page @returns {number[][]} */
function runeLines(page) {
  const segment = page <= 49 ? page : page - 1;
  return parts[segment]
    .trim()
    .split("/")
    .filter((line) => [...line].some((char) => runeIndex.has(char)))
    .map((line) => [...line].map((char) => runeIndex.get(char)).filter((value) => value !== undefined));
}

const pages = parsePages();
const allWords = [...pages.values()].flat();
const sixRuneWords = allWords.filter((word) => word.length === 6);
assert.equal(sixRuneWords.length, 251);

const p38 = pages.get(38);
assert.ok(p38);
const receiver = p38.find((word) => word.start === 57 && word.end === 62);
assert.ok(receiver);
assert.deepEqual(receiver.values, [8, 25, 14, 2, 17, 22]);
assert.equal(receiver.length, 6);
assert.equal(receiver.gp0, 88);

// Reproduce the independent LUCK -> BEWARE state selector.
const beware = signedWords.find((word) => word.word === "BEWARE");
const luck = signedWords.find((word) => word.word === "LUCK");
assert.ok(beware && luck);
assert.equal(beware.gp0, receiver.gp0);
assert.equal(beware.length, receiver.length);
assert.equal(tokens[receiver.gp0], "3V");
assert.equal(low60(tokens[receiver.gp0]), luck.gp0);
assert.equal(signedWords[beware.index - 1].word, "LUCK");

const p28Lines = runeLines(28);
const hereLine = p28Lines[0];
const dhLine = p28Lines[5];
assert.equal(hereLine.length, state.p);
assert.equal(dhLine.length, state.p);
assert.equal(hereLine[state.B - 1], 22);
assert.equal(dhLine[state.p - 1], 20);

const Ka = mod29(state.K * state.a);
const cipherShell = hShell(receiver.values);
assert.deepEqual(cipherShell, [
  state.b,
  mod29(state.a - state.g),
  state.A,
  mod29(state.b - state.K),
  Ka,
  mod29(state.K - state.b),
]);

const bewareShell = hShell(beware.values);
assert.deepEqual(bewareShell, [
  mod29(state.g - state.a),
  state.a,
  mod29(-state.b),
  hereLine[state.B - 1],
  Ka,
  state.K,
]);

// Compact peer-state key template. The receiver is an Alice-side packet, so
// the peer private field is b. The family charge below does not hard-code b.
const familyHits = [];
for (const [peerName, peer] of Object.entries(state)) {
  for (const [lineName, line] of [["HERE", hereLine], ["DH", dhLine]]) {
    for (const sign of [-1, 1]) {
      const shell = [
        mod29(state.K - peer),
        mod29(-state.g),
        state.p,
        line[state.p - 1],
        0,
        mod29(-peer),
      ];
      const key = invertHShell(shell);
      const plaintext = receiver.values.map((value, index) => mod29(value + sign * key[index]));
      for (const target of sixRuneTargets) {
        if (plaintext.every((value, index) => value === target.values[index])) {
          familyHits.push({
            peerName,
            peer,
            lineName,
            sign,
            shell,
            key,
            target: target.word,
          });
        }
      }
    }
  }
}

assert.deepEqual(familyHits, [{
  peerName: "b",
  peer: state.b,
  lineName: "DH",
  sign: -1,
  shell: [16, 24, 23, 20, 0, 14],
  key: [20, 7, 7, 7, 13, 4],
  target: "BEWARE",
}]);

const exact = familyHits[0];
assert.deepEqual(exact.shell, hShell(exact.key));
const plaintext = receiver.values.map((value, index) => mod29(value - exact.key[index]));
assert.deepEqual(plaintext, beware.values);
const replay = plaintext.map((value, index) => mod29(value + exact.key[index]));
assert.deepEqual(replay, receiver.values);

// Exact-key manuscript-wide charge.
const targetMap = new Map(sixRuneTargets.map((target) => [target.values.join(","), target.word]));
const manuscriptHits = [];
for (const word of sixRuneWords) {
  for (const sign of [-1, 1]) {
    const candidate = word.values.map((value, index) => mod29(value + sign * exact.key[index]));
    const target = targetMap.get(candidate.join(","));
    if (target) {
      manuscriptHits.push({
        page: word.page,
        ordinal: word.ordinal,
        start: word.start,
        end: word.end,
        cipher: word.values,
        sign,
        plaintext: candidate,
        target,
      });
    }
  }
}

assert.deepEqual(manuscriptHits, [{
  page: 38,
  ordinal: 11,
  start: 57,
  end: 62,
  cipher: [8, 25, 14, 2, 17, 22],
  sign: -1,
  plaintext: beware.values,
  target: "BEWARE",
}]);

console.log(JSON.stringify({
  status: "PASS: p38 section-5 BEWARE has one compact DH-shell inverse",
  sourceSelector: {
    receiver: {
      page: receiver.page,
      start: receiver.start,
      end: receiver.end,
      cipher: receiver.values,
      gp0: receiver.gp0,
    },
    predecessor: luck.word,
    predecessorGp0: luck.gp0,
    p50Token: tokens[receiver.gp0],
    low60: low60(tokens[receiver.gp0]),
    target: beware.word,
  },
  shells: {
    cipher: cipherShell,
    cipherLabels: "[b,a-g,A,b-K,K*a,K-b]",
    plaintext: bewareShell,
    plaintextLabels: "[g-a,a,-b,HERE[B],K*a,K]",
    key: exact.shell,
    keyLabels: "[K-b,-g,p,DH[p],0,-b]",
  },
  family: {
    stateFields: Object.keys(state),
    sourceLines: ["HERE", "DH"],
    additiveSigns: [-1, 1],
    configurations: Object.keys(state).length * 2 * 2,
    authenticatedSixRuneTargets: sixRuneTargets.map((target) => target.word),
    hits: familyHits,
  },
  exactInverse: {
    key: exact.key,
    plaintext,
    forwardReplay: replay,
  },
  manuscriptControl: {
    completeSixRuneWords: sixRuneWords.length,
    exactKeyBothSignsTargetHits: manuscriptHits,
  },
  classification:
    "target and receiver were source-selected before this key family; the shell template itself was recognized after BEWARE was known, so preserve as a strong local inverse with retrospective key-template discovery.",
}, null, 2));
