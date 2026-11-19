"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const MOD = 29;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    e >>= 1;
  }
  return result;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  assert.fail(`no inverse for ${value} mod ${modulus}`);
}

const dh = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2};
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);

const p0 = corpus.pages[0].indices;
const roadCipher = p0.slice(105, 109);
const roadPlain = [4, 3, 24, 23];
const roadKey = roadCipher.map((value, index) =>
  mod29(value - roadPlain[index]));
const ray = grid.bytes.slice(104, 108).map((value) => value % MOD);

assert.deepEqual(roadCipher, [16, 8, 25, 27]);
assert.deepEqual(roadPlain, [4, 3, 24, 23]);
assert.deepEqual(roadKey, [12, 5, 1, 4]);
assert.deepEqual(ray, [6, 5, 2, 15]);

/**
 * @typedef {{text:string,value:number,cost:number}} Expression
 */

/** @returns {Expression[]} */
function coreExpressions() {
  const fields = Object.keys(dh);
  /** @type {Expression[]} */
  const out = [];
  for (const name of fields) {
    out.push({text: name, value: mod29(dh[name]), cost: 1});
  }
  for (let i = 0; i < fields.length; i += 1) {
    for (let j = i + 1; j < fields.length; j += 1) {
      const left = fields[i];
      const right = fields[j];
      const a = dh[left];
      const b = dh[right];
      out.push(
        {text: `${left}+${right}`, value: mod29(a + b), cost: 2},
        {text: `${left}*${right}`, value: mod29(a * b), cost: 2},
        {text: `${left}-${right}`, value: mod29(a - b), cost: 2},
        {text: `${right}-${left}`, value: mod29(b - a), cost: 2},
      );
    }
  }
  return out;
}

/** @param {Expression[]} expressions */
function profile(expressions) {
  const byResidue = Array.from({length: MOD}, () => []);
  for (const expression of expressions) {
    byResidue[expression.value].push(expression);
  }
  const residues = byResidue.map((rows, value) => {
    assert.ok(rows.length > 0, `uncovered residue ${value}`);
    const minCost = Math.min(...rows.map((row) => row.cost));
    return {
      value,
      count: rows.length,
      minCost,
      minCount: rows.filter((row) => row.cost === minCost).length,
    };
  });
  return {byResidue, residues};
}

/**
 * @param {number[]} key
 * @param {{byResidue:Expression[][],residues:Array<{value:number,count:number,minCost:number,minCount:number}>}} prof
 */
function keyStats(key, prof) {
  let formulaCount = 1;
  let minFormulaCount = 1;
  let minCost = 0;
  for (const value of key) {
    const row = prof.residues[value];
    formulaCount *= row.count;
    minFormulaCount *= row.minCount;
    minCost += row.minCost;
  }
  return {formulaCount, minFormulaCount, minCost};
}

const core = coreExpressions();
const coreProfile = profile(core);
assert.equal(core.length, 91);
assert.equal(coreProfile.byResidue.filter((rows) => rows.length > 0).length, 29);

const roadCore = keyStats(roadKey, coreProfile);
assert.deepEqual(roadCore, {
  formulaCount: 72,
  minFormulaCount: 36,
  minCost: 7,
});

const roadResidues = roadKey.map((value) => ({
  value,
  expressions: coreProfile.byResidue[value].map((row) => row.text),
  minCost: coreProfile.residues[value].minCost,
  minCount: coreProfile.residues[value].minCount,
}));
assert.deepEqual(roadResidues, [
  {value: 12, expressions: ["a-p", "a*K", "K-B"], minCost: 2, minCount: 3},
  {value: 5, expressions: ["g", "b+B"], minCost: 1, minCount: 1},
  {value: 1, expressions: ["g*a", "a-g", "b*K"], minCost: 2, minCount: 3},
  {value: 4, expressions: ["p-B", "a-K", "b*A", "B-b"], minCost: 2, minCount: 4},
]);

const reportedFormula = ["a*K", "g", "b*K", "b*A"];
assert.ok(roadResidues.every((row, index) =>
  row.expressions.includes(reportedFormula[index])));

const uniformRayRules = [];
for (const [field, scalar] of Object.entries(dh)) {
  uniformRayRules.push(
    {rule: `x+${field}`, output: ray.map((x) => mod29(x + scalar))},
    {rule: `x-${field}`, output: ray.map((x) => mod29(x - scalar))},
    {rule: `${field}-x`, output: ray.map((x) => mod29(scalar - x))},
    {rule: `x*${field}`, output: ray.map((x) => mod29(x * scalar))},
  );
}
assert.equal(uniformRayRules.length, 28);
assert.equal(uniformRayRules.filter((row) =>
  row.output.every((value, index) => value === roadKey[index])).length, 0);

const tokenRows = corpus.translit
  .map((token, index) => [token, index])
  .sort((left, right) => right[0].length - left[0].length);

/** @param {string} original @returns {number[]} */
function encodeWord(original) {
  const normalized = original.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let position = 0; position < normalized.length;) {
    const row = tokenRows.find(([token]) =>
      normalized.startsWith(token, position));
    assert.ok(row, `unmapped GP spelling: ${original}`);
    out.push(row[1]);
    position += row[0].length;
  }
  return out;
}

const signedBody = signed2016
  .slice(signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || [])
  .map((word, index) => ({
    ordinal: index + 1,
    word: word.toUpperCase(),
    values: encodeWord(word),
  }));
assert.equal(signedWords.length, 43);

const signedFourOccurrences = signedWords.filter((row) =>
  row.values.length === 4);
assert.equal(signedFourOccurrences.length, 9);

