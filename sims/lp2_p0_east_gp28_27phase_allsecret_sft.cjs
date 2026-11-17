'use strict';

/**
 * Unrestricted-secret east-edge 27-phase GP28 successor-cipher gate.
 * A hypothetical 27-rune key column selects 27 phases; each phase has a
 * COMPLETELY UNKNOWN, independent bijection of the 28 nonreserved symbols.
 * Source-native GP symbol EA (index28) is a public predecessor-equality escape.
 * The observed same-phase ciphertext rank collision total equals the unknown
 * plaintext collision total EXACTLY, whatever every secret phase alphabet is.
 *
 * Read-only Windows Node22 single-file:
 * node sims/lp2_p0_east_gp28_27phase_allsecret_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const original=JSON.parse(fs.readFileSync(path.join(
  root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(
  root,'resources','external','relikd-solved-gp29-native-v1.json'),'utf8'));
const index=new Map(original.runes.map((r,i)=>[r,i]));
const clear=solved.sections.flatMap(s=>Array.from(s.source_text)
  .filter(r=>index.has(r)).map(r=>index.get(r)));
assert.equal(clear.length,2979);
// Independently selected Latin Vulgate GP29 register used by the project.
// Each already-converted source word occupies one line; metadata is a comment.
const latinAlphabet='0123456789ABCDEFGHIJKLMNOPQRS';
const latin=fs.readFileSync(path.join(root,'resources','control',
  'latin-vulgate-gp-wholewords.txt'),'utf8').split(/\r?\n/)
  .filter(line=>line.length>0&&!line.trim().startsWith('#'))
  .join('').split('').map(ch=>latinAlphabet.indexOf(ch));
assert.equal(latin.length,204802);
assert.ok(latin.every(x=>x>=0&&x<=28));
const segment=(a,b)=>original.pages.filter(p=>p.page>=a&&p.page<=b)
  .flatMap(p=>p.indices);
const map=segment(0,2);
assert.equal(map.length,729);
const east=Array.from({length:27},(_,r)=>map[27*r+26]);
assert.deepEqual(east,[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]);
const inputs=[
  {pages:'p3-p7',source:segment(3,7),plain:clear.slice(0,1145),latin:latin.slice(0,1145)},
  {pages:'p8-p14',source:segment(8,14),plain:clear.slice(1145,2874),latin:latin.slice(1145,2874)}
];
assert.deepEqual(inputs.map(x=>x.source.length),[1145,1729]);
const mod=(x,n)=>((x%n)+n)%n;

/**
 * @param {number[]} values GP indices, actual ciphertext or native plaintext
 * @param {'cipher'|'native'} kind
 * @param {'numeric'|'cyclic'} ordering
 * @param {boolean} skipRepeatClock
 * @returns {{n:number,pairs:number,matches:number,ioc:number}}
 */
function profile(values,kind,ordering,skipRepeatClock) {
  const cells=Array.from({length:27},()=>Array(28).fill(0));
  let tick=0,n=0;
  for(let i=1;i<values.length;i++){
    let symbol=values[i];
    if(kind==='cipher'){
      const previous=values[i-1];
      if(symbol===previous){
        if(!skipRepeatClock)tick++;
        continue;
      }
      symbol=ordering==='numeric'
        ?symbol-(symbol>previous?1:0)
        :mod(symbol-previous-1,29);
    } else if(symbol===28){
      if(!skipRepeatClock)tick++;
      continue;
    }
    assert.ok(symbol>=0&&symbol<28);
    cells[tick%27][symbol]++;
    tick++;n++;
  }
  let pairs=0,matches=0;
  for(const row of cells){
    const count=row.reduce((a,b)=>a+b,0);
    pairs+=count*(count-1);
    matches+=row.reduce((a,b)=>a+b*(b-1),0);
  }
  return {n,pairs,matches,ioc:matches/pairs};
}

const rng={state:0x10a5e2d3};
const next=()=>{rng.state=(Math.imul(rng.state,1664525)+1013904223)>>>0;return rng.state};
function keys(){
  return Array.from({length:27},()=>{
    const p=Array.from({length:28},(_,i)=>i);
    for(let j=p.length-1;j>0;j--){const k=next()%(j+1);[p[j],p[k]]=[p[k],p[j]]}
    return p;
  });
}
const secret=keys();
assert.equal(secret.length,east.length);

/**
 * @param {number[]} plain
 * @param {'numeric'|'cyclic'} ordering
 * @param {boolean} skipRepeatClock
 * @returns {number[]}
 */
