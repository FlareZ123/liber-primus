'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {buildSourceNativeTrigramModel}=require('./lp1_source_native_trigram_model.cjs');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tr=read('resources/transcriptions/lp2-image-corrected.txt'),lp1=read('resources/liber-primus/lp1-plaintext-reference.txt');
const mod=x=>((x%29)+29)%29;
function prime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
function nth(r){let k=0;for(let n=2;;n++)if(prime(n)&&++k===r)return n;}
const parts=tr.split('%').map(x=>x.trim()).filter(Boolean);
const lens=parts[23].split('/').map(x=>x.replace(/\s+/g,'').trim()).filter(Boolean)[0].split(/[-.]/).filter(Boolean).map(w=>[...w].length);
assert.deepEqual(lens,[2,6,3,5,4]);
const key=lens.map(n=>mod(nth(n)-1));assert.deepEqual(key,[2,12,4,10,6]);
function summary(seq){
  let dp=new Map([[0,1n]]),trace=[];
  for(let i=0;i<seq.length;i++){
    const C=seq[i],nxt=new Map();
    for(const [j,n] of dp){
      if(C===0)nxt.set(j,(nxt.get(j)||0n)+n);
      if(mod(C-key[j%5])!==0)nxt.set(j+1,(nxt.get(j+1)||0n)+n);
    }
    trace.push({offset:i,cipher:C,classes:nxt.size});dp=nxt;if(!dp.size)break;
  }
  return {complete:trace.length===seq.length&&dp.size>0,paths:[...dp.values()].reduce((a,b)=>a+b,0n),classes:dp.size,trace};
}
function enumerate(seq){
  let st=[{j:0,p:[]}];
  for(const C of seq){const nx=[];for(const s of st){if(C===0)nx.push({j:s.j,p:s.p.concat(0)});const P=mod(C-key[s.j%5]);if(P!==0)nx.push({j:s.j+1,p:s.p.concat(P)});}st=nx;if(!st.length)break;}return st;
}
const p23=c.pages.find(p=>p.page===23),after=p23.indices.slice(20),a=summary(after);
assert.equal(a.complete,false);assert.deepEqual(a.trace.at(-1),{offset:6,cipher:12,classes:0});
const p0=c.pages.find(p=>p.page===0),z=summary(p0.indices);
assert.equal(z.complete,false);assert.deepEqual(z.trace.at(-1),{offset:4,cipher:6,classes:0});
const census=[];
for(const p of c.pages.filter(p=>p.indices.length)){const s=summary(p.indices);if(s.complete)census.push({page:p.page,length:p.indices.length,paths:s.paths.toString(),classes:s.classes});}
assert.deepEqual(census,[{page:24,length:270,paths:'14',classes:1},{page:43,length:274,paths:'27',classes:3}]);
const m=buildSourceNativeTrigramModel({corpus:c,referenceText:lp1}),scores={};
for(const r of census){const ps=enumerate(c.pages.find(p=>p.page===r.page).indices);assert.equal(ps.length,Number(r.paths));scores[r.page]=Math.max(...ps.map(x=>m.scoreStream(x.p).mean));}
assert(Math.abs(scores[24]+3.394614012562758)<1e-12);assert(Math.abs(scores[43]+3.408371085357845)<1e-12);
const g=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt')),floors={};
for(const len of [270,274]){let f=Infinity,n=0;for(let i=0;i+len<=g.length;i++){f=Math.min(f,m.scoreStream(g.slice(i,i+len)).mean);n++;}floors[len]={windows:n,floor:f};}
assert.deepEqual([floors[270].windows,floors[274].windows],[62223,62219]);
assert(scores[24]<floors[270].floor&&scores[43]<floors[274].floor);
const native=c.pages.find(p=>p.page===57).indices;let j=0;
const plant=native.map(P=>P===0?0:mod(P+key[(j++)%5]));assert(enumerate(plant).some(x=>x.p.every((v,i)=>v===native[i])));
const out={key,cascade:{p23Following:a.trace.at(-1),p0:z.trace.at(-1)},census,scores,gibranFloors:floors,decision:'no native plaintext'};
console.log(JSON.stringify(out,null,2));fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(out,null,2)+'\n');

