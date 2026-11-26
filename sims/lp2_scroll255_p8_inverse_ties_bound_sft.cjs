'use strict';
const fs=require('node:fs');
const path=require('node:path');
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

 /** Inverse sort: printed groups occupy contiguous label blocks; labels
  * in p8 describe positions in original logical order. Every matching
  * assignment is a relaxed witness; clock intervals need not be jointly
  * achievable, making maximum matching a rigorous upper bound. */
 function bound(ws,labels,dir,key,hold){
  const slots=groups(labels,dir),blocks=[];let cursor=0;
  for(const group of slots){const ids=Array.from({length:group.length},(_,i)=>cursor+i);cursor+=group.length;blocks.push({label:labels[group[0]],slots:group,ids});}
  check(cursor===ws.length,'block partition');
  const minLen=ws.map(w=>w.length-(hold?w.filter(x=>x===0).length:0)),maxLen=ws.map(w=>w.length);
  const select=(ids,n,values,desc=false)=>ids.map(i=>values[i]).sort((a,b)=>desc?b-a:a-b).slice(0,n).reduce((s,x)=>s+x,0);
  const counts=Array(29).fill(0),edge=Array.from({length:ws.length},()=>[]),memo=ws.map(()=>new Map());
  let probes=0,rangeMin=Infinity,rangeMax=0;
  for(let i=0;i<labels.length;i++){
   const l=labels[i],block=blocks.find(x=>x.label===l);
   let lo=0,hi=0;
   for(const other of blocks)if(other.label!==l){lo+=select(other.ids,counts[other.label],minLen);hi+=select(other.ids,counts[other.label],maxLen,true);}
   for(const id of block.ids){
    const rest=block.ids.filter(j=>j!==id),a=lo+select(rest,counts[l],minLen),z=hi+select(rest,counts[l],maxLen,true);
    check(a<=z,'clock interval');
    rangeMin=Math.min(rangeMin,z-a);rangeMax=Math.max(rangeMax,z-a);
    const period=key.k.length,starts=key.name==='prime-minus-one'?Array.from({length:z-a+1},(_,j)=>a+j):key.phases;
    let witness=null;
    for(const t of starts){
      let score=memo[id].get(t);
      if(score===undefined){score=[...opts(ws[id],key,t,hold).values()].some(v=>v.score===1);memo[id].set(t,score);probes++;}
      if(score){witness=t;break;}
    }
    if(witness!==null)edge[i].push({id,t:witness});
   }
   counts[l]++;
  }
  // Maximum cardinality lexical-edge matching. Unmatched slots/IDs may
  // be paired arbitrarily; the chosen clock witnesses are independent.
  const matched=Array(ws.length).fill(-1);
  function augment(i,seen){for(const {id} of edge[i])if(!seen.has(id)){seen.add(id);if(matched[id]<0||augment(matched[id],seen)){matched[id]=i;return true;}}return false;}
  let maxLex=0;
  for(let i=0;i<ws.length;i++)maxLex+=Number(augment(i,new Set()));
  const edges=edge.reduce((n,a)=>n+a.length,0),supportedWords=new Set(edge.flatMap(a=>a.map(x=>x.id))).size;
  const witnesses=matched.flatMap((i,id)=>i<0?[]:[{slot:i,id,clock:edge[i].find(x=>x.id===id).t}]);
  check(witnesses.length===maxLex&&new Set(witnesses.map(x=>x.slot)).size===maxLex,'matching uniqueness');
  return {maxLexUpper:maxLex,total:ws.length,edges,supportedWords,emptySlots:edge.filter(x=>!x.length).length,probes,rangeMin,rangeMax,witnesses};
 }
 const scopes=[{name:'all',ws:words,labels:page(8)},{name:'black',ws:black,labels:page(8).slice(12,-1)}],result=[];
 for(const {name,ws,labels} of scopes)for(const dir of [1,-1])for(const key of keys)for(const hold of [false,true])result.push({scope:name,dir,key:key.name,hold,...bound(ws,labels,dir,key,hold)});
 const controls=[];
 for(const [offset,dir] of [[2000,1],[5000,-1]]){
  const plain=(donor.match(/[A-Za-z]+/g)||[]).slice(offset,offset+75).map(x=>gp(x)),labels=page(8).slice(0,plain.length);
  for(const key of keys)for(const hold of [false,true]){
   const phase=key.phases.at(-1);let t=phase;
   const encrypted=plain.map(p=>{const e=enc(p,key,t,hold);t=e.t;return e.p;});
   const order=groups(labels,dir).flatMap(g=>g.slice().reverse()),ws=order.map(i=>encrypted[i]);
   const expected=plain.filter(p=>dictionary.has(p.join(','))).length,out=bound(ws,labels,dir,key,hold);
   check(out.maxLexUpper>=expected,'positive lexical matching');
   controls.push({offset,dir,key:key.name,hold,expected,...out});
  }
 }
 return {dictionary:dictionary.size,redIds,result,controls};
}

const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp2-ink-annotations.json"];
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
