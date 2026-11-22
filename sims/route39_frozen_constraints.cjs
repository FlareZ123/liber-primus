'use strict';
/**
 * Forecast and enumerate an independently published proposed LP2 27x27 route
 * after its block 38. This is a *conditional* test of a speculative reading,
 * never authentication of the proposed source/plaintext.
 *
 * Usage: node sims/route39_frozen_constraints.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./word_partition_invariant.cjs');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const base=data.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(base.length,729);
const GP=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const names=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IO','EA'];
const n0=([r,c])=>27*(r-1)+c,n1=([r,c])=>27*(c-1)+28-r,n2=cell=>730-n0(cell),n3=cell=>730-n1(cell);
const glyph=(grid,cell)=>grid[n0(cell)-1];
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function phi(n){
  assert(n>=1&&Number.isInteger(n));
  let result=n;
  for(let k=2;k*k<=n;k++)if(n%k===0){while(n%k===0)n/=k;result-=Math.floor(result/k);}
  if(n>1)result-=Math.floor(result/n);
  return result;
}
function mu(n){
  assert(n>=1&&Number.isInteger(n));
  let sign=1;
  for(let k=2;k*k<=n;k++)if(n%k===0){let power=0;while(n%k===0){n/=k;power++}if(power>1)return 0;sign=-sign;}
  if(n>1)sign=-sign;
  return sign;
}
const mod=(x,n)=>((x%n)+n)%n;
const last={
  cells:[[5,17],[6,17],[7,17],[8,17]],
  node:[[11,13],[12,13],[13,13]],phase:0,S:32,outer:0
};
const B=last.cells[0],E=last.cells.at(-1),M=last.node[1],Z=last.node.at(-1),L=E;
assert.deepEqual(last.node.map(c=>glyph(base,c)),[16,19,28]);
assert.deepEqual(last.cells.map(c=>glyph(base,c)),[26,14,14,21]);
/** Derive every next-step prediction from frozen last-block geometry. */
function forecast(){
  const q=Math.floor(last.S/7)%4,reflected=q===1||q===2,offset=q===0||q===2?1:0;
  const phase=mod(offset+last.cells.reduce((s,cell)=>s+mu(reflected?n2(cell):n0(cell)),0),3);
  const outer=mod(last.outer+mu(n1(L)),2),signature=({0:[[0,0,0],[1,1,1]],1:[[0,1,0],[1,-1,1]],2:[[0,-1,0],[1,0,1]]})[phase][outer];
  const S=last.S+phase;
  const axisScore=mu(n2(B)+n0(M))+mu(gcd(n1(E),n2(E)));
  const axis=axisScore===0?'horizontal':axisScore>0?'vertical':'diagonal';
  const tau=mod(mu(n3(E))+phi(glyph(base,M)),2);
  const sourceCenter=[mod(1+B[1]+E[0]+M[0]+mu(n2(B)),2),mod(1+B[0]+E[0]+M[0],2)];
  const endpointRow=mod(1+last.phase+mu(n2(M)),2);
  const leftmostRow=mod(sourceCenter[0]+1+last.phase+mu(M[0]),2);
  const rayQ=+(mu(n0(E))===0&&mu(n3(E))===0),rayZ=+(mu(n0(B))===0&&mu(n1(B))===0);
  const ray=rayQ*(1-rayZ);
  const mirror=+(Math.max(Math.abs(Z[0]-L[0]),Math.abs(Z[1]-L[1]))%3!==2);
  const leftmostCol=mod(B[0]+last.cells.reduce((s,cell)=>s+mu(n1(cell)),0)+mu(n2(M)),2);
  const XX=n1(M)+n2(Z),YY=n1(L)+n2(Z);
  const axisB=+((mu(XX)<0)===(mu(YY)<0)),T=last.node.reduce((s,c)=>s+GP[glyph(base,c)],0);
  const axisD=+(mu(gcd(n1(M),n3(Z)))<0)^+(mu(T)>0)^+(mu(n0(M)+n3(Z))!==0);
  const sourceAxis=2*axisB+axisD;
  const radiusParity=mod(M[0]+M[1]+B[0]+B[1],2)^+(mu(gcd(n2(Z),n2(L)))<0)^+(mu(n1(B)+n1(E))>0);
  assert(phase!==2||last.S%7!==6);
  return {phase,signature,outer,S,axis,tau,sourceCenter,endpointRow,leftmostRow,leftmostCol,
    ray,mirror,sourceAxis,radiusParity,reflected:[1,2].includes(Math.floor(S/7)%4)};
}
const forecast39=forecast();
assert.deepEqual(forecast39,{phase:1,signature:[0,1,0],outer:0,S:33,axis:'diagonal',tau:1,
  sourceCenter:[0,0],endpointRow:1,leftmostRow:1,leftmostCol:0,
  ray:0,mirror:0,sourceAxis:0,radiusParity:0,reflected:false});
