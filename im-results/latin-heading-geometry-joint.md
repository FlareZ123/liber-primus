# Source-frozen LP2 red heading: exact Latin candidate and joint geometry null

**Agent 24, 10 November 2026. Classification: intermediate, conditional test of an independently published proposed plaintext.** The candidate Latin reading, the four-rune rectangle and the three-rune key route were **published before** this investigation by [the external 27×27-route project](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/red-heading-SEQUENDI-RATIO.md). This study supplies an independent source-original algebraic inverse, a finite geometric enumeration and a matched joint null. It does **not** authenticate the proposed plaintext, derive the key uniquely in advance, recover another unknown LP2 passage or establish Cicada's intended encryption.

## Source-fixed 13-rune proposition

The first 13 runes of physical LP2 page 0 are independently coloured red and delimit two words of lengths eight and five. In the canonical 29-rune source, they have zero-based GP indices:

- First word: `[15,8,18,3,6,19,27,0]`; read **right to left** to get `[0,27,19,6,3,18,8,15]`.
- Second word: `[15,26,18,21,5]`; read **left to right**, unchanged.

Subtract the periodic source keys `K4=[14,9,14,5]` and `K3=[11,2,2]`, independently resetting at the physical word boundary, modulo 29. The first produces plaintext indices `[15,18,5,1,18,9,23,10]`, transliterated **SECUENDI**. The second produces `[4,24,16,10,3]`, **RATIO**. The C/K GP rune at index 5 is interpreted as Q to propose the Latin phrase **SEQUENDI RATIO**, meaning approximately *method of following*. Both repeated-key outputs **exactly re-encrypt** the 13 original runes. The phrase and key choices were made in the prior external proposal; the local confirmation is an arithmetic consistency check, not fresh cryptanalysis of withheld text.

The source for the associated 27×27 square is exactly the **729 continuous runes of original LP2 physical pages 0, 1 and 2**, with individual lengths **262, 266 and 201**, in [the committed numeric rune corpus](../resources/liber-primus/lp2-corpus.json). A fixed opening source root is `J=11` at the one-based square cell **(13,12)**, as selected in the prior route.

## Source geometry and exact finite constraints

The four-rune key follows the clockwise corners of a rectangle: **(6,3)=X14**, **(6,9)=N9**, **(24,9)=X14**, **(24,3)=C/K5**. The X corners (6,3) and (24,9) have equal squared Euclidean distances from the opening J root (13,12). Enumerating all ordered, nondegenerate axis-aligned rectangles in the square satisfying this key sequence and equal-root-distance constraint finds **exactly one** original candidate, at those coordinates.

The second key is a full equally spaced straight source of three original cells, beginning at the fixed J root: **(13,12)=J11**, **(18,17)=R4**, **(23,22)=TH2**. Transform the central rune by the integer Euler totient `φ(4)=2` to produce the periodic key `[11,2,2]`. Enumerating every allowed nonzero radius 1–13 in all eight compass directions with the root fixed finds **exactly one** source of original `[11,4,2]`.

These two patterns use different geometric families, which are **frozen from an existing fitted interpretation**. A unique match within a postselected family is not an independently selected key schedule.

## Matched conditional null on all 729 source cells

Freeze **all thirteen** original heading ciphertext runes and the published J anchor rune at (13,12). The remaining **715** cell values are Fisher–Yates shuffled as an actual multiset, preserving the full **729-symbol source rune inventory**, including the anchor and heading. The two constrained geometric families above are enumerated independently on every shuffled square. The test demands existence of **at least one** qualifying rectangle *and* **at least one** qualifying straight key source. Do not select any additional Latin word or optimize a language score inside the null. Exactly the same fixed key labels and geometry criteria are applied to every null.

The 100,000-trial Monte Carlo, seed **0x24131329** using 32-bit xorshift32 and rejection-free Fisher–Yates modulo draws, completed successfully on the unmodified original GitHub repository using **Windows Node.js 22**.

| Preselected geometric criterion | Original square | Random controls meeting criterion / 100,000 | Add-one upper tail |
|---|---:|---:|---:|
| The X–N–X–C equidistant-root rectangle | 1 occurrence | **142** | **143/100001 = 0.001429986** |
| The fixed-root J–R–TH straight triple | 1 occurrence | **5,962** | **5963/100001 = 0.059629404** |
| **Both** preselected key geometries exist | **Both exist** | **11** | **12/100001 = 0.000119999** |

Mean occurrence counts over the nulls are **0.00142 rectangles** and **0.06132 straight triples**. The two conditions are not independent: both use the same source square, root, and rune multiset. The joint tail was therefore measured directly without multiplying marginal estimates.

**Interpretation and decision.** The literal geometric alignment is uncommon under this specifically matched inventory-shuffle null. It is a **conditional rarity of an already chosen phrase-and-geometry family**. The entire external route selected phrases, coordinates, directions, word division, transformations and numerical correspondences retrospectively from the very square being analyzed; no discovery-wide multiplicity adjustment is available. Random square shuffles also destroy the manuscript's original within-word rune adjacency. This experiment supplies no evidence that the candidate would survive source-independent prediction, another page, or a distinctive original LP2 cipher model. It must remain **unverified intermediate work**, not enter the authoritative catalogue of decrypted LP2 plaintext in `results/`.

The next authentic gate is to fix from the original heading **a deterministic, unambiguous rule locating and decoding a genuinely unexamined LP2 ciphertext span**, then verify exact forward encryption without post-hoc word selection. The proposed red phrase could guide exploration, but it supplies no presently established continuation rule.

**Reproduce:** [standalone CJS source and exact original source assertions](../sims/latin_heading_geometry_joint_null.cjs) with argument `100000`; [manual-only Windows Node 22 workflow](../.github/workflows/latin-heading-geometry-joint.yml); [completed successful Actions run 42808098193](https://github.com/FlareZ123/liber-primus/actions/runs/42808098193). No third-party code is necessary to reproduce the original arithmetic or the null; only the external interpretation of the phrase and selected geometry is reused.
