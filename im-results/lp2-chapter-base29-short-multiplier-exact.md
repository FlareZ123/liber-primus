# Whole-chapter short BASE29 multiplier: exact endpoint-conditioned key recovery

Agent41, 2026-11-25. Reproducer: [lp2_chapter_base29_short_multiplier_exact_sft.cjs](../sims/lp2_chapter_base29_short_multiplier_exact_sft.cjs), commit `79368e86bdd52c65e09631f49140148c3cc414d2`.

## Hypothesis and decision

The signed 2013 BASE29 convention and the eight-rune LP1 DIVINITY key motivate a small integer key, but neither authenticates multiplication as an LP2 instruction. Test the entire fixed-width 729-rune p0–2 chapter as an integer in either physical digit order, without a reset, offset or bypass. Both C=aP and P=aC (mod 29^729) are reversible for a unit a. This differs from fixed literal 1033/3301 multipliers, fixed title-derived block multipliers, and word-local 3301 multiplication previously examined.

For a complete endpoint word of m digits, the low-order congruence fixes a uniquely modulo 29^m for every candidate lexical plaintext endpoint, because the ciphertext endpoint is a unit. For C=aP, a=C_m P_m^-1; for P=aC, a=P_m C_m^-1. Enumerating the finite 33,386-form lexicon therefore exhausts every unit key shorter than or equal to m digits conditional on the endpoint being in that lexicon. No arbitrary fit of the remaining ciphertext or modular multiplier search is needed. Big-endian (BE) uses the final p2 word of nine runes; little-endian (LE) uses the first p0 word of eight runes. The original tape (12,956 unknown runes, 2,896 groups) is checked against the transcription. The chapter contains 158 groups.

The key is ranked on the low-end page alone, with the forced endpoint word excluded. Remaining pages are then decoded unchanged. Rune-weighted lexical hits exclude cross-page groups. Trigram scores are mean log probabilities in nats per rune (larger is better). The entire original fit candidate set is exhaustively scored, so the largest lexical hit count is also a conditional upper bound.

| Order, short multiplier side | Key width bound | Candidate keys | Maximum fit lexical runes | Frozen winner held-out lexical runes | Held-out trigram |
|---|---:|---:|---:|---:|---:|
| BE, encryption | 9 | 4,038 | 15/190 | 14/525 | -4.86620 |
| BE, decryption | 9 | 4,038 | 15/190 | 13/525 | -4.85310 |
| BE, encryption | 8 | 129 | 13/190 | 18/525 | -4.90552 |
| BE, decryption | 8 | 141 | 11/190 | 14/525 | -4.99386 |
| LE, encryption | 8 | 4,765 | 22/253 | 28/462 | -4.85382 |
| LE, decryption | 8 | 4,765 | 22/253 | 17/462 | -4.80349 |

The LE encryption winner forces LABYRINTH at the anchor, then TRACH LXSTH EUX UYOE; the decryption winner forces PROMISING, then WGNAEEA TIAYI AENG YJC. These are anchor-selection artifacts, not readings. All candidate bounds are conditional on the fixed representation, no offset/bypass, a lexical endpoint and the stated key width. No general multiplication cipher or longer key is excluded.

## Calibration

Eight blind constructed-key controls use two native solved GP sections (first koan and loss of divinity), each excluded from trigram training and native lexicon augmentation, in both digit orders and both multiplier directions. Each true multiplier ranks first; all 4,822 plaintext runes across eight controls recover exactly. Fit lexical coverage is 92–96%; holdout trigram scores range -2.764 to -2.332. The control endpoints are chosen to be in the candidate lexicon, and these are synthetic encryptions of authentic plaintext, not authentic multiplier-encrypted LP2 examples.

Original candidate coverage is at most 15/190 or 22/253, far below control coverage even after granting any short unit multiplier. Reject this direct architecture for p0–2 under the stated word-boundary and endpoint assumptions. No unknown plaintext or authentic key recovered.

## Independent terminal black-body application

The p54 red heading is nine runes, so the black body plus p55 is the final 299-rune scope, starting at global index 12657. Its first complete group has eight runes. The same exact LE short-multiplier inverse independently fits the 223-rune p54 body and predicts p55, with no reuse of an opening chapter key. Each direction enumerates 4,765 candidate unit keys. The encryption-multiplier winner covers 19/205 fit runes and 4/75 held-out, with held-out trigram -4.78966; the decryption-multiplier winner covers 18/205 and 0/75, with score -4.88389. Both forced endpoint words (DEMERARA, SMALLISH) lead immediately to nonprose. The p54–55 LE receiver therefore fails under the same assumptions. The BE terminal receiver is not covered by this extension, since the terminal word is only three runes. Reproducer extended at `a022b47cfd9a99c4465d134d3643b20785b3bf26`.
