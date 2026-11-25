"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function test(corpus,ink){
 const marks={10:29,13:30,23:31},E={A:[],B:[],C:[]};
 for(const p of corpus.pages){const ip=ink.pages.find(x=>x.page===p.page),red=new Set(),ms=ip?.large_punctuation||[];let k=0;
 for(const s of ip?.red_spans||[])for(let j=s.start;j<s.start+s.length;j++)red.add(j);
 for(let i=0;i<=p.indices.length;i++){while(k<ms.length&&ms[k][0]===i){const m=ms[k++],c=marks[m[1]];if(m[1]===13)E.A.push(c);if((m[1]===13||m[1]===23)&&m[2]==="red")E.B.push(c);if(p.page<56)E.C.push(c)}if(i<p.indices.length&&red.has(i))for(const a of Object.values(E))a.push(p.indices[i])}}
 E.terminal=corpus.pages.slice(54,56).flatMap(p=>p.indices);
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:?!'\"-/()_@\t\n\r";
 const allowed=[...new Set([...alphabet].map(x=>x.charCodeAt(0)))];
 const bits=0xffffffff>>>0;
 const pop=x=>{let n=0;for(x>>>=0;x;x=(x&(x-1))>>>0)n++;return n};
 const vals=x=>{const a=[];for(let i=0;i<32;i++)if((x>>>i)&1)a.push(i);return a};
 const mask=(m,v)=>{let a=0;for(let i=0;i<32;i++)if((i&m)===v)a=(a|(1<<i))>>>0;return a};
 function solve(a,phase,plant){
   const types=[...new Set(a)],n=types.length,idx=new Map(types.map((x,i)=>[x,i])),cs=[];
   for(let b=phase;b+7<=a.length*5;b+=7){
      const ids=[...new Set(Array.from({length:7},(_,j)=>idx.get(a[Math.floor((b+j)/5)])))];
      const patterns=[];
      for(const ch of allowed){
        let ok=true;const m=ids.map(()=>0),v=ids.map(()=>0);
        for(let j=0;j<7;j++){
          const i=ids.indexOf(idx.get(a[Math.floor((b+j)/5)])),k=1<<(4-(b+j)%5),w=(ch>>(6-j))&1;
          if(m[i]&k){if(Number(Boolean(v[i]&k))!==w){ok=false;break}}
          m[i]|=k;if(w)v[i]|=k;
        }
        if(ok)patterns.push(ids.map((_,i)=>mask(m[i],v[i])));
      }
      cs.push({ids,patterns});
   }
   function match(d){let m=Array(32).fill(-1);function visit(i,seen){for(const c of vals(d[i]))if(!seen[c]){seen[c]=1;if(m[c]<0||visit(m[c],seen)){m[c]=i;return true}}return false}
      for(let i=0;i<n;i++)if(!visit(i,new Uint8Array(32)))return false;return true}
   function propagate(d){
     let changed=true;
     while(changed){changed=false;let used=0;
       for(const q of d){if(!q)return false;if(pop(q)===1){if(used&q)return false;used=(used|q)>>>0}}
       for(let i=0;i<n;i++)if(pop(d[i])>1){let q=(d[i]&~used)>>>0;if(!q)return false;if(q!==d[i]){d[i]=q;changed=true}}
       for(const {ids,patterns} of cs){
         let s=ids.map(()=>0);
         for(const p of patterns){if(ids.every((id,j)=>d[id]&p[j]))for(let j=0;j<ids.length;j++)s[j]=(s[j]|p[j])>>>0}
         for(let j=0;j<ids.length;j++){const id=ids[j],q=(d[id]&s[j])>>>0;if(!q)return false;if(q!==d[id]){d[id]=q;changed=true}}
       }
     }
     return match(d);
   }
   const init=Array(n).fill(bits),feasible=propagate(init);let nodes=0,cap=false,witness=null;
   if(plant){if(!feasible||types.some((t,i)=>!(init[i]&(1<<plant(t)))))throw Error("true plant excluded")}
   function dfs(d){
     if(++nodes>1000){cap=true;return}if(!propagate(d))return;
     let i=-1,k=33;for(let j=0;j<n;j++){let x=pop(d[j]);if(x>1&&x<k){k=x;i=j}}
     if(i<0){
       let out="";for(let b=phase;b+7<=a.length*5;b+=7){let c=0;for(let j=0;j<7;j++)c=2*c+((vals(d[idx.get(a[Math.floor((b+j)/5)])])[0]>>(4-(b+j)%5))&1);if(!allowed.includes(c))throw Error("invalid witness");out+=String.fromCharCode(c)}
       witness=out;return;
     }
     for(const c of vals(d[i])){const q=d.slice();q[i]=(1<<c)>>>0;dfs(q);if(cap||witness)return}
   }
   if(feasible&&!plant)dfs(init.slice());
   return {phase,feasible,nodes,cap,witness,domains:feasible?init.map(pop):null};
 }
 const result={};
 for(const [key,a] of Object.entries(E)){
   const cases=[];
   for(const [dir,t] of [["forward",a],["reverse",a.slice().reverse()]])for(let phase=0;phase<7;phase++)cases.push({dir,...solve(t,phase)});
   result[key]=cases;
 }
 const plain=corpus.pages[57].indices.map(x=>corpus.translit[x]).join("").slice(0,100);
 const bitstream=[...plain].flatMap(c=>Array.from({length:7},(_,i)=>(c.charCodeAt(0)>>(6-i))&1));
 const a=[];for(let i=0;i<bitstream.length;i+=5){let v=0;for(let j=0;j<5;j++)v=2*v+bitstream[i+j];a.push((13*v+7)%32)}
 const control=solve(a,0,x=>(5*(x-7)+320)%32);
 return {alphabet,result,control};
}
console.log(JSON.stringify(test(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-ink-annotations.json")),null,2));
