#!/usr/bin/env node
'use strict';

// Reproduce external Wulfic partial keys for LP2 pages 18 and 19.
// Run from repository root: node sims/external_wulfic_p18_p19_repro.cjs

const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = x => ((x % 29) + 29) % 29;
const render = a => a.map(x => corpus.translit[x]).join('');
const ioc = a => {
  const f = Array(29).fill(0);
  a.forEach(x => f[x]++);
  return f.reduce((s,n) => s+n*(n-1),0)/(a.length*(a.length-1));
};
const tests = [
 {page:18,mode:'SUB',key:[11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],expected:'BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY'},
 {page:19,mode:'ADD',key:[24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28],expected:'REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR'}
];
function decode(page,t,skip) {
 let ki=0,skips=[];
 const sign=t.mode==='SUB'?-1:1;
 const out=page.indices.map((c,i)=>{
  const k=t.key[ki%t.key.length];
  if(skip&&c===0&&k===0){skips.push(i);return 0;}
  ki++;return mod(c+sign*k);
 });
 return {keySymbolsConsumed:ki,conditionalSkipPositions:skips,prefixMatch:render(out).startsWith(t.expected),IoC:ioc(out),first160:render(out.slice(0,160)),last120:render(out.slice(-120))};
}
const result=tests.map(t=>{
 const p=corpus.pages.find(x=>x.page===t.page);
 if(!p||!p.indices?.length)throw Error('Missing page '+t.page);
 const ordinary=decode(p,t,false),conditional=decode(p,t,true);
 if(!ordinary.prefixMatch||!conditional.prefixMatch)throw Error('Prefix mismatch on page '+t.page);
 return {page:t.page,mode:t.mode,ciphertextRunes:p.indices.length,keyLength:t.key.length,ordinary,conditional};
});
console.log(JSON.stringify(result,null,2));
