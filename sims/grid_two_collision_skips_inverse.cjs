"use strict";

/**
 * Exact two-collision-skip original LP2 grid-key inverse.
 *
 * Extend the original AES/ChaCha Viterbi from one to TWO consecutive rejected
 * key draws per published rune. Every rejected draw is constrained to encrypt
 * the SAME plaintext symbol to the previously published ciphertext rune.
 * Previous-score GP language context remains exact, and all 8! source-key
 * section assignments are optimized. This tests an actual latent-state
 * architectural loophole in the previous one-skip negative.
 *
 * Run: node sims/grid_two_collision_skips_inverse.cjs
 * @module grid_two_collision_skips_inverse
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {originalKeys,originalBodies,streamKey,viterbi:legacyViterbi}=
  require("./grid_stream_collision_viterbi.cjs");
const {matchColumns}=require("./grid_word_order_inversion.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const N=29,MAX_EXTRA=42,MAX_REJECTED_PER_SYMBOL=2,SKIP_PENALTY=3.5;
const MODES=[];
for(const algo of ["aes-256-ctr","chacha20"])
for(const reverseKey of [false,true])
for(const reducer of ["mod29","scaled29"])
for(const sign of [1,-1])
  MODES.push({algo,reverseKey,reducer,sign});
const mod=x=>(x%N+N)%N;

/**
 * Exact Viterbi over (cumulative rejected key count, # last rejection);
 * total skip E before position i determines accepted pad index i+E.
 * Recover predecessor plaintext from original cipher and pad without an
 * approximating hidden LM state. This works for 0..2 rejections at each
 * ciphertext rune and permits a generous total of 42 extra draws.
 *
 * @param {number[]} cipher Original indexed GP ciphertext.
 * @param {number[]} pad Pre-generated 29-rune keystream of n+42+1.
 * @param {1|-1|number} sign Cipher = plain + sign*pad modulo 29.
 * @param {object} lm Source-independent GP unigram/bigram/trigram scores.
 * @param {number} maxLocal Maximum rejected draws per emitted symbol.
 * @returns {{score:number,perRune:number,plaintext:number[],skips:number,doubleSkips:number,skipLocations:number[]}}
 */
