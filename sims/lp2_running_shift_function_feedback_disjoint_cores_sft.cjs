'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function experiment(corpus,trans,solved,lex,options={}){
 const gp=JSON.parse(corpus),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const all=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(all.length===2896&&String(all.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original alignment");
 const native=JSON.parse(solved).sections.map(s=>({name:s.name,words:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))}
 function variants(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,p.concat(v));}}go(0,[])
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1])}
 for(const s of native)for(const w of s.words)add(w);
 const forms=dict.map(d=>Array.from(d,str=>Array.from(str,x=>x.charCodeAt(0))));
 function domain(w,hold){
  const map=new Map();
  for(const pt of forms[w.length]||[]){
   const f=new Int8Array(29).fill(-1);let last=-1,pLast=-1,ok=true;
   for(let i=0;i<w.length;i++){
    const p=pt[i],c=w[i];if(hold&&!p){if(c){ok=false;break}continue}
    const s=mod(c-p);
    if(last>=0){const v=mod(s-pLast);if(f[last]>=0&&f[last]!==v){ok=false;break}f[last]=v}
    last=s;pLast=p;
   }
   if(ok){const e=[];for(let k=0;k<29;k++)if(f[k]>=0)e.push([k,f[k]]);const key=String(f);if(!map.has(key))map.set(key,{e,f,pt})}
  }
  return [...map.values()];
 }
 function encrypt(words,primer,f,hold){
  let s=primer;return words.map(w=>w.map(p=>{if(hold&&!p)return 0;const c=mod(p+s);s=mod(f[s]+p);return c}))
 }
 function popcount(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24}
 function prepare(d,i,L){
  const n=d.length,B=Math.ceil(n/32),all=new Uint32Array(B).fill(0xffffffff);
  if(B&&n%32)all[B-1]=0xffffffff>>>(32-n%32);
  const any=Array.from({length:29},()=>new Uint32Array(B)),eq=Array.from({length:29},()=>Array(29).fill(null));
  for(let a=0;a<n;a++)for(const [k,v] of d[a].e){any[k][a>>>5]|=1<<(a%32);if(!eq[k][v])eq[k][v]=new Uint32Array(B);eq[k][v][a>>>5]|=1<<(a%32)}
  return {d,i,L,n,B,all,any,eq};
 }
 function* members(bs){for(let i=0;i<bs.length;i++){let b=bs[i]>>>0;while(b){const v=b&-b,k=31-Math.clz32(v);yield i*32+k;b=(b^v)>>>0}}}
 function search(words,hold,minLen,cap=2000000){
  const gs=words.map((w,i)=>({w,i})).filter(x=>x.w.length>=minLen).map(({w,i})=>prepare(domain(w,hold),i,w.length));
  const f=new Int8Array(29).fill(-1);let nodes=0,filters=0,maxAssigned=0,dead=0;let witness=null;
  function dfs(active){
   if(++nodes>cap||filters>300000)throw Error("cap");
   maxAssigned=Math.max(maxAssigned,f.filter(v=>v>=0).length);
   if(!active.length){witness=Array.from(f);return true}
   let best=-1,score=Infinity;
   const retained=[];
   for(const a of active){
    if(!a.n)return false;
    let satisfied=false,avg=0,count=0;
    for(const x of members(a.bs)){const c=a.g.d[x];let n=0;for(const [k] of c.e)if(f[k]<0)n++;if(!n){satisfied=true;break}if(count<64){avg+=n;count++}}
    if(satisfied)continue;
    retained.push(a);
    const v=Math.log(a.n)/(1+avg/Math.max(1,count))**1.25;
    if(v<score){score=v;best=retained.length-1}
   }
   if(!retained.length){witness=Array.from(f);return true}
   const a=retained[best],rest=retained.filter((_,i)=>i!==best);
   for(const ci of members(a.bs)){
    const c=a.g.d[ci],added=[];let ok=true;
    for(const [k,v] of c.e){if(f[k]<0){f[k]=v;added.push([k,v])}else if(f[k]!==v){ok=false;break}}
    if(ok){
     const next=[];
     for(const b of rest){
      const g=b.g,bs=new Uint32Array(g.B);let n=0;
      for(let j=0;j<g.B;j++){let z=b.bs[j];for(const [k,v] of added){z&=(~g.any[k][j])|(g.eq[k][v]?.[j]||0);if(!z)break}bs[j]=z;n+=popcount(z)}
      filters++;if(filters>300000)throw Error("cap");if(!n){ok=false;dead++;break}next.push({g,bs,n})
     }
     if(ok&&dfs(next))return true;
    }
    for(const [k] of added)f[k]=-1;
   }
   return false;
  }
  let status="complete",sat=null;try{sat=dfs(gs.map(g=>({g,bs:g.all,n:g.n})))}catch(e){if(e.message!=="cap")throw e;status="cap"}
  return {status,sat,groups:gs.length,nodes,filters,dead,maxAssigned,witness,domains:gs.map(g=>[g.i,g.L,g.n])}
 }
 function perm(seed){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const terminal=all.slice(2830,2896);assert(terminal.flat().length===308&&String(terminal.flat())===String(gp.pages.slice(54,56).flatMap(x=>x.indices)),"terminal alignment");

 const results=[];
 function partition(words,hold,minLen,k){
   const groups=words.map((w,i)=>({w,i})).filter(x=>x.w.length>=minLen).map(x=>({...x,weight:Math.max(0.1,x.w.length-1-Math.log(Math.max(1,domain(x.w,hold).length))/Math.log(29))})).sort((a,b)=>b.weight-a.weight||a.i-b.i);
   const buckets=Array.from({length:k},()=>({items:[],weight:0}));
   for(const x of groups){const b=buckets.reduce((a,b)=>a.weight<=b.weight?a:b);b.items.push(x);b.weight+=x.weight}
   const out=buckets.map(b=>({indices:b.items.map(x=>x.i),weight:b.weight,...search(b.items.map(x=>x.w),hold,minLen,40000)}));
   return {k,forcedOOV:out.filter(x=>x.status==="complete"&&x.sat===false).length,parts:out};
 }
 for(const hold of [true,false]) {
  results.push({name:"terminal",hold,...partition(terminal,hold,4,3)});
  results.push({name:"opening",hold,...partition(all.slice(0,158),hold,7,4)});
 }
 return {dict:dict.reduce((a,d)=>a+d.size,0),results};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify({inputs,...experiment(...data)},null,2));
