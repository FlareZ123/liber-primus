#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const mod=x=>((x%29)+29)%29,inv29=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error("GF29 inverse");};
const add=(x,y)=>mod(x%29+y%29)+29*mod(Math.floor(x/29)+Math.floor(y/29));
const sub=(x,y)=>mod(x%29-y%29)+29*mod(Math.floor(x/29)-Math.floor(y/29));
function mul(x,y){const a=x%29,b=Math.floor(x/29),c=y%29,d=Math.floor(y/29);return mod(a*c+8*b*d)+29*mod(a*d+b*c+3*b*d);}
function inv(x){const a=x%29,b=Math.floor(x/29),ni=inv29(mod(a*a+3*a*b-8*b*b));return mod((a+3*b)*ni)+29*mod(-b*ni);}
function trim(p){while(p.length>1&&p[p.length-1]===0)p.pop();return p;}
function div29(p,d){const r=p.slice(),q=Array(Math.max(1,r.length-d.length+1)).fill(0),iv=inv29(d[d.length-1]);for(let i=r.length-1;i>=d.length-1;i--){const v=mod(r[i]*iv);q[i-d.length+1]=v;for(let j=0;j<d.length;j++)r[i-d.length+1+j]=mod(r[i-d.length+1+j]-v*d[j]);}assert(trim(r).every(x=>x===0));return trim(q);}
function monic(p){p=trim(p.slice());const k=inv(p[p.length-1]);return p.map(x=>mul(x,k));}
function rem(p,d){const r=p.slice(),n=d.length-1,iv=inv(d[n]);for(let i=r.length-1;i>=n;i--){const a=mul(r[i],iv);if(a)for(let j=0;j<=n;j++)r[i-n+j]=sub(r[i-n+j],mul(a,d[j]));}return trim(r);}
function gcd(a,b){while(!(b.length===1&&b[0]===0))[a,b]=[b,rem(a,b)];return monic(a);}
function mulMod(a,b,q){const n=a.length+b.length-1,lo=Array(n).fill(0),hi=Array(n).fill(0);for(let i=0;i<a.length;i++){const x=a[i]%29,y=Math.floor(a[i]/29);for(let j=0;j<b.length;j++){const v=b[j]%29,w=Math.floor(b[j]/29),k=i+j;lo[k]+=x*v+8*y*w;hi[k]+=x*w+y*v+3*y*w;}}for(let i=n-1;i>=238;i--){const x=mod(lo[i]),y=mod(hi[i]);if(x||y)for(let j=0;j<238;j++){lo[i-238+j]-=x*q[j];hi[i-238+j]-=y*q[j];}}const o=Array(Math.min(n,238));for(let i=0;i<o.length;i++)o[i]=mod(lo[i])+29*mod(hi[i]);return trim(o);}
function powMod(a,e,q){let o=[1],b=a.slice();while(e>0n){if(e&1n)o=mulMod(o,b,q);e>>=1n;if(e>0n)b=mulMod(b,b,q);}return o;}
function fullMul(a,b){const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=add(o[i+j],mul(a[i],b[j]));return trim(o);}
const bytes=grid.pages.flatMap(p=>p.bytes);assert.equal(bytes.length,256);
let Q=trim(bytes.slice().reverse().map(x=>mod(28*x)));
for(const f of [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]])Q=div29(Q,f);
assert.equal(Q.length,239);assert.equal(Q[238],1);
const chi=powMod([31,1],(841n**119n-1n)/2n,Q),chiMinus=chi.slice();chiMinus[0]=sub(chiMinus[0],1);
const F=monic(gcd(Q,chiMinus));assert.equal(F.length,120);assert.equal(F[119],1);
const Fc=F.map(v=>mod(v%29+3*Math.floor(v/29))+29*mod(-Math.floor(v/29)));
assert.deepEqual(fullMul(F,Fc),Q);
const pages=corpus.pages.filter(p=>p.page<=55),C=pages.flatMap(p=>p.indices);assert.equal(C.length,12956);
const p3=pages.find(p=>p.page===3).indices.slice(0,119),p39=pages.find(p=>p.page===39).indices.slice(0,119);
assert.equal(p3.length,119);assert.equal(p39.length,119);
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
function lfsrK(coeff,seed,n){let s=seed.slice(),o=[];for(let i=0;i<n;i++){let v=0;for(let j=0;j<119;j++)v=add(v,mul(coeff[j],s[j]));const z=sub(0,v);o.push(z);s=[...s.slice(1),z];}return o;}
const seedsK=[];for(const swap of [false,true])for(const rev of [false,true]){const pairs=Array.from({length:119},(_,i)=>swap?[p39[i],p3[i]]:[p3[i],p39[i]]);const a=rev?pairs.reverse():pairs;seedsK.push({name:(swap?"p39,p3":"p3,p39")+(rev?" reverse":" forward"),seed:a.map(([x,y])=>x+29*y)});}
const rawField=[];for(let i=0;i<C.length;i+=2)rawField.push(C[i]+29*C[i+1]);
const nonF=C.filter(x=>x!==0),nonFField=[];for(let i=0;i<nonF.length;i+=2)nonFField.push(nonF[i]+29*nonF[i+1]);
const fieldResults=[];
for(const [name,f] of [["F119",F.slice(0,119)],["F119-conjugate",Fc.slice(0,119)]])for(const seed of seedsK)for(const skipF of [false,true])for(const sign of [-1,1]){
 const input=skipF?nonFField:rawField,key=lfsrK(f,seed.seed,input.length),plain=input.map((v,i)=>sign<0?sub(v,key[i]):add(v,key[i]));
 fieldResults.push({factor:name,seed:seed.name,skipF,sign,ioc:ioc(plain.flatMap(v=>[v%29,Math.floor(v/29)]))});
}
function lfsr29(f,seed,n){let s=seed.slice(),o=[];for(let i=0;i<n;i++){let v=0;for(let j=0;j<238;j++)v+=f[j]*s[j];const z=mod(-v);o.push(z);s=[...s.slice(1),z];}return o;}
const Qr=Q.slice().reverse().map(x=>mod(x*inv29(Q[0])));
const seeds29=[
 {name:"p3||p39",seed:[...p3,...p39]},
 {name:"p39||p3",seed:[...p39,...p3]},
 {name:"reverse(p3||p39)",seed:[...p3,...p39].reverse()},
 {name:"reverse(p39||p3)",seed:[...p39,...p3].reverse()},
];
const gpResults=[];
for(const [name,f] of [["Q238",Q],["reciprocal Q238",Qr]])for(const seed of seeds29)for(const sign of [-1,1]){
 const key=lfsr29(f.slice(0,238),seed.seed,C.length),plain=C.map((x,i)=>mod(x+sign*key[i]));
 gpResults.push({polynomial:name,seed:seed.name,sign,ioc:ioc(plain)});
}
const testSeedK=Array.from({length:119},(_,i)=>(i*31+17)%841),testKeyK=lfsrK(F.slice(0,119),testSeedK,500);
const testPlainK=Array.from({length:500},(_,i)=>(i*53+29)%841),testCipherK=testPlainK.map((x,i)=>add(x,testKeyK[i]));
assert.deepEqual(testCipherK.map((x,i)=>sub(x,testKeyK[i])),testPlainK);
const testSeed29=Array.from({length:238},(_,i)=>(i*11+4)%29),testKey29=lfsr29(Q.slice(0,238),testSeed29,500);
const testPlain29=Array.from({length:500},(_,i)=>(i*17+2)%29),testCipher29=testPlain29.map((x,i)=>mod(x+testKey29[i]));
assert.deepEqual(testCipher29.map((x,i)=>mod(x-testKey29[i])),testPlain29);
console.log(JSON.stringify({
 input:{runes:C.length,rawIoC:ioc(C),fCount:C.filter(x=>x===0).length},
 sourceSeed:{p3Prefix:119,p39Prefix:119,fieldStateElements:119,gp29StateSymbols:238},
 factorization:{q238Degree:238,field:"GF(29^2), u^2=3u+8",factorDegrees:[F.length-1,Fc.length-1],exactProduct:true},
 GF841:{models:fieldResults.length,nonFRunes:nonF.length,nonFFieldElements:nonFField.length,best:fieldResults.slice().sort((a,b)=>b.ioc-a.ioc)[0]},
 GF29:{models:gpResults.length,best:gpResults.slice().sort((a,b)=>b.ioc-a.ioc)[0]},
 positiveControls:"both planted streams recovered exactly"
},null,2));
