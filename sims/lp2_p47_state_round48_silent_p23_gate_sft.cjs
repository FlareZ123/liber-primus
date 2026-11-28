'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {machine,language,decode}=require('./lp2_periodic_silent_unbounded_inverse_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const Tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function words(text){
 const out=[];
 for(let w of (text.toUpperCase().match(/[A-Z]+/g)||[])){
  w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const v=[];for(let j=0;j<w.length;){
   const t=w.startsWith('ING',j)?{s:'ING',i:21}:w.startsWith('IO',j)?{s:'IO',i:27}:Tok.find(x=>w.startsWith(x.s,j));
   if(!t)throw Error('unmapped '+w.slice(j));v.push(t.i);j+=t.s.length;
  }out.push(v);
 }return out;
}
const sources=[
 words(read('resources/control/shakespeare_first300k.txt')),
 words(read('resources/control/gibran_prophet_58585.txt')),
 words(read('resources/control/emerson_essays_2944.txt'))
];
const LM=language(sources),beam=384;
const receiver=gp.pages.find(p=>p.page===23).indices.slice(20);
assert.equal(receiver.length,193);
const keys=[
 {name:'state9',key:[23,5,6,15,8,19,2,3,4]},
 {name:'line5',key:[2,6,3,5,4]}
];
function lcs(A,B){let p=new Uint16Array(B.length+1),q=new Uint16Array(B.length+1);for(const a of A){q.fill(0);for(let i=0;i<B.length;i++)q[i+1]=a===B[i]?p[i]+1:Math.max(q[i],p[i+1]);[p,q]=[q,p];}return p[B.length]/Math.max(A.length,B.length);}
const tape=W=>W.flatMap(w=>[...w,29]);
const held=tape(sources[1].slice(Math.floor(sources[1].length*.57))).slice(4200,4550);
const results=[];
for(const {name,key} of keys){
 const M=machine(36,key);
 const plant=M.encode(held),last=plant.events.findLastIndex(e=>e.c<29),truth=held.slice(0,last+1);
 const plantDec=decode(M,plant.C,LM,beam,0);
 assert(plantDec.P);
 assert.deepEqual(M.encode(plantDec.P,0).C,plant.C);
 const original=decode(M,receiver,LM,beam,0);
 assert(original.P);
 assert.deepEqual(M.encode(original.P,0).C,receiver);
 results.push({
  name,key,
  control:{printed:plant.C.length,truth:truth.length,score:plantDec.score,lcs:lcs(plantDec.P,truth),
    clock:plantDec.clock,hidden:plantDec.hidden,maxHidden:plantDec.maxHidden},
  original:{printed:receiver.length,score:original.score,clock:original.clock,hidden:original.hidden,maxHidden:original.maxHidden,
    inferredPlain:original.P.length,text:original.P.map(v=>v===29?' ':gp.translit[v]).join('')}
 });
}
assert(results.every(x=>x.control.lcs>0.75));
const out={hypothesis:'p47 DH state as periodic key in Round48 mod36 hidden-output sender',
 receiver:{page:23,startRune:20,length:193,phase:0},beam,results,
 decision:'compare source-derived original scores directly to same-key held-native plants'};
console.log(JSON.stringify(out,null,2));
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(out,null,2)+'\n');
