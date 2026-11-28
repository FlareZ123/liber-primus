"use strict";

/**
 * Independent p50 DH-state -> p28 READ OUT transfer.
 * SFT: node sims/lp2_p50_dh_state_p28_readout_transfer_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);

/** @param {number} value @param {number} modulus */
function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}
/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let result = 1 % modulus;
  let x = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = result * x % modulus;
    x = x * x % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}
/** @param {number} base @param {number} value @param {number} modulus */
function discreteLog(base, value, modulus) {
  let x = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent += 1) {
    if (x === value) return exponent;
    x = x * base % modulus;
  }
  return null;
}
/** @param {number} value @param {number} modulus */
function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (value * candidate % modulus === 1) return candidate;
  }
  return null;
}
/** @param {number[]} map @param {number} root */
function allReachRoot(map, root) {
  if (map[root] !== root) return false;
  const done = new Uint8Array(map.length);
  done[root] = 1;
  for (let start = 0; start < map.length; start += 1) {
    if (done[start]) continue;
    let cell = start;
    const local = new Set();
    const pathNodes = [];
    while (!done[cell]) {
      if (local.has(cell)) return false;
      local.add(cell);
      pathNodes.push(cell);
      cell = map[cell];
    }
    for (const node of pathNodes) done[node] = 1;
  }
  return true;
}
/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}
/** @param {string} text */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({word:words.length+1,start,end:offset-1,len:current.length,values:current.slice()});
    current = [];
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return {runes, words};
}
/** @param {number[]} values */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

// Reconstruct the p50 DH state without reading p28.
const a60 = grid.alphabet;
const a59 = a60.replace("f", "");
const tokenFrom60 = (value) => a60[Math.floor(value / 60)] + a60[value % 60];
const tokens = grid.bytes.map(tokenFrom60);
assert.deepEqual([...a60].filter((ch) => !tokens.join("").includes(ch)), ["f"]);
const decode59 = (token) => a59.indexOf(token[0]) * 59 + a59.indexOf(token[1]);
const values59 = tokens.map(decode59);
const sink = 189;
assert.equal(values59[sink], sink);
assert.equal(allReachRoot(values59, sink), true);

const width = 8;
const p = Math.floor(sink / width);
const g = sink % width;
const K = width - 1 - g;
const mirror = p * width + K;
const A = width;
const B = values59[mirror];
assert.deepEqual({p,g,A,K,mirror,B,token:tokens[mirror]},
  {p:23,g:5,A:8,K:2,mirror:186,B:19,token:"0J"});

const a = discreteLog(g, A, p);
const b = discreteLog(g, B, p);
const e = inverseMod(b, p - 1);
assert.deepEqual({p,g,a,b,A,B,K,e},{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3});
assert.equal(modPow(B, a, p), K);

// P28 source object is selected only by its established visible geometry:
// exact center rune followed immediately by one-based word28, length5.
const p28 = parsePage(physicalPart(28));
assert.equal(p28.runes.length, 269);
const center = (p28.runes.length - 1) / 2;
assert.equal(center, 134);
const word28 = p28.words[27];
assert.deepEqual(word28, {
  word:28,start:135,end:139,len:5,values:[28,24,10,1,20]
});
assert.equal(word28.start, center + 1);
const source = [p28.runes[center], ...word28.values];
assert.deepEqual(source, [9,28,24,10,1,20]);

// Transfer p50-derived e to the already charged visible-layer convention.
const centerLayers = 1;
const wordLayers = Math.ceil(word28.len / 2);
assert.deepEqual([centerLayers, wordLayers], [1,3]);
const actionPair = [modPow(e, centerLayers, 28), modPow(e, wordLayers, 28)];
const zeroIndexedPair = [modPow(e, centerLayers - 1, 28), modPow(e, wordLayers - 1, 28)];
assert.deepEqual(actionPair, [3,27]);
assert.deepEqual(actionPair, [e, mod(-K, 29)]);
assert.deepEqual(zeroIndexedPair, [1,9]);

