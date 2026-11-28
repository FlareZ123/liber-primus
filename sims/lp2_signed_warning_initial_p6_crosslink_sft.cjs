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
console.log(JSON.stringify({status:"PASS",warning:warning.map((x)=>({index:x.index,label:x.label,first:x.gp[0],length:x.gp.length})),expectedInitials,expectedLengths,lengthVectorHits,initialVectorHits,jointVectorHits,sourceInitialShell:h4(retained.map((x)=>x.gp[0])),packetInitialShell:h4(packet.map((x)=>x.gp[0])),packetLengthShell:h4(packet.map((x)=>x.gp.length)),exactOrders:exactOrders.map((order)=>order.map((x)=>x.label))},null,2));
