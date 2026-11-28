#!/usr/bin/env node
'use strict';
/*
 * Original LP2 chapter-rubric SUM->PRODUCT navigation census.
 *
 * This operation was noticed after inspecting the original source; its
 * nulls are CONDITIONAL and not discovery-adjusted author attribution.
 * Neither the original page nor the published Cicada material explicitly
 * instructs sum(product)-linking. It recovers no unknown plaintext.
 *
 * Usage: node sims/lp2_chapter_rubric_sum_product_route_sft.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const trans=read('resources/liber-primus/lp2-transcription.txt').split('%');
const rid=new Map(gp.runes.map((r,i)=>[r,i]));
const chapters=[0,3,8,15,23,27,33,40,54];
const requiredLengths=[4,4,3,4,8,7,2,5,8];
const originalSums=[15,9,23,22,25,2,5,27,19];
const originalProducts=[23,11,2,13,16,19,3,3,27];
const records=[],controls=[];
for(let index=0;index<chapters.length;index++){
 const p=chapters[index],source=gp.pages[p].indices;
 const annotation=ink.pages.find(x=>x.page===p);
 assert.ok(annotation?.red_spans?.length);
 const rubrics=annotation.red_spans.slice().sort((a,b)=>a.start-b.start);
 assert.equal(rubrics[0].start,0);
 let redEnd=rubrics[0].start+rubrics[0].length;
 // A physically contiguous pair of red rubrics (p15) is ONE page opener.
 for(let r=1;r<rubrics.length&&rubrics[r].start===redEnd;r++)
   redEnd+=rubrics[r].length;
 const isRed=Array(source.length).fill(false);
 for(const span of rubrics)
   for(let k=span.start;k<span.start+span.length;k++)isRed[k]=true;
 const text=trans[p>=51?p-1:p];
 const words=[];let cur=[],offset=0;
 for(const c of text){
   if(rid.has(c)){
     assert.equal(source[offset],rid.get(c),'page'+p+' original');
     cur.push(offset++);
   }else if('-.&$§'.includes(c)&&cur.length){
     words.push(cur);cur=[];
   }
 }
 if(cur.length)words.push(cur);
 assert.equal(offset,source.length);
 const target=words.find(w=>w[0]===redEnd&&w.every(k=>!isRed[k]));
 assert.ok(target,'no first black word after chapter rubric p'+p);
 assert.equal(target.length,requiredLengths[index]);
 const numeric=word=>word.map(k=>source[k]);
 const summarize=word=>{
   const n=numeric(word);
   return {runes:n,length:n.length,raw_sum:n.reduce((s,x)=>s+x,0),
     sum:n.reduce((s,x)=>s+x,0)%29,
     product:n.reduce((s,x)=>s*x%29,1)};
 };
 const item=summarize(target);
 assert.equal(item.sum,originalSums[index]);
 assert.equal(item.product,originalProducts[index]);
 records.push({page:p,red_start:0,red_end:redEnd,first_black_start:target[0],
   ...item});
 const pool=words.filter(w=>w.length===item.length&&w.every(k=>!isRed[k]))
   .map(summarize);
 assert.ok(pool.length>0);
 controls.push(pool);
}
assert.deepEqual(controls.map(x=>x.length),[11,6,10,7,2,5,13,8,5]);
function edges(sums,products){
 return products.map(pr=>sums.flatMap((su,i)=>pr===su?[i]:[]));
}
function pathInfo(e,start,target){
 let max=0,reaches=false;
 const walk=(current,seen,depth)=>{
   if(depth>max)max=depth;
   if(current===target&&depth>=5)reaches=true;
   if(depth===9)return;
   for(const j of e[current])if(!(seen&(1<<j)))
     walk(j,seen|(1<<j),depth+1);
 };
 walk(start,1<<start,1);
 return {max,reaches};
}
const graph=edges(originalSums,originalProducts);
const mainPath=[0,8,27,54,40];
for(let k=0;k<mainPath.length-1;k++){
 const i=chapters.indexOf(mainPath[k]),j=chapters.indexOf(mainPath[k+1]);
 assert.deepEqual(graph[i],[j]);
}
assert.deepEqual(graph[chapters.indexOf(40)],[]);
assert.equal(pathInfo(graph,0,7).max,5);
// Exact conditional null: fix all nine original sums and the multiset of
// all nine original products, permute products among the nine page labels.
// This preserves *every* observed marginal value, including duplicate 3.
const n=chapters.length,used=Array(n).fill(false),perm=Array(n);
let total=0,any5=0,p05=0,p0ToP40=0,any6=0;
function exhaust(k){
 if(k===n){
   total++;
   const es=edges(originalSums,perm),p0=pathInfo(es,0,7);
   if(p0.max>=5)p05++;
   if(p0.reaches)p0ToP40++;
   let m=0;
   for(let i=0;i<n;i++)m=Math.max(m,pathInfo(es,i,7).max);
   if(m>=5)any5++;
   if(m>=6)any6++;
   return;
 }
 for(let i=0;i<n;i++)if(!used[i]){
   used[i]=true;perm[k]=originalProducts[i];exhaust(k+1);used[i]=false;
 }
}
exhaust(0);
assert.deepEqual([total,any5,p05,p0ToP40,any6],
 [362880,14400,2880,720,0]);
// Conditional source-native word null: for EACH original chapter opener,
// choose a whole BLACK word of the SAME rune length ON THAT PAGE,
// holding all nine chapter slots fixed. Multi-target edges are permitted
// in controls, so repeated sums do not have to be broken by a fitted tie.
let seed=0xAE74172B;
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const trials=100000;
let any5MC=0,p05MC=0,p0ToP40MC=0;
for(let trial=0;trial<trials;trial++){
 const sums=[],products=[];
 for(let i=0;i<n;i++){
   const w=controls[i][next()%controls[i].length];
   sums.push(w.sum);products.push(w.product);
 }
 const es=edges(sums,products),r=pathInfo(es,0,7);
 if(r.max>=5)p05MC++;
 if(r.reaches)p0ToP40MC++;
 let longest=0;
 for(let i=0;i<n;i++)longest=Math.max(longest,pathInfo(es,i,7).max);
 if(longest>=5)any5MC++;
}
assert.deepEqual([any5MC,p05MC,p0ToP40MC],[1009,170,35]);
console.log(JSON.stringify({
 classification:'retrospective original-page navigation hypothesis; no unknown plaintext',
 chapter_pages:chapters,chapter_records:records,
 main_original_path:mainPath,edges:graph.map((ar,i)=>({
   page:chapters[i],to:ar.map(j=>chapters[j])})),
 conditional_fixed_marginal_product_permutation:{
   permutations:total,any_chain_at_least_5:any5,p0_chain_at_least_5:p05,
   p0_to_numeric_chapter_p40_at_depth_at_least_5:p0ToP40,
   chains_at_least_6:any6
 },
 page_and_length_matched_source_word_null:{
   seed:'xorshift32 0xAE74172B',trials,
   alternatives_per_page:controls.map(x=>x.length),
   any_chain_at_least_5:any5MC,p0_chain_at_least_5:p05MC,
   p0_to_numeric_chapter_p40_at_depth_at_least_5:p0ToP40MC
 },
 limitations:'sum/product operator, page-word selection and terminal meaning were retrospectively inferred; no decryption receiver or key stream'
},null,2));
