'use strict';
/**
 * Exact original-input ITA2 (Baudot) letters-only gate, LP2 pp23–26.
 * node sims/lp2_p23_26_ita2_allmask_sft.cjs
 * International Telegraph Alphabet No. 2: ITU-T S.1.
 * No unrestricted ITA2/FIGS/SPACE exclusion is claimed.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=c.pages.filter(p=>p.page>=23&&p.page<=26);
assert.deepEqual(pages.map(p=>p.indices.length),[213,270,273,265]);
const all=pages.flatMap(p=>p.indices);
assert.deepEqual(all.slice(0,16),[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body=all.slice(16);
assert.equal(body.length,1005);
const quintets=Array.from({length:201},(_,i)=>body.slice(i*5,i*5+5));
const controls=[0,2,4,8,27,31]; // NUL LF SP CR FIGS LTRS
const reverse5=v=>parseInt(v.toString(2).padStart(5,'0').split('').reverse().join(''),2);
assert.deepEqual(controls.map(reverse5).sort((a,b)=>a-b),controls);
/** @param {number[][]} groups */
function makeClauses(groups){
 const seen=new Set(),clauses=[];let impossiblePatterns=0;
 for(const g of groups)for(const v of controls){
  let ones=0,zeros=0,impossible=false;
  for(let j=0;j<5;j++){
   const bit=1<<g[j];
   if((v>>(4-j))&1){if(zeros&bit){impossible=true;break;}ones|=bit;}
   else{if(ones&bit){impossible=true;break;}zeros|=bit;}
  }
  if(impossible){impossiblePatterns++;continue;}
  const key=ones+':'+zeros;
  if(!seen.has(key)){seen.add(key);clauses.push({ones,zeros});}
 }
 return {clauses,impossiblePatterns};
}
/** @param {{ones:number,zeros:number}[]} clauses */
function exactSAT(clauses){
 let nodes=0,branches=0,conflicts=0;
 /** @param {number} one @param {number} zero */
 function solve(one,zero){
  nodes++;
  for(let pass=0;pass<29;pass++){
   let changed=false;
   for(const {ones,zeros} of clauses){
    if((one&zeros)||(zero&ones))continue;
    const u=(ones|zeros)&~(one|zero);
    if(!u){conflicts++;return false;}
    if((u&(u-1))===0){
     if(ones&u)zero|=u;else one|=u;
     changed=true;
    }
   }
   if(!changed)break;
  }
  const freq=new Int16Array(29);
  for(const {ones,zeros} of clauses){
   if((one&zeros)||(zero&ones))continue;
   for(let u=(ones|zeros)&~(one|zero);u;u&=u-1)
    freq[31-Math.clz32(u&-u)]++;
  }
  let index=-1,best=0;
  for(let i=0;i<29;i++)if(freq[i]>best){index=i;best=freq[i];}
  if(index<0)return true;
  branches++;
  const bit=1<<index;
  return solve(one|bit,zero)||solve(one,zero|bit);
 }
 return {satisfiable:solve(0,0),nodes,branches,conflicts};
}
const original=makeClauses(quintets);
assert.equal(original.clauses.length,1121);
assert.equal(original.impossiblePatterns,85);
const result=exactSAT(original.clauses);
assert.deepEqual(result,{satisfiable:false,nodes:303,branches:151,conflicts:152});
// A native 201-letter planted control must decode losslessly under a
// separately chosen permanent 29-rune bit mapping and remain SAT-feasible.
const table=new Map(Object.entries({
 A:3,B:25,C:14,D:9,E:1,F:13,G:26,H:20,I:6,J:11,K:15,L:18,
 M:28,N:12,O:24,P:22,Q:23,R:10,S:5,T:16,U:7,V:30,W:19,
 X:29,Y:21,Z:17}));
const message=('KNOWTHISALLTHINGSSHOULDBEENCRYPTED'+
 'THEPRIMESARESACREDTHETOTIENTFUNCTIONISSACRED').repeat(4).slice(0,201);
assert.equal(message.length,201);
const bits=Array.from({length:29},(_,i)=>i%2);
const plant=Array.from(message,(letter,i)=>
 Array.from({length:5},(_,j)=>{
  const bit=(table.get(letter)>>(4-j))&1;
  const options=bits.flatMap((b,r)=>b===bit?[r]:[]);
  return options[(i*7+j*11)%options.length];
 }));
const inverse=new Map([...table].map(([letter,code])=>[code,letter]));
assert.equal(plant.map(g=>inverse.get(g.reduce((x,r)=>2*x+bits[r],0))).join(''),message);
assert.equal(exactSAT(makeClauses(plant).clauses).satisfiable,true);
// Original printed word and page boundaries are retained separately.
const t=read('resources/liber-primus/lp2-transcription.txt').split('%').slice(23,27).join('%');
let seen=0,inword=0;const words=[],boundaries=[];
for(const ch of t){
 if(/[\u16A0-\u16FF]/u.test(ch)){seen++;if(seen>16)inword++;}
 else if(seen>16&&ch!=='%'&&ch!=='/'&&!/\s/u.test(ch)&&inword){
  words.push(inword);boundaries.push(seen-16);inword=0;
 }
}
if(inword)words.push(inword);
assert.equal(seen,1021);
assert.equal(words.length,220);
assert.equal(words.reduce((x,n)=>x+n,0),1005);
const residues=Array.from({length:5},(_,i)=>boundaries.filter(x=>x%5===i).length);
assert.deepEqual(residues,[41,47,44,47,40]);
console.log(JSON.stringify({
 originalPhysicalPages:[23,24,25,26],bodyRunes:1005,quintets:201,
 printedBodyWords:220,printedBoundaryMod5:residues,
 ITA2Nonletters:controls,CNFClauses:original.clauses.length,
 repeatedRuneImpossiblePatterns:original.impossiblePatterns,
 exactOriginalTest:result,positiveControl:{letters:201,exactRecovery:true},
 conclusion:'Every stationary 29-rune bit mask yields at least one nonletter ITA2 code. No plaintext, key or full 5-to-1 original-cipher inverse recovered.'
},null,2));
