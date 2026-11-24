'use strict';
/** Opening line-edge custom alphabet, historical F holds, fixed red13 and blind q13 reciprocal inverse. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp2-transcription.txt"];
function study(inputs,lib){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),assert=(x,m)=>{if(!x)throw Error(m)};
 const ix=new Map(gp.runes.map((r,i)=>[r,i]));
 const rawPages=inputs[5].split("%").slice(0,3).map(p=>p.split("/").map(l=>Array.from(l).filter(c=>ix.has(c)).map(c=>ix.get(c))).filter(l=>l.length));
 const title=rawPages[0][0].slice(0,13),lines=rawPages.map((ls,p)=>ls.map((l,i)=>p===0&&i===0?l.slice(13):l));
 const edge=lines.flat(1).flatMap(l=>[l[0],l.at(-1)]),alphabet=[...new Set(edge)],core=lines.map(ls=>ls.flatMap(l=>l.slice(1,-1)));
 assert(String(alphabet)===String([2,22,3,27,13,0,15,10,25,9,18,6,17,11,21,28,12,16,7,24,8,19,20,1,4,23,5,26,14]),"original edge alphabet");assert(String(core.map(x=>x.length))==="225,242,183","source core widths");
 const f=alphabet.indexOf(0),rot=alphabet.slice(f).concat(alphabet.slice(0,f)),rank=Array(29);rot.forEach((v,i)=>rank[v]=i);
 gp.runes=rot.map(i=>gp.runes[i]);gp.translit=rot.map(i=>gp.translit[i]);gp.pages.forEach(p=>p.indices=p.indices.map(v=>rank[v]));
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",rank[21]);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(seqs.get("p57_parable"))===String(gp.pages[57].indices),"actual p57");
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}}return out}
 const train=inputs.slice(2,5).map(donor).map(p=>p.slice(0,Math.floor(p.length*.7)));
 const lm=lib.train(train),q=13,split=225,n=650,mod=x=>((x%29)+29)%29;
 let rng=0x330113e5;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
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

 const target=core.flat().map(v=>rank[v]);assert(target.length===n,"p0-2 core");
 // Orientation C=(P+K) or C=(K-P). Rotate alphabet to F=0; 
 // for reciprocal branch negate C, and use equivalent additive shift.
 const fixed=[],blind=[];
 for(const a of [1,-1]){
  const C=target.map(v=>mod(a*v));
  for(const sign of [1,-1]){
   // Preserve unrotated #2401 heading ranks as the fixed shift values.
   const K=title.map(v=>mod(a*sign*alphabet.indexOf(v)));
   const h=lib.continueFrozen(C,split,K,lm);
   fixed.push({orientation:a,sign,key:K,continuation:h.legal?{legal:true,score:h.conditionalLogEvidence/(n-split),suffix:render(h.suffix),prefix:render(h.prefix),replay:h.replay}:h});
  }
  blind.push({orientation:a,...solve("p0->p1-2",C)});
 }
 return {trainLengths:train.map(p=>p.length),split,q,alphabet,rot,title,unigramAll:true,bigramMasks:64,trigramMasks:8,controls,fixed,blind};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib),null,2));}
module.exports={study,files};
