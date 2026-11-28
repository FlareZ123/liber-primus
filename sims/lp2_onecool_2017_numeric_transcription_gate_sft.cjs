"use strict";

const {execFileSync}=require("node:child_process");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const crypto=require("node:crypto");

const OLD_URL="https://gitlab.com/onecool/3301-public.git";
const CURRENT_PATH="resources/transcriptions/lp2-image-corrected.txt";

/** @param {Buffer|string} x */
function sha256(x){return crypto.createHash("sha256").update(x).digest("hex");}

/** @param {unknown} value */
function flattenStrings(value){
  if(typeof value==="string") return [value];
  if(Array.isArray(value)) return value.flatMap(flattenStrings);
  return [];
}

/** @param {string[]} parts */
function oldTokens(parts){
  const runes=[];
  const explicitWordBoundaries=[];
  for(const part of parts){
    const tokens=part.match(/\d+|-/g)||[];
    for(const token of tokens){
      if(token==="-"){
        if(runes.length>0) explicitWordBoundaries.push(runes.length);
      }else{
        const n=Number(token);
        if(!Number.isInteger(n)||n<0||n>28) throw new Error("invalid old rune index "+token);
        runes.push(n);
      }
    }
  }
  return {
    runes,
    explicitWordBoundaries:[...new Set(explicitWordBoundaries)].sort((a,b)=>a-b)
  };
}

/** @param {string} text @param {Map<string,number>} runeToIndex */
function currentTokens(text,runeToIndex){
  const runes=[];
  const explicitWordBoundaries=[];
  for(const ch of Array.from(text)){
    if(runeToIndex.has(ch)){
      runes.push(runeToIndex.get(ch));
    }else if(ch==="-"){
      if(runes.length>0) explicitWordBoundaries.push(runes.length);
    }
  }
  return {
    runes,
    explicitWordBoundaries:[...new Set(explicitWordBoundaries)].sort((a,b)=>a-b)
  };
}

/** @param {number[]} a @param {number[]} b */
function arrayDiff(a,b){
  const n=Math.min(a.length,b.length);
  const mismatches=[];
  for(let i=0;i<n;i++){
    if(a[i]!==b[i] && mismatches.length<80) mismatches.push({offset:i,old:a[i],current:b[i]});
  }
  let mismatchCount=0;
  for(let i=0;i<n;i++) if(a[i]!==b[i]) mismatchCount++;
  return {
    old_length:a.length,
    current_length:b.length,
    mismatch_count:mismatchCount,
    length_delta:b.length-a.length,
    samples:mismatches
  };
}

/** @param {number[]} a @param {number[]} b */
function setDiff(a,b){
  const A=new Set(a),B=new Set(b);
  return {
    old_only:a.filter(x=>!B.has(x)),
    current_only:b.filter(x=>!A.has(x)),
    old_count:a.length,
    current_count:b.length
  };
}

/** @param {string} clone */
function loadRuneMap(clone){
  const raw=JSON.parse(fs.readFileSync(path.join(clone,"liber_primus","rune.json"),"utf8"));
  const runeToIndex=new Map();
  const indexToRune=[];
  for(let i=0;i<=28;i++){
    const entry=raw[String(i)];
    if(!entry||typeof entry.rune!=="string") throw new Error("missing rune map "+i);
    runeToIndex.set(entry.rune,i);
    indexToRune[i]=entry.rune;
  }
  if(runeToIndex.size!==29) throw new Error("historical rune map is not bijective");
  return {runeToIndex,indexToRune};
}

function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"onecool-numeric-gate-"));
  const clone=path.join(tmp,"old");
  execFileSync("git",["clone","--depth=1",OLD_URL,clone],{
    encoding:"utf8",timeout:180000,maxBuffer:128*1024*1024
  });

  const tip=execFileSync("git",["-C",clone,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  const {runeToIndex,indexToRune}=loadRuneMap(clone);
  const current=fs.readFileSync(CURRENT_PATH,"utf8");
  const segments=current.split("%");
  if(segments.length!==57) throw new Error("expected 57 rune-bearing LP2 segments, got "+segments.length);

  const pages=[];
  let oldTotal=0,currentTotal=0;
  let oldBoundaryTotal=0,currentBoundaryTotal=0;
  for(let page=0;page<=57;page++){
    const rel=path.join(clone,"liber_primus","json",String(page).padStart(2,"0")+".json");
    const obj=JSON.parse(fs.readFileSync(rel,"utf8"));
    if(obj.LP!=="2"||Number(obj.page_number)!==page) throw new Error("page identity mismatch "+page);
    const old=oldTokens(flattenStrings(obj.ciphertext));

    // Physical LP2 page 50 is numeric-only and therefore has no rune-bearing
    // segment in the current canonical text. Pages 51..57 shift by one.
    const segmentIndex=page===50?null:(page<50?page:page-1);
    const cur=segmentIndex===null?{runes:[],explicitWordBoundaries:[]}:
      currentTokens(segments[segmentIndex],runeToIndex);

    const runeDiff=arrayDiff(old.runes,cur.runes);
    const boundaryDiff=setDiff(old.explicitWordBoundaries,cur.explicitWordBoundaries);
    const exactRunes=runeDiff.mismatch_count===0&&runeDiff.length_delta===0;
    const exactWordBoundaries=boundaryDiff.old_only.length===0&&boundaryDiff.current_only.length===0;

    oldTotal+=old.runes.length;
    currentTotal+=cur.runes.length;
    oldBoundaryTotal+=old.explicitWordBoundaries.length;
    currentBoundaryTotal+=cur.explicitWordBoundaries.length;

    pages.push({
      page,
      segment_index:segmentIndex,
      old_json:path.relative(clone,rel).replaceAll("\\","/"),
      old_runes:old.runes.length,
      current_runes:cur.runes.length,
      exact_runes:exactRunes,
      rune_diff:runeDiff,
      old_word_boundaries:old.explicitWordBoundaries.length,
      current_word_boundaries:cur.explicitWordBoundaries.length,
      exact_word_boundaries:exactWordBoundaries,
      word_boundary_diff:boundaryDiff,
      old_start:old.runes.slice(0,24).map(x=>indexToRune[x]).join(""),
      current_start:cur.runes.slice(0,24).map(x=>indexToRune[x]).join("")
    });
  }

  const out={
    generated_at:new Date().toISOString(),
    source_repo:OLD_URL,
    source_tip:tip,
    source_mapping_path:"liber_primus/rune.json",
    current_path:CURRENT_PATH,
    current_sha256:sha256(current),
    historical_page_count:pages.length,
    rune_bearing_page_count:pages.filter(p=>p.old_runes>0).length,
    totals:{
      historical_runes:oldTotal,
      current_runes:currentTotal,
      historical_explicit_word_boundaries:oldBoundaryTotal,
      current_explicit_word_boundaries:currentBoundaryTotal
    },
    exact_rune_pages:pages.filter(p=>p.exact_runes).map(p=>p.page),
    differing_rune_pages:pages.filter(p=>!p.exact_runes).map(p=>p.page),
    exact_word_boundary_pages:pages.filter(p=>p.exact_word_boundaries).map(p=>p.page),
    differing_word_boundary_pages:pages.filter(p=>!p.exact_word_boundaries).map(p=>p.page),
    pages
  };

  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||os.tmpdir(),"onecool-2017-numeric-transcription-gate.json"),JSON.stringify(out,null,2));
  console.log(JSON.stringify(out,null,2));
}
try{main();}catch(e){console.error(e);process.exitCode=1;}
