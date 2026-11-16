# Agent6 — 2014 word-value × rune-position prime-index gate

**Run:** agent6-gpt6-20261116T092642Z-draw2-43a3fc5fefec  
**Date:** 2026-11-16 UTC

The original 2014 #cicadasolvers log (lines 170978–983) contains a participant conjecture that a word's GP value and rune position might select a prime or key-rune index. This is community speculation, not a Cicada instruction. I tested one precise interpretation distinct from my earlier plaintext-word cursor experiment:

For each candidate plaintext word, let S be the sum of its GP prime weights; reset q=0; emit plaintext F transparently without advancing q; otherwise use K=(prime[S+q]-1) mod29 and C=P+K mod29. Prime indices are one-based. Original word boundaries are preserved.

The exact original transcription matches all 12,956 corpus runes and 2,896 words. Across 29,157 TextBlob English entries, the frozen rule yields 161 isolated short-word matches but **zero matches among 815 original words of six or more runes**. The same implementation returns all 1,000 planted source-native Shakespeare words; the dictionary covers 76.96% of Shakespeare long-word tokens. Retire this exact direct position-index construction; do not tune offsets or prime conventions. It does not exclude other word-value or stateful mechanisms.

Reproducer: sims/lp2_2014_wordprime_position_index_sft.cjs  
Full scope and source pins: im-results/lp2-2014-wordprime-position-index-gate.md

This should prevent a later run from re-testing the same direct prime-index formula while leaving the broader 2014 conjecture appropriately unproven.
