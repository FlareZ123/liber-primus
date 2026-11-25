'use strict';
/** Exact collision-count lower bound for stationary local plaintext functions and linear ciphertext filters. */
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
function experiment(gp,raws){
 const N=29,mod=x=>(x%N+N)%N,sy=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),assert=(v,m)=>{if(!v)throw Error(m)};
 function enc(raw){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(raw),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(raw);return raw.slice(a?a.index+a[0].length:0,b?b.index:raw.length).toUpperCase().match(/[A-Z]+/g).flatMap(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let p=[];while(w.length){const a=sy.find(x=>w.startsWith(x.t));p.push(a.i);w=w.slice(a.t.length)}return p})}
 const refs=raws.map(enc),C=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(C.length===12956,"original length");
 const pages=[[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]],scopes=[[0,C.length,"all"],...pages.map(([lo,hi])=>[gp.pages.filter(p=>p.page<lo).flatMap(p=>p.indices).length,gp.pages.filter(p=>p.page<hi).flatMap(p=>p.indices).length,`${lo}-${hi-1}`])];
 function pairs(a,k){let code=0,power=N**(k-1),h=new Map(),count=0;for(let i=0;i<a.length;i++){code=(code%power)*N+a[i];if(i>=k-1){const prev=h.get(code)||0;count+=prev;h.set(code,prev+1)}}return count}
 function windows(a,k,n){const size=n-k+1,codes=[];let code=0,power=N**(k-1);for(let i=0;i<a.length;i++){code=(code%power)*N+a[i];if(i>=k-1)codes.push(code)}if(size<1||codes.length<size)return null;let h=new Map(),count=0,min=Infinity,max=0,minStart=-1;for(let i=0;i<codes.length;i++){if(i>=size){const c=codes[i-size],x=h.get(c);count-=x-1;if(x===1)h.delete(c);else h.set(c,x-1)}const c=codes[i],x=h.get(c)||0;count+=x;h.set(c,x+1);if(i>=size-1){if(count<min){min=count;minStart=i-size+1}max=Math.max(max,count)}}assert(pairs(a.slice(minStart,minStart+n),k)===min,"reference min witness");return {min,max,minStart,windows:codes.length-size+1}}
 function directions(w){const out=[];for(let first=0;first<w;first++){const q=Array(w).fill(0);q[first]=1;function rec(i){if(i===w){out.push(q.slice());return}for(let j=0;j<N;j++){q[i]=j;rec(i+1)}}rec(first+1)}return out}
 function filtered(a,coef){return Array.from({length:a.length-coef.length+1},(_,i)=>coef.reduce((s,v,j)=>s+v*a[i+j],0)%N)}
 function exhaustive(a,w,intervals){
 const ds=directions(w),k=4,base=N**(k-1),cap=N**k,stamps=new Int32Array(cap),hist=new Uint16Array(cap),cs=new Int32Array(cap),ch=new Uint16Array(cap),max=intervals.map(()=>({count:-1,coef:null}));let epoch=0,cepoch=0;const out=new Uint8Array(a.length-w+1);
 const x0=a.slice(0,out.length),x1=a.slice(1,1+out.length),x2=a.slice(2,2+out.length),x3=w===4?a.slice(3,3+out.length):null;
 for(const q of ds){
  const [q0,q1,q2,q3]=q;for(let i=0;i<out.length;i++)out[i]=(q0*x0[i]+q1*x1[i]+q2*x2[i]+(w===4?q3*x3[i]:0))%N;
  epoch++;cepoch++;let code=0,p=1,total=0,local=0;
  for(let i=0;i<out.length;i++){
    code=(code%base)*N+out[i];if(i<k-1)continue;
    if(stamps[code]===epoch){total+=hist[code];hist[code]++}else{stamps[code]=epoch;hist[code]=1}
    if(intervals.length===1)continue;
    let start=i-k+1;
    while(p<intervals.length&&start>=intervals[p][1]){
      if(local>max[p].count)max[p]={count:local,coef:q.slice()};p++;cepoch++;local=0;
    }
    if(p<intervals.length&&start>=intervals[p][0]&&start+w+k-1<=intervals[p][1]){
      if(cs[code]===cepoch){local+=ch[code];ch[code]++}else{cs[code]=cepoch;ch[code]=1}
    }
  }
  if(p<intervals.length&&local>max[p].count)max[p]={count:local,coef:q.slice()};
  if(total>max[0].count)max[0]={count:total,coef:q.slice()};
 }
 for(let i=0;i<intervals.length;i++){const [s,e]=intervals[i],x=max[i];assert(x.count===pairs(filtered(a.slice(s,e),x.coef),4),"max witness "+i)}
 return {directions:ds.length,max}
 }
 const result=[];
 for(const w of [3,4]){
 const start=Date.now(),orig=exhaustive(C,w,scopes),bounds=scopes.map(([s,e,name],i)=>{const b=refs.map(p=>windows(p,w+3,e-s));return {scope:name,n:e-s,original:orig.max[i],refs:b,minimum:Math.min(...b.map(x=>x.min)),excluded:b.every(x=>x.min>orig.max[i].count)}});
 const plantP=refs[0].slice(10000,10000+C.length),q=w===3?[4,19,1]:[8,2,13,1],key=Array.from({length:29},(_,i)=>(11*i+7)%29),pc=Array(w-1).fill(2);
 const g=(p,i)=>key[mod(p[i+w-1]+p[i]*p[i+1]+(w===4?5*p[i+2]:0))];
 for(let i=0;i<=plantP.length-w;i++){let z=g(plantP,i);for(let j=0;j<w-1;j++)z-=q[j]*pc[i+j];pc.push(mod(z))}
 const normal=q.map(x=>mod(x*Array.from({length:28},(_,i)=>i+1).find(i=>q[0]*i%N===1)));
 const pcount=pairs(plantP,w+3),fcount=pairs(filtered(pc,normal),4);
 assert(pc.length===plantP.length&&fcount>=pcount,"nonlinear plant");
 let recovered=Array.from(plantP.slice(0,w-1));const inv=Array(29);key.forEach((v,i)=>inv[v]=i);
 for(let i=0;i<=pc.length-w;i++){let z=q.reduce((s,v,j)=>s+v*pc[i+j],0)%N;recovered.push(mod(inv[z]-recovered[i]*recovered[i+1]-(w===4?5*recovered[i+2]:0)))}
 assert(recovered.every((x,i)=>x===plantP[i]),"plant roundtrip");
 result.push({w,directions:orig.directions,bounds,plant:{n:pc.length,plaintextPairs:pcount,filteredPairs:fcount,normalizedCoeff:normal,recovered:recovered.length},ms:Date.now()-start})
 }
 return {scope:"all continuous order <=3 GF29 output filters; arbitrary stationary local plaintext function",n:C.length,result};
}
const raw=files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'));console.log(JSON.stringify(experiment(JSON.parse(raw[0]),raw.slice(1)),null,2));
