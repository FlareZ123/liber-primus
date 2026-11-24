'use strict';
function experiment(){
 const H=BigInt("0x36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"),P=55812325423949613300755009981997267441449219998640920324797192527488468767743421540113477457407900522923390269433267875411539939719636763371n;
 const q=281n,Q=2155279523n,C=84n,mod=(a,p=23)=>((a%p)+p)%p,pow=(a,n,p)=>{let z=1;while(n){if(n&1)z=z*a%p;a=a*a%p;n>>=1}return z},check=(a,m)=>{if(!a)throw Error(m)},bit=n=>n.toString(2).length;
 check(C*q*Q*P===H,"factor product");check([bit(H),bit(q),bit(Q),bit(P)].join()==="510,9,32,465","bit profile");
 const residues=[q,Q,P].map(n=>Number(n%23n));check(residues.join()==="5,8,9","residue identity");
 const target=[5,15,8,9],B=19,b=15;
 const inv=Array.from({length:23},(_,i)=>i?pow(i,21,23):0);
 check(mod(9*inv[b])===B&&mod(b*5)===6&&mod(6*8)===2,"extraction");
 check(pow(5,6,23)===8&&pow(5,15,23)===19&&pow(19,6,23)===2&&pow(8,15,23)===2,"DH");
 const primes9=Array.from({length:256},(_,i)=>i+256).filter(n=>{for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true});
 const weight=Array(23).fill(0),unweighted=Array(23).fill(0);let sum=0;for(const n of primes9){unweighted[n%23]++;const T=32768/(84*n),w=T>1?T*Math.log(T)-T+1:0;weight[n%23]+=w;sum+=w}
 // Exact residue enumeration, with continuous-area approximation to the 510-bit conditioning.
 // Four labeled groups g,b,A,r, every factor used, no empty group.
 // Identical twos are kept as labeled factors; existence of a partition is deduplicated.
 const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 const rset=[...new Set([B,mod(B*b),mod(B*inv[b]),mod(B-b),mod(B+b),mod(b-B)])].sort((a,b)=>a-b);
 const encode=(x,y,z)=>(x*23+y)*23+z,strict=new Set(),role=new Set(),group=new Set(),opRole=new Set(),opGroup=new Set();
 strict.add(encode(...residues));for(const rr of rset)for(const p of perms){let x=[];[5,8,rr].forEach((v,i)=>x[p[i]]=v);let k=encode(...x);opRole.add(k);if(rr===9)role.add(k)}
 const small=[2,2,3,7];
 for(let mask=0;mask<4**7;mask++){let n=mask,gs=Array(7);for(let i=0;i<7;i++){gs[i]=n%4;n=Math.floor(n/4)}if(new Set(gs).size!==4)continue;
 const base=[1,1,1,1];for(let i=0;i<4;i++)base[gs[i]]=base[gs[i]]*small[i]%23;
 const [gx,gy,gz]=gs.slice(4);const vars=[gx,gy,gz];for(const rr of rset){const t=[5,15,8,rr];if(base.some((v,j)=>!vars.includes(j)&&v!==t[j]))continue;for(let x=1;x<=22;x++)for(let y=1;y<=22;y++){let u=base.slice();u[gx]=u[gx]*x%23;u[gy]=u[gy]*y%23;if(u.some((v,j)=>j!==gz&&v!==t[j]))continue;let z=t[gz]*inv[u[gz]]%23;let k=encode(x,y,z);opGroup.add(k);if(rr===9)group.add(k)}}
 }
 const summarize=set=>{let weighted=0,uniform9=0;for(let x=1;x<=22;x++)for(let y=1;y<=22;y++)for(let z=1;z<=22;z++)if(set.has(encode(x,y,z))){weighted+=weight[x]/sum/(22*22);uniform9+=unweighted[x]/primes9.length/(22*22)}return {residueTriples:set.size,uniformResidues:set.size/22**3,uniform9Prime:uniform9,bit510AreaWeighted:weighted}};
 const exact={fixed:summarize(strict),roles:summarize(role),group:summarize(group),roleAndOps:summarize(opRole),groupAndOps:summarize(opGroup)};
 // Uniform matched integer surrogate, with exact bit condition and all large factors coprime to 2,23.
 let seed=0x24923301;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const randBits=n=>{let v=0n;for(let j=0;j<n;j+=32)v=(v<<32n)|BigInt(rng());return v&((1n<<BigInt(n))-1n)};
 const randBelow=n=>{if(n===1n)return 0n;let k=bit(n-1n);for(;;){let v=randBits(k);if(v<n)return v}};
 const limit=1n<<510n,low32=1n<<31n,low465=1n<<464n;
 const sets=[strict,role,group,opRole,opGroup];let surrogateCounts=sets.map(()=>0),surrogate=0,attempts=0,first9=Array(23).fill(0);let exploratory=0,byMod={};
 const moduli=[13,23,29,43,59,83];
 const primitive=(g,p)=>{if(g<2)return false;let v=1;for(let i=1;i<p;i++){v=v*g%p;if(v===1)return i===p-1}return false};
 const checkAny=(x,y,z,p)=>{let g=Number(x%BigInt(p)),A=Number(y%BigInt(p)),r=Number(z%BigInt(p)),b=84%p;if(!primitive(g,p)||b<2||b>=p-1||A<2||r===0)return false;let a=mod(b*g,p),B=mod(r*pow(b,p-2,p),p),K=mod(a*A,p);return a>=1&&a<p-1&&B>1&&K>1&&pow(g,a,p)===A&&pow(g,b,p)===B&&pow(A,b,p)===K&&pow(B,a,p)===K};
 while(surrogate<50000){attempts++;let x=BigInt(primes9[rng()%primes9.length]),y=low32+(randBits(30)<<1n)+1n;if(y%23n===0n)continue;let upper=(limit-1n)/(C*x*y);if(upper<low465)continue;let z=low465+(randBits(463)<<1n)+1n;if(z>upper||z%23n===0n)continue;
 const a=Number(x%23n),b=Number(y%23n),c=Number(z%23n),k=encode(a,b,c);first9[a]++;sets.forEach((s,i)=>{if(s.has(k))surrogateCounts[i]++});let hit=false;for(const p of moduli)if(checkAny(x,y,z,p)){byMod[p]=(byMod[p]||0)+1;hit=true}if(hit)exploratory++;surrogate++;
 }
 // Small actual probable-prime matched control. Approximate weighting by available integer
 // interval width, then generate a uniform probable prime in that interval. Large-prime
 // density correction is negligible across the narrow 465-bit range but not claimed exact.
 const smallPrimes=Array.from({length:997},(_,i)=>i+2).filter(n=>{for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true}).map(BigInt);
 const bigPow=(a,e,n)=>{let x=1n;while(e){if(e&1n)x=x*a%n;a=a*a%n;e>>=1n}return x};
 function prime(n){for(const p of smallPrimes){if(n===p)return true;if(n%p===0n)return false}let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}for(const a of [2n,3n,5n,7n,11n]){if(a>=n)continue;let x=bigPow(a,d,n);if(x===1n||x===n-1n)continue;let good=false;for(let j=1;j<s;j++){x=x*x%n;if(x===n-1n){good=true;break}}if(!good)return false}return true}
 let primeCounts=sets.map(()=>0),primeN=128,primeFirst9=Array(23).fill(0),primeTrials=0,primeAttempts=0;
 for(let i=0;i<primeN;i++){let x,y,upper;for(;;){primeAttempts++;x=BigInt(primes9[rng()%primes9.length]);y=low32+(randBits(30)<<1n)+1n;upper=(limit-1n)/(C*x*y);if(upper<=low465||!prime(y))continue;if(upper>2n*low465-1n)upper=2n*low465-1n;if(randBelow(low465)>upper-low465)continue;break}
 let z;for(;;){primeTrials++;z=low465+2n*randBelow((upper-low465+1n)/2n)+1n;if(prime(z))break}
 check(bit(C*x*y*z)===510&&bit(x)===9&&bit(y)===32&&bit(z)===465,"prime control profile");
 const a=Number(x%23n),bb=Number(y%23n),cc=Number(z%23n),k=encode(a,bb,cc);primeFirst9[a]++;sets.forEach((s,j)=>{if(s.has(k))primeCounts[j]++});
 }
 return {factorBits:[bit(q),bit(Q),bit(P)],Hbits:bit(H),Hmod23:Number(H%23n),residues,Cmod23:84%23,rset,primes9:primes9.length,bit510PossiblePrimes9:primes9.filter(n=>n<32768/84),nineBitPrimeResidue5:{unweighted:unweighted[5]/primes9.length,weighted:weight[5]/sum},exact,matchedIntegerSurrogate:{samples:surrogate,attempts,counts:surrogateCounts,first9,moduli,exploratoryAnyValidDH:exploratory,byMod},matchedProbablePrimeControl:{samples:primeN,counts:primeCounts,first9:primeFirst9,primeTrials,primeAttempts}};
}
console.log(JSON.stringify(experiment(),null,2));
