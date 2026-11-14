'use strict';
/** Original LP2 stationary word-codebook necessary-condition SFT.
 * Node.js 22, CommonJS, read-only. Run from repository root:
 * node sims/lp2_global_wholeword_equality_source_sft.cjs
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const rx=new RegExp('['+gp.runes.join('')+']+','gu');
const source=read('resources/lp2-transcription.txt').split('%').slice(0,55).join('%').replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'');
const original=(source.match(rx)||[]).map(w=>[...w].map(r=>index.get(r)).join(','));
const L=w=>w.split(',').length;
function count(ws,minLen=4){
  const f=new Map();
  for(const w of ws)if(L(w)>=minLen)f.set(w,(f.get(w)||0)+1);
  return {tokens:[...f.values()].reduce((s,c)=>s+c,0),unique:f.size,pairs:[...f.values()].reduce((s,c)=>s+c*(c-1)/2,0)};
}
assert.equal(original.length,2896);
assert.deepEqual(count(original),{tokens:1645,unique:1645,pairs:0});
assert.deepEqual([1,2,3].map(n=>count(original.filter(w=>L(w)===n),n).pairs),[107,106,17]);
const n=Array.from({length:15},(_,j)=>original.filter(w=>L(w)===j).length);
assert.deepEqual(n.slice(1,11),[83,448,720,513,317,256,216,156,78,52]);
const files=[
 'resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/control/beowulf_oe_gp_profile_corrected.json',
 'resources/control/latin-vulgate-gp-wholewords.txt',
];
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(text){
  return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
    const out=[];
    for(let i=0;i<w.length;){
      if(w.startsWith('ING',i)){out.push(21);i+=3;continue;}
      if(w.startsWith('IO',i)){out.push(27);i+=2;continue;}
      const t=tokens.find(x=>w.startsWith(x.s,i));
      assert(t,'bad GP source text');
      out.push(t.i);i+=t.s.length;
    }
    return out.join(',');
  });
}
const native=files.slice(0,3).map(f=>encode(read(f)));
const old=JSON.parse(read(files[3]));let pos=0;
native.push(old.allSourceGpWordLengths.map(m=>{
  const w=[...old.sourceGpBase29.slice(pos,pos+m)].map(r=>old.positiveControlAlphabet.indexOf(r)).join(',');
  pos+=m;return w;
}));
assert.equal(pos,48012);
const alphabet='0123456789ABCDEFGHIJKLMNOPQRS';
native.push(read(files[4]).split(/\r?\n/).filter(w=>w&&!w.trimStart().startsWith('#'))
  .map(w=>[...w].map(c=>alphabet.indexOf(c)).join(',')));
assert.deepEqual(native.map(ws=>ws.length),[55407,15733,77932,10885,39835]);
function windows(words){
  const N=2896,f=new Map();let pairs=0,long=0;
  const update=(w,d)=>{
    if(L(w)<4)return;
    const before=f.get(w)||0;
    if(d===1){pairs+=before;f.set(w,before+1);long++;}
    else {pairs-=before-1;if(before===1)f.delete(w);else f.set(w,before-1);long--;}
  };
  for(let i=0;i<N;i++)update(words[i],1);
  let min=Infinity,max=-Infinity,minLong=Infinity,maxLong=-Infinity;
  for(let start=0;start<=words.length-N;start++){
    min=Math.min(min,pairs);max=Math.max(max,pairs);
    minLong=Math.min(minLong,long);maxLong=Math.max(maxLong,long);
    if(start+N<words.length){update(words[start],-1);update(words[start+N],1);}
  }
  return {windows:words.length-N+1,minPairs:min,maxPairs:max,minLong,maxLong};
}
const cont=native.map(windows);
assert.deepEqual(cont.map(x=>x.windows),[52512,12838,75037,7990,36940]);
assert.deepEqual(cont.map(x=>x.minPairs),[2559,3856,1021,1427,3570]);
assert.deepEqual(cont.map(x=>x.minLong),[1344,1306,1295,1853,1768]);
let state=0x33012014;
const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
const lengths=[4,5,6,7,8,9,10],counts=lengths.map(j=>n[j]);const NTRIALS=1500;
const matched=native.map(ws=>{
  const pools=lengths.map(k=>ws.filter(w=>L(w)===k));
  assert(pools.every(p=>p.length>0));
  let min=Infinity,max=0,total=0,zero=0;
  for(let trial=0;trial<NTRIALS;trial++){
    let pairs=0;
    for(let j=0;j<pools.length;j++){
      const pool=pools[j],f=new Map();
      for(let k=0;k<counts[j];k++){
        const word=pool[Math.floor(rng()*pool.length)],seen=f.get(word)||0;
        pairs+=seen;f.set(word,seen+1);
      }
    }
    min=Math.min(min,pairs);max=Math.max(max,pairs);total+=pairs;
    zero+=Number(pairs===0);
  }
  return {minPairs:min,maxPairs:max,meanPairs:total/NTRIALS,zeroSamples:zero};
});
assert.deepEqual(matched.map(x=>x.minPairs),[2157,3274,1531,1061,2849]);
assert(matched.every(x=>x.zeroSamples===0));
const shakespeare=native[0].slice(0,2896);
assert.equal(count(shakespeare).pairs,4506);
const planted=shakespeare.map(w=>w.split(',').map(i=>(Number(i)+13)%29).join(','));
assert.deepEqual(count(shakespeare),count(planted));
const randomExpected=n.reduce((sum,c,i)=>i>0?sum+c*(c-1)/2/Math.pow(29,i):sum,0);
assert(randomExpected>247&&randomExpected<248);
console.log(JSON.stringify({
 original:{allWords:original.length,byLength:n,wordPairsByLengthOneToThree:[107,106,17],
  lengthFourPlus:count(original),iid29ExpectedAllLengthPairs:randomExpected},
 nativeContiguous:files.map((file,i)=>({file,...cont[i]})),
 nativeLengthMatched:{lengths,counts,trialsPerSource:NTRIALS,seed:'0x33012014',
  tests:files.map((file,i)=>({file,...matched[i]}))},
 fixedMonoalphabeticControl:{originalPairs:count(shakespeare).pairs,
  permutedPairs:count(planted).pairs},
 conclusion:'no stationary deterministic word codebook explains ordinary repetitive natural text',
 recoveredUnknownPlaintextRunes:0,
},null,2));
