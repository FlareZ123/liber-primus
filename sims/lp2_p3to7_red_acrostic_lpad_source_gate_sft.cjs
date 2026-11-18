'use strict';

/**
 * Read-only original-object source gate for the red initials of LP2 pp3–7.
 *
 * This verifies only a striking source acrostic, and the *losslessness*
 * of a literal historical SQL LPAD operation at proposed widths.
 * It does not reconstruct unknown plaintext, infer an encryption key,
 * or assert the author's purpose.
 *
 * Node 22 CJS, SFT:
 * node sims/lp2_p3to7_red_acrostic_lpad_source_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n');
const corp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const trans = read('resources/liber-primus/lp2-transcription.txt').split('%');
const pageRange = [3,4,5,6,7];
const redStarts = ink.pages.filter(p => pageRange.includes(p.page))
  .flatMap(p => p.red_spans.map(s => {
    assert.equal([...s.runes].length,s.length);
    assert.equal(corp.pages[p.page].indices[s.start],corp.runes.indexOf([...s.runes][0]));
    return {page:p.page,at:s.start,runic:[...s.runes][0],
      label:corp.translit[corp.runes.indexOf([...s.runes][0])]};
  }));
assert.deepEqual(redStarts.map(s=>[s.page,s.at,s.label]),
  [[3,0,'L'],[3,119,'P'],[6,71,'A'],[7,194,'D']]);
const acrostic = redStarts.map(s=>s.label).join('');
assert.equal(acrostic,'LPAD');

// '/' is a source line-wrap, '%' a physical page break; neither starts
// a new word by itself. '-' and '.' end a native word, while & and $
// mark structural separators and cannot join a word.
const slice = trans.slice(3,8).join('').replace(/[\/\r\n]/g,'').replace(/[&$]/g,'.');
const runes = new Set(corp.runes);
const words = slice.split(/[.-]/).filter(Boolean).map(s => [...s].filter(c=>runes.has(c)));
assert(words.every(x=>x.length>0));
assert.equal(words.reduce((n,w)=>n+w.length,0),1145);
assert.equal(corp.pages.slice(3,8).reduce((n,p)=>n+p.indices.length,0),1145);
assert.equal(words.length,255);
const lengths = words.map(w=>w.length);
assert.equal(Math.max(...lengths),12);

const truncate5 = lengths.reduce((n,k)=>n+Math.max(0,k-5),0);
const affected5 = lengths.filter(k=>k>5).length;
const padWidth=13;
const paddingRune=corp.runes[0];
const padded=words.map(w=>Array(padWidth-w.length).fill(paddingRune).concat(w));
assert(padded.every(w=>w.length===13));
assert.deepEqual(padded.map((w,i)=>w.slice(13-lengths[i])),words);
const padCount = padded.length*13 - 1145;
assert.equal(padCount,2170);

// The second SQL LPAD argument (length) and third argument (pad string)
// are absent from the four-rune acrostic. 13 and GP index 0 are
// exploratory source candidates, not authenticated operands.
console.log(JSON.stringify({
 scope:'source-original GP29/red-span/printed-word check only',
 pages:pageRange,
 redStarts,
 output:acrostic,
 historicalKeyword:'LPAD(string,len,padstring), e.g. MySQL 4.1',
 nativeWords:words.length,
 rawRunes:1145,
 longestOriginalWord:Math.max(...lengths),
 proposedWidth5:{damagedWords:affected5,lostOriginalRunes:truncate5},
 candidateWidth13:{originalWords:255,paddedRunes:padded.length*13,
   extraPadRunes:padCount, padRune:'F (speculative GP index 0)',
   roundtripRequiresOriginalWordLengths:true},
 conclusion:'NO unknown plaintext; no source-selected second/third LPAD argument or decoding consumer'
},null,2));
