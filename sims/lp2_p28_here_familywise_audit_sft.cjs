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
const parts = read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} a @param {number} b @returns {number[]} */
function H(a, b) {
  return [mod29(a - b), mod29(a + b)];
}

/** @param {number} a @param {number} b @returns {number[]} */
function Hinv(a, b) {
  const inv2 = 15;
  return [mod29(inv2 * (a + b)), mod29(inv2 * (b - a))];
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {string[]} */
function physicalLines(page) {
  return physicalPart(page)
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || [])
    .map((text) => [...text].map((rune) => runeIndex.get(rune)));
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number[]} fragment @param {"source"|"reverse"} endpointOrder @returns {number[]} */
function endpoints(fragment, endpointOrder) {
  assert.ok(fragment.length >= 2);
  const pair = [fragment[0], fragment[fragment.length - 1]];
  return endpointOrder === "source" ? pair : [pair[1], pair[0]];
}

/**
 * @param {number[]} fragment
 * @param {"H"|"Hinv"} mapName
 * @param {"source"|"reverse"} endpointOrder
 * @param {"as-is"|"swap"} componentOrder
 * @returns {number[]}
 */
function transformFragment(fragment, mapName, endpointOrder, componentOrder) {
  const pair = endpoints(fragment, endpointOrder);
  const mapped = mapName === "H" ? H(pair[0], pair[1]) : Hinv(pair[0], pair[1]);
  return componentOrder === "as-is" ? mapped : [mapped[1], mapped[0]];
}

/**
 * @param {{left:number[],right:number[]}} object
 * @param {{mapName:"H"|"Hinv",endpointOrder:"source"|"reverse",fragmentDirection:"forward"|"reverse",componentOrder:"as-is"|"swap"}} variant
 * @returns {{values:number[],text:string}}
 */
function decodeObject(object, variant) {
  const first = transformFragment(object.left, variant.mapName, variant.endpointOrder, variant.componentOrder);
  const second = transformFragment(object.right, variant.mapName, variant.endpointOrder, variant.componentOrder);
  const values = variant.fragmentDirection === "forward"
    ? [...first, ...second]
    : [...second, ...first];
  return { values, text: spell(values) };
}

const state = { p:23, g:5, a:6, b:15, A:8, B:19, K:2 };
const stateEntries = Object.entries(state);
const stateValueSet = new Set(Object.values(state));

const distinctStatePairs = [];
for (const [leftLabel, leftValue] of stateEntries) {
  for (const [rightLabel, rightValue] of stateEntries) {
    if (leftLabel === rightLabel) continue;
    distinctStatePairs.push({
      labels:[leftLabel, rightLabel],
      values:[leftValue, rightValue],
    });
  }
}
assert.equal(distinctStatePairs.length, 42);

/** @param {number[]} lengths @returns {string[][]} */
function matchingStatePairs(lengths) {
  return distinctStatePairs
    .filter((pair) => pair.values[0] === lengths[0] && pair.values[1] === lengths[1])
    .map((pair) => pair.labels);
}

let dictionary = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const source of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionary.push(...(read(source).toLowerCase().match(/[a-z]+/gu) || []));
}
const priorLex = new Set(
  dictionary.filter((word) => /^[a-z]+$/u.test(word) && word.length >= 3)
);
const authenticatedLex = new Set(
  (read("resources/liber-primus/lp1-plaintext-reference.txt").toLowerCase().match(/[a-z]+/gu) || [])
    .filter((word) => word.length >= 3)
);

const p28 = physicalLines(28);
assert.equal(p28.length, 12);
const p28Line1 = fragments(p28[0]);
assert.deepEqual(p28Line1.slice(0,2).map(spell), ["PC","JTHBIW"]);
assert.deepEqual(
  [p28Line1.flat().length, p28Line1.length, p28Line1[0].length, p28Line1[1].length],
  [state.p, state.g, state.K, state.g]
);

/** @typedef {{
 * page:number,
 * line:number,
 * fragments:number[],
 * lengths:number[],
 * left:number[],
 * right:number[],
 * source:string[],
 * statePairs:string[][],
 * dhTypedLine:boolean,
 * pageStart:boolean
 * }} ObjectRow */

