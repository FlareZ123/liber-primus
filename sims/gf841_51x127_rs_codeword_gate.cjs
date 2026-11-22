"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),M=29,mod=x=>((x%M)+M)%M;
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const add=(x,y)=>[mod(x[0]+y[0]),mod(x[1]+y[1])];
const sub=(x,y)=>[mod(x[0]-y[0]),mod(x[1]-y[1])];
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
function inv29(x){x=mod(x);for(let i=1;i<M;i++)if(mod(i*x)===1)return i;throw Error("not invertible in GF29");}
function invField(x){
 const [a,b]=x,n=mod(a*a+3*a*b-8*b*b);
 if(n===0)throw Error("zero GF841 element");
 const ni=inv29(n);return [mod((a+3*b)*ni),mod(-b*ni)];
}
const div=(x,y)=>mul(x,invField(y));
function quotientPairs(bytes){
 const w=bytes.map(mod),q=[];
 assert.equal(w.length,256);
 for(let i=0;i<254;i++){const z=w[i];q.push(z);w[i+1]=mod(w[i+1]-10*z);w[i+2]=mod(w[i+2]-25*z);}
 assert.deepEqual(w.slice(254),[0,0],"grid must divide by (X-24)^2");
 return Array.from({length:127},(_,i)=>[q[2*i],q[2*i+1]]);
}
function interpolateFirstK(xs,ys,k){
 const x=xs.slice(0,k),dd=ys.slice(0,k).map(v=>v.slice());
 for(let d=1;d<k;d++)for(let i=k-1;i>=d;i--)
   dd[i]=div(sub(dd[i],dd[i-1]),sub(x[i],x[i-d]));
 return {x,dd};
}
function evalNewton(model,x){
 let y=model.dd[model.dd.length-1].slice();
 for(let k=model.dd.length-2;k>=0;k--)
   y=add(model.dd[k],mul(sub(x,model.x[k]),y));
 return y;
}
function evalPolynomial(coeff,x){
 let y=[0,0];
 for(let i=coeff.length-1;i>=0;i--)y=add(mul(y,x),coeff[i]);
 return y;
}
function main(){
 const corpus=read("resources/liber-primus/lp2-corpus.json");
 const ink=read("resources/liber-primus/lp2-ink-annotations.json");
 const grid=read("resources/liber-primus/lp2-grid-256.json");
 const p53=corpus.pages.find(p=>p.page===53).indices;
 const p54=corpus.pages.find(p=>p.page===54).indices;
 const p55=corpus.pages.find(p=>p.page===55).indices;
 const redSpan=(ink.pages.find(p=>p.page===53).red_spans||[])
   .find(s=>s.start===128&&s.length===51);
 assert.ok(redSpan);assert.equal(p53.length,179);assert.equal(p54[0],24);assert.equal(p55.length,76);
 const red=p53.slice(128),cipher=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 assert.equal(red.length,51);assert.equal(cipher.length,12956);
 const payload=cipher.slice(2);assert.equal(payload.length,51*127*2);
 const Q=quotientPairs(grid.bytes);assert.equal(Q.length,127);
 const pointKey=x=>x[0]+","+x[1],positions=new Map();
 Q.forEach((x,j)=>{const k=pointKey(x);if(!positions.has(k))positions.set(k,[]);positions.get(k).push(j);});
 const duplicates=[...positions.entries()].filter(([,v])=>v.length>1)
   .map(([point,indices])=>({point,indices}));
 const firstKDistinct=new Set(Q.slice(0,51).map(pointKey)).size;
 assert.equal(firstKDistinct,51,"the first 51 systematic evaluation points must be distinct");
 const rows=Array.from({length:51},(_,r)=>Array.from({length:127},(_,j)=>
   [payload[254*r+2*j],payload[254*r+2*j+1]]));
 let duplicateMatches=0,duplicateComparisons=0;
 for(const d of duplicates)for(let r=0;r<51;r++){
   const first=rows[r][d.indices[0]];
   for(const j of d.indices.slice(1)){
     duplicateComparisons++;
     if(first[0]===rows[r][j][0]&&first[1]===rows[r][j][1])duplicateMatches++;
   }
 }
 let parityMatches=0,parityTotal=0;
 const rowParity=[];
 for(let r=0;r<51;r++){
   const fit=interpolateFirstK(Q,rows[r],51);
   let matches=0;
   for(let j=51;j<127;j++){
     const predicted=evalNewton(fit,Q[j]),actual=rows[r][j];
     if(predicted[0]===actual[0]&&predicted[1]===actual[1])matches++;
   }
   parityMatches+=matches;parityTotal+=76;rowParity.push(matches);
 }
 // Deterministic native positive: 51 independent degree<51 polynomials.
 let plantMatches=0,plantTotal=0;
 for(let r=0;r<51;r++){
   const coeff=Array.from({length:51},(_,k)=>
     [mod(13*r+7*k+1),mod(11*r+17*k+5)]);
   const y=Q.map(x=>evalPolynomial(coeff,x));
   const fit=interpolateFirstK(Q,y,51);
   for(let j=51;j<127;j++){
     const predicted=evalNewton(fit,Q[j]);
     if(predicted[0]===y[j][0]&&predicted[1]===y[j][1])plantMatches++;
     plantTotal++;
   }
 }
 assert.equal(plantMatches,plantTotal,"native [127,51] plant must pass all parity checks");
 const output={
  source:{payloadRunes:payload.length,rows:51,fieldSymbolsPerRow:127,
    p53RedCount:red.length,p54Ac:p54[0],quotientPairs:Q.length},
  model:"Each row is a degree<51 polynomial over GF(29^2), evaluated at Q[0..126]; interpolate from the first 51 positions and predict 76 held-out positions.",
  evaluationPoints:{distinct:positions.size,first51Distinct:firstKDistinct,duplicates},
  original:{duplicatePointEqualities:duplicateMatches,duplicateComparisons,
    heldoutParityMatches:parityMatches,heldoutParityTotal:parityTotal,
    randomExpectedHeldoutMatches:parityTotal/841,rowMatches:rowParity},
  positiveControl:{heldoutParityMatches:plantMatches,heldoutParityTotal:plantTotal,
    exact:plantMatches===plantTotal},
  interpretation:"The direct source-quotient [127,51] GF(29^2) Reed-Solomon codeword model is rejected: repeated evaluation points disagree in every original row and only 2/3,876 held-out symbols match, while the planted codewords pass 3,876/3,876. This does not exclude another point set, a source-signaled pre/post transform, or another code family."
 };
 console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={quotientPairs,interpolateFirstK,evalNewton,evalPolynomial};
