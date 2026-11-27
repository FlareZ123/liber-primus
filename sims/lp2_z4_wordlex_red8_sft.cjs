"use strict";
const fs=require("node:fs");
function experiment(raw){
 const gp=JSON.parse(raw[0]),f=JSON.parse(raw[1]),n=JSON.parse(raw[2]),lex=new Map(),runes=new Map(gp.runes.map((r,i)=>[r,i])),compact="0123456789abcdefghijklmnopqrs",keys=[f.red8_key.gp29_indices];
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),from=s=>Array.from(s,x=>x.charCodeAt(0)-65),text=w=>from(w).map(x=>gp.translit[x]).join("");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function normalize(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!q)return null;a.push(q.i);j+=q.t.length;}return id(a);}
 const add=(w,c)=>{if(w&&w.length<=24)lex.set(w,(lex.get(w)||0)+c);};
 for(const l of raw[3].split(/\r?\n/)){let m=l.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const a=[...new Set([normalize(m[1],false),normalize(m[1],true)])].filter(Boolean);for(const w of a)add(w,+m[2]/a.length);}
 const native=n.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,x=>runes.get(x))))}));
 for(const s of native)for(const w of s.words)add(w,1);
 const total=[...lex.values()].reduce((a,b)=>a+b,0),trie={ch:new Map()};
 for(const [w,c] of lex){let t=trie;for(const p of from(w)){if(!t.ch.has(p))t.ch.set(p,{ch:new Map()});t=t.ch.get(p);}t.word=w;t.score=Math.log(c/total);}
 const p54=f.p54.body_groups,p55=f.p55.groups,groups=p54.slice(0,-1).concat(p54.at(-1)+p55[0],p55.slice(1)).map(w=>id(Array.from(w,x=>compact.indexOf(x))));
 if(groups.length!==64||from(groups.join("")).join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join())throw Error("physical groups");
 function make(K){
  const m=36,q=K.length,N=q*37,trans=Array.from({length:N},(_,s)=>Array.from({length:29},(_,p)=>{let t=Math.floor(s/37),prev=s%37,c=(p+K[t])%m;for(let a=0;c===prev;a++){if(a>=q)throw Error("cycle");t=(t+1)%q;c=(p+K[t])%m;}return [((t+1)%q)*37+c,c];}));
  const cache=new Map();let calls=0,nodes=0;
  function edges(s,C){let tag=s+"|"+C;if(cache.has(tag))return cache.get(tag);calls++;let out=new Map(),a=from(C);
   function walk(t,v,i){nodes++;if(t.word!==undefined&&i===a.length){const old=out.get(v);if(!old||t.score>old.score)out.set(v,{word:t.word,score:t.score});}for(const [p,u] of t.ch){const [w,c]=trans[v][p];if(c>=29)walk(u,w,i);else if(i<a.length&&c===a[i])walk(u,w,i+1);}}
   walk(trie,s,0);cache.set(tag,out);return out;
  }
  const better=(x,y)=>!y||x.cost<y.cost||(x.cost===y.cost&&x.score>y.score+1e-10);
  function put(A,s,x){if(better(x,A[s])){A[s]=x;return true;}return false;}
  function close(A){let queue=[],inq=new Uint8Array(N);for(let s=0;s<N;s++)if(A[s]){queue.push(s);inq[s]=1;}for(let h=0;h<queue.length;h++){const s=queue[h];inq[s]=0;const x=A[s];for(const [v,e] of edges(s,"")){const y={cost:x.cost,score:x.score+e.score,trace:{prev:x.trace,word:e.word,silent:true},origin:x.origin};if(put(A,v,y)&&!inq[v]){queue.push(v);inq[v]=1;}}}return A;}
  function encode(W,phase,prev=36){let s=phase*37+prev,groups=[],silent=0;for(const w of W){let C=[];for(const p of from(w)){let [v,c]=trans[s][p];s=v;if(c<29)C.push(c);}if(C.length)groups.push(id(C));else silent++;}return {groups,silent};}
  function best(A){let x=null,s=-1;for(let i=0;i<A.length;i++)if(A[i]&&better(A[i],x)){x=A[i];s=i;}return {x,s};}
  function decode(C,relax,cut,initial=null){
   let A=Array(N).fill(null),history=[];if(initial)A[initial.phase*37+initial.prev]={cost:0,score:0,trace:null,origin:initial.phase};else for(let t=0;t<q;t++)A[t*37+36]={cost:0,score:0,trace:null,origin:t};
   for(let i=0;i<C.length;i++){close(A);const a=best(A).x;if(!a)return {dead:i};let B=Array(N).fill(null);
    for(let s=0;s<N;s++){const x=A[s];if(!x)continue;for(const [v,e] of edges(s,C[i]))put(B,v,{cost:x.cost,score:x.score+e.score,trace:{prev:x.trace,word:e.word,silent:false,group:i},origin:x.origin});}
    if(relax){const z={cost:a.cost+1,score:a.score,trace:{prev:a.trace,word:null,group:i},origin:a.origin};for(let v=0;v<N;v++)if(v%37!==36)put(B,v,z);}
    A=B;const b=best(A);if(!b.x)return {dead:i};history.push(b.x.cost);
   }
   const {x,s}=best(A);if(!x)return {dead:C.length};let trace=[];for(let z=x.trace;z;z=z.prev)trace.push({word:z.word,silent:!!z.silent,group:z.group});trace.reverse();let W=trace.map(z=>z.word);
   if(!x.cost&&encode(W,x.origin,initial?initial.prev:36).groups.join("|")!==C.join("|"))throw Error("replay");
   return {cost:x.cost,score:x.score,phase:x.origin,state:s,fitCost:history[cut-1]??null,history,trace,W,preview:trace.map(z=>z.word===null?"[?]":(z.silent?"("+text(z.word)+")":text(z.word))).join(" "),stats:{calls,nodes}};
  }
  return {encode,decode,allStart(C){return C.map(w=>{let count=0;for(let s=0;s<N;s++)if(edges(s,w).size)count++;return count;});}};
 }
 function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){let e=[i+1];for(let j=0;j<b.length;j++)e.push(Math.min(e[j]+1,d[j+1]+1,d[j]+(a[i]!==b[j])));d=e;}return d[b.length];}
 let results=[];
 for(let k=0;k<keys.length;k++){let M=make(keys[k]);for(let j=5;j<9;j++){const p=(j*3+k)%keys[k].length,W=native[j].words,plant=M.encode(W,p,24),D=M.decode(plant.groups,false,Math.floor(plant.groups.length*2/3),{phase:p,prev:24});if(D.cost!==0)throw Error("control failed "+j);let truth=W.slice(),vis=plant.groups.length;
 // Terminal fully silent words are unobservable; truncate them for comparison.
 while(truth.length&&M.encode(truth.slice(0,-1),p,24).groups.length===vis)truth.pop();
 results.push({key:k,kind:"plant",name:native[j].name,groups:vis,runes:plant.groups.join("").length,silent:plant.silent,truePhase:p,phase:D.phase,wordEdit:edit(truth,D.W),runeEdit:edit(from(truth.join("")),from(D.W.join(""))),trueWords:truth.length,decodedWords:D.W.length,score:D.score/plant.groups.join("").length,preview:D.preview});}
 const allStart=M.allStart(groups);const D=M.decode(groups,true,47,{phase:0,prev:f.red8_key.enlarged_initial.gp29_index});results.push({key:k,kind:"original-red8",initial:{phase:0,prev:f.red8_key.enlarged_initial.gp29_index},groups:64,runes:299,fitCost:D.fitCost,minOOV:D.cost,history:D.history,score:D.score,preview:D.preview,trace:D.trace.map(z=>({...z,word:z.word===null?null:text(z.word)})),allStart,arbitraryStateNoLex:allStart.filter(x=>!x).length,arbitraryStateFitNoLex:allStart.slice(0,47).filter(x=>!x).length,stats:D.stats});}
 return {lexicon:lex.size,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
