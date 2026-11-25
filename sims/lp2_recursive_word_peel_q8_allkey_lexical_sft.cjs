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
  },
  {
    "path": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  },
  {
    "path": "resources/control/shakespeare_first300k.txt",
    "sha": "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
  }
];
function experiment(gp,trans,nat,lex,gibran,shakespeare){
 const g=JSON.parse(gp),native=JSON.parse(nat),q=8,B=29,pow=Array.from({length:q},(_,i)=>B**i),ALL=255;
 const assert=(b,m)=>{if(!b)throw Error(m)},mod=x=>(x%29+29)%29;
 const raw=s=>Array.from(s).filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c)),words=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(raw);
 const groups=words(trans.replace(/[\s/%]/g,"")).slice(2830,2896);
 assert(groups.length===66&&groups.flat().length===308&&groups.flat().join()===g.pages.slice(54,56).flatMap(p=>p.indices).join(),"physical source mismatch");
 const al=new Map(g.translit.map((s,i)=>[s,i])),dict=new Map(),id=w=>String.fromCharCode(...w),add=w=>dict.set(id(w),w);
 function variants(s,visit){const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function dfs(i,a){if(i===w.length){visit(a);return}for(let k=1;k<=3;k++){const t=w.slice(i,i+k);if(t.length!==k)continue;const v=k===3?t==="ING"?al.get("NG"):undefined:al.get(t);if(v!==undefined)dfs(i+k,[...a,v])}}dfs(0,[])}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],add)}
 for(const s of native.sections)for(const w of words(s.source_text))add(w);
 const by=Array.from({length:64},()=>[]);for(const w of dict.values())if(w.length<64)by[w.length].push(w);
 function peel(ws,inside){const layers=[];let pos=0;for(const w of ws){for(let d=0;d<Math.ceil(w.length/2);d++){if(!layers[d])layers[d]=[];layers[d].push(pos+d);if(d!==w.length-1-d)layers[d].push(pos+w.length-1-d)}pos+=w.length}const o=(inside?layers.reverse():layers).flat();assert(o.length===pos&&new Set(o).size===pos,"peel permutation");return o}
 function encode(ws,inside,key){const p=ws.flat(),o=peel(ws,inside),c=Array(p.length);let phase=0;for(const i of o){if(!p[i])c[i]=0;else{c[i]=(p[i]+key[phase])%29;phase=(phase+1)%q}}return c}
 function phaseMap(c,o,h){const ph=Array(c.length);let j=0,k=0;for(const i of o){if(c[i]===0&&((h>>k++)&1)){ph[i]=-1;continue}ph[i]=j;j=(j+1)%q}return ph}
 function allowed(c,ph){const a=Array(q).fill(0x1fffffff);for(let i=0;i<c.length;i++)if(ph[i]>=0)a[ph[i]]&=~(1<<c[i]);return a.map(m=>Array.from({length:B},(_,i)=>i).filter(i=>(m>>i)&1))}
 function digits(code){return pow.map(p=>Math.floor(code/p)%B)}
 function project(v,mask){let x=0;for(let j=0;j<q;j++)if(mask>>j&1)x+=v[j]*pow[j];return x}
 function domains(ws,c,ph,allow){let pos=0;const bits=allow.map(a=>a.reduce((m,x)=>m|(1<<x),0));return ws.map((w,i)=>{let mask=0;for(let a=0;a<w.length;a++)if(ph[pos+a]>=0)mask|=1<<ph[pos+a];const set=new Set();for(const p of by[w.length]){const v=new Int8Array(q).fill(-1);let ok=true;for(let a=0;a<w.length;a++){const t=ph[pos+a],x=p[a];if(t<0){if(x!==0){ok=false;break}continue}if(x===0){ok=false;break}const k=mod(c[pos+a]-x);if(!((bits[t]>>k)&1)||(v[t]>=0&&v[t]!==k)){ok=false;break}v[t]=k}if(ok){let code=0;for(let j=0;j<q;j++)if(v[j]>=0)code+=v[j]*pow[j];set.add(code)}}pos+=w.length;let cost=set.size;for(let j=0;j<q;j++)if(!(mask>>j&1))cost*=allow[j].length;return {i,len:w.length,mask,set,cost,maps:new Map()}})}
 function search(ds,allow,budget,limit){
  const all=ds.slice().sort((a,b)=>a.cost-b.cost||b.len-a.len||a.i-b.i),empty=all.filter(d=>!d.set.size).length;
  if(empty>budget||allow.some(a=>!a.length))return {empty,nodes:0,full:0,solutions:[],capped:false,anchors:[]};
  const anchors=all.slice(0,Math.min(all.length,10)),fullSeen=new Set(),sol=[],memo=new Set();let nodes=0,cap=false;
  function entryList(d,overlap,proj){if(!d.maps.has(overlap)){const m=new Map();for(const code of d.set){const v=digits(code),k=project(v,overlap);if(!m.has(k))m.set(k,[]);m.get(k).push(v)}d.maps.set(overlap,m)}return d.maps.get(overlap).get(proj)||[]}
  function check(v,code){if(fullSeen.has(code))return;fullSeen.add(code);let misses=0;for(const d of all)if(!d.set.has(project(v,d.mask))&&++misses>budget)return;sol.push({key:v.slice(),misses})}
  function fill(v,mask,code){if(cap)return;if(++nodes>limit){cap=true;return}if(mask===ALL){check(v,code);return}let j=0;while(mask>>j&1)j++;for(const k of allow[j]){v[j]=k;fill(v,mask|1<<j,code+k*pow[j]);if(cap)break}}
  function walk(i,v,mask,code,miss){if(cap||miss>budget)return;if(++nodes>limit){cap=true;return}if(mask===ALL){check(v,code);return}if(i===anchors.length){fill(v,mask,code);return}
   const tag=i+":"+mask+":"+code+":"+miss;if(memo.has(tag))return;memo.add(tag);
   const d=anchors[i],overlap=mask&d.mask,newmask=d.mask&~mask;
   if(!newmask){walk(i+1,v,mask,code,miss+Number(!d.set.has(project(v,d.mask))));return}
   for(const e of entryList(d,overlap,project(v,overlap))){const nv=v.slice();let nc=code;for(let j=0;j<q;j++)if(newmask>>j&1){nv[j]=e[j];nc+=nv[j]*pow[j]}walk(i+1,nv,mask|d.mask,nc,miss);if(cap)break}
   if(miss<budget)walk(i+1,v,mask,code,miss+1)
  }
  walk(0,Array(q).fill(0),0,0,0);
  return {empty,nodes,full:fullSeen.size,solutions:sol,capped:cap,anchors:anchors.map(d=>({i:d.i,len:d.len,mask:d.mask,n:d.set.size,cost:d.cost}))}
 }
 const spell=p=>p.map(x=>g.translit[x]).join("");
 function trial(ws,c,inside,budget,trainCount,truth){const o=peel(ws,inside),z=c.filter(x=>x===0).length;assert(z<=8,"too many zero events");let nodes=0,full=0,capped=0,precluded=0,solutions=[],minEmpty=Infinity,maxEmpty=0,legalMasks=0,first=null;
  for(let h=0;h<1<<z;h++){const ph=phaseMap(c,o,h),allow=allowed(c,ph);if(allow.some(a=>!a.length))continue;legalMasks++;const ds=domains(ws,c,ph,allow),r=search(ds.slice(0,trainCount),allow,budget,300000);nodes+=r.nodes;full+=r.full;capped+=Number(r.capped);precluded+=Number(r.empty>budget);minEmpty=Math.min(minEmpty,r.empty);maxEmpty=Math.max(maxEmpty,r.empty);if(h===0)first=r.anchors;
   for(const s of r.solutions){const p=c.map((x,i)=>ph[i]<0?0:mod(x-s.key[ph[i]]));assert(p.every((x,i)=>ph[i]<0?x===0:x!==0),"illegal full key");let pos=0;const w=ws.map(x=>{const y=p.slice(pos,pos+x.length);pos+=x.length;return y});assert(encode(w,inside,s.key).join()===c.join(),"exact forward replay");const hold=w.slice(trainCount);solutions.push({mask:h,key:s.key,trainMiss:s.misses,holdSupported:hold.filter(x=>dict.has(id(x))).length,heldCount:hold.length,exactKey:truth?truth.key.join()===s.key.join():null,exactRunes:truth?p.filter((x,i)=>x===truth.p[i]).length:null,preview:truth?null:w.map(spell).join(" ")})}
  }
  return {inside,z,masks:1<<z,legalMasks,nodes,full,capped,precluded,minEmpty,maxEmpty,solutions:solutions.length,first,top:solutions.slice(0,20),exact:truth?solutions.filter(x=>x.exactKey&&x.exactRunes===c.length).length:null}
 }
 let seed=3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function plant(text,inside){const donors=Array.from({length:64},()=>new Map());for(const s of new Set(text.match(/[A-Za-z]+/g)||[]))variants(s,w=>{if(w.length<64&&dict.has(id(w)))donors[w.length].set(id(w),w)});
  const ws=groups.map((w,i)=>{const pool=[...donors[w.length].values()].filter(p=>i===0||i===2?p.filter(x=>x===0).length===1:!p.includes(0));const fallback=pool.length?pool:[...donors[w.length].values()].filter(p=>!p.includes(0));assert(fallback.length,"no genuine donor length "+w.length);return fallback[rng()%fallback.length]});
  const p=ws.flat(),o=peel(ws,inside),freq=Array.from({length:q},()=>Array(29).fill(0));let phase=0;for(const i of o)if(p[i]){freq[phase][p[i]]++;phase=(phase+1)%q}const holds=p.filter(x=>!x).length;assert(holds<=4,"too many literal holds");
  const key=freq.map((row,j)=>{const target=j<2?1:0,choices=Array.from({length:B},(_,k)=>k).filter(k=>row[mod(-k)]===target);const fallback=choices.length?choices:Array.from({length:B},(_,k)=>k).filter(k=>row[mod(-k)]===0);return fallback[rng()%fallback.length]});
  const c=encode(ws,inside,key);assert(c.filter(x=>!x).length<=8,"too many control zeros");return {ws,p,c,key,holds,zeroConsumes:c.filter(x=>!x).length-holds}
 }
 const controls=[];for(const [text,inside] of [[gibran,false],[shakespeare,true]]){const p=plant(text,inside),r=trial(p.ws,p.c,inside,0,49,p);controls.push({holds:p.holds,zeroConsumes:p.zeroConsumes,truthKey:p.key,anchorWords:[spell(p.ws[49]),spell(p.ws[56])],...r})}
 const original=[];for(const inside of [false,true])original.push(trial(groups,groups.flat(),inside,3,66,null));
 return {dict:dict.size,controls,original};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify({inputs,...experiment(...data)},null,2));
