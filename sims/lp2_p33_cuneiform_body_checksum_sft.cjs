"use strict";
/** Original p33 cuneiform checksum receiver; run node sims/lp2_p33_cuneiform_body_checksum_sft.cjs */
const fs=require("node:fs"),path=require("node:path");
function run(gp,transcription){
 const need=(v,msg)=>{if(!v)throw Error(msg)};
 const mod=x=>(x%29+29)%29,prime=gp.prime,alphabet=new Map(gp.runes.map((x,i)=>[x,i])),enc=s=>[...s].filter(x=>alphabet.has(x)).map(x=>alphabet.get(x)),sum=P=>P.reduce((v,p)=>v+prime[p],0),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const pages=transcription.replace(/\r/g,"").split("\n%\n").map(s=>s.replace(/[\s/]/g,""));
 const [u0,l0]=pages[33].split("&"),u=enc(u0.slice(u0.indexOf(".")+1)),l=enc(l0.slice(l0.indexOf(".")+1)),carry=enc(pages[34].slice(0,pages[34].indexOf(".")+1));
 const p33=gp.pages.find(x=>x.page===33).indices,p34=gp.pages.find(x=>x.page===34).indices;
 need(u.length===81&&l.length===115&&carry.length===10&&eq(u,p33.slice(10,91))&&eq(l,p33.slice(99))&&eq(carry,p34.slice(0,10)),"p33/p34 source boundary");
 need(enc(u0.slice(0,u0.indexOf("."))).length===10&&enc(l0.slice(0,l0.indexOf("."))).length===8,"rubric lengths");
 function forward(P,key,hold){
  let j=0;return P.map(p=>{if(hold&&p===0)return 0;let [a,b]=key[j++%key.length],inv=1;while(mod(inv*a)!==1)inv++;return mod(inv*(p-b))});
 }
 function solve(C,q,mode,hold,target){
  const z=C.map((v,i)=>v===0?i:-1).filter(i=>i>=0),zi=new Map(z.map((i,j)=>[i,j]));need(z.length<20,"mask bound");
  const As=mode==="affine"?Array.from({length:28},(_,i)=>i+1):[mode==="reflected"?28:1];
  let min=Infinity,max=-Infinity,permMin=Infinity,legal=0n,hitCount=0n,hitMasks=0,minWitness=null,hitWitness=null,validMasks=0;
  function witness(mask,key){
   let j=0;const P=C.map((c,i)=>zi.has(i)&&(mask&(1<<zi.get(i)))?0:mod(key[j%q][0]*c+key[j++%q][1]));
   need(!hold||P.every((p,i)=>(p===0)===(zi.has(i)&&Boolean(mask&(1<<zi.get(i))))),"illegal hold witness");
   need(eq(forward(P,key,hold),C),"forward replay");
   return {mask,key,checksum:sum(P),plaintext:P.map(p=>gp.translit[p]).join(" ")};
  }
  for(let mask=0;mask<(hold?2**z.length:1);mask++){
   const lanes=Array.from({length:q},()=>[]);let fixed=0,j=0;
   for(let i=0;i<C.length;i++){if(zi.has(i)&&(mask&(1<<zi.get(i))))fixed+=2;else lanes[j++%q].push(C[i]);}
   let lo=fixed,hi=fixed,perm=fixed,opts=[],lowKey=[];
   for(const lane of lanes){
    const H=Array(29).fill(0);for(const x of lane)H[x]++;
    const counts=H.filter(Boolean).sort((a,b)=>b-a);perm+=counts.reduce((v,c,i)=>v+c*prime[i+(hold?1:0)],0);
    const map=new Map();let lm=Infinity,hm=-Infinity,k0=null;
    for(const a of As)for(let b=0;b<29;b++){
     let w=0,valid=true;for(let x=0;x<29;x++)if(H[x]){const p=mod(a*x+b);if(hold&&p===0){valid=false;break}w+=H[x]*prime[p]}
     if(!valid)continue;
     if(w<lm){lm=w;k0=[a,b]}hm=Math.max(hm,w);
     const prev=map.get(w);if(prev)prev.count++;else map.set(w,{count:1n,key:[a,b]});
    }
    lo+=lm;hi+=hm;opts.push(map);lowKey.push(k0);
   }
   permMin=Math.min(permMin,perm);
   if(!Number.isFinite(lo))continue;
   validMasks++;legal+=opts.reduce((v,m)=>v*[...m.values()].reduce((n,o)=>n+o.count,0n),1n);
   if(lo<min){min=lo;minWitness=witness(mask,lowKey);need(minWitness.checksum===lo,"min checksum")}
   max=Math.max(max,hi);
   if(lo>target||hi<target)continue;
   let dp=new Map([[fixed,{count:1n,key:[]}]]);
   for(const map of opts){
    const nd=new Map();for(const [v,o] of dp)for(const [w,m] of map){
     const s=v+w;if(s>target)continue;const c=o.count*m.count,old=nd.get(s);
     if(old)old.count+=c;else nd.set(s,{count:c,key:[...o.key,m.key]});
    }dp=nd;
   }
   const hit=dp.get(target);if(hit){hitCount+=hit.count;hitMasks++;if(!hitWitness){hitWitness=witness(mask,hit.key);need(hitWitness.checksum===target,"target checksum")}}
  }
  return {n:C.length,zeros:z.length,q,mode,hold,target,min,max,arbitraryBijectionMin:permMin,validMasks,legal:legal.toString(),hitMasks,hitCount:hitCount.toString(),minWitness,hitWitness};
 }
 const result={original:[],controls:[]};
 for(const [id,C,q,target] of [["upper-complete",u,10,1033],["lower-complete",l.concat(carry),8,3301],["lower-physical",l,8,3301]])for(const mode of ["additive","reflected","affine"])for(const hold of [false,true])result.original.push({id,...solve(C,q,mode,hold,target)});
 const p57=gp.pages.find(x=>x.page===57).indices;
 need(p57.length===95&&sum(p57.slice(7,37))===1259&&sum(p57.slice(37,67))===1031,"native p57 checksum");
 for(const [id,P,q] of [["p57-clause1",p57.slice(7,37),10],["p57-clause2",p57.slice(37,67),8]])for(const mode of ["additive","reflected","affine"])for(const hold of [false,true]){
  const key=Array.from({length:q},(_,j)=>[mode==="affine"?1+(j*7+4)%28:mode==="reflected"?28:1,(j*j+7*j+11)%29]);
  const C=forward(P,key,hold),target=sum(P),x=solve(C,q,mode,hold,target);
  // Independently reconstruct the true path using the actual sender mask.
  let j=0;const decoded=C.map((c,i)=>hold&&P[i]===0?0:mod(key[j%q][0]*c+key[j++%q][1]));
  need(eq(decoded,P)&&BigInt(x.hitCount)>0n,"native true path retained");
  result.controls.push({id,trueKey:key,trueChecksum:target,truePlaintext:P,...x});
 }
 const expected={"upper-complete":[2130,2398,2332,2556,1311,1414],"lower-complete":[4740,4654,4732,4585,3364,3422],"lower-physical":[4406,4232,4328,4120,2966,3027]};
 for(const [id,mins] of Object.entries(expected))need(eq(result.original.filter(x=>x.id===id).map(x=>x.min),mins),"original min regression "+id);
 need(result.original.filter(x=>x.id!=="lower-physical").every(x=>x.hitCount==="0"),"complete originals exclude");
 need(eq(result.original.filter(x=>x.id==="lower-physical"&&x.mode==="affine").map(x=>Number(x.hitCount)),[7366368,1496094]),"fragment regression");
 return result;
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt")),null,2));
