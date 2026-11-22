'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
// Reproduce on Windows 11: node sims/lp2_fivedot_western_asterism_sft.cjs
// The original dot geometry is separately image-verified in
// sims/lp2_p23_p56_halfturn_emblem_sft.py (original JPEG 40.jpg).
const sources = [
  ['Stellarium/stellarium-skycultures', '70471c1a3f4da066751e33eb4cd8f168aefeba00'],
  ['isene/starmap', 'c7b9458deeb6aaa2d8fc71e98c47ea8cfcca4f6c'],
];
const dots = [
  [796.9412761151891, 568.2267080745341],
  [992.5, 507.3629213483146],
  [1296.931478770132, 807.2111273792093],
  [1479.2646884272997, 546.5],
  [1527.1535525543159, 737.9389312977099],
];

/** @param {string} repository @param {string} sha @returns {Promise<string>} */
async function fetchBlob(repository, sha) {
  const url = 'https://api.github.com/repos/' + repository + '/git/blobs/' + sha;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'lp2-asterism-source-gate' },
  });
  assert.ok(response.ok, 'HTTP ' + response.status + ' ' + url);
  const reply = await response.json();
  assert.equal(reply.encoding, 'base64');
  const contents = Buffer.from(reply.content.replace(/\s/g, ''), 'base64');
  const gitHash = crypto.createHash('sha1').update('blob ' + contents.length + '\0')
    .update(contents).digest('hex');
  assert.equal(gitHash, sha);
  return contents.toString('utf8');
}

/** @param {[number,number][]} points @returns {number[]} */
function shape(points) {
  const d = [];
  for (let i = 0; i < 5; i += 1) {
    for (let j = 0; j < i; j += 1) {
      d.push(Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]));
    }
  }
  d.sort((a, b) => a - b);
  const norm = Math.hypot(...d);
  return d.map((value) => value / norm);
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function distance(a, b) {
  return Math.hypot(...a.map((value, i) => value - b[i]));
}

/** @param {{ra:number, dec:number}[]} points @returns {[number,number][]} */
function project(points) {
  const meanRA = Math.atan2(
    points.reduce((v, p) => v + Math.sin(p.ra * Math.PI / 180), 0),
    points.reduce((v, p) => v + Math.cos(p.ra * Math.PI / 180), 0),
  );
  const dec = points.reduce((v, p) => v + p.dec, 0) / 5;
  return points.map((p) => [
    (((p.ra * Math.PI / 180 - meanRA + 3 * Math.PI) % (2 * Math.PI)) - Math.PI)
      * 180 / Math.PI * Math.cos(dec * Math.PI / 180),
    p.dec,
  ]);
}

