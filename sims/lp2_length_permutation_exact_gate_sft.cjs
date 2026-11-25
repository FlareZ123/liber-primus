"use strict";
// Exact finite permutation gate for #2725. Node.js CommonJS, repository root.
// Source Git blob: f7b534a33edeb212d427329798438325307463d7
function chapterHistograms(raw){
  const pages=raw.split("%");
  if(pages.length!==57)throw Error("Unexpected compressed page count");
  const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,52],[53,54]];
  return ranges.map(([s,e])=>{
    const groups=pages.slice(s,e+1).join("").replace(/[/\s]/g,"").match(/\p{Script=Runic}+/gu)||[];
    const h=Array(14).fill(0);
    for(const w of groups){if(w.length>14)throw Error("Out-of-domain group");h[w.length-1]++}
    return h;
  });
}

function solve(rows,n){
  const P=65521,mod=x=>((x%P)+P)%P;
  function inv(a){let x=1,e=P-2;while(e){if(e&1)x=mod(x*a);a=mod(a*a);e>>=1}return x}
  const A=[...rows,Array(n).fill(1)].map(h=>[...h,h.reduce((s,c,i)=>s+c*(i+1),0)].map(mod));
  const piv=[];
  for(let j=0;j<n;j++){
    const k=A.findIndex((row,i)=>i>=piv.length&&row[j]!==0);if(k<0)continue;
    const q=piv.length;[A[k],A[q]]=[A[q],A[k]];
    const z=inv(A[q][j]);A[q]=A[q].map(v=>mod(v*z));
    for(let i=0;i<A.length;i++)if(i!==q){const c=A[i][j];A[i]=A[i].map((v,l)=>mod(v-c*A[q][l]))}
    piv.push(j);
  }
  const free=Array.from({length:n},(_,i)=>i).filter(i=>!piv.includes(i));
  let count=0;const solutions=[],x=Array(n).fill(0);
  function dfs(d,mask){
    if(d===free.length){
      count++;let m=mask;
      for(let i=0;i<piv.length;i++){
        const v=mod(A[i][n]-free.reduce((s,j)=>s+A[i][j]*x[j],0));
        if(v<1||v>n||m&(1<<v))return;
        m|=1<<v;x[piv[i]]=v;
      }
      if(rows.every(h=>h.reduce((s,c,j)=>s+c*(x[j]-j-1),0)===0))solutions.push([...x]);
      return;
    }
    for(let v=1;v<=n;v++)if(!(mask&(1<<v))){x[free[d]]=v;dfs(d+1,mask|1<<v)}
  }
  dfs(0,0);
  return {rank:piv.length,piv:piv.map(i=>i+1),free:free.map(i=>i+1),count,solutions};
}

function brute(rows,n){
  const out=[],x=[];
  function rec(mask){if(x.length===n){if(rows.every(h=>h.reduce((s,c,j)=>s+c*(x[j]-j-1),0)===0))out.push([...x]);return}
    for(let v=1;v<=n;v++)if(!(mask&(1<<v))){x.push(v);rec(mask|1<<v);x.pop()}}
  rec(0);return out.sort();
}

function main(raw){
  const rows=chapterHistograms(raw);
  const words=rows.flat().reduce((s,c)=>s+c,0),runes=rows.reduce((s,h)=>s+h.reduce((t,c,i)=>t+c*(i+1),0),0);
  if(words!==2896||runes!==12956)throw Error("Carry-aware corpus count mismatch");
  let state=33012725;function rng(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state}
  let controls=0;
  for(let k=0;k<32;k++){
    const n=6, rr=Array.from({length:k%5},()=>Array.from({length:n},()=>rng()%7));
    if(k%2)for(const h of rr)h[1]=h[0]; // nonidentity (1 2) planted, with equal counts
    const got=solve(rr,n).solutions.sort(),expected=brute(rr,n);
    if(JSON.stringify(got)!==JSON.stringify(expected))throw Error("Brute force mismatch "+k);
    if(k%2&&!got.some(x=>x[0]===2&&x[1]===1&&x.slice(2).every((v,i)=>v===i+3)))throw Error("Planted swap lost");
    controls++;
  }
  const result=solve(rows.slice(0,8),14),holdout=result.solutions.map(x=>rows[8].reduce((s,c,i)=>s+c*(x[i]-i-1),0));
  return {words,runes,rows,controls,development:result,holdout};
}

const fs = require("node:fs");
console.log(JSON.stringify(main(fs.readFileSync("resources/transcriptions/lp2-image-corrected.txt","utf8")), null, 2));
