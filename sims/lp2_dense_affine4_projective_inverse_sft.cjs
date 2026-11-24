'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function(raw){
 const corpus=JSON.parse(raw[0]),native=JSON.parse(raw[1]);
 const mod=x=>(x%29+29)%29, inv=x=>{for(let a=1;a<29;a++)if(mod(a*x)===1)return a;throw Error("singular")};
 const dot=(a,b)=>mod(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]);
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 const rank=rows=>{const a=rows.map(x=>x.slice());let j=0;for(let c=0;c<4;c++){let k=a.findIndex((r,i)=>i>=j&&r[c]);if(k<0)continue;[a[j],a[k]]=[a[k],a[j]];const u=inv(a[j][c]);a[j]=a[j].map(x=>mod(x*u));for(let i=j+1;i<a.length;i++){const q=a[i][c];a[i]=a[i].map((x,l)=>mod(x-q*a[j][l]))}j++}return j};
 const inverse=M=>{const a=M.map((x,i)=>[...x,...Array.from({length:4},(_,j)=>+(i===j))]);for(let i=0;i<4;i++){let k=a.findIndex((r,j)=>j>=i&&r[i]);assert(k>=0,"singular matrix");[a[i],a[k]]=[a[k],a[i]];let u=inv(a[i][i]);a[i]=a[i].map(x=>mod(x*u));for(let j=0;j<4;j++)if(j!==i){let q=a[j][i];a[j]=a[j].map((x,l)=>mod(x-q*a[i][l]))}}return a.map(x=>x.slice(4))};
 const parse=t=>[...t].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0);
 const tok=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
 const latin=t=>{const a=[];for(const w of (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[])){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const v=tok.find(v=>w.startsWith(v.s,i));if(!v)throw Error(w);a.push(v.i);i+=v.s.length}}}return a};
 const gp=native.sections.flatMap(s=>parse(s.source_text)), g=latin(raw[2]);
 const model=g.slice(0,Math.floor(g.length/2));
 const one=Array(29).fill(.5),two=Array.from({length:29},()=>Array(29).fill(.5));for(let i=0;i<model.length;i++){one[model[i]]++;if(i)two[model[i-1]][model[i]]++}const lo=one.map(x=>Math.log(x/(model.length+14.5)));const lt=two.map(row=>{const n=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/n))});
 const rows=[];for(let i=0;i<4;i++){const loop=(a,j)=>{if(j===4){rows.push(a);return}for(let x=0;x<29;x++)loop([...a,x],j+1)};loop([...Array(i).fill(0),1],i+1)}assert(rows.length===25260,"projective count");
 const blocks=(a,phase=0)=>{const b=[];for(let i=phase;i+3<a.length;i+=4)b.push(a.slice(i,i+4));return b};
 const ioc=a=>{let n=new Uint32Array(29);for(const x of a)n[x]++;return n.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
 const perm=[];function permutations(a,b){if(!b.length){perm.push(a);return}for(const x of b)permutations([...a,x],b.filter(y=>x!==y))}permutations([],[0,1,2,3]);
 function project(B){const n=B.length, x0=B.map(b=>b[0]),x1=B.map(b=>b[1]),x2=B.map(b=>b[2]),x3=B.map(b=>b[3]);const hist=new Uint32Array(29);const q=[];for(const a of rows){hist.fill(0);const [u,v,w,z]=a;for(let i=0;i<n;i++)hist[(u*x0[i]+v*x1[i]+w*x2[i]+z*x3[i])%29]++;let ss=0;for(let i=0;i<29;i++)ss+=hist[i]*(hist[i]-1);q.push({a,ss,ioc:ss/(n*(n-1))})}q.sort((a,b)=>b.ss-a.ss);const basis=[];for(const r of q){if(rank([...basis.map(b=>b.a),r.a])>basis.length)basis.push(r);if(basis.length===4)break}const sumSq=basis.reduce((s,r)=>s+r.ss+n,0);return {basis,top:q[0],pooledUpper:(4*sumSq-4*n)/(4*n*(4*n-1)),n}}
 function decode(B,M,b){return B.flatMap(x=>M.map((a,j)=>mod(dot(a,x)+b[j])))}
 function encode(P,M,b){const I=inverse(M);return blocks(P).flatMap(p=>I.map(a=>dot(a,p.map((x,j)=>mod(x-b[j])))))}
 function fit(B,H){
  const proj=project(B),holdAll=project(H);const N=B.length;
  const opt=proj.basis.map(({a})=>{const v=B.map(b=>dot(a,b)),hist=Array(29).fill(0);for(const x of v)hist[x]++;let opts=[];for(let m=1;m<29;m++)for(let b=0;b<29;b++){let score=0;for(let x=0;x<29;x++)score+=hist[x]*lo[(m*x+b)%29];opts.push({a:a.map(x=>mod(x*m)),b,score,t:v.map(x=>(m*x+b)%29)})}opts.sort((a,b)=>b.score-a.score);return opts.slice(0,4)});
  let best=null;
  function visit(a){if(a.length<4){for(const x of opt[a.length])visit([...a,x]);return}
   for(const p of perm){const [v,w,x,y]=p.map(i=>a[i].t);let s=lo[v[0]];for(let i=0;i<N;i++){s+=lt[v[i]][w[i]]+lt[w[i]][x[i]]+lt[x[i]][y[i]];if(i)s+=lt[y[i-1]][v[i]]}if(!best||s>best.s)best={s,M:p.map(i=>a[i].a),b:p.map(i=>a[i].b)}}}
  visit([]);const p=decode(B,best.M,best.b),h=decode(H,best.M,best.b);const score=a=>{let s=lo[a[0]];for(let i=1;i<a.length;i++)s+=lt[a[i-1]][a[i]];return s/a.length};
  assert(encode(p,best.M,best.b).join(",")===B.flat().join(","),"train replay");assert(encode(h,best.M,best.b).join(",")===H.flat().join(","),"holdout replay");
  return {proj,holdAll,key:{M:best.M,b:best.b},train:{n:p.length,ioc:ioc(p),score:score(p)},holdout:{n:h.length,ioc:ioc(h),score:score(h)},preview:h.slice(0,72).map(x=>corpus.translit[x]).join(" "),p,h}
 }
 const get=(l,h)=>corpus.pages.filter(p=>p.page>=l&&p.page<=h).flatMap(p=>p.indices);
 const orig=get(16,55),cut=get(16,39).length;
 const out={projectiveDirections:rows.length,modelN:model.length,nativeN:gp.length,original:[],plants:[]};
 for(let phase=0;phase<4;phase++){const bb=blocks(orig,phase),n=Math.floor((cut-phase)/4);const f=fit(bb.slice(0,n),bb.slice(n));delete f.p;delete f.h;out.original.push({phase,...f})}
 const P1=gp.slice(0,gp.length-gp.length%4),P2=g.slice(Math.floor(g.length/2),Math.floor(g.length/2)+orig.length-orig.length%4);
 const keys=[{M:[[1,2,3,4],[5,6,7,9],[2,7,4,1],[8,3,11,5]],b:[4,17,2,28]},{M:[[3,8,1,6],[7,2,11,5],[4,1,8,2],[9,5,2,13]],b:[21,3,11,9]}];
 for(let j=0;j<2;j++){const P=[P1,P2][j],K=keys[j];assert(rank(K.M)===4,"plant key rank");const C=encode(P,K.M,K.b),B=blocks(C),n=Math.floor(B.length*.65),f=fit(B.slice(0,n),B.slice(n));const all=[...f.p,...f.h],exact=all.reduce((s,x,i)=>s+(x===P[i]),0);delete f.p;delete f.h;out.plants.push({name:["native solved","Gibran untouched second half"][j],trueKey:K,exact,total:P.length,nativeIoc:ioc(P),...f})}
 return out
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
