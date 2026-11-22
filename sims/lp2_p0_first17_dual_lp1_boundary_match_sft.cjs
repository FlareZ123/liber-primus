"use strict";

/**
 * SFT: dual solved-LP1 boundary match for the frozen 22-word p0 candidate
 * prefix through THEN.
 *
 * Matching predicate: same source-native GP rune count, same GP prime sum,
 * and one rune-index sum is Euler-phi of the other.
 *
 * Run: node sims/lp2_p0_first17_dual_lp1_boundary_match_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
const tokens=corpus.translit
  .map((symbol,index)=>({symbol,index}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {string} original @returns {number[]} */
function encodeWord(original){
  const word=original.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<word.length;){
    if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const token=tokens.find(candidate=>word.startsWith(candidate.symbol,i));
    assert(token,"unmapped source-native spelling in "+original+" at "+word.slice(i));
    out.push(token.index);
    i+=token.symbol.length;
  }
  return out;
}

/** @param {number} n @returns {number} */
function phi(n){
  let value=n;
  let rest=n;
  for(let p=2;p*p<=rest;p++){
    if(rest%p!==0)continue;
    value-=value/p;
    while(rest%p===0)rest/=p;
  }
  if(rest>1)value-=value/rest;
  return value;
}

/** @param {string[]} words */
function stats(words){
  const values=words.flatMap(encodeWord);
  return {
    runes:values.length,
    indexSum:values.reduce((sum,value)=>sum+value,0),
    gp:values.reduce((sum,value)=>sum+corpus.prime[value],0)
  };
}

/** @param {{runes:number,indexSum:number,gp:number}} first @param {{runes:number,indexSum:number,gp:number}} second */
function matches(first,second){
  return first.runes===second.runes &&
    first.gp===second.gp &&
    (phi(first.indexSum)===second.indexSum ||
      phi(second.indexSum)===first.indexSum);
}

const lp1=[];
const sections=reference.split(/^### (\d+)\s*$/m);
for(let i=1;i<sections.length;i+=2){
  const page=Number(sections[i]);
  if(page>16)continue;
  const body=sections[i+1].replace(/^\[[^\n]*\]$/gm,"");
  const words=body.match(/[A-Z]+/g)||[];
  for(let start=0;start+7<=words.length;start++){
    const window=words.slice(start,start+7);
    lp1.push({page,start,words:window,...stats(window)});
  }
}
assert.equal(lp1.length,658);

const prefix=(
  "AS I GO THE WEATHER TURNS COLD " +
  "I MAY CRY NOW THE IDEA OF THE END IS DEATH " +
  "SEE YOU SOON THEN"
).split(" ");
assert.equal(prefix.length,22);

const candidateMatches=[];
for(let start=0;start+7<=prefix.length;start++){
  const words=prefix.slice(start,start+7);
  const current={start,words,...stats(words)};
  for(const solved of lp1){
    if(matches(current,solved))candidateMatches.push({candidate:current,lp1:solved});
  }
}

assert.equal(candidateMatches.length,2);
assert.deepEqual(
  candidateMatches.map(row=>[
    row.candidate.start,row.candidate.words.join(" "),
    row.candidate.runes,row.candidate.indexSum,row.candidate.gp,
    row.lp1.page,row.lp1.start,row.lp1.words.join(" "),
    row.lp1.runes,row.lp1.indexSum,row.lp1.gp
  ]),
  [
    [0,"AS I GO THE WEATHER TURNS COLD",21,233,825,1,9,"YOU KNOW TO BE TRUE TEST THE",21,232,825],
    [15,"END IS DEATH SEE YOU SOON THEN",21,268,969,10,40,"WE HAVE WHAT WE HAVE NOW BY",21,269,969]
  ]
);

const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];

const controlSummary=[];
let totalSpans=0;
let totalEither=0;
let totalBoth=0;
for(const [name,file] of controls){
  const words=read(file).match(/[A-Za-z]+/g)||[];
  const seven=[];
  for(let start=0;start+7<=words.length;start++){
    seven.push(stats(words.slice(start,start+7)));
  }
  let either=0;
  let both=0;
  for(let start=0;start+22<=words.length;start++){
    const first=lp1.some(solved=>matches(seven[start],solved));
    const last=lp1.some(solved=>matches(seven[start+15],solved));
    if(first||last)either++;
    if(first&&last)both++;
  }
  const spans=Math.max(0,words.length-21);
  totalSpans+=spans;
  totalEither+=either;
  totalBoth+=both;
  controlSummary.push({name,words:words.length,spans,either,both});
}

assert.deepEqual(controlSummary,[
  {name:"Shakespeare",words:55407,spans:55386,either:166,both:0},
  {name:"Gibran",words:15733,spans:15712,either:61,both:0},
  {name:"Emerson",words:77932,spans:77911,either:219,both:0}
]);
assert.equal(totalSpans,149009);
assert.equal(totalEither,446);
assert.equal(totalBoth,0);

console.log(JSON.stringify({
  status:"PASS: frozen p0 first17 prefix has two solved-LP1 boundary matches",
  solvedLp1SevenWordWindows:lp1.length,
  candidatePrefixWords:prefix.length,
  candidateSevenWordWindows:prefix.length-6,
  candidateMatches:candidateMatches.map(row=>({
    candidateStart:row.candidate.start,
    candidate:row.candidate.words.join(" "),
    candidateStats:{runes:row.candidate.runes,indexSum:row.candidate.indexSum,gp:row.candidate.gp},
    lp1Page:row.lp1.page,
    lp1Start:row.lp1.start,
    lp1:row.lp1.words.join(" "),
    lp1Stats:{runes:row.lp1.runes,indexSum:row.lp1.indexSum,gp:row.lp1.gp},
    phiRelation:phi(row.candidate.indexSum)===row.lp1.indexSum
      ?"phi(candidate)=LP1"
      :"phi(LP1)=candidate"
  })),
  controls:controlSummary,
  combinedControls:{spans:totalSpans,eitherBoundaryMatch:totalEither,bothBoundaryMatches:totalBoth},
  decision:"Strong intermediate cross-text boundary selectivity; boundary framing was recognized after the second match, so this does not authenticate plaintext or supply a cipher inverse."
},null,2));
