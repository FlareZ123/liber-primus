"use strict";
/** Spacing-free previous-word prime-index inverse: no original boundaries. */
function experiment(gp,donor,dict,shakespeare,mode='controls'){
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
 const U=Array.from(c1,c=>(c+.5)/(N+14.5)),B=new Float64Array(c2.length),T=new Float64Array(c3.length),totalL=Lcount.reduce((a,b)=>a+b,0);
 for(let b=0;b<30;b++){let sum=0;for(let c=0;c<29;c++)sum+=c2[b*29+c];for(let c=0;c<29;c++)B[b*29+c]=(c2[b*29+c]+8*U[c])/(sum+8)}
 for(let a=0;a<30;a++)for(let b=0;b<30;b++){let sum=0;for(let c=0;c<29;c++)sum+=c3[(a*30+b)*29+c];for(let c=0;c<29;c++)T[(a*30+b)*29+c]=Math.log((c3[(a*30+b)*29+c]+8*B[b*29+c])/(sum+8))}
 const score=w=>{let l=Math.log(.05*(Lcount[w.length]+.5)/(totalL+maxL*.5));for(let i=0;i<w.length;i++)l+=T[((i>1?w[i-2]:29)*30+(i?w[i-1]:29))*29+w[i]];
 const f=freqs.get(key(w));if(f){const q=Math.log(.95*f/W),m=Math.max(l,q);return m+Math.log(Math.exp(l-m)+Math.exp(q-m))}return l};
 const pr=[];for(let n=2;pr.length<maxL*109+maxL;n++){let ok=true;for(const p of pr){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)pr.push(n)}
 const K=pr.map(x=>(x-1)%29);

 const D=maxL*109+1,Lp=Array.from(Lcount,(v,i)=>Math.log(.05*(v+.5)/(totalL+maxL*.5)));
 const sumWord=w=>w.reduce((a,b)=>a+P[b],0);
 function enc(w,S){let q=0;return w.map(x=>x===0?0:mod(x+K[S+q++-1]))}
 function decode(C,truth=null,seed=null){
  const n=C.length,sz=(n+1)*D,dp=new Float64Array(sz).fill(-Infinity),lex=new Int32Array(sz).fill(-1);
  const b1=new Int32Array(sz),m1=new Uint32Array(sz),b2=new Int32Array(sz),m2=new Uint32Array(sz);
  for(let s=2;s<D;s++){dp[s]=0;lex[s]=0}
  const states=new Int32Array(n+1);let edges=0,legalStates=0,maxStates=0,furthest=0,truthEdges=0;
  const truthAt=new Map();if(truth){let i=0,s=seed;for(const w of truth){truthAt.set(i,{s,w:key(w),end:i+w.length});s=sumWord(w);i+=w.length}assert(i===n,"control shape")}
  for(let i=0;i<n;i++){
   const limit=Math.min(maxL,n-i),base=i*D,actual=truthAt.get(i);let trueFound=false;
   for(let s=2;s<D;s++){
    const prev=base+s,v=dp[prev],l=lex[prev];if(l<0)continue;states[i]++;legalStates++;
    function go(j,q,S,p1,p2,word,ll,mask){
     if(j){
      const end=i+j,z=end*D+S,f=freqs.get(word),known=f!==undefined;
      let a=ll+Lp[j];if(known){const b=Math.log(.95*f/W),m=Math.max(a,b);a=m+Math.log(Math.exp(a-m)+Math.exp(b-m))}
      const vv=v+a,cc=l+(known?j:0),ptr=(s<<5)|j;
      if(vv>dp[z]){dp[z]=vv;b1[z]=ptr;m1[z]=mask}
      if(cc>lex[z]){lex[z]=cc;b2[z]=ptr;m2[z]=mask}
      if(actual&&actual.s===s&&actual.w===word)trueFound=true;
      furthest=Math.max(furthest,end);edges++;
     }
     if(j===limit)return;
     const c=C[i+j],off=(p1*30+p2)*29;
     if(c===0)go(j+1,q,S+2,p2,0,word+"A",ll+T[off],mask|(1<<j));
     const p=mod(c-K[s+q-1]);if(p)go(j+1,q+1,S+P[p],p2,p,word+String.fromCharCode(65+p),ll+T[off+p],mask);
    }
    go(0,0,0,29,29,"",0,0)
   }
   if(trueFound)truthEdges++;
   maxStates=Math.max(maxStates,states[i])
  }
  function select(A,back,masks){
   let s=2;for(let k=3;k<D;k++)if(A[furthest*D+k]>A[furthest*D+s])s=k;
   const endState=s,value=A[furthest*D+s],ws=[];let i=furthest;
   while(i){const z=i*D+s,p=back[z],len=p&31,ss=p>>>5,mask=masks[z];assert(len&&ss,"trace");let q=0;const w=[];for(let j=0;j<len;j++){const c=C[i-len+j];w.push(mask&(1<<j)?0:mod(c-K[ss+q++-1]))}assert(sumWord(w)===s,"sum trace");ws.push(w);i-=len;s=ss}
   ws.reverse();let ss=s;const replay=ws.flatMap(w=>{const v=enc(w,ss);ss=sumWord(w);return v});assert(replay.every((v,i)=>v===C[i]),"replay");
   return {value,start:s,endState,ws};
  }
  const best=select(dp,b1,m1),coverage=select(lex,b2,m2),flat=best.ws.flat(),tr=truth?truth.flat():[],ends=new Set();let j=0,hit=0;
  if(truth)for(const w of truth){j+=w.length;ends.add(j)}
  j=0;for(const w of best.ws){j+=w.length;if(ends.has(j))hit++}
  return {n,end:furthest,legal:furthest===n,scorePerRune:best.value/furthest,initial:best.start,trueInitial:seed,initialRecovered:best.start===seed,maxKnownRunes:coverage.value,knownRunes:best.ws.reduce((a,w)=>a+(freqs.has(key(w))?w.length:0),0),edges,legalStates,maxStates,truthEdges,truthRunes:flat.filter((v,i)=>v===tr[i]).length,boundaryHits:hit,truthWords:truth?.length||0,plaintext:best.ws.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),numeric:best.ws,lexWitness:coverage.ws,lexSeed:coverage.start}
 }
 function control(i){const ws=sections[i].words;assert(ws.every(w=>w.length<=maxL),"control max L");let s=sumWord(ws[0]),seed=s;const C=ws.slice(1).flatMap(w=>{const v=enc(w,s);s=sumWord(w);return v});return {name:sections[i].name,...decode(C,ws.slice(1),seed)}}
 if(mode==="pilot")return {pilot:control(5)};
 const controls=[1,3,4,5].map(control);
 const gate=controls.every(c=>c.legal&&c.truthRunes/c.n>=.95&&c.boundaryHits/c.truthWords>=.90);
 const orig=mode==="all"&&gate?[[0,2],[16,21]].map(([lo,hi])=>({scope:[lo,hi],...decode(gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices))})):[];
 return {maxL,training:{lexTypes:freqs.size,W,N},gate,controls,original:orig};
}
module.exports=experiment;
