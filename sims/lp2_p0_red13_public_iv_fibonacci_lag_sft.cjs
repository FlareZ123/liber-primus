'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,sol){
 const mod=x=>(x%29+29)%29;
 const check=(v,msg)=>{if(!v)throw Error(msg)};
 const seed=gp.pages[0].indices.slice(0,13);
 check(seed.join()==="15,8,18,3,6,19,27,0,15,26,18,21,5","source title");
 const target=gp.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
 check(target.length===716&&gp.pages[0].indices.length===262,"source chapter");
 const ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const native=s=>Array.from(s.source_text).filter(x=>ix.has(x)).map(x=>ix.get(x));
 const withheld=["0_koan_1","0_loss_of_divinity"];
 const tr=sol.sections.filter(s=>!withheld.includes(s.name)).map(native);
 const uni=new Float64Array(29).fill(1),bi=new Float64Array(841),tri=new Float64Array(24389);
 for(const p of tr)for(let i=0;i<p.length;i++){uni[p[i]]++;if(i)bi[p[i-1]*29+p[i]]++;if(i>1)tri[(p[i-2]*29+p[i-1])*29+p[i]]++}
 const sum=a=>a.reduce((s,x)=>s+x,0),u=Array.from(uni,x=>x/sum(uni));
 const b=new Float64Array(841),t=new Float64Array(24389);
 for(let i=0;i<29;i++){let z=sum(bi.subarray(i*29,i*29+29))+10;for(let j=0;j<29;j++)b[i*29+j]=(bi[i*29+j]+10*u[j])/z}
 for(let i=0;i<841;i++){let z=sum(tri.subarray(i*29,i*29+29))+10;for(let j=0;j<29;j++)t[i*29+j]=Math.log((tri[i*29+j]+10*b[(i%29)*29+j])/z)}
 const ul=u.map(Math.log),bl=Array.from(b,Math.log),sc=(a,b,p)=>b===29?ul[p]:a===29?bl[b*29+p]:t[(a*29+b)*29+p];
 function key(a,b,c,n){const z=new Uint8Array(n+13);z.set(seed);for(let i=13;i<z.length;i++)z[i]=(a*z[i-13]+b*z[i-8]+c*z[i-5])%29;return z.subarray(13)}
 function encode(p,k,hold){let j=0;return p.map(x=>hold&&x===0?0:(x+k[j++])%29)}
 function reach(c,k){let states=[0];for(let i=0;i<c.length;i++){let nx=new Set;for(const j of states){if(c[i]===0)nx.add(j);if(c[i]!==k[j])nx.add(j+1)}if(!nx.size)return i;states=[...nx]}return c.length}
 function decode(c,k,hold,lo,hi,states=[{j:0,a:29,b:29,l:0,seq:""}]){if(!hold){let v=states[0];for(let i=lo;i<hi;i++){let p=mod(c[i]-k[v.j]);v={j:v.j+1,a:v.b,b:p,l:v.l+sc(v.a,v.b,p),seq:v.seq+String.fromCharCode(65+p)}}return [v]}
 for(let i=lo;i<hi;i++){let nx=new Map;for(const v of states){function add(p,j){let l=v.l+sc(v.a,v.b,p),id=(j*30+v.b)*30+p,old=nx.get(id);if(!old||l>old.l)nx.set(id,{j,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}if(c[i]===0)add(0,v.j);const p=mod(c[i]-k[v.j]);if(p)add(p,v.j+1)}states=[...nx.values()];if(!states.length)break}return states}
 const best=a=>a.reduce((x,y)=>!x||y.l>x.l?y:x,null),read=v=>Array.from(v.seq,x=>x.charCodeAt(0)-65);
 const out=[];const n=716,prefix=249;
 const entire=gp.pages.slice(0,56).flatMap(p=>p.indices).slice(13),bookSurvivors=[];
 check(entire.length===12943,'book length');
 const plants=withheld.map((name,i)=>{let p=native(sol.sections.find(s=>s.name===name)).slice(0,n);check(p.length===n,"control length");return{name,p,coeff:i?[9,4,17]:[3,11,7],hold:i===0}});
 const jobs=[{name:"original-F",c:target,hold:true},{name:"original-ordinary",c:target,hold:false},...plants.map(v=>({...v,c:encode(v.p,key(...v.coeff,n),v.hold)}))];
 for(const job of jobs){
  let winner=null,maxFull=null,prefixLegal=0,fullLegal=0,maxNonzeroPrefix=0,fullNonzero=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
   let k=key(a,b,c,n),coef=[a,b,c],nz=!!(a||b||c),d=job.hold?reach(job.c,k):n;
   if(nz)maxNonzeroPrefix=Math.max(maxNonzeroPrefix,d);
   if(d===n){fullLegal++;if(nz)fullNonzero++;if(job.name==='original-F'){let death=reach(entire,key(a,b,c,entire.length)),loc=death+13,page=null,offset=null;for(const p of gp.pages.slice(0,56)){if(loc<p.indices.length){page=p.page;offset=loc;break}loc-=p.indices.length}bookSurvivors.push({coef,bodyPrefix:death,bookLength:entire.length,firstFailurePage:page,firstFailureOffset:offset})}}
   if(d<prefix)continue;prefixLegal++;
   let ps=decode(job.c,k,job.hold,0,prefix),v=best(ps);
   if(!winner||v.l>winner.v.l)winner={coef,k,v,ps};
   if(d===n){
    let w=best(decode(job.c,k,job.hold,prefix,n,ps));
    if(!maxFull||w.l>maxFull.w.l)maxFull={coef,k,w};
   }
  }
  let z={name:job.name,hold:job.hold,keys:24389,prefixLegal,fullLegal,fullNonzero,maxNonzeroPrefix};
  if(winner){let w=best(decode(job.c,winner.k,job.hold,prefix,n,winner.ps));let p=w?read(w):null;let v=read(winner.v);z.selected={coef:winner.coef,prefixScore:winner.v.l/prefix,holdoutScore:w?(w.l-winner.v.l)/(n-prefix):null,complete:!!w,replay:!!w&&encode(p,winner.k,job.hold).every((x,i)=>x===job.c[i]),prefixPreview:v.slice(0,80).map(x=>gp.translit[x]).join(""),holdoutPreview:p?p.slice(prefix,prefix+80).map(x=>gp.translit[x]).join(""):null};if(job.p){z.selected.trueCoeff=job.coeff;z.selected.prefixCorrect=v.filter((x,i)=>x===job.p[i]).length;z.selected.holdoutCorrect=p?p.slice(prefix).filter((x,i)=>x===job.p[i+prefix]).length:0}}
  if(maxFull){let p=read(maxFull.w);z.retrospective={coef:maxFull.coef,score:maxFull.w.l/n,replay:encode(p,maxFull.k,job.hold).every((x,i)=>x===job.c[i]),preview:p.slice(0,100).map(x=>gp.translit[x]).join("")}}
  if(job.p)z.nativeScore=job.p.reduce((sum,p,i)=>sum+sc(i>1?job.p[i-2]:29,i?job.p[i-1]:29,p),0)/n;
  out.push(z)
 }
 return{seed,length:n,prefix,bookSurvivors,trainingSections:sol.sections.filter(s=>!withheld.includes(s.name)).map(s=>s.name),out}
}
const files=['resources/liber-primus/lp2-corpus.json','resources/external/relikd-solved-gp29-native-v1.json'];
console.log(JSON.stringify(run(...files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
