'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),MOD=29;
const mod=x=>((x%MOD)+MOD)%MOD;
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const H4=v=>[mod(v[0]-v[3]),mod(v[1]-v[2]),mod(v[1]+v[2]),mod(v[0]+v[3])];
const powMod=(base,exp,m)=>{let b=base%m,e=exp,r=1;while(e){if(e&1)r=r*b%m;b=b*b%m;e=Math.floor(e/2);}return r;};
const dlog=(base,target,m)=>{let x=1;for(let e=0;e<m-1;e++){if(x===target)return e;x=x*base%m;}throw Error('dlog');};
const inv=(x,m=29)=>{for(let y=1;y<m;y++)if((x*y)%m===1)return y;throw Error('inverse');};
function inverseGF29(matrix){
  const n=matrix.length,rows=matrix.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));
  let determinant=1;
  for(let c=0;c<n;c++){
    let pivot=-1;for(let r=c;r<n;r++)if(rows[r][c]){pivot=r;break;}assert(pivot>=0);
    if(pivot!==c){[rows[pivot],rows[c]]=[rows[c],rows[pivot]];determinant=mod(-determinant);}
    const lead=rows[c][c];determinant=mod(determinant*lead);const scale=inv(lead);
    rows[c]=rows[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c){const f=rows[r][c];rows[r]=rows[r].map((x,j)=>mod(x-f*rows[c][j]));}
  }
  return {determinant,inverse:rows.map(r=>r.slice(n))};
}
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));

// P15 Phase A lower red11 only.
const p15=corpus.pages.find(p=>p.page===15),lowerRunes=p15.indices.slice(9,20);
const desc=(vals,lengths)=>{let at=0;return lengths.map(L=>{const w=vals.slice(at,at+L);at+=L;return{L,S:sum(w),P:product(w)};});};
const lower=desc(lowerRunes,[4,2,5]);
assert.deepEqual(lower,[{L:4,S:22,P:10},{L:2,S:6,P:5},{L:5,S:5,P:0}]);
const K=lower[1].L,a=lower[1].S,g=lower[1].P,q=lower[0].L,F=lower[2].P,p=lower[0].S+1;
assert.deepEqual([p,K,g,q,F],[23,2,5,4,0]);
assert.equal(powMod(g,a,p),8);

// Same color-blind p15 grid predicate used by the independent p15 result.
const grid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const residues=grid.map(r=>r.map(x=>x%29));
const cols=Array.from({length:4},(_,c)=>H4(Array.from({length:4},(_,r)=>residues[r][c])));
const hits=cols.filter(v=>v[0]===mod(p-g)&&v[2]===mod(a*K)&&v[3]===K);
assert.equal(hits.length,1);
const B=hits[0][1],b=dlog(g,B,p),e=inv(b,p-1);
assert.deepEqual([B,b,e],[19,15,3]);
assert.equal(powMod(B,a,p),K);
const p15Predicted=[p,K,g,K,B];
assert.deepEqual(p15Predicted,[23,2,5,2,19]);

// P7 original red products.
const p7=corpus.pages.find(p=>p.page===7);
const redWords=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redWords.map(product);
assert.deepEqual(products,[11,26,8,15,2]);
const circulant=row=>Array.from({length:5},(_,i)=>Array.from({length:5},(_,k)=>row[(k-i+5)%5]));
const actual=inverseGF29(circulant(products));
assert.equal(actual.determinant,B);
assert.deepEqual(actual.inverse[0],p15Predicted);

// Charge five cyclic starts and both printed/reversed orientation.
const variants=[];
for(const reversed of [false,true]){
  const base=reversed?products.slice().reverse():products.slice();
  for(let rotation=0;rotation<5;rotation++){
    const row=base.slice(rotation).concat(base.slice(0,rotation));
    const trial=inverseGF29(circulant(row));
    variants.push({reversed,rotation,row,determinant:trial.determinant,firstRow:trial.inverse[0],match:trial.inverse[0].every((x,i)=>x===p15Predicted[i])});
  }
}
const matches=variants.filter(v=>v.match);
assert.deepEqual(matches.map(v=>[v.reversed,v.rotation]),[[false,0]]);

