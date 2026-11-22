"use strict";

/**
 * Source-selected two-zero-cell original LP2 table/ink-register gate.
 * The historical 2013 BASE29 number 3301 selects table index 3301 % 256 = 229.
 * The p39 red polynomial 27+5x+15x^2 has unique double root 24 mod29;
 * using it as a table row selects 24*8 = 192.
 *
 * These turn out to be the only two "00" byte cells and enclose 36 bytes.
 * The original ink inventory independently lists exactly 36 large stops.
 * Test the simplest 36-event one-time GP29 additive receiver against
 * the independently solved p56 and clear p57 original rune sites.
 *
 * Node 22 CommonJS, read-only; no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const mod = n => (n % 29 + 29) % 29;
assert.equal(gp.runes.length,29);
assert.equal(grid.bytes.length,256);
assert.equal(grid.pages.reduce((s,p)=>s+p.tokens.length,0),256);
assert.equal(ink.counts.large,36);
assert.equal(ink.counts.runes,13136);
const p39 = gp.pages.find(p=>p.page===39);
const mark39 = ink.pages.find(p=>p.page===39);
assert.equal(mark39.red_spans.some(s => s.start===119 && s.length===3),true);
const G = p39.indices.slice(119,122);
assert.deepEqual(G,[27,5,15]);
for(let x=0;x<29;x++) {
  const value=mod(G[0]+G[1]*x+G[2]*x*x);
  assert.equal(value===0,x===24);
}
const first = 24 * 8, last = 3301 % 256;
assert.deepEqual([first,last],[192,229]);
const zeros = grid.bytes.flatMap((v,i)=>v===0?[i]:[]);
assert.deepEqual(zeros,[192,229]);
const interval = grid.bytes.slice(first+1,last);
assert.equal(interval.length,36);
const marks = ink.pages.flatMap(p => (p.large_punctuation??[]).map(([end,dots,color]) =>
  ({page:p.page,end,dots,color})));
assert.equal(marks.length,36);
assert.deepEqual(marks.map(x=>x.dots).sort((a,b)=>a-b),
  [10,10,10,10,13,13,13,13,13,13,13,13,13,13,13,13,13,13,
    13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,23]);
const withoutPreceding=marks.flatMap((mark,i)=>
  mark.end===0?[{mark:i,page:mark.page,end:mark.end}]:[]);
assert.deepEqual(withoutPreceding,[{mark:11,page:15,end:0}]);
assert.deepEqual(marks.filter(x=>x.page===7 && x.end===194).map(x=>x.color),
  ["black","red"]);

/** Actual original p56 F-transparent prime-totient decoder, fixed authentic F at rune56. */
function primes(count) {
  const out=[];
  for(let n=2;out.length<count;n++) {
    let prime=true;
    for(let d=2;d*d<=n;d++) if(n%d===0) {prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}
const p56 = gp.pages.find(p=>p.page===56).indices;
const p57 = gp.pages.find(p=>p.page===57).indices;
assert.deepEqual([p56.length,p57.length],[85,95]);
const keys=primes(100);
let index=0;
const plain56=p56.map((v,i)=> i===56 ? 0 : mod(v-(keys[index++]-1)));
assert.deepEqual(plain56.slice(0,5),[24,9,18,9,23]); // ANEND
assert.deepEqual([plain56[4],plain56[44],plain56[84]],[23,3,18]);
const expectedLast5=[23,3,18,p57[6],p57[94]];
assert.deepEqual(expectedLast5,[23,3,18,18,18]);
const actualLast5=marks.slice(-5).map((m,i)=>{
  const p=gp.pages.find(x=>x.page===m.page);
  return {mark:i+31,page:m.page,end:m.end,
    printed:p.indices[m.end-1],
    key:interval[i+31]%29,expected:expectedLast5[i]};
});
const signCounts={subtract:0,add:0};
for(const row of actualLast5) {
  if(mod(row.printed-row.key)===row.expected)signCounts.subtract++;
  if(mod(row.printed+row.key)===row.expected)signCounts.add++;
}
assert.deepEqual(signCounts,{subtract:1,add:0});
/**
 * Independently motivated literal key use: the complete original 170-rune
 * post-table sentence starts on the same physical page p51 after the table.
 * The 36 source-delimited bytes cycle from phase zero across that sentence.
 * GP29 source prose requires IoC substantially above uniform 1/29.
 */
const originalP51 = gp.pages.find(p=>p.page===51).indices;
const originalP52 = gp.pages.find(p=>p.page===52).indices;
assert.equal(originalP51.length,92);
const posttable = originalP51.concat(originalP52.slice(0,78));
assert.equal(posttable.length,170);
function coincidence(v) {
  const counts = new Array(29).fill(0);
  for (const x of v) counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
const postOut=[];
for(const sign of [-1,1]) {
  const decoded=posttable.map((v,i)=>mod(v+sign*interval[i%36]));
  assert.deepEqual(decoded.map((v,i)=>mod(v-sign*interval[i%36])),posttable);
  const p57Cipher=p57.map((v,i)=>mod(v-sign*interval[i%36]));
  assert.deepEqual(p57Cipher.map((v,i)=>mod(v+sign*interval[i%36])),p57);
  postOut.push({sign,meanIoC:coincidence(decoded),
    first32:decoded.slice(0,32).map(x=>gp.translit[x]).join("-")});
}
assert.ok(postOut.every(x=>x.meanIoC<0.04));
assert.ok(coincidence(p57)>0.06);
/**
 * Distinct fixed historical H(2013)*G(p39) quotient target:
 * source table [256] / generator degree4 => formal quotient252 = 7*36.
 * Its source-byte key has exactly36 entries; test its direct repetitive
 * GP29 cipher in the two signs, without any source-free phase scan.
 */
const H=[3,26,24], Gfactor=[27,5,15],F=new Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++) F[i+j]=mod(F[i+j]+H[i]*Gfactor[j]);
assert.deepEqual(F,[23,21,11,17,12]);
const coef=F.slice().reverse(), invLeading=17;
const remainder=grid.bytes.map(mod),quotient=[];
for(let i=0;i<=remainder.length-5;i++){
  const q=mod(remainder[i]*invLeading);
  quotient.push(q);
  for(let j=0;j<5;j++) remainder[i+j]=mod(remainder[i+j]-q*coef[j]);
}
assert.deepEqual(remainder.slice(-4),[0,0,0,0]);
assert.equal(quotient.length,252);
assert.equal(quotient[0],0);
assert.equal(quotient.length/interval.length,7);
const quotientModels=[];
for(const sign of [-1,1]){
  const decrypted=quotient.map((v,i)=>mod(v+sign*interval[i%36]));
  assert.deepEqual(decrypted.map((v,i)=>mod(v-sign*interval[i%36])),quotient);
  const planted=p57.map((v,i)=>mod(v-sign*interval[i%36]));
  assert.deepEqual(planted.map((v,i)=>mod(v+sign*interval[i%36])),p57);
  quotientModels.push({sign,ioc:coincidence(decrypted),
    first36:decrypted.slice(0,36).map(x=>gp.translit[x]).join("-")});
}
assert.ok(quotientModels.every(v=>v.ioc<0.04));


console.log(JSON.stringify({
  source:"original LP2 grid and all 36 large physical stops",
  anchors:{p39DoubleRoot:24,rowWidth:8,first,challengeNumber:3301,
    tableLength:256,last,zeros},
  interior:{length:interval.length,bytes:interval,mod29:interval.map(mod)},
  glyphs:{large:marks.length,dotTypes:ink.counts,withoutPreceding,
    duplicateOffset:marks.filter(x=>x.page===7&&x.end===194)},
  independentKnownEnding:{last5:actualLast5,signCounts},
  consecutiveOriginalPosttable:{n:posttable.length,postOut,
    nativeClearP57IoC:coincidence(p57)},
  tableQuotient:{factor:F,remainder:remainder.slice(-4),formalLength:quotient.length,
    significantLength:quotient.length-1,rawIoC:coincidence(quotient),
    keyRepeats:quotient.length/interval.length,quotientModels},
  decision:"Exact source-addressed zero bracket and 36-count match; "+
    "no authored marker-to-cell opcode or original plaintext. "+
    "Direct preceding-rune additive receiver is undefined at marker11 "+
    "and fails known solved p56/clear p57 controls."
},null,2));
