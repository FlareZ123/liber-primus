# Physical p55: 32 word-shell runes as row selectors for the 32×8 numerical grid

**Decision (13 November 2026): eight source-motivated, exactly invertible table-byte-to-interior GP29 transforms are original-negative.** The strongest of eight produces an English-control trigram score of **−4.387465**, below the worst of **62,450** independent Gibran and **321,285** independent Emerson native-GP control windows. None produces coherent plaintext, an authentic key, or a destination.

## Why a human might try this

Solved LP2 p57's *PARABLE* asks the reader to “shed our own circumferences” and “find the divinity within.” The immediately preceding physical p55 prints a one-rune continuation from p54, then **16 complete words** totaling 75 runes. Each complete word has a first and last rune, so stripping them produces **exactly 32 exterior GP runes and 43 interior runes**. The manuscript's independent numerical artifact on physical pp49–51 has **32 printed rows of eight two-character tokens**. This yields a concrete, visible alignment of one exterior rune per row, while the 43 interiors are a candidate payload.

That is an attractive but **unverified interpretation**. Nothing in the signed source requires pairing the 32 shells with table rows, reducing prime values modulo eight, projecting bytes into GP29, or treating the 43 interiors as an independently readable English phrase. It is worth testing precisely because the source suggests a finite, lossless readout without invented pad bytes.

The original p55 length vector is **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. Exclude physical p55 index 0, the genuine NG carry from p54. Extract the first and last GP rune indices of each subsequent word, in printed order. The exact 32 GP indices are:

    25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,
    17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10

The prior original-source [exterior32 AES table gate](../sims/p55_exterior32_grid_aes_sft.cjs) already derived **these same 32 row-wise selectors** and used them to test AES containers in the remaining seven table cells. The prior [direct exterior/interior key gate](../sims/p55_exterior_interior_direct_key_sft.cjs) tested fourteen GP29 endpoint masks, including a distinct 33-rune outside stream that retains the p54 carry. **Neither earlier test applies the 32 selected table bytes as a repeating, modulo29 key to the strict 43-rune p55 interior.** This report decides only that missing consumer.

## Frozen original-input inverse

Let S[r] be the r-th exterior rune index (0..28), P[r] its prime weight, and T[r][c] the original base60 byte in printed table row r, column c. For each table row r=0..31, choose one of two fixed column rules: **ordinal** c=S[r] mod8; or **prime** c=P[r] mod8. These give one selected byte per row.

Turn the 32 selected bytes into a key with one of two projections: **residue** K[r]=T[r][c] mod29, or **scaled** K[r]=floor(29*T[r][c]/256). Read the 43 strict-interior ciphertext runes in original order; decode under either M[i]=C[i]−K[i mod32] (mod29) or M[i]=C[i]+K[i mod32] (mod29).

Each inverse is exact with the unaltered shell. The 32-figure key uses no guessed phase, missing rune, secret permutation, or fitted password. Eight tests arise from the 2×2×2 source operations. Four direct-shell controls (raw, ±GP exterior, reflection in exterior) are also implemented but are not the novel gate.

The numerical table is the conventional base60 **derived byte reading**, itself conditional on the original printed tokens. The author did not authenticate a byte-to-rune projection; this limits the conclusion to the eight exact cases.

## Original results and independent controls

A smoothed GP29 trigram model was trained on the repository's 300,000-character Shakespeare text, using **source-calibrated GP spelling** (ING as NG, IO as IA). The training set has **217,106** runes. Independently solved p57's first 43 runes score **−2.330958** as a native-GP positive control.

| Original p55 43-core test | Mean log trigram score |
| --- | ---: |
| Unchanged interior | −4.699178 |
| Direct 32-exterior C−K | −4.553833 |
| Direct 32-exterior C+K | −5.148314 |
| Direct 32-exterior K−C | −4.565766 |
| Table ordinal / residue / C−K | −4.558467 |
| Table ordinal / residue / C+K | −4.781498 |
| Table ordinal / scaled / C−K | −4.941195 |
| Table ordinal / scaled / C+K | −4.696721 |
| Table prime / residue / C−K | −4.764336 |
| **Table prime / residue / C+K** | **−4.387465** |
| Table prime / scaled / C−K | −4.761968 |
| Table prime / scaled / C+K | −4.454866 |

The **least native-like Gibran** 43-rune window scores −4.042867 across **62,450** overlapping windows. The **least native-like Emerson** window scores −4.141443 across **321,285** overlapping windows. Every original candidate scores below **every** native window in both held-out corpora. The best table variant emits the GP transliteration:

    AFRXEALABPHELJSFFUUSBNTATEOEBARJEOEALTHDIDBWEOUXH

The output is nonlinguistic and **not** a decryption. All **12/12** original outputs reproduce their 43 original ciphertext runes exactly when encoded, and all **12/12** planted solved-p57 43-rune passages decrypt exactly. These are implementation checks, not evidence of the historical key.

## Interpretation and next decision

Retire the **32 original word-exterior runes → 32 table row selections → repeated period32 GP29 add/subtract of 43 strict-interior runes** for the specified selector/projection family. The table's byte meaning, p57 metaphor, 43-rune interior, and possible nonstationary or multi-stage operations remain unresolved. Further row-permutation, phase, or projection tuning on this source would be an unselected cipher search. Reopen only if a player-visible or independently authenticated clue fixes a different original operation **and predicts sustained unknown plaintext**.

**Single-file reproduction:** [p55 shell32-table32 inverse SFT](../sims/lp2_p55_shell_table32_source_inverse_sft.cjs), reading the canonical LP2 source, derived base60 table and independent Shakespeare/Gibran/Emerson corpora; no network calls, seeds, or selected score windows.
