"use strict";
/**
 * Reversible unknown-lag, arbitrary 29-entry feedback lookup in the
 * GP29 multiplicative-step cipher. Scan global lags 1..512 and page-local
 * lags 1..128, fit each of 29 table entries exactly using train pages 0..27,
 * and score heldout pages 28..55. No ciphertext-trained language model.
 * Node 22, manual CI. Reproduce via node sims/one_tap_exponent_feedback_search.cjs
 */
const fs=require("node:fs"),path=require("node:path");
const {encodeGP,sourceModel}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const english=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const source=encodeGP(english),reference=sourceModel(source);
const power=[],log=new Int8Array(29).fill(-1);
for(let n=1,k=0;k<28;k++){power[k]=n;log[n]=k;n=n*15%29;}
const mod=n=>(n%28+28)%28;
const cut=pages.slice(0,28).reduce((a,p)=>a+p.length,0),nRunes=pages.flat().length;
/**
 * @param {number[][]} pageArrays
 * @param {number} lag
 * @param {"page"|"global"} mode
 */
function rowsFor(pageArrays,lag,mode){
  const streams=mode==="global"?[pageArrays.flat()]:pageArrays;
  /** @type {{train: Array<[number,number]>,hold: Array<[number,number]>}} */
  const result={train:[],hold:[]};
  let offset=0;
  for(const c of streams){
    for(let i=lag;i<c.length;i++){
      const delta=(c[i]-c[i-1]+29)%29;
      if(delta)result[offset+i<cut?"train":"hold"].push([log[delta],c[i-lag]]);
    }
    offset+=c.length;
  }
  return result;
}
/**
 * Exact per-symbol 28-shift maximum likelihood, given frozen English GP.
 * @param {Array<[number,number]>} rows
 */
function train(rows){
  const hist=Array.from({length:29},()=>new Uint16Array(28));
  for(const [r,x] of rows)hist[x][r]++;
  const key=Array(29).fill(0);
  let best=0;
  for(let x=0;x<29;x++){
    let score=-Infinity,shift=0;
    for(let v=0;v<28;v++){
      let ll=0;
      for(let r=0;r<28;r++)ll+=hist[x][r]*reference.logp[mod(r-v)];
      if(ll>score){score=ll;shift=v;}
    }
    key[x]=shift;best+=score;
  }
  return {key,trainMean:best/rows.length};
}
/**
 * @param {Array<[number,number]>} rows
 * @param {number[]} key
 */
function evaluate(rows,key){
  const hist=Array(28).fill(0);
  let ll=0;
  for(const [r,x] of rows){
    const p=mod(r-key[x]);
    hist[p]++;ll+=reference.logp[p];
  }
  const n=rows.length;
  return {n,meanLogL:ll/n,ioc:hist.reduce((a,b)=>a+b*(b-1),0)/(n*(n-1))};
}
/**
 * @param {number[][]} pageArrays
 * @param {"page"|"global"} mode
 * @param {number} maxLag
 */
function scan(pageArrays,mode,maxLag){
  const result=[];
  for(let lag=1;lag<=maxLag;lag++){
    const rows=rowsFor(pageArrays,lag,mode);
    const fitted=train(rows.train);
    result.push({lag,mode,...fitted,hold:evaluate(rows.hold,fitted.key)});
  }
  const trained=[...result].sort((a,b)=>b.trainMean-a.trainMean);
  const held=[...result].sort((a,b)=>b.hold.meanLogL-a.hold.meanLogL);
  const compact=x=>({lag:x.lag,trainMean:x.trainMean,...x.hold});
  return {winner:trained[0],trainTop5:trained.slice(0,5).map(compact),
    holdBestPostselected:compact(held[0])};
}
/**
 * @param {number[][]} pageArrays
 * @param {number} lag
 * @param {number[]} key
 * @param {"page"|"global"} mode
 */
function encrypt(pageArrays,lag,key,mode){
  const streams=mode==="global"?[pageArrays.flat()]:pageArrays;
  const encrypted=streams.map(plain=>{
    const c=[];
    for(let i=0;i<plain.length;i++){
      if(!i){c.push(plain[i]);continue;}
      const k=i>=lag?key[c[i-lag]]:0;
      c.push(plain[i]===28?c[i-1]:(c[i-1]+power[mod(plain[i]+k)])%29);
    }
    return c;
  });
  if(mode==="page")return encrypted;
  let n=0;
  return pageArrays.map(p=>p.map(()=>encrypted[0][n++]));
}
/**
 * @param {number[][]} pageArrays
 * @param {number} lag
 * @param {number[]} key
 * @param {"page"|"global"} mode
 */
function decrypt(pageArrays,lag,key,mode){
  const streams=mode==="global"?[pageArrays.flat()]:pageArrays;
  const decoded=streams.map(c=>c.map((v,i)=>{
    if(!i)return v;
    const delta=(v-c[i-1]+29)%29;
    if(!delta)return 28;
    const k=i>=lag?key[c[i-lag]]:0;
    return mod(log[delta]-k);
  }));
  if(mode==="page")return decoded;
  let n=0;
  return pageArrays.map(p=>p.map(()=>decoded[0][n++]));
}
/** @param {number[][]} a @param {number[][]} b */
function matches(a,b){
  let equal=0,total=0;
  for(let i=0;i<a.length;i++)for(let j=0;j<a[i].length;j++){
    equal+=+(a[i][j]===b[i][j]);total++;
  }
  return {equal,total};
}
function main(){
  const global=scan(pages,"global",512),local=scan(pages,"page",128);
  const win=global.winner;
  const originalRoundtrip=matches(pages,
    encrypt(decrypt(pages,win.lag,win.key,"global"),win.lag,win.key,"global"));
  let x=0x33014179;
  const rng=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
  const key=Array.from({length:29},()=>rng()%28);
  let cursor=0;
  const plain=pages.map(p=>p.map(()=>source[cursor++%source.length]));
  const plantedLag=41;
  const cipher=encrypt(plain,plantedLag,key,"global");
  const plant=scan(cipher,"global",512),guess=plant.winner;
  const restored=decrypt(cipher,guess.lag,guess.key,"global");
  const recovered=matches(plain.slice(28),restored.slice(28));
  const concise=x=>({lag:x.lag,trainMean:x.trainMean,hold:x.hold});
  const output={family:"F29 exponent-step arbitrary single-lag lookup",
    sourceCount:source.length,nRunes,trainCut:cut,
    referenceRandomLogScore:reference.randomLogScore,
    original:{globalTrainWinner:concise(global.winner),
      globalTopFive:global.trainTop5,globalBestHoldPostselected:global.holdBestPostselected,
      pageTrainWinner:concise(local.winner),pageTopFive:local.trainTop5,
      pageBestHoldPostselected:local.holdBestPostselected,roundtrip:originalRoundtrip},
    plant:{plantedLag,learnedLag:guess.lag,trainWinner:concise(guess),
      heldoutPlain:recovered}};
  console.log(JSON.stringify(output,null,2));
  if(originalRoundtrip.equal!==nRunes||guess.lag!==plantedLag||
    recovered.equal<0.97*recovered.total)
    throw new Error("inversion, planted lag, or plaintext recovery failed");
}
if(require.main===module)main();
module.exports={rowsFor,train,evaluate,scan,encrypt,decrypt};