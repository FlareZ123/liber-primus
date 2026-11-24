'use strict';
/**
 * Exact arbitrary latent plaintext-F hold equality ceiling for the same
 * physical-row/column shared GP29 pad family on original p40–48.
 * Node 22 CommonJS, no dependencies.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ix=new Map(c.runes.map((x,i)=>[x,i]));
const raw=read('resources/liber-primus/lp2-transcription.txt').split(/\r?\n/u).map(l=>[...l].filter(x=>ix.has(x)).map(x=>ix.get(x))).filter(l=>l.length);
let pos=0;const original=[];
for(const p of c.pages.filter(p=>p.page<56&&p.indices.length)){
  let a=[],n=0;while(n<p.indices.length){const l=raw[pos++];a.push(l);n+=l.length;}
  assert.deepEqual(a.flat(),p.indices);
  if(p.page>=40&&p.page<=48)original.push(a);
}
assert.equal(pos,594);assert.equal(original.flat(2).length,2408);
const shape=original.map(p=>p.map(l=>l.length)),R=Math.max(...shape.map(p=>p.length));
const dict=new Map(c.translit.map((x,i)=>[x,i])),tokens=[...dict.keys()].sort((a,b)=>b.length-a.length);
function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll('QU','CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S').replaceAll('ING','NG').replaceAll('IO','IA');for(let i=0;i<w.length;){const t=tokens.find(t=>w.startsWith(t,i));assert.ok(t);out.push(dict.get(t));i+=t.length;}}return out;}
function countPairs(a,b){let e=0,n=Math.min(a.length,b.length);for(let i=0;i<n;i++)e+=a[i]===b[i];return e;}
function rowMatches(ls){let e=0;for(let i=0;i<ls.length;i++)for(let j=0;j<i;j++)e+=countPairs(ls[i],ls[j]);return e;}
/** Every C=0 may be a hold or a consuming ciphertext rune. */
function variants(line){const a=[[]];for(const x of line){const n=a.length;if(x===0){for(let i=0;i<n;i++)a.push(a[i].concat(0));}else for(const l of a)l.push(x);}return a;}
/** Exact joint maximum over all page masks, not separate pair maxima. */
function ceiling(lines){
  const opts=lines.map(variants).sort((a,b)=>b.length-a.length),m=opts.length;
  const pairs=opts.map((a,i)=>opts.slice(0,i).map(b=>a.map(x=>Int16Array.from(b,y=>countPairs(x,y)))));
  const choose=new Int32Array(m);let best=-1,leaves=0;
  function dfs(i,s){if(i===m){leaves++;if(s>best)best=s;return;}for(let k=0;k<opts[i].length;k++){let v=s;for(let j=0;j<i;j++)v+=pairs[i][j][k][choose[j]];choose[i]=k;dfs(i+1,v);}}
  dfs(0,0);
  assert.equal(leaves,2**lines.reduce((n,l)=>n+l.filter(x=>x===0).length,0));
  return {best,leaves};
}
function rows(pages){return Array.from({length:R},(_,r)=>pages.map(p=>p[r]||[]));}
function scorePlain(pages){return rows(pages).reduce((s,ls)=>s+rowMatches(ls.map(l=>l.filter(x=>x!==0))),0);}
function shapeText(seq,start){let p=start;return shape.map(pg=>pg.map(n=>{const l=seq.slice(p,p+n);p+=n;assert.equal(l.length,n);return l;}));}
// Small planted control with literal transparent Fs and genuine consuming zeros.
const smallPlain=[[0,1,2,0,3,4],[1,0,2,3,0,4],[1,2,0,3,4,0]];
const smallKey=[28,27,26,25];
const smallCipher=smallPlain.map(l=>{let j=0;return l.map(x=>x===0?0:(x+smallKey[j++])%29);});
assert.ok(smallCipher.some((l,i)=>l.some((x,j)=>x===0&&smallPlain[i][j]!==0)));
const trueScore=rowMatches(smallPlain.map(l=>l.filter(x=>x!==0)));
assert.ok(ceiling(smallCipher).best>=trueScore);
// Independent simple Cartesian reference for the small original-mask oracle.
let brute=-1;
for(const a of variants(smallCipher[0]))for(const b of variants(smallCipher[1]))for(const d of variants(smallCipher[2]))brute=Math.max(brute,rowMatches([a,b,d]));
assert.equal(ceiling(smallCipher).best,brute);
console.log(JSON.stringify({control:{smallCipher,trueScore,brute}}));
const sources=['resources/control/shakespeare_first300k.txt','resources/control/gibran_prophet_58585.txt','resources/control/emerson_essays_2944.txt'];
const donorStarts=[125000,4000,5000];
for(let k=0;k<sources.length;k++){
 const seq=gp(read(sources[k])),start=donorStarts[k];
 const fixed=scorePlain(shapeText(seq,start)),scores=[];
 // Exactly 100 deterministic heldout donor starts, no original-based selection.
 const lo=k===0?120000:0,hi=seq.length-2408;
 for(let j=0;j<100;j++)scores.push(scorePlain(shapeText(seq,lo+Math.floor(j*(hi-lo)/99))));
 scores.sort((a,b)=>a-b);
 console.log(JSON.stringify({source:sources[k],fixed,min:scores[0],median:scores[50],max:scores[99]}));
}
const limits=rows(original).map(ceiling);
const max=limits.reduce((s,r)=>s+r.best,0);
const noHold=rows(original).reduce((s,ls)=>s+rowMatches(ls),0);
assert.equal(noHold,342);
console.log(JSON.stringify({original:{noHold,max,limits}}));
