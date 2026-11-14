'use strict';
/**
 * All-symbol repeat-sentinel necessary-condition gate for original LP2.
 * Run: node sims/lp2_one_symbol_repeat_sentinel_sft.cjs
 * No dependencies or writes. Windows Node.js 22 compatible.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages.filter(p=>p.page<=55);
const original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,56);
assert.equal(original.length,12956);
const pageStarts=new Set();
let offset=0;
for(const p of pages){pageStarts.add(offset);offset+=p.indices.length;}
assert.equal(pageStarts.size,55);
const runeSet=new Set(corpus.runes);
const text=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('').replace(/[\/\r\n]/g,'');
const words=text.split(/[-.&$§]/)
  .map(x=>[...x].filter(c=>runeSet.has(c))).filter(w=>w.length);
assert.equal(words.length,2896);
assert.deepEqual(words.flat().map(c=>corpus.runes.indexOf(c)),original);
const slots=[];
offset=0;
for(const w of words){
  const omit=[];
  for(let j=0;j<w.length;j++)if(pageStarts.has(offset+j))omit.push(j);
  slots.push({length:w.length,omit});offset+=w.length;
}
assert.equal(offset,12956);
/** @param {number} j @param {number} n */
const cls=(j,n)=>j===0?0:j===n-1?2:1;
const originalCounts=[0,0,0];
offset=0;
for(const slot of slots){
  for(let j=0;j<slot.length;j++,offset++)
    if(!pageStarts.has(offset)&&original[offset]===original[offset-1])
      originalCounts[cls(j,slot.length)]++;
}
assert.deepEqual(originalCounts,[23,44,19]);
const letter={
  A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,
  K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,
  U:1,V:1,W:7,X:14,Y:26,Z:15
};
const digraph={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
/** @param {string} word */
function encodeWord(word){
  const out=[];
  for(let i=0;i<word.length;i++){
    const x=digraph[word.slice(i,i+2)];
    if(x!==undefined){out.push(x);i++;}else out.push(letter[word[i]]);
  }
  return out;
}
/** @param {number[][]} words */
function makePools(words){
  const pools=Array.from({length:15},()=>[]);
  for(const w of words)if(w.length>0&&w.length<15)pools[w.length].push(w);
  return pools;
}
const shakespeare=makePools(read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g).map(encodeWord));
const oldSource=JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
assert.equal(oldSource.schema,2);
const oldWords=[];
offset=0;
for(const len of oldSource.allSourceGpWordLengths){
  const word=[...oldSource.sourceGpBase29.slice(offset,offset+len)]
    .map(c=>oldSource.positiveControlAlphabet.indexOf(c));
  assert.ok(word.every(x=>x>=0&&x<29));
  oldWords.push(word);
  offset+=len;
}
assert.equal(offset,48012);
const beowulf=makePools(oldWords);
/** @param {number[]} plain @param {number} s */
function encrypt(plain,s){
  const cipher=[];
  for(let i=0;i<plain.length;i++){
    if(pageStarts.has(i))cipher.push(plain[i]);
    else if(plain[i]===s)cipher.push(cipher[i-1]);
    else cipher.push((cipher[i-1]+1+(plain[i]<s?plain[i]:plain[i]-1))%29);
  }
  return cipher;
}
/** @param {number[]} cipher @param {number} s */
function decrypt(cipher,s){
  const plain=[];
  for(let i=0;i<cipher.length;i++){
    if(pageStarts.has(i))plain.push(cipher[i]);
    else{
      const delta=(cipher[i]-cipher[i-1]+29)%29;
      const rank=delta-1;
      plain.push(delta===0?s:rank<s?rank:rank+1);
    }
  }
  return plain;
}
/** @param {number} actual @param {number} mean @param {number} variance */
function z(actual,mean,variance){
  return variance>1e-12?(actual-mean)/Math.sqrt(variance):
    actual===mean?0:Infinity;
}
/** @param {{length:number,omit:number[]}[]} valid @param {number[][][]} pools */
function expected(valid,pools){
  const groups=new Map();
  for(const slot of valid){
    const key=String(slot.length)+':'+slot.omit.join(',');
    if(!groups.has(key))groups.set(key,{...slot,n:0});
    groups.get(key).n++;
  }
  const mean=new Float64Array(87),variance=new Float64Array(87);
  for(const g of groups.values()){
    const pool=pools[g.length];
    const sum=new Float64Array(87),square=new Float64Array(87);
    for(const w of pool){
      const c=new Uint8Array(87);
      for(let j=0;j<w.length;j++)
        if(!g.omit.includes(j))c[3*w[j]+cls(j,w.length)]++;
      for(let k=0;k<87;k++){sum[k]+=c[k];square[k]+=c[k]*c[k];}
    }
    for(let k=0;k<87;k++){
      const m=sum[k]/pool.length;
      mean[k]+=g.n*m;
      variance[k]+=g.n*(square[k]/pool.length-m*m);
    }
  }
  return {mean,variance};
}
/** @param {number[]} v @param {{mean:Float64Array,variance:Float64Array}} stat @param {number} s */
function score(v,stat,s){
  let t=0;
  for(let cls=0;cls<3;cls++){
    const k=3*s+cls;
    t=Math.max(t,Math.abs(z(v[k],stat.mean[k],stat.variance[k])));
  }
  return t;
}
let rng=0x33013301;
/** @returns {number} */
function random(){
  rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;
  return (rng>>>0)/4294967296;
}
/** @param {number[][][]} pools @param {{length:number,omit:number[]}[]} valid */
function sample(pools,valid){
  const counts=new Int32Array(87),runes=[];
  for(const slot of valid){
    const w=pools[slot.length][Math.floor(random()*pools[slot.length].length)];
    runes.push(...w);
    for(let j=0;j<w.length;j++)
      if(!slot.omit.includes(j))counts[3*w[j]+cls(j,w.length)]++;
  }
  return {counts,runes};
}
/** @param {string} label @param {number[][][]} pools */
function run(label,pools){
  const valid=slots.filter(slot=>pools[slot.length].length>0);
  const unavailable=slots.length-valid.length;
  let off=0;
  const obs=[0,0,0];
  for(const slot of slots){
    for(let j=0;j<slot.length;j++,off++){
      if(pools[slot.length].length===0)continue;
      if(!pageStarts.has(off)&&original[off]===original[off-1])
        obs[cls(j,slot.length)]++;
    }
  }
  const stats=expected(valid,pools);
  const candidates=[];
  const target=new Int32Array(87);
  for(let s=0;s<29;s++){
    const means=[],dev=[];
    for(let c=0;c<3;c++){
      const k=3*s+c;target[k]=obs[c];
      means.push(Number(stats.mean[k].toFixed(3)));
      dev.push(Number(z(obs[c],stats.mean[k],stats.variance[k]).toFixed(3)));
    }
    candidates.push({s,symbol:corpus.translit[s],means,dev,
      t:score(target,stats,s)});
  }
  candidates.sort((a,b)=>a.t-b.t);
  const exceed=new Uint32Array(29),trials=2500;
  for(let i=0;i<trials;i++){
    const plant=sample(pools,valid);
    if(label==='Shakespeare'&&i===0){
      assert.equal(plant.runes.length,12956);
      for(const s of [0,13,25,28]){
        const cipher=encrypt(plant.runes,s);
        assert.deepEqual(decrypt(cipher,s),plant.runes);
        let repeats=0;
        for(let j=1;j<cipher.length;j++)
          if(!pageStarts.has(j)&&cipher[j]===cipher[j-1])repeats++;
        assert.equal(repeats,plant.runes.filter((x,j)=>!pageStarts.has(j)&&x===s).length);
      }
    }
    for(const c of candidates)if(score(plant.counts,stats,c.s)>=c.t)exceed[c.s]++;
  }
  const worst=Math.max(...exceed);
  const output={register:label,obs,validWords:valid.length,
    omittedWords:unavailable,omittedRepeatSites:86-obs.reduce((a,b)=>a+b,0),
    bestFive:candidates.slice(0,5).map(c=>({...c,t:Number(c.t.toFixed(6))})),
    nativeTrials:trials,largestNullExceedances:worst,
    monteCarloAddOneUpper:(worst+1)/(trials+1)};
  console.log(JSON.stringify(output,null,2));
  assert.ok(candidates[0].t>5);
}
run('Shakespeare',shakespeare);
run('corrected-Beowulf',beowulf);
