"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");

/** Parse the canonical derivative, preserving actual line/page carries. */
function parse(corpus, transcription) {
  const pages = transcription.split("%");
  pages.splice(50, 0, "");
  assert.equal(pages.length, 58);
  const rows = [];
  let pending = true, major = true;
  for (let p = 0; p < 58; p++) {
    const indices = [];
    for (const x of pages[p]) {
      const c = corpus.runes.indexOf(x);
      if (c >= 0) {
        if (rows.length) {
          rows.at(-1).r = +pending;
          rows.at(-1).mr = major;
        }
        rows.push({ c, l: +pending, ml: major, p });
        indices.push(c);
        pending = major = false;
      } else if ("-.$&§".includes(x)) {
        pending = true;
        if (x !== "-") major = true;
      }
    }
    assert.deepEqual(indices, corpus.pages[p].indices, "physical page " + p);
  }
  rows.at(-1).r = 1;
  rows.at(-1).mr = true;
  return rows;
}

/** One port per side of each observed (phase, rune, L, R) tuple. */
function graph(rows, q, clock) {
  const sz = 116 * q;
  const phase = rows.map((x, i) => clock ? (rows[i + clock.dir]?.c ?? clock.iv) : i % q);
  const ids = rows.map((x, i) => phase[i] * 116 + 4 * x.c + 2 * x.l + x.r);
  const par = Array.from({ length: 2 * sz }, (_, i) => i);
  function find(x) {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  }
  for (let i = 0; i + 1 < rows.length; i++) {
    assert.equal(rows[i].r, rows[i + 1].l);
    // Punctuation is an independent fixed anchor, not an adjacency edge.
    if (!rows[i].mr) par[find(sz + ids[i])] = find(ids[i + 1]);
  }
  const val = new Map();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].ml) val.set(find(ids[i]), 1);
    if (rows[i].mr) val.set(find(sz + ids[i]), 1);
  }
  const observed = Array.from({ length: q }, () => new Set());
  for (const id of ids) observed[Math.floor(id / 116)].add(id);
  return { sz, ids, find, val, observed, phase };
}

/** Propagate exact marginal capacity, then enumerate remaining port flags.
 * Each phase has 58 output tuples with L=1 (or R=1), 29 per (L,R).
 */
