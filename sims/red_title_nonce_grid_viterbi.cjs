"use strict";
/**
 * Source-constrained LP2 rune recovery with original red section titles
 * providing per-section 128-bit IV/nonce to the original 8 x 256-bit
 * numeric-grid keys. Ciphertext-repeat-conditioned Viterbi skips are retained.
 *
 * Exact AES/ChaCha GP plaintext inversion; independent English plant and
 * full configuration-search shuffled-key null. Node 22, CommonJS.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {originalKeys,originalBodies,streamKey,viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {matchColumns}=require("./grid_word_order_inversion.cjs");
const ROOT=path.resolve(__dirname,"..");
const read=x=>fs.readFileSync(path.join(ROOT,x),"utf8");
const ALPHABET=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const NUMBER=new Map(ALPHABET.map((x,i)=>[x,i]));
const ANCHORS=[[0,0,13],[3,0,16],[8,0,12],[15,9,11],
  [23,0,16],[27,0,19],[33,91,8],[40,0,8]];
const MODES=[];
for(const algo of ["aes-256-ctr","chacha20"])
for(const reverseKey of [false,true])
for(const reducer of ["mod29","scaled29"])
for(const sign of [1,-1])
MODES.push({algo,reverseKey,reducer,sign});
const mod=x=>(x%29+29)%29;

/** @returns {string[]} Eight original image-annotated red section titles. */
function redTitles(){
  const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  return ANCHORS.map(([page,offset,length])=>{
    const annotation=ink.pages.find(p=>p.page===page);
    assert.ok(annotation);
    const span=annotation.red_spans.find(s=>s.start===offset&&s.length===length);
    assert.ok(span);
    assert.equal([...span.runes].length,length);
    return span.runes;
  });
}

/**
 * Two exact independent nonce constructions. hash-utf8 uses SHA-256 of
 * literal UTF-8 Unicode runes, first 16 bytes; repeat-index repeats the
 * Gematria Primus integer index sequence up to 16 bytes. Both are fixed
 * prior to observing the ciphertext.
 */
function titleNonces(titles,scheme){
  return titles.map(heading=>{
    if(scheme==="sha256-utf8")return crypto.createHash("sha256")
      .update(Buffer.from(heading,"utf8")).digest().subarray(0,16);
    assert.equal(scheme,"repeat-gp-indices");
    const indices=[...heading].map(c=>NUMBER.get(c));
    assert.ok(indices.every(v=>v!==undefined));
    return Buffer.from(Array.from({length:16},(_,i)=>indices[i%indices.length]));
  });
}

/** @param {Buffer[]} keys @param {number[][]} bodies @param {Buffer[]} ivs @param {object} lm */
function search(keys,bodies,ivs,lm){
  let best={score:-Infinity};
  const candidates=[];
  for(const mode of MODES){
    const all=bodies.map((body,g)=>keys.map(key=>{
      const keystream=streamKey(key,mode,body.length+39,ivs[g]);
      return viterbi(body,keystream,mode.sign,lm);
    }));
    const matrix=all.map(row=>row.map(x=>x.score));
    const chosen=matchColumns(matrix);
    const candidate={...mode,...chosen,perRune:chosen.score/2400};
    candidates.push(candidate);
    if(chosen.score>best.score){
      best={...candidate,bodyEvidence:chosen.columns.map((c,g)=>({
        body:g,key:c,skips:all[g][c].skips,perRune:all[g][c].perRune,
        gpPrefix:all[g][c].plaintext.slice(0,65).map(x=>ALPHABET[x]).join("")
      }))};
    }
  }
  return {best,candidateCount:candidates.length,
    runnersUp:candidates.sort((a,b)=>b.score-a.score).slice(0,4)};
}

function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** Positive source from separate held-out Shakespeare content. */
function plant(keys,ivs,lm){
  const source=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  const plaintext=Array.from({length:8},(_,i)=>source.slice(i*300,(i+1)*300));
  const mode={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1};
  const assignment=[6,2,4,0,1,7,5,3];
  const random=rng(0x37a1c5e);
  const skipped=[];
  const encrypted=plaintext.map((plain,g)=>{
    const key=streamKey(keys[assignment[g]],mode,340,ivs[g]);
    let pos=0,previous=-1,skips=0;
    const out=[];
    for(const p of plain){
      let c=mod(p+key[pos]);
      if(c===previous && (random()/4294967296)<.81){
        pos++;skips++;c=mod(p+key[pos]);
      }
      out.push(c);previous=c;pos++;
    }
    skipped.push(skips);
    return out;
  });
  const winner=search(keys,encrypted,ivs,lm);
  const correct=plaintext.map((p,g)=>{
    const key=streamKey(keys[assignment[g]],mode,340,ivs[g]);
    const result=viterbi(encrypted[g],key,mode.sign,lm);
    return {correct:result.plaintext.filter((v,i)=>v===p[i]).length,
      actualSkips:skipped[g],decodedSkips:result.skips};
  });
  const n=correct.reduce((s,x)=>s+x.correct,0);
  const assignmentRecovered=assignment.every((v,i)=>winner.best.columns[i]===v);
  const modeRecovered=winner.best.algo==="aes-256-ctr"&&!winner.best.reverseKey&&
    winner.best.reducer==="mod29"&&winner.best.sign===1;
  assert.ok(n>=.85*2400);
  return {trueMode:mode,assignment,modeRecovered,assignmentRecovered,
    correct:n,total:2400,recoveryRate:n/2400,score:winner.best.perRune,perBody:correct};
}

/** Match the full original search under random byte shuffles within columns. */
function nulls(keys,bodies,ivs,lm,observed,n=20){
  const next=rng(0x3704c81);
  const values=[];
  for(let r=0;r<n;r++){
    const changed=keys.map(k=>{
      const b=Buffer.from(k);
      for(let i=b.length-1;i>0;i--){
        const j=next()%(i+1),old=b[i];b[i]=b[j];b[j]=old;
      }
      return b;
    });
    values.push(search(changed,bodies,ivs,lm).best.perRune);
  }
  values.sort((a,b)=>a-b);
  const over=values.filter(x=>x>=observed.best.perRune).length;
  return {trials:n,seed:"0x3704c81",exceed:over,pUpper:(over+1)/(n+1),
    min:values[0],median:values[Math.floor(n/2)],max:values[n-1],values};
}
function main(){
  const keys=originalKeys(),bodies=originalBodies();
  const titles=redTitles(),lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const results=[];
  for(const scheme of ["sha256-utf8","repeat-gp-indices"]){
    const ivs=titleNonces(titles,scheme);
    const actual=search(keys,bodies,ivs,lm);
    const positive=plant(keys,ivs,lm);
    const controls=nulls(keys,bodies,ivs,lm,actual);
    results.push({scheme,ivHex:ivs.map(v=>v.toString("hex")),
      positive,original:actual,randomizedGridNull:controls});
  }
  process.stdout.write(JSON.stringify({question:"red-section-heading IV derived from original ink-source + 8 original grid-column symmetric keys, collision-skipping exact rune Viterbi",
    sourceRunePrefix:300,modeFamilies:MODES.length,keys:8,schemes:results},null,2)+"\n");
}
if(require.main===module)main();
module.exports={redTitles,titleNonces,search,plant,nulls};
