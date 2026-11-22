"use strict";
/**
 * Source-fixed quartic GF29 running-key inverse from four original LP2
 * apostrophe-marked words. Node.js 22 / CommonJS / read-only SFT.
 *
 * The quartic is an exact factor of the 256-token original table, not
 * an authenticated instruction to use an LFSR. Apostrophe suffixes
 * are conditional English contraction cribs motivated by solved LP1.
 *
 * Four sparse suffix keys determine the complete four-state generator.
 * The other letters of the marked words are an independent original
 * ciphertext check; a planted full-length source-native positive
 * also validates 12,956-rune recovery when the model is actually true.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const json = p => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
const gp = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const mod = x => ((x % 29) + 29) % 29;
const ciphertext = gp.pages.filter(x => x.page <= 55).flatMap(x => x.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(grid.bytes.length, 256);
assert.equal(gp.pages[56].indices.length, 85);
assert.equal(gp.pages[57].indices.length, 95);

// The printed byte polynomial is read with first table byte as the
// highest coefficient; verify the same exact source-derived quartic
// F(x)=x^4+28x^3+13x^2+9x+14 before using its two directions.
let rem = [0,0,0,0];
for (const byte of grid.bytes) {
  const [a,b,c,d] = rem;
  rem = [mod(byte-14*d),mod(a-9*d),mod(b-13*d),mod(c-28*d)];
}
assert.deepEqual(rem,[0,0,0,0]);
const forward = [14,9,13,28];
const reciprocal = [27,2,3,11]; // monic reciprocal of F(x), inverse of 14 is 27
assert.equal(mod(14*27),1);
const specs = [
  {page:4,start:1107,words:"DONT CANT WONT AINT ISNT LETS GODS ONES MANS MENS SHED YOUD ALLS"},
  {page:21,start:5136,words:"ITS HES WED HED ITD DOS"},
  {page:35,start:8513,words:"ITS HES WED HED ITD DOS"},
  {page:41,start:10086,words:"DONT CANT WONT AINT ISNT LETS GODS ONES MANS MENS SHED YOUD ALLS"}
].map(s => {
  const names = s.words.split(" ");
  const glyphs = names.map(name => {
    const indices = [...name].map(x => {
      const found = gp.translit.indexOf(x);
      assert.ok(found >= 0);
      return found;
    });
    return {name,indices};
  });
  const suffix = s.start + glyphs[0].indices.length - 1;
  return {...s,candidates:glyphs,suffix};
});
assert.deepEqual(specs.map(s=>s.suffix),[1110,5138,8515,10089]);
assert.deepEqual(specs.map(s=>ciphertext.slice(s.start,s.suffix+1)),
  [[19,14,10,7],[25,3,26],[13,18,16],[14,20,11,5]]);
assert.deepEqual(specs.map(s=>s.page),[4,21,35,41]);
const rawWords = specs.map(s => ciphertext.slice(s.start,s.suffix+1));
const letterS = gp.translit.indexOf("S");
const letterD = gp.translit.indexOf("D");
const letterT = gp.translit.indexOf("T");
assert.deepEqual([letterS,letterD,letterT],[15,23,16]);

/**
 * GF29 inverse by exact augmented Gauss-Jordan elimination.
 * @param {number[][]} M
 * @returns {number[][]}
 */
function inverse4(M) {
  const n = 4;
  const a = M.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>+(i===j))));
  for (let col=0;col<n;col++) {
    let pivot=col;
    while(pivot<n && a[pivot][col]===0)pivot++;
    assert.ok(pivot<n,"the sparse four-site system must be full rank");
    [a[pivot],a[col]]=[a[col],a[pivot]];
    let inv=1;
    while(mod(a[col][col]*inv)!==1)inv++;
    for(let j=col;j<2*n;j++)a[col][j]=mod(a[col][j]*inv);
    for(let row=0;row<n;row++)if(row!==col){
      const mul=a[row][col];
      for(let j=col;j<2*n;j++)a[row][j]=mod(a[row][j]-mul*a[col][j]);
    }
  }
  const result=a.map(row=>row.slice(n));
  for(let i=0;i<n;i++)for(let j=0;j<n;j++)
    assert.equal(mod(M[i].reduce((sum,x,k)=>sum+x*result[k][j],0)),+(i===j));
  return result;
}

/**
 * Original fixed recurrence: k[t+4] = -sum(a[j]*k[t+j]) mod29.
 * @param {number[]} taps
 * @returns {number[][]} Rows of the four initial-state basis vectors.
 */
