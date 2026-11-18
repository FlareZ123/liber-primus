# GP28 Fibonacci plaintext-feedback: low-repeat encoding succeeds, original inverse fails

**Agent 8, 18 November 2026. Evidence:** one source-motivated, deterministic two-plaintext-tap decoder, exhaustive unknown starting states on two intact original LP2 chapters, and three independently native-GP positive controls. **No recovered unknown manuscript plaintext, authentic key, or destination.**

## Why this operation merited one decisive test

Original LP2 physical p15 has a Fibonacci-prime illustration. Its 12,956 still-unknown GP29 runes have just 86 immediate repeated ciphertext successors in 12,901 within-physical-page comparisons, including across printed word breaks. The settled historical cryptosystems often encode GP symbols by small reversible arithmetic. A Fibonacci-style **two-plaintext-tap**, unlike the earlier [two-ciphertext-tap](lp2-two-tap-fibonacci-cipherfeedback-original-gate.md) and [single-lag GP29 plaintext-autokey](lp2-plaintext-autokey-allseed-gate.md), can put an evolving plaintext-derived value into a **28-way nonzero ciphertext step**. That would explain why even encrypted English produces few adjacent repeats without adding a separate rejection-sampling layer.

The manuscript does **not** explicitly command the following modulo-28 alphabet or recurrence. The matching Fibonacci and anti-repeat clues justify testing the simplest specific formulation, not accepting it as historical.

## Fixed fully reversible candidate

At the start of a contiguous source chapter the first two ciphertext runes are public IVs; the initial two plaintext runes are each an unknown symbol 0..27. For later positions let GP rune values be C[i] and P[i]. Let GP index 28 (EA) be a transparent **zero-step symbol**; it contributes integer zero when used as either plaintext-history register. The distinct ordinary rune F (index 0) also contributes zero to the sum, but its output differs unambiguously: 

- If P[i] = EA, emit C[i] = C[i-1], a repeated ciphertext rune.
- Otherwise calculate d = (P[i] + P[i-1] + P[i-2]) mod 28 and emit C[i] = (C[i-1] + d + 1) mod 29.
- For inversion, a repeated ciphertext successor recovers EA directly. Every nonrepeat determines d = (C[i]-C[i-1]-1) mod 29, which must lie 0..27, and uniquely recovers P[i] = (d-P[i-1]-P[i-2]) mod28.

This is a complete lossless GP29↔GP29 transducer for any initial two plaintext symbols and initial two output symbols. It deliberately carries the two-register state across the original source chapter, including its physical page boundaries and printed word boundaries. **All 28² = 784** possible independent starting-plaintext pairs are exhausted for each untouched target chapter. The candidate does not fit free keys, KDFs, phases, or glyph substitutions to the original ciphertext.

## Exact original-input experiment

Data: unchanged [canonical LP2 source](../resources/liber-primus/lp2-corpus.json). Each target chapter is concatenated in its visible physical-page order. We maximize GP29 *normalized* index of coincidence (29 times the conventional IoC), a generous seed-free test because every actual English-like native-GP recovery should concentrate marginal letters. The code checks all 784 start pairs and reports the best original opening.

| Target | Runes | Original normalized IoC | Maximum decoded normalized IoC over **all 784 initial states** | Winning (P0,P1) |
| --- | ---: | ---: | ---: | --- |
| LP2 pp0–2, original 27² opening | 729 | 0.9883929514 | **1.0446758317** | (11,13) |
| LP2 pp40–53, complete floral text including the numeric-only p50 interleaf | 3,008 | 1.0017361971 | **1.0331053782** | (10,8) |

Neither most-favorable output is readable GP English. The winning source p0 opening reads \`JPPSTHDIAHGGETMUOXXIXPGTHYHJECACBRBSOAENAEXOE...\`. The second begins \`IHMWIIALLOOEOXNGAYNWISNAPACAETMTHMJHMBNXYAELOB...\`. These are actual GP transliterations, with digraphs retained as single rune types.

**Stronger source-visible physical-page resets:** To allow this same cipher to restart independently on each original page, the script also exhausts all 784 starting plaintext pairs **separately for each of the 55 rune-bearing unsolved physical pages**. Every page is scored at its own best seed, and equality-pair numerators/denominators are pooled only **within pages** so independent alphabet offsets cannot spuriously increase between-page collisions. This generous all-page original upper envelope is **1.1112753521** normalized IoC; the original three-page opening alone yields **1.1501407255** when each page gets its own best initial pair. Ten nonoverlapping complete-size Shakespeare GP-native control windows, split at *these exact same 55 physical page lengths*, give **1.7220198390–1.8096757533**. Every original all-page seed optimization remains well beneath all ten unencrypted natural-GP controls. This is a separate page-reset envelope and closes the obvious originally visible reset alternative without searching extra guessed key families.

**Native source positive:** tokenize three disjoint 729-rune intervals from the independently pinned [Shakespeare source](../resources/control/shakespeare_first300k.txt), use the identical GP29 alphabet and literal EA zero-step rule to encrypt under the stated two-plaintext-tap cipher, then invert with the hidden initial pair and search all 784 initial pairs blind. Exact source recovery holds for **729/729** on each plant. Their genuine GP-native plaintext normalized IoCs are **1.8550400217, 1.8441113071, 1.6917650251**, and the corresponding cipher outputs are **0.9947316058, 0.9818357226, 1.0036931518**. The three generated ciphertexts have respectively **8, 6, 3** adjacent repeats, so the proposed cipher genuinely can produce the observed low-doublet regime while preserving native English. In every plant the all-seed maximum reaches the true plaintext's IoC or higher.

The large original gap remains even after optimizing every possible starting state, while the positive model produces and recovers unmistakable GP-English marginal concentration. No source-authenticated cipher key or continuation is supplied by a roundtrip.

## Interpretation and next action

**Retire this direct two-plaintext-tap modulo-28 Fibonacci/nonzero-step decoder on intact original ciphertext under both a single chapter-continuous register and freely reinitialized physical-page registers.** It explains the anti-adjacency symptom under natural-language positives yet fails actual plaintext inversion, a useful reminder that suppression alone is inadequate evidence for an operation. Different plaintext alphabets, an independently instructed extra key, word-local state resets, nonadditive feedback, or a lost historical payload remain outside this test. Nothing here selects the exceptional symbol or plaintext state law as author intended. Do not rescue this formulation by fitting arbitrary second-layer keys or unselected reset schedules.

Read-only, single-file Node.js 22/CommonJS regression: [\`sims/lp2_gp28_fibonacci_two_plain_tap_source_sft.cjs\`](../sims/lp2_gp28_fibonacci_two_plain_tap_source_sft.cjs). The actual original-data and positive-control calculations were separately executed in the connected analysis runtime before committing the source; a hosted GitHub Actions run is not claimed.
