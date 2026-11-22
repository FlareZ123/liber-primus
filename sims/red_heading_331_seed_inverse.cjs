'use strict';
/** @module red_heading_331_seed_inverse
 * Independent original-source 331/662/red-word PRNG inverse:
 * 4 original red title numbers × 6 historic 32-bit generators × 2 clocks
 * × 5 exact model types × 2 signs. Reuses validated source code and
 * true-source GP language model; includes an exact positive planted inverse.
 * Run: node sims/red_heading_331_seed_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const {src,pad,inverse,score}=require('./audio761_numeric_prng_seed_probe.cjs');
const co=JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const annotations=JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const pages=co.pages.filter(p=>p.status==='unsolved'&&p.indices.length).map(p=>p.indices);
const mod=(n,m)=>(n%m+m)%m;
function sourceArithmetic(){
 const page0=co.pages.find(p=>p.page===0).indices;
 const first=page0.slice(0,8).reduce((a,i)=>a+co.prime[i],0);
 const second=page0.slice(8,13).reduce((a,i)=>a+co.prime[i],0);
 assert.deepEqual([first,second],[347,315]);
 const total=first+second;
 assert.equal(total/2,331);
 let count=0;for(let shift=0;shift<page0.length;shift++){
   const sum=Array.from({length:13},(_,i)=>co.prime[page0[(i+shift)%page0.length]])
     .reduce((a,b)=>a+b,0);
   count+=Number(sum===total);
 }
 assert.equal(count,2);
 const centers=[91,331,809],targets=new Set(centers.flatMap(x=>
   Array.from({length:5},(_,i)=>x*(i+1))));
 const counts=[];
 for(const row of annotations.pages){
   if(!row.red_spans?.length)continue;
   const page=co.pages.find(p=>p.page===row.page).indices;
   let hits=0;
   for(let offset=0;offset<page.length;offset++){
     const any=row.red_spans.some(span=>{
       let sum=0;
       for(let k=0;k<span.length;k++)
         sum+=co.prime[page[(span.start+k+offset)%page.length]];
       return targets.has(sum);
     });
     hits+=Number(any);
   }
   counts.push({page:row.page,rotations:page.length,hits});
 }
 const any=1-counts.reduce((a,c)=>a*(1-c.hits/c.rotations),1);
 assert.equal(counts.length,15);
 return {redWordGP:[first,second],total,center:331,
   chosenPage0RotationsMatching:count,possiblePage0Rotations:page0.length,
   fixedTargetCenters:centers,oneToFiveMultipliers:true,sourceRedSpans:18,
   independentPageRotationFamilyProbability:any,rotationByPage:counts};
}
function positive(language){
 const lens=require('./lp2_word_pages.cjs').parseSharedCorpus().words.map(w=>w.length);
 let state=0x33113301>>>0;
 const next=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
 const pools=new Map();
 for(const word of language.words){
   if(!pools.has(word.length))pools.set(word.length,[]);
   pools.get(word.length).push(word);
 }
 const plain=lens.flatMap(n=>{const p=pools.get(n);assert.ok(p);return p[next()%p.length]});
 assert.equal(plain.length,12956);
 const originalPad=pad('mt',331,'book'),power=[];
 for(let i=0,v=1;i<28;i++,v=v*15%29)power.push(v);
 let offset=0;
 const generated=pages.map((page,j)=>{
   const content=plain.slice(offset,offset+page.length);
   offset+=page.length;
   const out=[content[0]];
   for(let i=1;i<page.length;i++){
     const p=content[i],v=originalPad[j][i]%28;
     out.push(p===28?out[i-1]:mod(out[i-1]+power[(p+v)%28],29));
   }
   return out;
 });
 const decoded=inverse(generated,originalPad,'field28',-1);
 let matches=0;
 let cursor=0;
 for(let j=0;j<pages.length;j++){
   for(let i=1;i<pages[j].length;i++){
     assert.equal(decoded[j][i],plain[cursor+i]);
     matches++;
   }
   cursor+=pages[j].length;
 }
 assert.equal(matches,12901);
 return {seed:331,generator:'mt',clock:'book',mode:'field28',sign:-1,
   exactlyRecoveredRuneTransitions:matches,decodedGPScore:score(decoded,language).score};
}
function run(){
 const source=src(),numbers=[331,662,347,315],kinds=
 ['xorshift','lcgA','lcgB','lehmer','lcgLow','mt'],clocks=['book','page'],
 modes=['direct29','delta29','field28','rankCyclic','rankSorted'],signs=[-1,1];
 const results=[];
 for(const seed of numbers)for(const kind of kinds)for(const clock of clocks){
   const p=pad(kind,seed,clock);
   for(const mode of modes)for(const sign of signs)
     results.push({seed,kind,clock,mode,sign,...score(inverse(pages,p,mode,sign),source)});
 }
 assert.equal(results.length,480);
 results.sort((a,b)=>b.score-a.score);
 return {source:sourceArithmetic(),modelCount:results.length,
   nativeGPReferenceLogScore:source.score,best10:results.slice(0,10),
   bestBySeed:numbers.map(seed=>results.find(x=>x.seed===seed)),
   positive:positive(source),
   conclusion:'New red-heading number-derived fixed PRNG seeds only; no authentic original plaintext'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,sourceArithmetic};
