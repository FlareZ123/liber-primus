'use strict';

/**
 * LP2 p53 red 51-rune passage: invert an affine second-order mod-29
 * keystream from the source-defined eleven-rune dictionary anchor.
 *
 * K[t+2] = a*K[t+1] + b*K[t] + c (mod 29), b != 0.
 *
 * Complete for at most two altered anchor ciphertext symbols, provided the
 * true GP plaintext anchor occurs in the committed English frequency lexicon.
 * Every 4-position window can be corrected at at most one position; the
 * 11-position anchor with at most two errors has such a window.
 *
 * Execute: node sims/red_verse_second_order_key.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const red = JSON.parse(read('resources/liber-primus/lp2-page53-red-span.json'));
const map = new Map(gp.runes.map((r, i) => [r, i]));
const translit = new Map(gp.translit.map((s, i) => [s, i]));
const mod = n => (n % 29 + 29) % 29;
const inverse = new Int8Array(29);
for (let i = 1; i < 29; i++) {
  for (let j = 1; j < 29; j++) if (i * j % 29 === 1) inverse[i] = j;
}
const MAX_ERRORS = 2;

/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = translit.get(s.slice(i, i+2));
    if (pair !== undefined) { out.push(pair); i += 2; continue; }
    const one = translit.get(s[i]);
    if (one === undefined) return [];
    out.push(one);
    i++;
  }
  return out;
}

/** @returns {{byCode:Map<string, {english:string,freq:number}>, anchors:Array<{english:string,freq:number,values:number[]}>}} */
function dictionary() {
  const byCode = new Map();
  const anchors = [];
  for (const line of read('resources/control/english_wordfreq_textblob.txt').split('\n')) {
    const match = /^([a-z]+)\s+(\d+)\s*$/.exec(line.trim());
    if (!match || /q(?!u)/u.test(match[1])) continue;
    const values = encode(match[1]);
    const key = values.join(',');
    const freq = Number(match[2]);
    const old = byCode.get(key);
    if (!old || old.freq < freq) byCode.set(key, {english:match[1],freq});
  }
  for (const [key, value] of byCode) {
    const values = key.split(',').map(Number);
    if (values.length === 11) anchors.push({...value,values});
  }
  assert.ok(anchors.length > 1200 && byCode.size > 28000);
  return {byCode,anchors};
}

function source() {
  assert.equal(red.lp2_page, 53);
  const cipher = [...red.red_text.runes].map(x => map.get(x));
  const lengths = red.red_text.word_lengths;
  const page = gp.pages.find(p => p.page === 53);
  assert.ok(page && cipher.every(x => x !== undefined));
  assert.deepEqual(cipher, page.indices.slice(128,179));
  assert.equal(cipher.length,51);
  assert.equal(lengths.reduce((s,x)=>s+x,0),51);
  assert.deepEqual(lengths,[5,4,4,11,2,3,2,6,5,5,2,2]);
  const start = lengths.slice(0,3).reduce((s,x)=>s+x,0);
  assert.equal(start,13);
  assert.ok(!cipher.slice(start,start+11).includes(0),
    'The key anchor cannot contain an interrupter under this model');
  return {cipher,lengths,start};
}

/**
 * Enumerate every (a,b,c) with b nonzero that passes through four
 * consecutive key samples. An observation may be corrected in one
 * of the four positions. The search does not use the other seven samples
 * to fit parameters.
 *
 * @param {number[]} observed 11 implied key symbols from one anchor word.
 * @param {(hit:{a:number,b:number,c:number,keys:number[],errors:number})=>void} accept
 */
function infer(observed, accept) {
  const keys = new Int8Array(11);
  const seen = new Set();
  for (let start=0; start<=7; start++) {
    for (let alter=-1; alter<4; alter++) {
      const choices = alter<0 ? [-1] : Array.from({length:29},(_,i)=>i)
        .filter(v=>v!==observed[start+alter]);
      for (const replacement of choices) {
        const v=observed.slice(start,start+4);
        if(alter>=0)v[alter]=replacement;
        const [k0,k1,k2,k3]=v;
        const d0=mod(k1-k0),d1=mod(k2-k1),d=mod(k3-k2);
        for(let b=1;b<29;b++) {
          if(d1===0&&mod(b*d0)!==d)continue;
          const options=d1===0 ? null : [mod((d-b*d0)*inverse[d1])];
          const nOptions=options ? 1 : 29;
          for(let ai=0;ai<nOptions;ai++) {
            const a=options ? options[ai] : ai;
            const c=mod(k2-a*k1-b*k0);
            keys[start]=k0;
            keys[start+1]=k1;
            for(let t=start+2;t<11;t++)
              keys[t]=mod(a*keys[t-1]+b*keys[t-2]+c);
            for(let t=start-1;t>=0;t--)
              keys[t]=mod((keys[t+2]-a*keys[t+1]-c)*inverse[b]);
            let errors=0;
            for(let t=0;t<11;t++){
              if(keys[t]!==observed[t]&&++errors>MAX_ERRORS)break;
            }
            if(errors>MAX_ERRORS)continue;
            const label=[a,b,c,keys[0],keys[1]].join(',');
            if(seen.has(label))continue;
            seen.add(label);
            accept({a,b,c,keys:Array.from(keys),errors});
          }
        }
      }
    }
  }
}

