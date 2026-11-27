'use strict';
// Canonical GP29 pair quotient/remainder gate, Issue #3123.
function run(c){
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 const a=c.pages.slice(0,56).flatMap(p=>p.indices), split=c.pages.slice(0,27).reduce((s,p)=>s+p.indices.length,0);
 assert(a.length===12956&&split===6527,"source geometry");
 const pairs=x=>{assert(x.length%2===0,"odd tape");return Array.from({length:x.length/2},(_,i)=>29*x[2*i]+x[2*i+1]);};
 const unpack=n=>[Math.floor(n/256),n%256];
 const pack=(q,b)=>{assert(Number.isInteger(q)&&Number.isInteger(b)&&q>=0&&q<=3&&b>=0&&b<256&&256*q+b<841,"illegal state");return 256*q+b;};
 const inv=ns=>ns.flatMap(n=>[Math.floor(n/29),n%29]);
 const round=x=>{let n=pairs(x);assert(JSON.stringify(inv(n.map(y=>pack(...unpack(y)))))===JSON.stringify(x),"roundtrip");return n;};
 for(let n=0;n<841;n++)assert(pack(...unpack(n))===n,"bijection");
 const halves=n=>[n.slice(0,Math.floor(split/2)),n.slice(Math.ceil(split/2))];
 const counts=(n,k)=>{let t=Array(k).fill(0);for(const v of n)t[v]++;return t};
 const entropy=(n,k)=>{let t=counts(n,k);return t.reduce((s,v)=>s+(v?-v/n.length*Math.log2(v/n.length):0),0)};
 const ascii=b=>b===9||b===10||b===13||(b>=32&&b<=126);
 const headers={"gzip":[31,139,8],"bzip2":[66,90,104],"zip":[80,75,3,4],"png":[137,80,78,71,13,10,26,10],"pdf":[37,80,68,70,45],"ELF":[127,69,76,70],"PGP armor":[45,45,45,45,45,66,69,71,73,78],"xz":[253,55,122,88,90,0],"JPEG":[255,216,255],"7z":[55,122,188,175,39,28]};
 const stats=n=>{const q=n.map(x=>Math.floor(x/256)), b=n.map(x=>x%256), ordinary=b.filter((_,i)=>q[i]<3), side=b.filter((_,i)=>q[i]===3);let longest=0,cur=0;for(let x of ordinary){cur=ascii(x)?cur+1:0;longest=Math.max(longest,cur)}let t=Array.from({length:4},()=>Array(4).fill(0));for(let i=1;i<q.length;i++)t[q[i-1]][q[i]]++;return {pairs:n.length,q:counts(q,4),ordinaryAscii:ordinary.filter(ascii).length/ordinary.length,sideAscii:side.filter(ascii).length/Math.max(1,side.length),byteEntropy:entropy(b,256),ordinaryEntropy:entropy(ordinary,256),longestPrintable:longest,sideLongestGap:q.reduce((s,v,i)=>v===3?[Math.max(s[0],i-s[1]),i]:s,[0,-1])[0],transitions:t,firstBytes:ordinary.slice(0,16).map(x=>x.toString(16).padStart(2,"0")).join(""),headers:Object.keys(headers).filter(k=>headers[k].every((x,i)=>x===ordinary[i]))};};
 const predictive=(train,test)=>{const s=stats(train), p=s.q.map(x=>(x+1)/(train.length+4)), t=s.transitions.map(row=>row.map(x=>(x+1)/(row.reduce((a,b)=>a+b,0)+4)));let q=test.map(x=>Math.floor(x/256)),gain=0;for(let i=1;i<q.length;i++)gain+=Math.log2(t[q[i-1]][q[i]]/p[q[i]]);return gain/(q.length-1);};
 const integerBytes=x=>{let n=0n;for(const v of x)n=n*29n+BigInt(v);let h=n.toString(16);if(h.length%2)h="0"+h;let b=h.match(/../g).map(x=>parseInt(x,16));let v=0n;for(let y of b)v=256n*v+BigInt(y);let recovered=Array(x.length);for(let i=x.length-1;i>=0;i--){recovered[i]=Number(v%29n);v/=29n}assert(v===0n&&recovered.every((y,i)=>y===x[i]),"integer replay");return {bytes:b.length,ascii:b.filter(ascii).length/b.length,entropy:entropy(b,256),firstBytes:h.slice(0,32),headers:Object.keys(headers).filter(k=>headers[k].every((x,i)=>x===b[i]))};};
 let seed=0x3123beef;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
 const shuffle=x=>{for(let i=x.length-1;i>0;i--){let j=rand(i+1);[x[i],x[j]]=[x[j],x[i]]}return x};
 const repeatMask=a.slice(1).map((x,i)=>x===a[i]), repeatCounts=[repeatMask.filter((v,i)=>i%2===0&&v).length,repeatMask.filter((v,i)=>i%2===1&&v).length];
 const nullTape=matched=>{let mask;if(matched){let e=shuffle(repeatMask.filter((_,i)=>i%2===0)),o=shuffle(repeatMask.filter((_,i)=>i%2===1));mask=repeatMask.map((_,i)=>i%2?o[i>>1]:e[i>>1]);}else mask=Array(a.length-1).fill(false);
 let y=[rand(29)];for(let i=0;i<mask.length;i++){let last=y[i],k=rand(matched?28:29);y.push(matched?(mask[i]?last:k+(k>=last)):k)}return y;};
 const metrics=n=>{let [tr,te]=halves(n),s=stats(n);return {overflow:s.q[3]/s.pairs,ascii:s.ordinaryAscii,entropy:s.ordinaryEntropy,longest:s.longestPrintable,heldGain:predictive(tr,te)}};
 const real=round(a), [tr,te]=halves(real), obs=metrics(real);
 const nulls={};for(const mode of ["uniform","matched"]){let vals=Object.keys(obs).map(()=>[]);for(let r=0;r<1000;r++){let m=metrics(pairs(nullTape(mode==="matched")));Object.values(m).forEach((x,i)=>vals[i].push(x));}nulls[mode]=Object.fromEntries(Object.keys(obs).map((k,i)=>{let v=vals[i].sort((x,y)=>x-y);return [k,{min:v[0],p025:v[25],median:v[500],p975:v[975],max:v[999],le:v.filter(x=>x<=obs[k]).length,ge:v.filter(x=>x>=obs[k]).length}]}));}
 const primes=[];for(let x=2;primes.length<85;x++)if(!primes.some(p=>p*p<=x&&x%p===0))primes.push(x);
 let j=0;const p56=c.pages[56].indices.map((x,i)=>i===56?x:(x-primes[j++]+1+29*1000)%29);
 const native=[p56,c.pages[57].indices].map(p=>p.map(i=>c.translit[i]).join(""));
 const plants=native.map((s,k)=>{let p=Array.from(s,x=>x.charCodeAt(0)),n=p.map((b,i)=>pack((i+k)%3,b)),y=inv(n),z=round(y);assert(z.map(x=>String.fromCharCode(x%256)).join("")===s,"plant");assert(z.every((x,i)=>Math.floor(x/256)===(i+k)%3),"quotient plant");
 return {plaintext:s,pairs:z.length,stats:stats(z),repeats:y.slice(1).filter((x,i)=>x===y[i]).length};});
 // An explicit q=3 event at every 13th slot: retained as a typed 0..72 literal.
 const plantedMixed=Array.from({length:256},(_,i)=>i%13===0?pack(3,i%73):pack(i%3,i));assert(round(inv(plantedMixed)).every((x,i)=>x===plantedMixed[i]),"overflow plant");
 return {schema:1,sourceGeometry:{runes:a.length,pairs:real.length,split,omittedBoundaryPair:Math.floor(split/2),repeatCounts},all:stats(real),train:stats(tr),hold:stats(te),obs,nulls,wholeInteger:integerBytes(a),plants,overflowPlant:{pairs:plantedMixed.length,overflow:plantedMixed.filter(x=>x>=768).length}};
}
const fs=require('node:fs');const path=require('node:path');
const c=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(run(c),null,2));