function encrypt(plain,ordering,skipRepeatClock){
  const cipher=[plain[0]];let tick=0;
  for(let i=1;i<plain.length;i++){
    const p=plain[i],prev=cipher[i-1];
    if(p===28){cipher.push(prev);if(!skipRepeatClock)tick++;continue}
    const rank=secret[tick%27][p];
    const out=ordering==='numeric'
      ? rank+(rank>=prev?1:0) : mod(prev+rank+1,29);
    assert.notEqual(out,prev);
    cipher.push(out);
    tick++;
  }
  return cipher;
}
function decrypt(cipher,ordering,skipRepeatClock){
  const plain=[cipher[0]];let tick=0;
  for(let i=1;i<cipher.length;i++){
    const prev=cipher[i-1],cur=cipher[i];
    if(prev===cur){plain.push(28);if(!skipRepeatClock)tick++;continue}
    const rank=ordering==='numeric'
      ?cur-(cur>prev?1:0):mod(cur-prev-1,29);
    const p=secret[tick%27].indexOf(rank);
    assert.ok(p>=0);
    plain.push(p);
    tick++;
  }
  return plain;
}

const rows=[];
const expectations={
  'p3-p7.numeric.full':[1138,46840,1598,1136,46672,2954],
  'p3-p7.numeric.skip':[1138,46830,1632,1136,46662,2964],
  'p3-p7.cyclic.full':[1138,46840,1650,1136,46672,2954],
  'p3-p7.cyclic.skip':[1138,46830,1740,1136,46662,2964],
  'p8-p14.numeric.full':[1719,107730,3774,1716,107356,6684],
  'p8-p14.numeric.skip':[1719,107730,3906,1716,107352,6778],
  'p8-p14.cyclic.full':[1719,107730,3986,1716,107356,6684],
  'p8-p14.cyclic.skip':[1719,107730,3640,1716,107352,6778]
};
for(const input of inputs)for(const ordering of ['numeric','cyclic']){
  for(const skipRepeatClock of [false,true]){
    const clock=skipRepeatClock?'skip':'full';
    const label=`${input.pages}.${ordering}.${clock}`;
    const actual=profile(input.source,'cipher',ordering,skipRepeatClock);
    const native=profile(input.plain,'native',ordering,skipRepeatClock);
    assert.deepEqual([actual.n,actual.pairs,actual.matches,
      native.n,native.pairs,native.matches],expectations[label]);
    const latinProfile=profile(input.latin,'native',ordering,skipRepeatClock);
    const latinExpected=input.pages==='p3-p7'
      ?(skipRepeatClock?[1143,47250,3518]:[1143,47250,3484])
      :(skipRepeatClock?[1725,108486,7922]:[1725,108486,7804]);
    assert.deepEqual([latinProfile.n,latinProfile.pairs,latinProfile.matches],
      latinExpected);
    const planted=encrypt(input.plain,ordering,skipRepeatClock);
    assert.equal(planted.length,input.plain.length);
    assert.deepEqual(decrypt(planted,ordering,skipRepeatClock),input.plain);
    const plantedStat=profile(planted,'cipher',ordering,skipRepeatClock);
    assert.deepEqual(plantedStat,native);
    const latinPlant=encrypt(input.latin,ordering,skipRepeatClock);
    assert.deepEqual(decrypt(latinPlant,ordering,skipRepeatClock),input.latin);
    assert.deepEqual(profile(latinPlant,'cipher',ordering,skipRepeatClock),
      latinProfile);
    assert.ok(actual.ioc<0.04 && native.ioc>0.062 && latinProfile.ioc>0.071);
    rows.push({label,original:actual,native,latin:latinProfile,
      independentUnknownAlphabetPlantRecovered:planted.length+latinPlant.length,
      exactSecretAlphabetCollisionInvariant:true});
  }
}
assert.equal(rows.length,8);
console.log(JSON.stringify({
  original:'LP2 intact p3-p14, 27 phase positions from p0-p2 map east edge',
  keyAllowance:'27 entirely arbitrary hidden bijections of 28 GP symbol indices',
  source:'2,979 authentic solved GP runes plus 204,802 independently encoded Latin Vulgate GP runes',
  rows,
  verdict:'No all-secret fixed-27-phase anti-repeat successor decoder to native solved-Cicada register',
  limitation:'Only native GP prose, 27 constant phase permutations, and two public clock definitions',
},null,2));
