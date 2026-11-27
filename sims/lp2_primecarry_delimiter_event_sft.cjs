#!/usr/bin/env node
'use strict';

// #3242: source-selected delimiter-event framing.
// Cipher core is the authentic p56 GP29 prime-minus-one additive cipher:
//   literal plaintext F (index 0) -> ciphertext F and consumes no prime;
//   otherwise C=(P+(prime-1)) mod 29 and consume one successive prime.
// Proposed framing: emit a printed delimiter after a shifted rune iff that
// modular addition carried through 29.  Thus the delimiter is receiver-visible
// side information and is not assumed to be a plaintext space.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const solved=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const transcript=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const R=new Set(corpus.runes), idx=new Map(corpus.runes.map((r,i)=>[r,i]));

function primes(n){
  const a=[];
  for(let x=2;a.length<n;x++){
    let ok=true;
    for(let d=2;d*d<=x;d++) if(x%d===0){ok=false;break;}
    if(ok)a.push(x);
  }
  return a;
}
const PR=primes(5000);
const shift=j=>(PR[j]-1)%29;

function sourceRunes(text){return [...text].filter(ch=>idx.has(ch)).map(ch=>idx.get(ch));}
function sourceWords(text){
  const out=[]; let cur=[];
  for(const ch of [...text]){
    if(idx.has(ch)) cur.push(idx.get(ch));
    else if(cur.length){out.push(cur);cur=[];}
  }
  if(cur.length)out.push(cur);
  return out;
}

function encode(P){
  let j=0; const C=[],E=[];
  for(const p of P){
    if(p===0){C.push(0);E.push(0);continue;}
    const k=shift(j++);
    const raw=p+k;
    C.push(raw%29);
    E.push(raw>=29?1:0);
  }
  return {C,E,consumed:j};
}

function decode(C,E){
  if(C.length!==E.length)throw Error('length mismatch');
  let j=0; const P=[];
  for(let i=0;i<C.length;i++){
    const c=C[i],e=E[i];
    if(c===0 && e===0){P.push(0);continue;}
    const k=shift(j);
    const p=(c-k+29)%29;
    if(p===0) return {ok:false,at:i,why:'shifted branch decodes to literal F',j,k,c,e};
    const pred=(p+k>=29)?1:0;
    if(pred!==e) return {ok:false,at:i,why:'carry event mismatch',j,k,c,e,p,pred};
    P.push(p);j++;
  }
  return {ok:true,P,consumed:j};
}

// Authentic solved p56 validates the cipher core and prime clock.
const p56=solved.sections.find(s=>s.name==='p56_an_end');
const p56P=sourceRunes(p56.source_text);
const p56C=corpus.pages[56].indices;
const p56Plant=encode(p56P);
if(JSON.stringify(p56Plant.C)!==JSON.stringify(p56C)) throw Error('p56 core reproduction failed');
const p56Inv=decode(p56Plant.C,p56Plant.E);
if(!p56Inv.ok || JSON.stringify(p56Inv.P)!==JSON.stringify(p56P)) throw Error('p56 carry-sidechannel inverse failed');

// Withheld native plant: p57 words, true separators hidden from the framing layer.
const p57=solved.sections.find(s=>s.name==='p57_parable');
const p57Words=sourceWords(p57.source_text);
function flattenWords(words,reps){
  const P=[], trueBoundary=[];
  for(let r=0;r<reps;r++){
    for(const w of words){
      for(let i=0;i<w.length;i++){
        P.push(w[i]);
        trueBoundary.push(i===w.length-1?1:0);
      }
    }
  }
  return {P,trueBoundary};
}
function overlap(a,b){
  let TP=0,FP=0,TN=0,FN=0;
  for(let i=0;i<a.length;i++){
    if(a[i]&&b[i])TP++; else if(a[i]&&!b[i])FP++;
    else if(!a[i]&&b[i])FN++; else TN++;
  }
  const prec=TP/(TP+FP||1),rec=TP/(TP+FN||1);
  return {TP,FP,TN,FN,precision:prec,recall:rec,f1:2*prec*rec/(prec+rec||1)};
}
const native=flattenWords(p57Words,8);
const nativeEnc=encode(native.P), nativeDec=decode(nativeEnc.C,nativeEnc.E);
if(!nativeDec.ok || JSON.stringify(nativeDec.P)!==JSON.stringify(native.P)) throw Error('native plant failed');
const shuffledWords=[...p57Words].reverse();
const shuffled=flattenWords(shuffledWords,8);
const shuffledEnc=encode(shuffled.P), shuffledDec=decode(shuffledEnc.C,shuffledEnc.E);
if(!shuffledDec.ok || JSON.stringify(shuffledDec.P)!==JSON.stringify(shuffled.P)) throw Error('shuffled plant failed');

