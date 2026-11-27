'use strict';
const fs=require('node:fs');
const path=require('node:path');
function analyze(corpus,source,reference){
 const assert=(condition,message)=>{if(!condition)throw Error(message)};
 const mod=(n,m=29)=>(n%m+m)%m;
 const primes=[...source.matchAll(/^echo( -n| )?\s+"(\d+)\t"; sleep (\.05|2)$/gm)].map(m=>({value:+m[2],newline:m[1]!==" -n",hold:m[3]==="2"}));
 assert(primes.length===464,"464 events");
 assert(primes.every((x,i)=>x.newline===((i+1)%10===0)),"actual display line breaks");
 assert(primes.filter(x=>x.hold).map(x=>x.value).join(",")==="1033,3301","special pauses");
 const expected=[];for(let p=2;p<=3301;p++){let ok=true;for(let q=2;q*q<=p;q++)if(p%q===0){ok=false;break;}if(ok)expected.push(p)}
 assert(primes.every((x,i)=>x.value===expected[i]),"prime enumeration");
 const columns=Array.from({length:10},(_,j)=>primes.filter((x,i)=>i>=174&&i%10===j).map(x=>x.value));
 assert(columns.every(x=>x.length===29),"10 columns of 29");
 const key=columns.flat().map(p=>mod(p-1));
 const pages=corpus.pages;const target=pages[33].indices.slice(91).concat(...pages.slice(34,40).map(p=>p.indices));assert(target.length===1589,"target length");
 const fit=target.length-pages[39].indices.length;
 const translit=corpus.translit;const aliases=new Map(translit.map((s,i)=>[s,i]));aliases.set("ING",21);aliases.set("V",1);aliases.set("K",5);aliases.set("Z",15);aliases.set("Q",5);const tokens=[...aliases.keys()].sort((a,b)=>b.length-a.length);
 const tokenize=s=>{const out=[];for(const word of s.toUpperCase().match(/[A-Z]+/g)??[]){let i=0;while(i<word.length){let t=tokens.find(t=>word.startsWith(t,i));assert(t,"unrecognized "+word.slice(i));out.push(aliases.get(t));i+=t.length}}return out};
 const p56="A-N-E-N-D-W-I-TH-I-N-TH-E-D-E-E-P-W-E-B-TH-E-R-E-E-X-I-S-T-S-A-P-A-G-E-TH-A-T-H-A-S-H-E-S-T-O-I-T-I-S-TH-E-D-U-T-Y-O-F-E-U-E-R-Y-P-I-L-G-R-I-M-T-O-S-E-E-C-O-U-T-TH-I-S-P-A-G-E".split("-").map(x=>aliases.get(x));assert(p56.length===85,"p56 length");let n=0;const replay56=p56.map(x=>x===0?0:mod(x+expected[n++]-1));assert(replay56.every((x,i)=>x===pages[56].indices[i])&&n===84,"authentic p56 replay");
 const p57=pages[57].indices;assert(p57.length===95,"p57");
 const trainingText=reference.split(/^### (?:56|57)\s*$/m)[0].split("\n").filter(l=>!l.startsWith("#")&&!l.startsWith("[")&&!l.startsWith("(")).join("\n");
 const training=tokenize(trainingText);
 const uni=new Float64Array(29),bi=new Float64Array(841),tri=new Float64Array(24389),tot2=new Float64Array(841),tot1=new Float64Array(29);
 for(let i=0;i<training.length;i++){let x=training[i];uni[x]++;if(i){let y=training[i-1];bi[y*29+x]++;tot1[y]++;if(i>1){let z=training[i-2];tri[(z*29+y)*29+x]++;tot2[z*29+y]++}}}
 const logs=new Float64Array(24389);for(let z=0;z<29;z++)for(let y=0;y<29;y++)for(let x=0;x<29;x++){let pu=(uni[x]+1)/(training.length+29);let pb=(bi[y*29+x]+5*pu)/(tot1[y]+5);logs[(z*29+y)*29+x]=Math.log((tri[(z*29+y)*29+x]+5*pb)/(tot2[z*29+y]+5))}
 const score=(a,start=0,end=a.length)=>{let s=0,k=0;for(let i=Math.max(2,start);i<end;i++){s+=logs[(a[i-2]*29+a[i-1])*29+a[i]];k++}return s/k};
 const encrypt=(p,phase,sign,hold)=>{let j=phase;return p.map(x=>{if(hold&&x===0)return 0;let y=mod(x+sign*key[j]);j=(j+1)%key.length;return y})};
 const ordinary=(c,phase,sign)=>c.map((x,i)=>mod(x-sign*key[(phase+i)%key.length]));
 const reach=(c,phase,sign)=>{let states=new Set([phase]);for(let i=0;i<c.length;i++){let next=new Set();for(let j of states){if(c[i]===0)next.add(j);if(mod(c[i]-sign*key[j])!==0)next.add((j+1)%key.length)}if(!next.size)return{prefix:i,ends:[]};states=next}return{prefix:c.length,ends:[...states].sort((a,b)=>a-b)}};
 // Verify small exact state DAGs against explicit paths.
 let bruteChecks=0;for(let phase=0;phase<20;phase++)for(let sign of [1,-1]){const c=encrypt([0,1,2,0,3,0,4,5],phase,sign,true);let paths=[phase];for(let x of c){let next=[];for(let j of paths){if(x===0)next.push(j);if(mod(x-sign*key[j])!==0)next.push((j+1)%key.length)}paths=next}assert([...new Set(paths)].sort((a,b)=>a-b).join()===reach(c,phase,sign).ends.join(),"explicit histories");bruteChecks++}
 const search=c=>{let best=null,second=null,legal=[],maxPrefix=0,bestReach=[];for(let sign of [1,-1])for(let phase=0;phase<key.length;phase++){let d=ordinary(c,phase,sign);assert(encrypt(d,phase,sign,false).every((x,i)=>x===c[i]),"ordinary replay");let a={phase,sign,fit:score(d,0,fit),held:score(d,fit),preview:d.slice(0,45).map(x=>translit[x]).join("-")};if(!best||a.fit>best.fit){second=best;best=a}else if(!second||a.fit>second.fit)second=a;let r=reach(c,phase,sign);if(r.prefix===c.length)legal.push({phase,sign,ends:r.ends});if(r.prefix>maxPrefix){maxPrefix=r.prefix;bestReach=[]}if(r.prefix===maxPrefix)bestReach.push({phase,sign})}return{best,second,maxPrefix,bestReach,legal}};
 const original=search(target);
 const controls=[];for(let [k,base,phase,sign] of [[0,p56,73,1],[1,p57,191,-1],[2,p56.concat(p57),17,1]]){let p=Array.from({length:target.length},(_,i)=>base[(i+7*k)%base.length]);let c=encrypt(p,phase,sign,true);let reachTrue=reach(c,phase,sign);let consume=p.filter(x=>x!==0).length;assert(reachTrue.ends.includes((phase+consume)%key.length),"true F clock retained");let co=encrypt(p,phase,sign,false),best=null;for(let s of [1,-1])for(let j=0;j<key.length;j++){let d=ordinary(co,j,s),v=score(d,0,fit);if(!best||v>best.fit)best={phase:j,sign:s,fit:v,held:score(d,fit),correct:d.filter((x,i)=>x===p[i]).length}}controls.push({phase,sign,FHoldEndpointRetained:true,FHoldEndpoints:reachTrue.ends.length,ordinaryBest:best,nativeFit:score(p,0,fit),nativeHeld:score(p,fit)})}
 return{source:{first:columns.map(c=>c[0]),last:columns.map(c=>c.at(-1)),sizes:columns.map(c=>c.length),keyLength:key.length,trainingRunes:training.length},target:{length:target.length,fit,held:target.length-fit,FCount:target.filter(x=>x===0).length,rawFit:score(target,0,fit),rawHeld:score(target,fit)},p56Replay:n,bruteChecks,original,controls};
}
if(require.main===module){const root=path.resolve(__dirname,'..'); const read=p=>fs.readFileSync(path.join(root,p),'utf8');console.log(JSON.stringify(analyze(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/historical/cicada2013-os-original-prime-echo.sh'),read('resources/liber-primus/lp1-plaintext-reference.txt')),null,2));}
module.exports={analyze};
