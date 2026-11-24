'use strict';
// Latent-word sliding prime origin; no printed boundaries.
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
 const primes=[];for(let x=2;primes.length<5000;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
 const key=primes.map(x=>(x-1)%29);
 /** Word ordinal j starts at prime origin+j, overlapping the previous word's stream. */
 function encrypt(ws,origin,firstWord=0){
   return ws.flatMap((w,j)=>{let k=origin+firstWord+j;return w.map(p=>p===0?0:mod(p+key[k++]))})
 }
 /** Exact score-maximizing dynamic program over latent word ordinal and rune boundary. */
 function decode(c,origin,firstWord=0,{partial=true,trace=false}={}){
   const n=c.length,dp=Array.from({length:n+1},()=>new Map());
   dp[0].set(firstWord,{score:0,prev:null,word:null,count:firstWord});
   let prefix=false,maxReach=0,visits=0;
   for(let i=0;i<n;i++)for(const [w,s] of dp[i]){
     function walk(j,k,t){
       visits++;
       if(t.term){
         const score=s.score+t.term.score,old=dp[j].get(w+1);
         if(!old||score>old.score)dp[j].set(w+1,{score,prev:trace?s:null,word:trace?t.term:null,count:w+1});
         maxReach=Math.max(maxReach,j);
       }
       if(j===n){if(partial&&(t.kids.size||t.term))prefix=true;return}
       if(j-i>=maxLength)return;
       const x=c[j],f=t.kids.get(0);if(x===0&&f)walk(j+1,k,f);
       const p=mod(x-key[k]),child=t.kids.get(p);if(p&&child)walk(j+1,k+1,child)
     }
     walk(i,origin+w,root)
   }
   const candidates=[...dp[n].values()].sort((a,b)=>b.score-a.score||a.count-b.count);
   const best=candidates[0]??null;
   let plaintext=null;
   if(trace&&best){plaintext=[];for(let t=best;t?.word;t=t.prev)plaintext.unshift(...t.word.p)}
   return {origin,exact:!!best,prefix:prefix||!!best,maxReach,visits,best:best?{score:best.score,count:best.count}:null,states:candidates.length,plaintext}
 }
 function scan(c){const out=[];let reach=0,visits=0;for(let s=0;s<=3301;s++){const r=decode(c,s);reach=Math.max(reach,r.maxReach);visits+=r.visits;if(r.prefix)out.push(r)}return {eligible:out,reach,visits}}
 function control(name,origin){
   const ws=native.get(name).filter(w=>w.length!==1||[10,24].includes(w[0]));
   let split=0,len=0;while(split<ws.length&&len<160)len+=ws[split++].length;
   if(split===ws.length)split=Math.floor(ws.length/2);
   const a=ws.slice(0,split),b=ws.slice(split);
   const fit=encrypt(a,origin),held=encrypt(b,origin,split);
   const scanFit=scan(fit),exact=scanFit.eligible.filter(x=>x.exact).sort((a,b)=>b.best.score-a.best.score),best=exact[0];
   const pred=best?decode(held,best.origin,best.best.count,{trace:true}):null;
   return {name,origin,fitRunes:fit.length,heldoutRunes:held.length,fullOrigins:exact.length,prefixOrigins:scanFit.eligible.length,selectedOrigin:best?.origin,fitWordCount:best?.best.count,trueFitWordCount:split,heldoutExact:!!pred?.plaintext&&pred.plaintext.every((x,i)=>x===b.flat()[i]),heldoutMatches:pred?.plaintext?.filter((x,i)=>x===b.flat()[i]).length??0}
 }
 const controls=[control("0_welcome",2014),control("0_koan_1",3301),control("p57_parable",83)];
 const chapterStarts=[0,3,8,15,23,28,33,40,54];
 const original=chapterStarts.map(page=>{const c=gp.pages.find(p=>p.page===page).indices.slice(0,80),result=scan(c);return {page,fitRunes:c.length,eligibleOrigins:result.eligible.map(x=>x.origin),fullOrigins:result.eligible.filter(x=>x.exact).map(x=>x.origin),farthest:result.reach,visits:result.visits}});
 return {lexicon:words.size,controls,original};
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/control/english_wordfreq_textblob.txt')),null,2));
