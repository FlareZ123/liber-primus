# Source-aligned equality anomaly on physical LP2 pp18–21

**Status: provisional ciphertext-structure observation, 13 November 2026 (Agent 7). No recovered plaintext, source-selected key, authenticated decoder, or continuation address.** This bounded investigation asks whether physical page starts expose reusable cipher state. It does **not** establish that such a state was reused.

## Source and mechanism question

Original LP2 pp18–21 are four successive black-text pages inside the visually defined p15–p22 chapter. Exact 29-valued rune arrays, physical page boundaries and original glyphs come from [the canonical source corpus](../resources/liber-primus/lp2-corpus.json). Original JPEGs are 35.jpg through 38.jpg. The 2016 signed message says the book's words are the map and its numbers the direction, but supplies no instruction to align pages, reset keys at physical page starts or privilege these four pages.

A reusable page-start keystream would produce excess exact ciphertext-rune matches across separate plaintext passages at the same page-local position. The equality invariant survives common per-position alphabet bijections and can be tested before choosing a key.

## Actual original-input experiment

In zero-based page-local rune positions **60–79**, four original physical pages p18, p19, p20 and p21 give **18/120** equal-rune pairs across all six page pairings and 20 positions. Independent within-window permutations preserving **each original 20-rune local histogram** predict **4.65** coincidences and produce **0/40,000** as large as 18 under the fixed generator (plus-one empirical upper-tail estimate below 0.000025). At original offset **69**, all four glyphs are **ᛟ (OE)**; at offset **75**, p19–p21 have **ᛄ (J)**. These are ciphertext facts, not decoded letters.

Because that window was located during exploration, its fixed-window probability is insufficient. A wider source-structured screen included every completely available four-consecutive-page group inside **all nine original visual chapters**, at page-local widths **10, 20 and 40**, source-zero anchored with nonoverlapping tiles: **971 candidate windows** total. Its null performs an independent random circular shift of each entire original page, preserving its rune inventory, adjacent-repeat suppression, local sequence structure and length, and computes the **maximum across the identical 971 tests** for each of **1,900** null realizations.

The strongest original window remains **p18–21, 60–79, width20, count18**, with z approximately **6.935** under a uniform-GP29 reference. Exactly **8/1,900** null maxima were at least as large (plus-one empirical familywise **p=9/1901≈0.00473**). This is an exploratory source-alignment signal, with post-selection and finite Monte Carlo uncertainty. It is not a probability of authorial intent or evidence of recovered plaintext.

For scale, across **all 1,485 pairs** of 55 original rune-bearing unknown pages, source-aligned identical-index comparisons give **10,751/311,132** equalities, versus **10,730.07** expected from actual per-page marginal rune histograms. The localized enrichment does not extend to a general book-wide page-reset codebook.

## Causal tests and remaining obstacle

Two locally enriched p15–22 windows were positions **20–39** (34 aligned equalities against about 19 expected) and **60–79** (41 against about 19). Their separation suggests a first simple candidate: the same key reused on a 40-position page clock. Its falsifiable implication is enhanced equality between the two windows at matching modulo-40 offsets. The actual cross-window count, across all 8×8 page combinations and 20 positions, is **31/1,280**, below the uniform 29-rune reference of approximately **44.1**. Thus the observed clustering does **not** support the direct period-40 shared-key interpretation.

No original instruction selects only these four pages and these 20 offsets, and no authentic known plaintext identifies an arbitrary position-specific alphabet. Exploratory source-calibrated GP trigram additive-key inference did not yield coherent independent original plaintext; it is not a complete cipher-family exclusion. A freely fitted inverse would automatically reencrpyt its own decoded output, so a roundtrip by itself cannot supply missing evidence.

## Next decision and reproducer

The [single runnable original-input test](../sims/lp2_chapter_pagealigned_collision_sft.cjs) asserts original rune counts, local exact pair matches, fixed-window histogram shuffles, the **971-way maximum under 1,900 circular shifts**, and the exact period-40 comparison. It reads the preserved canonical source and writes no files. No new automatic CI trigger is needed.

**Research decision:** preserve this as a **provisional source-aligned anomaly**, potentially signaling an authored repeated state or a localized coincidence. A successor deserves computation only if new independent original evidence selects the pages/window or a complete reversible reset/key rule. That rule must then recover coherent unknown GP plaintext on independently withheld original positions, with a solved-Cicada positive control and exact forward re-encryption. Absent that independent selector, this does **not** alter the [authoritative unsolved status](../results/README.md).
