# Combined original anchored-rubric and fixed-site punctuation sidecar: 35-bit obstruction

**23 November 2026, Agent13. Intermediate mathematical decision for [#2273](https://github.com/FlareZ123/liber-primus/issues/2273).** No original unknown LP2 plaintext, authored key, decryption or destination recovered.

## Source-constrained model

The 56 unknown physical pages have **12,956 GP29 runes, 12,901 within-page transitions and 86 equal-adjacent transitions**. The original physical ink annotation identifies **16 red runs totalling 213 runes**; the original-image punctuation audit establishes **175 visible marks** of eight distinguishable classes with population [137,1,1,1,4,27,1,3]. A bounded hypothetical emitter can encode exceptional information in **both** channels:

1. Retain the 16 *source-visible red-run starts* at their original (page, rune-offset) anchors, but allow **each red run to end anywhere later on that same physical page or disappear**, regardless of original ink and even if this produces overlapping runs. Do not fix total red count in the generous main model.
2. Retain the 175 physically visible punctuation **positions**, but freely permute the eight original mark identities across those sites with their full observed multiset. This is the most generous fixed-site morphology model in the prior physical audit.
3. Retain all original page lengths and all GP29 source input values. The emitter must work injectively for **every** possible GP29 input of those lengths, with ciphertext always having at most 86 within-page equal-adjacent pairs.

This model permits much more red-length variation than original chapter and rubric shapes actually display. It **does not** permit changing a red start, moving punctuation, altering word breaks, modifying central drawings, or restricting input to natural-language plaintext.

## Exact all-source capacity

For red span \(i\) at immutable start \(s_i\) on a page with \(n_i\) original runes, grant **\(n_i-s_i+1\)** length choices, including length 0. Even when two starts occupy the same page, count their choices independently and permit overlaps. This **overcounts** physical colored tapes, which makes the capacity bound conservative.

\[
\log_2 B_{\mathrm{red}}\leq
\sum_{i=1}^{16}\log_2(n_i-s_i+1)
=\mathbf{114.55468057589805\ bits}.
\]

With all 175 punctuation sites fixed, their exact eight-type permutation capacity is

\[
\log_2 B_{\mathrm{punct}}
=\log_2\!\left(\frac{175!}{137!\,4!\,27!\,3!}\right)
=\mathbf{176.57877078182\ bits}.
\]

Even granting independent use of both full channels, the capacity is bounded above by **291.13345135772 bits**. The universal 29-symbol same-rune-count encoder restricted to at most 86 original within-page repeats loses

\[
D=-\log_2\Pr\{\mathrm{Binomial}(12901,1/29)\le86\}
=\mathbf{325.450254\ bits}.
\]

The combined source-anchored channels therefore lack at least **\(\lceil325.450254-291.13345135772\rceil=35\)** independently recoverable bits. If the observed total of 213 red runes is also preserved, the choices of 16 positive lengths are at most \(\binom{212}{15}\), or **74.93725298895 bits**, so the combined channel lacks at least **74** further bits. Neither version assumes plaintext probabilities or tries encryption keys.

## Decision

This excludes a **universal, same-rune-count GP29 anti-repeat encoder whose *only* exception sidecar is anchored red-run length changes together with permutations of the existing punctuation marks at fixed sites**. Either physically source-consistent channel by itself was previously insufficient; critically, **their combined maximum is also insufficient**, even with freely varying red count and impossible run overlaps.

It does **not** exclude a source-authored system that moves red-run beginnings, moves punctuation marks, stores bits in page illustrations or images, allows changing word boundaries, uses non-fixed rune lengths, or compresses a source-restricted natural-language input. Those mechanisms still require a selected reversible rule and long original plaintext evidence before deserving a new decoder search. Source data: [canonical corpus](../resources/liber-primus/lp2-corpus.json), [ink annotation](../resources/liber-primus/lp2-ink-annotations.json), [physically audited punctuation](../resources/liber-primus/lp2-punctuation-identity.json). [Single-file Node 22 reproduction](../sims/lp2_anchored_red_punct_combined_capacity_sft.cjs).