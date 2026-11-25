"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
function run(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]), ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const native=gold.sections.map(s=>({name:s.name,t:[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x))}));
 const M=n=>29n**BigInt(n),A=M(13),B=M(14),mod=(x,m)=>(x%m+m)%m;
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),num=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const integer=a=>a.reduceRight((n,x)=>n*29n+BigInt(x),0n);
 const dig=(x,n)=>{const a=[];for(let i=0;i<n;i++){a.push(Number(x%29n));x/=29n;}return a;};
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}if(r!==1n)throw Error("nonunit");return mod(t,m);}
 function lexWord(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const lex=new Set();for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false]){const a=lexWord(m[1],alt);if(a.length>=14)lex.add(id(a));}}
 function bank(excluded){
  const train=native.filter(s=>!excluded.has(s.name)),frags=new Set();
  for(const s of [...lex,...train.map(x=>id(x.t))])for(let i=0;i+14<=s.length;i++)frags.add(s.slice(i,i+14));
  const u=new Float64Array(29),b=new Float64Array(841),tr=new Float64Array(24389);let total=0;
  for(const s of train){let t=s.t;for(let i=0;i<t.length;i++){u[t[i]]++;total++;if(i)b[t[i-1]*29+t[i]]++;if(i>1)tr[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
  const lm=new Float64Array(24389);for(let a=0;a<29;a++)for(let q=0;q<29;q++)for(let c=0;c<29;c++){const p0=(u[c]+.5)/(total+14.5),p1=(b[q*29+c]+8*p0)/(u[q]+8),p2=(tr[(a*29+q)*29+c]+8*p1)/(b[a*29+q]+8);lm[(a*29+q)*29+c]=Math.log(p2);}
  return {frags,vals:[...frags].map(x=>integer(num(x))),lm};
 }
 const score=(t,lm)=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 function lattice(u,R,B,A){
  const m=R*B,dot=(v,w)=>v[0]*w[0]*R*R+v[1]*w[1]*A*A;
  const nearest=(n,d)=>n<0n?-nearest(-n,d):(2n*n+d-1n)/(2n*d);
  let v=[1n,u%m],w=[0n,m];for(;;){if(dot(w,w)<dot(v,v))[v,w]=[w,v];const q=nearest(dot(v,w),dot(v,v));if(!q)break;w=[w[0]-q*v[0],w[1]-q*v[1]];}
  let D=v[0]*w[1]-v[1]*w[0];if(D<0n){w=w.map(x=>-x);D=-D;}
  const floor=(n,d)=>n>=0n?n/d:-((-n+d-1n)/d),ceil=(n,d)=>-floor(-n,d);
  return (lo,hi)=>{
   const bounds=f=>{const z=[f(1n,lo),f(1n,hi),f(A-1n,lo),f(A-1n,hi)];let l=z[0],h=l;for(const x of z){if(x<l)l=x;if(x>h)h=x;}return [ceil(l,D),floor(h,D)];};
   const [l1,h1]=bounds((x,y)=>x*w[1]-y*w[0]),[l2,h2]=bounds((x,y)=>v[0]*y-v[1]*x),out=[];
   function inner(c,f,g,low,high){let l=low,h=high;for(const [b,k,L,H] of [[c*f[0],g[0],1n,A-1n],[c*f[1],g[1],lo,hi]]){if(!k){if(b<L||b>H)return;continue;}const L2=k>0n?ceil(L-b,k):ceil(b-H,-k),H2=k>0n?floor(H-b,k):floor(b-L,-k);if(L2>l)l=L2;if(H2<h)h=H2;}for(let z=l;z<=h;z++)out.push(c*f[0]+z*g[0]);}
   if(h1-l1<=h2-l2){for(let c=l1;c<=h1;c++)inner(c,v,w,l2,h2);}else{for(let c=l2;c<=h2;c++)inner(c,w,v,l1,h1);}return out;
  };
 }
 let toys=0;
 for(let a=2n;a<15n;a++)for(let R=1n;R<7n;R++)for(let B=2n;B<7n;B++){
  const u=(a*R*13n+5n)%(R*B),p=(a+R)%B,lo=(p-2n)*R,hi=(p+1n)*R-1n;
  const got=new Set(lattice(u,R,B,a)(lo,hi).map(String)),exp=new Set();
  for(let k=1n;k<a;k++)for(let j=-2n;j<=2n;j++){const y=k*u%(R*B)+j*R*B;if(y>=lo&&y<=hi)exp.add(String(k));}
  if(got.size!==exp.size||[...got].some(x=>!exp.has(x)))throw Error("lattice toy");toys++;
 }
 // P=a*C+b (mod 29^N), unit a in [1,29^13), b in [0,29^13).
 // The only unknown high-body state beyond a is the carry s from low 13 digits.
 function solve(C,fitN,K,truth=null){
  const N=C.length,ci=integer(C),states=new Map(),modHigh=M(N-13);let queries=0,rawHits=0;
  for(let d=13;d+14<=fitN;d++){
   const D=M(d),R=A,T=D/R,cp=ci%(D*B),u=cp/T,enumerate=lattice(u,R,B,A),local=new Set();
   for(const p of K.vals){queries++;for(const a of enumerate((p-2n)*R,(p+1n)*R-1n)){
    rawHits++;if(a%29n===0n)continue;
    const prod=a*cp,L=prod%A,H=prod/A,div=D/A;
    for(let s=0;s<=1;s++){if(s===1&&L===0n)continue;
     if((H+BigInt(s))/div%B===p)local.add(a.toString()+":"+s);
    }
   }}
   for(const k of local)states.set(k,(states.get(k)||0)+1);
  }
  const ranks=[];let maxSupport=0;
  for(const [k,count] of states){const [ak,sk]=k.split(":"),a=BigInt(ak),s=Number(sk),prod=a*ci,Q=mod(prod/A+BigInt(s),modHigh);
   const P=dig(Q,fitN-13),nll=score(P,K.lm);ranks.push({k,count,nll});if(count>maxSupport)maxSupport=count;
  }
  ranks.sort((x,y)=>y.nll-x.nll||y.count-x.count||x.k.localeCompare(y.k));
  const bySupport=[...ranks].sort((x,y)=>y.count-x.count||y.nll-x.nll||x.k.localeCompare(y.k));
  const truthRank=truth?ranks.findIndex(x=>x.k===truth)+1:null,truthSupportRank=truth?bySupport.findIndex(x=>x.k===truth)+1:null;
  const best=ranks[0]??null;if(!best)return {queries,rawHits,candidates:0,maxSupport,truthRank,truthSupportRank};
  const [ak,sk]=best.k.split(":"),a=BigInt(ak),s=Number(sk),prod=a*ci,L=prod%A,Q=mod(prod/A+BigInt(s),modHigh),P=dig(Q,N-13);
  const b=s?A-L:0n,full=dig(mod(prod+b,M(N)),N);
  if(!equal(full.slice(13),P)||!equal(dig(mod((integer(full)-b)*inv(a,M(N)),M(N)),N),C))throw Error("forward replay");
  return {queries,rawHits,candidates:states.size,maxSupport,best,supportWinner:bySupport[0],truthRank,truthSupportRank,bRange:s?[String(A-L),String(A-1n)]:["0",String(A-L-1n)],holdScore:score(P.slice(fitN-13),K.lm),body:P,head:P.slice(0,90).map(x=>gp.translit[x]).join(""),holdHead:P.slice(fitN-13,fitN-13+90).map(x=>gp.translit[x]).join("")};
 }
 const K=bank(new Set(["0_koan_1","0_loss_of_divinity"]));const target=gp.pages.slice(0,3).flatMap(p=>p.indices);
 if(target.length!==729||gp.pages[0].indices.length!==262)throw Error("source scope");
 // Controls use both carry states, distinct native source sections and leave-section-out models.
 const plants=[];
 for(const [name,fitN,a,b,excluded] of [
  ["0_loss_of_divinity",145,1234567890123456787n,0n,new Set(["0_koan_1","0_loss_of_divinity"])],
  ["jpg107-167",155,2345678901234567891n,A-1n,new Set(["jpg107-167","0_koan_1"])]
 ]){
  const P=native.find(x=>x.name===name).t,N=P.length,mm=M(N),C=dig(mod((integer(P)-b)*inv(a,mm),mm),N),ci=integer(C),L=a*ci%A,s=Number((L+b)/A),KK=bank(excluded);
  const anchorPositions=[];for(let i=13;i+14<=fitN;i++)if(KK.frags.has(id(P.slice(i,i+14))))anchorPositions.push(i);
  if(!anchorPositions.length)throw Error("no registered control anchor");
  const ans=solve(C,fitN,KK,a+":"+s);const exact=ans.body.filter((x,i)=>x===P[i+13]).length,holdExact=ans.body.slice(fitN-13).filter((x,i)=>x===P[fitN+i]).length;delete ans.body;
  plants.push({name,N,fitN,a:String(a),b:String(b),s,anchors:anchorPositions,fragmentCount:KK.frags.size,exact,holdExact,...ans});
 }
 const original=solve(target,262,K);delete original.body;
 return {toys,fragments:K.frags.size,original,plants};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