/** @type {ObjectRow[]} */
const allStatePairObjects = [];
/** @type {ObjectRow[]} */
const dhTypedStatePairObjects = [];
/** @type {ObjectRow[]} */
const p28StatePairObjects = [];
/** @type {ObjectRow[]} */
const pageStartStatePairObjects = [];
const dhTypedLines = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const lines = physicalLines(page);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const frags = fragments(lines[lineIndex]);
    if (frags.length < 2) continue;
    const geometry = [frags.flat().length, frags.length, frags[0].length, frags[1].length];
    const dhTypedLine = geometry.every((value) => stateValueSet.has(value));
    if (dhTypedLine) {
      dhTypedLines.push({
        page,
        line:lineIndex + 1,
        geometry,
        source:frags.map(spell),
      });
    }

    for (let fragmentIndex = 0; fragmentIndex + 1 < frags.length; fragmentIndex += 1) {
      const left = frags[fragmentIndex];
      const right = frags[fragmentIndex + 1];
      if (left.length < 2 || right.length < 2) continue;
      const lengths = [left.length, right.length];
      const statePairs = matchingStatePairs(lengths);
      if (statePairs.length === 0) continue;

      const row = {
        page,
        line:lineIndex + 1,
        fragments:[fragmentIndex + 1, fragmentIndex + 2],
        lengths,
        left,
        right,
        source:[spell(left), spell(right)],
        statePairs,
        dhTypedLine,
        pageStart:lineIndex === 0 && fragmentIndex === 0,
      };
      allStatePairObjects.push(row);
      if (dhTypedLine) dhTypedStatePairObjects.push(row);
      if (page === 28) p28StatePairObjects.push(row);
      if (row.pageStart) pageStartStatePairObjects.push(row);
    }
  }
}

assert.equal(dhTypedLines.length, 22);
assert.equal(p28StatePairObjects.length, 4);
assert.equal(pageStartStatePairObjects.length, 8);

function objectKey(row) {
  return [row.page,row.line,row.fragments[0],row.fragments[1]].join(":");
}

const issueMap = new Map();
for (const row of [...dhTypedStatePairObjects, ...p28StatePairObjects]) {
  issueMap.set(objectKey(row), row);
}
const issueFamilyObjects = [...issueMap.values()].sort((a,b) =>
  a.page - b.page ||
  a.line - b.line ||
  a.fragments[0] - b.fragments[0]
);

const coreVariants = [];
const conservativeVariants = [];
for (const mapName of ["H","Hinv"]) {
  for (const endpointOrder of ["source","reverse"]) {
    for (const fragmentDirection of ["forward","reverse"]) {
      coreVariants.push({
        mapName,
        endpointOrder,
        fragmentDirection,
        componentOrder:"as-is",
      });
      for (const componentOrder of ["as-is","swap"]) {
        conservativeVariants.push({
          mapName,
          endpointOrder,
          fragmentDirection,
          componentOrder,
        });
      }
    }
  }
}
assert.equal(coreVariants.length, 8);
assert.equal(conservativeVariants.length, 16);

function variantKey(variant) {
  return [
    variant.mapName,
    variant.endpointOrder,
    variant.fragmentDirection,
    variant.componentOrder,
  ].join("/");
}

/**
 * @param {ObjectRow[]} objects
 * @param {typeof conservativeVariants} variants
 * @returns {{total:number,lexical:Array<object>,authenticated:Array<object>,exactHere:Array<object>}}
 */
function audit(objects, variants) {
  const lexical = [];
  const authenticated = [];
  const exactHere = [];
  for (const object of objects) {
    for (const variant of variants) {
      const decoded = decodeObject(object, variant);
      const row = {
        page:object.page,
        line:object.line,
        fragments:object.fragments,
        lengths:object.lengths,
        source:object.source,
        statePairs:object.statePairs,
        dhTypedLine:object.dhTypedLine,
        variant:variantKey(variant),
        values:decoded.values,
        text:decoded.text,
      };
      if (priorLex.has(decoded.text.toLowerCase())) lexical.push(row);
      if (authenticatedLex.has(decoded.text.toLowerCase())) authenticated.push(row);
      if (decoded.text === "HERE") exactHere.push(row);
    }
  }
  return {
    total:objects.length * variants.length,
    lexical,
    authenticated,
    exactHere,
  };
}

const issueCore = audit(issueFamilyObjects, coreVariants);
const issueConservative = audit(issueFamilyObjects, conservativeVariants);
const broadCore = audit(allStatePairObjects, coreVariants);
const broadConservative = audit(allStatePairObjects, conservativeVariants);

const selectedObject = issueFamilyObjects.find((row) =>
  row.page === 28 && row.line === 1 && row.fragments[0] === 1 && row.fragments[1] === 2
);
assert.ok(selectedObject);
const fixedVariant = {
  mapName:"H",
  endpointOrder:"source",
  fragmentDirection:"forward",
  componentOrder:"as-is",
};
const selectedDecode = decodeObject(selectedObject, fixedVariant);
assert.equal(selectedDecode.text, "HERE");

const line1Multi = p28Line1.filter((fragment) => fragment.length >= 2);
const p28Line2 = fragments(p28[1]);
const line2Multi = p28Line2.filter((fragment) => fragment.length >= 2);
assert.ok(line1Multi.length > 0);
assert.ok(line2Multi.length > 0);
const holdoutObject = {
  left:line1Multi[line1Multi.length - 1],
  right:line2Multi[0],
};
const holdout = decodeObject(holdoutObject, fixedVariant);
const holdoutResult = {
  source:[spell(holdoutObject.left),spell(holdoutObject.right)],
  lengths:[holdoutObject.left.length,holdoutObject.right.length],
  values:holdout.values,
  text:holdout.text,
  inPriorLex:priorLex.has(holdout.text.toLowerCase()),
  inAuthenticatedLex:authenticatedLex.has(holdout.text.toLowerCase()),
};

