"use strict";
const fs=require("node:fs");
function experiment(c,lit){
 const pages=c.pages.slice(0,56).map(x=>x.indices),FULL=(1<<29)-1,sh=[],id=Array.from({length:29},(_,i)=>i),mod=x=>(x%29+29)%29;
 for(let x=2;sh.length<6500;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)sh.push((x-1)%29)}
 const pop=x=>{let n=0;for(;x;x&=x-1)n++;return n};
 function match(d){let M=new Int8Array(29).fill(-1);function aug(i,S){for(let x=d[i];x;x&=x-1){let k=31-Math.clz32(x&-x);if(S[k])continue;S[k]=1;if(M[k]<0||aug(M[k],S)){M[k]=i;return true}}return false}let k=0;for(let i=0;i<29;i++)if(aug(i,new Uint8Array(29)))k++;return k}
 function legal(p,J,origin){let states=new Set([0]);for(let i=0;i<p.length;i++){let next=new Set;for(let h of states){if(p[i]===0)next.add(h+1);if(J[p[i]]!==sh[origin+i-h])next.add(h)}states=next;if(!states.size)return false}return true}
 function solve(pages,origin,cap=20000,truth=null){
  const D=new Int32Array(29).fill(FULL),scopes=[];let prefix=0,edges=0;for(const p of pages){let z=p.indexOf(0);if(z<0)z=p.length;prefix+=z;for(let i=0;i<z;i++)D[p[i]]&=~(1<<sh[origin+i])}
  const initialSizes=Array.from(D,pop),initialMatching=match(D);if(initialMatching<29)return{origin,prefix,initialSizes,initialMatching,found:false,exhausted:false,nodes:0,fail:{initial:1}};
  for(const p of pages){const zs=[];for(let i=0;i<p.length;i++)if(p[i]===0)zs.push(i);if(!zs.length)continue;let layers=[];for(let t=0;t<zs.length;t++){let E=[],a=zs[t],b=zs[t+1]??p.length;for(let h=0;h<=t;h++)for(let hold=0;hold<=1;hold++){let f=new Int32Array(29);for(let i=a+hold;i<b;i++)f[p[i]]|=1<<sh[origin+i-h-hold];let pairs=[];for(let j=0;j<29;j++)if(f[j])pairs.push(j,f[j]);E.push({h,k:h+hold,pairs,f});edges++}layers.push(E)}scopes.push(layers)}
  let nodes=0,iterations=0,fail={empty:0,match:0,path:0,row:0},solution=null,rootSizes=null,rootTrace=[],rootDomains=null;
  function propagation(d,depth){
   for(;;){iterations++;let changed=false,singles=0;for(let i=0;i<29;i++){let x=d[i];if(!x){fail.empty++;return false}if(!(x&(x-1))){if(singles&x){fail.match++;return false}singles|=x}}for(let i=0;i<29;i++)if(d[i]&(d[i]-1)){let x=d[i]&~singles;if(x!==d[i]){d[i]=x;changed=true;if(!x){fail.empty++;return false}}}
    let mm=match(d);if(depth===0)rootTrace.push({iteration:iterations,matching:mm,sizes:Array.from(d,pop)});if(mm<29){fail.match++;return false}
    for(const layers of scopes){
     const allowed=[];let reach=new Uint8Array(layers.length+1);reach[0]=1;
     for(let t=0;t<layers.length;t++){let a=[],next=new Uint8Array(layers.length+1);for(const e of layers[t]){if(!reach[e.h])continue;let ok=true;for(let i=0;i<e.pairs.length;i+=2)if(!(d[e.pairs[i]]&~e.pairs[i+1])){ok=false;break}if(ok){a.push(e);next[e.k]=1}}if(!a.length){fail.path++;return false}allowed.push(a);reach=next}
     for(let t=allowed.length-1;t>=0;t--){let a=[],prev=new Uint8Array(layers.length+1);for(const e of allowed[t])if(reach[e.k]){a.push(e);prev[e.h]=1}allowed[t]=a;reach=prev}
     for(let row=0;row<29;row++){if(!(d[row]&(d[row]-1)))continue;let v=new Int32Array(layers.length+1);v[0]=d[row];for(const a of allowed){let next=new Int32Array(layers.length+1);for(const e of a)next[e.k]|=v[e.h]&~e.f[row];v=next}let u=0;for(const x of v)u|=x;let x=d[row]&u;if(!x){fail.row++;return false}if(x!==d[row]){d[row]=x;changed=true}}
    }
    if(truth&&depth===0&&truth.some((v,i)=>!(d[i]&(1<<v))))throw Error("planted value removed");
    if(!changed)return true;
   }
  }
  let exhausted=false;
  function dfs(d,depth){if(nodes>=cap){exhausted=true;return false}nodes++;if(!propagation(d,depth))return false;if(depth===0){rootSizes=Array.from(d,pop);rootDomains=Array.from(d)}let row=-1,best=30;for(let i=0;i<29;i++){let n=pop(d[i]);if(n>1&&n<best){best=n;row=i}}if(row<0){solution=Array.from(d,x=>31-Math.clz32(x));if(!pages.every(p=>legal(p,solution,origin)))throw Error("invalid solution");return true}for(let x=d[row];x;x&=x-1){let a=d.slice();a[row]=x&-x;if(dfs(a,depth+1))return true;if(exhausted)return false}return false}
  let found=dfs(D,0);return{origin,prefix,edges,initialSizes,initialMatching,rootSizes,rootDomains,rootTrace,nodes,iterations,fail,found,exhausted,solution};
 }
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>pages.slice(a,b+1).flat());
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),P=[];for(const w of lit.toUpperCase().match(/[A-Z]+/g)||[]){const t=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<t.length;){if(t.startsWith("ING",i)){P.push(21);i+=3}else if(t.startsWith("IO",i)){P.push(27);i+=2}else{let z=tokens.find(x=>t.startsWith(x.s,i));if(!z){i++;continue}P.push(z.i);i+=z.s.length}}if(P.length>=15000)break}
 function perm(seed){let x=seed>>>0,A=id.slice();for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[A[i],A[j]]=[A[j],A[i]]}return A}
 function plant(scopes,seed,origin){let S=perm(seed),m=S[0],J=perm(seed^0x3301).map(z=>mod(z-m)),T=id.map(z=>J.indexOf(z)),off=0;S=S.map(z=>mod(z-m));let C=scopes.map(p=>{let A=P.slice(off,off+p.length);off+=p.length;let j=origin;return A.map(x=>x===0?0:T[mod(S[x]+sh[j++])])});if(!C.every(p=>legal(p,J,origin)))throw Error("plant");return {C,J}}
 let p=plant(pages,0x70113301,0),q=plant(pages,0x5ab13301,37);
 const controls=[{truth:p.J,...solve(p.C,0,1000,p.J)},{truth:q.J,...solve(q.C,37,1000,q.J)}];
 const page=solve(pages,0,20000),chapter=solve(chapters,0,200);
 return {method:"exact outer alphabet CSP, zero-free prefixes, segmented clock DAG, per-row path support plus all-different matching; full witness independently replayed",page,chapter,controls};
}
const c=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const lit=fs.readFileSync("resources/control/shakespeare_first300k.txt","utf8");
console.log(JSON.stringify(experiment(c,lit),null,2));
