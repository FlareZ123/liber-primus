# Five-forward / five-reverse SSSS interpretation of LP2 pp23–26

**Decision (16 November 2026, Agent41):** The source-motivated interpretation that the five 201-rune strands on pp23–26, read in both directions, form all ten shares of Cicada's historical 5-of-10 SSSS 0.5 mechanism is rejected under both natural strand layouts and both natural share-ID orders. Each of the four candidate ten-share sets satisfies **0/210** required six-point monic-quintic identities. A planted monic-quintic control satisfies **210/210**. No secret, plaintext, key or continuation is recovered.

## Human solve-path hypothesis

The original p23 five-dot section contains exactly 1,005 GP29 runes after removal of its 16-rune red heading: \(1{,}005=5\times201\). The five-dot motif naturally suggests five lanes. The earlier Cicada puzzle used a documented 5-of-10 secret-sharing format; reading each lane forward and backward supplies ten candidate values. The 2016 signed instruction's emphasis on numbers and direction makes the two reading directions a plausible human-visible selector.

This is a distinct extension of the existing [historical SSSS source-format gate](lp2-p23-26-ssss201-original-format-gate.md). That earlier work tested the five lanes as five shares, and physical p2 as either the secret or a sixth point. It did **not** test the ten-value set consisting of all five forward and all five reverse lane readings as the complete ten-share set.

## Fixed source input and four candidate models

The SFT reads the canonical source transcription in resources/liber-primus/lp2-corpus.json, retaining the original pp23–26 order and removing only the 16-rune p23 red heading. The original page rune counts are 213, 270, 273 and 265, leaving exactly 1,005 runes.

Two source-natural lane constructions were tested:

1. **Quintet columns:** reshape the 1,005-rune stream as 201 consecutive rows of five and read each column as a 201-rune lane.
2. **Five consecutive blocks:** split the source stream into five consecutive 201-rune lanes.

For each construction, each lane was encoded as an unsigned base-29 integer, most-significant rune first. The same lane encoded in reverse order supplies its opposite-direction value. Thus each model has ten values. Two natural assignments of historical share IDs 01–10 were tested:

- **Forward then reverse:** IDs 01–05 are the five forward lanes in source order; IDs 06–10 are their five reverse readings in source order.
- **Interleaved:** each lane's forward and reverse values occupy consecutive IDs, in lane order.

No ID permutation, digit remapping, fitted offset, field reduction, or plaintext-dependent selection was used. All 201-digit values fit exactly in the historical 984-bit field.

## Decisive key-independent test

The historical ssss 0.5 representation uses the field \(GF(2^{984})\) with polynomial

\[
x^{984}+x^{24}+x^9+x^3+1
\]

and a monic quintic

\[
f(x)=x^5+c_4x^4+c_3x^3+c_2x^2+c_1x+c_0.
\]

For any six distinct share IDs \(x_0,\ldots,x_5\), their values \(y_i=f(x_i)\) must satisfy the leading-coefficient identity

\[
\sum_{i=0}^{5} W_i y_i = D,
\]

where

\[
D=\prod_{0\le i<j\le5}(x_i\oplus x_j),
\qquad
W_i=\prod_{\substack{0\le j<k\le5\\j\ne i,\;k\ne i}}(x_j\oplus x_k).
\]

The products are carryless field products; subtraction is XOR in characteristic two. This identity is independent of the five unknown lower coefficients. If all ten values are evaluations of the same monic quintic at IDs 01–10, **every one of the \(\binom{10}{6}=210\) six-share subsets must satisfy it**.

| Lane construction | ID assignment | Passing identities | First failing subset | First residual bit length |
|---|---|---:|---|---:|
| Quintet columns | Forward then reverse | **0/210** | 01–06 | 984 |
| Quintet columns | Interleaved | **0/210** | 01–06 | 984 |
| Five consecutive blocks | Forward then reverse | **0/210** | 01–06 | 983 |
| Five consecutive blocks | Interleaved | **0/210** | 01–06 | 980 |

The residuals are full-sized field values, not small rounding or representation errors. No candidate set has even one valid six-point subset.

**Positive control:** a deterministic monic quintic with five nonzero, high-bit coefficients was evaluated at the same IDs 01–10 in the same field. The implementation recovered the identity in **210/210** six-point subsets. The SFT also asserts all four original candidate sets fail and that all 201-digit values fit the field without truncation.

## Interpretation and limits

This rejects the specific model:

- the five 201-rune lanes are the share payloads;
- each lane's reverse reading is a second share;
- the ten resulting base-29 integers are assigned IDs 01–10 in either natural grouped or interleaved order;
- the historical monic-quintic SSSS format is used without another transformation.

It does **not** exclude another source-selected representation, a different payload, a different recipient, or a separate use of the five-dot chapter. An arbitrary 10! reassignment of share IDs or a fitted per-lane transformation would be unconstrained key hunting and is not justified by the original artifact. The five-dot / 5-of-10 resemblance alone is insufficient to rescue the model.

The next useful advance would require a first-party instruction selecting a different ten-share construction or a specific transformation before the SSSS input. Do not repeat the four tested configurations.

## Reproduction

Run from the repository root with Node.js:

node sims/lp2_p23_26_ssss10_directional_shares_sft.cjs

The standalone SFT reads the pinned source corpus, emits the source and share-set SHA-256 digests, checks all 840 original six-point identities, and verifies the 210/210 synthetic positive control. The historical SSSS context and earlier bounded tests are documented in [the original-format gate](lp2-p23-26-ssss201-original-format-gate.md) and its original-source implementation.
