'use strict';
/**
 * Independent GF(29) carry-anchor symmetry test and exact counting bound.
 * Run from repository root. Uses the identical frozen lexical register as
 * lp2_shared_gp29_q8_symbolic_graph_sft.cpp. No p55 ciphertext is used.
 */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const src = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-page-groups-54-55-derived.json', 'utf8'));
const words = fs.readFileSync('resources/control/english_wordfreq_textblob.txt', 'utf8');
const fixture = JSON.parse(fs.readFileSync('im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json', 'utf8'));
const A = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const S = '0123456789abcdefghijklmnopqrs';
const D = new Set();
for (const line of words.split(/\r?\n/)) {
  const q = line.match(/^([a-z]+)\s+([0-9]+)\s*$/);
  if (!q) continue;
  const w = q[1].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  function go(i,s) {
    if (i === w.length) { D.add(s); return; }
    for (let n=1; n<=3 && i+n<=w.length; n++) {
      const t = w.slice(i,i+n), x = n===3 ? (t==='ING'?21:-1) : A.indexOf(t);
      if (x>=0) go(i+n,s+S[x]);
    }
  }
  go(0,'');
}
const base = D.size;
for (const w of fixture.added.split(/\s+/)) D.add(w);
const by = Array(60).fill(0);
for (const w of D) by[w.length]++;
const prefixes = [...new Set([...D].filter(w=>w.length===11).map(w=>w.slice(0,10)))].sort();
assert.equal(base,38910); assert.equal(D.size,38938); assert.equal(prefixes.length,2168);
const train=src.p54.body_groups, carry=train.at(-1), c=[...carry].map(x=>S.indexOf(x));
assert.equal(train.length,48); assert.equal(train.join('').length,223); assert.equal(carry,'63g2eis46q');
const inv=Array(29).fill(0);
for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(x*y%29===1)inv[x]=y;
const mod=x=>(x%29+29)%29, N=37, row=()=>Array(N+1).fill(0);
/** Reduce augmented GF(29) rows to canonical form. */
function rref(rows) {
  const pivots=[]; let at=0;
  for(let j=0;j<N;j++){
    let i=at; while(i<rows.length&&!rows[i][j])i++;
    if(i===rows.length)continue;
    [rows[i],rows[at]]=[rows[at],rows[i]];
    const z=inv[rows[at][j]];
    for(let t=j;t<=N;t++)rows[at][t]=rows[at][t]*z%29;
    for(let u=0;u<rows.length;u++)if(u!==at&&rows[u][j]){
      const v=rows[u][j];for(let t=j;t<=N;t++)rows[u][t]=mod(rows[u][t]-v*rows[at][t]);
    }
    pivots.push(j);at++;
  }
  for(let i=at;i<rows.length;i++)if(rows[i][N])return null;
  rows.length=at;return {rows,pivots};
}
/** Necessary carry state: pi(0)=0, sum(pi)=0, k0=1, no forced collisions
 * and no forced period four. This is a relaxation, not a full key fit. */
function state(p,start){
  const rows=[];let x=row();x[0]=1;rows.push(x);
  x=row();x[29]=1;x[N]=1;rows.push(x);
  x=row();for(let j=0;j<29;j++)x[j]=1;rows.push(x);
  let j=start;
  for(let i=0;i<c.length;i++){
    const a=p[i],b=c[i];
    if(!a){if(b)return null;continue;}
    if(j===0&&a===b)return null;
    x=row();x[b]=1;x[a]=mod(x[a]-1);x[29+j]=mod(x[29+j]-1);rows.push(x);j=(j+1)%8;
  }
  const z=rref(rows);if(!z)return null;
  const free=[];for(let j=0;j<N;j++)if(!z.pivots.includes(j))free.push(j);
  const forms=[];
  for(let j=0;j<N;j++){
    const i=z.pivots.indexOf(j);
    forms.push(i<0?free.map(x=>x===j?1:0).concat(0).join(','):free.map(x=>mod(-z.rows[i][x])).concat(z.rows[i][N]).join(','));
  }
  if(new Set(forms.slice(0,29)).size!==29)return null;
  if([0,1,2,3].every(a=>forms[29+a]===forms[33+a]))return null;
  return z.rows.map(v=>v.map(a=>S[a]).join('')).join('|');
}
let oldCount=0,newCount=0,wordsOld=0,wordsNew=0;
const oldStates=new Set(),newStates=new Set(),byStart=Array(8).fill(0);
for(const w of prefixes){
  const p=[...w].map(x=>S.indexOf(x));let consumed=0,canon=-1;
  for(let i=0;i<c.length;i++){
    if(!p[i])continue;
    if(p[i]!==c[i]){canon=(8-consumed%8)%8;break;}
    consumed++;
  }
  let a=0,b=0;
  for(let j=0;j<8;j++){
    const s=state(p,j);if(s===null)continue;
    a++;oldCount++;oldStates.add(s);
    if(canon<0||j===canon){b++;newCount++;newStates.add(s);byStart[j]++;}
  }
  if(a)wordsOld++;if(b)wordsNew++;
  assert.ok(!a||b,`Gauge lost carry prefix ${w}`);
}
assert.equal(oldStates.size,720);assert.equal(newStates.size,93);
assert.equal(wordsOld,93);assert.equal(wordsNew,93);
// Number of effective actions modulo rotation and scale. Primitive q8
// excludes all period-dividing-four vectors.
const fact=n=>{let x=1n;for(let i=2;i<=n;i++)x*=BigInt(i);return x;};
const actions=fact(28)*(29n**8n-29n**4n)/(28n*8n);
// Uniform null conditional on exact original 223-rune adjacent-equality mask.
// Ignoring cross-group constraints in the numerator is an upper bound.
const universe=w=>29n*28n**BigInt([...w].slice(1).filter((x,i)=>x!==w[i]).length);
const supportBound=(w,count)=>{const a=8n*BigInt(count),b=universe(w);return a<b?a:b;};
// Any <=3 OOV fit is counted by at least one exactly-three-omissions subset.
const dp=[1n,0n,0n,0n];
for(const w of train.slice(0,-1)){
  const U=universe(w),B=supportBound(w,by[w.length]);
  for(let j=3;j>=0;j--)dp[j]=dp[j]*B+(j?dp[j-1]*U:0n);
}
const numerator=actions*supportBound(carry,prefixes.length)*dp[3];
const denominator=universe(train.join(''));
function log10(x){const s=x.toString();return s.length-1+Math.log10(Number(s.slice(0,15))/10**(Math.min(15,s.length)-1));}
const result={dictionary:base,augmented:D.size,prefixes:prefixes.length,carry,oldCount,newCount,oldStates:oldStates.size,newStates:newStates.size,wordsOld,wordsNew,byStart,actionCount:actions.toString(),actionLog10:log10(actions),nullBoundLog10:log10(numerator)-log10(denominator),trainingRunes:train.join('').length,internalEqualities:[...train.join('')].slice(1).filter((x,i)=>x===train.join('')[i]).length,countsByLength:by.slice(0,14)};
console.log(JSON.stringify(result,null,2));
