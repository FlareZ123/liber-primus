'use strict';
// Exact spacing-free joint plaintext/key GP29 trigram forward sum and Viterbi.
// Historical transparent plaintext F; encrypted non-F may also emit F.
function experiment(inputs){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),Q=29,B=30,S=30**4;
 const assert=(b,m)=>{if(!b)throw Error(m)},mod=x=>(x+29)%29;
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 function nativeText(s){return Array.from(s).filter(x=>rune.has(x)).map(x=>rune.get(x))}
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"donor transliteration")}}return out}
 const donors=inputs.slice(2).map(donor),cuts=donors.map(d=>Math.floor(d.length*.7)),train=donors.map((d,i)=>d.slice(0,cuts[i])),test=donors.map((d,i)=>d.slice(cuts[i]));
 // Hierarchical shrinkage: empirical unigram with half-count, bigram backoff
 // mass 16, trigram backoff mass 32. Parameters fixed before LP2 decoding.
 const uni=new Float64Array(Q),bi=new Float64Array(Q*Q),tri=new Float64Array(Q**3);
 for(const d of train)for(let i=0;i<d.length;i++){uni[d[i]]++;if(i)bi[d[i-1]*Q+d[i]]++;if(i>=2)tri[(d[i-2]*Q+d[i-1])*Q+d[i]]++}
 const total=uni.reduce((a,b)=>a+b,0);
 const u=Array.from(uni,x=>(x+.5)/(total+.5*Q)),bb=new Float64Array(Q*Q),prob=new Float64Array(B*B*Q),logs=new Float64Array(B*B*Q);
 for(let x=0;x<Q;x++){let n=0;for(let y=0;y<Q;y++)n+=bi[x*Q+y];for(let y=0;y<Q;y++)bb[x*Q+y]=(bi[x*Q+y]+16*u[y])/(n+16)}
 for(let x=0;x<B;x++)for(let y=0;y<B;y++){let n=0;if(x<Q&&y<Q)for(let z=0;z<Q;z++)n+=tri[(x*Q+y)*Q+z];let check=0;for(let z=0;z<Q;z++){const v=y===Q?u[z]:x===Q?bb[y*Q+z]:(tri[(x*Q+y)*Q+z]+32*bb[y*Q+z])/(n+32);const i=(x*B+y)*Q+z;prob[i]=v;logs[i]=Math.log(v);check+=v}assert(Math.abs(check-1)<1e-10,"conditional normalization")}
 const state=(a,b,c,d)=>((a*B+b)*B+c)*B+d;
 const INIT=state(Q,Q,Q,Q);
 function joint(cipher){
  let ids=[INIT],curr=new Float64Array(S),vcur=new Float64Array(S),next=new Float64Array(S),vn=new Float64Array(S),seen=new Int32Array(S),back=new Int32Array(S);
  curr[INIT]=1;vcur[INIT]=0;let evidence=0,maxStates=1;const hist=[];
  for(let i=0;i<cipher.length;i++){const c=cipher[i],stamp=i+1,nids=[];
   function insert(t,f,v,j){if(seen[t]!==stamp){seen[t]=stamp;nids.push(t);next[t]=f;vn[t]=v;back[t]=j}else{next[t]+=f;if(v>vn[t]){vn[t]=v;back[t]=j}}}
   for(let j=0;j<ids.length;j++){const s=ids[j],k1=s%B,k2=Math.floor(s/B)%B,p1=Math.floor(s/(B*B))%B,p2=Math.floor(s/(B**3)),pbase=(p2*B+p1)*Q,kbase=(k2*B+k1)*Q,f=curr[s],v=vcur[s];
    if(c===0){const t=state(p1,0,k2,k1);insert(t,f*prob[pbase],v+logs[pbase],j)}
    for(let p=1;p<Q;p++){const k=mod(c-p),t=state(p1,p,k1,k);insert(t,f*prob[pbase+p]*prob[kbase+k],v+logs[pbase+p]+logs[kbase+k],j)}
   }
   let z=0;for(const t of nids)z+=next[t];assert(z>0&&Number.isFinite(z),"forward scaling");evidence+=Math.log(z);for(const t of nids)next[t]/=z;
   hist.push({ids:Int32Array.from(nids),prev:Int32Array.from(nids,t=>back[t])});maxStates=Math.max(maxStates,nids.length);
   [curr,next]=[next,curr];[vcur,vn]=[vn,vcur];ids=nids;
  }
  let j=0;for(let k=1;k<ids.length;k++)if(vcur[ids[k]]>vcur[ids[j]])j=k;const best=vcur[ids[j]],p=[],k=[];
  for(let i=hist.length-1;i>=0;i--){const h=hist[i],s=h.ids[j],pi=Math.floor(s/(B*B))%B;p.push(pi);if(pi)k.push(s%B);j=h.prev[j]}
  p.reverse();k.reverse();assert(String(encode(p,k))===String(cipher),"exact original forward replay");
  return {evidence,best,maxStates,p,k};
 }
 function nullEvidence(cipher){let a=new Float64Array(B*B),b=new Float64Array(B*B),e=0;a[Q*B+Q]=1;
  for(const c of cipher){b.fill(0);for(let s=0;s<a.length;s++){const f=a[s];if(!f)continue;const y=s%B,base=s*Q;for(let p=1;p<Q;p++)b[y*B+p]+=f*prob[base+p]/Q;if(c===0)b[y*B]+=f*prob[base]}
   const z=b.reduce((x,y)=>x+y,0);assert(z>0,"null probability");e+=Math.log(z);for(let s=0;s<b.length;s++)b[s]/=z;[a,b]=[b,a]}
  return e;
 }
 function encode(p,k){let j=0;return p.map(v=>v===0?0:mod(v+k[j++]))}
 const render=a=>a.map(i=>gp.translit[i]).join("");
 const accuracy=(a,b)=>a.reduce((n,v,i)=>n+(v===b[i]?1:0),0);
 let rng=0x33010826;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 const sections=new Map(native.sections.map(s=>[s.name,nativeText(s.source_text)]));
 assert(String(sections.get("p57_parable"))===String(gp.pages[57].indices),"p57 authentic plaintext");
 const controlSpecs=[
  {name:"LP1 KOAN / Shakespeare",p:sections.get("0_koan_1").slice(0,729),k:test[1].slice(1000,1800)},
  {name:"LP1 LOSS / Gibran",p:sections.get("0_loss_of_divinity").slice(0,308),k:test[0].slice(2000,2400)},
  {name:"Gibran / Emerson",p:test[0].slice(3000,3308),k:test[2].slice(2000,2400)},
  {name:"Emerson / Shakespeare",p:test[2].slice(4000,4729),k:test[1].slice(3000,3800)}
 ];
 function solve(name,c,truth=null,key=null){const z=joint(c),ne=nullEvidence(c);const r={name,n:c.length,maxStates:z.maxStates,logBF:z.evidence-ne,logBFPerRune:(z.evidence-ne)/c.length,bestLogPerRune:z.best/c.length,plain:render(z.p),plainIndices:z.p,keyIndices:z.k,holds:z.p.filter(x=>!x).length,replay:c.length};
  if(truth){r.truePlain=render(truth);r.correct=accuracy(z.p,truth);r.trueKey=key;r.correctHoldMask=truth.reduce((n,v,i)=>n+((v===0)===(z.p[i]===0)?1:0),0);r.trueHolds=truth.filter(x=>!x).length}
  return r;
 }
 const controls=controlSpecs.map(({name,p,k})=>{assert(k.length>=p.length,"plant length");const need=p.filter(x=>x!==0).length,k1=k.slice(0,need),u1=Array.from({length:need},()=>rand(Q));return {positive:solve(name,encode(p,k1),p,k1),negative:solve(name+" / uniform",encode(p,u1),p,u1)}});
 const orig=[{name:"p0-2",c:gp.pages.slice(0,3).flatMap(p=>p.indices)},{name:"p54-55",c:gp.pages.slice(54,56).flatMap(p=>p.indices)}].map(({name,c})=>solve(name,c));
 return {trainLengths:cuts,testLengths:test.map(x=>x.length),controls,orig};
}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment,files};
