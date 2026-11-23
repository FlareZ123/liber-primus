"use strict";

/**
 * An all-key, two-class, lossless GP29 predecessor exclusion cipher with
 * original visible 10-dot/13-dot punctuation events switching the literal
 * escape rune. The two escapes can be independently any of the 29 GP runes.
 *
 * The 13-dot class alone covers 83/86 original repeated-cipher events and
 * ALL 23 word-initial repeated-cipher events. Derive a word-length-matched,
 * postselection-corrected all-29-rune native-English necessary-condition gate
 * for all 29^2 two-class escape assignments without choosing dot-value keys.
 *
 * This is an analyst receiver with no original Cicada-authenticated opcode.
 * Windows Node22, read-only, no external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} file @returns {string} */
function read(file){return fs.readFileSync(path.join(root,file),"utf8")}
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages=corpus.pages.filter(x=>x.page<=55&&x.indices.length);
const tape=pages.flatMap(p=>p.indices);
assert.equal(tape.length,12956);
const originalEvents=[];
let offset=0;
for(const p of pages) {
  const visible=ink.pages.find(q=>q.page===p.page);
  for(const [at,dots] of visible?.large_punctuation||[])
    originalEvents.push({at:offset+at,dots});
  offset+=p.indices.length;
}
assert.equal(originalEvents.length,31);
const switches=new Map(originalEvents.map(x=>[x.at,x.dots]));
assert.equal(switches.size,29);
const markClass=[];
let current=13;
for(let i=0;i<tape.length;i++) {
  if(switches.has(i))current=switches.get(i);
  markClass.push(current);
}
assert.ok(markClass.every(x=>x===10||x===13));
assert.equal(markClass.filter(x=>x===10).length,1248);
assert.equal(markClass.filter(x=>x===13).length,11708);

const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
const source=read("resources/transcriptions/lp2-image-corrected.txt")
  .split("%").slice(0,55).join("%");
const sourceWords=[];
let length=0,pos=0;
for(const ch of source) {
  if(glyph.has(ch)){length++;pos++}
  else if(ch==="%"||ch==="/"||/\s/u.test(ch)){}
  else if(length) {
    const begin=pos-length;
    sourceWords.push({length,
      initial13:markClass[begin]===13,
      mask:Array.from({length},(_,j)=>markClass[begin+j]===13),
      begin});
    length=0;
  }
}
if(length) {
  const begin=pos-length;
  sourceWords.push({length,initial13:markClass[begin]===13,
    mask:Array.from({length},(_,j)=>markClass[begin+j]===13),begin});
}
assert.equal(sourceWords.length,2896);
assert.equal(pos,12956);
let doublets10=0,doublets13=0,start10=0,start13=0;
for(let i=1;i<tape.length;i++) {
  if(tape[i]!==tape[i-1])continue;
  if(markClass[i]===10)doublets10++;else doublets13++;
}
for(const w of sourceWords) {
  if(w.begin>0 && tape[w.begin]===tape[w.begin-1]) {
    if(w.initial13)start13++;else start10++;
  }
}
assert.deepEqual([doublets10,doublets13,start10,start13],[3,83,0,23]);

// A legitimate fully reversible 29-letter source-dotclass escape mechanism,
// unlike 28-symbol reductions with missing-repeat side channels.
/** @param {number[]} plain @param {number} escape10 @param {number} escape13 */
function encode(plain,escape10,escape13) {
  let previous=0;
  return plain.map((p,i)=>{
    const e=markClass[i]===13?escape13:escape10;
    const r=p<e?p:p-1;
    const cur=p===e?previous:r+(r>=previous?1:0);
    previous=cur;
    return cur;
  });
}
/** @param {number[]} cipher @param {number} escape10 @param {number} escape13 */
function decode(cipher,escape10,escape13) {
  let previous=0;
  return cipher.map((c,i)=>{
    const e=markClass[i]===13?escape13:escape10;
    const repeated=c===previous;
    const r=c-(c>previous?1:0);
    const p=repeated?e:r+(r>=e?1:0);
    previous=c;
    return p;
  });
}

const translit=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]|null} */
function gpWord(w) {
  const s=w.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG");
  const out=[];
  for(let i=0;i<s.length;) {
    const x=translit.find(z=>s.startsWith(z.s,i));
    if(!x)return null;
    out.push(x.i);i+=x.s.length;
  }
  return out;
}
/** @param {string} raw @returns {number[][]} */
function native(raw) {
  return (raw.match(/[A-Za-z]+/g)||[]).map(gpWord).filter(Boolean);
}
/**
 * Exact Poisson-binomial one-sided tail for words with class13 first rune.
 * @param {number[]} probs @param {number} value
 */
