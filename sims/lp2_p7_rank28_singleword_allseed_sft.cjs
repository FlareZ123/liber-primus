"use strict";
/**
 * Source-p7 red P and Q field recurrences behind an exact reversible
 * predecessor-rank29 channel. All 29^4 or 29^5 secret initial states are
 * exhausted algebraically using 11 authentic one-word source constraints.
 * Windows Node22 SFT: node sims/lp2_p7_rank28_singleword_allseed_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw=read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(8,15).join("").replace(/[\s/&$]/g,"");
const words=[...raw.matchAll(/[\u16A0-\u16FF]+/gu)].map(z=>[...z[0]]);
const original=book.pages.filter(z=>z.page>=8&&z.page<=14).flatMap(z=>z.indices);
const anchors=[];let off=0;
for(const w of words){if(w.length===1)anchors.push(off);off+=w.length}
assert.deepEqual([words.length,off,original.length,anchors.length],[383,1729,1729,11]);
assert.deepEqual(anchors,[274,501,554,602,692,785,1128,1221,1348,1401,1473]);
const rankSource=original.map((c,i)=>i===0?c:
  c===original[i-1]?0:1+c-Number(c>original[i-1]));
assert.deepEqual(anchors.map(i=>rankSource[i]),[11,4,11,9,7,11,15,26,2,8,12]);
const mod=x=>(x%29+29)%29;
const inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("bad field unit")};
/** @param {number[][]} rows @param {number} d */
function rank(rows,d){const a=rows.map(z=>z.map(mod));let k=0;for(let col=0;col<d&&k<a.length;col++){let p=a.findIndex((z,i)=>i>=k&&z[col]);if(p<0)continue;[a[k],a[p]]=[a[p],a[k]];let unit=inv(a[k][col]);a[k]=a[k].map(x=>mod(x*unit));for(let h=k+1;h<a.length;h++){let factor=a[h][col];a[h]=a[h].map((x,i)=>mod(x-factor*a[k][i]))}k++}return k}
/** @param {number[][]} rows @param {number[]} targets */
function solve(rows,targets){const d=rows.length,a=rows.map((z,i)=>z.concat(targets[i]).map(mod));for(let k=0;k<d;k++){let p=a.findIndex((z,i)=>i>=k&&z[k]);assert.ok(p>=0);[a[k],a[p]]=[a[p],a[k]];let unit=inv(a[k][k]);a[k]=a[k].map(x=>mod(x*unit));for(let h=0;h<d;h++)if(h!==k){let factor=a[h][k];a[h]=a[h].map((x,i)=>mod(x-factor*a[k][i]))}}return a.map(z=>z[d])}
const cases=[
 {name:"Q=P−X natural",a:[11,25,8,15,2],characteristic:true},
 {name:"Q=P−X mirrored",a:[2,15,8,25,11],characteristic:true},
 {name:"P five taps natural",a:[11,26,8,15,2],characteristic:false},
 {name:"P five taps mirrored",a:[2,15,8,26,11],characteristic:false}
];
const expected=[[7,8],[7,8],[7,8],[7,8]];
for(let modelId=0;modelId<cases.length;modelId++){
  const model=cases[modelId],d=model.characteristic?4:5;
  const factor=model.characteristic?mod(-inv(model.a[d])):1;
  const basis=Array.from({length:d},(_,k)=>{
    let v=Array.from({length:d},(_,i)=>Number(i===k));
    for(let t=0;t<original.length-d;t++){
      let y=0;for(let i=0;i<d;i++)y+=model.a[i]*v[t+i];
      v.push(mod(factor*y));
    }
    return v;
  });
  const rows=anchors.map(position=>basis.map(b=>b[position]));
  assert.equal(rank(rows,d),d);
  const chosen=[],matrix=[];
  for(let i=0;i<rows.length&&matrix.length<d;i++){
    if(rank(matrix.concat([rows[i]]),d)>matrix.length){matrix.push(rows[i]);chosen.push(i)}
  }
  const key=(seed,t)=>mod(seed.reduce((s,x,i)=>s+x*basis[i][t],0));
  for(const allowed of [[10,24],[3,10,24]]){
    let tested=0,best=0,complete=0;
    const visit=assign=>{
      if(assign.length<d){for(const x of allowed)visit(assign.concat(x));return}
      tested++;
      const seed=solve(matrix,chosen.map((z,i)=>mod(rankSource[anchors[z]]-assign[i])));
      const hits=anchors.filter(t=>allowed.includes(mod(rankSource[t]-key(seed,t)))).length;
      best=Math.max(best,hits);
      if(hits===anchors.length)complete++;
    };
    visit([]);
    assert.equal(tested,allowed.length**d);
    assert.equal(best,expected[modelId][allowed.length-2]);
    assert.equal(complete,0);
    // Full solved-source positive, including real repeated-cipher output.
    const plant=Array.from({length:original.length},(_,i)=>
      book.pages[57].indices[i%book.pages[57].indices.length]);
    anchors.forEach((t,i)=>plant[t]=allowed[i%allowed.length]);
    const secret=Array.from({length:d},(_,i)=>mod(3+4*i));
    const payload=plant.map((p,t)=>mod(p+key(secret,t)));
    const encoded=[];
    for(let t=0;t<payload.length;t++){
      const u=payload[t];
      encoded.push(t===0?u:u===0?encoded[t-1]:
        u-1+Number(u>encoded[t-1]));
    }
    const decodedRank=encoded.map((c,t)=>t===0?c:
      c===encoded[t-1]?0:1+c-Number(c>encoded[t-1]));
    assert.deepEqual(decodedRank,payload);
    const seed=solve(matrix,chosen.map(z=>mod(decodedRank[anchors[z]]-plant[anchors[z]])));
    assert.deepEqual(seed,secret);
    assert.deepEqual(decodedRank.map((u,t)=>mod(u-key(seed,t))),plant);
    console.log(JSON.stringify({channel:"reversible predecessor-rank29",model:model.name,
      allowed:allowed.map(v=>book.translit[v]),originalRnes:original.length,
      hiddenSeedCount:29**d,exhaustiveAnchorCases:tested,maxMatches:best,fullSolutions:complete,
      positive:"exact 1729/1729, reversible"}));
  }
}

