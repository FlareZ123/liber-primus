'use strict';
/**
 * Blake's The [First] Book of Urizen, Wikisource revision 15804931:
 * PRELUDIUM and Chapter I through verse 6, original punctuation retained.
 * An independent thematic/historical candidate, NOT an author-specified key.
 * Node22 CJS, read-only, original-cipher test with native solved-Cicada plant.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,
  '../resources/liber-primus/lp2-corpus.json'),'utf8'));
const POEM="Of the primeval Priests assum'd power,\nWhen Eternals spurn'd back his religion;\nAnd gave him a place in the north,\nObscure, shadowy, void, solitary.\nEternals I hear your call gladly,\nDictate swift winged words, & fear not\nTo unfold your dark visions of torment.\n\nLo, a shadow of horror is risen\nIn Eternity! Unknown, unprolific!\nSelf-closd, all-repelling: what Demon\nHath form'd this abominable void\nThis soul-shudd'ring vacuum? Some said\n\"It is Urizen\", But unknown, abstracted\nBrooding secret, the dark power hid.\n\nTimes on times he divided, & measur'd\nSpace by space in his ninefold darkness\nUnseen, unknown! changes appeard\nIn his desolate mountains rifted furious\nBy the black winds of perturbation\n\nFor he strove in battles dire\nIn unseen conflictions with shapes\nBred from his forsaken wilderness,\nOf beast, bird, fish, serpent & element\nCombustion, blast, vapour and cloud.\n\nDark revolving in silent activity:\nUnseen in tormenting passions;\nAn activity unknown and horrible;\nA self-contemplating shadow,\nIn enormous labours occupied\n\nBut Eternals beheld his vast forests\nAge on ages he lay, clos'd, unknown\nBrooding shut in the deep; all avoid\nThe petrific abominable chaos\n\nHis cold horrors silent, dark Urizen\nPrepar'd: his ten thousands of thunders\nRang'd in gloom'd array stretch out across\nThe dread world, & the rolling of wheels\nAs of swelling seas, sound in his clouds\nIn his hills of stor'd snows, in his mountains\nOf hail & ice; voices of terror,\nAre heard, like thunders of autumn,\nWhen the cloud blazes over the harvests";

const tokens=gp.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} source @returns {number[]} */
function native(source) {
  const words=(source.toUpperCase().replace(/&/gu,' AND ')
    .replace(/QU/gu,'CW').replace(/V/gu,'U').replace(/[KQ]/gu,'C')
    .replace(/Z/gu,'S').match(/[A-Z]+/gu))||[];
  const o=[];
  for(const w of words) for(let p=0;p<w.length;) {
    if(w.startsWith('ING',p)){o.push(21);p+=3;continue;}
    if(w.startsWith('IO',p)){o.push(27);p+=2;continue;}
    const t=tokens.find(x=>w.startsWith(x.token,p));
    assert(t,'unknown GP token '+w);o.push(t.index);p+=t.token.length;
  }
  return o;
}
const key=native(POEM), chapterI=native(POEM.slice(0,POEM.indexOf('Lo, a shadow'))).length;
assert.equal(key.length,1179);assert.equal(chapterI,199);
/** @param {number} n @returns {number[]} */
const page=n=>gp.pages.find(p=>p.page===n).indices;
const cases=[
  ['opening p0-2',[...page(0),...page(1),...page(2)]],
  ['numbered-five complete',[
    ...page(36).slice(99,238),...page(37),...page(38).slice(0,186)]],
  ['separate chapter p40-41',[...page(40),...page(41)]],
  ['terminal p55',page(55)]
];
assert.deepEqual(cases.map(x=>x[1].length),[729,553,504,76]);
const mod=n=>(n%29+29)%29;
/** @param {number[]} seq @returns {number} */
function ioc(seq){const h=Array(29).fill(0);for(const i of seq)h[i]++;
  return h.reduce((s,x)=>s+x*(x-1),0)/(seq.length*(seq.length-1));}
/**
 * All legal plaintext-F transparency decisions, exact dynamic programming.
 * @param {number[]} cipher @param {number} sign @param {number} start
 * @returns {number|null}
 */
function firstImpossible(cipher,sign,start) {
  let states=new Set([start]);
  for(let i=0;i<cipher.length;i++) {
    const c=cipher[i],next=new Set();
    for(const k of states) {
      if(c===0)next.add(k);
      if(k<key.length && mod(c-sign*key[k])!==0)next.add(k+1);
    }
    if(next.size===0)return i;
    states=next;
  }
  return null;
}
/** @param {number[]} plain @param {number} sign @param {number} start */
function plant(plain,sign,start) {
  let k=start;return plain.map(p=>p===0?0:mod(p+sign*key[k++]));
}
const rows=[];
for(const [scope,cipher] of cases)
  for(const [startName,start] of [['prelude',0],['chapterI',chapterI]])
    for(const sign of [-1,1]) {
      const decoded=cipher.map((c,i)=>mod(c-sign*key[start+i]));
      assert.deepEqual(decoded.map((p,i)=>mod(p+sign*key[start+i])),cipher);
      assert.equal(firstImpossible(plant(page(57),sign,start),sign,start),null);
      rows.push({scope,startName,sign,length:cipher.length,
        ioc:Number(ioc(decoded).toFixed(8)),
        firstImpossibleF:firstImpossible(cipher,sign,start),
        preview:decoded.slice(0,55).map(i=>gp.translit[i]).join('')});
    }
// The transparency model has several *algebraically admissible* histories;
// report them exactly. An admissible path alone is not plaintext evidence.
console.log(JSON.stringify({
  status:'NO UNKNOWN PLAINTEXT; DIRECT SOURCE RUNNING KEY REJECTED',
  source:'1794 First Book of Urizen, Wikisource oldid=15804931, Prelude and I:1-6',
  keyRunes:key.length,chapterIStart:chapterI,
  solvedP57IoC:Number(ioc(page(57)).toFixed(8)), rows
},null,2));
