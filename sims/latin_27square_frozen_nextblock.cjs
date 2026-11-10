'use strict';
/**
 * Single-file original-source experiment: freeze the externally published
 * 27x27 LP2 route at block 38 and enumerate every legal next block.
 *
 * node sims/latin_27square_frozen_nextblock.cjs
 *
 * Source and formulas: LP2 original pages 0..2; external Reports 00..15.
 * Their rules and the 38 fitted historical blocks were chosen post hoc.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.indices.length),[262,266,201]);
assert.equal(grid.length,729);
const GP=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const tran=corpus.translit;
const at=([r,c])=>grid[(r-1)*27+c-1],mod=(x,m)=>(x%m+m)%m,n0=([r,c])=>27*(r-1)+c,n1=([r,c])=>27*(c-1)+28-r,n2=p=>730-n0(p),n3=p=>730-n1(p);
function phi(x){let y=x;for(let p=2;p<=x;p++)if(x%p===0){y-=y/p;while(x%p===0)x/=p;}return y}
function mu(x){let factors=0;for(let p=2;p*p<=x;p++){if(x%p)continue; x/=p; factors++;if(x%p===0)return 0;while(x%p===0)x/=p;}return (factors + (x>1 ? 1 : 0)) % 2 === 0 ? 1 : -1;}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @typedef {[number,number]} Point */
/** @param {Point} a @param {Point} b */
const cheb=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
/** @param {Point[]} cells */
const leftmost=cells=>cells.reduce((a,b)=>b[1]<a[1]||(b[1]===a[1]&&b[0]>a[0])?b:a);
/** @param {number} v */
const sign=v=>mu(phi(v));
/** @param {{node: Point[],cipher: Point[],phase:number,S:number,a:number}} previous */
function forecast(previous){
 const {node,cipher,phase:p,S,a}=previous;
 const [B,E]=[cipher[0],cipher[cipher.length-1]],L=leftmost(cipher),M=node[1],Z=node.reduce((u,v)=>v[0]>u[0]||(v[0]===u[0]&&v[1]>u[1])?v:u);
 const h=at(M),pmode=Math.floor(S/7)%4;
 const modePrevReflect=pmode===1||pmode===2;
 const nextPhase=mod((pmode===0||pmode===2?1:0)+cipher.reduce((s,c)=>s+mu(modePrevReflect?n2(c):n0(c)),0),3);
 const nextA=mod(a+mu(n1(L)),2);
 const signatures=[[[0,0,0],[1,1,1]],[[0,1,0],[1,-1,1]],[[0,-1,0],[1,0,1]]];
 const sig=signatures[nextPhase][nextA];
 const qaxis=mu(n2(B)+n0(M))+mu(gcd(n1(E),n2(E)));
 const cipherAxis=qaxis===0?0:qaxis>0?2:1;
 const tau=mod(mu(n3(E))+phi(h),2);
 const sourceR=mod(1+B[1]+E[0]+M[0]+mu(n2(B)),2),sourceC=mod(1+B[0]+E[0]+M[0],2);
 const endR=mod(1+p+mu(n2(M)),2),leftR=mod(sourceR+1+p+mu(M[0]),2);
 const centerMode=p===0?n2(M):p===1?n3(M):n0(M);
 const leftC=mod(B[0]+cipher.reduce((s,c)=>s+mu(n1(c)),0)+(at(node[0])===at(node[2])?1:0)+mu(centerMode),2);
 const qr=mu(n0(E))===0&&mu(n3(E))===0?1:0,zr=mu(n0(B))===0&&mu(n1(B))===0?1:0;
 const ray=qr*(1-zr),mirror=cheb(Z,L)%3!==2;
 const xx=n1(M)+n2(Z), yy=n1(L)+n2(Z), bit=+( (mu(xx)<0)===(mu(yy)<0));
 const sum=GP[at(node[0])]+GP[at(M)]+GP[at(node[2])];
 const diagonal= +(mu(gcd(n1(M),n3(Z)))<0)^ +(mu(sum)>0)^ +(mu(n0(M)+n3(Z))!==0);
 const nodeAxis=2*bit+diagonal;
 const radius=mod(M[0]+M[1]+B[0]+B[1],2)^ +(mu(gcd(n2(Z),n2(L)))<0)^ +(mu(n1(B)+n1(E))>0);
 return {nextPhase,nextA,sig,cipherAxis,tau,sourceR,sourceC,endR,leftR,leftC,ray,mirror,nodeAxis,radius,prevL:L,nextS:S+nextPhase,nextMode:Math.floor((S+nextPhase)/7)%4};
}
/** @param {Point} p @param {number} axis @param {number} t */
function pointAlong(p,axis,t){return axis===0?[p[0],p[1]+t]:axis===1?[p[0]+t,p[1]+t]:axis===2?[p[0]+t,p[1]]:[p[0]+t,p[1]-t];}
/** @param {Point} p */
const inside=p=>p[0]>=1&&p[0]<=27&&p[1]>=1&&p[1]<=27;
/** @param {ReturnType<typeof forecast>} expected */
function enumerate(expected){
 const sourceNodes=[];
 for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
  if(r%2!==expected.sourceR||c%2!==expected.sourceC)continue;
  for(let radius=1;radius<=13;radius++){
   if(radius%2!==expected.radius)continue;
   const M=[r,c];
   const outer1=pointAlong(M,expected.nodeAxis,-radius),outer2=pointAlong(M,expected.nodeAxis,radius);
   if(!inside(outer1)||!inside(outer2))continue;
   const original=[at(outer1),at(M),at(outer2)];
   if(original.some(v=>v===0))continue;
   if((original[0]===original[2])!==expected.mirror)continue;
   for(const trans of [false,true]){
    const values=[original[0],trans?phi(original[1]):original[1],original[2]];
    if(values.some(v=>v===0))continue;
    if(values.map(sign).join(',')!==expected.sig.join(','))continue;
    for(const reverse of [false,true]){
     const derived=reverse?values.slice().reverse():values;
     const phase=expected.nextPhase;
     const key=[...derived.slice(phase),...derived.slice(0,phase)];
     sourceNodes.push({node:[outer1,M,outer2],original,transform:trans,reverse,key,radius});
    }
   }
  }
 }
 const cipherLines=[];
 for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
  const start=[r,c];
  if(c%2!==expected.leftC)continue;
  const dr=Math.abs(r-expected.prevL[0]),dc=Math.abs(c-expected.prevL[1]);
  const d8=Math.min(dr,dc,Math.abs(dr-dc));
  if(d8!==expected.ray)continue;
  for(const axis of expected.cipherAxis===1?[1,3]:[expected.cipherAxis]){
   for(const sign of [-1,1])for(let len=2;len<=27;len++){
    const cells=Array.from({length:len},(_,i)=>pointAlong(start,axis,sign*i));
    const end=cells[cells.length-1];
    if(!inside(end))break;
    const l=leftmost(cells);
    if((+ (start[0]===l[0]&&start[1]===l[1]))!==expected.tau)continue;
    if(l[0]%2!==expected.leftR||l[1]%2!==expected.leftC||end[0]%2!==expected.endR)continue;
    const mu90=mu(n1(l));
    if((expected.nextMode===0||expected.nextMode===3)?mu90<0:mu90>0)continue;
    cipherLines.push({cells,len,axis,sign,start,end,left:l});
   }
  }
 }
 const candidates=[];
 for(const s of sourceNodes)for(const C of cipherLines){
  const m=s.node[1],b=C.start,l=C.left,e=C.end;
  if(mu(gcd(n0(m),n0(b)))===0||mu(gcd(n0(m),n0(l)))===0||mu(gcd(n1(m),n3(e)))===0||mu(gcd(n0(m),n2(e)))===0)continue;
  const plain=C.cells.map((cell,i)=>mod(at(cell)-s.key[i%3],29));
  plain.forEach((v,i)=>assert.equal(mod(v+s.key[i%3],29),at(C.cells[i])));
  candidates.push({plain:plain.map(v=>tran[v]).join(''),plainIdx:plain,source:s,cipher:{start:C.start,end:C.end,len:C.len,axis:C.axis,sign:C.sign}});
 }
 return {sourceNodes,cipherLines,candidates};
}
const p37={node:[[4,14],[6,16],[8,18]],cipher:[[22,2],[22,1]],phase:2,S:32,a:1};
const p38={node:[[11,13],[12,13],[13,13]],cipher:[[5,17],[6,17],[7,17],[8,17]],phase:0,S:32,a:0};
const from37=forecast(p37), regression=enumerate(from37);
assert.equal(from37.nextPhase,0);
assert.equal(regression.candidates.length,21342);
const matched=regression.candidates.filter(x=>x.plain==='IASC' &&
  JSON.stringify(x.source.node)===JSON.stringify(p38.node) &&
  JSON.stringify(x.cipher.start)==='[5,17]' &&
  JSON.stringify(x.cipher.end)==='[8,17]' &&
  !x.source.transform && !x.source.reverse);
assert.equal(matched.length,1);
assert.deepEqual(matched[0].source.key,[16,19,28]);
const f=forecast(p38),result=enumerate(f);
assert.equal(f.nextPhase,1);
assert.deepEqual(f.sig,[0,1,0]);
assert.equal(result.candidates.length,21818);
const byLength={};
for(const item of result.candidates)
  byLength[item.cipher.len]=(byLength[item.cipher.len]||0)+1;
console.log(JSON.stringify({
  status:'Original ciphertext fully re-enciphered, no authenticated plaintext',
  input:{physicalPages:[0,1,2],pageLengths:[262,266,201],gridWidth:27},
  regression37To38:{sourceConfigurations:regression.sourceNodes.length,
    cipherTrajectories:regression.cipherLines.length,
    allCandidates:regression.candidates.length,onePublishedIAskReconstructed:matched.length},
  forecast38To39:f,
  continuation38To39:{sourceConfigurations:result.sourceNodes.length,
    cipherTrajectories:result.cipherLines.length,
    allCandidates:result.candidates.length,byLength},
  interpretation:'All 21,818 source and trajectory choices satisfy the frozen rules; the rules alone cannot locate or recover one unique next block.'
},null,2));
