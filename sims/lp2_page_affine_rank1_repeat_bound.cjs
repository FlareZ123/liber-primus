'use strict';
const fs=require('node:fs');
function bound(g){
const lens=g.pages.filter(x=>x.page<56&&x.indices.length).map(x=>x.indices.length),q=29,p=1/q,m=lens.length,counts=Array.from({length:Math.max(...lens)-1},(_,j)=>lens.filter(n=>n>j+1).length),n=counts.reduce((s,x)=>s+x,0),obs=g.pages.filter(x=>x.page<56&&x.indices.length).reduce((s,x)=>s+x.indices.slice(1).filter((c,j)=>c===x.indices[j]).length,0),d=n*p-obs,b=m*p,t=.03484359;
const universal=Math.exp(t*obs+counts.reduce((s,k)=>s+Math.log1p(p*Math.expm1(-t*k)),0));
const probabilities=[Math.pow(1-p,m)];for(let k=0;k<m;k++)probabilities.push(probabilities[k]*(m-k)/(k+1)*p/(1-p));
const tail=Array(m+2).fill(0);for(let k=m;k>=0;k--)tail[k]=tail[k+1]+probabilities[k];
function bennett(L){let V=n*p*(1-p)*L,x=b*d/V;return Math.exp(-V/(b*b)*((1+x)*Math.log1p(x)-x))}
let B=Array.from({length:m+1},(_,i)=>i?Math.min(universal,bennett(i)):0),terms=[];let total=B[1];for(let L=2;L<=m;L++){let upper=Math.min(1,q*tail[L]),term=(B[L]-B[L-1])*upper;total+=term;terms.push({L,upper,conditionalBound:B[L],term})}return{q,m,n,obs,mean:n*p,t,universal,boundIIDU:total,dominantTerms:terms.sort((a,b)=>b.term-a.term).slice(0,10)}}
console.log(JSON.stringify(bound(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'))),null,2));
