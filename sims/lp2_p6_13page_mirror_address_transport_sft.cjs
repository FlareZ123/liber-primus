"use strict";
/**
 * P6 13-page mirror address operator: six paired original-receiver endpoints
 * and the independently selected singleton center.
 *
 * node sims/lp2_p6_13page_mirror_address_transport_sft.cjs
 *
 * No authenticated signed-source target rune values, source GP0s, fitted
 * additive keys or English-language scoring are read.
 */
const fs=require("node:fs"),path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const runes=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29;
const h4=z=>[mod(z[0]-z[3]),mod(z[1]-z[2]),
             mod(z[1]+z[2]),mod(z[0]+z[3])];
const gp0=v=>mod(v.reduce((s,x)=>s+x,0));
const oneWordPages=new Set([0,1]); // source+mirror-target outer K block
function words(page){
  if(page===50)return[];
  const input=parts[page>50?page-1:page],out=[];
  assert.equal(typeof input,"string");
  let vals=[],start=0,offset=0;
  const flush=after=>{
    if(vals.length){
      out.push({start,values:vals.slice(),after});
      vals=[];
    }
  };
  for(const c of input){
    const n=runes.get(c);
    if(n!==undefined){
      if(vals.length===0)start=offset;
      vals.push(n);offset++;
    }else if(!/[\s/]/u.test(c))flush(c);
  }
  flush("");
  assert.equal(offset,corpus.pages[page].indices.length);
  return out;
}
const wordMap=Array.from({length:56},(_,i)=>words(i));
function candidates(page,length,oneWord=false) {
  const w=wordMap[page]||[],out=[];
  for(let i=0;i<w.length;i++){
    let values=[];
    for(let j=i;j<w.length;j++){
      values.push(...w[j].values);
      if(values.length>=length){
        if(values.length===length && (!oneWord||i===j))
          out.push({start:w[i].start,values,after:w[j].after,
                    nwords:j-i+1,gp0:gp0(values)});
        break;
      }
    }
  }
  return out;
}
function permutations(a){
  if(a.length===0)return[[]];
  const result=[];
  for(let i=0;i<a.length;i++)
    for(const tail of permutations(a.filter((_,j)=>j!==i)))
      result.push([a[i],...tail]);
  return result;
}
const title=[71,75,76,80].map(i=>wordMap[6].find(w=>w.start===i));
assert.ok(title.every(Boolean));
const widths=title.map(w=>w.values.length),H=h4(widths),F=0;
assert.deepEqual(widths,[4,1,4,2]);
assert.deepEqual(H,[2,26,5,6]);
assert.deepEqual(title.map(w=>w.values),[
  [24,16,14,17],[19],[6,27,15,17],[14,12]
]);
const [K,negativeE,g,a]=H,e=mod(-negativeE),q=widths[0],u=title[3].values[1];
assert.deepEqual([K,e,g,a,q,u,F],[2,3,5,6,4,12,0]);

// Exact reversal of physical source/index lanes in the 13-page 2|4|1|4|2
// corridor. Outer K pages 30,31 map to 42,41; inner q pages
// 32,33,34,35 map to 40,39,38,37. p36 remains its own singleton.
const Qouter=[e,K],Douter=[u,-a];         // p6 width H and final red rune
const Qinner=[widths[1],F,K,q];             // [1,0,2,4] literal width/Fehu
const Dinner=[u,F,-g,g];                   // [12,0,-5,5] title/Fehu/H
const Q=[...Qouter,...Qinner],D=[...Douter,...Dinner],
      delta=Q.map((v,i)=>29*v+D[i]);
