'use strict';

/**
 * Complete GF(29) third-order, all-tap, all-secret-state
 * collision-driven drifting-key forward likelihood scan.
 *
 * No guessed key, seed, phase, alignment, or drift bound. A rejected
 * tentative repeated output consumes another recurrence value while the
 * plaintext rune stays fixed. All possible hidden recurrences states are
 * marginalized exactly (29^3 states per tap triple).
 *
 * One forward likelihood ratio for each of 29^3 tap triples. Sequential
 * anytime bounds are set before observing LP2: exclude at log LR <= -10;
 * flag genuine candidates at >= +30. Null is a 29-symbol iid-flat stream
 * passed through the same 0.81 repeat-rejection process. Under the
 * alternative, a true tap is falsely excluded with probability <= e^-10.
 * Under the null, <= 29^3*e^-30 family false flags (Ville/union bounds).
 * These are conditional on the specified English unigram and stream model.
 *
 * The original ciphertext is one continuous 12,956-rune clock. A separate
 * GP-English positive plant is generated with unknown seed, same collision
 * process and independent text. Eight partitions make Windows CI practical.
 *
 * Usage is via read-only sims/lp2_lfsr3_skip_part[0..7]_sft.cjs.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./affine_echo_literary_control.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const CORPUS=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const C=CORPUS.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
assert.equal(C.length,12956);
const N=29,STATES=29**3,REJECT=0.81,ACCEPT=1-REJECT;
const NEG=-10,POS=30,lnBase0=-Math.log(N);
const lnBaseSame=Math.log(ACCEPT/(N-REJECT));
const lnBaseOther=Math.log(1/(N-REJECT));
/** @param {number} x @returns {number} */
const mod=x=>(x%N+N)%N;

/** @returns {Float64Array} */
function languagePrior(){
 const h=new Float64Array(N).fill(1);
 for(const word of (read('resources/control/shakespeare_first300k.txt')
   .match(/[A-Za-z]+/g)||[]))for(const x of encode(word))h[x]++;
 const sum=h.reduce((s,x)=>s+x,0);
 return h.map(x=>x/sum);
}
const q=languagePrior();
const emit=Array.from({length:N},(_,c)=>
 Float64Array.from({length:N},(_,k)=>q[mod(c-k)]));
const plain=Array.from({length:STATES},(_,s)=>Math.floor(s/841));

/**
 * For every current triple s, T shifts one consumed key rune. If its
 * first R keys are equal, then the R+1-th will differ (R<=3), or the
 * state is a constant fixed-point, which has exact geometric accept mass.
 * @param {number[]} taps 3 GF29 coefficients
 */
function model(taps){
 const T=new Uint16Array(STATES);
 for(let s=0;s<STATES;s++){
   const a=plain[s],b=Math.floor(s/N)%N,c=s%N;
   T[s]=b*841+c*N+mod(taps[0]*c+taps[1]*b+taps[2]*a);
 }
 const run=new Uint8Array(STATES);
 const changed=new Uint8Array(STATES);
 const end=new Uint16Array(STATES);
 const acceptDest=new Uint16Array(STATES*3);
 for(let s=0;s<STATES;s++){
   let v=s,steps=0;
   while(steps<3 && plain[v]===plain[s]){
     acceptDest[s*3+steps]=T[v];
     v=T[v];
     steps++;
   }
   if(plain[v]===plain[s]) {
     // Fourth and all following key values must equal the previous
     // three under a deterministic third-order recurrence.
     assert.equal(steps,3);
     assert.equal(T[v],v,'constant solution has reached fixed point');
     run[s]=0;
   } else {
     assert.ok(steps>=1&&steps<=3);
     run[s]=steps;
     changed[s]=plain[v];
     end[s]=T[v];
   }
 }
 return {T,run,changed,end,acceptDest};
}

/**
 * Exact HMM over every initial state, optional sequential bounds.
 * @param {number[]} cipher
 * @param {ReturnType<typeof model>} m
 * @param {{neg?:number,pos?:number}} thresholds
 */
function forward(cipher,m,thresholds={}){
 const low=thresholds.neg??NEG,high=thresholds.pos??POS;
 let current=new Float64Array(STATES).fill(1/STATES);
 let nextProb=new Float64Array(STATES);
 let llr=0;
 for(let i=0;i<cipher.length;i++){
   nextProb.fill(0);
   const obs=cipher[i],prior=i?cipher[i-1]:-1;
   const like=emit[obs];
   if(i===0){
     for(let s=0;s<STATES;s++){
       const mass=current[s];
       if(mass!==0)nextProb[m.T[s]]+=mass*like[plain[s]];
     }
   }else if(obs===prior){
     for(let s=0;s<STATES;s++){
       const mass=current[s]*like[plain[s]];
       if(mass===0)continue;
       const r=m.run[s];
       if(r===0){
         nextProb[m.T[s]]+=mass;
       }else{
         let p=ACCEPT;
         for(let j=0;j<r;j++){
           nextProb[m.acceptDest[s*3+j]]+=mass*p;
           p*=REJECT;
         }
       }
     }
   }else{
     const d=mod(obs-prior);
     const prevLike=emit[prior];
     for(let s=0;s<STATES;s++){
       const mass=current[s];
       if(mass===0)continue;
       const key=plain[s];
       nextProb[m.T[s]]+=mass*like[key];
       const r=m.run[s];
       if(r && mod(m.changed[s]-key)===d){
         nextProb[m.end[s]]+=mass*prevLike[key]*REJECT**r;
       }
     }
   }
   let sum=0;
   for(let s=0;s<STATES;s++)sum+=nextProb[s];
   assert.ok(sum>0 && Number.isFinite(sum),'positive normalized likelihood');
   llr+=Math.log(sum)-(i===0?lnBase0:
     obs===prior?lnBaseSame:lnBaseOther);
   const scale=1/sum;
   for(let s=0;s<STATES;s++)nextProb[s]*=scale;
   [current,nextProb]=[nextProb,current];
   if(llr<=low || llr>=high)
     return {llr,positions:i+1,status:llr>=high?'FIRES':'EXCLUDED'};
 }
 return {llr,positions:cipher.length,status:'UNRESOLVED'};
}

