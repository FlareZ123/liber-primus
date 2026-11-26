"use strict";
const fs = require("node:fs");
const paths = ["resources/liber-primus/lp2-corpus.json", ...["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt","latin-vulgate-latin26-normalized.txt"].map(x=>"resources/control/"+x)];
/** Original GP29 predecessor-conditioned homophonic capacity, exhaustive finite literary windows. */
function experiment(corpus,sources) {
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length);
 const n=pages.reduce((a,p)=>a+p.indices.length,0),m=n-pages.length;
 if(n!==12956||m!==12901)throw Error("source layout");
 const group=p=>ranges.findIndex(([a,b])=>a<=p&&p<=b);
 const schedules=[["global",()=>0],["nine",group],["page",p=>p]];
 /** Sum the k smallest original successor counts in every independently keyed row. */
 function bounds(ps,scope){
   const h=new Map();
   for(const p of ps)for(let i=1;i<p.indices.length;i++){
      const key=scope(p.page)*29+p.indices[i-1];let row=h.get(key);
      if(!row){row=Array(29).fill(0);h.set(key,row)}
      row[p.indices[i]]++;
   }
   const l=Array(30).fill(0);
   for(const row of h.values()){row.sort((a,b)=>a-b);let s=0;for(let k=1;k<=29;k++){s+=row[k-1];l[k]+=s}}
   return l;
 }
 const limits=Object.fromEntries(schedules.map(([name,f])=>[name,bounds(pages,f)]));
 const chapters=ranges.map(([lo,hi])=>{let ps=pages.filter(p=>lo<=p.page&&p.page<=hi);return {range:[lo,hi],n:ps.reduce((s,p)=>s+p.indices.length,0),l:bounds(ps,()=>0)}});
 if(limits.global[1]!==86||limits.global[2]!==318||limits.nine[4]!==167||chapters[7].n!==3008||chapters[7].l[3]!==62)throw Error("original bound changed");
 const strip=s=>s.split(/\r?\n/).filter(x=>!x.startsWith("#")).join("\n");
 function body(s){let a=s.search(/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG/i);if(a>=0)s=s.slice(s.indexOf("\n",a)+1);let b=s.search(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/i);if(b>=0)s=s.slice(0,b);return s}
 const refs=sources.map(s=>({name:s.name,raw:(s.name.includes("latin-vulgate")?strip(s.data):body(s.data)).toUpperCase().replace(/[^A-Z]/g,"")}));
 function scan(a,k,len,ls){
   const c=new Int32Array(k);for(let i=0;i<len;i++)c[a[i]]++;
   const stats=ls.map(()=>({pass:0,fail:0,maxMargin:-Infinity,minMargin:Infinity,best:null,worst:null}));
   for(let off=0;off<=a.length-len;off++){
     if(off){c[a[off-1]]--;c[a[off+len-1]]++}
     const sorted=Array.from(c).sort((a,b)=>a-b),p=[0];for(let x of sorted)p.push(p[p.length-1]+x);
     for(let j=0;j<ls.length;j++){
       const l=ls[j];let margin=Infinity,arg=-1;
       for(let i=1;i<k;i++){let z=p[i]-l[i];if(z<margin){margin=z;arg=i}}
       const s=stats[j];if(margin>=0)s.pass++;else s.fail++;
       const item={off,margin,arg,bottom:p[arg],bound:l[arg]};
       if(margin>s.maxMargin){s.maxMargin=margin;s.best=item}
       if(margin<s.minMargin){s.minMargin=margin;s.worst=item}
     }
   }
   return stats;
 }
 const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 const results=[];
 for(const ref of refs){
   const variants=[["raw",ref.raw]];
   if(!ref.name.includes("latin-vulgate"))variants.push(["I=J,V=U=W",ref.raw.replace(/J/g,"I").replace(/[UW]/g,"V")]);
   for(const [variant,seq] of variants){
     const alphabet=[...new Set(seq)].sort().join(""),k=alphabet.length,id=Object.fromEntries([...alphabet].map((x,i)=>[x,i]));
     const a=Array.from(seq,x=>id[x]);if(a.length<n)throw Error("short");
     const stats=Object.fromEntries(scan(a,k,n,schedules.map(([x])=>limits[x])).map((v,i)=>[schedules[i][0],v]));
     const local=chapters.map(ch=>({range:ch.range,len:ch.n,...scan(a,k,ch.n,[ch.l])[0]}));
     results.push({name:ref.name,variant,alphabet,len:a.length,windows:a.length-n+1,stats,local});
   }
 }
 // Independent actual homophonic encryption and exact deterministic row decoding.
 let seed=0x49a7c9;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed*n/4294967296)}
 const A=26,rows=Array.from({length:9*29},()=>{let q=Array.from({length:29},(_,i)=>i<A?i:rand(A));for(let j=q.length-1;j>0;j--){let z=rand(j+1);[q[j],q[z]]=[q[z],q[j]]}return q});
 const plain=refs[0].raw.slice(100,100+n),ct=[];
 let pos=0;
 for(const pg of pages){let prev=rand(29),ind=[prev];pos++;
   for(let j=1;j<pg.indices.length;j++){
     const val=letters.indexOf(plain[pos++]),row=rows[group(pg.page)*29+prev],opts=[];
     for(let x=0;x<29;x++)if(row[x]===val)opts.push(x);
     prev=opts[rand(opts.length)];ind.push(prev);
   }ct.push({page:pg.page,indices:ind});
 }
 const l=bounds(ct,group),c=Array(26).fill(0);
 let matches=0;pos=0;
 for(const pg of ct){pos++;for(let i=1;i<pg.indices.length;i++){
    const val=letters.indexOf(plain[pos++]),decoded=rows[group(pg.page)*29+pg.indices[i-1]][pg.indices[i]];
    if(val===decoded)matches++;c[val]++;
 }}
 c.sort((a,b)=>a-b);let cc=0;for(let i=1;i<=26;i++){cc+=c[i-1];if(cc<l[i])throw Error("plant bound")}
 if(matches!==m)throw Error("plant decode");
 if(results.some(z=>z.stats.global.pass||z.local[7].pass))throw Error("original decision changed");
 return {n,m,limits,chapters,results,plant:{matches,total:m,lower:l,bottomCounts:c}};
}
const src=paths.map(name=>({name,data:fs.readFileSync(name,"utf8")}));
console.log(JSON.stringify(experiment(JSON.parse(src[0].data),src.slice(1)),null,2));
