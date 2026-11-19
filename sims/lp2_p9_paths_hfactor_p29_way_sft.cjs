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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2013 = read("resources/external/2013-tcp-server-signed-source.md");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const M = 29;

const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const sourceWords = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());

const state = {
  p:23,
  g:5,
  a:6,
  b:15,
  A:8,
  B:19,
  K:2,
  e:3,
  q:4,
};

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % M) + M) % M;
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/**
 * Shell-preserving H serialization for four outward runes:
 * transform the inner pair and outer pair independently, then place the
 * outer H coordinates outside the inner H coordinates.
 * @param {number[]} values
 * @returns {number[]}
 */
function radialH4(values) {
  assert.equal(values.length, 4);
  const inner = H(values[0], values[1]);
  const outer = H(values[2], values[3]);
  return [outer[0], inner[0], inner[1], outer[1]];
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1] || "";
}

/** @param {string} text @returns {{words:Array<{start:number,end:number,values:number[]}>,runes:number[]}} */
function parsePhysical(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;
  function flush() {
    if (!current.length) return;
    words.push({start, end:start + current.length - 1, values:current.slice()});
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (
      character === "-" ||
      character === "." ||
      character === "&" ||
      character === "$"
    ) {
      flush();
    }
  }
  flush();
  return {words, runes};
}

/*
 * Reconstruct the independently selected p9 packet.
 */
const p9 = parsePhysical(physicalPart(9));
const midpoint = (p9.runes.length - 1) / 2;
const rightWord = p9.words.find((word) => word.start > midpoint);
assert.ok(rightWord);
assert.equal(rightWord.start, 135);
assert.equal(rightWord.values.length, state.g);
assert.deepEqual(rightWord.values, [25,4,0,3,16]);
const successor = p9.runes[rightWord.end + 1];
assert.equal(successor, state.B + state.K);
const packet = [...rightWord.values, successor];
assert.deepEqual(packet, [25,4,0,3,16,21]);

const directionBlock = packet.slice(0, state.K);
const pathsBlock = packet.slice(state.K);
assert.deepEqual(directionBlock, [25,4]);
assert.deepEqual(pathsBlock, [0,3,16,21]);
assert.equal(directionBlock.reduce((sum, value) => sum + value, 0), 29);
assert.equal(pathsBlock.reduce((sum, value) => sum + value, 0), 40);
assert.equal(sourceWords[29], "DIRECTION");
assert.equal(sourceWords[40], "PATHS");

/*
 * The PATHS half contains the authenticated 2013 H polynomial plus A.
 */
const p9Radial = radialH4(pathsBlock);
assert.deepEqual(p9Radial, [24,26,3,8]);
assert.deepEqual(p9Radial, [
  state.p + 1,
  M - state.e,
  state.e,
  state.A,
]);

const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
assert.match(signed2013, /BASE29 3301[^\n]*3QO/);
const rawDigits = [..."3QO"].map((digit) => base29Alphabet.indexOf(digit));
assert.deepEqual(rawDigits, [3,26,24]);
const hPolynomial = rawDigits.slice().reverse();
assert.deepEqual(hPolynomial, [24,26,3]);
assert.deepEqual(p9Radial.slice(0,3), hPolynomial);
assert.equal(p9Radial[3], state.A);

/*
 * The same packet now supplies p29's root, derivative order and AY tail.
 */
function derivativeValue(coefficients, x, order) {
  let current = coefficients.slice();
  for (let step = 0; step < order; step += 1) {
    const degree = current.length - 1;
    current = current.slice(0,-1).map((coefficient, index) =>
      mod29(coefficient * (degree - index))
    );
  }
  let value = 0;
  for (const coefficient of current) value = mod29(value * x + coefficient);
  return value;
}

const root24 = p9Radial[0];
const derivativeOrder = p9Radial[2];
assert.equal(root24, 24);
assert.equal(derivativeOrder, state.e);

