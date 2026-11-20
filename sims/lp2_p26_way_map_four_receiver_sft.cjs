"use strict";

/**
 * SFT: p26 unknown-cipher receiver for the fixed WAY -> MAP table move.
 *
 * Node.js 22, CommonJS, read-only, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const table = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const out = [];
  let current = [];
  for (const char of [...text]) {
    if (runeIndex.has(char)) {
      current.push(runeIndex.get(char));
    } else if (current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

/** @param {number[]} vector */
const gp0 = (vector) => vector.reduce((sum, value) => sum + value, 0);

/** @param {number[]} vector */
const translit = (vector) =>
  vector.map((value) => corpus.translit[value]).join("").toUpperCase();

const delta = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

/**
 * @param {number} index
 * @param {string} token
 * @returns {number|null}
 */
function literalMove(index, token) {
  const match = token.match(/^([1-9])([NSEWnsew])$/);
  if (!match) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = delta[match[2].toUpperCase()];
  const distance = Number(match[1]);
  const nextRow = row + dr * distance;
  const nextCol = col + dc * distance;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

/** @param {number} index @param {string} token @returns {number|null} */
function hexCardinalMove(index, token) {
  if (!/^[0-9A-Fa-f]{2}$/.test(token)) return null;
  const direction = String.fromCharCode(Number.parseInt(token, 16)).toUpperCase();
  if (!delta[direction]) return null;
  const row = Math.floor(index / 8);
  const col = index % 8;
  const [dr, dc] = delta[direction];
  const nextRow = row + dr;
  const nextCol = col + dc;
  return nextRow >= 0 && nextRow < 32 && nextCol >= 0 && nextCol < 8
    ? nextRow * 8 + nextCol
    : null;
}

const tableComposite = [];
for (let source = 0; source < table.length; source += 1) {
  const middle = literalMove(source, table[source]);
  if (middle === null) continue;
  const destination = hexCardinalMove(middle, table[middle]);
  if (destination === null) continue;
  tableComposite.push({
    source,
    sourceToken: table[source],
    middle,
    middleToken: table[middle],
    destination,
  });
}
assert.deepEqual(tableComposite, [{
  source: 57,
  sourceToken: "1w",
  middle: 56,
  middleToken: "4E",
  destination: 48,
}]);

const pages = transcription.split(/^\s*%\s*$/m);
const movementEligible = [];
const movementHits = [];
const pair57to56 = [];
const fourHits = [];
const dhResiduePacketHits = [];
let withinPagePairs = 0;
let fourWordWindows = 0;

for (let page = 0; page <= 55; page += 1) {
  const lines = (pages[page] || "").trim().split("/");
  const words = [];
  const locations = [];
  for (let line = 0; line < lines.length; line += 1) {
    const lineWords = runeWords(lines[line]);
    for (let word = 0; word < lineWords.length; word += 1) {
      words.push(lineWords[word]);
      locations.push({ line: line + 1, word: word + 1 });
    }
  }

  const addresses = words.map(gp0);
  for (let index = 0; index + 1 < addresses.length; index += 1) {
    withinPagePairs += 1;
    const sourceAddress = addresses[index];
    const targetAddress = addresses[index + 1];

    if (sourceAddress === 57 && targetAddress === 56) {
      pair57to56.push({
        page,
        index,
        source: translit(words[index]),
        target: translit(words[index + 1]),
        sourceLoc: locations[index],
        targetLoc: locations[index + 1],
      });
    }

    if (sourceAddress >= table.length) continue;
    const destination = literalMove(sourceAddress, table[sourceAddress]);
    if (destination === null) continue;
    const row = {
      page,
      index,
      source: translit(words[index]),
      target: translit(words[index + 1]),
      sourceAddress,
      token: table[sourceAddress],
      destination,
      targetAddress,
      sourceLoc: locations[index],
      targetLoc: locations[index + 1],
      crossLine: locations[index].line !== locations[index + 1].line,
    };
    movementEligible.push(row);
    if (destination === targetAddress) movementHits.push(row);
  }

  for (let index = 0; index + 3 < words.length; index += 1) {
    fourWordWindows += 1;
    const window = words.slice(index, index + 4);
    const windowAddresses = addresses.slice(index, index + 4);
    if (windowAddresses.some((address) => address >= table.length)) continue;
    const bytes = windowAddresses.map((address) => grid.bytes[address]);
    const residues = bytes.map((value) => value % 29);
    if (residues.join(",") === "15,22,2,22") {
      dhResiduePacketHits.push({
        page,
        index,
        addresses: windowAddresses,
        tokens: windowAddresses.map((address) => table[address]),
        bytes,
        residues,
      });
    }

    const high = windowAddresses.map((address) => Number(table[address][0]));
    if (high.join(",") !== "0,3,1,4") continue;
    fourHits.push({
      page,
      index,
      sourceWords: window.map(translit),
      addresses: windowAddresses,
      tokens: windowAddresses.map((address) => table[address]),
      high,
      output: translit(high),
      locations: locations.slice(index, index + 4),
    });
  }
}

assert.equal(withinPagePairs, 3288);
assert.equal(movementEligible.length, 292);
assert.deepEqual(movementHits, [
  {
    page: 7,
    index: 26,
    source: "IEOTH",
    target: "EOUO",
    sourceAddress: 24,
    token: "1n",
    destination: 16,
    targetAddress: 16,
    sourceLoc: { line: 5, word: 5 },
    targetLoc: { line: 5, word: 6 },
    crossLine: false,
  },
  {
    page: 26,
    index: 53,
    source: "CHISFIN",
    target: "POENG",
    sourceAddress: 57,
    token: "1w",
    destination: 56,
    targetAddress: 56,
    sourceLoc: { line: 10, word: 2 },
    targetLoc: { line: 10, word: 3 },
    crossLine: false,
  },
]);

assert.deepEqual(pair57to56, [{
  page: 26,
  index: 53,
  source: "CHISFIN",
  target: "POENG",
  sourceLoc: { line: 10, word: 2 },
  targetLoc: { line: 10, word: 3 },
}]);

assert.equal(fourWordWindows, 3176);
assert.equal(fourHits.length, 4);
const p26Four = fourHits.find((hit) => hit.page === 26);
assert.deepEqual(p26Four, {
  page: 26,
  index: 51,
  sourceWords: ["E", "SAOE", "CHISFIN", "POENG"],
  addresses: [18, 61, 57, 56],
  tokens: ["0F", "3G", "1w", "4E"],
  high: [0, 3, 1, 4],
  output: "FOUR",
  locations: [
    { line: 9, word: 5 },
    { line: 10, word: 1 },
    { line: 10, word: 2 },
    { line: 10, word: 3 },
  ],
});

assert.deepEqual(dhResiduePacketHits, [{
  page: 26,
  index: 51,
  addresses: [18, 61, 57, 56],
  tokens: ["0F", "3G", "1w", "4E"],
  bytes: [15, 196, 118, 254],
  residues: [15, 22, 2, 22],
}]);

/** @param {number} left @param {number} right */
function gcd(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

const p26Bytes = p26Four.addresses.map((address) => grid.bytes[address]);
const p26Residues = p26Bytes.map((value) => value % 29);
assert.deepEqual(p26Residues, [15, 22, 2, 22]);
assert.deepEqual(p26Residues, [15, 23 - 1, 2, 23 - 1]);

const firstPairGcd = gcd(p26Residues[0], p26Residues[1]);
const finalPairGcd = gcd(p26Residues[2], p26Residues[3]);
assert.equal(firstPairGcd, 1);
assert.equal(finalPairGcd, 2);
assert.equal(firstPairGcd, p26Four.high[2]);
assert.equal(translit([finalPairGcd]), "TH");
assert.equal(p26Four.output + translit([finalPairGcd]), "FOURTH");

const fourExtensions = fourHits.map((hit) => {
  const residues = hit.addresses.map((address) => grid.bytes[address] % 29);
  const suffix = gcd(residues[2], residues[3]);
  return {
    page: hit.page,
    residues,
    suffix,
    suffixRune: translit([suffix]),
    output: hit.output + translit([suffix]),
  };
});
assert.deepEqual(fourExtensions, [
  { page: 5, residues: [25, 26, 21, 21], suffix: 21, suffixRune: "NG", output: "FOURNG" },
  { page: 23, residues: [10, 24, 15, 21], suffix: 3, suffixRune: "O", output: "FOURO" },
  { page: 26, residues: [15, 22, 2, 22], suffix: 2, suffixRune: "TH", output: "FOURTH" },
  { page: 31, residues: [4, 9, 20, 21], suffix: 1, suffixRune: "U", output: "FOURU" },
]);

/** @param {number} value @param {number} modulus */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let current = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/*
 * The packet itself reconstructs the literal p28 operation label:
 * b=15, p-1=22 => b^-1=3; K=2 => K^3 mod23 = A=8;
 * [p,A]=[23,8] transliterates DH.
 */
const recoveredP = p26Residues[1] + 1;
const inverseB = inverseModulo(p26Residues[0], p26Residues[1]);
assert.equal(recoveredP, 23);
assert.equal(inverseB, 3);
const recoveredA = powModulo(p26Residues[2], inverseB, recoveredP);
assert.equal(recoveredA, 8);
assert.equal(translit([recoveredP, recoveredA]), "DH");

/*
 * Disambiguate "FOURTH DH" from "DH selects a source line; FOURTH D; H".
 * Reconstructed DH uniquely names a physical line start on p28. Literal DH
 * bigrams occur elsewhere, so charge the natural fourth-global-DH rival.
 */
const dhValue = [recoveredP, recoveredA];
const transcriptionPages = transcription.split(/^\s*%\s*$/m);
const dhLineStarts = [];
for (let page = 0; page < transcriptionPages.length; page += 1) {
  const lines = (transcriptionPages[page] || "").trim().split("/");
  for (let line = 0; line < lines.length; line += 1) {
    const values = [...lines[line]]
      .map((char) => runeIndex.get(char))
      .filter((value) => value !== undefined);
    if (values[0] === dhValue[0] && values[1] === dhValue[1]) {
      dhLineStarts.push({ page, line: line + 1 });
    }
  }
}
assert.deepEqual(dhLineStarts, [{ page: 28, line: 6 }]);

const literalDh = [];
for (const page of corpus.pages.filter((row) => row.page <= 55)) {
  for (let offset = 0; offset + 1 < page.indices.length; offset += 1) {
    if (
      page.indices[offset] === dhValue[0] &&
      page.indices[offset + 1] === dhValue[1]
    ) {
      literalDh.push({ page: page.page, offset });
    }
  }
}
assert.equal(literalDh.length, 11);
assert.deepEqual(literalDh[3], { page: 21, offset: 244 });

const p21Page = corpus.pages.find((page) => page.page === 21);
assert.ok(p21Page);
const rivalOffset = literalDh[3].offset;
const rivalCentered = p21Page.indices.slice(rivalOffset - 1, rivalOffset + 2);
assert.equal(translit(rivalCentered), "WDH");
const rivalH = [
  ((rivalCentered[0] - rivalCentered[2]) % 29 + 29) % 29,
  (rivalCentered[0] + rivalCentered[2]) % 29,
  rivalCentered[1],
];
assert.equal(translit(rivalH), "EASD");


/*
 * Read FOURTH + DH as the pre-existing p28 instruction "fourth D; H".
 * The frozen p28 consumer is checked directly from original source runes:
 * offset48 is fourth D, centered L-D-X under H gives G-C-D.
 */
const p28InstructionPage = corpus.pages.find((page) => page.page === 28);
assert.ok(p28InstructionPage);
const dIndexForInstruction = corpus.translit.findIndex(
  (token) => token.toUpperCase() === "D"
);
assert.equal(p28InstructionPage.indices[48], dIndexForInstruction);
assert.equal(
  p28InstructionPage.indices
    .slice(0, 49)
    .filter((value) => value === dIndexForInstruction).length,
  4
);
const p28Centered = p28InstructionPage.indices.slice(47, 50);
assert.deepEqual(p28Centered, [20, 23, 14]);
assert.equal(translit(p28Centered), "LDX");
const p28HOutput = [
  ((p28Centered[0] - p28Centered[2]) % 29 + 29) % 29,
  (p28Centered[0] + p28Centered[2]) % 29,
  p28Centered[1],
];
assert.deepEqual(p28HOutput, [6, 5, 23]);
assert.equal(translit(p28HOutput), "GCD");



/*
 * Follow the table-state continuation within p26 without changing semantics.
 * State48 occurs exactly once as a word-GP0 receiver, but the already-frozen
 * 4D current-page rune self-index does not transfer to p26.
 */
const p26NavigationLines = pages[26].trim().split("/");
const p26State48 = [];
for (let line = 0; line < p26NavigationLines.length; line += 1) {
  const lineWords = runeWords(p26NavigationLines[line]);
  for (let word = 0; word < lineWords.length; word += 1) {
    if (gp0(lineWords[word]) === 48) {
      p26State48.push({
        line: line + 1,
        word: word + 1,
        cipher: translit(lineWords[word]),
        vector: lineWords[word],
      });
    }
  }
}
assert.deepEqual(p26State48, [{
  line: 4,
  word: 1,
  cipher: "EAMU",
  vector: [28, 19, 1],
}]);

const p26Page = corpus.pages.find((page) => page.page === 26);
assert.ok(p26Page);
const dIndex = corpus.translit.findIndex((token) => token.toUpperCase() === "D");
assert.equal(corpus.translit[p26Page.indices[48]], "L");
assert.equal(
  p26Page.indices.slice(0, 49).filter((value) => value === dIndex).length,
  1
);

/*
 * The recovered DH shared secret K=2 gives a readable word at the selected
 * state56 receiver under +K, but charge the sign and English background before
 * treating it as plaintext.
 */
const selectedReceiver = runeWords(p26NavigationLines[9])[2];
const mod29 = (value) => ((value % 29) + 29) % 29;
const plusK = selectedReceiver.map((value) => mod29(value + 2));
const minusK = selectedReceiver.map((value) => mod29(value - 2));
assert.equal(translit(plusK), "SAD");
assert.equal(translit(minusK), "JLM");

const english = new Set(
  read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith(";"))
    .map((line) => line.trim().split(/\s+/)[0].toUpperCase())
);

let threeRuneWords = 0;
let signedKEnglishHits = 0;
for (let page = 0; page <= 55; page += 1) {
  for (const word of runeWords(pages[page] || "")) {
    if (word.length !== 3) continue;
    threeRuneWords += 1;
    for (const sign of [-1, 1]) {
      const shifted = word.map((value) => mod29(value + sign * 2));
      if (english.has(translit(shifted))) signedKEnglishHits += 1;
    }
  }
}
assert.equal(threeRuneWords, 795);
assert.equal(signedKEnglishHits, 41);

/*
 * Boundary: the second stage is a table-state transition, not the immediate
 * next p26 ciphertext word. After the state56 word, p26's next word is state95.
 */
const p26Lines = pages[26].trim().split("/");
const p26Line10 = runeWords(p26Lines[9]);
const p26Line10Addresses = p26Line10.map(gp0);
assert.deepEqual(p26Line10Addresses.slice(0, 4), [61, 57, 56, 95]);
assert.equal(hexCardinalMove(56, table[56]), 48);
assert.notEqual(p26Line10Addresses[3], 48);


const sourceFirstAudit = (() => {
  const solvedGp29 = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
  const base60Grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
  assert.deepEqual(base60Grid.rows.flat(), table);
  assert.equal(base60Grid.rows.length, 32);
  assert.deepEqual(base60Grid.page_row_counts, [10, 13, 9]);

  const alphabet60 = base60Grid.alphabet;
  const alphabet59 = alphabet60.replace("f", "");
  const gpPrime = (word) => word.reduce((sum, value) => sum + corpus.prime[value], 0);
  const addressModes = {
    "GP0": gp0,
    "GP0+1": (word) => gp0(word) + 1,
    "GP0-1": (word) => gp0(word) - 1,
    "GP-prime": gpPrime,
    "GP-prime mod256": (word) => gpPrime(word) % 256,
    "GP-prime+1 mod256": (word) => (gpPrime(word) + 1) % 256
  };
  const decodeWindow = (words, addressFn, side) => {
    const addresses = words.map(addressFn);
    if (addresses.some((value) => !Number.isInteger(value) || value < 0 || value >= table.length)) return null;
    const tokens = addresses.map((address) => table[address]);
    const values = tokens.map((token) => {
      if (side === "high") return /^\d$/.test(token[0]) ? Number(token[0]) : -1;
      return corpus.translit.findIndex((rune) => rune.toUpperCase() === token[1].toUpperCase());
    });
    if (values.some((value) => value < 0 || value >= 29)) return null;
    return { addresses, tokens, values, output: translit(values) };
  };
  const scanWindows = (pageWords, addressFn, side) => {
    const hits = [];
    for (let page = 0; page < pageWords.length; page++) {
      const words = pageWords[page];
      for (let i = 0; i + 3 < words.length; i++) {
        const decoded = decodeWindow(words.slice(i, i + 4), addressFn, side);
        if (decoded && decoded.output === "FOUR") {
          hits.push({ page, index: i, words: words.slice(i, i + 4).map(translit), ...decoded });
        }
      }
    }
    return hits;
  };

  const solvedSections = solvedGp29.sections.map((section) => ({
    name: section.name,
    words: runeWords(section.source_text)
  }));
  const solvedPageWords = solvedSections.map((section) => section.words);
  const solvedWordCount = solvedSections.reduce((sum, section) => sum + section.words.length, 0);
  const solvedWindowCount = solvedSections.reduce((sum, section) => sum + Math.max(0, section.words.length - 3), 0);
  assert.equal(solvedSections.length, 9);
  assert.equal(solvedWordCount, 740);
  assert.equal(solvedWindowCount, 713);

  const sourceReadoutCounts = {};
  for (const [mode, addressFn] of Object.entries(addressModes)) {
    for (const side of ["high", "low"]) {
      sourceReadoutCounts[mode + "/" + side] = scanWindows(solvedPageWords, addressFn, side).length;
    }
  }
  const solvedFourHits = scanWindows(solvedPageWords, gp0, "high");
  const solvedLowFourHits = scanWindows(solvedPageWords, gp0, "low");
  assert.equal(solvedFourHits.length, 1);
  assert.equal(solvedFourHits[0].page, 0);
  assert.deepEqual(solvedFourHits[0].words, ["FIND", "THEIR", "WAY", "HERE"]);
  assert.equal(solvedLowFourHits.length, 0);

  const welcomeSection = solvedSections.find((section) => section.name === "0_welcome");
  const welcomeWords = welcomeSection.words;
  const welcomePhraseIndex = welcomeWords.findIndex((word, i) =>
    i + 3 < welcomeWords.length &&
    welcomeWords.slice(i, i + 4).map(translit).join(" ") === "FIND THEIR WAY HERE"
  );
  assert.equal(welcomePhraseIndex, 23);
  const welcomePhrase = welcomeWords.slice(welcomePhraseIndex, welcomePhraseIndex + 4);
  const welcomeReadout = decodeWindow(welcomePhrase, gp0, "high");
  assert.deepEqual(welcomeReadout.addresses, [42, 34, 57, 48]);
  assert.deepEqual(welcomeReadout.tokens, ["0S", "3H", "1w", "4D"]);
  assert.deepEqual(welcomeReadout.values, [0, 3, 1, 4]);
  assert.equal(welcomeReadout.output, "FOUR");
  assert.equal(translit(welcomePhrase[1]), "THEIR");
  assert.equal(welcomePhrase[1].length, 4);

  const sourcePairStats = {
    pairs: 0, eligiblePairs: 0, firstMoves: 0, compositeMoves: 0,
    literalHits: [], compositeHits: []
  };
  for (const section of solvedSections) {
    for (let i = 0; i + 1 < section.words.length; i++) {
      sourcePairStats.pairs++;
      const from = gp0(section.words[i]);
      const to = gp0(section.words[i + 1]);
      if (from < 0 || from >= 256 || to < 0 || to >= 256) continue;
      sourcePairStats.eligiblePairs++;
      const token = table[from];
      const middle = literalMove(from, token);
      if (middle !== null) {
        sourcePairStats.firstMoves++;
        if (middle === to) sourcePairStats.literalHits.push({
          section: section.name, index: i, from: translit(section.words[i]),
          to: translit(section.words[i + 1]), source: from, token, target: to
        });
        const secondToken = table[middle];
        const destination = hexCardinalMove(middle, secondToken);
        if (destination !== null) {
          sourcePairStats.compositeMoves++;
          if (destination === to) sourcePairStats.compositeHits.push({
            section: section.name, index: i, from: translit(section.words[i]),
            to: translit(section.words[i + 1]), source: from, token,
            middle, secondToken, destination
          });
        }
      }
    }
  }
  assert.equal(sourcePairStats.pairs, 731);
  assert.equal(sourcePairStats.firstMoves, 81);
  assert.equal(sourcePairStats.compositeMoves, 11);
  assert.equal(sourcePairStats.literalHits.length, 0);
  assert.equal(sourcePairStats.compositeHits.length, 1);
  assert.equal(sourcePairStats.compositeHits[0].section, "0_welcome");
  assert.equal(sourcePairStats.compositeHits[0].from, "WAY");
  assert.equal(sourcePairStats.compositeHits[0].to, "HERE");
  assert.equal(sourcePairStats.compositeHits[0].source, 57);
  assert.equal(sourcePairStats.compositeHits[0].middle, 56);
  assert.equal(sourcePairStats.compositeHits[0].secondToken, "4E");
  assert.equal(sourcePairStats.compositeHits[0].destination, 48);

  const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
  const signedBody = signed2016
    .slice(signed2016.indexOf("\n\n") + 2, signed2016.indexOf("\n-----BEGIN PGP SIGNATURE-----"))
    .replace(/\r/g, "")
    .replace(/7A35090F/gi, " ");
  const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word) => word.toUpperCase());
  assert.equal(signedWords.length, 43);
  const wayPosition = signedWords.indexOf("WAY") + 1;
  const mapPosition = signedWords.indexOf("MAP") + 1;
  assert.equal(wayPosition, 14);
  assert.equal(mapPosition, 19);
  const betweenWayMap = signedWords.slice(wayPosition, mapPosition - 1);
  assert.deepEqual(betweenWayMap, ["ITS", "WORDS", "ARE", "THE"]);
  const translitEntries = corpus.translit
    .map((spelling, index) => ({ spelling: spelling.toUpperCase(), index }))
    .sort((a, b) => b.spelling.length - a.spelling.length);
  const latinWordToGp = (word) => {
    const out = [];
    for (let offset = 0; offset < word.length;) {
      const match = translitEntries.find((entry) => word.startsWith(entry.spelling, offset));
      if (!match) return null;
      out.push(match.index);
      offset += match.spelling.length;
    }
    return out;
  };
  const signedGpWords = signedWords.map(latinWordToGp);
  const signedPairStats = { pairs: 0, eligiblePairs: 0, literalHits: [], compositeHits: [] };
  for (let i = 0; i + 1 < signedGpWords.length; i++) {
    signedPairStats.pairs++;
    if (!signedGpWords[i] || !signedGpWords[i + 1]) continue;
    const from = gp0(signedGpWords[i]);
    const to = gp0(signedGpWords[i + 1]);
    if (from < 0 || from >= 256 || to < 0 || to >= 256) continue;
    signedPairStats.eligiblePairs++;
    const token = table[from];
    const middle = literalMove(from, token);
    if (middle === to) signedPairStats.literalHits.push({ index: i, from: signedWords[i], to: signedWords[i + 1] });
    const destination = middle === null ? null : hexCardinalMove(middle, table[middle]);
    if (destination === to) signedPairStats.compositeHits.push({ index: i, from: signedWords[i], to: signedWords[i + 1] });
  }

  const unknownPageWords = pages.slice(0, 56).map(runeWords);
  const unknownWindowCount = unknownPageWords.reduce((sum, words) => sum + Math.max(0, words.length - 3), 0);
  assert.equal(unknownWindowCount, 3176);
  const unknownReadoutCounts = {};
  const unknownReadoutHits = {};
  for (const [mode, addressFn] of Object.entries(addressModes)) {
    for (const side of ["high", "low"]) {
      const hits = scanWindows(unknownPageWords, addressFn, side);
      unknownReadoutCounts[mode + "/" + side] = hits.length;
      unknownReadoutHits[mode + "/" + side] = hits;
    }
  }
  assert.equal(unknownReadoutCounts["GP0/high"], 4);
  assert.equal(unknownReadoutCounts["GP0/low"], 0);
  assert.equal(unknownReadoutCounts["GP0+1/high"], 4);
  assert.equal(unknownReadoutCounts["GP0-1/high"], 2);
  assert.equal(unknownReadoutCounts["GP-prime/high"], 0);
  assert.equal(unknownReadoutCounts["GP-prime mod256/high"], 0);
  assert.equal(unknownReadoutCounts["GP-prime+1 mod256/high"], 6);
  const p26FourHit = unknownReadoutHits["GP0/high"].find((hit) => hit.page === 26);
  assert.ok(p26FourHit);
  assert.deepEqual(p26FourHit.words, ["E", "SAOE", "CHISFIN", "POENG"]);
  assert.deepEqual(p26FourHit.addresses, [18, 61, 57, 56]);
  assert.deepEqual(p26FourHit.tokens, ["0F", "3G", "1w", "4E"]);

  const unknownLiteralMovementHits = [];
  for (let page = 0; page < unknownPageWords.length; page++) {
    const words = unknownPageWords[page];
    for (let i = 0; i + 1 < words.length; i++) {
      const from = gp0(words[i]);
      const to = gp0(words[i + 1]);
      if (from < 0 || from >= 256 || to < 0 || to >= 256) continue;
      if (literalMove(from, table[from]) === to) {
        unknownLiteralMovementHits.push({
          page, index: i, from: translit(words[i]), to: translit(words[i + 1]),
          source: from, token: table[from], target: to
        });
      }
    }
  }
  assert.equal(unknownLiteralMovementHits.length, 2);
  assert.ok(unknownLiteralMovementHits.some((hit) => hit.page === 26 && hit.source === 57 && hit.target === 56));
  const p26WordIndex = unknownPageWords[26].findIndex((word, i) =>
    i + 3 < unknownPageWords[26].length &&
    unknownPageWords[26].slice(i, i + 4).map(gp0).join(",") === "18,61,57,56"
  );
  assert.ok(p26WordIndex >= 0);
  const p26NextWordAddress = gp0(unknownPageWords[26][p26WordIndex + 4]);
  assert.equal(p26NextWordAddress, 95);

  const tokenByte = (token, radix, alphabet) => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    return high < 0 || low < 0 ? null : radix * high + low;
  };
  const p26Base60Bytes = p26Four.tokens.map((token) => tokenByte(token, 60, alphabet60));
  const p26Base59Bytes = p26Four.tokens.map((token) => tokenByte(token, 59, alphabet59));
  const p26Base60Residues = p26Base60Bytes.map((value) => value % 29);
  const p26Base59Residues = p26Base59Bytes.map((value) => value === null ? null : value % 29);
  assert.deepEqual(p26Base60Bytes, [15, 196, 118, 254]);
  assert.deepEqual(p26Base60Residues, [15, 22, 2, 22]);
  assert.deepEqual(p26Base59Bytes, [15, 193, 116, 250]);
  assert.deepEqual(p26Base59Residues, [15, 19, 0, 18]);

  const packetHits = (radix, alphabet) => {
    const hits = [];
    for (let page = 0; page < unknownPageWords.length; page++) {
      const words = unknownPageWords[page];
      for (let i = 0; i + 3 < words.length; i++) {
        const addresses = words.slice(i, i + 4).map(gp0);
        if (addresses.some((address) => address < 0 || address >= 256)) continue;
        const tokens = addresses.map((address) => table[address]);
        const bytes = tokens.map((token) => tokenByte(token, radix, alphabet));
        if (bytes.some((value) => value === null)) continue;
        const residues = bytes.map((value) => value % 29);
        if (residues.join(",") === "15,22,2,22") {
          hits.push({ page, index: i, words: words.slice(i, i + 4).map(translit), addresses, tokens, bytes, residues });
        }
      }
    }
    return hits;
  };
  const base60PacketHits = packetHits(60, alphabet60);
  const base59PacketHits = packetHits(59, alphabet59);
  assert.equal(base60PacketHits.length, 1);
  assert.equal(base60PacketHits[0].page, 26);
  assert.equal(base59PacketHits.length, 0);

  const gcdPairingSpecs = [
    { name: "adjacent", pairs: [[0, 1], [2, 3]] },
    { name: "crossed", pairs: [[0, 2], [1, 3]] },
    { name: "outer", pairs: [[0, 3], [1, 2]] }
  ];
  const gcdPairings = (residues) => gcdPairingSpecs.map((spec) => {
    const values = spec.pairs.map(([a, b]) => gcd(residues[a], residues[b]));
    return { name: spec.name, pairs: spec.pairs, gcds: values, runes: values.map((value) => translit([value])) };
  });
  const base60GcdPairings = gcdPairings(p26Base60Residues);
  const base59GcdPairings = gcdPairings(p26Base59Residues);
  const dhSource = read("resources/external/2013-tcp-server-signed-source.md");
  assert.ok(dhSource.includes("BASE29 3301"));
  assert.ok(dhSource.includes("worked DH 23 exchange"));
  assert.ok(dhSource.includes("server base 5"));
  assert.ok(dhSource.includes("public share 8"));
  assert.ok(dhSource.includes("client public share 19"));
  assert.ok(dhSource.includes("shared key 2"));
  const dhB = Array.from({ length: 22 }, (_, i) => i + 1).find((secret) => powModulo(5, secret, 23) === 19);
  assert.equal(dhB, 15);
  assert.deepEqual(p26Base60Residues, [dhB, 23 - 1, 2, 23 - 1]);
  const cibertecPreCicada = dhSource.includes("17 April 2012") && dhSource.includes("b=15");
  const miraclSource = read("resources/external/miracl-2007-base60-alphabet.md");
  const miraclBase60Precedent = miraclSource.includes(alphabet60);

  const mod29 = (value) => ((value % 29) + 29) % 29;
  const H3 = (input) => [mod29(input[0] - input[2]), mod29(input[0] + input[2]), input[1]];
  const H3Inverse = (output) => [
    mod29((output[0] + output[1]) * 15),
    output[2],
    mod29((output[1] - output[0]) * 15)
  ];
  const p28Page = corpus.pages.find((page) => page.page === 28).indices;
  const p29Page = corpus.pages.find((page) => page.page === 29).indices;
  const dRune = corpus.translit.indexOf("D");
  const p28DPositions = p28Page.map((value, index) => value === dRune ? index : -1).filter((index) => index >= 0);
  assert.equal(p28DPositions[3], 48);
  assert.equal(p28DPositions[4], 71);
  const makeHTest = (name, offsets, input) => {
    const output = H3(input);
    const inverse = H3Inverse(output);
    assert.deepEqual(inverse, input);
    return {
      name, offsets, input, inputText: translit(input),
      output, outputText: translit(output), inverse,
      exactForwardReconstruction: JSON.stringify(inverse) === JSON.stringify(input)
    };
  };
  const p28HTest = makeHTest("p28 fourth-D target (not blind: prior report exposed GCD)", [47, 48, 49], p28Page.slice(47, 50));
  const p28FifthDTest = makeHTest("p28 fifth-D negative control", [70, 71, 72], p28Page.slice(70, 73));
  const p29HoldoutTest = makeHTest("p29 predeclared untouched holdout", [0, 1, 2], p29Page.slice(0, 3));
  const p56Runes = runeWords(solvedGp29.sections.find((section) => section.name === "p56_an_end").source_text).flat();
  const p57Runes = runeWords(solvedGp29.sections.find((section) => section.name === "p57_parable").source_text).flat();
  const p56DPositions = p56Runes.map((value, index) => value === dRune ? index : -1).filter((index) => index >= 0);
  const p57DPositions = p57Runes.map((value, index) => value === dRune ? index : -1).filter((index) => index >= 0);
  assert.equal(p56DPositions.length, 3);
  assert.equal(p57DPositions[3], 88);
  const p57ControlTest = makeHTest("p57 solved-page fourth-D control", [87, 88, 89], p57Runes.slice(87, 90));

  return {
    source: {
      solvedSectionCount: solvedSections.length,
      solvedWordCount,
      solvedFourWordWindows: solvedWindowCount,
      solvedHighFourHits: solvedFourHits.map((hit) => ({
        section: solvedSections[hit.page].name, index: hit.index,
        words: hit.words, addresses: hit.addresses, tokens: hit.tokens
      })),
      solvedLowFourHitCount: solvedLowFourHits.length,
      readoutCounts: sourceReadoutCounts,
      welcomePhrase: {
        oneBasedWordPositions: [welcomePhraseIndex + 1, welcomePhraseIndex + 2, welcomePhraseIndex + 3, welcomePhraseIndex + 4],
        words: welcomePhrase.map(translit),
        addresses: welcomeReadout.addresses,
        tokens: welcomeReadout.tokens,
        highDigits: welcomeReadout.values,
        output: welcomeReadout.output
      },
      solvedAdjacency: sourcePairStats,
      signed2016: {
        naturalWordCount: signedWords.length,
        wayOneBasedPosition: wayPosition,
        mapOneBasedPosition: mapPosition,
        wordsBetweenWayAndMap: betweenWayMap,
        eligibleAdjacentPairs: signedPairStats.eligiblePairs,
        literalMovementHits: signedPairStats.literalHits,
        compositeMovementHits: signedPairStats.compositeHits
      }
    },
    unknown: {
      fourWordWindowCount: unknownWindowCount,
      readoutCounts: unknownReadoutCounts,
      gp0HighFourHits: unknownReadoutHits["GP0/high"].map((hit) => ({
        page: hit.page, index: hit.index, words: hit.words,
        addresses: hit.addresses, tokens: hit.tokens
      })),
      literalMovementHits: unknownLiteralMovementHits,
      p26NextWordAfterState56GP0: p26NextWordAddress
    },
    dhPacket: {
      p26Words: p26Four.sourceWords,
      p26Addresses: p26Four.addresses,
      p26Tokens: p26Four.tokens,
      base60Alphabet: alphabet60,
      base60Bytes: p26Base60Bytes,
      base60Residues: p26Base60Residues,
      base59Alphabet: alphabet59,
      base59Bytes: p26Base59Bytes,
      base59Residues: p26Base59Residues,
      base60ExactPacketHits: base60PacketHits,
      base59ExactPacketHits: base59PacketHits,
      signed2013DH23: {
        authenticatedSourceContainsDH23: true,
        p: 23, g: 5, serverPublicShare: 8, clientPublicShare: 19, sharedKey: 2,
        derivedServerSecretExponent: dhB,
        pMinus1: 22,
        fullTuplePredatesCicada: cibertecPreCicada,
        externalMIRACLBase60Precedent: miraclBase60Precedent
      },
      gcdPairingsBase60: base60GcdPairings,
      gcdPairingsBase59: base59GcdPairings,
      standardDhGcd: gcd(dhB, 22),
      extendedSharedKeyGcd: gcd(2, 22),
      inverseExponent: inverseModulo(dhB, 22)
    },
    frozenHTest: {
      operation: "H(x,y,z)=(x-z,x+z,y) mod29",
      inverse: "x=(d+s)/2, z=(s-d)/2 mod29; y carried",
      p28Target: p28HTest,
      p57SolvedControl: p57ControlTest,
      p56FourthDControl: { dCount: p56DPositions.length, status: "no fourth D; frozen ordinal receiver absent" },
      p29PredeclaredHoldout: p29HoldoutTest,
      p28FifthDNegativeControl: p28FifthDTest,
      interpretation: "Exact H inversion reconstructs each input, but the outputs are GCD, LIAD, AEHD, and AYD; none is a meaningful plaintext span. The p28 GCD output is a short operation label. The p29 holdout was frozen at offsets 0-2 before p29 values were inspected."
    },
    decision: "Retain the p26 FOUR / WAY-MAP-HERE / DH23 chain as a source-constrained navigation and meta-instruction hypothesis. It selects the p28 fourth-D/H local receiver under the tested interpretation, but the only recovered output is the three-rune opcode GCD; the p57 control and predeclared p29 holdout do not produce plaintext, and p56 has no fourth D. The DH23 tuple is a pre-Cicada textbook example, base60 is not author-authenticated, and the final-pair GCD needed for TH is an extension beyond the standard gcd(b,p-1) check. No source-selected page cipher inverse or continuous unknown-page plaintext is established."
  };
})();

