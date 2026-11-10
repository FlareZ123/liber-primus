"use strict";
/**
 * LP2 original-cipher necessary-condition test: 1033/3301 LCG public state.
 *
 * The independent page-33..39 Babylonian inscription reads 1033,3301;
 * the original pp49-51 table contains 256 bytes. Together they suggest
 * s'=(1033*s+3301+f(c_previous)) mod256.
 *
 * Each public state can independently choose ANY unknown permutation of
 * the 28 nonzero predecessor-excluding cipher steps. The exact conditional
 * rank IoC is unchanged by these unknown permutations, providing a
 * key-independent original-cipher test. An original-source driven, fully
 * reversible positive control is constructed below.
 *
 * node sims/cuneiform_lcg_public_state_invariant.cjs
 * Requires Node 22 builtins and repository source assets. No files written.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const raw=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8");
const original=GP.pages.filter(p=>p.page<56&&p.indices.length);
const total=original.reduce((n,p)=>n+p.indices.length,0);
assert.equal(original.length,55);
assert.equal(total,12956);
assert.equal(GP.pages.find(p=>p.page===53).indices.length,179);

/** @param {number} s @param {number} c @param {number} previous @param {number} f */
function nextState(s,c,previous,f){
 const delta=previous<0?0:(c-previous+29)%29;
 const x=f===0?0:f===1?c:f===2?GP.prime[c]:f===3?delta:(c+GP.prime[c]);
 return(1033*s+3301+x)&255;
}
/** @param {number} seed */
function random(seed){
 let x=seed>>>0;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** GP-index text, deterministic source-native long control, with Cicada spelling. */
function sourcePlain(){
 const tokens=GP.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const result=[];
 for(let word of raw.toUpperCase().match(/[A-Z]+/g)||[]){
   word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
     .replace(/Z/g,"S").replace(/ING/g,"NG");
   const candidate=[];
   for(let i=0;i<word.length;){
     const hit=tokens.find(t=>word.startsWith(t.s,i));
     if(!hit){candidate.length=0;break;}
     candidate.push(hit.i);i+=hit.s.length;
   }
   result.push(...candidate);
 }
 assert.ok(result.length>12956);
 let pointer=37;
 const full=[];
 for(const page of original){
   const plain=[];
   for(let i=0;i<page.indices.length;i++){
     if(i===0){plain.push(page.indices[0]);continue;}
     if(page.indices[i]===page.indices[i-1]){plain.push(28);continue;}
     while(result[pointer]===28)pointer++;
     plain.push(result[pointer++]);
   }
   full.push({page:page.page,indices:plain});
 }
 assert.equal(full.reduce((n,p)=>n+p.indices.length,0),total);
 return full;
}
const plain=sourcePlain();
/** Independent hidden permutation rows, one for each of 256 state values. */
const draw=random(0x10333301);
const secret=Array.from({length:256},()=>{
 const row=Array.from({length:28},(_,i)=>i);
 for(let i=27;i>0;i--){const k=draw()%(i+1);[row[i],row[k]]=[row[k],row[i]];}
 return row;
});
for(const row of secret)assert.equal(new Set(row).size,28);
/** @param {{page:number,indices:number[]}[]} pages @param {number} f
 * @param {number} seed @param {boolean} reset @param {boolean} invert
 */
function transduce(pages,f,seed,reset,invert){
 const inv=secret.map(row=>{
   const a=Array(28);
   row.forEach((v,i)=>a[v]=i);
   return a;
 });
 let s=seed,previous=-1;
 const output=[];
 for(const p of pages){
   if(reset){s=seed;previous=-1;}
   const result=[];
   for(let j=0;j<p.indices.length;j++){
     const q=p.indices[j];
     const c=previous<0?q:invert?q:(
       q===28?previous:(previous+1+secret[s][q])%29
     );
     const clear=previous<0?c:
       c===previous?28:inv[s][(c-previous+28)%29];
     result.push(invert?clear:c);
     s=nextState(s,c,previous,f);
     previous=c;
   }
   output.push({page:p.page,indices:result});
 }
 return output;
}
/** Public-state rank coincidence, invariant to all 256 secret row permutations. */
function statistic(pages,f,seed,reset){
 const cells=Array.from({length:256},()=>new Uint16Array(28));
 let s=seed,previous=-1,nonzero=0,markers=0;
 for(const p of pages){
   if(reset){s=seed;previous=-1;}
   for(const c of p.indices){
     if(previous>=0){
       const delta=(c-previous+29)%29;
       if(delta){cells[s][delta-1]++;nonzero++;}else markers++;
     }
     s=nextState(s,c,previous,f);
     previous=c;
   }
 }
 let equal=0,pairs=0;
 for(const row of cells){
   let n=0;
   for(const count of row){n+=count;equal+=count*(count-1);}
   pairs+=n*(n-1);
 }
 return{ioc:equal/pairs,equal,pairs,nonzero,markers};
}
function run(){
 const rows=[];
 for(let f=0;f<=4;f++){
   for(const reset of [false,true]){
     const ciphertext=transduce(plain,f,0,reset,false);
     const recovered=transduce(ciphertext,f,0,reset,true);
     assert.deepEqual(recovered,plain,"Known secret must fully decrypt original-layout source control");
     assert.deepEqual(transduce(recovered,f,0,reset,false),ciphertext,
       "Decoded source control must exactly re-encrypt");
     const positive=statistic(ciphertext,f,0,reset);
     const observed=statistic(original,f,0,reset);
     let max=0,bestSeed=0;
     for(let seed=0;seed<256;seed++){
       const value=statistic(original,f,seed,reset).ioc;
       if(value>max){max=value;bestSeed=seed;}
     }
     assert.ok(positive.ioc>0.050,"Native GP secret-perturbed positive control must pass");
     assert.ok(max<0.045,"Original unexpectedly passes an excluded register");
     rows.push({feedback:f,reset:reset?"page":"book",observed,originalMax256Seeds:max,
       originalBestSeed:bestSeed,positive,
       controlRecovered:total,controlReencrypted:total});
   }
 }
 return{
   family:"1033*state+3301+public-feedback mod 256, arbitrary 28-permutation per state",
   nonzeroAlphabet:28,states:256,unknownKeys:"(28!)^256",
   originalCiphertextRunes:total,originalPages:original.length,
   stateFunctions:["none","current GP index","current GP prime","current step",
     "GP index plus prime"],
   modelCount:rows.length,startsPerModel:256,
   originalMax:Math.max(...rows.map(r=>r.originalMax256Seeds)),
   sourceControlMin:Math.min(...rows.map(r=>r.positive.ioc)),
   rows,interpretation:"Conditional exclusion of GP-English-like direct plaintext under these source-derived public-state families; hidden-state or alternative plaintext registers remain open."
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,statistic,transduce,nextState};
