#!/usr/bin/env node
'use strict';

// #3246: one frozen source-linked cross-cut candidate.
// Candidate source is the exact 2014 Cicada Self-Reliance witness already
// selected by the signed 2014 stage.  Candidate unit is the literal clause
// "for the inmost in due time becomes the outmost", suggested *before*
// boundary comparison by LP2 p15's independently established center-out spiral.
// Candidate receiver is the immediately following physical p16 rune 0.
// This script computes the boundary prediction only; it does NOT authenticate
// that the clause is actual LP2 plaintext.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const transcript=fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const emerson=fs.readFileSync('resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt','utf8');
const solved=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));

const phrase='for the inmost in due time becomes the outmost';
if(!emerson.toLowerCase().includes(phrase))throw Error('frozen Emerson clause not present');
const latinValue=new Map(corpus.translit.map((x,i)=>[x,i]));
const compounds=['ING','TH','NG','EO','OE','AE','IA','EA'];
function gpWord(s){
  const out=[]; s=s.toUpperCase();
  for(let pos=0;pos<s.length;){
    const t=compounds.find(v=>s.startsWith(v,pos))||s[pos];
    const v=latinValue.get(t==='ING'?'NG':t);
    if(v===undefined)throw Error('unencodable '+s+' at '+pos);
    out.push(v); pos+=t.length;
  }
  return out;
}
const words=phrase.split(' ');
const sourceLens=words.map(w=>gpWord(w).length);
const sourceCuts=[];let n=0;
for(let i=0;i<sourceLens.length-1;i++){n+=sourceLens[i];sourceCuts.push(n);}
const sourceTotal=sourceLens.reduce((a,b)=>a+b,0);

const R=new Set(corpus.runes);
function printedLens(s){
  const out=[];let n=0;
  for(const ch of [...s]){
    if(R.has(ch))n++;
    else if('-.$'.includes(ch)&&n){out.push(n);n=0;}
  }
  if(n)out.push(n); return out;
}
const page16=transcript.split('%')[16];
const p16Lens=printedLens(page16);
const p16Cuts=[];n=0;
for(let i=0;i<p16Lens.length-1;i++){n+=p16Lens[i];p16Cuts.push(n);}
const inside=sourceCuts.filter(x=>!p16Cuts.includes(x));
const coincident=sourceCuts.filter(x=>p16Cuts.includes(x));

// Calibration: p57 is independently known clear GP prose in the canonical
// artifact.  The same projection must recover all printed word lengths.
function sourceRunicLens(s){
  const out=[];let n=0;
  for(const ch of [...s]){
    if(R.has(ch))n++;
    else if(n){out.push(n);n=0;}
  }
  if(n)out.push(n);return out;
}
const p57source=sourceRunicLens(solved.sections.find(x=>x.name==='p57_parable').source_text);
const p57printed=printedLens(transcript.split('%')[56]);
if(JSON.stringify(p57source)!==JSON.stringify(p57printed))throw Error('p57 boundary calibration failed');

console.log(JSON.stringify({
  frozen_candidate:{
    source:'2014 Cicada Self-Reliance witness',
    clause:phrase,
    gp_word_lengths:sourceLens,
    gp_total_runes:sourceTotal,
    plaintext_boundaries:sourceCuts,
    receiver:'physical p16, rune 0, immediately after p15 center-out spiral',
    operation_family:'order- and length-preserving rune-value transform'
  },
  p16:{
    first_printed_lengths:p16Lens.slice(0,12),
    first_printed_boundaries:p16Cuts.filter(x=>x<=sourceTotal),
    predicted_plain_boundaries_inside_printed_groups:inside,
    coincident_boundaries:coincident,
    first_printed_group_length:p16Lens[0]
  },
  solved_control:{
    section:'p57_parable',
    source_word_lengths:p57source,
    printed_word_lengths:p57printed,
    exact_boundary_recovery:true
  },
  authentication_gate:{
    pass:false,
    reason:'No first-party LP2 instruction identifies the Self-Reliance clause as p16 plaintext or transfers the 2014 bookcode into a p16 value transform. Conditional boundary mismatch therefore cannot be promoted to a real plaintext anchor.'
  }
},null,2));
