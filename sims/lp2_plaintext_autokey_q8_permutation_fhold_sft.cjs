'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,trans,solved,lex){
 const gp=JSON.parse(corpus),native=JSON.parse(solved),q=8;
 const mod=x=>((x%29)+29)%29, assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(String(original.flat())===String(gp.pages.slice(0,56).flatMap(x=>x.indices)),"original word/corpus alignment");
 const source=native.sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const dict=Array.from({length:40},()=>new Set());
 const add=w=>{if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w))};
 function variants(w){
  const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return;}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,[...p,v]);}}
  go(0,[]);
 }
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const w of ["A","I","O"])variants(w);
 for(const s of source)for(const w of s.w)add(w);
 const makeTries=rev=>dict.map(d=>{const root=new Map();for(const word of d){let t=root;const p=Array.from(word,x=>x.charCodeAt(0));if(rev)p.reverse();for(const x of p){if(!t.has(x))t.set(x,new Map());t=t.get(x);}}return root});
 const tries=makeTries(false),reverse=makeTries(true);
 function encrypt(words,primer,map){let queue=primer.slice();return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+queue[0]);queue=queue.slice(1).concat(map[p]);return c}))}
 function complete(map,inv){const r=map.slice(),unused=Array.from({length:29},(_,i)=>i).filter(i=>inv[i]<0);for(let i=0;i<29;i++)if(r[i]<0)r[i]=unused.shift();return r}
 const cutAt=(w,n)=>{let count=0,j=0;while(count<n&&j<w.length)count+=w[j++].length;return j};
 function attack(words,splitAt,cap=12000000){
  const cut=cutAt(words,splitAt),fit=words.slice(0,cut);
  const offsets=[0],nz=[0];for(const w of words){offsets.push(offsets.at(-1)+w.length);for(const c of w)nz.push(nz.at(-1)+Number(c!==0))}
  const eligible=fit.map((w,i)=>({i,len:w.length,nonzero:w.filter(x=>x!==0).length})).filter(v=>nz[offsets[v.i]]>=q&&v.nonzero>=q).sort((a,b)=>b.nonzero-a.nonzero||b.len-a.len||a.i-b.i);
  const anchor=eligible[0]?.i??-1;
  const stats={fitRunes:offsets[cut],heldRunes:offsets.at(-1)-offsets[cut],anchor,anchorOffset:offsets[anchor],anchorLength:fit[anchor]?.length,visits:0,anchorCandidates:0,furthestWords:0,completedAnchors:0,trainPaths:0,heldPaths:0};
  if(anchor<0)return {stats,status:"no anchor",train:[],test:[]};
  const f=Array(29).fill(-1),inv=Array(29).fill(-1),pl=Array(cut),train=[],test=[];
  function set(k,v){if(f[k]>=0)return f[k]===v?0:-1;if(inv[v]>=0)return -1;f[k]=v;inv[v]=k;return 1}
  function unset(k,v){f[k]=-1;inv[v]=-1}
  function step(c,queue,rev,emit,unknown=true){
   const seq=rev?c.slice().reverse():c,root=(rev?reverse:tries)[c.length];
   if(!root)return;
   function go(j,t,k,p){
    if(++stats.visits>cap)throw Error("cap");
    if(j===seq.length){emit(k,rev?p.slice().reverse():p);return}
    const x=seq[j];
    if(!x&&t.has(0))go(j+1,t.get(0),k,p.concat(0));
    if(rev){
     const s=k.at(-1),v=inv[s];
     if(v>=0){if(v&&t.has(v))go(j+1,t.get(v),[mod(x-v),...k.slice(0,-1)],p.concat(v));}
     else if(unknown)for(const [v,ch] of t)if(v&&f[v]<0){set(v,s);go(j+1,ch,[mod(x-v),...k.slice(0,-1)],p.concat(v));unset(v,s);}
    }else{
     const u=k[0],s=f[u];
     if(s>=0){const v=mod(x-s);if(v&&t.has(v))go(j+1,t.get(v),k.slice(1).concat(v),p.concat(v));}
     else if(unknown)for(const [v,ch] of t)if(v){const s=mod(x-v);if(inv[s]<0){set(u,s);go(j+1,ch,k.slice(1).concat(v),p.concat(v));unset(u,s);}}
    }
   }
   go(0,root,queue,[]);
  }
  function cost(word,k,rev){
   const w=word.filter(x=>x!==0).length,n=Math.min(w,q),seen=new Set();let known=0;
   for(let i=0;i<n;i++){const v=k[rev?q-1-i:i];if((rev?inv[v]:f[v])>=0||seen.has(v))known++;seen.add(v)}
   return Math.log(dict[word.length]?.size+1||1)-2.5*known;
  }
  function expand(l,r,kl,kr){
   const done=r-l-1;stats.furthestWords=Math.max(stats.furthestWords,done);
   if(l<0&&r>=cut){
    const filled=complete(f,inv),plain=pl.map(w=>w.slice());
    assert(String(encrypt(plain,kl,filled).flat())===String(fit.flat()),"train replay");
    train.push({key:kl.slice(),queue:kr.slice(),map:f.slice(),inv:inv.slice(),plain:plain.flat()});
    stats.trainPaths++;if(train.length>=1000)throw Error("solution cap");return;
   }
   if(l>=0&&(r>=cut||cost(fit[l],kl,true)<=cost(fit[r],kr,false))){
    step(fit[l],kl,true,(next,p)=>{pl[l]=p;expand(l-1,r,next,kr)});
   }else{
    step(fit[r],kr,false,(next,p)=>{pl[r]=p;expand(l,r+1,kl,next)});
   }
  }
  try{
   for(const str of dict[fit[anchor].length]){
    const p=Array.from(str,x=>x.charCodeAt(0)),c=fit[anchor],cons=[],shifts=[];
    let legal=true;f.fill(-1);inv.fill(-1);
    for(let i=0;i<p.length;i++){if(!p[i]){if(c[i]){legal=false;break}continue}cons.push(p[i]);shifts.push(mod(c[i]-p[i]));}
    if(!legal||cons.length<q)continue;
    for(let j=q;j<cons.length;j++)if(set(cons[j-q],shifts[j])<0){legal=false;break}
    if(!legal)continue;
    stats.anchorCandidates++;
    const before=train.length;pl[anchor]=p;
    expand(anchor-1,anchor+1,shifts.slice(0,q),cons.slice(-q));
    if(train.length>before)stats.completedAnchors++;
   }
  }catch(e){if(!["cap","solution cap"].includes(e.message))throw e;return {stats,status:e.message,train,test}}
  // Only frozen map entries: no inference from held-out dictionary may assign a new map value.
  for(const t of train){
   for(let i=0;i<29;i++){f[i]=t.map[i];inv[i]=t.inv[i]}
   function hold(j,k,plain){
    if(j===words.length){const all=t.plain.concat(plain),filled=complete(f,inv);let pos=0;
     const ws=words.map(w=>{const p=all.slice(pos,pos+w.length);pos+=w.length;return p});
     assert(String(encrypt(ws,t.key,filled).flat())===String(words.flat()),"held replay");
     test.push({key:t.key,map:t.map,plain:all});stats.heldPaths++;return}
    step(words[j],k,false,(next,p)=>hold(j+1,next,plain.concat(p)),false)
   }
   try{hold(cut,t.queue,[])}catch(e){if(e.message!=="cap")throw e;return {stats,status:"hold cap",train,test}}
  }
  return {stats,status:"complete",train,test};
 }
 function permutation(seed){const v=Array.from({length:29},(_,i)=>i);let s=seed>>>0;for(let i=v.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[v[i],v[j]]=[v[j],v[i]]}return v}
 const summarize=r=>({status:r.status,...r.stats,trainMaps:r.train.slice(0,3).map(t=>({known:t.map.filter(x=>x>=0).length,key:t.key,map:t.map})),candidates:r.test.slice(0,2).map(x=>x.plain.map(i=>gp.translit[i]).join(""))});
 const target=original.slice(0,158);assert(target.flat().length===729,"opening");
 const originalResult=summarize(attack(target,200,12000000));
 const controls=[];
 for(const [name,salt] of [["jpg107-167",23],["0_loss_of_divinity",11],["0_welcome",2]]){
  const s=source.find(s=>s.name===name),map=permutation(salt),key=Array.from({length:q},(_,i)=>mod(i*i*7+i*11+salt));
  const r=attack(encrypt(s.w,key,map),200,12000000),truth=s.w.flat();
  const correct=t=>String(t.key)===String(key)&&t.map.every((v,i)=>v<0||v===map[i]);
  controls.push({name,...summarize(r),trueTrain:r.train.filter(t=>correct(t)&&String(t.plain)===String(truth.slice(0,r.stats.fitRunes))).length,exact:r.test.filter(t=>correct(t)&&String(t.plain)===String(truth)).length});
 }
 return {q,lexicon:dict.reduce((a,d)=>a+d.size,0),originalResult,controls};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(read)),null,2));
