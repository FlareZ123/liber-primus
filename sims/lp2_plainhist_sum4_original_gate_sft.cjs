"use strict";
/**
 * Original GP29 sum-of-four plaintext feedback investigation, Agent37.
 * Run: node sims/lp2_plainhist_sum4_original_gate_sft.cjs
 *
 * Exact target family: C_i=A_{(P_{i-1}+...+P_{i-4}) mod29}(P_i),
 * each A_s an otherwise arbitrary 29! permutation shared manuscript-wide.
 *
 * Two genuinely key-independent necessary inequalities are measured on
 * contiguous ORIGINAL words. The affine A_s(p)=p+a*s+b subfamily is also
 * exhausted for all 29^2 keys, with three genuinely blinded positive plants.
 * No result purports to exclude all 29!^29 keys.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const {parseLP2Words,physicalLP2Page}=require("./lp2_word_pages.cjs");
const gp=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ids=new Map(gp.runes.map((x,i)=>[x,i]));
const terms=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const parsed=parseLP2Words(load("resources/lp2-transcription.txt"));
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.crossPageWords,32);
const original=parsed.words.map(w=>({
 start:w.startPage,end:w.endPage,seq:[...w.runes].map(ch=>{assert(ids.has(ch));return ids.get(ch);})
}));
assert.equal(original.reduce((a,w)=>a+w.seq.length,0),12956);
const originalPages=gp.pages.filter(p=>p.page<=55&&p.indices.length)
 .map(p=>({page:p.page,indices:p.indices}));
assert.equal(originalPages.reduce((a,p)=>a+p.indices.length,0),12956);
assert.deepEqual(original.flatMap(w=>w.seq),originalPages.flatMap(p=>p.indices));
const chapterEnds=[2,7,14,22,26,32,39,53,55];
const scopes=["global","chapter","page"];
const group=(word,scope)=>{
 const p=physicalLP2Page(word.start);
 return scope==="global"?0:scope==="page"?p:chapterEnds.findIndex(end=>p<=end);
};
function suffixOrWindowPairs(words,kind,scheme,scope) {
 const hist=new Map(); let total=0;
 for(const w of words) {
   if(w.seq.length<6) continue;
   if(scope!=="global" && w.start!==w.end) continue;
   const begin=scheme==="suffix"?w.seq.length-6:0;
   for(let j=begin;j<=w.seq.length-6;j++){
     const x=w.seq.slice(j,j+6);
     // Both final output-symbol state arguments are determined by
     // P_(i-5) and sum of P_(i-4..i-2), plus last-two P runes.
     const sign=kind==="plain"?[x[0],(x[1]+x[2]+x[3])%29,x[4],x[5]]:x.slice(4);
     const key=group(w,scope)+":"+sign.join(",");
     hist.set(key,(hist.get(key)||0)+1);total++;
   }
 }
 return {n:total,pairs:[...hist.values()].reduce((s,v)=>s+v*(v-1)/2,0)};
}
const originalBounds={};
for(const scheme of ["suffix","windows"])
 originalBounds[scheme]=Object.fromEntries(scopes.map(scope=>[scope,
 suffixOrWindowPairs(original,"cipher",scheme,scope)]));
assert.deepEqual(scopes.map(k=>originalBounds.suffix[k].pairs),[389,35,2]);
assert.deepEqual(scopes.map(k=>originalBounds.windows[k].pairs),[2652,333,43]);
function encode(word){
 const s=word.toUpperCase().replace(/QU/g,"CW")
 .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let i=0;i<s.length;){
   if(s.startsWith("ING",i)){out.push(21);i+=3;}
   else if(s.startsWith("IO",i)){out.push(27);i+=2;}
   else{const z=terms.find(z=>s.startsWith(z.s,i));
     assert(z,"not encodable: "+word+" at "+s.slice(i));out.push(z.i);i+=z.s.length;}
 }
 return out;
}
for(const [latin,runes] of [
 ["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],["THINGS","ᚦᛝᛋ"],
 ["CONSUMPTION","ᚳᚩᚾᛋᚢᛗᛈᛏᛡᚾ"]])
 assert.equal(encode(latin).map(i=>gp.runes[i]).join(""),runes);
function rand(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}};
const sources=[
 ["Shakespeare","resources/control/shakespeare_first300k.txt"],
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,filename])=>{
 const pool=new Map();
 for(const word of load(filename).toUpperCase().match(/[A-Z]+/g)||[]){
   const seq=encode(word);if(seq.length<1)continue;
   const items=pool.get(seq.length)||[];items.push(seq);pool.set(seq.length,items);
 }
 return {name,filename,pool};
});
function sampleNative(slots,source,rng,allWords=false){
 const available=new Map();
 for(const [len,arr] of source.pool){
  if(len<6&&!allWords)continue;
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  available.set(len,a);
 }
 const cursor=new Map();
 return slots.map(w=>{
  if(w.seq.length<6&&!allWords)return {...w};
  const len=w.seq.length,j=cursor.get(len)||0;cursor.set(len,j+1);
  const a=available.get(len);assert(a?.length,source.name+" length "+len);
  return {...w,seq:a[j%a.length]};
 });
}
const nativeStats=[];
let positiveNative=null;
for(let si=0;si<sources.length;si++){
 const s=sources[si],rng=rand(0x330120+4000+si),samples=[];
 for(let trial=0;trial<128;trial++){
  const plant=sampleNative(original,s,rng);
  // Control probes the six-rune invariant with exact original length slots.
  samples.push(Object.fromEntries(["suffix","windows"].map(scheme=>[
   scheme,scopes.map(scope=>suffixOrWindowPairs(plant,"plain",scheme,scope).pairs)
  ])));
 }
 nativeStats.push({name:s.name,source:s.filename,trials:samples.length,
  measures:Object.fromEntries(["suffix","windows"].map(scheme=>[
   scheme,Object.fromEntries(scopes.map((scope,k)=>{
    const vals=samples.map(a=>a[scheme][k]),bound=originalBounds[scheme][scope].pairs;
    return [scope,{originalCapacity:bound,min:Math.min(...vals),max:Math.max(...vals),
    mean:vals.reduce((a,b)=>a+b,0)/vals.length,exceed:vals.filter(v=>v>bound).length}];
   }))
  ]))});
}
positiveNative=sampleNative(original,sources[1],rand(0xc1cada33),true);
/* Key-independent signature must hold on a fully bijective native plant. */
function makeRandomRows(seed){
 const rng=rand(seed),rows=[];
 for(let s=0;s<29;s++){
  const a=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  assert.equal(new Set(a).size,29);rows.push(a);
 }return rows;
}
const permutationRows=makeRandomRows(0x3301974);
function permEncode(words,rows){
 let h=[0,0,0,0];
 return words.map(w=>{
  const seq=w.seq.map(p=>{
   const s=(h[0]+h[1]+h[2]+h[3])%29;
   const c=rows[s][p];h.shift();h.push(p);return c;
  });
  return {...w,seq};
 });
}
const positivePerm=permEncode(positiveNative,permutationRows);
assert.equal(positivePerm.reduce((n,w)=>n+w.seq.length,0),12956);
for(const scheme of ["suffix","windows"])for(const scope of scopes){
 const forced=suffixOrWindowPairs(positiveNative,"plain",scheme,scope);
 const available=suffixOrWindowPairs(positivePerm,"cipher",scheme,scope);
 assert(forced.pairs<=available.pairs);
}

