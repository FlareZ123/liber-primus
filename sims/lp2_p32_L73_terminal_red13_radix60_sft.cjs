'use strict';
/**
 * Source-exact LP2 p32 terminal circumference radix selector.
 * Original first rune L GPprime73, original terminal red13 -> 60.
 * Windows Node22: node sims/lp2_p32_L73_terminal_red13_radix60_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt').split('%')
  .filter(s=>/[ᚠ-ᛡ]/u.test(s));
const index=new Map(book.runes.map((r,i)=>[r,i]));
assert.equal(raw.length,57);
const marked=[];
for(let slot=0;slot<55;slot++){
  const page=slot<50?slot:slot+1;
  const p=book.pages[page];
  const head=raw[slot].match(/[ᚠ-ᛡ]+/u)?.[0];
  assert.ok(head);
  const i=index.get([...head][0]);
  assert.notEqual(i,undefined);
  const punctuation=ink.pages.find(q=>q.page===page)?.large_punctuation||[];
  for(const [position,count,color] of punctuation){
    if(position!==p.indices.length)continue;
    marked.push({page,firstGP:book.translit[i],firstPrime:book.prime[i],
      endingCount:count,endingColor:color,subtraction:book.prime[i]-count,
      originalRunes:p.indices.length});
  }
}
const target=marked.filter(m=>m.subtraction===60);
const alt=marked.filter(m=>m.subtraction===59);
assert.equal(marked.length,10);
assert.deepEqual(target.map(q=>q.page),[32]);
assert.deepEqual(alt,[]);
const p32=marked.find(q=>q.page===32);
assert.deepEqual([p32.firstGP,p32.firstPrime,p32.endingCount,p32.endingColor,
  p32.originalRunes],['L',73,13,'red',121]);
assert.equal(73-13,grid.alphabet.length);
assert.ok(!grid.alphabet.includes('y'));
assert.equal(grid.alphabet.length,60);
assert.equal(grid.bytes.length,256);
assert.equal(grid.alphabet.indexOf('f'),41);
const numericRaw=grid.pages.flatMap(p=>p.tokens);
assert.ok(numericRaw.every(s=>!s.includes('f')));
const f59=grid.alphabet.replace('f','');
assert.equal(f59.length,59);
const parse=(s,alphabet)=>alphabet.indexOf(s[0])*alphabet.length+
  alphabet.indexOf(s[1]);
assert.equal(parse(numericRaw[81],grid.alphabet),58);
assert.equal(parse(numericRaw[81],f59),57);
assert.equal(numericRaw[189],'3C');
assert.equal(parse(numericRaw[189],f59),189);
assert.equal(Number.parseInt('3C',16),60);
// The missing-f radix59 single-root candidate carries 3C (hex60) as its
// self-loop label. This is a separate *conditional* numeric interpretation,
// and its historical purpose is not authenticated by original text.
const next59=numericRaw.map(s=>parse(s,f59));
const seen=new Set(),route59=[];
for(let x=81;!seen.has(x);x=next59[x]){seen.add(x);route59.push(x);}
assert.equal(route59.at(-1),189);
assert.equal(route59.length,16);

console.log(JSON.stringify({
  firstAndLastPagePunctuationFamily:marked,
  sourceOriginalP32:{firstRunicWord:'L',firstRunePrime:73,
    terminalRedDots:13,sourceSubtraction:60,originalRunes:121},
  pageScopedSelector:{terminalMarkedUnsolvedPages:marked.length,
    candidatesForBase60:target.map(q=>q.page),
    candidatesForBase59:alt.map(q=>q.page)},
  table:{printedDigits:grid.alphabet.length,missingLiteralLowercaseF:true,
    cell81:numericRaw[81],base60ValueAtCell81:58,base59ValueAtCell81:57,
    base59FixedPoint189:numericRaw[189],hexOfBase59RootMeans60:true,
    base59Route81ToRoot189:route59},
  decision:'Original-first-rune GPprime minus original terminal punctuation count uniquely equals 60 on p32 among ten terminal-marked pages and zero equal 59. Subtracting and reading 3C as hex are candidate human operations; source does not authenticate either, nor a p32->table cipher inverse.'
},null,2));
