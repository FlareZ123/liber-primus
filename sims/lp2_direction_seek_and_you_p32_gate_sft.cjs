"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8").replace(/\r/g,"");
const m=x=>((x%29)+29)%29;
const I=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>Number(i===j)));
/** @param {number[][]} a @param {number[][]} b */
function mul(a,b){return a.map(r=>r.map((_,j)=>m(r.reduce((s,v,k)=>s+v*b[k][j],0))));}
/** @param {number[][]} a @param {number[][]} b */
function add(a,b){return a.map((r,i)=>r.map((v,j)=>m(v+b[i][j])));}
/** @param {number[][]} a */
function tr(a){return a[0].map((_,j)=>a.map(r=>r[j]));}
/** @param {number[]} cs @param {number[][]} M */
function evalM(cs,M){let o=I.map(r=>r.map(()=>0));for(const c of cs){o=mul(o,M);for(let i=0;i<4;i++)o[i][i]=m(o[i][i]+c);}return o;}
/** @param {number[][]} x */
function inv(x){const a=x.map((r,i)=>r.concat(I[i]));let rank=0;for(let j=0;j<4;j++){const p=a.findIndex((r,i)=>i>=rank&&r[j]!==0);if(p<0)continue;[a[p],a[rank]]=[a[rank],a[p]];let u=1;while(m(u*a[rank][j])!==1)u++;a[rank]=a[rank].map(v=>m(v*u));for(let i=0;i<4;i++)if(i!==rank){const f=a[i][j];a[i]=a[i].map((v,k)=>m(v-f*a[rank][k]));}rank++;}return {rank,inverse:rank===4?a.map(r=>r.slice(4)):null};}
/** @param {number[]} s @param {number} x */
function poly(s,x){let y=0,d=0;for(const c of s){d=m(d*x+y);y=m(y*x+c);}return [y,d];}
/** @param {number[]} s @param {number[][]} M */
function hill(s,M){assert.equal(s.length%4,0);const o=[];for(let i=0;i<s.length;i+=4){const b=s.slice(i,i+4);for(const r of M)o.push(m(r.reduce((z,v,j)=>z+v*b[j],0)));}return o;}
/** @param {number[]} a */
function ioc(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
/** @param {number[]} h @param {number[]} n */
function occurs(h,n){const o=[];for(let i=0;i+n.length<=h.length;i++)if(n.every((v,j)=>h[i+j]===v))o.push(i);return o;}
const words=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n").split(/[^A-Za-z0-9]+/u).filter(t=>/^[A-Za-z]+$/u.test(t)).map(w=>w.toUpperCase());
assert.deepEqual(words.slice(29,36),["DIRECTION","SEEK","AND","YOU","WILL","BE","FOUND"]);
const p29=corpus.pages.find(p=>p.page===29).indices,p30=corpus.pages.find(p=>p.page===30).indices,p32=corpus.pages.find(p=>p.page===32).indices;
assert.deepEqual([p29.length,p30.length,p32.length],[277,263,121]);
const unknown=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.deepEqual(unknown.filter(p=>poly(p.indices,24).every(v=>v===0)).map(p=>p.page),[29]);
assert.deepEqual(unknown.filter(p=>[8,17].every(x=>poly(p.indices,x)[0]===0)).map(p=>p.page),[30]);
const M=[[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]];
const A=evalM(p29,M),B=evalM(p30,M),K=add(A,B),ki=inv(K);
assert.equal(ki.rank,4);assert.ok(ki.inverse);const Kinv=ki.inverse;assert.deepEqual(mul(K,Kinv),I);
const toks=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} text */
function gp(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){o.push(21);i+=3;continue;}if(s.startsWith("IO",i)){o.push(27);i+=2;continue;}const t=toks.find(x=>s.startsWith(x.symbol,i));assert.ok(t,"unmapped "+s.slice(i));o.push(t.value);i+=t.symbol.length;}return o;}
const target=gp("YOU WILL BE FOUND");
const windows=[["leave-last",0,p32.slice(0,120)],["leave-first",1,p32.slice(1)]];
const operators=[["K-column",K,Kinv],["Kinv-column",Kinv,K],["K-row",tr(K),tr(Kinv)],["Kinv-row",tr(Kinv),tr(K)]];
const results=[];
for(const [window,offset,values] of windows)for(const [operator,map,back] of operators){const out=hill(values,map);assert.deepEqual(hill(out,back),values);results.push({window,offset,operator,ioc:ioc(out),prefix:out.slice(0,30).map(v=>corpus.translit[v]).join(""),startsTarget:target.every((v,i)=>out[i]===v),targetOccurrences:occurs(out,target)});}
const prefixHits=results.filter(r=>r.startsTarget),anyHits=results.filter(r=>r.targetOccurrences.length);
const plant=Array.from({length:120},(_,i)=>target[i%target.length]);for(const [,map,back] of operators)assert.deepEqual(hill(hill(plant,back),map),plant);
console.log(JSON.stringify({status:"PASS",sourceInstruction:words.slice(29,36),selectedPages:{direction:29,seek:30,and:"K=P29(M)+P30(M)",you:32},uniquePageFactors:{p29DoubleRoot24:true,p30Roots8And17:true},p32:{runes:p32.length,target:"YOU WILL BE FOUND",targetGp:target,results,prefixHits,anyHits},interpretation:prefixHits.length||anyHits.length?"target hit":"source selects p29/p30 and licenses sum, but direct summed-Hill4 transfer to p32 misses YOU WILL BE FOUND"},null,2));
