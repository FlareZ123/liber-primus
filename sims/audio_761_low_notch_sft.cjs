'use strict';
/**
 * Standalone fixed-boundary 2013 761.MP3 low-band notch gate.
 * Input: FFmpeg-decoded 44.1 kHz interleaved stereo float32 PCM.
 * Historical witness: notches below 500 Hz beginning at 1:56.
 * @module audio_761_low_notch_sft
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { fft } = require('./audio_761_spectral_modulation_probe.cjs');
const RATE = 44100, FFT_SIZE = 8192, HOP = 4096, MAX_HZ = 500;
const MAX_BIN = Math.floor(MAX_HZ * FFT_SIZE / RATE);
const CHANNELS = ['left', 'right', 'mid'];
const PERIODS = [['before',96,116],['after0',116,136],['after1',136,156],['end',156,167]];
const window = Float64Array.from({length:FFT_SIZE},(_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/(FFT_SIZE-1)));

/** @param {number[]} values @returns {number} */
function median(values) {
  const sorted=values.slice().sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
}

/** @param {Float32Array} samples @param {number} channel @returns {object} */
function analyze(samples,channel) {
  const sampleFrames=samples.length/2;
  const re=new Float64Array(FFT_SIZE),im=new Float64Array(FFT_SIZE);
  const power=PERIODS.map(()=>Array.from({length:MAX_BIN},()=>[]));
  const fraction=PERIODS.map(()=>Array.from({length:MAX_BIN},()=>[]));
  const counts=PERIODS.map(()=>0);
  for(let start=0;start+FFT_SIZE<=sampleFrames;start+=HOP) {
    const time=(start+FFT_SIZE/2)/RATE;
    const period=PERIODS.findIndex(([,a,b])=>time>=a&&time<b);
    if(period<0)continue;
    for(let i=0;i<FFT_SIZE;i++) {
      const k=(start+i)*2;
      const sample=channel===0?samples[k]:channel===1?samples[k+1]:(samples[k]+samples[k+1])/2;
      re[i]=sample*window[i];im[i]=0;
    }
    fft(re,im);
    const bins=new Array(MAX_BIN);
    let total=0;
    for(let k=1;k<=MAX_BIN;k++) {
      bins[k-1]=re[k]*re[k]+im[k]*im[k];
      total+=bins[k-1];
    }
    for(let k=0;k<MAX_BIN;k++) {
      power[period][k].push(bins[k]);
      fraction[period][k].push(bins[k]/(total+1e-30));
    }
    counts[period]++;
  }
  assert.ok(counts.every(n=>n>=90),'Missing declared pre/post windows');
  const rows=[];
  for(let k=0;k<MAX_BIN;k++) {
    const medians=fraction.map(p=>median(p[k]));
    const powers=power.map(p=>median(p[k]));
    rows.push({
      bin:k+1,hz:(k+1)*RATE/FFT_SIZE,
      relativeDecibels:medians.map(v=>10*Math.log10(v+1e-30)),
      absoluteDecibels:powers.map(v=>10*Math.log10(v+1e-30)),
      changeDecibels:[1,2,3].map(p=>10*Math.log10((medians[p]+1e-30)/(medians[0]+1e-30)))
    });
  }
  const deepest=rows.slice().sort((a,b)=>a.changeDecibels[0]-b.changeDecibels[0]).slice(0,10);
  const persistent=rows.filter(r=>r.changeDecibels.every(x=>x< -10));
  return {
    channel:CHANNELS[channel], sampleFrames, windowCounts:counts,
    deepestEarlySuppressions:deepest,
    persistentTenDecibelBins:persistent.map(r=>({bin:r.bin,hz:r.hz,changeDecibels:r.changeDecibels})),
    allBins:rows
  };
}

/** @returns {object} */
function positiveControl() {
  const make=(removed)=>{
    const re=new Float64Array(FFT_SIZE),im=new Float64Array(FFT_SIZE);
    for(let i=0;i<FFT_SIZE;i++) {
      const t=i/RATE;
      re[i]=(Math.sin(2*Math.PI*120*t)+(removed?0:Math.sin(2*Math.PI*242*t))+Math.sin(2*Math.PI*364*t))*window[i];
    }
    fft(re,im);
    return Array.from({length:MAX_BIN},(_,k)=>re[k+1]**2+im[k+1]**2);
  };
  const before=make(false),after=make(true);
  const k=Math.round(242*FFT_SIZE/RATE)-1;
  const delta=10*Math.log10((after[k]+1e-30)/(before[k]+1e-30));
  assert.ok(delta< -20,'Synthetic missing-tone control failed');
  return {removedFrequencyHz:242,bin:k+1,attenuationDecibels:delta,passed:true};
}

/** @param {string} target @param {string} content */
function atomicWrite(target,content) {
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const lock=target+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=target+'.tmp-'+process.pid;
  try {
    fs.writeFileSync(temp,content,'utf8');
    fs.renameSync(temp,target);
  } finally {
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function main() {
  const input=process.argv[2]||'/tmp/761-stereo.f32le';
  const output=process.argv[3]||'artifacts/audio-761-low-notch.json';
  const raw=fs.readFileSync(input);
  assert.equal(raw.length%8,0,'Expected interleaved stereo float32 samples');
  const samples=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
  const seconds=samples.length/2/RATE;
  assert.ok(seconds>=166&&seconds<169,'Unexpected source duration');
  const control=positiveControl();
  console.log('Original PCM frames',samples.length/2,'duration',seconds);
  console.log('Synthetic 242Hz notch:',control.attenuationDecibels.toFixed(3),'dB');
  const channels=CHANNELS.map((_,i)=>analyze(samples,i));
  const stable=channels[0].persistentTenDecibelBins.filter(x=>channels[1].persistentTenDecibelBins.some(y=>x.bin===y.bin)&&channels[2].persistentTenDecibelBins.some(y=>x.bin===y.bin));
  const result={
    originalAudio:'rtkd/iddqd@f2267b0/2013/02/761.MP3',
    originalAudioSha256:'83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460',
    historicalWitness:'2013 discussion: low-frequency empty notches below 500Hz after 1:56',
    analysis:{rate:RATE,fftSize:FFT_SIZE,hop:HOP,maxHz:MAX_HZ,periods:PERIODS},
    positiveControl:control,jointStableTenDecibelBins:stable,channels,
    interpretation:'Spectral distributions alone provide no source-selected decoder, pulse clock, GP29 address, or plaintext.'
  };
  atomicWrite(output,JSON.stringify(result,null,2)+'\n');
  for(const channel of channels) {
    console.log(channel.channel,'window frames',channel.windowCounts.join(','));
    console.log(channel.channel,'deepest:',channel.deepestEarlySuppressions.slice(0,5).map(x=>x.hz.toFixed(1)+'Hz:'+x.changeDecibels[0].toFixed(1)+'dB').join(', '));
    console.log(channel.channel,'persistent 10dB bins',channel.persistentTenDecibelBins.length);
  }
  console.log('Across left, right, mid persistent 10dB bins',stable.length,stable.map(x=>x.hz.toFixed(1)).join(','));
  console.log('Artifact',output);
}
if(require.main===module)main();
module.exports={analyze,positiveControl};
