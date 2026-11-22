"use strict";
/**
 * Independent native-GP Latin register challenge for the original p0–2
 * source-grid directional walker. Reuses the EXACT 1024 modes, cipher,
 * source root and section split of source27_cipher_direction_inverse.cjs.
 *
 * The Latin training source is the external Latin Vulgate GP corpus, and
 * the unrelated source-positive text is a 2400-rune Apocalypse heldout.
 * The 2400 heldout source runes are tiled to match all 12227 original
 * layout positions; tiling changes text succession, not symbol marginals,
 * which are this test's only selection criterion.
 *
 * SFT: node sims/source27_cipher_direction_latin.cjs
 * Node 22 CommonJS; no packages, no file writes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {convert,rank,reshape,stats}=require("./source27_cipher_direction_inverse.cjs");
const root=path.resolve(__dirname,"..");
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json");
const latin=read("resources/control/latin-vulgate-gp-trigrams.json");
const held=read("resources/control/latin-vulgate-heldout-gp.json");
const pages=gp.pages.filter(page=>page.page<=55&&page.indices.length);
const ciphertext=pages.filter(page=>page.page>=3).map(page=>page.indices);
const grid=pages.slice(0,3).flatMap(page=>page.indices);
assert.equal(latin.n,203357);
assert.equal(held.runes.length,2400);
assert.equal(grid.length,729);
assert.equal(ciphertext.flat().length,12227);
assert.equal(latin.u.reduce((s,n)=>s+n,0),latin.n);
const lp=latin.u.map(n=>Math.log((n+.5)/(latin.n+14.5)));
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
function shuffle(a,next){
 const b=a.slice();for(let i=b.length-1;i>0;i--){
  const j=next()%(i+1);[b[i],b[j]]=[b[j],b[i]];
 }return b;
}
function run(){
 const winner=rank(ciphertext,lp)[0];
 const native=reshape(Array.from({length:12227},(_,i)=>held.runes[i%held.runes.length]));
 const mode={primeStep:true,primeKey:false,step:5,offset:0,mirror:1,
  sign:1,reverse:false,reset:"section"};
 const planted=convert(mode,native,true);
 const found=rank(planted,lp)[0];
 assert.deepEqual(found.mode,mode);
 assert.deepEqual(convert(found.mode,planted,false),native);
 assert.deepEqual(convert(found.mode,native,true),planted);
 assert.deepEqual(convert(winner.mode,convert(winner.mode,ciphertext,false),true),ciphertext);

 const next=rng(0x16c2719), originalNull=[],plantNull=[],n=128;
 for(let i=0;i<n;i++){
  const wrong=shuffle(grid,next);
  originalNull.push(stats(convert(winner.mode,ciphertext,false,wrong).slice(12),lp).meanLog);
  plantNull.push(stats(convert(mode,planted,false,wrong),lp).meanLog);
 }
 const observed=winner.heldout.meanLog;
 const ref=stats([held.runes],lp),positive=stats(native,lp);
 const exceed=originalNull.filter(x=>x>=observed).length;
 const plantExceed=plantNull.filter(x=>x>=positive.meanLog).length;
 const report={
  source:"Latin Vulgate external corpus 203357 GP training runes, 2400 independent Latin GP heldout",
  root:"Original p0–2 729-rune GP index square; retrospective published J(13,12)",
  models:1024,trainOriginal:2874,heldoutOriginal:9353,
  original:{topLatinMode:winner,wrongSource:{trials:n,seed:"0x16c2719",
   outperform:exceed,addOneUpperTail:(exceed+1)/(n+1)}},
  sourceNative:{originalLatinHeldout:ref,
   repeatingHeldoutPositive:positive,mode,blindRecoveryRank:1,
   exactPlaintextRecovered:12227,exactForwardReencryption:12227,
   wrongSource:{trials:n,outperform:plantExceed,
    addOneUpperTail:(plantExceed+1)/(n+1)}},
  conclusion:"Latin language control also rejects any credible original source-grid decoder among the 1024 declared modes; no original plaintext or key recovered."
 };
 assert.ok(winner.heldout.meanLog<-4.1);
 assert.equal(report.sourceNative.exactPlaintextRecovered,12227);
 process.stdout.write(JSON.stringify(report,null,2)+"\n");
 return report;
}
if(require.main===module)run();
module.exports={run};
