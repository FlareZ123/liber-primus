"use strict";
const fs=require("node:fs");const path=require("node:path");
function run(gp,sources){
 const assert=(v,m)=>{if(!v)throw new Error(m)};
 const bits=(x)=>{let n=0;while(x){x&=x-1;n++}return n};
 const labels=m=>Array.from({length:29},(_,i)=>i).filter(i=>m&(1<<i));
 function bound(tape,k){
  const forb=new Set(); let used=0;
  for(const x of tape)used|=1<<x;
  for(let i=0;i+k<=tape.length;i++){let m=0;for(let j=0;j<k;j++)m|=1<<tape[i+j];forb.add(m)}
  // A forbidden set F implies no supersets of F. Keep inclusion-minimal sets only.
  const min=[...forb].sort((a,b)=>bits(a)-bits(b)||a-b).filter((m,i,arr)=>!arr.slice(0,i).some(n=>(m&n)===n));
  const req=Array.from({length:29},()=>[]);
  for(const m of min)for(const v of labels(m))req[v].push(m^(1<<v));
  let best=0,witness=0,nodes=0;
  function dfs(chosen,available,n){
   nodes++;
   if(n>best){best=n;witness=chosen}
   while(available&&n+bits(available)>best){
    let a=available&-available;available^=a;
    let v=31-Math.clz32(a);
    if(req[v].some(m=>(m&chosen)===m))continue;
    let now=chosen|a, next=available;
    for(let b=next;b;b&=b-1){
     let w=b&-b,j=31-Math.clz32(w);
     if(req[j].some(m=>(m&now)===m))next^=w;
    }
    dfs(now,next,n+1);
   }
  }
  dfs(0,used,0);
  assert(!min.some(m=>(m&witness)===m),"invalid witness");
  return {alpha:best,witness:labels(witness),nodes,types:bits(used),constraints:min.length}
 }
 const morse=[".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."];
 function trits(txt){
  // Trim Gutenberg framing when present.
  let start=txt.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n/i), end=txt.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
  if(start)txt=txt.slice(start.index+start[0].length,end?end.index:undefined);
  else if(end)txt=txt.slice(0,end.index);
  return (txt.toUpperCase().match(/[A-Z]+/g)||[]).map(word=>[...word].map(c=>morse[c.charCodeAt(0)-65]).join("x")).join("xx");
 }
 const xfreeCodes=["...","..-",".-.",".--","-..","-.-","--.","---"];
 const xmap=Object.fromEntries(xfreeCodes.map((c,i)=>[c,i]));
 function codes(t,p){let a=[];for(let j=p;j+3<=t.length;j+=3)a.push(xmap[t.slice(j,j+3)]??-1);return a}
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pages=gp.pages.filter(p=>p.page<56&&p.indices.length>0);
 const all=pages.flatMap(p=>p.indices);
 assert(all.length===12956,"original count");
 const scope=(name,tape)=>({name,n:tape.length,b2:bound(tape,2),b3:bound(tape,3)});
 const results=chapters.map(([a,b])=>scope(`p${a}-${b}`,pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)));
 results.push(scope("all",all));
 // All overlapping fixed-length trigraph windows, in all 3 bit phases.
 const control=sources.map((s,id)=>{
  const t=trits(s); const streams=[0,1,2].map(p=>codes(t,p));
  return {id,trits:t.length,scopes:results.map(x=>{
   let windows=0,minDistinct=8,pass2=0,pass3=0;
   for(const a of streams){if(a.length<x.n)continue;const c=Array(8).fill(0);let d=0;for(let i=0;i<a.length;i++){const v=a[i];if(v>=0&&c[v]++===0)d++;if(i>=x.n){const old=a[i-x.n];if(old>=0&&--c[old]===0)d--}
    if(i+1>=x.n){windows++;minDistinct=Math.min(minDistinct,d);if(d<=x.b2.alpha)pass2++;if(d<=x.b3.alpha)pass3++;}
   }}
   return {name:x.name,windows,minDistinct,pass2,pass3}
  })}
 });
 // Homophonic Morse positive: use 26 conventional trigraphs and 3 extra rune labels
 // as alternative carriers of the first three x-free trigraphs.
 const codebook=[];for(const a of ".-x")for(const b of ".-x")for(const c of ".-x")if(a+b+c!=="xxx")codebook.push(a+b+c);
 codebook.push("...","..-",".-.");
 let rng=3301;function next(n){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n}
 // Shuffle labels to prevent the graph analysis relying on code order.
 for(let i=codebook.length-1;i>0;i--){let j=next(i+1);[codebook[i],codebook[j]]=[codebook[j],codebook[i]]}
 const t=trits(sources[0]).slice(9000,9000+3*3008);
 const plant=[];for(let i=0;i<t.length;i+=3){let s=t.slice(i,i+3),opts=codebook.map((v,j)=>v===s?j:-1).filter(j=>j>=0);assert(opts.length,"plant invalid triple");plant.push(opts[next(opts.length)])}
 const plantS=scope("plant",plant);
 const active=Array.from(new Set(plant)).filter(v=>!codebook[v].includes("x"));
 const recovered=plant.map(v=>codebook[v]).join("");
 assert(recovered===t,"plant decode");
 assert(plantS.b2.alpha>=active.length&&plantS.b3.alpha>=active.length,"plant falsely rejected");
 // Independent brute-force check exact search on tiny random alphabets.
 for(let q=0;q<50;q++){const t=Array.from({length:60},()=>next(10));for(let k=2;k<=3;k++){let best=0;let masks=Array.from({length:t.length-k+1},(_,i)=>t.slice(i,i+k).reduce((m,v)=>m|(1<<v),0));for(let m=0;m<1024;m++)if(bits(m)>best&&!masks.some(f=>(m&f)===f))best=bits(m);assert(bound(t,k).alpha===best,"tiny brute-force mismatch")}}
 return {results,control,plant:{...plantS,active,activeCodeCount:new Set(active.map(v=>codebook[v])).size,recoveredTrits:recovered.length,codebook}};
}
const root=path.resolve(__dirname,"..");const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];const data=files.map(p=>fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(run(JSON.parse(data[0]),data.slice(1)),null,2));
