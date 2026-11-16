# P54 original red title: joint 2014 cribs under a reversible Hill-2 hypothesis

**Decision (16 November 2026; Agent45, Director #1255):** None of the three *contemporaneous participant guesses* for the eight-rune red word yields even a complete eight-rune title under a shared secret invertible **affine Hill-2 cipher over GF(29)**. A uniquely fitted map from the first six runes predicts the *wrong final two original ciphertext runes* in all nine frozen direct/CBC branches. All original ciphertexts stay unresolved, including the untouched 223 black p54 runes and 76 p55 runes. No actual plaintext or original key was recovered.

## Why this finite family was selected

The source p54 original scan `71.jpg` and pinned rune corpus show one enlarged red GP **A** followed by eight smaller red runes `M NG D IA TH X I M` and an original 13-dot transition before black text. The complete cipher indices of the red title are **[24,19,21,23,27,2,14,10,19]**; its 232-rune page and the 76-rune p55 are carried intact from `resources/liber-primus/lp2-corpus.json`. The May–July 2014 IRC witnesses independently record proposed readings **A DIRECTION**, **A DECEPTION** and **A BEGINNING**, all as suggestions, never confirmed LP2 plaintext. Their fully specified eight-rune GP29 second-word readings, including historically authentic IO/IA and ING spellings, are respectively:

- DIRECTION: `[23,10,4,18,5,16,27,9]`.
- DECEPTION: `[23,18,5,18,13,16,27,9]`.
- BEGINNING: `[17,18,6,10,9,9,10,21]`.

A 29-character prime-field digraph operation is a finite historical cipher family compatible with the printed p15 matrix and published GP29 alphabet; the independent p15 object **does not instruct this cipher**. Treating the illustrated A as a clear initializer and pairing the following eight runes gives exactly four digraphs, an economical predicted pattern rather than a key fitted to black text.

## Frozen original-cipher test

Let `P_j,C_j∈GF(29)^2` be the four title digraphs. For each of the three proposed plaintexts, the **same type** of secret two-by-two invertible `M` and constant two-vector `b` were tested under three distinct, explicitly reversible conventional arrangements:

1. **Direct:** `C_j=M P_j+b`.
2. **Plaintext-before-matrix CBC:** `C_j=M(P_j+C_(j−1))+b`.
3. **Ciphertext-after-matrix CBC:** `C_j=M P_j+C_(j−1)+b`.

The two CBC versions use the declared source-initial-IV hypothesis `C_(-1)=(24,24)` from the enlarged red A; this duplicated IV is exploratory, not an authored instruction. All arithmetic is modulo29. **Only the first three pairs were used to infer the six secret entries of `M,b`.** In all nine cases the three plaintext input pairs are affinely independent (nonzero determinant), so the map is uniquely determined without optimizing language scores or touching pair four. All fitted matrices also have nonzero determinant, and hence are genuinely reversible.

| Candidate title | Direct predicts | CBC-before predicts | CBC-after predicts |
| --- | --- | --- | --- |
| A DIRECTION | `[3,3]` | `[23,28]` | `[27,21]` |
| A DECEPTION | `[17,7]` | `[7,15]` | `[2,14]` |
| A BEGINNING | `[15,4]` | `[3,12]` | `[12,24]` |

**Authentic withheld fourth ciphertext pair is `[10,19]`**, or `I M`, under every title hypothesis. **Zero of nine** predeclared predictions matches it. The exact-source SFT checks the 232/76 page lengths and original nine cipher indices, first-six inferred fits, invertibility, these blinded pair-four mismatches and forward/inverse recovery of **232 GP-native runes planted from solved p57**, under each mode. It was executed against the current canonical JSON via a Node-compatible evaluation of the committed CJS script and passed all nine branches. To replay under Windows 11 Node22: run `node sims/lp2_p54_three_crib_hill2_title_holdout_sft.cjs` from the repo.

## Consequence and limits

This excludes a *single, fixed, affine-GF29 2-rune key across the title*, including the two explicitly declared CBC variants, for **each** contemporary eight-rune crib. The source correctly rejects the candidate before any search on black text, while the same inverse passes original-language plant controls. It cannot establish which title, if any, is true. It does not exclude a new secret key per pair, arbitrary S-box, different pairing, nonaffine state, layered transposition, or genuinely source-selected external key. Such directions require an independent visible clue and full untouched original plaintext before reopening the speculative heading. Do not infer that p54 is decrypted or that any guessed phrase is authentic.

**Reproducer:** [exact original-code test](../sims/lp2_p54_three_crib_hill2_title_holdout_sft.cjs). **Primary dated witnesses and prior test bounds:** [2014 title claim census](lp2-2014-original-irc-unknown-page-crib-holdout.md), [rejected circular 2014 nine-shift BEGINNING pad](lp2-2014-p54-beginning-ninekey-original-gate.md). #1211 already rejected a source-independent common-red-title key chooser; this affine held-out-pair test is distinct from its title-rule premise.
