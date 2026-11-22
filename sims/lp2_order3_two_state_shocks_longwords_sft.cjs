"use strict";
/**
 * All-secret two state-changing key shocks in original LP2 GP29 words.
 * C=P+K mod29; K[t]=a*K[t-1]+b*K[t-2]+c*K[t-3], with
 * arbitrary three seed runes and all three unknown taps per source word.
 * At two distinct postseed, preterminal indices, replace the key output
 * and feed the changed value into future recurrence state.
 * Exact exhaustive inverse, never choose a crib, tap, shock or seed.
 *
 * Run: node sims/lp2_order3_two_state_shocks_longwords_sft.cjs
 * Windows Node22 CJS; read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const dictionary=read("resources/control/dwyl-english-alpha-gp13-14-only.txt").trim().split(/\r?\n/);
const pools={13:[],14:[]};
for(const word of dictionary){
 const plain=encodeSourceNativeGP(word);
 assert(pools[plain.length]);
 pools[plain.length].push({word,plain});
}
assert.deepEqual([pools[13].length,pools[14].length],[17772,11457]);
const lookup=new Map(gp.runes.map((r,i)=>[r,i]));
const sources=parseSharedCorpus().words.filter(w=>w.length>=13).map(w=>({
 page:physicalLP2Page(w.startPage),
 C:[...w.runes].map(c=>lookup.get(c))
}));
assert.deepEqual(sources.map(w=>[w.page,w.C.length]),
 [[11,13],[13,14],[16,13],[25,14],[43,14],[52,13],[55,13]]);
const mod=x=>(x%29+29)%29;
const inv=Array(29).fill(0);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
function recover(rows,first,second){
 const base=[null,null,null];let rank=0;
 for(let i=0;i<rows.length;i++){
  if(i===first||i===second)continue;
  const row=rows[i].slice();let installed=false;
  for(let col=0;col<3;col++){
   if(!row[col])continue;
   if(base[col]===null){
    const v=inv[row[col]];
    for(let j=col;j<4;j++)row[j]=mod(row[j]*v);
    base[col]=row;rank++;installed=true;break;
   }
   const v=row[col];
   for(let j=col;j<4;j++)row[j]=mod(row[j]-v*base[col][j]);
  }
  if(!installed&&row[3])return null;
 }
 if(rank<3)return {rank};
 const taps=[0,0,0];
 for(let i=2;i>=0;i--){
  let v=base[i][3];
  for(let j=i+1;j<3;j++)v-=base[i][j]*taps[j];
  taps[i]=mod(v);
 }
 return {rank,taps};
}
/** @param {number[]} K */
function scan(K){
 const rows=Array.from({length:K.length-3},(_,i)=>[
  K[i+2],K[i+1],K[i],K[i+3]
 ]);
 const hits=[];let nonunique=0;
 // A terminal shock cannot be distinguished from an unconstrained tail.
 for(let first=0;first<rows.length-1;first++)
 for(let second=first+1;second<rows.length-1;second++){
  const r=recover(rows,first,second);
  if(r===null)continue;
  if(r.rank<3){nonunique++;continue}
  const bad=[];
  for(let i=0;i<rows.length;i++){
   const v=rows[i];
   if(mod(r.taps[0]*v[0]+r.taps[1]*v[1]+r.taps[2]*v[2]-v[3]))
    bad.push(i);
  }
  if(bad.length===2&&bad[0]===first&&bad[1]===second)
   hits.push({first:first+3,second:second+3,taps:r.taps});
 }
 return {hits,nonunique};
}
const positiveWord=encodeSourceNativeGP("CIRCUMFERENCES");
assert.equal(positiveWord.length,14);
assert(gp.pages.find(p=>p.page===57).indices.join(",")
 .includes(positiveWord.join(",")));
const taps=[27,5,15],K=[2,6,19];
for(let i=3;i<positiveWord.length;i++){
 let v=mod(taps[0]*K[i-1]+taps[1]*K[i-2]+taps[2]*K[i-3]);
 if(i===6)v=mod(v+4);
 if(i===10)v=mod(v+5);
 K.push(v);
}
const encrypted=positiveWord.map((v,i)=>mod(v+K[i]));
const regenerated=encrypted.map((v,i)=>mod(v-positiveWord[i]));
assert.deepEqual(K,regenerated);
assert.deepEqual(scan(regenerated),{hits:[{first:6,second:10,taps}],nonunique:0});
let comparisons=0,fullHits=0,underdetermined=0;
const pages=[];
for(const {page,C} of sources){
 const pool=pools[C.length];
 let matches=0,nonunique=0;
 for(const {plain} of pool){
  const key=C.map((c,i)=>mod(c-plain[i]));
  const result=scan(key);
  matches+=result.hits.length;
  nonunique+=result.nonunique;
 }
 comparisons+=pool.length;fullHits+=matches;underdetermined+=nonunique;
 pages.push({page,length:C.length,comparisons:pool.length,
  compatible:matches,consistentNonunique:nonunique});
}
assert.equal(comparisons,105459);
assert.equal(fullHits,0);
assert.equal(underdetermined,0);
console.log(JSON.stringify({
 family:"all-secret order3 GP29 additive key with exactly two state-changing shocks after seed, before final observed state",
 original:{pages,comparisons,fullHits,underdetermined},
 nativeGPPlantedControl:{word:"CIRCUMFERENCES",seed:[2,6,19],
  taps,shockIndices:[6,10],fullInverseRecovered:true},
 verdict:"No matched source-native English original longword under the stated exact mechanism; no creator key or unknown-page plaintext."
},null,2));
console.log("PASS: two state shocks, all secret order3 GF29 taps and source-native longwords");
