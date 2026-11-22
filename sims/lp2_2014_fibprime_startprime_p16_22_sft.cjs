#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const d=JSON.parse(fs.readFileSync(path.join(process.cwd(),'resources/liber-primus/lp2-corpus.json'),'utf8'));
const C=d.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
assert.equal(C.length,1744);
const starts=[2n,3n,5n,13n,89n,233n,1597n,28657n,514229n,433494437n,2971215073n,99194853094755497n];
const bases=[2n,325n,9375n,28178n,450775n,9780504n,1795265022n];
function pow(a,e,n){let r=1n;a%=n;while(e){if(e&1n)r=r*a%n;a=a*a%n;e>>=1n;}return r;}
function prime(n){
 if(n<2n)return false;
 for(const p of [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n]){if(n===p)return true;if(n%p===0n)return false;}
 let x=n-1n,s=0;while(!(x&1n)){x>>=1n;s++;}
 for(const b0 of bases){const b=b0%n;if(!b)continue;let y=pow(b,x,n);if(y===1n||y===n-1n)continue;let ok=false;for(let r=1;r<s;r++){y=y*y%n;if(y===n-1n){ok=true;break;}}if(!ok)return false;}
 return true;
}
function stream(start){
 const ps=[start];let cand=start===2n?3n:start+2n;
 function ensure(i){while(ps.length<=i){while(!prime(cand))cand+=2n;ps.push(cand);cand+=2n;}}
 return {key(i){ensure(i);return Number((ps[i]-1n)%29n);},prime(i){ensure(i);return ps[i].toString();}};
}
function inverse(input,s){
 let states=new Map([[0,1n]]);
 for(let i=0;i<input.length;i++){
  const c=input[i],next=new Map(),trans=[];
  for(const [ph,n] of states){
   const k=s.key(ph);
   if(c===0)next.set(ph,(next.get(ph)||0n)+n);
   const p=(c-k+29)%29;
   if(p!==0)next.set(ph+1,(next.get(ph+1)||0n)+n);
   else trans.push({phase:ph,key:k,prime:s.prime(ph)});
  }
  states=next;
  if(!states.size)return {survives:false,position:i,cipher:c,rune:d.translit[c],invalid:trans};
 }
 return {survives:true,pathCount:[...states.values()].reduce((a,b)=>a+b,0n).toString()};
}
function encrypt(input,s){let ph=0;return input.map(p=>{if(p===0)return 0;const c=(p+s.key(ph))%29;ph++;return c;});}
const results=starts.map(q=>({start:q.toString(),...inverse(C,stream(q))}));
assert(results.every(x=>!x.survives));
assert.deepEqual(results.map(x=>x.position),[7,8,4,30,38,12,17,153,12,2,19,23]);
const p57=d.pages.find(p=>p.page===57).indices;
const plant=Array.from({length:19},()=>p57).flat();
const control=inverse(encrypt(plant,stream(2n)),stream(2n));
assert.equal(control.survives,true);
console.log(JSON.stringify({
 target:'physical pp16-22',runes:C.length,
 candidateStarts:results,
 positiveControl:{source:'p57 plaintext repeated 19 times',runes:plant.length,...control},
 decision:'All 12 Fibonacci-prime starting values fail under the p56 prime-totient/F-bypass rule.'
},null,2));
