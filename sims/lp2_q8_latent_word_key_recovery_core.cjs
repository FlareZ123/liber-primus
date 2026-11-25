"use strict";
/** Unknown period-eight key recovery from latent long-word anchors. */
function experiment(gp,donor,dict,shakespeare,doOriginal=false){
 const mod=x=>(x%29+29)%29,assert=(b,m)=>{if(!b)throw Error(m)},P=gp.prime,maxL=24;
 const ids=new Map(gp.runes.map((r,i)=>[r,i])),key=w=>w.map(x=>String.fromCharCode(65+x)).join("");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function gpEncode(s,native=true){s=s.toUpperCase();if(native)s=s.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA");s=s.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.t));assert(m,"unsupported "+s);out.push(m.i);s=s.slice(m.t.length)}return out}
 function words(s){const out=[];let a=[];for(const c of s){if(ids.has(c))a.push(ids.get(c));else if(a.length){out.push(a);a=[]}}if(a.length)out.push(a);return out}
 const sections=donor.sections.map(s=>({name:s.name,words:words(s.source_text)}));
 const freqs=new Map(),Lcount=new Float64Array(maxL+1),c1=new Float64Array(29),c2=new Float64Array(30*29),c3=new Float64Array(30*30*29);let N=0,W=0;
 const eligible=w=>w.length>0&&w.length<=maxL&&(w.length!==1||[3,10,24].includes(w[0]));
 function count(w,n,lex=true){if(!w.length||w.length>maxL)return;if(lex&&eligible(w)){const k=key(w);freqs.set(k,(freqs.get(k)||0)+n);W+=n}Lcount[w.length]+=n;for(let i=0;i<w.length;i++){const a=i>1?w[i-2]:29,b=i?w[i-1]:29,c=w[i];c1[c]+=n;c2[b*29+c]+=n;c3[(a*30+b)*29+c]+=n;N+=n}}
 for(const l of dict.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const w=gpEncode(m[1],true),v=gpEncode(m[1],false),n=Number(m[2]);count(w,n);if(key(w)!==key(v))count(v,n*.25)}
 for(const w of shakespeare.match(/[A-Za-z]+/g)||[])count(gpEncode(w),1);
 for(const i of [0,2,6,7,8])for(const w of sections[i].words)count(w,1);

 const keys={WELCOME:[23,10,1,10,9,10,16,26],KOAN:[0,10,4,0,1,19,0,18,4,18,9,0,18]},nodes=[{next:new Int32Array(29).fill(-1),f:0}];
 for(const [s,f] of freqs){let i=0;for(const c of s){let p=c.charCodeAt(0)-65,j=nodes[i].next[p];if(j<0){j=nodes.length;nodes[i].next[p]=j;nodes.push({next:new Int32Array(29).fill(-1),f:0})}i=j}nodes[i].f=f}
 const rate=.45,ls0=Math.log(1-rate),ls1=Math.log(rate/29),lf=Math.log(.5),lu=Math.log(.05/29);
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function plant(ws,K,seed,initial){const R=rng(seed),C=[],truth=[],bounds=[];let phase=initial;
  for(const w of ws){let tape=[],labels=[];for(const p of w){let hold=p===0&&(R()%2===0);tape.push(hold?0:mod(p+K[phase]));labels.push({p,hold});if(!hold)phase=(phase+1)%K.length}
   if(R()%100<45){const j=R()%(tape.length+1);tape.splice(j,0,R()%29);labels.splice(j,0,{p:-1,hold:false})}
   C.push(...tape);truth.push(...labels);bounds.push(C.length)
  }return {C,truth,bounds,initial,end:phase};
 }
 function decode(C,K,truth=null){const n=C.length,q=K.length,dp=new Float64Array((n+1)*q).fill(-Infinity),back=Array((n+1)*q);for(let s=0;s<q;s++)dp[s]=0;let edgeCount=0,states=0;
  for(let i=0;i<n;i++)for(let s=0;s<q;s++){const b=dp[i*q+s];if(b===-Infinity)continue;states++;
   let P=[],labels=[];
   function push(j,t,sc,w,lab,known){if(j<=i)throw Error("empty edge");edgeCount++;const k=j*q+t,v=b+sc;if(v>dp[k]){dp[k]=v;back[k]={i,s,w:w.slice(),lab:lab.map(x=>({...x})),known}}}
   function go(j,t,node,len,cut,nF){const f=nodes[node].f;if(f&&len){const sc=Math.log(.95*f/W)+(cut?ls1-Math.log(len+1):ls0)+nF*lf;push(j,t,sc,P,labels,true)}if(j===n||len===maxL&&cut)return;
    const c=C[j];if(!cut){labels.push({p:-1,hold:false});go(j+1,t,node,len,true,nF);labels.pop()}
    if(len===maxL)return;
    if(c===0){let next=nodes[node].next[0];if(next>=0){P.push(0);labels.push({p:0,hold:true});go(j+1,t,next,len+1,cut,nF+1);P.pop();labels.pop()}}
    const p=mod(c-K[t]),next=nodes[node].next[p];if(next>=0){P.push(p);labels.push({p,hold:false});go(j+1,(t+1)%q,next,len+1,cut,nF+(p===0));P.pop();labels.pop()}
   }
   go(i,s,0,0,false,0);
   const p=mod(C[i]-K[s]);push(i+1,(s+1)%q,lu+(p===0?lf:0),[p],[{p,hold:false}],false);if(C[i]===0)push(i+1,s,lu+lf,[0],[{p:0,hold:true}],false)
  }
  let t=0;for(let s=1;s<q;s++)if(dp[n*q+s]>dp[n*q+t])t=s;const end=t,score=dp[n*q+t],ws=[],all=[],wordEnds=[];let i=n;
  while(i){const e=back[i*q+t];assert(e,"no path");ws.push(e);wordEnds.push(i);i=e.i;t=e.s}
  const initial=t;ws.reverse();wordEnds.reverse();let j=0,phase=t,knownRunes=0,oov=0,insertions=0,wordCount=0;for(const e of ws){assert(e.i===j&&e.s===phase,"state replay");wordCount++;if(e.known)knownRunes+=e.w.length;else oov+=e.w.length;for(const x of e.lab){if(x.p<0){insertions++;all.push(x);j++;continue}const c=x.hold?0:mod(x.p+K[phase]);assert(c===C[j],"replay "+j);if(!x.hold)phase=(phase+1)%q;all.push(x);j++}}
  assert(j===n&&phase===end,"end replay");
  const result={n,initial,end,scorePerCipherRune:score/n,knownRunes,oov,insertions,wordCount,states,edgeCount,plaintext:ws.map(e=>e.w.map(p=>gp.translit[p]).join("")).join(" "),words:ws.map(e=>[e.i,e.s,e.w,e.known,e.lab.map(x=>x.p<0?-1:x.hold?29:x.p)])};
  if(truth){const tr=truth.truth,real=tr.filter(x=>x.p>=0).length,correct=all.filter((x,i)=>x.p>=0&&x.p===tr[i].p).length,actualNulls=tr.filter(x=>x.p<0).length,correctNulls=all.filter((x,i)=>x.p<0&&tr[i].p<0).length,ends=new Set(wordEnds),boundaryHits=truth.bounds.filter(x=>ends.has(x)).length;Object.assign(result,{real,correct,actualNulls,correctNulls,actualWords:truth.bounds.length,boundaryHits,actualInitial:truth.initial,actualEnd:truth.end})}
  return result
 }

 const q=8,byLen=Array.from({length:maxL+1},()=>new Map()),nums=s=>Array.from(s,c=>c.charCodeAt(0)-65);
 function signature(A){let s="";for(let i=q;i<A.length;i++)s+=String.fromCharCode(65+mod(A[i]-A[i-q]));return s}
 function masked(A,m){return A.filter((_,i)=>!(m&(1<<i)))}
 function masks(A,visit){let z=0;for(let i=0;i<A.length;i++)if(A[i]===0)z|=1<<i;for(let m=z;;m=(m-1)&z){visit(m);if(!m)break}}
 let indexed=0,types=0;for(const s of freqs.keys()){const P=nums(s);if(P.length<q+1)continue;types++;masks(P,m=>{const A=masked(P,m);if(A.length<=q)return;const sig=signature(A),B=byLen[P.length];if(!B.has(m))B.set(m,new Map());const M=B.get(m);if(!M.has(sig))M.set(sig,[]);M.get(sig).push(A);indexed++})}
 const pow=29**(q-1);function code(K){let v=0;for(const x of K)v=v*29+x;let best=v;for(let i=0;i<q-1;i++){const x=Math.floor(v/pow);v=(v%pow)*29+x;if(v<best)best=v}return best}
 function digits(v){const K=Array(q);for(let i=q-1;i>=0;i--){K[i]=v%29;v=Math.floor(v/29)}return K}
 function enumerate(C){const earliest=new Map(),twice=new Map();let paths=0,windows=0,lookups=0;
  for(let i=0;i<C.length;i++)for(let L=q+1;L<=maxL&&i+L<=C.length;L++){
   if(!byLen[L].size)continue;const seen=new Set();
   function inspect(D,end,cut){const ds=key(D);if(seen.has(ds))return;seen.add(ds);windows++;
    masks(D,m=>{const A=masked(D,m);if(A.length<=q)return;const candidates=byLen[L].get(m)?.get(signature(A));if(!candidates)return;lookups++;for(const P of candidates){paths++;const K=A.slice(0,q).map((c,j)=>mod(c-P[j])),v=code(K),e=earliest.get(v);if(e!==undefined&&e<=i&&!twice.has(v))twice.set(v,{firstEnd:e,secondStart:i,secondEnd:end,secondCut:cut});if(e===undefined||end<e)earliest.set(v,end)}})
   }
   inspect(C.slice(i,i+L),i+L,-1);
   if(i+L+1<=C.length){const E=C.slice(i,i+L+1);for(let cut=0;cut<=L;cut++)inspect(E.slice(0,cut).concat(E.slice(cut+1)),i+L+1,cut)}
  }
  return {earliest,twice,paths,windows,lookups};
 }
 const controls=[],original=[],cap=600;
 function recover(C,truth=null,secret=null){const e=enumerate(C),s=secret?code(secret):null,stats={n:C.length,paths:e.paths,windows:e.windows,lookups:e.lookups,distinctKeys:e.earliest.size,twoDisjoint:e.twice.size,plantedOne:secret?e.earliest.has(s):null,plantedTwo:secret?e.twice.has(s):null};if(e.twice.size>cap)return {...stats,capped:true,best:null,candidates:[]};
  let best=null;const candidates=[];for(const [v,a] of e.twice){const K=digits(v),d=decode(C,K,truth);candidates.push({v,K,...a,score:d.scorePerCipherRune});if(!best||d.scorePerCipherRune>best.scorePerCipherRune)best={v,K,...d}}
  candidates.sort((a,b)=>b.score-a.score);
  return {...stats,capped:false,best:best?{...best,keyCorrect:secret?best.v===s:null}:null,candidates:candidates.slice(0,20)}
 }
 for(const ix of [1,3,4,5]){const ws=sections[ix].words,seed=0x12ab33+ix*199,R=rng(seed),K=Array.from({length:q},()=>R()%29),pl=plant(ws,K,seed+13,R()%q);
  let anchors=0,j=0;for(let h=0;h<ws.length;h++){const end=pl.bounds[h],labels=pl.truth.slice(j,end),n=labels.filter(x=>x.p>=0&&!x.hold).length;if(n>=q+1&&freqs.has(key(ws[h])))anchors++;j=end}
  const out=recover(pl.C,pl,K);controls.push({section:sections[ix].name,anchors,secret:digits(code(K)),...out})
 }
 const eligibleControls=controls.filter(c=>c.anchors>=2),gate=eligibleControls.length>=3&&eligibleControls.every(c=>!c.capped&&c.plantedTwo&&c.best?.keyCorrect&&c.best.correct/c.best.real>=.85);
 if(doOriginal&&gate)for(const [lo,hi,skip] of [[0,2,13],[16,21,0]]){const C=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices).slice(skip);original.push({scope:[lo,hi],skip,...recover(C)})}
 return {model:{q,types,indexed,lexicon:freqs.size,maxL,cap,gate,eligibleControls:eligibleControls.length},controls,original}
}
module.exports=experiment;
