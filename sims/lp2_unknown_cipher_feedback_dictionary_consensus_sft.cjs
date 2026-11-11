"use strict";

/**
 * Arbitrary 29-entry ciphertext-feedback table, exact original GP29 gate.
 *
 * C[w,j] = P[w,j] + K[w,j] (mod29)
 * K[w,j+1] = K[w,j] + g(C[w,j]) (mod29)
 *
 * Eliminate ANY word-initial key:
 *   g(C[w,j-1]) = (C[w,j]-C[w,j-1]) -
 *       (P[w,j]-P[w,j-1]) (mod29).
 *
 * The printed ciphertext determines which unknown g entries are used.
 * A native-GP English candidate supplies their needed values. Repeated
 * printed predecessor symbols and cross-word agreements must be consistent.
 * Exhaust all 12,231 independent reference word types without enumerating
 * 29^29 possible lookup tables or 29 variable per-word starting keys.
 *
 * This is not a historical authentication of a feedback mechanism.
 * Run: node sims/lp2_unknown_cipher_feedback_dictionary_consensus_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runemap=new Map(gp.runes.map((r,i)=>[r,i]));
const token=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const mod=x=>(x%29+29)%29;
/** @param {string} text */
function nativeWords(text){
  const out=[];
  for(const raw of text.toUpperCase().match(/[A-Z]+/g)||[]){
    const w=raw.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];
    for(let j=0;j<w.length;){
      const t=token.find(t=>w.startsWith(t.t,j));
      assert(t,"invalid source GP spelling: "+w.slice(j));
      p.push(t.i);j+=t.t.length;
    }
    out.push({p,word:raw});
  }
  return out;
}
const src=parseSharedCorpus();
assert.equal(src.words.length,2896);
assert.equal(src.runeCount,12956);
assert.equal(src.crossPageWords,32);
const original=src.words.map(w=>[...w.runes].map(r=>runemap.get(r)));
assert.deepEqual(original.flat(),
  gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
const dictionary=new Map();
for(const filepath of ["resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt"])
  for(const w of nativeWords(read(filepath))){
    const id=w.p.join(",");
    if(!dictionary.has(id))dictionary.set(id,w);
  }
assert.equal(dictionary.size,12231);
const byLength=new Map();
for(const w of dictionary.values()){
  if(!byLength.has(w.p.length))byLength.set(w.p.length,[]);
  byLength.get(w.p.length).push(w);
}
/** @param {number[]} cipher @param {number[]} plain */
function impliedCipherFeedback(cipher,plain){
  const m=new Int8Array(29).fill(-1),fields=[];
  for(let j=1;j<cipher.length;j++){
    const k=cipher[j-1];
    const value=mod(cipher[j]-cipher[j-1]-plain[j]+plain[j-1]);
    if(m[k]>=0 && m[k]!==value)return null;
    if(m[k]<0){m[k]=value;fields.push(k);}
  }
  return {m,fields};
}
/** @param {number[]} c */
function candidates(c){
  const out=[];
  for(const w of byLength.get(c.length)||[]){
    const x=impliedCipherFeedback(c,w.p);
    if(x)out.push({...x,word:w.word});
  }
  return out;
}
/** @param {number[][]} words */
function targetSet(words){
  return words.map((c,index)=>({c,index})).filter(t=>t.c.length>=10)
    .map(t=>({...t,candidates:candidates(t.c)}));
}
/** @param {{m:Int8Array,fields:number[]}} a
 * @param {{m:Int8Array,fields:number[]}} b
 */
function overlap(a,b){
  let shared=0;
  for(const k of a.fields){
    if(b.m[k]>=0){if(a.m[k]!==b.m[k])return -1;shared++;}
  }
  return shared;
}
/** @param {ReturnType<targetSet>} targets */
function strongest(targets){
  const anchors=targets.filter(t=>t.c.length>=12);
  const winning={any:-1,shared3:-1,anyCase:null,shared3Case:null};
  let anchorCandidates=0;
  for(const a of anchors)for(const f of a.candidates){
    anchorCandidates++;
    let any=0,shared3=0;
    for(const t of targets){
      if(t.index===a.index)continue;
      let best=-1;
      for(const g of t.candidates)best=Math.max(best,overlap(f,g));
      if(best>=0)any++;
      if(best>=3)shared3++;
    }
    if(any>winning.any){winning.any=any;
      winning.anyCase={index:a.index,word:f.word,assigned:f.fields.length};}
    if(shared3>winning.shared3){winning.shared3=shared3;
      winning.shared3Case={index:a.index,word:f.word,assigned:f.fields.length};}
  }
  return {targets:targets.length,anchors:anchors.length,
    candidateCount:targets.reduce((s,t)=>s+t.candidates.length,0),
    anchorCandidates,...winning};
}
/** @param {number[]} plain @param {number} seed */
function encrypt(plain,seed){
  let k=seed;
  return plain.map(p=>{
    const c=mod(p+k);
    k=mod(k+gp.prime[c]+1);
    return c;
  });
}
/** @param {number[]} cipher @param {number} seed */
function decrypt(cipher,seed){
  let k=seed;
  return cipher.map(c=>{
    const p=mod(c-k);
    k=mod(k+gp.prime[c]+1);
    return p;
  });
}
const originalResult=strongest(targetSet(original));
assert.equal(originalResult.targets,109);
assert.equal(originalResult.anchors,25);
assert.equal(originalResult.candidateCount,15536);
assert.equal(originalResult.anchorCandidates,741);
assert.equal(originalResult.any,11);
assert.equal(originalResult.shared3,2);

const nativePlant=original.map((c,index)=>({n:c.length,index}))
  .filter(t=>t.n>=10).map((t,i)=>{
    const words=byLength.get(t.n),plain=words[(11+17*i)%words.length].p;
    const seed=mod(24+7*i),c=encrypt(plain,seed);
    assert.deepEqual(decrypt(c,seed),plain);
    return c;
  });
const plantResult=strongest(targetSet(nativePlant));
assert.equal(plantResult.targets,109);
assert.equal(plantResult.anchors,25);
assert.equal(plantResult.any,108);
assert.equal(plantResult.shared3,79);

const lp1Text=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split(/\r?\n/u).filter(line=>{
    const s=line.trim();
    return s&&!s.startsWith("#")&&!s.startsWith("[")&&
      !/^[0-9a-f]{25,}$/iu.test(s)&&!/^\d+[\s\d]+$/.test(s);
  }).join(" ");
const lp1Words=nativeWords(lp1Text);
assert.equal(lp1Words.length,796);
const longLP1=lp1Words.filter(w=>w.p.length>=10);
const coveredLP1=longLP1.filter(w=>dictionary.has(w.p.join(","))).length;
assert.equal(longLP1.length,20);
assert.equal(coveredLP1,14);
const lp1Plant=longLP1.map((w,i)=>{
  const seed=mod(24+17*i),c=encrypt(w.p,seed);
  assert.deepEqual(decrypt(c,seed),w.p);
  return c;
});
const lp1Result=strongest(targetSet(lp1Plant));
assert.equal(lp1Result.targets,20);
assert.equal(lp1Result.anchors,8);
console.log(JSON.stringify({
  classification:"conditional original negative; no LP2 decryption",
  hypothesis:"C=P+K mod29; K_next=K+g(C) mod29 with all 29 g entries and initial word keys unknown",
  dictionaryTypes:dictionary.size,
  original:originalResult,
  originalLengthNativePlant:plantResult,
  solvedLP1Positive:{longWords:20,coveredLP1,...lp1Result}
},null,2));
