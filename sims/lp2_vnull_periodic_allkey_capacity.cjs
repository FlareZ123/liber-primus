"use strict";
const fs=require("node:fs");
const run=function run(inputs){
const gp=JSON.parse(inputs[0]),S="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),m=x=>(x%29+29)%29;const tok=S.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){let t=tok.find(x=>w.startsWith(x[0]));a.push(t[1]);w=w.slice(t[0].length)}}return a}
const donors=inputs.slice(1,4).map(s=>encode(s.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"")));
const native=JSON.parse(inputs[4]),map=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(r=>map.has(r)).map(r=>map.get(r))}));const nativeTape=ns.flatMap(s=>s.P);
const freq=Array(29).fill(0);for(let d of donors.slice(0,2))for(let x of d)freq[x]++;const ordered=freq.map((n,i)=>[n,i]).sort((a,b)=>b[0]-a[0]).map(x=>x[1]),sets=[5,8,10,12,15].map(k=>({k,T:ordered.slice(0,k)}));
const prefix=[...donors,nativeTape].map(P=>sets.map(({T})=>{let a=new Uint32Array(P.length+1),set=new Set(T);for(let i=0;i<P.length;i++)a[i+1]=a[i]+set.has(P[i]);return a}));
const cache=new Map();function minCount(L,k){let id=L+":"+k;if(cache.has(id))return cache.get(id);const v=prefix.map(a=>{let x=a[k];if(x.length<=L)return null;let lo=Infinity;for(let i=L;i<x.length;i++)lo=Math.min(lo,x[i]-x[i-L]);return lo});cache.set(id,v);return v}
function dcap(C,q){let A=Array.from({length:q},()=>new Uint32Array(29));for(let i=1;i+1<C.length;i++){if(C[i]===C[i-1])continue;let a=m(C[i]-C[i-1]),b=m(C[i+1]-C[i-1]);A[i%q][a]++;if(a!==b)A[i%q][b]++}let D=new Float64Array(29);D.fill(-Infinity);D[0]=0;for(let j=0;j<q;j++){let next=new Float64Array(29);next.fill(-Infinity);for(let a=0;a<29;a++)for(let b=0;b<29;b++)next[m(a+b)]=Math.max(next[m(a+b)],D[a]+A[j][b]);D=next}return D[0]}
function ucap(C,q,T){let H=Array.from({length:q},()=>new Uint32Array(29));for(let i=0;i<C.length;i++)H[i%q][C[i]]++;return H.reduce((s,h)=>s+Math.max(...Array.from({length:29},(_,x)=>T.reduce((n,t)=>n+h[m(t+x)],0))),0)}
function evaluate(C,q){let D=dcap(C,q),L=C.length-D;let rows=sets.map(({k,T},i)=>{let U=ucap(C,q,T),floor=minCount(L,i);return {k,U,floor,gap:Math.min(...floor.filter(x=>x!==null))-U}});return {q,D,L,rows,best:rows.reduce((a,b)=>a.gap>b.gap?a:b)}}
const pages=gp.pages??gp,get=n=>pages.find(p=>p.page===n||p.number===n||p.id===n).indices,chapter=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],original=[];
for(let [a,b] of [...chapter,[0,55]]){let C=[];for(let i=a;i<=b;i++)if(i!==50)C.push(...get(i));for(let trim of(a===54?[0,9]:[0])){let X=C.slice(trim);original.push({a,b,trim,n:X.length,rows:Array.from({length:64},(_,i)=>evaluate(X,i+1))})}}
let seed=0x95aa14c1;const ri=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)},supp=1-.664/3.448;
function en(P,K){let C=[],d=0;for(let p of P)while(true){let i=C.length,c=m(p+K[i%K.length]);if(i&&c===C[i-1]&&ri(1e6)/1e6<supp){let z=ri(28);if(z>=c)z++;C.push(z);d++}else{C.push(c);break}}return {C,d}}
const controls=[];for(let i=0;i<60;i++){let q=[8,13,29][i%3],L=i<30?300:720,at=ri(donors[2].length-L),P=donors[2].slice(at,at+L),K=Array.from({length:q},()=>ri(29)),{C,d}=en(P,K),x=evaluate(C,q);if(x.D<d||x.rows.some((r,j)=>r.U<P.filter(p=>sets[j].T.includes(p)).length))throw Error("capacity violation");controls.push({q,L,n:C.length,d,D:x.D,best:x.best})}
return {sets:sets.map(x=>({k:x.k,runes:x.T.map(i=>S[i]),ids:x.T})),original,controls};
};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
