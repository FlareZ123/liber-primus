'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,trans,lex,native){
 const mod=n=>((n%29)+29)%29,all=(1<<29)-1,bit=i=>1<<i;
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 const pages=corpus.pages.filter(p=>p.page<56),tape=pages.flatMap(p=>p.indices);
 const alpha=new Map(corpus.translit.map((x,i)=>[x,i])),runes=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=(trans.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).slice(0,2896).map(w=>Array.from(w,x=>runes.get(x)));
 if(String(words.flat())!==String(tape))throw Error("transcription alignment");
 const dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);
 const nativeWords=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>runes.get(x))));
 for(const sec of nativeWords)for(const w of sec)add(w);
 function gate(arrays,q){
  let offset=0;const pairs=[],dom=Array(29).fill(all);
  for(const c of arrays){let s=0;for(let i=0;i<c.length;i++){s=c[i]===0?0:s+1;if(s>q){const x=c[i-q],y=c[i];dom[x]&=~bit(y);pairs.push({index:offset+i,x,y});}}offset+=c.length}
  const match=Array(29).fill(-1);
  function aug(i,seen){for(let j=0;j<29;j++)if((dom[i]&bit(j))&&!seen[j]){seen[j]=1;if(match[j]===-1||aug(match[j],seen)){match[j]=i;return true}}return false}
  let matching=0;for(let i=0;i<29;i++)if(aug(i,Array(29).fill(0)))matching++;
  return {pairs,dom,matching,forced:dom.map((v,i)=>v===1?i:null).filter(x=>x!==null)};
 }
 function lexGate(wds,g){
  const fixed=new Map(g.pairs.filter(x=>g.dom[x.x]===1).map(p=>[p.index,p.y]));
  let off=0;
  const anchors=[];
  for(let wi=0;wi<wds.length;wi++){const w=wds[wi],start=off;off+=w.length;
   if(w.length>=5&&w.every((v,i)=>fixed.has(start+i)))anchors.push({wi,w,start});}
  const inverses=Array.from({length:28},(_,i)=>{for(let x=1;x<29;x++)if(mod((i+1)*x)===1)return x});
  const scores=inverses.map((iv,i)=>{let good=0;const words=[];for(const {wi,w,start} of anchors){const p=w.map(c=>mod(c*iv));if(dict[p.length].has(String(p))){good++;words.push({wi,p:p.map(v=>corpus.translit[v]).join("")})}}return {a:i+1,good,words}});
  return {forcedPositions:fixed.size,anchors:anchors.length,anchorExamples:anchors.slice(0,3).map(x=>({wi:x.wi,start:x.start,c:x.w.map(v=>corpus.translit[v]).join("")})),scores};
 }
 const result={lexicon:dict.reduce((s,d)=>s+d.size,0),original:{},controls:[]};
 for(const q of [8,13]){
  const g=gate(pages.map(p=>p.indices),q);
  result.original[q]={pairs:g.pairs.length,domSizes:g.dom.map(pop),matching:g.matching,forced:g.forced,lex:lexGate(words,g)};
  for(const perm of [true,false]){
   const p=nativeWords.flat(2);let k=Array.from({length:q},(_,i)=>mod(3+7*i)),a=7;
   const fun=x=>perm?mod(11*x+19):0;
   const c=p.map(v=>{if(v===0)return 0;const v2=mod(a*v+fun(k.shift()));k.push(v2);return v2});
   const g2=gate([c],q);
   if(g2.dom.some((mask,x)=>!(mask&bit(fun(x)))))throw Error("false rejection");
   if(perm&&g2.matching!==29)throw Error("permutation rejected");
   let offset=0;const wds=nativeWords.flat().map(w=>{const w2=c.slice(offset,offset+w.length);offset+=w.length;return w2});
   result.controls.push({q,perm,pairs:g2.pairs.length,matching:g2.matching,forced:g2.forced,lex:lexGate(wds,g2)});
  }
 }
 return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(run(JSON.parse(load('resources/liber-primus/lp2-corpus.json')),load('resources/liber-primus/lp2-transcription.txt'),load('resources/control/english_wordfreq_textblob.txt'),JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
