'use strict';
// Sound joint rank + pair-order synchronizer for public remove/reinsert clocks.
// A worked, source-derived p15 numerical clock is a bounded, HYPOTHETICAL
// recipient. No Cicada instruction selects this opcode or the period-16 reset.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const A=29,FULL=(1<<A)-1;
const printedGrid=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
const spiral=[[1,1],[1,2],[2,2],[2,1],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0]];
const numbers=spiral.map(([r,c])=>printedGrid[r][c]);
assert.deepEqual(numbers,[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const clock=numbers.map(n=>n%A);
const pc=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24;};
const lo=x=>31-Math.clz32(x&-x),hi=x=>31-Math.clz32(x);
const bands=Array.from({length:A},(_,l)=>Array.from({length:A},(_,h)=>{let m=0;for(let i=l;i<=h;i++)m|=1<<i;return m;}));

// Hall-consistent rank envelopes: retain only edges of some perfect matching.
// This is still an over-approximation of reachable deck states.
function hall(s){
 const match=new Int8Array(A).fill(-1);let seen=0;
 function augment(y){
  for(let b=s[y]&~seen;b;b&=b-1){
   const q=b&-b,r=31-Math.clz32(q);
   if(seen&q)continue;seen|=q;
   if(match[r]<0||augment(match[r])){match[r]=y;return true;}
  }return false;
 }
 const order=Array.from({length:A},(_,i)=>i).sort((a,b)=>pc(s[a])-pc(s[b]));
 for(const y of order){seen=0;assert(augment(y),'invalid rank perfect matching');}
 const graph=s.map(mask=>{let edges=0;for(let b=mask;b;b&=b-1)edges|=1<<match[lo(b&-b)];return edges;});
 for(let z=0;z<A;z++)for(let y=0;y<A;y++)if(graph[y]&(1<<z))graph[y]|=graph[z];
 return s.map((mask,y)=>{
  let keep=0;
  for(let b=mask;b;b&=b-1){const q=b&-b,r=lo(q);if(graph[match[r]]&(1<<y))keep|=q;}
  assert(keep);return keep;
 });
}

// Move the publicly observed ciphertext card x to the PUBLIC target rank k.
function moveRankSets(s,x,k){
 const first=lo(s[x]),last=hi(s[x]);
 const uptoFirst=(1<<(first+1))-1,belowLast=(1<<last)-1,belowTarget=(1<<k)-1;
 return hall(s.map((mask,y)=>{
  if(y===x)return 1<<k;
  const afterDelete=((mask&~uptoFirst)>>>1)|(mask&belowLast);
  return(afterDelete&belowTarget)|((afterDelete&~belowTarget)<<1);
 }));
}

// rel[y] contains labels CERTAIN to occur after y in all surviving decks.
// When x moves, all pairwise precedence among OTHER labels is unchanged.
// Intersect rank envelopes with proven positional precedence and vice versa.
function jointClosure(s,rel){
 for(let pass=0;pass<20;pass++){
  let change=false;
  for(let z=0;z<A;z++)for(let y=0;y<A;y++)if(rel[y]&(1<<z)){
   const v=rel[y]|rel[z];if(v!==rel[y]){rel[y]=v;change=true;}
  }
  for(let y=0;y<A;y++){
   let mustBefore=0;
   for(let z=0;z<A;z++)if(rel[z]&(1<<y))mustBefore++;
   const mustAfter=pc(rel[y]);
   const revised=s[y]&bands[mustBefore][A-1-mustAfter];
   assert(revised,'contradictory rank bounds');
   if(revised!==s[y]){s[y]=revised;change=true;}
  }
  for(let y=0;y<A;y++)for(let z=0;z<A;z++){
   if(y!==z&&hi(s[y])<lo(s[z])&&!(rel[y]&(1<<z))){rel[y]|=1<<z;change=true;}
  }
  const revised=hall(s);
  for(let y=0;y<A;y++)if(revised[y]!==s[y]){s[y]=revised[y];change=true;}
  for(let y=0;y<A;y++)assert(!(rel[y]&(1<<y)),'precedence cycle');
  if(!change)return;
 }
 throw Error('closure iteration budget exceeded');
}
function forward(plain,targets,deck){
 deck=deck.slice();
 return plain.map((rank,i)=>{
  const x=deck[rank],old=rank;
  deck.splice(old,1);deck.splice(targets[i%targets.length],0,x);
  return x;
 });
}
function maxCounts(h){
 let a=0,b=0,c=0;
 for(const v of h){if(v>=a){c=b;b=a;a=v;}else if(v>=b){c=b;b=v;}else if(v>c)c=v;}
 return{mode:a,top3:a+b+c};
}
function inverse(c,targets,plant){
 let s=Array(A).fill(FULL),rel=Array(A).fill(0),deck=null,sync=null;
 let actual=plant?plant.initial.slice():null;
 const decoded=[],rankCertainBeforeSync=[];
 for(let i=0;i<c.length;i++){
  const x=c[i],k=targets[i%targets.length];
  if(deck){
   const rank=deck.indexOf(x);
   assert(rank>=0);
   decoded.push(rank);
   if(plant)assert.equal(rank,plant.plain[i],'wrong exact planted rank');
   deck.splice(rank,1);deck.splice(k,0,x);
   if(actual){const idx=actual.indexOf(x);actual.splice(idx,1);actual.splice(k,0,x);assert.deepEqual(deck,actual);}
   continue;
  }
  if(actual){
   assert(s[x]&(1<<actual.indexOf(x)),'rank bound excluded actual card');
   assert.equal(actual.indexOf(x),plant.plain[i],'planted sender inverse mismatch');
   for(let y=0;y<A;y++)for(let z=0;z<A;z++)if(rel[y]&(1<<z))
    assert(actual.indexOf(y)<actual.indexOf(z),'pair relation excluded actual deck');
  }
  if(pc(s[x])===1)rankCertainBeforeSync.push(i);
  decoded.push(-1); // suffix is exact only AFTER the certified sync boundary
  s=moveRankSets(s,x,k);
  for(let y=0;y<A;y++)rel[y]&=~(1<<x);
  rel[x]=0;
  // Newly certain order relations between x and other cards at this target.
  for(let y=0;y<A;y++)if(y!==x){
   if(hi(s[y])<k)rel[y]|=1<<x;
   if(lo(s[y])>k)rel[x]|=1<<y;
  }
  jointClosure(s,rel);
  if(actual){
   const old=actual.indexOf(x);actual.splice(old,1);actual.splice(k,0,x);
   for(let y=0;y<A;y++){
    assert(s[y]&(1<<actual.indexOf(y)),'rank set excluded true post-update position');
    for(let z=0;z<A;z++)if(rel[y]&(1<<z))
     assert(actual.indexOf(y)<actual.indexOf(z),'post-update relation excluded actual order');
   }
  }
  if(s.every(mask=>pc(mask)===1)){
   sync=i+1;
   deck=Array(A);
   for(let y=0;y<A;y++)deck[lo(s[y])]=y;
   if(actual)assert.deepEqual(deck,actual,'certified sync deck disagrees with planted sender');
  }
 }
 const h=Array(A).fill(0),n=c.length-(sync??c.length);
 for(let i=sync??c.length;i<c.length;i++)h[decoded[i]]++;
 const summary=maxCounts(h);
 return{sync,n,rankCertainBeforeSync:rankCertainBeforeSync.length,
   mode:summary.mode,top3:summary.top3,
   ic:n>1?h.reduce((sum,v)=>sum+v*(v-1),0)/(n*(n-1)):null,
   preview:decoded.slice(sync??c.length,(sync??c.length)+32).map(i=>gp.translit[i]).join(' '),
   hist:h,decoded};
}
function native(t){
 const start=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const end=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const out=[];
 for(const w0 of t.slice(start?start.index+start[0].length:0,end?end.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){
  const w=w0.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  for(let j=0;j<w.length;){
   const v=w.startsWith('ING',j)?{t:'ING',i:21}:w.startsWith('IO',j)?{t:'IO',i:27}:tokens.find(z=>w.startsWith(z.t,j));
   assert(v,'cannot tokenize '+w.slice(j));out.push(v.i);j+=v.t.length;
  }
 }
 return out;
}
function windows(p,scope){
 const n=scope.n;
 assert(n>0&&n<=p.length,'no eligible donor windows');
 const h=new Int32Array(A);let pass=0,minMode=Infinity,minTop3=Infinity;
 for(let i=0;i<p.length;i++){
  h[p[i]]++;if(i>=n)h[p[i-n]]--;
  if(i+1<n)continue;
  const v=maxCounts(h);
  minMode=Math.min(minMode,v.mode);minTop3=Math.min(minTop3,v.top3);
  if(v.mode<=scope.mode&&v.top3<=scope.top3)pass++;
 }
 return {windows:p.length-n+1,pass,minMode,minTop3};
}
function shuffle(seed){
 let s=seed>>>0;
 function rnd(){s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;}
 const a=Array.from({length:A},(_,i)=>i);
 for(let i=A-1;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 return a;
}
function main(){
 assert.equal(gp.pages.filter(p=>p.page<=55).reduce((a,p)=>a+p.indices.length,0),12956);
 const lp1=read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%')
  .filter((_,i)=>[3,8,9,10,11,14].includes(i))
  .flatMap(t=>Array.from(t).filter(c=>gp.runes.includes(c)).map(c=>gp.runes.indexOf(c)));
 assert.equal(lp1.length,1001);
 const plants=[];
 for(let j=0;j<4;j++){
  const plain=lp1.slice(),start=shuffle(3301+j*777),cipher=forward(plain,clock,start);
  const inv=inverse(cipher,clock,{plain,initial:start});
  assert(inv.sync!==null,'plant not synchronized');
  for(let i=inv.sync;i<plain.length;i++)assert.equal(inv.decoded[i],plain[i]);
  plants.push({trial:j,source:'LP1 native GP',N:plain.length,sync:inv.sync,exactRecovered:inv.n});
 }
 const donors=[
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
 ].map(file=>({file,plain:native(read(file))}));
 const results=[];
 for(const [lo,hi] of [[16,22],[40,53],[0,55]]){
  const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices),d=inverse(c,clock);
  assert(d.sync!==null);
  results.push({pages:[lo,hi],N:c.length,sync:d.sync,n:d.n,
   certainBeforeSync:d.rankCertainBeforeSync,mode:d.mode,top3:d.top3,ic:d.ic,
   preview:d.preview,donors:donors.map(donor=>({file:donor.file,...windows(donor.plain,d)}))});
 }
 console.log(JSON.stringify({schema:'lp2-joint-rank-pair-sync-v1',
  claim:'sound all-initial-deck joint-order certificate; p15 clock/opcode hypothetical',
  printedGrid,spiral,numbers,clock,plants,results},null,2));
}
if(require.main===module)main();
module.exports={inverse,forward,hall,moveRankSets,jointClosure,native,windows,clock};
