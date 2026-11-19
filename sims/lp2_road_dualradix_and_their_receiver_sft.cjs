"use strict";

/**
 * SFT: ROAD base29-number dual-radix receiver selects p0 AND THEIR shape.
 *
 * Chronology:
 * - ROAD was already recovered upstream before this test.
 * - ROAD's base29-number direction and one-based p50 cell189 = 3C were already
 *   documented upstream.
 * - The target successors AND THEIR and their [3,4] GP lengths were sealed
 *   before p0 receiver values at 189..195 were consumed.
 * - Existing fixed keys are tested first and fail.
 * - Post-target source-atom key families are then charged explicitly.
 */

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

assert.equal(tableTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }

    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert.ok(token, "unmapped GP word " + word + " at " + offset);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @param {number} modulus @returns {number} */
function base29Mod(values, modulus) {
  let value = 0;
  for (const digit of values) value = (value * 29 + digit) % modulus;
  return value;
}

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

/**
 * @typedef {{index:number,start:number,end:number,length:number,values:number[]}} RuneWord
 */

/** @param {string} source @returns {RuneWord[]} */
function parsePage(source) {
  /** @type {RuneWord[]} */
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: runeOffset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

/** @returns {Array<{index:number,word:string,gp:number[]}>} */
function signedWords() {
  const clear = signed2016.match(
    /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
  );
  assert.ok(clear);
  return (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word, index) => ({
    index,
    word: word.toUpperCase(),
    gp: gp(word),
  }));
}

/** @param {string} source @returns {string[]} */
function runeLines(source) {
  return source.split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

/** @param {string} line @returns {number[]} */
function lineValues(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || [])
    .flatMap((fragment) => [...fragment].map((rune) => runeIndex.get(rune)));
}

/** @param {number[]} ciphertext @param {number[]} key @param {-1|1} sign @returns {number[]} */
function applyKey(ciphertext, key, sign) {
  assert.equal(ciphertext.length, key.length);
  return ciphertext.map((value, index) => mod29(value + sign * key[index]));
}

/**
 * @param {string[]} targetWords
 * @returns {Map<string,string>}
 */
function targetMap(targetWords) {
  return new Map(targetWords.map((word) => [gp(word).join(","), word]));
}

/**
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {number} length
 * @param {Map<string,string>} targets
 * @returns {{count:number,hits:Array<{page:number,wordIndex:number,start:number,end:number,target:string}>}}
 */
function manuscriptHits(key, sign, length, targets) {
  let count = 0;
  const hits = [];
  const physical = parts.slice(0, 55);

  for (let segment = 0; segment < physical.length; segment += 1) {
    const page = segment >= 50 ? segment + 1 : segment;
    for (const word of parsePage(physical[segment])) {
      if (word.length !== length) continue;
      count += 1;
      const plain = applyKey(word.values, key, sign);
      const target = targets.get(plain.join(","));
      if (target) {
        hits.push({
          page,
          wordIndex: word.index,
          start: word.start,
          end: word.end,
          target,
        });
      }
    }
  }
  return { count, hits };
}

const message = signedWords();
assert.equal(message.length, 43);
assert.deepEqual(
  message.slice(22, 26).map((row) => row.word),
  ["THE", "ROAD", "AND", "THEIR"]
);
assert.deepEqual(
  message.slice(22, 26).map((row) => row.gp.length),
  [2, 4, 3, 4]
);

// Reconstruct the independently selected p28 HERE/DH source objects.
const p28Lines = runeLines(parts[28]);
assert.equal(p28Lines.length, 12);
const hereLine = lineValues(p28Lines[0]);
const dhLine = lineValues(p28Lines[5]);
assert.equal(hereLine.length, 23);
assert.equal(dhLine.length, 23);

const dhFragments = (p28Lines[5].match(/[\u16A0-\u16FF]+/gu) || [])
  .map((fragment) => [...fragment].map((rune) => runeIndex.get(rune)));
