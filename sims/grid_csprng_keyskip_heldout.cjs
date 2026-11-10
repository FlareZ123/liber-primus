'use strict';
/**
 * Original LP2 eight-section grid-as-key CSPRNG inverse.
 *
 * Test each 32-byte column / 32-byte row chunk of the original 32x8 grid as
 * a genuine 256-bit stream key for AES-256-CTR, AES-256-OFB, or ChaCha20.
 * No arbitrary learned key, IV or alphabet mapping is allowed.
 *
 * The best 8-to-8 column assignment and cipher variant are fitted only
 * to the first 256 runes of each section; the next 256 are a held-out test.
 * The Viterbi allows 0-2 hidden key draws solely if those proposals
 * would have repeated the preceding ciphertext rune.
 *
 * Run: node sims/grid_csprng_keyskip_heldout.cjs
 * Node 22, no packages, network or writes. These are bounded hypotheses.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createCipheriv}=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/base60-grid.json'));
const R=29, TRAIN=256, HELD=256, MAX_DRIFT=24, SKIP_COST=2.6;
const lengths=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
const pages=corpus.pages.filter(x=>x.page<=55&&x.indices.length);
assert.equal(pages.length,55);
const stream=pages.flatMap(p=>p.indices);
assert.equal(stream.length,12956);
let off=0;
const sections=lengths.map(n=>{const x=stream.slice(off,off+n);off+=n;return x;});
assert.ok(sections.every(x=>x.length>=TRAIN+HELD));
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row=>row.length===8));
const rows=grid.byte_rows.flat();
assert.equal(rows.length,256);
const sourceKeys={
  columns:Array.from({length:8},(_,i)=>Buffer.from(grid.byte_rows.map(x=>x[i]))),
  rowchunks:Array.from({length:8},(_,i)=>Buffer.from(rows.slice(i*32,(i+1)*32)))
};
assert.ok(Object.values(sourceKeys).every(keys=>keys.every(k=>k.length===32)));
const generators=['aes-256-ctr','aes-256-ofb','chacha20'];
const ivs=['zeros','3301le','3301be'];
const mappings=['mod','scale','reject'];
const drops=[0,256];
const signs=[-1,1];
/** @param {string} ivName */
function iv(ivName){
  const v=Buffer.alloc(16);
  if(ivName==='3301le')v.writeUInt32LE(3301,0);
  else if(ivName==='3301be')v.writeUInt32BE(3301,12);
  else assert.equal(ivName,'zeros');
  return v;
}
/**
 * @param {Buffer} key Source selected 32-byte key.
 * @param {string} algorithm Standard cipher algorithm.
 * @param {string} ivName Frozen source-number IV serialization.
 * @param {string} map Raw byte-to-GP mapping.
 * @param {number} drop Raw stream bytes discarded first.
 * @param {number} needed Number of mod29 symbols.
 * @returns {Uint8Array}
 */
function pad(key,algorithm,ivName,map,drop,needed) {
  const cipher=createCipheriv(algorithm,key,iv(ivName));
  const raw=Buffer.concat([cipher.update(Buffer.alloc(1200)),cipher.final()]);
  assert.equal(raw.length,1200);
  const out=new Uint8Array(needed);
  let j=0;
  for(let i=drop;i<raw.length&&j<needed;i++){
    const b=raw[i];
    if(map==='reject'&&b>=232)continue;
    out[j++]=map==='scale'?Math.floor(R*b/256):b%R;
  }
  assert.equal(j,needed);
  return out;
}
/**
 * Convert true source text to 29-symbol Gematria Primus.
 * @param {string} s
 * @returns {number[]}
 */
function encode(s) {
  const lookup=new Map(corpus.translit.map((t,i)=>[t,i]));
  const tokens=s.toUpperCase().match(/[A-Z]+/g)||[];
  const output=[];
  for(let w of tokens){
    w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
    for(let i=0;i<w.length;){
      let done=false;
      for(const n of [3,2,1]){
        const t=w.slice(i,i+n);
        if(t.length===n&&lookup.has(t)){
          output.push(lookup.get(t));i+=n;done=true;break;
        }
      }
      assert.ok(done,'unsupported English GP grapheme '+w[i]);
    }
  }
  return output;
}
const reference=read('resources/control/shakespeare_first300k.txt');
const trainText=encode(reference.slice(0,200000));
const testText=encode(reference.slice(-80000));
assert.ok(testText.length>=8*(TRAIN+HELD));
/** @param {number[]} values */
function unigram(values){
  const hist=Array.from({length:R},()=>1);
  for(const v of values)hist[v]++;
  const n=values.length+R;
  return Float64Array.from(hist,x=>Math.log(x/n));
}
const logFreq=unigram(trainText);
/** @param {number} n */
const mod=n=>(n%R+R)%R;
/**
 * Exact skip-limited prefix decoding, with full Viterbi.
 * Includes two optional collision-conditioned skips; the cap is finite.
 *
 * @param {number[]} cipher
 * @param {Uint8Array} key
 * @param {number} sign
 * @param {number} start
 * @param {number} end
 * @param {number|null} initialDrift
 * @returns {{score:number,drift:number,plain:number[],skips:number}}
 */
