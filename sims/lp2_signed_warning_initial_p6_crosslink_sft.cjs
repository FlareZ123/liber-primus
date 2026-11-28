"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8").replace(/\\r/g, ""); }
/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }
/** @param {number[]} v @returns {number[]} */
function h4(v) { return [mod29(v[0]-v[3]), mod29(v[1]-v[2]), mod29(v[1]+v[2]), mod29(v[0]+v[3])]; }

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const gpTokens = corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number[]} */
function gp(word) {
  const n = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for (let i=0;i<n.length;) {
    if (n.startsWith("ING",i)) { out.push(21); i+=3; continue; }
    if (n.startsWith("IO",i)) { out.push(27); i+=2; continue; }
    const t=gpTokens.find((x)=>n.startsWith(x.symbol,i)); assert.ok(t,"unmapped "+n.slice(i)); out.push(t.value); i+=t.symbol.length;
  }
  return out;
}
const clear=signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter((t)=>/^[A-Za-z]+$/.test(t)).map((label,index)=>({index,label:label.toUpperCase(),gp:gp(label)}));
assert.equal(signed.length,43);
const g=5,a=6,b=15,K=2,e=3,q=4;
const warning=signed.slice(38,43);
assert.deepEqual(warning.map((x)=>x.label),["BEWARE","FALSE","PATHS","VERIFY","OPENPGP"]);
const expectedInitials=[mod29(b+K),0,mod29(b-K),mod29(a-g),e];
const expectedLengths=[a,g,a-K,a,g+K];
assert.deepEqual(warning.map((x)=>x.gp[0]),expectedInitials);
assert.deepEqual(warning.map((x)=>x.gp.length),expectedLengths);
const lengthVectorHits=[],initialVectorHits=[],jointVectorHits=[];
for (let start=0; start+5<=signed.length; start+=1) {
  const block=signed.slice(start,start+5);
  const ls=block.map((x)=>x.gp.length).join(","), is=block.map((x)=>x.gp[0]).join(",");
  if (ls===expectedLengths.join(",")) lengthVectorHits.push(start);
  if (is===expectedInitials.join(",")) initialVectorHits.push(start);
  if (ls===expectedLengths.join(",") && is===expectedInitials.join(",")) jointVectorHits.push(start);
}
assert.deepEqual(lengthVectorHits,[38]);
assert.deepEqual(initialVectorHits,[38]);
assert.deepEqual(jointVectorHits,[38]);
const retained=warning.filter((x)=>x.label!=="FALSE");
assert.deepEqual(h4(retained.map((x)=>x.gp[0])),[mod29(-b),a*K,mod29(-b),q*g]);
assert.deepEqual(h4(retained.map((x)=>x.gp.length)),[mod29(g-a),mod29(-K),2*g,mod29(b-K)]);
const packetLabels=["OPENPGP","PATHS","VERIFY","BEWARE"];
const packet=packetLabels.map((label)=>retained.find((x)=>x.label===label));
assert.ok(packet.every(Boolean));
assert.deepEqual(h4(packet.map((x)=>x.gp[0])),[b,a*K,mod29(-b),q*g]);
assert.deepEqual(h4(packet.map((x)=>x.gp.length)),[a-g,mod29(-K),2*g,b-K]);
/** @param {any[]} values @returns {any[][]} */
function perms(values) { if(values.length<=1)return [values.slice()]; const out=[]; for(let i=0;i<values.length;i++){const rest=values.slice(0,i).concat(values.slice(i+1)); for(const tail of perms(rest))out.push([values[i],...tail]);} return out; }
const target=[b,a*K,mod29(-b),q*g];
const exactOrders=perms(retained).filter((order)=>h4(order.map((x)=>x.gp[0])).join(",")===target.join(","));
assert.deepEqual(exactOrders.map((order)=>order.map((x)=>x.label)),[packetLabels]);
// Natural signed-tail clause selectors for the p6 key packet.
assert.deepEqual(signed.slice(36,38).map((x)=>x.label),["GOOD","LUCK"]);
assert.deepEqual(signed.slice(36,38).map((x)=>x.gp[0]),[a,q*g]);
const verifyOpenpgpInitials=signed.slice(41,43).map((x)=>x.gp[0]);
assert.deepEqual(verifyOpenpgpInitials,[a-g,e]);
assert.deepEqual([mod29(verifyOpenpgpInitials[0]-verifyOpenpgpInitials[1]),mod29(verifyOpenpgpInitials[0]+verifyOpenpgpInitials[1])],[mod29(-K),q]);

const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\\s*%\\s*$/m).slice(0,55);
const canonicalWords=[];
for(let block=0;block<parts.length;block++){
  const page=block>=50?block+1:block; let offset=0,start=-1,values=[];
  const flush=()=>{if(values.length){canonicalWords.push({page,start,end:start+values.length,len:values.length,values:values.slice()});values=[];}};
  for(const ch of parts[block]){const v=runeIndex.get(ch);if(v!==undefined){if(values.length===0)start=offset;values.push(v);offset++;}else if(!/[\\s/]/u.test(ch))flush();}
  flush();
}
const redWords=[];
for(const pageInk of ink.pages){for(const span of pageInk.red_spans||[]){for(const word of canonicalWords){if(word.page===pageInk.page&&word.start>=span.start&&word.end<=span.start+span.length)redWords.push({...word,spanStart:span.start});}}}
const redSelectorCandidates=redWords.filter((word)=>word.len===q&&word.values.includes(mod29(-K)));
assert.deepEqual(redSelectorCandidates,[{page:6,start:76,end:80,len:4,values:[6,27,15,17],spanStart:71}]);
const p6RedWords=redWords.filter((word)=>word.page===6&&word.spanStart===71).sort((x,y)=>x.start-y.start);
assert.deepEqual(p6RedWords.map((word)=>word.values),[[24,16,14,17],[19],[6,27,15,17],[14,12]]);
const selectedW3=redSelectorCandidates[0];
const selectedW4=p6RedWords.find((word)=>word.start===selectedW3.end);
assert.ok(selectedW4);
const circumference=[selectedW3.values[0],selectedW4.values[selectedW4.values.length-1]];
assert.deepEqual(circumference,[a,a*K]);
const p6Ink=ink.pages.find((page)=>page.page===6);
assert.ok(p6Ink.large_punctuation.some((mark)=>mark[0]===selectedW4.end&&mark[1]===13&&mark[2]==="red"));