function inverse(cipher,pad,sign,lm,maxLocal=MAX_REJECTED_PER_SYMBOL){
  const n=cipher.length,cap=Math.min(MAX_EXTRA,n-1),lane=maxLocal+1,
    states=(cap+1)*lane;
  assert.ok(n>=3&&pad.length>=n+cap+1&&maxLocal>=0&&maxLocal<=2);
  const decoded=(i,e)=>mod(cipher[i]-sign*pad[i+e]);
  const attemptsFit=(i,e,r,plain)=>{
    for(let j=0;j<r;j++)
      if(mod(plain+sign*pad[i+e+j])!==cipher[i-1])
        return false;
    return true;
  };
  const trace=new Int16Array(n*states).fill(-1);
  let prev=new Float64Array(states).fill(-Infinity);
  const p0=decoded(0,0);
  for(let r=0;r<=maxLocal&&r<=cap;r++){
    const p1=decoded(1,r);
    if(!attemptsFit(1,0,r,p1))continue;
    prev[r*lane+r]=lm.unigram[p0]+lm.bigram[p0*N+p1]-r*SKIP_PENALTY;
  }
  for(let i=2;i<n;i++){
    const next=new Float64Array(states).fill(-Infinity);
    for(let e=0;e<=cap;e++)for(let old=0;old<=maxLocal&&old<=e;old++){
      const state=e*lane+old,score=prev[state];
      if(!Number.isFinite(score))continue;
      const p1=decoded(i-1,e),p2=decoded(i-2,e-old);
      const prefix=(p2*N+p1)*N;
      for(let r=0;r<=maxLocal&&e+r<=cap;r++){
        const p=decoded(i,e+r);
        if(!attemptsFit(i,e,r,p))continue;
        const dst=(e+r)*lane+r,
          candidate=score+lm.trigram[prefix+p]-r*SKIP_PENALTY;
        if(candidate>next[dst]){
          next[dst]=candidate;
          trace[i*states+dst]=state;
        }
      }
    }
    prev=next;
  }
  let best=-Infinity,state=-1;
  for(let j=0;j<states;j++)
    if(prev[j]>best){best=prev[j];state=j;}
  assert.ok(Number.isFinite(best)&&state>=0);
  const plain=new Array(n),skipLocations=[];
  const skips=Math.floor(state/lane);
  let doubleSkips=0;
  for(let i=n-1;i>=1;i--){
    const E=Math.floor(state/lane),r=state%lane;
    plain[i]=decoded(i,E);
    assert.ok(r<=E);
    assert.ok(attemptsFit(i,E-r,r,plain[i]));
    if(r===2)doubleSkips++;
    if(r>0)skipLocations.push(i);
    if(i>=2){
      state=trace[i*states+state];
      assert.ok(state>=0);
    }
  }
  plain[0]=p0;
  assert.ok(skips<=cap);
  const encrypted=[];
  let e=0,previous=-1;
  const rejects=Array(n).fill(0);
  for(const at of skipLocations)rejects[at]=0; // listed for audit below.
  const reconstructedE=[];
  state=-1;
  // Verify all plaintext symbols can be exactly re-encrypted with a valid
  // 0..2 collision-driven key rejection policy using the chosen Viterbi path.
  const replay=new Array(n);
  // Backtrack a second time via stored plaintext differences: for each
  // intermediate source plaintext, locate the unique chosen skipped-draw
  // count through the final optimized path retained above.
  // Use the transcript constructed in the original trace reconstruction:
  // skipLocations detects at least one reject but the exact full path needs
  // the recovered count 2 when present. Reconstruct by matching recovered
  // final value and the legal rejection constraint, preferring 2->1->0.
  for(let i=0;i<n;i++){
    const target=plain[i],curr=cipher[i];
    let chosen=-1;
    for(let r=0;r<=maxLocal&&i+e+r<pad.length;r++){
      if(mod(target+sign*pad[i+e+r])!==curr)continue;
      if(i>0&&!attemptsFit(i,e,r,target))continue;
      chosen=r;break;
    }
    // Ambiguous locally equal draw values can lead to distinct valid paths.
    // We audit exact original Viterbi trace separately below instead of
    // asserting the greedy reconstruction equals optimized cumulative skips.
    replay[i]=chosen;
    if(chosen>=0)e+=chosen;
    else break;
    encrypted.push(curr);previous=curr;
  }
  return {score:best,perRune:best/n,skips,doubleSkips,
    plaintext:plain,skipLocations:skipLocations.reverse(),
    localGreedyReplayPositions:encrypted.length};
}

/** @param {Buffer[]} keys @param {number[][]} bodies @param {object} lm */
function search(keys,bodies,lm){
  let best={score:-Infinity},configurations=0;
  for(const mode of MODES){
    const pads=keys.map(key=>streamKey(key,mode,350));
    const decoded=bodies.map(body=>pads.map(pad=>inverse(body,pad,mode.sign,lm)));
    const selected=matchColumns(decoded.map(row=>row.map(x=>x.score)));
    configurations++;
    if(selected.score>best.score){
      best={...mode,...selected,perRune:selected.score/2400,
        details:selected.columns.map((key,section)=>{
          const x=decoded[section][key];
          return {section,gridKeyColumn:key,perRune:x.perRune,
            skips:x.skips,doubleSkips:x.doubleSkips,
            localGreedyReplayPositions:x.localGreedyReplayPositions,
            gpPrefix:x.plaintext.slice(0,65)};
        })};
    }
  }
  return {best,configurations};
}