const uniqueSignedFourMap = new Map();
for (const row of signedFourOccurrences) {
  if (!uniqueSignedFourMap.has(row.word)) {
    uniqueSignedFourMap.set(row.word, row);
  }
}
const signedFour = [...uniqueSignedFourMap.values()];
assert.deepEqual(signedFour.map((row) => row.word), [
  "LIES", "THEIR", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const stream = transcription.split("%").slice(0, 55).join("%");
const words = [];
let current = [];
let page = 0;
let startPage = 0;
let startOffset = 0;
let runeOffset = 0;

function finishWord() {
  if (!current.length) return;
  words.push({
    index: words.length,
    page: startPage,
    start: startOffset,
    values: current.slice(),
  });
  current = [];
}

for (const character of [...stream]) {
  if (runeSet.has(character)) {
    if (!current.length) {
      startPage = page;
      startOffset = runeOffset;
    }
    current.push(runeIndex.get(character));
    runeOffset += 1;
  } else if (character === "%") {
    page += 1;
  } else if (character === "/" || /\s/u.test(character)) {
    // Printed line and page wrapping does not terminate a word.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(words.length, 2896);
const cipherFour = words.filter((row) => row.values.length === 4);
assert.equal(cipherFour.length, 513);

/**
 * @param {{byResidue:Expression[][],residues:Array<{value:number,count:number,minCost:number,minCount:number}>}} prof
 */
function familyAudit(prof) {
  const rows = [];
  for (const cipher of cipherFour) {
    for (const plain of signedFour) {
      const key = cipher.values.map((value, index) =>
        mod29(value - plain.values[index]));
      rows.push({
        key,
        cipher,
        plain,
        ...keyStats(key, prof),
      });
    }
  }
  assert.equal(rows.length, 4104);
  const costHistogram = {};
  for (const row of rows) {
    costHistogram[row.minCost] = (costHistogram[row.minCost] || 0) + 1;
  }
  return {rows, costHistogram};
}

const coreFamily = familyAudit(coreProfile);
assert.deepEqual(coreFamily.costHistogram, {
  4: 7,
  5: 190,
  6: 807,
  7: 1739,
  8: 1361,
});
assert.equal(coreFamily.rows.filter((row) =>
  row.minCost < roadCore.minCost).length, 1004);
assert.equal(coreFamily.rows.filter((row) =>
  row.minCost <= roadCore.minCost).length, 2743);
assert.equal(coreFamily.rows.filter((row) =>
  row.minCost === roadCore.minCost &&
  row.minFormulaCount === roadCore.minFormulaCount &&
  row.formulaCount === roadCore.formulaCount).length, 86);

// Sensitivity check: generously admit the already-reported mod-23 inverse
// descriptions K^-1 and a^-1, plus the group identity 1. Standard DH
// exponentiation identities add only aliases of A, B, and K, already present.
const inverseSensitivity = core.slice();
for (const name of ["g", "a", "b", "A", "B", "K"]) {
  inverseSensitivity.push({
    text: `inv23(${name})`,
    value: inverseMod(dh[name], dh.p),
    cost: 2,
  });
}
inverseSensitivity.push({text: "1", value: 1, cost: 1});

const inverseProfile = profile(inverseSensitivity);
const roadInverse = keyStats(roadKey, inverseProfile);
assert.equal(inverseSensitivity.length, 98);
assert.deepEqual(roadInverse, {
  formulaCount: 160,
  minFormulaCount: 20,
  minCost: 6,
});

const inverseFamily = familyAudit(inverseProfile);
assert.deepEqual(inverseFamily.costHistogram, {
  4: 18,
  5: 273,
  6: 929,
  7: 1735,
  8: 1149,
});
assert.equal(inverseFamily.rows.filter((row) =>
  row.minCost < roadInverse.minCost).length, 291);
assert.equal(inverseFamily.rows.filter((row) =>
  row.minCost <= roadInverse.minCost).length, 1220);
assert.equal(inverseFamily.rows.filter((row) =>
  row.minCost === roadInverse.minCost &&
  row.minFormulaCount === roadInverse.minFormulaCount &&
  row.formulaCount === roadInverse.formulaCount).length, 9);

console.log(JSON.stringify({
  status: "PASS: ROAD DH expression grammar is nonselective",
  frozen: {
    dh,
    roadCipher,
    roadPlain,
    roadKey,
    roadRay: ray,
    reportedFormula,
  },
  uniformGate: {
    testedRules: uniformRayRules.length,
    exactHits: 0,
  },
  coreGrammar: {
    expressions: core.length,
    coveredResidues: coreProfile.byResidue.filter((rows) =>
      rows.length > 0).length,
    road: roadCore,
    roadResidues,
  },
  authenticatedFamily: {
    fourRuneCipherWords: cipherFour.length,
    signedFourRuneTargets: signedFour.map((row) => row.word),
    comparisons: coreFamily.rows.length,
    costHistogram: coreFamily.costHistogram,
    cheaperThanRoad: 1004,
    atMostRoadCost: 2743,
    exactRoadComplexityPeers: 86,
  },
  reportedInverseSensitivity: {
    expressions: inverseSensitivity.length,
    road: roadInverse,
    costHistogram: inverseFamily.costHistogram,
    cheaperThanRoad: 291,
    atMostRoadCost: 1220,
    exactRoadComplexityPeers: 9,
  },
  decision:
    "The reported [a*K,g,K*b,b*A] vector is one of many minimum-cost coordinate-specific descriptions. The core grammar covers every GP29 residue, no one-scalar uniform ray rule reaches ROAD, and ROAD is not exceptional against authenticated four-rune controls. Retire the DH-expression key as post-hoc unless a new source clue selects one exact update before target inspection.",
}, null, 2));
