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
 function recover(L,R,end,mirrored){
  const blocks=end/5, rowsA=[],rowsB=[];
  // Strip rows have an admissible score bound independent of the other inverse row.
  for(let a=0;a<q;a++)for(let b=0;b<q;b++)if(a||b)for(let c=0;c<q;c++){
   const P=L.slice(0,end).map((x,i)=>mod(a*x+b*R[i]+c));const k=[a,b,c];
   for(let side=0;side<2;side++){
    const first=new Uint16Array(blocks),last=new Uint16Array(blocks),base=new Float64Array(blocks);let upper=0;
    for(let j=0;j<blocks;j++){const v=P.slice(5*j,5*j+5);if(side&&mirrored)v.reverse();
     first[j]=v[0]*q+v[1];last[j]=v[3]*q+v[4];const init=side===0&&j===0;
     base[j]=init?U[v[0]]+B[first[j]]:maxIn[first[j]];upper+=base[j];
     for(let h=2;h<5;h++)upper+=T[(v[h-2]*q+v[h-1])*q+v[h]];
    }
    (side?rowsB:rowsA).push({k,first,last,base,upper});
   }
  }
  rowsA.sort((x,y)=>y.upper-x.upper);rowsB.sort((x,y)=>y.upper-x.upper);
  let best=-Infinity,bestPair=null,scored=0,singular=0,partialPruned=0;
  for(const A of rowsA){
   if(A.upper+rowsB[0].upper<best-1e-9)break;
   for(const D of rowsB){
    let s=A.upper+D.upper;if(s<best-1e-9)break;if(!determinant(A.k,D.k)){singular++;continue}
    let complete=true;
    for(let j=0;j<blocks;j++){
     s+=seam[A.last[j]*nn+D.first[j]]-D.base[j];if(j+1<blocks)s+=seam[D.last[j]*nn+A.first[j+1]]-A.base[j+1];
     if(s<best-1e-9){complete=false;partialPruned++;break}
    }
    if(complete){scored++;if(s>best){best=s;bestPair=[A.k,D.k]}}
   }
  }
  const mat=bestPair,P=mat.map(([a,b,c])=>L.map((x,i)=>mod(a*x+b*R[i]+c))),plain=merge(...P,mirrored),det=inv(determinant(...mat));let exact=0;
  for(let i=0;i<n;i++){const x=mod(P[0][i]-mat[0][2]),y=mod(P[1][i]-mat[1][2]);if(mod(det*(mat[1][1]*x-mat[0][1]*y))===L[i]&&mod(det*(-mat[1][0]*x+mat[0][0]*y))===R[i])exact++}
  if(exact!==n||Math.abs(score(plain,0,2*end)-best)>1e-8)throw Error("replay or objective");
  return {mat,P,plain,fit:best/(2*end),held:end<n?score(plain,2*end)/(2*(n-end)):null,full:score(plain)/(2*n),text:txt(plain),replay:exact,scored,singular,partialPruned};
 }
 let seed=0x49aa214e;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];for(let i=0;i<8;i++){
  const t=i<4?held:solved.filter(s=>s.P.length>=2*n)[(i-4)%solved.filter(s=>s.P.length>=2*n).length].P,at=rnd(t.length-2*n+1),truth=t.slice(at,at+2*n),mirrored=Boolean(i%2),A=[],P=[];
  for(let j=0;j<truth.length;j+=10){A.push(...truth.slice(j,j+5));const b=truth.slice(j+5,j+10);P.push(...(mirrored?b.reverse():b))}
  let X,Y;do{X=Array.from({length:3},()=>rnd(q));Y=Array.from({length:3},()=>rnd(q))}while(!determinant(X,Y));
  const d=inv(determinant(X,Y));const L=A.map((v,j)=>mod(d*(Y[1]*(v-X[2])-X[1]*(P[j]-Y[2])))),R=A.map((v,j)=>mod(d*(-Y[0]*(v-X[2])+X[0]*(P[j]-Y[2])))),z=recover(L,R,fit,mirrored);
  const heldMatches=z.plain.slice(2*fit).reduce((s,x,j)=>s+(x===truth[2*fit+j]),0),keyMatch=JSON.stringify(z.mat)===JSON.stringify([X,Y]);controls.push({kind:i<4?"Gibran":"native-solved",at,mirrored,trueKey:[X,Y],keyMatch,heldMatches,fit:z.fit,held:z.held,truthHeld:score(truth,2*fit)/(2*(n-fit)),scored:z.scored,partialPruned:z.partialPruned});
 }
 const page=gp.pages[32].indices,L=[],R=[],M=[];for(let j=0;j<11;j++){let a=page.slice(j*11,j*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse())}
 const original=[["row-forward",R,false],["row-mirror",M,true]].map(([orientation,right,mirrored])=>({orientation,prefix:recover(L,right,fit,mirrored),full:recover(L,right,n,mirrored)}));
 return {trainingRunes:train.map(t=>t.length),fit,held:n-fit,forms:(q*q-1)*q,affineMaps:(q*q-1)*(q*q-q)*q*q,controls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
