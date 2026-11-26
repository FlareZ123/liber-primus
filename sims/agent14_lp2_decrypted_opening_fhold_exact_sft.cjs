#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
function main(c,{start=0,end=8192,ordinary=true,hold=true}={}){
 const p=c.pages.map(p=>p.indices),body=p[0].slice(14),full=(1<<29)-1,mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 check(body.length===248&&body.filter(x=>x===0).length===13,"root body");
 function hist(c,s){const d=Array(13).fill(full),out=[];function dfs(i,j){if(i===c.length){out.push(d.slice());return;}if(!c[i])dfs(i+1,j);const old=d[j];d[j]&=~(1<<mod(s*c[i]));if(d[j])dfs(i+1,(j+1)%13);d[j]=old;}dfs(0,0);return out;}
 // Cache the reflection+rotation of each permitted key-slot domain.
 const cache=new Map();
 function shift(mask,a){let arr=cache.get(mask);if(!arr){arr=new Int32Array(29);let b=0;for(let k=0;k<29;k++)if(mask&(1<<mod(-k)))b|=1<<k;for(let i=0;i<29;i++)arr[i]=((b<<i)|(b>>>(29-i)))&full;cache.set(mask,arr);}return arr[a];}
 // A root hold mask chooses which of the 13 ciphertext-F events are literal.
 function root(h,hold){const d=Array(13).fill(full),t=[];let j=0,f=0;for(const a of body){const literal=hold&&a===0&&((h>>f)&1);if(a===0)f++;if(literal){t.push([0,-1]);continue;}t.push([a,j]);if(hold)d[j]&=~(1<<a);j=(j+1)%13;}return {d,t};}
 function run(s,hmode,start,end){
  const base=Array.from({length:19},(_,i)=>({page:i+1,boxes:hist(p[i+1],s)}));
  base.sort((a,b)=>a.boxes.length-b.boxes.length);
  let roots=0,nodes=0,tests=0,empty=0,maxDepth=0,answer=null,depth=Array(20).fill(0);
  const tick=Date.now();
  for(let h=start;h<end;h++){
   const {d,t}=root(h,hmode);roots++;if(d.some(m=>!m)){empty++;continue;}
   const ds=base.map(e=>({...e,terms:t.slice(13*(e.page-1),13*e.page),mapped:null}));
   function map(e){
    if(e.mapped)return e.mapped;
    const out=[],seen=new Set();
    for(let j=0;j<e.boxes.length;j++){
     const b=e.boxes[j],m=d.slice();let good=true;
     for(let i=0;i<13;i++){const [a,k]=e.terms[i];if(k===-1){if(!(b[i]&1)){good=false;break;}}else{m[k]&=shift(b[i],a);if(!m[k]){good=false;break;}}}
     if(good){const key=m.join(",");if(!seen.has(key)){seen.add(key);out.push({m,j});}}
    }
    e.mapped=out;return out;
   }
   function dfs(cur,rem,path){
    nodes++;depth[path.length]++;maxDepth=Math.max(maxDepth,path.length);
    if(!rem.length){answer={h,d:cur,path};return true;}
    // Select minimum surviving domain, with early abandon if no option.
    let best=null;
    for(const e of rem){
     const opts=[];
     for(const b of map(e)){tests++;if(cur.every((m,k)=>m&b.m[k]))opts.push(b);}
     if(!opts.length)return false;
     if(!best||opts.length<best.opts.length)best={e,opts};
     if(opts.length===1)break;
    }
    for(const b of best.opts){if(dfs(cur.map((m,k)=>m&b.m[k]),rem.filter(e=>e!==best.e),path.concat([[best.e.page,b.j]])))return true;}
    return false;
   }
   if(dfs(d,ds,[]))break;
  }
  return {s,hmode,start,end,roots,empty,nodes,tests,maxDepth,depth,answer,elapsedMs:Date.now()-tick};
 }
 const results=[];
 if(ordinary)for(const s of [-1,1])results.push(run(s,false,0,1));
 if(hold)for(const s of [-1,1])results.push(run(s,true,start,end));
 return results;
}
const [start="0",end="8192",mode="both"]=process.argv.slice(2);
console.log(JSON.stringify(main(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),{start:Number(start),end:Number(end),ordinary:mode!=="hold",hold:mode!=="ordinary"}),null,2));
