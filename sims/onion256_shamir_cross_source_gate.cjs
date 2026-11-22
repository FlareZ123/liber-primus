'use strict';
/**
 * Native-source 3-of-4 Shamir necessary-condition gate.
 *
 * Three unverified historical 256-byte onions are labeled services 2,3,4,
 * and a fourth 256-byte historical string is LP2's p49-51 base60 grid.
 * Treat their public service numbers as polynomial evaluation coordinates
 * x=2,3,4 and exhaustively allow ANY other fixed x for the table.
 * Every byte position must lie on one degree <=2 polynomial over GF(256)
 * or GF(257), even when the polynomial coefficients vary freely by byte.
 *
 * Contradiction at any coordinate disproves the exact specified source-sharing
 * mechanism. A 4-of-4 degree3 polynomial always fits arbitrary four shares
 * and cannot be excluded by this test.
 *
 * Reproducer: node sims/onion256_shamir_cross_source_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gf256,prime257}=require('./grid_shamir_rs_inverse.cjs');

const ROOT=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const SIZES=256;
const SRC='resources/cicada-hiddenservice-256-candidates.json';
const GRID='resources/liber-primus/base60-grid.json';
const XS=[2,3,4];

/** @param {number[]} a @param {ReturnType<typeof gf256>} field */
function weights(a,field){
  return XS.map((xi,i)=>{
    let w=1;
    for(let j=0;j<XS.length;j++)if(j!==i){
      const num=field.sub(a[0],XS[j]);
      const den=field.sub(xi,XS[j]);
      w=field.mul(w,field.mul(num,field.inverse(den)));
    }
    return w;
  });
}

/** @param {{mul:Function,add:Function}} field @param {number[]} ys @param {number[]} w */
function estimate(field,ys,w){
  let v=0;
  for(let i=0;i<3;i++)v=field.add(v,field.mul(ys[i],w[i]));
  return v;
}

/**
 * @param {number[][]} onions 3 x 256
 * @param {number[]} grid 256
 * @param {ReturnType<typeof gf256>} field
 */
function scan(onions,grid,field) {
  const order=field.id==='GF257'?257:256;
  const scored=[];
  for(let x=0;x<order;x++){
    if(XS.includes(x))continue;
    const w=weights([x],field);
    let equal=0,allZero=true;
    for(let byte=0;byte<SIZES;byte++){
      const y=estimate(field,onions.map(a=>a[byte]),w);
      equal+=Number(y===grid[byte]);
      allZero=allZero&&y===grid[byte];
    }
    scored.push({x,equal});
  }
  scored.sort((a,b)=>b.equal-a.equal||a.x-b.x);
  return {xCandidates:scored.length,top:scored.slice(0,3),
    naturalX1Matches:scored.find(s=>s.x===1).equal,
    fullDegree2ShareInterpolants:scored.filter(s=>s.equal===SIZES).length};
}

/** Create degree2 Shamir rows from 256 independent secret coefficients. */
function plant(field,gridX){
  let state=0x3301fa31;
  const rand=()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
  const order=field.id==='GF257'?257:256;
  const onions=[[],[],[]],grid=[];
  for(let i=0;i<SIZES;i++){
    const coeff=[rand()%order,rand()%order,1+rand()%(order-1)];
    const at=x=>field.add(coeff[0],field.add(
      field.mul(coeff[1],x),field.mul(coeff[2],field.mul(x,x))));
    for(let j=0;j<3;j++)onions[j].push(at(XS[j]));
    grid.push(at(gridX));
  }
  const result=scan(onions,grid,field);
  assert.equal(result.top[0].x,gridX);
  assert.equal(result.top[0].equal,SIZES);
  assert.equal(result.fullDegree2ShareInterpolants,1);
  return {field:field.id,gridX,matched:SIZES,uniqueReconstruction:true};
}

/** @param {number[]} raw */
function geometries(raw){
  const column=Array.from({length:SIZES},(_,i)=>
    raw[(i%32)*8+Math.floor(i/32)]);
  return [['row',raw],['reverse-row',raw.slice().reverse()],
    ['column',column],['reverse-column',column.slice().reverse()]];
}

/** Recheck altered transcription by only substituting the five audited cells. */
function correctedGrid(raw){
  assert.deepEqual([raw[45],raw[50],raw[165],raw[172],raw[246]],
    [107,47,18,148,198]);
  const arr=raw.slice();
  for(const [i,v] of [[45,81],[50,21],[165,47],[172,174],[246,224]])
    arr[i]=v;
  return arr;
}

function run(){
  const source=read(SRC);
  const onions=source.sourceServices.map(s=>{
    assert.match(s.hex,/^[0-9a-f]{512}$/);
    return Array.from(Buffer.from(s.hex,'hex'));
  });
  assert.deepEqual(source.sourceServices.map(s=>s.id),['onion2','onion3','onion4']);
  assert.ok(onions.length===3&&onions.every(a=>a.length===SIZES));
  const raw=read(GRID).byte_rows.flat();
  assert.equal(raw.length,SIZES);
  const fields=[gf256(0x11b),gf256(0x11d),prime257()];
  const tested=[];
  for(const field of fields){
    for(const [version,grid] of [['canonical',raw],['five-cell-corrected',correctedGrid(raw)]]){
      for(const [layout,bytes] of geometries(grid)){
        const result=scan(onions,bytes,field);
        assert.equal(result.fullDegree2ShareInterpolants,0);
        tested.push({field:field.id,version,layout,...result});
      }
    }
  }
  const controls=fields.flatMap(field=>[1,157].map(x=>plant(field,x)));
  const maxMatches=tested.reduce((best,x)=>Math.max(best,x.top[0].equal),0);
  const closest=tested.filter(x=>x.top[0].equal===maxMatches)
    .map(x=>({field:x.field,version:x.version,layout:x.layout,...x.top[0]}));
  const output={
    source:'Three historical hidden-service 256-byte blobs plus LP2 256-byte base60 table',
    test:'3-of-4 or weaker Shamir degree <=2 at aligned byte positions, labeled onion x=2,3,4, grid unknown fixed x',
    fields:['GF256/0x11b','GF256/0x11d','GF257'],
    gridVersionCount:2,gridLayoutCount:4,
    originalVersions:tested,
    largestCoincidence:maxMatches,largestCoincidenceCases:closest,
    verifiedFullSourceShareRelations:0,
    syntheticControls:controls,
    scope:'Exact fixed-coordinate degree<=2 sharing; does not test degree3 4-of-4, distinct onion byte offsets, per-byte coordinates, nonlinear KDF, or independent sources.'
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}
if(require.main===module)run();
module.exports={weights,estimate,scan,geometries,correctedGrid,plant,run};
