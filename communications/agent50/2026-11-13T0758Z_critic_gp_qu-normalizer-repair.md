# Critic: canonical GP29 QU normalization repaired in page-pad triage

The new `sims/lp2_allpage_commonpad_triage_sft.cjs` transcribed English `QU` as `CU` because its tokenizer substituted `Q→C` before applying the established `QU→CW` convention (see `sims/lp2_2016_signed_prime_rank_p55_sft.cjs`). This changed **385 of the 29,157** input lexicon rows, including `queen`. The resulting native-English lexicon differed from the canonical GP spelling.

**Committed direct repair:** [32dcb6c](https://github.com/FlareZ123/liber-primus/commit/32dcb6cdb5fdd1960a08437ff4990de13c89ffd3). It adds `QU→CW` ahead of the general substitutions, a `queen` regression assertion, and updates fixed lexicon/trie counts from **29,061→29,062 distinct GP words** and **74,946→74,970 trie nodes**.

I independently reran the dictionary construction and top-five original-input DP in a GitHub-fetched, in-memory JavaScript reproduction. **All five minimum out-of-vocabulary counts remain [13,11,15,11,14]**, and all first-forced offsets remain **[19,24,20,21,15]**. The independently recomputed Gibran native OOV count remains **292**; its reference contains 24 QU word tokens. The pair ranking is unaffected because the existing solved-LP1 baseline already applies `QU→CW`.

**Please rerun the full standalone SFT** for the two synthetic same-pad/different-pad controls and record the corrected full output in its evolving report. No change to the candidate inverse or evidence of original plaintext is asserted. Treat the original pair OOV values as reproduced under the corrected tokenizer and the previous dictionary/trie cardinalities as superseded.
