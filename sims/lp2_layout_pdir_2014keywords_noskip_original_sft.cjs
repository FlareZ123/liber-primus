/**
 * Literal 2014 keys with 2016 page/line position driven pointer directions.
 * The no-skip cyclic-key subset of the historical pdir wordwise key walker:
 * 2 backward-head conventions x 3 interword conventions; collision-comparator
 * choices collapse without a skip/coin branch. No fitting word text.
 *
 * Run on Windows 11: node sims/lp2_layout_pdir_2014keywords_noskip_original_sft.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const master=read('resources/transcriptions/liber_primus_master.txt').replace(/\r\n/g,'\n');
const RUNES='ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
/** @typedef {{pa:number,ps:number,ln:number,ls:number,po:number,rp:number,nr:number,nl:number}} Feature */
/** @typedef {{runes:number[],features:Feature[],start:number[]}} Window */
/** @type {Window[]} */
const segments=[];
let page=1,line=1,pos=0;
const src=master.substring(master.indexOf('\n\n')+2).split('§')[0];
for(const part of src.split('$')){
  let ps=1,ls=1,wordStart=-1;
  const runes=[],features=[],start=[];
  for(const ch of part){
    const k=RUNES.indexOf(ch);
    if(k>=0){
      pos++;
      if(wordStart<0)wordStart=runes.length;
      runes.push(k);
      features.push({pa:page,ps,ln:line,ls,po:pos,rp:0,nr:0,nl:0});
      start.push(wordStart);
    } else if(ch==='%'){
      page++;ps++;line=1;pos=0;
    } else if(ch==='/'){
      line++;ls++;pos=0;
    } else if(ch==='-'||ch==='.'||ch==='&'){
      wordStart=-1;
    }
  }
  if(runes.length)segments.push({runes,features,start});
}
assert.equal(segments.length,18);
assert.deepEqual(segments.slice(7,16).map(s=>s.runes.length),
  [729,1145,1729,9,1894,1021,1524,1589,3316]);
assert.deepEqual(segments.slice(7,16).flatMap(s=>s.runes),
  corpus.pages.slice(0,56).flatMap(p=>p.indices));
const nPage=new Map(),lPage=new Map(),seen=new Map();
for(const seg of segments)for(const f of seg.features){
  nPage.set(f.pa,(nPage.get(f.pa)||0)+1);
  lPage.set(f.pa,Math.max(lPage.get(f.pa)||0,f.ln));
}
for(const seg of segments)for(const f of seg.features){
  f.rp=(seen.get(f.pa)||0)+1;
  seen.set(f.pa,f.rp);
  f.nr=nPage.get(f.pa);
  f.nl=lPage.get(f.pa);
}
const par=x=>x%2===0?1:-1, mod3=(x,j)=>(x+j)%3<=1?1:-1;
/** @type {Record<string,(f:Feature)=>number>} */
const rules={
  Pa_par:f=>par(f.pa),
  Ps_par:f=>par(f.ps),
  Ln_par:f=>par(f.ln),
  Ls_par:f=>par(f.ls),
  Po_par:f=>par(f.po),
  PL_xor:f=>par(f.pa+f.ln),
  Pg_half_runes:f=>2*f.rp<=f.nr?1:-1,
  Pg_half_lines:f=>2*f.ln<=f.nl?1:-1
};
for(const [name,key] of Object.entries({Pa:'pa',Ps:'ps',Ln:'ln',Ls:'ls',Po:'po'})){
  for(let j=0;j<3;j++)rules[name+'_m3_'+j]=f=>mod3(f[key],j);
}
assert.equal(Object.keys(rules).length,23);
/** @type {Record<string,number[]>} */
const keys={
  DIVINITY:[23,10,1,10,9,10,16,26],
  FIRFUMFERENFE:[0,10,4,0,1,19,0,18,4,18,9,0,18]
};
const windows=segments.slice(7,16).filter(s=>s.runes.length>=100);
const mod=(x,q)=>(x%q+q)%q;
const q29=x=>mod(x,29);
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const count=new Uint16Array(29);
  for(const symbol of symbols)count[symbol]++;
  let equal=0;
  for(const n of count)equal+=n*(n-1);
  return equal/(symbols.length*(symbols.length-1));
}
/**
 * Key pointer reads at j, then advances by direction for each rune.
 * At the beginning of each word, convention m changes pointer by
 * zero, previous word's direction, or new word's direction.
 * A negative new direction with h=1 pre-steps backward once.
 * We wrap the key because a finite literal keyword is a periodic stream.
 * The large positive initial j makes all physical pointer states valid.
 *
 * @param {number[]} ciphertext
 * @param {number[]} firstRuneWord
 * @param {number[]} wordDirections
 * @param {number[]} key
 * @param {number} phase
 * @param {number} additiveSign
 * @param {number} directionFlip
 * @param {number} h
 * @param {number} m
 * @returns {number[]}
 */
