'use strict';

/**
 * Exhaustive all-secret GP29 order-three LFSR family with two key-clock
 * irregularities: transparent plaintext-F bypass (solved LP2 p56 rule)
 * and optional 81%-rate collision rejection (proposed LP2 doublet filter).
 *
 * For unknown P[i]=0 (F): output C[i]=0 and consume ZERO key symbols.
 * For P[i]!=0: tentatively output C=(P+K[t]) mod29 and consume K[t].
 * If C equals preceding emitted ciphertext, reject with probability .81,
 * consume another K symbol, and retry the SAME plaintext rune. Non-F may
 * encrypt to ciphertext F, so observed C=0 has a hidden two-branch mixture.
 *
 * Every one of 29^3 unknown initial key states is marginalized by exact
 * HMM. For each tap vector (a,b,c) in GF29^3, stop on predeclared anytime
 * likelihood-ratio thresholds against a null with the SAME F-bypass and
 * rejection semantics and an independent uniform key. No runtime drift cap.
 *
 * Windows Node22/CommonJS, read-only, no dependencies. Entrypoints:
 * sims/lp2_lfsr3_fskip_collision_part0_sft.cjs ... part7_sft.cjs.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./affine_echo_literary_control.cjs');
const {model}=require('./lp2_lfsr3_skip_alltap_core.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const N=29,STATES=N**3,R=0.81,A=1-R;
const LOW=-10,HIGH=30;
const mod=x=>(x%N+N)%N;
const count=new Float64Array(N).fill(1);
for(const word of read('resources/control/shakespeare_first300k.txt').match(/[A-Za-z]+/g)||[])
 for(const v of encode(word))count[v]++;
const normalizer=count.reduce((a,b)=>a+b,0);
const q=count.map(v=>v/normalizer);
const q0=q[0];
const baseInit=c=>q0*(c===0)+(1-q0)/N;
const baseLater=(c,prev)=>q0*(c===0)+(1-q0)*
 (c===prev?A/(N-R):1/(N-R));
const first=new Uint8Array(STATES);
for(let s=0;s<STATES;s++)first[s]=Math.floor(s/(N*N));
const emission=Array.from({length:N},(_,c)=>
 Float64Array.from({length:N},(_,k)=>{
   const p=mod(c-k);
   return p===0?0:q[p];
 }));
const prior=Array.from({length:N},(_,c)=>
 Float64Array.from({length:N},(_,k)=>{
   const p=mod(c-k);
   return p===0?0:q[p];
 }));
/**
 * Exact forward inverse of a single recurrence, with both hidden skips.
 * @param {number[]} cipher Original GP rune-index source or planted ciphertext
 * @param {ReturnType<typeof model>} machine
 * @param {{low?:number,high?:number}} [bounds]
 * @returns {{logLR:number, positions:number, status:string}}
 */
function forward(cipher,machine,bounds={}){
 const low=bounds.low??LOW,high=bounds.high??HIGH;
 let current=new Float64Array(STATES).fill(1/STATES);
 let following=new Float64Array(STATES);
 let logLR=0;
 for(let i=0;i<cipher.length;i++){
   const c=cipher[i],prev=i?cipher[i-1]:-1;
   following.fill(0);
   const like=emission[c];
   const prevLike=i?prior[prev]:null;
   // Transparent plaintext F always preserves the key state.
   if(c===0){
     for(let s=0;s<STATES;s++){
       const mass=current[s];
       if(mass)following[s]+=mass*q0;
     }
   }
   if(i===0){
     for(let s=0;s<STATES;s++){
       const mass=current[s]*like[first[s]];
       if(mass)following[machine.T[s]]+=mass;
     }
   }else if(c===prev){
     for(let s=0;s<STATES;s++){
       const mass=current[s]*like[first[s]];
       if(!mass)continue;
       const r=machine.run[s];
       if(r===0)following[machine.T[s]]+=mass;
       else{
         let probability=A;
         for(let j=0;j<r;j++){
           following[machine.acceptDest[s*3+j]]+=mass*probability;
           probability*=R;
         }
       }
     }
   }else{
     const difference=mod(c-prev);
     for(let s=0;s<STATES;s++){
       const mass=current[s];
       if(!mass)continue;
       const k=first[s];
       const direct=mass*like[k];
       if(direct)following[machine.T[s]]+=direct;
       const r=machine.run[s];
       if(r && mod(machine.changed[s]-k)===difference){
         const rejected=mass*prevLike[k]*R**r;
         if(rejected)following[machine.end[s]]+=rejected;
       }
     }
   }
   let sum=0;
   for(let s=0;s<STATES;s++)sum+=following[s];
   assert.ok(sum>0&&Number.isFinite(sum));
   logLR+=Math.log(sum)-Math.log(i?baseLater(c,prev):baseInit(c));
   const scale=1/sum;
   for(let s=0;s<STATES;s++)following[s]*=scale;
   [following,current]=[current,following];
   if(logLR<=low||logLR>=high)
     return{logLR,positions:i+1,status:logLR>=high?'FIRES':'EXCLUDED'};
 }
 return{logLR,positions:cipher.length,status:'UNRESOLVED'};
}

