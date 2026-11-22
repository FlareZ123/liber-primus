"use strict";
/**
 * Source-motivated Boolean-lattice Mobius inversion of the LP2 32x8 byte grid.
 * LP1 explicitly spells MOBIUS; LP2 has five-slot ornaments and 2^5 printed
 * numeric rows. This finite, fully invertible GP28 original-cipher screen
 * tests source-derived binary-subset inversion under two byte-group laws.
 *
 * Run from repo root: node sims/grid_boolean_mobius_gp28_inverse_sft.cjs
 * Node 22, no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const grid=read("resources/liber-primus/base60-grid.json");
const corpus=read("resources/liber-primus/lp2-corpus.json");
const latin=read("resources/control/latin-vulgate-heldout-gp.json");
const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const PLANT=latin.runes.slice(0,2400);
assert.equal(C.length,12956);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row=>row.length===8&&row.every(x=>x>=0&&x<=255)));
assert(PLANT.length===2400&&PLANT.every(x=>Number.isInteger(x)&&x>=0&&x<=28));
assert(C.every(x=>x>=0&&x<=28));
const mod=(n,m)=>(n%m+m)%m;

/**
 * In-place 5-dimensional Boolean lattice Mobius inverse on 32 row vectors.
 * XOR is its own zeta inverse in characteristic two; over Z/256 invert by
 * subtraction. "subset" and "superset" are opposite partial orders.
 * @param {"xor"|"mod256"} law
 * @param {"subset"|"superset"} order
 * @returns {number[]}
 */
function inverseGrid(law,order,rowMap=Array.from({length:32},(_,i)=>i)){
  const rows=Array.from({length:32},()=>Array(8).fill(0));
  for(let i=0;i<32;i++)rows[rowMap[i]]=grid.byte_rows[i].slice();
  for(let bit=0;bit<5;bit++)for(let s=0;s<32;s++) {
    const isSet=(s&(1<<bit))!==0;
    if((order==="subset"&&isSet)||(order==="superset"&&!isSet)){
      const other=s^(1<<bit);
      for(let col=0;col<8;col++){
        rows[s][col]=law==="xor"
          ? (rows[s][col]^rows[other][col])
          : mod(rows[s][col]-rows[other][col],256);
      }
    }
  }
  return rows.flat();
}
/** @param {number} b @param {"mod"|"scaled"} reducer @returns {number} */
function keyDigit(b,reducer){
  return reducer==="mod"?b%28:Math.floor(28*b/256);
}
/**
 * Bijective except for an explicitly transparent original repeat output.
 * One source-LP2 GP ciphertext equal neighbor maps to a separate GP28 marker,
 * preserving all 86 actual doublets. Initial rune is the literal IV value.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @param {"mod"|"scaled"} reducer
 * @returns {number[]}
 */
