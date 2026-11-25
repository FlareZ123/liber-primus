"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function run(raw,authentic=false){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((v,i)=>[v,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29;
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffled(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const flat=s=>Array.from(s).filter(c=>ix.has(c)).map(c=>ix.get(c));
 function native(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"spelling");o.push(q.i);j+=q.t.length}return o}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 function groups(s){let out=[],w=[],sep="";for(const c of s){if(ix.has(c)){if(w.length&&/[-.&$]/u.test(sep)){out.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)out.push(w);return out}
 const l1=raw[2].split("$"),l2=raw[3].split("$"),targets=[{name:"WELCOME",label:1,raw:l1[1],P:flat(gold.sections[1].source_text)},{name:"KOAN",label:1,raw:l1[5],P:flat(gold.sections[5].source_text)},{name:"AN END",label:2,raw:l2.at(-2),P:flat(gold.sections[7].source_text)},{name:"PARABLE",label:0,raw:l2.at(-1),P:flat(gold.sections[8].source_text)}];
 const primes=[];for(let x=2;primes.length<3000;x++){let yes=true;for(let d=2;d*d<=x;d++)if(x%d===0){yes=false;break}if(yes)primes.push(x)}
 for(const t of targets){t.G=groups(t.raw);t.C=t.G.flat();t.lengths=t.G.map(w=>w.length);assert(t.P.length===t.C.length,"source shape "+t.name)}
 assert(targets[0].C.length===515&&targets[1].C.length===319&&targets[2].C.length===85&&targets[3].C.length===95,"target lengths");
 assert(targets[2].C.every((v,i)=>v===gp.pages[56].indices[i])&&targets[3].C.every((v,i)=>v===gp.pages[57].indices[i]),"LP2 source equality");
 // Authentic keys are not needed by the selector. Confirm the labels only.
 for(const [t,key] of [[targets[0],[23,10,1,10,9,10,16,26]],[targets[1],[0,10,4,0,1,19,0,18,4,18,9,0,18]],[targets[2],primes.map(p=>mod(p-1))]]){let j=0;assert(t.P.every((p,i)=>(p===0?0:mod(p+key[j++%key.length]))===t.C[i]),"authentic label "+t.name)}
 assert(targets[3].P.every((p,i)=>p===targets[3].C[i]),"clear label");
 const donors=raw.slice(4).map(t=>{const words=(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(native),by=Array.from({length:50},()=>[]);for(const w of words)if(w.length<by.length)by[w.length].push(w);return {words,by,flat:words.flat()}});
 const labels=["clear_or_mono","native_keyword","prime_clock","cross_rune_mixing","constrained","iid_fhold_pad"];
 function donorP(d,lengths,R){let fallback=0,P=[];for(const l of lengths){const pool=d.by[l]||[];if(pool.length)P.push(...pool[R()%pool.length]);else{const at=R()%d.flat.length;for(let i=0;i<l;i++)P.push(d.flat[(at+i)%d.flat.length]);fallback++}}return {P,fallback}}
 function encode(P,k,d,R){
  if(k===0){const S=R()%2?shuffled(Array.from({length:29},(_,i)=>i),R):Array.from({length:29},(_,i)=>i);return P.map(x=>S[x])}
  if(k===1){const q=5+R()%12,pool=d.by[q]||[],key=R()%2&&pool.length?pool[R()%pool.length]:Array.from({length:q},()=>R()%29);let j=R()%q;return P.map(x=>x===0?0:mod(x+key[j++%q]))}
  if(k===2){let j=1+R()%464,s=R()%2?1:-1;return P.map(x=>x===0?0:mod(x+s*(primes[j++]-1)))}
  if(k===3){if(R()%2){let a=1+R()%28,b=R()%29,p=R()%29;return P.map(x=>(p=mod(x+a*p+b)))}let a,b,c,e;do{a=R()%29;b=R()%29;c=R()%29;e=R()%29}while(!mod(a*e-b*c));const u=R()%29,v=R()%29,out=[];for(let i=0;i<P.length;i+=2){if(i+1===P.length)out.push(mod(P[i]+u));else out.push(mod(a*P[i]+b*P[i+1]+u),mod(c*P[i]+e*P[i+1]+v))}return out}
  if(k===4){const S=shuffled(Array.from({length:28},(_,i)=>i),R),fixed=R()%2===0,escape=[2,3,6,9,17,21,27,28][R()%8];let p=R()%29,t=0;return P.map(x=>{const E=fixed?escape:primes[t]%29;if(x===E){t=p;return p}const rank=x-Number(x>E),z=(S[rank]+(primes[t]-1))%28;t++;return p=mod(p+z+1)})}
  return P.map(x=>x===0?0:mod(x+R()%29))
 }
 function feats(C,lengths){
  const n=C.length,counts=Array(29).fill(0),D=Array(29).fill(0),boundary=new Uint8Array(n);let at=0;for(const l of lengths){boundary[at]=1;at+=l}assert(at===n,"mask");
  for(const x of C)counts[x]++;let adj=0,inEq=0,inN=0,outEq=0,outN=0;for(let i=1;i<n;i++){D[mod(C[i]-C[i-1])]++;const e=Number(C[i]===C[i-1]);adj+=e;if(boundary[i]){outEq+=e;outN++}else{inEq+=e;inN++}}
  const pairs=m=>m*(m-1)/2,cp=a=>a.reduce((s,x)=>s+pairs(x),0),z=(x,m,p)=>m>0?(x-m*p)/Math.sqrt(Math.max(.05,m*p*(1-p))):0;
  const base=cp(counts)/pairs(n),nonzero=n-counts[0],baseNZ=nonzero>1?cp(counts.slice(1))/pairs(nonzero):1/28;
  let lag=-Infinity,hold=-Infinity;const lo=Array(17).fill(0),hits=Array(17).fill(0);
  for(let k=2;k<=Math.min(20,n-1);k++){let h=0;for(let i=k;i<n;i++)h+=Number(C[i]===C[i-k]);lag=Math.max(lag,z(h,n-k,base))}
  // A pair of nonzero ciphertext runes can be q key steps apart iff its
  // physical distance >=q and its nonzero distance <=q (zero holds may be latent).
  for(let i=0;i<n;i++)if(C[i]!==0){let nz=0;for(let j=i+1;j<n;j++){if(C[j]===0)continue;nz++;if(nz>16)break;for(let q=Math.max(5,nz);q<=Math.min(16,j-i);q++){lo[q]++;hits[q]+=Number(C[i]===C[j])}}}
  for(let q=5;q<=16;q++)hold=Math.max(hold,z(hits[q],lo[q],baseNZ));
  const even=Array(29).fill(0),odd=Array(29).fill(0);for(let i=0;i<n;i++)(i%2?odd:even)[C[i]]++;let parity=0;const ne=Math.ceil(n/2),no=Math.floor(n/2);for(let i=0;i<29;i++)if(counts[i]){let e=counts[i]*ne/n,o=counts[i]*no/n;parity+=(even[i]-e)**2/e+(odd[i]-o)**2/o}
  return [z(cp(counts),pairs(n),1/29),z(counts[0],n,1/29),z(adj,n-1,1/29),z(cp(D),pairs(n-1),1/29),lag,hold,parity,(inEq/Math.max(1,inN)-outEq/Math.max(1,outN))*Math.sqrt(n)];
 }
 function model(samples){const n=samples.length,m=samples[0].length,mean=Array(m).fill(0),variance=Array(m).fill(0);for(const x of samples)for(let j=0;j<m;j++)mean[j]+=x[j]/n;for(const x of samples)for(let j=0;j<m;j++)variance[j]+=(x[j]-mean[j])**2/(n-1);for(let j=0;j<m;j++)variance[j]=Math.max(.04,variance[j]);const dist=x=>x.reduce((s,v,j)=>s+(v-mean[j])**2/variance[j],0),a=samples.map(dist).sort((a,b)=>a-b);return {mean,variance,cut:a[Math.ceil(.99*n)-1]}}
 function classify(x,M){const d=M.map(m=>x.reduce((s,v,j)=>s+(v-m.mean[j])**2/m.variance[j],0)),scores=M.map((m,k)=>-.5*(d[k]+m.variance.reduce((s,v)=>s+Math.log(v),0))),best=scores.indexOf(Math.max(...scores)),p=1/scores.reduce((s,v)=>s+Math.exp(v-scores[best]),0);return {best:labels[best],posterior:p,distance:d[best],oodCut:M[best].cut,decision:p>=.8&&d[best]<=M[best].cut?labels[best]:"abstain"}}
 const results=[];for(let ti=0;ti<targets.length;ti++){const t=targets[ti],R=rng(0x28220000+ti),M=[],fallback=[0,0,0],trainN=100,testN=80;
  for(let k=0;k<labels.length;k++){const X=[];for(const d of [0,2])for(let b=0;b<trainN;b++){const x=donorP(donors[d],t.lengths,R);fallback[d]+=x.fallback;X.push(feats(encode(x.P,k,donors[d],R),t.lengths))}M.push(model(X))}
  const confusion=Object.fromEntries(labels.map(l=>[l,Object.fromEntries([...labels,"abstain"].map(x=>[x,0]))]));
  for(let k=0;k<labels.length;k++)for(let b=0;b<testN;b++){const x=donorP(donors[1],t.lengths,R);fallback[1]+=x.fallback;const a=classify(feats(encode(x.P,k,donors[1],R),t.lengths),M);confusion[labels[k]][a.decision]++}
  const result={name:t.name,n:t.C.length,groups:t.lengths.length,maskFallback:fallback,confusion,model:M};
  if(authentic)result.authentic={truth:labels[t.label],features:feats(t.C,t.lengths),...classify(feats(t.C,t.lengths),M)};
  results.push(result)
 }
 // Predeclared: each class must be accepted correctly >=60% on the disjoint
 // synthetic donor at each mask, <=5% confidently wrong, and all authentic
 // controls correct and accepted. No original ciphertext can be selected otherwise.
 const syntheticPass=results.every(t=>labels.every(l=>t.confusion[l][l]>=48&&80-t.confusion[l][l]-t.confusion[l].abstain<=4));
 const authenticPass=authentic&&results.every(t=>t.authentic.decision===t.authentic.truth);
 return {labels,features:["unigram_collision_z","Fehu_excess_z","adjacent_equality_z","difference_collision_z","lag_peak_residual_z","latent_F_period_peak_z","parity_chi","word_seam_equality_contrast"],trainDonors:["Gibran","Emerson"],testDonor:"Shakespeare",syntheticPass,authenticPass,gate:syntheticPass&&authenticPass,results}
}
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv.includes("--authentic")),null,2));
module.exports={run};
