# Postselected 50×33 original-rune window: corrected repeat inventory and finite negative inverses

**Status (18 November 2026): corrected original-source decision.** The previous description of the 1,650-rune segment as a *doublet-free T7 void* was false. The fixed segment and its finite additive inverses remain useful as evidence of what was tested; its numeric alignment is **not a source-selected cipher target**. No plaintext or key was recovered.

## Actual source geometry and why the 50×33 premise fails

Concatenating the **56 original physical pages p0–p55** (p50 contains zero runes) in `resources/liber-primus/lp2-corpus.json` yields **12,956 GP29 runes** and **86 adjacent-equal sites**. The historically proposed half-open interval **[2739,4389)** contains **1,650 runes and three internal adjacent-equal sites**:

| Global index of second equal rune | GP29 transliteration |
|---:|---|
| 2740 | U |
| 3140 | AE |
| 3852 | G |

The true longest contiguous interval with **zero** adjacent equalities is **[3140,3852)**, only **712 runes**. Other long zero-repeat intervals include [8934,9596) (662), [1038,1591) (553), and [3852,4389) (537). All offsets are global zero-based ciphertext-rune indices; the interval may include a single rune from an adjacent doubled pair at either endpoint.

Every one of the **11,307** possible consecutive 1,650-rune windows was scored by the number of its **internal** adjacent-equal sites. The minimum is **three**, attained by **351** different starts, 2580 through 2930 inclusive. Start 2739 is one among them. Its pleasing equalities `2739=33×83` and `4389=33×133`, and the 50×33 factorization, are therefore **postselected within a broad tied plateau**. The previous inference that the source singled out an exceptional exact 50×33 void should be withdrawn.

A stricter consequence can be checked directly: **the genuine longest zero-equality interval is ordinary under an unconditional fixed-86-event position null**. With 86 equal-pair sites uniformly placed among the 12,901 valid within-physical-page pair positions, 20,000 seeded draws give median longest interval **721** runes, fifth percentile **532**, ninety-fifth **1074**. The observed **712** is reached or exceeded in **10,462/20,000** draws (finite-sample p **0.523124**). This null preserves original page lengths and total event count, but does **not** fix each page's observed event count or original line positions. A second independent-seed-stream calculation conditions on **every physical page's original repeat count**, then resamples positions uniformly within that page. In 20,000 draws its longest-gap median is **833**, fifth percentile **685**, ninety-fifth **1014**, and **17,954** draws reach or exceed the actual 712 (empirical upper-tail p **0.897705**). Thus the original gap is **not unusually long** even after preserving local page event counts; the result does not adjudicate the separately observed *ordering-sensitive inter-doublet gap autocorrelation*, or another generation-process model.

The isolated p50 addresses 83 and 133 came from other retrospective interpretations (signed-2016 "lies" and a red-event checksum); neither authentic source requires these window boundaries. The independent p57 interior count50 and p55 boundary count33 permit a 50×33 Cartesian key object, but **supply no rule identifying this 1,650-rune ciphertext slice**.

## Corrected, source-exact receiver controls

Both retained tests now load the entire actual original cipher (including p55), assert the three repeat sites, and use deterministic 0x3301-seeded matched-null generators. The earlier scripts contained invalid corpus-range checks (they excluded physical p55); the second also pointed to an absent transcription path, and the first null supplied 50 random key bytes to a decoder that sliced offsets 83–132. Those historical runner versions could not independently reproduce their reported null distributions. The corrected tests and independently computed outputs are:

| Frozen finite test on unchanged [2739,4389) | Result |
|---|---|
| Table p50 bytes83–132 as 50 row keys or bytes83–115 as 33 column keys, base60/base59, both signs and reversal (16 candidates) | Raw IoC **0.0346369701**. Best **0.0348413180** (base59, reversed table, column, add). Among **1,000** seeded matched complete-256-byte random keys, **195** have a best score at least this high (empirical p **0.195804**). |
| P57 fifty genuine interior runes × p55 thirty-three genuine boundary runes, additive GP-index/prime/totient representations, two signs and row/column reversals (24 candidates) | Raw Latin-trigram score **−5.66570990**; best source-selected test **−5.67949320** (totient, both reversals, add), **worse than raw**. Among **500** seeded random source-sized row/column keys, **298** equal or exceed the best source score (empirical p **0.596806**). |

The first decoder simply adds/subtracts a source byte reduced modulo29 for each row/column. The second decodes `P[r,c]=(C[r,c] ± (R[r]+K[c])) mod29`. These tests are finite, fully reversible under their chosen keys and do not recover coherent GP prose. A low IoC or inferior trained language score is conditional evidence against these exact operations; it is not a universal impossibility proof for all 50×33 decoders.

**Reproduction:** `sims/lp2_t7_window_ordered_doublet_correction_sft.cjs` verifies every source count and all window ties; `sims/lp2_t7_33x50_table83_133_sft.cjs` evaluates the first family; `sims/lp2_t7_33x50_p57interior_p55boundary_sft.cjs` evaluates the second. Both family scripts now load p0–p55 completely and use seeded controls.

**Windows Node22 verification (18 November 2026):** all three corrected original-input SFTs passed independently in Actions: [source-repeat geometry run 44263715929](https://github.com/FlareZ123/liber-primus/actions/runs/44263715929), [table-83/133 receiver run 44263722291](https://github.com/FlareZ123/liber-primus/actions/runs/44263722291), and [p57/p55 Cartesian receiver run 44263727990](https://github.com/FlareZ123/liber-primus/actions/runs/44263727990). The source geometry run was subsequently extended with a fixed-event permutation null (20,000 draws, seed 0x3301, observed longest interval712, median721, upper-tail p0.523124). That extra null requires a second run; the other two are already source-exact audited passes.

## Research decision

**Retire the “doublet-free 50×33 void” premise.** Any further decoding of this specific shape requires an independent original-authored reason to choose the starting rune, width, key source and operation. Preserve the limited negative results above; do not promote the factorization, postselected addresses or the 50×33 product alone into an authentic decryption path.