const H5=v=>[mod(v[0]-v[4]),mod(v[1]-v[3]),mod(v[2]),mod(v[1]+v[3]),mod(v[0]+v[4])];

// Independent chapter-IN register from the red-rubric SUM->PRODUCT route.
// Reconstruct the first complete black word after each opening red rubric.
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const chapterIns=[],chapterWordLengths=[],chapterProducts=[];
for(const page of chapterStarts){
  const ann=ink.pages.find(x=>x.page===page);
  assert.ok(ann&&ann.red_spans&&ann.red_spans.length);
  const spans=ann.red_spans.slice().sort((x,y)=>x.start-y.start);
  assert.equal(spans[0].start,0);
  let redEnd=spans[0].length;
  for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)redEnd+=spans[i].length;
  const source=corpus.pages.find(x=>x.page===page).indices;
  const segment=parts[page>=51?page-1:page];
  const words=[];let word=[],start=0,offset=0;
  const flush=()=>{if(word.length){words.push({start,values:word.slice()});word=[];}};
  for(const ch of segment){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      if(!word.length)start=offset;
      assert.equal(source[offset],value);
      word.push(value);offset++;
    }else if(ch==='/'||/\s/u.test(ch)) continue;
    else flush();
  }
  flush();
  const firstBlack=words.find(w=>w.start===redEnd);
  assert.ok(firstBlack,'missing first-black word p'+page);
  chapterIns.push(sum(firstBlack.values));
  chapterWordLengths.push(firstBlack.values.length);
  chapterProducts.push(product(firstBlack.values));
}
assert.deepEqual(chapterIns,[15,9,23,22,25,2,5,27,19]);
assert.deepEqual(chapterWordLengths,[4,4,3,4,8,7,2,5,8]);
assert.deepEqual(chapterProducts,[23,11,2,13,16,19,3,3,27]);

// The next chapter start fixes each physical chapter span; p54 ends before
// solved p56, so terminal boundary56 is source-visible and not fitted.
const boundaries=chapterStarts.slice(1).concat(56);
const chapterLengths=chapterStarts.map((p,i)=>boundaries[i]-p);
assert.deepEqual(chapterLengths,[3,5,7,8,4,6,7,14,2]);
const lengthByIn=new Map(chapterIns.map((x,i)=>[x,chapterLengths[i]]));
const itineraryLengths=actual.inverse[0].map(x=>lengthByIn.get(x));
assert.deepEqual(itineraryLengths,[7,6,7,6,2]);
const p15LengthTarget=[g,F,mod(K+g),mod(a*K),mod(q+g)];
assert.deepEqual(p15LengthTarget,[5,0,7,12,9]);
assert.deepEqual(H5(itineraryLengths),p15LengthTarget);

// A second geometric row is already fixed by the same chapter operands: the
// rune length of each first post-rubric black word used to define IN/OUT.
const wordLengthByIn=new Map(chapterIns.map((x,i)=>[x,chapterWordLengths[i]]));
const itineraryWordLengths=actual.inverse[0].map(x=>wordLengthByIn.get(x));
assert.deepEqual(itineraryWordLengths,[3,7,2,7,8]);
const p15WordLengthTarget=[mod(-g),F,K,mod(-b),inv(8)];
assert.deepEqual(p15WordLengthTarget,[24,0,2,14,11]);
assert.deepEqual(H5(itineraryWordLengths),p15WordLengthTarget);

// Third typed row from exactly the same first-black words: GP29 products.
const productByIn=new Map(chapterIns.map((x,i)=>[x,chapterProducts[i]]));
const itineraryProducts=actual.inverse[0].map(x=>productByIn.get(x));
assert.deepEqual(itineraryProducts,[2,19,3,19,27]);
const p15ProductTarget=[q,F,e,mod(e+a),F];
assert.deepEqual(p15ProductTarget,[4,0,3,9,0]);
assert.deepEqual(H5(itineraryProducts),p15ProductTarget);

