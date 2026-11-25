"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
function assemble(raw,k=8,q=256,controlCount=1){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const v=id(word(m[1],alt));if(v.length<=24)types.add(v);}}
 assert(types.size===35944,"dictionary");
 const bylen=Array.from({length:25},()=>[]);for(const t of types)bylen[t.length].push(t);
 const project=new Map;function proj(n,L){const z=n*32+L;if(!project.has(z))project.set(z,[...new Set(bylen[n].map(x=>x.slice(0,L)))].map(nums));return project.get(z)}
 let gs=[],w=[],sep="";for(const c of raw[6]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push(w);n+=w.length}assert(n===12956&&orig.length===2896,"counts");

 function fragments(C){
  const out=new Set(),seen=new Set();
  for(const D of [C,...C.map((_,i)=>C.slice(0,i).concat(C.slice(i+1)))]){
   if(D.length<k||D.length>24)continue;const tag=id(D);if(seen.has(tag))continue;seen.add(tag);
   for(const P of bylen[D.length]){const tape=[];
    function visit(j){if(j===D.length){for(let i=0;i+k<=tape.length;i++){let v=0;for(let d=0;d<k;d++)v=v*29+tape[i+d];out.add(v)}return}
     const p=P.charCodeAt(j)-65,c=D[j];if(!p&&!c)visit(j+1);tape.push(mod(c-p));visit(j+1);tape.pop()}
    visit(0)}
  }return out
 }
 function decode(v){const a=Array(k);for(let j=k-1;j>=0;j--){a[j]=v%29;v=Math.floor(v/29)}return a}
 function solve(rows,key=null,truth=null){
  let arr=new Float64Array(1<<20),used=0,retained=0,expected=0;
  for(const [i,C] of rows.entries()){
   const S=fragments(C);if(truth){const t=truth[i];for(let h=0;h+k<=t.n;h++){let v=0;for(let d=0;d<k;d++)v=v*29+key[(t.s+h+d)%q];expected++;assert(S.has(v),"true window missing");retained++}}
   if(used+S.size>arr.length){let cap=arr.length;while(cap<used+S.size)cap=Math.ceil(cap*1.6);const b=new Float64Array(cap);b.set(arr);arr=b}for(const v of S)arr[used++]=v
  }
  const v=arr.subarray(0,used);v.sort();const high=[],hist=[];let distinct=0;
  for(let i=0;i<used;){let j=i+1;while(j<used&&v[j]===v[i])j++;const n=j-i;distinct++;hist[n]=(hist[n]||0)+1;if(n>=2)high.push({v:v[i],n,K:decode(v[i])});i=j}
  const pos=new Map();if(key)for(let i=0;i<q;i++){let v=0;for(let d=0;d<k;d++)v=v*29+key[(i+d)%q];if(!pos.has(v))pos.set(v,[]);pos.get(v).push(i)}
  const edges=[],adj=high.map(()=>[]);
  for(let d=1;d<=4;d++){const base=29**(k-d),div=29**d,pre=new Map;
   for(const [i,h] of high.entries()){const u=Math.floor(h.v/div);if(!pre.has(u))pre.set(u,[]);pre.get(u).push(i)}
   for(const [i,h] of high.entries())for(const j of pre.get(h.v%base)||[]){if(i===j)continue;edges.push({i,j,d});adj[i].push([j,d]);adj[j].push([i,-d])}
  }
  const seen=new Set,components=[];
  for(let i=0;i<high.length;i++){if(seen.has(i))continue;const todo=[i],offset=new Map([[i,0]]);seen.add(i);let conflicts=0;
   for(let a=0;a<todo.length;a++){const u=todo[a];for(const [j,d] of adj[u]){const p=(offset.get(u)+d+q)%q;if(offset.has(j)){if(offset.get(j)!==p)conflicts++;continue}offset.set(j,p);seen.add(j);todo.push(j)}}
   const tape=Array(q).fill(-1);for(const j of todo){let p=offset.get(j);for(const x of high[j].K){if(tape[p]!==-1&&tape[p]!==x)conflicts++;tape[p]=x;p=(p+1)%q}}
   const coverage=tape.filter(x=>x>=0).length;let bestCorrect=null;if(key){bestCorrect=0;for(let s=0;s<q;s++){let n=0;for(let j=0;j<q;j++)if(tape[j]===key[(s+j)%q])n++;bestCorrect=Math.max(n,bestCorrect)}}
   components.push({vertices:todo.length,coverage,conflicts,weight:todo.reduce((s,j)=>s+high[j].n,0),bestCorrect,tape})
  }
  components.sort((a,b)=>(a.conflicts>0)-(b.conflicts>0)||b.coverage-a.coverage||b.weight-a.weight);
  const trueHigh=key?high.filter(h=>pos.has(h.v)).length:null,truePositions=key?[...new Set(high.filter(h=>pos.has(h.v)).flatMap(h=>pos.get(h.v)))].length:null;
  return {groupCount:rows.length,incidences:used,distinct,hist,high:high.length,trueHigh,truePositions,edges:edges.length,components:components.length,top:components.slice(0,10),retained,expected}
 }
 const origRows=orig.filter(w=>w.length>=10);
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const pools=donors.map(d=>d.slice(Math.floor(d.length*.8)).filter(w=>types.has(id(w))));const all=pools.flat();const controls=[];
 for(let d=0;d<controlCount;d++){const R=rng(0x12a882+d),by=Array.from({length:25},(_,L)=>pools[d].filter(w=>w.length===L)),allBy=Array.from({length:25},(_,L)=>all.filter(w=>w.length===L));
 const key=Array.from({length:q},()=>R()%29),rows=[],truth=[];let fallback=0;
 for(const C of origRows){let cut=R()%100<45,L=C.length-(cut?1:0);if(!by[L].length&&by[C.length-(!cut?1:0)].length){cut=!cut;L=C.length-(cut?1:0)}let pool=by[L];if(!pool.length){pool=allBy[L];fallback++}if(!pool.length){cut=!cut;L=C.length-(cut?1:0);pool=allBy[L]}assert(pool.length,"no held donor "+L);const P=pool[R()%pool.length],s=R()%q;let p=s;const D=P.map(x=>{if(!x&&(R()%2))return 0;const y=mod(x+key[p%q]);p++;return y});if(cut)D.splice(R()%(D.length+1),0,R()%29);rows.push(D);truth.push({s,n:p-s})}
 controls.push({fallback,...solve(rows,key,truth)})}
 return {k,q,scope:"original groups length>=10; full consuming key fragment windows",controls,original:solve(origRows)}
}

if(require.main===module) console.log(JSON.stringify(assemble(paths.map(p=>fs.readFileSync(p,"utf8")),8,256,3),null,2));
module.exports={assemble};
