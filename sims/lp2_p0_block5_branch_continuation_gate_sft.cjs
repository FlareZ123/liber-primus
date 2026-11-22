"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8").replace(/\r\n/g,"\n");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const dictionary=read("resources/control/english_wordfreq_textblob.txt");
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices),T=corpus.translit;
assert.equal(grid.length,729);
const at=(r,c)=>grid[(r-1)*27+c-1],mod=x=>(x%29+29)%29;
function phi(n){let v=n,x=n;for(let p=2;p*p<=x;p++)if(x%p===0){while(x%p===0)x/=p;v-=v/p}if(x>1)v-=v/x;return v}
function mu(n){let x=n,s=1;for(let p=2;p*p<=x;p++)if(x%p===0){x/=p;s=-s;if(x%p===0)return 0;while(x%p===0)x/=p}return x>1?-s:s}
const tokens=T.map((token,ordinal)=>({token,ordinal})).sort((a,b)=>b.token.length-a.token.length);
function encodeNative(word){
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<word.length;){
    if(word.startsWith("ING",i)){out.push(21);i+=3;continue}
    if(word.startsWith("IO",i)){out.push(27);i+=2;continue}
    const token=tokens.find(row=>word.startsWith(row.token,i));
    if(!token)return null;
    out.push(token.ordinal);i+=token.token.length;
  }
  return out;
}
const words=[];
for(const line of dictionary.split("\n")){
  const m=/^([a-z]+) (\d+)$/.exec(line.trim()); if(!m)continue;
  const runes=encodeNative(m[1]); if(runes)words.push({word:m[1],frequency:Number(m[2]),runes});
}
function bestPrefix(stream,minFrequency=100){
  let best={depth:0,word:null,frequency:0};
  for(const row of words){
    if(row.frequency<minFrequency||row.runes.length>stream.length)continue;
    if(!row.runes.every((v,i)=>v===stream[i]))continue;
    if(row.runes.length>best.depth||(row.runes.length===best.depth&&row.frequency>best.frequency)){
      best={depth:row.runes.length,word:row.word,frequency:row.frequency};
    }
  }
  return best;
}
const key5=[T.indexOf("NG"),T.indexOf("T"),T.indexOf("NG")];
assert.deepEqual(key5.map(i=>T[i]),["NG","T","NG"]);
function decryptCells(cells,key){
  return cells.map(([r,c],i)=>mod(at(r,c)-key[i%key.length]));
}
const branches=[
  {name:"I MAY",cells:[[26,19],[26,18],[26,17],[26,16]],expected:["I","M","A","Y"]},
  {name:"X EARTH",cells:[[14,7],[15,7],[16,7],[17,7],[18,7]],expected:["X","EA","R","TH","IA"]},
];
for(const branch of branches)assert.deepEqual(decryptCells(branch.cells,key5).map(i=>T[i]),branch.expected);

const directions=[];
for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)directions.push([dr,dc]);

function continuationFamily(endpoint){
  const rows=[];
  for(const [ndr,ndc] of directions){
    const center=[endpoint[0]+ndr,endpoint[1]+ndc];
    const other=[endpoint[0]+2*ndr,endpoint[1]+2*ndc];
    if([...center,...other].some(v=>v<1||v>27))continue;
    const raw=[at(...endpoint),at(...center),at(...other)];
    if(raw[0]!==raw[2]||raw[1]===0)continue;
    const derived=[raw[0],phi(raw[1]),raw[2]];
    const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
    const key=derived.slice(rotation).concat(derived.slice(0,rotation));
    const distance=phi(raw[1]);
    for(const [mdr,mdc] of directions){
      const start=[center[0]+mdr*distance,center[1]+mdc*distance];
      if(start.some(v=>v<1||v>27))continue;
      for(const [rdr,rdc] of directions){
        const stream=[]; let r=start[0],c=start[1];
        for(let i=0;i<12;i++){
          if(r<1||r>27||c<1||c>27)break;
          stream.push(mod(at(r,c)-key[i%3])); r+=rdr;c+=rdc;
        }
        rows.push({endpoint,nodeDirection:[ndr,ndc],center,other,raw,derived,rotation,key,distance,moveDirection:[mdr,mdc],start,readDirection:[rdr,rdc],stream,...bestPrefix(stream)});
      }
    }
  }
  rows.sort((a,b)=>b.depth-a.depth||b.frequency-a.frequency);
  return rows;
}

