'use strict';
/**
 * Original 2014 onion-page HTML title133/id331 and LP2 red-title 662/2=331
 * as independent source-constrained candidate PRNG seeds, in established
 * reversible GP/field28 inverse models. Original half-book selection and
 * same-model continuation, with planted full inverse and re-encryption.
 * node sims/onion7_html_133_331_seed_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {src,pad,inverse,score}=require('./audio761_numeric_prng_seed_probe.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const html=read('resources/cicada2014-onion7-index.html');
const pages=corpus.pages.filter(p=>p.status==='unsolved'&&p.indices.length)
  .map(p=>p.indices);
const N=pages.flat().length;
assert.equal(N,12956);
const mod=(n,m)=>(n%m+m)%m;
/** @returns {{title:number,id:number,redSum:number,seeds:number[]}} */
function input(){
 const title=Number(html.match(/<title>(\d+)<\/title>/u)?.[1]);
 const id=Number(html.match(/<div id="(\d+)">/u)?.[1]);
 const redSum=corpus.pages[0].indices.slice(0,13)
   .reduce((sum,x)=>sum+corpus.prime[x],0);
 assert.deepEqual([title,id,redSum],[133,331,662]);
 assert.equal((html.match(/<img src="\d+\.jpg"/gu)||[]).length,58);
 const seeds=[title,Number(String(title)+String(id)),
   Number(String(id)+String(title)),title+id,title*id];
 assert.deepEqual(seeds,[133,133331,331133,464,44023]);
 return {title,id,redSum,seeds};
}
/** @param {number[][]} plain @param {number[][]} key */
function encrypt(plain,key){
 const power=Array.from({length:28},(_,i)=>{let x=1;for(let j=0;j<i;j++)x=x*15%29;return x});
 assert.equal(new Set(power).size,28);
 return plain.map((page,j)=>{
   const result=[page[0]];
   for(let i=1;i<page.length;i++){
     const p=page[i],step=p===28?0:power[(p+key[j][i]%28)%28];
     result.push(mod(result[i-1]+step,29));
   }
   return result;
 });
}
/** @param {ReturnType<typeof src>} language */
function positive(language){
 const lens=require('./lp2_word_pages.cjs').parseSharedCorpus()
   .words.map(w=>w.length);
 let state=0x33100133>>>0;
 const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
 const pools=new Map();
 for(const w of language.words){
   if(!pools.has(w.length))pools.set(w.length,[]);
   pools.get(w.length).push(w);
 }
 const flat=lens.flatMap(n=>{const words=pools.get(n);assert.ok(words?.length);return words[random()%words.length]});
 assert.equal(flat.length,N);
 const plain=[],key=pad('mt',133331,'book');
 let at=0;
 for(const p of pages){plain.push(flat.slice(at,at+p.length));at+=p.length}
 const cipher=encrypt(plain,key),decoded=inverse(cipher,key,'field28',-1);
 let matches=0;
 for(let j=0;j<plain.length;j++)for(let i=1;i<plain[j].length;i++){
   assert.equal(decoded[j][i],plain[j][i]);matches++;
 }
 assert.equal(matches,12901);
 const recovered=decoded.map((p,j)=>[plain[j][0],...p.slice(1)]);
 assert.deepEqual(encrypt(recovered,key),cipher);
 return {seed:133331,generator:'mt',clock:'book',model:'field28',
   sign:-1,exactlyRecoveredRuneTransitions:matches,
   exactlyReencryptedCiphertextRunes:N,
   decodedScore:score(decoded,language).score};
}
function run(){
 const clue=input(),language=src(),rows=[];
 const kinds=['xorshift','lcgA','lcgB','lehmer','lcgLow','mt'];
 const modes=['direct29','delta29','field28','rankCyclic','rankSorted'];
 for(const seed of clue.seeds)for(const kind of kinds)
 for(const clock of ['book','page']){
   const k=pad(kind,seed,clock);
   for(const mode of modes)for(const sign of [-1,1]){
     const v=score(inverse(pages,k,mode,sign),language);
     const n=N/2,trainScore=(v.score*N-v.heldoutScore*n)/n;
     rows.push({seed,kind,clock,mode,sign,trainScore,
       holdoutScore:v.heldoutScore,allScore:v.score});
   }
 }
 assert.equal(rows.length,600);
 rows.sort((a,b)=>b.trainScore-a.trainScore);
 const planted=positive(language);
 return {source:'Original archived onion7 title133/id331; LP2 opening red sum662',
   clue,modelCount:rows.length,sourceNativeScore:language.score,
   bestTrain:rows[0],bestTen:rows.slice(0,10),
   bestBySeed:clue.seeds.map(seed=>rows.find(x=>x.seed===seed)),
   planted,conclusion:'Source-fixed finite search. No authentic LP2 plaintext recovered.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={input,encrypt,positive,run};
