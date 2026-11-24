'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const assert=(v,msg)=>{if(!v)throw Error(msg)},mod=x=>(x+29)%29;
const sourcePaths=['resources/liber-primus/lp2-corpus.json','resources/liber-primus/lp2-grid-256.json','resources/external/relikd-solved-gp29-native-v1.json'];
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h.toString(16).padStart(8,'0')};
function input(root){
 const [gp,grid,native]=sourcePaths.map(p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'))),mp=new Map(gp.runes.map((x,i)=>[x,i]));
 const pack=a=>a.map(x=>String.fromCharCode(65+x)).join('');
 const alphabet59=grid.alphabet.replace('f',''),v59=grid.pages.flatMap(p=>p.tokens).map(t=>59*alphabet59.indexOf(t[0])+alphabet59.indexOf(t[1]));
 for(let r=0;r<32;r++)assert(String(Array.from({length:8},(_,i)=>i).sort((a,b)=>grid.bytes[r*8+a]-grid.bytes[r*8+b]))===String(Array.from({length:8},(_,i)=>i).sort((a,b)=>v59[r*8+a]-v59[r*8+b])), 'base59 rank agreement');
 return {cipher:pack(gp.pages.slice(51,54).flatMap(p=>p.indices).slice(0,512)),grid:Buffer.from(grid.bytes).toString('hex'),native:native.sections.map(s=>({name:s.name,seq:pack(Array.from(s.source_text).filter(x=>mp.has(x)).map(x=>mp.get(x)))})),translit:gp.translit};
}
function run(data,exe,selection){
 const expected=['538c0b28','70f2f985','453b40cc','66422e2d','92acbe33','67a9eac5','7f1e5490','767a1a5d','fb59fff1'];
 assert(hash(data.cipher)==='c5461606'&&hash(data.grid)==='54bc0a2c'&&data.native.every((x,i)=>hash(x.seq)===expected[i]),'packed source mismatch');
 const decode=s=>Array.from(s,x=>x.charCodeAt(0)-65),C=decode(data.cipher),bytes=Array.from(Buffer.from(data.grid,'hex')),solved=data.native.map(s=>decode(s.seq));
 const rows=Array.from({length:32},(_,r)=>Array.from({length:8},(_,i)=>i).sort((a,b)=>bytes[r*8+a]-bytes[r*8+b]));
 const mapping=(n,inv)=>Array.from({length:n},(_,j)=>{const r=rows[(j>>3)%32];return (j&~7)+(inv?r[j&7]:r.indexOf(j&7))});
 const display=a=>a.map(x=>(data.translit||['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'])[x]).join('');
 function model(exclude){const bg=Array.from({length:29},()=>Array(29).fill(.5)),u=Array(29).fill(.5);solved.forEach((p,j)=>{if(j!==exclude)p.forEach((x,i)=>{u[x]++;if(i)bg[p[i-1]][x]++})});for(const r of bg){const sum=r.reduce((a,b)=>a+b);for(let i=0;i<29;i++)r[i]=Math.log(r[i]/sum)}const sum=u.reduce((a,b)=>a+b);for(let i=0;i<29;i++)u[i]=Math.log(u[i]/sum);return {bg,u}}
 function forward(p,k,map){const phys=new Array(p.length);p.forEach((x,i)=>phys[map[i]]=x);let phase=0;return phys.map(x=>x===0?0:(x+k[phase++&7])%29)}
 function holdout(c,k,map,m,start,prev){
  let states=new Map([[start*29+prev,{phase:start,last:prev,score:0,p:[]}]])
  for(let i=0;i<256;i+=8){const next=new Map();for(const st of states.values()){const p=[];function visit(j,phase){if(j===8){const natural=Array.from({length:8},(_,v)=>p[map[256+i+v]-256-i]);let score=st.score,last=st.last;for(const x of natural){score+=m.bg[last][x];last=x}const id=phase*29+last,old=next.get(id);if(!old||score>old.score)next.set(id,{phase,last,score,p:st.p.concat(natural)});return}const x=c[256+i+j];if(x===0){p.push(0);visit(j+1,phase);p.pop()}const v=mod(x-k[phase]);if(v){p.push(v);visit(j+1,(phase+1)&7);p.pop()}}visit(0,st.phase)}states=next;if(!states.size)return null;}
  return [...states.values()].reduce((a,b)=>a.score>=b.score?a:b);
 }
 function solve(label,c,inv,m,truth=null,key=null){const map=mapping(512,inv);console.error('START',label,inv);const child=spawnSync(exe,[],{input:[...c,...map,...m.u,...m.bg.flat()].join(' '),encoding:'utf8',maxBuffer:16*1024*1024});process.stderr.write(child.stderr||'');assert(child.status===0,child.error?.message||'C++ solver failed');const r=JSON.parse(child.stdout);assert(r.mask>=0,'no candidate');let z=0,q=0;const phys=c.slice(0,256).map(x=>x===0&&(r.mask&(1<<z++))?0:mod(x-r.key[q++&7]));const p=map.slice(0,256).map(i=>phys[i]);assert((q&7)===r.phase,'phase');const fitScore=p.reduce((s,x,i)=>s+(i?m.bg[p[i-1]][x]:m.u[x]),0)/256;assert(Math.abs(fitScore-r.score)<1e-8,'factor objective replay');const h=holdout(c,r.key,map,m,r.phase,p[255]);assert(h&&String(forward(p.concat(h.p),r.key,map))===String(c),'512 replay');return {label,inv,...r,fit:p,fitDisplay:display(p),correctKey:key?String(key)===String(r.key):null,correctFit:truth?p.filter((x,i)=>x===truth[i]).length:null,holdout:{score:h.score/256,p:h.p,display:display(h.p),correct:truth?h.p.filter((x,i)=>x===truth[i+256]).length:null,replay:true}}}
 const output={controls:[],target:[]};
 for(const [idx,key,inv] of [[1,[23,10,1,10,9,10,16,26],false],[4,[3,17,9,22,6,1,14,10],true]]){if(selection&&selection!==String(idx))continue;const p=solved[idx].slice(0,512),c=forward(p,key,mapping(512,inv));const r=solve(data.native[idx].name,c,inv,model(idx),p,key);console.error('RESULT',r.label,r.score,r.holdout.score,r.correctKey,r.correctFit,r.holdout.correct);output.controls.push(r)}
 for(const inv of [false,true]){if(selection&&selection!==(inv?'reverse':'forward'))continue;const r=solve('p51-53',C,inv,model(-1));console.error('RESULT',r.label,r.inv,r.score,r.holdout.score);output.target.push(r)}
 return output;
}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-rank8-'));
try{
 const args=process.argv.slice(2),fixture=args[0]==='--fixture';const data=fixture?JSON.parse(fs.readFileSync(args[1],'utf8')):input(path.resolve(__dirname,'..'));const selection=fixture?args[2]:args[0];
 const exe=path.join(tmp,process.platform==='win32'?'rank8_reverse.exe':'rank8_reverse');
 const source=path.join(__dirname,'lp2_p50_rank8_period8_spacingfree_reverse.cpp');const compile=spawnSync(process.env.CXX||'g++',['-std=c++17','-O3',source,'-o',exe],{encoding:'utf8'});assert(compile.status===0,compile.error?.message||compile.stderr);console.log(JSON.stringify(run(data,exe,selection),null,2));
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
