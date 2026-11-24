'use strict';
// Exploratory shared arbitrary additive word-reset key, latent word boundaries.
const fs=require('node:fs');const path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function run(gp,gold,dict){
 const mod=x=>(x%29+29)%29;
 const glyph=new Map(gp.runes.map((x,i)=>[x,i]));
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){out.push(21);i+=3;continue}if(s.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tokens.find(t=>s.startsWith(t[0],i));if(!t)return [];out.push(t[1]);i+=t[0].length}return out}
 const native=new Map(gold.sections.map(s=>[s.name,(s.source_text.match(new RegExp("["+gp.runes.join("")+"]+","gu"))||[]).map(w=>Array.from(w,x=>glyph.get(x)))]));
 const words=new Map();let total=0;function add(p,label,f){if(!p.length||(p.length===1&&p[0]!==24&&p[0]!==10))return;const k=p.join(",");if(!words.has(k)||words.get(k).f<f)words.set(k,{p,label,f})}
 for(const l of dict.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;add(encode(m[1]),m[1],+m[2]);total+=+m[2]}
 for(const ws of native.values())for(const p of ws)add(p,p.map(x=>gp.translit[x]).join(""),1);
 const root={kids:new Map(),term:null};let maxLength=0;
 for(const w of words.values()){let t=root;for(const x of w.p){if(!t.kids.has(x))t.kids.set(x,{kids:new Map(),term:null});t=t.kids.get(x)}t.term={...w,score:Math.log(w.f/total)};maxLength=Math.max(maxLength,w.p.length)}
 function encrypt(ws,key){return ws.flatMap(w=>{let i=0;return w.map(p=>p===0?0:mod(p+key[i++]))})}
 // Prefix cylinder antichain: a shorter surviving prefix dominates all of its extensions.
 function node(){return {kids:new Map(),term:null}}
 function insert(t,key,witness){for(let i=0;i<key.length;i++){if(t.term)return false;const c=key.charCodeAt(i)-65;if(!t.kids.has(c))t.kids.set(c,node());t=t.kids.get(c)}if(t.term)return false;t.term=witness;t.kids.clear();return true}
 function* terms(t){if(t.term){yield t.term;return}for(const ch of t.kids.values())yield* terms(ch)}
 function recover(c,{limit=8000000,allowPartial=true}={}){
  const states=Array.from({length:c.length+1},node);
  insert(states[0],"",{key:"",prev:null,word:null});
  let visits=0,inserts=1,processed=0,farthest=0;const stats=[];
  for(let i=0;i<c.length;i++){
   let count=0;
   for(const s of terms(states[i])){
    count++;processed++;
    function walk(j,k,key,t){
     if(++visits>limit)throw Error("visit-cap");
     if(t.term&&insert(states[j],key,{key,prev:s,word:t.term})) {inserts++;farthest=Math.max(farthest,j)}
     if(j===c.length){
       if(allowPartial&&t.kids.size&&insert(states[j],key,{key,prev:s,word:null,partial:true})) {inserts++;farthest=Math.max(farthest,j)}
       return;
     }
     if(j-i>=maxLength)return;
     const x=c[j];
     const f=t.kids.get(0);if(x===0&&f)walk(j+1,k,key,f);
     if(k<key.length){const p=mod(x-(key.charCodeAt(k)-65));const child=t.kids.get(p);if(p&&child)walk(j+1,k+1,key,child)}
     else for(const [p,ch] of t.kids)if(p)walk(j+1,k+1,key+String.fromCharCode(65+mod(x-p)),ch);
    }
    try{walk(i,0,s.key,root)}catch(e){if(e.message!=="visit-cap")throw e;return {complete:false,reason:e.message,visits,inserts,processed,farthest,stoppedAt:i,stats:stats.slice(-8)}}
   }
   if(count)stats.push([i,count]);
   // State witnesses retain all needed ancestry; no future edge can enter i.
   states[i]=null;
  }
  const survivors=[...terms(states[c.length])];
  return {complete:true,visits,inserts,processed,farthest,stats:stats.slice(-8),survivors};
 }
 const key=Array.from({length:maxLength},(_,i)=>(i*i*7+11*i+19)%29);
 const getWords=name=>native.get(name).filter(w=>w.length!==1||[10,24].includes(w[0]));
 const w=getWords("0_welcome");let split=0,len=0;while(len<80){len+=w[split++].length}
 const a=w.slice(0,split),b=w.slice(split,split+10),fit=encrypt(a,key),held=encrypt(b,key);
 const pc=recover(fit,{allowPartial:false});
 function compact(r){const {survivors,...rest}=r;return {...rest,survivors:survivors?.length,keys:survivors?.slice(0,10).map(x=>Array.from(x.key,c=>c.charCodeAt(0)-65))}}
 const trueKey=key.map(x=>String.fromCharCode(65+x)).join("");
 const containsTrue=pc.survivors?.some(s=>trueKey.startsWith(s.key));
 const original=gp.pages.find(p=>p.page===0).indices;
 const unknown=recover(original.slice(0,80));
 return {lexicon:words.size,maxLength,control:{fitRunes:fit.length,holdoutRunes:held.length,containsTrue,...compact(pc)},original:{fitRunes:80,...compact(unknown)}};
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/control/english_wordfreq_textblob.txt')),null,2));