// Exact alphabet-affine gauge equivalence for an arbitrary 29-row table:
// P' = u*P+v, s' = u*s+4v, and A'_{s'}(P') = A_s(P).
// For v != 0 this also changes the unobserved initial four P values to v.
function mod29(v){return (v%29+29)%29;}
function affineGauge(rows,u,v){
 const inv=Array.from({length:28},(_,i)=>i+1).find(x=>mod29(u*x)===1);
 assert(inv!==undefined);
 return Array.from({length:29},(_,ss)=>Array.from({length:29},(_,pp)=>
   rows[mod29(inv*(ss-4*v))][mod29(inv*(pp-v))]));
}
function permEncodeIV(words,rows,iv){
 let h=iv.slice();
 return words.map(w=>({...w,seq:w.seq.map(p=>{
   const s=(h[0]+h[1]+h[2]+h[3])%29,c=rows[s][p];
   h.shift();h.push(p);return c;
 })}));
}
let gaugeCases=0;
for(const u of [1,2,3,7,28])for(const v of [0,1,5,8,17]){
 const transformed=positiveNative.map(w=>({...w,seq:w.seq.map(p=>mod29(u*p+v))}));
 const newRows=affineGauge(permutationRows,u,v);
 for(const row of newRows)assert.equal(new Set(row).size,29);
 assert.deepEqual(permEncodeIV(transformed,newRows,[v,v,v,v]),positivePerm);
 gaugeCases++;
}
assert.equal(gaugeCases,25);

