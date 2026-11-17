"use strict";
/**
 * LP2 p0–p1 source-cross chain-pad cancellation, original-input SFT.
 *
 * A repeated 180-degree cross may mark a page-reset shared key. The independent
 * ciphertext anti-repeat fingerprint motivates testing a CHAIN key, rather
 * than the already rejected direct C=P+K source-cross shared pad:
 *
 *   D(C)[t] = C[t] - (t ? C[t-1] : 0)  mod29.
 *   D(C0)[t] = P0[t] + K[t]
 *   D(C1)[t] = P1[t] ± K[t]
 *
 * For both signs, K cancels. Grant all GP29 plaintext choices at each position
 * and minimize native-GP out-of-lexicon *complete* printed words via exact
 * dual-word trie DP. Reversal acts on the printed ciphertext before D.
 *
 * Reproducer on Windows 11: node sims/lp2_p0_p1_cross_chain_sharedpad_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyphIndex=new Map(gp.runes.map((x,i)=>[x,i]));
const translit=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function toGp(word){
 const s=word.toUpperCase().replace(/[KVZQ]/g,x=>({K:"C",V:"U",Z:"S",Q:"C"})[x]);
 const out=[];
 for(let i=0;i<s.length;){
  const hit=translit.find(t=>s.startsWith(t.s,i));
  if(hit){out.push(hit.i);i+=hit.s.length;}else i++;
 }
 return out;
}
const symbols=[],classes=[];
let buffered=[];
function finishWord(){
 for(let i=0;i<buffered.length;i++)
  classes.push(buffered.length===1?3:i===0?0:i===buffered.length-1?2:1);
 symbols.push(...buffered);buffered=[];
}
for(const ch of read("resources/liber-primus/lp2-transcription.txt")){
 if(glyphIndex.has(ch))buffered.push(glyphIndex.get(ch));
 else if(ch==="-"||ch===".")finishWord();
}
finishWord();
const page0=gp.pages[0].indices,page1=gp.pages[1].indices,n=page0.length;
assert.deepEqual([page0.length,page1.length],[262,266]);
assert.deepEqual(symbols.slice(0,n),page0);
assert.deepEqual(symbols.slice(n,n+page1.length),page1);
const c0=classes.slice(0,n),c1=classes.slice(n,n+page1.length);
/** @typedef {{edges:Map<number,number>,end:boolean}} Node */
/** @type {Node[][]} */
const trees=Array.from({length:2},()=>[{edges:new Map(),end:false}]);
/** @type {Map<number,number[][]>} */
const wordsByLength=new Map();
let sourceWords=0;
/** @param {Node[]} tree @param {number[]} tokens */
function insert(tree,tokens){
 let cur=0;
 for(const s of tokens){
  let nx=tree[cur].edges.get(s);
  if(nx===undefined){
   nx=tree.length;tree[cur].edges.set(s,nx);
   tree.push({edges:new Map(),end:false});
  }
  cur=nx;
 }
 tree[cur].end=true;
}
for(const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")){
 const m=/^([a-z]+) (\d+)$/.exec(line);
 if(!m)continue;
 sourceWords++;
 const w=toGp(m[1]);
 insert(trees[0],w);insert(trees[1],w.slice().reverse());
 if(!wordsByLength.has(w.length))wordsByLength.set(w.length,[]);
 wordsByLength.get(w.length).push(w);
}
assert.equal(sourceWords,29157);
assert.deepEqual(trees.map(t=>t.length),[74946,85577]);
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number[]} */
function steps(a){return a.map((v,i)=>mod(v-(i?a[i-1]:0)));}
function reading(r,c,reverse){
 return reverse?{
  r:r.slice().reverse(),
  c:c.slice().reverse().map(x=>x===0?2:x===2?0:x)
 }:{r,c};
}
/**
 * Exact key-independent inverse for all GP29 unknown plaintext words.
 * Tries have one sentinel for a nonlexicon word already charged.
 * @param {number[]} src0
 * @param {number[]} src1
 * @param {boolean} rev0
 * @param {boolean} rev1
 * @param {-1|1} sign  -1 same pad, +1 opposite pad
 */
