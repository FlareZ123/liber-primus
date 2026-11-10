"use strict";

/**
 * Test whether rare LP2 adjacent ciphertext doublets mark a fixed plaintext
 * Gematria Primus letter. An event is the second symbol of C[i] = C[i-1].
 *
 * Each candidate letter induces a conditional within-word position profile
 * learned from independently sourced English converted to GP runes. We
 * condition on the observed event-bearing word lengths and counts, search all
 * 29 candidates, and calibrate the family maximum under word-position shuffles.
 *
 * No candidate's apparent advantage is plaintext recovery.
 * Run (from repository root): node sims/doublet_plaintext_letter_marker.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const GP = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X",
  "S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const RUNES = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const BY_RUNE = new Map(RUNES.map((x,i) => [x,i]));
const BY_GP = new Map(GP.map((x,i) => [x,i]));
const N_NULL = 5000;
const N_PLANT = 250;

/** @param {string} word Latin spelling; @returns {number[]} GP indices. */
function encode(word) {
  const w = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const result = [];
  for (let i = 0; i < w.length;) {
    const pair = w.slice(i,i+2);
    if (BY_GP.has(pair)) { result.push(BY_GP.get(pair)); i+=2; }
    else {
      const x = BY_GP.get(w[i]);
      if (x === undefined) throw Error("Unknown GP spelling "+w[i]);
      result.push(x);
      i++;
    }
  }
  return result;
}

/** @param {number} seed Nonzero unsigned seed; @returns {() => number} */
function xorshift(seed) {
  let n = seed >>> 0;
  return () => {
    n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
    return n >>> 0;
  };
}

/** @param {string} transcript Canonical rune-bearing transcription. */
function parseEvents(transcript) {
  const sections = transcript.split("%").slice(0,55).join("%").split("$")
    .filter(s => /[\u16A0-\u16FF]/u.test(s))
    .map(s => s.replace(/[\/%\s]/g,"")
      .split(/[^\u16A0-\u16FF]+/u).filter(Boolean));
  const events = [], words = [];
  let total = 0;
  for (const section of sections) {
    let previous = -1;
    for (const word of section) {
      const id = words.length;
      let eventCount = 0;
      for (let pos = 0; pos < word.length; pos++) {
        const rune = BY_RUNE.get(word[pos]);
        if (rune === undefined) throw Error("Invalid rune");
        if (rune === previous) {
          events.push({len:word.length,pos,wordId:id});
          eventCount++;
        }
        previous = rune;
        total++;
      }
      words.push({len:word.length,eventCount});
    }
  }
  if (sections.length !== 8 || words.length !== 2896 ||
      total !== 12956 || events.length !== 86) throw Error("LP2 corpus changed");
  return {sections:sections.length,words,events,total};
}

/**
 * Score all 29 competing fixed-plaintext-marker hypotheses.
 * @param {{len:number,pos:number}[]} events
 * @param {Map<number,number[][]>} logWeights
 */
function bestScore(events,logWeights) {
  const scores = new Float64Array(29);
  for (const item of events) {
    const rows = logWeights.get(item.len);
    for (let r=0; r<29; r++) scores[r] += rows[r][item.pos];
  }
  let winner = -1, best = -Infinity;
  for (let r=0; r<29; r++) if (scores[r] > best) {
    winner = r; best = scores[r];
  }
  return {best,winner,scores};
}

/**
 * @param {string} plainText Control English.
 * @param {{len:number,pos:number,wordId:number}[]} events
 */
function train(plainText, events) {
  const sourceWords = (plainText.match(/[a-zA-Z]+/g)||[]).map(encode);
  const lengths = [...new Set(events.map(e=>e.len))];
  const counts = new Map();
  for (const word of sourceWords) {
    if (!counts.has(word.length)) counts.set(word.length,{
      n:0, slots:Array.from({length:word.length},()=>new Float64Array(29))
    });
    const c=counts.get(word.length);
    c.n++;
    word.forEach((r,j)=>c.slots[j][r]++);
  }
  const logWeights = new Map(), weights = new Map();
  for (const L of lengths) {
    const c = counts.get(L);
    if (!c) throw Error("Missing English GP word length "+L);
    const byLetter = Array.from({length:29},(_,r)=>{
      const q = c.slots.map(slot=>slot[r]+0.5);
      const total = q.reduce((a,b)=>a+b,0);
      return q.map(x=>x/total);
    });
    weights.set(L,byLetter);
    logWeights.set(L,byLetter.map(row=>row.map(p=>Math.log(p*L))));
  }
  return {sourceWords:sourceWords.length,logWeights,weights};
}

