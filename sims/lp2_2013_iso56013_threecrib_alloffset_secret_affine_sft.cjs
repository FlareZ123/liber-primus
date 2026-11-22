"use strict";
/**
 * Exact source-key search: all byte starts of genuine 2013 CicadaOS DATA/560.13
 * against the 28 already source-predicted p0 GP29 crib positions.
 *
 * Fully secret affine decryption family C=a*P+b*S+d (mod29), a,b nonzero.
 * For every source offset, projection, and forward/backward byte direction, a
 * complete three-row linear system infers a,b,d algebraically from crib inputs.
 * The remaining 25 original positions are untouched holdouts. A matching
 * 13-rune title triggers further checks at the two separate original spans.
 *
 * No candidate key is fitted by English text scoring. No original plaintext
 * is claimed by a negative. External file is verified by original SHA-256.
 * Node.js 22 CommonJS, Windows 11, read-only source SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const p0=corpus.pages.find(x=>x.page===0).indices;
const known=[
 [0,18],[1,13],[2,10],[3,13],[4,8],[5,24],[6,9],
 [7,26],[8,15],[9,18],[10,18],[11,5],[12,15],
 [103,2],[104,18],[105,4],[106,3],[107,24],[108,23],
 [235,2],[236,18],[237,23],[238,18],[239,1],
 [240,3],[241,16],[242,18],[243,23]
];
const POS=known.map(x=>x[0]);
const P=known.map(x=>x[1]);
const C=known.map(x=>p0[x[0]]);
const mod=n=>(n%29+29)%29;
const INV=new Uint8Array(29);
for(let i=1;i<29;i++)for(let j=1;j<29;j++)
 if(i*j%29===1)INV[i]=j;
assert.ok(INV.slice(1).every(x=>x!==0));
assert.equal(known.length,28);
assert.deepEqual(C.slice(0,13),
 [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(C.slice(13,19),[8,12,16,8,25,27]);
assert.deepEqual(C.slice(19),[8,5,15,22,16,22,21,1,4]);
const projections=[
 {name:"byte_mod29",lut:Uint8Array.from({length:256},(_,i)=>i%29)},
 {name:"byte_balanced29",lut:Uint8Array.from({length:256},
   (_,i)=>Math.floor(i*29/256))}
];

/**
 * @param {Buffer} data
 * @param {number[]} target
 * @param {Uint8Array} lut
 * @param {1|-1} direction
 * @returns {{starts:number,bestPrefix:number,best:null|object,titleHits:object[],rankDeficient:number}}
 */
function scan(data,target,lut,direction){
 const min=direction===1?0:243;
 const max=direction===1?data.length-244:data.length-1;
 let bestPrefix=0,best=null,rankDeficient=0;
 const titleHits=[];
 const dP1=mod(P[1]-P[0]),dC1=mod(target[1]-target[0]);
 for(let start=min;start<=max;start++){
  const k0=lut[data[start]];
  const k1=lut[data[start+direction]];
  const dk1=mod(k1-k0);
  // Third basis row is chosen by source geometry alone, before full testing.
  let j=2,det=0,kj=0;
  for(;j<13;j++){
   kj=lut[data[start+direction*POS[j]]];
   det=mod(dP1*mod(kj-k0)-mod(P[j]-P[0])*dk1);
   if(det!==0)break;
  }
  if(j===13){rankDeficient++;continue;}
  const dj=mod(kj-k0),dPj=mod(P[j]-P[0]),
    dCj=mod(target[j]-target[0]);
  const inv=INV[det],
    a=mod((dC1*dj-dCj*dk1)*inv),
    b=mod((dP1*dCj-dPj*dC1)*inv);
  if(a===0||b===0)continue;
  const bias=mod(target[0]-a*P[0]-b*k0);
  let prefix=0;
  for(;prefix<known.length;prefix++){
   const key=lut[data[start+direction*POS[prefix]]];
   if(mod(a*P[prefix]+b*key+bias)!==target[prefix])break;
  }
  if(prefix>bestPrefix){
   bestPrefix=prefix;
   best={start,direction,a,b,bias,prefix};
  }
  if(prefix>=13)titleHits.push({start,direction,a,b,bias,prefix});
 }
 return {starts:Math.max(0,max-min+1),bestPrefix,best,titleHits,
   rankDeficient};
}
/** @returns {Buffer} */
function plant(){
 let x=0x33012013;
 const b=Buffer.alloc(700);
 for(let i=0;i<b.length;i++){
  x^=x<<13;x^=x>>>17;x^=x<<5;
  b[i]=x&255;
 }
 return b;
}
function positiveControls(){
 const data=plant(),out=[];
 for(const projection of projections)for(const direction of [1,-1]){
  const start=direction===1?57:560,affine=[3,5,7];
  const target=POS.map((pos,i)=>mod(affine[0]*P[i]+
    affine[1]*projection.lut[data[start+direction*pos]]+affine[2]));
  const result=scan(data,target,projection.lut,direction);
  assert.ok(result.titleHits.some(h=>
    h.start===start&&h.a===3&&h.b===5&&h.bias===7&&h.prefix===28),
    "failed exact original-layout planted affine source at "+projection.name);
  out.push({projection:projection.name,direction,sourceOffset:start,
    originalRunesRecovered:28});
 }
 return out;
}
function main(){
 const positives=positiveControls();
 const file=process.env.CICADA_ISO_56013_PATH;
 assert.ok(file,"Set CICADA_ISO_56013_PATH to the exact 2013 DATA/560.13");
 const data=fs.readFileSync(file);
 assert.equal(data.length,118818811);
 const sha256=crypto.createHash("sha256").update(data).digest("hex");
 assert.equal(sha256,
   "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
 // If all first 13 source keys are affine in their corresponding P values,
 // all possible predictions must also be affine in P. But the observed
 // original first three C are not affine in P. Such rank-2 starts are
 // genuinely impossible and may be skipped without losing a key.
 assert.notEqual(mod(mod(C[1]-C[0])*mod(P[2]-P[0])-
   mod(C[2]-C[0])*mod(P[1]-P[0])),0);
 const readings=[];
 for(const projection of projections)for(const direction of [1,-1]){
  const result=scan(data,C,projection.lut,direction);
  readings.push({projection:projection.name,direction,...result});
  console.log(JSON.stringify({checked:projection.name,direction,
    starts:result.starts,bestPrefix:result.bestPrefix,
    titleHits:result.titleHits.length}));
 }
 const out={source:{file:"2013 CicadaOS DATA/560.13",
   size:data.length,sha256},
   hypothesis:"all byte starts, two byte projections, both directions, secret a,b,d in GF29",
   originalCribs:{runicPositions:28,contiguousFirstTitle:13,
     separatedSecond:6,separatedThird:9},
   planted:positives,
   findings:readings,
   decision:readings.some(r=>r.titleHits.length)
    ?"At least one original 13-rune title key candidate requires original holdout adjudication"
    :"No affine source-byte keystream opens the original 13-rune title in the complete verified file at any start under the tested projections and directions"
 };
 console.log(JSON.stringify(out,null,2));
 return out;
}
if(require.main===module)main();
module.exports={main,scan,positiveControls};
