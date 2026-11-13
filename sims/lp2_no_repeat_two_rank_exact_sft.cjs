'use strict';
/**
 * Exact two-rank capacity of the predecessor-exclusion GP29 cipher on original
 * LP2 ciphertext, allowing any hidden 29-rune ordering and two rank labels.
 *
 * SFT: node sims/lp2_no_repeat_two_rank_exact_sft.cjs
 * Node.js 22, built-in libraries only, no writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
const Q = corpus.runes.length;
assert.equal(Q, 29);

/**
 * @param {Array<{indices:number[]}>} sourcePages
 * @param {number} q
 * @returns {Int32Array[]}
 */
function transitions(sourcePages, q = Q) {
  const T = Array.from({length:q}, () => new Int32Array(q));
  for (const page of sourcePages) {
    for (let i = 1; i < page.indices.length; i++) {
      const s = page.indices[i - 1];
      const c = page.indices[i];
      if (s !== c) T[s][c]++;
    }
  }
  return T;
}

/**
 * For rank positions r1<r2 of a 29-symbol ordering, the two adjacent
 * pairs in the source alphabet either share their middle rune (3 endpoints),
 * or are disjoint (4 endpoints). Each remaining predecessor can be placed
 * in an independently optimal region: 2 choices for touching pairs, 3
 * choices for disjoint pairs. The regional choices are jointly attainable.
 *
 * @param {Int32Array[]} T
 * @returns {{maximum:number, touching:number, kind:string, symbols:number[], order:number[], ranks:number[]}}
 */
function twoRankCapacity(T) {
  const q = T.length;
  const U = new Int32Array(q*q*q);
  for (let s=0;s<q;s++) for (let x=0;x<q;x++) for (let y=0;y<q;y++) {
    U[(s*q+x)*q+y] = T[s][x] + T[s][y];
  }
  let best=-1, touching=-1, kind='', symbols=[];
  for (let a=0;a<q;a++) for (let b=0;b<q;b++) if (a!==b) {
    for (let c=0;c<q;c++) if (c!==a && c!==b) {
      let v=T[a][b]+T[a][c]+T[b][a]+T[b][c]+T[c][a]+T[c][b];
      for (let s=0;s<q;s++) if (s!==a && s!==b && s!==c) {
        v+=Math.max(U[(s*q+b)*q+c],U[(s*q+a)*q+b]);
      }
      if (v>touching) touching=v;
      if (v>best) {best=v;kind='touching';symbols=[a,b,c];}
    }
  }
  for (let a=0;a<q;a++) for (let b=0;b<q;b++) if (a!==b) {
    for (let c=0;c<q;c++) if (c!==a && c!==b) {
      for (let d=0;d<q;d++) if (d!==a && d!==b && d!==c) {
        let v=T[a][b]+T[a][d]+T[b][a]+T[b][d]
          +T[c][a]+T[c][d]+T[d][a]+T[d][c];
        for (let s=0;s<q;s++) if (s!==a && s!==b && s!==c && s!==d) {
          v+=Math.max(U[(s*q+b)*q+d],U[(s*q+a)*q+d],
            U[(s*q+a)*q+c]);
        }
        if (v>best) {best=v;kind='disjoint';symbols=[a,b,c,d];}
      }
    }
  }
  const [a,b,c,d]=symbols;
  const before=[],middle=[],after=[];
  for (let s=0;s<q;s++) {
    if (symbols.includes(s)) continue;
    if (kind==='touching') {
      if (T[s][b]+T[s][c]>=T[s][a]+T[s][b]) before.push(s);
      else after.push(s);
    } else {
      const v0=T[s][b]+T[s][d];
      const v1=T[s][a]+T[s][d];
      const v2=T[s][a]+T[s][c];
      if (v0>=v1 && v0>=v2) before.push(s);
      else if (v1>=v2) middle.push(s);
      else after.push(s);
    }
  }
  const order=kind==='touching' ?
    [...before,a,b,c,...after] :
    [...before,a,b,...middle,c,d,...after];
  const ranks=kind==='touching' ?
    [before.length,before.length+1] :
    [before.length,before.length+2+middle.length];
  assert.equal(order.length,q);
  assert.equal(new Set(order).size,q);
  const position=new Int32Array(q);
  order.forEach((r,i)=>{position[r]=i;});
  const histogram=new Int32Array(q-1);
  for (let s=0;s<q;s++) for (let t=0;t<q;t++) if (s!==t) {
    const r=position[t]-Number(position[s]<position[t]);
    histogram[r]+=T[s][t];
  }
  assert.equal(histogram[ranks[0]]+histogram[ranks[1]],best);
  // Complete inverse, including every possible predecessor and rank.
  for (let s=0;s<q;s++) for (let r=0;r<q-1;r++) {
    const t=order[r+Number(r>=position[s])];
    assert.notEqual(t,s);
    assert.equal(position[t]-Number(position[s]<position[t]),r);
  }
  return {maximum:best,touching,kind,symbols,order,ranks};
}