const p29 = corpus.pages.find((page) => page.page === 29).indices;
const table = grid.bytes.map((value) => value % M);
assert.equal(derivativeValue(p29, root24, 0), 0);
assert.equal(derivativeValue(p29, root24, 1), 0);
assert.equal(derivativeValue(table, root24, 0), 0);
assert.equal(derivativeValue(table, root24, 1), 0);

const W = derivativeValue(p29, root24, derivativeOrder);
assert.equal(W, 7);
assert.equal(derivativeValue(table, root24, derivativeOrder), W);

const ay = p9Radial.slice(0,2);
assert.deepEqual(ay, [24,26]);
const packetOrderCandidate = [W, ...ay];
assert.deepEqual(packetOrderCandidate, [7,24,26]);
assert.equal(
  packetOrderCandidate.map((value) => corpus.translit[value]).join(""),
  "WAY"
);

// Charge the six compact insertion/direction choices for W relative to fixed AY.
const assemblyFamily = [];
for (let slot = 0; slot < 3; slot += 1) {
  const vector = ay.slice();
  vector.splice(slot, 0, W);
  assemblyFamily.push({slot, direction:"forward", vector});
  assemblyFamily.push({slot, direction:"reverse", vector:[...vector].reverse()});
}
const sourceThreeRuneWords = new Set(
  sourceWords.filter((word) => {
    const upper = word.toUpperCase();
    const values = [];
    for (let offset = 0; offset < upper.length;) {
      let matched = false;
      const symbols = corpus.translit
        .map((symbol, value) => ({symbol:symbol.toUpperCase(), value}))
        .sort((left, right) => right.symbol.length - left.symbol.length);
      if (upper.startsWith("ING", offset)) {
        values.push(21);
        offset += 3;
        matched = true;
      } else if (upper.startsWith("IO", offset)) {
        values.push(27);
        offset += 2;
        matched = true;
      } else {
        for (const token of symbols) {
          if (upper.startsWith(token.symbol, offset)) {
            values.push(token.value);
            offset += token.symbol.length;
            matched = true;
            break;
          }
        }
      }
      if (!matched) return false;
    }
    return values.length === 3;
  })
);
const assemblyHits = assemblyFamily.filter((row) =>
  sourceThreeRuneWords.has(
    row.vector.map((value) => corpus.translit[value]).join("")
  )
);
assert.deepEqual(assemblyHits, [{
  slot:0,
  direction:"forward",
  vector:[7,24,26],
}]);

/*
 * Manuscript-wide fixed transform control.
 */
const target = [24,26,3,8];
const prefix = hPolynomial;
let contiguousWindows = 0;
const fixedFullHits = [];
const fixedPrefixHits = [];
for (const page of corpus.pages) {
  if (page.page < 0 || page.page > 55 || page.page === 50) continue;
  const values = page.indices;
  for (let start = 0; start + 4 <= values.length; start += 1) {
    contiguousWindows += 1;
    const input = values.slice(start,start+4);
    const output = radialH4(input);
    if (output.every((value,index) => value === target[index])) {
      fixedFullHits.push({page:page.page,start,input,output});
    }
    if (output.slice(0,3).every((value,index) => value === prefix[index])) {
      fixedPrefixHits.push({page:page.page,start,input,output});
    }
  }
}
assert.equal(contiguousWindows, 12791);
assert.deepEqual(fixedFullHits, [{
  page:9,
  start:137,
  input:[0,3,16,21],
  output:[24,26,3,8],
}]);
assert.deepEqual(fixedPrefixHits, fixedFullHits);

/*
 * Broaden the H-shell family: independently flip each pair's input direction,
 * independently swap each H output, and reverse the final shell read.
 * 32 configurations/window. Target/prefix may have symmetry-equivalent configs,
 * so count distinct physical windows as the discriminating unit.
 */
