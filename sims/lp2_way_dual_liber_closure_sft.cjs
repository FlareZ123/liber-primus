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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const historicalHtml = read("resources/cicada2014-onion7-index.html");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
parts.splice(50, 0, "");
const M = 29;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number} base @param {number} exponent @returns {number} */
function modPow(base, exponent) {
  let out = 1;
  let value = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power & 1) out = out * value % M;
    value = value * value % M;
    power = Math.floor(power / 2);
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {number[]} */
function radialH4(values) {
  assert.equal(values.length, 4);
  const inner = H(values[0], values[1]);
  const outer = H(values[2], values[3]);
  return [outer[0], inner[0], inner[1], outer[1]];
}

/** @param {string} text @returns {number[]} */
function runes(text) {
  return [...text].flatMap((character) =>
    runeIndex.has(character) ? [runeIndex.get(character)] : []
  );
}

/** @param {number} page @returns {number[][]} */
function physicalLines(page) {
  return parts[page].split("/").map(runes).filter((line) => line.length > 0);
}

/** @param {number[]} values @param {number} x @param {number} order @returns {number} */
function derivativeValue(values, x, order) {
  let current = values.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current.slice(0, -1).map((value, index) =>
      mod29(value * (degree - index))
    );
  }
  let out = 0;
  for (const value of current) out = mod29(out * x + value);
  return out;
}

/** @param {number[]} values @returns {number} */
function primeSum(values) {
  return values.reduce((total, value) => total + corpus.prime[value], 0);
}

const state = {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4};

// Reconstruct WAY from the independently selected p9/p29 packet.
const p9Runes = corpus.pages.find((page) => page.page === 9).indices;
const p9Packet = p9Runes.slice(135, 141);
assert.deepEqual(p9Packet, [25,4,0,3,16,21]);
assert.equal(sum(p9Packet), 69);
assert.equal(sum(p9Packet.slice(0, state.K)), 29);
assert.equal(sum(p9Packet.slice(state.K)), 40);

const pathsHalf = p9Packet.slice(state.K);
const radial = radialH4(pathsHalf);
assert.deepEqual(radial, [24,26,3,8]);
assert.deepEqual(radial, [state.p + 1, M - state.e, state.e, state.A]);

const repeatedRoot = radial[0];
const derivativeOrder = radial[2];
const p29 = corpus.pages.find((page) => page.page === 29).indices;
assert.equal(derivativeValue(p29, repeatedRoot, 0), 0);
assert.equal(derivativeValue(p29, repeatedRoot, 1), 0);
const W = derivativeValue(p29, repeatedRoot, derivativeOrder);
assert.equal(W, 7);
const wayVector = [W, ...radial.slice(0, 2)];
assert.deepEqual(wayVector, [7,24,26]);
assert.equal(wayVector.map((value) => corpus.translit[value]).join(""), "WAY");

// Authenticated signed source word indices.
const bodyStart = signed2016.indexOf("Hello.");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && signatureStart > bodyStart);
const words = signed2016
  .slice(bodyStart, signatureStart)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const wayIndices = words.flatMap((word, index) => word === "WAY" ? [index] : []);
const liberIndices = words.flatMap((word, index) => word === "LIBER" ? [index] : []);
assert.deepEqual(wayIndices, [13]);
assert.deepEqual(liberIndices, [9]);
assert.deepEqual(words.slice(9, 14), ["LIBER","PRIMUS","IS","THE","WAY"]);

const wayIndex = wayIndices[0];
const liberIndex = liberIndices[0];

// Consumer A: authenticated cube composed e times returns WAY to LIBER9.
let cubeState = wayIndex;
const cubePath = [cubeState];
for (let step = 0; step < state.e; step += 1) {
  cubeState = modPow(cubeState, state.e);
  cubePath.push(cubeState);
}
assert.deepEqual(cubePath, [13,22,5,9]);
assert.deepEqual(cubePath.map((index) => words[index]),
  ["WAY","THE","EPIPHANY","LIBER"]);
assert.equal(cubeState, liberIndex);

// Consumer B: same WAY index selects p13 and e selects line3.
const selectedPage = wayIndex;
const selectedLine = state.e;
assert.equal(String(selectedPage) + String(selectedLine), "133");
const p13Line3 = physicalLines(selectedPage)[selectedLine - 1];
assert.equal(p13Line3.length, 23);
const p13PrimeSum = primeSum(p13Line3);
assert.equal(p13PrimeSum, 1229);

const p57Sentences = parts[57].split(".");
const parableHeading = runes(p57Sentences[0]);
const parableModulus = primeSum(parableHeading);
assert.equal(parableModulus, 449);
const historicalResidue = p13PrimeSum % parableModulus;
assert.equal(historicalResidue, 331);

assert.match(historicalHtml, /<title>133<\/title>/);
assert.match(historicalHtml, /<div id="331">/);
const images = [...historicalHtml.matchAll(/<img src="(\d+\.jpg)"/g)]
  .map((match) => match[1]);
assert.equal(images.length, 58);
assert.equal(images[0], "0.jpg");
assert.equal(images.at(-1), "57.jpg");

// Full signed THE-follower control for the historical consumer.
const theIndices = words.flatMap((word, index) => word === "THE" ? [index] : []);
assert.deepEqual(theIndices, [1,7,12,17,22,28]);
const followerFamily = theIndices.map((theIndex) => {
  const page = theIndex + 1;
  const line = physicalLines(page)[state.e - 1];
  const residue = primeSum(line) % parableModulus;
  return {word:words[page], page, residue};
});
assert.deepEqual(followerFamily, [
  {word:"PATH",page:2,residue:328},
  {word:"DEVOTED",page:8,residue:353},
  {word:"WAY",page:13,residue:331},
  {word:"MAP",page:18,residue:187},
  {word:"ROAD",page:23,residue:385},
  {word:"DIRECTION",page:29,residue:234},
]);
assert.deepEqual(
  followerFamily.filter((row) => row.residue === 331),
  [{word:"WAY",page:13,residue:331}]
);

console.log(JSON.stringify({
  status:"PASS",
  reconstructedWay:{
    p9Packet,
    radial,
    repeatedRoot,
    derivativeOrder,
    W,
    vector:wayVector,
    text:"WAY",
    signedIndex:wayIndex,
  },
  cubeConsumer:{
    path:cubePath,
    words:cubePath.map((index) => words[index]),
    endpoint:{index:liberIndex,word:"LIBER",page:liberIndex},
  },
  historicalConsumer:{
    page:selectedPage,
    line:selectedLine,
    titleCode:"133",
    runeCount:p13Line3.length,
    primeSum:p13PrimeSum,
    parableModulus,
    residue:historicalResidue,
    htmlTitle133:true,
    div331:true,
    archiveImages:{count:images.length,first:images[0],last:images.at(-1)},
    followerFamily,
  },
  dualClosure:[
    "WAY13 -> C^e -> LIBER9 -> p9",
    "WAY13 -> p13:e=3 -> 133 -> residue331 -> complete Liber Primus image archive",
  ],
  classification:
    "Two independently established consumers of the reconstructed WAY13 state both return to Liber Primus: the authenticated cube returns to LIBER9/p9, while direct signed-index plus e selects p13:3 whose source-fixed residue331 identifies the historical complete LP archive.",
}, null, 2));
