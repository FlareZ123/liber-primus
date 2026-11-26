#!/usr/bin/env node
"use strict";
// Source-bounded p55 receiver gate: raw cross-register keys, position-clocked
// finite-field logs, cross-register log keys, and literal cuneiform-digit Hill-2.
// No phase sweep, key-order search, or arbitrary alphabet remapping.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const d=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-page-groups-54-55-derived.json"),"utf8"));
const A="0123456789abcdefghijklmnopqrs",T=c.translit,primes=c.prime,groups=d.p55.groups,page=c.pages.find(p=>p.page===55).indices;
const mod=(x,n=29)=>((x%n)+n)%n;
function pow(a,e,p){let x=1n,b=BigInt(a),n=BigInt(e),m=BigInt(p);while(n){if(n&1n)x=x*b%m;b=b*b%m;n>>=1n;}return Number(x);}
function order(g,p){let x=1;for(let i=1;i<p;i++){x=x*g%p;if(x===1)return i;}return null;}
function logs(g,p,q){const m=new Map();let x=1;for(let i=0;i<q;i++){if(m.has(x))throw Error("wrong subgroup order");m.set(x,i);x=x*g%p;}if(x!==1)throw Error("generator does not close");return m;}
const render=v=>v.map(x=>x>=0&&x<29?T[x]:"?").join("");
const ioc=v=>{const f=Array(29).fill(0);v.forEach(x=>f[x]++);return f.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));};
const add=(m,k,s)=>m.map((x,i)=>mod(x+s*k[i%k.length]));
const inner=[],outer=[];
for(let w=0;w<groups.length;w++){const a=[...groups[w]].map(ch=>A.indexOf(ch));if(a.some(x=>x<0))throw Error("unknown rune");if(w===0){assert.equal(a.length,1);outer.push(a[0]);}else{outer.push(a[0],a.at(-1));inner.push(...a.slice(1,-1));}}
assert.equal(groups.join(""),page.map(x=>A[x]).join(""));assert.equal(page.length,76);assert.equal(groups.length,17);assert.equal(inner.length,43);assert.equal(outer.length,33);
const rawCross=[];
for(const [name,m,k] of [["inner<-outer",inner,outer],["outer<-inner",outer,inner]])for(const sign of [-1,1]){const x=add(m,k,sign);rawCross.push({receiver:name,sign,ioc:ioc(x),decoded:render(x)});}
const field=[];
for(const a of [{name:"printed",ib:17,ob:13},{name:"reversed",ib:13,ob:17}]){
 const ip=1033,ic=24,iq=43,op=3301,oc=100,oq=33,ig=pow(a.ib,ic,ip),og=pow(a.ob,oc,op);
 assert.equal(order(ig,ip),iq);assert.equal(order(og,op),oq);
 const il=logs(ig,ip,iq),ol=logs(og,op,oq);
 const iv=inner.map(x=>il.get(pow(primes[x],ic,ip))),ov=outer.map(x=>ol.get(pow(primes[x],oc,op)));
 if(iv.some(x=>x===undefined)||ov.some(x=>x===undefined))throw Error("missing discrete log");
 const positionClock=[];
 for(const [lane,v,q] of [["inner",iv,iq],["outer",ov,oq]])for(const sign of [-1,1]){const x=v.map((n,i)=>mod(n+sign*i,q));positionClock.push({lane,sign,invalidGp29Symbols:x.filter(n=>n>=29).length,decoded:render(x)});}
 const crossLogKey=[];
 for(const [name,m,k] of [["inner<-outer-log",inner,ov.map(x=>mod(x))],["outer<-inner-log",outer,iv.map(x=>mod(x))]])for(const sign of [-1,1]){const x=add(m,k,sign);crossLogKey.push({receiver:name,sign,ioc:ioc(x),decoded:render(x)});}
 field.push({assignment:a.name,generators:{inner:ig,outer:og},logSums:{inner:iv.reduce((x,y)=>x+y,0),outer:ov.reduce((x,y)=>x+y,0)},positionClock,crossLogKey});
}
const K=[[17,13],[mod(55),1]],det=mod(K[0][0]*K[1][1]-K[0][1]*K[1][0]),id=pow(det,27,29),Ki=[[mod(K[1][1]*id),mod(-K[0][1]*id)],[mod(-K[1][0]*id),mod(K[0][0]*id)]];
assert.equal(det,27);assert.deepEqual(Ki,[[14,21],[13,6]]);
function hill(v,M,mode){const out=[];for(let i=0;i<v.length;i+=2){const [x,y]=v.slice(i,i+2);if(mode==="column")out.push(mod(M[0][0]*x+M[0][1]*y),mod(M[1][0]*x+M[1][1]*y));else out.push(mod(x*M[0][0]+y*M[1][0]),mod(x*M[0][1]+y*M[1][1]));}return out;}
const hill2=[];for(const [key,M] of [["direct",K],["inverse",Ki]])for(const convention of ["column","row"]){const x=hill(page,M,convention);hill2.push({key,convention,ioc:ioc(x),decoded:render(x)});}
process.stdout.write(JSON.stringify({source:{page:55,runes:page.length,wordGroups:groups.length,innerLength:inner.length,outerLength:outer.length,innerIoC:ioc(inner),outerIoC:ioc(outer)},rawCross,field,hill2:{matrix:K,determinant:det,inverse:Ki,results:hill2}},null,2)+"\n");
