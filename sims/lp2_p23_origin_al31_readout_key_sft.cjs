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
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p50Tokens = grid.pages.flatMap((page) => page.tokens);
const p50Bytes = grid.pages.flatMap((page) => page.bytes);

/** @param {number} value @param {number} modulus @returns {number} */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** @param {number} base @param {number} exponent @returns {number} */
function modPow29(base, exponent) {
  let result = 1;
  let factor = mod(base, 29);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % 29;
    factor = (factor * factor) % 29;
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

const primes = firstPrimes(100);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  assert.ok(cardinal >= 1 && cardinal <= primes.length);
  return mod(primes[cardinal - 1] - 1, 29);
}

/** @param {number[]} cardinals @returns {string} */
function spellCardinals(cardinals) {
  return cardinals.map((cardinal) => corpus.translit[T(cardinal)]).join("");
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{lens:number[],terminalGp0:number}[]} */
function pageLineRecords(page) {
  return physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line))
    .map((line) => {
      const words = line.match(/[\u16A0-\u16FF]+/gu) || [];
      const terminalRune = [...words.at(-1)].at(-1);
      const terminalGp0 = runeIndex.get(terminalRune);
      assert.notEqual(terminalGp0, undefined);
      return {
        lens: words.map((word) => [...word].length),
        terminalGp0,
      };
    });
}

/** @param {number} page @returns {{start:number,end:number,values:number[]}[]} */
function wordRows(page) {
  let offset = 0;
  const words = physicalPart(page)
    .replace(/\/\s*/gu, "")
    .match(/[\u16A0-\u16FF]+/gu) || [];
  return words.map((word) => {
    const values = [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    });
    const row = { start: offset, end: offset + values.length, values };
    offset = row.end;
    return row;
  });
}

/**
 * @param {number} page
 * @param {number} spanStart
 * @returns {number[][]}
 */
function bodyAfterRedSpan(page, spanStart) {
  const pageInk = ink.pages.find((row) => row.page === page);
  assert.ok(pageInk);
  const spans = [...(pageInk.red_spans || [])].sort((a, b) => a.start - b.start);
  const spanIndex = spans.findIndex((span) => span.start === spanStart);
  assert.ok(spanIndex >= 0);
  const span = spans[spanIndex];
  const rows = wordRows(page);
  const start = span.start + span.length;
  const end = spanIndex + 1 < spans.length
    ? spans[spanIndex + 1].start
    : rows.at(-1).end;
  return rows
    .filter((row) => row.start >= start && row.end <= end)
    .map((row) => row.values);
}

/** @param {[number,number]} pair @returns {[number,number]} */
function H(pair) {
  return [mod(pair[0] - pair[1], 29), mod(pair[0] + pair[1], 29)];
}

/** @param {number[]} word @returns {number[]} */
function hOuterWord(word) {
  if (word.length === 1) return [word[0]];
  return H([word[0], word.at(-1)]);
}

/** @param {number[][]} words @returns {number[]} */
function hOuter(words) {
  return words.flatMap(hOuterWord);
}

// Reconstruct the exact p23 hidden-layout packet and its independently derived
// p33 destination. The local packet ends at THE ORIGIN; page cardinals append AL.
const p23 = pageLineRecords(23)[0];
assert.deepEqual(p23.lens, [2, 6, 3, 5, 4]);
assert.equal(p23.terminalGp0, 25);
const state = { K:2, a:6, e:3, g:5, q:4, p:23, b:15, A:8, B:19 };
assert.deepEqual(p23.lens, [state.K, state.a, state.e, state.g, state.q]);
assert.equal(p50Tokens[state.B], "0X");
assert.equal(p50Bytes[state.B], 33);
const destination = p50Bytes[state.B];
const originPacket = [...p23.lens, 5, p23.terminalGp0];
assert.equal(spellCardinals(originPacket), "THEORIGIN");
assert.equal(spellCardinals([state.p, destination]), "AL");
assert.equal(spellCardinals([...originPacket, state.p, destination]), "THEORIGINAL");

// Historical premise from the pre-2014 Liber AL / Frater Achad tradition.
// Crowley's III:47 New Comment glosses "the Key of it all" as AL = 31.
// This SFT treats 31 as a fixed historical premise rather than discovering it.
const AL = 31;
const alExponentResidue = mod(AL, 28);
const alFieldResidue = mod(AL, 29);
const alNegativeFieldResidue = mod(-AL, 29);
assert.equal(alExponentResidue, state.e);
assert.equal(alFieldResidue, state.K);
assert.equal(alNegativeFieldResidue, mod(-state.K, 29));
assert.deepEqual(
  { AL, mod28: alExponentResidue, mod29: alFieldResidue, negMod29: alNegativeFieldResidue },
  { AL:31, mod28:3, mod29:2, negMod29:27 }
);
assert.equal(gcd(alExponentResidue, 28), 1);
assert.equal(gcd(alFieldResidue, 28), 2);
assert.equal(gcd(alNegativeFieldResidue, 28), 1);

// Reconstruct the independently selected p39 numeric selector [55,20].
const p39Body = bodyAfterRedSpan(39, 119);
assert.equal(p39Body.length, 28);
assert.equal(p39Body.flat().length, 118);
const p39Outer = hOuter(p39Body);
const p39Selector = [p39Outer.length, mod(gp0(p39Outer), 29)];
assert.deepEqual(p39Selector, [55, 20]);

