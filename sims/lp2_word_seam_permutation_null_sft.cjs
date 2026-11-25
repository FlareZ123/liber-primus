'use strict';
// Director #2679: run from repo root with Node.
const fs=require('node:fs');
function experiment(A,T,B){
 const assert=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),dim=29*29;
 let words=[],cur=[],rawPage=0;
 const finish=()=>{if(cur.length){words.push({v:cur.map(x=>x.i),page:cur[0].page,endPage:cur[cur.length-1].page});cur=[]}};
 for(const line of T.split(/\r?\n/)){if(line==="%"){rawPage++;continue}if(line==="$")continue;if(line==="&"){finish();continue}for(const ch of line){const i=A.runes.indexOf(ch);if(i>=0)cur.push({i,page:rawPage<50?rawPage:rawPage+1});else if(ch==="-"||ch===".")finish()}}
 finish();words=words.slice(0,2896);assert(words.length===2896&&same(words.flatMap(w=>w.v),A.pages.slice(0,56).flatMap(p=>p.indices)),"original tape");assert(words.filter(w=>w.page!==w.endPage).length===32,"carries");
 const bounds=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const chapters=bounds.map(([lo,hi])=>words.filter(w=>w.page>=lo&&w.page<=hi));assert(chapters.flat().length===2896,"partition");
 const start=w=>w.v[0],end=w=>w.v[w.v.length-1];
 const add=(M,a,b,n=1)=>{M[a*29+b]+=n};
 function matrix(C){const M=new Float64Array(dim);for(const ch of C)for(let i=1;i<ch.length;i++)add(M,end(ch[i-1]),start(ch[i]));return M}
 function cross(C,M){for(let i=1;i<C.length;i++)add(M,end(C[i-1][C[i-1].length-1]),start(C[i][0]));return M}
 function expectation(C){const E=new Float64Array(dim);for(const ch of C){const mid=ch.slice(1,-1),m=mid.length;if(!m){if(ch.length===2)add(E,end(ch[0]),start(ch[1]));continue}const a=new Float64Array(29),b=new Float64Array(29),s=new Float64Array(dim);for(const w of mid){a[end(w)]++;b[start(w)]++;add(s,end(w),start(w))}for(let i=0;i<29;i++)for(let j=0;j<29;j++)add(E,i,j,(a[i]*b[j]-s[i*29+j])/m);for(let i=0;i<29;i++){add(E,end(ch[0]),i,b[i]/m);add(E,i,start(ch[ch.length-1]),a[i]/m)}}return E}
 const diag=M=>Array.from({length:29},(_,i)=>M[i*30]).reduce((a,b)=>a+b,0);
 const sum=M=>M.reduce((a,b)=>a+b,0);
 const chi=(M,E,off=false)=>M.reduce((s,v,i)=>s+((!off||Math.floor(i/29)!==i%29)&&E[i]>0?(v-E[i])**2/E[i]:0),0);
 let seed=0x33012679;function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}
 function shuffle(arr){for(let i=arr.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
 function permute(C,f=1){return C.map(ch=>{let out=ch.slice(),ids=shuffle(Array.from({length:ch.length-2},(_,i)=>i+1)).slice(0,Math.round((ch.length-2)*f)),w=shuffle(ids.map(i=>ch[i]));for(let i=0;i<ids.length;i++)out[ids[i]]=w[i];return out})}
 function stats(C){const M=matrix(C),E=expectation(C),crossCount=diag(cross(C,new Float64Array(dim)));assert(Math.abs(sum(E)-sum(M))<1e-7,"expected seam total");const observed={diag:diag(M),expected:diag(E),fullChi:chi(M,E),offChi:chi(M,E,true),crossCount,total:sum(M)};let d=0,c=0,o=0;const N=2000,nullDiag=[];for(let i=0;i<N;i++){const Q=matrix(permute(C));const v=diag(Q);nullDiag.push(v);d+=v<=observed.diag;c+=chi(Q,E)>=observed.fullChi;o+=chi(Q,E,true)>=observed.offChi}nullDiag.sort((a,b)=>a-b);return {...observed,allDiag:observed.diag+crossCount,expectedAllDiag:observed.expected+crossCount,nullDiagQuantiles:[nullDiag[50],nullDiag[1000],nullDiag[1950]],pLowerDiag:(d+1)/(N+1),pUpperFull:(c+1)/(N+1),pUpperOff:(o+1)/(N+1)}}
 function partial(C){return [.1,.25,.5,1].map(f=>{let v=[];for(let k=0;k<400;k++)v.push(diag(cross(C,matrix(permute(C,f)))));v.sort((a,b)=>a-b);return {f,mean:v.reduce((s,x)=>s+x,0)/v.length,low:v[10],median:v[200],high:v[390]}})}
 const O=stats(chapters);assert(O.allDiag===23&&O.total+chapters.length-1===2895,"original repeat seams");
 const train=chapters.slice(0,4),test=chapters.slice(4),Mt=matrix(train),Et=expectation(train),Mh=matrix(test),Eh=expectation(test);
 const weights=Array.from(Mt,(v,i)=>Math.floor(i/29)===i%29?0:(v-Et[i])/(Et[i]+2));
 const score=M=>M.reduce((s,v,i)=>s+weights[i]*(v-Eh[i]),0);
 const actualScore=score(Mh);let exceed=0;for(let i=0;i<2000;i++)exceed+=score(matrix(permute(test)))>=actualScore;
 // Strictly preserve every slot length, all cross-page-carry positions, and chapter endpoints.
 // Swapping only distinct interior words with same (first,last,length) leaves every seam unchanged.
 function preserving(C){let log10=0,groups=0,moved=0;const out=C.map(ch=>{let q=ch.slice(),map=new Map();for(let i=1;i<ch.length-1;i++){let w=ch[i];if(w.page!==w.endPage)continue;let k=[start(w),end(w),w.v.length].join(",");if(!map.has(k))map.set(k,[]);map.get(k).push(i)}for(const ids of map.values()){let counts=new Map();for(let i of ids){let k=ch[i].v.join(",");counts.set(k,(counts.get(k)||0)+1)}if(counts.size<2)continue;groups++;const factlog=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log10(i);return s};log10+=factlog(ids.length)-[...counts.values()].reduce((s,n)=>s+factlog(n),0);let order=ids.map(i=>ch[i]).sort((a,b)=>a.v.join(",").localeCompare(b.v.join(",")));for(let k=0;k<ids.length;k++){const i=ids[k],w=order[(k+1)%order.length];q[i]=w;moved+=!same(w.v,ch[i].v)}}return q});assert(same(cross(C,matrix(C)),cross(out,matrix(out))),"exact seam preservation");assert(C.every((ch,j)=>ch.every((w,i)=>w.v.length===out[j][i].v.length)),"length slots");return {log10,groups,moved}}
 const native=B.sections.map(s=>{let arr=[],w=[];const finish=()=>{if(w.length){arr.push({v:w});w=[]}};for(const ch of s.source_text){const i=A.runes.indexOf(ch);if(i>=0)w.push(i);else finish()}finish();return arr});
 const nativeStats=native.map((ch,i)=>{let M=matrix([ch]);return {name:B.sections[i].name,words:ch.length,diag:diag(M),expected:diag(expectation([ch]))}});
 // Construct strict anti-repeat continuous value-changing positive with genuine native word stream.
 const pool=native.filter((_,i)=>[1,3,7].includes(i)).flat();let at=0,prev=-1;const plant=chapters.map(ch=>ch.map(()=>{const w=pool[at++%pool.length],v=w.v.map(p=>{let c;do{c=(p+Math.floor(random()*29))%29}while(c===prev);prev=c;return c});return {v}}));
 const plantStats=stats(plant);assert(plantStats.allDiag===0,"strict plant");
 return {chapterWords:chapters.map(ch=>ch.length),original:O,partialOriginal:partial(chapters),train:{diag:diag(Mt),expected:diag(Et)},holdout:{diag:diag(Mh),expected:diag(Eh),offDiagonalScore:actualScore,pUpper:(exceed+1)/2001},preserving:preserving(chapters),nativeStats,plantStats,partialPlant:partial(plant)};
}
const read=p=>fs.readFileSync(p,'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