function basis(taps) {
  const b=Array.from({length:ciphertext.length},()=>[0,0,0,0]);
  for(let t=0;t<4;t++)b[t][t]=1;
  for(let t=4;t<b.length;t++)for(let j=0;j<4;j++)
    b[t][j]=mod(-taps.reduce((sum,a,k)=>sum+a*b[t-4+k][j],0));
  return b;
}
/** @param {number[]} coeff @param {number[]} seed @returns {number} */
function dot(coeff,seed) {
  return mod(coeff.reduce((sum,x,j)=>sum+x*seed[j],0));
}
/**
 * Determine all four initial key symbols from four sparse plaintext
 * apostrophe tails, without ever fitting the remaining ciphertext.
 * @param {number[]} text The original or planted entire GP29 cipher.
 * @param {number[]} suffixPlain Four proposed suffix plaintext symbols.
 * @param {number[][]} b Fixed polynomial's basis register.
 * @param {number[][]} inverse
 * @returns {number[]}
 */
function sparseKey(text,suffixPlain,b,inverse) {
  const observed=specs.map((s,i)=>mod(text[s.suffix]-suffixPlain[i]));
  return inverse.map(row=>dot(row,observed));
}
/** @param {number[]} text @param {number[]} key @param {number[][]} b @returns {number[]} */
function decode(text,key,b) {
  return text.map((c,i)=>mod(c-dot(b[i],key)));
}
/** @param {number[]} plaintext @returns {string[]} */
function markedWords(plaintext) {
  return specs.map(s=>plaintext.slice(s.start,s.suffix+1)
    .map(x=>gp.translit[x]).join(""));
}
/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const tally=Array(29).fill(0);
  for(const i of indices)tally[i]++;
  return tally.reduce((sum,n)=>sum+n*(n-1),0)/(indices.length*(indices.length-1));
}
const tests=[];
for(const [direction,taps] of [["F-forward",forward],["F-reciprocal",reciprocal]]) {
  const b=basis(taps);
  const inverse=inverse4(specs.map(s=>b[s.suffix]));
  const allSuffixes=[letterT,letterS,letterD];
  const matchCounts=[0,0,0,0,0];
  for(let mask=0;mask<81;mask++){
    let n=mask;
    const suffixPlain=specs.map(()=>{
      const q=n%3;n=Math.floor(n/3);return allSuffixes[q];
    });
    const key=sparseKey(ciphertext,suffixPlain,b,inverse);
    let matched=0;
    for(const s of specs) {
      const predicted=ciphertext.slice(s.start,s.suffix+1)
        .map((c,j)=>mod(c-dot(b[s.start+j],key)));
      const valid=s.candidates.some(w=>w.indices.every((v,j)=>v===predicted[j]));
      if(!valid)break;
      matched++;
    }
    matchCounts[matched]++;
  }
  assert.deepEqual(matchCounts,[81,0,0,0,0]);
  const fixedTKey=sparseKey(ciphertext,[letterT,letterT,letterT,letterT],b,inverse);
  const fixedTPlain=decode(ciphertext,fixedTKey,b);
  assert.deepEqual(specs.map(s=>fixedTPlain[s.suffix]),[16,16,16,16]);

  // True full-length positive: initialize every symbol with genuine
  // source clear-p57 runes, then plant four legal source-shaped words.
  // Decode from *only* four suffixes after reciphering with a secret
  // four-symbol seed. The planted key is invisible to sparseKey().
  const hidden=[3,7,11,19];
  const sourcePlain=Array.from({length:ciphertext.length},
    (_,i)=>gp.pages[57].indices[i%95]);
  const expectedWords=["DONT","ITS","HES","CANT"];
  for(let s=0;s<4;s++) {
    const selected=specs[s].candidates.find(x=>x.name===expectedWords[s]);
    assert.ok(selected);
    selected.indices.forEach((x,j)=>{sourcePlain[specs[s].start+j]=x;});
  }
  const planted=sourcePlain.map((p,i)=>mod(p+dot(b[i],hidden)));
  const plantedKey=sparseKey(planted,
    specs.map(s=>sourcePlain[s.suffix]),b,inverse);
  assert.deepEqual(plantedKey,hidden);
  const recovered=decode(planted,plantedKey,b);
  assert.deepEqual(recovered,sourcePlain);
  assert.deepEqual(markedWords(recovered),expectedWords);

  tests.push({
    direction,originalSuffixC:specs.map(s=>ciphertext[s.suffix]),
    actualSuffixPlainAssumption:"S/D/T, 3^4=81 complete choices",
    matchCounts,fullKeyLength:fixedTPlain.length,
    fourTDerivedKey:fixedTKey,
    fourTDecodedOriginalWords:markedWords(fixedTPlain),
    fourTWholeOriginalIoC:ioc(fixedTPlain),
    plantedKnownPlainRecovery:recovered.length,
    plantedSecretRecovered:plantedKey
  });
}

