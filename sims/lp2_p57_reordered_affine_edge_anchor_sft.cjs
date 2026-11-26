"use strict";
/** Exact anchor nomination for affine-transformed, arbitrary-order p57 mixed-edge key. */
const fs=require("node:fs"),path=require("node:path");
function affineReorderExperiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const check=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 const sourceWords=parse(gold.sections.find(s=>s.name==="p57_parable").source_text),source=gp.pages.find(p=>p.page===57).indices;
 check(sourceWords.length===20&&sourceWords.flat().join()===source.join(),"p57");
 const target=parse(raw[6].split("%")[54].replace(/\/\s*/gu,"")),p55=gp.pages.find(p=>p.page===55).indices;
 check(target.flat().join()===p55.join()&&target.length===17&&target[0].length===1,"p55 boundaries");
 const groups=target.slice(1),C=groups.flat(),L=C.length,lens=groups.map(x=>x.length),offsets=lens.map((_,i)=>lens.slice(0,i).reduce((a,b)=>a+b,0));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const s of gold.sections)for(const w of parse(s.source_text))types.add(id(w));
 for(const s of raw.slice(3,6))for(const w of body(s).match(/[A-Za-z]+/g)||[])for(const alt of [true,false])types.add(id(word(w,alt)));
 for(const ln of raw[2].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const bylen=Array.from({length:Math.max(...lens)+1},()=>[]);
 for(const t of types)if(t.length<bylen.length)bylen[t.length].push(nums(t));
 const variants=sourceWords.map(w=>[w.slice(1),w.slice(0,-1)]),N=1<<20,ALL=N-1,l=variants.map(v=>v[0].length),sum=new Uint8Array(N);
 for(let m=1;m<N;m++){const bit=m&-m;sum[m]=sum[m^bit]+l[31-Math.clz32(bit)];}
 check(sum[ALL]===L&&types.size===36712,"length/dictionary");
 const subsetCache=new Map();function subsetFits(mask,total){
  if(total<0||total>sum[mask])return false;
  let bits=subsetCache.get(mask);if(bits===undefined){bits=1n;for(let m=mask;m;m&=m-1)bits|=bits<<BigInt(l[31-Math.clz32(m&-m)]);subsetCache.set(mask,bits);}
  return !!((bits>>BigInt(total))&1n);
 }
 const starts=Array.from({length:29},()=>[]),prefix=Array.from({length:29},()=>[]);
 for(let w=0;w<20;w++)for(let e=0;e<2;e++){const k=variants[w][e],entry={w,e,k,bit:1<<w};prefix[k[0]].push(entry);for(let a=0;a<k.length;a++)starts[k[a]].push({...entry,a});}
 function witness(key,offset){
  if(!key.length)return [];
  const match=(k,a,j)=>{const n=Math.min(k.length-a,key.length-j);for(let i=0;i<n;i++)if(k[a+i]!==key[j+i])return -1;return n;};
  for(const first of starts[key[0]]){
   if(first.a>offset)continue;
   const used0=first.bit,n=match(first.k,first.a,0),before=offset-first.a;if(n<0)continue;
   const chosen=[[first.w,first.e,first.a]];
   function walk(j,used){
    if(j===key.length)return subsetFits(ALL^used,before);
    for(const e of prefix[key[j]]){if(used&e.bit)continue;const n=match(e.k,0,j);if(n<0)continue;chosen.push([e.w,e.e,0]);if(walk(j+n,used|e.bit))return true;chosen.pop();}
    return false;
   }
   if(walk(n,used0))return chosen;
  }
  return null;
 }
 const inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(x=>mod(x*a)===1):0);
 function scan(cipher,fhold,held,anchorOnly=false,trueParams=null){
  const H=new Set(held),activeOffsets=offsets.map(at=>at-held.filter(x=>x<at).length);
  const rows=lens.map((len,j)=>{const at=offsets[j],out=[];for(const p of bylen[len]){const d=[];let ok=true;for(let i=0;i<len;i++){const h=H.has(at+i);if(fhold&&(p[i]===0)!==h){ok=false;break;}if(!h)d.push(mod(cipher[at+i]-p[i]));}if(ok)out.push({p,d});}return out;});
  const anchor=lens.indexOf(13),survivors=[];let total=0;
  function possible(j,a,b,all=false){let count=0,first=null;for(const {p,d} of rows[j]){const k=d.map(x=>mod((x-b)*inv[a])),w=witness(k,activeOffsets[j]);if(w!==null){count++;if(!first)first={p:id(p),translit:p.map(x=>gp.translit[x]).join(""),w};if(!all)return {count,first};}}return {count,first};}
  for(let a=1;a<29;a++)for(let b=0;b<29;b++){
   total++;
   const h=possible(anchor,a,b,true);if(!h.count)continue;
   let miss=0,counts=Array(lens.length).fill(-1);counts[anchor]=h.count;
   if(!anchorOnly){for(const j of [...Array(lens.length).keys()].filter(i=>i!==anchor).sort((a,b)=>lens[b]-lens[a])){const v=possible(j,a,b);counts[j]=v.count;if(!v.count)miss++;}}
   survivors.push({a,b,anchor:h,otherMissing:miss,existence:counts});
  }
  if(trueParams){const hit=survivors.find(s=>s.a===trueParams.a&&s.b===trueParams.b);check(hit&&(!anchorOnly?hit.otherMissing===0:true),"hidden key absent");}
  return {fhold,held,total,eligibleLongForms:rows[anchor].length,survivors};
 }
 let rng=0x19aff157;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const controls=[];
 for(let trial=0;trial<2;trial++){
  const fhold=!!trial,a=1+rand(28),b=rand(29),order=shuffle([...Array(20).keys()]).map(w=>[w,rand(2)]),key=order.flatMap(([w,e])=>variants[w][e]);let j=0;const held=[],P=lens.map(n=>bylen[n][rand(bylen[n].length)]);
  const c=P.flat().map((p,i)=>{if(fhold&&p===0){held.push(i);return 0;}return mod(p+a*key[j++]+b);});
  const res=scan(c,fhold,held,false,{a,b});controls.push({trial,trueA:a,trueB:b,held,trueLong:id(P[lens.indexOf(13)]),survivors:res.survivors.length,allWordSurvivors:res.survivors.filter(x=>!x.otherMissing).length,trueResult:res.survivors.find(x=>x.a===a&&x.b===b)});
 }
 const original=[],zeros=C.flatMap((x,i)=>x===0?[i]:[]);
 original.push(scan(C,false,[]));for(let m=0;m<1<<zeros.length;m++)original.push(scan(C,true,zeros.filter((_,j)=>(m>>j)&1)));
 return {lexicon:types.size,lengthCounts:bylen.map(x=>x.length),lens,controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp2-transcription.txt"];
console.log(JSON.stringify(affineReorderExperiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
