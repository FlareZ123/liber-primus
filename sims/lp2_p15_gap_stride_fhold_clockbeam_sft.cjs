'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const basePath = 'sims/lp2_p56_primeclock_spectral_pool_sft.cjs';
const baseBlob = '13e5d15cbd6f7aa40981cedda42a108c17b24a18';
const paths = [
  'resources/liber-primus/lp2-corpus.json',
  'resources/external/relikd-solved-gp29-native-v1.json',
  'resources/transcriptions/lp1_wulfic_canonical.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
];

// The relaxed emission model has an independent symmetric Dirichlet prior
// for C | consuming shift. Track the exact count sufficient statistics along
// each proposed hold history. Retain 32 histories per cumulative hold count,
// then supply the highest-scoring histogram from each of three distinct counts
// to the existing structured alphabet recovery. No truth is used here.
const beamCode = " function clockBeam(C,K,width=32,alpha=.7,f=.025){\n const n=C.length,ends=C.flatMap((c,i)=>c===0?[i]:[]),all=(1<<29)-1,log=Array.from({length:n+1},(_,i)=>Math.log(i+alpha)),den=Array.from({length:n+1},(_,i)=>Math.log(i+29*alpha)),lf=Math.log(f),lc=Math.log(1-f);\n const init=()=>({hist:new Uint16Array(841),tot:new Uint16Array(29),mask:new Int32Array(29).fill(all),h:0,score:0,path:0n});\n function extend(b,lo,hi,hold,bit){const q={hist:b.hist.slice(),tot:b.tot.slice(),mask:b.mask.slice(),h:b.h,score:b.score,path:b.path};if(hold){q.h++;q.score+=lf;q.path|=1n<<BigInt(bit);lo++}\n for(let i=lo;i<hi;i++){const c=C[i],k=K[i-q.h],j=c*29+k;q.score+=lc+log[q.hist[j]++]-den[q.tot[k]++];q.mask[c]&=~(1<<k);if(!q.mask[c])return null}return q}\n let groups=[[extend(init(),0,ends[0]??n,false,0)]];\n for(let j=0;j<ends.length;j++){const pos=ends[j],hi=ends[j+1]??n,ng=Array.from({length:j+2},()=>[]);for(const list of groups)for(const b of list)if(b)for(let hold=0;hold<2;hold++){const q=extend(b,pos,hi,hold,j);if(q)ng[q.h].push(q)}for(const list of ng){list.sort((a,b)=>b.score-a.score);if(list.length>width)list.length=width}groups=ng}\n const best=groups.flat().filter(Boolean).sort((a,b)=>b.score-a.score);\n const out=[],seen=new Set();for(const b of best){if(seen.has(b.h))continue;seen.add(b.h);out.push(b);if(out.length===3)break}return out;\n }";
const branch = " if(originJob?.gapBeam){const N=1883,gaps=[1,1,1,2,3,5,8,13,21,34,55,89,144,233,377],rs=[];let rank=1;\n for(let j=0;j<N;j++){rs.push(rank);rank+=gaps[j%15]}const sieve=new Uint8Array(2500000),pr=[0];for(let p=2;pr.length<=rs.at(-1);p++){assert(p<sieve.length,\"sieve\");if(!sieve[p]){pr.push(p);if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1}}\n const K=rs.map(x=>(pr[x]-1)%29),j=originJob.control,seed=originJob.seed??0x44f15;\n let C=[c.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(20))],truth=null,A=null,B=null;\n if(j!==undefined){const rand=random(seed^0xabc123),donors=[gp(shakespeare),gp(gibran)];truth=[donors[j%2].slice(j<2?30000:10000,(j<2?30000:10000)+N)];A=perm(rand,true);B=perm(rand,false);C=[encrypt(truth[0],K,A,B)]}\n assert(C[0].length===N,\"length\");\n return {control:j??null,visibleF:C[0].filter(x=>x===0).length,literalF:truth?.[0].filter(x=>x===0).length??null,result:curriculum(C,K,seed,truth,A,B)};\n }";

/** Build the receiver against the exact frozen baseline implementation. */
function makeStudy(src) {
  const anchor = ' function curriculum(C,K,seed,truth=null,truthA=null,truthB=null){';
  if (!src.includes(anchor)) throw Error('Missing curriculum anchor');
  src = src.replace(anchor, beamCode + '\n' + anchor);
  const start = src.indexOf('   for(let start=0;start<2;start++){', src.indexOf(anchor));
  const end = src.indexOf('     // Identical initial beta', start);
  if (start < 0 || end < 0) throw Error('Missing seed anchors');
  src = src.slice(0,start) + '   const beamH=clockBeam(full[0].C,K); if(full.length!==1)throw Error("single scope");\n   for(let start=0;start<beamH.length;start++){\n     const result={G:beamH[start].hist},M=estimate(result.G,.6),seeds=spectralSeeds(result.G,M);\n' + src.slice(end);
  if (!src.includes(' if(originJob){')) throw Error('Missing job anchor');
  src = src.replace(' if(originJob){', branch + '\n if(originJob){');
  const core = src.slice(src.indexOf('function study('),src.indexOf('\nconst paths='));
  return new Function(core+';return study;')();
}

/** Run all four hidden-key controls; unlock original only if every control passes. */
function run(base,data) {
  const study=makeStudy(base),controls=[];
  for(let j=0;j<4;j++) controls.push(study(data,48,42,true,{gapBeam:true,control:j,seed:0x44f15+j}));
  const gate=controls.every(x=>{const b=x.result.best;return b&&b.fit>=.9*b.fitLength&&b.held>=.9*b.heldLength&&b.exactReplay});
  const original=gate?study(data,48,42,true,{gapBeam:true,seed:0x44f19}):null;
  return {baseBlob,controls,gate,original};
}
if(require.main===module){
  const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
  const base=read(basePath), bytes=Buffer.from(base,'utf8');
  const blob=crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(blob!==baseBlob)throw Error('Baseline blob changed: '+blob);
  console.log(JSON.stringify(run(base,paths.map(read)),null,2));
}
module.exports={makeStudy,run,basePath,baseBlob,paths};