/** @param {number} seed */
function random(seed){
 let x=seed>>>0;
 return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};
}
/**
 * Positive known-model control with a fully secret three-rune state.
 * @param {number[]} taps
 * @param {number} [length]
 */
function plant(taps,length=1024){
 const rng=random(0x3315ceef),out=[];
 const cdf=[];let cum=0;
 for(const p of q)cdf.push(cum+=p);
 let a=7,b=11,c=19,transparent=0,rejected=0;
 const pad=()=>{
   const k=a;
   [a,b,c]=[b,c,mod(taps[0]*c+taps[1]*b+taps[2]*a)];
   return k;
 };
 for(let i=0;i<length;i++){
   const u=rng();
   const p=cdf.findIndex(x=>u<x);
   assert.ok(p>=0);
   if(p===0){out.push(0);transparent++;continue}
   let encoded;
   while(true){
     encoded=mod(p+pad());
     if(i>0&&encoded===out[i-1]&&rng()<R){rejected++;continue}
     break;
   }
   out.push(encoded);
 }
 return {cipher:out,transparent,rejected};
}
/** @param {number} part @param {number} [total] */
function runPart(part,total=8){
 assert.ok(Number.isInteger(part)&&part>=0&&part<total);
 const start=Math.floor(part*STATES/total);
 const end=Math.floor((part+1)*STATES/total);
 const sourceTaps=[Math.floor(start/841),Math.floor(start/29)%29,start%29];
 const control=plant(sourceTaps);
 assert.ok(control.transparent>5&&control.rejected>0);
 const positive=forward(control.cipher,model(sourceTaps));
 assert.equal(positive.status,'FIRES',
   'same-model hidden-seed, authentic F-skip and extra key consumption');
 const rng=random(0x55bb0000+part);
 const flat=[];
 for(let i=0;i<1024;i++){
   if(rng()<q0){flat.push(0);continue}
   let out;
   do{
     out=Math.floor(rng()*N);
     if(i>0&&out===flat[i-1]&&rng()<R)continue;
     break;
   }while(true);
   flat.push(out);
 }
 const negative=forward(flat,model(sourceTaps));
 assert.notEqual(negative.status,'FIRES');
 const counts={FIRES:0,EXCLUDED:0,UNRESOLVED:0};
 const survivors=[],largest=[];
 let totalPositions=0,maxPositions=0;
 for(let ordinal=start;ordinal<end;ordinal++){
   const taps=[Math.floor(ordinal/841),Math.floor(ordinal/29)%29,ordinal%29];
   const r=forward(original,model(taps));
   counts[r.status]++;
   totalPositions+=r.positions;
   maxPositions=Math.max(maxPositions,r.positions);
   const record={ordinal,taps,logLR:+r.logLR.toFixed(5),positions:r.positions};
   if(r.status!=='EXCLUDED')survivors.push(record);
   if(largest.length<4)largest.push(record);
   else{
     let at=0;
     for(let j=1;j<4;j++)if(largest[j].positions<largest[at].positions)at=j;
     if(record.positions>largest[at].positions)largest[at]=record;
   }
 }
 const report={
   hypothesis:'all GP29 LFSR3 tap+seed exact plaintext-F transparent,'
    +'81% key-consuming repeat rejection',
   part,total,ordinalRange:[start,end],n:end-start,sourceRuneCount:original.length,
   thresholds:[LOW,HIGH],
   controls:{sourceTaps,transparent:control.transparent,rejected:control.rejected,
     planted:positive,flat:negative},
   counts,totalPositions,maxPositions,
   longest:largest.sort((a,b)=>b.positions-a.positions),
   survivors
 };
 console.log('FSKIP-COLLISION-RESULT '+JSON.stringify(report));
 return report;
}
module.exports={forward,plant,runPart};
