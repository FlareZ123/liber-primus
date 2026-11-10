"use strict";
/**
 * LP2 original-rune attack: eight authentic base60-grid 256-bit columns as
 * AES-CTR / ChaCha20 key streams, including a ciphertext-collision-consumed
 * extra key that defeats straight fixed-position decryption.
 *
 * Exact max-score Viterbi over at most one skipped draw per rune.
 * Original-input full eight-section assignment by maximum-weight matching.
 * Node 22, CommonJS; manual CI runner. No third-party dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {matchColumns}=require("./grid_word_order_inversion.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const ALPHABET=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const RUNEINDEX=new Map(ALPHABET.map((c,i)=>[c,i]));
const MOD=29, TARGET_PREFIX=300, MAX_EXTRA=34;
const TITLE_RUNE_COUNTS=[13,16,12,11,16,19,8,8];
const MODES=[];
for(const algo of ["aes-256-ctr","chacha20"])
for(const reverseKey of [false,true])
for(const reducer of ["mod29","scaled29"])
for(const sign of [1,-1])
MODES.push({algo,reverseKey,reducer,sign});
const mod=x=>(x%29+29)%29;

/** @returns {number[][]} */
function originalBodies(){
  const raw=read("resources/transcriptions/liber_primus_master.txt");
  const start=raw.indexOf("ᛋᚻᛖᚩᚷ");
  assert.ok(start>=0);
  const book=raw.slice(start).split("%").slice(0,56).join("%");
  const sections=book.split("$").map(s=>[...s].filter(ch=>RUNEINDEX.has(ch))).filter(s=>s.length);
  assert.deepEqual(sections.map(x=>x.length),[729,1145,1729,9,1894,1021,1524,1589,3316]);
  const merged=[sections[0],sections[1],sections[2],
    sections[3].concat(sections[4]),sections[5],sections[6],sections[7],sections[8]];
  return merged.map((seq,i)=>seq.slice(TITLE_RUNE_COUNTS[i])
    .slice(0,TARGET_PREFIX).map(r=>RUNEINDEX.get(r)));
}

