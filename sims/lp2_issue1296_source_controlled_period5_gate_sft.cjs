'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
const A=29, gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const shakespeare=read('resources/control/shakespeare_first300k.txt');
const gibran=read('resources/control/gibran_prophet_58585.txt');
const lexiconText=read('resources/control/english_wordfreq_textblob.txt');
const runeIndex=new Map(gp.runes.map((g,i)=>[g,i]));
const delimiters=new Set(['-','.','&','$','§']);
const chunks=transcript.split('%');
const sourcePages=gp.pages.filter(p=>p.page<56&&p.indices.length>0);
assert.equal(chunks.length,57);
assert.equal(sourcePages.length,55);

function parseSegment(text){
  const words=[];let current=[];
  for(const glyph of [...text]){
    if(runeIndex.has(glyph))current.push(runeIndex.get(glyph));
    else if(delimiters.has(glyph)&&current.length){words.push(current);current=[];}
  }
  if(current.length)words.push(current);
  return words;
}
const records=[];let current=[],currentPages=[],pageSet=new Set();
for(let p=0;p<sourcePages.length;p++){
  assert.equal([...chunks[p]].filter(g=>runeIndex.has(g)).length,sourcePages[p].indices.length);
  for(const glyph of [...chunks[p]]){
    if(runeIndex.has(glyph)){current.push(runeIndex.get(glyph));currentPages.push(sourcePages[p].page);pageSet.add(sourcePages[p].page);}
    else if(delimiters.has(glyph)&&current.length){
      records.push({v:current,pages:currentPages,pageSet:[...pageSet]});
      current=[];currentPages=[];pageSet=new Set();
    }
  }
}
if(current.length)records.push({v:current,pages:currentPages,pageSet:[...pageSet]});
const runeCount=records.reduce((s,w)=>s+w.v.length,0);
assert.equal(records.length,2896);
assert.equal(runeCount,12956);
assert.equal(records.filter(w=>w.pageSet.length>1).length,32);

const translitOrder=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function toGP(original){
  const s=original.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith('ING',i)){out.push(21);i+=3;continue;}
    if(s.startsWith('IO',i)){out.push(27);i+=2;continue;}
    const match=translitOrder.find(x=>s.startsWith(x.s,i));
    assert.ok(match,'reference text must map into GP29');
    out.push(match.i);i+=match.s.length;
  }
  return out;
}
const modelWords=(shakespeare.match(/[A-Za-z]+/g)||[]).map(toGP);
assert.equal(modelWords.flat().length,217106);
const unigram=Array(A).fill(1),bigram=Array.from({length:A},()=>Array(A).fill(0));
for(const w of modelWords)for(let i=0;i<w.length;i++){unigram[w[i]]++;if(i)bigram[w[i-1]][w[i]]++;}
const unTotal=unigram.reduce((a,b)=>a+b,0);
const logU=unigram.map(n=>Math.log(n/unTotal));
const logB=bigram.map(row=>{const d=row.reduce((a,b)=>a+b,0)+A;return row.map(n=>Math.log((n+1)/d));});
const dictionary=new Set(lexiconText.split(/\r?\n/).filter(x=>x&&!x.startsWith(';')).map(x=>x.split(/\s+/)[0].toUpperCase()).filter(Boolean));
const gibranWords=(read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g)||[]).map(toGP);
const gibranBuckets=new Map();
for(const w of gibranWords){const b=gibranBuckets.get(w.length)||[];b.push(w);gibranBuckets.set(w.length,b);}
for(const w of records)assert.ok(gibranBuckets.has(w.v.length),'Gibran length missing: '+w.v.length);

