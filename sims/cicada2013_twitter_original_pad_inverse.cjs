'use strict';
/**
 * Read-only CommonJS SFT: authentic 2013 Cicada Twitter hex-bytes as a direct
 * GP29 pad for original 2014 LP2. Exhaust all 51,212 physical byte starts,
 * both 29-ary byte conversions and both cipher signs. Choose on first 3,000
 * original runes; score remaining 9,956 without selection. A full native-GP
 * Shakespeare plant proves true source-key recovery.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const archive=fs.readFileSync(path.join(root,'resources/cicada2013-twitter-hex-stream.txt'),'utf8');
const literature=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const M=29,TRAIN=3000;
/** @param {string} text @returns {Buffer} */
function twitterBytes(text){
  const lines=text.trim().split(/\r?\n/);
  assert.equal(lines.length,988);
  const result=Buffer.alloc(64167),occupied=new Uint8Array(result.length);
  for(const line of lines){
    const m=/^([0-9a-f]+): ([0-9a-f]+)$/i.exec(line);
    assert.ok(m,'offset / hex source line');
    const off=parseInt(m[1],16),bytes=Buffer.from(m[2],'hex');
    assert.equal(bytes.length*2,m[2].length);
    assert.ok(off+bytes.length<=result.length);
    for(let i=0;i<bytes.length;i++){
      assert.equal(occupied[off+i],0);
      occupied[off+i]=1;
      result[off+i]=bytes[i];
    }
  }
  assert.ok(occupied.every(x=>x===1));
  return result;
}
/** @param {string} text @returns {Uint8Array} */
function nativeGP(text){
  const labels=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(const unmodified of text.toUpperCase().match(/[A-Z]+/g)||[]){
    const word=unmodified.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    for(let j=0;j<word.length;){
      const token=labels.find(t=>word.startsWith(t.s,j));
      assert.ok(token,'GP-encodable source word: '+word);
      out.push(token.i);j+=token.s.length;
    }
  }
  return Uint8Array.from(out);
}
/** @param {Uint8Array} input @returns {number} */
function ioc(input){
  const h=new Uint32Array(M);
  for(const x of input)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(input.length*(input.length-1));
}
/** @param {Uint8Array} native */
function logF(native){
  const h=new Float64Array(M).fill(0.5);
  for(const x of native)h[x]++;
  return Float64Array.from(h,n=>Math.log(n/(native.length+M/2)));
}
/** @param {Buffer} raw @param {string} mode */
function keyStream(raw,mode){
  return Uint8Array.from(raw,b=>mode==='mod29'?b%M:Math.floor(M*b/256));
}
/** @param {Uint8Array} ciphertext @param {Uint8Array} key @param {number} offset @param {number} sign */
function decode(ciphertext,key,offset,sign){
  const out=new Uint8Array(ciphertext.length);
  for(let i=0;i<out.length;i++){
    let v=ciphertext[i]+sign*key[i+offset];
    if(v<0)v+=M;else if(v>=M)v-=M;
    out[i]=v;
  }
  return out;
}
/** @param {Uint8Array} plain @param {Uint8Array} key @param {number} offset @param {number} sign */
function encode(plain,key,offset,sign){
  const out=new Uint8Array(plain.length);
  for(let i=0;i<out.length;i++){
    let v=plain[i]-sign*key[i+offset];
    if(v<0)v+=M;else if(v>=M)v-=M;
    out[i]=v;
  }
  return out;
}
/** @param {Uint8Array} cipher @param {Buffer} raw @param {Float64Array} logfreq */
function fit(cipher,raw,logfreq){
  assert.ok(cipher.length>TRAIN && cipher.length<=raw.length);
  let winner={score:-Infinity},candidates=0;
  for(const mode of ['mod29','scaled29']){
    const key=keyStream(raw,mode);
    for(const sign of [-1,1]){
      for(let off=0;off<=key.length-cipher.length;off++){
        let score=0;
        for(let i=0;i<TRAIN;i++){
          let v=cipher[i]+sign*key[off+i];
          if(v<0)v+=M;else if(v>=M)v-=M;
          score+=logfreq[v];
        }
        candidates++;
        if(score>winner.score)winner={score,mode,sign,offset:off};
      }
    }
  }
  assert.equal(candidates,4*(raw.length-cipher.length+1));
  const key=keyStream(raw,winner.mode);
  const plaintext=decode(cipher,key,winner.offset,winner.sign);
  assert.deepEqual(encode(plaintext,key,winner.offset,winner.sign),cipher);
  let heldout=0;
  for(let i=TRAIN;i<cipher.length;i++)heldout+=logfreq[plaintext[i]];
  return {
    selected:{mode:winner.mode,sign:winner.sign,offset:winner.offset},
    tried:candidates,train: winner.score/TRAIN,
    heldout:heldout/(cipher.length-TRAIN),ioc:ioc(plaintext),
    first50:Array.from(plaintext.subarray(0,50),i=>corpus.translit[i]).join(' '),
    plaintext
  };
}
function main(){
  const bytes=twitterBytes(archive),shakespeare=nativeGP(literature);
  assert.equal(shakespeare.length,218800);
  const c=Uint8Array.from(corpus.pages.filter(p=>p.status==='unsolved')
    .flatMap(p=>p.indices));
  assert.equal(c.length,12956);
  const probs=logF(shakespeare.subarray(0,120000));
  const original=fit(c,bytes,probs);
  const hidden={mode:'scaled29',sign:-1,offset:9901};
  const native=shakespeare.subarray(120000,120000+c.length);
  const cipherPlant=encode(native,keyStream(bytes,hidden.mode),hidden.offset,hidden.sign);
  const planted=fit(cipherPlant,bytes,probs);
  assert.deepEqual(planted.selected,hidden);
  assert.deepEqual(planted.plaintext,native);
  const answer={
    class:'Original negative direct historical key test; no plaintext recovered',
    historicalSource:{
      archive:'https://github.com/lastpacketbender/991948530947554/tree/main/2013/003-twitter/tweets',
      hexLines:988,bytes:bytes.length,
      byteSHA256:crypto.createHash('sha256').update(bytes).digest('hex')
    },
    test:{
      ciphertextRunes:c.length,trainingRunes:TRAIN,heldoutRunes:c.length-TRAIN,
      allSourceOffsets:[0,bytes.length-c.length],
      allKeyModels:original.tried,
      rawCLogLikelihood:c.reduce((s,v)=>s+probs[v],0)/c.length,
      winningKey:original.selected,trainLogLikelihood:original.train,
      heldoutLogLikelihood:original.heldout,
      plaintextIoC:original.ioc,first50GP:original.first50,
      exactOriginalReencryption:true
    },
    sourceGPPositive:{
      hiddenKeyRecovered:planted.selected,sourceRunesRecovered:native.length,
      trainLogLikelihood:planted.train,
      heldoutLogLikelihood:planted.heldout,
      exactNativeRecovered:true
    },
    conclusion:'The source-fitted historical key fails to recover native GP prose on the original heldout runes. Other source clocks, cipher families and plaintext registers are outside this test.'
  };
  console.log(JSON.stringify(answer,null,2));
  return answer;
}
if(require.main===module)main();
module.exports={twitterBytes,nativeGP,ioc,logF,keyStream,decode,encode,fit,main};
