/** SFT for exact all-key, arbitrary-init, native-F prime-clock feedback.
 * node sims/lp2_prime_clock_plaintext_feedback_arbitrary2_sft.cjs
 * Requires C++17 compiler (CXX or g++). OpenMP may be enabled via CXXFLAGS.
 * Uses corpus directly, builds temporary executable, enumerates all surviving paths.
 */
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..','resources','liber-primus');
const c=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const t=c.pages.filter(p=>p.page>=16&&p.page<=39).flatMap(p=>p.indices),L=c.pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices).length,M=841;
assert.equal(L,1613);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-fir-'));
try{
const tape=path.join(dir,'tape.txt'),exe=path.join(dir,process.platform==='win32'?'exact.exe':'exact');
fs.writeFileSync(tape,t.slice(0,L).map(x=>x.toString(29)).join('')+'\n');
execFileSync(process.env.CXX||'g++',['-std=c++17','-O3',...(process.env.CXXFLAGS||'').split(/\s+/).filter(Boolean),path.join(__dirname,'lp2_prime_clock_plaintext_feedback_arbitrary2.cpp'),'-o',exe],{stdio:'inherit'});
const native=JSON.parse(execFileSync(exe,[tape,'0','29','1'],{encoding:'utf8',maxBuffer:10*1024*1024}));
const keys=native.survivors;assert.equal(native.keys,682892);
const labels=c.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
const s=fs.readFileSync(path.join(root,'lp1-plaintext-reference.txt'),'utf8').split('\n').filter(l=>!l.startsWith('#')&&!l.startsWith('[')&&/^[A-Z]/.test(l)).join(' ').replace(/K/g,'C').replace(/Q/g,'CW').replace(/V/g,'U').replace(/Z/g,'S');
const ref=[];for(let i=0;i<s.length;){const m=labels.find(([x])=>s.startsWith(x,i));if(m){ref.push(m[1]);i+=m[0].length}else i++}
const p=[];for(let i=2;p.length<t.length;i++){let yes=true;for(const q of p){if(q*q>i)break;if(i%q===0){yes=false;break}}if(yes)p.push(i)}const pm=p.map(x=>(x-1)%29);
const big=Array.from({length:29},()=>Array(29).fill(1));for(let i=1;i<ref.length;i++)big[ref[i-1]][ref[i]]++;
const lp=big.map(row=>{let sum=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/sum))});
/** @param {number[]} a */
function score(a){let n=Array(29).fill(0),ll=0;for(let i=0;i<a.length;i++){n[a[i]]++;if(i)ll+=lp[a[i-1]][a[i]]}return [n.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1)),ll/(a.length-1)]}
let counts=[],survival=[],pathsTotal=0n,maxIoc=0,top=[];
for(const key of keys){const [b,d,m,k,nend]=key;
 const step=(v,i)=>{let h=Math.floor(v/M),x=v%29,y=Math.floor(v/29)%29,z=(t[i]+k+b*x+d*y+m*pm[i-h])%29;return [t[i]===0?v+M:-1,z?M*h+29*x+z:-1,z]};
 let ar=Array.from({length:M},(_,i)=>i),layers=[ar];for(let i=0;i<L;i++){let next=new Set();for(const v of ar){let [hold,consume]=step(v,i);if(hold>=0)next.add(hold);if(consume>=0)next.add(consume)}ar=[...next];layers.push(ar)}assert.equal(ar.length,nend);
 let at=L;for(;at<t.length;at++){let next=new Set();for(const v of ar){let [h,q]=step(v,at);if(h>=0)next.add(h);if(q>=0)next.add(q)}ar=[...next];if(!ar.length)break}survival.push([key.slice(0,4),at-L,ar.length]);
 let live=new Map(layers[L].map(v=>[v,1n]));const viable=Array(L+1);viable[L]=live;
 for(let i=L-1;i>=0;i--){let a=new Map();for(const v of layers[i]){const [h,q]=step(v,i);let n=(live.get(h)||0n)+(live.get(q)||0n);if(n)a.set(v,n)}live=a;viable[i]=live}
 let n=[...live.values()].reduce((s,x)=>s+x,0n);counts.push([key.slice(0,4),live.size,n.toString()]);pathsTotal+=n;
 // Fail explicitly if input changes and enumeration becomes unexpectedly large.
 assert(n<=100000n);let out=new Uint8Array(L),enumerated=0n;
 function visit(i,v){if(i===L){enumerated++;const x=Array.from(out),ic=score(x)[0];maxIoc=Math.max(ic,maxIoc);for(let a=1;a<29;a++){const pp=x.map(z=>z*a%29),ll=score(pp)[1];if(top.length<10||ll>top[9].ll){top.push({key:key.slice(0,4),scale:a,ioc:ic,ll,text:pp.slice(0,100).map(z=>c.translit[z]).join('')});top.sort((a,b)=>b.ll-a.ll);top.length=Math.min(10,top.length)}}return}let [h,q,z]=step(v,i);if(viable[i+1].has(h)){out[i]=0;visit(i+1,h)}if(viable[i+1].has(q)){out[i]=z;visit(i+1,q)}}
 for(const v of viable[0].keys())visit(0,v);assert.equal(enumerated,n);
}
assert.equal(keys.length,77);assert.equal(pathsTotal,314n);assert.equal(maxIoc,0.03538249243506928);assert(survival.every(x=>x[2]===0));assert.equal(Math.max(...survival.map(x=>x[1])),421);
console.log(JSON.stringify({native,keys:keys.length,terminalStates:keys.reduce((s,k)=>s+k[4],0),pathsTotal:pathsTotal.toString(),counts,continued:survival.sort((a,b)=>b[1]-a[1]),maxIoc,refScores:[score(ref),score(ref.slice(1613))],top},null,2));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
