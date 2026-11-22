# EA-zero differential multiplicative cipher: source-key gate

**Classification: negative intermediate result. No unknown LP2 plaintext or key recovered.**

## Hypothesis and motivation

Across LP2 p0–55 there are **86 equal adjacent ciphertext-rune pairs** in 12,901 within-page adjacency opportunities. A proposed 29-to-28 encoding treats GP rune EA (index 28) as zero and maps each other rune P to the nonzero field element P+1 in GF(29). A cumulative multiplicative cipher would then have the simple form

\[
D_i=(C_i-C_{i-1})\bmod29,\qquad
D_i=\pm K_j(P_i+1)\bmod29.
\]

Thus D=0 identifies EA; nonzero differences can be inverted using a nonzero key K. This is a motivated stateful alternative to ordinary additive Vigenere, not an established LP2 mechanism. The related periodic-key search in `sims/field_unit_discrete_log_periods.cjs` did not test the following nonperiodic, source-derived key schedules.

## Source-derived keys tested

The original ciphertext and printed data were used without alteration:

- Prime residues p mod29 and prime totients (p−1) mod29, omitting zero key values because they are not invertible in GF(29).
- The 256-byte p49–51 table from `resources/liber-primus/lp2-grid-256.json`: row-major, column-major, outer-in/inner-out ring traversals, and the 180-cell interior, mapped to units either by b mod28 + 1 or by b mod29 with zero values skipped.
- The independently solved p56 plaintext followed by clear p57 plaintext (180 runes) as a source-derived running key, with EA mapped to zero and omitted.

For each candidate, the test varied only the sign, whether an EA zero-step consumes a key symbol, and whether the key pointer resets at page boundaries. Ciphertext state remained continuous across the original book stream, matching the global difference model. The 136 tested combinations are fully specified in the reproduction script.

## Result

The source controls reproduce **55 rune-bearing pages, 12,956 runes, 86 within-page doublets, and zero equal cross-page joins**. The p56 decoder control begins `ANENDWITHINTH`; the p56 and p57 lengths are 85 and 95, giving the 180-rune candidate running key.

The best of all 136 models has a held-out Shakespeare GP29 unigram log-score of **−0.85785**. The independent held-out English reference scores **+0.37895** under the same prior. The best p50-table-key model scores **−0.87104**. The best previews are incoherent rune strings; occasional fragments such as THINGS or THE do not constitute plaintext. All candidates therefore fail this language gate.

The 86 EA outputs are imposed by the model's D=0 rule, so their count is not independent confirmation of the hypothesis. The result rejects only these specific prime/totient, p50-table, and p56+p57 key instantiations of the EA-zero differential multiplicative family. It does **not** rule out a different source-authenticated key, a different state update, or another cipher architecture.

## Reproduction

From the repository root:

```sh
node sims/lp2_ea_zero_differential_source_key_gate.cjs
```

The script includes a synthetic encrypt/decrypt round-trip check, asserts the original source counts and p56 positive-control head, and prints the exact best models and scores. No established-result synthesis change is warranted.