assert.equal(spell(dhFragments[0]), "DH");
assert.equal(dhFragments.length, 5);

const dhFirst = H(dhFragments[0][0], dhFragments[0].at(-1));
const dhLast = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const state = Object.freeze({
  p: 23,
  g: dhFragments.length,
  a: 6,
  b: dhFirst[0],
  A: dhLast[0],
  B: dhLast[1],
  K: dhFirst[1],
});
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.map((word) => [word.start, word]));

// Full source-only dual-radix structural family.
const adjacentHits = [];
const shapeHits = [];
let structuralConfigs = 0;

for (let index = 0; index < message.length - 2; index += 1) {
  const source = message[index];
  const number = base29Mod(source.gp, 256);

  for (const addressOrigin of ["zero", "one"]) {
    const address = addressOrigin === "zero" ? number : number - 1;
    if (address < 0 || address >= 256) continue;

    const token = tableTokens[address];
    const value59 = decodeToken(token, alphabet59);
    const value60 = decodeToken(token, alphabet60);
    if (value59 === null || value60 === null) continue;

    for (const receiverOrigin of ["zero", "one"]) {
      structuralConfigs += 1;
      const start59 = receiverOrigin === "zero" ? value59 : value59 - 1;
      const start60 = receiverOrigin === "zero" ? value60 : value60 - 1;
      const word59 = p0ByStart.get(start59);
      const word60 = p0ByStart.get(start60);
      if (!word59 || !word60 || word59.index + 1 !== word60.index) continue;

      const hit = {
        sourceIndex: index,
        source: source.word,
        number,
        addressOrigin,
        address,
        token,
        receiverOrigin,
        start59,
        start60,
        receiverLengths: [word59.length, word60.length],
        nextWords: [message[index + 1].word, message[index + 2].word],
        nextLengths: [message[index + 1].gp.length, message[index + 2].gp.length],
      };
      adjacentHits.push(hit);

      if (
        hit.receiverLengths[0] === hit.nextLengths[0] &&
        hit.receiverLengths[1] === hit.nextLengths[1]
      ) {
        shapeHits.push(hit);
      }
    }
  }
}

assert.equal(structuralConfigs, 164);
assert.equal(adjacentHits.length, 14);
assert.deepEqual(shapeHits, [{
  sourceIndex: 23,
  source: "ROAD",
  number: 190,
  addressOrigin: "one",
  address: 189,
  token: "3C",
  receiverOrigin: "zero",
  start59: 189,
  start60: 192,
  receiverLengths: [3, 4],
  nextWords: ["AND", "THEIR"],
  nextLengths: [3, 4],
}]);

// Receiver values are now consumed, after the chronology/precommit boundary.
const andReceiver = p0ByStart.get(189);
const theirReceiver = p0ByStart.get(192);
assert.deepEqual(andReceiver, {
  index: 42,
  start: 189,
  end: 191,
  length: 3,
  values: [0, 6, 9],
});
assert.deepEqual(theirReceiver, {
  index: 43,
  start: 192,
  end: 195,
  length: 4,
  values: [19, 12, 20, 9],
});

// Sealed fixed-key transfers.
const oldAndKey = [10, 20, 15];
const oldAndPlain = applyKey(andReceiver.values, oldAndKey, -1);
assert.equal(spell(oldAndPlain), "MSD");

const frozenFourKeys = [
  { name: "ROAD", key: [12, 5, 1, 4] },
  { name: "WILL", key: [12, 6, 18, 27] },
  { name: "GOOD", key: [18, 18, 23, 20] },
  { name: "LUCK", key: [17, 16, 4, 22] },
];
const frozenTransfer = frozenFourKeys.map((entry) => ({
  name: entry.name,
  text: spell(applyKey(theirReceiver.values, entry.key, -1)),
}));
assert.deepEqual(frozenTransfer, [
  { name: "ROAD", text: "WWMC" },
  { name: "WILL", text: "WGTHJ" },
  { name: "GOOD", text: "UDYE" },
  { name: "LUCK", text: "THAETT" },
]);

