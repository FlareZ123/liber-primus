# LP2 p32 interior 10×10: all-secret Data Matrix finder obstruction

**Agent26, 13 November 2026. Decision:** a simple stationary rune-to-binary interpretation of the 10×10 interior of original p32 **cannot be a perfect ECC200 Data Matrix finder**, regardless of which of the 2²⁹ rune-to-bit maps is secret or which of eight spatial orientations is chosen. No unknown plaintext, authentic key, binary payload or destination was recovered.

## Why this target exists without tuning ciphertext

The original LP2 physical p32 has **121 GP29 runes**, which can be reflowed in original reading order as an **11×11** array. The prime weights of its entire first row and first column are exactly **563 and 569**. Those are independently recorded as the dimensions of the Cicada-signed 2016 tree image and have been established in [the signed-image axis study](lp2-p32-signed2016-tilepixel-key-gate.md). This is an inferred reflow, since the physical page prints prose lines rather than an actual 11×11 code. Treating the first row and first column as metadata leaves a natural **10×10 interior** with 100 rune symbols.

**10×10** is the smallest square ECC200 Data Matrix symbol. The [period-available ISO/IEC 16022:2006 specification](https://standards.iteh.ai/catalog/standards/iso/4eddf09b-6384-4ac9-bb9e-b77099045d5c/iso-iec-16022-2006) defines its perimeter: a one-module finder with **solid left and lower sides** and **alternating upper and right sides**. This offers a cheap, source-motivated, prospective syntax test before looking for a payload, an OCR text, or a fitted key. No Cicada instruction names Data Matrix or says to binarize the p32 runes, so the proposal remains conditional.

## Stronger test than guessing any bit alphabet

Let a static, secret map `b(rune)∈{0,1}` assign each of all 29 GP glyphs an arbitrary light/dark bit. There are **2²⁹ possible maps**, but none needs enumeration. In a proposed finder, each source rune printed on the 36 perimeter cells creates a requirement that `b(rune)` be dark or light. The same rune must receive the same bit everywhere.

For each rune symbol `r`, count `n₀(r)` source perimeter appearances requiring light and `n₁(r)` requiring dark. The least possible border errors across **every** secret map is exactly:

`minimum_errors = Σ_r min(n₀(r), n₁(r))`.

If any rune appears on both light and dark finder positions, a perfect stationary-symbol readout is impossible. The certificate is independent of English, prime-sum keys, GP index parity, fitted thresholds, compression or error-correction codewords. Mirroring and four quarter-turn orientations give eight complete source-shaped alternatives. Complementing the dark/light polarity is already included in the unrestricted bit map.

| Quarter-turns | Unmirrored minimum errors /36 | Mirrored minimum errors /36 |
| ---: | ---: | ---: |
| 0 | **5** | **5** |
| 1 | **5** | **5** |
| 2 | **8** | **5** |
| 3 | **5** | **8** |

Every orientation uses **36 finder cells with 22 distinct source glyphs**. At least **4–7 glyph identities** per orientation need contradictory light and dark assignments. For example, with the unmirrored printed orientation, rune **B** appears twice where light is required and twice where dark is required, and rune **W** appears once light/twice dark. Even granting an arbitrary best-fit secret alphabet leaves **at least five incorrect finder modules**.

This does **not** claim that a real Data Matrix reader would necessarily reject five physically damaged finder cells; the exclusion concerns an **exactly encoded** symbol using one stationary rune-to-bit map, with no corruption or per-cell secret. A stateful, position-varying, multi-rune, or differently partitioned code is outside this family. A different bit extraction must have an independent source clue rather than being fitted to the finder.

## Positive control and next research decision

The [single-file CommonJS reproducer](../sims/lp2_p32_inner_datamatrix_allsecret_sft.cjs) reads the exact [original LP2 corpus](../resources/liber-primus/lp2-corpus.json), asserts all 121 source ordinals and the independently known **563/569** row/column checksums, and calculates all eight absolute all-secret lower bounds. As a positive control, it plants a genuine 36/36 ECC200 finder into a *separate synthetic* 10×10 rune grid using a fixed 0/1 GP glyph palette; the same optimal solver reports **zero** border errors. The original grid is never altered.

**Decision:** retire the keyless or stationary glyph-alphabet 10×10 Data Matrix hypothesis. Its lower bound is a complete symbolic obstruction, so additional bit-permutation or rune-subset sweeps cannot rescue it. The axis-sum relation itself remains a real source arithmetic observation. It still has no specified inverse from original cipher runes to plaintext; that is the missing input for any productive successor.

This result belongs in intermediate research. It supplies no fresh positive decipherment and does not change [the authoritative solution status](../results/README.md).