// On the actual chapter map, only printed p7 ring orientation reproduces all
// source-defined channels. Span+length already make the orientation unique;
// product is a held-out corroborating row rather than an added orientation win.
// p15 lower-red-derived H5 targets.
const ringLengthMatches=[];
for(const variant of variants){
  if(!variant.firstRow.every(x=>lengthByIn.has(x)))continue;
  const seq=variant.firstRow.map(x=>lengthByIn.get(x));
  const words=variant.firstRow.map(x=>wordLengthByIn.get(x));
  const products=variant.firstRow.map(x=>productByIn.get(x));
  if(H5(seq).every((x,i)=>x===p15LengthTarget[i])&&
     H5(words).every((x,i)=>x===p15WordLengthTarget[i])&&
     H5(products).every((x,i)=>x===p15ProductTarget[i]))
    ringLengthMatches.push([variant.reversed,variant.rotation,seq,words,products]);
}
assert.deepEqual(ringLengthMatches,[[false,0,[7,6,7,6,2],[3,7,2,7,8],[2,19,3,19,27]]]);

// Fixed-marginal charge: preserve the nine observed IN labels and nine
// observed chapter-span records, permute their assignments, and hold the p7
// inverse row plus p15 H5 target fixed. This is a conditional diagnostic.
let assignmentHits=0,jointAssignmentHits=0,tripleAssignmentHits=0,totalAssignments=0;
const records=chapterLengths.map((span,i)=>[span,chapterWordLengths[i],chapterProducts[i]]);
const perm=records.slice();
function enumerate(at){
  if(at===perm.length){
    totalAssignments++;
    const m=new Map(chapterIns.map((x,i)=>[x,perm[i]]));
    const seq=actual.inverse[0].map(x=>m.get(x)[0]);
    const words=actual.inverse[0].map(x=>m.get(x)[1]);
    const products=actual.inverse[0].map(x=>m.get(x)[2]);
    const spanOk=H5(seq).every((x,i)=>x===p15LengthTarget[i]);
    const wordOk=H5(words).every((x,i)=>x===p15WordLengthTarget[i]);
    const productOk=H5(products).every((x,i)=>x===p15ProductTarget[i]);
    if(spanOk)assignmentHits++;
    if(spanOk&&wordOk)jointAssignmentHits++;
    if(spanOk&&wordOk&&productOk)tripleAssignmentHits++;
    return;
  }
  for(let i=at;i<perm.length;i++){
    [perm[at],perm[i]]=[perm[i],perm[at]];
    enumerate(at+1);
    [perm[at],perm[i]]=[perm[i],perm[at]];
  }
}
enumerate(0);
assert.equal(totalAssignments,362880);
assert.equal(assignmentHits,240);
assert.equal(jointAssignmentHits,120);
assert.equal(tripleAssignmentHits,120);
console.log(JSON.stringify({
 classification:'original-only cross-holdout: independent p15 state predicts older p7 circulant inverse identity',
 p15Derived:{p,K,g,B,b,predictedInverseRow:p15Predicted},
 p7:{products,determinant:actual.determinant,inverseFirstRow:actual.inverse[0]},
 orientationCharge:{variants:variants.length,matches},
 chapterBridge:{chapterStarts,chapterIns,chapterLengths,chapterWordLengths,chapterProducts,itineraryLengths,h5:H5(itineraryLengths),p15LengthTarget,itineraryWordLengths,wordH5:H5(itineraryWordLengths),p15WordLengthTarget,itineraryProducts,productH5:H5(itineraryProducts),p15ProductTarget,ringLengthMatches,fixedMarginal:{spanHits:assignmentHits,jointHits:jointAssignmentHits,tripleHits:tripleAssignmentHits,total:totalAssignments,spanOneIn:totalAssignments/assignmentHits,jointOneIn:totalAssignments/jointAssignmentHits,tripleOneIn:totalAssignments/tripleAssignmentHits}},
 boundary:'strengthens shared state serialization and a typed p7-to-chapter handoff; does not authenticate circulant as the intended cipher opcode or recover plaintext'
},null,2));
