'use strict';

/**
 * Key periods deduced from the exact repeated six-rune phrase at LP2
 * page27 offset28 and page54 offset70. The phrase is excluded from all
 * scored material. Each trial counts *cross-group* same-key-phase matches
 * to distinguish a shared repeating key from a coincidental phrase.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const ALPH = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const IDX = new Map(ALPH.map((x, i) => [x, i]));
const SECLEN = [729,1145,1738,1894,1021,1433,1680,3316];
const TRIALS = Number(process.env.NULL_TRIALS || 300);
const SEED = 0x33015427;

/** @param {number} seed @returns {()=>number} */
function randomSource(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/** @returns {{page:number[][],section:number[][]}} */
function load() {
  const raw = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'),'utf8');
  const runes = s => [...s].filter(c => IDX.has(c)).map(c => IDX.get(c));
  const page = raw.split('%').slice(0,55).map(runes);
  const section = raw.split('%').slice(0,55).join('%').split('$')
    .map(runes).filter(x => x.length);
  assert.equal(page.length,55);
  assert.deepEqual(section.map(s => s.length),SECLEN);
  assert.equal(page.flat().length,12956);
  const first = page[27].slice(28,34);
  const last = page[54].slice(70,76);
  assert.deepEqual(first,last);
  assert.equal(first.map(x => ALPH[x]).join(''),'ᛞᛄᚢᛒᛖᛁ');
  assert.deepEqual(section[5].slice(28,34),first);
  assert.deepEqual(section[7].slice(3310,3316),last);
  return {page,section};
}

/**
 * @param {number[]} values
 * @returns {number[]}
 */
function inverseRank(values) {
  return values.map((v,i) => i === 0 || v === values[i-1]
    ? -1 : v - Number(v > values[i-1]));
}

/**
 * Remove both six-rune evidence windows from every comparison. The observed
 * phrase cannot itself contribute an anomalously favorable matched pair.
 * @param {number[][]} groups
 * @param {"page"|"section"|"global"} mode
 * @returns {number[][]}
 */
function maskPhrase(groups, mode) {
  return groups.map((group,index) => {
    const copy = group.slice();
    const first = mode === 'page' ? 27 : 5;
    const second = mode === 'page' ? 54 : 7;
    const firstOffset = 28;
    const secondOffset = mode === 'page' ? 70 : 3310;
    if (index === first) copy.fill(-1,firstOffset,firstOffset+6);
    if (index === second) copy.fill(-1,secondOffset,secondOffset+6);
    return copy;
  });
}

/**
 * The exact number of equal-symbol pairs at corresponding key phases, with
 * both members drawn from *different* physical pages or logical sections.
 * This cross-group design permits long periods beyond individual page length.
 * @param {number[][]} groups
 * @param {number} p
 * @param {number} alphabetSize
 * @param {boolean} continuous Key phase follows global manuscript offset
 */
function collision(groups,p,alphabetSize,continuous) {
  const phaseCounts = new Int32Array(p);
  const symbolCounts = new Int32Array(p * alphabetSize);
  let matches=0,pairs=0,base=0;
  for (const group of groups) {
    const pending=[];
    for (let i=0;i<group.length;i++) {
      const v=group[i];
      if (v<0) continue;
      const phase=(base+i)%p;
      pairs += phaseCounts[phase];
      matches += symbolCounts[phase*alphabetSize + v];
      pending.push(phase*alphabetSize + v);
    }
    for (const slot of pending) {
      phaseCounts[Math.floor(slot/alphabetSize)]++;
      symbolCounts[slot]++;
    }
    if (continuous) base+=group.length;
  }
  const baseline=1/alphabetSize;
  const naiveZ=(matches-pairs*baseline) /
    Math.sqrt(pairs*baseline*(1-baseline));
  return {pairs,matches,rate:matches/pairs,expectedRate:baseline,naiveZ};
}

/**
 * Each section/page is circularly rotated independently, preserving its
 * entire observed symbol inventory and local adjacency structures.
 * @param {number[][]} groups
 * @param {()=>number} rand
 */
function rotate(groups,rand) {
  return groups.map(g => {
    const offset=1+Math.floor(rand()*(g.length-1));
    return g.slice(offset).concat(g.slice(0,offset));
  });
}

/** @param {string} source @param {string[]} spelling @returns {number[]} */
function encodeEnglish(source,spelling) {
  const tokens = spelling.map((s,i)=>[s,i])
    .sort((a,b)=>b[0].length-a[0].length);
  const out=[];
  for (let word of (source.toUpperCase().match(/[A-Z]+/g)||[])) {
    word=word.replaceAll('QU','CW').replaceAll('V','U')
      .replaceAll('K','C').replaceAll('Z','S').replaceAll('ING','NG');
    for (let i=0;i<word.length;) {
      const token=tokens.find(([s])=>word.startsWith(s,i));
      assert.ok(token,word.slice(i));
      out.push(token[1]);
      i+=token[0].length;
    }
  }
  return out;
}

/**
 * Produce an independent planted key for the same page/section length array.
 * @param {number[][]} template
 * @param {number[]} english
 * @param {number} period
 * @param {number} alphabetSize
 * @param {boolean} continuous
 * @param {()=>number} rand
 * @param {boolean} rankCode
 */
function plant(template,english,period,alphabetSize,continuous,rand,rankCode) {
  const key=Array.from({length:period},()=>Math.floor(rand()*alphabetSize));
  let offset=0,base=0;
  return template.map(t=>{
    const out=[];
    for(let i=0;i<t.length;i++){
      const plain=english[offset+i];
      const q=(plain+key[(base+i)%period])%alphabetSize;
      if(rankCode) {
        if(i===0) out.push(Math.floor(rand()*29));
        else out.push(rand()<86/12901 ? out[i-1] : q+Number(q>=out[i-1]));
      } else {
        let c=q;
        if(i>0 && c===out[i-1] && rand()<0.81)
          c=(c+1+Math.floor(rand()*28))%29;
        out.push(c);
      }
    }
    offset+=t.length;
    if(continuous)base+=t.length;
    return out;
  });
}

/** @returns {object} */
function run() {
  const {page,section}=load();
  const kinds=[
    {mode:'page',p:42,groups:page,continuous:false},
    ...[547,1094,1641,3282].map(p=>({mode:'section',p,groups:section,continuous:false})),
    ...[5,1279,6395].map(p=>({mode:'global',p,groups:section,continuous:true}))
  ];
  const presentations = kinds.flatMap(k => ['raw','rank'].map(alphabet=>{
    const prepared=k.groups.map(group=>alphabet==='rank'?inverseRank(group):group);
    return {...k,alphabet,prepared:maskPhrase(prepared,k.mode),
      symbols:alphabet==='rank'?28:29};
  }));
  const observed=presentations.map(t=>collision(
    t.prepared,t.p,t.symbols,t.continuous));
  // Positive source: independent Shakespeare GP corpus, not copied LP2.
  const c=JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const english=encodeEnglish(fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'),c.translit);
  const controlSource=english.slice(30000);
  const rankEnglish=controlSource.filter(v=>v<28);
  assert.ok(controlSource.length>12956 && rankEnglish.length>12956);
  const examples=[
    {mode:'page',p:42,groups:page,continuous:false},
    {mode:'section',p:547,groups:section,continuous:false},
    {mode:'global',p:1279,groups:section,continuous:true},
    {mode:'global',p:6395,groups:section,continuous:true}
  ];
  const positives=[];
  for (const spec of examples) for (const family of ['raw','rank']) {
    const rank=family==='rank',s=rank?28:29;
    const text=(rank?rankEnglish:controlSource).slice(0,12956);
    const planted=plant(spec.groups,text,spec.p,s,spec.continuous,
      randomSource(SEED^spec.p^(rank?0xffd:0)),rank);
    const inverse=rank?planted.map(inverseRank):planted;
    const filtered=maskPhrase(inverse,spec.mode);
    const score=collision(filtered,spec.p,s,spec.continuous);
    assert.ok(score.naiveZ>4, 'Weak planted-period detector: '+spec.mode+' '+spec.p+' '+family);
    positives.push({mode:spec.mode,period:spec.p,family,z:score.naiveZ,rate:score.rate});
  }
  const rand=randomSource(SEED^0xaabbddee);
  const nullMaxima=[],testNull=observed.map(()=>[]);
  for(let sample=0;sample<TRIALS;sample++) {
    const rotatedByMode=new Map();
    for (const mode of ['page','section','global']) {
      const src=mode==='page'?page:section;
      const offsets=src.map(g=>1+Math.floor(rand()*(g.length-1)));
      rotatedByMode.set(mode,offsets);
    }
    let maxZ=-Infinity;
    for (let j=0;j<presentations.length;j++) {
      const x=presentations[j];
      const offsets=rotatedByMode.get(x.mode);
      const rotated=x.prepared.map((group,i)=>{
        const at=offsets[i];
        return group.slice(at).concat(group.slice(0,at));
      });
      const result=collision(rotated,x.p,x.symbols,x.continuous).naiveZ;
      testNull[j].push(result);
      if(result>maxZ)maxZ=result;
    }
    nullMaxima.push(maxZ);
  }
  const actualMax=Math.max(...observed.map(x=>x.naiveZ));
  const summary=presentations.map((x,i)=>({
    mode:x.mode,period:x.p,alphabet:x.alphabet,...observed[i],
    matchedNullUpperP:(testNull[i].filter(v=>v>=observed[i].naiveZ).length+1)/(TRIALS+1)
  }));
  const out={
    observedPhrase:'ᛞᛄᚢ-ᛒᛖᛁ',
    phraseLocations:{physicalPages:[27,54],pageOffsets:[28,70],
      logicalSections:[5,7],sectionOffsets:[28,3310],
      absoluteRuneOffsets:[6555,12950]},
    impliedDisplacements:{pageReset:42,sectionReset:3282,global:6395},
    scan:'Cross-group equal-rune phase pairs; original phrase excluded from both streams',
    sourceTotals:{runes:12956,pages:55,sections:8},
    controls:positives,
    actual:summary,
    null:{trials:TRIALS,seed:SEED^0xaabbddee,correctedUpperP:
      (nullMaxima.filter(z=>z>=actualMax).length+1)/(TRIALS+1),
      observedMaximumNaiveZ:actualMax,
      matchedNullMeanMax:nullMaxima.reduce((a,b)=>a+b,0)/TRIALS,
      matchedNullLargestMax:Math.max(...nullMaxima)},
    status:'No supported repeated key, new LP2 plaintext, or destination'
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}

if (require.main===module)run();
module.exports={load,inverseRank,collision,maskPhrase,run};
