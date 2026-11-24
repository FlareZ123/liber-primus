#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {train}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page>=0&&p.page<=55);
if(pages.length!==55)throw new Error("Expected 55 unsolved pages p0-p55");
const total=pages.reduce((n,p)=>n+p.indices.length,0);
if(total!==12956)throw new Error("Unexpected LP2 rune count "+total);
const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
const mod=x=>((x%29)+29)%29;
function score(seq){
 if(!seq.length)return 0;
 let s=lm.unigram[seq[0]];
 for(let i=1;i<seq.length;i++){
  if(i===1)s+=lm.bigram[seq[i-1]*29+seq[i]];
  else s+=lm.trigram[(seq[i-2]*29+seq[i-1])*29+seq[i]];
 }
 return s/seq.length;
}
const keys=[
 {label:"three-body-clause-prime-sums",numbers:[1031,1229,1259]},
 {label:"title-sum-then-three-body-prime-sums",numbers:[761,1031,1229,1259]}
].map(k=>({...k,mod29:k.numbers.map(mod)}));
const results=[];
for(const key of keys)for(const clock of ["page-reset","book-continuous"])for(const sign of [-1,1]){
 let globalOffset=0,trainScore=0,trainN=0,holdScore=0,holdN=0;
 const previews=[];
 for(let pi=0;pi<pages.length;pi++){
  const page=pages[pi],offset=clock==="page-reset"?0:globalOffset;
  const plain=page.indices.map((c,i)=>mod(c-sign*key.mod29[(offset+i)%key.mod29.length]));
  const sc=score(plain);
  if(pi<28){trainScore+=sc*plain.length;trainN+=plain.length;}
  else{holdScore+=sc*plain.length;holdN+=plain.length;}
  if([0,16,28,40,54].includes(pi))previews.push({page:page.page,head:plain.slice(0,48).map(x=>corpus.translit[x]).join(""),score:sc});
  globalOffset+=page.indices.length;
 }
 results.push({
  key:key.label,numbers:key.numbers,key_mod29:key.mod29,
  clock,sign,train:trainScore/trainN,heldout:holdScore/holdN,
  previews
 });
}
const byHold=[...results].sort((a,b)=>b.heldout-a.heldout);
const byTrain=[...results].sort((a,b)=>b.train-a.train);
const report={
 question:"Do the p57 clause-prime sums and audio-title sum form a simple repeated GP29 Vigenere key for LP2?",
 status:"fixed source-derived keys only; no key rotations or fitted variants",
 source:{body_clause_gp_prime_sums:[1031,1229,1259],audio_title_gp_prime_sum:761,corpus_pages:pages.length,corpus_runes:total},
 key_candidates:keys,
 receiver:{operation:"plaintext[i] = ciphertext[i] - sign*key[(clockOffset+i) mod keyLength] mod29",clocks:["page-reset","book-continuous"],signs:[-1,1],models:results.length,train_pages:"p0-p27",heldout_pages:"p28-p55",language_model:"Shakespeare first 200,000 characters, GP29 trigram"},
 bestByHeldout:byHold,
 bestByTrain:byTrain,
 decision:"A positive requires intelligible heldout plaintext across pages; scores or isolated fragments are insufficient."
};
const text=JSON.stringify(report,null,2)+"\n";
fs.mkdirSync(path.join(root,"run-artifacts"),{recursive:true});
fs.writeFileSync(path.join(root,"run-artifacts/parable-prime-vigenere-report.json"),text);
console.log(text);