// Original physical delimiter channel: one event bit when >=1 '-' occurs in
// the gap after a rune.  '-7-' is two marks but one rune-gap event.
const chars=[...transcript], gaps=Array(12956).fill('');
let ri=-1;
for(const ch of chars){
  if(R.has(ch)){ri++; if(ri>=12956)break;}
  else if(ri>=0)gaps[ri]+=ch;
}
const Eorig=gaps.map(g=>g.includes('-')?1:0);
const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices);
if(tape.length!==12956)throw Error('unexpected unknown rune count');

const chapterStarts=[0,729,1874,3612,5506,6527,7960,9640,12648];
const chapterEnds=[729,1874,3612,5506,6527,7960,9640,12648,12956];
const failures=[];
for(let q=0;q<chapterStarts.length;q++){
  const C=tape.slice(chapterStarts[q],chapterEnds[q]);
  const E=Eorig.slice(chapterStarts[q],chapterEnds[q]);
  const d=decode(C,E);
  failures.push({chapter:q,start:chapterStarts[q],length:C.length,ok:d.ok,
    prefix:d.ok?C.length:d.at,fail:d.ok?null:{...d,global:chapterStarts[q]+d.at,gap:gaps[chapterStarts[q]+d.at]}});
}

// Diagnostic event prediction even after contradictions: observed E only resolves
// the literal-F hold; this is not used to claim a legal inverse.
const pageOf=Array(12956); let off=0;
for(let p=0;p<56;p++){for(let i=0;i<corpus.pages[p].runic_count;i++)pageOf[off+i]=p;off+=corpus.pages[p].runic_count;}
const chapterStartSet=new Set(chapterStarts);
let j=0; const diag=[];
for(let i=0;i<12956;i++){
  if(chapterStartSet.has(i))j=0;
  const c=tape[i],e=Eorig[i];
  let pred=0;
  if(!(c===0 && e===0)){const k=shift(j++);pred=c<k?1:0;}
  diag.push({page:pageOf[i],actual:e,pred,line:gaps[i].includes('/')});
}
function metrics(rows,selector){
  let TP=0,FP=0,TN=0,FN=0;
  for(const r of rows){
    const p=selector?selector(r):r.pred,e=r.actual;
    if(p&&e)TP++; else if(p&&!e)FP++; else if(!p&&e)FN++; else TN++;
  }
  const n=rows.length,prec=TP/(TP+FP||1),rec=TP/(TP+FN||1);
  return {n,TP,FP,TN,FN,actual_rate:(TP+FN)/n,pred_rate:(TP+FP)/n,
    accuracy:(TP+TN)/n,precision:prec,recall:rec,f1:2*prec*rec/(prec+rec||1),
    majority_no_boundary_accuracy:1-(TP+FN)/n};
}
const dev=diag.filter(x=>x.page<=39),hold=diag.filter(x=>x.page>=40);

console.log(JSON.stringify({
  construction:{
    cipher:'authentic p56 prime-minus-one GP29 additive core, literal F holds prime clock',
    reset:'prime 2 at each source-visible $ chapter start',
    event:'hyphen after shifted rune iff modular addition carries through 29'
  },
  authentic_p56_control:{runes:p56P.length,ciphertext_exact:true,carry_sidechannel_inverse_exact:true,
    generated_event_count:p56Plant.E.reduce((a,b)=>a+b,0)},
  native_hidden_separator_plant:{runes:native.P.length,inverse_exact:true,
    carry_events:nativeEnc.E.reduce((a,b)=>a+b,0),
    true_word_boundaries:native.trueBoundary.reduce((a,b)=>a+b,0),
    carry_vs_true_boundaries:overlap(nativeEnc.E,native.trueBoundary)},
  shuffled_word_control:{runes:shuffled.P.length,inverse_exact:true,
    carry_events:shuffledEnc.E.reduce((a,b)=>a+b,0),
    true_word_boundaries:shuffled.trueBoundary.reduce((a,b)=>a+b,0),
    carry_vs_true_boundaries:overlap(shuffledEnc.E,shuffled.trueBoundary)},
  original:{
    binary_hyphen_event_gaps:Eorig.reduce((a,b)=>a+b,0),
    total_hyphen_marks:(gaps.join('').match(/-/g)||[]).length,
    multi_hyphen_gaps:gaps.map((g,i)=>({i,g,n:(g.match(/-/g)||[]).length})).filter(x=>x.n>1),
    chapter_inverse:failures,
    diagnostic_p0_39:metrics(dev),
    diagnostic_p40_55:metrics(hold),
    held_linebreak_baseline:metrics(hold,r=>r.line?1:0)
  }
},null,2));
