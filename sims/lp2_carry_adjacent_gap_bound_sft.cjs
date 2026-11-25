'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parts=read('resources/transcriptions/lp2-image-corrected.txt').split('%');
const prior=JSON.parse(read('im-results/lp2-postshuffle-allkey-segment-cover-broad-output.json'));
const src=[...parts.slice(0,50),'',...parts.slice(50,55)].join('%');
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @type {number[]} */
const g=[2],seams=[],c=[];
for(const ch of src){if(ri.has(ch)){c.push(ri.get(ch));g.push(0)}else if(ch==='/'||ch==='%'){seams.push(c.length)}else if(ch==='-'){g[c.length]=Math.max(1,g[c.length])}else if(!/\s/u.test(ch)){g[c.length]=2}}
g[c.length]=2;
/** @param {number[]} g @param {number[]} seams */
function swap(g,seams){const a=g.slice(),set=new Set(seams),moves=[];for(const b of [...set].sort((a,b)=>a-b)){if(b<2||b>g.length-3||g[b]!==0||g[b-1]===2||g[b+1]===2||[b-2,b-1,b+1,b+2].some(z=>set.has(z)))continue;const v=a[b-1];a[b-1]=a[b+1];a[b+1]=v;if(a[b-1]!==v)moves.push(b)}return {g:a,moves}}
/** @param {number[]} a @param {number} l @param {number} r */
function groups(a,l,r){let x=l,out=[];for(let i=l+1;i<=r;i++)if(a[i]||i===r){out.push(`${x}:${i}`);x=i}return out}
const f=swap(g,seams);
assert.deepEqual(swap(f.g,seams).g,g);
assert.equal(c.length,12956);assert.equal(g.filter(Boolean).length-1,2896);
const a=9640,b=12648,old=groups(g,a,b),next=new Set(groups(f.g,a,b)),lost=old.filter(x=>!next.has(x)).length;
const carry=[...new Set(seams)].filter(x=>x>a&&x<b&&!g[x]).length;
const moves=f.moves.filter(x=>x>a&&x<b).length;
assert.equal(old.length,669);assert.equal(next.size,669);assert.equal(lost,78);assert.equal(carry,104);assert.equal(moves,39);
const results=prior.originals.filter(x=>x.a===40&&x.b===53).map(x=>({q:x.q,oldMiss:x.miss,budget:x.budget,requiredRelocations:Math.ceil((x.miss-x.budget)/2),fixedLower:Math.max(0,x.miss-lost),onePerCarryLower:Math.max(0,x.miss-2*carry)}));
console.log(JSON.stringify({runes:c.length,groups:g.filter(Boolean).length-1,allMoves:f.moves.length,a,b,carry,moves,lost,results},null,2));
