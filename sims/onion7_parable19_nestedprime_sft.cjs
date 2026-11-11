"use strict";
/**
 * Original-source generative test: PARABLE residues [361,133,331] = 
 * [19^2,7*19,p_(p_19)] select the 7x7 square center, 2014 HTML pair,
 * and first LP2 red heading 662=2*331.
 * Run Node.js 22: node sims/onion7_parable19_nestedprime_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
/** @param {number} count @returns {number[]} */
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let yes=true;for(let d=2;d*d<=n;d++)if(n%d===0){yes=false;break;}
    if(yes)out.push(n);
  }
  return out;
}
/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function isPrime(n){
  if(n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
}
function factorKeys(n){
  const out=[];
  for(let p=2;p*p<=n;p++)if(n%p===0){
    out.push(p);
    while(n%p===0)n/=p;
  }
  if(n>1)out.push(n);
  return out;
}
function numberCommand(n){
  if(isPrime(n)){
    const reversed=Number(String(n).split("").reverse().join(""));
    if(isPrime(reversed))return {plus:true,factors:[]};
    return {plus:false,factors:factorKeys(reversed),input:n,reversed};
  }
  return {plus:false,factors:factorKeys(n),input:n,reversed:null};
}
function centerOutCoords(n){
  const out=[];
  let row=Math.floor(n/2),col=Math.floor(n/2);
  out.push([row,col]);
  const directions=[[0,1],[1,0],[0,-1],[-1,0]];
  let stepLength=1;
  while(out.length<n*n){
    for(let direction=0;direction<4&&out.length<n*n;direction++){
      const [dr,dc]=directions[direction];
      for(let step=0;step<stepLength&&out.length<n*n;step++){
        row+=dr;col+=dc;
        if(row>=0&&row<n&&col>=0&&col<n)out.push([row,col]);
      }
      if(direction%2===1)stepLength++;
    }
  }
  return out;
}
function indexOfCoincidence(values,alphabetSize=29){
  const counts=Array(alphabetSize).fill(0);
  for(const v of values)counts[v]++;
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}

function main(){
  const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const html=read("resources/cicada2014-onion7-index.html");
  const title=Number(html.match(/<title>(\d+)<\/title>/)[1]);
  const div=Number(html.match(/<div id="(\d+)">/)[1]);
  assert.deepEqual([title,div],[133,331]);

  const runePrime=new Map(c.runes.map((r,i)=>[r,c.prime[i]]));
  const transcript=read("resources/lp2-transcription.txt").split("%");
  assert.equal(transcript.length,57);
  const clauses=transcript[56].split(".")
    .map(t=>[...t].filter(ch=>runePrime.has(ch)))
    .filter(r=>r.length>0);
  assert.deepEqual(clauses.map(x=>x.length),[7,30,30,28]);
  // The values 19 and 7 are visible word counts in the original solved text.
  // Printed '/' line wraps are ignored; '-' is the actual word delimiter.
  const wordGroups=transcript[56].split(".")
    .map(part=>part.split("-").map(word=>[...word].filter(r=>runePrime.has(r)))
      .filter(word=>word.length>0))
    .filter(group=>group.length>0);
  const wordCounts=wordGroups.map(group=>group.length);
  assert.deepEqual(wordCounts,[1,7,6,6]);
  const bodyWords=wordCounts.slice(1).reduce((s,n)=>s+n,0);
  assert.equal(bodyWords,19);
  const firstBodyWords=wordCounts[1];
  assert.equal(firstBodyWords,7);
  const sentenceCount=wordCounts.length-1;
  assert.equal(sentenceCount,3);
  const repeatedLastWordCount=wordCounts[2];
  assert.deepEqual(wordCounts.slice(2),[6,6]);
  const primesForSentenceCounts=primes(464);
  const primeForThreeSentences=primesForSentenceCounts[sentenceCount*29-1];
  const primeForSixWords=primesForSentenceCounts[repeatedLastWordCount*29-1];
  assert.equal(primeForThreeSentences,449);
  assert.equal(primeForSixWords,1033);


  const sums=clauses.map(runes=>runes.reduce((s,r)=>s+runePrime.get(r),0));
  assert.deepEqual(sums,[449,1259,1031,1229]);
  assert.equal(sums[0],primeForThreeSentences);
  const residual=sums.slice(1).map(x=>x%sums[0]);
  assert.deepEqual(residual,[361,133,331]);

  const blocks=read("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  assert.equal(blocks.length,3);
  const squares=blocks.map(b=>b.trim().split(/\r?\n/)
    .map(line=>line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(squares.map(x=>x.length),[5,7,5]);
  assert.equal(squares[1][0].reduce((a,b)=>a+b,0),primeForSixWords);
  assert.deepEqual(squares.map(a=>a[Math.floor(a.length/2)][Math.floor(a.length/2)]),
    [809,331,91]);

  const common=gcd(residual[0],residual[1]);
  assert.equal(common,bodyWords);
  assert.equal(common**2,residual[0]);
  const order=residual[1]/common;
  assert.equal(order,firstBodyWords);
  const matches=squares.filter(a=>a.length===order);
  assert.equal(matches.length,1);
  const center=matches[0][Math.floor(order/2)][Math.floor(order/2)];
  assert.equal(center,residual[2]);
  assert.equal(center,div);
  // PARABLE says to shed circumferences and find the divinity within.
  // Count cells in each concentric square shell from the 7x7 exterior inward.
  const ringCounts=Array.from({length:4},(_,level)=>
    squares[1].flatMap((row,r)=>row.map((_,c)=>({r,c})))
      .filter(({r,c})=>Math.min(r,c,6-r,6-c)===level).length);
  assert.deepEqual(ringCounts,[24,16,8,1]);
  assert.equal(squares[0][0].reduce((s,v)=>s+v,0),3301);
  assert.equal(title+div,ringCounts[1]*29);
  assert.equal(primesForSentenceCounts[ringCounts[1]*29-1],3301);

  assert.equal(common*order,title);

  const p=primes(464);
  assert.equal(p[18],67);
  assert.equal(p[p[18]-1],331);
  assert.equal(p[463],3301);
  assert.equal(title+div,464);
  // The first input can also be predicted without looking at PARABLE:
  // HTML title / earlier unique square order => 19 => 19^2 = 361.
  assert.equal((title/order)**2,residual[0]);
  assert.equal(p[p[title/order-1]-1],div);

  const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const red0=ink.pages.find(x=>x.page===0).red_spans.find(x=>
    x.start===0&&x.length===13);
  assert.ok(red0);
  const redIndices=c.pages.find(x=>x.page===0).indices
    .slice(red0.start,red0.start+red0.length);
  assert.equal(redIndices.reduce((s,i)=>s+c.prime[i],0),662);
  assert.equal(662,2*div);

  // The p57 red ink explicitly marks the word PARABLE; its GP-prime sum
  // independently selects the 449 heading/modulus used above.
  const red57=ink.pages.find(x=>x.page===57).red_spans.find(x=>
    x.start===0&&x.length===7);
  assert.ok(red57);
  const red57Indices=c.pages.find(x=>x.page===57).indices
    .slice(red57.start,red57.start+red57.length);
  const red57Primes=red57Indices.map(i=>c.prime[i]);
  const red57PrimeSum=red57Primes.reduce((a,b)=>a+b,0);
  assert.equal(red57Indices.map(i=>c.translit[i]).join(""),"PARABLE");
  assert.deepEqual(red57Primes,[43,97,11,97,61,73,67]);
  assert.equal(red57PrimeSum,449);
  assert.equal(red57PrimeSum,sums[0]);

  assert.equal(c.translit[c.prime.indexOf(19)],"W");

  // Historical 2013 first-onion server.py NUMBER command, applied cellwise
  // to the three 2014 OpenPuff squares. The command returns "+" for emirps;
  // otherwise it returns the distinct prime factors of n (or reverse(n)).
  const numberResults=squares.map(square=>square.flat().map(numberCommand));
  const numberSummaries=numberResults.map((results,index)=>{
    const factors=results.flatMap(x=>x.factors);
    return {
      order:squares[index].length,
      plusCells:results.filter(x=>x.plus).length,
      activeCells:results.filter(x=>!x.plus).length,
      factorTokens:factors.length,
      unknownFactors:[...new Set(factors.filter(p=>!c.prime.includes(p)))].sort((a,b)=>a-b)
    };
  });
  assert.deepEqual(numberSummaries.map(x=>x.plusCells),[0,8,6]);
  assert.deepEqual(numberSummaries.map(x=>x.activeCells),[25,41,19]);
  assert.deepEqual(numberSummaries.map(x=>x.unknownFactors),
    [[139,227,313,467],[],[113]]);

  const factorIndexMatrix=Array.from({length:7},(_,r)=>
    Array.from({length:7},(_,col)=>{
      const result=numberResults[1][r*7+col];
      if(result.plus)return null;
      const indices=result.factors.map(p=>{
        const i=c.prime.indexOf(p);
        assert.ok(i>=0, `NUMBER factor ${p} is not a GP prime weight`);
        return i;
      });
      return indices.reduce((a,b)=>a+b,0)%29;
    }));
  const factorIndexRuneMatrix=factorIndexMatrix.map(row=>
    row.map(i=>i===null?"+":c.translit[i]).join(" "));
  assert.deepEqual(factorIndexRuneMatrix,[
    "+ O T N U + +",
    "G J O J O O +",
    "H N R H U F O",
    "F W O I O W F",
    "O F U H R N H",
    "+ O O J O J G",
    "+ + U N T O +"
  ]);
  assert.equal(factorIndexMatrix[3][3],10);
  assert.equal(c.translit[10],"I");

  // The p57 "tunneling to the surface" wording motivates this one
  // center-outward spiral order. Skip the eight NUMBER "+" cells.
  const centerOutActive= centerOutCoords(7)
    .map(([r,col])=>factorIndexMatrix[r][col])
    .filter(x=>x!==null);
  assert.equal(centerOutActive.length,41);
  const centerOutKeyText=centerOutActive.map(i=>c.translit[i]).join("");
  assert.equal(centerOutKeyText,"IORHUORHUFWNJOJOOFWNJOJOOOFHGOTNUOFHGOTNU");
  const factorTokenCount=numberResults[1].flatMap(x=>x.factors).length;
  assert.equal(factorTokenCount,84);
  const ringFactorTokenCounts=Array.from({length:4},(_,level)=>{
    const cells=[];
    for(let r=0;r<7;r++)for(let col=0;col<7;col++)
      if(Math.min(r,col,6-r,6-col)===level)cells.push(numberResults[1][r*7+col]);
    return cells.reduce((sum,x)=>sum+x.factors.length,0);
  });
  assert.deepEqual(ringFactorTokenCounts,[32,32,18,2]);

  const unknownCipher=c.pages.filter(page=>page.page<=55).flatMap(page=>page.indices);
  assert.equal(unknownCipher.length,12956);
  assert.equal(unknownCipher.length,41*316);
  const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
  const signatureMarkerOffset=signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.equal(signatureMarkerOffset,317);

  const directAdditiveTests=[-1,1].map(sign=>{
    const decoded=unknownCipher.map((value,i)=>
      (value+sign*centerOutActive[i%centerOutActive.length]+29)%29);
    return {
      sign,
      ioc:indexOfCoincidence(decoded),
      preview:decoded.slice(0,80).map(i=>c.translit[i]).join(" ")
    };
  });
  assert.ok(directAdditiveTests.every(x=>Math.abs(x.ioc-0.03448)<0.0001));

  // The 5x5 / 3301 square has four prime factors outside the 29 GP prime
  // weights under NUMBER. Decompose those factors as base29 digit values,
  // then read the digit values as GP alphabet indices. This GP-index reading
  // is a new hypothesis; the historical BASE29 protocol itself printed
  // alphanumeric digits such as 16I for 1033.
  const base29Alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
  const asBase29Digits=(value)=>{
    const digits=[];
    for(let n=value;n>0;n=Math.floor(n/29))digits.unshift(n%29);
    return digits.length?digits:[0];
  };
  const gpPrimeSet=new Set(c.prime);
  const firstExternal=[...new Set(numberResults[0].flatMap(x=>x.factors)
    .filter(x=>!gpPrimeSet.has(x)))].sort((a,b)=>a-b);
  assert.deepEqual(firstExternal,[139,227,313,467]);
  const externalFactorChunks=Object.fromEntries(firstExternal.map(value=>{
    const digits=asBase29Digits(value);
    assert.equal(digits.length,2);
    return [value,{
      digits,
      protocolText:digits.map(x=>base29Alphabet[x]).join(""),
      gpIndexText:digits.map(x=>c.translit[x]).join("")
    }];
  }));
  assert.deepEqual(Object.fromEntries(Object.entries(externalFactorChunks)
    .map(([k,v])=>[k,v.gpIndexText])),
    {"139":"RD","227":"WA","313":"ID","467":"TO"});

  const thirdExternal=[...new Set(numberResults[2].flatMap(x=>x.factors)
    .filter(x=>!gpPrimeSet.has(x)))].sort((a,b)=>a-b);
  assert.deepEqual(thirdExternal,[113]);
  const thirdControlDigits=asBase29Digits(113);
  const thirdControlGp=thirdControlDigits.map(x=>c.translit[x]).join("");
  assert.equal(thirdControlGp,"OY");

  // Among the 24 source-chunk permutations, the pinned English lexicon has
  // only TOWARD and WARD as multi-chunk words. This is a bounded language
  // observation, not a global significance test or a source-specified order.
  const lexicon=new Map(read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/).flatMap(line=>{
      const match=line.match(/^([a-z]+)\s+(\d+)$/);
      return match?[[match[1].toUpperCase(),Number(match[2])]]:[];
    }));
  const chunkValues=Object.values(externalFactorChunks).map(x=>x.gpIndexText);
  const permutations=(items,length,prefix=[],out=[])=>{
    if(prefix.length===length){out.push(prefix.slice());return out;}
    for(const item of items)if(!prefix.includes(item)){
      prefix.push(item);permutations(items,length,prefix,out);prefix.pop();
    }
    return out;
  };
  const multiChunkLexiconHits=[];
  for(let length=2;length<=4;length++)for(const parts of permutations(chunkValues,length)){
    const word=parts.join("");
    if(lexicon.has(word))multiChunkLexiconHits.push({
      parts,word,count:lexicon.get(word)
    });
  }
  multiChunkLexiconHits.sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word));
  assert.deepEqual(multiChunkLexiconHits.map(x=>x.word),["TOWARD","WARD"]);
  const grammaticalPermutationFactors=[467,227,139,313];
  const grammaticalPermutation=grammaticalPermutationFactors
    .map(value=>externalFactorChunks[value].gpIndexText).join("");
  assert.equal(grammaticalPermutation,"TOWARDID");
  assert.equal(div,331);
  assert.equal(squares[1][3][3],div);

  // PARABLE says to shed circumferences and find what lies within. Enumerate
  // only the eight physical square symmetries, then read the NUMBER-derived
  // GP-index matrix by concentric circumferences from outside to center.
  const orientations=(matrix)=>{
    const out=[],seen=new Set();
    for(const transpose of [false,true])for(const flipRows of [false,true])
      for(const flipCols of [false,true]){
        let v=matrix.map(row=>row.slice());
        if(transpose)v=v[0].map((_,j)=>v.map(row=>row[j]));
        if(flipRows)v=v.reverse();
        if(flipCols)v=v.map(row=>row.reverse());
        const key=JSON.stringify(v);
        if(!seen.has(key)){seen.add(key);out.push(v);}
      }
    return out;
  };
  const inwardCoords=(n)=>{
    const out=[];
    for(let level=0;level<=Math.floor((n-1)/2);level++){
      const lo=level,hi=n-1-level;
      if(lo===hi){out.push([lo,lo]);continue;}
      for(let col=lo;col<=hi;col++)out.push([lo,col]);
      for(let row=lo+1;row<=hi;row++)out.push([row,hi]);
      for(let col=hi-1;col>=lo;col--)out.push([hi,col]);
      for(let row=hi-1;row>lo;row--)out.push([row,lo]);
    }
    return out;
  };
  const inwardD4=[...new Set(orientations(factorIndexMatrix).map(matrix=>
    inwardCoords(7).map(([r,col])=>matrix[r][col]).filter(x=>x!==null)
      .map(x=>c.translit[x]).join("")))];
  assert.equal(inwardD4.length,4);
  const inwardUnto=inwardD4.find(x=>x.startsWith("UNTO"));
  assert.equal(inwardUnto,
    "UNTOGHFOUNTOGHFOOOJOJNWFOOJOJNWFUHROUHROI");
  const inwardUntoIndices=[...inwardUnto].map(token=>c.translit.indexOf(token));
  assert.equal(inwardUntoIndices.length,41);
  const inwardDirectTests=[
    {name:"C-K",fn:(cipher,key)=>(cipher-key+29)%29},
    {name:"C+K",fn:(cipher,key)=>(cipher+key)%29},
    {name:"K-C",fn:(cipher,key)=>(key-cipher+29)%29}
  ].map(({name,fn})=>{
    const decoded=unknownCipher.map((cipher,i)=>fn(cipher,
      inwardUntoIndices[i%inwardUntoIndices.length]));
    return {name,ioc:indexOfCoincidence(decoded),
      preview:decoded.slice(0,80).map(i=>c.translit[i]).join("")};
  });
  assert.ok(inwardDirectTests.every(x=>Math.abs(x.ioc-1/29)<0.00002));

  console.log(JSON.stringify({
    sources:["2014 seventh-onion delivery HTML", "three OpenPuff magic squares",
      "solved original LP2 p57 PARABLE", "original LP2 p0 red-ink span"],
    parableHeadingPrimeSum:sums[0],bodyGPPrimeSums:sums.slice(1),
    parableWordCounts:wordCounts,bodyWords,firstBodyWords,
    sentenceCount,primeBySentenceCount:primeForThreeSentences,
    lastTwoSentenceWordCount:repeatedLastWordCount,
    primeByLastTwoWordCount:primeForSixWords,
    bodyResiduals:residual,
    generativeCandidate:{commonFactor:common,first:common**2,
      order:order,second:common*order,
      prime19:p[18],doublePrime19:p[p[18]-1],third:center,
      sourceHtml:{title,div},squareIndex:1,squareCenter:center,
      ringCounts,firstHistoricalMagicSum:3301,
      ringTwoOrdinal:ringCounts[1]*29},
    additionalOriginalCiphertextNumerology:{p0RedHeadingRunes:red0.length,
      gpPrimeSum:662,ratioToHtmlDiv:2,
      p57RedHeadingRunes:red57Indices.length,
      p57RedWord:red57Indices.map(i=>c.translit[i]).join(""),
      p57RedPrimeWeights:red57Primes,p57RedPrimeSum:red57PrimeSum,
      p57RedSumEqualsParableHeadingModulus:red57PrimeSum===sums[0]},
    cellwise2013NumberProbe:{
      source:"2013/004-first-onion/server.py NUMBER command",
      squares:numberSummaries,
      factorIndexRuneMatrix,
      center331:{reverse:133,factors:[7,19],factorIndices:[3,7],sumMod29:10,rune:"I"},
      plusCells:8,activeCells:41,
      factorTokenCount, factorTokensPerShell:ringFactorTokenCounts,
      centerOutKey:centerOutKeyText,
      unknownCipherLength:unknownCipher.length,
      candidateGrid:{rows:316,columns:41},
      signatureMarkerOffset2016:signatureMarkerOffset,
      directAdditiveTests,
      externalFactorBase29GpIndex:{
        firstSquareFactors:firstExternal,
        chunks:externalFactorChunks,
        controlThirdSquare:{factor:113,digits:thirdControlDigits,gpIndexText:thirdControlGp},
        multiChunkLexiconHits,
        grammaticalPermutationFactors,
        grammaticalPermutation,
        htmlDestinationCandidate:{attribute:"id",value:div},
        orderingStatus:"hypothesis: NUMBER and base29 digit decomposition are source-derived; GP-index reading and TO-WA-RD-ID ordering are not source-specified"
      },
      inwardCircumferenceProbe:{
        d4Sequences:inwardD4,
        untoSequence:inwardUnto,
        directAdditiveTests:inwardDirectTests
      }
    },
    independentPredictionsAfterSelection:"Candidate structural map only: the per-cell GP-index sum and center-out path are interpretive; direct period-41 additive use fails, and no unknown plaintext or key is established."
  },null,2));
}
if(require.main===module)main();
module.exports={main,gcd,primes};
