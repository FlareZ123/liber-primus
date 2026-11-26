'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
/** Exact lexical word marginal for a fixed projective q5 cycle, latent boundaries. */
function projectiveDecode({dict,latin},cipher,key,hold){
 const q=key.length,mod=x=>(x%29+29)%29,inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1){inv[a]=b;break;}
 function projector(k){const j=k.findIndex(x=>x!==k[0]);if(j<0)return {j,project:v=>v.slice(1).map(x=>mod(x-v[0])),slope:()=>0};const scale=inv[mod(k[j]-k[0])];return {j,project:v=>v.map((x,i)=>mod(x-v[0]-(v[j]-v[0])*mod(k[i]-k[0])*scale)).filter((_,i)=>i!==0&&i!==j),slope:v=>mod((v[j]-v[0])*scale)};}
 function shape(v){const z=v.find(x=>x!==0);return {id:z===undefined?"z":v.map(x=>x*inv[z]%29).join(","),first:z??0};}
 const groups=Array.from({length:25},()=>new Map()),words=[];let total=0;for(const v of dict.values())total+=v;
 for(const [s,w] of dict){const p=s.split(",").map(Number),mask=hold?p.reduce((m,x,i)=>m+(x===0?2**i:0),0):0,pos=p.map((_,i)=>i).filter(i=>!(mask&(1<<i))),a=pos.map(i=>p[i]);let g=groups[p.length].get(mask);if(!g){g={pos,words:[],variants:[]};groups[p.length].set(mask,g);}const id=words.length;words.push({p,prob:.95*w/total});g.words.push({id,a});}
 let tables=0,entries=0;
 for(const gs of groups)for(const g of gs.values()){const m=g.pos.length;if(!m)continue;const variants=new Map();for(const d of [1,-1])for(let r=0;r<q;r++){const k=Array.from({length:m},(_,i)=>key[(r+d*(i%q)+q)%q]),id=k.join(",");let v=variants.get(id);if(v){v.mult++;continue;}const pr=projector(k),table=new Map();for(const {id,a} of g.words){const {id:sh,first}=shape(pr.project(a)),slope=pr.slope(a);let bucket=table.get(sh);if(!bucket){bucket=[];table.set(sh,bucket);}bucket.push({id,first,slope});entries++;}variants.set(id,{pr,table,mult:1});tables++;}g.variants=[...variants.values()];}
 const denom=2*q*29*28*28, n=cipher.length,fw=Array(n+1).fill(-Infinity),best=fw.slice(),prev=Array(n+1);fw[0]=best[0]=0;const lse=(x,y)=>x===-Infinity?y:y===-Infinity?x:Math.max(x,y)+Math.log1p(Math.exp(-Math.abs(x-y)));
 for(let i=0;i<n;i++){if(fw[i]===-Infinity)continue;let zeros=0;for(let l=1;l<=24&&i+l<=n;l++){if(hold&&cipher[i+l-1]===0)zeros|=1<<(l-1);const candidates=new Map();let fallback=0;
  for(let mask=zeros;;mask=(mask-1)&zeros){const g=groups[l].get(mask);if(g){const v=g.pos.map(j=>cipher[i+j]);if(!v.length){for(const {id} of g.words)candidates.set(id,denom);}else for(const {pr,table,mult} of g.variants){const {id:sh,first}=shape(pr.project(v)),cs=pr.slope(v);for(const e of table.get(sh)??[]){let count=0;if(first){const a=first*inv[e.first]%29;if(pr.j<0)count=28;else if(mod(cs-a*e.slope)!==0)count=1;}else if(pr.j<0)count=28*28;else if(e.slope===0)count=cs===0?0:28;else count=cs===0?28:27;if(count)candidates.set(e.id,(candidates.get(e.id)??0)+count*mult);}}}if(mask===0)break;}
  let mass=0,max=0,chosen=null;for(const [id,count] of candidates){const w=words[id],p=w.prob*count/denom;mass+=p;if(p>max){max=p;chosen=w.p;}}
  if(l===1){const c=cipher[i];fallback=hold?.05*(28/(29*29)+(c===0?1/29:0)):.05/29;mass+=fallback;const p=hold&&c===0?.05/29:.05/(29*29);if(p>max){max=p;chosen=[hold&&c===0?0:18];}}
  if(mass>0){const j=i+l;fw[j]=lse(fw[j],fw[i]+Math.log(mass));if(max>0&&best[i]+Math.log(max)>best[j]){best[j]=best[i]+Math.log(max);prev[j]={i,p:chosen,prob:max};}}
 }}
 const out=[];for(let j=n;j>0;){const e=prev[j];if(!e)throw Error("no MAP path");out.unshift(e.p);j=e.i;}
 return {n,score:fw[n]/n,map:best[n]/n,plain:out.flat(),text:out.map(p=>p.map(x=>latin[x]).join("")).join(" "),tables,entries};
}
function experiment(env,mode,hold){
 const {corpus,donors,rng}=env,mod=x=>(x%29+29)%29,key=[0,1,5,19,23],q=5,n=675;
 if(mode==="original"){const c=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices).slice(54);if(c.length!==n)throw Error("source length");return {mode,hold,key,output:projectiveDecode(env,c,key,hold)};}
 const d=Number(mode),words=donors[d],start=Math.floor(words.length*.8)+2600;let found=null;for(let i=start;i<words.length;i++){let m=0,j=i;while(j<words.length&&m<n)m+=words[j++].length;if(m===n){found=words.slice(i,j);break;}}if(!found)throw Error("no held exact span");
 const rand=rng(0x29b50700+d+(hold?1000:0)),k=Array.from({length:q},()=>Math.floor(rand()*29)),truth=found.flat(),c=found.flatMap(w=>{let r=Math.floor(rand()*q);const a=1+Math.floor(rand()*28),b=Math.floor(rand()*29),t=1+Math.floor(rand()*28),dir=rand()<.5?1:-1;return w.map(p=>{if(hold&&!p)return 0;const v=mod(a*p+b+t*k[r]);r=(r+dir+q)%q;return v;});}),pad=truth.map(x=>mod(x+Math.floor(rand()*29)));
 const positive=projectiveDecode(env,c,k,hold),wrong=projectiveDecode(env,c,key,hold),negative=projectiveDecode(env,pad,k,hold);
 return {mode,hold,key:k,positive:{...positive,accuracy:positive.plain.filter((x,i)=>x===truth[i]).length/n},wrong,negative};
}
const mode=process.argv[2]??"original",hold=process.argv[3]==="hold";
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),env=>experiment(env,mode,hold)),null,2));
