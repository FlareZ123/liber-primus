'use strict';

/**
 * Original-scan four-apostrophe "LIFE" key-candidate falsification.
 *
 * The four source-visible LP2 marks have a historically solved LP1 control:
 * the original RWN'B is DON'T, and its apostrophe-tail ciphertext B=17 minus
 * plaintext T=16 yields key U=1 under the real FIRFUMFERENFE cipher.
 * Applying the same DIFFERENCE TO T to four unknown-page suffixes happens
 * to spell LIFE. Test whether that can be a four-period additive key.
 * Node 22, CommonJS. No invented plaintext or unknown source bytes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const data=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'));
assert.equal(crypto.createHash('sha256').update(data).digest('hex'),
  '58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338');
const C=JSON.parse(data);
const anno=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-quote-punctuation-spans.json'),'utf8'));
assert.equal(C.runes.length,29);
const visible=anno.source_visible_apostrophes;
assert.equal(visible.length,4);
const cases=[
  {page:4, scan:'21.jpg', at:1110, local:164, word:"MXI'W",tail:'W'},
  {page:21,scan:'38.jpg', at:5138, local:36, word:"AEO'Y",tail:'Y'},
  {page:35,scan:'52.jpg', at:8515, local:80, word:"PE'T",tail:'T'},
  {page:41,scan:'58.jpg', at:10089,local:218,word:"XLJ'C",tail:'C'},
];
const mod=x=>(x%29+29)%29;
const name=i=>C.translit[i];
const chapters=[0,3,8,15,23,27,33,40,54];
const marks=visible.map((v,i)=>{
  const e=cases[i];
  assert.deepEqual([v.page,v.scan,v.global_before_rune,v.local_before_rune,v.cipher_word],
    [e.page,e.scan,e.at,e.local,e.word]);
  assert.equal(C.pages[e.page].indices[e.local],C.translit.indexOf(e.tail));
  const start=chapters.filter(ch=>ch<=e.page).at(-1);
  const local=Array.from({length:e.page-start},(_,j)=>C.pages[start+j].indices.length)
    .reduce((a,b)=>a+b,0)+e.local;
  const cipher=C.pages[e.page].indices[e.local];
  return {page:e.page,scan:e.scan,cipher,letter:name(cipher),
    global:e.at,chapterPos:local,globalPhase:e.at%4,chapterPhase:local%4,
    recoveredKeyRune:mod(cipher-16)};
});
assert.deepEqual(marks.map(m=>m.letter),['W','Y','T','C']);
assert.equal(mod(17-16),1); // B - T = U, historical LP1 source control
assert.deepEqual(marks.map(m=>m.recoveredKeyRune),[20,10,0,18]);
assert.equal(marks.map(m=>name(m.recoveredKeyRune)).join(''),'LIFE');
const life=marks.map(m=>m.recoveredKeyRune);
assert.deepEqual(marks.map(m=>m.globalPhase),[2,2,3,1]);
assert.deepEqual(marks.map(m=>m.chapterPhase),[1,3,3,1]);
// Under the shared-LIFE key, equal phase and identical assumed T plaintext
// must produce identical ciphertext. Both global and chapter reset fail.
function phaseContradictions(column){
  const pairs=[];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    if(marks[i][column]===marks[j][column]&&
      marks[i].cipher!==marks[j].cipher) pairs.push([i,j]);
  }
  return pairs;
}
assert.deepEqual(phaseContradictions('globalPhase'),[[0,1]]);
assert.deepEqual(phaseContradictions('chapterPhase'),[[0,3],[1,2]]);
function ioc(v){const n=Array(29).fill(0);v.forEach(x=>n[x]++);
return n.reduce((a,x)=>a+x*(x-1),0)/(v.length*(v.length-1));}
const known=C.pages[57].indices.slice(0,76);
assert.equal(known.length,76);
const outcomes=[];
for(const pg of [49,55]){
  const original=C.pages[pg].indices;
  assert.equal(original.length,pg===49?66:76);
  for(const sign of [-1,1])for(let phase=0;phase<4;phase++){
    const decoded=original.map((c,i)=>mod(c+sign*life[(i+phase)%4]));
    const recipher=decoded.map((p,i)=>mod(p-sign*life[(i+phase)%4]));
    assert.deepEqual(recipher,original);
    const score=ioc(decoded);
    assert(score<0.04,'Unexpected LIFE direct-key original plaintext score');
    const plant=known.map((p,i)=>mod(p-sign*life[(i+phase)%4]));
    const recovered=plant.map((c,i)=>mod(c+sign*life[(i+phase)%4]));
    assert.deepEqual(recovered,known,'Native p57 plant failed');
    outcomes.push({page:pg,sign,phase,ioc:score,
      opening:decoded.slice(0,28).map(name).join('')});
  }
}
console.log(JSON.stringify({
  historicalPositive:"Original solved LP1 RWN'B = DON'T gives B-T=U, authentic apostrophe-tail key difference",
  visibleLP2Marks:marks,
  fixedTailAssumption:'T (one tentative English apostrophe tail, not LP2 plaintext)',
  candidateReadout:marks.map(m=>name(m.recoveredKeyRune)).join(''),
  incompatibleSameTailGlobalPeriod4Pairs:phaseContradictions('globalPhase'),
  incompatibleSameTailChapterResetPeriod4Pairs:phaseContradictions('chapterPhase'),
  strictTest:'fixed LIFE direct period4 additive shift, 4 phases x 2 signs on p49 and p55',
  nativeP57PositiveCount:16,
  originalOutcomes:outcomes,
  conclusion:'LIFE is a source-selected four-mark candidate, not an authenticated key. It fails to decode p49/p55 by direct periodic addition and cannot self-consistently mean all four T tails under globally or chapter-reset four-period clocks. Other source-selected consumers untested.'
},null,2));
