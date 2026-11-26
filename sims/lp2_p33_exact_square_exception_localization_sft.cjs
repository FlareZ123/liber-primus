"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/cicada2014-openpuff-magic-squares.txt","resources/liber-primus/lp2-ink-annotations.json"];
const inputs=files.map(p=>{const b=fs.readFileSync(path.resolve(__dirname,"..",p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source),tr=inputs[1].source,mat=inputs[2].source,ink=JSON.parse(inputs[3].source);
 const check=(x,m)=>{if(!x)throw Error(m)};
 const pages=tr.replace(/\r/g,"").split("\n%\n"),groups=pages[33].replace(/[\s/]/g,"").split("&").map(s=>s.slice(s.indexOf(".")+1).split(/[-.]/).filter(Boolean));
 check(groups.length===2&&groups[0].length===21&&groups[1].length===28,"groups");
 const words=groups.flat();check(words[48]==="ᛒ"&&pages[34].replace(/[\s/]/g,"").startsWith("ᛗᛒ-"),"carry");words[48]+="ᛗᛒ";
 const W=words.map(w=>[...w].map(r=>gp.runes.indexOf(r))),V=mat.trim().split(/\n\s*\n/)[1].trim().split(/\s+/).map(Number),N=W.length,INF=100000;
 check(N===49&&V.length===49&&W.flat().length===198&&W.flat().every(x=>x>=0),"source");
 const dp=[[new Set([0])]];
 for(let n=1;n<=Math.max(...W.map(w=>w.length));n++){dp[n]=[];for(let f=0;f<=n;f++){const s=new Set();if(f<n)for(const v of dp[n-1][f])for(const p of gp.prime.slice(1))s.add(v+p);if(f>0)for(const v of dp[n-1][f-1])s.add(v+2);dp[n][f]=s}}
 function cost(W){return W.map(w=>V.map(v=>{const n=w.length,cap=w.filter(x=>x===0).length;let best=INF;for(let f=0;f<=n;f++)if(dp[n][f].has(v))best=Math.min(best,Math.max(0,f-cap));return best}))}
 function hungarian(A){const n=A.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
 for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
 do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=A[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);
 do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}
 const assignment=Array(n);for(let j=1;j<=n;j++)assignment[p[j]-1]=j-1;const total=assignment.reduce((s,j,i)=>s+A[i][j],0);
 check(total===-v[0]&&total===u.slice(1).reduce((a,b)=>a+b,0)+v.slice(1).reduce((a,b)=>a+b,0),"dual sum");return {total,assignment,u:u.slice(1),v:v.slice(1)}}
 function analyze(A,W){const h=hungarian(A);check(h.total<INF,"no assignment");const inv=Array(N);h.assignment.forEach((j,i)=>inv[j]=i);
 const eq=A.map((row,i)=>row.map((x,j)=>{check(x>=h.u[i]+h.v[j],"dual feasibility");return x<INF&&x===h.u[i]+h.v[j]}));
 check(h.assignment.every((j,i)=>eq[i][j]),"tight assignment");
 const R=eq.map((row,i)=>Array.from({length:N},(_,k)=>k===i||row[h.assignment[k]]));
 for(let k=0;k<N;k++)for(let i=0;i<N;i++)if(R[i][k])for(let j=0;j<N;j++)R[i][j] ||= R[k][j];
 const allowed=eq.map((row,i)=>row.map((e,j)=>e&&R[inv[j]][i]));
 const result=W.map((w,i)=>{const edges=allowed[i].flatMap((x,j)=>x?[{cell:j+1,value:V[j],e:A[i][j]}]:[]),es=[...new Set(edges.map(x=>x.e))].sort((a,b)=>a-b),nonF=w.flatMap((x,j)=>x?[j+1]:[]);check(es.length>0,"empty row");return {word:i+1,length:w.length,cipher:w,edges,es,min:es[0],max:es.at(-1),possiblePositions:es.at(-1)>0?nonF:[],forcedPositions:es[0]===nonF.length&&es[0]>0?nonF:[]}});
 for(let i=0;i<N;i++){for(const sign of [1,-1]){const B=A.map((row,k)=>row.map(x=>x>=INF?INF:x*100+(k===i?sign*x:0)));const b=hungarian(B);const e=A[i][b.assignment[i]];check(b.total===100*h.total+sign*e&&e===(sign===1?result[i].min:result[i].max),"secondary objective mismatch");}}
 return {total:h.total,assignment:h.assignment.map(x=>x+1),u:h.u,v:h.v,allowedEdges:allowed.flat().filter(Boolean).length,rows:result};
 }
 const A=cost(W),orig=analyze(A,W);check(orig.total===4,"exact historical cell optimum");
 const plant=W.map((w,i)=>{const v=V[orig.assignment[i]-1],cap=w.filter(x=>x===0).length,f=Array.from({length:w.length+1},(_,i)=>i).filter(f=>dp[w.length][f].has(v)).sort((a,b)=>Math.max(0,a-cap)-Math.max(0,b-cap)||a-b)[0];const positions=[...w.flatMap((x,j)=>x===0?[j]:[]),...w.flatMap((x,j)=>x!==0?[j]:[])].slice(0,f);return w.map((x,j)=>positions.includes(j)?0:x)});
 const positive=hungarian(cost(plant));check(positive.total===0,"literal repaired plant");
 const rows=orig.rows,possible=rows.filter(x=>x.max>0),forced=rows.filter(x=>x.min>0);let offset=0;const offsets=rows.map(x=>{const start=offset;offset+=x.length;return {word:x.word,start,possible:x.possiblePositions.map(j=>start+j-1),forced:x.forcedPositions.map(j=>start+j-1)}});
 const byBlock=[rows.slice(0,21),rows.slice(21)].map((a,i)=>({block:i+1,words:a.length,runes:a.reduce((s,x)=>s+x.length,0),nonF:a.reduce((s,x)=>s+x.cipher.filter(y=>y!==0).length,0),possibleWords:a.filter(x=>x.max>0).length,possiblePositions:a.reduce((s,x)=>s+x.possiblePositions.length,0),forcedWords:a.filter(x=>x.min>0).length,forcedPositions:a.reduce((s,x)=>s+x.forcedPositions.length,0)}));
 check(possible.every(x=>x.min===0&&x.max===1&&x.length%2===0&&!x.cipher.includes(0))&&possible.length===24,"exception type");
 // Rows of identical length/observed-F count have identical costs. Enumerate all
 // four-exception type compositions, counting labeled placements by symmetry.
 const types=[...new Set(possible.map(x=>x.length))].sort((a,b)=>a-b).map(n=>({n,words:possible.filter(x=>x.length===n).map(x=>x.word-1)}));
 for(const t of types)check(t.words.every(i=>A[i].join(",")===A[t.words[0]].join(",")),"row symmetry");
 const choose=(n,k)=>{let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n-i+1)/BigInt(i);return a};
 const compositions=[];function gen(i,left,ks){if(i===types.length){if(left)return;const S=new Set(types.flatMap((t,j)=>t.words.slice(0,ks[j])));const B=A.map((row,j)=>row.map(e=>e===(S.has(j)?1:0)?0:INF));const feasible=hungarian(B).total===0;const nGroups=types.reduce((v,t,j)=>v*choose(t.words.length,ks[j]),1n),nPositions=types.reduce((v,t,j)=>v*BigInt(t.n)**BigInt(ks[j]),nGroups);compositions.push({ks,feasible,nGroups:nGroups.toString(),nPositions:nPositions.toString()});return}for(let k=0;k<=Math.min(left,types[i].words.length);k++)gen(i+1,left-k,[...ks,k])}
 gen(0,4,[]);
 const groupSets=compositions.filter(x=>x.feasible).reduce((s,x)=>s+BigInt(x.nGroups),0n),positionSets=compositions.filter(x=>x.feasible).reduce((s,x)=>s+BigInt(x.nPositions),0n);
 check(compositions.reduce((s,x)=>s+BigInt(x.nGroups),0n)===choose(24,4),"complete subset coverage");
 // Only after freezing the mathematical possible positions, compare original marks.
 const P=new Set(offsets.flatMap(x=>x.possible)),tape=W.flat(),annot=ink.pages.find(x=>x.page===33);
 check(annot.red_spans.map(x=>[x.start,x.length]).join(";")==="0,10;91,8"&&annot.large_punctuation.map(x=>x[0]).join(",")==="10,91,99","ink");
 const p33Map=[];for(let i=0;i<214;i++)if(!annot.red_spans.some(x=>i>=x.start&&i<x.start+x.length))p33Map.push(i);
 const map=new Map(p33Map.map((p,j)=>[p,j]));
 const redAdjacent=annot.large_punctuation.flatMap(([p])=>[p-1,p].filter(x=>map.has(x)).map(x=>map.get(x)));
 let raw=0;const lineEndpoints=[];for(const line of pages[33].split("/")){const n=[...line].filter(x=>gp.runes.includes(x)).length;const indexes=Array.from({length:n},(_,j)=>raw+j).filter(x=>map.has(x)).map(x=>map.get(x));raw+=n;if(indexes.length)lineEndpoints.push(indexes[0],indexes.at(-1))}
 check(raw===214&&lineEndpoints.length===22,"physical lines");
 const markStats=(xs)=>{const x=[...new Set(xs)];return {positions:x,nonF:x.filter(j=>tape[j]!==0).length,possible:x.filter(j=>P.has(j)).length}};
 return {inputs:inputs.map(({path,sha})=>({path,sha})),original:orig,summary:{forcedWords:forced.map(x=>x.word),possibleWords:possible.map(x=>x.word),possiblePositions:rows.reduce((s,x)=>s+x.possiblePositions.length,0),forcedPositions:rows.reduce((s,x)=>s+x.forcedPositions.length,0),nonF:W.flat().filter(x=>x!==0).length,byBlock,offsets,types,compositions,groupSets:groupSets.toString(),positionSets:positionSets.toString(),redAdjacent:markStats(redAdjacent),lineEndpoints:markStats(lineEndpoints),blockEndpoints:markStats([0,80,81,197]),carry:markStats([195,196,197])},positive:{total:positive.total}};
}
console.log(JSON.stringify(experiment(inputs),null,2));
