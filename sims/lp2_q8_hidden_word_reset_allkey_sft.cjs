"use strict";
// All-key branch bounds for latent word-reset GP29 with literal F.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),Q=29,T=8,L=24,B=4,N=299,S=223,NEG=-Infinity,EPS=.05,LP=Math.log(Q),LIMIT=config.limit||100000,TH=config.threshold??-2.6;
 const mod=x=>(x+Q)%Q,ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),id=w=>String.fromCharCode(...w.map(x=>65+x));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o}
 function words(t){return (t.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w));}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>words(body(t))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const counts=new Map(),external=new Map(),lengths=new Float64Array(L+1).fill(.5),u=new Float64Array(Q),bi=new Float64Array(Q*Q),tri=new Float64Array(Q*Q*Q);let total=0,et=0,nchar=0;
 function inc(m,k,v){m.set(k,(m.get(k)||0)+v)}
 for(const arr of training)for(const w of arr)if(w.length&&w.length<=L){inc(counts,id(w),1);lengths[w.length]++;total++;let a=-1,b=-1;for(const x of w){u[x]++;nchar++;if(b>=0)bi[b*Q+x]++;if(a>=0)tri[(a*Q+b)*Q+x]++;a=b;b=x;}}
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const v=[...new Set([id(word(m[1],true)),id(word(m[1],false))])].filter(k=>k.length<=L);for(const k of v){const f=+m[2]/v.length;inc(external,k,f);et+=f;}}
 const types=new Set([...counts.keys(),...external.keys(),...Array.from({length:Q},(_,x)=>String.fromCharCode(65+x))]),lex=new Map(),pref=new Map();
 for(const k of types){const p=(1-EPS)*(.85*(counts.get(k)||0)/total+.149*(external.get(k)||0)/et+.001/types.size);lex.set(k,Math.log(p));for(let j=1;j<k.length;j++)inc(pref,k.slice(0,j),p);}
 for(const [k,v] of pref)pref.set(k,Math.log(v));
 const lsum=lengths.slice(1).reduce((a,b)=>a+b,0),ll=Array.from(lengths,x=>Math.log(x/lsum)),tail=ll.map((x,i)=>Math.log(lengths.slice(i+1).reduce((a,b)=>a+b,0)/lsum));
 const p1=Float64Array.from(u,x=>Math.log((x+.5)/(nchar+.5*Q))),p2=new Float64Array(Q*Q),p3=new Float64Array(Q*Q*Q);
 for(let a=0;a<Q;a++){let z=0;for(let x=0;x<Q;x++)z+=bi[a*Q+x];for(let x=0;x<Q;x++)p2[a*Q+x]=Math.log((bi[a*Q+x]+8*Math.exp(p1[x]))/(z+8));}
 for(let a=0;a<Q*Q;a++){let z=0;for(let x=0;x<Q;x++)z+=tri[a*Q+x];for(let x=0;x<Q;x++)p3[a*Q+x]=Math.log((tri[a*Q+x]+8*Math.exp(p2[(a%Q)*Q+x]))/(z+8));}
 const cl=(a,b,x)=>a<0?(b<0?p1[x]:p2[b*Q+x]):p3[(a*Q+b)*Q+x],logadd=(a,b)=>a===NEG?b:b===NEG?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));

 const power=Array.from({length:T+1},(_,i)=>Q**i),BLOCK=power[T],D=B+1,sc=Array.from({length:L+1},(_,i)=>Math.exp(-TH*i)),lenP=ll.map(Math.exp),tailP=tail.map(Math.exp);
 const entries=[...lex].map(([k,v])=>({w:Uint8Array.from(k,x=>x.charCodeAt(0)-65),p:Math.exp(v)}));
 if(entries.length>=65536||N*64>=65536)throw Error("record packing capacity");
 const unpack=(x,d)=>{const a=new Uint8Array(d);for(let i=d-1;i>=0;i--){a[i]=x%Q;x=Math.floor(x/Q);}return a};
 function makeIndex(C){
  const M=C.length;let n=0,byLength=new Uint32Array(T+1),keys=null,info=null,cur=0,tmp=new Uint8Array(T);
  function generate(write){for(let i=0;i<M;i++)for(let id=0;id<entries.length;id++){
   const w=entries[id].w,m=Math.min(w.length,M-i);let h=0,code=0,ok=true;
   for(let j=0;j<m;j++){const x=w[j],c=C[i+j];if(!x){if(c!==0){ok=false;break;}continue;}const a=mod(c-x);if(h<T){tmp[h]=a;code=code*Q+a;}else if(tmp[h%T]!==a){ok=false;break;}h++;}
   if(!ok)continue;
   const k=Math.min(h,T),loc=i*64+m*2+(w.length>m?1:0);
   if(write){keys[cur]=k*BLOCK+code*power[T-k];info[cur]=loc*65536+id;cur++;}else{n++;byLength[k]++;}
  }}
  generate(false);keys=new Float64Array(n);info=new Uint32Array(n);generate(true);if(cur!==n)throw Error("record count");
  let a=new Float64Array(n),b=new Uint32Array(n),count=new Uint32Array(65536);
  for(let pass=0;pass<3;pass++){const div=65536**pass;count.fill(0);for(let i=0;i<n;i++)count[Math.floor(keys[i]/div)%65536]++;let sum=0;for(let j=0;j<count.length;j++){const v=count[j];count[j]=sum;sum+=v;}for(let i=0;i<n;i++){const at=count[Math.floor(keys[i]/div)%65536]++;a[at]=keys[i];b[at]=info[i];}[keys,a]=[a,keys];[info,b]=[b,info];}
  for(let i=1;i<n;i++)if(keys[i]<keys[i-1])throw Error("radix sort");
  function lower(x){let a=0,b=n;while(a<b){const m=(a+b)>>>1;if(keys[m]<x)a=m+1;else b=m;}return a}
  const W=new Float64Array(M*64),A=new Float64Array((M+1)*D);
  let evals=0,recordVisits=0;
  function bound(code,depth){
   evals++;const K=unpack(code,depth);W.fill(0);A.fill(0);A[0]=1;
   for(let k=0;k<=T;k++){const d=Math.min(k,depth),p=Math.floor(code/power[depth-d]),lo=k*BLOCK+p*power[T-d],hi=lo+power[T-d],l=lower(lo),r=lower(hi);recordVisits+=r-l;for(let z=l;z<r;z++){const q=info[z],loc=q>>>16,id=q&65535,len=(loc&63)>>>1;W[loc]+=entries[id].p*sc[len];}}
   let partial=0;
   for(let i=0;i<M;i++){
    const at=i*D,max=Math.min(L,M-i);let any=false,canBack=false;for(let b=0;b<D;b++){if(A[at+b]>0){any=true;if(b<B)canBack=true;}}if(!any)continue;
    for(let len=1;len<=max;len++){const q=W[i*64+len*2];if(q){const to=(i+len)*D;for(let b=0;b<D;b++)A[to+b]+=A[at+b]*q;}}
    if(M-i<L){const q=W[i*64+(M-i)*2+1];if(q)for(let b=0;b<D;b++)partial+=A[at+b]*q;}
    if(!canBack)continue;
    function backComplete(len,p){const w=EPS*sc[len]*lenP[len]*p,to=(i+len)*D+1;for(let b=0;b<B;b++)A[to+b]+=A[at+b]*w}
    function backPartial(p){const len=M-i,w=EPS*sc[len]*tailP[len]*p;for(let b=0;b<B;b++)partial+=A[at+b]*w}
    function walk(j,h,a,b,p){
     const len=j-i;if(len){backComplete(len,p);if(j===M&&len<L)backPartial(p);}
     if(j===M||len===L)return;
     if(depth<T&&h===depth){for(let m=len+1;m<=max;m++)backComplete(m,p);if(M-i<L)backPartial(p);return;}
     const c=C[j],x=mod(c-K[h%T]);if(c===0)walk(j+1,h,b,0,p*Math.exp(cl(a,b,0)));if(x)walk(j+1,h+1,b,x,p*Math.exp(cl(a,b,x)));
    }
    walk(i,0,-1,-1,1);
   }
   let full=partial;for(let b=0;b<D;b++)full+=A[M*D+b];return full>0?Math.log(full)/M+TH:NEG;
  }
  return {bound,stats:()=>({records:n,byLength:Array.from(byLength),evals,recordVisits})};
 }
 function encode(W,K){return W.flatMap(w=>{let h=0;return w.map(x=>x===0?0:mod(x+K[h++%T]));});}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function control(d){const W=donors[d],start=Math.floor(W.length*.98),R=rng(0x15a11000+d*13);let ws=null,off=-1;
  for(let i=start;i<W.length;i++){let z=[],n=0;for(let j=i;j<W.length&&n<N;j++){z.push(W[j]);n+=W[j].length;}if(n!==N||z.some(w=>w.length>L)||z.filter(w=>!lex.has(id(w))).length>B)continue;ws=z;off=i;break;}
  if(!ws)throw Error("no control window "+d);const K=Array.from({length:T},()=>Math.floor(R()*Q));return {C:encode(ws,K),P:ws.flat(),truth:K,offset:off};
 }
 const pack=k=>k.reduce((a,b)=>a*Q+b,0),heap=[];
 function push(v){let i=heap.length;heap.push(v);while(i){const p=(i-1)>>>1;if(heap[p].s>=v.s)break;heap[i]=heap[p];i=p;}heap[i]=v;}
 function pop(){const v=heap[0],z=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].s>heap[j].s)j++;if(heap[j].s<=z.s)break;heap[i]=heap[j];i=j;}heap[i]=z;}return v;}
 function solve(item,search=true){const C=item.C.slice(0,S),index=makeIndex(C),truth=item.truth,truthBounds=truth?Array.from({length:T},(_,i)=>index.bound(pack(truth.slice(0,i+1)),i+1)):null;
  if(truthBounds&&truthBounds.some((v,i)=>i&&v>truthBounds[i-1]+1e-9))throw Error("bound monotonicity");
  if(!search)return {truth,truthBounds,offset:item.offset,stats:index.stats()};
  heap.length=0;const tested=Array(T+1).fill(0),kept=Array(T+1).fill(0),best=Array(T+1).fill(NEG);let winner=null,expanded=0;
  if(config.roots){for(const code of config.roots){const s=index.bound(code,1);tested[1]++;best[1]=Math.max(best[1],s);if(s>=TH-1e-9){kept[1]++;push({code,d:1,s});}}}else push({code:0,d:0,s:0});
  while(heap.length&&index.stats().evals+Q<=LIMIT){const p=pop();if(p.d===T){winner={key:Array.from(unpack(p.code,T)),fit:p.s};break;}expanded++;
   for(let k=0;k<Q;k++){const code=p.code*Q+k,d=p.d+1,s=index.bound(code,d);tested[d]++;best[d]=Math.max(best[d],s);if(s>=TH-1e-9){kept[d]++;push({code,d,s});}}
  }
  return {truth,truthBounds,offset:item.offset,roots:config.roots??null,winner,exhaustive:!heap.length&&!winner,expanded,tested,kept,best,frontier:heap.length,frontierTop:heap[0]??null,remaining:heap.length?heap.map(x=>({code:x.code,d:x.d,s:x.s})):[],stats:index.stats()};
 }
 const cases=[];for(const name of config.cases||["control-0-bound"]){if(name==="original"){const C=gp.pages.find(p=>p.page===54).indices.slice(9).concat(gp.pages.find(p=>p.page===55).indices);if(C.length!==N)throw Error("original length");cases.push({name,...solve({C})});}else{const [_,d,mode]=name.split("-");cases.push({name,...solve(control(+d),mode!=="bound")});}}
 return {parameters:{N,S,L,B,T,TH,LIMIT,lexicon:types.size},cases};

}
if(require.main===module){const cases=process.argv.slice(2);console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),{cases:cases.length?cases:undefined,limit:Number(process.env.LIMIT)||100000,roots:process.env.ROOTS?process.env.ROOTS.split(',').map(Number):undefined}),null,2))}
module.exports={experiment};
