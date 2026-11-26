"use strict";
/** Exact title-multiset shared-cycle latent inventory anchor gate. Node 22 CommonJS. */
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
function scan(contents){
const [corpus,trans,wordfreq,...lit]=contents,gp=JSON.parse(corpus),runeMap=new Map(gp.runes.map((x,i)=>[x,i])),key=gp.pages[0].indices.slice(0,13),mod=x=>(x%29+29)%29;
const check=(x,msg)=>{if(!x)throw Error(msg)};
const groups=trans.split("%").slice(0,3).join("").replace(/[\/\s]/g,"").match(new RegExp("["+gp.runes.join("")+"]+","gu")).slice(2).map(w=>[...w].map(x=>runeMap.get(x)));
const body=gp.pages.slice(0,3).flatMap(p=>p.indices).slice(13);check(groups.flat().join()===body.join()&&groups.length===156&&body.length===716,"segmentation mismatch");
check(key.join()==="15,8,18,3,6,19,27,0,15,26,18,21,5","title");
const words=new Set([...wordfreq.split(/\r?\n/).filter(x=>/^[a-z]+ \d+$/.test(x)).map(x=>x.split(" ")[0]),...lit.flatMap(t=>t.toLowerCase().match(/[a-z]+/g)||[])]);
const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),pools=new Map();
for(let w of words){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(const native of [true,false]){let a=[];for(let i=0;i<w.length;){let t=native&&w.startsWith("ING",i)?["ING",21]:native&&w.startsWith("IO",i)?["IO",27]:tokens.find(t=>w.startsWith(t[0],i));if(!t){a=[];break}a.push(t[1]);i+=t[0].length}if(!a.length)continue;let m=pools.get(a.length)||new Map();m.set(a.join(","),a);pools.set(a.length,m)}}
const pool=new Map([...pools].map(([n,m])=>[n,[...m.values()]]));
const caps=Array(29).fill(0);for(let k of key)caps[k]++;
const inventory=Array(12).fill(0);for(let g of groups)inventory[g.length]++;
const need=inventory.slice(8).reduce((a,b)=>a+b,0),budget=Math.floor(groups.length*.05);
check(need===20&&budget===7,"inventory");
function required(C,start,P,sign){let counts=Array(29).fill(0),seq=[];for(let i=0;i<P.length;i++){if(P[i]===0){if(C[start+i]!==0)return null;continue;}let k=mod(sign*(P[i]-C[start+i]));if(++counts[k]>caps[k])return null;seq.push(k)}return seq}
function collect(C,sign){const sequences=new Map();let pairs=0;for(let n=8;n<=11;n++)for(let i=0;i+n<=C.length;i++){for(const P of pool.get(n)){const seq=required(C,i,P,sign);if(!seq)continue;pairs++;const id=seq.join(",");let item=sequences.get(id);if(!item){item={seq,intervals:new Set()};sequences.set(id,item)}item.intervals.add(i*16+n)}}return {pairs,sequences}}
function normalize(k){const z=k.indexOf(0);return k.slice(z).concat(k.slice(0,z)).join(",")}
function allCompletions(seq,emit){const rem=caps.slice();for(const x of seq)rem[x]--;const a=seq.slice();function go(){if(a.length===13){emit(normalize(a));return}for(let k=0;k<29;k++)if(rem[k]){rem[k]--;a.push(k);go();a.pop();rem[k]++}}go()}
function bound(intervals){let sum=0,byLength=[];for(let n=8;n<=11;n++){const starts=[...intervals].filter(x=>x%16===n).map(x=>Math.floor(x/16)).sort((a,b)=>a-b);let last=-n,packing=0;for(let s of starts)if(s>=last+n){packing++;last=s}let supported=Math.min(inventory[n],packing);sum+=supported;byLength.push({n,starts:starts.length,packing,supported})}return {sum,byLength}}
function gate(C,sign,trueKey){const {pairs,sequences}=collect(C,sign);const keys=new Map();let completions=0;for(const {seq,intervals} of sequences.values())allCompletions(seq,k=>{completions++;let set=keys.get(k);if(!set){set=new Set();keys.set(k,set)}for(const it of intervals)set.add(it)});
let max=0,top=null,hist=Array(need+1).fill(0),passing=0;for(const [k,intervals] of keys){const b=bound(intervals);hist[b.sum]++;if(b.sum>max){max=b.sum;top={key:k,...b}}if(b.sum>=need-budget)passing++}
let actual=null;if(trueKey){const actualIntervals=keys.get(normalize(trueKey));check(actualIntervals,"planted key absent");actual=bound(actualIntervals);check(actual.sum===need,"planted long words not all retained")}
return {sign,pairs,uniqueSequences:sequences.size,completions,uniqueCyclicKeys:keys.size,maxSupportedLongWords:max,minOov:need-max,passing,top,hist,actual}}
const original=[-1,1].map(sign=>gate(body,sign,null));
const plants=[];for(let sign of [-1,1])for(let trial=0;trial<2;trial++){const k=key.map((_,i)=>key[(i*(3+trial)+trial+1)%13]);let j=0;const P=groups.flatMap((g,i)=>{const p=pool.get(g.length);return p[(i*157+11+trial*71)%p.length]});const C=P.map(x=>x===0?0:mod(x-sign*k[j++%13]));plants.push(gate(C,sign,k))}
return {body:body.length,groups:groups.length,forms:[...pool.values()].reduce((a,b)=>a+b.length,0),inventory,need,budget,original,plants};
}
console.log(JSON.stringify(scan(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));
