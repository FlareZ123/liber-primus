# Solved manuscript word alignment: additional abbreviation grammar gate (#2925)

## Decision

All nine solved source sections, including the complete original LP1 and LP2 p56/p57, supply 739 aligned rune groups and 2,977 plaintext runes. The already established source-native GP spelling rule accounts for **738/739 words exactly**, with the sole exception the independently verified six-rune WIDSOM transposition. Every word has the exact length predicted by the established spelling rule. No additional recurring abbreviation, word-level code or morpheme substitution is identified. This closes the attestation gate of #2925, before any unknown ciphertext fitting. It does not prove that unknown LP2 cannot introduce a new representation.

## Source-grounded method

Reconstruct word boundaries from the canonical master transcription, treating slash/page breaks as layout, not word separators. Align the Latin reference by section, removing editorial bracketed annotations, normalizing apostrophes without splitting contractions, excluding duplicated continuation text, retaining the source-spelled BELEIVE, and including the printed grid labels and KNOW THIS heading. Numeric cells and the p56 hexadecimal string are not rune words.

For encrypted sections, use actual established source ciphers rather than treating original ciphertext as plaintext:
- WARNING: reverse GP29 (184 runes).
- WELCOME: DIUINITY, plaintext F bypass; exact published native donor re-encrypts all 515 runes.
- First KOAN: P=2-C mod29 (778 original runes); do not use the external donor's two WHAT substitutions (780 runes).
- Second KOAN: FIRFUMFERENFE, plaintext F bypass; exact published native donor re-encrypts all 319 runes. Its donor punctuation is editorially different at one word split; use the original ciphertext word boundaries.
- AN END: prime-minus-one with the one literal F hold at offset 56 (85 runes).
- Clear GP sections: take their original glyphs.

All nine reconstructed tapes replay the original ciphertext exactly under these already independently established ciphers. The known WIDSOM vs WISDOM distinction is independently established in [the original source error-history study](lp1-widsom-error-history-original-gate.md). This is not a new decryption claim.

Freeze the pre-existing [source-native GP spelling rule](../sims/lp2_native_gp_source_orthography_sft.cjs): QU→CW, V→U, K/Q→C, Z→S; ING and IO use the native NG/IOR glyphs, otherwise longest chart-token match per word. In addition, test all possible segmentations using the existing chart token and alias set; no new abbreviation is learned from the target. The 181 LOSS OF DIVINITY words were used by the earlier rule's source calibration, and PARABLE was an earlier held-out check. The other sections expand the alignment to the remaining original solved material; this is a finite source census, not a newly blinded independent sample.

## Exact result

| Original solved section | Rune groups | Runes | Exact greedy spelling |
|---|---:|---:|---:|
| WARNING | 45 | 184 | 45 |
| WELCOME | 124 | 515 | 123 |
| SOME WISDOM | 31 | 157 | 31 |
| KOAN 1 | 208 | 778 | 208 |
| LOSS OF DIVINITY | 181 | 755 | 181 |
| KOAN 2 | 87 | 319 | 87 |
| AN INSTRUCTION | 18 | 89 | 18 |
| AN END | 25 | 85 | 25 |
| PARABLE | 20 | 95 | 20 |
| **Total** | **739** | **2,977** | **738** |

All-segmentation chart matching also gives 738/739. The single residual is WELCOME word index95, normal Latin WISDOM vs original WIDSOM. Both are six runes, hence this difference does not create a compression or expansion rule. The normalized source includes BELEIVE and does not silently regularize that original spelling.

There are 270 distinct aligned Latin forms, including 110 repeated forms (579 total occurrences), and 71 forms appearing in more than one section. The only repeated form with multiple GP spellings is WISDOM (three occurrences, one WIDSOM). **0/739** words are shorter than greedy native encoding; **0/739** are longer. The 3,184 normalized Latin letters become 2,977 GP runes, a reduction of 207 already explained by the ordinary chart-token and ING/IO rules. There is no remaining observed reduction to attribute to an additional abbreviation rule.

This specifically tests the requested additional grammar, rather than re-running the earlier single-writing of geminates (#2737), unmarked vowel omission (#2747), marked whole-word abbreviations (#2662) or general compression (#2884) searches. The known chart contractions are already admitted by the native-register cryptanalytic attacks; the aligned source words do not supply another grammar to feed a new lexical lattice.

## Limitations and next decision

The Latin reference is an editor-normalized transcription of solved manuscript text, not an independently authored parallel plaintext of every section. Thus the alignment rules out an observable recurrent abbreviation relative to the established readings; it cannot rule out a hidden semantic expansion never reflected in the accepted Latin readings, rare unsampled rules, or a register introduced only in unknown LP2. No first-party instruction is identified selecting such an expansion. Do not invent extra abbreviations to improve fit to unknown ciphertext.

No LP2 unknown ciphertext scored or key fitted. No authentic new expansion or plaintext recovered. Close the requested source-attestation gate; only a new independently attested spelling/expansion rule should authorize a cipher-aware receiver.

## Reproduce

`node sims/lp_solved_abbreviation_grammar_gate_sft.cjs` — pure CommonJS with exact source-file reads. [SFT](../sims/lp_solved_abbreviation_grammar_gate_sft.cjs). Core executed in connected JavaScript against repository inputs, standalone wrapper not independently run. Inputs: `resources/transcriptions/liber_primus_master.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, `resources/liber-primus/lp1-plaintext-reference.txt`, `resources/liber-primus/lp2-corpus.json`.
