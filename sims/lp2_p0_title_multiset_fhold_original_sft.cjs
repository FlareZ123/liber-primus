"use strict";
/** Exact raw-title F-hold phase gate and relaxed all-order lexical test. Node 22 CommonJS. */
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
function run(contents) {
 const [corpus,trans,wordfreq,...lit]=contents;
 const gp=JSON.parse(corpus),map=new Map(gp.runes.map((x,i)=>[x,i])),key=gp.pages[0].indices.slice(0,13),mod=x=>(x%29+29)%29;
 const check=(x,msg)=>{if(!x)throw Error(msg)};
 const groups=trans.split("%").slice(0,3).join("").replace(/[\/\s]/g,"").match(new RegExp("["+gp.runes.join("")+"]+","gu")).slice(2).map(w=>[...w].map(x=>map.get(x)));
 const body=gp.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
 check(groups.length===156&&groups.flat().join()===body.join()&&body.length===716,"original source segmentation");
 check(key.join()==="15,8,18,3,6,19,27,0,15,26,18,21,5","original title");
 const dot=[];for(let i=0;i<9;i++){if(i%2===0)dot.push(key[8+i/2]);else dot.push(key[i-1],key[i]);}
 function encrypt(p,k,sign,phase=0){return p.map(x=>x===0?0:mod(x-sign*k[(phase++)%13]));}
 function fixed(C,K,sign,start){let states=Array(13).fill(0n);states[start]=1n;let p0="0";for(let i=0;i<C.length;i++){let next=Array(13).fill(0n);for(let j=0;j<13;j++)if(states[j]){if(C[i]===0)next[j]+=states[j];if(mod(C[i]+sign*K[j])!==0)next[(j+1)%13]+=states[j];}states=next;if(i===248)p0=states.reduce((a,b)=>a+b,0n).toString();if(states.every(x=>x===0n))return {death:i,p0,complete:"0"};}return {death:null,p0,complete:states.reduce((a,b)=>a+b,0n).toString()}}
 const fixedResults=[];for(const [order,k] of [["printed",key],["dot",dot]])for(let sign of [-1,1]){const phases=Array.from({length:13},(_,i)=>fixed(body,k,sign,i));const native=Array.from({length:716},(_,i)=>gp.pages[57].indices[i%95]);check(fixed(encrypt(native,k,sign),k,sign,0).death===null,"fixed positive");fixedResults.push({order,sign,phases})}
 const witnessSpecs=[
 {sign:-1,key:[0,8,3,19,18,18,21,5,15,27,6,15,26],holds:[4,45,48,52,78,102,127,164,170,176,185,232,239,279,286,289,332,346,385,406,424,448,473,487,495,564,579,605,619,624,631,705]},
 {sign:1,key:[18,21,26,0,27,5,8,19,18,6,15,15,3],holds:[4,45,48,52,78,102,127,164,170,176,185,232,239,279,286,289,332,346,385,406,424,448,473,495,705]}];
 const witnesses=witnessSpecs.map(w=>{check([...w.key].sort((a,b)=>a-b).join()===[...key].sort((a,b)=>a-b).join(),"multiset witness");const holds=new Set(w.holds);let j=0;const p=body.map((x,i)=>{if(holds.has(i)){check(x===0,"hold must be F");return 0;}const v=mod(x+w.sign*w.key[j++%13]);check(v!==0,"consume must be non-F");return v;});check(encrypt(p,w.key,w.sign).join()===body.join(),"witness replay");let f=Array(29).fill(0);p.forEach(x=>f[x]++);return {...w,ioc:f.reduce((a,b)=>a+b*(b-1),0)/(p.length*(p.length-1)),first80:p.slice(0,80).map(x=>gp.translit[x]).join(" ")}});
 const words=new Set([...wordfreq.split(/\r?\n/).filter(x=>/^[a-z]+ \d+$/.test(x)).map(x=>x.split(" ")[0]),...lit.flatMap(t=>t.toLowerCase().match(/[a-z]+/g)||[])]);
 const token=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 const pools=new Map();for(let w of words){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const native of [true,false]){let a=[];for(let i=0;i<w.length;){let t=native&&w.startsWith("ING",i)?["ING",21]:native&&w.startsWith("IO",i)?["IO",27]:token.find(t=>w.startsWith(t[0],i));if(!t){a=[];break}a.push(t[1]);i+=t[0].length}if(!a.length)continue;let m=pools.get(a.length)||new Map();m.set(a.join(","),a);pools.set(a.length,m)}}
 const pool=new Map([...pools].map(([n,m])=>[n,[...m.values()]]));
 const caps=Array(29).fill(0);for(let k of key)caps[k]++;
 let allowed=0,doubles=0;for(let i=0;i<29;i++){if(caps[i])allowed|=1<<i;if(caps[i]===2)doubles|=1<<i;check(caps[i]<=2,"max two copies")}
 const max=Math.max(...groups.map(g=>g.length));check(max===11,"max group length");
 // For a word shorter than period 13, its consuming shifts touch distinct key cells.
 function fits(C,start,P,sign){let used=0,twice=0;for(let i=0;i<P.length;i++){if(P[i]===0){if(C[start+i]!==0)return false;continue}const b=1<<mod(sign*(P[i]-C[start+i]));if(!(allowed&b))return false;if(used&b){if(!(doubles&b)||(twice&b))return false;twice|=b;}used|=b;}return true}
 const inventory=Array(max+1).fill(0);groups.forEach(g=>inventory[g.length]++);
 const lexical=[];for(let sign of [-1,1]){
 const counts=groups.map(g=>pool.get(g.length).filter(p=>fits(g,0,p,sign)).length);
 const unsupportedIndices=counts.flatMap((n,i)=>n?[]:[i]);
 const plants=[];for(let trial=0;trial<3;trial++){let k=key.map((_,i)=>key[(i*(2+trial)+trial)%13]);let j=0;let planted=groups.map((g,i)=>{const candidates=pool.get(g.length),p=candidates[(i*157+11+trial*71)%candidates.length];const C=encrypt(p,k,sign,j);j+=p.filter(x=>x!==0).length;return {p,C}});check(planted.every(({p,C})=>fits(C,0,p,sign)),"word control");check(fixed(planted.flatMap(x=>x.C),k,sign,0).death===null,"continuous control");plants.push(planted.length);}
 const latent=[];for(let n=1;n<=max;n++){let starts=[],last=-n,packing=0;for(let i=0;i+n<=body.length;i++){if(pool.get(n).some(p=>fits(body,i,p,sign))){starts.push(i);if(i>=last+n){packing++;last=i}}}latent.push({length:n,needed:inventory[n],starts:starts.length,packing,deficit:Math.max(0,inventory[n]-packing)})}
 lexical.push({sign,counts,unsupportedIndices,unsupported:unsupportedIndices.length,plants,latent,latentDeficit:latent.reduce((a,b)=>a+b.deficit,0)});
 }
 return {body:body.length,groups:groups.length,key,dot,sourceWords:words.size,lexForms:[...pool.values()].reduce((a,m)=>a+m.length,0),inventory,fixedResults,witnesses,lexical};
}
const result=run(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8")));
console.log(JSON.stringify(result,null,2));
