'use strict';
/** GP29 opening-page inverse: exhaustive unigram mask evidence, exact bigram/trigram finalist optimization. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function study(inputs,lib){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),assert=(x,m)=>{if(!x)throw Error(m)};
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(seqs.get("p57_parable"))===String(gp.pages[57].indices),"actual p57");
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}}return out}
 const train=inputs.slice(2).map(donor).map(p=>p.slice(0,Math.floor(p.length*.7)));
 const lm=lib.train(train),q=29,split=262,n=729,mod=x=>((x%29)+29)%29;
 let rng=0x33012029;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 function encrypt(P,K){let j=0;return P.map(x=>x===0?0:mod(x+K[j++%q]))}
 const render=P=>P.map(x=>gp.translit[x]).join("");

 // Exact unigram evidence for every mask, under uniform independent phase-key priors.
 // Fixed shortlist sizes are chosen before accessing target continuation.
 function masks(C){
  const zeros=C.filter(x=>x===0).length;assert(zeros<=14,"mask budget");
  const shifts=Array.from({length:29},(_,c)=>Float64Array.from({length:29},(_,k)=>k===c?-Infinity:lm.uni[mod(c-k)]));
  const out=[];
  for(let mask=0;mask<2**zeros;mask++){
   const S=new Float64Array(q*29);let active=0,zi=0,score=0;
   for(const c of C){
    if(c===0&&((mask>>>zi++)&1)){score+=lm.uni[0];continue}
    const offset=(active++%q)*29,v=shifts[c];
    for(let k=0;k<29;k++)S[offset+k]+=v[k];
   }
   for(let j=0;j<q;j++){
    const off=j*29;let max=-Infinity;
    for(let k=0;k<29;k++)if(S[off+k]>max)max=S[off+k];
    if(max===-Infinity){score=-Infinity;break}
    let sum=0;for(let k=0;k<29;k++)sum+=Math.exp(S[off+k]-max);
    score+=max+Math.log(sum)-Math.log(29);
   }
   if(Number.isFinite(score))out.push({mask,score});
  }
  return out.sort((a,b)=>b.score-a.score||a.mask-b.mask);
 }
 function solve(name,C,P=null,K=null){
  const start=Date.now(),pref=C.slice(0,split),u=masks(pref);
  let truthMask=null;if(P){truthMask=0;let zi=0;for(let i=0;i<split;i++)if(pref[i]===0){if(P[i]===0)truthMask|=1<<zi;zi++}}
  const b=u.slice(0,64).map(x=>{const s=lib.fixedMask(pref,q,x.mask);assert(s,"unigram legal mask");return {...x,bi:lib.optimize(s,lib.factors(pref,q,s,lm,2),2).score}}).sort((a,b)=>b.bi-a.bi);
  const t=b.slice(0,8).map(x=>{const s=lib.fixedMask(pref,q,x.mask),z=lib.optimize(s,lib.factors(pref,q,s,lm,3),3),p=lib.plainFor(pref,s,z.key);assert(Math.abs(z.score-lib.scorePlain(p,lm))<1e-6,"trigram score");assert(String(encrypt(p,z.key))===String(pref),"exact replay");return {...x,tri:z.score,key:z.key,p}}).sort((a,b)=>b.tri-a.tri);
  const frozen=t.map(x=>{
   const f=lib.continueFrozen(C,split,x.key,lm);if(f.legal)assert(f.replay,"full replay");
   return {mask:x.mask,key:x.key,unigram:x.score,bigram:x.bi,trigram:x.tri,prefix:render(x.p),prefixIndices:x.p,
    continuation:f.legal?{legal:true,score:f.conditionalLogEvidence/(n-split),suffix:render(f.suffix),suffixIndices:f.suffix,replay:f.replay}:f,
    truth:P?{keyCorrect:K.filter((v,i)=>v===x.key[i]).length,prefixCorrect:P.slice(0,split).filter((v,i)=>v===x.p[i]).length,suffixCorrect:f.legal?P.slice(split).filter((v,i)=>v===f.suffix[i]).length:0}:null};
  });
  return {name,seconds:(Date.now()-start)/1000,zeros:pref.filter(v=>v===0).length,legalMasks:u.length,truthMask,truthUnigramRank:P?u.findIndex(x=>x.mask===truthMask)+1:null,truthBigramRank:P?b.findIndex(x=>x.mask===truthMask)+1:null,truthTrigramRank:P?t.findIndex(x=>x.mask===truthMask)+1:null,frozen,truthKey:K};
 }
 const controls=[];
 for(const name of ["0_koan_1","0_loss_of_divinity"]){
  const P=seqs.get(name).slice(0,n);assert(P.length===n,"native length");
  let K,C,tries=0;do{K=Array.from({length:q},()=>rand(29));C=encrypt(P,K);tries++}while(C.slice(0,split).filter(x=>x===0).length>14&&tries<10000);
  assert(C.slice(0,split).filter(x=>x===0).length<=14,"eligible plant");controls.push({keyDraws:tries,...solve(name,C,P,K)});
 }
 const target=gp.pages.slice(0,3).flatMap(p=>p.indices);assert(target.length===n&&target.slice(0,split).filter(x=>x===0).length===14,"p0-2 source");
 return {trainLengths:train.map(p=>p.length),split,q,unigramAll:true,bigramMasks:64,trigramMasks:8,controls,target:solve("p0->p1-2",target)};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib),null,2));}
module.exports={study,files};
