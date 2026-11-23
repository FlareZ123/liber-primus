"use strict";

/**
 * Direct all-secret plaintext-predecessor source-key recovery using exact
 * GP29 native bigram emissions. Original LP2 printed word separators are
 * ignored. This is a new nonverbatim plaintext-register architecture gate:
 *   C[i] = P[i] + f(P[i-1]) mod29.
 * All 29 entries of f are completely free, common to every original page.
 *
 * The exact joint likelihood for two observed ciphertext symbols is
 * q[C_i,C_(i+1)] = sum over (a,b,e), with Pprev=a, P_i=b, Pnext=e,
 * of Pr(a) T(a,b) T(b,e) with ciphertext
 * C_i=b+f(a), Cnext=e+f(b) modulo29.
 *
 * Train source Markov T on independent Shakespeare/Emerson native GP,
 * compare original LP2 and a withheld native Gibran nonlinear-key plant.
 * Fit only on first 28 original physical pages; score held-out remainder
 * unchanged. Do not interpret a fitted statistical table as an actual
 * LP2 cipher unless it recovers native language independently.
 *
 * SFT: node sims/lp2_plainprev_wordfree_native_moment_fit_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8")
  .replace(/\r\n/g,"\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p=>p.page<=55 && p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
const roman = gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} text @returns {Uint8Array} */
function native(text){
  const t=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const output=[];
  for(const w of t.match(/[A-Z]+/g)||[]){
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){output.push(21);i+=3;}
      else if(w.startsWith("IO",i)){output.push(27);i+=2;}
      else{const tok=roman.find(x=>w.startsWith(x.s,i));
        assert(tok);output.push(tok.i);i+=tok.s.length;}
    }
  }
  return Uint8Array.from(output);
}
const mod=x=>(x%29+29)%29;
const trainEnglish=[native(read("resources/control/shakespeare_first300k.txt")),
  native(read("resources/control/emerson_essays_2944.txt"))];
const independent=native(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(independent.length,62492);

/** Sample a GP29 native Markov transition model from two independent donors. */
function sourceModel(donors){
  const rows=new Float64Array(29);
  const pi=new Float64Array(29);
  const T=new Float64Array(841);
  for(const d of donors){for(let i=0;i<d.length;i++){
    pi[d[i]]++;if(i){T[d[i-1]*29+d[i]]++;rows[d[i-1]]++;}
  }}
  const n=pi.reduce((a,b)=>a+b,0);
  for(let a=0;a<29;a++){
    pi[a]=(pi[a]+0.5)/(n+14.5);
    for(let b=0;b<29;b++)T[a*29+b]=(T[a*29+b]+0.3)/(rows[a]+8.7);
  }
  const triplets=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let e=0;e<29;e++)
    triplets.push({a,b,e,w:pi[a]*T[a*29+b]*T[b*29+e]});
  return {pi,T,triplets};
}
const model=sourceModel(trainEnglish);

/** Cumulative source-independent original frame layout. */
function asPages(s){const out=[];let k=0;for(const p of pages){
  out.push({page:p.page,indices:s.subarray(k,k+p.indices.length)});
  k+=p.indices.length;
}assert.equal(k,s.length);return out;}

/** The 29×29 empirical adjacent-cipher joint distribution. */
function counts(pageList){
 const freq=new Float64Array(841);let n=0;
 for(const p of pageList){const c=p.indices;
   for(let i=2;i+1<c.length;i++){freq[c[i]*29+c[i+1]]++;n++;}
 }
 return {freq,n};
}
const trainHalf=p=>p.page<=27;
function pairSets(p){return [counts(p.filter(trainHalf)),counts(p.filter(x=>!trainHalf(x)))];}
const original=Uint8Array.from(pages.flatMap(p=>p.indices));
const key=Uint8Array.from(Array.from({length:29},(_,x)=>
 mod(gp.prime[x]+x*x+11*x+4)));
