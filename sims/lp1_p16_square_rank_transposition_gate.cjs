#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const ROOT=path.join(__dirname,".."),Q=29;
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.slice(0,56).map(p=>p.indices||[]),unknown=pages.flat(),p57=corpus.pages[57].indices;
assert.strictEqual(unknown.length,12956);assert.strictEqual(pages[50].length,0);assert.strictEqual(p57.length,95);
const matrix=[[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]];
assert.deepStrictEqual(matrix.map(r=>r.reduce((a,b)=>a+b,0)),Array(5).fill(3301));
assert.deepStrictEqual(matrix[0].map((_,c)=>matrix.reduce((s,r)=>s+r[c],0)),Array(5).fill(3301));
assert.strictEqual(matrix.reduce((s,r,i)=>s+r[i],0),3301);assert.strictEqual(matrix.reduce((s,r,i)=>s+r[4-i],0),3301);
const cells=matrix.flatMap((r,y)=>r.map((value,x)=>({value,row:y*5+x,col:x*5+y}))).sort((a,b)=>a.value-b.value);
assert.strictEqual(new Set(cells.map(x=>x.value)).size,25);
const routes=[{fill:"row-major",route:cells.map(x=>x.row)},{fill:"column-major",route:cells.map(x=>x.col)}];
assert.deepStrictEqual(routes[0].route,[5,19,3,21,8,16,2,22,0,24,11,13,10,14,12,6,18,7,17,4,20,9,15,1,23]);
assert.deepStrictEqual(routes[1].route,[1,23,15,9,16,8,10,14,0,24,7,17,2,22,12,6,18,11,13,20,4,21,3,5,19]);
function blockTransform(block,route,inverse){const out=Array(25);if(!inverse)for(let i=0;i<25;i++)out[i]=block[route[i]];else for(let i=0;i<25;i++)out[route[i]]=block[i];return out;}
function globalTransform(input,route,inverse){const out=input.slice();for(let i=0;i+25<=input.length;i+=25){const b=blockTransform(input.slice(i,i+25),route,inverse);for(let j=0;j<25;j++)out[i+j]=b[j];}return out;}
function pageTransform(route,inverse){return pages.flatMap(page=>{const out=page.slice();for(let i=0;i+25<=page.length;i+=25){const b=blockTransform(page.slice(i,i+25),route,inverse);for(let j=0;j<25;j++)out[i+j]=b[j];}return out;});}
function ioc(values){const counts=Array(Q).fill(0);for(const x of values)counts[x]++;return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));}
const shakespeare=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length),tokenIndex=new Map(corpus.translit.map((t,i)=>[t,i]));
function encodeLatin(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let found=false;for(const t of tokens)if(s.startsWith(t,i)){out.push(tokenIndex.get(t));i+=t.length;found=true;break;}if(!found)throw Error("unmapped ref "+i);}return out;}
const train=encodeLatin(shakespeare.slice(0,240000)),heldout=encodeLatin(shakespeare.slice(240000));
const tri=Array(Q*Q*Q).fill(0),bi=Array(Q*Q).fill(0);
for(let i=2;i<train.length;i++){const k=train[i-2]*Q+train[i-1];tri[k*Q+train[i]]++;bi[k]++;}
function score(x){let s=0;for(let i=2;i<x.length;i++){const k=x[i-2]*Q+x[i-1];s+=Math.log((tri[k*Q+x[i]]+0.1)/(bi[k]+0.1*Q));}return s/(x.length-2);}
const expected=[-4.630702175009043,-4.645465784496677,-4.621368863187682,-4.612968770448293,-4.622184686031269,-4.602827987217074,-4.619350761535999,-4.613558917051814];
const sourceIoc=ioc(unknown),sourceScore=score(unknown),results=[];let k=0;
for(const {fill,route} of routes)for(const inverse of [false,true]){
 const global=globalTransform(unknown,route,inverse),page=pageTransform(route,inverse),planted=globalTransform(p57,route,inverse);
 assert.deepStrictEqual(globalTransform(planted,route,!inverse),p57);
 for(const [clock,out,tail] of [["book-global",global,unknown.length%25],["page-reset",page,pages.reduce((s,p)=>s+p.length%25,0)]]){
  const logL=score(out);assert.strictEqual(out.length,12956);assert(Math.abs(ioc(out)-sourceIoc)<1e-12);assert(Math.abs(logL-expected[k++])<1e-12);
  results.push({fill,operation:inverse?"inverse placement":"ascending-rank read",clock,unchangedIncompleteRunes:tail,ioc:ioc(out),trigramLogLikelihood:logL,p57RoundTrip:"95/95"});
 }
}
assert.strictEqual(unknown.length%25,6);assert.strictEqual(pages.reduce((s,p)=>s+p.length%25,0),806);
console.log(JSON.stringify({test:"LP1 p16 3301 square rank-order 25-rune block transposition",matrix,rowMajorRankRoute:routes[0].route,columnMajorRankRoute:routes[1].route,unknownRunes:unknown.length,globalTail:unknown.length%25,pageResetTail:806,sourceIoC:sourceIoc,sourceTrigramLogLikelihood:sourceScore,shakespeareTrainTrigramLogLikelihood:score(train),shakespeareHoldoutTrigramLogLikelihood:score(heldout),solvedP57TrigramLogLikelihood:score(p57),results},null,2));