function sameWords(a,b){return a.length===b.length&&a.every((w,i)=>w.length===b[i].length&&w.every((x,j)=>x===b[i][j]));}
function ioc(words){const f=Array(A).fill(0);let n=0;for(const w of words)for(const x of w){f[x]++;n++;}return f.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));}
function summarize(recs,plain){
  let score=0,hits=0,longest=0,run=0,adj=0,adjN=0,lag=0,lagN=0;
  for(let i=0;i<recs.length;i++){
    const w=plain[i],spelling=w.map(x=>gp.translit[x]).join('');
    if(dictionary.has(spelling)){hits++;run++;longest=Math.max(longest,run);}else run=0;
    for(let j=0;j<w.length;j++){
      score+=0.25*logU[w[j]];
      if(j){score+=logB[w[j-1]][w[j]];adjN++;if(w[j]===w[j-1])adj++;}
      if(j>=5){lagN++;if(w[j]===w[j-5])lag++;}
    }
  }
  const n=plain.reduce((s,w)=>s+w.length,0);
  return {words:recs.length,runes:n,score_per_rune:score/n,dictionary_hits:hits,longest_dictionary_run:longest,
    within_word_adjacent:adj+'/'+adjN,within_word_lag5:lag+'/'+lagN,ioc:ioc(plain)};
}
const train=records.filter(w=>w.pages[0]<40);
const holdout=records.filter(w=>w.pages[0]>=40&&w.pages[0]<54);
const tail=records.filter(w=>w.pages[0]>=54);
const original=records.map(w=>w.v);
const baseline=summarize(records,original);