function decode(ciphertext,firstRuneWord,wordDirections,key,phase,additiveSign,directionFlip,h,m){
  const out=new Array(ciphertext.length);
  let pointer=key.length*100000+phase,old=0;
  for(let i=0;i<ciphertext.length;i++){
    const d=wordDirections[firstRuneWord[i]]*directionFlip;
    if(i===firstRuneWord[i]){
      if(i!==0)pointer+=m===1?old:m===2?d:0;
      if(d<0&&h===1)pointer-=1;
    }
    assert(pointer>=0);
    out[i]=q29(ciphertext[i]-additiveSign*key[pointer%key.length]);
    pointer+=d;
    old=d;
  }
  return out;
}
// Independent source-native positive plant from solved p57 clear runes.
const clear=corpus.pages[57].indices;
assert.equal(clear.length,95);
const plain=Array.from({length:380},(_,i)=>clear[i%clear.length]);
const fixture=windows[0];
for(const [h,m,flip] of [[0,0,1],[1,1,-1],[0,2,-1]]){
  const first=fixture.start.slice(0,plain.length);
  const wordDirs=fixture.features.map(rules.Ln_par);
  const zero=Array(plain.length).fill(0);
  const stream=decode(zero,first,wordDirs,keys.DIVINITY,2,1,flip,h,m).map(x=>q29(-x));
  const cipher=plain.map((p,i)=>q29(p+stream[i]));
  assert.deepEqual(decode(cipher,first,wordDirs,keys.DIVINITY,2,1,flip,h,m),plain);
}
assert(ioc(plain)>0.06);
console.log('PASS exact 12,956 original unknown rune indices; 23 original layout rules');
console.log('PASS 3 independent source-native pdir word-direction plaintext plants');
let cells=0,allMax=0;
for(const [keyName,key] of Object.entries(keys)){
  for(let wi=0;wi<windows.length;wi++){
    const w=windows[wi];
    let best={ioc:0,rule:'',h:0,m:0,flip:1,sign:1,phase:0};
    for(const [ruleName,fn] of Object.entries(rules)){
      const dirs=w.features.map(fn);
      for(let h=0;h<2;h++)for(let m=0;m<3;m++)
        for(const flip of [-1,1])for(const sign of [-1,1])
          for(let phase=0;phase<key.length;phase++){
            const decoded=decode(w.runes,w.start,dirs,key,phase,sign,flip,h,m);
            const score=ioc(decoded);
            cells++;
            if(score>best.ioc)best={ioc:score,rule:ruleName,h,m,flip,sign,phase};
          }
    }
    assert(best.ioc<0.040,'clear native GP-English concentration would be detected');
    allMax=Math.max(allMax,best.ioc);
    console.log(JSON.stringify({key:keyName,window:wi,n:w.runes.length,raw_ioc:ioc(w.runes),best}));
  }
}
assert.equal(cells,windows.length*Object.values(keys).reduce((s,k)=>s+k.length,0)*23*2*3*2*2);
console.log(JSON.stringify({cells,worstIoc:allMax,decision:'No actual native GP29 prose. Excludes only 2014 literal keyword cyclic-no-skip 2016 word-layout pointer family under six pointer conventions.'}));
