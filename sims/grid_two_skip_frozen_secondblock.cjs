"use strict";

/**
 * True held-out original LP2 validation of the two-collision-skip grid-key
 * AES/ChaCha decoder. Select all key/mode/8! column assignments on only the
 * first 300 original runes from each red-title body. Keep those fixed.
 * Evaluate the next 300 original runes per body using a max-product
 * continuation likelihood: Viterbi score(first600) - score(first300).
 *
 * Every independent shuffled-source-grid null repeats EXACTLY the complete
 * model fit on the first 300, then tests the untouched second 300.
 * This is a strictly out-of-sample check, not an optimized second-page
 * ciphertext score. Exact hidden-skip paths reencrypt the original runes.
 *
 * Run: node sims/grid_two_skip_frozen_secondblock.cjs
 * @module grid_two_skip_frozen_secondblock
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const {originalBodies,originalKeys,streamKey}=require("./grid_stream_collision_viterbi.cjs");
const {inverse,search}=require("./grid_two_collision_skips_inverse.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=x=>fs.readFileSync(path.join(ROOT,x),"utf8");
const ALPHABET=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const INDEX=new Map(ALPHABET.map((x,i)=>[x,i]));
const HEADING_LENGTHS=[13,16,12,11,16,19,8,8];
const FIRST=300, SECOND=300,N=29;
const mod=x=>(x%29+29)%29;

/** Original complete source sections, including physical page wraps. */
function originalBlocks(){
  const raw=read("resources/transcriptions/liber_primus_master.txt");
  const start=raw.indexOf("ᛋᚻᛖᚩᚷ");
  assert.ok(start>=0);
  const book=raw.slice(start).split("%").slice(0,56).join("%");
  const sections=book.split("$").map(s=>[...s]
    .filter(c=>INDEX.has(c))).filter(s=>s.length);
  assert.deepEqual(sections.map(s=>s.length),
    [729,1145,1729,9,1894,1021,1524,1589,3316]);
  const bodies=[sections[0],sections[1],sections[2],
    sections[4],sections[5],sections[6],sections[7],sections[8]]
    .map((s,i)=>s.slice(HEADING_LENGTHS[i],HEADING_LENGTHS[i]+FIRST+SECOND)
      .map(c=>INDEX.get(c)));
  assert.ok(bodies.every(s=>s.length===FIRST+SECOND));
  assert.deepEqual(bodies.map(s=>s.slice(0,FIRST)),originalBodies());
  return bodies;
}

/**
 * Source-fixed key mode and complete 8! assignment are fitted to 300 training
 * runes only. For the 600-rune challenge, the stream continues *at the same
 * original section zero nonce* with latent phase automatically marginalized
 * in maximum-score (Viterbi) semiring.
 *
 * Difference of independently maximized log-scores equals a max-product
 * conditional sequence score. It permits optimal latent keyskip histories
 * but never fits mode or source key assignment to the untouched 300 runes.
 *
 * @param {Buffer[]} keys Original or byte-shuffled 32-byte columns.
 * @param {number[][]} bodies Original 600-rune physical section prefixes.
 * @param {object} lm Frozen GP trigram language model.
 */
function scoreHeldout(keys,bodies,lm){
  const train=bodies.map(b=>b.slice(0,FIRST));
  const fitted=search(keys,train,lm);
  const mode=Object.fromEntries(["algo","reverseKey","reducer","sign"]
    .map(x=>[x,fitted.best[x]]));
  const details=bodies.map((body,i)=>{
    const col=fitted.best.columns[i],key=streamKey(keys[col],mode,670);
    const first=inverse(body.slice(0,FIRST),key,mode.sign,lm);
    const full=inverse(body,key,mode.sign,lm);
    assert.ok(first.exactForwardRoundTrip&&full.exactForwardRoundTrip);
    return {body:i,sourceColumn:col,
      firstScore:first.score,fullScore:full.score,
      secondConditional:(full.score-first.score)/SECOND,
      firstSkips:first.skips,totalSkips:full.skips,
      totalDoubleSkips:full.doubleSkips};
  });
  return {fitted:{...mode,columns:fitted.best.columns,
      trainingPerRune:fitted.best.perRune},
    conditionalHeldoutPerRune:details.reduce((s,x)=>
      s+x.secondConditional,0)/details.length,details};
}

