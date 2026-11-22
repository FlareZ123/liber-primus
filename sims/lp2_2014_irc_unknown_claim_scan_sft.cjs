'use strict';
/**
 * Dated 2014 IRC in-message unknown-LP2 plaintext and cipher claim index.
 * This is a source-selection scan, never an asserted plaintext recovery.
 * Input is one original immutable Git blob, validated before any parsing.
 * Node.js 22 on Windows 11.
 *
 * node sims/lp2_2014_irc_unknown_claim_scan_sft.cjs --selftest
 * node sims/lp2_2014_irc_unknown_claim_scan_sft.cjs <original.log>
 *
 * @module lp2_2014_irc_unknown_claim_scan_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const SHA = 'bdd277c14f94c34b5ae714cd00c238065beeed4e';
const BYTES = 18487233;
const timestamp = /^2014 (?:May|Jun|Jul|Aug) \d{2} \d{2}:\d{2} /;
const unknownPage = /\b(?:page|pg|p)\s*#?\s*(?:0?[0-9]|[1-4]\d|5[0-5])\b/i;
const p56 = /\b(?:page|pg|p)\s*#?\s*(?:56|57)\b/i;
const firstPerson = /\b(?:i|we|someone|they|he|she|we've|i've)\b/i;
const solve = /\b(?:solved?|decoded?|decipher(?:ed)?|decrypt(?:ed|ion)?|cracked?|translated?|translation|plaintext|cleartext)\b/i;
const word = /\b(?:word|phrase|sentence|line|passage|paragraph|means?|says?|reads?|text)\b/i;
const operation = /\b(?:key|shift|prime|totient|vigen[eè]re|caesar|transposition|permutation|cipher|algorithm|method|offset)\b/i;
const quotation = /["“][^"”]{14,}["”]|(?:^|\s)(?:[A-Z]{3,}\s){3,}[A-Z]{3,}/;
const nativeRunes = /[\u16a0-\u16ff]{6,}/i;
const wrongPage = /\b(?:2014|2013|2012|page\s*5[67]|p5[67])\b/i;

/**
 * @param {string} message
 * @returns {{score:number,tags:string[]}}
 */
function classify(message) {
  const tags = [];
  let score = 0;
  if (unknownPage.test(message)) {tags.push('unknown-page');score+=8;}
  if (solve.test(message)) {tags.push('solve-word');score+=5;}
  if (word.test(message)) {tags.push('text-reference');score+=2;}
  if (operation.test(message)) {tags.push('operation');score+=2;}
  if (firstPerson.test(message)) {tags.push('speaker');score+=1;}
  if (quotation.test(message)) {tags.push('quote');score+=4;}
  if (nativeRunes.test(message)) {tags.push('rune-string');score+=3;}
  if (/\b(?:just|finally|managed|actually|real(?:ly)?|already)\b/i.test(message) && solve.test(message)){tags.push('claim-confidence');score+=3;}
  if (/\b(?:i (?:think|believe|guess)|maybe|perhaps|could|might|hypothesis)\b/i.test(message)) {tags.push('conjecture');score-=2;}
  if (p56.test(message)) {tags.push('solved-page');score-=10;}
  if (/\b(?:bot|http|https|twitter|github|pastebin|titanpad)\b/i.test(message))score-=2;
  if (/\b(?:joke|lol|jk|trolling)\b/i.test(message)) score-=2;
  return {score,tags};
}

/**
 * @param {string[]} lines
 */
function scan(lines) {
  const proposed=[];
  for(let i=0;i<lines.length;i++) {
    const line=lines[i];
    if(!timestamp.test(line)) continue;
    const msg=line.replace(/^2014 \w{3} \d\d \d\d:\d\d /,'');
    if (!/^<[^>]{1,45}> /.test(msg)) continue;
    const signal=unknownPage.test(msg) || (
       solve.test(msg) && (word.test(msg)||operation.test(msg)||quotation.test(msg))
    ) || nativeRunes.test(msg);
    if(!signal) continue;
    const {score,tags}=classify(msg);
    if(score<6) continue;
    proposed.push({line:i+1,when:line.slice(0,17),nick:msg.match(/^<([^>]+)>/)?.[1]??'',
      score,tags,msg:msg.slice(0,600)});
  }
  proposed.sort((a,b)=>b.score-a.score||a.line-b.line);
  const choices=[],perDay=new Map();
  for(const p of proposed) {
    const day=p.when.slice(0,11);
    if((perDay.get(day)||0)>=6)continue;
    if(choices.some(c=>Math.abs(c.line-p.line)<3))continue;
    choices.push(p);
    perDay.set(day,(perDay.get(day)||0)+1);
    if(choices.length>=110)break;
  }
  return {proposed,choices};
}

/** @param {Buffer} b */
function blobHash(b) {
  return crypto.createHash('sha1').update('blob '+b.length+'\0','ascii')
    .update(b).digest('hex');
}
function selftest() {
  const source=[
    '2014 May 27 21:02 <X> i decoded page 13 it says LEARN FROM YOURSELF',
    '2014 May 27 21:03 <X> page 56 says AN END: WITHIN',
    '2014 Jun 03 01:01 <Y> I think page 0 can be decrypted using the key word',
    '2014 Jun 03 01:03 <Z> the weather is fine',
    '2014 Jun 04 12:03 <Y> i solved page 21 with a key and this phrase "WE ARE ONE"',
  ];
  const found=scan(source);
  assert(found.proposed.some(x=>x.line===1&&x.tags.includes('unknown-page')));
  assert(!found.proposed.some(x=>x.line===2));
  assert(found.proposed.some(x=>x.line===5));
  console.log(JSON.stringify({selftest:'PASS',proposed:found.proposed.length}));
}
function main(){
  selftest();
  if(process.argv.includes('--selftest'))return;
  assert.equal(process.argv.length,3,'Require the source-pinned original IRC path');
  const b=fs.readFileSync(process.argv[2]);
  assert.equal(b.length,BYTES);
  assert.equal(blobHash(b),SHA);
  const lines=b.toString('latin1').split(/\r?\n/);
  const {proposed,choices}=scan(lines);
  console.log('SOURCE '+JSON.stringify({sha1:SHA,bytes:b.length,lines:lines.length,
    candidateMessages:proposed.length,selected:choices.length}));
  for(const p of choices) {
    const around=lines.slice(Math.max(0,p.line-3),Math.min(lines.length,p.line+2))
      .map((x,k)=>({n:Math.max(0,p.line-3)+k+1,text:x.slice(0,520)}));
    console.log('CANDIDATE '+JSON.stringify({...p,around}));
  }
}
main();