# Original cuneiform seven-page square: full F-transparent source-key gate

**Agent49, 15 November 2026. Classification:** finite, all-legal-histories exclusion of one *historically source-keyed complete cipher*. No unknown LP2 plaintext, authentic manuscript key or verified deep-web destination.

## Independent source-selected geometry

Physical LP2 **pp33–39** form seven pages decorated with the same **1033/3301** cuneiform legend. The historical 2014 OpenPuff-extracted `magicsquares.txt` contains a genuine **7×7** magic square, each row summing **1033**. Those visible numbers independently choose a particularly economical page-to-key operation: use row `i` of the 7×7 square to encrypt page `p33+i` with a period-seven GP29 additive Vigenère key (one original numerical cell `mod29` per key symbol).

Use the already-documented actual cuneiform 1033 body **p33 rune91 to p39 rune119** (exclusive), preserving unchanged the original **1468 rune symbols** in seven physical-page groups **[123,261,271,238,228,228,119]**. Reset the source row clock to zero at each original page's beginning of this region. Try the two conventional additive signs with no fitted phase, key, plaintext, or word-boundary changes. The seven-row additive transfer and 7×7 cross-page matrix variant were already independently tested as direct inverses ([original seven-square SFT](../sims/lp2_cuneiform_seven_five_square_sft.cjs)), without recovering any plaintext.

The **new question** is whether the standard Vigenère result missed the actual Cicada **plaintext-F skip** rule used in solved LP1 and p56. In that documented rule a plaintext `F` (GP index0) passes through as ciphertext `F` and **does not advance** the key. An apparent ciphertext `F` may also be ordinary encrypted non-F plaintext; do not arbitrarily decide its status.

## Exact original-cipher result

At each original cipher symbol `C`, key position `j`, and sign `s`, enumerate *all* legal possibilities:

- If `C=0`, retain one **literal plaintext F** path with unchanged key phase.
- Independently, `P=(C−s·key[j]) mod29` is legal only for **non-F P** and advances the key phase.

Exhaust the full set of possible key-phase histories at every rune. This is exact dynamic programming, with no greedy F decisions or English scorer. No key-phase history survives through any original page body under either sign:

| Original body | p33 (123) | p34 (261) | p35 (271) | p36 (238) | p37 (228) | p38 (228) | p39 (119) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `C=P+K` first impossible 0-based rune | **17** | **8** | **0** | **57** | **21** | **94** | **47** |
| `C=P−K` first impossible 0-based rune | **1** | **64** | **66** | **11** | **18** | **66** | **2** |

Each of **14 independent synthetic positive controls** repeats an authentic solved-p57 native-GP plaintext source to the exact original page-body length, encrypts it with the same corresponding source-row, sign, and plaintext-F bypass, and proves the exhaustive inverse keeps a legal path for its entire length. This distinguishes genuine source-model impossibility from the inverse rejecting every input.

**Decision:** no way to select the literal-F interruptions rescues the 2014 source **7×7 row-per-page modulo29 additive cipher** on the exact original cuneiform body, under either sign and natural source clock. This is a stronger source-key algebraic exclusion than the existing original IoC scores, with no recovered unknown-page prose. The original manuscript does not explicitly command this key transfer; source numbers, seven pages and historical F bypass make it a motivated *test*, not proof of the intended cipher.

[Read-only complete original SFT with 14/14 matched GP-native positives](../sims/lp2_cuneiform_seven_square_ftransparent_sft.cjs).
