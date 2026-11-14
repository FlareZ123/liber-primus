'use strict';

/**
 * Fully executable candidate HUMAN solve-path for the LP2 27x27 opening.
 * Source-only operands before decoding: 729 GP indices on pp0-2, a first
 * red heading 13 runes, seven black runes on its first printed line, and
 * the known Cicada Euler totient and mod29 rune table.
 *
 * Candidate rule (retrospectively conceived in 2026, NOT authenticated):
 * row = red heading rune count; centerColumn = phi(row);
 * horizontal adjacent node; phi-transform node's center; align by mu(phi);
 * start column = original left source-node rune index; read as many
 * row-major runes as first black printed line, with 27-square wrap.
 *
 * No output text, dictionary, or target plaintext is consulted to choose
 * the original source node, key, start, or length. The locked source rule
 * is evaluated against all other eligible node centers and circular shifts.
 * These post-discovery controls do not make the rule historically independent.
 *
 * Node 22 CommonJS SFT:
 * node sims/lp2_public27_heading_outerindex_selector_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} relative */
function read(relative) { return fs.readFileSync(path.join(ROOT, relative), 'utf8'); }
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const dictionaryRaw = read('resources/control/english_wordfreq_textblob.txt');
const grid = book.pages.slice(0, 3).flatMap(p => p.indices);
assert.deepEqual(book.pages.slice(0, 3).map(p => p.indices.length), [262,266,201]);
assert.equal(grid.length, 729);
const mod = x => ((x % 29) + 29) % 29;
const glyph = x => book.translit[x];
/** @param {number} n */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let remaining=n,answer=n;
  for(let p=2;p*p<=remaining;p++) if(remaining%p===0) {
    answer -= answer/p;
    while(remaining%p===0)remaining/=p;
  }
  if(remaining>1)answer-=answer/remaining;
  return answer;
}
/** @param {number} n */
function mu(n) {
  assert.ok(Number.isInteger(n)&&n>0);
  let remaining=n,sign=1;
  for(let p=2;p*p<=remaining;p++)if(remaining%p===0) {
    remaining/=p; sign=-sign;
    if(remaining%p===0)return 0;
    while(remaining%p===0)remaining/=p;
  }
  return remaining>1?-sign:sign;
}

const firstLine=transcription.replace(/\r\n/g,'\n').split('\n')[0];
const parts=firstLine.split('.');
assert.equal(parts.length,2);
const indexByRune = new Map(book.runes.map((r,i)=>[r,i]));
/** @param {string} t */
const runeCount = t => Array.from(t).filter(ch=>indexByRune.has(ch)).length;
const redLength=runeCount(parts[0]);
const blackLength=runeCount(parts[1]);
assert.equal(redLength,13);
assert.equal(blackLength,7);
const firstRed=ink.pages.find(p=>p.page===0).red_spans.find(s=>s.start===0);
assert.equal(firstRed.length,redLength);

/**
 * Apply the precise proposed source-node-to-ciphertext-column rule.
 * @param {number[]} sourceGrid Full 729-rune row-major input
 * @param {number} row One-based source-node row
 * @param {number} centerCol One-based horizontal source-node center
 * @returns {object|null}
 */
function decodeAt(sourceGrid,row,centerCol){
  if(row<1||row>27||centerCol<2||centerCol>26)return null;
  const centerIndex=(row-1)*27+centerCol-1;
  const raw=sourceGrid.slice(centerIndex-1,centerIndex+2);
  if(raw.length!==3||raw.includes(0)||raw[0]<1||raw[0]>27)return null;
  let key=[raw[0],phi(raw[1]),raw[2]];
  if(key.includes(0))return null;
  const phase=mod(key.reduce((s,x)=>s+mu(phi(x)),0))%3;
  key=key.slice(phase).concat(key.slice(0,phase));
  const start=(row-1)*27+(raw[0]-1);
  if(start+blackLength>sourceGrid.length)return null;
  const cipher=sourceGrid.slice(start,start+blackLength);
  const plain=cipher.map((c,i)=>mod(c-key[i%3]));
  assert.deepEqual(plain.map((p,i)=>mod(p+key[i%3])),cipher);
  return {row,centerCol,start,raw,key,phase,cipher,plain,
    transcription:plain.map(glyph).join('')};
}

const row=redLength;
const centerCol=phi(row);
const solution=decodeAt(grid,row,centerCol);
assert.deepEqual([row,centerCol],[13,12]);
assert.deepEqual(solution.raw,[25,11,28]); // AE J EA
assert.deepEqual(solution.key,[25,10,28]); // AE I EA
assert.equal(solution.phase,0);
assert.equal(solution.start,348); // one-based grid row13 col25
assert.deepEqual(solution.cipher,[20,25,9,2,13,1,14]);
assert.deepEqual(solution.plain,[24,15,10,6,3,2,18]);
assert.equal(solution.transcription,'ASIGOTHE');