// Post-target source-atom family. Every slot independently chooses one of
// seven direct state fields, seven HERE-indexed fields, or seven DH-indexed
// fields. Both additive signs are charged.
const atoms = [];
for (const [field, value] of Object.entries(state)) {
  atoms.push({ name: field, value });
}
for (const [field, index] of Object.entries(state)) {
  atoms.push({ name: "HERE[" + field + "]", value: hereLine[index - 1] });
}
for (const [field, index] of Object.entries(state)) {
  atoms.push({ name: "DH[" + field + "]", value: dhLine[index - 1] });
}
assert.equal(atoms.length, 21);

/**
 * @param {RuneWord} receiver
 * @param {number} length
 * @param {string[]} authenticatedWords
 * @param {string} targetWord
 */
function atomFamilyAudit(receiver, length, authenticatedWords, targetWord) {
  const authenticated = targetMap(authenticatedWords);
  const wanted = gp(targetWord);
  let labelConfigs = 0;
  const distinctOps = new Map();
  const targetLabels = [];
  const authenticatedLabelHits = [];

  /** @param {number[]} key @param {string[]} names */
  function visit(key, names) {
    if (key.length === length) {
      for (const sign of /** @type {const} */ ([-1, 1])) {
        labelConfigs += 1;
        const id = sign + ":" + key.join(",");
        if (!distinctOps.has(id)) distinctOps.set(id, { key: key.slice(), sign, names: names.slice() });

        const plain = applyKey(receiver.values, key, sign);
        const authenticatedTarget = authenticated.get(plain.join(","));
        if (authenticatedTarget) {
          authenticatedLabelHits.push({ key: key.slice(), sign, names: names.slice(), target: authenticatedTarget });
        }
        if (plain.every((value, index) => value === wanted[index])) {
          targetLabels.push({ key: key.slice(), sign, names: names.slice() });
        }
      }
      return;
    }

    for (const atom of atoms) {
      visit([...key, atom.value], [...names, atom.name]);
    }
  }

  visit([], []);

  const distinctAuthenticatedHits = [];
  for (const member of distinctOps.values()) {
    const plain = applyKey(receiver.values, member.key, member.sign);
    const authenticatedTarget = authenticated.get(plain.join(","));
    if (authenticatedTarget) {
      distinctAuthenticatedHits.push({ ...member, target: authenticatedTarget });
    }
  }

  return {
    labelConfigs,
    distinctOps: distinctOps.size,
    targetLabels,
    targetDistinctKeys: new Set(targetLabels.map((hit) => hit.sign + ":" + hit.key.join(","))).size,
    authenticatedLabelHits: authenticatedLabelHits.length,
    distinctAuthenticatedHits,
  };
}

const distinctThreeTargets = [...new Set(
  message.filter((row) => row.gp.length === 3).map((row) => row.word)
)];
const distinctFourTargets = [...new Set(
  message.filter((row) => row.gp.length === 4).map((row) => row.word)
)];

const andAudit = atomFamilyAudit(andReceiver, 3, distinctThreeTargets, "AND");
assert.equal(andAudit.labelConfigs, 18522);
assert.equal(andAudit.distinctOps, 9826);
assert.equal(andAudit.targetDistinctKeys, 1);
assert.equal(andAudit.distinctAuthenticatedHits.length, 5);
assert.deepEqual(
  [...new Set(andAudit.targetLabels.map((hit) => hit.sign + ":" + hit.key.join(",")))],
  ["-1:5,26,15"]
);

