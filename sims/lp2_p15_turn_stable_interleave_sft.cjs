"use strict";
// Source-fixed p15 stable two-run merge. Run from repository root with Node.
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function run(inputs){
 const [raw,cj,nj,em,gib,sh]=inputs;const corpus=JSON.parse(cj),native=JSON.parse(nj),R=corpus.runes.join("");const check=(v,m)=>{if(!v)throw Error(m)};const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const spiral=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];const steps=spiral.slice(1).map((x,i)=>[Math.floor(x/4)-Math.floor(spiral[i]/4),x%4-spiral[i]%4].join(","));const bits=steps.slice(1).map((x,i)=>+(x!==steps[i]));check(bits.join("")==="11010100100100","source turns");
 // Strip physical wraps, preserve word-start rune coordinates.
 let page=0,off=0,w="",start=null;const groups=[],pages={};function finish(){if(w)groups.push({w,...start});w="";start=null;}
 for(const c of raw){if(c==="%"){page++;off=0;continue}if(c==="/"||/\s/u.test(c))continue;if(R.includes(c)){const p=page>=50?page+1:page;(pages[p]??=[]).push(R.indexOf(c));if(!w)start={page:p,off};w+=c;off++}else finish()}finish();
 for(const p of corpus.pages)check(eq(pages[p.page]||[],p.indices),"source page "+p.page);
 const original=groups.filter(g=>g.page<56);check(original.length===2896&&original.reduce((s,g)=>s+g.w.length,0)===12956,"corpus counts");
 const startIdx=original.findIndex(g=>g.page===15&&g.off===20);check(startIdx>=0,"body start is boundary");
 const C=original.slice(startIdx).map(g=>g.w);
 const mask=n=>Array.from({length:n},(_,i)=>bits[i%bits.length]);
 /** @param {any[]} t @param {number[]} m */
 function send(t,m){const a=m.reduce((s,x)=>s+x,0);let i=0,j=a;return m.map(x=>x?t[i++]:t[j++]);}
 /** @param {any[]} c @param {number[]} m */
 function inv(c,m){const a=[],b=[];c.forEach((v,i)=>(m[i]?a:b).push(v));return a.concat(b)}
 const m=mask(C.length),P=inv(C,m),nA=m.reduce((s,x)=>s+x,0);check(eq(send(P,m),C),"original exact replay");
 const english=t=>{let i=t.search(/\*\*\* START OF/i);if(i>=0)t=t.slice(t.indexOf("\n",i)+1);i=t.search(/\*\*\* END OF/i);if(i>=0)t=t.slice(0,i);return (t.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(w=>w.toUpperCase().replace(/['’]/g,"").replace(/ING|TH|EO|NG|OE|AE|IA|IO|EA/g,"#").length)};
 const E=english(em),G=english(gib),H=english(sh),half=Math.floor(E.length/2),cls=x=>Math.min(8,x)-1;
 const counts=Array.from({length:8},()=>Array(8).fill(1));for(let i=1;i<half;i++)counts[cls(E[i-1])][cls(E[i])]++;const row=counts.map(a=>a.reduce((s,x)=>s+x,0)),col=Array.from({length:8},(_,b)=>counts.reduce((s,a)=>s+a[b],0)),tot=row.reduce((s,x)=>s+x,0),S=counts.map((a,i)=>a.map((v,j)=>Math.log(v*tot/(row[i]*col[j]))));
 const score=l=>{let x=0;for(let i=1;i<l.length;i++)x+=S[cls(l[i-1])][cls(l[i])];return x/(l.length-1)};
 const seam=w=>{let e=0;for(let i=1;i<w.length;i++)e+=+(w[i-1].at(-1)===w[i][0]);return e};
 const lengths=w=>w.map(x=>x.length);
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 function shuffle(a,rand){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function quant(a,obs){let avg=a.reduce((s,x)=>s+x,0)/a.length;return {obs,min:Math.min(...a),max:Math.max(...a),mean:avg,pUpper:(1+a.filter(x=>x>=obs).length)/(a.length+1),pLower:(1+a.filter(x=>x<=obs).length)/(a.length+1)}}
 const L=lengths(C),D=lengths(P),rand=rng(32071941),nullLength=[],nullSeam=[],nullGlobal=[];
 for(let k=0;k<1999;k++){const mr=shuffle(m,rand),d=inv(C,mr);nullLength.push(score(lengths(d)));nullSeam.push(seam(d));nullGlobal.push(score(shuffle(L,rand)))}
 const nativeControls=native.sections.map(s=>{const p=Array.from(s.source_text.matchAll(new RegExp("["+R+"]+","gu")),x=>x[0]);const atbash=w=>[...w].map(c=>R[28-R.indexOf(c)]).join("");const hidden=send(p.map(atbash),mask(p.length)),recovered=inv(hidden,mask(p.length)).map(atbash);check(eq(recovered,p),"native control "+s.name);const rival=inv(hidden,shuffle(mask(p.length),rand)).map(atbash);return {name:s.name,groups:p.length,runes:p.join("").length,exact:recovered.join("")===p.join(""),rivalExactGroups:rival.filter((w,i)=>w===p[i]).length}});
 const lengthControls=[];
 for(const [name,arr] of [["Emerson",E.slice(half)],["Gibran",G],["Shakespeare",H]])for(let off=0;off+C.length<=arr.length&&off<6*C.length;off+=C.length){const p=arr.slice(off,off+C.length),c=send(p,m),d=inv(c,m);check(eq(d,p),"length plant");const wrong=inv(c,shuffle(m,rand)),rival=inv(shuffle(p,rand),m);lengthControls.push({name,off,plain:score(p),sent:score(c),recovered:score(d),wrong:score(wrong),equalInventoryRival:score(rival)})}
 const out={schedule:bits.join(""),sourceStart:{page:15,rune:20,group:startIdx},groups:C.length,runes:C.join("").length,laneCounts:[nA,C.length-nA],runs:[{groups:nA,score:score(D.slice(0,nA)),seams:seam(P.slice(0,nA))},{groups:C.length-nA,score:score(D.slice(nA)),seams:seam(P.slice(nA))}],original:{printedScore:score(L),inverseScore:score(D),printedSeams:seam(C),inverseSeams:seam(P),seamsCount:C.length-1,routeNull:quant(nullLength,score(D)),seamRouteNull:quant(nullSeam,seam(P)),globalLengthNull:quant(nullGlobal,score(D)),inverseFirst20:P.slice(0,20),inverseLast20:P.slice(-20),replay:true},nativeControls,lengthControls,trainingWords:half};
 return out;
}
module.exports={run,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
