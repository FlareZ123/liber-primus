"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),M=29,mod=x=>((x%M)+M)%M;
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const add=(x,y)=>[mod(x[0]+y[0]),mod(x[1]+y[1])];
const sub=(x,y)=>[mod(x[0]-y[0]),mod(x[1]-y[1])];
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
function quotientPairs(bytes){
 const w=bytes.map(mod),q=[];assert.equal(w.length,256);
 for(let i=0;i<254;i++){const z=w[i];q.push(z);w[i+1]=mod(w[i+1]-10*z);w[i+2]=mod(w[i+2]-25*z);}
 assert.deepEqual(w.slice(254),[0,0]);
 return Array.from({length:127},(_,i)=>[q[2*i],q[2*i+1]]);
}
function transform(input,red,Q,order,sign,opts={}){
 assert.equal(input.length,12954);
 const root=opts.root===undefined?24:opts.root,shift=opts.redShift||0,reverse=opts.reverseQ||false,out=[];
 for(let r=0;r<51;r++){
  const R=mod(red[r]+shift),row=order==="Ac,R"?[root,R]:[R,root];
  for(let j=0;j<127;j++){
   const col=Q[reverse?126-j:j],mask=mul(row,col);
   const C=[input[254*r+2*j],input[254*r+2*j+1]];
   const P=sign===-1?sub(C,mask):add(C,mask);out.push(...P);
  }
 }
 return out;
}
function nativeGP(raw,translit){
 const t=translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const words=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").match(/[A-Z]+/g)||[],out=[];
 for(const word of words){const a=[];for(let j=0;j<word.length;){const x=t.find(z=>word.startsWith(z.s,j));if(!x){a.length=0;break;}a.push(x.i);j+=x.s.length;}out.push(...a);}
 return out;
}
function ioc(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function train(a){const h=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];h.set(k,(h.get(k)||0)+1);n++;}return {h,n};}
function score(a,m){const d=m.n+0.1*29**3;let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];s+=Math.log(((m.h.get(k)||0)+0.1)/d);}return s/(a.length-2);}
function windows(a,m,n){const max=a.length-n,v=[];for(let i=0;i<300;i++){const j=Math.floor(i*max/299);v.push(score(a.slice(j,j+n),m));}v.sort((x,y)=>x-y);return {count:300,min:v[0],median:v[149],max:v[299]};}
function main(){
 const corpus=read("resources/liber-primus/lp2-corpus.json"),ink=read("resources/liber-primus/lp2-ink-annotations.json"),grid=read("resources/liber-primus/lp2-grid-256.json");
 const p53=corpus.pages.find(p=>p.page===53).indices,p54=corpus.pages.find(p=>p.page===54).indices,p55=corpus.pages.find(p=>p.page===55).indices;
 const mark=(ink.pages.find(p=>p.page===53).red_spans||[]).find(s=>s.start===128&&s.length===51);
 assert.ok(mark);assert.equal(p53.length,179);assert.equal(p54[0],24);assert.equal(p55.length,76);
 const red=p53.slice(128),cipher=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 assert.equal(cipher.length,12956);assert.deepEqual(cipher.slice(0,2),[15,8]);
 const payload=cipher.slice(2),Q=quotientPairs(grid.bytes);assert.equal(payload.length,51*127*2);
 const sh=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8"),corpus.translit);
 const gi=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/gibran_prophet_58585.txt"),"utf8"),corpus.translit);
 const em=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/emerson_essays_2944.txt"),"utf8"),corpus.translit);
 const model=train(sh),plant=sh.slice(0,payload.length);assert.equal(plant.length,payload.length);
 const variants=[];
 for(const order of ["Ac,R","R,Ac"])for(const sign of [-1,1]){
  const decoded=transform(payload,red,Q,order,sign);
  assert.deepEqual(transform(decoded,red,Q,order,-sign),payload);
  const encrypted=transform(plant,red,Q,order,-sign);
  assert.deepEqual(transform(encrypted,red,Q,order,sign),plant);
  variants.push({seedOrder:order,output:sign===-1?"C-RQ":"C+RQ",ioc:ioc(decoded),trigram:score(decoded,model),first24:decoded.slice(0,24).map(i=>corpus.translit[i]).join(" "),originalReencrypt:true,plantRecovered:12954});
 }
 const planted=transform(plant,red,Q,"Ac,R",1);
 const wrong={
  redShift:transform(planted,red,Q,"Ac,R",-1,{redShift:1}),
  root23:transform(planted,red,Q,"Ac,R",-1,{root:23}),
  reverseQ:transform(planted,red,Q,"Ac,R",-1,{reverseQ:true})
 };
 const wrongExact=Object.fromEntries(Object.entries(wrong).map(([k,v])=>[k,v.every((x,i)=>x===plant[i])]));
 assert.ok(Object.values(wrongExact).every(x=>!x));
 const scores=variants.map(x=>x.trigram),iocs=variants.map(x=>x.ioc);
 const controls={shakespeare:{length:sh.length,windows:windows(sh,model,payload.length)},gibran:{length:gi.length,windows:windows(gi,model,payload.length)},emerson:{length:em.length,windows:windows(em,model,payload.length)}};
 console.log(JSON.stringify({
  source:{payload:payload.length,rows:51,columns:127,redSeeds:red.length,Ac:p54[0],quotientPairs:Q.length},
  model:"P[r,j] = C[r,j] +/- ((24,R[r]) or (R[r],24) times Q[j]) over GF(29^2)",
  raw:{ioc:ioc(payload),trigram:score(payload,model)},controls,variants,
  ranges:{ioc:[Math.min(...iocs),Math.max(...iocs)],trigram:[Math.min(...scores),Math.max(...scores)],best:Math.max(...scores),worstNativeWindow:Math.min(controls.shakespeare.windows.min,controls.gibran.windows.min,controls.emerson.windows.min)},
  wrongSourcePlantControls:wrongExact,
  interpretation:"The source-fixed rank-one row-by-column mask is reversible and passes native-GP plants, but none of its four original-input variants yields language. This rejects only this direct GF841 outer-product mask."
 },null,2));
}
if(require.main===module)main();
module.exports={quotientPairs,transform,nativeGP,ioc,score};
