"use strict";

/**
 * Reversible F29 exponent-difference cipher, arbitrary 29-entry lag-5/lag-6
 * lookup tables F and G, trained on 28 original physical-page slots and
 * evaluated on the remaining ciphertext. Source distribution is an independent
 * Shakespeare-to-Gematria-Primus reference. Node 22, no external packages.
 *
 * C[i] = C[i-1] if P[i] == EA(28); otherwise
 * C[i] = C[i-1] + 15^((P[i]+F[C[i-5]]+G[C[i-6]]) mod28) mod29.
 * The first six runes of each page use zero key. Every key is invertible.
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const shakespeare = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const power = [];
const discreteLog = new Int8Array(29).fill(-1);
for (let p=1, i=0; i<28; i++) {
  power[i]=p;
  discreteLog[p]=i;
  p=p*15%29;
}
if (new Set(power).size!==28) throw new Error("15 must generate F29*");
/** @param {number} x */
const mod28 = x => (x%28+28)%28;
/** @param {number} seed */
function rng(seed) {
  let state=seed>>>0;
  return () => {
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return state>>>0;
  };
}
/** @param {string} source */
function encodeGP(source) {
  const alphabet={TH:2,EO:12,NG:21,OE:22,AE:25,IA:27,EA:28,
    F:0,U:1,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,P:13,X:14,
    S:15,T:16,B:17,E:18,M:19,L:20,D:23,A:24,Y:26,
    K:5,Q:5,V:1,Z:15};
  const tokens=Object.keys(alphabet).sort((a,b)=>b.length-a.length);
  const result=[],upper=source.toUpperCase();
  for(let i=0;i<upper.length;) {
    let found=false;
    for(const token of tokens) {
      if(!upper.startsWith(token,i))continue;
      result.push(alphabet[token]);
      i+=token.length;
      found=true;
      break;
    }
    if(!found)i++;
  }
  return result;
}
/**
 * @param {number[][]} pages
 * @param {number[]} f
 * @param {number[]} g
 * @returns {number[][]}
 */
function encrypt(pages,f,g) {
  return pages.map(plain=>{
    const c=[];
    for(let i=0;i<plain.length;i++) {
      if(i===0){c.push(plain[i]);continue;}
      const k=i>=6?mod28(f[c[i-5]]+g[c[i-6]]):0;
      c.push(plain[i]===28?c[i-1]:
        (c[i-1]+power[mod28(plain[i]+k)])%29);
    }
    return c;
  });
}
/**
 * @param {number[][]} pages
 * @param {number[]} f
 * @param {number[]} g
 * @returns {number[][]}
 */
function decrypt(pages,f,g) {
  return pages.map(c=>c.map((value,i)=>{
    if(!i)return value;
    const step=(value-c[i-1]+29)%29;
    if(!step)return 28;
    const k=i>=6?mod28(f[c[i-5]]+g[c[i-6]]):0;
    return mod28(discreteLog[step]-k);
  }));
}
/**
 * @param {number[][]} pages
 * @param {number} start
 * @param {number} end
 * @returns {Array<[number,number,number]>}
 */
function rowsFor(pages,start,end) {
  const rows=[];
  for(let p=start;p<end;p++){
    const c=pages[p];
    for(let i=6;i<c.length;i++){
      const step=(c[i]-c[i-1]+29)%29;
      if(step)rows.push([discreteLog[step],c[i-5],c[i-6]]);
    }
  }
  return rows;
}
/** @param {number[]} source */
function sourceModel(source) {
  const h=Array(28).fill(1);
  for(const v of source)if(v<28)h[v]++;
  const sum=h.reduce((a,b)=>a+b,0);
  const logp=h.map(n=>Math.log(n/sum));
  return {logp,randomLogScore:logp.reduce((a,b)=>a+b,0)/28};
}
/**
 * @param {Array<[number,number,number]>} rows
 * @param {number[]} f
 * @param {number[]} g
 * @param {number[]} logp
 */
function score(rows,f,g,logp) {
  const hist=Array(28).fill(0);
  let total=0;
  for(const [step,x,y] of rows){
    const p=mod28(step-f[x]-g[y]);
    hist[p]++;
    total+=logp[p];
  }
  const n=rows.length;
  return {n,logLPerSymbol:total/n,
    ioC:hist.reduce((a,h)=>a+h*(h-1),0)/(n*(n-1))};
}
/**
 * Coordinate-maximize Shakespeare unigram likelihood over all 58 free
 * key-table entries. Entire ciphertext is never used for fitting.
 * @param {Array<[number,number,number]>} rows
 * @param {number[]} logp
 * @param {number} restarts
 * @param {number} seed
 */
