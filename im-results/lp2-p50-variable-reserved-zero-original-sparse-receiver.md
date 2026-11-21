# Original p50 table as a changing reserved-plaintext rune: reversible sparse key-independent gate

**Agent17, 21 November 2026.** A complete conditional GF(29) feedback cipher and its four source-simple table receivers have been tested on every original unknown LP2 rune. **All four fail to recover native-GP prose; none reveals an author key or previously unknown plaintext.** This is an experimental exclusion of these four *specific* original-source transformations, **not** a rejection of all stateful ciphers or dynamic marker alphabets.

## Original clue and missing premise

The untouched manuscript has 12,956 unknown GP29 runes on 55 physical rune-bearing pages (p0–55, excluding numeral-only p50). It has only **86 equal-adjacent ciphertext events** among 12,901 within-page transitions; they fall inside the 2,896 original complete printed word spans or at their starts. The conspicuous 32×8 table printed on pp49–51 has 256 two-character cells. Earlier fixed-reserved-rune tests [already rejected an interpretation where every repeat carries the *same* plaintext letter](lp2-fixed-reserved-rune-doublet-source-gate.md), as well as source-lookup additive codes under that fixed marker [here](lp2-p50-bytekey-constant-doublet-marker-allphase-gate.md). The distinct untried possibility is a **different reserved rune determined by the printed table at each position**.

Specifically, grant *every transition* an unconstrained, secret, nonzero multiplier (a_i\in\mathbb F_{29}^{\times}), set (R_i = (\text{p50 byte at clock }i)\bmod29), and propose:

[
 C_i=C_{i-1}+a_i(P_i-R_i)\pmod {29}.
]

At each physical page start, retain the original first glyph as an unconstrained IV. Each subsequent plaintext rune is recovered **reversibly** by

[
 P_i=R_i+a_i^{-1}(C_i-C_{i-1})\pmod{29}.
]

This is a full length-preserving, causally reversible cipher whenever (a_i\ne0). Crucially, its unknown key *cancels at the original 86 repeat sites*:

[
 C_i=C_{i-1}\quad\iff\quad P_i=R_i.
]

Therefore the 86 repeat positions allow **exact sparse plaintext predictions under the hypothesis**, without guessing even one multiplier. The table itself is directly visible; its interpreted base and role as a dynamic reserved-letter schedule are **not independently specified by Cicada**. Base60 follows the conventional sexagesimal reading used elsewhere in the document; drop-`f` base59 is a competing research interpretation. Both the continuous original-rune clock and the restart-at-each-original-page clock are tested without phase fitting.

## Original-input sparse predictions and held-out native-source calibration

Use `resources/liber-primus/lp2-corpus.json` (original ciphertext), `lp2-grid-256.json` (image-adjudicated table), and `sims/lp2_word_pages.cjs` (complete printed-word reconstruction, including 32 physical-page word carries). The test verifies exact page positions and the 86 doublet sites. For every one of these sites, read the model-selected symbol (R_i) under **exactly four frozen options** (radix59 or60, global or page-local clock), with the natural zero phase and forward printed table order. The test has no plaintext fitting or selected unknown key.

Score these proposed GP29 plaintext symbols at their *actual* printed word lengths and positions using independently source-native GP encodings of Shakespeare, Gibran, and Emerson. Within each control source, sample **600 synthetic assignments of whole independent native words of matching original length**, preserving all 86 event positions, all repeated events in the same word, and the original page/word structure. Score each assignment using the same GP29 per-word-length and in-word-position conditional letter frequencies, with a fixed half-count smoothing constant. Seed `0x33018086`.

| Source / score summed over 86 predicted runes | Base60 continuous | Base60 page-reset | Base59 continuous | Base59 page-reset | Most negative of 600 native controls |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | −430.72255 | −435.02329 | −411.05860 | −445.90271 | **−243.51351** |
| Gibran | −417.03141 | −413.61530 | −396.12331 | −422.29143 | **−240.94210** |
| Emerson | −426.27593 | −424.04188 | −400.84568 | −440.77669 | **−248.25360** |

**0 of 600** native controls in *each* corpus had a summed log-likelihood as low as any of the four model-predicted 86-rune assignments. Each model's 86 recovered symbols are therefore implausible as native GP-English letters in their original word positions, even before recovering the other 12,815 transition plaintexts. These conditional source controls are **finite language-register comparisons**, not an unqualified probability of the authors' intent. A special nonnative register, altered word boundaries, or externally selected (R_i) would escape.

## One complete, source-fixed key inversion

A direct, source-simple extension removes the remaining secret multiplier by setting
[
 a_i=1+(B_i\bmod28), \quad R_i=B_i\bmod29,
]
where (B_i) is the original table byte at the selected phase. This is nonzero for all 256 possible bytes, so the forward and inverse are total. Run this exact full inverse against **all 12,901** original within-page transitions, grant the first glyph on every page as an unconstrained IV, and verify forward reencryption of every transition against the unchanged original C. No secret is trained. Result:

| Source table interpretation | Full original inverse GP29 IoC | First original plaintext runes |
| --- | ---: | --- |
| Base60 continuous | **0.03451144043** | `N EO EA R H Y L Y D TH O A S S W R` |
| Base60 page reset | **0.03449220029** | same first-page prefix |
| Base59 continuous | **0.03444642534** | `S TH EA W J OE A A EA OE F T S F T N` |
| Base59 page reset | **0.03448168491** | same first-page prefix |

All four inverses are effectively uniform-GP gibberish, far from the native-GP prose IoCs (~0.06) used as the established controls elsewhere in this research. **Exact forward restoration proves implementation consistency, not historical correctness.**

For a separate actual-language positive, the same code encrypts 700 source-native Gibran GP runes with a deterministic sequence of independently changing nonzero GF29 multipliers, then inverts the known multipliers and checks **699/699** transitions exact. It also asserts every planted ciphertext repeat coincides with exactly the planted (P_i=R_i) event. This verifies both the mathematics and that the sparse receiver really would reveal unknown original plaintext *if the mechanism were true*.

## Cryptanalytic decision

**Reject the four direct original p50 byte-reserved reference schedules** for GP-native English in the original preserved word register, and specifically their fixed (a_i=1+B_i\bmod28) complete readers. The 86 sparse key-independent predictions fail before arbitrary multipliers can rescue them. The numerical table remains valid source material; the exact operation and reference-letter projection remain invented hypotheses. Do not extend these negatives to changed clocks, hidden per-page shifts, different plaintext encodings, or externally supplied (R_i); equally, **do not widen offsets or secret multiplier searches** unless an original instruction supplies an independently motivated selector. This intervention changes the cipher-route priority, without claiming manuscript decryption.

**Reproducer:** [single-file Node22/CommonJS original-source SFT](../sims/lp2_p50_variable_reserved_zero_sparse_plaintext_sft.cjs), [successful Windows manual run 44942477699](https://github.com/FlareZ123/liber-primus/actions/runs/44942477699). Source keys, 86 predicted GP runes for each option, all 1,800 native controls, full original IoCs and 699-runic planted positive tests are printed directly by the executable.
