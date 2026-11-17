'use strict';

/**
 * Jointly recover a single reused 29x29 unknown secret H2 tableau and
 * hidden per-rune prime-clock skips from original-length native-GP English.
 *
 * New experimental premise: each visible original physical page starts the
 * authenticated prime-2 clock afresh, while the secret tableau is shared.
 * The page-reset premise is hypothetical, never stated by Cicada. It is
 * deliberately distinct from the original single-global-clock H2 plant.
 *
 * All 55 rune-bearing original LP2 physical page lengths are preserved,
 * including p50's empty grid. The four apostrophe-word rune spans remain at
 * their actual original absolute coordinates. One entire p41 original-shaped
 * page is held out from ALL table/clock training. Its ciphertext enters
 * only a frozen test-time Viterbi. Planted truth is used solely for metrics.
 *
 * Exact secret-table, prime-stream, source-plant and skip-generation control
 * plus completely oracle-free staged bigram/Hungarian model fitting.
 * Windows Node.js 22 / CommonJS. Read only, deterministic.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const {languageModel,recoverTableau} =
  require('./gp29_bigram_tableau_decoder.cjs');
const LENGTH=12956,N=29,DRIFT_LIMIT=40,HELDOUT_PAGE=41,TRIALS=8;
const PAGE_LENGTHS=gp.pages.filter(p=>p.page<=55).map(p=>p.indices.length);
assert.equal(PAGE_LENGTHS.length,56);
assert.equal(PAGE_LENGTHS.reduce((a,b)=>a+b,0),LENGTH);
assert.equal(PAGE_LENGTHS[50],0);
const pageStart=[];
for(let p=0,pos=0;p<PAGE_LENGTHS.length;p++){
  pageStart.push(pos);pos+=PAGE_LENGTHS[p];
}
const spelling=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);

/** @param {string} w @returns {number[]} */
function gpWord(w){
  w=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const term=spelling.find(v=>w.startsWith(v.s,i));
      assert.ok(term,'native GP source must be convertible');
      out.push(term.i);i+=term.s.length;
    }
  }
  return out;
}
/** @param {string} text @returns {number[]} */
const toGP=text=>(text.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
const native=toGP(read('resources/control/gibran_prophet_58585.txt'));
const reference=toGP(read('resources/control/shakespeare_first300k.txt'));
assert.equal(native.length,62492);
assert.equal(reference.length,217106);
const model=languageModel(reference);
const nRef=model.unigram.reduce((a,b)=>a+b,0);
const rankedPrior=model.unigram.map(c=>c/nRef).sort((a,b)=>b-a);
const logSteps=[.972,.0272,.0008,.000022,.00000062].map(Math.log);

const composite=new Uint8Array(10000),primeRows=[];
for(let p=2;p<composite.length&&primeRows.length<500;p++){
  if(composite[p])continue;
  primeRows.push((p-1)%N);
  if(p*p<composite.length)
    for(let j=p*p;j<composite.length;j+=p)composite[j]=1;
}
assert.equal(primeRows.length,500);

/** @param {number} seed */
function rng(seed){
  let s=seed>>>0;
  const float=()=>{
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return(s>>>0)/4294967296;
  };
  return {float,int:n=>Math.floor(float()*n)};
}
/** @param {{int:(n:number)=>number}} r */
function permutation(r){
  const p=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){
    const j=r.int(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
}
const apostrophe=[
  {at:1107,word:'DONT'}, {at:5136,word:'ITS'},
  {at:8513,word:'HES'}, {at:10086,word:'CANT'}
];
assert.deepEqual(apostrophe.map(s=>gpWord(s.word).length),[4,3,3,4]);


/**
 * Exact source-original printed-word shape. The 2896 target GP29 word
 * lengths (including all 83 singleton words and 32 cross-page carries)
 * are fixed independently of source text. Each length is filled with a
 * Gibran native-GP word from an eligible source-word bucket.
 */
const originalRuneSet=new Set(gp.runes);
const originalWordLengths=[];
let pendingOriginal=0,originalRuneCount=0;
for(const ch of read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%')){
  if(originalRuneSet.has(ch)){pendingOriginal++;originalRuneCount++;}
  else if(ch==='/'||ch==='%'||/\s/u.test(ch)){}
  else if(pendingOriginal){
    originalWordLengths.push(pendingOriginal);pendingOriginal=0;
  }
}
if(pendingOriginal)originalWordLengths.push(pendingOriginal);
assert.equal(originalRuneCount,LENGTH);
assert.equal(originalWordLengths.length,2896);
assert.equal(originalWordLengths.filter(x=>x===1).length,83);
const nativeBuckets=Array.from({length:15},()=>[]);
for(const token of read('resources/control/gibran_prophet_58585.txt')
  .match(/[A-Za-z]+/g)||[]){
  const word=gpWord(token);
  if(word.length<nativeBuckets.length)
    nativeBuckets[word.length].push(word);
}
assert.ok(originalWordLengths.every(n=>nativeBuckets[n].length>0));

/**
 * Separate planted secret and full source-index truth.
 * @param {number} seed
 */
function plant(seed,originalWordShape=false){
  const random=rng(seed),start=random.int(native.length-LENGTH);
  const plain=originalWordShape?
    originalWordLengths.flatMap(n=>
      nativeBuckets[n][random.int(nativeBuckets[n].length)]):
    native.slice(start,start+LENGTH);
  for(const s of apostrophe){
    const word=gpWord(s.word);
    plain.splice(s.at,word.length,...word);
  }
  assert.equal(plain.length,LENGTH);
  const table=Array.from({length:N},()=>permutation(random));
  const pages=[],truePaths=[],trueRows=[];
  let ptr=0,previous=-1,skips=0,total=0,maxLocal=0;
  for(let page=0;page<PAGE_LENGTHS.length;page++){
    ptr=0;previous=-1;
    const c=[],d=[],r=[];
    for(let i=0;i<PAGE_LENGTHS[page];i++){
      const p=plain[pageStart[page]+i];
      let proposed=table[primeRows[ptr]][p],extra=0;
      while(proposed===previous&&random.float()<.81){
        ptr++;extra++;skips++;
        proposed=table[primeRows[ptr]][p];
      }
      assert.ok(extra<=4);
      maxLocal=Math.max(maxLocal,extra);
      c.push(proposed);d.push(ptr-i);r.push(primeRows[ptr]);
      previous=proposed;ptr++;total++;
    }
    pages.push(c);truePaths.push(d);trueRows.push(r);
  }
  assert.equal(total,LENGTH);
  const check=pages.flatMap((c,page)=>c.map((v,i)=>{
    const row=trueRows[page][i];
    return table[row][plain[pageStart[page]+i]]===v;
  }));
  assert.ok(check.every(Boolean));
  return {pages,plain,table,truePaths,trueRows,skips,maxLocal};
}

/**
 * Unknown clock, known hypothesized row emission likelihood. Every 0..4
 * pointer advance considered. No oracle path, table or plaintext.
 * @param {number[]} cipher
 * @param {Float64Array} logEmission
 * @param {number} limit
 * @returns {number[]}
 */
function inferPage(cipher,logEmission,limit=cipher.length){
  const n=Math.min(cipher.length,limit);
  if(!n)return [];
  const width=DRIFT_LIMIT+1;
  const back=new Uint8Array(n*width);
  let prev=new Float64Array(width).fill(-1e30);
  prev[0]=logEmission[primeRows[0]*N+cipher[0]];
  for(let i=1;i<n;i++){
    const next=new Float64Array(width).fill(-1e30);
    for(let d=0;d<width;d++){
      let best=prev[d]+logSteps[0],step=0;
      for(let k=1;k<=4&&k<=d;k++){
        const candidate=prev[d-k]+logSteps[k];
        if(candidate>best){best=candidate;step=k;}
      }
      next[d]=best+logEmission[primeRows[i+d]*N+cipher[i]];
      back[i*width+d]=step;
    }
    prev=next;
  }
  let drift=0;
  for(let d=1;d<width;d++)if(prev[d]>prev[drift])drift=d;
  const path=new Array(n);
  for(let i=n-1;i>=0;i--){
    path[i]=drift;
    drift-=back[i*width+drift];
    assert.ok(drift>=0);
  }
  return path;
}

/**
 * Permutation-constrained row emission M-step, using frozen independently
 * trained English unigram probabilities and only ciphertext/estimated paths
 * outside the held-out p41 physical page.
 * @param {number[][]} pages
 * @param {number[][]} paths
 * @param {number} prefixLength
 */
function learnEmissions(pages,paths,prefixLength){
  const cnt=new Float64Array(N*N).fill(1);
  for(let page=0;page<pages.length;page++){
    if(page===HELDOUT_PAGE)continue;
    const limit=Math.min(prefixLength,paths[page].length);
    for(let i=0;i<limit;i++)
      cnt[primeRows[i+paths[page][i]]*N+pages[page][i]]++;
  }
  const emissions=new Float64Array(N*N);
  for(let r=0;r<N;r++){
    const order=Array.from({length:N},(_,i)=>i)
      .sort((a,b)=>cnt[r*N+b]-cnt[r*N+a]||a-b);
    let samples=0;
    for(let c=0;c<N;c++)samples+=cnt[r*N+c]-1;
    const confidence=samples/(samples+67);
    for(let j=0;j<N;j++){
      const p=order[j];
      emissions[r*N+p]=Math.log(
        confidence*rankedPrior[j]+(1-confidence)/N);
    }
  }
  return emissions;
}

/**
 * Training rows are estimated, never planted. Reuse shared Hungarian
 * GP29 source-language decoder on all except physically withheld p41.
 * @param {number[][]} pages
 * @param {number[][]} paths
 */
function trainTable(pages,paths){
  const c=[],row=[];
  for(let page=0;page<pages.length;page++){
    if(page===HELDOUT_PAGE)continue;
    for(let i=0;i<pages[page].length;i++){
      c.push(pages[page][i]);
      row.push(primeRows[i+paths[page][i]]);
    }
  }
  assert.equal(c.length,LENGTH-PAGE_LENGTHS[HELDOUT_PAGE]);
  return recoverTableau(c,row,model,{sweeps:12});
}

/** @param {number[][]} table */
function emissionFromTable(table){
  const res=new Float64Array(N*N);
  for(let r=0;r<N;r++)
    for(let c=0;c<N;c++)
      res[r*N+c]=Math.log(
        (model.unigram[table[r][c]]+1)/(nRef+N));
  return res;
}

/** @param {ReturnType<typeof plant>} data */
function solve(data){
  const pages=data.pages;
  let paths=pages.map(c=>Array(Math.min(c.length,3)).fill(0));
  const prefixSchedule=[3,4,5,7,10,15,20,30,45,60,80,110,150,200,300];
  const trace=[];
  for(const limit of prefixSchedule){
    for(let sweep=0;sweep<3;sweep++){
      const emit=learnEmissions(pages,paths,limit);
      paths=pages.map((c,page)=>page===HELDOUT_PAGE?[]:
        inferPage(c,emit,limit));
    }
    const n=paths.reduce((s,p)=>s+p.length,0);
    let good=0;
    for(let p=0;p<pages.length;p++)
      for(let i=0;i<paths[p].length;i++)
        if(paths[p][i]===data.truePaths[p][i])good++;
    trace.push({prefix:limit,observations:n,
      pathAccuracy:good/n});
  }
  assert.equal(paths[HELDOUT_PAGE].length,0);
  const fitted=trainTable(pages,paths);
  const firstTable=fitted.inverseTableau;
  // Refinement is still blind: correct planted table and key rows are NOT read.
  // Source-language row emissions are recomputed from fitted inverse permutations.
  let fitted2=fitted;
  for(let k=0;k<2;k++){
    const emit=emissionFromTable(fitted2.inverseTableau);
    paths=pages.map((c,page)=>page===HELDOUT_PAGE?[]:
      inferPage(c,emit));
    fitted2=trainTable(pages,paths);
  }
  const estimatedTable=fitted2.inverseTableau;
  const heldoutPath=inferPage(pages[HELDOUT_PAGE],
    emissionFromTable(estimatedTable));
  const heldoutPlain=pages[HELDOUT_PAGE].map((c,i)=>
    estimatedTable[primeRows[i+heldoutPath[i]]][c]);
  const expectedPlain=data.plain.slice(pageStart[HELDOUT_PAGE],
    pageStart[HELDOUT_PAGE]+PAGE_LENGTHS[HELDOUT_PAGE]);
  let heldoutCorrect=0;
  for(let i=0;i<heldoutPlain.length;i++)
    if(heldoutPlain[i]===expectedPlain[i])heldoutCorrect++;
  const spanCorrect=heldoutPlain.slice(0,150)
    .filter((x,i)=>x===expectedPlain[i]).length;
  let pathCorrect=0,pathTotal=0,heldoutPathCorrect=0;
  for(let p=0;p<pages.length;p++){
    if(p===HELDOUT_PAGE)continue;
    for(let i=0;i<paths[p].length;i++){
      pathTotal++;
      if(paths[p][i]===data.truePaths[p][i])pathCorrect++;
    }
  }
  for(let i=0;i<heldoutPath.length;i++)
    if(heldoutPath[i]===data.truePaths[HELDOUT_PAGE][i])
      heldoutPathCorrect++;
  let tableCorrect=0;
  const actualInverse=data.table.map(row=>{
    const inverse=new Array(N);
    row.forEach((c,p)=>inverse[c]=p);
    return inverse;
  });
  for(let r=0;r<N;r++)for(let c=0;c<N;c++)
    if(estimatedTable[r][c]===actualInverse[r][c])tableCorrect++;
  return {heldoutPage:HELDOUT_PAGE,heldoutRunes:heldoutPlain.length,
    heldoutCorrect,heldoutFirst150:spanCorrect,
    heldoutBigramLog:scoreLanguage(heldoutPlain),
    heldoutSkipCertificate:checkSkipped(pages[HELDOUT_PAGE],heldoutPath,
      heldoutPlain,estimatedTable),
    trainingKeyPathCorrect:pathCorrect,trainingKeyPathTotal:pathTotal,
    heldoutKeyPathCorrect:heldoutPathCorrect,
    tableExactCells:tableCorrect,tableCells:N*N,
    prefixTrace:trace};
}

const tests=[];
for(let t=0;t<TRIALS;t++){
  const seed=(0x3301abcd+t*1013904223)>>>0;
  const plantData=plant(seed),test=solve(plantData);
  tests.push({trial:t,seed,hiddenSkipRows:plantData.skips,
    hiddenLargestSingleSkip:plantData.maxLocal,...test});
  console.log('H2 BLIND CALIBRATION '+JSON.stringify(tests.at(-1)));
}
const mean=key=>tests.reduce((s,x)=>s+x[key],0)/tests.length;
console.log(JSON.stringify({
  status:'calibrated joint-blind H2 source-shaped original-page-reset experiment',
  caveat:'Source author has not selected page resets or a shared random 841-cell tableau; no unknown LP2 plaintext is claimed.',
  trials:TRIALS,perTrialSourceRunes:LENGTH,
  originalPageLengths:PAGE_LENGTHS,heldoutPhysicalPage:HELDOUT_PAGE,
  trainedCiphertextExcludesEntireHeldoutPage:true,
  plaintextModel:'Gibran native-GP planted; Shakespeare native-GP independent reference',
  sourcePrimeClock:'prime2 restart on each original physical page',
  priorSkipProbabilities:[.972,.0272,.0008,.000022,.00000062],
  meanHiddenAdvances:mean('hiddenSkipRows'),
  meanTrainingKeyAccuracy:mean('trainingKeyPathCorrect')/
    (LENGTH-PAGE_LENGTHS[HELDOUT_PAGE]),
  meanHeldoutKeyAccuracy:mean('heldoutKeyPathCorrect')/
    PAGE_LENGTHS[HELDOUT_PAGE],
  meanTableCellAccuracy:mean('tableExactCells')/(N*N),
  meanHeldoutPlainAccuracy:mean('heldoutCorrect')/
    PAGE_LENGTHS[HELDOUT_PAGE],
  meanHeldoutFirst150Accuracy:mean('heldoutFirst150')/150,
  meanHeldoutBigramLog:mean('heldoutBigramLog'),
  results:tests.map(({prefixTrace,...rest})=>rest)
},null,2));


/** @param {number[]} sequence */
function scoreLanguage(sequence){
  let total=0;
  for(let i=1;i<sequence.length;i++)
    total+=model.logProb[sequence[i-1]][sequence[i]];
  return total/(sequence.length-1);
}

/**
 * An inferred path is authentic only when every rejected interim
 * ciphertext equals the previously emitted ciphertext. An exact
 * accepted-symbol table inverse is automatic and is not proof of a key.
 * @param {number[]} cipher
 * @param {number[]} drift
 * @param {number[]} plain
 * @param {number[][]} inverse
 */
function checkSkipped(cipher,drift,plain,inverse){
  const fwd=inverse.map(row=>{
    const out=new Array(N);
    row.forEach((p,c)=>out[p]=c);
    return out;
  });
  let skips=0,failed=0;
  for(let i=1;i<drift.length;i++){
    for(let d=drift[i-1];d<drift[i];d++){
      skips++;
      if(fwd[primeRows[i+d]][plain[i]]!==cipher[i-1])failed++;
    }
  }
  return {skips,failed};
}

/**
 * Frozen unmodified original-LP2 negative/positive-receiver gate:
 * train without seeing source physical p41 ciphertext, then decode that
 * page once. English plausibility alone is weak; exact skipped-row
 * consistency is an independent key-changing constraint.
 */
function originalBlindGate(){
  const pages=gp.pages.filter(p=>p.page<=55).map(p=>p.indices);
  assert.deepEqual(pages.map(p=>p.length),PAGE_LENGTHS);
  let paths=pages.map(c=>Array(Math.min(c.length,3)).fill(0));
  for(const limit of [3,4,5,7,10,15,20,30,45,60,80,110,150,200,300]){
    for(let sweep=0;sweep<3;sweep++){
      const emit=learnEmissions(pages,paths,limit);
      paths=pages.map((c,page)=>page===HELDOUT_PAGE?[]:
        inferPage(c,emit,limit));
    }
  }
  let fitted=trainTable(pages,paths);
  for(let iteration=0;iteration<2;iteration++){
    const emit=emissionFromTable(fitted.inverseTableau);
    paths=pages.map((c,page)=>page===HELDOUT_PAGE?[]:
      inferPage(c,emit));
    fitted=trainTable(pages,paths);
  }
  const table=fitted.inverseTableau;
  const heldout=pages[HELDOUT_PAGE];
  const heldoutPath=inferPage(heldout,emissionFromTable(table));
  const text=heldout.map((c,i)=>table[primeRows[i+heldoutPath[i]]][c]);
  const skipped=checkSkipped(heldout,heldoutPath,text,table);
  const trainingPlain=[];
  for(let p=0;p<pages.length;p++){
    if(p===HELDOUT_PAGE)continue;
    for(let i=0;i<pages[p].length;i++)
      trainingPlain.push(table[primeRows[i+paths[p][i]]][pages[p][i]]);
  }
  return {
    status:'ONE source-frozen original receiver attempt, no fit to heldout page',
    originalRunes:LENGTH,trainingRunes:trainingPlain.length,
    withheldPage:HELDOUT_PAGE,withheldRunes:heldout.length,
    trainingBigramLog:scoreLanguage(trainingPlain),
    withheldBigramLog:scoreLanguage(text),
    withheldRawCipherBigramLog:scoreLanguage(heldout),
    withheldSkipCertificate:skipped,
    inferredWithheldHiddenExtraKeys:heldoutPath.at(-1),
    withheldCandidateFirst150: text.slice(0,150)
      .map(i=>gp.translit[i]).join(''),
    verdict:'A candidate is a real original-cipher inverse only if all rejected-row checks pass AND independently withheld native plaintext is coherent. Fitting and round-tripping a bijective table is not a decryption.'
  };
}
console.log(JSON.stringify({
  syntheticCalibration: {
    mean150:mean('heldoutFirst150')/150,
    meanBigramLog:mean('heldoutBigramLog'),
    maxPositiveFailedSkipChecks:Math.max(...tests.map(
      t=>t.heldoutSkipCertificate.failed))
  },
  originalAttempt:originalBlindGate()
},null,2));


// Independent enhanced realism controls: preserve all 2896 actual printed
// word lengths and all 83 source singleton sites, with no new inference
// knobs or original-cipher plaintext access. The original p41 result above
// is unchanged because the authentic receiver is completely frozen.
const wordShaped=[];
for(let t=0;t<2;t++){
  const seed=(0x3301abcd+t*1013904223)>>>0;
  const data=plant(seed,true);
  const tested=solve(data);
  wordShaped.push({trial:t,seed,actualHiddenAdvances:data.skips,
    allOriginalWordLengths:true,originalSingletonCount:83,
    ...tested});
  console.log('H2 WORD-LENGTH SHAPED '+JSON.stringify(wordShaped.at(-1)));
}
console.log(JSON.stringify({
  status:'second independent source-word-length exact blind-H2 calibration',
  tests:wordShaped,
  excludedOriginalP41AllTraining:true,
  caveat:'The 841-cell shared secret and physical-page clock resets are still unselected by the original artifact; this is a synthetic positive only.'
},null,2));
