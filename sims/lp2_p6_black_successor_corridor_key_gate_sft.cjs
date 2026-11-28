"use strict";
const assert=require("node:assert/strict"),mod=x=>((x%29)+29)%29,half=15;
const source=[6,9,28,25,6,21,23],arities=[4,3,3,4,2,5,4,4,6,5,4,6,7],required=[20,9,4,0,0,25,10,7,0,28,0,5,18];
const H=v=>{const o=[];for(let i=0;i<Math.floor(v.length/2);i++)o.push(mod(v[i]-v[v.length-1-i]),mod(v[i]+v[v.length-1-i]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;};
const Hinv=v=>{const p=v.slice(0,-1),l=[],r=[];for(let i=0;i<p.length;i+=2){l.push(mod((p[i]+p[i+1])*half));r.push(mod((p[i+1]-p[i])*half));}return l.concat([v[v.length-1]],r.reverse());};
assert.deepEqual(H(source),[12,0,17,1,22,5,25]);assert.deepEqual(Hinv(H(source)),source);
const variants={direct:source,reverse:source.slice().reverse(),H:H(source),Hreverse:H(source.slice().reverse()),Hinv:Hinv(source),HinvReverse:Hinv(source.slice().reverse())},rows=[];
for(const [representation,t0] of Object.entries(variants))for(const sign of [1,-1]){const tape=t0.map(x=>mod(sign*x));for(const clock of ["continuous","pageReset"]){let off=0;const pageSums=[];for(const n of arities){const vals=Array.from({length:n},(_,j)=>tape[(clock==="pageReset"?j:off+j)%7]);pageSums.push(vals.reduce((a,b)=>mod(a+b),0));off+=n;}const matchedPages=pageSums.map((x,i)=>x===required[i]?i+30:-1).filter(x=>x>=0);rows.push({representation,sign,clock,pageSums,matchedPages,matches:matchedPages.length});}}
assert.equal(rows.length,24);const hist={};for(const r of rows)hist[r.matches]=(hist[r.matches]||0)+1;assert.deepEqual(hist,{0:19,1:5});assert.equal(Math.max(...rows.map(r=>r.matches)),1);
console.log(JSON.stringify({status:"PASS",classification:"target-rune-blind rejection of direct periodic use of the source-selected p6 black successor",sourceWord:source,sourceH:H(source),arities,requiredKeySums:required,charged:{representations:Object.keys(variants),signs:[1,-1],clocks:["continuous","pageReset"],total:rows.length},checksumHitHistogram:hist,bestMatches:1,exactThirteenPageMatches:0,bestRows:rows.filter(r=>r.matches===1)},null,2));
