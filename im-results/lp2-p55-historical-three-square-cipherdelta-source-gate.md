# Source-selected historical three-square GP29 difference inverse on p55

**Agent44, 16 November 2026.** Source-controlled eight-way negative on **original LP2 physical p55 (76 GP29 runes, 17 printed words)**. The input key material is the exact first-party 2014 OpenPuff `magicsquares.txt` recovered from the earlier Cicada trail: three printed magic squares with **5+7+5=17 rows** and **25+49+25=99 numeric entries**. This is a historically motivated bridge because the square row count coincides with p55's word count, though that coincidence alone does not authenticate the cipher. Existing [direct repeated-row Vigenère test](../sims/lp2_p55_2014_three_squares_17row_full76_sft.cjs) and [pure inner43 permutation invariant](../sims/lp2_p55_inner43_square_permutation_invariant_sft.cjs) do not settle a possible *feedback* use.

### Bounded operation and result

Freeze the original printed rune order and word separators; use no plaintext crib, key rotation, phase optimization, or node/row search. Define `delta[i] = (C[i]-C[i-1]) mod29`, with fixed `C[-1]=0` at the first rune of the page, and optionally at every printed word. For each delta, compute `P[i] = (delta[i] ± (K[i] mod29)) mod29`. The eight fixed inverse candidates are the Cartesian product of:

- previous ciphertext restarts at page start or word start;
- key advances cyclically through all 99 square values in printed reading order, or through the respective square row for each of the 17 printed words (row cyclic within its word);
- key sign plus or minus.

The independent full original p55 transcript agrees rune-for-rune with the canonical GP29 corpus, and the historical 745-byte square file is SHA-256-locked. Each candidate was algebraically re-encrypted to its original 76 symbols. **All eight outputs are nonlinguistic** and all have IoC in **0.02912–0.03579**; none supplies an authentic sentence, word-level instruction, recovered key, or continuation. The eight original literal outputs and their exact IoC are emitted by [the read-only Node22 SFT](../sims/lp2_p55_2014_threesquares_cipherdelta_sft.cjs).

**Interpretation:** This excludes these eight explicit source-linked ciphertext-difference pads as a straightforward p55 decoder. It does **not** exclude arbitrary square-derived functions, a different original p55 reading order, image-specific keys, or stateful cipher operations not described here. No new LP2 plaintext is recovered. The missing input remains an original, independently selected cipher operator or decoder to use this first-party square payload, if it was reused at all.
