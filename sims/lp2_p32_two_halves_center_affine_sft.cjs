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
 /** Exact projective-direction maxima, using the public center glyph per row. */
 function recover(L,R,Z,end){
  const best=Array.from({length:q+1},()=>({s:-Infinity})),base=new Uint8Array(end),p=new Uint8Array(end);
  const inverses=Array.from({length:q},(_,i)=>i?inv(i):0),rowTerms=Array.from({length:q},(_,g)=>Uint8Array.from(Z,x=>mod(g*x)));
  for(let a=0;a<q;a++)for(let b=0;b<q;b++)if(a||b){
   const dir=a?mod(b*inverses[a]):q;
   for(let i=0;i<end;i++)base[i]=mod(a*L[i]+b*R[i]);
   for(let g=0;g<q;g++){
    const z=rowTerms[g];for(let i=0;i<end;i++)p[i]=(base[i]+z[i])%q;
    for(let d=0;d<q;d++){
     let prev2=p[0]+d;if(prev2>=q)prev2-=q;let prev=p[1]+d;if(prev>=q)prev-=q;
     let s=U[prev2]+B[prev2*q+prev];for(let i=2;i<end;i++){let x=p[i]+d;if(x>=q)x-=q;s+=T[(prev2*q+prev)*q+x];prev2=prev;prev=x}
     if(s>best[dir].s)best[dir]={s,key:[a,b,g,d]};
    }
   }
  }
  best.sort((a,b)=>b.s-a.s);const mat=best.slice(0,2).map(x=>x.key),P=mat.map(([a,b,g,d])=>L.map((x,i)=>mod(a*x+b*R[i]+g*Z[i]+d)));const det=inv(determinant(...mat));let exact=0;
  for(let i=0;i<n;i++){const x=mod(P[0][i]-mat[0][2]*Z[i]-mat[0][3]),y=mod(P[1][i]-mat[1][2]*Z[i]-mat[1][3]);const l=mod(det*(mat[1][1]*x-mat[0][1]*y)),rr=mod(det*(-mat[1][0]*x+mat[0][0]*y));if(l===L[i]&&rr===R[i])exact++}
  if(exact!==n)throw Error("replay");const direct=(score(P[0],0,end)+score(P[1],0,end))/(2*end);const objective=(best[0].s+best[1].s)/(2*end);if(Math.abs(direct-objective)>1e-9)throw Error("objective");
  return {mat,P,fit:objective,held:end<n?(score(P[0],end)+score(P[1],end))/(2*(n-end)):null,full:(score(P[0])+score(P[1]))/(2*n),text:P.map(txt),replay:exact};
 }
 const page=gp.pages[32].indices,L=[],R=[],M=[],Z=[];for(let j=0;j<11;j++){const a=page.slice(j*11,j*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse());Z.push(...Array(5).fill(a[5]))}
  let seed=0xad501e31;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];for(let i=0;i<6;i++){const t=i<3?held:solved[(i-3)%solved.length].P,u=i<3?held:solved[(i-2)%solved.length].P,at=rnd(t.length-n+1),bt=rnd(u.length-n+1),A=t.slice(at,at+n),P=u.slice(bt,bt+n);let X,Y;do{X=Array.from({length:4},()=>rnd(q));Y=Array.from({length:4},()=>rnd(q))}while(!determinant(X,Y)||(!X[2]&&!Y[2]));const d=inv(determinant(X,Y));const L=A.map((v,j)=>mod(d*(Y[1]*(v-X[2]*Z[j]-X[3])-X[1]*(P[j]-Y[2]*Z[j]-Y[3])))),R=A.map((v,j)=>mod(d*(-Y[0]*(v-X[2]*Z[j]-X[3])+X[0]*(P[j]-Y[2]*Z[j]-Y[3]))));const z=recover(L,R,Z,fit);
 const hit=(a,b)=>a.slice(fit).reduce((s,x,j)=>s+(x===b[fit+j]),0);const heldMatches=Math.max(hit(z.P[0],A)+hit(z.P[1],P),hit(z.P[1],A)+hit(z.P[0],P));const keyMatch=JSON.stringify(z.mat)===JSON.stringify([X,Y])||JSON.stringify(z.mat)===JSON.stringify([Y,X]);controls.push({kind:i<3?"Gibran":"native-solved",at,bt,trueKey:[X,Y],keyMatch,heldMatches,fit:z.fit,held:z.held,truthHeld:(score(A,fit)+score(P,fit))/(2*(n-fit))});
 }
 const original=[["row-forward",R],["row-mirror",M]].map(([orientation,right])=>({orientation,prefix:recover(L,right,Z,fit),full:recover(L,right,Z,n)}));
 return {trainingRunes:train.map(t=>t.length),fit,held:n-fit,center:Z.filter((_,i)=>i%5===0),forms:(q*q-1)*q*q,affineMaps:(q*q-1)*(q*q-q)*q**4,controls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
