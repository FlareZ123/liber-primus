# P27 red-title to p55 exact columnar and circumference-word gates

**Agent 10, 11 November 2026. Classification:** bounded source-constrained original-cipher negative. No unknown LP2 plaintext, key, or destination is recovered.

## Source path and frozen operation

The p55 center-fold mismatch independently selects thirteen-dot fragment **18**, which is exactly the **19-rune red title on p27**:

`MPY LSOAAEHLEEOIML LSCP`

Physical p55 contains exactly **76 original GP runes = 4 × 19**. This makes a conventional keyed columnar transposition unusually specific: use the complete 19-rune title as the column-order key and arrange p55 as an exact four-row, nineteen-column rectangle. No padding, fitted width, key truncation, or cyclic phase is needed.

The test uses stable GP-index ordering of the title runes. Because the p27/p55 lane also carries literal **FOLD** imagery and the exact selected-section relation `1432 mod 1433 = -1`, the bounded family allows only the direct geometric reversals: ascending versus descending key order, forward versus reversed ciphertext, forward versus reversed output rows, and forward versus reversed symbols inside each four-symbol ciphertext column. This is **16** complete reversible variants.

## Original result

The scorer is an add-0.1 GP trigram model trained only on the repository's solved LP1 and solved p56/p57 plaintext reference, which encodes to **3,473 GP runes**. For scale, it scores **179** nonoverlapping-by-19 native windows of the same 76-rune length.

- Untouched p55 score: **-10.7902193 nats/rune**.
- Best of all 16 title-keyed columnar variants: **-10.8109481 nats/rune**.
- Native 76-rune control range: **-8.0517820 to -6.6933121**, median **-7.3587104**.
- The best original variant is therefore below even the worst same-length native solved-text control. Its transliteration begins `HXNGEAEOUMWCUMSEMIADPCEA...` and is not coherent GP prose.
- A 76-rune solved-text plant encrypted with the exact same p27 title key is recovered **76/76** by the conventional decoder, with its language score unchanged.

The result is stronger than merely observing unreadable output: every source-limited orientation tested remains well separated from the solved native-text reference while the exact-key plant passes.

## Decision

Retire the direct **p27-title keyed 19-column transposition of p55** and its immediate fold/reversal orientations. The exact `19 × 4 = 76` geometry remains a source observation that may matter to another stateful or non-GP mechanism, but it does not select plaintext under this standard reversible interpretation.

Do not expand this into arbitrary column permutations, fitted phases, or title-derived arithmetic keys. A further p27/p55 experiment should require a new source-visible operation that fixes those choices before looking at the output.

**Reproducer:** [`sims/p27_title_p55_columnar_sft.cjs`](../sims/p27_title_p55_columnar_sft.cjs).


## Second source-fixed consequence: shed the title circumference to p55's 17 words

The same source route yields a distinct direct test that does not depend on a 19-column rectangle. The selected red title has **19 runes**, while p55 has exactly **17 canonical printed words**, with original word lengths:

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`

The immediately following solved p57 PARABLE explicitly says to **“shed our own circumferences”**. Applying that instruction literally to the selected p27 title removes its first and last rune, leaving the **17-rune interior** `PYLSOAAEHLEEOIMLLSC`. This supplies exactly one fixed GP29 key rune for every p55 word, in printed order, with no period, phase, padding, or length fitting.

I applied each word's fixed key rune to every rune within that word under the three historically ordinary direct orientations: ciphertext-minus-key, ciphertext-plus-key, and Beaufort key-minus-ciphertext. The complete outputs score respectively **-10.9869693**, **-10.7181376**, and **-10.7102610 nats/rune** on the same solved-text GP trigram model. All remain below the native 76-rune control minimum **-8.0517820**. The strongest output begins `NG UWTM CO UAE BLYNUW...`, which is not coherent GP prose.

**Decision:** retire the direct one-shed-title-rune-per-p55-word GP29 mapping. The exact 19→17 and 17-word correspondence is a compact source observation, but this straightforward use does not recover p55 plaintext. Any successor must specify a different operation from independent source evidence before scoring p55.
