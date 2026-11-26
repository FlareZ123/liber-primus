'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native){
 const M=113,origins=3301,pr=corpus.prime,arr=corpus.pages.map(p=>p.indices),starts=[0,3,8,15,23,27,33,40,54,56],offs=[13,16,12,20,16,19,10,8,9];
 const chapters=starts.slice(0,-1).map((p,i)=>({page:p,c:arr.slice(p,starts[i+1]).flat().slice(offs[i]),cut:arr[p].length-offs[i]}));
 const nat=native.sections.map(x=>({name:x.name,p:[...x.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)}));
 if(pr.length!==29||pr[28]!==109||arr.slice(0,56).flat().length!==12956||chapters.map(x=>x.c.length).join()!=="716,1129,1717,1883,1005,1414,1670,3000,299")throw Error("source dimensions");
 const max=origins+Math.max(...chapters.map(x=>x.c.length))+2;
 const primes=[];const sieve=new Uint8Array(100000);for(let n=2;n<sieve.length&&primes.length<max;n++)if(!sieve[n]){primes.push(n);for(let k=n*n;k<sieve.length;k+=n)sieve[k]=1}
 if(primes.length<max||primes.slice(0,29).join()!==pr.join()||primes[29]!==113)throw Error("prime chart");
 const steps=primes.map(p=>(p-1)%M),idx=Array(M).fill(-1);pr.forEach((p,i)=>idx[p]=i);
 const enc=[],dec=[];for(let k=0;k<M;k++){let row=[],rev=[];for(let p=0;p<29;p++){let x=pr[p];do{x=(x+k)%M}while(idx[x]<0);row[p]=idx[x];rev[row[p]]=p}if(new Set(row).size!==29)throw Error("not permutation");enc.push(row);dec.push(rev)}
 for(let k=0;k<M;k++)for(let p=0;p<29;p++)if(dec[k][enc[k][p]]!==p)throw Error("inverse table");
 function encode(p,s,hold){let c=[];for(const v of p){if(hold&&v===0)c.push(0);else c.push(enc[steps[s++]][v])}return c}
 const real=nat.find(x=>x.name==="p56_an_end").p;let j=0;if(real.map(p=>p===0?0:(p+primes[j++]-1)%29).join()!==arr[56].join()||j!==84||nat.find(x=>x.name==="p57_parable").p.join()!==arr[57].join())throw Error("historic control");
 function model(exclude){
  const uni=new Float64Array(29).fill(1),bi=new Float64Array(29**2),bc=new Float64Array(29),tri=new Float64Array(29**3),tc=new Float64Array(29**2);
  for(const n of nat)if(n.name!==exclude)for(let i=0;i<n.p.length;i++){const p=n.p[i];uni[p]++;if(i>=1){const b=n.p[i-1];bi[b*29+p]++;bc[b]++;if(i>=2){const a=n.p[i-2];tri[(a*29+b)*29+p]++;tc[a*29+b]++}}}
  const u=uni.reduce((s,x)=>s+x,0),w=new Float64Array(30*30*29);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<29;p++){let v=uni[p]/u;if(b!==29)v=(bi[b*29+p]+10*v)/(bc[b]+10);if(a!==29&&b!==29)v=(tri[(a*29+b)*29+p]+10*v)/(tc[a*29+b]+10);w[(a*30+b)*29+p]=Math.log(v)}return w;
 }
 const inv=(s,c)=>dec[steps[s]][c];
 /** Exact Viterbi. State (s,h1,h2) includes next prime ordinal and hold flags of previous two physical runes. */
 function solve(c,w,hold,lo,hi,initial=null){
  if(!hold){
   let best=null;const seeds=initial?[initial.s]:Array.from({length:origins},(_,s)=>s);
   for(const s of seeds){let a=lo>=2&&initial?inv(s-2,c[lo-2]):29,b=lo>=1&&initial?inv(s-1,c[lo-1]):29,score=0;for(let i=lo;i<hi;i++){const p=inv(s+i-lo,c[i]);score+=w[(a*30+b)*29+p];a=b;b=p}if(best===null||score>best.total)best={start:s,s:s+hi-lo,mask:0,total:score}}
   best.p=c.slice(lo,hi).map((v,i)=>inv(best.start+i,v));best.score=best.total/(hi-lo);if(encode(best.p,best.start,false).join()!==c.slice(lo,hi).join())throw Error("ordinary replay");return {best,prefix:hi-lo,ends:seeds.length};
  }
  const cap=4*(origins+c.length+2);let cur=new Float64Array(cap).fill(-Infinity),nxt=new Float64Array(cap).fill(-Infinity),active=[],parents=[];
  if(initial){const k=initial.s*4+initial.mask;cur[k]=0;active.push(k)}else for(let s=0;s<origins;s++){cur[s*4]=0;active.push(s*4)}
  let i=lo,peak=active.length;
  for(;i<hi;i++){
   const par=new Uint8Array(cap),act=[];
   for(const k of active){const s=k>>2,m=k&3,h=m&1;
    const b=i===lo&&!initial||i===0?29:h?0:inv(s-1,c[i-1]);
    const a=i-lo<2&&!initial||i<2?29:(m&2)?0:inv(s-2+h,c[i-2]);
    const v=c[i],add=(p,t,m2)=>{const z=cur[k]+w[(a*30+b)*29+p],k2=t*4+m2;if(nxt[k2]===-Infinity)act.push(k2);if(z>nxt[k2]){nxt[k2]=z;par[k2]=m}};
    if(v===0)add(0,s,(h<<1)|1);
    const p=inv(s,v);if(p!==0)add(p,s+1,h<<1);
   }
   if(!act.length)return {best:null,prefix:i-lo,ends:0,peak};
   parents.push(par);for(const k of active)cur[k]=-Infinity;[cur,nxt]=[nxt,cur];active=act;peak=Math.max(peak,active.length);
  }
  let k=active[0];for(const k2 of active)if(cur[k2]>cur[k])k=k2;
  const end=k,score=cur[k],p=[];for(let i=hi-1;i>=lo;i--){let s=k>>2,m=k&3,holdLast=m&1,previous=s-(1-holdLast);p.push(holdLast?0:inv(previous,c[i]));k=previous*4+parents[i-lo][k]}p.reverse();
  const best={start:k>>2,s:end>>2,mask:end&3,p,total:score,score:score/(hi-lo)};
  if(encode(p,best.start,true).join()!==c.slice(lo,hi).join())throw Error("hold replay");return {best,prefix:hi-lo,ends:new Set(active.map(k=>k>>2)).size,peak};
 }
 function run(c,cut,hold,w){const fit=solve(c,w,hold,0,cut),held=fit.best?solve(c,w,hold,cut,c.length,fit.best):null,full=solve(c,w,hold,0,c.length);return {fit,held,full}}
 const compact=x=>x?{prefix:x.prefix,ends:x.ends,peak:x.peak,best:x.best?{...x.best,preview:x.best.p.slice(0,100).map(p=>corpus.translit[p]).join("")}:null}:null;
 const out={method:"GPprime residues in F113; first-return addition of p_j-1; 3301 initial prime ordinals",primes:pr,primeField:M,origins,tablePermutationChecks:M*29,authenticP56:85,authenticP57:95,controls:[],original:[]};
 for(const hold of [true,false]){
  for(let j=0;j<nat.length;j++){const n=nat[j],seed=(1033+137*j)%origins,c=encode(n.p,seed,hold),cut=Math.floor(c.length/2),w=model(n.name),r=run(c,cut,hold,w);out.controls.push({hold,name:n.name,seed,selected:r.fit.best?.start??null,fitCorrect:r.fit.best?.p.filter((p,i)=>p===n.p[i]).length??0,fitLength:cut,heldCorrect:r.held?.best?.p.filter((p,i)=>p===n.p[i+cut]).length??0,heldLength:n.p.length-cut,heldScore:r.held?.best?.score??null,fullCorrect:r.full.best?.p.filter((p,i)=>p===n.p[i]).length??0,n:n.p.length})}
  const w=model(null);
  for(const {page,c,cut} of chapters){const r=run(c,cut,hold,w);out.original.push({hold,page,n:c.length,cut,fit:compact(r.fit),held:compact(r.held),full:compact(r.full)})}
 }
 return out;
}
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(load('resources/liber-primus/lp2-corpus.json'),load('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
