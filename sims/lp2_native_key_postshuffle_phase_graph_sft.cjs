"use strict";
// Issue #2678: native-key exact whole-group phase graph.
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29;
 const keys={WELCOME:[23,10,1,10,9,10,16,26],KOAN:[0,10,4,0,1,19,0,18,4,18,9,0,18]};
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 const extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);t=t.slice(a?a.index+a[0].length:0,b?b.index:t.length);return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let p=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(q,"unmapped "+w);p.push(q.i);j+=q.t.length}return p})}
 function words(t,sep){let out=[],w=[];for(const x of t){if(ix.has(x))w.push(ix.get(x));else if(sep(x)&&w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
 const donors=raw.slice(4).map(native),dict=new Set();
 for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)dict.add(id(w));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of words(s.source_text,()=>true))dict.add(id(w));
 function encode(P,K,s){let C=[];for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+K[s]));s=(s+1)%K.length}}return {C,s}}
 const w=gold.sections.find(s=>s.name==="0_welcome"),k=gold.sections.find(s=>s.name==="jpg107-167");
 const wC=extract(raw[2].split("%").slice(1,3).join("%")),kC=extract(raw[2].split("$")[5]);
 assert(id(encode(extract(w.source_text),keys.WELCOME,0).C)===id(wC),"WELCOME replay");
 assert(id(encode(extract(k.source_text),keys.KOAN,0).C)===id(kC),"KOAN replay");
 function domain(C,K){const out=[];for(let s=0;s<K.length;s++){const seen=new Set();function visit(i,p,word){if(i===C.length){if(dict.has(word)){const h=p+"|"+word;if(!seen.has(h)){seen.add(h);out.push({s,t:p,word})}}return}const c=C[i];if(c===0)visit(i+1,p,word+"A");const q=mod(c-K[p]);if(q!==0)visit(i+1,(p+1)%K.length,word+String.fromCharCode(65+q))}visit(0,s,"")}return out}
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 // Euler's criterion: one selected edge per group; signed degree balance,
 // all used vertices weakly connected, and a start-phase-0 trail.
 function solve(D,q,cap=1000000){
  if(D.some(a=>!a.length))return {status:"empty-domain",nodes:0};
  const order=D.map((a,i)=>({i,a:[...new Map(a.map(e=>[e.s+","+e.t,e])).values()]})).sort((a,b)=>a.a.length-b.a.length);
  const n=D.length,lo=Array.from({length:n+1},()=>Array(q).fill(0)),hi=lo.map(a=>a.slice());
  const delta=(e,v)=>Number(e.s===v)-Number(e.t===v);
  for(let i=n-1;i>=0;i--)for(let v=0;v<q;v++){const d=order[i].a.map(e=>delta(e,v));lo[i][v]=lo[i+1][v]+Math.min(...d);hi[i][v]=hi[i+1][v]+Math.max(...d)}
  const bal=Array(q).fill(0),chosen=Array(n);let nodes=0,stop=false;
  function trail(){const adj=Array.from({length:q},()=>[]);for(let i=0;i<n;i++)adj[chosen[i].s].push(i);let stack=[{v:0,i:-1}],rev=[];while(stack.length){const v=stack.at(-1).v;if(adj[v].length){const i=adj[v].pop();stack.push({v:chosen[i].t,i})}else{const e=stack.pop();if(e.i>=0)rev.push(e.i)}}if(rev.length!==n)return null;const path=rev.reverse();let phase=0;for(const i of path){if(chosen[i].s!==phase)return null;phase=chosen[i].t}return path}
  function walk(i){
   if(++nodes>cap){stop=true;return null}
   let feasible=false;for(let end=0;end<q&&!feasible;end++){feasible=true;for(let v=0;v<q;v++){const target=Number(v===0)-Number(v===end);if(target<bal[v]+lo[i][v]||target>bal[v]+hi[i][v]){feasible=false;break}}}
   if(!feasible)return null;
   if(i===n){const p=trail();return p?{path:p,chosen:chosen.slice()}:null}
   const {i:g,a}=order[i];
   const score=e=>Math.abs(bal[e.s]+1)+Math.abs(bal[e.t]-1)-Math.abs(bal[e.s])-Math.abs(bal[e.t]);
   for(const e of a.slice().sort((x,y)=>score(x)-score(y))){chosen[g]=e;bal[e.s]++;bal[e.t]--;const result=walk(i+1);bal[e.s]--;bal[e.t]++;if(result||stop)return result}
   return null
  }
  const result=walk(0);return result?{status:"witness",nodes,...result}:{status:stop?"capped":"infeasible",nodes}
 }
 function summary(D){return {groups:D.length,covered:D.filter(a=>a.length).length,missing:D.filter(a=>!a.length).length,uniqueWord:D.filter(a=>new Set(a.map(e=>e.word)).size===1).length,uniqueEdge:D.filter(a=>new Set(a.map(e=>e.s+","+e.t)).size===1).length,edgeOptions:D.reduce((s,a)=>s+a.length,0)}}
 const controls=[],nulls=[];
 for(const [name,K] of Object.entries(keys))for(let d=0;d<donors.length;d++){
  const donor=donors[d],n=40;let start=-1;
  for(let i=Math.floor(donor.length*.8);i+n<=donor.length;i++){const window=donor.slice(i,i+n);if(!window.every(w=>dict.has(id(w))))continue;let phase=0,hold=0,consumeZero=0;for(const w of window){let e=encode(w,K,phase);phase=e.s;hold+=w.filter(x=>x===0).length;consumeZero+=e.C.filter((x,j)=>x===0&&w[j]!==0).length}if(hold&&consumeZero){start=i;break}}
  assert(start>=0,"no eligible heldout window "+name+" "+d);
  let phase=0;const truth=donor.slice(start,start+n).map((P,i)=>{const s=phase,{C,s:t}=encode(P,K,s);phase=t;return {P,C,s,t,i}}),R=rng(330100+d+K.length*100),plant=shuffle(truth,R),D=plant.map(x=>domain(x.C,K));
  assert(plant.every((x,i)=>D[i].some(e=>e.s===x.s&&e.t===x.t&&e.word===id(x.P))),"true edge missing");
  const sol=solve(D,K.length);assert(sol.status==="witness","positive graph "+JSON.stringify({name,d,sol}));
  let st=0;for(const i of sol.path){let e=sol.chosen[i],re=encode(nums(e.word),K,st);assert(st===e.s&&re.s===e.t&&id(re.C)===id(plant[i].C),"witness replay");st=re.s}
  let matched=sol.chosen.filter((e,i)=>e.word===id(plant[i].P)).length;
  let truthEdges=sol.chosen.filter((e,i)=>e.s===plant[i].s&&e.t===plant[i].t&&e.word===id(plant[i].P)).length;
  let groupsByEdge=new Map;for(let i=0;i<n;i++){let e=sol.chosen[i],h=e.s+","+e.t;if(!groupsByEdge.has(h))groupsByEdge.set(h,new Map);let m=groupsByEdge.get(h),c=id(plant[i].C);m.set(c,(m.get(c)||0)+1)}
  const logfact=n=>Array.from({length:n},(_,i)=>Math.log10(i+1)).reduce((a,b)=>a+b,0);
  let ambiguity=0;for(const m of groupsByEdge.values()){let counts=[...m.values()];ambiguity+=logfact(counts.reduce((a,b)=>a+b,0))-counts.reduce((a,b)=>a+logfact(b),0)}
  controls.push({key:name,donor:d,start,runecount:plant.reduce((s,x)=>s+x.C.length,0),...summary(D),matched,truthEdges,nodes:sol.nodes,log10OrderLowerBound:ambiguity,actualOrder:plant.map(x=>x.i),witnessOrder:sol.path.map(i=>plant[i].i)});
  const unrelated=plant.map(x=>encode(x.P,Array.from({length:K.length},()=>R()%29),R()%K.length).C),N=unrelated.map(C=>domain(C,K));nulls.push({key:name,donor:d,...summary(N),status:solve(N,K.length).status})
 }
 // All physical original printed groups, cross-page carries intact. Chapter
 // boundaries are seven explicit internal $ marks plus p54 start (red heading).
 const original=words(raw[1].split("%").slice(0,55).join("%"),x=>x!=="%"&&x!=="/"&&!/\s/u.test(x));
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 assert(original.length===2896&&original.flat().length===12956&&id(original.flat())===id(tape),"original source mismatch");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,gp.pages.filter(x=>x.page<54).reduce((s,x)=>s+x.indices.length,0),12956];
 let cursor=0,chapter=0;const chapters=Array.from({length:9},()=>[]);
 for(const w of original){while(cursor===cuts[chapter+1])chapter++;assert(cursor+w.length<=cuts[chapter+1],"cut inside printed group");chapters[chapter].push(w);cursor+=w.length}
 const originalResult=[];
 for(const [name,K] of Object.entries(keys))for(let ch=0;ch<chapters.length;ch++){const D=chapters[ch].map(C=>domain(C,K)),s=summary(D);assert(s.missing>Math.floor(.05*s.groups),"original requires wildcard graph assessment");originalResult.push({key:name,chapter:ch+1,runes:cuts[ch+1]-cuts[ch],...s,allowedOOV:Math.floor(.05*s.groups),status:"infeasible by empty lexical domains even with 5% arbitrary OOV",firstMissing:chapters[ch].filter((_,i)=>!D[i].length).slice(0,5).map(id)})}
 return {dictionaryTypes:dict.size,keys,nativeReplay:[wC.length,kC.length],cuts,controls,nulls,original:originalResult};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
