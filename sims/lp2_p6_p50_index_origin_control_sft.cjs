'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));

const M=x=>((x%29)+29)%29;
const state={K:2,e:3,q:4,g:5,a:6,A:8,b:15,B:19,p:23};
const titleH=[2,26,5,6];
const tokens=grid.pages.flatMap(p=>p.tokens);
const A59=grid.alphabet.replace('f','');
const b59=t=>59*A59.indexOf(t[0])+A59.indexOf(t[1]);
const cell=(r,c)=>{
  const i=8*r+c,t=tokens[i];
  return {r,c,i,t,v60:grid.bytes[i],v59:b59(t)};
};
const byValue=new Map(Object.entries(state).map(([k,v])=>[v,k]));
function primitiveHits(origin){
  const hits=[];
  for(const [rf,rv] of Object.entries(state)){
    const r=rv-origin;if(r<0||r>=32)continue;
    for(const [cf,cv] of Object.entries(state)){
      const c=cv-origin;if(c<0||c>=8)continue;
      const x=cell(r,c),h60=byValue.get(x.v60)||null,h59=byValue.get(x.v59)||null;
      if(h60||h59)hits.push({rf,cf,...x,h60,h59});
    }
  }
  return hits;
}
const Hrows={K:2,neg_e:26,g:5,a:6};
const Hcols={K:2,e:3,q:4,g:5,a:6};
function titleHHits(origin){
  const hits=[];
  for(const [rf,rv] of Object.entries(Hrows)){
    const r=rv-origin;if(r<0||r>=32)continue;
    for(const [cf,cv] of Object.entries(Hcols)){
      const c=cv-origin;if(c<0||c>=8)continue;
      const x=cell(r,c),h60=byValue.get(x.v60)||null,h59=byValue.get(x.v59)||null;
      if(h60||h59)hits.push({rf,cf,...x,h60,h59});
    }
  }
  return hits;
}
const rotate=(a,n)=>a.map((_,i)=>a[(i+n)%a.length]);
function scheduleMatches(target){
  const out=[];
  for(const reversed of [false,true]){
    const base=reversed?titleH.slice().reverse():titleH.slice();
    for(let rotation=0;rotation<4;rotation++){
      for(const sign of [1,-1]){
        const v=rotate(base,rotation).map(x=>M(sign*x));
        if(v.join(',')===target.join(','))out.push({reversed,rotation,sign,v});
      }
    }
  }
  return out;
}

// Same four support edges, represented with zero-based internal coordinates
// versus one-based human-visible row/column counts.
const zeroCoordinates=[3,5,6,2];
const oneCoordinates=zeroCoordinates.map(x=>x+1);
const zeroDirected=[M(-3),5,6,2];
const oneDirected=[M(-4),6,7,3];

assert.deepEqual(scheduleMatches(zeroDirected),[
  {reversed:false,rotation:1,sign:1,v:[26,5,6,2]}
]);
assert.deepEqual(scheduleMatches(oneDirected),[]);

const zeroPrimitive=primitiveHits(0);
const onePrimitive=primitiveHits(1);
assert.equal(zeroPrimitive.length,2);
assert.equal(onePrimitive.length,3);
const zeroTitle=titleHHits(0);
const oneTitle=titleHHits(1);
assert.equal(zeroTitle.length,2);
assert.equal(oneTitle.length,1);

// A visible row2/column2 location is index9 under one-based physical counting;
// zero-based (K,K) is the different index18 state-valued cell.
assert.deepEqual(cell(1,1),{r:1,c:1,i:9,t:'49',v60:249,v59:245});
assert.deepEqual(cell(2,2),{r:2,c:2,i:18,t:'0F',v60:15,v59:15});

console.log(JSON.stringify({
  schema:1,
  sourceOnly:true,
  zeroBased:{coordinates:zeroCoordinates,directed:zeroDirected,scheduleMatches:scheduleMatches(zeroDirected),primitiveHits:zeroPrimitive,titleHHits:zeroTitle},
  oneBased:{coordinates:oneCoordinates,directed:oneDirected,scheduleMatches:scheduleMatches(oneDirected),primitiveHits:onePrimitive,titleHHits:oneTitle},
  visibleRow2Col2:cell(1,1),
  zeroBasedKCommaK:cell(2,2),
  decision:'The exact p6/p50 support schedule is conditional on zero-based table origin; the equally ordinary one-based convention destroys the 16-case schedule match and is not disfavored by primitive-state hit sparsity.'
},null,2));
