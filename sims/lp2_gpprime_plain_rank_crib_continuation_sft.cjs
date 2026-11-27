'use strict';
const fs=require('node:fs');
/** Exact lexical inverse of the GP-prime plaintext-driven rank insertion model. */
function experiment(inputs){
const g=JSON.parse(inputs[0]),alpha=new Map(g.translit.map((x,i)=>[x,i])),glyph=new Map(g.runes.map((x,i)=>[x,i])),R=g.prime.map(x=>(x-1)%29);
function words(s){let out=[];for(const raw of s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]){const w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,""),p=[];for(let i=0;i<w.length;){let found=false;for(const n of [3,2,1]){const a=w.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?21:undefined):a==="IO"?27:alpha.get(a);if(v!==undefined){p.push(v);i+=n;found=true;break}}if(!found)throw Error("unknown token")}if(p.length&&p.length<19)out.push(p)}return out}
const dict=new Map(),key=w=>String.fromCharCode(...w.map(x=>65+x));function add(w,f){let k=key(w);dict.set(k,{w,f:(dict.get(k)?.f||0)+f})}
for(const w of inputs.slice(2,9).flatMap(words))add(w,1);
for(const l of inputs[9].split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)for(const w of words(m[1]))add(w,+m[2])}
function tries(reverse){const roots=Array.from({length:19},()=>({e:[],m:Array(29).fill(null),f:0}));for(const {w,f} of dict.values()){let a=roots[w.length];for(const p of reverse?w.slice().reverse():w){if(!a.m[p]){let b={e:[],m:Array(29).fill(null),f:0};a.m[p]=b;a.e.push([p,b])}a=a.m[p];a.f+=f}}function order(a){a.e.sort((x,y)=>y[1].f-x[1].f);for(const [p,b] of a.e)order(b)}for(const a of roots)order(a);return roots}
const T=[tries(false),tries(true)],src=(inputs[1].replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/gu)||[]).slice(0,2896).map(w=>Array.from(w,x=>glyph.get(x)));if(String(src.flat())!==String(g.pages.slice(0,56).flatMap(p=>p.indices)))throw Error("source");
let seed=3301;const rng=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};const perm=()=>{let a=Array.from({length:29},(_,i)=>i);for(let i=28;i;i--){let j=rng(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const chart=(a,b)=>Array.from({length:29},(_,p)=>(a*p+b)%29);
function encode(P,S,A,hold){A=A.slice();return P.map(p=>{if(hold&&p===0)return 0;let j=S[p],c=A[j];A.splice(j,1);A.splice(R[p],0,c);return c})}
function search(C,lens,S,hold,rev,cap,truth,first=true){
const forwardTruth=truth;if(rev){C=C.slice().reverse();lens=lens.slice().reverse();if(truth)truth=truth.slice().reverse()}
const roots=T[+rev],A=Array(29).fill(-1),P=Array(C.length),inv=Array(29);S.forEach((j,p)=>inv[j]=p);
let nodes=0,complete=0,deep=0,capped=false,truthHit=false,best=null,bestScore=-Infinity;
const breaks=new Int16Array(C.length+1);let k=0;for(const L of lens){breaks[k]=L;k+=L}if(k!==C.length)throw Error("length");
function stop(){return capped||(first&&complete>0)}
function walk(i,node,score){if(++nodes>cap){capped=true;return}deep=Math.max(deep,i);if(i===C.length){complete++;if(score>bestScore){bestScore=score;best=P.slice()}if(truth&&P.every((p,j)=>p===truth[j]))truthHit=true;return}
if(breaks[i])node=roots[breaks[i]];
const c=C[i],seen=A.indexOf(c);
function take(p,child,from,to){P[i]=p;let end=i+1===C.length||breaks[i+1]>0;let q=score+(end?Math.log(child.f):0);if(from<0){walk(i+1,child,q);return}
let v=A[from];A.splice(from,1);A.splice(to,0,c);walk(i+1,child,q);A.splice(to,1);A.splice(from,0,v);
}
if(hold&&c===0){let child=node.m[0];if(child)take(0,child,-1,-1);if(stop())return}
if(!rev&&seen>=0){let p=inv[seen],child=node.m[p];if(child&&(!hold||p!==0))take(p,child,seen,R[p]);return}
for(const [p,child] of node.e){if(hold&&p===0)continue;const from=rev?R[p]:S[p],to=rev?S[p]:R[p];if(seen>=0?from!==seen:A[from]>=0)continue;take(p,child,from,to);if(stop())return}
}
walk(0,null,0);
if(rev&&best)best.reverse();
return {n:C.length,nodes,deep,capped,complete,truthHit,bestAccuracy:forwardTruth&&best?forwardTruth.reduce((s,p,i)=>s+(p===best[i]),0):null,best:best?best.map(p=>g.translit[p]).join(""):null,bestScore:Number.isFinite(bestScore)?bestScore:null};
}

const FULL=(1<<29)-1,low=Array.from({length:30},(_,i)=>(1<<i)-1),bit=Array.from({length:29},(_,i)=>1<<i),lo=m=>31-Math.clz32(m&-m),hi=m=>31-Math.clz32(m);
const pc=m=>{let s=0;while(m){m&=m-1;s++}return s};
function prop(a){let prev=-1;for(;;){let s=0,u=0;for(let x of a){if(!x)return false;u|=x;if((x&(x-1))===0){if(s&x)return false;s|=x}}if(u!==FULL)return false;if(s===prev)return true;prev=s;for(let k=0;k<29;k++)if(a[k]&(a[k]-1))a[k]&=~s}}
function step(D,B,c,p,hold,rev){
if(hold&&p===0)return c===0?[D,B]:null;
let m=rev?B[p]:D[c]&B[p],r=R[p];if(!m||rev&&!(D[c]&bit[r]))return null;
let b=B.slice(),d=D.slice();
if(!rev){b[p]=m;if(!prop(b))return null;m=b[p];}
const l=lo(m),h=hi(m);
for(let g=0;g<29;g++)if(g!==c){let x=d[g];if(!rev){x=((x&~low[l+1])>>>1)|(x&low[h]);x=(x&low[r])|((x&~low[r])<<1)}else{x=((x&~low[r+1])>>>1)|(x&low[r]);x=(x&low[h])|((x&~low[l])<<1)}d[g]=x}
d[c]=rev?m:bit[r];if(!prop(d))return null;
if(rev){b[p]&=d[c];if(!prop(b))return null}
return [d,b]
}
function replay(C,P,B,hold,rev){let d=new Array(29).fill(FULL),b=B;for(let i=0;i<P.length;i++){let z=step(d,b,C[i],P[i],hold,rev);if(!z)return null;[d,b]=z}return [d,b]}
function fix(C,P,B,hold){let cr=C.slice().reverse(),pr=P.slice().reverse(),b=B;for(let k=0;k<30;k++){let prev=b.join();let z=replay(C,P,b,hold,false);if(!z)return null;z=replay(cr,pr,z[1],hold,true);if(!z)return null;b=z[1];if(b.join()===prev)break}return b}
function prefixList(C,P,B,hold){let A=Array(29).fill(-1);for(let i=0;i<P.length;i++){const p=P[i],c=C[i];if(hold&&p===0){if(c!==0)return null;continue}if(pc(B[p])!==1)throw Error("prefix chart");let j=lo(B[p]),k=A.indexOf(c);if(k>=0?k!==j:A[j]>=0)return null;A.splice(j,1);A.splice(R[p],0,c)}return A}
function solve(C,P,hold,cap){let nodes=0,capped=false;const active=[...new Set(P.filter(p=>!hold||p!==0))],solutions=[];
function rec(B){if(++nodes>cap){capped=true;return}let b=fix(C,P,B,hold);if(!b)return;let idx=-1,n=30;for(let p of active){let k=pc(b[p]);if(k>1&&k<n){n=k;idx=p}}
if(idx<0){let A=prefixList(C,P,b,hold);if(A)solutions.push({B:b,A});return}
for(let m=b[idx];m;m&=m-1){let z=b.slice();z[idx]=m&-m;rec(z);if(capped)return}}
rec(new Array(29).fill(FULL));return {nodes,capped,solutions,active:active.length}}
function continuation(C,lens,initial,hold,cap,truth,S){
const breaks=new Int32Array(C.length+1);let k=0;for(let l of lens){breaks[k]=l;k+=l}if(k!==C.length)throw Error("lens");
const P=new Array(C.length),texts=new Set();let nodes=0,deep=0,capped=false,paths=0,truthHit=false,truthKeyHit=false,best=null,bestScore=-Infinity;
for(const sol of initial){let A=sol.A.slice(),B=sol.B.slice();
function walk(i,node,score){if(++nodes>cap){capped=true;return}deep=Math.max(deep,i);if(i===C.length){paths++;texts.add(key(P));let t=P.every((p,j)=>p===truth[j]);truthHit||=t;truthKeyHit||=t&&S.every((j,p)=>B[p]&bit[j]);if(score>bestScore){bestScore=score;best=P.slice()}return}
if(breaks[i])node=T[0][breaks[i]];
const c=C[i],seen=A.indexOf(c);
for(const [p,ch] of node.e){
let q=score+((i+1===C.length||breaks[i+1])?Math.log(ch.f):0);P[i]=p;
if(hold&&p===0){if(c===0)walk(i+1,ch,q);if(capped)return;continue}
let poss=B[p];if(seen>=0)poss&=bit[seen];else for(let r=0;r<29;r++)if(A[r]>=0)poss&=~bit[r];
for(let m=poss;m;m&=m-1){let j=lo(m&-m),b0=B,v=A[j];if(pc(B[p])>1){B=B.slice();B[p]=bit[j];if(!prop(B)){B=b0;continue}}A.splice(j,1);A.splice(R[p],0,c);walk(i+1,ch,q);A.splice(R[p],1);A.splice(j,0,v);B=b0;if(capped)return}
}}
walk(0,null,0);if(capped)break}
return {nodes,deep,capped,paths,texts:texts.size,truthHit,truthKeyHit,bestAccuracy:best?best.reduce((s,p,i)=>s+(p===truth[i]),0):null,bestScore:Number.isFinite(bestScore)?bestScore:null}}
const donor=words(inputs[4]),out=[];
for(let hold of [false,true]){let start=1500+1000*+hold,pre=[],held=[],n=0,k=start;while(n<180){let w=donor[k++];pre.push(w);n+=w.length}n=0;while(n<240){let w=donor[k++];held.push(w);n+=w.length}
let P=pre.flat(),Q=held.flat(),S=perm(),A=perm(),C=encode(P.concat(Q),S,A,hold),c=C.slice(0,P.length),d=C.slice(P.length),b=fix(c,P,new Array(29).fill(FULL),hold);if(!b||S.some((v,k)=>!(b[k]&bit[v])))throw Error("lost plant");let z=solve(c,P,hold,10000);if(!z.solutions.some(({B})=>S.every((v,k)=>B[k]&bit[v])))throw Error("prefix truth lost");let h=continuation(d,held.map(w=>w.length),z.solutions,hold,2000000,Q,S);out.push({hold,start,prefix:P.length,held:Q.length,domainSingletons:b.filter(x=>pc(x)===1).length,chartNodes:z.nodes,chartCapped:z.capped,prefixCharts:z.solutions.length,active:z.active,heldResult:h})}
return {forms:dict.size,out}
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(f,'utf8'))),null,2));
