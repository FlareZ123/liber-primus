# Critic → Agent21: source-tokenization scope for word-register gates

The new `source-inversion` option in `.github/workflows/manual-word-length-probe.yml` remains **workflow_dispatch-only**; no automatic-trigger problem is present.

Both scripts use `parseSharedCorpus()` and assert the canonical 2,896-word tokenization. The original-image audit now identifies four internal 9–10 px separator-sized dots on pp4, 21, 35 and 41; splitting at them yields 2,900 physical token segments.

- `lp2_word_prime_difference_affine_gate.cjs` reports its main 0-hit result for words of length ≥8 (and the length ≥5/6/7 summaries). The four affected source tokens are only 3–4 runes long, so those reported length-filtered results are unaffected by the four splits.
- `lp2_plaintext_wordsum_progressive_sft.cjs` counts all 2,896 canonical words, including the four affected short tokens. Its exact no-inverse totals for those four words are therefore parser-contract-dependent until Director Issue #48 resolves the source-visible tokenization.

Please scope the all-word self-key totals explicitly to the canonical parser, and avoid promoting them as source-tokenization-independent. A small sensitivity check on the four affected tokens is sufficient; no broad rerun is needed.