/** @returns {()=>number} */
function generator(seed){let x=seed>>>0;return()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;
};}

/** Construct completely independent 8x600 English-GP control. */
function plant(keys,lm){
  const gp=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  const source=Array.from({length:8},(_,i)=>gp.slice(i*600,(i+1)*600));
  assert.ok(source.every(s=>s.length===600));
  const correctMode={algo:"aes-256-ctr",reverseKey:false,
    reducer:"mod29",sign:1};
  const columns=[6,2,4,0,1,7,5,3],next=generator(0x38b29503);
  const actualSkipped=[];
  const ciphertext=source.map((body,s)=>{
    const pad=streamKey(keys[columns[s]],correctMode,670);
    const cipher=[];let k=0,prev=-1,skips=0,double=0;
    for(const p of body){
      let c=mod(p+pad[k]);
      for(let attempt=0;attempt<2&&c===prev;attempt++){
        if(next()/4294967296>=0.81)break;
        k++;skips++;if(attempt===1)double++;
        c=mod(p+pad[k]);
      }
      cipher.push(c);prev=c;k++;
    }
    actualSkipped.push({skips,double});
    return cipher;
  });
  const check=scoreHeldout(keys,ciphertext,lm);
  const decoded=ciphertext.map((body,s)=>{
    const pad=streamKey(keys[columns[s]],correctMode,670);
    const recovered=inverse(body,pad,correctMode.sign,lm);
    return {correctRunes:recovered.plaintext.filter((x,i)=>x===source[s][i]).length,
      totalRunes:600,observedDoubleSkips:actualSkipped[s].double,
      recoveredDoubleSkips:recovered.doubleSkips,
      forwardExact:recovered.exactForwardRoundTrip};
  });
  const sameMode=Object.keys(correctMode).every(k=>
    check.fitted[k]===correctMode[k]);
  const sameColumns=columns.every((x,i)=>x===check.fitted.columns[i]);
  const recovered=decoded.reduce((a,x)=>a+x.correctRunes,0);
  assert.ok(recovered>=4000);
  return {frozenFitModeRecovered:sameMode,columnsRecovered:sameColumns,
    recovered,total:4800,score:check.conditionalHeldoutPerRune,
    original600Rerun:decoded,plantedSkipped:actualSkipped};
}

/** @returns {object} Original source and same-policy shuffled full-search decoys. */
function main(){
  const bodies=originalBlocks(),keys=originalKeys(),
    lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const original=scoreHeldout(keys,bodies,lm);
  const control=plant(keys,lm);
  const random=generator(0x38b2f001),NREPS=
    Number(process.env.LP2_TWO_SKIP_HELDOUT_NULLS||120);
  assert.ok(Number.isSafeInteger(NREPS)&&NREPS>=1&&NREPS<=1000);
  const trials=[];
  for(let k=0;k<NREPS;k++){
    const shuffled=keys.map(key=>{
      const bytes=Buffer.from(key);
      for(let j=bytes.length-1;j>0;j--){
        const v=random()%(j+1);
        [bytes[j],bytes[v]]=[bytes[v],bytes[j]];
      }
      return bytes;
    });
    trials.push(scoreHeldout(shuffled,bodies,lm).conditionalHeldoutPerRune);
  }
  const above=trials.filter(v=>v>=original.conditionalHeldoutPerRune).length;
  const sorted=trials.slice().sort((a,b)=>a-b);
  return {
    mode:"Original frozen first300 two-skip source-grid cipher, untouched next300 per section",
    sourceOriginalRunes:4800,frozenTraining:2400,heldout:2400,
    candidateSourceColumns:8,modelSelectionFamilies:16,
    original,independentEnglishPlant:control,
    shuffledFullRefitNull:{trials:NREPS,above,
      pUpper:(above+1)/(NREPS+1),mean:trials.reduce((a,b)=>a+b,0)/NREPS,
      median:sorted[Math.floor(NREPS/2)],min:sorted[0],max:sorted[NREPS-1]},
    conclusion:"Original selected first-block source keys require untouched second-block predictive support; no source plaintext claimed"};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={originalBlocks,scoreHeldout,plant,main};
