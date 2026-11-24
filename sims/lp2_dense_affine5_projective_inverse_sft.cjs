'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function(raw){
 const C=JSON.parse(raw[0]),N=JSON.parse(raw[1]),d=5,mod=x=>(x%29+29)%29,inv=x=>{for(let a=1;a<29;a++)if(mod(a*x)===1)return a;throw Error("singular")},assert=(x,m)=>{if(!x)throw Error(m)};
 const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rref=(rows,n)=>{const A=rows.map(a=>a.slice());let j=0;for(let k=0;k<n;k++){let i=A.findIndex((r,l)=>l>=j&&r[k]!==0);if(i<0)continue;[A[j],A[i]]=[A[i],A[j]];let u=inv(A[j][k]);A[j]=A[j].map(x=>mod(x*u));for(let l=0;l<A.length;l++)if(l!==j){let v=A[l][k];A[l]=A[l].map((x,m)=>mod(x-v*A[j][m]))}j++}return {A,rank:j}};
 const rank=a=>rref(a,d).rank,inverse=M=>{let v=rref(M.map((r,i)=>[...r,...Array.from({length:d},(_,j)=>+(i===j))]),d);assert(v.rank===d,"singular");return v.A.map(a=>a.slice(d))};
 const parse=t=>[...t].map(c=>C.runes.indexOf(c)).filter(x=>x>=0),gp=N.sections.flatMap(s=>parse(s.source_text));
 const tok=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const latin=t=>{let a=[];for(const w of (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[])){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let q=tok.find(v=>w.startsWith(v.s,i));assert(q,"unmapped");a.push(q.i);i+=q.s.length}}}return a};
 const g=latin(raw[2]),trainModel=g.slice(0,Math.floor(g.length/2)),one=Array(29).fill(.5),two=Array.from({length:29},()=>Array(29).fill(.5));
 for(let i=0;i<trainModel.length;i++){one[trainModel[i]]++;if(i)two[trainModel[i-1]][trainModel[i]]++}
 const lo=one.map(v=>Math.log(v/(trainModel.length+14.5))),lt=two.map(row=>{let s=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/s))});
 const block=a=>{assert(a.length%d===0,"fringe");let b=[];for(let i=0;i<a.length;i+=d)b.push(a.slice(i,i+d));return b};
 const ioc=a=>{let h=new Uint32Array(29);for(let x of a)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
 const mean=a=>{let v=lo[a[0]];for(let i=1;i<a.length;i++)v+=lt[a[i-1]][a[i]];return v/a.length};
 function project(B){
  const n=B.length,cols=Array.from({length:d},(_,j)=>Uint8Array.from(B.map(b=>b[j]))),[X,Y,Z,U,V]=cols,h=new Uint16Array(29);
  let basis=[],top=null,dirs=0;
  const a=Array(d).fill(0);
  function examine(){
   dirs++;h.fill(0);const [a0,a1,a2,a3,a4]=a;
   for(let i=0;i<n;i++)h[(a0*X[i]+a1*Y[i]+a2*Z[i]+a3*U[i]+a4*V[i])%29]++;
   let ss=0;for(let j=0;j<29;j++)ss+=h[j]*(h[j]-1);
   if(!top||ss>top.ss)top={a:a.slice(),ss};
   if(basis.length<d){if(rank([...basis.map(q=>q.a),a])>basis.length)basis.push({a:a.slice(),ss});basis.sort((a,b)=>a.ss-b.ss);return}
   if(ss<=basis[0].ss)return;
   for(let i=0;i<d;i++){if(ss<=basis[i].ss)break;let test=basis.map((q,j)=>j===i?a:q.a);if(rank(test)===d){basis[i]={a:a.slice(),ss};basis.sort((a,b)=>a.ss-b.ss);return}}
  }
  function loop(i){if(i===d){examine();return}for(let x=0;x<29;x++){a[i]=x;loop(i+1)}}
  for(let i=0;i<d;i++){a.fill(0);a[i]=1;loop(i+1)}
  assert(dirs===(29**d-1)/28&&basis.length===d,"projection enumeration");
  const sumSq=basis.reduce((s,q)=>s+q.ss+n,0),fmt=q=>({...q,ioc:q.ss/(n*(n-1))});
  return {directions:dirs,n,basis:basis.map(fmt),top:fmt(top),pooledUpper:(d*sumSq-d*n)/(d*n*(d*n-1))}
 }
 const decode=(B,M,b)=>B.flatMap(x=>M.map((a,j)=>mod(dot(a,x)+b[j])));
 const encode=(P,M,b)=>{const I=inverse(M);return block(P).flatMap(p=>I.map(a=>dot(a,p.map((x,j)=>mod(x-b[j])))))};
 const perm=[];function permutations(a,b){if(!b.length){perm.push(a);return}for(const x of b)permutations([...a,x],b.filter(y=>y!==x))}permutations([],Array.from({length:d},(_,i)=>i));
 function fit(B,H){
  const pr=project(B),hr=project(H),n=B.length;
  const labels=pr.basis.map(({a})=>{let v=B.map(b=>dot(a,b)),h=Array(29).fill(0),z=[];for(let x of v)h[x]++;for(let m=1;m<29;m++)for(let b=0;b<29;b++){let s=0;for(let x=0;x<29;x++)s+=h[x]*lo[(m*x+b)%29];z.push({m,b,s})}z.sort((a,b)=>b.s-a.s);return z.slice(0,4).map(q=>({a:a.map(x=>mod(x*q.m)),b:q.b,t:v.map(x=>mod(q.m*x+q.b))}))});
  const all=labels.flat(),K=all.length,W=Array.from({length:K},()=>new Float64Array(K)),X=Array.from({length:K},()=>new Float64Array(K));
  for(let i=0;i<K;i++)for(let j=0;j<K;j++)for(let k=0;k<n;k++){W[i][j]+=lt[all[i].t[k]][all[j].t[k]];if(k)X[i][j]+=lt[all[i].t[k-1]][all[j].t[k]]}
  let best=null;
  function visit(sel){if(sel.length<d){for(let j=0;j<4;j++)visit([...sel,4*sel.length+j]);return}for(let p of perm){const ids=p.map(i=>sel[i]);let s=lo[all[ids[0]].t[0]]+X[ids[d-1]][ids[0]];for(let i=1;i<d;i++)s+=W[ids[i-1]][ids[i]];if(!best||s>best.s)best={s,ids}}}visit([]);
  const M=best.ids.map(i=>all[i].a),b=best.ids.map(i=>all[i].b),P=decode(B,M,b),Q=decode(H,M,b);
  assert(encode(P,M,b).join(",")===B.flat().join(",")&&encode(Q,M,b).join(",")===H.flat().join(","),"exact replay");
  return {projection:pr,heldoutAllKey:hr,key:{M,b},train:{n:P.length,ioc:ioc(P),mean:mean(P)},heldout:{n:Q.length,ioc:ioc(Q),mean:mean(Q)},preview:Q.slice(0,80).map(x=>C.translit[x]).join(" "),P,Q}
 }
 const get=(a,b)=>C.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);
 const O=get(33,39),H=get(3,7);assert(O.length===1680&&H.length===1145,"source geometry");
 const out={original:fit(block(O),block(H)),plants:[]};delete out.original.P;delete out.original.Q;
 let rng=0x33011033;function rand(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%29}function key(){let M;do{M=Array.from({length:d},()=>Array.from({length:d},rand))}while(rank(M)!==d);return {M,b:Array.from({length:d},rand)}}
 for(let j=0;j<2;j++){const P=(j===0?gp:g.slice(Math.floor(g.length/2))).slice(0,O.length+H.length),K=key(),A=encode(P.slice(0,O.length),K.M,K.b),B=encode(P.slice(O.length),K.M,K.b),F=fit(block(A),block(B));let trainExact=F.P.filter((v,i)=>v===P[i]).length,holdExact=F.Q.filter((v,i)=>v===P[O.length+i]).length;delete F.P;delete F.Q;out.plants.push({name:["native solved","independent Gibran"][j],trueKey:K,trainExact,holdExact,...F})}
 return out
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
