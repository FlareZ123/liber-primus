'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,original=false){
 const A=41,N=160,S=80,q=29,mod=x=>((x%29)+29)%29,check=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a[0]===b[0]&&a[1]===b[1],sub=(a,b)=>[mod(a[0]-b[0]),mod(a[1]-b[1])],det=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]),inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("inverse")};
 const idx=new Map(gp.translit.map((s,i)=>[s,i])),names=["Shakespeare","Emerson","Gibran"];
 const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body");return s.slice(a,b)}
 function chunks(s){let out=[],words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]),rem=Array(L+1).fill(0);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {L,f,b,rem}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[];
 for(let j=0;j<3;j++){const c=chunks(texts[j]);for(let i=0;i+1<c.length;i++){if(c[i].replace(/ /g,"").length>=A&&c[i+1].replace(/ /g,"").length>=N-A)pairs.push({source:names[j],stop:i+1,left:graph(c[i]),right:graph(c[i+1])})}}
 check(pairs.length===1161,"frozen pair count");


 const D=5,zero=()=>Array(D).fill(null),row=(P,i)=>[1,P[i]??0,P[i-1]??0,P[i-2]??0,P[i-3]??0],dot=(a,b)=>mod(a.reduce((v,x,i)=>v+x*b[i],0));
 function reduce(B,v,c=0){let x=[...v,c];for(let j=0;j<D;j++)if(B[j]&&x[j]){const t=x[j];x=x.map((y,k)=>mod(y-t*B[j][k]))}return x}
 function value(B,v){const x=reduce(B,v);return x.slice(0,D).every(y=>!y)?mod(-x[D]):null}
 const a0=[0,1,0,0,0];
 function add(B,v,c){let x=reduce(B,v,c),j=x.slice(0,D).findIndex(y=>y);if(j<0)return x[D]?null:B;
  const z=inv(x[j]);x=x.map(y=>mod(y*z));const T=B.map(t=>t&&t[j]?t.map((y,k)=>mod(y-t[j]*x[k])):t);T[j]=x;return value(T,a0)===0?null:T;
 }
 function count(B){const d=D-B.filter(Boolean).length,v=value(B,a0);return v===null?28*29**(d-1):v?29**d:0}
 function witness(B){let k=Array(D).fill(0);function solve(){for(let i=0;i<D;i++)if(B[i])k[i]=mod(B[i][D]-B[i].slice(0,D).reduce((s,x,j)=>s+(j===i?0:x*k[j]),0));return k[1]!==0}if(solve())return k;
  for(let i=0;i<D;i++)if(!B[i]){k.fill(0);k[i]=1;if(solve())return k}throw Error("no nonzero current coefficient");
 }
 function belongs(B,k){return k[1]!==0&&B.every(v=>!v||dot(v.slice(0,D),k)===v[D])}
 function enc(P,k){return P.map((p,i)=>dot(row(P,i),k))}
 function dec(C,k,history=[]){let P=history.slice(),h=P.length;for(const c of C){const i=P.length;P.push(mod(inv(k[1])*(c-k[0]-k[2]*(P[i-1]??0)-k[3]*(P[i-2]??0)-k[4]*(P[i-3]??0))))}return P.slice(h)}
 function scan(C){const out=[];let leftPass=0,nodes=0;
  for(const pair of pairs){const P=Array(S);
   function forward(i,pos,B){nodes++;if(pair.right.rem[pos]<N-i)return;if(i===S){out.push({pair,pos,B,plain:P.slice()});return}
    for(const [v,np] of pair.right.f[pos]){P[i]=v;const T=add(B,row(P,i),C[i]);if(T)forward(i+1,np,T)}
   }
   function reverse(i,pos,B){nodes++;if(i<0){let T=B;for(let j=0;j<3&&T;j++)T=add(T,row(P,j),C[j]);if(T){leftPass++;forward(A,0,T)}return}
    for(const [v,np] of pair.left.b[pos]){P[i]=v;const T=i+3<A?add(B,row(P,i+3),C[i+3]):B;if(T)reverse(i-1,np,T)}
   }
   reverse(A-1,pair.left.L,zero());
  }return {out,leftPass,nodes};
 }
 function run(C,truth=null){const {out,leftPass,nodes}=scan(C.slice(0,S)),full=[];
  const good=truth?out.filter(o=>o.pair.source===truth.source&&o.pair.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&belongs(o.B,truth.k)):[];
  let forced=null,allowed=null;
  if(good.length){forced=0;allowed=0;const B=good[0].B;for(let i=S;i<N;i++){const v=row(truth.plain,i),p=value(B,v);forced+=+(p!==null);allowed+=+!!add(B,v,C[i]);}}
  for(const o of out){const P=o.plain.slice();function forward(i,pos,B){if(o.pair.right.rem[pos]<N-i)return;if(i===N){const k=witness(B),plain=P.slice();check(enc(plain,k).join()===C.join()&&dec(C,k).join()===plain.join(),"replay");full.push({source:o.pair.source,stop:o.pair.stop,plain,k,prefixCount:count(o.B),fullCount:count(B),trueKey:truth?belongs(B,truth.k):null});return}
    for(const [v,np] of o.pair.right.f[pos]){P[i]=v;const T=add(B,row(P,i),C[i]);if(T)forward(i+1,np,T)}
   }forward(S,o.pos,o.B);}
  const correct=truth?full.some(f=>f.source===truth.source&&f.stop===truth.stop&&f.plain.join()===truth.plain.join()&&f.trueKey):null;
  return {leftPass,nodes,prefixPaths:out.length,prefixSources:new Set(out.map(o=>o.pair.source+":"+o.pair.stop)).size,prefixClasses:out.map(o=>({source:o.pair.source,stop:o.pair.stop,rank:o.B.filter(Boolean).length,count:count(o.B),basis:o.B})),fullPaths:full.length,forced,allowed,correct,full};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function spelling(g,r){let o=[],p=0;while(g.rem[p]){let t=g.f[p];if(!t.length)return [];const [v,n]=t[Math.floor(r()*t.length)];o.push(v);p=n}return o}
 const controls=[],nulls=[];
 for(let j=0;j<3;j++)for(let n=0;n<2;n++){
  const r=rng((0x270318^Math.imul(j*2+n+1,0x9e3779b9))>>>0),pool=pairs.filter(p=>p.source===names[j]),half=Math.floor(pool.length/2),subpool=n?pool.slice(half):pool.slice(0,half);
  let pair,L,R;do{pair=subpool[Math.floor(r()*subpool.length)];L=spelling(pair.left,r);R=spelling(pair.right,r)}while(L.length<A||R.length<N-A);
  const plain=L.slice(-A).concat(R.slice(0,N-A)),order=(j*2+n)%4,k=[Math.floor(r()*29),1+Math.floor(r()*28),...Array.from({length:3},(_,i)=>i<order?Math.floor(r()*29):0)],truth={source:pair.source,stop:pair.stop,plain,k,order},C=enc(plain,k);
  check(dec(C,k).join()===plain.join(),"native inverse");
  controls.push({truth,...run(C,truth)});nulls.push(run(Array.from({length:N},()=>Math.floor(r()*29))));
 }
 const e=zero(),d=add(e,[1,0,0,0,0],7),f=add(d,[0,1,1,0,0],4);
 check(count(e)===28*29**4&&count(d)===28*29**3&&count(f)===28*29**2&&value(f,[0,1,1,0,0])===4&&belongs(f,witness(f))&&!add(e,a0,0),"rank-deficient oracle");
 const gate=controls.every(c=>c.correct&&c.allowed===80&&c.prefixSources===1&&c.prefixPaths===1&&c.fullPaths===1&&c.forced===80&&Number(c.prefixClasses[0].count)===1)&&nulls.every(c=>c.prefixPaths===0&&c.fullPaths===0);
 let result=null;if(original&&gate){const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"corpus");result=run(U.slice(10279,10439));if(result.full.length===1&&result.full[0].fullCount===1){const f=result.full[0];result.adjacent=dec(U.slice(10439,10479),f.k,f.plain.slice(-3))}}
 return {pairs:pairs.length,gate,controls,nulls,original:result};

}

module.exports=attack;
if(require.main===module){const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));}
