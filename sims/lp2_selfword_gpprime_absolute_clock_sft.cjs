'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function experiment(raw){
 const g=JSON.parse(raw[0]),native=JSON.parse(raw[2]),idx=new Map(g.runes.map((x,i)=>[x,i])),weights=g.prime;
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const words=parse(raw[1].replace(/[\s/%]/g,"")).slice(0,2896);
 if(words.length!==2896||words.flat().length!==12956||words.flat().join()!==g.pages.slice(0,56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 const ps=[];for(let n=2;ps.length<6000;n++){let ok=true;for(const p of ps){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)ps.push(n)}
 const mod=x=>(x%29+29)%29;const shift=i=>mod(ps[i-1]-1);
 const encode=(w,b=0)=>{let k=w.reduce((s,x)=>s+weights[x],b);return w.map(x=>x===0?0:mod(x+shift(k++)))};
 const inverse=(w,b=0)=>{const out=[];const L=w.length;
 for(let S=2*L;S<=109*L;S++){function dfs(i,k,sum,p){const left=L-i;if(sum+2*left>S||sum+109*left<S)return;if(i===L){if(sum===S)out.push(p);return}const c=w[i],x=mod(c-shift(k));if(c===0)dfs(i+1,k,sum+weights[0],[...p,0]);if(x!==0)dfs(i+1,k+1,sum+weights[x],[...p,x]);}dfs(0,S+b,0,[]);}return out;};
 const key=w=>w.join(",");const unique=new Map(words.map(w=>[key(w),w]));const cache=new Map([...unique].map(([k,w])=>[k,inverse(w)]));
 const stats={};let n0=0,n1=0,nmany=0;const examples=[];
 for(let i=0;i<words.length;i++){const w=words[i],d=cache.get(key(w)),s=stats[w.length]??={total:0,none:0,one:0,many:0};s.total++;if(!d.length){n0++;s.none++;if(examples.length<12)examples.push({group:i,cipher:w})}else if(d.length===1){n1++;s.one++}else{nmany++;s.many++}for(const p of d)if(key(encode(p))!==key(w))throw Error("replay");}
 const single=words.filter(w=>w.length===1).map(w=>w[0]);const types=[...new Set(single)].sort((a,b)=>a-b);
 const offsets=[];let best=0,at=[];for(let b=0;b<=3301;b++){const im=new Set(weights.map((_,x)=>encode([x],b)[0])),support=types.filter(x=>im.has(x)).length;if(support>best){best=support;at=[b]}else if(support===best)at.push(b);if(support===types.length)offsets.push(b)}
 const controls=native.sections.map(s=>{const ws=parse(s.source_text);let retained=0,unique=0,multiple=0;for(const w of ws){const d=inverse(encode(w));if(d.some(p=>key(p)===key(w)))retained++;if(d.length===1)unique++;else multiple++;}return {name:s.name,words:ws.length,retained,unique,multiple}});
 const singleImage=[...new Set(weights.map((_,x)=>encode([x])[0]))].sort((a,b)=>a-b);
 return {sourceWords:words.length,uniqueCipherGroups:unique.size,stats,none:n0,one:n1,many:nmany,examples,singletons:{count:single.length,types,image:singleImage,missing:types.filter(x=>!singleImage.includes(x)),offsetRange:[0,3301],bestSupportedTypes:best,bestOffsets:at,fullSupportOffsets:offsets},controls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const shas=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7","1b064ef6d85819b7d96adaff31a82d1ec551598f"];
const raw=paths.map((p,i)=>{const b=fs.readFileSync(path.resolve(__dirname,'..',p));if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==shas[i])throw Error(p);return b.toString('utf8')});
console.log(JSON.stringify(experiment(raw),null,2));
