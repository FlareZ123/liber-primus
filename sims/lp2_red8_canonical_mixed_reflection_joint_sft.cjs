'use strict';
const fs=require('node:fs');
function joint(profile,native){
 const alphabet="0123456789abcdefghijklmnopqrs",idx=s=>Array.from(s,x=>alphabet.indexOf(x)),str=v=>v.map(x=>alphabet[x]).join(""),mod=x=>(x%29+29)%29;
 const K=idx(profile.p54.heading_groups[1]),c=idx(profile.p54.body_groups.join("")),h=idx(profile.p55.groups.join("")),map=new Map(native.runes.map((x,i)=>[x,i]));
 const u=Array(29).fill(0),b=Array(841).fill(0),bt=Array(29).fill(0),t=Array(24389).fill(0),tt=Array(841).fill(0);let n=0;
 for(const s of native.sections.filter(x=>!x.name.startsWith("p5"))){let v=Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x));for(let i=0;i<v.length;i++){const x=v[i];u[x]++;n++;if(i){b[29*v[i-1]+x]++;bt[v[i-1]]++;}if(i>=2){const y=29*v[i-2]+v[i-1];t[29*y+x]++;tt[y]++;}}}
 const S=Array(24389);for(let a=0;a<29;a++)for(let d=0;d<29;d++)for(let x=0;x<29;x++){let p=(u[x]+.5)/(n+14.5),q=(b[29*d+x]+8*p)/(bt[d]+8),j=29*a+d;S[29*j+x]=Math.log((t[29*j+x]+8*q)/(tt[j]+8));}
 const score=(p,start=2)=>p.slice(start).reduce((acc,x,k)=>{let i=k+start;return acc+S[841*p[i-2]+29*p[i-1]+x]},0);
 const inv=(x,j,a,r)=>mod((a<2?1:-1)*(x-(a%2?-K[j]:K[j])-(a>=2?r:0)));
 function histories(v,start,fn){const z=v.map((x,i)=>x===0?i:-1).filter(x=>x>=0);for(let bits=0;bits<2**z.length;bits++){let mask=z.filter((_,i)=>bits&(1<<i)),set=new Set(mask),p=start;let phases=v.map((_,i)=>{if(set.has(i))return -1;const j=p;p=(p+1)%8;return j;});fn(phases,p,mask);}}
 function replay(v,a,start,r){let j=start;return v.map(x=>{if(!x)return 0;const y=mod((a[j]<2?1:-1)*x+(a[j]%2?-K[j]:K[j])+(a[j]>=2?r:0));j=(j+1)%8;return y;});}
 let out=[];
 for(const r of [0,28]){let cand=[];for(let start=0;start<8;start++)histories(c,start,(ph,end,mask)=>{let allow=Array.from({length:8},()=>[0,1,2,3]);for(let i=0;i<c.length;i++)if(ph[i]>=0){let j=ph[i];allow[j]=allow[j].filter(a=>inv(c[i],j,a,r)!==0);if(!allow[j].length)return;}let a=Array(8);function dfs(j){if(j<8){for(const x of allow[j]){a[j]=x;dfs(j+1);}return;}const p=c.map((x,i)=>ph[i]<0?0:inv(x,ph[i],a[ph[i]],r));if(str(replay(p,a,start,r))!==str(c))throw Error("replay");cand.push({a:a.slice(),start,end,mask,p,fit:score(p)});}dfs(0);});
 cand.sort((a,b)=>b.fit-a.fit);let jointPaths=0,cont=0,bestFit=null,bestFull=null,all=[];
 for(let i=0;i<cand.length;i++){let x=cand[i],paths=0;histories(h,x.end,(ph,end,mask)=>{let p=h.map((v,i)=>ph[i]<0?0:inv(v,ph[i],x.a[ph[i]],r));if(p.some((v,i)=>v===0&&ph[i]>=0))return;if(str(replay(p,x.a,x.end,r))!==str(h))throw Error("held replay");paths++;jointPaths++;let heldScore=score(x.p.slice(-2).concat(p));let z={rank:i+1,a:x.a,start:x.start,end:x.end,fitMask:x.mask,heldMask:mask,fitMean:x.fit/221,heldMean:heldScore/76,fullMean:(x.fit+heldScore)/297,fitText:str(x.p),heldText:str(p)};if(bestFit===null||i+1<bestFit.rank||(i+1===bestFit.rank&&z.heldMean>bestFit.heldMean))bestFit=z;if(bestFull===null||z.fullMean>bestFull.fullMean)bestFull=z;all.push({rank:i+1,fitMean:z.fitMean,heldMean:z.heldMean,fullMean:z.fullMean});});if(paths)cont++;}
 out.push({r,trainingHistories:cand.length,continuableTrainingHistories:cont,jointPaths,bestTrainingRankWithContinuation:bestFit,bestRetrospectiveJointScore:bestFull,scoreRows:all});
 }return out;
}
console.log(JSON.stringify(joint(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-page-groups-54-55-derived.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
