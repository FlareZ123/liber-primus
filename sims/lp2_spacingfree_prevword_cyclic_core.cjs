"use strict";
/** Spacing-free literal preceding-word autokey: exact isolated-OOV graph: no original boundaries. */
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

 const chars=s=>Array.from(s,c=>c.charCodeAt(0)-65),fmt=s=>chars(s).map(x=>gp.translit[x]).join("");
 const trie=[new Int32Array(29)],term=[null],lexScores=new Map(),Lp=Array.from(Lcount,v=>Math.log(.05*(v+.5)/(totalL+maxL*.5)));
 for(const [w] of freqs){let j=0;for(const p of chars(w)){let k=trie[j][p];if(!k){k=trie.length;trie[j][p]=k;trie.push(new Int32Array(29));term.push(null)}j=k}term[j]=w;lexScores.set(w,score(chars(w)))}
 function enc(w,K){let q=0;return chars(w).map(p=>p===0?0:mod(p+K.charCodeAt(q++%K.length)-65))}
 function decode(C,truth=null,seed=null){
  const n=C.length,M=Array.from({length:n+1},()=>new Map()),truthAt=new Map();
  if(truth){let i=0,K=seed;for(const w of truth){truthAt.set(i,{K,w});K=w;i+=w.length}assert(i===n,"control shape")}
  for(const k of freqs.keys()){const root={seed:k};M[0].set(k,{v:0,l:0,b:root,c:root})}
  let totalStates=0,maxStates=0,edges=0,truthEdges=0,furthest=0;
  for(let i=0;i<n;i++){
   if(!M[i].size)continue;
   const limit=Math.min(maxL,n-i),actual=truthAt.get(i);let trueFound=false;
   totalStates+=M[i].size;maxStates=Math.max(maxStates,M[i].size);
   if(M[i].size>1000000)return {n,cap:true,at:i,states:M[i].size,edges,totalStates};
   for(const [K,st] of M[i]){
    const canOov=freqs.has(K),len=K.length;
    function go(j,q,node,w,p1,p2,ll){
     if(j){
      const known=node>=0?term[node]!==null:false;
      if(known||canOov){
       const end=i+j,s=known?lexScores.get(w):ll+Lp[j],v=st.v+s,l=st.l+(known?j:0);
       let z=M[end].get(w);
       if(!z){z={v:-Infinity,l:-1,b:null,c:null};M[end].set(w,z)}
       if(v>z.v){z.v=v;z.b={w,prev:st.b}}
       if(l>z.l){z.l=l;z.c={w,prev:st.c}}
       if(actual&&actual.K===K&&actual.w===w)trueFound=true;
       edges++;furthest=Math.max(furthest,end)
      }
     }
     if(j===limit)return;
     const c=C[i+j],off=(p1*30+p2)*29,k=K.charCodeAt(q%len)-65;
     function extend(p,qq){const t=node>=0?trie[node][p]:0,nn=t||-1;if(nn<0&&!canOov)return;go(j+1,qq,nn,w+String.fromCharCode(65+p),p2,p,ll+T[off+p])}
     if(c===0)extend(0,q);const p=mod(c-k);if(p)extend(p,q+1);
    }
    go(0,0,0,"",29,29,0)
   }
   if(trueFound)truthEdges++;
   M[i].clear()
  }
  if(!M[furthest].size)return {n,legal:false,furthest,edges,totalStates,maxStates,truthEdges};
  let bv=-Infinity,cl=-1,bp=null,cp=null;
  for(const st of M[furthest].values()){if(st.v>bv){bv=st.v;bp=st.b}if(st.l>cl){cl=st.l;cp=st.c}}
  function trace(p){const a=[];while(p.prev){a.push(p.w);p=p.prev}a.reverse();let k=p.seed;const C2=a.flatMap(w=>{const e=enc(w,k);k=w;return e});assert(C2.every((x,i)=>x===C[i]),"forward replay");return {seed:p.seed,ws:a}}
  const best=trace(bp),cov=trace(cp),flat=best.ws.flatMap(chars),tr=truth?truth.flatMap(chars):[],ends=new Set();let j=0,hit=0;
  if(truth)for(const w of truth){j+=w.length;ends.add(j)}j=0;for(const w of best.ws){j+=w.length;if(ends.has(j))hit++}
  return {n,end:furthest,legal:furthest===n,scorePerRune:bv/furthest,seed:fmt(best.seed),seedExact:best.seed===seed,seedEffectiveExact:seed!==null&&Array.from({length:maxL},(_,i)=>best.seed[i%best.seed.length]).join("")===Array.from({length:maxL},(_,i)=>seed[i%seed.length]).join(""),trueSeed:seed===null?null:fmt(seed),maxKnownRunes:cl,knownRunes:best.ws.reduce((a,w)=>a+(freqs.has(w)?w.length:0),0),edges,totalStates,maxStates,truthEdges,truthRunes:flat.filter((v,i)=>v===tr[i]).length,boundaryHits:hit,truthWords:truth?.length||0,plaintext:best.ws.map(fmt).join(" "),numeric:best.ws.map(chars),lexWitness:cov.ws.map(chars),lexSeed:fmt(cov.seed)};
 }
 function control(i){const ws=sections[i].words.map(key),seed=ws[0];assert(freqs.has(seed),"seed absent");let k=seed;const C=ws.slice(1).flatMap(w=>{const v=enc(w,k);k=w;return v});return {name:sections[i].name,...decode(C,ws.slice(1),seed)}}
 if(typeof mode==="number")return control(mode);
 if(Array.isArray(mode))return {scope:mode,...decode(gp.pages.filter(p=>p.page>=mode[0]&&p.page<=mode[1]).flatMap(p=>p.indices))};
 const controls=[1,3,4,5].map(control),gate=controls.every(c=>c.legal&&c.truthRunes/c.n>=.95&&c.boundaryHits/c.truthWords>=.90);
 const original=mode==="all"&&gate?[[0,2],[16,21]].map(scope=>({scope,...decode(gp.pages.filter(p=>p.page>=scope[0]&&p.page<=scope[1]).flatMap(p=>p.indices))})):[];
 return {maxL,training:{lexTypes:freqs.size,W,N},gate,controls,original};
}
module.exports=experiment;
