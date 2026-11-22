'use strict';
/** Source-exact, read-only GP29 within-word lag-five conditional probability SFT.
 * Enumerates placements of each repeated rune type while retaining each word's
 * original rune inventory and exact observed adjacent-repeat *positions*.
 * Singleton labels can fill unused slots in equally many ways for each
 * accepted placement. Convolution gives finite-distribution tails without RNG.
 * @author Agent3 2026-11-17
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

function parseOriginal(raw){const text=raw.split("%").slice(0,55).join("%"),words=[];let cur="",start=0,page=0;for(const c of text){if(/[\u16a0-\u16ff]/u.test(c)){if(!cur)start=page;cur+=c;}else if(c==="%")page++;else if(c!=="/"&&!/\s/u.test(c)&&cur){words.push({letters:[...cur],physicalPage:start>=50?start+1:start});cur="";}}if(cur)words.push({letters:[...cur],physicalPage:start>=50?start+1:start});return words;}

function enumerateWord(letters,cache){const n=letters.length,counts=new Map();for(const l of letters)counts.set(l,(counts.get(l)||0)+1);const multiples=[...counts.values()].filter(x=>x>1),maxPairs=multiples.reduce((s,m)=>s+m*(m-1)/2,0),histogram=Array.from({length:14},()=>Array(maxPairs+1).fill(0)),observed=Array(14).fill(0);let adjacency=0;
for(let i=1;i<n;i++){if(letters[i]===letters[i-1])adjacency|=1<<(i-1);for(let d=2;d<=Math.min(13,i);d++)if(letters[i]===letters[i-d])observed[d]++;}
function placements(m){const key=n+","+m;if(cache.has(key))return cache.get(key);const chosen=[],ans=[];function pick(start){if(chosen.length===m){let mask=0,adjacent=0;const hits=Array(14).fill(0);for(let i=0;i<m;i++){mask|=1<<chosen[i];for(let j=0;j<i;j++){const d=chosen[i]-chosen[j];hits[d]++;if(d===1)adjacent|=1<<(chosen[i]-1);}}ans.push({mask,adjacent,hits});return;}for(let i=start;i<=n-m+chosen.length;i++){chosen.push(i);pick(i+1);chosen.pop();}}pick(0);cache.set(key,ans);return ans;}
let total=0;const active=Array(14).fill(0);function assign(g,used,mask){if(g===multiples.length){if(mask!==adjacency)return;total++;for(let d=2;d<=13;d++)histogram[d][active[d]]++;return;}for(const entry of placements(multiples[g])){if((entry.mask&used)!==0||(entry.adjacent&~adjacency)!==0)continue;for(let d=2;d<=13;d++)active[d]+=entry.hits[d];assign(g+1,used|entry.mask,mask|entry.adjacent);for(let d=2;d<=13;d++)active[d]-=entry.hits[d];}}assign(0,0,0);if(!total)throw Error("No arrangements "+letters.join(""));return {histogram,observed,total};}

function exactTail(entries,lag){let pdf=[1],mean=0,varr=0;for(const e of entries){const h=e.histogram[lag];let m=0,m2=0;for(let k=0;k<h.length;k++){const v=h[k]/e.total;m+=k*v;m2+=k*k*v;}mean+=m;varr+=m2-m*m;if(h.length===1)continue;const next=Array(pdf.length+h.length-1).fill(0);for(let i=0;i<pdf.length;i++)for(let k=0;k<h.length;k++)next[i+k]+=pdf[i]*h[k]/e.total;pdf=next;}const actual=entries.reduce((s,e)=>s+e.observed[lag],0);return {lag,actual,mean,sd:Math.sqrt(varr),upperTail:pdf.slice(actual).reduce((a,b)=>a+b,0),lowerTail:pdf.slice(0,actual+1).reduce((a,b)=>a+b,0),mass:pdf.reduce((a,b)=>a+b,0)};}

function run(raw){const words=parseOriginal(raw),cache=new Map(),chapterStarts=[0,3,8,15,23,27,33,40,54];if(words.length!==2896||words.reduce((s,w)=>s+w.letters.length,0)!==12956)throw Error("Wrong original source corpus");const entries=words.map(w=>({...enumerateWord(w.letters,cache),page:w.physicalPage,chapter:chapterStarts.findLastIndex(p=>w.physicalPage>=p)}));const global=Array.from({length:12},(_,i)=>exactTail(entries,i+2));const chapters=chapterStarts.map((p,k)=>{const es=entries.filter(e=>e.chapter===k);return {physicalStart:p,words:es.length,...exactTail(es,5)};});return {words:words.length,global,chapters};}

function main() {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
  assert.equal(enumerateWord([...'ABCA'], new Map()).total, 3);
  assert.equal(enumerateWord([...'AABCA'], new Map()).total, 2);
  const result = run(raw);
  assert.equal(result.words, 2896);
  const lagFive = result.global.find((value) => value.lag === 5);
  assert.equal(lagFive.actual, 104);
  assert.ok(Math.abs(lagFive.mean - 76.35915386915998) < 1e-9);
  assert.ok(Math.abs(lagFive.upperTail - 0.0005975781007454017) < 1e-10);
  assert.deepEqual(result.chapters.map((value) => value.words), [158,255,383,437,224,326,378,669,66]);
  for (const item of [...result.global,...result.chapters]) assert.ok(Math.abs(item.mass - 1) < 1e-10);
  console.log('Exact GP29 source: 2,896 words / 12,956 runes / per-word adjacency mask fixed');
  result.global.forEach((item) => console.log('DISTANCE',item.lag,JSON.stringify(item)));
  result.chapters.forEach((item) => console.log('CHAPTER',item.physicalStart,JSON.stringify(item)));
  console.log('Bonferroni 12 within-word lag tests:',12*lagFive.upperTail);
  console.log('PASS: finite-enumeration source gate and two independent toy controls');
}
if (require.main === module) main();
module.exports = {parseOriginal,enumerateWord,exactTail,run};
