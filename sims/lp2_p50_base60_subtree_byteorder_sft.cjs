'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const g=load('resources/liber-primus/lp2-grid-256.json'),c=load('resources/liber-primus/lp2-corpus.json'),s=load('resources/external/relikd-solved-gp29-native-v1.json');
const t=g.pages.flatMap(p=>p.tokens),a59=g.alphabet.replace('f',''),a60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const parent=t.map(x=>a59.indexOf(x[0])*59+a59.indexOf(x[1])),bytes=t.map(x=>a60.indexOf(x[0])*60+a60.indexOf(x[1]));
const children=Array.from({length:256},()=>[]);parent.forEach((p,i)=>{if(p!==i)children[p].push(i)});
const desc=r=>{const out=[],visit=i=>{out.push(i);children[i].forEach(visit)};visit(r);return out};
function byteOrder(r,method,descending){
 const ch=i=>[...children[i]].sort((x,y)=>descending?(bytes[y]-bytes[x]||y-x):(bytes[x]-bytes[y]||x-y)),out=[];
 if(method==='bfs'){const q=[r];for(let i=0;i<q.length;i++){out.push(q[i]);q.push(...ch(q[i]))}return out}
 const visit=i=>{if(method==='pre')out.push(i);ch(i).forEach(visit);if(method==='post')out.push(i)};visit(r);return out;
}
const split=s.sections.map(sec=>{const q=Array.from(sec.source_text).map(x=>s.runes.indexOf(x)).filter(x=>x>=0),n=Math.floor(q.length*2/3);return {train:q.slice(0,n),test:q.slice(n)}});
function model(n){const m=new Map();let total=0;for(const sec of split)for(let i=0;i<=sec.train.length-n;i++){const k=sec.train.slice(i,i+n).join(',');m.set(k,(m.get(k)||0)+1);total++}return q=>{let z=0,w=0;for(let i=0;i<=q.length-n;i++){z+=Math.log(((m.get(q.slice(i,i+n).join(','))||0)+.1)/(total+.1*29**n));w++}return z/w}}
const s3=model(3),s4=model(4);
function controls(n){const a=[];for(const sec of split)for(let i=0;i+n<=sec.test.length;i++){const q=sec.test.slice(i,i+n);a.push({s3:s3(q),s4:s4(q)})}const stat=k=>{const v=a.map(x=>x[k]).sort((x,y)=>x-y);return {count:v.length,min:v[0],median:v[Math.floor(v.length/2)],max:v.at(-1)}};return {s3:stat('s3'),s4:stat('s4')}}
const results=[];
for(const [page,r] of [[32,58],[55,244]]){
 const cipher=c.pages.find(x=>x.page===page).indices,nodes=desc(r).sort((x,y)=>x-y),pos=new Map(nodes.map((x,i)=>[x,i]));
 for(const method of ['bfs','pre','post'])for(const descending of [false,true]){
  const order=byteOrder(r,method,descending),rank=new Map(order.map((x,i)=>[x,i]));
  const forward=order.map(x=>cipher[pos.get(x)]),inverse=nodes.map(x=>cipher[rank.get(x)]);
  for(const [direction,p] of [['address-to-byte-order',forward],['byte-order-to-address',inverse]])
   results.push({page,order:method+(descending?'-byte-desc':'-byte-asc'),direction,score3:s3(p),score4:s4(p)});
 }
}
assert.equal(results.length,24);
const summary={};
for(const page of [32,55]){
 const q=results.filter(x=>x.page===page),b3=q.reduce((a,x)=>x.score3>a.score3?x:a),b4=q.reduce((a,x)=>x.score4>a.score4?x:a),ctl=controls(page===32?121:76);
 assert.ok(b3.score3<ctl.s3.min&&b4.score4<ctl.s4.min);
 summary[page]={subtreeRoot:page===32?58:244,subtreeSize:page===32?121:76,best3:b3,best4:b4,heldOutControls:ctl};
}
assert.ok(Math.abs(summary[32].best3.score3-(-10.51509921798882))<1e-9);
assert.ok(Math.abs(summary[32].best4.score4-(-13.470648229711012))<1e-9);
assert.ok(Math.abs(summary[55].best3.score3-(-10.493843146268109))<1e-9);
assert.ok(Math.abs(summary[55].best4.score4-(-13.496449267318807))<1e-9);
console.log(JSON.stringify({status:'PASS: bounded negative',transpositions:24,childOrder:'base60 byte ascending/descending, ties by node address in same direction',directions:['address-to-byte-order','byte-order-to-address'],results:summary},null,2));
