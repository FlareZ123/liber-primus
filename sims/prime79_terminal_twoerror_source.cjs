'use strict';
/**
 * Exact two-unknown-terminal-error tolerant literary crib gate for the LP2
 * hypothetical 78/79 fixed cyclic radix transport.
 *
 * The earlier rank-28 key-free last-rune equations define a systematic
 * [95,28] linear code over GF29. Every source terminal vector that differs
 * in at most two positions from some secret-order-generated original must
 * have syndrome equal to a sum of at most two parity-check columns.
 *
 * A six-coordinate syndrome prefilter is exhaustively enumerated (all
 * <=2-weight errors over GF29), then every survivor is checked in all 67
 * syndrome coordinates. The test makes no guess about the rune ordering.
 *
 * Run: node sims/prime79_terminal_twoerror_source.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {toGematria}=require('./previous_cipher_sbox_invariant.cjs');
const {cleanStarts,terminalCoefficients,independent,terminalParity,
  terminalFromRow}=require('./prime79_terminal_linear_crib.cjs');
const ROOT=path.resolve(__dirname,'..');
const MOD=29,PREFIX=6,PREFIX_SPACE=29**PREFIX;
const mod=n=>(n%MOD+MOD)%MOD;
function inverse(n){let out=1;for(let i=0;i<27;i++)out=mod(out*n);return out;}

/** Build 67 parity-check rows H and all 95 systematic syndrome columns. */
function parityCode(checks,chosen){
  assert.equal(checks.length,67);
  assert.equal(chosen.length,28);
  const columns=Array.from({length:95},()=>new Uint8Array(67));
  for(let k=0;k<67;k++){
    columns[checks[k].packet][k]=1;
    for(let j=0;j<28;j++)
      columns[chosen[j]][k]=mod(-checks[k].coefficients[j]);
  }
  const bits=Buffer.alloc(Math.ceil(PREFIX_SPACE/8));
  const add=key=>{bits[key>>>3]|=1<<(key&7);};
  const matches=key=>Boolean(bits[key>>>3]&(1<<(key&7)));
  add(0);
  for(let p=0;p<95;p++)for(let a=1;a<MOD;a++){
    let key=0;
    for(let k=0;k<PREFIX;k++)key=key*MOD+mod(a*columns[p][k]);
    add(key);
  }
  for(let p=0;p<95;p++)for(let q=p+1;q<95;q++)
    for(let a=1;a<MOD;a++)for(let b=1;b<MOD;b++){
      let key=0;
      for(let k=0;k<PREFIX;k++)
        key=key*MOD+mod(a*columns[p][k]+b*columns[q][k]);
      add(key);
    }
  const pairs=[];
  for(let p=0;p<95;p++)for(let q=p+1;q<95;q++){
    let pair=null;
    for(let i=0;i<67&&!pair;i++)for(let j=i+1;j<67;j++){
      const determinant=mod(columns[p][i]*columns[q][j]-
        columns[p][j]*columns[q][i]);
      if(determinant){
        pair={p,q,i,j,invDet:inverse(determinant),guard:i!==0&&j!==0?0: i!==1&&j!==1?1:2};
        break;
      }
    }
    if(pair)pairs.push(pair);
  }
  return {checks,chosen,columns,bits,matches,pairs};
}

/** @param {number[]} s Full 67-dimensional source-original syndrome. */
function twoErrorInverse(s,gate){
  const h=gate.columns;
  if(s.every(v=>v===0))return [];
  for(let p=0;p<95;p++){
    const pivot=h[p].findIndex(v=>v!==0);
    if(pivot<0)continue;
    const a=mod(s[pivot]*inverse(h[p][pivot]));
    if(a&&s.every((v,k)=>v===mod(a*h[p][k])))
      return [{packet:p,delta:a}];
  }
  for(const {p,q,i,j,invDet,guard} of gate.pairs){
    const a=mod((s[i]*h[q][j]-s[j]*h[q][i])*invDet);
    const b=mod((h[p][i]*s[j]-h[p][j]*s[i])*invDet);
    if(!a||!b)continue;
    if(s[guard]!==mod(a*h[p][guard]+b*h[q][guard]))continue;
    if(s.every((v,k)=>v===mod(a*h[p][k]+b*h[q][k])))
      return [{packet:p,delta:a},{packet:q,delta:b}];
  }
  return null;
}