console.log(JSON.stringify({
  sourceFirstAudit,
  status: "PASS",
  tableComposite,
  unknownCorpus: {
    withinPagePairs,
    movementEligible: movementEligible.length,
    movementHits,
    unique57to56: pair57to56,
    fourWordWindows,
    fourHits,
  },
  p26Receiver: {
    fourWindow: p26Four,
    dhResiduePacketHits,
    dhResidues: p26Residues,
    dhPacketLabels: ["b", "p-1", "K", "p-1"],
    gcdChecks: { firstPairGcd, finalPairGcd, extendedInstruction: p26Four.output + translit([finalPairGcd]), fourExtensions },
    reconstructedDhInstruction: { recoveredP, inverseB, recoveredA, label: translit([recoveredP, recoveredA]), dhLineStarts, literalDhCount: literalDh.length, fourthGlobalDh: literalDh[3], fourthGlobalDhHOutput: translit(rivalH), p28Centered: translit(p28Centered), hOutput: translit(p28HOutput) },
    uniqueState48Word: p26State48,
    state48CurrentPageSelfIndex: { offset48Rune: corpus.translit[p26Page.indices[48]], dCountThrough48: 1, pass: false },
    sharedSecretWordProbe: { plusK: translit(plusK), minusK: translit(minusK), threeRuneWords, signedKEnglishHits },
    line10Addresses: p26Line10Addresses,
    exactNextStateTransition: "57 --1w--> 56",
    tableContinuation: "56 --4E/hex N--> 48",
    immediateCiphertextContinuation: 95,
  },
  classification:
    "Source-constrained navigation/meta-instruction candidate only; no page cipher inverse or continuous plaintext. See sourceFirstAudit for the full source family, radix, GCD, and holdout audit.",
}, null, 2));
