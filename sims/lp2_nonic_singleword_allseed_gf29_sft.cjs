"use strict";
/**
 * All-secret original LP2 nonic GF29 linear pad at preserved one-rune words.
 *
 * Source: 83 source-printed single-rune words in original pp0–55, and exact
 * 2014 pp49–51 table's monic irreducible nonic GF29 factor. Native English
 * single-rune words use GP A/I/O, indices 24/10/3. Enumerate all 3^9
 * possible initial singleton plaintext assignments, determine all nine secret
 * nonic state symbols by GF29 elimination, and hold out the other singletons.
 *
 * Tested hypothesis: one continuous C_i = (P_i + K_i) mod 29 across all
 * original unsolved GP runes, where K has N9's exact 9-step recurrence.
 * Different state resets, a secret alphabet, and non-English plaintext
 * remain separate hypotheses. This test does not select those alternatives.
 *
 * Run: node sims/lp2_nonic_singleword_allseed_gf29_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const text=fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"),"utf8");
const mod=x=>((x%29)+29)%29;
const coeff=[1,12,20,10,5,1,9,0,15,11];
const source=c.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(source.length,12956);
const byRune=new Map(c.runes.map((r,i)=>[r,i]));
const wholeWords=[];
const scanned=[];
let wordStart=0,wordLength=0;
/** Flush complete printed whole word, preserving line/page carries. */
function flush(){
  if(wordLength)wholeWords.push({start:wordStart,length:wordLength});
  wordLength=0;
}
for(const ch of text){
  const symbol=byRune.get(ch);
  if(symbol!==undefined){
    if(wordLength===0)wordStart=scanned.length;
    wordLength++;
    scanned.push(symbol);
  }else if("-.&$§".includes(ch))flush();
}
flush();
assert.deepEqual(scanned.slice(0,source.length),source);
assert.equal(wholeWords.filter(w=>w.start<source.length).length,2896);
const singles=wholeWords.filter(w=>w.start<source.length&&w.length===1)
  .map(w=>w.start);
assert.equal(singles.length,83);
assert.ok(singles.at(-1)<source.length);

/**
 * Assert source polynomial is an exact table factor in descending orientation.
 * @param {number[]} data
 * @returns {number[]}
 */
function remainder(data){
  const work=data.map(x=>mod(x));
  for(let i=0;i<=work.length-coeff.length;i++){
    const a=work[i];
    for(let j=0;j<coeff.length;j++)
      work[i+j]=mod(work[i+j]-a*coeff[j]);
  }
  return work.slice(-(coeff.length-1));
}
const table=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"),"utf8"));
const bytes=table.rows.flat().map(s=>
  table.alphabet.indexOf(s[0])*60+table.alphabet.indexOf(s[1]));
assert.equal(bytes.length,256);
assert.deepEqual(remainder(bytes),Array(9).fill(0));

/** Every i-th row is the exact GF29 coefficient vector for K[i]. */
const basis=Array.from({length:source.length},()=>new Uint8Array(9));
for(let i=0;i<9;i++)basis[i][i]=1;
for(let i=9;i<basis.length;i++){
  for(let j=0;j<9;j++){
    let sum=0;
    for(let k=1;k<=9;k++)sum+=coeff[k]*basis[i-k][j];
    basis[i][j]=mod(-sum);
  }
}
/** @param {number[][]} matrix */
function rank(matrix){
  const a=matrix.map(row=>row.slice());
  let col=0,r=0;
  while(col<9&&r<a.length){
    let pivot=r;
    while(pivot<a.length&&a[pivot][col]===0)pivot++;
    if(pivot===a.length){col++;continue;}
    [a[r],a[pivot]]=[a[pivot],a[r]];
    for(let i=r+1;i<a.length;i++){
      if(!a[i][col])continue;
      const scale=a[i][col]*inverse(a[r][col])%29;
      for(let j=col;j<9;j++)a[i][j]=mod(a[i][j]-scale*a[r][j]);
    }
    r++;col++;
  }
  return r;
}
/** @param {number} a */
function inverse(a){
  assert.ok(a>0&&a<29);
  for(let i=1;i<29;i++)if(a*i%29===1)return i;
  throw Error("noninvertible");
}
/** @param {number[][]} matrix */
function invert9(matrix){
  assert.equal(matrix.length,9);
  const a=matrix.map((row,i)=>
    row.concat(Array.from({length:9},(_,j)=>+(i===j))));
  for(let j=0;j<9;j++){
    let p=j;
    while(p<9&&a[p][j]===0)p++;
    assert.ok(p<9,"rank deficient");
    [a[j],a[p]]=[a[p],a[j]];
    const k=inverse(a[j][j]);
    for(let t=0;t<18;t++)a[j][t]=a[j][t]*k%29;
    for(let i=0;i<9;i++){
      if(i===j)continue;
      const q=a[i][j];
      for(let t=0;t<18;t++)a[i][t]=mod(a[i][t]-q*a[j][t]);
    }
  }
  return a.map(row=>row.slice(9));
}
const anchor=[];
for(const pos of singles){
  const proposal=anchor.concat(pos);
  if(rank(proposal.map(i=>Array.from(basis[i])))>anchor.length)
    anchor.push(pos);
  if(anchor.length===9)break;
}
assert.equal(anchor.length,9);
const inv9=invert9(anchor.map(i=>Array.from(basis[i])));
/** @param {number} pos @param {number[]} seed */
function pad(pos,seed){
  let value=0;
  for(let k=0;k<9;k++)value+=basis[pos][k]*seed[k];
  return value%29;
}
/**
 * @param {number[]} cipher
 * @returns {{bestMatch:number,fullMatches:number,first9:number[],bestSeed:number[],
 *    bestPlain:string,winningSeed:number[]|null}}
 */
