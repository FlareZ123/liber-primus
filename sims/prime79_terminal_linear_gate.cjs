'use strict';
/**
 * An EXACT, KEY-INDEPENDENT exclusion for terminal padded GP runes in the
 * phase35 79-output/78-input predecessor-excluded base28 packet model.
 *
 * For any clean 79-digit base28 packet, let pi(C) be an arbitrary secret
 * cyclic position of the published GP glyph. The final source base29 digit is
 *
 *   P[77] = pi(C[78]) + 2 sum_{j=0}^{77} (-1)^j pi(C[j])
 *           - pi(C[-1]) - 1  (mod29).
 *
 * This follows because 28 = -1 mod29. A constant last plaintext rune
 * per book, section, page or periodic packet key class forces a homogeneous
 * GF29 linear system after adding one unknown class label b=P[77]+1.
 * If its entire nullspace contains only pi vectors with all 29 positions
 * equal, the secret pi cannot be a permutation. This proves exclusion without
 * fitting pi, source English statistics or guessing any terminal symbol.
 *
 * A source-disjoint native-GP plant with a *hidden* random pi and fixed
 * terminal rune must exhibit an extra null direction. We use that direction
 * to recover pi blindly, up to scaling, select the exact numeric packet key,
 * and decode/re-encode all planted ciphertext digits.
 *
 * Node 22, CommonJS. No external packages. Run:
 *   node sims/prime79_terminal_linear_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {toGematria} = require('./previous_cipher_sbox_invariant.cjs');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pageData=corpus.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pageData.length,55);
const original=pageData.flatMap(p=>p.indices);
assert.equal(original.length,12956);
const LIMIT=29n**78n;
const mod=x=>((x%29)+29)%29;

const pageOf=new Uint8Array(original.length);
let pos=0;
for(const page of pageData)
  for(let j=0;j<page.indices.length;j++)
    pageOf[pos++]=page.page;
assert.equal(pos,original.length);
const SECTION_BOUNDS=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const sectionOf=p=>{
  const i=SECTION_BOUNDS.findIndex(([lo,hi])=>p>=lo&&p<=hi);
  assert(i>=0);
  return i;
};

/**
 * @param {number[]} cipher
 * @param {number} phase
 * @returns {number[]}
 */
function cleanStarts(cipher,phase){
  const starts=[];
  for(let s=phase;s+79<=cipher.length;s+=79){
    if(s===0)continue;
    let clean=true;
    for(let j=s;j<s+79;j++)
      if(cipher[j]===cipher[j-1]){clean=false;break;}
    if(clean)starts.push(s);
  }
  return starts;
}

/**
 * The final GP digit's linear source coefficients, with prior cipher rune
 * indexed as C[-1] in the packet's local coordinate.
 * @param {number[]} cipher
 * @param {number} s
 * @returns {number[]}
 */
function terminalCoefficients(cipher,s){
  const a=Array(29).fill(0);
  a[cipher[s+78]]++;
  a[cipher[s-1]]--;
  for(let j=0;j<78;j++)a[cipher[s+j]]+=j%2?-2:2;
  assert.equal(mod(a.reduce((x,y)=>x+y,0)),0);
  return a.map(mod);
}

/** @param {number} x */
function inverse29(x){
  for(let a=1;a<29;a++)if(x*a%29===1)return a;
  throw Error('zero cannot be inverted');
}

/**
 * Exact RREF, F29. Returns nullspace basis vectors that satisfy the rows.
 * @param {number[][]} matrix
 */
function rref(matrix){
  const rows=matrix.map(row=>row.map(mod));
  const n=rows[0].length, pivots=[];
  let lead=0;
  for(let j=0;j<n&&lead<rows.length;j++){
    let k=lead;
    while(k<rows.length&&rows[k][j]===0)k++;
    if(k===rows.length)continue;
    [rows[lead],rows[k]]=[rows[k],rows[lead]];
    const inv=inverse29(rows[lead][j]);
    for(let h=j;h<n;h++)rows[lead][h]=rows[lead][h]*inv%29;
    for(let i=0;i<rows.length;i++)if(i!==lead){
      const m=rows[i][j];
      if(m)for(let h=j;h<n;h++)
        rows[i][h]=mod(rows[i][h]-m*rows[lead][h]);
    }
    pivots.push(j);
    lead++;
  }
  const free=Array.from({length:n},(_,i)=>i)
    .filter(i=>!pivots.includes(i));
  const basis=free.map(j=>{
    const v=Array(n).fill(0);
    v[j]=1;
    for(let i=0;i<pivots.length;i++)
      v[pivots[i]]=mod(-rows[i][j]);
    assert(matrix.every(row=>mod(row.reduce((s,x,k)=>s+x*v[k],0))===0));
    return v;
  });
  return {rank:pivots.length,free,basis};
}