function heights(L){const R=Math.ceil(L/5),r=L%5;return Array.from({length:5},(_,c)=>r===0?R:(c<r?R:R-1));}
function routeBase(recs,mode,initialOffset=0){
  let offset=initialOffset;const bases=[],phases=[];
  for(const rec of recs){
    const h=heights(rec.v.length),R=Math.ceil(rec.v.length/5),grid=Array.from({length:5},()=>Array(R));let k=0;
    for(let r=0;r<R;r++)for(let c=0;c<5;c++)if(r<h[c])grid[c][r]={x:rec.v[k++],p:mode==='word-reset'?c:(offset+c)%5};
    const b=[],p=[];for(let c=0;c<5;c++)for(let r=0;r<h[c];r++){b.push(grid[c][r].x);p.push(grid[c][r].p);}
    bases.push(b);phases.push(p);offset+=rec.v.length;
  }
  return {bases,phases,cyclic:mode==='continuous'};
}
function routeEncode(words,key,mode,initialOffset=0){
  let offset=initialOffset;
  return words.map(w=>{
    const h=heights(w.length),R=Math.ceil(w.length/5),grid=Array.from({length:5},()=>Array(R));let k=0;
    for(let c=0;c<5;c++)for(let r=0;r<h[c];r++){const p=mode==='word-reset'?c:(offset+c)%5;grid[c][r]=(w[k++]+key[p])%A;}
    const out=[];for(let r=0;r<R;r++)for(let c=0;c<5;c++)if(r<h[c])out.push(grid[c][r]);
    offset+=w.length;return out;
  });
}
function routeDecode(words,key,mode,initialOffset=0){
  let offset=initialOffset;
  return words.map(w=>{
    const h=heights(w.length),R=Math.ceil(w.length/5),grid=Array.from({length:5},()=>Array(R));let k=0;
    for(let r=0;r<R;r++)for(let c=0;c<5;c++)if(r<h[c])grid[c][r]=w[k++];
    const out=[];for(let c=0;c<5;c++)for(let r=0;r<h[c];r++){const p=mode==='word-reset'?c:(offset+c)%5;out.push((grid[c][r]-key[p]+A)%A);}
    offset+=w.length;return out;
  });
}
function feedbackBase(recs,fiveMode,keyMode,initialPhase=0){
  let previous=0,stateIndex=0,phaseIndex=initialPhase;const history=Array(5).fill(0),bases=[],phases=[];
  for(const rec of recs){
    const b=[],p=[];
    for(let j=0;j<rec.v.length;j++){
      const five=fiveMode==='word-local'?(j>=5?rec.v[j-5]:0):(stateIndex>=5?history[(stateIndex-5)%5]:0);
      const x=(rec.v[j]-previous+five+2*A)%A;
      b.push(x);p.push(keyMode==='word-reset'?j%5:phaseIndex%5);
      history[stateIndex%5]=rec.v[j];previous=rec.v[j];stateIndex++;phaseIndex++;
    }
    bases.push(b);phases.push(p);
  }
  return {bases,phases,cyclic:true};
}
function feedbackEncode(words,key,fiveMode,keyMode,initialPhase=0){
  let previous=0,stateIndex=0,phaseIndex=initialPhase;const history=Array(5).fill(0);
  return words.map(w=>{
    const out=[];
    for(let j=0;j<w.length;j++){
      const five=fiveMode==='word-local'?(j>=5?out[j-5]:0):(stateIndex>=5?history[(stateIndex-5)%5]:0);
      const phase=keyMode==='word-reset'?j%5:phaseIndex%5;
      const c=(w[j]+previous-five+key[phase]+2*A)%A;
      out.push(c);history[stateIndex%5]=c;previous=c;stateIndex++;phaseIndex++;
    }
    return out;
  });
}
function feedbackDecode(words,key,fiveMode,keyMode,initialPhase=0){
  let previous=0,stateIndex=0,phaseIndex=initialPhase;const history=Array(5).fill(0);
  return words.map(w=>{
    const out=[];
    for(let j=0;j<w.length;j++){
      const five=fiveMode==='word-local'?(j>=5?w[j-5]:0):(stateIndex>=5?history[(stateIndex-5)%5]:0);
      const phase=keyMode==='word-reset'?j%5:phaseIndex%5;
      out.push((w[j]-previous+five-key[phase]+4*A)%A);
      history[stateIndex%5]=w[j];previous=w[j];stateIndex++;phaseIndex++;
    }
    return out;
  });
}
function optimize(base,phases,cyclic){
  const unary=Array.from({length:5},()=>Array(A).fill(0));
  const edge=Array.from({length:5},()=>Array.from({length:A},()=>Array(A).fill(0)));
  for(let wi=0;wi<base.length;wi++)for(let j=0;j<base[wi].length;j++){
    const p=phases[wi][j],x=base[wi][j];
    for(let k=0;k<A;k++)unary[p][k]+=0.25*logU[(x-k+A)%A];
    if(j){
      const q=phases[wi][j-1],y=base[wi][j-1];
      if(p===q){for(let k=0;k<A;k++)unary[p][k]+=logB[(y-k+A)%A][(x-k+A)%A];}
      else{
        assert.equal(p,cyclic?(q+1)%5:q+1);
        for(let k=0;k<A;k++)for(let l=0;l<A;l++)edge[q][k][l]+=logB[(y-k+A)%A][(x-l+A)%A];
      }
    }
  }
  if(!cyclic){
    let dp=unary[0].slice();const parents=[];
    for(let p=1;p<5;p++){
      const next=Array(A).fill(-Infinity),back=Array(A).fill(-1);
      for(let k=0;k<A;k++)for(let l=0;l<A;l++){const v=dp[k]+edge[p-1][k][l]+unary[p][l];if(v>next[l]){next[l]=v;back[l]=k;}}
      dp=next;parents.push(back);
    }
    const key=Array(5);key[4]=dp.indexOf(Math.max(...dp));
    for(let p=4;p>=1;p--)key[p-1]=parents[p-1][key[p]];
    return {key,score:Math.max(...dp)};
  }
  let best=-Infinity,bestKey=null;
  for(let s0=0;s0<A;s0++){
    let dp=Array(A).fill(-Infinity);dp[s0]=unary[0][s0];const parents=[];
    for(let p=1;p<5;p++){
      const next=Array(A).fill(-Infinity),back=Array(A).fill(-1);
      for(let k=0;k<A;k++)for(let l=0;l<A;l++){const v=dp[k]+edge[p-1][k][l]+unary[p][l];if(v>next[l]){next[l]=v;back[l]=k;}}
      dp=next;parents.push(back);
    }
    for(let s4=0;s4<A;s4++){
      const score=dp[s4]+edge[4][s4][s0];
      if(score>best){const key=Array(5);key[0]=s0;key[4]=s4;for(let p=4;p>=1;p--)key[p-1]=parents[p-1][key[p]];best=score;bestKey=key;}
    }
  }
  return {key:bestKey,score:best};
}
function optimizeRoute(recs,mode){const f=routeBase(recs,mode);return optimize(f.bases,f.phases,f.cyclic);}
function optimizeFeedback(recs,fiveMode,keyMode){const f=feedbackBase(recs,fiveMode,keyMode);return optimize(f.bases,f.phases,true);}

