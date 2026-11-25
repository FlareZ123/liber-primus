"use strict";
/** Original table known-key, arbitrary true segmentation, mixed F, optional per-word insertion. */
function experiment(gp,donor,dict,shakespeare,doOriginal=false,grid=null){
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

 const keys={},gridTokens=grid.pages.flatMap(p=>p.tokens),bytes=grid.pages.flatMap(p=>p.bytes);assert(bytes.length===256,"grid shape");for(const radix of [59,60]){const alphabet=radix===60?grid.alphabet:grid.alphabet.replace("f","");const B=gridTokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));assert(B.every(x=>x>=0&&x<256),"grid byte");if(radix===60)assert(B.join(",")===bytes.join(","),"grid source");for(const order of ["row","column"])for(const reverse of [false,true])for(const sign of [1,-1]){let K=order==="row"?B.slice():Array.from({length:256},(_,i)=>B[(i%32)*8+Math.floor(i/32)]);if(reverse)K.reverse();keys[[radix,order,reverse?"reverse":"forward",sign].join("/")]=K.map(x=>mod(sign*x))}}const controlKeys=Object.entries(keys).filter((_,i)=>[0,7,15].includes(i)),nodes=[{next:new Int32Array(29).fill(-1),f:0}];
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
 const controls=[],negatives=[],orig=[];
 for(const [name,K] of controlKeys)for(const ix of [1,3,4,5]){const w=sections[ix].words,seed=0x330100+ix*73+K.length,pl=plant(w,K,seed,(ix*53)%K.length);const out=decode(pl.C,K,pl);const {words,plaintext,...summary}=out;controls.push({name,section:sections[ix].name,...summary});const R=rng(seed+5),C=pl.C.map(()=>R()%29);const {words:nw,plaintext:np,...negative}=decode(C,K);negatives.push({name,section:sections[ix].name,...negative})}
 const gate=controls.every(x=>x.correct/x.real>=.85&&x.boundaryHits/x.actualWords>=.80)&&Math.min(...controls.map(x=>x.scorePerCipherRune))>Math.max(...negatives.map(x=>x.scorePerCipherRune));
 if(doOriginal&&gate)for(const [name,K] of Object.entries(keys))for(const [lo,hi,skip] of [[0,2,13],[16,21,0]]){const C=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices).slice(skip);orig.push({name,scope:[lo,hi],skip,...decode(C,K)})}
 return {model:{rate,lexicon:freqs.size,maxL,keys,gate},controls,negatives,original:orig}
}
module.exports=experiment;