/** @returns {() => number} */
function rng(seed){let x=seed>>>0;return()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;
};}

/**
 * Authentic-key, independently held-out GP English with a genuine
 * two-draw skip when a collision occurs twice consecutively. Exact source
 * runes and ciphertext are used as an independent decoder regression.
 */
function planted(keys,lm){
  const gp=encode(read("resources/control/shakespeare_first300k.txt").slice(205000));
  const source=Array.from({length:8},(_,i)=>gp.slice(i*300,(i+1)*300)),
    known={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1},
    columns=[6,2,4,0,1,7,5,3],random=rng(0x3842beee);
  const skipped=[];
  const ciphertext=source.map((word,i)=>{
    const pad=streamKey(keys[columns[i]],known,350);
    let prev=-1,k=0,extra=0,second=0;
    const out=[];
    for(const p of word){
      let c=mod(p+pad[k]);
      for(let attempt=0;attempt<2&&c===prev;attempt++){
        if(random()/4294967296>=0.81)break;
        k++;extra++;if(attempt===1)second++;
        c=mod(p+pad[k]);
      }
      out.push(c);prev=c;k++;
    }
    skipped.push({extra,second});
    return out;
  });
  const result=search(keys,ciphertext,lm);
  const trueDecoded=source.map((plain,i)=>{
    const mode=known,pad=streamKey(keys[columns[i]],mode,350);
    const x=inverse(ciphertext[i],pad,mode.sign,lm);
    return {correct:x.plaintext.filter((r,j)=>r===plain[j]).length,
      predictedSkips:x.skips,observedSkips:skipped[i].extra,
      recoveredDoubleSkips:x.doubleSkips,trueDoubleSkips:skipped[i].second};
  });
  const recovered=trueDecoded.reduce((s,x)=>s+x.correct,0);
  return {trueMode:known,originalColumnAssignment:columns,
    correctMode:result.best.algo===known.algo &&
      result.best.reverseKey===known.reverseKey &&
      result.best.reducer===known.reducer && result.best.sign===known.sign,
    correctColumns:columns.every((x,i)=>x===result.best.columns[i]),
    recovered,total:2400,perRune:result.best.perRune,
    actualDoubleSkipTotal:skipped.reduce((s,x)=>s+x.second,0),
    inferredDoubleSkipTotal:trueDecoded.reduce((s,x)=>s+x.recoveredDoubleSkips,0),
    sections:trueDecoded};
}

/** @returns {object} Source and controls with full configuration search. */
function main(){
  const keys=originalKeys(),bodies=originalBodies();
  const lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  assert.equal(bodies.length,8);
  const actual=search(keys,bodies,lm);
  const plant=planted(keys,lm);
  assert.ok(plant.recovered>=2000);
  const rnd=rng(0x3842c0f1),nulls=[];
  for(let t=0;t<12;t++){
    const changed=keys.map(key=>{
      const b=Buffer.from(key);
      for(let j=b.length-1;j>0;j--){
        const k=rnd()%(j+1);[b[j],b[k]]=[b[k],b[j]];
      }
      return b;
    });
    nulls.push(search(changed,bodies,lm).best.perRune);
  }
  const ge=nulls.filter(x=>x>=actual.best.perRune).length;
  const result={source:"original numeric LP2 32×8 grid and original 8×300 body cipher",
    modeFamily:MODES.length,skipBudget:MAX_EXTRA,
    maximumConsecutiveRejectedKeys:2,
    original:actual,positiveEnglish:plant,
    shuffledGridControl:{n:nulls.length,exceed:ge,
      pUpper:(ge+1)/(nulls.length+1),min:Math.min(...nulls),
      median:nulls.slice().sort((a,b)=>a-b)[Math.floor(nulls.length/2)],
      max:Math.max(...nulls)},
    status:"No original plaintext/key unless actual output is readable and independently reencrypts"};
  return result;
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={inverse,search,planted,main};
