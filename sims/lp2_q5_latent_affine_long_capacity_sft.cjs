'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function affineCapacity({donors,dict,rng,corpus,latin},which="0",hold=false){
 const thresholds=[7,8,9,10],q=5,base=29**4,mod=x=>(x%29+29)%29,inv=Array(29).fill(0);
 for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(x*y%29===1){inv[x]=y;break;}
 const list=Array.from({length:25},()=>[]);for(const s of dict.keys()){
  const p=s.split(",").map(Number),pos=p.map((_,i)=>i).filter(i=>!hold||p[i]!==0),f=hold?p.map((_,i)=>i).filter(i=>p[i]===0):[];
  if(pos.length<7)continue;const a=pos.map(i=>p[i]),delta=a.slice(5).map((x,i)=>mod(x-a[i]));list[p.length].push({p,pos,f,a,delta});
 }
 function canon(a){let f=0,b=0;for(let i=0;i<q;i++){f=f*29+a[i];b=b*29+mod(-a[q-1-i]);}let m=Math.min(f,b);for(let j=1;j<q;j++){f=f%base*29+Math.floor(f/base);b=b%base*29+Math.floor(b/base);m=Math.min(m,f,b);}return Math.floor(m/29);}
 function digits(id){const a=Array(q);for(let i=3;i>=0;i--){a[i]=id%29;id=Math.floor(id/29);}a[4]=mod(-a[0]-a[1]-a[2]-a[3]);return a;}
 function count(c,trueId=null){
  const last=thresholds.map(()=>new Uint32Array(base)),counts=thresholds.map(()=>new Uint16Array(base)),tmp=new Int32Array(q);let tries=0,valid=0,accepted=0;
  for(let end=6;end<=c.length;end++)for(let l=6;l<=24&&l<=end;l++){
   const start=end-l;
   for(const {pos,f,a,delta} of list[l]){
    tries++;let ok=true;for(const j of f)if(c[start+j]!==0){ok=false;break;}if(!ok)continue;
    let scale=0;
    for(let j=0;j<delta.length;j++){const dp=delta[j],dc=mod(c[start+pos[j+5]]-c[start+pos[j]]);
     if(!dp){if(dc){ok=false;break;}}else{const s=dc*inv[dp]%29;if(!s||scale&&s!==scale){ok=false;break;}scale=s;}}
    if(!ok)continue;
    for(let k=scale||1;k<=(scale||28);k++){
     for(let j=0;j<q;j++)tmp[j]=mod(c[start+pos[j+1]]-c[start+pos[j]]-k*(a[j+1]-a[j]));
     const id=canon(tmp);valid++;
     for(let t=0;t<thresholds.length&&thresholds[t]<=a.length;t++)if(start>=last[t][id]){last[t][id]=end;counts[t][id]++;accepted++;}
    }
   }
  }
  const bounds=thresholds.map((threshold,t)=>{const c=counts[t];let max=0,keys=0,win=0;const hist={};for(let id=0;id<base;id++){const v=c[id];if(v){keys++;hist[v]=(hist[v]||0)+1;}if(v>max){max=v;win=id;}}const winners=[];for(let id=0;id<base;id++)if(c[id]===max&&winners.length<12)winners.push(digits(id));return {threshold,keys,max,winner:digits(win),winners,tied:hist[max]||0,hist,trueCount:trueId===null?null:c[trueId],trueIsBest:trueId===null?null:c[trueId]===max};});
  return {n:c.length,tries,valid,accepted,bounds};
 }
 function floors(n,threshold){return donors.map((words,d)=>{let p=0;const e=[];for(const w of words){const start=p;p+=w.length;if(w.filter(x=>!hold||x!==0).length>=threshold&&dict.has(w.join(",")))e.push([start,p]);}let lo=0,hi=0,min=Infinity,minStart=0;for(let s=0;s+n<=p;s++){while(lo<e.length&&e[lo][0]<s)lo++;while(hi<e.length&&e[hi][1]<=s+n)hi++;const z=Math.max(0,hi-lo);if(z<min){min=z;minStart=s;}}return {donor:d,n,windows:p-n+1,min,minStart};});}
 if(which.startsWith("p")){
  const scopes={"p0":[0,2,13],"p3":[3,7,0],"p8":[8,14,0],"p15":[15,22,0],"p23":[23,26,0],"p27":[27,32,0],"p33":[33,39,0],"p40":[40,53,0],"p54":[54,55,9]};
  const [first,last,drop]=scopes[which],c=corpus.pages.filter(p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices).slice(drop),out=count(c);for(const b of out.bounds){b.refs=floors(c.length,b.threshold);b.gap=Math.min(...b.refs.map(x=>x.min))-b.max;}
  return {which,hold,scope:[first,last,drop],...out};
 }
 const d=Number(which),words=donors[d];let found;for(let i=Math.floor(words.length*.8)+1700;i<words.length;i++){let n=0,j=i;while(j<words.length&&n<716)n+=words[j++].length;if(n===716){found=words.slice(i,j);break;}}if(!found)throw Error("no donor window");
 const rnd=rng(0x5a29d800+d+(hold?1000:0)),key=Array.from({length:q},()=>Math.floor(rnd()*29)),delta=key.map((x,i)=>mod(key[(i+1)%q]-x)),id=canon(delta);
 const c=found.flatMap(w=>{let r=Math.floor(rnd()*q);const a=1+Math.floor(rnd()*28),b=Math.floor(rnd()*29),direction=rnd()<.5?1:-1;return w.map(p=>{if(hold&&p===0)return 0;const x=mod(a*p+b+key[r]);r=(r+direction+q)%q;return x;});});
 const out=count(c,id);for(const b of out.bounds){b.truthCoveredLongWords=found.filter(w=>w.filter(x=>!hold||x!==0).length>=b.threshold&&dict.has(w.join(","))).length;if(b.trueCount<b.truthCoveredLongWords)throw Error("false capacity bound");b.refs=floors(c.length,b.threshold);}
 return {which,hold,truthCycle:digits(id),...out};
}
const which=process.argv[2]??'0',hold=process.argv[3]==='hold';
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,'utf8')),x=>affineCapacity(x,which,hold)),null,2));