function sourceKeys(grid){
  const keys=[];
  for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
    if(mod(r,2)!==forecast39.sourceCenter[0]||mod(c,2)!==forecast39.sourceCenter[1])continue;
    for(let rad=1;rad<=13;rad++){
      if(rad%2!==forecast39.radiusParity)continue;
      let delta;
      switch(forecast39.sourceAxis){
        case 0:delta=[0,rad];break;
        case 1:delta=[rad,rad];break;
        case 2:delta=[rad,0];break;
        case 3:delta=[rad,-rad];break;
      }
      const l=[r-delta[0],c-delta[1]],m=[r,c],right=[r+delta[0],c+delta[1]];
      if([l,right].some(v=>v[0]<1||v[0]>27||v[1]<1||v[1]>27))continue;
      const outerOriginal=[glyph(grid,l),glyph(grid,right)];
      if(+(outerOriginal[0]===outerOriginal[1])!==forecast39.mirror)continue;
      for(const transform of [false,true])for(const flip of [false,true]){
        const triple=(flip?[right,m,l]:[l,m,right]).map((point,j)=>(transform&&j===1)?phi(glyph(grid,point)||1):glyph(grid,point));
        // A transformed central F=0 is invalid; do not fabricate phi(0).
        if(transform&&glyph(grid,m)===0)continue;
        if(triple.some(v=>v<1||v>28))continue;
        const sig=triple.map(x=>mu(phi(x)));
        if(sig.some((v,i)=>v!==forecast39.signature[i]))continue;
        const shifted=triple.slice(forecast39.phase).concat(triple.slice(0,forecast39.phase));
        keys.push({center:m,source:[l,m,right],rad,transform,flip,key:shifted});
      }
    }
  }
  return keys;
}
function candidateLines(grid){
  const lines=[];
  // tau=1 leftmost first: rightward diagonals. Both NE and SE slopes are legal.
  for(let r=1;r<=27;r++)for(let c=1;c<=27;c++){
    if(r%2!==forecast39.leftmostRow||c%2!==forecast39.leftmostCol)continue;
    const dr=Math.abs(r-L[0]),dc=Math.abs(c-L[1]);
    if(Math.min(dr,dc,Math.abs(dr-dc))!==forecast39.ray)continue;
    if(!forecast39.reflected&&mu(n1([r,c]))===-1)continue;
    if(forecast39.reflected&&mu(n1([r,c]))===1)continue;
    for(const slope of [-1,1]){
      const cells=[];
      for(let j=0;;j++){
        const R=r+j*slope,C=c+j;
        if(R<1||R>27||C<1||C>27)break;
        cells.push([R,C]);
        if(cells.length<2||R%2!==forecast39.endpointRow)continue;
        const begin=cells[0],end=cells.at(-1);
        const axis=slope===0?'horizontal':'diagonal';
        if(axis!==forecast39.axis)continue;
        const leftmost=begin;
        lines.push({cells:cells.slice(),begin,end,leftmost, cipher:cells.map(x=>glyph(grid,x))});
      }
    }
  }
  return lines;
}
function dictionary(){
  const text=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
  const words=text.toUpperCase().match(/[A-Z]+/g);
  const corpus=new Map();
  for(const word of words){
    const indices=encode(word);
    if(indices.length<3)continue;
    const code=indices.join(',');
    const entry=corpus.get(code)||{word,count:0};
    entry.count++;
    corpus.set(code,entry);
  }
  return corpus;
}
function screen(grid,dict){
  const keys=sourceKeys(grid),lines=candidateLines(grid);
  const dedup=new Map();
  let accepted=0,dictionaryHits=0;
  const hits=[];
  for(const line of lines)for(const candidate of keys){
    const center=candidate.center,Bn=line.begin,En=line.end,Ln=line.leftmost;
    if(mu(gcd(n0(center),n0(Bn)))===0||mu(gcd(n0(center),n0(Ln)))===0||
      mu(gcd(n1(center),n3(En)))===0||mu(gcd(n0(center),n2(En)))===0)continue;
    accepted++;
    const decoded=line.cipher.map((v,i)=>mod(v-candidate.key[i%3],29));
    const word=dict.get(decoded.join(','));
    if(word){
      dictionaryHits++;
      const item={word:word.word,wordFrequency:word.count,begin:Bn,end:En,sourceCenter:center,
        radius:candidate.rad,transform:candidate.transform,flip:candidate.flip,
        sourceKey:candidate.key,plain:decoded.map(x=>names[x]).join(' '),cipher:line.cipher.map(x=>names[x]).join(' '),length:line.cells.length};
      hits.push(item);
      dedup.set(word.word,(dedup.get(word.word)||0)+1);
    }
  }
  hits.sort((a,b)=>b.wordFrequency-a.wordFrequency||b.length-a.length);
  return {sourceKeys:keys.length,cipherLines:lines.length,accepted,dictionaryHits,uniqueWords:dedup.size,
    byWord:[...dedup.entries()].sort((a,b)=>b[1]-a[1]).slice(0,30),
    topByFrequency:hits.slice(0,30), longest:hits.sort((a,b)=>b.length-a.length||b.wordFrequency-a.wordFrequency).slice(0,20)};
}
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffleNonAnchor(grid,rng){
  const fixed=new Set([...last.node,...last.cells].map(n0));
  const movable=[];
  for(let i=1;i<=grid.length;i++)if(!fixed.has(i))movable.push(i-1);
  const copy=grid.slice(),values=movable.map(i=>grid[i]);
  for(let i=values.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
  for(let i=0;i<movable.length;i++)copy[movable[i]]=values[i];
  return copy;
}
function main(){
  const dict=dictionary(),real=screen(base,dict);
  // Preserve 7 actual physical source/cipher anchors in a permutation control.
  const rng=random(0x5339c330),reps=60,controls=[];
  for(let j=0;j<reps;j++){
    const result=screen(shuffleNonAnchor(base,rng),dict);
    controls.push({accepted:result.accepted,sourceKeys:result.sourceKeys,dictionaryHits:result.dictionaryHits,uniqueWords:result.uniqueWords});
  }
  const stats=field=>{
    const values=controls.map(x=>x[field]);
    return {mean:values.reduce((a,b)=>a+b,0)/reps,min:Math.min(...values),max:Math.max(...values),
      nullAtLeastReal:values.filter(v=>v>=real[field]).length,
      pUpper:(1+values.filter(v=>v>=real[field]).length)/(reps+1)};
  };
  console.log(JSON.stringify({status:'Conditional only, external proposed first-38 blocks not authenticated',
    frozenFrom:'2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption',forecast:forecast39,
    original:real,controls:{seed:'0x5339c330',reps,fixedCells:7,accepted:stats('accepted'),
      sourceKeys:stats('sourceKeys'),dictionaryHits:stats('dictionaryHits'),uniqueWords:stats('uniqueWords')}}));
}
if(require.main===module)main();
module.exports={forecast,sourceKeys,candidateLines,screen,dictionary,shuffleNonAnchor,base};
