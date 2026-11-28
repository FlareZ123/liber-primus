#!/usr/bin/env node
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const sourcePath=path.join(__dirname,'lp2_p6_corridor_structural_null_sft.cjs');
const code=fs.readFileSync(sourcePath,'utf8');
const savedLog=console.log;
console.log=()=>{};
try{
  // Evaluate the frozen Agent11 scorer unchanged, then expose only the
  // source-visible 13-page frame rival p27..p39 and matched controls.
  eval(code + `
    globalThis.__frameRivalRows = rows.filter(row => row.pageStart === 27);
    globalThis.__source30FrameRival = rows.find(row => row.sourceStart === 30 && row.pageStart === 27);
    globalThis.__source30Original = rows.find(row => row.sourceStart === 30 && row.pageStart === 30);
  `);
}finally{
  console.log=savedLog;
}

const rows=globalThis.__frameRivalRows;
const rival=globalThis.__source30FrameRival;
const original=globalThis.__source30Original;
assert.equal(rows.length,31);
assert.ok(rival&&original);

function best(field){
  const value=Math.max(...rows.map(r=>r[field]));
  return {
    value,
    rows:rows.filter(r=>r[field]===value).map(r=>({
      sourceStart:r.sourceStart,
      pageStart:r.pageStart,
      fixedReceiver:r.fixedReceiver,
      chargedReceiver:r.chargedReceiver,
      addressBlockHits:r.addressBlockHits,
      addressFamilyScore:r.addressFamilyScore,
      q1AddressFullCount:r.q1AddressFullCount,
      q3AddressFullCount:r.q3AddressFullCount,
    })),
  };
}

const result={
  status:'PASS',
  classification:'source-visible p27..p39 frame rival against frozen p6 13-page corridor grammar',
  sourceVisibleFrame:{pageStart:27,pageEnd:39,length:13},
  frozenSource30:{
    originalPage30:{
      fixedReceiver:original.fixedReceiver,
      chargedReceiver:original.chargedReceiver,
      addressBlockHits:original.addressBlockHits,
      addressFamilyScore:original.addressFamilyScore,
      q1AddressFullCount:original.q1AddressFullCount,
      q3AddressFullCount:original.q3AddressFullCount,
    },
    framePage27:{
      fixedReceiver:rival.fixedReceiver,
      chargedReceiver:rival.chargedReceiver,
      addressBlockHits:rival.addressBlockHits,
      addressFamilyScore:rival.addressFamilyScore,
      q1AddressFullCount:rival.q1AddressFullCount,
      q3AddressFullCount:rival.q3AddressFullCount,
      singleton:rival.singleton,
      terminalPair:rival.terminalPair,
      terminalInstruction:rival.terminalInstruction,
    },
  },
  bestOnFrame:{
    fixedReceiver:best('fixedReceiver'),
    chargedReceiver:best('chargedReceiver'),
    addressFamilyScore:best('addressFamilyScore'),
  },
};

assert.equal(original.fixedReceiver,20);
assert.equal(original.chargedReceiver,20);
assert.equal(original.addressBlockHits,2);
assert.equal(original.addressFamilyScore,7);

console.log(JSON.stringify(result,null,2));
