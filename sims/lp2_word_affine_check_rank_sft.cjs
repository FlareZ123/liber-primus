"use strict";
// Agent48, Director #3219. No network, no dependencies, read only.
const fs=require("node:fs");const path=require("node:path");const root=path.join(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function rank(rows,dim){
  const basis=new Map(), ids=[];
  for(let i=0;i<rows.length;i++){let a=Int16Array.from(rows[i]);for(let j=0;j<dim;j++){let v=a[j];if(!v)continue;if(!basis.has(j)){let iv=1;while(v*iv%29!==1)iv++;for(let k=j;k<dim;k++)a[k]=a[k]*iv%29;basis.set(j,a);ids.push(i);break;}let b=basis.get(j);for(let k=j;k<dim;k++)a[k]=(a[k]-v*b[k]+841)%29;}if(basis.size===dim)break;}
  return {rank:basis.size,ids,basis};
}

function inspect(rows,n){
  const d=rank(rows.map(w=>[1,...w]),n+1);
  const sets=Array.from({length:n},(_,j)=>[...new Set(rows.map(w=>w[j]))].sort((a,b)=>a-b));
  const columns=sets.flatMap((s,j)=>s.slice(1).map(v=>[j,v]));
  const z=rank(rows.map(w=>[1,...columns.map(([j,v])=>Number(w[j]===v))]),1+columns.length);
  return {n,rows:rows.length,affineRank:d.rank-1,affineBasisRows:d.ids,indicatorRank:z.rank-1,indicatorDimension:columns.length,indicatorBasisRows:z.ids,allPositionAlphabetCheckExcluded:z.rank===1+columns.length&&sets.every(s=>s.length>1),seen:sets.map(s=>s.length)};
}

function fit(rows,n){
  const b=rank(rows.map(w=>[1,...w.slice(0,-1),w[n-1]]),n+1).basis;
  if(b.size!==n||b.has(n))return null;
  const v=Array(n+1).fill(0);v[n]=1;
  for(let j=n-1;j>=0;j--){let row=b.get(j);if(!row)return null;v[j]=(29-row.slice(j+1).reduce((s,x,i)=>(s+x*v[i+j+1])%29,0))%29;}
  return v.slice(0,n).map(x=>(29-x)%29);
}

function decode64(s){const abc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";let bits=0,buf=0,out=[];for(let c of s){let x=abc.indexOf(c);if(x<0)continue;buf=(buf<<6)|x;bits+=6;if(bits>=8){bits-=8;out.push((buf>>bits)&255);}}return out;}

function crc24(bytes){let crc=0xb704ce;for(let x of bytes){crc^=x<<16;for(let j=0;j<8;j++){crc<<=1;if(crc&0x1000000)crc^=0x1864cfb;}}return crc&0xffffff;}

function run(trans,native,armor){
  const m=new Map(native.runes.map((x,i)=>[x,i]));
  const words=trans.replace(/[\/\n\r%&$\s]/g,"").split(/[-.]/).filter(s=>/[\u16A0-\u16FF]/u.test(s)).slice(0,2896).map(s=>[...s].map(c=>m.get(c)));
  const src=native.sections.map(s=>[...s.source_text].filter(c=>m.has(c)).map(c=>m.get(c)));
  const source=src.flat();
  if(words.length!==2896||words.flat().length!==12956||source.length!==2979)throw Error("source count");
  const original=Array.from({length:14},(_,i)=>words.filter(w=>w.length===i+1)).filter(w=>w.length).map(w=>inspect(w,w[0].length));
  let controls=[];
  for(let n=2;n<=12;n++){
    let count=words.filter(w=>w.length===n).length;
    for(let trial=0;trial<3;trial++){
      let donor=src.filter((_,i)=>i%3===trial).flat();
      let key=Array.from({length:n-1},(_,j)=>(n*3+j*5+trial*11)%28+1),bias=(n*7+trial*4)%29;
      let rows=Array.from({length:count},(_,i)=>{let p=Array.from({length:n-1},(_,j)=>donor[(i*(n-1)+j)%donor.length]);return [...p,(bias+p.reduce((s,v,j)=>s+key[j]*v,0))%29]});
      let split=Math.min(count-1,Math.max(n+1,Math.floor(count*0.75))), found=fit(rows.slice(0,split),n);
      let replay=found?rows.slice(split).filter(row=>(found[0]+row.slice(0,-1).reduce((s,v,j)=>s+found[j+1]*v,0))%29===row[n-1]).length:0;
      let rival=Array.from({length:count},(_,i)=>{let s=0;return Array.from({length:n},(_,j)=>s=(s+donor[(i*n+j)%donor.length]+1)%29)});
      let repeats=rival.reduce((s,w)=>s+w.slice(1).filter((v,j)=>v===w[j]).length,0);
      let recovered=JSON.stringify(found)===JSON.stringify([bias,...key]);
      controls.push({n,trial,count,split,recovered,replay,held:count-split,parityRank:rank(rows.map(w=>[1,...w]),n+1).rank-1,rivalRank:rank(rival.map(w=>[1,...w]),n+1).rank-1,rivalRepeats:repeats});
    }
  }
  let lines=armor.split("-----BEGIN PGP SIGNATURE-----")[1].trim().split(/\r?\n/);const crcLine=lines.find(x=>/^=[A-Za-z0-9+/]{4}$/.test(x));const payload=decode64(lines.filter(x=>/^[A-Za-z0-9+/]{4,}={0,2}$/.test(x)).join(""));const claimed=decode64(crcLine.slice(1)).reduce((a,b)=>(a<<8)|b,0);const computed=crc24(payload);
  if(computed!==claimed)throw Error("CRC mismatch");
  const cap={maxPrintedWidth:Math.max(...words.map(w=>w.length)),sameLengthGP27CheckPossible:[]};
  for(let n=1;n<=cap.maxPrintedWidth;n++)if(29n**BigInt(n-1)>=27n**BigInt(n))cap.sameLengthGP27CheckPossible.push(n);
  return {counts:{words:words.length,runes:words.flat().length,native:source.length,nativeSymbols:new Set(source).size},crc:{bytes:payload.length,claimed,computed,hex:computed.toString(16)},capacity:cap,original,controls};
}
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/historical/cicada2014-stage11-message.asc")),null,2));
