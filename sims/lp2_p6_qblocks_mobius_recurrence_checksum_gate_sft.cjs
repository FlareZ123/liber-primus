'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','im-results','lp2-p6-qblocks-mobius-recurrence-pretarget.json'),'utf8'));
assert.equal(data.grading,'PRETARGET NO-PLAINTEXT / KEY SUM HELD OUT');
assert.equal(data.count,16);
const checksumHistogram={},invalidHistogram={};
for(const c of data.candidates){checksumHistogram[c.checksumMatches]=(checksumHistogram[c.checksumMatches]||0)+1;invalidHistogram[c.invalidPages]=(invalidHistogram[c.invalidPages]||0)+1;}
assert.deepEqual(checksumHistogram,{0:11,1:5});
assert.deepEqual(invalidHistogram,{0:6,1:7,2:1,3:2});
assert.equal(Math.max(...data.candidates.map(c=>c.checksumMatches)),1);
console.log(JSON.stringify({status:'PASS',candidates:16,checksumHistogram,invalidHistogram,maxMatchedPages:1,decision:'reject p6 q-word Mobius recurrence before plaintext grading'},null,2));
