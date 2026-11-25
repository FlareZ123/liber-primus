'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const g=Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ");
const t=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const pages=fs.readFileSync(path.join(__dirname,'../resources/transcriptions/lp2-image-corrected.txt'),'utf8').replace(/\r\n/g,"\n").split(/\n%\n/);
const words=x=>x.split(/[-.&$§]/u).map(x=>Array.from(x).map(c=>g.indexOf(c)).filter(i=>i>=0)).filter(x=>x.length);
const p55=words(pages[54]),native=words(pages[56]),w=p55.slice(1);
assert.equal(pages.length,57);assert.equal(p55.flat().length,76);assert.deepEqual(p55[0],[21]);assert.equal(native.flat().length,95);
assert.deepEqual(w.map(x=>x.length),[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const pow=(a,n)=>{let p=1;for(let i=0;i<n;i++)p=p*a%59;return p};
assert.equal(pow(5,29),1);
const maps={exponent:Array.from({length:29},(_,i)=>pow(5,i)),square:Array.from({length:29},(_,i)=>(i+1)**2%59)};
const decode=(ww,a,e,last)=>{const k=last?ww.at(-1):ww[0],dat=last?ww.slice(0,-1):ww.slice(1);return dat.map(c=>a.indexOf(a[c]*pow(pow(a[k],e),57)%59))};
const encode=(ww,k,a,e,last)=>{const data=ww.map(p=>a.indexOf(a[p]*pow(a[k],e)%59));return last?[...data,k]:[k,...data]};
const ioc=v=>{const counts=Array(29).fill(0);v.forEach(x=>counts[x]++);return counts.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1))};
const allowed=new Set([24,10,3,16]);let replay=0,planted=0;
for(const [name,a] of Object.entries(maps)){
  assert.equal(new Set(a).size,29);assert(a.every(x=>pow(x,29)===1));
  for(const last of [false,true]){
    let maxLegal=0;
    for(let e=0;e<29;e++){
      const d=w.map(x=>decode(x,a,e,last));assert.equal(d.flat().length,59);
      w.forEach((x,i)=>assert.deepEqual(encode(d[i],last?x.at(-1):x[0],a,e,last),x));replay+=75;
      const pos=native.map((x,i)=>encode(x,(i*7+3)%29,a,e,last));
      pos.forEach((x,i)=>assert.deepEqual(decode(x,a,e,last),native[i]));planted+=95;
      const singleton=d.filter(x=>x.length===1).map(x=>x[0]),legal=singleton.filter(x=>allowed.has(x)).length;maxLegal=Math.max(maxLegal,legal);
      console.log(JSON.stringify({map:name,nonce:last?"last":"first",exponent:e,singleton,legal,ioc:ioc(d.flat()),readout:d.map(x=>x.map(v=>t[v]).join("")).join(" ")}));
    }
    assert.equal(maxLegal,2);console.log({name,last,maxLegal});
  }
}
assert.equal(replay,8700);assert.equal(planted,11020);console.log({replay,planted});
