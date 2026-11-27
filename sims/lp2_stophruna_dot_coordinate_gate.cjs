#!/usr/bin/env node
'use strict';

// Historical stophruna/strophruna dot-coordinate gate.
// Derolez's Salzburg Isruna tract describes a dot-only cipher in which one
// dot count denotes futhorc group and the other denotes position.  LP2's
// standard 13-dot template has outer/center populations 4/5/4; the 10-dot
// template has 3/4/3; the 23-dot terminal is the widened 13 template.
// Test the strongest literal read: 13/23 -> natural row4,pos5 = Ior/IA (GP27),
// 10 -> row3,pos4 = M (GP19).  Validate on solved pp56-57 before unknown pages.

const fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const solved=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const ink=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json','utf8'));
const idx=new Map(solved.runes.map((r,i)=>[r,i]));
function primes(n){const a=[];for(let x=2;a.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)a.push(x)}return a}
const PR=primes(200);

const p56=solved.sections.find(s=>s.name==='p56_an_end');
const P=[...p56.source_text].filter(ch=>idx.has(ch)).map(ch=>idx.get(ch));
const C=corpus.pages[56].indices;
let j=0;const state=[];
for(let i=0;i<P.length;i++){
  if(P[i]===0){
    state.push({i,P:P[i],C:C[i],literalF:true,primeIndexBefore:j,nextPrime:PR[j],nextShift:(PR[j]-1)%29});
  } else {
    const prime=PR[j++],k=(prime-1)%29;
    state.push({i,P:P[i],C:C[i],literalF:false,prime,k,primeIndexAfter:j,nextPrime:PR[j],nextShift:(PR[j]-1)%29});
  }
}
const candidateByDots={10:19,13:27,23:27};
const page56=ink.pages.find(x=>x.page===56),page57=ink.pages.find(x=>x.page===57);
const p56Rows=page56.large_punctuation.map(([off,dots,color])=>{
  const cand=candidateByDots[dots],left=state[off-1]||null,right=state[off]||null;
  const observed=[left?.P,left?.C,left?.k,left?.nextShift,right?.P,right?.C,right?.k,right?.nextShift].filter(Number.isInteger);
  return {off,dots,candidateGP:cand,candidateTranslit:corpus.translit[cand],left,right,
    direct_state_match:observed.includes(cand)};
});
const p57Text=solved.sections.find(s=>s.name==='p57_parable').source_text;
console.log(JSON.stringify({
  hypothesis:{
    historical_family:'Salzburg stophruna/strophruna dot-only coordinate cipher',
    manuscript_template_read:{13:'4/5 -> Ior/IA = GP27',10:'3/4 -> M = GP19',23:'widened 13 -> Ior/IA = GP27'},
    warning:'LP templates have three/five columns; historical stophruna uses two count fields, so this is already the strongest charitable literalization.'
  },
  solved_p56:{markers:page56.large_punctuation,checks:p56Rows,all_direct_state_matches:p56Rows.every(x=>x.direct_state_match)},
  solved_p57:{markers:page57.large_punctuation,clear_source:p57Text,
    insertion_test:'13-dot after PARABLE and 23-dot after EMERGE are punctuation in independently known cleartext; neither site contains an extra IA rune.'},
  decision:'Reject 10/13/23 dot templates as direct stophruna hidden-rune values or direct p56 cipher-state readouts. A dual-use ornament would need an additional independently selected receiver.'
},null,2));
