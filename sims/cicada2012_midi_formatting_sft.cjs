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
 const gap=letters.map((m,i)=>{if(!i)return 0;const s=raw.slice(letters[i-1].index+1,m.index);return s.length?24+96*(s.match(/,/g)||[]).length+192*(s.match(/\./g)||[]).length+384*(s.match(/\n/g)||[]).length:0});
 const diff=t[2].on.flatMap((e,i)=>e.delta===gap[i%238]?[]:[[i,gap[i%238],e.delta]]);
 assert.deepEqual(diff,[[3,24,0],[238,0,576],[476,0,576]]);
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
