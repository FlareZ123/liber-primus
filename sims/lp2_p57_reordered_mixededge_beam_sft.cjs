"use strict";
/** Admissible subset-DP guided beam for reordered p57 edge chunks, original p55 body. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function reorderedEdgeExperiment(corpus,native){
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)};
 const runes=corpus.runes,toGP=s=>[...s].filter(x=>runes.includes(x)).map(x=>runes.indexOf(x));
 const records=Object.fromEntries(native.sections.map(s=>[s.name,toGP(s.source_text)]));
 const words=native.sections.find(s=>s.name==="p57_parable").source_text.match(new RegExp("["+runes.join("")+"]+","gu")).map(toGP);
 const C=corpus.pages.find(p=>p.page===55).indices.slice(1);
 check(C.length===75&&words.length===20&&words.flat().join()===corpus.pages.find(p=>p.page===57).indices.join(),"source");
 const u=Array(29).fill(0),b=Array(841).fill(0),t=Array(24389).fill(0);let n=0;
 for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity"]){const a=records[name];n+=a.length;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}}
 const U=u.map(x=>(x+.5)/(n+14.5)),B=b.map((x,i)=>(x+12*U[i%29])/(u[Math.floor(i/29)]+12)),T=t.map((x,i)=>Math.log((x+9*B[i%841])/(b[Math.floor(i/29)]+9))),lu=U.map(Math.log),lb=B.map(Math.log);
 const lp=(a,b,c)=>b===29?lu[c]:a===29?lb[b*29+c]:T[(a*29+b)*29+c],score=p=>p.reduce((s,x,i)=>s+lp(p[i-2]??29,p[i-1]??29,x),0);
 const variants=words.map(w=>[w.slice(1),w.slice(0,-1)]),N=1<<words.length,all=N-1,lens=variants.map(v=>v[0].length),sum=new Uint8Array(N);
 for(let m=1;m<N;m++){const bit=m&-m;sum[m]=sum[m^bit]+lens[31-Math.clz32(bit)];}
 check(sum[all]===75,"length");
 const max1=Array(29).fill(-Infinity),max2=Array(841).fill(-Infinity),maxB1=Array(29).fill(-Infinity),maxB2=Array(841).fill(-Infinity);
 for(let x=0;x<29;x++)for(let y=0;y<29;y++){
  maxB1[x]=Math.max(maxB1[x],lp(29,y,x));
  for(let a=0;a<29;a++)max1[x]=Math.max(max1[x],lp(a,y,x));
  for(let z=0;z<29;z++){maxB2[x*29+z]=Math.max(maxB2[x*29+z],lp(29,y,x)+lp(y,x,z));for(let a=0;a<29;a++)max2[x*29+z]=Math.max(max2[x*29+z],lp(a,y,x)+lp(y,x,z));}
 }
 const WIDTH=512;
 function solve(cipher,sign,fhold,held){
  const isHeld=new Set(held),active=cipher.flatMap((x,i)=>isHeld.has(i)?[]:[i]),M=active.length,L=cipher.length;
  const boundary=j=>j===0?0:j===M?L:active[j];
  const chunks=Array.from({length:M},()=>Array.from({length:20},()=>[]));
  const ub=new Float64Array(M*20).fill(-Infinity);
  for(let j=0;j<M;j++)for(let w=0;w<20;w++)for(let edge=0;edge<2;edge++){
   const take=Math.min(lens[w],M-j),end=j+take,startAbs=boundary(j),endAbs=boundary(end),p=[],key=[];let k=0,ok=true;
   for(let i=startAbs;i<endAbs;i++){if(isHeld.has(i)){p.push(0);key.push(-1);}else{const v=variants[w][edge][k++],x=mod(cipher[i]-sign*v);if(fhold&&x===0){ok=false;break;}p.push(x);key.push(v);}}
   if(!ok)continue;check(k===take,"consumption");
   let internal=0;for(let i=2;i<p.length;i++)internal+=lp(p[i-2],p[i-1],p[i]);
   let upper=internal;
   if(startAbs===0)upper+=lp(29,29,p[0])+(p.length>1?lp(29,p[0],p[1]):0);
   else if(startAbs===1)upper+=p.length===1?maxB1[p[0]]:maxB2[p[0]*29+p[1]];
   else upper+=p.length===1?max1[p[0]]:max2[p[0]*29+p[1]];
   chunks[j][w].push({p,key,edge,w,internal,upper});ub[j*20+w]=Math.max(ub[j*20+w],upper);
  }
  const dp=new Float64Array(N).fill(-Infinity);dp[0]=0;
  for(let mask=1;mask<N;mask++){
   const off=75-sum[mask];if(off>=M){dp[mask]=0;continue;}
   let best=-Infinity;for(let m=mask;m;m&=m-1){const bit=m&-m,w=31-Math.clz32(bit),v=ub[off*20+w]+dp[mask^bit];if(v>best)best=v;}dp[mask]=best;
  }
  let layer=[{mask:all,a:29,b:29,s:0,trace:null}],best=null,discard=-Infinity,expanded=0;
  for(let depth=0;depth<20&&layer.length;depth++){
   const next=new Map();
   for(const st of layer){const off=75-sum[st.mask];
    for(let m=st.mask;m;m&=m-1){const bit=m&-m,w=31-Math.clz32(bit),mask=st.mask^bit;
     for(const ch of chunks[off][w]){
      expanded++;const p=ch.p,s=st.s+ch.internal+lp(st.a,st.b,p[0])+(p.length>1?lp(st.b,p[0],p[1]):0),a=p.length>1?p[p.length-2]:st.b,b=p[p.length-1],node={mask,a,b,s,trace:{prev:st.trace,ch}};
      if(off+lens[w]>=M){if(!best||s>best.s)best=node;continue;}
      const f=s+dp[mask];if(!Number.isFinite(f))continue;node.f=f;
      const k=(mask*30+a)*30+b,old=next.get(k);if(!old||s>old.s)next.set(k,node);
     }
    }
   }
   layer=[...next.values()].sort((a,b)=>b.f-a.f);
   if(layer.length>WIDTH){discard=Math.max(discard,layer[WIDTH].f);layer.length=WIDTH;}
  }
  if(!best)return {sign,fhold,held,upper:Number.isFinite(dp[all])?dp[all]/L:null,selected:null,expanded};
  const tr=[];for(let q=best.trace;q;q=q.prev)tr.push(q.ch);tr.reverse();
  const p=tr.flatMap(ch=>ch.p),key=tr.flatMap(ch=>ch.key);
  check(p.length===L&&p.map((v,i)=>key[i]<0?0:mod(v+sign*key[i])).join()===cipher.join(),"replay");
  check(Math.abs(score(p)-best.s)<1e-8,"score");
  return {sign,fhold,held,upper:dp[all]/L,certifiedUpper:Math.max(best.s,discard)/L,selected:best.s/L,expanded,plain:p,translit:p.map(x=>corpus.translit[x]).join(""),order:tr.map(ch=>[ch.w,ch.edge])};
 }
 let rng=0x33011926;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const controls=[];
 for(const name of ["0_warning","jpg107-167","p56_an_end"])for(const fhold of [false,true]){
  const p=records[name].slice(0,75),sign=rand(2)?1:-1,order=shuffle([...Array(20).keys()]).map(w=>[w,rand(2)]),key=order.flatMap(([w,e])=>variants[w][e]);let j=0;const held=[];
  const c=p.map((v,i)=>{if(fhold&&v===0){held.push(i);return 0;}return mod(v+sign*key[j++]);});
  const out=solve(c,sign,fhold,held);check(out.upper>=score(p)/75-1e-9,"inadmissible bound");
  controls.push({name,sign,fhold,trueScore:score(p)/75,selected:out.selected,upper:out.upper,certifiedUpper:out.certifiedUpper,recovered:out.plain?.filter((x,i)=>x===p[i]).length??0,held,order,trueOrder:order});
 }
 const original=[];const zeros=C.flatMap((x,i)=>x===0?[i]:[]);
 for(const sign of [-1,1]){
  original.push(solve(C,sign,false,[]));for(let m=0;m<(1<<zeros.length);m++)original.push(solve(C,sign,true,zeros.filter((_,j)=>(m>>j)&1)));
 }
 const nulls=[];for(let i=0;i<3;i++){const c=shuffle(C);nulls.push({trial:i,results:[-1,1].map(sign=>solve(c,sign,false,[]))});}
 return {width:WIDTH,controls,original,nulls};
}
console.log(JSON.stringify(reorderedEdgeExperiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
