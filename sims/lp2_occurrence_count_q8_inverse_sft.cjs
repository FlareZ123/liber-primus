"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const g=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(g.runes.map((c,i)=>[c,i])),mod=x=>(x%29+29)%29, id=w=>w.join(","),assert=(v,m)=>{if(!v)throw Error(m)};
 const tokens=g.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t,sep){let out=[],w=[],between="";for(const c of t){if(ix.has(c)){if(w.length&&sep.test(between)){out.push(w);w=[]}w.push(ix.get(c));between=""}else between+=c}if(w.length)out.push(w);return out}
 function spell(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unmapped "+w);p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w))}
 const donors=raw.slice(3,6).map(native),train=donors.map(w=>w.slice(0,Math.floor(w.length*.8))),dict=new Map();
 for(const w of train.flat())if(w.length<=24)dict.set(id(w),w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))dict.set(id(w),w);
 const baseTypes=dict.size;assert(baseTypes===10842,"base vocabulary "+baseTypes);
 for(const l of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m)for(const alt of [false,true]){const p=spell(m[1],alt);if(p.length&&p.length<=24)dict.set(id(p),p)}}
 for(let i=0;i<29;i++)dict.set(id([i]),[i]);
 const byLen=new Map();for(const w of dict.values()){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w)}
 const extract=t=>[...t].filter(c=>ix.has(c)).map(c=>ix.get(c));
 const pages=g.pages.filter(p=>p.page<56),source=runeWords(raw[1],/[-.&$]/u),flat=source.flat();assert(id(flat.slice(0,12956))===id(pages.flatMap(p=>p.indices)),"source mismatch");
 const ranges=["p0–2","p3–7","p8–p15 opening 9","p15 after opening 9–p22","p23–26","p27–32","p33–39","p40–53","p54–55"]; const cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956];
 const chapters=ranges.map(()=>[]);let cursor=0,h=0;for(const w of source){if(cursor>=12956)break;while(cursor===cuts[h+1])h++;assert(cursor+w.length<=cuts[h+1],"chapter boundary clipped");chapters[h].push(w);cursor+=w.length}assert(chapters.flat().length===2896,"group total "+chapters.flat().length);
 function phases(C){const count=Array(29).fill(0),J=[];let j=0;for(const c of C){J.push(j);j=++count[c]%8}return J}
 function enc(P,K,mode="occ",R){const count=Array(29).fill(0),C=[],J=[];let j=0;for(let i=0;i<P.length;i++){J.push(j);const c=mod(P[i]+(mode==="pad"?R()%29:K[j]));C.push(c);j=mode==="digit"?(j+1)%8:++count[c]%8}return {C,J}}
 function dec(C,K){const J=phases(C);return C.map((c,i)=>mod(c-K[J[i]]))}
 const same=(a,b)=>id(a)===id(b);
 function clockStats(tapes){let N=0,rep=0,samePhase=0,samePhaseRep=0;const hist=Array.from({length:8},()=>Array(29).fill(0)),diff=Array.from({length:8},()=>Array.from({length:8},()=>Array(29).fill(0)));
 for(const C of tapes){const J=phases(C);N+=C.length;for(let i=0;i<C.length;i++){hist[J[i]][C[i]]++;if(i){const a=J[i-1],b=J[i],d=mod(C[i]-C[i-1]);rep+=Number(d===0);samePhase+=Number(a===b);samePhaseRep+=Number(a===b&&d===0);if(a<=b)diff[a][b][d]++;else diff[b][a][mod(-d)]++}}}
 let min=0,max=0;for(let a=0;a<8;a++)for(let b=a;b<8;b++){const x=diff[a][b];min+=a===b?x[0]:Math.min(...x);max+=a===b?x[0]:Math.max(...x)}
 const f=Array(29).fill(.5);for(const p of train.flat(2))f[p]++;const total=f.reduce((a,b)=>a+b,0),log=f.map(n=>Math.log(n/total));const ll=hist.map(row=>Array.from({length:29},(_,k)=>row.reduce((s,n,c)=>s+n*log[mod(c-k)],0)));const key=ll.map(row=>row.indexOf(Math.max(...row)));const maxLL=ll.reduce((s,row)=>s+Math.max(...row),0)/N;const Emax=hist.reduce((s,row)=>s+Math.max(...row),0);
 return {N,transitions:N-tapes.length,rep,samePhase,samePhaseRep,decodedRepeatBounds:[min,max],maxLL,Emax,phaseCounts:hist.map(r=>r.reduce((a,b)=>a+b,0)),key};
 }
 function projection(groups,C,J){
 let cursor=0,impossible=0,groupsBySig=new Map(),fullCandidates=new Set(),fullAnchors=0;
 for(const w of groups){const c=C.slice(cursor,cursor+w.length),j=J.slice(cursor,cursor+w.length);cursor+=w.length;
 const present=[...new Set(j)].sort((a,b)=>a-b),freq=Array(8).fill(0);for(const v of j)freq[v]++;
 const selected=present.slice().sort((a,b)=>freq[b]-freq[a]||a-b).slice(0,4).sort((a,b)=>a-b),sig=selected.join(","),opts=new Set(),all=new Set();
 for(const p of byLen.get(w.length)||[]){const K=Array(8).fill(-1);let ok=true;for(let i=0;i<c.length;i++){const k=mod(c[i]-p[i]),v=j[i];if(K[v]>=0&&K[v]!==k){ok=false;break}K[v]=k}if(ok){opts.add(selected.map(v=>K[v]).reduce((a,b)=>a*29+b,0));if(present.length===8)all.add(id(K))}}
 if(!opts.size){impossible++;continue}if(present.length===8){fullAnchors++;for(const k of all)fullCandidates.add(k)}
 if(!groupsBySig.has(sig))groupsBySig.set(sig,{n:0,m:new Map()});const cell=groupsBySig.get(sig);cell.n++;for(const k of opts)cell.m.set(k,(cell.m.get(k)||0)+1);
 }
 let minOOV=impossible;const details=[];for(const [sig,{n,m}] of groupsBySig){let max=0;for(const v of m.values())max=Math.max(max,v);minOOV+=n-max;details.push({sig,n,max})}
 return {n:groups.length,impossible,minOOV,budget:Math.floor(groups.length*.05),fullAnchors,fullCandidates:fullCandidates.size,details};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const original=chapters.map(w=>w.flat()),originalStats=clockStats(original);
 const originalLex=chapters.map((w,i)=>({range:ranges[i],...projection(w,original[i],phases(original[i]))}));
 function eFloor(N){return donors.map(d=>{const P=d.flat(),e=g.translit.indexOf("E");let n=P.slice(0,N).filter(x=>x===e).length,min=n;for(let i=N;i<P.length;i++){n+=Number(P[i]===e)-Number(P[i-N]===e);min=Math.min(n,min)}return {windows:P.length-N+1,min}})}
 const wholeE=eFloor(12956),chapterE=original.map((C,i)=>({range:ranges[i],Emax:clockStats([C]).Emax,donors:eFloor(C.length)}));
 const controlStats=[],controls=[];
 for(let d=0;d<donors.length;d++){const donor=donors[d],P=donor.flat(),R=rng(0x33012746+d*13);for(let k=0;k<8;k++){const K=Array.from({length:8},()=>R()%29),start=R()%(P.length-12956+1),p=P.slice(start,start+12956),pts=cuts.slice(0,-1).map((a,i)=>p.slice(a,cuts[i+1]));const row={d,k,K,start};for(const mode of ["occ","digit","pad"]){const ct=pts.map(t=>enc(t,K,mode,R).C),s=clockStats(ct);row[mode]={rep:s.rep,samePhase:s.samePhase,samePhaseRep:s.samePhaseRep,maxLL:s.maxLL,Emax:s.Emax,decodedRepeatBounds:s.decodedRepeatBounds,recKey:same(K,s.key)};if(mode==="occ"){assert(ct.every((c,i)=>same(dec(c,K),pts[i])&&same(enc(dec(c,K),K).C,c)),"occ round trip");const decodedRep=pts.reduce((z,t)=>z+t.slice(1).filter((c,i)=>c===t[i]).length,0);assert(decodedRep>=s.decodedRepeatBounds[0]&&decodedRep<=s.decodedRepeatBounds[1],"repeat bound excludes true key");row[mode].nativeRep=decodedRep;}}controlStats.push(row)}
 const test=donor.slice(Math.floor(donor.length*.8)),pWords=test.slice(0,Math.min(650,test.length)),p=pWords.flat(),K=Array.from({length:8},()=>R()%29),{C,J}=enc(p,K);assert(same(J,phases(C)),"phase mismatch");const n=Math.floor(p.length*.75),fit=clockStats([C.slice(0,n)]),guess=fit.key,decoded=dec(C,guess);const lex=projection(pWords,C,J),oov=pWords.filter(w=>!dict.has(id(w))).length;assert(lex.minOOV<=oov,"lexical bound false rejection");controls.push({d,n:p.length,fit:n,heldout:p.length-n,K,guess,keyCorrect:same(K,guess),correct:decoded.slice(n).filter((v,i)=>v===p[n+i]).length,oov,lex});
 }
 // Authenticate known p56 and the two native keyword controls under their actual algorithms.
 const P56=extract(gold.sections.find(s=>s.name==="p56_an_end").source_text),C56=g.pages.find(p=>p.page===56).indices;let primes=[];for(let p=2;primes.length<P56.length;p++)if(!primes.some(q=>q*q<=p&&p%q===0))primes.push(p);let z=0;const re56=P56.map(p=>p===0?0:mod(p+primes[z++]-1));assert(same(re56,C56),"p56 replay");
 const wC=extract(raw[7].split("%").slice(1,3).join("%")),kC=extract(raw[7].split("$")[5]);const keyword=(P,K)=>{let j=0;return P.map(p=>p===0?0:mod(p+K[j++%K.length]))};
 const wP=extract(gold.sections.find(s=>s.name==="0_welcome").source_text),kP=extract(gold.sections.find(s=>s.name==="jpg107-167").source_text);
 assert(same(keyword(wP,[23,10,1,10,9,10,16,26]),wC),"WELCOME replay");assert(same(keyword(kP,[0,10,4,0,1,19,0,18,4,18,9,0,18]),kC),"KOAN replay");
 return {baseTypes,broadTypes:dict.size,cuts,wholeE,chapterE,sourceReplays:[C56.length,wC.length,kC.length],originalStats,originalLex,controlStats,controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
