"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
/** @param {object} grid @param {object} corpus */
function run(grid,corpus){
 const t=grid.pages.flatMap(x=>x.tokens),pairs=Array.from({length:128},(_,i)=>[t[8*(i>>2)+i%4],t[8*(i>>2)+7-i%4]]);
 const duplicate=pairs.filter(([a,b],i)=>pairs.some(([x,y],j)=>j!==i&&((a===x&&b===y)||(a===y&&b===x))));
 if(duplicate.length!==2||duplicate[0].join()!=="3I,2L"||duplicate[1].join()!=="2L,3I")throw Error("wrong parallel edge");
 const depth=new Map(duplicate[0].map(v=>[v,0])),q=[...depth.keys()];
 for(let j=0;j<q.length;j++)for(const [a,b] of pairs){const u=q[j],v=a===u?b:b===u?a:null;if(v!==null&&!depth.has(v)){depth.set(v,depth.get(u)+1);q.push(v)}}
 const edges=pairs.filter(([a,b])=>depth.has(a)&&depth.has(b));
 if(edges.length!==29||q.length!==29||new Set(edges.map(p=>[...p].sort().join())).size!==28)throw Error("wrong unicyclic component");
 const alpha=grid.alphabet,val=x=>60*alpha.indexOf(x[0])+alpha.indexOf(x[1]);const sorted=q.slice().sort((a,b)=>val(a)-val(b));
 const keys=[0,1].map(orient=>edges.map(([a,b])=>sorted.indexOf(depth.get(a)===depth.get(b)?[a,b][orient]:depth.get(a)>depth.get(b)?a:b)));
 if(keys.some(k=>new Set(k).size!==29))throw Error("edge-to-vertex matching invalid");
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 const enc=(p,key,sign,hold)=>{let j=0;return p.map(x=>hold&&x===0?0:(x-sign*key[j++%key.length]+29)%29)};
 const decode=(c,key,sign,hold)=>{let states=[{j:0,p:[]}];for(let i=0;i<c.length;i++){const n=[];for(const s of states){if(hold&&c[i]===0)n.push({j:s.j,p:[...s.p,0]});const x=(c[i]+sign*key[s.j%key.length]+29)%29;if(!hold||x!==0)n.push({j:s.j+1,p:[...s.p,x]})}states=n;if(!states.length)return {paths:[],dead:i};}for(const s of states)if(enc(s.p,key,sign,hold).some((x,i)=>x!==c[i]))throw Error("reencryption mismatch");return{paths:states.map(s=>s.p),dead:null}};
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const c56=corpus.pages[56].indices,truth56="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE";
 const control=decode(c56,primes.map(p=>(p-1)%29),-1,true);
 const truthCount=control.paths.filter(p=>render(p)===truth56).length;if(truthCount!==1)throw Error("authentic p56 control not found");
 const plant=corpus.pages[57].indices,controls=[],original=[];
 for(let k=0;k<2;k++)for(const sign of [-1,1])for(const hold of [true,false]){
  const c=enc(plant,keys[k],sign,hold),d=decode(c,keys[k],sign,hold);
  if(!d.paths.some(p=>p.every((x,i)=>x===plant[i])))throw Error("known clear p57 plant lost");
  controls.push({k,sign,hold,pathCount:d.paths.length,truthRetained:true});
  for(const [lo,hi] of [[55,55],[54,55]]){const c=corpus.pages.slice(lo,hi+1).flatMap(p=>p.indices),d=decode(c,keys[k],sign,hold);original.push({k,sign,hold,range:[lo,hi],length:c.length,pathCount:d.paths.length,dead:d.dead,outputs:d.paths.map(render)})}
 }
 return {sortedLabels:sorted,keys,authenticControl:{paths:control.paths.length,intendedTruthCount:truthCount},plants:controls,original};
}
console.log(JSON.stringify(run(grid,corpus),null,2));
