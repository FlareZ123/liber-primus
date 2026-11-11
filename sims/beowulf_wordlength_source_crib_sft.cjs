"use strict";
/**
 * Original-LP2 word-length crib gate against correctly normalized Old English
 * Beowulf, with three source-native positive plants.
 * SFT: node sims/beowulf_wordlength_source_crib_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
/** @param {string} raw */
function originalWords(raw){
  const text=raw.split("%").slice(0,55).join("%"), words=[];
  let n=0;
  for(const ch of text){
    if(/[\u16A0-\u16FF]/u.test(ch))n++;
    else if(ch==="%"||ch==="/"||/\s/u.test(ch))continue;
    else if(n){words.push(n);n=0;}
  }
  if(n)words.push(n);
  return words;
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @param {(x:number,y:number)=>boolean} accepted
 */
function longest(a,b,accepted){
  const row=new Uint16Array(b.length+1);
  let best={length:0,target:-1,source:-1};
  for(let i=1;i<=a.length;i++){
    let diag=0;
    for(let j=1;j<=b.length;j++){
      const old=row[j], k=accepted(a[i-1],b[j-1])?diag+1:0;
      row[j]=k; diag=old;
      if(k>best.length)best={length:k,target:i-k,source:j-k};
    }
  }
  return best;
}
/** @param {number[]} a @param {number[]} b */
function fuzzy(a,b){
  const index=new Map();
  for(let j=0;j<=b.length-6;j++){
    const key=b.slice(j,j+6).join(","), list=index.get(key)||[];
    list.push(j); index.set(key,list);
  }
  let best={length:0,errors:0,target:-1,source:-1},seeds=0;
  for(let i=0;i<=a.length-6;i++){
    for(const j of index.get(a.slice(i,i+6).join(","))||[]){
      seeds++;
      let count=6,errors=0;
      while(count<40&&i+count<a.length&&j+count<b.length){
        if(a[i+count]!==b[j+count]){if(errors===2)break;errors++;}
        count++;
      }
      if(count>best.length)best={length:count,errors,target:i,source:j};
    }
  }
  return {...best,seeds};
}
const a=originalWords(read("resources/lp2-transcription.txt"));
const b=JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json")).allSourceGpWordLengths;
assert.equal(a.length,2896);
assert.equal(a.reduce((x,y)=>x+y,0),12956);
assert.equal(b.length,10885);
assert.equal(b.reduce((x,y)=>x+y,0),48012);
const equal=(x,y)=>x===y, pad=(x,y)=>x===y||x===y+1;
const exact=longest(a,b,equal), padded=longest(a,b,pad), ambiguous=fuzzy(a,b);
assert.equal(exact.length,8);
assert.equal(padded.length,13);
assert.equal(ambiguous.length,13);
assert.equal(ambiguous.errors,2);
assert.equal(ambiguous.seeds,333);
const plantExact=a.slice();
plantExact.splice(1200,30,...b.slice(1200,1230));
assert.ok(longest(plantExact,b,equal).length>=30);
const plantPadded=a.slice();
plantPadded.splice(1300,30,...b.slice(3400,3430).map((x,i)=>x+i%2));
assert.ok(longest(plantPadded,b,pad).length>=30);
const plantFuzzy=a.slice(), quote=b.slice(7000,7030);
quote[8]+=2;quote[21]+=2;
plantFuzzy.splice(1400,30,...quote);
assert.ok(fuzzy(plantFuzzy,b).length>=30);
console.log(JSON.stringify({
 source:"corrected native Old English Beowulf",originalWords:a.length,
 oldEnglishWords:b.length,longestExact:exact,
 longestZeroOrOnePadding:padded,longestTwoMismatches:ambiguous,
 plantedControls:"three source-native 30-word positives recovered",
 unknownPlaintextRecovered:false
},null,2));
