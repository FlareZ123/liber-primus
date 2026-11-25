"use strict";
const MOD=2147483647,A=69621;
// PGF 2.10: bare decimal literal seed, then pgfmathrandominteger{macro}{0}{28}.
function pgf(seed,n){if(!Number.isInteger(seed)||seed<1||seed>=MOD)throw Error("invalid nondegenerate literal seed");const K=new Uint8Array(n);let z=seed;for(let i=0;i<n;i++){z=z*A%MOD;K[i]=z%29}return K;}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
function domain(rows){return rows.filter(x=>Number.isInteger(x.seed)&&x.seed>0&&x.seed<MOD)}
function wrongSeeds(rows,n=500){const used=new Set(rows.map(x=>x.seed)),draw=rng(0x26740202),out=[];while(out.length<n){const seed=draw();if(seed===0||seed>=MOD||used.has(seed))continue;used.add(seed);out.push(seed)}return out}
function setup(corpus,shakespeare,rows,convert,plant){
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),P=convert(shakespeare,corpus.translit),valid=domain(rows),wrong=wrongSeeds(valid),controls=[];let firstPlant;
 for(let i=0;i<16;i++){const seed=0x31415926+i,K=pgf(seed,C.length+801),draw=rng(seed^0xabcdef01);const U=Array.from({length:C.length},()=>Math.floor(draw()*29/4294967296));for(const [kind,plain] of [["literary",P.slice(i*1000,i*1000+C.length)],["uniform",U]]){const E=plant(plain,K,seed^0x12345678);if(i===0&&kind==="literary")firstPlant=E.C;controls.push({seed,kind,C:E.C,trueSkips:E.skips,maxSkips:E.maxSkips});}}
 return {C,valid,wrong,controls,firstPlant,threshold:Math.log(valid.length/.05)};
}
function run(p,marginal,{start=0,end=500,candidates=true}={}){
 const controls=candidates?p.controls.map(({C,...x})=>({...x,repeats:C.slice(1).filter((v,i)=>v===C[i]).length,...marginal(C,pgf(x.seed,C.length+801))})):[],nulls=p.wrong.slice(start,end).map(seed=>{const K=pgf(seed,p.C.length+801);return {seed,original:marginal(p.C,K),plant:marginal(p.firstPlant,K)}});
 const rows=candidates?p.valid.map(({rank,seed,tier})=>({rank,seed,tier,...marginal(p.C,pgf(seed,p.C.length+801))})):[];
 return {threshold:p.threshold,controls,nulls,candidates:rows};
}
module.exports={pgf,domain,wrongSeeds,setup,run};
if(require.main===module){const fs=require("node:fs"),read=p=>fs.readFileSync(p,"utf8"),corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),prior=JSON.parse(read("im-results/lp2-r18-skipcount-feasibility-output.json")),shakespeare=read("resources/control/shakespeare_first300k.txt");const {convert}=require("./lp2_perl_pgp_keyskip1_sft.cjs"),{marginal,plant}=require("./lp2_keyskip1_rejection_marginal_sft.cjs");const p=setup(corpus,shakespeare,prior.rows,convert,plant);console.log(JSON.stringify(run(p,marginal),null,2))}