/** @param {Uint8Array} plain @param {Uint8Array} f */
function encipher(plain,f) {
  const out=new Uint8Array(plain.length);let pos=0;
  for(const p of pages){const n=p.indices.length;
    out[pos]=mod(plain[pos]+f[0]);
    for(let j=1;j<n;j++)out[pos+j]=mod(plain[pos+j]+f[plain[pos+j-1]]);
    pos+=n;
  }
  return out;
}
/** @param {Uint8Array} cipher @param {Uint8Array} f @returns {number} */
function decodeHits(cipher,plain,f) {
  let matches=0,pos=0;
  for(const p of pages){
    let prev=0;for(let j=0;j<p.indices.length;j++){
      const cur=mod(cipher[pos+j]-f[prev]);
      if(cur===plain[pos+j])matches++;
      prev=cur;
    }
    pos+=p.indices.length;
  }
  return matches;
}
const nativePlain=independent.subarray(11000,11000+original.length);
assert.equal(nativePlain.length,original.length);
const planted=encipher(nativePlain,key);
assert.equal(decodeHits(planted,nativePlain,key),original.length);

/**
 * Exact expected ciphertext pair frequencies under an unrestricted f.
 * @param {Uint8Array} f
 */
function expected(f){
 const q=new Float64Array(841);
 for(const z of model.triplets){
   const c=(z.b+f[z.a])%29;
   const d=(z.e+f[z.b])%29;
   q[c*29+d]+=z.w;
 }
 return q;
}
/** Per pair native log evidence for the exact model. */
function score(f,observed){
 const q=expected(f);let s=0;
 for(let i=0;i<841;i++)if(observed.freq[i])s+=observed.freq[i]*Math.log(q[i]);
 return s/observed.n;
}
let rng=20261123;
function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;}
const randInt=n=>Math.floor(random()*n);
function optimize(observed,starts=5,sweeps=7){
 let best={val:-Infinity,f:null};
 for(let restart=0;restart<starts;restart++){
   let f=Uint8Array.from({length:29},(_,i)=>restart===0?i:randInt(29));
   let val=score(f,observed);
   for(let sweep=0;sweep<sweeps;sweep++){
     let changed=0,offset=randInt(29);
     for(let z=0;z<29;z++){
       const x=(offset+z)%29,from=f[x];let bx=from,bv=val;
       for(let y=0;y<29;y++)if(y!==from){
         f[x]=y;const v=score(f,observed);
         if(v>bv){bx=y;bv=v;}
       }
       f[x]=bx;if(bx!==from){val=bv;changed++;}
     }
     if(changed===0)break;
   }
   if(val>best.val)best={val,f:Uint8Array.from(f)};
 }
 return best;
}
function evaluate(name,cipher){
 const [train,test]=pairSets(asPages(cipher));
 const result=optimize(train);
 return {source:name,trainPairs:train.n,testPairs:test.n,
   trainLogPair:result.val,testLogPair:score(result.f,test),
   flatPairReference:-Math.log(841),f:Array.from(result.f),
   keyMatch:name==="native-positive"?
     result.f.reduce((n,v,i)=>n+Number(v===key[i]),0):null,
   recoveredNative:name==="native-positive"?
     decodeHits(cipher,nativePlain,result.f):null,
   originalDoublets:null};
}
function main(){
 const trueTrain=pairSets(asPages(planted))[0];
 const trueTest=pairSets(asPages(planted))[1];
 const plantActual={source:"native-positive true key",
   trainLogPair:score(key,trueTrain),testLogPair:score(key,trueTest)};
 const p=evaluate("native-positive",planted);
 const o=evaluate("original-LP2",original);
 console.log(JSON.stringify({plantActual,positiveFit:p,originalFit:o},null,2));
 assert(p.trainLogPair> -Infinity);
 assert(o.trainLogPair> -Infinity);
 console.log("STATUS: exact source-moment model evaluated; no authenticated plaintext without an independently recovered original key");
}
if(require.main===module)main();
module.exports={native,sourceModel,expected,score,encipher,decodeHits};
