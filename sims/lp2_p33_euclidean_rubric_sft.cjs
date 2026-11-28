"use strict";
/** Exact p33 Euclidean-tape receiver. Run node sims/lp2_p33_euclidean_rubric_sft.cjs. */
const fs=require("node:fs"),path=require("node:path");
function run(g,native){
 const need=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const ix=new Map(g.runes.map((r,i)=>[r,i])),enc=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x)),show=p=>p.map(i=>g.translit[i]).join(" ");
 const train=native.sections.slice(0,7).map(s=>enc(s.source_text)),U=Array(29).fill(1),B=Array.from({length:29},()=>Array(29).fill(0)),T=Array.from({length:29},()=>Array.from({length:29},()=>Array(29).fill(0)));
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i)B[p[i-1]][p[i]]++;if(i>1)T[p[i-2]][p[i-1]][p[i]]++}
 const total=x=>x.reduce((a,b)=>a+b,0),us=total(U),prob=(p,i)=>{let v=U[p[i]]/us;if(i){let b=B[p[i-1]];v=(b[p[i]]+10*v)/(total(b)+10)}if(i>1){let t=T[p[i-2]][p[i-1]];v=(t[p[i]]+10*v)/(total(t)+10)}return Math.log(v)},score=p=>p.reduce((s,x,i)=>s+prob(p,i),0)/p.length;
 let a=3301,b=1033,R=[a,b],Q=[];while(b){Q.push(Math.floor(a/b));[a,b]=[b,a%b];R.push(b)}
 need(eq(R,[3301,1033,202,23,18,5,3,2,1,0])&&eq(Q,[3,5,8,1,3,1,1,2]),"Euclid");
 function encrypt(P,key,sign,hold,j=0){return P.map(p=>hold&&p===0?0:mod(p+sign*key[j++%key.length]))}
 function invert(C,key,sign,hold,j=0){
  let paths=[{p:[],j}];
  for(const c of C){let out=[];for(const x of paths){if(hold&&c===0)out.push({p:[...x.p,0],j:x.j});const p=mod(c-sign*key[x.j%key.length]);if(!hold||p!==0)out.push({p:[...x.p,p],j:x.j+1})}paths=out}
  return paths;
 }
 function decode(C,h,k,sign,hold,mode){
   const header=C.slice(0,h),body=C.slice(h);
   if(mode==="body")return invert(body,k,sign,hold).map(x=>({header:null,body:x.p,key:k,j:x.j}));
   if(mode==="continuous")return invert(C,k,sign,hold).map(x=>({header:x.p.slice(0,h),body:x.p.slice(h),key:k,j:x.j}));
   return invert(header,k,sign,hold).flatMap(x=>invert(body,x.p,sign,hold).map(y=>({header:x.p,body:y.p,key:x.p,j:y.j})));
 }
 const results={remainders:R,quotients:Q,controls:[],original:[]};
 const controls=[enc(native.sections[8].source_text),enc(native.sections[1].source_text)];
 for(const [id,k,h,P] of [["upper",R.map(mod),10,controls[0]],["lower",Q.map(mod),8,controls[1].slice(0,133)]]){
  for(const sign of [1,-1])for(const hold of [false,true])for(const mode of ["body","continuous","rubric"]){
   const C=mode==="body"?P.slice(0,h).concat(encrypt(P.slice(h),k,sign,hold)):mode==="continuous"?encrypt(P,k,sign,hold):encrypt(P.slice(0,h),k,sign,hold).concat(encrypt(P.slice(h),P.slice(0,h),sign,hold));
   const paths=decode(C,h,k,sign,hold,mode);need(paths.some(x=>eq(x.body,P.slice(h))&&(mode==="body"||eq(x.header,P.slice(0,h)))),"native true path");results.controls.push({id,sign,hold,mode,paths:paths.length,trueScore:score(P.slice(h)),bestScore:Math.max(...paths.map(x=>score(x.body)))});
  }
 }
 const p33=g.pages.find(x=>x.page===33).indices,p34=g.pages.find(x=>x.page===34).indices;
 need(p33.length===214&&p33[0]===23&&p33[91]===21,"p33 source");
 for(const [id,C,h,k] of [["upper",p33.slice(0,91),10,R.map(mod)],["lower",p33.slice(91).concat(p34.slice(0,10)),8,Q.map(mod)]]){
  for(const sign of [1,-1])for(const hold of [false,true])for(const mode of ["body","continuous","rubric"]){
   const paths=decode(C,h,k,sign,hold,mode);
   for(const x of paths){
    const replay=mode==="body"?C.slice(0,h).concat(encrypt(x.body,k,sign,hold)):mode==="continuous"?encrypt(x.header.concat(x.body),k,sign,hold):encrypt(x.header,k,sign,hold).concat(encrypt(x.body,x.header,sign,hold));need(eq(replay,C),"replay");
   }
   const ranked=paths.map(x=>({...x,score:score(x.body)})).sort((a,b)=>b.score-a.score);
   results.original.push({id,sign,hold,mode,paths:paths.length,best:ranked.length?{...ranked[0],headerText:ranked[0].header&&show(ranked[0].header),bodyText:show(ranked[0].body)}:null});
  }
 }
 return results;
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
