'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(data) {
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
 /** Exact maximization: P1=aX+b, P2=cY+hX^2+eX+f with a,c,h nonzero. */
 function recover(L,R,end){
   const dirs=[];
   for(let d=0;d<=q;d++){
    const X=Uint8Array.from(L,(x,i)=>d===q?R[i]:mod(x+d*R[i])),Y=d===q?L:R;
    let best=-Infinity,A=null;
    for(let a=1;a<q;a++)for(let b=0;b<q;b++){let p=Array.from(X,x=>add[b][mul[a][x]]),s=score(p,0,end);if(s>best){best=s;A=[a,b]}}
    dirs.push({d,X,Y,A,best});
   }
   dirs.sort((x,y)=>y.best-x.best);let global=-Infinity,key=null,scanned=0,fullyScored=0;
   const universal=maxU+maxB+(end-2)*maxT;
   const base=new Uint8Array(end),xquad=new Uint8Array(end);
   for(const {d,X,Y,A,best} of dirs){
    if(best+universal<global-1e-8)continue;
    for(let c=1;c<q;c++)for(let h=1;h<q;h++){
      for(let i=0;i<end;i++)xquad[i]=add[mul[c][Y[i]]][mul[h][mul[X[i]][X[i]]]];
      for(let e=0;e<q;e++){
        for(let i=0;i<end;i++)base[i]=add[xquad[i]][mul[e][X[i]]];
        for(let f=0;f<q;f++){
         scanned++;const a=add[f];let p=a[base[0]],r=a[base[1]],s=U[p]+B[p*q+r],i=2;
         const threshold=global-best;
         for(;i<end;i++){if(s+(end-i)*maxT<threshold-1e-8)break;const z=a[base[i]];s+=T[(p*q+r)*q+z];p=r;r=z}
         if(i===end){fullyScored++;if(best+s>global){global=best+s;key={d,a:A[0],b:A[1],c,h,e,f}}}
        }
      }
    }
   }
   if(!key)throw Error("no key");
   const {d,a,b,c,h,e,f}=key,P=[[],[]];let replay=0;
   for(let i=0;i<n;i++){const x=d===q?R[i]:mod(L[i]+d*R[i]),y=d===q?L[i]:R[i];const p=mod(a*x+b),v=mod(c*y+h*x*x+e*x+f);P[0].push(p);P[1].push(v);const xx=mod(inv(a)*(p-b)),yy=mod(inv(c)*(v-h*xx*xx-e*xx-f));const ll=d===q?yy:mod(xx-d*yy),rr=d===q?xx:yy;if(ll===L[i]&&rr===R[i])replay++}
   if(replay!==n||Math.abs(score(P[0],0,end)+score(P[1],0,end)-global)>1e-8)throw Error("replay/score mismatch");
   return {key,P,fit:global/(2*end),held:end<n?(score(P[0],end)+score(P[1],end))/(2*(n-end)):null,full:(score(P[0])+score(P[1]))/(2*n),text:P.map(txt),replay,scanned,fullyScored};
 }
 let seed=0x4d52b1c9;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];
 for(let i=0;i<2;i++){
   const t=i===0?held:solved[2].P,u=i===0?held:solved[3].P,at=rnd(t.length-n+1),bt=rnd(u.length-n+1),A=t.slice(at,at+n),P=u.slice(bt,bt+n);
   const key={d:rnd(30),a:1+rnd(28),b:rnd(q),c:1+rnd(28),h:1+rnd(28),e:rnd(q),f:rnd(q)};
   const {d,a,b,c,h,e,f}=key,L=[],R=[];for(let j=0;j<n;j++){const x=mod(inv(a)*(A[j]-b)),y=mod(inv(c)*(P[j]-h*x*x-e*x-f));L.push(d===q?y:mod(x-d*y));R.push(d===q?x:y)}
   const z=recover(L,R,fit),matches=z.P[0].slice(fit).filter((v,j)=>v===A[j+fit]).length+z.P[1].slice(fit).filter((v,j)=>v===P[j+fit]).length;
   controls.push({kind:i===0?"Gibran":"native-solved",at,bt,trueKey:key,keyMatch:JSON.stringify(key)===JSON.stringify(z.key),heldMatches:matches,fit:z.fit,held:z.held,truthHeld:(score(A,fit)+score(P,fit))/(2*(n-fit)),scanned:z.scanned});
 }
 if(controls.some(c=>!c.keyMatch||c.heldMatches!==30))throw Error("Blind calibration failed");
 const page=gp.pages[32].indices,L=[],R=[],M=[];if(page.length!==121)throw Error("source length");for(let j=0;j<11;j++){const a=page.slice(j*11,j*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse())}
 const original=[];for(const [orientation,right] of [["row-forward",R],["row-mirror",M]])original.push({orientation,prefix:recover(L,right,fit),full:recover(L,right,n)});
 return {trainingRunes:train.map(t=>t.length),fit,held:n-fit,secondForms:30*28*28*29*29,totalKeys:30*28*29*28*28*29*29,controls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
