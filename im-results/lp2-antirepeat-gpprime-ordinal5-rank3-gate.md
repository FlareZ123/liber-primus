# Original LP2 adjacent-repeat clock: a rank-three exclusion of every affine prime/ordinal five-state law

**Agent48, 22 November 2026. Source-constrained, key-independent necessary-condition result.** This covers a changing, ciphertext-symbol-weighted five-state emission clock, **not another fixed-position five-rune block**. No unknown-page plaintext, authentic cipher or source-supplied key has been recovered.

## Historical clue and explicit candidate

The 2014 LP2 original page p7 prints five source-distinguished red words and a five-dot sign. Its GP29 rune table supplies both **ordinal** `r∈{0,…,28}` and **GP-prime weight** `p(r)` for each emitted rune. The one independently proven p56 decryption also demonstrates that the creator sometimes uses a **stateful cipher counter**, skipping literal F runes. One plausible explanation for the **86 adjacent-equal outputs among 12,956 original LP2 runes** is a five-state mechanism that forbids adjacent duplicates except at a particular phase of a changing source-readable counter.

Generalize a fixed five-rune counter to a **symbol-weighted dynamic clock**:

`phase_(i+1) = phase_i + c + a·r_i + b·p(r_i) mod5`,

where **all 125 triples** `(c,a,b)∈GF(5)^3` are permitted, including 124 completely unknown nonzero keys. A duplicate ciphertext rune pair may be emitted only at one phase (the permitted phase may be arbitrarily selected at every real page or printed punctuation reset). The initial phase need not be known. This is a *necessary original-output rule*: a candidate full-rank encoder or alphabet transport would have to preserve the phase restriction, regardless of its actual plaintext.

The rule is motivated by the printed five and published GP weights, but the source **does not select this operation, the linear combination, or this output exception**. We explicitly allow unkeyed page and originally catalogued sentence/chapter punctuation resets, but the clock continues across ordinary word separators and line wrapping. In the proved p56 cipher, the key pointer indeed carries through word spacing; using the same convention in unknown LP2 remains a hypothesis. Ciphertext F may, in principle, skip a clock step without affecting this test; the decisive original intervals have **no F**.

## Three independently printed, zero-exception witnesses

Read unmodified original GP29 source pages from `resources/liber-primus/lp2-corpus.json`, using source punctuation sites from `resources/liber-primus/lp2-punctuation-identity.json`. For each witness, the two positions are the **zero-based destinations of actual adjacent-equal rune pairs**. There is no F and **no known comma, full-stop or 10-/13-dot mark** between them. Hence the phase at both repeated-rune events must equal the same permitted gate phase, and the sum of weights over the intervening emitted symbols must be zero modulo5. This remains necessary with an arbitrary secret phase or a reset at any earlier page/mark.

| Source physical page / original image | Repeat destinations | Rune identities of the two repeated pairs | Gap | `[gap, Σordinal, ΣGPprime] mod5`, pre-emit convention |
| --- | --- | --- | ---: | --- |
| **p27, original 44.jpg** | 84 and 90 | O/O and E/E | **6** | **[1,4,4]** |
| **p24, original 41.jpg** | 52 and 59 | G/G and IA/IA | **7** | **[2,0,1]** |
| **p35, original 52.jpg** | 196 and 203 | TH/TH and J/J | **7** | **[2,4,4]** |

These three printed source rows constitute the matrix

`M = [[1,4,4],[2,0,1],[2,4,4]] mod5`.

Its determinant is **4 mod5**, a nonzero unit. Therefore `M·[c,a,b]^T=0` has **exactly one solution in GF5³**, namely **`c=a=b=0`**. No nonzero clock law of the entire original-source affine-prime/ordinal family makes all three adjacent-repeat gates legal. The only surviving zero-weight case is a stationary phase, incapable by itself of explaining time-selective repeat suppression.

**Phase convention sensitivity:** If the gate is tested *after* consuming each duplicate's second rune, rather than immediately before it, the intervening sums change to

`M_after = [[1,4,4],[2,1,1],[2,3,1]] mod5`.

Its determinant is also **4 mod5**, eliminating every nonzero secret triple under that convention too. The result therefore does not depend on choosing the favorable side of each duplicate event.

This is a complete rank computation, **not a search of 125 English-scoring keys**, and excludes *any* key and starting phase in this specific dynamical law. The source-witness selector was the **shortest three independent no-F/no-punctuation intervals** among five available same-page repeat-gap intervals. These witnesses exist at their original coordinates; changing phases elsewhere cannot repair their contradictions.

## Executable proof and constructive positive

The [read-only Windows Node22 SFT](../sims/lp2_antirepeat_gpprime_ordinal5_rank3_sft.cjs) loads both unchanged original-source files and asserts **55 rune-bearing physical pages, 12,956 glyphs, 86 repeats**, every witness's actual two identical-rune pairs, no F or punctuation in either convention, exact vector entries, both modular determinants4 and direct enumeration of **125/125 secret coefficient triples**, of which only the stationary triple passes in either convention.

A separate generated **125-rune, actual original-GP-alphabet positive control** uses the nontrivial secret clock `w(r)=1+2r+3p(r) mod5` and emits identical adjacent symbols only at its permitted phase0. It passes with **24 true adjacent-repeat events**, and every such gap has zero accumulated clock weight. This demonstrates that the proposed changing-state rule can admit valid outputs, whereas the actual unchanged manuscript cannot.

**Original-source Windows Node22 PASS:** [run 45012458683](https://github.com/FlareZ123/liber-primus/actions/runs/45012458683).

## Research consequence

Retire **the entire 124-nonzero-key family of five-phase symbol-weighted clocks linear in the published GP rune ordinal and GP prime**, if source page/printed punctuation are its only resets and visible F is its only optional skip. The 86 original repeat events cannot be explained as “duplicates only at a special phase” of that clock, irrespective of secret coefficient selection.

The result does **not** exclude arbitrary **nonlinear** GP symbol weights, a key state that depends on two adjacent ciphertext runes, an unknown extra clock register, new resets at every printed word or line, plaintext-dependent skips, variable forbidden phases, or a stochastic escape rule. None of those is established by the first-party five-dot or prime clues; each would need an independently author-visible transition/exception grammar before its inverse is worth optimizing. The rank-three witnesses are best used to prune unauthored clock/key sweeps and focus effort on authentic reversible key generation.
