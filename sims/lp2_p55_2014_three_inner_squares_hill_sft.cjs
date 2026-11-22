#!/usr/bin/env node
"use strict";

/**
 * Source-locked LP2 p55 original-input 2014 squares Hill inverse.
 *
 * The historically available 2014 5x5/7x7/5x5 matrices have interiors
 * 3x3/5x5/3x3, hence 9+25+9=43 cells exactly matching the original 43 strict
 * word interiors on physical LP2 p55. Test both raw matrices and a distinct
 * source-motivated variant applying Euler phi to each interior cell before
 * reduction mod29. Use each matrix family as three successive Hill keys.
 * For each block
 * preserve printed row grouping and test only historical conventional
 * column-vector and row-vector formulations. No phase, permutation,
 * offset, seed, second operation, key fitting, or padding.
 *
 * From repository root: node sims/lp2_p55_2014_three_inner_squares_hill_sft.cjs
 * Status: bounded raw and totient-transformed direct inverse negatives; NOT plaintext recovery.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalTranscription = read("resources/liber-primus/lp2-transcription.txt");
const historicalSquares = read("resources/cicada2014-openpuff-magic-squares.txt");

const words = originalTranscription.split("%")[54].replace(/\/\s*/g,"")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const lengths = words.map(word => [...word].length);
assert.deepEqual(lengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const cipher = words.flatMap(word => [...word].slice(1,-1))
  .map(rune => corpus.runes.indexOf(rune));
assert.equal(cipher.length,43);
assert.ok(cipher.every(x=>x>=0 && x<29));

const squares = historicalSquares.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(matrix=>matrix.length),[5,7,5]);
for(const a of squares)assert.ok(a.every(row=>row.length===a.length));
const inner = squares.map(a=>a.slice(1,-1)
  .map(row=>row.slice(1,-1).map(v=>v%29)));
assert.deepEqual(inner.map(a=>a.length),[3,5,3]);
assert.equal(inner.reduce((s,a)=>s+a.length*a.length,0),43);
const mod = n => ((n%29)+29)%29;
function phi(n){
  let remaining=n;
  let result=n;
  for(let p=2;p*p<=remaining;p+=1){
    if(remaining%p===0){
      while(remaining%p===0)remaining/=p;
      result-=result/p;
    }
  }
  if(remaining>1)result-=result/remaining;
  return result;
}
const innerPhi=squares.map(a=>a.slice(1,-1)
  .map(row=>row.slice(1,-1).map(v=>mod(phi(v)))));
assert.deepEqual(innerPhi.map(a=>a.length),[3,5,3]);
assert.equal(innerPhi.reduce((sum,a)=>sum+a.length*a.length,0),43);

/** @param {number[][]} a @param {number[][]} b */
function multiply(a,b) {
  assert.equal(a[0].length,b.length);
  return a.map(row=>b[0].map((_,j)=>
    mod(row.reduce((sum,v,k)=>sum+v*b[k][j],0))));
}
/** @param {number[][]} a */
function inverse(a){
  const n=a.length;
  const m=a.map((row,i)=>[
    ...row.map(mod),
    ...Array.from({length:n},(_,j)=>Number(i===j))
  ]);
  let determinant=1;
  for(let col=0;col<n;col++){
    const pivot=m.findIndex((row,i)=>i>=col && row[col]!==0);
    assert.ok(pivot>=col, "Source interior must be invertible in GF29");
    if(pivot!==col){
      [m[pivot],m[col]]=[m[col],m[pivot]];
      determinant=mod(-determinant);
    }
    const lead=m[col][col];
    determinant=mod(determinant*lead);
    let leadInverse;
    for(let i=1;i<29;i++)if(mod(i*lead)===1){leadInverse=i;break}
    assert.ok(leadInverse);
    m[col]=m[col].map(v=>mod(v*leadInverse));
    for(let r=0;r<n;r++){
      if(r===col)continue;
      const factor=m[r][col];
      m[r]=m[r].map((v,k)=>mod(v-factor*m[col][k]));
    }
  }
  return {determinant,matrix:m.map(row=>row.slice(n))};
}
const inverseInfo=inner.map(inverse);
assert.deepEqual(inverseInfo.map(k=>k.determinant),[24,8,24]);
const inversePhiInfo=innerPhi.map(inverse);
assert.deepEqual(inversePhiInfo.map(k=>k.determinant),[14,27,26]);
assert.deepEqual(innerPhi,[
  [[17,2,9],[8,25,8],[9,2,17]],
  [[19,6,17,2,13],[25,23,7,24,22],[19,14,11,14,19],[22,24,7,23,25],[13,2,17,6,19]],
  [[24,19,12],[23,14,23],[12,19,24]]
]);
for(let s=0;s<inner.length;s++){
  const n=inner[s].length;
  const eye=Array.from({length:n},(_,i)=>
    Array.from({length:n},(_,j)=>Number(i===j)));
  assert.deepEqual(multiply(inner[s],inverseInfo[s].matrix),eye);
  assert.deepEqual(multiply(inverseInfo[s].matrix,inner[s]),eye);
}

