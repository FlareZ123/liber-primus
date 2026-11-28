'use strict';
// Issue #3261: exact constructive lower bound after erasing native placed crib identities.
// The actual input does NOT include phases. To PROVE ambiguity, we give known
// remaining phases only to an internal stronger oracle for constructing witnesses.
// If two different action tuples remain valid under MORE information, they
// are also valid for the actual hidden-phase and hidden-identity problem.
const fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(R,p),'utf8'),load=p=>JSON.parse(read(p));
const native=load('resources/external/relikd-solved-gp29-native-v1.json');
const conditional=load('im-results/lp2-q8-seven-crib-conditional-chart-recovery.json');
const fixture=load('im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json');
const lex=read('resources/control/english_wordfreq_textblob.txt');
const A=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const SYM='0123456789abcdefghijklmnopqrs',N=29,M=51;
const ANCHORS=[['p57_parable',13],['jpg229',1],['p56_an_end',19],['jpg229',5],['jpg229',7],['p56_an_end',2],['p56_an_end',18]];
const CHAPTERS=['jpg229','p57_parable','p56_an_end'];
const runeIndex=new Map(native.runes.map((r,i)=>[r,i])),chapters=new Map();
for(const s of native.sections){chapters.set(s.name,(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(c=>runeIndex.get(c))));}
const symbolIndex=new Map(A.map((s,i)=>[s,i]));
const dictionary=new Set();
function addWord(w){
 const input=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Q/g,'C').replace(/Z/g,'S');
 const memo=new Map();
 function rec(i){
  if(i===input.length)return [''];
  if(memo.has(i))return memo.get(i);
  const result=[];
  for(let l=1;l<=3&&i+l<=input.length;l++){
   const sub=input.slice(i,i+l);
   const value=l===3?(sub==='ING'?21:undefined):symbolIndex.get(sub);
   if(value===undefined)continue;
   for(const suffix of rec(i+l))result.push(SYM[value]+suffix);
  }
  memo.set(i,result);return result;
 }
 for(const v of rec(0))dictionary.add(v);
}
for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(m)addWord(m[1]);}
const baseSize=dictionary.size;
for(const gp of fixture.added.split(/\s+/))if(gp)dictionary.add(gp);
assert.strictEqual(baseSize,38910);
assert.strictEqual(dictionary.size,38938);
function encode(p,pi,key,start){
 let inv=Array(N);pi.forEach((v,i)=>inv[v]=i);
 let out=[],phase=start;
 for(const x of p){if(x===0){out.push(0);}else{out.push(inv[(pi[x]+key[phase])%N]);phase=(phase+1)&7;}}
 return out;
}
function decodeLex(c,pi,key){
 const inv=Array(N);pi.forEach((v,i)=>inv[v]=i);
 const ans=new Map(),word=[];
 function rec(i,phase,start){
  if(i===c.length){
   const g=word.map(x=>SYM[x]).join('');
   if(dictionary.has(g)){let s=ans.get(g)||[];if(!s.includes(start))s.push(start);ans.set(g,s);}
   return;
  }
  if(c[i]===0){word.push(0);rec(i+1,phase,start);word.pop();}
  const p=inv[((pi[c[i]]-key[phase])%N+N)%N];
  if(p!==0){word.push(p);rec(i+1,(phase+1)&7,start);word.pop();}
 }
 for(let start=0;start<8;start++)rec(0,start,start);
 return [...ans].map(([gp,starts])=>({gp,starts:starts.sort()})).sort((a,b)=>a.gp.localeCompare(b.gp));
}
function inv29(v){for(let i=1;i<N;i++)if(v*i%N===1)return i;throw Error('not invertible '+v);}
class Field{
 constructor(){this.rows=new Map();this.rhs=new Map();this.failed=false;}
 add(row,b){
  let a=row.map(x=>((x%N)+N)%N),v=((b%N)+N)%N;
  for(const p of [...this.rows.keys()].sort((x,y)=>x-y)){
   if(!a[p])continue;
   const m=a[p],other=this.rows.get(p);
   for(let i=0;i<M;i++)a[i]=((a[i]-m*other[i])%N+N)%N;
   v=((v-m*this.rhs.get(p))%N+N)%N;
  }
  const p=a.findIndex(x=>x!==0);
  if(p<0){if(v!==0)this.failed=true;return v===0;}
  const t=inv29(a[p]);a=a.map(x=>x*t%N);v=v*t%N;
  this.rows.set(p,a);this.rhs.set(p,v);return true;
 }
 affine(){
  const piv=[...this.rows.keys()].sort((a,b)=>a-b);
  const free=Array.from({length:M},(_,i)=>i).filter(i=>!this.rows.has(i));
  const D=free.length,forms=Array.from({length:M},()=>Array(D+1).fill(0));
  for(let j=0;j<D;j++)forms[free[j]][j+1]=1;
  for(let i=piv.length-1;i>=0;i--){
   const p=piv[i],row=this.rows.get(p),v=forms[p];v[0]=this.rhs.get(p);
   for(let j=p+1;j<M;j++){if(!row[j])continue;for(let k=0;k<=D;k++)v[k]=((v[k]-row[j]*forms[j][k])%N+N)%N;}
  }
  return {rank:piv.length,free,forms};
 }
}
function trueControls(sol){
 const controls=[];
 for(let i=0;i<ANCHORS.length;i++){
  const [name,wordidx]=ANCHORS[i],ci=CHAPTERS.indexOf(name),p=chapters.get(name)[wordidx],start=sol.starts[String(i)];
  assert(ci>=0&&Number.isInteger(start)&&start>=0&&start<=7);
  controls.push({name,wordidx,ci,p,c:encode(p,sol.pi,sol.keys[ci],start),start});
 }
 return controls;
}
function fieldFor(controls,remove){
 const field=new Field();
 const sum=Array(M).fill(0);for(let i=0;i<27;i++)sum[i]=1;assert(field.add(sum,28));
 for(let i=0;i<controls.length;i++){
  if(remove.includes(i))continue;
  const v=controls[i];let phase=v.start;
  for(let j=0;j<v.p.length;j++){
   const p=v.p[j],c=v.c[j];if(p===0){assert.strictEqual(c,0);continue;}
   const row=Array(M).fill(0);
   if(c>=2)row[c-2]++;if(p>=2)row[p-2]--;
   row[27+8*v.ci+phase]--;
   assert(field.add(row,Number(p===1)-Number(c===1)), 'planted native action invalid');
   phase=(phase+1)&7;
  }
 }
 assert(!field.failed);
 return field;
}
function sameAction(pi,keys,baseline){
 const maps=(p,k)=>{
  const inv=Array(N);p.forEach((x,i)=>inv[x]=i);
  return k.map(shift=>Array.from({length:N},(_,c)=>inv[((p[c]-shift)%N+N)%N]).join(','));
 };
 return keys.every((k,ci)=>{
  const a=maps(pi,k),b=maps(baseline.pi,baseline.keys[ci]);
  return Array.from({length:8},(_,shift)=>a.every((row,i)=>row===b[(i+shift)%8])).some(Boolean);
 });
}
function search(controls,truth,remove,cap=5000000){
 const f=fieldFor(controls,remove),a=f.affine(),d=a.free.length,pow=N**d;
 const result={removed:remove,rank:a.rank,nullity:d,full_affine_assignments:pow,
   complete:false,permutations:0,primitive:0,lex_complete:0,distinct_from_planted:0,
   witness:null};
 if(pow>cap){result.reason='exact affine class exceeds computation cap';return result;}
 result.complete=true;
 // Pre-slice chart forms; chart duplicates discard most completions before
 // costly key and lexical inversion. No language score selects candidates.
 const forms=a.forms;
 const vals=Array(d).fill(0);
 const val=form=>{let out=form[0];for(let k=0;k<d;k++)out+=form[k+1]*vals[k];return ((out%N)+N)%N;};
 for(let z=0;z<pow;z++){
  let t=z;for(let k=0;k<d;k++){vals[k]=t%N;t=Math.floor(t/N);}
  const used=new Set([0,1]),pi=[0,1];let good=true;
  for(let i=0;i<27;i++){let c=val(forms[i]);if(used.has(c)){good=false;break;}used.add(c);pi.push(c);}
  if(!good)continue;result.permutations++;
  const keys=[0,1,2].map(ci=>Array.from({length:8},(_,j)=>val(forms[27+8*ci+j])));
  if(!keys.every(k=>[0,1,2,3].some(j=>k[j]!==k[j+4])))continue;
  result.primitive++;
  // Full exact reencryption on all REVEALED oracle pairs
  for(let i=0;i<controls.length;i++)if(!remove.includes(i)){const v=controls[i];assert.deepStrictEqual(encode(v.p,pi,keys[v.ci],v.start),v.c);}
  const hidden=remove.map(i=>({i,words:decodeLex(controls[i].c,pi,keys[controls[i].ci])}));
  if(!hidden.every(v=>v.words.length>0))continue;
  result.lex_complete++;
  if(!sameAction(pi,keys,truth)){
   result.distinct_from_planted++;
   if(!result.witness){
    result.witness={pi,keys,hidden,sourceStarts:controls.map(v=>v.start),
     trueHidden:remove.map(i=>({i,gp:controls[i].p.map(x=>SYM[x]).join(''),start:controls[i].start}))};
   }
  }
 }
 return result;
}

