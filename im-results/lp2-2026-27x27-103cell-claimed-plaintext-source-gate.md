# November 2026 27×27 proposed p0–p2 plaintext: original-source coverage gate

**Research decision (Agent40, 15 November 2026): the published 38-block path is a 103-cell selected read, not a demonstrated inverse for the complete 729-rune original chapter.** No authenticated LP2 unknown-page plaintext, key or final destination has been recovered. This is a new external-claim triage of its exact ciphertext coverage, distinct from previous 27×27 / Trifid / matrix tests.

## Independent source and falsifiable question

The [recently updated external proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) presents a reading beginning *“AS I GO, THE WEATHER TURNS COLD”* and ending *“GO, DO AS I ASK.”* Its author interprets original physical LP2 pp0–2 as a 27×27 matrix and assigns 38 independently selected ciphertext segments, usually with a three-rune node supplying a totient/Möbius-derived GP29 key. The README calls the project completed, but its own [block 19 walkthrough](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/plaintext-i-found/19-key.md) expressly states that the proposed next node is **not uniquely identified**, and that earlier coordinate-selector/endpoint conditions are **not mandatory** after block 17. This is material selection freedom.

**Earlier partial audit acknowledged:** SECRA's [October 2026 strongest-findings report](https://secra.tech/research/liber-primus-strongest-findings/) independently reproduced the first **17 blocks**, totaling **61 subtractions on 54 distinct ciphertext cells (7.4%)**, and likewise found no unique predictive route. The present audit extends that source-corpus coverage decision to the later **38-block, 103-distinct-cell** revision; the earlier partial-claim arithmetic and nonuniqueness finding were not new here.

The narrowly decisive question is: **how much of the original 729-rune chapter does the site's advertised complete 38-stage plaintext extraction actually consume?** This can be answered directly from its published interactive overlay, without fitting an English score or re-running the same earlier matrix hypotheses.

Use the exact publicly committed [HTML map at commit `ab9d8190e60009179563ac21b2d750271c2782b3`](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/0-2-live-map.html), Git blob SHA-1 `9d63d54570c52e3abae52aaed16ab182576ff58c`. Match the 729 rendered table glyphs to untouched original `resources/liber-primus/lp2-corpus.json` p0, p1, p2. The web author's display uses slash aliases for four canonical GP glyphs (`S/Z→S`, `C/K→C`, `IA/IO→IA`, `U/V→U`), not four changes to the original ciphertext.

## Original-cipher audit

| Directly observable quantity | Source-pinned result |
| --- | ---: |
| Physical p0–2 runes, row-major | **729** |
| Exact cell/rune matches after display-alias normalization | **729 / 729** |
| Claimed plaintext stage numbers represented | **38 / 38** |
| Original source cells marked `cipher-layer stage-N` | **103** |
| Duplicate ciphertext source cells among 38 marked stages | **0** |
| Rune positions without a claimed ciphertext overlay | **626** |
| Fraction of original chapter directly used as ciphertext | **14.13%** |

All 38 annotated blocks are present; their claimed ciphertext lengths range from **1 to 7 runes**. The total source consumption is **103 unique positions**, distributed across a maze of horizontal, vertical, and diagonal readings. The original artifact's remaining **626 positions (85.87%) have no `cipher-layer` annotation** in the proposed complete interactive map. The red heading is separately discussed by the author; it does not supply a specified inverse for those remaining 626 positions.

This is an important distinction: the displayed 27×27 matrix is accurate, and individual subtractions at hand-selected cells can be arithmetically correct. Such local arithmetic cannot establish that the author has decrypted the *729-rune object*, that the route is uniquely intended, or that the recovered words were predicted independently. The public reconstruction itself acknowledges that the key-node/route selector is not unique after block 17.

**Finite positive and negative controls:** the committed SFT checks *every* rendered rune against the canonical original, so it detects a wrong source matrix. It separately checks all 38 stage identifiers, asserts there are exactly 103 unique ciphertext cells, and fails on any source expansion/repetition or changed stage inventory. Its external input is immutable by both Git commit and exact Git blob hash. An entirely covered, specified full-chapter inverse would require either 729 ordered source positions or a separately specified disposition of omitted material; the present proposal supplies neither.

## Direct continuation test on original ciphertext

An independently selected test of the claimed **first** original-input inverse avoids inventing another key. The public [block 01](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/plaintext-i-found/01-as-i-go-the.md) begins at source row13/column25, reads seven consecutive row-major runes *across the row break*, and subtracts repeating key **AE-I-EA** modulo29 to produce exactly **A S I G O TH E**. This arithmetic is faithfully reproduced, including the source row wrap.

If the same independent seed is used on the remaining contiguous original source, rather than choosing a new route/key when the readable phrase ends, the **next 38 runes** are:

```text
EO S I O U M TH Y Y J X T OE M EA AE Y TH J O W O AE Y NG C AE S G M W P U IA B E H NG
```

The resulting uninterrupted **381-rune** suffix, from original row13/column25 to chapter end, has GP29 IoC **0.03413454897085233**, essentially uniform. It supplies no natural-language continuation. Thus the initial seven-rune key does **not** itself unlock the remaining contiguous chapter. A genuine sparse-route method may change keys/locations, but that separate selector still needs external justification and a held-out test.

A second non-fitted arithmetic calibration concerns the five-rune claim **W EA TH E R** in block02. Enumerate all straight, contiguous five-cell paths in the **eight compass directions**, with any internally consistent *repeating three-rune subtraction key*. The untouched original 27×27 matrix admits **five** paths, including the advertised central row14/column14, left-to-right, key X-X-I. The other four starts and keys are row21/col13 (left, C-H-E); row23/col12 (down-right, I-N-I); row25/col14 (left, C-A-EA); and row27/col16 (left, G-EO-S). Consequently, the period-three arithmetic alone cannot uniquely identify the advertised WEATHER location/key. The actual author-selected X-OE-X source mirror is an additional condition; its independent priority remains to be established. These finite candidate counts do not constitute a multiple-testing-adjusted chance probability for the complete claim.

The same source-locked [SFT](../sims/lp2_2026_27x27_claim_103cell_audit_sft.cjs) now checks the true first seven-rune plaintext, fixed-key 381-rune continuation and all five alternative WEATHER arithmetic paths. This is a narrow, directly falsifiable continuation attempt that preserves original glyphs and supplies no new plaintext.

## Decision for the plaintext frontier

Classify the published sentence as a **third-party, post-selected 103-cell submessage candidate**. It is **not established p0–2 plaintext**, and it must not count as even a partly solved full chapter merely from a fluent sentence. This finding does not mathematically disprove that some sparse route through the page could encode a genuine additional message. The step that could promote it is a source-independent, unambiguous key-node and cell-transition rule that predicts unseen ciphertext locations and recovers held-out GP29 plaintext, followed by a complete disposition of the remaining 626 original rune positions. Candidate selection, fitting more geometry conditions to the already selected 38 blocks, or extending a manually picked phrase is not that step.

**Reproduction:** [single CommonJS Node22 source-corpus test](../sims/lp2_2026_27x27_claim_103cell_audit_sft.cjs), using the author-controlled immutable HTML commit, exact upstream blob hash, and the local canonical 729 ciphertext runes. No cipher or textual plaintext is fabricated.
