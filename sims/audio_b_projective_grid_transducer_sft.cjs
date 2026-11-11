#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const mod=(x,n=29)=>((x%n)+n)%n,inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("nonunit "+x)};
const mm=(A,C)=>A.map(r=>C[0].map((_,j)=>mod(r[0]*C[0][j]+r[1]*C[1][j])));
const mpow=(A,n)=>{let R=[[1,0],[0,1]],V=A;while(n){if(n&1)R=mm(R,V);V=mm(V,V);n=Math.floor(n/2)}return R};
const minv=A=>{const d=inv(mod(A[0][0]*A[1][1]-A[0][1]*A[1][0]));return [[mod(A[1][1]*d),mod(-A[0][1]*d)],[mod(-A[1][0]*d),mod(A[0][0]*d)]]};
const project=(M,x)=>{const [a,b]=M[0],[c,d]=M[1],n=x===null?a:mod(a*x+b),den=x===null?c:mod(c*x+d);return den===0?null:mod(n*inv(den))};
function orbit(M,start){const a=[];let x=start;while(!a.some(y=>y===x)){a.push(x);x=project(M,x)}assert.equal(x,start);assert.equal(a.length,30);return a}
function prime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true}
function primeOrdinal(n){let k=0;for(let x=2;x<=n;x++)if(prime(x))k++;return k}
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const base=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const english=read("resources/control/shakespeare_first300k.txt");
const factors=[1259,1031,1229],ordinals=[205,173,201],offsets=[169,173,201,205];
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);assert.deepEqual(factors.map(primeOrdinal),ordinals);
const baseBytes=base.byte_rows.flat();assert.equal(baseBytes.length,256);
const squareBytes=offsets.map(i=>baseBytes[i]);assert.deepEqual(squareBytes,[228,117,74,76]);
const G=[[squareBytes[0]%29,squareBytes[1]%29],[squareBytes[2]%29,squareBytes[3]%29]];
const B=G.map(row=>row.map(x=>mod(7*x)));assert.deepEqual(B,[[1,7],[25,10]]);
const M0=[[23,13],[27,17]],S=[[1,0],[27,3]],SInv=[[1,0],[20,10]];
assert.deepEqual(mm(S,SInv),[[1,0],[0,1]]);assert.deepEqual(mm(SInv,S),[[1,0],[0,1]]);
assert.deepEqual(mm(mpow(M0,6),S),mm(S,B));assert.deepEqual(mpow(B,5),[[11,0],[0,11]]);
assert.equal(project(SInv,24),21);
const Bi=minv(B),powers={B:Array.from({length:5},(_,k)=>mpow(B,k)),"B^-1":Array.from({length:5},(_,k)=>mpow(Bi,k))};
const byPage=new Map(corpus.pages.map(p=>[p.page,p])),starts=[];let total=0;
for(let p=0;p<58;p++){starts[p]=total;total+=byPage.get(p).indices.length}
const ciphertext=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);assert.equal(ciphertext.length,12956);
const marks=[];
for(const p of ink.pages)for(const m of p.large_punctuation||[])if(m[1]===13)marks.push({page:p.page,offset:m[0],global:starts[p.page]+m[0],color:m[2]});
marks.sort((a,b)=>a.page-b.page||a.offset-b.offset||((a.color==="black"?0:1)-(b.color==="black"?0:1)));
const bounds=[0,...marks.map(m=>m.global),total],lengths=Array.from({length:32},(_,i)=>bounds[i+1]-bounds[i]);
assert.equal(marks.length,31);assert.equal(new Set(marks.map(m=>m.global)).size,29);
assert.equal(lengths.filter(n=>n===0).length,2);assert.equal(lengths.filter(n=>n>0).length,30);assert.equal(bounds[28],ciphertext.length);
const zOrbit=orbit(M0,24),gridOrbit=zOrbit.map(x=>project(SInv,x));
assert.equal(new Set(gridOrbit.map(x=>x===null?29:x)).size,30);
const fragmentRows=[];let oi=0,last=null,current=null;
for(const m of marks){if(m.global===last)fragmentRows.push(current===null?29:current);else{current=gridOrbit[oi++];fragmentRows.push(current===null?29:current)}last=m.global}
const terminal=gridOrbit[oi++];fragmentRows.push(terminal===null?29:terminal);
assert.equal(oi,30);assert.equal(fragmentRows.length,32);
const bytes=grid.pages.flatMap(p=>p.bytes),table=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));
assert.equal(bytes.length,256);assert(table.every(row=>row.length===8&&new Set(row).size===8));
const PAT=[6,5,3,0,2,4,7,1];
const permutations=table.slice(0,30).map(row=>{
 const order=Array.from({length:8},(_,q)=>q).sort((a,b)=>row[PAT[a]]-row[PAT[b]]),forward=Array(29);let n=0;
 for(const q of order){if(q===7)forward[28]=n++;else for(let h=0;h<4;h++)forward[4*q+h]=n++}
 assert.equal(new Set(forward).size,29);const inverse=Array(29);forward.forEach((v,i)=>inverse[v]=i);return {forward,inverse};
});
const rank=(c,p)=>c===p?28:c-Number(c>p),unrank=(r,p)=>r===28?p:r+Number(r>=p),column=r=>PAT[r===28?7:Math.floor(r/4)];
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpEnglish(source){const normalized=source.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S"),out=[];
 for(const word of normalized.match(/[A-Z]+/g)||[]){const buf=[];for(let i=0;i<word.length;){const t=tokens.find(t=>word.startsWith(t.s,i));if(!t){buf.length=0;break}buf.push(t.i);i+=t.s.length}out.push(...buf)}return out}
