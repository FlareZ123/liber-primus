"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const mod=n=>(n%29+29)%29;
function inv(n){for(let i=1;i<29;i++)if(mod(n*i)===1)return i;throw Error("noninvertible");}
function divHigh(input,f){const a=input.map(mod),q=[],iv=inv(f[0]);for(let i=0;i<=a.length-f.length;i++){const x=mod(a[i]*iv);q.push(x);for(let j=0;j<f.length;j++)a[i+j]=mod(a[i+j]-x*f[j]);}return {q,r:a.slice(a.length-f.length+1)};}
function ioc(a){const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function bestShift(a,b){return Array.from({length:29},(_,k)=>({k,m:a.reduce((s,x,i)=>s+(mod(x+k)===b[i]?1:0),0)})).sort((x,y)=>y.m-x.m||x.k-y.k)[0];}
const p29=corpus.pages.find(p=>p.page===29).indices,bytes=grid.byte_rows.flat();
const G=[15,5,27],F=[12,17,11,21,23],g=divHigh(p29,G),f=divHigh(bytes,F);
assert.deepEqual(g.r,[0,0]);assert.deepEqual(f.r,[0,0,0,0]);
assert.equal(g.q.length,275);assert.equal(f.q.length,252);assert.equal(g.q.length-f.q.length,23);
const overlap=[{name:"prefix",a:g.q.slice(0,252)},{name:"suffix",a:g.q.slice(23)}].map(x=>{
 const d=x.a.map((v,i)=>mod(v-f.q[i]));
 return {alignment:x.name,exactMatches:x.a.filter((v,i)=>v===f.q[i]).length,bestConstantShift:bestShift(x.a,f.q),differenceIoC:ioc(d)};
});
const keys=[];
for(const [name,key] of [["prefix",g.q.slice(0,23)],["suffix",g.q.slice(-23)]])
 for(const sign of [-1,1]){const out=f.q.map((v,i)=>mod(v+sign*key[i%23]));keys.push({key:name,sign,decodedIoC:ioc(out)});}
const result={
 p29:{input:277,divisor:G,quotient:275,remainder:g.r,ioc:ioc(g.q)},
 p50:{input:256,divisor:F,quotient:252,remainder:f.r,ioc:ioc(f.q)},
 quotientLengthDifference:23,2013DHPublicModulus:23,
 directOverlaps:overlap,repeated23SymbolVigenere:keys
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
