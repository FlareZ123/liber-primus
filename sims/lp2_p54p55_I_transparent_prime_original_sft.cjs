'use strict';
/**
 * Exact I-transparent p56 prime/totient transfer to continuous original p54–55.
 * Node 22 CommonJS, no dependencies. Run from any working directory.
 * This tests a conditional source-motivated family, not an authenticated key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const d = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page = n => d.pages.find(x => x.page === n).indices;
const ref = read('resources/liber-primus/lp1-plaintext-reference.txt');
assert.match(ref, /THE I IS THE VOICE OF THE CIRCUMFERENCE/);
assert.match(ref, /WE MUST SHED OUR OWN CIRCUMFERENCES/);
assert.deepEqual(d.translit.slice(0,11), ['F','U','TH','O','R','C','G','W','H','N','I']);
assert.equal(page(54).length,232);
assert.equal(page(55).length,76);
assert.equal(page(56).length,85);
assert.equal(page(57).length,95);
const R = 10;
const primes = [];
for (let n=2; primes.length<1000; n++) {
  if (primes.every(q=>q*q>n || n%q!==0)) primes.push(n);
}
assert.equal(primes[463],3301);
const mod = x => (x%29+29)%29;
const gp = a => a.map(x=>d.translit[x]).join('');
/** @param {number[]} p @param {number} start @param {number} marker */
function enc(p,start,marker) {
  let k=start;
  return p.map(x=>x===marker?marker:mod(x+primes[k++]-1));
}
/** Exact enumeration with suffix-count memoization. All complete histories are returned.
 * @param {number[]} c @param {number} start @param {number} marker
 */
function all(c,start,marker) {
  const memo=new Map();
  function count(i,k) {
    if(i===c.length) return 1;
    const id=i*1024+k;
    if(memo.has(id)) return memo.get(id);
    let n=0;
    if(c[i]===marker) n+=count(i+1,k);
    if(mod(c[i]-primes[k]+1)!==marker) n+=count(i+1,k+1);
    memo.set(id,n);
    return n;
  }
  const expected=count(0,start), out=[];
  function visit(i,k,p) {
    if(i===c.length) {out.push(p);return;}
    if(c[i]===marker&&count(i+1,k)) visit(i+1,k,p.concat(marker));
    const x=mod(c[i]-primes[k]+1);
    if(x!==marker&&count(i+1,k+1)) visit(i+1,k+1,p.concat(x));
  }
  if(expected) visit(0,start,[]);
  assert.equal(out.length,expected);
  return out;
}
/** @param {number[]} c @param {number} start @param {number} marker */
function firstFailure(c,start,marker) {
  let states=new Set([start]);
  for(let i=0;i<c.length;i++) {
    const next=new Set();
    for(const k of states) {
      if(c[i]===marker) next.add(k);
      if(mod(c[i]-primes[k]+1)!==marker) next.add(k+1);
    }
    if(!next.size) return i;
    states=next;
  }
  return null;
}
const lex=new Set(read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)
  .filter(x=>x&&!x.startsWith(';')).map(x=>x.split(/\s+/)[0].toUpperCase())
  .filter(x=>/^[A-Z]+$/.test(x)));
assert.equal(lex.size,29157);
const folded=s=>s.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
const foldedLex=new Set([...lex].map(folded));
/** @param {number[]} w */
function variants(w) {
  let a=[''];
  for(const x of w) {
    const opts=x===21?['NG','ING']:x===27?['IA','IO']:[d.translit[x]];
    a=a.flatMap(v=>opts.map(o=>v+o));
  }
  return a;
}
const isWord = w => variants(w).some(v=>lex.has(v)||foldedLex.has(v));
assert.ok(isWord([13,10,20,6,4,10,19])); // PILGRIM
const lengths=[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const terminalSource=page(54).slice(-10).concat(page(55));
assert.deepEqual(terminalSource.slice(0,11),[6,3,16,2,14,18,28,4,6,26,21]);
assert.equal(lengths.reduce((a,b)=>a+b,0),86);
const ioc=p=>{
  const counts=Array(29).fill(0);
  p.forEach(x=>counts[x]++);
  return counts.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1));
};
const exactSolved='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE';
const originalPositive=all(page(56),0,0);
assert.equal(originalPositive.filter(p=>gp(p)===exactSolved).length,1);
assert.deepEqual(enc(originalPositive.find(p=>gp(p)===exactSolved),0,0),page(56));
const plant=Array.from({length:308},(_,i)=>page(57)[i%95]);
for(const start of [0,95,231,463]) {
  const c=enc(plant,start,R);
  const recovered=all(c,start,R);
  assert.ok(recovered.some(p=>p.every((x,i)=>x===plant[i])));
  recovered.forEach(p=>assert.deepEqual(enc(p,start,R),c));
}
const output=[];
const tailSets=[];
for(const [name,c] of [
  ['fullChapter',page(54).concat(page(55))],
  ['blackBody',page(54).slice(9).concat(page(55))]
]) {
  const starts=[], tails=new Map();
  let total=0;
  for(let k=0;k<464;k++) {
    const aa=all(c,k,R);
    if(aa.length) starts.push([k,primes[k],aa.length]);
    total+=aa.length;
    for(const a of aa) {
      assert.deepEqual(enc(a,k,R),c);
      const tail=a.slice(-86);
      if(!tails.has(tail.join(','))) tails.set(tail.join(','),{k,tail});
    }
  }
  tailSets.push([...tails.keys()].sort());
  const scores=[...tails.values()].map(({k,tail})=>{
    let pos=0;
    const ws=lengths.map(n=>{const w=tail.slice(pos,pos+n);pos+=n;return w;});
    const hits=ws.map(isWord);
    return {k,words:ws.map(gp),hits:hits.filter(Boolean).length,
      long13:gp(ws[7]),longHit:hits[7],carry:gp(ws[0]),carryHit:hits[0],ioc:ioc(tail)};
  });
  const result={name,startPrime2Failure:firstFailure(c,0,R),starts,total,
    distinctTerminalTapes:tails.size,carryVariants:[...new Set(scores.map(x=>x.carry))],
    word13Variants:[...new Set(scores.map(x=>x.long13))],
    carryLexiconHits:scores.filter(x=>x.carryHit).length,
    word13LexiconHits:scores.filter(x=>x.longHit).length,
    maximumIoC:Math.max(...scores.map(x=>x.ioc)),
    allDistinctTerminalPlaintexts:scores.sort((a,b)=>b.hits-a.hits)};
  assert.equal(result.distinctTerminalTapes,16);
  assert.equal(result.carryLexiconHits,0);
  assert.equal(result.word13LexiconHits,0);
  assert.equal(result.allDistinctTerminalPlaintexts[0].hits,3);
  assert.equal(result.total,name==='fullChapter'?248:160);
  assert.equal(result.startPrime2Failure,name==='fullChapter'?141:74);
  output.push(result);
}
assert.deepEqual(tailSets[0],tailSets[1]);
assert.equal(all(page(55),0,R).length,8);
console.log(JSON.stringify({marker:'I',historicalFPositive:85,sourceP57Plants:4,
  isolatedP55Prime2Histories:8,sourceTerminalRunes:86,results:output},null,2));
