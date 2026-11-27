'use strict';
/** Static chapter-private homophonic receiver: exact lexical search and spacing-free necessary histogram support. */
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const check=(v,m)=>{if(!v)throw Error(m)}, id=w=>String.fromCharCode(...w.map(x=>65+x)), nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x))),native=gold.sections.flatMap(s=>parse(s.source_text));native.forEach(w=>types.add(id(w)));
 const literary=raw.slice(3,6).map(t=>(body(t).match(/[A-Za-z]+/g)||[]).map(w=>word(w,true)));
 for(const t of raw.slice(3,6))for(const w of body(t).match(/[A-Za-z]+/g)||[])for(const alt of [true,false])types.add(id(word(w,alt)));
 for(const ln of raw[2].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const bylen=Array.from({length:40},()=>[]);for(const t of types)if(t.length<40)bylen[t.length].push(nums(t));
 const original=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);let n=0;
 const all=raw[6].replace(/[\r\n/%&$§]/g,"").split(/[-.]/u).map(x=>[...x].filter(c=>ix.has(c)).map(c=>ix.get(c))).filter(x=>x.length).filter(x=>{let q=n<original.length;n+=x.length;return q});
 check(all.length===2896&&all.flat().join()===original.join(),"canonical");check(types.size===36712,"lexicon");
 const groups=[158,255,383,437,224,326,378,669,66],chapters=[];let j0=0;for(const count of groups){chapters.push(all.slice(j0,j0+count));j0+=count;}
 check(chapters.map(c=>c.flat().length).join()==="729,1145,1729,1903,1021,1433,1680,3008,308","chapter boundaries");
 function makeRow(c,j){const first=new Int8Array(29).fill(-1),unique=[],pos=[],repeat=[];for(let i=0;i<c.length;i++){if(first[c[i]]<0){first[c[i]]=i;unique.push(c[i]);pos.push(i)}else repeat.push([first[c[i]],i]);}const domain=(bylen[c.length]||[]).filter(p=>repeat.every(([a,b])=>p[a]===p[b])).map(p=>Uint8Array.from(pos.map(i=>p[i])));return {j,unique,domain};}
 function solve(C,budget,anchorCount,cap=2000000){
  const indices=C.map((_,j)=>j).sort((i,j)=>C[j].length-C[i].length||i-j).slice(0,anchorCount),held=C.map((_,j)=>j).filter(j=>!indices.includes(j));
  const rows=indices.map(j=>makeRow(C[j],j)), m=new Int8Array(29).fill(-1);
  let nodes=0,anchorCompletions=0,hit=null,capped=false;
  function search(active,miss,stage){
   if(++nodes>cap){capped=true;return true;}
   if(!active.length){if(stage===0){anchorCompletions++;return search(held.map(j=>makeRow(C[j],j)),miss,1);}
    const map=[...m].map(x=>x<0?0:x),plain=C.map(w=>w.map(c=>map[c])),actualMiss=plain.filter(w=>!types.has(id(w))).length;check(actualMiss<=budget,"completion");hit={map,assigned:m.filter(x=>x>=0).length,miss:actualMiss,plain:plain.map(w=>w.map(x=>gp.translit[x]).join(""))};return true;}
   const rem=[];let forced=0,besti=-1,dsBest=null;
   for(const row of active){const ds=row.domain.filter(d=>row.unique.every((c,i)=>m[c]<0||m[c]===d[i]));if(!ds.length){forced++;continue;}if(row.unique.every(c=>m[c]>=0))continue;rem.push({...row,domain:ds});if(dsBest===null||ds.length<dsBest.length){besti=rem.length-1;dsBest=ds;}}
   miss+=forced;if(miss>budget)return false;if(!rem.length)return search([],miss,stage);
   const row=rem[besti],rest=rem.filter((_,i)=>i!==besti);
   for(const d of dsBest){const changed=[];row.unique.forEach((c,i)=>{if(m[c]<0){m[c]=d[i];changed.push(c)}});const stop=search(rest,miss,stage);changed.forEach(c=>m[c]=-1);if(stop)return true;}
   return miss<budget&&search(rest,miss+1,stage);
  }
  search(rows,0,0);return {budget,anchors:rows.map(r=>({index:r.j,len:C[r.j].length,domain:r.domain.length})),held:held.length,nodes,anchorCompletions,hit,capped};
 }
 let rng=0x23d1026;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function plant(P){const used=[...new Set(P.flat())],free=shuffle(Array.from({length:29},(_,i)=>i)),enc=Array.from({length:29},()=>[]),truth=new Int8Array(29).fill(-1);
  for(const p of used){const c=free.pop();enc[p].push(c);truth[c]=p;}
  const counts=Array.from({length:29},(_,i)=>P.flat().filter(p=>p===i).length),common=used.slice().sort((a,b)=>counts[b]-counts[a]);
  let j=0;while(free.length){const p=common[j++%common.length],c=free.pop();enc[p].push(c);truth[c]=p;}
  const sender=words=>{const curs=Array(29).fill(0);return words.map(w=>w.map(p=>enc[p][curs[p]++%enc[p].length]));};const C=sender(P);return {C,truth:[...truth],used:used.length,sender};}
 const controls=[];
 for(const [start,count,budget,anchorCount] of [[0,66,3,12],[66,66,3,12],[132,66,3,12],[0,158,7,16]]){
  const P=native.slice(start,start+count);check(P.length===count,"control length");const {C,truth,used,sender}=plant(P);const res=solve(C,budget,anchorCount);
  const recovered=res.hit?C.map(w=>w.map(c=>res.hit.map[c])):[];
  const keyacc=res.hit?res.hit.map.filter((p,i)=>p===truth[i]).length:0;
  const runes=res.hit?recovered.flat().filter((p,i)=>p===P.flat()[i]).length:0;
  check(keyacc===29&&runes===P.flat().length&&sender(recovered).flat().join()===C.flat().join(),"control key/plain/replay");
  controls.push({start,count,distinctPlain:used,distinctCipher:new Set(C.flat()).size,total:P.flat().length,keyacc,runes,replay:true,truth,...res});
 }
 const lexical={terminal:solve(chapters[8],3,12),opening:solve(chapters[0],7,16)};
 // For any stationary many-to-one map, each positive plaintext histogram count
 // must be an exact subset sum of the disjoint ciphertext-symbol frequencies.
 // This is a necessary relaxation (does not enforce disjointness across outputs).
 // Check every contiguous rune window without a word-boundary or order assumption.
 function histogram(t){const f=Array(29).fill(0);t.forEach(x=>f[x]++);return f;}
 function subsetSupport(f,N){let b=1n;for(const x of f)b|=b<<BigInt(x);return Uint8Array.from({length:N+1},(_,i)=>Number((b>>BigInt(i))&1n));}
 const donorTapes=[native.flat(),...literary.map(w=>w.flat())],labels=["solved-native","Gibran","Shakespeare","Emerson"];
 const histogramResults=chapters.map((C,k)=>{
  const t=C.flat(),N=t.length,counts=histogram(t),support=subsetSupport(counts,N);
  const windows=donorTapes.map((d,j)=>{const f=histogram(d.slice(0,N)),total=Math.max(0,d.length-N+1);let bad=f.filter(x=>!support[x]).length,eligible=0,minBad=29,first=null;
   for(let i=0;i<total;i++){if(i){const a=d[i-1],b=d[i+N-1];if(a!==b){bad-=Number(!support[f[a]]);f[a]--;bad+=Number(!support[f[a]]);bad-=Number(!support[f[b]]);f[b]++;bad+=Number(!support[f[b]]);}}minBad=Math.min(minBad,bad);if(!bad){eligible++;if(first===null)first=i;}}
   return {donor:labels[j],total,eligible,minBad:total?minBad:null,first};});
  // Control: decode the original with an arbitrary deterministic many-to-one map.
  // Its histogram must satisfy the exact subset-support test, independent of language.
  const p=histogram(t.map(x=>x%23));check(p.every(x=>support[x]),"homophonic histogram control");
  return {chapter:k+1,N,counts,minPositive:Math.min(...counts.filter(x=>x>0)),attainable:support.reduce((a,b)=>a+b,0),windows,syntheticSupport:true};
 });
 return {lexicon:types.size,controls,lexical,histogramResults};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp2-transcription.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
