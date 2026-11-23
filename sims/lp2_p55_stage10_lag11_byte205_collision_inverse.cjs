"use strict";
/**
 * Original p55 GP29 inversion: source-selected eleven-step lag as an exact
 * collision-rejected byte-key Viterbi, not a fitted substitution key.
 *
 * Independent inputs:
 * - 2014 Stage10 original numbered JPEG links 107,167,229, whose prime
 *   ordinal positions are 28,39,50 (11-step source clue);
 * - original p50 32x8 table where row-major byte[74]=205 and byte[205]=76;
 * - untouched 76-symbol p55 ciphertext.
 *
 * This is a CONDITIONAL cross-source candidate, not an LP2 decryption.
 * Run: node sims/lp2_p55_stage10_lag11_byte205_collision_inverse.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {train}=require("./grid_keyskip_viterbi.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const original=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const html=read("resources/external/2014-stage10-post-square-response.html");
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const links=[...html.matchAll(/<img src="\/(\d+)\.jpg" \/>/g)].map(m=>+m[1]);
assert.deepEqual(links,[107,167,229]);
const primes=[];
for(let x=2;x<300;x++){
  let okay=true;
  for(let q=2;q*q<=x;q++)if(x%q===0){okay=false;break;}
  if(okay)primes.push(x);
}
const ordinals=links.map(x=>primes.indexOf(x)+1);
assert.deepEqual(ordinals,[28,39,50]);
const step=ordinals[1]-ordinals[0];
assert.equal(step,ordinals[2]-ordinals[1]);
assert.equal(step,11);
const K=grid.bytes.map(v=>v%29);
assert.equal(K.length,256);
assert.equal(grid.bytes[74],205);
assert.equal(grid.bytes[205],76);
const start=205,MAX_SKIPS=14,PENALTY=3.3;
const cipher=original.pages[55].indices,known=original.pages[57].indices.slice(0,76);
assert.equal(cipher.length,76);
assert.equal(known.length,76);
const lm=train(shakespeare.slice(0,200000));
const mod=n=>(n%29+29)%29;
const nativeScore=plain=>plain.reduce((sum,p,i)=>
  sum+(i===0?lm.unigram[p]:i===1
    ?lm.bigram[29*plain[i-1]+p]
    :lm.trigram[(29*plain[i-2]+plain[i-1])*29+p]),0)/plain.length;
/**
 * C_i=P_i+sign*K_j, with at most one rejected K_j per emitted rune.
 * Rejecting a draw is allowed ONLY if the discarded proposal would have
 * matched the previous emitted C rune or the emitted rune 11 positions ago.
 * Every hidden rejected draw is reconstructible as a directed path constraint.
 *
 * State [E,rPrev,rPrevPrev]: total extra consumed keys, 2 last skip flags.
 * All states sharing this state key have the exact same last two plaintext
 * runes; one best trigram path per state is therefore an exact Viterbi.
 */
function invert(C,sign,allowLag11){
  let dp=new Map([["0,0,0",{score:0,skips:[],plain:[]}]]);
  for(let i=0;i<C.length;i++){
    const next=new Map();
    for(const [tag,st] of dp){
      const [E,rPrev,rPrevPrev]=tag.split(",").map(Number);
      for(let r=0;r<=1&&E+r<=MAX_SKIPS;r++){
        const newE=E+r;
        const oldKey=K[(start+i+E)%256],newKey=K[(start+i+newE)%256];
        const p=mod(C[i]-sign*newKey);
        if(r){
          const wouldBe=mod(p+sign*oldKey);
          if(!(i>=1&&wouldBe===C[i-1])&&
             !(allowLag11&&i>=step&&wouldBe===C[i-step]))continue;
        }
        const len=st.plain.length,prev=st.plain;
        const ll=i===0?lm.unigram[p]:i===1?lm.bigram[29*prev[0]+p]
          :lm.trigram[(29*prev[len-2]+prev[len-1])*29+p];
        const score=st.score+ll-PENALTY*r;
        const newTag=[newE,r,rPrev].join(",");
        const old=next.get(newTag);
        if(!old||score>old.score)
          next.set(newTag,{score,skips:st.skips.concat(r),plain:st.plain.concat(p)});
      }
    }
    dp=next;
    assert(dp.size>0,"No valid cipher inverse at rune "+i);
  }
  const best=[...dp.values()].sort((a,b)=>b.score-a.score)[0];
  return {score:best.score,perRune:best.score/C.length,
    extraKeyDraws:best.skips.reduce((s,r)=>s+r,0),
    originalGP:best.plain,
    preview:best.plain.map(i=>original.translit[i]).join(" ")};
}
/** Planted full GP29 original-word native positive, using the same reversible
 * one-key rejection operation. This cannot authenticate an unknown plaintext.
 */
function plant(plain,sign){
  let j=start,output=[],skipped=0;
  for(let i=0;i<plain.length;i++){
    let c=mod(plain[i]+sign*K[j%256]);
    if(i>0&&(c===output[i-1]||(i>=step&&c===output[i-step]))){
      j++;skipped++;
      c=mod(plain[i]+sign*K[j%256]);
    }
    output.push(c);j++;
  }
  return {output,skipped};
}
const originalModes=[];
for(const sign of [-1,1]){
  for(const allowLag11 of [false,true]){
    const recovered=invert(cipher,sign,allowLag11);
    originalModes.push({sign,allowLag11,...recovered});
  }
}
const planted=plant(known,1),inverse=invert(planted.output,1,true);
assert.equal(planted.skipped,1);
assert.equal(inverse.extraKeyDraws,1);
assert.deepEqual(inverse.originalGP,known);
assert.equal(originalModes[0].extraKeyDraws,0);
assert.equal(originalModes[1].extraKeyDraws,1);
assert.equal(originalModes[2].extraKeyDraws,0);
assert.equal(originalModes[3].extraKeyDraws,0);
assert.ok(originalModes.every(x=>x.perRune<-5.9),
 "Potential original English output; investigate before applying expected negative verdict");
assert.ok(inverse.perRune>-3);
const allPages=original.pages.filter(p=>p.page<56&&p.indices.length);
const lag11=allPages.reduce((total,p)=>total+p.indices.slice(step)
  .filter((v,i)=>v===p.indices[i]).length,0);
assert.equal(lag11,363);
console.log(JSON.stringify({
  source:"2014 original JPEG prime-ordinal 11-step; 2016 signed 205->76 p50 lookup",
  sourcePrimeOrdinals:ordinals,lag:step,
  originalP55:{runes:76,lag11BookwideCollisions:lag11},
  cipherModel:"C=P+sign*gridByte[(205+i+E)%256] mod29",
  maxSkip:MAX_SKIPS,skipPenalty:PENALTY,
  recoveredOriginal:originalModes.map(x=>({
    sign:x.sign,allowLag11:x.allowLag11,score:x.score,
    perRune:x.perRune,extraKeyDraws:x.extraKeyDraws,preview:x.preview
  })),
  positivePlant:{actualSkips:planted.skipped,
    inferredSkips:inverse.extraKeyDraws,knownRunes:known.length,
    exactRecovered:inverse.originalGP.filter((v,i)=>v===known[i]).length,
    nativeScore:nativeScore(known),retrievedScore:inverse.perRune},
  decision:"No source-native original p55 plaintext in this fixed source-selected byte205 + lag1/lag11 collision-consumption cipher."
},null,2));
