"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,book,plants){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);


 const K=book.key,nK=K.length,mk=x=>(x%nK+nK)%nK;
 const total=[...vocab.values()].reduce((a,b)=>a+b+1,0),lf=Math.log(total),pr=Array.from({length:25},()=>new Map()),scores=new Map();
 for(const [w,f] of vocab){let v=Math.log(f+1)-lf;scores.set(w,v);for(let i=0;i<w.length;i++){let p=w.slice(0,i),m=pr[w.length];if(v>(m.get(p)??-Infinity))m.set(p,v);}}
 const ws=w=>scores.get(w)??(-18-3.5*w.length), upper=(w,l)=>Math.max(pr[l].get(w)??-Infinity,-18-3.5*l);
 function solve(C,N,sign,stride,width=500,known=null){
  const cs=[0];for(const c of C)cs.push(cs.at(-1)+gp.prime[c]);let knownEnds=[];if(known){let e=0;for(const l of known){e+=l;knownEnds.push(e);}}
  let beam=[{j:0,end:0,J:0,nextJ:0,queue:[],pref:"",v:0,rank:0,parent:null}],counts=[];
  for(let i=0;i<N;i++){
   let cand=new Map();
   function ensure(s,j,fn){
    if(j-i>16||j>=C.length)return;
    if(j<s.end){fn(s);return;}
    const start=s.end,J=s.nextJ,ends=known?[knownEnds.find(e=>e>start)]:Array.from({length:Math.min(24,C.length-start)},(_,k)=>start+k+1);
    for(const end of ends){if(!end||end>C.length)continue;ensure({...s,end,J,nextJ:mk(J+sign*((cs[end]-cs[start])%29)),queue:[...s.queue,end]},j,fn);}
   }
   function emit(s,p,j,pen,skips,origin){
    const end=s.queue[0];if(end<=i)throw Error("queue");
    let pref=s.pref+String.fromCharCode(65+p),v=s.v+pen,queue=s.queue,word=null;
    if(end===i+1){word=pref;v+=ws(pref);pref="";queue=queue.slice(1);}
    const rank=v+(pref?upper(pref,pref.length+end-i-1):0),state={...s,j:j+1,pref,v,queue,rank,parent:origin,p,word,skips};
    const id=[state.j,state.end,state.J,state.nextJ,queue.join(","),pref].join("|");if(rank>(cand.get(id)?.rank??-Infinity))cand.set(id,state);
   }
   function proposals(s,j,p,pen,skips,origin){
    ensure(s,j,t=>{
     const k=K[mk(j+t.J)],x=mod(C[i]-k),prev=i?C[i-1]:-1;
     if(p===null||p===x)emit(t,x,j,pen+(C[i]===prev?Math.log(.17):0),skips,origin);
     if(i&&skips<5){const q=mod(prev-k);if(p===null||p===q)proposals(t,j+stride,q,pen+Math.log(.83),skips+1,origin);}
    });
   }
   for(const s of beam)proposals(s,s.j,null,0,0,s);
   counts.push(cand.size);beam=[...cand.values()].sort((a,b)=>b.rank-a.rank).slice(0,width);
   if(!beam.length)throw Error("empty beam "+i);
  }
  const terminal=beam[0],future=terminal.queue;let a=terminal,score=a.rank,words=[],P=[],skips=[],bounds=[],n=N,tail=a.pref;
  while(a.parent){P.push(a.p);skips.push(a.skips);if(a.word){words.push(a.word);bounds.push(n);}a=a.parent;n--;}
  P.reverse();skips.reverse();words.reverse();bounds.reverse();
  let J=0,start=0,kt=[];for(const end of [...bounds,...future]){for(let j=start;j<end;j++)kt.push(K[mk(j+J)]);J=mk(J+sign*((cs[end]-cs[start])%29));start=end;}let j=0;for(let i=0;i<N;i++){for(let s=0;s<skips[i];s++){if(mod(P[i]+kt[j])!==C[i-1])throw Error("reject replay");j+=stride;}if(mod(P[i]+kt[j])!==C[i])throw Error("emit replay");j++;}if(j!==terminal.j)throw Error("cursor replay");
  return {P,skips,bounds,future,replay:true,score:score/N,plaintext:[...words,tail].filter(Boolean).map(w=>[...w].map(c=>gp.translit[c.charCodeAt(0)-65]).join("")).join(" "),counts};
 }
 const controls=[];
 for(const p of plants.plants.filter(p=>!p.failed&&p.realSkips>0)){
  const truth=p.P.slice(0,p.need),lens=p.lens;let e=0,ends=lens.map(l=>e+=l).filter(x=>x<=p.need);
  for(const known of [true,false]){
   const a=solve(p.C,p.need,p.sgn,p.stride,known?100:500,known?lens:null),correct=a.P.filter((v,i)=>v===truth[i]).length;
   controls.push({donor:p.donor,sgn:p.sgn,stride:p.stride,known,correct,n:p.need,F1:2*a.bounds.filter(b=>ends.includes(b)).length/(ends.length+a.bounds.length),trueSkips:p.skips.slice(0,p.need),...a});
  }
 }
 
 const originals=[],choices=[];
 if(controls.filter(c=>!c.known).every(c=>c.correct/c.n>=.95&&c.F1>=.90)){
   const C=gp.pages[0].indices;
   for(const sign of [-1,1])for(const stride of [1,2])choices.push({sign,stride,...solve(C,80,sign,stride)});
   choices.sort((a,b)=>b.score-a.score);const {sign,stride}=choices[0];
   for(let page=1;page<=5;page++)originals.push({page,sign,stride,...solve(gp.pages[page].indices,80,sign,stride)});
 }
 return {vocab:vocab.size,beam:500,drift:16,maxSkipsPerRune:5,controls,choices,originals};

}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json")),JSON.parse(read("im-results/lp2-g3-a3-nonlocal-fixedpoint-plants.json"))),null,2));
