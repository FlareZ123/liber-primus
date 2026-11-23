'use strict';
/**
 * Original LP2 numbered 553-rune red-title / terminal-red3 prime-count receiver.
 * Source-led, speculative operation:
 *  - red p33 first title GP-prime sum 379 selects a literal F at index 378
 *  - p39 terminal red3 sum 173 counts all non-F runes AFTER that F
 *  - the 174-rune tail consumes either p1..p174 or only p1..p173
 *    under exactly the historically verified LP2 p56 phi(prime) subtractor.
 * The coincidence is post-hoc and DOES NOT authenticate this cipher.
 * Run Node.js 22, read-only, from any working directory.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(ROOT,'resources','liber-primus',
  'lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources','liber-primus',
  'lp2-ink-annotations.json'),'utf8'));
const pages=gp.pages.filter(p=>p.page>=33&&p.page<=39);
const entire=pages.flatMap(p=>p.indices);
const marks=ink.pages.filter(p=>[33,39].includes(p.page));
const startMarks=marks.find(p=>p.page===33).red_spans;
const endMarks=marks.find(p=>p.page===39).red_spans;
assert.equal(startMarks.length,2);
assert.equal(endMarks.length,1);
/** @param {string} runes @param {number[]} weights @returns {number} */
function sumRunes(runes,weights) {
  return [...runes].reduce((sum,r)=>{
    const v=gp.runes.indexOf(r);
    assert.ok(v>=0);
    return sum+weights[v];
  },0);
}
const openingSum=sumRunes(startMarks[0].runes,gp.prime);
const secondSum=sumRunes(startMarks[1].runes,gp.prime);
const terminalSum=sumRunes(endMarks[0].runes,gp.prime);
assert.deepEqual([openingSum,secondSum,terminalSum],[379,295,173]);
const numbered=entire.slice(845,1398);
assert.equal(entire.length,1680);
assert.equal(numbered.length,553);
assert.equal(crypto.createHash('sha256').update(Buffer.from(numbered)).digest('hex'),
  'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a');
assert.equal(openingSum+terminalSum+1,numbered.length);
assert.equal(numbered[openingSum-1],0); // Literal GP F before selected tail.
const tail=numbered.slice(openingSum);
assert.equal(tail.length,174);
const fPositions=tail.flatMap((v,i)=>v===0?[i]:[]);
assert.deepEqual(fPositions,[58]);
assert.equal(tail.length-fPositions.length,terminalSum);
assert.equal(entire.slice(845+openingSum,1398).length,174);

// Verify that the selected F ends an actual printed word and that the next
// rune begins a new word; no transcription normalization is inferred here.
const transcription=fs.readFileSync(path.join(ROOT,
  'resources','liber-primus','lp2-transcription.txt'),'utf8')
  .replace(/\r\n/g,'\n');
const printed=transcription.split('\n%\n');
assert.equal(printed.length,57);
assert.ok(printed[38].startsWith('ᚢᚫᚳᛇᚳᚣ-ᛡᚫᛏᛖᚳᚠ-ᛋᚻ-'));
const localRunes=[...printed[38]].filter(c=>gp.runes.includes(c));
assert.equal(localRunes[11],'ᚠ');
assert.equal(localRunes[12],'ᛋ');
assert.equal(localRunes.length,gp.pages.find(p=>p.page===38).indices.length);

/** @param {number} n @returns {number[]} */
function primes(n) {
  const out=[];
  for(let x=2;out.length<n;x++){
    let good=true;
    for(let d=2;d*d<=x;d++)if(x%d===0){good=false;break;}
    if(good)out.push(x);
  }
  return out;
}
const prime=primes(464);
assert.equal(prime[173],1033);
assert.equal(prime[463],3301);
/** @param {number[]} source @param {boolean} transparentF
 * @returns {{out:number[],consumed:number}}
 */
