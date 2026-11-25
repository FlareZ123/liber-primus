'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const recoverHold=require('./lp2_hill4_hold_path_recover.cjs');
const root=path.resolve(__dirname,'..'),corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8')),native=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const parse=s=>[...s].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
const train=native.sections.filter(s=>['0_warning','0_welcome','0_wisdom','jpg229','p56_an_end','p57_parable'].includes(s.name)).flatMap(s=>parse(s.source_text)),P=native.sections.filter(s=>['0_koan_1','0_loss_of_divinity','jpg107-167'].includes(s.name)).flatMap(s=>parse(s.source_text)).slice(0,1600);
const all=native.sections.flatMap(s=>parse(s.source_text)),hist=Array(29).fill(1);for(const x of train)hist[x]++;
const lp=hist.map(x=>Math.ceil(10000*Math.log(x/(train.length+29)))),score=a=>a.reduce((s,x)=>s+lp[x],0)/(10000*a.length);
const mod=x=>((x%29)+29)%29,encode=a=>a.map(x=>x.toString(29)).join('');
const primes=[];for(let x=2;primes.length<P.length;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
const H=[[1,3,6,4],[2,1,3,8],[7,5,2,3],[4,2,9,7]],M=[3,19,5,17],B=[1,11,7,5];
const white=[];for(let i=0;i<P.length;i+=4){const z=P.slice(i,i+4).map((x,j)=>mod(x-M[j]*(primes[i+j]-1)-B[j]));for(const a of H)white.push(mod(a.reduce((s,v,j)=>s+v*z[j],0)))}
const hold=P.slice(),idx=P.flatMap((x,i)=>x?[i]:[]);for(let i=0;i+3<idx.length;i+=4){const z=idx.slice(i,i+4).map(j=>P[j]);for(let j=0;j<4;j++)hold[idx[i+j]]=mod(H[j].reduce((s,x,k)=>s+x*z[k],B[j]))}
function recoverWhite(C,hits,fitN){
 const unigram=hist.map(x=>Math.log(x/(train.length+29))),bi=Array.from({length:29},()=>Array(29).fill(1));for(let i=1;i<train.length;i++)bi[train[i-1]][train[i]]++;const ll=bi.map(a=>{let s=a.reduce((s,v)=>s+v,0);return a.map(v=>Math.log(v/s))});
 const t=fitN/4,cand=hits.map(({r,m},j)=>{let z=[];for(let i=0;i<C.length;i+=4)z.push(mod(r.reduce((s,v,k)=>s+v*C[i+k],0)+m*(primes[i+j]-1)));let opts=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){let p=z.map(x=>mod(a*x+b));opts.push({a,b,p,s:p.slice(0,t).reduce((s,v)=>s+unigram[v],0)})}opts.sort((a,b)=>b.s-a.s);return opts.slice(0,16)});
 const pair=Array.from({length:4},(_,j)=>cand[j].map(a=>cand[(j+1)%4].map(b=>a.p.slice(0,t-(j===3)).reduce((s,v,i)=>s+ll[v][b.p[i+(j===3)]],0))));let best={s:-Infinity};for(let a=0;a<16;a++)for(let b=0;b<16;b++)for(let d=0;d<16;d++)for(let e=0;e<16;e++){const s=pair[0][a][b]+pair[1][b][d]+pair[2][d][e]+pair[3][e][a];if(s>best.s)best={s,indices:[a,b,d,e]}}
 const out=[];for(let i=0;i<C.length/4;i++)for(let j=0;j<4;j++)out.push(cand[j][best.indices[j]].p[i]);return{plain:out,maps:hits.map((h,j)=>({...h,a:cand[j][best.indices[j]].a,b:cand[j][best.indices[j]].b})),score:best.s};
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp2hill-'));const env={...process.env,OMP_NUM_THREADS:process.env.OMP_NUM_THREADS||'4'};
function compile(name){const exe=path.join(dir,name+(process.platform==='win32'?'.exe':''));cp.execFileSync(process.env.CXX||'g++',['-O3','-std=c++17','-fopenmp',path.join(__dirname,name+'.cpp'),'-o',exe],{stdio:'inherit',env});return exe}
function run(exe,a,arg){const f=path.join(dir,'tape.txt');fs.writeFileSync(f,encode(a)+'\n');return JSON.parse(cp.execFileSync(exe,[f,String(arg)],{encoding:'utf8',env,maxBuffer:16*1024*1024}))}
try{
 const we=compile('lp2_hill4_prime_whiten'),he=compile('lp2_hill4_latent_f'),wfile=path.join(dir,'weights.txt');fs.writeFileSync(wfile,lp.join(' ')+'\n');
 const orig=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices);
 const results=[0,9,20].map(origin=>{const C=orig.slice(origin);return{origin,n:C.length,whitening:[0,1,2,3].map(phase=>run(we,C,phase)),latentF:run(he,C,wfile)}});
 const whiteFit=run(we,white.slice(0,1000),0),whiteDecode=recoverWhite(white,whiteFit.post,1000);assert.deepEqual(whiteDecode.plain,P);
 const holdFit=run(he,hold.slice(0,1000),wfile),holdDecode=recoverHold(hold,holdFit.chosen,train,1000);assert.deepEqual(holdDecode.plain,P);
 const windows=[];for(let i=0;i+1883<=all.length;i++)windows.push(score(all.slice(i,i+1883)));
 console.log(JSON.stringify({trainN:train.length,weights:lp,referenceWindow:[Math.min(...windows),Math.max(...windows)],results,controls:{whiteFit,whiteMaps:whiteDecode.maps,whiteCorrect:1600,holdFit,holdOrder:holdDecode.order,holdCorrect:1600,fit:1000,heldout:600,plainZeros:P.filter(x=>!x).length,holdCipherZeros:hold.filter(x=>!x).length}},null,2));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
