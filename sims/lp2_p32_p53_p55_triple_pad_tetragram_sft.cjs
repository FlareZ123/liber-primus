"use strict";
/** Shared additive pad, artwork-linked p32/p53/p55; no preserved word boundaries. */
const fs=require("node:fs"),path=require("node:path");
function tripleSharedPad(raw,mode="0"){
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
 const init=new Float64Array(Q3),shifted=new Float64Array(Q2*Q2);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){
  for(let x=0;x<Q;x++)init[(a*Q+b)*Q+x]=U[x]*U[(x+a)%Q]*U[(x+b)%Q];
  const pos=(a*Q+b)*Q2;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)shifted[pos+x*Q+y]=B[((x+a)%Q)*Q+(y+b)%Q];
 }
 const uniform=2*Math.log(Q);
 function forward(A,Bb,C,a,b,start=0,end=H,posterior=null){
  let prev=new Float64Array(Q),next=new Float64Array(Q),ll=0;
  if(posterior)prev.set(posterior);
  let pa=start?mod(A[a+start-1]-C[start-1]):0,pb=start?mod(Bb[b+start-1]-C[start-1]):0;
  for(let i=start;i<end;i++){
   const da=mod(A[a+i]-C[i]),db=mod(Bb[b+i]-C[i]);
   if(i===0){prev.set(init.subarray((da*Q+db)*Q,(da*Q+db+1)*Q));}
   else{
    next.fill(0);const sa=(pa*Q+da)*Q2,sb=(pb*Q+db)*Q2;
    for(let x=0;x<Q;x++){const v=prev[x],z=x*Q,za=sa+z,zb=sb+z;
     for(let y=0;y<Q;y++)next[y]+=v*B[z+y]*shifted[za+y]*shifted[zb+y];}
    const tmp=prev;prev=next;next=tmp;
   }
   let sum=0;for(let x=0;x<Q;x++)sum+=prev[x];check(sum>0,"forward");
   for(let x=0;x<Q;x++)prev[x]/=sum;ll+=Math.log(sum);pa=da;pb=db;
  }
  return {ll,posterior:prev};
 }

 /** Exact tetragram MAP of the 3 plaintext sequences at a fixed alignment. */
 function decode(A,Bb,C,a,b){
  const da=C.map((c,i)=>mod(A[a+i]-c)),db=C.map((c,i)=>mod(Bb[b+i]-c));
  const tri=(p,q,r)=>lt[(p*Q+q)*Q+r],bi=(p,q)=>lb[p*Q+q];
  let prev=new Float64Array(Q3).fill(-Infinity),next=new Float64Array(Q3);
  const back=new Int8Array(L*Q3).fill(-1);
  for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)for(let z=0;z<Q;z++){
   const ax=(x+da[0])%Q,bx=(x+db[0])%Q,ay=(y+da[1])%Q,by=(y+db[1])%Q,az=(z+da[2])%Q,bz=(z+db[2])%Q;
   prev[(x*Q+y)*Q+z]=lu[x]+lu[ax]+lu[bx]+bi(x,y)+bi(ax,ay)+bi(bx,by)+tri(x,y,z)+tri(ax,ay,az)+tri(bx,by,bz);
  }
  for(let i=3;i<L;i++){
   next.fill(-Infinity);
   const mapA=Array.from({length:Q},(_,t)=>(t+da[i])%Q),mapB=Array.from({length:Q},(_,t)=>(t+db[i])%Q);
   for(let x=0;x<Q;x++){
    const ax=(x+da[i-3])%Q,bx=(x+db[i-3])%Q;
    for(let y=0;y<Q;y++){
     const ay=(y+da[i-2])%Q,by=(y+db[i-2])%Q;
     for(let z=0;z<Q;z++){
      const az=(z+da[i-1])%Q,bz=(z+db[i-1])%Q,k=(x*Q+y)*Q+z,prior=prev[k],row=k*Q,ra=((ax*Q+ay)*Q+az)*Q,rb=((bx*Q+by)*Q+bz)*Q,dst=(y*Q+z)*Q;
      for(let t=0;t<Q;t++){const val=prior+lf[row+t]+lf[ra+mapA[t]]+lf[rb+mapB[t]],u=dst+t;
       if(val>next[u]){next[u]=val;back[i*Q3+u]=x;}}
     }
    }
   }
   const tmp=prev;prev=next;next=tmp;
  }
  let k=0;for(let j=1;j<Q3;j++)if(prev[j]>prev[k])k=j;const score=prev[k],p=new Array(L);p[L-1]=k%Q;p[L-2]=Math.floor(k/Q)%Q;p[L-3]=Math.floor(k/Q2);
  for(let i=L-1;i>=3;i--)p[i-3]=back[i*Q3+(p[i-2]*Q+p[i-1])*Q+p[i]];
  const pA=p.map((x,i)=>(x+da[i])%Q),pB=p.map((x,i)=>(x+db[i])%Q),key=p.map((x,i)=>mod(C[i]-x));
  check(pA.every((x,i)=>(x+key[i])%Q===A[a+i])&&pB.every((x,i)=>(x+key[i])%Q===Bb[b+i]),"replay");
  return {score,plain:[pA,pB,p],key,latin:[pA,pB,p].map(s=>s.map(x=>gp.translit[x]).join(""))};
 }
 /** Exact three-independent-trigram marginal over the common hidden pad symbol. */
 function forward3(A,Bb,C,a,b,start=0,end=H,posterior=null){
  let prev=new Float64Array(Q2),next=new Float64Array(Q2),ll=0;
  const da=C.map((c,i)=>mod(A[a+i]-c)),db=C.map((c,i)=>mod(Bb[b+i]-c));
  if(posterior)prev.set(posterior);
  else{
   for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){
    const ax=(x+da[0])%Q,bx=(x+db[0])%Q,ay=(y+da[1])%Q,by=(y+db[1])%Q;
    prev[x*Q+y]=U[x]*U[ax]*U[bx]*B[x*Q+y]*B[ax*Q+ay]*B[bx*Q+by];
   }
   let norm=prev.reduce((a,b)=>a+b,0);for(let i=0;i<Q2;i++)prev[i]/=norm;ll=Math.log(norm);start=2;
  }
  for(let i=start;i<end;i++){
   next.fill(0);
   const mapA=Array.from({length:Q},(_,z)=>(z+da[i])%Q),mapB=Array.from({length:Q},(_,z)=>(z+db[i])%Q);
   for(let x=0;x<Q;x++){
    const ax=(x+da[i-2])%Q,bx=(x+db[i-2])%Q;
    for(let y=0;y<Q;y++){
     const ay=(y+da[i-1])%Q,by=(y+db[i-1])%Q,k=x*Q+y,v=prev[k],row=k*Q,ra=(ax*Q+ay)*Q,rb=(bx*Q+by)*Q,dst=y*Q;
     for(let z=0;z<Q;z++)next[dst+z]+=v*T[row+z]*T[ra+mapA[z]]*T[rb+mapB[z]];
    }
   }
   const norm=next.reduce((a,b)=>a+b,0);check(norm>0,"trigram normalization");for(let j=0;j<Q2;j++)next[j]/=norm;
   ll+=Math.log(norm);const tmp=prev;prev=next;next=tmp;
  }
  return {ll,posterior:prev};
 }
 function solve(A,Bb,C,truth=null){
  const candidates=[];
  for(let a=0;a<=A.length-L;a++)for(let b=0;b<=Bb.length-L;b++){const f=forward(A,Bb,C,a,b);candidates.push({a,b,ll:f.ll});}
  candidates.sort((a,b)=>b.ll-a.ll);
  const shortlist=candidates.slice(0,256).map(c=>({...c,ll3:forward3(A,Bb,C,c.a,c.b).ll})).sort((a,b)=>b.ll3-a.ll3);
  const best=shortlist[0],f=forward3(A,Bb,C,best.a,best.b),held=forward3(A,Bb,C,best.a,best.b,H,L,f.posterior);
  const d=decode(A,Bb,C,best.a,best.b);
  const out={count:candidates.length,shortlistSize:shortlist.length,top:shortlist.slice(0,10),prefixGain:f.ll/H+uniform,heldGain:held.ll/(L-H)+uniform,margin:best.ll3-shortlist[1].ll3,decode:d};
  if(truth){const rank=candidates.findIndex(c=>c.a===truth.a&&c.b===truth.b)+1,rank3=shortlist.findIndex(c=>c.a===truth.a&&c.b===truth.b)+1,tf=forward3(A,Bb,C,truth.a,truth.b),th=forward3(A,Bb,C,truth.a,truth.b,H,L,tf.posterior),td=decode(A,Bb,C,truth.a,truth.b);out.truth={a:truth.a,b:truth.b,rank,rank3,prefixGain:tf.ll/H+uniform,heldGain:th.ll/(L-H)+uniform,correct:td.plain.map((p,j)=>p.filter((x,i)=>x===truth.p[j][i]).length),padCorrect:td.key.filter((x,i)=>x===truth.k[i]).length,exactSelected:best.a===truth.a&&best.b===truth.b};}
  return out;
 }
 const original=[32,53,55].map(i=>gp.pages[i].indices);check(original.map(x=>x.length).join()==="121,179,76","geometry");

 if(mode==="original")return {trainRunes:total,actual:solve(...original)};
 const trial=Number(mode);check(Number.isInteger(trial)&&trial>=0&&trial<4,"trial");
 let rng=(0x19535534+trial*0x1f123bb5)>>>0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const a=rand(46),b=rand(104),offsets=lit.map(p=>Math.floor(p.length*.7)+rand(Math.floor(p.length*.25))),p=offsets.map((s,j)=>lit[j].slice(s,s+L));
 const k=Array.from({length:L},()=>rand(Q)),A=Array.from({length:121},()=>rand(Q)),Bb=Array.from({length:179},()=>rand(Q)),C=p[2].map((x,i)=>(x+k[i])%Q);
 for(let i=0;i<L;i++){A[a+i]=(p[0][i]+k[i])%Q;Bb[b+i]=(p[1][i]+k[i])%Q;}
 const control={trial,offsets,...solve(A,Bb,C,{a,b,p,k})};
 return {trainRunes:total,control,passed:control.truth.exactSelected&&control.truth.padCorrect>=Math.ceil(L*.7)&&control.heldGain>0};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(tripleSharedPad(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]??"0"),null,2));
