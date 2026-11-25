'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const grid=load('resources/liber-primus/lp2-grid-256.json');
const corpus=load('resources/liber-primus/lp2-corpus.json');
const solved=load('resources/external/relikd-solved-gp29-native-v1.json');
const tokens=grid.pages.flatMap(p=>p.tokens);
const a59=grid.alphabet.replace('f','');
const a60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const parent=tokens.map(t=>a59.indexOf(t[0])*59+a59.indexOf(t[1]));
const bytes=tokens.map(t=>a60.indexOf(t[0])*60+a60.indexOf(t[1]));
assert.equal(tokens.length,256);assert.equal(Math.max(...bytes),255);
const children=Array.from({length:256},()=>[]);
parent.forEach((p,i)=>{if(p!==i)children[p].push(i)});
const desc=r=>{const a=[];const f=i=>{a.push(i);children[i].forEach(f)};f(r);return a};
assert.equal(parent.findIndex((p,i)=>p===i),189);
assert.equal(desc(58).length,121);assert.equal(desc(244).length,76);
function order(r,m,rev){
 const ch=i=>rev?[...children[i]].reverse():children[i],out=[];
 if(m==='address')return desc(r).sort((a,b)=>a-b);
 if(m==='bfs'){const q=[r];for(let i=0;i<q.length;i++){out.push(q[i]);q.push(...ch(q[i]))}return out}
 const f=i=>{if(m==='pre')out.push(i);ch(i).forEach(f);if(m==='post')out.push(i)};f(r);return out;
}
const orders=[];
for(const [page,r] of [[32,58],[55,244]]){
 orders.push({page,name:'address',nodes:order(r,'address',false)});
 for(const m of ['bfs','pre','post'])for(const rev of [false,true])orders.push({page,name:m+(rev?'-desc':'-asc'),nodes:order(r,m,rev)});
}
const split=solved.sections.map(s=>{const q=Array.from(s.source_text).map(x=>solved.runes.indexOf(x)).filter(x=>x>=0),n=Math.floor(q.length*2/3);return {train:q.slice(0,n),test:q.slice(n)}});
function model(n){
 const counts=new Map();let total=0;
 for(const s of split)for(let i=0;i<=s.train.length-n;i++){const k=s.train.slice(i,i+n).join(',');counts.set(k,(counts.get(k)||0)+1);total++}
 return q=>{let z=0,w=0;for(let i=0;i<=q.length-n;i++){z+=Math.log(((counts.get(q.slice(i,i+n).join(','))||0)+.1)/(total+.1*29**n));w++}return z/w};
}
const s3=model(3),s4=model(4);
const dec=(c,k,minus,hold)=>{let j=0;return c.map(x=>{if(hold&&x===0)return 0;const y=(x-(minus?k[j]:-k[j])+2900)%29;j++;return y})};
const candidates=[];
for(const o of orders){
 const c=corpus.pages.find(p=>p.page===o.page).indices;
 assert.equal(c.length,o.nodes.length);
 const k=o.nodes.map(i=>bytes[i]%29);
 for(const minus of [true,false])for(const hold of [false,true]){
  const p=dec(c,k,minus,hold);
  candidates.push({page:o.page,order:o.name,op:minus?'minus':'plus',F:hold?'hold':'consume',s3:s3(p),s4:s4(p)});
 }
}
assert.equal(candidates.length,56);
function controls(n){
 const a=[];for(const s of split)for(let i=0;i+n<=s.test.length;i++){const q=s.test.slice(i,i+n);a.push({s3:s3(q),s4:s4(q)})}
 const stats=k=>{const v=a.map(x=>x[k]).sort((x,y)=>x-y);return {n:v.length,min:v[0],median:v[Math.floor(v.length/2)],max:v.at(-1)}};
 return {s3:stats('s3'),s4:stats('s4')};
}
const result={};
for(const page of [32,55]){
 const q=candidates.filter(x=>x.page===page),b3=q.reduce((a,x)=>x.s3>a.s3?x:a),b4=q.reduce((a,x)=>x.s4>a.s4?x:a);
 const ctl=controls(page===32?121:76);
 assert.ok(b3.s3<ctl.s3.min&&b4.s4<ctl.s4.min);
 result[page]={root:page===32?58:244,size:page===32?121:76,best3:b3,best4:b4,heldout:ctl};
}
assert.ok(Math.abs(result[32].best3.s3-(-10.438972514008023))<1e-9);
assert.ok(Math.abs(result[32].best4.s4-(-13.455806974559543))<1e-9);
assert.ok(Math.abs(result[55].best3.s3-(-10.315528642844388))<1e-9);
assert.ok(Math.abs(result[55].best4.s4-(-13.463601386869515))<1e-9);
console.log(JSON.stringify({status:'PASS: bounded negative',ordersPerPage:7,signs:2,FPolicies:2,decoders:56,results:result},null,2));
