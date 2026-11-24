"use strict";
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,raw,native,donors){
 const assert=(c,m)=>{if(!c)throw Error(m)};
 const mod=(a,m)=>((a%m)+m)%m;
 const rmap=new Map(corpus.runes.map((r,i)=>[r,i]));
 const id=s=>[...s].map(c=>rmap.get(c)).filter(x=>x!==undefined);
 let current=[],start=0,page=0,all=[];
 const finish=()=>{if(current.length)all.push({p:start,w:current});current=[]};
 for(const ch of raw.split("%").slice(0,55).join("%")){
   if(rmap.has(ch)){if(!current.length)start=page;current.push(rmap.get(ch))}
   else if(ch==="%")page++;
   else if(ch!=="/"&&!/\s/.test(ch))finish();
 }
 finish();for(const w of all)if(w.p>=50)w.p++;
 assert(all.length===2896&&String(all.flatMap(x=>x.w))===String(corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),"source");
 const regions={training:all.filter(x=>x.p>=16&&x.p<=21).map(x=>x.w),all:all.filter(x=>x.p>=16).map(x=>x.w),holdout:all.filter(x=>x.p>=40&&x.p<=53).map(x=>x.w)};
 assert(regions.training.length===373,"training words");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 /** @param {string} s @returns {number[][]} */
 function latin(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);a.push(t.i);w=w.slice(t.s.length)}out.push(a)}return out}
 const donorWords=donors.flatMap(latin),solved=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(id)}));
 const val=(w,m)=>w.reduce((a,x)=>(a*29+x)%m,0);
 const str=w=>String.fromCharCode(...w.map(x=>65+x));
 function lexicon(exclude){const by=new Map();for(const w of [...donorWords,...solved.filter(x=>x.name!==exclude).flatMap(x=>x.words)]){let map=by.get(w.length);if(!map)by.set(w.length,map=new Map());map.set(str(w),w)}return by}
 /** Exact lift modulo 29^k (k<=6). Constrain only each word's known suffix. */
 function lift(words,lex,maxDigit,allow,cap=20000){
   let seeds=[[0,0]],step=1,levels=[];
   for(let k=1;k<=maxDigit;k++){
     const modulus=29*step,by=new Map();
     for(const [n,ws] of lex){let m=29**Math.min(k,n);by.set(n,new Set([...ws.values()].map(w=>val(w,m))))}
     const rows=words.map(w=>{let m=29**Math.min(k,w.length);return {c:val(w,modulus),cm:val(w,m),m,lex:by.get(w.length)||new Set()}});
     const valid=[];
     let tested=0,best=Infinity,bestSeed=null;
     for(const [u,v] of seeds)for(let a=0;a<29;a++)for(let b=0;b<29;b++){
       let x=u+a*step,y=v+b*step,miss=0;
       tested++;
       for(const row of rows){
         const p=mod(row.cm-x,row.m);
         if(!row.lex.has(p))miss++;
         if(k>1&&miss>allow)break;
         [x,y]=[y,(x+y+row.c)%modulus];
       }
       if(miss<best){best=miss;bestSeed=[u+a*step,v+b*step]}
       if(miss<=allow)valid.push([u+a*step,v+b*step]);
     }
     levels.push({k,modulus,tested,survivors:valid.length,bestMiss:best,bestSeed,minimumExact:k===1||best<=allow});
     if(valid.length>cap)return {levels,capped:true,seeds:[]};
     seeds=valid;step=modulus;
     if(!seeds.length)break;
   }
   return {levels,capped:false,seeds};
 }
 const B=29n,number=w=>w.reduce((a,x)=>a*B+BigInt(x),0n);
 const digits=(x,n)=>{const a=Array(n);for(let i=n-1;i>=0;i--){a[i]=Number(x%B);x/=B}return a};
 /** Full-width exact forward/inverse; reduce the state modulo maximum required width. */
 function transform(words,seed,enc){
   const M=B**BigInt(Math.max(...words.map(w=>w.length)));let [x,y]=seed.map(BigInt);
   const out=[];
   for(const w of words){
     const v=number(w),m=B**BigInt(w.length),o=mod(v+(enc?x:-x),m),c=enc?o:v;
     out.push(digits(o,w.length));[x,y]=[y,(x+y+c)%M];
   }
   return out;
 }
 const lexical=(ws,lex)=>ws.filter(w=>lex.get(w.length)?.has(str(w))).length;
 const ioc=ws=>{let f=Array(29).fill(0),n=0;for(const w of ws)for(const x of w){f[x]++;n++}return f.reduce((a,x)=>a+x*(x-1),0)/(n*(n-1))};
 const lex=lexicon(null),known=[3299,3298],p=transform(regions.all,known,false);
 assert(String(transform(p,known,true).flat())===String(regions.all.flat()),"source replay");
 const hoStart=all.filter(x=>x.p>=16&&x.p<40).length;
 const h=p.slice(hoStart,hoStart+regions.holdout.length);
 const firstRune=all.filter(x=>x.p<16).flatMap(x=>x.w).length;
 const original={words:regions.training.length,trainRunes:regions.training.flat().length,firstRune,firstPhysicalP16Rune:corpus.pages.filter(x=>x.page<16).flatMap(x=>x.indices).length,allRunes:regions.all.flat().length,heldoutWords:h.length,heldoutRunes:h.flat().length,sourceSeed:known,trainLex:lexical(p.slice(0,regions.training.length),lex),trainIoc:ioc(p.slice(0,regions.training.length)),heldoutLex:lexical(h,lex),heldoutIoc:ioc(h),first20:p.slice(0,20).map(w=>w.map(x=>corpus.translit[x]).join(""))};
 original.strict=lift(regions.training,lex,6,Math.floor(regions.training.length/20));
 original.sensitivity=lift(regions.training,lex,6,Math.floor(regions.training.length/10));
 original.candidates=original.sensitivity.seeds.slice(0,50).map(seed=>{const q=transform(regions.all,seed,false);const ho=q.slice(hoStart,hoStart+h.length);assert(String(transform(q,seed,true).flat())===String(regions.all.flat()),"replay");return {seed,heldoutLex:lexical(ho,lex),heldoutIoc:ioc(ho)}});
 const controls=[];
 const selected=solved.filter(s=>s.words.length>=88).sort((a,b)=>b.words.length-a.words.length).slice(0,3);
 for(let i=0;i<selected.length;i++){
   const {name,words:plain}=selected[i],seed=[[432198765,20261124],[123456789,345678901],[99881234,222333444]][i];
   const c=transform(plain,seed,true),train=c.slice(0,60),l=lexicon(name);
   const result={name,seed,trainWords:train.length,missingTrain:60-lexical(plain.slice(0,60),l)};
   for(const [label,budget] of [["strict",3],["sensitivity",6]]){
     const recovered=lift(train,l,6,budget);
     // Select solely by complete training words; never use the withheld words.
     const scored=recovered.seeds.map(s=>({s,score:lexical(transform(train,s,false),l)})).sort((a,b)=>b.score-a.score);
     const best=scored.filter(x=>x.score===scored[0]?.score);
     const hit=recovered.seeds.find(s=>String(s)===String(seed));
     const plainOut=hit&&transform(c,hit,false);
     if(hit)assert(String(transform(plainOut,hit,true).flat())===String(c.flat()),"control replay");
     result[label]={budget,levels:recovered.levels,capped:recovered.capped,survivorCount:recovered.seeds.length,correct:!!hit,fullMatch:!!hit&&String(plainOut.flat())===String(plain.flat()),heldoutRunes:hit?plain.slice(60).flat().length:0,trainingMaxScore:scored[0]?.score??null,trainingTopCount:best.length,trainingTopCorrect:best.some(x=>String(x.s)===String(seed))};
   }
   controls.push(result);
 }
 return {original,controls};
}
const root=path.resolve(__dirname,"..");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const [cj,trans,nj,...donors]=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(cj),trans,JSON.parse(nj),donors),null,2));
