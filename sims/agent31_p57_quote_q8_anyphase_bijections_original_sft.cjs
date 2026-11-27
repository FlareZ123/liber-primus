#!/usr/bin/env node
'use strict';
/**
 * Source-authored exact repeated passage: p57's full 95 native GP29 runes were
 * already the 2013 INSTAR poem, independently printed as clear text in 2014.
 * Ask whether any contiguous LP2 p0-55 95-rune ciphertext interval could be
 * that SAME plaintext under 8 arbitrary private phase-specific bijections.
 *
 * A genuine q8 common hidden permutation/shift is a subset of this family.
 * A necessary keyless condition: every observed phase maps each plaintext GP
 * symbol to one consistent ciphertext symbol AND vice versa. Grant all 29!
 * possibilities independently at every phase; do NOT infer or enumerate keys.
 * Test consumed-F and transparent-plaintext-F (zero output; phase hold) clocks,
 * and literal forward/reverse source reading. Printed spaces are ignored.
 *
 * This is an exact no-go only for a CONTIGUOUS unchanged full 95-rune p57 quote
 * under a continuous q8 phase clock, not for reordered words, decoy word spans,
 * alternate source texts, word-local phase resets or other cipher families.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(tape.length,12956); assert.equal(p57.length,95);
assert.equal(corpus.pages.find(p=>p.page===55).rune_count??corpus.pages.find(p=>p.page===55).runic_count,76);
assert.equal(p57.filter(x=>x===0).length,3);

function matchWindow(C,offset,P,clock){
  const fwd=new Int16Array(8*29).fill(-1),rev=new Int16Array(8*29).fill(-1);
  let phase=0;
  for(let i=0;i<P.length;i++){
    const p=P[i],c=C[offset+i]; assert(p>=0&&p<29&&c>=0&&c<29);
    // Transparent F bypass is external to all secret phase maps: the same
    // c=0 may also be produced normally by another P at that phase.
    if(clock==='fhold'&&p===0){if(c!==0)return i;continue}
    const a=phase*29+p,b=phase*29+c;
    if(fwd[a]>=0&&fwd[a]!==c)return i;
    if(rev[b]>=0&&rev[b]!==p)return i;
    fwd[a]=c;rev[b]=p;
    phase=(phase+1)&7;
  }
  return P.length;
}
function scan(C,P,clock){
  const n=C.length-P.length+1;let full=[],max=0,top=[],hist={};
  for(let off=0;off<n;off++){
    const q=matchWindow(C,off,P,clock);
    hist[q]=(hist[q]||0)+1;
    if(q>P.length)throw Error('unreachable');
    if(q===P.length)full.push(off);
    if(q>max){max=q;top=[off]}
    else if(q===max)top.push(off);
  }
  return {windows:n,max_compatible_prefix:max,max_offsets:top,full_matches:full,
    prefix_histogram:hist};
}
function plant(P,clock){
  const key=[7,12,3,18,25,6,9,14],out=[];let phase=0;
  for(const p of P){
    if(clock==='fhold'&&p===0){out.push(0);continue}
    const sign=phase%2?-1:1;
    out.push(((sign*p+key[phase])%29+29)%29);
    phase=(phase+1)&7;
  }
  return out;
}
const cases=[];
for(const reading of ['forward','reverse']){
  const P=reading==='forward'?p57:[...p57].reverse();
  for(const clock of ['fhold','all']){
    const known=plant(P,clock),frame=tape.slice();
    const plantedAt=1187;frame.splice(plantedAt,P.length,...known);
    assert.equal(matchWindow(frame,plantedAt,P,clock),95);
    const positive=scan(frame,P,clock);
    assert(positive.full_matches.includes(plantedAt));
    const original=scan(tape,P,clock);
    cases.push({reading,clock,
      original:{windows:original.windows,max_prefix:original.max_compatible_prefix,
        tied_offsets:original.max_offsets,full_matches:original.full_matches},
      positive_planted:{offset:plantedAt,exact:true,
        detected:positive.full_matches.includes(plantedAt)}});
  }
}
const out={
  title:'2013-authored p57 full clear 95-rune exact quote repeated in unknown LP2 under 8 arbitrary private phase bijections',
  original_source:'resources/liber-primus/lp2-corpus.json',
  known_quote:'p57, source also authored as 2013 INSTAR poem',
  full_quote_runes:95,unknown_cipher_runes:12956,
  clock_conventions:['transparent plaintext-F with nonconsumption','all-runes consumed'],
  source_orientations:['forward','reverse'],q8_phase_maps:'any eight independently chosen bijections',
  cases,
  scope:'Only contiguous source-native unchanged full-quote copies, continuous q8 phase over the quoted span; no source-selected original page copy has been identified.'
};
console.log(JSON.stringify(out));
for(const c of cases){
  assert.equal(c.original.windows,12862);
  assert.equal(c.original.full_matches.length,0);
  assert.equal(c.positive_planted.detected,true);
}
console.log('PASS: 4/4 95-rune matched positive plants; no complete original exact quote-compatible window under either F clock or source orientation.');
