'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync(process.argv[2] || 'resources/liber-primus/lp2-corpus.json','utf8'));
const sentences = [
  'It is stating the same paradox in another form to say that we can only achieve inner unity by transcending mere individuality.',
  'The independent, impervious self shows its unreality by being inwardly discordant.',
  'It is of no use to enlarge the circumference of our life, if the fixed centre is always the ego.',
  'There are, if I may press the metaphor, other circles with other centres, in which we are vitally involved.'
];
// W. R. Inge, Christian Mysticism (1899), lecture I, p. 33.
// https://www.gutenberg.org/ebooks/14596
function encode(s, fuse) {
  return s.toUpperCase().match(/[A-Z]+/g).flatMap(w => {
    w = w.replace(/QU/g,'CW').replace(/K/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
    const out = [];
    while (w) {
      const n = corpus.translit.indexOf(w.slice(0,2));
      if (n >= 0 && w.length >= 2 && (fuse || w.startsWith('TH'))) {
        out.push(n); w = w.slice(2);
      } else {
        const k = corpus.translit.indexOf(w[0]); assert(k >= 0);
        out.push(k); w = w.slice(1);
      }
    }
    return out;
  });
}
function matches(p, c, offset, q, hold) {
  const f = new Int8Array(q*29).fill(-1), b = new Int8Array(q*29).fill(-1);
  let t = 0;
  for (let i=0;i<p.length;i++) {
    const a = p[i], v = c[offset+i];
    if (hold && a===0) { if (v!==0) return false; continue; }
    const z = (t++ % q)*29;
    if ((f[z+a]>=0 && f[z+a]!==v) || (b[z+v]>=0 && b[z+v]!==a)) return false;
    f[z+a]=v; b[z+v]=a;
  }
  return true;
}
const ct = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(ct.length,12956);
const results = [];
for (const [name, source, limit] of [['paragraph',sentences.join(' '),64],...sentences.map((s,i)=>['sentence-'+(i+1),s,16])]) {
  for (const fuse of [true,false]) for (const hold of [false,true]) {
    const p = encode(source,fuse);
    const q = name==='paragraph' ? 29 : 13;
    let t=0;
    const plant = p.map(a=>{if(hold && a===0)return 0;const phase=t++%q;return (a*(1+phase%28)+phase)%29;});
    assert(matches(p,plant,0,q,hold));
    const counts=[];
    for (let period=1;period<=limit;period++) {
      let count=0;
      for (let i=0;i+p.length<=ct.length;i++) if(matches(p,ct,i,period,hold)) count++;
      counts.push(count);
    }
    results.push({name,fuse,hold,len:p.length,offsets:ct.length-p.length+1,counts,plant:true});
  }
}
console.log(JSON.stringify(results,null,2));
assert(results.every(r=>r.counts.every(n=>n===0)));
