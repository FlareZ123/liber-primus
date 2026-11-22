"use strict";

/**
 * Third original-LP2-block predictive test of the first-300-selected grid key.
 * Seven of eight original section bodies have at least 900 runes; section 0
 * is 716 runes and remains only in the 8-section FIRST-block model selection.
 * The 300 rune third block of seven sections is entirely untouched by the
 * first300 fit or the previously analyzed second300 score.
 *
 * Run: node sims/grid_two_skip_frozen_thirdblock.cjs
 * @module grid_two_skip_frozen_thirdblock
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {originalKeys,streamKey,originalBodies}=require("./grid_stream_collision_viterbi.cjs");
const {inverse,search}=require("./grid_two_collision_skips_inverse.cjs");
const INDEX=new Map([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"].map((c,i)=>[c,i]));
const read=name=>fs.readFileSync(path.resolve(__dirname,"..",name),"utf8");
const headings=[13,16,12,11,16,19,8,8];
const mod=x=>(x%29+29)%29;

/** Seven original untouched LP2 section-prefixes of 900 runes. */
function source900(){
  const raw=read("resources/transcriptions/liber_primus_master.txt");
  const pos=raw.indexOf("ᛋᚻᛖᚩᚷ");
  assert.ok(pos>=0);
  const sections=raw.slice(pos).split("%").slice(0,56).join("%")
    .split("$").map(s=>[...s].filter(c=>INDEX.has(c))).filter(s=>s.length);
  assert.deepEqual(sections.map(s=>s.length),
    [729,1145,1729,9,1894,1021,1524,1589,3316]);
  const merged=[sections[0],sections[1],sections[2],
    sections[4],sections[5],sections[6],sections[7],sections[8]];
  const result=merged.map((s,i)=>s.slice(headings[i],
    headings[i]+(i===0?600:900)).map(c=>INDEX.get(c)));
  assert.deepEqual(result.map(s=>s.length),[600,900,900,900,900,900,900,900]);
  assert.deepEqual(result.map(s=>s.slice(0,300)),originalBodies());
  return result;
}

/** A predictive conditional max-product score on only original runes 601–900. */
function frozenThird(keys,bodies,lm){
  const candidate=search(keys,bodies.map(b=>b.slice(0,300)),lm);
  const mode=Object.fromEntries(["algo","reverseKey","reducer","sign"]
    .map(k=>[k,candidate.best[k]]));
  const columns=candidate.best.columns;
  const perSection=[];
  for(let i=1;i<8;i++){
    const body=bodies[i],pad=streamKey(keys[columns[i]],mode,950);
    const six=inverse(body.slice(0,600),pad,mode.sign,lm);
    const nine=inverse(body,pad,mode.sign,lm);
    assert.ok(six.exactForwardRoundTrip&&nine.exactForwardRoundTrip);
    perSection.push({section:i,col:columns[i],
      conditionalThird:(nine.score-six.score)/300,
      first600Skips:six.skips,first900Skips:nine.skips,
      first900Doubles:nine.doubleSkips});
  }
  return {fittedFirst:{...mode,columns,trainingPerRune:candidate.best.perRune},
    thirdPerRune:perSection.reduce((s,x)=>s+x.conditionalThird,0)/7,
    sections:perSection};
}
function rnd(seed){let x=seed>>>0;return()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;
};}

/** Independent Shakespeare GP whole-book encryption, true grid keys. */
function plant(keys,lm){
  const gp=encode(read("resources/control/shakespeare_first300k.txt").slice(205000)),
    known={algo:"aes-256-ctr",reverseKey:false,reducer:"mod29",sign:1},
    columns=[6,2,4,0,1,7,5,3],random=rnd(0x38b3f003);
  let offset=0;
  const clear=Array.from({length:8},(_,i)=>{
    const s=gp.slice(offset,offset+(i===0?600:900));
    offset+=s.length;return s;
  });
  const cipher=clear.map((body,s)=>{
    const pad=streamKey(keys[columns[s]],known,950);
    let prev=-1,k=0;const out=[];
    for(const p of body){
      let c=mod(p+pad[k]);
      for(let a=0;a<2&&c===prev;a++){
        if(random()/4294967296>=.81)break;
        k++;c=mod(p+pad[k]);
      }
      out.push(c);prev=c;k++;
    }
    return out;
  });
  const test=frozenThird(keys,cipher,lm);
  const exact=clear.slice(1).reduce((sum,word,j)=>{
    const mode=known,stream=streamKey(keys[columns[j+1]],mode,950);
    const found=inverse(cipher[j+1],stream,1,lm);
    return sum+found.plaintext.filter((c,i)=>c===word[i]).length;
  },0);
  return {thirdScore:test.thirdPerRune,
    allModeAndColumnsRecovered:Object.keys(known).every(k=>test.fittedFirst[k]===known[k])&&
      columns.every((x,i)=>x===test.fittedFirst.columns[i]),
    correctRunes:exact,totalRunes:6300};
}

/** Source-original third-block test with complete first-block re-fit per null. */
function main(){
  const keys=originalKeys(),original=source900(),
    lm=train(read("resources/control/shakespeare_first300k.txt").slice(0,200000));
  const observed=frozenThird(keys,original,lm),control=plant(keys,lm);
  assert.ok(control.correctRunes>=5400);
  const random=rnd(0x38b3c001),N=Number(process.env.LP2_TWO_SKIP_THIRD_NULLS||100);
  assert.ok(Number.isSafeInteger(N)&&N>=1&&N<=1000);
  const nulls=[];
  for(let n=0;n<N;n++){
    const shuffled=keys.map(column=>{
      const c=Buffer.from(column);
      for(let j=c.length-1;j>0;j--){
        const k=random()%(j+1);[c[j],c[k]]=[c[k],c[j]];
      }
      return c;
    });
    nulls.push(frozenThird(shuffled,original,lm).thirdPerRune);
  }
  const above=nulls.filter(s=>s>=observed.thirdPerRune).length;
  nulls.sort((a,b)=>a-b);
  return {model:"first300 frozen source-grid two-skip Viterbi 7x third untouched original LP2 300-rune passages",
    trainRuneCount:2400,independentThirdRuneCount:2100,
    original:observed,sourceEnglishPositive:control,
    shuffledFullRefit:{n:N,above,pUpper:(above+1)/(N+1),
      min:nulls[0],median:nulls[Math.floor(N/2)],max:nulls[N-1]},
    status:"Post-selected original first-block key; plaintext recovery requires exact intelligible decoding"};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={source900,frozenThird,plant,main};
