#!/usr/bin/env node
'use strict';
/*
 * Source-exact p6 -> p27 candidate navigation, and an adversarial census
 * over ALL original p0-55 physical red rubrics.
 *
 * The connection was noticed RETROSPECTIVELY, not a blinded prediction.
 * A matching source-page fingerprint is neither a decrypting operation nor
 * proof of author intent. Reproduce with:
 *    node sims/lp2_p6_p27_red_rubric_link_sft.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const transcript=load('resources/liber-primus/lp2-transcription.txt').split('%');
const runeID=new Map(gp.runes.map((glyph,i)=>[glyph,i]));
const unknown=gp.pages.filter(p=>p.page>=0&&p.page<=55);
assert.equal(unknown.length,56);
const table=[];
for(const page of unknown){
 const ann=ink.pages.find(x=>x.page===page.page);
 const raw=transcript[page.page>=51?page.page-1:page.page];
 if(page.page===50){assert.equal(page.indices.length,0);continue;}
 assert.ok(raw);
 const words=[];let cur=[],i=0;
 for(const symbol of raw){
   if(runeID.has(symbol)){
     assert.equal(page.indices[i],runeID.get(symbol),'transcription mismatch');
     cur.push(i++);
   } else if('-.&$§'.includes(symbol)){
     if(cur.length){words.push(cur);cur=[];}
   }
 }
 if(cur.length)words.push(cur);
 assert.equal(i,page.indices.length);
 const isRed=Array(page.indices.length).fill(false);
 for(const span of ann?.red_spans||[])
   for(let k=span.start;k<span.start+span.length;k++)isRed[k]=true;
 for(const span of ann?.red_spans||[]){
   const inside=words.filter(w=>w[0]>=span.start&&w.at(-1)<span.start+span.length);
   const black=words.find(w=>w[0]===span.start+span.length && w.every(k=>!isRed[k]));
   const sum=black?.reduce((s,k)=>s+page.indices[k],0);
   table.push({
     page:page.page,red_start:span.start,red_end:span.start+span.length,
     red_length:span.length,
     red_word_lengths:inside.map(w=>w.length),
     red_singleton:inside.filter(w=>w.length===1).map(w=>page.indices[w[0]]),
     following_black_word_start:black?.[0]??null,
     following_black_word_length:black?.length??null,
     following_black_word_sum:sum??null,
     following_black_word_gp0:sum===undefined?null:sum%29,
     following_black_word_codes:black?.map(i=>page.indices[i])??null
   });
 }
}
assert.equal(table.length,16);
const p6=table.find(t=>t.page===6),p27=table.find(t=>t.page===27);
assert.ok(p6&&p27);
assert.deepEqual(p6.red_word_lengths,[4,1,4,2]);
assert.deepEqual(p6.red_singleton,[19]); // isolated original red M
assert.equal(p6.red_start,71);assert.equal(p6.red_end,82);
assert.deepEqual([p6.following_black_word_start,p6.following_black_word_length,
  p6.following_black_word_sum,p6.following_black_word_gp0],[82,7,118,2]);
assert.deepEqual(p27.red_word_lengths,[3,12,4]);
assert.equal(p27.red_start,0);assert.equal(p27.red_end,19);
assert.deepEqual([p27.following_black_word_start,p27.following_black_word_length,
  p27.following_black_word_sum,p27.following_black_word_gp0],[19,7,60,2]);
assert.equal(unknown[27].indices[0],19); // same M as p6 singleton
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterMatches=chapterStarts.filter(p=>unknown[p].indices[0]===19);
assert.deepEqual(chapterMatches,[27]); // a unique red-chapter opening M
const successorMatches=table.filter(r=>r.following_black_word_length===7
  &&r.following_black_word_gp0===2).map(r=>r.page);
assert.deepEqual(successorMatches,[6,27]);
const successorPairs={};
for(const t of table)if(t.following_black_word_length!==null){
 const k=t.following_black_word_length+':'+t.following_black_word_gp0;
 (successorPairs[k]??=[]).push(t.page);
}
const duplicatedSuccessorPairs=Object.entries(successorPairs)
 .filter(([signature,pg])=>pg.length>1);
assert.deepEqual(duplicatedSuccessorPairs,[['7:2',[6,27]]]);
const delta=p6.following_black_word_codes.map((v,i)=>
 ((v-p27.following_black_word_codes[i])%29+29)%29);
assert.equal(delta.reduce((a,b)=>a+b,0)%29,0);
console.log(JSON.stringify({
  classification:'retrospective source-visible navigation, no cipher key or plaintext',
  physically_printed_ink_spans:table.length,chapterStarts,
  unique_chapter_matching_p6_red_singleton_M:chapterMatches,
  p6,p27,all_red_spans:table,duplicatedSuccessorPairs,
  p6_p27_successor_differences_gp29:delta,
  missing_instruction:'no authored rule selects a seven-rune recipient or inverse'
},null,2));
