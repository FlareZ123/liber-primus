'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(data){
 const gp=JSON.parse(data[0]),native=JSON.parse(data[4]),q=29,n=55,fit=40,mod=x=>(x%q+q)%q;
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[VKZQ]/g,x=>({V:"U",K:"C",Z:"S",Q:"C"})[x]);while(w){const z=spell.find(y=>w.startsWith(y.s));if(!z)throw Error(w);out.push(z.i);w=w.slice(z.s.length)}}return out}
 const train=[encode(data[1]),encode(data[2])],held=encode(data[3]),solved=native.sections.map(s=>({name:s.name,P:[...s.source_text].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0)})).filter(s=>s.P.length>=n);
 const uni=new Float64Array(q),bi=new Float64Array(q*q),tri=new Float64Array(q**3),ct1=new Float64Array(q),ct2=new Float64Array(q*q);let total=0;
 for(const t of train)for(let i=0;i<t.length;i++){const c=t[i];uni[c]++;total++;if(i){const b=t[i-1];bi[b*q+c]++;ct1[b]++;if(i>1){const ab=t[i-2]*q+b;tri[ab*q+c]++;ct2[ab]++}}}
 const U=Float64Array.from(uni,c=>Math.log((c+1)/(total+q))),B=new Float64Array(q*q),T=new Float64Array(q**3);
 for(let b=0;b<q;b++)for(let c=0;c<q;c++){const bc=b*q+c;B[bc]=Math.log((bi[bc]+10*Math.exp(U[c]))/(ct1[b]+10));for(let a=0;a<q;a++){const ab=a*q+b;T[ab*q+c]=Math.log((tri[ab*q+c]+10*Math.exp(B[bc]))/(ct2[ab]+10))}}
 function score(p,start=0,end=p.length){let s=0;for(let i=start;i<end;i++)s+=i===0?U[p[i]]:i===1?B[p[i-1]*q+p[i]]:T[(p[i-2]*q+p[i-1])*q+p[i]];return s}
 const determinant=(a,b)=>mod(a[0]*b[1]-a[1]*b[0]);const inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("singular")};
 const txt=p=>p.map(x=>gp.translit[x]).join("");

 // A seam contains precisely the two trigram terms crossing a boundary of two 5-rune strips.
 const nn=q*q, seam=new Float64Array(nn*nn),maxIn=new Float64Array(nn).fill(-Infinity);
 for(let u=0;u<q;u++)for(let v=0;v<q;v++)for(let x=0;x<q;x++)for(let y=0;y<q;y++){
  const a=u*q+v,b=x*q+y,z=T[a*q+x]+T[(v*q+x)*q+y];seam[a*nn+b]=z;if(z>maxIn[b])maxIn[b]=z;
 }
 function merge(A,D,mirrored){const out=[];for(let i=0;i<n;i+=5){out.push(...A.slice(i,i+5));const b=D.slice(i,i+5);out.push(...(mirrored?b.reverse():b))}return out}

 const invs=Array.from({length:q},(_,i)=>i?inv(i):0);
 const page=gp.pages[32].indices,L=[],R=[],M=[],Z=[];for(let j=0;j<11;j++){let a=page.slice(j*11,j*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse());Z.push(a[5])}
 /** Relax all seam predecessor contexts while keeping the same global affine coefficients. */
 function upper(L,R,end,mirrored){
  const blocks=end/5, A=Array.from({length:q+1},()=>({s:-Infinity})),D=Array.from({length:q+1},()=>({s:-Infinity}));
  const base=new Uint8Array(end),p=new Uint8Array(end);
  for(let a=0;a<q;a++)for(let b=0;b<q;b++)if(a||b){
   const dir=a?mod(b*invs[a]):q;
   for(let i=0;i<end;i++)base[i]=mod(a*L[i]+b*R[i]);
   for(let g=0;g<q;g++){
    for(let j=0;j<blocks;j++){const z=g*Z[j]%q;for(let h=0;h<5;h++)p[5*j+h]=(base[5*j+h]+z)%q}
    for(let d=0;d<q;d++){
     let sa=0,sd=0;
     for(let j=0;j<blocks;j++){const o=5*j;let u=p[o]+d,v=p[o+1]+d,w=p[o+2]+d,x=p[o+3]+d,y=p[o+4]+d;if(u>=q)u-=q;if(v>=q)v-=q;if(w>=q)w-=q;if(x>=q)x-=q;if(y>=q)y-=q;
      const common=T[(u*q+v)*q+w]+T[(v*q+w)*q+x]+T[(w*q+x)*q+y],first=u*q+v;
      sa+=common+(j?maxIn[first]:U[u]+B[first]);sd+=mirrored?maxIn[y*q+x]+T[(y*q+x)*q+w]+T[(x*q+w)*q+v]+T[(w*q+v)*q+u]:maxIn[first]+common;
     }
     if(sa>A[dir].s)A[dir]={s:sa,k:[a,b,g,d]};if(sd>D[dir].s)D[dir]={s:sd,k:[a,b,g,d]};
    }
   }
  }
  let best=-Infinity,pair=null;for(let i=0;i<=q;i++)for(let j=0;j<=q;j++)if(i!==j&&A[i].s+D[j].s>best){best=A[i].s+D[j].s;pair=[A[i].k,D[j].k]}
  const P=pair.map(([a,b,g,d])=>L.map((x,i)=>mod(a*x+b*R[i]+g*Z[Math.floor(i/5)]+d))),plain=merge(...P,mirrored);const actual=score(plain,0,2*end)/(2*end),bound=best/(2*end);
  if(actual>bound+1e-9)throw Error("upper violated");return {bound,pair,actual,text:txt(plain),held:end<n?score(plain,2*end)/(2*(n-end)):null};
 }
 let seed=0xa20b3fc1;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];for(let i=0;i<6;i++){
  const sol=solved.filter(s=>s.P.length>=2*n),t=i<3?held:sol[(i-3)%sol.length].P,at=rnd(t.length-2*n+1),truth=t.slice(at,at+2*n),mirrored=Boolean(i%2),A=[],P=[];
  for(let j=0;j<truth.length;j+=10){A.push(...truth.slice(j,j+5));const b=truth.slice(j+5,j+10);P.push(...(mirrored?b.reverse():b))}
  let X,Y;do{X=Array.from({length:4},()=>rnd(q));Y=Array.from({length:4},()=>rnd(q))}while(!determinant(X,Y)||(!X[2]&&!Y[2]));
  const d=inv(determinant(X,Y)),L=A.map((v,j)=>mod(d*(Y[1]*(v-X[2]*Z[Math.floor(j/5)]-X[3])-X[1]*(P[j]-Y[2]*Z[Math.floor(j/5)]-Y[3])))),R=A.map((v,j)=>mod(d*(-Y[0]*(v-X[2]*Z[Math.floor(j/5)]-X[3])+X[0]*(P[j]-Y[2]*Z[Math.floor(j/5)]-Y[3])))),z=upper(L,R,n,mirrored);
  const actual=score(truth)/(2*n);if(actual>z.bound+1e-9)throw Error("true score exceeds bound");const keyMatch=JSON.stringify(z.pair)===JSON.stringify([X,Y]);controls.push({kind:i<3?"Gibran":"native-solved",at,mirrored,trueKey:[X,Y],actual,bound:z.bound,selectedActual:z.actual,keyMatch});
 }
 const original=[["row-forward",R,false],["row-mirror",M,true]].map(([orientation,right,mirrored])=>({orientation,full:upper(L,right,n,mirrored),prefix:upper(L,right,fit,mirrored)}));
 return {trainingRunes:train.map(t=>t.length),center:Z,forms:(q*q-1)*q*q,affineMaps:(q*q-1)*(q*q-q)*q**4,controls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
