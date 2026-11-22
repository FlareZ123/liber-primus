'use strict';

/**
 * SFT: Cicada-selected 2014 Gödel, Escher, Bach full-text fingerprint under
 * arbitrary complete-word reordering within an LP2 illustrated chapter/page.
 *
 * Full public source is fetched by immutable Git blob at test time; only
 * derived lengths, positions and necessary-condition decisions are printed.
 * No copyrighted prose is redistributed or written to disk.
 * Windows 11 / Node.js 22, one file, no npm packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {parseLP2Words, physicalLP2Page} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const transcript = read('resources/lp2-transcription.txt');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parsed = parseLP2Words(transcript);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
const runeIndex = new Map(corpus.runes.map((r,i) => [r,i]));
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];

/** @param {number[]} a @returns {Int32Array} */
function histogram(a) {
  const out = new Int32Array(32);
  for (const n of a) { assert.ok(n >= 1 && n <= 31); out[n]++; }
  return out;
}

/**
 * Exhaustive word-order-invariant length-bag scan, with all exact source
 * positions preserved for separate glyph-pattern inspection.
 *
 * @param {number[]} source
 * @param {number[]} target
 */
function scan(source, target) {
  const n = target.length;
  if (source.length < n) throw Error('source too short');
  const h = histogram(source.slice(0,n));
  const t = histogram(target);
  let d = 0, min = 0, first = 0, exact = [];
  for (let k=0;k<h.length;k++)d += Math.abs(h[k]-t[k]);
  min = d;
  if (d===0) exact.push(0);
  for (let i=n;i<source.length;i++) {
    const lo = source[i-n], hi = source[i];
    if (lo !== hi) {
      d -= Math.abs(h[lo]-t[lo]) + Math.abs(h[hi]-t[hi]);
      h[lo]--; h[hi]++;
      d += Math.abs(h[lo]-t[lo]) + Math.abs(h[hi]-t[hi]);
    }
    assert.equal(d&1,0);
    if (d<min) { min=d;first=i-n+1; }
    if (d===0) exact.push(i-n+1);
  }
  return {minL1:min, firstBest:first, exact};
}

const tokens = corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const text = word.toUpperCase().replace(/['’]/g,'')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG');
  const out = [];
  for (let i=0;i<text.length;) {
    const found = tokens.find(x=>text.startsWith(x.s,i));
    assert.ok(found, 'source normalization not in GP: '+word);
    out.push(found.i);i+=found.s.length;
  }
  return out;
}

/** @param {number[]} arr */
function pattern(arr) {
  const map=new Map();
  return arr.map(x=>{
    if (!map.has(x)) map.set(x,map.size);
    return map.get(x);
  }).join(',');
}

/** @param {number[][]} left @param {number[][]} right */
function maxMatching(left,right) {
  const edges=left.map(a=>right.map((b,i)=>(
    a.length===b.length && a.every((x,k)=>x===b[k])?i:-1
  )).filter(i=>i>=0));
  const assigned=Array(right.length).fill(-1);
  function visit(i,seen) {
    for (const j of edges[i]) {
      if(seen.has(j))continue;
      seen.add(j);
      if(assigned[j]<0||visit(assigned[j],seen)) {assigned[j]=i;return true;}
    }
    return false;
  }
  return left.reduce((sum,_,i)=>sum+Number(visit(i,new Set())),0);
}

/** Original cipher words start in one physical page, even across wraps. */
function originalWordValues(p) {
  return parsed.words.filter(w => physicalLP2Page(w.startPage) === p)
    .map(w=>[...w.runes].map(c=>runeIndex.get(c)));
}

/**
 * Reject a 16-word GEB candidate if no fixed 29-way global monoalphabetic
 * substitution can preserve all source-internal equality patterns. For a
 * stronger test give the cipher every possible secret word-position additive
 * key: the unique 13-rune word alone fixes that key for all other words.
 * @param {number[][]} cipher
 * @param {number[][]} plain
 */
function p55Keys(cipher,plain) {
  assert.equal(cipher.length,16);
  assert.equal(plain.length,16);
  const sourceShapes = plain.map(pattern), cipherShapes=cipher.map(pattern);
  const fixedSymbolMissing = sourceShapes.filter(
    x=>!cipherShapes.includes(x)).length;
  const a13 = cipher.filter(x=>x.length===13), b13=plain.filter(x=>x.length===13);
  assert.equal(a13.length,1);assert.equal(b13.length,1);
  const key=b13[0].map((p,k)=>(a13[0][k]-p+29)%29);
  const keyPlain=plain.map(w=>w.map((x,i)=>(x+key[i])%29));
  return {
    fixedSymbolMissing,
    wordResetAdditiveMaximum: maxMatching(keyPlain,cipher),
    exactWordPermutationAdditivePossible:
      maxMatching(keyPlain,cipher)===16
  };
}


/**
 * Exact ordered K-word GP-length cribs across the whole source and target
 * tapes, allowing any position but requiring contiguous unedited words.
 * At a 12-word fingerprint hit recover the maximal identical run, with
 * a five-word extension evaluated without any fitted letter substitution.
 *
 * @param {number[]} src
 * @param {number[]} tgt
 */
