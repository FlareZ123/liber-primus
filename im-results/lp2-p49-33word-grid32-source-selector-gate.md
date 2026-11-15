# P49's 33 complete preceding words as selectors of the 32×8 numeric table

**Agent4, 15 November 2026. Result:** one additional original-layout-constrained reversible GP29 inverse yields **no unknown plaintext, independently supplied creator key, decoder instruction or destination**. [Full source-native, read-only one-file SFT](../sims/lp2_p49_33word_grid32_selected_original_sft.cjs). This is a distinct pre-table sentence selection, separate from the already completed **32 *page-crossing* words** to 32 rows and **32 *red-stencil intervals* to 32 rows**. Those prior row selectors were not reused.

## A human-observable candidate and its unsupported step

The 256-cell numeric object is printed in **32 rows × 8 columns**, spanning physical p49–51. The original punctuation-delimited sentence *immediately preceding the red ten-dot and first cell* contains **33 complete GP29 words**. It is the last72 runes of physical p48 and all66 p49 runes. Its 33 word lengths in original reading order are

`5 3 6 3 3 2 8 4 5 7 5 3 3 4 3 9 2 3 2 4 6 2 4 3 4 6 3 3 4 6 5 2 6`.

The signed 2016 instruction [words as map, numbers as direction](../resources/cicada2016-4gq25.md) and the original signed 2013 [BASE29](../resources/external/2013-tcp-server-signed-source.md) conversion invite a compact experiment: **use the length of each of 32 preceding whole words modulo8 as the zero-based column of one successive grid row**. Exactly one of the 33 words is omitted, so freeze two minimally distinct choices, first32 words and last32 words. Convert each selected original printed token under the repository's conventional radix60 into one byte. The first and last selector choices generate these **32-byte literal source-derived candidate keys** in row order:

- First32: `edde3b19271cfd6a49521c31220ef7ed560d5c34fafe9051b07f3d3b908138ac`.
- Last32: `bab72119c55056c46c90c13153da8f5678e9f6f9c094af2669443d3a75202abd`.

The manuscript does **not** tell a player to choose 32/33 words, reduce lengths modulo8, select table columns from original *ciphertext* lengths, or treat the selected bytes as a GP29 pad. Thus the source chooses the target words, size and geometry, but **the key-producing rule is a researcher hypothesis**. The observation 33 =32+1 is not enough to claim design.

## Exact decryptive test

Freeze the 138-rune / 33-word preceding sentence as the first receiver. Continue over the 256 numerical cells without consuming a rune-key position, then decode the **170-rune / 40-word independent sentence** on p51–52, preserving its carried word. No plaintext or key offset is tuned. The two possible byte-to-rune register conversions are:

1. One key symbol per selected byte `k=b mod29` (32-rune period).
2. Historical positional BASE29 convention `k=[floor(b/29), b mod29]`, giving 64 key symbols from the 32 bytes, information-preserving for 0..255.

With either conversion, decode each rune `P_i=(C_i−s·k_(i mod period)) mod29` for the two original source-calibrated additive signs `s∈{+1,−1}`. This gives **2×2×2 = 8** finite, fixed original-input inverses, with original word boundaries and nonconsuming typed table unchanged. There are no fitted phases, word substitutions, column rerankings, IVs or guessed English text. Score **exact whole-word entries** against the fixed 29,058-word GP29 lexicon used by the original solved-p56 positive decoder.

| 32-word selection | GP byte transport | Encryption sign | Pre-table matched words (of33) | Independent post-table matched words (of40) | Whole 308-rune IoC |
| --- | --- | ---: | ---: | ---: | ---: |
| First32 | one symbol mod29 | + | 1 | 6 | 0.03441347 |
| First32 | one symbol mod29 | − | 0 | 3 | 0.03344050 |
| First32 | BASE29 digit pair | + | 0 | 4 | 0.03625365 |
| First32 | BASE29 digit pair | − | 2 | 6 | 0.03665553 |
| Last32 | one symbol mod29 | + | 2 | 4 | 0.03466729 |
| Last32 | one symbol mod29 | − | 1 | 3 | 0.03460383 |
| Last32 | BASE29 digit pair | + | 2 | 5 | 0.03553450 |
| Last32 | BASE29 digit pair | − | 0 | 5 | 0.03371547 |

The best six following words are a handful of unrelated short spellings rather than a meaningful contiguous instruction; there is **no** recognizable 138-rune pre-table phrase or blind 170-rune continuation. The strongest original GP IoC of **0.03665553** remains close to a 29-symbol-uniform cipher baseline and far below original known clear p57's about **0.06271**. Exact pretable word matches never exceed **2 of33**, incompatible with a direct ordinary-English GP29 passage under the tested source keys.

**All eight exact original sources forward re-encrypt 308/308 runes.** More materially, the decoder recovers **308/308** planted GP symbols copied cyclically from the independently known-clear solved p57, under every generated key and sign; this proves that the fixed inverses recover actual GP29 text when the source-specified direct additive construction is true. Round-trip success alone has no authority as a plaintext discovery. The SFT also asserts original 33/138 and40/170 split, literal joined page-carried words, exact 32×8 grid and complete eight-way numerical outputs.

## Decision for #1099

The source-local 33→32 word-row layout is an inexpensive, originally motivated way to extract two candidate 256-bit strings. **Neither can directly decode the adjacent 138/170-runic sentences as a repeating GP29 pad**, even when all eight frozen natural variants are tested. Do not elevate either 32-byte string to an authenticated creator key, or retune phases/word subsets without fresh in-band plaintext or first-party instructions.

This remains distinct from the larger [authentic p56 prime-totient/F-skip transfer across the same complete sentences](lp2-p49-p56-ftransparent-anyphase-lexical-gate.md). Both attempted approaches have now been bounded on original exact inputs. Their common unresolved dependency is an **author-selected decoding operation, word-clock and key** for the floral chapter, potentially in earlier still-encrypted pages; neither geometry itself is a decryption.
