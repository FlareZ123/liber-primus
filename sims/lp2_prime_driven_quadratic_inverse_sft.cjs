'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw,mode,lo,hi){
 const C=JSON.parse(raw[0]),N=JSON.parse(raw[2]),q=29,D=15,mod=x=>(x%q+q)%q,assert=(v,m)=>{if(!v)throw Error(m)};
 const inv=x=>{for(let k=1;k<q;k++)if(mod(k*x)===1)return k;throw Error("singular")},dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rref=(rows,n)=>{let A=rows.map(a=>a.slice()),p=0;for(let j=0;j<n;j++){let k=A.findIndex((a,i)=>i>=p&&a[j]);if(k<0)continue;[A[p],A[k]]=[A[k],A[p]];A[p]=A[p].map(x=>mod(x*inv(A[p][j])));for(let i=0;i<A.length;i++)if(i!==p){let v=A[i][j];if(v)A[i]=A[i].map((x,l)=>mod(x-v*A[p][l]))}p++}return{A,rank:p}};
 const inverse=M=>{let r=rref(M.map((a,i)=>[...a,...Array.from({length:D},(_,j)=>+(i===j))]),D);assert(r.rank===D,"singular basis");return r.A.map(a=>a.slice(D))};
 const parse=t=>t.split(new RegExp("[^"+C.runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>C.runes.indexOf(x)));
 const toks=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=t=>(t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]).map(w=>{w=w.replace(/['’]/g,"");let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let t=toks.find(x=>w.startsWith(x.s,i));assert(t,"unmapped");a.push(t.i);i+=t.s.length}}return a});
 const ow=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,"")),O=ow.flat(),native=N.sections.flatMap(s=>parse(s.source_text)),gw=gp(raw[3]);assert(ow.length===2896&&O.length===12956&&O.join(",")===C.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","),"original source");
 const model=gw.slice(0,Math.floor(gw.length/2)).flat(),hist1=Array(q).fill(.5),hist2=Array.from({length:q},()=>Array(q).fill(.5));
 for(let i=0;i<model.length;i++){hist1[model[i]]++;if(i)hist2[model[i-1]][model[i]]++}
 const log1=hist1.map(x=>Math.log(x/(model.length+q*.5))),log2=hist2.map(a=>{let s=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(x/s))});
 let rng=0x33010539;function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng}


 const E=4,lim=200000,composite=new Uint8Array(lim),pr=[];
 for(let p=2;p<lim;p++){if(composite[p])continue;pr.push(p);if(p*p<lim)for(let j=p*p;j<lim;j+=p)composite[j]=1}
 const pm=pr.map(p=>(p-1)%29);assert(pr[463]===3301,"prime rank");
 const get=(c,i)=>i<0?0:c[i]??0;
 function row(c,i,s){let a=get(c,i-1),b=get(c,i-2),d=get(c,i-3);return [get(c,i),a,b,d,a*a%29,a*b%29,a*d%29,b*b%29,b*d%29,d*d%29,pm[i+s]??0,pm[i+s-1]??0,pm[i+s-2]??0,pm[i+s-3]??0,1]}
 function encode(P,s,K){let c=[],u=inv(K[0]);for(let i=0;i<P.length;i++)c.push(mod(u*(P[i]-dot(row(c,i,s),K))));return c}
 function decode(c,s,K){return c.map((_,i)=>dot(row(c,i,s),K))}
 const p56=C.pages.find(p=>p.page===56).indices,p56plain=parse(N.sections.find(s=>s.name==="p56_an_end").source_text).flat();
 let t=0;assert(p56plain.every((x,i)=>x===0?p56[i]===0:mod(x+pm[t++])===p56[i]),"authentic p56 prime clock control");
 function sites(ws,cut){let i=0,out=[];for(let w of ws){if(w.length===1&&i>=3&&i<cut)out.push(i);i+=w.length}return out}
 function cover(X,s){let rng=(s+3301)>>>0;const next=()=>rng=(Math.imul(rng,1664525)+1013904223)>>>0;
  for(let a=0;a<10;a++){let ids=Array.from({length:X.length},(_,i)=>i);for(let i=ids.length-1;i>0;i--){let j=next()%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}
   let groups=Array.from({length:6},(_,j)=>ids.filter((_,i)=>i%6===j)),B=[];
   for(let g=0;g<6;g++)for(let h=g+1;h<6;h++){let piv=Array(D).fill(null),sel=[];for(let i of groups[g].concat(groups[h])){let v=X[i].slice();for(let j=0;j<D;j++){if(!v[j])continue;if(piv[j]){let a=v[j];for(let k=j;k<D;k++)v[k]=mod(v[k]-a*piv[j][k]);continue}let u=inv(v[j]);for(let k=j;k<D;k++)v[k]=v[k]*u%29;piv[j]=v;sel.push(i);break}if(sel.length===D)break}if(sel.length===D)B.push(sel)}
   if(B.length===15)return B;
  }return null
 }
 function fit(c,ix,s){let X=ix.map(i=>row(c,i,s)),B=cover(X,s);if(!B)return {s,unresolved:true};
  let count=0,hits=0,keys=new Map();
  for(let S of B){let I=inverse(S.map(i=>X[i])),set=new Set(S),R=X.filter((_,i)=>!set.has(i)).map(x=>Array.from({length:D},(_,j)=>mod(x.reduce((a,v,k)=>a+v*I[k][j],0)))),m=R.length,hp=7,nl=128,nh=256;
   function half(n,offset){let V=new Uint8Array(n*m);for(let z=1;z<n;z++){let bit=z&-z,k=31-Math.clz32(bit)+offset,a=(z-bit)*m,b=z*m;for(let j=0;j<m;j++){let u=V[a+j]+R[j][k];V[b+j]=u>=29?u-29:u}}return V}
   const L=half(nl,0),H=half(nh,hp);
   for(let l=0;l<nl;l+=2)for(let h=0;h<nh;h++){count++;let bad=0;for(let j=0;j<m;j++){let x=L[l*m+j]+H[h*m+j];if(x>=29)x-=29;if(x>1&&++bad>E)break}if(bad>E)continue;let z=l+(h<<hp),v=Array.from({length:D},(_,j)=>(z>>j)&1),K=I.map(x=>dot(x,v));if(!K[0])continue;hits++;let comp=K.map((x,j)=>mod((j===D-1?1:0)-x)),a=K.join(","),b=comp.join(",");keys.set(a<b?a:b,{s,K:a<b?K:comp})}
  }return {s,count,hits,keys:[...keys.values()]}
 }
 function stats(p){let h=Array(29).fill(0),s=0;for(let i=0;i<p.length;i++){h[p[i]]++;s+=i?log2[p[i-1]][p[i]]:log1[p[i]]}return {n:p.length,ioc:h.reduce((a,x)=>a+x*(x-1),0)/(p.length*(p.length-1)),mean:s/p.length}}
 function label(c,cut,keys){let best=null;for(let v of keys){let p=decode(c.slice(0,cut),v.s,v.K),h=Array.from({length:29},()=>Array(29).fill(0));for(let i=1;i<p.length;i++)h[p[i-1]][p[i]]++;for(let a=1;a<29;a++)for(let b=0;b<29;b++){let score=log1[mod(a*p[0]+b)];for(let j=0;j<29;j++)for(let k=0;k<29;k++)if(h[j][k])score+=h[j][k]*log2[mod(a*j+b)][mod(a*k+b)];if(!best||score>best.score){let K=v.K.map(x=>mod(a*x));K[D-1]=mod(K[D-1]+b);best={s:v.s,K,score}}}}
  if(!best)return null;let p=decode(c,best.s,best.K);assert(encode(p,best.s,best.K).join(",")===c.join(","),"forward replay");return {...best,P:p,train:stats(p.slice(0,cut)),heldout:stats(p.slice(cut))}
 }
 const cut=C.pages.filter(p=>p.page<=39).reduce((s,p)=>s+p.indices.length,0);assert(cut===9640,"original boundary");
 let start=Math.floor(gw.length/2),n=0,count=0,end=start;for(;end<gw.length;end++){let w=gw[end];if(w.length===1&&n>=3)count++;n+=w.length;if(count===68){end++;break}}
 const words=gw.slice(start,end+500),P=words.flat(),s0=137,K0=[13,2,17,9,18,7,22,15,5,3,11,6,14,8,4];
 const c=mode==="plant"?encode(P,s0,K0):O,stop=mode==="plant"?n:cut,ix=sites(mode==="plant"?words:ow,stop);assert(ix.length===68,"singleton sites");
 let keys=[],unresolved=[],enumerated=0,hits=0;
 for(let s=lo;s<hi;s++){let z=fit(c,ix,s);if(z.unresolved){unresolved.push(s);continue}enumerated+=z.count;hits+=z.hits;keys.push(...z.keys)}
 let best=label(c,stop,keys);if(best){if(mode==="plant"){best.exact=best.P.filter((x,i)=>x===P[i]).length;best.holdExact=best.P.slice(stop).filter((x,i)=>x===P[stop+i]).length}delete best.P}
 return {mode,range:[lo,hi],cut:stop,p56AuthenticExact:p56.length,p56TransparentF:true,enumerated,hits,keys,unresolved,best,...(mode==="plant"?{expected:P.length,holdExpected:P.length-stop,s0,K0}:{})}
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||'original',Number(process.argv[3]||0),Number(process.argv[4]||464)),null,2));
