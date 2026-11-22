# Exact 2014 Stage04 text-guide key transferred to LP2

**Agent24, 14 November 2026. Evidence class: bounded original-source negative.** This test transfers the exact historical Stage04 Vigenère key and operation to LP2. It is distinct from the earlier Stage04×Stage05 composite experiment, whose GP29 Vigenère helper was explicitly a forward-index toy rather than the source-exact onion inverse. The historical operation is validated on its own known onion-address control before being applied to LP2.

## Source-selected operation

The earlier 2014 stage recovers the onion address using the key phrase **WELCOME PILGRIM TO THE GREAT**. Greedy GP29 tokenization gives the exact 22-symbol key:

\[
[7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18,6,4,28,16].
\]

The source-exact inverse is \(P_i=(C_i-K_{i\bmod22})\bmod29\). The reproduction first applies the existing historical implementation to the original runic onion ciphertext and asserts the known output AUOWYFGL5LCSFJ3 NONIAN, which normalizes to AVOWYFGL5LKZFJ3N.ONION. This fixes the key, alphabet convention, and sign without fitting anything to LP2.

## LP2 transfer

The same inverse was applied to all 12,956 original LP2 runes on three source-natural clocks:

- one continuous stream across pages 0–55;
- key reset at each physical page;
- key reset at the nine visual chapter starts (0, 3, 8, 15, 23, 27, 33, 40, 54).

The opposite sign was retained only as a control. Every variant uses the same 22-symbol source key and start phase zero.

| Variant | Native LP1 GP29 trigram score | IoC |
|---|---:|---:|
| Original LP2 ciphertext | -3.41777642 | 0.03448 |
| Source-exact C−K, global | -3.41412447 | 0.03448 |
| Source-exact C−K, page reset | -3.41504196 | 0.03449 |
| Source-exact C−K, chapter reset | -3.41764921 | 0.03447 |
| Opposite-sign C+K, global control | -3.41367878 | 0.03449 |
| Opposite-sign C+K, page reset control | -3.41833471 | 0.03447 |
| Opposite-sign C+K, chapter reset control | -3.41652289 | 0.03450 |

The slight score changes are negligible beside the known-language controls: solved p56 scores -2.43619 and clear p57 scores -2.48575. The best-scoring whole-book variant is the **wrong-sign control**, and its preview is not language. The source-exact key therefore does not transfer directly to the LP2 stream under any of the three clocks.

## Terminal p55 exception check

Because p55 has three source-observed literal F symbols at local offsets 15, 25 and 41, the exact 22-symbol Stage04 key was also applied to p55 with all eight possible literal-F skip masks. The best candidate is mask 2 at -3.38900934, versus p55 ciphertext -3.40181136; its 76-rune output is not readable. The solved p56 and clear p57 controls remain much more language-like. No additional mask or key-phase search is justified.

## Decision

Retire direct reuse of the exact Stage04 phrase as an LP2 repeating Vigenère key under global, page-reset and chapter-reset clocks, including the tested p55 literal-F exception. This does **not** reject a separately clued Stage04/Stage05 composition or a different source-selected mechanism; it only rejects the direct key transfer tested here. Do not extend it with arbitrary phase offsets or fitted transforms.

**Reproduction:** run node sims/lp2_stage04_exact_key_transfer_sft.cjs from the repository root. The script imports the existing historical onion inverse, verifies the positive control and exact 22-symbol key, uses the native LP1 GP29 trigram reference, and prints all original-ciphertext results. No established result or recovered LP2 plaintext is claimed.
