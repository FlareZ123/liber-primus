"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const grid = corpus.pages.filter((page) => page.page <= 2).flatMap((page) => page.indices);
assert.equal(grid.length, 729);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

const state = Object.freeze({ p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3, q:4, one:1 });

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/** @param {number} n @returns {number} */
function phi(n) {
  let result=n, value=n;
  for (let prime=2; prime*prime<=value; prime+=1) {
    if (value%prime!==0) continue;
    while (value%prime===0) value/=prime;
    result-=result/prime;
  }
  if (value>1) result-=result/value;
  return result;
}

/** @param {number} n @returns {number} */
function mobius(n) {
  if (n===1) return 1;
  let value=n, factors=0;
  for (let prime=2; prime*prime<=value; prime+=1) {
    if (value%prime!==0) continue;
    value/=prime; factors+=1;
    if (value%prime===0) return 0;
    while (value%prime===0) value/=prime;
  }
  if (value>1) factors+=1;
  return factors%2===0 ? 1 : -1;
}

/** @param {number[]} packet @returns {{unrotated:number[],rotation:number,key:number[]}} */
function deriveKey(packet) {
  const unrotated=[packet[0],phi(packet[1]),packet[2]];
  const rotation=mod29(unrotated.reduce((sum,value)=>sum+mobius(phi(value)),0))%3;
  return {unrotated,rotation,key:unrotated.slice(rotation).concat(unrotated.slice(0,rotation))};
}

/** @param {number} row @param {number} column @returns {number} */
function cell(row,column) { return grid[(row-1)*27+column-1]; }

/** @param {string} source @returns {number[][]} */
function runeWords(source) {
  const out=[]; let current=[];
  for (const char of [...source]) {
    const value=runeIndex.get(char);
    if (value!==undefined) current.push(value);
    else if (current.length) { out.push(current); current=[]; }
  }
  if (current.length) out.push(current);
  return out;
}

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const values=[];
  for (let index=0; index<normalized.length;) {
    if (normalized.startsWith("ING",index)) { values.push(21); index+=3; continue; }
    if (normalized.startsWith("IO",index)) { values.push(27); index+=2; continue; }
    const token=gpTokens.find((candidate)=>normalized.startsWith(candidate.symbol,index));
    assert.ok(token,`unmapped GP spelling ${word} at ${index}`);
    values.push(token.value); index+=token.symbol.length;
  }
  return values;
}

const known=new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text)) {
    known.set(values.join(","),values.map((value)=>corpus.translit[value]).join(""));
  }
}
const signedClear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const sourceWords=signedClear.split(/[^A-Za-z0-9]+/u)
  .filter((word)=>/^[A-Za-z]+$/u.test(word)).map((word)=>word.toUpperCase());
for (const word of sourceWords) known.set(gpWord(word).join(","),word);

const directions=[["H",0,1],["V",1,0],["D1",1,1],["D2",1,-1]];
/** @param {number[]} target @returns {Array<{radius:number,axis:string,points:number[][],linear:number[]}>} */
function findExactTriples(target) {
  const hits=[];
  for (let radius=1; radius<=13; radius+=1) {
    for (const [axis,dr,dc] of directions) {
      for (let row=1; row<=27; row+=1) {
        for (let column=1; column<=27; column+=1) {
          const points=[[row,column],[row+radius*dr,column+radius*dc],[row+2*radius*dr,column+2*radius*dc]];
          if (points.some(([r,c])=>r<1||r>27||c<1||c>27)) continue;
          const values=points.map(([r,c])=>cell(r,c));
          if (values.every((value,index)=>value===target[index])) {
            hits.push({radius,axis,points,linear:points.map(([r,c])=>(r-1)*27+c-1)});
          }
        }
      }
    }
  }
  return hits;
}

// Reconstruct the exact block11 endpoint from state, independent of END text.
const block11Start=[state.B,state.p];
const block11End=[block11Start[0]+state.e-1,block11Start[1]];
assert.deepEqual(block11End,[21,23]);

const seed=[mod29(-state.B),state.q,mod29(-state.B)];
assert.deepEqual(seed,[10,4,10]);
const seedHits=findExactTriples(seed);
assert.deepEqual(seedHits,[{
  radius:1,
  axis:"H",
  points:[[21,21],[21,22],[21,23]],
  linear:[560,561,562],
}]);
assert.deepEqual(seedHits[0].points[2],block11End);
const center=seedHits[0].points[1];

