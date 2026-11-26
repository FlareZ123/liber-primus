'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex = new Map(c.runes.map((r,i) => [r,i]));
const mod = x => (x%29+29)%29;
/** @param {number[]} w */
const sum = w => w.reduce((s,x) => s+c.prime[x],0);
/** @param {number} n */
function digits(n) {
  const a=[];
  do { a.unshift(n%29); n=Math.floor(n/29); } while(n);
  return a;
}
assert.deepEqual(digits(1033),[1,6,18]);
assert.deepEqual(digits(3301),[3,26,24]);
const words=[];
let w=[],pg=0,start=0,end=0;
for(const ch of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%')) {
  if(runeIndex.has(ch)) {
    if(!w.length) start=pg;
    end=pg;
    w.push(runeIndex.get(ch));
  } else if(ch==='%') pg++;
  else if(ch!=='/' && !/\s/u.test(ch) && w.length) {
    words.push({w,start,end}); w=[];
  }
}
if(w.length) words.push({w,start,end});
const flat=words.flatMap(o=>o.w);
assert.deepEqual(flat,c.pages.filter(p=>p.page<56).flatMap(p=>p.indices));
assert.equal(words.length,2896);
assert.equal(flat.length,12956);
/** @param {number[]} a */
function ioc(a) {
  const h=Array(29).fill(0);
  for(const x of a) h[x]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const rep=a=>a.reduce((s,x,i)=>s+Number(i>0 && x===a[i-1]),0);
assert.equal(rep(flat),86);
/** @param {number[]} p @param {number[]} k @param {number} sign @param {boolean} hold */
function enc(p,k,sign,hold) {
  let j=0;
  return p.map(x=>hold&&x===0?0:mod(x+sign*k[j++%k.length]));
}
/** @param {number[]} w @param {number[]} k @param {number} sign @param {boolean} hold */
function dec(w,k,sign,hold) {
  let states=new Map([[0,[]]]);
  for(const x of w) {
    const t=new Map();
    for(const [j,p] of states) {
      if(hold&&x===0&&!t.has(j)) t.set(j,[...p,0]);
      const y=mod(x-sign*k[j%k.length]);
      if((!hold||y!==0)&&!t.has(j+1)) t.set(j+1,[...p,y]);
    }
    states=t;
    if(!states.size) break;
  }
  return states;
}
const split=s=>s.split(/[^\u16A0-\u16FF]+/u).filter(Boolean);
const dict=new Set(native.sections.flatMap(s=>split(s.source_text)));
const str=w=>w.map(x=>c.runes[x]).join('');
for(const sign of [1,-1]) {
  const plain=[], bad=[];
  let coverage=0;
  for(let i=0;i<words.length;i++) {
    const k=digits(i?sum(words[i-1].w):0);
    const a=[...dec(words[i].w,k,sign,false).values()][0];
    plain.push(...a);
    if(dict.has(str(a))) coverage+=a.length;
    if(!dec(words[i].w,k,sign,true).size)
      bad.push({i,page:words[i].start>=50?words[i].start+1:words[i].start,k,c:words[i].w});
    assert.deepEqual(enc(a,k,sign,false),words[i].w);
  }
  assert.equal(bad.length,sign===1?371:383);
  assert.equal(coverage,sign===1?33:26);
  console.log('original', {sign,ioc:ioc(plain),reps:rep(plain),coverage,bad:bad.length,first:bad.slice(0,4),excerpt:plain.slice(0,80).map(i=>c.translit[i]).join('')});
  for(const s of native.sections.filter(s=>/warning|welcome|parable|loss/i.test(s.name))) {
    const pw=split(s.source_text).map(x=>[...x].map(y=>runeIndex.get(y)));
    for(const hold of [false,true]) {
      let last=[],ct=[],num=0,exact=0;
      for(const p of pw) {
        const k=digits(sum(last)),cw=enc(p,k,sign,hold);
        const ds=dec(cw,k,sign,hold);
        const j=hold?p.filter(x=>x!==0).length:p.length;
        assert(ds.has(j));
        const candidate=ds.get(j);
        assert.deepEqual(enc(candidate,k,sign,hold),cw);
        if(!hold) assert.deepEqual(candidate,p);
        if(JSON.stringify(candidate)===JSON.stringify(p)) exact+=p.length;
        ct.push(...cw);num+=p.length;last=cw;
      }
      console.log('control',{name:s.name,sign,hold,num,exact,ioc:ioc(ct),reps:rep(ct)});
    }
  }
}
