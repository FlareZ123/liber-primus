#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json"),ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/base60-grid.json"),control=fs.readFileSync("resources/control/gibran_prophet_58585.txt","utf8");
const mod=n=>((n%29)+29)%29,pages=[],all=[];let offset=0;
for(const p of corpus.pages){pages.push({page:p.page,start:offset,indices:p.indices});all.push(...p.indices);offset+=p.indices.length;}
assert.equal(all.length,13136);
const marks=[];for(const p of ink.pages){const pg=pages.find(x=>x.page===p.page);for(const e of p.large_punctuation||[])if(e[1]===13)marks.push(pg.start+e[0]);}
marks.sort((a,b)=>a-b);const bounds=[0,...marks,all.length],fragments=bounds.slice(0,-1).map((s,i)=>({id:i+1,length:bounds[i+1]-s}));
const empty=fragments.filter(f=>!f.length).map(f=>f.id);assert.equal(marks.length,31);assert.equal(fragments.length,32);assert.deepEqual(empty,[9,12]);
const distinct=Array.from({length:8},(_,c)=>new Set(grid.byte_rows.map(r=>r[c])).size);assert.deepEqual(distinct,[30,32,30,30,30,31,31,30]);
const ranked=fragments.filter(f=>f.length).map(f=>{const r=grid.byte_rows[f.id-1];return{fragment:f.id,rankByte:r[1],key:r.filter((_,c)=>c!==1).map(mod)};}).sort((a,b)=>a.rankByte-b.rankByte);
assert.equal(ranked.length,30);assert.equal(ranked[22].fragment,19);assert.equal(ranked[22].rankByte,210);assert.equal(ranked[25].fragment,22);assert.equal(ranked[25].rankByte,228);
const targetPages=corpus.pages.filter(p=>p.page>=33&&p.page<=39),pageLengths=targetPages.map(p=>p.indices.length);assert.deepEqual(pageLengths,[214,261,271,238,228,228,240]);
const target=targetPages.flatMap(p=>p.indices);assert.equal(target.length,1680);assert.equal(target.length,30*7*8);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),native=[];
for(let w of(control.toUpperCase().match(/[A-Z]+/g)||[])){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");for(let j=0;j<w.length;){const t=tokens.find(t=>w.startsWith(t.s,j));if(!t)throw Error("unmapped control");native.push(t.i);j+=t.s.length;}}
const train=native.slice(0,40000),tri=new Map();for(let i=2;i<train.length;i++){const k=train[i-2]*841+train[i-1]*29+train[i];tri.set(k,(tri.get(k)||0)+1);}
const den=train.length-2+0.1*29**3,trigram=a=>{let s=0;for(let i=2;i<a.length;i++){const k=a[i-2]*841+a[i-1]*29+a[i];s+=Math.log(((tri.get(k)||0)+0.1)/den);}return s/(a.length-2);};
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const prefix=a=>a.slice(0,120).map(x=>corpus.translit[x]).join(""),block=target.map((_,i)=>Math.floor(i/56)),row=target.map((_,i)=>Math.floor((i%56)/8));
const keyAt=(rs,i)=>rs[block[i]].key[row[i]],decode=(rs,sign)=>target.map((c,i)=>mod(c+sign*keyAt(rs,i)));
const score=(rs,sign)=>{let s=0;for(let i=2;i<target.length;i++){const a=mod(target[i-2]+sign*keyAt(rs,i-2)),b=mod(target[i-1]+sign*keyAt(rs,i-1)),c=mod(target[i]+sign*keyAt(rs,i));s+=Math.log(((tri.get(a*841+b*29+c)||0)+0.1)/den);}return s/(target.length-2);};
const observed=[-1,1].map(sign=>{const d=decode(ranked,sign);assert.deepEqual(d.map((p,i)=>mod(p-sign*keyAt(ranked,i))),target);return{sign,ioc:ioc(d),trigram:trigram(d),prefix:prefix(d)};});
const raw={ioc:ioc(target),trigram:trigram(target),prefix:prefix(target)},best=Math.max(...observed.map(x=>x.trigram));
let state=0x20261111>>>0;const rand=n=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)%n;};
const draws=10000,ns=[];for(let t=0;t<draws;t++){const sh=ranked.slice();for(let i=sh.length-1;i>0;i--){const j=rand(i+1);[sh[i],sh[j]]=[sh[j],sh[i]];}ns.push(Math.max(score(sh,-1),score(sh,1)));}
ns.sort((a,b)=>a-b);const ge=ns.filter(x=>x>=best).length,pct=q=>ns[Math.floor(q*(draws-1))];
const plant=native.slice(0,1680),cipher=plant.map((p,i)=>mod(p-keyAt(ranked,i))),recovered=cipher.map((c,i)=>mod(c+keyAt(ranked,i)));assert.deepEqual(recovered,plant);
console.log(JSON.stringify({source:{totalRunes:all.length,marks:marks.length,fragments:fragments.length,empty,nonempty:ranked.length,columnDistinct:distinct,fixedRanks:[22,25],fixedRows:[{fragment:ranked[22].fragment,byte:ranked[22].rankByte,key:ranked[22].key},{fragment:ranked[25].fragment,byte:ranked[25].rankByte,key:ranked[25].key}]},target:{pages:[33,34,35,36,37,38,39],pageLengths,runes:target.length,shape:[30,7,8]},raw,observed,null:{draws,seed:"0x20261111",bestOfBothSigns:true,atLeastObserved:ge,pAddOne:(ge+1)/(draws+1),mean:ns.reduce((s,x)=>s+x,0)/draws,p05:pct(.05),median:pct(.5),p95:pct(.95),p99:pct(.99)},syntheticPlant:{length:plant.length,exact:true}},null,2));