const actionOutput = [
  modPow(source[0], actionPair[0], 29),
  ...source.slice(1).map((value) => modPow(value, actionPair[1], 29)),
];
const zeroIndexedOutput = [
  modPow(source[0], zeroIndexedPair[0], 29),
  ...source.slice(1).map((value) => modPow(value, zeroIndexedPair[1], 29)),
];
assert.deepEqual(actionOutput, [4,28,23,3,1,16]);
assert.equal(spell(actionOutput), "READOUT");
assert.deepEqual(zeroIndexedOutput, [9,28,25,18,1,23]);
assert.notEqual(spell(zeroIndexedOutput), "READOUT");

// Exact reversible control for the selected power map.
const inverseCenterExponent = inverseMod(actionPair[0], 28);
const inverseWordExponent = inverseMod(actionPair[1], 28);
assert.deepEqual([inverseCenterExponent,inverseWordExponent],[19,27]);
const replay = [
  modPow(actionOutput[0], inverseCenterExponent, 29),
  ...actionOutput.slice(1).map((value) => modPow(value, inverseWordExponent, 29)),
];
assert.deepEqual(replay, source);

// Matched manuscript-wide source gate: every odd-rune unknown page whose exact
// center is immediately followed by a complete printed word. Freeze e=3 from
// p50 and charge only action-count versus zero-index layer depth.
const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase().split(/\s+/u).filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(...(read(relative).toLowerCase().match(/[a-z]+/gu) || []));
}
const lexicon = new Set(dictionaryWords.filter((word) =>
  /^[a-z]+$/u.test(word) && word.length >= 3
));
/** @param {string} text */
function oneOrTwoWordParses(text) {
  const lower = text.toLowerCase();
  const parses = [];
  if (lexicon.has(lower)) parses.push([lower]);
  for (let cut = 3; cut <= lower.length - 3; cut += 1) {
    const left = lower.slice(0, cut);
    const right = lower.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) parses.push([left, right]);
  }
  return parses;
}
const matchedCenterObjects = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));
  if (parsed.runes.length % 2 === 0) continue;
  const pageCenter = (parsed.runes.length - 1) / 2;
  const nextWord = parsed.words.find((word) => word.start === pageCenter + 1);
  if (!nextWord) continue;
  const layers = Math.ceil(nextWord.len / 2);
  const object = [parsed.runes[pageCenter], ...nextWord.values];
  for (const convention of ["action", "zero"]) {
    const centerExponent = convention === "action" ? e : 1;
    const wordExponent = modPow(
      e,
      convention === "action" ? layers : layers - 1,
      28
    );
    const output = [
      modPow(object[0], centerExponent, 29),
      ...object.slice(1).map((value) => modPow(value, wordExponent, 29)),
    ];
    matchedCenterObjects.push({
      page,
      word:nextWord.word,
      wordLength:nextWord.len,
      layers,
      convention,
      exponents:[centerExponent, wordExponent],
      text:spell(output),
      parses:oneOrTwoWordParses(spell(output)),
    });
  }
}
assert.equal(matchedCenterObjects.length, 8);
assert.deepEqual(
  [...new Set(matchedCenterObjects.map((row) => row.page))],
  [3,17,25,28]
);
const lexicalHits = matchedCenterObjects.filter((row) => row.parses.length > 0);
assert.deepEqual(lexicalHits, [{
  page:28,word:28,wordLength:5,layers:3,convention:"action",
  exponents:[3,27],text:"READOUT",parses:[["read","out"]]
}]);

console.log(JSON.stringify({
  status:"PASS",
  p50DerivedDh:{p,g,a,b,A,B,K,e},
  p50Source:{missingDigit:"f",sink,mirror,mirrorToken:tokens[mirror]},
  p28Source:{center,word28,source},
  transfer:{
    actionCountExponents:actionPair,
    alsoEquals:[e,"-K mod29"],
    output:actionOutput,
    text:spell(actionOutput),
    zeroIndexedExponents:zeroIndexedPair,
    zeroIndexedOutput,
    zeroIndexedText:spell(zeroIndexedOutput)
  },
  matchedCenterGate:{
    configurations:matchedCenterObjects,
    lexicalHits
  },
  classification:"post-discovery independent state transfer: p50 supplies e=3 and K=2 without p28 DH-line state; action-count layering on the established p28 center+word28 object yields READOUT. The p28-specific assignment/layer convention remains a caveat."
}, null, 2));
