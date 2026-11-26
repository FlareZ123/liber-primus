"use strict";
function experiment(inputs){
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),s=donor(sh);for(const p of [...g,...s])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"lexicon");

 const words=[];let w=[];
 for(const c of raw.split('%').slice(0,55).join('%')){if(map.has(c))w.push(map.get(c));else if(!'%/'.includes(c)&&! /\s/u.test(c)&&w.length){words.push(w);w=[];}}
 if(w.length)words.push(w);assert(words.length===2896&&String(words.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original words");
 const code=x=>String.fromCharCode(...x.map(v=>65+v)),decode=x=>[...x].map(c=>c.charCodeAt(0)-65);
 const maxLen=Math.max(...words.map(w=>w.length)),all=dict.flatMap(d=>[...d.values()]);
 const keymaps=[false,true].map(rev=>Array.from({length:maxLen+1},(_,m)=>{const out=new Map();if(!m)return out;for(const k0 of all){const k=rev?k0.slice().reverse():k0;const s=code(Array.from({length:m},(_,j)=>k[j%k.length]));let a=out.get(s);if(!a)out.set(s,a=[]);a.push(code(k0));}return out;}));
 function emit(P,K,sign,rev,hold){let t=0;const k=rev?K.slice().reverse():K;return P.map(v=>hold&&v===0?0:mod(v+sign*k[t++%k.length]));}
 // Exact candidate edges for a ciphertext group. All F histories are determined by the candidate P.
 function edges(C,sign,rev,mixed=true){
  const res=new Map();
  for(const p of dict[C.length].values()){
   const pk=code(p);
   for(const hold of mixed?[false,true]:[true]){
    const k=[];let ok=true;
    for(let j=0;j<C.length;j++){if(hold&&p[j]===0){if(C[j]!==0){ok=false;break;}}else k.push(mod(sign*(C[j]-p[j])));}
    if(!ok)continue;
    const a=k.length?keymaps[+rev][k.length].get(code(k)):all.map(code);
    if(!a)continue;
    for(const kk of a){const id=kk+":"+pk;let old=res.get(id);if(!old){assert(String(emit(p,decode(kk),sign,rev,hold))===String(C),"candidate replay");res.set(id,{k:kk,p:pk,hold:hold?2:1});}else old.hold|=hold?2:1;}
   }
  }
  return [...res.values()];
 }
 const eligible=words.map((c,i)=>({c,i})).filter(x=>x.c.length>=8);assert(eligible.length===343,"anchor count");
 let seed=0x44f3301;function rand(){return seed=(Math.imul(seed,1664525)+1013904223)>>>0}
 const shuf=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=rand()%(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
 function control(src,sign,rev,mixed,off){
  // Contiguous native donor words, independent of original shape; words all in frozen register.
  const start=Math.floor(src.length*.8)+off;const P=src.slice(start,start+601);
  assert(P.every(p=>dict[p.length]?.has(String(p))),"control register");
  const E=P.slice(1).map((p,i)=>{const hold=mixed?(i%2===0):true;const k=P[i];return {c:emit(p,k,sign,rev,hold),p:code(p),k:code(k),hold,i}});
  const anchors=shuf(E).filter(x=>x.c.length>=8);let uniqueP=0,uniquePair=0,total=0;const lens={};
  for(const a of anchors){const e=edges(a.c,sign,rev,mixed);assert(e.some(x=>x.p===a.p&&x.k===a.k&&(x.hold&(a.hold?2:1))),"lost actual predecessor/current pair");total+=e.length;uniqueP+=new Set(e.map(x=>x.p)).size===1;uniquePair+=e.length===1;lens[a.c.length]=(lens[a.c.length]??0)+1;}
  return {sign,rev,mixed,words:E.length,anchors:anchors.length,uniqueP,uniquePair,total,lens};
 }
 const controls=[control(g,1,false,true,0),control(s,-1,false,true,0),control(s,1,true,true,1000),control(g,-1,true,false,500)];
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pageStarts=[0];for(const p of gp.pages.slice(0,56))pageStarts.push(pageStarts.at(-1)+p.indices.length);
 const starts=[0];for(const x of words)starts.push(starts.at(-1)+x.length);
 const byChapter=chapters.map(([p,q])=>words.flatMap((w,i)=>starts[i]>=pageStarts[p]&&starts[i+1]<=pageStarts[q+1]?[i]:[]));
 const budget=Math.floor(words.length*.05);
 function original(){
  const result=[];
  for(const sign of [1,-1])for(const rev of [false,true]){
   const E=eligible.map(({c,i})=>({i,len:c.length,edges:edges(c,sign,rev,true)}));
   const supported=E.filter(x=>x.edges.length>0),unsupported=E.length-supported.length;
   const chapterResults=byChapter.map((ids,j)=>{const set=new Set(ids),a=E.filter(x=>set.has(x.i)),bad=a.filter(x=>!x.edges.length).length,B=Math.floor(ids.length*.05);return {chapter:chapters[j],groups:ids.length,anchors:a.length,unsupported:bad,budget:B,lowerOOV:Math.max(0,Math.ceil((bad-1)/2))}});
   result.push({sign,rev,anchors:E.length,supported:supported.length,unsupported,lowerOOV:Math.max(0,Math.ceil((unsupported-chapters.length)/2)),budget,chapterResults,edges:supported});
  }
  return result;
 }
 return {vocabulary,maxLen,words:words.length,controls,original:original()};
}

const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
