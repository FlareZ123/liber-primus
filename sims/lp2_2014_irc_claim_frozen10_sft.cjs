'use strict';
/**
 * Frozen ten distinct 2014 in-channel unknown-page plaintext candidates.
 * Line numbers are 1-based in the original Git blob bdd277... No keyword
 * mining or candidate selection after original context is inspected.
 * This program does not authenticate claimed plaintext or infer secret keys.
 * @module lp2_2014_irc_claim_frozen10_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const SHA='bdd277c14f94c34b5ae714cd00c238065beeed4e';
const NBYTES=18487233;
const candidates=[
  [185125,'p25 CONDITIONEDNESS 14-rune full-word guess'],
  [185988,'p0 alleged totient hit'],
  [204070,'p0 first eight-rune decoded-word remark'],
  [216041,'p34 undisclosed solve claim'],
  [235622,'p40 HE SAID line-8/9 claim'],
  [186408,'p36 THE FOLLOWING RULES predicted phrase'],
  [182827,'p42 decode contradicts page-zero theory'],
  [184913,'May21 mod29 prime-minus-one trial'],
  [181056,'p55 prime-continuation hint after solved p56'],
  [198542,'p04 in-message plaintext words DON\'T/CAN\'T']
];
function blob(buf){
 return crypto.createHash('sha1').update('blob '+buf.length+'\0','ascii')
  .update(buf).digest('hex');
}
/** @param {string[]} rows */
function context(rows){
 return candidates.map(([line,topic])=>{
   const before=11,after=16;
   return {line,topic,
     context:rows.slice(line-1-before,line+after).map((text,k)=>({
       originalLine:line-before+k,text:text.slice(0,650)
     })),
   };
 });
}
function main(){
  assert.equal(candidates.length,10);
  assert.equal(new Set(candidates.map(x=>x[0])).size,10);
  const fake=Array(240000).fill('2014 May 21 11:15 <test> null');
  fake[185124]='2014 May 21 19:54 <test> p25 CONDITIONEDNESS';
  assert(context(fake)[0].context.some(x=>x.originalLine===185125&&x.text.includes('CONDITIONEDNESS')));
  console.log('FROZEN-CLAIM-CONTEXT SELFTEST PASS');
  if(process.argv.includes('--selftest'))return;
  assert.equal(process.argv.length,3);
  const raw=fs.readFileSync(process.argv[2]);
  assert.equal(raw.length,NBYTES);
  assert.equal(blob(raw),SHA);
  const rows=raw.toString('latin1').split(/\r?\n/);
  console.log('ORIGINAL '+JSON.stringify({SHA,NBYTES,lines:rows.length,frozen10:candidates}));
  for(const x of context(rows))console.log('WINDOW '+JSON.stringify(x));
}
main();