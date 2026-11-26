"use strict";
// Agent1: complete seven-lane arbitrary-deletion inverse; Node 22/CommonJS.
const fs=require("node:fs"),path=require("node:path");
function assert(x,msg="assertion failed"){if(!x)throw Error(msg)}

function divide(x){const r=x.slice(),q=[];for(let i=0;i<x.length-2;i++){const u=r[i]*2%29;q.push(u);for(let k=0;k<3;k++)r[i+k]=(r[i+k]-u*[15,5,27][k]+841)%29}assert(!r.slice(-2).some(Boolean),"remainder");return q}

function split(x){return Array.from({length:7},(_,r)=>x.filter((_,i)=>i%7===r))}

function histogram(x){const n=Array(29).fill(0);for(const y of x)n[y]++;return n.sort((a,b)=>a-b)}

function oriented(x,rev,rot){const y=rev?x.slice().reverse():x;return y.slice(rot).concat(y.slice(0,rot))}

function inverse(s,t){const k=s.length-t.length,forward=new Int8Array(29).fill(-1),backward=new Int8Array(29).fill(-1),kept=[];let nodes=0;function go(i,j){nodes++;if(j===t.length)return kept.slice();if(i>=s.length||i-j>k)return null;const x=s[i],y=t[j];if((forward[x]===-1||forward[x]===y)&&(backward[y]===-1||backward[y]===x)){const fresh=forward[x]===-1;forward[x]=y;backward[y]=x;kept.push(i);const r=go(i+1,j+1);if(r)return r;kept.pop();if(fresh){forward[x]=-1;backward[y]=-1}}if(i-j<k)return go(i+1,j);return null}const witness=go(0,0);return {nodes,witness}}

function valid(s,t,kept){if(!kept||kept.length!==t.length)return false;const f=new Map,b=new Map;for(let j=0;j<kept.length;j++){const i=kept[j],x=s[i],y=t[j];if(i<0||i>=s.length||(j&&kept[j-1]>=i)||(f.has(x)&&f.get(x)!==y)||(b.has(y)&&b.get(y)!==x))return false;f.set(x,y);b.set(y,x)}return true}

function search(s,t){let total=0,nodes=0,pairs=[];for(let i=0;i<7;i++)for(let j=0;j<7;j++){const x=s[i],y=t[j],a=histogram(x),b=histogram(y),k=x.length-y.length;if(k<0||a.some((v,k)=>v<b[k]))continue;let edges=[];for(let rev=0;rev<2;rev++)for(let rot=0;rot<y.length;rot++){total++;const z=oriented(y,rev,rot),r=inverse(x,z);nodes+=r.nodes;if(r.witness){assert(valid(x,z,r.witness),"invalid inverse witness");edges.push({rev,rot,kept:r.witness})}}pairs.push({i,j,k,edges:edges.length,example:edges[0]})}const compat=pairs.filter(x=>x.edges);function match(i,used,arr){if(i===7)return arr;for(const e of compat.filter(e=>e.i===i&&!(used&(1<<e.j)))){const r=match(i+1,used|(1<<e.j),arr.concat(e));if(r)return r}return null}return {possibleCases:14*t.reduce((z,y)=>z+y.length,0),total,nodes,histogramPassing:pairs.length,compatible:compat,matching:match(0,0,[]),sizes:[s.map(x=>x.length),t.map(x=>x.length)]}}

function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}

function shuffle(x,next){const a=x.slice();for(let i=a.length-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}

function plant(t,sizes,seed){const next=rng(seed),permutation=shuffle([0,1,2,3,4,5,6],next),out=[];for(let i=0;i<7;i++){const j=permutation[i],rev=next()%2,rot=next()%t[j].length,z=oriented(t[j],rev,rot),alphabet=shuffle(Array.from({length:29},(_,v)=>v),next),n=sizes[i],del=new Set(shuffle(Array.from({length:n},(_,v)=>v),next).slice(0,n-z.length));let r=0;const s=Array.from({length:n},(_,v)=>del.has(v)?next()%29:alphabet[z[r++]]);assert(r===z.length);out.push(s)}return out}

function experiment(p,t){const results=[];for(const [name,S,T] of [["raw",p,t],["quotient",divide(p),divide(t)]]){const s=split(S),t=split(T),original=search(s,t);assert(original.compatible.length===0);const controls=[];for(let i=0;i<2;i++){const x=plant(t,s.map(a=>a.length),0x712a3f00+i+(name==="raw"?0:100)),r=search(x,t);assert(r.matching&&r.matching.length===7,"positive matching not recovered");controls.push({seed:i,compatiblePairs:r.compatible.length,retained:r.matching.reduce((z,e)=>z+e.example.kept.length,0),matching:r.matching})}results.push({name,original,controls})}return results}
const root=path.resolve(__dirname,".."),read=n=>JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus",n),"utf8"));
const p=read("lp2-corpus.json").pages[29].indices,t=read("lp2-grid-256.json").bytes.map(x=>x%29);
assert(p.length===277&&t.length===256);
console.log(JSON.stringify(experiment(p,t),null,2));
