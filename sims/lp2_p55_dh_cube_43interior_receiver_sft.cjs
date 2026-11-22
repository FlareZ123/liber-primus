"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const rawPages = transcription.split("%");
const page = corpus.pages.find((item) => item.page === 55).indices;
const translit = corpus.translit;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

function parseWords(text) {
  const words = [];
  let current = [];
  for (const character of text) {
    const value = runeIndex.get(character);
    if (value !== undefined) current.push(value);
    else if (character === "/" || /\s/u.test(character)) {
      // Printed line-wrap notation.
    } else {
      if (current.length) words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}
function powMod(base, exponent, modulus) {
  let result = 1;
  while (exponent > 0) {
    if (exponent & 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
}
function transliterate(indices) {
  return indices.map((index) => translit[index]).join("");
}

const p55Raw = rawPages[54]; // physical p55; p50 is the rune-free numeric table.
const words = parseWords(p55Raw);
const flattened = words.flat();
const fragmentLengths = words.map((word) => word.length);
assert.deepEqual(fragmentLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(words.length, 17);
assert.equal(page.length, 76);
assert.deepEqual(flattened, page);

const interiorPositions = [];
let cursor = 0;
for (let wordIndex = 0; wordIndex < fragmentLengths.length; wordIndex += 1) {
  const length = fragmentLengths[wordIndex];
  if (wordIndex > 0) {
    for (let position = cursor + 1; position < cursor + length - 1; position += 1) {
      interiorPositions.push(position);
    }
  }
  cursor += length;
}
assert.equal(cursor, 76);
assert.equal(interiorPositions.length, 43);
assert.equal(page.length - interiorPositions.length, 33);
assert.deepEqual(interiorPositions, [
  2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,
  37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74
]);
const interior = interiorPositions.map((position) => page[position]);
assert.deepEqual(interior, [
  19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,
  23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18
]);

// The p28 DH23 state supplies the fixed exponent3; its GP29 inverse is19 mod28.
const dh = {p:23,g:5,a:6,b:15,A:8,B:19,K:2};
assert.equal(powMod(dh.g,dh.a,dh.p),dh.A);
assert.equal(powMod(dh.g,dh.b,dh.p),dh.B);
assert.equal(powMod(dh.B,dh.a,dh.p),dh.K);
assert.equal(powMod(dh.A,dh.b,dh.p),dh.K);
const exponent = 3;
const inverseExponent = 19;
assert.equal((dh.b * exponent) % (dh.p - 1),1);
assert.equal((exponent * inverseExponent) % 28,1);
for (let value=0; value<29; value+=1) {
  assert.equal(powMod(powMod(value,exponent,29),inverseExponent,29),value);
}

const cube = interior.map((value)=>powMod(value,exponent,29));
const inverseCube = interior.map((value)=>powMod(value,inverseExponent,29));
assert.equal(cube.length,43);
assert.equal(inverseCube.length,43);
assert.equal(interior.filter((value)=>value===0).length,1);
assert.equal(cube.filter((value)=>value===0).length,1);
assert.equal(inverseCube.filter((value)=>value===0).length,1);

function reconstruct(transformed) {
  const result=[];
  let offset=0;
  for(let wordIndex=0;wordIndex<words.length;wordIndex+=1){
    const original=words[wordIndex];
    if(wordIndex===0){result.push(original);continue;}
    const count=original.length-2;
    result.push([original[0],...transformed.slice(offset,offset+count),original[original.length-1]]);
    offset+=count;
  }
  assert.equal(offset,43);
  return result.map(transliterate);
}
const originalWords=words.map(transliterate);
const cubeWords=reconstruct(cube);
const inverseWords=reconstruct(inverseCube);
assert.deepEqual(cubeWords,[
  "N","AESXW","SB","XM","SBPTHAE","FNGLEONU","WR","BEAFEXSUNOEMIAEEO",
  "MJTNGOEF","BMBC","EOE","EAOXPEPS","EJBHHOS","THOE","CEAXSNX","DYU","BOI"
]);
assert.deepEqual(inverseWords,[
  "N","AEHNGW","SB","XM","SBRAEYAE","FOWEOOEU","WR","BEAFINGHUOEGTHIAAEO",
  "MMAEOGF","BTHBC","EOE","EAXNGRIRS","EMBYYXS","THOE","CEANGHOEX","DSU","BXI"
]);

console.log(JSON.stringify({
  source: {
    physicalPage:55,
    archiveImage:"72.jpg",
    pageRunes:page.length,
    wordFragments:fragmentLengths,
    wordCount:words.length,
    interiorCount:interior.length,
    exteriorCount:page.length-interior.length,
    interiorPositions,
    originalWords,
    interiorTransliteration:transliterate(interior),
  },
  operation: {
    dhState:dh,
    exponent,
    inverseExponent,
    map:"x^3 mod29",
    inverse:"x^19 mod29",
  },
  result: {
    cubeInterior:transliterate(cube),
    cubeWords,
    inverseInterior:transliterate(inverseCube),
    inverseWords,
  },
},null,2));
