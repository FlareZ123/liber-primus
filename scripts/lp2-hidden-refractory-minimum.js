'use strict';
const fs=require('node:fs');
const path=require('node:path');
function analyze(c){
 const pages=c.pages.filter(p=>p.page<56&&p.indices.length), a=pages.flatMap(p=>p.indices);
 function ok(x,k){const last=new Map();for(let i=0;i<x.length;i++){if(last.has(x[i])&&i-last.get(x[i])<=k)return false;last.set(x[i],i)}return true}
 function minGap(a,k){const last=new Map(), t=[],g=[],w=[];let q=0;for(let i=0;i<a.length;i++){let v=i?t[i-1]+1:0;if(last.has(a[i]))v=Math.max(v,t[last.get(a[i])]+k+1);const h=i?v-t[i-1]-1:0;g.push(h);for(let j=0;j<h;j++)w.push(29+(q++%7));w.push(a[i]);t.push(v);last.set(a[i],i)}const hidden=q;if(k<=7&&(!ok(w,k)||w.filter(x=>x<29).length!==a.length||w.filter(x=>x<29).some((x,i)=>x!==a[i])))throw Error("silent witness failure");if(k<=14){const u=Array(t.at(-1)+1).fill(-1);a.forEach((x,i)=>u[t[i]]=x);for(let i=0;i<u.length;i++){if(u[i]>=0)continue;const bad=new Set(u.slice(Math.max(0,i-k),i+k+1));u[i]=Array.from({length:29},(_,j)=>j).find(j=>!bad.has(j));if(u[i]===undefined)throw Error("coloring failure")}if(!ok(u,k)||a.some((x,i)=>u[t[i]]!==x))throw Error("deletion witness failure")}return {hidden,nonzeroGaps:g.filter(Boolean).length,maxGap:Math.max(...g)}}
 function logBound(n,m,p){const z=m/n;if(p===0)return null;if(z<=p)return 0;return -n*(z*Math.log(z/p)+(1-z)*Math.log((1-z)/(1-p)))/Math.LN10}
 const repeat=a.slice(1).filter((x,i)=>x===a[i]).length,n=a.length-1, np=pages.reduce((s,p)=>s+p.indices.length-1,0),rp=pages.reduce((s,p)=>s+p.indices.slice(1).filter((x,i)=>x===p.indices[i]).length,0);
 if(a.length!==12956||repeat!==86||np!==12901||rp!==86)throw Error("wrong corpus");
 const rows=[];for(let k=1;k<=14;k++){let p=1/29;for(let j=0;j<k;j++)p*=Math.max(0,7-j)/(36-k);const d=(7/36)**k/(29-k);rows.push({k,...minGap(a,k),pageResetHidden:pages.reduce((s,p)=>s+minGap(p.indices,k).hidden,0),silentProbabilityUpper:p,silentLog10Tail:logBound(n,repeat,p),silentPageLog10Tail:logBound(np,rp,p),deletionProbabilityUpper:d,deletionLog10Tail:logBound(n,repeat,d),deletionPageLog10Tail:logBound(np,rp,d)})}return {n:a.length,repeat,np,rp,rows};
}
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(analyze(corpus),null,2));