function decode(cipher,key,sign,start,end,initialDrift){
  const n=end-start;
  assert.ok(n>0&&end<=cipher.length);
  const bound=MAX_DRIFT+(initialDrift??0);
  assert.ok(key.length>end+bound+2);
  let prev=new Float64Array(bound+1).fill(-1e90);
  const actions=[];
  if(initialDrift===null) {
    prev[0]=logFreq[mod(cipher[start]+sign*key[start])];
  } else {
    assert.ok(start>0);
    prev[initialDrift]=0;
  }
  let first=initialDrift===null?start+1:start;
  for(let i=first;i<end;i++){
    const next=new Float64Array(bound+1).fill(-1e90);
    const step=new Int8Array(bound+1);
    for(let drift=0;drift<=bound;drift++) {
      const p=mod(cipher[i]+sign*key[i+drift]);
      let value=prev[drift],skips=0;
      if(cipher[i]!==cipher[i-1])for(let consume=1;consume<=2;consume++){
        if(consume>drift)break;
        let accept=true;
        for(let h=1;h<=consume;h++) {
          const backKey=key[i+drift-h];
          if(mod(p-sign*backKey)!==cipher[i-1]) {
            accept=false;break;
          }
        }
        if(accept) {
          const s=prev[drift-consume]-SKIP_COST*consume;
          if(s>value){value=s;skips=consume;}
        }
      }
      next[drift]=value+logFreq[p];
      step[drift]=skips;
    }
    prev=next;actions.push(step);
  }
  let best=-Infinity,bestDrift=-1;
  for(let j=0;j<prev.length;j++)if(prev[j]>best){best=prev[j];bestDrift=j;}
  const plain=new Array(n);
  let drift=bestDrift,skips=0;
  for(let i=end-1;i>=first;i--){
    plain[i-start]=mod(cipher[i]+sign*key[i+drift]);
    const consume=actions[i-first][drift];
    drift-=consume;skips+=consume;
  }
  if(initialDrift===null) {
    assert.equal(drift,0);
    plain[0]=mod(cipher[start]+sign*key[start]);
  } else {
    assert.equal(drift,initialDrift);
  }
  return {score:best,drift:bestDrift,plain,skips};
}
/**
 * Recover best one-to-one assignment from all 64 normalized language scores.
 * @param {number[][]} matrix
 * @returns {{score:number,assignment:number[]}}
 */
function assign(matrix) {
  const best=new Float64Array(256).fill(-1e100);best[0]=0;
  const previous=new Int16Array(256).fill(-1);
  const chosen=new Int8Array(256).fill(-1);
  for(let mask=0;mask<256;mask++){
    const row=mask.toString(2).replace(/0/g,'').length;
    if(row>=8||best[mask]<-1e90)continue;
    for(let col=0;col<8;col++){
      const bit=1<<col;if(mask&bit)continue;
      const next=mask|bit;
      const score=best[mask]+matrix[row][col];
      if(score>best[next]){
        best[next]=score;
        previous[next]=mask;chosen[next]=col;
      }
    }
  }
  const assignment=new Array(8);
  let m=255;
  for(let row=7;row>=0;row--){assignment[row]=chosen[m];m=previous[m];}
  assert.equal(m,0);
  return {score:best[255],assignment};
}
/** @param {Array<number[]>} rows @param {Array<Uint8Array>} key */
function matrixScores(rows,key,sign){
  return rows.map(c=>key.map(k=>decode(c,k,sign,0,TRAIN,null).score));
}
/**
 * Select generator and assignment only on the first 256 runes/section.
 * @param {Array<number[]>} samples
 * @returns {Array}
 */
