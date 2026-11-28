"use strict";
/**
 * Independent language-register gate for exact Agent2 Round48/C11 sender.
 * Source premise (NOT authenticated by Cicada): original p55 printed 13-rune
 * word may be Latin; book title is Latin "Liber Primus".
 *
 * Keep original long word unchanged; take all actually printed 13+ GP-native
 * Latin words from Cicero De Officiis, using solved LP1/p57 source-calibrated
 * orthography in resources/external. Enumerate arbitrary q8 Z36 period keys
 * with strict rejected-repeat output and seven hidden outputs. This is an
 * original-key feasibility test, not a fitted language-model search.
 * Producer: independently encrypt two originally sourced Latin words and
 * recover their true canonical q8 keys. Source word shape held-out from
 * original ciphertext, not synthetic plaintext generated to match output.
 *
 * Source main algorithm from Agent2 original blind q8 DFS; reimplemented
 * separately for cross-register source-calibrated Latin controls.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const ref=json("resources/external/cicero-de-officiis-gp-longforms13-v1.json");
const gp=json("resources/liber-primus/lp2-corpus.json");
const group=json("resources/liber-primus/lp2-page-groups-54-55-derived.json");
const Q=8,A=ref.alphabet;
assert.equal(A,"0123456789abcdefghijklmnopqrstuvwxyz");
assert.equal(ref.minimum_source_word_length,13);
assert.equal(ref.forms.length,292);
const C=group.p55.groups.filter(x=>x.length===13);
assert.deepEqual(C,["hs0eaj15d8lkc"]);
const arr=s=>[...s].map(c=>A.indexOf(c)),word=v=>v.map(x=>A[x]).join("");
function canon(K) {
 const s=word(K),r=Array.from({length:8},(_,j)=>s.slice(j)+s.slice(0,j));
 return r.sort()[0];
}
function encrypt(P,K) {
 let last=36,j=0,obs="",retries=0,hidden=0;
 for(const p of P){
  for(let k=0;k<Q;k++){
   const c=(p+K[j])%36;
   j=(j+1)%Q;
   if(c===last){retries++;continue;}
   last=c;
   if(c<29)obs+=A[c];else hidden++;
   break;
  }
 }
 return{obs,retries,hidden};
}
function seed(obs,forms){
 const cv=arr(obs),K=Array(Q).fill(-1),keys=new Map();
 let nodes=0,leaves=0,attemptedForms=0,formHits=0;
 for(const form of forms){
  const P=arr(form.gp);if(P.length<cv.length)continue;
  attemptedForms++;
  let thisHit=false;
  function dfs(i,h,j,last,retry){
   nodes++;
   if(P.length-i<cv.length-h)return;
   if(i===P.length){
    if(h===cv.length){
     assert(K.every(x=>x>=0));
     const key=canon(K);
     if(!keys.has(key))keys.set(key,new Set());
     keys.get(key).add(form.gp);
     leaves++;thisHit=true;
    }
    return;
   }
   const p=P[i];
   function step(c) {
    if(c===last){if(retry+1<Q)dfs(i,h,(j+1)%Q,last,retry+1);return;}
    if(c<29){if(h<cv.length&&c===cv[h])dfs(i+1,h+1,(j+1)%Q,c,0);}
    else if(P.length-i>cv.length-h)dfs(i+1,h,(j+1)%Q,c,0);
   }
   if(K[j]>=0){step((p+K[j])%36);return;}
   const choices=new Set();
   if(h<cv.length)choices.add(cv[h]);
   if(last<36)choices.add(last);
   if(P.length-i>cv.length-h)for(let c=29;c<36;c++)choices.add(c);
   for(const c of choices){K[j]=(c-p+36)%36;step(c);K[j]=-1;}
  }
  dfs(0,0,0,36,0);
  if(thisHit)formHits++;
 }
 return {nodes,attemptedForms,formHits,leaves,keys};
}
function summary(x){return{nodes:x.nodes,attemptedForms:x.attemptedForms,
   exactCompatibleLatinForms:x.formHits,fullKeyWitnessLeaves:x.leaves,
   distinctCanonicalKeys:x.keys.size,
   exampleWitnesses:[...x.keys].slice(0,6).map(([key,forms])=>({key,words:[...forms].slice(0,6)}))};
}
const K1=[13,5,21,2,30,7,18,33],K2=[9,28,3,17,12,34,1,24],positive=[];
for(const [i,K] of [[0,K1],[1,K2]]) {
 const longest=ref.forms.filter(f=>f.length>=17);
 let selected=null,output=null;
 for(const form of longest) {
  const e=encrypt(arr(form.gp),K);
  if(e.obs.length>=13){selected=form;output=e;break;}
 }
 assert(selected,"no Latin long word with >=13 printed positions");
 const z=seed(output.obs,ref.forms);
 assert(z.keys.has(canon(K)),"frozen Latin true key not found by exhaustive q8 inverse");
 assert(z.formHits>=1);
 positive.push({sourceWord:selected.firstLatinWord,sourceNativeGP:selected.gp,
  sourceLength:selected.length,printed:output.obs,printedLength:output.obs.length,
  hiddenEmissions:output.hidden,retries:output.retries,correctKey:canon(K),
  recoveredKeyWitness:true,receiver:summary(z)});
}
const original=seed(C[0],ref.forms);
console.log(JSON.stringify({
 sourceHypothesis:"Cicero book-I title literal Latin long-word register; q8 mod36 seven-silent strict nonrepeat, no encrypted word breaks",
 sourceStatus:"No authored Cicada mechanism or Latin vocabulary authorization; no key is known",
 originalPrintedLongWord:C[0],
 originalSourceShape:"physically printed original LP2 p55 13-rune word",
 frozenLatinSourceForms:ref.unique_forms,
 positive,
 original:summary(original),
 decision:original.keys.size?"Candidate original Latin q8 source-longword compatibility requires independent original-held prediction":
 "No source-calibrated Cicero Latin word >=13 GP symbols admits ANY eight-period mod36 key for this original 13-rune p55 word; only exact finite source lexicon/key family excluded",
 noOriginalPlaintextRecovered:true
},null,2));