function decrypt(cipher,key,sign,reducer){
  let prev=-1;
  return cipher.map((c,i)=>{
    let p;
    if(prev<0)p=c;
    else if(c===prev)p=28;
    else p=mod(mod(c-prev-1,29)-sign*keyDigit(key[i%256],reducer),28);
    prev=c;
    return p;
  });
}
/** @param {number[]} plain @param {number[]} key @param {-1|1} sign @param {"mod"|"scaled"} reducer @returns {number[]} */
function encrypt(plain,key,sign,reducer){
  let prev=-1;
  return plain.map((p,i)=>{
    const c=prev<0?p:p===28?prev:
      mod(prev+1+mod(p+sign*keyDigit(key[i%256],reducer),28),29);
    prev=c;
    return c;
  });
}
/** @param {number[]} seq @returns {number} */
function ioc(seq){
  const cnt=new Array(29).fill(0);
  for(const c of seq)cnt[c]++;
  return cnt.reduce((v,x)=>v+x*(x-1),0)/(seq.length*(seq.length-1));
}
function main(){
  const variants=[];
  const expectedEA=C.slice(1).filter((v,i)=>v===C[i]).length;
  assert.equal(expectedEA,86);
  for(const law of ["mod256","xor"])for(const order of ["subset","superset"]){
    const key=inverseGrid(law,order);
    assert.equal(key.length,256);
    assert(key.every(v=>Number.isInteger(v)&&v>=0&&v<=255));
    for(const reducer of ["mod","scaled"])for(const sign of [-1,1]){
      const dec=decrypt(C,key,sign,reducer);
      assert.deepEqual(encrypt(dec,key,sign,reducer),C);
      assert.equal(dec.filter(x=>x===28).length,
        expectedEA+(C[0]===28?1:0));
      variants.push({law,order,reducer,sign,ioc:ioc(dec),
        first50:dec.slice(0,50).map(x=>corpus.translit[x]).join("")});
    }
  }
  variants.sort((a,b)=>b.ioc-a.ioc);
  // The five-bit stencil's proposed de Bruijn state ordering is a separate,
  // source-specific hypothesis; its black-stencil anchor puts state zero at
  // fragment 8. Reorder the printed rows to five-bit masks *before* Mobius.
  const cycle=[31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15];
  const blackPhase=(cycle.indexOf(0)-8+32)%32;
  const stateOrders=[
    ["printed",Array.from({length:32},(_,i)=>i)],
    ["deBruijn",cycle],
    ["black-zero",[...cycle.slice(blackPhase),...cycle.slice(0,blackPhase)]]
  ];
  assert.equal(stateOrders[2][1][8],0);
  const extended=[];
  for(const [rowMapName,rowMap] of stateOrders){
    assert.deepEqual(rowMap.slice().sort((a,b)=>a-b),
      Array.from({length:32},(_,i)=>i));
    for(const law of ["mod256","xor"])for(const order of ["subset","superset"]){
      const stateKey=inverseGrid(law,order,rowMap);
      for(const clock of ["mask-flat","source-row-major","source-col-major"]){
        const key=Array.from({length:256},(_,i)=>{
          if(clock==="mask-flat")return stateKey[i];
          const r=clock==="source-row-major"
            ? rowMap[Math.floor(i/8)] : rowMap[i%32];
          const c=clock==="source-row-major"?i%8:Math.floor(i/32);
          return stateKey[8*r+c];
        });
        for(const reducer of ["mod","scaled"])for(const sign of [-1,1]){
          const plain=decrypt(C,key,sign,reducer);
          assert.deepEqual(encrypt(plain,key,sign,reducer),C);
          extended.push({rowMapName,law,order,clock,reducer,sign,ioc:ioc(plain)});
        }
      }
    }
  }
  extended.sort((a,b)=>b.ioc-a.ioc);
  assert.equal(extended.length,144);
  assert(extended[0].ioc<0.045,"source-ordered Mobius variant unexpectedly linguistic");
  // Independent 2,400-rune Latin-GP positive, parameters frozen by source
  // conventions, not selected from the unknown original output.
  const model={law:"mod256",order:"subset",reducer:"mod",sign:1};
  const key=inverseGrid(model.law,model.order);
  const plantedCipher=encrypt(PLANT,key,model.sign,model.reducer);
  const replay=decrypt(plantedCipher,key,model.sign,model.reducer);
  assert.deepEqual(replay,PLANT);
  assert.deepEqual(encrypt(replay,key,model.sign,model.reducer),plantedCipher);
  console.log(JSON.stringify({
    question:"Does literal MOBIUS plus 5-bit grid rows yield a native-GP source key?",
    source:"LP1 MOBIUS; LP2 32x8 printed table and five-slot border",
    originalRunes:C.length,originalAdjacentRepeats:expectedEA,
    sourceVariants:variants.length,originalCipherIoC:ioc(C),
    best:variants[0],worst:variants.at(-1),
    deBruijnSourceOrderFamily:{settings:extended.length,
      best:extended[0],worst:extended.at(-1)},
    all:variants.map(({first50,...meta})=>meta),
    independentPlant:{source:"Latin Vulgate GP holdout",
      runes:PLANT.length,correct:replay.filter((x,i)=>x===PLANT[i]).length,
      model,ioc:ioc(PLANT)},
    status:"All original rune inverses algebraically exact; outputs unrecognized. No LP2 plaintext or true key found."
  },null,2));
  assert(variants[0].ioc<0.045,"unexpected native-GP structure; investigate");
}
if(require.main===module)main();
module.exports={inverseGrid,decrypt,encrypt,ioc,main};
