const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = require('node:path').join(__dirname, '..');
const source = fs.readFileSync(root+'/resources/cicada2014-openpuff-magic-squares.txt','utf8');
const wisdom = fs.readFileSync(root+'/resources/external/2013-0-wisdom.txt','utf8');
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(b=>b.split(/\r?\n/).map(r=>r.trim().split(/\s+/).map(Number)));
const alphabet = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const words = wisdom.trim().split(/\r?\n/).slice(-5).map(s=>s.replace(/⁘/g,'').trim().split(/\s+/));
const values = words.map(r=>r.map(w=>/^\d+$/.test(w)?Number(w):[...w].reduce((s,c)=>{const k=alphabet.indexOf(c);assert(k>=0,c);return s+primes[k]},0)));
assert.deepEqual(values,squares[2]);
const sum = r=>r.reduce((a,b)=>a+b,0);
const distinct = r=>new Set(r).size;
function describe(m) {
  const n=m.length,k=(n-1)/2, cols=m.map((_,i)=>m.map(r=>r[i]));
  const symmetry=m.every((r,i)=>r.every((v,j)=>v===m[n-1-i][n-1-j]));
  const lines=[...m,...cols,m.map((r,i)=>r[i]),m.map((r,i)=>r[n-1-i])];
  const magic=lines.every(r=>sum(r)===sum(m[0]));
  return {n,sum:sum(m[0]),magic,symmetry,rows:m.map(distinct),columns:cols.map(distinct),centerRow:m[k],centerColumn:cols[k]};
}
const stats=squares.map(describe);
assert.deepEqual(stats.map(x=>[x.n,x.sum,x.magic,x.symmetry]),[[5,3301,true,true],[7,1033,true,true],[5,1033,true,true]]);
for (const s of stats) {
  assert.equal(distinct(s.centerRow),(s.n+1)/2);
  assert.equal(distinct(s.centerColumn),(s.n+1)/2);
}
const collisions=new Map();
words.flat().forEach((w,i)=>{
  if (/^\d+$/.test(w)) return;
  const v=values.flat()[i];
  if(!collisions.has(v)) collisions.set(v,new Set());
  collisions.get(v).add(w);
});
const distinctWordCollisions=[...collisions].filter(([,s])=>s.size>1).map(([v,s])=>[v,[...s]]);
assert.deepEqual(distinctWordCollisions.map(x=>x[0]).sort((a,b)=>a-b),[199,320,341]);
// Positive control: an odd-order genuine quasigroup requires asymmetry.
for (const n of [5,7]) {
  const m=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>(i+j)%n));
  const s=describe(m);
  assert(s.rows.every(x=>x===n) && s.columns.every(x=>x===n));
  assert.equal(s.symmetry,false);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) {
    const c=m[i][j]; assert.equal((c-i+n)%n,j); assert.equal((c-j+n)%n,i);
  }
}
console.log(JSON.stringify({stats,wisdomMatches:25,distinctWordCollisions,controlOrders:[5,7]},null,2));
