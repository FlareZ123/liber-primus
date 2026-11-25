"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const Q=29;
function encode(t){
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),out=[];
 for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
  for(let i=0;i<w.length;){
   const x=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([s])=>w.startsWith(s,i));
   if(!x)throw Error(w);out.push(x[1]);i+=x[0].length;
  }
 }
 return out;
}
const tr=encode(read("resources/control/emerson_essays_2944.txt")),g=encode(read("resources/control/gibran_prophet_58585.txt")),s=encode(read("resources/control/shakespeare_first300k.txt"));
const ct=new Float64Array(24389),dn=new Float64Array(841),big=new Float64Array(841),bd=new Float64Array(29);
for(let i=1;i<tr.length;i++){
 big[tr[i-1]*29+tr[i]]++;bd[tr[i-1]]++;
 if(i>=2){const j=tr[i-2]*29+tr[i-1];ct[j*29+tr[i]]++;dn[j]++}
}
const lm=new Float64Array(24389);
for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++){
 const j=a*Q+b,pb=(big[b*Q+c]+.3)/(bd[b]+8.7);
 lm[j*Q+c]=Math.log((ct[j*Q+c]+10*pb)/(dn[j]+10));
}
const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%29===1):0);
function masks(C,mode){
 const Z=C.flatMap((c,i)=>c===0?[i]:[]);
 if(mode==="ordinary")return [C.map(()=>false)];
 if(Z.length>16)throw Error("mask cap");
 return Array.from({length:2**Z.length},(_,m)=>{const h=C.map(()=>false);Z.forEach((i,j)=>h[i]=!!(m>>j&1));return h});
}
function score(p){let v=0;for(let i=2;i<p.length;i++)v+=lm[(p[i-2]*29+p[i-1])*29+p[i]];return v}
function solve(C,crib,offset,mode){
 const left=C.slice(0,offset),cc=C.slice(offset,offset+4),right=C.slice(offset+4),rr=masks(right,mode),ll=masks(left,mode);
 let best=null,legalModels=0,legalPaths=0,models=0;
 const rpack=rr.map(h=>({h,a:cc.concat(right.filter((_,i)=>!h[i]))})),lpack=ll.map(h=>({h,a:left.filter((_,i)=>!h[i]).concat(cc)}));
 const P=new Int16Array(4+right.length),pfull=new Int16Array(4+right.length),lP=new Int16Array(4+left.length),lFull=new Int16Array(4+left.length);
 function forward(m,pack){
  P.set(crib);
  for(let p=4;p<pack.a.length;p++){
   const x=mod((pack.a[p]-m.a*P[p-m.q]-m.b*pack.a[p-m.q]-m.d)*inv[m.u]);
   if(mode!=="ordinary"&&x===0)return -Infinity;
   P[p]=x;
  }
  pfull.set(crib);let j=4;
  for(let i=0;i<right.length;i++)pfull[i+4]=pack.h[i]?0:P[j++];
  return score(pfull)-score(crib);
 }
 function backward(m,pack){
  const n=pack.a.length;lP.set(crib,n-4);
  for(let i=n-5;i>=0;i--){
   const j=i+m.q,x=mod((pack.a[j]-m.u*lP[j]-m.b*pack.a[i]-m.d)*inv[m.a]);
   if(mode!=="ordinary"&&x===0)return -Infinity;
   lP[i]=x;
  }
  let j=0;for(let i=0;i<left.length;i++)lFull[i]=pack.h[i]?0:lP[j++];
  lFull.set(crib,left.length);return score(lFull)-score(crib);
 }
 for(let q=1;q<=4;q++)for(let u=1;u<29;u++)for(let a=1;a<29;a++)for(let b=0;b<29;b++){
  const ds=q<4?[mod(cc[q]-u*crib[q]-a*crib[0]-b*cc[0])]:Array.from({length:29},(_,i)=>i);
  for(const d of ds){
   let good=true;
   for(let j=q;j<4;j++)if(mod(u*crib[j]+a*crib[j-q]+b*cc[j-q]+d)!==cc[j]){good=false;break}
   if(!good)continue;
   models++;const m={q,u,a,b,d};let bfit=-Infinity,bmask=-1;
   for(let h=0;h<rpack.length;h++){
    const v=forward(m,rpack[h]);
    if(Number.isFinite(v))legalPaths++;
    if(v>bfit){bfit=v;bmask=h}
   }
   if(!Number.isFinite(bfit))continue;
   legalModels++;
   if(!best||bfit>best.score){forward(m,rpack[bmask]);best={...m,score:bfit,fit:Array.from(pfull.slice(4)),fitMask:bmask}}
  }
 }
 if(!best)return {models,legalModels,legalPaths,rightMasks:rr.length,leftMasks:ll.length,legal:false};
 let hs=-Infinity,hm=-1;
 for(let h=0;h<lpack.length;h++){const v=backward(best,lpack[h]);if(v>hs){hs=v;hm=h}}
 let lp=null;
 if(hm>=0){backward(best,lpack[hm]);lp=Array.from(lFull.slice(0,left.length))}
 return {models,legalModels,legalPaths,rightMasks:rr.length,leftMasks:ll.length,legal:true,best:{...best,scorePerRune:best.score/right.length},holdout:{legal:hm>=0,scorePerRune:hm>=0?hs/left.length:null,mask:hm,P:lp},decoded:lp?lp.concat(crib,best.fit):null};
}
function plant(P0,start,m,mode,seed){
 while(P0.slice(start+55,start+59).includes(0))start++;
 const P=P0.slice(start,start+98),q=m.q;let rng=seed>>>0;
 const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%29};
 const ph=Array.from({length:q},()=>1+rand()%28),ch=Array.from({length:q},rand),C=[];
 for(const p of P){
  if(mode!=="ordinary"&&p===0){C.push(0);continue}
  const c=mod(m.u*p+m.a*ph[0]+m.b*ch[0]+m.d);C.push(c);
  ph.shift();ph.push(p);ch.shift();ch.push(c);
 }
 const ans=solve(C,P.slice(55,59),55,mode);
 return {truth:m,selected:ans.best?{q:ans.best.q,u:ans.best.u,a:ans.best.a,b:ans.best.b,d:ans.best.d}:null,fitScore:ans.best?.scorePerRune,heldoutScore:ans.holdout?.scorePerRune,fitCorrect:ans.best?.fit.reduce((n,x,i)=>n+(x===P[i+59]),0),holdoutCorrect:ans.holdout?.P?.reduce((n,x,i)=>n+(x===P[i]),0),models:ans.models,legalModels:ans.legalModels,legalPaths:ans.legalPaths,holdoutLegal:ans.holdout?.legal,zeroes:C.filter(c=>c===0).length};
}
const C=gp.pages.find(x=>x.page===37).indices.slice(91,189),crib=[20,1,5,5];
if(C.slice(55,59).join()!=="3,2,6,27")throw Error("crib location");
const params=[{q:4,u:7,a:11,b:13,d:5},{q:2,u:19,a:3,b:4,d:17}];
const mode=process.argv[2]??"both",result={};
if(mode!=="f")result.ordinary={controls:[plant(g,5000,params[0],"ordinary",0x4311),plant(s,8000,params[1],"ordinary",0x4312)],original:solve(C,crib,55,"ordinary")};
if(mode!=="ordinary")result.transparentF={controls:[plant(g,5000,params[0],"f",0x4311),plant(s,8000,params[1],"f",0x4312)],original:solve(C,crib,55,"f")};
console.log(JSON.stringify(result,null,2));
for(const x of Object.values(result))if(!x.controls.every(p=>p.fitCorrect===39&&p.holdoutCorrect===55))throw Error("control recovery regression");
if(result.ordinary&&Math.abs(result.ordinary.original.best.scorePerRune+3.8520597031412147)>1e-8)throw Error("ordinary regression");
if(result.transparentF&&result.transparentF.original.holdout.legal)throw Error("F continuation regression");
