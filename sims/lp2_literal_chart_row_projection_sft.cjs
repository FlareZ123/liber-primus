"use strict";
function lexical(native,groups){
 const alpha=native.runes,compact="0123456789abcdefghijklmnopqrs",proj=w=>w.map(i=>i===0?"F":i>=15?"1":"0").join("");
 const wordMap=new Map();for(const s of native.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]){const a=[...w].map(x=>alpha.indexOf(x));if(a.includes(-1))throw Error("rune");const p=proj(a);if(!wordMap.has(p))wordMap.set(p,new Set());wordMap.get(p).add(w)}
 const p54=groups.p54.body_groups,p55=groups.p55.groups,words=[...p54.slice(0,-1),p54.at(-1)+p55[0],...p55.slice(1)];
 const matches=words.map(w=>{const p=proj([...w].map(c=>compact.indexOf(c)));return {word:w,p,n:wordMap.get(p)?.size||0,examples:[...(wordMap.get(p)||[])].slice(0,4)}});
 return {nativeWordTypes:[...wordMap.values()].reduce((s,v)=>s+v.size,0),nativeProjectedTypes:wordMap.size,originalCompleteGroups:words.length,zero:matches.filter(x=>x.n===0).length,one:matches.filter(x=>x.n===1).length,multi:matches.filter(x=>x.n>1).length,log2PositiveOptions:matches.filter(x=>x.n>0).reduce((s,v)=>s+Math.log2(v.n),0),example:matches.filter(x=>x.n>=4).slice(0,8)};
}
function run(native,corpus,master,groups){
 const assert=(v,m)=>{if(!v)throw Error(m)}, N=29,L=32;const alphabet=native.runes,bit=v=>+(v>=15),bits=a=>a.map(bit).join(""),ones=s=>[...s].filter(x=>x==="1").length;
 const extract=s=>[...s].filter(x=>alphabet.includes(x)).map(x=>alphabet.indexOf(x));
 const donors=native.sections.map(s=>({name:s.name,a:extract(s.source_text)}));
 const byFit=new Map(), all=[];
 for(const d of donors){const b=bits(d.a);for(let i=0;i+2*L<=b.length;i++){const fit=b.slice(i,i+L),held=b.slice(i+L,i+2*L);const e={name:d.name,i,fit,held};all.push(e);if(!byFit.has(fit))byFit.set(fit,[]);byFit.get(fit).push(e)}}
 function search(train,held=[]){const b=bits(train),h=bits(held),out=[],matched=[];let positions=0;for(let i=0;i+L<=b.length&&i+2*L<=b.length+h.length;i++){positions++;for(const e of byFit.get(b.slice(i,i+L))||[]){out.push({target:i,donor:e.name,donorOffset:e.i});if(e.held===(b+h).slice(i+L,i+2*L))matched.push({target:i,donor:e.name,donorOffset:e.i})}}return {positions,pairs:positions*all.length,fit:out,full:matched}}
 const body=corpus.pages[54].indices.slice(9),p55=corpus.pages[55].indices;assert(body.length===223&&p55.length===76,"source");
 const target=search(body,p55);
 const prob=(n,m,l,k)=>{if(k<0||k>m||l-k>n-m||l>n)return 0;let v=1;for(let i=0;i<k;i++)v*=(m-i)/(n-i);for(let i=0;i<l-k;i++)v*=(n-m-i)/(n-k-i);return v};
 let eFit=0,eFull=0;const n=body.length,m=ones(bits(body)),nh=p55.length,mh=ones(bits(p55));
 for(let i=0;i+L<=n&&i+2*L<=n+nh;i++){for(const d of all){eFit+=prob(n,m,L,ones(d.fit));const s=d.fit+d.held,a=Math.min(s.length,n-i);eFull+=prob(n,m,a,ones(s.slice(0,a)))*prob(nh,mh,s.length-a,ones(s.slice(a)))}}
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function shuffle(a,random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function plant(name,start,seed){const d=donors.find(d=>d.name===name);const p=d.a.slice(start,start+128),random=rng(seed),keys=[];for(let b=0;b<2;b++)keys.push([0,...shuffle(Array.from({length:14},(_,i)=>i+1),random),...shuffle(Array.from({length:14},(_,i)=>i+15),random)]);const c=p.map((v,i)=>keys[Math.floor(i/64)][v]);assert(bits(p)===bits(c),"projection");const result=search(c.slice(0,96),c.slice(96));const truth=result.full.some(x=>x.target===0&&x.donor===name&&x.donorOffset===start);const partial=new Map();for(let i=0;i<32;i++)partial.set(p[i],c[i]);let predicted=0;for(let i=32;i<64;i++)if(partial.has(p[i])){assert(partial.get(p[i])===c[i],"map");predicted++}return {name,start,seed,truth,fit:result.fit.length,full:result.full.length,trainingMapEntries:partial.size,heldPredictions:predicted}}
 const positives=[plant("0_welcome",83,3301),plant("0_koan_1",190,1033)];
 const segments=master.slice(master.indexOf("\n\n")+2).split(/\s*\$\s*/u).map(extract).filter(s=>s.length);assert(segments[0].length===184,"warning");const warning=segments[0],wp=warning.map(x=>28-x);assert(bits(wp)===bits(donors[0].a),"warning native match");
 const p56=corpus.pages[56].indices,ep=donors.find(x=>x.name==="p56_an_end").a;
 const negatives=[{name:"LP1_warning",pairMismatches:warning.filter((x,i)=>bit(x)!==bit(wp[i])).length,search:search(warning)},{name:"LP2_p56",pairMismatches:p56.filter((x,i)=>bit(x)!==bit(ep[i])).length,search:search(p56)}];
 const distractors=[];for(const seed of [17,29,56,3301]){const q=rng(seed);const s=search(shuffle(body,q),shuffle(p55,q));distractors.push({seed,fit:s.fit.length,full:s.full.length})}
 // Exact lower bound on unrestricted pointwise inverse ambiguity under mandatory F hold:
 // C=F forces P=F for permutations fixing F; all non-F first-column positions have 14 choices, and all second-column positions have 14.
 const counts=[...body,...p55].reduce((a,x)=>(a[x===0?0:bit(x)===0?1:2]++,a),[0,0,0]);
 return {lexical:groups?lexical(native,groups):null,schema:"literal-chart-row-projection-v1",partition:[alphabet.slice(0,15).join(""),alphabet.slice(15).join("")],donorSections:donors.map(d=>[d.name,d.a.length]),donorWindows:all.length,distinctFit:byFit.size,target:{n,m,nh,mh,...target},conditionalUniformPermutation:{expectedFit:eFit,expectedFull:eFull,unionBoundFull:Math.min(1,eFull)},positives,negatives,distractors,pointwiseFfixed:{counts,exactPlaintextCount:"14^"+(counts[1]+counts[2]),log2:(counts[1]+counts[2])*Math.log2(14)}};
}
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),fs.readFileSync("resources/transcriptions/liber_primus_master.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"))),null,2))}
module.exports={run};
