"use strict";
const fs=require("node:fs"),path=require("node:path");
function latentFTriple(raw,mode="0"){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[4]),Q=29,L=76,H=48,Q2=Q*Q,Q3=Q2*Q;
 const mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)};
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"encode");out.push(q.i);j+=q.t.length;}}return out;}
 function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
 const lit=raw.slice(1,4).map(s=>encode(body(s)));
 const train=[...lit.map(p=>p.slice(0,Math.floor(p.length*.65))),...gold.sections.filter(s=>s.name!=="p57_parable").map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)))];
 const n1=new Float64Array(Q),n2=new Float64Array(Q2),n3=new Float64Array(Q3),d2=new Float64Array(Q),d3=new Float64Array(Q2),n4=new Float64Array(Q3*Q),d4=new Float64Array(Q3);
 let total=0;
 for(const p of train)for(let i=0;i<p.length;i++){const c=p[i];n1[c]++;total++;if(i){const a=p[i-1];n2[a*Q+c]++;d2[a]++;if(i>1){const ab=p[i-2]*Q+a;n3[ab*Q+c]++;d3[ab]++;if(i>2){const abc=p[i-3]*Q2+ab;n4[abc*Q+c]++;d4[abc]++;}}}}
 const U=Float64Array.from(n1,n=>(n+.5)/(total+14.5)),B=Float64Array.from(n2,(n,i)=>(n+12*U[i%Q])/(d2[Math.floor(i/Q)]+12)),T=Float64Array.from(n3,(n,i)=>(n+9*B[i%Q2])/(d3[Math.floor(i/Q)]+9));
 const F=Float64Array.from(n4,(n,i)=>(n+7*T[i%Q3])/(d4[Math.floor(i/Q)]+7));
 const lu=U.map(Math.log),lb=B.map(Math.log),lt=T.map(Math.log),lf=F.map(Math.log);

 const logQ=Math.log(Q),modp=(c,k)=>(c-k+Q)%Q,ones=new Float64Array(Q2).fill(1),zeros=s=>s.flatMap((x,i)=>x===0?[i]:[]);
 const logadd=(a,b)=>{if(a===-Infinity)return b;if(b===-Infinity)return a;let m=Math.max(a,b);return m+Math.log1p(Math.exp(-Math.abs(a-b)));};
 function masks(C){
  const z=zeros(C),out=[];
  for(let m=0;m<2**z.length;m++){
   const held=new Set(z.filter((_,i)=>(m>>i)&1)),cons=[],pre=[];let n=0;
   for(let i=0;i<C.length;i++){if(held.has(i)){n++;continue;}cons.push(C[i]);pre.push(n);n=0;}
   check(cons.length>0,"empty consuming tape");
   const tail=n,M=cons.length,first=new Float64Array(Q),trans=Array.from({length:M},()=>new Float64Array(Q2));
   const hold=(prev,x,h)=>h?B[prev*Q]*B[0]**(h-1)*B[x]:B[prev*Q+x];
   for(let k=0;k<Q;k++){
    const p=modp(cons[0],k);if(!p)continue;
    first[k]=pre[0]?U[0]*B[0]**(pre[0]-1)*B[p]:U[p];
    if(M===1&&tail)first[k]*=B[p*Q]*B[0]**(tail-1);
   }
   for(let t=1;t<M;t++)for(let j=0;j<Q;j++){
    const prev=modp(cons[t-1],j);if(!prev)continue;
    for(let k=0;k<Q;k++){
     const p=modp(cons[t],k);if(!p)continue;
     let v=hold(prev,p,pre[t]);if(t===M-1&&tail)v*=B[p*Q]*B[0]**(tail-1);
     trans[t][j*Q+k]=v;
    }
   }
   out.push({m,held:[...held],cons,pre,tail,M,first,trans,C});
  }
  return out;
 }
 function one(C){
  let dp=new Float64Array(Q),ll=0;
  for(let i=0;i<C.length;i++){
   const nd=new Float64Array(Q);
   for(let p=0;p<Q;p++){
    if(!p&&C[i]!==0)continue;
    let v=i?0:U[p];
    if(i)for(let j=0;j<Q;j++)v+=dp[j]*B[j*Q+p];
    nd[p]=v*(p?1/Q:1);
   }
   const s=nd.reduce((a,b)=>a+b,0);ll+=Math.log(s);dp=nd.map(x=>x/s);
  }
  return ll;
 }
 /** exact latent-key marginal and exact MAP for a fixed triple of zero masks */
 function evaluate(tables,trace=false){
  const M=Math.max(...tables.map(t=>t.M)),p=new Float64Array(Q),v=new Float64Array(Q),back=trace?new Int8Array(M*Q).fill(-1):null;
  let prev=p,mp=v,ll=0;
  for(let k=0;k<Q;k++){const w=tables[0].first[k]*tables[1].first[k]*tables[2].first[k];prev[k]=w;mp[k]=Math.log(w);}
  let norm=prev.reduce((a,b)=>a+b,0);if(!norm)return {ll:-Infinity,map:-Infinity};ll=Math.log(norm);
  for(let k=0;k<Q;k++)prev[k]/=norm;
  let next=new Float64Array(Q),mv=new Float64Array(Q);
  for(let t=1;t<M;t++){
   next.fill(0);mv.fill(-Infinity);
   const A=t<tables[0].M?tables[0].trans[t]:ones,D=t<tables[1].M?tables[1].trans[t]:ones,E=t<tables[2].M?tables[2].trans[t]:ones;
   for(let j=0;j<Q;j++)if(prev[j])for(let k=0;k<Q;k++){
    const q=j*Q+k,w=A[q]*D[q]*E[q];if(!w)continue;
    next[k]+=prev[j]*w;
    const u=mp[j]+Math.log(w);if(u>mv[k]){mv[k]=u;if(trace)back[t*Q+k]=j;}
   }
   norm=next.reduce((a,b)=>a+b,0);if(!norm)return {ll:-Infinity,map:-Infinity};ll+=Math.log(norm);
   for(let k=0;k<Q;k++)next[k]/=norm;
   let tmp=prev;prev=next;next=tmp;tmp=mp;mp=mv;mv=tmp;
  }
  let k=0;for(let j=1;j<Q;j++)if(mp[j]>mp[k])k=j;
  const map=mp[k]-M*logQ;
  if(!trace)return {ll:ll-M*logQ,map};
  const key=new Array(M);key[M-1]=k;
  for(let t=M-1;t>0;t--)key[t-1]=back[t*Q+key[t]];
  const plain=tables.map(x=>{const H=new Set(x.held);let j=0;return x.C.map((c,i)=>H.has(i)?0:modp(c,key[j++]));});
  check(plain.every((p,i)=>enc(p,key).join()===tables[i].C.join()),"replay");
  return {ll:ll-M*logQ,map,key,plain};
 }
 function joint(tapes,trace=false){
  const domain=tapes.map(masks),entries=[];let total=-Infinity,best=null;
  for(const a of domain[0])for(const b of domain[1])for(const c of domain[2]){
   const tables=[a,b,c],out=evaluate(tables);
   total=logadd(total,out.ll);if(!best||out.map>best.map)best={...out,tables};
   entries.push({m:[a.m,b.m,c.m],ll:out.ll,map:out.map});
  }
  entries.sort((a,b)=>b.ll-a.ll);const indep=tapes.reduce((s,c)=>s+one(c),0);
  const out={bf:total-indep,ll:total,indep,maskCount:entries.length,bestMask:best.tables.map(t=>t.m),bestHeld:best.tables.map(t=>t.held),top:entries.slice(0,8)};
  if(trace)Object.assign(out,evaluate(best.tables,true));
  // evaluate() returns the selected mask's likelihood, not the all-mask marginal.
  if(trace){out.selectedMaskLL=out.ll;out.ll=total;out.bf=total-indep;}
  return out;
 }
 function enc(p,k){let j=0;return p.map(x=>x===0?0:(x+k[j++])%Q);}
 function score(tapes,trace){const prefix=joint(tapes.map(t=>t.slice(0,H))),full=joint(tapes,trace);return {prefixBF:prefix.bf,full,increment:full.bf-prefix.bf};}
 const actual=[32,53,55].map(i=>gp.pages[i].indices.slice(0,L)),counts=actual.map(t=>zeros(t).length);check(counts.join()==="3,2,3","source counts");
 if(mode==="original")return {trainRunes:total,actual:score(actual,true)};
 const trial=Number(mode);check(Number.isInteger(trial)&&trial>=0&&trial<6,"trial");
 let rng=(0x19535535+trial*0x1f123bb5)>>>0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const offsets=[],p=lit.map((s,j)=>{for(let n=0;n<10000;n++){const a=Math.floor(s.length*.7)+rand(Math.floor(s.length*.25)),v=s.slice(a,a+L);if(zeros(v).length<=counts[j]){offsets.push(a);return v;}}throw Error("donor counts");});
 const randpad=()=>Array.from({length:L},()=>rand(Q));let k,tapes,tries=0;
 do{k=randpad();tapes=p.map(s=>enc(s,k));if(++tries>500000)throw Error("shared count matching");}while(tapes.some((s,j)=>zeros(s).length!==counts[j]));
 const independent=p.map((s,j)=>{for(let n=0;n<100000;n++){const v=enc(s,randpad());if(zeros(v).length===counts[j])return v;}throw Error("independent count matching");});
 const shared=score(tapes,true),neg=score(independent,false),overlap=Math.min(...p.map(x=>x.filter(Boolean).length));
 return {trainRunes:total,trial,offsets,actualF:p.map(zeros),counts,tries,shared,negative:neg,overlap,padCorrect:shared.full.key.slice(0,overlap).filter((x,i)=>x===k[i]).length,plainCorrect:shared.full.plain.map((s,j)=>s.filter((x,i)=>x===p[j][i]).length)};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(latentFTriple(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]??"0"),null,2));
