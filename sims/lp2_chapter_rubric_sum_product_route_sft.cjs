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

// Bounded adversarial alternative-operator census: give each original
// chapter-opening black word nine conventional GP29 aggregate operations,
// then check all 72 *ordered distinct* IN/OUT function pairs on this SAME
// original source and chapter set. No signed-target scoring or learned key.
// The vocabulary is an exploratory control, not proof of independent author
// selection, since it too was formulated after the sum/product chain emerged.
const primeValues=[];
for(let candidate=2;primeValues.length<29;candidate++)
  if(primeValues.every(p=>candidate%p!==0))primeValues.push(candidate);
const mod29=x=>((x%29)+29)%29;
const operationVocabulary={
 rune_count:a=>a.length,
 rune_sum:a=>mod29(a.reduce((s,x)=>s+x,0)),
 rune_product:a=>a.reduce((s,x)=>s*x%29,1),
 prime_sum:a=>mod29(a.reduce((s,x)=>s+primeValues[x],0)),
 prime_product:a=>a.reduce((s,x)=>s*primeValues[x]%29,1),
 first_rune:a=>a[0],
 last_rune:a=>a.at(-1),
 first_plus_last:a=>mod29(a[0]+a.at(-1)),
 first_times_last:a=>mod29(a[0]*a.at(-1))
};
const comparison=[],operators=Object.keys(operationVocabulary);
for(const input of operators)for(const output of operators){
 if(input===output)continue;
 const inValues=records.map(r=>operationVocabulary[input](r.runes));
 const outValues=records.map(r=>operationVocabulary[output](r.runes));
 const adjacency=edges(inValues,outValues);
 let any5=false,p05=false,p0ToP40=false;
 for(let begin=0;begin<chapters.length;begin++){
   const seenPaths=[];
   const walk=(pos,visited,history)=>{
     if(history.length>=5){
       any5=true;
       if(begin===0)p05=true;
       if(begin===0&&pos===7)p0ToP40=true;
     }
     if(history.length>=9)return;
     for(const next of adjacency[pos])if(!(visited&(1<<next)))
       walk(next,visited|(1<<next),[...history,next]);
   };
   walk(begin,1<<begin,[begin]);
 }
 comparison.push({input,output,any5,p05,p0ToP40});
}
assert.equal(comparison.length,72);
assert.equal(comparison.filter(x=>x.any5).length,2);
assert.equal(comparison.filter(x=>x.p05).length,1);
assert.equal(comparison.filter(x=>x.p0ToP40).length,1);
assert.deepEqual(comparison.filter(x=>x.p05).map(x=>[x.input,x.output]),
 [['rune_sum','rune_product']]);

// A stronger adverse source-field grammar: not only which of nine arithmetic
// operations but which immediately accessible printed word/block at each
// original chapter opening. All eight fields are fixed *once* and applied
// across all nine chapters without switching selection rule between pages.
// The candidates are "first/last red word", "whole contiguous red rubric",
// first/second/third black word, first TWO black words joined, last physical
// black fragment on the same page. They are typographic controls and include
// source-derived fields, not individually optimized target receivers.
const sourceSelectors=[
 'first_red','last_red','whole_red',
 'first_black','second_black','third_black','first_two_black','last_black'
];
const sourceFields=chapters.map(p=>{
 const source=gp.pages[p].indices,annotation=ink.pages.find(a=>a.page===p);
 let end=annotation.red_spans[0].length;
 for(let z=1;z<annotation.red_spans.length
   &&annotation.red_spans[z].start===end;z++)
   end+=annotation.red_spans[z].length;
 const words=[],text=trans[p>=51?p-1:p];let cur=[],offset=0;
 for(const glyph of text){
   if(rid.has(glyph)){assert.equal(source[offset],rid.get(glyph));cur.push(offset++);}
   else if('-.&$§'.includes(glyph)&&cur.length){words.push(cur);cur=[];}
 }
 if(cur.length)words.push(cur);
 assert.equal(offset,source.length);
 const reds=words.filter(w=>w[0]>=0&&w.at(-1)<end);
 const blacks=words.filter(w=>w[0]>=end);
 assert.ok(reds.length&&blacks.length>=3);
 const values=w=>w.map(i=>source[i]);
 return {
   first_red:values(reds[0]),
   last_red:values(reds.at(-1)),
   whole_red:source.slice(0,end),
   first_black:values(blacks[0]),
   second_black:values(blacks[1]),
   third_black:values(blacks[2]),
   first_two_black:values([...blacks[0],...blacks[1]]),
   last_black:values(blacks.at(-1))
 };
});
for(let i=0;i<chapters.length;i++)
 assert.deepEqual(sourceFields[i].first_black,records[i].runes);
