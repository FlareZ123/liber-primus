'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,solved){
 const Q=29,K=5,check=(x,m)=>{if(!x)throw Error(m)},T=gp.translit,all=Array.from({length:Q},(_,i)=>i),idx=new Map(gp.runes.map((r,i)=>[r,i]));
 const pages=new Map(gp.pages.map(p=>[p.page,p.indices])),p7=pages.get(7).slice(-14),lens=[2,4,3,2,3];let n=0;
 const keywords=lens.map(l=>{const w=p7.slice(n,n+l);n+=l;return w});check(JSON.stringify(keywords)===JSON.stringify([[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]]),"literal source key");
 const direct=keywords.map(w=>[...new Set([...w,...all])]);const inverse=direct.map(pi=>all.map(c=>pi.indexOf(c)));
 const native=solved.sections.map(s=>({name:s.name,p:(s.source_text.match(/[\u16a0-\u16ff]/gu)||[]).map(x=>idx.get(x))}));check(native.every(s=>s.p.every(Number.isInteger)),"native tape");
 const C=Array.from({length:7},(_,i)=>pages.get(8+i)).flat().slice(12);check(C.length===1717,"original body");
 function train(exclude){const u=new Float64Array(Q).fill(.2),b=new Float64Array(Q*Q).fill(0),t=new Float64Array(Q**3).fill(0);let total=Q*.2;for(const s of native){if(s.name===exclude)continue;for(let i=0;i<s.p.length;i++){const x=s.p[i];u[x]++;total++;if(i>=1)b[s.p[i-1]*Q+x]++;if(i>=2)t[(s.p[i-2]*Q+s.p[i-1])*Q+x]++}}
  for(let i=0;i<Q;i++)u[i]/=total;const bb=new Float64Array(Q*Q),tt=new Float64Array(Q**3);for(let a=0;a<Q;a++){let sum=0;for(let x=0;x<Q;x++)sum+=b[a*Q+x];for(let x=0;x<Q;x++)bb[a*Q+x]=(b[a*Q+x]+5*u[x])/(sum+5)}for(let ab=0;ab<Q*Q;ab++){let sum=0;for(let x=0;x<Q;x++)sum+=t[ab*Q+x];for(let x=0;x<Q;x++)tt[ab*Q+x]=(t[ab*Q+x]+3*bb[(ab%Q)*Q+x])/(sum+3)}return {u,b:bb,t:tt}}
 function emissions(bank,hold){const M=Array.from({length:Q},()=>new Float64Array(Q));for(const pi of bank){check(new Set(pi).size===Q,"permutation");for(let p=0;p<Q;p++)M[p][pi[p]]+=1/K}const e=[];for(let prev=-1;prev<Q;prev++){const rr=Array.from({length:Q},()=>[]);for(let p=0;p<Q;p++){let sum=0;for(let c=0;c<Q;c++){let v=hold&&p===0?Number(c===0):prev<0?M[p][c]:c===prev?M[p][c]**2:M[p][c]*(1+M[p][prev]);sum+=v;if(v>0)rr[c].push([p,v,Math.log(v)])}check(Math.abs(sum-1)<1e-10,"emission normalization")}e.push(rr)}return e}
 function decode(c,bank,hold,lm,split){
  const e=emissions(bank,hold),sum=a=>a.reduce((x,y)=>x+y,0),op=i=>e[i?c[i-1]+1:0][c[i]];let f=new Float64Array(Q*Q),v=new Float64Array(Q*Q).fill(-Infinity),backs=[],ll=0,prefix=null;
  for(const [a,ea] of op(0))for(const [b,eb] of op(1)){const x=lm.u[a]*ea*lm.b[a*Q+b]*eb;f[a*Q+b]=x;v[a*Q+b]=Math.log(x)}
  let z=sum(f);if(!z)return{legal:false};ll+=Math.log(z);for(let j=0;j<f.length;j++)f[j]/=z;
  for(let i=2;i<c.length;i++){const nf=new Float64Array(Q*Q),nv=new Float64Array(Q*Q).fill(-Infinity),back=new Int8Array(Q*Q).fill(-1);for(let ab=0;ab<f.length;ab++){if(!f[ab]&&!Number.isFinite(v[ab]))continue;for(const [d,ed,le] of op(i)){const bd=(ab%Q)*Q+d,t=lm.t[ab*Q+d];nf[bd]+=f[ab]*t*ed;const x=v[ab]+Math.log(t)+le;if(x>nv[bd]){nv[bd]=x;back[bd]=Math.floor(ab/Q)}}}
   z=sum(nf);if(!z)return{legal:false,firstImpossible:i};ll+=Math.log(z);for(let j=0;j<nf.length;j++)nf[j]/=z;f=nf;v=nv;backs.push(back);if(i+1===split)prefix=ll;
  }
  const P=Array(c.length);let best=v.indexOf(Math.max(...v));P[c.length-2]=Math.floor(best/Q);P[c.length-1]=best%Q;
  for(let i=c.length-1;i>=2;i--){const a=backs[i-2][best];check(a>=0,"trace");P[i-2]=a;best=a*Q+Math.floor(best/Q)}
  const state=P.map((p,i)=>hold&&p===0?-1:bank.findIndex(pi=>pi[p]===c[i]));check(P.every((p,i)=>hold&&p===0?c[i]===0:state[i]>=0&&bank[state[i]].indexOf(c[i])===p),"constructive full inverse");
  return {legal:true,fullLLR:(ll+c.length*Math.log(Q))/c.length,prefixLLR:(prefix+split*Math.log(Q))/split,suffixLLR:(ll-prefix+(c.length-split)*Math.log(Q))/(c.length-split),map:P.map(p=>T[p]).join(""),P,state};
 }
 function plant(P,bank,hold,seed){let x=seed>>>0;function r(){x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/2**32}let prev=-1;return P.map(p=>{let c=hold&&p===0?0:bank[Math.floor(r()*K)][p];if(!(hold&&p===0)&&c===prev)c=bank[Math.floor(r()*K)][p];prev=c;return c})}
 const out={keywords,models:[],controls:[]};for(const [direction,bank] of [["forward",direct],["inverse",inverse]])for(const hold of [true,false]){
  const row={direction,hold,bank};for(const s of native.filter(s=>s.p.length>=243)){const P=s.p.slice(0,243),c=plant(P,bank,hold,0x7a5b019c+out.controls.length),d=decode(c,bank,hold,train(s.name),160);check(d.legal,"known bank control legal");out.controls.push({direction,hold,source:s.name,fullLLR:d.fullLLR,suffixLLR:d.suffixLLR,mapCorrect:d.P.filter((p,i)=>p===P[i]).length,n:P.length})}
  const a=decode(C,bank,hold,train(null),1024);row.original={...a,P:undefined,state:undefined,map:a.map?.slice(0,240)};
  const p8=decode(C.slice(0,243),bank,hold,train(null),160);row.p8={...p8,P:undefined,state:undefined};
  out.models.push(row);
 }
 return out;
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const d=files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')));
console.log(JSON.stringify(experiment(...d),null,2));
