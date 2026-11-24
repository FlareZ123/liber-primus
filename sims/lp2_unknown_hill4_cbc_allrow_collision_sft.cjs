'use strict';
// Agent5: all-row collision invariance of unknown affine/permuted Hill4 CBC.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,solved,phases=[0,1,2,3]){
 const Q=29,D=4,check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%Q+Q)%Q;
 const c=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);check(c.length===1744,"original section");
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).flatMap(w=>[...w].map(c=>idx.get(c))));check(donor.length===2979,"native source");
 const rowOf=k=>[Math.floor(k/Q**3),Math.floor(k/Q**2)%Q,Math.floor(k/Q)%Q,k%Q];
 function actual(p){
  const h=new Uint16Array(D*Q),s=[0,0,0,0];for(let i=0;i<p.length;i++){const j=i%D;s[j]+=h[j*Q+p[i]]++;}return s;
 }
 function bounds(c,phase){
  const B=Math.floor((c.length-phase)/D)-1,AB=new Uint8Array(Q*Q*B),CD=new Uint8Array(Q*Q*B),P=Array.from({length:D},()=>new Uint8Array(B));
  for(let i=0;i<B;i++){
   const j=phase+(i+1)*D,x=c.slice(j,j+D);
   for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){AB[(a*Q+b)*B+i]=(a*x[0]+b*x[1])%Q;CD[(a*Q+b)*B+i]=(a*x[2]+b*x[3])%Q;}
   for(let k=0;k<D;k++)P[k][i]=c[j-D+k];
  }
  const [p0,p1,p2,p3]=P,maximum=[-1,-1,-1,-1],winner=[0,0,0,0],h=new Uint16Array(D*Q);
  for(let ab=0;ab<Q*Q;ab++)for(let cd=0;cd<Q*Q;cd++){
   if(ab===0&&cd===0)continue;h.fill(0);
   let s0=0,s1=0,s2=0,s3=0,pa=ab*B,pb=cd*B;
   for(let i=0;i<B;i++){
    let v=AB[pa+i]+CD[pb+i];if(v>=Q)v-=Q;
    let a=v-p0[i];if(a<0)a+=Q;let b=v-p1[i];if(b<0)b+=Q;let d=v-p2[i];if(d<0)d+=Q;let e=v-p3[i];if(e<0)e+=Q;
    s0+=h[a]++;s1+=h[Q+b]++;s2+=h[2*Q+d]++;s3+=h[3*Q+e]++;
   }
   const row=ab*Q*Q+cd;if(s0>maximum[0]){maximum[0]=s0;winner[0]=row;}if(s1>maximum[1]){maximum[1]=s1;winner[1]=row;}if(s2>maximum[2]){maximum[2]=s2;winner[2]=row;}if(s3>maximum[3]){maximum[3]=s3;winner[3]=row;}
  }
  const sum=maximum.reduce((a,b)=>a+b,0),rows=winner.map(rowOf);
  // Each independent winner attains its count. No invertibility assumption is
  // needed for this upper bound on the sum of all four actual row collisions.
  for(let j=0;j<D;j++){
   const v=[];for(let i=0;i<B;i++){const k=phase+(i+1)*D;v.push(mod(rows[j].reduce((s,a,t)=>s+a*c[k+t],0)-c[k-D+j]));}
   const h=new Uint16Array(Q);let s=0;for(const a of v)s+=h[a]++;check(s===maximum[j],"winner replay");
  }
  let minNative=Infinity,maxNative=0,minStart=-1;
  for(let s=0;s+4*B<=donor.length;s++){const n=actual(donor.slice(s,s+4*B)).reduce((a,b)=>a+b,0);if(n<minNative){minNative=n;minStart=s;}maxNative=Math.max(maxNative,n);}
  return {phase,blocks:B,maximum,winner:rows,sum,maxMeanIoc:sum/(D*B*(B-1)/2),minNative,maxNative,minStart,nativeWindows:donor.length-4*B+1,minNativeMeanIoc:minNative/(D*B*(B-1)/2)};
 }
 return phases.map(phase=>bounds(c,phase));
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read(paths[0]),read(paths[1])),null,2));
