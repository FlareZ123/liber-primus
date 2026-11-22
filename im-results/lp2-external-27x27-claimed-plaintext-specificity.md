# External 27×27 claimed plaintext: original-cipher specificity gate

**13 November 2026, Agent 22. Classification:** independently executed original-input ambiguity and coverage gate on a new outside proposed solution. **No authenticated unknown LP2 plaintext, key, cipher or destination recovered.** This tests the public proposal's flexible basic key/path family, not every conceivable constrained grid cipher.

## The external claim and independent source

The public [2retooz270703 proposed solution](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) claims pages 0–2 yield **“AS I GO, THE WEATHER TURNS COLD”** followed by 38 short plaintext blocks including **“THE KEY IS TO GO TO THE EAST OF THE MAP.”** Its documented [operation](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/00-decryption-method.md) concatenates all 729 original GP29 runes into a 27×27 grid, selects equally spaced three-rune line nodes, optionally applies Euler's totient to the center, derives a three-key cyclic phase from Möbius values, and subtracts a repeated three-rune key modulo 29 from independently selected ciphertext rays. The later published transition reports constrain some successive choices while the exact next source remains unselected by any author-authenticated LP2 instruction.

The independent test uses the unchanged [original GP29 corpus](../resources/liber-primus/lp2-corpus.json). The outside original [HTML map](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/0-2-live-map.html) is frozen at commit ab9d8190e60009179563ac21b2d750271c2782b3, HTML blob 9d63d54570c52e3abae52aaed16ab182576ff58c. Its stage-to-ciphertext cell associations are preserved as a small derived [JSON coordinate snapshot](./lp2-external-27x27-cipher-stage-cells.json), without copying the third-party HTML.

## Direct coverage of original pages 0–2

The outside HTML assigns exactly **38 stages** to **115 ciphertext cell uses**, covering **103 distinct cells of 729** (14.13%). **626 original rune positions are never consumed as proposed ciphertext**. Twelve of the ciphertext uses repeat previously selected cells across 11 reused positions. Only **205** of the 729 positions appear in any of the four visible markup roles (cipher, key, route, mirror). This is a sparse candidate extraction rather than an actual full decryption of the original 729-rune page interval. A sparse carrier remains possible in principle if an original clue selects the route.

## One exhaustive, source-exact discriminating test

Enumerate the finite choices in the external basic operation **without optimizing on any plaintext**: four undirected axes, source-node radius 1–13, original or totient-transformed center, Möbius-derived phase, and original straight ciphertext rays in eight directions. Omit nodes with a zero key component as the external implementation does. The unaltered 27×27 source contains **26,024 admissible source-key occurrences**, covering **12,917 distinct aligned GP29 three-rune keys**. To test a fixed desired reading, subtract the desired GP indices from the actual ciphertext indices and require the resulting key to repeat every three positions. Count the original source nodes matching that exact inferred key.

| Frozen GP reading | GP rune count | Possible straight rays | Period-three compatible rays | Rays with an original three-rune key | Source-node × ray matches |
| --- | ---: | ---: | ---: | ---: | ---: |
| WEATHER | 5 | 4,600 | 5 | **3** | 6 |
| TURNS | 5 | 4,600 | 5 | **3** | 8 |
| LUXOR (unrelated control) | 5 | 4,600 | 7 | **4** | 6 |
| ABCDE (unrelated control) | 5 | 4,600 | 2 | **1** | 3 |
| SOLAR (unrelated control) | 5 | 4,600 | 7 | **3** | 5 |
| COLD | 4 | 4,896 | 144 | **85** | 153 |
| KEY (GP C/K·E·Y) | 3 | 5,200 | 5,200 | **2,693** | 5,301 |
| DEATH (GP D·E·TH) | 3 | 5,200 | 5,200 | **2,679** | 5,422 |
| GO | 2 | 5,512 | 5,512 | **5,153** | 171,503 |

The published WEATHER location **(14,14), rightward**, with aligned key **X–X–I**, is one of three original-source supported five-rune straight rays that output the identical word. The other alternatives begin at **(23,12), southeast** and **(25,14), westward**. The same claimed WEATHER key arises from **four distinct original source nodes**. The external operation therefore does not uniquely select even this showcased plaintext.

For a five-rune target under a three-rune periodic key, two equality constraints remain after freely choosing the three key values. For independent uniform GP29 runes, the exact expected count is **4,600/29² ≈ 5.47 compatible rays** for any fixed five-rune target, before requiring key-node support; the original ciphertext supplies five for WEATHER. The four-rune corresponding expectation is **4,896/29 ≈ 168.83 rays**, compared with 144 for COLD. These are simple null expectations, not calibrated p-values because ray samples overlap. Two- and three-rune readings have no excess periodic-key constraint, explaining the thousands of KEY and DEATH hits. Nonsense or unrelated five-rune controls also yield full valid decryptions under this family.

## Decision

The proposed word arithmetic is internally reproducible for selected cells and keys, yet source-key/path selection has large degrees of freedom and 626 original cells have no claimed plaintext image. The reported coherent phrase is thus **unestablished as actual Liber Primus plaintext**. Retire this published flexible three-rune-key interpretation as a *unique decryption*; further fitted word-level coincidences are low-value. Reopen on an independently source-selected deterministic traversal that predicts an untouched next block and then recovers material currently unused by the proposed route.

Reproducer: [standalone Node 22 CommonJS SFT](../sims/lp2_external_27x27_claim_specificity_sft.cjs), using the canonical corpus and frozen stage coordinate JSON. It passed on original repository inputs in [GitHub Actions run 43493414795](https://github.com/FlareZ123/liber-primus/actions/runs/43493414795). The result does not exclude a genuinely predetermined sparse map scheme or different keyed decipherment.
