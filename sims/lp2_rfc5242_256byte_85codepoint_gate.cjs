#!/usr/bin/env node
"use strict";

// Narrow gate: is the 256-byte 32x8 LP2 panel one framing byte plus
// 85 RFC 5242 23-bit codepoints (three octets each)?
// Necessary condition: the most-significant octet of every codepoint
// has its high bit clear. No arbitrary permutations or XOR masks are tried.

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const rows = grid.byte_rows;
const R = rows.length, C = rows[0].length;
const rowMajor = rows.flat();
const columnMajor = Array.from({ length: C }, (_, c) => rows.map(row => row[c])).flat();
const targetRunes = corpus.pages[56].indices.length;

if (rowMajor.length !== 256 || targetRunes !== 85) {
  throw new Error(`Expected 256 panel bytes and 85 p56 runes; got ${rowMajor.length} and ${targetRunes}`);
}

function spiral(corner, clockwise) {
  let top = 0, bottom = R - 1, left = 0, right = C - 1;
  const coords = [];
  while (top <= bottom && left <= right) {
    if (clockwise) {
      if (corner === "TL") {
        for (let c = left; c <= right; c++) coords.push([top, c]);
        for (let r = top + 1; r <= bottom; r++) coords.push([r, right]);
        if (bottom > top) for (let c = right - 1; c >= left; c--) coords.push([bottom, c]);
        if (right > left) for (let r = bottom - 1; r > top; r--) coords.push([r, left]);
      } else if (corner === "TR") {
        for (let r = top; r <= bottom; r++) coords.push([r, right]);
        if (right > left) for (let c = right - 1; c >= left; c--) coords.push([bottom, c]);
        if (bottom > top) for (let r = bottom - 1; r >= top; r--) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c < right; c++) coords.push([top, c]);
      } else if (corner === "BR") {
        for (let c = right; c >= left; c--) coords.push([bottom, c]);
        if (bottom > top) for (let r = bottom - 1; r >= top; r--) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c <= right; c++) coords.push([top, c]);
        if (bottom > top) for (let r = top + 1; r < bottom; r++) coords.push([r, right]);
      } else {
        for (let r = bottom; r >= top; r--) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c <= right; c++) coords.push([top, c]);
        if (bottom > top) for (let r = top + 1; r <= bottom; r++) coords.push([r, right]);
        if (right > left) for (let c = right - 1; c > left; c--) coords.push([bottom, c]);
      }
    } else {
      if (corner === "TL") {
        for (let r = top; r <= bottom; r++) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c <= right; c++) coords.push([bottom, c]);
        if (bottom > top) for (let r = bottom - 1; r >= top; r--) coords.push([r, right]);
        if (right > left) for (let c = right - 1; c > left; c--) coords.push([top, c]);
      } else if (corner === "TR") {
        for (let c = right; c >= left; c--) coords.push([top, c]);
        if (bottom > top) for (let r = top + 1; r <= bottom; r++) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c <= right; c++) coords.push([bottom, c]);
        if (bottom > top) for (let r = bottom - 1; r > top; r--) coords.push([r, right]);
      } else if (corner === "BR") {
        for (let r = bottom; r >= top; r--) coords.push([r, right]);
        if (right > left) for (let c = right - 1; c >= left; c--) coords.push([top, c]);
        if (bottom > top) for (let r = top + 1; r <= bottom; r++) coords.push([r, left]);
        if (right > left) for (let c = left + 1; c < right; c++) coords.push([bottom, c]);
      } else {
        for (let c = left; c <= right; c++) coords.push([bottom, c]);
        if (bottom > top) for (let r = bottom - 1; r >= top; r--) coords.push([r, right]);
        if (right > left) for (let c = right - 1; c >= left; c--) coords.push([top, c]);
        if (bottom > top) for (let r = top + 1; r < bottom; r++) coords.push([r, left]);
      }
    }
    top++; bottom--; left++; right--;
  }
  if (coords.length !== R * C || new Set(coords.map(([r, c]) => `${r},${c}`)).size !== R * C) {
    throw new Error(`Invalid spiral ${corner}/${clockwise ? "cw" : "ccw"}`);
  }
  return coords.map(([r, c]) => rows[r][c]);
}

function bestAlignment(bytes, endian) {
  let best = { violations: Infinity, dropIndex: -1 };
  for (let dropIndex = 0; dropIndex < bytes.length; dropIndex++) {
    const stream = bytes.slice(0, dropIndex).concat(bytes.slice(dropIndex + 1));
    let violations = 0;
    for (let i = 0; i < 85; i++) {
      const msb = stream[3 * i + (endian === "big" ? 0 : 2)];
      if (msb >= 128) violations++;
    }
    if (violations < best.violations) best = { violations, dropIndex };
  }
  return best;
}

const orders = [
  { name: "row-major", bytes: rowMajor },
  { name: "column-major", bytes: columnMajor },
];
for (const corner of ["TL", "TR", "BR", "BL"]) {
  for (const clockwise of [true, false]) {
    orders.push({ name: `spiral-${corner}-${clockwise ? "cw" : "ccw"}`, bytes: spiral(corner, clockwise) });
  }
}

const results = [];
for (const order of orders) {
  for (const endian of ["big", "little"]) {
    results.push({ order: order.name, endian, ...bestAlignment(order.bytes, endian) });
  }
}
results.sort((a, b) => a.violations - b.violations);
process.stdout.write(JSON.stringify({
  panelShape: [R, C],
  panelBytes: rowMajor.length,
  p56Runes: targetRunes,
  requiredCodepoints: 85,
  best: results[0],
  all: results,
}, null, 2) + "\n");
