'use strict';
const assert = require('node:assert/strict');
const { pages, prime } = require('../resources/liber-primus/lp2-corpus.json');
const p = pages.find(page => page.page === 57).indices;
const bounds = [[0, 7], [7, 37], [37, 67], [67, 95]];
const targets = [1259, 1031, 1229];
const mod = x => (x % 29 + 29) % 29;

/** @param {number[]} p @param {number} a @param {number} b @param {boolean} wrong */
function encode(p, a, b, wrong = false) {
  let previous = 0;
  return p.map(x => {
    const y = mod(x + a * previous + b);
    previous = wrong ? x : y;
    return y;
  });
}
/** @param {number[]} c @param {number} a @param {number} b */
function decode(c, a, b) {
  return c.map((x, i) => mod(x - a * (i ? c[i - 1] : 0) - b));
}
/** @param {number[]} c @param {number} a @param {number} b @param {number} l @param {number} h */
function sum(c, a, b, l, h) {
  let s = 0;
  for (let i = l; i < h; i++) s += prime[mod(c[i] - a * (i ? c[i - 1] : 0) - b)];
  return s;
}
/** @param {number[]} c @param {boolean} ordered */
function recover(c, ordered) {
  const train = [], hold = [], title = [];
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    const x = sum(c, a, b, 7, 37);
    if (ordered ? x !== 1259 : !targets.includes(x)) continue;
    const y = sum(c, a, b, 37, 67);
    if (ordered ? y !== 1031 : !targets.includes(y) || x === y) continue;
    const z = targets.find(t => t !== x && t !== y);
    train.push([a, b, z]);
    if (sum(c, a, b, 67, 95) !== z) continue;
    hold.push([a, b, z]);
    if (sum(c, a, b, 0, 7) === 449) title.push([a, b, z]);
  }
  return { train, hold, title };
}
assert.equal(p.length, 95);
assert.deepEqual(bounds.map(([l,h]) => p.slice(l,h).reduce((s,x) => s + prime[x], 0)), [449, ...targets]);
assert.equal(targets.reduce((a,b) => a*b,1),1595277641);

for (const ordered of [true, false]) {
  let seed = 0x3277a025;
  const rand = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  /** @param {number[]} arr */
  const shuffle = arr => {
    arr = arr.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const k = rand() % (i + 1);
      [arr[i], arr[k]] = [arr[k], arr[i]];
    }
    return arr;
  };
  const positive = () => ({n:0,trainUnique:0,heldUnique:0,titleUnique:0,maxTrain:0,maxHeld:0,exactOrder:0});
  const negative = () => ({n:0,trainNonempty:0,heldNonempty:0,titleNonempty:0});
  const stats = {native:positive(),wrong:negative(),shuffleCipher:negative(),shufflePlain:positive()};
  function recordPositive(c, a, b, expected, s) {
    const q = recover(c, ordered);
    assert(q.hold.some(k => k[0] === a && k[1] === b));
    assert.deepEqual(decode(c,a,b),expected);
    s.n++;
    s.trainUnique += q.train.length === 1;
    s.heldUnique += q.hold.length === 1;
    s.titleUnique += q.title.length === 1;
    s.maxTrain = Math.max(s.maxTrain,q.train.length);
    s.maxHeld = Math.max(s.maxHeld,q.hold.length);
    s.exactOrder += decode(c,a,b).join() === p.join();
  }
  for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
    recordPositive(encode(p,a,b),a,b,p,stats.native);
  }
  for (let t = 0; t < 128; t++) {
    const a = 1 + rand() % 28, b = rand() % 29;
    for (const [name,c] of [['wrong',encode(p,a,b,true)],['shuffleCipher',shuffle(encode(p,a,b))]]) {
      const q = recover(c,ordered), s = stats[name];
      s.n++;
      s.trainNonempty += q.train.length > 0;
      s.heldNonempty += q.hold.length > 0;
      s.titleNonempty += q.title.length > 0;
    }
    const sh = bounds.flatMap(([l,h]) => shuffle(p.slice(l,h)));
    recordPositive(encode(sh,a,b),a,b,sh,stats.shufflePlain);
  }
  console.log(JSON.stringify({ordered,stats,seedEnd:seed>>>0},null,2));
  assert.equal(stats.native.trainUnique,841);
  assert.equal(stats.native.heldUnique,841);
  assert.equal(stats.wrong.trainNonempty,0);
  assert.equal(stats.shuffleCipher.trainNonempty,0);
  assert.equal(stats.shufflePlain.trainUnique,128);
  assert.equal(stats.shufflePlain.exactOrder,0);
}
