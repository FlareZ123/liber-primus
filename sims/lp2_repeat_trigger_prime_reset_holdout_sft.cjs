'use strict';
// Exploratory repeat-triggered prime clock. No source-authenticated reset claimed.
const fs = require('node:fs');
const path = require('node:path');
function experiment(corpus,ref){
 const mod=x=>(x%29+29)%29, a=corpus.translit;
 const raw=ref.split(/^### (\d+)\s*$/m),parts={};
 for(let i=1;i<raw.length;i+=2)parts[Number(raw[i])]=raw[i+1];
 function gp(s){s=s.replace(/^\[.*\]$/gm,'').replace(/^\(.*\)$/gm,'').replace(/\bWISDOM \(continued\)/gi,'').toUpperCase().replace(/[^A-Z]/g,' ').replace(/V/g,'U').replace(/K/g,'C').replace(/Q/g,'C').replace(/Z/g,'S');const out=[];for(const w of s.split(/\s+/)){for(let i=0;i<w.length;){let t=w.slice(i,i+3)==='ING'?'NG':w.slice(i,i+2)==='IO'?'IA':a.filter(x=>w.startsWith(x,i)).sort((x,y)=>y.length-x.length)[0];if(!t)throw Error(w.slice(i));out.push(a.indexOf(t));i+=w.slice(i,i+3)==='ING'?3:t==='IA'&&w.slice(i,i+2)==='IO'?2:t.length;}}return out;}
 const train=[1,3,5,9,10,11,12,13,15].flatMap(p=>gp(parts[p])),donor=[6,14,57].flatMap(p=>gp(parts[p]));
 const counts=new Float64Array(29**3),ctx=new Float64Array(29**2);
 for(let i=2;i<train.length;i++){let j=train[i-2]*29+train[i-1];counts[j*29+train[i]]++;ctx[j]++;}
 const score=Float64Array.from(counts,(v,i)=>Math.log((v+.25)/(ctx[Math.floor(i/29)]+.25*29)));
 function ll(x,start=0,end=x.length){let s=0,n=0;for(let i=Math.max(2,start);i<end;i++){s+=score[(x[i-2]*29+x[i-1])*29+x[i]];n++;}return s/n;}
 const primes=[];for(let p=2;primes.length<5000;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break;}if(ok)primes.push(p-1);}
 function crypt(x,start,enc,reset){let j=start,prev=-1;const y=[];for(let i=0;i<x.length;i++){let v=mod(x[i]+(enc?1:-1)*primes[j]);let c=enc?v:x[i];y.push(v);j=reset&&c===prev?start:j+1;prev=c;}return y;}
 function attack(c,split,reset){let best=null;for(let k=0;k<=3300;k++){let p=crypt(c.slice(0,split),k,false,reset);let q=ll(p);if(!best||q>best.train){best={origin:k,train:q};}}let p=crypt(c,best.origin,false,reset);const replay=crypt(p,best.origin,true,reset);if(replay.some((v,i)=>v!==c[i]))throw Error('replay');return {...best,hold:ll(p,split),preview:p.slice(0,130).map(v=>a[v]).join(''),decoded:p};}
 const target=corpus.pages.slice(0,3).flatMap(p=>p.indices),n=target.length;
 const controls=[];for(const [k,offset] of [[1033,0],[2029,Math.max(0,donor.length-n)]]){const p=donor.slice(offset,offset+n);if(p.length<n)throw Error('short donor '+donor.length);const c=crypt(p,k,true,true);const b=attack(c,262,true);controls.push({expectedOrigin:k,origin:b.origin,train:b.train,hold:b.hold,exact:b.decoded.filter((v,i)=>v===p[i]).length,n,repeatCount:c.filter((v,i)=>i&&v===c[i-1]).length});}
 const actual=attack(target,262,true),baseline=attack(target,262,false);
 const compact=({decoded,...r})=>r;
 return {trainLength:train.length,donorLength:donor.length,split:262,controls,target:compact(actual),baseline:compact(baseline),targetRepeatCount:target.filter((v,i)=>i&&v===target[i-1]).length,actualDecoded:actual.decoded.map(v=>a[v]).join('')};
}
const root=path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const t=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const result=experiment(c,t);
if(result.controls.some(x=>x.origin!==x.expectedOrigin||x.exact!==729))throw Error('plant failed');
console.log(JSON.stringify(result,null,2));
