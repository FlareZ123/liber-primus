"use strict";
// Fixed #1210 prime-pointer law with latent true-word boundaries. No origin or rule search.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),Q=29,T=8,L=24,B=8,N=729,S=262,NEG=-Infinity,EPS=.05,LP=Math.log(Q),R=464;
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

 const primes=[]; for(let n=2;primes.length<R;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
 if(primes.at(-1)!==3301||gp.prime.some((p,i)=>p!==primes[i]))throw Error("prime reference");
 const shifts=primes.map(x=>(x-1)%Q),isPrime=new Uint8Array(3302);
 for(const p of primes)isPrime[p]=1;
 const next=(h,s)=>((h+(isPrime[s]?s:-s))%R+R)%R;
 function encode(W,mode="pointer",pad=[]){let h=0,k=0;return W.flatMap(w=>{let s=0;const out=w.map(x=>{s+=gp.prime[x];if(!x)return 0;const c=mod(x+(mode==="pad"?pad[k++]:shifts[h]));h=(h+1)%R;return c});if(mode==="pointer")h=next(h,s);return out;});}
 function pass(C,partial,trace=false){
  const M=C.length,D=B+1,U=R*D,H=(M+1)*U,A=new Float64Array(H).fill(NEG),V=trace?new Float64Array(H).fill(NEG):null,parent=trace?new Int32Array(H).fill(-1):null,masks=trace?new Uint32Array(H):null;
  A[0]=0;if(V)V[0]=0;
  let part=NEG,states=0,edges=0,updates=0;
  const loge=Math.log(EPS);
  for(let i=0;i<M;i++)for(let h=0;h<R;h++){
   const at=i*U+h*D;let min=0;while(min<=B&&A[at+min]===NEG)min++;if(min>B)continue;states++;
   function complete(j,d,w,o,mask){
    if(w===NEG)return;edges++;
    const to=j*U+d*D+o;
    for(let b=min;b+o<=B;b++){const q=at+b;if(A[q]===NEG)continue;const r=to+b;A[r]=logadd(A[r],A[q]+w);updates++;if(V){const v=V[q]+w;if(v>V[r]){V[r]=v;parent[r]=q;masks[r]=mask;}}}
   }
   function endPartial(w,o){if(w===NEG)return;for(let b=min;b+o<=B;b++)if(A[at+b]!==NEG)part=logadd(part,A[at+b]+w);}
   function walk(j,cursor,k,s,a,b,v,mask){
    const len=j-i;
    if(len){const d=next(cursor,s),w=lex.get(k)??NEG;complete(j,d,w,0,mask);if(min<B)complete(j,d,loge+ll[len]+v,1,mask);
     if(partial&&j===M&&len<L){endPartial(pref.get(k)??NEG,0);if(min<B)endPartial(loge+tail[len]+v,1);}}
    if(j===M||len===L||(min===B&&len&&!pref.has(k)))return;
    const c=C[j],x=mod(c-shifts[cursor]);if(c===0)walk(j+1,cursor,k+"A",s+gp.prime[0],b,0,v+cl(a,b,0),mask|(1<<len));
    if(x)walk(j+1,(cursor+1)%R,k+String.fromCharCode(65+x),s+gp.prime[x],b,x,v+cl(a,b,x),mask);
   }
   walk(i,h,"",0,-1,-1,0,0);
  }
  let complete=NEG;for(let q=M*U;q<H;q++)complete=logadd(complete,A[q]);
  const score=partial?logadd(complete,part):complete,out={score,complete,partial:part,states,edges,updates};
  if(trace&&complete!==NEG){let to=M*U;for(let q=to+1;q<H;q++)if(V[q]>V[to])to=q;
   const finalCursor=Math.floor((to%U)/D),fallback=to%D,W=[];
   while(to){const p=parent[to];if(p<0)throw Error("trace");const i=Math.floor(p/U),j=Math.floor(to/U),mask=masks[to],w=[];let h=Math.floor((p%U)/D),s=0;for(let t=i;t<j;t++){const held=!!(mask&(1<<(t-i))),x=held?0:mod(C[t]-shifts[h]);if(!held)h=(h+1)%R;w.push(x);s+=gp.prime[x];}if(next(h,s)!==Math.floor((to%U)/D))throw Error("cursor trace");W.push(w);to=p;}W.reverse();
   if(encode(W).join()!==C.join())throw Error("replay");
   Object.assign(out,{words:W,P:W.flat(),text:W.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),fallback,finalCursor});
  }
  return out;
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function control(d,fresh,mode){const W=donors[d],start=Math.floor(W.length*(fresh?.96:.87)),rand=rng(0x12100000+d*13);let words=null,off=-1;
  for(let i=start;i<W.length;i++){let z=[],n=0;for(let j=i;j<W.length&&n<N;j++){z.push(W[j]);n+=W[j].length;}if(n!==N||z.some(w=>w.length>L)||z.filter(w=>!lex.has(id(w))).length>B)continue;words=z;off=i;break;}
  if(!words)throw Error("no control window "+d);
  return {name:`${fresh?"fresh":"dev"}-${d}-${mode}`,C:encode(words,mode,Array.from({length:N},()=>Math.floor(rand()*Q))),P:words.flat(),trueLengths:words.map(w=>w.length),offset:off,mode};
 }
 function recover(item){const a=pass(item.C.slice(0,S),true),h=pass(item.C,false,true),truthBounds=new Set(),predBounds=new Set();let j=0;
  for(const l of item.trueLengths||[]){j+=l;if(j>S&&j<N)truthBounds.add(j);}
  j=0;for(const w of h.words||[]){j+=w.length;if(j>S&&j<N)predBounds.add(j);}
  const overlap=[...predBounds].filter(x=>truthBounds.has(x)).length;
  return {name:item.name,mode:item.mode,offset:item.offset,fit:a.score/S,holdout:(h.score-a.score)/(N-S),full:h.score/N,fitStats:a,fullStats:{states:h.states,edges:h.edges,updates:h.updates},runeAccuracy:item.P&&h.P?h.P.slice(S).reduce((n,x,i)=>n+(x===item.P[S+i]),0)/(N-S):null,boundaryF1:item.trueLengths&&h.words?2*overlap/Math.max(1,truthBounds.size+predBounds.size):null,fitAccuracy:item.P&&h.P?h.P.slice(0,S).reduce((n,x,i)=>n+(x===item.P[i]),0)/S:null,text:h.text??null,fallback:h.fallback??null,words:h.words??null,finalCursor:h.finalCursor??null};
 }
 const cases=[];for(const name of config.cases||["dev-0-pointer"]){if(name==="original"){const C=gp.pages.slice(0,3).flatMap(p=>p.indices);if(C.length!==N)throw Error("original length");cases.push(recover({name,C,mode:"unknown"}));}else{const [stage,d,mode]=name.split("-");cases.push(recover(control(+d,stage==="fresh",mode)));}}
 return {parameters:{N,S,L,B,EPS,R,lexicon:types.size,trainTypes:counts.size,trainTokens:total,externalTypes:external.size,donorWords:donors.map(x=>x.length)},cases};

}
if(require.main===module){const cases=process.argv.slice(2);console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),{cases:cases.length?cases:undefined}),null,2));}
module.exports={experiment};