assert.deepEqual(Q,[3,2,1,0,2,4]);
assert.deepEqual(D,[12,-6,12,0,-5,5]);
assert.deepEqual(delta,[99,52,41,0,53,121]);
const first=[30,31,32,33,34,35];
const mirror=[42,41,40,39,38,37];
const firstLengths=[4,3,3,4,2,5],targetLengths=[8,7,4,5,6,4];
const poolsA=first.map((p,i)=>candidates(p,firstLengths[i],oneWordPages.has(i)));
const poolsB=mirror.map((p,i)=>candidates(p,targetLengths[i],oneWordPages.has(i)));
const lanes=first.map((p,i)=>{
  const options=new Map(poolsB[i].map(z=>[z.start,z]));
  return poolsA[i].flatMap(source=>{
    const target=options.get(source.start+delta[i]);
    return target?[[source,target]]:[];
  });
});
assert.deepEqual(lanes.map(x=>x.length),[1,1,1,1,1,1]);
const selected=lanes.map(x=>({
  source:x[0][0].start,target:x[0][1].start,
  sourceGP0:x[0][0].gp0,targetGP0:x[0][1].gp0,
  sourceWords:x[0][0].nwords,targetWords:x[0][1].nwords
}));
assert.deepEqual(selected.map(x=>[x.source,x.target]),[
  [112,211],[126,178],[30,71],[132,132],[4,57],[25,146]
]);
assert.deepEqual([selected[0].targetGP0,selected[1].targetGP0],[6,6]);
assert.equal(poolsB[0].find(x=>x.start===211).values[1],F); // p42 F
assert.equal(poolsB[1].find(x=>x.start===178).values[3],F); // p41 F
const firstQsum=mod(lanes.slice(2).reduce((s,l)=>s+l[0][0].gp0,0));
const thirdQsum=mod(lanes.slice(2).reduce((s,l)=>s+l[0][1].gp0,0));
assert.deepEqual([firstQsum,thirdQsum],[13,24]);

const p6BlockChecksum=[mod(F-title[0].values[1]),title[0].values[1],
                       title[0].values[0],title[3].values[1]];
assert.deepEqual(p6BlockChecksum,[13,16,24,12]);
// P36 is not selected by the six-pair mirror; it has its own independent
// p6 q-marker center-removal selector.
const center=wordMap[36].find(w=>w.start===169);
assert.deepEqual(center.values,[2,22,4,1,20]);
assert.equal(center.values[2],q);
const p36Prepared=[...center.values.slice(0,2),...center.values.slice(3)];
const p41Prepared=poolsB[1].find(w=>w.start===178).values.filter((_,i)=>i!==3);
const p42Prepared=poolsB[0].find(w=>w.start===211).values.filter((_,i)=>i!==1);
assert.deepEqual([
  firstQsum,gp0(p36Prepared),thirdQsum,
  mod(gp0(p41Prepared)+gp0(p42Prepared))
],p6BlockChecksum);

// Finite post-discovery visual family. Inner q Q is *every* permutation of
// [printed singleton width, Fehu, K, q]; inner q D is *every* permutation
// [last p6 red title rune, Fehu, -g, g]. Original start-only candidate
// pools are not restricted by previous H4 receiver-residue rules.
// At each complete six-pair candidate, block1/3 GP0 checks are computed on
// the original ciphertext, independent of known signed target rune values.
const innerQ=permutations([widths[1],F,K,q]);
const innerD=permutations([u,F,-g,g]);
assert.equal(innerQ.length*innerD.length,576);
let innerViablePackets=0,innerCompletePairs=0,innerFirstSum=0,
    innerThirdSum=0;
const innerJoint=[];
const innerA=poolsA.slice(2),innerB=poolsB.slice(2);
const innerDestSets=innerB.map(v=>new Map(v.map(x=>[x.start,x])));
for(const qq of innerQ)for(const dd of innerD){
  const ls=innerA.map((source,i)=>source.flatMap(x=>{
    const y=innerDestSets[i].get(x.start+29*qq[i]+dd[i]);
    return y?[[x,y]]:[];
  }));
  if(ls.some(x=>x.length===0))continue;
  innerViablePackets++;
  for(const a of ls[0])for(const b of ls[1])
  for(const c of ls[2])for(const d of ls[3]){
    innerCompletePairs++;
    const pairs=[a,b,c,d];
    const s1=mod(pairs.reduce((s,z)=>s+z[0].gp0,0));
    const s3=mod(pairs.reduce((s,z)=>s+z[1].gp0,0));
    if(s1===p6BlockChecksum[0])innerFirstSum++;
    if(s3===p6BlockChecksum[2])innerThirdSum++;
    if(s1===p6BlockChecksum[0]&&s3===p6BlockChecksum[2])
      innerJoint.push({Q:qq,D:dd,X:pairs.map(x=>x[0].start),
        Y:pairs.map(x=>x[1].start),sums:[s1,s3]});
  }
}
assert.deepEqual([innerViablePackets,innerCompletePairs,
                  innerFirstSum,innerThirdSum,innerJoint.length],
                 [10,27,1,1,1]);
assert.deepEqual(innerJoint,[{
  Q:Qinner,D:Dinner,X:[30,132,4,25],
  Y:[71,132,57,146],sums:[13,24]
}]);

