"use strict";
/** Public word-history clock: original-source, all-secret phase gate. Node.js 22 / CommonJS. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
function experiment(read,assert) {
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const raw=read("resources/liber-primus/lp2-transcription.txt").split("%");
  const known=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
  const idx=new Map(corpus.runes.map((v,i)=>[v,i]));
  const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>idx.get(c)));
  const source=parse(raw.slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
  const flat=source.flat();
  assert(flat.length===12956 && source.length===2896,"original length");
  assert(JSON.stringify(flat)===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),"original exact rune tape");
  const native=known.sections.flatMap(s=>parse(s.source_text));
  assert(native.length===740 && native.flat().length===2979,"solved source count");
  const p57=parse(raw[56].replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
  assert(JSON.stringify(p57.flat())===JSON.stringify(corpus.pages[57].indices),"p57");
  const latin=s=>{
    const lookup=new Map(corpus.translit.map((v,i)=>[v,i]));
    const pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
    return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
      const result=[];
      for(let j=0;j<w.length;){
        const pair=pairs.find(x=>w.startsWith(x,j));
        let c=pair||w[j];j+=c.length;
        if(c==="ING")c="NG";
        if(c==="K"||c==="Q")c="C";
        if(c==="V")c="U";
        if(c==="Z")c="S";
        assert(lookup.has(c),"Latin token");
        result.push(lookup.get(c));
      }return result;
    });
  };
  const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
  // Fixed exploratory nonlinear public recurrence. All 29 initial states granted.
  // Every word uses phases s+j mod29; update ONLY after full printed word.
  const phase=(words,seed)=>{
    const out=new Uint8Array(words.flat().length);
    let s=seed,k=0;
    for(const w of words){
      for(let j=0;j<w.length;j++)out[k++]=(s+j)%29;
      s=(s*s+w.length)%29;
    }return out;
  };
  const phases=Array.from({length:29},(_,s)=>phase(source,s));
  const singleton=source.map(w=>w.length).reduce((a,n)=>{if(n===1)a.offsets.push(a.k);a.k+=n;return a;},{offsets:[],k:0}).offsets;
  assert(singleton.length===83,"singleton count");
  const stats=(x,p,offsets)=>{
    const h=new Int32Array(841),one=new Int32Array(841);
    let M=0;
    for(let i=0;i<x.length;i++){const k=p[i]*29+x[i];M+=h[k]++;}
    for(const i of offsets)one[p[i]*29+x[i]]++;
    let top3=0,singleCollisions=0;
    for(let s=0;s<29;s++){
      const row=Array.from(one.slice(s*29,(s+1)*29)).sort((a,b)=>b-a);
      top3+=row[0]+row[1]+row[2];
      singleCollisions+=row.reduce((n,v)=>n+v*(v-1)/2,0);
    }
    return {M,top3,singleCollisions};
  };
  const src=phases.map((p,seed)=>({seed,...stats(flat,p,singleton)}));
  const maxM=Math.max(...src.map(x=>x.M));
  const minM=Math.min(...src.map(x=>x.M));
  const maxTop3=Math.max(...src.map(x=>x.top3));
  const uniqueTrajectories=Array.from({length:20},(_,j)=>{
    let o=source.slice(0,j).reduce((n,w)=>n+w.length,0);
    return new Set(phases.map(p=>p[o])).size;
  });
  const donorSets=[
    ["solved-Cicada",native],
    ["Gibran",latin(read("resources/control/gibran_prophet_58585.txt"))],
    ["Emerson",latin(read("resources/control/emerson_essays_2944.txt"))],
    ["Shakespeare",latin(read("resources/control/shakespeare_first300k.txt"))]
  ];
  const summaries=[];
  for(let d=0;d<donorSets.length;d++){
    const [name,words]=donorSets[d];
    const pools=Array.from({length:15},()=>[]);
    for(const w of words)if(w.length<15)pools[w.length].push(w);
    const missing=Array.from(new Set(source.map(w=>w.length))).filter(n=>!pools[n].length);
    // Retain original clock; exclude unmatched slots identically from both tapes.
    const keep=[];
    let k=0;
    for(const w of source){for(let j=0;j<w.length;j++)if(pools[w.length].length)keep.push(k+j);k+=w.length;}
    const index=new Map(keep.map((k,i)=>[k,i]));
    const keptSingleton=singleton.filter(k=>index.has(k)).map(k=>index.get(k));
    const pp=phases.map(p=>Uint8Array.from(keep,k=>p[k]));
    const observed=pp.map(p=>stats(keep.map(k=>flat[k]),p,keptSingleton));
    const cap=Math.max(...observed.map(x=>x.M));
    const singleCap=Math.max(...observed.map(x=>x.top3));
    const random=rng(0x33012482+d),trials=256;
    let lowest=Infinity,highest=0,compatible=0,minNativeAIO=Infinity,singleCompatible=0;
    for(let t=0;t<trials;t++){
      const plant=source.flatMap(w=>{const pool=pools[w.length];return pool.length?pool[random()%pool.length]:[];});
      const m=Math.min(...pp.map(p=>stats(plant,p,keptSingleton).M));
      lowest=Math.min(lowest,m);highest=Math.max(highest,m);if(m<=cap)compatible++;
      const aio=keptSingleton.reduce((n,i)=>n+Number([3,10,24].includes(plant[i])),0);
      minNativeAIO=Math.min(minNativeAIO,aio);if(aio<=singleCap)singleCompatible++;
    }
    summaries.push({name,missing,matchedRunes:keep.length,originalMaxM:cap,minimumNativeM:lowest,maximumNativeMinM:highest,trials,compatible,originalMaxAIO:singleCap,minNativeAIO,singleCompatible});
  }
  const random=rng(0x24823301);
  const maps=Array.from({length:29},()=>{const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=random()%(j+1);[a[j],a[k]]=[a[k],a[j]];}return a;});
  const inv=maps.map(a=>{const b=[];a.forEach((v,i)=>b[v]=i);return b;});
  const roundtrip=words=>{
    const p=phase(words,17),x=words.flat(),c=x.map((v,i)=>maps[p[i]][v]),y=c.map((v,i)=>inv[p[i]][v]);
    assert(JSON.stringify(y)===JSON.stringify(x),"all-key plant inverse");
    assert(stats(x,p,[]).M===stats(c,p,[]).M,"partition collision invariant");
    return x.length;
  };
  const pools=Array.from({length:15},()=>[]);
  for(const w of native)if(w.length<15)pools[w.length].push(w);
  assert(source.every(w=>pools[w.length].length),"native all lengths");
  return {clock:"s_next=(s*s+L) mod29; phase=(s+j) mod29",seeds:29,originalMinM:minM,originalMaxM:maxM,originalMaxAIO:maxTop3,uniqueStatesAtFirst20WordStarts:uniqueTrajectories,allSeedResults:src,donorSummaries:summaries,plantFull:roundtrip(source.map(w=>pools[w.length][random()%pools[w.length].length])),plantP57:roundtrip(p57)};
}
console.log(JSON.stringify(experiment(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"),assert.ok),null,2));