const theirAudit = atomFamilyAudit(theirReceiver, 4, distinctFourTargets, "THEIR");
assert.equal(theirAudit.labelConfigs, 388962);
assert.equal(theirAudit.distinctOps, 167042);
assert.equal(theirAudit.targetDistinctKeys, 2);
assert.equal(theirAudit.distinctAuthenticatedHits.length, 3);
assert.deepEqual(
  [...new Set(theirAudit.targetLabels.map((hit) => hit.sign + ":" + hit.key.join(",")))].sort(),
  ["-1:17,23,10,5", "1:12,6,19,24"].sort()
);

// Exact compact representations.
assert.deepEqual(
  [state.g, hereLine[state.p - 1], state.b],
  [5, 26, 15]
);
assert.deepEqual(
  [hereLine[state.g - 1], state.p, hereLine[state.a - 1], hereLine[state.K - 1]],
  [17, 23, 10, 5]
);
assert.deepEqual(
  [dhLine[state.a - 1], state.a, state.B, dhLine[state.g - 1]],
  [12, 6, 19, 24]
);
assert.deepEqual(applyKey(andReceiver.values, [5, 26, 15], -1), gp("AND"));
assert.deepEqual(applyKey(theirReceiver.values, [17, 23, 10, 5], -1), gp("THEIR"));
assert.deepEqual(applyKey(theirReceiver.values, [12, 6, 19, 24], 1), gp("THEIR"));

// Manuscript-wide fixed-key uniqueness.
const threeTargets = targetMap(distinctThreeTargets);
const fourTargets = targetMap(distinctFourTargets);

const andGlobal = manuscriptHits([5, 26, 15], -1, 3, threeTargets);
assert.equal(andGlobal.count, 726);
assert.deepEqual(andGlobal.hits, [{
  page: 0,
  wordIndex: 42,
  start: 189,
  end: 191,
  target: "AND",
}]);

const theirGlobalA = manuscriptHits([17, 23, 10, 5], -1, 4, fourTargets);
assert.equal(theirGlobalA.count, 514);
assert.deepEqual(theirGlobalA.hits, [{
  page: 0,
  wordIndex: 43,
  start: 192,
  end: 195,
  target: "THEIR",
}]);

const theirGlobalB = manuscriptHits([12, 6, 19, 24], 1, 4, fourTargets);
assert.equal(theirGlobalB.count, 514);
assert.deepEqual(theirGlobalB.hits, [{
  page: 0,
  wordIndex: 43,
  start: 192,
  end: 195,
  target: "THEIR",
}]);

// No simple contiguous source-line or frozen outside-in H-shell key.
function outsideInH(values) {
  const out = [];
  const pairs = Math.floor(values.length / 2);
  for (let index = 0; index < pairs; index += 1) {
    out.push(...H(values[index], values[values.length - 1 - index]));
  }
  if (values.length % 2) out.push(values[pairs]);
  return out;
}

/** @param {number[]} haystack @param {number[]} needle @returns {number[]} */
function occurrences(haystack, needle) {
  const offsets = [];
  for (let start = 0; start + needle.length <= haystack.length; start += 1) {
    if (needle.every((value, index) => haystack[start + index] === value)) offsets.push(start);
  }
  return offsets;
}

const sourceStreams = {
  HERE: hereLine,
  DH: dhLine,
  HERE_H: outsideInH(hereLine),
  DH_H: outsideInH(dhLine),
};
for (const stream of Object.values(sourceStreams)) {
  assert.deepEqual(occurrences(stream, [5, 26, 15]), []);
  assert.deepEqual(occurrences(stream, [17, 23, 10, 5]), []);
  assert.deepEqual(occurrences(stream, [12, 6, 19, 24]), []);
}

// Obvious THEIR -> NUMBERS one-hop does not preserve the next source length.
const theirGp0 = gp("THEIR").reduce((sum, value) => sum + value, 0);
assert.equal(theirGp0, 34);
assert.equal(tableTokens[theirGp0], "3H");
assert.equal(decodeToken("3H", alphabet60), 197);
assert.equal(decodeToken("3H", alphabet59), 194);
const p0At196 = p0ByStart.get(196);
assert.equal(p0At196?.length, 5);
assert.equal(gp("NUMBERS").length, 7);
assert.equal(p0ByStart.has(194), false);