/** @returns {() => number} */
function seededRandom() {
  let state = 33012014;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** @param {number[]} hips @param {Map<number,{ra:number,dec:number}>} stars */
function optimalSimilarity(hips, stars) {
  const q = project(hips.map((hip) => stars.get(hip)));
  const meanT = [
    dots.reduce((v, p) => v + p[0], 0) / 5,
    dots.reduce((v, p) => v + p[1], 0) / 5,
  ];
  const meanQ = [
    q.reduce((v, p) => v + p[0], 0) / 5,
    q.reduce((v, p) => v + p[1], 0) / 5,
  ];
  const t = dots.map((p) => [p[0] - meanT[0], p[1] - meanT[1]]);
  const u = q.map((p) => [p[0] - meanQ[0], p[1] - meanQ[1]]);
  const nt = t.reduce((v, p) => v + p[0] * p[0] + p[1] * p[1], 0);
  const nu = u.reduce((v, p) => v + p[0] * p[0] + p[1] * p[1], 0);
  let best = Infinity;
  /** @param {number[]} assignment @param {number} mask */
  function assign(assignment, mask) {
    if (assignment.length === 5) {
      for (const reflection of [false, true]) {
        let a = 0, b = 0;
        for (let i = 0; i < 5; i += 1) {
          const [x, y] = t[i];
          let [vx, vy] = u[assignment[i]];
          if (reflection) vy = -vy;
          a += x * vx + y * vy;
          b += y * vx - x * vy;
        }
        best = Math.min(best, Math.sqrt(Math.max(0, 1 - (a * a + b * b) / (nt * nu))));
      }
      return;
    }
    for (let i = 0; i < 5; i += 1) {
      if (!(mask & (1 << i))) assign([...assignment, i], mask | (1 << i));
    }
  }
  assign([], 0);
  return best;
}

async function main() {
  const texts = await Promise.all(sources.map(([repo, sha]) => fetchBlob(repo, sha)));
  const western = JSON.parse(texts[0]);
  const stars = new Map();
  for (const line of texts[1].split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const fields = line.split(',');
    const hip = Number(fields[6]);
    if (hip && Number.isFinite(Number(fields[0])) && Number.isFinite(Number(fields[1]))) {
      stars.set(hip, { ra: Number(fields[0]), dec: Number(fields[1]) });
    }
  }
  assert.equal(western.constellations.length, 88);
  assert.equal(stars.size, 8995);
  const observedShape = shape(dots);
  const paths = [];
  for (const constellation of western.constellations) {
    const graph = new Map();
    for (const line of constellation.lines || []) {
      for (let i = 1; i < line.length; i += 1) {
        const a = line[i - 1], b = line[i];
        if (!stars.has(a) || !stars.has(b)) continue;
        if (!graph.has(a)) graph.set(a, new Set());
        if (!graph.has(b)) graph.set(b, new Set());
        graph.get(a).add(b);
        graph.get(b).add(a);
      }
    }
    const seen = new Set();
    /** @param {number[]} path */
    function walk(path) {
      if (path.length === 5) {
        const a = path.join('/');
        const b = path.slice().reverse().join('/');
        const key = a < b ? a : b;
        if (seen.has(key)) return;
        seen.add(key);
        const fingerprint = shape(project(path.map((hip) => stars.get(hip))));
        paths.push({
          constellation: constellation.iau,
          hips: path, fingerprint,
          error: distance(fingerprint, observedShape),
        });
        return;
      }
      for (const next of graph.get(path[path.length - 1]) || []) {
        if (!path.includes(next)) walk([...path, next]);
      }
    }
    for (const start of graph.keys()) walk([start]);
  }
  assert.equal(paths.length, 915);
  paths.sort((a, b) => a.error - b.error);
  assert.deepEqual(paths[0].hips, [86742, 86032, 83000, 79882, 81377]);
  assert.ok(Math.abs(paths[0].error - 0.04899) < 0.0001);

  // The previously published community wiki proposal lists Altair, Tarazed, Delta Aquilae,
  // Al Thalimain, Eta Aquilae. Al Thalimain can name iota or lambda Aql.
  const lambdaAquila = optimalSimilarity([97649, 97278, 95501, 93805, 97804], stars);
  const iotaAquila = optimalSimilarity([97649, 97278, 95501, 96468, 97804], stars);
  assert.ok(Math.abs(lambdaAquila - 0.31116) < 0.0001);
  assert.ok(Math.abs(iotaAquila - 0.18782) < 0.0001);

  const random = seededRandom();
  const xs = dots.map((p) => p[0]);
  const minY = Math.min(...dots.map((p) => p[1]));
  const rangeY = Math.max(...dots.map((p) => p[1])) - minY;
  const nullScores = [];
  for (let rep = 0; rep < 2000; rep += 1) {
    const sample = shape(xs.map((x) => [x, minY + random() * rangeY]));
    let best = Infinity;
    for (const path of paths) best = Math.min(best, distance(sample, path.fingerprint));
    nullScores.push(best);
  }
  const nullAsGood = nullScores.filter((v) => v <= paths[0].error).length;
  assert.equal(nullAsGood, 1724);
  nullScores.sort((a, b) => a - b);
  console.log(JSON.stringify({
    blobSources: sources,
    catalogStars: stars.size,
    westernConstellations: western.constellations.length,
    distinctFiveStarPaths: paths.length,
    closest: paths[0],
    fixedAquilaLambdaError: lambdaAquila,
    fixedAquilaIotaError: iotaAquila,
    randomSeed: 33012014,
    nullReplicates: nullScores.length,
    randomPatternsAtLeastAsClose: nullAsGood,
    nullQ05: nullScores[99], nullMedian: nullScores[999], nullQ95: nullScores[1899],
    decision: 'No selected constellation, GP29 key or unknown-page plaintext',
  }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
