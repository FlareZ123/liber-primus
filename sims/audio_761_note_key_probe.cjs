'use strict';
/**
 * Bounded source-motivated test of 761.MP3 musical note/interval/rhythm
 * sequences as GP29 additive key streams. Scans all offsets that leave 660
 * key symbols, both audio directions and signs, and the six documented
 * D-flat guitar open-string transpositions.
 * Run: node sims/audio_761_note_key_probe.cjs <analysis.json> <output.json>
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inputs}=require('./grid_section_column_keys.cjs');
const {screen}=require('./grid_section_keyskip_probe.cjs');
const {train}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const KEYLEN=660,WINDOW=220,MOD=29;
const OPEN_STRINGS_MIDI=[37,44,49,54,56,61];
const NAMES=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const mod=x=>((x%MOD)+MOD)%MOD;
function differences(values){return values.slice(1).map((x,i)=>mod(x-values[i]));}
function buildCandidates(audio){
  const byFrame=Object.fromEntries(audio.frames.map(x=>[x.channel,x.frames]));
  const bySummary=Object.fromEntries(audio.channels.map(x=>[x.name,x]));
  const candidates=[];
  function addSequence(label,values,shifts){
    if(values.length<KEYLEN)return;
    for(const reverse of [false,true]){
      const seq=reverse?values.slice().reverse():values;
      for(let offset=0;offset+KEYLEN<=seq.length;offset++){
        for(const shift of shifts){
          const key=Uint8Array.from(seq.slice(offset,offset+KEYLEN),v=>mod(v-shift));
          for(const sign of [-1,1])candidates.push({key,sign,tag:label+':'+(reverse?'reverse':'forward')+':offset'+offset+':shift'+shift+':sign'+sign});
        }
      }
    }
  }
  for(const channel of ['left','right']){
    const frameMidi=byFrame[channel].map(f=>f.dominantMidi);
    const events=bySummary[channel].dominantNoteRuns;
    const eventMidi=events.map(x=>x.midi);
    const eventDuration=events.map(x=>Math.round(x.durationSeconds*44100/4096));
    addSequence(channel+':frame-midi',frameMidi,[0,...OPEN_STRINGS_MIDI]);
    addSequence(channel+':frame-interval',differences(frameMidi),[0]);
    addSequence(channel+':event-midi',eventMidi,[0,...OPEN_STRINGS_MIDI]);
    addSequence(channel+':event-interval',differences(eventMidi),[0]);
    addSequence(channel+':event-duration-hops',eventDuration,[0]);
  }
  return candidates;
}
function main(){
  const input=process.argv[2]||'artifacts/audio-761-spectral-analysis.json';
  const output=process.argv[3]||'artifacts/audio-761-note-key-probe.json';
  const audio=JSON.parse(fs.readFileSync(input,'utf8'));
  assert.equal(audio.metadata.sampleRate,44100);
  assert.equal(audio.metadata.fftSize,8192);
  assert.equal(audio.metadata.hopSize,4096);
  const {groups}=inputs();
  const lm=train(fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'));
  const keys=buildCandidates(audio);
  assert.ok(keys.length>80000,'Expected broad but bounded note-key family');
  const results=[];
  for(let g=0;g<groups.length;g++){
    const r=screen(groups[g].slice(0,WINDOW),keys,lm);
    results.push({group:g,groupLength:groups[g].length,bestHeadScore:r.ranked[0].short,
      top:r.finalists.slice(0,5).map(item=>({key:item.tag,headScore:item.short,
        fullScore:item.full.perRune,inferredSkips:item.full.skips,
        first40:item.full.plain.slice(0,40).map(x=>NAMES[x]).join('')}))});
  }
  const result={metadata:{keyLength:KEYLEN,groupsTested:groups.length,candidateCount:keys.length,
    transforms:['absolute MIDI mod29','signed note intervals mod29','event duration in FFT hops mod29'],
    openStringOffsetsMIDI:OPEN_STRINGS_MIDI,headRunes:24,fullRunes:WINDOW,maxRejectedDrawsPerRune:2},groups:results};
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result));
  console.log(JSON.stringify({metadata:result.metadata,groups:results.map(x=>({group:x.group,bestHeadScore:x.bestHeadScore,top:x.top.slice(0,3)})),artifact:output}));
}
if(require.main===module)main();
module.exports={buildCandidates,differences};
