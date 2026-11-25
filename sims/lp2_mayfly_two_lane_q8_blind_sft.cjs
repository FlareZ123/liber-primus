"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(gp,raw,gold,width=2048,maskCount=128){
 const A=29,Q=8,D=5,MOD=x=>(x+29)%29,tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){let t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const donors=raw.map(native),ix=new Map(gold.runes.map((x,i)=>[x,i])),sections=gold.sections.map(s=>Array.from(s.source_text).filter(x=>ix.has(x)).map(x=>ix.get(x)));
 const u=new Float64Array(A).fill(.5),b=new Float64Array(30*A),bt=new Float64Array(30),t=new Float64Array(900*A),tt=new Float64Array(900);
 for(const seq of [donors[2],...sections]){let a=29,z=29;for(const p of seq){u[p]++;b[z*A+p]++;bt[z]++;t[(a*30+z)*A+p]++;tt[a*30+z]++;a=z;z=p}}
 const sum=u.reduce((a,b)=>a+b,0),logu=Array.from(u,x=>Math.log(x/sum)),log=new Float64Array(900*A);for(let a=0;a<30;a++)for(let z=0;z<30;z++)for(let p=0;p<A;p++){let p1=u[p]/sum,p2=(b[z*A+p]+4*p1)/(bt[z]+4),p3=(t[(a*30+z)*A+p]+8*p2)/(tt[a*30+z]+8);log[(a*30+z)*A+p]=Math.log(p3)}
 const trans=Array.from({length:A},(_,c)=>Float64Array.from({length:A},(_,k)=>c===k?-Infinity:logu[MOD(c-k)]));
 const scoreMask=s=>{let v=s.hold;for(let j=0;j<Q;j++){let max=-Infinity;for(let k=0;k<A;k++)if(s.a[j*A+k]>max)max=s.a[j*A+k];v+=max}return v};
 function enumerate(C){
   let chunks=[[]];for(let c of C){if(c===0)chunks.push([]);else chunks.at(-1).push(c)}
   function block(chunk,start,consume){let v=new Float64Array(Q*A),j=start;function add(c){for(let k=0;k<A;k++)v[j*A+k]+=trans[c][k];j=(j+1)%Q}if(consume)add(0);for(let c of chunk)add(c);return{v,j}}
   let first=block(chunks[0],0,false),S=[{a:first.v,j:first.j,hold:0,mask:"",s:0}],dropped=0,peak=1;
   for(let i=1;i<chunks.length;i++){const seg=Array.from({length:Q},(_,j)=>[block(chunks[i],j,false),block(chunks[i],j,true)]),N=[];
    for(let o of S)for(let c=0;c<2;c++){let {v,j}=seg[o.j][c],a=new Float64Array(Q*A);for(let k=0;k<a.length;k++)a[k]=o.a[k]+v[k];let state={a,j,hold:o.hold+(c===0?logu[0]:0),mask:o.mask+(c===0?"1":"0")};state.s=scoreMask(state);if(Number.isFinite(state.s))N.push(state)}
    N.sort((a,b)=>b.s-a.s);dropped+=Math.max(0,N.length-width);S=N.slice(0,width);peak=Math.max(peak,S.length);if(!S.length)break;
   }S.sort((a,b)=>b.s-a.s);return{masks:S.slice(0,maskCount),legalRetained:S.length,dropped,peak};
 }
 function optimize(C,o){
  let domains=[];for(let j=0;j<Q;j++){const d=Array.from({length:A},(_,k)=>k).filter(k=>Number.isFinite(o.a[j*A+k])).sort((a,b)=>o.a[j*A+b]-o.a[j*A+a]).slice(0,D);if(!d.length)return null;while(d.length<D)d.push(d.at(-1));domains.push(d)}
  let h=0,j=0,ph=[],sy=[];for(let c of C){if(c===0&&o.mask[h++]==="1"){ph.push(-1);sy.push(0)}else{ph.push(j);sy.push(c);j=(j+1)%Q}}
  const factors=Array.from({length:Q},()=>new Float64Array(D**3));let constant=0;
  for(let i=0;i<C.length;i++){
   let k=ph[i];if(k<0&&i>0)k=ph[i-1];if(k<0&&i>1)k=ph[i-2];
   if(k<0){let a=i<2?29:0,z=i<1?29:0;constant+=log[(a*30+z)*A];continue}
   const ids=[(k+Q-2)%Q,(k+Q-1)%Q,k],v=factors[k];const vals=[];
   for(let m=i-2;m<=i;m++){if(m<0)vals.push({fixed:29});else if(ph[m]<0)vals.push({fixed:0});else{const r=ids.indexOf(ph[m]);if(r<0)throw Error("factor");vals.push({r,p:domains[ph[m]].map(d=>MOD(sy[m]-d))})}}
   for(let x=0;x<D;x++)for(let y=0;y<D;y++)for(let z=0;z<D;z++){const d=[x,y,z];const p=vals.map(v=>v.fixed===undefined?v.p[d[v.r]]:v.fixed);v[(x*D+y)*D+z]+=log[(p[0]*30+p[1])*A+p[2]]}
  }
  let best=-Infinity,assignment=null;
  for(let a=0;a<D;a++)for(let b=0;b<D;b++){let prev=new Float64Array(D*D).fill(-Infinity);prev[a*D+b]=0;const back=[];
   for(let k=2;k<Q;k++){let next=new Float64Array(D*D).fill(-Infinity),bk=new Int8Array(D*D);for(let x=0;x<D;x++)for(let y=0;y<D;y++)if(Number.isFinite(prev[x*D+y]))for(let z=0;z<D;z++){const s=prev[x*D+y]+factors[k][(x*D+y)*D+z];if(s>next[y*D+z]){next[y*D+z]=s;bk[y*D+z]=x}}back[k]=bk;prev=next}
   for(let y=0;y<D;y++)for(let z=0;z<D;z++){let s=constant+prev[y*D+z]+factors[0][(y*D+z)*D+a]+factors[1][(z*D+a)*D+b];if(s>best){best=s;let k=Array(Q);k[Q-2]=y;k[Q-1]=z;for(let i=Q-1;i>=2;i--)k[i-2]=back[i][k[i-1]*D+k[i]];assignment=k}}
  }return{key:assignment.map((v,j)=>domains[j][v]),s:best,mask:o.mask};
 }
 function vit(C,key,initial={j:0,a:29,b:29},trace=false){let M=new Map([[initial.j*900+initial.a*30+initial.b,{s:0,p:""}]]);for(let c of C){const N=new Map();for(let [id,o] of M){let j=Math.floor(id/900),ctx=id%900,z=ctx%30;function put(p,k){let i=k*900+z*30+p,s=o.s+log[ctx*A+p],old=N.get(i);if(!old||s>old.s)N.set(i,{s,p:trace?o.p+String.fromCharCode(65+p):""})}if(!c)put(0,j);let p=MOD(c-key[j]);if(p)put(p,(j+1)%Q)}if(!N.size)return null;M=N}let best=null;for(let[id,o]of M)if(!best||o.s>best.s)best={s:o.s,P:trace?Array.from(o.p,c=>c.charCodeAt(0)-65):null,end:{j:Math.floor(id/900),a:Math.floor(id%900/30),b:id%30}};return best}
 function refine(C,key){let k=key.slice(),v=vit(C,k)?.s??-Infinity;for(let pass=0;pass<2;pass++){let change=false;for(let i=0;i<Q;i++){let old=k[i],best=old,s=v;for(let d=0;d<A;d++)if(d!==old){k[i]=d;let n=vit(C,k)?.s??-Infinity;if(n>s){s=n;best=d}}k[i]=best;if(best!==old){change=true;v=s}}if(!change)break}return{key:k,s:v}}
 function enc(P,K,start=0){let j=start;return P.map(p=>!p?0:MOD(p+K[j++%K.length]))}
 function recover(name,C,P=null,trueKey=null){
  const fit=C.slice(0,378),hold=C.slice(378),m=enumerate(fit),keys=new Map();for(let o of m.masks){let x=optimize(fit,o);if(x){let id=x.key.join(",");if(!keys.has(id)||keys.get(id).s<x.s)keys.set(id,x)}}
  const candidates=Array.from(keys.values()).map(x=>({...x,s:vit(fit,x.key)?.s??-Infinity})).sort((a,b)=>b.s-a.s).slice(0,8);const rs=candidates.map(x=>refine(fit,x.key)).sort((a,b)=>b.s-a.s);
  if(!rs.length)return{name,fit:fit.length,hold:hold.length,legal:false,search:{peak:m.peak,dropped:m.dropped,retained:m.legalRetained,keys:keys.size}};
  const key=rs[0].key,a=vit(fit,key,undefined,true),z=vit(hold,key,a.end,true);if(enc(a.P,key).join()!=fit.join()||(z&&enc(z.P,key,a.end.j).join()!=hold.join()))throw Error("replay");
  const correct=(p,b)=>p?b.filter((x,i)=>x===p[i]).length:null;let exactKey=trueKey?key.join()===trueKey.join():null;
  return{name,fit:fit.length,hold:hold.length,key,trueKey,exactKey,fitScore:a.s/fit.length,holdScore:z?z.s/hold.length:null,fitCorrect:P?correct(a.P,P.slice(0,378)):null,holdCorrect:P&&z?correct(z.P,P.slice(378)):null,end:a.end,legal:!!z,fitPlain:a.P.map(x=>gp.translit[x]).join(""),holdPlain:z?z.P.map(x=>gp.translit[x]).join(""):null,search:{peak:m.peak,dropped:m.dropped,retained:m.legalRetained,keys:keys.size}};
 }
 const C=gp.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices),lane=(a,j)=>a.filter((_,i)=>i%2===j),n=[511,510],K=[[7,26,28,10,16,25,18,1],[3,0,1,9,11,4,11,24]],P=n.map((l,j)=>donors[j].slice(17311+j*3111,17311+j*3111+l)),controls=P.map((p,j)=>recover("plant-"+j,enc(p,K[j]),p,K[j]));
 let seed=0x2735a;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const one=donors[0].slice(97000,98021),oneC=enc(one,Array.from({length:8},()=>rng()%29)),oneControl=[0,1].map(j=>recover("one-message-"+j,lane(oneC,j),lane(one,j)));
 const padControl=P.map((p,j)=>recover("independent-pad-"+j,enc(p,Array.from({length:p.length},()=>rng()%29)),p));
 const gate=controls.every(x=>x.exactKey&&x.holdCorrect>=x.hold-1);
 const original=gate?[0,1].map(j=>recover("original-"+j,lane(C,j))):null;
 return{width,maskCount,controls,oneControl,padControl,gate,original};
}
const raw=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1,4),JSON.parse(raw[4]),Number(process.argv[2]||2048),Number(process.argv[3]||128)),null,2));
