'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');
}
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const allWords = [];
let current = [], startPage = -1, endPage = -1, startOffset = -1;
function flush() {
  if (!current.length) return;
  allWords.push({page:startPage,endPage,start:startOffset,values:current.slice()});
  current = [];
}
for (let block = 0; block < parts.length; block += 1) {
  const page = block >= 50 ? block + 1 : block;
  let offset = 0;
  for (const char of parts[block]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) { startPage = page; startOffset = offset; }
      endPage = page;
      current.push(value);
      offset += 1;
    } else if (!/[\s/]/u.test(char)) {
      flush();
    }
  }
}
flush();

const canonical = allWords.filter((word) => word.page === word.endPage);
const frozen = [
  {page:43,source:'HELLO',arity:5,ordinalResidue:26,receiverGp0:2},
  {page:44,source:'THE',arity:2,ordinalResidue:2,receiverGp0:0},
  {page:45,source:'PATH',arity:3,ordinalResidue:5,receiverGp0:14},
];
const results = frozen.map((spec) => {
  const local = canonical.filter((word) => word.page === spec.page).map((word,index)=>({
    ...word,ordinal:index+1,gp0:word.values.reduce((sum,value)=>mod29(sum+value),0)
  }));
  const structural = local.filter((word) =>
    word.values.length === spec.arity && mod29(word.ordinal) === spec.ordinalResidue
  );
  return {...spec,structural,passing:structural.filter((word)=>word.gp0===spec.receiverGp0)};
});
assert.equal(results[0].structural.length,0);
assert.equal(results[1].structural.length,0);
assert.deepEqual(results[2].structural,[{
  page:45,endPage:45,start:139,values:[18,18,7],ordinal:34,gp0:14
}]);
assert.deepEqual(results[2].passing,results[2].structural);
assert.equal(results.filter((row)=>row.passing.length===1).length,1);

console.log(JSON.stringify({
  status:'PASS',
  precommit:'workplace/agent10-p6-grid-post-openpgp-restart-precommit.md',
  decision:'REJECT exact 3-lane post-OPENPGP restart',
  exactPasses:1,
  requiredPasses:3,
  results,
  interpretation:'P43 and p44 fail at the target-independent arity/ordinal gate. P45 independently satisfies the frozen PATH structural and GP0 prediction, but the precommit forbids using a 1/3 partial to retune the loop.'
},null,2));
