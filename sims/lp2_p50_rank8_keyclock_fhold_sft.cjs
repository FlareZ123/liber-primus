"use strict";
// Agent8: ascending row-rank clock, transparent plaintext F, exact partial-key anchor join.
function experiment(inputs){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[2]),grid=JSON.parse(inputs[3]),M=new Map(gp.runes.map((v,i)=>[v,i])),A=new Map(gp.translit.map((v,i)=>[v,i]));
 const assert=(v,s)=>{if(!v)throw Error(s)},mod=x=>(x+29)%29,parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(x=>M.get(x))),solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(x=>M.get(x))));
 const ws=parse(inputs[1]).slice(0,2896),flat=ws.flat();assert(String(flat)===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"canonical words");const start=gp.pages.slice(0,51).reduce((n,p)=>n+p.indices.length,0),end=gp.pages.slice(0,54).reduce((n,p)=>n+p.indices.length,0);let at=0;const target=[];for(const w of ws){if(at>=start&&at+w.length<=end)target.push(w);at+=w.length}assert(target.flat().length===534&&target.length===118,"p51–53 exact");
 const clock=[];for(let i=0;i<256;i+=8){const v=grid.bytes.slice(i,i+8);assert(new Set(v).size===8,"unique row");clock.push(...v.map((_,j)=>j).sort((a,b)=>v[a]-v[b]))}assert(String(clock.slice(0,8))==="4,6,2,7,3,0,1,5","row order");
 const slot=j=>clock[j%256],code=k=>String.fromCharCode(...k.map(x=>65+x)),mask=k=>k.reduce((m,x,i)=>x<0?m:m|(1<<i),0);
 function makeLex(exclude){
  const by=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)by[w.length].set(code(w),w)};
  for(const l of inputs[4].split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(!m||m[1].length<2)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/'/g,"");function walk(i,w){if(i===s.length){add(w);return}for(let n=1;n<=3;n++){const t=s.slice(i,i+n);if(t.length!==n)continue;const a=n===3?(t==="ING"?21:undefined):t==="IO"?27:A.get(t);if(a!==undefined)walk(i+n,[...w,a])}}walk(0,[])}
  for(const s of ["A","I","O"])add([A.get(s)]);
  for(const [i,sec] of solved.entries())if(i!==exclude)for(const w of sec)add(w);
  return by;
 }
 function encode(p,k){let j=0;return p.map(v=>v===0?0:mod(v+k[slot(j++)]))}
 function bigram(exclude){const counts=Array.from({length:30},()=>Array(29).fill(0.5));for(const [i,s] of solved.entries())if(i!==exclude){let last=29;for(const v of s.flat()){counts[last][v]++;last=v}}return counts.map(row=>{let n=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(x/n))})}
 function paths(c,k,j0=0){let s=new Set([j0]);for(const v of c){const t=new Set();for(const j of s){if(v===0)t.add(j);const a=k[slot(j)];if(a<0||v!==a)t.add(j+1)}s=t;if(!s.size)break}return s.size}
 function better(a,b){return !b||a.lex>b.lex||(a.lex===b.lex&&a.score>b.score)}
 function best(cws,k,lm,lex,j0=0,last=29){
  let states=new Map([[j0*30+last,{j:j0,last,score:0,lex:0,p:[]}]]);
  for(const w of cws){const next=new Map();
   for(const s of states.values()){
    const p=[];
    function walk(i,j,prev,score){
     if(i===w.length){const q={j,last:prev,score,lex:s.lex+(lex[p.length]?.has(code(p))?p.length:0),p:[...s.p,...p]},tag=j*30+prev;if(better(q,next.get(tag)))next.set(tag,q);return}
     const v=w[i];
     if(v===0){p.push(0);walk(i+1,j,0,score+lm[prev][0]);p.pop()}
     const x=mod(v-k[slot(j)]);if(x!==0){p.push(x);walk(i+1,j+1,x,score+lm[prev][x]);p.pop()}
    }
    walk(0,s.j,s.last,s.score);
   }
   states=next;if(!states.size)return null;
  }
  return [...states.values()].reduce((a,b)=>better(b,a)?b:a,null);
 }
 function groups(cws,lex){
  let off=0,z=0;const candidates=[];
  for(const w of cws){const n=w.filter(v=>v!==0).length;candidates.push({off,z,w,n});off+=w.length;z+=w.length-n}
  const anchors=candidates.sort((a,b)=>b.n-a.n||b.w.length-a.w.length||a.off-b.off).slice(0,6);
  return anchors.map(a=>{const grouped=new Map();let tuples=0;for(let h=0;h<=a.z;h++)for(const p of lex[a.w.length].values()){let j=a.off-h,k=Array(8).fill(-1),ok=true;for(let i=0;i<p.length;i++){if(p[i]===0){if(a.w[i]!==0){ok=false;break}continue}const u=slot(j++),v=mod(a.w[i]-p[i]);if(k[u]>=0&&k[u]!==v){ok=false;break}k[u]=v}if(!ok)continue;tuples++;const m=mask(k);if(!grouped.has(m))grouped.set(m,new Map());grouped.get(m).set(code(k),k)}return {...a,tuples,grouped,keys:[...grouped.values()].reduce((s,g)=>s+g.size,0)}});
 }
 function join(anchors,c){
  const all=new Map(),hist={},pairs=[];let joins=0,capped=false;
  outer:for(let a=0;a<anchors.length;a++)for(let b=a+1;b<anchors.length;b++){let n=0;for(const [ma,as] of anchors[a].grouped)for(const [mb,bs] of anchors[b].grouped){const common=Array.from({length:8},(_,i)=>i).filter(i=>((ma&mb)>>i)&1),sig=k=>String.fromCharCode(...common.map(i=>65+k[i])),index=new Map();for(const k of as.values()){const s=sig(k);if(!index.has(s))index.set(s,[]);index.get(s).push(k)}for(const l of bs.values())for(const k of index.get(sig(l))||[]){n++;joins++;const u=k.map((x,i)=>x<0?l[i]:x),tag=code(u);if(!all.has(tag)){all.set(tag,u);if(all.size>200000){capped=true;break outer}}}}pairs.push({a,b,joins:n})}
  let legal=0,full=0,partial=0;const keys=[];for(const k of all.values()){const missing=k.filter(v=>v<0).length;hist[missing]=(hist[missing]||0)+1;if(!paths(c,k))continue;legal++;if(!missing){full++;keys.push(k)}else partial++}
  return {keys,summary:{joins,unique:all.size,hist,pairs,capped,legal,full,partial}};
 }
 function run(label,ws,exclude,truth=null){
  let off=0,cut=0;while(off<350&&cut<ws.length){off+=ws[cut++].length}const c=ws.flat(),pre=c.slice(0,off),suffix=c.slice(off),lex=makeLex(exclude),lm=bigram(exclude),anchors=groups(ws.slice(0,cut),lex),joined=join(anchors,pre);
  const ranked=joined.keys.map(k=>({k,b:best(ws.slice(0,cut),k,lm,lex)})).filter(x=>x.b).sort((a,b)=>b.b.lex-a.b.lex||b.b.score-a.b.score),win=ranked[0],hold=win?best(ws.slice(cut),win.k,lm,lex,win.b.j,win.b.last):null;
  const p=win&&hold?[...win.b.p,...hold.p]:null;if(p)assert(String(encode(p,win.k))===String(c),"full replay");
  return {label,n:c.length,fit:off,holdout:suffix.length,lexicon:lex.reduce((n,d)=>n+d.size,0),anchors:anchors.map(a=>({offset:a.off,length:a.w.length,nonzero:a.n,possibleStarts:a.z+1,tuples:a.tuples,keys:a.keys})),...joined.summary,truthKey:truth?.key??null,truthInCandidates:truth?joined.keys.some(k=>String(k)===String(truth.key)):null,winner:win?{key:win.k,fitLex:win.b.lex,fitScore:win.b.score/off,holdLex:hold?.lex??null,holdScore:hold?hold.score/suffix.length:null,preview:p?p.slice(0,120).map(v=>gp.translit[v]).join(" "):null,heldExact:truth&&hold?hold.p.filter((v,i)=>v===truth.p[off+i]).length:null,fullReplay:!!p}:null,runnerUp:ranked[1]?{lex:ranked[1].b.lex,score:ranked[1].b.score/off}:null};
 }
 const controls=[];for(const [i,key] of [[1,[2,7,13,19,23,3,11,5]],[4,[24,3,14,9,22,2,17,4]],[3,[15,6,25,2,8,21,11,18]]]){let n=0;const words=[];for(const w of solved[i]){if(n+w.length>534)break;words.push(w);n+=w.length}const p=words.flat(),c=encode(p,key);let j=0;const cws=words.map(w=>{const q=c.slice(j,j+w.length);j+=w.length;return q});controls.push(run(native.sections[i].name,cws,i,{key,p}))}
 const pass=controls.every(x=>!x.capped&&x.winner&&String(x.winner.key)===String(x.truthKey)&&x.winner.fullReplay);
 return {clock,controls,pass,target:pass?run("original p51–53",target,-1):null};
}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-grid-256.json","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