// DIRECT-CONSUMER-FAMILY-24
const dcReceiver=c.pages.find(p=>p.page===23).indices.slice(20);
assert.equal(dcReceiver.length,193);
function dcPrime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
function dcNth(r){let k=0;for(let n=2;;n++)if(dcPrime(n)&&++k===r)return n;}
const dcT=n=>mod(dcNth(n)-1);
const dcKeys=[
 ['line5-raw',[2,6,3,5,4]],
 ['line5-T',[2,6,3,5,4].map(dcT)],
 ['state9-raw',[23,5,6,15,8,19,2,3,4]],
 ['state9-T',[23,5,6,15,8,19,2,3,4].map(dcT)]
];
assert.deepEqual(dcKeys[1][1],[2,12,4,10,6]);
assert.deepEqual(dcKeys[3][1],[24,10,12,17,18,8,2,4,6]);
const dcOrder=k=>k.map((v,i)=>({v,i})).sort((x,y)=>x.v-y.v||x.i-y.i).map(x=>x.i);
function dcForward(x,k){const n=k.length,o=dcOrder(k),cols=Array.from({length:n},()=>[]);x.forEach((v,i)=>cols[i%n].push(v));return o.flatMap(j=>cols[j]);}
function dcInverse(x,k){const n=k.length,o=dcOrder(k),q=Math.floor(x.length/n),r=x.length%n,l=Array.from({length:n},(_,j)=>q+(j<r?1:0)),cols=Array.from({length:n},()=>[]);let p=0;for(const j of o){cols[j]=x.slice(p,p+l[j]);p+=l[j];}const out=[];for(let y=0;y<q+(r?1:0);y++)for(let j=0;j<n;j++)if(y<cols[j].length)out.push(cols[j][y]);return out;}
const dcRows=[];
for(const [name,k] of dcKeys){
 for(const [op,aa,bb] of [['C-k',1,-1],['C+k',1,1],['-C-k',-1,-1],['-C+k',-1,1]]){
  const plain=dcReceiver.map((C,i)=>mod(aa*C+bb*k[i%k.length]));
  dcRows.push({key:name,op,score:m.scoreStream(plain).mean,prefix:m.spell(plain.slice(0,30))});
 }
 for(const [op,plain] of [['columnar-inverse',dcInverse(dcReceiver,k)],['columnar-forward',dcForward(dcReceiver,k)]])
  dcRows.push({key:name,op,score:m.scoreStream(plain).mean,prefix:m.spell(plain.slice(0,30))});
}
dcRows.sort((x,y)=>y.score-x.score);
assert.equal(dcRows.length,24);
assert.deepEqual([dcRows[0].key,dcRows[0].op],['state9-raw','C+k']);
assert(Math.abs(dcRows[0].score+3.3803054952429346)<1e-12);
let dcFloor=Infinity,dcCeiling=-Infinity,dcWindows=0;
for(let i=0;i+193<=g.length;i++){const s=m.scoreStream(g.slice(i,i+193)).mean;dcFloor=Math.min(dcFloor,s);dcCeiling=Math.max(dcCeiling,s);dcWindows++;}
assert.equal(dcWindows,62300);assert(Math.abs(dcFloor+3.1943745149464737)<1e-12);assert(dcRows.every(x=>x.score<dcFloor));
const dcOut={...out,directConsumer:{receiver:{page:23,start:20,length:193},candidateCount:24,best:dcRows.slice(0,8),gibran:{windows:dcWindows,floor:dcFloor,ceiling:dcCeiling},decision:'all 24 fixed consumers below every matched native window'}};
console.log(JSON.stringify(dcOut,null,2));fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(dcOut,null,2)+'\\n');
