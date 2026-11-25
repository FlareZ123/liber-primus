'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(data,nativeData){
const gp=new Map(data.runes.map((x,i)=>[x,i])),src=nativeData.sections.map(x=>({name:x.name,a:[...x.source_text].filter(c=>gp.has(c)).map(c=>gp.get(c))}));
function isqrt(n){if(n<2n)return n;let x=1n<<BigInt(Math.ceil(n.toString(2).length/2));for(;;){const y=(x+n/x)>>1n;if(y>=x)return x;x=y;}}
function phiDigits(n){const B=29n**BigInt(n),Q=5n*B*B,S=isqrt(Q),V=(S-B)/2n,arr=Array(n).fill(0);if((2n*V+B)**2n>Q||(2n*V+B+2n)**2n<=Q)throw Error("floor");let x=V;for(let i=n-1;i>=0;i--){arr[i]=Number(x%29n);x/=29n}if(x!==0n)throw Error("digit");return arr}
const orig=data.pages.slice(15,23).flatMap(p=>p.indices).slice(20),K=phiDigits(3302+Math.max(orig.length,800)+10),mod=x=>(x+29)%29;
const encode=(p,o,h)=>{let i=o;return p.map(x=>h&&x===0?0:mod(x+K[i++]))};
function gate(C,o,h,restrict){let st=new Set([o]),peak=1;for(let i=0;i<C.length;i++){const c=C[i],nx=new Set();for(const k of st){if(h&&c===0)nx.add(k);const x=mod(c-K[k]);if((!h||x!==0)&&(!restrict||![12,22].includes(x)))nx.add(k+1)}if(!nx.size)return {ok:false,offset:i,peak};st=nx;peak=Math.max(peak,st.size)}return {ok:true,cursors:[...st],peak}}
function census(C,h,restrict){const survivors=[];let max=-1,best=[],peak=0;for(let o=0;o<=3301;o++){const g=gate(C,o,h,restrict);peak=Math.max(peak,g.peak);if(g.ok)survivors.push(o);else if(g.offset>max){max=g.offset;best=[o]}else if(g.offset===max)best.push(o)}return {survivors,bestFailureOffset:max,best,peak}}
const ioc=p=>{const f=Array(29).fill(0);for(const x of p)f[x]++;return f.reduce((a,b)=>a+b*(b-1),0)/(p.length*(p.length-1))};
const count=Array.from({length:30},()=>Array(29).fill(.5));for(const {a} of src.filter(s=>!["0_koan_1","0_welcome"].includes(s.name)))for(let i=0;i<a.length;i++)count[i?a[i-1]:29][a[i]]++;
const logs=count.map(a=>a.map(x=>Math.log(x/a.reduce((s,y)=>s+y,0))));
function vit(C,o,h,last=29){let st=new Map([[o+","+last,{k:o,last,s:0,p:[]}]]);for(const c of C){const nx=new Map();for(const v of st.values()){
const add=(x,k)=>{if([12,22].includes(x))return;const id=k+","+x,s=v.s+logs[v.last][x],old=nx.get(id);if(!old||s>old.s)nx.set(id,{k,last:x,s,p:[...v.p,x]})};
if(h&&c===0)add(0,v.k);const x=mod(c-K[v.k]);if(!h||x!==0)add(x,v.k+1)}
if(!nx.size)return null;st=nx}return [...st.values()].sort((a,b)=>b.s-a.s)[0]}
const controls=[];
for(const [name,o] of [["0_koan_1",1033],["0_welcome",3301]]){const p=src.find(x=>x.name===name).a;for(const h of [true,false]){const c=encode(p,o,h),g=census(c.slice(0,400),h,true);if(g.survivors.length!==1||g.survivors[0]!==o)throw Error("origin");const v=vit(c.slice(0,400),g.survivors[0],h),w=vit(c.slice(400),v.k,h,v.last);const r=[...v.p,...w.p];if(encode(r,o,h).join()!==c.join())throw Error("replay");controls.push({name,hold:h,origin:o,origins:g.survivors,trainingCorrect:v.p.filter((x,i)=>x===p[i]).length,withheldCorrect:w.p.filter((x,i)=>x===p[400+i]).length,withheldLength:p.length-400});}}
return {length:orig.length,digits:K.slice(0,32),ordinaryPhaseZeroIoC:ioc(orig.map((x,i)=>mod(x-K[i]))),holdPhaseZero:gate(orig,0,true,false),holdGP29:census(orig,true,false),holdGP27:census(orig,true,true),ordinaryGP27:census(orig,false,true),controls};
}
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
