"use strict";
/** #2608: target-excluded GP29 bigram/trigram prefix-only exact Viterbi. */
function refine(gp,donor,raw,rankEnc,originalRank=null,runOriginal=false){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const ix=new Map(gp.runes.map((r,i)=>[r,i])),S=donor.sections.map(s=>[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c)));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const train=native(raw).concat(...[0,2,7,8].map(i=>S[i])),c1=new Int32Array(29),c2=new Int32Array(841),c3=new Int32Array(24389);
 for(let i=0;i<train.length;i++){const p=train[i];c1[p]++;if(i)c2[train[i-1]*29+p]++;if(i>1)c3[(train[i-2]*29+train[i-1])*29+p]++}
 const U=Array.from(c1,x=>(x+.5)/(train.length+14.5)),B=new Float64Array(841),T=new Float64Array(24389),LU=U.map(Math.log),LB=new Float64Array(841);
 for(let a=0;a<29;a++)for(let p=0;p<29;p++){const i=a*29+p;B[i]=(c2[i]+8*U[p])/(c1[a]+8);LB[i]=Math.log(B[i])}
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let p=0;p<29;p++){const i=(a*29+b)*29+p;T[i]=Math.log((c3[i]+8*B[b*29+p])/(c2[a*29+b]+8))}
 const inv=Array(29).fill(0);for(let u=1;u<29;u++)for(let x=1;x<29;x++)if(u*x%29===1)inv[u]=x;
 const pack=(x1,x2,c1,c2,f)=>x1|(x2<<5)|(c1<<10)|(c2<<15)|(f<<20);
 const unpack=z=>[z&31,(z>>5)&31,(z>>10)&31,(z>>15)&31,(z>>20)&3];
 function primer(C,key,x0,x1){const [a,b,d]=key;if(b){const R1=1,R2=1,Q1=mod((C[1]-x1-a*(x0+R1)-d)*inv[b]-C[0]),Q2=mod((C[0]-x0-a*(R1+R2)-d)*inv[b]-Q1);return [R1,R2,Q1,Q2]}if(a){const R1=mod((C[1]-x1-d)*inv[a]-x0),R2=mod((C[0]-x0-d)*inv[a]-R1);return R1&&R2?[R1,R2,0,0]:null}return mod(x0+d)===C[0]&&mod(x1+d)===C[1]?[1,1,0,0]:null}
 function viterbi(C,key,order,startState=null,trace=false){
  const [a,b,d,u]=key,I=inv[u],score=(p2,p1,p)=>order===2?LB[p1*29+p]:T[(p2*29+p1)*29+p];
  let M=new Map(),begin=startState===null?2:0;const layers=trace?[]:null;
  if(startState!==null)M.set(startState,0);else{assert(C[0]&&C[1],"two consuming origin");for(let x1=1;x1<29;x1++)for(let x2=1;x2<29;x2++){if(a&&mod(a+b)===0&&d===0&&x1===C[1]&&x2===C[0])continue;if(!primer(C,key,x2,x1))continue;const p0=x2*I%29,p1=x1*I%29;M.set(pack(x1,x2,C[1],C[0],0),LU[p0]+LB[p0*29+p1])}}
  let peak=M.size;
  for(let i=begin;i<C.length;i++){const c=C[i],N=new Map(),back=trace?new Map():null;
   function add(z,s,prev,p){const old=N.get(z);if(old===undefined||s>old){N.set(z,s);if(trace)back.set(z,[prev,p])}}
   for(const [z,v] of M){const [x1,x2,c1,c2,f]=unpack(z),p1=f&1?0:x1*I%29,p2=f&2?0:(f&1?x1*I%29:x2*I%29),nf=(f&1)<<1;
    if(c===0)add(pack(x1,x2,c1,c2,nf|1),v+score(p2,p1,0),z,0);
    const x=mod(c-a*(x1+x2)-b*(c1+c2)-d);if(x){const p=x*I%29;add(pack(x,x1,c,c1,nf),v+score(p2,p1,p),z,p)}
   }
   if(!N.size)return {legal:false,death:i,peak};M=N;peak=Math.max(peak,M.size);if(trace)layers.push(back)
  }
  let best=-Infinity,zbest=null;for(const [z,v] of M)if(v>best){best=v;zbest=z}
  const result={legal:true,score:best,final:zbest,peak};
  if(trace){let z=zbest;const plain=Array(C.length);for(let i=C.length-1;i>=begin;i--){const [prev,p]=layers[i-begin].get(z);plain[i]=p;z=prev}if(startState===null){const [x1,x2]=unpack(z);plain[0]=x2*I%29;plain[1]=x1*I%29;result.effective=unpack(z);result.primer=primer(C,key,x2,x1)}result.plain=plain}
  return result
 }
 function enc(P,key,h){const [a,b,d,u]=key;let [x1,x2,c1,c2]=h;return P.map(p=>{if(!p)return 0;const x=u*p%29,c=mod(x+a*(x1+x2)+b*(c1+c2)+d);x2=x1;x1=x;c2=c1;c1=c;return c})}
 function decodeRanks(s){assert(s.length===512,"top128 size");return Array.from({length:128},(_,i)=>[...s.slice(4*i,4*i+4)].map(x=>parseInt(x,36)))}
 const defs=[{name:"welcome-koan1",P:S[1].concat(S[3]),key:[4,21,11,19],h:[9,13,11,8]},{name:"loss-koan2-instruction",P:S[4].concat(S[5],S[6]),key:[24,7,20,3],h:[6,25,20,5]}];
 function fit(C,rs,truth=null){
   const prefix=C.slice(0,600),keys=decodeRanks(rs),bi=keys.map(key=>({key,...viterbi(prefix,key,2)})).filter(v=>v.legal).sort((a,b)=>b.score-a.score);
   const tri=keys.map(key=>({key,...viterbi(prefix,key,3)})).filter(v=>v.legal).sort((a,b)=>b.score-a.score);
   const selected=tri[0],p=viterbi(prefix,selected.key,3,null,true);assert(p.legal&&p.final===selected.final,"trace prefix consistency");
   const out={selected:selected.key,bigramRank1:bi[0].key,triScore:p.score/600,runnerUp:tri[1]?.score/600,legal:tri.length,effective:p.effective,primer:p.primer,final:unpack(p.final),prefix:p.plain};
   if(truth){out.trueKeyRank=keys.findIndex(x=>x.join()===truth.key.join())+1;out.trueBigramRank=bi.findIndex(x=>x.key.join()===truth.key.join())+1;out.trueTrigramRank=tri.findIndex(x=>x.key.join()===truth.key.join())+1;out.prefixCorrect=p.plain.filter((x,i)=>x===truth.P[i]).length}
   // Freeze the complete prefix-selected key and endpoint before the untouched suffix is decoded.
   const suffix=viterbi(C.slice(600),selected.key,3,p.final,true);out.suffixLegal=suffix.legal;
   if(suffix.legal){out.suffix=suffix.plain;out.suffixScore=suffix.score/(C.length-600);out.replay=enc(p.plain.concat(suffix.plain),selected.key,p.primer).every((x,i)=>x===C[i]);if(truth)out.suffixCorrect=suffix.plain.filter((x,i)=>x===truth.P[i+600]).length}
   else out.suffixDeath=suffix.death;
   return out
 }
 const control=defs.map((v,i)=>({name:v.name,n:v.P.length,key:v.key,...fit(enc(v.P,v.key,v.h),rankEnc[i],v)}));
 return {trainLength:train.length,control,original:runOriginal?fit(gp.pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices),originalRank):null};
}
module.exports=refine;
