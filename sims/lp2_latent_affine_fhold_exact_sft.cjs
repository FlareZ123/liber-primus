"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function witness(C,E,K,lens,cap,vocab,gp,sig,key,mod,inverse,encode,assert){
 const N=C.length,INF=30000,W=N+1,mask=(1<<cap)-1;
 let prev=new Int16Array(W),cur=new Int16Array(W);prev.fill(INF);prev[0]=0;
 const dq=new Int32Array(W),choices=new Uint8Array((K+1)*W);
 for(let k=1;k<=K;k++){
  cur.fill(INF);let head=0,tail=0;
  for(let i=k;i<=Math.min(N,k*cap);i++){
   const j=i-1;while(tail>head&&prev[dq[tail-1]]>=prev[j])tail--;
   dq[tail++]=j;while(tail>head&&dq[head]<i-cap)head++;
   let v=tail>head?Math.min(INF,prev[dq[head]]+1):INF,choice=v<INF?32+i-dq[head]:0,b=E.ends[i]&mask;
   while(b){const low=b&-b,l=32-Math.clz32(low),z=prev[i-l];if(z<INF&&z<=v){v=z;choice=l;}b^=low;if(v===0)break;}
   cur[i]=v;choices[k*W+i]=choice;
  }[prev,cur]=[cur,prev]
 }
 assert(prev[N]<INF,"no count witness");const cost=prev[N],segments=[];
 let i=N;for(let k=K;k>=1;k--){const z=choices[k*W+i],len=z&31;assert(len>0,"bad trace");segments.push({offset:i-len,len,oov:z>=32});i-=len}assert(i===0,"trace start");segments.reverse();
 const O=new Map(),H=new Map();
 function add(m,k,w){let a=m.get(k);if(!a)m.set(k,a=[]);a.push(w)}
 for(const s of vocab){const p=Array.from(s,c=>c.charCodeAt(0)-65),l=p.length;add(O,l+"|"+sig(p,0,l),s);let m=0;for(let j=0;j<l;j++)if(p[j]===0)m|=1<<j;add(H,l+"|"+m+"|"+sig(p,0,l,m),s)}
 let log10=0,ambiguous=0,totalOov=0,held=0;
 const hist=Array(25).fill(0),targetHist=Array(25).fill(0),candidateHist={};for(const l of lens)targetHist[l]++;
 for(const z of segments){const c=C.slice(z.offset,z.offset+z.len),options=new Map(),l=c.length;hist[l]++;
  for(const s of O.get(l+"|"+sig(c,0,l))||[])options.set(s,0);
  let zero=0;for(let j=0;j<l;j++)if(c[j]===0)zero|=1<<j;
  for(let m=zero;;m=(m-1)&zero){for(const s of H.get(l+"|"+m+"|"+sig(c,0,l,m))||[])if(!options.has(s))options.set(s,1);if(m===0)break}
  assert(z.oov===(options.size===0),"trace OOV mismatch");
  let p,a=1,b=0,hold=false;
  if(z.oov){p=c;totalOov++;}else{
   const s=Array.from(options.keys()).sort()[0];p=Array.from(s,x=>x.charCodeAt(0)-65);hold=!!options.get(s);
   let j=0;while(j<l&&hold&&p[j]===0)j++;
   if(j<l){let k=j+1;while(k<l&&(p[k]===p[j]||hold&&p[k]===0))k++;if(k<l)a=mod((c[k]-c[j])*inverse[mod(p[k]-p[j])]);b=mod(c[j]-a*p[j]);}
   assert(a!==0,"bad affine key");
   log10+=Math.log10(options.size);if(options.size>1)ambiguous++;candidateHist[options.size]=(candidateHist[options.size]||0)+1;
  }
  if(hold)held+=p.filter(x=>x===0).length;
  assert(encode(p,a,b,hold).join(",")===c.join(","),"replay mismatch");
  Object.assign(z,{p,a,b,hold,candidates:options.size});
 }
 assert(totalOov===cost,"trace cost");
 return {cost,groups:K,runes:N,hist,targetHist,changedLengthSlots:targetHist.reduce((s,v,l)=>s+Math.max(0,v-hist[l]),0),ambiguousLexicalGroups:ambiguous,log10DistinctPlaintexts:log10,heldFInWitness:held,candidateHist,example:segments.slice(0,25).map(z=>z.p.map(x=>gp.translit[x]).join("")).join(" "),segments};
}
function slopeAnalysis(tape,words,gp,vocab,donors,sig,key,mod,inverse,encode,assert,rand,exact,options){
 const started=Date.now(),ALL=(1<<29)-2,CAP=24,M=4096;
 function delta(x,off,l,m=0){let base=-1;for(let i=0;i<l;i++)if(!(m&(1<<i))){const v=x[off+i];if(base<0)base=v;else if(v!==base)return mod(v-base)}return 0}
 function make(v){const ordinary=Array.from({length:25},()=>new Map()),hold=Array.from({length:25},()=>new Map());for(const s of v){const p=Array.from(s,c=>c.charCodeAt(0)-65),l=p.length,ss=sig(p,0,l),d=delta(p,0,l);ordinary[l].set(ss,(ordinary[l].get(ss)||0)|(1<<d));let m=0;for(let i=0;i<l;i++)if(p[i]===0)m|=1<<i;let group=hold[l].get(m);if(!group)hold[l].set(m,group=new Map());const hs=sig(p,0,l,m),hd=delta(p,0,l,m);group.set(hs,(group.get(hs)||0)|(1<<hd))}return {ordinary,hold}}
 const conv=Array.from({length:29},(_,d)=>Array.from({length:29},(_,p)=>d&&p?1<<mod(d*inverse[p]):0));
 function translate(mask,d){if(!mask)return 0;if(d===0)return mask&1?ALL:0;let result=0;for(let x=mask&~1;x;){const bit=x&-x,p=31-Math.clz32(bit);result|=conv[d][p];x^=bit}return result}
 function scan(C,idx,cap){const N=C.length,E=Array.from({length:29},()=>new Uint32Array(N+1));let unionCounts=Array(25).fill(0);
 for(let i=0;i<N;i++){let zero=0;for(let l=1;l<=cap&&i+l<=N;l++){if(C[i+l-1]===0)zero|=1<<(l-1);
 const mask=idx.ordinary[l].get(sig(C,i,l))||0;let a=translate(mask,delta(C,i,l));
 if(a!==ALL)for(let m=zero;;m=(m-1)&zero){const g=idx.hold[l].get(m);if(g){const pm=g.get(sig(C,i,l,m))||0;a|=translate(pm,delta(C,i,l,m));if(a===ALL)break}if(m===0)break}
 if(a){unionCounts[l]++;const bit=1<<(l-1);for(let x=a;x;){const lo=x&-x,j=31-Math.clz32(lo);E[j][i+l]|=bit;x^=lo;}}
 }}return{E,unionCounts}}
 function optimum(ends,lambda,cap=CAP){const N=ends.length-1,dp=new Float64Array(N+1),counts=new Int32Array(N+1),dq=new Int32Array(N+1);let head=0,tail=0;
 for(let i=1;i<=N;i++){let j=i-1;while(tail>head){const z=dq[tail-1];if(dp[z]>dp[j]||dp[z]===dp[j]&&counts[z]>=counts[j])tail--;else break}dq[tail++]=j;while(dq[head]<i-cap)head++;
 let cost=dp[dq[head]]+lambda+M,k=counts[dq[head]]+1,b=ends[i]&((1<<Math.min(i,cap))-1);
 while(b){const low=b&-b,l=32-Math.clz32(low),z=i-l,v=dp[z]+lambda,q=counts[z]+1;if(v<cost||v===cost&&q<k){cost=v;k=q}b^=low}dp[i]=cost;counts[i]=k}
 const oov=(dp[N]-lambda*counts[N])/M;assert(Number.isInteger(oov),"cost arithmetic");return{lambda,cost:dp[N],groups:counts[N],oov}}
 function dual(ends,K,cap=CAP){let lo=0,hi=24*M,best=null;function check(l){const x=optimum(ends,l,cap),lb=Math.max(0,Math.ceil((x.cost-l*K)/M));if(!best||lb>best.lb||lb===best.lb&&Math.abs(x.groups-K)<Math.abs(best.groups-K))best={...x,lb};return x}
 if(check(lo).groups<=K)return best;
 assert(check(hi).groups<=K,"lambda range");while(hi-lo>1){let m=(hi+lo)>>1;if(check(m).groups>K)lo=m;else hi=m}check(lo);check(hi);return best}
 // Exhaustive toy affine image comparison, testing each slope independently.
 const toy=new Set([[0],[1],[2],[0,1],[1,0],[2,0,2],[1,2,1],[0,0],[0,3,0,4],[2,4,3,4],[0,3,4,0]].map(key)),ti=make(toy),images=new Map();
 for(const s of toy){const p=Array.from(s,c=>c.charCodeAt(0)-65);for(let a=1;a<=28;a++)for(let b=0;b<29;b++)for(let h=0;h<2;h++){const x=key(encode(p,a,b,h));images.set(x,(images.get(x)||0)|(1<<a))}}
 let toyIntervals=0;for(let t=0;t<100;t++){const C=Array.from({length:5+rand(5)},()=>rand(8)),R=scan(C,ti,4);for(let i=0;i<C.length;i++)for(let l=1;l<=4&&i+l<=C.length;l++){let m=0;for(let a=1;a<=28;a++)if(R.E[a][i+l]&(1<<(l-1)))m|=1<<a;assert(m===(images.get(key(C.slice(i,i+l)))||0),"slope brute mismatch");toyIntervals++}}
 // A finite dual certificate must never exceed exact minimum on random short interval DAGs.
 let dualControls=0;for(let t=0;t<160;t++){const N=6+rand(18),K=1+rand(N),ends=new Uint32Array(N+1);for(let i=1;i<=N;i++){ends[i]=1;for(let l=2;l<=Math.min(6,i);l++)if(rand(2))ends[i]|=1<<(l-1)}if(K*6<N)continue;const d=dual(ends,K,6),e=exact({starts:new Uint32Array(N),ends},K,6);assert(d.lb<=e,"invalid lower bound");dualControls++}
 const idx=make(vocab),S=scan(tape,idx,CAP),K=words.length,budget=Math.floor(K*.05),all=[];

 if(options.fourWitness){
  const palette=[2,4,6,7],N=tape.length,W=N+1,ends=new Uint32Array(W),INF=30000;
  for(let i=1;i<=N;i++)for(const s of palette)ends[i]|=S.E[s][i];
  let prev=new Int16Array(W),cur=new Int16Array(W);prev.fill(INF);prev[0]=0;
  const choices=new Uint8Array((K+1)*W),dq=new Int32Array(W);
  for(let k=1;k<=K;k++){cur.fill(INF);let head=0,tail=0;
   for(let i=k;i<=Math.min(N,k*CAP);i++){const j=i-1;while(tail>head&&prev[dq[tail-1]]>=prev[j])tail--;dq[tail++]=j;while(dq[head]<i-CAP)head++;
    let v=Math.min(INF,prev[dq[head]]+1),z=v<INF?32+i-dq[head]:0;
    for(let b=ends[i];b;){const lo=b&-b,l=32-Math.clz32(lo),q=prev[i-l];if(q<INF&&q<=v){v=q;z=l}b^=lo;if(v===0)break}
    cur[i]=v;choices[k*W+i]=z;
   }[prev,cur]=[cur,prev]
  }
  const cost=prev[N],seg=[];let i=N;
  for(let k=K;k>0;k--){const z=choices[k*W+i],l=z&31;assert(l>0,"trace");seg.push({start:i-l,l,oov:z>=32});i-=l}assert(i===0,"trace start");seg.reverse();
  const hist=Array(25).fill(0),printed=Array(25).fill(0),slopeCounts=Object.fromEntries(palette.map(a=>[a,0])),choiceHist={};
  for(const p of words)printed[p.length]++;
  let sumLog10=0,ambiguous=0,oov=0,replayed=0,independentKeysLog10=0;
  for(const z of seg){hist[z.l]++;const C=tape.slice(z.start,z.start+z.l),opts=new Map();let keyCount=0;
   for(const a of palette)for(let b=0;b<29;b++){
    const p=C.map(c=>mod((c-b)*inverse[a]));
    const o=key(p);if(vocab.has(o)){if(!opts.has(o))opts.set(o,{p,a,b,hold:false});keyCount++}
    // In the held-F branch, ciphertext zero may represent plaintext F, or a non-F under the affine map.
    const Q=p.slice(),zero=[];let impossible=false;
    for(let j=0;j<C.length;j++){if(C[j]===0){if(p[j]!==0)zero.push(j);Q[j]=0}else if(p[j]===0){impossible=true;break}}
    if(impossible)continue;
    for(let mask=0;mask<2**zero.length;mask++){for(let j=0;j<zero.length;j++)Q[zero[j]]=mask&(1<<j)?p[zero[j]]:0;
      const h=key(Q);if(vocab.has(h)){assert(encode(Q,a,b,true).join()===C.join(),"held replay");if(!opts.has(h))opts.set(h,{p:Q.slice(),a,b,hold:true});keyCount++}
    }
   }
   assert(z.oov===(opts.size===0),"OOV trace mismatch");
   let chosen;if(opts.size){sumLog10+=Math.log10(opts.size);independentKeysLog10+=Math.log10(keyCount);if(opts.size>1)ambiguous++;choiceHist[opts.size]=(choiceHist[opts.size]||0)+1;chosen=opts.values().next().value}else{oov++;chosen={p:C.map(c=>mod(c*inverse[palette[0]])),a:palette[0],b:0,hold:false}}
   assert(encode(chosen.p,chosen.a,chosen.b,chosen.hold).join()===C.join(),"full replay");replayed+=C.length;slopeCounts[chosen.a]++;
   Object.assign(z,chosen,{lexicalOptions:opts.size});
  }
  assert(oov===cost&&replayed===N,"witness totals");
  return {palette,cost,groups:K,runes:N,replayed,hist,printed,changedLengthSlots:printed.reduce((s,x,l)=>s+Math.max(0,x-hist[l]),0),ambiguous,log10DistinctPlaintexts:sumLog10,log10LexicalKeyAndModeTuples:independentKeysLog10,choiceHist,slopeCounts,first40:seg.slice(0,40).map(z=>z.p.map(x=>gp.translit[x]).join("")).join(" "),elapsedMs:Date.now()-started};
 }

 if(options.smallSlope){
 const ends=new Uint32Array(tape.length+1),pairs=[],triples=[];
 function setEnds(slopes){for(let i=0;i<ends.length;i++){let x=0;for(const a of slopes)x|=S.E[a][i];ends[i]=x}}
 function fixed(slopes,lambda){setEnds(slopes);const x=optimum(ends,lambda);return {slopes,lb:Math.max(0,Math.ceil((x.cost-lambda*K)/M)),...x}}
 if(options.fourSlope){const four=[];
 for(const base of [[4,6,7],[4,7,13],[1,2,28]])for(let d=1;d<29;d++)if(!base.includes(d)){
 const sl=[...base,d].sort((a,b)=>a-b);if(four.some(x=>x.slopes.join()===sl.join()))continue;
 setEnds(sl);four.push({slopes:sl,...dual(ends,K)});
 }
 four.sort((a,b)=>a.lb-b.lb);
 const chosen=four[0];setEnds(chosen.slopes);
 chosen.exact=exact({starts:new Uint32Array(tape.length),ends},K,CAP);
 return {four,chosen,elapsedMs:Date.now()-started};}
for(let a=1;a<29;a++)for(let b=a+1;b<29;b++)pairs.push(fixed([a,b],512));
 pairs.sort((x,y)=>x.lb-y.lb);
 for(let a=1;a<29;a++)for(let b=a+1;b<29;b++)for(let c=b+1;c<29;c++)triples.push(fixed([a,b,c],586));
 triples.sort((x,y)=>x.lb-y.lb);
 const candidateCount=triples.filter(x=>x.lb<=budget).length;
 const candidates=[];let feasible=null;
 for(const t of triples){if(t.lb>budget)break;setEnds(t.slopes);const d=dual(ends,K);const x={slopes:t.slopes,...d};if(d.lb<=budget){x.exact=exact({starts:new Uint32Array(tape.length),ends},K,CAP);if(x.exact<=budget)feasible=x}candidates.push(x);if(feasible)break}
 return {vocab:vocab.size,runes:tape.length,groups:K,budget,pairs,pairMin:pairs[0],pairViable:pairs.filter(x=>x.lb<=budget).length,signPair:pairs.find(x=>x.slopes.join()==="1,28"),triples,triplesMin:triples[0],candidateCount,candidates,feasible,elapsedMs:Date.now()-started};
 }
 for(let a=1;a<=28;a++)all.push({slope:a,...dual(S.E[a],K)});
 const best=Math.min(...all.map(x=>x.lb)),bestSlopes=all.filter(x=>x.lb===best).map(x=>x.slope);
 // Compute exact OOV only at slope 1 (independent prior baseline) and the most promising slope.
 const exactSlopes=Array.from(new Set([1,...bestSlopes])).map(a=>({slope:a,minOov:exact({starts:new Uint32Array(tape.length),ends:S.E[a]},K,CAP)}));
 const offsets=[0,3,8,15,23,27,33,40,54,56].map(n=>gp.pages.slice(0,n).reduce((a,p)=>a+p.indices.length,0)),wo=[0];for(const p of words)wo.push(wo.at(-1)+p.length);
 const chapters=[];for(let j=0;j<9;j++){const start=offsets[j],stop=offsets[j+1],k=wo.indexOf(stop)-wo.indexOf(start),B=Math.floor(k*.05),res=[];assert(k>0,"chapter seam");for(let a=1;a<=28;a++)res.push({slope:a,...dual(S.E[a].subarray(start,stop+1),k)});const m=Math.min(...res.map(x=>x.lb));chapters.push({page:[0,3,8,15,23,27,33,40,54][j],runes:stop-start,groups:k,budget:B,minLowerBound:m,bestSlopes:res.filter(x=>x.lb===m).map(x=>x.slope),all:res})}
 // Source-length-matched planted words selected from donor-held material, not fit to original.
 const held=Array.from({length:25},()=>[]),fallback=Array.from({length:25},()=>[]);
 for(const ws of donors)for(const p of ws.slice(Math.floor(ws.length*.8)))held[p.length].push(p);
 for(const s of vocab)fallback[s.length].push(Array.from(s,c=>c.charCodeAt(0)-65));
 const controls=[];
 for(const [a,mixed] of [[13,true],[7,false]]){const C=[],truth=[];let actual=0,fallbackN=0,heldF=0;
  for(const p0 of words){const l=p0.length,choices=held[l].length?held[l]:fallback[l],p=choices[rand(choices.length)],b=rand(29),h=mixed&&rand(2)===1,lex=vocab.has(key(p));if(!held[l].length)fallbackN++;if(!lex)actual++;if(h)heldF+=p.filter(x=>x===0).length;truth.push({offset:C.length,l,lex});C.push(...encode(p,a,b,h))}
  const R=scan(C,idx,CAP),missing=truth.filter(x=>x.lex&&!(R.E[a][x.offset+x.l]&(1<<(x.l-1)))).length;assert(!missing,"true slope missing");
  const r=[];for(let b=1;b<=28;b++)r.push({slope:b,...dual(R.E[b],K)});
  const t=r.find(x=>x.slope===a);assert(t.lb<=actual,"plant OOV bound");controls.push({trueSlope:a,mixed,actualOov:actual,fallbackN,heldF,missing,viableAt5Percent:r.filter(x=>x.lb<=budget).map(x=>x.slope),lowest:r.reduce((x,y)=>x.lb<=y.lb?x:y),all:r});
 }
 return {vocab:vocab.size,toyIntervals,dualControls,cap:CAP,scale:M,original:{runes:tape.length,groups:K,budget,unionCounts:S.unionCounts,all,bestLowerBound:best,bestSlopes,exactSlopes,chapters,chapterPrivateSum:chapters.reduce((s,x)=>s+x.minLowerBound,0)},controls,elapsedMs:Date.now()-started}
}
function experiment(raw,options={}){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x));
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Set();
 function add(w){if(w&&w.length&&w.length<=24)vocab.add(key(w))}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt))}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)));
 for(let i=0;i<29;i++)add([i]);assert(vocab.size===35938,"register "+vocab.size);
 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],nRune=0;
 for(const c of raw[1]){if(rune.has(c)){if(nRune===tape.length)break;w.push(rune.get(c));nRune++}else if("-.$&§".includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 assert(words.flat().join(",")===tape.join(",")&&words.length===2896,"source mismatch");
 const inverse=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%29===1):0);
 // Normalize all positions not in mask by their first value and first nonzero difference.
 // Constant sequences and empty sequences have distinct keys by length.
 function sig(x,off,len,mask=0){let base=-1,mult=0,s="";for(let i=0;i<len;i++)if(!(mask&(1<<i))){const v=x[off+i];if(base<0){base=v;s+="A";continue}const d=mod(v-base);if(!mult&&d)mult=inverse[d];s+=String.fromCharCode(65+mod(d*mult))}return s}
 function makeIndex(v){const ordinary=Array.from({length:25},()=>new Set()),hold=Array.from({length:25},()=>new Map());for(const s of v){const p=Array.from(s,c=>c.charCodeAt(0)-65),l=p.length;ordinary[l].add(sig(p,0,l));let mask=0;for(let j=0;j<l;j++)if(p[j]===0)mask|=1<<j;if(!hold[l].has(mask))hold[l].set(mask,new Set());hold[l].get(mask).add(sig(p,0,l,mask))}return{ordinary,hold}}
 const index=makeIndex(vocab);
 function scan(C,idx,cap){const N=C.length,A=new Uint32Array(N),H=new Uint32Array(N),ends=new Uint32Array(N+1);
 for(let i=0;i<N;i++){let zero=0;for(let l=1;l<=cap&&i+l<=N;l++){if(C[i+l-1]===0)zero|=1<<(l-1);const b=1<<(l-1);if(idx.ordinary[l].has(sig(C,i,l)))A[i]|=b;
 // A held F is only possible at a visible zero. Other positions share one invertible affine map, including encrypted non-F zeros.
 for(let mask=zero;;mask=(mask-1)&zero){const group=idx.hold[l].get(mask);if(group&&group.has(sig(C,i,l,mask))){H[i]|=b;break}if(mask===0)break}
 if((A[i]|H[i])&b)ends[i+l]|=b;
 }}return{A,H,starts:Uint32Array.from(A,(x,i)=>x|H[i]),ends}}
 function encode(w,a,b,hold){return w.map(p=>hold&&p===0?0:mod(a*p+b))}
 let seed=0x48061126;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 if(options.slopeOnly)return slopeAnalysis(tape,words,gp,vocab,donors,sig,key,mod,inverse,encode,assert,rand,exact,options);
 const toy=new Set([[0],[1],[2],[0,1],[1,0],[2,0,2],[1,2,1],[0,0],[0,3,0,4],[2,4,3,4],[0,3,4,0]].map(key)),ti=makeIndex(toy),toyImages=[new Set(),new Set()];
 for(const s of toy){const p=Array.from(s,c=>c.charCodeAt(0)-65);for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let h=0;h<2;h++)toyImages[h].add(key(encode(p,a,b,h)))}
 let toyIntervals=0;
 for(let t=0;t<100;t++){const C=Array.from({length:5+rand(5)},()=>rand(8));const e=scan(C,ti,4);for(let i=0;i<C.length;i++)for(let l=1;l<=4&&i+l<=C.length;l++){const s=key(C.slice(i,i+l));assert(Boolean(e.A[i]&(1<<(l-1)))===toyImages[0].has(s),"ordinary brute");assert(Boolean(e.H[i]&(1<<(l-1)))===toyImages[1].has(s),"hold brute");toyIntervals++}}
 function exact(E,K,cap){const N=E.starts.length,INF=30000,mask=(1<<cap)-1;let prev=new Int16Array(N+1),cur=new Int16Array(N+1);prev.fill(INF);prev[0]=0;const dq=new Int32Array(N+1);
 for(let k=1;k<=K;k++){cur.fill(INF);let head=0,tail=0;for(let i=k;i<=Math.min(N,k*cap);i++){let j=i-1;while(tail>head&&prev[dq[tail-1]]>=prev[j])tail--;dq[tail++]=j;while(tail>head&&dq[head]<i-cap)head++;let v=tail>head?Math.min(INF,prev[dq[head]]+1):INF,b=E.ends[i]&mask;while(b){const low=b&-b,l=32-Math.clz32(low);v=Math.min(v,prev[i-l]);b^=low;if(v===0)break}cur[i]=v;}[prev,cur]=[cur,prev]}
 return prev[N]}
 function summary(E,lens,cap){const N=E.starts.length,hist=Array(25).fill(0),counts=Array(25).fill(0),a=Array(25).fill(0),h=Array(25).fill(0);for(const l of lens)hist[l]++;
 for(let i=0;i<N;i++)for(let l=1;l<=cap&&i+l<=N;l++){const bit=1<<(l-1);if(E.starts[i]&bit)counts[l]++;if(E.A[i]&bit)a[l]++;if(E.H[i]&bit)h[l]++;}
 const bounds=[];for(let min=4;min<=14;min++){const dp=new Int32Array(N+1);for(let i=N-1;i>=0;i--){dp[i]=dp[i+1];for(let l=min;l<=cap&&i+l<=N;l++)if(hist[l]&&(E.starts[i]&(1<<(l-1))))dp[i]=Math.max(dp[i],1+dp[i+l])}const need=hist.slice(min).reduce((s,v)=>s+v,0),upper=Math.min(dp[0],hist.slice(min).reduce((s,v,j)=>s+Math.min(v,counts[j+min]),0));bounds.push({min,need,disjoint:dp[0],upper,minimumOov:need-upper})}
 return{runes:N,groups:lens.length,budget:Math.floor(lens.length*.05),hist,counts,ordinaryCounts:a,holdCounts:h,bounds,minOovCountOnly:exact(E,lens.length,cap)}}
 const controls=[];for(let d=0;d<donors.length;d++){const ws=[];let n=0;for(const p of donors[d].slice(Math.floor(donors[d].length*.96))){if(n+p.length>350)break;ws.push(p);n+=p.length}for(const mode of ["ordinary","hold","mixed"]){const C=[],truth=[];let fs=0;for(const p of ws){const a=1+rand(28),b=rand(29),hold=mode==="hold"||(mode==="mixed"&&rand(2)===1);truth.push({offset:C.length,len:p.length,lex:vocab.has(key(p)),hold});if(hold)fs+=p.filter(x=>x===0).length;C.push(...encode(p,a,b,hold))}const E=scan(C,index,24),missing=truth.filter(x=>x.lex&&!((x.hold?E.H[x.offset]:E.A[x.offset])&(1<<(x.len-1)))).length,actual=truth.filter(x=>!x.lex).length,min=exact(E,ws.length,24);assert(missing===0&&min<=actual,"plant failure");controls.push({donor:d,mode,runes:n,groups:ws.length,fs,actualOov:actual,minOov:min,missing})}}
 const started=Date.now(),E=scan(tape,index,24),lens=words.map(w=>w.length);
 const proof=witness(tape,E,lens.length,lens,24,vocab,gp,sig,key,mod,inverse,encode,assert);
 if(options.witnessOnly)return {witness:proof,elapsedMs:Date.now()-started};
 const original=summary(E,lens,24);
 const offsets=[0,3,8,15,23,27,33,40,54,56].map(n=>gp.pages.slice(0,n).reduce((a,p)=>a+p.indices.length,0)),wo=[0];for(const p of words)wo.push(wo.at(-1)+p.length);
 const chapters=[];for(let j=0;j<9;j++){const start=offsets[j],stop=offsets[j+1];assert(wo.indexOf(start)>=0&&wo.indexOf(stop)>=0,"chapter seam");chapters.push({page:[0,3,8,15,23,27,33,40,54][j],...summary(scan(tape.slice(start,stop),index,24),lens.slice(wo.indexOf(start),wo.indexOf(stop)),24)})}
 return{vocab:vocab.size,toyIntervals,controls,original,chapters,witness:proof,elapsedMs:Date.now()-started};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),{fourWitness:process.argv.includes("--four-witness"),slopeOnly:process.argv.includes("--four-witness")||process.argv.includes("--slope")||process.argv.includes("--small-slope")||process.argv.includes("--four-slope"),smallSlope:process.argv.includes("--small-slope")||process.argv.includes("--four-slope"),fourSlope:process.argv.includes("--four-slope")}),null,2));
module.exports={experiment};