// Reconstruct the p28 center + one-based word28 receiver.
const p28Rows = wordRows(28);
const p28Runes = p28Rows.flatMap((row) => row.values);
assert.equal(p28Runes.length, 269);
const centerOffset = 134;
const word28 = p28Rows[27];
assert.equal(word28.start, centerOffset + 1);
const p28Input = [p28Runes[centerOffset], ...word28.values];
assert.deepEqual(p28Input, [9, 28, 24, 10, 1, 20]);

// Charge the four direct signed AL-residue pairs, both orientations and all
// output cuts. This is the finite family available from +/-31 in the GP29
// value field and its 28-element exponent group.
const alPairs = [
  [mod(AL, 28), mod(AL, 29)],
  [mod(AL, 28), mod(-AL, 29)],
  [mod(-AL, 28), mod(AL, 29)],
  [mod(-AL, 28), mod(-AL, 29)],
];
assert.deepEqual(alPairs, [[3,2],[3,27],[25,2],[25,27]]);

const alFamilyHits = [];
for (const [centerExponent, wordExponent] of alPairs) {
  for (const orientation of ["forward", "reverse"]) {
    let output = [
      modPow29(p28Input[0], centerExponent),
      ...p28Input.slice(1).map((value) => modPow29(value, wordExponent)),
    ];
    if (orientation === "reverse") output = output.slice().reverse();
    for (let cut = 1; cut < output.length; cut += 1) {
      if (
        gp0(output.slice(0, cut)) === p39Selector[0] &&
        gp0(output.slice(cut)) === p39Selector[1]
      ) {
        alFamilyHits.push({
          centerExponent,
          wordExponent,
          orientation,
          cut,
          output,
        });
      }
    }
  }
}
assert.equal(alPairs.length * 2 * 5, 40);
assert.deepEqual(alFamilyHits, [{
  centerExponent:3,
  wordExponent:27,
  orientation:"forward",
  cut:3,
  output:[4,28,23,3,1,16],
}]);
assert.equal(spell(alFamilyHits[0].output), "READOUT");
assert.equal(spell(alFamilyHits[0].output.slice(0, 3)), "READ");
assert.equal(spell(alFamilyHits[0].output.slice(3)), "OUT");

// Compare against the complete reversible two-part power family. AL=31
// resolves the previous center-exponent alias without language scoring.
const reversibleExponents = Array.from({length:28}, (_, index) => index + 1)
  .filter((exponent) => gcd(exponent, 28) === 1);
const fullFamilyHits = [];
for (const centerExponent of reversibleExponents) {
  for (const wordExponent of reversibleExponents) {
    for (const orientation of ["forward", "reverse"]) {
      let output = [
        modPow29(p28Input[0], centerExponent),
        ...p28Input.slice(1).map((value) => modPow29(value, wordExponent)),
      ];
      if (orientation === "reverse") output = output.slice().reverse();
      for (let cut = 1; cut < output.length; cut += 1) {
        if (
          gp0(output.slice(0, cut)) === p39Selector[0] &&
          gp0(output.slice(cut)) === p39Selector[1]
        ) {
          fullFamilyHits.push({
            centerExponent,
            wordExponent,
            orientation,
            cut,
            output,
          });
        }
      }
    }
  }
}
assert.equal(reversibleExponents.length ** 2 * 2 * 5, 1440);
assert.deepEqual(fullFamilyHits, [
  { centerExponent:3, wordExponent:27, orientation:"forward", cut:3,
    output:[4,28,23,3,1,16] },
  { centerExponent:17, wordExponent:27, orientation:"forward", cut:3,
    output:[4,28,23,3,1,16] },
]);
assert.ok(alPairs.some(([left,right]) => left === 3 && right === 27));
assert.ok(!alPairs.some(([left,right]) => left === 17 && right === 27));

console.log(JSON.stringify({
  status:"PASS",
  classification:"source-constrained post-discovery key-provenance bridge",
  p23:{
    localPacket:originPacket,
    localText:spellCardinals(originPacket),
    suffixCardinals:[state.p,destination],
    suffixText:spellCardinals([state.p,destination]),
    combinedText:spellCardinals([...originPacket,state.p,destination]),
    structuralReading:"THE ORIGIN | AL",
    sourcePage:state.p,
    destinationPage:destination,
  },
  historicalAL:{
    premise:"Liber AL III:47 New Comment: AL = 31 is the Key",
    value:AL,
    exponentGroupResidue:alExponentResidue,
    fieldResidue:alFieldResidue,
    negativeFieldResidue:alNegativeFieldResidue,
    stateMatch:{e:state.e,K:state.K,negativeK:mod(-state.K,29)},
    reversibility:{
      exponentResidueGcd28:gcd(alExponentResidue,28),
      positiveFieldResidueGcd28:gcd(alFieldResidue,28),
      negativeFieldResidueGcd28:gcd(alNegativeFieldResidue,28),
    },
  },
  p39:{selector:p39Selector},
  p28:{
    input:p28Input,
    alResiduePairs:alPairs,
    alFamilyConfigurations:40,
    alFamilyHits,
    fullReversibleConfigurations:1440,
    fullReversibleHits:fullFamilyHits,
    selectedOutput:spell(alFamilyHits[0].output),
  },
  decision:"AL=31 independently compresses the established [3,27] READ OUT exponent pair: 31 mod28=e=3 and 31 mod29=K=2, whose additive inverse is -K=27. Within the four +/-31 residue pairs, both orientations and all cuts, only [3,27] forward/cut3 satisfies p39's numeric [55,20] selector and yields READ OUT. This strengthens intended-key provenance but remains post-discovery evidence rather than a blind plaintext recovery.",
}, null, 2));
