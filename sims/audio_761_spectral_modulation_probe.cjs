'use strict';
/**
 * Inspect the known 15.4–16.1 kHz component of Cicada's archival 761.MP3,
 * including stereo mid/side, and extract a compact musical chroma sequence.
 * Input: interleaved stereo float32 little-endian PCM, 44.1 kHz.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SAMPLE_RATE = 44100;
const CHANNELS = 2;
const N = 8192;
const HOP = 4096;
const LOW_HZ = 15400;
const HIGH_HZ = 16100;
const CARRIER_BIN = 2906;
const PITCH_LOW_HZ = 55;
const PITCH_HIGH_HZ = 2200;
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function fft(re, im) {
  const n = re.length;
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = -2 * Math.PI / len;
    const wr0 = Math.cos(angle), wi0 = Math.sin(angle);
    for (let base = 0; base < n; base += len) {
      let wr = 1, wi = 0;
      for (let k = 0; k < len / 2; k++) {
        const even = base + k, odd = even + len / 2;
        const vr = re[odd] * wr - im[odd] * wi;
        const vi = re[odd] * wi + im[odd] * wr;
        const ur = re[even], ui = im[even];
        re[even] = ur + vr; im[even] = ui + vi;
        re[odd] = ur - vr; im[odd] = ui - vi;
        const nextWr = wr * wr0 - wi * wi0;
        wi = wr * wi0 + wi * wr0; wr = nextWr;
      }
    }
  }
}

function quantile(values, q) {
  const sorted = [...values].sort((a,b) => a-b);
  return sorted[Math.min(sorted.length-1, Math.floor(q*(sorted.length-1)))];
}


function wrapPhase(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function phaseSummary(frames) {
  const phases = frames.map(frame => frame.carrierPhase);
  const weights = frames.map(frame => frame.carrierAmplitude);
  const totalWeight = weights.reduce((a,b)=>a+b,0) + 1e-30;
  const coherence = {};
  for (let order=1; order<=4; order++) {
    let c=0, s=0;
    for (let i=0;i<phases.length;i++) {
      c += weights[i] * Math.cos(order*phases[i]);
      s += weights[i] * Math.sin(order*phases[i]);
    }
    coherence[order] = Math.hypot(c,s)/totalWeight;
  }
  let c2=0,s2=0;
  for(let i=0;i<phases.length;i++){c2+=weights[i]*Math.cos(2*phases[i]);s2+=weights[i]*Math.sin(2*phases[i]);}
  const bpskAxis=0.5*Math.atan2(s2,c2);
  const bits=phases.map(p=>Math.cos(p-bpskAxis)<0?1:0);
  let transitions=0,run=1;const runs=[];
  for(let i=1;i<bits.length;i++){if(bits[i]!==bits[i-1]){runs.push(run);run=0;transitions++;}run++;}
  runs.push(run);
  const unwrapped=[phases[0]],deltas=[];
  for(let i=1;i<phases.length;i++){const d=wrapPhase(phases[i]-phases[i-1]);deltas.push(d);unwrapped.push(unwrapped[i-1]+d);}
  let sw=0,st=0,sp=0,stt=0,stp=0;
  for(let i=0;i<unwrapped.length;i++){const t=i*HOP/SAMPLE_RATE,w=weights[i],p=unwrapped[i];sw+=w;st+=w*t;sp+=w*p;stt+=w*t*t;stp+=w*t*p;}
  const denom=sw*stt-st*st;
  const slope=denom?((sw*stp-st*sp)/denom):0;
  const intercept=(sp-slope*st)/(sw||1);
  const residual=Math.sqrt(unwrapped.reduce((sum,p,i)=>sum+weights[i]*(p-intercept-slope*i*HOP/SAMPLE_RATE)**2,0)/(sw||1));
  const absDeltas=deltas.map(Math.abs);
  return {
    weightedPhaseCoherence:coherence,
    bpskProjection:{axisRadians:bpskAxis,transitions,runFrames:{min:Math.min(...runs),median:quantile(runs,.5),max:Math.max(...runs)}},
    phaseDelta:{mean:deltas.reduce((a,b)=>a+b,0)/Math.max(1,deltas.length),absMedian:quantile(absDeltas,.5),absQ90:quantile(absDeltas,.9),jumpsOver1_5:absDeltas.filter(x=>x>1.5).length,jumpsOver2_5:absDeltas.filter(x=>x>2.5).length},
    linearPhaseFit:{slopeRadiansPerSecond:slope,estimatedCarrierHz:CARRIER_BIN*SAMPLE_RATE/N+slope/(2*Math.PI),residualRmsRadians:residual}
  };
}

function summarizeChannel(name, frames, includeChroma) {
  const peakBins = frames.map(x => x.peakBin);
  const highRms = frames.map(x => x.highRms);
  const peakHz = frames.map(x => x.peakHz);
  const mean = highRms.reduce((a,b)=>a+b,0)/highRms.length;
  const variance = highRms.reduce((a,b)=>a+(b-mean)**2,0)/highRms.length;
  const threshold = quantile(highRms,0.5);
  let transitions=0, prior=highRms[0]>=threshold, run=0;
  const binaryRuns=[];
  for (const value of highRms) {
    const bit=value>=threshold;
    if (bit!==prior) { binaryRuns.push(run); run=0; transitions++; prior=bit; }
    run++;
  }
  binaryRuns.push(run);
  const peakCounts=new Map();
  for (const bin of peakBins) peakCounts.set(bin,(peakCounts.get(bin)||0)+1);
  const x=highRms.map(v=>Math.log(v+1e-20));
  const xm=x.reduce((a,b)=>a+b,0)/x.length;
  const xc=x.map(v=>v-xm);
  const denom=xc.reduce((s,v)=>s+v*v,0)+1e-30;
  const autocorr=[];
  for(let lag=1;lag<=Math.min(256,Math.floor(x.length/4));lag++){
    let sum=0;for(let i=0;i<x.length-lag;i++)sum+=xc[i]*xc[i+lag];
    autocorr.push({lag,seconds:lag*HOP/SAMPLE_RATE,correlation:sum/denom});
  }
  const topAutocorr=autocorr.sort((a,b)=>b.correlation-a.correlation).slice(0,12);
  const result={
    name,frameCount:frames.length,
    carrierPhase:phaseSummary(frames),
    highBand:{rangeHz:[LOW_HZ,HIGH_HZ],peakHz:{min:Math.min(...peakHz),max:Math.max(...peakHz),mean:peakHz.reduce((a,b)=>a+b,0)/peakHz.length},
      distinctPeakBins:peakCounts.size,peakBinHistogram:[...peakCounts].sort((a,b)=>a[0]-b[0]).map(([bin,count])=>({bin,hz:bin*SAMPLE_RATE/N,count})),
      rms:{min:Math.min(...highRms),q10:quantile(highRms,.1),median:threshold,q90:quantile(highRms,.9),max:Math.max(...highRms),mean,std:Math.sqrt(variance)},
      peakToBandMean:{mean:frames.reduce((s,x)=>s+x.peakRatio,0)/frames.length},
      spectralFlatnessMean:frames.reduce((s,x)=>s+x.flatness,0)/frames.length,
      energyFractionMean:frames.reduce((s,x)=>s+x.highEnergyFraction,0)/frames.length,
      peakBinTransitions:peakBins.slice(1).filter((v,i)=>v!==peakBins[i]).length,
      medianThresholdTransitions:transitions,
      medianThresholdRunFrames:{min:Math.min(...binaryRuns),median:quantile(binaryRuns,.5),max:Math.max(...binaryRuns)},
      topLogEnvelopeAutocorrelation:topAutocorr
    }
  };
  if(includeChroma){
    const totals=new Array(12).fill(0);
    for(const f of frames)for(let i=0;i<12;i++)totals[i]+=f.chroma[i];
    const sum=totals.reduce((a,b)=>a+b,0)||1;
    result.chroma=totals.map((energy,pc)=>({pitchClass:pc,note:NOTE_NAMES[pc],energy,share:energy/sum})).sort((a,b)=>b.energy-a.energy);
    const events=[];let last=null,start=0;
    for(let i=0;i<frames.length;i++){
      const midi=frames[i].dominantMidi;
      if(midi!==last){if(last!==null)events.push({midi:last,note:NOTE_NAMES[last%12]+(Math.floor(last/12)-1),startSeconds:start*HOP/SAMPLE_RATE,durationSeconds:(i-start)*HOP/SAMPLE_RATE});
        last=midi;start=i;}
    }
    if(last!==null)events.push({midi:last,note:NOTE_NAMES[last%12]+(Math.floor(last/12)-1),startSeconds:start*HOP/SAMPLE_RATE,durationSeconds:(frames.length-start)*HOP/SAMPLE_RATE});
    result.dominantNoteRuns=events;
  }
  return result;
}

function main() {
  const input=process.argv[2]||'/tmp/761-stereo.f32le';
  const output=process.argv[3]||'artifacts/audio-761-spectral-analysis.json';
  const raw=fs.readFileSync(input);
  assert.equal(raw.length%8,0,'Expected interleaved stereo float32 PCM');
  const samples=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
  const sampleFrames=samples.length/CHANNELS;
  const duration=sampleFrames/SAMPLE_RATE;
  assert.ok(duration>160&&duration<175,'Unexpected 761.MP3 duration: '+duration);
  const window=Float64Array.from({length:N},(_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/(N-1)));
  const lowBin=Math.max(1,Math.ceil(LOW_HZ*N/SAMPLE_RATE));
  const highBin=Math.min(N/2-1,Math.floor(HIGH_HZ*N/SAMPLE_RATE));
  const pitchLo=Math.max(1,Math.ceil(PITCH_LOW_HZ*N/SAMPLE_RATE));
  const pitchHi=Math.min(N/2-1,Math.floor(PITCH_HIGH_HZ*N/SAMPLE_RATE));
  const names=['left','right','mid','side'];
  const outputs=[];
  for(let channel=0;channel<4;channel++){
    const frames=[];
    const re=new Float64Array(N),im=new Float64Array(N);
    for(let start=0;start+N<=sampleFrames;start+=HOP){
      for(let i=0;i<N;i++){
        const l=samples[(start+i)*2],r=samples[(start+i)*2+1];
        const value=channel===0?l:channel===1?r:channel===2?(l+r)*0.5:(l-r)*0.5;
        re[i]=value*window[i];im[i]=0;
      }
      fft(re,im);
      let highSum=0,highLog=0,highPeak=0,peakBin=lowBin,weighted=0,total=0;
      const highCount=highBin-lowBin+1;
      for(let k=1;k<=N/2;k++){
        const power=re[k]*re[k]+im[k]*im[k];
        total+=power;
        if(k>=lowBin&&k<=highBin){
          highSum+=power;highLog+=Math.log(power+1e-30);weighted+=power*k;
          if(power>highPeak){highPeak=power;peakBin=k;}
        }
      }
      const meanPower=highSum/highCount;
      const flatness=Math.exp(highLog/highCount)/(meanPower+1e-30);
      const carrierPhase=Math.atan2(im[CARRIER_BIN],re[CARRIER_BIN]);
      const carrierAmplitude=Math.hypot(re[CARRIER_BIN],im[CARRIER_BIN]);
      let dominantMidi=0,dominantEnergy=0;
      const midiEnergy=new Float64Array(128),chroma=new Array(12).fill(0);
      if(channel<2){
        for(let k=pitchLo;k<=pitchHi;k++){
          const f=k*SAMPLE_RATE/N,power=re[k]*re[k]+im[k]*im[k];
          const midi=Math.round(69+12*Math.log2(f/440));
          if(midi>=24&&midi<=96){midiEnergy[midi]+=power;chroma[midi%12]+=power;}
        }
        for(let midi=24;midi<=96;midi++)if(midiEnergy[midi]>dominantEnergy){dominantEnergy=midiEnergy[midi];dominantMidi=midi;}
        const chromaSum=chroma.reduce((a,b)=>a+b,0)||1;
        for(let i=0;i<12;i++)chroma[i]/=chromaSum;
      }
      frames.push({
        timeSeconds:start/SAMPLE_RATE,
        peakBin,peakHz:peakBin*SAMPLE_RATE/N,carrierPhase,carrierAmplitude,
        highRms:Math.sqrt(meanPower),peakRatio:highPeak/(highSum+1e-30),
        flatness,highEnergyFraction:highSum/(total+1e-30),
        ...(channel<2?{dominantMidi,dominantEnergy,chroma}: {})
      });
    }
    outputs.push({name:names[channel],frames,summary:summarizeChannel(names[channel],frames,channel<2)});
  }
  const result={
    metadata:{source:'Cicada 3301 archival 761.MP3',sampleRate:SAMPLE_RATE,channels:2,
      durationSeconds:duration,sampleFrames,fftSize:N,hopSize:HOP,frameCount:outputs[0].frames.length,
      highBandHz:[LOW_HZ,HIGH_HZ],carrierBin:CARRIER_BIN,carrierBinHz:CARRIER_BIN*SAMPLE_RATE/N,pitchBandHz:[PITCH_LOW_HZ,PITCH_HIGH_HZ]},
    channels:outputs.map(x=>x.summary),
    stereoPhaseDifference:phaseSummary(outputs[0].frames.map((f,i)=>({carrierPhase:wrapPhase(f.carrierPhase-outputs[1].frames[i].carrierPhase),carrierAmplitude:Math.min(f.carrierAmplitude,outputs[1].frames[i].carrierAmplitude)}))),
    frames:outputs.map(x=>({channel:x.name,frames:x.frames}))
  };
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result));
  console.log(JSON.stringify({metadata:result.metadata,channels:result.channels.map(x=>({
    name:x.name,highBand:x.highBand,carrierPhase:x.carrierPhase,topChroma:x.chroma?.slice(0,7),noteRuns:x.dominantNoteRuns?.length
  })),artifact:output}));
}
if(require.main===module)main();
module.exports={fft};
