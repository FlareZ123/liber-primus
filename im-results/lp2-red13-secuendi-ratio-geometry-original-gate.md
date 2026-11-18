# Original p0 red13 SECUENDI RATIO: exact geometric witnesses and a conditional source null

**Decision, 18 November 2026:** A newer [community 27×27 proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/red-heading-SEQUENDI-RATIO.md) yields the **candidate** title SECUENDI RATIO from the two genuine red words on p0. The C/K rune is interpreted as Q to give Latin SEQUENDI RATIO, “method of following.” The local inverse is exact, and the proposed source-key shapes really occur in the unaltered original 729-rune p0–2 grid. A conditionally shuffled-grid test finds the geometric matches often enough that this is still an **unverified** plaintext candidate with no source-selected continuation.

## Exact original ciphertext and reversible keys

The [original image adjudication](../im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) confirms the first 13 red runes, divided as two actual words of lengths 8+5, followed by the large thirteen-dot marker at offset13.

| Original readout | Authentic GP29 indices | Periodic GP29 subtraction key | Candidate runes |
| --- | --- | --- | --- |
| Red word1, reversed right-to-left | [0,27,19,6,3,18,8,15] | [14,9,14,5] (X N X C) | S E C U E N D I |
| Red word2, left-to-right | [15,26,18,21,5] | [11,2,2] (J TH TH) | R A T I O |

Reapplying the keys reproduces all original red ciphertext runes exactly. The editorial C/K to Q reading is an additional choice. The phrase is grammatically plausible, as illustrated by Caesar's attested **sequendi rationem** expression in [Lewis' Latin dictionary](https://archli.com/dictionary/lewis-elementary-latin-dictionary/ratio-194863). Neither English nor Latin plausibility authenticates a text found after selecting its key and direction.

## Exact source-node census

The unmodified p0–2 grid contains **one physical rectangle** with clockwise corners X N X C at rows (6,24) and columns (3,9). Its reverse read from the opposite X is the same physical rectangle, not a second independent witness. It contains the original positive-slope diagonal **J R TH** at (13,12), (18,17), (23,22), spaced by five cells on each axis. Euler's totient of original center index4 (R) is 2 (TH), furnishing J TH TH.

The latter motif is not unique under the allowed broader model. There are **six** ordered equally spaced straight three-rune sources J {O,R,G} TH in all eight compass directions and integral lengths within the grid, since φ(3)=φ(4)=φ(6)=2. This includes the published example.

## Conditional randomization

Keep the original first **13 red title runes fixed**, and shuffle the remaining **716** grid symbols uniformly without replacement, preserving their exact multiset. On 10,000 reproducibly seeded permutations (xorshift32 seed 0x47a11fee), enumerate every eligible axis-aligned X N X C rectangle and every equally spaced J {O,R,G} TH triple. The frozen title-derived keys and geometric search criteria are intentionally granted in the null; this experiment tests only whether **these** geometry witnesses add independent evidential force.

| Original requirement | Original count | Conditional shuffled-grid tail (10,000 draws) |
| --- | ---: | ---: |
| At least one X N X C rectangle | 1 | **0.39196** |
| At least six matching key-2 triples | 6 | **0.20108** |
| Both requirements | 1 and 6 | **0.08229** |

See the exact [read-only Node22 CommonJS source SFT](../sims/lp2_redtitle_secuendi_ratio_geometry_control_sft.cjs), which asserts all original positions, inverse plaintext, and deterministic conditional control counts. The 0.08229 figure is **not** a discovery-wide p-value: the Latin target, initial positions, directions and key operations were retrospectively selected, so selection multiplicity is absent from this null.

## What this changes

The first 13 runes now have a **fully reproducible, source-positioned Latin-looking candidate** useful for constructing a frozen hypothesis. Their original author-selected decryption remains unknown. The exact geometric witnesses cannot independently certify the candidate, and the more literal [rightmost-column “east of the map” continuing key](lp2-27x27-proposed-east-column-key-original-holdout.md) has already failed all six fixed original-input sign/clock tests across unknown pp3–55. The next viable advance must select the title key rule before choosing its plaintext and recover an untouched ciphertext sentence. Do not launch further retrospective grid-coordinate searches without that selector.
