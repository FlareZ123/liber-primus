'use strict';
/**
 * Complete key-independent Hill5 inverse-row capacity search on the longest
 * original source-titled unknown LP2 body: p40-55 after its eight-rune title.
 *
 * Each projective GF29 direction represents 28 proportional nonzero possible
 * rows of an arbitrary secret five-by-five invertible Hill inverse, while an
 * affine offset changes only the labels and not GP29 IoC. The original source
 * uses a visible 2014 Wisdom 5x5 square, but neither original book nor Cicada
 * instruction independently selects an all-secret Hill5 operation.
 *
 * Default runs all five block phases. For tool-bounded replay run a particular
 * phase by passing one argument "phase=0" ... "phase=4".
 * Node 22, CommonJS, read-only; no third-party packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const body=gp.pages.filter(p=>p.page>=40&&p.page<=55)
  .flatMap(p=>p.indices).slice(8);
assert.equal(body.length,3308);
assert.equal(gp.runes.length,29);
const normalizedCount=Array.from({length:5},(_,i)=>29**i)
  .reduce((s,n)=>s+n,0);
assert.equal(normalizedCount,732541);
/** @param {number[]} a */
function ioc(a){
  const h=new Uint32Array(29);
  for(const x of a)h[x]++;
  let count=0;
  for(const n of h)count+=n*(n-1);
  return count/(a.length*(a.length-1));
}
const map=new Map(gp.translit.map((s,i)=>[s,i]));
/** @param {string} input */
function sourceNative(input){
  const text=input.toUpperCase().replaceAll('QU','CW')
    .replaceAll('ING','NG').replaceAll('K','C')
    .replaceAll('Q','CW').replaceAll('V','U')
    .replaceAll('Z','S').replace(/[^A-Z]/g,'');
  const out=[];
  for(let i=0;i<text.length;){
    const pair=map.get(text.slice(i,i+2));
    if(pair!==undefined){out.push(pair);i+=2;}
    else {
      const single=map.get(text[i]);
      assert.notEqual(single,undefined);
      out.push(single);i++;
    }
  }
  return out;
}
const controls=[
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const controlMin=[];
for(const file of controls){
  const text=sourceNative(read(file)).slice(0,body.length);
  assert.equal(text.length,body.length);
  const values=Array.from({length:5},(_,j)=>
    ioc(text.filter((_,i)=>i%5===j)));
  controlMin.push({source:file,min:Math.min(...values)});
  assert(Math.min(...values)>0.05);
}
/** @param {number[]} data @param {number} phase */
function search(data,phase){
  const N=Math.floor((data.length-phase)/5);
  assert(N>=600);
  const coord=Array.from({length:5},(_,j)=>Uint8Array.from(
    Array.from({length:N},(_,i)=>data[phase+i*5+j])));
  const product=coord.map(row=>Array.from({length:29},(_,c)=>
    Uint8Array.from(row,x=>x*c%29)));
  const states=Array.from({length:5},()=>new Uint8Array(N));
  const hist=new Uint32Array(29);
  let best=-1,directions=0,above05=0,bestVector=null;
  const coeff=Array(5).fill(0);
  /** @param {Uint8Array} vec */
  function measure(vec){
    hist.fill(0);
    for(let i=0;i<N;i++)hist[vec[i]]++;
    let pairs=0;
    for(let i=0;i<29;i++)pairs+=hist[i]*(hist[i]-1);
    directions++;
    if(pairs>best){best=pairs;bestVector=coeff.slice();}
    if(pairs/(N*(N-1))>=0.05)above05++;
  }
  /**
   * @param {number} j @param {Uint8Array} prev
   */
  function rec(j,prev){
    if(j===5){measure(prev);return;}
    const result=states[j];
    for(let a=0;a<29;a++){
      const delta=product[j][a];
      for(let i=0;i<N;i++){
        const sum=prev[i]+delta[i];
        result[i]=sum<29?sum:sum-29;
      }
      coeff[j]=a;
      rec(j+1,result);
    }
  }
  for(let lead=0;lead<5;lead++){
    coeff.fill(0);coeff[lead]=1;
    rec(lead+1,coord[lead]);
  }
  assert.equal(directions,normalizedCount);
  return {phase,blocks:N,directions,above05,
    maximumIoc:best/(N*(N-1)),bestRow:bestVector};
}
// A planted dense invertible Hill5 from a solved-GP-native control: M=I+J.
// Its inverse is I-J/6 over GF29, with 6^-1=5 (because 6*5=30=1 mod29).
const plant=sourceNative(read(controls[0])).slice(0,3305);
assert.equal(plant.length,3305);
const mod=x=>((x%29)+29)%29;
const encrypted=plant.slice();
const decrypted=plant.slice();
for(let i=0;i<plant.length;i+=5){
  const sum=plant.slice(i,i+5).reduce((s,x)=>s+x,0);
  for(let j=0;j<5;j++)encrypted[i+j]=mod(plant[i+j]+sum);
}
for(let i=0;i<encrypted.length;i+=5){
  const sum=encrypted.slice(i,i+5).reduce((s,x)=>s+x,0);
  for(let j=0;j<5;j++)decrypted[i+j]=mod(encrypted[i+j]-5*sum);
}
assert.deepEqual(decrypted,plant);
const projected=Array.from({length:661},(_,i)=>
  mod(encrypted[i*5]-5*encrypted.slice(i*5,i*5+5).reduce((s,x)=>s+x,0)));
assert.deepEqual(projected,plant.filter((_,i)=>i%5===0));
assert(ioc(projected)>0.05);
const args=process.argv.slice(2);
const phases=args.length?
  [Number(args[0].replace(/^phase=/,''))]:[0,1,2,3,4];
assert(phases.every(p=>Number.isInteger(p)&&p>=0&&p<5));
const results=phases.map(phase=>search(body,phase));
console.log(JSON.stringify({
  manuscript:'physical LP2 p40..55, 3308 unknown runes after visible eight-rune title',
  hypothesis:'all secret invertible GF29 Hill5, free affine output vector and any of five block phases',
  sourceIndependentControl:controlMin,
  denseNativePositive:3305,
  plantProjectionIoC:ioc(projected),
  results,
  decision:'No recovered plaintext. Direct native-English Hill5 requires IoC >= 0.05 on a plaintext row; original source maximum is checked for each stated phase.'
},null,2));
