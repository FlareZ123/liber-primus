'use strict';
/**
 * All-secret pagewise five-phase language gate after the GP28 successor rank.
 *
 * A hypothesized reversible cipher first applies one of five arbitrary
 * GP29 alphabet permutations per page (one per word-local phase), then
 * emits the resulting GP29 ordinal as rank among 28 non-repeating
 * ciphertext successors, with rank 28 emitted as previous glyph.
 * The inverse rank eliminates ANY secret alphabet from equality statistics:
 * within each (page,phase), ciphertext rank-symbol IoC must equal
 * plaintext GP29 IoC. Original data is tested over all 55 unknown rune
 * pages, 2,896 source words and 10,060 within-word successor positions.
 *
 * Run: node sims/lp2_rank28_fivephase_pageallsecret_native_gate_sft.cjs
 * Windows Node22, CommonJS SFT; no external packages/file writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=read('resources/liber-primus/lp2-transcription.txt');
const lp1=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];
let word=[],page=0;
for(const ch of source.split('%').slice(0,55).join('%')){
 if(runeIndex.has(ch)){
  word.push({val:runeIndex.get(ch),page});
 } else if(ch==='%') {
  page++;
 } else if(ch==='/' || /\s/u.test(ch)) {
  // Original typography: visual line breaks are not word breaks.
 } else if(word.length) {
  words.push(word);word=[];
 }
}
if(word.length)words.push(word);
assert.equal(words.length,2896);
const sourcePlain=words.flat().map(g=>g.val);
assert.equal(sourcePlain.length,12956);
assert.deepEqual(sourcePlain,corpus.pages.slice(0,56).flatMap(p=>p.indices));
/** @param {number} c @param {number} previous @returns {number} */
function inverseRank(c,previous){
 return c===previous?28:(c<previous?c:c-1);
}
/** @param {number} rank @param {number} previous @returns {number} */
function forwardRank(rank,previous){
 return rank===28?previous:(rank<previous?rank:rank+1);
}
for(let prev=0;prev<29;prev++)for(let p=0;p<29;p++)
 assert.equal(inverseRank(forwardRank(p,prev),prev),p);
/**
 * @param {Array<Array<{val:number,page:number}>>} runs
 * @param {boolean} undoRank
 * @returns {{ioc:number,collisions:number,pairs:number,groups:number,positions:number}}
 */
function score(runs,undoRank){
 const groups=new Map();let positions=0;
 for(const word of runs)for(let j=1;j<word.length;j++){
  const group=word[j].page*5+j%5;
  const symbol=undoRank?inverseRank(word[j].val,word[j-1].val):word[j].val;
  if(!groups.has(group))groups.set(group,Array(29).fill(0));
  groups.get(group)[symbol]++;positions++;
 }
 let numerator=0,denominator=0;
 for(const f of groups.values()){
  const n=f.reduce((a,b)=>a+b,0);
  numerator+=f.reduce((a,b)=>a+b*(b-1),0);
  denominator+=n*(n-1);
 }
 return {ioc:numerator/denominator,collisions:numerator/2,
   pairs:denominator,groups:groups.size,positions};
}
const actual=score(words,true);
const original=score(words,false);
assert.equal(actual.positions,10060);
assert.equal(actual.groups,275);
assert.equal(actual.pairs,462380);
assert.equal(actual.collisions,8277);
assert(Math.abs(actual.ioc-0.03580172152774774)<1e-14);
assert(Math.abs(original.ioc-0.03449543665383451)<1e-14);
const nativePool=new Map();
const expression=new RegExp('['+corpus.runes.join('')+']+','gu');
for(const section of lp1.sections){
 for(const token of section.source_text.match(expression)||[]){
  const native=[...token].map(g=>runeIndex.get(g));
  if(!nativePool.has(native.length))nativePool.set(native.length,[]);
  nativePool.get(native.length).push(native);
 }
}
assert.equal(lp1.sections.length,9);
const native=words.map((w,i)=>{
 const pool=nativePool.get(w.length);
 assert(pool,'missing LP1 native word for length '+w.length);
 return pool[(i*17+5)%pool.length].map((val,j)=>({val,page:w[j].page}));
});
const nativeScore=score(native,false);
assert.equal(nativeScore.positions,actual.positions);
assert.equal(nativeScore.pairs,actual.pairs);
assert.equal(nativeScore.groups,actual.groups);
assert(Math.abs(nativeScore.ioc-0.08699338206669839)<1e-14);
/**
 * Planted reversible cipher, with SECRET independent page-phase alphabets:
 * each is an invertible affine map, an arbitrarily selected subset of
 * the full 29! possible GP29 permutations.
 */
const enciphered=native.map((word)=>{
 let last=0;
 return word.map(({val,page},j)=>{
  const mult=1+(page*11+7*(j%5))%28,add=(page*5+13*(j%5))%29;
  const perm=(mult*val+add)%29;
  const v=forwardRank(perm,last);
  last=v;return {val:v,page};
 });
});
const recovered=enciphered.map(word=>{
 let last=0;
 return word.map(({val,page},j)=>{
  const v=inverseRank(val,last);
  last=val;
  const mult=1+(page*11+7*(j%5))%28,add=(page*5+13*(j%5))%29;
  let inv=0;for(let k=1;k<29;k++)if(mult*k%29===1){inv=k;break;}
  const decoded=((v-add+29)*inv)%29;
  return {val:decoded,page};
 });
});
assert.deepEqual(recovered,native);
const plantedRankScore=score(enciphered,true);
assert(Math.abs(plantedRankScore.ioc-nativeScore.ioc)<1e-14);
assert.equal(plantedRankScore.positions,10060);
assert.equal(recovered.flat().length,12956);
console.log(JSON.stringify({
 source:'12956 original unsolved LP2 runes / 2896 source words / 55 rune-bearing pages',
 cipherFamily:'arbitrary 29! pagewise word-local five-phase symbol bijections followed by lossless rank28 successor framing',
 originalCipherText:original,
 exactRankInverse:actual,
 sourceNativeGP29FromSolvedLP1MatchedWordLengths:nativeScore,
 nativePlantedSecretPagePhaseExactInverse:12956,
 nativePlantedConditionalIoc:plantedRankScore.ioc,
 verdict:'Original rank28 successor stream has near-uniform five-phase page-conditional equality rates. The whole family cannot yield ordinary native GP29 plaintext with the original observed statistical register.'
},null,2));
console.log('PASS: all-secret pagewise five-phase equality invariant and original-source negative');
