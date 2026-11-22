# LP2 p50 grid as a GP30 movable-space key: exact all-secret six-class obstruction

**Decision, 22 November 2026, Agent46.** The original printed 256-cell p49–p51 grid cannot supply a **stationary, independently bijective 30-symbol substitution alphabet per cell** that converts the entire original LP2 rune+space tape into ordinary native-Gematria-Primus prose. The decision covers continuous and physical-page-reset table clocks, advancing over all printed GP30 symbols or only original source ciphertext runes. Every cell is allowed its own unrestricted secret 30! permutation. Equal table values sharing an alphabet only strengthen the impossibility. A direct table-modulo30 GP30 stream inverse also produces no prose on original pp16–21 or independent pp40–53.

This is a conditional, **key-independent exclusion of a full original-input architecture**, with no unknown-page plaintext recovered. Evolving-state keys, genuine symbol expansion/compression, a recoverable side channel or substantially non-native output are outside its scope.

## Source-visible premise and independent rival

Original LP2 physical p49–p51 contain 256 two-character radix60 numbers in a 32×8 table; p50 itself is rune-free. A **hypothetical** human solver could recognize that 60 is twice a 30-symbol alphabet formed from 29 GP runes plus SPACE, and try table numbers as a cyclic GP30 key or private substitution-alphabet selectors. No authentic source instruction selects a 30-symbol operation, modulo30, cell clock, or page reset. A rival is that original printed words are genuine plaintext boundaries and a missing external key is essential.

The [read-only original-source test](../sims/lp2_p50_gp30_value_space_allsecret_256_sft.cjs) uses the canonical manuscript and source grid. It excludes precisely six Arabic list-heading dashes (1-,2-,3-,4-,5-,7-) as immutable typography, while treating all actual rune word dashes and stops as GP30 SPACE index29. Literal period-versus-dash identity must be retained as visible metadata to reconstruct the exact original printed marks; that is an explicit **conditional sidecar**, not a creator-authenticated cipher instruction. It removes ordinary line wraps without adding invented spaces, respecting the 32 original cross-page word carries. Exact source channel: **12,956 runes + 2,896 printed marks = 15,852 GP30 symbols**, with 55 rune-bearing physical pages and a rune-free p50. The printed grid has 256 positions but only 161 distinct numeric byte values, so table-cell and table-value states are materially different models.

## All-secret theorem

Fix any set of six desired plaintext symbols, for example SPACE and the five most common GP native runes. Let \(n_{s,c}\) be the count of ciphertext GP30 class \(c\) at original source-selected state \(s\). Under an arbitrary secret state-dependent bijection \(P_i=\pi_s(C_i)\), exactly six source classes can map to those six plaintext classes. Sort each state's ciphertext frequencies descending as \(n_{s,(1)},\dots,n_{s,(30)}\). Then the total is bounded above by

\[
M_6=\sum_s\sum_{j=1}^{6}n_{s,(j)}.
\]

This bound is tight for the stated model, even if every secret alphabet can be chosen adversarially after observing the original ciphertext. It needs no guessed key. Literal source grid GP30 Vigenère is a strict subset. A source-ciphertext-rune-only clock is treated here as a conditional original-input occupancy schedule, not a demonstrated forward encoder.

| Original-source state definition | Continuous token clock | Continuous rune clock | Page-reset token clock | Page-reset rune clock |
| --- | ---: | ---: | ---: | ---: |
| 256 individual physical table cell positions, arbitrary secret alphabets | **7,757** (48.934%) | **7,757** (48.934%) | **7,779** (49.073%) | **7,754** (48.915%) |
| 161 distinct source table byte values, arbitrary secret alphabets | 7,140 (45.042%) | 7,144 (45.067%) | 7,133 (44.997%) | **7,112** (44.865%) |

All rows have denominator 15,852 original GP30 tokens. The first row deliberately gives repeated identical table values separate secret alphabets. Across the four tested clock modes, the **most permissive** full-secret bound is **7,779 / 15,852 = 49.073%**.

## Original positive controls and direct inverses

The authentic solved p57 contains 95 GP runes plus 20 word marks; its five most frequent GP runes occur 46 times. Therefore the corresponding SPACE+top-five concentration is **66/115 = 57.391%**. A previously established solved LP1 long section has **(181 marks + 320 top-five runes)/(181+755) = 53.526%**. Eight equal-token-length, source-native 29-GP-plus-space windows from public-domain Gibran text under the SFT's declared Latin-to-GP rules range **53.539%–54.094%**. Thus none of these authentic-source-native comparators can pass the original ciphertext's maximum 49.073% occupancy, even granting every p50 cell an unrelated secret 30! alphabet. The exclusion is conditional on natural native-GP prose, not every imaginable target plaintext.

A frozen literal candidate inverse is \(P_i=(C_i\pm[\mathrm{grid}[i\bmod256]\bmod30])\bmod30\), run under continuous and page-reset token clocks. Both signs and reversed-table-order wrong-source controls make eight complete source-GP30 original trials. All reconstruct their **15,852/15,852 input tokens** under their exact inverse; source p16–21 covers **1,985 tokens**, held-out source p40–53 covers **3,677**. Each output has sparse decoded spaces (about 3% of symbols), >100-rune uninterrupted pseudo-words and GP29 rune IoC about 0.0344–0.0347. No coherent instruction or author-chosen key appears. Complete metrics and decoded prefixes are printed by the committed test.

An independent full-length **source-native positive plant** encrypts real Gibran GP30 text under 161 fully secret source-byte-indexed 30! permutations, then exactly decrypts it with its proper inverse. The planted source-ciphertext M6 bound exceeds the known native target-six count, validating the test. All computations passed on [Windows-latest Node.js 22 workflow 45077391917](https://github.com/FlareZ123/liber-primus/actions/runs/45077391917) using source commit 090ddc141f7fa6fc6483032e8b538c9f19500164.

## Next decision

Retire further experiments that only retune a stationary per-cell full 30-symbol alphabet under these four clocks or vary an unselected cell-value key. To bypass this exact original occupancy theorem, identify a **source-visible state-changing operation**, **authenticated side-information carrier**, **variable-length reversible code**, or another distinct target-language model, then demand intact original ciphertext inverse plus an independent original plaintext prediction. This report provides an exact all-key gate, not a completed solution to Liber Primus.
