"use strict";
const fs=require("node:fs");
const {buildDecoder}=require("./lp2_ciphertext_duplicate_deletion_viterbi_sft.cjs");
function experiment(gp,raw,decode){
 const Q=29,mod=x=>(x+Q)%Q;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);t=t.slice(a?a.index+a[0].length:0,b?b.index:t.length);return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).flatMap(w=>{let p=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!q)throw Error(w);p.push(q.i);j+=q.t.length}return p})}
 const donors=raw.map(native),train=new Float64Array(841);let n=0;
 for(const p of donors){const end=Math.floor(p.length*.6);for(let i=1;i<end;i++)if(p[i-1]&&p[i]){train[p[i-1]*29+p[i]]++;n++;}}
 for(let i=0;i<841;i++)train[i]/=n;
 const cells=[];for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a!==b)cells.push([a,b]);const D=cells.length;
 const kernels=Array.from({length:841},(_,i)=>{const x=Math.floor(i/29),y=i%29;return Float64Array.from(cells,([a,b])=>train[mod(a-x)*29+mod(b-y)]);});
 const G=new Float64Array(841*841);
 for(let i=0;i<841;i++)for(let j=0;j<=i;j++){let z=0,A=kernels[i],B=kernels[j];for(let k=0;k<D;k++)z+=A[k]*B[k];G[i*841+j]=G[j*841+i]=z;}
 const hist=c=>{const h=new Float64Array(841);for(let i=1;i<c.length;i++)if(c[i-1]&&c[i]&&c[i-1]!==c[i])h[c[i-1]*29+c[i]]++;return Float64Array.from(cells,([a,b])=>h[a*29+b]);};
 let seed=0x7d3301;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2**32;}
 const canonical=k=>{let r=k.join(",");for(let i=1;i<k.length;i++){const x=k.slice(i).concat(k.slice(0,i)).join(",");if(x<r)r=x;}return r;};
 function fit(h,q,restarts){
  const N=h.reduce((a,b)=>a+b,0),Y=Float64Array.from(h,x=>x/N),T=new Float64Array(841);let yy=0;
  for(let j=0;j<D;j++)yy+=Y[j]*Y[j];
  for(let i=0;i<841;i++)for(let j=0;j<D;j++)T[i]+=Y[j]*kernels[i][j];
  const edges=k=>k.map((x,i)=>x*29+k[(i+1)%q]);
  function obj(e){let a=0,b=0;for(let i=0;i<q;i++){a+=T[e[i]];for(let j=0;j<q;j++)b+=G[e[i]*841+e[j]];}return a*a/b;}
  let best=null,solutions=new Map();
  for(let r=0;r<restarts;r++){let k=Array.from({length:q},()=>Math.floor(rnd()*29)),e=edges(k),v=obj(e);
   for(let sweep=0;sweep<30;sweep++){let changes=0;
    const order=Array.from({length:q},(_,i)=>i);for(let i=q-1;i;i--){const j=Math.floor(rnd()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    for(const j of order){const a=(j+q-1)%q,b=(j+1)%q;let z=k[j],s=v;const old=z;
     for(let x=0;x<29;x++){if(x===old)continue;e[a]=k[a]*29+x;e[j]=x*29+k[b];const w=obj(e);if(w>s+1e-14){s=w;z=x;}}
     e[a]=k[a]*29+z;e[j]=z*29+k[b];if(z!==old){k[j]=z;v=s;changes++;}
    }if(!changes)break;
   }
   const id=canonical(k),old=solutions.get(id);if(!old||v>old.v)solutions.set(id,{k:k.slice(),v});
   if(!best||v>best.v)best={k:k.slice(),v};
  }
  const sorted=[...solutions.values()].sort((a,b)=>b.v-a.v);
  return {best:best.k,score:best.v,residual:yy-best.v,N,top:sorted.slice(0,10),unique:solutions.size,scoreKey:k=>obj(edges(k))};
 }
 function plant(p,k){let s=0,last=-1,c=[],full=[],retainedIndex=[];for(let i=0;i<p.length;i++){const x=p[i];let y=x===0?0:mod(x+k[s]);if(x)s=(s+1)%k.length;full.push(y);if(y===last&&rnd()<.81)continue;c.push(y);retainedIndex.push(i);last=y;}if(hist(c).some((x,i)=>x!==hist(full)[i]))throw Error("offdiagonal invariant");return {c,retainedIndex};}
 function pairCheck(c,k){const h=hist(c),N=h.reduce((a,b)=>a+b,0),m=new Float64Array(D);for(let i=0;i<k.length;i++){const v=kernels[k[i]*29+k[(i+1)%k.length]];for(let j=0;j<D;j++)m[j]+=v[j];}const sum=m.reduce((a,b)=>a+b,0);let ll=0,uniform=0;for(let j=0;j<D;j++){ll+=h[j]*Math.log(m[j]/sum+1e-20);uniform+=h[j]*Math.log(1/D);}return {N,gainPerPair:(ll-uniform)/N};}
 const results=[];for(const q of [8,13])for(const d of [1,2]){const p=donors[d].slice(Math.floor(donors[d].length*.6)+500,Math.floor(donors[d].length*.6)+500+12956);const k=Array.from({length:q},()=>Math.floor(rnd()*29));const {c}=plant(p,k);const f=fit(hist(c),q,64);results.push({q,d,n:p.length,retained:c.length,key:k,found:f.best,exact:canonical(k)===canonical(f.best),trueScore:f.scoreKey(k),score:f.score,residual:f.residual,topRank:f.top.findIndex(x=>canonical(x.k)===canonical(k)),unique:f.unique});}
 const split=[];const cut=9640;
 for(const q of [8,13])for(const d of [1,2]){const p=donors[d].slice(Math.floor(donors[d].length*.6)+18000,Math.floor(donors[d].length*.6)+18000+13400);const k=Array.from({length:q},()=>Math.floor(rnd()*29));const {c,retainedIndex}=plant(p,k);const f=fit(hist(c.slice(0,cut)),q,64),h=c.slice(cut);const r=decode(h,f.best,.81);const truth=p.slice(retainedIndex[cut],retainedIndex.at(-1)+1);split.push({q,d,key:k,found:f.best,exact:canonical(k)===canonical(f.best),fitResidual:f.residual,held:pairCheck(h,f.best),decode:{...r,p:undefined},truthN:truth.length,edit:edit(r.p,truth)});}
 function edit(a,b){let d=Uint32Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const z=new Uint32Array(b.length+1);z[0]=i+1;for(let j=0;j<b.length;j++)z[j+1]=Math.min(d[j]+Number(a[i]!==b[j]),d[j+1]+1,z[j]+1);d=z;}return d[b.length];}
 const original=gp.pages.slice(0,56).flatMap(x=>x.indices),originalResults=[];
 for(const q of [8,13]){const f=fit(hist(original.slice(0,cut)),q,64),h=original.slice(cut);const candidates=f.top.map(x=>{const r=decode(h,x.k,.81);return {key:x.k,fit:x.v,held:pairCheck(h,x.k),decode:{...r,p:undefined}};});originalResults.push({q,fitResidual:f.residual,unique:f.unique,candidates});}
 return {trainPairs:n,donorLengths:donors.map(x=>x.length),controls:results,split,originalResults};
}
const gp=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const solved=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
const donors=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"].map(x=>fs.readFileSync("resources/control/"+x,"utf8"));
console.log(JSON.stringify(experiment(gp,donors,buildDecoder(solved,gp).inverse),null,2));
