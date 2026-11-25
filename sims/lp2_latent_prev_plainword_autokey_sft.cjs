"use strict";
// Previous-plaintext-word autokey with genuinely latent true boundaries.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),Q=29,T=8,L=24,B=8,N=716,S=249,NEG=-Infinity,EPS=.05,LP=Math.log(Q),WIDTH=config.width||384;
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

 const seedPrior=Math.log(1-EPS),loge=Math.log(EPS);
 function keyEncode(W,seed,mode="feed"){
  let K=seed,h=0;return W.flatMap(w=>{if(mode==="feed")h=0;const c=w.map(x=>x===0?0:mod(x+K[h++%K.length]));if(mode==="feed")K=w;return c;});
 }
 function pass(C,partial,trace=false){
  const M=C.length,states=Array.from({length:M+1},()=>new Map()),D=B+1;
  let part=NEG,firstEdges=0,processed=0,generated=0,maxStates=0,clipped=0,discarded=0,largestLoss=0;
  function put(j,k,b,a,v,prev,seed,o){
   const tag=k+"|"+b,m=states[j],old=m.get(tag);generated++;
   if(!old)m.set(tag,{k,b,a,v,node:trace?{prev,seed,k,o}:null});
   else{old.a=logadd(old.a,a);if(v>old.v){old.v=v;if(trace)old.node={prev,seed,k,o};}}
  }
  function wordEdges(i,key,lexOnly,cb,tailcb){
   function walk(j,h,k,a,b,z){
    const len=j-i;if(len){const w=lex.get(k)??NEG;if(w!==NEG)cb(j,k,w,0);
     if(!lexOnly)cb(j,k,loge+ll[len]+z,1);
     if(partial&&j===M&&len<L){const v=pref.get(k)??NEG;if(v!==NEG)tailcb(v,0);if(!lexOnly)tailcb(loge+tail[len]+z,1);}}
    if(j===M||len===L||(lexOnly&&len&&!pref.has(k)))return;
    const c=C[j],x=mod(c-(key.charCodeAt(h)-65)),next=(h+1)%key.length;
    if(c===0)walk(j+1,h,k+"A",b,0,z+cl(a,b,0));
    if(x)walk(j+1,next,k+String.fromCharCode(65+x),b,x,z+cl(a,b,x));
   }
   walk(i,0,"",-1,-1,0);
  }
  // A finite initial seed-word prior. First body word must be lexical.
  for(const [key,lp] of lex){const s=lp-seedPrior;
   wordEdges(0,key,true,(j,k,w)=>{firstEdges++;put(j,k,0,s+w,s+w,null,key,0);},w=>{part=logadd(part,s+w);});
  }
  for(let i=1;i<M;i++){
   const m=states[i];maxStates=Math.max(maxStates,m.size);let a=[...m.values()];if(a.length>WIDTH){a.sort((x,y)=>y.a-x.a||y.v-x.v||x.k.localeCompare(y.k)||x.b-y.b);const kept=a.slice(0,WIDTH),rest=a.slice(WIDTH);const ka=kept.reduce((n,x)=>logadd(n,x.a),NEG),ra=rest.reduce((n,x)=>logadd(n,x.a),NEG),loss=Math.exp(ra-logadd(ka,ra));largestLoss=Math.max(largestLoss,loss);clipped++;discarded+=rest.length;a=kept;}
   states[i]=null;
   for(const s of a){processed++;const only=s.b===B;
    wordEdges(i,s.k,only,(j,k,w,o)=>{if(s.b+o<=B)put(j,k,s.b+o,s.a+w,s.v+w,s.node,null,o);},(w,o)=>{if(s.b+o<=B)part=logadd(part,s.a+w);});
   }
  }
  const end=[...states[M].values()],complete=end.reduce((a,x)=>logadd(a,x.a),NEG),score=partial?logadd(complete,part):complete;
  const out={score,complete,partial:part,firstEdges,processed,generated,maxStates,clipped,discarded,largestLoss,endStates:end.length};
  if(trace&&end.length){let best=end.reduce((a,b)=>b.v>a.v?b:a),W=[],f=0,seed=null;for(let n=best.node;n;n=n.prev){W.push(Array.from(n.k,c=>c.charCodeAt(0)-65));f+=n.o;if(n.seed!==null)seed=Array.from(n.seed,c=>c.charCodeAt(0)-65);}W.reverse();if(!seed||keyEncode(W,seed).join()!==C.join())throw Error("word-fed replay");Object.assign(out,{W,P:W.flat(),seed,fallback:f,text:W.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")});}
  return out;
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function control(d,fresh,mode){const W=donors[d],start=Math.floor(W.length*(fresh?.94:.85)),R=rng(0x5a270200+(fresh?0x1000:0)+d*67);let ws=null,off=-1,seed=null;
  for(let i=start;i<W.length;i++){let z=[],n=0;for(let j=i;j<W.length&&n<N;j++){z.push(W[j]);n+=W[j].length;}if(n!==N||z.some(w=>w.length>L)||!lex.has(id(W[i-1]))||!lex.has(id(z[0])))continue;ws=z;off=i;seed=W[i-1];break;}
  if(!ws)throw Error("no exact control window "+d);
  const K=mode==="feed"?seed:Array.from({length:mode==="pad"?N:8},()=>Math.floor(R()*Q)),P=ws.flat(),lengths=ws.map(w=>w.length),printed=lengths.slice(),R2=rng(0xdec02703+d+(fresh?30:0));
  for(let j=printed.length-1;j>0;j--){const i=Math.floor(R2()*(j+1));[printed[i],printed[j]]=[printed[j],printed[i]];}
  return {name:`${fresh?"fresh":"dev"}-${d}-${mode}`,C:keyEncode(ws,K,mode),P,seed:mode==="feed"?seed:null,lengths,printed,offset:off,mode,oov:ws.filter(w=>!lex.has(id(w))).length};
 }
 function recover(x){const pre=pass(x.C.slice(0,S),true),full=pass(x.C,false,true),truth=new Set(),pred=new Set();let i=0;for(const l of x.lengths||[]){i+=l;if(i>S&&i<N)truth.add(i);}i=0;for(const w of full.W||[]){i+=w.length;if(i>S&&i<N)pred.add(i);}const overlap=[...pred].filter(k=>truth.has(k)).length;
  const acc=x.P&&full.P?full.P.slice(S).reduce((n,k,j)=>n+(k===x.P[S+j]),0)/(N-S):null;
  return {name:x.name,mode:x.mode,offset:x.offset,truthSeed:x.seed??null,oov:x.oov,fit:pre.score/S,holdout:(full.score-pre.score)/(N-S),full:full.score/N,accuracy:acc,boundaryF1:x.lengths&&full.W?2*overlap/Math.max(1,truth.size+pred.size):null,fitAccuracy:x.P&&full.P?full.P.slice(0,S).reduce((n,k,j)=>n+(k===x.P[j]),0)/S:null,seed:full.seed??null,firstWordCorrect:x.P&&full.W?full.W[0].length===x.lengths[0]&&full.W[0].every((p,i)=>p===x.P[i]):null,stats:{prefix:{...pre},full:{...full,W:undefined,P:undefined,text:undefined,seed:undefined}},words:full.W??null,text:full.text??null,printed:x.printed??null};
 }
 const cases=[];
 for(const name of config.cases||["dev-0-feed"]){
  if(name==="original"){const C=gp.pages.find(x=>x.page===0).indices.slice(13).concat(...[1,2].map(p=>gp.pages.find(x=>x.page===p).indices));if(C.length!==N)throw Error("original length "+C.length);cases.push(recover({name,C,mode:"unknown"}));}
  else{const [stage,d,mode]=name.split("-");cases.push(recover(control(+d,stage==="fresh",mode)));}
 }
 return {parameters:{N,S,L,B,EPS,WIDTH,lexicon:types.size,trainTypes:counts.size,trainTokens:total,externalTypes:external.size},cases};

}
if(require.main===module){const cases=process.argv.slice(2);console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),{cases:cases.length?cases:undefined}),null,2));}
module.exports={experiment};
