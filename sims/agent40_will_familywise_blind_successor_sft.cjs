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

function physicalLines(page) {
  return parts[page].trim().split("/").filter((line) => line.trim().length > 0);
}

function lineRunes(line) {
  return [...line].filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune));
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

function H(x, y) {
  return [mod29(x - y), mod29(x + y)];
}

function outerH(fragment) {
  return H(fragment[0], fragment[fragment.length - 1]);
}

function decodeToken(token, alphabet) {
  if (typeof token !== "string" || token.length !== 2) return null;
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const message = signedWords();
assert.equal(message.length, 43);
const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.words.map((word) => [word.start, word]));
const allWords = [];
for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
  const page = partIndex <= 49 ? partIndex : partIndex + 1;
  if (page === 50) continue;
  const parsed = parsePage(parts[partIndex]);
  for (const word of parsed.words) {
    allWords.push({ page, ...word });
  }
}
const fourRuneWords = allWords.filter((word) => word.length === 4);
assert.equal(p0.words.length, 59);
assert.equal(tableTokens.length, 256);
assert.equal(fourRuneWords.length, 524);

// Reconstruct the fixed p28 DH23 state without using the p0 target.
const p28LineNumber = 6;
const fragments = lineFragments(physicalLines(28)[p28LineNumber - 1]);
assert.equal(fragments.length, 5);
assert.equal(lineRunes(physicalLines(28)[p28LineNumber - 1]).length, 23);
assert.equal(spell(fragments[0]), "DH");
const hFirst = outerH(fragments[0]);
const hPenultimate = outerH(fragments[fragments.length - 2]);
const hFinal = outerH(fragments[fragments.length - 1]);
const state = {
  p: hPenultimate[0],
  g: fragments.length,
  a: p28LineNumber,
  b: hFirst[0],
  A: hFinal[0],
  B: hFinal[1],
  K: hFirst[1],
};
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
assert.deepEqual(hPenultimate, [state.p, mod29(state.K * state.a)]);
assert.deepEqual(hFinal, [state.A, state.B]);

// Freeze the full admitted key grammar: [K*x, x, H(y,z)], all DH fields,
// ordered pairs, and both additive directions.
const stateEntries = Object.entries(state);
const keyConfigs = [];
for (const [xName, xValue] of stateEntries) {
  for (const [yName, yValue] of stateEntries) {
    for (const [zName, zValue] of stateEntries) {
      const key = [mod29(state.K * xValue), xValue, ...H(yValue, zValue)];
      for (const sign of ["subtract", "add"]) {
        keyConfigs.push({ xName, yName, zName, key, sign });
      }
    }
  }
}
assert.equal(keyConfigs.length, 686);
const uniqueKeySignatures = new Set(keyConfigs.map((row) => row.key.join(",")));
const exactKey = [mod29(state.K * state.a), state.a, ...H(state.A, state.B)];
assert.deepEqual(exactKey, [12, 6, 18, 27]);

// Every distinct authenticated signed word with exactly four GP runes.
const targets = new Map();
for (let index = 0; index < message.length; index += 1) {
  const values = gp(message[index]);
  if (values.length !== 4) continue;
  const signature = values.join(",");
  if (!targets.has(signature)) targets.set(signature, []);
  targets.get(signature).push({ index, word: message[index].toLowerCase() });
}
assert.equal(targets.size, 9);

// Full manuscript cross-product: every four-rune word on every unknown page,
// every DH key configuration, both signs, and every authenticated four-rune target.
const manuscriptHits = [];
const perLocation = new Map();
for (const word of fourRuneWords) {
  for (const config of keyConfigs) {
    const candidate = word.values.map((value, index) =>
      config.sign === "subtract"
        ? mod29(value - config.key[index])
        : mod29(value + config.key[index])
    );
    const matched = targets.get(candidate.join(","));
    if (!matched) continue;
    const row = {
      page: word.page,
      wordIndex: word.index,
      start: word.start,
      ciphertext: word.values,
      plaintext: candidate,
      plaintextText: spell(candidate),
      x: config.xName,
      hPair: [config.yName, config.zName],
      key: config.key,
      sign: config.sign,
      targets: matched,
    };
    manuscriptHits.push(row);
    const location = word.page + ":" + word.index + ":" + word.start;
    if (!perLocation.has(location)) perLocation.set(location, []);
    perLocation.get(location).push(row);
  }
}

