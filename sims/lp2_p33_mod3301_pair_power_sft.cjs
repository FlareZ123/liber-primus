"use strict";
/** Agent9: fixed F3301 exponent cycle-walk GP29 pairs; read-only. */
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65),all=(1<<29)-1;
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 check(types.size===35944,"frozen register");
 const byLen=new Map();for(const w of types){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(nums(w));}
 const orig=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const full=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);check(same(orig.flat(),full),"original transcript");
 let off=0;const rows=[];for(const w of orig){rows.push({start:off,len:w.length});off+=w.length;}

 const red=[[7960,7970],[8051,8059],[9519,9522]],blackRows=[],C=[];
 for(const w of rows){const start=w.start,end=start+w.len;if(start<7960||end>9640)continue;if(red.some(([a,b])=>start>=a&&end<=b))continue;check(!red.some(([a,b])=>start<b&&end>a),"no partially red group");blackRows.push({start:C.length,global:start,len:w.len});C.push(...full.slice(start,end));}
 check(C.length===1659&&C.slice(0,196).length===196&&same(C.slice(0,196),full.slice(7970,8051).concat(full.slice(8059,8174))),"black chapter geometry");
 const p=3301,e=1033;check(Array.from({length:56},(_,i)=>i+2).every(x=>p%x!==0),"prime field");
 const pow=(x,n)=>{let z=1;while(n){if(n&1)z=z*x%p;x=x*x%p;n>>=1;}return z;};
 let ei=1;while(e*ei%(p-1)!==1)ei++;
 const walk=(x,e)=>{let y=x,n=0;do{y=pow(y,e);n++;check(n<=p,"cycle return");}while(y>840);return [y,n];};
 const map=Array.from({length:841},(_,x)=>walk(x,e)[0]),im=Array.from({length:841},(_,x)=>walk(x,ei)[0]);
 check(new Set(map).size===841&&map.every((v,i)=>im[v]===i),"entire format-preserving inverse");
 const seen=new Set(),cycleHist={};for(let i=0;i<841;i++)if(!seen.has(i)){let j=i,n=0;do{seen.add(j);n++;j=map[j];}while(j!==i);cycleHist[n]=(cycleHist[n]||0)+1;}
 const rank=(a,b)=>29*a+b,ord=Array.from({length:841},(_,x)=>{if(!x)return 0;let o=p-1;for(const q of [2,3,5,11])while(o%q===0&&pow(x,o/q)===1)o/=q;return o;});check(map.every((v,i)=>ord[v]===ord[i]),"order invariant");
 const transform=(a,m)=>{const b=[...a];for(let i=0;i+1<a.length;i+=2){const z=m[rank(a[i],a[i+1])];b[i]=Math.floor(z/29);b[i+1]=z%29;}return b;};
 const metrics=a=>{let within=0,cross=0,lag5=0,lag5Opp=0;const counts=Array(841).fill(0);for(let i=1;i<a.length;i++)if(a[i]===a[i-1]){if(i%2)within++;else cross++;}for(let i=0;i+1<a.length;i+=2)counts[rank(a[i],a[i+1])]++;for(const w of blackRows)for(let i=w.start+5;i<w.start+w.len&&i<a.length;i++){lag5Opp++;if(a[i]===a[i-5])lag5++;}return {within,cross,equal:within+cross,lag5,lag5Opp,pairOrderedCollisions:counts.reduce((s,n)=>s+n*(n-1),0),pairDistinct:counts.filter(n=>n).length};};
 // Exact all-exponent necessary constraints: all legal returns preserve the multiplicative order of nonzero ranks.
 const signatureCache=new Map();
 function sig(p,parity){const a=[];for(let j=parity;j+1<p.length;j+=2)a.push(ord[rank(p[j],p[j+1])]);return a.join(",");}
 function support(a,wordRows){let eligible=0,unsupported=[];for(const w of wordRows){const parity=w.start%2;if(w.len<parity+2)continue;eligible++;const k=w.len+":"+parity;if(!signatureCache.has(k))signatureCache.set(k,new Set((byLen.get(w.len)||[]).map(p=>sig(p,parity))));const target=sig(a.slice(w.start,w.start+w.len),parity);if(!signatureCache.get(k).has(target))unsupported.push({global:w.global,start:w.start,len:w.len,target});}return {eligible,unsupported};}
 const two=new Map(),three=new Map();for(const s of gold.sections.filter(x=>!x.name.startsWith("p"))){const a=[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x));for(let i=2;i<a.length;i++){const b=29*a[i-2]+a[i-1],t=29*b+a[i];two.set(b,(two.get(b)||0)+1);three.set(t,(three.get(t)||0)+1);}}
 const score=a=>a.slice(2).reduce((s,x,i)=>{const b=29*a[i]+a[i+1];return s+Math.log(((three.get(29*b+x)||0)+1)/((two.get(b)||0)+29));},0)/(a.length-2);
 let seed=2823;function R(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];
 for(let d=0;d<3;d++){const tail=donors[d].slice(Math.floor(donors[d].length*.8)),pool=new Map();for(const w of tail)if(types.has(id(w))){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w);}
  for(let z=0;z<12;z++){let fallback=0;const p=blackRows.flatMap(w=>{const a=pool.get(w.len);if(a?.length)return a[R()%a.length];fallback++;return byLen.get(w.len)[R()%byLen.get(w.len).length];});const c=transform(p,map);check(same(transform(c,im),p),"native control full inverse");check(!support(c,blackRows).unsupported.length,"order invariant retains all lexical plants");controls.push({donor:d,seed:z,fallback,plain:metrics(p),cipher:metrics(c),nativeFitScore:score(p.slice(0,196)),nativeHoldScore:score(p.slice(196))});}
 }
 const P=transform(C,im);check(same(transform(P,map),C),"original exact replay");
 const original={cipher:metrics(C),decoded:metrics(P),orderSupport:support(C,blackRows),fitScore:score(P.slice(0,196)),heldoutScore:score(P.slice(196)),fitPrefix:P.slice(0,196).map(x=>gp.translit[x]).join(" "),heldoutPrefix:P.slice(196,296).map(x=>gp.translit[x]).join(" "),plain:P};
 return {p,e,inverseExponent:ei,permutation:{cycleHist,fixedPoints:cycleHist[1],maxForwardWalk:Math.max(...Array.from({length:841},(_,i)=>walk(i,e)[1])),maxInverseWalk:Math.max(...Array.from({length:841},(_,i)=>walk(i,ei)[1])),orderClasses:[...new Set(ord)].sort((a,b)=>a-b)},scope:{runes:C.length,rows:blackRows.length,fit:196,holdout:1463,red,finalSingleton:C.at(-1)},controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
