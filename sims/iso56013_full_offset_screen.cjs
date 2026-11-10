'use strict';
/**
 * Exhaustive LP2 page-0 body versus the original CicadaOS DATA/560.13 pad.
 * Exact one-draw collision skip inverse, arbitrary starting byte offset, and
 * two additive GP key signs. Source: ISO byte stream, not an invented key.
 * Command: node sims/iso56013_full_offset_screen.cjs <560.13> <mod|reject> <result.json>
 * Pure Node.js 22 CommonJS. Runs on the repository's committed corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const DRIFT = 8;
const SKIP_COST = 3.5;
const EXPECTED_SIZE = 118818811;
const EXPECTED_SHA = 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f';
const LATIN = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const LETTERS = Object.fromEntries([
  ['A',24],['B',17],['C',5],['D',23],['E',18],['F',0],['G',6],['H',8],['I',10],
  ['J',11],['K',5],['L',20],['M',19],['N',9],['O',3],['P',13],['Q',5],['R',4],
  ['S',15],['T',16],['U',1],['V',1],['W',7],['X',14],['Y',26],['Z',15]]);
const DIGRAPHS = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const enc = text => {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i=0;i<s.length;i++) {
    const d=DIGRAPHS[s.slice(i,i+2)];
    if (d !== undefined) {out.push(d);i++;}
    else out.push(LETTERS[s[i]]);
  }
  return out;
};
const mod = n => (n%MOD+MOD)%MOD;
function read(rel) {return fs.readFileSync(path.join(ROOT,rel),'utf8');}
function mapBytes(buf,mode) {
  assert.ok(mode==='mod'||mode==='reject');
  if(mode==='mod'){
    const key=new Uint8Array(buf.length);
    for(let i=0;i<buf.length;i++)key[i]=buf[i]%MOD;
    return key;
  }
  const temp=new Uint8Array(buf.length);let n=0;
  for(let i=0;i<buf.length;i++)if(buf[i]<232)temp[n++]=buf[i]%MOD;
  return temp.subarray(0,n);
}
function prepare(key) {
  const gap=new Uint8Array(key.length-1);
  for(let i=0;i<gap.length;i++)gap[i]=mod(key[i]-key[i+1]);
  const plus=new Uint8Array(MOD*MOD);
  const minus=new Uint8Array(MOD*MOD);
  for(let c=0;c<MOD;c++)for(let k=0;k<MOD;k++){
    plus[c*MOD+k]=(c+k)%MOD;
    minus[c*MOD+k]=(c-k+MOD)%MOD;
  }
  return {gap,plus,minus};
}
function train(source) {
  const counts=new Float64Array(MOD).fill(0.8);
  const symbols=enc(source);
  for(const p of symbols)counts[p]++;
  const n=counts.reduce((a,b)=>a+b,0);
  return {symbols:symbols.length,logp:Float64Array.from(counts,c=>Math.log(c/n))};
}
function diffCipher(C,sign){
  const differences=new Uint8Array(C.length);
  for(let i=1;i<C.length;i++) {
    const v=mod(C[i-1]-C[i]);
    differences[i]=sign===-1?v:mod(-v);
  }
  return differences;
}
/**
 * Exact max-sum unary score over all histories consuming <=maxDrift
 * extra keys; a key skip is permitted only when its discarded proposal
 * would have equaled the immediately previous published ciphertext rune.
 * @param {number[]|Uint8Array} C Original ciphertext or known plant.
 * @param {Uint8Array} key Source bytes reduced to 29 symbols.
 * @param {{gap:Uint8Array,plus:Uint8Array,minus:Uint8Array}} pre
 * @param {Float64Array} logp 29-language log probabilities.
 * @param {number} start Absolute key offset.
 * @param {1|-1} sign Plaintext P = C + sign*K mod29.
 * @param {number} count Prefix rune count.
 * @param {number} maxDrift Number of permitted one-draw extra keys.
 * @param {boolean} trace Whether to recover decoded runes and skips.
 */