function broadVariants(values) {
  const rows = [];
  for (const innerFlip of [false,true]) {
    for (const outerFlip of [false,true]) {
      const innerInput = innerFlip
        ? [values[1],values[0]]
        : [values[0],values[1]];
      const outerInput = outerFlip
        ? [values[3],values[2]]
        : [values[2],values[3]];
      const innerH = H(innerInput[0],innerInput[1]);
      const outerH = H(outerInput[0],outerInput[1]);
      for (const innerSwap of [false,true]) {
        for (const outerSwap of [false,true]) {
          const inner = innerSwap ? [innerH[1],innerH[0]] : innerH;
          const outer = outerSwap ? [outerH[1],outerH[0]] : outerH;
          const shell = [outer[0],inner[0],inner[1],outer[1]];
          rows.push({
            innerFlip,outerFlip,innerSwap,outerSwap,reverse:false,
            output:shell,
          });
          rows.push({
            innerFlip,outerFlip,innerSwap,outerSwap,reverse:true,
            output:[...shell].reverse(),
          });
        }
      }
    }
  }
  return rows;
}

let broadConfigurations = 0;
const broadFullHits = [];
const broadPrefixHits = [];
for (const page of corpus.pages) {
  if (page.page < 0 || page.page > 55 || page.page === 50) continue;
  const values = page.indices;
  for (let start = 0; start + 4 <= values.length; start += 1) {
    const input = values.slice(start,start+4);
    for (const variant of broadVariants(input)) {
      broadConfigurations += 1;
      if (variant.output.every((value,index) => value === target[index])) {
        broadFullHits.push({page:page.page,start,input,...variant});
      }
      if (variant.output.slice(0,3).every((value,index) => value === prefix[index])) {
        broadPrefixHits.push({page:page.page,start,input,...variant});
      }
    }
  }
}
assert.equal(broadConfigurations, contiguousWindows * 32);
assert.equal(broadFullHits.length, 2);
assert.equal(broadPrefixHits.length, 4);
assert.deepEqual(
  [...new Set(broadFullHits.map((row) => row.page + ":" + row.start))],
  ["9:137"]
);
assert.deepEqual(
  [...new Set(broadPrefixHits.map((row) => row.page + ":" + row.start))],
  ["9:137"]
);

console.log(JSON.stringify({
  status:"PASS",
  p9Packet:{
    packet,
    split:{
      K:state.K,
      direction:directionBlock,
      directionSum:29,
      paths:pathsBlock,
      pathsSum:40,
    },
    radialH:p9Radial,
    stateLabels:["p+1","-e","e","A"],
  },
  signed2013:{
    raw:"3QO",
    digits:rawDigits,
    polynomial:hPolynomial,
    p9PrefixMatches:true,
  },
  p29Way:{
    root:root24,
    derivativeOrder,
    derivative:W,
    ay,
    packetOrderCandidate,
    text:"WAY",
    chargedAssemblyFamily:assemblyFamily.length,
    authenticatedThreeRuneHits:assemblyHits,
  },
  fixedControl:{
    windows:contiguousWindows,
    fullHits:fixedFullHits,
    prefixHits:fixedPrefixHits,
  },
  broadControl:{
    configurations:broadConfigurations,
    fullConfigHits:broadFullHits.length,
    prefixConfigHits:broadPrefixHits.length,
    fullPhysicalWindows:[...new Set(broadFullHits.map((row) => row.page + ":" + row.start))],
    prefixPhysicalWindows:[...new Set(broadPrefixHits.map((row) => row.page + ":" + row.start))],
  },
  classification:
    "The independently selected p9 PATHS half uniquely reproduces the authenticated 2013 H polynomial [24,26,3] plus A=8 under the fixed radial H transform; this same packet supplies p29 root24, derivative order e=3, and AY=[24,26], leaving only the derivative-output insertion order in the WAY assembly family.",
}, null, 2));