// Additional original-doublet event clock: an observed repeated ciphertext
// glyph may consume zero key steps or one extra key step instead of one.
// Only the actual 9 source duplicate events select the offsets below.
let repeated = 0;
const compressedClock = [];
const expandedClock = [];
for (let t = 0; t < original.length; t++) {
  if (t > 0 && original[t] === original[t - 1]) repeated++;
  compressedClock.push(t - repeated);
  expandedClock.push(t + repeated);
}
assert.equal(repeated, 9);
assert.ok(anchors.every(t => t === 0 || original[t] !== original[t - 1]));
const clockModes = [
  {name:"repeat-null", indices:compressedClock},
  {name:"repeat-extra", indices:expandedClock}
];
let clockCases = 0;
for (const clock of clockModes) {
  for (const channel of [
    {name:"direct", output:original},
    {name:"pred-rank", output:rankSource}
  ]) {
    for (const model of cases) {
      const d = model.characteristic ? 4 : 5;
      const factor = model.characteristic ? mod(-inv(model.a[d])) : 1;
      const basis = Array.from({length:d}, (_, k) => {
        const values = Array.from({length:d}, (_, i) => Number(i === k));
        for (let t = 0; t <= expandedClock.at(-1) - d; t++) {
          let sum = 0;
          for (let i = 0; i < d; i++) sum += model.a[i] * values[t + i];
          values.push(mod(factor * sum));
        }
        return values;
      });
      const allRows = anchors.map(t => basis.map(v => v[clock.indices[t]]));
      assert.equal(rank(allRows, d), d);
      const selected = [];
      const independent = [];
      for (let i = 0; i < anchors.length && selected.length < d; i++) {
        if (rank(independent.concat([allRows[i]]), d) > independent.length) {
          selected.push(i);
          independent.push(allRows[i]);
        }
      }
      for (const allowed of [[10, 24], [3, 10, 24]]) {
        let checked = 0;
        let best = 0;
        let survivors = 0;
        const visit = targets => {
          if (targets.length < d) {
            for (const plaintext of allowed) visit(targets.concat(plaintext));
            return;
          }
          checked++;
          const seed = solve(independent, selected.map((i, j) =>
            mod(channel.output[anchors[i]] - targets[j])));
          const matches = anchors.filter(t => allowed.includes(
            mod(channel.output[t] - seed.reduce(
              (sum, x, k) => sum + x * basis[k][clock.indices[t]], 0)))).length;
          best = Math.max(best, matches);
          if (matches === anchors.length) survivors++;
        };
        visit([]);
        assert.equal(checked, allowed.length ** d);
        assert.equal(survivors, 0);
        clockCases++;
        console.log(JSON.stringify({
          clock: clock.name, channel: channel.name, model: model.name,
          alphabet: allowed.map(v => book.translit[v]),
          originalRepeatedEvents: repeated,
          allSecretCandidates: checked, maxMatchedOriginalWords: best,
          validSecrets: survivors
        }));
      }
    }
  }
}
assert.equal(clockCases, 32);
console.log("PASS: source-p7 all-secret predecessor-rank with observed repeated-symbol clocks has no A/I/O original word-consistent key.");
