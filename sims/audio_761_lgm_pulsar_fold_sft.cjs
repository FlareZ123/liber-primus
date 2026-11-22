"use strict";
/**
 * Tests a source-frozen 1.337 s LGM-1 pulsar period in the historical 2013
 * Cicada 761.MP3 audio, using the existing 44.1 kHz spectral-analysis JSON.
 * Source clue hypothesis: 2016 "the"/"found" address LP2 p14 FOLD/NGC;
 * the adjacent p14 word is LGM. No LP2 plaintext is assumed.
 * @typedef {{timeSeconds:number, highRms:number, carrierAmplitude:number, highEnergyFraction:number}} AudioFrame
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const P=1.337;
const periods=Array.from({length:301},(_,i)=>Number((1.2+i*.001).toFixed(3)));
const spans=[[5,75],[92,162]];
/** @param {number[]} y @param {number[]} t */
function detrend(y,t){
  const r=Math.max(1,Math.round(2.5*(y.length-1)/(t.at(-1)-t[0])));
  const acc=[0];for(const v of y)acc.push(acc.at(-1)+v);
  return y.map((v,i)=>{const a=Math.max(0,i-r),b=Math.min(y.length,i+r+1);return v-(acc[b]-acc[a])/(b-a)});
}
/** @param {number[]} t @param {number[]} y */
function split(t,y) {
  return spans.map(([lo,hi])=>{
    const idx=t.flatMap((x,i)=>x>=lo&&x<hi?[i]:[]);
    assert(idx.length>500);
    const mu=idx.reduce((s,i)=>s+y[i],0)/idx.length;
    const sd=Math.sqrt(idx.reduce((s,i)=>s+(y[i]-mu)**2,0)/idx.length);
    assert(sd>1e-12);
    return idx.map(i=>[t[i],(y[i]-mu)/sd]);
  });
}
/** @param {number[][][]} groups @param {number} period @param {number} harmonic */
function coherence(groups,period,harmonic=1){
  const a=groups.map(g=>{
    let x=0,y=0;
    for(const [t,z]of g){const ph=2*Math.PI*harmonic*t/period;x+=z*Math.cos(ph);y+=z*Math.sin(ph)}
    return [x/g.length,y/g.length];
  });
  return 2*(a[0][0]*a[1][0]+a[0][1]*a[1][1]);
}
/** @param {number[]} t @param {number[]} y */
function screen(t,y){
  const g=split(t,y),s=periods.map(p=>coherence(g,p));
  const at=periods.indexOf(P);assert(at>=0);
  const sorted=[...s].sort((a,b)=>a-b),best=s.indexOf(sorted.at(-1));
  return {period:P,score:s[at],rank:s.filter(v=>v>s[at]+1e-14).length+1,
    candidateCount:s.length,bestPeriod:periods[best],bestScore:s[best],
    median:sorted[150],p95:sorted[285],harmonic2:coherence(g,P,2)};
}
/** @param {AudioFrame[]} frames @param {string} field */
function feature(frames,field){
  const t=frames.map(f=>f.timeSeconds);
  const y=detrend(frames.map(f=>Math.log(Math.max(Number(f[field]),1e-18))),t);
  return {t,y};
}
function main(){
  const input=process.argv[2]||"artifacts/audio-761-spectral-analysis.json";
  const output=process.argv[3]||"artifacts/audio-761-lgm-fold.json";
  const d=JSON.parse(fs.readFileSync(input,"utf8"));
  assert(d.metadata.durationSeconds>160&&d.metadata.durationSeconds<175);
  const pairs=[["mid","highRms"],["side","highRms"],["mid","carrierAmplitude"],["mid","highEnergyFraction"]];
  const result=pairs.map(([channel,field])=>{
    const ch=d.frames.find(x=>x.channel===channel);assert(ch);
    const {t,y}=feature(ch.frames,field);
    return {channel,field,...screen(t,y)};
  });
  const {t,y}=feature(d.frames.find(x=>x.channel==="mid").frames,"highRms");
  const mean=y.reduce((s,v)=>s+v,0)/y.length;
  const sd=Math.sqrt(y.reduce((s,v)=>s+(v-mean)**2,0)/y.length);
  const plant=screen(t,y.map((v,i)=>v+4*sd*Math.cos(2*Math.PI*t[i]/P)));
  assert.equal(plant.rank,1,"Positive pulsar plant must rank first");
  const summary={
    status:"LGM-1 original audio period-fold hypothesis, not an original LP2 decryption",
    source:"LP2 p14 printed FOLD NGC LGM via signed 2016 the/found address map",
    audio:"Cicada 2013 archived 761.MP3 (rtkd/iddqd f2267b0)",
    method:"log feature; centered 5-second moving-average subtraction; 5-75 vs 92-162 seconds; first-harmonic signed cross-half phase coherence",
    null:"301 fixed nearby periods from 1.200 to 1.500 s, increment 0.001 s; rank is descriptive and correlated, not a p-value",
    results:result,positiveControl:plant
  };
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const fd=fs.openSync(output+".lock","wx");
  try{const tmp=output+"."+process.pid+".tmp";try{fs.writeFileSync(tmp,JSON.stringify(summary,null,2)+"\n");fs.renameSync(tmp,output)}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}}finally{fs.closeSync(fd);fs.unlinkSync(output+".lock")}
  console.log(JSON.stringify(summary));
}
if(require.main===module)main();
module.exports={coherence,screen,detrend,split};
