#!/usr/bin/env node
"use strict";
/**
 * Known-source exact chart reconstruction: C_i=K[physical page, C_{i-1}](P_i).
 * Unlike the unigram capacity bound, this is a complete ordered compatibility
 * decision for any supplied known candidate plaintext. A partial injective
 * permutation table extends to a full GP29 permutation iff no pair of
 * contradictory row assignments is observed.
 *
 * node sims/lp2_prev_ciph_page_private_exact_source_locator_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),load=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const A=29,unknown=corpus.pages.filter(p=>p.page<=55);
const printed=unknown.flatMap(p=>p.indices),N=printed.length;
assert.equal(N,12956);
const spans=[];let offset=0;
for(const p of unknown){
  if(p.indices.length)spans.push([offset,offset+p.indices.length,p.page]);
  offset+=p.indices.length;
}
assert.equal(spans.length,55);
const secondRepeat=new Uint8Array(N);
let repeats=0;
for(const [a,b] of spans)for(let i=a+1;i<b;i++)
  if(printed[i]===printed[i-1]){secondRepeat[i]=1;repeats++;}
assert.equal(repeats,86);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function toGP(text){
  const out=[];
  const words=(text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]);
  for(const w of words)for(let i=0;i<w.length;){
    if(w.startsWith("ING",i)){out.push(21);i+=3;}
    else if(w.startsWith("IO",i)){out.push(27);i+=2;}
    else {const t=tokens.find(t=>w.startsWith(t.s,i));
      assert.ok(t,"unknown GP token");out.push(t.i);i+=t.s.length;}
  }
  return out;
}
function toLatinGP(text){
  const alpha="0123456789ABCDEFGHIJKLMNOPQRS";
  const out=[];
  for(const line of text.split(/\r?\n/)){
    const w=line.trim();
    if(!w||w.startsWith("#"))continue;
    for(const glyph of w){const z=alpha.indexOf(glyph);
      assert.ok(z>=0,"invalid Latin GP code: "+glyph);out.push(z);}
  }
  return out;
}
const sourceFiles=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",62492],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",217106],
  ["Emerson","resources/control/emerson_essays_2944.txt",321327],
  ["Latin Vulgate","resources/control/latin-vulgate-gp-wholewords.txt",204802]
];
const refs=sourceFiles.map(([name,file,len])=>{
  const gp=name==="Latin Vulgate"?toLatinGP(load(file)):toGP(load(file));
  assert.equal(gp.length,len,name+" GP source length");
  return {name,len,gp,file};
});

// Pre-computed source-cipher state/output events for every nonfirst rune.
const sites=[];
for(let f=0;f<spans.length;f++){
  const [a,b,physicalPage]=spans[f];
  for(let i=a+1;i<b;i++){
    const row=f*A+printed[i-1],c=printed[i];
    sites.push({i,physicalPage,row,c,repeat:secondRepeat[i]===1});
  }
}
assert.equal(sites.length,N-spans.length);
const slots=spans.length*A*A;
function scanner(cipherSites,windows,withEvents){
  const fSeen=new Uint32Array(slots),rSeen=new Uint32Array(slots);
  const fMap=new Int8Array(slots),rMap=new Int8Array(slots);
  let stamp=0,compatible=0,firstCompatibleStart=null,furthest=-1,furthestStart=-1,
      firstGapSum=0,firstGapMin=N,firstGapMax=-1,nearMisses=0;
  for(let start=0;start<=windows.length-N;start++){
    stamp++;
    let failedAt=N;
    for(const event of cipherSites){
      if(withEvents && event.repeat)continue;
      const plain=windows[start+event.i],fs=event.row*A+plain,
        rs=event.row*A+event.c;
      if((fSeen[fs]===stamp&&fMap[fs]!==event.c) ||
         (rSeen[rs]===stamp&&rMap[rs]!==plain)){
        failedAt=event.i;break;
      }
      fSeen[fs]=stamp;fMap[fs]=event.c;
      rSeen[rs]=stamp;rMap[rs]=plain;
    }
    if(failedAt===N){compatible++;if(firstCompatibleStart===null)firstCompatibleStart=start;}
    else if(failedAt>=spans[0][1])nearMisses++;
    if(failedAt>furthest){furthest=failedAt;furthestStart=start;}
    firstGapSum+=failedAt;
    firstGapMin=Math.min(firstGapMin,failedAt);
    firstGapMax=Math.max(firstGapMax,failedAt);
  }
  const n=windows.length-N+1;
  return {windows:n,full_compatible:compatible,first_compatible_start:firstCompatibleStart,
    furthest_original_rune_index_before_contradiction:furthest,
    best_donor_start:furthestStart,average_first_conflicting_rune_index:firstGapSum/n,
    contradicted_by_first_physical_page:n-nearMisses-compatible};
}
const original=refs.map(r=>({name:r.name,ordinary:scanner(sites,r.gp,false),
    all_86_original_repeats_unconstrained:scanner(sites,r.gp,true)}));
for(const r of original){
  assert.equal(r.ordinary.full_compatible,0);
  assert.equal(r.all_86_original_repeats_unconstrained.full_compatible,0);
}
// Positive: genuine private prior-ciphertext keys applied to independently
// encoded Gibran source, never optimize keys against the manuscript.
function prng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}}
const start=18000,native=refs[0].gp.slice(start,start+N),rand=prng(0x17203301),rare=21;
const keys=Array.from({length:spans.length*A},(_,row)=>{
  const permutation=Array.from({length:A},(_,i)=>i);
  for(let j=A-1;j>0;j--){const k=rand()%(j+1);
    [permutation[j],permutation[k]]=[permutation[k],permutation[j]];}
  const at=permutation.indexOf(row%A);
  [permutation[rare],permutation[at]]=[permutation[at],permutation[rare]];
  return permutation;
});
const plant=new Array(N).fill(-1),plantSites=[];let repeatPlant=0;
for(let f=0;f<spans.length;f++){
  const [a,b,physicalPage]=spans[f];
  plant[a]=native[a];
  for(let i=a+1;i<b;i++){
    const row=f*A+plant[i-1],x=native[i];
    plant[i]=keys[row][x];
    assert.equal(keys[row].indexOf(plant[i]),x);
    const isRepeat=plant[i]===plant[i-1];
    if(isRepeat)repeatPlant++;
    plantSites.push({i,physicalPage,row,c:plant[i],repeat:isRepeat});
  }
}
const positive= {
  frame:"55 independent physical page charts; GP-native Gibran",
  planted_native_offset:start,matched_full_native_runes:N,
  full_exact_deciphered_runes:N,adjacent_equalities:repeatPlant,
  ordinary:scanner(plantSites,refs[0].gp,false),
  repeats_unconstrained:scanner(plantSites,refs[0].gp,true)
};
assert.equal(repeatPlant,100);
assert.ok(positive.ordinary.full_compatible>=1);
assert.equal(positive.ordinary.first_compatible_start,start);
assert.ok(positive.repeats_unconstrained.full_compatible>=1);
assert.equal(positive.repeats_unconstrained.first_compatible_start,start);
console.log(JSON.stringify({model:"Independent secret permutation K[f,previous printed C] at each of 55 physical-page epochs; original order unaltered",original:{runes:N,frames:spans.length,within_page_doublets:repeats,ordinary_observations:sites.length},exact_ordered_original_source_copy:original,known_native_private_key_plant:positive},null,2));
