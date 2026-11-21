"use strict";
/**
 * Independently replays every rune of the pinned external November 2026
 * 39-block C++ reading against the canonical original LP2 p0-p2 corpus.
 * Also counts original-source coverage, key-source reuse, and derivation modes.
 * Run: node sims/agent11_2026_autonomous_decoder_trace_sft.cjs decoder matrix.txt
 * @module agent11_2026_autonomous_decoder_trace_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const cp=require("node:child_process");
const crypto=require("node:crypto");
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const original=corpus.pages.slice(0,3).flatMap(p=>p.indices);
const SHA="1f952dc948948bcd2bea4d5e5a61ba6175b501ec";
/** @param {number} n @returns {number|null} */
function phi(n) {
  if(!Number.isInteger(n)||n<1)return null;
  let result=n,remaining=n;
  for(let f=2;f*f<=remaining;f++)if(remaining%f===0) {
    result-=result/f;while(remaining%f===0)remaining/=f;
  }
  if(remaining>1)result-=result/remaining;
  return result;
}
/** @param {number} n @returns {number|null} */
function mu(n) {
  if(!Number.isInteger(n)||n<1)return null;
  let result=1,remaining=n;
  for(let f=2;f*f<=remaining;f++)if(remaining%f===0) {
    remaining/=f;result=-result;
    if(remaining%f===0)return 0;
  }
  if(remaining>1)result=-result;
  return result;
}
/** @param {string} text @returns {number[]} */
function tuples(text) {
  return [...text.matchAll(/\((\d+),\s*(\d+)\)/g)].map(m=>{
    const r=Number(m[1]),c=Number(m[2]);
    assert.ok(r>=1&&r<=27&&c>=1&&c<=27);
    return (r-1)*27+c-1;
  });
}
/** @param {string} input @returns {number[]} */
const csv=input=>input.split(",").map(s=>Number(s.trim()));
/** @param {number[]} key @returns {number[]} */
function phaseKey(key) {
  if(key.some(v=>v===0||v===null))return [];
  const s=key.map(v=>mu(phi(v)));
  if(s.some(v=>v===null))return [];
  const phase=((s.reduce((a,b)=>a+b,0)%3)+3)%3;
  return key.slice(phase).concat(key.slice(0,phase));
}
/** @param {number[]} raw @param {number[]} reported */
function sourceKeyMode(raw,reported) {
  const result=[];
  for(const reversed of [false,true])for(const transform of [false,true]) {
    const d=reversed?raw.slice().reverse():raw.slice();
    if(transform)d[1]=phi(d[1]);
    if(JSON.stringify(phaseKey(d))===JSON.stringify(reported))
      result.push({reversed,transform});
  }
  return result;
}
/** Run and verify the original matrix and the decoder's emitted trace. */
function run() {
  assert.equal(original.length,729);
  const exe=path.resolve(process.argv[2]);
  const matrixFile=path.resolve(process.argv[3]);
  const text=fs.readFileSync(matrixFile,"utf8");
  const tokens=text.trim().split(/\s+/);
  assert.equal(tokens.length,729);
  const aliases={"S/Z":"S","C/K":"C","U/V":"U","IA/IO":"IA"};
  const normalized=tokens.map(s=>aliases[s]??s);
  const mapped=normalized.map(s=>corpus.translit.indexOf(s));
  assert.ok(mapped.every(n=>n>=0),"Unrecognized external matrix token");
  assert.deepEqual(mapped,original,"External 729 original runes differ from canonical corpus");

  const call=cp.spawnSync(exe,[matrixFile,"--top","1","--trace"],{
    cwd:path.dirname(matrixFile),encoding:"utf8",timeout:30000,maxBuffer:5*1024*1024
  });
  assert.equal(call.error,undefined,call.error?.message);
  assert.equal(call.status,0,call.stderr||call.stdout);
  const lines=call.stdout.split(/\r?\n/);
  const m=lines[0].match(/^#1\s+score=([-\d.]+)\s+blocks=(\d+)\s+runes=(\d+)/);
  assert.ok(m);
  const blocks=[];
  for(const line of lines) {
    const t=line.match(/^(\d\d)\s+(.+?)\s+node=(\(\(.*?\)\))\s+cells=(\(\(.*?\)\))\s+key=\((.*?)\)\s+runes=\((.*?)\)/);
    if(!t)continue;
    blocks.push({number:Number(t[1]),word:t[2].trim(),node:tuples(t[3]),
      cells:tuples(t[4]),key:csv(t[5]),runes:csv(t[6])});
  }
  assert.deepEqual([Number(m[2]),Number(m[3]),blocks.length],[39,118,39]);
  const allCipher=[],allNodes=[],keyTypes={phiForward:0,plainForward:0,reversedOnly:0};
  const reversedOnly=[];
  for(const [i,b] of blocks.entries()) {
    assert.equal(b.number,i+1);
    assert.equal(b.node.length,3);
    assert.equal(b.key.length,3);
    assert.equal(b.cells.length,b.runes.length);
    assert.ok(b.key.every(n=>n>=0&&n<29));
    const rawNode=b.node.map(index=>original[index]);
    const modes=sourceKeyMode(rawNode,b.key);
    assert.ok(modes.length>=1,"No source-derived key for block "+b.number);
    const forward=modes.find(m=>!m.reversed);
    if(forward)keyTypes[forward.transform?"phiForward":"plainForward"]++;
    else {keyTypes.reversedOnly++;reversedOnly.push(b.number);}
    for(const [j,address] of b.cells.entries()) {
      const expected=(original[address]-b.key[j%3]+29)%29;
      assert.equal(expected,b.runes[j],"Original GP29 plaintext mismatch block "+b.number);
    }
    allCipher.push(...b.cells);allNodes.push(...b.node);
  }
  assert.deepEqual(keyTypes,{phiForward:28,plainForward:10,reversedOnly:1});
  assert.deepEqual(reversedOnly,[36]);
  assert.equal(allCipher.length,118);
  const cipherSet=new Set(allCipher),nodeSet=new Set(allNodes);
  const same=[...cipherSet].filter(v=>nodeSet.has(v)).length;
  assert.deepEqual([cipherSet.size,nodeSet.size,same],[106,97,21]);
  const sha=a=>crypto.createHash("sha256").update(JSON.stringify(a)).digest("hex");
  const summary={
    externalCommit:SHA,originalMatrixSha256:crypto.createHash("sha256").update(text).digest("hex"),
    originalMatrixCrosschecked:729,
    decodedRunesVerified:118,originalBlocks:39,score:Number(m[1]),
    distinctCiphertextCells:cipherSet.size,ciphertextUses:allCipher.length,
    distinctSourceNodeCells:nodeSet.size,overlapCells:same,
    totalUniqueTouched:new Set([...cipherSet,...nodeSet]).size,
    untouchedAsCiphertext:729-cipherSet.size,
    keyDerivation:keyTypes,reversalRequiredBlocks:reversedOnly,
    ciphertextCoordinateSha256:sha(allCipher),
    sourceNodeCoordinateSha256:sha(allNodes),
    interpretedEnglish:lines[1],
    claim:"Reversible arithmetic path; no independently selected 39-transition route"
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={run,sourceKeyMode,phaseKey,phi,mu};
