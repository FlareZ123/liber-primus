"use strict";

/**
 * Original-source rune/binary/large-punctuation clock map for LP2 pp49-51,
 * cross-checked against the authentic solved p56 large-dot hash control.
 *
 * This is an original-source coordinate model, not a decryption. It captures
 * the precise candidate 66-rune / 256-byte / 92-rune sequence and gives a
 * lossless "only runes count" 158-rune clock for independent cipher proposals.
 * Those proposals must justify using the solved-p56 clock on unsolved pages.
 *
 * Run with Node 22: node sims/lp2_tendot_binary_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname,"..","resources","liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,"lp2-corpus.json"),"utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT,"lp2-ink-annotations.json"),"utf8"));
const table = JSON.parse(fs.readFileSync(path.join(ROOT,"base60-grid.json"),"utf8"));
const byPage = new Map(corpus.pages.map(p => [p.page,p]));
const byInk = new Map(ink.pages.map(p => [p.page,p]));
const runePage = p => byPage.get(p).indices;
const marks = p => byInk.get(p).large_punctuation || [];

/**
 * Build a lossless, print-coordinate-preserving 158-rune sequence across
 * the source nonrunic numerical table on pp49, 50, and 51.
 * @returns {{source: {page:number,localOffset:number,bookOffset:number,
 *   gp:number}[], positionsByPage:Map<number,number[]>}}
 */
function originalBridge() {
  const pages = corpus.pages.filter(p => p.status==="unsolved");
  assert.deepEqual(pages.map(p=>p.page).filter(p=>p>=49&&p<=51),[49,51]);
  assert.ok(byPage.has(50));
  assert.notEqual(byPage.get(50).status,"unsolved");
  assert.equal(runePage(49).length,66);
  assert.equal(runePage(50).length,0);
  assert.equal(runePage(51).length,92);
  let globalOffset = 0;
  const source = [];
  const positionsByPage = new Map([[49,[]],[51,[]]]);
  for (const page of pages) {
    for (let i=0;i<page.indices.length;i++) {
      if (page.page===49||page.page===51) {
        positionsByPage.get(page.page).push(source.length);
        source.push({page:page.page,localOffset:i,
          bookOffset:globalOffset+i,gp:page.indices[i]});
      }
    }
    globalOffset+=page.indices.length;
  }
  assert.equal(globalOffset,12956);
  assert.equal(source.length,158);
  assert.equal(source[0].bookOffset,12048);
  assert.equal(source[65].bookOffset,12113);
  assert.equal(source[66].bookOffset,12114);
  assert.equal(source.at(-1).bookOffset,12205);
  assert.ok(source.every((x,i)=>x.bookOffset===12048+i));
  assert.deepEqual(positionsByPage.get(49).length,66);
  assert.deepEqual(positionsByPage.get(51).length,92);
  // Exact inverse: original coordinate (p,local) -> compact rune clock.
  const inverse = new Map(source.map((x,i)=>[x.page+":"+x.localOffset,i]));
  assert.equal(inverse.size,158);
  for (let i=0;i<source.length;i++) {
    assert.equal(inverse.get(source[i].page+":"+source[i].localOffset),i);
    assert.equal(runePage(source[i].page)[source[i].localOffset],source[i].gp);
  }
  return {source,positionsByPage};
}

function main() {
  const {source} = originalBridge();
  assert.deepEqual(marks(49),[[66,10,"red"]]);
  assert.deepEqual(marks(56),[[5,13,"red"],[45,10,"red"],[85,13,"red"]]);
  assert.deepEqual(marks(36),[[99,10,"red"]]);
  assert.deepEqual(marks(38),[[186,10,"red"]]);
  assert.equal(runePage(56).length,85);
  assert.deepEqual(table.page_row_counts,[10,13,9]);
  assert.equal(table.byte_rows.length,32);
  assert.ok(table.byte_rows.every(row => row.length===8));
  const bytes = table.byte_rows.flat();
  assert.equal(bytes.length,256);
  assert.ok(bytes.every(v=>Number.isInteger(v)&&v>=0&&v<=255));
  assert.equal(new Set(source.map(p=>p.bookOffset)).size,158);

  // Original model copies both source segments and incurs zero GP rune
  // transitions for the 256-byte table, matching the authenticated solved
  // p56 *rune-only* counter across its 64-byte printed SHA-512 digest.
  const layoutClock = source.map((p,i)=>({
    streamRuneOffset:i,physicalPage:p.page,pageRuneOffset:p.localOffset,
    bookRuneOffset:p.bookOffset,gpIndex:p.gp
  }));
  assert.deepEqual(layoutClock.slice(0,66).map(x=>x.gpIndex),runePage(49));
  assert.deepEqual(layoutClock.slice(66).map(x=>x.gpIndex),runePage(51));
  const markPositions = [36,38,49,56].map(p=>({
    physicalPage:p,mark:marks(p).find(m=>m[1]===10)
  }));
  const result = {source:"original LP2 scans 53,55,66-68,73",
    question:"Can a single rune-only cipher clock pass through the page49-51 table?",
    location:"LP2 physical pages 49 -> 50 grid -> 51",
    firstRunes:66,tableBytes:bytes.length,tableRowsPerPage:table.page_row_counts,
    resumedRunes:92,totalRuneClock:layoutClock.length,
    firstBookIndex:layoutClock[0].bookRuneOffset,
    lastBookIndex:layoutClock.at(-1).bookRuneOffset,
    resumeAtCompactRuneOffset:66,resumeAtBookRuneOffset:12114,
    tenDotMarkPositions:markPositions,
    solvedPage56Hash: {
      runePrefix:45,sha512DigestBytes:64,printedHexDigits:128,runeSuffix:40,
      authenticPrimeClockConsumesDigestBytes:0,
      authenticPrimeClockConsumesLargeDot:0
    },
    exactCoordinateInverse:true,
    sampleAroundBridge:layoutClock.slice(63,69),
    status:"Original source coordinates and solved-page clock positive only; " +
      "source does not authenticate applying that clock to unsolved p49-51."};
  console.log(JSON.stringify(result,null,2));
}

if(require.main===module) main();
module.exports={main,originalBridge};
