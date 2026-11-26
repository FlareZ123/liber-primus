'use strict';
const SYM="0123456789abcdefghijklmnopqrs",RUNES="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],N=29,Q=13,P=[18,13,10,13,8,24,9,26,15,18,18,5,15];
function check(x,m){if(!x)throw Error(m)}
function mod(x){return (x%29+29)%29}
const inv=Array.from({length:29},(_,x)=>Array.from({length:29},(_,y)=>y).find(y=>x*y%29===1)||0);
function load(t,d,a){const dict=new Set();for(const line of d.split(/\r?\n/)){const m=/^([a-z]+)\s+\d+$/.exec(line.trim());if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){dict.add(w);return;}for(let n=1;n<=3&&i+n<=s.length;n++){const q=s.slice(i,i+n),x=q==="ING"?21:A.indexOf(q);if(x>=0)rec(i+n,w+SYM[x])}}rec(0,"")}check(dict.size===38910,"base lexicon");for(const w of JSON.parse(a).added.split(/\s+/).filter(Boolean))dict.add(w);check(dict.size===38938,"lexicon");
const by=Array.from({length:60},()=>[]);for(const w of dict)by[w.length].push(w);for(const b of by)b.sort();const g=t.split("%").slice(0,3).join("").replace(/[\/\s]/g,"").split(/[^ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ]+/).filter(Boolean).map(w=>[...w].map(x=>SYM[RUNES.indexOf(x)]).join(""));check(g.length===158&&g.join("").length===729&&g.slice(2,58).join("").length===248,"source profile");check(g[0]+g[1]==="f8i36jr0fqil5","title");return {by,g}}