const selectedWillHits = manuscriptHits.filter((row) =>
  row.page === 0 &&
  row.wordIndex === 32 &&
  row.start === 141 &&
  row.plaintextText === "WILL"
);
assert.ok(selectedWillHits.some((row) =>
  row.x === "a" &&
  row.hPair[0] === "A" &&
  row.hPair[1] === "B" &&
  row.sign === "subtract" &&
  row.key.join(",") === exactKey.join(",")
));

// Full source-word/receiver family: all 42 adjacent signed pairs, both live
// radices, both origins, all valid p0 complete-word starts of matching GP length,
// and all 686 fixed DH-key configurations.
const sourceReceivers = [];
const sourceKeyHits = [];
const literalHits = [];
for (let index = 0; index < message.length - 1; index += 1) {
  const from = message[index];
  const to = message[index + 1];
  const address = gp0(from);
  if (address < 0 || address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const nextValues = gp(to);
  const countMatch = token.match(/^([1-9])([A-Za-z])$/);
  const literalCount = countMatch
    ? [...to.toUpperCase()].filter((character) =>
        character === countMatch[2].toUpperCase()
      ).length === Number(countMatch[1])
    : false;
  if (literalCount) {
    literalHits.push({ index, from: from.toLowerCase(), to: to.toLowerCase(), address, token });
  }
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
      if (!receiver || receiver.length !== nextValues.length) continue;
      const receiverRow = {
        index,
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        address,
        token,
        radix,
        origin,
        offset,
        p0WordIndex: receiver.index,
        receiverLength: receiver.length,
        targetLength: nextValues.length,
        literalCount,
        ciphertext: receiver.values,
      };
      sourceReceivers.push(receiverRow);
      if (receiver.length !== 4) continue;
      for (const config of keyConfigs) {
        const candidate = receiver.values.map((value, j) =>
          config.sign === "subtract"
            ? mod29(value - config.key[j])
            : mod29(value + config.key[j])
        );
        if (candidate.join(",") === nextValues.join(",")) {
          sourceKeyHits.push({
            ...receiverRow,
            key: config.key,
            x: config.xName,
            hPair: [config.yName, config.zName],
            sign: config.sign,
          });
        }
      }
    }
  }
}

// Frozen YOU receiver and exact key.
const youIndex = message.findIndex((word) => word.toLowerCase() === "you");
assert.equal(youIndex, 32);
assert.equal(message[youIndex + 1].toLowerCase(), "will");
const youAddress = gp0("YOU");
assert.equal(youAddress, 30);
assert.equal(tableTokens[youAddress], "2L");
const youReceiver = p0ByStart.get(141);
assert.deepEqual(youReceiver.values, [19, 16, 9, 18]);
const willPlain = youReceiver.values.map((value, index) => mod29(value - exactKey[index]));
assert.deepEqual(willPlain, gp("WILL"));
assert.deepEqual(willPlain.map((value, index) => mod29(value + exactKey[index])), youReceiver.values);

