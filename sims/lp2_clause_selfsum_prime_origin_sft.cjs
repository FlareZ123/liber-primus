'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const source = fs.readFileSync(path.join(root,'resources/transcriptions/lp2-image-corrected.txt'),'utf8');
const w = corpus.prime;
const ix = new Map(corpus.runes.map((x,i)=>[x,i]));
const parse = s => [...s].filter(c=>ix.has(c)).map(c=>ix.get(c));
const clauses = source.split('$').map(s=>s.split('.').slice(0,-1).map(parse).filter(a=>a.length));
const N=600000, composite=new Uint8Array(N), primes=[];
for(let i=2;i<N;i++) if(!composite[i]){
  primes.push(i);
  if(i*i<N) for(let k=i*i;k<N;k+=i) composite[k]=1;
}
const shift=primes.map(p=>(p-1)%29);
const sum=p=>p.reduce((a,b)=>a+w[b],0);
const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
/** @param {number[]} p @param {number} [origin] */
function enc(p,origin=sum(p)){
  let k=origin;
  return p.map(a=>a?(a+shift[k++])%29:0);
}
/** Exact enumeration of all fixed-point origins and literal-F masks.
 * @param {number[]} c
 */
function solve(c){
  const n=c.length;
  assert(110*n<shift.length);
  let count=0,legal=0;
  const origins=[],examples=[];
  for(let o=2*n;o<=109*n;o++){
    let states=[{k:o,s:0,p:[]}];
    for(let i=0;i<n&&states.length;i++){
      const next=[],rem=n-i-1;
      for(const a of states){
        if(c[i]===0&&a.s+2+2*rem<=o&&a.s+2+109*rem>=o)
          next.push({k:a.k,s:a.s+2,p:a.p.concat(0)});
        const z=(c[i]-shift[a.k]+29)%29;
        if(z!==0&&a.s+w[z]+2*rem<=o&&a.s+w[z]+109*rem>=o)
          next.push({k:a.k+1,s:a.s+w[z],p:a.p.concat(z)});
      }
      states=next;
    }
    if(states.length){
      origins.push(o);count+=states.length;
      for(const a of states){
        assert.equal(sum(a.p),o);
        assert(eq(enc(a.p),c));legal++;
        examples.push({origin:o,indices:a.p,text:a.p.map(v=>corpus.translit[v]).join('')});
      }
    }
  }
  return {count,legal,origins,examples};
}
const latin=new Map(corpus.translit.map((v,i)=>[v,i]));
for(const [a,b] of [['K','C'],['V','U'],['ING','NG'],['IO','IA'],['Z','S']]) latin.set(a,latin.get(b));
function gp(s){
  return s.split(/\s+/).flatMap(word=>{
    const out=[];
    for(let i=0;i<word.length;){
      const k=[3,2,1].find(n=>i+n<=word.length&&latin.has(word.slice(i,i+n)));
      assert(k);out.push(latin.get(word.slice(i,i+k)));i+=k;
    }
    return out;
  });
}
const p56=gp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE');
assert.equal(p56.length,85);assert(eq(enc(p56,0),corpus.pages[56].indices));
assert.deepEqual(clauses.slice(0,8).map((_,i)=>parse(source.split('$')[i]).length),[729,1145,1738,1894,1021,1433,1680,3316]);
const known=clauses[9].slice(1);
assert.deepEqual(known.map(sum),[1259,1031,1229]);
const controls=known.map(p=>{
  const c=enc(p),result=solve(c);
  assert(result.examples.some(a=>eq(a.indices,p)));
  return {length:p.length,sum:sum(p),cipher:c,...result};
});
assert.deepEqual(controls.map(a=>a.count),[2,1,1]);
const orig=clauses[0].slice(1,4).map((c,i)=>({clause:i+1,length:c.length,visibleF:c.filter(v=>v===0).length,...solve(c)}));
assert.deepEqual(orig.map(a=>a.length),[141,121,22]);
assert.deepEqual(orig.map(a=>a.count),[0,3,1]);
console.log(JSON.stringify({authenticP56Replay:85,controls,original:orig},null,2));