function phiSubtract(source,transparentF) {
  const out=[];
  let k=0;
  for(let i=0;i<source.length;i++){
    const v=source[i];
    if(transparentF&&i===58&&v===0){out.push(0);continue;}
    out.push((v-(prime[k++]-1)%29+29)%29);
  }
  return {out,consumed:k};
}
/** @param {number[]} a @returns {number} */
function ic(a) {
  const freq=new Int32Array(29);
  for(const x of a)freq[x]++;
  let pairs=0;
  for(const n of freq)pairs+=n*(n-1);
  return pairs/(a.length*(a.length-1));
}
const allAdvance=phiSubtract(tail,false);
const skipF=phiSubtract(tail,true);
assert.equal(allAdvance.consumed,174);
assert.equal(skipF.consumed,173);
assert.ok(Math.abs(ic(allAdvance.out)-0.03587801474985051)<1e-12);
assert.ok(Math.abs(ic(skipF.out)-0.03521360706929772)<1e-12);
const neighboring=numbered.slice(openingSum-1-174,openingSum-1);
assert.equal(neighboring.length,174);
const direct=[],mirror=[];
for(const sign of [-1,1]){
  direct.push(ic(tail.map((v,i)=>(v+sign*neighboring[i]+29)%29)));
  mirror.push(ic(tail.map((v,i)=>
    (v+sign*neighboring[neighboring.length-1-i]+29)%29)));
}
assert.ok(direct.every(v=>v<0.048));
assert.ok(mirror.every(v=>v<0.048));

// Authentic solved LP1 p6 GP29 174-rune plant with one declared
// transparent-F position, to make positive inversion reproducible.
const lp1=fs.readFileSync(path.join(ROOT,'resources','liber-primus',
  'lp1-plaintext-reference.txt'),'utf8').replace(/\r\n/g,'\n');
const prose=lp1.split('### 6\n')[1].split('### 7\n')[0]
  .replace(/^A KOAN\n/,'');
const alphabet=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function encode(word) {
  const w=word.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else {
      const item=alphabet.find(a=>w.startsWith(a.s,i));
      assert.ok(item,'GP transliteration missing');
      out.push(item.i);i+=item.s.length;
    }
  }
  return out;
}
const plant=(prose.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(encode).slice(0,174);
assert.equal(plant.length,174);
plant[58]=0;
function phiEncrypt(native,transparentF){
  let k=0;
  return native.map((v,i)=>{
    if(transparentF&&i===58&&v===0)return 0;
    return (v+(prime[k++]-1)%29)%29;
  });
}
const encrypted=phiEncrypt(plant,true);
const recovered=phiSubtract(encrypted,true);
assert.deepEqual(recovered.out,plant);
assert.equal(recovered.consumed,173);
assert.deepEqual(phiEncrypt(recovered.out,true),encrypted);

const report={
  scope:'original pp33-39 numbered 553, proposed p38 F cut and tail174',
  redPrimeSums:[openingSum,secondSum,terminalSum],
  cut:{
    originalNumberedIndex:openingSum-1,
    physicalPage:38,physicalPageIndex:11,GP:'F',
    suffixRunes:tail.length,suffixFOffsets:fPositions,
    suffixNonF:173
  },
  printedPrimeOrdinal:{prime174:prime[173],prime464:prime[463]},
  p56NativePhiCandidate:{
    all174Primes:{ic:ic(allAdvance.out),consumed:allAdvance.consumed},
    skipOneF:{ic:ic(skipF.out),consumed:skipF.consumed}
  },
  adjacent174GP29:{chronologicalMinusPlus:direct,mirroredMinusPlus:mirror},
  plantedNativePhi:{
    recoveredExact174:true,transparentFPosition:58,primeAdvances:recovered.consumed
  },
  recoveredUnknownLP2Plaintext:false
};
console.log(JSON.stringify(report,null,2));
console.log('PASS source-typed red/F/prime count equality; all proposed original inverses are nonprose');
