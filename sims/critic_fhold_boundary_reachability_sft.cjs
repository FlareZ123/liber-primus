"use strict";
// Reuse the frozen predictor's definitions without executing its main experiment.
// Run from repository root: node sims/critic_fhold_boundary_reachability_sft.cjs
const fs = require("node:fs");
const vm = require("node:vm");
const src = fs.readFileSync("sims/lp1_periodic_fhold_ciphertext_only_recovery_sft.cjs", "utf8");
const boundary = src.indexOf("\nconst targets = [");
if (boundary < 0) throw new Error("Frozen predictor entry point changed");
vm.runInNewContext(src.slice(0,boundary) + "\n" + `
function reachable(C, key, phases) {
  for (const c of C) {
    const next = new Set();
    for (const j of phases) {
      if (c === 0) next.add(j);
      if (c !== key[j]) next.add((j+1)%key.length);
    }
    phases = next;
  }
  return phases;
}
function trigramStates(C,key,LM,states) {
  for (const c of C) {
    const next = new Map();
    for (const s of states.values()) {
      const add = (p,j) => {
        const score = s.score + (s.b < 0 ? LM.logUnigram[p] : s.a < 0 ? LM.logBigram[s.b][p] : LM.logTrigram[s.a*29+s.b][p]);
        const id = [j,s.b,p].join(",");
        if (!next.has(id) || next.get(id).score < score) next.set(id,{j,a:s.b,b:p,score});
      };
      if (c === 0) add(0,s.j);
      const p = (c-key[s.j]+29)%29;
      if (p) add(p,(s.j+1)%key.length);
    }
    states = next;
  }
  return states;
}
const C = alphabet.pages.find(p=>p.page===0).indices;
const P = C.slice(0,131), H = C.slice(131);
const LM = trainLanguageModel(-1);
const rows = [];
for (const L of [8,13]) {
  const R = recoverKey(P,L,-1,0xAABB0000+L,1500);
  const K = R.ranked[0].key;
  const phases = [...reachable(P,K,new Set([0]))].sort((a,b)=>a-b);
  const surviving = phases.filter(j=>reachable(H,K,new Set([j])).size);
  const full = R.ranked.filter(d=>reachable(C,d.key,new Set([0])).size).length;
  const states = [...trigramStates(P,K,LM,new Map([["initial",{j:0,a:-1,b:-1,score:0}]])).values()].sort((a,b)=>b.score-a.score);
  const continuations = states.flatMap((s,i)=>{
    const end = [...trigramStates(H,K,LM,new Map([["initial",{...s,score:0}]])).values()];
    return end.length ? [{...s,prefixRank:i+1,prefixPenalty:states[0].score-s.score,bestSuffixPerRune:Math.max(...end.map(e=>e.score))/H.length}] : [];
  });
  assert(R.distinctCandidates === (L===8?71:84), "candidate count mismatch");
  assert(full === (L===8?4:22), "full-page feasibility mismatch");
  assert(JSON.stringify(surviving) === (L===8?"[]":"[12]"), "top key boundary feasibility mismatch");
  rows.push({L,validStarts:R.validStarts,distinct:R.distinctCandidates,scoreGap:R.scoreGap,K,phases,surviving,full,states,continuations});
}
console.log(JSON.stringify({training:goldSections.map(s=>({name:s.name,runes:extract(s.source_text).length})),rows},null,2));
`, {require,process,console});