function scoreAt(C,key,pre,logp,start,sign,count,maxDrift,trace=false){
  const look=sign===1?pre.plus:pre.minus;
  const delta=diffCipher(C,sign);
  const dp=new Float64Array(maxDrift+1);
  const decisions=trace?new Uint8Array(count*(maxDrift+1)):null;
  dp.fill(-Infinity);
  dp[0]=logp[look[C[0]*MOD+key[start]]];
  for(let i=1;i<count;i++){
    const cbase=C[i]*MOD,maxD=Math.min(maxDrift,i);
    for(let d=maxD;d>=1;d--){
      const j=start+i+d;
      let v=dp[d],choose=0;
      if(pre.gap[j-1]===delta[i]){
        const alternative=dp[d-1]-SKIP_COST;
        if(alternative>v){v=alternative;choose=1;}
      }
      dp[d]=v+logp[look[cbase+key[j]]];
      if(decisions)decisions[i*(maxDrift+1)+d]=choose;
    }
    dp[0]+=logp[look[cbase+key[start+i]]];
  }
  let best=-Infinity,drift=0;
  for(let d=0;d<=maxDrift;d++)if(dp[d]>best){best=dp[d];drift=d;}
  if(!trace)return {score:best};
  const totalSkips=drift,p=new Array(count),skips=[];
  for(let i=count-1;i>=0;i--){
    p[i]=look[C[i]*MOD+key[start+i+drift]];
    if(i && decisions[i*(maxDrift+1)+drift]){skips.push(i);drift--;}
  }
  assert.equal(drift,0);
  return {score:best,skips:skips.reverse(),totalSkips,plaintext:p,
    transliteration:p.map(x=>LATIN[x]).join('')};
}
function seedRng(seed){
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};
}
function plant(P,key,start,sign,rng){
  const out=[];let j=start,prev=-1,skips=0;
  for(const p of P){
    let c=mod(p-sign*key[j]);
    if(prev>=0 && c===prev && rng()<0.82){
      skips++;j++;c=mod(p-sign*key[j]);
    }
    out.push(c);prev=c;j++;
  }
  return {cipher:out,skips,consumed:j-start};
}
function minHeapInsert(heap,entry,maxCount){
  if(heap.length<maxCount){heap.push(entry);}
  else if(entry.score<=heap[0].score)return;
  else heap[0]=entry;
  let i=heap.length-1;
  if(heap.length===maxCount && heap[0]===entry)i=0;
  if(i){
    while(i>0){const p=(i-1)>>1;if(heap[p].score<=heap[i].score)break;
      [heap[i],heap[p]]=[heap[p],heap[i]];i=p;}
  }else{
    while(true){const l=2*i+1,r=l+1;if(l>=heap.length)break;
      const child=r<heap.length&&heap[r].score<heap[l].score?r:l;
      if(heap[i].score<=heap[child].score)break;
      [heap[i],heap[child]]=[heap[child],heap[i]];i=child;}
  }
}
function scan(C,key,pre,logp,sign,maxOffsets,firstN,topCount,progress){
  const lookup=sign===1?pre.plus:pre.minus;
  const delta=diffCipher(C,sign);
  const dp=new Float64Array(DRIFT+1);
  const heap=[];
  let mean=0,m2=0,n=0,maximum=-Infinity;
  const begin=Date.now();
  for(let offset=0;offset<maxOffsets;offset++){
    dp.fill(-Infinity);dp[0]=logp[lookup[C[0]*MOD+key[offset]]];
    for(let i=1;i<firstN;i++){
      const cbase=C[i]*MOD,maxD=Math.min(DRIFT,i);
      for(let d=maxD;d>=1;d--){
        const j=offset+i+d;
        let v=dp[d];
        if(pre.gap[j-1]===delta[i]){
          const alt=dp[d-1]-SKIP_COST;
          if(alt>v)v=alt;
        }
        dp[d]=v+logp[lookup[cbase+key[j]]];
      }
      dp[0]+=logp[lookup[cbase+key[offset+i]]];
    }
    let score=-Infinity;
    for(let d=0;d<=DRIFT;d++)if(dp[d]>score)score=dp[d];
    if(score>maximum)maximum=score;
    n++;const shift=score-mean;mean+=shift/n;m2+=shift*(score-mean);
    if(heap.length<topCount||score>heap[0].score)
      minHeapInsert(heap,{offset,sign,score},topCount);
    if(progress&&offset>0&&(offset%20000000===0))
      console.log(JSON.stringify({kind:'progress',sign,offset,maxOffsets,
        seconds:(Date.now()-begin)/1000, best:maximum,retainedFloor:heap[0].score}));
  }
  const top=heap.sort((a,b)=>b.score-a.score);
  return {sign,scanned:n,prefix:firstN,mean,sd:Math.sqrt(m2/(n-1)),
    maximum,bestOffsets:top};
}
function saveAtomic(file,obj) {
  const lock=file+'.lock',fd=fs.openSync(lock,'wx');
  const temp=file+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,file);
  }finally{fs.closeSync(fd);fs.rmSync(lock,{force:true});fs.rmSync(temp,{force:true});}
}
function run(inputFile,mapMode,outputFile) {
  const raw=fs.readFileSync(inputFile);
  assert.equal(raw.length,EXPECTED_SIZE,'Original Cicada OS asset size');
  const sha=crypto.createHash('sha256').update(raw).digest('hex');
  assert.equal(sha,EXPECTED_SHA,'Original Cicada OS asset SHA256');
  const key=mapBytes(raw,mapMode),pre=prepare(key);
  const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const page=corpus.pages.find(p=>p.page===0).indices;
  assert.equal(page.length,262);
  const cipher=page.slice(13),firstN=96;
  const model=train(read('resources/control/shakespeare_first300k.txt'));
  const maximumOffset=key.length-cipher.length-24-1;
  const n=process.env.LP2_TEST_OFFSETS?
    Math.min(Number(process.env.LP2_TEST_OFFSETS),maximumOffset):maximumOffset;
  assert.ok(Number.isSafeInteger(n)&&n>1000);
  const rows=[];
  for(const sign of [-1,1]){
    console.log(JSON.stringify({kind:'begin',sign,mapMode,offsets:n}));
    rows.push(scan(cipher,key,pre,model.logp,sign,n,firstN,64,true));
  }
  const shortTop=rows.flatMap(x=>x.bestOffsets).sort((a,b)=>b.score-a.score);
  const finalists=shortTop.map(row=>{
    const d=scoreAt(cipher,key,pre,model.logp,row.offset,row.sign,
      cipher.length,24,true);
    return {...row,bodyScore:d.score,bodyScorePerRune:d.score/cipher.length,
      skips:d.totalSkips,skipPositions:d.skips,
      possiblePlaintext:d.transliteration};
  }).sort((a,b)=>b.bodyScore-a.bodyScore);
  const gibran=enc(read('resources/control/gibran_prophet_58585.txt'));
  assert.ok(gibran.length>2000);
  const rng=seedRng(0x56013301),positive=[];
  const discoveryBar=Math.max(...rows.map(r=>r.maximum));
  for(let t=0;t<40;t++){
    const offset=1000+73313*t;
    const p=gibran.slice(800+41*t,800+41*t+firstN);
    const sign=t%2?-1:1;
    const synth=plant(p,key,offset,sign,rng);
    const result=scoreAt(synth.cipher,key,pre,model.logp,offset,sign,firstN,
      DRIFT,true);
    const recovered=result.plaintext.filter((x,i)=>x===p[i]).length;
    positive.push({offset,sign,plantedSkips:synth.skips,inferredSkips:result.totalSkips,
      recovered,sourceRunes:p.length,score:result.score,
      aboveOriginalMaximum:result.score>discoveryBar});
  }
  const result={source:'2013 Cicada OS DATA/560.13 original ISO',mapMode,
    originalBytes:raw.length,sha256:sha,keyRunes:key.length,
    cipher:'LP2 page0 black body, indices 13..261 inclusive',
    training:'first 300k Shakespeare characters, GP digraph encoder',
    method:'all byte offsets; both signs; exact one-discard skip with max drift 8 on 96-rune discovery, 24 on complete 249-rune page',
    skipCost:SKIP_COST,
    search:{offsetsPerSign:n,model:'GP-smoothed unigram, backtrace original'},
    original:rows.map(({bestOffsets,...rest})=>({...rest,top:bestOffsets.slice(0,12)})),
    finalistCount:finalists.length,
    finalists:finalists.slice(0,20),
    positives:{samples:positive.length,aboveOriginalMaximum:positive.filter(x=>x.aboveOriginalMaximum).length,
      perfectRecovered:positive.filter(x=>x.recovered===x.sourceRunes).length,
      minScore:Math.min(...positive.map(x=>x.score)),
      examples:positive.slice(0,12)},
    interpretation:'A finite source-key search only. English-like recovered text and full original re-encryption are required for any positive decryption claim.'
  };
  saveAtomic(outputFile,result);
  console.log(JSON.stringify({kind:'complete',mapMode,
    maxOriginal:discoveryBar,topFinalist:finalists[0]?.bodyScorePerRune,
    positives:result.positives,results:outputFile}));
  return result;
}
if(require.main===module){
  assert.equal(process.argv.length,5,
    'Usage: node sims/iso56013_full_offset_screen.cjs 560.13 mod|reject result.json');
  run(process.argv[2],process.argv[3],process.argv[4]);
}
module.exports={enc,mapBytes,prepare,train,scoreAt,plant,scan,run};
