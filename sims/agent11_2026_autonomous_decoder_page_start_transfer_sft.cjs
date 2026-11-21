"use strict";
/**
 * Prespecified unseen-page 729-GP-rune transfer gate for pinned Nov2026
 * 27x27 autonomous C++ decoder. Each page-start window is the next exactly
 * 729 canonical source runes, crossing physical boundaries when needed.
 * No plaintext key, geometry tuning, or test-window postselection.
 * Usage (internal CI): node <script> decoder-executable original-matrix.txt
 * @module agent11_2026_autonomous_decoder_page_start_transfer_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const cp=require("node:child_process");
const corpus=JSON.parse(fs.readFileSync(
 path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {string} executable @param {string} source @param {string} cwd */
function runDecoder(executable,source,cwd) {
 const proc=cp.spawnSync(executable,[source,"--top","1"],{
  cwd,encoding:"utf8",timeout:15000,maxBuffer:2*1024*1024
 });
 const stdout=proc.stdout||"",stderr=proc.stderr||"";
 const saturated=proc.status===4&&/Depth limit 128 reached with active branches/.test(stderr);
 const timedOut=proc.error?.code==="ETIMEDOUT";
 assert.ok(proc.status===0||saturated||timedOut,stderr||stdout);
 const header=stdout.match(/#1\s+score=([-\d.]+)\s+blocks=(\d+)\s+runes=(\d+)/);
 const depth=stdout.match(/Last layer explored:\s*(\d+)/);
 return {score:header?Number(header[1]):null,
  blocks:header?Number(header[2]):0,
  runes:header?Number(header[3]):0,
  depth:depth?Number(depth[1]):saturated?128:0,
  saturated,timedOut,
  text:header?stdout.slice(header.index+header[0].length).trim().split(/\r?\n/)[0]:""};
}
/** Exhaust original page-start receiver windows; retain all controls. */
function run() {
 const binary=path.resolve(process.argv[2]),originalMatrix=path.resolve(process.argv[3]);
 const originalTokens=fs.readFileSync(originalMatrix,"utf8").trim().split(/\s+/);
 assert.equal(originalTokens.length,729);
 const pages=corpus.pages.filter(p=>p.page<=55);
 const first=pages.slice(0,3).flatMap(p=>p.indices);
 assert.equal(first.length,729);
 const normalization={"S/Z":"S","C/K":"C","U/V":"U","IA/IO":"IA"};
 const tokenForOrdinal=Array(29).fill(null);
 for(let i=0;i<729;i++) {
  const idx=corpus.translit.indexOf(normalization[originalTokens[i]]??originalTokens[i]);
  assert.equal(idx,first[i]);
  tokenForOrdinal[idx]=originalTokens[i];
 }
 assert.ok(tokenForOrdinal.every(Boolean),"Not all runes occur in the original matrix");
 const flat=pages.flatMap(p=>p.indices);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"agent11-page-transfer-"));
 let offset=0;const receivers=[];
 for(const page of pages) {
  if(page.indices.length===0){continue;}
  if(flat.length-offset<729)break;
  const selection=flat.slice(offset,offset+729);
  assert.equal(selection.length,729);
  const tokens=selection.map(i=>tokenForOrdinal[i]);
  const rows=Array.from({length:27},(_,r)=>tokens.slice(r*27,r*27+27).join(" "));
  const file=path.join(dir,`page-${page.page}-next729.txt`);
  fs.writeFileSync(file,rows.join("\n")+"\n");
  const d=runDecoder(binary,file,path.dirname(originalMatrix));
  receivers.push({page:page.page,startOffset:offset,...d});
  offset+=page.indices.length;
 }
 assert.equal(receivers[0].page,0);
 assert.deepEqual([receivers[0].blocks,receivers[0].runes],[39,118]);
 const others=receivers.slice(1);
 const scoreHistogram={};
 for(const row of others)scoreHistogram[row.depth]=(scoreHistogram[row.depth]??0)+1;
 const reported={
  original:{page:0,blocks:39,runes:118,score:receivers[0].score},
  totalOriginalStarts:receivers.length,
  distinctUnseenStarts:others.length,
  candidateLong:others.filter(x=>x.depth>=39),
  nonCensoredMax:Math.max(0,...others.filter(x=>!x.saturated).map(x=>x.depth)),
  depths:scoreHistogram,receivers,
  interpretation:"Frozen C++ grammar transferred to unseen original page-start 729 windows; no word-route retuning"
 };
 console.log(JSON.stringify(reported,null,2));
 return reported;
}
if(require.main===module)run();
module.exports={run,runDecoder};