function solve(rows, q, clock) {
  const { sz, ids, find, val, observed, phase } = graph(rows, q, clock);
  let changed = true;
  while (changed) {
    changed = false;
    for (const group of observed) for (const side of [0, sz]) {
      const count = new Map();
      for (const id of group) {
        const r = find(side + id);
        count.set(r, (count.get(r) ?? 0) + 1);
      }
      let ones = 0, zeros = 0;
      for (const [r, n] of count) {
        if (val.get(r) === 1) ones += n;
        if (val.get(r) === 0) zeros += n;
      }
      assert(ones <= 58 && zeros <= 58);
      for (const [r, n] of count) {
        if (val.has(r)) continue;
        if (ones + n > 58) { val.set(r, 0); changed = true; }
        else if (zeros + n > 58) { val.set(r, 1); changed = true; }
      }
    }
  }
  const roots = [...new Set([...new Set(ids)].flatMap(id => [find(id), find(sz + id)]))];
  const unknown = roots.filter(r => !val.has(r));
  const unknownGaps = ids.slice(0, -1).filter(id => !val.has(find(sz + id))).length;
  const wrongForced = ids.slice(0, -1).filter((id, i) =>
    val.has(find(sz + id)) && val.get(find(sz + id)) !== rows[i].r).length;
  const base = { q, n: rows.length, types: observed.map(g => g.size),
    unknown: unknown.length, unknownGaps, wrongForced };
  if (unknown.length > 16) return { ...base, feasible: null };
  const solutions = [];
  for (let mask = 0; mask < 2 ** unknown.length; mask++) {
    unknown.forEach((r, k) => val.set(r, (mask >> k) & 1));
    const flag = id => 2 * val.get(find(id)) + val.get(find(sz + id));
    let ok = true;
    for (const group of observed) {
      const n = [0, 0, 0, 0];
      for (const id of group) n[flag(id)]++;
      if (n.some(v => v > 29)) { ok = false; break; }
    }
    if (!ok) continue;
    // Rank frequency within each phase and output flag pair. Aligning
    // descending ranks simultaneously attains the global convex IoC bound.
    const freq = new Map();
    for (const id of ids) freq.set(id, (freq.get(id) ?? 0) + 1);
    const enc = Array.from({ length: q }, () => Array(116).fill(-1));
    const profile = Array(29).fill(0);
    for (let p = 0; p < q; p++) {
      const used = new Set();
      for (let b = 0; b < 4; b++) {
        const group = [...observed[p]].filter(id => flag(id) === b)
          .sort((a, z) => freq.get(z) - freq.get(a) || a - z);
        group.forEach((id, rank) => {
          const target = rank * 4 + b;
          enc[p][id % 116] = target;
          used.add(target);
          profile[rank] += freq.get(id);
        });
      }
      const spare = Array.from({ length: 116 }, (_, i) => i).filter(i => !used.has(i));
      for (let i = 0; i < 116; i++) if (enc[p][i] === -1) enc[p][i] = spare.shift();
      assert.equal(new Set(enc[p]).size, 116);
    }
    const dec = enc.map(e => {
      const d = Array(116);
      e.forEach((v, i) => d[v] = i);
      return d;
    });
    const out = ids.map((id, i) => enc[phase[i]][id % 116]);
    const restored = Array(ids.length);
    // For feedback clocks, the inverse computes the next state from the
    // recovered ciphertext, rather than borrowing its original phase tape.
    const backward = clock?.dir === 1;
    for (let k=0;k<out.length;k++) {
      const i = backward ? out.length-1-k : k;
      const p = clock ? (restored[i+clock.dir] === undefined
        ? clock.iv : Math.floor(restored[i+clock.dir]/4)) : i%q;
      restored[i] = dec[p][out[i]];
    }
    assert.deepEqual(restored, ids.map(id => id % 116));
    for (let i = 0; i < out.length; i++) {
      if (i + 1 < out.length) assert.equal(out[i] & 1, (out[i+1] >> 1) & 1);
      if (rows[i].ml) assert(out[i] & 2);
      if (rows[i].mr) assert(out[i] & 1);
    }
    const gaps = out.slice(0, -1).flatMap((x, i) =>
      (x & 1) !== rows[i].r ? [{ offset: i+1, from: rows[i].r, to: x & 1,
        page: rows[i].p }] : []);
    const n = rows.length;
    solutions.push({ gaps, profile,
      ioc: profile.reduce((s, x) => s + x*(x-1), 0)/(n*(n-1)),
      top4: profile.slice(0, 4).reduce((s, x) => s+x, 0)/n });
  }
  return { ...base, feasible: solutions.length, solutions };
}

/** Construct a genuine solved-p57 space-changing stationary plant.
 * Flip an unanchored gap-1 component, injectively allocate target rune
 * identities, complete the secret permutation, and recover exact p57.
 */
function positive(rows) {
  const { sz, ids, find, val, observed } = graph(rows, 1);
  const candidates = [...new Set(ids.filter(id => (id & 1) && !val.has(find(sz+id)))
    .map(id => find(sz+id)))];
  for (const root of candidates) {
    const groups = Array.from({ length: 4 }, () => []);
    for (const id of observed[0]) {
      const l = ((id>>1)&1) ^ +(find(id) === root);
      const r = (id&1) ^ +(find(sz+id) === root);
      groups[2*l+r].push(id);
    }
    if (groups.some(g => g.length > 29)) continue;
    const enc = Array(116).fill(-1), used = new Set();
    groups.forEach((g, b) => g.forEach((id, i) => {
      enc[id] = 4*i+b; used.add(enc[id]);
    }));
    const spare = Array.from({ length: 116 }, (_,i) => i).filter(i => !used.has(i));
    for (let i=0;i<116;i++) if(enc[i]===-1) enc[i]=spare.shift();
    const inv=Array(116); enc.forEach((x,i)=>inv[x]=i);
    const cipher=ids.map(id=>enc[id]);
    for(let i=0;i<cipher.length;i++){
      if(i+1<cipher.length) assert.equal(cipher[i]&1,(cipher[i+1]>>1)&1);
      if(rows[i].ml) assert(cipher[i]&2);
      if(rows[i].mr) assert(cipher[i]&1);
    }
    const changed=cipher.slice(0,-1).flatMap((x,i)=>(x&1)!==(ids[i]&1)?[i+1]:[]);
    assert(changed.length>0);
    assert.deepEqual(cipher.map(x=>inv[x]),ids);
    return { changed, exactRecovery: true };
  }
  throw Error("No positive space-changing p57 plant found");
}

