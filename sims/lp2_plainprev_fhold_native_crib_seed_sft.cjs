'use strict';
/** Exact native crib-to-partial-key and seeded prefix inversion, GP29.
 * Original windows remain inside one physical page and source record.
 * A prefix witness is necessary, never sufficient for whole-page legality.
 */
function run(gp,native){
 const A=29,mod=x=>(x+58)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const alphabet=gp.runes;
 assert(alphabet.join()===native.runes.join(),"alphabet");
 const records=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(c=>alphabet.indexOf(c)).filter(x=>x>=0)}));
 const original=gp.pages.filter(x=>x.page<=55&&x.indices.length).map(x=>({page:x.page,c:x.indices}));
 assert(original.length===55&&original.reduce((s,x)=>s+x.c.length-1,0)===12901,"geometry");
 const MIN=16,CAP=64;
 const key=new Int8Array(A),inv=new Int8Array(A);
 function match(P,j,C,i,limit){
  key.fill(-1);inv.fill(-1);let q=i===1?0:-1;
  for(let n=0;n<limit;n++){
   const p=P[j+n],c=C[i+n];
   if(p===0){if(c!==0)return n;continue;}
   if(q>=0){
    const k=mod(p-c+C[i+n-1]);
    if((key[q]>=0&&key[q]!==k)||(inv[k]>=0&&inv[k]!==q))return n;
    key[q]=k;inv[k]=q;
   }
   q=p;
  }
  return limit;
 }
 function prefixes(pages,m){
  return pages.map(({c})=>{let d=[];for(let i=1;i<c.length&&c[i]!==0;i++)d.push((c[i]-c[i-1]+m)%m);return d;}).filter(d=>d.length);
 }
 function initialDomain(pref,m){
  return Array.from({length:m},(_,k)=>k).filter(k=>pref.every(d=>(d[0]+k)%m!==0));
 }
 // Exact seeded deterministic-prefix DFS. Unknown rows are assigned only
 // when a reachable prefix requires them. One fixed shared permutation.
 // A frontier stores each unfinished prefix's next delta and state.
 // Empty frontier is a witness to all zero-free INITIAL prefixes only.
 function solve(pref,seed,m,cap){
  const K=Int8Array.from(seed),mask=(1<<m)-1;let used=0,nodes=0,dead=0,capped=false,witness=null;
  for(const k of K)if(k>=0){if(used&(1<<k))return {status:"UNSAT",nodes,dead};used|=1<<k;}
  function advance(f){
   let {p,i,q}=f;const d=pref[p];
   while(i<d.length&&K[q]>=0){
    q=(d[i++]+K[q])%m;if(q===0)return false;
   }
   return i===d.length?null:{p,i,q};
  }
  let initial=[];
  for(let p=0;p<pref.length;p++){
   const f=advance({p,i:0,q:0});if(f===false)return {status:"UNSAT",nodes,dead:1};if(f)initial.push(f);
  }
  function dfs(front,used){
   if(!front.length){witness=Array.from(K);return true;}
   if(nodes>=cap){capped=true;return false;}nodes++;
   const dom=new Int32Array(m).fill(mask&~used),cnt=new Int32Array(m);
   for(const {p,i,q} of front){dom[q]&=~(1<<((m-pref[p][i])%m));cnt[q]++;}
   let row=-1,best=100,weight=-1;
   for(let q=0;q<m;q++)if(cnt[q]){
    let x=dom[q],n=0;while(x){x&=x-1;n++;}
    if(!n){dead++;return false;}
    if(n<best||(n===best&&cnt[q]>weight)){best=n;weight=cnt[q];row=q;}
   }
   for(let x=dom[row];x;){
    const bit=x&-x,k=31-Math.clz32(bit);x^=bit;K[row]=k;
    let next=[],bad=false;
    for(const f of front){const y=f.q===row?advance(f):f;if(y===false){bad=true;break;}if(y)next.push(y);}
    if(!bad&&dfs(next,used|bit)){K[row]=-1;return true;}
    if(bad)dead++;
    K[row]=-1;if(capped)return false;
   }
   return false;
  }
  const sat=dfs(initial,used);
  return {status:sat?"SAT":capped?"UNKNOWN":"UNSAT",nodes,dead,witness};
 }
 function scan(pages,donors,min=MIN){
  const hist=Array(CAP+1).fill(0),hits=[];let pairs=0,longest=0;
  for(const {page,c} of pages)for(let i=1;i+min<=c.length;i++){
   for(const {name,p} of donors)for(let j=0;j+min<=p.length;j++){
    const limit=Math.min(CAP,c.length-i,p.length-j);
    const n=match(p,j,c,i,limit);pairs++;hist[n]++;longest=Math.max(longest,n);
    // IMPORTANT: freeze exactly 16 fit symbols. A longer accidental
    // match must not impose extra rows on a shorter candidate.
    if(n>=min){assert(match(p,j,c,i,min)===min,"refix");hits.push({page,i,name,j,n,rows:Array.from(key)});}
   }
  }
  return {pairs,longest,hist,hits};
 }
 let rng=314342;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
 function perm(m){const p=Array.from({length:m},(_,i)=>i);for(let i=m-1;i>0;i--){const j=rand(i+1);[p[i],p[j]]=[p[j],p[i]];}return p;}
 function encode(P,K,iv,m){let q=0,c=[iv];for(const p of P){c.push(p===0?0:(c.at(-1)+p-K[q]+m)%m);if(p)q=p;}return c;}
 function checkKey(pref,K,m){return pref.every(d=>{let q=0;for(const x of d){q=(x+K[q])%m;if(!q)return false;}return true;});}
 // Complete enumeration, both random feasible and infeasible seeded instances.
 function brute(pref,seed,m){
  const K=Array.from(seed),u=new Set(K.filter(x=>x>=0));
  function rec(q){if(q===m)return checkKey(pref,K,m);if(K[q]>=0)return rec(q+1);for(let k=0;k<m;k++)if(!u.has(k)){K[q]=k;u.add(k);if(rec(q+1))return true;u.delete(k);K[q]=-1;}return false;}
  return rec(0);
 }
 let small={SAT:0,UNSAT:0};
 for(let m=3;m<=7;m++)for(let t=0;t<40;t++){
  const K=perm(m),seed=K.map(k=>rand(3)===0?k:-1),pref=[];
  for(let f=0;f<1+rand(5);f++)pref.push(Array.from({length:1+rand(12)},()=>rand(m)));
  if(t%2===0){pref.length=0;for(let f=0;f<4;f++){let q=0,d=[];for(let i=0;i<8;i++){let p=1+rand(m-1);d.push((p-K[q]+m)%m);q=p;}pref.push(d);}}
  const b=brute(pref,seed,m),s=solve(pref,seed,m,1e6);assert(s.status===(b?"SAT":"UNSAT"),"reduced exact disagreement");small[s.status]++;
 }
 // Hidden native plant crib and unfit continuation; use independent
 // random keys, actual donor records and only 16/24/32 known symbols.
 const controls=[];
 for(let t=0;t<3;t++){
  const rec=records[t+1],P=rec.p.slice(3,Math.min(183,rec.p.length)),K=perm(A);
  const C=encode(P,K,17+t,A),i=9+t*3,j=3+i-1,L=[16,24,32][t];
  assert(match(rec.p,j,C,i,L)===L,"planted crib");
  const learned=Array.from(key);
  assert(learned.every((k,q)=>k<0||k===K[q]),"true rows");
  learned[0]=K[0];const pref=prefixes([{c:C}],A),s=solve(pref,learned,A,50000);
  assert(s.status==="SAT"||s.status==="UNKNOWN","planted seed rejected");
  let q=P.slice(0,i+L-1).filter(x=>x!==0).at(-1),pred=0;
  for(let x=i+L;x<C.length&&C[x]!==0&&learned[q]>=0;x++){q=mod(C[x]-C[x-1]+learned[q]);assert(q===P[x-1],"withheld prediction");pred++;}
  const blind=scan([{page:t,c:C}],records);
  assert(blind.hits.some(h=>h.i===i&&h.j===j&&h.name===rec.name&&h.n>=L),"blind retrieval");
  controls.push({name:rec.name,fit:L,rows:learned.filter(x=>x>=0).length,pred,seeded:s.status,nodes:s.nodes,blindPairs:blind.pairs,blindLongest:blind.longest,blindHits:blind.hits.length});
 }
 const result=scan(original,records),pref=prefixes(original,A),init=initialDomain(pref,A);
 const domains={UNSAT:0,SAT:0,UNKNOWN:0},candidates={UNSAT:0,SAT:0,UNKNOWN:0};
 let calls=0,nodes=0;
 for(const h of result.hits){
  h.domains=[];
  for(const k0 of init){
   const seed=h.rows.slice();
   if(seed[0]>=0&&seed[0]!==k0||seed.some((k,q)=>q!==0&&k===k0))continue;
   seed[0]=k0;const s=solve(pref,seed,A,20000);calls++;nodes+=s.nodes;domains[s.status]++;
   h.domains.push({k0,...s});
  }
  const status=h.domains.some(x=>x.status==="SAT")?"SAT":h.domains.some(x=>x.status==="UNKNOWN")?"UNKNOWN":"UNSAT";
  h.status=status;candidates[status]++;
 }
 return {records:records.map(x=>({name:x.name,n:x.p.length})),min:MIN,cap:CAP,small,controls,initial:init,zeroFreePrefixRunes:pref.reduce((a,p)=>a+p.length,0),calls,nodes,domains,candidates,...result};
}
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
}
