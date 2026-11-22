'use strict';

/**
 * Original LP2 p54->55 exact complete-word SHED + historical DIVINITY.
 * The 11-rune word crosses the source page seam and gives 52 cores,
 * 34 exteriors in the original 86 GP29 source symbols.
 *
 * The recovered LP1 p03/p04 Vigenere has keyword DIUINITY in the native
 * 29-symbol register, with transparent plaintext F (GP index zero).
 * Exactly invert every legal F branch; a ciphertext F can still have
 * arisen from a shifted non-F. No plaintext scorer, phase-fitting or
 * per-word cipher fitting is used. Windows Node.js 22, CommonJS.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const gp=JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const raw=fs.readFileSync(
  path.join(__dirname,'..','resources','liber-primus','lp2-transcription.txt'),'utf8')
  .replace(/\r\n/g,'\n');
const page=(n)=>gp.pages.find(p=>p.page===n).indices;
const key=[23,10,1,10,9,10,16,26];
assert.equal(key.map(i=>gp.translit[i]).join(''),'DIUINITY');
const tail=page(54).slice(-10);
const p55=page(55);
const lens=[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const source86=tail.concat(p55);
assert.deepEqual(tail.map(x=>gp.translit[x]),
  ['G','O','T','TH','X','E','EA','R','G','Y']);
assert.equal(p55[0],gp.translit.indexOf('NG'));
assert.equal(source86.length,86);
assert.equal(lens.reduce((a,b)=>a+b,0),86);
assert(raw.includes('ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ/\n%\nᛝ-'));
/** @param {number[]} data @param {number[]} lengths @returns {number[][]} */
function split(data,lengths){
  let offset=0;
  const words=lengths.map(length=>{
    const w=data.slice(offset,offset+length);
    assert.equal(w.length,length);
    offset+=length;
    return w;
  });
  assert.equal(offset,data.length);
  return words;
}
const words=split(source86,lens);
const core=words.flatMap(w=>w.slice(1,-1));
const shell=words.flatMap(w=>w.length===1?w:[w[0],w[w.length-1]]);
assert.equal(core.length,52);
assert.equal(shell.length,34);
assert.deepEqual(core.slice(0,9),tail.slice(1));
assert.deepEqual(shell.slice(0,2),[tail[0],p55[0]]);
const flatten=(w)=>w.flat();
/** @typedef {{name:string, reset:boolean, fullClock:boolean}} Policy */
const policies=[
  {name:'continuous-core',reset:false,fullClock:false},
  {name:'continuous-full86',reset:false,fullClock:true},
  {name:'perword-core',reset:true,fullClock:false},
  {name:'perword-fullword',reset:true,fullClock:true},
];
const mod=(n)=>(n%29+29)%29;
/**
 * Historical forward cipher on original source words.
 * Shell symbol values pass unchanged; fullClock counts shell positions.
 * @param {number[][]} plain @param {Policy} policy @param {number} seed
 * @returns {{cipher:number[][], finalPhase:number}}
 */
function encrypt(plain,policy,seed=0){
  let phase=seed;
  const cipher=[];
  for(const w of plain){
    if(policy.reset)phase=seed;
    const out=[];
    for(let j=0;j<w.length;j++){
      const p=w[j],interior=j>0&&j<w.length-1;
      if(interior){
        if(p===0)out.push(0);
        else {
          out.push(mod(p+key[phase]));
          phase=(phase+1)%key.length;
        }
      }else{
        out.push(p);
        if(policy.fullClock&&p!==0)phase=(phase+1)%key.length;
      }
    }
    cipher.push(out);
  }
  return {cipher,finalPhase:phase};
}

/**
 * Exhaustive *reachable key phases*, not brute forcing plaintext.
 * A zero ciphertext may be a literal F or an encrypted non-F; both
 * valid branches survive. Nonzero ciphertext may never decrypt to F.
 * @param {number[][]} cipher @param {Policy} policy @param {number} seed
 */
