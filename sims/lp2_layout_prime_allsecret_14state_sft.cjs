/**
 * Whole-source equality invariant against any secret GP29 bijection depending
 * on physical page, solved p56 prime-totient residue, and original layout bit.
 * Fourteen unique within-page source mask partitions x three prime clocks.
 * This is a source-selected CONDITIONAL native-English exclusion, not plaintext.
 * Run: node sims/lp2_layout_prime_allsecret_14state_sft.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const master = read('resources/transcriptions/liber_primus_master.txt').replace(/\r\n/g, '\n');
const RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const original = corpus.pages.slice(0,56).flatMap(p => p.indices);
const page = corpus.pages.slice(0,56).flatMap(p => p.indices.map(() => p.page));
assert.equal(original.length, 12956);
/** @typedef {{pa:number,ps:number,ln:number,ls:number,po:number,rp:number,nr:number,nl:number}} Feature */
/** @type {Array<{runes:number[],features:Feature[]}>} */
const sections = [];
let p = 1, ln = 1, pos = 0;
const body = master.substring(master.indexOf('\n\n') + 2).split('§')[0];
for (const part of body.split('$')) {
  let ps = 1, ls = 1;
  const runes = [], features = [];
  for (const ch of part) {
    const idx = RUNES.indexOf(ch);
    if (idx >= 0) {
      pos += 1;
      runes.push(idx);
      features.push({pa:p,ps,ln,ls,po:pos,rp:0,nr:0,nl:0});
    } else if (ch === '%') {
      p += 1; ps += 1; ln = 1; pos = 0;
    } else if (ch === '/') {
      ln += 1; ls += 1; pos = 0;
    }
  }
  if (runes.length) sections.push({runes,features});
}
assert.deepEqual(sections.slice(7,16).flatMap(s => s.runes), original);
const counts = new Map(), lines = new Map(), seen = new Map();
for (const s of sections) for (const f of s.features) {
  counts.set(f.pa, (counts.get(f.pa) || 0) + 1);
  lines.set(f.pa, Math.max(lines.get(f.pa) || 0, f.ln));
}
for (const s of sections) for (const f of s.features) {
  f.rp = (seen.get(f.pa) || 0) + 1;
  seen.set(f.pa,f.rp);
  f.nr = counts.get(f.pa);
  f.nl = lines.get(f.pa);
}
const features = sections.slice(7,16).flatMap(s => s.features);
assert.equal(features.length, 12956);
const par = v => v % 2 === 0 ? 1 : -1;
const m3 = (v,shift) => (v+shift)%3 <=1 ? 1:-1;
/** @type {Record<string,(f:Feature)=>number>} */
const rules = {
  Ln_par:f=>par(f.ln), Ls_par:f=>par(f.ls), Po_par:f=>par(f.po),
  Pg_half_runes:f=>2*f.rp<=f.nr?1:-1,
  Pg_half_lines:f=>2*f.ln<=f.nl?1:-1
};
for (const [p,src] of Object.entries({Ln:'ln',Ls:'ls',Po:'po'})) {
  for (let k=0;k<3;k++) rules[p+'_m3_'+k]=f=>m3(f[src],k);
}
assert.equal(Object.keys(rules).length,14);

// The extra PL_xor mask is a within-page sign relabel of Ln_par.
// An arbitrary alphabet conditioned on page absorbs that relabel exactly.
for(let i=0;i<features.length;i++) {
  assert.equal(par(features[i].pa+features[i].ln),par(features[i].pa)*par(features[i].ln));
}

// Exactly the same native-GP tokenization and 217,644 control runes as
// the previously checked source-state SFT, with original K/Q/V/Z forms.
const alpha = corpus.translit.map((n,i)=>({n:n.toLowerCase(),i}))
  .sort((a,b)=>b.n.length-a.n.length);
const words = read('resources/control/shakespeare_first300k.txt')
  .toLowerCase().replace(/v/g,'u').replace(/[kq]/g,'c').replace(/z/g,'s')
  .match(/[a-z]+/gu) || [];
const native = [];
for(const word of words) for(let i=0;i<word.length;) {
  if(word.startsWith('ing',i)) {native.push(21);i+=3;continue;}
  const token=alpha.find(t=>word.startsWith(t.n,i));
  assert(token,'missing native GP token at '+word.slice(i));
  native.push(token.i); i+=token.n.length;
}
assert.equal(native.length,217644);

