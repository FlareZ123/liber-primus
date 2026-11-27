#!/usr/bin/env node
'use strict';

// #3240: exact alphabet/entropy budget for a one-rune disjoint homophonic channel.
// Historical model follows the standard homophonic substitution definition:
// each plaintext symbol p owns a disjoint nonempty class H[p] of ciphertext
// symbols; one member is selected for each occurrence; decoding c->p is unique.
//
// We test the strongest possible GP27->GP29 one-symbol channel.  EO/OE are
// excluded because the pinned solved Cicada GP source never uses them.
// With 27 plaintext classes and 29 output runes there are only TWO excess
// homophones total.  We compute:
//  (1) best independent-uniform randomized collision expectation sum Dp/hp;
//  (2) an optimistic stateful lower bound granting ZERO ciphertext collision
//      for any plaintext symbol with hp>=2 (stronger than iid random choice);
//  (3) output alphabet size needed to match the original LP2 doublet rate.

const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));

const latinValue=new Map(corpus.translit.map((x,i)=>[x,i]));
// Deliberately omit EO/OE to model the authentic solved-source GP27 register.
const compounds=['ING','TH','NG','AE','IA','EA'];
function gp27Word(s){
  const out=[]; s=s.toUpperCase();
  for(let pos=0;pos<s.length;){
    const t=compounds.find(v=>s.startsWith(v,pos))||s[pos];
    const v=latinValue.get(t==='ING'?'NG':t);
    if(v===undefined)return null;
    out.push(v); pos+=t.length;
  }
  return out;
}
function textGP27(txt){
  const out=[];
  for(const w of (txt.match(/[A-Za-z]+/g)||[])){
    const a=gp27Word(w); if(a)out.push(...a);
  }
  return out;
}
function nativeSolved(){
  const ix=new Map(solved.runes.map((r,i)=>[r,i])),out=[];
  for(const s of solved.sections)for(const ch of [...s.source_text]){
    const v=ix.get(ch); if(v!==undefined)out.push(v);
  }
  return out;
}
function summary(a){
  const count=Array(29).fill(0),dbl=Array(29).fill(0);
  for(const x of a)count[x]++;
  for(let i=0;i+1<a.length;i++)if(a[i]===a[i+1])dbl[a[i]]++;
  const active=[...Array(29).keys()].filter(i=>count[i]>0);
  return {N:a.length,count,dbl,active,D:dbl.reduce((x,y)=>x+y,0)};
}
const originalPages=corpus.pages.slice(0,56);
const originalD=originalPages.reduce((s,p)=>s+summary(p.indices).D,0);
const originalPairs=originalPages.reduce((s,p)=>s+Math.max(0,p.indices.length-1),0);
if(originalD!==86 || originalPairs!==12901)throw Error('original target changed');
const targetRate=originalD/originalPairs;

function bestIID(st,n){
  const k=st.active.length,extra=n-k;
  if(extra<0)return null;
  let dp=Array(extra+1).fill(null);dp[0]={v:0,hs:[]};
  for(const p of st.active){
    const nd=Array(extra+1).fill(null);
    for(let used=0;used<=extra;used++)if(dp[used]){
      for(let add=0;used+add<=extra;add++){
        const h=1+add;
        const cand={v:dp[used].v+st.dbl[p]/h,hs:[...dp[used].hs,h]};
        if(!nd[used+add]||cand.v<nd[used+add].v)nd[used+add]=cand;
      }
    }
    dp=nd;
  }
  return dp[extra];
}
function idealStateful(st,n){
  // Grant zero same-symbol ciphertext collisions whenever a plaintext class
  // has >=2 homophones. Each such class costs at least one excess output.
  const extra=n-st.active.length;
  if(extra<0)return null;
  const ranked=st.active.map(p=>({p,d:st.dbl[p]})).sort((a,b)=>b.d-a.d);
  const removed=ranked.slice(0,Math.min(extra,ranked.length));
  return {remainingD:st.D-removed.reduce((s,x)=>s+x.d,0),covered:removed};
}
function analyze(name,a){
  const st=summary(a);
  const iid29=bestIID(st,29),ideal29=idealStateful(st,29);
  let iidNeed=null,idealNeed=null;
  for(let n=st.active.length;n<=100;n++){
    const b=bestIID(st,n);
    if(iidNeed===null && b.v/(st.N-1)<=targetRate)iidNeed={n,b};
    const q=idealStateful(st,n);
    if(idealNeed===null && q.remainingD/(st.N-1)<=targetRate)idealNeed={n,q};
    if(iidNeed&&idealNeed)break;
  }
  return {
    name,N:st.N,active_plaintext_symbols:st.active.length,
    missing_gp: [...Array(29).keys()].filter(i=>!st.active.includes(i)),
    native_doublets:st.D,native_rate:st.D/(st.N-1),
    target_original_rate:targetRate,
    gp29_iid_expected_doublets:iid29?.v,
    gp29_iid_rate:iid29?.v/(st.N-1),
    gp29_iid_extra_alloc:st.active.map((p,i)=>({p,translit:corpus.translit[p],h:iid29.hs[i],doublets:st.dbl[p],count:st.count[p]})).filter(x=>x.h>1),
    gp29_selection_entropy_bits_per_plain_rune:st.active.reduce((s,p,i)=>s+(st.count[p]/st.N)*Math.log2(iid29.hs[i]),0),
    gp29_ideal_stateful_remaining_doublets:ideal29.remainingD,
    gp29_ideal_stateful_rate:ideal29.remainingD/(st.N-1),
    gp29_ideal_covered:ideal29.covered.map(x=>({...x,translit:corpus.translit[x.p]})),
    min_output_symbols_iid_uniform:iidNeed.n,
    min_output_symbols_ideal_stateful:idealNeed.n
  };
}

const sources=[
  ['authentic_solved_GP',nativeSolved()],
  ['gibran_gp27',textGP27(fs.readFileSync(path.join(root,'resources/control/gibran_prophet_58585.txt'),'utf8'))],
  ['emerson_gp27',textGP27(fs.readFileSync(path.join(root,'resources/control/emerson_essays_2944.txt'),'utf8'))],
  ['shakespeare_gp27',textGP27(fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8'))]
];
const rows=sources.map(([name,a])=>analyze(name,a));
console.log(JSON.stringify({
  model:{
    plaintext_classes:27,ciphertext_symbols:29,excess_homophones:2,
    decoding:'disjoint ciphertext classes, one ciphertext rune per plaintext rune',
    iid_collision_law:'for plaintext doublets of p, Pr(C_i=C_{i+1}) >= 1/h_p; equality for uniform independent choices',
    optimistic_stateful_bound:'grant zero collisions for any p with h_p>=2'
  },
  original:{pairs:originalPairs,doublets:originalD,rate:targetRate},
  controls:rows,
  decision:'GP29 cannot host enough disjoint homophones to reduce native-GP adjacent repeats to LP2 rate. GP29 plaintext leaves zero excess outputs; GP27 leaves only two. Fixed-length multi-rune homophones expand the ciphertext; variable-length forms require an independently framed transport not present in this model.'
},null,2));
