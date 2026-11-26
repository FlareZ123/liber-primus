'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const fnv=a=>a.reduce((h,x)=>Math.imul(h^x,16777619)>>>0,2166136261).toString(16).padStart(8,'0');
const pack=a=>a.map(x=>String.fromCharCode(65+x)).join('');
const unpack=s=>Array.from(s,c=>c.charCodeAt(0)-65);
function fixture(){
 const gp=load('resources/liber-primus/lp2-corpus.json'),grid=load('resources/liber-primus/lp2-grid-256.json'),native=load('resources/external/relikd-solved-gp29-native-v1.json');
 const mp=new Map(gp.runes.map((x,i)=>[x,i]));
 const raw=gp.pages.slice(51,56).flatMap(p=>p.indices);
 const alpha=grid.alphabet.replace('f',''),v59=grid.pages.flatMap(p=>p.tokens).map(t=>59*alpha.indexOf(t[0])+alpha.indexOf(t[1]));
 const ranks=Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>grid.bytes[r*8+a]-grid.bytes[r*8+b]));
 for(let r=0;r<32;r++)assert.deepEqual(ranks[r],Array.from({length:8},(_,i)=>i).sort((a,b)=>v59[r*8+a]-v59[r*8+b]));
 return {raw,ranks,records:native.sections.map(s=>Array.from(s.source_text).filter(x=>mp.has(x)).map(x=>mp.get(x)))};
}
const data=process.argv[2]==='--fixture'?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):fixture();
const {raw,ranks,records}=data;
assert.equal(raw.length,842);assert.equal(fnv(raw),'271df03a');assert.equal(fnv(ranks.flat()),'69e2bb97');
assert.deepEqual(records.map(fnv),['2f91974a','38e8f43a','852f7ccf','2fbd2c9d','ba80a5e8','ddffc39a','41e53903','2d517d90','8afbfbea']);
const identity=Array.from({length:840},(_,i)=>i),rank=identity.map(i=>(i&~7)+ranks[(i>>3)%32][i&7]),inverse=identity.map(i=>(i&~7)+ranks[(i>>3)%32].indexOf(i&7));
const perm=(a,p)=>p.map(i=>a[i]),undo=(a,p)=>{const b=[];p.forEach((x,i)=>b[x]=a[i]);return b};
const encrypt=(p,k)=>{let j=0;return p.map(x=>x===0?0:(x+k[j++&7])%29)};
const weights=rs=>{const c=Array.from({length:29},()=>Array(29).fill(.5));for(const r of rs)for(let i=1;i<r.length;i++)c[r[i-1]][r[i]]++;return c.map(row=>{const t=row.reduce((a,b)=>a+b);return row.map(x=>Math.round(1e6*Math.log(x/t)))})};
function score(p,w){let fit=0,tail=0;for(let i=1;i<p.length;i++){const x=w[p[i-1]][p[i]];if(i<512)fit+=x;else tail+=x}return {fit,tail}}
const modes=[['outerRank',rank,identity],['outerInverse',inverse,identity],['innerRank',identity,rank],['innerInverse',identity,inverse],['baseline',identity,identity]];
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-rank840-'));
try{
 const exe=path.join(tmp,process.platform==='win32'?'rank.exe':'rank');
 const c=spawnSync(process.env.CXX||'g++',['-O3','-std=c++17',path.join(__dirname,'lp2_p50_rank8_terminal840.cpp'),'-o',exe],{encoding:'utf8'});assert.equal(c.status,0,c.stderr);
 const results={target:[],controls:[]},w=weights(records),target=raw.slice(0,840);
 for(const [label,outer,inner] of modes){
  const selection=process.argv[2]==='--fixture'?process.argv[4]:process.argv[2];if(selection&&selection!==label)continue;
  const cipher=perm(target,outer);const run=spawnSync(exe,[],{input:[pack(cipher),inner.join(' '),records.length,...records.map(pack)].join('\n'),encoding:'utf8',maxBuffer:1024*1024});assert.equal(run.status,0,run.stderr);
  const [counts,...lines]=run.stdout.trim().split('\n');const m=counts.match(/^legal=(\d+) pairs=(\d+)$/);assert.ok(m);
  const result={label,legalMasks:Number(m[1]),keyMaskPairs:Number(m[2]),candidates:[]};
  for(const line of lines){const a=line.match(/^(\w+) fit=(-?\d+) tail=(-?\d+) key=([0-9,]+) mask=(\d+) plaintext=(.*)$/);assert.ok(a);
   const [,kind,f,t,ks,mask,packed]=a,p=unpack(packed),key=ks.split(',').filter(Boolean).map(Number);
   assert.deepEqual(score(p,w),{fit:Number(f),tail:Number(t)});
   assert.deepEqual(undo(encrypt(undo(p,inner),key),outer),target);
   result.candidates.push({kind,fit:Number(f),tail:Number(t),key,mask:Number(mask),packed});
  }
  results.target.push(result);console.error(label,result.legalMasks,result.keyMaskPairs);
 }
 for(const [label,donors,key,outer,inner] of [['plantA',[3,6],[1,15,22,8,3,17,24,8],rank,identity],['plantB',[4,8],[0,7,18,12,23,0,25,6],inverse,identity],['plantC',[3,6],[8,15,9,24,6,17,24,8],identity,rank],['plantD',[4,8],[26,0,27,0,25,0,15,0],identity,inverse]]){
  const p=donors.flatMap(i=>records[i]).slice(0,840),cipher=undo(encrypt(undo(p,inner),key),outer);
  assert.equal(cipher.filter(x=>x===0).length,25);
  const held=p.filter(x=>x===0).length,train=weights(records.filter((_,i)=>!donors.includes(i)));
  results.controls.push({label,donors,key,held,zeroes:25,...score(p,train)});
 }
 console.log(JSON.stringify(results,null,2));
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