const FULL=(1<<29)-2,MAXQ=13;
function pop(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
function options(c,C,by){
 const out=[],seen=new Set();
 for(let s=0;s<Q;s++)for(const w of by[c.length]){
  const v=new Uint8Array(Q);let j=s,ok=true;
  for(let i=0;i<w.length;i++){
   const p=SYM.indexOf(w[i]),x=SYM.indexOf(c[i]);
   if(p===0){if(x!==0){ok=false;break}continue;}
   const a=mod(p-P[j]),b=mod(x-C[j]);
   if((a===0)!==(b===0)){ok=false;break}
   if(a){const slope=b*inv[a]%N;if(v[j]&&v[j]!==slope){ok=false;break}v[j]=slope}
   j=(j+1)%Q;
  }
  if(ok){const id=String.fromCharCode(s,j,...v);if(!seen.has(id)){seen.add(id);out.push({s,e:j,v,w})}}
 }
 const n=out.length,L=Math.ceil(n/32),any=Array.from({length:Q},()=>new Uint32Array(L)),val=Array.from({length:Q},()=>Array.from({length:N},()=>new Uint32Array(L)));
 const all=new Uint32Array(L);all.fill(0xffffffff);if(n%32)all[L-1]=2**(n%32)-1;
 for(let k=0;k<n;k++)for(let j=0;j<Q;j++){const a=out[k].v[j];(a?val[j][a]:any[j])[k>>>5]|=1<<(k&31)}
 const accept=val.map((vs,j)=>vs.map(v=>{const t=v.slice();for(let q=0;q<L;q++)t[q]|=any[j][q];return t}));
 return {out,n,L,all,accept};
}
function finalDecode(g,C,key,by,start=0,limit=Infinity){
 const maps=key.map((a,j)=>Array.from({length:N},(_,x)=>mod(P[j]+inv[a]*mod(x-C[j]))));
 const D=by.map(b=>new Set(b));
 let dp=Array(Q).fill(null);dp[start]={cost:0,path:[]};
 for(const c of g){const next=Array(Q).fill(null);for(let j=0;j<Q;j++)if(dp[j]){
  function walk(i,k,w){if(i===c.length){const cost=dp[j].cost+(D[w.length].has(w)?0:1);if(cost<=limit&&(!next[k]||cost<next[k].cost))next[k]={cost,path:[...dp[j].path,w]};return;}
   const x=SYM.indexOf(c[i]);if(!x)walk(i+1,k,w+"0");const p=maps[k][x];if(p)walk(i+1,(k+1)%Q,w+SYM[p]);}
  walk(0,j,"");
 }dp=next;if(dp.every(x=>!x))return null;}
 const best=dp.map((x,j)=>x?{...x,end:j}:null).filter(Boolean).sort((a,b)=>a.cost-b.cost)[0];return best||null;
}
function search(g,C,by,budget=3,nodeCap=200000,ms=15000){
 const start=Date.now(),ds=g.map(c=>options(c,C,by)),order=Array.from({length:g.length},(_,i)=>i).sort((a,b)=>g[b].length-g[a].length||ds[a].n-ds[b].n);
 const domains=ds.map(d=>d.all),key=new Uint8Array(Q),stats={nodes:0,joins:0,emptyRejects:0,fullKeys:0,fullRejects:0,cap:false,time:false},seen=new Set();let answer=null;
 function stop(){if(answer||stats.cap||stats.time)return true;if(stats.nodes>=nodeCap){stats.cap=true;return true}if((stats.nodes&127)===0&&Date.now()-start>ms){stats.time=true;return true}return false}
 function visit(key,rem,b,parent,changes){
  if(stop())return;stats.nodes++;
  let unknown=0;for(let j=0;j<Q;j++)unknown+=!key[j];
  if(!unknown){const id=String.fromCharCode(...key);if(seen.has(id))return;seen.add(id);stats.fullKeys++;const dec=finalDecode(g,C,[...key],by,0,budget);if(dec)answer={key:[...key],...dec};else stats.fullRejects++;return;}
  const rows=[],next=parent.slice();let pick=null,best=Infinity;
  for(const i of rem){
   const d=ds[i],a=parent[i];let bits=a,count=0;
   if(changes.length){bits=a.slice();for(const j of changes){const v=d.accept[j][key[j]];for(let z=0;z<d.L;z++)bits[z]&=v[z];}next[i]=bits;}
   for(const x of bits)count+=pop(x);
   if(!count){if(--b<0){stats.emptyRejects++;return;}continue;}
   rows.push(i);
   const score=Math.log2(count+1)/Math.min(unknown,Math.max(1,g[i].length-0.5));
   if(score<best){best=score;pick=i;}
  }
  if(rows.length<=b||pick===null){let j=key.findIndex(x=>!x);for(let a=1;a<N;a++){const k=key.slice();k[j]=a;visit(k,rows,b,next,[j]);if(stop())return;}return;}
  const d=ds[pick],bits=next[pick],remaining=rows.filter(x=>x!==pick),unique=new Map();let unconditional=false;
  for(let z=0;z<bits.length;z++){let w=bits[z]>>>0;while(w){const bit=31-Math.clz32(w&-w),id=32*z+bit;w=(w&(w-1))>>>0;const o=d.out[id],k=key.slice(),ch=[];for(let j=0;j<Q;j++)if(!k[j]&&o.v[j]){k[j]=o.v[j];ch.push(j)}if(!ch.length){unconditional=true;break;}const sig=String.fromCharCode(...k);if(!unique.has(sig))unique.set(sig,[k,ch]);}if(unconditional)break;}
  if(unconditional){visit(key,remaining,b,next,[]);return;}
  // Every admissible key either supports one exact lexical option or spends
  // one omission on this group. Group order and independent-phase feasibility
  // are only relaxations; final continuous-clock decoding is authoritative.
  for(const [k,ch] of unique.values()){stats.joins++;visit(k,remaining,b,next,ch);if(stop())return;}
  if(b>0)visit(key,remaining,b-1,next,[]);
 }
 visit(key,order,budget,domains,[]);
 return {stats,answer,elapsedMs:Date.now()-start,domains:ds.map(d=>d.n),exhausted:!answer&&!stats.cap&&!stats.time};
}
function plant(g,C,by,seed){let state=seed>>>0;function rand(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n}const key=Array.from({length:Q},()=>1+rand(28));let j=0;const truth=g.map(c=>by[c.length][rand(by[c.length].length)]),cipher=truth.map(w=>[...w].map(a=>{const p=SYM.indexOf(a);if(!p)return "0";const x=mod(C[j]+key[j]*(p-P[j]));j=(j+1)%Q;return SYM[x]}).join(""));return {key,truth,cipher,end:j}}
function run(t,d,a,ms=15000){const {g,by}=load(t,d,a),C=[...g[0]+g[1]].map(x=>SYM.indexOf(x)),train=g.slice(2,58),held=g.slice(58);let controls=[];for(const seed of [3301,1033]){const p=plant(train,C,by,seed);const s=search(p.cipher,C,by,0,200000,ms);controls.push({seed,exact:!!s.answer&&s.answer.key.every((x,j)=>x===p.key[j]),trueKey:p.key,truthWords:!!s.answer&&s.answer.path.every((x,j)=>x===p.truth[j]),...s});}
 const original=search(train,C,by,3,200000,ms);if(original.answer)original.holdout=finalDecode(held,C,original.answer.key,by,original.answer.end);
 return {controls,original};
}
if(typeof module!=="undefined")module.exports={run};
if(typeof require!=="undefined"&&require.main===module){const fs=require("fs");const x=run(fs.readFileSync("resources/liber-primus/lp2-transcription.txt","utf8"),fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),fs.readFileSync("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json","utf8"),Number(process.argv[2]||60000));console.log(JSON.stringify(x,null,2));}
