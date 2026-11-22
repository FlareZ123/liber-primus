"use strict";
/** All-secret source-p7 LFSR exclusion by eleven actual single-rune words.
 * Windows Node22 CommonJS SFT: node sims/lp2_p7_singleword_allseed_sft.cjs
 * Tests original 255+268+263+273+261+272+137 GP29 runes on physical p8–14.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text=read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(8,15).join("").replace(/[\s/&$]/g,"");
const words=[...text.matchAll(/[\u16A0-\u16FF]+/gu)].map(m=>[...m[0]]);
const cipher=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
const anchors=[];let offset=0;
for(const w of words){if(w.length===1)anchors.push([offset,corpus.runes.indexOf(w[0])]);offset+=w.length}
assert.deepEqual([words.length,offset,cipher.length,anchors.length],[383,1729,1729,11]);
assert.deepEqual(anchors.map(x=>x[0]),[274,501,554,602,692,785,1128,1221,1348,1401,1473]);
assert.deepEqual(anchors.map(x=>x[1]),[10,3,10,9,6,10,14,26,1,7,11]);
const mod=x=>(x%29+29)%29;
const inv=x=>{for(let z=1;z<29;z++)if(mod(x*z)===1)return z;throw Error("nonunit")};
/** @param {number[][]} rows @param {number} d */
function rank(rows,d){const a=rows.map(row=>row.map(mod));let k=0;for(let col=0;col<d&&k<a.length;col++){let at=a.findIndex((r,i)=>i>=k&&r[col]);if(at<0)continue;[a[k],a[at]]=[a[at],a[k]];let unit=inv(a[k][col]);a[k]=a[k].map(z=>mod(z*unit));for(let h=k+1;h<a.length;h++){let q=a[h][col];a[h]=a[h].map((z,i)=>mod(z-q*a[k][i]))}k++}return k}
/** @param {number[][]} rows @param {number[]} rhs */
function solve(rows,rhs){const d=rows.length,a=rows.map((r,i)=>r.concat(rhs[i]).map(mod));for(let k=0;k<d;k++){let at=a.findIndex((r,i)=>i>=k&&r[k]);assert.ok(at>=0);[a[k],a[at]]=[a[at],a[k]];let unit=inv(a[k][k]);a[k]=a[k].map(z=>mod(z*unit));for(let h=0;h<d;h++)if(h!==k){let q=a[h][k];a[h]=a[h].map((z,i)=>mod(z-q*a[k][i]))}}return a.map(r=>r[d])}
const models=[
  {name:"Q= P-X ascending",co:[11,25,8,15,2],rule:"q"},
  {name:"Q= P-X mirrored",co:[2,15,8,25,11],rule:"q"},
  {name:"p7 P taps ascending",co:[11,26,8,15,2],rule:"taps"},
  {name:"p7 P taps mirrored",co:[2,15,8,26,11],rule:"taps"}
];
const expected=[[6,8],[6,8],[7,10],[7,8]];
let tested=0;
for(let mi=0;mi<models.length;mi++){
  const model=models[mi],d=model.rule==="q"?4:5;
  const multiplier=model.rule==="q"?mod(-inv(model.co[d])):1;
  const basis=Array.from({length:d},(_,k)=>{const a=Array.from({length:d},(_,i)=>Number(i===k));for(let t=0;t<cipher.length-d;t++){let q=0;for(let i=0;i<d;i++)q+=model.co[i]*a[t+i];a.push(mod(multiplier*q))}return a});
  const rows=anchors.map(([pos])=>basis.map(v=>v[pos]));
  assert.equal(rank(rows,d),d);
  const chosen=[],independent=[];
  for(let i=0;i<rows.length&&chosen.length<d;i++)if(rank(independent.concat([rows[i]]),d)>independent.length){independent.push(rows[i]);chosen.push(i)}
  assert.equal(chosen.length,d);
  if(model.rule==="q")assert.ok(basis.every(v=>v.every((x,i)=>i+56>=v.length||x===v[i+56])));
  const key=(seed,t)=>mod(seed.reduce((s,x,i)=>s+x*basis[i][t],0));
  for(const alphabet of [[10,24],[3,10,24]]){
    let best=0,passed=0,checked=0;
    const search=(assignment)=>{
      if(assignment.length<d){for(const v of alphabet)search(assignment.concat(v));return}
      checked++;
      const seed=solve(independent,chosen.map((j,i)=>mod(anchors[j][1]-assignment[i])));
      const hits=anchors.filter(([pos,c])=>alphabet.includes(mod(c-key(seed,pos)))).length;
      if(hits>best)best=hits;
      if(hits===anchors.length)passed++;
    };
    search([]);
    assert.equal(checked,alphabet.length**d);
    assert.equal(best,expected[mi][alphabet.length-2]);
    assert.equal(passed,0);
    // Source-positive solved-rune plant of the same total length.
    const planted=Array.from({length:cipher.length},(_,i)=>
      corpus.pages[57].indices[i%corpus.pages[57].indices.length]);
    anchors.forEach(([pos],i)=>{planted[pos]=alphabet[i%alphabet.length]});
    const secret=Array.from({length:d},(_,i)=>mod(7+6*i));
    const encrypted=planted.map((p,t)=>mod(p+key(secret,t)));
    const inferred=solve(independent,chosen.map(i=>
      mod(encrypted[anchors[i][0]]-planted[anchors[i][0]])));
    assert.deepEqual(inferred,secret);
    assert.deepEqual(encrypted.map((c,t)=>mod(c-key(inferred,t))),planted);
    tested+=checked;
    console.log(JSON.stringify({model:model.name,alphabet:alphabet.map(v=>corpus.translit[v]),
      candidateSeeds:checked,secretSpace:29**d,maxSingleWordsSatisfied:best,
      survivors:passed,positivePlant:"exact 1729/1729"}));
  }
}
assert.equal(tested,744);
console.log("PASS: all free LFSR initial seeds excluded at 11 original A/I/O source word sites.");
