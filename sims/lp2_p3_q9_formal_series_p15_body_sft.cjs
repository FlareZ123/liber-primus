#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const solved=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
const mod=x=>(x%29+29)%29,page=p=>corpus.pages.find(x=>x.page===p).indices;
const f=page(3).slice(119,122),a=page(15).slice(9,20),b=page(57).slice(0,7);
assert.deepEqual(f,[13,23,2]);
let rest=a.map((x,i)=>mod(x-(b[i]||0))),q=Array(9).fill(0);
for(let i=10;i>=2;i--){let v=mod(15*rest[i]);q[i-2]=v;for(let j=0;j<3;j++)rest[i-2+j]=mod(rest[i-2+j]-v*f[j]);}
assert.deepEqual(rest,Array(11).fill(0));
assert.deepEqual(q,[5,5,14,9,10,4,27,17,25]);
const multiply=p=>p.map((_,i)=>mod(q.slice(0,Math.min(9,i+1)).reduce((s,v,j)=>s+v*p[i-j],0)));
const divide=c=>{let p=[];for(let i=0;i<c.length;i++){let v=c[i];for(let j=1;j<Math.min(9,i+1);j++)v=mod(v-q[j]*p[i-j]);p.push(mod(6*v));}return p;};
const iocN=p=>{let h=Array(29).fill(0);p.forEach(x=>h[x]++);return h.reduce((s,v)=>s+v*(v-1),0);};
const c=page(15).slice(20),d=divide(c),m=multiply(c);
assert.equal(c.length,139);
assert.deepEqual(multiply(d),c);assert.deepEqual(divide(m),c);
const native=solved.sections.map(s=>({name:s.name,seq:[...s.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x))}));
const p=native.find(s=>s.name==="0_welcome").seq.slice(0,139);
assert.equal(p.length,139);assert.deepEqual(divide(multiply(p)),p);assert.deepEqual(multiply(divide(p)),p);
const controls=[];for(const n of native)for(let i=0;i+139<=n.seq.length;i++)controls.push({section:n.name,start:i,n:iocN(n.seq.slice(i,i+139))});
controls.sort((a,b)=>a.n-b.n);assert.equal(controls.length,1882);
assert.deepEqual([iocN(c),iocN(d),iocN(m),controls[0].n],[670,636,672,980]);
const lat=v=>v.map(i=>corpus.translit[i]).join("");
console.log(JSON.stringify({status:"PASS",sourceOriginals:{f,a,b,q},p15Black:{page:15,start:20,length:c.length},candidates:{divide:{iocNumerator:iocN(d),ioc:iocN(d)/19182,translit:lat(d)},multiply:{iocNumerator:iocN(m),ioc:iocN(m)/19182,translit:lat(m)}},solvedNativeWindows:{count:controls.length,min:controls[0]},roundtripAndNativePlant:"PASS",conclusion:"Both frozen formal-series inverses fail native-GP prose comparison; no original plaintext"},null,2));