// Separate original-page-reset model: the marked plaintext word itself
// supplies consecutive key-state samples. Four-rune contractions fix all
// four states; three-rune contractions leave exactly one free GF29 state,
// exhaustively enumerated over all 29 choices before pagewide decoding.
/**
 * @param {number[]} text Source page cipher
 * @param {number} start Source-page-local contraction start
 * @param {number[]} guessed Complete conditional known contraction
 * @param {number[]} taps Original or reciprocal source quartic
 * @param {number|null} freeFourth Secret fourth key state after 3-rune crib
 * @returns {number[]} Decrypted whole original page
 */
function localInverse(text,start,guessed,taps,freeFourth) {
  assert.ok(guessed.length===3 || guessed.length===4);
  const k=Array(text.length).fill(0);
  for(let j=0;j<guessed.length;j++)k[start+j]=mod(text[start+j]-guessed[j]);
  if(guessed.length===3){
    assert.ok(Number.isInteger(freeFourth) && freeFourth>=0 && freeFourth<29);
    k[start+3]=freeFourth;
  }
  for(let t=start+4;t<k.length;t++)
    k[t]=mod(-taps.reduce((sum,a,j)=>sum+a*k[t-4+j],0));
  let inv=1;
  while(mod(inv*taps[0])!==1)inv++;
  for(let t=start-1;t>=0;t--)
    k[t]=mod(-(k[t+4]+taps[3]*k[t+3]+taps[2]*k[t+2]+taps[1]*k[t+1])*inv);
  return text.map((c,i)=>mod(c-k[i]));
}
const pageLocalResults=[];
for(const [direction,taps] of [["F-forward",forward],["F-reciprocal",reciprocal]]) {
  for(const spec of specs){
    const actual=gp.pages[spec.page].indices;
    const origin=gp.pages.filter(p=>p.page<spec.page).reduce((s,p)=>s+(p.indices?.length||0),0);
    const localStart=spec.start-origin;
    const hypotheses=[];
    for(const candidate of spec.candidates){
      const extras=candidate.indices.length===3
        ? Array.from({length:29},(_,x)=>x) : [null];
      for(const freeFourth of extras){
        const plaintext=localInverse(actual,localStart,candidate.indices,taps,freeFourth);
        assert.deepEqual(plaintext.slice(localStart,localStart+candidate.indices.length),
          candidate.indices);
        const untrained=plaintext.filter((_,i)=>i<localStart||i>=localStart+candidate.indices.length);
        hypotheses.push({word:candidate.name,freeFourth,ioc:ioc(untrained)});
      }
    }
    hypotheses.sort((a,b)=>b.ioc-a.ioc);
    assert.equal(hypotheses.length,spec.candidates[0].indices.length===3?174:13);
    assert.ok(hypotheses[0].ioc<0.04);
    pageLocalResults.push({direction,page:spec.page,modelCount:hypotheses.length,
      maxHeldoutIoC:hypotheses[0].ioc,bestGuessedWord:hypotheses[0].word,
      bestFreeFourth:hypotheses[0].freeFourth});

    // Blind source-native positive for every source page and both polynomials.
    const text=Array.from({length:actual.length},(_,i)=>gp.pages[57].indices[i%95]);
    const selected=spec.candidates[0];
    for(let j=0;j<selected.indices.length;j++)text[localStart+j]=selected.indices[j];
    const plantedKey=Array(actual.length).fill(0);
    [3,7,11,19].forEach((x,j)=>{plantedKey[j]=x;});
    for(let t=4;t<actual.length;t++)
      plantedKey[t]=mod(-taps.reduce((sum,a,j)=>sum+a*plantedKey[t-4+j],0));
    const cipher=text.map((x,i)=>mod(x+plantedKey[i]));
    const recovered=localInverse(cipher,localStart,selected.indices,taps,
      selected.indices.length===3?plantedKey[localStart+3]:null);
    assert.deepEqual(recovered,text);
  }
}
assert.equal(pageLocalResults.reduce((s,x)=>s+x.modelCount,0),748);

console.log(JSON.stringify({
  sourceTableQuartic:"X^4+28X^3+13X^2+9X+14",
  sourceTablePolynomialRemainder:rem,
  pageLocalAllSecretCandidateCount:748,
  pageLocalResults,
  sourceMarkedWords:["MXI'W","AEO'Y","PE'T","XLJ'C"],
  result:"No source-consistent S/D/T assignment yields even the first complete apostrophe word under either fixed quartic recurrence",
  tests
},null,2));
