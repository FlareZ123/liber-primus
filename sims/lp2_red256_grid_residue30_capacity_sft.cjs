"use strict";
/** Original-ink 225-red/31-mark vs 32x8 grid all-alphabet residue30 capacity. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus",n),"utf8"));
const ink=read("lp2-ink-annotations.json"),grid=read("base60-grid.json"),gp=read("lp2-corpus.json");
const idx=new Map(gp.runes.map((r,i)=>[r,i]));
const events=[];let red=0,dots=0;
for(const page of ink.pages){
  for(const span of page.red_spans||[]){
    for(const [j,ch] of [...span.runes].entries()){
      const k=idx.get(ch);
      assert.ok(k>=0&&k<=28);
      assert.equal(gp.pages.find(p=>p.page===page.page).indices[span.start+j],k);
      events.push({p:page.page,at:span.start+j,v:k,kind:1});red++;
    }
  }
  for(const [at,n] of page.large_punctuation||[]){
    if(n===13){events.push({p:page.page,at,v:29,kind:0});dots++;}
  }
}
events.sort((a,b)=>a.p-b.p||a.at-b.at||a.kind-b.kind);
const values=events.map(x=>x.v);
const bytes=grid.byte_rows.flat();
assert.equal(red,225);assert.equal(dots,31);
assert.equal(values.length,256);assert.equal(bytes.length,256);
const freq=values=>Array.from({length:30},(_,k)=>values.filter(x=>x===k).length);
const reds=freq(values),residues=freq(bytes.map(x=>x%30));
assert.equal(reds[29],31);
assert.equal(Math.max(...residues),16);
assert.equal(residues[21],16);
assert.equal(residues[29],7);
// Arbitrary fixed secret bijection and arbitrary 256-slot permutation
// preserve symbol multiplicities; the 31 identical source dots cannot arise.
assert.ok(reds[29]>Math.max(...residues));
// Source-chronological and reversed plain table residue matches.
const match=reverse=>values.filter((x,i)=>x===bytes[reverse?255-i:i]%30).length;
assert.equal(match(false),11);assert.equal(match(true),5);
// Planted 256-entry table with matching residues and full-rank alphabet map.
const plant=values.map(x=>(7*x+3)%30);
assert.deepEqual(plant.map(x=>(13*(x-3)%30+30)%30),values); // 7*13 == 1 modulo 30
assert.equal(Math.max(...freq(plant)),31);
console.log("Original red runes",red,"13-dot marks",dots,"grid entries",bytes.length);
console.log("Original grid mod30 counts",residues.join(","));
console.log("Maximum table residue count",Math.max(...residues),"vs 31 source dot events");
console.log("Literal aligned matches",match(false),"reverse",match(true));
console.log("All fixed GP30 alphabet bijections and slot permutations excluded; planted positive PASS.");
console.log("No original ciphertext plaintext, key or intended 256-event codebook recovered.");
