"use strict";
/**
 * All-offset original CicadaOS DATA/560.13 key search on the 12 GP28
 * predecessor-excluding transitions of the independently proposed p0 title.
 *
 * The original first13 GP29 ciphertext are unmodified. The hypothesized
 * plaintext EPIPHANY SEECS has all 13 rune values non-F, so the historically
 * attested plaintext-F bypass cannot disrupt the 12 consumed title keys.
 *
 * Two explicit reversible rank grammars:
 *   sorted: omit previous ciphertext rune from ascending GP29 alphabet
 *   cyclic: omit previous rune from clockwise GP29 successor order
 * Then R[i] = (P[i]-1 + source_key[j] + secret_bias) mod 28.
 * The arbitrary secret additive bias cancels in successive comparisons.
 *
 * Every byte offset in a size/hash-checked original CicadaOS file, both
 * byte directions and two fixed byte->GP28 maps are tested exhaustively.
 * If a genuine title hit exists, heldout ROAD/DEVOTED original ciphertext
 * is checked allowing all reachable plaintext-F key skips between spans.
 *
 * Node.js 22 CommonJS, read-only, no language-scoring key selection.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const p0=corpus.pages.find(x=>x.page===0).indices;
const GP=29,BASE=28;
/** @param {number} n @returns {number} */
const m28=n=>(n%28+28)%28;
const plain=new Map([
 [0,18],[1,13],[2,10],[3,13],[4,8],[5,24],[6,9],
 [7,26],[8,15],[9,18],[10,18],[11,5],[12,15],
 [103,2],[104,18],[105,4],[106,3],[107,24],[108,23],
 [235,2],[236,18],[237,23],[238,18],[239,1],
 [240,3],[241,16],[242,18],[243,23]
]);
const spanStarts=[1,103,235],spanLengths=[12,6,9];
const projections=[
 {name:"byte_mod28",lut:Uint8Array.from({length:256},(_,i)=>i%28)},
 {name:"byte_balanced28",lut:Uint8Array.from({length:256},
   (_,i)=>Math.floor(i*28/256))}
];
/**
 * @param {number} cipher
 * @param {number} previous
 * @param {"sorted"|"cyclic"} mode
 * @returns {number} rank from0 through27
 */
function rank(cipher,previous,mode){
 assert.ok(cipher!==previous,"plaintext non-F cannot produce repeated ciphertext");
 return mode==="sorted"
   ?cipher-(cipher>previous?1:0)
   :(cipher-previous-1+GP)%GP;
}
/**
 * @param {number} value
 * @param {number} previous
 * @param {"sorted"|"cyclic"} mode
 * @returns {number} cipher rune0..28, never equal previous
 */
function unrank(value,previous,mode){
 assert.ok(value>=0&&value<BASE);
 return mode==="sorted"
   ?value+(value>=previous?1:0)
   :(previous+1+value)%GP;
}
/**
 * @param {number[]} cipher
 * @param {Map<number,number>} clear
 * @param {number} first
 * @param {number} count
 * @param {"sorted"|"cyclic"} mode
 * @returns {number[]} needed source residues up to common additive bias
 */
function required(cipher,clear,first,count,mode){
 const a=[];
 for(let i=first;i<first+count;i++){
   const p=clear.get(i);
   assert.ok(p>0&&p<GP,"every frozen crib rune must consume a key");
   a.push(m28(rank(cipher[i],cipher[i-1],mode)-(p-1)));
 }
 return a;
}
/**
 * @param {Buffer} data
 * @param {number} start
 * @param {1|-1} direction
 * @param {Uint8Array} lut
 * @param {number[]} requiredKey
 * @param {number} secretBias
 * @param {number} consumedFromTitle
 * @param {number} lastFeasibleConsumed
 * @returns {number[]} possible original-cipher key clocks
 */
function findSpan(data,start,direction,lut,requiredKey,
    secretBias,consumedFromTitle,lastFeasibleConsumed){
 const ret=[];
 for(let consumed=consumedFromTitle;consumed<=lastFeasibleConsumed;consumed++){
   let correct=true;
   for(let j=0;j<requiredKey.length;j++){
     const address=start+direction*(consumed+j);
     if(address<0||address>=data.length||
        m28(lut[data[address]]+secretBias)!==requiredKey[j]){
       correct=false;break;
     }
   }
   if(correct)ret.push(consumed);
 }
 return ret;
}
/**
 * Scan every key start for the entire frozen 12-rune non-F title.
 * A successful exact source candidate is followed through the independently
 * predicted ROAD and DEVOTED passages with arbitrary hidden-F clock skips.
 * @param {Buffer} data
 * @param {Uint8Array} lut
 * @param {1|-1} direction
 * @param {number[]} title
 * @param {number[]} road
 * @param {number[]} devoted
 * @returns {object}
 */
