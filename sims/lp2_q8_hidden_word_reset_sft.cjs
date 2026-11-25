"use strict";
// Director #2702: word-reset q8 with hidden segmentation.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),Q=29,T=8,L=24,B=4,N=299,S=223,NEG=-Infinity,EPS=.05,LP=Math.log(Q),W4=config.width4||8192,WK=config.widthKey||512;
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
 const short=[],long=[];
 for(const [k,v] of lex){const w=Array.from(k,c=>c.charCodeAt(0)-65),a=[],f=[];w.forEach((x,i)=>(x===0?f:a).push(i));if(!a.length)continue;const z={w,a,f,d:Math.min(T,a.length),gain:Math.max(0,v+w.length*LP)};(a.length<=4?short:long).push(z);}
 const powers=Array.from({length:9},(_,i)=>Q**i),pack=k=>k.reduce((a,b)=>a*Q+b,0),unpack=(x,n)=>{const a=Array(n);for(let j=n-1;j>=0;j--){a[j]=x%Q;x=Math.floor(x/Q)}return a};
 function propose(C,truth){
  const sums=Array.from({length:5},(_,d)=>new Float64Array(powers[d])),local=Array.from({length:5},(_,d)=>new Map());
  for(let i=0;i<C.length;i++){
   for(const z of short){const {w,a,f,d,gain}=z;if(!gain||i+w.length>C.length||f.some(j=>C[i+j]!==0))continue;let k=0;for(const j of a)k=k*Q+mod(C[i+j]-w[j]);const m=local[d];if(gain>(m.get(k)||0))m.set(k,gain);}
   for(let d=1;d<=4;d++){for(const [k,v] of local[d])sums[d][k]+=v;local[d].clear();}
  }
  const shortScore=k=>.15*sums[1][Math.floor(k/powers[3])]+.35*sums[2][Math.floor(k/powers[2])]+sums[3][Math.floor(k/Q)]+sums[4][k];
  const rank4=Array.from({length:powers[4]},(_,k)=>({k,s:shortScore(k)})).sort((a,b)=>b.s-a.s||a.k-b.k);
  const allow=new Uint8Array(powers[4]);for(let j=0;j<W4;j++)allow[rank4[j].k]=1;
  const sumsL=Array.from({length:9},()=>new Map()),locL=Array.from({length:9},()=>new Map()),key=Array(T);let tested=0,accepted=0;
  for(let i=0;i<C.length;i++){
   for(const z of long){const {w,a,f,d,gain}=z;if(i+w.length>C.length||f.some(j=>C[i+j]!==0))continue;let k=0;
    for(let j=0;j<4;j++){const t=a[j];key[j]=mod(C[i+t]-w[t]);k=k*Q+key[j];}tested++;if(!allow[k])continue;
    let ok=true;for(let j=4;j<a.length;j++){const t=a[j],v=mod(C[i+t]-w[t]);if(j<T){key[j]=v;k=k*Q+v;}else if(v!==key[j%T]){ok=false;break;}}if(!ok)continue;
    accepted++;const m=locL[d];if(!m.has(k)||gain>m.get(k))m.set(k,gain);
   }
   for(let d=5;d<=8;d++){for(const [k,v] of locL[d])sumsL[d].set(k,(sumsL[d].get(k)||0)+v);locL[d].clear();}
  }
  const fullScore=k=>shortScore(Math.floor(k/powers[4]))+[5,6,7,8].reduce((n,d)=>n+(sumsL[d].get(Math.floor(k/powers[8-d]))||0),0);
  const ranked=[...sumsL[8].keys()].map(k=>({k,s:fullScore(k)})).sort((a,b)=>b.s-a.s||a.k-b.k);
  return {keys:ranked.slice(0,WK).map(z=>unpack(z.k,8)),stats:{prefix4:W4,truthPrefix4Rank:truth?rank4.findIndex(z=>z.k===pack(truth.slice(0,4)))+1:null,tested,accepted,fullKeys:ranked.length,truthFullRank:truth?ranked.findIndex(z=>z.k===pack(truth))+1:null,bestEvidence:ranked.slice(0,4).map(z=>({key:unpack(z.k,8),score:z.s}))}};
 }
 function encode(W,K,mode="reset"){let h=0;return W.flatMap(w=>{if(mode==="reset")h=0;return w.map(x=>x===0?0:mod(x+K[h++%K.length]));});}
 function pass(C,K,partial,trace=false){
  const M=C.length,D=B+1,A=new Float64Array((M+1)*D).fill(NEG),V=new Float64Array(A.length).fill(NEG),parent=trace?Array(A.length):null;A[0]=V[0]=0;let part=NEG;
  const loge=Math.log(EPS);
  for(let i=0;i<M;i++){
   const at=i*D;if(!A.subarray(at,at+D).some(Number.isFinite))continue;
   function complete(j,k,w,o){
    if(!Number.isFinite(w))return;
    for(let b=0;b+o<=B;b++){const q=at+b;if(A[q]===NEG)continue;const to=j*D+b+o;A[to]=logadd(A[to],A[q]+w);const v=V[q]+w;if(v>V[to]){V[to]=v;if(parent)parent[to]={q,k,o};}}
   }
   function endPartial(k,w,o){if(!Number.isFinite(w))return;for(let b=0;b+o<=B;b++)if(A[at+b]!==NEG)part=logadd(part,A[at+b]+w);}
   function walk(j,h,k,a,b,v){
    const len=j-i;
    if(len){complete(j,k,lex.get(k)??NEG,0);complete(j,k,loge+ll[len]+v,1);
     if(partial&&j===M&&len<L){endPartial(k,pref.get(k)??NEG,0);endPartial(k,loge+tail[len]+v,1);}}
    if(j===M||len===L)return;const c=C[j],x=mod(c-K[h]);
    if(c===0)walk(j+1,h,k+"A",b,0,v+cl(a,b,0));
    if(x)walk(j+1,(h+1)%T,k+String.fromCharCode(65+x),b,x,v+cl(a,b,x));
   }
   walk(i,0,"",-1,-1,0);
  }
  const complete=A.slice(M*D).reduce(logadd,NEG),score=partial?logadd(complete,part):complete,out={score,complete,partial:part};
  if(trace&&complete!==NEG){let to=M*D;for(let b=1;b<=B;b++)if(V[M*D+b]>V[to])to=M*D+b;
   const W=[],fallback=[];while(to){const p=parent[to];if(!p)throw Error("trace");W.push(Array.from(p.k,x=>x.charCodeAt(0)-65));fallback.push(p.o);to=p.q;}W.reverse();fallback.reverse();
   if(encode(W,K).join()!==C.join())throw Error("replay");
   Object.assign(out,{words:W,P:W.flat(),text:W.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),fallback:fallback.reduce((a,b)=>a+b,0)});
  }
  return out;
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function shuffled(a,R){a=a.slice();for(let j=a.length-1;j>0;j--){const i=Math.floor(R()*(j+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function control(d,fresh,mode){const W=donors[d],start=Math.floor(W.length*(fresh?.90:.82)),R=rng(0x27020000+(fresh?0x100:0)+d*13);let words=null,off=-1,anchors=0;
  for(let i=start;i<W.length;i++){let z=[],n=0;for(let j=i;j<W.length&&n<N;j++){z.push(W[j]);n+=W[j].length;}if(n!==N||z.some(w=>w.length>L))continue;let j=0,a=0;for(const w of z){j+=w.length;if(j<=S&&w.filter(x=>x!==0).length>=8&&lex.has(id(w)))a++;}if(a<2)continue;words=z;off=i;anchors=a;break;}
  if(!words)throw Error("no control window "+d);
  const K=Array.from({length:T},()=>Math.floor(R()*Q)),P=words.flat(),truthLengths=words.map(w=>w.length),printed=shuffled(truthLengths,rng(0xdec02702+d+(fresh?30:0)));
  const C=mode==="pad"?encode(words,Array.from({length:N},()=>Math.floor(R()*Q)),"continuous"):encode(words,K,mode);
  return {name:`${fresh?"fresh":"dev"}-${d}-${mode}`,C,P,K:mode==="reset"?K:null,trueLengths:truthLengths,printed,offset:off,anchors,mode};
 }
 function recover(item){const a=item.C.slice(0,S),proposal=propose(a,item.K),scored=proposal.keys.map(K=>({K,fit:pass(a,K,true).score})).sort((x,y)=>y.fit-x.fit||pack(x.K)-pack(y.K)),best=scored[0];
  if(!best||!Number.isFinite(best.fit))return {name:item.name,mode:item.mode,...proposal.stats,truth:item.K,offset:item.offset,anchors:item.anchors,result:null};
  const h=pass(item.C,best.K,false,true),truthBounds=new Set(),predBounds=new Set();let j=0;
  for(const l of item.trueLengths||[]){j+=l;if(j>S&&j<N)truthBounds.add(j);}
  j=0;for(const w of h.words||[]){j+=w.length;if(j>S&&j<N)predBounds.add(j);}
  const overlap=[...predBounds].filter(x=>truthBounds.has(x)).length;
  return {name:item.name,mode:item.mode,offset:item.offset,anchors:item.anchors,truth:item.K,...proposal.stats,finite:scored.filter(x=>Number.isFinite(x.fit)).length,truthFitRank:item.K?scored.findIndex(x=>x.K.join()===item.K.join())+1:null,top:scored.slice(0,3).map(x=>({key:x.K,fit:x.fit/S})),result:{key:best.K,keyExact:item.K?best.K.join()===item.K.join():null,fit:best.fit/S,holdout:(h.score-best.fit)/(N-S),full:h.score/N,runeAccuracy:item.P&&h.P?h.P.slice(S).reduce((n,x,i)=>n+(x===item.P[S+i]),0)/(N-S):null,boundaryF1:item.trueLengths&&h.words?2*overlap/Math.max(1,truthBounds.size+predBounds.size):null,fitAccuracy:item.P&&h.P?h.P.slice(0,S).reduce((n,x,i)=>n+(x===item.P[i]),0)/S:null,text:h.text??null,fallback:h.fallback??null,words:h.words??null,printed:item.printed??null}};
 }
 const cases=[];
 for(const name of config.cases||["dev-0-reset"]){
  if(name==="original"){const C=gp.pages.find(x=>x.page===54).indices.slice(9).concat(gp.pages.find(x=>x.page===55).indices);if(C.length!==N)throw Error("original length");cases.push(recover({name,C,mode:"unknown"}));}
  else{const [stage,d,mode]=name.split("-");cases.push(recover(control(+d,stage==="fresh",mode)));}
 }
 return {parameters:{N,S,L,B,EPS,W4,WK,lexicon:types.size,trainTypes:counts.size,trainTokens:total,externalTypes:external.size,donorWords:donors.map(x=>x.length),short:short.length,long:long.length},cases};
}
if(require.main===module){const cases=process.argv.slice(2);console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),{cases:cases.length?cases:undefined}),null,2));}
module.exports={experiment};
