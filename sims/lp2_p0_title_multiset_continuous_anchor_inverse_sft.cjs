"use strict";
/** Exact continuous-clock residual title-cycle inverse. Node 22 CommonJS. */
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
function solve(contents){
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
function required(C,start,P,sign){let counts=Array(29).fill(0),seq=[];for(let i=0;i<P.length;i++){if(P[i]===0){if(C[start+i]!==0)return null;continue;}let k=mod(sign*(P[i]-C[start+i]));if(++counts[k]>caps[k])return null;seq.push(k)}return seq}
function normalize(k){const z=k.indexOf(0);return k.slice(z).concat(k.slice(0,z)).join(",")}
function allCompletions(seq,emit){const rem=caps.slice();for(const x of seq)rem[x]--;const a=seq.slice();function go(){if(a.length===13){emit(normalize(a));return}for(let k=0;k<29;k++)if(rem[k]){rem[k]--;a.push(k);go();a.pop();rem[k]++}}go()}
const mask=8191,rol=x=>((x<<1)|(x>>12))&mask,ror=x=>(x>>1)|((x&1)<<12);
function encode(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<w.length;){let t=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(t=>w.startsWith(t[0],i));if(!t)return [];a.push(t[1]);i+=t[0].length}return a}
const encodeText=t=>(t.match(/[a-z]+/gi)||[]).flatMap(encode);
const uni=new Float64Array(29).fill(1),bi=new Float64Array(30*29),tri=new Float64Array(30*30*29),bc=new Float64Array(30),tc=new Float64Array(900);
for(let t of [lit[1],lit[2],lit[3]]){let a=29,b=29;for(let x of encodeText(t)){uni[x]++;bi[b*29+x]++;bc[b]++;tri[(a*30+b)*29+x]++;tc[a*30+b]++;a=b;b=x}}
const total=uni.reduce((a,b)=>a+b,0),logp=new Float64Array(30*30*29);
for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let x=0;x<29;x++){let p1=uni[x]/total,p2=(bi[b*29+x]+20*p1)/(bc[b]+20);logp[(a*30+b)*29+x]=Math.log((tri[(a*30+b)*29+x]+20*p2)/(tc[a*30+b]+20))}
function score(P){let a=29,b=29,s=0;for(let x of P){s+=logp[(a*30+b)*29+x];a=b;b=x}return s/P.length}
function decode(C,k,sign){let states=new Map(Array.from({length:13},(_,j)=>[j*900+899,{v:0,trace:null,start:j}]));for(let c of C){let next=new Map();for(let [id,s] of states){let j=Math.floor(id/900),a=Math.floor(id%900/30),b=id%30;function step(x,h){let jj=h?j:(j+1)%13,ii=jj*900+b*30+x,v=s.v+logp[(a*30+b)*29+x],old=next.get(ii);if(!old||v>old.v)next.set(ii,{v,trace:{x,h,prev:s.trace},start:s.start})}if(c===0)step(0,true);let x=mod(c+sign*k[j]);if(x!==0)step(x,false)}states=next;if(!states.size)return null}
let best=[...states.values()].reduce((a,b)=>a.v>b.v?a:b),P=[],holds=[];for(let t=best.trace;t;t=t.prev){P.push(t.x);holds.push(t.h)}P.reverse();holds.reverse();let j=best.start;for(let i=0;i<C.length;i++){let c=holds[i]?0:mod(P[i]-sign*k[j++%13]);if(c!==C[i])throw Error("replay failed")}return {score:best.v/C.length,start:best.start,P,holdCount:holds.filter(Boolean).length,text:P.map(x=>gp.translit[x]).join("")}}
function gate(C,sign,plant){let seqs=new Map(),pairs=0;for(let n=8;n<=11;n++)for(let i=0;i+n<=C.length;i++)for(let P of pool.get(n)){let seq=required(C,i,P,sign);if(!seq)continue;pairs++;let id=seq.join(",");let a=seqs.get(id)||{seq,anchors:[]};a.anchors.push({i,n,P});seqs.set(id,a)}
let keys=new Map();for(let a of seqs.values())allCompletions(a.seq,k=>{let z=keys.get(k)||[];z.push(a);keys.set(k,z)});
let legal=0,anchored=0,maxAnchors=0,records=[];for(let [str,aa] of keys){let k=str.split(",").map(Number),allowed=Array.from({length:29},(_,c)=>k.reduce((m,x,j)=>m|(mod(c+sign*x)!==0?1<<j:0),0));let F=new Uint16Array(C.length+1);F[0]=mask;for(let i=0;i<C.length&&F[i];i++)F[i+1]=rol(F[i]&allowed[C[i]])|(C[i]===0?F[i]:0);if(!F[C.length])continue;legal++;let B=new Uint16Array(C.length+1);B[C.length]=mask;for(let i=C.length-1;i>=0;i--)B[i]=(ror(B[i+1])&allowed[C[i]])|(C[i]===0?B[i+1]:0);let good=[];for(let a of aa)for(let j=0;j<13;j++)if(a.seq.every((x,q)=>x===k[(j+q)%13]))for(let h of a.anchors)if((F[h.i]&(1<<j))&&(B[h.i+h.n]&(1<<((j+a.seq.length)%13))))good.push({start:h.i,length:h.n,phase:j,word:h.P.map(x=>gp.translit[x]).join("")});if(good.length){anchored++;maxAnchors=Math.max(maxAnchors,good.length)}let d=decode(C,k,sign);if(!d)throw Error("bitset/Viterbi discrepancy");records.push({key:str,good,...d})}
records.sort((a,b)=>b.score-a.score);let planted=plant?records.find(x=>x.key===normalize(plant.key)):null;const summarize=x=>x?{key:x.key,score:x.score,start:x.start,holdCount:x.holdCount,good:x.good,text:x.text}:null;
return {sign,pairs,keys:keys.size,legal,anchored,maxAnchors,best:summarize(records[0]),bestAnchored:summarize(records.find(x=>x.good.length)),plantedRank:planted?records.indexOf(planted)+1:null,plantedAccuracy:planted?planted.P.filter((x,i)=>x===plant.P[i]).length/plant.P.length:null,plantScore:plant?score(plant.P):null,records:plant?[]:records.map(summarize)}
}
const P=encodeText(lit[0]).slice(0,716),k=key.map((_,i)=>key[(i*3+1)%13]);let j=0,C=P.map(x=>x===0?0:mod(x+k[j++%13]));return {scope:"every nominated cyclic key, all legal continuous F paths, trigram maximum; vocabulary anchors length 8–11",training:"Shakespeare, Emerson, solved LP1; Gibran excluded from trigram training",original:[gate(body,-1),gate(body,1)],plant:gate(C,-1,{P,key:k})}
}
console.log(JSON.stringify(solve(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));
