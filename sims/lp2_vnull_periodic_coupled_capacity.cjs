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

function floorAffine(L0,L1,k,w){return prefix.map(a=>{let x=a[k];if(x.length<=L0)return null;let deq=new Int32Array(x.length),h=0,t=0,v=Infinity;for(let i=L0;i<x.length;i++){let j=i-L0,z=100*x[j]-w*j;while(t>h&&100*x[deq[t-1]]-w*deq[t-1]<=z)t--;deq[t++]=j;while(h<t&&deq[h]<i-L1)h++;v=Math.min(v,100*x[i]-w*i-(100*x[deq[h]]-w*deq[h]))}return v})}
function coupled(C,q,T,w){const set=new Set(T),F=Array.from({length:q},()=>new Int32Array(841)),U=Array.from({length:q},()=>new Int32Array(29));for(let i=0;i<C.length;i++)for(let a=0;a<29;a++)if(set.has(m(C[i]-a)))U[i%q][a]+=100;
for(let i=1;i+1<C.length;i++){if(C[i]===C[i-1])continue;let d1=m(C[i]-C[i-1]),d2=m(C[i+1]-C[i-1]),f=F[i%q];for(let a=0;a<29;a++)if(!set.has(m(C[i]-a))){f[a*29+m(a+d1)]+=w;if(d1!==d2)f[a*29+m(a+d2)]+=w}}
for(let j=0;j<q;j++)for(let a=0;a<29;a++)for(let b=0;b<29;b++)F[j][a*29+b]+=U[j][a];
let best=-Infinity;for(let a0=0;a0<29;a0++){let v=new Float64Array(29);v.fill(-Infinity);v[a0]=0;for(let j=0;j<q-1;j++){let n=new Float64Array(29);n.fill(-Infinity);for(let a=0;a<29;a++)for(let b=0;b<29;b++)n[b]=Math.max(n[b],v[a]+F[j][a*29+b]);v=n}for(let a=0;a<29;a++)best=Math.max(best,v[a]+F[q-1][a*29+a0])}return best}
function test(C,q){let D=dcap(C,q),L0=C.length-D,rows=[];for(let k=0;k<sets.length;k++){const {T}=sets[k],frac=T.reduce((s,i)=>s+freq[i],0)/freq.reduce((a,b)=>a+b,0),w=Math.round(frac*100);let floor=floorAffine(L0,C.length,k,w),cap=coupled(C,q,T,w),threshold=w*C.length+Math.min(...floor.filter(x=>x!==null));rows.push({k:sets[k].k,w,floor,cap,threshold,gap:threshold-cap})}return {q,D,L0,rows,best:rows.reduce((a,b)=>a.gap>b.gap?a:b)}}
const pages=gp.pages??gp,get=n=>pages.find(p=>p.page===n||p.number===n||p.id===n).indices,C=get(54).concat(get(55)),original=[];
for(let trim of [0,9]){let X=C.slice(trim);original.push({trim,n:X.length,rows:Array.from({length:29},(_,i)=>test(X,i+1))})}
let seed=0x12bb391a;function ri(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}const supp=1-.664/3.448;
function en(P,K){let C=[],d=0;for(let p of P)while(true){let i=C.length,c=m(p+K[i%K.length]);if(i&&c===C[i-1]&&ri(1e6)/1e6<supp){let z=ri(28);if(z>=c)z++;C.push(z);d++}else{C.push(c);break}}return {C,d}}
const controls=[];for(let i=0;i<30;i++){let q=[8,13,29][i%3],L=299+(i%2)*9,at=ri(donors[2].length-L),P=donors[2].slice(at,at+L),K=Array.from({length:q},()=>ri(29)),{C,d}=en(P,K),x=test(C,q);if(x.best.gap>0||x.D<d)throw Error("coupled capacity false exclusion");for(let j=0;j<sets.length;j++){let row=x.rows[j],count=P.filter(p=>sets[j].T.includes(p)).length;if(100*count+row.w*d>row.cap)throw Error("coupled bound violated")}controls.push({q,L,d,best:x.best})}
return {original,controls,definition:"exact coupled key-cycle max of 100 U + w potential non-T deletions; finite donor affine envelope over all L between n-D and n"};

};
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