console.log(JSON.stringify({
  status:"PASS",
  scope:{
    dhTypedLines:dhTypedLines.length,
    allStatePairObjects:allStatePairObjects.length,
    dhTypedStatePairObjects:dhTypedStatePairObjects.length,
    p28StatePairObjects:p28StatePairObjects.length,
    issueFamilyObjects:issueFamilyObjects.length,
    pageStartStatePairObjects:pageStartStatePairObjects.length,
    coreVariants:coreVariants.length,
    conservativeVariants:conservativeVariants.length,
    priorLexSize:priorLex.size,
    authenticatedLexSize:authenticatedLex.size,
  },
  selected:{
    object:{
      page:selectedObject.page,
      line:selectedObject.line,
      fragments:selectedObject.fragments,
      source:selectedObject.source,
      lengths:selectedObject.lengths,
      geometry:[p28Line1.flat().length,p28Line1.length,p28Line1[0].length,p28Line1[1].length],
    },
    variant:variantKey(fixedVariant),
    output:selectedDecode,
  },
  familywise:{
    issueCore:{
      total:issueCore.total,
      lexicalCount:issueCore.lexical.length,
      lexical:issueCore.lexical,
      authenticatedCount:issueCore.authenticated.length,
      authenticated:issueCore.authenticated,
      exactHereCount:issueCore.exactHere.length,
      exactHere:issueCore.exactHere,
    },
    issueConservative:{
      total:issueConservative.total,
      lexicalCount:issueConservative.lexical.length,
      lexical:issueConservative.lexical,
      authenticatedCount:issueConservative.authenticated.length,
      authenticated:issueConservative.authenticated,
      exactHereCount:issueConservative.exactHere.length,
      exactHere:issueConservative.exactHere,
    },
    broadCore:{
      total:broadCore.total,
      lexicalCount:broadCore.lexical.length,
      lexical:broadCore.lexical,
      authenticatedCount:broadCore.authenticated.length,
      authenticated:broadCore.authenticated,
      exactHereCount:broadCore.exactHere.length,
      exactHere:broadCore.exactHere,
    },
    broadConservative:{
      total:broadConservative.total,
      lexicalCount:broadConservative.lexical.length,
      lexical:broadConservative.lexical,
      authenticatedCount:broadConservative.authenticated.length,
      authenticated:broadConservative.authenticated,
      exactHereCount:broadConservative.exactHere.length,
      exactHere:broadConservative.exactHere,
    },
  },
  frozenHoldout:holdoutResult,
}, null, 2));


console.log("FAMILYWISE_SUMMARY " + JSON.stringify({
  scope:{
    issueFamilyObjects:issueFamilyObjects.length,
    allStatePairObjects:allStatePairObjects.length,
    coreVariants:coreVariants.length,
    conservativeVariants:conservativeVariants.length,
  },
  issueCore:{
    total:issueCore.total,
    lexicalCount:issueCore.lexical.length,
    lexicalTexts:[...new Set(issueCore.lexical.map((row)=>row.text))].sort(),
    authenticatedCount:issueCore.authenticated.length,
    authenticatedTexts:[...new Set(issueCore.authenticated.map((row)=>row.text))].sort(),
    exactHereCount:issueCore.exactHere.length,
  },
  issueConservative:{
    total:issueConservative.total,
    lexicalCount:issueConservative.lexical.length,
    lexicalTexts:[...new Set(issueConservative.lexical.map((row)=>row.text))].sort(),
    authenticatedCount:issueConservative.authenticated.length,
    authenticatedTexts:[...new Set(issueConservative.authenticated.map((row)=>row.text))].sort(),
    exactHereCount:issueConservative.exactHere.length,
  },
  broadCore:{
    total:broadCore.total,
    lexicalCount:broadCore.lexical.length,
    lexicalTexts:[...new Set(broadCore.lexical.map((row)=>row.text))].sort(),
    authenticatedCount:broadCore.authenticated.length,
    authenticatedTexts:[...new Set(broadCore.authenticated.map((row)=>row.text))].sort(),
    exactHereCount:broadCore.exactHere.length,
  },
  broadConservative:{
    total:broadConservative.total,
    lexicalCount:broadConservative.lexical.length,
    lexicalTexts:[...new Set(broadConservative.lexical.map((row)=>row.text))].sort(),
    authenticatedCount:broadConservative.authenticated.length,
    authenticatedTexts:[...new Set(broadConservative.authenticated.map((row)=>row.text))].sort(),
    exactHereCount:broadConservative.exactHere.length,
  },
  holdout:holdoutResult,
}));
