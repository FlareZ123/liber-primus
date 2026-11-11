#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')),ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json')),english=read('resources/control/shakespeare_first300k.txt');
const mod=(x,n=29)=>((x%n)+n)%n,PATIENCE=[6,5,3,0,2,4,7,1];
function inv(x){for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error('nonunit '+x);}
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
function pow(x,n){let r=[1,0],v=x.slice();while(n){if(n&1)r=mul(r,v);v=mul(v,v);n=Math.floor(n/2);}return r;}
for(const q of [2,3,5,7])assert.notDeepEqual(pow([0,1],840/q),[1,0]);assert.deepEqual(pow([0,1],840),[1,0]);
const pages=corpus.pages.slice().sort((a,b)=>a.page-b.page),by=new Map(pages.map(p=>[p.page,p]));
const starts=[];let total=0;for(let p=0;p<58;p++){starts[p]=total;total+=by.get(p).indices.length;}
const C=pages.filter(p=>p.page<=55).flatMap(p=>p.indices);assert.equal(total,13136);assert.equal(C.length,12956);assert.equal(by.get(54).indices[0],24);
const marks=[];for(const p of ink.pages){assert.equal(p.rune_count,by.get(p.page).indices.length);for(const m of p.large_punctuation||[])if(m[1]===13)marks.push({page:p.page,offset:m[0],global:starts[p.page]+m[0],color:m[2]});}
marks.sort((a,b)=>a.page-b.page||a.offset-b.offset||((a.color==='black'?0:1)-(b.color==='black'?0:1)));assert.equal(marks.length,31);
const B=[0,...marks.map(m=>m.global),total],lens=Array.from({length:32},(_,i)=>B[i+1]-B[i]);assert.equal(B[28],C.length);assert.equal(lens.filter(x=>x===0).length,2);
function orbit(M,start=24){const [a,b,c,d]=M.flat(),step=x=>{const n=x===null?a:mod(a*x+b),den=x===null?c:mod(c*x+d);return den===0?null:mod(n*inv(den));};const o=[];let x=start;while(!o.some(y=>y===x)){o.push(x);x=step(x);}assert.equal(x,start);assert.equal(o.length,30);assert.equal(new Set(o.map(v=>v===null?'∞':String(v))).size,30);return o;}
function rowMap(o){const rows=[];let idx=0,last=null,current=null;for(const m of marks){const k=m.page+':'+m.offset;if(k===last){assert.equal(k,'7:194');assert.equal(m.color,'red');rows.push(current===null?29:current);}else{current=o[idx++];rows.push(m.page===7&&m.offset===194&&m.color==='black'?30:(current===null?29:current));}last=k;}assert.equal(idx,30);rows.push(31);assert.deepEqual(rows.slice().sort((a,b)=>a-b),Array.from({length:32},(_,i)=>i));return rows;}
const Mu=[[0,8],[1,3]],Mz=[[23,13],[27,17]],ou=orbit(Mu),oz=orbit(Mz),ru=rowMap(ou),rz=rowMap(oz);
assert.deepEqual(ru,[24,25,21,10,14,9,20,30,18,28,4,26,29,0,22,27,8,6,17,12,16,5,1,2,19,3,11,13,15,23,7,31]);
assert.deepEqual(rz,[24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,8,23,29,3,18,5,10,6,7,0,11,28,1,14,17,31]);
const bytes=grid.pages.flatMap(p=>p.bytes),T=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));assert.equal(bytes.length,256);
const perms=T.map(row=>{const order=Array.from({length:8},(_,q)=>q).sort((a,b)=>row[PATIENCE[a]]-row[PATIENCE[b]]),f=Array(29);let n=0;for(const q of order){if(q===7)f[28]=n++;else for(let h=0;h<4;h++)f[4*q+h]=n++;}const iv=Array(29);f.forEach((v,i)=>iv[v]=i);assert.equal(new Set(f).size,29);return {f,iv};});
const rank=(c,p)=>c===p?28:c-Number(c>p),unrank=(r,p)=>r===28?p:r+Number(r>=p),col=r=>PATIENCE[r===28?7:Math.floor(r/4)],next=(s,r)=>T[s][col(r)]&31;
function decrypt(a,rows,opt={}){const {resetState=true,resetPrevious=false}=opt,out=Array(a.length);let p=0,s=0;for(let f=0;f<28;f++){if(resetState)s=rows[f];if(resetPrevious)p=0;for(let i=B[f];i<B[f+1];i++){const r=rank(a[i],p);out[i]=perms[s].f[r];s=next(s,r);p=a[i];}}return out;}
function encrypt(a,rows,opt={}){const {resetState=true,resetPrevious=false}=opt,out=Array(a.length);let p=0,s=0;for(let f=0;f<28;f++){if(resetState)s=rows[f];if(resetPrevious)p=0;for(let i=B[f];i<B[f+1];i++){const r=perms[s].iv[a[i]],c=unrank(r,p);out[i]=c;s=next(s,r);p=c;}}return out;}
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpEnglish(txt){const norm=txt.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S'),out=[];for(const w of norm.match(/[A-Z]+/g)||[]){const buf=[];for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t.s,i));if(!t){buf.length=0;break;}buf.push(t.i);i+=t.s.length;}out.push(...buf);}return out;}
const native=gpEnglish(english),train=native.slice(0,100000),held=native.slice(100000,112956);assert.equal(held.length,12956);
const tri=new Uint32Array(29**3),ctx=new Uint32Array(29**2);for(let i=2;i<train.length;i++){const k=train[i-2]*29+train[i-1];tri[k*29+train[i]]++;ctx[k]++;}
function metrics(a){const f=Array(29).fill(0);a.forEach(v=>f[v]++);let l=0;for(let i=2;i<a.length;i++){const k=a[i-2]*29+a[i-1];l+=Math.log((tri[k*29+a[i]]+.1)/(ctx[k]+2.9));}return {ioc:f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1)),top12:f.slice().sort((a,b)=>b-a).slice(0,12).reduce((s,n)=>s+n,0)/a.length,trigram:l/(a.length-2)};}
function test(name,rows,opt){const d=decrypt(C,rows,opt);assert.deepEqual(encrypt(d,rows,opt),C);const pc=encrypt(held,rows,opt),pr=decrypt(pc,rows,opt);assert.deepEqual(pr,held);return {name,options:opt,original:metrics(d),prefix:d.slice(0,120).map(v=>corpus.translit[v]).join(''),exactReplay:true,positiveControl:{plaintext:metrics(held),ciphertext:metrics(pc),recoveredExactly:true}};}
const models=[test('global state-0 baseline',ru,{resetState:false,resetPrevious:false}),test('u fragment state; predecessor continuous',ru,{resetState:true,resetPrevious:false}),test('u fragment state; predecessor reset0',ru,{resetState:true,resetPrevious:true}),test('speculative z fragment state; predecessor continuous',rz,{resetState:true,resetPrevious:false})];
console.log(JSON.stringify({classification:'bounded negative; no plaintext recovered',source:{uOrder:840,Mu,orbitU:ou.map(x=>x===null?'∞':x),Mz,orbitZ:oz.map(x=>x===null?'∞':x),markerLayers:marks.length,uniqueSites:30,emptyFragments:2,unknownFragments:28,unknownRunes:C.length,fragmentRowsU:ru,fragmentRowsZ:rz},raw:metrics(C),models},null,2));