function bestTwoPrefix(stream,minFrequency=100){
  let best={depth:0,words:[]};
  for(const a of words){
    if(a.frequency<minFrequency||a.runes.length>stream.length)continue;
    if(!a.runes.every((v,i)=>v===stream[i]))continue;
    if(a.runes.length>best.depth)best={depth:a.runes.length,words:[a.word]};
    for(const b of words){
      if(b.frequency<minFrequency)continue;
      const off=a.runes.length;
      if(off+b.runes.length>stream.length)continue;
      if(b.runes.every((v,i)=>v===stream[off+i])&&off+b.runes.length>best.depth){
        best={depth:off+b.runes.length,words:[a.word,b.word]};
      }
    }
  }
  return best;
}

function nextFromCryFamily(){
  const center=[19,16],endpoint=[17,16],distance=6,rows=[],seen=new Set();
  for(const [dr,dc] of directions){
    const p1=[center[0]-dr,center[1]-dc],p2=[center[0]+dr,center[1]+dc];
    const canonical=[p1.join(","),p2.join(",")].sort().join("|");
    if(seen.has(canonical))continue; seen.add(canonical);
    if([...p1,...p2].some(v=>v<1||v>27))continue;
    const raw=[at(...p1),at(...center),at(...p2)];
    if(raw[0]!==raw[2]||raw[1]===0)continue;
    const derived=[raw[0],phi(raw[1]),raw[2]];
    const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
    const key=derived.slice(rotation).concat(derived.slice(0,rotation));
    for(const [mdr,mdc] of directions){
      const start=[endpoint[0]+distance*mdr,endpoint[1]+distance*mdc];
      if(start.some(v=>v<1||v>27))continue;
      for(const [rdr,rdc] of directions){
        const stream=[];let r=start[0],c=start[1];
        for(let i=0;i<12;i++){
          if(r<1||r>27||c<1||c>27)break;
          stream.push(mod(at(r,c)-key[i%3]));r+=rdr;c+=rdc;
        }
        rows.push({raw,derived,rotation,key,start,moveDirection:[mdr,mdc],readDirection:[rdr,rdc],stream,...bestTwoPrefix(stream)});
      }
    }
  }
  rows.sort((a,b)=>b.depth-a.depth);
  return rows;
}

function afterNowTheFamily(){
  const previous=[[11,16],[12,17],[13,18],[14,19],[15,20]];
  const endpoint=previous[previous.length-1],rows=[],seen=new Set();
  for(const center of previous){
    for(const [dr,dc] of directions){
      for(let radius=1;radius<=13;radius++){
        const p1=[center[0]-dr*radius,center[1]-dc*radius];
        const p2=[center[0]+dr*radius,center[1]+dc*radius];
        if([...p1,...p2].some(v=>v<1||v>27))break;
        const canonical=[p1.join(','),p2.join(',')].sort().join('|')+'|'+center.join(',');
        if(seen.has(canonical))continue; seen.add(canonical);
        const raw=[at(...p1),at(...center),at(...p2)];
        if(raw[0]!==raw[2]||raw[1]===0)continue;
        const derived=[raw[0],phi(raw[1]),raw[2]];
        const rotation=((derived.reduce((sum,v)=>sum+mu(phi(v)),0)%3)+3)%3;
        const key=derived.slice(rotation).concat(derived.slice(0,rotation));
        for(const [rdr,rdc] of directions){
          const stream=[];let r=endpoint[0],c=endpoint[1];
          for(let i=0;i<12;i++){
            if(r<1||r>27||c<1||c>27)break;
            stream.push(mod(at(r,c)-key[i%3]));r+=rdr;c+=rdc;
          }
          rows.push({center,radius,nodeDirection:[dr,dc],raw,key,readDirection:[rdr,rdc],stream,...bestPrefix(stream)});
        }
      }
    }
  }
  rows.sort((a,b)=>b.depth-a.depth||b.frequency-a.frequency);
  return rows;
}
const imay=continuationFamily(branches[0].cells.at(-1));
const xearth=continuationFamily(branches[1].cells.at(-1));
assert.equal(imay.length,40);
assert.equal(xearth.length,24);
assert.equal(imay[0].depth,3);
assert.equal(imay.filter(x=>x.depth===3).length,1);
assert.equal(imay[0].word,"cry");
assert.deepEqual(imay[0].raw.map(i=>T[i]),["E","X","E"]);
assert.deepEqual(imay[0].key.map(i=>T[i]),["G","E","E"]);
assert.equal(imay[0].distance,6);
assert.deepEqual(imay[0].start,[19,16]);
assert.deepEqual(imay[0].readDirection,[-1,0]);
assert.deepEqual(imay[0].stream.slice(0,3).map(i=>T[i]),["C","R","Y"]);
assert.equal(xearth[0].depth,1);
assert.equal(xearth.some(x=>x.depth>=2),false);

