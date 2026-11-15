#!/usr/bin/env node
"use strict";
// Direct and entrywise-totient 25-symbol additive-key interpretations of LP1 p16.
// Row/column readout, global/page-reset clocks, both arithmetic signs; no phase search.
const fs=require("fs"),path=require("path"),assert=require("assert");
const ROOT=path.join(__dirname,".."),Q=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.slice(0,56).map(p=>p.indices||[]),unknown=pages.flat(),p57=corpus.pages[57].indices;
assert.strictEqual(unknown.length,12956);assert.strictEqual(p57.length,95);
const matrix=[[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]];
function phi(n){let x=n,r=n;for(let p=2;p*p<=x;p++)if(x%p===0){while(x%p===0)x/=p;r-=r/p;}if(x>1)r-=r/x;return r;}
const direct=matrix.flat(),totient=direct.map(phi);
const keys=[];
for(const [transform,values] of [["direct",direct],["totient",totient]]){
 const row=values.map(x=>x%Q),col=Array(25);
 for(let r=0;r<5;r++)for(let c=0;c<5;c++)col[c*5+r]=values[r*5+c]%Q;
 keys.push({transform,fill:"row-major",key:row},{transform,fill:"column-major",key:col});
}
function mod(x){return ((x%Q)+Q)%Q;}
function decodePage(page,key,sign){return page.map((x,i)=>mod(x-sign*key[i%25]));}
function encodePage(page,key,sign){return page.map((x,i)=>mod(x+sign*key[i%25]));}
function transformGlobal(key,sign){return unknown.map((x,i)=>mod(x-sign*key[i%25]));}
function transformPages(key,sign){return pages.flatMap(p=>decodePage(p,key,sign));}
function ioc(values){const n=Array(Q).fill(0);for(const x of values)n[x]++;return n.reduce((s,x)=>s+x*(x-1),0)/(values.length*(values.length-1));}
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length),tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeLatin(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let ok=false;for(const t of tokens)if(s.startsWith(t,i)){out.push(tokenIndex.get(t));i+=t.length;ok=true;break;}if(!ok)throw Error("unmapped ref at "+i);}return out;}
const train=encodeLatin(shakespeare.slice(0,240000)),heldout=encodeLatin(shakespeare.slice(240000));
const tri=Array(Q*Q*Q).fill(0),bi=Array(Q*Q).fill(0);
for(let i=2;i<train.length;i++){const k=train[i-2]*Q+train[i-1];tri[k*Q+train[i]]++;bi[k]++;}
function score(x){let s=0;for(let i=2;i<x.length;i++){const k=x[i-2]*Q+x[i-1];s+=Math.log((tri[k*Q+x[i]]+0.1)/(bi[k]+0.1*Q));}return s/(x.length-2);}
const expected=[-4.641235944582121,-4.660250365027033,-4.639409513041646,-4.6139423287854555,-4.658881591792759,-4.607474976275586,-4.641058333847259,-4.612052724761746,-4.611905963689606,-4.652201968470003,-4.616930905611463,-4.603263569377518,-4.631360231576194,-4.636006834483987,-4.622761700409654,-4.612235359419887];
const results=[],controls=[];let e=0;
for(const {transform,fill,key} of keys){
 for(const clock of ["global","page-reset"])for(const sign of [1,-1]){
  const output=clock==="global"?transformGlobal(key,sign):transformPages(key,sign);
  const logL=score(output);assert.strictEqual(output.length,12956);
  assert(Math.abs(logL-expected[e++])<1e-12);
  results.push({transform,fill,clock,operation:sign===1?"C=P+K / decode C-K":"C=P-K / decode C+K",ioc:ioc(output),trigramLogLikelihood:logL});
  const planted=encodePage(p57,key,sign),recovered=decodePage(planted,key,sign);
  const exact=recovered.every((x,i)=>x===p57[i]);assert(exact);
  controls.push({transform,fill,sign,exact,recoveredRunes:recovered.length});
 }
}
console.log(JSON.stringify({test:"LP1 p16 square as a repeating 25-symbol additive key",matrix,directKey:keys[0].key,totientKey:keys[2].key,unknownRunes:unknown.length,sourceIoC:ioc(unknown),sourceTrigramLogLikelihood:score(unknown),shakespeareTrainTrigramLogLikelihood:score(train),shakespeareHoldoutTrigramLogLikelihood:score(heldout),solvedP57TrigramLogLikelihood:score(p57),results,positiveControls:controls},null,2));