// Blind BE successor: keep base60/zero and the exact same four-symbol key.
// BE points to p0 word at 39, but that receiver is four runes while FOUND is five.
const beIndex = message.findIndex((word) => word.toLowerCase() === "be");
assert.equal(beIndex, 34);
assert.equal(message[beIndex + 1].toLowerCase(), "found");
const beAddress = gp0("BE");
assert.equal(beAddress, 35);
const beToken = tableTokens[beAddress];
assert.equal(beToken, "0d");
const beOffset = decodeToken(beToken, alphabet60);
assert.equal(beOffset, 39);
const beReceiver = p0ByStart.get(beOffset);
assert.ok(beReceiver);
const foundValues = gp("FOUND");
assert.equal(beReceiver.length, 4);
assert.equal(foundValues.length, 5);
const beFixedOutput = beReceiver.values.map((value, index) => mod29(value - exactKey[index]));
const beFixedOutputText = spell(beFixedOutput);
assert.equal(beFixedOutputText, "AEJLF");
assert.equal(targets.has(beFixedOutput.join(",")), false);

// Preserve the already observed WILL -> BE -> FOUND navigation as navigation
// only: the first hop lands inside a five-rune p0 word, not a complete start.
const willAddress = gp0("WILL");
assert.equal(willAddress, 57);
const willToken = tableTokens[willAddress];
assert.equal(willToken, "1w");
const willHop = decodeToken(willToken, alphabet60);
assert.equal(willHop, 118);
const containingFoundReceiver = p0.words.find((word) =>
  word.start <= willHop && willHop <= word.end
);
assert.deepEqual(
  { start: containingFoundReceiver.start, end: containingFoundReceiver.end, length: containingFoundReceiver.length },
  { start: 117, end: 121, length: 5 }
);
assert.equal(tableTokens[118], "0Z");
assert.equal(decodeToken(tableTokens[118], alphabet60), gp0("BE"));

// Summary counts and compact hit inventory.
const hitLocations = [...perLocation.entries()].map(([location, rows]) => ({
  location,
  count: rows.length,
  hits: rows,
}));
console.log(JSON.stringify({
  classification: "WILL remains an exact local inverse, but this run charges the complete key-by-manuscript cross-product and the fixed BE successor.",
  source: {
    signedWords: message.length,
    adjacentPairs: message.length - 1,
    p0Words: p0.words.length,
    unknownPageFourRuneWords: fourRuneWords.length,
    distinctAuthenticatedFourRuneTargets: targets.size,
    p50Cells: tableTokens.length,
  },
  dh23: state,
  keyFamily: {
    configurations: keyConfigs.length,
    uniqueKeyVectors: uniqueKeySignatures.size,
    grammar: "[K*x, x, H(y,z)] with all ordered DH fields and both additive signs",
  },
  sourceReceiverFamily: {
    matchingLengthReceivers: sourceReceivers.length,
    literalCountHits: literalHits,
    receivers: sourceReceivers,
    authenticatedNextWordKeyHits: sourceKeyHits,
  },
  manuscriptCrossProduct: {
    combinations: fourRuneWords.length * keyConfigs.length,
    targetHitRows: manuscriptHits.length,
    uniqueCiphertextWordLocations: perLocation.size,
    hitLocations,
    selectedWillHitCount: selectedWillHits.length,
    selectedWill: selectedWillHits,
  },
  blindSuccessor: {
    from: "BE",
    to: "FOUND",
    address: beAddress,
    token: beToken,
    base60ZeroOffset: beOffset,
    receiver: {
      start: beReceiver.start,
      end: beReceiver.end,
      length: beReceiver.length,
      ciphertext: beReceiver.values,
    },
    targetLength: foundValues.length,
    lengthMatch: beReceiver.length === foundValues.length,
    fixedKey: exactKey,
    fixedKeyOutput: beFixedOutput,
    fixedKeyOutputText: beFixedOutputText,
    authenticatedTargetHit: false,
    willTwoHopNavigation: {
      from: "WILL",
      to: "BE",
      path: [willAddress, willHop, gp0("BE")],
      foundReceiver: { start: 117, end: 121, length: 5 },
      plaintextOrKeyRecovered: false,
    },
  },
  raw23PadFollowup: "Separate direct 23-rune p28-line6-to-p0-receiver OTP and six-phase exponent-orbit negatives are preserved in communications/broadcast.",
}, null, 2));
