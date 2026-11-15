'use strict';
/**
 * LP2 p40–53 floral five-site all-secret Bacon mapping:
 * exhaust every stationary 29-rune -> binary mask consistent with 600
 * printed five-rune groups and conventional A=0..Z=25 output.
 * The original red eight-rune p40 heading selects phase zero.
 *
 * This is the p40 source-scope extension of the pre-existing p23 method,
 * not an invention of a new Bacon cipher or a source-authorized decoder.
 * @module lp2_p40_flower_bacon_allsecret_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const examples=[
 ['Gibran',read('resources/control/gibran_prophet_58585.txt')],
 ['Emerson',read('resources/control/emerson_essays_2944.txt')],
 ['Shakespeare',read('resources/control/shakespeare_first300k.txt')]
].map(([name,s])=>[name,s.toUpperCase().replace(/[^A-Z]/g,'')]);
const RUNES=29,ALPHA=26,CODE=5,HOLD=600;
const original=corpus.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(original.length,3008);
const red=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0);
assert.equal(red.length,8);
assert.deepEqual(original.slice(0,8).map(x=>corpus.runes[x]).join(''),red.runes);
const body=original.slice(8);
assert.equal(body.length,3000);
const groups=Array.from({length:HOLD},(_,i)=>body.slice(i*5,i*5+5));
/** @param {string} s @returns {number[]} */
const indices=s=>[...s].map(ch=>ch.charCodeAt(0)-65);
/** @param {number[]} a @returns {string} */
const letters=a=>a.map(x=>String.fromCharCode(65+x)).join('');
/**
 * Build one fixed 26-letter log-quadgram model with all 600 holdout
 * letters completely excluded. Entire corpus is otherwise read as-is.
 * @returns {Float64Array}
 */
function model(){
 const freq=new Uint32Array(ALPHA**4);
 let total=0;
 for(const [,doc] of examples){
  const nums=indices(doc.slice(0,5000)+doc.slice(5600));
  for(let i=0;i+3<nums.length;i++){
   freq[((nums[i]*26+nums[i+1])*26+nums[i+2])*26+nums[i+3]]++;total++;
  }
 }
 const denominator=total+freq.length*0.05;
 return Float64Array.from(freq,c=>Math.log((c+0.05)/denominator));
}
const weights=model();
/** @param {number[]} ary @returns {number} */
function score(ary){let out=0;for(let i=0;i+3<ary.length;i++)out+=weights[((ary[i]*26+ary[i+1])*26+ary[i+2])*26+ary[i+3]];return out;}
/** @param {number} mask @param {number[][]} gs @returns {number[]} */
function decode(mask,gs){
 return gs.map(g=>(((mask>>>g[0])&1)<<4)+(((mask>>>g[1])&1)<<3)+(((mask>>>g[2])&1)<<2)+(((mask>>>g[3])&1)<<1)+((mask>>>g[4])&1));
}
/**
 * Exact forbidden 1101*,111** Bacon 5-bit code family: each >=26
 * requires the first two and either third or fourth rune to map 1.
 * @param {number[][]} gs
 * @returns {{incident:number[][],edges:number}}
 */
function forbids(gs){
 const s=new Set();
 for(const g of gs)for(const k of [2,3])s.add((1<<g[0])|(1<<g[1])|(1<<g[k]));
 const inc=Array.from({length:RUNES},()=>[]);
 for(const e of s)for(let j=0;j<RUNES;j++)if(e&(1<<j))inc[j].push(e);
 return {incident:inc,edges:s.size};
}
/** @param {number[][]} gs @returns {object} */
function allSecret(gs){
 const f=forbids(gs),order=Array.from({length:RUNES},(_,i)=>i).sort((a,b)=>f.incident[b].length-f.incident[a].length||a-b);
 let visited=0, best=-Infinity, bestMask=0, bestReversed=false, maxOne=-1;
 /** @param {number} depth @param {number} mask @param {number} ones */
 function walk(depth,mask,ones){
  if(depth===RUNES){
   visited++;maxOne=Math.max(maxOne,ones);
   const t=decode(mask,gs);
   assert(t.every(x=>x<26));
   const z=score(t),w=score([...t].reverse());
   if(z>best){best=z;bestMask=mask;bestReversed=false;}
   if(w>best){best=w;bestMask=mask;bestReversed=true;}
   return;
  }
  walk(depth+1,mask,ones);
  const site=order[depth],changed=mask|(1<<site);
  if(f.incident[site].some(edge=>(changed&edge)===edge))return;
  walk(depth+1,changed,ones+1);
 }
 walk(0,0,0);
 const out=decode(bestMask,gs);
 if(bestReversed)out.reverse();
 return {validBitMaps:visited,distinctForbiddenTriples:f.edges,maxOneBits:maxOne,bestMeanLogQuad:Number((best/(HOLD-3)).toFixed(7)),bestMask,bestReversed,bestExcerpt:letters(out).slice(0,110),bestScore:best};
}
/** @param {string} text @returns {number[][]} */
function plant(text){
 const one=new Set([1,3,4,9,12,14,15,16,21,24,27]);
 const cls=[Array.from({length:29},(_,i)=>i).filter(x=>!one.has(x)),[...one]];
 let seed=0x330155aa;
 const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 return indices(text).map(code=>[16,8,4,2,1].map(b=>{const pool=cls[Number(Boolean(code&b))];return pool[rng()%pool.length];}));
}
const printed=allSecret(groups);
const reflected=allSecret(groups.map(g=>[...g].reverse()));
const holdouts=examples.map(([name,text])=>({name,meanLogQuad:Number((score(indices(text.slice(5000,5600)))/(HOLD-3)).toFixed(7))}));
const planted=plant(examples[0][1].slice(5000,5600));
const plantedOutput=allSecret(planted);
const plantedText=examples[0][1].slice(5000,5600);
assert(plantedOutput.bestScore>=score(indices(plantedText))-1e-8);
assert(plantedOutput.bestMeanLogQuad>Math.max(printed.bestMeanLogQuad,reflected.bestMeanLogQuad));
console.log('ORIGINAL '+JSON.stringify({scope:'p40-53 after red8',runes:body.length,quintets:groups.length,normal:printed,withinQuintetMirror:reflected,holdouts}));
console.log('POSITIVE '+JSON.stringify({source:'Gibran withheld600',exactPlantedDecoded:letters(decode([...new Set([1,3,4,9,12,14,15,16,21,24,27])].reduce((a,x)=>a|(1<<x),0),planted))===plantedText,bestMeanLogQuad:plantedOutput.bestMeanLogQuad,sourceMeanLogQuad:Number((score(indices(plantedText))/(HOLD-3)).toFixed(7))}));
console.log('PASS: exact complete secret-bit-key enumeration, source-only 600 printed quintets, held-out corpus and native positive plant');
