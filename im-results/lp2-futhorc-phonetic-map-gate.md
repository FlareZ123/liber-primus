# GP29 Futhorc phonetic-map audit: no distinct source-fixed alternative

**Decision: close the alternate-phonetic-map route as unsupported.** A scholarly 29-sign Futhorc table exists, but it does not provide a distinct, complete, uniquely fixed phonetic alphabet beyond the repository's GP29 transliteration. Its equivalent-letter column is a transcription convention; its probable-value column confirms the same /j/ and /x/ sounds already represented by GP `J` and `X`, while the relevant diphthong values remain explicitly uncertain.

## Source-fixed candidate

Millward and Hayes, *A Biography of the English Language*, 3rd ed. (Cengage, 2010), Table 5.3 (p.94), explicitly presents the 29-sign English Futhorc used in the Old English Rune Poem and separates an “Equivalent” transliteration from a “Probable Value” column. The textbook also notes that English Futhorc versions historically ranged from 28 to 33 signs; this is one documented 29-sign form, not a universal sound key.

The table's relevant distinctions are:

| Futhorc position | GP29 label | Table equivalent | Table's probable value | Assessment |
|---:|---|---|---|---|
| 12, Ger | `J` | `y` | `[j]` | Same phoneme: GP `J` is the IPA symbol /j/ |
| 13, Eoh | `EO` | `eo` | `[eə]?` | Same graphemic digraph; phonetic value uncertain |
| 15, Eolh | `X` | `h` | `[x]` | Same phoneme: GP `X` is the IPA symbol /x/ |
| 23, Ethel | `OE` | `œ` | `[œ]` | ASCII rendering versus ligature |
| 26, Aesc | `AE` | `æ` | `[æ]` | ASCII rendering versus ligature |
| 28, Ior | `IA` | `io` | `[io]?[ia]?` | Source explicitly leaves the diphthong unresolved |

After normalizing diacritics, the other entries agree in their equivalent values. The table therefore supplies a complete 29-sign *equivalent-letter transcription*, but not a complete fixed phonetic map: Eoh and especially Ior are uncertain, and the table does not choose between /io/ and /ia/. The equivalent-letter column also collapses distinct phonemes to the same display labels (`H` at positions 9/15 and `Y` at 12/27); the probable-value column is needed to distinguish them.

R. I. Page's specialist study argues that English-rune transliteration requires a considered, language-specific editorial convention and proposes modifications to the then-standard system. That supports treating the table's equivalent column as a transliteration convention, not a uniquely prescribed sound alphabet: [“On the Transliteration of English Runes,” *Medieval Archaeology* 28 (1984), 22–45](https://doi.org/10.1080/00766097.1984.11735455). The question marks in Table 5.3 independently show that the probable sound values do not fix a unique alternative.

Sources:
- [Millward & Hayes, *A Biography of the English Language*, 3e, Table 5.3 (textbook scan transcript)](https://studyres.com/doc/16601504/6.-a-biography-of-the-english-language--3rd-edition)
- [Millward & Hayes textbook PDF hosted by Purdue Fort Wayne](https://users.pfw.edu/dfleming/_HEL2022/Millward3rd_1.pdf)
- [Page, “On the Transliteration of English Runes” (DOI)](https://doi.org/10.1080/00766097.1984.11735455)

## Frozen test on original LP2

Applied the Table 5.3 equivalent-letter column to the original 12,956 unknown rune indices (pages 0–55). This preserves the original rune order, all multigraph boundaries and every numeric index; it changes only the printed labels:

| Rune position | GP29 label → table equivalent | Occurrences in unknown LP2 |
|---:|---|---:|
| 12 | `J → Y` | 450 |
| 15 | `X → H` | 458 |
| 28 | `IA → IO` | 470 |
| **Total** | **display-label changes only** | **1,378 / 12,956 (10.64%)** |

The known p57 plaintext control contains **zero** occurrences of these three rune positions; its 95-rune rendered string is therefore identical under both conventions. It cannot select between the candidate labels. The underlying 29-index ciphertext stream is unchanged at every position, so this operation is not a decryption, key, or second cipher layer.

The two exact phonetic correspondences `J ↔ [j]` and `X ↔ [x]` are not alternate sounds; they are different Latin/IPA display choices. `OE/œ` and `AE/æ` are typographic choices. The only potentially substantive diphthong alternative is Ior `IO/IA`, but the cited source explicitly marks both as possibilities rather than selecting one. Selecting `IO` alone would therefore be an unsupported choice. Eoh is also marked uncertain.

## Completion

The source-fixed 29-sign Futhorc equivalent map was applied to original LP2 and checked against p57. It only relabels three symbols and does not alter the ciphertext indices. No distinct, complete, source-selected phonetic map or decipherment operation is established. Do not search arbitrary phonetic permutations, swap multigraph boundaries, or treat rune-name semantics as phonetic evidence; reopen only if an independent LP2 clue selects one of the unresolved sound values or a concrete phonetic operation.

Reproducer: `node sims/lp2_futhorc_phonetic_map_gate.cjs`.
