"use strict";

/**
 * P28 DH23 -> p50 -> p27 DIVINITY -> frozen onion-rank factor selector.
 *
 * This SFT assumes only the already-frozen red-only combinadic rank R, whose
 * source derivation is independently reproduced by
 * sims/lp2_primeecho_red13_onion_candidate_sft.cjs. It tests the later
 * p28/p27 route against R without searching factor combinations or bit sizes.
 *
 * Run from repository root:
 *   node sims/lp2_p28_dh23_onion_factor_selector_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

function parseWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function lineRunes(line) {
  return [...line]
    .map((rune) => runeIndex.get(rune))
    .filter((value) => value !== undefined);
}

function powMod(base, exponent, modulus) {
  let out = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) out = (out * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return out;
}

function bitLength(value) {
  return value.toString(2).length;
}

function torV2Base32(value) {
  assert.ok(value >= 0n && value < (1n << 80n));
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let out = "";
  for (let shift = 75n; shift >= 0n; shift -= 5n) {
    out += alphabet[Number((value >> shift) & 31n)];
  }
  return out;
}

function decodeBase29(encoded) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  let value = 0;
  for (const ch of encoded) {
    const digit = alphabet.indexOf(ch);
    assert.ok(digit >= 0);
    value = value * 29 + digit;
  }
  return value;
}

// Frozen p28 object selected upstream by FIND -> 28.
const p28Words = parseWords(physicalPart(28));
const selected = p28Words[27];
assert.deepEqual(selected, [28, 24, 10, 1, 20]);
assert.equal(gp0(selected), 83);
const shedInterior = selected.slice(1, -1);
assert.equal(gp0(shedInterior), 35);
const center = selected[2];
assert.equal(corpus.translit[center], "I");
assert.equal(corpus.prime[center], 31);

const p28Lines = physicalPart(28).trim().split("/").filter(Boolean);
assert.equal(p28Lines.length, 12);
const lineNumber = 6;
const line6 = lineRunes(p28Lines[lineNumber - 1]);
assert.equal(line6.length, 23);
const firstFragment = p28Lines[lineNumber - 1].match(/[\u16A0-\u16FF]+/u)[0];
assert.equal(translit([...firstFragment].map((rune) => runeIndex.get(rune))), "DH");

// The selected word occupies line positions 19..23 and supplies the DH23 state.
let beforeLine6 = 0;
for (let i = 0; i < lineNumber - 1; i++) beforeLine6 += lineRunes(p28Lines[i]).length;
let beforeWord28 = 0;
for (let i = 0; i < 27; i++) beforeWord28 += p28Words[i].length;
const localStart = beforeWord28 - beforeLine6 + 1;
assert.equal(localStart, 19);
const p = line6.length;
const g = selected.length;
const a = lineNumber;
const B = localStart;
const A = powMod(g, a, p);
const K = powMod(B, a, p);
assert.deepEqual({p, g, a, B, A, K}, {p: 23, g: 5, a: 6, B: 19, A: 8, K: 2});

// Shedding both literal word circumferences leaves I=31; paired with a=6 and
// the source table width A=8, this selects p50 cell254 and token 39.
const centerCoordinate = corpus.prime[center] * A + a;
assert.equal(centerCoordinate, 254);
assert.equal(tokens[centerCoordinate], "39");
const start = decode(tokens[centerCoordinate], alphabet59);
const endpoint = decode(tokens[centerCoordinate], alphabet60);
assert.equal(start, p * A + K); // 186 = (23,2)
assert.equal(endpoint, p * A + g); // 189 = (23,5)

// FIND's independent GP-prime measure selects the other and only other 39.
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const findWord = parseWords(p57.source_text).find((word) => translit(word) === "FIND");
assert.ok(findWord);
const findPrime = gpPrime(findWord);
assert.equal(findPrime, 151);
assert.equal(tokens[findPrime], "39");
const token39Copies = tokens.map((token, index) => token === "39" ? index : null)
  .filter((index) => index !== null);
assert.deepEqual(token39Copies, [151, 254]);
const duplicateGap = centerCoordinate - findPrime;
assert.equal(duplicateGap, 103);

// The same gap is the GP0 sum of the already selected p27 DIVINITY interior.
const p27Words = parseWords(physicalPart(27));
let offset = 0;
let carrier = null;
for (const word of p27Words) {
  if (translit(word) === "EORNSOOCAEYEE") carrier = {word, start: offset};
  offset += word.length;
}
assert.ok(carrier);
assert.equal(carrier.start, 79);
const divinityInterior = carrier.word.slice(2, -2);
assert.equal(translit(divinityInterior), "NSOOCAEY");
assert.equal(gp0(divinityInterior), duplicateGap);
assert.equal(tokens[duplicateGap], "3Q");

// The p28 server exponent selects the sixth rune; signed BASE29 turns it into
// O, so the source-selected interior serializes exactly to 3QO = 3301.
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPPQRS";
assert.equal(divinityInterior[a - 1], 24);
assert.equal(base29Alphabet[divinityInterior[a - 1]], "O");
const serialized = tokens[duplicateGap] + base29Alphabet[divinityInterior[a - 1]];
assert.equal(serialized, "3QO");
assert.equal(decodeBase29(serialized), 3301);

// The p28 tuple also predicts the table traversal: cell186 returns B=19,
// and exactly A=8 base59 pointer steps reach endpoint189. Base60 does not.
assert.equal(tokens[start], "0J");
assert.equal(decode(tokens[start], alphabet59), B);
assert.equal(decode(tokens[start], alphabet60), B);
function firstArrival(alphabet, source, target, limit = 32) {
  let value = source;
  const seen = new Set([value]);
  for (let hop = 1; hop <= limit; hop++) {
    value = decode(tokens[value], alphabet);
    if (value === target) return hop;
    if (value < 0 || value >= tokens.length || seen.has(value)) return null;
    seen.add(value);
  }
  return null;
}
assert.equal(firstArrival(alphabet59, start, endpoint), A);
assert.notEqual(firstArrival(alphabet60, start, endpoint), A);
assert.equal(decode(tokens[endpoint], alphabet59), endpoint);

// Frozen combinadic rank from the independent source-exact onion SFT.
const rank = 816613232064430740393939040116034006349n;
const small35 = 25795396177n;
const large79 = 521821166063052627702311n;
assert.equal(rank, 19n * 31n * 103n * small35 * large79);

// The route independently labels every factor role: B=19, center-I prime31,
// duplicate-gap/DIVINITY GP0=103, shed-interior GP0=35 bits, and selected
// DIVINITY-carrier start79 bits.
assert.equal(B, 19);
assert.equal(corpus.prime[center], 31);
assert.equal(duplicateGap, 103);
assert.equal(bitLength(small35), gp0(shedInterior));
assert.equal(bitLength(large79), carrier.start);
assert.equal(torV2Base32(large79), "nz77w2upkfkyj4rh");

// This modular echo is recorded only as a control. Under p=3301, B=19 is not
// a power of g=5, so 19^6 mod3301=29 is not a full mutual-DH shared secret.
assert.equal(powMod(B, a, 3301), 29);
let hasLog = false;
let value = 1;
for (let exponent = 0; exponent < 3300; exponent++) {
  if (value === B) hasLog = true;
  value = value * g % 3301;
}
assert.equal(hasLog, false);

console.log(JSON.stringify({
  p28: {p, g, a, B, A, K, centerPrime: corpus.prime[center], shedInteriorGp0: gp0(shedInterior)},
  p50: {centerCoordinate, token: tokens[centerCoordinate], findPrime, token39Copies, duplicateGap, start, endpoint},
  p27: {carrierStart: carrier.start, divinityInterior: translit(divinityInterior), divinityGp0: gp0(divinityInterior), serialized, modulus: 3301},
  rankFactors: {small: [19,31,103], residualBits: [bitLength(small35),bitLength(large79)], onionFactor: large79.toString()},
  candidate: torV2Base32(large79) + ".onion",
  status: "structural factor selector; combinadic-rank and Tor-v2 interpretation remain candidate-level"
}, null, 2));
