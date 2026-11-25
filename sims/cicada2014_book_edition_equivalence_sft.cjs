// Node >=18. Replays only the signed 2014 historical coordinates.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sources = [
  ['participant witness', null],
  ['Gutenberg 2001 edition 10', 'https://raw.githubusercontent.com/GITenberg/Essays---First-Series_2944/9210518e45c73c99d03083c2bdfb0a6d32fae289/old/1srwe10.txt'],
  ['Gutenberg revised copy', 'https://raw.githubusercontent.com/GITenberg/Essays---First-Series_2944/9210518e45c73c99d03083c2bdfb0a6d32fae289/2944.txt'],
  ['Monadnock 2012', 'https://raw.githubusercontent.com/MonadnockValleyPress/monadnock/c6c30eefad86fdd0762e77c5fb8cd65a0678f03f/emerson/self-reliance.html']
];
const signed = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/001-twitter/zN4h51m.jpg.asc';
/** @param {string} url */
async function download(url) { const r = await fetch(url); assert(r.ok, url+' '+r.status); return r.text(); }
/** @param {string} t @param {boolean} html */
function paragraphs(t, html) {
  t=t.replace(/\r\n/g,'\n');
  if (html) {
    const p=[...t.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)].map(m=>m[1].replace(/<[^>]*>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&'));
    const i=p.findIndex(x=>/^I read the other day/i.test(x.trim())); assert(i>=0); return p.slice(i);
  }
  const start=t.search(/I READ the other day some verses/i); assert(start>=0); return t.slice(start).split(/\n\s*\n/);
}
/** @param {string[]} p @param {number[][]} coords @param {boolean} skip */
function replay(p,coords,skip) {
  return coords.map(([a,b,c,d])=>{
    const word=p[a-1+(skip&&a>=45?1:0)]?.trim().split(/(?<=[.!?])\s+/)[b-1]?.trim().split(/\s+/)[c-1];
    return {word,letter:word?.[d-1]??'?'};
  });
}
async function main() {
  const msg=await download(signed);
  const coords=msg.split(/\r?\n/).filter(x=>/^\d+:\d+:\d+:\d+$/.test(x)).map(x=>x.split(':').map(Number));
  assert.equal(coords.length,15);
  const outputs=[];
  for(const [name,url] of sources) {
    const raw=url?await download(url):await fs.readFile(path.join(__dirname,'../resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt'),'utf8');
    const p=paragraphs(raw,name==='Monadnock 2012');
    assert.match(p[44],/^4\. As our Religion/);
    const literal=replay(p,coords,false), adjusted=replay(p,coords,true);
    assert.equal(literal.map(x=>x.letter).join(''),'au?gn?jtvdbl?pv');
    assert.equal(adjusted.map(x=>x.letter).join(''),'auqgnxjtvdbllpv');
    outputs.push(adjusted.map(x=>x.word));
    console.log(name, {literal,adjusted});
  }
  for(const x of outputs) assert.deepEqual(x,outputs[0]);
  console.log('PASS: all four witnesses are coordinate-equivalent.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
