'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(inputs,mode='absolute'){
  const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[3]);
  const map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
  const mod=x=>(x%29+29)%29, bit=x=>1<<x;
  function pop(x){let n=0;while(x){x&=x-1;n++}return n}
  const original=parse(inputs[1]).slice(0,2896);assert(String(original.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"canonical original");
  const red=parse(inputs[1].split("%")[7]).slice(-5);assert(red.flat().length===14&&String(red.flat())===String(gp.pages[7].indices.slice(194)),"p7 red packet");
  const R=red.map(w=>w.reduce((a,b)=>mod(a*b),1));assert(String(R)==="11,26,8,15,2","index products");
  const plus=R.reduce((a,x)=>a|bit(x),0),minus=R.reduce((a,x)=>a|bit(mod(-x)),0);
  const solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
  const cipherSections=inputs[6].split("$").map(parse);
  assert(solved[3].flat().length===780,"native KOAN1 input");solved[3]=cipherSections[3].map(w=>w.map(v=>mod(2-v)));assert(solved[3].flat().length===778,"native KOAN1 correction");
  function lexicon(excluded=-1,expand=false){
    const dict=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
    function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");
      function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):a==="IO"?alpha.get("IA"):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
    for(const l of inputs[2].split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
    for(const s of ["A","I","O"])variants(s);
    for(const [i,sec] of solved.entries())if(i!==excluded)for(const w of sec)add(w);
    const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
    for(const source of inputs.slice(4,6))for(let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]){const p=[];w=w.replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);p.push(t.i);w=w.slice(t.s.length)}add(p)}
    if(expand)for(const [len,d] of dict.entries())if(len>=5)for(const w of [...d.values()])for(let i=1;i<len-2;i++){if(w[i]===0||w[i+1]===0||w[i]===w[i+1])continue;const v=w.slice();[v[i],v[i+1]]=[v[i+1],v[i]];d.set(String(v),v)}
    return dict.map(d=>[...d.values()]);
  }
  const bankList=[],bankIds=new Map();
  function choose(start,left,mask,fn){if(!left){fn(mask);return}for(let i=start;i<=29-left;i++)if(!(mask&bit(i)))choose(i+1,left-1,mask|bit(i),fn)}
  choose(0,5,0,m=>{bankIds.set(m,bankList.length);bankList.push(m)});
  assert(bankList.length===118755,"bank enumeration");
  function decodeMask(c,p){let mask=0,last=null;for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0)return -1}else{const k=mod(c[i]-p[i]);if(mode==='absolute')mask|=bit(k);else if(last!==null)mask|=bit(mod(k-last));last=k}}return mask}
  function asKey(m){return Array.from({length:29},(_,i)=>i).filter(i=>m&bit(i))}
  function display(w){return w.map(x=>gp.translit[x]).join("")}
  function assess(words,dict,truth=null,trueBank=null){
    const coverage=new Uint16Array(bankList.length),seen=new Int32Array(bankList.length);seen.fill(-1);
    const fixed={plus:0,minus:0,plusLong:0,minusLong:0},lenHist={},minHist={},zeroAnchors=[],anchors=[];let offs=0,wordCount=0;
    for(let wi=0;wi<words.length;wi++){
      const c=words[wi],len=c.length,start=offs;offs+=len;
      let plusOK=false,minusOK=false,min=30;const reqs=new Set();const long=len>=8;
      for(const p of dict[len]||[]){
        const m=decodeMask(c,p);if(m<0)continue;
        if((m&plus)===m)plusOK=true;if((m&minus)===m)minusOK=true;
        if(long){const k=pop(m);if(k<min)min=k;if(k<=5)reqs.add(m)}
        else if(plusOK&&minusOK)break;
      }
      fixed.plus+=Number(plusOK);fixed.minus+=Number(minusOK);
      if(!lenHist[len])lenHist[len]=[0,0,0];lenHist[len][0]++;lenHist[len][1]+=Number(plusOK);lenHist[len][2]+=Number(minusOK);
      if(!long)continue;
      wordCount++;fixed.plusLong+=Number(plusOK);fixed.minusLong+=Number(minusOK);
      minHist[min]=(minHist[min]||0)+1;
      const rec={wi,offset:start,len,min:min===30?null:min,reqs:reqs.size,plusOK,minusOK,cipher:display(c)};
      if(truth)rec.truth=display(truth[wi]);
      if(!reqs.size)zeroAnchors.push(rec);
      anchors.push(rec);
      for(const m of reqs)choose(0,5-pop(m),m,k=>{const id=bankIds.get(k);assert(id!==undefined,"exact superset");if(seen[id]!==wi){seen[id]=wi;coverage[id]++}});
    }
    let max=0;for(const x of coverage)if(x>max)max=x;let topCount=0;const top=[];
    for(let i=0;i<coverage.length;i++)if(coverage[i]===max){topCount++;if(top.length<10)top.push(asKey(bankList[i]))}
    const trueId=trueBank?bankIds.get(trueBank.reduce((m,x)=>m|bit(x),0)):undefined;
    return {words:words.length,runes:offs,lexicon:dict.reduce((a,d)=>a+d.length,0),fixed,lenHist,longAnchors:wordCount,minHist,zeroAnchors:zeroAnchors.length,examples:zeroAnchors.slice(0,12),maxCovered:max,topCount,top,minimumLongOOV:wordCount-max,sourcePlusRank:1+coverage.filter(x=>x>coverage[bankIds.get(plus)]).length,sourceMinusRank:1+coverage.filter(x=>x>coverage[bankIds.get(minus)]).length,trueBank:trueId===undefined?null:{coverage:coverage[trueId],rank:1+coverage.filter(x=>x>coverage[trueId]).length,key:trueBank},anchors};
  }
  function plant(words,key,seed){let s=seed>>>0,prev=-1,k=seed%29;const draw=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return key[(s>>>0)%key.length]};return words.map(w=>w.map(p=>{let c;if(p===0)c=0;else{let next=mode==='absolute'?draw():mod(k+draw());c=mod(p+next);if(c===prev){next=mode==='absolute'?draw():mod(k+draw());c=mod(p+next)}k=next}prev=c;return c}))}
  function recoverUnique(words,dict,key,truth){
    const bank=key.reduce((m,x)=>m|bit(x),0),stats={coveredWords:0,uniqueWords:0,exactUniqueWords:0,exactUniqueRunes:0,truthInCandidates:0,longCovered:0,longUnique:0,longExactUnique:0,longTruthInCandidates:0};
    for(let i=0;i<words.length;i++){const c=words[i],long=c.length>=8;let n=0,found=false,sole=null;
      for(const p of dict[c.length]||[]){const m=decodeMask(c,p);if(m<0||(m&bank)!==m)continue;n++;sole=p;if(String(p)===String(truth[i]))found=true}
      stats.coveredWords+=Number(n>0);stats.uniqueWords+=Number(n===1);stats.truthInCandidates+=Number(found);
      if(n===1&&found){stats.exactUniqueWords++;stats.exactUniqueRunes+=sole.length;assert(decodeMask(c,sole)>=0&&(decodeMask(c,sole)&bank)===decodeMask(c,sole),"exact inverse witness")}
      if(long){stats.longCovered+=Number(n>0);stats.longUnique+=Number(n===1);stats.longExactUnique+=Number(n===1&&found);stats.longTruthInCandidates+=Number(found)}
    }
    return stats;
  }
  const base=lexicon(-1,false),exp=lexicon(-1,true);
  const results={base:assess(original,base),expanded:assess(original,exp),controls:[]};
  for(const [i,key,seed] of [[1,R,3301],[3,[1,7,14,22,28],1033]]){const P=solved[i],C=plant(P,key,seed),dict=lexicon(i,true);const r=assess(C,dict,P,key);const unique=r.topCount===1?recoverUnique(C,dict,r.top[0],P):null;results.controls.push({name:native.sections[i].name,seed,...r,unique})}
  return {mode,R,red,bankCount:bankList.length,...results};
}
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/transcriptions/lp1_wulfic_canonical.txt"
];
const mode=process.argv[2]||'absolute';
if(!['absolute','increment'].includes(mode))throw Error('mode must be absolute or increment');
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),mode),null,2));
