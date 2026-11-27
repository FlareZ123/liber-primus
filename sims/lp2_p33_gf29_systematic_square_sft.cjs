'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(d,ink,sq){
 const mod=x=>(x%29+29)%29, eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b), assert=(x,m)=>{if(!x)throw Error(m)};
 const p=d.pages[33],mark=ink.pages.find(x=>x.page===33),t=p.indices.filter((_,i)=>!mark.red_spans.some(s=>i>=s.start&&i<s.start+s.length));
 assert(p.indices.length===214&&t.length===196,"source framing");
 const source=1033%29;
 const modes=["serial7","quadrants7","full14"];
 function grids(a,mode){if(mode==="full14")return [Array.from({length:14},(_,i)=>a.slice(14*i,14*i+14))];if(mode==="serial7")return Array.from({length:4},(_,b)=>Array.from({length:7},(_,i)=>a.slice(49*b+7*i,49*b+7*i+7)));return Array.from({length:4},(_,b)=>Array.from({length:7},(_,i)=>a.slice(14*(7*Math.floor(b/2)+i)+7*(b%2),14*(7*Math.floor(b/2)+i)+7*(b%2)+7)))}
 function flatten(g,mode){if(mode!=="quadrants7")return g.flat(2);return Array.from({length:14},(_,i)=>[...g[2*Math.floor(i/7)][i%7],...g[2*Math.floor(i/7)+1][i%7]]).flat()}
 const sum=a=>mod(a.reduce((x,y)=>x+y,0));
 function encode(data,n,s){const z=Array.from({length:n-1},(_,i)=>data.slice(i*(n-1),(i+1)*(n-1)));assert(data.length===(n-1)**2,"data");for(const row of z)row.push(mod(s-sum(row)));z.push(Array.from({length:n},(_,j)=>mod(s-sum(z.map(row=>row[j])))));return z}
 function test(g,s){const n=g.length, data=g.slice(0,-1).flatMap(row=>row.slice(0,-1)),pred=encode(data,n,s),checks=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i===n-1||j===n-1)checks.push({i,j,actual:g[i][j],predicted:pred[i][j],residue:mod(g[i][j]-pred[i][j])});return {matched:checks.filter(x=>!x.residue).length,total:checks.length,checks,roundtrip:eq(g,pred),data}}
 function rowcols(g){return [...g.map(sum),...g[0].map((_,j)=>sum(g.map(r=>r[j])))]}
 // The historical p56 decryptor holds ciphertext F and consumes no shift there.
 const primes=[];for(let x=2;primes.length<85;x++)if(!primes.some(p=>p*p<=x&&x%p===0))primes.push(x);
 let k=0;const p56=d.pages[56].indices.map(c=>c===0?0:mod(c-(primes[k++]-1)));assert(eq(p56.slice(0,5),[24,9,18,9,23]),"AN END");const p57=d.pages[57].indices;
 const donor=[...p57,...p56];assert(donor.length===180,"control");
 // Matching random controls: uniform shuffles preserve the exact original multiset; low-repeat
 // controls shuffle then condition on the original total count of adjacent repeats.
 let state=0x3126a12;function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 const repeats=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 function stat(a,mode,target){const g=grids(a,mode),s=target==="fit"?sum(g[0][0]):source,rs=g.map(b=>test(b,s));const train=target==="fit"?1:0;return {target:s,blocks:rs.map(({matched,total,roundtrip})=>({matched,total,roundtrip})),totalMatches:rs.reduce((v,b)=>v+b.matched,0)-train,totalChecks:rs.reduce((v,b)=>v+b.total,0)-train,holdoutMatches:rs.slice(1).reduce((v,b)=>v+b.matched,0),holdoutChecks:rs.slice(1).reduce((v,b)=>v+b.total,0),residues:rs.map(b=>b.checks.map(x=>x.residue)),rowcols:g.map(rowcols)}}
 function rankNull(rows,n){const a=rows.map(r=>r.map(mod));const piv=[];let h=0;for(let j=0;j<n&&h<a.length;j++){let k=h;while(k<a.length&&a[k][j]===0)k++;if(k===a.length)continue;[a[h],a[k]]=[a[k],a[h]];let inv=1;while(mod(inv*a[h][j])!==1)inv++;a[h]=a[h].map(x=>mod(x*inv));for(let i=0;i<a.length;i++)if(i!==h&&a[i][j]){const x=a[i][j];a[i]=a[i].map((v,z)=>mod(v-x*a[h][z]))}piv.push(j);h++}const free=Array.from({length:n},(_,i)=>i).filter(i=>!piv.includes(i));return {rank:h,basis:free.map(f=>{const v=Array(n).fill(0);v[f]=1;piv.forEach((j,i)=>v[j]=mod(-a[i][f]));return v})}}
 function allLabel(a,mode){const gs=grids(a,mode);const lines=gs.flatMap(g=>[...g,...g[0].map((_,j)=>g.map(row=>row[j]))]);const counts=x=>Array.from({length:29},(_,i)=>x.filter(v=>v===i).length);const c=counts(lines[0]),mat=lines.slice(1).map(l=>counts(l).map((x,i)=>x-c[i]));const rn=rankNull(mat,29);let bijections=0;const forced=[];for(let i=0;i<29;i++)for(let j=i+1;j<29;j++)if(rn.basis.every(v=>v[i]===v[j]))forced.push([i,j]);if(rn.basis.length<=3){const n=rn.basis.length;for(let mask=0;mask<29**n;mask++){let q=mask;const v=Array(29).fill(0);for(const b of rn.basis){let c=q%29;q=Math.floor(q/29);for(let i=0;i<29;i++)v[i]=mod(v[i]+c*b[i])}if(new Set(v).size===29)bijections++}}else bijections=null;return {rank:rn.rank,nullity:rn.basis.length,forcedEqualPairs:forced.length,firstForced:forced[0]??null,bijections,basis:rn.basis}}
 const historical=sq[1].map(row=>row.map(mod));assert(test(historical,source).roundtrip,"historical 7x7");
 const results={source:{n:p.indices.length,red:mark.red_spans.map(s=>[s.start,s.length]),black:t.length,blackSpans:[81,115],repeats:repeats(t),historicalCheck:test(historical,source).matched},modes:{}};
 // Lock all variants before analyzing actual data. Independent native messages in separate
 // p57 and p56 portions, with combined p57+p56 for the 169-rune full frame.
 for(const mode of modes){const n=mode==="full14"?14:7,b=mode==="full14"?1:4,need=b*(n-1)**2;
  const payload=donor.slice(0,need),plant=flatten(Array.from({length:b},(_,i)=>encode(payload.slice(i*(n-1)**2,(i+1)*(n-1)**2),n,source)),mode);
  const planted=stat(plant,mode,"source");assert(planted.totalMatches===planted.totalChecks,"plant checks");assert(eq(grids(plant,mode).flatMap(g=>test(g,source).data),payload),"payload recovery");
  let mutated=plant.slice();mutated[195]=mod(mutated[195]+1);assert(stat(mutated,mode,"source").totalMatches===planted.totalChecks-1,"single check mutation");
  const known=stat(t,mode,"source"),fit=stat(t,mode,"fit"),nulls={uniform:{count:0,knownGE:0,fitGE:0,full:0},matched:{count:0,knownGE:0,fitGE:0,full:0}};
  // Negative control with exact multiset and repeat count; reject sampling is bounded.
  for(let trial=0;trial<20000;trial++){const a=shuffle(t),matched=repeats(a)===repeats(t);if(trial<2000||matched&&nulls.matched.count<1000){const k=stat(a,mode,"source"),f=stat(a,mode,"fit");const record=v=>{v.count++;v.knownGE+=Number(k.totalMatches>=known.totalMatches);v.fitGE+=Number(f.totalMatches>=fit.totalMatches);v.full+=Number(k.totalMatches===k.totalChecks||f.totalMatches===f.totalChecks)};if(trial<2000)record(nulls.uniform);if(matched&&nulls.matched.count<1000)record(nulls.matched)}if(trial>=1999&&nulls.matched.count>=1000)break}
  results.modes[mode]={known,fit,plant:{checks:planted.totalChecks,recovered:need,singleCheckMutationRejected:true},nulls,allLabel:allLabel(t,mode)};
 }
 return results;
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const d=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const sq=read('resources/cicada2014-openpuff-magic-squares.txt').trim().split(/\r?\n\s*\r?\n/).map(b=>b.split(/\r?\n/).map(s=>s.trim().split(/\s+/).map(Number)));
console.log(JSON.stringify(experiment(d,ink,sq),null,2));
