"use strict";
/** Exact p57 mixed word-edge key inverse; read-only Node22 CommonJS. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function mixedEdgeExperiment(corpus,native){
  const mod=x=>(x%29+29)%29, check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const runes=corpus.runes,textToGP=s=>[...s].filter(x=>runes.includes(x)).map(x=>runes.indexOf(x));
  const records=Object.fromEntries(native.sections.map(s=>[s.name,textToGP(s.source_text)]));
  const raw=native.sections.find(s=>s.name==="p57_parable").source_text;
  const words=raw.match(new RegExp("["+runes.join("")+"]+","gu")).map(textToGP);
  const p55=corpus.pages.find(p=>p.page===55).indices;
  check(words.length===20&&words.flat().join()===corpus.pages.find(p=>p.page===57).indices.join(),"p57 source");
  check(p55.length===76&&p55[0]===21,"p55 source");
  const trainNames=["0_welcome","0_koan_1","0_loss_of_divinity"],testNames=["0_warning","jpg107-167","p56_an_end"];
  const u=Array(29).fill(0),b=Array(841).fill(0),t=Array(24389).fill(0);
  let n=0;
  for(const name of trainNames){const a=records[name];n+=a.length;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}}
  const U=u.map(x=>(x+.5)/(n+14.5)),B=b.map((x,i)=>(x+12*U[i%29])/(u[Math.floor(i/29)]+12)),T=t.map((x,i)=>Math.log((x+9*B[i%841])/(b[Math.floor(i/29)]+9)));
  const logU=U.map(Math.log),logB=B.map(Math.log);
  const lp=(a,b,c)=>b===29?logU[c]:a===29?logB[b*29+c]:T[(a*29+b)*29+c];
  const score=a=>a.reduce((s,c,i)=>s+lp(a[i-2]??29,a[i-1]??29,c),0);
  /** @param {number[][]} w @param {boolean} wholePage */
  function graph(w,wholePage){
    const nodes=[[]];let start=0;
    for(let j=0;j<w.length;j++){
      const variants=wholePage&&j===0?[w[j]]:[w[j].slice(1),w[j].slice(0,-1)];
      const end=nodes.length;nodes.push([]);
      variants.forEach((v,e)=>{let cur=start;for(let i=0;i<v.length;i++){const dest=i===v.length-1?end:nodes.length;if(i!==v.length-1)nodes.push([]);nodes[cur].push({dest,k:v[i],word:j,edge:i===0?(wholePage&&j===0?"keep":e===0?"first":"last"):null});cur=dest;}});
      start=end;
    }return {nodes,end:start};
  }
  /** @param {number[]} cipher @param {{nodes:object[][],end:number}} g @param {number} sign @param {boolean} fhold */
  function invert(cipher,g,sign,fhold){
    let states=new Map([["0,29,29",{node:0,a:29,b:29,score:0,trace:null}]]),maxStates=1;
    for(const c of cipher){
      const next=new Map();
      function add(s,node,p,k,edge,word){const v=s.score+lp(s.a,s.b,p),id=[node,s.b,p].join(",");if(!next.has(id)||v>next.get(id).score)next.set(id,{node,a:s.b,b:p,score:v,trace:{prev:s.trace,p,k,edge,word}});}
      for(const s of states.values()){if(fhold&&c===0)add(s,s.node,0,null,null,null);for(const e of g.nodes[s.node]){const p=mod(c-sign*e.k);if(!fhold||p!==0)add(s,e.dest,p,e.k,e.edge,e.word);}}
      states=next;maxStates=Math.max(maxStates,states.size);
    }
    let best=null;for(const s of states.values())if((fhold||s.node===g.end)&&(!best||s.score>best.score))best=s;
    if(!best)return null;
    const tr=[];for(let q=best.trace;q;q=q.prev)tr.push(q);tr.reverse();
    const p=tr.map(x=>x.p),reconstructed=tr.map(x=>x.k===null?0:mod(x.p+sign*x.k));
    check(reconstructed.join()===cipher.join(),"original replay");check(Math.abs(score(p)-best.score)<1e-8,"score");
    return {sign,fhold,perRune:best.score/cipher.length,plain:p,translit:p.map(x=>corpus.translit[x]).join(""),holds:tr.flatMap((x,i)=>x.k===null?[i]:[]),choices:tr.filter(x=>x.edge!==null).map(x=>[x.word,x.edge]),consumed:tr.filter(x=>x.k!==null).length,maxStates};
  }
  /** @param {number[]} plain @param {number[][]} w @param {boolean} wholePage @param {number} sign @param {boolean} fhold @param {number} bits */
  function plant(plain,w,wholePage,sign,fhold,bits){const key=w.flatMap((v,j)=>wholePage&&j===0?v:((bits>>j)&1)?v.slice(1):v.slice(0,-1));let j=0;return plain.map(p=>fhold&&p===0?0:mod(p+sign*key[j++]));}
  let rng=0x33017576;
  function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
  const modes=[];
  for(const wholePage of [false,true]){
    const cipher=wholePage?p55:p55.slice(1),g=graph(words,wholePage),L=cipher.length;
    const original=[false,true].flatMap(fhold=>[-1,1].map(sign=>invert(cipher,g,sign,fhold))).filter(Boolean).sort((a,b)=>b.perRune-a.perRune);
    const controls=[];
    for(const name of testNames){const seq=records[name];for(let start=0;start+L<=seq.length;start+=L){const p=seq.slice(start,start+L);for(const fhold of [false,true]){const sign=rand(2)?1:-1,bits=rand(1<<20),c=plant(p,words,wholePage,sign,fhold,bits),out=invert(c,g,sign,fhold);check(out&&out.perRune>=score(p)/L-1e-9,"control path lost");controls.push({name,start,sign,fhold,recovered:out.plain.filter((x,i)=>x===p[i]).length,nativeScore:score(p)/L,selectedScore:out.perRune,holds:p.filter(x=>x===0).length});}}}
    const nulls=[];
    for(let trial=0;trial<256;trial++){const w=words.map(v=>{v=v.slice();for(let i=v.length-1;i>0;i--){const j=rand(i+1);[v[i],v[j]]=[v[j],v[i]];}return v;});const ng=graph(w,wholePage);nulls.push(Math.max(...[false,true].flatMap(fhold=>[-1,1].map(sign=>invert(cipher,ng,sign,fhold)?.perRune??-Infinity))));}
    nulls.sort((a,b)=>a-b);const nExceed=nulls.filter(x=>x>=original[0].perRune).length;
    modes.push({wholePage,L,original,controls,controlMinNative:Math.min(...controls.map(x=>x.nativeScore)),controlRecovered:controls.reduce((a,x)=>a+x.recovered,0),controlRunes:controls.length*L,null:{trials:nulls.length,exceed:nExceed,upperTail:(nExceed+1)/(nulls.length+1),median:nulls[128],min:nulls[0],max:nulls.at(-1)}});
  }
  const tiny=words.slice(0,3),g=graph(tiny,false),L=tiny.flat().length-3,c=p55.slice(0,L);
  for(const sign of [-1,1]){let max=-Infinity;for(let bits=0;bits<8;bits++){const k=tiny.flatMap((w,j)=>(bits>>j)&1?w.slice(1):w.slice(0,-1));max=Math.max(max,score(c.map((x,i)=>mod(x-sign*k[i])))/L);}check(Math.abs(max-invert(c,g,sign,false).perRune)<1e-9,"tiny exhaustive check");}
  return {wordLengths:words.map(x=>x.length),trainNames,trainRunes:n,testNames,modes};
}
const out=mixedEdgeExperiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"));
console.log(JSON.stringify(out,null,2));