/**
 * @param {number[][]} coeff
 * @param {number[]} labels
 */
function constantTailGate(coeff,labels){
  assert.equal(coeff.length,labels.length);
  const distinct=[...new Set(labels)].sort((a,b)=>a-b);
  const map=new Map(distinct.map((value,i)=>[value,i]));
  const n=distinct.length;
  const rows=coeff.map((a,i)=>{
    const row=a.concat(Array(n).fill(0));
    row[29+map.get(labels[i])]=28;
    return row;
  });
  const reduced=rref(rows),nullity=29+n-reduced.rank;
  // All-constant pi with every class b=0 is a trivial unphysical kernel.
  const constant=Array(29).fill(1).concat(Array(n).fill(0));
  assert(rows.every(row=>mod(row.reduce((s,x,k)=>s+x*constant[k],0))===0));
  const excludes=reduced.rank===28+n;
  if(excludes)assert(reduced.basis.every(v=>
    v.slice(0,29).every(x=>x===v[0])&&
    v.slice(29).every(x=>x===0)));
  return {classCount:n,rank:reduced.rank,nullity,
    excludesAnySecretPermutation:excludes};
}

/**
 * Decode full packet, avoiding unknown off-packet text. Every digit must
 * match its original published ciphertext transition when reciphered.
 * @param {number[]} cipher
 * @param {number} s
 * @param {number[]} pi
 */
function decode(cipher,s,pi){
  const inv=Array(29);
  for(let i=0;i<29;i++)inv[pi[i]]=i;
  assert.equal(new Set(pi).size,29);
  let prev=cipher[s-1],integer=0n;
  const digits=[];
  for(let j=0;j<79;j++){
    const cur=cipher[s+j],d=mod(pi[cur]-pi[prev]-1);
    digits.push(d);integer=integer*28n+BigInt(d);prev=cur;
  }
  if(integer>=LIMIT)return null;
  const plain=Array(78);
  for(let j=77;j>=0;j--){
    plain[j]=Number(integer%29n);
    integer/=29n;
  }
  assert.equal(integer,0n);
  integer=0n;
  for(const x of plain)integer=integer*29n+BigInt(x);
  const check=Array(79);
  for(let j=78;j>=0;j--){
    check[j]=Number(integer%28n);
    integer/=28n;
  }
  assert.equal(integer,0n);
  assert.deepEqual(check,digits);
  prev=cipher[s-1];
  for(let j=0;j<79;j++){
    prev=inv[(pi[prev]+check[j]+1)%29];
    assert.equal(prev,cipher[s+j]);
  }
  return plain;
}

function random32(seed){
  let v=seed>>>0;
  return ()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;};
}