/** Adjacent-ciphertext state clock, all 29 endpoint IVs in each direction. */
function feedback(rows, dir) {
  const tapes = new Set(), details = [];
  for(let iv=0;iv<29;iv++){
    const x=solve(rows,29,{dir,iv});
    assert(x.feasible !== null);
    for(const s of x.solutions) tapes.add(JSON.stringify(s.gaps.map(g=>[g.offset,g.to])));
    details.push({iv, feasible:x.feasible, unknown:x.unknown,
      maxGaps: Math.max(...x.solutions.map(s=>s.gaps.length)),
      maxIoc: Math.max(...x.solutions.map(s=>s.ioc))});
  }
  return {dir,tapes:[...tapes].map(JSON.parse),details,
    maxIoc: Math.max(...details.map(x=>x.maxIoc))};
}

function run(corpus, transcription) {
  const rows = parse(corpus, transcription);
  const u = rows.filter(x=>x.p<56);
  const words=[]; let length=0;
  for(const x of u){length++;if(x.r){words.push(length);length=0;}}
  assert.equal(length,0);
  assert.equal(u.length,12956);
  assert.equal(words.length,2896);
  assert.equal(words.filter(x=>x===1).length,83);
  assert.equal(words.filter(x=>x===2).length,448);
  assert.equal(u.slice(0,-1).filter((x,i)=>!x.r && x.p!==u[i+1].p).length,32);
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const region=(l,r)=>u.filter(x=>x.p>=l&&x.p<=r);
  const book=[...Array.from({length:13},(_,i)=>i+1),31].map(q=>solve(u,q));
  const train=[1,2,3,4].map(q=>solve(region(16,21),q));
  const hold=[1,2,3,4].map(q=>solve(region(40,53),q));
  const chapter=chapters.map(([l,r])=>solve(region(l,r),1));
  for (const x of [...book.slice(0,13),...train,...hold,...chapter]) {
    assert.equal(x.feasible,1);
    assert.equal(x.solutions[0].gaps.length,0);
  }
  assert.equal(book.at(-1).feasible,2);
  assert.deepEqual(book.at(-1).solutions.map(x=>x.gaps.map(g=>g.offset)),[[],[7961]]);
  const profile=Array(29).fill(0);
  for(const x of chapter) x.solutions[0].profile.forEach((n,i)=>profile[i]+=n);
  const n=u.length;
  const chapterPrivateIoc=profile.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
  const pos=positive(rows.filter(x=>x.p===57));
  const prev=feedback(u,-1),next=feedback(u,1);
  assert.equal(prev.tapes.length,4);
  assert.equal(next.tapes.length,12);
  assert.equal(Math.max(...prev.details.map(x=>x.maxGaps)),459);
  assert.equal(Math.max(...next.details.map(x=>x.maxGaps)),4);
  return { book,train,hold,chapter,chapterPrivateIoc,positive:pos,prev,next };
}

if (require.main === module) {
  const data=path.join(root,"resources","liber-primus");
  console.log(JSON.stringify(run(
    JSON.parse(fs.readFileSync(path.join(data,"lp2-corpus.json"),"utf8")),
    fs.readFileSync(path.join(data,"lp2-transcription.txt"),"utf8")
  ),null,2));
}
module.exports = { run, parse, solve, positive };
