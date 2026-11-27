'use strict';
const fs=require('node:fs');
function run(g,donors){
const q=29,mod=x=>((x%q)+q)%q;
const am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
const C=g.pages.filter(p=>p.page<56).flatMap(p=>p.indices),N=C.length-1;
if(N!==12955)throw Error("source length");
const observed=C.slice(1).filter((x,i)=>x===C[i]).length;
function solve(P,n){
const parity=new Uint8Array(P.length-1);let s=0;
for(let i=0;i<parity.length;i++){parity[i]=s;s^=P[i+1]===0?1:0}
let min=Infinity,witness=null,perb=[];
for(let b=1;b<q;b++){
let bmin=Infinity;
for(let flip=0;flip<2;flip++){
const bins=new Uint8Array(parity.length),state=new Uint8Array(parity.length);
for(let i=0;i<bins.length;i++){let s=parity[i]^flip;state[i]=s;bins[i]=mod((s?-1:1)*P[i+1]+b*P[i])}
const count=[new Int32Array(q),new Int32Array(q)],hist=[new Int32Array(n+1),new Int32Array(n+1)],mn=[0,0];hist[0][0]=q;hist[1][0]=q;
function add(s,k,d){let old=count[s][k],v=old+d;count[s][k]=v;hist[s][old]--;hist[s][v]++;if(v<mn[s])mn[s]=v;while(!hist[s][mn[s]])mn[s]++}
for(let i=0;i<n;i++)add(state[i],bins[i],1);
for(let start=0;start<=bins.length-n;start++){
let z=mn[0]+mn[1];if(z<bmin)bmin=z;
if(z<min){min=z;witness={start,b,flip,init:state[start],k:mn.map((v,s)=>mod(-count[s].indexOf(v))),counts:mn.slice()}}
if(start<bins.length-n){add(state[start],bins[start],-1);add(state[start+n],bins[start+n],1)}
}
}
perb.push(bmin)
}
let w=witness,z=0;s=w.init;
for(let i=w.start;i<w.start+n;i++){let d=mod((s?-1:1)*P[i+1]+w.b*P[i]+w.k[s]);z+=d===0;s^=P[i+1]===0?1:0}
if(z!==min)throw Error("witness not replayed");
return {runes:P.length,windows:P.length-n,min,witness,perb}
}
let short=[1,0,24,10,9,0,5,21,1,28,0,17,9,1,10,13,17,1,0,4,12,2,8,17,18,0,1,8,9,7,5,6,21,20,19,0,24,1,15,1],n=23,ref=solve(short,n),brute=Infinity;
for(let st=0;st<short.length-n;st++)for(let b=1;b<q;b++)for(let s0=0;s0<2;s0++){let s=s0,counts=[new Int32Array(q),new Int32Array(q)];for(let i=st;i<st+n;i++){counts[s][mod((s?-1:1)*short[i+1]+b*short[i])]++;s^=short[i+1]===0?1:0}for(let k0=0;k0<q;k0++)for(let k1=0;k1<q;k1++)brute=Math.min(brute,counts[0][mod(-k0)]+counts[1][mod(-k1)])}
if(brute!==ref.min)throw Error("brute mismatch");
return {N,observed,controls:donors.map((s,i)=>({i,...solve(norm(s),N)})),bruteCheck:brute}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(paths[0],'utf8')),paths.slice(1).map(p=>fs.readFileSync(p,'utf8'))),null,2));
