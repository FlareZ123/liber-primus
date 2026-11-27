'use strict';
/** Exact public cumulative-state arbitrary-row-permutation capacity; optional slope range arguments. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const o=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),c=o.pages.slice(40,54).flatMap(p=>p.indices);
const mod=x=>(x+841)%29;
/** @param {string} z @returns {number[]} */
function enc(z){const out=[];for(const w of z.toUpperCase().match(/[A-Z]+/g)||[]){const a=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(let j=0;j<a.length;){if(a.startsWith('ING',j)){out.push(21);j+=3;continue}if(a.startsWith('IO',j)){out.push(27);j+=2;continue}let b=o.translit.findIndex(x=>x.length===2&&a.startsWith(x,j));if(b<0)b=o.translit.indexOf(a[j]);if(b>=0)out.push(b);j+=b<0?1:o.translit[b].length}}return out}
const sources=[['Gibran',enc(read('resources/control/gibran_prophet_58585.txt').split('*** START OF')[1].split('*** END')[0])],['Shakespeare',enc(read('resources/control/shakespeare_first300k.txt'))],['Emerson',enc(read('resources/control/emerson_essays_2944.txt'))]];
const N=c.length;assert.equal(N,3008);assert.deepEqual(sources.map(x=>x[1].length),[47662,217106,321327]);
function top2(m,j=0,end=29){let v1=0,v2=0;for(let k=j;k<end;k++){const v=m[k];if(v>v1){v2=v1;v1=v}else if(v>v2)v2=v}return v1+v2}
function cap(m){let a=1;for(let j=0;j<841;j+=29)a+=top2(m,j,j+29);return a}
const refs=sources.map(([name,x])=>{let h=new Uint16Array(29),min=Infinity,max=0,witness;for(let i=0;i<x.length;i++){h[x[i]]++;if(i>=N)h[x[i-N]]--;if(i>=N-1){const n=top2(h,1,29);if(n<min){min=n;witness=i-N+1}max=Math.max(max,n)}}return {name,len:x.length,count:x.length-N+1,min,max,witness}});
const floor=Math.min(...refs.map(x=>x.min));assert.equal(floor,518);
const x=[],y=[],t=[],z=[];let a=0,b=0;for(let i=0;i<N;i++){x.push(a);y.push(b);t.push(i%29);z.push(i?c[i-1]:0);a=(a+c[i])%29;b=(b+o.prime[c[i]])%29}
const forms=[];for(let k=0;k<4;k++)for(let u=0;u<29**(3-k);u++){const f=[0,0,0,0];f[k]=1;let v=u;for(let j=k+1;j<4;j++){f[j]=v%29;v=Math.floor(v/29)}forms.push(f)}assert.equal(forms.length,25260);
const lo=Number(process.argv[2]??0),hi=Number(process.argv[3]??28);assert(Number.isInteger(lo)&&Number.isInteger(hi)&&0<=lo&&lo<=hi&&hi<29);
const slopes=Array.from({length:hi-lo+1},(_,i)=>lo+i),res=slopes.map(s=>c.map((v,i)=>mod(v-s*z[i]))),out=slopes.map(s=>({s,max:0,min:Infinity,passes:0}));
const m=new Uint16Array(841),row=new Uint16Array(N);for(const f of forms){for(let i=1;i<N;i++)row[i]=(f[0]*x[i]+f[1]*y[i]+f[2]*t[i]+f[3]*z[i])%29*29;for(let h=0;h<slopes.length;h++){m.fill(0);for(let i=1;i<N;i++)m[row[i]+res[h][i]]++;const v=cap(m),q=out[h];if(v>q.max){q.max=v;q.f=f}q.min=Math.min(q.min,v);if(v>=floor)q.passes++}}
let seed=0xd3c71ab3;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
const controls=[];for(const [name,src] of sources)for(const hold of [false,true]){const start=rand(src.length-N+1),p=src.slice(start,start+N),f=[1,rand(29),rand(29),rand(29)],lambda=rand(29),map=Array.from({length:29},()=>{const q=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand(j+1);[q[j],q[k]]=[q[k],q[j]]}return q});let a=0,b=0,z=0,m=new Uint16Array(841),h=new Uint16Array(29),replay=0;for(let i=0;i<N;i++){const s=(f[0]*a+f[1]*b+f[2]*(i%29)+f[3]*z)%29,c=hold&&p[i]===0?0:(map[s][p[i]]+lambda*z)%29,r=mod(c-lambda*z);if(i)m[s*29+r]++;h[p[i]]++;if(hold&&p[i]===0?c===0:map[s].indexOf(r)===p[i])replay++;a=(a+c)%29;b=(b+o.prime[c])%29;z=c}const capacity=cap(m),truth=top2(h,1,29);assert(replay===N&&capacity>=truth);controls.push({name,hold,start,f,lambda,cap:capacity,truth,replay})}
console.log(JSON.stringify({n:N,forms:forms.length,slopes:out,refs,controls},null,2));
