'use strict';
// Node.js standalone: exact V-BACK gate for Director #2886.
const fs = require('node:fs');
const path = require('node:path');
function experiment(corpus){
 const K=[23,10,1,10,9,10,16,26],Q=29,m=x=>(x%Q+Q)%Q,eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const check=(ok,label)=>{if(!ok)throw Error(label)};
 /** @param {number[]} P @param {number[]} key @param {(t:number,j:number)=>boolean} coin */
 function encode(P,key,coin){let j=0,cp=null,C=[],backs=[];for(let t=0;t<P.length;t++){let c;while(true){c=m(P[t]+key[j%key.length]);if(cp!==null&&c===cp&&j>0&&coin(t,j)){j--;backs.push(t);continue}break}C.push(c);cp=c;j++}return {C,j,backs}}
 /** Exact count of distinct plaintexts for 0<s<1 and cyclically adjacent-distinct keys. Crib optional. @param {number[]} C @param {number[]} key @param {(number|null)[]} crib */
 function gate(C,key,crib=[]){check(key.every((v,i)=>v!==key[(i+1)%key.length]),"adjacent distinct key assumption");let states=new Map([[0,1n]]),ambiguous=0,first=null;for(let t=0;t<C.length;t++){const next=new Map(),symbols=new Set();for(const [j,count] of states){const p=m(C[t]-key[j%key.length]);if(crib[t]==null||crib[t]===p){next.set(j+1,(next.get(j+1)||0n)+count);symbols.add(p)}
 if(t>0&&j>0&&m(C[t]-C[t-1])===m(key[(j-1)%key.length]-key[j%key.length])){const b=m(C[t]-key[(j-1)%key.length]);if(crib[t]==null||crib[t]===b){next.set(j,(next.get(j)||0n)+count);symbols.add(b);if(first===null)first={t,j,normal:p,back:b,prev:C[t-1],c:C[t]}}}
 }states=next;if(symbols.size>1)ambiguous++}
 const total=[...states.values()].reduce((a,b)=>a+b,0n);const endpoints=[...states].sort((a,b)=>a[0]-b[0]).map(([j,n])=>[j,n.toString()]);return {total:total.toString(),ambiguous,first,endpoints}}
 function wordRunes(s){const a=corpus.translit.map((v,i)=>[v,i]).sort((x,y)=>y[0].length-x[0].length);let p=[];for(const w of s.split(" ")){for(let i=0;i<w.length;){const z=a.find(([v])=>w.startsWith(v,i));check(z,"GP token "+w);p.push(z[1]);i+=z[0].length}}return p}
 const p56=wordRunes("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");const prime=[];for(let n=2;prime.length<100;n++){if(!prime.some(p=>p*p<=n&&n%p===0))prime.push(n)}let cursor=0;const auth=p56.map(p=>p===0?0:m(p+prime[cursor++]-1));check(eq(auth,corpus.pages[56].indices)&&cursor===84,"authentic p56");
 const p57=corpus.pages[57].indices;const rotate=(a,i)=>a.slice(i).concat(a.slice(0,i));let seed=0x76b2886;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 let exhaustive=0;for(const key of [[0,1],[23,10]]){const buckets=new Map();for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(const yes of [false,true]){const P=[a,b],v=encode(P,key,()=>yes),s=v.C.join(",");if(!buckets.has(s))buckets.set(s,new Set());buckets.get(s).add(P.join(","))}for(const [s,ps] of buckets){check(BigInt(gate(s.split(",").map(Number),key).total)===BigInt(ps.size),"exhaustive count");exhaustive++}}
 const plants=[];for(let t=0;t<12;t++){const donor=t%2?p57:p56,phase=Math.floor(random()*8),key=rotate(K,phase),P=donor.slice(t%5,donor.length-(t%3));const encoded=encode(P,key,()=>random()<0.81);const received=gate(encoded.C,key);const candidates=Array.from({length:8},(_,i)=>gate(encoded.C,rotate(K,i)).total);const withCrib=Array.from({length:8},(_,i)=>gate(encoded.C,rotate(K,i),P).total);check(BigInt(gate(encoded.C,key,P).total)===1n,"true plaintext path");check(candidates.every(n=>BigInt(n)>0n),"all key rotations feasible");plants.push({phase,length:P.length,backs:encoded.backs.length,knownKeyCount:received.total,endpointCount:received.endpoints.find(([j])=>j===encoded.j)[1],unknownKeyCandidates:candidates.length,fullCribSurvivors:withCrib.filter(n=>BigInt(n)>0n).length})}
 const C=corpus.pages[54].indices.concat(corpus.pages[55].indices);const result=gate(C,K);const first=result.first.t;const base=C.map((v,t)=>m(v-K[t%8]));const alt=C.map((v,t)=>m(v-K[(t-(t>=first?1:0))%8]));check(eq(encode(base,K,()=>false).C,C),"baseline replay");check(eq(encode(alt,K,t=>t===first).C,C),"alternative replay");const p55=gate(corpus.pages[55].indices,K);
 return {authenticP56:auth.length,consuming:cursor,exhaustive,plants,original:{runes:C.length,total:result.total,ambiguous:result.ambiguous,endpoints:result.endpoints,first:result.first,baseWindow:base.slice(first-1,first+2),altWindow:alt.slice(first-1,first+2),different:base.filter((x,i)=>x!==alt[i]).length,p55:{total:p55.total,first:p55.first,ambiguous:p55.ambiguous}}}
}
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
console.log(JSON.stringify(experiment(corpus), null, 2));