/**
 * @param {string} name Reference author.
 * @param {string} plainText Source text.
 * @param {{words:{len:number,eventCount:number}[],events:{len:number,pos:number,wordId:number}[]}} actual
 * @param {number} seed Deterministic null seed.
 */
function evaluate(name,plainText,actual,seed) {
  const {sourceWords,logWeights,weights}=train(plainText,actual.events);
  const observed=bestScore(actual.events,logWeights);
  const rng=xorshift(seed);
  let nullExceed=0,nullSum=0,nullSq=0,nullMax=-Infinity;
  for(let trial=0;trial<N_NULL;trial++){
    const randomEvents=[];
    for(let id=0;id<actual.words.length;id++){
      const {len,eventCount}=actual.words[id];
      if(eventCount===0)continue;
      const positions=new Set();
      while(positions.size<eventCount)positions.add(rng()%len);
      for(const pos of positions)randomEvents.push({len,pos});
    }
    const value=bestScore(randomEvents,logWeights).best;
    nullExceed+=+(value>=observed.best);
    nullSum+=value;
    nullSq+=value*value;
    if(value>nullMax)nullMax=value;
  }
  const winner=observed.winner;
  let plantRecovered=0,plantMean=0;
  for(let trial=0;trial<N_PLANT;trial++){
    const samples=[];
    for(const {len} of actual.events){
      const dist=weights.get(len)[winner];
      let u=rng()/4294967296, pos=0;
      while(pos<dist.length-1&&u>=dist[pos]){u-=dist[pos];pos++;}
      samples.push({len,pos});
    }
    const value=bestScore(samples,logWeights);
    plantRecovered+=+(value.winner===winner);
    plantMean+=value.best;
  }
  const ranked=[...observed.scores].map((logLR,r)=>({
    gp:GP[r], index:r, logLR:Number(logLR.toFixed(5))
  })).sort((a,b)=>b.logLR-a.logLR);
  return {
    name,sourceWords,
    topFive:ranked.slice(0,5),
    observedBestLR:observed.best,
    observedF_LR:observed.scores[0],
    nullMean:nullSum/N_NULL,
    nullSD:Math.sqrt(nullSq/N_NULL-(nullSum/N_NULL)**2),
    nullMax,
    nullExceed,
    nullFamilyUpperP:(nullExceed+1)/(N_NULL+1),
    plantModel:GP[winner],
    plantRecovered,
    plantTrials:N_PLANT,
    plantMean:plantMean/N_PLANT
  };
}

/** Reproducible experiment using repository source texts. */
function run() {
  const raw = fs.readFileSync(path.join(ROOT,"resources/lp2-transcription.txt"),"utf8");
  const actual=parseEvents(raw);
  const sources=[
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"]
  ];
  return {
    model:"Each observed doublet event corresponds to the same unknown GP plaintext rune with position-independent detection; one symbol among 29",
    null:"5000 random event positions, exactly retaining event counts for each of 2896 whole words; family maximum over all 29 symbols",
    dataset:{sections:actual.sections,words:actual.words.length,runes:actual.total,
      events:actual.events.length,
      startEvents:actual.events.filter(x=>x.pos===0).length},
    replicates:{null:N_NULL,positive:N_PLANT,seed:"0x430f3301 + 1009 * sourceIndex"},
    results:sources.map(([name,source],index)=>{
      const plainText=fs.readFileSync(path.join(ROOT,source),"utf8");
      return evaluate(name,plainText,actual,(0x430f3301+1009*index)>>>0);
    })
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={parseEvents,train,bestScore,evaluate,run};
