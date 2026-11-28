"use strict";
/**
 * Exact fixed-width block-bijection collision gate for unknown LP2 p0-p55.
 * Run from repository root:
 *   node sims/lp2_static_fixedwidth_block_bijection_sft.cjs
 */
const fs = require("node:fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const sourceNames = ["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices && p.indices.length);
const arrays = pages.map((p) => p.indices), lengths = arrays.map((a) => a.length), tape = arrays.flat();
const A=29,SAMPLES=512,chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const assert=(v,m)=>{if(!v)throw new Error(m);};
assert(pages.length===55&&tape.length===12956,"original corpus shape");
const items=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
const single=new Map(corpus.translit.map((s,i)=>[s,i]));
function gp(text,mode="legacy"){
  const out=[],words=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[];
  for(const word of words)for(let i=0;i<word.length;){
    if(mode==="legacy"&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(mode==="legacy"&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}
    if(mode==="latin"){assert(single.has(word[i]),"single-letter GP spelling");out.push(single.get(word[i++]));continue;}
    const token=items.find((t)=>word.startsWith(t.s,i));assert(token,"GP token");out.push(token.i);i+=token.s.length;
  }return out;
}
function stateIndex(a,i,k){let x=0;for(let j=0;j<k;j++)x=x*A+a[i+j];assert(Number.isSafeInteger(x),"safe block integer");return x;}
function collisionsOne(a,k,offset){
  const counts=new Map();let blocks=0;
  for(let i=offset;i+k<=a.length;i+=k){const x=stateIndex(a,i,k);counts.set(x,(counts.get(x)||0)+1);blocks++;}
  let equalPairs=0,maxMultiplicity=0;for(const n of counts.values()){equalPairs+=n*(n-1)/2;maxMultiplicity=Math.max(maxMultiplicity,n);}
  return {blocks,equalPairs,maxMultiplicity};
}
function collisionSum(as,k,offset){let equalPairs=0,blocks=0,maxMultiplicity=0;for(const a of as){const s=collisionsOne(a,k,offset);equalPairs+=s.equalPairs;blocks+=s.blocks;maxMultiplicity=Math.max(maxMultiplicity,s.maxMultiplicity);}return {blocks,equalPairs,maxMultiplicity};}
function collisionsMerged(as,k,offset){
  const counts=new Map();let blocks=0;
  for(const a of as)for(let i=offset;i+k<=a.length;i+=k){const x=stateIndex(a,i,k);counts.set(x,(counts.get(x)||0)+1);blocks++;}
  let equalPairs=0,maxMultiplicity=0;for(const n of counts.values()){equalPairs+=n*(n-1)/2;maxMultiplicity=Math.max(maxMultiplicity,n);}
  return {blocks,equalPairs,maxMultiplicity};
}
function segment(window){let at=0;return lengths.map((n)=>{const a=window.slice(at,at+n);at+=n;return a;});}
function chapterize(as){const byPage=new Map(pages.map((p,i)=>[p.page,as[i]]));return chapterRanges.map(([lo,hi])=>{const out=[];for(let p=lo;p<=hi;p++)if(byPage.has(p))out.push(...byPage.get(p));return out;});}
const originalChapters=chapterize(arrays);
function observed(scope,k,offset){
  if(scope==="shared-continuous")return collisionsOne(tape,k,offset);
  if(scope==="shared-page-reset")return collisionsMerged(arrays,k,offset);
  if(scope==="chapter-private")return collisionSum(originalChapters,k,offset);
  if(scope==="page-private")return collisionSum(arrays,k,offset);
  throw new Error("scope");
}
function control(scope,segs,k,offset){
  if(scope==="shared-continuous")return collisionsOne(segs.flat(),k,offset);
  if(scope==="shared-page-reset")return collisionsMerged(segs,k,offset);
  if(scope==="chapter-private")return collisionSum(chapterize(segs),k,offset);
  if(scope==="page-private")return collisionSum(segs,k,offset);
  throw new Error("scope");
}
const scopeWidths={"shared-continuous":[2,3,4,5,6,7],"shared-page-reset":[2,3,4,5,6,7],"chapter-private":[2,3,4,5,6],"page-private":[2,3,4,5]};
function scan(seq,widths=scopeWidths,samples=SAMPLES){
  assert(seq.length>=tape.length,"native source length");const maxStart=seq.length-tape.length,rows=[];
  for(const [scope,ks] of Object.entries(widths))for(const k of ks)for(let offset=0;offset<k;offset++){
    const o=observed(scope,k,offset);let minControl=Infinity;
    for(let q=0;q<samples;q++){const start=Math.floor(q*maxStart/(samples-1)),segs=segment(seq.slice(start,start+tape.length));minControl=Math.min(minControl,control(scope,segs,k,offset).equalPairs);}
    rows.push({scope,k,offset,blocks:o.blocks,original:o.equalPairs,maxMultiplicity:o.maxMultiplicity,nativeMin:minControl,margin:minControl-o.equalPairs});
  }return rows;
}
const legacy={};
for(const name of sourceNames){const text=fs.readFileSync("resources/control/"+name,"utf8"),rows=scan(gp(text,"legacy"));assert(rows.every((r)=>r.margin>0),"all declared legacy registrations separate: "+name);legacy[name]=rows;}
function minMargin(name,scope,k){return Math.min(...legacy[name].filter((r)=>r.scope===scope&&r.k===k).map((r)=>r.margin));}
assert(minMargin(sourceNames[0],"shared-page-reset",7)>=19,"Gibran shared k7");
assert(minMargin(sourceNames[1],"shared-continuous",7)>=20,"Shakespeare shared k7");
assert(minMargin(sourceNames[2],"shared-continuous",7)>=3,"Emerson shared k7");
assert(minMargin(sourceNames[2],"chapter-private",6)>=2,"Emerson chapter k6");
assert(minMargin(sourceNames[2],"page-private",5)>=2,"Emerson page k5");
const weakWidths={"shared-continuous":[7],"shared-page-reset":[7],"chapter-private":[6],"page-private":[5]},spellingStress={};
for(const name of sourceNames){const text=fs.readFileSync("resources/control/"+name,"utf8");spellingStress[name]={};for(const mode of ["legacy","greedy","latin"]){const rows=scan(gp(text,mode),weakWidths);assert(rows.every((r)=>r.margin>0),"spelling-stress separation: "+name+"/"+mode);spellingStress[name][mode]=Math.min(...rows.map((r)=>r.margin));}}
assert(Math.min(...Object.values(spellingStress).flatMap((x)=>Object.values(x)))>=1,"all limiting spelling variants positive");
for(let k=2;k<=7;k++){const M=A**k,a=arrays[0],before=collisionsOne(a,k,0),mapped=[];for(let i=0;i+k<=a.length;i+=k){const x=stateIndex(a,i,k),y=(2*x+1)%M,back=(y%2===1)?(y-1)/2:(y+M-1)/2;assert(back===x,"block-bijection roundtrip");mapped.push(y);}const counts=new Map();for(const y of mapped)counts.set(y,(counts.get(y)||0)+1);let equalPairs=0;for(const n of counts.values())equalPairs+=n*(n-1)/2;assert(equalPairs===before.equalPairs,"collision invariant positive");}
const mod=(x)=>((x%29)+29)%29,gfMul=([a,b],[c,d])=>[mod(a*c+8*b*d),mod(a*d+b*c)];
function order(x){let y=[1,0];for(let n=1;n<=840;n++){y=gfMul(y,x);if(y[0]===1&&y[1]===0)return n;}throw new Error("field order");}
assert(order([3,4])===840,"beta primitive");assert(order([4,3])===168,"printed-order contrast");
const seen=new Set();let y=[1,0];for(let n=0;n<840;n++){seen.add(y.join(","));y=gfMul(y,[3,4]);}assert(seen.size===840&&!seen.has("0,0"),"complete beta log domain");
const summary={};for(const name of sourceNames){summary[name]={};for(const [scope,ks] of Object.entries(scopeWidths))summary[name][scope]=Object.fromEntries(ks.map((k)=>[k,minMargin(name,scope,k)]));}
console.log(JSON.stringify({source:{unknownRunes:tape.length,runeBearingPages:pages.length,betaOrder:840,printedOrderElementOrder:168},theorem:"fixed injective k-block maps preserve complete block multiplicities at each map/reset scope",legacy512MinimumCollisionMargins:summary,limitingSpellingStressMinimumMargins:spellingStress,robustDecision:{sharedMapWidths:"2..7, continuous and page-reset framings, every offset",chapterPrivateWidths:"2..6, every offset",pagePrivateWidths:"2..5, every offset"},escapes:["position-dependent/stateful maps","noninjective or homophonic coding","variable-length coding","unseen non-prose register","different segmentation"]},null,2));
