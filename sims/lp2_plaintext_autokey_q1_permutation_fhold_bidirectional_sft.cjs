'use strict';
const fs=require('node:fs');
function experiment(corpus,trans,solved,lex){
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
 function attack(words,fitN,cap=4000000){
  let cut=0,n=0;while(n<fitN&&cut<words.length)n+=words[cut++].length;
  const fit=words.slice(0,cut),f=Array(29).fill(-1),inv=Array(29).fill(-1),plain=Array(cut),train=[],held=[];
  const anchor=fit.map((w,i)=>({i,n:w.filter(v=>v!==0).length,l:w.length})).sort((a,b)=>b.n-a.n||b.l-a.l||a.i-b.i)[0].i;
  const stats={anchor,anchorLength:fit[anchor].length,fitRunes:n,heldRunes:words.flat().length-n,visits:0,anchorCandidates:0,maxWords:0,trainPaths:0,heldPaths:0};
  function bind(a,s){if(f[a]>=0)return f[a]===s?0:-1;if(inv[s]>=0)return -1;f[a]=s;inv[s]=a;return 1}
  function undo(a,s){f[a]=-1;inv[s]=-1}
  function complete(){const unused=inv.map((x,i)=>x<0?i:-1).filter(i=>i>=0);return f.map(x=>x<0?unused.shift():x)}
  function step(w,state,rev,cb,learn=true){
   const c=rev?w.slice().reverse():w,root=(rev?back:forward)[w.length];
   if(!root)return;
   function go(j,t,s,p){
    if(++stats.visits>cap)throw Error("cap");
    if(j===c.length){cb(s,rev?p.slice().reverse():p);return}
    const x=c[j];
    if(x===0&&t.has(0))go(j+1,t.get(0),s,p.concat(0));
    if(rev){
     const a=inv[s];
     if(a>0){if(t.has(a))go(j+1,t.get(a),mod(x-a),p.concat(a))}
     else if(a<0&&learn)for(const [v,ch] of t)if(v&&f[v]<0){bind(v,s);go(j+1,ch,mod(x-v),p.concat(v));undo(v,s)}
    }else{
     const k=f[s];
     if(k>=0){const v=mod(x-k);if(v&&t.has(v))go(j+1,t.get(v),v,p.concat(v))}
     else if(learn)for(const [v,ch] of t)if(v){const h=mod(x-v);if(inv[h]<0){bind(s,h);go(j+1,ch,v,p.concat(v));undo(s,h)}}
    }
   }
   go(0,root,state,[]);
  }
  function expand(l,r,ls,rs){
   stats.maxWords=Math.max(stats.maxWords,r-l-1);
   if(l<0&&r>=cut){
    const pt=plain.map(w=>w.slice());assert(String(encrypt(pt,ls,complete()).flat())===String(fit.flat()),"replay");
    train.push({primer:ls,last:rs,map:f.slice(),inv:inv.slice(),pt:pt.flat()});stats.trainPaths++;
    if(train.length>=1000)throw Error("solution cap");return;
   }
   const lc=l>=0?Math.log(dict[fit[l].length]?.size+1||1)-(inv[ls]>=0?5:0):Infinity;
   const rc=r<cut?Math.log(dict[fit[r].length]?.size+1||1)-(f[rs]>=0?5:0):Infinity;
   if(lc<=rc)step(fit[l],ls,true,(s,p)=>{plain[l]=p;expand(l-1,r,s,rs)});
   else step(fit[r],rs,false,(s,p)=>{plain[r]=p;expand(l,r+1,ls,s)});
  }
  let status="complete";
  try{
   for(const str of dict[fit[anchor].length]){
    f.fill(-1);inv.fill(-1);const p=Array.from(str,x=>x.charCodeAt(0)),c=fit[anchor];let first=-1,prev=-1,legal=true;
    for(let j=0;j<p.length;j++){if(!p[j]){if(c[j]){legal=false;break}continue}const s=mod(c[j]-p[j]);if(first<0)first=s;if(prev>=0&&bind(prev,s)<0){legal=false;break}prev=p[j]}
    if(!legal||prev<0)continue;stats.anchorCandidates++;plain[anchor]=p;expand(anchor-1,anchor+1,first,prev);
   }
  }catch(e){if(!["cap","solution cap"].includes(e.message))throw e;status=e.message}
  if(status==="complete")for(const t of train){
   for(let i=0;i<29;i++){f[i]=t.map[i];inv[i]=t.inv[i]}
   function hold(j,s,p){
    if(j===words.length){const all=t.pt.concat(p);let i=0;const ws=words.map(w=>{const a=all.slice(i,i+w.length);i+=w.length;return a});assert(String(encrypt(ws,t.primer,complete()).flat())===String(words.flat()),"hold replay");held.push({...t,all});stats.heldPaths++;if(held.length>=1000)throw Error("hold cap");return}
    step(words[j],s,false,(next,w)=>hold(j+1,next,p.concat(w)),false);
   }
   try{hold(cut,t.last,[])}catch(e){if(!["cap","hold cap"].includes(e.message))throw e;status=e.message;break}
  }
  return {status,stats,train,held};
 }
 const summarize=r=>({status:r.status,...r.stats,examples:r.held.slice(0,2).map(t=>t.all.map(i=>gp.translit[i]).join(""))});
 const controls=[];
 for(const [name,seed] of [["jpg107-167",23],["0_loss_of_divinity",11],["0_welcome",2]]){
  const s=source.find(x=>x.name===name),f=perm(seed),p=seed%29,ct=encrypt(s.w,p,f),r=attack(ct,200),truth=s.w.flat();
  const key=t=>t.primer===p&&t.map.every((v,i)=>v<0||v===f[i]);
  controls.push({name,...summarize(r),trueTrain:r.train.filter(t=>key(t)&&String(t.pt)===String(truth.slice(0,r.stats.fitRunes))).length,trueHeld:r.held.filter(t=>key(t)&&String(t.all)===String(truth)).length});
 }
 let i=original.length,n=0;while(n<308)n+=original[--i].length;assert(n===308,"terminal groups");
 const targets=[{name:"p54-p55",w:original.slice(i),fit:205},{name:"p0-p2",w:original.slice(0,158),fit:200}];
 const results=targets.map(t=>({name:t.name,...summarize(attack(t.w,t.fit))}));
 return {lexicon:dict.reduce((a,d)=>a+d.size,0),controls,results};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(p,'utf8'))),null,2));