/** @returns {Buffer[]} */
function originalKeys(){
  const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
  const rows=grid.byte_rows;
  assert.equal(crypto.createHash("sha256").update(Buffer.from(rows.flat())).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  return Array.from({length:8},(_,c)=>Buffer.from(rows.map(row=>row[c])));
}

/**
 * Use the first sufficiently many consecutive AES or ChaCha20 bytes, taking
 * integer remainders or the explicit scaled mapping to mod29.
 */
function streamKey(key,mode,n=TARGET_PREFIX+MAX_EXTRA+8){
  const actual=mode.reverseKey?Buffer.from(key).reverse():key;
  const c=crypto.createCipheriv(mode.algo,actual,Buffer.alloc(16));
  const data=Buffer.concat([c.update(Buffer.alloc(n)),c.final()]);
  return Array.from(data,b=>mode.reducer==="mod29"?b%29:Math.floor(29*b/256));
}

/**
 * Exact first- and second-order markov likelihood with latent one-key
 * collision rejects. The rejected key only occurs if it would emit the
 * immediately preceding ciphertext rune for the same source plain rune.
 *
 * State after observing C_i: (total extra rejected key draws E, last skip r).
 * Therefore the accepted key index is i+E. The previous two plaintext
 * values can be exactly reconstructed from C and the two state bits.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign C=P+sign*K
 * @param {object} lm language model with numeric trigram and bigram
 */
function viterbi(cipher,key,sign,lm,skipPenalty=3.5){
  const n=cipher.length,cap=Math.min(MAX_EXTRA,n-1),width=(cap+1)*2;
  assert.ok(n>=3&&key.length>=n+cap+1);
  const decode=(i,E)=>mod(cipher[i]-sign*key[i+E]);
  let dp=new Float64Array(width).fill(-Infinity);
  const trace=new Int16Array(n*width).fill(-1);
  const p0=decode(0,0);
  for(let r=0;r<=1;r++){
    const k=1+r, plain=mod(cipher[1]-sign*key[k]);
    if(r&&mod(plain+sign*key[1])!==cipher[0])continue;
    dp[r*2+r]=lm.unigram[p0]+lm.bigram[p0*29+plain]-skipPenalty*r;
  }
  for(let i=2;i<n;i++){
    const next=new Float64Array(width).fill(-Infinity);
    for(let E=0;E<=cap;E++)for(let rPrev=0;rPrev<=1;rPrev++){
      const state=E*2+rPrev,base=dp[state];
      if(!Number.isFinite(base))continue;
      const pprev=decode(i-1,E),pprev2=decode(i-2,E-rPrev);
      for(let r=0;r<=1&&E+r<=cap;r++){
        const eNew=E+r,pnew=decode(i,eNew);
        if(r&&mod(pnew+sign*key[i+E])!==cipher[i-1])continue;
        const t=lm.trigram[(pprev2*29+pprev)*29+pnew];
        const result=base+t-skipPenalty*r;
        const dst=eNew*2+r;
        if(result>next[dst]){next[dst]=result;trace[i*width+dst]=state;}
      }
    }
    dp=next;
  }
  let best=-Infinity,state=-1;
  for(let i=0;i<width;i++)if(dp[i]>best){best=dp[i];state=i;}
  assert.ok(Number.isFinite(best)&&state>=0);
  const extra=Math.floor(state/2),plaintext=new Array(n);
  for(let i=n-1;i>=1;i--){
    plaintext[i]=decode(i,Math.floor(state/2));
    if(i>=2){state=trace[i*width+state];assert.ok(state>=0);}
  }
  plaintext[0]=p0;
  return {score:best,perRune:best/n,skips:extra,plaintext};
}

/** @param {Buffer[]} keys @param {number[][]} texts @param {object} mode @param {object} lm */
function matrix(keys,texts,mode,lm,keepOutputs=false){
  const pads=keys.map(k=>streamKey(k,mode));
  const all=texts.map(row=>pads.map(k=>viterbi(row,k,mode.sign,lm)));
  const scores=all.map(row=>row.map(x=>x.score));
  return keepOutputs?{scores,all}:{scores};
}

/** @param {Buffer[]} keys @param {number[][]} texts @param {object} lm */
function solveOriginal(keys,texts,lm){
  let best={score:-Infinity},total=0;
  const rows=[];
  for(const mode of MODES){
    const m=matrix(keys,texts,mode,lm,true);
    const chosen=matchColumns(m.scores);
    total++;
    const r={...mode,...chosen,
      meanLogPerRune:chosen.score/(texts.length*TARGET_PREFIX)};
    rows.push(r);
    if(chosen.score>best.score){
      best={...r,details:chosen.columns.map((c,i)=>({
        body:i,keyColumn:c,score:m.all[i][c].perRune,
        skipped:m.all[i][c].skips,
        output:m.all[i][c].plaintext.slice(0,70).map(v=>ALPHABET[v]).join("")
      }))};
    }
  }
  return {best,modes:total,top:rows.sort((a,b)=>b.score-a.score).slice(0,5)};
}

function xorshift(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/**
 * Positive control with unknown key-column mapping and actual skips.
 * English GP source is withheld final 100k Shakespeare characters.
 */
function plant(keys,lm){
  const words=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  assert.ok(words.length>=8*TARGET_PREFIX);
  const texts=Array.from({length:8},(_,i)=>words.slice(i*TARGET_PREFIX,(i+1)*TARGET_PREFIX));
  const known={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1};
  const assignment=[6,2,4,0,1,7,5,3];
  const next=xorshift(0x371e811), rejected=[];
  const encrypted=texts.map((text,i)=>{
    let j=0,prev=-1,skips=0;
    const pad=streamKey(keys[assignment[i]],known);
    const cipher=[];
    for(const p of text){
      let c=mod(p+pad[j]);
      if(c===prev&&(next()/4294967296)<.81 && j+1<pad.length){
        j++;
        c=mod(p+pad[j]);
        skips++;
      }
      cipher.push(c);prev=c;j++;
    }
    rejected.push(skips);
    return cipher;
  });
  const recovered=solveOriginal(keys,encrypted,lm);
  const right=assignment.every((key,i)=>recovered.best.columns[i]===key);
  const trueMode=recovered.best.algo===known.algo&&
    recovered.best.reverseKey===known.reverseKey&&recovered.best.reducer===known.reducer&&
    recovered.best.sign===known.sign;
  const trueRecovered=texts.map((original,i)=>{
    const k=streamKey(keys[assignment[i]],known);
    const result=viterbi(encrypted[i],k,known.sign,lm);
    const n=result.plaintext.filter((v,j)=>v===original[j]).length;
    return {body:i,correct:n,of:original.length,
      actualSkips:rejected[i],inferredSkips:result.skips,
      matched:recovered.best.details[i].keyColumn===assignment[i]};
  });
  const totalCorrect=trueRecovered.reduce((n,x)=>n+x.correct,0);
  assert.ok(totalCorrect>=8*TARGET_PREFIX*.85,"Positive source GP recovery under planted real-key model failed");
  return {known,assignment,realSkipped:rejected,modeRecovered:trueMode,
    assignmentRecovered:right,totalCorrect,sourceRunes:8*TARGET_PREFIX,
    fractionCorrect:totalCorrect/(8*TARGET_PREFIX),
    details:trueRecovered,bestScore:recovered.best.meanLogPerRune};
}

function nullSearch(keys,texts,lm,original,n=16){
  const random=xorshift(0x37257b0);
  const maxima=[];
  for(let trial=0;trial<n;trial++){
    const shuffled=keys.map(k=>{
      const a=Buffer.from(k);
      for(let i=a.length-1;i>0;i--){
        const j=random()%(i+1),old=a[i];a[i]=a[j];a[j]=old;
      }
      return a;
    });
    maxima.push(solveOriginal(shuffled,texts,lm).best.meanLogPerRune);
  }
  maxima.sort((a,b)=>a-b);
  return {trials:n,seed:"0x37257b0",
    exceed:maxima.filter(v=>v>=original.best.meanLogPerRune).length,
    median:maxima[Math.floor(n/2)],max:maxima[n-1],min:maxima[0],
    pUpper:(1+maxima.filter(v=>v>=original.best.meanLogPerRune).length)/(n+1),
    maxima};
}

function main(){
  const texts=originalBodies(),keys=originalKeys();
  assert.deepEqual(texts.map(t=>t.length),Array(8).fill(TARGET_PREFIX));
  const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const planted=plant(keys,lm);
  const original=solveOriginal(keys,texts,lm);
  const nulls=nullSearch(keys,texts,lm,original);
  process.stdout.write(JSON.stringify({hypothesis:"AES/ChaCha grid-column key streams with repeat-collision key-consumption",
    perSectionRunes:TARGET_PREFIX,sections:8,registerSourceRunes:lm.symbols,
    settings:MODES.length,skipPenalty:3.5,maxExtra:MAX_EXTRA,
    planted,original,nulls,
    status:"No decrypted LP2 plaintext unless actual source outputs and key assignment outperform matched keys"},null,2)+"\n");
}
if(require.main===module)main();
module.exports={originalBodies,originalKeys,streamKey,viterbi,matrix,solveOriginal,plant,nullSearch};
