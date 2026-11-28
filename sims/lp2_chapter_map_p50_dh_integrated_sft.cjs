#!/usr/bin/env node
'use strict';
/*
 * Fully fixed composite original-source route:
 * nine physical red chapter starts -> GP29 first-black-word sum/product
 * -> p40 chapter containing 32x8 p49-51 panel -> source-visible
 * missing 'f' radix59 pointer -> original mirror -> DH23 readout.
 *
 * CRITICAL EVIDENCE CLASS: post-discovery composition of separately
 * tested puzzle-signature hypotheses; NO independent first-party
 * instruction authenticates the sum/product navigation or byte codec.
 * This program recovers NO UNKNOWN LP2 PLAINTEXT.
 *
 * Usage: node sims/lp2_chapter_map_p50_dh_integrated_sft.cjs
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const book=JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const red=JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const transcript=load('resources/liber-primus/lp2-transcription.txt').split('%');
const table=JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const ids=new Map(book.runes.map((r,i)=>[r,i]));
const chapters=[0,3,8,15,23,27,33,40,54];
const mod=(n,m)=>(n%m+m)%m;
const records=chapters.map(p=>{
 const source=book.pages[p].indices,ink=red.pages.find(z=>z.page===p);
 assert.equal(ink.red_spans[0].start,0);
 let titleEnd=ink.red_spans[0].length;
 for(let j=1;j<ink.red_spans.length&&ink.red_spans[j].start===titleEnd;j++)
   titleEnd+=ink.red_spans[j].length;
 const parts=transcript[p>=51?p-1:p];
 const words=[];let cur=[],count=0;
 for(const ch of parts){
   if(ids.has(ch)){assert.equal(source[count],ids.get(ch));cur.push(count++);}
   else if('-.&$§'.includes(ch)&&cur.length){words.push(cur);cur=[];}
 }
 if(cur.length)words.push(cur);
 assert.equal(count,source.length);
 const first=words.find(w=>w[0]===titleEnd);
 assert.ok(first);
 const word=first.map(i=>source[i]);
 return {page:p,titleEnd,word,firstBlackStart:first[0],
   in:word.reduce((s,n)=>s+n,0)%29,
   out:word.reduce((s,n)=>s*n%29,1)};
});
assert.deepEqual(records.map(x=>x.in),[15,9,23,22,25,2,5,27,19]);
assert.deepEqual(records.map(x=>x.out),[23,11,2,13,16,19,3,3,27]);
const route=[0];const hopValues=[],visited=new Set([0]);let cursor=0;
while(true){
 const current=records.find(x=>x.page===cursor);
 const targets=records.filter(x=>x.in===current.out);
 if(!targets.length)break;
 assert.equal(targets.length,1);
 const to=targets[0].page;
 assert(!visited.has(to));
 hopValues.push(current.out);
 route.push(to);visited.add(to);cursor=to;
}
assert.deepEqual(route,[0,8,27,54,40]);
assert.deepEqual(hopValues,[23,2,19,27]);
assert.equal(records.find(x=>x.page===40).out,3);
const finalChapterStart=40,finalChapterEnd=53;
assert.deepEqual(table.pages.map(p=>p.page),[49,50,51]);
assert(table.pages.every(p=>p.page>=finalChapterStart&&p.page<=finalChapterEnd));
assert.equal(table.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const alpha59=table.alphabet.replace('f','');
assert.equal(alpha59.length,59);
const cells=table.pages.flatMap(p=>p.tokens);
assert.equal(cells.length,256);
assert(!cells.some(t=>t.includes('f')));
const values=cells.map(t=>alpha59.indexOf(t[0])*59+alpha59.indexOf(t[1]));
assert(values.every(v=>Number.isInteger(v)&&v>=0&&v<256));
const sink=189;
assert.equal(values[sink],sink);
// All256 start positions ultimately flow to the sink, no other cycle.
for(let i=0;i<256;i++){
 let current=i,seen=new Set();
 while(current!==sink){
   assert(!seen.has(current),'non-sink cycle starting '+i);
   seen.add(current);
   current=values[current];
 }
}
const p=sink>>>3; // 189/8 rounded down =23
const g=sink%8;   //5
assert.deepEqual([p,g],[23,5]);
const A=8;
const mirrored=sink-g+(A-1-g);
assert.equal(mirrored,186);
const K=mirrored%8;
const B=values[mirrored];
assert.deepEqual([K,B],[2,19]);
const mPow=(x,n,m)=>{let y=1;for(let k=0;k<n;k++)y=y*x%m;return y;};
const findExp=(x,y,m)=>{
 const matches=Array.from({length:m-1},(_,i)=>i+1)
   .filter(e=>mPow(x,e,m)===y);
 assert.equal(matches.length,1);
 return matches[0];
};
const a=findExp(g,A,p),b=findExp(g,B,p);
const e=Array.from({length:p-1},(_,i)=>i+1)
 .find(v=>b*v%(p-1)===1);
assert.deepEqual([p,g,a,b,A,B,K,e],[23,5,6,15,8,19,2,3]);
assert.equal(mPow(B,a,p),K);
const ret=[mirrored];const visitedPtr=new Set();
while(ret.at(-1)!==sink){
 const q=ret.at(-1);
 assert(!visitedPtr.has(q));visitedPtr.add(q);
 ret.push(values[q]);
}
assert.deepEqual(ret,[186,19,33,112,72,161,214,247,189]);
assert.equal(ret.length-1,A);
// Source-independent role crosschecks from chapter path and p27 red rubric:
const p27=book.pages[27].indices;
const p27Ink=red.pages.find(z=>z.page===27).red_spans[0];
const p27Red=p27.slice(p27Ink.start,p27Ink.start+p27Ink.length);
assert.equal(p27Red.length,B);
assert.equal(p27Red.reduce((s,x)=>s+x,0)%29,b);
const p27FirstBlack=records.find(x=>x.page===27);
assert.equal(p27FirstBlack.in,K);
assert.equal(p27FirstBlack.out,B);
assert.equal(records.find(x=>x.page===0).in,b);
assert.equal(records.find(x=>x.page===40).out,e);
console.log(JSON.stringify({
 classification:'retrospective integrated route, no recovered unknown plaintext',
 chapterRoute:route,hopValues,terminalProduct:e,
 sourceTablePages:table.pages.map(p=>p.page),
 radix:59,sink,mirror:mirrored,returnPath:ret,
 independently_calculated_modular_state:{p,g,a,b,A,B,K,e},
 p27_red_length:p27Red.length,p27_red_sum_mod29:b,
 independent_source_agreement:{
   p0_word_sum:b,p27_word_sum:K,p27_word_product:B,p40_word_product:e
 },
 missing:'first-party instruction selecting sum/product navigation and invertible LP2 payload consumer'
},null,2));
