'use strict';

/**
 * Source-exact three-lane 252-slot H/G quotient -> 84 solved p56 shifts.
 * Also checks three original printed triples as direct keys on p55.
 * Node.js 22 CommonJS, no dependencies or writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../resources/liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(root,'base60-grid.json'),'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));

/** @param {number} x @returns {number} */
const m = x => (x%29+29)%29;
/** @param {number} x @returns {number} */
function inverse(x){for(let i=1;i<29;i++)if(m(x*i)===1)return i;throw Error('Singular pivot');}
/** @param {number[][]} matrix @returns {number} */
function rank(matrix){
  const a=matrix.map(row=>row.map(m));let r=0;
  for(let c=0;c<a[0].length&&r<a.length;c++){
    let p=r;while(p<a.length&&a[p][c]===0)p++;
    if(p===a.length)continue;
    [a[r],a[p]]=[a[p],a[r]];
    const iv=inverse(a[r][c]);
    for(let j=c;j<a[0].length;j++)a[r][j]=m(a[r][j]*iv);
    for(let i=0;i<a.length;i++)if(i!==r&&a[i][c]!==0){
      const v=a[i][c];
      for(let j=c;j<a[0].length;j++)a[i][j]=m(a[i][j]-v*a[r][j]);
    }
    r++;
  }
  return r;
}
/** @param {number} n @returns {number[]} */
function primes(n){
  const out=[];
  for(let x=2;out.length<n;x++){
    let ok=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}
    if(ok)out.push(x);
  }
  return out;
}
/** @param {string} text @returns {number[]} */
function gp(text){
  const abc=corpus.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for(const sourceWord of text.trim().split(/\s+/)){
    const txt=sourceWord.replace(/[^A-Z]/g,'');
    for(let i=0;i<txt.length;){
      const a=abc.find(x=>txt.startsWith(x.token,i));
      assert.ok(a);out.push(a.index);i+=a.token.length;
    }
  }
  return out;
}
/** @param {number[]} x @returns {number} */
function ioc(x){const f=Array(29).fill(0);for(let v of x)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));}
/** @param {number[]} q @param {'contiguous'|'interleaved'} shape @returns {number[][]} */
function lanes(q,shape){
  if(shape==='contiguous')return[q.slice(0,84),q.slice(84,168),q.slice(168,252)];
  return[0,1,2].map(k=>Array.from({length:84},(_,i)=>q[3*i+k]));
}