// Later independent reconciliation and held-out consequences.

// The radix difference itself carries the first receiver length at ROAD.
assert.equal(decodeToken("3C", alphabet60) - decodeToken("3C", alphabet59), 3);
assert.equal(andReceiver.length, 3);

// The solved-p56-authenticated nX self-index consumer transfers to numeric
// state56 on p0, but state56 is shared by MAP, AND and SEEK. It cannot by
// itself identify AND. THEIR's own 3H self-index fails.
const p0Values = p0.flatMap((word) => word.values);

/** @param {string} word */
function ordinalSelfIndex(word) {
  const address = gp(word).reduce((sum, value) => sum + value, 0);
  const token = tableTokens[address];
  const match = token.match(/^([1-9])([A-Z])$/u);
  if (!match) return { word, address, token, eligible: false, hit: false };
  const ordinal = Number(match[1]);
  const target = corpus.translit.findIndex((symbol) => symbol === match[2]);
  if (target < 0) return { word, address, token, eligible: false, hit: false };
  const count = p0Values.slice(0, address + 1).filter((value) => value === target).length;
  return {
    word,
    address,
    token,
    eligible: true,
    ordinal,
    target,
    valueAtAddress: p0Values[address],
    count,
    hit: p0Values[address] === target && count === ordinal,
  };
}
const andOrdinal = ordinalSelfIndex("AND");
const mapOrdinal = ordinalSelfIndex("MAP");
const seekOrdinal = ordinalSelfIndex("SEEK");
const theirOrdinal = ordinalSelfIndex("THEIR");
assert.deepEqual(
  [andOrdinal.address, mapOrdinal.address, seekOrdinal.address],
  [56, 56, 56]
);
assert.equal(andOrdinal.token, "4E");
assert.equal(andOrdinal.hit, true);
assert.equal(mapOrdinal.hit, true);
assert.equal(seekOrdinal.hit, true);
assert.equal(theirOrdinal.address, 34);
assert.equal(theirOrdinal.token, "3H");
assert.equal(theirOrdinal.hit, false);
assert.equal(theirOrdinal.valueAtAddress, 9);
assert.equal(theirOrdinal.count, 1);

