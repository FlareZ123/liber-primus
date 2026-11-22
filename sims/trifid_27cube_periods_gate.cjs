'use strict';
/**
 * Exact original-source all-secret 27-cube Trifid across 3-power periods.
 * Both directions, GP IA/EA passthrough, continuous stripped stream.
 * Run: node sims/trifid_27cube_periods_gate.cjs
 * Node 22 CommonJS, no external libraries or writes.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {rectangle,apply,gp}=require('./trifid_27cube_allsecret_gate.cjs');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const original=corpus.pages.filter((p)=>p.page<56).flatMap((p)=>p.indices);
const source=original.filter((x)=>x!==27&&x!==28);
assert.equal(source.length,12026);

/** @param {number[]} v @returns {number} */
function topNine(v){return v.slice().sort((a,b)=>b-a).slice(0,9).reduce((s,x)=>s+x,0);}

/**
 * For each output symbol, identify the three source ciphertext glyphs
 * and their input cube-coordinate axes. A secret cube allows exactly
 * nine glyphs in each chosen coordinate slice. Relax the cube's shared
 * mapping *separately per axis signature*, then compute an exact
 * densest 9x9x9 relaxation through 27 independent 9x9 rectangles.
 * Handles every final short block without counting its symbols freely.
 *
 * @param {number} period
 * @param {'standard'|'reverse'} direction
 * @returns {{period:number,direction:string,bound:number,classes:{axes:string,count:number,bound:number}[],nodes:number}}
 */
function test(period,direction){
  const groups=new Map(),counts=new Map();
  for(let off=0;off<source.length;off+=period){
    const b=source.slice(off,off+period),n=b.length;
    for(let j=0;j<n;j++){
      const slots=direction==='standard'?[j,n+j,2*n+j]:[3*j,3*j+1,3*j+2];
      const axes=slots.map((k)=>direction==='standard'?k%3:Math.floor(k/n)).join('');
      const glyphs=slots.map((k)=>b[direction==='standard'?Math.floor(k/3):k%n]);
      if(!groups.has(axes)){groups.set(axes,new Uint16Array(27**3));counts.set(axes,0);}
      const [x,y,z]=glyphs;
      groups.get(axes)[(x*27+y)*27+z]++;
      counts.set(axes,counts.get(axes)+1);
    }
  }
  let bound=0,nodes=0;const classes=[];
  for(const [axes,T] of groups){
    const maxima=[];
    for(let x=0;x<27;x++){
      const m=Array.from({length:27},(_,y)=>
        Array.from({length:27},(_,z)=>T[(x*27+y)*27+z]));
      const result=rectangle(m);maxima.push(result.value);nodes+=result.nodes;
    }
    const value=topNine(maxima);bound+=value;
    classes.push({axes,count:counts.get(axes),bound:value});
  }
  assert.equal(classes.reduce((s,x)=>s+x.count,0),source.length);
  return {period,direction,bound,classes,nodes};
}
function main(){
  const files=path.join(__dirname,'../resources/control/shakespeare_first300k.txt');
  const english=gp(fs.readFileSync(files,'utf8')).slice(0,original.length);
  assert.equal(english.length,12956);
  const cube=Array.from({length:27},(_,i)=>(7*i)%27);
  assert.equal(new Set(cube).size,27);
  const configurations=[
    {p:3,d:'standard',cap:1334},{p:3,d:'reverse',cap:1334},
    {p:9,d:'standard',cap:1331},{p:9,d:'reverse',cap:1334},
    {p:27,d:'standard',cap:1337},{p:27,d:'reverse',cap:1340},
    {p:81,d:'standard',cap:1346},{p:81,d:'reverse',cap:1367},
    {p:243,d:'standard',cap:1377},{p:243,d:'reverse',cap:1333},
    {p:729,d:'reverse',cap:1335},
    {p:2187,d:'reverse',cap:1329},
    {p:6561,d:'reverse',cap:1329}
  ];
  const out=[];
  for(const {p,d,cap} of configurations){
    const row=test(p,d);
    assert.ok(row.bound<=cap,
      'A validated conservative all-key ceiling was exceeded: '+JSON.stringify({p,d,cap,value:row.bound}));
    assert.ok(row.bound<1404);
    const ciphertext=apply(english,cube,d,true,p);
    assert.deepEqual(apply(ciphertext,cube,d,false,p),english);
    out.push({period:p,direction:d,allSecretBound:row.bound,
      conservativePreviouslyCheckedCap:cap,classes:row.classes,
      nativePlantRecovered:english.length});
  }
  return {classification:'Finite original-key-independent direct-GP exclusions',
    source:'12,956 original LP2 runes; fixed IA/EA control tokens',
    scope:'One secret cube per book, one-to-one passthrough, listed 3-power periods',
    constraints:'all 27! secret cube alphabets included',
    absoluteGPSourceReferenceMinE:1404,rows:out,
    caveat:'No original unknown plaintext, authentic key or complete mechanism'};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={test,main};
