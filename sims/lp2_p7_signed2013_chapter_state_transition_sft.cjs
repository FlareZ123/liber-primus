'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * P7 -> chapter-map DH state transition anchored ONLY to Cicada's
 * authenticated 2013 TCP worked DH example, not to the p15 descriptor map.
 *
 * First-party worked transcript (documented with preserved-source provenance in
 * im-results/lp2-p15-signed2013-tcp-dual-example.md):
 *   C: DH 23
 *   S: 01 OK 5 8
 *   C: 19
 *   S: 03 DATA 2
 *
 * Thus the public worked tuple is (p,g,A,B,K)=(23,5,8,19,2).
 * The unique discrete logs give a=6,b=15; e=b^-1 mod(p-1)=3.
 *
 * This SFT then opens only original LP2 p7/chapter source structures:
 *   1) p7 five red-word GP29 products and its previously fixed right-circulant;
 *   2) the independently established chapter opening grammar whose first black
 *      word GP29 SUM is IN and GP29 PRODUCT is OUT.
 *
 * No p15 red descriptor, p15 grid, unknown plaintext, language score, or
 * fitted LP2 body key is read.
 */

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const MOD=29;
const mod=x=>((x%MOD)+MOD)%MOD;
const sum=v=>mod(v.reduce((a,b)=>a+b,0));
const product=v=>v.reduce((a,b)=>mod(a*b),1);
const powMod=(base,exp,m)=>{
  let b=base%m,e=exp,r=1;
  while(e){if(e&1)r=r*b%m;b=b*b%m;e=Math.floor(e/2);}
  return r;
};
const dlog=(base,target,m)=>{
  const hits=[];
  let x=1;
  for(let e=0;e<m-1;e++){if(x===target)hits.push(e);x=x*base%m;}
  return hits;
};
const inv=(x,m)=>{
  for(let y=1;y<m;y++)if(((x*y)%m+m)%m===1)return y;
  throw new Error('no inverse');
};
function inverseGF29(matrix){
  const n=matrix.length;
  const rows=matrix.map((r,i)=>r.map(mod).concat(
    Array.from({length:n},(_,j)=>Number(i===j))));
  let determinant=1;
  for(let c=0;c<n;c++){
    let pivot=-1;
    for(let r=c;r<n;r++)if(rows[r][c]){pivot=r;break;}
    assert(pivot>=0);
    if(pivot!==c){
      [rows[pivot],rows[c]]=[rows[c],rows[pivot]];
      determinant=mod(-determinant);
    }
    const lead=rows[c][c];
    determinant=mod(determinant*lead);
    const scale=inv(lead,29);
    rows[c]=rows[c].map(x=>mod(x*scale));
    for(let r=0;r<n;r++)if(r!==c){
      const factor=rows[r][c];
      rows[r]=rows[r].map((x,j)=>mod(x-factor*rows[c][j]));
    }
  }
  return {determinant,inverse:rows.map(r=>r.slice(n))};
}
const circulant=row=>Array.from({length:row.length},(_,i)=>
  Array.from({length:row.length},(_,k)=>row[(k-i+row.length)%row.length]));

// ---------- authenticated 2013 source state ----------
const signed2013=Object.freeze({p:23,g:5,A:8,B:19,K:2});
assert.deepEqual(dlog(signed2013.g,signed2013.A,signed2013.p),[6]);
assert.deepEqual(dlog(signed2013.g,signed2013.B,signed2013.p),[15]);
const a=6,b=15,e=inv(b,signed2013.p-1);
assert.equal(e,3);
assert.equal(powMod(signed2013.B,a,signed2013.p),signed2013.K);

// ---------- original p7 red products ----------
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const p7=corpus.pages.find(p=>p.page===7);
assert(p7);

// Fixed source offsets of the five printed red p7 words.
const p7RedWords=[
  p7.indices.slice(0,2),
  p7.indices.slice(2,6),
  p7.indices.slice(6,9),
  p7.indices.slice(9,11),
  p7.indices.slice(11,14),
];
// Cross-check against their canonical values to prevent silent offset drift.
assert.deepEqual(p7RedWords,[
  [23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]
]);
const p7Products=p7RedWords.map(product);
assert.deepEqual(p7Products,[11,26,8,15,2]);

const p7Matrix=inverseGF29(circulant(p7Products));
const signedTarget=[
  signed2013.p,signed2013.K,signed2013.g,signed2013.K,signed2013.B
];
assert.deepEqual(signedTarget,[23,2,5,2,19]);
assert.equal(p7Matrix.determinant,signed2013.B);
assert.deepEqual(p7Matrix.inverse[0],signedTarget);

