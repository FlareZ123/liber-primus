# Nine original LP2 chapter starts: paired-pad cancellation gate

## Decision (17 November 2026; corrected source calibration)

The original nine chapter boundaries identify **36 precise start-aligned ciphertext pairs** with complete GP29 lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008 and 308 runes**. If two such chapters use a *shared additive GP29 keystream restarted at the chapter initial*, the key cancels in `(C_a[i] - C_b[i]) mod29`, leaving the difference of two native-English GP29 plaintexts. The corrected source-calibrated test finds no authentic unknown plaintext or usable key.

A second, distinct receiver gives the original p56 **plaintext-F-transparent** skip rule full license: a ciphertext F can be an encrypted non-F or a bypassed plaintext F, and the two chapter streams can desynchronize. A key-marginalizing pair alignment finds no above-null original start pair in a familywise test, and its weak leading 300-rune scores do not develop into strong, coherent complete-section signals. This rejects **these two frozen chapter-start shared-pad diagnostic families**, not every possible relation between unknown sections.

Reproducer: [source-native CommonJS executable](../sims/lp2_chapter_start_keyreuse_original_sft.cjs). Inputs: unmodified [GP29 original corpus](../resources/liber-primus/lp2-corpus.json) and [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt).

## Source-control correction

The earlier SFT version made two control-corpus errors: it mapped every adjacent Latin `IO` to GP index 27 (the `IA` rune), although the alphabet has separate `I` and `O`; and it stripped page headings before concatenating the reference file, thereby including LP2 p56/p57 and synthetic cross-page windows in a purported LP1-only model. The corrected SFT encodes the source-attested `ING` rune, keeps `I` and `O` separate, uses only original LP1 pages **1 and 3–16**, and samples positive/negative 300-rune controls wholly within a page. This gives **3,318** LP1 runes and **680** eligible page-contained 300-rune windows. All prior 3,510-glyph, F-rate and control-distribution values are superseded.

## Direct additive-key cancellation

The corrected language model uses add-one smoothing over the 3,318 source-native LP1 runes. Its expected GP29 difference frequencies are `q[d] = Σ_x p[x]p[(x−d) mod29]`; each pair is scored by `mean log(29q[(C_a−C_b) mod29])`.

- **All 36 complete original aligned pairs** have negative mean log-likelihood ratios. The best pair of length at least 729 is **−0.013716** (chapter groups 2 and 3, 1,729 runes).
- On the **frozen first 300 runes**, the strongest of all 36 source pairs is chapters **5 and 6**, score **+0.0004265**. Exactly **3,195/5,000** matched pseudo-chapter panels generated a higher or equal family maximum when independent 300-rune offsets were chosen within the original nine chapter ciphertext streams. Empirical familywise **p=0.63907** using the add-one rule. This null preserves original per-chapter rune inventories and local anti-repeat behavior.

## Exact transparent-F clock-alignment diagnostic

The authentic p56 rule skips key advancement only when the *plaintext* rune is F (index 0). The unknown cipher's printed F may also be encrypted, so naïvely removing all ciphertext Fs would be wrong. A two-state forward dynamic program sums every legal pairwise same-key alignment at original chapter start, canonicalizes optional bypasses and marginalizes the unknown shared additive pad. The corrected add-one smoothed plaintext-F probability is **0.0191216**.

- **120 same-pad source-native LP1 pairs** at 300 runes, drawn from page-contained windows and encoded with exact F-transparent skipping, have median score **+0.011395** (5th percentile **−0.003604**, 95th percentile **+0.028107**). The corresponding **120 independent-key pairs** have median **−0.007565** (95th percentile **+0.005533**).
- The original first-300 maximum is **+0.0053317**, pair chapter groups **1 and 8** (the second ends at 308 runes). In **75 matched familywise panels** where each original chapter supplied one independently offset 300-rune contiguous span, **44** panel maxima were at least that strong; empirical **p=0.59211**. The source-aligned maximum is ordinary under this matched null.
- Top longer first-300 original pairs flatten when extended: group **1–8** scores **+0.005332 → +0.004479** over 308 runes, **1–3** **+0.001520 → −0.004255** over 1,145, **1–6** **+0.001307 → −0.006487** over 1,145, **2–7** **+0.000775 → −0.001749** over 1,729, **1–5** **+0.000648 → −0.008563** over 1,145, **5–6** **+0.000461 → +0.000640** over 1,433, and **3–4** **−0.000249 → −0.004607** over 1,021.

## Implication for decipherment

No verified unknown-page text, source-derived key, or exact original forward plaintext reconstruction emerged. Both the fixed-rate and p56-transparent chapter-start shared-pad diagnostics remain below their source-preserving familywise null gates after correcting the training corpus. A new first-party key-sharing clue could justify a different, separately frozen attack; arbitrary phase offsets, state restarts, or tuned F masks are not supported by this result.

This is a **bounded architecture exclusion**, not a decryption of the 56 unresolved pages.
