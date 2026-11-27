'use strict';
// Run: node sims/lp2_p40_colmajor_pretransposition_digraph_sft.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function experiment(inputs){
 const d=JSON.parse(inputs[0].content), A=29,B=841,W=8,R=375,N=3000;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 const donors=inputs.slice(1).map(x=>({name:x.path,a:encode(x.content)}));
 const full=d.pages.slice(40,54).flatMap(x=>x.indices),header=full.slice(0,8),C=full.slice(8);
 const order=header.map((v,i)=>i).sort((i,j)=>header[i]-header[j]),inv=Array(8);order.forEach((x,i)=>inv[x]=i);
 assert(order.join(",")==="0,4,7,1,2,5,6,3"&&C.length===N,"source");
 function hist(){const f=new Int32Array(376);f[0]=B;return {h:new Int16Array(B),f,Q:0}}
 function update(o,x,delta){const n=o.h[x],m=n+delta;assert(m>=0&&m<o.f.length,"count");o.f[n]--;o.f[m]++;o.h[x]=m;o.Q+=m*(m-1)-n*(n-1)}
 function equal(a,b){if(a.Q!==b.Q)return false;for(let i=0;i<a.f.length;i++)if(a.f[i]!==b.f[i])return false;return true}
 function targets(C,q){const out=Array.from({length:q},hist);for(let i=0;i<N;i+=2)update(out[(i/2)%q],A*C[i]+C[i+1],1);return out}
 function read(a,start,order){const t=[];for(const c of order)for(let r=0;r<R;r++)t.push(a[start+r*W+c]);return t}
 function direct(P,C,q){const f=Array.from({length:q},()=>new Int16Array(B).fill(-1)),g=Array.from({length:q},()=>new Int16Array(B).fill(-1));
  for(let i=0;i<N;i+=2){const z=(i/2)%q,p=A*P[i]+P[i+1],c=A*C[i]+C[i+1];if((f[z][p]!==-1&&f[z][p]!==c)||(g[z][c]!==-1&&g[z][c]!==p))return null;f[z][p]=c;g[z][c]=p}
  return f.map(x=>x.filter(v=>v>=0).length);
 }
 function scan(a,order,C,verify=true){
  const t4=targets(C,4),t8=targets(C,8);let windows=0;const out={q4:{spectra:0,exact:0,first:null,maxPhases:0},q8:{spectra:0,exact:0,first:null,maxPhases:0}};
  for(let s=0;s<2*W&&s+N<=a.length;s++){
   const h4=Array.from({length:4},hist),h8=Array.from({length:8},hist);
   let shift=0;
   const pair=(start,j,r)=>A*a[start+r*W+order[j]]+a[start+(r+1)*W+order[j]];
   const seam=(start,j)=>A*a[start+(R-1)*W+order[j]]+a[start+order[j+1]];
   function upd(p,v,delta){update(h4[(p+shift)%4],v,delta);update(h8[(p+shift)%8],v,delta)}
   for(let j=0;j<W;j++){for(let r=j%2;r+1<R;r+=2)upd((R*j+r)/2,pair(s,j,r),1);if(j%2===0)upd((R*j+R-1)/2,seam(s,j),1)}
   for(let start=s;start+N<=a.length;start+=2*W){
    windows++;
    for(const [q,h,t,rec] of [[4,h4,t4,out.q4],[8,h8,t8,out.q8]]){
     let matches=0;for(let k=0;k<q;k++)if(equal(h[(k+shift)%q],t[k]))matches++;
     if(matches>rec.maxPhases)rec.maxPhases=matches;
     if(matches===q){rec.spectra++;const key=direct(read(a,start,order),C,q);if(key){rec.exact++;if(rec.first===null)rec.first={start,observedMapEntries:key}}}
    }
    if(verify&&(start===s||start+N+2*W>a.length||windows%65536===0)){
     const p=read(a,start,order);for(const [q,h] of [[4,h4],[8,h8]]){const t=targets(p,q);assert(t.every((v,k)=>equal(v,h[(k+shift)%q])),"rolling column spectra")}
    }
    if(start+2*W+N>a.length)break;
    for(let j=0;j<W;j++){const r=j%2;upd((R*j+r)/2,pair(start,j,r),-1);if(j%2===0)upd((R*j+R-1)/2,seam(start,j),-1)}
    shift=(shift+1)%8;
    for(let j=0;j<W;j++){const r=j%2+372;upd((R*j+r)/2,pair(start+2*W,j,r),1);if(j%2===0)upd((R*j+R-1)/2,seam(start+2*W,j),1)}
   }
  }
  assert(windows===a.length-N+1,"all starts");
  return {windows,...out};
 }
 const originals=[];for(const [label,key] of [["rank-order",order],["inverse-rank",inv]])for(const {name,a} of donors)originals.push({label,key,name,...scan(a,key,C)});
 function plant(P,q,seed,key){
  let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
  function perm(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  const p=read(P,0,key),maps=Array.from({length:q},()=>perm(B)),C=[];
  for(let i=0;i<N;i+=2){const z=maps[(i/2)%q][A*p[i]+p[i+1]];C.push(Math.floor(z/A),z%A)}
  const r=scan(P,key,C);assert(r["q"+q].exact===1,"known donor full map recovery");
  const found=Array.from({length:q},()=>new Int16Array(B).fill(-1));
  for(let i=0;i<N;i+=2)found[(i/2)%q][A*C[i]+C[i+1]]=A*p[i]+p[i+1];
  const plain=Array(N);for(let i=0;i<N;i+=2){const v=found[(i/2)%q][A*C[i]+C[i+1]],j=Math.floor(i/R),r0=i%R,j1=Math.floor((i+1)/R),r1=(i+1)%R;plain[r0*W+key[j]]=Math.floor(v/A);plain[r1*W+key[j1]]=v%A}
  assert(plain.every((v,i)=>v===P[i]),"recovered inverse exact");
  return {q,seed,key,recovered:N,exact:r["q"+q]};
 }
 return {inputs:inputs.map(({path,sha})=>({path,sha})),header,orders:[order,inv],originals,plants:[plant(donors[0].a.slice(678,3678),4,0x40080401,order),plant(donors[1].a.slice(789,3789),8,0x40080801,inv)]};
}
console.log(JSON.stringify(experiment(inputs),null,2));
