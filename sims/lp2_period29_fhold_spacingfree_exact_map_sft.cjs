'use strict';
/** Exact GP29 cyclic MAP on every visible-F interpretation of p54's 232-rune prefix. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function study(inputs,lib){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),assert=(x,m)=>{if(!x)throw Error(m)};
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(seqs.get("p57_parable"))===String(gp.pages[57].indices),"actual p57");
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}}return out}
 const train=inputs.slice(2).map(donor).map(p=>p.slice(0,Math.floor(p.length*.7)));
 const lm=lib.train(train),q=29,split=232,n=308,mod=x=>((x%29)+29)%29;
 let rng=0x330129;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 function encrypt(P,K){let j=0;return P.map(x=>x===0?0:mod(x+K[j++%q]))}
 const render=P=>P.map(x=>gp.translit[x]).join("");
 function solve(name,C,P=null,K=null){
  const start=Date.now(),a=lib.recover(C.slice(0,split),q,lm,{maxZeros:3,exactIfZeros:3,trigramMasks:8});assert(a.exhaustiveTrigram&&a.ranked.length,"all legal masks exact");
  const top=a.ranked[0],f=lib.continueFrozen(C,split,top.key,lm);
  assert(String(encrypt(top.p,top.key))===String(C.slice(0,split)),"prefix exact replay");
  if(f.legal)assert(f.replay,"frozen full replay");
  return {name,seconds:(Date.now()-start)/1000,zeros:a.zeros,totalMasks:a.totalMasks,legalMasks:a.legalMasks,allMaskScores:a.ranked.map(x=>({mask:x.mask,score:x.score,key:x.key})),prefixScore:top.score/split,key:top.key,prefix:render(top.p),prefixIndices:top.p,holdout:f.legal?{legal:true,conditionalLogEvidence:f.conditionalLogEvidence,score:f.conditionalLogEvidence/(n-split),suffix:render(f.suffix),suffixIndices:f.suffix,replay:f.replay}:f,truth:P?{key:K,plain:P,keyCorrect:K.filter((v,i)=>v===top.key[i]).length,prefixCorrect:P.slice(0,split).filter((v,i)=>v===top.p[i]).length,suffixCorrect:f.legal?P.slice(split).filter((v,i)=>v===f.suffix[i]).length:0,truePrefixScore:lib.scorePlain(P.slice(0,split),lm)/split}:null};
 }
 // Fixed target-shape eligibility: select first native window with <=2 actual
 // F holds and first seeded random key yielding <=3 visible Fs in prefix.
 // This controls mask cost; it conditions the planted calibration.
 const controls=[];
 for(const name of ["0_koan_1","0_loss_of_divinity"]){const p=seqs.get(name);let s=0;while(s+n<=p.length&&p.slice(s,s+split).filter(x=>x===0).length>2)s++;assert(s+n<=p.length,"eligible native window");const P=p.slice(s,s+n);let K,C,tries=0;do{K=Array.from({length:q},()=>rand(29));C=encrypt(P,K);tries++}while(C.slice(0,split).filter(x=>x===0).length>3&&tries<10000);assert(C.slice(0,split).filter(x=>x===0).length<=3,"eligible plant");const z=solve(name,C,P,K);controls.push({offset:s,keyDraws:tries,...z})}
 const target=gp.pages.slice(54,56).flatMap(p=>p.indices);assert(target.length===n&&target.slice(0,split).filter(x=>x===0).length===3,"p54-55 source");
 return {trainLengths:train.map(p=>p.length),split,q,controls,target:solve("p54->p55",target)};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib),null,2));}
module.exports={study,files};