function solve(cipher){
  assert.equal(cipher.length,source.length);
  const allowed=[24,10,3];
  let bestMatch=-1,fullMatches=0,bestSeed=[],winningSeed=null;
  let bestPlain="";
  for(let num=0;num<19683;num++){
    let n=num;
    const rhs=new Array(9);
    for(let i=0;i<9;i++){
      rhs[i]=mod(cipher[anchor[i]]-allowed[n%3]);
      n=Math.floor(n/3);
    }
    const seed=inv9.map(row=>{
      let x=0;
      for(let i=0;i<9;i++)x+=row[i]*rhs[i];
      return x%29;
    });
    let matches=0;
    const letters=[];
    for(const pos of singles){
      const plain=mod(cipher[pos]-pad(pos,seed));
      if(plain===24||plain===10||plain===3)matches++;
      letters.push(c.translit[plain]);
    }
    if(matches>bestMatch){
      bestMatch=matches;bestSeed=seed;
      bestPlain=letters.join(",");
    }
    if(matches===singles.length){
      fullMatches++;winningSeed=seed;
    }
  }
  return {bestMatch,fullMatches,first9:anchor,
    bestSeed,bestPlain,winningSeed};
}
// Synthetic control preserves the exact original singleton positions and
// proves that the full 29^9 hidden-state family is covered by 3^9 guesses.
const trueSeed=[4,1,7,2,9,5,11,3,6];
const gp57=c.pages[57].indices;
const planted=Array.from({length:source.length},(_,i)=>gp57[i%gp57.length]);
for(let i=0;i<singles.length;i++)planted[singles[i]]=[24,10,3][i%3];
const cryptogram=planted.map((p,i)=>mod(p+pad(i,trueSeed)));
const control=solve(cryptogram);
assert.equal(control.bestMatch,83);
assert.ok(control.fullMatches>=1);
assert.deepEqual(control.winningSeed,trueSeed);
const original=solve(source);
assert.ok(original.bestMatch<83,
  "Unexpected all-83 fit: inspect original seed immediately");
console.log(JSON.stringify({
  originalSource:"LP2 pp0-55, 12956 runes and 83 one-rune whole words",
  nonicDescendingCoefficients:coeff,
  sourceTableFactorRemainder:Array(9).fill(0),
  anchorPositions:anchor,
  assignmentsTested:19683,
  possibleUnknownKeys:29**9,
  singleRuneAllowedGP:["A","I","O"],
  plantedControl:{maxMatches:control.bestMatch,
    exactKeys:control.fullMatches,recoveredSeed:control.winningSeed},
  original:{maxMatches:original.bestMatch,
    of:singles.length,matchingStates:original.fullMatches,
    bestSeed:original.bestSeed,bestSingleRuneReadout:original.bestPlain},
  decision:"No book-continuous additive GF29 nonic key, among all 29^9 " +
    "secret initial states, maps every original printed one-rune word to A/I/O."
},null,2));
