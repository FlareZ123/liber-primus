"use strict";

/**
 * Source-role reversal test: exact original red titles are AES/ChaCha256 keys
 * after SHA-256(UTF8), and eight original base60-grid columns contribute their
 * first 16 bytes as IVs, optimally bijected to the eight text sections.
 *
 * Every source key byte and IV byte is fixed independently of the ciphertext.
 * The exact existing original-ciphertext Viterbi permits single collision-
 * triggered keystream consumption, with English-GP positive plants.
 *
 * Run: node sims/red_title_key_grid_nonce_inverse.cjs
 * @module red_title_key_grid_nonce_inverse
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const {originalBodies,originalKeys,streamKey,viterbi}=
  require("./grid_stream_collision_viterbi.cjs");
const {redTitles}=require("./red_title_nonce_grid_viterbi.cjs");
const {matchColumns}=require("./grid_word_order_inversion.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const MOD=29;
const MODES=[];
for(const algo of ["aes-256-ctr","chacha20"])
for(const reverseKey of [false,true])
for(const reducer of ["mod29","scaled29"])
for(const sign of [1,-1])
  MODES.push({algo,reverseKey,reducer,sign});
const mod=n=>(n%29+29)%29;
const rand=(seed)=>{let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};};

/** @returns {Buffer[]} Eight distinct hashed red-title section keys. */
function titleKeys(){
  const titles=redTitles();
  return titles.map(t=>crypto.createHash("sha256")
    .update(Buffer.from(t,"utf8")).digest());
}

/**
 * The IV candidates are the first 16 bytes of the 32-byte original grid
 * columns. Their independent assignment is an exact 8! search.
 * @param {Buffer[]} columns Authentic numeric-grid byte columns.
 */
function gridIVs(columns){
  return columns.map(column=>{
    assert.equal(column.length,32);
    return column.subarray(0,16);
  });
}

/**
 * In each original section, the key is fixed by *its own* red title, and
 * all eight original grid columns compete only for its 16-byte nonce.
 *
 * @param {Buffer[]} keys Source-derived, section-addressed keys.
 * @param {Buffer[]} ivs Source-derived, column-addressed IVs.
 * @param {number[][]} bodies GP-ciphertext rune vectors.
 * @param {object} lm GP trigram language model.
 */
function search(keys,ivs,bodies,lm){
  assert.ok(keys.length===8&&ivs.length===8&&bodies.length===8);
  let best={score:-Infinity};
  let runner=[];
  for(const mode of MODES){
    const all=bodies.map((body,section)=>ivs.map((iv)=>{
      const stream=streamKey(keys[section],mode,body.length+39,iv);
      return viterbi(body,stream,mode.sign,lm);
    }));
    const matrix=all.map(candidates=>candidates.map(a=>a.score));
    const assignment=matchColumns(matrix);
    const entry={...mode,...assignment,perRune:assignment.score/
      bodies.reduce((s,x)=>s+x.length,0)};
    runner.push(entry);
    if(entry.score>best.score)
      best={...entry,bodyEvidence:entry.columns.map((j,section)=>({
        section,gridIVColumn:j,logScorePerRune:all[section][j].perRune,
        keySkips:all[section][j].skips,
        sourceRrunicPrefix:all[section][j].plaintext.slice(0,65)
      }))};
  }
  runner.sort((a,b)=>b.score-a.score);
  return {best,modes:MODES.length,runnersUp:runner.slice(0,4)};
}

/**
 * Genuine original red-title keys and source grid IVs encrypt independently
 * GP-encoded Shakespeare held-out text with a hidden IV-column assignment.
 * This must reproduce all sections, all keys and the exact original method.
 * @param {Buffer[]} keys
 * @param {Buffer[]} ivs
 * @param {object} lm
 */
function plant(keys,ivs,lm){
  const gp=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  const plain=Array.from({length:8},(_,i)=>gp.slice(i*300,(i+1)*300));
  const mode={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1};
  const assignment=[6,2,4,0,1,7,5,3];
  const random=rand(0x38380017);
  const extras=[];
  const ciphertext=plain.map((body,s)=>{
    const stream=streamKey(keys[s],mode,345,ivs[assignment[s]]);
    let prev=-1,k=0,skips=0;
    const out=[];
    for(const p of body){
      let c=mod(p+stream[k]);
      if(c===prev && random()/4294967296<.81){
        k++;skips++;c=mod(p+stream[k]);
      }
      prev=c;out.push(c);k++;
    }
    extras.push(skips);
    return out;
  });
  const result=search(keys,ivs,ciphertext,lm);
  const correct=ciphertext.map((body,s)=>{
    const stream=streamKey(keys[s],mode,345,ivs[assignment[s]]);
    const decoded=viterbi(body,stream,mode.sign,lm);
    return {section:s,actualSkips:extras[s],decodedSkips:decoded.skips,
      correct:decoded.plaintext.filter((x,i)=>x===plain[s][i]).length};
  });
  const recovered=correct.reduce((s,x)=>s+x.correct,0);
  const modeRecovered=result.best.algo===mode.algo &&
    !result.best.reverseKey && result.best.reducer==="mod29" &&
    result.best.sign===1;
  const assignmentRecovered=assignment.every((v,i)=>v===result.best.columns[i]);
  assert.ok(recovered>2050);
  return {correct:recovered,total:2400,modeRecovered,assignmentRecovered,
    score:result.best.perRune,individual:correct};
}

/**
 * Null randomizes the original source IV bytes within each of the eight
 * columns and reruns 16 complete settings and every key-column pairing.
 * @param {Buffer[]} columns Original source grid columns.
 */
function nulls(keys,columns,bodies,lm,score,n=20){
  const rnd=rand(0x38386013);
  const vals=[];
  for(let trial=0;trial<n;trial++){
    const changed=columns.map(column=>{
      const b=Buffer.from(column);
      for(let j=b.length-1;j>0;j--){
        const k=rnd()%(j+1);
        [b[j],b[k]]=[b[k],b[j]];
      }
      return b;
    });
    vals.push(search(keys,gridIVs(changed),bodies,lm).best.perRune);
  }
  vals.sort((a,b)=>a-b);
  const exceed=vals.filter(v=>v>=score-1e-12).length;
  return {n,exceed,pUpper:(exceed+1)/(n+1),
    min:vals[0],median:vals[Math.floor(n/2)],max:vals[n-1]};
}

/** @returns {object} Actual unsolved-rune tests and exactly matching controls. */
function main(){
  const keys=titleKeys(),columns=originalKeys(),ivs=gridIVs(columns),
    bodies=originalBodies();
  const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const actual=search(keys,ivs,bodies,lm);
  const positive=plant(keys,ivs,lm);
  const controls=nulls(keys,columns,bodies,lm,actual.best.perRune);
  return {model:"Section SHA256(original red-title UTF8) as AES256 key, original grid column first16 as section IV",
    keyHex:keys.map(k=>k.toString("hex")),
    ivHex:ivs.map(iv=>iv.toString("hex")),
    originalCipherRunes:2400,sourceSectionCount:8,
    cipherModes:MODES.length,original:actual,positive,shuffledIVNull:controls,
    status:"No recovered LP2 plaintext until an independent readable exact re-encoding is demonstrated"};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={titleKeys,gridIVs,search,plant,nulls,main};