let seedBase=0x12345678;
function makePlant(seed){
  let state=seed>>>0;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  return records.map(rec=>{const pool=gibranBuckets.get(rec.v.length);return pool[Math.floor(rand()*pool.length)];});
}
const hiddenKeys=[[21,12,19,6,7],[12,27,28,0,5],[5,10,25,14,28],[19,20,15,19,3],[16,22,18,5,14],[9,15,6,14,6],[14,15,28,3,27],[17,0,16,6,17]];
function testRoute(mode){
  const fit=optimizeRoute(train,mode),decoded=routeDecode(original,fit.key,mode);
  assert.ok(sameWords(routeEncode(decoded,fit.key,mode),original));
  const controls=[];
  for(let i=0;i<8;i++){
    const plant=makePlant(seedBase+i*7919),cipher=routeEncode(plant,hiddenKeys[i],mode);
    const found=optimizeRoute(cipher.map(v=>({v,pages:[]})),mode),plain=routeDecode(cipher,found.key,mode);
    const exact=sameWords(plain,plant),keyExact=found.key.every((x,j)=>x===hiddenKeys[i][j]);
    assert.ok(exact&&keyExact);controls.push({key_exact:keyExact,runes:plain.flat().length});
  }
  const report=predicate=>{const chosen=records.map((r,i)=>({r,p:decoded[i]})).filter(x=>predicate(x.r));return summarize(chosen.map(x=>x.r),chosen.map(x=>x.p));};
  return {key:fit.key,train_score_per_rune:fit.score/train.reduce((s,w)=>s+w.v.length,0),
    train:report(w=>w.pages[0]<40),holdout:report(w=>w.pages[0]>=40&&w.pages[0]<54),tail:report(w=>w.pages[0]>=54),
    original_forward_exact:true,planted_controls_exact:controls.length,controls};
}
function testFeedback(fiveMode,keyMode){
  const fit=optimizeFeedback(train,fiveMode,keyMode),decoded=feedbackDecode(original,fit.key,fiveMode,keyMode);
  assert.ok(sameWords(feedbackEncode(decoded,fit.key,fiveMode,keyMode),original));
  const controls=[];
  for(let i=0;i<8;i++){
    const plant=makePlant(seedBase+100000+i*7919);
    const cipher=feedbackEncode(plant,hiddenKeys[i],fiveMode,keyMode);
    const found=optimizeFeedback(cipher.map(v=>({v,pages:[]})),fiveMode,keyMode);
    const plain=feedbackDecode(cipher,found.key,fiveMode,keyMode);
    const exact=sameWords(plain,plant),keyExact=found.key.every((x,j)=>x===hiddenKeys[i][j]);
    assert.ok(exact&&keyExact);controls.push({key_exact:keyExact,runes:plain.flat().length});
  }
  const report=predicate=>{const chosen=records.map((r,i)=>({r,p:decoded[i]})).filter(x=>predicate(x.r));return summarize(chosen.map(x=>x.r),chosen.map(x=>x.p));};
  return {five_back_clock:fiveMode,key_clock:keyMode,key:fit.key,train_score_per_rune:fit.score/train.reduce((s,w)=>s+w.v.length,0),
    train:report(w=>w.pages[0]<40),holdout:report(w=>w.pages[0]>=40&&w.pages[0]<54),tail:report(w=>w.pages[0]>=54),
    original_forward_exact:true,planted_controls_exact:controls.length,controls};
}