function gate(src0,src1,rev0,rev1,sign){
 const A=reading(src0,c0,rev0),B=reading(src1,c1,rev1);
 const da=steps(A.r),db=steps(B.r),ta=trees[rev0?1:0],tb=trees[rev1?1:0];
 const unknown=Math.max(...trees.map(t=>t.length)),base=unknown+1;
 const initialA=(A.c[0]===1||A.c[0]===2)?unknown:0;
 const initialB=(B.c[0]===1||B.c[0]===2)?unknown:0;
 let states=new Map([[initialA*base+initialB,0]]);
 let firstForced=null,peak=1;
 for(let i=0;i<n;i++){
  const ea=A.c[i]===2||A.c[i]===3,eb=B.c[i]===2||B.c[i]===3;
  const value=mod(da[i]+sign*db[i]),next=new Map();
  for(const [pair,cost] of states){
   const a=Math.floor(pair/base),b=pair%base;
   for(let x=0;x<29;x++){
    const y=sign===-1?mod(x-value):mod(value-x);
    let na=a===unknown?unknown:ta[a].edges.get(x);
    let nb=b===unknown?unknown:tb[b].edges.get(y);
    let added=0;
    if(na===undefined){na=unknown;added++;}
    else if(ea&&na!==unknown&&!ta[na].end)added++;
    if(nb===undefined){nb=unknown;added++;}
    else if(eb&&nb!==unknown&&!tb[nb].end)added++;
    const key=(ea?0:na)*base+(eb?0:nb),cost2=cost+added;
    const prev=next.get(key);
    if(prev===undefined||cost2<prev)next.set(key,cost2);
   }
  }
  states=next;peak=Math.max(peak,states.size);
  let best=Infinity;for(const cost of states.values())best=Math.min(best,cost);
  if(firstForced===null&&best>0)firstForced=i;
 }
 let best=Infinity;for(const cost of states.values())best=Math.min(best,cost);
 return {minNonlexiconWords:best,firstForced,peakStates:peak};
}
let state=0x330142;
/** @param {number} n @returns {number} */
function randomInt(n){
 state=(Math.imul(state,1664525)+1013904223)>>>0;
 return state%n;
}
/**
 * Build source-layout matching English word plants with arbitrary GP edge fragments.
 * @param {number[]} classes
 * @returns {number[]}
 */
function nativeWords(classes){
 const out=[];
 for(let i=0;i<classes.length;){
  let end=i;
  while(end<classes.length&&classes[end]!==2&&classes[end]!==3)end++;
  const complete=end<classes.length;
  if(complete&&(classes[i]===0||classes[i]===3)){
   const length=end-i+1,candidates=wordsByLength.get(length);
   assert(candidates&&candidates.length,"English word matching source length "+length);
   out.push(...candidates[randomInt(candidates.length)]);
   i=end+1;
  }else{
   const length=complete?end-i+1:classes.length-i;
   for(let k=0;k<length;k++)out.push(randomInt(29));
   i+=length;
  }
 }
 assert.equal(out.length,classes.length);
 return out;
}
/**
 * Stateful chain encryptor in the actual chosen reading orientation.
 * @param {number[]} plain
 * @param {number[]} pad
 * @param {boolean} reverse
 * @param {-1|1} sign
 * @returns {number[]}
 */
function chainEncrypt(plain,pad,reverse,sign){
 const p=reverse?plain.slice().reverse():plain;
 let prior=0;
 const observed=p.map((v,i)=>{
  prior=mod(prior+v+sign*pad[i]);return prior;
 });
 return reverse?observed.reverse():observed;
}
const original=[],controls=[];
const expected=[[16,14],[15,16],[16,14],[14,12]];
const expectedForced=[[12,12],[12,7],[11,12],[15,16]];
let variant=0;
for(const reverseA of [false,true]){
 for(const reverseB of [false,true]){
  const cases=[];
  for(const sign of /** @type {const} */ ([-1,1])){
   const result=gate(page0,page1,reverseA,reverseB,sign);
   assert.equal(result.minNonlexiconWords,expected[variant][sign===-1?0:1]);
   assert.equal(result.firstForced,expectedForced[variant][sign===-1?0:1]);
   cases.push({sign,...result});
   const pa=nativeWords(c0),pb=nativeWords(c1);
   const pad=Array.from({length:page1.length},()=>randomInt(29));
   const independent=Array.from({length:page1.length},()=>randomInt(29));
   const goodA=chainEncrypt(pa,pad,reverseA,1);
   const goodB=chainEncrypt(pb,pad,reverseB,sign===-1?1:-1);
   const badB=chainEncrypt(pb,independent,reverseB,sign===-1?1:-1);
   const positive=gate(goodA,goodB,reverseA,reverseB,sign);
   const independentResult=gate(goodA,badB,reverseA,reverseB,sign);
   assert(positive.minNonlexiconWords<=3,"common-chain-pad plant must be recognized");
   assert(independentResult.minNonlexiconWords>=8,
     "independent-chain-pad negative control must fail the trie gate");
   controls.push({reverseA,reverseB,sign,
    sharedPlantOov:positive.minNonlexiconWords,
    independentPlantOov:independentResult.minNonlexiconWords});
  }
  original.push({reverseA,reverseB,cases});
  variant++;
 }
}
console.log(JSON.stringify({
 status:"PASS",hypothesis:"source-cross page-reset chain-pad",
 originalPages:[0,1],originalRuneCounts:[page0.length,page1.length],
 originalAdjacentDoublets:[
  page0.filter((v,i)=>i>0&&v===page0[i-1]).length,
  page1.filter((v,i)=>i>0&&v===page1[i-1]).length],
 dictionary:{rows:sourceWords,forwardTrieNodes:trees[0].length,
  reverseTrieNodes:trees[1].length},
 original,controls,unknownPlaintextRecovered:0
},null,2));
