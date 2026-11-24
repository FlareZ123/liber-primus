"use strict";
// Agent 10 — historical Wheatstone 30:29 GP29 key recovery, read-only.
const fs=require("node:fs");
const path=require("node:path");
function experiment(d,raw,lextext,nativeData){
  const N=29,M=30,mod=(x,n=N)=>((x%n)+n)%n,idx=new Map(d.runes.map((x,i)=>[x,i]));
  const alphabet=Array.from({length:N},(_,i)=>i),allMask=(1<<N)-1,nonzero=allMask^1;
  const bits=n=>{let a=[];for(let i=0;i<N;i++)if(n&(1<<i))a.push(i);return a};
  function parse(s){let out=[],w=[],p=0;for(const ch of s){if(idx.has(ch)){w.push(idx.get(ch));p++}else if(ch!=="%"&&ch!=="/"&&!/\s/.test(ch)){if(w.length)out.push({w,start:p-w.length});w=[]}}if(w.length)out.push({w,start:p-w.length});return out}
  const orig=parse(raw.split("%").slice(0,55).join("%"));
  const native=nativeData.sections.map(s=>({name:s.name,words:[...s.source_text.matchAll(/[\u16a0-\u16ff]+/gu)].map(m=>[...m[0]].map(x=>idx.get(x)))}));
  if(orig.length!==2896||orig.flatMap(x=>x.w).length!==12956)throw Error("source geometry");
  const map=[["ING",21],["NG",21],...d.translit.map((x,i)=>[x==="IA"?"IO":x,i]),["IA",27]].sort((a,b)=>b[0].length-a[0].length);
  function gp(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");let out=[];while(w){let a=map.find(x=>w.startsWith(x[0]));if(!a)return null;out.push(a[1]);w=w.slice(a[0].length)}return out}
  const lex=new Map();for(const w of lextext.matchAll(/^([a-z]+)\s+\d+$/gm)){const a=gp(w[1]);if(a)lex.set(a.join(","),a)}for(const s of native)for(const a of s.words)lex.set(a.join(","),a);
  function prep(a,last=-1){let b=[];for(const x of a){if((b.length?b.at(-1):last)===x)b.push(29);b.push(x)}return b}
  function sig(a){let m=new Map();return a.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)}).join(",")}
  function outer(dir,gap){let ring=dir===1?alphabet.slice():alphabet.slice().reverse();ring.splice(gap,0,29);let loc=Array(M);ring.forEach((x,i)=>loc[x]=i);return {ring,loc}}
  function path(p,loc){let z=[0];for(let i=1;i<p.length;i++){let s=mod(loc[p[i]]-loc[p[i-1]],M);if(!s)throw Error("repeat");z.push(mod(z.at(-1)+s))}return z}
  function build(loc){const m=new Map();for(const a of lex.values()){const b=prep(a);for(const p of [b,[29,...b]]){const z=path(p,loc),s=sig(z);if(!m.has(s))m.set(s,[]);m.get(s).push(z)}}return m}
  function keyrecover(words,m){
    const masks=new Int32Array(N*N).fill(nonzero),witness=new Int32Array(N*N).fill(-1),constraints=[],miss=[];
    let work=0;
    for(let wi=0;wi<words.length;wi++){const w=words[wi].w,z=m.get(sig(w));if(!z){miss.push(wi);continue}
      let pos=new Map();w.forEach((x,i)=>{if(!pos.has(x))pos.set(x,i)});let symbols=[...pos.keys()].sort((a,b)=>a-b),edges=[];
      for(let j=0;j<symbols.length;j++)for(let k=j+1;k<symbols.length;k++){let a=symbols[j],b=symbols[k];edges.push({a,b,e:a*N+b,i:pos.get(a),j:pos.get(b)})}
      if(edges.length)constraints.push({wi,edges,candidates:z});
    }
    // All pair-difference sets are necessary conditions, so an empty intersection is a certificate.
    for(let pass=0;pass<12;pass++){let changed=0;
      for(const t of constraints){
        const rem=t.candidates.filter(z=>t.edges.every(e=>masks[e.e]&(1<<mod(z[e.j]-z[e.i]))));
        if(!rem.length)return {status:"inconsistent",miss:miss.length,firstMiss:miss.slice(0,5),pass,word:t.wi,work,previous:t.edges.map(e=>({a:e.a,b:e.b,mask:bits(masks[e.e]),word:witness[e.e]})).filter(x=>x.word>=0).slice(0,12)};
        t.candidates=rem;
        for(const e of t.edges){let u=0;for(const z of rem){u|=1<<mod(z[e.j]-z[e.i]);work++}let old=masks[e.e];masks[e.e]&=u;if(masks[e.e]!==old){changed++;witness[e.e]=t.wi}}
      }
      if(!changed)break;
    }
    let key=Array(N).fill(null);key[0]=0;for(let pass=0;pass<N;pass++){let n=0;for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){let q=masks[a*N+b];if(q&&(q&(q-1))===0){let v=31-Math.clz32(q);if(key[a]!==null&&key[b]===null){key[b]=mod(key[a]+v);n++}if(key[b]!==null&&key[a]===null){key[a]=mod(key[b]-v);n++}if(key[a]!==null&&key[b]!==null&&mod(key[b]-key[a])!==v)return {status:"cycle contradiction",miss:miss.length}}}if(!n)break}
    return {status:key.every(x=>x!==null)&&new Set(key).size===N?"key":"partial",miss:miss.length,firstMiss:miss.slice(0,5),known:key.filter(x=>x!==null).length,key,work};
  }
  function randomKey(seed){let a=alphabet.slice();let x=seed>>>0;for(let i=N-1;i;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a.map(v=>mod(v-a[0]))}
  function encode(words,loc,key,initial){const inv=Array(N);key.forEach((p,c)=>inv[p]=c);let a=loc[29],b=initial,last=29;let out=[];for(const w of words){const p=prep(w,last);last=w.at(-1);let c=p.map(v=>{let target=loc[v],s=mod(target-a,M);if(!s)throw Error("repeat enc");a=target;b=mod(b+s);return inv[b]});out.push({w:c})}return out}
  function decode(words,ring,loc,key,initial){let a=loc[29],b=initial,last=29,plain=[];for(const t of words){let p=t.w.map(c=>{let target=key[c],s=mod(target-b)||N;b=target;a=mod(a+s,M);return ring[a]});let w=p.filter(x=>x!==29);if(!w.length||prep(w,last).join(",")!==p.join(","))return null;last=w.at(-1);plain.push(w)}return plain}
  const starts=[0,3,8,15,23,27,33,40,54,56].map(p=>d.pages.slice(0,p).reduce((s,x)=>s+x.indices.length,0));
  const chapterWords=starts.slice(0,-1).map((s,i)=>orig.filter(x=>x.start>=s&&x.start<starts[i+1]));
  let scans=[],originalCases=[];
  for(const dir of [1,-1])for(let gap=0;gap<N;gap++){
    const {ring,loc}=outer(dir,gap),m=build(loc);let misses=0,first=[];for(let i=0;i<orig.length;i++){if(!m.has(sig(orig[i].w))){misses++;if(first.length<3)first.push([i,orig[i].start,orig[i].w])}}
    scans.push({dir,gap,misses,first});
    const a=keyrecover(chapterWords[0],m),b=keyrecover(chapterWords[3],m);
    originalCases.push({dir,gap,opening:a,withheld:b});
  }
  const {ring,loc}=outer(1,0),m=build(loc);
  let plants=[];
  for(let n=0;n<3;n++){let key=randomKey(0x3301abcd+n*12345),initial=(7+n*9)%N,train=native.slice(n,n+4).flatMap(x=>x.words),hold=native.slice(7).flatMap(x=>x.words),words=[...train,...hold],enc=encode(words,loc,key,initial),recovered=keyrecover(enc.slice(0,train.length),m);
    let ok=false,valid=[];
    if(recovered.status==="key"){for(let init=0;init<N;init++){let p=decode(enc.slice(0,train.length),ring,loc,recovered.key,init);if(p&&p.every(w=>lex.has(w.join(","))))valid.push(init)}
      if(valid.length===1){let p=decode(enc,ring,loc,recovered.key,valid[0]);ok=!!p&&JSON.stringify(p)===JSON.stringify(words)&&JSON.stringify(encode(p,loc,recovered.key,valid[0]))===JSON.stringify(enc)}
    }
    plants.push({n,trainingWords:train.length,heldWords:hold.length,trainingRunes:train.flat().length,heldRunes:hold.flat().length,miss:recovered.miss,status:recovered.status,known:recovered.known,keyExact:JSON.stringify(recovered.key)===JSON.stringify(key),trueInitial:initial,validInitial:valid,exactFullAndHeldout:ok});
  }
  // Fixed independently chart-ordered inner alphabet, actual book inverse with all unknown initial states.
  let direct=[];
  for(const dir of [1,-1])for(const gap of [0]){const {ring,loc}=outer(dir,gap);for(const rev of [false,true]){const key=alphabet.map(x=>mod(rev?-x:x));let best=0,complete=0;for(let initial=0;initial<N;initial++){let p=decode(orig,ring,loc,key,initial);if(p){complete++;best=Math.max(best,p.filter(w=>lex.has(w.join(","))).length)}}direct.push({dir,gap,rev,complete,best})}}
  scans.sort((a,b)=>a.misses-b.misses);
  const summarize=k=>({status:k.status,miss:k.miss,word:k.word,known:k.known,pass:k.pass,firstMiss:k.firstMiss});
  const out={lex:lex.size,origWords:orig.length,chapterWords:chapterWords.map(x=>x.length),plants,scans,best:scans.slice(0,4),origStatusCounts:originalCases.reduce((a,x)=>{let k=x.opening.status+"/"+x.withheld.status;a[k]=(a[k]||0)+1;return a},{}),fixedChart:originalCases.filter(x=>x.gap===0).map(x=>({dir:x.dir,opening:x.opening,withheld:x.withheld})),direct,sourceKeyGate:originalCases.map(x=>({dir:x.dir,gap:x.gap,opening:summarize(x.opening),withheld:summarize(x.withheld)}))};return out
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
console.log(JSON.stringify(result,null,2));
