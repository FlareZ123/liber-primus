'use strict';
// Source-cued candidate, not an authenticated LP2 cipher. Run from repository root.
const fs=require('node:fs');
function run(corpus,refs){
 const mod=(n,m)=>((n%m)+m)%m, root=n=>n===0?0:1+mod(n-1,9);
 const gp=corpus.prime,alphabet=corpus.runes,tr=corpus.translit;
 if(root(1033)!==7||root(3301)!==7)throw Error("seed");
 const records=refs.sections.map(s=>({name:s.name,p:[...s.source_text].map(x=>alphabet.indexOf(x)).filter(x=>x>=0)}));
 const train=records.filter(s=>s.name.startsWith("0_")).map(s=>s.p);
 const ct=Array.from({length:30},()=>Array(29).fill(.25));
 for(const row of train){let prev=29;for(const p of row){ct[prev][p]++;prev=p}}
 const sc=ct.map(row=>row.map(x=>Math.log(x/row.reduce((a,b)=>a+b,0))));
 const score=p=>p.reduce((s,x,i)=>s+sc[i?p[i-1]:29][x],0)/p.length;
 function encode(P,seed,sign,hold){let r=seed;const C=[];for(const p of P){if(hold&&p===0){C.push(0);continue}C.push(mod(p+sign*r,29));r=root(r+gp[p])}return C}
 function decode(C,seed,sign,hold){
   let states=new Map([[seed*30+29,{r:seed,prev:29,count:1n,s:0,p:[]}]]);
   let maxStates=1;
   for(let i=0;i<C.length;i++){
     const c=C[i],next=new Map();
     function add(st,p,r){
       const k=r*30+p,s=st.s+sc[st.prev][p],old=next.get(k);
       if(old){old.count+=st.count;if(s>old.s){old.s=s;old.p=st.p.concat(p)}}else next.set(k,{r,prev:p,count:st.count,s,p:st.p.concat(p)})
     }
     for(const st of states.values()){
       if(hold&&c===0)add(st,0,st.r);
       const p=mod(c-sign*st.r,29);
       if(!hold||p!==0)add(st,p,root(st.r+gp[p]));
     }
     if(!next.size)return {dead:i,maxStates,paths:"0"};
     states=next;maxStates=Math.max(maxStates,states.size);
   }
   const all=[...states.values()],total=all.reduce((n,x)=>n+x.count,0n);
   const best=all.sort((a,b)=>b.s-a.s)[0];
   if(encode(best.p,seed,sign,hold).join()!==C.join())throw Error("replay");
   return {paths:String(total),maxStates,score:best.s/C.length,p:best.p,end:best.r};
 }
 const pp=corpus.pages.slice(34,40),original=pp.flatMap(s=>s.indices),page34=pp[0].indices.length;
 const held=records.filter(x=>!x.name.startsWith("0_"));
 const controls=[],tests=[],reset=[];
 for(const sign of [1,-1])for(const hold of [false,true]){
   for(const {name,p} of held){
     const planted=encode(p,7,sign,hold),d=decode(planted,7,sign,hold);
     if(!d.p)throw Error("plant no path");
     controls.push({name,sign,hold,paths:d.paths,accuracy:d.p.filter((v,i)=>v===p[i]).length,n:p.length,truthScore:score(p),bestScore:d.score});
   }
   for(const seed of [7,1,2,3,4,5,6,8,9]){
     const d=decode(original,seed,sign,hold);
     tests.push({seed,sign,hold,...(d.p?{paths:d.paths,score:d.score,head:d.p.slice(0,100).map(x=>tr[x]).join(""),firstPageScore:score(d.p.slice(0,page34)),laterScore:score(d.p.slice(page34)),end:d.end,output:d.p}:{dead:d.dead,maxStates:d.maxStates,paths:d.paths})});
     for(const pg of pp){
       const x=decode(pg.indices,seed,sign,hold);
       reset.push({page:pg.page,seed,sign,hold,...(x.p?{paths:x.paths,score:x.score,head:x.p.slice(0,40).map(v=>tr[v]).join("")}:{dead:x.dead,paths:"0"})})
     }
   }
 }
 return {n:original.length,page34,train:train.reduce((s,p)=>s+p.length,0),controls,tests,reset}
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