// Independent printed page word boundaries at the selected cipher positions.
// Earlier original-parser SFT proves uniqueness over all 2,896 printed words.
const entireRuneText=transcription.split('%').slice(0,55).join('%');
const sourceWords=[];
let current=[],start=-1,pos=0;
for(const ch of entireRuneText) {
  if(indexByRune.has(ch)){
    if(current.length===0)start=pos;
    current.push(indexByRune.get(ch));pos++;
  }else if(ch!=='%'&&ch!=='/'&&!/\s/u.test(ch)){
    if(current.length)sourceWords.push({start,end:pos-1,sep:ch,length:current.length});
    current=[];
  }
}
if(current.length)sourceWords.push({start,end:pos-1,sep:'',length:current.length});
assert.equal(pos,12956);
assert.equal(sourceWords.length,2896);
const startWord=sourceWords.findIndex(w=>w.start===solution.start);
assert.ok(startWord>=0);
assert.deepEqual(sourceWords.slice(startWord,startWord+4).map(w=>w.length),[2,1,2,2]);
assert.deepEqual(sourceWords.slice(startWord,startWord+4).map(w=>w.sep),['.','-','-','-']);
assert.equal(sourceWords[startWord+3].end,solution.start+6);

// Fixed, pre-existing GP29 dictionary: lexical scoring ONLY AFTER source decode.
const tokenValues=book.translit.map((token,i)=>({token,i}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} latin */
function encode(latin) {
  latin=latin.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
  const result=[];
  for(let i=0;i<latin.length;) {
    const t=tokenValues.find(x=>latin.startsWith(x.token,i));
    if(!t)return null;
    result.push(t.i); i+=t.token.length;
  }
  return result;
}
const lexicon=new Map();
for(const line of dictionaryRaw.split(/\r?\n/u)) {
  const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);
  if(!m)continue;
  const x=encode(m[1]);if(!x)continue;
  const id=x.join(','),freq=Number(m[2]),old=lexicon.get(id);
  if(!old||freq>old.freq)lexicon.set(id,{word:m[1],freq});
}
assert.equal(lexicon.size,29061);
const pattern=[[0,2],[2,3],[3,5],[5,7]];
/** @param {object} decoded */
function evaluate(decoded) {
  const terms=pattern.map(([a,b])=>lexicon.get(decoded.plain.slice(a,b).join(',')));
  if(!terms.every(Boolean))return null;
  const score=terms.reduce((sum,w)=>sum+Math.log10(w.freq+1),0);
  return {row:decoded.row,col:decoded.centerCol,start:decoded.start,
    phrase:terms.map(w=>w.word).join(' '),score:Number(score.toFixed(6)),
    common:terms.every(w=>w.freq>=100)&&
      ['a','i','o'].includes(terms[1].word.toLowerCase())};
}
const originalEvaluated=evaluate(solution);
assert.equal(originalEvaluated.phrase,'as i go the');
assert.equal(originalEvaluated.score,15.652804);
assert.equal(originalEvaluated.common,true);

// Exact all-center falsification control on unchanged original 729-run grid.
let eligibleCenters=0;
const allCenterHits=[];
for(let r=1;r<=27;r++)for(let c=2;c<=26;c++){
  const decoded=decodeAt(grid,r,c); if(!decoded)continue;
  eligibleCenters++;
  const scored=evaluate(decoded);if(scored)allCenterHits.push(scored);
}
allCenterHits.sort((a,b)=>b.score-a.score);
assert.equal(eligibleCenters,528);
assert.equal(allCenterHits.length,13);
assert.deepEqual(allCenterHits[0],originalEvaluated);
assert.equal(allCenterHits[1].phrase,'thy i go go');
assert.equal(allCenterHits[1].score,11.481108);
assert.equal(allCenterHits.filter(x=>x.common).length,1);

// Circular full-grid-shift sensitivity: source geometry preserved; rune inputs
// changed. Controls are POST-DISCOVERY and have no calibrated p-value.
let eligibleShifts=0;
const shiftHits=[];
for(let shift=0;shift<729;shift++){
  const rotated=grid.slice(shift).concat(grid.slice(0,shift));
  const decoded=decodeAt(rotated,row,centerCol);
  if(!decoded)continue;
  eligibleShifts++;
  const scored=evaluate(decoded);
  if(scored)shiftHits.push({shift,...scored});
}
assert.equal(eligibleShifts,604);
assert.equal(shiftHits.length,9);
assert.equal(shiftHits.filter(x=>x.common).length,1);
assert.equal(shiftHits.filter(x=>x.score>=originalEvaluated.score).length,1);
assert.deepEqual(shiftHits.filter(x=>x.common).map(x=>x.shift),[0]);

console.log(JSON.stringify({
  source:'LP2 original pp0-2, exactly 729 GP29 runes / 27x27',
  firstHeaderRedRunes:redLength,
  firstBlackPhysicalLineRunes:blackLength,
  rule:'r=red13, center col phi(r)=12, horizontal node phi(center), start col=left node GP index',
  headingSelected:solution,
  lexical:originalEvaluated,
  allOriginalCenters:{eligible:eligibleCenters,fourWordReadings:allCenterHits.length,
    commonEnglishReadings:1,top:allCenterHits.slice(0,5)},
  circularInputControls:{totalShifts:729,eligible:eligibleShifts,
    fourWordReadings:shiftHits.length,commonEnglishReadings:1,
    atLeastOriginalScore:1,commonShift:0},
  warning:'The SOURCE ROLE RULE was invented after seeing the external plaintext claim; these controls show specificity conditional on that chosen rule, not a first-party Cicada instruction or independently discovered plaintext.'
},null,2));
console.log('PASS: exact original-source heading-selected provisional seven-rune inverse.');
