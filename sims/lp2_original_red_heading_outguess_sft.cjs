"use strict";
/**
 * Original red-heading OutGuess trial on nine image-marked LP2 chapter starts.
 *
 * For each original chapter-start JPEG, pass its first red title to the
 * historical OutGuess 0.4 decoder in two exact encodings: canonical GP
 * transliteration (runic codepoints expanded to the attested Latin labels)
 * and literal UTF-8 runes. Reuse the existing keyed-positive, authentic-LP1
 * positive and deliberately clean synthetic-JPEG controls for each attempt.
 *
 * All payloads are unauthenticated until their bytes establish a genuine
 * recognisable object, signature or independently fixed cipher contract.
 *
 * Single-file runnable test:
 *   node sims/lp2_original_red_heading_outguess_sft.cjs
 *
 * Requires native outguess on PATH and the checked-in original source JPEGs.
 * Tested on Windows-compatible Node.js 22 CommonJS; writes result files only
 * to its dedicated, locked CI working directory.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const CORPUS = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const INK = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const EXPECTED_STARTS = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const RESULT = path.join(ROOT, "outguess-results-heading");
const TEMP = path.join(ROOT, "outguess-results-keyed");

/** @param {number} n */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/** @returns {{page: number, scan: number, encoding: string, password: string}[]} */
function originalSourceKeys() {
  const starts = INK.pages.filter(p =>
    p.page < 56 && p.red_spans?.some(s => s.start === 0))
    .map(p => p.page);
  assert.deepEqual(starts, EXPECTED_STARTS);
  const cases = [];
  for (const page of starts) {
    const red = INK.pages.find(p => p.page === page).red_spans[0];
    const glyphs = [...red.runes];
    assert.equal(red.start, 0);
    assert.equal(glyphs.length, red.length);
    const original = CORPUS.pages[page].indices.slice(0, glyphs.length);
    assert.deepEqual(glyphs, original.map(i => CORPUS.runes[i]));
    const latin = original.map(i => CORPUS.translit[i]).join("");
    for (const [encoding, password] of [
      ["latin-gp", latin], ["literal-utf8-runes", red.runes]
    ]) {
      assert(password.length > 0);
      cases.push({page, scan:page + 17, encoding, password});
    }
  }
  assert.equal(cases.length, 18);
  return cases;
}

function main() {
  const cases = originalSourceKeys();
  fs.mkdirSync(RESULT, {recursive:true});
  const lock = path.join(RESULT, ".batch.lock");
  const fd = fs.openSync(lock, "wx");
  const entries = [];
  try {
    for (const item of cases) {
      fs.rmSync(TEMP, {recursive:true,force:true});
      const proc = spawnSync(process.execPath, [
        path.join(ROOT, "sims", "outguess_lp2_keyed_probe.cjs")
      ], {
        cwd:ROOT,
        env:{...process.env,
          LP2_OUTGUESS_PASSWORD:item.password,
          LP2_OUTGUESS_SOURCE_IMAGE:String(item.scan)},
        encoding:"utf8",
        timeout:180000,
        maxBuffer:4*1024*1024
      });
      assert.equal(proc.status, 0,
        "Key trial failed "+item.page+"/"+item.encoding+" "+
        String(proc.stderr).slice(-2000)+" "+String(proc.stdout).slice(-2000));
      const sum = JSON.parse(fs.readFileSync(
        path.join(TEMP, "summary.json"), "utf8"));
      assert.deepEqual(sum.keys, [item.password]);
      assert.deepEqual(sum.pages, [item.scan]);
      assert.equal(sum.attempts, 1);
      assert.equal(sum.controls.knownKey.exactRecovery, true);
      assert.deepEqual(sum.controls.authenticDefaultImages, [0,8]);
      const target = path.join(RESULT,
        "p"+pad2(item.page)+"-"+item.encoding);
      fs.renameSync(TEMP, target);
      const entry = {
        page:item.page,
        original_scan:item.scan+".jpg",
        encoding:item.encoding,
        password:item.password,
        header_consistent:sum.headerMatches===1,
        recognizable:sum.plausible,
        raw_candidates:sum.rawCandidates.map(x => ({
          bytes:x.bytes, status:x.status, signal:x.signal,
          first32Hex:x.first32Hex, shannonBitsPerByte:x.shannonBitsPerByte,
          printableFraction:x.printableFraction, sha256:x.sha256,
          path:x.rawFile
        })),
        synthetic_clean_control:sum.controls.syntheticNoPayload,
        genuinely_embedded_control:sum.controls.knownKey,
        result_directory:path.relative(ROOT, target)
      };
      entries.push(entry);
      console.log("ORIGINAL_RED_HEADING_KEY "+JSON.stringify({
        page:item.page,encoding:item.encoding,
        key:item.password,
        genuine_header:entry.header_consistent,
        recognizable:entry.recognizable.length,
        clean_header:entry.synthetic_clean_control.headerConsistent
      }));
    }
    assert.equal(entries.length, 18);
    const complete = {
      title:"Exact original chapter red-heading OutGuess key probe",
      source:"LP2 original scans 17–74; source rune spans pinned by lp2-ink-annotations.json",
      hypothesis:"First red chapter heading is the password for its own original JPEG",
      scope:"nine physical chapter starts; two exact heading encodings; 18 trials",
      control:"original 2014 OutGuess-positive 00.jpg,08.jpg; independently planted 79-key positive; synthetic clean JPEG",
      auth_requirement:"Readable signed payload or independently authenticated binary; an OutGuess header by itself is not evidence",
      cases:entries,
      recognizable_count:entries.reduce((n,x)=>n+x.recognizable.length,0)
    };
    const staging = path.join(RESULT,"summary.json.incomplete");
    fs.writeFileSync(staging, JSON.stringify(complete,null,2)+"\n");
    fs.renameSync(staging,path.join(RESULT,"summary.json"));
    console.log("ORIGINAL_RED_HEADING_COMPLETE "+JSON.stringify({
      cases:entries.length,
      plausible:complete.recognizable_count,
      original_headers:entries.filter(x=>x.header_consistent).length,
      synthetic_headers:entries.filter(x=>x.synthetic_clean_control.headerConsistent).length,
      bytes_saved:entries.reduce((n,x)=>n+x.raw_candidates.reduce((a,y)=>a+y.bytes,0),0)
    }));
  } finally {
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
  }
}
if (require.main === module) main();
module.exports = {main,originalSourceKeys};
