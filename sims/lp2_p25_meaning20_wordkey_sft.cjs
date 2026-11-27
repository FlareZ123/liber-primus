"use strict";
function run(c,ref,signed){
const body=signed.split(/\r?\n\r?\n/).slice(1).join("\n\n").split("-----BEGIN PGP SIGNATURE-----")[0];
const words=(body.match(/\b[A-Za-z]+\b/g)||[]).map(x=>x.toUpperCase());
if(words.length!==43||words[20]!=="MEANING"||words[40]!=="PATHS")throw Error("signed words "+words.length);
const tokens=[["ING",21],["NG",21],["TH",2],["EO",12],["OE",22],["AE",25],["IA",27],["IO",27],["EA",28],["QU",5],["Q",5],["K",5],["V",1],["Z",15],...c.translit.filter(x=>x.length===1).map(x=>[x,c.translit.indexOf(x)])].sort((a,b)=>b[0].length-a[0].length);
function enc(s){const out=[];for(const w of s.toUpperCase().match(/[A-Z]+/g)||[]){let i=0;while(i<w.length){const v=tokens.find(x=>w.startsWith(x[0],i));if(!v)throw Error(w+" "+i);out.push(v[1]);i+=v[0].length}}return out}
const key=enc(words[20]);if(key.join()!=="19,28,9,21")throw Error("key");
const mod=x=>(x%29+29)%29,prose=s=>s.split(/\r?\n/).filter(x=>x&&!x.startsWith("#")&&!x.startsWith("[")&&/^[A-Z ,;!?'"’-]+$/.test(x)).join(" ");
const split=ref.split(/^### 14\s*$/m),train=enc(prose(split[0])),control14=enc(prose(split[1].split(/^### 15\s*$/m)[0]));
const uni=Array(29).fill(.5),bi=Array.from({length:29},()=>Array(29).fill(.5)),tri=new Map();
for(let i=0;i<train.length;i++){uni[train[i]]++;if(i)bi[train[i-1]][train[i]]++;if(i>=2){const k=train[i-2]*29+train[i-1];if(!tri.has(k))tri.set(k,Array(29).fill(.15));tri.get(k)[train[i]]++}}
const sum=a=>a.reduce((s,x)=>s+x,0),us=sum(uni),bs=bi.map(sum),ts=new Map([...tri].map(([k,v])=>[k,sum(v)]));
function lp(a,b,x){const k=a*29+b,v=a>=0?tri.get(k):undefined,p0=uni[x]/us,p1=b<0?p0:.85*bi[b][x]/bs[b]+.15*p0;return Math.log(v?.length? .7*v[x]/ts.get(k)+.3*p1:p1)}
const score=p=>p.reduce((s,x,i)=>s+lp(i>1?p[i-2]:-1,i?p[i-1]:-1,x),0)/p.length;
function send(p,sign,hold,phase){let k=phase;return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+sign*key[k%4]);k++;return y})}
function inverse(cipher,sign,hold,phase){
let states=new Map([[`${phase},-1,-1`,{phase,a:-1,b:-1,s:0,p:[],count:1n}]]);
for(let i=0;i<cipher.length;i++){const out=new Map();for(const z of states.values()){const y=cipher[i],cand=[];if(hold&&y===0)cand.push([0,z.phase]);const x=mod(y-sign*key[z.phase]);if(!hold||x!==0)cand.push([x,(z.phase+1)%4]);for(const [x,q] of cand){const k=[q,z.b,x].join(","),s=z.s+lp(z.a,z.b,x),prev=out.get(k);if(!prev)out.set(k,{phase:q,a:z.b,b:x,s,p:[...z.p,x],count:z.count});else{prev.count+=z.count;if(s>prev.s){prev.s=s;prev.p=[...z.p,x]}}}}states=out;if(!states.size)return {dead_offset0:i,paths:"0"};}
const a=[...states.values()],best=a.reduce((a,b)=>a.s>=b.s?a:b);return {paths:a.reduce((s,z)=>s+z.count,0n).toString(),score:best.s/cipher.length,plaintext:best.p,replay:send(best.p,sign,hold,phase).every((x,i)=>x===cipher[i])}
}
const p20=c.pages[20].indices,p21=c.pages[21].indices,original=[...p20,...p21],rows=[],controls=[];
for(const phase of [0,1,2,3])for(const sign of [1,-1])for(const hold of [false,true]){
const iv=inverse(original,sign,hold,phase);if(iv.plaintext){iv.p20Score=score(iv.plaintext.slice(0,p20.length));iv.p21Score=score(iv.plaintext.slice(p20.length));iv.translit=iv.plaintext.map(x=>c.translit[x]).join("");if(!iv.replay)throw Error("original replay");}rows.push({phase,sign,hold,...iv});
for(const [id,p] of [["p57-native",c.pages[57].indices],["LP1-p14-editorial",control14]]){const v=inverse(send(p,sign,hold,phase),sign,hold,phase);if(!v.replay)throw Error("plant replay");controls.push({id,phase,sign,hold,paths:v.paths,score:v.score,truthScore:score(p),correct:v.plaintext.filter((x,i)=>x===p[i]).length,n:p.length})}
}return {key,words,training_runes:train.length,p20_runes:p20.length,p21_runes:p21.length,rows,controls};
}
const fs=require('fs'),path=require('path');const rd=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(run(JSON.parse(rd('resources/liber-primus/lp2-corpus.json')),rd('resources/liber-primus/lp1-plaintext-reference.txt'),rd('resources/historical/cicada2016-4gq25-outguess.asc')),null,2));
