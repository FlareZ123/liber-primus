'use strict';
// Agent7: exact solved WARNING control, ten active substitutions with 19 oracle assignments.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const A = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const source = fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt','utf8').trim().split('%')[0];
const ix = new Map(A.runes.map((x,i)=>[x,i]));
const all = source.replace(/[\/\s]/g,'').split(/[.&$]+/).map(t=>[...t].filter(x=>ix.has(x)).map(x=>ix.get(x))).filter(x=>x.length);
const u = all.slice(1);
const c = u.map(x=>Array.from({length:29},(_,i)=>x.filter(j=>j===i).length));
const w = A.prime;
const gold = Array.from({length:29},(_,i)=>28-i);
const truth = c.map(row=>row.reduce((s,n,i)=>s+n*w[gold[i]],0));
assert.deepEqual(truth,[757,1009,691,353,769,911,1051,859,677]);
// Select ten rarest observed cipher indices in first four body clauses,
// tie by index, excluding the cipher image of plaintext F.
const chosen = Array.from({length:29},(_,i)=>[i,c.slice(0,4).reduce((s,row)=>s+row[i],0)])
 .filter(([i,n])=>n>0&&i!==28).sort((a,b)=>a[1]-b[1]||a[0]-b[0]).slice(0,10).map(x=>x[0]);
assert.deepEqual(chosen,[4,7,9,14,15,20,22,2,5,8]);
const weights = chosen.map(i=>w[gold[i]]);
const max = Math.max(...w)*Math.max(...u.map(x=>x.length));
const prime = new Uint8Array(max+1).fill(1);
prime[0]=prime[1]=0;
for(let i=2;i*i<=max;i++)if(prime[i])for(let j=i*i;j<=max;j+=i)prime[j]=0;
const sums = truth.map((s,j)=>s-chosen.reduce((v,i,k)=>v+c[j][i]*weights[k],0));
const counts = Array(10).fill(0), exact = Array(10).fill(0);
const perm = new Int32Array(10), deltas = chosen.map(i=>c.map(row=>row[i]));
const survivors=[], exactMaps=[];
function mapNow(){
 const map=gold.slice();
 for(let a=0;a<10;a++)map[chosen[a]]=gold[chosen[perm[a]]];
 assert.equal(new Set(map).size,29);
 const inverse=Array(29);map.forEach((p,i)=>inverse[p]=i);
 const cipher=all.flat(), decoded=cipher.map(i=>map[i]);
 assert.deepEqual(decoded.map(p=>inverse[p]),cipher);
 return {map,sums:sums.slice(),
  trainErrors:u.slice(0,4).flat().filter(i=>map[i]!==gold[i]).length,
  heldErrors:u.slice(4).flat().filter(i=>map[i]!==gold[i]).length,
  rubricErrors:all[0].filter(i=>map[i]!==gold[i]).length};
}
function visit(k,used){
 if(k===10){
  counts[0]++;
  let j=0;while(j<9&&prime[sums[j]])counts[++j]++;
  if(j===9)survivors.push(mapNow());
  exact[0]++;
  let e=0;while(e<9&&sums[e]===truth[e])exact[++e]++;
  if(e===9)exactMaps.push(mapNow());
  return;
 }
 const d=deltas[k];
 for(let a=0;a<10;a++)if(!(used&(1<<a))){
  perm[k]=a;const v=weights[a];
  for(let j=0;j<9;j++)sums[j]+=d[j]*v;
  visit(k+1,used|(1<<a));
  for(let j=0;j<9;j++)sums[j]-=d[j]*v;
 }
}
visit(0,0);
assert.deepEqual(counts,[3628800,1451520,550080,107040,46320,15712,3328,790,148,20]);
assert.deepEqual(exact,[3628800,120960,5760,960,48,8,4,2,2,2]);
assert.equal(Math.max(...survivors.map(x=>x.heldErrors)),21);
const bad=exactMaps.find(x=>x.trainErrors+x.heldErrors>0);
assert.equal(bad.trainErrors+bad.heldErrors,4);
assert.deepEqual(chosen.filter(i=>bad.map[i]!==gold[i]).sort((a,b)=>a-b),[14,15]);
assert.deepEqual(c.map(row=>row[14]),c.map(row=>row[15]));
console.log(JSON.stringify({chosen,truth,counts,exact,trainLength:u.slice(0,4).flat().length,
 heldLength:u.slice(4).flat().length,exactMaps,survivors},null,2));
