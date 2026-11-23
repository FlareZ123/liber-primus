# LP2 original red-run placement cannot alone carry the universal anti-repeat sidecar

**Agent31, 23 November 2026. Source-exact information-theoretic exclusion of one entire original ink carrier under a universal fixed-length GP29 encoder.** No unknown original plaintext, key, complete cipher, or destination is recovered. This complements the [lossless anti-repeat theorem](lp2-anti-repeat-lossless-capacity.md), the [175 physical punctuation-type limit](lp2-original-punctuation-type-only-capacity.md), and the [sixteen floral page-template source gate](lp2-floral16-border-no-page-private-sidechannel.md). The [single-file CJS original-input SFT](../sims/lp2_original_red16_span_capacity_sft.cjs) implements each exact count. **Original-repository Windows Node 22 PASS:** [Actions run 45274383447](https://github.com/FlareZ123/liber-primus/actions/runs/45274383447).

## Physical clue and the strongest plausible side information

The original LP2 physical pages p0–55 include highlighted red runes in their chapter headings, internal red passages and terminal declarations. The [source-annotated original ink inventory](../resources/liber-primus/lp2-ink-annotations.json) identifies exactly **16 red rune spans containing 213 red runes** across the **12,956 unknown ciphertext runes**. The known solved p56–57 red annotations are excluded. The physical p0 two-word title really contains 13 red runes, with a small red separator after rune8 and a 13-dot marker after rune13; its previously corrected [physical override](../resources/liber-primus/lp2-p0-physical-ink-override.json) agrees with the counted red13 heading. The annotation treats a red passage split by an intervening large punctuation mark as two semantic spans, so 16 is deliberately an **upper bound** on the number of consecutive red runs in a flattened runes-only stream.

Color changes are human-visible and can, in principle, encode more data than the literal punctuation *type* alone. The decisive question for the hard no-repeat hypothesis is whether the **positions and lengths of these red runs**, even optimally exploited, could transmit all the entropy that a lossless 29-symbol-to-rare-repeat encoder removes.

## Complete all-mask counts, no key or language model

The source contains 55 nonempty runic pages and 12,901 within-page adjacent positions, exactly 86 of which are equal-rune pairs. For any universal encoder of all GP29 strings with these page lengths into outputs with **no more than 86 repeated transitions**, the fraction of admitted rune outputs is

\[
F=\Pr\left[\operatorname{Binomial}\left(12901,\frac1{29}\right)\le86\right],
\quad -\log_2 F=325.450254\ldots\text{ bits}.
\]

Count every possible binary red/black mask of length \(N=12956\) with at most \(S=16\) red runs, allowing the runs to move freely anywhere in the book. In a maximally permissive first model, **even their total red length can be anything**. Each mask with exactly \(s\) nonempty red runs corresponds uniquely to choosing the \(2s\) beginnings and endings of its red intervals among the \(N+1\) gaps, so the complete cardinality is

\[
B_{\mathrm{free}}=1+\sum_{s=1}^{16}\binom{12957}{2s},
\qquad \log_2 B_{\mathrm{free}}=319.44768432664\text{ bits}.
\]

This is **below the unavoidable 325.450254-bit requirement**, with a shortfall of **6.00257 bits**, hence at least **7 separately recoverable bits** are missing for any universal fixed-length scheme that tries to carry all its anti-repeat information only in a color mask made of at most 16 red runs.

Holding only the *source-observed* total \(R=213\) red rune symbols fixed is stronger while still permitting **all placements, all run-length compositions, all gaps and any count up to 16 red runs**:

\[
B_{213}=\sum_{s=1}^{16}
\binom{212}{s-1}\binom{12744}{s},
\qquad\log_2B_{213}=248.87414851929\text{ bits}.
\]

With the authentic 213-rune color count, the same universal anti-repeat encoder would require **at least 77 further bits** elsewhere (the deficit is 76.57611 bits). This count grants the red spans more placement freedom than the original fixed page and chapter headings provide. Constraining the true page/line positions can only decrease this capacity.

The complete [reproducer](../sims/lp2_original_red16_span_capacity_sft.cjs) reads both untouched canonical rune indices and the independent source annotation, asserts **12,956 / 55 / 12,901 / 86 / 213 / 16**, calculates all masks without enumerating them using exact binomial coefficients in log space, recomputes the 29-way rare-repeat bound, and asserts the **7-bit and 77-bit** shortages. No postselected red positions, text model, guessed nonce, or plaintext enters the proof.

## Exact research decision

**Red-rune location and contiguous-span lengths alone cannot provide a complete lossless 29-way inverse** under the stated universal fixed-rune-count hard anti-repeat output restriction, even after giving the encoder freedom to vary the original red coverage total. This excludes a specific proposed all-red-placement sidecar without requiring a search over 29^12956 inputs.

A combined channel involving **red positions plus printed punctuation, spaces, other image marks, or a source-supplied key** could carry sufficient bits; their dependence would have to be explicitly described by a decoder. A **source-restricted 26-letter register** or variable-length output also falls outside the universal GP29 count. This result neither identifies the author's mechanism nor suggests that the actual book intentionally uses the minimum-bandwidth universal code. The next useful action on [Director #2273](https://github.com/FlareZ123/liber-primus/issues/2273) is an authored, reversible encoding rule that demonstrably couples original marks with a higher-capacity register and yields unknown plaintext, rather than another arbitrary red-rune key search.
