"use strict";
// Director #2683. Public LP2 puzzle only. One continuous q8 additive literal-F model.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,config={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),Q=29,T=8,L=24,EPS=.05,NEG=-Infinity;
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x)),mod=x=>(x+Q)%Q;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function nativeWords(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){const o=[];for(let j=0;j<w.length;){let q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native");o.push(q.i);j+=q.t.length;}a.push(o)}return a}
 function runeWords(t,separator){let out=[],word=[],before="";for(const x of t){if(ix.has(x)){if(word.length&&separator.test(before)){out.push(word);word=[];}word.push(ix.get(x));before="";}else before+=x;}if(word.length)out.push(word);return out}
 const p57=gold.sections.find(x=>x.name==="p57_parable").source_text;
 if(nativeWords("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").flat().join()!==extract(p57).join())throw Error("p57 spelling");
 const donors=raw.slice(4).map(nativeWords);if(donors.map(x=>x.flat().length).join()!=="62492,217106,321327")throw Error("native sizes");
 const training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 const authenticNames=["0_welcome","jpg107-167"];
 for(const s of gold.sections)if(!authenticNames.includes(s.name))training.push(runeWords(s.source_text,/[^\u16a0-\u16ff]/u));
 const wordId=w=>String.fromCharCode(...w.map(x=>65+x));
 const counts=new Map(),lengths=new Float64Array(L+1).fill(.5);let total=0;
 function train(arrays,wordReset){
  const u=new Float64Array(Q),b=new Float64Array(Q*Q),t=new Float64Array(Q*Q*Q);
  let n=0;
  for(const words of arrays){let a=-1,d=-1;for(const w of words){if(wordReset){a=-1;d=-1;}for(const x of w){u[x]++;n++;if(d>=0)b[d*Q+x]++;if(a>=0)t[(a*Q+d)*Q+x]++;a=d;d=x;}}}
  const lp1=Float64Array.from(u,x=>Math.log((x+.5)/(n+.5*Q))),lp2=new Float64Array(Q*Q),lp3=new Float64Array(Q*Q*Q);
  for(let j=0;j<Q;j++){let s=0;for(let x=0;x<Q;x++)s+=b[j*Q+x];for(let x=0;x<Q;x++)lp2[j*Q+x]=Math.log((b[j*Q+x]+8*Math.exp(lp1[x]))/(s+8));}
  for(let j=0;j<Q*Q;j++){let s=0;for(let x=0;x<Q;x++)s+=t[j*Q+x];for(let x=0;x<Q;x++)lp3[j*Q+x]=Math.log((t[j*Q+x]+8*Math.exp(lp2[(j%Q)*Q+x]))/(s+8));}
  return {lp1,lp2,lp3};
 }
 for(const words of training)for(const w of words)if(w.length&&w.length<=L){const id=wordId(w);counts.set(id,(counts.get(id)||0)+1);lengths[w.length]++;total++;}
 const lengthTotal=lengths.slice(1).reduce((a,b)=>a+b,0),lenLog=Array.from(lengths,x=>Math.log(x/lengthTotal));
 const wordLM=train(training,true),seqLM=train(training,false),f=Array.from(seqLM.lp1,Math.exp);
 const charLog=(lm,a,b,x)=>a<0?(b<0?lm.lp1[x]:lm.lp2[b*Q+x]):lm.lp3[(a*Q+b)*Q+x];
 const logadd=(a,b)=>a===NEG?b:b===NEG?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 const vocabLog=new Map([...counts].map(([id,n])=>[id,Math.log((1-EPS)*n/total)]));
 const wlog=(id,len,cl)=>logadd(vocabLog.get(id)??NEG,Math.log(EPS)+lenLog[len]+cl);
 const anchors=[];
 for(const [id,n] of counts){const w=Array.from(id,x=>x.charCodeAt(0)-65),fpos=[],active=[];w.forEach((x,i)=>(x===0?fpos:active).push(i));if(active.length>=9)anchors.push({w,n,fpos,active});}
 anchors.sort((a,b)=>b.active.length-a.active.length||b.n-a.n);
 function pack(k){let a=0;for(const x of k)a=a*Q+x;return a;}
 function canonical(k){let best=Infinity;for(let j=0;j<T;j++)best=Math.min(best,pack(k.slice(j).concat(k.slice(0,j))));return best;}
 function unpack(a){const k=Array(T);for(let j=T-1;j>=0;j--){k[j]=a%Q;a=Math.floor(a/Q)}return k;}
 function propose(C){
  const map=new Map(),K=Array(T);
  for(let i=0;i<C.length;i++)for(const {w,n,fpos,active} of anchors){
   if(i+w.length>C.length)continue;
   const p=active[0],q=active[T];if(mod(C[i+p]-w[p])!==mod(C[i+q]-w[q]))continue;
   if(fpos.some(j=>C[i+j]!==0))continue;
   for(let j=0;j<T;j++){const t=active[j];K[j]=mod(C[i+t]-w[t]);}
   let ok=true;for(let j=T+1;j<active.length;j++){const t=active[j];if(mod(C[i+t]-w[t])!==K[j%T]){ok=false;break;}}if(!ok)continue;
   const key=canonical(K),z=map.get(key);
   if(!z){map.set(key,{key,votes:1,last:i+w.length,longest:active.length,frequency:n});}
   else{if(i>=z.last){z.votes++;z.last=i+w.length;}z.longest=Math.max(z.longest,active.length);z.frequency=Math.max(z.frequency,n);}
  }
  const ranked=[...map.values()].sort((a,b)=>b.votes-a.votes||b.longest-a.longest||b.frequency-a.frequency||a.key-b.key);
  return {count:ranked.length,top:ranked.slice(0,256),multi:ranked.filter(x=>x.votes>=2).length};
 }
 function unigram(C,key){let p=new Float64Array(T),n=new Float64Array(T),score=0;p[0]=1;
  for(const c of C){n.fill(0);for(let h=0;h<T;h++){if(c===0)n[h]+=p[h]*f[0];const x=mod(c-key[h]);if(x)n[(h+1)%T]+=p[h]*f[x];}const z=n.reduce((a,b)=>a+b,0);if(!z)return NEG;score+=Math.log(z);for(let h=0;h<T;h++)n[h]/=z;[p,n]=[n,p];}return score;
 }
 // Enumerate every feasible plaintext word for a fixed start and phase. A word
 // may be a dictionary token or a native character-Markov backoff sequence.
 function edges(C,i,h,key,max,cb){function walk(j,phase,id,a,b,cl){
  if(j>i)cb(j,phase,id,wlog(id,j-i,cl));if(j===i+max||j===C.length)return;
  const c=C[j],x=mod(c-key[phase]);
  if(c===0)walk(j+1,phase,id+"A",b,0,cl+charLog(wordLM,a,b,0));
  if(x)walk(j+1,(phase+1)%T,id+String.fromCharCode(65+x),b,x,cl+charLog(wordLM,a,b,x));
 }walk(i,h,"",-1,-1,0);}
 function wordPass(C,key,groups=null,initial=null,trace=false){
  const N=C.length,A=new Float64Array((N+1)*T).fill(NEG),V=new Float64Array(A.length).fill(NEG),parent=trace?Array(A.length):null;
  if(initial){A.set(initial);V.set(initial);}else A[0]=V[0]=0;
  const starts=groups?(()=>{let i=0;const a=[];for(const n of groups){a.push([i,n]);i+=n;}if(i!==N)throw Error("group length");return a})():Array.from({length:N},(_,i)=>[i,Math.min(L,N-i)]);
  for(const [i,max] of starts){if(max>L)throw Error("long source word");for(let h=0;h<T;h++){const at=i*T+h;if(A[at]===NEG)continue;
   edges(C,i,h,key,max,(j,phase,id,w)=>{if(groups&&j!==i+max)return;const b=j*T+phase;A[b]=logadd(A[b],A[at]+w);if(V[at]+w>V[b]){V[b]=V[at]+w;if(parent)parent[b]={at,id};}});
  }}
  const end=Array.from(A.slice(N*T)),ll=end.reduce(logadd,NEG);
  if(ll===NEG)return {ll,end:null};
  const out={ll,end:end.map(x=>x-ll)};
  if(trace){let b=N*T;for(let h=1;h<T;h++)if(V[N*T+h]>V[b])b=N*T+h;let final=b%T;const words=[];while(b>=T){const p=parent[b];if(!p)throw Error("word trace");words.push(Array.from(p.id,x=>x.charCodeAt(0)-65));b=p.at;}words.reverse();out.words=words;out.P=words.flat();out.initialPhase=b;out.endPhase=final;out.viterbi=Math.max(...V.slice(N*T));if(encode(out.P,key,b).join()!==C.join())throw Error("word replay");}
  return out;
 }
 function seqPass(C,key,initial=null,trace=false){
  let states=initial?new Map(initial.map(x=>[x.id,{...x,v:x.ll,node:null}])):new Map([[0,{id:0,h:0,a:-1,b:-1,ll:0,v:0,node:null}]]);
  for(const c of C){const next=new Map();
   for(const s of states.values()){
    function add(h,x){const ll=charLog(seqLM,s.a,s.b,x),id=(h*30+s.b+1)*30+x+1,z=next.get(id),v=s.v+ll,a=s.ll+ll;
     if(!z)next.set(id,{id,h,a:s.b,b:x,ll:a,v,node:trace?{p:x,prev:s.node,start:s.node?null:s.h}:null});
     else{z.ll=logadd(z.ll,a);if(v>z.v){z.v=v;if(trace)z.node={p:x,prev:s.node,start:s.node?null:s.h};}}
    }
    if(c===0)add(s.h,0);const x=mod(c-key[s.h]);if(x)add((s.h+1)%T,x);
   }
   states=next;
  }
  const ll=[...states.values()].reduce((a,b)=>logadd(a,b.ll),NEG);if(ll===NEG)return {ll,end:null};
  const end=[...states.values()].map(({id,h,a,b,ll:z})=>({id,h,a,b,ll:z-ll})),out={ll,end};
  if(trace){let best=null;for(const s of states.values())if(!best||s.v>best.v)best=s;const P=[];let h=0;for(let n=best.node;n;n=n.prev){P.push(n.p);if(n.start!==null)h=n.start;}P.reverse();if(encode(P,key,h).join()!==C.join())throw Error("seq replay");out.P=P;out.initialPhase=h;out.endPhase=best.h;out.viterbi=best.v;}
  return out;
 }
 function encode(P,K,phase=0){return P.map(x=>x===0?0:mod(x+K[phase++%K.length]));}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function shuffle(a,R){a=a.slice();for(let j=a.length-1;j>0;j--){const i=Math.floor(R()*(j+1));[a[i],a[j]]=[a[j],a[i]];}return a}
 const source=runeWords(raw[1],/[-.]/u),flat=source.flat(),target=gp.pages.filter(x=>x.page>=33&&x.page<=39).flatMap(x=>x.indices),start=gp.pages.filter(x=>x.page<33).reduce((s,x)=>s+x.indices.length,0);
 if(target.length!==1680||flat.slice(start,start+1680).join()!==target.join())throw Error("original source");
 let cursor=0,inventory=[];for(const w of source){const end=cursor+w.length;if(cursor<start+1680&&end>start)inventory.push(Math.min(end,start+1680)-Math.max(cursor,start));cursor=end;}
 if(inventory.reduce((a,b)=>a+b,0)!==1680||Math.max(...inventory)>L)throw Error("original inventory");
 function window(words,off,N){let a=[],n=0;for(let i=off;i<words.length;i++){const w=words[i];if(n+w.length>N)break;a.push(w);n+=w.length;}if(n<N-24)throw Error("window");return a;}
 function control(d,k,mode,actual=false){
  const W=donors[d],off=Math.floor(W.length*.84)+k*1100,R=rng(0x26830000+k*100+d),K=Array.from({length:T},()=>Math.floor(R()*Q));let words=window(W,off,1680);
  if(actual){let j=off;for(;j<off+100;j++){words=window(W,j,1680);if(words.flat().length===1680)break;}if(words.flat().length!==1680)throw Error("exact native window");}
  const originalLengths=words.map(w=>w.length);
  if(mode==="shuffle"){
   if(actual){const pool=Array.from({length:L+1},()=>[]);for(const w of W.slice(off+1200,off+6000))if(w.length<=L)pool[w.length].push(w);words=inventory.map(n=>{const a=pool[n];if(!a.length)throw Error("inventory donor length "+n);return a[Math.floor(R()*a.length)]});}
   words=shuffle(words,R);
  }
  const P=words.flat(),C=encode(P,K),printed=mode==="shuffle"?words.map(w=>w.length):shuffle(actual?inventory:originalLengths,R);
  return {name:"donor"+d+"-pair"+k+"-"+mode+(actual?"-actual":""),P,C,printed,K,mode};
 }
 const welcome=gold.sections.find(x=>x.name===authenticNames[0]),koan=gold.sections.find(x=>x.name===authenticNames[1]),wk=[23,10,1,10,9,10,16,26],kk=[0,10,4,0,1,19,0,18,4,18,9,0,18];
 const wC=extract(raw[2].split("%").slice(1,3).join("%")),kC=extract(raw[2].split("$")[5]);
 if(encode(extract(welcome.source_text),wk).join()!==wC.join()||encode(extract(koan.source_text),kk).join()!==kC.join())throw Error("authentic replay");
 const wWords=runeWords(welcome.source_text,/[^\u16a0-\u16ff]/u),kWords=runeWords(koan.source_text,/[^\u16a0-\u16ff]/u);
 function recover(item){
  const {C,printed,P,K}=item;let split=0,num=0;while(num<printed.length-1&&split+printed[num]<=Math.floor(C.length*.65))split+=printed[num++];
  const a=C.slice(0,split),b=C.slice(split),left=printed.slice(0,num),right=printed.slice(num),proposed=propose(a);
  const rank=[];
  for(const z of proposed.top){const key=unpack(z.key);for(let ph=0;ph<T;ph++){const k=key.slice(ph).concat(key.slice(0,ph));rank.push({key:k,score:unigram(a,k),votes:z.votes});}}
  rank.sort((a,b)=>b.score-a.score||pack(a.key)-pack(b.key));
  const pool=rank.filter(x=>Number.isFinite(x.score)).slice(0,12);
  const methods=[["shuffle",(c,k,g,i,t)=>wordPass(c,k,g,i,t)],["decoy",(c,k,g,i,t)=>wordPass(c,k,null,i,t)],["spacingfree",(c,k,g,i,t)=>seqPass(c,k,i,t)]];
  const results={};
  for(const [name,pass] of methods){const score=pool.map(x=>({key:x.key,fit:pass(a,x.key,left,null,false)})).sort((x,y)=>y.fit.ll-x.fit.ll);const win=score[0];if(!win||!win.fit.end){results[name]=null;continue;}
   const h=pass(b,win.key,right,win.fit.end,true),pre=pass(a,win.key,left,null,true);
   if(!h.P||!pre.P){results[name]=null;continue;}
   const held=h.P,accuracy=P?held.reduce((n,x,i)=>n+(x===P[split+i]),0)/held.length:null,keyExact=K?win.key.join()===K.join():null;
   results[name]={key:win.key,keyExact,train:win.fit.ll/split,heldout:h.ll/b.length,heldoutAccuracy:accuracy,fitAccuracy:P?pre.P.reduce((n,x,i)=>n+(x===P[i]),0)/split:null,heldoutPhase:h.initialPhase,holdEndPhase:h.endPhase,heldoutText:h.words?h.words.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "):held.map(x=>gp.translit[x]).join(""),heldoutRunes:held,fitRunes:pre.P,fitPhase:pre.initialPhase};
  }
  // A common key selected by the free segmentation model; compare probabilities
  // of the printed segmentation versus all segmentations of the heldout tape.
  // Unconditional token probabilities share units; the free sum contains every
  // fixed-group path. This gap is not a cross-model calibrated Bayes factor.
  let gap=null;
  if(results.decoy){const k=results.decoy.key,u=wordPass(a,k,null,null,false),v=wordPass(a,k,left,null,false),d=wordPass(b,k,null,u.end,false),s=wordPass(b,k,right,u.end,false);gap=(d.ll-s.ll)/b.length;}
  return {name:item.name,mode:item.mode,N:C.length,split,groups:printed.length,truth:K??null,proposals:proposed.count,multi:proposed.multi,topVotes:proposed.top.slice(0,5).map(x=>({key:unpack(x.key),votes:x.votes,longest:x.longest})),truthProposal:K?proposed.top.findIndex(x=>x.key===canonical(K))+1:null,truthUnigramRank:K?rank.findIndex(x=>x.key.join()===K.join())+1:null,gap,results};
 }
 const cases=[];
 for(const name of config.cases||["welcome","koan-shuffle","koan-decoy","dev-shuffle","dev-decoy"]){
  let item;
  if(name==="welcome")item={name,mode:"native",C:wC,P:extract(welcome.source_text),printed:wWords.map(w=>w.length),K:wk};
  else if(name==="koan-shuffle"||name==="koan-decoy"){const R=rng(0x2683),K=Array.from({length:T},()=>Math.floor(R()*Q)),words=name.endsWith("shuffle")?shuffle(kWords,R):kWords;const P=words.flat();item={name,mode:name.split("-")[1],P,C:encode(P,K),K,printed:name.endsWith("shuffle")?words.map(w=>w.length):shuffle(kWords.map(w=>w.length),R)};}
  else if(name==="original")item={name,C:target,printed:inventory,mode:"unknown"};
  else{const [tag,mode]=name.split("-");const i=tag==="dev"?0:Number(tag.replace("fresh",""));item=control(i%3,i,mode,tag==="fresh3");item.name=name;}
  cases.push(recover(item));
 }
 return {training:{types:counts.size,tokens:total,anchors:anchors.length,EPS,maxLength:L},authentic:{welcome:wC.length,koan:kC.length},inventory:inventory.reduce((a,n)=>(a[n]=(a[n]||0)+1,a),{}),cases};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),args.length?{cases:args}:{}),null,2));}
module.exports={experiment};
