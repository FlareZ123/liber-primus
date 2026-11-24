"use strict";
/**
 * Frozen 2012 book-code crib propagation to two previously source-linked
 * original LP2 receivers. No plaintext space value is selected or optimized.
 * Windows 11 / Node.js 22, no third-party dependencies.
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
function experiment(corpus,english){
  const R=29,mod=v=>((v%R)+R)%R;
  const letters=new Map(corpus.translit.map((x,i)=>[x,i]));
  const phrase="CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT";
  const crib=phrase.match(/TH|[A-Z ]/g).map(x=>x===" "?null:letters.get(x));
  const body=corpus.pages[55].indices.slice(1);
  const chap=corpus.pages.slice(27,33).flatMap(p=>p.indices);
  const seam=chap.slice(-42).concat(chap.slice(0,34)).slice(1);
  const art=corpus.pages[32].indices.slice(20,95);
  if(crib.length!==75||crib.filter(x=>x===null).length!==16||body.length!==75||chap.length!==1433||seam.length!==75||art.length!==75||crib.some(x=>x===undefined))throw Error("source invariant");
  function encode(t){
    const s=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
    const a=[];for(let i=0;i<s.length;i++){if(!/[A-Z]/.test(s[i]))continue;let z=s.slice(i,i+2);if(letters.has(z)){a.push(letters.get(z));i++}else if(letters.has(s[i]))a.push(letters.get(s[i]));}return a;
  }
  const native=encode(english),cut=Math.floor(native.length*.67);
  const count=Array.from({length:4},(_,i)=>new Uint32Array(R**(i+1)));
  for(let i=0;i<cut;i++){let code=0,m=1;for(let n=1;n<=4&&n<=i+1;n++){code+=native[i-n+1]*m;count[n-1][code]++;m*=R}}
  function logp(ctx,d,i){
    let p=(count[0][d]+.005)/(cut+R*.005);
    const max=Math.min(i,3);for(let n=1;n<=max;n++){
      const base=R**n,prev=ctx%base;
      p=(count[n][prev*R+d]+[0,.7,2.5,3][n]*p)/(count[n-1][prev]+[0,.7,2.5,3][n]);
    }return Math.log(p);
  }
  const render=a=>a.map(x=>x===null?"?":corpus.translit[x]).join(" ");
  function transfer(receiver){return crib.map((p,i)=>p===null?null:mod(p+receiver[i]-body[i]));}
  function solve(mask){
    let states=new Map([[0,{score:0,seq:[]}]]);
    for(let i=0;i<mask.length;i++){
      const ns=new Map(),choices=mask[i]===null?Array.from({length:R},(_,j)=>j):[mask[i]];
      for(const [ctx,v] of states)for(const d of choices){
        const key=(ctx*R+d)%(R**3),score=v.score+logp(ctx,d,i);
        if(!ns.has(key)||score>ns.get(key).score)ns.set(key,{score,seq:v.seq.concat(d)});
      }states=ns;
    }const best=[...states.values()].reduce((a,b)=>a.score>b.score?a:b);
    if(mask.some((v,i)=>v!==null&&best.seq[i]!==v))throw Error("mask violated");
    return best;
  }
  const results=[["p27-cyclic-seam",seam],["p32-art-offset19",art]].map(([name,c])=>{
    const mask=transfer(c),best=solve(mask);
    return {name,mask:render(mask),completion:render(best.seq),score:best.score};
  });
  const controls=[];
  for(let j=0;j<8;j++){
    const start=cut+100+j*971;const plain=native.slice(start,start+75);
    const k=crib.map((p,i)=>p===null?mod(7*i*i+11*i+3):mod(body[i]-p));
    const c=plain.map((p,i)=>mod(p+k[i]));
    const mask=transfer(c),best=solve(mask);
    if(mask.some((p,i)=>p!==null&&p!==plain[i]))throw Error("known-control propagation failed");
    controls.push({start,score:best.score,exactLetters:best.seq.filter((x,i)=>x===plain[i]).length,exactUnknown:best.seq.filter((x,i)=>crib[i]===null&&x===plain[i]).length});
  }
  const fConflicts=crib.flatMap((p,i)=>p!==null&&((p===0)!==(body[i]===0))?[{bodyOffset:i,plain:p,cipher:body[i]}]:[]);
  const keys=crib.map((p,i)=>p===null?null:mod(body[i]-p));
  return {length:crib.length,known:59,unknown:16,nativeLength:native.length,trainLength:cut,results,controls,fConflicts,keys};
}
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
console.log(JSON.stringify(experiment(corpus,english), null, 2));