const afterCry=nextFromCryFamily();
assert.equal(afterCry.length,64);
assert.equal(afterCry[0].depth,5);
assert.equal(afterCry.filter(x=>x.depth===5).length,1);
assert.deepEqual(afterCry[0].words,["now","the"]);
assert.deepEqual(afterCry[0].raw.map(i=>T[i]),["OE","J","OE"]);
assert.deepEqual(afterCry[0].key.map(i=>T[i]),["OE","OE","I"]);
assert.deepEqual(afterCry[0].start,[11,16]);
assert.deepEqual(afterCry[0].moveDirection,[-1,0]);
assert.deepEqual(afterCry[0].readDirection,[1,1]);
assert.deepEqual(afterCry[0].stream.slice(0,5).map(i=>T[i]),["N","O","W","TH","E"]);

const afterNowThe=afterNowTheFamily();
assert.equal(afterNowThe.length,56);
assert.equal(afterNowThe[0].depth,3);
assert.equal(afterNowThe.filter(x=>x.depth===3).length,1);
assert.equal(afterNowThe[0].word,"idea");
assert.deepEqual(afterNowThe[0].center,[11,16]);
assert.equal(afterNowThe[0].radius,3);
assert.deepEqual(afterNowThe[0].raw.map(i=>T[i]),["A","TH","A"]);
assert.deepEqual(afterNowThe[0].key.map(i=>T[i]),["U","A","A"]);
assert.deepEqual(afterNowThe[0].readDirection,[1,-1]);
assert.deepEqual(afterNowThe[0].stream.slice(0,3).map(i=>T[i]),["I","D","EA"]);

console.log(JSON.stringify({
 status:"block-5 tie resolved conditionally by frozen endpoint-mirror continuation family",
 block5Branches:branches.map(b=>({name:b.name,cells:b.cells,plaintext:decryptCells(b.cells,key5).map(i=>T[i])})),
 continuation:{
   imay:{candidates:imay.length,uniqueMaxDepth:imay[0].depth,word:imay[0].word,node:imay[0].raw.map(i=>T[i]),key:imay[0].key.map(i=>T[i]),start:imay[0].start,readDirection:imay[0].readDirection},
   xearth:{candidates:xearth.length,maxDepth:xearth[0].depth,bestWords:[...new Set(xearth.filter(x=>x.depth===xearth[0].depth).map(x=>x.word))]},
 },
 afterCry:{candidates:afterCry.length,uniqueMaxDepth:afterCry[0].depth,words:afterCry[0].words,node:afterCry[0].raw.map(i=>T[i]),key:afterCry[0].key.map(i=>T[i]),start:afterCry[0].start,readDirection:afterCry[0].readDirection},
 afterNowThe:{candidates:afterNowThe.length,uniqueMaxDepth:afterNowThe[0].depth,word:afterNowThe[0].word,center:afterNowThe[0].center,radius:afterNowThe[0].radius,node:afterNowThe[0].raw.map(i=>T[i]),key:afterNowThe[0].key.map(i=>T[i]),readDirection:afterNowThe[0].readDirection},
 combinedCandidate:"AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA",
 caveat:"The endpoint-mirror/totient/move rule is inherited from the published block-6 construction and is not yet independently specified by a signed original clue."
},null,2));
