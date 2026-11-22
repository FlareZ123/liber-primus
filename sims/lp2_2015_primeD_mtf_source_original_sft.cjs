'use strict';
/**
 * Director #1468: frozen literal streaming 29-symbol move-to-front (MTF)
 * applied to the historically witnessed February 2015 p0-2 prime-delta
 * intermediate D. The unique 2015 historical alignment is preserved.
 * Alternative MTF orientations and source-natural chapter/page resets are
 * fixed before any original-source scoring. No BWT primary index is assumed.
 *
 * SFT: node sims/lp2_2015_primeD_mtf_source_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.join(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher=gp.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
assert.equal(cipher.length,729);
const mod=x=>((x%29)+29)%29;
const prime=[];
for(let n=2;prime.length<730;n++) {
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)prime.push(n);
}
/** @param {number[]} c @returns {number[]} */
function historicalD(c){
  let previous=mod(-prime[0]);
  return c.map((v,i)=>{const s=mod(v-prime[i+1]),d=mod(s-previous);previous=s;return d;});
}
/** @param {number[]} d @returns {number[]} */
function restoreCipher(d){
  let s=mod(-prime[0]);
  return d.map((v,i)=>{s=mod(s+v);return mod(s+prime[i+1]);});
}
const d=historicalD(cipher);
assert.deepEqual(restoreCipher(d),cipher);
const adjacent=x=>x.slice(1).reduce((n,v,j)=>n+Number(v===x[j]),0);
assert.equal(adjacent(d),40);
assert.equal(adjacent(cipher),4);
/**
 * True standard MTF on canonical GP29 order, with reset at chapter start
 * or at physical source page boundaries 262,528.
 * @param {number[]} input 29-symbol original data
 * @param {'decode'|'encode'} mode Rank -> GP code or GP code -> rank
 * @param {boolean} pageReset Reset at each original physical page
 * @returns {number[]}
 */
function mtf(input,mode,pageReset){
  const state=Array.from({length:29},(_,i)=>i);
  const out=[];
  for(let i=0;i<input.length;i++){
    if(i===0 || pageReset&&(i===262||i===528))
      for(let j=0;j<29;j++)state[j]=j;
    const item=input[i];
    const index=mode==='decode'?item:state.indexOf(item);
    assert(index>=0&&index<29);
    const value=state[index];
    out.push(mode==='decode'?value:index);
    state.splice(index,1);
    state.unshift(value);
  }
  return out;
}
/** @param {number[]} values @returns {number} */
function ioc(values){
  const counts=new Uint32Array(29);
  for(const v of values)counts[v]++;
  let hit=0;
  for(const c of counts)hit+=c*(c-1);
  return hit/(values.length*(values.length-1));
}
const expected=[0.034783460709386635,0.03443298813669184,
  0.035262063039840814,0.035567313345091126];
const specimens=[];
for(const mode of ['decode','encode'])for(const pageReset of [false,true]) {
  const result=mtf(d,mode,pageReset);
  const reconstructed=mtf(result,mode==='decode'?'encode':'decode',pageReset);
  assert.deepEqual(reconstructed,d);
  const value=ioc(result);
  const spot=specimens.length;
  assert(Math.abs(expected[spot]-value)<1e-12);
  specimens.push({mode,pageReset,originalOutputIoc:value,
    originalAdjacentEqual:adjacent(result),
    first150GP:result.slice(0,150).map(x=>gp.translit[x]).join(''),
    second150GP:result.slice(150,300).map(x=>gp.translit[x]).join('')});
}
const plantedText=read('resources/control/gibran_prophet_58585.txt');
const natural=encodeSourceNativeGP(plantedText).slice(0,729);
assert.equal(natural.length,729);
for(const pageReset of [false,true]){
  const ranks=mtf(natural,'encode',pageReset);
  assert.deepEqual(mtf(ranks,'decode',pageReset),natural);
  assert.deepEqual(mtf(mtf(natural,'decode',pageReset),'encode',pageReset),natural);
  assert.deepEqual(restoreCipher(historicalD(cipher)),cipher);
}
const englishControls=[
  ['Gibran','resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt']
];
/**
 * Every inverse Burrows-Wheeler transform is a permutation of the given
 * last-column tape. Its choice of primary row changes order, never the 29
 * symbol counts. The same invariant applies if BWT follows MTF processing.
 * @param {number[]} values
 * @returns {number[]}
 */
function symbolCounts(values){
  const counts=Array(29).fill(0);
  for(const v of values)counts[v]++;
  return counts;
}
/**
 * Minimum single-rune substitutions required to reconcile two multisets;
 * every substitution decrements one bucket and increments another.
 * @param {number[]} left
 * @param {number[]} right
 * @returns {number}
 */
function substitutionFloor(left,right){
  return left.reduce((total,x,j)=>total+Math.abs(x-right[j]),0)/2;
}
const bwtCandidates=[
  {name:'historical D',values:d},
  ...(['decode','encode'].flatMap(mode=>[false,true].map(pageReset=>({
    name:mode+(pageReset?' per-page':' chapter'),
    values:mtf(d,mode,pageReset)
  }))))
];
const bwtHistograms=bwtCandidates.map(c=>symbolCounts(c.values));
for(const c of bwtCandidates)assert.equal(c.values.length,729);
const benchmark=[];
for(const [name,file] of englishControls){
  const native=encodeSourceNativeGP(read(file));
  const scores=[];
  const minimumSubstitutions=Array(bwtCandidates.length).fill(Infinity);
  for(let i=0;i+729<=native.length;i+=113){
    const sample=native.slice(i,i+729);
    scores.push(ioc(sample));
    const histogram=symbolCounts(sample);
    for(let j=0;j<bwtCandidates.length;j++){
      minimumSubstitutions[j]=Math.min(minimumSubstitutions[j],
        substitutionFloor(histogram,bwtHistograms[j]));
    }
  }
  assert(scores.length>0);
  scores.sort((a,b)=>a-b);
  benchmark.push({name,windows:scores.length,min:scores[0],
    median:scores[Math.floor(scores.length/2)],max:scores.at(-1),
    minSymbolSubstitutionsForAnyBWTPrimary:minimumSubstitutions});
}
assert.deepEqual(benchmark.map(x=>x.minSymbolSubstitutionsForAnyBWTPrimary),[
  [243,252,239,245,242],
  [225,242,228,244,240],
  [235,248,227,247,244]
]);
console.log(JSON.stringify({
  status:'Original Feb2015 p0-2 prime-delta first-stage preserved; no direct standard MTF plaintext',
  originalD:{count:d.length,adjacentRepeat:adjacent(d),ioc:ioc(d),
    first29:d.slice(0,29)},
  frozenMTF:specimens,
  nativeGPWindows:benchmark,
  allPrimaryBWTConstraint:{
    statement:'Inverse BWT of a fixed last-column tape only permutes symbols; its primary index cannot change the full 729-symbol histogram or IoC',
    candidates:bwtCandidates.map((c,j)=>({name:c.name,
      wholeChapterIoc:ioc(c.values),
      nativeECount:bwtHistograms[j][18]}))
  },
  sourceNative729Plant:true,
  authenticUnknownPlaintextRecovered:false
},null,2));