function plant(){
  const data=toGematria(read('resources/control/shakespeare_first300k.txt'));
  assert(data.length>=147410);
  const plaintext=data.slice(140000,140000+95*78);
  const SENTINEL=18; // A fixed GP-E packet-end rune. Not claimed for Cicada.
  for(let k=0;k<95;k++)plaintext[k*78+77]=SENTINEL;
  const rand=random32(0x79357901);
  const pi=Array.from({length:29},(_,i)=>i);
  for(let j=28;j>0;j--){
    const k=rand()%(j+1);
    [pi[k],pi[j]]=[pi[j],pi[k]];
  }
  const shift=pi[0];
  for(let i=0;i<29;i++)pi[i]=mod(pi[i]-shift);
  const inv=Array(29);
  for(let i=0;i<29;i++)inv[pi[i]]=i;
  const cipher=[0],starts=[];
  let prev=0;
  for(let k=0;k<95;k++){
    starts.push(cipher.length);
    let integer=0n;
    for(const x of plaintext.slice(78*k,78*(k+1)))
      integer=integer*29n+BigInt(x);
    const digits=Array(79);
    for(let j=78;j>=0;j--){
      digits[j]=Number(integer%28n);
      integer/=28n;
    }
    assert.equal(integer,0n);
    for(const d of digits){
      prev=inv[(pi[prev]+d+1)%29];
      cipher.push(prev);
    }
  }
  assert.deepEqual(cleanStarts(cipher,1),starts);
  const coeff=starts.map(s=>terminalCoefficients(cipher,s));
  const gate=constantTailGate(coeff,starts.map(()=>0));
  assert.equal(gate.excludesAnySecretPermutation,false);
  assert.equal(gate.nullity,2); // Up to translation and scalar order.
  const matrix=coeff.map(row=>row.concat([28]));
  const basis=rref(matrix).basis;
  const nonconstant=basis.find(v=>v.slice(0,29).some(x=>x!==v[0]));
  assert(nonconstant);
  const normalized=nonconstant.slice(0,29).map(x=>mod(x-nonconstant[0]));
  assert.equal(new Set(normalized).size,29);
  const feasible=[];
  for(let a=1;a<29;a++){
    const candidate=normalized.map(x=>mod(a*x));
    const recovered=starts.map(s=>decode(cipher,s,candidate));
    if(recovered.every(Boolean))
      feasible.push({a,pi:candidate,
        matchesUnknownTrueOrder:candidate.every((v,i)=>v===pi[i]),
        exactRecoveredPlaintext:
          recovered.flat().every((v,i)=>v===plaintext[i])});
  }
  assert.equal(feasible.length,1);
  assert.equal(feasible[0].matchesUnknownTrueOrder,true);
  assert.equal(feasible[0].exactRecoveredPlaintext,true);
  const sourceRemainder=starts.map((s,k)=>
    mod(coeff[k].reduce((sum,v,i)=>sum+v*pi[i],0)-1));
  assert(sourceRemainder.every(x=>x===SENTINEL));
  return {syntheticPackets:starts.length,sourceRunes:plaintext.length,
    fixedPlaintextGPIndex:SENTINEL,unknownPermutation:pi,
    originalCipherRunes:starts.length*79,linearGate:gate,
    blindSearchedScaleFactors:28,feasibleScales:feasible.length,
    secretOrderExactlyRecovered:true,
    exactPlaintextRecovered:plaintext.length,
    exactCiphertextReencrypted:starts.length*79};
}

const start=cleanStarts(original,35);
assert.equal(start.length,95);
const coeff=start.map(s=>terminalCoefficients(original,s));
const originalByScope={
  wholeBook:constantTailGate(coeff,start.map(()=>0)),
  section:constantTailGate(coeff,start.map(s=>sectionOf(pageOf[s]))),
  page:constantTailGate(coeff,start.map(s=>pageOf[s])),
};
assert.deepEqual([originalByScope.wholeBook.rank,
  originalByScope.section.rank,originalByScope.page.rank],[29,37,79]);
assert(Object.values(originalByScope).every(r=>
  r.excludesAnySecretPermutation));
const periodic=[];
for(let period=1;period<=79;period++){
  const classes=start.map(s=>(s-35)/79%period);
  const r=constantTailGate(coeff,classes);
  assert.equal(r.excludesAnySecretPermutation,true);
  periodic.push({period,classes:r.classCount,rank:r.rank});
}
const positive=plant();
process.stdout.write(JSON.stringify({
  model:'78 base29 source runes per 79 predecessor-excluded base28 output digits',
  input:'original LP2, phase35, all 95 intact packets; original repeated-output packets excluded',
  originalCipherRunes:12956,originalIntactPackets:start.length,
  sourceFirstCleanPacket:start[0],sourceLastCleanPacket:start.at(-1),
  invariant:'P[77] = pi(C[78]) + 2 sum((-1)^j*pi(C[j]),j=0..77) - pi(C[-1]) -1 mod29',
  scope:originalByScope,
  periodicSuffixPeriodsExcluded:[1,79],
  periodicRuns:periodic,
  plantedExactBlindRecovery:positive,
  conclusion:'No fixed plaintext final rune per book, section, page, or any period 1..79 can coexist with ANY secret cyclic 29-glyph order for the phase35 79/78 packet codec. This does not reject arbitrary unpadded source language or solve LP2.',
},null,2)+'\n');
