'use strict';
/**
 * SFT: original-word collision theorem for all-secret deterministic GP29
 * transducers indexed by previous 1, 2, or 3 ciphertext runes and one
 * source-visible 5-phase word/rune clock, with unlimited nonlinear keys.
 *
 * Also: one preceding plaintext + ciphertext rune, global/section/page
 * mode dependence. All original ciphertext runes, words and boundaries
 * remain unchanged. Donors are exact-GP-word-length matched.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_wordcollision5_arbitrary_predecessor_states_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const rune = new Map(gp.runes.map((r,i) => [r,i]));
const translit = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} s @returns {number[]} */
function gpEncode(s) {
  const text = s.toUpperCase().normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(text, /^[A-Z]+$/u);
  const out = [];
  for (let i=0;i<text.length;) {
    if (text.startsWith('ING',i)) {out.push(21);i+=3;}
    else if (text.startsWith('IO',i)) {out.push(27);i+=2;}
    else {
      const t=translit.find(v=>text.startsWith(v.s,i));
      assert(t,'missing token '+text.slice(i));
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const input = read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const spans = [];
const original = [];
let word = [], start = 0;
for (const ch of input) {
  if (rune.has(ch)) {
    if (!word.length) start=original.length;
    word.push(rune.get(ch));
    original.push(rune.get(ch));
  } else if (ch==='%' || ch==='/' || /\s/u.test(ch)) {
    // Source word may continue across the physical line or page.
  } else if (word.length) {
    spans.push({start,len:word.length,value:word.join('.')});
    word=[];
  }
}
if (word.length) spans.push({start,len:word.length,value:word.join('.')});
assert.equal(original.length,12956);
assert.equal(spans.length,2896);
assert.equal(spans.at(-1).start+spans.at(-1).len,12956);
const sections=[158,255,385,435,224,326,378,735];
assert.equal(sections.reduce((s,x)=>s+x,0),spans.length);
const wordSections = [];
sections.forEach((count,section)=>{
  for(let j=0;j<count;j++)wordSections.push(section);
});
const pageStarts = [];
let pos=0;
gp.pages.slice(0,56).forEach(p=>{
  if(p.indices.length) {
    pageStarts.push({start:pos,page:p.page});
    pos+=p.indices.length;
  }
});
assert.equal(pos,12956);
assert.equal(pageStarts.length,55);
/** @param {number} runeOffset @returns {number} */
function pageAt(runeOffset) {
  let p=0;
  while(p<pageStarts.length-1 &&
    pageStarts[p+1].start<=runeOffset)p++;
  return pageStarts[p].page;
}
/**
 * All possible secret operations are allowed inside a word.
 * A deterministic cipher must give the SAME complete ciphertext word
 * for the SAME plaintext word and machine starting state.
 *
 * @param {number[][]} candidatePlain
 * @param {'none'|'rune'|'word'} phaseClock
 * @param {1|2|3|'both'|'plain'} predecessor
 * @param {'global'|'section'|'page'} scope
 * @param {number[]=} ciphertext
 * @returns {{contradictingStateGroups:number,
 *   minimumOutputWordConflicts:number}}
 */
function witness(candidatePlain,phaseClock,predecessor,scope,ciphertext=original) {
  const cells=new Map();
  let previousPlain=0;
  for(let i=0;i<spans.length;i++) {
    const s=spans[i];
    const phase=phaseClock==='rune' ? s.start%5
      : phaseClock==='word' ? i%5 : 0;
    const prevCipher = Array.from({length:predecessor==='both' ||
      predecessor==='plain' ? 1 : predecessor}, (_,j)=>
      s.start-1-j<0 ? 0 : ciphertext[s.start-1-j]).join('.');
    const previous = predecessor==='plain' ? String(previousPlain)
      : predecessor==='both' ? prevCipher+':'+previousPlain
        : prevCipher;
    const region=scope==='global'?0
      :scope==='section'?wordSections[i]:pageAt(s.start);
    const inputKey=region+'|'+phase+'|'+previous+'|'+candidatePlain[i].join('.');
    const output=ciphertext.slice(s.start,s.start+s.len).join('.');
    let hist=cells.get(inputKey);
    if(!hist) {hist=new Map();cells.set(inputKey,hist);}
    hist.set(output,(hist.get(output)||0)+1);
    previousPlain=candidatePlain[i].at(-1);
  }
  let groups=0,changes=0;
  for(const hist of cells.values()) {
    if(hist.size===1)continue;
    groups++;
    let count=0,highest=0;
    for(const n of hist.values()) {
      count+=n;highest=Math.max(highest,n);
    }
    changes+=count-highest;
  }
  return {contradictingStateGroups:groups,
    minimumOutputWordConflicts:changes};
}
/** @param {number[]} sample @returns {number[]} */
const mod29 = sample => (sample%29+29)%29;
// The positive is full-size, native-GP, reversible, nonlinear-feedback
// in the sense that each output is determined by previous two C values.
function plantedCiphertext(plainWords) {
  const plaintext=plainWords.flat();
  assert.equal(plaintext.length,12956);
  const cipher=[];
  for(let i=0;i<plaintext.length;i++) {
    const prev1=i?cipher[i-1]:0;
    const prev2=i>1?cipher[i-2]:0;
    cipher.push(mod29(
      17*plaintext[i]+11*prev1+7*prev2+5*(i%5)+3));
  }
  const inverse=[];
  for(let i=0;i<cipher.length;i++) {
    const prev1=i?cipher[i-1]:0;
    const prev2=i>1?cipher[i-2]:0;
    inverse.push(mod29(12*(cipher[i]-11*prev1-7*prev2-5*(i%5)-3)));
  }
  assert.deepEqual(inverse,plaintext); // 12*17 ===1 (mod29)
  assert.equal(witness(plainWords,'rune',2,'global',cipher)
    .minimumOutputWordConflicts,0);
}
/** @param {number[]} numbers @returns {object} */
function stats(numbers) {
  return {min:Math.min(...numbers),max:Math.max(...numbers),
    mean:Number((numbers.reduce((s,x)=>s+x,0)/numbers.length).toFixed(4)),
    exactFit:numbers.filter(x=>x===0).length};
}
/** @param {string} name @param {string} text @param {number} initialSeed
 * @param {number} expectedWords */
function measure(name,text,initialSeed,expectedWords) {
  const sourceWords=text.match(/\p{L}+/gu)||[];
  assert.equal(sourceWords.length,expectedWords);
  const byLength=Array.from({length:15},()=>[]);
  for(const w of sourceWords) {
    const encoded=gpEncode(w);
    if(encoded.length<=14)byLength[encoded.length].push(encoded);
  }
  assert(spans.every(s=>byLength[s.len].length>0));
  let seed=initialSeed|0;
  /** @returns {number} */
  function random() {
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return seed>>>0;
  }
  const specs=[];
  for(const phase of ['none','rune','word']) {
    for(const count of [1,2,3]) {
      specs.push({name:phase+'_cipherLag'+count,
        phase,prev:count,scope:'global'});
    }
  }
  for(const phase of ['rune','word']) {
    for(const prev of ['plain','both']) {
      specs.push({name:phase+'_'+prev+'_global',
        phase,prev,scope:'global'});
    }
  }
  for(const scope of ['section','page']) {
    for(const prev of ['plain',1,'both']) {
      specs.push({name:'rune_'+prev+'_'+scope,
        phase:'rune',prev,scope});
    }
  }
  const arrays=Object.fromEntries(specs.map(s=>[s.name,[]]));
  for(let t=0;t<256;t++) {
    const sample=spans.map(sp=>{
      const donor=byLength[sp.len];
      return donor[random()%donor.length];
    });
    if(t===0) plantedCiphertext(sample);
    for(const spec of specs) {
      arrays[spec.name].push(witness(sample,spec.phase,
        spec.prev,spec.scope).minimumOutputWordConflicts);
    }
  }
  const scores=Object.fromEntries(Object.entries(arrays).map(
    ([name,values])=>[name,stats(values)]));
  assert.equal(scores.rune_cipherLag1.exactFit,0);
  assert.equal(scores.rune_cipherLag2.exactFit,
    name==='Shakespeare'?4:0);
  assert.equal(scores.rune_cipherLag3.exactFit,
    name==='Shakespeare'?246:234);
  assert.equal(scores.rune_both_global.exactFit,0);
  return {name,sourceWords:sourceWords.length,samples:256,scores};
}
const sources=[
  measure('Shakespeare',read('resources/control/shakespeare_first300k.txt'),
    0x330112,55407),
  measure('Gibran',read('resources/control/gibran_prophet_58585.txt'),
    0x330161,15733)
];
console.log(JSON.stringify({
  actual:{originalPages:55,originalWords:2896,runes:12956,
    sourceSections:sections},
  invariant:'same plaintext word + same displayed predecessor GP state + same 5-clock phase must produce same complete ciphertext word for any secret deterministic transducer',
  cipherPositive:'full 12956 GP rune source plant, 17P+11*C[-1]+7*C[-2]+5phase+3, inverse 12 and zero state-witness contradictions',
  sources
},null,2));
console.log('PASS: complete original text, 512 donor placements, all-secret word-start witness, actual forward+inverse plant');
