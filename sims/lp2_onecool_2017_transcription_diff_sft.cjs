"use strict";

const {execFileSync}=require("node:child_process");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");

const URL="https://gitlab.com/onecool/3301-public.git";
const OLD_REL="liber_primus/text/LiberPrimus_1_encrypted.txt";
const CURRENT=[
  "resources/lp2-transcription.txt",
  "resources/transcriptions/lp2_krisyotam_2017.txt",
  "resources/transcriptions/lp2-image-corrected.txt"
];

/** @param {Buffer|string} x */
function sha256(x){return crypto.createHash("sha256").update(x).digest("hex");}
/** @param {string} s */
function noWs(s){return Array.from(s).filter(c=>!/[\s\r\n]/u.test(c)).join("");}
/** @param {string} s */
function stats(s){
  const chars=Array.from(s);
  const counts={};
  for(const ch of chars) counts[ch]=(counts[ch]||0)+1;
  const runeCount=chars.filter(ch=>{
    const cp=ch.codePointAt(0);
    return cp>=0x16A0&&cp<=0x16FF;
  }).length;
  return {
    bytes:Buffer.byteLength(s),
    codepoints:chars.length,
    no_ws_codepoints:Array.from(noWs(s)).length,
    rune_count:runeCount,
    page_markers:counts["%"]||0,
    paragraph_markers:counts["&"]||0,
    segment_markers:counts["$"]||0,
    periods:counts["."]||0,
    hyphens:counts["-"]||0,
    slashes:counts["/"]||0,
    unique_chars:Object.keys(counts).sort().join("")
  };
}
/** @param {string} a @param {string} b @param {number} [limit] */
function positionalDiff(a,b,limit=80){
  const A=Array.from(a), B=Array.from(b), n=Math.min(A.length,B.length);
  let mismatch=0;
  const samples=[];
  for(let i=0;i<n;i++){
    if(A[i]!==B[i]){
      mismatch++;
      if(samples.length<limit) samples.push({index:i,a:A[i],b:B[i],a_cp:A[i].codePointAt(0),b_cp:B[i].codePointAt(0)});
    }
  }
  return {a_length:A.length,b_length:B.length,shared_prefix_length:n,mismatch_count:mismatch,length_delta:B.length-A.length,samples};
}
/** @param {string} a @param {string} b */
function pagesDiff(a,b){
  const A=a.split("%"),B=b.split("%");
  const rows=[];
  for(let i=0;i<Math.max(A.length,B.length);i++){
    const x=noWs(A[i]||""),y=noWs(B[i]||"");
    rows.push({page_index:i,a_len:Array.from(x).length,b_len:Array.from(y).length,exact:x===y,diff:positionalDiff(x,y,12)});
  }
  return rows.filter(x=>!x.exact);
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-transcription-"));
  const clone=path.join(tmp,"repo");
  execFileSync("git",["clone","--depth=1",URL,clone],{encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024});
  const oldPath=path.join(clone,...OLD_REL.split("/"));
  const old=fs.readFileSync(oldPath,"utf8");
  const out={
    generated_at:new Date().toISOString(),
    source_repo:URL,
    source_tip:execFileSync("git",["-C",clone,"rev-parse","HEAD"],{encoding:"utf8"}).trim(),
    source_path:OLD_REL,
    source_sha256:sha256(old),
    source_stats:stats(old),
    source_preview:old.slice(0,2500),
    comparisons:[]
  };
  for(const rel of CURRENT){
    const cur=fs.readFileSync(rel,"utf8");
    const A=noWs(old),B=noWs(cur);
    out.comparisons.push({
      current_path:rel,
      current_sha256:sha256(cur),
      current_stats:stats(cur),
      raw_exact:old===cur,
      no_ws_exact:A===B,
      no_ws_positional_diff:positionalDiff(A,B),
      differing_pages:pagesDiff(old,cur)
    });
  }
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2017-transcription-diff.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