// Charge every cyclic start and both printed/reversed ring directions against
// the authenticated source target.  No p15-derived target enters this charge.
const ringCharge=[];
for(const reversed of [false,true]){
  const base=reversed?p7Products.slice().reverse():p7Products.slice();
  for(let rotation=0;rotation<5;rotation++){
    const row=base.slice(rotation).concat(base.slice(0,rotation));
    const trial=inverseGF29(circulant(row));
    ringCharge.push({
      reversed,rotation,row,
      determinant:trial.determinant,
      firstRow:trial.inverse[0],
      match:trial.inverse[0].every((x,i)=>x===signedTarget[i])
    });
  }
}
assert.deepEqual(
  ringCharge.filter(x=>x.match).map(x=>[x.reversed,x.rotation]),
  [[false,0]]
);

// ---------- independently source-defined chapter IN -> OUT grammar ----------
const ink=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const transcription=fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8')
  .replace(/\r/g,'');
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const chapterStarts=[0,3,8,15,23,27,33,40,54];
const records=[];

for(const page of chapterStarts){
  const ann=ink.pages.find(x=>x.page===page);
  assert(ann&&ann.red_spans&&ann.red_spans.length);
  const spans=ann.red_spans.slice().sort((x,y)=>x.start-y.start);
  assert.equal(spans[0].start,0);
  let redEnd=spans[0].length;
  for(let i=1;i<spans.length&&spans[i].start===redEnd;i++)
    redEnd+=spans[i].length;

  const source=corpus.pages.find(x=>x.page===page).indices;
  const segment=parts[page>=51?page-1:page];
  const words=[];
  let word=[],start=0,offset=0;
  const flush=()=>{
    if(word.length){words.push({start,values:word.slice()});word=[];}
  };
  for(const ch of segment){
    const value=runeIndex.get(ch);
    if(value!==undefined){
      if(!word.length)start=offset;
      assert.equal(source[offset],value);
      word.push(value);
      offset++;
    }else if(ch==='/'||/\s/u.test(ch)){
      continue;
    }else{
      flush();
    }
  }
  flush();
  const firstBlack=words.find(w=>w.start===redEnd);
  assert(firstBlack,'missing first black word on p'+page);
  records.push({
    page,
    in:sum(firstBlack.values),
    out:product(firstBlack.values),
    wordLength:firstBlack.values.length
  });
}

assert.deepEqual(records.map(r=>[r.page,r.in,r.out]),[
  [0,15,23],[3,9,11],[8,23,2],[15,22,13],[23,25,16],
  [27,2,19],[33,5,3],[40,27,3],[54,19,27]
]);
const byIn=new Map(records.map(r=>[r.in,r]));
assert.equal(byIn.size,records.length);

const itinerary=signedTarget.map(x=>{
  const record=byIn.get(x);
  assert(record,'no chapter with IN='+x);
  return record;
});
assert.deepEqual(itinerary.map(r=>r.page),[8,27,33,27,54]);
assert.deepEqual(itinerary.map(r=>r.in),signedTarget);

// Crucial typed transition: the source-defined chapter OUTs are themselves
// exactly the next state row from the independently authenticated 2013 tuple.
const rawOut=itinerary.map(r=>r.out);
const rawTarget=[signed2013.K,signed2013.B,e,signed2013.B,mod(-signed2013.K)];
assert.deepEqual(rawTarget,[2,19,3,19,27]);
assert.deepEqual(rawOut,rawTarget);

// Charge the assignment of the nine whole observed chapter records to the
// nine observed IN labels.  This preserves all observed marginals/correlations
// and asks only how often the fixed signed-source p7 row gets this exact OUT.
let total=0,rawHits=0;
const perm=records.map(r=>({page:r.page,out:r.out,wordLength:r.wordLength}));
function enumerate(at){
  if(at===perm.length){
    total++;
    const mapping=new Map(records.map((r,i)=>[r.in,perm[i]]));
    const outs=signedTarget.map(x=>mapping.get(x).out);
    if(outs.every((x,i)=>x===rawTarget[i]))rawHits++;
    return;
  }
  for(let i=at;i<perm.length;i++){
    [perm[at],perm[i]]=[perm[i],perm[at]];
    enumerate(at+1);
    [perm[at],perm[i]]=[perm[i],perm[at]];
  }
}
enumerate(0);
assert.equal(total,362880);
assert.equal(rawHits,240);

console.log(JSON.stringify({
  schema:1,
  sourceAnchor:{
    authenticated2013WorkedDH:signed2013,
    derivedSecrets:{a,b,e},
    sharedSecretCheck:powMod(signed2013.B,a,signed2013.p)
  },
  p7:{
    products:p7Products,
    determinant:p7Matrix.determinant,
    inverseFirstRow:p7Matrix.inverse[0],
    orientationCharge:{
      tested:ringCharge.length,
      hits:ringCharge.filter(x=>x.match)
    }
  },
  chapterNavigation:{
    records,
    selectedPages:itinerary.map(r=>r.page),
    inputStateRow:signedTarget,
    outputStateRow:rawOut,
    expectedOutputStateRow:rawTarget,
    fixedMarginal:{hits:rawHits,total,oneIn:total/rawHits}
  },
  classification:
    'Original p7/chapter state transition independently anchored to authenticated 2013 DH example; no p15 descriptor-role map or unknown plaintext used.'
},null,2));