/** @param {number} seed @returns {()=>number} */
function random(seed){
 let x=seed>>>0;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};
}

/**
 * Planted synthetically keyed GP-English stream with a hidden initial
 * state and real stochastic collision key skips.
 * @param {number[]} taps
 * @param {number} length
 */
function plant(taps,length=2048){
 const rng=random(0x412c9083);
 let a=7,b=11,c=19;
 const pad=()=>{const x=a;[a,b,c]=[b,c,mod(taps[0]*c+taps[1]*b+taps[2]*a)];return x};
 const cdf=[];let v=0;
 for(const p of q)cdf.push(v+=p);
 const cipher=[];
 let skips=0;
 for(let i=0;i<length;i++){
   const u=rng(),plainRune=cdf.findIndex(x=>u<x);
   assert.ok(plainRune>=0);
   let out;
   do{
     out=mod(plainRune+pad());
     if(i>0&&out===cipher[i-1]&&rng()<REJECT){skips++;continue}
     break;
   }while(true);
   cipher.push(out);
 }
 return{cipher,skips};
}

/** @param {number} part @param {number} total */
function runPart(part,total=8){
 assert.ok(Number.isInteger(part)&&part>=0&&part<total);
 const start=Math.floor(part*STATES/total);
 const end=Math.floor((part+1)*STATES/total);
 // Exact independent planted control at an inside-part tap.
 const controlTaps=[
   Math.floor(start/841),Math.floor(start/29)%29,start%29];
 const sample=plant(controlTaps);
 const check=forward(sample.cipher,model(controlTaps));
 assert.equal(check.status,'FIRES','native GP-English planted control');
 const negControl=(()=>{
   const rng=random(0x51a7201a);
   const c=[];
   for(let i=0;i<2048;i++){
     let x;
     do{
       x=Math.floor(rng()*N);
       if(i>0&&x===c[i-1]&&rng()<REJECT)continue;
       break;
     }while(true);
     c.push(x);
   }
   return forward(c,model(controlTaps));
 })();
 assert.notEqual(negControl.status,'FIRES','flat anti-repeat null control');
 // Independent arithmetic identity regression, part 0 only.
 if(part===0){
   const x=forward(C,model([23,5,6]),{neg:-Infinity,pos:Infinity});
   assert.equal(x.positions,C.length);
   assert.ok(Math.abs(x.llr-(-7819.210377697418))<1e-6,
     'all-tap HMM must reproduce the validated full-stream source-tap score');
 }
 const fires=[],unresolved=[],latest=[],counts={FIRES:0,EXCLUDED:0,UNRESOLVED:0};
 let maxPos=0;
 let work=0,sumRune=0;
 for(let ord=start;ord<end;ord++){
   const taps=[Math.floor(ord/841),Math.floor(ord/29)%29,ord%29];
   const res=forward(C,model(taps));
   counts[res.status]++;
   work+=res.positions;
   sumRune+=res.positions;
   maxPos=Math.max(maxPos,res.positions);
   const item={ord,taps,llr:+res.llr.toFixed(6),runes:res.positions};
   if(res.status==='FIRES')fires.push(item);
   if(res.status==='UNRESOLVED')unresolved.push(item);
   if(latest.length<5)latest.push(item);
   else{
     let min=0;
     for(let k=1;k<latest.length;k++)if(latest[k].runes<latest[min].runes)min=k;
     if(item.runes>latest[min].runes)latest[min]=item;
   }
 }
 const report={model:'all GF29 order<=3 taps; exact collision-skip all-state HMM',
   part,total,ordinals:[start,end],tapsTested:end-start,
   thresholds:{excluded:-10,flagged:30},
   controls:{plantedTaps:controlTaps,skipDraws:sample.skips,planted:check,flat:negControl},
   counts,totalRuneEvaluations:work,maxRuneEvaluated:maxPos,
   longestRuns:latest.sort((a,b)=>b.runes-a.runes),fires,unresolved};
 console.log('ALL-TAP-RESULT '+JSON.stringify(report));
 return report;
}

module.exports={runPart,model,forward,plant};
