'use strict';
// A historical 2014 message.txt.asc whitespace run lists
// 2,3,5,7,11,13,17,23,29,31,37. Its OEIS A194954 continuation is
// independently specified; interpreting it as remove/reinsert ranks is NOT
// an authenticated Cicada cipher instruction.
// Tested hypothesis: after emitting C_i, delete it from a secret 29-label deck
// and reinsert at (A194954(i+1)-1) mod 29, one advance per original rune.
// Uses a sound all-deck rank envelope, then exact synchronization and suffix.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json')), A=29,FULL=(1<<29)-1;
function prime(n){if(n<2)return false;if(n%2===0)return n===2;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true;}
function pc(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24;}
function a194954(n){const a=[2];for(let i=2;i<=n;i++){const gap=pc(i-1);let x=a.at(-1)+1;for(;!prime(x)||(x-a.at(-1))%gap!==0;x++);a.push(x);}return a;}
const values=a194954(12956), expected=[2,3,5,7,11,13,17,23,29,31,37,43,47,53,59,67,71,73,79,97,101,107];
assert.deepEqual(values.slice(0,22),expected);
const clock=(_,i)=>(values[i]-1)%29;
function prune(sets){
 const match=new Int8Array(A).fill(-1);let seen=0;
 function aug(i){for(let b=sets[i]&~seen;b;b&=b-1){const q=b&-b;if(seen&q)continue;const r=31-Math.clz32(q);seen|=q;if(match[r]<0||aug(match[r])){match[r]=i;return true;}}return false;}
 const order=Array.from({length:A},(_,i)=>i).sort((i,j)=>pc(sets[i])-pc(sets[j]));
 for(const i of order){seen=0;assert(aug(i),'no matching');}
 const graph=sets.map(s=>{let g=0;for(let b=s;b;b&=b-1)g|=1<<match[31-Math.clz32(b&-b)];return g;});
 for(let j=0;j<A;j++)for(let i=0;i<A;i++)if(graph[i]&(1<<j))graph[i]|=graph[j];
 return sets.map((s,i)=>{let g=0;for(let b=s;b;b&=b-1){const q=b&-b,r=31-Math.clz32(q);if(graph[match[r]]&(1<<i))g|=q;}return g;});
}
function transition(sets,x,k){
 const lo=31-Math.clz32(sets[x]&-sets[x]),hi=31-Math.clz32(sets[x]);
 const lm=(1<<(lo+1))-1,hm=(1<<hi)-1,im=(1<<k)-1;
 return prune(sets.map((v,y)=>{if(y===x)return 1<<k;const d=((v&~lm)>>>1)|(v&hm);return(d&im)|((d&~im)<<1);}));
}
function inverse(c,truth){
 let sets=Array(A).fill(FULL),deck=null,sync=null,certain=0,out=[],h=Array(A).fill(0);
 for(let i=0;i<c.length;i++){
  const x=c[i],k=clock(x,i);
  if(deck){
   const r=deck.indexOf(x);out.push(r);h[r]++;
   if(truth)assert.equal(r,truth[i]);
   deck.splice(r,1);deck.splice(k,0,x);continue;
  }
  const b=sets[x];if(truth)assert(b&(1<<truth[i]),'rank envelope omitted true rank');
  if(pc(b)===1){out.push(31-Math.clz32(b));certain++;}else out.push(-1);
  sets=transition(sets,x,k);
  if(sets.every(s=>pc(s)===1)){sync=i+1;deck=Array(A);for(let y=0;y<A;y++)deck[31-Math.clz32(sets[y])]=y;}
 }
 const n=c.length-(sync??c.length),top=h.slice().sort((a,b)=>b-a);
 return {sync,certain,n,mode:top[0],top3:top[0]+top[1]+top[2],ic:n>1?h.reduce((a,v)=>a+v*(v-1),0)/(n*(n-1)):null,preview:out.slice(sync??c.length,(sync??c.length)+60).map(x=>gp.translit[x]).join(' '),counts:h};
}
function encrypt(p,initial){
 const deck=initial.slice();return p.map((r,i)=>{const x=deck[r];deck.splice(r,1);deck.splice(clock(x,i),0,x);return x;});
}
const tokenList=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){
 const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const out=[];
 for(const word0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){
  const w=word0.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  for(let j=0;j<w.length;){const q=w.startsWith('ING',j)?{t:'ING',i:21}:w.startsWith('IO',j)?{t:'IO',i:27}:tokenList.find(z=>w.startsWith(z.t,j));
   assert(q,'unknown GP token');out.push(q.i);j+=q.t.length;}
 }
 return out;
}
function donorStats(p,x){
 const h=Array(A).fill(0);let windows=0,minMode=Infinity,minTop3=Infinity,pass=0;
 for(let i=0;i<p.length;i++){h[p[i]]++;if(i>=x.n)h[p[i-x.n]]--;if(i<x.n-1)continue;windows++;
  let a=0,b=0,c=0;for(const v of h){if(v>=a){c=b;b=a;a=v;}else if(v>=b){c=b;b=v;}else if(v>c)c=v;}
  minMode=Math.min(minMode,a);minTop3=Math.min(minTop3,a+b+c);
  if(a<=x.mode&&a+b+c<=x.top3)pass++;
 }
 return {windows,minMode,minTop3,pass};
}
const scopes=[[0,2],[0,55],[40,53],[8,14],[15,22],[54,55]],cases=scopes.map(([lo,hi])=>{
 const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);
 return {scope:[lo,hi],runes:c.length,...inverse(c)};
});
const known=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%').filter((_,i)=>[3,8,9,10,11,14].includes(i)).flatMap(t=>Array.from(t).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c))).slice(0,729);
const plants=[];
let seed=3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
for(let i=0;i<4;i++){const deck=Array.from({length:A},(_,j)=>j);for(let j=A-1;j>0;j--){const k=rng()%(j+1);[deck[j],deck[k]]=[deck[k],deck[j]];}
 const c=encrypt(known,deck),r=inverse(c,known);
 plants.push({index:i,sync:r.sync,certain:r.certain,exactSuffix:r.sync!==null&&r.n===known.length-r.sync});
}
const donors=['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt'].map(src=>{
 const p=native(read(src));return {source:src,length:p.length,scopes:cases.filter(x=>x.n>=300).map(x=>({scope:x.scope,...donorStats(p,x)}))};
});
console.log(JSON.stringify({hypothesis:'A194954(i+1)-1 mod29, moving insertion, continuous runes; no authenticated opcode',first22:values.slice(0,22),last:values.at(-1),cases,plants,donors},null,2));