/* Exact inverse per globally continuous or physical-page reset IV. */
function affine(pages,a,b,mode,direction){
 let hist=[0,0,0,0];
 return pages.map(page=>{
  if(mode==="page")hist=[0,0,0,0];
  return {page:page.page,indices:page.indices.map(z=>{
   const sum=(hist[0]+hist[1]+hist[2]+hist[3])%29;
   const p=direction==="decode"?(z-a*sum-b+29*64)%29:z;
   const c=direction==="decode"?p:(p+a*sum+b)%29;
   hist.shift();hist.push(p);return c;
  })};
 });
}
const train=page=>page.page>=16&&page.page<=21,
      holdout=page=>page.page>=40&&page.page<=53;
function ioc(pages,filter){
 const count=Array(29).fill(0);let n=0;
 for(const p of pages)if(filter(p))for(const x of p.indices){count[x]++;n++;}
 return count.reduce((a,v)=>a+v*(v-1),0)/(n*(n-1));
}
const originalAffine=[];
for(const mode of ["book","page"]){
 const scores=[];
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const dec=affine(originalPages,a,b,mode,"decode");
  scores.push({a,b,train:ioc(dec,train),holdout:ioc(dec,holdout)});
 }
 scores.sort((x,y)=>y.train-x.train);
 assert.equal(scores.length,841);
 assert(scores.every(o=>o.train<0.05&&o.holdout<0.05));
 originalAffine.push({mode,modelCount:841,highestTrain:scores.slice(0,3),
   aboveTrain050:scores.filter(x=>x.train>=0.05).length,
   aboveHoldout050:scores.filter(x=>x.holdout>=0.05).length});
}
/* Three truly planted native-text controls, recovered by an all-841 key
 * scan that receives only the encrypted plant and the fixed language gate. */
const nativeWordPositions=positiveNative.flatMap(w=>w.seq);
assert.equal(nativeWordPositions.length,12956);
let offset=0;const nativePages=originalPages.map(p=>{
 const block=nativeWordPositions.slice(offset,offset+p.indices.length);
 offset+=p.indices.length;return {page:p.page,indices:block};
});
const positiveAffine=[];
for(const [a,b,mode] of [[3,19,"book"],[17,4,"page"],[26,23,"book"]]){
 const plant=affine(nativePages,a,b,mode,"encode"), scores=[];
 for(let aa=0;aa<29;aa++)for(let bb=0;bb<29;bb++)
  scores.push({a:aa,b:bb,train:ioc(affine(plant,aa,bb,mode,"decode"),train)});
 scores.sort((x,y)=>y.train-x.train);
 assert.equal(scores[0].a,a);assert.equal(scores[0].b,b);
 const replay=affine(affine(plant,a,b,mode,"decode"),a,b,mode,"encode");
 assert.deepEqual(replay,plant);
 positiveAffine.push({mode,trueKey:[a,b],recoveredTop:scores[0],
  nextWrong:scores[1]});
}
console.log(JSON.stringify({
 source:{runes:12956,words:2896,crossPageWords:32},
 theorem:"same (a,(b+c+d)%29,e,f) in any six-plaintext-window forces identical final ciphertext pair under all 29!^29 secret row tables",
 originalBounds,nativeStats,positivePermutation:"PASS",
 affine:{originalAffine,positiveAffine},
 conclusion:"No plaintext/key found. Sum4 generic unknown. Only full 841-key affine subfamily rejected under these source-native controls."
},null,2));
