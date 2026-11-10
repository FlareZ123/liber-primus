"use strict";
/**
 * Original-LP2 key test for the hypothesized T-overwrite ciphertext generator.
 * Eight page-49/50/51 base-60 grid columns are candidate AES-CTR / ChaCha20
 * stream keys. An exact 8! assignment chooses columns for eight text groups.
 *
 * Uses exact marginal likelihood of the keyed T-rewrite word transducer,
 * a source-independent lexical/trigram model trained on Shakespeare [0,200k),
 * and a split original-ciphertext fit/test over whole words. All complete
 * LP2 word boundaries and eight section totals are fixed and asserted.
 * No original plaintext/key is presumed and no figure is a decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {inputs, cipherBytes, assign} = require("./grid_section_column_keys.cjs");
const {words,category} = require("./outer_permutation_word_context.cjs");
const {train, inverseCandidates, ngramProbability, decodeWord, plant} =
  require("./lag6_repair_contextual_inverse.cjs");
const {encipher} = require("./lag6_repair_keyed_inverse.cjs");

const M=29, BOS=29, MIX=0.95, Q=0.81;
const ROOT=path.join(__dirname,"..");
const RUNES=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const INDEX=new Map(RUNES.map((v,i)=>[v,i]));
const LETTERS=["F","U","TH","O","R","C","G","W","H","N","I","J","EO",
  "P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];

/** @param {number} seed */
function rng(seed) {
  let x=seed>>>0;
  return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}

/**
 * Load true unsolved entire words and group by 8 source-defined sections.
 * @returns {{groups:number[][][], columns:number[][], wordLengths:number[]}}
 */
function source() {
  const parsed=parseSharedCorpus();
  assert.equal(parsed.words.length,2896);
  assert.equal(parsed.runeCount,12956);
  const {groups:sectionRunes,columnKeys:columns}=inputs();
  assert.equal(sectionRunes.length,8);
  const numericalWords=parsed.words.map(w=>[...w.runes].map(c=>{
    const i=INDEX.get(c);assert.notEqual(i,undefined);return i;
  }));
  const groups=[];
  let wi=0;
  for(const section of sectionRunes){
    const sectionWords=[];
    let sum=0;
    while(sum<section.length){
      assert(wi<numericalWords.length);
      const w=numericalWords[wi++];
      sum+=w.length;
      sectionWords.push(w);
    }
    assert.equal(sum,section.length,"A section boundary bisects a canonical word");
    assert.deepEqual(sectionWords.flat(),section);
    groups.push(sectionWords);
  }
  assert.equal(wi,numericalWords.length);
  assert.deepEqual(groups.map(g=>g.flat().length),
    [729,1145,1729,1903,1021,1524,1589,3316]);
  return {groups,columns,wordLengths:numericalWords.map(w=>w.length)};
}

/**
 * Exact sum over two-state trigram emissions plus all matching trie words.
 * Unlike MAP decoding this is a normalized marginal ciphertext likelihood.
 * @param {{candidate:number,logEmission:number}[][]} options
 * @param {ReturnType<typeof train>} model
 */
function wordEvidence(options,model) {
  const n=options.length;
  let states=new Map([[BOS*(M+1)+BOS,1]]);
  for(let j=0;j<n;j++){
    const next=new Map();
    const cls=category(n,j);
    for(const [state,mass] of states){
      const a=Math.floor(state/(M+1)),b=state%(M+1);
      for(const option of options[j]){
        const c=option.candidate, key=b*(M+1)+c;
        const v=mass*Math.exp(option.logEmission)*
          ngramProbability(model,a,b,c,cls);
        next.set(key,(next.get(key)||0)+v);
      }
    }
    states=next;
  }
  let gram=0;
  for(const mass of states.values())gram+=mass;
  const bucket=model.lengths.get(n);
  let lexical=0;
  if(bucket){
    /** @param {{next:Map<number,any>,count:number}} node
     * @param {number} j @param {number} mass */
    function traverse(node,j,mass){
      if(j===n){
        lexical+=mass*node.count/bucket.total;
        return;
      }
      for(const option of options[j]){
        const next=node.next.get(option.candidate);
        if(next)traverse(next,j+1,mass*Math.exp(option.logEmission));
      }
    }
    traverse(bucket.root,0,1);
  }
  const evidence=(1-MIX)*gram+MIX*lexical;
  assert.ok(evidence>0&&Number.isFinite(evidence));
  return Math.log(evidence);
}

/** @param {number[][][]} groups */
function spans(groups) {
  return groups.map(w=>{
    const cut=Math.max(1,Math.floor(w.length*0.55));
    return {train:cut,total:w.length};
  });
}

