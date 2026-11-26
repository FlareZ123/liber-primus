"use strict";
function run(corpus,gold){
const mod=x=>(x%29+29)%29, FULL=(1<<29)-1;
const inside=Array.from({length:121},(_,i)=>i%11>0&&i%11<10&&Math.floor(i/11)>0&&Math.floor(i/11)<10);
const idx=inside.flatMap((x,i)=>x?[i]:[]), remain=Array.from({length:122},(_,i)=>idx.filter(j=>j>=i).length);
function solve(A,B,qa,qb,cap=30000000,truth=null){
 const n=qa+qb, par=Array.from({length:n},(_,i)=>i),w=Array(n).fill(0),sz=Array(n).fill(1),mask=Array(n).fill(FULL),log=[];
 function find(x){let d=0;while(par[x]!==x){d+=w[x];x=par[x]}return [x,mod(d)]}
 function restrict(r,m){if(m!==mask[r]){log.push([0,r,mask[r]]);mask[r]=m}return m!==0}
 function forbid(a,c){const [r,d]=find(a);return restrict(r,mask[r]&~(1<<mod(c-d)))}
 function rot(m,z){return ((m>>>z)|(m<<(29-z)))&FULL}
 function join(a,b,d){let [x,u]=find(a),[y,v]=find(b);if(x===y)return mod(u-v)===d;let z=mod(d-u+v);if(sz[x]>sz[y]){[x,y]=[y,x];z=mod(-z)}const m=mask[y]&rot(mask[x],z);if(!m)return false;log.push([1,x,y,sz[y]]);par[x]=y;w[x]=z;sz[y]+=sz[x];return restrict(y,m)}
 function undo(k){while(log.length>k){const [t,x,y,s]=log.pop();if(t===0)mask[x]=y;else{par[x]=x;w[x]=0;sz[y]=s}}}
 const path=[];let nodes=0,leaves=0,valid=0,stopped=false,truthFound=false,examples=[],totalKeys=0n;const alignments=new Set();
 function leaf(){leaves++;let count=1n;for(let i=0;i<n;i++)if(par[i]===i){let x=mask[i],k=0;while(x){x&=x-1;k++}count*=BigInt(k)}totalKeys+=count;valid++;
 const k=Array.from({length:n},(_,i)=>{const [r,d]=find(i);return mod(d+31-Math.clz32(mask[r]&-mask[r]))});
 const ha=new Set(),hb=new Set();for(const e of path)if(e.hold){ha.add(e.i);if(e.j>=0)hb.add(e.j)}
 const dec=(C,offset,q,held)=>{let p=0;return C.map((c,i)=>held.has(i)?0:mod(c-k[offset+(p++%q)]))};
 const pa=dec(A,0,qa,ha),pb=dec(B,qa,qb,hb),matched=path.filter(e=>e.j>=0),keep=matched.map(e=>e.i);
 if(pa.some((p,i)=>p===0&&!ha.has(i))||pb.some((p,i)=>p===0&&!hb.has(i))||matched.some(e=>pa[e.i]!==pb[e.j]))throw Error("plaintext constraints");
 const enc=(P,offset,q)=>{let p=0;return P.map(x=>x===0?0:mod(x+k[offset+(p++%q)]))};
 if(enc(pa,0,qa).some((x,i)=>x!==A[i])||enc(pb,qa,qb).some((x,i)=>x!==B[i]))throw Error("replay");
 alignments.add(keep.join(","));
 if(truth&&keep.every((v,j)=>v===truth.keep[j])&&pa.every((x,i)=>ha.has(i)===(truth.P[i]===0))){const key=truth.K.concat(truth.J);if(key.every((v,i)=>{const [r,d]=find(i);return mod(v-key[r])===d&&!!(mask[r]&(1<<key[r]))}))truthFound=true;}
 if(examples.length<3)examples.push({keep,holdA:[...ha],holdB:[...hb],keys:k,rootAssignments:String(count),plaintextB:pb});
 }
 function dfs(i,j,ta,tb){if(stopped)return;if(++nodes>cap){stopped=true;return}if(B.length-j>remain[i]||j>B.length)return;if(i===121){if(j===B.length)leaf();return}
 const skip=()=>{const s=log.length;if(forbid(ta%qa,A[i])){path.push({i,j:-1,hold:false});dfs(i+1,j,ta+1,tb);path.pop()}undo(s);if(A[i]===0){path.push({i,j:-1,hold:true});dfs(i+1,j,ta,tb);path.pop()}};
 if(!inside[i]){skip();return}
 if(j<B.length){const a=ta%qa,b=qa+tb%qb,s=log.length;if(join(a,b,mod(A[i]-B[j]))&&forbid(a,A[i])&&forbid(b,B[j])){path.push({i,j,hold:false});dfs(i+1,j+1,ta+1,tb+1);path.pop()}undo(s);
 if(A[i]===0&&B[j]===0){path.push({i,j,hold:true});dfs(i+1,j+1,ta,tb);path.pop()}}
 if(remain[i]>B.length-j)skip();
 }
 dfs(0,0,0,0);return {qa,qb,length:B.length,nodes,leaves,valid,distinctAlignments:alignments.size,totalKeyPathPairs:String(totalKeys),stopped,truthFound,examples}
}
const A=corpus.pages.find(x=>x.page===32).indices,B=corpus.pages.find(x=>x.page===55).indices;
let seed=0x29b55a;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
const names=["0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity"],controls=[];
for(const [qa,qb] of [[8,13],[13,8]])for(const name of names){const P=[...gold.sections.find(s=>s.name===name).source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)).slice(0,121);const keep=idx.slice(),D=name==="0_wisdom"||name==="0_loss_of_divinity"?6:5;for(let d=0;d<D;d++)keep.splice(rnd(keep.length),1);const Q=keep.map(i=>P[i]),K=Array.from({length:qa},()=>rnd(29)),J=Array.from({length:qb},()=>rnd(29));const t=keep.findIndex(i=>P[i]!==0),i=keep[t];K[P.slice(0,i).filter(x=>x!==0).length%qa]=mod(-P[i]);J[Q.slice(0,t).filter(x=>x!==0).length%qb]=mod(-Q[t]);const enc=(p,k)=>{let t=0;return p.map(x=>x===0?0:mod(x+k[t++%k.length]))};const result=solve(enc(P,K),enc(Q,J),qa,qb,30000000,{P,keep,K,J});controls.push({name,...result});}
return {controls,original:[[8,13],[13,8]].flatMap(([a,b])=>[solve(A,B,a,b),solve(A,B.slice(1),a,b)])};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={run};
