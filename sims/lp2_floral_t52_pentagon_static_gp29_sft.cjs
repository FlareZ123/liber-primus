'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native) {
 const a=corpus.pages.find(p=>p.page===40).indices,b=corpus.pages.find(p=>p.page===41).indices;
 const permutations=(xs)=>xs.length===0?[[]]:xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(y=>[x,...y]));
 const perms=permutations([0,1,2,3,4]);
 const maskSet=new Set([0,31]);
 const left=[0,1,1,0,1];
 for(const d of [-1,1])for(let s=0;s<5;s++)for(const polarity of [0,1]){
  let m=0;for(let i=0;i<5;i++)m=(m<<1)|(left[(s+d*i+5)%5]^polarity);
  maskSet.add(m);
 }
 const masks=[...maskSet].sort((x,y)=>x-y);
 const permute=(x,p)=>p.reduce((v,bit,i)=>v|(((x>>bit)&1)<<i),0);
 const inverse=p=>p.map((_,i)=>p.indexOf(i));
 const enc=(x,p,m,o)=>permute((x+o)^m,p)-o;
 const dec=(x,p,m,o)=>(permute(x+o,inverse(p))^m)-o;
 const valid=x=>x>=0&&x<29;
 const nativeSections=native.sections.map(s=>({name:s.name,tape:[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0)}));
 const training=nativeSections.filter(s=>!s.name.includes("parable")&&!s.name.includes("end"));
 const counts=Array.from({length:29},()=>Array(29).fill(.2));
 for(const s of training)for(let i=1;i<s.tape.length;i++)counts[s.tape[i-1]][s.tape[i]]++;
 const log=counts.map(row=>{const sum=row.reduce((x,y)=>x+y,0);return row.map(x=>Math.log(x/sum))});
 const score=t=>t.slice(1).reduce((v,x,i)=>v+log[t[i]][x],0)/(t.length-1);
 const ioc=t=>{const f=Array(29).fill(0);for(const x of t)f[x]++;return f.reduce((v,n)=>v+n*(n-1),0)/(t.length*(t.length-1))};
 const stats=[],survivors=[];
 for(const o of [0,1])for(const m of masks){
  let minA=Infinity,minB=Infinity,validA=0,validBoth=0;
  for(const p of perms){
   const x=a.map(v=>dec(v,p,m,o)),y=b.map(v=>dec(v,p,m,o));
   if(!x.every((v,i)=>enc(v,p,m,o)===a[i])||!y.every((v,i)=>enc(v,p,m,o)===b[i]))throw Error("roundtrip");
   const ia=x.filter(v=>!valid(v)).length,ib=y.filter(v=>!valid(v)).length;
   minA=Math.min(minA,ia);minB=Math.min(minB,ib);
   if(!ia){validA++;if(!ib){validBoth++;survivors.push({o,m,p,fit:score(x),held:score(y),fitTape:x,heldTape:y})}}
  }
  stats.push({o,m,minA,minB,validA,validBoth})
 }
 const best=[...survivors].sort((x,y)=>y.fit-x.fit)[0];
 const controls=[];
 for(const o of [0,1]){
  const cand=survivors.find(s=>s.o===o&&s.p.some((v,i)=>v!==i));
  const t=nativeSections[0].tape;
  const encrypted=t.map(v=>enc(v,cand.p,cand.m,o));
  if(!encrypted.every(valid)||!encrypted.every((v,i)=>dec(v,cand.p,cand.m,o)===t[i]))throw Error("plant");
  controls.push({o,p:cand.p,m:cand.m,n:t.length})
 }
 const windows=(n)=>{let min=Infinity,max=-Infinity,number=0;for(const {tape} of nativeSections)for(let i=0;i+n<=tape.length;i++){const v=ioc(tape.slice(i,i+n));min=Math.min(min,v);max=Math.max(max,v);number++}return{n,number,min,max}};
 return {masks,permutations:perms.length,pages:[a,b].map((t,i)=>({page:40+i,n:t.length,distinct:new Set(t).size,ioc:ioc(t)})),stats,survivorCount:survivors.length,uniqueMaps:new Set(survivors.map(s=>Array.from({length:29},(_,i)=>dec(i,s.p,s.m,s.o)).join(","))).size,best,controls,nativeWindows:[windows(a.length),windows(b.length)],nativeScores:nativeSections.map(s=>({name:s.name,n:s.tape.length,score:score(s.tape),ioc:ioc(s.tape)})),allValidOutputs:survivors}
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const result=run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'));
console.log(JSON.stringify(result,null,2));
