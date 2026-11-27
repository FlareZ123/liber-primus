"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ptr=JSON.parse(read("resources/external/cicada2012-midi-source.json"));
/** @param {Buffer} b */
function parse(b){
 assert.equal(b.toString("ascii",0,4),"MThd");
 let p=8+b.readUInt32BE(4);const tracks=[];
 for(let t=0;t<b.readUInt16BE(10);t++){
  assert.equal(b.toString("ascii",p,p+4),"MTrk");const end=p+8+b.readUInt32BE(p+4);p+=8;
  let status=0;const on=[],off=[];
  const vlq=()=>{let x=0,y;do{y=b[p++];x=(x<<7)|(y&127)}while(y&128);return x};
  while(p<end){
   const delta=vlq();let e=b[p];if(e>=128){p++;status=e}else e=status;
   if(e===255){p++;const n=vlq();p+=n;continue}
   if(e===240||e===247){const n=vlq();p+=n;continue}
   const hi=e&240,pitch=b[p++],vel=(hi===192||hi===208)?0:b[p++];
   if(hi===144&&vel>0)on.push({pitch,delta});
   if(hi===128||(hi===144&&vel===0))off.push({pitch,delta});
  }
  assert.equal(p,end);tracks.push({on,off});
 }
 assert.equal(p,b.length);return tracks;
}
function decode(t,alphabet){const v=t.off.map(e=>e.pitch+e.delta),u=[...new Set(v)].sort((a,b)=>a-b);assert.equal(u.length,alphabet.length);return v.map(x=>alphabet[u.indexOf(x)]).join("")}
const mod=x=>((x%29)+29)%29;
function ioc(x){const f=Array(29).fill(0);x.forEach(v=>f[v]++);return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1))}
async function main(){
 const b=process.argv[2]?fs.readFileSync(process.argv[2]):Buffer.from(await(await fetch(ptr.raw_url)).arrayBuffer());
 assert.equal(b.length,10889);assert.equal(crypto.createHash("sha256").update(b).digest("hex"),ptr.midi_artifact.sha256);
 const t=parse(b);assert.deepEqual(t.map(x=>[x.on.length,x.off.length]),[[0,0],[558,558],[714,714]]);
 const raw=read("resources/historical/cicada2012-midi-email.asc").replace(/\r/g,"").split("Let the Chorus be your guide to the depths :")[1].split("Good luck.")[0].trim();
 const letters=[...raw.matchAll(/[a-z]/gi)],text=letters.map(x=>x[0]).join("").toLowerCase();
 assert.equal(text.length,238);assert.equal(decode(t[2],"abcdefghijklmnoprstuvwy"),text.repeat(3));
 // Learn the rectangular alphabet from the visible signed chorus alone.
 const first=t[2].off.slice(0,238),unique=a=>[...new Set(a)].sort((a,b)=>a-b);
 const pitches=unique(first.map(e=>e.pitch)),durations=unique(first.map(e=>e.delta));
 assert.deepEqual(pitches,[43,44,46,48,49,51,53,55]);
 assert.deepEqual(durations,[24,96,192,384]);
 const gridDecode=(events,octave)=>events.map(e=>{
  const c=pitches.indexOf(e.pitch-octave),r=durations.indexOf(e.delta);
  assert.ok(c>=0&&r>=0&&8*r+c<26);
  return String.fromCharCode(97+8*r+c);
 }).join("");
 assert.equal(gridDecode(first,0),text);
 assert.equal(gridDecode(t[2].off.slice(238),0),text.repeat(2));
 // One-octave higher: independent physical track, no fitted alphabet gaps.
 const track1=gridDecode(t[1].off,12);
 assert.equal(crypto.createHash("sha256").update(track1).digest("hex"),"8647147926d83ceb2ca73233121a35e5d9e8bbbbbbd8c709e747fb5ba8022d2f");
 const unseen=[...track1].filter(c=>!text.includes(c));
 assert.equal(unseen.length,5);
 assert.deepEqual([...new Set(unseen)].sort(),["q","x","z"]);
 for(const [events,plain,octave] of [[t[1].off,track1,12],[t[2].off,text.repeat(3),0]]){
  events.forEach((e,i)=>{const n=plain.charCodeAt(i)-97;assert.equal(e.pitch,pitches[n%8]+octave);assert.equal(e.delta,durations[Math.floor(n/8)])});
 }
 console.log(JSON.stringify({chorusPitchDurationGrid:{pitches,durations,heldoutTrack1:track1.length,unseenLetters:unseen.join(""),roundTrip:1272}},null,2));
 const gap=letters.map((m,i)=>{if(!i)return 0;const s=raw.slice(letters[i-1].index+1,m.index);return s.length?24+96*(s.match(/,/g)||[]).length+192*(s.match(/\./g)||[]).length+384*(s.match(/\n/g)||[]).length:0});
 const diff=t[2].on.flatMap((e,i)=>e.delta===gap[i%238]?[]:[[i,gap[i%238],e.delta]]);
 assert.deepEqual(diff,[[3,24,0],[238,0,576],[476,0,576]]);
 // Authored within-artifact formatting fault: compare complete three-cycle
 // note-pair tapes before and after the independently visible LET/THE gap.
 const chorus=t[2],cycles=Array.from({length:3},(_,k)=>{
  let tick=0;
  // Absolute clock: all 714 pairs in this track, including cycle-start gaps.
  for(let i=0;i<238*k;i++)tick+=chorus.on[i].delta+chorus.off[i].delta;
  return Array.from({length:238},(_,j)=>{
   const i=238*k+j,on=chorus.on[i],off=chorus.off[i];
   tick+=on.delta;const start=tick;tick+=off.delta;
   return {on,off,start,end:tick};
  });
 });
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
 const equalEvent=(a,b)=>a.on.pitch===b.on.pitch&&a.off.pitch===b.off.pitch&&a.off.delta===b.off.delta;
 const absoluteDiffs=[[],[],[]],pairs=[[0,1],[0,2],[1,2]];
 for(let k=0;k<pairs.length;k++){
  const [a,b]=pairs[k];
  for(let i=0;i<238;i++){
   const x=cycles[a][i],y=cycles[b][i];
   assert.ok(equalEvent(x,y));
   assert.equal(y.end-x.end,y.start-x.start);
   if(i!==0&&i!==3)assert.equal(x.on.delta,y.on.delta);
   absoluteDiffs[k].push(y.start-x.start);
  }
 }
 const fittedGCD=absoluteDiffs.flatMap(a=>a.slice(0,4)).reduce(gcd,0);
 assert.equal(fittedGCD,24);
 assert.ok(absoluteDiffs.every(a=>a.slice(4).every(d=>d%fittedGCD===0)));
 assert.deepEqual(absoluteDiffs.map(a=>[...new Set(a)]),[[31488,31512],[63000,63024],[31512]]);
 const relativeEnds=cycles.map(a=>a.at(-1).end-a[0].start);
 assert.deepEqual(relativeEnds,[30912,30936,30936]);
 console.log(JSON.stringify({authoredChorusFault:{position:3,gaps:cycles.map(a=>a[3].on.delta),equalNotePairs:714,heldPairComparisons:3*234,relativeEnds,absoluteOffsets:absoluteDiffs.map(a=>[...new Set(a)]),fittedGCD,phaseInjectiveGlobalTickModuli:[1,2,3,4,6,8,12,24]}},null,2));
 const p=decode(t[1],"abcdefghiklmnopqrstuvwxyz"),start=t[1].on.findIndex(e=>e.delta===768),entries=[""];
 assert.ok(p.slice(0,start).endsWith("yourwordsare"));
 for(let i=start;i<p.length;i++){const d=t[1].on[i].delta;if(i!==start){assert.ok(d===0||d===384);if(d===384)entries.push("")}entries[entries.length-1]+=p[i]}
 assert.equal(entries.length,50);assert.equal(new Set(entries).size,48);
 assert.deepEqual(entries.slice(4,6),["bird","watch"]);
 assert.equal(entries.join(" "),read("resources/historical/cicada2012-midi-50-entries.txt").trim());
 assert.equal(entries.join(" ").replace("bird watch","birdwatch"),read("resources/historical/cicada2012-midi-49-words.txt").trim());
 const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const groups=read("resources/liber-primus/lp2-transcription.txt").split("%")[36].split("-").map(s=>[...s].filter(x=>g.runes.includes(x)).map(x=>g.runes.indexOf(x))).filter(x=>x.length);
 assert.equal(groups.length,50);assert.deepEqual(groups.flat(),g.pages.find(x=>x.page===36).indices);
 const map=new Map(g.translit.map((x,i)=>[x,i]));
 const keys=entries.map(w=>{let s=w.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/Q/g,"C"),a=[];while(s){const x=[s.slice(0,2),s[0]].find(x=>map.has(x));assert.ok(x);a.push(map.get(x));s=s.slice(x.length)}return a});
 const apply=(a,sign)=>a.map((w,j)=>w.map((c,i)=>mod(c+sign*keys[j][i%keys[j].length])));
 const result=[];
 for(const sign of [-1,1]){
  const plain=apply(groups,sign);assert.deepEqual(apply(plain,-sign),groups);
  const bad=[];groups.forEach((w,j)=>{let states=new Set([0]);for(const c of w){const next=new Set();for(const k of states){if(c===0)next.add(k);if(mod(c+sign*keys[j][k%keys[j].length])!==0)next.add(k+1)}states=next}if(!states.size)bad.push(j)});
  result.push({sign,ioc:ioc(plain.flat()),bad,preview:plain.map(w=>w.map(x=>g.translit[x]).join("")).join(" ")});
 }
 assert.deepEqual(result.map(x=>x.bad),[[19,26,34,35,40,46],[5,14,16,17,21,42,45]]);
 assert.ok(Math.abs(result[0].ioc-.0330461298443428)<1e-12);assert.ok(Math.abs(result[1].ioc-.03318795872779492)<1e-12);
 const addresses=keys.map((k,i)=>{const sum=k.reduce((s,x)=>s+g.prime[x],0);return{word:entries[i],ordinal:i+1,sum,page:sum%58,cell:Math.floor(sum/58)}});
 assert.deepEqual(addresses.filter(x=>x.page===50).map(x=>[x.ordinal,x.cell]),[[9,5],[11,0],[15,1],[17,3],[43,7]]);
 console.log(JSON.stringify({matches:714-diff.length,diff,entries,p36Pieces:groups.length,originalIoC:ioc(groups.flat()),result,addresses},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
