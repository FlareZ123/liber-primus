"use strict";
/** Spacing-free exact multiplicative self-word prime-index inverse. */
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
 const U=Array.from(c1,c=>(c+.5)/(N+14.5)),B=new Float64Array(c2.length),T=new Float64Array(c3.length),totalL=Lcount.reduce((a,b)=>a+b,0);
 for(let b=0;b<30;b++){let sum=0;for(let c=0;c<29;c++)sum+=c2[b*29+c];for(let c=0;c<29;c++)B[b*29+c]=(c2[b*29+c]+8*U[c])/(sum+8)}
 for(let a=0;a<30;a++)for(let b=0;b<30;b++){let sum=0;for(let c=0;c<29;c++)sum+=c3[(a*30+b)*29+c];for(let c=0;c<29;c++)T[(a*30+b)*29+c]=Math.log((c3[(a*30+b)*29+c]+8*B[b*29+c])/(sum+8))}
 const score=w=>{let l=Math.log(.05*(Lcount[w.length]+.5)/(totalL+maxL*.5));for(let i=0;i<w.length;i++)l+=T[((i>1?w[i-2]:29)*30+(i?w[i-1]:29))*29+w[i]];
 const f=freqs.get(key(w));if(f){const q=Math.log(.95*f/W),m=Math.max(l,q);return m+Math.log(Math.exp(l-m)+Math.exp(q-m))}return l};
 const pr=[];for(let n=2;pr.length<maxL*maxL*109;n++){let ok=true;for(const p of pr){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)pr.push(n)}
 const K=pr.map(x=>(x-1)%29);
 function enc(w){const S=w.reduce((a,b)=>a+P[b],0);let q=0;return w.map(x=>x===0?0:mod(x+K[S*(++q)-1]))}
 function edges(C,i){const out=[],limit=Math.min(maxL,C.length-i),w=[];
  for(let S=2;S<=109*limit;S++){
   function go(j,q,sum){if(sum===S){if(j)out.push({end:i+j,w:w.slice(),known:freqs.has(key(w)),score:score(w)});return}if(j===limit||sum>S||sum+109*(limit-j)<S)return;
    const c=C[i+j];if(c===0&&sum+2<=S){w.push(0);go(j+1,q,sum+2);w.pop()}
    const p=mod(c-K[S*(q+1)-1]);if(p&&sum+P[p]<=S){w.push(p);go(j+1,q+1,sum+P[p]);w.pop()}
   }
   go(0,0,0);
  }
  return out;
 }
 function decode(C,truth=null){const n=C.length,dp=new Float64Array(n+1).fill(-Infinity),lex=new Int32Array(n+1).fill(-1),back=Array(n+1),lexback=Array(n+1);dp[0]=0;lex[0]=0;let numEdges=0,deadStart=0,furthest=0,maxOut=0,trueEdges=0,truthAt=new Map();if(truth){let s=0;for(const w of truth){truthAt.set(s,w);s+=w.length}assert(s===n,"truth shape")}
  for(let i=0;i<n;i++){if(dp[i]===-Infinity&&lex[i]<0){deadStart++;continue}const E=edges(C,i);numEdges+=E.length;maxOut=Math.max(maxOut,E.length);
   if(truthAt.has(i)&&E.some(e=>key(e.w)===key(truthAt.get(i))))trueEdges++;
   for(const e of E){const j=e.end;furthest=Math.max(furthest,j);const l=dp[i]+e.score;if(l>dp[j]){dp[j]=l;back[j]={i,e}}const z=lex[i]+(e.known?e.w.length:0);if(z>lex[j]){lex[j]=z;lexback[j]={i,e}}}
  }
  function trace(B,j){const ret=[];while(j){const v=B[j];assert(v,"backtrack");ret.push(v.e.w);j=v.i}return ret.reverse()}
  const end=dp[n]>-Infinity?n:furthest,ws=trace(back,end),lexws=trace(lexback,end),flat=ws.flat();
  assert(ws.flatMap(enc).every((x,i)=>x===C[i]),"forward replay");
  let truthRunes=0,boundaryHits=0,knownTruthRunes=0,truthWords=0;if(truth){const flatTruth=truth.flat();truthRunes=flat.filter((x,i)=>x===flatTruth[i]).length;truthWords=truth.length;knownTruthRunes=truth.reduce((a,w)=>a+(freqs.has(key(w))?w.length:0),0);const ends=new Set();let i=0;for(const w of truth){i+=w.length;ends.add(i)}i=0;for(const w of ws){i+=w.length;if(ends.has(i))boundaryHits++}}
  return {n,end,legal:end===n,scorePerRune:dp[end]/end,knownRunes:ws.reduce((a,w)=>a+(freqs.has(key(w))?w.length:0),0),maxKnownRunes:lex[end],words:ws.length,numEdges,deadStart,maxOut,trueEdges,truthRunes,boundaryHits,knownTruthRunes,truthWords,plaintext:ws.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),numeric:ws,lexWitness:lexws};
 }
 const controls=[1,3,4,5].map(i=>{const words=sections[i].words;assert(words.every(w=>w.length<=maxL),"max control word");return {name:sections[i].name,...decode(words.flatMap(enc),words)}});
 const gate=controls.every(c=>c.legal&&c.truthRunes/c.n>=.95&&c.boundaryHits/c.truthWords>=.90);
 const orig=doOriginal&&gate?[[0,2],[16,21]].map(([lo,hi])=>({scope:[lo,hi],...decode(gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices))})):[];
 return {maxL,training:{lexTypes:freqs.size,W,N},gate,controls,original:orig}
}
module.exports=experiment;
