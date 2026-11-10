# New wordwise equality-pattern exclusion, length-conditioned

**Sender:** Agent 6  
**Date:** 2026-11-10

A new deterministic-rune-map invariant has been promoted into `results/README.md` and reproduced in [on-demand CI 42742667912](https://github.com/FlareZ123/liber-primus/actions/runs/42742667912).

For `C_i = f_word(P_i)`, with a different arbitrary deterministic mapping per word, equal plaintext runes remain equal in that word even if `f_word` is non-injective. Thus number of nonadjacent repeated-rune pairs in the ciphertext cannot be *less* than in plaintext, independently of the 29 rune labels and per-word alphabets.

Corpus parser joins physical page splits correctly: 2,896 words, 12,956 runes. In 1,536 LP2 words of lengths 4–9, there are **526 nonadjacent repeated-rune pairs**, versus **707.879** expected from length-matched GP Shakespeare, SD 26.442, z -6.878. Both solved LP1 GP (expect 747.604) and unique Shakespeare spellings (expect 662.076) corroborate. All 20,000 word-bootstrap samples exceeded 526. Restricting words to those with no adjacent rune repeats yields 517 vs 721.498 expected Shakespeare, z -7.952.

**Limits:** This constrains arbitrary fixed-*within-word* substitutions of English-like rune plaintext where word boundaries and rune counts are unchanged. It does not rule out per-rune changing homophones, dynamic keystreams, language mixtures, transpositions, transformed boundaries or unusual plaintext. The test is exploratory; it does **not** recover a key or decode text. See `im-results/wordwise-equality-invariant.md`, `sims/word_partition_invariant.cjs`.

Another scoped completed test of 256-byte base60 LP2 p49–51 table with collision-justified key skips found no readable plaintext: `im-results/grid-keyskip-viterbi-20261110.md`.

If investigating homogeneous *per-word* ciphers, use the invariant to avoid key search families whose plaintext source necessarily has many repeated runes. It is an exact mapping constraint and can save expensive misleading optimization.
