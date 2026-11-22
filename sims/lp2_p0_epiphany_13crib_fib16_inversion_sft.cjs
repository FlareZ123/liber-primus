"use strict";

/**
 * Exact conditional p0 13-rune EPIPHANY SEEKS crib plus 2 authentic singleton
 * positions under a GF29 lag-(5,16) stream, with all 29 remaining seed
 * values exhaustively enumerated.
 *
 * Candidate plaintext heading and linear stream are hypotheses, not
 * authenticated original ciphertext instructions. Decodes all 262 p0 runes,
 * excludes the one-rune page-end fragment carried onto p1 from whole-word
 * scoring, and calibrates 56 complete p0 words against original clear LP1.
 *
 * Windows 11: node sims/lp2_p0_epiphany_13crib_fib16_inversion_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname,"..");
const read = f => fs.readFileSync(path.join(base,f),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const src = read("resources/liber-primus/lp2-transcription.txt");
const master = read("resources/transcriptions/liber_primus_master.txt");
const lookup = new Map(corpus.runes.map((r,i)=>[r,i]));
const mod = x => ((x%29)+29)%29;
const title = [18,13,10,13,8,24,9,26,15,18,18,5,15];
const p15 = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516].map(mod);
const originalP0 = corpus.pages.find(p=>p.page===0).indices;
assert.equal(title.map(i=>corpus.translit[i]).join(""),"EPIPHANYSEECS");

/**
 * Keep words carried across physical pages. Physical p50 is rune-free and
 * absent from this older transcription; the p0 two observations predate it.
 * @returns {{all:number[][],p0:number[][],observed:{at:number,c:number}[]}}
 */
function wordSource(){
  const pieces=src.split("%").slice(0,55);
  assert.equal(pieces.length,55);
  /** @type {{at:number,c:number,page:number}[][]} */
  const words=[];
  /** @type {{at:number,c:number,page:number}[]} */
  let current=[];
  let page=0,absolute=0;
  const finish=()=>{if(current.length){words.push(current);current=[];}};
  for(const ch of pieces.join("%")){
    const x=lookup.get(ch);
    if(x!==undefined){
      current.push({at:absolute,c:x,page:page>=50?page+1:page});
      absolute++;
    }else if(ch==="%")page++;
    else if(ch!=="/"&&!/\s/u.test(ch))finish();
  }
  finish();
  assert.equal(absolute,12956);
  assert.equal(words.length,2896);
  assert.equal(words.filter(w=>new Set(w.map(r=>r.page)).size>1).length,32);
  const one=words.filter(w=>w.length===1&&w[0].page===0).map(w=>w[0]);
  assert.deepEqual(one.map(w=>w.at),[176,244]);
  const physicalWords=pieces[0].split(/[-.&$§]/u)
    .map(v=>Array.from(v).filter(ch=>lookup.has(ch)).map(ch=>lookup.get(ch)))
    .filter(v=>v.length>0);
  assert.equal(physicalWords.length,59);
  assert.deepEqual(physicalWords.flat(),originalP0);
  assert.deepEqual(physicalWords.slice(0,2).map(w=>w.length),[8,5]);
  // The 59th item is one rune carried onto p1, and is not a complete word.
  assert.equal(physicalWords.at(-1).length,1);
  return {all:words.map(w=>w.map(r=>r.c)),p0:physicalWords,observed:one.map(({at,c})=>({at,c}))};
}

/** @param {number} a @returns {number} */
function inverse(a){
  for(let x=1;x<29;x++)if(mod(a*x)===1)return x;
  throw Error("pivot is zero in GF29");
}

/** @returns {number[][]} */
function coefficients(){
  const r=Array.from({length:16},(_,n)=>Array.from({length:16},(_,j)=>Number(n===j)));
  for(let n=16;n<originalP0.length;n++){
    r.push(Array.from({length:16},(_,j)=>mod(r[n-5][j]+r[n-16][j])));
  }
  return r;
}

/** @param {number[]} seed @returns {number[]} */
function stream(seed){
  const v=seed.slice();
  for(let n=16;n<originalP0.length;n++)v.push(mod(v[n-5]+v[n-16]));
  return v;
}

