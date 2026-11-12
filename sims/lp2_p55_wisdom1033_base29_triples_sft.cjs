'use strict';
/**
 * LP2 physical p55: complete 75-rune body as 25 source-keyed BASE29 triples.
 * Original source: LP1 p05 5x5 Wisdom square (row sums 1033).
 * Published arithmetic precedent: Cicada 2013 signed BASE29 3301 -> 3QO.
 * Run: node sims/lp2_p55_wisdom1033_base29_triples_sft.cjs
 * All six reversible consumers are conditional hypotheses, not decoded LP2.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const squares=read('resources/cicada2014-openpuff-magic-squares.txt').trim()
  .split(/\r?\n\s*\r?\n/).map(t=>t.trim().split(/\r?\n/)
    .map(row=>row.trim().split(/\s+/).map(Number)));
const source=squares[2],keys=source.flat();
assert.deepEqual(squares.map(m=>m[0].reduce((a,b)=>a+b,0)),[3301,1033,1033]);
assert.equal(keys.length,25);
assert.deepEqual(source[2],[226,245,91,245,226]);
const original=db.pages.find(p=>p.page===55).indices;
assert.equal(original.length,76);
assert.equal(original[0],21); // incoming p54 NG, outside the tested body
const cipher=original.slice(1);
assert.equal(cipher.length,75);
const words=(read('resources/liber-primus/lp2-transcription.txt')
  .split('%')[54].replace(/\/\s*/g,'').match(/[\u16A0-\u16FF]+/gu)||[]);
assert.deepEqual(words.map(w=>[...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const wordLengths=words.slice(1).map(w=>[...w].length);
const N=29**3;
const mod29=x=>(x%29+29)%29,modN=x=>(x%N+N)%N;
const digits=n=>[Math.floor(n/841)%29,Math.floor(n/29)%29,n%29];
const integer=d=>d[0]*841+d[1]*29+d[2];
/** @param {number} a @returns {number} modular inverse in Z/(29^3) */
function inverse(a){
  let r=N,nr=a,t=0,nt=1;
  while(nr!==0){
    const q=Math.floor(r/nr);
    [r,nr]=[nr,r-q*nr];
    [t,nt]=[nt,t-q*nt];
  }
  assert.equal(r,1,'Original square entry must be a unit mod 29^3');
  return modN(t);
}
keys.forEach(k=>assert.equal(modN(k*inverse(k)),1));
const modes=['digits-minus','digits-plus','integer-minus',
  'integer-plus','integer-divide','integer-multiply'];
/**
 * Exactly invertible 25-block transform.
 * @param {string} mode
 * @param {number[]} input 75 GP rune indices
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(mode,input,encrypt=false){
  assert.equal(input.length,75);
  const out=[];
  for(let i=0;i<25;i++){
    const block=input.slice(3*i,3*i+3),k=keys[i];
    const kd=digits(k);
    if(mode==='digits-minus'||mode==='digits-plus'){
      const sign=(mode==='digits-minus'?-1:1)*(encrypt?-1:1);
      out.push(...block.map((v,j)=>mod29(v+sign*kd[j])));
    }else{
      const c=integer(block);
      let v;
      if(mode==='integer-minus')v=modN(c+(encrypt?1:-1)*k);
      else if(mode==='integer-plus')v=modN(c+(encrypt?-1:1)*k);
      else if(mode==='integer-divide')v=modN(c*(encrypt?k:inverse(k)));
      else if(mode==='integer-multiply')v=modN(c*(encrypt?inverse(k):k));
      else throw Error('Unknown frozen mode '+mode);
      out.push(...digits(v));
    }
  }
  return out;
}
const plant=db.pages.find(p=>p.page===57).indices.slice(0,75);
assert.equal(plant.length,75);
const sourceGP=p=>p.map(n=>db.translit[n]).join('');
const parseGP=t=>{
  const tokens=db.translit.map((name,i)=>({name,i}))
    .sort((a,b)=>b.name.length-a.name.length);
  const out=[];
  for(const w of t.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[]){
    for(let i=0;i<w.length;){
      const token=tokens.find(x=>w.startsWith(x.name,i));
      assert(token,'Unmapped native source '+w.slice(i));
      out.push(token.i);i+=token.name.length;
    }
  }
  return out;
};
const gibran=parseGP(read('resources/control/gibran_prophet_58585.txt'));
const shakespeare=parseGP(read('resources/control/shakespeare_first300k.txt'));
const emerson=parseGP(read('resources/control/emerson_essays_2944.txt'));
assert.deepEqual([gibran.length,shakespeare.length,emerson.length],
  [63114,218800,324630]);
const tri=new Map(),bi=new Map();
for(let i=2;i<gibran.length;i++){
  const b=gibran[i-2]+','+gibran[i-1],t=b+','+gibran[i];
  bi.set(b,(bi.get(b)||0)+1);tri.set(t,(tri.get(t)||0)+1);
}
/** @param {number[]} a @returns {number} mean GP29 log likelihood */
function score(a){
  let sum=0;
  for(let i=2;i<a.length;i++){
    const b=a[i-2]+','+a[i-1],t=b+','+a[i];
    sum+=Math.log(((tri.get(t)||0)+.05)/((bi.get(b)||0)+29*.05));
  }
  return sum/(a.length-2);
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);
  a.forEach(x=>f[x]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const controls=[];
for(const text of [shakespeare,emerson])
  for(let i=0;i<151;i++){
    const start=Math.floor(i*(text.length-75)/150);
    controls.push(score(text.slice(start,start+75)));
  }
controls.sort((a,b)=>a-b);
const observed=modes.map(mode=>{
  const decoded=transform(mode,cipher);
  assert.deepEqual(transform(mode,decoded,true),cipher);
  assert.deepEqual(transform(mode,transform(mode,plant,true)),plant);
  const ll=score(decoded);
  assert(ll<controls[0],mode+' must remain below the heldout native range');
  let j=0;
  const printed=wordLengths.map(length=>{
    const result=sourceGP(decoded.slice(j,j+length));j+=length;
    return result;
  });
  assert.equal(j,75);
  return {mode,GP29IoC:ioc(decoded),GibranTrigramNatsPerRune:ll,
    GPTransliteration:sourceGP(decoded),originalPrintedWords:printed};
});
assert.equal(original[0],21);
console.log(JSON.stringify({
  status:'PASS',
  classification:'six exact source-pinned BASE29 triple operations, all negative',
  source:'LP1 p05 5x5 Wisdom/1033 square reused as p55 moth; 2013 signed BASE29',
  sourceSquareOrder:'printed row-major',clock:'25 consecutive three-rune blocks',
  originalP55Runes:76,unalteredP54CarryNG:1,testedP55Body:75,
  modulus:24389,sourceSquareEntries:keys,
  independentSolvedP57PlantRecoveredForEachMode:true,
  originalCiphertextRoundtripForEachMode:true,
  heldoutGP29TrigramScoreRange:{n:controls.length,min:controls[0],max:controls.at(-1)},
  authenticP57First75TrigramScore:score(plant),
  decodedCandidates:observed,
  conclusion:'No authentic unknown plaintext or key; the six frozen source-consumer rules are rejected'
},null,2));
