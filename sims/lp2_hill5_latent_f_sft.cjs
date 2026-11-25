'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const recoverHold=require('./lp2_hill5_hold_path_recover.cjs');
const root=path.resolve(__dirname,'..'),corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),native=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const parse=s=>[...s].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
const train=native.sections.filter(s=>['0_warning','0_welcome','0_wisdom','jpg229','p56_an_end','p57_parable'].includes(s.name)).flatMap(s=>parse(s.source_text)),test=native.sections.filter(s=>['0_koan_1','0_loss_of_divinity','jpg107-167'].includes(s.name)).flatMap(s=>parse(s.source_text)),P=test.slice(0,1600);
const hist=Array(29).fill(1);for(const x of train)hist[x]++;
const lp=hist.map(x=>Math.ceil(10000*Math.log(x/(train.length+29)))),score=a=>a.reduce((s,x)=>s+lp[x],0)/(10000*a.length);
const mod=x=>((x%29)+29)%29,encode=a=>a.map(x=>x.toString(29)).join('');
const H=[[1,3,6,4,2],[2,1,3,8,5],[7,5,2,3,1],[4,2,9,7,3],[2,11,4,3,1]],B=[1,11,7,5,17];
const hold=P.slice(),idx=P.flatMap((x,i)=>x?[i]:[]);for(let i=0;i+4<idx.length;i+=5){const z=idx.slice(i,i+5).map(j=>P[j]);for(let j=0;j<5;j++)hold[idx[i+j]]=mod(H[j].reduce((s,x,k)=>s+x*z[k],B[j]))}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp2hill5-'));const env={...process.env,OMP_NUM_THREADS:process.env.OMP_NUM_THREADS||'4'};
function run(exe,a,w){const f=path.join(dir,'tape.txt');fs.writeFileSync(f,encode(a)+'\n');return JSON.parse(cp.execFileSync(exe,[f,w],{encoding:'utf8',env,maxBuffer:16*1024*1024}))}
try{
const exe=path.join(dir,'hill5'+(process.platform==='win32'?'.exe':'')),w=path.join(dir,'weights.txt');
cp.execFileSync(process.env.CXX||'g++',['-O3','-std=c++17','-fopenmp',path.join(__dirname,'lp2_hill5_latent_f.cpp'),'-o',exe],{stdio:'inherit',env});fs.writeFileSync(w,lp.join(' ')+'\n');
const original=corpus.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices).slice(16);
assert.equal(original.length,1005);assert.equal(original.reduce((s,x)=>s+x,0),14023);assert.equal(original.reduce((s,x,i)=>s+x*(i+1),0),7096046);
const result=run(exe,original,w),fit=run(exe,hold.slice(0,1000),w),windows=[];for(let i=0;i+1005<=test.length;i++)windows.push(score(test.slice(i,i+1005)));
const candidates=[];for(let i=0;i<6;i++){try{const d=recoverHold(hold,fit.top.slice(0,6).filter((_,j)=>i!==j),train,1000);candidates.push({excluded:i,fitScore:d.fitScore,order:d.order,fitCorrect:d.plain.slice(0,1000).filter((x,i)=>x===P[i]).length,heldoutCorrect:d.plain.slice(1000).filter((x,i)=>x===P[1000+i]).length});}catch(e){candidates.push({excluded:i,error:e.message})}}
const recovery=candidates.filter(x=>Number.isFinite(x.fitScore)).sort((a,b)=>b.fitScore-a.fitScore)[0];assert.equal(recovery.fitCorrect,1000);assert.equal(recovery.heldoutCorrect,600);
console.log(JSON.stringify({original:result,fit,trainN:train.length,testN:test.length,windows:{n:windows.length,min:Math.min(...windows),max:Math.max(...windows)},recovery,candidates},null,2));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
