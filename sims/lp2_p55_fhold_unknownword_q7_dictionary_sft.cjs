'use strict';
/*
 * Original LP2 p55: source-native blind dictionary word7 plus p56-style
 * plaintext-F hold, with q7 GF29 linear keystream. Crucially, a 13-rune
 * crib containing F at local index2 has only 12 consumed keys, leaving
 * TWO free seven-tap coefficients (841 candidates), not one (29).
 * The original unfit bridge contains C=F only at local offset41, so both
 * consume and hold paths are exhaustively represented without guesses.
 * Other printed word groups are never used to fit a key.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const {p55,C,norm}=require('./lp2_p55_disjoint_13_6_crib_lfsr7_sft.cjs');
const sourceFiles=[
 'resources/control/english_wordfreq_textblob.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt',
 'resources/control/blake_song_of_liberty_train.txt'
];
const lengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const starts=(()=>{let q=1;return lengths.map(l=>{const p=q;q+=l;return p;})})();
assert.deepEqual([starts[6],starts[7],starts[8],starts[15]+lengths[15]],[23,36,42,76]);
assert.deepEqual(p55.flatMap((v,i)=>v===0?[i]:[]),[15,25,41]);
const native=new Map(),bylen=new Map();
for(const file of sourceFiles){
 const raw=fs.readFileSync(path.join(root,file),'utf8');
 for(const word of raw.match(/[A-Za-z]+/g)||[]){
  const P=encodeSourceNativeGP(word.toLowerCase());
  if(P.length<2||P.length>13)continue;
  const k=P.join(',');
  if(native.has(k))continue;
  const e={P,word:word.toUpperCase(),file};
  native.set(k,e);
  if(!bylen.has(P.length))bylen.set(P.length,[]);
  bylen.get(P.length).push(e);
 }
}
const cmp=(a,b)=>a.word<b.word?-1:a.word>b.word?1:0;
const sort=a=>a.slice().sort(cmp);
const cribs=sort(bylen.get(13));
assert(cribs.length>100);
const sourceCribs=cribs.filter(e=>{
 const f=e.P.flatMap((v,i)=>v===0?[i]:[]);
 return f.length===0||(f.length===1&&f[0]===2);
});
const Fcribs=sourceCribs.filter(e=>e.P[2]===0);
assert(Fcribs.length>0);
const laws=['direct','feedback','beaufort'];
function invert(x) {
 const u=norm(x);assert(u!==0);
 for(let k=1;k<29;k++)if(norm(k*u)===1)return k;
 throw Error('singular');
}
function solve(K) {
 const nr=K.length-7;assert(nr===5||nr===6);
 const M=Array.from({length:nr},(_,r)=>{
  const n=7+r;return [...Array.from({length:7},(_,j)=>K[n-j-1]),K[n]];
 });
 let row=0;const piv=[];
 for(let col=0;col<7;col++){
  let first=-1;for(let i=row;i<nr;i++)if(M[i][col]){first=i;break;}
  if(first<0)continue;
  [M[row],M[first]]=[M[first],M[row]];
  const k=invert(M[row][col]);M[row]=M[row].map(x=>norm(k*x));
  for(let i=0;i<nr;i++)if(i!==row&&M[i][col]){
   const z=M[i][col];M[i]=M[i].map((x,j)=>norm(x-z*M[row][j]));
  }
  piv.push(col);row++;if(row===nr)break;
 }
 if(row!==nr)return null;
 const free=Array.from({length:7},(_,i)=>i).filter(i=>!piv.includes(i));
 const base=Array(7).fill(0),basis=[];
 for(let i=0;i<row;i++)base[piv[i]]=M[i][7];
 for(const f of free){
  const v=Array(7).fill(0);v[f]=1;
  for(let i=0;i<row;i++)v[piv[i]]=norm(-M[i][f]);
  basis.push(v);
 }
 return{base,basis};
}
function keyFor(Cipher,i,p,law){
 if(law==='direct')return norm(Cipher[i]-p);
 if(law==='feedback')return norm(Cipher[i]-Cipher[i-1]-p);
 if(law==='beaufort')return norm(Cipher[i]+p);
 throw Error('law');
}
function fromKey(Cipher,i,k,law){
 if(law==='direct')return norm(Cipher[i]-k);
 if(law==='feedback')return norm(Cipher[i]-(i?Cipher[i-1]:0)-k);
 if(law==='beaufort')return norm(k-Cipher[i]);
 throw Error('law');
}
function evaluate(Cipher,truth){
 const o={source13:cribs.length,eligible13:sourceCribs.length,
  holdsInsideWord13:Fcribs.length,validBridgeModels:0,
  candidateKeys:0,word8DictionaryHits:0,bestOtherWordMatches:0,
  credibleOriginalDecoders:[],bestSamples:[],oracleCount:0};
 for(const law of laws)for(const crib of sourceCribs){
  const knownPositions=[];
  for(let j=0;j<13;j++)if(crib.P[j]!==0)knownPositions.push(23+j);
  const seed=knownPositions.map(i=>keyFor(Cipher,i,crib.P[i-23],law));
  const solution=solve(seed);if(!solution)continue;
  const dim=solution.basis.length;assert(dim===1||dim===2);
  const N=dim===1?29:841;
  for(let z=0;z<N;z++){
   const params=dim===1?[z]:[Math.floor(z/29),z%29];
   const coefs=solution.base.map((a,j)=>norm(a+params.reduce((v,t,k)=>v+t*solution.basis[k][j],0)));
   const K=seed.slice();
   for(let i=seed.length;i<seed.length+40;i++)
    K[i]=norm(coefs.reduce((v,a,j)=>v+a*K[i-j-1],0));
   o.candidateKeys++;
   for(const hold41 of [false,true]){
    if(hold41&&Cipher[41]!==0)continue;
    let cursor=seed.length,valid=true;const parts=[],names=[];
    for(let wi=7;wi<16;wi++){
     const w=[];
     for(let i=starts[wi];i<starts[wi]+lengths[wi];i++){
      let p;
      if(i===41&&hold41)p=0;
      else{
       p=fromKey(Cipher,i,K[cursor++],law);
       if(p===0){valid=false;break;} // plaintext-F must bypass the key
      }
      w.push(p);
     }
     if(!valid)break;
     const entry=native.get(w.join(','));
     parts.push(w);
     if(entry)names.push({word:wi+1,text:entry.word});
     if(wi===7&&!entry)break; // source-independent early decision
    }
    if(!valid)continue;
    o.validBridgeModels++;
    if(!parts.length||!native.has(parts[0].join(',')))continue;
    o.word8DictionaryHits++;
    const score=names.length;
    const row={law,word13:crib.word,heldFAt25:crib.P[2]===0,
     holdFAt41:hold41,freeDimension:dim,parameter:params,
     coefficients:coefs,matchedOtherWords:score,names};
    if(score>o.bestOtherWordMatches){
     o.bestOtherWordMatches=score;o.bestSamples=[row];
    }else if(score===o.bestOtherWordMatches&&o.bestSamples.length<5)
     o.bestSamples.push(row);
    if(score>=7){
     row.proposedPlaintext=parts.flat().map(i=>C.translit[i]).join(' ');
     o.credibleOriginalDecoders.push(row);
    }
    if(truth && law===truth.law && crib.word===truth.word13 &&
       hold41===truth.hold41 && coefs.every((x,i)=>x===truth.coefficients[i]) &&
       parts.flat().every((x,i)=>x===truth.P[36+i])){
      o.oracleCount++;
    }
   }
  }
 }
 return o;
}
const original=evaluate(p55);
assert.equal(original.credibleOriginalDecoders.length,0);
const K=[2,3,5,7,11,13,17],coefficients=[1,4,2,3,8,6,9];
for(let i=7;i<95;i++)K[i]=norm(coefficients.reduce((s,a,j)=>s+a*K[i-j-1],0));
function encryptF(P,law){
 let cursor=0;const out=[];
 for(let i=0;i<P.length;i++){
  const p=P[i];
  if(p===0){out.push(0);continue;}
  const k=K[cursor++];
  if(law==='direct')out.push(norm(p+k));
  if(law==='feedback')out.push(norm(p+k+(i?out[i-1]:0)));
  if(law==='beaufort')out.push(norm(k-p));
 }
 return out;
}
function findSource(word,len){
 const e=(bylen.get(len)||[]).find(x=>x.word===word);
 assert(e,'Missing fixed native source word '+word);
 return e;
}
const plantCrib=findSource('UNFORTUNATELY',13),plantWord8=findSource('ITSELF',6);
assert.deepEqual(plantCrib.P.flatMap((v,i)=>v===0?[i]:[]),[2]);
assert.deepEqual(plantWord8.P.flatMap((v,i)=>v===0?[i]:[]),[5]);
const P=[C.pages.find(x=>x.page===57).indices[0]];
for(let wi=0;wi<16;wi++){
 let e;
 if(wi===6)e=plantCrib;
 else if(wi===7)e=plantWord8;
 else{
  const viable=sort(bylen.get(lengths[wi]).filter(z=>!z.P.includes(0)));
  assert(viable.length>0);
  e=viable[(7+3301*wi)%viable.length];
 }
 P.push(...e.P);
}
assert.equal(P.length,76);
assert.deepEqual(P.flatMap((x,i)=>x===0?[i]:[]),[25,41]);
const positive=[];
for(const law of laws){
 const Cipher=encryptF(P,law);
 const test=evaluate(Cipher,{P,law,word13:'UNFORTUNATELY',hold41:true,coefficients});
 assert.equal(test.oracleCount,1);
 assert.equal(test.bestOtherWordMatches,9);
 assert(test.credibleOriginalDecoders.some(x=>x.matchedOtherWords===9));
 positive.push({law,fullNativeSuffixRecovered:40,unexposedWholeWordsRecovered:9,
  correctKeyAndHoldPathUnique:true,otherWordMatches:9,
  candidateKeys:test.candidateKeys,bridgesPassingFirstWord:test.word8DictionaryHits});
}
console.log(JSON.stringify({
 originalSource:'unmodified physical p55, same 16 complete GP word groups',
 F_CiphertextOffsets:[15,25,41],sourceDictionaryCount:native.size,
 keyFamily:'GF29 homogeneous q7, two free coefficients if word7 holds F at local index2',
 original,positive,
 caveat:'No authenticated original word7 plaintext or transfer of the p56 F-hold cipher to p55'
},null,2));