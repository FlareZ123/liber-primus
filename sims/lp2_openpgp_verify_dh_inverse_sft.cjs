"use strict";

/**
 * SFT: authenticated VERIFY OPENPGP -> p0 VERIFY candidate.
 *
 * The 2016 first-party instruction literally supplies the adjacent words
 * VERIFY OPENPGP. OPENPGP's canonical GP0 state addresses p50[75]=2v.
 * Under the conventional full base60, zero-origin receiver reading this is
 * p0 offset177, exactly the start of a six-rune word matching VERIFY's GP
 * length. The p28 literal-DH state then supplies a compact additive key.
 *
 * This is a local source-constrained inverse. The key expression was
 * recognized after the receiver/target relation, so the SFT charges a broad
 * symmetric H/state family and reports the broader receiver-family baseline.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const table = grid.rows.flat();
const parts = transcription.split(/^\s*%\s*$/m);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function spell(values) {
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
  return gp(word).reduce((total, value) => total + value, 0);
}

function parsePage(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
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
  return words;
}

function physicalLines(page) {
  return parts[page]
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
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

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return (high * alphabet.length) + low;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word, index) => ({
      index,
      word: word.toUpperCase(),
      gp: gp(word),
    }));
}

function multiplicativeInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

function hChoices(left, right) {
  return [
    { name: "xy-d", value: H(left, right)[0] },
    { name: "xy-s", value: H(left, right)[1] },
    { name: "yx-d", value: H(right, left)[0] },
    { name: "yx-s", value: H(right, left)[1] },
  ];
}

function permutations3(values) {
  return [
    [values[0], values[1], values[2]],
    [values[0], values[2], values[1]],
    [values[1], values[0], values[2]],
    [values[1], values[2], values[0]],
    [values[2], values[0], values[1]],
    [values[2], values[1], values[0]],
  ];
}

const message = signedWords();
assert.equal(message.length, 43);
assert.deepEqual(message.slice(-2).map((row) => row.word), [
  "VERIFY",
  "OPENPGP",
]);

// Reconstruct the source-local p28 DH state from the literal-DH line.
const p28Lines = physicalLines(28);
assert.equal(p28Lines.length, 12);
const dhLineNumber = 6;
const dhFragments = lineFragments(p28Lines[dhLineNumber - 1]);
assert.equal(spell(dhFragments[0]), "DH");
const firstH = H(dhFragments[0][0], dhFragments[0].at(-1));
const lastH = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const state = Object.freeze({
  p: dhFragments.flat().length,
  g: dhFragments.length,
  a: dhLineNumber,
  b: firstH[0],
  A: lastH[0],
  B: lastH[1],
  K: firstH[1],
});
assert.deepEqual(state, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const e = multiplicativeInverse(state.b, state.p - 1);
assert.equal(e, 3);

// OPENPGP and the leading p28 READOUT candidate share the same GP0 state.
assert.equal(gp0("OPENPGP"), 75);
assert.equal(gp0("READOUT"), 75);
assert.equal(table[75], "2v");

// Charge the four conventional radix/origin receiver interpretations for the
// source object OPENPGP. Only base60/zero lands on a complete p0 word start
// whose length matches the adjacent source instruction VERIFY.
const p0 = parsePage(parts[0]);
const starts = new Map(p0.map((word) => [word.start, word]));
const ends = new Map(p0.map((word) => [word.end, word]));
const modes = [];
for (const [radix, alphabet] of [
  ["base60", alpha60],
  ["base59", alpha59],
]) {
  const raw = decodeToken(table[gp0("OPENPGP")], alphabet);
  assert.notEqual(raw, null);
  for (const origin of ["zero", "one"]) {
    const offset = origin === "zero" ? raw : raw - 1;
    const receiver = starts.get(offset) || null;
    modes.push({
      radix,
      origin,
      raw,
      offset,
      receiverLength: receiver ? receiver.length : null,
    });
  }
}
const verifyLength = gp("VERIFY").length;
assert.equal(verifyLength, 6);
assert.deepEqual(
  modes.filter((mode) => mode.receiverLength === verifyLength),
  [{
    radix: "base60",
    origin: "zero",
    raw: 177,
    offset: 177,
    receiverLength: 6,
  }]
);

const receiver = starts.get(177);
assert.ok(receiver);
assert.deepEqual(receiver, {
  index: 40,
  start: 177,
  end: 182,
  length: 6,
  values: [0, 14, 25, 13, 6, 14],
});

// Source-state key. It is compactly expressed as four H-sum coordinates
// plus the derived inverse exponent e and private exponent a.
const verifyKey = [
  H(state.p, state.g)[1],
  H(state.p, state.K)[1],
  H(state.b, state.a)[1],
  e,
  state.a,
  H(state.b, state.K)[1],
];
assert.deepEqual(verifyKey, [28, 25, 21, 3, 6, 17]);
const verifyPlain = receiver.values.map((value, index) =>
  mod29(value - verifyKey[index])
);
assert.deepEqual(verifyPlain, gp("VERIFY"));
assert.equal(spell(verifyPlain), "UERIFY");
assert.deepEqual(
  verifyPlain.map((value, index) => mod29(value + verifyKey[index])),
  receiver.values
);

// Charge a symmetric local family around the key formula:
// - swap Alice/Bob private roles;
// - every H coordinate and operand orientation in four H slots;
// - both pair orders;
// - both orders of the direct [e, private] slots;
// - both additive signs;
// - every authenticated six-rune target.
const sixRuneTargets = new Map();
for (const row of message) {
  if (row.gp.length !== 6) continue;
  if (!sixRuneTargets.has(row.gp.join(","))) {
    sixRuneTargets.set(row.gp.join(","), []);
  }
  sixRuneTargets.get(row.gp.join(",")).push(row.word);
}
assert.deepEqual(
  [...sixRuneTargets.values()].map((names) => names[0]).sort(),
  ["BEWARE", "PRIMUS", "VERIFY"]
);

const roles = [
  { name: "b/a", anchor: state.b, other: state.a },
  { name: "a/b", anchor: state.a, other: state.b },
];

let familyConfigs = 0;
const familyHits = [];
for (const role of roles) {
  for (const pg of hChoices(state.p, state.g)) {
    for (const pk of hChoices(state.p, state.K)) {
      for (const pOrder of [0, 1]) {
        for (const pair of hChoices(role.anchor, role.other)) {
          for (const kPair of hChoices(role.anchor, state.K)) {
            for (const bOrder of [0, 1]) {
              for (const directOrder of [0, 1]) {
                for (const sign of [-1, 1]) {
                  familyConfigs += 1;
                  const pBlock = pOrder
                    ? [pk.value, pg.value]
                    : [pg.value, pk.value];
                  const bBlock = bOrder
                    ? [kPair.value, pair.value]
                    : [pair.value, kPair.value];
                  const direct = directOrder
                    ? [role.other, e]
                    : [e, role.other];
                  const key = [
                    pBlock[0],
                    pBlock[1],
                    bBlock[0],
                    direct[0],
                    direct[1],
                    bBlock[1],
                  ];
                  const plain = receiver.values.map((value, index) =>
                    mod29(value + (sign * key[index]))
                  );
                  const matches = sixRuneTargets.get(plain.join(",")) || [];
                  if (matches.length) {
                    familyHits.push({
                      role: role.name,
                      pg: pg.name,
                      pk: pk.name,
                      pOrder,
                      pair: pair.name,
                      kPair: kPair.name,
                      bOrder,
                      directOrder,
                      sign: sign === -1 ? "subtract" : "add",
                      key,
                      plain,
                      matches,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(familyConfigs, 8192);
assert.equal(familyHits.length, 16);
const distinctFamilyOps = new Map(
  familyHits.map((hit) => [
    [hit.key.join(","), hit.sign, hit.plain.join(",")].join("|"),
    hit,
  ])
);
assert.equal(distinctFamilyOps.size, 1);
const familyOp = [...distinctFamilyOps.values()][0];
assert.deepEqual(familyOp.key, verifyKey);
assert.equal(familyOp.sign, "subtract");
assert.deepEqual(familyOp.matches, ["VERIFY"]);

// Fixed-key manuscript transfer across every complete unknown six-rune word.
let sixRuneWords = 0;
const manuscriptHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parsePage(parts[page])) {
    if (word.length !== 6) continue;
    sixRuneWords += 1;
    const plain = word.values.map((value, index) =>
      mod29(value - verifyKey[index])
    );
    const matches = sixRuneTargets.get(plain.join(",")) || [];
    if (matches.length) {
      manuscriptHits.push({
        page,
        word: word.index,
        start: word.start,
        end: word.end,
        cipher: word.values,
        plain,
        matches,
      });
    }
  }
}
assert.equal(sixRuneWords, 253);
assert.deepEqual(manuscriptHits, [{
  page: 0,
  word: 40,
  start: 177,
  end: 182,
  cipher: [0, 14, 25, 13, 6, 14],
  plain: gp("VERIFY"),
  matches: ["VERIFY"],
}]);

// The same state75 value also selects a complete p-rune centered packet.
// Under the independently corroborated base60/zero convention, center177
// gives 166..188. Its first complete word is seven runes, exactly matching
// OPENPGP itself. Among all distinct signed source words, this is the only
// base60/zero p-centered packet whose endpoints are printed word boundaries
// and whose first word length matches the source word.
const halfGroup = (state.p - 1) / 2;
assert.equal(halfGroup, 11);
const packetCenter = decodeToken(table[gp0("OPENPGP")], alpha60);
assert.equal(packetCenter, 177);
const packetStart = packetCenter - halfGroup;
const packetEnd = packetCenter + halfGroup;
assert.equal(packetStart, 166);
assert.equal(packetEnd, 188);
assert.ok(starts.has(packetStart));
assert.ok(ends.has(packetEnd));
assert.equal(packetEnd - packetStart + 1, state.p);

const distinctSignedWords = [...new Map(
  message.map((row) => [row.word, row])
).values()];
const centeredBase60Hits = [];
for (const row of distinctSignedWords) {
  const address = gp0(row.word);
  if (address < 0 || address >= table.length) continue;
  const center = decodeToken(table[address], alpha60);
  if (center === null) continue;
  const start = center - halfGroup;
  const end = center + halfGroup;
  const first = starts.get(start);
  const last = ends.get(end);
  if (
    first &&
    last &&
    first.length === row.gp.length
  ) {
    centeredBase60Hits.push({
      word: row.word,
      address,
      token: table[address],
      center,
      start,
      end,
      firstWord: first.index,
      firstLength: first.length,
      lastWord: last.index,
    });
  }
}
assert.deepEqual(centeredBase60Hits, [{
  word: "OPENPGP",
  address: 75,
  token: "2v",
  center: 177,
  start: 166,
  end: 188,
  firstWord: 37,
  firstLength: 7,
  lastWord: 41,
}]);

const openpgpReceiver = starts.get(packetStart);
assert.deepEqual(openpgpReceiver, {
  index: 37,
  start: 166,
  end: 172,
  length: 7,
  values: [26, 16, 13, 10, 2, 23, 11],
});
assert.equal(gp("OPENPGP").length, 7);
assert.equal(receiver.start, packetCenter);

// The first packet word has its own compact p28-state inverse.
const pInverse29 = multiplicativeInverse(state.p, 29);
assert.equal(pInverse29, 24);
const openpgpKey = [
  state.p,
  e,
  pInverse29,
  H(state.a, state.g)[0],
  H(state.p, state.g)[0],
  H(state.b, state.K)[1],
  H(state.A, state.B)[1],
];
assert.deepEqual(openpgpKey, [23, 3, 24, 1, 18, 17, 27]);
const openpgpPlain = openpgpReceiver.values.map((value, index) =>
  mod29(value - openpgpKey[index])
);
assert.deepEqual(openpgpPlain, gp("OPENPGP"));
assert.equal(spell(openpgpPlain), "OPENPGP");
assert.deepEqual(
  openpgpPlain.map((value, index) => mod29(value + openpgpKey[index])),
  openpgpReceiver.values
);

// Charge the OPENPGP key grammar independently:
// - every permutation of [p,e,p^-1];
// - Alice/Bob private-role swap;
// - every H coordinate and operand order in each of four derived slots;
// - both additive signs;
// - every authenticated seven-rune target.
const sevenRuneTargets = new Map();
for (const row of message) {
  if (row.gp.length !== 7) continue;
  if (!sevenRuneTargets.has(row.gp.join(","))) {
    sevenRuneTargets.set(row.gp.join(","), []);
  }
  sevenRuneTargets.get(row.gp.join(",")).push(row.word);
}
assert.deepEqual(
  [...sevenRuneTargets.values()].map((names) => names[0]).sort(),
  ["DEVOTED", "NUMBERS", "OPENPGP"]
);

let openpgpFamilyConfigs = 0;
const openpgpFamilyHits = [];
for (const trio of permutations3([state.p, e, pInverse29])) {
  for (const role of [
    { name: "a/b", first: state.a, other: state.b },
    { name: "b/a", first: state.b, other: state.a },
  ]) {
    for (const firstG of hChoices(role.first, state.g)) {
      for (const pG of hChoices(state.p, state.g)) {
        for (const otherK of hChoices(role.other, state.K)) {
          for (const AB of hChoices(state.A, state.B)) {
            for (const sign of [-1, 1]) {
              openpgpFamilyConfigs += 1;
              const key = [
                ...trio,
                firstG.value,
                pG.value,
                otherK.value,
                AB.value,
              ];
              const plain = openpgpReceiver.values.map((value, index) =>
                mod29(value + (sign * key[index]))
              );
              const matches = sevenRuneTargets.get(plain.join(",")) || [];
              if (matches.length) {
                openpgpFamilyHits.push({
                  trio,
                  role: role.name,
                  firstG: firstG.name,
                  pG: pG.name,
                  otherK: otherK.name,
                  AB: AB.name,
                  sign: sign === -1 ? "subtract" : "add",
                  key,
                  plain,
                  matches,
                });
              }
            }
          }
        }
      }
    }
  }
}
assert.equal(openpgpFamilyConfigs, 6144);
assert.equal(openpgpFamilyHits.length, 4);
const distinctOpenpgpOps = new Map(
  openpgpFamilyHits.map((hit) => [
    [hit.key.join(","), hit.sign, hit.plain.join(",")].join("|"),
    hit,
  ])
);
assert.equal(distinctOpenpgpOps.size, 1);
const openpgpOp = [...distinctOpenpgpOps.values()][0];
assert.deepEqual(openpgpOp.key, openpgpKey);
assert.equal(openpgpOp.sign, "subtract");
assert.deepEqual(openpgpOp.matches, ["OPENPGP"]);

let sevenRuneWords = 0;
const openpgpManuscriptHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of parsePage(parts[page])) {
    if (word.length !== 7) continue;
    sevenRuneWords += 1;
    const plain = word.values.map((value, index) =>
      mod29(value - openpgpKey[index])
    );
    const matches = sevenRuneTargets.get(plain.join(",")) || [];
    if (matches.length) {
      openpgpManuscriptHits.push({
        page,
        word: word.index,
        start: word.start,
        end: word.end,
        cipher: word.values,
        plain,
        matches,
      });
    }
  }
}
assert.equal(sevenRuneWords, 214);
assert.deepEqual(openpgpManuscriptHits, [{
  page: 0,
  word: 37,
  start: 166,
  end: 172,
  cipher: [26, 16, 13, 10, 2, 23, 11],
  plain: gp("OPENPGP"),
  matches: ["OPENPGP"],
}]);

// Broader receiver baseline: every adjacent signed pair, both directions,
// both radices and both origins, requiring only a p0 word start whose printed
// length matches the addressed source target. This intentionally shows that
// boundary/length selection alone is not globally unique.
let adjacencyConfigs = 0;
const adjacencyHits = [];
for (let index = 0; index < message.length - 1; index += 1) {
  const pair = [message[index], message[index + 1]];
  for (const orientation of ["first-addresses-second", "second-addresses-first"]) {
    const addressRow = orientation === "first-addresses-second" ? pair[0] : pair[1];
    const targetRow = orientation === "first-addresses-second" ? pair[1] : pair[0];
    const address = gp0(addressRow.word);
    if (address < 0 || address >= table.length) continue;
    for (const [radix, alphabet] of [
      ["base60", alpha60],
      ["base59", alpha59],
    ]) {
      const raw = decodeToken(table[address], alphabet);
      if (raw === null) continue;
      for (const origin of ["zero", "one"]) {
        adjacencyConfigs += 1;
        const offset = origin === "zero" ? raw : raw - 1;
        const candidate = starts.get(offset);
        if (candidate && candidate.length === targetRow.gp.length) {
          adjacencyHits.push({
            index,
            sourcePair: pair.map((row) => row.word),
            orientation,
            addressWord: addressRow.word,
            targetWord: targetRow.word,
            address,
            token: table[address],
            radix,
            origin,
            offset,
            receiverLength: candidate.length,
          });
        }
      }
    }
  }
}
assert.equal(adjacencyConfigs, 336);
assert.equal(adjacencyHits.length, 18);
assert.ok(adjacencyHits.some((hit) =>
  hit.index === 41 &&
  hit.orientation === "second-addresses-first" &&
  hit.addressWord === "OPENPGP" &&
  hit.targetWord === "VERIFY" &&
  hit.radix === "base60" &&
  hit.origin === "zero" &&
  hit.offset === 177
));

// Independent existing VERIFY/base60 state check: VERIFY addresses literal
// B=19 at cell59; horizontal reflection to cell60 preserves B mod29 only
// under full base60.
assert.equal(gp0("VERIFY"), 59);
assert.equal(table[59], "19");
const reflectedVerifyAddress = (Math.floor(59 / 8) * 8) + (7 - (59 % 8));
assert.equal(reflectedVerifyAddress, 60);
assert.equal(table[60], "1k");
assert.equal(mod29(decodeToken(table[60], alpha60)), state.B);
assert.equal(mod29(decodeToken(table[60], alpha59)), 17);
assert.notEqual(mod29(decodeToken(table[60], alpha59)), state.B);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "strong source-constrained local OPENPGP/VERIFY plaintext-pair candidate: authenticated VERIFY OPENPGP selects source state75; base60/zero cell75=177 is both the center of the unique source-word-length-matched p=23 packet 166..188 and the start of a six-rune VERIFY receiver. The packet-start word decrypts to OPENPGP and the center word to canonical-GP UERIFY under compact p28 DH keys. Charged 6144/8192-case key families each collapse to one distinct authenticated-target operation; each fixed key has one manuscript-wide same-length target hit. Key assembly remains retrospective."
  state: { ...state, e },
  source: {
    phrase: message.slice(-2).map((row) => row.word),
    openpgpGp0: gp0("OPENPGP"),
    readoutGp0: gp0("READOUT"),
    token: table[75],
    modes,
    centeredPacket: {
      center: packetCenter,
      start: packetStart,
      end: packetEnd,
      centeredBase60Hits,
    },
  },
  receiver,
  openpgpReceiver,
  inverse: {
    key: verifyKey,
    plaintext: verifyPlain,
    text: spell(verifyPlain),
    familyConfigs,
    labeledFamilyHits: familyHits.length,
    distinctFamilyOps: distinctFamilyOps.size,
    sixRuneWords,
    manuscriptHits,
    openpgp: {
      key: openpgpKey,
      plaintext: openpgpPlain,
      text: spell(openpgpPlain),
      familyConfigs: openpgpFamilyConfigs,
      labeledFamilyHits: openpgpFamilyHits.length,
      distinctFamilyOps: distinctOpenpgpOps.size,
      sevenRuneWords,
      manuscriptHits: openpgpManuscriptHits,
    },
  },
  controls: {
    adjacencyConfigs,
    adjacencyHits: adjacencyHits.length,
    verifyReflection: {
      gp0: gp0("VERIFY"),
      sourceToken: table[59],
      reflectedAddress: reflectedVerifyAddress,
      reflectedToken: table[60],
      base60Mod29: mod29(decodeToken(table[60], alpha60)),
      base59Mod29: mod29(decodeToken(table[60], alpha59)),
    },
  },
}, null, 2));