function rank(samples){
  const result=[];
  for(const [layout,keys] of Object.entries(sourceKeys))
    for(const algorithm of generators)for(const ivName of ivs)
      for(const map of mappings)for(const drop of drops){
        const padKeys=keys.map(k=>pad(k,algorithm,ivName,map,drop,600));
        for(const sign of signs) {
          const matrix=matrixScores(samples,padKeys,sign);
          const chosen=assign(matrix);
          result.push({
            layout,algorithm,ivName,map,drop,sign,
            train:chosen.score/(8*TRAIN),
            assignment:chosen.assignment,
            padKeys
          });
        }
      }
  result.sort((a,b)=>b.train-a.train);
  return result;
}
/**
 * Evaluate heldout source text with frozen generator, column assignment and
 * Viterbi-estimated first-section drift. Heldout skip states are still fitted;
 * so the result is an optimistic decoder bound, not a strict forward prediction.
 * @param {Array<number[]>} samples
 * @param {object} c
 */
function heldout(samples,c) {
  let score=0,correct=0,skips=0;
  for(let i=0;i<8;i++){
    const source=samples[i],k=c.padKeys[c.assignment[i]];
    const training=decode(source,k,c.sign,0,TRAIN,null);
    const held=decode(source,k,c.sign,TRAIN,TRAIN+HELD,training.drift);
    score+=held.score;skips+=training.skips+held.skips;
    if(source.truth){for(let j=0;j<HELD;j++)correct+=+(held.plain[j]===source.truth[TRAIN+j]);}
  }
  return {score:score/(8*HELD),skipCount:skips,
    accuracy:correct?correct/(8*HELD):null};
}
/** @param {Array<number[]>} sources */
function planted(sources){
  const referenceCandidate={layout:'columns',algorithm:'aes-256-ctr',
    ivName:'zeros',map:'reject',drop:0,sign:-1};
  let pos=0;
  return sources.map((s,i)=>{
    const truth=testText.slice(pos,pos+TRAIN+HELD);pos+=TRAIN+HELD;
    const k=pad(sourceKeys.columns[i],'aes-256-ctr','zeros','reject',0,600);
    let j=0;
    const encoded=[];
    for(const p of truth){
      let c=mod(p+k[j]);
      // Deterministic 81% skip-rejection; no random external state.
      if(encoded.length && c===encoded[encoded.length-1] &&
        ((i*257+encoded.length*53)%100)<81 && j+2<k.length){
        j++;c=mod(p+k[j]);
        if(c===encoded[encoded.length-1] &&
          ((i*119+encoded.length*17)%100)<81 && j+2<k.length){
          j++;c=mod(p+k[j]);
        }
      }
      encoded.push(c);j++;
    }
    encoded.truth=truth;
    return encoded;
  });
}
const injected=planted(sections);
const plantRankings=rank(injected);
const plantedWinner=plantRankings[0],actualRankings=rank(sections);
const actualWinner=actualRankings[0];
const expected=plantRankings.findIndex(x=>
  x.layout==='columns'&&x.algorithm==='aes-256-ctr'&&x.ivName==='zeros'&&
  x.map==='reject'&&x.drop===0&&x.sign===-1)+1;
const plantedHeldout=heldout(injected,plantedWinner);
const actualHeldout=heldout(sections,actualWinner);
assert.equal(plantRankings.length,216);
assert.equal(actualRankings.length,216);
assert.equal(expected,1,'source-selected planted key did not win');
assert.deepEqual(plantedWinner.assignment,[0,1,2,3,4,5,6,7]);
assert.ok(plantedHeldout.score>-3.1,'planted heldout linguistic signal lost');
/** @param {object} x */
const compact=x=>({
  layout:x.layout,algorithm:x.algorithm,iv:x.ivName,
  map:x.map,drop:x.drop,sign:x.sign,
  score:+x.train.toFixed(6),assignment:x.assignment,
  heldout:+heldout(x===plantedWinner?injected:sections,x).score.toFixed(6)
});
console.log(JSON.stringify({
  scope:{sections:8,sectionLengths:lengths,fitPerSection:TRAIN,holdoutPerSection:HELD,
    configurations:216,algorithms:generators,ivNames:ivs,mappings,drops,
    hiddenSkipDriftCap:MAX_DRIFT,confidence:'bounded direct 256-bit grid stream keys'},
  planted:{trueRank:expected,trueAssignment:plantedWinner.assignment,
    train:plantedWinner.train,heldout:plantedHeldout},
  original:{top:actualRankings.slice(0,7).map(x=>compact(x)),
    winnerHeldout:actualHeldout},
},null,2));
