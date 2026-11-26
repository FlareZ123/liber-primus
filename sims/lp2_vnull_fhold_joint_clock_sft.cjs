"use strict";
const fs=require("node:fs");
const Q=29, M=30, S=29, B=M*M*M, SUPP=1-.664/3.448;
const mod=x=>(x%Q+Q)%Q, logAdd=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
const names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
const tok=names.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
function words(t){t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return (t.toUpperCase().match(/[A-Z]+(?:'[A-Z]+)*/g)||[]).map(w=>{w=w.replace(/'/g,"").replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];while(w){const x=tok.find(x=>w.startsWith(x[0]));if(!x)throw Error(w);a.push(x[1]);w=w.slice(x[0].length)}return a})}
function train(seqs){
 const uni=new Float64Array(Q), bi=new Float64Array(Q*Q),tri=new Float64Array(Q**3),quad=new Float64Array(Q**4),bc=new Float64Array(Q),tc=new Float64Array(Q**2),qc=new Float64Array(Q**3);let n=0;
 for(const seq of seqs)for(let i=0;i<seq.length;i++){let p=seq[i];uni[p]++;n++;if(i>=1){let c=seq[i-1];bi[c*Q+p]++;bc[c]++}if(i>=2){let j=seq[i-2]*Q+seq[i-1];tri[j*Q+p]++;tc[j]++}if(i>=3){let j=(seq[i-3]*Q+seq[i-2])*Q+seq[i-1];quad[j*Q+p]++;qc[j]++}}
 const lp=new Float64Array(B*Q);
 for(let a=0;a<M;a++)for(let b=0;b<M;b++)for(let c=0;c<M;c++)for(let p=0;p<Q;p++){
  let x=(uni[p]+.5)/(n+Q*.5);if(c<Q)x=(bi[c*Q+p]+8*x)/(bc[c]+8);if(b<Q&&c<Q){let j=b*Q+c;x=(tri[j*Q+p]+16*x)/(tc[j]+16)}if(a<Q&&b<Q&&c<Q){let j=(a*Q+b)*Q+c;x=(quad[j*Q+p]+32*x)/(qc[j]+32)}lp[((a*M+b)*M+c)*Q+p]=Math.log(x);
 }
 return lp;
}
/** All possible single-plaintext-rune events from state (i,j). */
function edges(C,K,i,j,supp=SUPP){
 const n=C.length,prev=C[i-1],c=C[i],e=[];
 if(c===0)e.push({i:i+1,j,p:0,w:0,kind:"hold"});
 const p=mod(c-K[j]);if(p!==0&&(c!==prev||supp<1))e.push({i:i+1,j:j+1,p,w:i&&c===prev?Math.log1p(-supp):0,kind:"real"});
 if(supp>0&&i>0&&c!==prev){
  const p=mod(prev-K[j]);if(p!==0){let w=0;for(let t=i;t<n;t++){const x=mod(p+K[j+t-i]);if(x===C[t]){if(x!==C[t-1]||supp<1)e.push({i:t+1,j:j+t-i+1,p,w:w+(x===C[t-1]?Math.log1p(-supp):0),kind:"null"});break}if(x!==C[t-1]||C[t]===C[t-1])break;w+=Math.log(supp/28)}}
 }
 return e;
}
function replay(C,K,events,supp=SUPP){let i=0,j=0;for(const e of events){if(e.kind==="hold"){if(e.p!==0||e.i!==i+1||e.j!==j||C[i]!==0)throw Error("hold replay")}else{if(e.p===0||e.j-j!==e.i-i)throw Error("clock");for(let t=i;t<e.i-1;t++){if(!t||!supp||mod(e.p+K[j+t-i])!==C[t-1]||C[t]===C[t-1])throw Error("null replay")}if(mod(e.p+K[e.j-1])!==C[e.i-1])throw Error("real replay")}i=e.i;j=e.j}if(i!==C.length)throw Error("length");return j}
function decode(C,K,lp,supp=SUPP){
 if(K.length<C.length)throw Error("short key");
 const n=C.length,D=Array.from({length:n+1},()=>new Map()),start=(S*M+S)*M+S;D[0].set(start,{j:0,h:start,a:0,u:0,v:0,back:null});
 let states=1,maxLayer=1;const ul=-Math.log(Q);
 for(let i=0;i<n;i++){
  const E=new Map();for(const s of D[i].values()){
   let es=E.get(s.j);if(!es){es=edges(C,K,i,s.j,supp);E.set(s.j,es)}
   for(const e of es){const h=(s.h%(M*M))*M+e.p,key=e.j*B+h,l=lp[s.h*Q+e.p]+e.w,u=ul+e.w;let t=D[e.i].get(key);if(!t){t={j:e.j,h,a:-Infinity,u:-Infinity,v:-Infinity};D[e.i].set(key,t);states++}t.a=logAdd(t.a,s.a+l);t.u=logAdd(t.u,s.u+u);if(s.v+l>t.v){t.v=s.v+l;t.back=s;t.e=e}}
  }
  maxLayer=Math.max(maxLayer,D[i].size);
 }
 let A=-Infinity,U=-Infinity,best=null;for(const s of D[n].values()){A=logAdd(A,s.a);U=logAdd(U,s.u);if(!best||s.v>best.v)best=s}
 if(!best)return {possible:false,states,maxLayer};
 const events=[];for(let s=best;s.back;s=s.back)events.push(s.e);events.reverse();const consumed=replay(C,K,events,supp),P=events.map(e=>e.p);
 return {possible:true,P,events,consumed,holds:events.filter(e=>e.kind==="hold").length,nulls:n-P.length,ll:A/n,bf:(A-U)/n,logEvidence:A,uniformEvidence:U,states,maxLayer};
}
function primes(n){const p=[];for(let x=2;p.length<n;x++)if(p.every(q=>q*q>x||x%q))p.push(x);return p}
function makeRng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}}
function encode(P,K,rng,supp=SUPP){const C=[];let j=0;for(const p of P){if(p===0){C.push(0);continue}for(;;){const c=mod(p+K[j++]);if(j>K.length)throw Error("short plant key");if(C.length&&c===C.at(-1)&&rng(1e9)/1e9<supp){let z=rng(28);if(z>=c)z++;C.push(z)}else{C.push(c);break}}}return {C,consumed:j}}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(raw){
 const corpus=JSON.parse(raw[0]),native=JSON.parse(raw[4]),rm=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x))})),seq=raw.slice(1,4).map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7)))),rng=makeRng(0x47f0a11),prime=primes(15000).map(p=>mod(p-1)),kw=["WELCOME","DIUINITY","FIRFUMFERENFE"].map(w=>words(w).flat()),p56=ns.find(s=>s.name==="p56_an_end").P,p57=ns.find(s=>s.name==="p57_parable").P;
 if(p57.length!==95||p57.some((x,i)=>x!==corpus.pages[57].indices[i]))throw Error("p57 control");
 const authentic=encode(p56,prime,rng,0);if(p56.length!==85||authentic.consumed!==84||authentic.C.some((x,i)=>x!==corpus.pages[56].indices[i]))throw Error("p56 sender regression");
 const a56=decode(authentic.C,prime,lp,0);
 const control=[];for(let i=0;i<60;i++){
  const donor=i%2===0?ns.filter(s=>s.P.length>=240)[rng(ns.filter(s=>s.P.length>=240).length)].P:seq[i%3].slice(Math.floor(seq[i%3].length*.7));
  const P=donor.slice(rng(donor.length-239));P.length=240;
  const kind=i%5, K=kind===0?Array.from({length:600},()=>rng(Q)):kind===1?prime.slice(0,600):Array.from({length:600},(_,j)=>kw[kind-2][j%kw[kind-2].length]);
  const e=encode(P,K,rng),d=decode(e.C,K,lp),W=Array.from({length:600},()=>rng(Q)),wrong=decode(e.C,W,lp);
  if(!d.possible)throw Error("true key impossible");
  control.push({kind,n:e.C.length,truthHolds:P.filter(x=>x===0).length,truthNulls:e.C.length-P.length,ed:edit(P,d.P),pos:d.P.reduce((n,x,j)=>n+(x===P[j]),0)/P.length,ll:d.ll,bf:d.bf,holds:d.holds,nulls:d.nulls,wrong:wrong.possible?{ll:wrong.ll,bf:wrong.bf}:null});
 }
 const original=[];for(const page of corpus.pages.slice(0,56)){if(!page.indices.length)continue;for(const sign of [1,-1]){const K=prime.slice(0,page.indices.length).map(x=>mod(sign*x)),d=decode(page.indices,K,lp);original.push({page:page.page,key:"prime-1",sign,n:page.indices.length,...d,events:undefined,text:d.possible?d.P.map(x=>names[x]).join(""):null})}}
 return {supp:SUPP,seed:"0x47f0a11",authentic:{ed:edit(p56,a56.P),pos:a56.P.reduce((n,x,i)=>n+(x===p56[i]),0)/p56.length,holds:a56.holds,consumed:a56.consumed,ll:a56.ll,bf:a56.bf},control,original};
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={run,train,decode,encode,edges,replay,words,primes,makeRng,paths,mod,names,SUPP};
