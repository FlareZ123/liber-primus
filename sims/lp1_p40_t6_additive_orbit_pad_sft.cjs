'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = p => JSON.parse(read(p));
const mod = x => ((x % 29) + 29) % 29;
const pow = (a, n) => { let r=1; while(n){if(n%2)r=mod(r*a);a=mod(a*a);n=Math.floor(n/2);} return r; };
const inv = x => { assert.notEqual(mod(x),0); return pow(mod(x),27); };

/* Source assertions: p40 red heading -> fixed point 8 and exponent 15;
   p05 MOBIUS cell 226 -> Cayley seed 21. */
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const p40 = ink.pages.find(p=>p.page===40);
const title = p40.red_spans.find(s=>s.start===0);
const titleIndices = [...title.runes].map(r=>runeIndex.get(r));
const titleSum = titleIndices.reduce((s,i)=>s+corpus.prime[i],0);
const fixed = titleIndices.at(-1);
assert.deepEqual(titleIndices,[0,9,19,26,6,23,25,8]);
assert.equal(titleSum,435);
assert.equal(titleSum/29,15);
assert.equal(fixed,8);
const mobiusCellSum=226;
const seed=mod(fixed+mod(mobiusCellSum%29-1)*inv(mod(mobiusCellSum%29+1)));
assert.equal(seed,21);
const T=x=>mod(27*x+24);
const key=[seed];
for(let i=1;i<28;i++)key.push(T(key[i-1]));
assert.deepEqual(key,[21,11,2,20,13,27,28,26,1,22,9,6,12,0,24,5,14,25,3,18,17,19,15,23,7,10,4,16]);
assert.equal(new Set(key).size,28);
assert.ok(!key.includes(fixed));
assert.equal(T(key[27]),seed);

/* Original 12,956-rune LP2 ciphertext, pages 0-55 (p50 is numeric-only). */
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).sort((a,b)=>a.page-b.page);
const original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(original.length,12956);
assert.ok(!pages.some(p=>p.page===50));
function apply(input,clock,delta){
  assert.ok(clock==='book'||clock==='page');
  assert.ok(delta===-1||delta===1);
  const out=new Uint8Array(input.length);let g=0;
  for(const page of pages){
    for(let j=0;j<page.indices.length;j++){
      const k=key[(clock==='book'?g+j:j)%28];
      out[g+j]=mod(input[g+j]+delta*k);
    }
    g+=page.indices.length;
  }
  assert.equal(g,input.length);
  return out;
}
const ioc=ids=>{const h=new Uint32Array(29);for(const x of ids)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(ids.length*(ids.length-1));};

/* Duko Round 27 English quadgrams, scored over native GP transliterations. */
const qcounts=new Uint32Array(26**4);let qtotal=0,qentries=0;
for(const line of read('resources/control/duko_round27_english_quadgrams.txt').trim().split(/\r?\n/)){
  const m=line.trim().match(/^([A-Z]{4})\s+(\d+)$/);if(!m)continue;
  const q=m[1],n=Number(m[2]);
  const ix=(((q.charCodeAt(0)-65)*26+q.charCodeAt(1)-65)*26+q.charCodeAt(2)-65)*26+q.charCodeAt(3)-65;
  qcounts[ix]=n;qtotal+=n;qentries++;
}
assert.equal(qentries,79495);assert.equal(qtotal,7266795);
const qlogs=new Float64Array(26**4),present=new Uint8Array(26**4);
qlogs.fill(Math.log(.01/qtotal));
for(let i=0;i<qcounts.length;i++)if(qcounts[i]){qlogs[i]=Math.log(qcounts[i]/qtotal);present[i]=1;}
const spellings=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
const letters=corpus.translit.map(s=>[...s].map(c=>c.charCodeAt(0)-65));
function score(ids){
  let total=0,missing=0,n=0,filled=0,a=0,b=0,c=0;
  for(const rune of ids)for(const x of letters[rune]){
    n++;if(filled===0){a=x;filled++;continue;}if(filled===1){b=x;filled++;continue;}if(filled===2){c=x;filled++;continue;}
    const ix=(((a*26+b)*26+c)*26)+x;total+=qlogs[ix];if(!present[ix])missing++;
    a=b;b=c;c=x;
  }
  return {meanNatsPerLetter:total/Math.max(1,n-3),missingQuadgrams:missing,letters:n};
}
const preview=ids=>ids.slice(0,60).map(i=>corpus.translit[i]).join('');

/* Held-out Shakespeare GP plant, 12,956 runes, for positive inverse controls. */
const english=read('resources/control/shakespeare_first300k.txt').toUpperCase()
  .replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'CW');
const plant=[];
plantLoop:
for(const word of english.slice(240000).match(/[A-Z]+/g)||[]){
  for(let i=0;i<word.length;){
    const t=spellings.find(([s])=>word.startsWith(s,i));
    assert.ok(t,'untransliterable held-out English');
    plant.push(t[1]);i+=t[0].length;
    if(plant.length===original.length)break plantLoop;
  }
}
assert.equal(plant.length,original.length);
const variants=[];
for(const clock of ['book','page'])for(const delta of [-1,1]){
  const plain=apply(original,clock,delta);
  assert.deepEqual(apply(plain,clock,-delta),Uint8Array.from(original));
  const encPlant=apply(plant,clock,-delta);
  assert.deepEqual(apply(encPlant,clock,delta),Uint8Array.from(plant));
  variants.push({clock,operation:delta===-1?'P=C-K':'P=C+K',score:score(plain),ioc:ioc(plain),preview:preview(plain),originalReencrypts:true,plantRecovered:original.length});
}
const raw={score:score(original),ioc:ioc(original),preview:preview(original)};
assert.ok(variants.every(v=>v.score.meanNatsPerLetter<raw.score.meanNatsPerLetter));
console.log(JSON.stringify({
  classification:'source-fixed direct additive-pad negative; no authentic LP2 plaintext or key',
  source:{p40TitleIndices:titleIndices,p40PrimeSum:titleSum,p40FixedPoint:fixed,p05MobiusCellSum:mobiusCellSum,cayleySeed:seed,T:'27x+24 mod29',period:28,key},
  scope:{runes:original.length,runeBearingPages:pages.length,operations:['P=C-K','P=C+K'],clocks:['book-continuous','physical-page-reset'],variants:4,noFittedPhase:true,noKeyPermutation:true},
  raw,variants,bestDeltaFromRaw:Math.max(...variants.map(v=>v.score.meanNatsPerLetter))-raw.score.meanNatsPerLetter,
  heldoutEnglishPlant:{runes:plant.length,score:score(plant),allFourInverseControlsExact:true},
  decision:'All four source-fixed direct additive readings score below raw ciphertext. Retire this 28-period Vigenere interpretation under the two tested clocks; do not extend it with arbitrary phases or permutations.'
},null,2));
