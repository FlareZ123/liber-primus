"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const state = Object.freeze({ p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4 });

const mod29 = (value) => ((value % 29) + 29) % 29;
const physicalPart = (page) => parts[page <= 49 ? page : page - 1];

function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW").replace(/[KQ]/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) { values.push(21); offset += 3; continue; }
    if (normalized.startsWith("IO", offset)) { values.push(27); offset += 2; continue; }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function completeWordsByPage() {
  const result = new Map(Array.from({length:56}, (_,page) => [page, []]));
  let current=[], startPage=null, startOffset=null, lastPage=null, lastOffset=null;
  function flush() {
    if (current.length && startPage !== null && startPage === lastPage && startPage !== 50) {
      const words = result.get(startPage);
      words.push({ index:words.length, ordinal:words.length+1, start:startOffset, end:lastOffset, values:current.slice() });
    }
    current=[]; startPage=null; startOffset=null;
  }
  for (let page=0; page<=55; page+=1) {
    if (page===50) continue;
    let runeOffset=0;
    for (const character of [...physicalPart(page)]) {
      const value=runeToValue.get(character);
      if (value !== undefined) {
        if (!current.length) { startPage=page; startOffset=runeOffset; }
        current.push(value); lastPage=page; lastOffset=runeOffset; runeOffset+=1;
      } else if (character==="-" || character==="." || character==="&") flush();
    }
  }
  flush();
  return result;
}

function H3dsc(values) {
  return [mod29(values[0]-values[2]), mod29(values[0]+values[2]), values[1]];
}
function H3dcs(values) {
  return [mod29(values[0]-values[2]), values[1], mod29(values[0]+values[2])];
}
function H3invDcs(values) {
  const inv2=15;
  return [mod29((values[0]+values[2])*inv2), values[1], mod29((values[2]-values[0])*inv2)];
}
function H4(values) {
  return [mod29(values[0]-values[3]),mod29(values[1]-values[2]),mod29(values[1]+values[2]),mod29(values[0]+values[3])];
}
function permutations3(v) {
  return [[v[0],v[1],v[2]],[v[0],v[2],v[1]],[v[1],v[0],v[2]],[v[1],v[2],v[0]],[v[2],v[0],v[1]],[v[2],v[1],v[0]]];
}

const sourceStart=signed.indexOf("Hello.");
const sourceEnd=signed.indexOf("-----BEGIN PGP SIGNATURE-----");
const source=signed.slice(sourceStart,sourceEnd).replace(/\b7A35090F\b/g,"").match(/[A-Za-z]+/g).map((w)=>w.toUpperCase());
assert.equal(source[32],"YOU");
assert.equal(source[33],"WILL");
const YOU=gp("YOU");
assert.deepEqual(YOU,[26,3,1]);

const byPage=completeWordsByPage();
const p32=byPage.get(32);
assert.equal(p32.length,21);
const contain=(offset)=>p32.find((word)=>word.start<=offset && word.end>=offset) || null;

const endpoint=contain(32);
assert.deepEqual(endpoint,{index:5,ordinal:6,start:30,end:32,values:[0,3,2]});
assert.deepEqual(contain(31),endpoint);
assert.equal(contain(88).values.length,4);
assert.equal(contain(89).values.length,8);
assert.deepEqual(H3dsc(endpoint.values),[27,2,3]);
assert.deepEqual(H3dcs(endpoint.values),[27,3,2]);

const squareVariants=[];
for (const origin of [0,1]) {
  for (const major of ["row","column"]) {
    for (const reverse of [false,true]) {
      let linear=origin===0?32:31;
      if (reverse) linear=120-linear;
      const offset=major==="row"
        ? linear
        : (linear%11)*11 + Math.floor(linear/11);
      const word=contain(offset);
      squareVariants.push({origin,major,reverse,offset,word});
    }
  }
}
const squareRival=squareVariants.find((row)=>
  row.origin===1 && row.major==="column" && row.reverse===false
);
assert.deepEqual(squareRival.word,{index:16,ordinal:17,start:99,end:101,values:[28,4,22]});
assert.deepEqual(H3dsc(squareRival.word.values),[state.a,mod29(-state.A),state.q]);
assert.equal(
  squareVariants.filter((row)=>row.word && row.word.values.length===3).length,
  3
); // two row-major aliases of endpoint plus the one column-major rival

// Chronologically earlier p6 69-shell family.
const p6TitleStarts=new Set([71,75,76,80]);
const p6Title=byPage.get(6).filter((word)=>p6TitleStarts.has(word.start));
const p6Lengths=p6Title.map((word)=>word.values.length);
assert.deepEqual(p6Lengths,[state.q,1,state.q,state.K]);
const p6LengthShell=H4(p6Lengths);
assert.deepEqual(p6LengthShell,[state.K,mod29(-state.e),state.g,state.a]);
const lengthAtoms=[...new Set(p6Lengths)];
const shells=new Map();
for (const hAtom of p6LengthShell) {
  for (const lAtom of lengthAtoms) {
    for (const shell of permutations3([hAtom,0,lAtom])) shells.set(shell.join(","),shell);
  }
}
assert.equal(shells.size,69);

function youHits(cipher) {
  const hits=[];
  for (const shell of shells.values()) {
    const key=H3invDcs(shell);
    for (const sign of [-1,1]) {
      const plain=cipher.map((value,index)=>mod29(value+sign*key[index]));
      if (plain.every((value,index)=>value===YOU[index])) hits.push({shell,key,sign});
    }
  }
  return hits;
}
assert.deepEqual(youHits(endpoint.values),[
  {shell:[state.K,0,state.q],key:[state.e,0,state.a-state.g],sign:-1}
]);
assert.deepEqual(youHits(squareRival.word.values),[]);

console.log("PASS Director #1842 p32 direct consumer adjudication");
console.log(JSON.stringify({
  input:32,
  sourceLabel:source[32],
  selected:{
    receiver:endpoint,
    H_dsc:H3dsc(endpoint.values),
    H_dcs:H3dcs(endpoint.values),
    p6YouHits:youHits(endpoint.values)
  },
  squareRival:{
    offset:squareRival.offset,
    receiver:squareRival.word,
    H_dsc:H3dsc(squareRival.word.values),
    p6YouHits:youHits(squareRival.word.values)
  },
  next:{sourceIndex:33,sourceWord:source[33],projectPage:33}
}, null, 2));
