#!/usr/bin/env node
"use strict";
// Prospective p55 source-Q pairwise field inverse; fixed by
// workplace/lp2-p3-q-gf29sq-original-p55-pair-inverse-pretarget.md
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const cp=load("resources/liber-primus/lp2-corpus.json"),solved=load("resources/external/relikd-solved-gp29-native-v1.json");
const page=p=>cp.pages.find(x=>x.page===p).indices,mod=x=>((x%29)+29)%29;
const poly=page(3).slice(119,122),a=page(15).slice(9,20),b=page(57).slice(0,7);
assert.deepEqual(poly,[13,23,2]);
const rem=a.map((v,i)=>mod(v-(b[i]||0))),Q=Array(9).fill(0);
for(let i=10;i>=2;i--){let t=mod(rem[i]*15);Q[i-2]=t;for(let j=0;j<3;j++)rem[i-2+j]=mod(rem[i-2+j]-t*poly[j]);}
assert.deepEqual(rem,Array(11).fill(0));assert.deepEqual(Q,[5,5,14,9,10,4,27,17,25]);
const fieldmul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
let base=[1,0],E=[0,0];for(const x of Q){E=[mod(E[0]+x*base[0]),mod(E[1]+x*base[1])];base=fieldmul(base,[0,1]);}
assert.deepEqual(E,[17,24]);
const M=[[17,18],[24,2]],Minv=[[22,5],[26,13]];
const matmul=(m,n)=>[0,1].map(i=>[0,1].map(j=>mod(m[i][0]*n[0][j]+m[i][1]*n[1][j])));
assert.deepEqual(matmul(M,Minv),[[1,0],[0,1]]);
assert.deepEqual(matmul(Minv,M),[[1,0],[0,1]]);
const apply=(m,seq)=>{assert.equal(seq.length%2,0);let out=[];for(let i=0;i<seq.length;i+=2)
 out.push(mod(m[0][0]*seq[i]+m[0][1]*seq[i+1]),mod(m[1][0]*seq[i]+m[1][1]*seq[i+1]));return out;};
const original=page(55);
assert.equal(original.length,76);
const candidates=[["Q-times",M,Minv],["Q-inverse",Minv,M]];
const native=solved.sections.map(s=>({name:s.name,seq:[...s.source_text].filter(ch=>cp.runes.includes(ch)).map(ch=>cp.runes.indexOf(ch))}));
const histCount=seq=>{let h=Array(29).fill(0);for(let t of seq)h[t]++;return h.reduce((n,x)=>n+x*(x-1),0);};
let windows=[];
for(const s of native)for(let i=0;i+76<=s.seq.length;i++)windows.push({source:s.name,start:i,n:histCount(s.seq.slice(i,i+76))});
windows.sort((a,b)=>a.n-b.n);
assert.equal(windows.length,2304);assert.equal(windows[0].n,260);
const donor=native.find(s=>s.name==="0_loss_of_divinity").seq.slice(0,76);assert.equal(donor.length,76);
const results=[];
for(const [mode,m,reverse] of candidates){
 const plain=apply(m,original);
 assert.deepEqual(apply(reverse,plain),original);
 const generated=apply(reverse,donor);
 assert.deepEqual(apply(m,generated),donor);
 const n=histCount(plain);
 assert(n<windows[0].n);
 results.push({mode,ioCNumerator:n,ioC:n/(76*75),actualTranslit:plain.map(i=>cp.translit[i]).join(""),
 original76Roundtrip:true,nativePlant76Recovery:true});
}
assert.deepEqual(results.map(x=>x.ioCNumerator),[198,196]);
assert.equal(histCount(original),216);
console.log(JSON.stringify({status:"PASS",kind:"Prospective original p55 direct GF29 squared Q pair inverse negative",
 source:{markedTriad:poly,derivedQ:Q,fieldEvaluation:E,matrix:M,inverse:Minv,
 receiver:"physical p55, complete 76 source runes, 38 non-overlapping pairs, start local offset0"},
 originalIoCNumerator:histCount(original),nativeMatched76Windows:{count:windows.length,
 minNumerator:windows[0].n,minimumSource:windows[0].source,minimumIndex:windows[0].start},
 results,interpretation:"No native GP plaintext, despite full invertibility and planted source-native decoding; no fitted pair offset."},null,2));
