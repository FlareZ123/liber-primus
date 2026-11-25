"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/transcriptions/lp2-image-corrected.txt"
];
function experiment(raw,scope="plants"){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]).sections,Q=29,L=8,MAX=24,ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),mod=x=>(x%Q+Q)%Q,id=w=>String.fromCharCode(...w.map(x=>65+x));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const lex=new Set(Array.from({length:Q},(_,x)=>String.fromCharCode(65+x)));for(const arr of training)for(const w of arr)if(w.length<=MAX)lex.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const w=word(m[1],alt);if(w.length<=MAX)lex.add(id(w))}}
 const words=[...lex].filter(k=>k.length>=L),trie=[new Int32Array(Q)],ends=[-1];
 for(let wi=0;wi<words.length;wi++){let t=0;for(const c of words[wi]){const x=c.charCodeAt(0)-65;if(!trie[t][x]){trie[t][x]=trie.length;trie.push(new Int32Array(Q));ends.push(-1)}t=trie[t][x]}ends[t]=wi;}
 const edges=new Int32Array(trie.length*Q);trie.forEach((e,i)=>edges.set(e,i*Q));
 const printed=Array.from(raw[6]).filter(c=>ix.has(c)).map(c=>ix.get(c)),parts=gold.slice(0,7).map(s=>Array.from(s.source_text).filter(c=>ix.has(c)).map(c=>ix.get(c)));
 parts[3]=Array.from(raw[6].split('%').slice(4,8).join('')).filter(c=>ix.has(c)).map(c=>mod(60-ix.get(c)));
 const clear=parts.flat();if(printed.length!==2797||clear.length!==2797)throw Error("LP1 source length");
 const variants=["corrected","printed"].flatMap((name,i)=>["index","prime"].flatMap(encoding=>[1,-1].map(sign=>({name,encoding,sign,K:(i?printed:clear).map(v=>mod(sign*(encoding==="prime"?gp.prime[v]:v)))}))));
 const full=gp.pages.slice(0,56).flatMap(p=>p.indices),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],w=raw[7].split("$").slice(0,8).join("$").replace(/[\/%\s]/g,"").split(/[-.&$\d]+/).map(t=>Array.from(t).filter(c=>ix.has(c)).map(c=>ix.get(c))).filter(w=>w.length);
 if(w.flat().join()!==full.join()||w.length!==2896)throw Error("original partition mismatch");let n=0,ch=0;const chapterWords=Array.from({length:9},()=>[]);for(const x of w){if(n===starts[ch+1])ch++;if(n+x.length>starts[ch+1])throw Error("cross boundary");chapterWords[ch].push(x);n+=x.length}
 const chapters=chapterWords.map((w,i)=>({ch:i,C:w.flat(),lengths:w.map(z=>z.length)}));
 function scan(C,K){
  const n=C.length,M=K.length,runL=new Int32Array(M),runR=new Int32Array(M),next=new Int32Array(M),prev=new Int32Array(M);
  for(let j=0;j<M;j++){next[j]=(j+1)%M;prev[j]=(j+M-1)%M}
  for(let j=0;j<M;j++){let a=j,b=j;while(K[prev[a]]===K[j]&&prev[a]!==j)a=prev[a];while(K[next[b]]===K[j]&&next[b]!==j)b=next[b];runL[j]=a;runR[j]=b}
  const matches=[],seen=new Set();let visits=0,start=0,origin=0;
  // Exact supermodel: arbitrary jumps at true word boundaries. Within each
  // word, any collision rejection can move either way; a held or consumed F
  // is allowed. Rejecting moves cannot cross a noncolliding key emission.
  function walk(i,j,t){
   visits++;const wi=ends[t];if(wi>=0){const code=start*words.length+wi;if(!seen.has(code)){seen.add(code);matches.push({start,end:i,word:words[wi],origin,cursor:j})}}
   if(i===n||i-start===MAX)return;
   const c=C[i],b=t*Q,k=K[j],p=mod(c-k),a=edges[b+p];if(a)walk(i+1,next[j],a);
   if(c===0){const z=edges[b];if(z)walk(i+1,j,z)}
   if(i===start)return;
   const pc=C[i-1],r=mod(pc-k),z=edges[b+r];if(!z)return;
   if(c===pc){const end=runR[j];let h=runL[j];while(true){if(h!==j)walk(i+1,next[h],z);if(h===end)break;h=next[h]}}
   else {const q=mod(c-r),left=prev[runL[j]],right=next[runR[j]];if(K[left]===q)walk(i+1,next[left],z);if(right!==left&&K[right]===q)walk(i+1,next[right],z)}
  }
  for(start=0;start<=n-L;start++)for(origin=0;origin<M;origin++)walk(start,origin,0);
  return {matches,visits};
 }
 function bound(lengths,match){
  const n=lengths.length,need=lengths.filter(l=>l>=L).length,byLen={},cap={};for(const l of lengths)if(l>=L)byLen[l]=(byLen[l]||0)+1;
  const posLen=new Set(match.map(x=>x.start+":"+(x.end-x.start)));for(const z of posLen){const l=+z.split(":")[1];cap[l]=(cap[l]||0)+1}
  let byLength=0;for(const l of Object.keys(byLen))byLength+=Math.min(byLen[l],cap[l]||0);
  let endpoint=0,interval=0;for(const x of match.filter(x=>byLen[x.end-x.start]).slice().sort((a,b)=>a.end-b.end||a.start-b.start)){if(x.start>=endpoint){endpoint=x.end;interval++}}
  const upper=Math.min(need,byLength,interval),minOOV=need-upper,budget=Math.floor(n*.05);return {n,need,byLen,cap,byLength,interval,upper,minOOV,budget,excluded:minOOV>budget};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
 function plant(W,K,R,hold){const C=[],truth=[];let rejected=0,holds=0;for(const w of W){let j=Math.floor(R()*K.length),start=C.length,origin=j;for(const p of w){if(hold&&p===0){C.push(0);holds++;continue}let c=mod(p+K[j]),count=0;while(C.length&&c===C.at(-1)&&R()<.81&&count<100){j=(j+(R()<.5?-1:1)+K.length)%K.length;c=mod(p+K[j]);rejected++;count++}C.push(c);j=(j+1)%K.length}truth.push({start,end:C.length,word:id(w),origin})}return {C,truth,rejected,holds}}
 const out={scope,dict:lex.size,longWords:words.length,nodes:trie.length,originalChapters:chapters.map(x=>({ch:x.ch,n:x.C.length,groups:x.lengths.length,long:x.lengths.filter(l=>l>=L).length})),plants:[],originals:[]};
 if(scope==="plants"){for(let d=0;d<3;d++){const R=rng(0x2a001100+d),v=variants[[0,3,6][d]],pool=donors[d].slice(Math.floor(.8*donors[d].length)),W=[];let n=0;for(let k=Math.floor(R()*(pool.length-500));n<729;k++){W.push(pool[k]);n+=pool[k].length}
 const {C,truth,rejected,holds}=plant(W,v.K,R,d!==1),res=scan(C,v.K),set=new Set(res.matches.map(x=>x.start+":"+x.word)),eligible=truth.filter(x=>x.word.length>=L&&lex.has(x.word)),correct=eligible.filter(x=>set.has(x.start+":"+x.word)).length;
 if(correct!==eligible.length)throw Error("false exclusion in plant");out.plants.push({d,name:v.name,encoding:v.encoding,sign:v.sign,n,groups:W.length,eligible:eligible.length,correct,rejected,holds,bound:bound(W.map(w=>w.length),res.matches),...res})}}
 else{const ch=chapters[Number(scope)];for(const {name,encoding,sign,K} of variants){const res=scan(ch.C,K);out.originals.push({ch:ch.ch,name,encoding,sign,bound:bound(ch.lengths,res.matches),...res})}}
 return out;
}
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]||"plants"),null,2));