const p6Lines=[]; let p6Offset=0;
for(const rawLine of parts[6].split("\\n")){const count=[...rawLine].filter((ch)=>runeIndex.has(ch)).length;if(!count)continue;p6Lines.push({start:p6Offset,end:p6Offset+count,count});p6Offset+=count;}
const redStart=71,redEnd=82;
const blackCounts=p6Lines.map((row)=>{const overlap=Math.max(0,Math.min(row.end,redEnd)-Math.max(row.start,redStart));return {...row,black:row.count-overlap};});
const upper=blackCounts.filter((row)=>row.end<=redStart).map((row)=>row.black);
const lower=blackCounts.filter((row)=>row.start>=redStart).map((row)=>row.black);
assert.deepEqual(upper,[20,24,24,3]);
assert.deepEqual(lower,[7,19,20,24,22,22]);
const once=(values,target)=>values.filter((value)=>value===target).length;
const balanced=[...new Set(upper)].filter((value)=>once(upper,value)===1&&once(lower,value)===1);
assert.deepEqual(balanced,[q*g]);
assert.equal(signed[37].label,"LUCK");
assert.equal(signed[37].gp[0],balanced[0]);
const signedSelectedP6Key=[balanced[0],balanced[0],circumference[1],circumference[0]];
assert.deepEqual(signedSelectedP6Key,[20,20,12,6]);
const schedulerSegments = [
  { seed:[3,7], key:[23,3,24,1,18,17,27], shell:[25,21,15,20,6,13,1] },
  { seed:[13,4], key:[9,13,18,13], shell:[25,22,24,2] },
  { seed:[1,6], key:[28,25,21,3,6,17], shell:[11,16,19,2,18,24] },
  { seed:[17,6], key:[12,2,0,17,12,7], shell:[5,19,19,14,12,17] },
];
const inv2=15;
const h2=(s)=>[mod29(s[0]-s[1]),mod29(s[0]+s[1])];
const h2inv=(s)=>[mod29((s[0]+s[1])*inv2),mod29((s[1]-s[0])*inv2)];
function stateReadout(seed,length,step,phase,A,B,C){let state=seed.slice();for(let i=0;i<phase;i++)state=step(state);const out=[];for(let i=0;i<length;i++){out.push(mod29(A*state[0]+B*state[1]+C));state=step(state);}return out;}
let hStateSchedulerHits=0;
for(const step of [h2,h2inv])for(let phase=0;phase<8;phase++)for(let A=0;A<29;A++)for(let B=0;B<29;B++)for(let C=0;C<29;C++)for(const targetType of ["key","shell"]){let ok=true;for(const segment of schedulerSegments){if(stateReadout(segment.seed,segment[targetType].length,step,phase,A,B,C).join(",")!==segment[targetType].join(",")){ok=false;break;}}if(ok)hStateSchedulerHits++;}
assert.equal(hStateSchedulerHits,0);
function recurrenceReadout(seed,length,A,B,C,reverse,includeSeeds){let u=reverse?seed[1]:seed[0],v=reverse?seed[0]:seed[1];const out=[];if(includeSeeds){if(length>0)out.push(u);if(length>1)out.push(v);}while(out.length<length){const z=mod29(A*v+B*u+C);u=v;v=z;out.push(z);}return out.slice(0,length);}
let recurrenceSchedulerHits=0;
for(const reverse of [false,true])for(const includeSeeds of [false,true])for(let A=0;A<29;A++)for(let B=0;B<29;B++)for(let C=0;C<29;C++)for(const targetType of ["key","shell"]){let ok=true;for(const segment of schedulerSegments){if(recurrenceReadout(segment.seed,segment[targetType].length,A,B,C,reverse,includeSeeds).join(",")!==segment[targetType].join(",")){ok=false;break;}}if(ok)recurrenceSchedulerHits++;}
assert.equal(recurrenceSchedulerHits,0);
console.log(JSON.stringify({status:"PASS",warning:warning.map((x)=>({index:x.index,label:x.label,first:x.gp[0],length:x.gp.length})),expectedInitials,expectedLengths,lengthVectorHits,initialVectorHits,jointVectorHits,sourceInitialShell:h4(retained.map((x)=>x.gp[0])),packetInitialShell:h4(packet.map((x)=>x.gp[0])),packetLengthShell:h4(packet.map((x)=>x.gp.length)),exactOrders:exactOrders.map((order)=>order.map((x)=>x.label)),hStateSchedulerHits,recurrenceSchedulerHits,redSelectorCandidates,balanced,signedSelectedP6Key},null,2));
