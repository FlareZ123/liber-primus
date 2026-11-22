"use strict";
/**
 * Source-constrained p32 11x11 perimeter -> p33 9x9 black-body cipher key.
 * Standalone test: node sims/lp2_p32_inner9_p33_body81_source_sft.cjs
 *
 * Tests only source-fixed row-major and p15-style clockwise-outward spiral
 * readings of the *same* p32 inner 9x9; GP29 +/- additive inverse with zero
 * phase on the adjacent p33 body after its exact 10-rune red title.
 *
 * @module lp2_p32_inner9_p33_body81_source_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const original=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const alphabet=corpus.runes,translit=corpus.translit,runeSet=new Set(alphabet);
/** @param {string} s @returns {string} */
function sha1Blob(s){
  const b=Buffer.from(s,"utf8");
  return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
}
/** @param {string[]} a @returns {string} */
const latin=a=>a.map(ch=>translit[alphabet.indexOf(ch)]).join("");
/** @param {string[]} a @returns {number} */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const ch of a)counts[alphabet.indexOf(ch)]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {string[]} body @param {string[]} key @param {number} sign @returns {string[]} */
function transform(body,key,sign){
  assert.equal(body.length,key.length);
  return body.map((ch,i)=>alphabet[(
    alphabet.indexOf(ch)+sign*alphabet.indexOf(key[i])+58)%29]);
}
/** @param {string[][]} grid @returns {string[]} */
function outwardSpiral(grid){
  assert.equal(grid.length,9);
  let r=4,c=4,d=0,k=1;
  const result=[grid[r][c]],dirs=[[0,1],[1,0],[0,-1],[-1,0]];
  while(result.length<81){
    for(let part=0;part<2&&result.length<81;part++){
      const [dr,dc]=dirs[d%4];
      for(let i=0;i<k&&result.length<81;i++){
        r+=dr;c+=dc;
        assert.ok(r>=0&&r<9&&c>=0&&c<9);
        result.push(grid[r][c]);
      }
      d++;
    }
    k++;
  }
  assert.deepEqual([r,c],[0,8]);
  return result;
}
/** @param {number} seed @returns {()=>number} */
function rng32(seed){let s=seed>>>0;return ()=>{
  s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;
}}
function run(){
  assert.equal(sha1Blob(original),"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
  const all=[...original].filter(ch=>runeSet.has(ch));
  assert.equal(all.length,13136);
  const p32=all.slice(7839,7960),title=all.slice(7960,7970),
    body=all.slice(7970,8051);
  assert.equal(p32.length,121);
  assert.equal(title.length,10);
  assert.equal(body.length,81);
  const grid=Array.from({length:9},(_,r)=>
    p32.slice((r+1)*11+1,(r+1)*11+10));
  assert.ok(grid.every(row=>row.length===9));
  const key=grid.flat(),spiral=outwardSpiral(grid);
  assert.equal(key.length,81);
  const rim=p32.filter((ch,j)=>Math.floor(j/11)===0||
    Math.floor(j/11)===10||j%11===0||j%11===10);
  assert.equal(rim.length,40);
  const directMinus=transform(body,key,-1);
  const directPlus=transform(body,key,+1);
  const spiralMinus=transform(body,spiral,-1);
  const spiralPlus=transform(body,spiral,+1);
  assert.deepEqual(transform(directMinus,key,+1),body);
  assert.deepEqual(transform(directPlus,key,-1),body);
  assert.deepEqual(transform(spiralMinus,spiral,+1),body);
  assert.deepEqual(transform(spiralPlus,spiral,-1),body);
  assert.equal(ioc(directMinus),0.04197530864197531);
  assert.equal(ioc(directPlus),0.03209876543209877);
  assert.equal(ioc(spiralMinus),0.03425925925925926);
  assert.equal(ioc(spiralPlus),0.032407407407407406);
  const seed=0x20163301,random=rng32(seed),trials=20000;
  let ge=0,sum=0,min=Infinity,max=-Infinity;
  for(let q=0;q<trials;q++){
    const shuffled=key.slice();
    for(let i=shuffled.length-1;i>0;i--){
      const j=random()%(i+1);
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    const v=ioc(transform(body,shuffled,-1));
    if(v>=ioc(directMinus))ge++;
    sum+=v;min=Math.min(min,v);max=Math.max(max,v);
  }
  assert.equal(ge,455);
  const solved=all.slice(-85,-4);
  assert.equal(solved.length,81);
  const solvedMasked=transform(solved,key,+1);
  assert.deepEqual(transform(solvedMasked,key,-1),solved);
  const out={
    sourceGitBlob:sha1Blob(original),page32:{start:7839,end:7960,
      printedRunes:121,derivedSize:"11x11",outerBorder:rim.length,inner:grid.length+"x9"},
    page33:{title:[7960,7970],body:[7970,8051],titleRunes:10,bodyRunes:81},
    originalIoC:ioc(body),knownPlaintextControlIoC:ioc(solved),
    rowMajorCminusK:{ioc:ioc(directMinus),latin:latin(directMinus)},
    rowMajorCplusK:{ioc:ioc(directPlus),latin:latin(directPlus)},
    p15StyleSpiralCminusK:{ioc:ioc(spiralMinus),latin:latin(spiralMinus)},
    p15StyleSpiralCplusK:{ioc:ioc(spiralPlus),latin:latin(spiralPlus)},
    conditionalRowMinusShuffle:{trials,seed,geObserved:ge,
      plusOneTail:(ge+1)/(trials+1),nullMean:sum/trials,min,max},
    exactOriginalReencrypt:true,exactSolvedP57Plant:true,
    authenticUnknownPlaintextRecovered:false
  };
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module)run();
module.exports={run,outwardSpiral,transform,ioc};