// Agent8 independently made the ROAD source vector select the table's two
// literal 00 cells. Their interior length gives a source-only next receiver:
// 192 + (229 - 192 - 1) = 228, exactly a seven-rune p0 word start. This
// extends the geometry from AND/THEIR [3,4] to NUMBERS [7] without using
// word51 rune values.
const zeroCells = tableTokens
  .map((token, index) => token === "00" ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(zeroCells, [192, 229]);
const zeroInteriorLength = zeroCells[1] - zeroCells[0] - 1;
assert.equal(zeroInteriorLength, 36);
const numbersStart = zeroCells[0] + zeroInteriorLength;
assert.equal(numbersStart, 228);
const numbersReceiver = p0ByStart.get(numbersStart);
assert.ok(numbersReceiver);
assert.equal(numbersReceiver.length, 7);
assert.deepEqual(message.slice(23, 27).map((row) => row.word), [
  "ROAD", "AND", "THEIR", "NUMBERS"
]);
assert.deepEqual(message.slice(24, 27).map((row) => row.gp.length), [3, 4, 7]);

// The value-changing distinct-DH-field grammar does not transfer to this
// seven-rune receiver. Charge every permutation of all seven distinct state
// labels, every direct/HERE/DH lookup mask, and both signs. Exact assignment
// existence can be decided slotwise with a distinct-field backtrack instead
// of materializing all 22,044,960 labeled configurations.
const stateFields = Object.keys(state);
const fieldReadings = Object.fromEntries(stateFields.map((field) => {
  const position = state[field];
  return [field, [
    position,
    hereLine[position - 1],
    dhLine[position - 1],
  ]];
}));

/** @param {number[]} required */
function distinctFieldAssignments(required) {
  let count = 0;
  /** @param {number} index @param {Set<string>} used */
  function visit(index, used) {
    if (index === required.length) {
      count += 1;
      return;
    }
    for (const field of stateFields) {
      if (used.has(field)) continue;
      for (const value of fieldReadings[field]) {
        if (value !== required[index]) continue;
        used.add(field);
        visit(index + 1, used);
        used.delete(field);
      }
    }
  }
  visit(0, new Set());
  return count;
}

const sevenRuneTargets = [...new Map(
  message
    .filter((row) => row.gp.length === 7)
    .map((row) => [row.word, row])
).values()];
assert.deepEqual(sevenRuneTargets.map((row) => row.word), [
  "DEVOTED", "NUMBERS", "OPENPGP"
]);
const sevenFamilySize = 5040 * (3 ** 7) * 2;
assert.equal(sevenFamilySize, 22044960);
const sevenTargetHits = [];
for (const target of sevenRuneTargets) {
  for (const sign of [-1, 1]) {
    const required = numbersReceiver.values.map((cipher, index) =>
      sign === -1
        ? mod29(cipher - target.gp[index])
        : mod29(target.gp[index] - cipher)
    );
    const assignments = distinctFieldAssignments(required);
    if (assignments > 0) {
      sevenTargetHits.push({ target: target.word, sign, required, assignments });
    }
  }
}
assert.deepEqual(sevenTargetHits, []);

console.log(JSON.stringify({
  status: "PASS",
  classification: "prospective ROAD navigation is strengthened; AND THEIR remains candidate, word43 has an independent PATHS alternative, THEIR fails the ordinal self-index holdout, and the seven-rune distinct-field inverse does not transfer to the zero-bracket NUMBERS receiver",
  structural: {
    configurations: structuralConfigs,
    adjacentStartHits: adjacentHits.length,
    successorShapeHits: shapeHits,
  },
  receivers: {
    AND: andReceiver,
    THEIR: theirReceiver,
  },
  sealedTransfers: {
    AND: { key: oldAndKey, output: spell(oldAndPlain) },
    THEIR: frozenTransfer,
  },
  postTargetAtomAudit: {
    AND: {
      labelConfigs: andAudit.labelConfigs,
      distinctOps: andAudit.distinctOps,
      targetDistinctKeys: andAudit.targetDistinctKeys,
      distinctAuthenticatedHits: andAudit.distinctAuthenticatedHits.length,
      compactKey: [5, 26, 15],
      globalHits: andGlobal.hits,
    },
    THEIR: {
      labelConfigs: theirAudit.labelConfigs,
      distinctOps: theirAudit.distinctOps,
      targetDistinctKeys: theirAudit.targetDistinctKeys,
      distinctAuthenticatedHits: theirAudit.distinctAuthenticatedHits.length,
      compactKeys: [
        { key: [17, 23, 10, 5], sign: -1 },
        { key: [12, 6, 19, 24], sign: 1 },
      ],
      globalHits: [theirGlobalA.hits, theirGlobalB.hits],
    },
  },
  reconciliation: { andOrdinal, theirOrdinal, zeroCells, zeroInteriorLength, numbersStart, sevenFamilySize, sevenTargetHits },
  nextHop: {
    source: "THEIR",
    gp0: theirGp0,
    token: tableTokens[theirGp0],
    base59: 194,
    base60: 197,
    nextSource: "NUMBERS",
    nextSourceGpLength: gp("NUMBERS").length,
    base60OneBasedWordLength: p0At196?.length,
  },
}, null, 2));

console.log("PASS ROAD dual-radix AND THEIR receiver");
