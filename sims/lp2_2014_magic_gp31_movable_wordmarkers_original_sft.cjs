'use strict';

/**
 * Authentic 2014 Cicada OpenPuff 5x5/7x7/5x5 integer magic squares as
 * reversible GP31 Hill packets with movable literal word/stop markers.
 * GP31 := native 29 Gematria Primus runes + printed '-' + printed '.'.
 * The six Arabic numbered passage-heading dashes are out-of-band art.
 * Source does NOT prescribe these operations. This is a finite original-
 * cipher test with source-native solved LP2 p57 positive and wrong-key
 * controls, not a key or plaintext discovery.
 *
 * Single file / Windows Node.js 22 / CommonJS / built-ins / read only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8')
  .replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const physical=read('resources/liber-primus/lp2-transcription.txt').split('%');
const printed=read('resources/cicada2014-openpuff-magic-squares.txt');
const runeMap=new Map(gp.runes.map((ch,i)=>[ch,i]));
assert.equal(physical.length,57);
const matrices=printed.trim().split(/\n\s*\n/).map(block=>
  block.trim().split('\n').map(row=>row.trim().split(/\s+/).map(Number)));
assert.deepEqual(matrices.map(m=>m.length),[5,7,5]);
const mod=x=>(x%31+31)%31;

/** @param {number[][]} M */
function inverse(M){
  const n=M.length;
  assert.ok(M.every(row=>row.length===n));
  const a=M.map((row,i)=>row.map(mod).concat(
    Array.from({length:n},(_,j)=>Number(i===j))));
  for(let k=0;k<n;k++){
    let p=k;
    while(p<n&&a[p][k]===0)p++;
    assert.ok(p<n,'original 2014 matrix singular over GF31');
    [a[p],a[k]]=[a[k],a[p]];
    let inv=1;
    while(mod(inv*a[k][k])!==1)inv++;
    for(let j=0;j<2*n;j++)a[k][j]=mod(a[k][j]*inv);
    for(let i=0;i<n;i++)if(i!==k){
      const factor=a[i][k];
      for(let j=0;j<2*n;j++)
        a[i][j]=mod(a[i][j]-factor*a[k][j]);
    }
  }
  return a.map(row=>row.slice(n));
}
/** @param {number[][]} A @param {number[][]} B */
function product(A,B){
  return A.map(row=>B[0].map((_,j)=>
    mod(row.reduce((acc,v,k)=>acc+v*B[k][j],0))));
}
/** @param {number[][]} A */
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
/** @param {number} n */
const identity=n=>Array.from({length:n},(_,i)=>
  Array.from({length:n},(_,j)=>Number(i===j)));
/** @param {number[]} tape @param {number[][]} A */
function apply(tape,A){
  const out=tape.slice(),n=A.length;
  for(let st=0;st+n<=tape.length;st+=n){
    for(let i=0;i<n;i++){
      let x=0;
      for(let j=0;j<n;j++)x+=A[i][j]*tape[st+j];
      out[st+i]=mod(x);
    }
  }
  return out;
}
/** @param {number} first @param {number} last */
function original(first,last){
  const raw=Array.from({length:last-first+1},(_,i)=>first+i)
    .filter(p=>p!==50).map(p=>physical[p<50?p:p-1]).join('');
  const withoutHeading=raw.replace(/[1-7]-/g,'');
  const tape=[];
  for(const ch of withoutHeading){
    if(runeMap.has(ch))tape.push(runeMap.get(ch));
    else if(ch==='-')tape.push(29);
    else if(ch==='.')tape.push(30);
  }
  const expected=gp.pages.filter(p=>p.page>=first&&p.page<=last)
    .flatMap(p=>p.indices);
  assert.deepEqual(tape.filter(x=>x<29),expected);
  return tape;
}
/** @param {number[]} tape */
function metrics(tape){
  const freq=new Uint32Array(31);
  let longest=0,last=0,empty=0;
  for(const x of tape){
    assert.ok(Number.isInteger(x)&&x>=0&&x<31);
    freq[x]++;
    if(x<29)last++;
    else{if(last===0)empty++;longest=Math.max(last,longest);last=0;}
  }
  longest=Math.max(last,longest);
  const runes=Array.from(freq.slice(0,29)).reduce((a,b)=>a+b,0);
  const marks=tape.length-runes;
  const top5=Array.from(freq.slice(0,29)).sort((a,b)=>b-a)
    .slice(0,5).reduce((a,b)=>a+b,0);
  return{tokens:tape.length,runes,marks,dashes:freq[29],stops:freq[30],
    maxWord:longest,empty,top5:top5/runes,combined6:(top5+marks)/tape.length,
    ioc:Array.from(freq.slice(0,29)).reduce((a,b)=>a+b*(b-1),0)/
      (runes*(runes-1))};
}
/** @param {number[]} tape */
function preview(tape){
  return tape.slice(0,100).map(x=>
    x===29?' ':x===30?'.':gp.translit[x]).join('');
}
const windows=[[16,21],[33,39],[40,53]];
const answer={
  source:'Unmodified LP2 2014 GP31 original printed ciphertext',
  symbols:'GP runes0..28, dash29, stop30',
  sourceMatrices:['3301 5x5','1033 7x7','1033 5x5'],
  authorSelectedOpcode:false,
  control:metrics(original(57,57)),windows:[]
};
assert.equal(answer.control.runes,95);
assert.equal(answer.control.dashes,16);
assert.equal(answer.control.stops,4);
const solved=original(57,57);
for(const [lo,hi] of windows){
  const tape=original(lo,hi),variants=[];
  for(let mi=0;mi<matrices.length;mi++){
    const M=matrices[mi].map(row=>row.map(mod)),I=inverse(M);
    assert.deepEqual(product(M,I),identity(M.length));
    assert.deepEqual(product(I,M),identity(M.length));
    for(const [label,F,G] of [
      ['original-column',M,I],['inverse-column',I,M],
      ['original-row',transpose(M),transpose(I)],
      ['inverse-row',transpose(I),transpose(M)]
    ]){
      const decoded=apply(tape,F);
      assert.deepEqual(apply(decoded,G),tape,
        'full intact original GP31 reencryption failed');
      const nativeCipher=apply(solved,G);
      assert.deepEqual(apply(nativeCipher,F),solved,
        'native solved p57 source-GP31 positive failed');
      assert.notDeepEqual(nativeCipher,solved,
        'wrong-key identity should not recover solved p57');
      const data=metrics(decoded);
      assert.ok(data.top5<0.24&&data.combined6<0.28,
        'genuine source matrices remain nonnative');
      variants.push({matrix:mi,orientation:label,decoded:data,
        first100:preview(decoded)});
    }
  }
  answer.windows.push({pages:[lo,hi],source:metrics(tape),variants});
}
console.log(JSON.stringify(answer,null,2));