/** Expand an anchor-derived key, including the backward inverse b^-1. */
function keyStream(hit,start,length) {
  const k=new Int8Array(length);
  k.set(hit.keys,start);
  for(let t=start+11;t<length;t++)
    k[t]=mod(hit.a*k[t-1]+hit.b*k[t-2]+hit.c);
  for(let t=start-1;t>=0;t--)
    k[t]=mod((k[t+2]-hit.a*k[t+1]-hit.c)*inverse[hit.b]);
  return k;
}

/** @param {number[]} cipher @param {number[]} lengths @param {Map<string,{english:string,freq:number}>} words */
function decode(hit,cipher,lengths,words,flip,skipF) {
  const phase=[];
  let current=0;
  for(const x of cipher) {
    phase.push(current);
    if(!(skipF&&x===0))current++;
  }
  const anchorStart=phase[13];
  const clock=keyStream(hit,anchorStart,current);
  let offset=0,score=0,longWords=0,matched=0;
  const text=[];
  for(let w=0;w<lengths.length;w++){
    const values=[];
    for(let z=0;z<lengths[w];z++){
      const i=offset+z, c=cipher[i];
      values.push(skipF&&c===0?0:mod((flip?28-c:c)-clock[phase[i]]));
    }
    const found=words.get(values.join(','));
    text.push(found?found.english:values.map(x=>gp.translit[x]).join('').toLowerCase());
    if(w!==3) {
      if(found) {matched++;if(values.length>=3)longWords++;
        score+=Math.log1p(found.freq)+0.45*values.length;}
      else if(values.length>=3)score-=5;
    }
    offset+=lengths[w];
  }
  return {score,matched,longWords,text:text.join(' '),flip,skipF};
}

/** @param {number[]} cipher */
function orientations(cipher,lengths) {
  const words=[];
  let p=0;
  for(const length of lengths){words.push(cipher.slice(p,p+length));p+=length;}
  return [
    {name:'printed',cipher:words.flat(),lengths},
    {name:'reverse-words',cipher:words.slice().reverse().flat(),lengths:lengths.slice().reverse()},
    {name:'reverse-runes',cipher:words.slice().reverse().map(w=>w.slice().reverse()).flat(),lengths:lengths.slice().reverse()},
    {name:'mirror-words',cipher:words.map(w=>w.slice().reverse()).flat(),lengths}
  ];
}

function main() {
  const {cipher,lengths} = source();
  const dict=dictionary();
  const output=[];
  for(const orientation of orientations(cipher,lengths)) {
    const start=orientation.lengths.indexOf(11)>=0
      ? orientation.lengths.slice(0,orientation.lengths.indexOf(11)).reduce((a,b)=>a+b,0) : -1;
    assert.ok(start>=0);
    const anchor=orientation.cipher.slice(start,start+11);
    for(const flip of [false,true]) {
      const actual=anchor.map(c=>flip?28-c:c);
      const results={orientation:orientation.name,flip,keysByErrors:[0,0,0],
        anchoredWordsWithCandidates:0,top:[]};
      for(const candidate of dict.anchors) {
        const observed=actual.map((c,i)=>mod(c-candidate.values[i]));
        let count=0;
        infer(observed,hit=>{
          count++;
          results.keysByErrors[hit.errors]++;
          for(const skipF of [false,true]) {
            // Skip-F changes phase after an uninterpreted F rune. No F exists
            // in the fixed anchor, but a reversed reading may put F before it.
            const current=orientation.cipher;
            if(skipF&&current.slice(start,start+11).includes(0))continue;
            // Correctly convert the anchor-relative key to full 51-rune phase:
            // when F is skipped before the anchor, the anchor start is shorter.
            const phaseStart=current.slice(0,start).filter(c=>!(skipF&&c===0)).length;
            const fullHit={...hit,phaseStart};
            const k=keyStream(fullHit,phaseStart,
              current.filter(c=>!(skipF&&c===0)).length);
            let phase=0,offset=0,score=0,matched=0,longWords=0;
            const texts=[];
            for(let w=0;w<orientation.lengths.length;w++){
              const values=[];
              for(let z=0;z<orientation.lengths[w];z++) {
                const c=current[offset+z];
                values.push(skipF&&c===0?0:mod((flip?28-c:c)-k[phase]));
                if(!(skipF&&c===0))phase++;
              }
              const found=dict.byCode.get(values.join(','));
              texts.push(found?found.english:values.map(x=>gp.translit[x]).join('').toLowerCase());
              if(offset!==start){
                if(found){matched++;if(values.length>=3)longWords++;
                  score+=Math.log1p(found.freq)+0.45*values.length;}
                else if(values.length>=3)score-=5;
              }
              offset+=orientation.lengths[w];
            }
            results.top.push({score,longWords,matched,anchor:candidate.english,
              anchorErrors:hit.errors,a:hit.a,b:hit.b,c:hit.c,
              firstKey:hit.keys.slice(0,4),skipF,
              text:texts.join(' ')});
            results.top.sort((x,y)=>y.score-x.score||y.longWords-x.longWords);
            if(results.top.length>5)results.top.pop();
          }
        });
        if(count)results.anchoredWordsWithCandidates++;
      }
      output.push(results);
    }
  }
  console.log(JSON.stringify({
    hypothesis:'Second-order affine mod29 additive key, b!=0, with <=2 altered runes in the 11-rune source-defined anchor.',
    source:'LP2 physical p53, 70.jpg, exact 51-rune red span',
    dictionaryAnchors:dict.anchors.length,
    cases:output,
    status:'Candidates are not decrypted plaintext without sustained independent decoding and forward re-encryption'
  },null,2));
}
if(require.main===module) main();
module.exports={encode,dictionary,source,infer,keyStream};
