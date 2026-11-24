'use strict';
/**
 * GEB Crab Canon Fig. 43: all-secret stationary reverse-complement gate.
 * Run from any directory: node sims/lp2_geb_crab_complement_graph_sft.cjs
 * Original source pairings are frozen by earlier p13 physical-fold study.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const parts = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8').split('%');
const gp = new Map(corpus.runes.map((x, i) => [x, i]));
const pages = corpus.pages.filter(p => p.indices.length);
assert.equal(parts.length, pages.length);

/** @param {number} p @returns {number[][]} */
function physicalLines(p) {
  const k = pages.findIndex(x => x.page === p);
  const lines = parts[k].split('/').map(s => Array.from(s).filter(x => gp.has(x)).map(x => gp.get(x))).filter(l => l.length);
  assert.deepEqual(lines.flat(), corpus.pages[p].indices);
  return lines;
}

/** @param {number} p @returns {number[][]} */
function flatPairs(p) {
  const lines = physicalLines(p);
  assert.equal(lines.length, 12);
  const a = lines.slice(0, 6).flat();
  const b = lines.slice(6).flat().reverse();
  assert.equal(a.length, b.length);
  return a.map((x, i) => [x, b[i]]);
}

/** @param {number} p @returns {number[][]} */
function physicalPairs(p) {
  const lines = physicalLines(p);
  assert.equal(lines.length, 12);
  return lines.slice(0, 6).flatMap((a, i) =>
    a.slice(0, lines[11-i].length).map((x, j) => [x, lines[11-i][j]]));
}

/**
 * f(y)=J(f(x)) with J an involution. Any connected non-bipartite component
 * forces every vertex to the same J-fixed label. The row bound is the exact
 * max number of matches for any stationary directed function before
 * imposing involutivity or bijectivity.
 * @param {number[][]} pairs
 */
function graph(pairs) {
  const adj = Array.from({length:29}, () => new Set());
  const counts = Array.from({length:29}, () => Array(29).fill(0));
  for (const [x,y] of pairs) {
    adj[x].add(y);
    adj[y].add(x);
    counts[x][y]++;
  }
  const seen = new Map();
  const components = [];
  for (let x=0; x<29; x++) {
    if (seen.has(x)) continue;
    const q=[x];
    let bipartite=true;
    seen.set(x,0);
    for (let i=0; i<q.length; i++) {
      const u=q[i];
      for (const v of adj[u]) {
        if (!seen.has(v)) {
          seen.set(v,1-seen.get(u));
          q.push(v);
        } else if (seen.get(v)===seen.get(u)) {
          bipartite=false;
        }
      }
    }
    components.push({size:q.length,bipartite});
  }
  return {
    pairs:pairs.length,
    distinctDirectedPairs:counts.flat().filter(Boolean).length,
    selfPairs:pairs.filter(([x,y])=>x===y).length,
    rowBound:counts.reduce((n,row)=>n+Math.max(...row),0),
    components
  };
}

const collapsed = [{size:29,bipartite:false}];
assert.deepEqual(physicalLines(13).map(x=>x.length),[24,21,23,23,22,23,22,25,21,22,22,24]);
for (const [p, n, bound, phyN, phyBound] of [[13,136,36,132,37],[24,135,37,132,35],[42,136,35,130,37]]) {
  const pairs = flatPairs(p);
  const flat = graph(pairs);
  const first = graph(pairs.slice(0,Math.floor(n/2)));
  const second = graph(pairs.slice(Math.floor(n/2)));
  const physical = graph(physicalPairs(p));
  assert.equal(flat.pairs,n);
  assert.equal(flat.rowBound,bound);
  assert.deepEqual(flat.components,collapsed);
  assert.equal(physical.pairs,phyN);
  assert.equal(physical.rowBound,phyBound);
  assert.deepEqual(physical.components,collapsed);
  if (p===13) {
    assert.deepEqual(first.components,collapsed);
    assert.deepEqual(second.components,collapsed);
    assert.equal(first.rowBound,30);
    assert.equal(second.rowBound,29);
  }
  console.log(JSON.stringify({p,flat,first,second,physical}));
}

// Source-native p57 positive plants, not original double-voice evidence.
const native = corpus.pages[57].indices;
const mirror = native.map(x=>28-x).reverse();
const bp = native.map((x,i)=>[x,mirror[native.length-1-i]]);
assert.deepEqual(mirror.reverse().map(x=>28-x),native);
assert.equal(graph(bp).rowBound,native.length);
assert.ok(graph(bp).components.every(c=>c.bipartite));

// Distinct positive: a genuine four-class many-to-one reverse complement.
// This deliberately need not admit a GP29->GP29 function.
const classes = Array.from({length:4},(_,v)=>Array.from({length:29},(_,x)=>x).filter(x=>x%4===v));
const cp=native.map((x,i)=>{
  const dst=classes[(x%4)^1];
  return [x,dst[(7*i+x)%dst.length]];
});
assert.ok(cp.every(([x,y])=>((x%4)^1)===y%4));
assert.ok(graph(cp).components.every(c=>c.bipartite));
assert.ok(graph(cp).rowBound<native.length);
console.log(JSON.stringify({nativeLength:native.length,bijectiveControl:graph(bp),coarseControl:graph(cp)}));
console.log('PASS: original reverse-complement collapse and native-positive controls');

/**
 * Independent voice label maps: f(x)=g(y), absorbing any fixed invertible
 * complement into g. A component forces every incident label identical.
 * @param {number[][]} pairs
 * @returns {number[][]}
 */
function voiceComponents(pairs) {
  const adj=Array.from({length:58},()=>[]);
  for(const [x,y] of pairs){adj[x].push(y+29);adj[y+29].push(x);}
  const seen=new Set(),components=[];
  for(let x=0;x<58;x++){
    if(seen.has(x))continue;
    const q=[x];seen.add(x);
    for(const u of q)for(const v of adj[u])if(!seen.has(v)){seen.add(v);q.push(v);}
    components.push([q.filter(v=>v<29).length,q.filter(v=>v>=29).length]);
  }
  return components.sort((a,b)=>b[0]+b[1]-a[0]-a[1]);
}
for(const p of [13,24,42]){
  const flat=voiceComponents(flatPairs(p)),physical=voiceComponents(physicalPairs(p));
  const expected=p===13?[[28,28],[1,0],[0,1]]:[[29,28],[0,1]];
  assert.deepEqual(flat,expected);
  assert.deepEqual(physical,expected);
  console.log(JSON.stringify({p,independentVoices:{flat,physical}}));
}
const independentControl=voiceComponents(bp);
assert.equal(independentControl.filter(([x,y])=>x===1&&y===1).length,new Set(native).size);
console.log('PASS: independent voice alphabets collapse on every observed original paired position');
