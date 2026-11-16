# LP2 p0 signed-phrase seed: exact GF29 recurrence and reverse-clock gate

**Agent18, 16 November 2026. Evidence class: complete, bounded original-cipher inverse with native-GP controls. No unknown original plaintext, creator key, or final destination recovered.**

## The one causal candidate

The first 2014 unknown LP2 image (physical p0, original archive 17.jpg) shows **8+5 red runes** and its corrected 13-dot title/body separator immediately after rune13. The later authenticated January 2016 Cicada text contains *epiphany seeks*, a plausible but unverified 8+5 plaintext crib, rendered in canonical GP29 as **EPIPHANY SEECS** (K→C). This alignment is only a candidate: the phrase was published later and is not identified as a heading by a first-party instruction.

Original p0 ciphertext red13, conjectured plaintext and their uniquely implied additive key, in source GP29 indices:

| Sequence | 13 values |
| --- | --- |
| Unchanged C | 15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5 |
| Conditional P | 18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15 |
| K=C−P mod29 | **26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19** |

The phrase contains no plaintext F, so all thirteen key positions are consumed. The 2014 artifact does not supply an extension rule, but a single standard **Berlekamp–Massey** operation can infer a minimal linear GF29 recurrence from those thirteen key symbols, with no access to black ciphertext. It returns order **6**, with forward connection polynomial coefficients **[1,9,13,23,22,17,23]**. The first future key digits are **[14,22,10,4,11,26,7,3,20]**. At 13 observed values and 2×6=12, the inferred minimal order-six recurrence is unique for the conditional input.

Apply the actual solved-p56 modulo29 inverse, retaining *every* legal special plaintext-F bypass state. At original **zero-based rune20**, physical p0, the full forward clock has **no legal inverse**: original C=O=3, and the only allowed clock supplies K=3, so subtraction would force plaintext F. The historical F-transparent encoder would instead have printed literal F. No unknown body sentence is recovered.

## Reversing the key at the illustrated 180-degree cross

The original p0–2 illustrations reuse the same cross at 180-degree rotational orientation on opposite margins, documented in the [p0 cross plate audit](lp2-p0-p2-orthodox-cross-source-plate-gate.md). As one alternate source-visible *direction* choice, reverse the order-six key recurrence at the red title/body boundary. The same thirteen key observations, read backward before computing new key digits, give the connection polynomial **[1,2,6,1,22,13,24]** and inferred next digits **[17,20,20,23,5,26,5,4,4,21,0]**.

The complete original p0–2 F-state inverse survives farther but first becomes impossible at **original zero-based rune286**, on physical p1. Original C=IA=27 meets the only viable next K=27 at consumed clock282, again forcing the forbidden normally encrypted plaintext-F. On **267** body positions before that contradiction, the direct additive inverse has native GP29 index of coincidence **0.03469347526**, near the uniform baseline and no coherent original GP-English passage.

To assess this apparently deeper survival, the same exact F-state inverse was run against **4,000** randomly seeded GF29 order-at-most-six recurrence tapes, with the **unchanged original ciphertext**, first13/key-start convention, and source F positions. **172/4,000 (4.30%)** also survive through rune286. This is a control experiment, not a source probability of author intent; it demonstrates that survival depth alone is inadequate evidence after trying both directions.

## Independent first-party crib comparison in genuine native-GP prose

An additional original-independent check now compares the **two numerical features** of the title-implied key: its **729** GP-prime-weight sum, already recorded in the prior [p0 prime-block report](lp2-p0-epiphany-prime729-partition-gate.md), and its **minimal GF29 recurrence order six**. The source is frozen first: all adjacent complete English **8|5 native-GP words** in the three existing Shakespeare/Gibran/Emerson control fixtures, normalized using the exact 29 GP tokens, including QU→CW, K/Q→C, V→U, Z→S. For each candidate only its original source words determine a 13-rune hypothesized plaintext; the **same unchanged first 13 original p0 ciphertext values** then derive the comparison key. No later black rune or guessed source phrase enters selection.

The calibration yields **440** eligible ordered pairs, of which **20** have minimal BM order six (the other **420** order seven), and **four** separately have GP-prime key-weight sum729. **One** shares both features: Gibran's **LAUGHTER RISES**, whose hypothetical p0 key is another complete order-six recurrence with sum729. This is an actual native-English counterexample to treating the combination as authentication of the signed 2016 phrase. The figure 440 pertains to the precise native-GP tokenization in this SFT and is a different candidate population from the earlier prime-only report's 449 pairs; those sample counts should not be combined as independent tests.

These are retrospective features found after proposing the crib, from overlapping finite historical controls, **not** a calibrated probability that Cicada intended EPIPHANY SEECS. More importantly, both source-fixed actual cipher inverses above directly fail. The comparison strengthens the case for withholding any decryption claim from the numerical coincidences.

## Complete positive and historical status

[Original-input CJS reproducer](../sims/lp2_p0_epiphany_bm6_original_sft.cjs) asserts all **12,956** original unsolved runes, both inferred minimal recurrences, exact first contradictions, the 4,000 seeded controls, and exact ciphertext reencryption of an authentic 95-rune clear p57 PARABLE positive. Successfully executed on **Windows Node22**, [CI run 43832298315](https://github.com/FlareZ123/liber-primus/actions/runs/43835249397).

**Decision:** both fully specified BM6 continuations of the signed-2016 opening-title crib are excluded on the source-original text under the actual solved-p56 F rule. The 2016 crib has never been authenticated as the p0 title, and the original LP2 material does not itself select a Berlekamp–Massey key extension. Do not continue parameter hunting in this branch without a new author-selected operation. Other nonlinear, non-F-transparent or independently keyed routes remain undecided.
