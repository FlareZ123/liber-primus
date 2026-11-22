"use strict";
/**
 * Source-original quotation-prefix crosslink in LP2.
 * Run: node sims/lp2_quote_length_crosslink.cjs
 * Node 22 / CommonJS. No dependencies or model fitting.
 *
 * Null: rotate the *whole word-length sequence* of each quote-start
 * rune-bearing page independently, preserving order within each page,
 * preserving the quote's word ordinal, and sharing rotations where
 * two quotes begin on the same page. This is a conditional source-layout
 * test; it does NOT give a discovery-wide p-value or recover plaintext.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

/**
 * Parse canonical word starts while joining printed-line and page wraps.
 * Nonrune punctuation is a word delimiter, exactly as in
 * sims/lp2_word_pages.cjs. The printed numeric-only p50 is absent from
 * the rune-bearing transcription's page ordinal.
 * @param {string} transcript
 * @returns {Array<{start:number,end:number,length:number,page:number}>}
 */
function parseWords(transcript) {
  const words = [];
  let text = "", start = 0, firstPage = 0, page = 0, offset = 0;
  function flush() {
    if (!text) return;
    words.push({start, end:offset, length:offset - start, page:firstPage});
    text = "";
  }
  for (const char of transcript) {
    if (/[\u16A0-\u16FF]/u.test(char)) {
      if (!text) {start = offset; firstPage = page;}
      text += char;
      offset++;
    } else if (char === "%") {
      page++;
    } else if (char === "/" || /\s/u.test(char)) {
      // Line and page breaks do not terminate words.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} page Rune-bearing source page ordinal. */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/**
 * @param {number[]} lengths
 * @param {number} at
 * @returns {string}
 */
function fingerprint(lengths, at) {
  return Array.from({length:5}, (_, k) => lengths[(at + k) % lengths.length]).join(",");
}

function main() {
  const words = parseWords(read("resources/liber-primus/lp2-transcription.txt"));
  const quotes = JSON.parse(
    read("resources/liber-primus/lp2-quote-punctuation-spans.json")
  ).quotes;
  assert.equal(words.length, 2941);
  assert.equal(words.filter(w => w.start < 12956).length, 2896);

  const pageWords = new Map();
  for (const word of words) {
    if (word.start >= 12956) break;
    if (!pageWords.has(word.page)) pageWords.set(word.page, []);
    pageWords.get(word.page).push(word);
  }

  const starts = new Map(words.map((word, k) => [word.start, k]));
  const q = quotes.map(quote => {
    const index = starts.get(quote.start);
    assert.notEqual(index, undefined);
    const contained = words.slice(index).filter(w => (
      w.start >= quote.start && w.end <= quote.end
    ));
    assert.equal(contained.reduce((n, w) => n + w.length, 0), quote.end - quote.start);
    const here = words[index];
    const within = pageWords.get(here.page);
    const slot = within.findIndex(w => w.start === quote.start);
    assert(slot >= 0);
    return {runeStart:quote.start, runeEnd:quote.end,
      sourcePage:here.page, physicalPage:physicalPage(here.page),
      wordCount:contained.length, quoteLengths:contained.map(w => w.length),
      slot, corpusWord:index};
  });
  assert.equal(q.length, 7);
  const eligible = q.filter(x => x.wordCount >= 5);
  assert.equal(eligible.length, 5);

  // Original manuscript-wide frequency of the pair's common fingerprint.
  const sourceWords = words.filter(w => w.start < 12956);
  const target = [5,7,2,3,4].join(",");
  const hits = [];
  for (let i=0; i+5<=sourceWords.length; i++) {
    if (sourceWords.slice(i,i+5).map(w=>w.length).join(",") === target)
      hits.push({word:i,runeOffset:sourceWords[i].start});
  }
  assert.deepEqual(hits.map(h=>h.runeOffset),[9811,12522]);

  const comparisons = [];
  for (let i=0; i<eligible.length; i++) {
    const a = eligible[i], aa = pageWords.get(a.sourcePage);
    const na = aa.length, alens = aa.map(x=>x.length);
    for (let j=i+1; j<eligible.length; j++) {
      const b = eligible[j], bb = pageWords.get(b.sourcePage);
      const nb = bb.length, blens = bb.map(x=>x.length);
      const samePage = a.sourcePage === b.sourcePage;
      const supporting = [];
      for (let ra=0; ra<na; ra++) {
        const af = fingerprint(alens, a.slot+ra);
        for (let rb=0; rb<(samePage?1:nb); rb++) {
          const shift = samePage ? ra : rb;
          if (af === fingerprint(blens, b.slot+shift))
            supporting.push({rotationA:ra,rotationB:shift,wordLengths:af});
        }
      }
      comparisons.push({starts:[a.runeStart,b.runeStart],
        rotations:na*(samePage?1:nb),
        matches:supporting.length, witnesses:supporting});
    }
  }
  const survivors = comparisons.filter(x => x.matches>0);
  assert.equal(survivors.length, 1);
  assert.deepEqual(survivors[0].starts,[9811,12522]);
  assert.equal(survivors[0].matches,2);
  assert.equal(survivors[0].rotations,2145);
  assert.deepEqual(survivors[0].witnesses.map(x=>[x.rotationA,x.rotationB]),
    [[0,0],[40,14]]);



  // A stricter null also conditions on each quoted passage retaining its
  // complete 14-word length and 58/70-rune sum. Both passages are contained
  // within their respective physical source pages. This conditions on source
  // features already observed, and is the preferred context-aware comparator.
  const pair=q.filter(x=>x.runeStart===9811||x.runeStart===12522);
  assert.deepEqual(pair.map(x=>x.wordCount),[14,14]);
  const valid=pair.map(entry=>{
    const vals=pageWords.get(entry.sourcePage).map(w=>w.length);
    const rotations=[];
    for(let phase=0;phase<vals.length;phase++){
      let sum=0;
      for(let k=0;k<entry.wordCount;k++)
        sum+=vals[(entry.slot+phase+k)%vals.length];
      if(sum===entry.runeEnd-entry.runeStart)
        rotations.push({phase,prefix:fingerprint(vals,entry.slot+phase)});
    }
    return rotations;
  });
  assert.deepEqual(valid.map(v=>v.map(x=>x.phase)),
    [[0,1,8,35,42,44,54],[0,34,36,37]]);
  const conditionedPairs=[];
  for(const left of valid[0])for(const right of valid[1]){
    if(left.prefix===right.prefix)
      conditionedPairs.push({left:left.phase,right:right.phase,prefix:left.prefix});
  }
  assert.deepEqual(conditionedPairs,
    [{left:0,right:0,prefix:"5,7,2,3,4"}]);
  const conditionedDenominator=valid[0].length*valid[1].length;
  assert.equal(conditionedDenominator,28);

  // Check which cryptographic readings of a common 21-rune plaintext
  // are already contradicted by the two original quoted cipher intervals.
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const cipher=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const a=cipher.slice(9811,9832),b=cipher.slice(12522,12543);
  assert.equal(a.length,21);assert.equal(b.length,21);
  assert.equal(a[0],a[16]);assert.notEqual(b[0],b[16]);
  const delta=a.map((v,i)=>(v-b[i]+29)%29);
  /** @param {number[][]} input */
  function rank29(input){
    const M=input.map(row=>row.map(v=>(v%29+29)%29));
    let r=0;
    for(let j=0;j<M[0].length;j++){
      let h=-1;for(let i=r;i<M.length;i++)if(M[i][j]){h=i;break;}
      if(h<0)continue;
      [M[r],M[h]]=[M[h],M[r]];
      let inv=1;while(M[r][j]*inv%29!==1)inv++;
      for(let k=j;k<M[r].length;k++)M[r][k]=M[r][k]*inv%29;
      for(let i=0;i<M.length;i++)if(i!==r&&M[i][j]){
        const t=M[i][j];
        for(let k=j;k<M[i].length;k++)
          M[i][k]=(M[i][k]-t*M[r][k]+29*29)%29;
      }
      if(++r===M.length)break;
    }
    return r;
  }
  const X=Array.from({length:11},(_,i)=>
    Array.from({length:10},(_,j)=>delta[i+9-j]));
  const rankX=rank29(X),rankAug=rank29(X.map((row,i)=>[...row,delta[i+10]]));
  assert.equal(rankX,10);assert.equal(rankAug,11);
  const mask40=corpus.pages[40].indices.slice(0,8);
  const mask53=corpus.pages[53].indices.slice(128,179);
  const directRed=[];
  for(const encoding of ["index","primeMod29"])
    for(const clock of ["quote","page"])
      for(const s40 of [-1,1])for(const s53 of [-1,1]){
        let matches=0;
        for(let i=0;i<21;i++){
          let k40=mask40[(i+(clock==="page"?171:0))%8];
          let k53=mask53[(i+(clock==="page"?53:0))%51];
          if(encoding==="primeMod29"){
            k40=corpus.prime[k40]%29;k53=corpus.prime[k53]%29;
          }
          if((a[i]+29+s40*k40)%29===(b[i]+29+s53*k53)%29)matches++;
        }
        directRed.push({encoding,clock,s40,s53,matches});
      }
  assert.equal(Math.max(...directRed.map(x=>x.matches)),2);
  const out = {
    finding:"Unique five-word length sequence at two independent quote openings",
    source:"Canonical unsolved LP2 words and independent original quote annotations",
    observedWordLengthPrefix:target,
    observedRuneStarts:hits.map(h=>h.runeOffset),
    quotes:q.map(x=>({start:x.runeStart,end:x.runeEnd,page:x.physicalPage,
      words:x.wordCount,prefix:x.quoteLengths.slice(0,5).join(",")})),
    allFiveWordQuotePairs:comparisons,
    exactConditionalFamilyProbability:"2/2145",
    probability:2/2145,
    quoteTotalConditioned:{exactProbability:"1/28",numerator:1,
      denominator:conditionedDenominator,compatiblePairs:conditionedPairs,
      phasesPerQuote:valid.map(v=>v.map(x=>x.phase))},
    conditionalSharedPlaintextGates:{fixedBijectionPositions:[0,16],
      commonLinearKeystreamOrder10:{coefficientRank:rankX,augmentedRank:rankAug},
      directRedSourceVariants:directRed},
    caution:"Conditional on both original quote totals, the same opening match is 1/28; source-specific selection is uncorrected. No plaintext equality or actual key follows."
  };
  console.log(JSON.stringify(out,null,2));
}
if (require.main === module) main();
module.exports = {parseWords, physicalPage, fingerprint, main};
