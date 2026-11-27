"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(c,t){
 const ck=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const ids=s=>[...s].map(ch=>c.runes.indexOf(ch)).filter(x=>x>=0);
 const source=c.pages.filter(p=>p.indices.length),pg=t.split("%").filter(s=>ids(s).length);
 ck(eq(pg.map(ids),source.map(p=>p.indices)),"corrected transcription");
 const groups=pg.filter((_,i)=>source[i].page<=55).join("").replace(/[\/\n&$]/g,"").split(/[-.]/).map(ids).filter(a=>a.length);
 ck(groups.length===2896&&groups.flat().length===12956,"target");
 ck(eq(groups.flat(),source.filter(p=>p.page<=55).flatMap(p=>p.indices)),"conservation");
 const bits=Array.from({length:32},(_,i)=>i.toString(2).padStart(5,"0"));
 function first(a,b=""){const s=a+b,j=s.indexOf("11");return j<0?"":s.slice(0,j+2)}
 function rows(frames){const out=Array.from({length:29},()=>new Set()),seen=new Set();
  for(const x of frames){if(!x.length)continue;seen.add(x[0]);if(x.length>=2)out[x[0]].add(x[1])}
  return {seen:seen.size,degrees:out.map(s=>s.size)};
 }
 // With d distinct successors, choose optimistically all unfinished prefixes,
 // followed by the largest equivalence classes of completed first words.
 function minLong(p,S,d){
  const f=new Map();let none=0;
  for(const q of S){const w=first(p,q);if(!w)none++;else f.set(w,(f.get(w)??0)+1)}
  const a=[...f.values()].sort((a,b)=>b-a);let n=0;
  while(none<d){ck(n<a.length,"capacity");none+=a[n++]}
  return n;
 }
 function bound(d){
  let min=Infinity,minLongOnly=Infinity,winners=[],hist={},cases=0;
  for(let a=0;a<30;a++)for(let b=a+1;b<31;b++)for(let c=b+1;c<32;c++){
   const S=bits.filter((_,i)=>i!==a&&i!==b&&i!==c),short=new Set();let long=0;
   for(const p of S){const w=first(p);if(w)short.add(w);else long+=minLong(p,S,d)}
   const n=short.size+long;minLongOnly=Math.min(minLongOnly,long);
   if(n<min){min=n;winners=[]}if(n===min)winners.push({omitted:[a,b,c],short:short.size,long});
   hist[n]=(hist[n]??0)+1;cases++;
  }
  ck(cases===4960,"subsets");return {d,min,minLongOnly,winners,hist,cases};
 }
 // Independent exact subset check of minLong on eight-pattern toy carriers.
 // All successor subsets (including d=0) compared with largest-bucket bound.
 let checks=0;
 for(let shift=0;shift<32;shift++){
  const S=Array.from({length:8},(_,i)=>bits[(shift+i*7)%32]);
  for(const p of bits.filter(x=>!first(x))){
   const best=Array(9).fill(Infinity);
   for(let mask=0;mask<256;mask++){let n=0,w=new Set();for(let i=0;i<8;i++)if(mask>>i&1){n++;const q=first(p,S[i]);if(q)w.add(q)}
    best[n]=Math.min(best[n],w.size)}
   for(let d=0;d<=8;d++){ck(best[d]===minLong(p,S,d),"subset bound");checks++}
  }
 }
 // Native payload controls. Frame by each codeword or legal concatenation,
 // then relabel to a noncanonical 29-pattern injection.
 const enc=n=>{let f=[1,2];while(f.at(-1)<=n)f.push(f.at(-1)+f.at(-2));f.pop();let a=f.map(()=>0);for(let i=f.length-1;i>=0;i--)if(n>=f[i]){a[i]=1;n-=f[i]}return a.join("")+"1"};
 const native=c.pages.find(p=>p.page===57).indices;
 const codebook=Array.from({length:29},(_,i)=>enc(i+1));const S=bits.filter((_,i)=>![28,29,30].includes(i));
 let frames=[],start=0,replay=[];
 while(start<native.length){
  let chosen=null;
  for(let end=start+1;end<=Math.min(start+8,native.length);end++){
   const plaintext=native.slice(start,end),str=plaintext.map(x=>codebook[x]).join("");
   const k=Math.floor(str.length/5),chunks=Array.from({length:k},(_,i)=>str.slice(i*5,i*5+5));
   if(k&&chunks.every(x=>S.includes(x)))chosen={end,plaintext,chunks,tail:str.slice(k*5)};
  }
  if(!chosen){ // A short native word may have no complete chunk; retain its exact suffix-only frame.
   const plaintext=native.slice(start,start+1),str=plaintext.map(x=>codebook[x]).join("");
   ck(str.length<5,"unrepresentable native plant");chosen={end:start+1,plaintext,chunks:[],tail:str};
  }
  const y=chosen.chunks.map(x=>(7*S.indexOf(x)+3)%29);
  let str=y.map(v=>S[((v-3+29)*25)%29]).join("")+chosen.tail;
  let p=[];while(str.length){const w=first(str);ck(w&&codebook.includes(w),"native decode");p.push(codebook.indexOf(w));str=str.slice(w.length)}
  ck(eq(p,chosen.plaintext),"native replay");replay.push(...p);frames.push(y);start=chosen.end;
 }
 ck(eq(replay,native),"native total replay");
 const original=rows(groups);ck(original.seen===29,"all first labels");const d=Math.min(...original.degrees);
 const result=bound(d);ck(d===26&&result.min===36,"original certificate");
 const controls={toyComparisons:checks,nativeRunes:replay.length,nativeFrames:frames.length,observed:rows(frames)};
 // Sensitivity: smallest uniform row degree for which all assignments fail.
 let sensitivity=[];for(let k=22;k<=26;k++){let x=bound(k);sensitivity.push({degree:k,minimum:x.min})}
 return {groups:groups.length,runes:groups.flat().length,original,result,controls,sensitivity};
}
module.exports=run;
if(require.main===module){const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt")),null,2))}