/**
 * Exhaustive permutation oracle for a tiny alphabet, independent of formula.
 * @param {Int32Array[]} T
 * @returns {number}
 */
function bruteTwo(T) {
  const q=T.length, order=Array.from({length:q},(_,i)=>i);
  let best=0;
  /** @param {number} k */
  function permute(k) {
    if (k===q) {
      const pos=new Int32Array(q),h=new Int32Array(q-1);
      order.forEach((x,i)=>{pos[x]=i;});
      for (let s=0;s<q;s++) for (let c=0;c<q;c++) if (s!==c) {
        h[pos[c]-Number(pos[s]<pos[c])]+=T[s][c];
      }
      for (let a=0;a<q-1;a++) for (let b=a+1;b<q-1;b++) {
        best=Math.max(best,h[a]+h[b]);
      }
      return;
    }
    for (let i=k;i<q;i++) {
      [order[k],order[i]]=[order[i],order[k]];
      permute(k+1);
      [order[k],order[i]]=[order[i],order[k]];
    }
  }
  permute(0);
  return best;
}

const toy=[[0,3,5,2,8],[4,0,1,7,2],[9,6,0,3,4],
  [2,8,5,0,7],[1,4,9,6,0]].map(a=>Int32Array.from(a));
assert.equal(bruteTwo(toy),61);
assert.equal(twoRankCapacity(toy).maximum,61); // Prior faulty bound said 58.
let seed=0x33011337;
/** @returns {number} */
function rnd() {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
for (const [q,n] of [[5,24],[6,6]]) {
  for (let sample=0;sample<n;sample++) {
    const T=Array.from({length:q},()=>Int32Array.from(
      {length:q},()=>rnd()%17));
    for (let s=0;s<q;s++) T[s][s]=0;
    assert.equal(twoRankCapacity(T).maximum,bruteTwo(T));
  }
}

const count=pages.reduce((n,p)=>n+p.indices.length,0);
const T=transitions(pages);
const eligible=T.reduce((n,row)=>n+row.reduce((a,b)=>a+b,0),0);
const skips=[];
let offset=0;
for (const p of pages) {
  for (let i=0;i<p.indices.length;i++) {
    if (i===0 || p.indices[i]===p.indices[i-1]) skips.push(offset+i);
  }
  offset+=p.indices.length;
}
assert.equal(count,12956);
assert.equal(eligible,12815);
assert.equal(skips.length,141);
assert.equal(pages.filter(p=>p.indices.length>0).length,55);
const global=twoRankCapacity(T);
assert.equal(global.maximum,1118);
const cuts=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapters=cuts.map(([lo,hi])=>twoRankCapacity(transitions(
  pages.filter(p=>p.page>=lo && p.page<=hi))).maximum);
assert.deepEqual(chapters,[98,146,190,210,122,161,187,307,51]);
assert.equal(chapters.reduce((a,b)=>a+b,0),1472);
const individual=pages.filter(p=>p.indices.length>0).map(p=>({
  page:p.page,maximum:twoRankCapacity(transitions([p])).maximum
}));
assert.equal(individual.reduce((n,p)=>n+p.maximum,0),2379);

// Longest-token GP29 transliteration, precisely matching the project's
// original English-control tokenizer; no language model is optimized.
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} source @returns {Uint8Array} */
function gp(source, sourceCalibration=false, consonantsOnly=false) {
  const words=source.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[];
  const out=[];
  for (const originalWord of words) {
    const word=consonantsOnly ? originalWord.replace(/[AEIOU]/g,'') : originalWord;
    for(let i=0;i<word.length;) {
    if (sourceCalibration && !consonantsOnly && word.startsWith('ING',i)) {
      out.push(21);i+=3;continue;
    }
    if (sourceCalibration && !consonantsOnly && word.startsWith('IO',i)) {
      out.push(27);i+=2;continue;
    }
    const x=tokens.find(t=>word.startsWith(t.token,i));
    assert(x, 'Invalid GP token');
    out.push(x.index);
    i+=x.token.length;
    }
  }
  return Uint8Array.from(out);
}