const raw=grid.byte_rows.flat();
assert.equal(raw.length,256);
assert.ok(grid.rows.length===32&&grid.rows.every(r=>r.length===8));
assert.equal(crypto.createHash('sha256').update(Buffer.from(raw)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const div=[1,28,13,9,14],b=raw.map(m),q=[];
for(let i=0;i<252;i++){
  q.push(b[i]);
  for(let k=0;k<5;k++)b[i+k]=m(b[i+k]-q[i]*div[k]);
}
assert.deepEqual(b.slice(-4),[0,0,0,0]);
assert.equal(q.length,252);assert.equal(q[0],0);

const c56=corpus.pages.find(p=>p.page===56).indices;
const p56=gp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(c56.length,85);assert.equal(p56.length,85);
assert.equal(c56[56],0);assert.equal(p56[56],0);
const pi=primes(84),key=[];
for(let i=0;i<85;i++)if(i!==56){
  const next=m(pi[key.length]-1);
  assert.equal(m(c56[i]-p56[i]),next);
  key.push(next);
}
assert.equal(key.length,84);
const triples=[
  {name:'p3-red',v:[13,23,2]},
  {name:'p39-red',v:[27,5,15]},
  {name:'2013-3QO',v:[3,26,24]}
];
assert.deepEqual(corpus.pages.find(p=>p.page===3).indices.slice(119,122),triples[0].v);
assert.deepEqual(corpus.pages.find(p=>p.page===39).indices.slice(119,122),triples[1].v);
const c55=corpus.pages.find(p=>p.page===55).indices;
const p57=corpus.pages.find(p=>p.page===57).indices.slice(0,76);
assert.equal(c55.length,76);assert.equal(p57.length,76);
/**
 * Every deterministic secret mapping from a selected set of quotient lanes:
 * identical input tuple must imply identical output rune. This test is
 * stronger than the affine-rank exclusion when a conflicting tuple repeats.
 * @param {number[][]} sourceLanes
 * @param {number[]} knownKey
 * @param {number[]} selected
 * @returns {{uniqueInputs:number,conflictingWitnesses:Array<{first:number,second:number,input:number[],wanted:number[]}>}}
 */
function lookupObstruction(sourceLanes,knownKey,selected) {
  const seen = new Map();
  const conflictingWitnesses = [];
  for(let i=0;i<knownKey.length;i++){
    const input=selected.map(k=>sourceLanes[k][i]);
    const label=input.join(',');
    if(seen.has(label)){
      const j=seen.get(label);
      if(knownKey[i]!==knownKey[j]) {
        conflictingWitnesses.push({
          first:j,second:i,input,wanted:[knownKey[j],knownKey[i]]
        });
      }
    }else seen.set(label,i);
  }
  return {uniqueInputs:seen.size,conflictingWitnesses};
}

const results=[], p55Tests=[];
for(const reversed of [false,true])for(const shape of ['contiguous','interleaved']){
  const l=lanes(reversed?q.slice().reverse():q,shape);
  const basis=key.map((_,i)=>[l[0][i],l[1][i],l[2][i],1]);
  const bRank=rank(basis), kRank=rank(basis.map((r,i)=>[...r,key[i]]));
  assert.equal(bRank,4);assert.equal(kRank,5);
  const plant=basis.map(r=>m(13*r[0]+23*r[1]+2*r[2]+7));
  assert.equal(rank(basis.map((r,i)=>[...r,plant[i]])),4);
  const observed={
    pair01:lookupObstruction(l,key,[0,1]),
    pair02:lookupObstruction(l,key,[0,2]),
    pair12:lookupObstruction(l,key,[1,2]),
    allThree:lookupObstruction(l,key,[0,1,2])
  };
  for(const k of ['pair01','pair02','pair12'])
    assert.ok(observed[k].conflictingWitnesses.length>=1,'No two-lane keyed lookup can reproduce p56');
  if(shape==='contiguous') {
    assert.equal(observed.allThree.conflictingWitnesses.length,1);
    assert.equal(observed.allThree.uniqueInputs,83);
  }else {
    assert.equal(observed.allThree.conflictingWitnesses.length,0);
    assert.equal(observed.allThree.uniqueInputs,84);
  }
  const sourceNativeLookupPlant=Array.from({length:84},(_,i)=>
    m(5*l[0][i]+7*l[1][i]+3*l[2][i]+13)
  );
  for(const selected of [[0,1,2]]) {
    assert.equal(lookupObstruction(l,sourceNativeLookupPlant,selected).conflictingWitnesses.length,0);
  }

  const matches=triples.map(({name,v})=>{
    const vals=key.map((_,i)=>m(v[0]*l[0][i]+v[1]*l[1][i]+v[2]*l[2][i]));
    const hist=Array(29).fill(0);
    for(let i=0;i<84;i++)hist[m(vals[i]-key[i])]++;
    for(const sign of [-1,1]){
      const dec=c55.map((x,i)=>m(x+sign*vals[i]));
      assert.deepEqual(dec.map((x,i)=>m(x-sign*vals[i])),c55);
      const encodedPlant=p57.map((x,i)=>m(x-sign*vals[i]));
      assert.deepEqual(encodedPlant.map((x,i)=>m(x+sign*vals[i])),p57);
      p55Tests.push({
        name,shape,reversed,sign,ioc:ioc(dec),
        prefix:dec.slice(0,32).map(x=>corpus.translit[x]).join('')
      });
    }
    return{name,literal:hist[0],bestConstantOffset:Math.max(...hist)};
  });
  results.push({reversed,shape,bRank,kRank,observed,matches});
}
assert.equal(results.length,4);assert.equal(p55Tests.length,24);
assert.ok(p55Tests.every(x=>x.ioc<0.05));
const best=p55Tests.slice().sort((a,b)=>b.ioc-a.ioc)[0];
assert.equal(best.name,'p3-red');assert.equal(best.shape,'interleaved');
assert.equal(best.reversed,false);assert.equal(best.sign,1);
assert.equal(Number(best.ioc.toFixed(9)),0.045614035);
console.log(JSON.stringify({
  quotientSlots:q.length,solvedP56CipherRunes:85,solvedP56PrimeSteps:key.length,
  literalFSkip:56,rankTests:results,
  p55OriginalIoc:ioc(c55),p57First76Ioc:ioc(p57),
  sourceSelectedP55Models:p55Tests.length,bestP55:best,
  verdict:'All two-lane secret lookups fail p56; all contiguous three-lane secret lookups fail; interleaved three-lane affine functions fail; no direct source-triple p55 plaintext.'
},null,2));
