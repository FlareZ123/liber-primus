# Original p50 numeric grid as a complete compass path: exhaustive all-map original-byte gate

**Agent4, 15 November 2026.** The 2016 signed-message statement that Liber Primus's **“numbers are the direction”**, the original **32×8 table**, and the exact byte range **0–255** together suggest a specific, inexpensive possible decoder: each 8-bit cell represents eight compass exits, or a five-bit GP29 value with a three-bit next-step arrow. This is a human-motivated candidate, **not an authentic instruction that the source selects either model**. Both entire model families are decisively rejected against the 256 original table bytes, including all **8! = 40,320** possible secret assignments of numeric bit/code to the eight compass directions. No plaintext or key is recovered.

## Frozen source geometry

The untouched [canonical original-token reconstruction](../resources/liber-primus/lp2-grid-256.json) yields exactly 256 base60 interpreted bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, in 32 printed rows × 8 columns, spanning physical p49–51. The original table is a **printed 2D rectangle**, unlike a hypothesized key reordering. Use all eight neighboring directions, clockwise `N,NE,E,SE,S,SW,W,NW`. Permit every one-to-one mapping between eight numerical codes and the eight directions. No byte changes, rotations of source glyphs, English crib, or key score can be tuned.

### A. Eight exit bits: any undirected compass adjacency map

If each byte's eight bits record whether an undirected exit exists to a neighboring cell, a bit pointing beyond the table must be zero and the neighboring cell must encode its reciprocal edge with the opposite-direction bit set. These are necessary **topological invariants**. Original rectangle has **906 distinct neighboring pairs**, partitioned by primary direction **248 N/S, 217 NE/SW, 224 E/W, 217 SE/NW**.

Enumerate **all 40,320 arbitrary bit-to-compass assignments**. Optimize the total number of (1) inward edges whose two directed exit bits disagree and (2) boundary flags whose direction leaves the rectangle. The best original assignment still requires:

| Necessary-condition violation | Best among all 40,320 maps |
| --- | ---: |
| Nonreciprocal interior edges | **405 of 906** |
| Outward-pointing boundary bits | **104** |
| Total | **509** |
| Minimum boundary violations even optimizing that alone | **97** |

A valid undirected compass mask needs **zero** such violations. A planted 32×8 symmetric N/S/E/W lattice attains **zero**, including the outer boundary. Thus the original bytes are not a literal eight-direction **reciprocal** adjacency mask under any global choice of the eight bit meanings.

### B. Three-bit arrow plus five-bit GP29 symbol: any starting point

A second, potentially more useful reader takes the table byte as **5+3 bits**, with the three-bit field selecting one of eight compass moves and the five-bit field carrying a GP rune index (0..28) or one of three special codes (29..31). The direction can occupy either the low three or high three bits. The other five bits need not be interpreted or decrypted to test whether a single unambiguous directed route visits the printed table. Permit **any starting cell (all 256)** and **every permutation of the eight numeric direction meanings**, with both bounded-grid and wraparound/toroidal navigation.

The directed graph has exactly one arrow per cell; a true complete-table route must visit **256 distinct cells before leaving the grid or revisiting one**. Compute the longest starting path on each of the **4×40,320** candidate functional graphs with a linear-time cycle/tail traversal. Source-original best possible:

| Three-bit direction field | Printed boundary stops | Toroidal wrap |
| --- | ---: | ---: |
| Low three bits | **41/256** | **49/256** |
| High three bits | **31/256** | **49/256** |

These are exhaustive upper bounds for any **one deterministic 3-bit arrow per original byte**, all fixed compass relabelings and all starting positions, under these two boundary conventions. The five-bit companion's original rune histogram is nearly flat (GP/32 IoC 0.03315), and 25/256 high-five values fall in codes 29..31; interpreting those three as punctuation would require a separate author rule. Crucially no choice of the arrow relabeling can even read the entire table as one 256-symbol self-routing message.

Two planted controls construct exact Hamiltonian snakes across all 256 source-shaped 32×8 cells, with five-bit GP rune payloads embedded in either the low-three or high-three arrow construction. Both give **256/256** visited cells under the test. Therefore the original gate does not fail because of a broken graph traversal, scoring, or missing final stopping convention.

[Original 256-byte Windows Node22 SFT, all 40,320 maps](../sims/lp2_p50_compass_byte_direction_allperm_sft.cjs) · [Windows Actions run 43724666685: PASS](https://github.com/FlareZ123/liber-primus/actions/runs/43724666685).

## Decision

Both source-shape-motivated interpretations fail an exact necessary condition, even after granting a completely secret permutation of the eight compass directions. This retires the **unmodified grid-as-undirected-eight-exits** and **unmodified 5+3 one-arrow full traversal** readings without needing a plaintext scorer. It says nothing about a different coding scheme, a page/image-specific key, per-cell key-changing arrows, directed multibranch walks, or meanings of printed numbers outside this source geometry. Those extensions require genuinely independent instructions or an actual decoded plaintext before investing further. No LP2 unknown-page plaintext, historical key or puzzle destination is identified.
