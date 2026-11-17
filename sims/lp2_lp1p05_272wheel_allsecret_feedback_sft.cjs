"use strict";

/**
 * All-secret, ciphertext-prime-feedback clock gate for the authentic
 * LP1 p05 printed number 272, with four source-fixed GP29 row histories.
 *
 * At each unknown LP2 ciphertext rune, row label is either the running
 * count of completed 272-prime-weight wheel turns modulo29 or the running
 * residue modulo29. The wheel consumes GP prime value of *prior published
 * cipher runes only*, so the full row path is visible before deciphering.
 * Two physically meaningful reset scopes: full book, nine visual chapters.
 *
 * Give the author an arbitrary secret 29-symbol substitution permutation
 * per row. Equal glyphs inside that row are preserved by every permutation
 * (29!) and do not depend on sign, initial alphabet, or key candidates.
 * This SFT tests the unchanged original ciphertext's conditional pairs
 * against independently source-native GP English windows under the SAME
 * frozen original-induced row history, so self-feedback does not generate
 * false favorable controls.
 *
 * Node22 CommonJS, no file writes, no network.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const lp1=read("resources/liber-primus/lp1-plaintext-reference.txt");
const p05=lp1.split("### 5")[1].split("### 6")[0];
assert.match(p05,/272\s+138\s+341\s+131\s+151/);
assert.match(p05,/151\s+131\s+341\s+138\s+272/);
assert.match(p05,/THE PRIMES ARE SACRED/);
assert.match(p05,/THE TOTIENT FUNCTION IS SACRED/);
const original=gp.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const N=29,MOD=272;
const chapterBegins=new Set([0,3,8,15,23,27,33,40,54]);
const token=gp.translit.map((s,i)=>({s:s.toLowerCase(),i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function toGP(text) {
  const x=text.toLowerCase().replace(/v/g,"u")
    .replace(/[kq]/g,"c").replace(/z/g,"s");
  const out=[];
  for(const word of x.match(/[a-z]+/g)||[]) {
    for(let i=0;i<word.length;) {
      if(word.startsWith("ing",i)) {out.push(21);i+=3;}
      else {
        const t=token.find(t=>word.startsWith(t.s,i));
        assert(t,"unknown reference rune");
        out.push(t.i);i+=t.s.length;
      }
    }
  }
  return out;
}
const reference=toGP(shakespeare);
assert.equal(reference.length,217644);
/**
 * @param {"wrap"|"residue"} kind
 * @param {"book"|"chapter"} reset
 * @returns {number[]}
 */
function wheel(kind,reset) {
  let residue=0,wrapCount=0;
  const row=[];
  for(let p=0;p<56;p++) {
    if(reset==="chapter"&&chapterBegins.has(p)) {
      residue=0;wrapCount=0;
    }
    for(const cipher of gp.pages[p].indices) {
      // Use the previous cipher-runic weights, never current/plaintext.
      row.push(kind==="wrap"?wrapCount%N:residue%N);
      const next=residue+gp.prime[cipher];
      if(next>=MOD) {
        residue=next-MOD;
        wrapCount++;
      } else residue=next;
    }
  }
  assert.equal(row.length,original.length);
  return row;
}
/** @param {number[]} text @param {number[]} rows */
function collision(text,rows) {
  const hist=Array.from({length:N},()=>Array(N).fill(0));
  const totals=Array(N).fill(0);
  for(let i=0;i<text.length;i++) {
    hist[rows[i]][text[i]]++;
    totals[rows[i]]++;
  }
  let same=0,total=0;
  for(let r=0;r<N;r++) {
    total+=totals[r]*(totals[r]-1);
    for(let c=0;c<N;c++) {
      const n=hist[r][c];
      same+=n*(n-1);
    }
  }
  return {same,total,scaledIoC:N*same/total};
}
const expected={
  "wrap/book":[198392,5783404,0.9948065187906637,1.66751,1.74769,1.80533],
  "wrap/chapter":[198192,5787356,0.9931250125273096,1.67142,1.75009,1.80576],
  "residue/book":[200022,5798966,1.0002883272638605,1.67586,1.75206,1.81453],
  "residue/chapter":[200228,5795742,1.0018755148176024,1.67414,1.75108,1.80945]
};
const results=[];
for(const kind of ["wrap","residue"])
for(const reset of ["book","chapter"]) {
  const rows=wheel(kind,reset);
  const observed=collision(original,rows);
  const native=[];
  for(let i=0;i<150;i++) {
    const offset=Math.floor(i*(reference.length-original.length)/149);
    const plain=reference.slice(offset,offset+original.length);
    native.push(collision(plain,rows).scaledIoC);
  }
  native.sort((a,b)=>a-b);
  const round=x=>Number(x.toFixed(5));
  const actual=[observed.same,observed.total,observed.scaledIoC,
    round(native[0]),round(native[75]),round(native.at(-1))];
  assert.deepEqual(actual,expected[kind+"/"+reset]);
  assert(observed.scaledIoC<native[0]);
  // Mathematical invariance control: arbitrary distinct row alphabets
  // cannot alter same-row equality or the conditional pair statistic.
  const permutations=Array.from({length:N},(_,r)=>
    Array.from({length:N},(_,i)=>(i*2+r)%N));
  const scrambled=original.map((v,i)=>permutations[rows[i]][v]);
  assert.deepEqual(collision(scrambled,rows),observed);
  results.push({sourceClock:kind,reset,
    originalConditionalIoC:observed.scaledIoC,
    originalSamePairs:observed.same,
    englishMinimum:native[0],englishMedian:native[75],
    englishMaximum:native.at(-1),all150EnglishHigher:true});
}
console.log(JSON.stringify({source:"LP1 p05 272 plus original GP prime weights",
  unknownOriginalRunes:original.length,results},null,2));