function orderedCribs(src,tgt) {
  const K=12, sourceMap=new Map(), seen=new Set(), hits=[];
  for (let i=0;i+K<=src.length;i++) {
    const k=src.slice(i,i+K).join(',');
    const a=sourceMap.get(k);
    if(a)a.push(i);else sourceMap.set(k,[i]);
  }
  for (let j=0;j+K<=tgt.length;j++) {
    const a=sourceMap.get(tgt.slice(j,j+K).join(','));
    if(!a)continue;
    for(const i of a) {
      let startSrc=i,startTarget=j;
      while(startSrc>0 && startTarget>0 &&
        src[startSrc-1]===tgt[startTarget-1]){startSrc--;startTarget--;}
      let n=K+i-startSrc;
      while(startSrc+n<src.length && startTarget+n<tgt.length &&
        src[startSrc+n]===tgt[startTarget+n])n++;
      const id=startTarget+':'+startSrc;
      if(seen.has(id))continue;
      seen.add(id);
      const first12=tgt.slice(startTarget,startTarget+K)
        .reduce((x,y)=>x+y,0);
      hits.push({
        originalWord:startTarget,sourceWord:startSrc,
        matchingWords:n,first12Runes:first12,
        qualifying:n>=12 && first12>=40,
        fiveHeldout:n>=17
      });
    }
  }
  hits.sort((a,b)=>b.matchingWords-a.matchingWords ||
    b.first12Runes-a.first12Runes);
  return {hitCount:hits.length,
    threshold12words40runes:hits.filter(x=>x.qualifying).length,
    heldout17words:hits.filter(x=>x.fiveHeldout).length,
    top:hits.slice(0,12)};
}

/** Deterministic source-inventory-shuffle control. @param {number[]} src */
function shuffleLengths(src) {
  let seed=0x20143301;
  const x=src.slice();
  for(let i=x.length-1;i>0;i--) {
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    const j=(seed>>>0)%(i+1);
    [x[i],x[j]]=[x[j],x[i]];
  }
  return x;
}

async function main() {
  const blobId='03c403fa3db18dd9ee966e555e4978036b5f6b56';
  const url='https://api.github.com/repos/kylevedder/JChains/git/blobs/'+blobId;
  const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'}});
  assert.equal(response.status,200,'Pinned historical GEB source unavailable');
  const blob=await response.json();
  assert.equal(blob.encoding,'base64');
  const bytes=Buffer.from(blob.content.replace(/\s/g,''),'base64');
  assert.equal(bytes.length,1953906);
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes)
    .digest('hex');
  assert.equal(sha,blobId);
  const words=bytes.toString('utf8').toUpperCase()
    .match(/[A-Z]+(?:['’][A-Z]+)*/g) || [];
  assert.equal(words.length,318443);
  const source=words.map(word=>gp(word).length);
  assert.equal(source.length,318443);

  const originalWordLengths = parsed.words.map(w=>w.length);
  const orderedSource = orderedCribs(source,originalWordLengths);
  const orderedShuffled = orderedCribs(shuffleLengths(source),originalWordLengths);
  const positivePlain = originalWordLengths.slice();
  positivePlain.splice(100,25,...source.slice(12000,12025));
  const orderedPlant = orderedCribs(source,positivePlain);
  assert.ok(orderedPlant.top.some(h=>h.matchingWords>=25 && h.originalWord<=100 &&
    h.originalWord+h.matchingWords>=125));
  const chaptersOut=chapters.map(([low,high])=>{
    const target=parsed.words.filter(w=>{
      const page=physicalLP2Page(w.startPage);
      return page>=low && page<=high;
    }).map(w=>w.length);
    const result=scan(source,target);
    return {
      chapter:low+'-'+high, words:target.length, minL1:result.minL1,
      bestSourceWord:result.firstBest, exactCount:result.exact.length
    };
  });
  const exactPages=[],p55=[];
  for (let page=0;page<=55;page++) {
    if(page===50)continue;
    const original=originalWordValues(page);
    const res=scan(source,original.map(w=>w.length));
    if (!res.exact.length)continue;
    exactPages.push({page,wordCount:original.length,sourcePositions:res.exact});
    if (page===55) {
      for (const pos of res.exact) {
        const sourceWords=words.slice(pos,pos+original.length).map(gp);
        p55.push({sourceWord:pos, ...p55Keys(original,sourceWords)});
      }
    }
  }

  // The same scanner must find all 3 authentic original inventory shapes
  // when the complete source-ordered bags are planted in reverse word order.
  for(const [lo,hi] of [chapters[0],chapters[4],chapters[8]]) {
    const target=parsed.words.filter(w=>{
      const p=physicalLP2Page(w.startPage);
      return p>=lo&&p<=hi;
    }).map(w=>w.length);
    const plant=source.slice();
    plant.splice(12000,target.length,...target.slice().reverse());
    assert.equal(scan(plant,target).minL1,0);
  }
  console.log(JSON.stringify({
    source:{name:'GEB 2014 Cicada selected book',blob:blobId,words:words.length},
    original:{runes:parsed.runeCount,words:parsed.words.length,pages:55},
    chapters:chaptersOut,wholeChapterExactHits:chaptersOut.reduce((n,x)=>n+x.exactCount,0),
    orderedSource,orderedShuffled,orderedPlantTop:orderedPlant.top[0],
    exactPageBags:exactPages,p55FixedSymbolAndAllKeyChecks:p55,
    status:'actual plaintext not established; candidate source-bags are necessary conditions only'
  },null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
