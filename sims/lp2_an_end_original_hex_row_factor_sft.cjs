'use strict';
function rowExperiment(){
 const rows=["36367763ab73783c7af284446c","59466b4cd653239a311cb7116","d4618dee09a8425893dc7500b","464fdaf1672d7bef5e891c6e227","4568926a49fb4f45132c2a8b4"];
 const H=BigInt("0x"+rows.join("")),v=rows.map(s=>BigInt("0x"+s)),gcd=(a,b)=>{while(b){let t=a%b;a=b;b=t}return a},lcm=(a,b)=>a/gcd(a,b)*b,p=23;
 const lengths=rows.map(s=>s.length),g=v.map(x=>gcd(x,H)),rr=v.map(x=>Number(x%23n)),C=g.reduce(lcm,1n);
 const coeff=rows.map((_,i)=>Number((16n**BigInt(rows.slice(i+1).reduce((s,x)=>s+x.length,0)))%23n));
 const Hmod=Number(H%23n),inv=Array.from({length:23},(_,i)=>{for(let j=1;j<23;j++)if(i*j%23===1)return j;return 0});
 let sample=0,fixed=0,first3perm=0,any3specific=0,any3DH=0,first3DH=0,sum0=0;
 const known=new Set([5,6,15,8,19,2]);const specific=new Set([5,6,19]);
 for(let a=0;a<23;a++)for(let b=0;b<23;b++)for(let c=0;c<23;c++)for(let d=0;d<23;d++){
 let e=((Hmod-coeff[0]*a-coeff[1]*b-coeff[2]*c-coeff[3]*d)%23+23)%23*inv[coeff[4]]%23;
 let x=[a,b,c,d,e];sample++;if(a===5&&b===19&&c===6)fixed++;
 if(new Set(x.slice(0,3)).size===3&&x.slice(0,3).every(z=>specific.has(z)))first3perm++;
 if([...specific].every(z=>x.includes(z)))any3specific++;
 if(new Set(x.filter(z=>known.has(z))).size>=3)any3DH++;
 if(new Set(x.slice(0,3)).size===3&&x.slice(0,3).every(z=>known.has(z)))first3DH++;
 if(x.reduce((s,z)=>s+z,0)%23===0)sum0++;
 }
 const noZero=q=>((q-1)**5-(q-1))/q**5;
 // Conditional H divisible by q, all 5 row residues uniform subject to one weighted sum.
 // All weights are powers of 16 and invertible for odd q, so count via character sums.
 const coverage3=1-noZero(3),coverage7=1-noZero(7),no281=noZero(281);
 const independentSmall=coverage3*coverage7*no281;
 if(C!==84n||rr.join()!=="5,19,6,16,0"||H.toString(16).length!==128||sample!==23**4)throw Error("source row mismatch");
 return {lengths,rowGCD:g.map(String),rowGCDLCM:String(C),rowResidues:rr,rowCoefficients:coeff,Hmod23:Hmod,conditionedResidueTuples:sample,conditionalCounts:{fixed,first3perm,any3specific,first3DH,any3DH,sum0},conditionalRates:Object.fromEntries(Object.entries({fixed,first3perm,any3specific,first3DH,any3DH,sum0}).map(([k,v])=>[k,v/sample])),smallFactorCoverage:{coverage3,coverage7,no281,exactSmallGroupApprox:independentSmall,explanation:"v2(H)=2 forces last row gcd divisible by 4; 465-bit factor exceeds every row; 32-bit prime absence near certain under residue surrogate."}};
}
console.log(JSON.stringify(rowExperiment(),null,2));
