"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
function run(raw){
 const route=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],tokens="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ").sort((a,b)=>b.length-a.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let n=0;for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?"ING":w.startsWith("IO",j)?"IO":tokens.find(x=>w.startsWith(x,j));if(!v)throw Error("unmapped "+w);j+=v.length;n++}return n})}
 const pages=raw[0].split("%");const actual=pages.slice(15,23).join("").replace(/[/\s]/g,"").match(/\p{Script=Runic}+/gu);if(actual.slice(0,5).reduce((s,w)=>s+w.length,0)!==20)throw Error("rubric mismatch");actual.splice(0,5);const L=actual.length,R=actual.reduce((s,w)=>s+w.length,0);if(L!==432||R!==1883)throw Error("chapter mismatch");
 function perm(a,p,inv){const o=a.slice();for(let b=0;b+16<=a.length;b+=16){for(let i=0;i<16;i++)if(inv)o[b+p[i]]=a[b+i];else o[b+i]=a[b+p[i]]}return o}
 const original=actual.map(w=>w.length),N=12,B=x=>Math.min(N,x)-1,idx4=(a,b,c,d)=>((a*N+b)*N+c)*N+d;
 const donors=raw.slice(1,4).map(native),nativeText=JSON.parse(raw[4]),nativeSections=nativeText.sections.map(s=>({name:s.name,len:(s.source_text.match(/\p{Script=Runic}+/gu)||[]).map(w=>w.length)}));
 const exact=nativeSections.flatMap(x=>x.len),u=new Float64Array(N).fill(.5),bi=new Float64Array(N*N),hist=new Float64Array(N),bag=new Float64Array(N**4),sortKey=new Int32Array(N**4);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++)for(let d=0;d<N;d++){const x=[a,b,c,d].sort((x,y)=>x-y);sortKey[idx4(a,b,c,d)]=idx4(...x)}
 let bagTotal=0;
 for(const donor of donors){const t=donor.slice(0,Math.floor(donor.length*.8)).map(B);for(let i=0;i<t.length;i++){u[t[i]]++;if(i){hist[t[i-1]]++;bi[t[i-1]*N+t[i]]++}if(i>=3){bag[sortKey[idx4(t[i-3],t[i-2],t[i-1],t[i])]]++;bagTotal++}}}
 const sum=a=>a.reduce((s,x)=>s+x,0),U=Float64Array.from(u,x=>x/sum(u)),pair=new Float64Array(N*N),iidBag=new Float64Array(N**4),phrase=new Float64Array(N**4);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){pair[a*N+b]=Math.log((bi[a*N+b]+20*U[b])/(hist[a]+20)/U[b]);for(let c=0;c<N;c++)for(let d=0;d<N;d++)iidBag[sortKey[idx4(a,b,c,d)]]+=U[a]*U[b]*U[c]*U[d]}
 for(let k=0;k<phrase.length;k++)if(iidBag[k]>0)phrase[k]=Math.log((bag[k]+1000*iidBag[k])/(bagTotal+1000)/iidBag[k]);
 function score(a){let p=0,g=0;for(let i=1;i<a.length;i++)p+=pair[a[i-1]*N+a[i]];for(let i=3;i<a.length;i++)g+=phrase[sortKey[idx4(a[i-3],a[i-2],a[i-1],a[i])]];return {pair:p/(a.length-1),bag:g/(a.length-3)}}
 let seed=2732;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 function randomPerm(){const p=Array.from({length:16},(_,i)=>i);for(let j=15;j>0;j--){const k=Math.floor(rng()*(j+1));[p[j],p[k]]=[p[k],p[j]]}return p}
 const windows=[];
 for(let d=0;d<donors.length;d++){const a=donors[d],start=Math.floor(a.length*.8);let n=0;for(let i=start;i+L<=a.length&&n<12;i+=100){const x=a.slice(i,i+L),r=sum(x);if(Math.abs(r-R)>R*.05)continue;windows.push({donor:d,start:i,r,x});n++}}
 for(let i=0;i+L<=exact.length;i+=100){const x=exact.slice(i,i+L),r=sum(x);if(Math.abs(r-R)<=R*.05)windows.push({donor:"exact GP concatenated",start:i,r,x})}
 // If a length-matched panel is small, report that limitation; never relax the gate after scoring original.
 if(windows.length<12)throw Error("too few matched controls "+windows.length);
 const quantile=(a,q)=>a.slice().sort((x,y)=>x-y)[Math.floor((a.length-1)*q)];
 const nativeScores=windows.map(w=>score(w.x.map(B))),floors={pair:quantile(nativeScores.map(x=>x.pair),.05),bag:quantile(nativeScores.map(x=>x.bag),.05)};
 function assess(a,inv,nNull){const base=score(a),restored=perm(a,route,inv),s=score(restored);let pc=0,bc=0;for(let i=0;i<nNull;i++){const t=score(perm(a,randomPerm(),false));if(t.pair>=s.pair-1e-12)pc++;if(t.bag>=s.bag-1e-12)bc++}const pPair=(pc+1)/(nNull+1),pBag=(bc+1)/(nNull+1),gainPair=s.pair-base.pair,gainBag=s.bag-base.bag;return {inv,baseline:base,score:s,gainPair,gainBag,pPair,pBag,pass:s.pair>=floors.pair&&s.bag>=floors.bag&&gainPair>0&&gainBag>0&&pPair<=.025&&pBag<=.025}}
 const controls=[];
 for(const w of windows){const planted=w.x.map(B),out=[];for(const enc of [false,true]){const scrambled=perm(planted,route,enc),restored=perm(scrambled,route,!enc);if(restored.some((x,i)=>x!==planted[i]))throw Error("control inversion");out.push({encoding:enc,correct:assess(scrambled,!enc,399),wrong:assess(scrambled,enc,399)})}controls.push({donor:w.donor,start:w.start,runes:w.r,native:score(planted),out})}
 const orig=original.map(B),results=[false,true].map(inv=>{const p=perm(actual,route,inv);if(perm(p,route,!inv).some((x,i)=>x!==actual[i]))throw Error("original replay");return {...assess(orig,inv,1999),firstLengths:p.slice(0,32).map(w=>w.length)}});
 const calibration={nativeWindows:windows.length,correctPass:controls.flatMap(x=>x.out).filter(x=>x.correct.pass).length,wrongPass:controls.flatMap(x=>x.out).filter(x=>x.wrong.pass).length,exactGroupReplays:windows.length*2,matchedCounts:Object.fromEntries([...new Set(windows.map(x=>String(x.donor)))].map(k=>[k,windows.filter(x=>String(x.donor)===k).length]))};
 return {scope:"p15 black body through p22; p16–22 aligned to actual chapter-body start; final incomplete group block untouched",groupCount:L,runeCount:R,fullBlocks:Math.floor(L/16),partial:L%16,route,trainWords:donors.map(a=>Math.floor(a.length*.8)),exactNativeGroups:exact.length,calibration,floors,controlWindows:controls,original:results,gate:"both conditional pair/4-group bag log-likelihood lift scores meet native 5th percentile floor, both improve over printed, and both empirical fixed-permutation upper-tail p<=.025 in charged orientation",notes:"Phrase-bag proxy is sorted four-group length tuple, not lexical semantics. Literary windows overlap at stride100; exact GP concatenation is an independent source but contains section joins. Gate uses no original rune values or plaintext words."}
}
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(paths.map(read)),null,2));
