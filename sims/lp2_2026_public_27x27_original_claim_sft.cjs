"use strict";
/**
 * Source-pinned, reproducible audit of the independently claimed 2026
 * 27x27 / 38-block LP2 pp0–2 reading. Retains each creator-selected cell,
 * its printed key, its claimed plaintext, and the order of consumption.
 * A correct subtraction over hand-selected cells is a necessary but not
 * sufficient cryptanalytic solution. This test distinguishes the two.
 *
 * Source: 2retooz270703's published commit ab9d8190e60009179563ac21b2d750271c2782b3
 * Original ciphertext: resources/liber-primus/lp2-corpus.json.
 * Invoke: node sims/lp2_2026_public_27x27_original_claim_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = corpus.pages.filter(x => x.page < 3).flatMap(x => x.indices);
assert.equal(original.length, 729, "source physical pp0–2 must be 27^2 runes");
const SOURCE_REPO = "2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption";
const SOURCE_COMMIT = "ab9d8190e60009179563ac21b2d750271c2782b3";
const files = [
"01-as-i-go-the.md","02-weather.md","03-turns.md","04-cold.md",
"05-i-may.md","06-cry.md","07-now-the.md","08-idea.md",
"09-of.md","10-the.md","11-end.md","12-is.md",
"13-death.md","14-see.md","15-YOU.md","16-soon.md",
"17-then.md","18-the.md","19-key.md","20-is.md",
"21-to.md","22-go.md","23-to.md","24-the.md",
"25-east.md","26-of.md","27-the.md","28-map-life.md",
"29-may.md","30-be.md","31-the.md","32-death.md",
"33-of.md","34-you.md","35-go.md","36-do.md",
"37-as.md","38-i-ask.md",
];

/** @param {string} url @returns {Promise<string>} */
function readHttps(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {headers: {"User-Agent": "LiberPrimus-source-audit/1.0"}}, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Source fetch HTTP ${response.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      let bytes = 0;
      response.on("data", chunk => {
        bytes += chunk.length;
        if (bytes > 150000) response.destroy(new Error("unexpected source file size"));
        else chunks.push(chunk);
      });
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", reject);
    });
    request.setTimeout(20000, () => request.destroy(new Error("source fetch timeout")));
    request.on("error", reject);
  });
}
/** @param {string} s @returns {{tag:string,value:number}|null} */
function valueCell(s) {
  const m = /^([A-Z]+(?:\/[A-Z]+)?)\s*=\s*(\d+)$/.exec(s.replace(/`/g, "").trim());
  return m ? {tag:m[1],value:Number(m[2])} : null;
}
const aliases = new Map([["K",5],["Z",15],["IO",27],["ING",21]]);
/** @param {string} s @returns {number|null} */
function plaintextValue(s) {
  const t = s.replace(/[*`]/g,"").trim().replace(/\s*\(.*$/,"").replace(/\s*\/.*/,"");
  if (aliases.has(t)) return aliases.get(t);
  const x = corpus.translit.indexOf(t);
  return x >= 0 ? x : null;
}
/** @param {string} raw @returns {Array<{coord:number,c:number,k:number,p:number,row:number,col:number}>} */
function extractCipherRows(raw) {
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const parts = line.split("|").map(x=>x.trim()).filter(x=>x.length);
    const cellIndex=parts.findIndex(x=>/^\(\d+\s*,\s*\d+\)$/.test(x));
    if(cellIndex < 0 || parts.length-cellIndex < 5) continue;
    const [row,col]=parts[cellIndex].slice(1,-1).split(",").map(Number);
    const c=valueCell(parts[cellIndex+1]),k=valueCell(parts[cellIndex+2]);
    if(!c||!k)continue;
    const p=plaintextValue(parts[cellIndex+4]);
    if(p===null)continue;
    rows.push({coord:(row-1)*27+col-1,c:c.value,k:k.value,p,row,col});
  }
  return rows;
}
(async () => {
  const retrieved = [];
  for (let i=0;i<files.length;i+=6) {
    const batch=files.slice(i,i+6);
    retrieved.push(...await Promise.all(batch.map(async file=>{
      const url=`https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/plaintext-i-found/${file}`;
      const content=await readHttps(url);
      return {file,hash:crypto.createHash("sha256").update(content).digest("hex"),content};
    })));
  }
  const seen = new Set(), cells = [], blocks=[], mismatch=[];
  let expectedCursor=0, exactInverse=0;
  for(const {file,hash,content} of retrieved) {
    const canonical=content.split(/\n## Alternative route|\n<details>/i)[0];
    const records=extractCipherRows(canonical);
    assert(records.length>0,`No original source records found in ${file}`);
    const disclosedClaim=(content.match(/Decrypted rune sequence[^\n]*/i)||[])[0]||"";
    for(const a of records) {
      assert(a.row>=1 && a.row<=27 && a.col>=1 && a.col<=27);
      assert(a.c>=0 && a.c<29 && a.k>=0 && a.k<29 && a.p>=0 && a.p<29);
      const decoded=(a.c-a.k+29)%29;
      const originalValue=original[a.coord];
      if(decoded!==a.p || originalValue!==a.c)
        mismatch.push({file,coord:a.coord,declaredC:a.c,originalValue,declaredP:a.p,decoded});
      else exactInverse++;
      seen.add(a.coord);
      cells.push({...a,file});
    }
    blocks.push({file,sha256:hash,runicRows:records.length,
      originalStart:records[0].coord,originalEnd:records.at(-1).coord,
      contiguousReading:records.every((r,j)=>j===0||r.coord===records[j-1].coord+1),
      declaredOutput:disclosedClaim});
    expectedCursor+=records.length;
  }
  const positions=[...seen].sort((a,b)=>a-b);
  const duplicates=cells.length-seen.size;
  const runs=[];
  for(const pos of positions) {
    const last=runs.at(-1);
    if(last&&last.end+1===pos){last.end=pos;last.length++}
    else runs.push({start:pos,end:pos,length:1});
  }
  runs.sort((a,b)=>b.length-a.length);
  const transitions=[];
  for(let i=1;i<cells.length;i++) {
    if(cells[i].coord!==cells[i-1].coord+1)
      transitions.push({after:i,previous:cells[i-1].coord,next:cells[i].coord});
  }
  console.log(JSON.stringify({
    sourceRepository:`https://github.com/${SOURCE_REPO}/tree/${SOURCE_COMMIT}`,
    totalOriginalRunes:original.length,sourceFiles:files.length,
    claimedConsumedCiphertextPositions:cells.length,
    distinctOriginalCiphertextPositions:seen.size,
    repeatedSourceUses:duplicates,
    exactOriginalCiphertextAndInverseRows:exactInverse,
    mismatches:mismatch.slice(0,16),totalMismatches:mismatch.length,
    longestContiguousOriginalReadingRuns:runs.slice(0,8),
    blockBoundariesOrDirectionsBreakingOriginalReading:transitions.length,
    firstNonconsecutiveTransitions:transitions.slice(0,10),
    blocks,
    status:"This independently tests original-cell arithmetic and coverage; no post-selected route proves the plaintext or predicts an untouched 40-rune holdout."
  },null,2));
  assert.equal(cells.length,115,"author's own claimed total is 115 runes");
  assert.equal(mismatch.length,0,"original scans/claimed modular outputs must agree");
  assert(runs[0].length<40,"author's selected nodes do not cover even 40 consecutive original unknown runes");
})().catch(error => {console.error(error);process.exitCode=1});