// Fresh matched native-only calibration, with seeds and erasure fixed before
// any result is considered. The earlier #3258 oracle two plants are not reused.
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function newPi(random){
 const arr=Array.from({length:28},(_,i)=>i+1);
 for(let i=arr.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
 const inv=inv29(arr[0]);return [0,...arr.map(x=>x*inv%29)];
}
function newWorld(seed,world){
 const random=rng(seed),commonPi=newPi(rng(seed+500000));
 const pis=CHAPTERS.map((_,ci)=>world==='common'?commonPi:newPi(rng(seed+600000+ci*199)));
 const keys=CHAPTERS.map(()=>{let k;do{k=Array.from({length:8},()=>Math.floor(random()*29));}while(![0,1,2,3].some(j=>k[j]!==k[j+4]));return k;});
 const phase=ANCHORS.map(()=>Math.floor(random()*8));
 const controls=ANCHORS.map(([name,wordidx],i)=>{
  const ci=CHAPTERS.indexOf(name),p=chapters.get(name)[wordidx];
  return {name,wordidx,ci,p,c:encode(p,pis[ci],keys[ci],phase[i]),start:phase[i]};
 });
 return {seed,world,controls,truth:world==='common'?{pi:commonPi,keys}:null,phase};
}
function fieldStatus(controls,remove){
 const f=new Field(),sum=Array(M).fill(0);for(let i=0;i<27;i++)sum[i]=1;f.add(sum,28);
 for(let i=0;i<controls.length;i++){
  if(remove.includes(i))continue;
  const v=controls[i];let phase=v.start;
  for(let j=0;j<v.p.length;j++){
   const p=v.p[j],c=v.c[j];
   if(p===0){if(c!==0)return {status:'bypass-contradiction'};continue;}
   const row=Array(M).fill(0);if(c>=2)row[c-2]++;if(p>=2)row[p-2]--;
   row[27+8*v.ci+phase]--;
   if(!f.add(row,Number(p===1)-Number(c===1)))return {status:'linear-contradiction',rank:f.rows.size};
   phase=(phase+1)&7;
  }
 }
 return {status:'consistent',rank:f.rows.size,nullity:M-f.rows.size};
}
const conditions=[];
for(let ix=0;ix<4;ix++){
 const seed=74103+ix*101,common=newWorld(seed,'common'),privateWorld=newWorld(seed,'private');
 for(const remove of [[6],[5],[6,5]]){
  const stat=fieldStatus(common.controls,remove);
  const tested=search(common.controls,common.truth,remove,2000000);
  conditions.push({seed,world:'common',remove,phase_oracle_matrix:stat,...tested});
  console.log('NEW_COMMON_CASE '+JSON.stringify({seed,remove,rank:tested.rank,nullity:tested.nullity,
    complete:tested.complete,lex_complete:tested.lex_complete,distinct:tested.distinct_from_planted,
    permutations:tested.permutations}));
  const privateStat=fieldStatus(privateWorld.controls,remove);
  conditions.push({seed,world:'private',remove,phase_oracle_matrix:privateStat});
 }
}
const results={schema:'q8-new-native-erasure-quotient-v1',
  correction:'independent q8 common and private charts, same 7 historical native oracle word identities with new deterministic keys and phases',
  seeds:[74103,74204,74305,74406],erasures:[[6],[5],[6,5]],
  note:'known remaining phases are a *stronger information grant* than #3261 allows; this is a necessary oracle identifiability benchmark, not blind recovery',
  conditions};

// Independently selected full-seven chart identifiability witness: if two
// original GP labels never appear anywhere in the seven known plaintext or
// ciphertext strings, exchanging their chart positions leaves *all seven*
// exact forward encryptions intact while changing the full symbolic action.
const audit=results.seeds.map(seed=>{
 const w=newWorld(seed,'common'),full=fieldStatus(w.controls,[]);
 const privateFull=fieldStatus(newWorld(seed,'private').controls,[]);
 const seen=new Set(w.controls.flatMap(v=>v.p.concat(v.c)));
 const unseen=Array.from({length:N},(_,i)=>i).filter(i=>!seen.has(i));
 const swaps=[];
 for(let k=1;k<unseen.length;k++){
  const pi=w.truth.pi.slice(),a=unseen[0],b=unseen[k];
  [pi[a],pi[b]]=[pi[b],pi[a]];
  const replay=w.controls.every(v=>
   JSON.stringify(encode(v.p,pi,w.truth.keys[v.ci],v.start))===JSON.stringify(v.c));
  const distinct_action=!sameAction(pi,w.truth.keys,w.truth);
  assert(replay&&distinct_action,'unseen-symbol transposition certificate failed');
  swaps.push({swapped:[a,b],replay,distinct_action,alternate_pi:pi});
 }
 return {seed,full,privateFull,unseen,swaps};
});
results.full_seven_chart_coverage=audit;
console.log('NEW_Q8_ERASURE_SUMMARY='+JSON.stringify(results));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(results,null,2));
