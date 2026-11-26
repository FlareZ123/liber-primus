'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
/** All-key disjoint latent-word capacity for a shared q8 additive cycle, arbitrary per-word translation, sign, phase and traversal. */
function capacity({donors,dict,rng,corpus},which="p40",hold=false){
 const q=8,thresholds=[9,10,11,12],base=29**(q-1),mod=x=>(x%29+29)%29;
 const list=Array.from({length:25},()=>[]);
 for(const s of dict.keys()){const p=s.split(",").map(Number),pos=p.map((_,i)=>i).filter(i=>!hold||p[i]!==0),f=hold?p.map((_,i)=>i).filter(i=>p[i]===0):[];if(pos.length<thresholds[0])continue;const a=pos.map(i=>p[i]);list[p.length].push({pos,f,a,delta:a.slice(q).map((x,i)=>mod(x-a[i]))});}
 function canon(a){let f=0,b=0;for(let i=0;i<q;i++){f=f*29+a[i];b=b*29+mod(-a[q-1-i]);}let m=Math.min(f,b);for(let j=1;j<q;j++){f=f%base*29+Math.floor(f/base);b=b%base*29+Math.floor(b/base);m=Math.min(m,f,b);}return Math.floor(m/29);}
 function digits(id){const a=Array(q);for(let i=q-2;i>=0;i--){a[i]=id%29;id=Math.floor(id/29);}a[q-1]=mod(-a.slice(0,q-1).reduce((s,x)=>s+x,0));return a;}
 function count(c,trueId=null){
 const maps=thresholds.map(()=>new Map()),tmp=Array(q),n=c.length;let tries=0,valid=0,accepted=0;
 for(let end=thresholds[0];end<=n;end++)for(let l=thresholds[0];l<=24&&l<=end;l++){const start=end-l;
  for(const {pos,f,a,delta} of list[l]){tries++;let ok=true;for(const j of f)if(c[start+j]!==0){ok=false;break;}if(!ok)continue;
   for(const sign of [1,-1]){let good=true;for(let j=0;j<delta.length;j++)if(mod(c[start+pos[j+q]]-c[start+pos[j]])!==mod(sign*delta[j])){good=false;break;}if(!good)continue;
    let sum=0;for(let j=0;j<q-1;j++){tmp[j]=mod(c[start+pos[j+1]]-c[start+pos[j]]-sign*(a[j+1]-a[j]));sum+=tmp[j];}tmp[q-1]=mod(-sum);const id=canon(tmp);valid++;
    for(let t=0;t<thresholds.length&&thresholds[t]<=a.length;t++){const m=maps[t],old=m.get(id)??0,last=old%(n+1),cnt=Math.floor(old/(n+1));if(start>=last){m.set(id,(cnt+1)*(n+1)+end);accepted++;}}
   }
  }
 }
 const bounds=maps.map((m,t)=>{let max=0,winner=0,tied=0;const hist={};for(const [id,v] of m){const c=Math.floor(v/(n+1));hist[c]=(hist[c]||0)+1;if(c>max){max=c;winner=id;tied=1;}else if(c===max)tied++;}const trueCount=trueId===null?null:Math.floor((m.get(trueId)??0)/(n+1));return {threshold:thresholds[t],keys:m.size,max,winner:digits(winner),tied,hist,trueCount,trueIsBest:trueId===null?null:trueCount===max};});
 return {n,tries,valid,accepted,bounds};
 }
 function floors(n,threshold){return donors.map((words,d)=>{let p=0;const e=[];for(const w of words){const start=p;p+=w.length;if(w.filter(x=>!hold||x!==0).length>=threshold&&dict.has(w.join(",")))e.push([start,p]);}let lo=0,hi=0,min=Infinity,minStart=0;for(let s=0;s+n<=p;s++){while(lo<e.length&&e[lo][0]<s)lo++;while(hi<e.length&&e[hi][1]<=s+n)hi++;const z=Math.max(0,hi-lo);if(z<min){min=z;minStart=s;}}return {donor:d,n,windows:p-n+1,min,minStart};});}
 if(which.startsWith("p")){const scopes={"p0":[0,2,13],"p3":[3,7,0],"p8":[8,14,0],"p15":[15,22,0],"p23":[23,26,0],"p27":[27,32,0],"p33":[33,39,0],"p40":[40,53,0],"p54":[54,55,9]};const [first,last,drop]=scopes[which],c=corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices).slice(drop),out=count(c);for(const b of out.bounds){b.refs=floors(c.length,b.threshold);b.gap=Math.min(...b.refs.map(x=>x.min))-b.max;}return {which,hold,scope:[first,last,drop],...out};}
 const d=Number(which),words=donors[d],start=Math.floor(words.length*.8)+400;let n=0,j=start;while(j<words.length&&n<3008)n+=words[j++].length;const found=words.slice(start,j);if(n<2500)throw Error("insufficient controls");
 const rnd=rng(0x29a82007+d+(hold?1000:0)),key=Array.from({length:q},()=>Math.floor(rnd()*29)),delta=key.map((x,i)=>mod(key[(i+1)%q]-x)),id=canon(delta);
 const c=found.flatMap(w=>{let r=Math.floor(rnd()*q);const sign=rnd()<.5?1:-1,b=Math.floor(rnd()*29),direction=rnd()<.5?1:-1;return w.map(p=>{if(hold&&p===0)return 0;const x=mod(sign*p+b+key[r]);r=(r+direction+q)%q;return x;});});
 const out=count(c,id);for(const b of out.bounds){b.truthCoveredLongWords=found.filter(w=>w.filter(x=>!hold||x!==0).length>=b.threshold&&dict.has(w.join(","))).length;if(b.trueCount<b.truthCoveredLongWords)throw Error("false capacity bound");b.refs=floors(c.length,b.threshold);}return {which,hold,truthCycle:digits(id),...out};
}
const which=process.argv[2]??'p40',hold=process.argv[3]==='hold';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>capacity(x,which,hold)),null,2));