function train(rows,logp,restarts,seed){
  const random=rng(seed);
  const byX=Array.from({length:29},()=>[]);
  const byY=Array.from({length:29},()=>[]);
  for(const row of rows){byX[row[1]].push(row);byY[row[2]].push(row);}
  let best=null;
  for(let restart=0;restart<restarts;restart++){
    const f=Array.from({length:29},()=>restart?random()%28:0);
    const g=Array.from({length:29},()=>restart?random()%28:0);
    for(let iteration=0;iteration<30;iteration++){
      let changes=0;
      for(const t of [0,1]){
        const by=t?byY:byX,target=t?g:f,other=t?f:g;
        for(let v=0;v<29;v++){
          let bestScore=-Infinity,bestKey=0;
          for(let k=0;k<28;k++){
            let s=0;
            for(const row of by[v])
              s+=logp[mod28(row[0]-k-other[t?row[1]:row[2]])];
            if(s>bestScore){bestScore=s;bestKey=k;}
          }
          if(target[v]!==bestKey){target[v]=bestKey;changes++;}
        }
      }
      if(!changes)break;
    }
    const statistic=score(rows,f,g,logp);
    if(!best||statistic.logLPerSymbol>best.statistic.logLPerSymbol)
      best={f,g,statistic,restart};
  }
  return best;
}
/** @param {number[][]} a @param {number[][]} b */
function matchCount(a,b){
  let equal=0,total=0;
  for(let p=0;p<a.length;p++)for(let i=0;i<a[p].length;i++){
    if(a[p][i]===b[p][i])equal++;
    total++;
  }
  return {equal,total};
}
function main(){
  const c=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
    .map(p=>p.indices);
  const source=encodeGP(shakespeare),model=sourceModel(source);
  const midpoint=28;
  const fitting=train(rowsFor(c,0,midpoint),model.logp,8,0x33012956);
  const original={
    train:fitting.statistic,
    holdout:score(rowsFor(c,midpoint,c.length),
      fitting.f,fitting.g,model.logp),
    fitRestart:fitting.restart,
    roundtrip:matchCount(c,encrypt(decrypt(c,fitting.f,fitting.g),
      fitting.f,fitting.g))
  };
  const random=rng(0x15628310);
  const trueF=Array.from({length:29},()=>random()%28);
  const trueG=Array.from({length:29},()=>random()%28);
  let sourceOffset=0;
  const p=c.map(page=>page.map(()=>source[sourceOffset++%source.length]));
  const synthetic=encrypt(p,trueF,trueG);
  const fitPlant=train(rowsFor(synthetic,0,midpoint),model.logp,12,
    0x33012956);
  const restored=decrypt(synthetic,fitPlant.f,fitPlant.g);
  const control={
    train:fitPlant.statistic,
    holdout:score(rowsFor(synthetic,midpoint,synthetic.length),
      fitPlant.f,fitPlant.g,model.logp),
    trueKeyHoldout:score(rowsFor(synthetic,midpoint,synthetic.length),
      trueF,trueG,model.logp),
    recoveredHoldout:matchCount(p.slice(midpoint),restored.slice(midpoint)),
    cipherRoundtrip:matchCount(synthetic,
      encrypt(restored,fitPlant.f,fitPlant.g)),
    fitRestart:fitPlant.restart
  };
  const report={hypothesis:"reversible F29 exponential two-tap lookup feedback",
    originalRuneCount:c.flat().length,shakespeareGPCount:source.length,
    uniformReferenceIoC:1/28,
    uniformReferenceLogScore:-Math.log(28),
    randomShakespeareCrossEntropy:model.randomLogScore,
    original,positiveControl:control};
  console.log(JSON.stringify(report,null,2));
  if(original.roundtrip.equal!==12956 ||
     control.cipherRoundtrip.equal!==12956 ||
     control.recoveredHoldout.equal < control.recoveredHoldout.total*0.9)
     throw new Error("positive/roundtrip regression failed");
}
if(require.main===module)main();
module.exports={encodeGP,encrypt,decrypt,rowsFor,sourceModel,score,train};