# p32 11×11 prime-weight tree-matrix symmetry gate

**Status: bounded structural negative; no plaintext or cipher mechanism recovered.**

## Question and source motivation

Physical LP2 p32 contains 121 original GP29 runes and a tree illustration. A natural exploratory reading is to reshape the 121 symbols row-major into an 11×11 matrix. This is worth checking because the p32 and p55 tree motifs recur in the 2016 signed-image tree, and the 2016 image is 563×569 pixels. Under the canonical GP29 prime-weight mapping, the first p32 row sums to **563** and the first column sums to **569**, exactly matching those image dimensions.

A tree illustration can motivate a graph hypothesis, but it does not establish that the 11×11 matrix is an adjacency or distance matrix. The cheapest discriminating property of an ordinary undirected weighted graph/distance matrix is symmetry (and a distance/adjacency matrix also has a zero diagonal).

## Frozen input and method

- Input: `resources/liber-primus/lp2-corpus.json`, page `page === 32`, its original 121 GP29 indices in canonical source order.
- Map each GP29 index to its authenticated first-29-prime weight: `[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109]`.
- Reshape the resulting 121 weights row-major into 11 rows of 11.
- Compare all 55 off-diagonal pairs `M[i][j]` and `M[j][i]`; inspect the diagonal and row/column sums.
- No rotations, reflections, reordering, modular reductions, thresholds, or fitted transformations are allowed in this test.

Reproducer (run from repository root):

```sh
node <<'NODE'
const fs = require("fs");
const assert = require("assert");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const page = corpus.pages.find(p => p.page === 32);
assert(page && page.indices.length === 121);
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const w = page.indices.map(i => primes[i]);
const M = Array.from({length:11}, (_,r) => w.slice(11*r, 11*r+11));
const rows = M.map(r => r.reduce((a,b)=>a+b,0));
const cols = Array.from({length:11}, (_,c) => M.reduce((a,r)=>a+r[c],0));
const diag = M.map((r,i)=>r[i]);
let unequal = 0, equal = 0;
for (let i=0;i<11;i++) for (let j=i+1;j<11;j++)
  (M[i][j] === M[j][i] ? equal++ : unequal++);
assert.deepStrictEqual([rows[0],cols[0],unequal,equal],[563,569,54,1]);
console.log({rows,cols,diag,offDiagonalPairs:55,unequal,equal});
NODE
```

## Result

| Measurement | Exact result |
|---|---:|
| Source symbols | 121 |
| Derived matrix | 11×11 |
| First row sum | **563** |
| First column sum | **569** |
| Off-diagonal pairs compared | 55 |
| Unequal mirrored pairs | **54** |
| Equal mirrored pairs | **1** |

Row sums:

`[563,617,287,540,743,513,577,579,603,537,486]`

Column sums:

`[569,429,641,669,518,611,463,690,378,578,499]`

Diagonal:

`[73,19,61,67,73,19,3,37,53,73,41]`

The literal prime-weight matrix is therefore **not symmetric** and has no zero diagonal. It cannot be the ordinary weighted adjacency matrix or distance matrix of the pictured undirected tree in this row-major representation. The 563/569 first-row/first-column match is real, but it does not turn the remaining matrix into a symmetric graph.

## Scope and decision

This rejects only the exact, simplest reading: row-major p32 GP-prime weights as a symmetric undirected adjacency/distance matrix. It does **not** exclude a directed graph, an independently permuted row/column representation, a nonlinear transform, or a different tree-related operation. None of those alternatives is selected by the original page, so do not rescue this hypothesis by trying arbitrary reorderings or reductions.

The tree correspondence remains a visual observation, not a decoded key. No plaintext, key, route, or intended destination is established by this test. This result belongs in intermediate evidence, not `results/README.md`.
