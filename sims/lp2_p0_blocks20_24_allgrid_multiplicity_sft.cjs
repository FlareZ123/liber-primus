"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const baseGrid = corpus.pages.filter(page => page.page <= 2)
  .flatMap(page => page.indices);
const T = corpus.translit;
assert.equal(baseGrid.length, 729);
const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];
const mod29 = value => (value % 29 + 29) % 29;
const mod3 = value => (value % 3 + 3) % 3;
const inBounds = q => q[0] >= 1 && q[0] <= 27 && q[1] >= 1 && q[1] <= 27;
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let value = n;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor++) {
    if (remaining % factor !== 0) continue;
    while (remaining % factor === 0) remaining /= factor;
    value -= value / factor;
  }
  if (remaining > 1) value -= value / remaining;
  return value;
}
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let remaining = n;
  let sign = 1;
  for (let factor = 2; factor * factor <= remaining; factor++) {
    if (remaining % factor !== 0) continue;
    remaining /= factor;
    sign = -sign;
    if (remaining % factor === 0) return 0;
    while (remaining % factor === 0) remaining /= factor;
  }
  return remaining > 1 ? -sign : sign;
}
function deriveKey(raw, transformCenter = true) {
  const derived = transformCenter
    ? [raw[0], phi(raw[1]), raw[2]]
    : raw.slice();
  const signature = derived.map(value => mu(phi(value)));
  const rotation = mod3(signature.reduce((sum, value) => sum + value, 0));
  return {
    derived,
    signature,
    rotation,
    key: derived.slice(rotation).concat(derived.slice(0, rotation)),
  };
}
function runes(values) {
  return values.map(value => T[value]);
}
const frames = [
  ["I", (r, c) => [r, c]],
  ["R90", (r, c) => [c, 28 - r]],
  ["R180", (r, c) => [28 - r, 28 - c]],
  ["R270", (r, c) => [28 - c, r]],
  ["M", (r, c) => [r, 28 - c]],
  ["MR90", (r, c) => [28 - c, 28 - r]],
  ["MR180", (r, c) => [28 - r, c]],
  ["MR270", (r, c) => [c, r]],
];
function makeAt(transform) {
  return q => {
    const z = transform(q[0], q[1]);
    return baseGrid[(z[0] - 1) * 27 + z[1] - 1];
  };
}
function nodeAt(at, center, axis, radius) {
  const first = [
    center[0] - axis[0] * radius,
    center[1] - axis[1] * radius,
  ];
  const second = [
    center[0] + axis[0] * radius,
    center[1] + axis[1] * radius,
  ];
  if (!inBounds(center) || !inBounds(first) || !inBounds(second)) return null;
  const raw = [at(first), at(center), at(second)];
  return {
    first,
    center,
    second,
    axis,
    radius,
    raw,
    equalOuter: raw[0] === raw[2] && raw[1] !== 0,
  };
}
function decrypt(at, cells, key) {
  return cells.map((q, i) => mod29(at(q) - key[i % 3]));
}
function segments(length, direction) {
  const result = [];
  for (let row = 1; row <= 27; row++) {
    for (let column = 1; column <= 27; column++) {
      const cells = Array.from({length}, (_, i) => [
        row + i * direction[0],
        column + i * direction[1],
      ]);
      if (cells.every(inBounds)) result.push(cells);
    }
  }
  return result;
}
function sourceNodes(at, radius, axis) {
  const result = [];
  for (let row = 1; row <= 27; row++) {
    for (let column = 1; column <= 27; column++) {
      const node = nodeAt(at, [row, column], axis, radius);
      if (node?.equalOuter) result.push(node);
    }
  }
  return result;
}
function sameRaw(a, b) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}
function block20(at, priorNode, priorCells) {
  const endpoint = priorCells.at(-1);
  const length = phi(endpoint[1]);
  const radiusNumerator =
    phi(priorNode.center[0]) + phi(priorNode.center[1]);
  if (radiusNumerator % 2 !== 0) {
    return {familyCandidates: 0, survivors: 0, executable: false};
  }
  const radius = radiusNumerator / 2;
  const candidates = [];
  for (const rowSign of [-1, 1]) {
    for (const colSign of [-1, 1]) {
      const start = [
        endpoint[0] + rowSign * priorNode.radius,
        endpoint[1] + colSign * priorCells.length,
      ];
      const center = [
        start[0] + rowSign * priorNode.radius,
        start[1] + colSign * length,
      ];
      if (!inBounds(start) || !inBounds(center)) continue;
      for (const axis of axes) {
        const node = nodeAt(at, center, axis, radius);
        if (node) candidates.push({rowSign, colSign, start, node});
      }
    }
  }
  const mirrors = candidates.filter(x => x.node.equalOuter);
  if (mirrors.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      executable: false,
    };
  }
  const selected = mirrors[0];
  const direction = [-selected.rowSign, -selected.colSign];
  const cells = Array.from({length}, (_, i) => [
    selected.start[0] + i * direction[0],
    selected.start[1] + i * direction[1],
  ]);
  if (!cells.every(inBounds)) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      selected: selected.node,
      executable: false,
    };
  }
  const key = deriveKey(selected.node.raw, true).key;
  return {
    familyCandidates: candidates.length,
    survivors: mirrors.length,
    selected: selected.node,
    cells,
    plain: decrypt(at, cells, key),
    executable: true,
  };
}
function block21(at, priorNode, priorCells) {
  if (priorNode.radius % 2 !== 0) {
    return {familyCandidates: 0, survivors: 0, executable: false};
  }
  const direction = [
    priorCells[1][0] - priorCells[0][0],
    priorCells[1][1] - priorCells[0][1],
  ];
  const endpoint = priorCells.at(-1);
  const candidates = [];
  for (const nextDirection of [
    direction,
    [-direction[0], -direction[1]],
  ]) {
    const start = [
      endpoint[0] + nextDirection[0] * priorNode.raw[1],
      endpoint[1] + nextDirection[1] * priorNode.raw[1],
    ];
    const center = [
      priorNode.center[0] + nextDirection[0] * priorNode.center[1],
      priorNode.center[1] + nextDirection[1] * phi(priorNode.center[0]),
    ];
    if (!inBounds(start) || !inBounds(center)) continue;
    for (const axis of axes) {
      const node = nodeAt(at, center, axis, priorNode.radius / 2);
      if (node) candidates.push({direction: nextDirection, start, node});
    }
  }
  const mirrors = candidates.filter(x => x.node.equalOuter);
  if (mirrors.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      executable: false,
    };
  }
  const selected = mirrors[0];
  const cells = Array.from({length: priorCells.length}, (_, i) => [
    selected.start[0] + i * selected.direction[0],
    selected.start[1] + i * selected.direction[1],
  ]);
  if (!cells.every(inBounds)) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      selected: selected.node,
      executable: false,
    };
  }
  return {
    familyCandidates: candidates.length,
    survivors: mirrors.length,
    selected: selected.node,
    cells,
    plain: decrypt(at, cells, deriveKey(selected.node.raw, true).key),
    executable: true,
  };
}
function block22(at, priorNode, priorCells) {
  const d = phi(priorNode.center[0]);
  const radius = priorNode.radius + d;
  const endpoint = priorCells.at(-1);
  const candidates = [];
  for (const rowSign of [-1, 1]) {
    for (const colSign of [-1, 1]) {
      const center = [
        endpoint[0] + rowSign * d,
        endpoint[1] + colSign * priorNode.radius,
      ];
      if (!inBounds(center)) continue;
      for (const axis of axes) {
        const node = nodeAt(at, center, axis, radius);
        if (node) candidates.push(node);
      }
    }
  }
  const mirrors = candidates.filter(node => node.equalOuter);
  if (mirrors.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: 0,
      executable: false,
    };
  }
  const node = mirrors[0];
  const starts = [];
  for (const colSign of [-1, 1]) {
    const start = [
      priorCells[0][0],
      priorCells[0][1] + colSign * d,
    ];
    if (!inBounds(start)) continue;
    if (Math.abs(start[1] - node.center[1]) === phi(radius)) {
      starts.push({colSign, start});
    }
  }
  if (starts.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: starts.length,
      selected: node,
      executable: false,
    };
  }
  const selectedStart = starts[0];
  const cells = [
    selectedStart.start,
    [
      selectedStart.start[0],
      selectedStart.start[1] + selectedStart.colSign,
    ],
  ];
  if (!cells.every(inBounds)) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: starts.length,
      selected: node,
      executable: false,
    };
  }
  return {
    familyCandidates: candidates.length,
    survivors: mirrors.length,
    startSurvivors: starts.length,
    selected: node,
    cells,
    plain: decrypt(at, cells, deriveKey(node.raw, true).key),
    executable: true,
  };
}
function block23(at, priorNode, priorCells) {
  const phiRadius = phi(priorNode.radius);
  const phi2Radius = phi(phiRadius);
  if (phiRadius % 2 !== 0) {
    return {familyCandidates: 0, survivors: 0, executable: false};
  }
  const major = priorNode.radius - phi2Radius;
  const half = phiRadius / 2;
  const candidates = [];
  for (const shape of ["major-half", "half-major"]) {
    for (const rowSign of [-1, 1]) {
      for (const colSign of [-1, 1]) {
        const dr = shape === "major-half" ? major : half;
        const dc = shape === "major-half" ? half : major;
        const center = [
          priorNode.center[0] + rowSign * dr,
          priorNode.center[1] + colSign * dc,
        ];
        if (!inBounds(center)) continue;
        for (const axis of axes) {
          const node = nodeAt(at, center, axis, phiRadius);
          if (node) candidates.push({rowSign, colSign, node});
        }
      }
    }
  }
  const mirrors = candidates.filter(x => x.node.equalOuter);
  if (mirrors.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: 0,
      executable: false,
    };
  }
  const selected = mirrors[0];
  const endpoint = priorCells.at(-1);
  const starts = [
    [
      endpoint[0] + selected.rowSign * half,
      endpoint[1] + selected.colSign * phi2Radius,
    ],
    [
      endpoint[0] + selected.rowSign * phi2Radius,
      endpoint[1] + selected.colSign * half,
    ],
  ].filter(inBounds).filter(start => start[0] === priorNode.center[0]);
  if (starts.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: starts.length,
      selected: selected.node,
      executable: false,
    };
  }
  const start = starts[0];
  const colDirection = Math.sign(selected.node.center[1] - start[1]);
  if (colDirection === 0) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: starts.length,
      selected: selected.node,
      executable: false,
    };
  }
  const cells = [start, [start[0], start[1] + colDirection]];
  if (!cells.every(inBounds)) {
    return {
      familyCandidates: candidates.length,
      survivors: mirrors.length,
      startSurvivors: starts.length,
      selected: selected.node,
      executable: false,
    };
  }
  return {
    familyCandidates: candidates.length,
    survivors: mirrors.length,
    startSurvivors: starts.length,
    selected: selected.node,
    cells,
    plain: decrypt(at, cells, deriveKey(selected.node.raw, true).key),
    executable: true,
  };
}
function n0(q) {
  return 27 * (q[0] - 1) + q[1];
}
function n1(q) {
  return 27 * (q[1] - 1) + 28 - q[0];
}
function predictDirectSignature(cells, leftmost) {
  const phase = mod3(cells.reduce((sum, q) => sum + mu(n0(q)), 0));
  const nextOuterState = (1 + mu(n1(leftmost)) + 2) % 2;
  const outer = nextOuterState === 1 ? 1 : 0;
  const residue = mod3(phase - 2 * nextOuterState);
  return [outer, residue === 2 ? -1 : residue, outer];
}
function block24(at, priorNode, priorCells) {
  if (priorNode.radius % 2 !== 0) {
    return {familyCandidates: 0, survivors: 0, executable: false};
  }
  const half = priorNode.radius / 2;
  const long = phi(priorNode.center[1]) - half;
  const endpoint = priorCells.at(-1);
  const candidates = [];
  for (const rowSign of [-1, 1]) {
    for (const colSign of [-1, 1]) {
      const center = [
        priorNode.center[0] + rowSign * half,
        priorNode.center[1] + colSign * long,
      ];
      const start = [
        endpoint[0] + rowSign * half,
        endpoint[1] + colSign * half,
      ];
      const node = nodeAt(at, center, [1, 0], half);
      if (!node || !inBounds(start)) continue;
      candidates.push({
        start,
        node,
        direct: deriveKey(node.raw, false),
      });
    }
  }
  const prediction = predictDirectSignature(priorCells, endpoint);
  const survivors = candidates.filter(
    x => sameRaw(x.direct.signature, prediction)
  );
  if (survivors.length !== 1) {
    return {
      familyCandidates: candidates.length,
      survivors: survivors.length,
      executable: false,
    };
  }
  const selected = survivors[0];
  const colDirection = Math.sign(
    selected.node.center[1] - selected.start[1]
  );
  if (colDirection === 0) {
    return {
      familyCandidates: candidates.length,
      survivors: survivors.length,
      selected: selected.node,
      executable: false,
    };
  }
  const cells = [
    selected.start,
    [selected.start[0], selected.start[1] + colDirection],
  ];
  if (!cells.every(inBounds)) {
    return {
      familyCandidates: candidates.length,
      survivors: survivors.length,
      selected: selected.node,
      executable: false,
    };
  }
  return {
    familyCandidates: candidates.length,
    survivors: survivors.length,
    selected: selected.node,
    cells,
    plain: decrypt(at, cells, selected.direct.key),
    executable: true,
  };
}
const gpTokens = T.slice().sort((a, b) => b.length - a.length);
const tokenIndex = new Map(T.map((token, i) => [token, i]));
const encoded = seq => seq.map(value => String.fromCharCode(value + 65)).join("");
function nativeWord(word) {
  const value = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const result = [];
  for (let pos = 0; pos < value.length;) {
    const token = gpTokens.find(x => value.startsWith(x, pos));
    if (!token) return null;
    result.push(tokenIndex.get(token));
    pos += token.length;
  }
  return result;
}
const dictionary = new Map();
for (const word of [
  read("resources/control/shakespeare_first300k.txt"),
  read("resources/control/gibran_prophet_58585.txt"),
].flatMap(text => text.match(/[A-Za-z]+/g) || [])) {
  const seq = nativeWord(word);
  if (!seq) continue;
  const key = encoded(seq);
  const old = dictionary.get(key);
  dictionary.set(key, {
    word: old?.word || word.toUpperCase(),
    freq: (old?.freq || 0) + 1,
    len: seq.length,
  });
}
assert.equal(dictionary.size, 6834);
const lexicon = new Map([...dictionary].filter(([key, item]) =>
  item.freq >= 5 &&
  (item.len >= 2 || key === encoded([24]) || key === encoded([10]))
));
assert.equal(lexicon.size, 1465);
const specs = {
  20: {
    selector: block20,
    radius: 1,
    axis: [1, 0],
    segmentLength: 3,
    segmentDirection: [-1, 0],
    priorRaw: [2, 8, 2],
    actualOutput: [10, 15],
    actualState: {
      center: [12, 16],
      cells: [[21, 4], [20, 4], [19, 4]],
      familyCandidates: 8,
      survivors: 1,
    },
  },
  21: {
    selector: block21,
    radius: 6,
    axis: [0, 1],
    segmentLength: 2,
    segmentDirection: [1, -1],
    priorRaw: [7, 10, 7],
    actualOutput: [16, 3],
    actualState: {
      center: [17, 9],
      cells: [[18, 7], [19, 6]],
      familyCandidates: 1,
      survivors: 1,
    },
  },
  22: {
    selector: block22,
    radius: 3,
    axis: [1, 0],
    segmentLength: 2,
    segmentDirection: [-1, 1],
    priorRaw: [14, 19, 14],
    actualOutput: [6, 3],
    actualState: {
      center: [8, 25],
      cells: [[9, 16], [8, 17]],
      familyCandidates: 10,
      survivors: 1,
      startSurvivors: 1,
    },
  },
  23: {
    selector: block23,
    radius: 7,
    axis: [1, 0],
    segmentLength: 2,
    segmentDirection: [0, 1],
    priorRaw: [2, 6, 2],
    actualOutput: [16, 3],
    actualState: {
      center: [12, 14],
      cells: [[9, 20], [9, 21]],
      familyCandidates: 32,
      survivors: 1,
      startSurvivors: 1,
    },
  },
  24: {
    selector: block24,
    radius: 6,
    axis: [1, 1],
    segmentLength: 2,
    segmentDirection: [0, -1],
    priorRaw: [23, 9, 23],
    actualOutput: [2, 18],
    actualState: {
      center: [17, 17],
      cells: [[12, 23], [12, 22]],
      familyCandidates: 2,
      survivors: 1,
    },
  },
};
const expected = {
  20: {
    orientedPriorNodes: 144, states: 97200, executable: 4500,
    uniqueSelectedGeometries: 1202, uniqueCipherPlacements: 2114,
    distinctOutputs: 1526, wordHits: 113, distinctWords: 21,
    actualOutputHits: 7,
    matched: {
      orientedPriorNodes: 4, states: 2700, executable: 197,
      uniqueSelectedGeometries: 98, uniqueCipherPlacements: 196,
      distinctOutputs: 187, wordHits: 5, distinctWords: 5,
      actualOutputHits: 1,
    },
  },
  21: {
    orientedPriorNodes: 116, states: 78416, executable: 1462,
    uniqueSelectedGeometries: 8, uniqueCipherPlacements: 1173,
    distinctOutputs: 708, wordHits: 77, distinctWords: 40,
    actualOutputHits: 3,
    matched: {
      orientedPriorNodes: 4, states: 2704, executable: 256,
      uniqueSelectedGeometries: 1, uniqueCipherPlacements: 256,
      distinctOutputs: 226, wordHits: 17, distinctWords: 15,
      actualOutputHits: 2,
    },
  },
  22: {
    orientedPriorNodes: 116, states: 78416, executable: 1626,
    uniqueSelectedGeometries: 429, uniqueCipherPlacements: 668,
    distinctOutputs: 488, wordHits: 107, distinctWords: 30,
    actualOutputHits: 12,
    matched: {
      orientedPriorNodes: 4, states: 2704, executable: 111,
      uniqueSelectedGeometries: 66, uniqueCipherPlacements: 111,
      distinctOutputs: 101, wordHits: 11, distinctWords: 10,
      actualOutputHits: 2,
    },
  },
  23: {
    orientedPriorNodes: 80, states: 56160, executable: 1288,
    uniqueSelectedGeometries: 28, uniqueCipherPlacements: 602,
    distinctOutputs: 151, wordHits: 136, distinctWords: 14,
    actualOutputHits: 8,
    matched: {
      orientedPriorNodes: 4, states: 2808, executable: 184,
      uniqueSelectedGeometries: 4, uniqueCipherPlacements: 94,
      distinctOutputs: 23, wordHits: 16, distinctWords: 2,
      actualOutputHits: 8,
    },
  },
  24: {
    orientedPriorNodes: 72, states: 50544, executable: 6512,
    uniqueSelectedGeometries: 98, uniqueCipherPlacements: 4241,
    distinctOutputs: 840, wordHits: 384, distinctWords: 49,
    actualOutputHits: 5,
    matched: {
      orientedPriorNodes: 4, states: 2808, executable: 351,
      uniqueSelectedGeometries: 7, uniqueCipherPlacements: 350,
      distinctOutputs: 286, wordHits: 34, distinctWords: 23,
      actualOutputHits: 1,
    },
  },
};
function actualCheck(spec) {
  const at = makeAt(frames[0][1]);
  const node = nodeAt(
    at,
    spec.actualState.center,
    spec.axis,
    spec.radius
  );
  assert.ok(node?.equalOuter);
  assert.deepEqual(node.raw, spec.priorRaw);
  const result = spec.selector(at, node, spec.actualState.cells);
  assert.equal(result.familyCandidates, spec.actualState.familyCandidates);
  assert.equal(result.survivors, spec.actualState.survivors);
  if ("startSurvivors" in spec.actualState) {
    assert.equal(result.startSurvivors, spec.actualState.startSurvivors);
  }
  assert.ok(result.executable);
  assert.deepEqual(result.plain, spec.actualOutput);
  return result;
}
function census(spec) {
  let orientedPriorNodes = 0;
  let states = 0;
  let executable = 0;
  let wordHits = 0;
  let actualOutputHits = 0;
  let matchedPriorNodes = 0;
  let matchedStates = 0;
  let matchedExecutable = 0;
  let matchedWordHits = 0;
  let matchedActualOutputHits = 0;
  const selectedGeometries = new Set();
  const cipherPlacements = new Set();
  const outputs = new Set();
  const words = new Set();
  const matchedSelectedGeometries = new Set();
  const matchedCipherPlacements = new Set();
  const matchedOutputs = new Set();
  const matchedWords = new Set();
  for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
    const [frameName, transform] = frames[frameIndex];
    const at = makeAt(transform);
    const nodes = sourceNodes(at, spec.radius, spec.axis);
    const priorSegments = segments(spec.segmentLength, spec.segmentDirection);
    const matchedNodes = nodes.filter(node => sameRaw(node.raw, spec.priorRaw));
    orientedPriorNodes += nodes.length;
    matchedPriorNodes += matchedNodes.length;
    for (const node of nodes) {
      for (const priorCells of priorSegments) {
        states++;
        const result = spec.selector(at, node, priorCells);
        if (!result.executable) continue;
        executable++;
        const selectedKey = JSON.stringify([
          frameName,
          result.selected.center,
          result.selected.axis,
          result.selected.radius,
          result.selected.raw,
        ]);
        const cellsKey = JSON.stringify([frameName, result.cells]);
        const outputKey = encoded(result.plain);
        selectedGeometries.add(selectedKey);
        cipherPlacements.add(cellsKey);
        outputs.add(outputKey);
        const word = lexicon.get(outputKey)?.word || null;
        if (word) {
          wordHits++;
          words.add(word);
        }
        if (sameRaw(result.plain, spec.actualOutput)) actualOutputHits++;
      }
    }
    for (const node of matchedNodes) {
      for (const priorCells of priorSegments) {
        matchedStates++;
        const result = spec.selector(at, node, priorCells);
        if (!result.executable) continue;
        matchedExecutable++;
        const selectedKey = JSON.stringify([
          frameName,
          result.selected.center,
          result.selected.axis,
          result.selected.radius,
          result.selected.raw,
        ]);
        const cellsKey = JSON.stringify([frameName, result.cells]);
        const outputKey = encoded(result.plain);
        matchedSelectedGeometries.add(selectedKey);
        matchedCipherPlacements.add(cellsKey);
        matchedOutputs.add(outputKey);
        const word = lexicon.get(outputKey)?.word || null;
        if (word) {
          matchedWordHits++;
          matchedWords.add(word);
        }
        if (sameRaw(result.plain, spec.actualOutput)) matchedActualOutputHits++;
      }
    }
  }
  return {
    orientedPriorNodes,
    states,
    executable,
    uniqueSelectedGeometries: selectedGeometries.size,
    uniqueCipherPlacements: cipherPlacements.size,
    distinctOutputs: outputs.size,
    wordHits,
    distinctWords: words.size,
    actualOutputHits,
    matched: {
      orientedPriorNodes: matchedPriorNodes,
      states: matchedStates,
      executable: matchedExecutable,
      uniqueSelectedGeometries: matchedSelectedGeometries.size,
      uniqueCipherPlacements: matchedCipherPlacements.size,
      distinctOutputs: matchedOutputs.size,
      wordHits: matchedWordHits,
      distinctWords: matchedWords.size,
      actualOutputHits: matchedActualOutputHits,
    },
  };
}
const summary = {
  status: "post-hoc Blocks20-24 all-grid multiplicity audit",
  fixedVocabularyTypes: lexicon.size,
  blocks: {},
};
for (const [block, spec] of Object.entries(specs)) {
  const actual = actualCheck(spec);
  const result = census(spec);
  assert.deepEqual(result, expected[block]);
  summary.blocks[block] = {
    actual: {
      priorSource: runes(spec.priorRaw),
      familyCandidates: actual.familyCandidates,
      survivors: actual.survivors,
      startSurvivors: actual.startSurvivors ?? null,
      plaintext: runes(spec.actualOutput),
    },
    broad: result,
    executableRate: result.executable / result.states,
    sourcePreservingExecutableRate:
      result.matched.executable / result.matched.states,
  };
}
summary.decision =
  "All five frozen selectors have many executable matched states and many " +
  "untargeted fixed-lexicon word outputs. The local 1-of-N counts therefore " +
  "do not establish structural exceptionalism. Every Block20-24 rule was " +
  "formulated after its public target transition was known, so this audit " +
  "contains no genuine prospective holdout.";
console.log(JSON.stringify(summary, null, 2));
