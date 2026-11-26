"use strict";
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,prior){
 const check=(ok,msg)=>{if(!ok)throw Error(msg)};
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const reverse=s=>[...s].reverse().join("");
 function code(n){const f=[1,2];while(f.at(-1)<n)f.push(f.at(-1)+f.at(-2));const a=Array(f.length).fill(0);for(let j=f.length-1;j>=0;j--)if(f[j]<=n){a[j]=1;n-=f[j]}check(n===0,"remainder");while(a.at(-1)===0)a.pop();return a.join("")+"1"}
 function dict(values){const codes=values.map(code);const map=new Map(codes.map((s,i)=>[s,i]));check(map.size===29,"injective");return{codes,map,W:Math.max(...codes.map(s=>s.length))}}
 function parse(s,d){let start=0,out=[];for(let i=1;i<s.length;i++)if(i>start&&s[i-1]==="1"&&s[i]==="1"){const a=d.map.get(s.slice(start,i+1));if(a===undefined)return null;out.push(a);start=i+1;i=start;}return start===s.length&&out.length?out:null}
 function to29(n){const a=[];while(n){a.push(Number(n%29n));n/=29n}return a.reverse()}
 function from29(a){let n=0n;for(const x of a)n=29n*n+BigInt(x);return n}
 function encode(a,d,mode){let b=a.map(i=>d.codes[i]).join("");if(mode==="sentinel-reverse")b=reverse(b);if(mode!=="raw-forward")b="1"+b;else if(b[0]!=="1")return null;return to29(BigInt("0b"+b))}
 function decode(n,d,mode){if(!n)return null;let b=n.toString(2);if(mode!=="raw-forward")b=b.slice(1);if(!b.length)return null;if(mode==="sentinel-reverse"){if(!b.startsWith("11"))return null;b=reverse(b)}else if(!b.endsWith("11"))return null;return parse(b,d)}
 function reach(a,d,mode){const N=a.length,dp=Array(N+1).fill(0n),pred=Array(N+1).fill(null);dp[0]=1n;let tested=0,edges=0,reachable=0;for(let i=0;i<N;i++){if(!dp[i])continue;reachable++;if(a[i]===0)continue;let n=0n;for(let j=i;j<N;j++){n=n*29n+BigInt(a[j]);tested++;const x=decode(n,d,mode);if(x===null)continue;edges++;dp[j+1]+=dp[i];if(!pred[j+1])pred[j+1]=[i,x]}}
 const best=dp.findLastIndex(v=>v>0n),path=[];for(let k=best;k>0;){const[i,x]=pred[k];check(eq(encode(x,d,mode),a.slice(i,k)),"frame replay");path.unshift({start:i,end:k,plain:x.map(q=>corpus.translit[q]).join(" ")});k=i}
 return{tested,edges,reachable,maxPrefix:best,completePaths:dp[N].toString(),longestPrefixPaths:dp[best].toString(),witness:path}}
 const original=corpus.pages.slice(15,23).flatMap((p,i)=>p.indices.slice(i===0?20:0));check(original.length===1883,"length");
 const clear=corpus.pages[57].indices;check(clear.length===95,"p57 length");
 const results=[];
 for(const {name,map} of prior.results){const d=dict(map);for(const mode of ["raw-forward","sentinel-forward","sentinel-reverse"]){
 let pairs=0,skipped=0;for(let i=0;i<29;i++)for(let j=0;j<29;j++){const p=[i,j],c=encode(p,d,mode);if(!c){skipped++;continue}check(eq(decode(from29(c),d,mode),p),"pair "+name+" "+mode);pairs++}
 // Raw-forward intrinsically cannot represent a frame beginning in a zero bit.
 // Choose a rotation of authentic p57 with a representable first codeword, then choose two internal cuts with that property.
 const okstart=x=>mode!=="raw-forward"||d.codes[x][0]==="1";
 const off=clear.findIndex(okstart);check(off>=0,"representable p57 start");const p=clear.slice(off).concat(clear.slice(0,off));const cuts=[0];for(const x of [31,63]){let k=x;while(k<p.length&&!okstart(p[k]))k++;check(k<p.length,"cut");cuts.push(k)}cuts.push(p.length);
 const c=encode(p,d,mode);check(eq(decode(from29(c),d,mode),p),"native roundtrip");
 const parts=cuts.slice(0,-1).map((s,i)=>p.slice(s,cuts[i+1]));const plant=reach(parts.flatMap(x=>encode(x,d,mode)),d,mode);check(BigInt(plant.completePaths)>0n,"native cut recovery");
 const o=reach(original,d,mode);
 results.push({name,mode,W:d.W,pairs,skipped,controlRotation:off,controlCuts:cuts,controlRunes:p.length,controlEncoded:c.length,controlCompletePaths:plant.completePaths,original:o});
 }}
 return{results};
}
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const prior=JSON.parse(fs.readFileSync(path.join(__dirname,"../im-results/lp2-p15-fibonacci-payload-base29.json"),"utf8"));
function fixedUnknown(corpus){
 const frames=corpus.pages.slice(15,23).map((p,i)=>({frame:"p"+p.page,a:p.indices.slice(i===0?20:0)}));frames.push({frame:"p15body-p22",a:frames.flatMap(x=>x.a)});frames.push({frame:"p16-p22",a:frames.slice(1,8).flatMap(x=>x.a)});
 function scan(b){let f=1n,g=2n,v=0n,prev="0",start=0;const vals=[];for(let i=0;i<b.length;i++){const x=b[i];if(x==="1"&&prev==="1"){vals.push(v.toString());f=1n;g=2n;v=0n;prev="0";start=i+1;continue}if(x==="1")v+=f;[f,g]=[g,f+g];prev=x}return{bits:b.length,complete:start===b.length,parsed:vals.length,distinct:new Set(vals).size,terminalBits:b.length-start}}
 const output=[];
 for(const {frame,a} of frames){let n=0n;for(const x of a)n=n*29n+BigInt(x);const b=n.toString(2);for(const mode of ["raw-forward","sentinel-forward","sentinel-reverse"]){let s=mode==="raw-forward"?b:b.slice(1);if(mode==="sentinel-reverse")s=[...s].reverse().join("");output.push({frame,mode,n:a.length,...scan(s)})}}
 return output;
}
console.log(JSON.stringify({...run(corpus,prior),fixedUnknown:fixedUnknown(corpus)},null,2));
