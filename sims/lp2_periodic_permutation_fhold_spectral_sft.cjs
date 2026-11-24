"use strict";
/** Exact support and certified Fourier collision bounds for periodic GP29
 * permutations with latent plaintext-F holds. No language fitting. */
const fs=require("fs");
const path=require("path");
const assert=require("assert");
const S=1000000n;
const mod=(x,q)=>(x%q+q)%q;
function pop(x){let n=0;while(x){x&=x-1;n++}return n}
function blocks(C,cuts=new Set()){
 let out=[],v=[],start=0;
 function flush(){if(v.length)out.push({start,v});v=[]}
 for(let i=0;i<C.length;i++){
  if(cuts.has(i)){flush();start=i}
  if(C[i]===0){flush();start=i+1}
  else{if(!v.length)start=i;v.push(C[i])}
 }
 flush();return out;
}
function support(bs,q,affine,cap=100000){
 let bb=bs.slice().sort((a,b)=>b.v.length-a.v.length||a.start-b.start).slice(0,24).map(b=>{
  let m=Array(q).fill(0);b.v.forEach((x,i)=>m[i%q]|=1<<x);return {...b,m}
 });
 const triples=[];
 for(let a=1;a<29;a++)for(let b=0;b<29;b++)triples.push((1<<b)|(1<<mod(12*a+b,29))|(1<<mod(22*a+b,29)));
 const cache=new Map();
 function valid(m){
  if(pop(m)>26)return false;
  if(!affine)return true;
  if(!cache.has(m))cache.set(m,triples.some(t=>(t&m)===0));
  return cache.get(m)
 }
 function merge(m,b,r){let t=m.map((x,i)=>x|b.m[mod(i-r,q)]);return t.every(valid)?t:null}
 let nodes=0,depth=0,capped=false;
 function dfs(m,left,d){
  if(++nodes>cap){capped=true;return null}
  depth=Math.max(depth,d);
  if(!left.length)return true;
  let ix=-1,opts=null;
  for(let i=0;i<left.length;i++){
   let z=[];for(let r=0;r<q;r++){let t=merge(m,left[i],r);if(t)z.push(t)}
   if(!z.length)return false;
   if(opts===null||z.length<opts.length){ix=i;opts=z}
  }
  let rest=left.filter((_,i)=>i!==ix);
  for(let t of opts){let v=dfs(t,rest,d+1);if(v!==false)return v}
  return false
 }
 let ok=bb.length?dfs(bb[0].m,bb.slice(1),1):true;
 return {ok,nodes,depth,capped,selected:bb.map(b=>[b.start,b.v.length])};
}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function isqrt(n){assert(n>=0n);if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));while(true){let y=(x+n/x)/2n;if(y>=x)return x;x=y}}
function csqrt(n){let r=isqrt(n);return r*r===n?r:r+1n}
function roundDiv(n,d){if(n<0n)return -roundDiv(-n,d);return (2n*n+d)/(2n*d)}
const factorial=[1n];for(let i=1;i<=41;i++)factorial.push(factorial[i-1]*BigInt(i));
assert(7n**41n*10n**12n<factorial[41]);
function roots(q){
 let den=1000000000000000n*BigInt(q),common=den**40n*factorial[40];
 return Array.from({length:q},(_,r)=>{
  let n=2n*3141592653589793n*BigInt(r),re=0n,im=0n;
  for(let j=0;j<=40;j++){
   let t=n**BigInt(j)*den**BigInt(40-j)*(factorial[40]/factorial[j]);
   if(j%2===0)re+=(j%4===0?t:-t);else im+=(j%4===1?t:-t)
  }
  return [roundDiv(re*S,common),roundDiv(im*S,common)]
 })
}
function square(A,B){
 let n=A.length,R=Array.from({length:n},()=>Array(n).fill(0n)),I=Array.from({length:n},()=>Array(n).fill(0n));
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){
  R[i][j]+=A[i][k]*A[k][j]-B[i][k]*B[k][j];
  I[i][j]+=A[i][k]*B[k][j]+B[i][k]*A[k][j];
 }
 return [R,I]
}
function eigenUpper(A,B,den){
 for(let j=0;j<4;j++)[A,B]=square(A,B);
 let rowmax=0n;
 for(let i=0;i<A.length;i++){let s=A[i].reduce((v,x,j)=>v+csqrt(x*x+B[i][j]*B[i][j]),0n);if(s>rowmax)rowmax=s}
 let rhs=rowmax*1000n**16n,d=den**16n,lo=0n,hi=1000n;
 while(hi**16n*d<rhs)hi*=2n;
 while(lo<hi){let m=(lo+hi)/2n;if(m**16n*d>=rhs)hi=m;else lo=m+1n}
 return lo
}
function spectral(bs,q){
 const n=bs.reduce((s,b)=>s+b.v.length,0);
 const weights=bs.map(b=>csqrt(BigInt(b.v.length)));
 const D=weights.reduce((a,b)=>a/gcd(a,b)*b,1n),W=weights.reduce((a,b)=>a+b,0n);
 let hist=Array(29).fill(0n);for(let b of bs)for(let c of b.v)hist[c]++;
 let num=hist.reduce((s,x)=>s+x*x*S*S,0n);
 const rt=roots(q),lambdas=[];
 for(let k=1;k<=Math.floor(q/2);k++){
  let A=Array.from({length:28},()=>Array(28).fill(0n)),B=Array.from({length:28},()=>Array(28).fill(0n));
  bs.forEach((b,j)=>{
   let R=Array(28).fill(0n),I=Array(28).fill(0n);
   b.v.forEach((c,i)=>{let [r,t]=rt[(i*k)%q];R[c-1]+=r;I[c-1]+=t});
   let w=D/weights[j];
   for(let a=0;a<28;a++)for(let c=0;c<28;c++){
    A[a][c]+=w*(R[a]*R[c]+I[a]*I[c]);
    B[a][c]+=w*(I[a]*R[c]-R[a]*I[c]);
   }
  });
  let lam=eigenUpper(A,B,D*S*S);lambdas.push(Number(lam)/1000);
  let bound=1000n*csqrt(W*lam*1000n)+2n*BigInt(n);
  num+=(2*k===q?1n:2n)*bound*bound;
 }
 return {n,blocks:bs.length,W:Number(W),lambdas,upper:Number(num/(BigInt(q)*S*S))-n}
}
function lower(P,q,z){
 let h=Array(29).fill(0);for(let c of P)h[c]++;
 if(h[0]>z)return null;
 let d=z-h[0];h[0]=0;
 while(d--){let i=1;for(let j=2;j<29;j++)if(h[j]>h[i])i=j;assert(h[i]>0);h[i]--}
 return h.reduce((s,n)=>{let a=Math.floor(n/q),r=n%q;return s+(q-r)*a*(a-1)+r*a*(a+1)},0)
}
function encodeText(t,latin){
 let out=[];
 for(let w of t.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
  while(w.length){
   let tok=["ING","TH","EO","OE","AE","IA","IO","EA","NG"].find(x=>w.startsWith(x))||w[0];
   let key=tok==="ING"?"NG":tok==="IO"?"IA":tok;
   let i=latin.indexOf(key);assert(i>=0,key);out.push(i);w=w.slice(tok.length)
  }
 }
 return out
}
function plant(P,q){
 let C=[],p=0,H=Array.from({length:q},()=>Array(29).fill(0)),J=Array.from({length:q},()=>Array(29).fill(0));
 for(let x of P){
  if(x===0){C.push(0);continue}
  let a=1+(17*p+5)%28,b=(11*p+7)%29,c=mod(a*x+b,29);
  C.push(c);if(c){H[p][c]++;J[p][x]++}p=(p+1)%q;
 }
 let f=h=>h.flat().reduce((s,n)=>s+n*(n-1),0);
 assert.equal(f(H),f(J));return {C,K:f(H)}
}
function experiment(corpus,native,texts){
 let pages=corpus.pages.filter(p=>p.page<56),C=pages.flatMap(p=>p.indices),z=C.filter(x=>x===0).length;
 let P=native.sections.flatMap(s=>Array.from(s.source_text).map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0));
 assert.equal(C.length,12956);assert.equal(z,458);assert.equal(P.length,2979);
 assert(!P.includes(12)&&!P.includes(22));
 let N=C.length,R=Array.from({length:N},(_,i)=>P[i%P.length]);
 let cuts=new Set(),offset=0;for(let p of pages){cuts.add(offset);offset+=p.indices.length}
 let latin=corpus.rune_order||corpus.latin||["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 if(!Array.isArray(latin)||typeof latin[0]!=="string"||latin[0]!=="F")latin=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const out={N,z,native:P.length,results:[]};
 for(let q of [8,13]){
  let b=blocks(C),bp=blocks(C,cuts);
  let a=spectral(b,q),page=spectral(bp,q);
  let s1=support(b,q,true),s2=support(b,q,false),sp=support(bp,q,false);
  assert(!s1.capped&&!s2.capped&&!s1.ok&&!s2.ok);
  let pl=plant(R,q),pb=blocks(pl.C),pz=pl.C.filter(x=>!x).length,plow=lower(R,q,pz),pup=spectral(pb,q),ps=support(pb,q,true);
  assert(ps.ok&&plow<=pl.K&&pl.K<=pup.upper);
  let donors=[];
  for(let [name,text] of Object.entries(texts)){
   if(name==="gibran")text=text.slice(text.indexOf("Almustafa,"));
   if(name==="emerson")text=text.slice(text.indexOf("I. HISTORY."));
   if(name!=="shakespeare")text=text.split(/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG/i)[0];
   let t=encodeText(text,latin),v=[];
   for(let i=0;i<32;i++){let start=Math.floor((t.length-N)*i/31);v.push(lower(t.slice(start,start+N),q,z))}
   let elig=v.filter(x=>x!==null);
   donors.push({name,length:t.length,eligible:elig.length,min:Math.min(...elig),max:Math.max(...elig),excluded:v.filter(x=>x===null||x>a.upper).length,pageExcluded:v.filter(x=>x===null||x>page.upper).length})
  }
  out.results.push({q,original:a,pageReset:page,supportAffine:s1,supportPermutation:s2,supportPage:sp,nativeLower:lower(R,q,z),plant:{zeros:pz,K:pl.K,lower:plow,upper:pup.upper,support:ps},donors});
 }
 return out
}
module.exports={experiment,blocks,support,spectral,lower,encodeText};
if(require.main===module){
 let root=process.argv[2]||path.resolve(__dirname,"..");
 let read=p=>fs.readFileSync(path.join(root,p),"utf8");
 let result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),{gibran:read("resources/control/gibran_prophet_58585.txt"),shakespeare:read("resources/control/shakespeare_first300k.txt"),emerson:read("resources/control/emerson_essays_2944.txt")});
 console.log(JSON.stringify(result,null,2))
}