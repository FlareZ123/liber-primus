#!/usr/bin/env node
'use strict';

// #3241: Wadsworth unequal-wheel anti-repeat gate.
// Historical Wadsworth: m=26 plaintext positions, n=33 ciphertext positions.
// Generalized state: x=(p-S mod m); x= m when residue 0; S+=x; y=S mod n.
// For n>m, every step x is in 1..m<n, hence adjacent y can never repeat.
// A fixed mixed ciphertext ring is a bijection M(y), so it preserves this invariant.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const solved=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));

function stepEncode(P,m,n,M=null){
  const map=M||Array.from({length:n},(_,i)=>i);
  if(map.length!==n || new Set(map).size!==n) throw Error('bad ciphertext permutation');
  let S=0; const C=[],Y=[];
  for(const p of P){
    if(p<0||p>=m) throw Error('plaintext outside wheel');
    let x=((p-(S%m))%m+m)%m;
    if(x===0)x=m;
    S+=x;
    const y=((S%n)+n)%n;
    Y.push(y); C.push(map[y]);
  }
  return {C,Y,S};
}
function stepDecode(C,m,n,M=null){
  const map=M||Array.from({length:n},(_,i)=>i);
  const inv=Array(n);
  for(let i=0;i<n;i++)inv[map[i]]=i;
  let S=0; const P=[];
  for(let i=0;i<C.length;i++){
    const y=inv[C[i]];
    let x=((y-(S%n))%n+n)%n;
    if(x===0 || x>m) return {ok:false,at:i,why:x===0?'adjacent ciphertext repeat':'forbidden wheel jump',x,y,S};
    S+=x;
    P.push(((S%m)+m)%m);
  }
  return {ok:true,P,S};
}
function doubleSites(a){
  const out=[]; for(let i=0;i+1<a.length;i++)if(a[i]===a[i+1])out.push(i); return out;
}

// Published Kahn LLAMA explanation: repeated L makes a full 26-step plaintext
// revolution.  On a 33-cell ciphertext ring this is circularly 7 cells in
// the opposite direction (26 == -7 mod 33), so the two cipher equivalents differ.
const L='L'.charCodeAt(0)-65;
const llama=[... 'LLAMA'].map(ch=>ch.charCodeAt(0)-65);
const hist=stepEncode(llama,26,33);
const llDelta=(hist.Y[1]-hist.Y[0]+33)%33;
if(llDelta!==26 || Math.min(llDelta,33-llDelta)!==7) throw Error('LLAMA historical invariant failed');
if(doubleSites(hist.Y).length!==0)throw Error('historical wheel unexpectedly repeated');

// Natural direct GP fit: 28-symbol plaintext wheel into all 29 GP ciphertext
// symbols. Solved native prose never uses GP index 12 (EO) or 22 (OE); reserve
// EO only, so p57 is a genuine held native control requiring no escape.
const reserved=12;
const gpTo28=new Map(), gpFrom28=[];
for(let g=0;g<29;g++)if(g!==reserved){gpTo28.set(g,gpFrom28.length);gpFrom28.push(g);}
const idx=new Map(solved.runes.map((r,i)=>[r,i]));
const p57=solved.sections.find(s=>s.name==='p57_parable');
const p57gp=[...p57.source_text].filter(ch=>idx.has(ch)).map(ch=>idx.get(ch));
if(p57gp.some(g=>g===reserved))throw Error('held p57 uses reserved EO');
const p57p=p57gp.map(g=>gpTo28.get(g));
const key=Array.from({length:29},(_,i)=>(7*i+3)%29); // arbitrary bijection; invariant is key-independent
const enc=stepEncode(p57p,28,29,key);
const dec=stepDecode(enc.C,28,29,key);
if(!dec.ok || JSON.stringify(dec.P)!==JSON.stringify(p57p))throw Error('GP28:29 plant inverse failed');
if(doubleSites(enc.C).length!==0)throw Error('GP28:29 plant violated anti-repeat invariant');

// Original p0-p55 uses all 29 ciphertext symbols and has 86 adjacent doublets.
const original=corpus.pages.slice(0,56).flatMap(p=>p.indices);
if(original.length!==12956)throw Error('unexpected original length');
const d=doubleSites(original);
const originalAttempt=stepDecode(original,28,29); // identity ring is just an example;
// Any unknown fixed permutation also preserves equality, so every observed
// adjacent equal pair is an all-key contradiction before key recovery.

const pageRows=[]; let off=0;
for(const p of corpus.pages.slice(0,56)){
  const local=doubleSites(p.indices);
  pageRows.push({page:p.page,runes:p.runic_count,doublets:local.length,sites:local});
  off+=p.runic_count;
}
const solvedUnion=new Set();
for(const s of solved.sections)for(const ch of [...s.source_text])if(idx.has(ch))solvedUnion.add(idx.get(ch));

console.log(JSON.stringify({
 historical_control:{
   plaintext:'LLAMA',m:26,n:33,
   unkeyed_states:hist.Y,
   repeated_L_cipher_step_mod33:llDelta,
   shorter_circular_distance:Math.min(llDelta,33-llDelta),
   adjacent_cipher_doublets:doubleSites(hist.Y).length
 },
 source_native_GP:{
   solved_union_distinct:solvedUnion.size,
   solved_union_missing:[...Array(29).keys()].filter(i=>!solvedUnion.has(i)),
   reserved_plaintext_rune:reserved,
   reserved_translit:corpus.translit[reserved],
   held_section:'p57_parable',
   held_runes:p57gp.length,
   plant_cipher_doublets:doubleSites(enc.C).length,
   inverse_exact:true
 },
 original:{
   runes:original.length,
   adjacent_doublets:d.length,
   first_sites:d.slice(0,20),
   pages_with_doublets:pageRows.filter(x=>x.doublets>0).length,
   page_rows:pageRows.filter(x=>x.doublets>0),
   all_key_direct_GP28_to_GP29_contradiction:d.length
 },
 decision:'Direct Wadsworth-style m=28,n=29 GP receiver is impossible on original LP2 under every fixed ciphertext-ring permutation; each of 86 adjacent equalities is forbidden. A native m=29 plaintext wheel would require n>=30 visible ciphertext symbols to retain the historical anti-repeat property. Any escape/silent-symbol rule is an additional unsourced mechanism.'
},null,2));
