"use strict";
/** Source-red primitive-root key attack on authentic LP2; Node22 CommonJS SFT. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const crypto=require("node:crypto");
const {collectSpans}=require("./red_span_triangle.cjs");
const {encode}=require("./relative_key_english_probe.cjs");
const base=path.resolve(__dirname,"..");
const load=p=>fs.readFileSync(path.join(base,p),"utf8");
const corpusRaw=load("resources/liber-primus/lp2-corpus.json");
const referenceRaw=load("resources/liber-primus/lp1-plaintext-reference.txt");
const corpus=JSON.parse(corpusRaw);
const P=79,G=53,S=15,N=29,SEED=0x53221579;
function pow(a,n,p){let x=a%p,v=1;while(n){if(n%2)v=v*x%p;x=x*x%p;n=Math.floor(n/2)}return v}
function order(a,p){if(a%p===0)return 0;let v=1;for(let k=1;k<p;k++){v=v*a%p;if(v===1)return k}throw Error("no order")}
function sourceTest(){
 const r=collectSpans(),q=(p,o)=>r.find(x=>x.page===p&&x.start===o).q[0];
 assert.deepEqual([q(40,0),q(15,0),q(53,128)],[15,22,78]);
 assert.equal(corpus.prime[15],G);assert.equal(pow(G,S,P),S);assert.equal(order(G,P),78);
 assert.deepEqual([6,26,39,78].map(k=>pow(G,k,P)),[22,55,78,1]);
 const matching=corpus.prime.flatMap((v,i)=>pow(v,i,P)===i&&order(v,P)===78?[i]:[]);
 assert.deepEqual(matching,[15]);return matching;
}
function sourceBodies(){
 let prefix=[0];for(let pg of corpus.pages)prefix.push(prefix.at(-1)+pg.indices.length);
 const runes=corpus.pages.flatMap(pg=>pg.indices);
 const out=[runes.slice(prefix[15]+20,prefix[23]),runes.slice(prefix[40]+8,prefix[56])];
 assert.deepEqual(out.map(a=>a.length),[1883,3308]);return out;
}
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
/** Empirical I(key;cipher) invariant under every 29! outer alphabet permutation. */
function MI(book,start,skip){
 const h=new Uint32Array(841),a=new Uint32Array(29),b=new Uint32Array(29);
 let n=0;for(const seq of book){let state=pow(G,start,P);
  for(const glyph of seq){const k=state%29;h[k*29+glyph]++;a[k]++;b[glyph]++;n++;
    if(!(skip&&glyph===15))state=state*G%P;}}
 let result=0;for(let i=0;i<29;i++)for(let j=0;j<29;j++){const count=h[i*29+j];if(count)result+=count/n*Math.log(count*n/(a[i]*b[j]))}return result;
}
function plant(layout,source,start,skip,draw){
 const sigma=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=draw()%(i+1);[sigma[i],sigma[j]]=[sigma[j],sigma[i]]}
 let rewrites=0;const text=layout.map(seq=>{let state=pow(G,start,P),last=-1,out=[];
  for(let t=0;t<seq.length;t++){const u=draw()/4294967296;let plain=0,mass=source[0];
   while(plain<28&&mass<u){plain++;mass+=source[plain]}
   let cipher=sigma[(plain+state%29)%29];
   if(cipher===last&&draw()%1000<810){const alt=draw()%28;cipher=alt>=last?alt+1:alt;rewrites++}
   out.push(cipher);last=cipher;if(!(skip&&cipher===S))state=state*G%P;
  }return out;});
 return {text,rewrites};
}
function run(){
 const matching=sourceTest(),original=sourceBodies(),reference=(referenceRaw.match(/[A-Za-z]+/g)||[]).flatMap(encode);
 assert.ok(reference.length>3000);
 const frequency=Array(29).fill(0);for(const x of reference)frequency[x]++;
 for(let i=0;i<29;i++)frequency[i]/=reference.length;
 const draw=random(SEED),model=[];
 for(const start of [1,15])for(const skip of [false,true]){
  const plantResult=plant(original,frequency,start,skip,draw),positive=MI(plantResult.text,start,skip);
  const observed=MI(original,start,skip);assert.ok(positive>0.30&&observed<0.15);
  let total=0,exceed=0,min=Infinity,max=-Infinity;
  for(let trial=0;trial<500;trial++){
   const shifted=original.map(seq=>{const k=draw()%seq.length;return seq.slice(k).concat(seq.slice(0,k))});
   const score=MI(shifted,start,skip);total+=score;min=Math.min(min,score);max=Math.max(max,score);
   exceed+=Number(score>=observed);
  }
  model.push({startExponent:start,skipCipherS:skip,realMI:observed,
    rotationMeanMI:total/500,rotationMinMI:min,rotationMaxMI:max,
    rotationExceedances:exceed,rotationUpperTail:(exceed+1)/501,
    plantedMI:positive,plantedOverwriteCount:plantResult.rewrites});
 }
 const result={source:"GP red sources, two original section bodies and solved LP1 register",
  exactArithmetic:{base:G,modulus:P,order:order(G,P),fixedExponent:S,fixedResidue:pow(G,S,P),
    uniqueGPPrimitiveSelfIndex:matching},
  lengths:original.map(x=>x.length),GPReferenceRunes:reference.length,
  GPReferenceUnigramIoC:frequency.reduce((s,x)=>s+x*x,0),
  corpusSHA256:crypto.createHash("sha256").update(corpusRaw).digest("hex"),
  referenceSHA256:crypto.createHash("sha256").update(referenceRaw).digest("hex"),
  controls:{seed:"0x"+SEED.toString(16),bodyRotationDraws:500,
    source:"solved LP1 GP marginals",outerAlphabet:"unknown random 29-label permutation",
    adjacentCollisionRewrite:0.81},model,
  conclusion:"Exact modular identity. No original LP2 plaintext or key recovered."};
 console.log(JSON.stringify(result,null,2));return result;
}
if(require.main===module)run();
module.exports={run,pow,order,MI,sourceTest};
