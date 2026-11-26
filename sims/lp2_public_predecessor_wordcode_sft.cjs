'use strict';
const fs=require('node:fs');
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json"];
function main(inputs){
 const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],assert=(ok,msg)=>{if(!ok)throw Error(msg)},runs=s=>s.match(new RegExp("["+R+"]+","gu"))||[];
 let physical=0,offset=0,tape="",positions=[],pageTape={};
 for(const ch of inputs[0]){if(ch==="%"){physical++;continue;}if(ch==="/"||/\s/u.test(ch))continue;tape+=ch;let page=physical+(physical>=50?1:0);positions.push({page,offset});if(R.includes(ch)){(pageTape[page]??=[]).push(R.indexOf(ch));offset++;}}
 for(const p of JSON.parse(inputs[1]).pages)assert(JSON.stringify(pageTape[p.page]||[])===JSON.stringify(p.indices),"page "+p.page);
 const groups=[...tape.matchAll(new RegExp("["+R+"]+","gu"))].map(m=>({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page})).filter(g=>g.page<56);
 assert(groups.length===2896&&groups.reduce((n,g)=>n+g.w.length,0)===12956&&groups.filter(g=>g.page!==g.endPage).length===32,"source counts");
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],expected=[158,255,383,437,224,326,378,669,66];
 const chapters=expected.map((n,i)=>groups.filter(g=>g.offset>=cuts[i]&&g.offset<cuts[i+1]).map(g=>g.w));
 assert(chapters.every((x,i)=>x.length===expected[i]),"chapter counts");
 const dict=new Map(A.map((w,i)=>[w,R[i]]));
 function gp(w){return [...w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").matchAll(/ING|TH|EO|NG|OE|AE|IA|EA|[A-Z]/g)].map(m=>dict.get(m[0]==="ING"?"NG":m[0])).join("");}
 function english(s){return(s.toUpperCase().match(/[A-Z]+/g)||[]).map(gp);}
 const native=JSON.parse(inputs[2]).sections.map(s=>({name:"solved:"+s.name,words:runs(s.source_text)}));
 const law=inputs.slice(3,6).map((s,i)=>({name:"Law "+(i+1),words:english(s)}));
 const lengths=JSON.parse(inputs[7]).chapters.map(c=>c.word_lengths);
 assert(law.map(x=>x.words.length).join(",")==="1897,1968,2002","law count");
 assert(law.every((x,i)=>x.words.every((w,j)=>w.length===lengths[i][j])),"law normalization");
 const self={name:"Self-Reliance",words:english(inputs[6])};
 assert(self.words.length===10170,"Self count");
 const donors=[...native,{name:"solved concatenated sensitivity",words:native.flatMap(x=>x.words)},...law,{name:"Law continuous",words:law.flatMap(x=>x.words)},self];
 const vocab=new Map();for(const d of donors)d.ids=d.words.map(w=>{if(!vocab.has(w))vocab.set(w,vocab.size);return vocab.get(w)});
 const V=vocab.size;
 /** Build decoder-recoverable state and state-local ciphertext type identifiers. */
 function spec(name,chs,priv=false){
  const states=[],codes=[],types=new Map(),words=chs.flat(),counts=chs.map(x=>x.length);let state=0;
  for(let k=0;k<chs.length;k++){state=0;for(const w of chs[k]){const s=state+(priv?29*k:0),key=s+"|"+w;if(!types.has(key))types.set(key,types.size);states.push(s);codes.push(types.get(key));state=R.indexOf(w.at(-1));assert(state>=0,"GP state");}}
  return{name,n:words.length,split:Math.floor(words.length*2/3),states,codes,types:types.size,numStates:priv?29*chs.length:29,counts,priv};
 }
 /** Exact bidirectional consistency; first contradiction determines maximal compatible prefix. */
 function scanner(s){
  const a=new Int32Array(s.types),at=new Int32Array(s.types),b=new Int32Array(s.numStates*V),bt=new Int32Array(s.numStates*V);let stamp=0;
  return(P,start)=>{stamp++;let repeats=0;for(let i=0;i<s.n;i++){const c=s.codes[i],p=P[start+i],k=s.states[i]*V+p;
   if(at[c]===stamp&&a[c]!==p||bt[k]===stamp&&b[k]!==c)return{i,repeats};
   if(at[c]===stamp&&i>=s.split)repeats++;
   at[c]=stamp;a[c]=p;bt[k]=stamp;b[k]=c;
  }return{i:s.n,repeats};};
 }
 function scan(s){const test=scanner(s),rows=[];let total={windows:0,training:0,full:0,bestPrefix:0};
  for(const d of donors){const windows=Math.max(0,d.ids.length-s.n+1);let training=0,full=0,bestPrefix=0,fullOffsets=[],trainOffsets=[];
   for(let j=0;j<windows;j++){const q=test(d.ids,j);bestPrefix=Math.max(bestPrefix,q.i);if(q.i>=s.split){training++;if(trainOffsets.length<10)trainOffsets.push(j);}if(q.i===s.n){full++;if(fullOffsets.length<10)fullOffsets.push({offset:j,heldRepeatChecks:q.repeats});}}
   rows.push({donor:d.name,windows,training,full,bestPrefix,fullOffsets,trainOffsets});total.windows+=windows;total.training+=training;total.full+=full;total.bestPrefix=Math.max(total.bestPrefix,bestPrefix);
  }return{total,rows};
 }
 let rng=0x2938a7b1;function rnd(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)%n;}
 /** Generate a genuine public-state codebook with hidden variable-length codes. */
 function plant(s,P){let at=0,serial=0,map=new Map(),cs=[];for(let k=0;k<s.counts.length;k++){let state=0,ch=[];for(let j=0;j<s.counts[k];j++){const key=(state+(s.priv?29*k:0))+"|"+P[at++];if(!map.has(key)){let n=serial++,prefix="";do{prefix+=R[n%29];n=Math.floor(n/29);}while(n);map.set(key,R[1]+prefix+R[rnd(29)]);}const w=map.get(key);ch.push(w);state=R.indexOf(w.at(-1));}cs.push(ch);}
  return spec("plant",cs,s.priv);
 }
 const scopes=[spec("book-shared",chapters),spec("book-private-chapter",chapters,true),...chapters.map((ch,i)=>spec("chapter"+(i+1),[ch]))],results=[];
 for(const s of scopes){const orig=scan(s),eligible=donors.filter(d=>d.ids.length>=s.n),plants=[];
  for(let j=0;j<3;j++){const d=eligible[rnd(eligible.length)],start=rnd(d.ids.length-s.n+1),P=d.ids.slice(start,start+s.n),H=plant(s,P),check=scanner(H)(d.ids,start);assert(check.i===s.n,"planted receiver");const q=scan(H);
   // Exact chosen-offset forward replay follows from both maps; construct negative by duplicating one ciphertext type's plaintext with a different ID.
   plants.push({donor:d.name,start,trueOffsetRetained:true,training:q.total.training,full:q.total.full,heldRepeatChecks:check.repeats});
  }
  results.push({name:s.name,n:s.n,split:s.split,stateCipherTypes:s.types,observedRepeats:s.n-s.types,...orig,plants});
 }
 return{source:{groups:2896,runes:12956,carries:32,chapterWords:expected},vocabulary:V,results};
}
console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
