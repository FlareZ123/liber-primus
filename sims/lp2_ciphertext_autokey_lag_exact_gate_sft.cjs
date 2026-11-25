'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp, transcript, gold, dict){
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29, idx=new Map(gp.runes.map((x,i)=>[x,i]));
 const all=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const fromText=[...transcript].filter(x=>idx.has(x)).map(x=>idx.get(x));
 assert(all.length===12956&&all.every((x,i)=>x===fromText[i]),"canonical original ciphertext");
 function cert(c,q){const out=[];for(let i=q;i<c.length;i++)if(c[i]===c[i-q]&&c.slice(i-q,i+1).every(Boolean))out.push({start:i-q,end:i,values:c.slice(i-q,i+1)});return out}
 function encode(p,key){const h=[...key];return p.map(x=>{if(!x)return 0;const c=mod(x+h.shift());h.push(c);return c})}
 // Verify historical non-Fehu 26-letter vector independently.
 const az=s=>[...s].map(c=>c.charCodeAt(0)-65),letters=a=>a.map(x=>String.fromCharCode(65+x)).join("");
 const h=[3];const hist=letters(az("RENAISSANCE").map(p=>{const c=(p+h.shift())%26;h.push(c);return c}));
 assert(hist==="UYLLTLDDQSW","Denning 1982 worked vector");
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(r=>idx.get(r)))}));
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function spell(s,alt){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let i=0;i<s.length;){if(alt&&s.startsWith("ING",i)){p.push(21);i+=3;continue}if(alt&&s.startsWith("IO",i)){p.push(27);i+=2;continue}const t=tokens.find(t=>s.startsWith(t[0],i));if(!t)return [];p.push(t[1]);i+=t[0].length}return p}
 function lex(exclude){const L=new Map();function add(p,f){if(!p.length)return;if(p.length===1&&![10,24].includes(p[0]))return;const d=L.get(p.length)||new Map();const k=p.join();if(!d.has(k)||d.get(k).f<f)d.set(k,{p,f});L.set(p.length,d)}for(const line of dict.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true])add(spell(m[1],alt),+m[2])}for(const s of native)if(s.name!==exclude)for(const w of s.words)add(w,1);return L}
 // State is the last up-to-q consumed ciphertext symbols. Primer symbols are
 // independent wildcards and do not affect the state. Each word ends at its printed boundary.
 function decode(c,lens,q,L,initial=[],cap=1000000){
   let states=new Map([[initial.join(),{hist:initial,score:0,p:[],primer:[],count:1n}]]),off=0,visits=0;
   for(const n of lens){const next=new Map(),cc=c.slice(off,off+n),bucket=[...(L.get(n)?.values()||[])];for(const st of states.values()){
     function go(i,h,pat,kidx){
       if(++visits>cap)throw Error("visit cap");
       if(i===n){let count=0n,best=null;for(const w of bucket){if(w.p.every((p,j)=>pat[j]===-1?p!==0:p===pat[j])){count++;if(!best||w.f>best.f)best=w}}
         if(!best)return;const primer=st.primer.concat(kidx.map(j=>mod(cc[j]-best.p[j]))),score=st.score+Math.log(best.f),key=h.join(),old=next.get(key),total=(old?.count||0n)+st.count*count;
         if(!old||score>old.score)next.set(key,{hist:h,p:st.p.concat(best.p),primer,score,count:total});else old.count=total;return;
       }
       const x=cc[i];
       if(!x)go(i+1,h,pat.concat(0),kidx);
       if(h.length<q)go(i+1,h.concat(x),pat.concat(-1),kidx.concat(i));
       else {const p=mod(x-h[0]);if(p)go(i+1,h.slice(1).concat(x),pat.concat(p),kidx)}
     }
     go(0,st.hist,[],[]);
   }
   states=next;off+=n;if(!states.size)break;}
   const best=[...states.values()].sort((a,b)=>b.score-a.score)[0];return {best,states:states.size,paths:[...states.values()].reduce((s,x)=>s+x.count,0n).toString(),visits,processed:off};
 }
 const chapterStarts=[0,3,8,15,23,27,33,40,54,56];
 const originals=chapterStarts.slice(0,-1).flatMap((a,j)=>{const b=chapterStarts[j+1]-1,c=gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices);return [8,13].map(q=>{const cs=cert(c,q);return {a,b,q,n:c.length,count:cs.length,first:cs[0]}})});
 // Freeze two native controls, both periods, first 12 body words fit, next 12 held out.
 const controls=[];for(const name of ["0_welcome","0_koan_1"]){const s=native.find(s=>s.name===name),L=lex(name);for(const q of [8,13]){
   const words=s.words.slice(name==="0_welcome"?1:2,(name==="0_welcome"?1:2)+24),fitWords=words.slice(0,12),heldWords=words.slice(12),p=words.flat(),k=Array.from({length:q},(_,i)=>mod(11*i*i+7*i+q)),c=encode(p,k),split=fitWords.flat().length;
   assert(!cert(c,q).length,"native plant certificate false positive");
   const oov=words.filter(w=>!L.get(w.length)?.has(w.join())).map(w=>w.map(x=>gp.translit[x]).join(""));
   const fit=decode(c.slice(0,split),fitWords.map(w=>w.length),q,L);let held=null,replay=false;
   if(fit.best){held=decode(c.slice(split),heldWords.map(w=>w.length),q,L,fit.best.hist);if(held.best)replay=encode(fit.best.p.concat(held.best.p),fit.best.primer).join()===c.join();}
   const trueActive=p.map((x,i)=>x?i:-1).filter(i=>i>=0);const alt=p.slice();alt[trueActive[0]]=alt[trueActive[0]]%28+1;const k2=k.slice();k2[0]=mod(c[trueActive[0]]-alt[trueActive[0]]);assert(encode(alt,k2).join()===c.join(),"primer ambiguity replay");
   controls.push({name,q,fitRunes:split,heldRunes:p.length-split,oov,fitStates:fit.states,fitPaths:fit.paths,fitProcessed:fit.processed,fitVisits:fit.visits,primer:fit.best?.primer,planted:k,primerExact:fit.best?.primer.join()===k.join(),fitHits:fit.best?.p.filter((x,i)=>x===p[i]).length??0,heldPaths:held?.paths,heldHits:held?.best?.p.filter((x,i)=>x===p[split+i]).length??0,replay,alternatePrimer:k2,alternateReplay:true});
 }}
 return {historicalVector:hist,originals,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw[1],JSON.parse(raw[2]),raw[3]),null,2));
