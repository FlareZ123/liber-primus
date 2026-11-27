'use strict';
const fs=require('node:fs');const path=require('node:path');
function run(corpus){
 const maxOrigin=3301, markers=[0,11,12,21,22,25,27,28], mod=x=>(x%29+29)%29, chapterStarts=[0,3,8,15,23,27,33,40,54,56];
 const all=corpus.pages.filter(x=>x.page<56).flatMap(x=>x.indices), chapters=chapterStarts.slice(0,-1).map((lo,i)=>({lo,hi:chapterStarts[i+1]-1,c:corpus.pages.filter(x=>x.page>=lo&&x.page<chapterStarts[i+1]).flatMap(x=>x.indices)}));
 const limit=maxOrigin+all.length+1200, k=[];
 for(let p=2;k.length<limit;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)k.push((p-1)%29)}
 const full=(1n<<BigInt(limit))-1n, originMask=(1n<<BigInt(maxOrigin+1))-1n;
 const forbid=Array(29).fill(0n);k.forEach((x,i)=>forbid[x]|=1n<<BigInt(i));
 function backward(c,f){let b=full;for(let i=c.length-1;i>=0;i--){const next=(b>>1n)&(full^forbid[mod(c[i]-f)]);b=next|(c[i]===0?b:0n);if(!b)break;}return b&originMask}
 function forward(c,f,o){let states=new Set([o]);for(let i=0;i<c.length;i++){const out=new Set();for(const j of states){if(c[i]===0)out.add(j);if(k[j]!==mod(c[i]-f))out.add(j+1);}states=out;if(!states.size)return false;}return !!states.size}
 function list(b){let out=[];for(let i=0;i<=maxOrigin;i++)if((b>>BigInt(i))&1n)out.push(i);return out;}
 let nchecks=0;for(let n of [4,17,56])for(let f of markers)for(let o of [0,17,1033,3301]){const c=all.slice(1033,1033+n),b=backward(c,f);if(Boolean((b>>BigInt(o))&1n)!==forward(c,f,o))throw Error("backward/forward");nchecks++}
 const p56=corpus.pages.find(x=>x.page===56).indices; if(!(backward(p56,0)&1n))throw Error("p56 control");
 let rng=0x47af1b;const rand=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n;};
 const native=corpus.pages.find(x=>x.page===57).indices;const plants=[];
 for(let t=0;t<16;t++){let f=markers[t%markers.length],o=t===0?0:t===15?maxOrigin:rand(maxOrigin+1);const s=Array.from({length:29},(_,i)=>i);[s[0],s[f]]=[s[f],s[0]];let j=o;const c=Array.from({length:95+t*29},(_,i)=>native[(i+t*13)%native.length]).map(p=>p===0?0:mod(s[p]+k[j++]));let b=backward(c,f);if(!((b>>BigInt(o))&1n))throw Error("plant lost");plants.push({f,o,n:c.length,originCount:list(b).length});}
 const chapterMasks=markers.map(f=>chapters.map(x=>backward(x.c,f)));
 const originCounts=chapters.map((ch,i)=>({lo:ch.lo,hi:ch.hi,n:ch.c.length,visibleF:ch.c.filter(x=>x===0).length,byMarker:markers.map((f,j)=>({f,origins:list(chapterMasks[j][i])}))}));
 const unionMarker=markers.map((f,j)=>({f,sharedOrigin:list(chapterMasks[j].reduce((x,y)=>x&y,originMask)),independentChapterPossible:chapterMasks[j].every(x=>x!==0n),fullContinuous:list(backward(all,f))}));
 const primeEchoMax=(()=>{let cnt=0;for(let p=2;p<=3301;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)cnt++;}return cnt-1;})();
 return {corpusRunes:all.length,range:[0,maxOrigin],primeEchoMax,markers,nchecks,p56Origin0:true,plants,originCounts,unionMarker};
}
if(require.main===module){const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));console.log(JSON.stringify(run(corpus),null,2));}
module.exports={run};
