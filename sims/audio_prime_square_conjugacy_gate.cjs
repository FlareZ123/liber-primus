#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json')),base=JSON.parse(read('resources/liber-primus/base60-grid.json')),english=read('resources/control/shakespeare_first300k.txt');
const mod=(x,n=29)=>((x%n)+n)%n,prime=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;};
function firstPrimes(k){const a=[];for(let n=2;a.length<k;n++)if(prime(n))a.push(n);return a;}
const primes=firstPrimes(205),ordinal=[205,173,201];assert.deepEqual(ordinal.map(i=>primes[i-1]),[1259,1031,1229]);assert.equal(1259*1031*1229,1595277641);
const bytes=base.byte_rows.flat();assert.equal(bytes.length,256);
const offsets=[169,173,201,205],corners=offsets.map(i=>bytes[i]),G=[[corners[0]%29,corners[1]%29],[corners[2]%29,corners[3]%29]],B=G.map(r=>r.map(x=>mod(7*x)));
assert.deepEqual(corners,[228,117,74,76]);assert.deepEqual(G,[[25,1],[16,18]]);assert.deepEqual(B,[[1,7],[25,10]]);
const altOffsets=[168,172,200,204],alt=altOffsets.map(i=>bytes[i]),Galt=[[alt[0]%29,alt[1]%29],[alt[2]%29,alt[3]%29]],Balt=Galt.map(r=>r.map(x=>mod(7*x)));
const mul=(A,C)=>A.map(r=>C[0].map((_,j)=>mod(r[0]*C[0][j]+r[1]*C[1][j]))),pow=(A,n)=>{let R=[[1,0],[0,1]],V=A;while(n){if(n&1)R=mul(R,V);V=mul(V,V);n=Math.floor(n/2);}return R;};
const det=A=>mod(A[0][0]*A[1][1]-A[0][1]*A[1][0]),inv29=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error('nonunit');};
const M0=[[23,13],[27,17]],S=[[1,0],[27,3]],M6=pow(M0,6),M30=pow(M0,30),B5=pow(B,5),lhs=mul(M6,S),rhs=mul(S,B);
assert.deepEqual(lhs,[[1,7],[15,16]]);assert.deepEqual(rhs,lhs);assert.deepEqual(B5,[[11,0],[0,11]]);assert.deepEqual(M30,B5);
const SInv=[[1,0],[20,10]],project=(A,x)=>{const [a,b]=A[0],[c,d]=A[1],n=x===null?a:mod(a*x+b),den=x===null?c:mod(c*x+d);return den===0?null:mod(n*inv29(den));};
const start=project(SInv,24);assert.equal(start,21);
const sourceValues=[0,1,2,3,5,10,13,15,23,27],intertwiners=[];for(const a of sourceValues)for(const b of sourceValues)for(const c of sourceValues)for(const d of sourceValues){const X=[[a,b],[c,d]];if(det(X)&&JSON.stringify(mul(M6,X))===JSON.stringify(mul(X,B)))intertwiners.push(X);}
const redValues=[13,23,2,27,5,15],pageValues=[3,10],lower=[];for(const a of redValues)for(const b of pageValues){const X=[[1,0],[a,b]];if(det(X)&&JSON.stringify(mul(M6,X))===JSON.stringify(mul(X,B)))lower.push(X);}
assert.equal(intertwiners.length,12);assert.deepEqual(lower,[S]);
const canon=x=>x===null?29:x,cycles=A=>{const seen=new Set(),out=[];for(const s of [...Array(29).keys(),null]){if(seen.has(canon(s)))continue;const c=[];let x=s;while(!seen.has(canon(x))){seen.add(canon(x));c.push(x);x=project(A,x);}out.push(c);}return out;};
const cB=cycles(B),BInv=(()=>{const z=inv29(det(B));return [[mod(B[1][1]*z),mod(-B[0][1]*z)],[mod(-B[1][0]*z),mod(B[0][0]*z)]];})(),cBi=cycles(BInv);
const startCycle=cB.find(c=>c.some(x=>canon(x)===start)),cycleFromStart=[...startCycle.slice(startCycle.findIndex(x=>canon(x)===start)),...startCycle.slice(0,startCycle.findIndex(x=>canon(x)===start))];
assert.equal(cB.length,6);assert.ok(cB.every(c=>c.length===5));assert.deepEqual(cycleFromStart,[21,20,5,22,0]);
const pages=new Map(corpus.pages.map(p=>[p.page,p])),pageStarts=[];let total=0;for(let p=0;p<58;p++){pageStarts[p]=total;total+=pages.get(p).indices.length;}
const marks=[];for(const p of ink.pages)for(const m of p.large_punctuation||[])if(m[1]===13)marks.push({page:p.page,offset:m[0],global:pageStarts[p.page]+m[0],color:m[2]});
marks.sort((a,b)=>a.page-b.page||a.offset-b.offset||((a.color==='black'?0:1)-(b.color==='black'?0:1)));
const bounds=[0,...marks.map(m=>m.global),total],lengths=Array.from({length:32},(_,i)=>bounds[i+1]-bounds[i]),uOrbit=[];let u=24;const U=[[0,8],[1,3]];while(!uOrbit.includes(u)){uOrbit.push(u);u=project(U,u);}assert.equal(uOrbit.length,30);
const rows=[];let oi=0,last=null,current=null;for(const m of marks){if(m.global===last)rows.push(current===null?29:current);else{current=uOrbit[oi++];rows.push(current===null?29:current);}last=m.global;}const tail=uOrbit[oi++];rows.push(tail===null?29:tail);
const all=corpus.pages.flatMap(p=>p.indices),frags=[];for(let i=0;i<32;i++)if(lengths[i]>0)frags.push({index:i,state:rows[i],text:all.slice(bounds[i],bounds[i+1])});
assert.equal(marks.length,31);assert.equal(new Set(marks.map(m=>m.global)).size,29);assert.equal(frags.length,30);assert.equal(new Set(frags.map(f=>f.state)).size,30);
const byState=new Map(frags.map(f=>[f.state,f.text]));
function cycleOrder(cs){const first=cs.find(c=>c.some(x=>canon(x)===start));const rest=cs.filter(c=>c!==first).sort((a,b)=>Math.min(...a.map(canon))-Math.min(...b.map(canon)));return [first,...rest].map(c=>{const target=c===first?start:Math.min(...c.map(canon)),i=c.findIndex(x=>canon(x)===target);return [...c.slice(i),...c.slice(0,i)];}).flat();}
const orderB=cycleOrder(cB),orderBi=cycleOrder(cBi),physical=frags.flatMap(f=>f.text),reorder=order=>order.flatMap(s=>byState.get(canon(s)));
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpEnglish(txt){const norm=txt.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S'),out=[];for(const w of norm.match(/[A-Z]+/g)||[]){const buf=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t.s,i));if(!t){buf.length=0;break;}buf.push(t.i);i+=t.s.length;}out.push(...buf);}return out;}
const native=gpEnglish(english),train=native.slice(0,100000),tri=new Uint32Array(29**3),ctx=new Uint32Array(29**2);for(let i=2;i<train.length;i++){const k=train[i-2]*29+train[i-1];tri[k*29+train[i]]++;ctx[k]++;}
const score=a=>{let l=0;for(let i=2;i<a.length;i++){const k=a[i-2]*29+a[i-1];l+=Math.log((tri[k*29+a[i]]+.1)/(ctx[k]+2.9));}return l/(a.length-2);};
const scorePhysical=score(physical),scoreB=score(reorder(orderB)),scoreBi=score(reorder(orderBi));
let seed=0x761205,sum=0,atLeast=0,max=-Infinity;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let k=0;k<2000;k++){const a=frags.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const s=score(a.flatMap(x=>x.text));sum+=s;if(s>max)max=s;if(s>=scoreB)atLeast++;}
const magic=[272,138,341,131,151,366,199,130,320,18,226,245,91,245,226,18,320,130,199,366,151,131,341,138,272],phi=n=>{let x=n,v=n;for(let p=2;p*p<=x;p++)if(x%p===0){while(x%p===0)x/=p;v-=v/p;}if(x>1)v-=v/x;return v;};
const fiveLabels=cycleFromStart.map(i=>{const v=magic[i],r=mod(phi(v));return {cell:i+1,value:v,phi:phi(v),label:r,rune:corpus.translit[r]};});
console.log(JSON.stringify({classification:'bounded positive structural bridge; no LP2 plaintext',audio:{product:1595277641,factors:[1259,1031,1229],primeOrdinals:ordinal,ordinalResidues:ordinal.map(x=>mod(x)),fileId761Mod29:7,phi761Mod29:mod(760)},grid:{directOffsets:offsets,bytes:corners,coordinates:offsets.map(x=>[Math.floor(x/8),x%8]),G,B,ordinalMinus1Offsets:altOffsets,ordinalMinus1Bytes:alt,ordinalMinus1G:Galt,ordinalMinus1B:Balt,ordinalMinus1Conjugacy:JSON.stringify(mul(M6,S))===JSON.stringify(mul(S,Balt))},field:{M0,z:'23+27u',uPolynomial:'u^2=3u+8',S,M0Power6:M6,conjugacyLeft:lhs,conjugacyRight:rhs,BPower5:B5,M0Power30:M30,sourceEntryIntertwiners:intertwiners.length,sourceEntryFamilySize:sourceValues.length**4,lowerTriangularSourceIntertwiners:lower,startState:start,BProjectiveCycles:cB.map(c=>c.map(canon))},fragmentPermutation:{markerLayers:marks.length,globalOffsets:new Set(marks.map(m=>m.global)).size,nonemptyFragments:frags.length,uRows:rows,BStateOrder:orderB.map(canon),BInverseStateOrder:orderBi.map(canon),physicalScore:scorePhysical,BScore:scoreB,BInverseScore:scoreBi,randomN:2000,randomMean:sum/2000,randomMax:max,randomAtLeastAsGood:atLeast},fiveCycleAs2014Cells:fiveLabels},null,2));