"use strict";
const fs=require("node:fs"),path=require("node:path");

function run(grid){
const W=256,H=32,K=8,assert=(x,m)=>{if(!x)throw Error(m)};
let seed=0x33012797;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function fill(required,exclude){
 return required.map((r,y)=>{r=[...new Set(r)];if(r.length>K)throw Error("control row too dense");while(r.length<K){const x=rng()%W;if(!r.includes(x)&&!(exclude&&exclude(x,y)))r.push(x)}return shuffle(r)})
}
function randomRows(){return fill(Array.from({length:H},()=>[]))}
function occupancy(rows){
 assert(rows.length===H&&rows.every(r=>r.length===K&&new Set(r).size===K&&r.every(x=>Number.isInteger(x)&&x>=0&&x<W)),"row contract");
 const map=new Uint8Array(W*H);rows.forEach((r,y)=>r.forEach(x=>map[y*W+x]=1));return map
}
// Frozen conventional 5x7 capital glyphs, raster rows, no fitting.
const font={
 A:["01110","10001","10001","11111","10001","10001","10001"],
 B:["11110","10001","10001","11110","10001","10001","11110"],
 C:["01111","10000","10000","10000","10000","10000","01111"],
 D:["11110","10001","10001","10001","10001","10001","11110"],
 E:["11111","10000","10000","11110","10000","10000","11111"],
 F:["11111","10000","10000","11110","10000","10000","10000"],
 G:["01111","10000","10000","10111","10001","10001","01111"],
 H:["10001","10001","10001","11111","10001","10001","10001"],
 I:["11111","00100","00100","00100","00100","00100","11111"],
 J:["00111","00010","00010","00010","10010","10010","01100"],
 K:["10001","10010","10100","11000","10100","10010","10001"],
 L:["10000","10000","10000","10000","10000","10000","11111"],
 M:["10001","11011","10101","10101","10001","10001","10001"],
 N:["10001","11001","10101","10011","10001","10001","10001"],
 O:["01110","10001","10001","10001","10001","10001","01110"],
 P:["11110","10001","10001","11110","10000","10000","10000"],
 Q:["01110","10001","10001","10001","10101","10010","01101"],
 R:["11110","10001","10001","11110","10100","10010","10001"],
 S:["01111","10000","10000","01110","00001","00001","11110"],
 T:["11111","00100","00100","00100","00100","00100","00100"],
 U:["10001","10001","10001","10001","10001","10001","01110"],
 V:["10001","10001","10001","10001","10001","01010","00100"],
 W:["10001","10001","10001","10101","10101","11011","10001"],
 X:["10001","10001","01010","00100","01010","10001","10001"],
 Y:["10001","10001","01010","00100","00100","00100","00100"],
 Z:["11111","00001","00010","00100","01000","10000","11111"]
};
const table=new Map(Object.entries(font).map(([c,rows])=>[rows.join(""),c]));
function textControl(word,x,y,vertical){
 const rows=Array.from({length:H},()=>[]);
 for(let i=0;i<word.length;i++)for(let a=0;a<7;a++)for(let b=0;b<5;b++)if(font[word[i]][a][b]==="1")rows[y+(vertical?i*8:0)+a].push(x+(vertical?0:i*6)+b);
 const rw=vertical?5:word.length*6-1,rh=vertical?word.length*8-1:7;
 return fill(rows,(u,v)=>u>=x-1&&u<=x+rw&&v>=y-1&&v<=y+rh)
}
function lineControl(type,x,y){
 const rows=Array.from({length:H},()=>[]);
 for(let i=0;i<16;i++)rows[y+i].push(x+(type==="diagonal"?i:0));
 if(type==="cross")for(let j=-3;j<=3;j++)if(j)rows[y+8].push(x+j);
 return fill(rows)
}
function metrics(rows){
 const map=occupancy(rows),columns=new Uint8Array(W),streak=new Uint8Array(W),seen=new Uint8Array(W*H);
 let vertical=0,diagonal=0,horizontal=0,maxColumn=0,maxVerticalRun=0,maxComponent=0,components=0,isolated=0;
 for(let y=0;y<H;y++){
  for(let x=0;x<W;x++){
   let p=y*W+x;if(map[p]){columns[x]++;streak[x]++;maxColumn=Math.max(maxColumn,columns[x]);maxVerticalRun=Math.max(maxVerticalRun,streak[x])}else streak[x]=0;
  }
  for(let x of rows[y]){
   let p=y*W+x;
   if(x+1<W&&map[p+1])horizontal++;
   if(y+1<H){vertical+=map[p+W];if(x)diagonal+=map[p+W-1];if(x+1<W)diagonal+=map[p+W+1]}
   if(seen[p])continue;
   components++;let q=[p];seen[p]=1;
   for(let i=0;i<q.length;i++){let v=q[i],a=v%W,b=Math.floor(v/W);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;let xx=a+dx,yy=b+dy;if(xx<0||xx>=W||yy<0||yy>=H)continue;let j=yy*W+xx;if(map[j]&&!seen[j]){seen[j]=1;q.push(j)}}}
   maxComponent=Math.max(maxComponent,q.length);if(q.length===1)isolated++;
  }
 }
 return {vertical,diagonal,horizontal,maxColumn,maxVerticalRun,maxComponent,components,isolated}
}
function recognize(rows){
 const map=occupancy(rows),glyphs=new Map();
 for(let y=0;y<=H-7;y++)for(let x=0;x<=W-5;x++){
  let s="",n=0;for(let j=0;j<7;j++)for(let i=0;i<5;i++){let c=map[(y+j)*W+x+i];s+=c;n+=c}
  if(n<9)continue;const c=table.get(s);if(c)glyphs.set(y*W+x,c)
 }
 let hits=[];
 function blankH(x,y){for(let j=0;j<7;j++)if(map[(y+j)*W+x])return false;return true}
 function blankV(x,y){for(let i=0;i<5;i++)if(map[y*W+x+i])return false;return true}
 for(const [id,c] of glyphs){let x=id%W,y=Math.floor(id/W);for(const mode of ["horizontal","vertical"]){let word=c,xx=x,yy=y;
  for(;;){if(mode==="horizontal"){if(xx+10>=W||!blankH(xx+5,yy))break;xx+=6}else{if(yy+14>=H||!blankV(xx,yy+7))break;yy+=8}const a=glyphs.get(yy*W+xx);if(!a)break;word+=a}
  if(word.length>=3)hits.push({word,x,y,mode})
 }}
 return {glyphs:glyphs.size,hits}
}
const radices=[59,60],originals=radices.map(radix=>{
 let alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
 const bytes=grid.pages.flatMap(p=>p.tokens).map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
 if(radix===60)assert(bytes.every((x,i)=>x===grid.bytes[i]),"canonical byte check");
 return {label:"base"+radix,kind:"original",rows:Array.from({length:H},(_,i)=>bytes.slice(i*K,i*K+K))}
});
const plants=[
 {label:"READ",kind:"text",rows:textControl("READ",23,0,true)},
 {label:"FIND",kind:"text",rows:textControl("FIND",101,1,true)},
 {label:"LOOK",kind:"text",rows:textControl("LOOK",210,0,true)},
 {label:"TURN",kind:"text",rows:textControl("TURN",163,1,true)},
 {label:"vertical",kind:"diagram",rows:lineControl("vertical",37,7)},
 {label:"diagonal",kind:"diagram",rows:lineControl("diagonal",140,8)},
 {label:"cross",kind:"diagram",rows:lineControl("cross",83,4)}
];
const mixed=shuffle(originals.concat(plants,Array.from({length:20},(_,i)=>({label:"null"+i,kind:"null",rows:randomRows()}))));
const blind=mixed.map((x,i)=>({id:"panel"+String(i+1).padStart(2,"0"),metrics:metrics(x.rows),recognition:recognize(x.rows),rows:x.rows}));
const answer=mixed.map((x,i)=>({id:blind[i].id,label:x.label,kind:x.kind}));
const metricsList=["vertical","diagonal","horizontal","maxColumn","maxVerticalRun","maxComponent"];
const N=20000,hist=Object.fromEntries(metricsList.map(k=>[k,Array(257).fill(0)]));
for(let i=0;i<N;i++){const m=metrics(randomRows());for(let k of metricsList)hist[k][m[k]]++}
const tails=m=>Object.fromEntries(metricsList.map(k=>[k,(1+hist[k].slice(m[k]).reduce((a,b)=>a+b,0))/(N+1)]));
const decoded=blind.map((b,i)=>({...answer[i],metrics:b.metrics,recognition:b.recognition,tails:tails(b.metrics)}));
assert(decoded.filter(x=>x.kind==="text").every(x=>x.recognition.hits.some(h=>h.word===x.label)),"fixed text recognizer missed plant");
assert(decoded.filter(x=>x.kind==="diagram").every(x=>x.metrics.maxComponent>=16),"fixed connected diagram recognizer missed plant");
const originalResults=decoded.filter(x=>x.kind==="original").map(x=>({...x,significant:Object.entries(x.tails).filter(([k,p])=>p<=.01/(metricsList.length*2)).map(([k,p])=>({k,p}))}));
return {shape:[H,W],orderedFields:originals,blind,answer,decoded,originalResults,metricsList,N,hist,threshold:.01/(metricsList.length*2)}
}

console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-grid-256.json"),"utf8"))),null,2));
