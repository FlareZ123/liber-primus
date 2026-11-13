# LP2 p55: two exact key-independent period-25 contradictions for the moth crib

**Agent 8, 13 November 2026. Classification: original-source exact theorem, conditional on a provisional plaintext crib. No unknown LP2 plaintext or authentic key recovered.**

## Source-led decision

The original LP1 p5 moth and the moth on unsolved LP2 physical p55 provide a real illustration correspondence. LP1 p5 also shows a 5×5 magic square and explicit prime/totient instructions. LP2 p55 has one rune completing a prior-page word plus exactly **75 complete-word runes**, divisible into three adjacent 25-rune blocks. Its final seven words have GP lengths **[2,7,7,2,6,3,3]**, matching the solved LP1 p5 phrase **THE TOTIENT FUNCTION IS SACRED ALL THINGS** when FUNCTION's IO and THINGS's ING each occupy their genuine single GP rune. The manuscript does not authenticate this as p55 plaintext; the punctuation also differs. The existing [provisional crib analysis](lp2-p55-moth-p5-terminal-sevenword-crib.md) records that limitation.

A simple source-motivated candidate is any repeating 25-phase position-dependent substitution: each phase has an arbitrarily unknown **bijective 29-rune codebook**, potentially distinct at every one of the 25 positions. It includes any 25-position GP29 Vigenère or affine secret key, and is much more permissive than previously tested fixed p5 totient pads and 32 rigid-square transformations. Let `S_j` be any permutation of GP29 runes and encode `C_i=S_(i mod25)(P_i)` for p55's 75-rune body. The source's original absolute phase may be unknown, since moving the origin rotates all 25 codebooks without altering this condition.

## Original-cipher invariant and witnesses

Because the same *injective* mapping is applied at positions separated by 25, **identical ciphertext symbols require identical plaintext symbols**. The frozen 30-rune LP1 phrase maps to original p55 physical rune offsets46–75. Exactly five phrase-position pairs are 25 apart. In two pairs the unmodified original ciphertext repeats a rune but the candidate source plaintext differs:

| Original p55 offsets (0-based) | Original GP ciphertext | Provisional LP1 source plaintext | Necessary equality |
|---|---|---|---|
| 49 and 74 | GP index18 (E) and index18 (E) | GP index3 (O) and index21 (NG) | Fails |
| 50 and 75 | GP index10 (I) and index10 (I) | GP index16 (T) and index15 (S) | Fails |

This contradiction holds for **every** independently secret 25-phase bijection, all phases, all choices of 29-rune codebook. It also rejects, with no parameter tuning, any repeating 25-phase affine map `C_i=aP_i+b_(i mod25) (mod29)` with a nonzero constant a, including arbitrary unknown pads: the above rows demand that two nonzero plaintext differences multiply to zero in GF29. Indeed, any secret phase-specific affine multiplier also fails. The original 76th rune is explicitly retained; p55's incoming offset0 is excluded from the body but not discarded from source.

**Reproduce:** [single-file CommonJS exact original-source SFT](../sims/lp2_p55_period25_allsecret_moth_crib_sft.cjs). It fixes the GP phrase and canonical p55 indices, asserts both collision witnesses, and confirms that zero nonzero affine multipliers satisfy the source pairs. It encrypts/decrypts **75/75** source-native GP runes from solved p57 and the exact source crib using 25 different genuinely bijective secret phase alphabets. This positive plant distinguishes a faulty implementation from an original-cipher contradiction.

## Decision and limits

Retire **a globally reused 25-phase rune-bijection encoder of this exact 30-rune provisional p55 phrase**. The theorem does not disprove the proposed plaintext itself: a transposition, evolving-state alphabet, word-reset clock, other intermediate register, or non-bijective transport with recoverable auxiliary state can evade the equality invariant. The original moth and matching word lengths motivate the comparison but **do not select a correct inverse or prove the phrase**. No original p55 plaintext has been decrypted. A successor needs an independently selected state/update or another source-authenticated crib; searching more secret 25-phase keys cannot repair the exact same-position conflict.
