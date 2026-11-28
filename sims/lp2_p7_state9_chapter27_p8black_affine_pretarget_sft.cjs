'use strict';
/**
 * PRETARGET freeze, Agent7 2026-11-28.
 *
 * Prior source-selected objects:
 *   state9 = [p,e,g,a,b,A,B,K,q] = [23,3,5,6,15,8,19,2,4]
 *     (existing p7/p15 source-only state donor order)
 *   chapter27 = exact 27-rune p7-inverse-row -> chapter-word itinerary
 *   p8 black = 243 = 9*27 source runes.
 *
 * Freeze the only two role assignments of these rows/columns into an ordinary
 * GF29 affine cipher C=a*P+b:
 *   A: a=state9[row], b=chapter27[col]
 *   B: a=chapter27[col], b=state9[row]
 * Row-major receiver position i fixes row=floor(i/27), col=i mod27.
 *
 * No state permutation, transpose, sign, phase, word reset, F bypass, score,
 * target plaintext, or alternative formula is consulted.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),Q=29,mod=x=>((x%Q)+Q)%Q;
const inv=x=>{for(let y=1;y<Q;y++)if(mod(x*y)===1)return y;throw new Error('nonunit '+x);};
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));

const state9=[23,3,5,6,15,8,19,2,4];
const chapter27=[27,9,16,9,8,6,1,27,8,1,12,22,9,8,6,1,27,8,1,27,23,13,21,1,7,24,19];
assert.equal(state9.length,9);
assert.equal(chapter27.length,27);
assert.ok(state9.every(x=>x!==0));
assert.ok(chapter27.every(x=>x!==0));

const p8=corpus.pages.find(x=>x.page===8),ann=ink.pages.find(x=>x.page===8);
const isRed=Array(p8.indices.length).fill(false);
for(const sp of ann.red_spans)for(let i=sp.start;i<sp.start+sp.length;i++)isRed[i]=true;
const black=p8.indices.filter((_,i)=>!isRed[i]);
assert.equal(black.length,243);
assert.equal(black.length,state9.length*chapter27.length);

function decode(role){
  return black.map((c,i)=>{
    const row=Math.floor(i/27),col=i%27;
    const a=role==='state_multiplier'?state9[row]:chapter27[col];
    const b=role==='state_multiplier'?chapter27[col]:state9[row];
    return mod(inv(a)*(c-b));
  });
}
function encode(plain,role){
  return plain.map((p,i)=>{
    const row=Math.floor(i/27),col=i%27;
    const a=role==='state_multiplier'?state9[row]:chapter27[col];
    const b=role==='state_multiplier'?chapter27[col]:state9[row];
    return mod(a*p+b);
  });
}
const variants=['state_multiplier','chapter_multiplier'].map(role=>{
  const decoded=decode(role);
  assert.deepEqual(encode(decoded,role),black);
  return {role,decodedIndices:decoded,decodedTranslit:decoded.map(i=>corpus.translit[i]).join('')};
});
console.log(JSON.stringify({
  schema:1,
  classification:'PRETARGET FROZEN 9x27 GF29 affine receiver family',
  state9,
  chapter27,
  receiver:{page:8,kind:'black-only',runes:black.length,shape:[9,27],note:'arithmetic shape; printed page has 12 text lines, not a visual 9x27 grid'},
  variants
},null,2));