const howMany=original.length, limit=20*howMany;
const sieve=new Uint8Array(limit+1).fill(1);
sieve[0]=sieve[1]=0;
for(let x=2;x*x<=limit;x++) if(sieve[x]) for(let y=x*x;y<=limit;y+=x)sieve[y]=0;
const primes=[];
for(let x=2;x<=limit && primes.length<howMany;x++) if(sieve[x])primes.push((x-1)%29);
assert.equal(primes.length,howMany);
const clocks={book:[],page:[],chapter:[]};
let bi=0,ci=0;
const headings=new Set([0,3,8,15,23,27,33,40,54]);
for(const item of corpus.pages.slice(0,56)){
  if(headings.has(item.page))ci=0;
  for(let i=0;i<item.indices.length;i++){
    clocks.book.push(bi++);clocks.page.push(i);clocks.chapter.push(ci++);
  }
}
/**
 * Returns the EXACT collision numerator and denominator invariant under
 * any one-to-one substitution separately at each (page, prime residue, sign).
 * @param {number[]} symbols @param {number[]} clock @param {number[]} signs
 * @returns {{numerator:number,denominator:number,q:number}}
 */
function collision(symbols,clock,signs){
  const totals=new Uint16Array(56*29*2),bins=new Uint16Array(56*29*2*29);
  let numerator=0,denominator=0;
  for(let i=0;i<symbols.length;i++){
    const state=(page[i]*29+primes[clock[i]])*2+(signs[i]===1?1:0);
    numerator+=2*bins[state*29+symbols[i]];
    denominator+=2*totals[state];
    bins[state*29+symbols[i]]++;totals[state]++;
  }
  return {numerator,denominator,q:numerator/denominator};
}
const mod=x=>(x%29+29)%29;
const inv=Array(29).fill(0);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
assert(inv.slice(1).every(x=>x>0));
const NCONTROLS=150;
const stride=Math.floor((native.length-original.length)/(NCONTROLS-1));
let worstOriginal={q:0},closestNative={q:1},minGap=1,checked=0;
for(const [rname,fn] of Object.entries(rules)){
  const signs=features.map(fn);
  for(const [clockName,clock] of Object.entries(clocks)){
    const obs=collision(original,clock,signs);
    // These exact counts are independently computed with the physical master;
    // freeze two nontrivial original cases against reading-layout drift.
    if(rname==='Ln_par'&&clockName==='book')
      assert.deepEqual([obs.numerator,obs.denominator],[1758,52242]);
    if(rname==='Po_par'&&clockName==='page')
      assert.deepEqual([obs.numerator,obs.denominator],[1790,52114]);
    const rates=[];
    for(let j=0;j<NCONTROLS;j++)
      rates.push(collision(native.slice(j*stride,j*stride+original.length),clock,signs).q);
    rates.sort((a,b)=>a-b);
    assert(obs.q<rates[0],rname+' '+clockName+' original is not below native baseline');
    assert(obs.q<0.036 && rates[0]>0.054,'native-vs-original discrimination weakened');
    const gap=rates[0]-obs.q;
    if(gap<minGap)minGap=gap;
    if(obs.q>worstOriginal.q)worstOriginal={rule:rname,clock:clockName,q:obs.q};
    if(rates[0]<closestNative.q)closestNative={rule:rname,clock:clockName,q:rates[0]};
    // Fully invertible secret alphabet that varies independently with
    // all three state dimensions; verify every native symbol and the invariant.
    const text=native.slice(0,original.length),cipher=[];
    for(let i=0;i<text.length;i++){
      const residue=primes[clock[i]],side=signs[i]===1?1:0,pg=page[i];
      const a=1+(7*pg+11*residue+13*side+3)%28;
      const b=(17*pg+19*residue+23*side+5)%29;
      const c=mod(a*text[i]+b);
      cipher.push(c);
      assert.equal(mod((c-b)*inv[a]),text[i]);
    }
    const clean=collision(text,clock,signs),enc=collision(cipher,clock,signs);
    assert.deepEqual([enc.numerator,enc.denominator],[clean.numerator,clean.denominator]);
    checked++;
    console.log(JSON.stringify({rule:rname,clock:clockName,original:obs,
      native_min:rates[0],native_median:rates[75],native_max:rates.at(-1),
      matched_natives_at_or_below_original:0,planted_inversion_exact:true}));
  }
}
assert.equal(checked,42);
console.log(JSON.stringify({checked,matchedNativeWindows:150,
  worstOriginal,closestNative,minGap,
  decision:'No LP2 native GP-English under any stationary 29! state permutation indexed by page/prime/layout bit; changing clock or register remains possible.'}));
