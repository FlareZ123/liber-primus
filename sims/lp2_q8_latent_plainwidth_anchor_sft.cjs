'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');

/** Exact shared-key long-word capacity with plaintext-dependent width, latent cuts and independent initial phases. */
function capacity({donors,dict,rng,corpus,latin},which='p40'){
 const q=8,base=29**(q-1),thresholds=[9,10,11,12],mod=x=>(x+29)%29;
 const list=Array.from({length:25},()=>[]);
 for(const s of dict.keys()){
  const p=s.split(',').map(Number),a=[],f=[];let t=0,mask=0;
  for(let i=0;i<p.length;i++){if(p[i]===0){f.push(i);continue;}a.push([i,p[i],t]);mask|=1<<t;t=(t+latin[p[i]].length)%q;}
  if(a.length>=9)list[p.length].push({a,f,mask});
 }
 function canonical(k){let v=0;for(const x of k)v=v*29+x;let best=v;for(let i=1;i<q;i++){v=(v%base)*29+Math.floor(v/base);best=Math.min(best,v);}return best;}
 function digits(v){const k=Array(q);for(let i=q-1;i>=0;i--){k[i]=v%29;v=Math.floor(v/29);}return k;}
 function count(c,trueKey=null){
  const n=c.length,maps=thresholds.map(()=>new Map()),k=new Int8Array(q);let tries=0,valid=0,completions=0;
  const masks={};
  for(let end=9;end<=n;end++)for(let l=9;l<=24&&l<=end;l++){
   const start=end-l;
   for(const {a,f,mask} of list[l]){
    tries++;let ok=true;for(const i of f)if(c[start+i]!==0){ok=false;break;}if(!ok)continue;
    k.fill(-1);
    for(const [i,p,t] of a){const x=mod(c[start+i]-p);if(k[t]!==-1&&k[t]!==x){ok=false;break;}k[t]=x;}
    if(!ok)continue;
    valid++;masks[mask]=(masks[mask]||0)+1;
    function expand(t){
     if(t===q){completions++;const id=canonical(k);for(let j=0;j<thresholds.length&&thresholds[j]<=a.length;j++){const m=maps[j],old=m.get(id)??0,last=old%(n+1),cnt=Math.floor(old/(n+1));if(start>=last)m.set(id,(cnt+1)*(n+1)+end);}return;}
     if(k[t]>=0){expand(t+1);return;}
     for(let x=0;x<29;x++){k[t]=x;expand(t+1);}k[t]=-1;
    }
    expand(0);
   }
  }
  const truthId=trueKey===null?null:canonical(trueKey);
  const bounds=maps.map((m,j)=>{let max=0,winner=0,tied=0;const hist={};for(const [id,v] of m){const cnt=Math.floor(v/(n+1));hist[cnt]=(hist[cnt]||0)+1;if(cnt>max){max=cnt;winner=id;tied=1;}else if(cnt===max)tied++;}const trueCount=truthId===null?null:Math.floor((m.get(truthId)??0)/(n+1));return {threshold:thresholds[j],keys:m.size,max,winner:digits(winner),tied,hist,trueCount,trueIsBest:truthId===null?null:trueCount===max};});
  return {n,tries,valid,completions,masks,bounds};
 }
 function floors(n,t){return donors.map((words,d)=>{let p=0;const eligible=[];for(const w of words){const s=p;p+=w.length;if(w.filter(x=>x!==0).length>=t&&dict.has(w.join(',')))eligible.push([s,p]);}let lo=0,hi=0,min=Infinity,minStart=0;for(let s=0;s+n<=p;s++){while(lo<eligible.length&&eligible[lo][0]<s)lo++;while(hi<eligible.length&&eligible[hi][1]<=s+n)hi++;const z=Math.max(0,hi-lo);if(z<min){min=z;minStart=s;}}return {donor:d,n,windows:p-n+1,min,minStart};});}
 if(which==='p40'){const c=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);if(c.length!==3008)throw Error('scope');const out=count(c);for(const b of out.bounds){b.refs=floors(c.length,b.threshold);b.gap=Math.min(...b.refs.map(x=>x.min))-b.max;}return {which,...out};}
 const d=Number(which),words=donors[d],start=Math.floor(words.length*.8)+400;let n=0,j=start;while(j<words.length&&n<3008)n+=words[j++].length;const found=words.slice(start,j);if(n<2500)throw Error('short control');
 const random=rng(0x29a82538+d),key=Array.from({length:q},()=>Math.floor(random()*29));let phase=Math.floor(random()*q);
 const continuous=d===0;
 const c=found.flatMap(w=>{if(!continuous)phase=Math.floor(random()*q);return w.map(p=>{if(p===0)return 0;const x=(p+key[phase])%29;phase=(phase+latin[p].length)%q;return x;});});
 const out=count(c,key);
 for(const b of out.bounds){b.truthCoveredLongWords=found.filter(w=>w.filter(x=>x!==0).length>=b.threshold&&dict.has(w.join(','))).length;if(b.trueCount<b.truthCoveredLongWords)throw Error('false capacity bound');b.refs=floors(c.length,b.threshold);}
 return {which,continuous,truthKey:digits(canonical(key)),...out};
}
module.exports={capacity};
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>capacity(x,process.argv[2]??'p40')),null,2));