function startTail(probs,value) {
  const dp=new Float64Array(value+1);
  dp[0]=1;
  for(const p of probs)
    for(let i=value;i>=0;i--)
      dp[i]=dp[i]*(1-p)+(i?dp[i-1]*p:0);
  const expected=probs.reduce((a,b)=>a+b,0);
  const cum=dp.reduce((a,b)=>a+b,0);
  return {expected,tail:expected>=value?cum:
    Math.max(0,1-(cum-dp[value]))};
}
/**
 * Exactly match source word rune lengths and class13 within-word positions.
 * A reference word is sampled with replacement within each exact GP length.
 * @param {number[][]} referenceWords
 */
function evaluate(referenceWords) {
  const pool=new Map();
  for(const w of referenceWords) {
    if(!pool.has(w.length))pool.set(w.length,[]);
    pool.get(w.length).push(w);
  }
  for(const w of sourceWords)assert.ok(pool.has(w.length));

  const firstLen=new Map();
  for(const w of sourceWords)if(w.initial13)
    firstLen.set(w.length,(firstLen.get(w.length)||0)+1);

  const maskGroups=new Map();
  for(const w of sourceWords) {
    const id=w.length+":"+w.mask.map(x=>x?1:0).join("");
    const old=maskGroups.get(id);
    if(old)old.count++;
    else maskGroups.set(id,{length:w.length,mask:w.mask,count:1});
  }
  const maskProfiles=[];
  for(const shape of maskGroups.values()) {
    const items=pool.get(shape.length),F=Array.from({length:29},
      ()=>new Float64Array(shape.length+1));
    for(const w of items) {
      const frequency=new Uint8Array(29);
      for(let p=0;p<w.length;p++)
        if(shape.mask[p])frequency[w[p]]++;
      for(let letter=0;letter<29;letter++)
        F[letter][frequency[letter]]++;
    }
    const probabilities=F.map(arr=>Array.from(arr,x=>x/items.length));
    maskProfiles.push({...shape,probabilities});
  }
  const candidates=[];
  for(let e=0;e<29;e++) {
    const first=[];
    for(const [length,count] of firstLen) {
      const poolLength=pool.get(length);
      const p=poolLength.filter(w=>w[0]===e).length/poolLength.length;
      for(let i=0;i<count;i++)first.push(p);
    }
    const st=startTail(first,23);
    let mean=0;
    let dp=new Float64Array(84);
    dp[0]=1;
    for(const shape of maskProfiles) {
      const probs=shape.probabilities[e];
      mean+=shape.count*probs.reduce((sum,p,n)=>sum+p*n,0);
      for(let iter=0;iter<shape.count;iter++) {
        const next=new Float64Array(84);
        for(let i=0;i<84;i++) {
          if(!dp[i])continue;
          for(let j=0;j<probs.length&&i+j<84;j++)
            next[i+j]+=dp[i]*probs[j];
        }
        dp=next;
      }
    }
    const cumulative=dp.reduce((a,b)=>a+b,0);
    const totalTail=mean>=83?cumulative:
      Math.max(0,1-(cumulative-dp[83]));
    candidates.push({e:corpus.translit[e],startExpected:st.expected,
      totalExpected:mean,startTail:st.tail,totalTail,
      jointUpper:Math.min(st.tail,totalTail)});
  }
  candidates.sort((a,b)=>b.jointUpper-a.jointUpper);
  return {referenceWords:referenceWords.length,
    wordTemplates:sourceWords.length,sourceMaskGroups:maskGroups.size,
    top:candidates.slice(0,4),
    all29Possible13dotEscapesUnionUpper:
      candidates.reduce((s,x)=>s+x.jointUpper,0)};
}

const donorFiles=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"]
];
const results=[];
for(const [name,file] of donorFiles) {
  const control=native(read(file));
  const sample=control.flat().slice(2000,2000+tape.length);
  assert.equal(sample.length,tape.length);
  for(const [escape10,escape13] of [[0,28],[7,5],[25,13]]) {
    const cipher=encode(sample,escape10,escape13);
    assert.deepEqual(decode(cipher,escape10,escape13),sample);
  }
  const report=evaluate(control);
  assert.ok(report.all29Possible13dotEscapesUnionUpper<0.001);
  results.push({name,...report});
}
console.log(JSON.stringify({
  hypothesis:"Any fixed literal GP29 escape for each authentic 10/13-dot class",
  sourceRunes:12956,printedWords:2896,
  dotEvents:31,distinctEventPositions:29,
  visibleClassCounts:{class10:1248,class13:11708},
  originalCipherRepeatCounts:{class10:3,class13:83,
    class10WordStarts:0,class13WordStarts:23},
  allSecretTwoClassDecision:results,
  limit:"Only ordinary native-GP English, preserved printed word positions and a single literal escape per dot class; switching escape per symbol or other nonliteral registers remain possible"
},null,2));
console.log("PASS: original all29^2 literal dotclass escapes and exact native GP forward/inverse plants");
