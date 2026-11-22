"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
const cipher=corpus.pages[55].indices;
assert.equal(cipher.length,76);

const perimeter=[];
for(let c=0;c<8;c++)perimeter.push(c);
for(let r=1;r<31;r++)perimeter.push(r*8+7);
for(let c=7;c>=0;c--)perimeter.push(31*8+c);
for(let r=30;r>=1;r--)perimeter.push(r*8);
assert.equal(perimeter.length,76);

const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");
const tokens=grid.rows.flat();
assert.equal(tokens.length,256);
assert.equal(tokens.some(t=>t.includes("f")),false);
const decode=(token,alphabet,base)=>{
  const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
  assert.ok(a>=0&&b>=0);
  return a*base+b;
};
const bytes60=tokens.map(t=>decode(t,alphabet60,60));
const bytes59=tokens.map(t=>decode(t,alphabet59,59));
assert.deepEqual(bytes60,grid.byte_rows.flat());
const key60=perimeter.map(i=>bytes60[i]);
const key59=perimeter.map(i=>bytes59[i]);
assert.equal(key60.length,76);
assert.equal(new Set(key60).size,68);
function rankOrder(key,descending){
  return key.map((value,index)=>({value,index}))
    .sort((a,b)=>(descending?b.value-a.value:a.value-b.value)||a.index-b.index)
    .map(x=>x.index);
}
assert.deepEqual(rankOrder(key60,false),rankOrder(key59,false));
assert.deepEqual(rankOrder(key60,true),rankOrder(key59,true));

const training=reference.toUpperCase().replace(/[^A-Z]/g,"");
const counts=new Map();
let total=0;
for(let i=0;i+2<training.length;i++){
  const tri=training.slice(i,i+3);
  counts.set(tri,(counts.get(tri)||0)+1);
  total++;
}
const alpha=0.5,den=total+alpha*26**3;
const logp=new Map();
for(const [tri,count] of counts)logp.set(tri,Math.log((count+alpha)/den));
const floor=Math.log(alpha/den);
function score(indices){
  const text=indices.map(i=>corpus.translit[i]).join("");
  let sum=0,n=0;
  for(let i=0;i+2<text.length;i++){
    sum+=logp.get(text.slice(i,i+3))??floor;
    n++;
  }
  return {text,score:sum/n};
}
function candidatesFor(key){
  const out=[];
  for(const direction of ["cw","ccw"]){
    const k=direction==="cw"?key:[...key].reverse();
    for(const sort of ["asc","desc"]){
      const order=rankOrder(k,sort==="desc");
      const direct=order.map(i=>cipher[i]);
      const inverse=Array(cipher.length);
      for(let i=0;i<order.length;i++)inverse[order[i]]=cipher[i];
      for(const [mode,indices] of [["direct",direct],["inverse",inverse]]){
        const scored=score(indices);
        out.push({name:direction+"-"+sort+"-"+mode,order,score:scored.score,text:scored.text});
      }
    }
  }
  return out;
}

const plant=Array.from({length:76},(_,i)=>i%29);
for(const candidate of candidatesFor(key60)){
  const encrypted=candidate.order.map(i=>plant[i]);
  const recovered=Array(76);
  for(let i=0;i<candidate.order.length;i++)recovered[candidate.order[i]]=encrypted[i];
  assert.deepEqual(recovered,plant);
}

const observed=candidatesFor(key60).sort((a,b)=>b.score-a.score);
let seed=0x330176;
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
const trials=20000,nullMax=[];
let exceed=0,mean=0,min=Infinity,max=-Infinity;
for(let t=0;t<trials;t++){
  const shuffled=[...key60];
  for(let i=shuffled.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  const best=Math.max(...candidatesFor(shuffled).map(x=>x.score));
  nullMax.push(best);mean+=best;min=Math.min(min,best);max=Math.max(max,best);
  if(best>=observed[0].score)exceed++;
}
nullMax.sort((a,b)=>a-b);
const p=(exceed+1)/(trials+1);
const nullMean=mean/trials;
const p95=nullMax[Math.floor(.95*(trials-1))];
assert.equal(observed[0].name,"ccw-asc-direct");
assert.ok(Math.abs(observed[0].score-(-9.577474714656008))<1e-12);
assert.equal(exceed,9435);
assert.ok(Math.abs(nullMean-(-9.577213389173165))<1e-12);
assert.ok(Math.abs(p95-(-9.469905873582743))<1e-12);
assert.ok(Math.abs(p-0.471776411179441)<1e-12);

console.log(JSON.stringify({
  source:{rimCells:key60.length,distinctRimValues:new Set(key60).size,p55Runes:cipher.length,
    base59Base60RankOrderIdentical:true},
  conventions:observed.map(({name,score,text})=>({name,score,text})),
  null:{trials,seed:"0x330176",meanMaximumScore:nullMean,
    p95MaximumScore:p95,minMaximumScore:min,maxMaximumScore:max,
    exceedances:exceed,plusOneFamilywiseP:p}
},null,2));
