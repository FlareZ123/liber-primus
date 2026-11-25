'use strict';
const fs=require('node:fs'),path=require('node:path');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
 const assert=(v,m)=>{if(!v)throw Error(m)},gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((r,i)=>[r,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const R=[2,8,9,1,12,13,11,4,5,7,3,0,6,10],N=1680,anchors=[10,91,99],blocks=[10,81,8,1581];
 function decode(x){let out=[];for(let i=0;i<x.length;i+=14){const row=x.slice(i,i+14);for(const c of R)if(c<row.length)out.push(row[c]);}return out;}
 function encode(x){let out=[];for(let i=0;i<x.length;i+=14){const row=x.slice(i,i+14),cols=R.filter(c=>c<row.length),r=Array(row.length);for(let j=0;j<row.length;j++)r[cols[j]]=row[j];out.push(...r);}return out;}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 for(let n=1;n<=42;n++){const test=Array.from({length:n},(_,i)=>i);assert(eq(decode(encode(test)),test)&&eq(encode(decode(test)),test),"row inverse "+n)}
 function mask(lens){let out=[];for(const L of lens){assert(L>0,"empty word");for(let j=1;j<L;j++)out.push(0);out.push(1)}out.pop();return out}
 function lengths(bits){let out=[],n=1;for(const b of bits){if(b){out.push(n);n=1}else n++}out.push(n);return out;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 function spell(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let n=0;for(let j=0;j<w.length;){const t=w.startsWith("ING",j)?{t:"ING"}:w.startsWith("IO",j)?{t:"IO"}:tokens.find(x=>w.startsWith(x.t,j));assert(t,"word "+w);j+=t.t.length;n++}return n}
 const donors=raw.slice(2).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(spell));
 const train=donors.map(d=>d.slice(0,Math.floor(d.length*.8))),maxL=Math.max(...train.flat()),B=maxL+1,counts=Array.from({length:B+1},()=>new Float64Array(B+1)),rows=new Float64Array(B+1);
 for(const d of train)for(let i=1;i<d.length;i++){const a=Math.min(B,d[i-1]),b=Math.min(B,d[i]);counts[a][b]++;rows[a]++}
 function score(lens){let s=0;for(let i=1;i<lens.length;i++){const a=Math.min(B,lens[i-1]),b=Math.min(B,lens[i]);s+=Math.log((counts[a][b]+1)/(rows[a]+B))}return s/(lens.length-1)}
 let seed=2770;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const control=[];
 for(const [d,donor] of donors.entries()){
  let cursor=Math.floor(donor.length*.8);
  function take(L){for(let i=cursor;i<donor.length;i++){let s=0,j=i;while(j<donor.length&&s<L)s+=donor[j++];if(s===L){cursor=j;return donor.slice(i,j)}}return null}
  for(let rep=0;rep<5;rep++){const seg=blocks.map(take);if(seg.some(x=>x===null))break;const ls=seg.flat(),trueB=mask(ls),encoded=encode(trueB),rec=decode(encoded);assert(eq(rec,trueB)&&eq(lengths(rec),ls),"decoy inverse");const shuffled=seg.map(x=>shuffle(x.slice())).flat(),shuffledB=mask(shuffled),bad=decode(shuffledB);assert(eq(encode(bad),shuffledB),"shuffle replay");control.push({d,positiveScore:score(lengths(rec)),shuffleScore:score(lengths(bad)),positiveAnchor:anchors.every(k=>rec[k-1]),shuffleAnchor:anchors.every(k=>bad[k-1]),shuffleExact:eq(bad,trueB),positiveMax:Math.max(...ls),shuffleMax:Math.max(...lengths(bad))});}
 }
 assert(control.length>=9&&new Set(control.map(x=>x.d)).size===3,"insufficient controls "+control.length);
 const worstPos=Math.min(...control.map(x=>x.positiveScore)),bestNeg=Math.max(...control.map(x=>x.shuffleScore)),separated=worstPos>bestNeg,threshold=separated?(worstPos+bestNeg)/2:null;
 function runeWords(t){let out=[],w=[],gap="";for(const c of t){if(ix.has(c)){if(w.length&&/[-.&]/u.test(gap)){out.push(w);w=[]}w.push(ix.get(c));gap="";}else gap+=c}if(w.length)out.push(w);return out}
 const groups=runeWords(raw[1]).slice(0,2896),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(eq(groups.flat(),unknown),"canonical source");
 const selected=groups.slice(1783,2161),ls=selected.map(w=>w.length),tape=selected.flat();
 const offset=groups.slice(0,1783).reduce((a,w)=>a+w.length,0),p33start=gp.pages.filter(p=>p.page<33).reduce((a,p)=>a+p.indices.length,0);assert(offset===p33start&&tape.length===N,"chapter start and size");
 const observed=mask(ls),rec=decode(observed),decoded=lengths(rec);assert(eq(encode(rec),observed)&&decoded.reduce((a,b)=>a+b,0)===N,"original exact replay");
 return {historicalR:R,scope:{chapterOffset:offset,runes:N,internalGaps:N-1,groups:ls.length,sourceAnchors:anchors,observedAnchorBits:anchors.map(k=>observed[k-1])},calibration:{controls:control.length,perDonor:[0,1,2].map(d=>control.filter(x=>x.d===d).length),positiveExact:control.length,positiveAnchor:control.filter(x=>x.positiveAnchor).length,shuffleAnchor:control.filter(x=>x.shuffleAnchor).length,shuffleExact:control.filter(x=>x.shuffleExact).length,positiveScores:[worstPos,Math.max(...control.map(x=>x.positiveScore))],shuffleScores:[Math.min(...control.map(x=>x.shuffleScore)),bestNeg],separated,threshold,maxTrainingWord:maxL},original:{decodedAnchorBits:anchors.map(k=>rec[k-1]),observedFirstRow:observed.slice(0,14),decodedFirstRow:rec.slice(0,14),firstOriginalGroups:ls.slice(0,10),firstDecodedGroups:decoded.slice(0,10),decodedMax:Math.max(...decoded),originalScore:score(ls),decodedScore:score(decoded),passesCalibratedScore:separated?score(decoded)>=threshold:null,roundTrip:true}};
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
