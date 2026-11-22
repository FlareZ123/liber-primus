"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p50 = grid.rows.flat();
const alpha60 = grid.alphabet;
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} base @param {number} exponent @param {number} modulus */
function powModulo(base, exponent, modulus) {
  let out = 1;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = out * x % modulus;
    x = x * x % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  let out = 1;
  for (let i = 1; i <= k; i += 1) out = out * (n - k + i) / i;
  return out;
}

const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || [])
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const occurrences = new Map();
for (let index = 0; index < words.length; index += 1) {
  if (!occurrences.has(words[index])) occurrences.set(words[index], []);
  occurrences.get(words[index]).push(index);
}

/** @param {string} word @param {number} occurrence */
function wordIndex(word, occurrence = 0) {
  const indices = occurrences.get(word);
  assert.ok(indices && indices.length > occurrence, "missing " + word);
  return indices[occurrence];
}

const state = {
  p:wordIndex("ROAD"),
  g:wordIndex("EPIPHANY"),
  a:wordIndex("SEEKS"),
  b:wordIndex("WORDS"),
  A:wordIndex("DEVOTED"),
  B:wordIndex("THEIR"),
  K:wordIndex("PATH"),
  e:wordIndex("LIES"),
  q:wordIndex("EMPTY"),
};
const direction = wordIndex("DIRECTION");
assert.deepEqual(state,{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});
assert.equal(direction,29);
assert.equal(powModulo(state.g,state.a,state.p),state.A);
assert.equal(powModulo(state.g,state.b,state.p),state.B);
assert.equal(powModulo(state.A,state.b,state.p),state.K);
assert.equal(powModulo(state.B,state.a,state.p),state.K);
assert.equal(state.b*state.e%(state.p-1),1);

/** @param {number} value */
const sourceCube = (value) => powModulo(value,state.e,direction);

/** @param {number} start */
function orbit(start) {
  const out = [];
  let value = start;
  while (!out.includes(value)) {
    out.push(value);
    value = sourceCube(value);
  }
  assert.equal(value,start);
  return out;
}

const chainExponents = [];
for (let exponent=1; exponent<=28; exponent+=1) {
  if (
    powModulo(state.K,exponent,29)===state.A &&
    powModulo(state.A,exponent,29)===state.B &&
    powModulo(state.B,exponent,29)===state.b
  ) chainExponents.push(exponent);
}
assert.deepEqual(chainExponents,[state.e]);

const kOrbit = orbit(state.K);
assert.deepEqual(kOrbit,[2,8,19,15,11,26]);
assert.deepEqual(kOrbit.map((index)=>words[index]),
  ["PATH","DEVOTED","THEIR","WORDS","IS","NUMBERS"]);

const pOrbit = orbit(state.p);
assert.deepEqual(pOrbit,[23,16,7,24,20,25]);
assert.deepEqual(pOrbit.map((index)=>words[index]),
  ["ROAD","ARE","THE","AND","MEANING","THEIR"]);

const seen = new Set();
const cycles = [];
for (let start=0; start<29; start+=1) {
  if (seen.has(start)) continue;
  const cycle = orbit(start);
  cycle.forEach((value)=>seen.add(value));
  cycles.push(cycle);
}
assert.deepEqual(cycles,[
  [0],[1],[2,8,19,15,11,26],[3,27,21,10,14,18],
  [4,6,13,22,5,9],[7,24,20,25,23,16],[12,17],[28],
]);

const shortNonzero = cycles
  .filter((cycle)=>!cycle.includes(0)&&cycle.length<6)
  .flat().sort((a,b)=>a-b);
assert.deepEqual(shortNonzero,[1,12,17,28]);
assert.deepEqual(shortNonzero.map((index)=>words[index]),["THE","THE","THE","THE"]);

const sourceThePositions = words.slice(0,29)
  .map((word,index)=>({word,index}))
  .filter((row)=>row.word==="THE")
  .map((row)=>row.index);
assert.deepEqual(sourceThePositions,[1,7,12,17,22,28]);

const originHits = [];
for (let shift=0; shift<29; shift+=1) {
  if (shortNonzero.every((index)=>words[(index+shift)%29]==="THE")) {
    originHits.push(shift);
  }
}
assert.deepEqual(originHits,[0]);
assert.equal(choose(24,2),276);
assert.equal(choose(28,6),376740);

