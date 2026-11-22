'use strict';

/**
 * Extract the 206 genuine printed-line word initials (including page starts)
 * and test only direct reading, GP29 Caesar shifts/Atbash, and the p56/p0
 * source-motivated prime-totient stream starts.
 *
 * Usage: node sims/lp2_206_word_initial_acrostic_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {pages} = require('./physical_line_initial_crosspage_heldout.cjs');
const ROOT = path.resolve(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ALPHABET = 29;
const manuscript = pages();
const selected = [];
for (const page of manuscript) {
  assert.ok(page.runic.length > 0);
  selected.push({page:page.page,offset:0,kind:'page-start',value:page.runic[0]});
  for (const offset of page.beginWords) {
    selected.push({page:page.page,offset,kind:'line-word-start',
      value:page.runic[offset]});
  }
}
const totals = manuscript.reduce((out,page) => {
  out.lines += page.starts.length;
  out.continuations += page.continueWords.length;
  out.lineWordStarts += page.beginWords.length;
  out.runes += page.runic.length;
  return out;
},{lines:0,continuations:0,lineWordStarts:0,runes:0});
assert.deepEqual(totals,{lines:594,continuations:388,
  lineWordStarts:151,runes:12956});
assert.equal(manuscript.length,55);
assert.equal(selected.length,206);
const values = selected.map(x=>x.value);
const render = xs=>xs.map(x=>CORPUS.translit[x]).join('');
const direct = render(values);
const caesar = Array.from({length:ALPHABET},(_,shift)=>({
  shift,preview:render(values.map(x=>(x-shift+ALPHABET)%ALPHABET)).slice(0,80)
}));
const atbash = render(values.map(x=>ALPHABET-1-x));
function primes(count) {
  const out=[];
  for(let n=2;out.length<count;n++) {
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}
function phi(n) {
  let value=n,remaining=n;
  for(let p=2;p*p<=remaining;p++)if(remaining%p===0) {
    while(remaining%p===0)remaining/=p;
    value-=value/p;
  }
  if(remaining>1)value-=value/remaining;
  return Math.round(value);
}
const primeList=primes(values.length+2);
const primeTotient=[];
for(const startPrime of [2,3]) {
  const start=primeList.indexOf(startPrime);
  const key=values.map((_,i)=>phi(primeList[start+i])%ALPHABET);
  for(const sign of [-1,1]) {
    const decoded=values.map((x,i)=>
      (x+sign*key[i]+ALPHABET)%ALPHABET);
    primeTotient.push({startPrime,sign,preview:render(decoded).slice(0,100)});
  }
}
const SOURCE=fs.readFileSync(path.join(ROOT,
  'resources/transcriptions/liber_primus_master.txt'));
const report={
  question:'Does the source-exact 206-symbol printed-line word-initial channel directly expose plaintext?',
  sourceSha256:createHash('sha256').update(SOURCE).digest('hex'),
  sourcePages:manuscript.length,originalRunes:totals.runes,
  physicalLines:totals.lines,withinWordContinuations:totals.continuations,
  lineWordStarts:totals.lineWordStarts,pageStarts:manuscript.length,
  selectedSymbols:selected.length,
  selection:'page-first rune plus each beginWords offset from physical_line_initial_crosspage_heldout.pages(); source parser asserts every line-start new word is an original word start',
  sequence:direct,indices:values,atbash,reverse:render(values.slice().reverse()),
  reverseAtbash:render(values.slice().reverse().map(x=>ALPHABET-1-x)),
  caesar,primeTotient,
  interpretation:'No direct, reversed, Atbash, GP29 constant shift, or source-motivated prime-totient start at p=2 or p=3 gives recognizable plaintext. This rejects only these simple acrostic readings; it does not explain the previously observed line-start frequency residual or exclude a different source-selected transform.'
};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
