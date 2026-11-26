'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');

function privatePrime({donors,dict,rng,corpus,latin},which='p40',hold=false){
 const mod=x=>(x%29+29)%29, thresholds=[7,8,9,10,11], min=7, originCount=3301;
 const primes=[];for(let n=2;primes.length<originCount+24;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)primes.push(n);}
 const variants=[];
 for(let o=0;o<originCount;o++)for(const d of [1,-1])for(const sign of [1,-1]){
  if(o+23*d<0)continue; // boundary origins for reverse are added with their actual available length below.
  variants.push({o,d,sign,k:Array.from({length:24},(_,i)=>mod(sign*(primes[o+d*i]-1)))});
 }
 for(let o=0;o<23;o++)for(const sign of [1,-1])variants.push({o,d:-1,sign,k:Array.from({length:o+1},(_,i)=>mod(sign*(primes[o-i]-1)))});
 const index=new Map();let routes=0;
 for(const v of variants){if(v.k.length<min)continue;const delta=v.k.slice(1).map((x,i)=>mod(x-v.k[i]));let key=0;for(let i=0;i<min-1;i++)key=29*key+delta[i];let b=index.get(key);if(!b)index.set(key,b=[]);b.push({...v,delta});routes++;}
 const words=Array.from({length:25},()=>[]);
 for(const s of dict.keys()){
  const p=s.split(',').map(Number),pos=p.map((_,i)=>i).filter(i=>!hold||p[i]!==0),zeros=hold?p.map((_,i)=>i).filter(i=>p[i]===0):[];
  if(pos.length<min)continue;const a=pos.map(i=>p[i]),dp=a.slice(1).map((x,i)=>mod(x-a[i]));words[p.length].push({p,pos,zeros,dp});
 }
 function count(c,truth=null){
  const counts=thresholds.map(()=>0),last=thresholds.map(()=>0),paths=thresholds.map(()=>[]),anchorByLength={},candidates=[],delta=new Uint8Array(23);
  let comparisons=0,compatible=0,uniqueIntervals=0;
  for(let end=min;end<=c.length;end++)for(let l=min;l<=24&&l<=end;l++){
   const start=end-l;let maxActive=0,match=null,wordHits=0;
   for(const w of words[l]){
    comparisons++;if(w.zeros.some(i=>c[start+i]!==0))continue;
    for(const s of [1,-1]){
     let key=0;for(let j=0;j<min-1;j++){delta[j]=mod(c[start+w.pos[j+1]]-c[start+w.pos[j]]-s*w.dp[j]);key=key*29+delta[j];}
     const v=index.get(key);if(!v)continue;
     for(let j=min-1;j<w.dp.length;j++)delta[j]=mod(c[start+w.pos[j+1]]-c[start+w.pos[j]]-s*w.dp[j]);
     for(const r of v){if(r.delta.length<w.dp.length)continue;let ok=true;for(let j=min-1;j<w.dp.length;j++)if(r.delta[j]!==delta[j]){ok=false;break;}if(!ok)continue;
      compatible++;const b=mod(c[start+w.pos[0]]-s*w.p[w.pos[0]]-r.k[0]);let j=0;for(let i=0;i<w.p.length;i++){const x=hold&&w.p[i]===0?0:mod(s*w.p[i]+b+r.k[j++]);if(x!==c[start+i])throw Error('prime origin replay failure');}
      const hit={start,end,p:w.p,text:w.p.map(x=>latin[x]).join(''),active:w.pos.length,origin:r.o,d:r.d,sign:r.sign,plainSign:s,b};wordHits++;
      if(w.pos.length>maxActive){maxActive=w.pos.length;match=hit;}if(candidates.length<2000&&w.pos.length>=9)candidates.push(hit);
     }
    }
   }
   if(!match)continue;uniqueIntervals++;anchorByLength[maxActive]=(anchorByLength[maxActive]||0)+1;
   for(let t=0;t<thresholds.length;t++)if(maxActive>=thresholds[t]&&start>=last[t]){last[t]=end;counts[t]++;paths[t].push(match);}
  }
  return {n:c.length,comparisons,compatible,uniqueIntervals,anchorByLength,counts,paths,candidates,originCount,routes,indexSize:index.size};
 }
 function floors(n,t){return donors.map((words,d)=>{let p=0;const e=[];for(const w of words){const start=p;p+=w.length;if(w.filter(x=>!hold||x!==0).length>=t&&dict.has(w.join(',')))e.push([start,p]);}let lo=0,hi=0,min=Infinity;for(let s=0;s+n<=p;s++){while(lo<e.length&&e[lo][0]<s)lo++;while(hi<e.length&&e[hi][1]<=s+n)hi++;min=Math.min(min,Math.max(0,hi-lo));}return {d,windows:p-n+1,min};});}
 if(which.startsWith('p')){
  const scopes={p0:[0,2,13],p3:[3,7,0],p8:[8,14,0],p15:[15,22,0],p23:[23,26,0],p27:[27,32,0],p33:[33,39,0],p40:[40,53,0],p54:[54,55,9]};
  const [first,last,drop]=scopes[which],c=corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices).slice(drop),out=count(c);
  return {which,hold,...out,bounds:thresholds.map((t,i)=>{const refs=floors(c.length,t);return {threshold:t,max:out.counts[i],refs,gap:Math.min(...refs.map(x=>x.min))-out.counts[i]};})};
 }
 const d=Number(which),wordsD=donors[d];let found;for(let i=Math.floor(wordsD.length*.8)+400;i<wordsD.length;i++){let n=0,j=i;while(j<wordsD.length&&n<716)n+=wordsD[j++].length;if(n===716){found=wordsD.slice(i,j);break;}}if(!found)throw Error('no held donor span');
 const rnd=rng(0x29c37001+d+(hold?1000:0)),truth=[],c=[];let at=0;
 for(const p of found){const route=variants[Math.floor(rnd()*variants.length)];if(route.k.length<p.length){route.k=Array.from({length:24},(_,i)=>mod(route.sign*(primes[i]-1)));route.o=0;route.d=1;}const s=rnd()<.5?1:-1,b=Math.floor(rnd()*29);let j=0;
  c.push(...p.map(x=>hold&&x===0?0:mod(s*x+b+route.k[j++])));
  truth.push({start:at,end:at+p.length,p,active:p.filter(x=>!hold||x!==0).length,origin:route.o,d:route.d,sign:route.sign,plainSign:s,b});at+=p.length;}
 const out=count(c),covered=thresholds.map(t=>truth.filter(w=>w.active>=t&&dict.has(w.p.join(','))).length);
 if(out.counts.some((x,i)=>x<covered[i]))throw Error('capacity lost true anchors');
 const eligible=truth.filter(w=>w.active>=9&&dict.has(w.p.join(','))),recovered=eligible.filter(w=>out.candidates.some(x=>x.start===w.start&&x.end===w.end&&x.p.join(',')===w.p.join(',')&&x.origin===w.origin&&x.d===w.d&&x.sign===w.sign&&x.plainSign===w.plainSign&&x.b===w.b)).length;
 return {which,hold,...out,covered,longTruth:eligible.length,longExact:recovered,truth};
}
const which=process.argv[2]??'p40',hold=process.argv[3]==='hold';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>privatePrime(x,which,hold)),null,2));
