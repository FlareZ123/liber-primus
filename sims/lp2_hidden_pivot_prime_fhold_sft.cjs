'use strict';
/** Hidden plaintext-coordinate swap: exact original gate and key-free coordinate trace. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const g=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),tokens=g.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){const out=[];for(const w of (s.toUpperCase().replaceAll("QU","CW").replaceAll("V","U").replaceAll("K","C").replaceAll("Q","C").replaceAll("Z","S").match(/[A-Z]+/g)||[]))for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;}else if(w.startsWith("IO",i)){out.push(27);i+=2;}else{const [tok,k]=tokens.find(([t])=>w.startsWith(t,i));out.push(k);i+=tok.length;}}return out;}
let ps=[];for(let n=2;ps.length<400;n++)if(ps.every(p=>p*p>n||n%p))ps.push(n);const piv=ps.map(p=>(p-1)%29);
let rng=0x3155ab26;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
function key(){let k=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rand(i+1);[k[i],k[j]]=[k[j],k[i]];}return k;}
/** @param {number[]} p @param {number[]} k */
function enc(p,k){let a=k.slice(),j=0;return p.map(x=>{if(x===0)return 0;let c=a[x],t=piv[j++];[a[x],a[t]]=[a[t],a[x]];return c;});}
/** @param {number[]} c @param {number[]} k @param {boolean[]} h */
function dec(c,k,h){let a=k.slice(),j=0;return c.map((x,i)=>{if(h[i])return 0;let p=a.indexOf(x),t=piv[j++];assert(p>0);[a[p],a[t]]=[a[t],a[p]];return p;});}
/** All-key partial inverse; -1 means unknown, never a guessed plaintext. */
function trace(c,h){let pos=new Int32Array(29).fill(-1),occ=new Int32Array(29).fill(-1),j=0,out=[];for(let i=0;i<c.length;i++){let x=c[i];if(h[i]){assert.equal(x,0);out.push(0);continue;}let p=pos[x],t=piv[j++],d=occ[t];if(p===0)return {ok:false,at:i,clock:j-1,out};out.push(p);if(p===t)continue;if(p>=0)occ[p]=-1;if(d>=0)pos[d]=-1;pos[x]=t;occ[t]=x;if(p>=0&&d>=0){pos[d]=p;occ[p]=d;}}return{ok:true,out};}
/** Exact necessary F-slot exclusion, independent of initial permutation. */
function frozen(c,h){let j=0,fr=-1,at=-1;for(let i=0;i<c.length;i++){let x=c[i];if(h[i]){assert.equal(x,0);continue;}if(x===fr)return{ok:false,at:i,frozenAt:at,c:x,clock:j};if(piv[j++]===0){fr=x;at=i;}}return {ok:true};}
let donors=[encode(read('resources/control/gibran_prophet_58585.txt')),encode(read('resources/control/shakespeare_first300k.txt'))];
let counts=[],wrong=[];
for(let i=0;i<16;i++){const d=donors[i%2],at=1000+700*i,p=d.slice(at,at+308),k=key(),h=p.map(x=>x===0),ct=enc(p,k);assert.deepEqual(dec(ct,k,h),p);const tr=trace(ct,h);assert(tr.ok&&tr.out.every((x,i)=>x<0||x===p[i])&&frozen(ct,h).ok);counts.push(tr.out.filter(x=>x>=0).length);const randomC=p.map(x=>x===0?0:rand(29));wrong.push(frozen(randomC,h).ok);}
const original=g.pages.filter(p=>p.page===54||p.page===55).flatMap(p=>p.indices),z=original.map((x,i)=>x===0?i:-1).filter(i=>i>=0);assert.deepEqual(z,[41,65,195,247,257,273]);
let ans=[];for(let m=0;m<1<<z.length;m++){let h=original.map((x,i)=>x===0&&((m>>z.indexOf(i))&1)!==0);ans.push(frozen(original,h));}
assert(ans.every(x=>!x.ok&&x.at===33&&x.frozenAt===16&&x.c===19));assert.equal(wrong.filter(Boolean).length,0);
console.log(JSON.stringify({counts,wrongSurvive:wrong.filter(Boolean).length,zeroAt:z,failures:[...new Set(ans.map(JSON.stringify))].map(JSON.parse),firstPrimes:ps.slice(0,34),firstPivots:piv.slice(0,34)}));
