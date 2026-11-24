"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
function run(read, check){
 const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),t=JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),raw=read("resources/lp2-transcription.txt").split("%"),solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
 const map=new Map(c.runes.map((v,i)=>[v,i])),parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const orig=parse(raw.slice(0,55).join("").replace(/\/|\s/g,"")),p57=parse(raw[56].replace(/\/|\s/g,"")),native=solved.sections.flatMap(s=>parse(s.source_text));
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 check(orig.length===2896&&orig.flat().length===12956&&equal(orig.flat(),c.pages.slice(0,56).flatMap(x=>x.indices)),"canonical tape");
 check(equal(p57.flat(),c.pages[57].indices)&&p57.flat().length===95,"p57 tape");
 const base=29n,mod=(v,m)=>(v%m+m)%m,pow=Array.from({length:15},(_,i)=>base**BigInt(i));
 const integer=w=>w.reduce((n,d)=>base*n+BigInt(d),0n);
 const digits=(v,l)=>{const d=Array(l);for(let i=l-1;i>=0;i--){d[i]=Number(v%base);v/=base;}check(v===0n,"integer width");return d};
 check(equal(digits(3301n,3),[3,26,24]),"historical BASE29");
 const bytes=t.pages.flatMap(p=>p.tokens.map(s=>60*t.alphabet.indexOf(s[0])+t.alphabet.indexOf(s[1])));
 check(bytes.length===256&&equal(bytes,t.bytes),"source row byte stream");
 const rows=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8).reduce((v,b)=>v*256n+BigInt(b),0n));
 check(new Set(rows).size===32&&Math.max(...orig.map(x=>x.length))===14,"row/word shape");
 // Frozen two-register arithmetic shear. The row selected by the other full
 // integer is reduced modulo target capacity; integer carries are retained.
 const trans=(words,a,b,enc)=>{
   check(words.length%2===0,"even number of complete words");
   const out=[];
   for(let i=0;i<words.length;i+=2){
     const l=words[i].length,m=words[i+1].length,x=integer(words[i]),y=integer(words[i+1]);
     let u,v;
     if(enc){u=mod(x+rows[Number((y+BigInt(a))%32n)],pow[l]);v=mod(y+rows[Number((u+BigInt(b))%32n)],pow[m]);}
     else{v=mod(y-rows[Number((x+BigInt(b))%32n)],pow[m]);u=mod(x-rows[Number((v+BigInt(a))%32n)],pow[l]);}
     out.push(digits(u,l),digits(v,m));
   }
   return out;
 };
 const latin=s=>{
   const lookup=new Map(c.translit.map((v,i)=>[v,i])),pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
   return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{const out=[];for(let i=0;i<w.length;){let d=pairs.find(t=>w.startsWith(t,i))||w[i];i+=d.length;d=({ING:"NG",K:"C",Q:"C",V:"U",Z:"S"})[d]||d;check(lookup.has(d),"Latin token");out.push(lookup.get(d));}return out;});
 };
 const g=latin(read("resources/control/gibran_prophet_58585.txt")),e=latin(read("resources/control/emerson_essays_2944.txt")),sh=latin(read("resources/control/shakespeare_first300k.txt"));
 const counts=Array.from({length:15},()=>new Map()),tot=Array(15).fill(0);
 for(const w of [...g,...e])if(w.length<=14){const k=integer(w).toString();counts[w.length].set(k,(counts[w.length].get(k)||0)+1);tot[w.length]++}
 const offsets=[0];for(const w of orig)offsets.push(offsets.at(-1)+w.length);
 const ps=[0];for(const p of c.pages)ps.push(ps.at(-1)+p.indices.length);
 const region=(p,q)=>orig.map((_,i)=>i).filter(i=>offsets[i]>=ps[p]&&offsets[i+1]<=ps[q+1]);
 const train=region(0,7),h1=region(16,21),h2=region(40,53);
 const fitEnd=(train.length&~1);
 const ll=(v,l)=>Math.log(((counts[l].get(v.toString())||0)+.25)/(tot[l]+.25*29**l));
 // Estimate on complete training pairs only. Long words do not contribute.
 const fit=words=>{
   const pair=[];
   for(let i=0;i<fitEnd;i+=2){
     const x=integer(words[i]),y=integer(words[i+1]),l=words[i].length,m=words[i+1].length;
     if(l>3&&m>3)continue;
     const score=new Float64Array(1024);
     for(let b=0;b<32;b++){
       const v=mod(y-rows[Number((x+BigInt(b))%32n)],pow[m]);
       const sv=m<=3?ll(v,m):0;
       for(let a=0;a<32;a++){
         const u=mod(x-rows[Number((v+BigInt(a))%32n)],pow[l]);
         score[a*32+b]=sv+(l<=3?ll(u,l):0);
       }
     }
     pair.push(score);
   }
   const scores=new Float64Array(1024);for(const p of pair)for(let k=0;k<1024;k++)scores[k]+=p[k];
   const order=Array.from(scores.keys()).sort((a,b)=>scores[b]-scores[a]);
   const k=order[0];return {a:k>>5,b:k&31,score:scores[k],margin:scores[k]-scores[order[1]],ties:order.filter(j=>Math.abs(scores[j]-scores[k])<1e-8).length,scoredPairs:pair.length};
 };
 const metric=(words,ix)=>{
   const ws=ix.map(i=>words[i]),x=ws.flat(),h=Array(29).fill(0);
   for(const v of x)h[v]++;
   const hit=w=>counts[w.length].has(integer(w).toString());
   const short=ws.filter(w=>w.length<=3);
   return {words:ws.length,runes:x.length,lex:ws.filter(hit).length,short:short.length,shortLex:short.filter(hit).length,coverage:ws.filter(hit).flat().length/x.length,ioc:h.reduce((n,v)=>n+v*(v-1),0)/(x.length*(x.length-1)),preview:ws.slice(0,18).map(w=>w.map(v=>c.translit[v]).join("")).join(" ")};
 };
 let seed=0x33014824;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const pools=ws=>{const p=Array.from({length:15},()=>[]);for(const w of ws)if(w.length<=14)p[w.length].push(w);return p};
 const trials=[[3,19],[29,8],[11,26],[25,2]],controls=[];
 for(let j=0;j<trials.length;j++){
   const p=pools(j<2?native:sh),plain=orig.map(w=>{check(p[w.length].length,"shape plant donor");return p[w.length][random()%p[w.length].length]});
   const [a,b]=trials[j],cipher=trans(plain,a,b,true),k=fit(cipher),decoded=trans(cipher,k.a,k.b,false);
   controls.push({key:[a,b],fitted:k,exact:equal(decoded,plain),hold1:metric(decoded,h1),hold2:metric(decoded,h2)});
 }
 check(equal(trans(trans(p57,3,19,true),3,19,false),p57),"p57 exact roundtrip");
 const result={keyCount:1024,controls,authenticP57Replay:95,fitEnd,trainingShortWords:orig.slice(0,fitEnd).filter(w=>w.length<=3).length,original:null};
 if(controls.every(x=>x.exact)){
   const k=fit(orig),decoded=trans(orig,k.a,k.b,false);
   check(equal(trans(decoded,k.a,k.b,true),orig),"original complete replay");
   // Strong generous envelope: independent row selection for every word.
   // Every true inverse is a member, regardless of round index function.
   const envelope=ix=>{let words=0,runes=0,possible=0,possibleRunes=0,short=0,possibleShort=0;for(const i of ix){const w=orig[i],l=w.length,x=integer(w),ok=rows.some(v=>counts[l].has(mod(x-v,pow[l]).toString()));words++;runes+=l;possible+=+ok;possibleRunes+=ok?l:0;if(l<=3){short++;possibleShort+=+ok;}}return {words,runes,possible,possibleRunes,short,possibleShort}};
   result.original={k,train:metric(decoded,train),hold1:metric(decoded,h1),hold2:metric(decoded,h2),allReplay:12956,allRowEnvelope:{train:envelope(train),hold1:envelope(h1),hold2:envelope(h2),all:envelope(orig.map((_,i)=>i))}};
 }
 return result;
}
console.log(JSON.stringify(run(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"),assert.ok),null,2));