/** @param {number[]} plain @param {number[]} key @param {string} mode @returns {number[]} */
function enc(plain,key,mode){
  let prev=0;
  return plain.map((p,n)=>{
    const c=mode==="add"?mod(p+key[n]):mod(prev+p-key[n]);
    prev=c;return c;
  });
}

/** @param {number[]} cipher @param {number[]} key @param {string} mode @returns {number[]} */
function dec(cipher,key,mode){
  return cipher.map((c,n)=>mode==="add"?mod(c-key[n]):mod(c-(n?cipher[n-1]:0)+key[n]));
}

/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);a.forEach(x=>f[x]++);
  return f.reduce((v,x)=>v+x*(x-1),0)/(a.length*(a.length-1));
}

const common = new Set([
  "THE","AND","OF","TO","IS","IN","THAT","WE","YOU","BE","ARE","NOT",
  "I","A","IT","AN","AS","ON","BY","FOR","WITH","THIS","OUR","WHO",
  "WILL","HAVE","HE","SHE","THEY","BUT","FROM","THERE","DO","WHAT",
  "CAN","WHEN","IF","THEN","ALL","THEIR","YOUR","ONE","SO"
]);
const gpWord = a => a.map(i=>corpus.translit[i]).join("");
const wordHits = words => words.filter(w=>common.has(gpWord(w))).length;

/** @returns {number[][]} */
function clearLP1Controls(){
  const pages=master.split("%");
  assert.ok(pages.length>=16);
  // Original LP1 pages 9-12 have entirely clear GP rune prose; adjacent
  // pages 5-8 are encrypted and must NOT be used as language controls.
  const source=pages.slice(9,13);
  const result=source.flatMap(text=>text.split(/[-.&$§]/u)
    .map(item=>Array.from(item).filter(ch=>lookup.has(ch)).map(ch=>lookup.get(ch)))
    .filter(w=>w.length>0));
  assert.deepEqual(result.slice(0,5).map(gpWord),["THE","LOSS","OF","DIUINITY","THE"]);
  assert.ok(result.length>170);
  return result;
}

/**
 * Exhaustively solve 13 fixed key values from the candidate heading and 2
 * GF29 equations from true p0 singleton plaintext A/I; one free GF29 digit.
 * @param {number[]} cipher @param {string} mode @param {{at:number,c:number}[]} observed
 * @returns {{plain:number[],key:number[],singletons:number[]}[]}
 */
function decodeAll(cipher,mode,observed){
  const basis=coefficients();
  const fixed=title.map((p,n)=>mode==="add"?mod(cipher[n]-p):
    mod((n?cipher[n-1]:0)+p-cipher[n]));
  const rows=observed.map(o=>({
    at:o.at, tail:basis[o.at].slice(13),
    used:mod(basis[o.at].slice(0,13).reduce((v,x,j)=>v+x*fixed[j],0))
  }));
  let piv=null;
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
    const determinant=mod(rows[0].tail[i]*rows[1].tail[j]-rows[1].tail[i]*rows[0].tail[j]);
    if(determinant&&!piv)piv={i,j,determinant};
  }
  assert.ok(piv,"two original observations have zero rank");
  const {i,j,determinant}=piv;
  const k=[0,1,2].find(x=>x!==i&&x!==j);
  assert.ok(k!==undefined);
  const di=inverse(determinant),out=[];
  for(const first of [24,10])for(const second of [24,10])for(let free=0;free<29;free++){
    const t=[first,second].map((p,h)=>{
      const previous=rows[h].at?cipher[rows[h].at-1]:0;
      const value=mode==="add"?mod(cipher[rows[h].at]-p):mod(previous+p-cipher[rows[h].at]);
      return mod(value-rows[h].used-rows[h].tail[k]*free);
    });
    const x=mod((t[0]*rows[1].tail[j]-t[1]*rows[0].tail[j])*di);
    const y=mod((rows[0].tail[i]*t[1]-rows[1].tail[i]*t[0])*di);
    const seed=[...fixed,0,0,0];
    seed[13+i]=x;seed[13+j]=y;seed[13+k]=free;
    const plain=dec(cipher,stream(seed),mode);
    assert.deepEqual(plain.slice(0,title.length),title);
    assert.equal(plain[observed[0].at],first);
    assert.equal(plain[observed[1].at],second);
    assert.deepEqual(enc(plain,stream(seed),mode),cipher);
    out.push({plain,key:seed,singletons:[first,second]});
  }
  assert.equal(out.length,116);
  assert.equal(new Set(out.map(c=>c.key.join(","))).size,116);
  return out;
}

