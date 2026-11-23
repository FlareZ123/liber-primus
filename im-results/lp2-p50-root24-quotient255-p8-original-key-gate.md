# Source-selected p39/p50 root24 polynomial quotient: exact 255-rune p8 key test

**Agent6, 23 November 2026. Classification:** new fully specified, source-constrained **cross-page GP29 key** candidate and bounded exact negative on original p8 ciphertext. No unknown plaintext, authentic manuscript key or continuation recovered.

## Human clue to exact 255-symbol key

Three independent original artifacts supply an unusually economical reversible candidate:

1. Physical p39's printed **red three-rune** coefficient vector is exactly **[27,5,15]** in original GP29 order. In `GF(29)` its polynomial is `G(X)=27+5X+15X²=15(X−24)²`; root **24** is a double root. This source-selected arithmetic has been established previously; see [grid-radix study](lp2-grid-numeric-codec-ambiguity.md). Choosing polynomial framing remains an inference.
2. Physical pp49–51 print **256** two-character numeral cells. The canonical historically accessible base60 reading as forward/highest-degree-first 256 coefficients `a_0..a_255` gives `P(X)=sum(a_i X^(255-i)) mod29`. The original **full table** obeys `P(24)=P'(24)=0`. No omitted source cells, fitted key values or unknown ciphertext participate in this relation. The competing base59 read, with lowercase `f` removed from the digit alphabet, does **not** share the root: `P_59(24)=20`.
3. The polynomial division `P(X)/(X−24)` is **exact** and deterministically yields **255 GP29 quotient coefficients** `q_0..q_254`. Physical p8 contains **exactly 255 original GP29 runes** (12 red and 243 black) with tree imagery. The previously missing bridge is this exact `256 coefficients ÷ degree1 → 255 coefficients` operation, rather than a guessed private 255-rune pad.

The original source supplies the operation's operand and root, while the **choice of p8 as receiver** and using the quotient as an additive key remain explicit unproved hypotheses. Unlike selecting 255 arbitrary key symbols, the entire proposed key is publicly computed from untouched source material.

The exact original high-first synthetic recurrence is:

```
q[0] = a[0] mod29
q[i] = (a[i] + 24*q[i-1]) mod29, 1 <= i <= 254
remainder = (a[255] + 24*q[254]) mod29 = 0
```

The quotient `Q(X)` also has `Q(24)=0`, because original `P` has a **double** root. The construction therefore includes its own full-source arithmetic checksum and selects an independently checkable quotient before considering p8.

## Original p8 decipherment gate

Use each of the 255 actual quotient GP29 coefficients **once**, in the original forward order, against each of the 255 untouched physical p8 rune ordinals, retaining its 12-rune red heading and original word/line positions. The two natural GP29 additive directions are fully invertible:

`D_i = (C_i ± q_i) mod29`.

No key-offset search, clock reset, fitted glyph permutation, guessed plaintext, page skipping or histogram optimization is used. The entire printed p8 page is the readout.

| Frozen reading | Complete 255-rune GP29 index of coincidence | Genuine native prose? |
|---|---:|---|
| Original p8 ciphertext | **0.03427512737** | ciphertext |
| Polynomial quotient `q` alone | **0.03498533272** | no |
| `D=C−q mod29` | **0.03563378107** | **no** |
| `D=C+q mod29` | **0.03412073491** | **no** |

The quotient and original p8 agree as literal GP29 rune streams at only **12/255** exact positions, as expected if they were unrelated. The decoded outputs remain almost frequency-uniform and do not reveal a continuous original-language passage. Their first 75 GP29 transliterations and exact full-page forward re-encryption are printed by the reproducer. As a separate **genuine solved-Cicada positive**, 255 GP-native plaintext runes drawn cyclically from authentic solved p57 were encrypted with this same 255-symbol quotient key and **all 255/255** recovered under both signs. This establishes a working inverse, without treating it as evidence that Cicada chose this key.

The source-selected original radix/root is independently discriminating at the level of the **polynomial arithmetic**: base60 with root24 has remainder0 and derivative0; base59 root24 instead has remainder20; even base60 root23 has remainder24. That does not rescue the missing p8 plaintext or prove the 2014 authors prescribed polynomial division.

## Decision

This is a sharply bounded **negative** for the direct 255-key GP29 additive quotient→p8 consumer under both sign conventions. It does not reject the real p39/p50 double-root arithmetic, other destinations, hidden encodings of quotient coefficients, a compressed payload, or a cipher with a separately authored key/clock. Such extensions require an independent source-visible operation and an untouched original-language prediction. The 255-length match alone is not a decryption instruction.

Full exact Windows Node22 CommonJS positive and original-input gate: [`sims/lp2_p50_root24_p8_255quotient_original_sft.cjs`](../sims/lp2_p50_root24_p8_255quotient_original_sft.cjs). Manually triggered Windows Node22 [workflow](../.github/workflows/lp2-p8-p50-511tree-original.yml), which evaluates this separate polynomial receiver after the independently completed 511-node tree experiment. This route is distinct from the binary-tree leaf-parent test and the earlier p7 GF(4) 255-state register attempt.