function scan(data,lut,direction,title,road,devoted){
 const min=direction===1?0:243;
 const max=direction===1?data.length-244:data.length-1;
 const target=title.map(x=>m28(x-title[0]));
 let bestRun=0, bestStart=-1,titleHits=0,
   roadHits=0,devotedHits=0;
 const candidates=[];
 for(let start=min;start<=max;start++){
   const k0=lut[data[start]];
   // The first 11 comparisons are independent of secret constant bias.
   let matched=1;
   for(;matched<12;matched++){
     const source=lut[data[start+direction*matched]];
     if(m28(source-k0)!==target[matched])break;
   }
   if(matched>bestRun){bestRun=matched;bestStart=start;}
   if(matched!==12)continue;
   titleHits++;
   const bias=m28(title[0]-k0);
   // Real title consumes12 source keys. Between title's last rune12 and
   // ROAD's first rune103, original positions13..102 consume 0..90 keys.
   const roadOffsets=findSpan(data,start,direction,lut,road,
     bias,12,102);
   if(roadOffsets.length)roadHits++;
   const pairs=[];
   for(const r of roadOffsets){
     // ROAD consumes six keys. Positions109..234 consume0..126 keys.
     const next=findSpan(data,start,direction,lut,devoted,
       bias,r+6,r+132);
     for(const d of next)pairs.push({roadConsumed:r,devotedConsumed:d});
   }
   if(pairs.length)devotedHits++;
   if(candidates.length<25)candidates.push({
     originalSourceOffset:start,bias,roadOffsets,
     validTitleRoadDevotedClocks:pairs});
 }
 return {sourceOffsetsTested:Math.max(0,max-min+1),bestRun,bestStart,
   exactTitleHits:titleHits,roadHits,devotedHits,candidates};
}
/** @returns {Buffer} */
function randomFile(){
 let x=0x33012013;
 const b=Buffer.alloc(1100);
 for(let i=0;i<b.length;i++){
   x^=x<<13;x^=x>>>17;x^=x<<5;
   b[i]=x&255;
 }
 return b;
}
/** Source-native known-plaintext plant includes hidden-F skips across spans.
 * @param {Buffer} data
 * @param {Uint8Array} lut
 * @param {1|-1} direction
 * @param {"sorted"|"cyclic"} mode
 * @param {number} start
 * @returns {number[]}
 */
function plant(data,lut,direction,mode,start){
 const c=new Array(244);c[0]=p0[0];
 let consumed=0;
 for(let i=1;i<244;i++){
   const p=plain.get(i)??(i%13===0?0:1+i%28);
   if(p===0){c[i]=c[i-1];continue;}
   const source=lut[data[start+direction*consumed]];
   const r=m28(p-1+source+7);
   c[i]=unrank(r,c[i-1],mode);
   assert.equal(rank(c[i],c[i-1],mode),r);
   consumed++;
 }
 return c;
}
function positiveControls(){
 const data=randomFile(),out=[];
 for(const mode of ["sorted","cyclic"])
 for(const {name,lut} of projections)
 for(const direction of [1,-1]){
   const start=direction===1?50:1010;
   const c=plant(data,lut,direction,mode,start);
   const title=required(c,plain,1,12,mode);
   const road=required(c,plain,103,6,mode);
   const devoted=required(c,plain,235,9,mode);
   const result=scan(data,lut,direction,title,road,devoted);
   const found=result.candidates.find(x=>
     x.originalSourceOffset===start&&x.bias===7&&
     x.validTitleRoadDevotedClocks.length);
   assert.ok(found, "failed exact planted source-key recovery: "+name+"/"+mode+"/"+direction);
   out.push({mode,projection:name,direction,knownOffset:start,
     exactCribs:27,recoversAuthenticKeyAndBypass:true});
 }
 return out;
}
function main(){
 assert.equal(p0.length,262);
 assert.equal(plain.size,28);
 assert.deepEqual(p0.slice(0,13),[15,8,18,3,6,19,27,0,15,26,18,21,5]);
 const positives=positiveControls(),file=process.env.CICADA_ISO_56013_PATH;
 assert.ok(file,"Set CICADA_ISO_56013_PATH to authentic CicadaOS DATA/560.13");
 const data=fs.readFileSync(file);
 assert.equal(data.length,118818811);
 const sha256=crypto.createHash("sha256").update(data).digest("hex");
 assert.equal(sha256,
   "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
 const findings=[];
 for(const mode of ["sorted","cyclic"]){
   const title=required(p0,plain,1,12,mode);
   const road=required(p0,plain,103,6,mode);
   const devoted=required(p0,plain,235,9,mode);
   for(const {name,lut} of projections)for(const direction of [1,-1]){
     const out=scan(data,lut,direction,title,road,devoted);
     findings.push({mode,projection:name,direction,...out});
     console.log(JSON.stringify({mode,projection:name,direction,
       bestRun:out.bestRun,exactTitleHits:out.exactTitleHits,
       titleAndRoadHits:out.roadHits,allThreeHits:out.devotedHits}));
   }
 }
 const totalTitle=findings.reduce((s,x)=>s+x.exactTitleHits,0);
 const totalAll=findings.reduce((s,x)=>s+x.devotedHits,0);
 const result={original:{runes:262,titleNonFCipherTransitions:12,
   heldoutRoad:6,heldoutDevoted:9,sourceBytes:data.length,sha256},
   cipher:"full-length source-byte GP28 rank additive pad, unknown bias",
   test:"all byte starts × two rank grammars × two byte projections × two directions",
   nativePositivePlants:positives,
   findings,
   decision:totalAll
     ?"Three independent original p0 cribs match source key; inspect candidates with unrelated plaintext"
     :totalTitle
     ?"Title-matching source key candidates exist; inspect holdouts and source mechanism"
     :"No exact GP28 predecessor-exclusion source key for the full source-predicted p0 title"
 };
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,scan,rank,unrank,required,positiveControls};