/**
 * @param {"row"|"column"} orientation
 * @param {number[]} data
 * @param {boolean} encrypt
 */
function transform(orientation,data,encrypt){
  assert.equal(data.length,43);
  const output=[];
  let at=0;
  for(let s=0;s<inner.length;s++){
    const n=inner[s].length;
    const matrix=encrypt ? inner[s] : inverseInfo[s].matrix;
    for(let k=0;k<n;k++){
      const vector=data.slice(at,at+n);
      assert.equal(vector.length,n);
      const transformed=orientation==="column"
        ? multiply(matrix,vector.map(x=>[x])).map(row=>row[0])
        : multiply([vector],matrix)[0];
      output.push(...transformed);
      at+=n;
    }
  }
  assert.equal(at,43);
  return output;
}
/** @param {number[]} data */
function ioc(data){
  const counts=new Uint16Array(29);
  for(const v of data)counts[v]++;
  return Array.from(counts).reduce((sum,n)=>sum+n*(n-1),0)/(data.length*(data.length-1));
}
function transformPhi(orientation,data,encrypt){
  assert.equal(data.length,43);
  const output=[];
  let at=0;
  for(let s=0;s<innerPhi.length;s++){
    const n=innerPhi[s].length;
    const matrix=encrypt ? innerPhi[s] : inversePhiInfo[s].matrix;
    for(let k=0;k<n;k++){
      const vector=data.slice(at,at+n);
      assert.equal(vector.length,n);
      const transformed=orientation==="column"
        ? multiply(matrix,vector.map(x=>[x])).map(row=>row[0])
        : multiply([vector],matrix)[0];
      output.push(...transformed);
      at+=n;
    }
  }
  assert.equal(at,43);
  return output;
}
const plain={};
const plainPhi={};
for(const orientation of ["column","row"]){
  const decoded=transform(orientation,cipher,false);
  assert.deepEqual(transform(orientation,decoded,true),cipher);
  plain[orientation]=decoded;
  const decodedPhi=transformPhi(orientation,cipher,false);
  assert.deepEqual(transformPhi(orientation,decodedPhi,true),cipher);
  plainPhi[orientation]=decodedPhi;
}
const originalRunes=corpus.translit.map((g,index)=>({g,index}));
const tokenize=originalRunes.map(x=>({token:x.g.toUpperCase(),index:x.index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text */
function encodeWord(text) {
  const str=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
  const result=[];
  for(let at=0;at<str.length;){
    const match=tokenize.find(x=>str.startsWith(x.token,at));
    if(!match)return null;
    result.push(match.index);
    at+=match.token.length;
  }
  return result;
}
const sourceFiles=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const sources=sourceFiles.map(([name,file])=>({
  name,
  words:(read(file).match(/[A-Za-z]+/g)||[])
    .map(encodeWord).filter(Boolean)
}));
const pairs=Array.from({length:29},()=>new Uint32Array(29));
const starts=new Uint32Array(29);
for(const w of sources[0].words){
  for(let j=1;j<w.length;j++){
    pairs[w[j-1]][w[j]]++;
    starts[w[j-1]]++;
  }
}
const logProb=pairs.map((row,i)=>Array.from(row,v=>
  Math.log((v+0.25)/(starts[i]+29*0.25))));
/** @param {number[]} data */
function interiorBigramScore(data){
  assert.equal(data.length,43);
  let at=0,logSum=0,bigramCount=0;
  for(const length of lengths){
    const n=Math.max(0,length-2);
    const part=data.slice(at,at+n);
    for(let k=1;k<part.length;k++){
      logSum+=logProb[part[k-1]][part[k]];
      bigramCount++;
    }
    at+=n;
  }
  assert.equal(at,43);
  assert.equal(bigramCount,32);
  return logSum/bigramCount;
}
const originalScore=interiorBigramScore(cipher);
const decodedScore=Object.fromEntries(
  Object.entries(plain).map(([key,value])=>[key,interiorBigramScore(value)]));
const phiDecodedScore=Object.fromEntries(
  Object.entries(plainPhi).map(([key,value])=>[key,interiorBigramScore(value)]));
assert.ok(Math.abs(originalScore+6.341504871710818)<1e-8);
assert.ok(Math.abs(decodedScore.column+5.807567035994547)<1e-8);
assert.ok(Math.abs(decodedScore.row+5.85177719103807)<1e-8);
assert.ok(Math.abs(phiDecodedScore.column+5.32806184370589)<1e-8);
assert.ok(Math.abs(phiDecodedScore.row+6.93439190479688)<1e-8);
assert.ok(Math.abs(ioc(cipher)-62/1806)<1e-12);
assert.ok(Math.abs(ioc(plain.column)-68/1806)<1e-12);
assert.ok(Math.abs(ioc(plain.row)-70/1806)<1e-12);
assert.ok(Math.abs(ioc(plainPhi.column)-80/1806)<1e-12);
assert.ok(Math.abs(ioc(plainPhi.row)-72/1806)<1e-12);

let seed=0x45001113;
/** @returns {number} */
function random32(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const controls=[];
for(const {name,words:sourceWords} of sources){
  const buckets=Array.from({length:32},()=>[]);
  for(const word of sourceWords)if(word.length<32)buckets[word.length].push(word);
  for(const n of new Set(lengths))assert.ok(buckets[n].length>0);
  let min=Infinity,max=-Infinity,mean=0;
  const atOrBelow={rawColumn:0,rawRow:0,phiColumn:0,phiRow:0};
  const trials=20000;
  for(let i=0;i<trials;i++){
    const plant=[];
    for(const n of lengths){
      const bin=buckets[n];
      plant.push(...bin[random32()%bin.length].slice(1,-1));
    }
    assert.equal(plant.length,43);
    const value=interiorBigramScore(plant);
    min=Math.min(min,value);
    max=Math.max(max,value);
    mean+=value;
    if(value<=decodedScore.column)atOrBelow.rawColumn++;
    if(value<=decodedScore.row)atOrBelow.rawRow++;
    if(value<=phiDecodedScore.column)atOrBelow.phiColumn++;
    if(value<=phiDecodedScore.row)atOrBelow.phiRow++;
    if(i===0){
      // Complete synthetic source-native positive control in each convention.
      for(const dir of ["column","row"]){
        const encrypted=transform(dir,plant,true);
        assert.deepEqual(transform(dir,encrypted,false),plant);
        assert.ok(Math.abs(interiorBigramScore(
          transform(dir,encrypted,false))-value)<1e-12);
        const encryptedPhi=transformPhi(dir,plant,true);
        assert.deepEqual(transformPhi(dir,encryptedPhi,false),plant);
        assert.ok(Math.abs(interiorBigramScore(
          transformPhi(dir,encryptedPhi,false))-value)<1e-12);
      }
    }
  }
  controls.push({
    name,trials,min,max,mean:mean/trials,
    atOrBelow
  });
}
assert.deepEqual(controls.map(c=>Object.values(c.atOrBelow)),[
  [0,0,0,0],[0,0,0,0],[0,0,0,0]
]);
for(const row of controls)assert.ok(row.min>-3.6);
const gp=data=>data.map(i=>corpus.translit[i]).join(".");
console.log(JSON.stringify({
  status:"bounded original-source raw and totient-transformed 43-core Hill inverse negatives; no plaintext",
  sourceHistoricalSquareOrders:[5,7,5],
  sourceMatrixInteriorOrders:[3,5,3],
  originalInteriorRunes:43,
  rawSourceMatricesDeterminantsGF29:inverseInfo.map(x=>x.determinant),
  totientCoreMatricesGF29:innerPhi,
  totientCoreDeterminantsGF29:inversePhiInfo.map(x=>x.determinant),
  original:{ioc:ioc(cipher),intraWordBigramLog:originalScore},
  rawColumn:{runes:gp(plain.column),ioc:ioc(plain.column),
    intraWordBigramLog:decodedScore.column,exactForwardReencryption:43},
  rawRow:{runes:gp(plain.row),ioc:ioc(plain.row),
    intraWordBigramLog:decodedScore.row,exactForwardReencryption:43},
  totientColumn:{runes:gp(plainPhi.column),ioc:ioc(plainPhi.column),
    intraWordBigramLog:phiDecodedScore.column,exactForwardReencryption:43},
  totientRow:{runes:gp(plainPhi.row),ioc:ioc(plainPhi.row),
    intraWordBigramLog:phiDecodedScore.row,exactForwardReencryption:43},
  languageControls:controls,
  sourceNativePositiveControl:"43/43 symbols recovered for raw and totient-transformed matrices in both conventions",
  scope:"Original 43 strict p55 word interiors, source-ordered 3x3/5x5/3x3 cores, raw and cellwise Euler-phi mod29 Hill keys, conventional row/column inverse; no fitted phase or permutation."
},null,2));
console.log("SFT PASS: original sources, raw/phi matrix inverses, 43/43 forward replay and planted controls, 60,000 matched native-language controls.");