const native=gpEnglish(english);assert(native.length>=112956);
const training=native.slice(0,100000),heldout=native.slice(100000,100000+ciphertext.length);assert.equal(heldout.length,ciphertext.length);
const tri=new Uint32Array(29**3),ctx=new Uint32Array(29**2);
for(let i=2;i<training.length;i++){const k=training[i-2]*29+training[i-1];tri[k*29+training[i]]++;ctx[k]++}
const trigram=a=>{let s=0;for(let i=2;i<a.length;i++){const k=a[i-2]*29+a[i-1];s+=Math.log((tri[k*29+a[i]]+.1)/(ctx[k]+2.9))}return s/(a.length-2)};
const ioc=a=>{const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))};
function transform(input,matrixPowers,encrypting=false){
 const output=Array(input.length),exponents=Array(5).fill(0),visited=new Set();let previous=0;
 for(let f=0;f<28;f++){let state=fragmentRows[f];for(let i=bounds[f];i<bounds[f+1];i++){
  let r,current;if(encrypting){r=permutations[state].inverse[input[i]];current=unrank(r,previous);output[i]=current}
  else{current=input[i];r=rank(current,previous);output[i]=permutations[state].forward[r]}
  const b=table[state][column(r)],k=b%5;exponents[k]++;const next=project(matrixPowers[k],state===29?null:state);state=next===null?29:next;visited.add(state);previous=current;
 }}
 return {symbols:output,exponentCounts:exponents,statesVisited:visited.size};
}
const raw={ioc:ioc(ciphertext),trigram:trigram(ciphertext)},nativeMetrics={ioc:ioc(heldout),trigram:trigram(heldout)},results=[];
for(const direction of ["B","B^-1"]){
 const dec=transform(ciphertext,powers[direction]),replay=transform(dec.symbols,powers[direction],true);assert.deepEqual(replay.symbols,ciphertext);
 const planted=transform(heldout,powers[direction],true),recovered=transform(planted.symbols,powers[direction]);assert.deepEqual(recovered.symbols,heldout);
 results.push({direction,original:{ioc:ioc(dec.symbols),trigram:trigram(dec.symbols),prefix:dec.symbols.slice(0,80).map(v=>corpus.translit[v]).join(""),exactCipherRoundtrip:true},state:{distinctStatesVisited:dec.statesVisited,exponentCounts:dec.exponentCounts},positiveControl:{exactRecovery:true,plaintextIoc:nativeMetrics.ioc,plaintextTrigram:nativeMetrics.trigram,ciphertextTrigram:trigram(planted.symbols)}});
}
console.log(JSON.stringify({classification:"bounded negative for B^(selected-byte mod 5) PATIENCE state transition; no LP2 plaintext",source:{factors,primeOrdinals:ordinals,squareOffsets:offsets,squareBytes,G,B,M0,S,SInv,M0Power6:mpow(M0,6),BPower5:mpow(B,5),zOrbit:zOrbit.map(x=>x===null?29:x),gridBasisOrbit:gridOrbit.map(x=>x===null?29:x),fragmentRows:fragmentRows.slice(0,28),markerLayers:marks.length,uniqueGlobalOffsets:new Set(marks.map(m=>m.global)).size,emptyFragments:lengths.filter(n=>n===0).length,nonemptyFragments:lengths.filter(n=>n>0).length},raw,nativePositiveControl:nativeMetrics,results},null,2));