function scan(tokens,starts,gate){
  const positions=starts.map(s=>78*((s-35)/79)+77);
  const windows=Math.max(0,tokens.length-positions.at(-1));
  let prefixSurvivors=0;const complete=[];
  for(let offset=0;offset<windows;offset++){
    const v=gate.chosen.map(k=>tokens[offset+positions[k]]+1);
    const syndrome=[];let packed=0;
    for(let k=0;k<PREFIX;k++){
      const {packet,coefficients}=gate.checks[k];
      let sum=tokens[offset+positions[packet]]+1;
      for(let j=0;j<28;j++)sum-=coefficients[j]*v[j];
      const r=mod(sum);syndrome.push(r);packed=packed*MOD+r;
    }
    if(!gate.matches(packed))continue;
    prefixSurvivors++;
    for(let k=PREFIX;k<gate.checks.length;k++){
      const {packet,coefficients}=gate.checks[k];
      let sum=tokens[offset+positions[packet]]+1;
      for(let j=0;j<28;j++)sum-=coefficients[j]*v[j];
      syndrome.push(mod(sum));
    }
    const errors=twoErrorInverse(syndrome,gate);
    if(errors)complete.push({sourceOffset:offset,errors});
  }
  return {referenceGP:tokens.length,windows,
    sixParityTwoErrorCandidates:prefixSurvivors,
    all67ParityTwoErrorCandidates:complete};
}

/** Deliberately modify two distinct basis-packet terminal symbols. */
function positive(rows,gate){
  const labels=[0,24,11,21,7,28,10,16,25,3,15,9,22,27,2,20,
    26,19,1,18,5,17,14,13,6,12,23,8,4];
  const original=rows.map(r=>terminalFromRow(r,labels));
  const marked=[gate.chosen[0],gate.chosen[1]];
  const deltas=[7,19];
  for(let j=0;j<2;j++)original[marked[j]]=mod(original[marked[j]]+deltas[j]);
  const basis=gate.chosen.map(i=>original[i]+1);
  const s=gate.checks.map(({packet,coefficients})=>{
    let value=original[packet]+1;
    for(let j=0;j<28;j++)value-=coefficients[j]*basis[j];
    return mod(value);
  });
  let packed=0;for(let k=0;k<PREFIX;k++)packed=packed*MOD+s[k];
  assert.ok(gate.matches(packed));
  const recovered=twoErrorInverse(s,gate);
  assert(recovered);
  assert.deepEqual(recovered.map(x=>x.packet),marked);
  assert.deepEqual(recovered.map(x=>x.delta),deltas);
  return {source:'An independent order witness on actual published original code rows',
    injectedUnknownPacketErrors:2,correctPacketPositions:marked,
    correctFieldDeltas:deltas,fullSyndromeAlgebraicRecovery:true};
}

function run(){
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const cipher=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  assert.equal(cipher.length,12956);
  const starts=cleanStarts(cipher,35);
  assert.equal(starts.length,95);
  const rows=starts.map(s=>terminalCoefficients(cipher,s));
  const chosen=independent(rows);
  assert.equal(chosen.length,28);
  const gate=parityCode(terminalParity(rows,chosen),chosen);
  const control=positive(rows,gate);
  const sources=[
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt'
  ];
  const results=[];
  for(const src of sources){
    const tokens=toGematria(fs.readFileSync(path.join(ROOT,src),'utf8'));
    const out=scan(tokens,starts,gate);
    assert.equal(out.all67ParityTwoErrorCandidates.length,0,
      'Found near-source compatible ciphertext requires full original inverse!');
    results.push({source:src,...out});
  }
  const summary={
    hypothesis:'Original LP2 phase35 79/78 with fixed unknown cyclic alphabet',
    toleratedUnknownOriginalPlaintextErrors:2,
    errorPositions:'Any two of the 95 surviving 78-rune packet-final plaintext positions',
    encodedParitySpace:29**6,parityChecks:67,rank:28,
    tests:results,
    positive:control,
    conclusion:'Key-independent exact source-excerpt exclusion permitting any two packet-terminal rune edits in the source passage. No original LP2 key/plaintext recovered.'
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={parityCode,twoErrorInverse,scan,positive,run};