/** @param {number[]} plain @param {number[][]} originalWords @returns {number[][]} */
function splitP0(plain,originalWords){
  let n=0;
  return originalWords.map(w=>{
    const sliced=plain.slice(n,n+w.length);n+=w.length;return sliced;
  });
}

function main(){
  const {p0,observed}=wordSource();
  const controls=clearLP1Controls();
  const sizes=p0.slice(2,-1).length;
  assert.equal(sizes,56);
  const nativeWordHit=[];
  for(let i=0;i+sizes<=controls.length;i++)nativeWordHit.push(wordHits(controls.slice(i,i+sizes)));
  nativeWordHit.sort((a,b)=>a-b);
  console.log("SOURCE p0: 262 runes, 8+5 candidate red heading, two true singleton words at positions 176 and 244, 56 remaining complete words, one carried final fragment");
  console.log("NATIVE LP1 clear pp9-12: "+controls.length+" words, matched "+sizes+"-word intervals "+nativeWordHit.length+
    ", minimum/median/max source common words "+nativeWordHit[0]+"/"+nativeWordHit[Math.floor(nativeWordHit.length/2)]+"/"+nativeWordHit.at(-1));
  console.log("CONDITIONAL assumption: first13 p0 plaintext EPIPHANY SEEKS under GP translit, following true singletons are A or I, 5/16 GF29 recurrence");
  for(const mode of ["add","diff"]){
    const candidates=decodeAll(originalP0,mode,observed);
    const scored=candidates.map(x=>{
      const complete=splitP0(x.plain,p0).slice(2,-1);
      return {...x,wordHits:wordHits(complete),ioc:ioc(x.plain.slice(13)),sample:complete.slice(0,12).map(gpWord).join(" ")};
    });
    scored.sort((a,b)=>b.wordHits-a.wordHits||b.ioc-a.ioc);
    const best=scored[0];
    const bestIoC=Math.max(...scored.map(v=>v.ioc));
    console.log("ORIGINAL "+mode+": 4 A/I singleton choices x29 free states = "+candidates.length+
      " complete original reversals; best fixed-common-word hits "+best.wordHits+"/"+sizes+
      ", best body IoC "+bestIoC.toFixed(6));
    console.log("BEST "+mode+" seed="+best.key.join(",")+" singletons="+best.singletons.join(",")+
      " commonWords="+best.wordHits+" sample="+best.sample);
    const nativeWin=nativeWordHit.filter(v=>v<=best.wordHits).length;
    console.log("CALIBRATION "+mode+": clear-source intervals with <= best fixed-common-word count "+
      nativeWin+"/"+nativeWordHit.length+" (descriptive, not a cipher-proof)");
    const plantedPlain=Array.from({length:262},(_,j)=>{
      const sequence=controls.flat();
      return sequence[j%sequence.length];
    });
    title.forEach((p,j)=>{plantedPlain[j]=p;});
    plantedPlain[observed[0].at]=24;
    plantedPlain[observed[1].at]=10;
    const planted=enc(plantedPlain,stream(p15),mode);
    const test=decodeAll(planted,mode,observed);
    const found=test.filter(x=>x.key.every((v,j)=>v===p15[j]));
    assert.equal(found.length,1);
    assert.deepEqual(found[0].plain,plantedPlain);
    const wrong=p15.slice();wrong[0]=mod(wrong[0]+1);
    const wrongPlain=dec(planted,stream(wrong),mode);
    assert.ok(wrongPlain.some((p,j)=>p!==plantedPlain[j]));
    console.log("PLANTED "+mode+": one exact true 16-digit key recovered from 13-heading +2 singletons; 262-rune reencryption verified, wrong-key control fails");
  }
  console.log("PASS: bounded 13-crib p0 search finished, candidate plaintext hypothesis unverified, no unknown plaintext identified");
}
main();
