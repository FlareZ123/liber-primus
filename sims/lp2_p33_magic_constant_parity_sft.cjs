'use strict';

/** Exact p33 49-word magic-constant parity inverse gate. Run from repository checkout with Node.js 22. */
const fs=require('node:fs');
const path=require('node:path');
function solve(corpus,transcription,wisdom,matrices){
 const check=(p,m)=>{if(!p)throw Error(m)};
 const pages=transcription.replace(/\r/g,"").split("\n%\n");
 const groups=pages[33].replace(/[\s/]/g,"").split("&").map(s=>s.slice(s.indexOf(".")+1).split(/[-.]/).filter(Boolean));
 check(groups.length===2&&groups[0].length===21&&groups[1].length===28,"physical source groups");
 const words=groups.flat();
 check(words[48]==="ᛒ"&&pages[34].replace(/[\s/]/g,"").startsWith("ᛗᛒ-"),"original carry");
 words[48]+="ᛗᛒ";
 const index=new Map(corpus.runes.map((r,i)=>[r,i]));
 const W=words.map(w=>[...w].map(r=>{check(index.has(r),"rune");return index.get(r)}));
 check(W.flat().length===198&&corpus.prime.filter(p=>p%2===0).length===1&&corpus.prime[0]===2,"source count / even prime");
 const lines=n=>[...Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i*n+j)),...Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>j*n+i)),Array.from({length:n},(_,i)=>i*(n+1)),Array.from({length:n},(_,i)=>(i+1)*(n-1))];
 const L=lines(7), cols=W.map((_,i)=>L.reduce((m,line,j)=>m|(line.includes(i)?1<<j:0),0));
 const lens=L.map(line=>line.reduce((s,i)=>s+W[i].length,0));
 const target=lens.reduce((m,n,i)=>m|(((n-1033)&1)<<i),0);
 const pop=n=>{let k=0;for(;n;n&=n-1)k++;return k};
 const mask14=(1<<14)-1;
 const byLabel=Array.from({length:29},(_,r)=>W.flatMap((w,i)=>w.flatMap(x=>x===r?[cols[i]]:[])));
 const span=vs=>{const states=new Set([0]);for(const v of vs)for(const s of [...states])states.add(s^v);return states};
 const labels=byLabel.map((vs,r)=>{
   const s=span(vs), all=vs.reduce((m,v)=>m^v,0);
   let min=16,minRC=14;
   for(const a of s){min=Math.min(min,pop(a^target));minRC=Math.min(minRC,pop((a^target)&mask14))}
   return {r,rune:corpus.translit[r],occ:vs.length,states:s.size,staticMiss:pop(all^target),staticRC:pop((all^target)&mask14),holdMiss:min,holdRC:minRC};
 });
 const pairWitnesses=[];
 for(let a=0;a<29;a++)for(let b=a+1;b<29;b++){
   const basis=Array(16).fill(0);
   for(let v of [...byLabel[a],...byLabel[b]])for(let k=15;k>=0;k--)if(v&(1<<k)){if(basis[k])v^=basis[k];else{basis[k]=v;break}}
   let t=target;for(let k=15;k>=0;k--)if(t&(1<<k))t^=basis[k];
   if(t===0)pairWitnesses.push([a,b]);
 }
 // Binary syndrome shortest path: a word with observed F supplies a free
 // odd F parity, otherwise one nonliteral F occurrence is necessary.
 const N=1<<16;
 let dist=new Int16Array(N).fill(127);dist[0]=0;
 const history=[];
 for(let i=0;i<W.length;i++){
   const v=cols[i],cost=W[i].includes(0)?0:1,next=dist.slice(),take=new Uint8Array(N);
   for(let s=0;s<N;s++)if(dist[s]!==127&&dist[s]+cost<next[s^v]){next[s^v]=dist[s]+cost;take[s^v]=1}
   history.push(take);dist=next;
 }
 const chosen=[];let s=target;
 for(let i=48;i>=0;i--)if(history[i][s]){chosen.push(i);s^=cols[i]}
 check(s===0&&chosen.reduce((m,i)=>m^cols[i],0)===target,"DP witness");
 const minNonliteral=dist[target],nonliteral=chosen.filter(i=>!W[i].includes(0)).sort((a,b)=>a-b);
 check(nonliteral.length===minNonliteral,"DP optimum replay");
 const noF=L.flatMap((line,i)=>((target>>i)&1)&&line.every(j=>!W[j].includes(0))?[i]:[]);
 // Authentic positive: reconstruct exact 2014 third square from original
 // LP1 Wisdom source, including its literal numeral cells.
 const sourceMatrices=matrices.trim().split(/\n\s*\n/).map(s=>s.trim().split(/\s+/).map(Number));
 const rows=wisdom.replace(/\r/g,"").split("\n").filter(s=>/^\s*(?:\d+|ᚫᚦ|ᛋᚻ)/u.test(s)&&s.includes("  ")).map(s=>s.replace(/⁘/g,"").trim().split(/\s+/));
 check(rows.length===5&&rows.every(r=>r.length===5),"LP1 wisdom square parse");
 const vals=rows.flat().map(t=>/^\d+$/.test(t)?+t:[...t].reduce((s,r)=>{check(index.has(r),"LP1 rune");return s+corpus.prime[index.get(r)]},0));
 check(vals.every((v,i)=>v===sourceMatrices[2][i]),"LP1 25 exact values");
 const ctrl=lines(5).map(l=>l.reduce((s,i)=>s+vals[i],0));
 check(ctrl.every(x=>x===1033),"LP1 12 sums");
 // Feasible 7x7 arbitrary-string witness found by integer programming,
 // then verified exactly. NOT language; 2 nonliteral F events are enough.
 const witness=[[1,18],[2,3,3,3,3,3,3,3,3],[5,5,5,5,5,6],[2,4,18],[18,18,18],[18,18,18,18,18],[18,18,18],[3,4],[0,1,6,18,18,18,18],[1,9,9],[14,18,18],[2,18,18,18,18,18],[3,7,7,7,7],[3,3,3,3,3,3,3,4],[18,18],[17,28,28],[18,18],[18,18],[17,18],[2,12,28],[0,18],[18,18,18,18,22,22],[2,2,2,2,2,2,2],[3,4,7,13],[1,18,18],[0,18,18,18],[18,18],[2,2],[3,5,28],[2,3],[2,2,2,18],[18,18],[18],[1,1,1,1,1,1,2,14,18],[1,18,18,18,18,18,18,18],[3,6,8,18],[18,18,18,18],[2,2,2,13,18,18,18,18,18],[1,2,2,2,2],[3,3,3,3,15],[18,18],[2,2,2,2],[18,18],[2,2,4,18],[18,18,18],[1,1,18,18,18,18,18],[1,1,3],[1,2,2,2,11],[18,18,18]];
 check(witness.every((w,i)=>w.length===W[i].length),"matched lengths");
 const sums=witness.map(w=>w.reduce((s,p)=>s+corpus.prime[p],0));
 const actual=L.map(l=>l.reduce((s,i)=>s+sums[i],0));
 check(actual.every(v=>v===1033),"exact 7x7 witness");
 const fCells=witness.flatMap((w,i)=>w.includes(0)?[i]:[]);
 check(fCells.filter(i=>!W[i].includes(0)).length===minNonliteral,"sharp exact exception count");
 // Move each witness F to an existing original ciphertext F where available.
 // The other two have to be nonliteral. Odd-prime symbols can occupy all
 // remaining positions under unrestricted per-position encryption.
 for(const i of fCells)if(W[i].includes(0)){const j=W[i].indexOf(0),k=witness[i].indexOf(0);[witness[i][j],witness[i][k]]=[witness[i][k],witness[i][j]]}
 const exceptions=witness.flatMap((w,i)=>w.flatMap((p,j)=>p===0&&W[i][j]!==0?[[i+1,j+1,W[i][j]]]:[]));
 check(exceptions.length===minNonliteral,"exact nonliteral F placement");
 // Fully literal-F positive on same exact magic-sum plant: arbitrary other
 // cipher emissions, but never hide F. No claim of a historical cipher.
 const plantCipher=witness.map((w,i)=>w.map((p,j)=>p===0?0:(i*7+j*3+11)%29));
 const plantAllowed=plantCipher.flatMap((w,i)=>w.flatMap(r=>r===0?[cols[i]]:[]));
 check(span(plantAllowed).has(target),"exact 1033 transparent F positive");
 check(labels.every(r=>r.staticMiss>0&&r.holdMiss>0)&&labels[0].holdRC===4&&noF.join(",")==="2,3,11"&&minNonliteral===2,"original decisions");
 return {lengths:lens,target,requiredParity:L.map((_,i)=>(target>>i)&1),labels,pairWitnesses,minNonliteral,nonliteralCellsOneBased:nonliteral.map(i=>i+1),witnessOddFCellsOneBased:chosen.sort((a,b)=>a-b).map(i=>i+1),literalFZeroSupportLinesOneBased:noF.map(i=>i+1),positive:{lp1Values:vals,lp1LineSums:ctrl,exact1033WordWitness:witness,witnessCellSums:sums,witnessLineSums:actual,exceptions,plantParity:true}};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const result=solve(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/external/2013-0-wisdom.txt'),read('resources/cicada2014-openpuff-magic-squares.txt'));
function solvePermutation(corpus,transcription,matrices){
 const check=(p,m)=>{if(!p)throw Error(m)};
 const pages=transcription.replace(/\r/g,"").split("\n%\n");
 const groups=pages[33].replace(/[\s/]/g,"").split("&").map(s=>s.slice(s.indexOf(".")+1).split(/[-.]/).filter(Boolean));
 check(groups.length===2&&groups[0].length===21&&groups[1].length===28,"source groups");
 const words=groups.flat();check(words[48]==="ᛒ"&&pages[34].replace(/[\s/]/g,"").startsWith("ᛗᛒ-"),"source carry");words[48]+="ᛗᛒ";
 const W=words.map(w=>[...w].map(r=>corpus.runes.indexOf(r)));
 const target=matrices.trim().split(/\n\s*\n/)[1].trim().split(/\s+/).map(Number);
 check(W.flat().length===198&&target.length===49&&W.flat().every(x=>x>=0),"source lengths");
 const maxLen=Math.max(...W.map(w=>w.length));
 // dp[n][f] contains exactly the sums of n GP primes with exactly f Fs.
 const dp=[[new Set([0])]];
 for(let n=1;n<=maxLen;n++){
   dp[n]=[];
   for(let f=0;f<=n;f++){
     const s=new Set();
     if(f<n)for(const v of dp[n-1][f])for(const p of corpus.prime.slice(1))s.add(v+p);
     if(f>0)for(const v of dp[n-1][f-1])s.add(v+2);
     dp[n][f]=s;
   }
 }
 const feasible=(n,f,v)=>dp[n][f].has(v);
 const counts=(word,r)=>word.filter(x=>x===r).length;
 const allowed=(source,r,exact)=>source.map(w=>target.map(v=>exact?feasible(w.length,counts(w,r),v):Array.from({length:counts(w,r)+1},(_,f)=>f).some(f=>feasible(w.length,f,v))));
 /** Maximum bipartite matching, with a Hall-deficient set as certificate. */
 function match(A){
   const R=Array(49).fill(-1);
   function aug(i,seen){for(let j=0;j<49;j++)if(A[i][j]&&!seen[j]){seen[j]=true;if(R[j]<0||aug(R[j],seen)){R[j]=i;return true}}return false}
   let size=0;for(let i=0;i<49;i++)if(aug(i,Array(49).fill(false)))size++;
   const leftMatch=Array(49).fill(-1);R.forEach((i,j)=>{if(i>=0)leftMatch[i]=j});
   const left=new Set(leftMatch.flatMap((j,i)=>j<0?[i]:[])),right=new Set(),queue=[...left];
   for(let k=0;k<queue.length;k++){const i=queue[k];for(let j=0;j<49;j++)if(A[i][j]&&!right.has(j)){right.add(j);if(R[j]>=0&&!left.has(R[j])){left.add(R[j]);queue.push(R[j])}}}
   check(left.size-right.size===49-size,"Hall deficiency equals matching gap");
   return {size,leftMatch,hallWords:[...left].sort((a,b)=>a-b).map(i=>i+1),hallCells:[...right].sort((a,b)=>a-b).map(j=>j+1)};
 }
 const byLabel=Array.from({length:29},(_,r)=>({r,label:corpus.translit[r],selective:match(allowed(W,r,false)).size,stationary:match(allowed(W,r,true)).size}));
 const literal=match(allowed(W,0,false));
 // The lower bound 4 is certified by maximum zero-exception matching of 45.
 // One independently optimized perfect matching demonstrates it is tight.
 const assignment=[49,2,35,5,6,7,9,10,8,11,12,13,17,15,18,20,19,22,28,21,31,16,23,24,27,26,32,37,29,40,34,46,1,25,30,47,3,33,38,39,36,41,14,4,44,42,45,48,43].map(x=>x-1);
 check(new Set(assignment).size===49,"permutation witness");
 const witness=[],exceptions=[];
 for(let i=0;i<49;i++){
   const w=W[i],v=target[assignment[i]],n=w.length,cap=counts(w,0);
   const fs=Array.from({length:n+1},(_,f)=>f).filter(f=>feasible(n,f,v)).sort((a,b)=>Math.max(0,a-cap)-Math.max(0,b-cap)||a-b);
   check(fs.length>0,"witness sum feasible");
   let left=n,f=fs[0],sum=v;
   const odd=[];
   while(left>f){
     const p=corpus.prime.slice(1).find(p=>feasible(left-1,f,sum-p));
     check(p!==undefined,"odd-prime decomposition");
     odd.push(corpus.prime.indexOf(p));sum-=p;left--;
   }
   check(sum===2*f,"even-prime remainder");
   const positions=[...w.flatMap((r,j)=>r===0?[j]:[]),...w.flatMap((r,j)=>r!==0?[j]:[])].slice(0,f);
   const plain=w.map((r,j)=>positions.includes(j)?0:odd.shift());
   check(plain.length===n&&plain.reduce((s,r)=>s+corpus.prime[r],0)===v,"exact witness sum");
   for(const j of positions)if(w[j]!==0)exceptions.push([i+1,j+1,w[j]]);
   witness.push(plain);
 }
 check(exceptions.length===49-literal.size,"sharp optimal exception count");
 const synthetic=W.map((w,i)=>w.map((r,j)=>witness[i][j]===0?0:r));
 check(match(allowed(synthetic,0,false)).size===49,"true transparent-F exact-square positive");
 check(literal.size===45&&byLabel.filter(x=>x.selective===49).map(x=>x.r).join(",")==="11"&&byLabel.every(x=>x.stationary<49),"source decision");
 return {literal,byLabel,minimumNonliteral:exceptions.length,assignmentOneBased:assignment.map(i=>i+1),witness,exceptions,positiveMatching:49};
}
const permutation=solvePermutation(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/cicada2014-openpuff-magic-squares.txt'));
console.log(JSON.stringify({...result,permutation},null,2));
