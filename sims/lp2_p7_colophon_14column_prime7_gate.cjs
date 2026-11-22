"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8").replace(/\r\n/g,"\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p7Jpeg = fs.readFileSync(path.join(ROOT,"resources/liber-primus/24.jpg"));
assert.equal(crypto.createHash("sha256").update(p7Jpeg).digest("hex"),"91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c");
const dots=[{x:796.94613,y:3105.73973},{x:992.46667,y:3166.68765},{x:1296.96618,y:2866.70402},{x:1479.36384,y:3127.5},{x:1527.21721,y:2936.20488}];
const dotOrder=dots.map((d,i)=>i).sort((a,b)=>dots[a].y-dots[b].y);
assert.deepEqual(dotOrder,[2,4,0,3,1]);
const colophon=corpus.pages.find(p=>p.page===7).indices.slice(-14);
assert.deepEqual(colophon,[23,3,22,16,2,25,5,7,11,14,28,6,28,19]);
const keyOrder=colophon.map((v,i)=>i).sort((a,b)=>colophon[a]-colophon[b]||a-b);
assert.deepEqual(keyOrder,[4,1,6,11,7,8,9,3,13,2,0,5,10,12]);
function fiveD(a,order){assert.equal(a.length%5,0);const h=a.length/5,o=[];for(let r=0;r<h;r++)for(const c of order)o.push(a[c*h+r]);return o;}
function fiveE(a,order){assert.equal(a.length%5,0);const h=a.length/5,c=Array.from({length:5},()=>new Array(h));for(let r=0;r<h;r++)for(let j=0;j<5;j++)c[order[j]][r]=a[5*r+j];return c.flat();}
function lens(n,w){const q=Math.floor(n/w),r=n%w;return Array.from({length:w},(_,j)=>q+(j<r?1:0));}
function colE(a,order){const l=lens(a.length,14),o=[];for(const c of order)for(let r=0;r<l[c];r++)o.push(a[r*14+c]);return o;}
function colD(a,order){const l=lens(a.length,14),c=new Array(14);let p=0;for(const j of order){c[j]=a.slice(p,p+l[j]);p+=l[j];}assert.equal(p,a.length);const o=[];for(let r=0;r<Math.max(...l);r++)for(let j=0;j<14;j++)if(r<l[j])o.push(c[j][r]);return o;}
function makePrimes(n){const p=[];for(let x=2;p.length<n;x++){let yes=true;for(let d=2;d*d<=x;d++)if(x%d===0){yes=false;break;}if(yes)p.push(x);}return p;}
const primes=makePrimes(4000);
function firstDead(a,start){let states=new Set([0]);for(let i=0;i<a.length;i++){const next=new Set();for(const used of states){const d=(a[i]-(primes[start+used]-1)%29+29)%29;if(d!==0)next.add(used+1);if(a[i]===0)next.add(used);}if(!next.size)return i;states=next;}return null;}
const p8to14=corpus.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
assert.equal(p8to14.length,1729);
const mixed=[...p8to14.slice(0,692),29,...p8to14.slice(692)];
assert.equal(mixed.length,1730);
const moved=fiveD(mixed,dotOrder);
assert.equal(moved[0],29);
const afterHeader=moved.slice(1);
assert(afterHeader.every(x=>x>=0&&x<29));
const p8Starts=[0,3,6,7],p8Expected={decrypt:[118,20,1,31],encrypt:[23,0,25,27]};
const p8Trials=[];
for(const [direction,fn] of [["decrypt",colD],["encrypt",colE]]){
 const candidate=fn(afterHeader,keyOrder),dead=p8Starts.map(s=>firstDead(candidate,s));
 assert.deepEqual(dead,p8Expected[direction]);
 dead.forEach((v,i)=>p8Trials.push({direction,startPrime:primes[p8Starts[i]],firstImpossibleRune:v}));
}
const p3to7=corpus.pages.filter(p=>p.page>=3&&p.page<=7).flatMap(p=>p.indices);
assert.equal(p3to7.length,1145);
const p3afterFive=fiveD(p3to7,dotOrder),p3Starts=[3,6,7];
const p3Expected={decrypt:[11,57,0],encrypt:[23,67,17]},p3Trials=[];
for(const [direction,fn] of [["decrypt",colD],["encrypt",colE]]){
 const candidate=fn(p3afterFive,keyOrder),dead=p3Starts.map(s=>firstDead(candidate,s));
 assert.deepEqual(dead,p3Expected[direction]);
 dead.forEach((v,i)=>p3Trials.push({direction,startPrime:primes[p3Starts[i]],firstImpossibleRune:v}));
}
const model=buildSourceNativeTrigramModel({corpus,referenceText});
const expected=[-3.420498369333558,-3.410259423427387,-3.421659553188172,-3.415899012533837,-3.417171233862308,-3.403574173199033,-3.4055431349286014,-3.4143462381241125];
const direct=[];
for(const reverse of [false,true]){const k=reverse?colophon.slice().reverse():colophon;for(const sign of [-1,1])for(const offset of [0,7]){const p=afterHeader.map((c,i)=>(c+sign*k[(i+offset)%14]+29)%29);direct.push({reverse,sign,offset,score:model.scoreStream(p).mean});}}
direct.forEach((x,i)=>assert(Math.abs(x.score-expected[i])<1e-10));
assert(Math.max(...direct.map(x=>x.score))< -3.4);
assert(Math.abs(model.p57Score-(-2.468144714244746))<1e-10);
const training=encodeSourceNativeGP(referenceText);
assert.equal(training.length,3510);
const plant=training.slice(0,1729);
let used=0;const plantCipher=[];
for(const p of plant){if(p===0)plantCipher.push(0);else{plantCipher.push((p+(primes[3+used]-1)%29)%29);used++;}}
const plantAfter14=colE(plantCipher,keyOrder),plantRaw=fiveE([29,...plantAfter14],dotOrder);
const plantUnwrapped=fiveD(plantRaw,dotOrder);
assert.equal(plantUnwrapped[0],29);
const plantRecoveredCipher=colD(plantUnwrapped.slice(1),keyOrder);
assert.deepEqual(plantRecoveredCipher,plantCipher);
assert.equal(firstDead(plantRecoveredCipher,3),null);
let consumed=0;
const plantRecovered=plantRecoveredCipher.map((c,i)=>{const p=plant[i];if(p===0){assert.equal(c,0);return 0;}const v=(c-(primes[3+consumed]-1)%29+29)%29;consumed++;return v;});
assert.deepEqual(plantRecovered,plant);
assert.equal(consumed,used);
console.log(JSON.stringify({status:"bounded original-input negative; no unknown plaintext or key",dotOrder,colophon,keyOrder,p8Trials,p3Trials,directKeyTrials:direct,p57Score:model.p57Score,positivePlant:{runes:plant.length,exactRoundTrip:true,allFBranchReachability:true,primeStart:7,consumedPrimes:used}},null,2));
