"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const segments=transcription.split(/^%$/m);
assert.equal(segments.length,57);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const numbers=text=>[...text].flatMap(ch=>runeIndex.has(ch)?[runeIndex.get(ch)]:[]);
const pageText=page=>page===50?"":segments[page<50?page:page-1].replace(/[\/\r\n]/g,"");
const words=text=>text.split(/[-.&$§]/).map(numbers).filter(w=>w.length);

const p48=pageText(48),p49=pageText(49),p51=pageText(51),p52=pageText(52);
const before=p48.slice(p48.lastIndexOf(".")+1)+p49.slice(0,p49.lastIndexOf(".")+1);
const after=p51+p52.slice(0,p52.indexOf(".")+1);
const pre=words(before),post=words(after),all=pre.concat(post);
assert.deepEqual([pre.length,post.length,all.length],[33,40,73]);

// Frozen in commit ab71bb6e6a9278a9071d1182b03dcbc49096fcd2:
// zero-based cell43 -> zero-based word43; p40 typed row5 requires length5.
const selected=all[43];
assert.ok(selected);
assert.equal(43-pre.length,10);
assert.deepEqual(selected,[15,23,21,6,20,15,23,21]);
assert.equal(selected.length,8);
assert.notEqual(selected.length,5);

console.log(JSON.stringify({
  status:"PASS",
  pretargetCommit:"ab71bb6e6a9278a9071d1182b03dcbc49096fcd2",
  corpusWords:all.length,
  selectedZeroBasedWord:43,
  sentence:"posttable",
  posttableZeroBasedWord:10,
  frozenRequiredLength:5,
  observedLength:selected.length,
  observedRunes:selected,
  transliteration:selected.map(v=>corpus.translit[v]).join(""),
  decision:"FAIL: retire direct cell43 -> word43 of the 73-word flanking corpus. No index shift/reset/reversal/alternate token.",
},null,2));