function inverse(cipher,policy,seed=0){
  /** @type {Map<number,number[][]>} */
  let states=new Map([[seed,[]]]);
  let coreOffset=0,absoluteOffset=0;
  for(let wi=0;wi<cipher.length;wi++){
    const w=cipher[wi];
    if(policy.reset){
      const representative=states.values().next().value??[];
      states=new Map([[seed,representative]]);
    }
    /** @type {Map<number,number[][]>} */
    const nextWord=new Map();
    for(const [ph,prefix] of states)nextWord.set(ph,[...prefix,[]]);
    states=nextWord;
    for(let j=0;j<w.length;j++,absoluteOffset++){
      const c=w[j],inner=j>0&&j<w.length-1;
      /** @type {Map<number,number[][]>} */
      const successors=new Map();
      for(const [phase,done] of states){
        const append=(p,nextPhase)=>{
          if(!successors.has(nextPhase)){
            const wordsNew=done.slice(0,-1);
            wordsNew.push([...done[done.length-1],p]);
            successors.set(nextPhase,wordsNew);
          }
        };
        if(!inner){
          append(c,(phase+(policy.fullClock&&c!==0?1:0))%8);
        }else{
          const decoded=mod(c-key[phase]);
          if(c===0)append(0,phase);
          if(decoded!==0)append(decoded,(phase+1)%8);
        }
      }
      states=successors;
      if(inner)coreOffset++;
      if(states.size===0)return {survivors:0,failedAt:{word:wi,wordOffset:j,coreOffset:inner?coreOffset-1:coreOffset,absoluteOffset,cipherRune:gp.translit[c]}};
    }
  }
  return {survivors:states.size,
    possiblePhases:[...states.keys()],
    specimen:[...states.values()][0],
    originalCoreCount:coreOffset};
}
const p57Raw=raw.slice(raw.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.'));
const p57Words=p57Raw.replace(/\/\r?\n/g,'').replace(/[\r\n§]/g,'')
  .trim().split(/[.\-]/).filter(Boolean)
  .map(s=>[...s].map(r=>gp.runes.indexOf(r)));
assert.equal(p57Words.length,20);
assert.deepEqual(flatten(p57Words),page(57));
assert.equal(page(57).length,95);
for(const policy of policies){
  const positive=encrypt(p57Words,policy,0);
  const inv=inverse(positive.cipher,policy,0);
  assert(inv.survivors>0,policy.name+' must decode true original solved-GP plant');
  assert.equal(positive.cipher.length,20);
  assert.equal(flatten(positive.cipher).length,95);
  // Independent source-shaped plant: actual solved p57 GP runes are
  // fitted to the 86 unchanged positions, not used to pick a key.
  const plant=split(page(57).slice(0,86),lens);
  const ep=encrypt(plant,policy,0);
  const ip=inverse(ep.cipher,policy,0);
  assert(ip.survivors>0,policy.name+' must decode 86-rune native plant');
}
const outcomes=[];
for(const policy of policies){
  for(let phase=0;phase<8;phase++){
    const decoded=inverse(words,policy,phase);
    if(decoded.survivors){
      assert.deepEqual(encrypt(decoded.specimen,policy,phase).cipher,words);
      const peeled=decoded.specimen.flatMap(w=>w.slice(1,-1));
      outcomes.push({policy:policy.name,phase,legal:true,
        survivors:decoded.survivors,possiblePhases:decoded.possiblePhases,
        inner52:peeled.map(i=>gp.translit[i]).join('-'),
        innerWordBreaks:decoded.specimen.map(w=>w.slice(1,-1)
          .map(i=>gp.translit[i]).join('')).join(' / ')});
    }else outcomes.push({policy:policy.name,phase,legal:false,
      failure:decoded.failedAt});
  }
}
// Unrelated untouched original p16 control, retaining its own actual
// printed word lengths and delimiters. Page16 is well away from the
// terminal p54->55 handoff and does not supply any key parameters.
const p16raw=raw.split('%')[16];
const p16words=[];
let p16current=[];
for(const ch of p16raw){
  const i=gp.runes.indexOf(ch);
  if(i>=0)p16current.push(i);
  else if(ch!=='/'&&!/\s/u.test(ch)){
    if(p16current.length)p16words.push(p16current);
    p16current=[];
  }
}
if(p16current.length)p16words.push(p16current);
assert.deepEqual(p16words.flat(),page(16));
const independentP16=p16words.slice(0,17);
assert.equal(independentP16.flat().length,78);
assert.equal(independentP16.reduce((n,w)=>n+Math.max(0,w.length-2),0),45);
const unrelated=policies.map(policy=>{
  const result=inverse(independentP16,policy,0);
  return {policy:policy.name,source:'p16 first 17 complete word fragments',
    originalRunes:78,innerRunes:45,legal:result.survivors>0,
    firstFailure:result.failedAt??null,
    innerReadout:result.survivors?
      result.specimen.flatMap(w=>w.slice(1,-1)).map(i=>gp.translit[i]).join('-'):null};
});
const summary={
  keyTransliteration:'DIUINITY',key,source:'71.jpg->72.jpg',
  sourceRunes:86,sourceWords:17,firstCrossingWordLength:11,
  literalCores:52,literalExteriors:34,
  originalFCount:source86.filter(x=>x===0).length,
  positive:'PASS authentic 95-rune solved p57 and source-shaped 86-rune native controls for all four fixed clocks',
  outcomes,unrelated
};
console.log(JSON.stringify(summary,null,2));
console.log('END GP29 authentic LP1 keyword on p54->55 literal complete-word interiors');
