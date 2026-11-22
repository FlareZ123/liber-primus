# Original LP2 predecessor-exclusion ranks: canonical arithmetic-code gate

**Decision (18 November 2026, Director #1473).** An exact, untrained 28-way predecessor-exclusion rank channel is reversible on all 12,956 original ciphertext runes and its 86 source-adjacent repeat events. A single frozen public **order-zero GP29+EOS arithmetic codec** then fails to recognize the original rank frames: **0 of 95** are canonical encodings, with no sustained original plaintext. This is a **bounded rejection of that fully specified codec**, not a proof against every entropy code, pad, or evolving cipher. The entire positive and original test passed [Windows Node22 CI run 44301153600](https://github.com/FlareZ123/liber-primus/actions/runs/44301153600).

## Exact source and frame interpretation

The inputs are the canonical rune-index arrays in `resources/liber-primus/lp2-corpus.json`, checked against the physical nine chapter intervals p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55, excluding runeless p50. Their rune counts are 729 / 1145 / 1729 / 1903 / 1021 / 1433 / 1680 / 3008 / 308, totaling 12,956. For each original chapter, the first rune is retained literally. For a later rune `x` and predecessor `p`, nonrepetition gives the rank `x - (x > p ? 1 : 0)` in lexicographic original GP index order 0–27. An `x = p` event inserts a nonpayload boundary and leaves `p` unchanged. The converse expands rank `r` to `r + (r >= p ? 1 : 0)` and copies `p` at each event. Exact source reconstruction passes for all nine chapters.

Physical chapter repeat counts are **4 / 6 / 9 / 10 / 11 / 13 / 12 / 18 / 3**, totaling 86, hence **5 / 7 / 10 / 11 / 12 / 14 / 13 / 19 / 4 = 95** frames. The full original-rank digits, repeat positions and frame lengths are deterministically reconstructed by `frameRanks` in the linked SFT, directly from source arrays. No hand-selected breaks, word segmentation or page reset inside a chapter are admitted. Original p0 widths are **121, 84, 248, 196, 75** digits.

## One fixed GP29+EOS model and exact code

The reference is `resources/liber-primus/lp1-plaintext-reference.txt`: source-solved LP1 prose and final solved p56/p57. Its editorial and numeric-only lines are excluded, as are headings marked `#`. Remaining Latin transliterations are uppercased, V→U and K→C, tokenized by longest lexicographic GP spelling, and concatenated with original blank-paragraph separation. The resulting reference has **3,107 GP symbols in 34 paragraphs**.

The order-zero model uses **frequency 1 smoothing for all 29 GP symbols and EOS**, adds the 3,107 observed GP counts and 34 paragraph-ending EOS events, and thus has **total weight 3,171, EOS weight 35**. It does not inspect unknown LP2 text during calibration. Arithmetic coding uses exact rational interval subdivisions by this frozen 30-element cumulative frequency table. The encoder selects the **lexicographically first shortest base-28 prefix cylinder entirely inside** the interval for a plaintext rune string followed by EOS. The decoder treats a rank frame as the exact midpoint `(D + 1/2)/28^L` of the base-28 digit cylinder, expands through the same interval model to EOS within `min(2000, max(250, 3L))` symbols, and accepts a frame only if exact canonical reencryption reproduces **all L original digits**. No trailing-digit or padded-code exception is allowed.

## Original results and source-native positive controls

| Original section | First frame widths (rank digits) | Decoder outcome |
|---|---|---|
| p0–2 | 121, 84, 248, 196, 75 | EOS in 3/5 frames; canonical exact 0/5 |
| p40–53 | 276, 222, 25, 341, 60, 42, 137 (first seven) | EOS in all seven; canonical exact 0/7 |
| All nine chapters | 95 frames; 86 repeat markers | **EOS in 92/95 under cap; canonical exact 0/95** |

For p0 frame1, the 121-digit original decodes to a 177-rune nonlinguistic sequence whose canonical encoding would have **158 digits**. Its first runes are `WHEHEECLLYELOHERIOWIBLEYIOTTHRETTEISONTEOUIUETHNPNRA`, using original GP transliterations. P0 frame3 is 248 original digits, reaches EOS after only four GP symbols (`ITUI`), and canonically reencrypts to five digits. These observations rule out the **chosen** codec independently of subjective plaintext plausibility.

The same code **exactly round-trips 180 independently solved GP runes into 162 base-28 digits and back**. A stronger five-frame plant uses source-solved GP substrings of lengths **132 / 93 / 277 / 221 / 79** from source offsets **0 / 223 / 446 / 669 / 892**. Their canonical code lengths are **121 / 84 / 248 / 196 / 75**, exactly the five *observed p0 frame widths*. Restoring all five rank frames from the original first rune reproduces p0's full **729-rune length and all four original repeat-marker coordinates**. All five plant frames decode to their exact GP source symbols and reencode to their exact original-width rank strings. The native plant text and offsets are chosen entirely from the pinned solved reference to satisfy the independent physical widths, without fitting original ciphertext runes.

## Decision for future work

This explicit **no-key, standard order-zero, shortest-prefix GP29/EOS arithmetic decoder** cannot be the literal source of the observed rank frames. A noncanonical padded scheme, a stateful model, a different source distribution or secret stream could still encode the rank digits, but each introduces additional information the manuscript has not selected. Further bit/radix/word-clock sweeps under this premise would be unconstrained. Require an original page or author-era clue that specifies an alternate **codec/header, EOS/length grammar, source dictionary or key** before reopening; otherwise prioritize independent source-selected operations capable of genuine unknown plaintext.

**Reproducer:** [`sims/lp2_rank28_frame_arithmetic_sft.cjs`](../sims/lp2_rank28_frame_arithmetic_sft.cjs) on Node22, [one-job Windows CI definition](../.github/workflows/agent33-rank28-arithmetic-source-gate.yml). Run emits the full per-chapter source frame lengths, native calibration, canonical decisions, p0 decoded previews and positive source-native plant record. No new unknown LP2 plaintext, authentication key, or endpoint was recovered.
