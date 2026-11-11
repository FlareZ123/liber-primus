'use strict';

/** Original GP29 reserved-EA repeat-channel test; Node 22 / CommonJS. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tr = new Map(corpus.translit.map((s,i)=>[s,i]));
assert.equal(tr.get('EA'),28);

/** Adjacent-equal ciphertext records, preserving printed words across page wraps. */
function unknownEvents() {
  const input=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%');
  const words=[];let current=[],previous=null;
  function finish(){if(current.length){words.push(current);current=[];}}
  for(const ch of input) {
    if(/[\u16A0-\u16FF]/u.test(ch)){current.push(previous===ch);previous=ch;}
    else if(ch==='%'||ch==='/'||/\s/u.test(ch)){}
    else finish();
  }
  finish();
  const events=[];
  for(const w of words)for(let j=0;j<w.length;j++)if(w[j])
    events.push({start:j===0,end:j===w.length-1,middle:j>0&&j<w.length-1});
  return {words:words.length,runes:words.reduce((s,w)=>s+w.length,0),events};
}

/** GP-native lexical tokenizer, matching the repository's English controls. 
 * @param {string} word
 */
function encodeWord(word){
  const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    const pair=s.slice(i,i+2);
    if(tr.has(pair)){out.push(tr.get(pair));i+=2;}
    else {if(tr.has(s[i]))out.push(tr.get(s[i]));i++;}
  }
  return out;
}

/** @param {Array<{start:boolean,end:boolean,middle:boolean}>} events */
function count(events) {
  return {total:events.length,start:events.filter(x=>x.start).length,
    end:events.filter(x=>x.end).length,middle:events.filter(x=>x.middle).length};
}

/** Exhaustive overlapping 86-consecutive-EA-event windows, without a false IID claim.
 * @param {Array<{start:boolean,end:boolean,middle:boolean}>} events
 */
function windows(events){
  const n=86,a=[0],b=[0];
  for(const x of events){a.push(a.at(-1)+Number(x.start));b.push(b.at(-1)+Number(x.end));}
  let maxStart=0,maxEnd=0,exceedStart=0,exceedEnd=0;
  for(let i=0;i+n<=events.length;i++){
    const s=a[i+n]-a[i],e=b[i+n]-b[i];
    maxStart=Math.max(maxStart,s);maxEnd=Math.max(maxEnd,e);
    exceedStart+=Number(s>=23);exceedEnd+=Number(e>=19);
  }
  return {windows:events.length-n+1,maxStart,maxEnd,exceedStart,exceedEnd};
}
const unknown=unknownEvents(), observed=count(unknown.events);
assert.deepEqual([unknown.words,unknown.runes,observed.total,observed.start,observed.end,observed.middle],
  [2896,12956,86,23,19,44]);
const sources=[
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
];
const controls=sources.map(([name,p])=>{
  let runes=0,events=[];
  for(const token of read(p).match(/[A-Za-z]+/g)||[]){
    const w=encodeWord(token);runes+=w.length;
    for(let j=0;j<w.length;j++)if(w[j]===28)
      events.push({start:j===0,end:j===w.length-1,middle:j>0&&j<w.length-1});
  }
  return {name,runes,...count(events),...windows(events)};
});
assert.deepEqual(controls.map(x=>[x.total,x.start,x.end,x.middle]),
  [[1633,98,25,1510],[606,60,20,526],[2224,237,40,1947]]);
assert.deepEqual(controls.map(x=>[x.maxStart,x.maxEnd]),[[11,7],[17,6],[17,7]]);
assert(controls.every(x=>x.exceedStart===0&&x.exceedEnd===0));
const N=controls.reduce((s,x)=>s+x.runes,0), E=controls.reduce((s,x)=>s+x.total,0);
console.log(JSON.stringify({hypothesis:'ciphertext repetition = plaintext EA (GP28)',
  unknown:{words:unknown.words,runes:unknown.runes,...observed},
  controlExpectedEA:unknown.runes*E/N,controls},null,2));