const stateScalars=Object.entries(state);
const transitionHits=[];
for (const [outerName,outerScalar] of stateScalars) {
  for (const outerSign of [-1,1]) {
    const outer=mod29(seed[0]+outerSign*outerScalar);
    for (const [radiusName,radiusScalar] of stateScalars) {
      for (const radiusSign of [-1,1]) {
        const radius=1+radiusSign*radiusScalar;
        if (radius<1||radius>13) continue;
        const points=[[center[0],center[1]-radius],center,[center[0],center[1]+radius]];
        if (points.some(([r,c])=>r<1||r>27||c<1||c>27)) continue;
        const values=points.map(([r,c])=>cell(r,c));
        if (values[0]===outer&&values[1]===state.q&&values[2]===outer) {
          transitionHits.push({
            outerStep:`${outerSign<0?"-":"+"}${outerName}`,
            radiusStep:`${radiusSign<0?"-":"+"}${radiusName}`,
            outer,radius,points,values,
          });
        }
      }
    }
  }
}
assert.deepEqual(transitionHits,[{
  outerStep:"-K",
  radiusStep:"+q",
  outer:state.A,
  radius:state.g,
  points:[[21,17],[21,22],[21,27]],
  values:[state.A,state.q,state.A],
}]);
assert.equal(mod29(-state.B-state.K),state.A);
assert.equal(1+state.q,state.g);

const block12Packet=[state.A,state.q,state.A];
const block12Node=findExactTriples(block12Packet);
assert.deepEqual(block12Node,[{
  radius:state.g,
  axis:"H",
  points:[[21,17],[21,22],[21,27]],
  linear:[556,561,566],
}]);

const derived=deriveKey(block12Packet);
assert.deepEqual(derived,{unrotated:[8,2,8],rotation:1,key:[2,8,8]});

const row=block12Node[0].points[0][0];
assert.equal(row,21);
const rowLexeme=sourceWords[row];
assert.equal(rowLexeme,"IS");
const occurrences=sourceWords.map((word,index)=>word===rowLexeme?index:null).filter((index)=>index!==null);
assert.deepEqual(occurrences,[11,21]);

const pathTrials=[];
for (const occurrence of occurrences) {
  for (const relative of ["predecessors","successors"]) {
    const columns=relative==="predecessors"
      ? [occurrence-2,occurrence-1]
      : [occurrence+1,occurrence+2];
    if (columns.some((column)=>column<1||column>27)) continue;
    for (const order of [columns,columns.slice().reverse()]) {
      const coords=order.map((column)=>[row,column]);
      const cipher=coords.map(([r,c])=>cell(r,c));
      const plaintext=cipher.map((value,index)=>mod29(value-derived.key[index]));
      pathTrials.push({
        occurrence,relative,order,coords,cipher,plaintext,
        label:known.get(plaintext.join(","))||null,
      });
    }
  }
}
assert.equal(pathTrials.length,8);
assert.deepEqual(pathTrials.filter((trial)=>trial.label),[{
  occurrence:11,
  relative:"predecessors",
  order:[9,10],
  coords:[[21,9],[21,10]],
  cipher:[12,23],
  plaintext:[10,15],
  label:"IS",
}]);

const winner=pathTrials.find((trial)=>trial.label==="IS");
assert.ok(winner);
assert.deepEqual(sourceWords.slice(9,12),["LIBER","PRIMUS","IS"]);
assert.equal(state.B+state.K,21);
assert.equal(state.A+1,9);
assert.deepEqual(
  winner.plaintext.map((value,index)=>mod29(value+derived.key[index])),
  winner.cipher
);

console.log(JSON.stringify({
  status:"PASS",
  block11Endpoint:block11End,
  seed:{packet:seed,node:seedHits[0]},
  transition:transitionHits[0],
  block12:{packet:block12Packet,node:block12Node[0],key:derived},
  sourceSelector:{row,rowLexeme,occurrences,pathTrials},
  plaintext:"IS",
  scope:"exact local block12 inverse; no block13 rule claimed",
},null,2));
