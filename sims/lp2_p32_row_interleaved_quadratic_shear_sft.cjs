'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(data,mode='all') {
 const gp=JSON.parse(data[0]),native=JSON.parse(data[4]),q=29,n=55,fit=40,mod=x=>(x%q+q)%q;
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[VKZQ]/g,x=>({V:"U",K:"C",Z:"S",Q:"C"})[x]);while(w){const z=spell.find(y=>w.startsWith(y.s));if(!z)throw Error(w);out.push(z.i);w=w.slice(z.s.length)}}return out}
 const train=[encode(data[1]),encode(data[2])],held=encode(data[3]),solved=native.sections.map(s=>({name:s.name,P:[...s.source_text].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0)})).filter(s=>s.P.length>=n);
 const uni=new Float64Array(q),bi=new Float64Array(q*q),tri=new Float64Array(q**3),ct1=new Float64Array(q),ct2=new Float64Array(q*q);let total=0;
 for(const t of train)for(let i=0;i<t.length;i++){const c=t[i];uni[c]++;total++;if(i){const b=t[i-1];bi[b*q+c]++;ct1[b]++;if(i>1){const ab=t[i-2]*q+b;tri[ab*q+c]++;ct2[ab]++}}}
 const U=Float64Array.from(uni,c=>Math.log((c+1)/(total+q))),B=new Float64Array(q*q),T=new Float64Array(q**3);
 for(let b=0;b<q;b++)for(let c=0;c<q;c++){const bc=b*q+c;B[bc]=Math.log((bi[bc]+10*Math.exp(U[c]))/(ct1[b]+10));for(let a=0;a<q;a++){const ab=a*q+b;T[ab*q+c]=Math.log((tri[ab*q+c]+10*Math.exp(B[bc]))/(ct2[ab]+10))}}
 const maxU=Math.max(...U),maxB=Math.max(...B),maxT=Math.max(...T);
 function score(p,start=0,end=p.length){let s=0;for(let i=start;i<end;i++)s+=i===0?U[p[i]]:i===1?B[p[i-1]*q+p[i]]:T[(p[i-2]*q+p[i-1])*q+p[i]];return s}
 const inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("singular")};
 const txt=p=>p.map(x=>gp.translit[x]).join("");
 const add=Array.from({length:q},(_,a)=>Uint8Array.from({length:q},(_,b)=>(a+b)%q));
 const mul=Array.from({length:q},(_,a)=>Uint8Array.from({length:q},(_,b)=>a*b%q));

 const nn=q*q,seam=new Float64Array(nn*nn),maxIn=new Float64Array(nn).fill(-Infinity);
 for(let a=0;a<q;a++)for(let b=0;b<q;b++)for(let x=0;x<q;x++)for(let y=0;y<q;y++){
  const u=a*q+b,v=x*q+y,z=T[u*q+x]+T[(b*q+x)*q+y];seam[u*nn+v]=z;if(z>maxIn[v])maxIn[v]=z;
 }
 function merge(A,D,mirror){const p=[];for(let i=0;i<n;i+=5){p.push(...A.slice(i,i+5));const r=D.slice(i,i+5);p.push(...(mirror?r.reverse():r))}return p}
 function recover(L,R,end,mirror){
  const blocks=end/5,dirs=[];
  for(let d=0;d<=q;d++){
   const X=Uint8Array.from(L,(x,i)=>d===q?R[i]:mod(x+d*R[i])),Y=d===q?L:R,A=[];
   for(let a=1;a<q;a++)for(let b=0;b<q;b++){
    const st=new Uint16Array(blocks),en=new Uint16Array(blocks);let s=0;
    for(let j=0;j<blocks;j++){
     const i=j*5,u=add[b][mul[a][X[i]]],v=add[b][mul[a][X[i+1]]],w=add[b][mul[a][X[i+2]]],x=add[b][mul[a][X[i+3]]],y=add[b][mul[a][X[i+4]]];
     st[j]=u*q+v;en[j]=x*q+y;s+=T[(u*q+v)*q+w]+T[(v*q+w)*q+x]+T[(w*q+x)*q+y]+(j?maxIn[st[j]]:U[u]+B[st[j]]);
    }
    A.push({a,b,s,st,en});
   }
   A.sort((a,b)=>b.s-a.s);dirs.push({d,X,Y,A});
  }
  dirs.sort((a,b)=>b.A[0].s-a.A[0].s);
  let global=-Infinity,key=null,forms=0,scored=0,pairs=0,complete=0;
  const base=new Uint8Array(end),quadratic=new Uint8Array(end),st=new Uint16Array(blocks),en=new Uint16Array(blocks),upperBlock=5*maxT;
  for(const {d,X,Y,A} of dirs){
   const amax=A[0].s;
   if(amax+blocks*upperBlock<global-1e-8)continue;
   for(let c=1;c<q;c++)for(let h=1;h<q;h++){
    for(let i=0;i<end;i++)quadratic[i]=add[mul[c][Y[i]]][mul[h][mul[X[i]][X[i]]]];
    for(let e=0;e<q;e++){
     for(let i=0;i<end;i++)base[i]=add[quadratic[i]][mul[e][X[i]]];
     for(let f=0;f<q;f++){
      forms++;
      const tab=add[f];let sd=0,j=0;
      for(;j<blocks;j++){
       if(amax+sd+(blocks-j)*upperBlock<global-1e-8)break;
       const i=j*5,u=tab[base[i+(mirror?4:0)]],v=tab[base[i+(mirror?3:1)]],w=tab[base[i+2]],x=tab[base[i+(mirror?1:3)]],y=tab[base[i+(mirror?0:4)]];
       st[j]=u*q+v;en[j]=x*q+y;sd+=maxIn[st[j]]+T[(u*q+v)*q+w]+T[(v*q+w)*q+x]+T[(w*q+x)*q+y];
      }
      if(j!==blocks)continue;scored++;
      for(const p of A){
       let s=p.s+sd;if(s<global-1e-8)break;
       pairs++;
       let t=0;for(;t<blocks;t++){
        s+=seam[p.en[t]*nn+st[t]]-maxIn[st[t]];
        if(t)s+=seam[en[t-1]*nn+p.st[t]]-maxIn[p.st[t]];
        if(s<global-1e-8)break;
       }
       if(t===blocks){complete++;if(s>global){global=s;key={d,a:p.a,b:p.b,c,h,e,f}}}
      }
     }
    }
   }
  }
  if(!key)throw Error("no key");
  const {d,a,b,c,h,e,f}=key,P=[[],[]];let replay=0;
  for(let i=0;i<n;i++){
   const x=d===q?R[i]:mod(L[i]+d*R[i]),y=d===q?L[i]:R[i],p=mod(a*x+b),v=mod(c*y+h*x*x+e*x+f);P[0].push(p);P[1].push(v);
   const xx=mod(inv(a)*(p-b)),yy=mod(inv(c)*(v-h*xx*xx-e*xx-f));if((d===q?yy:mod(xx-d*yy))===L[i]&&(d===q?xx:yy)===R[i])replay++;
  }
  const plain=merge(...P,mirror);
  if(replay!==n||Math.abs(score(plain,0,2*end)-global)>1e-7)throw Error("replay/score mismatch");
  return {key,plain,fit:global/(2*end),held:end<n?score(plain,2*end)/(2*(n-end)):null,full:score(plain)/(2*n),text:txt(plain),replay,forms,scored,pairs,complete};
 }
 let seed=0xe11b27ca;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];const sol=solved.filter(s=>s.P.length>=2*n);
 for(let i=0;i<4;i++){
  const t=i<2?held:sol[i-2].P,at=rnd(t.length-2*n+1),truth=t.slice(at,at+2*n),mirror=Boolean(i%2),A=[],P=[];
  for(let j=0;j<truth.length;j+=10){A.push(...truth.slice(j,j+5));const b=truth.slice(j+5,j+10);P.push(...(mirror?b.reverse():b))}
  const key={d:rnd(30),a:1+rnd(28),b:rnd(q),c:1+rnd(28),h:1+rnd(28),e:rnd(q),f:rnd(q)};
  if(mode!=="all"&&mode!==`control${i}`)continue;
  const {d,a,b,c,h,e,f}=key,L=[],R=[];
  for(let j=0;j<n;j++){const x=mod(inv(a)*(A[j]-b)),y=mod(inv(c)*(P[j]-h*x*x-e*x-f));L.push(d===q?y:mod(x-d*y));R.push(d===q?x:y)}
  const z=recover(L,R,fit,mirror),matches=z.plain.slice(2*fit).filter((v,j)=>v===truth[j+2*fit]).length;
  controls.push({i,kind:i<2?"Gibran":"native-solved",at,mirror,trueKey:key,keyMatch:JSON.stringify(key)===JSON.stringify(z.key),heldMatches:matches,truthHeld:score(truth,2*fit)/(2*(n-fit)),...z});
 }
 const page=gp.pages[32].indices,L=[],R=[],M=[];if(page.length!==121)throw Error("source length");for(let j=0;j<11;j++){const a=page.slice(j*11,j*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse())}
 const original=[];
 for(const [orientation,right,mirror] of [["row-forward",R,false],["row-mirror",M,true]])for(const end of [fit,n]){
  if(mode!=="all"&&mode!==`${orientation}-${end}`)continue;
  original.push({orientation,end,...recover(L,right,end,mirror)});
 }
 return {trainingRunes:train.map(t=>t.length),fit,held:n-fit,totalKeys:30*28*29*28*28*29*29,controls,original};

}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'all'),null,2));
