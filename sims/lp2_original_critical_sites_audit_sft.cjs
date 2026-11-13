"use strict";

/**
 * Source-geometry SFT for the original LP2 high-leverage 169-site ink inventory.
 *
 * Reads the archival transcription and the independently pixel-localized site
 * manifest. The image-based identity review is recorded in the companion
 * research note and original JPEGs; this script tests inventory consistency,
 * coordinates, and the unchanged text-to-site mapping.
 *
 * @returns {void}
 */
function run() {
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const root = path.resolve(__dirname, "..");
  const raw = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
  const tsv = fs.readFileSync(path.join(root, "im-results", "lp2-original-ink-critical-sites.tsv"), "utf8");
  const pages = raw.split("%").slice(0, 55);
  const isRune = (c) => /[\u16a0-\u16ff]/u.test(c);
  /** @type {Array<Array<{p:number,l:number,j:number,r:string}>>} */
  const pageRune = [];
  /** @type {Array<{p:number,t:string,ordinal:number,points:Array<{p:number,l:number,j:number,r:string}>}>} */
  const events = [];
  const counters = new Map();
  const register = (p, t, points) => {
    const key = p + ":" + t;
    const ordinal = (counters.get(key) || 0) + 1;
    counters.set(key, ordinal);
    events.push({p, t, ordinal, points});
  };
  for (let q = 0; q < pages.length; q++) {
    const p = q >= 50 ? q + 1 : q;
    let l = 0;
    let j = 0;
    const runes = [];
    for (const c of pages[q]) {
      if (c === "\n") {
        l++;
        j = 0;
      } else if (isRune(c)) {
        runes.push({p, l, j: j++, r: c});
      }
    }
    pageRune.push(runes);
    for (let k = 1; k < runes.length; k++) {
      if (runes[k].r === runes[k - 1].r) {
        register(p, "D", [runes[k - 1], runes[k]]);
      }
    }
  }
  const pageOffset = Array(55).fill(0);
  const words = [];
  let word = [];
  const flush = () => {
    if (word.length) words.push(word);
    word = [];
  };
  for (let q = 0; q < pages.length; q++) {
    for (const c of pages[q]) {
      if (isRune(c)) {
        word.push(pageRune[q][pageOffset[q]++]);
      } else if (c === "/" || /\s/u.test(c)) {
        // Line wraps and page boundaries do not terminate printed words.
      } else {
        flush();
      }
    }
  }
  flush();
  for (const w of words) {
    if (w.length === 1) register(w[0].p, "S", w);
  }

  assert.equal(pages.reduce((sum, _, i) => sum + pageRune[i].length, 0), 12956);
  assert.equal(words.length, 2896);
  assert.equal(events.filter((e) => e.t === "D").length, 86);
  assert.equal(events.filter((e) => e.t === "S").length, 83);
  const map = new Map(events.map((e) => [e.p + ":" + e.t + ":" + e.ordinal, e]));
  const rows = tsv.trim().split(/\r?\n/u).map((s) => s.split("\t"));
  assert.equal(rows.length, 170);
  assert.deepEqual(rows[0], [
    "physical_page", "archive_jpeg", "kind", "ordinal", "gp_rune",
    "transliteration", "line0", "index0", "line0_2", "index0_2",
    "x1", "y1", "x2", "y2", "iou", "placement"
  ]);
  let nManual = 0;
  let minDoubletIoU = 1;
  let maxDoubletIoU = 0;
  const seen = new Set();
  for (const row of rows.slice(1)) {
    const [p, file, t, k, rune, , l, j, l2, j2, x, y, x2, y2, iou, placement] = row;
    const key = p + ":" + t + ":" + k;
    const event = map.get(key);
    assert(event, "Missing site " + key);
    assert(!seen.has(key), "Duplicate site " + key);
    seen.add(key);
    assert.equal(file, String(Number(p) + 17).padStart(2, "0") + ".jpg");
    assert.equal(rune, event.points[0].r);
    assert.equal(Number(l), event.points[0].l);
    assert.equal(Number(j), event.points[0].j);
    assert(Number(x) > 0 && Number(x) < 2400);
    assert(Number(y) > 0 && Number(y) < 3600);
    assert(["manual-ink", "component-ink"].includes(placement));
    if (placement === "manual-ink") nManual++;
    if (t === "D") {
      assert.equal(Number(l2), event.points[1].l);
      assert.equal(Number(j2), event.points[1].j);
      assert.equal(event.points[1].r, rune);
      assert(Number(x2) > 0 && Number(x2) < 2400);
      assert(Number(y2) > 0 && Number(y2) < 3600);
      const n = Number(iou);
      assert(n >= 0.75 && n <= 1);
      minDoubletIoU = Math.min(minDoubletIoU, n);
      maxDoubletIoU = Math.max(maxDoubletIoU, n);
    } else {
      assert.equal(l2 + j2 + x2 + y2 + iou, "");
    }
  }
  assert.equal(seen.size, 169);
  assert.equal(nManual, 15);
  console.log(JSON.stringify({
    status: "PASS", originalRunes: 12956, printedWords: 2896,
    reviewedDoublets: 86, reviewedSingletonWords: 83, manualImagePlacements: 15,
    minDoubletImageIoU: minDoubletIoU, maxDoubletImageIoU: maxDoubletIoU
  }, null, 2));
}
run();
