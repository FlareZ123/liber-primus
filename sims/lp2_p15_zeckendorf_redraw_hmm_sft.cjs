'use strict';
// Agent28: carry-shift proposal with transparent F and one collision redraw.
const fs=require('node:fs'),path=require('node:path');
function experiment(data,index,topFirst=4){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const N=1883,cut=1752,r=.8,F=[1,2];while(F.at(-1)+F.at(-2)<2*N+1)F.push(F.at(-1)+F.at(-2));const M=F.length;
 const masks=Array.from({length:2*N+1},(_,n)=>{let b=0;for(let k=M-1;k>=0;k--)if(F[k]<=n){b|=1<<k;n-=F[k]}assert(n===0,"Zeckendorf");return b});
 const cls=masks.map((b,j)=>j?31-Math.clz32(b^masks[j-1]):-1);
 const U=new Float64Array(29).fill(1),D=new Float64Array(29).fill(1);
 for(const p of train){for(let i=0;i<p.length;i++){U[p[i]]++;if(i&&p[i]&&p[i-1])D[mod(p[i]-p[i-1])]++}}
 const pF=U[0]/U.reduce((a,b)=>a+b,0),dSum=D.reduce((a,b)=>a+b,0),d=D.map(v=>v/dSum),uniform=1/29;
 let seed=0x18ae743b;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32};
 function keyAt(K,j){let m=masks[j],v=K[0];for(let k=0;k<M;k++)if(m&(1<<k))v+=K[k+1];return v%29}
 function forward(P,K){let j=0,prev=-1,holds=0,skips=0;let C=P.map(p=>{if(!p){prev=0;holds++;return 0}let c=mod(p+keyAt(K,j++));if(c===prev&&rnd()<r){c=mod(p+keyAt(K,j++));skips++}prev=c;return c});return {C,j,holds,skips}}
 function rank(C,ds,maxSkip=180){
 let a=new Float64Array(2*N+3),b=new Float64Array(2*N+3);a[0]=1;let log=0,zeros=0;
 const q=ds.length,lookup=Array.from({length:29},(_,x)=>Array.from({length:q+1},(_,k)=>k<q?d[mod(x-ds[k])]:uniform));
 const eq=Array.from({length:29},(_,x)=>Array.from({length:q+1},(_,k)=>k<q?+(x===ds[k]):uniform));
 const cl=cls.map(k=>k>=0&&k<q?k:q),norm=(1-pF)*29;
 let lo=0,hi=0;
 for(let i=0;i<cut;i++){
  let c=C[i],prev=i?C[i-1]:-1,delta=prev<0?0:mod(c-prev),zero=c===0;
  if(zero)zeros++;
  const nlo=Math.max(0,i+1-zeros),nhi=i+1+Math.min(maxSkip,i+1);
  b.fill(0,nlo,nhi+1);
  const L=lookup[delta],E=eq[delta],J=lookup[0],nr=delta===0?1-r:1,informative=prev>0;
  for(let j=lo;j<=hi;j++){
   const w=a[j];if(!w)continue;
   if(zero&&j>=nlo)b[j]+=w*pF*29;
   let k=cl[j],l=cl[j+1];
   let pn=informative?L[k]:uniform;
   if(j+1<=nhi)b[j+1]+=w*norm*pn*(prev<0?1:nr);
   if(prev>=0&&j+2<=nhi){const pc=informative?J[k]:uniform;b[j+2]+=w*norm*r*pc*E[l]}
  }
  let sum=0;for(let j=nlo;j<=nhi;j++)sum+=b[j];if(!sum)return -Infinity;
  log+=Math.log(sum);for(let j=nlo;j<=nhi;j++)b[j]/=sum;
  [a,b]=[b,a];lo=nlo;hi=nhi;
 }
 return log/cut;
 }
 function propose(C){
 const rank0=Array.from({length:29},(_,a)=>({ds:[a],s:rank(C,[a])})).sort((a,b)=>b.s-a.s);
 let rank1=[];for(let {ds:[a]} of rank0.slice(0,topFirst))for(let b=0;b<29;b++)rank1.push({ds:[a,b],s:rank(C,[a,b])});
 rank1.sort((a,b)=>b.s-a.s);return {rank0,top:rank1.slice(0,16)};
 }
 const inputs=[];
 for(let i=0;i<4;i++){let P=em.slice(100000+i*N,100000+(i+1)*N);assert(P.length===N,"control length");let K=Array.from({length:M+1},()=>Math.floor(29*rnd())),f=forward(P,K);inputs.push({name:"Emerson-redraw-"+i,K,...f})}
 inputs.push({name:"original-p15-22",C:co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20)});
 let t=inputs[index],fit=propose(t.C),truth=t.K?[t.K[1],mod(t.K[2]-t.K[1])]:null;
 return {N,cut,r,maxSkip:180,pF,F,topFirst,name:t.name,truth,key:t.K??null,holds:t.holds??null,skips:t.skips??null,rank0:fit.rank0.slice(0,10),top:fit.top,truthRank:truth?fit.top.findIndex(x=>x.ds.every((v,i)=>v===truth[i])):null,C:t.C};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),Number(process.argv[2]??0)),null,2));
module.exports={experiment,paths};
