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
const planePermutations = [
  [0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]
];
const planarValid = [];
let bestPossibleMsbPlane = { maxByte: Infinity };
for (const order of orders) {
  for (let dropIndex = 0; dropIndex < 256; dropIndex++) {
    const stream = order.bytes.slice(0, dropIndex).concat(order.bytes.slice(dropIndex + 1));
    const planes = [stream.slice(0,85), stream.slice(85,170), stream.slice(170,255)];
    for (let planeIndex = 0; planeIndex < 3; planeIndex++) {
      const plane = planes[planeIndex];
      const candidate = {
        maxByte: Math.max(...plane),
        highBitCount: plane.filter(value => value >= 128).length,
        order: order.name, dropIndex, planeIndex
      };
      if (candidate.maxByte < bestPossibleMsbPlane.maxByte) bestPossibleMsbPlane = candidate;
    }
    for (const permutation of planePermutations) {
      const values = Array.from({ length: 85 }, (_, i) =>
        (planes[permutation[0]][i] << 16) |
        (planes[permutation[1]][i] << 8) |
        planes[permutation[2]][i]
      );
      const highViolations = planes[permutation[0]].filter(value => value >= 128).length;
      const invalid = values.filter(value => value === 0 || value > 0x7fffff).length;
      if (highViolations === 0 && invalid === 0) {
        planarValid.push({ order: order.name, dropIndex, planeOrder: permutation.join("") });
      }
    }
  }
}

// Positive control: 85 valid codepoints in three planes plus one framing byte.
const syntheticValues = Array.from({ length: 85 }, (_, i) => 0x1000 + i);
const syntheticPlanes = [
  syntheticValues.map(value => (value >> 16) & 255),
  syntheticValues.map(value => (value >> 8) & 255),
  syntheticValues.map(value => value & 255)
];
const synthetic = [...syntheticPlanes[0], ...syntheticPlanes[1], ...syntheticPlanes[2], 0xa5];
const syntheticPayload = synthetic.slice(0, 255); // remove framing byte at index 255
const syntheticDecoded = Array.from({ length: 85 }, (_, i) =>
  (syntheticPayload[i] << 16) |
  (syntheticPayload[85 + i] << 8) |
  syntheticPayload[170 + i]
);
if (JSON.stringify(syntheticDecoded) !== JSON.stringify(syntheticValues)) {
  throw new Error("Synthetic planar positive control failed");
}
if (planarValid.length !== 0) throw new Error("Unexpected valid original planar candidate");

process.stdout.write(JSON.stringify({
  panelShape: [R, C],
  panelBytes: rowMajor.length,
  p56Runes: targetRunes,
  requiredCodepoints: 85,
  best: results[0],
  all: results,
  planar: {
    traversals: orders.map(order => order.name),
    traversalCount: orders.length,
    deletionsPerTraversal: 256,
    planePermutations: planePermutations.map(permutation => permutation.join("")),
    candidateCount: orders.length * 256 * planePermutations.length,
    validCandidates: planarValid.length,
    bestPossibleMsbPlane,
    syntheticPositiveControl: true
  }
}, null, 2) + "\n");