/** @param {number[][][]} groups @param {number} groupIndex */
function predecessor(groups,groupIndex){
  if(groupIndex===0)return -1;
  return groups[groupIndex-1].at(-1).at(-1);
}

/** @param {number[][][]} groups @param {number[][]} padByGroup @param {ReturnType<typeof train>} lm */
function scorePaired(groups,padByGroup,lm,initialPrevious=-1) {
  const byGroup=[];
  for(let s=0;s<groups.length;s++){
    const options=inverseCandidates(groups[s],padByGroup[s],
      s===0?initialPrevious:predecessor(groups,s));
    const cut=spans(groups)[s].train;
    let trainScore=0,testScore=0,trainRunes=0,testRunes=0;
    for(let i=0;i<options.length;i++){
      const ll=wordEvidence(options[i],lm);
      if(i<cut){trainScore+=ll;trainRunes+=groups[s][i].length;}
      else{testScore+=ll;testRunes+=groups[s][i].length;}
    }
    byGroup.push({trainScore,testScore,trainRunes,testRunes,options});
  }
  return byGroup;
}

/** @param {number[][]} columns @param {number[]} groupLengths */
function streams(columns, groupLengths) {
  const max=Math.max(...groupLengths);
  const result={};
  for(const alg of ["aes-256-ctr","chacha20"])
    for(const reverse of [false,true]){
      const tag=alg+":"+String(reverse);
      result[tag]=columns.map(col=>cipherBytes(reverse?col.slice().reverse():col,alg,max));
    }
  return result;
}

/** @param {Buffer} stream @param {number} len @param {boolean} scaled @param {number} sign */
function pad(stream,len,scaled,sign) {
  return Array.from({length:len},(_,i)=>{
    const n=scaled?Math.floor(29*stream[i]/256):stream[i]%29;
    return (n*sign+M)%M;
  });
}

/**
 * Run all 16 named mode families and exact 8! key column assignments;
 * freeze winning fit and evaluate held-out original word intervals.
 * @param {number[][][]} cipherGroups
 * @param {number[][]} cols
 * @param {ReturnType<typeof train>} lm
 */
function screen(cipherGroups,cols,lm) {
  const sizes=cipherGroups.map(g=>g.flat().length);
  const stream=streams(cols,sizes);
  const settings=[],byMode=[];
  for(const alg of ["aes-256-ctr","chacha20"])
    for(const reverse of [false,true])
      for(const scaled of [false,true])
        for(const sign of [-1,1]){
          const mode={alg,reverse,scaled,sign};
          const keyed=stream[alg+":"+String(reverse)];
          const matrix=Array.from({length:8},()=>Array(8));
          for(let s=0;s<8;s++){
            for(let col=0;col<8;col++){
              const p=pad(keyed[col],sizes[s],scaled,sign);
              const res=scorePaired([cipherGroups[s]],[p],lm,
                predecessor(cipherGroups,s));
              matrix[s][col]={train:res[0].trainScore,test:res[0].testScore,
                trainRunes:res[0].trainRunes,testRunes:res[0].testRunes};
            }
          }
          const optimum=assign(matrix.map(r=>r.map(x=>x.train)));
          const heldout=optimum.assignment.reduce((v,col,s)=>v+matrix[s][col].test,0);
          const trainRunes=matrix.map(r=>r[0].trainRunes).reduce((a,b)=>a+b);
          const testRunes=matrix.map(r=>r[0].testRunes).reduce((a,b)=>a+b);
          byMode.push({...mode,modeTag:alg+":"+(reverse?"rev":"fwd")+
            ":"+(scaled?"scale":"mod")+":sign"+sign,
            train:optimum.sum,heldout,trainRunes,testRunes,assignment:optimum.assignment});
          settings.push(mode);
        }
  byMode.sort((a,b)=>b.train-a.train);
  return {winner:byMode[0],ranked:byMode};
}

/**
 * Faster single-section exact stream scoring with proper previous published
 * output rune, used for final plaintext previews and score audit.
 * @param {number[][][]} cipherGroups @param {number[][]} cols
 * @param {ReturnType<typeof train>} lm @param {ReturnType<typeof screen>["winner"]} winner
 */
