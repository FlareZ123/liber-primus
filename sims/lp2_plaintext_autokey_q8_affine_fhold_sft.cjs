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
 const inverses=Array.from({length:29},(_,a)=>Array.from({length:29},(_,i)=>i).find(i=>mod(a*i)===1));
 function encrypt(words,primer,a,b){let queue=primer.slice();return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+queue[0]);queue=queue.slice(1).concat(mod(a*p+b));return c}))}
 const cutAt=(w,n)=>{let count=0,j=0;while(count<n&&j<w.length)count+=w[j++].length;return j};
 function attack(words,splitAt,cap=10000000){
  const cut=cutAt(words,splitAt),fit=words.slice(0,cut);
  const offsets=[0],nz=[0];for(const w of words){offsets.push(offsets.at(-1)+w.length);for(const c of w)nz.push(nz.at(-1)+Number(c!==0))}
  const eligible=fit.map((w,i)=>({i,len:w.length,nonzero:w.filter(x=>x!==0).length})).filter(v=>nz[offsets[v.i]]>=q&&v.nonzero>=q).sort((a,b)=>b.nonzero-a.nonzero||b.len-a.len||a.i-b.i);
  const anchor=eligible[0]?.i??-1;
  const stats={fitRunes:offsets[cut],heldRunes:offsets.at(-1)-offsets[cut],anchor,anchorOffset:offsets[anchor],anchorLength:fit[anchor]?.length,visits:0,anchorCandidates:0,forwardAnchors:0,backwardAnchors:0,models:new Set()};
  if(anchor<0)return {stats:{...stats,models:0},status:"no anchor",train:[],test:[]};
  function step(c,states,rev,off,a,b){
   const seq=rev?c.slice().reverse():c,root=(rev?reverse:tries)[c.length],out=[];
   for(const st of states){
    function go(j,t,k,p){
     if(++stats.visits>cap)throw Error("cap");
     if(j===seq.length){out.push({queue:k,plain:st.plain.concat(p)});return}
     const x=seq[j];
     if(!x&&t.has(0))go(j+1,t.get(0),k,p.concat(0));
     if(rev){
      const v=mod((k.at(-1)-b)*inverses[a]);
      if(v!==0&&t.has(v)){
       const previous=mod(x-v),physical=off+c.length-1-j;
       if(previous!==b||nz[physical]<q)go(j+1,t.get(v),[previous,...k.slice(0,-1)],p.concat(v));
      }
     }else{
      const v=mod(x-k[0]);if(v&&t.has(v))go(j+1,t.get(v),k.slice(1).concat(mod(a*v+b)),p.concat(v));
     }
    }
    if(root)go(0,root,st.queue,[]);
   }
   return out;
  }
  const train=[],test=[];
  try{
   for(const str of dict[fit[anchor].length]){
    const p=Array.from(str,x=>x.charCodeAt(0)),c=fit[anchor],cons=[],shifts=[];
    let legal=true;
    for(let i=0;i<p.length;i++){
     if(!p[i]){if(c[i]){legal=false;break}continue}
     cons.push(p[i]);shifts.push(mod(c[i]-p[i]));
    }
    if(!legal||cons.length<q)continue;
    for(let a=1;a<29;a++){
     const bs=cons.length>q?[mod(shifts[q]-a*cons[0])]:Array.from({length:29},(_,i)=>i);
     for(const b of bs){
      if(shifts.slice(0,q).includes(b))continue;
      if(shifts.slice(q).some((k,j)=>k!==mod(a*cons[j]+b)))continue;
      const key=shifts.slice(0,q),queue=cons.slice(-q).map(v=>mod(a*v+b));
      stats.anchorCandidates++;stats.models.add(`${a},${b}`);
      let f=[{queue,plain:p}];
      for(let i=anchor+1;i<cut&&f.length;i++)f=step(fit[i],f,false,offsets[i],a,b);
      if(!f.length)continue;stats.forwardAnchors++;
      let z=[{queue:key,plain:[]}];
      for(let i=anchor-1;i>=0&&z.length;i--)z=step(fit[i],z,true,offsets[i],a,b);
      if(!z.length)continue;stats.backwardAnchors++;
      for(const l of z)for(const r of f){
       const plain=l.plain.slice().reverse().concat(r.plain),primer=l.queue;
       let j=0;const ws=fit.map(w=>{const p=plain.slice(j,j+w.length);j+=w.length;return p});
       assert(String(encrypt(ws,primer,a,b).flat())===String(fit.flat()),"train replay");
       train.push({a,b,key:primer,queue:r.queue,plain});
      }
     }
    }
   }
   for(const s of train){
    let f=[{queue:s.queue,plain:s.plain}];
    for(let i=cut;i<words.length&&f.length;i++)f=step(words[i],f,false,offsets[i],s.a,s.b);
    for(const z of f){
     const plain=z.plain;let j=0;const ws=words.map(w=>{const p=plain.slice(j,j+w.length);j+=w.length;return p});
     assert(String(encrypt(ws,s.key,s.a,s.b).flat())===String(words.flat()),"full replay");
     test.push({a:s.a,b:s.b,key:s.key,plain});
    }
   }
  }catch(e){if(e.message!=="cap")throw e;return {stats:{...stats,models:stats.models.size},status:"cap",train,test}}
  return {stats:{...stats,models:stats.models.size},status:"complete",train,test};
 }
 const summarize=r=>({status:r.status,...r.stats,trainPaths:r.train.length,trainKeys:[...new Set(r.train.map(x=>`${x.a},${x.b}:${x.key}`))].slice(0,12),testPaths:r.test.length,originalCandidates:r.test.slice(0,3).map(x=>x.plain.map(i=>gp.translit[i]).join(""))});
 const controls=[];
 for(const [name,salt,a,b] of [["jpg107-167",23,3,7],["0_loss_of_divinity",11,28,5],["0_welcome",2,17,11]]){
  const s=source.find(s=>s.name===name);assert(s,name);
  const key=Array.from({length:q},(_,i)=>mod(i*i*7+i*11+salt));
  const r=attack(encrypt(s.w,key,a,b),200),truth=s.w.flat();
  controls.push({name,a,b,key,...summarize(r),trueTrain:r.train.filter(v=>v.a===a&&v.b===b&&String(v.key)===String(key)&&String(v.plain)===String(truth.slice(0,r.stats.fitRunes))).length,exact:r.test.filter(v=>v.a===a&&v.b===b&&String(v.key)===String(key)&&String(v.plain)===String(truth)).length});
 }
 const target=original.slice(0,158);assert(target.flat().length===729,"opening chapter");
 assert(target[0].length+target[1].length===13,"physical red heading");
 const terminal=original.slice(-original.slice().reverse().findIndex((w,i,arr)=>arr.slice(0,i+1).flat().length>=308)-1);assert(terminal.flat().length===308,"terminal chapter");
 return {q,lexicon:dict.reduce((a,d)=>a+d.size,0),controls,originalFull:summarize(attack(target,200)),originalBody:summarize(attack(target.slice(2),188)),terminal:summarize(attack(terminal,200))};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(read)),null,2));
