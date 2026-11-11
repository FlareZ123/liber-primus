# All-secret page-reset first-order feedback capacity gate

**Classification:** exact original-cipher necessary-condition exclusion for a defined family, with a complete reversible native-GP plaintext positive control. No previously unknown Liber Primus plaintext, authentic key, historical cipher, or destination is recovered.

## Human solve-path hypothesis and scope

The unsolved second-release pages show only **86 equal-adjacent rune pairs in 12,956 ciphertext runes**, including suppression across printed word boundaries. A reversible feedback cipher whose next output depends on the preceding output is a natural *candidate* explanation. Earlier work excluded the narrower constant first-difference alphabet `C[j]-C[j-1]=sigma(P[j])` globally ([first-difference gate](lp2-difference-allletter-capacity-source-gate.md)). This test closes a larger model without guessing any keys: **each physical rune-bearing page may have its own feedback multiplier and its own arbitrary secret 29-symbol alphabet permutation**. There is no independently authenticated LP2 instruction selecting this family, so the result is a cryptanalytic constraint, not an attribution.

For every physical page independently, let GP runes be elements of F29 and suppose:

```text
C[j] = beta_page*C[j-1] + sigma_page(P[j])  mod 29,  j >= 1
```

Here `beta_page` is **any** of the 29 residues, and `sigma_page` is **any** bijection of all 29 GP symbols, unconstrained by an affine formula or by another page's key. Page-first ciphertext symbols and page-first plaintext symbols may be arbitrary, and no feedback equation is imposed on them. The model therefore covers secret stationary per-page substitution followed by linear one-output feedback, including all page-specific `alpha*P+gamma` encoders. The clock resets at every original physical page. No word-boundary or red-span resets are assumed inside pages.

## Exact source-conditional obstruction

Rearrange the hypothesized equation for any `beta`:

```text
D[j,beta] = C[j] - beta*C[j-1] = sigma(P[j]) mod 29
```

For one page and fixed `beta`, the positions occupied by any *one* plaintext rune, such as E, must all have the **same** `D` value. Changing `sigma` can only rename that value, never increase its count. Granting an adversary its choice of all 29 `beta` values and all 29 possible output labels for **every page independently**, the exact upper bound is:

```text
sum over 55 pages of max_beta max_r #{j>=1 : D[j,beta]=r} = 993
```

There are exactly **55** unconstrained page-first runes, so even treating every one as plaintext E yields an **absolute maximum of 1,048 E runes** in the 12,956-rune original. This uses all actual source ciphertext, including every in-page printed word boundary, with no chosen secret or language score.

For comparison, the separately pinned native English GP controls were encoded with the same canonical TH/EO/NG and other multi-letter rune conventions. Their **minimum E count over every contiguous 12,956-rune window** is:

| Native-GP source | Available runes | Minimum E in any source-length window |
|---|---:|---:|
| Gibran, *The Prophet* | 63,114 | **1,407** |
| Shakespeare sample | 218,800 | **1,397** |
| Emerson essays | 324,630 | **1,482** |
| **Original cipher, all-secret family bound** | **12,956** | **at most 1,048** |

The gap is **at least 349 E runes**, even under independent per-page adversarial choices of `beta`, every secret alphabet permutation, and all 55 free initial runes. In the still-narrower **single book-global beta** model, the largest original noninitial transformed-symbol count among all 29 values is **513** (attained at beta26; beta1's first-difference count is 510). The page-specific 1,048 bound is the headline result because it grants substantially greater attacker freedom.

This is an exact exclusion of direct, full-length, source-native GP-English text *from the tested finite reference windows* under this precise family. It does **not** mathematically exclude all possible English styles, alternate plaintext alphabets, intentional omission of E, multi-stage encryption, key updates within pages, multiple state registers, nonlinear feedback, runic escapes, or changing word segmentation. In particular, it does not establish the mechanism causing the original doublet deficit.

## Implemented, reversible positive and decision

[Standalone CommonJS SFT](../sims/lp2_pagewise_feedback_anyalphabet_capacity_sft.cjs) reads the canonical original ciphertext and the three pinned native-GP corpora, enumerates **all 29 feedback values for each of 55 pages**, and repeats the exact 993/1,048 necessary-condition calculation. It independently encodes a length-matched 12,956-rune Gibran control under **55 different secret alphabets** and page-dependent feedback multipliers, then exactly inverts every rune. The positive control also confirms that its E count is *below its own* blind capacity bound, so the check accepts a genuine instance of the proposed cipher rather than rejecting every text.

**Research decision:** retire the entire pagewise stationary-permutation + one-previous-ciphertext linear-feedback family as a direct GP-English original decoder. The much flatter original transformed-symbol distributions cannot hide native E under any fixed alphabet/key on each printed page. Future work should prioritize source-derived nonlinear/changing-state rules or acquisition of an authentic key/decoder, instead of re-running isolated affine feedback guesses. This adds a distinct one-step memory constraint to the earlier global first-difference gate; it supplies no recovered unknown plaintext.

**Inputs:** [canonical 58-page LP2 corpus](../resources/liber-primus/lp2-corpus.json) (pp0–55 unknown, p50 rune-free); [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), and [Emerson](../resources/control/emerson_essays_2944.txt) control texts. The prior [first-difference SFT](../sims/lp2_difference_allletter_capacity_sft.cjs) supplies the shared, source-fixed GP tokenizer, avoiding a second incompatible transliteration.
