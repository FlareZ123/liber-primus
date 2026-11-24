'use strict';
const fs=require('node:fs');
function experiment(corpus,trans,solved,lex,injective=true,options={}){
 const gp=JSON.parse(corpus),mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(String(original.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original alignment");
 const source=JSON.parse(solved).sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,p.concat(v));}}
  go(0,[]);
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const w of ["A","I","O"])variants(w);for(const s of source)for(const w of s.w)add(w);
 const tries=rev=>dict.map(d=>{const root=new Map();for(const str of d){const p=Array.from(str,x=>x.charCodeAt(0));if(rev)p.reverse();let t=root;for(const x of p){if(!t.has(x))t.set(x,new Map());t=t.get(x)}}return root});
 const forward=tries(false),back=tries(true);
 function encrypt(words,primer,f){let s=primer;return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+s);s=f[p];return c}))}
 function perm(seed){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
 function relaxed(words,cap=100000){
 const ALL=(1<<29)-1,maskBits=m=>{const a=[];for(let v=0;v<29;v++)if(m&(1<<v))a.push(v);return a};
 function domain(w){
  const cand=[],seen=new Set();
  for(const str of dict[w.length]){
   const pt=Array.from(str,x=>x.charCodeAt(0)),m=new Int8Array(29).fill(-1),edges=[];let prev=-1,first=-1,ok=true;
   for(let j=0;j<w.length;j++){if(!pt[j]){if(w[j]){ok=false;break}continue}const h=mod(w[j]-pt[j]);if(first<0)first=h;
    if(prev>=0){if(m[prev]>=0&&m[prev]!==h){ok=false;break}if(m[prev]<0){m[prev]=h;edges.push([prev,h])}}prev=pt[j]
   }
   if(ok){const key=m.join(",");if(!seen.has(key)){seen.add(key);cand.push({edges,pt,first})}}
  }
  const by=Array.from({length:29},()=>({present:0n,values:Array(29).fill(0n)}));
  cand.forEach((c,i)=>{const b=1n<<BigInt(i);for(const [k,v] of c.edges){by[k].present|=b;by[k].values[v]|=b}});
  return {cand,by,full:(1n<<BigInt(cand.length))-1n};
 }
 const domains=words.map(domain);const stats={nodes:0,passes:0,wordChecks:0,domains:domains.map(d=>d.cand.length)};
 function prop(masks,active){
  let change=true;
  while(change){
   stats.passes++;change=false;
   const vals=masks.map(maskBits);
   for(let j=0;j<domains.length;j++){
    stats.wordChecks++;
    const d=domains[j],by=d.by;let a=active[j];
    for(let k=1;k<29;k++)if(masks[k]!==ALL&&(a&by[k].present)){
     let allowed=~by[k].present;for(const v of vals[k])allowed|=by[k].values[v];
     a&=allowed;if(!a)return null
    }
    if(!a)return null;
    if(a!==active[j]){active[j]=a;change=true}
    for(let k=1;k<29;k++)if(by[k].present&&(a&~by[k].present)===0n){
     let m=0;for(const v of maskBits(masks[k]))if(a&by[k].values[v])m|=1<<v;
     if(!m)return null;if(m!==masks[k]){masks[k]=m;change=true}
    }
   }
  }
  return {masks,active};
 }
 function search(masks,active){
  if(++stats.nodes>cap)throw Error("cap");
  const p=prop(masks,active);if(!p)return null;
  let best=-1,bestCount=Infinity;
  const free=[];for(let k=1;k<29;k++)if(masks[k]&(masks[k]-1))free.push(k);
  for(let j=0;j<domains.length;j++){
   let satisfied=active[j];for(const k of free){satisfied&=~domains[j].by[k].present;if(!satisfied)break}
   if(satisfied)continue;
   const count=active[j].toString(2).replace(/0/g,"").length;
   if(count<bestCount){best=j;bestCount=count}
  }
  if(best<0){const map=masks.map(m=>maskBits(m)[0]);return map}
  const d=domains[best],seen=new Set();
  for(let i=0;i<d.cand.length;i++)if(active[best]&(1n<<BigInt(i))){
   const edges=d.cand[i].edges.filter(([k])=>masks[k]&(masks[k]-1)),key=JSON.stringify(edges);
   if(seen.has(key))continue;seen.add(key);
   const next=masks.slice();for(const [k,v] of edges)next[k]=1<<v;
   const ans=search(next,active.slice());if(ans)return ans
  }
  return null;
 }
 let map=null,status="unsat";
 try{map=search(Array(29).fill(ALL),domains.map(d=>d.full));if(map)status="sat"}catch(e){if(e.message!=="cap")throw e;status="cap"}
 let example=null;
 if(map){
  const witnesses=domains.map(d=>d.cand.find(c=>c.edges.every(([k,v])=>map[k]===v)));
  assert(witnesses.every(Boolean),"witness");
  for(let i=0;i<words.length;i++){
   const c=witnesses[i];assert(String(encrypt([c.pt],c.first<0?0:c.first,map)[0])===String(words[i]),"replay")
  }
  example={map,plaintext:witnesses.map(c=>c.pt.map(x=>gp.translit[x]).join("")).join(" ")};
 }
 return {status,...stats,example};
}
 const offsets=[0];for(const w of original)offsets.push(offsets.at(-1)+w.length);
 const po=[0];for(const p of gp.pages.slice(0,56))po.push(po.at(-1)+p.indices.length);
 const out=[];
 for(const page of options.pages||[0,1,2,3,4,5,6,7,8,9,10]){
  if(page===50)continue;
  const a=offsets.findIndex(o=>o>=po[page]),b=offsets.findLastIndex(o=>o<=po[page+1]);
  const w=original.slice(a,b),n=offsets[b]-offsets[a];const r=relaxed(w,options.cap||100000);
  const {domains,...stat}=r;out.push({page,range:[offsets[a],offsets[b]],runes:n,...stat});
 }
 const controls=[];
 if(options.controls)for(const [name,seed] of [["jpg107-167",23],["0_loss_of_divinity",11],["0_welcome",2]]){
  const s=source.find(x=>x.name===name),f=perm(seed).map(x=>x%17),p=seed%29,ct=encrypt(s.w,p,f),r=relaxed(ct,options.cap||100000);
  const {domains,...stat}=r;controls.push({name,...stat});
 }
 return {lexicon:dict.reduce((a,d)=>a+d.size,0),out,controls};
}
const args=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(p,'utf8'));
const pages=process.argv.slice(2).map(Number);
console.log(JSON.stringify(experiment(...args,false,{pages:pages.length?pages:Array.from({length:56},(_,i)=>i),controls:!pages.length,cap:10000}),null,2));
