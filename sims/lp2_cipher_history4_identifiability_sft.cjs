"use strict";
/** Original LP2 four-ciphertext-history identifiability (Director #547).
 * Node 22 CommonJS, no file writes or external dependencies.
 * Each unknown bijective row obeys C[i]=f(scope,C[i-4..i-1],P[i]).
 * Neither f nor a four-step clock is established as historical.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const hist=(a,i)=>a.slice(i-4,i).join(",");
const pair=n=>n*(n-1)/2;
const logperm=n=>Array.from({length:n},(_,i)=>Math.log2(i+1))
  .reduce((s,x)=>s+x,0);
const logassign=d=>Array.from({length:d},(_,i)=>Math.log2(29-i))
  .reduce((s,x)=>s+x,0);
/** @param {"page"|"shared"|"continuous"} scope */
function census(scope){
 const seen=new Map();
 const visit=(key,c)=>{
   let v=seen.get(key);
   if(!v){v={n:0,counts:new Map()};seen.set(key,v);}
   v.n++;v.counts.set(c,(v.counts.get(c)||0)+1);
 };
 if(scope==="continuous"){
   const all=pages.flatMap(p=>p.indices);
   for(let i=4;i<all.length;i++)visit(hist(all,i),all[i]);
 }else for(const p of pages)for(let i=4;i<p.indices.length;i++){
   const k=hist(p.indices,i);
   visit(scope==="page"?p.page+":"+k:k,p.indices[i]);
 }
 const out={transitions:0,states:seen.size,repeatHistoryPairs:0,
   repeatFiveGramPairs:0,outputClasses:0,maxStateCount:0,
   maxOutputSupport:0,usage:{},support:{},
   log2PossiblePlaintextAssignments:0,
   log2UnconstrainedSecretTableAfterFullKnownPlaintext:0};
 for(const v of seen.values()){
   const d=v.counts.size;
   out.transitions+=v.n;out.outputClasses+=d;
   out.repeatHistoryPairs+=pair(v.n);
   out.repeatFiveGramPairs+=[...v.counts.values()]
     .reduce((s,x)=>s+pair(x),0);
   out.maxStateCount=Math.max(out.maxStateCount,v.n);
   out.maxOutputSupport=Math.max(out.maxOutputSupport,d);
   out.usage[v.n]=(out.usage[v.n]||0)+1;
   out.support[d]=(out.support[d]||0)+1;
   out.log2PossiblePlaintextAssignments+=logassign(d);
   out.log2UnconstrainedSecretTableAfterFullKnownPlaintext+=
     logperm(29)-logassign(d);
 }
 return {out,seen};
}
const page=census("page"),book=census("shared"),whole=census("continuous");
assert.deepEqual(
 [page.out.transitions,page.out.states,page.out.repeatHistoryPairs,
  page.out.repeatFiveGramPairs,page.out.outputClasses],
 [12736,12735,1,0,12736]);
assert.deepEqual(
 [book.out.transitions,book.out.states,book.out.repeatHistoryPairs,
  book.out.repeatFiveGramPairs,book.out.outputClasses],
 [12736,12615,122,6,12730]);
assert.deepEqual(
 [whole.out.transitions,whole.out.states,whole.out.repeatHistoryPairs,
  whole.out.repeatFiveGramPairs,whole.out.outputClasses],
 [12952,12825,128,6,12946]);
assert.deepEqual(book.out.support,{"1":12501,"2":113,"3":1});
assert.deepEqual(page.out.support,{"1":12734,"2":1});
const duplicate=[...page.seen.entries()].filter(([,v])=>v.n>1);
assert.equal(duplicate.length,1);
assert.equal(duplicate[0][0],"7:21,5,8,22");
assert.deepEqual([...duplicate[0][1].counts.keys()].sort((a,b)=>a-b),[8,28]);
/** Fixed 32-bit seed synthesizes a compact *hypothetical* state Caesar map.
 * @param {number} seed @param {number[]} previousCipher */
function step(seed,previousCipher){
 const bytes=Buffer.alloc(8);
 bytes.writeUInt32LE(seed>>>0);
 previousCipher.forEach((x,i)=>{bytes[i+4]=x;});
 return crypto.createHash("sha256").update(bytes).digest()[0]%29;
}
/** @param {number[]} seq @param {number} seed @param {boolean} forward */
function transform(seq,seed,forward){
 const out=seq.slice(0,4);
 for(let i=4;i<seq.length;i++){
  const context=forward?out.slice(i-4,i):seq.slice(i-4,i);
  const k=step(seed,context);
  out.push(((seq[i]+(forward?k:-k))%29+29)%29);
 }
 return out;
}
const solved=corpus.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
let plantCount=0,alternativeDiff=0;
for(const p of pages){
 const plain=Array.from({length:p.indices.length},(_,i)=>solved[i%95]);
 const crypt=transform(plain,0x33011033,true);
 assert.deepEqual(transform(crypt,0x33011033,false),plain);
 const a=transform(p.indices,0x33011033,false);
 const b=transform(p.indices,0x7612014,false);
 assert.deepEqual(transform(a,0x33011033,true),p.indices);
 assert.deepEqual(transform(b,0x7612014,true),p.indices);
 plantCount+=plain.length;
 alternativeDiff+=a.filter((x,i)=>x!==b[i]).length;
}
assert.equal(plantCount,12956);
assert(alternativeDiff>9000);
console.log(JSON.stringify({
 status:"BOUNDED ALL-SECRET IDENTIFIABILITY NEGATIVE; NO UNKNOWN PLAINTEXT",
 unknownRunes:12956,pages:pages.length,contextSpace:29**4,
 originalPageScoped:page.out,originalShared:book.out,
 originalContinuous:whole.out,
 uniquePageScopeRepeat:{context:duplicate[0][0],outputs:[8,28],
   localRuneStarts:[95,174]},
 synthetic:{source:"solved p57 GP29 repeated to source lengths",
   recoveredPlantRunes:plantCount,differentSyntheticOriginalDecodes:alternativeDiff,
   bothReencryptOriginalExactly:true,sourceSelectedSecret:false},
 interpretation:"For each occupied state with d distinct next ciphertext symbols, the inverse must choose d distinct GP29 plaintext symbols: (29)_d possibilities. Initial four symbols per page are held fixed. A 29! random secret table per state needs roughly 103 bits each; a compact seed can algorithmically expand to all rows, so the large table-size figure is NOT a minimum historical key-size bound. Current original information and no authentic compressed generator cannot identify plaintext."
},null,2));