// Authentic solved controls: the original p56 transparent-F prime/totient
// page, the six LP1 clear-GP pages, and LP2 p57.
const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const lp1RuneCounts=lp1.slice(0,15).map(s=>[...s].filter(g=>runeIndex.has(g)).length);
const lp1Segments=[
  {name:'LP1 p3',words:parseSegment(lp1[3]),offset:lp1RuneCounts.slice(0,3).reduce((a,b)=>a+b,0)},
  {name:'LP1 p8-p11',words:parseSegment(lp1.slice(8,12).join('')),offset:lp1RuneCounts.slice(0,8).reduce((a,b)=>a+b,0)},
  {name:'LP1 p14',words:parseSegment(lp1[14]),offset:lp1RuneCounts.slice(0,14).reduce((a,b)=>a+b,0)}
];
assert.deepEqual(lp1Segments.map(x=>x.words.flat().length),[157,755,89]);
assert.equal(lp1Segments.reduce((s,x)=>s+x.words.flat().length,0),1001);
const p56Text='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56Words=p56Text.split(' ').map(toGP);
const p56Cipher=gp.pages.find(p=>p.page===56).indices;
assert.equal(p56Words.length,25);assert.equal(p56Words.flat().length,85);
function primeTotients(count){
  const limit=180000,composite=new Uint8Array(limit),out=[];
  for(let p=2;p<limit&&out.length<count;p++){if(composite[p])continue;out.push((p-1)%A);if(p*p<limit)for(let k=p*p;k<limit;k+=p)composite[k]=1;}
  assert.equal(out.length,count);return out;
}
const p56Key=primeTotients(1000);let used=0;
const p56Reencrypted=p56Words.flat().map(p=>p===0?0:(p+p56Key[used++])%A);
assert.deepEqual(p56Reencrypted,p56Cipher);
assert.equal(p56Words.flat().filter(x=>x===0).length,1);
assert.equal(p56Cipher.filter(x=>x===0).length,5);
assert.equal(used,84);
const p57Words=parseSegment(chunks[56]);
assert.equal(p57Words.flat().length,95);assert.equal(p57Words.length,20);
const lp2Offsets={
  p56:gp.pages.filter(p=>p.page<56).reduce((s,p)=>s+p.indices.length,0),
  p57:gp.pages.filter(p=>p.page<57).reduce((s,p)=>s+p.indices.length,0)
};
const sourceSegments=[
  ...lp1Segments,
  {name:'LP2 p56 known plaintext',words:p56Words,offset:lp2Offsets.p56},
  {name:'LP2 p57 clear GP',words:p57Words,offset:lp2Offsets.p57}
];
const routeSourceControls=[];
for(const segment of sourceSegments)for(const mode of ['word-reset','continuous']){
  const key=[21,12,19,6,7],cipher=routeEncode(segment.words,key,mode,segment.offset);
  routeSourceControls.push({segment:segment.name,mode,exact:sameWords(routeDecode(cipher,key,mode,segment.offset),segment.words)});
}
const feedbackSourceControls=[];
for(const segment of sourceSegments)for(const fiveMode of ['word-local','global'])for(const keyMode of ['word-reset','continuous']){
  const key=[12,27,28,0,5],cipher=feedbackEncode(segment.words,key,fiveMode,keyMode,segment.offset);
  feedbackSourceControls.push({segment:segment.name,five_back_clock:fiveMode,key_clock:keyMode,
    exact:sameWords(feedbackDecode(cipher,key,fiveMode,keyMode,segment.offset),segment.words)});
}
assert.ok(routeSourceControls.every(x=>x.exact));
assert.ok(feedbackSourceControls.every(x=>x.exact));

const routeResults=[testRoute('word-reset'),testRoute('continuous')];
const feedbackResults=[];
for(const fiveMode of ['word-local','global'])for(const keyMode of ['word-reset','continuous'])
  feedbackResults.push(testFeedback(fiveMode,keyMode));

console.log(JSON.stringify({
  type:'lp2_issue1296_source_controlled_period5_gate',
  source:{lp2_words:records.length,lp2_runes:runeCount,carried_words:records.filter(w=>w.pageSet.length>1).length,
    training_words:train.length,training_runes:train.reduce((s,w)=>s+w.v.length,0),
    holdout_words:holdout.length,holdout_runes:holdout.reduce((s,w)=>s+w.v.length,0),
    tail_words:tail.length,tail_runes:tail.reduce((s,w)=>s+w.v.length,0),shakespeare_gp_runes:modelWords.flat().length},
  baseline,
  authentic_controls:{
    p56_transparent_F:{plaintext_runes:85,words:25,plaintext_F:1,ciphertext_F:5,prime_totient_forward_exact:true,prime_values_consumed:used},
    lp1_clear_GP:{pages:[3,8,9,10,11,14],runes:1001,segments:lp1Segments.map(x=>({name:x.name,words:x.words.length,runes:x.words.flat().length,phase_offset:x.offset}))},
    lp2_p57_clear_GP:{words:20,runes:95,phase_offset:lp2Offsets.p57},
    route_roundtrips:routeSourceControls.length,route_all_exact:routeSourceControls.every(x=>x.exact),
    feedback_roundtrips:feedbackSourceControls.length,feedback_all_exact:feedbackSourceControls.every(x=>x.exact)
  },
  candidate_A_five_column_route_plus_period5_key:routeResults,
  candidate_B_two_tap_feedback_plus_period5_key:feedbackResults
},null,2));
