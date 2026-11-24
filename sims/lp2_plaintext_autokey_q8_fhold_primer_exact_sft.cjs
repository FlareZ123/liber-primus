'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,trans,solved,lex){
 const gp=JSON.parse(corpus), native=JSON.parse(solved), q=8,mod=x=>(x+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const rune=new Map(gp.runes.map((x,i)=>[x,i])), alpha=new Map(gp.translit.map((x,i)=>[x,i]));
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
 const tries=dict.map(d=>{const root=new Map();for(const word of d){let t=root;for(let i=0;i<word.length;i++){const p=word.charCodeAt(i);if(!t.has(p))t.set(p,new Map());t=t.get(p);}}return root});
 function encrypt(words,primer){let queue=primer.slice();return words.map(w=>w.map(p=>{if(!p)return 0;const c=mod(p+queue[0]);queue=queue.slice(1).concat(p);return c}))}
 function run(words,initial,cap=8000000){
  let states=initial,visits=0,counts=[],offset=0;
  for(let wi=0;wi<words.length;wi++){
   const c=words[wi], root=tries[c.length];let next=[];
   if(!root)return {status:"empty",offset,wi,counts,visits,states:[]};
   for(const st of states){
    function walk(j,t,queue,key,p){
     if(++visits>cap)throw Error("cap");
     if(j===c.length){next.push({queue,key,plain:st.plain.concat(p)});return}
     const x=c[j],k=queue[0];
     if(x===0&&t.has(0))walk(j+1,t.get(0),queue,key,p.concat(0));
     if(k<0){
      for(const [v,ch] of t)if(v)walk(j+1,ch,queue.slice(1).concat(v),key.concat(mod(x-v)),p.concat(v));
     }else{
      const v=mod(x-k);if(v&&t.has(v))walk(j+1,t.get(v),queue.slice(1).concat(v),key,p.concat(v));
     }
    }
    try{walk(0,root,st.queue,st.key,[])}catch(e){if(e.message!=="cap")throw e;return {status:"cap",offset,wi,counts,visits,states:[]}}
   }
   offset+=c.length;states=next;counts.push(states.length);
   if(!states.length)return {status:"empty",offset,wi,counts,visits,states};
  }
  return {status:"complete",offset,wi:words.length,counts,visits,states};
 }
 const fresh=()=>[{queue:Array(q).fill(-1),key:[],plain:[]}];
 const cutAt=(w,n)=>{let count=0,j=0;while(count<n&&j<w.length)count+=w[j++].length;return j};
 const summarize=r=>({status:r.status,offset:r.offset,word:r.wi,visits:r.visits,counts:r.counts.slice(0,18),survivors:r.states.length,keys:[...new Set(r.states.map(s=>s.key.join(",")))].slice(0,10)});
 function attack(words,splitAt){
  const cut=cutAt(words,splitAt),fit=words.slice(0,cut),held=words.slice(cut);
  const train=run(fit,fresh());
  const test=train.status==="complete"?run(held,train.states):null;
  if(test?.status==="complete")for(const s of test.states){
   assert(s.key.length===q,"fully determined primer");
   let j=0;const ws=words.map(w=>{const p=s.plain.slice(j,j+w.length);j+=w.length;return p});
   assert(String(encrypt(ws,s.key).flat())===String(words.flat()),"replay");
  }
  return {train,test,fitRunes:fit.flat().length,heldRunes:held.flat().length};
 }
 const controls=[];
 for(const [name,salt] of [["0_welcome",2],["0_koan_1",17],["0_koan_2",23]]){
  const s=source.find(s=>s.name===name);if(!s)continue;
  const key=Array.from({length:q},(_,i)=>(i*i*7+i*11+salt)%29);
  const c=encrypt(s.w,key),r=attack(c,100),truth=s.w.flat(),fit=r.fitRunes;
  const trueTrain=r.train.states.filter(v=>String(v.key)===String(key)&&String(v.plain)===String(truth.slice(0,fit))).length;
  const exact=r.test?.states.filter(v=>String(v.key)===String(key)&&String(v.plain)===String(truth)).length||0;
  controls.push({name,key,fitRunes:fit,heldRunes:r.heldRunes,train:summarize(r.train),test:r.test?summarize(r.test):null,trueTrain,exact});
 }
 const target=original.slice(0,158);assert(target.flat().length===729,"opening chapter");
 const r=attack(target,200);
 return {q,lexicon:dict.reduce((a,d)=>a+d.size,0),controls,original:{chapter:"p0–2",fitRunes:r.fitRunes,heldRunes:r.heldRunes,train:summarize(r.train),test:r.test?summarize(r.test):null}};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(read)),null,2));