/**
 * Minimum sum of the two most abundant plaintext runes across every
 * original-length control window, excluding exactly the 141 original
 * unconstrained positions. The top two letters may change per window.
 * @param {Uint8Array} data
 * @returns {{minimum:number,at:number,topTwo:string[]}}
 */
function minTopTwo(data) {
  const h=new Int32Array(Q),remove=new Int32Array(Q);
  for (let i=0;i<count;i++) h[data[i]]++;
  let minimum=Infinity,at=-1,topTwo=[];
  for (let k=0;k<=data.length-count;k++) {
    if(k>0) {h[data[k-1]]--;h[data[k+count-1]]++;}
    remove.fill(0);
    for (const p of skips) remove[data[k+p]]++;
    let f=-1,g=-1,first=-1,second=-1;
    for (let j=0;j<Q;j++) {
      const value=h[j]-remove[j];
      if(value>f) {g=f;second=first;f=value;first=j;}
      else if(value>g) {g=value;second=j;}
    }
    if(f+g<minimum) {
      minimum=f+g;at=k;
      topTwo=[corpus.translit[first],corpus.translit[second]];
    }
  }
  return {minimum,at,topTwo};
}
const controls=[
  ['resources/control/gibran_prophet_58585.txt',63114,2517,36540,62492,2510,36202,37646,2843,21331],
  ['resources/control/shakespeare_first300k.txt',218800,2418,192716,217106,2408,191622,131385,2636,108781],
  ['resources/control/emerson_essays_2944.txt',324630,2479,299973,321327,2477,195195,193703,2967,100812]
];
const correctedScores=[];
const consonantScores=[];
const controlScores=controls.map(([file,expectedLength,expectedMin,expectedAt,
    correctedLength,correctedMin,correctedAt,
    consonantLength,consonantMin,consonantAt])=>{
  const source=read(file),native=gp(source),score=minTopTwo(native);
  const corrected=gp(source,true),spellingScore=minTopTwo(corrected);
  const consonants=gp(source,false,true),consonantScore=minTopTwo(consonants);
  assert.equal(consonants.length,consonantLength);
  assert.equal(consonantScore.minimum,consonantMin);
  assert.equal(consonantScore.at,consonantAt);
  assert(consonantScore.minimum>2379);
  consonantScores.push({file,windows:consonants.length-count+1,...consonantScore});
  assert.equal(corrected.length,correctedLength);
  assert.equal(spellingScore.minimum,correctedMin);
  assert.equal(spellingScore.at,correctedAt);
  assert(spellingScore.minimum>2379);
  correctedScores.push({file,windows:corrected.length-count+1,...spellingScore});
  assert.equal(native.length,expectedLength);
  assert.equal(score.minimum,expectedMin);
  assert.equal(score.at,expectedAt);
  assert(score.minimum>2379);
  return {file,windows:native.length-count+1,...score};
});
assert.equal(controlScores.reduce((a,b)=>a+b.windows,0),567679);
assert.equal(correctedScores.reduce((a,b)=>a+b.windows,0),562060);
assert.equal(consonantScores.reduce((a,b)=>a+b.windows,0),323869);
// The pinned Latin file is already exact GP29 indices as 0..9,A..S. Keep
// its original per-word segmentation; exclude only explicit comment lines.
const latinSource=read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).filter(line=>line && !line.trimStart().startsWith('#'))
  .join('');
const digits='0123456789ABCDEFGHIJKLMNOPQRS';
const latinGP=Uint8Array.from([...latinSource].map(glyph=>{
  const index=digits.indexOf(glyph);
  assert(index>=0 && index<Q);
  return index;
}));
assert.equal(latinGP.length,204802);
const latinScore=minTopTwo(latinGP);
assert.equal(latinScore.minimum,2793);
assert.equal(latinScore.at,153211);
assert(latinScore.minimum>2379);
const latinResult={file:'resources/control/latin-vulgate-gp-wholewords.txt',
  windows:latinGP.length-count+1,...latinScore};
assert.equal(latinResult.windows,191847);
assert.equal(567679+562060+323869+latinResult.windows,1645455);
console.log(JSON.stringify({
  input:{pages:56,runebearing:55,runes:count,eligible,free:skips.length},
  globalMaximum:global.maximum,
  globalAttainingPair:global.symbols.map(x=>corpus.translit[x]),
  chapterMaxima:chapters,chapterwiseMaximum:1472,
  pagewiseMaximum:2379,individual,controlScores,correctedScores,
  consonantScores,latinResult,
  exhaustiveOracle:{toy:61,seed:'0x33011337',q5:24,q6:6}
},null,2));