const selectorCensus=[];
for(const selector of sourceSelectors){
 const samples=sourceFields.map(s=>s[selector]);
 let any5=0,p05=0,reach40=0;
 for(const input of operators)for(const output of operators){
   if(input===output)continue;
   const inputValues=samples.map(operationVocabulary[input]);
   const outputValues=samples.map(operationVocabulary[output]);
   const e=edges(inputValues,outputValues);
   let anyMatch=false,p0Match=false,reachesTable=false;
   const walk=(at,seen,len,start)=>{
     if(len>=5){
       anyMatch=true;
       if(start===0){
         p0Match=true;
         if(at===7)reachesTable=true;
       }
     }
     if(len>=9)return;
     for(const next of e[at])if(!(seen&(1<<next)))
       walk(next,seen|(1<<next),len+1,start);
   };
   for(let begin=0;begin<chapters.length;begin++)
     walk(begin,1<<begin,1,begin);
   any5+=Number(anyMatch);
   p05+=Number(p0Match);
   reach40+=Number(reachesTable);
 }
 selectorCensus.push({selector,ordered_pairs:operators.length*(operators.length-1),
   any_five_chapter: any5,p0_five_chapter:p05,
   p0_to_p40_at_five_or_more:reach40});
}
assert.deepEqual(selectorCensus.map(x=>
 [x.any_five_chapter,x.p0_five_chapter,x.p0_to_p40_at_five_or_more]),
 [[0,0,0],[0,0,0],[0,0,0],[2,1,1],
  [0,0,0],[0,0,0],[0,0,0],[2,0,0]]);

// Cross-corpus scope control: the original book also has TWO independently
// solved red-heading pages p56/p57. Do not omit them merely to force a
// favorable uniqueness result. Apply the ALREADY FROZEN first-black-word
// sum->product rule to both, without changing the nine unknown headings.
// Solved-page GP indices are in the same canonical corpus, not guessed.
const solvedHeadingResults=[];
for(const page of [56,57]){
 const source=gp.pages[page].indices;
 const inkPage=ink.pages.find(x=>x.page===page);
 assert.equal(inkPage.red_spans[0].start,0);
 let end=inkPage.red_spans[0].length;
 for(let j=1;j<inkPage.red_spans.length&&inkPage.red_spans[j].start===end;j++)
   end+=inkPage.red_spans[j].length;
 const str=trans[page-1],words=[];let cur=[],offset=0;
 for(const glyph of str){
   if(rid.has(glyph)){
     assert.equal(source[offset],rid.get(glyph),'solved '+page+' transcript');
     cur.push(offset++);
   }else if('-.&$§'.includes(glyph)&&cur.length){
     words.push(cur);cur=[];
   }
 }
 if(cur.length)words.push(cur);
 assert.equal(offset,source.length);
 const firstBlack=words.find(w=>w[0]===end);
 assert.ok(firstBlack);
 const nums=firstBlack.map(i=>source[i]);
 solvedHeadingResults.push({
   page,runes:nums,
   length:nums.length,
   sum:operationVocabulary.rune_sum(nums),
   product:operationVocabulary.rune_product(nums)
 });
}
assert.deepEqual(solvedHeadingResults.map(p=>[p.page,p.length,p.sum,p.product]),
 [[56,5,18,16],[57,4,24,20]]);
const augmentedIn=[
 ...records.map(r=>r.sum),...solvedHeadingResults.map(r=>r.sum)];
const augmentedOut=[
 ...records.map(r=>r.product),...solvedHeadingResults.map(r=>r.product)];
const augmentedGraph=augmentedOut.map(v=>augmentedIn.flatMap((x,j)=>x===v?[j]:[]));
assert.equal(augmentedGraph.length,11);
for(let i=0;i<chapters.length;i++)
 assert.deepEqual(augmentedGraph[i],graph[i]);
assert.deepEqual(augmentedGraph.slice(9),[[],[]]);
// Eleven-page operator-vocabulary control: for each ordered pair of the
// exact same 9 operations, check ALL possible original p0 paths with two
// newly admitted solved headings. The original p0->p40 path stays unique.
let augmentedP0FiveCount=0;
for(const input of operators)for(const output of operators){
 if(input===output)continue;
 const allValues=[...records.map(r=>r.runes),...solvedHeadingResults.map(r=>r.runes)];
 const lhs=allValues.map(operationVocabulary[input]);
 const rhs=allValues.map(operationVocabulary[output]);
 const e=rhs.map(v=>lhs.flatMap((x,j)=>x===v?[j]:[]));
 let hasFive=false;
 const walk=(node,seen,len)=>{
   if(len>=5){hasFive=true;return;}
   for(const next of e[node])if(!(seen&(1<<next)))
     walk(next,seen|(1<<next),len+1);
 };
 walk(0,1,1);
 if(hasFive)augmentedP0FiveCount++;
}
assert.equal(augmentedP0FiveCount,1);
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
 solved_page_holdout:{
   excluded_from_nine_unknown_chapter_nulls:[56,57],
   source_first_black_words:solvedHeadingResults,
   retained_original_chapter_edges:true,
   eleven_heading_operator_pairs_with_p0_at_least_five:augmentedP0FiveCount
 },
 original_eight_source_selector_by_nine_operator_census:{
   selectors:sourceSelectors,operation_pairs_per_selector:72,
   total_source_typed_trials:selectorCensus.length*72,
   results:selectorCensus,
   warning:'bounded retrospectively selected typographic/operation vocabulary, not a global authorship p-value'
 },
 nine_operation_grammar_census:{
   candidate_operations:operators,ordered_distinct_pairs:comparison.length,
   any_five_chapter_chain:comparison.filter(x=>x.any5),
   five_chapter_chain_starting_at_p0:comparison.filter(x=>x.p05),
   p0_chain_reaching_numeric_chapter_p40:comparison.filter(x=>x.p0ToP40),
   warning:'finite post-discovery vocabulary; NOT a discovery-wide probability'
 },
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
