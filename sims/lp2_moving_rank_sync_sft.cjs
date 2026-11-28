'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const A=29,FULL=(1<<A)-1,prime=gp.prime;
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24;}
function prune(sets){
 const match=new Int8Array(A).fill(-1);let seen=0;
 function aug(i){for(let b=sets[i]&~seen;b;b&=b-1){const q=b&-b;if(seen&q)continue;const r=31-Math.clz32(q);seen|=q;if(match[r]<0||aug(match[r])){match[r]=i;return true;}}return false;}
 const order=Array.from({length:A},(_,i)=>i).sort((i,j)=>pc(sets[i])-pc(sets[j]));for(const i of order){seen=0;assert(aug(i),'no perfect matching');}
 // Each edge i -> match[r] can belong to a perfect matching iff it lies on
 // an alternating cycle (the current matched edges are self loops).
 const graph=sets.map(s=>{let g=0;for(let b=s;b;b&=b-1)g|=1<<match[31-Math.clz32(b&-b)];return g;});
 for(let j=0;j<A;j++)for(let i=0;i<A;i++)if(graph[i]&(1<<j))graph[i]|=graph[j];
 return sets.map((s,i)=>{let g=0;for(let b=s;b;b&=b-1){const q=b&-b,r=31-Math.clz32(q);if(graph[match[r]]&(1<<i))g|=q;}return g;});
}
function transition(s,x,k){const lo=31-Math.clz32(s[x]&-s[x]),hi=31-Math.clz32(s[x]),lm=(1<<(lo+1))-1,hm=(1<<hi)-1,im=(1<<k)-1;return prune(s.map((v,y)=>{if(y===x)return 1<<k;const d=((v&~lm)>>>1)|(v&hm);return (d&im)|((d&~im)<<1);}));}
function primeStream(n){const a=[];for(let i=2;a.length<n;i++){let ok=true;for(const p of a){if(p*p>i)break;if(i%p===0){ok=false;break;}}if(ok)a.push(i);}return a.map(p=>(p-1)%29);}
const ps=primeStream(12956),modes={ordinal:(x,i)=>x,primeResidue:(x,i)=>prime[x]%29,p56clock:(x,i)=>ps[i]};
function run(c,mode,truth){
 let sets=Array(A).fill(FULL),sync=null,deck=null,p=[],certain=0,counts=Array(A).fill(0);
 for(let i=0;i<c.length;i++){
 const x=c[i],k=mode(x,i);
 if(deck){let r=deck.indexOf(x);p.push(r);certain++;counts[r]++;if(truth)assert.equal(r,truth[i]);deck.splice(r,1);deck.splice(k,0,x);continue;}
 let b=sets[x];if(truth)assert(b&(1<<truth[i]),'rank envelope omitted truth');
 if(pc(b)===1){certain++;p.push(31-Math.clz32(b));}else p.push(-1);
 sets=transition(sets,x,k);
 if(sets.every(s=>pc(s)===1)){sync=i+1;deck=Array(A);for(let y=0;y<A;y++)deck[31-Math.clz32(sets[y])]=y;}
 }
 let a=counts.slice().sort((x,y)=>y-x),n=c.length-(sync??c.length);
 return {sync,certain,n,mode:a[0],top3:a.slice(0,3).reduce((x,y)=>x+y,0),ic:n>1?counts.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)):null,preview:p.slice(sync??0,(sync??0)+80).map(x=>x<0?'?':gp.translit[x]).join(' '),p,counts};
}
function encrypt(p,mode,deck){deck=deck.slice();return p.map((r,i)=>{const x=deck[r],k=mode(x,i);deck.splice(r,1);deck.splice(k,0,x);return x;});}
let seed=3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function shuffled(){const a=Array.from({length:A},(_,i)=>i);for(let i=A-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const clear=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%').filter((_,i)=>[3,8,9,10,11,14].includes(i)).flatMap(x=>Array.from(x).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c)));
const p=clear.slice(0,729);for(const [name,mode] of Object.entries(modes)){for(let i=0;i<4;i++){const c=encrypt(p,mode,shuffled()),{p:out,counts,...r}=run(c,mode,p);console.log('native plant',name,i,r.sync,r.certain);}}
const ch=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]],cases=[];
for(const [lo,hi] of ch){const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices),o={pages:[lo,hi],N:c.length};for(const [name,mode] of Object.entries(modes)){const {p,counts,...r}=run(c,mode);o[name]=r;if(lo===40||hi===55&&lo===0)cases.push({lo,hi,name,...r});}console.log(JSON.stringify(o));}
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(let j=0;j<w.length;){const v=w.startsWith('ING',j)?{t:'ING',i:21}:w.startsWith('IO',j)?{t:'IO',i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p;}
function stats(p,{n,mode,top3}){const h=Array(29).fill(0);let minMode=Infinity,minTop3=Infinity,count=0,pass=0;for(let i=0;i<p.length;i++){h[p[i]]++;if(i>=n)h[p[i-n]]--;if(i<n-1)continue;count++;let a=0,b=0,c=0;for(let x of h){if(x>=a){c=b;b=a;a=x;}else if(x>=b){c=b;b=x;}else if(x>c)c=x;}minMode=Math.min(minMode,a);minTop3=Math.min(minTop3,a+b+c);if(a<=mode&&a+b+c<=top3)pass++;}return {n,count,minMode,minTop3,pass};}
for(const path of ['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt']){const p=native(read(path));console.log(JSON.stringify({path,results:cases.map(x=>({pages:[x.lo,x.hi],name:x.name,...stats(p,x)}))}));}
module.exports={run,transition,prune,encrypt};
