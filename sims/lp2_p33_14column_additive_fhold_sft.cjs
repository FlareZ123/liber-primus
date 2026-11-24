"use strict";
/**
 * #2599: fixed documented 2014 row permutation + historical q8/q13
 * additive literal-plaintext-F hold. Train on 10 complete virtual rows;
 * withhold four complete rows. No word boundaries or tuned row geometry.
 * Run: node sims/lp2_p33_14column_additive_fhold_sft.cjs [after|before] [8|13]
 */
const files=[
 "resources/liber-primus/lp2-corpus.json",
 "resources/liber-primus/lp2-ink-annotations.json",
 "resources/external/relikd-solved-gp29-native-v1.json",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/shakespeare_first300k.txt",
 "resources/control/emerson_essays_2944.txt"
];
function study(inputs,lib,mode,q,{seed,controlNames=["0_koan_1","0_loss_of_divinity"]}={}) {
 const check=(x,m)=>{if(!x)throw Error(m)};
 check(["after","before"].includes(mode)&&[8,13].includes(q),"fixed branch");
 const gp=JSON.parse(inputs[0]),ink=JSON.parse(inputs[1]),native=JSON.parse(inputs[2]);
 const P=gp.pages.find(x=>x.page===33), spans=ink.pages.find(x=>x.page===33).red_spans;
 check(P.indices.length===214&&String(spans.map(x=>[x.start,x.length]))==="0,10,91,8","p33 framing");
 const C=P.indices.filter((_,i)=>!spans.some(s=>i>=s.start&&i<s.start+s.length));
 const perm=[2,8,9,1,12,13,11,4,5,7,3,0,6,10],inv=Array(14);
 perm.forEach((v,i)=>inv[v]=i);
 function row(a,p){check(a.length%14===0,"full rows");return a.map((_,i)=>a[i-i%14+p[i%14]])}
 const R=a=>row(a,perm),S=a=>row(a,inv),split=140,N=196;
 check(C.length===N&&C.slice(0,split).filter(x=>x===0).length===4,"fixed source");
 const historical=["IDGTKUMLOOARWO","ERTHISUTETLHUT","IATSLLOUIMNITE","LNJ7TFYVOIUAUS","NOCO5JI4MEODZZ"].join("").split("");
 check(R(historical).join("")==="GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO","historical control");
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 function donor(s){
  const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);
  const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);
  const out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let found=false;for(let n=Math.min(t.length,3);n>=1;n--){const x=alpha.get(t.slice(0,n));if(x!==undefined){out.push(x);t=t.slice(n);found=true;break}}check(found,"donor rune")}}
  return out.slice(0,Math.floor(out.length*.7));
 }
 const donors=inputs.slice(3).map(donor);
 const lmNatural=lib.train(donors);
 // mode after: additive encryption, then historical row encryption S.
 // mode before: S first, then additive encryption; train in S-order so
 // the language model acts on the actual intermediate, not wrong adjacency.
 const lm=mode==="after"?lmNatural:lib.train(donors.flatMap(a=>Array.from({length:14},(_,i)=>S(a.slice(i,i+14*Math.floor((a.length-i)/14))))));
 const mod=x=>(x%29+29)%29;
 const add=(a,k)=>{let j=0;return a.map(x=>x===0?0:mod(x+k[j++%q]))};
 const encrypt=(a,k)=>mode==="after"?S(add(a,k)):add(S(a),k);
 const intermediate=a=>mode==="after"?R(a):a;
 const plain=a=>mode==="after"?a:R(a);
 const render=a=>a.map(x=>gp.translit[x]).join("");
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 let rng=(seed??(0x259933^q^(mode==="after"?0:0x1433)))>>>0;
 function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 function solve(label,raw,truth,key){
  const input=intermediate(raw),start=Date.now();
  const a=lib.recover(input.slice(0,split),q,lm,{maxZeros:4,exactIfZeros:2,trigramMasks:4});
  if(!a.ranked.length)return {label,reason:a.reason||"no legal prefix",zeros:a.zeros};
  const top=a.ranked[0],prefix=plain(top.p),f=lib.continueFrozen(input,split,top.key,lm);
  check(eq(encrypt(prefix,top.key),raw.slice(0,split)),"prefix composition replay");
  let full=null;
  if(f.legal){
   full=plain(f.prefix.concat(f.suffix));
   check(eq(encrypt(full,top.key),raw),"full composition replay");
  }
  return {label,seconds:(Date.now()-start)/1000,zeros:a.zeros,totalMasks:a.totalMasks,legalMasks:a.legalMasks,trigramMasks:a.trigramMasks,exhaustiveTrigram:a.exhaustiveTrigram,key:top.key,mask:top.mask,prefixScore:top.score/split,naturalPrefixScore:lib.scorePlain(prefix,lmNatural)/split,prefix:render(prefix),prefixIndices:prefix,holdout:f.legal?{legal:true,score:f.conditionalLogEvidence/(N-split),suffix:render(full.slice(split)),indices:full.slice(split),naturalScore:(lib.scorePlain(full,lmNatural)-lib.scorePlain(full.slice(0,split),lmNatural))/(N-split),replay:true}:{legal:false,failedAt:f.failedAt},truth:truth?{key,keyCorrect:top.key.filter((v,i)=>v===key[i]).length,prefixCorrect:prefix.filter((v,i)=>v===truth[i]).length,heldCorrect:full?full.slice(split).filter((v,i)=>v===truth[i+split]).length:0,truePrefixNaturalScore:lib.scorePlain(truth.slice(0,split),lmNatural)/split}:null};
 }
 const controls=[];
 for(const name of controlNames){
  const a=seqs.get(name);let offset=0;
  while(offset+N<=a.length&&a.slice(offset,offset+split).filter(x=>x===0).length>2)offset++;
  check(offset+N<=a.length,"eligible native window");
  const p=a.slice(offset,offset+N);let k,c,draws=0;
  do{k=Array.from({length:q},()=>rand(29));c=encrypt(p,k);draws++}while(c.slice(0,split).filter(x=>x===0).length>4&&draws<10000);
  check(c.slice(0,split).filter(x=>x===0).length<=4,"eligible plant");
  controls.push({offset,draws,...solve(name,c,p,k)});
 }
 // Gate original scoring: both independent native plants must recover full
 // heldout and exact key; a weak inverse is not evidence against the cipher.
 const passes=controls.every(x=>x.truth&&x.truth.keyCorrect===q&&x.truth.heldCorrect===N-split);
 let original=null,negative=null;
 if(passes){
  const nullC=Array.from({length:N},()=>1+rand(28));
  const positions=new Set();while(positions.size<4)positions.add(rand(split));
  for(const i of positions)nullC[i]=0;
  negative=solve("fixed matched-zero independent pad",nullC);
  original=solve("original p33 black196",C);
 }
 return {mode,q,split,held:N-split,source:{redSpans:spans.map(x=>[x.start,x.length]),rowOrder:perm,blackSeam:81,zeroCount:C.slice(0,split).filter(x=>x===0).length},trainLengths:donors.map(a=>a.length),calibrationPassed:passes,controls,negative,original};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8")),lib,process.argv[2]||"after",Number(process.argv[3]||8)),null,2));}
module.exports={study,files};
