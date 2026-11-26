'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native){
 const N=3301,keys=[];for(let a=0;a<29;a++)keys.push([a]);for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)keys.push([a,b]);const W=Math.ceil(keys.length/32),mask=Array.from({length:29},()=>new Uint32Array(W));
 keys.forEach((h,i)=>h.forEach(p=>mask[p][i>>5]|=1<<(i&31)));
 const all=new Uint32Array(W).fill(0xffffffff);all[W-1]=2**(keys.length%32)-1;
 const arr=corpus.pages.map(p=>p.indices),starts=[0,3,8,15,23,27,33,40,54,56],off=[13,16,12,20,16,19,10,8,9];
 const chapters=starts.slice(0,-1).map((p,i)=>({page:p,c:arr.slice(p,starts[i+1]).flat().slice(off[i]),cut:arr[p].length-off[i]}));
 const nat=native.sections.map(x=>({name:x.name,p:[...x.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)}));
 if(keys.length!==435||corpus.translit[0]!=="F"||corpus.translit[18]!=="E"||arr.slice(0,56).flat().length!==12956||chapters.map(x=>x.c.length).join()!=="716,1129,1717,1883,1005,1414,1670,3000,299")throw Error("source");
 const primes=[],sieve=new Uint8Array(100000),max=N+Math.max(...chapters.map(x=>x.c.length))+2;for(let n=2;n<sieve.length&&primes.length<max;n++)if(!sieve[n]){primes.push(n);for(let k=n*n;k<sieve.length;k+=n)sieve[k]=1}const step=primes.map(p=>(p-1)%29);if(primes.length<max||primes.slice(0,29).join()!==corpus.prime.join())throw Error("primes");
 const inv=(s,c)=>(c-step[s]+29)%29;
 function encode(p,s,key){const h=new Set(key);return p.map(x=>h.has(x)?x:(x+step[s++])%29)}
 const actual=nat.find(x=>x.name==="p56_an_end");if(encode(actual.p,0,[0]).join()!==arr[56].join()||actual.p.filter(x=>x!==0).length!==84||nat.find(x=>x.name==="p57_parable").p.join()!==arr[57].join())throw Error("authentic controls");
 function analyze(c,cut){
  const cap=N+c.length+2;let cur=new Uint32Array(cap*W),next=new Uint32Array(cap*W);for(let s=0;s<N;s++)cur.set(all,s*W);let lo=0,hi=N-1,last=0,prefix=null,full=null;
  function collect(){const a=new Uint32Array(W);let ns=0;for(let s=lo;s<=hi;s++){let nz=0;for(let w=0;w<W;w++){const x=cur[s*W+w];a[w]|=x;nz|=x}if(nz)ns++}return {ordinals:ns,keys:keys.map((h,i)=>a[i>>5]&(1<<(i&31))?i:-1).filter(i=>i>=0)}}
  for(let i=0;i<c.length;i++){
   const v=c[i],hc=mask[v];next.fill(0);let nlo=cap,nhi=-1;
   for(let s=lo;s<=hi;s++){const p=inv(s,v),hp=mask[p],o=s*W;let hs=0,cs=0;for(let w=0;w<W;w++){const x=cur[o+w];if(!x)continue;const a=x&hc[w],b=x&~hp[w];if(a){next[o+w]|=a;hs|=a}if(b){next[o+W+w]|=b;cs|=b}}if(hs){nlo=Math.min(nlo,s);nhi=Math.max(nhi,s)}if(cs){nlo=Math.min(nlo,s+1);nhi=Math.max(nhi,s+1)}}
   if(nhi<0)break;[cur,next]=[next,cur];lo=nlo;hi=nhi;last=i+1;if(last===cut)prefix=collect();
  }
  if(last===c.length)full=collect();return {last,prefix,full};
 }
 function model(exclude){
  const uni=new Float64Array(29).fill(1),bi=new Float64Array(29**2),bc=new Float64Array(29),tri=new Float64Array(29**3),tc=new Float64Array(29**2);
  for(const n of nat)if(n.name!==exclude)for(let i=0;i<n.p.length;i++){const p=n.p[i];uni[p]++;if(i>=1){const b=n.p[i-1];bi[b*29+p]++;bc[b]++;if(i>=2){const a=n.p[i-2];tri[(a*29+b)*29+p]++;tc[a*29+b]++}}}
  const u=uni.reduce((s,x)=>s+x,0),w=new Float64Array(30*30*29);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){let v=uni[p]/u;if(b!==29)v=(bi[b*29+p]+10*v)/(bc[b]+10);if(a!==29&&b!==29)v=(tri[(a*29+b)*29+p]+10*v)/(tc[a*29+b]+10);w[(a*30+b)*29+p]=Math.log(v)}return w;
 }
 function solve(c,w,id,lo,hi,initial=null,trace=false){
  const h=new Uint8Array(29);for(const p of keys[id])h[p]=1;
  const cap=4*(N+c.length+2);let cur=new Float64Array(cap).fill(-Infinity),nxt=new Float64Array(cap).fill(-Infinity),active=[],parents=[];
  if(initial){const k=initial.s*4+initial.mask;cur[k]=0;active.push(k)}else for(let s=0;s<N;s++){cur[s*4]=0;active.push(s*4)}
  for(let i=lo;i<hi;i++){
   const par=trace?new Uint8Array(cap):null,act=[],v=c[i],hold=h[v];
   for(const k of active){const s=k>>2,m=k&3,flag=m&1;
    const b=(i===lo&&!initial)||i===0?29:flag?c[i-1]:inv(s-1,c[i-1]);
    const a=(i-lo<2&&!initial)||i<2?29:(m&2)?c[i-2]:inv(s-2+flag,c[i-2]);
    const base=(a*30+b)*29,z=cur[k],p=inv(s,v);
    if(hold){const k2=s*4+(flag<<1)+1,score=z+w[base+v];if(nxt[k2]===-Infinity)act.push(k2);if(score>nxt[k2]){nxt[k2]=score;if(trace)par[k2]=m}}
    if(!h[p]){const k2=(s+1)*4+(flag<<1),score=z+w[base+p];if(nxt[k2]===-Infinity)act.push(k2);if(score>nxt[k2]){nxt[k2]=score;if(trace)par[k2]=m}}
   }
   if(!act.length)return null;
   if(trace)parents.push(par);for(const k of active)cur[k]=-Infinity;[cur,nxt]=[nxt,cur];active=act;
  }
  let k=active[0];for(const k2 of active)if(cur[k2]>cur[k])k=k2;const end=k,score=cur[k],p=[];
  const out={id,key:keys[id],s:end>>2,mask:end&3,total:score,score:score/(hi-lo)};
  if(trace){for(let i=hi-1;i>=lo;i--){const s=k>>2,m=k&3,flag=m&1,previous=s-(1-flag);p.push(flag?c[i]:inv(previous,c[i]));k=previous*4+parents[i-lo][k]}p.reverse();out.start=k>>2;out.p=p;out.preview=p.slice(0,100).map(x=>corpus.translit[x]).join("");if(encode(p,out.start,keys[id]).join()!==c.slice(lo,hi).join())throw Error("replay")}
  return out;
 }
 function rank(c,w,ids,lo,hi){const ranked=[];for(const id of ids){const a=solve(c,w,id,lo,hi);if(!a)throw Error("bitset inconsistency");ranked.push(a)}ranked.sort((a,b)=>b.total-a.total||a.id-b.id);const best=ranked.length?solve(c,w,ranked[0].id,lo,hi,null,true):null;return {best,ranked:ranked.map(x=>({id:x.id,key:x.key,score:x.score,s:x.s}))}}
 function attempt(c,cut,w,feas){
  const fit=feas.prefix?rank(c,w,feas.prefix.keys,0,cut):null,held=fit?.best?solve(c,w,fit.best.id,cut,c.length,fit.best,true):null,full=feas.full?rank(c,w,feas.full.keys,0,c.length):null;
  return {fit,held,full};
 }
 const out={keys,origins:N,actualControl:85,original:[],controls:[]};
 for(const {page,c,cut} of chapters){const f=analyze(c,cut);out.original.push({page,n:c.length,cut,...f,decoded:f.full?attempt(c,cut,model(null),f):null})}
 const cases=[{name:actual.name,seed:0,key:[0],cut:60,authentic:true},{name:"0_welcome",seed:1033,key:[18]},{name:"0_koan_1",seed:137,key:[0,18]},{name:"jpg107-167",seed:3300,key:[10,24]}];
 for(const test of cases){const donor=nat.find(x=>x.name===test.name);if(!donor)throw Error("donor "+test.name);const c=encode(donor.p,test.seed,test.key),cut=test.cut??Math.floor(c.length/2),feas=analyze(c,cut),r=attempt(c,cut,model(test.name),feas);if(!feas.full?.keys.some(id=>keys[id].join()===test.key.join()))throw Error("control feasibility");
  out.controls.push({...test,n:c.length,cut,prefixCandidates:feas.prefix.keys.length,fullCandidates:feas.full.keys.length,fitKey:r.fit.best.key,fitSeed:r.fit.best.start,fitCorrect:r.fit.best.p.filter((x,i)=>x===donor.p[i]).length,heldCorrect:r.held?.p.filter((x,i)=>x===donor.p[i+cut]).length??0,heldLength:c.length-cut,heldScore:r.held?.score??null,fullKey:r.full.best.key,fullSeed:r.full.best.start,fullCorrect:r.full.best.p.filter((x,i)=>x===donor.p[i]).length,fitRankTrue:r.fit.ranked.findIndex(x=>x.key.join()===test.key.join())+1,fullRankTrue:r.full.ranked.findIndex(x=>x.key.join()===test.key.join())+1})}
 return out;
}
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(load('resources/liber-primus/lp2-corpus.json'),load('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
