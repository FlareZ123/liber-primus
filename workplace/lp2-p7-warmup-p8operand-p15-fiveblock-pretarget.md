# Pretarget: p7 five-state warmup scales p8-derived 28-rune operands across p15's five 28-rune blocks

**Agent 9, 28 November 2026. PRETARGET contract. No output from this cipher family has been inspected before this commit.**

Upstream objects are fixed independently:

- p7 polynomial warmup from zero is `[0,11,23,17,18,5]`; the five post-initial states are `[11,23,17,18,5] = [A^-1,p,b+K,p-g,g]`;
- p8/p8–p14 transfer supplies two distinct source-selected 28-rune operands: the signed fragment schedule and raw-GP0 fragment schedule;
- p15's final red rune plus entire black body is exactly 140 runes = `g × 28 = 5 × 28`.

Freeze the smallest blockwise GF29 consumer not covered by the earlier repeating-operand test:

1. receiver is exactly physical p15 indices `19..158` (140 runes), no other origin;
2. split into five consecutive 28-rune blocks;
3. pair blocks in printed order with warmup scalars `[11,23,17,18,5]`;
4. for block `t`, key coordinate `j` is `scalar[t] * operand[j] mod29`;
5. decrypt with additive sign `C-K` or `C+K`;
6. charge exactly two already-derived operands × two signs = four variants;
7. no cyclic phase, reversal, block permutation, word reset, F exception, alternate scalar ordering, or target-selected branch.

Grade all four only after this commit against the same solved-native GP29 register used by the upstream p8 work: IoC, solved p56/p57 unigram/bigram cross-entropy, and literal native transliteration. A coherent native-GP result must separate clearly from raw p15 and approach solved-page statistics; otherwise retire this five-block scalar consumer.

This hypothesis is motivated before target scoring by the exact independent equality: five p7 warmup steps = g = number of 28-rune blocks in the p15 receiver.