const inverseExponent = 19;
assert.equal(state.e*inverseExponent%28,1);
for (let value=1; value<29; value+=1) {
  assert.equal(powModulo(sourceCube(value),inverseExponent,29),value);
}
const wordExponent = powModulo(state.e,state.e,28);
assert.equal(wordExponent,27);
assert.equal(sourceCube(28),28);

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page,50);
  return parts[page<=49?page:page-1];
}

/** @param {string} text */
function parseWords(text) {
  const parsedWords = [];
  const runes = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    parsedWords.push({start,values:current});
    current=[];
  };
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value!==undefined) {
      if (current.length===0) start=runes.length;
      current.push(value);
      runes.push(value);
    } else if (character==="-" || character===".") {
      flush();
    }
  }
  flush();
  return {words:parsedWords,runes};
}

/** @param {number[]} runes @param {{start:number,values:number[]}} word @param {"predecessor"|"successor"} side */
function boundaryRune(runes,word,side) {
  const position = side==="predecessor"
    ? word.start-1
    : word.start+word.values.length;
  return position>=0 && position<runes.length ? runes[position] : null;
}

/** @param {number} stateValue */
function low60Step(stateValue) {
  if (!Number.isInteger(stateValue)||stateValue<0||stateValue>=p50.length) return null;
  const value = alpha60.indexOf(p50[stateValue][1]);
  return value<0 ? null : value;
}

const pointerHits = [];
let sideObjects = 0;
let splitConfigurations = 0;
for (let page=0; page<=55; page+=1) {
  if (page===50) continue;
  const parsed = parseWords(physicalPart(page));
  for (let wordIndex0=0; wordIndex0<parsed.words.length; wordIndex0+=1) {
    const word = parsed.words[wordIndex0];
    if (word.values.length!==5) continue;
    for (const side of ["predecessor","successor"]) {
      const boundary = boundaryRune(parsed.runes,word,side);
      if (boundary===null) continue;
      sideObjects+=1;
      let output = [
        sourceCube(boundary),
        ...word.values.map((value)=>powModulo(value,wordExponent,29)),
      ];
      if (side==="successor") output=[...output.slice(1),output[0]];
      for (let cut=1; cut<output.length; cut+=1) {
        splitConfigurations+=1;
        const left=output.slice(0,cut).reduce((sum,value)=>sum+value,0);
        const right=output.slice(cut).reduce((sum,value)=>sum+value,0);
        if (
          low60Step(left)===right &&
          low60Step(right)===42 &&
          low60Step(42)===28
        ) {
          pointerHits.push({
            page,word:wordIndex0+1,start:word.start,side,cut,output,left,right,
            latin:output.map((value)=>corpus.translit[value]).join(""),
          });
        }
      }
    }
  }
}
assert.equal(sideObjects,627);
assert.equal(splitConfigurations,3135);
assert.deepEqual(pointerHits,[
  {page:25,word:30,start:145,side:"predecessor",cut:5,
   output:[3,10,16,3,8,20],left:40,right:20,latin:"OITOHL"},
  {page:28,word:28,start:135,side:"predecessor",cut:3,
   output:[4,28,23,3,1,16],left:55,right:20,latin:"READOUT"},
]);
const balancedHits = pointerHits.filter((hit)=>hit.cut===3);
assert.deepEqual(balancedHits,[pointerHits[1]]);

console.log(JSON.stringify({
  status:"PASS",
  sourceState:state,
  direction,
  uniqueChainExponent:chainExponents,
  kOrbit:{values:kOrbit,words:kOrbit.map((index)=>words[index])},
  pOrbit:{values:pOrbit,words:pOrbit.map((index)=>words[index])},
  cycles:cycles.map((cycle)=>({values:cycle,words:cycle.map((index)=>words[index])})),
  shortCycleThe:{
    positions:shortNonzero,
    sourceThePositions,
    originHits,
    exactMultiset:{favorable:276,total:376740,fraction:276/376740},
  },
  sourceOperator:{exponent:state.e,modulus:direction,inverseExponent,wordExponent,p28Fixed:sourceCube(28)},
  rawCensus:{sideObjects,splitConfigurations,pointerHits,balancedHits},
},null,2));
