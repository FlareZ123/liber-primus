#!/usr/bin/env node
"use strict";
/*
 * Exact previous-ciphertext row-alphabet majorization gate for original LP2.
 *
 * Conditional reversible emitter (inside each source-visible frame):
 *     C[0] = arbitrary IV,
 *     C[i] = K[(i mod q), C[i-1]](P[i]), i >= 1,
 * where every K[t,c] is an arbitrary secret permutation of GP29.
 * All charts are shared over the full manuscript. No key search or plaintext
 * optimization is used in the original-input test.
 *
 * Every plaintext symbol x must occupy exactly one printed transition
 * outcome per state (phase, previous C). For any k distinct plaintext
 * symbols, the total appearances cannot exceed the sum, over states, of
 * that state's k largest outcome counts. Give every frame-start rune away
 * free. This is an exact necessary capacity/majorization certificate
 * even after a global secret plaintext-alphabet relabeling.
 *
 * Execute at repository root:
 *   node sims/lp2_prev_ciph_rowphase_majorization_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const load = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(load("resources/liber-primus/lp2-ink-annotations.json"));
const A = 29;
const pages = corpus.pages.filter(p => p.page <= 55);
const N = pages.reduce((s,p) => s+p.indices.length, 0);
assert.equal(N, 12956);
assert.equal(pages.filter(p => p.indices.length > 0).length, 55);
const original = pages.flatMap(p => p.indices);
const offsets = new Map();
let total = 0;
const physical = [];
for (const p of pages) {
  offsets.set(p.page,total);
  if (p.indices.length) physical.push([total, total+p.indices.length]);
  total += p.indices.length;
}
assert.equal(total, N);
const boundaries = new Set([0,N]);
let nMarks = 0;
for (const p of ink.pages.filter(p => p.page <= 55)) {
  for (const mark of p.large_punctuation || []) {
    assert.equal(p.rune_count, pages.find(x=>x.page===p.page).indices.length);
    boundaries.add(offsets.get(p.page)+mark[0]);
    nMarks++;
  }
}
const b = [...boundaries].sort((x,y)=>x-y);
const marked = b.slice(1).map((end,i)=>[b[i],end]).filter(([s,e])=>s<e);
assert.equal(nMarks,31);
assert.equal(marked.length,29);
assert.equal(marked.reduce((s,[a,b])=>s+(b-a),0),N);

function capacity(tape, intervals, q, exceptionMask=null) {
  const M = Array.from({length:q*A},()=>new Uint16Array(A));
  let transitions=0,free=intervals.length;
  for (const [start,end] of intervals) {
    for (let i=start+1; i<end; i++) {
      if(exceptionMask && exceptionMask[i]){free++;continue;}
      M[((i-start)%q)*A+tape[i-1]][tape[i]]++;
      transitions++;
    }
  }
  const ranked = new Uint32Array(A);
  for (const row of M) {
    const sorted = Array.from(row).sort((a,b)=>b-a);
    for (let j=0; j<A; j++) ranked[j]+=sorted[j];
  }
  const prefix = new Uint32Array(A);
  let s=free;
  for(let j=0;j<A;j++){s+=ranked[j];prefix[j]=s;}
  assert.equal(transitions+free,N);
  assert.equal(prefix[A-1],N);
  return {prefix:Array.from(prefix),ranked:Array.from(ranked),transitions,free};
}

const tokenMap = corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function normalizeGP(text) {
  const words=(text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]);
  const out=[];
  for (const w of words) {
    for(let i=0;i<w.length;) {
      if(w.startsWith("ING",i)){out.push(21);i+=3;}
      else if(w.startsWith("IO",i)){out.push(27);i+=2;}
      else {
        const t=tokenMap.find(t=>w.startsWith(t.s,i));
        assert.ok(t, "unmapped word "+w);
        out.push(t.i);i+=t.s.length;
      }
    }
  }
  return out;
}

function majorized(counts, upper) {
  const ordered=Array.from(counts).sort((a,b)=>b-a);
  let s=0;
  for(let j=0;j<A;j++) {
    s+=ordered[j];
    if(s>upper[j])return false;
  }
  return true;
}

const Q=[...Array(18)].map((_,i)=>i+1).concat([23,29]);
const frames={page:physical,mark:marked};
const caps=Object.fromEntries(Object.entries(frames).map(([name, intervals])=>
  [name,Q.map(q=>capacity(original,intervals,q))]));
// Exception-channel challenge: grant the second rune of EVERY original
// within-page doublet an arbitrary plaintext/output. Nonexception sites still
// use the shared previous-published-ciphertext secret rows. These positions
// are source-visible, NOT fitted to a proposed plaintext.
const repeatMask=new Uint8Array(N);
let repeatEvents=0;
for(const [start,end] of physical)for(let i=start+1;i<end;i++)
  if(original[i]===original[i-1]){repeatMask[i]=1;repeatEvents++;}
assert.equal(repeatEvents,86);
const repeatCaps=Object.fromEntries(Object.entries(frames).map(([name, intervals])=>
  [name,Q.map(q=>capacity(original,intervals,q,repeatMask))]));
const sourceFiles=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",62492],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",217106],
  ["Emerson","resources/control/emerson_essays_2944.txt",321327]
];
const refs=sourceFiles.map(([name,file,expected])=>{
  const raw=load(file),gp=normalizeGP(raw);
  assert.equal(gp.length,expected,name+" normalized rune count changed");
  return {name,file,blob_sha256:crypto.createHash("sha256").update(raw,"utf8").digest("hex"),gp};
});

function scanReference(ref) {
  const counts=new Uint16Array(A);
  for (let i=0;i<N;i++)counts[ref.gp[i]]++;
  const survivors=Object.fromEntries(Object.keys(frames).map(k=>[k,Array(Q.length).fill(0)]));
  const repeatSurvivors=Object.fromEntries(Object.keys(frames).map(k=>[k,Array(Q.length).fill(0)]));
  const minimum=Array(A).fill(Infinity);
  const windows=ref.gp.length-N+1;
  for(let start=0;start<windows;start++) {
    if(start){counts[ref.gp[start-1]]--;counts[ref.gp[start+N-1]]++;}
    const sorted=Array.from(counts).sort((a,b)=>b-a);
    const cumulative=new Uint16Array(A);
    let s=0;
    for(let j=0;j<A;j++){s+=sorted[j];cumulative[j]=s;minimum[j]=Math.min(minimum[j],s);}
    for(const [mode,collection,dest] of [
      ["ordinary",caps,survivors],["repeat-free",repeatCaps,repeatSurvivors]
    ]) {
      for(const [name,cs] of Object.entries(collection))for(let qi=0;qi<Q.length;qi++){
        const bound=cs[qi].prefix;
        let good=true;
        for(let j=0;j<A;j++)if(cumulative[j]>bound[j]){good=false;break;}
        if(good)dest[name][qi]++;
      }
    }
  }
  const translate=surv=>Object.fromEntries(Object.entries(surv).map(([name,counts])=>
    [name,Object.fromEntries(Q.map((q,i)=>[String(q),counts[i]]))]));
  const byFrame=translate(survivors);
  return {
    name:ref.name,
    file:ref.file,
    sha256:ref.blob_sha256,
    normalized_runes:ref.gp.length,
    window_count:windows,
    minimum_ranked_plaintext_prefix:minimum,
    survivors:byFrame,
    repeat_exception_survivors:translate(repeatSurvivors)
  };
}

// Source-style positive: a genuinely reversible 29-row/q-phase GP29 sender.
// Give the previous-C output to plaintext NG, whose frequency is uncommon,
// so repeated output glyphs are unusually rare without introducing erasures.
// The test verifies all plaintext, original framing, and all majorization ranks.
function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};}
function plant(ref, frameName, q, seed) {
  const plain=ref.gp.slice(18000,18000+N);
  assert.equal(plain.length,N);
  const intervals=frames[frameName],rand=rng(seed),rare=21;
  const keys=Array.from({length:q*A},(_,st)=>{
    const perm=Array.from({length:A},(_,i)=>i);
    for(let j=A-1;j>0;j--){const k=rand()%(j+1);[perm[k],perm[j]]=[perm[j],perm[k]];}
    const c=st%A,at=perm.indexOf(c);
    [perm[rare],perm[at]]=[perm[at],perm[rare]];
    assert.equal(perm[rare],c);
    return perm;
  });
  const C=new Array(N).fill(-1);
  let repeats=0,expectedRare=0;
  for (const [start,end] of intervals) {
    C[start]=plain[start];
    for (let i=start+1;i<end;i++) {
      C[i]=keys[((i-start)%q)*A+C[i-1]][plain[i]];
      if (C[i]===C[i-1])repeats++;
      if (plain[i]===rare)expectedRare++;
      const row=keys[((i-start)%q)*A+C[i-1]];
      assert.equal(row.indexOf(C[i]),plain[i],"decoder wrong at rune "+i);
    }
  }
  assert.equal(repeats,expectedRare,"rare collision law");
  const cap=capacity(C,intervals,q);
  const plainCounts=new Uint16Array(A);
  for(const r of plain)plainCounts[r]++;
  assert.ok(majorized(plainCounts,cap.prefix),"valid plant rejected by theorem");
  const localRepeats=new Uint8Array(N);
  for(const [start,end] of intervals)for(let i=start+1;i<end;i++)
    if(C[i]===C[i-1])localRepeats[i]=1;
  const relaxed=capacity(C,intervals,q,localRepeats);
  assert.ok(majorized(plainCounts,relaxed.prefix),"valid plant rejected by exception theorem");
  return {frame:frameName,q,seed,matched_native_runes:N,repeated_ciphertext_pairs:repeats,
    expected_rare_plaintext_pairs:expectedRare,passes_all_29_capacity_ranks:true,
    passes_all_29_exception_capacity_ranks:true,
    top1_capacity:cap.prefix[0],original_top1_capacity:caps[frameName][Q.indexOf(q)].prefix[0]};
}

const reports=refs.map(scanReference);
for(const report of reports)for(const survivors of Object.values(report.repeat_exception_survivors))
  for(let q=1;q<=12;q++)assert.equal(survivors[String(q)],0,
    "original exception-channel q<=12 must be excluded for "+report.name);
const tests=[];
for(const frame of Object.keys(frames))for(const q of [1,13])
  tests.push(plant(refs[0],frame,q,31337+q+(frame==="mark"?100:0)));
const result={
  model:"C[i]=K[phase mod q,previous ciphertext](P[i]); shared arbitrary GP29 permutation per state; frame starts granted free",
  original:{runes:N,physical_rune_pages:physical.length,large_marks:nMarks,unique_mark_boundaries:boundaries.size,
    nonempty_mark_intervals:marked.length},
  qs:Q,
  capacities:Object.fromEntries(Object.entries(caps).map(([name,rows])=>[name,Object.fromEntries(
    Q.map((q,i)=>[String(q),{free:rows[i].free,top1:rows[i].prefix[0],
      top2:rows[i].prefix[1],top5:rows[i].prefix[4],top10:rows[i].prefix[9],
      ranked_signature:q===1?rows[i].ranked:undefined}]))])),
  repeat_exception:{original_same_page_doublet_second_positions:repeatEvents,
    rule:"At every second rune of a within-page C[i]==C[i-1] event, the underlying row emission may be arbitrary; all other positions still consume one key-row permutation",
    capacities:Object.fromEntries(Object.entries(repeatCaps).map(([name,rows])=>[name,Object.fromEntries(
      Q.map((q,i)=>[String(q),{free:rows[i].free,top1:rows[i].prefix[0],
        top2:rows[i].prefix[1],top5:rows[i].prefix[4],top10:rows[i].prefix[9],
        top16:rows[i].prefix[15]}]))])),
    all_562060_reference_windows_excluded_for_q1_through_q12:true},
  references:reports,
  controls:tests
};
console.log(JSON.stringify(result,null,2));
