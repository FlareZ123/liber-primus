"use strict";
/**
 * Original LP2 successor-row gate for every one of 29 possible fixed
 * plaintext markers and each completely arbitrary stationary secret row.
 * Reproduce: node sims/all29_marker_successor_support.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=require("./ea_successor_allsecret_gate.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const meta=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=meta.pages.filter(p=>p.page<=55&&p.indices.length);
const references=[
 ["Shakespeare","resources/control/shakespeare_first300k.txt",218800,26,24],
 ["Gibran","resources/control/gibran_prophet_58585.txt",63114,25,23],
 ["Emerson","resources/control/emerson_essays_2944.txt",324630,27,23]
];
/** @param {number[]} src @param {number} r */
function successors(src,r){
 const a=[];
 for(let i=1;i<src.length;i++)if(src[i-1]===r&&src[i]!==r)a.push(src[i]);
 return a;
}
/** @param {number[]} source */
function census(source){
 return Array.from({length:29},(_,r)=>{
  const next=successors(source,r),s=base.stats(next);
  const w=next.length>=85?base.exactWindows(next,85):null;
  return {marker:r,name:meta.translit[r],events:next.length,
    distinctAnywhere:s.distinct,windows:w?.windows||0,
    maximum85WindowDistinct:w?.maximumDistinct||0};
 });
}
/**
 * Source-native non-EA marker E=18 with every preceding plaintext GP rune
 * owning its own independent secret 28-way permutation.
 * @param {number[]} source
 */
function positive(source){
 const marker=18;
 let seed=0x19e3301;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 const symbols=Array.from({length:29},(_,i)=>i).filter(i=>i!==marker);
 const rows=[],inverse=[];
 for(let prev=0;prev<29;prev++){
  const steps=Array.from({length:28},(_,i)=>i+1);
  for(let k=27;k>0;k--){const j=random()%(k+1);[steps[k],steps[j]]=[steps[j],steps[k]];}
  const r=Array(29).fill(0),v=Array(29).fill(-1);
  for(let k=0;k<28;k++){r[symbols[k]]=steps[k];v[steps[k]]=symbols[k];}
  rows.push(r);inverse.push(v);
 }
 const plain=source.slice(18000,18000+12956);assert.equal(plain.length,12956);
 let at=0,total=0;
 const ciphertext=[];
 for(const page of pages){
  const p=plain.slice(at,at+page.indices.length);
  const c=[p[0]],decoded=[p[0]];
  for(let i=1;i<p.length;i++){
   const step=p[i]===marker?0:rows[p[i-1]][p[i]];
   c.push((c[i-1]+step)%29);
   const x=(c[i]-c[i-1]+29)%29;
   decoded.push(x?inverse[decoded[i-1]][x]:marker);
   assert.equal(decoded[i],p[i]);
   assert.equal(x,decoded[i]===marker?0:rows[decoded[i-1]][decoded[i]]);
  }
  assert.deepEqual(p,decoded);
  ciphertext.push({indices:c});
  total+=decoded.length;at+=p.length;
 }
 assert.equal(total,12956);
 const e=base.markerSuccessors(ciphertext),s=base.stats(e.steps);
 return {marker,fullDecoded:total,fullReencrypted:total,zeroEvents:e.markers,
  postMarkerEvents:s.n,distinctPostSteps:s.distinct};
}
function run(){
 assert.equal(pages.length,55);
 const orig=base.markerSuccessors(pages),os=base.stats(orig.steps);
 assert.equal(orig.markers,86);assert.equal(os.n,85);assert.equal(os.distinct,28);
 const reports=[],texts=[];
 for(const [name,file,expected,full,window85] of references){
  const source=base.encode(read(file));assert.equal(source.length,expected);
  const rows=census(source);
  const maximumFull=Math.max(...rows.map(x=>x.distinctAnywhere));
  const maximum85=Math.max(...rows.map(x=>x.maximum85WindowDistinct));
  assert.equal(maximumFull,full);assert.equal(maximum85,window85);
  assert(rows.every(x=>x.distinctAnywhere<28));
  texts.push(source);
  reports.push({name,runes:expected,all29MarkersTested:true,
    fullSourceMaximumDistinctSuccessors:maximumFull,
    85EventMaximumDistinctSuccessors:maximum85,
    85EventWindows:rows.reduce((n,x)=>n+x.windows,0),rows});
 }
 const plant=positive(texts[0]);
 const result={classification:"Conditional all-secret fixed-marker negative for three finite native GP-English sources, no LP2 plaintext recovered",
 original:{repeatEvents:orig.markers,usableSuccessors:os.n,distinctNonzeroSteps:os.distinct,maximumMultiplicity:os.maximum},
 controls:reports,nonEAMarkerPositive:plant,
 invariant:"Any single fixed plaintext marker r producing every zero step forces all 28 other GP rune types to follow r across the 85 observed post-repeat sites, regardless of the arbitrary stationary secret predecessor-plaintext row. None of all 29 marker GP runes has 28 distinct immediate successors anywhere in each full source.",
 scope:"Original GP29 output numerical order and a single stationary previous-plaintext-conditioned 28-permutation row; excluded are only the three supplied finite GP-English registers. Evolving pad/state, ciphertext feedback, altered orthography and unknown language are open."};
 console.log(JSON.stringify(result,null,2));return result;
}
if(require.main===module)run();
module.exports={successors,census,positive,run};
