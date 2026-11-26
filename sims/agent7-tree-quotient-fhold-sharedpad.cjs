"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const study=function study(raw){
 const R=29,START=29,mod=x=>(x%R+R)%R,assert=(x,m)=>{if(!x)throw Error(m)},corpus=JSON.parse(raw[0]);
 const tokens=corpus.translit.map((x,i)=>[x.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let out=[];for(let w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:tokens.find(t=>w.startsWith(t[0]));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 function div(x,r){let q=[x[0]];for(let i=1;i<x.length-1;i++)q.push(mod(x[i]+r*q[i-1]));assert(mod(x.at(-1)+r*q.at(-1))===0,"remainder");return q}
 function mul(x,r){return [x[0],...x.slice(1).map((a,i)=>mod(a-r*x[i])),mod(-r*x.at(-1))]}
 const pages=corpus.pages.map(p=>p.indices), original=[[div(div(pages[10],7),24),pages[12]],[div(pages[11],24),pages[13]]];
 assert(JSON.stringify(mul(mul(original[0][0],24),7))===JSON.stringify(pages[10]),"p10");assert(JSON.stringify(mul(original[1][0],24))===JSON.stringify(pages[11]),"p11");
 const train=encode(raw[1]),g=encode(raw[2]),e=encode(raw[3]),c1=new Float64Array(R),c2=new Float64Array(R*R),p=new Float64Array((R+1)*R);
 for(let i=0;i<train.length;i++){c1[train[i]]++;if(i)c2[train[i-1]*R+train[i]]++}
 for(let z=0;z<R;z++)p[START*R+z]=(c1[z]+.5)/(train.length+R*.5);
 for(let a=0;a<R;a++){let n=0;for(let z=0;z<R;z++)n+=c2[a*R+z];for(let z=0;z<R;z++)p[a*R+z]=(c2[a*R+z]+16*p[START*R+z])/(n+16)}
 const prob=(a,z)=>p[a*R+z];
 /** Single-stream suffix likelihood ratio, optionally requiring at least one non-F. */
 function suffix(c){
  const n=c.length,L=(n+1)*30,tot=[new Float64Array(L),new Float64Array(L)],max=[new Float64Array(L),new Float64Array(L)],choice=[new Uint8Array(L),new Uint8Array(L)];
  for(let a=0;a<30;a++)tot[0][n*30+a]=max[0][n*30+a]=1;
  for(let i=n-1;i>=0;i--)for(let a=0;a<30;a++)for(let req=0;req<2;req++){
   let ix=i*30+a,s=0,best=0,bz=0;
   for(let z=0;z<R;z++){if(z===0&&c[i]!==0)continue;let nextReq=z===0?req:0,w=prob(a,z)*(z===0?29:1),j=(i+1)*30+z;
    s+=w*tot[nextReq][j];let v=w*max[nextReq][j];if(v>best){best=v;bz=z}}
   tot[req][ix]=s;max[req][ix]=best;choice[req][ix]=bz;
  }return {tot,max,choice}
 }
 function holds(c,i,a){let w=1,out=[{pos:i,last:a,w}];while(i<c.length&&c[i]===0){w*=29*prob(a,0);a=0;i++;out.push({pos:i,last:a,w})}return out}
 function infer(c,d,truth){
  let n=c.length,m=d.length,W=m+1,N=(n+1)*W*29;
  const f=new Float64Array(N),v=new Float64Array(N),pi=new Int16Array(N),pj=new Int16Array(N),pk=new Uint8Array(N);
  const sc=suffix(c),sd=suffix(d);let total=0,best=0,terminal=null,visits=0,edges=0;
  function finish(i,j,k,a,b,hc,hd,fs,vs){
   let endC=hc.at(-1),endD=hd.at(-1);
   // Canonical disjoint terminal cases: left all holds; otherwise right all holds and left consumes at least once.
   if(endC.pos===n){let ix=j*30+b,w=endC.w;total+=fs*w*sd.tot[0][ix];let q=vs*w*sd.max[0][ix];if(q>best){best=q;terminal={i,j,k,a,b,side:0,req:0}}}
   if(endD.pos===m){let ix=i*30+a,w=endD.w;total+=fs*w*sc.tot[1][ix];let q=vs*w*sc.max[1][ix];if(q>best){best=q;terminal={i,j,k,a,b,side:1,req:1}}}
  }
  function step(i,j,k,fs,vs){
   let a=k===START?START:mod(c[i-1]-k),b=k===START?START:mod(d[j-1]-k);
   let hc=holds(c,i,a),hd=holds(d,j,b);finish(i,j,k,a,b,hc,hd,fs,vs);
   for(let u of hc){if(u.pos===n)continue;for(let t of hd){if(t.pos===m)continue;
    let dest=((u.pos+1)*W+t.pos+1)*29,w0=29*u.w*t.w;
    for(let l=0;l<R;l++){let x=mod(c[u.pos]-l),y=mod(d[t.pos]-l);if(x===0||y===0)continue;let w=w0*prob(u.last,x)*prob(t.last,y),z=dest+l;f[z]+=fs*w;let q=vs*w;if(q>v[z]){v[z]=q;pi[z]=i;pj[z]=j;pk[z]=k}edges++}
   }}
  }
  step(0,0,START,1,1);
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){let base=(i*W+j)*29;for(let k=0;k<R;k++){let z=base+k;if(f[z]===0)continue;visits++;step(i,j,k,f[z],v[z])}}
  assert(total>0&&best>0&&terminal,"positive likelihood");
  let pc=Array(n).fill(0),pd=Array(m).fill(0),{i,j,k,a,b,side,req}=terminal;
  if(side===0){for(let h=j;h<m;h++){let z=sd.choice[req][h*30+b];pd[h]=z;if(z)req=0;b=z}}
  else {for(let h=i;h<n;h++){let z=sc.choice[req][h*30+a];pc[h]=z;if(z)req=0;a=z}}
  while(k!==START){pc[i-1]=mod(c[i-1]-k);pd[j-1]=mod(d[j-1]-k);let ix=(i*W+j)*29+k;[i,j,k]=[pi[ix],pj[ix],pk[ix]]}
  function derived(x,y){let keys=[];for(let h=0;h<x.length;h++){if(y[h]===0){assert(x[h]===0,"F hold mismatch");continue}keys.push(mod(x[h]-y[h]))}return keys}
  let kc=derived(c,pc),kd=derived(d,pd);assert(kc.slice(0,Math.min(kc.length,kd.length)).every((z,h)=>z===kd[h]),"shared-key replay");
  let base=sc.tot[0][START]*sd.tot[0][START],out={logBF:Math.log(total/base),logIndependentRatio:Math.log(base),visits,edges,zeros:[c.filter(z=>z===0).length,d.filter(z=>z===0).length],consumed:[kc.length,kd.length],decoded:[pc,pd].map(x=>x.map(z=>corpus.translit[z]).join(""))};
  if(truth)out.accuracy=[pc,pd].map((x,j)=>x.filter((z,i)=>z===truth[j][i]).length/x.length);
  return out
 }
 let seed=0xf5a117e3;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29}
 function enc(x,k){let i=0;return x.map(z=>z===0?0:mod(z+k[i++]))}
 let result={train:train.length,original:[],controls:[]};
 for(let pair=0;pair<2;pair++){let [c,d]=original[pair],n=c.length,m=d.length;assert(n===m,"aligned");
  for(let j=0;j<3;j++){let truth=[g.slice(3000+pair*10000+j*1700,3000+pair*10000+j*1700+n),e.slice(5000+pair*10000+j*1700,5000+pair*10000+j*1700+m)],k=Array.from({length:n},rand),l=Array.from({length:m},rand);
   for(let shared of [true,false])result.controls.push({pair,j,shared,...infer(enc(truth[0],k),enc(truth[1],shared?k:l),truth)});
  }result.original.push({pair,...infer(c,d)});
 }return result
};
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
