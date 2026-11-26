'use strict';
const fs=require('node:fs');
const path=require('node:path');

/** Exact tied-label permutation / historical additive inverse. @param {string[]} inputs */
function run(inputs){
 const [raw,tx,lex,donor,inkRaw]=inputs,c=JSON.parse(raw),ink=JSON.parse(inkRaw);
 const mod=x=>(x%29+29)%29,page=n=>c.pages.find(p=>p.page===n).indices,rune=new Map(c.runes.map((x,i)=>[x,i]));
 const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 let words=[],w=[];for(const p of tx.split('%').slice(3,8))for(const ch of p){if(rune.has(ch))w.push(rune.get(ch));else if((ch==='-'||ch==='.')&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 check(words.length===255&&words.flat().join()===[3,4,5,6,7].flatMap(page).join(),'source alignment');
 const red=new Set();let at=0;for(let p=3;p<=7;p++){for(const s of ink.pages.find(x=>x.page===p)?.red_spans||[])for(let i=0;i<s.length;i++)red.add(at+s.start+i);at+=page(p).length;}
 let off=0;const redIds=[],black=[];for(let i=0;i<words.length;i++){let n=words[i].filter((_,j)=>red.has(off+j)).length;check(n===0||n===words[i].length,'mixed ink');if(n)redIds.push(i);else black.push(words[i]);off+=words[i].length;}
 check(redIds.join()==='0,1,2,22,176,177,178,179,250,251,252,253,254','red ids');
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(word,native=true){let s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S'),a=[];for(let i=0;i<s.length;){if(native&&s.startsWith('ING',i)){a.push(21);i+=3;}else if(native&&s.startsWith('IO',i)){a.push(27);i+=2;}else{const t=tokens.find(t=>s.startsWith(t.s,i));check(t,'GP input');a.push(t.i);i+=t.s.length;}}return a;}
 const dictionary=new Set();for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+/);if(m)for(const n of [false,true])dictionary.add(gp(m[1],n).join(','));}
 const prime=[];for(let p=2;prime.length<1600;p++)if(prime.every(q=>q*q>p||p%q))prime.push(p);
 const keys=[{name:'prime-minus-one',k:prime.map(x=>mod(x-1)),phases:[0]},{name:'DIUINITY',k:gp('DIUINITY'),phases:Array.from({length:8},(_,i)=>i)},{name:'FIRFUMFERENFE',k:gp('FIRFUMFERENFE'),phases:Array.from({length:13},(_,i)=>i)}];
 check(keys[1].k.length===8&&keys[2].k.length===13,'historical key lengths');
 function groups(labels,dir){const g=Array.from({length:29},()=>[]);labels.forEach((x,i)=>g[x].push(i));return (dir===1?g:g.reverse()).filter(x=>x.length);}
 function enc(w,key,t,hold){const p=w.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key.k[t]);t=(t+1)%key.k.length;return y;});return {p,t};}
 /** Exhaust all within-word F paths, retain max lexical score per exit clock. */
 function opts(w,key,t,hold){const result=new Map();function visit(i,s,p){if(i===w.length){const score=Number(dictionary.has(p.join(','))),old=result.get(s);if(!old||score>old.score)result.set(s,{score,p:p.slice()});return;}if(hold&&w[i]===0){p.push(0);visit(i+1,s,p);p.pop();}const x=mod(w[i]-key.k[s]);if(!hold||x!==0){p.push(x);visit(i+1,(s+1)%key.k.length,p);p.pop();}}visit(0,t,[]);return result;}
 /** Exact DP[used-ID mask][clock] = maximal registered word count. */
 function solve(ws,labels,dir,key,hold,phases=key.phases){
  const gs=groups(labels,dir);let states=new Map(phases.map(t=>[t,{score:0,trace:null,phase:t}])),used=0,edges=0,peak=0;
  for(const ids of gs){const n=ids.length,limit=1<<n,dp=Array(limit),cache=ids.map(()=>new Map());dp[0]=states;
   for(let mask=0;mask<limit-1;mask++){const row=dp[mask];if(!row)continue;
    for(const [t,s] of row)for(let j=0;j<n;j++)if(!(mask&(1<<j))){
     let out=cache[j].get(t);if(!out){out=opts(ws[ids[j]],key,t,hold);cache[j].set(t,out);}
     const m=mask|(1<<j);for(const [nt,v] of out){edges++;let next=dp[m];if(!next){next=new Map();dp[m]=next;}const score=s.score+v.score,old=next.get(nt);if(!old||score>old.score)next.set(nt,{score,phase:s.phase,trace:{id:ids[j],p:v.p,prev:s.trace}});}
    }dp[mask]=undefined;
   }
   states=dp[limit-1]||new Map();peak=Math.max(peak,states.size);if(!states.size)return {legal:false,completedGroups:used,deadLabel:labels[ids[0]],edges,peak};used+=n;
  }
  let best=null;for(const s of states.values())if(!best||s.score>best.score)best=s;
  const seq=[];for(let x=best.trace;x;x=x.prev)seq.push(x);seq.reverse();
  check(seq.length===ws.length&&new Set(seq.map(x=>x.id)).size===ws.length,'permutation');
  check(seq.every((x,i)=>i===0||dir*(labels[x.id]-labels[seq[i-1].id])>=0),'label order');
  let t=best.phase;for(const x of seq){const e=enc(x.p,key,t,hold);check(e.p.join()===ws[x.id].join(),'replay');t=e.t;}
  return {legal:true,maxLex:best.score,total:ws.length,phase:best.phase,endStates:states.size,edges,peak,preview:seq.slice(0,12).map(x=>x.p.map(i=>c.translit[i]).join('')).join(' '),order:seq.map(x=>x.id)};
 }
 const scopes=[{name:'all',ws:words,labels:page(8)},{name:'black',ws:black,labels:page(8).slice(12,-1)}],result=[];
 for(const {name,ws,labels} of scopes)for(const dir of [1,-1])for(const key of keys)for(const hold of [false,true]){
  check(ws.length===labels.length,'label count');const out=solve(ws,labels,dir,key,hold);result.push({scope:name,dir,key:key.name,hold,...out});
 }
 const plain=(donor.match(/[A-Za-z]+/g)||[]).slice(200,275).map(x=>gp(x)),labels=page(8).slice(0,plain.length),order=groups(labels,1).flatMap(g=>g.slice().reverse()),controls=[];
 for(const key of keys)for(const hold of [false,true]){const phase=key.phases.at(-1);let t=phase;const ws=Array(plain.length);for(let i=0;i<plain.length;i++){const e=enc(plain[i],key,t,hold);ws[order[i]]=e.p;t=e.t;}const expected=plain.filter(p=>dictionary.has(p.join(','))).length;const out=solve(ws,labels,1,key,hold);check(out.legal&&out.maxLex>=expected,'positive control');controls.push({key:key.name,hold,expected,...out});}
 let active=new Set([0]);for(const x of page(56)){const next=new Set();for(const t of active){if(x===0)next.add(t);if(mod(x-keys[0].k[t])!==0)next.add(t+1);}active=next;}check(active.has(84),'p56 84 consuming ticks');
 return {dictionary:dictionary.size,redIds,source:scopes.map(s=>({scope:s.name,groups:s.ws.length,runes:s.ws.flat().length,maxClass:Math.max(...groups(s.labels,1).map(g=>g.length))})),control56FinalClocks:[...active],controls,result};
}

const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp2-ink-annotations.json"];
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
