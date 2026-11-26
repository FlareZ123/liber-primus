"use strict";
// Latent boundaries and collision-skip receiver for pinned R38/R39 semantic A3; not an all-path solver.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,variants,opts={}){
 const gp=JSON.parse(raw[0]),K=JSON.parse(raw[1]).key,gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,mk=x=>(x%K.length+K.length)%K.length,key=w=>String.fromCharCode(...w.map(x=>65+x));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return(t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();function add(w,f){if(w&&w.length&&w.length<=24){const k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0));}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2]);}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);
 const total=[...vocab.values()].reduce((a,b)=>a+b+1,0),lf=Math.log(total),pr=Array.from({length:25},()=>new Map()),scores=new Map();
 for(const [w,f] of vocab){const v=Math.log(f+1)-lf;scores.set(w,v);for(let i=0;i<w.length;i++){const p=w.slice(0,i),m=pr[w.length];if(v>(m.get(p)??-Infinity))m.set(p,v);}}
 const ws=w=>scores.get(w)??(-18-3.5*w.length),upper=(w,l)=>Math.max(pr[l].get(w)??-Infinity,-18-3.5*l);
 function jumps(v,s,sign,n){const d=variants[v],J=[];let j=0;for(let k=0;k<n;k++){j=mk(j+sign*d[(s+k)%d.length]);J.push(j);}return J}
 function makePlant(donor,offset,v,s,sign,N,seed){
  const src=donors[donor],start=Math.floor(src.length*.8)+offset,words=src.slice(start,start+150),P=words.flat(),ends=[];let e=0;for(const w of words)ends.push(e+=w.length);
  const J=jumps(v,s,sign,words.length),kt=[];let st=0;for(let k=0;k<ends.length;k++){for(let j=st;j<ends[k];j++)kt.push(K[mk(j+J[k])]);st=ends[k]}
  let rnd=seed;const random=()=>{rnd^=rnd<<13;rnd^=rnd>>>17;rnd^=rnd<<5;return(rnd>>>0)/4294967296;};
  const C=[],skips=[];let j=0;for(let i=0;i<Math.min(P.length,N+32);i++){let n=0,c=mod(P[i]+kt[j]);while(i&&c===C[i-1]&&random()<.83){j++;n++;c=mod(P[i]+kt[j]);}C.push(c);j++;skips.push(n);}
  return {donor,offset,v,s,sign,N,seed,P:P.slice(0,N),ends:ends.filter(e=>e<=N),C,skips:skips.slice(0,N)};
 }
 function solve(C,N,v,s,sign,width){
  const J=jumps(v,s,sign,C.length+2);
  let beam=[{j:0,end:0,k:0,queue:[],pref:"",v:0,rank:0,parent:null}],counts=[];
  for(let i=0;i<N;i++){
   const cand=new Map();
   function ensure(st,j,fn){if(j-i>16||j>=C.length)return;if(j<st.end){fn(st);return;}const start=st.end;for(let l=1;l<=Math.min(24,C.length-start);l++){const end=start+l;ensure({...st,end,k:st.k+1,queue:[...st.queue,end]},j,fn);}}
   function emit(st,p,j,pen,skips,origin){const end=st.queue[0];if(end<=i)throw Error("queue");let pref=st.pref+String.fromCharCode(65+p),v=st.v+pen,queue=st.queue,word=null;
    if(end===i+1){word=pref;v+=ws(pref);pref="";queue=queue.slice(1);}
    const rank=v+(pref?upper(pref,pref.length+end-i-1):0),state={...st,j:j+1,pref,v,queue,rank,parent:origin,p,word,skips};
    const id=[state.j,state.end,state.k,queue.join(","),pref].join("|");if(rank>(cand.get(id)?.rank??-Infinity))cand.set(id,state);
   }
   function proposals(st,j,p,pen,skips,origin){ensure(st,j,t=>{const k=K[mk(j+J[t.k-1])],x=mod(C[i]-k),prev=i?C[i-1]:-1;
    if(p===null||p===x)emit(t,x,j,pen+(C[i]===prev?Math.log(.17):0),skips,origin);
    if(i&&skips<5){const q=mod(prev-k);if(p===null||p===q)proposals(t,j+1,q,pen+Math.log(.83),skips+1,origin);}
   });}
   for(const st of beam)proposals(st,st.j,null,0,0,st);
   counts.push(cand.size);beam=[...cand.values()].sort((a,b)=>b.rank-a.rank).slice(0,width);if(!beam.length)return{failed:true,i};
  }
  if(opts.screen)return {score:beam[0].rank/N};
  const t=beam[0],future=t.queue;let st=t,words=[],P=[],skips=[],bounds=[],n=N,tail=t.pref;while(st.parent){P.push(st.p);skips.push(st.skips);if(st.word){words.push(st.word);bounds.push(n);}st=st.parent;n--;}
  P.reverse();skips.reverse();words.reverse();bounds.reverse();
  let start=0,kt=[];for(const [k,end] of [...bounds,...future].entries()){for(let j=start;j<end;j++)kt.push(K[mk(j+J[k])]);start=end;}
  let j=0;for(let i=0;i<N;i++){for(let z=0;z<skips[i];z++){if(mod(P[i]+kt[j])!==C[i-1])throw Error("reject replay");j++;}if(mod(P[i]+kt[j])!==C[i])throw Error("emit replay");j++;}
  if(j!==t.j)throw Error("cursor replay");
  return {P,skips,bounds,future,replay:true,score:t.rank/N,plaintext:[...words,tail].filter(Boolean).map(w=>[...w].map(c=>gp.translit[c.charCodeAt(0)-65]).join("")).join(" "),maxCandidates:Math.max(...counts)};
 }
 const width=opts.width??500,N=opts.N??80;
 const configs=[[0,5,"A-R29",0,1,0x6112801],[1,11,"B-R28",0,-1,0x6112802],[2,13,"L-R29",0,1,0x6112803]];
 const controls=opts.noControls?[]:configs.map(c=>{const p=makePlant(c[0],c[1],c[2],c[3],c[4],N,c[5]),a=solve(p.C,N,p.v,p.s,p.sign,width);return {...p,...a,truth:p.P,trueBounds:p.ends,trueSkips:p.skips,correct:a.P?.filter((x,i)=>x===p.P[i]).length??0,F1:2*(a.bounds?.filter(x=>p.ends.includes(x)).length??0)/(p.ends.length+(a.bounds?.length??0))}});
 if(!opts.noControls&&controls.some(c=>c.correct/c.N<.95||c.F1<.9||c.trueSkips.reduce((a,b)=>a+b,0)===0))return{vocab:vocab.size,keyLength:K.length,controls,gate:false};
 if(opts.controlsOnly)return{vocab:vocab.size,keyLength:K.length,controls,gate:true};
 const all=opts.configs??Object.keys(variants).flatMap(v=>[-1,1].map(sign=>({v,sign,s:0})));
 const plant=opts.plant?makePlant(...opts.plant):null;
 const C=plant?plant.C:gp.pages[opts.page??0].indices,results=all.map(x=>({...x,...solve(C,N,x.v,x.s,x.sign,width)}));results.sort((a,b)=>(b.score??-Infinity)-(a.score??-Infinity));
 const top=results[0],held=opts.noHeld?[]:[1,2,3,4,5].map(page=>({page,v:top.v,s:top.s,sign:top.sign,...solve(gp.pages[page].indices,N,top.v,top.s,top.sign,width)}));
 return{vocab:vocab.size,keyLength:K.length,N,width,controls,gate:true,results,held,plant};
}
module.exports=experiment;
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r38-r39-lp1-semantic-keys.json")).variants),null,2));}
