"use strict";
// Agent41. Conditional WILL/PATHS source crib constraints on F-held
// plaintext-predecessor permutation. Necessary deterministic segments only.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=gp.pages,all=(1<<29)-1,mod=x=>(x+29)%29;
const F=[];for(const p of pages.filter(p=>p.page<=55&&p.indices.length)){let end=1;while(end<p.indices.length&&p.indices[end]!==0)end++;F.push({page:p.page,kind:"forward",start:0,d:p.indices.slice(1,end).map((x,i)=>mod(x-p.indices[i]))});}
const fixed=[];for(const [page,offset,P] of [[33,132,[7,10,20,20]],[40,71,[13,24,2,15]]]){const C=pages.find(p=>p.page===page).indices;for(let i=1;i<4;i++){assert(C[offset+i]!==0&&P[i]!==0);fixed.push([P[i-1],mod(P[i]-mod(C[offset+i]-C[offset+i-1]))]);}
let end=offset+4;while(end<C.length&&C[end]!==0)end++;F.push({page,kind:"forward",start:P[3],d:C.slice(offset+4,end).map((x,i)=>mod(x-C[offset+3+i]))});let lo=offset;while(lo>1&&C[lo-1]!==0)lo--;let d=[];for(let i=offset;i>lo;i--)d.push(mod(C[i]-C[i-1]));F.push({page,kind:"backward",start:P[0],d});}
assert.deepEqual(fixed,[[7,27],[10,18],[20,15],[13,13],[24,3],[2,8]]);
const K=new Int8Array(29).fill(-1),I=new Int8Array(29).fill(-1);let used=0,assigned=0;const set=(q,k)=>{K[q]=k;I[k]=q;used|=1<<k;assigned|=1<<q};const unset=(q,k)=>{K[q]=-1;I[k]=-1;used^=1<<k;assigned^=1<<q};for(const [q,k] of fixed)set(q,k);
const N=F.length,dirs=F.map(x=>x.kind==="backward"),D=F.map(x=>x.d);
function search(k0,cap){set(0,k0);let nodes=0,dead=0,depthMax=0,limited=false,witness=null;const start=Date.now();function propagate(pp,qq){for(let i=0;i<N;i++){const d=D[i],back=dirs[i];while(pp[i]<d.length){let q=qq[i],x=back?I[mod(q-d[pp[i]])]:K[q];if(x<0)break;if(!back)x=mod(x+d[pp[i]]);if(!x)return false;qq[i]=x;pp[i]++}}return true;}
function dfs(pos,q,depth){if(++nodes>cap){limited=true;return false}depthMax=Math.max(depthMax,depth);
const cnt=new Uint16Array(58),forbid=new Uint32Array(58);for(let i=0;i<N;i++)if(pos[i]<D[i].length){if(dirs[i]){let k=mod(q[i]-D[i][pos[i]]);cnt[29+k]++;forbid[29+k]|=1;}else{let j=q[i];cnt[j]++;forbid[j]|=1<<mod(-D[i][pos[i]])}}
let best=-1,min=30,options=0;for(let j=0;j<58;j++)if(cnt[j]){let v=(all&~(j<29?used:assigned)&~forbid[j])>>>0;let count=0;for(let z=v;z;z&=z-1)count++;if(!count){dead++;return false}if(count<min||count===min&&cnt[j]>cnt[best]){min=count;best=j;options=v}}
if(best<0){witness=Array.from(K);return true}
for(let z=options;z;z&=z-1){let v=31-Math.clz32(z&-z),qr=best<29?best:v,kr=best<29?v:best-29;set(qr,kr);let pp=pos.slice(),qq=q.slice();let found=propagate(pp,qq)&&dfs(pp,qq,depth+1);unset(qr,kr);if(found)return true;if(limited)return false;}return false;}
const pos=new Uint16Array(N),q=Uint8Array.from(F.map(x=>x.start));let found=propagate(pos,q)&&dfs(pos,q,7);unset(0,k0);return {k0,nodes,dead,depthMax,limited,found,witness,ms:Date.now()-start}}
const initial=Array.from({length:29},(_,k)=>k).filter(k=>F.slice(0,55).every(f=>!f.d.length||mod(k+f.d[0])!==0));assert.deepEqual(initial,[1,10,13,15,23]);
const domains=initial.filter(k=>!(used&(1<<k)));assert.deepEqual(domains,[1,10,23]);
const cap=Number(process.argv[2]||1000000);
console.log(JSON.stringify({fixed,segments:F.slice(-4).map(x=>({...x,d:x.d.length})),runs:domains.map(k=>search(k,cap))},null,2));
// A separate exact local contradiction conditional on READ OUT THE:
const c=pages[28].indices.slice(134,142),p=[4,28,23,3,1,16,2,18];
assert.deepEqual(c,[9,28,24,10,1,20,24,25]);const f=p.slice(0,-1).map((q,i)=>[q,mod(p[i+1]-mod(c[i+1]-c[i]))]);assert.deepEqual(f,[[4,9],[28,27],[23,17],[3,10],[1,26],[16,27],[2,17]]);console.log(JSON.stringify({readOutTheConditionalRows:f}));
