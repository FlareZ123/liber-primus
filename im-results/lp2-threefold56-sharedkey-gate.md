# Source three-fold 56-page collision test

**Classification: conditional, original-cipher structural exclusion; no new plaintext. Agent 8, 11 November 2026.**

## Source-prompted construction

The independently preserved PGP-signed January 2016 sentence says “the” three times. The provisional whole-book GP-prime sum word map identifies that signed word as the complete printed **FOLD** on LP2 p14. Treat three folds as three successive physical half-folds of the **56 unresolved physical page positions, p0–p55**. This yields precisely **seven stacks of eight pages**. Unlike the previously tested 58-page pair folding, the unknown-page range divides by eight exactly. One stack includes rune-free numeric p50, so that stack has only seven rune-bearing pages.

The first stack is `[0,55,27,28,13,42,14,41]`; the seventh is `[6,49,21,34,7,48,20,35]`. All seven appear in the [single-file reproducer](../sims/lp2_threefold56_sharedkey_gate.cjs) and are computed mechanically by folding `[0..55]` in half three times. The source selection of `FOLD` is intriguing, though the signed word mapping and the physical page-fold rule remain hypothetical.

## Key-independent discriminator

Suppose all eight pages within a stack were encrypted under the **same unknown, possibly position-dependent invertible mapping** on the 29 GP glyphs at each *matching local rune offset*. Such a mapping can be any permutation of the 29 values at each offset, with arbitrary secret key and position-dependent choice. For every pair of pages `i,j` and offset `t`,

`C_i[t] == C_j[t]` iff `P_i[t] == P_j[t]`.

This equality is preserved regardless of the secret mapping, even with non-additive stationary or rotating substitution. The candidate is therefore testable without knowing the key, deciphering the runes, or assuming a particular table encoding.

All **39,330** available same-offset page-pair comparisons across the seven source-fold groups give **1,315 exact equalities**, a rate of **0.03343503687**. The uniform GP29 reference is **1/29 = 0.03448276**. In 800 deterministic, seeded whole-page circular-shift nulls (preserving the exact original page glyphs, lengths and page-to-stack assignments), mean collision count is **1,354.89375**, standard deviation **36.90796**; 699/800 shifted controls equal or exceed the original. The original source alignment is therefore not privileged.

As a positive control, take fresh contiguous GP-English passages from the independent Emerson text with the **same 55 printed page lengths**, encrypt each fold stack under an arbitrary shared per-offset GP29 additive key, and apply a seeded 81% rewrite probability to immediate ciphertext doublets. Despite the rewrite, the same fixed collision test yields **2,325/39,330 = 0.05911518**, well above the real result. This demonstrates that ordinary GP-language plaintexts behind shared secret transformations could be detected even after a source-motivated anti-repeat rewrite. This plant is deliberately simple; it does not cover every language register or hidden-dependent rule.

The literal page-fold shared-per-position permutation model is thus **incompatible with ordinary native GP-language plaintext** for these page groups, regardless of the hidden alphabet permutation values. This is a keyless original-cipher rejection of this specific mechanism. It does not exclude independent pads per page, a variable key clock, per-page skips or insertions, non-GP binary intermediates, other fold assignments, or unrelated nonlinguistic plaintext.

[Full original-source Node.js test](../sims/lp2_threefold56_sharedkey_gate.cjs) validates the signed word anchor, source page lengths, fold group coverage and all exact collision counts, with positive and null controls. It passed [manual GitHub Actions run 42969932744](https://github.com/FlareZ123/liber-primus/actions/runs/42969932744) together with the separate [triple-folded numeric table key test](lp2-trifold-rowxor32-source-key.md). No original plaintext or authentic source key was recovered.

**Next decision:** Retire common-position, common-bijection keys for the literal three-fold 56-page stacks. Any future fold model needs a *different specific and source-fixed relation* capable of producing an independently verifiable original-text prediction, rather than selecting one unusually high-scoring stack or refitting arbitrary page offsets.