// Outer K family: sign and position of the pair of distinct H4 title
// width fields [e,K] and the red-title/H pair [u,a]. 8x8=64 packets.
const outerQ=new Map(),outerD=new Map();
for(const order of permutations([e,K]))
for(const s of [1,-1])
for(const t of [1,-1]){
  const z=[order[0]*s,order[1]*t];outerQ.set(z.join(","),z);
}
for(const order of permutations([u,a]))
for(const s of [1,-1])
for(const t of [1,-1]){
  const z=[order[0]*s,order[1]*t];outerD.set(z.join(","),z);
}
assert.deepEqual([outerQ.size,outerD.size],[8,8]);
let outerViablePackets=0,outerCompletePairs=0,outerMarkerHits=0;
const outerMarked=[];
const outerDestSets=poolsB.slice(0,2).map(v=>new Map(v.map(x=>[x.start,x])));
for(const qq of outerQ.values())
for(const dd of outerD.values()){
  const ls=poolsA.slice(0,2).map((src,i)=>src.flatMap(x=>{
    const y=outerDestSets[i].get(x.start+29*qq[i]+dd[i]);
    return y?[[x,y]]:[];
  }));
  if(!ls[0].length||!ls[1].length)continue;
  outerViablePackets++;
  for(const a of ls[0])for(const b of ls[1]){
    outerCompletePairs++;
    if(a[1].values[1]===F && b[1].values[3]===F){
      outerMarkerHits++;
      outerMarked.push({Q:qq,D:dd,X:[a[0].start,b[0].start],
                        Y:[a[1].start,b[1].start]});
    }
  }
}
assert.deepEqual([outerViablePackets,outerCompletePairs,outerMarkerHits],
                 [2,2,1]);
assert.deepEqual(outerMarked,[{
  Q:Qouter,D:Douter,X:[112,126],Y:[211,178]
}]);
assert.equal(innerQ.length*innerD.length*outerQ.size*outerD.size,36864);
assert.equal(innerViablePackets*outerViablePackets,20);
assert.equal(innerCompletePairs*outerCompletePairs,54);
assert.equal(innerJoint.length*outerMarked.length,1);

// Full original-manuscript displacement check, no inherited H4 receiver
// start-residue predicate, no language filter. The 13-page span fits at
// starts 0..43 inclusive. Each outer K endpoint must be one printed word.
const shiftHits=[];
for(let origin=0;origin<=43;origin++){
  const pairs=firstLengths.map((len,i)=>{
    const source=candidates(origin+i,len,oneWordPages.has(i));
    const destination=new Map(
      candidates(origin+12-i,targetLengths[i],oneWordPages.has(i))
        .map(z=>[z.start,z]));
    return source.flatMap(x=>{
      const y=destination.get(x.start+delta[i]);
      return y?[[x,y]]:[];
    });
  });
  if(pairs.some(v=>!v.length))continue;
  const n=pairs.reduce((x,v)=>x*v.length,1);
  shiftHits.push({origin,pairCounts:pairs.map(v=>v.length),n,
    starts:pairs.map(v=>[v[0][0].start,v[0][1].start])});
}
assert.deepEqual(shiftHits,[{
  origin:30,pairCounts:[1,1,1,1,1,1],n:1,
  starts:[[112,211],[126,178],[30,71],[132,132],[4,57],[25,146]]
}]);
console.log(JSON.stringify({
  status:"PASS",source:"original LP2 transcripts plus p6 layout only",
  p6:{widths,H,F,K,e,g,a,q,u,
    Qouter,Douter,Qinner,Dinner,delta,p6BlockChecksum},
  physical:{first,mirror,firstLengths,targetLengths,
    sourcePoolSizes:poolsA.map(x=>x.length),
    targetPoolSizes:poolsB.map(x=>x.length),selected,
    center:{page:36,start:169,prepared:p36Prepared}},
  visualCharge:{
    inner:{packets:576,viable:innerViablePackets,pairs:innerCompletePairs,
      firstGP0:innerFirstSum,thirdGP0:innerThirdSum,joint:innerJoint},
    outer:{packets:64,viable:outerViablePackets,pairs:outerCompletePairs,
      markerHits:outerMarkerHits,marked:outerMarked},
    sixLane:{packetFamily:36864,eligiblePacketCombinations:20,
             fullPairCombinations:54,checksumAndMarkerSolutions:1}
  },
  shiftedPhysical:{windows:44,hits:shiftHits},
  caveat:"Both source-visible packet role/sign orders were recognized after target corridor; no decrypted unknown LP2 plaintext or complete key"
},null,2));