function preview(cipherGroups,cols,lm,winner) {
  const sizes=cipherGroups.map(g=>g.flat().length);
  const data=streams(cols,sizes)[winner.alg+":"+String(winner.reverse)];
  const output=[];
  for(let s=0;s<8;s++){
    const key=pad(data[winner.assignment[s]],sizes[s],winner.scaled,winner.sign);
    const opt=inverseCandidates(cipherGroups[s],key,predecessor(cipherGroups,s));
    const dec=opt.map(w=>decodeWord(w,lm,MIX));
    const cut=spans(cipherGroups)[s].train;
    const firstWords=dec.slice(cut,Math.min(cut+16,dec.length))
      .map(x=>x.sequence.map(i=>LETTERS[i]).join(""));
    output.push({section:s,wordCount:opt.length,firstHeldoutWord:cut,
      heldoutPreview:firstWords.join(" ").slice(0,220),
      lexicalChoices:dec.filter(x=>x.origin==="lexicon").length});
  }
  return output;
}

/** @param {number[][]} columns @param {()=>number} random */
function shuffled(columns,random){
  return columns.map(c=>{
    const out=c.slice();
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  });
}

/** @param {number[][][]} ref @param {number[]} lengths @param {ReturnType<typeof train>} lm @param {number[][]} columns */
function positive(ref,lengths,lm,columns){
  const data=fs.readFileSync(path.join(ROOT,"resources","control",
    "shakespeare_first300k.txt"),"utf8");
  const source=plant(words(data.slice(240000)),lengths,0x39a317).plaintext;
  const actualAssignment=[5,1,7,2,0,4,3,6];
  const sectionLengths=ref.map(g=>g.flat().length);
  const ciphers=streams(columns,sectionLengths);
  const key=[];
  for(let s=0;s<8;s++){
    key.push(...pad(ciphers["aes-256-ctr:false"][actualAssignment[s]],
      sectionLengths[s],false,1));
  }
  const encrypted=encipher(source,key,rng(0x39a318),Q);
  const groups=[];
  let at=0;
  for(const g of ref){groups.push(encrypted.ciphertext.slice(at,at+g.length));at+=g.length;}
  assert.equal(at,lengths.length);
  const out=screen(groups,columns,lm);
  const trueMode=out.ranked.find(x=>x.alg==="aes-256-ctr"&&!x.reverse&&
    !x.scaled&&x.sign===1&&x.assignment.every((c,i)=>c===actualAssignment[i]));
  const rank=out.ranked.indexOf(trueMode)+1;
  assert.ok(rank>0,"true generator must appear in recovered configuration");
  assert.equal(out.winner.modeTag,trueMode.modeTag);
  assert.deepEqual(out.winner.assignment,actualAssignment);
  return {status:"planted heldout correct generator recovered",
    actualAssignment,actualOverwrites:encrypted.rewritten.filter(Boolean).length,
    winner:out.winner,realGeneratorRank:rank};
}

function run() {
  const {groups,columns,wordLengths}=source();
  const raw=fs.readFileSync(path.join(ROOT,"resources","control",
    "shakespeare_first300k.txt"),"utf8");
  const lm=train(words(raw.slice(0,200000)));
  const planted=positive(groups,wordLengths,lm,columns);
  const real=screen(groups,columns,lm);
  const rand=rng(0x39a319);
  const nulls=[];
  const trials=Number(process.env.KEY_NULLS||8);
  assert.ok(Number.isInteger(trials)&&trials>=0&&trials<=100);
  for(let i=0;i<trials;i++){
    const trial=screen(groups,shuffled(columns,rand),lm);
    nulls.push({train:trial.winner.train,heldout:trial.winner.heldout});
  }
  const previewText=preview(groups,columns,lm,real.winner);
  return {
    status:"Original LP2 candidate-key screen; no automatic plaintext claim",
    keyFamily:"eight source grid columns as AES-256-CTR / ChaCha20 keys, zero IV, byte/29 reduction, sign, reverse key, 8! section assignment",
    candidateCount:"16 mode families x 8! assignments",
    originalWordCount:2896,runeCount:12956,
    sourceModel:"Shakespeare [0,200000) GP word frequency plus smoothed trigram; fixed mix .95",
    selection:"first 55% complete words within each section; 45% untouched heldout",
    positive:planted,
    real:{winner:real.winner,topThree:real.ranked.slice(0,3),preview:previewText},
    null:{seed:"0x39a319",trials,
      selection:"every null redoes all 16 mode searches and exact 8! assignments",
      rows:nulls,exceedTrain:nulls.filter(x=>x.train>=real.winner.train).length,
      exceedHeldout:nulls.filter(x=>x.heldout>=real.winner.heldout).length,
      plusOneTrain:(1+nulls.filter(x=>x.train>=real.winner.train).length)/(trials+1),
      plusOneHeldout:(1+nulls.filter(x=>x.heldout>=real.winner.heldout).length)/(trials+1)
    }
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={source,wordEvidence,scorePaired,streams,pad,screen,positive,run};
