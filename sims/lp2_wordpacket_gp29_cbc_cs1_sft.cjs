"use strict";
/** Toy GP29 CBC-CS1 adaptation, original word seams, blind common-key inference. */
const fs=require("node:fs"); const path=require("node:path"); const assert=require("node:assert/strict");
function experiment(read,assert) {
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const raw=read("resources/liber-primus/lp2-transcription.txt").split("%");
 const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
 const idx=new Map(corpus.runes.map((v,i)=>[v,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>idx.get(c)));
 const original=parse(raw.slice(0,55).join("").replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
 const native=solved.sections.flatMap(s=>parse(s.source_text));
 const p57=parse(raw[56].replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,""));
 assert(original.length===2896&&original.flat().length===12956,"source shape");
 assert(JSON.stringify(original.flat())===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),"canonical original");
 assert(native.length===740&&native.flat().length===2979,"native solved");
 assert(JSON.stringify(p57.flat())===JSON.stringify(corpus.pages[57].indices),"p57 source");
 const mod=x=>(x+841)%29, pack=(l,r)=>29*l+r, hi=z=>Math.floor(z/29),lo=z=>z%29;
 // Three-round toy Feistel over GP29^2. Not a standard secure block cipher.
 const tables=key=>{
   const e=new Uint16Array(841),d=new Uint16Array(841);
   for(let x=0;x<841;x++){
     let l=hi(x),r=lo(x);
     for(const k of key){const t=r;r=(l+r*r+k)%29;l=t;}
     const c=pack(l,r);e[x]=c;d[c]=x;
   }return {e,d};
 };
 // Packet = whole word except a singleton is accumulated into the following
 // complete word until >=2 runes; terminal singleton appended to prior packet.
 // Every original printed word and boundary is restored after decoding.
 const layout=words=>{
   const offsets=[0];for(const w of words)offsets.push(offsets.at(-1)+w.length);
   const packets=[];let i=0;
   while(i<words.length){
     const first=i;
     while(i<words.length&&offsets[i]-offsets[first]<2)i++;
     if(offsets[i]-offsets[first]<2){assert(packets.length>0,"terminal packet");packets.at(-1).end=offsets[i];packets.at(-1).last=i;}
     else packets.push({start:offsets[first],end:offsets[i],first,last:i});
   }
   return {offsets,packets};
 };
 const crypt=(x,lay,t,encrypt)=>{
   const y=new Uint8Array(x.length);let iv=0;
   for(const p of lay.packets){
     const n=p.end-p.start,endNormal=p.end-(n%2?3:0);
     let v=iv;
     for(let j=p.start;j<endNormal;j+=2){
       if(encrypt){v=t.e[pack(mod(x[j]+hi(v)),mod(x[j+1]+lo(v)))];y[j]=hi(v);y[j+1]=lo(v);}
       else{const c=pack(x[j],x[j+1]),z=t.d[c];y[j]=mod(hi(z)-hi(v));y[j+1]=mod(lo(z)-lo(v));v=c;}
     }
     if(n%2){
       const j=p.end-3;
       if(encrypt){
         const u=t.e[pack(mod(x[j]+hi(v)),mod(x[j+1]+lo(v)))];
         v=t.e[pack(mod(x[j+2]+hi(u)),lo(u))];
         y[j]=hi(u);y[j+1]=hi(v);y[j+2]=lo(v);
       } else {
         const c=pack(x[j+1],x[j+2]),z=t.d[c],u=pack(x[j],lo(z)),w=t.d[u];
         y[j]=mod(hi(w)-hi(v));y[j+1]=mod(lo(w)-lo(v));y[j+2]=mod(hi(z)-x[j]);v=c;
       }
     }
     iv=v;
   }
   return y;
 };
 const lay=layout(original), source=Uint8Array.from(original.flat());
 assert(lay.packets.every(p=>p.end-p.start>=2),"valid packet sizes");
 const merged=lay.packets.filter(p=>p.last-p.first>1).length;
 const odd=lay.packets.filter(p=>(p.end-p.start)%2).length;
 const pageStart=[0];for(const p of corpus.pages)pageStart.push(pageStart.at(-1)+p.indices.length);
 const range=(p,q)=>original.map((_,i)=>i).filter(i=>lay.offsets[i]>=pageStart[p]&&lay.offsets[i+1]<=pageStart[q+1]);
 const train=range(0,7),hold1=range(16,21),hold2=range(40,53);
 const shortTrain=train.filter(i=>original[i].length<=3);
 // Training packet selection depends ONLY on complete original word lengths.
 const trainingPackets=lay.packets.filter(p=>p.end<=pageStart[8]).map(p=>({...p,short:shortTrain.filter(w=>w>=p.first&&w<p.last)})).filter(p=>p.short.length);
 const shortSet=new Set(trainingPackets.flatMap(p=>p.short));
 assert(shortSet.size===shortTrain.length,"no training seam leakage");
 const latin=s=>{
   const lookup=new Map(corpus.translit.map((v,i)=>[v,i])),pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
   return(s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
     const a=[];for(let i=0;i<w.length;){let t=pairs.find(t=>w.startsWith(t,i))||w[i];i+=t.length;if(t==="ING")t="NG";if(t==="K"||t==="Q")t="C";if(t==="V")t="U";if(t==="Z")t="S";assert(lookup.has(t),"donor token");a.push(lookup.get(t));}return a;
   });
 };
 const g=latin(read("resources/control/gibran_prophet_58585.txt")),e=latin(read("resources/control/emerson_essays_2944.txt")),sh=latin(read("resources/control/shakespeare_first300k.txt"));
 const counts=Array.from({length:15},()=>new Map()),totals=Array(15).fill(0);
 const str=w=>Array.from(w).join(","),id=w=>w.reduce((n,v)=>n*29+v,0);
 for(const w of [...g,...e])if(w.length<=14){const m=counts[w.length],k=str(w);m.set(k,(m.get(k)||0)+1);totals[w.length]++;}
 const scores=Array.from({length:4},(_,l)=>l?Float64Array.from({length:29**l},()=>Math.log(.25/(totals[l]+.25*29**l))):null);
 for(const w of [...g,...e])if(w.length<=3){const l=w.length;scores[l][id(w)]=Math.log((counts[l].get(str(w))+.25)/(totals[l]+.25*29**l));}
 const fit=x=>{
   // All inter-packet IVs are ciphertext-known. Decode only training packets.
   const out=new Uint8Array(x.length);
   let best=null,runner=-Infinity,ties=0;
   for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
     const key=[a,b,c],{d}=tables(key);let score=0;
     for(const p of trainingPackets){
       let v=p.start?pack(x[p.start-2],x[p.start-1]):0;
       const odd=(p.end-p.start)%2,endNormal=p.end-(odd?3:0);
       for(let j=p.start;j<endNormal;j+=2){const z=d[pack(x[j],x[j+1])];out[j]=mod(hi(z)-hi(v));out[j+1]=mod(lo(z)-lo(v));v=pack(x[j],x[j+1]);}
       if(odd){const j=p.end-3,z=d[pack(x[j+1],x[j+2])],u=pack(x[j],lo(z)),w=d[u];out[j]=mod(hi(w)-hi(v));out[j+1]=mod(lo(w)-lo(v));out[j+2]=mod(hi(z)-x[j]);}
       for(const w of p.short){let k=0;for(let i=lay.offsets[w];i<lay.offsets[w+1];i++)k=k*29+out[i];score+=scores[original[w].length][k];}
     }
     if(!best||score>best.score+1e-8){runner=best?best.score:runner;best={key,score};ties=1;}
     else if(Math.abs(score-best.score)<=1e-8){ties++;runner=best.score;}
     else runner=Math.max(runner,score);
   }
   return {...best,ties,margin:best.score-runner};
 };
 const region=(x,indices)=>{
   let words=0,short=0,lexical=0,shortLexical=0,log=0,n=0;const h=Array(29).fill(0),preview=[];
   for(const i of indices){const w=x.slice(lay.offsets[i],lay.offsets[i+1]),l=w.length,hit=counts[l].has(str(w));words++;lexical+=Number(hit);if(l<=3){short++;shortLexical+=Number(hit);log+=scores[l][id(w)];}for(const v of w){h[v]++;n++;}if(preview.length<12)preview.push(Array.from(w,v=>corpus.translit[v]).join(""));}
   return {words,runes:n,lexical,short,shortLexical,shortMeanLog:log/short,ioc:h.reduce((n,v)=>n+v*(v-1),0)/(n*(n-1)),preview:preview.join(" ")};
 };
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};const random=rng(0x33012478);
 const pkeys=[[5,9,17],[26,11,3],[18,24,7]],controls=[];
 for(let t=0;t<pkeys.length;t++){
   const pools=Array.from({length:15},()=>[]);for(const w of(t<2?native:sh))if(w.length<=14)pools[w.length].push(w);
   assert(original.every(w=>pools[w.length].length),"plant shape");
   const plain=Uint8Array.from(original.flatMap(w=>pools[w.length][random()%pools[w.length].length])),truth=pkeys[t],cipher=crypt(plain,lay,tables(truth),true);
   assert(equal(crypt(cipher,lay,tables(truth),false),plain),"true key full replay");
   const inferred=fit(cipher),decoded=crypt(cipher,lay,tables(inferred.key),false);
   controls.push({truth,inferred,exact:equal(decoded,plain),matches:decoded.reduce((n,v,i)=>n+Number(v===plain[i]),0),train:region(decoded,train),hold1:region(decoded,hold1),hold2:region(decoded,hold2)});
 }
 const p57flat=Uint8Array.from(p57.flat()),p57lay=layout(p57),t=tables(pkeys[0]);
 assert(equal(crypt(crypt(p57flat,p57lay,t,true),p57lay,t,false),p57flat),"genuine p57");
 const result={packets:lay.packets.length,mergedPackets:merged,oddPackets:odd,trainingPackets:trainingPackets.length,trainingShortWords:shortTrain.length,keyCount:29**3,controls,p57Recovered:p57flat.length};
 if(controls.every(x=>x.exact)){
   const inferred=fit(source),p=crypt(source,lay,tables(inferred.key),false);
   assert(equal(crypt(p,lay,tables(inferred.key),true),source),"original full replay");
   result.original={inferred,train:region(p,train),hold1:region(p,hold1),hold2:region(p,hold2),replayedRunes:p.length};
 }else result.original="Not opened after blind controls failed.";
 return result;
}
console.log(JSON.stringify(experiment(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"),assert.ok),null,2));
