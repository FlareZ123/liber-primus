"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");
}

/** @param {number} x @returns {number} */
function m(x) {
  return ((x % 29) + 29) % 29;
}

const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/** @param {number} i */
function cell(i) {
  const byte = grid.byte_rows.flat()[i];
  return { hi: Math.floor(byte / 29), lo: byte % 29 };
}

const body = signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const words = (body.match(/[A-Za-z]+/g) || []).map((w) => w.toUpperCase());
assert.equal(words.length, 43);

/** @param {number} i @returns {number[]} */
function triplet(i) {
  const a = cell(i);
  const b = cell(i + 1);
  const c = cell(i + 2);
  return [m(a.lo - c.hi), m(b.lo - c.hi)];
}

const starts = [11, 14, 17, 20, 23, 26, 29, 32, 35, 38];
assert.deepEqual(
  starts.map((i) => words.slice(i, i + 3)),
  [
    ["IS", "THE", "WAY"],
    ["ITS", "WORDS", "ARE"],
    ["THE", "MAP", "THEIR"],
    ["MEANING", "IS", "THE"],
    ["ROAD", "AND", "THEIR"],
    ["NUMBERS", "ARE", "THE"],
    ["DIRECTION", "SEEK", "AND"],
    ["YOU", "WILL", "BE"],
    ["FOUND", "GOOD", "LUCK"],
    ["BEWARE", "FALSE", "PATHS"],
  ]
);

const state = { p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3, q:4, dhp:20 };
const pairs = starts.map(triplet);
assert.deepEqual(pairs, [
  [state.B, state.b],
  [state.g, state.g],
  [m(-state.K), m(-state.b)],
  [m(state.b-state.K), state.B],
  [state.p, m(state.K-state.b)],
  [state.p, state.dhp],
  [state.q, m(state.p-state.K)],
  [m(state.p-1), m(state.p-state.K)],
  [state.A, state.p],
  [state.b, state.e],
]);

const clear = signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const match = clear.match(/VERIFY\s+OPENPGP\s+([0-9A-F]{8})/i);
assert.ok(match);
assert.equal(match[1].toUpperCase(), "7A35090F");
const fpBytes = match[1].match(/../g).map((x) => Number.parseInt(x, 16));
const fpPairs = fpBytes.map((x) => [Math.floor(x/29), x%29]);
assert.deepEqual(fpPairs, [
  [state.q, state.a],
  [m(state.a-state.g), m(-state.g)],
  [0, m(state.a+state.e)],
  [0, state.b],
]);

const q = fpPairs[0][0];
const finalPair = [m(cell(41).lo-q), m(cell(42).lo-q)];
assert.deepEqual(finalPair, [m(state.p-1), m(-state.g)]);

const tape = [...pairs.flat(), ...finalPair];
assert.deepEqual(tape, [
  19,15,5,5,27,14,13,19,23,16,23,20,4,21,22,21,8,23,15,3,22,24,
]);
assert.equal(tape.length, state.p-1);

// Descriptive source-window charge.
const vocabulary = new Set(
  [state.p,state.g,state.a,state.b,state.A,state.B,state.K,state.e,state.q]
    .flatMap((x) => [x, m(-x)])
);
for (const x of [state.b-state.K,state.K-state.b,state.p-state.K,state.p-1,state.dhp]) {
  vocabulary.add(m(x));
}
const windows = [];
for (let start=0; start<=13; start++) {
  const vals = [];
  for (let k=0; k<10; k++) vals.push(...triplet(start+3*k));
  windows.push({
    start,
    score: vals.filter((x) => vocabulary.has(x)).length,
    all: vals.every((x) => vocabulary.has(x)),
  });
}
assert.deepEqual(windows.filter((x) => x.all).map((x) => x.start), [11]);

// Sealed consumer 1: p28 line7 subtraction.
const pageParts = transcription.split("%").slice(0,55);
const p28Lines = pageParts[28].trim().split("/")
  .filter((line) => [...line].some((ch) => runeIndex.has(ch)))
  .map((line) => [...line].map((ch) => runeIndex.get(ch)).filter((x) => x !== undefined));
assert.equal(p28Lines[5].length, state.p);
assert.equal(p28Lines[6].length, state.p-1);
const line7 = p28Lines[6];
const line7Out = line7.map((x,i) => m(x-tape[i]));
assert.equal(line7Out.map((x) => corpus.translit[x]).join(""), "CIGNFSYEAMEOXNHJXWOEAAEOT");

// Sealed consumer 2: tape pairs as page/word coordinates.
const pages = pageParts.map((_, s) => ({ page:s>=50?s+1:s, words:[] }));
const offsets = new Array(pageParts.length).fill(0);
let values=[], ss=0, es=0, start=0;
function flush() {
  if (!values.length) return;
  if (ss === es) {
    const page = pages[ss];
    page.words.push({
      start,
      end:start+values.length-1,
      length:values.length,
      gp0:values.reduce((a,b)=>a+b,0),
    });
  }
  values=[];
}
for (let s=0; s<pageParts.length; s++) {
  for (const ch of pageParts[s]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      if (!values.length) { ss=s; start=offsets[s]; }
      es=s;
      values.push(v);
      offsets[s]++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // layout only
    } else {
      flush();
    }
  }
}
flush();

const gpTokens = corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word */
function gp(word) {
  let n=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for (let i=0;i<n.length;) {
    if (n.startsWith("ING",i)) { out.push(21); i+=3; continue; }
    if (n.startsWith("IO",i)) { out.push(27); i+=2; continue; }
    const t=gpTokens.find((x)=>n.startsWith(x.symbol,i));
    assert.ok(t);
    out.push(t.value);
    i+=t.symbol.length;
  }
  return out;
}
const signedStates=words.map((word)=>{
  const v=gp(word);
  return {word,length:v.length,gp0:v.reduce((a,b)=>a+b,0)};
});
const coordinatePairs=[...pairs,finalPair];
let uniqueLabels=0;
const coordinateResults=coordinatePairs.map(([pageNo,wordNo])=>{
  const page=pages.find((x)=>x.page===pageNo);
  assert.ok(page);
  const word=page.words[wordNo];
  assert.ok(word);
  const labels=[...new Set(signedStates
    .filter((x)=>x.length===word.length && x.gp0===word.gp0)
    .map((x)=>x.word))];
  if (labels.length===1) uniqueLabels++;
  return {coord:[pageNo,wordNo],length:word.length,gp0:word.gp0,labels};
});
assert.equal(uniqueLabels,0);

console.log(JSON.stringify({
  status:"PASS",
  pairs,
  fingerprint:{bytes:fpBytes,pairs:fpPairs,finalPair},
  tape,
  windowScores:windows,
  sealedConsumers:{
    p28Line7:{precommit:"3e107afc6f2e96c40d1210d951a52a41c0f4e48a",translit:line7Out.map((x)=>corpus.translit[x]).join(""),result:"FAIL"},
    pageWord:{precommit:"d64522f97897ac8ff9a7884fb72ec4cd0b580745",uniqueLabels,results:coordinateResults,result:"FAIL"},
  },
  classification:"source-authenticated DH/state tape; direct additive-key and page-word consumers rejected"
},null,2));
